"""캐릭터별 꾸미기 자리표: python games/tools/gen_anchors.py → data/anchors.json (+ games/media/anchors_debug.png)
캐릭터 PNG(assets/, 읽기만)에서 눈(어두운 덩어리 한 쌍)·몸 윤곽을 찾아 모자·얼굴·목·손·볼·등 좌표를 이미지 가로세로의 비율(0~1)로 저장한다.
소품은 이 비율 좌표에 붙으므로 캐릭터를 어떤 크기로 그려도 맞는다. 캐릭터 그림이 바뀌면 이 스크립트를 다시 돌린다.
"""
import json, pathlib
import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

ROOT = pathlib.Path(__file__).resolve().parents[2]
USE = {'wife': 'good', 'husband': 'good', 'dong_dad': 'good', 'nemo_dad': 'good', 'nemo_mom': 'good', 'baby': 'good',
       'nemo_kids.kid1': None, 'nemo_kids.kid2': None, 'nemo_kids.kid3': None, 'nemo_kids.baby': None, 'nemo_grandma': 'good'}
chars = json.loads((ROOT / 'data' / 'chars.json').read_text(encoding='utf-8'))
out, dbg = {}, []
for key, expr in USE.items():
    cid = key if expr is None else f'{key}.{expr}'
    c = chars.get(cid)
    if not c: continue
    im = Image.open(ROOT / c['src']).convert('RGBA'); a = np.asarray(im)
    H, W = a.shape[:2]; mask = a[..., 3] > 40
    ys, xs = np.where(mask); x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max(); bh, bw = y1 - y0, x1 - x0
    dark = mask & (a[..., :3].astype(int).sum(-1) / 3 < 95) & (a[..., 3] > 200)
    lab, n = ndimage.label(dark); comps = []
    for i in range(1, n + 1):
        yy, xx = np.where(lab == i)
        if len(yy) < 90 or yy.mean() > y0 + 0.62 * bh: continue
        comps.append((len(yy), xx.mean(), yy.mean()))
    best = None
    for i in range(len(comps)):
        for j in range(i + 1, len(comps)):
            (ai, xi, yi), (aj, xj, yj) = comps[i], comps[j]
            if abs(yi - yj) < 0.07 * bh and abs(xi - xj) > 0.12 * bw:
                sc = min(ai, aj)
                if not best or sc > best[0]: best = (sc, (xi + xj) / 2, (yi + yj) / 2, abs(xi - xj))
    if best: ex, ey, ed = best[1], best[2], best[3]
    else: ex, ey, ed = (x0 + x1) / 2, y0 + 0.42 * bh, 0.3 * bw
    width = lambda y: (lambda r: (r.max() - r.min() + 1) if r.size else 0)(np.where(mask[int(y)])[0])
    bodyW = max(width(ey), 1); maxW = bodyW
    bottom = y1
    for y in range(int(ey), int(y1)):
        if width(y) < 0.5 * bodyW and mask[y:y + 30, :].any() and width(min(y + 25, H - 1)) < 0.5 * bodyW: bottom = y; break
    mid = ey + 0.5 * (bottom - ey)
    tri = width(mid) < 0.7 * bodyW
    neckY = ey + (0.55 if tri else 0.72) * (bottom - ey)
    row = np.where(mask[int(neckY)])[0]; neckW = row.max() - row.min() + 1 if row.size else bodyW
    topY = int(ys[(abs(xs - ex) < 6)].min()) if (abs(xs - ex) < 6).any() else y0
    armY = ey + 0.55 * (bottom - ey)
    left = [x0, armY]; right = [x1, armY]
    f = lambda x, y: [round(float(x) / W, 4), round(float(y) / H, 4)]
    out[cid] = {'bodyW': round(float(bodyW) / W, 4), 'neckW': round(float(neckW) / W, 4), 'tri': bool(tri),
                'hat': f(ex, topY + 0.03 * bh), 'face': f(ex, ey), 'eyeDist': round(float(ed) / W, 4), 'neck': f(ex, neckY),
                'handL': f(*left), 'handR': f(*right), 'cheekL': f(ex - ed * 0.72, ey + 0.13 * bh), 'cheekR': f(ex + ed * 0.72, ey + 0.13 * bh),
                'side': f(x1 - 0.04 * bw, neckY + 0.06 * bh), 'bbox': [round(x0 / W, 4), round(y0 / H, 4), round(x1 / W, 4), round(y1 / H, 4)]}
    d = im.convert('RGB'); dr = ImageDraw.Draw(d)
    for nm, col in [('hat', 'red'), ('face', 'blue'), ('neck', 'green'), ('handL', 'purple'), ('handR', 'purple'), ('cheekL', 'orange'), ('cheekR', 'orange'), ('side', 'black')]:
        px, py = out[cid][nm][0] * W, out[cid][nm][1] * H; dr.ellipse((px - 7, py - 7, px + 7, py + 7), outline=col, width=4)
    dbg.append((cid, d.resize((W * 260 // H, 260))))
(ROOT / 'data' / 'anchors.json').write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding='utf-8', newline='\n')
sheet = Image.new('RGB', (len(dbg) * 250, 280), 'white')
for i, (cid, im) in enumerate(dbg):
    sheet.paste(im, (i * 250, 10)); ImageDraw.Draw(sheet).text((i * 250 + 4, 266), cid, fill='black')
(ROOT / 'games' / 'media').mkdir(exist_ok=True); sheet.save(ROOT / 'games' / 'media' / 'anchors_debug.png')
print(len(out), 'characters')
