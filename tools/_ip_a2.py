import pathlib, re
G = pathlib.Path('games')
o = G / 'engine/ops.js'; s = o.read_text(encoding='utf-8')
# ---- 앨범의 이야기 카드 칸을 IP 카드(4장 퍼즐)로 교체 ----
a = s.index("    const cards = cardsDone();\n    if (cards.length) {"); b = s.index("    const ev = (c.calendar && c.calendar()) || []; if (ev.length) sec(GF.t('ops.album.season')")
new_cards = r"""    I_cards(body, sec, false);
"""
s = s[:a] + new_cards + s[b:]
# ---- 새 UI 함수들 ----
ui = r'''
  /* ---------------- IP 층 UI: 이야기 카드 · 도장책 · 가족 코드 · 유아 도장판 ---------------- */
  const GP = () => (GF.ip && GF.ip.ready ? GF.ip : null), ipD = () => (GF.data && GF.data.ops) || {};
  const appLabel = (a) => (ipD().appNames || {})[a] || a;
  /** 카드 퍼즐 목록: kid=true 면 글자 없이 이모지·점만 */
  function I_cards(body, sec, kid) {
    const I = GP(); if (!I) return; const g = I.kid ? 'kid' : 'adult', map = (ipD().cardMap || {})[g] || {}, tales = Object.keys(map), T = ipD().tales || {}; if (!tales.length) return;
    const done = tales.filter((t) => I.complete(t)).length; if (!kid) sec(GF.t('ops.album.cards') + ' ' + done + '/' + tales.length);
    const wrap = el('div', 'ops-cards', body);
    tales.forEach((t) => {
      const r = el('div', 'ops-card' + (I.complete(t) ? ' ok' : ''), wrap); el('span', 'ic', r, (T[t] || {}).icon || '📖'); if (!kid) el('b', '', r, (T[t] || {}).title || t);
      const dots = el('span', 'dots', r); for (let i = 0; i < 4; i++) el('i', I.hasCard(t, i) ? 'on' : '', dots);
      if (!kid) { const miss = [0, 1, 2, 3].filter((i) => !I.hasCard(t, i)).map((i) => I.cardApp(t, i)).filter((x, i, ar) => x && ar.indexOf(x) === i && x !== (O.app)); if (I.complete(t)) el('small', '', r, '✔'); else if (miss.length) el('small', '', r, miss.map(appLabel).join(' · ')); }
    });
    if (!kid) el('p', 'xt-p', body, GF.t('ops.album.cardnote'));
  }
  O.openCards = function () { const { body } = sheet(GF.t('ops.album.cards')); I_cards(body, () => {}, O.kid); };
  O.openPassport = function () {
    const I = GP(); if (!I) return; const { body } = sheet(GF.t('ops.pass.title')), g = I.kid ? 'kid' : 'adult', apps = (ipD().apps || {})[g] || [];
    const row = (a) => { const r = el('div', 'ops-pass' + (a === O.app ? ' me' : ''), body); el('b', '', r, I.kid ? '' : appLabel(a)); const ds = el('span', 'dots', r); const have = I.stamps(a); ['first', 'a', 'b', 'end', 'story'].forEach((id) => el('i', have.includes(id) ? 'on' : '', ds)); return r; };
    apps.forEach((a) => { const r = row(a); if (I.kid) { const ic = el('span', 'ic', r, a === 'play' ? '🧸' : a === 'color' ? '🎨' : '🌞'); r.insertBefore(ic, r.firstChild); } });
    const pl = el('div', 'ops-plates', body); [['ribbon', '🎀'], ['sparkle', '✨'], ['crown', '👑']].forEach(([id, e]) => { const has = I.plates().includes(id); const c = el('span', has ? 'on' : '', pl, has ? e : '🔒'); if (!I.kid) el('small', '', c, GF.t('ops.ip.plate.' + id) + (has ? '' : ' · ' + I.plateNeed(id))); });
    if (!I.kid) {
      el('h4', 'xt-h', body, GF.t('ops.pass.more')); const n = O.native();
      apps.filter((a) => a !== O.app).forEach((a) => { const pkg = 'com.geometricfamily.' + (a === 'idle' ? 'tables' : a), r = el('div', 'ops-more', body); el('b', '', r, appLabel(a)); const inst = !!(n && n.hasApp && n.hasApp(pkg));
        if (n && n.openStore) { const b2 = el('button', 'xt-btn', r, inst ? GF.t('ops.pass.open') : GF.t('ops.pass.store')); b2.onclick = () => { try { inst ? n.launch(pkg) : n.openStore(pkg); } catch (e) {} }; } });
      el('p', 'xt-p', body, GF.t('ops.pass.note'));
    }
  };
  O.openFamilyCode = function () {
    const I = GP(); if (!I) return; const { body } = sheet(GF.t('ops.fam.title')); el('p', 'xt-p', body, GF.t('ops.fam.note'));
    const out = el('textarea', 'ops-code', body); out.readOnly = true; out.rows = 3; out.style.display = 'none';
    UK.btn({ text: GF.t('ops.fam.make'), cls: 'sky block', onclick: () => { out.value = I.makeFamilyCode(); out.style.display = 'block'; out.select(); } }, body);
    el('h4', 'xt-h', body, GF.t('ops.fam.paste')); const inp = el('textarea', 'ops-code', body); inp.rows = 3; const msg = el('p', 'xt-p', body, '');
    UK.btn({ text: GF.t('ops.fam.apply'), cls: 'ghost block', onclick: () => { const r = I.applyFamilyCode(inp.value); msg.textContent = r.ok ? GF.t('ops.fam.ok') : GF.t('ops.fam.bad'); } }, body);
  };
'''
if 'O.openPassport' not in s:
    s = s.replace("  /* ---------------- 앨범:", ui + "\n  /* ---------------- 앨범:", 1)
# 앨범 함수 안에서 I_cards 를 쓰므로 함수 선언 순서 무관(함수 선언문). 설정 줄 추가
if "ops.settings.passport" not in s:
    s = s.replace("      row(GF.t('ops.settings.album'), tb(GF.t('common.view'), () => { sc.close(); O.openAlbum(); }));\n    }", "      row(GF.t('ops.settings.album'), tb(GF.t('common.view'), () => { sc.close(); O.openAlbum(); }));\n      row(GF.t('ops.settings.passport'), tb(GF.t('common.view'), () => { sc.close(); O.openPassport(); }));\n    }\n    if (kid && GP()) { row(GF.t('ops.settings.kidbook'), tb(GF.t('common.view'), () => { sc.close(); O.openPassport(); })); row(GF.t('ops.settings.cards'), tb(GF.t('common.view'), () => { sc.close(); O.openCards(); })); }\n    if (GP()) row(GF.t('ops.settings.family'), tb(GF.t('common.view'), () => { sc.close(); O.openFamilyCode(); }));", 1)
o.write_text(s, encoding='utf-8')
# ---- room.js: 문패 장식 ----
r = G / 'engine/room/room.js'; t = r.read_text(encoding='utf-8')
if 'rm-deco' not in t:
    old = "d.style.background = T.bg; d.style.borderColor = T.color; return d;"
    assert old in t
    t = t.replace(old, "d.style.background = T.bg; d.style.borderColor = T.color; try { const pl = (window.GF && GF.ip && GF.ip.ready) ? GF.ip.plates() : []; if (pl.length) el('i', 'rm-deco', d, pl.map((x) => ({ ribbon: '🎀', sparkle: '✨', crown: '👑' }[x] || '')).join('')); } catch (e) {} return d;", 1); r.write_text(t, encoding='utf-8')
# ---- CSS ----
c = G / 'engine/extras.css'; y = c.read_text(encoding='utf-8')
if '.ops-card ' not in y:
    y += """
.ops-cards { display: flex; flex-direction: column; gap: 5px; max-height: 330px; overflow-y: auto; touch-action: pan-y; } .ops-card { display: flex; align-items: center; gap: 8px; padding: 5px 10px; border-radius: 12px; background: #fff; box-shadow: var(--uk-sh); text-align: left; } .ops-card.ok { background: #FFF0B8; } .ops-card .ic { font-size: 24px; } .ops-card b { flex: 1; font: 800 var(--uk-fs-cap)/1.2 var(--uk-font); } .ops-card small { font: 700 calc(11px * var(--uk-fs-k, 1))/1.2 var(--uk-font); color: var(--uk-ink2); max-width: 40%; text-align: right; }
.ops-card .dots, .ops-pass .dots { display: flex; gap: 4px; } .ops-card .dots i, .ops-pass .dots i { width: 12px; height: 12px; border-radius: 50%; background: #E2D8DE; display: block; } .ops-card .dots i.on, .ops-pass .dots i.on { background: #FFC933; }
.ops-pass { display: flex; align-items: center; gap: 10px; margin: 4px 0; padding: 7px 12px; border-radius: 12px; background: #fff; box-shadow: var(--uk-sh); } .ops-pass.me { outline: 3px solid #6CCB8A; } .ops-pass b { flex: 1; text-align: left; font: 800 var(--uk-fs-cap)/1.2 var(--uk-font); } .ops-pass .ic { font-size: 28px; }
.ops-plates { display: flex; justify-content: center; gap: 14px; margin: 10px 0; } .ops-plates span { display: flex; flex-direction: column; align-items: center; min-width: 64px; padding: 8px; border-radius: 14px; background: #EDE7DD; font-size: 28px; } .ops-plates span.on { background: #FFF0B8; } .ops-plates small { font: 700 12px/1.2 var(--uk-font); color: var(--uk-ink2); }
.ops-more { display: flex; align-items: center; justify-content: space-between; margin: 4px 0; padding: 6px 12px; border-radius: 12px; background: #fff; box-shadow: var(--uk-sh); } .ops-more b { font: 800 var(--uk-fs-cap)/1.2 var(--uk-font); }
.rm-deco { position: absolute; right: 4px; top: -10px; font-style: normal; font-size: 18px; filter: drop-shadow(0 1px 0 #fff); }
"""
    c.write_text(y, encoding='utf-8')
# ---- 문자열 ----
b = pathlib.Path('tools/ops_build.py'); z = b.read_text(encoding='utf-8')
if "'ops.pass.title'" not in z:
    z = z.replace("STR.update({'ops.ip.share'", """STR.update({'ops.pass.title': '기하학 가족 도장책', 'ops.pass.more': '다른 기하학 가족 게임', 'ops.pass.open': '열기', 'ops.pass.store': '스토어에서 보기', 'ops.pass.note': '같은 기기에 함께 있으면 집과 이야기 카드가 이어져요. 하지 않아도 괜찮아요.',
            'ops.settings.passport': '도장책', 'ops.settings.kidbook': '도장판', 'ops.settings.cards': '이야기 카드', 'ops.settings.family': '가족 코드', 'ops.album.cardnote': '카드는 여러 앱에서 한 장씩 모여요. 네 장이 모이면 집에 작은 소품이 놓여요.',
            'ops.fam.title': '가족 코드', 'ops.fam.note': '아이 앱과 어른 앱은 따로 모아요. 코드를 넣으면 이야기 카드·도장·카메오가 서로 합쳐져요. 꼭 하지 않아도 돼요.', 'ops.fam.make': '코드 만들기', 'ops.fam.paste': '코드 붙여넣기', 'ops.fam.apply': '합치기', 'ops.fam.ok': '합쳤어요!', 'ops.fam.bad': '코드가 올바르지 않아요.',
            'ops.ip.share'""", 1); b.write_text(z, encoding='utf-8')
print('ok')
