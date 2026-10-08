"""도형 블록 단일 HTML 빌드: python games/tools/build_block.py → games/app/block.html
쓰는 캐릭터·소리만 골라 인라인(WebP·MP3). 규칙·UI 키트·룸 모듈·레벨 데이터 전부 한 파일."""
import base64, io, json, pathlib, re, sys
from PIL import Image
sys.path.insert(0, str(pathlib.Path(__file__).parent))
ROOT = pathlib.Path(__file__).resolve().parents[2]; G = ROOT / 'games'; OUT = G / 'app'; OUT.mkdir(exist_ok=True)
b64 = lambda d, m: f'data:{m};base64,' + base64.b64encode(d).decode()
def inline_slots(root):
    p = root / 'data' / 'art_slots.json'
    if not p.exists(): return {}
    d = json.loads(p.read_text(encoding='utf-8'))
    for kind in ('bg', 'props', 'cover', 'room', 'icons', 'hero'):
        for k, v in list(d.get(kind, {}).items()):
            f = root / v
            if v.startswith(('data:', '<svg')): continue
            if not f.exists(): d[kind].pop(k); continue
            raw = f.read_bytes(); d[kind][k] = raw.decode('utf-8') if kind == 'icons' else 'data:image/svg+xml;base64,' + base64.b64encode(raw).decode()
    return d
def webp(path, max_h=420):
    im = Image.open(path).convert('RGBA')
    if im.height > max_h: im = im.resize((round(im.width * max_h / im.height), max_h), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=84, alpha_quality=95, method=6); return buf.getvalue()
rd = lambda n: json.loads((ROOT / 'data' / f'{n}.json').read_text(encoding='utf-8'))
chars, anchors, sounds, levels, room, extra = rd('chars'), rd('anchors'), rd('sounds'), rd('block_levels'), rd('room_items'), rd('block_extra')
import re as _re
USED = sorted(set(['nemo_dad.joy', 'wife.joy', 'dong_dad.joy', 'nemo_kids.kid1', 'baby.joy'] + _re.findall(r'"((?:nemo_dad|nemo_mom|nemo_grandma|nemo_kids|baby|wife|husband|dong_dad)\.\w+)"', json.dumps(extra))))
data = {'chars': {}, 'anchors': {}, 'block_levels': levels, 'block_extra': extra, 'room_items': room, 'names': rd('names'), 'base': '', 'art_slots': inline_slots(ROOT)}
img = 0
for k in USED:
    v = dict(chars[k]); raw = webp(ROOT / v['src']); img += len(raw); v['src'] = b64(raw, 'image/webp'); data['chars'][k] = v
SFX = ['tap', 'pick', 'ok', 'drop', 'hmm', 'page', 'star', 'celebrate']
MUSIC_ON = sounds.get('musicEnabled', True)
snd = {'sfx': {k: sounds['sfx'][k] for k in SFX if k in sounds['sfx']}, 'music': {'theme_main': sounds['music']['theme_main']} if MUSIC_ON else {}, 'voice': {}, 'musicEnabled': MUSIC_ON}
data['sounds'] = snd; audio = {}; aud = 0
def to_mp3(path):
    import wave, lameenc
    w = wave.open(str(path)); pcm = w.readframes(w.getnframes()); e = lameenc.Encoder()
    e.set_bit_rate(112); e.set_in_sample_rate(w.getframerate()); e.set_channels(w.getnchannels()); e.set_quality(2); return bytes(e.encode(pcm) + e.flush())
for grp in ('sfx', 'music'):
    for e in snd[grp].values():
        f = e.get('file')
        if not f or f in audio: continue
        path = G / f
        if not path.exists(): continue
        raw, mime = path.read_bytes(), 'audio/wav'
        if path.suffix == '.mp3': mime = 'audio/mpeg'
        elif grp == 'sfx': raw, mime = to_mp3(path), 'audio/mpeg'
        aud += len(raw); audio[f] = b64(raw, mime)
data['audio'] = audio
css = '\n'.join((G / f).read_text(encoding='utf-8') for f in ['engine/ui-kit/ui-kit.css', 'engine/gf.css', 'engine/room/room.css', 'engine/extras.css', 'block/block.css'])
js = '\n'.join((G / f).read_text(encoding='utf-8') for f in ['engine/gf.js', 'engine/art.js', 'engine/ui-kit/ui-kit.js', 'engine/room/room-art.js', 'engine/room/room.js', 'engine/ads.js', 'engine/board.js', 'engine/rank.js', 'engine/extras.js', 'block/block-core.js', 'block/block-gen.js', 'block/block.js'])
body = re.search(r'<body>(.*?)<script src=', (G / 'block' / 'index.html').read_text(encoding='utf-8'), re.S).group(1)
html = f'''<!DOCTYPE html>
<html lang="ko" data-uk="adult"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<title>도형 블록</title><link rel="icon" href="data:,"><style>{css}</style></head>
<body>{body}
<script>window.GF_DATA = {json.dumps(data, ensure_ascii=False, separators=(',', ':'))};</script>
<script>{js}</script>
<script>BLOCK.start({{}});</script>
</body></html>'''
(OUT / 'block.html').write_text(html, encoding='utf-8')
print(f'block.html {len(html.encode())/1e6:.2f} MB (이미지 {img/1e6:.2f} · 소리 {aud/1e6:.2f} · 레벨 {len(levels["levels"])})')
