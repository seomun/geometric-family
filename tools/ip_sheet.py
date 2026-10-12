"""IP 화면 캡처 시트: notes/snapshots/_ip_*.png 10장을 5×2 한 장(ip_sheet.png)으로. 캡션 포함."""
from PIL import Image, ImageDraw, ImageFont
import glob, os
names = ['1_album', '2_item', '3_passport', '4_more', '5_cameo_adult', '6_cameo_kid', '7_cameos', '8_share_a', '9_share_b', '10_kid_passport']
caps = ['① 이야기 카드 앨범(완성 1편+미완성)', '② 특별 소품 받는 순간', '③ 도장책(성인)', '④ 성인 모음 화면', '⑤ 카메오 장면(성인)', '⑥ 카메오 장면(유아·글 없음)', '⑦ 카메오 도감', '⑧ 공유 카드(성인 앱 A)', '⑨ 공유 카드(성인 앱 B)', '⑩ 유아 도장판(글 없음)']
W, H, PAD, CAP = 300, 600, 14, 34
try: font = ImageFont.truetype('C:/Windows/Fonts/malgunbd.ttf', 17)
except Exception: font = ImageFont.load_default()
sheet = Image.new('RGB', (5 * (W + PAD) + PAD, 2 * (H + CAP + PAD) + PAD), '#F4EFE6'); d = ImageDraw.Draw(sheet)
for i, (n, c) in enumerate(zip(names, caps)):
    im = Image.open(f'notes/snapshots/_ip_{n}.png').convert('RGB'); r = min(W / im.width, H / im.height); im = im.resize((int(im.width * r), int(im.height * r)), Image.LANCZOS)
    x = PAD + (i % 5) * (W + PAD) + (W - im.width) // 2; y = PAD + (i // 5) * (H + CAP + PAD)
    sheet.paste(im, (x, y)); d.text((PAD + (i % 5) * (W + PAD) + 2, y + H + 6), c, fill='#3A2E39', font=font)
sheet.save('notes/snapshots/ip_sheet.png'); print(sheet.size)
