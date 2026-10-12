import pathlib
G = pathlib.Path('games')
p = G / 'engine/polish.js'; s = p.read_text(encoding='utf-8')
if 'P.assist' not in s:
    s = s.replace("  P.finished = function () { fin = true; };", """  P.finished = function () { fin = true; };
  /* ---------------- 쉬운 모드(성인): 되돌리기·섞기 한도 해제 + 별 기준 한 칸 완화. 오늘의 한 판·시즌 등(kind 있는 판)에는 적용하지 않아 순위가 공정하다 ---------------- */
  P.assist = () => !!(GF.state && GF.state.settings && GF.state.settings.assist);
  P.cap = (n, LV) => (P.assist() && !(LV && LV.kind) ? 99 : n);
  P.easy = (st, LV) => (P.assist() && !(LV && LV.kind) ? Math.min(3, st + 1) : st);""", 1)
    s = s.replace("P.goal = function (r, text) { if (P.kid || !text) return; const g = el('div', 'pol-goal', r, text); return g; };", "P.goal = function (r, text) { if (P.kid || !text) return; const g = el('div', 'pol-goal', r, text + (P.assist() ? GF.t('polish.assist.chip') : '')); return g; };", 1)
    s = s.replace("    const r = el('div', 'xt-row', body); el('span', '', r, GF.t('polish.settings.about'));", "    if (!P.kid) { const ra = el('div', 'xt-row', body); el('span', '', ra, GF.t('polish.settings.assist')); ra.appendChild(UK.switch(P.assist(), (on) => { GF.state.settings.assist = on ? 1 : 0; GF.save && GF.save(); })); el('small', 'xt-note', body, GF.t('polish.assist.note')); }\n    const r = el('div', 'xt-row', body); el('span', '', r, GF.t('polish.settings.about'));", 1)
    assert 'P.assist' in s; p.write_text(s, encoding='utf-8')
R = {
 'merge': [("undone >= 1", "undone >= GF.polish.cap(1, LV)"), ("const st = M.stars(S, LV);", "const st = GF.polish.easy(M.stars(S, LV), LV);")],
 'block': [("undone >= 1", "undone >= GF.polish.cap(1, LV)"), ("const st = S.used <= LV.s3 ? 3 : S.used <= LV.s2 ? 2 : 1;", "const st = GF.polish.easy(S.used <= LV.s3 ? 3 : S.used <= LV.s2 ? 2 : 1, LV);")],
 'sort': [("S.used.undo >= 3", "S.used.undo >= GF.polish.cap(3, LV)"), ("const st = S.moves <= LV.par + 4 ? 3 : S.moves <= LV.par + 12 ? 2 : 1;", "const st = GF.polish.easy(S.moves <= LV.par + 4 ? 3 : S.moves <= LV.par + 12 ? 2 : 1, LV);")],
 'tile': [("S.used.undo >= 1", "S.used.undo >= GF.polish.cap(1, LV)"), ("S.used.shuffle >= 1", "S.used.shuffle >= GF.polish.cap(1, LV)"), ("st = tools === 0 ? 3 : tools <= 2 ? 2 : 1;", "st = GF.polish.easy(tools === 0 ? 3 : tools <= 2 ? 2 : 1, LV);")],
 'spot': [("const st = C.stars(hints, wrong);", "const st = GF.polish.easy(C.stars(hints, wrong), LV);")],
}
for app, items in R.items():
    f = G / app / f'{app}.js'; v = f.read_text(encoding='utf-8')
    for a, b in items:
        if a in v and b not in v: v = v.replace(a, b)
        elif b not in v: print('MISS', app, a[:40])
    f.write_text(v, encoding='utf-8')
b = pathlib.Path('tools/ops_build.py'); z = b.read_text(encoding='utf-8')
if "'polish.settings.assist'" not in z:
    z = z.replace("    'ops.back.title':", "    'polish.settings.assist': '쉬운 모드', 'polish.assist.note': '되돌리기·섞기를 마음껏 쓰고 별 기준이 한 칸 쉬워져요. 오늘의 한 판 같은 경쟁 판에는 적용되지 않아요.', 'polish.assist.chip': ' · 쉬운 모드',\n    'ops.back.title':", 1); b.write_text(z, encoding='utf-8')
print('ok')
