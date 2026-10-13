"""D2: 퍼즐 4종(③ 합치기 · ⑦ 블록 · ⑧ 정리 · ⑨ 짝 맞추기) 120 → 180판(12장 → 18장 × 10판): 새 옛이야기 6편(선녀와 나무꾼·토끼전·은혜 갚은 까치·호랑이와 곶감·빨간 모자·헨젤과 그레텔).
멱등. 장 이름(생성기 CHAPTERS)·판(node tools/<앱>_gen.js 180)·이야기(data/<앱>_extra.json 13~18장, ⑥ 다른 그림 찾기 15~20장 문구를 그대로 씀 — 성인 표기·배역표 같음)를 맞춘다.
1~120판은 그대로여야 한다(저장된 진행·별 id 보존): 생성은 결정적이라 단언으로 확인. 이후 tools/story_build.py → tools/map_build.py → tools/ops_build.py. 문구 [제안]."""
import json, pathlib, re, subprocess, sys
R = pathlib.Path('.')
NEW = ['선녀와 나무꾼', '토끼전', '은혜 갚은 까치', '호랑이와 곶감', '빨간 모자', '헨젤과 그레텔']
spot = json.load(open(R / 'data/spot_extra.json', encoding='utf-8'))['stories']; SRC = {s['chapter']: s for s in spot}
APPS = {'merge': ['node', 'tools/merge_gen.js', '180', '120', 'append'], 'block': ['node', 'tools/block_gen.js', '180'], 'sort': ['node', 'tools/sort_gen.js', '180', '120'], 'tile': ['node', 'tools/tile_gen.js', '180', 'append']}
ONLY = sys.argv[1:] or list(APPS)
for app, cmd in APPS.items():
    if app not in ONLY: continue
    g = R / f'games/{app}/{app}-gen.js'; t = g.read_text(encoding='utf-8')
    if "'선녀와 나무꾼'" not in t:
        m = re.search(r"const CHAPTERS = \[([^\]]*)\];", t); assert m, app
        t = t[:m.start()] + "const CHAPTERS = [" + m.group(1) + ", " + ", ".join("'%s'" % n for n in NEW) + "];" + t[m.end():]; g.write_text(t, encoding='utf-8')
    p = R / f'data/{app}_levels.json'; old = json.load(open(p, encoding='utf-8'))['levels'] if p.exists() else []
    r = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8'); print(app, (r.stdout.splitlines() or [r.stderr[:200]])[0])
    new = json.load(open(p, encoding='utf-8'))['levels']; assert len(new) == 180, (app, len(new))
    if len(old) >= 120: assert all(json.dumps(a, sort_keys=True) == json.dumps(b, sort_keys=True) for a, b in zip(old[:120], new[:120])), (app, '1~120판이 바뀌었다')
    e = R / f'data/{app}_extra.json'; d = json.load(open(e, encoding='utf-8')); have = {s['chapter'] for s in d['stories']}; n = 0
    for i, ch in enumerate(range(13, 19)):
        if ch in have: continue
        s = SRC[15 + i]; d['stories'].append(dict(chapter=ch, title=s['title'], tale=s['tale'], cuts=s['cuts'])); n += 1
    d['stories'].sort(key=lambda s: s['chapter']); json.dump(d, open(e, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print(app, 'stories +', n)
