"""방치형 단일 HTML 빌드: python games/tools/build_idle.py → games/app/idle.html
쓰는 캐릭터·소리만 골라 인라인(WebP·MP3). src/characters.js 도 텍스트로 넣는다(동그라미 아들·엄마·딸 코드 그림)."""
import base64, io, json, pathlib, re
from PIL import Image
ROOT = pathlib.Path(__file__).resolve().parents[2]; G = ROOT / 'games'; OUT = G / 'app'; OUT.mkdir(exist_ok=True)

def inline_slots(root):
    """data/art_slots.json: 경로가 가리키는 SVG 를 빌드 때 data URI(아이콘은 SVG 텍스트)로 인라인한다. 파일이 없으면 코드 그림을 쓴다."""
    p = root / 'data' / 'art_slots.json'
    if not p.exists(): return {}
    d = json.loads(p.read_text(encoding='utf-8')); n = 0
    for kind in ('bg', 'props', 'cover', 'room', 'icons'):
        for k, v in list(d.get(kind, {}).items()):
            f = root / v
            if v.startswith(('data:', '<svg')) or not f.exists():
                if not (v.startswith(('data:', '<svg'))): d[kind].pop(k)
                continue
            raw = f.read_bytes()
            d[kind][k] = raw.decode('utf-8') if kind == 'icons' else 'data:image/svg+xml;base64,' + base64.b64encode(raw).decode(); n += 1
    if n: print('  art slots inlined:', n)
    return d

b64 = lambda d, m: f'data:{m};base64,' + base64.b64encode(d).decode()
def webp(path, max_h=420):
    im = Image.open(path).convert('RGBA')
    if im.height > max_h: im = im.resize((round(im.width * max_h / im.height), max_h), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=84, alpha_quality=95, method=6); return buf.getvalue()
rd = lambda n: json.loads((ROOT / 'data' / f'{n}.json').read_text(encoding='utf-8'))
bal, sto, chars, anchors, sounds, props = rd('idle_balance'), rd('idle_stories'), rd('chars'), rd('anchors'), rd('sounds'), rd('room_items')
used = set(re.findall(r'"((?:nemo_dad|nemo_mom|nemo_grandma|nemo_kids|baby|wife|husband|dong_dad)\.\w+)"', json.dumps(bal) + json.dumps(sto)))
data = {'chars': {}, 'anchors': {}, 'idle_balance': bal, 'idle_stories': sto, 'room_items': props, 'base': ''}
data['art_slots'] = inline_slots(ROOT)
img = 0
for k in sorted(used):
    if k not in chars: print('  ! 없는 캐릭터', k); continue
    v = dict(chars[k]); raw = webp(ROOT / v['src']); img += len(raw); v['src'] = b64(raw, 'image/webp'); data['chars'][k] = v
SFX = ['tap', 'pick', 'ok', 'hmm', 'page', 'star', 'celebrate', 'wind']
MUSIC_ON = sounds.get('musicEnabled', True)     # False 면 BGM 슬롯 자체를 넣지 않는다(용량도 줄어듦)
snd = {'sfx': {k: sounds['sfx'][k] for k in SFX if k in sounds['sfx']}, 'music': {'theme_main': sounds['music']['theme_main']} if MUSIC_ON else {}, 'voice': {}, 'musicEnabled': MUSIC_ON}
for key in ('alias',):
    if key in sounds: snd[key] = sounds[key]
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
        if not path.exists(): print('  ! 없는 소리', f); continue
        raw, mime = path.read_bytes(), 'audio/wav'
        if path.suffix == '.mp3': mime = 'audio/mpeg'
        elif grp == 'sfx': raw, mime = to_mp3(path), 'audio/mpeg'
        aud += len(raw); audio[f] = b64(raw, mime)
data['audio'] = audio
css = (G / 'engine' / 'gf.css').read_text(encoding='utf-8') + '\n' + (G / 'idle' / 'idle.css').read_text(encoding='utf-8')
js = '\n'.join((G / f).read_text(encoding='utf-8') for f in ['engine/gf.js', 'engine/art.js', 'engine/ui-kit/ui-kit.js', 'engine/room/room-art.js', 'engine/room/room.js', 'idle/idle.js'])
body = re.search(r'<body>(.*?)<script src=', (G / 'idle' / 'index.html').read_text(encoding='utf-8'), re.S).group(1)
code = (ROOT / 'src' / 'characters.js').read_text(encoding='utf-8')
html = f'''<!DOCTYPE html>
<html lang="ko"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<title>기하학 가족: 세 가족 식탁</title><link rel="icon" href="data:,"><style>{css}</style></head>
<body>{body}
<script>window.GF_DATA = {json.dumps(data, ensure_ascii=False, separators=(',', ':'))};window.GF_CODECHARS = {json.dumps(code)};</script>
<script>{js}</script>
<script>IDLE.start({{}});</script>
</body></html>'''
(OUT / 'idle.html').write_text(html, encoding='utf-8')
print(f'idle.html {len(html.encode())/1e6:.2f} MB (이미지 {img/1e6:.2f} · 소리 {aud/1e6:.2f})')
