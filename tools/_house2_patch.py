"""Room 2.0 를 앱에 연결(멱등): python tools/_house2_patch.py merge day …
index.html·build_*.py 에 room2.js, 데이터에 housing, 앱 js 의 dataNames·Room.init(housing·app) 를 더한다. 앱별 화면 연결(집 화면·결과·띠)은 앱 js 에서 직접 고친다."""
import re, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
APPFILE = {'merge': 'merge', 'day': 'day', 'spot': 'spot', 'block': 'block', 'sort': 'sort', 'tile': 'tile', 'idle': 'idle', 'quiz': 'quiz', 'color': 'color', 'play': None}
BUILD = {'merge': 'build_merge.py', 'day': 'build_day.py', 'spot': 'build_spot.py', 'block': 'build_block.py', 'sort': 'build_sort.py', 'tile': 'build_tile.py', 'idle': 'build_idle.py', 'quiz': 'build_quiz.py', 'color': 'build_color.py', 'play': 'build.py'}
def sub(p, a, b, tag):
    s = open(p, encoding='utf-8').read()
    if b in s: print('skip', tag, p); return
    assert a in s, (p, a); open(p, 'w', encoding='utf-8').write(s.replace(a, b, 1)); print('ok', tag, p)
for app in sys.argv[1:]:
    d = APPFILE[app]; idx = f'games/{d}/index.html' if d else 'games/index.html'
    sub(idx, '<script src="../engine/room/room.js"></script>' if d else '<script src="engine/room/room.js"></script>', ('<script src="../engine/room/room.js"></script>\n<script src="../engine/room/room2.js"></script>' if d else '<script src="engine/room/room.js"></script>\n<script src="engine/room/room2.js"></script>'), 'index')
    sub('games/tools/' + BUILD[app], "'engine/room/room.js',", "'engine/room/room.js', 'engine/room/room2.js',", 'build js')
    bp = 'games/tools/' + BUILD[app]; t = open(bp, encoding='utf-8').read()
    if "'housing'" in t: print('skip build data', bp)
    elif app == 'play': t = t.replace("'anchors', 'room_items', 'names', 'ops']", "'anchors', 'room_items', 'housing', 'names', 'ops']", 1); open(bp, 'w', encoding='utf-8').write(t); print('ok build data', bp)
    else:
        import re as _re; t2 = _re.sub(r"'room_items': (\w+)", lambda m: "'room_items': %s, 'housing': rd('housing')" % m.group(1), t, count=1); assert t2 != t, bp; open(bp, 'w', encoding='utf-8').write(t2); print('ok build data', bp)
    if d:
        p = f'games/{d}/{d}.js'; s = open(p, encoding='utf-8').read()
        if "'housing'" not in s: s = s.replace("'room_items', 'art_slots'", "'room_items', 'housing', 'art_slots'", 1); open(p, 'w', encoding='utf-8').write(s); print('ok dataNames', p)
        s = open(p, encoding='utf-8').read()
        if 'housing: GF.data.housing' not in s: s = s.replace('Room.init({ data: ', 'Room.init({ housing: GF.data.housing, app: ' + repr(d if d != 'idle' else 'idle') + ', data: ', 1); open(p, 'w', encoding='utf-8').write(s); print('ok init', p)
