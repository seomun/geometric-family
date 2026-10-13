/* 「우리 집」 2.0 — 하우징 대개편 (games/26_HOUSING2.md, D24). 기존 Room(room.js)을 그대로 두고 위에 얹는다: 아늑함·집 레벨·집 이야기(할 일 3)·다음 목표·카탈로그(흐린 실물+출처)·위시·3/4 디오라마·생활 동작·손님·집에 놓기 카드.
   데이터: data/room_items.json(cozy·tags·style·color·src 추가) + data/housing.json(레벨표·방·장·손님). 저장은 기존 키(gf:house:adult|kid:v1)에 선택 필드만 덧붙인다(옛 앱이 읽어도 안 깨짐 · 병합은 합집합).
   보기 방식은 R2.view 슬롯: 지금은 「3/4 정면 디오라마」(정면 가구 + 접지 그림자 + 깊이 정렬), 아트 패스 때 아이소 그림으로 바꿀 수 있게 draw 함수 하나만 바꾼다. 유아(mode kid)는 글자 없이 그림·아이콘만. */
(function () {
  'use strict';
  const Room = window.Room; if (!Room) return;
  const el = (t, c, p, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; if (p) p.appendChild(e); return e; };
  const RW = 340, RH = 300, WALLH = 118, IS = 1.3;
  const APPICON = { merge: '✨', spot: '🔍', block: '🧱', sort: '🗄️', tile: '🀄', day: '☀️', idle: '🍲', quiz: '❓', color: '🖍️', playground: '🎠', story: '📖', event: '🎉', other: '🎁' };
  const APPNAME = { merge: '합치기', spot: '틀린 그림', block: '블록', sort: '정리', tile: '짝 맞추기', day: '막둥이의 하루', idle: '세 가족 식탁', quiz: '어느 도형', color: '색칠북', playground: '놀이터', story: '이야기 카드', event: '이벤트' };
  const EMOTE = { sit: '💛', eat: '🍚', read: '📖', sleep: '💤', play: '🎵', watch: '👀' };
  const R2 = (Room.v2 = { view: 'diorama' });
  const kid = () => Room.cfg.mode === 'kid', grp = () => (kid() ? 'kid' : 'adult');
  const ensure = () => { const S = Room.S; if (!S) return null; S.story = S.story || {}; S.wish = S.wish || []; S.guests = S.guests || {}; S.light = S.light || 'day'; S.lv = S.lv || 1; return S; };
  const H = () => Room.H;
  const orig = Room.init;
  Room.init = function (o) { const r = orig.call(Room, o); Room.H = (o && o.housing) || Room.H || null; ensure(); return r; };
  Room.refresh2 = ensure;

  /* ---------------- 계산: 아늑함 · 레벨 · 방 ---------------- */
  const rooms = () => ((H() && H().rooms) || []).filter((r) => r.group === grp());
  const sets = () => Room.data.sets;
  const setSize = (id) => Room.data.items.filter((i) => i.set === id).length;
  Room.roomCozy = function (rid) {
    const S = ensure(), list = (S && S.placed[rid]) || [], f = (H() && H().formula) || { set: [[3, 0.1], [5, 0.25], ['all', 0.6]], harmony: 30, style: 30, fill: 40, life: 20 }, R = rooms().find((r) => r.id === rid);
    const its = list.map((p) => Room.item(p.id)).filter(Boolean); let base = 0, bonus = 0; const bySet = {};
    its.forEach((i) => { base += i.cozy || 0; (bySet[i.set] = bySet[i.set] || []).push(i); });
    Object.keys(bySet).forEach((sid) => { const n = new Set(bySet[sid].map((i) => i.id)).size, sum = bySet[sid].reduce((a, i) => a + (i.cozy || 0), 0); let pct = 0; f.set.forEach(([k, p]) => { if ((k === 'all' ? n >= setSize(sid) : n >= k)) pct = Math.max(pct, p); }); bonus += sum * pct; });
    const cnt = (key) => its.reduce((m, i) => { m[i[key]] = (m[i[key]] || 0) + 1; return m; }, {});
    const harmony = Object.values(cnt('color')).some((n) => n >= 4) ? f.harmony : 0, style = Object.values(cnt('style')).some((n) => n >= 6) ? f.style : 0;
    const anchors = (R && R.anchors) || [], filled = anchors.filter((a) => list.some((p) => p.id === a.want)).length, fill = anchors.length ? Math.round(filled / anchors.length * f.fill) : 0;
    const life = new Set(its.flatMap((i) => i.tags || [])).size >= 3 ? f.life : 0;
    return { total: Math.round(base + bonus + harmony + style + fill + life), base, bonus: Math.round(bonus), harmony, style, fill, life, pct: anchors.length ? Math.round(filled / anchors.length * 100) : 0, n: its.length };
  };
  const chapters = () => ((H() && H().story) || []).filter((s) => s.group === grp()).sort((a, b) => a.ch - b.ch);
  const chDone = (c) => !!(ensure().story[c.room] && ensure().story[c.room].done);
  Room.cozy = function () { const S = ensure(); if (!S || !H()) return 0; let t = rooms().reduce((a, r) => a + Room.roomCozy(r.id).total, 0); chapters().forEach((c) => { if (chDone(c)) t += (c.reward && c.reward.cozy) || 0; }); return t; };
  const table = () => { const L = ((H() && H().levels) || []).slice(); return kid() ? L.filter((l) => l.lv <= 20) : L; };
  Room.level = function (cozy) { const c = cozy == null ? Room.cozy() : cozy; let lv = 1; table().forEach((l) => { if (c >= l.cozy) lv = l.lv; }); return lv; };
  Room.levelInfo = function () { const c = Room.cozy(), T = table(), lv = Room.level(c), cur = T.find((l) => l.lv === lv), nx = T.find((l) => l.lv === lv + 1); return { lv, cozy: c, cur: cur ? cur.cozy : 0, next: nx ? nx.cozy : null, pct: nx ? Math.min(1, (c - cur.cozy) / (nx.cozy - cur.cozy)) : 1, max: !nx }; };
  const unlocked = (r) => Room.level() >= (r.unlock || 1) || ((ensure().placed[r.id] || []).length > 0);
  Room.unlockedRooms = () => rooms().filter(unlocked);

  /* ---------------- 집 이야기 · 할 일 · 다음 목표 ---------------- */
  Room.chapter = () => chapters().find((c) => !chDone(c)) || null;
  Room.tasks = function () {
    const c = Room.chapter(); if (!c) return { chapter: null, list: [], show: [], done: 0 };
    const list = c.tasks.map((t) => { const need = t.need.map((id) => ({ id, own: Room.has(id), it: Room.item(id) })), miss = need.filter((n) => !n.own); return { id: t.id, label: t.label, need, done: !miss.length, miss: miss[0] || null }; });
    return { chapter: c, list, show: list.filter((t) => !t.done).slice(0, 3), done: list.filter((t) => t.done).length };
  };
  Room.wishOn = (id) => ensure().wish.includes(id);
  Room.wish = function (id) { const S = ensure(), i = S.wish.indexOf(id); if (i >= 0) S.wish.splice(i, 1); else S.wish.push(id); Room.save(); };
  /** 다음 목표 한 개: 위시 ♥ → 지금 할 일 → 세트 완성에 가까운 것 */
  Room.nextGoal = function (app) {
    const S = ensure(); if (!S || !H()) return null; const mk = (id, label, why) => { const it = Room.item(id); if (!it) return null; return { id, item: it, label: label || it.name, why, src: it.src || {}, game: (it.src && it.src.game) || it.game, hint: (it.src && it.src.hint) || '' }; };
    for (const id of S.wish) if (!Room.has(id)) return mk(id, null, 'wish');
    const T = Room.tasks(); if (T.show.length) { const t = T.show.slice().sort((a, b) => ((a.miss.it.src && a.miss.it.src.game === app) ? 0 : 1) - ((b.miss.it.src && b.miss.it.src.game === app) ? 0 : 1))[0]; return mk(t.miss.id, t.label, 'task'); }
    let best = null; sets().forEach((s) => { const its = Room.data.items.filter((i) => i.set === s.id && Room.visibleSet(i)), got = its.filter((i) => Room.has(i.id)).length; if (its.length && got < its.length && (!best || its.length - got < best.left)) best = { id: its.find((i) => !Room.has(i.id)).id, left: its.length - got }; });
    return best ? mk(best.id, null, 'set') : null;
  };
  Room.goApp = function (game, opts) {
    opts = opts || {}; const app = Room.cfg.app || Room.cfg.game; const map = { tables: 'idle', coloring: 'color', playground: 'playground' }; const g = map[game] || game;
    if (g === app || g === 'story' || g === 'event' || g === 'other') { if (opts.home) opts.home(); else if (Room.cfg.home) Room.cfg.home(); return 'same'; }
    if (kid()) { UK.toast('', opts.parent); return 'kid'; }            // 유아 앱: 다른 앱을 열지 않는다(KIDS_COMPLIANCE) — 그림으로만 알려 준다
    const pkg = 'com.geometricfamily.' + (g === 'idle' ? 'tables' : g === 'playground' ? 'toddler' : g), n = window.GFOps;
    try { if (n && n.hasApp && n.hasApp(pkg)) { n.launch(pkg); return 'launch'; } if (n && n.openStore) { n.openStore(pkg); return 'store'; } } catch (e) { /* 네이티브 없음(웹) */ }
    UK.toast('「' + (APPNAME[g] || g) + '」 앱에서 얻어요', opts.parent); return 'web';
  };
  /** 다음 목표 띠 — 모든 앱 홈·결과 화면에 한 줄 */
  Room.band = function (parent, opts) {
    opts = opts || {}; const old = parent.querySelector(':scope > .h2-band'); if (old) old.remove(); if (!H() || !Room.S) return null;
    const g = Room.nextGoal(Room.cfg.app || Room.cfg.game); if (!g) return null; const b = el('button', 'h2-band' + (kid() ? ' kid' : ''), parent);
    const im = el('img', '', b); im.src = Room.src(g.item); im.alt = ''; const ic = APPICON[g.game] || '🎁';
    if (kid()) { el('span', 'h2-bic', b, ic); el('span', 'h2-arrow', b, UK.icon('next')); } else { const tx = el('span', 'h2-btx', b); el('small', '', tx, g.why === 'wish' ? '♥ 위시' : '다음 목표'); el('b', '', tx, g.label + ' · ' + g.hint); el('span', 'h2-arrow', b, UK.icon('next')); }
    b.setAttribute('aria-label', 'next goal'); b.onclick = (e) => { e.stopPropagation(); Room.goApp(g.game, { parent: opts.toastParent || parent, home: opts.go }); }; return b;
  };

  /* ---------------- 놓기 ---------------- */
  Room.placeAt = function (id) {
    const it = Room.item(id), S = ensure(); if (!it) return null; const open = Room.unlockedRooms();
    for (const r of open) { const a = (r.anchors || []).find((q) => q.want === id); if (a && !(S.placed[r.id] || []).some((p) => p.id === id)) { Room.removeEverywhere(id); const L = Room.placedIn(r.id); L.push({ id, x: Math.round(Math.max(4, Math.min(RW - it.w * IS - 4, a.x - it.w * IS / 2))), y: Math.round(a.y - it.h * IS), flip: 0, c: it.colors[0] }); Room.save(); return { room: r.id, anchor: a }; } }
    const r = open.find((x) => x.id === it.room) || open[0]; if (!r) return null; if (Object.values(S.placed).some((L) => L.some((p) => p.id === id))) return { room: r.id, already: true };
    const L = Room.placedIn(r.id), k = L.length; L.push({ id, x: 24 + ((k * 61) % (RW - it.w * IS - 40)), y: (it.slot === 'wall' ? 30 + (k % 3) * 10 : 190 + (k % 3) * 22) - (it.slot === 'wall' ? 0 : it.h * IS) + (it.slot === 'wall' ? 0 : 60), flip: 0, c: it.colors[0] }); Room.save(); return { room: r.id };
  };
  Room.removeEverywhere = (id) => { const S = ensure(); Object.keys(S.placed).forEach((rid) => { S.placed[rid] = S.placed[rid].filter((p) => p.id !== id); }); };
  // 얻자마자 점선 칸/방으로(autoPlace 를 2.0 규칙으로 바꾼다)
  const grant0 = Room.grant;
  Room.grant = function (id) {
    const had = Room.has(id), auto = Room.cfg.autoPlace; Room.cfg.autoPlace = false; let r; try { r = grant0.call(Room, id); } finally { Room.cfg.autoPlace = auto; }
    if (r && auto && H()) { Room.placeAt(id); } else if (r && auto) { Room.place(id, (Room.item(id) || {}).room); } void had; return r;
  };
  /** 결과 화면: 새 가구 — 큰 그림 + 놓을 방 미리보기 + 「집에 놓기」가 주인공 */
  Room.dropCard = function (id, parent, cb, opts) {
    opts = opts || {}; const it = Room.item(id); if (!it || !parent) { cb && cb(); return null; } const sc = el('div', 'uk-scrim h2-drop', ovRoot(parent)), sh = el('div', 'uk-sheet', sc);
    const before = Room.levelInfo(), pos = H() ? Room.placeAt(id) : null, after = Room.levelInfo(); void pos;
    el('div', 'h2-drop-big', sh).appendChild(Object.assign(document.createElement('img'), { src: Room.src(it), alt: '' }));
    if (!kid()) { el('h2', '', sh, it.name); el('p', 'h2-cozy', sh, '아늑함 +' + (it.cozy || 0)); } else el('p', 'h2-cozy', sh, '★ +' + (it.cozy || 0));
    const g = pos && pos.room ? rooms().find((r) => r.id === pos.room) : null; if (g) { const pv = el('div', 'h2-drop-pv', sh); R2.draw(pv, g.id, { mini: true, flash: id }); if (!kid()) el('small', '', sh, g.name + '에 놓였어요'); }
    if (after.lv > before.lv) { el('p', 'h2-lvup', sh, kid() ? '⭐ ' + after.lv : '집 레벨 ' + after.lv + '!'); try { UK.confetti(sc); } catch (e) {} S2().lv = after.lv; Room.save(); }
    const acts = el('div', 'acts', sh); UK.btn({ text: kid() ? null : '집에 놓기', icon: kid() ? 'home' : null, cls: 'green block', onclick: () => { sc.remove(); opts.openHouse ? opts.openHouse() : (cb && cb()); } }, acts);
    if (!kid()) UK.btn({ text: '나중에', cls: 'ghost sm', onclick: () => { sc.remove(); cb && cb(); } }, acts); else UK.btn({ icon: 'next', cls: 'ghost sm', onclick: () => { sc.remove(); cb && cb(); } }, acts);
    try { GF.sfx && GF.sfx('star'); } catch (e) {} return sc;
  };
  const S2 = ensure;
  const ovRoot = (parent) => (parent && parent.closest && parent.closest('.screen')) || document.getElementById('safe') || parent;   // 팝업은 스크롤하는 안쪽이 아니라 화면 루트에 붙인다

  /* ---------------- 방 그리기 (보기 슬롯: 3/4 정면 디오라마) ---------------- */
  const bgSVG = (R, light) => {
    const wall = R.wall, fl = R.floor, eve = light === 'eve', sky = eve ? '#F7B27A' : '#BFE6FF', lines = []; for (let i = -4; i <= 12; i++) lines.push(`<path d="M170 ${WALLH - 70}L${i * 30 + 5} ${RH}" stroke="rgba(0,0,0,.07)" stroke-width="2"/>`);
    for (let k = 0; k < 6; k++) lines.push(`<path d="M0 ${WALLH + 6 + k * k * 4.6}H${RW}" stroke="rgba(0,0,0,.06)" stroke-width="2"/>`);
    return `<svg viewBox="0 0 ${RW} ${RH}" width="${RW}" height="${RH}"><rect width="${RW}" height="${WALLH}" fill="${wall}"/><rect x="0" y="${WALLH - 8}" width="${RW}" height="8" fill="rgba(0,0,0,.12)"/><rect x="198" y="18" width="94" height="62" rx="8" fill="${sky}" stroke="#fff" stroke-width="6"/><path d="M245 18v62M198 49h94" stroke="#fff" stroke-width="4"/><circle cx="222" cy="36" r="9" fill="${eve ? '#FFD27A' : '#fff'}" opacity=".85"/><rect y="${WALLH}" width="${RW}" height="${RH - WALLH}" fill="${fl}"/>${lines.join('')}<rect y="${WALLH}" width="${RW}" height="16" fill="rgba(0,0,0,.06)"/></svg>`;
  };
  /** parent 안에 방 하나를 그린다. o: {mini, place(놓기 모드), flash(강조할 가구 id), onChange} → 반환 {redraw} */
  R2.draw = function (parent, rid, o) {
    o = o || {}; const R = rooms().find((r) => r.id === rid) || rooms()[0], S = ensure(); if (!R) return null;
    const wrap = el('div', 'h2-wrap' + (o.mini ? ' mini' : ''), parent), room = el('div', 'h2-room' + (S.light === 'eve' ? ' eve' : ''), wrap); wrap.__room = room;
    const fit = () => { const w = wrap.clientWidth || parent.clientWidth || RW, k = Math.min(1.25, w / RW); room.style.transform = `scale(${k})`; wrap.style.height = Math.round(RH * k) + 'px'; room.__k = k; }; setTimeout(fit, 0);
    const bg = el('div', 'h2-bg', room, bgSVG(R, S.light)); void bg;
    const list = (S.placed[R.id] || []), tk = Room.tasks(); const wantNow = new Set(tk.show.map((t) => t.miss && t.miss.id));
    // 점선 칸: 아직 비어 있는 anchors (할 일에 걸린 것 우선, 최대 3개)
    const empty = (R.anchors || []).filter((a) => !list.some((p) => p.id === a.want)).sort((a, b) => (wantNow.has(b.want) ? 1 : 0) - (wantNow.has(a.want) ? 1 : 0)).slice(0, o.mini ? 1 : 3);
    empty.forEach((a) => { const it = Room.item(a.want); if (!it) return; const w = it.w * IS, h = it.h * IS, d = el('div', 'h2-anchor' + (Room.has(a.want) ? ' have' : ''), room); d.style.cssText = `left:${Math.max(4, Math.min(RW - w - 4, a.x - w / 2))}px;top:${a.y - h}px;width:${w}px;height:${h}px`; const im = el('img', '', d); im.src = Room.src(it); im.alt = ''; if (!kid() && !o.mini) el('em', '', d, '여기에 ' + it.name.replace(/^(도형 블록|네모|세모|동그라미) /, '')); if (Room.has(a.want) && !o.mini) d.onclick = () => { Room.placeAt(a.want); o.onChange && o.onChange(); }; });
    const order = list.map((p, i) => ({ p, i, it: Room.item(p.id) })).filter((q) => q.it).sort((a, b) => (a.p.y + a.it.h * IS) - (b.p.y + b.it.h * IS));
    order.forEach(({ p, i, it }) => {
      const w = it.w * IS, h = it.h * IS; if (it.slot !== 'wall') { const sh = el('i', 'h2-sh', room); sh.style.cssText = `left:${p.x + w * 0.1}px;top:${p.y + h - 6}px;width:${w * 0.8}px`; }
      const d = el('img', 'h2-it' + (o.flash === p.id ? ' flash' : ''), room); d.src = Room.src(it, p.c); d.alt = ''; d.draggable = false; d.style.cssText = `left:${p.x}px;top:${p.y}px;width:${w}px;height:${h}px${p.flip ? ';transform:scaleX(-1)' : ''}`; d.dataset.i = i;
      if (o.mini) return;
      if (o.place) d.addEventListener('pointerdown', (e) => {
        e.preventDefault(); o.sel = i; room.querySelectorAll('.h2-it').forEach((x) => x.classList.remove('sel')); d.classList.add('sel'); o.onSel && o.onSel(i); const k = room.__k || 1, rc = room.getBoundingClientRect(), ox = (e.clientX - rc.left) / k - p.x, oy = (e.clientY - rc.top) / k - p.y; try { d.setPointerCapture(e.pointerId); } catch (x) {}
        const mv = (ev) => { p.x = Math.max(0, Math.min(RW - w, Math.round(((ev.clientX - rc.left) / k - ox) / 4) * 4)); p.y = Math.max(0, Math.min(RH - h, Math.round(((ev.clientY - rc.top) / k - oy) / 4) * 4)); d.style.left = p.x + 'px'; d.style.top = p.y + 'px'; };
        const up = () => { d.removeEventListener('pointermove', mv); d.removeEventListener('pointerup', up); Room.save(); o.onChange && o.onChange(true); };
        d.addEventListener('pointermove', mv); d.addEventListener('pointerup', up);
      }); else d.addEventListener('pointerup', () => use(room, d, it, p));
    });
    return { room, wrap, redraw() { wrap.remove(); } };
  };
  function use(room, d, it, p) {          // 가구 탭 = 그 가구를 쓰는 동작(짧은 말풍선 + 통통)
    d.classList.remove('use'); void d.offsetWidth; d.classList.add('use'); const t = (it.tags || [])[0]; try { GF.sfx && GF.sfx('tap'); } catch (e) {} if (!t) return;
    const b = el('i', 'h2-emote', room, EMOTE[t] || '✨'); b.style.cssText = `left:${p.x + it.w * IS / 2}px;top:${p.y - 6}px`; setTimeout(() => b.remove(), 1400);
  }

  /* ---------------- 집 메인 화면 ---------------- */
  Room.house2 = function (parent, opts) {
    opts = opts || {}; Room.mount = parent; parent.innerHTML = ''; parent.classList.add('rm', 'h2');
    const S = ensure(), RL = rooms(); if (!RL.length) return Room.house(parent, opts);
    let cur = (opts.room && RL.find((r) => r.id === opts.room) && opts.room) || (RL.find((r) => unlocked(r)) || RL[0]).id, place = false, sel = null, walker = null;
    const top = el('div', 'h2-top', parent), nav = el('div', 'h2-nav', parent), stage = el('div', 'h2-stage', parent), prog = el('div', 'h2-prog', parent), tasks = el('div', 'h2-tasks', parent), tools = el('div', 'h2-tools', parent), selbar = el('div', 'h2-selbar', parent);
    function drawTop() {
      top.innerHTML = ''; const L = Room.levelInfo(); const pill = el('div', 'h2-lv', top, kid() ? `<b>⭐ ${Math.max(1, Math.ceil(L.lv / 2))}</b>` : `<b>Lv ${L.lv}</b><span>아늑함 ${L.cozy}</span>`); const bw = el('div', 'h2-barw', top); el('div', 'h2-bar', bw, `<i style="width:${Math.round(L.pct * 100)}%"></i>`); void pill;
      if (!kid() && !L.max) el('small', 'h2-nx', bw, 'Lv ' + (L.lv + 1) + '까지 ' + (L.next - L.cozy));
      const lt = el('button', 'h2-ic', top, S.light === 'eve' ? '🌙' : '☀️'); lt.setAttribute('aria-label', 'light'); lt.onclick = () => { S.light = S.light === 'eve' ? 'day' : 'eve'; Room.save(); drawAll(); };
    }
    function drawNav() {
      nav.innerHTML = ''; const idx = RL.findIndex((r) => r.id === cur), R = RL[idx]; const go = (d) => { let j = idx + d; if (j < 0 || j >= RL.length) return; cur = RL[j].id; drawAll(); };
      const l = el('button', 'h2-ar', nav, '◀'); l.onclick = () => go(-1); l.disabled = idx === 0; el('b', '', nav, kid() ? '' : R.name + (unlocked(R) ? '' : ' 🔒'));
      const r = el('button', 'h2-ar', nav, '▶'); r.onclick = () => go(1); r.disabled = idx === RL.length - 1; const dots = el('div', 'h2-dots', nav); RL.forEach((q) => el('i', (q.id === cur ? 'on ' : '') + (unlocked(q) ? '' : 'lock'), dots));
    }
    function drawStage() {
      stage.innerHTML = ''; clearTimeout(walker); const R = RL.find((r) => r.id === cur);
      if (!unlocked(R)) { const lk = el('div', 'h2-locked', stage); el('div', 'h2-lkic', lk, '🔒'); if (!kid()) el('p', '', lk, '집 레벨 ' + R.unlock + '에 열려요'); else el('p', '', lk, '⭐ ' + Math.ceil(R.unlock / 2)); return; }
      const d = R2.draw(stage, cur, { place, sel, flash: opts.flash, onChange: (drag) => { if (!drag) { drawAll(); return; } afterChange(); }, onSel: (i) => { sel = i; drawSel(); } });
      if (!place) { guestCheck(d.room, R); walk(d.room, R); }
    }
    function afterChange() { drawTop(); drawProg(); drawTasks(); const L = Room.levelInfo(); if (L.lv > (S.lv || 1)) { S.lv = L.lv; Room.save(); lvUp(L); } }
    function lvUp(L) { try { UK.confetti(parent); GF.sfx && GF.sfx('celebrate'); } catch (e) {} const nr = rooms().find((r) => r.unlock === L.lv); UK.toast(kid() ? '⭐' : '집 레벨 ' + L.lv + '!' + (nr ? ' ' + nr.name + ' 열림' : ''), parent); }
    function drawProg() {
      prog.innerHTML = ''; const R = RL.find((r) => r.id === cur), c = Room.roomCozy(cur); if (!unlocked(R)) return;
      if (kid()) { const b = el('div', 'h2-bar wide', prog, `<i style="width:${c.pct}%"></i>`); void b; return; }
      el('span', '', prog, `방 완성도 <b>${c.pct}%</b>`); const sc = el('span', 'h2-sets', prog); const ids = []; (R.anchors || []).forEach((a) => { const it = Room.item(a.want); if (it && !ids.includes(it.set)) ids.push(it.set); }); const mine = ids.map((id) => Room.set(id)).filter(Boolean).slice(0, 2); mine.forEach((s) => { const its = Room.data.items.filter((i) => i.set === s.id), got = its.filter((i) => Room.has(i.id)).length; el('em', '', sc, `${s.name.replace(/ 세트.*/, '')} ${got}/${its.length}`); });
      el('span', 'h2-cz', prog, `이 방 아늑함 <b>${c.total}</b>`);
    }
    function drawTasks() {
      tasks.innerHTML = ''; const T = Room.tasks(); if (!T.chapter) { if (!kid()) el('p', 'h2-tt', tasks, '집 이야기를 모두 마쳤어요. 이제 마음껏 꾸며 보세요!'); return; }
      if (!kid()) el('p', 'h2-tt', tasks, `<b>${T.chapter.title}</b> <small>${T.done}/${T.list.length}</small>`); else el('p', 'h2-tt k', tasks, '<span>' + '★'.repeat(T.done) + '☆'.repeat(Math.max(0, T.list.length - T.done)) + '</span>');
      T.show.forEach((t) => { const it = t.miss.it, sr = (it && it.src) || {}, row = el('div', 'h2-task' + (kid() ? ' kid' : ''), tasks); const im = el('img', '', row); im.src = it ? Room.src(it) : ''; im.alt = '';
        if (kid()) { el('span', 'h2-tic', row, APPICON[sr.game] || '🎁'); const b = el('button', 'h2-go', row, UK.icon('next')); b.setAttribute('aria-label', 'go'); b.onclick = () => Room.goApp(sr.game, { parent, home: opts.go && (() => opts.go(sr.game)) }); }
        else { const tx = el('div', 'h2-ttx', row); el('b', '', tx, t.label); el('small', '', tx, sr.hint || ''); const b = el('button', 'h2-go', row, '어디서? ▶'); b.onclick = () => Room.goApp(sr.game, { parent, home: opts.go && (() => opts.go(sr.game)) }); } });
      if (!T.show.length) el('p', 'h2-tt', tasks, kid() ? '' : '이 장의 가구를 다 모았어요!');
    }
    function drawTools() {
      tools.innerHTML = ''; const B = (txt, ic, cls, fn) => UK.btn({ text: kid() ? null : txt, icon: ic, cls: cls + ' sm', onclick: fn }, tools);
      B('카탈로그', 'gift', 'gold', () => Room.catalog(parent, { onClose: drawAll, go: opts.go })); B(place ? '다 놓았어요' : '놓기 모드', place ? 'check' : 'brush', place ? 'green' : 'sky', () => { place = !place; sel = null; drawAll(); }); B('사진', 'share', 'ghost', () => Room.photo(cur, parent));
    }
    function drawSel() {
      selbar.innerHTML = ''; if (!place) return; if (sel == null) { el('p', 'h2-hint', selbar, kid() ? '' : '가구를 끌어서 옮겨 보세요'); return; } const p = (S.placed[cur] || [])[sel], it = p && Room.item(p.id); if (!it) return;
      const B = (txt, ic, fn) => UK.btn({ text: kid() ? null : txt, icon: ic, cls: 'ghost sm', onclick: fn }, selbar);
      B('돌리기', 'replay', () => { p.flip = p.flip ? 0 : 1; Room.save(); drawStage(); drawSel(); }); B('색 바꾸기', 'brush', () => { const cs = it.colors; p.c = cs[(cs.indexOf(p.c) + 1) % cs.length]; Room.save(); drawStage(); drawSel(); }); B('치우기', 'close', () => { S.placed[cur].splice(sel, 1); sel = null; Room.save(); drawAll(); });
    }
    function walk(room, R) {           // 살아 있는 집: 가족이 가구를 돌아다니며 쓴다
      const char = R.char || (RL.find((r) => r.id === cur) || {}).char || (kid() ? 'baby.joy' : 'nemo_kids.kid1'); const g = el('img', 'h2-char', room); g.src = Room.cfg.charSrc ? Room.cfg.charSrc(char) : ''; g.alt = ''; g.style.cssText = 'left:20px;top:190px'; const p0 = (S.placed[cur] || []).map((p) => ({ p, it: Room.item(p.id) })).filter((q) => q.it && (q.it.tags || []).length && q.it.slot !== 'wall');
      const step = () => { if (!room.isConnected) return; const q = p0.length ? p0[Math.floor(Math.random() * p0.length)] : null, x = q ? q.p.x + q.it.w * IS / 2 - 24 : 20 + Math.random() * 240, y = q ? q.p.y + q.it.h * IS - 78 : 200; g.style.left = Math.max(0, Math.min(RW - 50, x)) + 'px'; g.style.top = Math.max(WALLH - 20, Math.min(RH - 80, y + 18)) + 'px'; if (q) setTimeout(() => { if (!room.isConnected) return; const b = el('i', 'h2-emote', room, EMOTE[q.it.tags[0]] || '✨'); b.style.cssText = `left:${parseFloat(g.style.left) + 22}px;top:${parseFloat(g.style.top) - 6}px`; setTimeout(() => b.remove(), 1500); }, 1700); walker = setTimeout(step, 4200); };
      walker = setTimeout(step, 1200);
    }
    function guestCheck(room, R) {       // 손님: 아늑함 문턱을 넘으면 와서 좋아하는 가구 앞에서 한마디, 선물은 확정
      const cz = Room.cozy(); const G = ((H() && H().guests) || []).filter((g) => g.group === grp() && !S.guests[g.id] && cz >= g.need); if (!G.length) return; const list = S.placed[cur] || [];
      const g = G.find((q) => q.likes.some((id) => list.some((p) => p.id === id))); if (!g) return; const lk = list.find((p) => g.likes.includes(p.id)), it = Room.item(lk.id); S.guests[g.id] = { seen: Date.now() }; Room.save();
      setTimeout(() => { if (!room.isConnected) return; const im = el('img', 'h2-guest', room); im.src = Room.cfg.charSrc ? Room.cfg.charSrc(g.char) : ''; im.alt = ''; im.style.cssText = `left:${Math.max(0, lk.x - 40)}px;top:${lk.y + it.h * IS - 86}px`;
        const line = g.lines.length ? g.lines[Math.floor(Math.random() * g.lines.length)] : '', bb = el('div', 'h2-bubble', room, kid() ? '💖' : line); bb.style.cssText = `left:${Math.max(4, lk.x - 20)}px;top:${Math.max(4, lk.y - 54)}px`;
        setTimeout(() => { if (Room.grant(g.gift)) { UK.toast(kid() ? '🎁' : '손님 선물 · ' + (Room.item(g.gift) || {}).name, parent); try { GF.sfx && GF.sfx('star'); } catch (e) {} } afterChange(); }, 2600); setTimeout(() => { im.remove(); bb.remove(); }, 4200); }, 900);
    }
    function drawAll() { drawTop(); drawNav(); drawStage(); drawProg(); drawTasks(); drawTools(); drawSel(); }
    Room._redraw = () => { sel = null; drawAll(); };
    drawAll(); const L0 = Room.levelInfo(); if (L0.lv > (S.lv || 1)) { S.lv = L0.lv; Room.save(); lvUp(L0); } S.lv = Math.max(S.lv || 1, L0.lv);
    // 장을 모두 모았으면 이야기 컷
    setTimeout(() => Room.checkStory(parent, () => drawAll()), 500);
    return { redraw: drawAll };
  };
  /** 지금 장의 가구를 모두 얻었으면 그 방 이야기 컷 → 완성 팝업(아늑함 보너스·열린 방) */
  Room.checkStory = function (parent, cb) {
    const c = Room.chapter(); if (!c) return false; const T = Room.tasks(); if (T.done < c.tasks.length) return false; const S = ensure();
    S.story[c.room] = { done: 1, t: Date.now() }; Room.save(); const fin = () => { const nx = c.reward && c.reward.unlock && rooms().find((r) => r.id === c.reward.unlock); const sc = UK.modal({ parent, title: kid() ? '' : '방 완성!', big: '🏠', body: kid() ? '' : (c.title + '<br>아늑함 +' + ((c.reward && c.reward.cozy) || 0) + (nx ? '<br>새 방 「' + nx.name + '」이 열려요' : '')), actions: [{ text: kid() ? null : '확인', icon: kid() ? 'play' : null, cls: 'green', onclick: () => { cb && cb(); } }] }); try { UK.confetti(sc); GF.sfx && GF.sfx('celebrate'); } catch (e) {} };
    if (window.GF && GF.tale && GF.tale.play && c.cuts && c.cuts.length) GF.tale.play(c.cuts, parent, fin, { bg: 'indoor2' }); else fin(); return true;
  };

  /* ---------------- 카탈로그 (자물쇠 실루엣 대신 흐린 실물 + 출처) ---------------- */
  Room.catalog = function (parent, opts) {
    opts = opts || {}; const sc = el('div', 'uk-scrim h2-cat', ovRoot(parent)), sh = el('div', 'uk-sheet h2-catsh', sc); let tab = 'all', selId = null;
    const head = el('div', 'h2-cathd', sh), body = el('div', 'h2-catbody', sh), det = el('div', 'h2-det', sh); const close = el('button', 'h2-x', head, '✕'); close.onclick = () => { sc.remove(); opts.onClose && opts.onClose(); };
    const tabs = el('div', 'h2-tabs', head); const T = [['all', '전체'], ['set', '세트'], ['wish', '♥'], ['new', '새것']];
    const items = () => Room.data.items.filter((i) => Room.visibleSet(i)).filter((i) => { if (tab === 'wish') return Room.wishOn(i.id); if (tab === 'new') return Room.has(i.id) && !isPlaced(i.id); return true; });
    const isPlaced = (id) => Object.values(ensure().placed).some((L) => L.some((p) => p.id === id));
    function drawTabs() { tabs.innerHTML = ''; T.forEach(([k, n]) => { const b = el('button', 'h2-tab' + (k === tab ? ' on' : ''), tabs, kid() ? { all: '▦', set: '◈', wish: '♥', new: '✦' }[k] : n); b.onclick = () => { tab = k; drawAll(); }; }); }
    function card(parent2, it) {
      const own = Room.has(it.id), c = el('button', 'h2-card' + (own ? '' : ' off') + (selId === it.id ? ' sel' : ''), parent2), im = el('img', '', c); im.src = Room.src(it); im.alt = '';
      if (!kid()) { el('b', '', c, it.name.replace(/^(도형 블록|네모|세모|동그라미) /, '')); el('small', '', c, '아늑함 +' + (it.cozy || 0)); } else el('small', '', c, own ? '' : (APPICON[(it.src || {}).game] || '🎁'));
      if (Room.wishOn(it.id)) el('i', 'h2-heart', c, '♥'); c.onclick = () => { selId = it.id; drawAll(); }; return c;
    }
    function drawBody() {
      body.innerHTML = ''; if (tab === 'set') { sets().filter((s) => Room.data.items.some((i) => i.set === s.id && Room.visibleSet(i))).forEach((s) => { const its = Room.data.items.filter((i) => i.set === s.id && Room.visibleSet(i)), got = its.filter((i) => Room.has(i.id)).length; const h = el('div', 'h2-sh2', body, (kid() ? '' : `<b>${s.name}</b>`) + `<span>${got}/${its.length}</span>`); const pg = el('div', 'uk-progress gold', h); pg.innerHTML = `<i style="width:${got / its.length * 100}%"></i>`; if (!kid()) { const dr = el('button', 'h2-dream', h, '완성 모습'); dr.onclick = () => Room.dream(s.id, sh); } const g = el('div', 'h2-grid', body); its.forEach((it) => card(g, it)); }); return; }
      const g = el('div', 'h2-grid', body); const L = items(); if (!L.length) el('p', 'h2-empty', body, kid() ? '' : (tab === 'wish' ? '갖고 싶은 가구에 ♥ 를 눌러 보세요' : '여기엔 아직 없어요')); L.forEach((it) => card(g, it));
    }
    function drawDet() {
      det.innerHTML = ''; const it = selId && Room.item(selId); if (!it) { if (!kid()) el('p', 'h2-hint', det, '가구를 눌러 보세요'); return; } const own = Room.has(it.id), sr = it.src || {};
      const row = el('div', 'h2-detrow', det); const im = el('img', '', row); im.src = Room.src(it); im.alt = ''; const tx = el('div', 'h2-dtx', row);
      if (!kid()) { el('b', '', tx, it.name); el('small', '', tx, (own ? '가지고 있어요' : sr.hint ? '어디서 얻나 · ' + sr.hint : '') + ' · 아늑함 +' + (it.cozy || 0)); } else el('span', 'h2-tic', tx, APPICON[sr.game] || '🎁');
      const hb = el('button', 'h2-hbtn' + (Room.wishOn(it.id) ? ' on' : ''), row, '♥'); hb.onclick = () => { Room.wish(it.id); drawAll(); };
      const a = el('div', 'h2-acts', det); if (own) UK.btn({ text: kid() ? null : '집에 놓기', icon: kid() ? 'home' : null, cls: 'green sm', onclick: () => { Room.placeAt(it.id); sc.remove(); opts.onClose && opts.onClose(); } }, a);
      else UK.btn({ text: kid() ? null : '어디서? ▶', icon: kid() ? 'next' : null, cls: 'gold sm', onclick: () => Room.goApp(sr.game, { parent: sc, home: opts.go && (() => { sc.remove(); opts.go(sr.game); }) }) }, a);
    }
    function drawAll() { drawTabs(); drawBody(); drawDet(); } drawAll(); return sc;
  };
  /** 완성 예시(꿈의 방): 그 세트를 다 놓은 모습을 그림 없이 합성 */
  Room.dream = function (setId, parent) {
    const s = Room.set(setId), its = Room.data.items.filter((i) => i.set === setId && Room.visibleSet(i)), sc = el('div', 'uk-scrim h2-dream-ov', ovRoot(parent)), sh = el('div', 'uk-sheet', sc);
    if (!kid()) el('h2', '', sh, (s ? s.name : '') + ' 완성 모습'); const fr = el('div', 'h2-dframe', sh); const k = Math.ceil(its.length / 2); its.forEach((it, i) => { const im = el('img', '', fr); im.src = Room.src(it); const col = i % k, row = Math.floor(i / k); im.style.cssText = `left:${6 + col * (88 / k)}%;top:${row ? 52 : 14}%;height:${row ? 34 : 38}%`; im.alt = ''; });
    UK.btn({ text: kid() ? null : '닫기', icon: kid() ? 'close' : null, cls: 'ghost', onclick: () => sc.remove() }, el('div', 'acts', sh));
  };
  /** 사진 찍기: 지금 방을 PNG 로(가구·바닥·벽, 사용자가 눌렀을 때만 만든다) */
  Room.photo = async function (rid, parent) {
    try {
      const R = rooms().find((r) => r.id === rid), S = ensure(), W = 1020, k = W / RW, c = document.createElement('canvas'); c.width = W; c.height = Math.round(RH * k); const x = c.getContext('2d');
      const load = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
      const bg = await load('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(bgSVG(R, S.light))); if (bg) x.drawImage(bg, 0, 0, W, c.height);
      const list = (S.placed[rid] || []).map((p) => ({ p, it: Room.item(p.id) })).filter((q) => q.it).sort((a, b) => (a.p.y + a.it.h * IS) - (b.p.y + b.it.h * IS));
      for (const { p, it } of list) { const im = await load(Room.src(it, p.c)); if (!im) continue; const w = it.w * IS * k, h = it.h * IS * k; x.save(); if (p.flip) { x.translate(p.x * k + w, p.y * k); x.scale(-1, 1); x.drawImage(im, 0, 0, w, h); } else x.drawImage(im, p.x * k, p.y * k, w, h); x.restore(); }
      x.fillStyle = 'rgba(255,255,255,.85)'; x.font = '900 34px sans-serif'; x.fillText('기하학 가족 · 우리 집', 24, c.height - 24);
      const nm = 'gihaha-house-' + rid + '.png';
      if (window.GFSave && GFSave.image) { if (!GFSave.image(c.toDataURL('image/png'), nm)) throw new Error('save'); } else { const blob = await new Promise((r) => c.toBlob(r, 'image/png')); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nm; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
      UK.toast(kid() ? '📷' : '방 사진을 저장했어요', parent);
    } catch (e) { UK.toast(kid() ? '📷✕' : '사진을 저장하지 못했어요', parent); }
  };
})();
