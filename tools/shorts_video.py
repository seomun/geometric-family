# 쇼츠 mp4 조립 — python tools/shorts_video.py s02
# content/shorts/<name>.md 의 「편집 표」(구간·파일·효과)를 그대로 읽어
# content/shorts/<name>/f*.png → content/shorts/<name>.mp4 (1080×1920, 30fps, 무음)
# 음악·효과음은 넣지 않는다 — CapCut/유튜브에서 얹는다.
# 필요: pip install imageio-ffmpeg (ffmpeg 실행 파일 포함)
import re, subprocess, sys
from pathlib import Path
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parent.parent
W, H, FPS = 1080, 1920, 30


def read_table(md):
    """편집 표의 행 → [(시작, 끝, 파일, 효과)]"""
    rows = []
    for line in md.splitlines():
        m = re.match(r"\|\s*\d+\s*\|\s*([\d.]+)\s*[–-]\s*([\d.]+)\s*\|\s*`([^`]+)`\s*\|[^|]*\|(.*)\|", line)
        if m:
            rows.append((float(m[1]), float(m[2]), m[3], m[4]))
    return rows


def effect_filter(fx):
    """표의 효과 문구 → ffmpeg 필터. 표에 없는 효과는 넣지 않는다(정지)."""
    base = f"scale={W}:{H},setsar=1"
    if "흔들" in fx:  # 진동: 좌우 2px, 0.3초 주기
        return f"scale={W + 4}:{H + 4},crop={W}:{H}:x='2+2*sin(2*PI*t/0.3)':y=2,setsar=1"
    if "확대" in fx:  # 1.0 → 1.03, 0.5초에 걸쳐
        z = "(1+0.03*min(t/0.5\\,1))"
        return (f"scale=w='trunc({W}*{z}/2)*2':h='trunc({H}*{z}/2)*2':eval=frame,"
                f"crop={W}:{H},setsar=1")
    return base


def main(name):
    md = (ROOT / "content" / "shorts" / f"{name}.md").read_text(encoding="utf-8")
    rows = read_table(md)
    if not rows:
        sys.exit(f"{name}.md 에서 편집 표를 찾지 못했다")
    frames = ROOT / "content" / "shorts" / name
    out = ROOT / "content" / "shorts" / f"{name}.mp4"

    args, chains = [], []
    for i, (t0, t1, f, fx) in enumerate(rows):
        args += ["-loop", "1", "-framerate", str(FPS), "-t", f"{t1 - t0:.3f}", "-i", str(frames / f)]
        # 구간 길이를 프레임 단위로 정확히 맞춘다 (-t 만 쓰면 컷마다 1프레임씩 짧아진다)
        chains.append(f"[{i}:v]{effect_filter(fx)},fps={FPS},tpad=stop_mode=clone:stop_duration=1,"
                      f"trim=duration={t1 - t0:.3f},setpts=PTS-STARTPTS,format=yuv420p[v{i}]")
        print(f"  {t0:5.1f}-{t1:5.1f}  {f}  {fx.strip()[:40]}")
    concat = "".join(f"[v{i}]" for i in range(len(rows))) + f"concat=n={len(rows)}:v=1:a=0[out]"

    cmd = [imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-loglevel", "error", *args,
           "-filter_complex", ";".join(chains + [concat]), "-map", "[out]",
           "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-pix_fmt", "yuv420p",
           "-movflags", "+faststart", str(out)]
    subprocess.run(cmd, check=True)
    print(f"saved {out.relative_to(ROOT)}  ({rows[-1][1]:.1f}초)")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else "s01")
