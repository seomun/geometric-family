"""스토어·앱 아이콘 만들기: python games/tools/make_store.py
→ games/store/icon_512.png (스토어용, 정사각) + android mipmap-*/ic_launcher.png (둥근 모서리)
캐릭터 PNG(assets/)는 읽기만 한다.
"""
import pathlib
from PIL import Image, ImageDraw

ROOT = pathlib.Path(__file__).resolve().parents[2]
STORE = ROOT / 'games' / 'store'
RES = ROOT / 'games' / 'android' / 'app' / 'src' / 'main' / 'res'
STORE.mkdir(exist_ok=True)

def grad(size, top, bottom):
    im = Image.new('RGB', (size, size)); px = im.load()
    for y in range(size):
        t = y / (size - 1); c = tuple(round(top[i] + (bottom[i] - top[i]) * t) for i in range(3))
        for x in range(size): px[x, y] = c
    return im

def char(p, h):
    im = Image.open(ROOT / 'assets' / p).convert('RGBA'); w = round(im.width * h / im.height)
    return im.resize((w, h), Image.LANCZOS)

S = 1024
icon = grad(S, (255, 233, 199), (255, 246, 229)).convert('RGBA')
d = ImageDraw.Draw(icon)
d.ellipse((S * 0.62, S * 0.07, S * 0.62 + S * 0.22, S * 0.07 + S * 0.22), fill=(255, 211, 107))          # 해
d.ellipse((-S * 0.25, S * 0.74, S * 0.75, S * 1.5), fill=(191, 230, 168))                                  # 언덕
d.ellipse((S * 0.3, S * 0.8, S * 1.3, S * 1.6), fill=(155, 217, 138))
for (p, h, cx, base) in [('wife/good.png', 560, 0.27, 0.90), ('dong_dad/good.png', 520, 0.74, 0.90), ('baby/good.png', 360, 0.50, 0.93)]:
    c = char(p, h); icon.alpha_composite(c, (round(S * cx - c.width / 2), round(S * base - c.height)))
icon512 = icon.resize((512, 512), Image.LANCZOS).convert('RGB')
icon512.save(STORE / 'icon_512.png')

def face_icon(png, bg, top_frac=0.66, fill=0.80):
    """얼굴 클로즈업 아이콘: 캐릭터 위쪽(리본·얼굴)만 잘라 단색 배경 가운데에 크게."""
    im = Image.open(ROOT / 'assets' / png).convert('RGBA'); bb = im.getchannel('A').point(lambda a: 255 if a > 20 else 0).getbbox()
    im = im.crop((bb[0], bb[1], bb[2], bb[1] + round((bb[3] - bb[1]) * top_frac)))
    sc = (S * fill) / max(im.width, im.height); im = im.resize((round(im.width * sc), round(im.height * sc)), Image.LANCZOS)
    cv = Image.new('RGBA', (S, S), bg); cv.alpha_composite(im, ((S - im.width) // 2, (S - im.height) // 2 + round(S * 0.02))); return cv

icons = {'semo': face_icon('wife/good.png', '#BFE8FF', top_frac=0.83, fill=0.84), 'baby': face_icon('baby/good.png', '#FFD9A8', top_frac=0.74, fill=0.84)}
for k, im in icons.items():
    im.resize((512, 512), Image.LANCZOS).convert('RGB').save(STORE / f'icon_512_{k}.png')
# 48 / 96 / 192 에서 어떻게 보이는지 비교판 (전신 안 · 세모 이모 · 막둥이)
sheet = Image.new('RGB', (3 * 220 + 40, 400), '#ffffff'); x0 = 20
for lab, im in [('full', icon), ('semo', icons['semo']), ('baby', icons['baby'])]:
    y = 20
    for px in (192, 96, 48):
        t = im.resize((px, px), Image.LANCZOS).convert('RGB'); sheet.paste(t, (x0, y)); y += px + 8
    x0 += 220
sheet.save(STORE / 'icon_compare.png')

def rounded(im, r):
    m = Image.new('L', im.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, im.width - 1, im.height - 1), r, fill=255)
    out = Image.new('RGBA', im.size, (0, 0, 0, 0)); out.paste(im.convert('RGBA'), (0, 0), m); return out

DEFAULT = icons['semo']          # 기본 런처 아이콘 = 세모 이모 얼굴 (허브가 시안 고르면 바꾼다)
for name, px in [('mdpi', 48), ('hdpi', 72), ('xhdpi', 96), ('xxhdpi', 144), ('xxxhdpi', 192)]:
    d_ = RES / f'mipmap-{name}'; d_.mkdir(parents=True, exist_ok=True)
    rounded(DEFAULT.resize((px, px), Image.LANCZOS), round(px * 0.22)).save(d_ / 'ic_launcher.png')
print('icon + mipmaps ok')
