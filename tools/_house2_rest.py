"""Room 2.0 를 나머지 앱에 연결(멱등): 집 화면 → house2, Room.init 에 home/openHouse. 결과 화면·홈 띠는 room2.js 의 공통 훅(UK.result·GF.screen 래퍼)이 맡는다."""
import re, io, sys, subprocess
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
CFG = {'merge': ('mhouse', 'mlevels'), 'day': ('dhouse', 'dmap'), 'spot': ('phouse', 'plevels'), 'block': ('bhouse', 'blevels'), 'sort': ('shouse', 'slevels'), 'tile': ('thouse', 'tlevels'), 'idle': ('ihouse', 'itable'), 'quiz': ('qhouse', 'qtests'), 'color': ('chouse', 'cbook')}
subprocess.run([sys.executable, 'tools/_house2_patch.py', 'spot', 'block', 'sort', 'tile', 'idle', 'quiz', 'color', 'play'], check=True)
for app, (house, home) in CFG.items():
    p = f'games/{app}/{app}.js'; s = open(p, encoding='utf-8').read(); ch = False
    s2 = re.sub(r"Room\.house\(sc, \{[^}]*\}\)", "Room.house2(sc, { go: () => GF.go('%s') })" % home, s)
    if s2 != s: s = s2; ch = True
    if 'openHouse:' not in s:
        s = s.replace('Room.init({ housing: GF.data.housing, app:', "Room.init({ home: () => GF.go('%s'), openHouse: () => GF.go('%s'), housing: GF.data.housing, app:" % (home, house), 1); ch = True
    if ch: open(p, 'w', encoding='utf-8').write(s); print('ok', app)
    else: print('skip', app)
# ① 놀이터(gf.js): 데이터 이름·Room.init·집 화면
p = 'games/engine/gf.js'; s = open(p, encoding='utf-8').read()
print('gf.js house2' if 'Room.house2(sc, { go: () => GF.go(\'map\') })' in s else 'gf.js 수정')
s = re.sub(r"Room\.house\(sc, \{ room: 'kid' \}\)", "Room.house2(sc, { go: () => GF.go('map') })", s)
if "housing: GF.data.housing" not in s:
    s = s.replace("Room.init({ data: GF.data.room_items, game: 'playground',", "Room.init({ home: () => GF.go('map'), openHouse: () => GF.go('khouse'), housing: GF.data.housing, app: 'playground', data: GF.data.room_items, game: 'playground',", 1)
open(p, 'w', encoding='utf-8').write(s)
print([m.group(0)[:120] for m in re.finditer(r"dataNames: \[[^\]]*room_items[^\]]*\]", s)][:3])
