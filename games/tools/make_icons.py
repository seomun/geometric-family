"""앱 5종 아이콘: python games/tools/make_icons.py → games/store/icon_512_<앱>.png + android/app/src/<flavor>/res/mipmap-*/ic_launcher.png
캐릭터 PNG(assets/)는 읽기만 한다. 얼굴 클로즈업 규격은 make_store.py 의 face_icon 과 같다."""
import pathlib
from PIL import Image, ImageDraw
ROOT = pathlib.Path(__file__).resolve().parents[2]; STORE = ROOT / 'games' / 'store'; SRC = ROOT / 'games' / 'android' / 'app' / 'src'
S = 1024
APPS = {  # flavor: (스토어 이름, 캐릭터 PNG, 배경, 위쪽 비율)
    'toddler': ('toddler', 'wife/good.png', '#BFE8FF', 0.83), 'color': ('color', 'baby/good.png', '#FFD9A8', 0.74),
    'tables': ('tables', 'nemo_mom/good.png', '#FFE3C2', 0.8), 'merge': ('merge', 'nemo_kids/kid1.png', '#FFD9C0', 0.9), 'quiz': ('quiz', 'dong_dad/good.png', '#DDE2FA', 0.8), 'block': ('block', 'nemo_dad/good.png', '#FFE9B8', 0.8), 'spot': ('spot', 'nemo_mom/good.png', '#E6F4FF', 0.8)}
def face_icon(png, bg, top_frac, fill=0.84):
    im = Image.open(ROOT / 'assets' / png).convert('RGBA'); bb = im.getchannel('A').point(lambda a: 255 if a > 20 else 0).getbbox()
    im = im.crop((bb[0], bb[1], bb[2], bb[1] + round((bb[3] - bb[1]) * top_frac)))
    sc = (S * fill) / max(im.width, im.height); im = im.resize((round(im.width * sc), round(im.height * sc)), Image.LANCZOS)
    cv = Image.new('RGBA', (S, S), bg); cv.alpha_composite(im, ((S - im.width) // 2, (S - im.height) // 2 + round(S * 0.02))); return cv
def rounded(im, r):
    m = Image.new('L', im.size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, im.width - 1, im.height - 1), r, fill=255)
    out = Image.new('RGBA', im.size, (0, 0, 0, 0)); out.paste(im.convert('RGBA'), (0, 0), m); return out
sheet = Image.new('RGB', (7 * 200, 200), 'white')
for i, (fl, (nm, png, bg, tf)) in enumerate(APPS.items()):
    ic = face_icon(png, bg, tf); ic.resize((512, 512), Image.LANCZOS).convert('RGB').save(STORE / f'icon_512_{nm}.png'); sheet.paste(ic.resize((192, 192), Image.LANCZOS).convert('RGB'), (i * 200 + 4, 4))
    for name, px in [('mdpi', 48), ('hdpi', 72), ('xhdpi', 96), ('xxhdpi', 144), ('xxxhdpi', 192)]:
        d = SRC / fl / 'res' / f'mipmap-{name}'; d.mkdir(parents=True, exist_ok=True)
        rounded(ic.resize((px, px), Image.LANCZOS), round(px * 0.22)).save(d / 'ic_launcher.png')
sheet.save(STORE / 'icons_five.png'); print('ok')
