import pathlib, re
G = pathlib.Path('games')
# ---- ops_build: playTale ----
b = pathlib.Path('tools/ops_build.py'); z = b.read_text(encoding='utf-8')
if 'playTale' not in z:
    z = z.replace("cardMap=card_map(), stamps=stamp_rules())", "cardMap=card_map(), stamps=stamp_rules(), playTale={str(k): v for k, v in PLAY_TALE.items()})", 1); b.write_text(z, encoding='utf-8')
# ---- ip.js: playBeat ----
p = G / 'engine/ip.js'; s = p.read_text(encoding='utf-8')
if 'I.playBeat' not in s:
    s = s.replace("  I.toast = (tale, beat) =>", "  /** ① 놀이터: 책 장(ch11~15)의 프롤로그=카드0, 단계 A 깸=카드1, B 깸=카드2, 에필로그=카드3 */\n  I.playBeat = function (chId, beat) { const n = +String(chId).replace(/\\D/g, ''), tale = ((GF.data.ops || {}).playTale || {})[n]; return tale ? I.beat('play', tale, beat) : false; };\n  I.toast = (tale, beat) =>", 1)
    p.write_text(s, encoding='utf-8')
# ---- tale.js: 컷을 끝까지 봤을 때 카드 ----
t = G / 'engine/tale.js'; u = t.read_text(encoding='utf-8')
if 'afterBeat' not in u:
    old = "  const go = (raw, parent, cb, o, k) => { if (!raw || !raw.length || (k && T.seen(k)) || auto()) { if (k && !T.seen(k)) T.mark(k); cb && cb(); return false; } if (k) T.mark(k); T.play(raw, parent, cb, o); return true; };"
    assert old in u
    new = """  /** 장 n 의 기(s)·승/전(m)·결(e) 컷을 끝까지 보면 그 이야기 카드를 얻는다(GF.ip). 이미 본 컷도 한 번 더 확인해 예전 진행도 카드가 된다 */
  const afterBeat = (k) => { try { if (!GF.ip || !GF.ip.ready || auto() || !T.d) return; const m = /^([sme])(\\d+)(?::(\\d+))?$/.exec(k); if (!m) return; const c = ch(+m[2]); if (!c) return; let beat = m[1] === 's' ? 0 : m[1] === 'e' ? 3 : (c.mid || []).findIndex((x) => x.after === +m[3]) + 1; if (beat < 0 || beat > 3) return; GF.ip.beat(T.app, c.tale, beat); } catch (e) {} };
  const go = (raw, parent, cb, o, k) => {
    if (!raw || !raw.length || (k && T.seen(k)) || auto()) { if (k && !T.seen(k)) T.mark(k); else if (k && T.seen(k)) afterBeat(k); cb && cb(); return false; }
    if (k) T.mark(k); T.play(raw, parent, () => { if (k) afterBeat(k); cb && cb(); }, o); return true;
  };"""
    u = u.replace(old, new, 1); t.write_text(u, encoding='utf-8')
# ---- gf.js: ① 책 hooks, 앞으로 올 때 장부 새로고침 ----
g = G / 'engine/gf.js'; w = g.read_text(encoding='utf-8')
if 'GF.ip' not in w:
    w = w.replace("        if (p.part === 'pro') { GF.state.seen[p.ch] = 1; Store.save();", "        if (GF.ip && GF.ip.ready) GF.ip.playBeat(p.ch, p.part === 'pro' ? 0 : 3);   // 이야기 카드(GF.ip)\n        if (p.part === 'pro') { GF.state.seen[p.ch] = 1; Store.save();", 1)
    w = w.replace("rec.done = true; rec.stars = Math.max(rec.stars || 0, avg); GF.state.stages[run.id] = rec; Store.save(); refreshBar();", "rec.done = true; rec.stars = Math.max(rec.stars || 0, avg); GF.state.stages[run.id] = rec; Store.save(); refreshBar();\n    if (GF.ip && GF.ip.ready && run.kind === 'story' && run.k < 2) GF.ip.playBeat(run.ch, run.k + 1);   // 단계 A·B 깸 = 이야기 카드 1·2", 1)
    w = w.replace("GF.setHidden = (h) => { GF.appHidden = !!h;", "GF.setHidden = (h) => { GF.appHidden = !!h; if (!h && GF.ip && GF.ip.refresh) { try { GF.ip.refresh(); } catch (e) {} }", 1)
    assert w.count('GF.ip') >= 3, w.count('GF.ip'); g.write_text(w, encoding='utf-8')
# ---- extras: init·check ----
e = G / 'engine/extras.js'; x = e.read_text(encoding='utf-8')
if 'GF.ip.init' not in x:
    x = x.replace("    if (GF.polish) GF.polish.init(cfg);", "    if (GF.ip) GF.ip.init(cfg);   // IP 장부(카드·도장·카메오)\n    if (GF.polish) GF.polish.init(cfg);", 1)
    x = x.replace("    if (!X.ready || !X.cfg.badges) return []; const s = load(),", "    if (GF.ip && GF.ip.ready) GF.ip.syncStamps();   // 진행이 늘었으면 도장\n    if (!X.ready || !X.cfg.badges) return []; const s = load(),", 1)
    x = x.replace("    return {\n      stats: () => [['깬 판'", "    return {\n      progress: done,\n      stats: () => [['깬 판'", 1)
    assert 'GF.ip.init' in x and 'progress: done' in x; e.write_text(x, encoding='utf-8')
# ---- 앱별 progress ----
P = {
 'idle': ("app: 'idle', kid: false,", "progress: () => Object.keys(S.sd || {}).length,"),
 'quiz': ("app: 'quiz', kid: false,", "progress: () => Object.keys(SV.res || {}).length,"),
 'color': ("app: 'color', kid: true,", "progress: () => Object.keys(SV.done || {}).length,"),
 'day': ("app: 'day', kid: true,", "progress: () => Object.keys(SV.done || {}).length,"),
}
for app, (a, ins) in P.items():
    f = G / app / f'{app}.js'; v = f.read_text(encoding='utf-8')
    if 'progress:' not in v:
        assert a in v, app; v = v.replace(a, a + ' ' + ins, 1); f.write_text(v, encoding='utf-8')
w2 = g.read_text(encoding='utf-8')
if "app: 'play', kid: true, noHold: true," in w2 and 'progress:' not in w2.split("app: 'play', kid: true, noHold: true,")[1][:200]:
    w2 = w2.replace("app: 'play', kid: true, noHold: true,", "app: 'play', kid: true, noHold: true, progress: () => Object.values(GF.state.stages || {}).filter((x) => x.stars > 0).length,", 1); g.write_text(w2, encoding='utf-8')
# ---- 빌더·index: ip.js ----
for f in ['build', 'build_idle', 'build_merge', 'build_color', 'build_quiz', 'build_block', 'build_spot', 'build_tile', 'build_sort', 'build_day']:
    q = G / 'tools' / f'{f}.py'; y = q.read_text(encoding='utf-8')
    if "'engine/ip.js'" not in y: y = y.replace("'engine/ops.js', ", "'engine/ops.js', 'engine/ip.js', ", 1)
    assert "'engine/ip.js'" in y, f; q.write_text(y, encoding='utf-8')
for h in ['index.html', 'idle/index.html', 'merge/index.html', 'color/index.html', 'quiz/index.html', 'block/index.html', 'spot/index.html', 'tile/index.html', 'sort/index.html', 'day/index.html']:
    q = G / h; y = q.read_text(encoding='utf-8'); pre = '' if h == 'index.html' else '../'
    tag = f'<script src="{pre}engine/ip.js"></script>'
    if tag not in y: y = y.replace(f'<script src="{pre}engine/ops.js"></script>', f'<script src="{pre}engine/ops.js"></script>\n{tag}', 1); assert tag in y, h; q.write_text(y, encoding='utf-8')
print('ok')
