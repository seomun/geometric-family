"""D22-1 캡처 시트: 앱별 프롤로그 → 첫 판 연결 3장씩 → notes/snapshots/tut_sheet.png (먼저 node tools/tut_shots.js, tut_play.js)"""
import glob
from PIL import Image, ImageDraw, ImageFont
N = {'merge': '③ 합치기', 'spot': '⑥ 틀린 그림', 'block': '⑦ 블록', 'sort': '⑧ 정리', 'tile': '⑨ 타일', 'day': '⑩ 하루', 'idle': '② 방치형', 'color': '④ 색칠북', 'quiz': '⑤ 테스트', 'play': '① 놀이터'}
LV = ['pro2', 'hook', 'board']; LIGHT = ['pro1', 'pro2', 'pro3']
def pick(a):
    if a == 'play': return [f'notes/snapshots/tut_play_{c}.png' for c in ('ch1', 'ch4', 'ch11')]
    keys = LIGHT if a in ('idle', 'color', 'quiz') else LV
    out = []
    for k in keys:
        f = glob.glob(f'notes/snapshots/tut_{a}_*_{k}*.png'); out.append(sorted(f)[0])
    return out
W, H, LAB = 156, 312, 26; font = ImageFont.truetype('C:/Windows/Fonts/malgun.ttf', 17)
apps = list(N); cols = 2; rows = (len(apps) + cols - 1) // cols
sheet = Image.new('RGB', (cols * (3 * W + 14), rows * (H + LAB)), 'white'); d = ImageDraw.Draw(sheet)
for i, a in enumerate(apps):
    cx, cy = (i % cols) * (3 * W + 14), (i // cols) * (H + LAB); d.text((cx + 6, cy + 3), N[a], fill='black', font=font)
    for j, f in enumerate(pick(a)): sheet.paste(Image.open(f).convert('RGB').resize((W, H)), (cx + j * W, cy + LAB))
sheet.save('notes/snapshots/tut_sheet.png'); print('ok', sheet.size)
