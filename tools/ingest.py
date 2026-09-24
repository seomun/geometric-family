"""시트 자동 반입 — assets/_inbox/<캐릭터>.png 를 넣고 `python tools/ingest.py` 만 치면 끝.
격자·표정 이름·폴더는 아래 REGISTRY 가 캐릭터 이름으로 결정한다. 파일명에 _v2 가 붙으면 그 버전으로 저장.
  assets/_inbox/husband.png      → assets/husband/{good,joy,wink,love,surprise,worry}.png + _sheet/sheet_v1.png
  assets/_inbox/wife_v2.png      → assets/wife/{angry,bad,smug,tired,cry,calm}.png   + _sheet/sheet_v2.png
옵션: --dry (자르지 않고 계획만), --keep (원본을 _inbox 에 남김)
"""
import os, sys, re, json, glob, shutil, argparse, subprocess
sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
INBOX = os.path.join(ROOT, "assets", "_inbox")

E6 = "good,joy,wink,love,surprise,worry"          # 표준 표정 6칸 (docs/06 SHEET 블록 순서)
E6B = "good,joy,calm,warm,surprise,trouble"        # 동그라미 가족 (눈매 고정, 미세한 차이)
REGISTRY = {
    # 캐릭터이름:       (폴더,            열, 행, 이름들,                          버전별 이름 덮어쓰기)
    "wife":        ("wife",         3, 2, E6,  {"v2": "angry,bad,smug,tired,cry,calm"}),
    "husband":     ("husband",      3, 2, E6,  {"v2": "angry,bad,smug,tired,cry,calm"}),
    "nemo_dad":    ("nemo_dad",     3, 2, E6,  {}),
    "nemo_mom":    ("nemo_mom",     3, 2, E6,  {}),
    "nemo_grandma":("nemo_grandma", 3, 2, E6,  {}),
    "nemo_kids":   ("nemo_kids",    2, 2, "kid1,kid2,kid3,baby", {}),
    "baby":        ("baby",         3, 2, "good,joy,surprise,love,cry,tired", {}),
    "dong_dad":    ("dong_dad",     3, 2, E6B, {}),
    "dong_mom":    ("dong_mom",     3, 2, E6B, {}),
    "dong_kids":   ("dong_kids",    2, 2, "son,son_calm,daughter,daughter_calm", {}),
    "lineup":      ("_lineup",      1, 1, "lineup", {}),
}
ALIAS = {  # 편하게 쓰라고: 한글·줄임말도 받는다
    "세모아내": "wife", "아내": "wife", "세모와이프": "wife", "wife2": "wife",
    "세모남편": "husband", "남편": "husband",
    "네모아빠": "nemo_dad", "네모엄마": "nemo_mom", "할머니": "nemo_grandma", "네모아이": "nemo_kids", "네모아이들": "nemo_kids", "막둥이": "baby", "막내": "baby",
    "동그라미아빠": "dong_dad", "동그라미엄마": "dong_mom", "동그라미아이": "dong_kids", "동그라미아이들": "dong_kids",
    "라인업": "lineup",
}

def resolve(stem):
    m = re.match(r"^(.*?)(?:[_-]?(v\d+))?$", stem.strip())
    base, ver = m.group(1).strip().lower().replace(" ", ""), (m.group(2) or "v1")
    key = ALIAS.get(base, base)
    return key, ver

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("--dry", action="store_true"); ap.add_argument("--keep", action="store_true"); a = ap.parse_args()
    os.makedirs(INBOX, exist_ok=True)
    files = [f for f in sorted(glob.glob(os.path.join(INBOX, "*"))) if f.lower().endswith((".png", ".jpg", ".jpeg", ".webp"))]
    if not files:
        print(f"_inbox 가 비어 있습니다: {INBOX}")
        print("파일명 규칙:", ", ".join(sorted(REGISTRY))); return
    for f in files:
        stem = os.path.splitext(os.path.basename(f))[0]
        key, ver = resolve(stem)
        if key not in REGISTRY:
            print(f"[건너뜀] {os.path.basename(f)} — 이름 '{key}' 을 모릅니다. 쓸 수 있는 이름: {', '.join(sorted(REGISTRY))}"); continue
        folder, cols, rows, names, overrides = REGISTRY[key]
        names = overrides.get(ver, names)
        dest_dir = os.path.join(ROOT, "assets", folder); os.makedirs(os.path.join(dest_dir, "_sheet"), exist_ok=True)
        sheet = os.path.join(dest_dir, "_sheet", f"sheet_{ver}.png")
        print(f"[반입] {os.path.basename(f)} → assets/{folder}/  ({cols}×{rows}: {names})")
        if a.dry: continue
        (shutil.copy if a.keep else shutil.move)(f, sheet)
        r = subprocess.run([sys.executable, os.path.join(ROOT, "tools", "cut_sheet.py"), sheet, "--cols", str(cols), "--rows", str(rows), "--names", names, "--out", dest_dir],
                           capture_output=True, text=True, encoding="utf-8", errors="replace")
        for line in (r.stdout or "").splitlines():
            if line.startswith("saved") or line.startswith("empty"): print("   ", line)
        if r.returncode: print("    [실패]", (r.stderr or "")[-400:])
    print("\n다음: node tools/snapshot.js  →  확인  →  bash tools/deploy.sh")

if __name__ == "__main__": main()
