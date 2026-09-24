"""web/*.html 의 <script src="../src/characters.js"> 를 인라인해 dist/ 에 배포본을 만든다.
python tools/build.py  → dist/index.html(=ep01), dist/characters.html, dist/ep01.html
주의: 주입은 split/join. str.replace 는 코드의 '$' 를 특수 패턴으로 해석하지 않지만(파이썬은 괜찮음) 습관적으로 split/join 을 쓴다."""
import os, glob, shutil, sys
sys.stdout.reconfigure(encoding="utf-8")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
js = open(os.path.join(ROOT, "src/characters.js"), encoding="utf-8").read()
TAG = '<script src="../src/characters.js"></script>'
dist = os.path.join(ROOT, "dist"); os.makedirs(dist, exist_ok=True)
for fp in sorted(glob.glob(os.path.join(ROOT, "web/*.html"))):
    html = open(fp, encoding="utf-8").read()
    assert TAG in html, fp
    out = "<script>\n".join(html.split(TAG)[:1]) + "<script>\n" + js + "\n</script>" + html.split(TAG)[1]
    name = os.path.basename(fp)
    open(os.path.join(dist, name), "w", encoding="utf-8", newline="\n").write(out); print("built", name, len(out))
print("index.html = web/index.html (목차)")
# 래스터 자산 복사 (시트 원본 _sheet 제외) + 배포본에서는 assets 경로가 같은 층
src_assets = os.path.join(ROOT, "assets")
if os.path.isdir(src_assets):
    dst_assets = os.path.join(dist, "assets")
    if os.path.isdir(dst_assets): shutil.rmtree(dst_assets)
    shutil.copytree(src_assets, dst_assets, ignore=shutil.ignore_patterns("_sheet", "*.psd"))
    for fn in os.listdir(dist):
        if fn.endswith(".html"):
            fp = os.path.join(dist, fn); h = open(fp, encoding="utf-8").read().replace("assets: '../assets/'", "assets: './assets/'"); open(fp, "w", encoding="utf-8", newline=chr(10)).write(h)
    print("assets copied")
