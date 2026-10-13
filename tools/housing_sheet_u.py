"""우리 집 2.0 10앱 통일성 시트 → notes/snapshots/housing_unity.png (먼저 node tools/housing_homes.js)"""
from PIL import Image, ImageDraw, ImageFont
F = ImageFont.truetype('C:/Windows/Fonts/malgun.ttf', 16)
apps = [('merge', '③ 합치기'), ('spot', '⑥ 틀린 그림'), ('block', '⑦ 블록'), ('sort', '⑧ 정리'), ('tile', '⑨ 타일'), ('idle', '② 식탁'), ('quiz', '⑤ 어느 도형'), ('color', '④ 색칠북'), ('day', '⑩ 하루'), ('play', '① 놀이터')]
rows = [('홈 · 다음 목표 띠', '1_home'), ('집 메인', '2_house'), ('카탈로그', '3_catalog'), ('집에 놓기', '4_drop')]
W, H = 130, 260; sheet = Image.new('RGB', (W * len(apps), 22 + (H + 20) * len(rows)), 'white'); d = ImageDraw.Draw(sheet)
for i, (a, n) in enumerate(apps): d.text((i * W + 6, 2), n, fill='black', font=F)
for r, (lab, k) in enumerate(rows):
    y = 22 + r * (H + 20); d.text((6, y), lab, fill='#555', font=ImageFont.truetype('C:/Windows/Fonts/malgun.ttf', 13))
    for i, (a, n) in enumerate(apps): sheet.paste(Image.open(f'notes/snapshots/housing_u_{a}_{k}.png').convert('RGB').resize((W, H)), (i * W, y + 18))
sheet.save('notes/snapshots/housing_unity.png'); print(sheet.size)
