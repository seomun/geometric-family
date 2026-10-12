import pathlib, re
G = pathlib.Path('games')
# ---- polish.js 추가 ----
p = G / 'engine/polish.js'; s = p.read_text(encoding='utf-8')
add = r'''
  /* ---------------- 일시정지 메뉴: 판 중 ‹ → 계속/다시/지도로 (첫 조작 전·판이 끝난 뒤에는 메뉴 없이 바로 나감) ---------------- */
  let touched = false, fin = false;
  P.pause = function (r, again) {
    touched = false; fin = false; const arm = () => { touched = true; r.removeEventListener('pointerup', arm, true); }; r.addEventListener('pointerup', arm, true);
    GF.backHook = function () {
      if (!touched || fin || document.querySelector('.uk-scrim')) return false;
      const kid = P.kid, leave = () => { GF.backHook = null; GF.back(); };
      UK.modal({ parent: safe(), title: kid ? '' : GF.t('polish.pause.title'), big: '⏸️', body: '', actions: [
        { text: kid ? '' : GF.t('polish.pause.resume'), icon: 'play', cls: 'green', onclick: () => {} },
        { text: kid ? '' : GF.t('polish.pause.again'), icon: 'replay', cls: 'ghost', onclick: () => { GF.backHook = null; again && again(); } },
        { text: kid ? '' : GF.t('polish.pause.map'), icon: 'home', cls: 'ghost', onclick: leave }] });
      document.querySelectorAll('.uk-scrim:last-of-type .acts .uk-btn').forEach((b, i) => b.setAttribute('aria-label', ['resume', 'again', 'map'][i]));
      return true;
    };
  };
  P.finished = function () { fin = true; };
  /** 판 헤더 옆 별 목표 칩(성인) */
  P.goal = function (r, text) { if (P.kid || !text) return; const g = el('div', 'pol-goal', r, text); return g; };
  /** 결과 화면 「다음 목표」 한 줄: 다음 판의 장·판 종류, 장 끝이면 이야기 안내 */
  let nextTxt = '';
  P.setNext = (t) => { nextTxt = t || ''; };
  P.takeNext = () => { const t = nextTxt; nextTxt = ''; return t; };
  P.nextText = function (LV, D) {
    if (!LV || LV.kind || !D || !D.levels) return ''; const nx = D.levels.find((l) => l.id === LV.id + 1); if (!nx) return '';
    if (nx.chapter !== LV.chapter) return GF.t('polish.next.story');
    const nm = (D.types && D.types[nx.type]) || ''; const first = !D.levels.some((l) => l.id <= LV.id && l.type === nx.type);
    return GF.t('polish.next', { c: nx.chapter, title: (D.chapters && D.chapters[nx.chapter - 1]) || '' }) + (first && nm ? GF.t('polish.next.type', { type: nm }) : '');
  };
'''
if 'P.pause = ' not in s:
    s = s.replace("  /* ---------------- 설정 줄(ops.rows 가 부른다) ---------------- */", add + "\n  /* ---------------- 설정 줄(ops.rows 가 부른다) ---------------- */", 1)
p.write_text(s, encoding='utf-8')
# ---- gf.js: backHook ----
g = G / 'engine/gf.js'; t = g.read_text(encoding='utf-8')
if 'GF.backHook' not in t:
    t = t.replace("    if (GF.overlayOpen && GF.overlayOpen()) return true;\n    if (GF.stack.length <= 1) {", "    if (GF.overlayOpen && GF.overlayOpen()) return true;\n    if (GF.backHook && GF.backHook()) return true;   // 판 중 일시정지 메뉴(polish.js)\n    if (GF.stack.length <= 1) {", 1)
    t = t.replace("  function show(name, params) {\n", "  function show(name, params) {\n    GF.backHook = null;   // 화면이 바뀌면 뒤로가기 가로채기 해제(판 화면이 다시 등록)\n", 1)
    assert 'GF.backHook = null' in t; g.write_text(t, encoding='utf-8')
# ---- ads.js: 결과에 다음 목표 한 줄 ----
a = G / 'engine/ads.js'; u = a.read_text(encoding='utf-8')
if 'takeNext' not in u:
    old = "    const sc = _result.call(UK, o), h = A.resultHook; A.resultHook = null;"
    assert old in u
    u = u.replace(old, old + "\n    try { const nt = GF.polish && GF.polish.takeNext && GF.polish.takeNext(); if (nt && sc && !A.isKid()) { const body = sc.querySelector('.body') || sc.querySelector('.uk-sheet'), anchor = sc.querySelector('.acts'); const p2 = document.createElement('p'); p2.className = 'pol-next'; p2.textContent = nt; (anchor && anchor.parentNode ? anchor.parentNode : body).insertBefore(p2, anchor || null); } } catch (e) {}   // 결과 「다음 목표」 한 줄", 1)
    a.write_text(u, encoding='utf-8')
# ---- 앱 훅 ----
CFG = {'merge': ('mplay', "{ n: LV.stars ? LV.stars[1] : 0 }"), 'spot': ('pplay', "{}"), 'block': ('bplay', "{ n: LV.s3 }"), 'sort': ('splay', "{ n: (LV.par || 0) + 4 }"), 'tile': ('tplay', "{}")}
for app, (pl, vars_) in CFG.items():
    f = G / app / f'{app}.js'; v = f.read_text(encoding='utf-8')
    if 'GF.polish.pause' not in v:
        v = v.replace("GF.tale.level(r, LV);", "GF.tale.level(r, LV); GF.polish.pause(r, () => GF.replace('" + pl + "', LV.kind ? { level: LV } : { n: LV.id })); GF.polish.goal(r, GF.t('polish.goal." + app + "', " + vars_ + "));", 1)
        v = v.replace("GF.tale.done(r, LV, () => result(st));", "GF.polish.finished(); GF.polish.setNext(GF.polish.nextText(LV, D)); GF.tale.done(r, LV, () => result(st));", 1)
        assert 'GF.polish.pause' in v and 'GF.polish.finished' in v, app
        f.write_text(v, encoding='utf-8')
d = G / 'day/day.js'; w = d.read_text(encoding='utf-8')
if 'GF.polish.pause' not in w:
    w = w.replace("ACT[LV.type](); GF.tale.level(r, LV);", "ACT[LV.type](); GF.tale.level(r, LV); GF.polish.pause(r, () => GF.replace('dplay', LV.kind ? { level: LV } : { n: LV.id }));", 1)
    w = w.replace("GF.tale.done(r, LV, result);", "GF.polish.finished(); GF.tale.done(r, LV, result);", 1)
    assert 'GF.polish.pause' in w and 'GF.polish.finished' in w; d.write_text(w, encoding='utf-8')
# ---- CSS ----
c = G / 'engine/extras.css'; y = c.read_text(encoding='utf-8')
if '.pol-goal' not in y:
    y += "\n.pol-goal { position: absolute; right: 10px; top: 96px; z-index: 6; padding: 3px 10px; border-radius: 12px; background: rgba(255,255,255,.92); box-shadow: var(--uk-sh); font: 800 calc(12px * var(--uk-fs-k, 1))/1.3 var(--uk-font); color: #8A6A00; pointer-events: none; max-width: 70%; text-align: right; }\n.pol-next { margin: 6px 12px 0; font: 700 var(--uk-fs-cap)/1.4 var(--uk-font); color: var(--uk-ink2); text-align: center; }\n"
    c.write_text(y, encoding='utf-8')
# ---- 문자열 ----
b = pathlib.Path('tools/ops_build.py'); z = b.read_text(encoding='utf-8')
add_s = """    'polish.pause.title': '잠깐 쉬어요', 'polish.pause.resume': '계속', 'polish.pause.again': '다시', 'polish.pause.map': '지도로',
    'polish.goal.merge': '★★★ · 조각 {n}개 남기기', 'polish.goal.spot': '★★★ · 힌트 없이, 틀린 곳 3번 이하', 'polish.goal.block': '★★★ · 조각 {n}개 이하', 'polish.goal.sort': '★★★ · {n}번 이하로 옮기기', 'polish.goal.tile': '★★★ · 되돌리기·섞기·힌트 없이',
    'polish.next': '다음 · {c}장 {title}', 'polish.next.type': ' · 새 판 종류: {type}', 'polish.next.story': '다음은 이야기가 이어져요',
"""
if "'polish.pause.title'" not in z:
    z = z.replace("    'ops.back.title':", add_s + "    'ops.back.title':", 1); b.write_text(z, encoding='utf-8')
print('ok')
