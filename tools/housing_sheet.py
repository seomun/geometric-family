"""우리 집 2.0 전/후 캡처 시트 → notes/snapshots/housing_sheet.png (먼저 node tools/housing_shots.js after)"""
from PIL import Image, ImageDraw, ImageFont
F = ImageFont.truetype('C:/Windows/Fonts/malgun.ttf', 18)
rows = [('③ 합치기(성인)', ['before_merge', 'after_merge_1_house', 'after_merge_2_tasks', 'after_merge_3_catalog', 'after_merge_6_drop', 'after_merge_7_home_band']),
        ('⑩ 하루(유아, 글자 없음)', ['before_day', 'after_day_1_house', 'after_day_2_tasks', 'after_day_3_catalog', 'after_day_6_drop', 'after_day_7_home_band'])]
labels = ['전(1.0)', '집 메인', '할 일 3', '카탈로그', '집에 놓기', '다음 목표 띠']
W, H = 200, 400; sheet = Image.new('RGB', (W * 6, (H + 44) * 2 + 10), 'white'); d = ImageDraw.Draw(sheet)
for r, (t, fs) in enumerate(rows):
    y = r * (H + 44); d.text((8, y + 4), t, fill='black', font=F)
    for i, f in enumerate(fs):
        d.text((i * W + 8, y + 24), labels[i], fill='#555', font=F); sheet.paste(Image.open(f'notes/snapshots/housing_{f}.png').convert('RGB').resize((W, H)), (i * W, y + 44))
sheet.save('notes/snapshots/housing_sheet.png'); print(sheet.size)
