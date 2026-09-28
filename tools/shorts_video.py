# 쇼츠 mp4 조립 — python tools/shorts_video.py s02 [--voice InJoon] [--bgm 곡.mp3] [--out s02_test]
# content/shorts/<name>.md 의 「편집 표」(구간·파일·효과)와 「나레이션」(컷·대사)을 읽어
# content/shorts/<name>/f*.png + TTS 나레이션 (+ BGM) → content/shorts/<name>.mp4 (1080×1920, 30fps)
# 컷이 대사보다 짧으면 컷을 늘린다(대사가 잘리지 않게). 나레이션 표가 없으면 무음.
# 필요: pip install imageio-ffmpeg edge-tts
import argparse, asyncio, re, subprocess, sys
from pathlib import Path
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parent.parent
FF = imageio_ffmpeg.get_ffmpeg_exe()
W, H, FPS = 1080, 1920, 30
LEAD, TAIL, HOLD = 0.15, 0.25, 1.2   # 컷 시작 후 말 시작 / 말 끝 후 여유 / 마지막 컷 여운
VOICES = {"InJoon": "ko-KR-InJoonNeural", "Hyunsu": "ko-KR-HyunsuMultilingualNeural", "SunHi": "ko-KR-SunHiNeural"}


def read_table(md):
    """편집 표의 행 → [(시작, 끝, 파일, 효과)]"""
    rows = []
    for line in md.splitlines():
        m = re.match(r"\|\s*\d+\s*\|\s*([\d.]+)\s*[–-]\s*([\d.]+)\s*\|\s*`([^`]+)`\s*\|[^|]*\|(.*)\|", line)
        if m:
            rows.append((float(m[1]), float(m[2]), m[3], m[4]))
    return rows


def read_narration(md):
    """「## 나레이션」 표 → {컷 번호: 대사}"""
    sec = re.search(r"## 나레이션\n(.*?)(?=\n## |\Z)", md, re.S)
    if not sec:
        return {}
    return {int(m[1]): m[2].strip() for m in re.finditer(r"^\|\s*(\d+)\s*\|\s*([^|]+?)\s*\|\s*$", sec[1], re.M)}


def duration(path):
    err = subprocess.run([FF, "-i", str(path)], capture_output=True, text=True, encoding="utf-8", errors="ignore").stderr
    h, m, s = re.search(r"Duration: (\d+):(\d+):([\d.]+)", err).groups()
    return int(h) * 3600 + int(m) * 60 + float(s)


async def tts(lines, voice, rate, outdir):
    import edge_tts
    outdir.mkdir(parents=True, exist_ok=True)
    files = {}
    for cut, text in lines.items():
        f = outdir / f"n{cut}_{voice.split('-')[2]}.mp3"
        await edge_tts.Communicate(text, voice, rate=rate).save(str(f))
        # TTS 앞뒤 무음을 잘라낸다 (그대로 두면 문장마다 0.5초 이상 늘어진다)
        trim = "silenceremove=start_periods=1:start_threshold=-45dB"
        wav = f.with_suffix(".wav")
        subprocess.run([FF, "-y", "-loglevel", "error", "-i", str(f), "-af",
                        f"{trim},areverse,{trim},areverse", "-ar", "48000", str(wav)], check=True)
        files[cut] = wav
    return files


def effect_filter(fx):
    """표의 효과 문구 → ffmpeg 필터. 표에 없는 효과는 넣지 않는다(정지)."""
    if "흔들" in fx:  # 진동: 좌우 2px, 0.3초 주기
        return f"scale={W + 4}:{H + 4},crop={W}:{H}:x='2+2*sin(2*PI*t/0.3)':y=2,setsar=1"
    if "확대" in fx:  # 1.0 → 1.03, 0.5초에 걸쳐
        z = "(1+0.03*min(t/0.5\\,1))"
        return (f"scale=w='trunc({W}*{z}/2)*2':h='trunc({H}*{z}/2)*2':eval=frame,"
                f"crop={W}:{H},setsar=1")
    return f"scale={W}:{H},setsar=1"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("name", nargs="?", default="s01")
    ap.add_argument("--voice", default="InJoon", choices=VOICES)
    ap.add_argument("--rate", default="+12%", help="말 빠르기, 예: +10%%")
    ap.add_argument("--bgm", help="배경음악 파일 (볼륨 --bgm-vol)")
    ap.add_argument("--bgm-vol", type=float, default=0.15)
    ap.add_argument("--out", help="출력 파일 이름(확장자 제외)")
    a = ap.parse_args()

    md = (ROOT / "content" / "shorts" / f"{a.name}.md").read_text(encoding="utf-8")
    rows = read_table(md)
    if not rows:
        sys.exit(f"{a.name}.md 에서 편집 표를 찾지 못했다")
    frames = ROOT / "content" / "shorts" / a.name
    out = ROOT / "content" / "shorts" / f"{a.out or a.name}.mp4"

    lines = read_narration(md)
    voice = asyncio.run(tts(lines, VOICES[a.voice], a.rate, frames / "_voice")) if lines else {}

    # 컷 길이 = max(편집 표, 대사 길이 + 여유)
    durs, starts, t = [], [], 0.0
    for i, (t0, t1, f, fx) in enumerate(rows):
        d = t1 - t0
        if i + 1 in voice:
            d = max(d, LEAD + duration(voice[i + 1]) + (HOLD if i == len(rows) - 1 else TAIL))
        starts.append(t)
        durs.append(round(d * FPS) / FPS)
        t += durs[-1]
    total = t

    args, chains = [], []
    for i, (t0, t1, f, fx) in enumerate(rows):
        args += ["-loop", "1", "-framerate", str(FPS), "-t", f"{durs[i] + 1:.3f}", "-i", str(frames / f)]
        # 구간 길이를 프레임 단위로 정확히 맞춘다 (-t 만 쓰면 컷마다 1프레임씩 짧아진다)
        chains.append(f"[{i}:v]{effect_filter(fx)},fps={FPS},tpad=stop_mode=clone:stop_duration=1,"
                      f"trim=duration={durs[i]:.3f},setpts=PTS-STARTPTS,format=yuv420p[v{i}]")
        say = f"  «{lines[i + 1]}»" if i + 1 in lines else ""
        print(f"  {starts[i]:5.2f}-{starts[i] + durs[i]:5.2f}  {f}{say}")
    n = len(rows)
    chains.append("".join(f"[v{i}]" for i in range(n)) + f"concat=n={n}:v=1:a=0[vout]")

    # 소리: 컷 시작 + LEAD 에 대사를 놓고, BGM 은 전체 길이로 깔고 끝 1초 페이드
    amix = []
    for k, (cut, f) in enumerate(sorted(voice.items())):
        args += ["-i", str(f)]
        ms = int((starts[cut - 1] + LEAD) * 1000)
        chains.append(f"[{n + k}:a]adelay={ms}|{ms}[a{k}]")
        amix.append(f"[a{k}]")
    if a.bgm:
        args += ["-stream_loop", "-1", "-i", a.bgm]
        chains.append(f"[{n + len(voice)}:a]atrim=duration={total:.3f},volume={a.bgm_vol},"
                      f"afade=t=out:st={total - 1:.3f}:d=1[bgm]")
        amix.append("[bgm]")
    if amix:
        chains.append("".join(amix) + f"amix=inputs={len(amix)}:normalize=0,apad,atrim=duration={total:.3f},"
                      f"loudnorm=I=-14:TP=-1.5[aout]")

    cmd = [FF, "-y", "-loglevel", "error", *args, "-filter_complex", ";".join(chains), "-map", "[vout]"]
    if amix:
        cmd += ["-map", "[aout]", "-c:a", "aac", "-b:a", "192k", "-ar", "48000"]
    cmd += ["-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p",
            "-t", f"{total:.3f}", "-movflags", "+faststart", str(out)]
    subprocess.run(cmd, check=True)
    print(f"saved {out.relative_to(ROOT)}  ({total:.1f}초, 목소리 {a.voice if voice else '없음'})")


if __name__ == "__main__":
    main()
