import json, pathlib
p = pathlib.Path('data/art_slots.json'); d = json.load(open(p, encoding='utf-8'))
if 'map' not in d:
    d['map'] = {}; d['note'] += ' · map[id](이야기 지도, games/19_SAGA_MAP.md §4): <앱>:<장>:bg|gate|mark1|mark2 · sky · node · node_lock · chest · chest_open · type:<판종류>'
    json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
G = pathlib.Path('games')
for g in ['merge', 'spot', 'block', 'sort', 'tile', 'day']:
    p = G / 'tools' / f'build_{g}.py'; s = p.read_text(encoding='utf-8')
    if 'saga.js' not in s:
        s = s.replace("'engine/tale.js', ", "'engine/tale.js', 'engine/saga.js', ", 1)
        s = s.replace("'engine/extras.css', ", "'engine/extras.css', 'engine/saga.css', ", 1)
        s = s.replace(f"story = rd('story_{g}')\n", f"story = rd('story_{g}')\nsmap = rd('maps/{g}')\n", 1)
        s = s.replace(f"'story_{g}': story,", f"'story_{g}': story, 'map_{g}': smap,", 1)
        assert 'saga.js' in s and 'map_' + g in s and 'saga.css' in s, g; p.write_text(s, encoding='utf-8')
    h = G / g / 'index.html'; t = h.read_text(encoding='utf-8')
    if 'saga.js' not in t:
        t = t.replace('<script src="../engine/tale.js"></script>', '<script src="../engine/tale.js"></script>\n<script src="../engine/saga.js"></script>', 1)
        t = t.replace('<link rel="stylesheet" href="../engine/extras.css">', '<link rel="stylesheet" href="../engine/extras.css">\n<link rel="stylesheet" href="../engine/saga.css">', 1); assert 'saga.js' in t and 'saga.css' in t, g; h.write_text(t, encoding='utf-8')
    j = G / g / f'{g}.js'; u = j.read_text(encoding='utf-8')
    if 'saga.init' not in u:
        u = u.replace(f"'story_{g}', 'room_items'", f"'story_{g}', 'map_{g}', 'room_items'", 1).replace(f"GF.tale.init('{g}',", f"GF.saga.init('{g}', GF.data.map_{g}); GF.tale.init('{g}',", 1); assert 'saga.init' in u; j.write_text(u, encoding='utf-8')
print('ok')
