"""단일 HTML 빌드: python games/tools/build.py   →  games/app/index.html (+ 용량 보고)
- gf.css · gf.js · art.js · modes/*.js 를 인라인, data/*.json 을 window.GF_DATA 로 인라인
- 캐릭터 PNG → WebP(높이 560px) data URI, 효과음·BGM → data URI  ⇒ 파일 하나로 오프라인 실행(WebView file:// 에서 캔버스 오염 없음)
"""
import base64, io, json, pathlib, re, sys
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[2]
G = ROOT / 'games'
OUT = G / 'app'
OUT.mkdir(exist_ok=True)

def b64(data, mime):
    return f'data:{mime};base64,' + base64.b64encode(data).decode()

def webp(path, max_h=560):
    im = Image.open(path).convert('RGBA')
    if im.height > max_h:
        im = im.resize((round(im.width * max_h / im.height), max_h), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'WEBP', quality=86, alpha_quality=95, method=6)
    return buf.getvalue()

data = {n: json.loads((ROOT / 'data' / f'{n}.json').read_text(encoding='utf-8')) for n in ['chars', 'stages', 'story', 'stickers', 'anchors']}
img_bytes = 0
for k, v in data['chars'].items():
    raw = webp(ROOT / v['src'])
    img_bytes += len(raw)
    v['src'] = b64(raw, 'image/webp')
data['base'] = ''
sounds = json.loads((ROOT / 'data' / 'sounds.json').read_text(encoding='utf-8'))
data['sounds'] = sounds
audio = {}
aud_bytes = 0
files = set()
LOOPS = {e['file'] for e in sounds.get('music', {}).values() if e.get('file') and e.get('loop', True)}
def to_mp3(path):
    import wave, lameenc
    w = wave.open(str(path)); pcm = w.readframes(w.getnframes()); enc = lameenc.Encoder()
    enc.set_bit_rate(112); enc.set_in_sample_rate(w.getframerate()); enc.set_channels(w.getnchannels()); enc.set_quality(2)
    return bytes(enc.encode(pcm) + enc.flush())
for grp in ('sfx', 'music', 'voice'):
    for e in sounds.get(grp, {}).values():
        if e.get('file'): files.add(e['file'])
for f in sorted(files):                      # 슬롯이 가리키는 파일만 (경로는 games/ 기준)
    path = G / f
    if not path.exists():
        print('  ! 없는 소리 파일:', f); continue
    raw = path.read_bytes(); mime = {'.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.ogg': 'audio/ogg'}.get(path.suffix, 'audio/wav')
    if path.suffix == '.wav' and f not in LOOPS:                # 짧은 효과음·로고는 MP3(112kbps)로 줄여 넣는다(루프 음악은 이음새 때문에 WAV 유지)
        raw, mime = to_mp3(path), 'audio/mpeg'
    aud_bytes += len(raw); audio[f] = b64(raw, mime)
data['audio'] = audio

css = (G / 'engine' / 'gf.css').read_text(encoding='utf-8')
js_files = ['engine/gf.js', 'engine/art.js', 'engine/icons.js', 'engine/props.js'] + [f'engine/modes/{n}.js' for n in ['shadow', 'faces', 'puzzle', 'paint', 'shapes', 'sequence', 'soundfind', 'dress', 'train', 'cake']]
js = '\n'.join((G / f).read_text(encoding='utf-8') for f in js_files)

src = (G / 'index.html').read_text(encoding='utf-8')
body = re.search(r'<body>(.*?)<script src=', src, re.S).group(1)
html = f'''<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
<title>기하학 가족 놀이터</title>
<link rel="icon" href="data:,">
<style>{css}</style>
</head>
<body>{body}
<script>window.GF_DATA = {json.dumps(data, ensure_ascii=False, separators=(',', ':'))};</script>
<script>{js}</script>
<script>GF.boot();</script>
</body>
</html>
'''
(OUT / 'index.html').write_text(html, encoding='utf-8')
print(f'index.html  {len(html.encode()) / 1e6:.2f} MB   (이미지 WebP {img_bytes / 1e6:.2f} MB · 소리 WAV {aud_bytes / 1e6:.2f} MB · 코드 {len((css + js).encode()) / 1e3:.0f} KB)')
