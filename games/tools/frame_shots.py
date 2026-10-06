"""스토어 스크린샷 액자: 위쪽에 문구 띠(한 줄·큰 글씨) + 화면을 크게. python games/tools/frame_shots.py
입력 games/store/shots/raw/{phone,tab}_N_*.png (store_shots.js)  →  출력 games/store/shots/{phone,tab}_N.png
문구는 CAPTIONS 에서 고친다(허브 확인용 초안).
"""
import pathlib
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parents[1] / 'store' / 'shots'
RAW = ROOT / 'raw'
FONT = 'C:/Windows/Fonts/malgunbd.ttf'
CAPTIONS = {
    '1_home': ('광고 없는 안심 놀이터', '#FFE0B5'),
    '2_story': ('옛이야기가 이어져요', '#D6EEFF'),
    '3_shadow': ('그림자를 찾아 쏙!', '#E3F6DC'),
    '4_celebrate': ('맞추면 꽃가루 팡팡', '#FFE3EC'),
    '5_faces': ('같은 얼굴을 찾아요', '#EADFFB'),
    '6_paint': ('마음대로 색칠해요', '#FFF3C2'),
}
INK = '#3A2E39'

def rounded_top(im, r):
    m = Image.new('L', im.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, im.width - 1, im.height + r), r, fill=255)
    out = Image.new('RGBA', im.size, (0, 0, 0, 0)); out.paste(im.convert('RGBA'), (0, 0), m); return out

def frame(kind, key):
    raw = Image.open(next(RAW.glob(f'{kind}_{key}.png'))).convert('RGB')
    text, bg = CAPTIONS[key]
    if kind == 'phone':
        W, H, band, shot_w, size, rad = 1080, 1920, 300, 940, 96, 70
    else:
        W, H, band, shot_w, size, rad = 1920, 1200, 215, 1660, 88, 54
    canvas = Image.new('RGB', (W, H), bg)
    d = ImageDraw.Draw(canvas); f = ImageFont.truetype(FONT, size)
    tw = d.textlength(text, font=f)
    d.text(((W - tw) / 2, (band - size) / 2 - 8), text, font=f, fill=INK)
    sh = raw.resize((shot_w, round(raw.height * shot_w / raw.width)), Image.LANCZOS)
    sh = rounded_top(sh, rad)
    x, y = (W - shot_w) // 2, band
    shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(shadow).rounded_rectangle((x - 4, y + 10, x + shot_w + 4, y + sh.height + 40), rad, fill=(58, 46, 57, 70))
    canvas = Image.alpha_composite(canvas.convert('RGBA'), shadow.filter(ImageFilter.GaussianBlur(18)))
    canvas.alpha_composite(sh, (x, y))
    canvas.convert('RGB').save(ROOT / f'{kind}_{key.split("_")[0]}.png', optimize=True)

for kind in ('phone', 'tab'):
    for key in CAPTIONS:
        frame(kind, key)
print('framed 12')
