"""assets/<char>/manifest.json -> data/chars.json (읽기 전용으로 assets 를 참조)."""
import json, pathlib
ROOT = pathlib.Path(__file__).resolve().parents[2]
USE = ['wife', 'dong_dad', 'nemo_dad', 'nemo_mom', 'nemo_grandma', 'nemo_kids', 'baby']
out = {}
for c in USE:
    m = json.loads((ROOT / 'assets' / c / 'manifest.json').read_text(encoding='utf-8'))
    for k, v in m.items():
        out[f'{c}.{k}'] = {'src': f'assets/{c}/{v["file"]}', 'w': v['w'], 'h': v['h']}
(ROOT / 'data' / 'chars.json').write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding='utf-8')
print(len(out), 'images')
