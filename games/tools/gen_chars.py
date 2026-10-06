"""assets/<char>/manifest.json -> data/chars.json (읽기 전용으로 assets 를 참조)."""
import json, pathlib
from PIL import Image
ROOT = pathlib.Path(__file__).resolve().parents[2]
USE = ['wife', 'dong_dad', 'nemo_dad', 'nemo_mom', 'nemo_grandma', 'nemo_kids', 'baby']
out = {}
for c in USE:
    m = json.loads((ROOT / 'assets' / c / 'manifest.json').read_text(encoding='utf-8'))
    for k, v in m.items():
        im = Image.open(ROOT / 'assets' / c / v['file']).convert('RGBA'); bb = im.getchannel('A').point(lambda a: 255 if a > 20 else 0).getbbox()
        out[f'{c}.{k}'] = {'src': f'assets/{c}/{v["file"]}', 'w': v['w'], 'h': v['h'], 'bh': round((bb[3] - bb[1]) / im.height, 3), 'bw': round((bb[2] - bb[0]) / im.width, 3)}  # 실제 보이는 몸 비율
(ROOT / 'data' / 'chars.json').write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding='utf-8')
print(len(out), 'images')
