"""스토어 스크린샷 액자: 위쪽에 문구 띠(한 줄·큰 글씨) + 화면을 크게. python games/tools/frame_shots.py
입력 games/store/shots/raw/{phone,tab}_N_*.png (store_shots.js)  →  출력 games/store/shots/{phone,tab}_N.png
문구는 CAPTIONS 에서 고친다(허브 확인용 초안).
"""
import pathlib
from PIL import Image, ImageDraw, ImageFont, ImageFilter

import os
IDLE = os.environ.get('IDLE') == '1'          # IDLE=1 이면 방치형 스크린샷(store/shots_idle)
APP = os.environ.get('APP')                   # APP=merge|color|quiz 면 store/shots_<app> (폰 6장)
ROOT = pathlib.Path(__file__).resolve().parents[1] / 'store' / (('shots_' + APP) if APP else ('shots_idle' if IDLE else 'shots'))
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
if IDLE:
    CAPTIONS = {
        '1_home': ('기하학 가족: 세 가족 식탁', '#FFE0B5'),
        '2_nemo': ('밥그릇은 모자라고 웃음은 넘쳐요', '#FFE3C2'),
        '3_semo': ('공항에서 대판, 온천에서 화해', '#D6EEFF'),
        '4_story': ('50대의 평범한 하루 사연', '#E3F6DC'),
        '5_quest': ('당신은 어느 도형인가요?', '#EADFFB'),
        '6_props': ('소품을 모아 식탁을 꾸며요', '#FFF3C2'),
    }
APPCAP = {
    'merge': {'1_home': ('도형을 합쳐 집을 채워요', '#FFE0B5'), '2_levels': ('120판 + 오늘의 한 판', '#D6EEFF'), '3_play': ('같은 도형을 톡톡 합쳐요', '#E3F6DC'), '4_clear': ('클리어하면 집에 놓여요', '#FFE3EC'), '5_trio': ('세 가족 판도 있어요', '#EADFFB'), '6_house': ('모은 가구로 우리 집 꾸미기', '#FFF3C2')},
    'color': {'1_home': ('막둥이와 색칠해요', '#FFE0B5'), '2_book': ('68장 색칠 도안', '#D6EEFF'), '3_paint': ('칠하고 싶은 색으로 쓱쓱', '#E3F6DC'), '4_done': ('완성하면 벽에 걸려요', '#FFE3EC'), '5_sticker': ('스티커 붙이기도 해요', '#EADFFB'), '6_house': ('내 그림이 걸린 우리 집', '#FFF3C2')},
    'quiz': {'1_home': ('당신은 어느 도형인가요?', '#FFE0B5'), '2_tests': ('테스트 10종 · 60문항', '#D6EEFF'), '3_question': ('하루 속 작은 선택', '#E3F6DC'), '4_result': ('나는 네모? 세모? 동그라미?', '#FFE3EC'), '5_house': ('결과는 문패와 배지로 집에 걸려요', '#EADFFB'), '6_mini': ('가볍게 즐기는 미니게임 5종', '#FFF3C2')},
}
if APP: CAPTIONS = APPCAP[APP]
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
    while d.textlength(text, font=f) > W - 90 and size > 50:   # 긴 문구는 글자를 줄여 한 줄에 맞춘다
        size -= 4; f = ImageFont.truetype(FONT, size)
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

for kind in (('phone',) if (IDLE or APP) else ('phone', 'tab')):
    for key in CAPTIONS:
        frame(kind, key)
print('framed')
