"""ChatGPT 캐릭터 시트 → 개별 투명 PNG. python tools/cut_sheet.py assets/wife/sheet.png --cols 3 --rows 2 --names good,wink,surprise,joy,love,worry
- 격자 분할 → rembg(isnet-anime)로 배경 제거 → 여백 트림 → 600×600 캔버스, 발끝을 하단 5% 에 정렬(같은 지면선)
- 결과: assets/<dir>/<name>.png + assets/<dir>/manifest.json (폭·높이·지면선). 코드에서는 GF.sprite('wife/wink', ...) 로 쓴다.
원본 시트는 assets/<dir>/_sheet/ 로 옮겨 보관(정본 = 이 시트. 새 표정은 이 시트를 첨부해서 같은 스타일로 생성)."""
import os, sys, json, argparse, shutil
from PIL import Image
sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def main():
    ap = argparse.ArgumentParser(); ap.add_argument("sheet"); ap.add_argument("--cols", type=int, default=3); ap.add_argument("--rows", type=int, default=2)
    ap.add_argument("--names", default=""); ap.add_argument("--size", type=int, default=600); ap.add_argument("--fill", type=float, default=0.9); a = ap.parse_args()
    from rembg import remove, new_session
    sess = new_session("isnet-anime")
    path = os.path.join(ROOT, a.sheet) if not os.path.isabs(a.sheet) else a.sheet
    im = Image.open(path).convert("RGBA"); W, H = im.size; cw, ch = W / a.cols, H / a.rows
    outdir = os.path.dirname(path); names = a.names.split(",") if a.names else [f"c{i + 1}" for i in range(a.cols * a.rows)]
    manifest = {}
    for r in range(a.rows):
        for c in range(a.cols):
            i = r * a.cols + c
            if i >= len(names): break
            cell = im.crop((int(c * cw), int(r * ch), int((c + 1) * cw), int((r + 1) * ch)))
            cut = remove(cell, session=sess); bb = cut.getbbox()
            if not bb: print("empty cell", i); continue
            cut = cut.crop(bb)
            S = a.size; h = int(S * a.fill); w = int(cut.width * h / cut.height)
            if w > int(S * 0.95): w = int(S * 0.95); h = int(cut.height * w / cut.width)
            cut = cut.resize((w, h), Image.LANCZOS)
            canvas = Image.new("RGBA", (S, S), (0, 0, 0, 0)); ox, oy = (S - w) // 2, S - int(S * 0.05) - h; canvas.paste(cut, (ox, oy))
            fn = os.path.join(outdir, names[i] + ".png"); canvas.save(fn)
            manifest[names[i]] = {"file": names[i] + ".png", "w": w, "h": h, "ground": S - int(S * 0.05)}
            print("saved", fn, w, h)
    json.dump(manifest, open(os.path.join(outdir, "manifest.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    keep = os.path.join(outdir, "_sheet"); os.makedirs(keep, exist_ok=True)
    dst = os.path.join(keep, os.path.basename(path))
    if os.path.abspath(path) != os.path.abspath(dst): shutil.move(path, dst); print("sheet moved →", dst)

if __name__ == "__main__": main()
