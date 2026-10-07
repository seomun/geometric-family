# AI 음악(Suno 등) 후처리 — python tools/music_prep.py [--sting]
# assets/_inbox/music/<슬롯>.mp3|wav → 다듬어서 게임·쇼츠 슬롯에 넣는다.
#  - 앞뒤 무음 자르기, 음량 −16 LUFS 맞춤(효과음과 균형), 피크 −1 dB
#  - 루프 슬롯(theme_kids·night·idle_main·theme_main): 끝 2초를 처음과 교차 페이드해 이음매 없는 루프
#  - 원샷 슬롯(ending_sting): 끝 1.5초 페이드아웃
#  - --sting: theme_main 앞부분에서 소리 로고 2초를 잘라 logo_sting 으로
# 출력: games/audio/<슬롯>.wav (게임 슬롯 파일) + content/audio/<슬롯>.mp3 (쇼츠 --bgm 용)
# 필요: pip install imageio-ffmpeg
import argparse, re, subprocess, sys
from pathlib import Path
import imageio_ffmpeg

ROOT = Path(__file__).resolve().parent.parent
FF = imageio_ffmpeg.get_ffmpeg_exe()
INBOX = ROOT / "assets" / "_inbox" / "music"
LOOP = {"theme_main", "theme_kids", "night", "idle_main", "theme_short"}
ONESHOT = {"ending_sting"}
TRIM = "silenceremove=start_periods=1:start_threshold=-50dB,areverse,silenceremove=start_periods=1:start_threshold=-50dB,areverse"
NORM = "loudnorm=I=-16:TP=-1:LRA=11"


def dur(p):
    err = subprocess.run([FF, "-i", str(p)], capture_output=True, text=True, encoding="utf-8", errors="ignore").stderr
    h, m, s = re.search(r"Duration: (\d+):(\d+):([\d.]+)", err).groups()
    return int(h) * 3600 + int(m) * 60 + float(s)


def run(args):
    subprocess.run([FF, "-y", "-loglevel", "error", *args], check=True)


def prep(src, slot):
    tmp = INBOX / f"_{slot}_trim.wav"
    run(["-i", str(src), "-af", f"{TRIM},{NORM}", "-ar", "48000", "-ac", "2", str(tmp)])
    d, out = dur(tmp), ROOT / "games" / "audio" / f"{slot}.wav"
    if slot in LOOP and d > 8:
        xf = 2.0   # 끝 2초를 처음 위에 겹쳐 이음매를 없앤다
        run(["-i", str(tmp), "-filter_complex",
             f"[0:a]atrim=0:{d - xf:.3f},asetpts=PTS-STARTPTS[body];"
             f"[0:a]atrim={d - xf:.3f}:{d:.3f},asetpts=PTS-STARTPTS,afade=t=out:d={xf}[tail];"
             f"[body]afade=t=in:d={xf}[bodyin];[bodyin][tail]amix=inputs=2:duration=first:normalize=0[o]",
             "-map", "[o]", str(out)])
    elif slot in ONESHOT:
        run(["-i", str(tmp), "-af", f"afade=t=out:st={max(0, d - 1.5):.3f}:d=1.5", str(out)])
    else:
        run(["-i", str(tmp), "-c", "copy", str(out)])
    (ROOT / "content" / "audio").mkdir(parents=True, exist_ok=True)
    run(["-i", str(out), "-b:a", "192k", str(ROOT / "content" / "audio" / f"{slot}.mp3")])
    tmp.unlink()
    print(f"{slot}: {d:.1f}s → games/audio/{slot}.wav · content/audio/{slot}.mp3")


def sting(start=0.0, length=2.0):
    src = ROOT / "games" / "audio" / "theme_main.wav"
    if not src.exists():
        sys.exit("theme_main 이 먼저 필요하다")
    out = ROOT / "games" / "audio" / "logo_sting.wav"
    run(["-ss", f"{start}", "-t", f"{length + 0.5}", "-i", str(src), "-af", f"afade=t=out:st={length - 0.4}:d=0.9", str(out)])
    run(["-i", str(out), "-b:a", "192k", str(ROOT / "content" / "audio" / "logo_sting.mp3")])
    print(f"logo_sting: theme_main {start}s부터 {length}s")


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--sting", type=float, nargs="?", const=0.0, help="theme_main 의 몇 초부터 소리 로고를 자를지")
    a = ap.parse_args()
    files = sorted(INBOX.glob("*.mp3")) + sorted(INBOX.glob("*.wav")) if INBOX.exists() else []
    files = [f for f in files if not f.name.startswith("_")]
    for f in files:
        prep(f, f.stem)
    if a.sting is not None:
        sting(a.sting)
    if not files and a.sting is None:
        print(f"{INBOX} 에 <슬롯>.mp3 를 넣어라 (슬롯: {', '.join(sorted(LOOP | ONESHOT))})")
