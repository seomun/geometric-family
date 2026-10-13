"""우리 집 2.0 전/후 캡처 시트 → notes/snapshots/housing_sheet.png (먼저 node tools/housing_shots.js after)"""
from PIL import Image, ImageDraw, ImageFont
F = ImageFont.truetype('C:/Windows/Fonts/malgun.ttf', 17)
cols = [('전(1.0)', 'before_{a}'), ('집 메인(방 70%)', 'after_{a}_1_house'), ('할 일 펼침', 'after_{a}_2_tasks'), ('카탈로그·세트 탭', 'after_{a}_3_catalog'), ('완성 모습', 'after_{a}_8_dream'), ('방 밀도 ①', 'after_{a}_9_dense_b'), ('방 밀도 ②', 'after_{a}_9_dense_c'), ('집에 놓기', 'after_{a}_6_drop'), ('다음 목표 띠', 'after_{a}_7_home_band')]
rows = [('③ 합치기(성인)', 'merge'), ('⑩ 하루(유아, 글자 없음)', 'day')]
W, H = 150, 300; sheet = Image.new('RGB', (W * len(cols), (H + 44) * 2 + 6), 'white'); d = ImageDraw.Draw(sheet)
for r, (t, a) in enumerate(rows):
    y = r * (H + 44); d.text((8, y + 3), t, fill='black', font=F)
    for i, (lab, f) in enumerate(cols):
        d.text((i * W + 6, y + 23), lab, fill='#555', font=ImageFont.truetype('C:/Windows/Fonts/malgun.ttf', 13)); sheet.paste(Image.open('notes/snapshots/housing_' + f.format(a=a) + '.png').convert('RGB').resize((W, H)), (i * W, y + 44))
sheet.save('notes/snapshots/housing_sheet.png'); print(sheet.size)
