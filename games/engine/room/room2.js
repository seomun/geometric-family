/* 「우리 집」 2.0 — 하우징 대개편 (games/26_HOUSING2.md, D24 · 허브 QA 2026-10-13 개정). 기존 Room(room.js) 위에 얹는다.
   화면: 방이 주인공(화면의 60%+) · 할 일은 아래 접힌 시트(접힘 = 「다음: ○○ ▶」 한 줄, 끌어올리면 3개) · 바닥 마루/타일/잔디 + 벽 도형 무늬 · 고정 가구(세면대·책상·침대…) 위에 소품 · 크기 규칙(cls) · 겹침 회피 · 꿈의 방(완성 모습).
   데이터: data/room_items.json(cozy·cls·tags·style·color·src) + data/housing.json(레벨표·방·장·손님). 저장은 기존 키(gf:house:adult|kid:v1)에 선택 필드만 덧붙인다.
   보기 방식은 R2.draw / bgSVG 슬롯 — 아트 패스 때 쿼터뷰(아이소) 그림으로 바꿀 수 있다. 유아(mode kid)는 글자 없이 그림·아이콘만. */
(function () {
  'use strict';
  const Room = window.Room; if (!Room) return;
  const el = (t, c, p, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; if (p) p.appendChild(e); return e; };
  const RW = 340, RH = 440, WALLH = 150, SIZEF = { big: 1.75, mid: 1.4, small: 1.2, wall: 1.25, prop: 1 };
  const APPICON = { merge: '✨', spot: '🔍', block: '🧱', sort: '🗄️', tile: '🀄', day: '☀️', idle: '🍲', quiz: '❓', color: '🖍️', playground: '🎠', story: '📖', event: '🎉', other: '🎁' };
  const APPNAME = { expedition: '기하학 원정대', merge: '합치기', spot: '틀린 그림', block: '블록', sort: '정리', tile: '짝 맞추기', day: '막둥이의 하루', idle: '세 가족 식탁', quiz: '어느 도형', color: '색칠북', playground: '놀이터', story: '이야기 카드', event: '이벤트' };
  const EMOTE = { sit: '💛', eat: '🍚', read: '📖', sleep: '💤', play: '🎵', watch: '👀' };
  const KIDSETS = ['kid', 'daybath', 'wall', 'story_k', 'kseason', 'kgift'];
  const R2 = (Room.v2 = { view: 'diorama' });
  const kid = () => Room.cfg.mode === 'kid', grp = () => (kid() ? 'kid' : 'adult');
  const inGroup = (it) => (kid() ? KIDSETS.includes(it.set) : !KIDSETS.includes(it.set));
  /** 토스트: 시트·연출이 열려 있으면 화면 위쪽 바깥에 띄워 제목·내용을 가리지 않는다 */
  const toastH = (msg, parent) => { const t = UK.toast(msg, parent); try { if (document.querySelector('.h2-cat, .h2-reveal, .h2-drop')) t.classList.add('h2-toast-top'); } catch (e) { /* 위치 지정 실패는 무시 */ } return t; };
  const ensure = () => { const S = Room.S; if (!S) return null; S.story = S.story || {}; S.wish = S.wish || []; S.guests = S.guests || {}; S.light = S.light || 'day'; S.lv = S.lv || 1; return S; };
  const H = () => Room.H;
  const orig = Room.init;
  Room.init = function (o) { const r = orig.call(Room, o); Room.H = (o && o.housing) || Room.H || null; ensure(); Room._recent = []; hookResult(); return r; };
  /* 결과 화면 공통: 판에서 새 가구를 받았으면 「집에 놓기」 카드가 먼저 · 다음 목표 띠를 시트에 붙인다. UK.result 를 가장 바깥에서 감싼다(앱 초기화 때 — 광고 래퍼가 이미 감싼 뒤). 앱마다 고치지 않는다 */
  function hookResult() {
    if (!window.UK || UK.__h2 || !Room.H) return; UK.__h2 = 1; const r0 = UK.result;
    const addBand = (sc, o) => { try { if (sc && sc.querySelector && !sc.querySelector('.h2-band')) Room.band(sc.querySelector('.uk-sheet') || sc, { go: Room.cfg.home, toastParent: o && o.parent }); } catch (e) { /* 띠는 덤 */ } };
    UK.result = function (o) {
      const rec = Room._recent || []; Room._recent = [];
      if (!o || !o.parent || !rec.length || !Room.H) { const sc = r0.apply(this, arguments); addBand(sc, o); return sc; }
      const self = this, args = arguments, dummy = document.createElement('div');
      Room.dropCard(rec[rec.length - 1], o.parent, () => { const sc = r0.apply(self, args); addBand(sc, o); }, { openHouse: Room.cfg.openHouse });   // 결과의 주인공 = 집에 놓기
      return dummy;
    };
  }
  /* 홈 화면 공통: 다음 목표 띠(…home 화면) */
  if (window.GF && GF.screen && !GF.__h2s) { GF.__h2s = 1; const s0 = GF.screen; GF.screen = function (name, def) {
    if (/home$|^itable$/.test(name) && def && def.enter) { const e0 = def.enter; def.enter = function (r) { const x = e0.apply(this, arguments); try { if (Room.H && Room.S && !r.querySelector('.h2-bandwrap')) { const bw = el('div', 'h2-bandwrap' + (name === 'itable' ? ' top' : ''), r); Room.band(bw, { go: Room.cfg.home, toastParent: r }); } } catch (e) { /* 띠는 덤 */ } return x; }; }
    return s0.apply(this, arguments); }; }
  const geo = (it) => { const F = ((H() && H().sizeF) || SIZEF)[it.cls || 'small'] || 1.2; return { w: it.w * F, h: it.h * F }; };
  const ovRoot = (parent) => (parent && parent.closest && parent.closest('.screen')) || document.getElementById('safe') || parent;   // 팝업은 스크롤하는 안쪽이 아니라 화면 루트에 붙인다

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
  const table = () => (kid() ? ((H() && H().levelsKid) || []).slice() : ((H() && H().levels) || []).slice());
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
  Room.nextGoal = function (app) {
    const S = ensure(); if (!S || !H()) return null; const mk = (id, label, why) => { const it = Room.item(id); if (!it) return null; return { id, item: it, label: label || it.name, why, src: it.src || {}, game: (it.src && it.src.game) || it.game, hint: (it.src && it.src.hint) || '' }; };
    for (const id of S.wish) if (!Room.has(id)) return mk(id, null, 'wish');
    const T = Room.tasks(); if (T.show.length) { const t = T.show.slice().sort((a, b) => ((a.miss.it.src && a.miss.it.src.game === app) ? 0 : 1) - ((b.miss.it.src && b.miss.it.src.game === app) ? 0 : 1))[0]; return mk(t.miss.id, t.label, 'task'); }
    let best = null; sets().forEach((s) => { const its = Room.data.items.filter((i) => i.set === s.id && inGroup(i)), got = its.filter((i) => Room.has(i.id)).length; if (its.length && got < its.length && (!best || its.length - got < best.left)) best = { id: its.find((i) => !Room.has(i.id)).id, left: its.length - got }; });
    return best ? mk(best.id, null, 'set') : null;
  };
  Room.goApp = function (game, opts) {
    opts = opts || {}; const app = Room.cfg.app || Room.cfg.game; const map = { tables: 'idle', coloring: 'color' }; const g = map[game] || game;
    if (g === app || g === 'story' || g === 'event' || g === 'other') { if (opts.home) opts.home(); else if (Room.cfg.home) Room.cfg.home(); return 'same'; }
    if (kid()) return 'kid';            // 유아 앱: 다른 앱을 열지 않는다(KIDS_COMPLIANCE) — 그림으로만 알려 준다
    const pkg = 'com.geometricfamily.' + (g === 'idle' ? 'tables' : g === 'playground' ? 'toddler' : g), n = window.GFOps;
    try { if (n && n.hasApp && n.hasApp(pkg)) { n.launch(pkg); return 'launch'; } if (n && n.openStore) { n.openStore(pkg); return 'store'; } } catch (e) { /* 네이티브 없음(웹) */ }
    toastH('「' + (APPNAME[g] || g) + '」 앱에서 얻어요', opts.parent); return 'web';
  };
  /** 앱 홈 「오늘 할 일」 한 줄(C5, 성인): 오늘의 작은 일 중 아직 안 한 첫 줄 · 다 했으면 선물 안내 · 선물까지 받았으면 칭찬. 누르면 작은 일 목록. 못 해도 괜찮다는 말투 */
  Room.todoLine = function (parent, onBand) {      // onBand: 띠 요소(있으면 그 안 칩) · 없으면 띠 자리에 한 줄
    const old = parent.querySelector(':scope > .h2-todo'); if (old) old.remove();
    if (kid() || !parent.classList.contains('h2-bandwrap') || parent.classList.contains('top')) return null;
    const O = GF.ops; if (!O || !O.ready || O.kid || !O.missions) return null; let list; try { list = O.missions(); } catch (e) { return null; } if (!list || !list.length) return null;
    const left = list.find((x) => x.got < x.n), doneN = list.filter((x) => x.got >= x.n).length, gifted = !!(O.giftTaken && O.giftTaken());
    const text = left ? GF.t('ops.mis.' + left.id, { n: left.n }) + (left.n > 1 ? ' (' + left.got + '/' + left.n + ')' : '') : gifted ? GF.t('ops.mis.gifted') : GF.t('ops.mis.gift');
    if (onBand && onBand.nodeType) {      // 띠 안 오른쪽 작은 칩(아이콘 + 한 일/전체) — 누르면 작은 일 목록
      const ar = onBand.querySelector('.h2-arrow'), c = el('span', 'h2-todochip' + (left ? '' : ' ok'), onBand); c.setAttribute('role', 'button'); c.setAttribute('aria-label', 'today'); c.title = left ? GF.t('ops.mis.' + left.id, { n: left.n }) : text;
      el('b', '', c, left ? left.icon : '🎁'); el('i', '', c, doneN + '/' + list.length); if (ar) onBand.insertBefore(c, ar); c.onclick = (e) => { e.stopPropagation(); try { GF.sfx('tap'); } catch (x) { /* 소리 */ } O.openMissions(); }; return c;
    }
    const b = el('button', 'h2-todo' + (left ? '' : ' ok'), parent); b.setAttribute('aria-label', 'today');
    if (left) { el('span', 'ic', b, left.icon); el('span', 'tx', b, '오늘 · ' + text); } else el('span', 'tx', b, text); el('i', 'n', b, '✔ ' + doneN + '/' + list.length); b.onclick = (e) => { e.stopPropagation(); try { GF.sfx('tap'); } catch (x) { /* 소리 */ } O.openMissions(); }; return b;
  };
  Room.band = function (parent, opts) {
    opts = opts || {}; const old = parent.querySelector(':scope > .h2-band'); if (old) old.remove(); if (!H() || !Room.S) return null;
    const g = Room.nextGoal(Room.cfg.app || Room.cfg.game); if (!g) { Room.todoLine(parent, false); return null; } const b = el('button', 'h2-band' + (kid() ? ' kid' : ''), parent);
    const im = el('img', '', b); im.src = Room.src(g.item); im.alt = ''; const ic = APPICON[g.game] || '🎁';
    if (kid()) { el('span', 'h2-bic', b, ic); el('span', 'h2-arrow', b, UK.icon('next')); } else { const tx = el('span', 'h2-btx', b); el('b', '', tx, (g.why === 'wish' ? '♥ ' : '다음: ') + g.label + ' · ' + g.hint); el('span', 'h2-arrow', b, UK.icon('next')); }
    b.setAttribute('aria-label', 'next goal'); b.onclick = (e) => { e.stopPropagation(); Room.goApp(g.game, { parent: opts.toastParent || parent, home: opts.go }); }; Room.todoLine(parent, b); return b;
  };

  /* ---------------- 놓기: 칸 → 면(소품) → 빈 자리 (겹침 회피) ---------------- */
  const rectOf = (p, it) => { const g = geo(it); return { x: p.x, y: p.y, w: g.w, h: g.h }; };
  const ov = (a, b) => Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x)) * Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  const WINDOW = { x: 214, y: 26, w: 92, h: 72 };
  const roomDef = (rid) => rooms().find((r) => r.id === rid);
  const HOST_OK = /table|drawer|shelf|desk|fridge|tv|counter|box|cart|chest|toybox|식탁|서랍|책장|상|TV/;
  /** 방 안에서 소품이 올라설 수 있는 면: 고정 가구 surf + 놓인 큰 가구의 윗면 */
  Room.surfaces = function (rid) {
    const R = roomDef(rid), out = []; if (!R) return out; (R.fixtures || []).forEach((f) => { if (f.surf) out.push({ y: f.surf.y, x0: f.surf.x0, x1: f.surf.x1, host: f.k }); });
    ((ensure().placed[rid]) || []).forEach((p) => { const it = Room.item(p.id); if (!it || it.slot === 'table' || it.slot === 'wall') return; if (!(it.cls === 'big' || it.cls === 'mid') || !HOST_OK.test(it.id + ' ' + it.name)) return; const g = geo(it); out.push({ y: p.y + g.h * 0.28, x0: p.x + g.w * 0.12, x1: p.x + g.w * 0.88, host: p.id }); });
    return out;
  };
  Room.removeEverywhere = (id) => { const S = ensure(); Object.keys(S.placed).forEach((rid) => { S.placed[rid] = S.placed[rid].filter((p) => p.id !== id); }); };
  const freeSpot = (rid, it, o) => {          // 겹침이 가장 적고 원하는 곳과 가까운 자리
    o = o || {}; const S = ensure(), R = roomDef(rid), g = geo(it), list = (S.placed[rid] || []).map((p) => ({ p, it: Room.item(p.id) })).filter((q) => q.it), occ = list.map((q) => rectOf(q.p, q.it));
    const anc = ((R && R.anchors) || []).filter((a) => a.want !== it.id && !list.some((q) => q.p.id === a.want)).map((a) => { const w = Room.item(a.want); if (!w) return null; const gw = geo(w); return { x: a.x - gw.w / 2, y: a.y - gw.h, w: gw.w, h: gw.h }; }).filter(Boolean);
    let best = null; const wall = it.slot === 'wall', y0 = wall ? 40 : 250, y1 = wall ? 112 : 420;
    for (let by = y0; by <= y1; by += wall ? 12 : 14) for (let cx = g.w / 2 + 6; cx <= RW - g.w / 2 - 6; cx += 12) {
      const r = { x: cx - g.w / 2, y: by - g.h, w: g.w, h: g.h }; const oc = occ.reduce((s, q) => s + ov(r, q), 0); let pen = oc * 4 + anc.reduce((s, q) => s + ov(r, q), 0) * 2; if (wall) pen += ov(r, WINDOW) * 4; if (r.y < (wall ? 6 : WALLH - g.h * 0.4)) pen += 5000;
      const d = o.near ? Math.abs(cx - o.near.x) + Math.abs(by - o.near.y) : Math.abs(cx - RW / 2) * 0.2 + (wall ? 0 : Math.abs(by - 340) * 0.3), c = pen * 10 + d; if (!best || c < best.c) best = { c, x: Math.round(r.x), y: Math.round(r.y), occ: oc };
    }
    return best || { x: 20, y: 300, occ: 1 };
  };
  Room.placeAt = function (id) {
    const it = Room.item(id), S = ensure(); if (!it) return null; const open = Room.unlockedRooms(), g = geo(it);
    for (const r of open) { const a = (r.anchors || []).find((q) => q.want === id); if (a && !(S.placed[r.id] || []).some((p) => p.id === id)) { Room.removeEverywhere(id); Room.placedIn(r.id).push({ id, x: Math.round(Math.max(4, Math.min(RW - g.w - 4, a.x - g.w / 2))), y: Math.round(a.y - g.h), flip: 0, c: it.colors[0] }); Room.save(); return { room: r.id, anchor: a }; } }
    if (Object.values(S.placed).some((L) => L.some((p) => p.id === id))) { const rr = Object.keys(S.placed).find((k) => S.placed[k].some((p) => p.id === id)); return { room: rr, already: true }; }
    const okRooms = open.filter((r) => !r.themes || !it.theme || r.themes.includes(it.theme));          // 주제가 맞는 열린 방에만 놓는다(욕실에 배구공 금지)
    const home = okRooms.find((x) => x.id === it.room) || okRooms[0]; if (!home) return null; let target = home.id, pos = null;
    if (it.slot === 'table') {       // 소품은 면 위에: 고정 가구/큰 가구 윗면에 순서대로
      for (const r of [home].concat(okRooms)) { const L = (S.placed[r.id] || []).map((p) => ({ p, it: Room.item(p.id) })).filter((q) => q.it && q.it.slot === 'table'); for (const sf of Room.surfaces(r.id)) { const sitting = L.filter((q) => Math.abs(q.p.y + geo(q.it).h - sf.y) < 8 && q.p.x >= sf.x0 - 20 && q.p.x <= sf.x1); let x = sf.x0 + 2; sitting.sort((a, b) => a.p.x - b.p.x).forEach((q) => { x = Math.max(x, q.p.x + geo(q.it).w + 6); }); if (x + g.w <= sf.x1 + 6) { pos = { x: Math.round(x), y: Math.round(sf.y - g.h) }; target = r.id; break; } } if (pos) break; }
    }
    if (!pos) {      // 자유 놓기: 자리 외 자유 놓기는 방마다 10개까지, 다른 가구와 겹치지 않는 방에만(자리 칸 가구는 항상 자기 자리) 다른 가구와 겹치지 않는 방에만. 없으면 놓지 않고 가진 채로 둔다(방이 열리거나 치우면 sweep 이 놓는다)
      target = null; for (const r of [home].concat(okRooms.filter((x) => x !== home))) { const aw = new Set((r.anchors || []).map((a) => a.want)); if ((S.placed[r.id] || []).filter((q) => !aw.has(q.id) && (Room.item(q.id) || {}).slot !== 'table').length >= 10) continue; const p = freeSpot(r.id, it, null); if (!p.occ) { target = r.id; pos = p; break; } }
      if (!target) return null;
    }
    Room.placedIn(target).push({ id, x: pos.x, y: pos.y, flip: 0, c: it.colors[0] }); Room.save(); return { room: target };
  };
  /** 얻었지만 아직 맞는 방이 없어 못 놓은 가구를, 방이 열리면 놓는다 */
  Room.sweep = function () { const S = ensure(); if (!S || !H()) return 0; let n = 0; Room.owned().forEach((id) => { if (!Object.values(S.placed).some((L) => L.some((p) => p.id === id))) { const r = Room.placeAt(id); if (r && !r.already) n++; } }); return n; };
  /* ---------------- 테마 프리셋(A1): 가진 가구만 한 번에 놓는다 ---------------- */
  Room.presets = (rid) => ((H() && H().presets) || []).filter((p) => p.group === grp() && (!rid || p.room === rid));
  Room.presetStatus = function (pid) {
    const P = Room.presets().find((p) => p.id === pid); if (!P) return null; const parts = P.parts.map((q) => ({ q, it: Room.item(q.id) })).filter((x) => x.it), own = parts.filter((x) => Room.has(x.q.id));
    return { P, total: parts.length, have: own.length, missing: parts.filter((x) => !Room.has(x.q.id)).map((x) => x.it.name) };
  };
  const surfaceSpot = (rid, it, host) => {      // 소품을 놓을 면 위의 자리(host 가 있으면 그 가구 윗면 먼저)
    const S = ensure(), g = geo(it), L = (S.placed[rid] || []).map((p) => ({ p, it: Room.item(p.id) })).filter((q) => q.it && q.it.slot === 'table'); let sfs = Room.surfaces(rid); if (host) sfs = sfs.filter((s) => s.host === host).concat(sfs.filter((s) => s.host !== host));
    for (const sf of sfs) { const sitting = L.filter((q) => Math.abs(q.p.y + geo(q.it).h - sf.y) < 8 && q.p.x >= sf.x0 - 20 && q.p.x <= sf.x1); let x = sf.x0 + 2; sitting.sort((a, b) => a.p.x - b.p.x).forEach((q) => { x = Math.max(x, q.p.x + geo(q.it).w + 6); }); if (x + g.w <= sf.x1 + 6) return { x: Math.round(x), y: Math.round(sf.y - g.h) }; }
    return null;
  };
  /** 프리셋을 다 모았을 때의 모습(미리보기용 배치 목록) — 실제 배치는 건드리지 않는다 */
  Room.presetLayout = function (pid) {
    const P = Room.presets().find((p) => p.id === pid), S = ensure(); if (!P) return []; const keep = S.placed[P.room], list = []; S.placed[P.room] = list;
    try {
      P.parts.forEach((q) => { const it = Room.item(q.id); if (!it || q.x == null || it.slot === 'table') return; const g = geo(it); list.push({ id: q.id, x: Math.round(Math.max(4, Math.min(RW - g.w - 4, q.x - g.w / 2))), y: Math.round(q.y - g.h), flip: 0, c: it.colors[0] }); });
      P.parts.forEach((q) => { const it = Room.item(q.id); if (!it || it.slot !== 'table') return; const pos = surfaceSpot(P.room, it, q.on); if (pos) list.push({ id: q.id, x: pos.x, y: pos.y, flip: 0, c: it.colors[0] }); });
    } finally { if (keep === undefined) delete S.placed[P.room]; else S.placed[P.room] = keep; }
    return list.slice();
  };
  /** 프리셋을 방에 놓는다. 가진 것만 · 이미 다른 방에 있어도 옮긴다 · 겹치는 다른 가구는 비켜 준다. 되돌리기용 스냅샷을 Room._undo 에 둔다. */
  Room.applyPreset = function (pid) {
    const P = Room.presets().find((p) => p.id === pid), S = ensure(); if (!P) return { error: 'no_preset' }; if (!Room.unlockedRooms().some((r) => r.id === P.room)) return { error: 'locked' };
    const st = Room.presetStatus(pid); if (!st.have) return { error: 'none_owned', ...st }; Room._undo = { room: P.room, placed: JSON.parse(JSON.stringify(S.placed)) };
    const fixed = [], props = []; P.parts.forEach((q) => { if (!Room.has(q.id)) return; const it = Room.item(q.id); if (!it) return; (q.x != null && it.slot !== 'table' ? fixed : props).push({ q, it }); });
    fixed.forEach(({ q, it }) => { const g = geo(it); Room.removeEverywhere(q.id); Room.placedIn(P.room).push({ id: q.id, x: Math.round(Math.max(4, Math.min(RW - g.w - 4, q.x - g.w / 2))), y: Math.round(q.y - g.h), flip: 0, c: it.colors[0] }); });
    const mine = new Set(P.parts.map((q) => q.id)), L = Room.placedIn(P.room), R0 = fixed.map(({ q, it }) => { const g = geo(it); return { x: q.x - g.w / 2, y: q.y - g.h, w: g.w, h: g.h }; });
    for (let i = L.length - 1; i >= 0; i--) { const p = L[i], it = Room.item(p.id); if (!it || mine.has(p.id) || it.slot === 'table') continue; const r = rectOf(p, it), own = r.w * r.h; if (R0.some((q) => ov(r, q) > own * 0.35)) { L.splice(i, 1); const pos = freeSpot(P.room, it, null); L.push({ id: p.id, x: pos.x, y: pos.y, flip: p.flip || 0, c: p.c }); } }
    let noRoom = 0; props.forEach(({ q, it }) => { Room.removeEverywhere(q.id); const pos = surfaceSpot(P.room, it, q.on); if (!pos) { noRoom++; return; } Room.placedIn(P.room).push({ id: q.id, x: pos.x, y: pos.y, flip: 0, c: it.colors[0] }); });
    Room.save(); return { ok: true, room: P.room, have: st.have, total: st.total, missing: st.missing, noRoom };
  };
  Room.undoPreset = function () { const u = Room._undo, S = ensure(); if (!u) return false; S.placed = u.placed; Room._undo = null; Room.save(); return true; };
  /** 테마 시트: 현재 방의 프리셋 목록 → 놓기(되돌리기 가능) */
  Room.presetSheet = function (rid, parent, onDone) {
    const sc = el('div', 'uk-scrim h2-cat', ovRoot(parent)), sh = el('div', 'uk-sheet h2-presh', sc), list = Room.presets(rid);
    el('h2', '', sh, '테마로 꾸미기'); el('p', 'h2-dsub', sh, '가지고 있는 가구만 한 번에 놓아요. 마음에 안 들면 되돌릴 수 있어요.');
    if (!list.length) el('p', 'h2-empty', sh, '이 방엔 아직 테마가 없어요');
    list.forEach((P) => {
      const st = Room.presetStatus(P.id), c = el('div', 'h2-pcard', sh), pvw = el('div', 'h2-ppv', c); R2.draw(pvw, P.room, { mini: true, list: Room.presetLayout(P.id) }); el('i', 'h2-pic', pvw, P.icon); const tx = el('div', 'h2-ptx', c); el('b', '', tx, P.name); el('small', '', tx, P.note);
      const pg = el('div', 'h2-pbar', tx, `<i style="width:${Math.round(st.have / st.total * 100)}%"></i>`); el('small', 'h2-pcnt', tx, `가구 ${st.have}/${st.total}` + (st.missing.length ? ' · 아직 없어요: ' + st.missing.slice(0, 3).join(', ') + (st.missing.length > 3 ? ' 외 ' + (st.missing.length - 3) : '') : ' · 다 모였어요!')); void pg;
      UK.btn({ text: st.have ? '놓기' : '아직 없어요', cls: (st.have ? 'green' : 'ghost') + ' sm', onclick: () => {
        if (!st.have) return; const r = Room.applyPreset(P.id); if (!r.ok) { toastH('놓지 못했어요', sc); return; } sc.remove(); try { GF.sfx && GF.sfx('star'); } catch (e) { /* 소리 */ } onDone && onDone(r, P);
      } }, c);
    });
    UK.btn({ text: '닫기', cls: 'ghost', onclick: () => sc.remove() }, el('div', 'acts', sh)); return sc;
  };
  const grant0 = Room.grant;
  Room.grant = function (id) {
    const auto = Room.cfg.autoPlace; Room.cfg.autoPlace = false; let r; try { r = grant0.call(Room, id); } finally { Room.cfg.autoPlace = auto; }
    if (r && !Room._quiet) (Room._recent = Room._recent || []).push(id);   // 결과 화면의 「집에 놓기」 대상(집 안에서 받는 선물은 제외)
    if (r && auto) { if (H()) Room.placeAt(id); else Room.place(id, (Room.item(id) || {}).room); } return r;
  };
  Room.dropCard = function (id, parent, cb, opts) {
    opts = opts || {}; Room._recent = []; const it = Room.item(id); if (!it || !parent) { cb && cb(); return null; } const sc = el('div', 'uk-scrim h2-drop', ovRoot(parent)), sh = el('div', 'uk-sheet', sc);
    const before = Room.levelInfo(), pos = H() ? Room.placeAt(id) : null, after = Room.levelInfo();
    const bg = el('div', 'h2-drop-big', sh); const im = el('img', '', bg); im.src = Room.src(it); im.alt = '';
    if (!kid()) { el('h2', '', sh, it.name); el('p', 'h2-cozy', sh, '아늑함 +' + (it.cozy || 0)); } else el('p', 'h2-cozy', sh, '★ +' + (it.cozy || 0));
    const g = pos && pos.room ? rooms().find((r) => r.id === pos.room) : null; if (g) { const pv = el('div', 'h2-drop-pv', sh), dd = R2.draw(pv, g.id, { mini: true, flash: id }); const pl = (ensure().placed[g.id] || []).find((q) => q.id === id); if (pl && dd && dd.room) { const gg = geo(it), sp = el('i', 'h2-spot', dd.room); sp.style.cssText = `left:${pl.x - 12}px;top:${pl.y - 12}px;width:${gg.w + 24}px;height:${gg.h + 24}px`; const st = el('em', 'h2-spotstar', dd.room, '✨'); st.style.cssText = `left:${pl.x + gg.w - 4}px;top:${pl.y - 16}px`; } if (!kid()) el('small', '', sh, g.name + '에 놓였어요'); }
    if (after.lv > before.lv) { Room.albumAdd('lv:' + after.lv, 'level', '집 레벨 ' + after.lv, '아늑함 ' + Number(after.cozy).toLocaleString('ko-KR'), g ? g.id : null); el('p', 'h2-lvup', sh, kid() ? '⭐ ' + after.lv : '집 레벨 ' + after.lv + '!'); try { UK.confetti(sc); } catch (e) {} ensure().lv = after.lv; Room.save(); }
    const acts = el('div', 'acts', sh); UK.btn({ text: kid() ? null : (g ? '보러 가기' : '집에 놓기'), icon: kid() ? 'home' : null, cls: 'green block', onclick: () => { sc.remove(); opts.openHouse ? opts.openHouse() : (cb && cb()); } }, acts);
    if (!kid()) UK.btn({ text: '나중에', cls: 'ghost sm', onclick: () => { sc.remove(); cb && cb(); } }, acts); else UK.btn({ icon: 'next', cls: 'ghost sm', onclick: () => { sc.remove(); cb && cb(); } }, acts);
    try { GF.sfx && GF.sfx('star'); } catch (e) {} return sc;
  };

  /* ---------------- 방 그림: 벽 도형 무늬 · 마루/타일/잔디 · 고정 가구 ---------------- */
  const sh2 = (hex, a) => { const n = parseInt(hex.slice(1), 16), f = (v) => Math.max(0, Math.min(255, Math.round(v * (1 + a)))); return '#' + [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => f(v).toString(16).padStart(2, '0')).join(''); };
  const INK = '#6B4A3A';
  const pattern = (kind, c) => { const d = sh2(c, -0.1); const body = { square: `<rect x="9" y="9" width="12" height="12" rx="3" fill="${d}"/>`, triangle: `<path d="M15 7l9 16H6z" fill="${d}"/>`, circle: `<circle cx="15" cy="15" r="7" fill="${d}"/>`, dot: `<circle cx="15" cy="15" r="3.4" fill="${d}"/>` }[kind]; return body ? `<pattern id="wp" width="30" height="30" patternUnits="userSpaceOnUse">${body}</pattern>` : ''; };
  const floorSVG = (R) => {
    const fl = R.floor, k = R.floorKind || 'wood', out = []; const ds = sh2(fl, -0.07), ls = sh2(fl, 0.07);
    if (k === 'wood') { for (let r = 0, y = WALLH; y < RH; r++, y += 34) { out.push(`<rect y="${y}" width="${RW}" height="34" fill="${r % 2 ? ds : fl}"/>`); for (let x = (r % 2) * 46 - 10; x < RW; x += 92) out.push(`<path d="M${x} ${y}v34" stroke="rgba(80,40,10,.16)" stroke-width="1.6"/>`); out.push(`<path d="M0 ${y}H${RW}" stroke="rgba(80,40,10,.14)" stroke-width="1.6"/>`); } }
    else if (k === 'tile') { for (let r = 0, y = WALLH; y < RH; r++, y += 36) for (let c = 0, x = 0; x < RW; c++, x += 36) out.push(`<rect x="${x}" y="${y}" width="36" height="36" fill="${(r + c) % 2 ? ds : ls}"/>`); }
    else if (k === 'grass') { out.push(`<rect y="${WALLH}" width="${RW}" height="${RH - WALLH}" fill="${fl}"/>`); for (let i = 0; i < 46; i++) { const x = (i * 71) % RW, y = WALLH + 14 + ((i * 53) % (RH - WALLH - 20)); out.push(`<path d="M${x} ${y}l3-8l3 8M${x + 7} ${y + 2}l3-7l2 7" stroke="${sh2(fl, -0.18)}" stroke-width="2" fill="none" stroke-linecap="round"/>`); } }
    else out.push(`<rect y="${WALLH}" width="${RW}" height="${RH - WALLH}" fill="${fl}"/>`);
    out.push(`<rect y="${WALLH}" width="${RW}" height="18" fill="rgba(60,30,10,.10)"/>`); return out.join('');
  };
  const FIXT = {
    counter: (f) => `<rect x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" rx="5" fill="#E8D4B0" stroke="${INK}" stroke-width="2.4"/><rect x="${f.x - 3}" y="${f.y - 8}" width="${f.w + 6}" height="10" rx="4" fill="#F7EAD0" stroke="${INK}" stroke-width="2.4"/><path d="M${f.x + f.w / 3} ${f.y + 4}v${f.h - 6}M${f.x + 2 * f.w / 3} ${f.y + 4}v${f.h - 6}" stroke="${INK}" stroke-width="1.8" opacity=".5"/>`,
    desk: (f) => `<rect x="${f.x}" y="${f.y - 8}" width="${f.w}" height="10" rx="4" fill="#C98F5A" stroke="${INK}" stroke-width="2.4"/><path d="M${f.x + 8} ${f.y + 2}v${f.h}M${f.x + f.w - 8} ${f.y + 2}v${f.h}" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><rect x="${f.x + f.w - 54}" y="${f.y + 2}" width="40" height="${f.h - 14}" rx="3" fill="#E0B07C" stroke="${INK}" stroke-width="2"/>`,
    sink: (f) => `<rect x="${f.x}" y="${f.y}" width="${f.w}" height="${f.h}" rx="5" fill="#E4F2F8" stroke="${INK}" stroke-width="2.4"/><rect x="${f.x - 3}" y="${f.y - 8}" width="${f.w + 6}" height="10" rx="4" fill="#fff" stroke="${INK}" stroke-width="2.4"/><ellipse cx="${f.x + f.w * 0.62}" cy="${f.y - 6}" rx="26" ry="5" fill="#BFE4F2" stroke="${INK}" stroke-width="2"/><path d="M${f.x + f.w * 0.62} ${f.y - 12}v-18h10" stroke="${INK}" stroke-width="3" fill="none" stroke-linecap="round"/>`,
    shelf: (f) => `<rect x="${f.x}" y="${f.y}" width="${f.w}" height="9" rx="3" fill="#D9A877" stroke="${INK}" stroke-width="2.2"/><path d="M${f.x + 8} ${f.y + 9}l-0 16M${f.x + f.w - 8} ${f.y + 9}v16" stroke="${INK}" stroke-width="3"/>`,
    bed: (f) => `<rect x="${f.x}" y="${f.y - 50}" width="14" height="${f.h + 50}" rx="4" fill="#C98F5A" stroke="${INK}" stroke-width="2.4"/><rect x="${f.x + 10}" y="${f.y - 6}" width="${f.w - 10}" height="40" rx="8" fill="#F2F0FF" stroke="${INK}" stroke-width="2.4"/><rect x="${f.x + 10}" y="${f.y + 26}" width="${f.w - 10}" height="${f.h - 24}" rx="5" fill="#E0B07C" stroke="${INK}" stroke-width="2.4"/>`,
    table: (f) => `<rect x="${f.x}" y="${f.y - 8}" width="${f.w}" height="12" rx="5" fill="#C98F5A" stroke="${INK}" stroke-width="2.4"/><path d="M${f.x + 12} ${f.y + 4}v${f.h}M${f.x + f.w - 12} ${f.y + 4}v${f.h}" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>`,
  };
  /* ---------------- 시간·계절·날씨(A5): 낮/저녁/밤 자동 · 창밖 날씨 · 계절 장식 ---------------- */
  const now0 = () => Room._date || new Date();
  /** 방 빛: S.light = auto|day|eve|night. auto 는 기기 시계(6~16 낮 · 16~19 저녁 · 19~6 밤) */
  Room.lightNow = function (S) { S = S || ensure(); const m = S && S.light; if (m === 'day' || m === 'eve' || m === 'night') return m; const h = now0().getHours(); return h >= 6 && h < 16 ? 'day' : h >= 16 && h < 19 ? 'eve' : 'night'; };
  Room.season = (d) => { const m = (d || now0()).getMonth() + 1; return m >= 3 && m <= 5 ? 'spring' : m >= 6 && m <= 8 ? 'summer' : m >= 9 && m <= 11 ? 'autumn' : 'winter'; };
  /** 그날의 창밖 날씨(같은 날은 모든 앱이 같다): clear·cloud·rain·snow·blossom·leaves */
  Room.weather = function (d) {
    d = d || now0(); const seed = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(), r = ((seed * 2654435761) >>> 0) % 100, se = Room.season(d);
    const pool = { spring: ['clear', 'clear', 'blossom', 'cloud', 'rain'], summer: ['clear', 'clear', 'cloud', 'rain', 'rain'], autumn: ['clear', 'leaves', 'leaves', 'cloud', 'rain'], winter: ['clear', 'snow', 'snow', 'cloud', 'clear'] }[se];
    return pool[Math.floor(r / 20)];
  };
  const SEASON_DECOR = { spring: ['🌸', '🌷', '🦋'], summer: ['🎐', '🌻', '🍉'], autumn: ['🍁', '🍂', '🎃'], winter: ['❄️', '🎄', '⛄'] };   // 한 계절의 셋을 가랜드 한 줄로
  const LIGHT_IDS = ['b_lamp', 'g_lantern2'];
  const wxFx = (room, kind) => {
    const box = el('div', 'h2-wx ' + kind, room), n = { rain: 14, snow: 12, blossom: 9, leaves: 8, cloud: 3, clear: 1 }[kind] || 0, ch = { rain: '│', snow: '•', blossom: '🌸', leaves: '🍂', cloud: '☁️', clear: '☀️' }[kind];
    for (let i = 0; i < n; i++) { const f = el('i', 'h2-wxp', box, ch); f.style.cssText = `left:${(i * 83 + 11) % 100}%;animation-delay:${-((i * 37) % 30) / 10}s;animation-duration:${kind === 'rain' ? 0.7 + (i % 3) * 0.15 : kind === 'cloud' ? 14 + i * 5 : 3 + (i % 4) * 0.8}s;${kind === 'cloud' ? 'top:' + (6 + i * 18) + '%;' : ''}`; }
    return box;
  };
  const seasonDecor = (room, se) => { const box = el('div', 'h2-sdecor', room), set = SEASON_DECOR[se] || [], n = 7, gap = 40, x0 = (RW - gap * (n - 1)) / 2; box.dataset.season = se; box.innerHTML = `<svg viewBox="0 0 ${RW} 30" width="${RW}" height="30"><path d="M10 4 Q${RW / 2} 20 ${RW - 10} 4" fill="none" stroke="rgba(120,90,50,.45)" stroke-width="2"/></svg>`; for (let i = 0; i < n; i++) { const f = el('i', '', box, set[i % set.length]), t = (i / (n - 1)) * 2 - 1, y = 6 + 14 * (1 - t * t); f.style.cssText = `left:${x0 + i * gap - 10}px;top:${y}px`; } return box; };
  const bgSVG = (R, light) => {
    const wall = R.wall, eve = light === 'eve', night = light === 'night', sky = night ? '#1B2A5C' : eve ? '#F7B27A' : '#BFE6FF', W = WINDOW; const out = [];
    out.push(`<defs>${pattern(R.pattern, wall)}</defs><rect width="${RW}" height="${WALLH}" fill="${wall}"/>`); if (R.pattern && R.pattern !== 'none') out.push(`<rect width="${RW}" height="${WALLH}" fill="url(#wp)"/>`);
    out.push(`<rect y="${WALLH - 40}" width="${RW}" height="40" fill="${sh2(wall, -0.08)}"/><rect y="${WALLH - 42}" width="${RW}" height="5" fill="${sh2(wall, -0.16)}"/><rect y="${WALLH - 8}" width="${RW}" height="8" fill="rgba(0,0,0,.14)"/>`);
    out.push(`<rect x="${W.x}" y="${W.y}" width="${W.w}" height="${W.h}" rx="8" fill="${sky}" stroke="#fff" stroke-width="6"/><path d="M${W.x + W.w / 2} ${W.y}v${W.h}M${W.x} ${W.y + W.h / 2}h${W.w}" stroke="#fff" stroke-width="4"/><circle cx="${W.x + 24}" cy="${W.y + 20}" r="9" fill="${night ? '#FFF3B0' : eve ? '#FFD27A' : '#fff'}" opacity="${night ? 1 : .85}"/>${night ? `<circle cx="${W.x + 28}" cy="${W.y + 18}" r="8" fill="${sky}"/><circle cx="${W.x + 62}" cy="${W.y + 16}" r="1.6" fill="#fff"/><circle cx="${W.x + 74}" cy="${W.y + 34}" r="1.3" fill="#fff"/><circle cx="${W.x + 48}" cy="${W.y + 52}" r="1.5" fill="#fff"/><circle cx="${W.x + 20}" cy="${W.y + 56}" r="1.2" fill="#fff"/>` : ''}`);
    out.push(floorSVG(R)); (R.fixtures || []).forEach((f) => { if (FIXT[f.k]) out.push(FIXT[f.k](f)); });
    return `<svg viewBox="0 0 ${RW} ${RH}" width="${RW}" height="${RH}">${out.join('')}</svg>`;
  };
  R2.bgSVG = bgSVG;
  const anchorRect = (a) => { const it = Room.item(a.want); if (!it) return null; const g = geo(it); return { x: Math.max(4, Math.min(RW - g.w - 4, a.x - g.w / 2)), y: a.y - g.h, w: g.w, h: g.h }; };
  const key = (q) => (q.it.flat ? q.p.y : (q.it.slot === 'table' ? 10000 : 0) + q.p.y + geo(q.it).h);   // 러그류는 맨 아래, 소품은 가구 위
  /** parent 안에 방 하나를 그린다. o: {mini, place, flash, dream, onChange, onSel} → {room, wrap, occ} */
  R2.draw = function (parent, rid, o) {
    o = o || {}; const R = rooms().find((r) => r.id === rid) || rooms()[0], S = ensure(); if (!R) return null;
    const wrap = el('div', 'h2-wrap' + (o.mini ? ' mini' : ''), parent), LT = Room.lightNow(S), room = el('div', 'h2-room' + (LT === 'eve' ? ' eve' : LT === 'night' ? ' night' : ''), wrap); wrap.__room = room; room.__occ = [];
    const fit = () => { const w = wrap.clientWidth || parent.clientWidth || RW, hh = o.maxH || 0, k = Math.min(1.3, w / RW, hh ? hh / RH : 9); room.style.transform = `scale(${k})`; room.__k = k; wrap.style.height = Math.round(RH * k) + 'px'; if (o.fitWidth) wrap.style.width = Math.round(RW * k) + 'px'; }; fit(); setTimeout(fit, 0); wrap.__fit = fit;
    el('div', 'h2-bg', room, bgSVG(R, LT)); if (!o.mini || o.wx) { const wk = Room.weather(); const wx = wxFx(room, wk); wx.style.cssText = `left:${WINDOW.x + 3}px;top:${WINDOW.y + 3}px;width:${WINDOW.w - 6}px;height:${WINDOW.h - 6}px`; seasonDecor(room, Room.season()); room.dataset.wx = wk; room.dataset.light = LT; }
    let list = o.list || (S.placed[R.id] || []);
    if (o.dream) list = (R.anchors || []).map((a) => { const r = anchorRect(a); return r ? { id: a.want, x: Math.round(r.x), y: Math.round(r.y), c: (Room.item(a.want) || { colors: ['#fff'] }).colors[0] } : null; }).filter(Boolean);
    const order = list.map((p, i) => ({ p, i, it: Room.item(p.id) })).filter((q) => q.it).sort((a, b) => key(a) - key(b)); const occ = room.__occ;
    order.forEach(({ p, i, it }) => {
      const g = geo(it); occ.push({ x: p.x, y: p.y, w: g.w, h: g.h, wall: it.slot === 'wall' });
      if (it.slot === 'floor' && !it.flat) { const sh = el('i', 'h2-sh', room); sh.style.cssText = `left:${p.x + g.w * 0.08}px;top:${p.y + g.h - 7}px;width:${g.w * 0.84}px`; }
      if (LT === 'night' && LIGHT_IDS.includes(p.id)) { const gl = el('i', 'h2-glow', room); gl.style.cssText = `left:${p.x + g.w / 2 - 70}px;top:${p.y + g.h * 0.2 - 70}px`; }
      const d = el('img', 'h2-it' + (o.flash === p.id ? ' flash' : ''), room); d.src = Room.src(it, p.c); d.alt = ''; d.draggable = false; d.dataset.id = p.id; d.style.cssText = `left:${p.x}px;top:${p.y}px;width:${g.w}px;height:${g.h}px${p.flip ? ';transform:scaleX(-1)' : ''}${Room.variantFilter(it, p) !== 'none' ? ';filter:' + Room.variantFilter(it, p) : ''}`; d.dataset.i = i;
      if (o.mini || o.dream) return;
      if (o.place) d.addEventListener('pointerdown', (e) => {
        e.preventDefault(); o.sel = i; room.querySelectorAll('.h2-it').forEach((x) => x.classList.remove('sel')); d.classList.add('sel'); o.onSel && o.onSel(i); const k = room.__k || 1, rc = room.getBoundingClientRect(), ox = (e.clientX - rc.left) / k - p.x, oy = (e.clientY - rc.top) / k - p.y; try { d.setPointerCapture(e.pointerId); } catch (x) {}
        const mv = (ev) => { p.x = Math.max(0, Math.min(RW - g.w, Math.round(((ev.clientX - rc.left) / k - ox) / 4) * 4)); p.y = Math.max(0, Math.min(RH - g.h, Math.round(((ev.clientY - rc.top) / k - oy) / 4) * 4)); d.style.left = p.x + 'px'; d.style.top = p.y + 'px'; };
        const up = () => { d.removeEventListener('pointermove', mv); d.removeEventListener('pointerup', up); Room.save(); o.onChange && o.onChange(true); };
        d.addEventListener('pointermove', mv); d.addEventListener('pointerup', up);
      }); else d.addEventListener('pointerup', () => use(room, d, it, p));
    });
    // 점선 칸: 비어 있는 anchors 중 할 일에 걸린 것 우선 최대 3개, 놓인 가구·다른 점선 칸과 겹치면 건너뛴다
    if (!o.dream && !o.list && (!o.mini || o.anchors)) {
      const wantNow = new Set(Room.tasks().show.map((t) => t.miss && t.miss.id)), shown = [];
      const cand = (R.anchors || []).filter((a) => !list.some((p) => p.id === a.want)).sort((a, b) => (wantNow.has(b.want) ? 1 : 0) - (wantNow.has(a.want) ? 1 : 0));
      for (const a of cand) { if (shown.length >= (o.mini ? 1 : 3)) break; const r = anchorRect(a); if (!r) continue; if (occ.some((q) => ov(r, q) > r.w * r.h * 0.05) || shown.some((q) => ov(r, q) > 0)) continue; shown.push(r);
        const d = el('div', 'h2-anchor' + (Room.has(a.want) ? ' have' : ''), room), it = Room.item(a.want); d.style.cssText = `left:${r.x}px;top:${r.y}px;width:${r.w}px;height:${r.h}px`; const im = el('img', '', d); im.src = Room.src(it); im.alt = ''; if (!kid() && !o.mini && r.w >= 64) el('em', '', d, '여기에 ' + it.name.replace(/^(도형 블록|네모|세모|동그라미) /, '')); if (Room.has(a.want) && !o.mini) d.onclick = () => { Room.placeAt(a.want); o.onChange && o.onChange(); }; }
      shown.forEach((r) => occ.push({ x: r.x, y: r.y, w: r.w, h: r.h, anchor: true }));
    }
    return { room, wrap, redraw() { wrap.remove(); } };
  };
  /** room 안 빈 자리(다른 가구·점선 칸·캐릭터와 안 겹치게) — 원하는 곳과 가장 가까운 곳 */
  const freeRect = (room, w, h, want, region) => {
    const occ = room.__occ || [], r0 = region || { x0: 0, y0: 0, x1: RW, y1: RH }; let best = null;
    for (let y = r0.y0; y + h <= r0.y1; y += 8) for (let x = r0.x0; x + w <= r0.x1; x += 8) { const r = { x, y, w, h }, pen = occ.reduce((s, q) => s + ov(r, q), 0), d = Math.abs(x + w / 2 - want.x) + Math.abs(y + h / 2 - want.y), c = pen * 400 + d; if (!best || c < best.c) best = { c, x, y, pen }; }
    return best || { x: want.x, y: want.y, pen: 9e9 };
  };
  /* ---------------- 손님 확장(A3): 앱에서 만난 카메오(ops.cameos 36명)가 집에 놀러 온다 ---------------- */
  /** 이 그룹의 모든 손님: 기본 7+4 · 만난 카메오(좋아하는 가구 = 그 카메오가 나온 앱에서 얻은 가구, 방문 3번, 선물 없음) */
  Room.guestList = function () {
    const base = ((H() && H().guests) || []).filter((g) => g.group === grp()).map((g) => Object.assign({ max: g.gifts.length }, g, { step: 250 }));
    const ops = (window.GF && GF.data && GF.data.ops && GF.data.ops.cameos) || [], I = window.GF && GF.ip, out = base.slice();
    ops.filter((c) => !!c.kid === kid()).forEach((c, idx) => {
      const got = !!(I && I.ready && I.hasCameo && I.hasCameo(c.id)); out.push({ id: 'cam:' + c.id, cam: true, got, char: c.who, group: grp(), who: whoName(c.who), app: APPNAME[c.host] || c.host, need: 200 + 60 * idx, step: 120, max: 3, frm: c.frm, prop: c.prop, host: c.host, likes: [], gifts: [null, null, '__app:' + c.frm], lines: [c.line, c.prop + ' 두고 간 게 여기 있었네!', '집이 점점 아늑해지네요.'] });
    });
    return out;
  };
  const WHO = { wife: '세모 아내', husband: '세모 남편', nemo_dad: '네모 아빠', nemo_mom: '네모 엄마', nemo_grandma: '네모 할머니', dong_dad: '동그라미 아빠', 'nemo_kids.kid1': '하나', 'nemo_kids.kid2': '두리', 'nemo_kids.kid3': '세찌', baby: '막둥이' };
  const whoName = (ch) => WHO[ch] || WHO[String(ch).split('.')[0]] || '이웃';
  const likedBy = (g, p) => { if (!g.cam) return g.likes.includes(p.id); const it = Room.item(p.id); return !!(it && it.src && it.src.game === g.frm); };
  Room.guestBook = function (parent) {
    const sc = el('div', 'uk-scrim h2-cat', ovRoot(parent)), sh = el('div', 'uk-sheet h2-presh', sc), S = ensure(), L0 = Room.guestList().filter((g) => !g.cam || g.got), by = {}; L0.forEach((g) => { const k = g.who || whoName(g.char), q = by[k] || (by[k] = { who: k, char: g.char, apps: [], props: [], n: 0, max: 0, need: g.need, lines: [], ids: [] }); if (g.app && !q.apps.includes(g.app)) q.apps.push(g.app); if (g.cam && g.prop) q.props.push(g.prop); const n = (S.guests[g.id] || {}).n || 0; q.n += n; q.max += g.max; q.need = Math.min(q.need, g.need); q.ids.push(g.id); if (n) q.lines.push(g.lines[Math.min(n - 1, g.lines.length - 1)]); });
    const L = Object.values(by).sort((x, y) => ((y.n > 0) - (x.n > 0)) || x.need - y.need), seen = L.filter((g) => g.n > 0).length;
    el('h2', '', sh, kid() ? '👋' : '손님 도감 ' + seen + '/' + L.length); if (!kid()) el('p', 'h2-dsub', sh, '아늑함이 쌓이면 손님이 놀러 와요. 앱에서 만난 카메오도 찾아와요.');
    L.forEach((g) => { const n = g.n, c = el('div', 'h2-pcard' + (n ? '' : ' off'), sh), pv = el('div', 'h2-gface', c); if (Room.cfg.charSrc) { const im = el('img', '', pv); im.src = Room.cfg.charSrc(g.char); im.alt = ''; } const tx = el('div', 'h2-ptx', c);
      if (!kid()) { el('b', '', tx, g.who + ' · ' + g.apps.join(' · ') + (g.props.length ? ' ' + g.props.join('') : '')); el('small', '', tx, n ? (g.lines[g.lines.length - 1] || '') : '아직 안 왔어요 · 아늑함 ' + g.need + ' 이상'); el('small', 'h2-pcnt', tx, `방문 ${n}/${g.max}`); } else el('small', '', tx, '⭐'.repeat(n)); });
    UK.btn({ text: kid() ? null : '닫기', icon: kid() ? 'close' : null, cls: 'ghost', onclick: () => sc.remove() }, el('div', 'acts', sh)); return sc;
  };
  /* ---------------- 집 구경 코드(A4): 방 배치를 짧은 글자로 주고받아 읽기 전용으로 구경(서버 없음) ---------------- */
  // 형식: GFH1-<방>-<가구>.<가구>…-<검사>  가구 = 번호~x~y~(뒤집힘 0/1)(색 번호) 모두 36진수. 검사 = Room._chk(앞부분).
  Room.layoutCode = function (rid) {
    const S = ensure(), L = (S.placed[rid] || []).map((p) => ({ p, it: Room.item(p.id) })).filter((q) => q.it && q.it.no).slice(0, 60);
    const body = L.map(({ p, it }) => [it.no.toString(36), Math.max(0, p.x | 0).toString(36), Math.max(0, p.y | 0).toString(36), (p.flip ? 1 : 0) + '' + Math.max(0, Math.min(3, p.v != null ? p.v : it.colors.indexOf(p.c)))].join('~')).join('.'), head = 'GFH1-' + rid + '-' + body;
    return head + '-' + Room._chk(head);
  };
  /** 코드 → {ok, room, list} | {ok:false, why}. 모르는 가구·범위 밖 값은 버리거나 고쳐서 안전하게. */
  Room.decodeLayout = function (code) {
    code = String(code || '').trim().replace(/\s+/g, ''); const m = /^GFH1-([a-z0-9_]+)-([0-9a-z~.]*)-([0-9A-Z]{2})$/.exec(code); if (!m) return { ok: false, why: 'format' };
    if (Room._chk(code.slice(0, code.lastIndexOf('-'))) !== m[3]) return { ok: false, why: 'check' }; const R = roomDef(m[1]); if (!R || R.group !== grp()) return { ok: false, why: 'room' };
    const list = []; (m[2] ? m[2].split('.') : []).slice(0, 60).forEach((ch) => { const f = ch.split('~'); if (f.length !== 4) return; const no = parseInt(f[0], 36), it = Room.data.items.find((i) => i.no === no); if (!it || !inGroup(it)) return; const g = geo(it), x = Math.max(0, Math.min(RW - g.w, parseInt(f[1], 36) || 0)), y = Math.max(0, Math.min(RH - g.h, parseInt(f[2], 36) || 0)), v = Math.max(0, Math.min(Room.variants(it).length - 1, parseInt(f[3].slice(1), 10) || 0)), c = Room.variants(it)[v].c; list.push({ id: it.id, x, y, flip: f[3][0] === '1' ? 1 : 0, c, v }); });
    return { ok: true, room: m[1], list, name: R.name };
  };
  Room.visitSheet = function (parent) {
    const sc = el('div', 'uk-scrim h2-cat', ovRoot(parent)), sh = el('div', 'uk-sheet h2-presh', sc); el('h2', '', sh, '집 구경 코드'); el('p', 'h2-dsub', sh, '내 방의 코드를 알려 주거나, 받은 코드로 친구 집을 구경해요. 구경만 하고 바뀌는 건 없어요.');
    const mine = el('div', 'h2-codebox', sh), R0 = (rooms().find((r) => r.id === Room._curRoom) || rooms()[0]); el('b', '', mine, '내 방 코드 · ' + (R0 ? R0.name : '')); const out = el('textarea', 'h2-code', mine); out.readOnly = true; out.value = R0 ? Room.layoutCode(R0.id) : '';
    UK.btn({ text: '복사', cls: 'sky sm', onclick: () => { out.select(); let okc = false; try { navigator.clipboard.writeText(out.value); okc = true; } catch (e) { try { okc = document.execCommand('copy'); } catch (x) { /* 복사 불가 */ } } toastH(okc ? '코드를 복사했어요' : '코드를 길게 눌러 복사해요', sc); } }, mine);
    const rec = el('div', 'h2-codebox', sh); el('b', '', rec, '받은 코드로 구경'); const inp = el('textarea', 'h2-code', rec); inp.placeholder = 'GFH1-…'; const msg = el('p', 'h2-dsub', rec, '');
    UK.btn({ text: '구경하기', cls: 'green sm', onclick: () => { const r = Room.decodeLayout(inp.value); if (!r.ok) { msg.textContent = { format: '코드 모양이 달라요', check: '코드가 틀렸어요(한 글자씩 확인해 봐요)', room: '이 앱에서는 볼 수 없는 방이에요' }[r.why] || '코드를 읽지 못했어요'; return; } sc.remove(); Room.visitView(r, parent); } }, rec);
    if (!kid()) {      // 원정 전리품 코드(B6): 기하학 원정대에서 받은 6자리 코드를 입력하면 가구가 생긴다(앱 사이 연결은 코드로만 — D12)
      const lt = el('div', 'h2-codebox', sh); el('b', '', lt, '원정 전리품 코드'); el('small', '', lt, '기하학 원정대에서 단계를 깨고 받은 6자리 코드'); const row = el('div', 'h2-coderow', lt), ci = el('input', 'h2-code1', row); ci.maxLength = 8; ci.placeholder = 'A1B2C3'; ci.autocomplete = 'off'; ci.autocapitalize = 'characters'; ci.spellcheck = false; ci.oninput = () => { const v = ci.value.toUpperCase().replace(/[^0-9A-Z]/g, ''); if (v !== ci.value) ci.value = v; };
      UK.btn({ text: '붙여넣기', cls: 'sky sm', onclick: async () => { try { const t = await navigator.clipboard.readText(); ci.value = String(t || '').toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 8); ci.dispatchEvent(new Event('input')); } catch (e) { toastH('칸을 길게 눌러 붙여넣어요', sc); } } }, row); const cm = el('p', 'h2-dsub', lt, '');
      UK.btn({ text: '받기', cls: 'gold block', onclick: () => { const r = Room.redeem(ci.value); if (!r.ok) { cm.textContent = { len: '6자리로 적어 주세요', check: '코드가 틀렸어요', item: '없는 코드예요' }[r.why] || '받지 못했어요'; return; } if (!r.isNew) { cm.textContent = '이미 가지고 있는 가구예요'; return; } sc.remove(); Room.dropCard(r.item.id, parent, () => { Room._redraw && Room._redraw(); }, { openHouse: () => { Room._redraw && Room._redraw(); } }); } }, lt);
    }
    UK.btn({ text: '닫기', cls: 'ghost', onclick: () => sc.remove() }, el('div', 'acts', sh)); return sc;
  };
  /** 구경 화면: 이 집의 가족이 가구를 돌아다니며 생활 동작을 한다(남의 집 느낌) */
  const OWNERS = ['nemo_dad.good', 'nemo_mom.good', 'dong_dad.calm', 'wife.joy', 'husband.joy', 'nemo_grandma.good'];
  Room.ownerLife = function (d, list, rid) {
    if (!d || !d.room || !Room.cfg.charSrc) return; const room = d.room, hosts = list.map((q, i) => ({ q, i, it: Room.item(q.id) })).filter((x) => x.it && FXD[x.it.id]); if (!hosts.length) return;
    const who = OWNERS[[...String(rid)].reduce((a, c) => a + c.charCodeAt(0), 0) % OWNERS.length], im = el('img', 'h2-guest h2-owner', room); im.src = Room.cfg.charSrc(who); im.alt = ''; let k = 0;
    const step = () => {
      if (!room.isConnected) return; const h = hosts[k++ % hosts.length], g = geo(h.it), x = Math.max(4, Math.min(RW - 60, h.q.x + g.w + 2)), y = Math.max(WALLH + 4, Math.min(RH - 80, h.q.y + g.h - 46)); im.style.left = x + 'px'; im.style.top = y + 'px';
      setTimeout(() => { if (!room.isConnected) return; const el0 = room.querySelector('.h2-it[data-i="' + h.i + '"]'); if (el0) use(room, el0, h.it, h.q); }, 1300); setTimeout(step, 3400);
    }; im.style.left = '10px'; im.style.top = (RH - 90) + 'px'; setTimeout(step, 500);
  };
  Room.visitView = function (r, parent) {
    const sc = el('div', 'uk-scrim h2-cat', ovRoot(parent)), sh = el('div', 'uk-sheet h2-presh', sc), ids = [...new Set(r.list.map((q) => q.id))], miss = ids.filter((id) => !Room.has(id));
    el('h2', '', sh, '친구의 ' + r.name); el('p', 'h2-dsub', sh, `가구 ${ids.length}개 · 내가 가진 것 ${ids.length - miss.length}개 (구경만 해요)`); const pv = el('div', 'h2-drop-pv big', sh), dv = R2.draw(pv, r.room, { mini: true, list: r.list }); Room.ownerLife(dv, r.list, r.room);
    if (miss.length) UK.btn({ text: '없는 가구 ' + miss.length + '개 위시에 담기', cls: 'gold sm block', onclick: () => { miss.forEach((id) => { if (!Room.wishOn(id)) Room.wish(id); }); toastH('♥ 위시에 담았어요', sc); } }, sh);
    UK.btn({ text: '닫기', cls: 'ghost', onclick: () => sc.remove() }, el('div', 'acts', sh)); return sc;
  };
  /* ---------------- 방 확장 연출(A7): 집 레벨이 올라 새 방이 열리면 「공사 → 완성」 짧은 컷 ---------------- */
  /** 아직 연출을 안 본 열린 방. 처음 한 번은 지금 열린 방을 모두 본 것으로 치고 연출하지 않는다. */
  Room.newRooms = function () {
    const S = ensure(); if (!S || !H()) return []; S.roomSeen = S.roomSeen || {};
    if (!S.roomSeenInit) { S.roomSeenInit = {}; }
    if (!S.roomSeenInit[grp()]) { S.roomSeenInit[grp()] = 1; Room.unlockedRooms().forEach((r) => { S.roomSeen[r.id] = 1; }); Room.save(); return []; }
    return Room.unlockedRooms().filter((r) => !S.roomSeen[r.id]);
  };
  Room.roomReveal = function (rid, parent, cb) {
    const R = roomDef(rid), S = ensure(); if (!R) { cb && cb(false); return null; } S.roomSeen = S.roomSeen || {}; S.roomSeen[rid] = 1; Room.save(); Room.albumAdd('room:' + rid, 'room', R.name + ' 열림', '새 방이 열렸어요', rid);
    const sc = el('div', 'uk-scrim h2-reveal', ovRoot(parent)), box = el('div', 'h2-rvbox', sc), pv = el('div', 'h2-rvpv', box); R2.draw(pv, rid, { mini: true, anchors: true });      // 실제 방 상태 + 점선 자리(가구를 미리 채워 보이지 않는다)
    const wall = el('div', 'h2-rvwall', pv); wall.innerHTML = '<div class="h2-rvstripe"></div><div class="h2-rvwork"><i>🚧</i><i>🔨</i><i>🧱</i></div><div class="h2-rvbar"><b></b></div>';
    const title = el('div', 'h2-rvtitle', box, kid() ? '🚪✨' : '<small>새 방이 열렸어요!</small><b>' + R.name + '</b><em>점선 자리에 가구를 채워 봐요</em>'); title.style.opacity = 0; title.style.display = 'none';
    const wk = el('div', 'h2-rvworker', box); if (Room.cfg.charSrc) { const wi = el('img', '', wk); wi.src = Room.cfg.charSrc(OWNERS[[...String(rid)].reduce((a, c) => a + c.charCodeAt(0), 0) % OWNERS.length]); wi.alt = ''; } el('b', '', wk, kid() ? '🔨🔨' : '🔨 뚝딱뚝딱…'); if (!kid()) el('small', '', wk, '새 방을 만들고 있어요');
    try { GF.sfx && GF.sfx('tukdak'); } catch (e) { /* 소리 */ }
    setTimeout(() => { wall.classList.add('lift'); try { GF.sfx && GF.sfx('celebrate'); UK.confetti(sc); } catch (e) { /* 연출 */ } wk.style.display = 'none'; title.style.display = ''; requestAnimationFrame(() => { title.style.opacity = 1; }); }, 1700);
    const acts = el('div', 'acts h2-rvacts', box); acts.style.display = 'none'; setTimeout(() => { acts.style.display = ''; }, 2000);
    UK.btn({ text: kid() ? null : '들어가 보기', icon: kid() ? 'home' : null, cls: 'green block', onclick: () => { sc.remove(); cb && cb(true); } }, acts);
    UK.btn({ text: kid() ? null : '나중에', icon: kid() ? 'close' : null, cls: 'ghost sm', onclick: () => { sc.remove(); cb && cb(false); } }, acts); return sc;
  };
  /* ---------------- 가구 상호작용(A2): 가구마다 고유한 짧은 연출·소리 ---------------- */
  // fx: steam 김 · glow 불빛 · flicker 화면 깜빡 · notes 음표 · drops 물방울 · page 책장 넘김 · tick 시계 · door 문 여닫이 · hearts 하트 · zzz 졸음 · flash 번쩍 · spin 빙글 · sparkle 반짝
  const FXD = {
    b_tv: ['flicker', '📺', 'tukdak', '퀴즈 프로그램 한다!'], p_film: ['flicker', '🎬', 'tukdak', '다음 편 바로 재생!'], p_remote: ['flicker', '📺', 'tap', '딸깍, 채널 돌려요'],
    b_sofa: ['hearts', '💛', 'hmm', '푹신푹신…'], g_cushion: ['hearts', '💛', 'hmm', '꼭 안으면 포근해요'], b_rug: ['hearts', '💛', 'hmm', '발끝이 따뜻해요'], b_bed: ['zzz', '💤', 'hmm', '스르르 눈이 감겨요'],
    b_lamp: ['glow', '💡', 'tap', '불을 켜면 아늑해요'], b_window: ['notes', '🌬️', 'wind', '바람이 솔솔'],
    p_rice: ['steam', '🍚', 'tap', '밥이 다 됐어요'], p_ramen: ['steam', '🍜', 'tap', '후루룩!'], p_mix: ['steam', '☕', 'tap', '믹스커피 한 잔'], g_teaset: ['steam', '🍵', 'whistle', '차 한잔 해요'], p_tea: ['steam', '🍵', 'whistle', '따뜻한 온천 차'],
    p_lunch: ['steam', '🍱', 'tap', '도시락 열어 볼까'], g_lunch: ['steam', '🍱', 'tap', '보자기를 풀어요'], t_bowl: ['steam', '🍚', 'tap', '밥그릇이 뜨끈해요'], b_table: ['sparkle', '🍽️', 'tap', '밥 먹자!'], p_kimchi: ['sparkle', '🥬', 'pick', '새콤하게 익었네'],
    u_fridge: ['door', '❄️', 'door', '아직 안 먹은 반찬이…'], u_drawer: ['door', '✨', 'door', '서랍이 스르륵'], b_drawer: ['door', '✨', 'door', '서랍이 스르륵'], u_shoerack: ['door', '👟', 'door', '신발이 가지런해요'], u_cart: ['sparkle', '🍎', 'pick', '장 본 것 정리!'], u_crate: ['sparkle', '🍎', 'pick', '과일이 싱싱해요'],
    b_shelf: ['page', '📖', 'page', '한 권 꺼내 볼까'], p_book: ['page', '📖', 'page', '한 장 넘겨 봐요'], a_album: ['page', '📸', 'page', '옛 사진을 넘겨요'], a_scrapbook: ['page', '📒', 'page', '스크랩을 넘겨요'], a_diary: ['page', '📔', 'page', '오늘 일기는…'],
    b_globe: ['spin', '🌍', 'flip', '어디로 갈까?'], p_globe: ['spin', '🌍', 'flip', '빙글빙글'],
    b_clock: ['tick', '🕒', 'snd_bell', '똑딱똑딱'], a_wallclock: ['tick', '🕒', 'snd_bell', '똑딱똑딱'], p_clock: ['tick', '🕒', 'snd_bell', '똑딱똑딱'],
    b_plant: ['drops', '💧', 'snd_drop', '쑥쑥 자라요'], p_flower: ['sparkle', '🌸', 'pick', '꽃향기가 나요'], y_duck: ['drops', '🦆', 'snd_drop', '꽥!'],
    a_camera: ['flash', '📸', 'shutter', '찰칵!'], a_polaroid: ['flash', '📸', 'shutter', '즉석 사진 한 장'], a_frame: ['sparkle', '🖼️', 'pick', '가족사진이 웃고 있어요'], a_photo: ['sparkle', '🖼️', 'pick', '다 같이 찍은 날'],
    p_vio: ['notes', '🎻', 'note3', '♪ 켜 볼까'], g_chess: ['sparkle', '♟️', 'tap', '한 수 두자'], b_suitcase: ['sparkle', '🧳', 'pick', '어디 갈까?'], p_bagt: ['sparkle', '🧳', 'pick', '짐 싸자!'], p_pass: ['sparkle', '✈️', 'pick', '여권 챙겼지?'], p_world: ['spin', '🗺️', 'flip', '다음 여행지는?'],
    g_hanbok: ['sparkle', '👘', 'pick', '설날엔 한복!'], k_train: ['notes', '🚂', 'snd_train', '칙칙폭폭!'],
  };
  Room.fxFor = (id) => FXD[id] || null;
  const puff = (room, cls, txt, x, y, dx, delay, dur) => { const b = el('i', 'h2-fx ' + cls, room, txt); b.style.cssText = `left:${x}px;top:${y}px;--dx:${dx || 0}px;animation-delay:${delay || 0}ms;animation-duration:${dur || 1200}ms`; setTimeout(() => b.remove(), (delay || 0) + (dur || 1200) + 80); return b; };
  const FXRUN = {
    steam: (room, x, y, e) => { for (let i = 0; i < 4; i++) puff(room, 'steam', '☁️', x + (i - 1.5) * 7, y, (i % 2 ? 6 : -6), i * 170, 1400); },
    notes: (room, x, y, e) => { ['♪', '♫', '♪'].forEach((n, i) => puff(room, 'note', n, x + (i - 1) * 12, y, (i - 1) * 8, i * 200, 1500)); },
    drops: (room, x, y, e) => { for (let i = 0; i < 3; i++) puff(room, 'drop', '💧', x + (i - 1) * 10, y - 10, 0, i * 160, 900); },
    hearts: (room, x, y, e) => { for (let i = 0; i < 3; i++) puff(room, 'rise', e, x + (i - 1) * 12, y, (i - 1) * 6, i * 180, 1400); },
    zzz: (room, x, y, e) => { ['z', 'Z', 'Z'].forEach((n, i) => puff(room, 'zzz', n, x + i * 8, y - i * 6, 10, i * 260, 1600)); },
    sparkle: (room, x, y, e) => { ['✨', '✨'].forEach((n, i) => puff(room, 'spark', n, x + (i ? 12 : -12), y - (i ? 6 : 0), 0, i * 140, 1000)); },
    page: (room, x, y, e) => { puff(room, 'page', e, x, y - 4, 0, 0, 900); },
    spin: (room, x, y, e) => { puff(room, 'spin', e, x, y - 6, 0, 0, 1000); },
    door: (room, x, y, e) => { puff(room, 'rise', e, x, y + 8, 0, 120, 1100); },
    flash: (room, x, y, e) => { const f = el('i', 'h2-flashfx', room); f.style.cssText = `left:${x - 36}px;top:${y - 36}px`; setTimeout(() => f.remove(), 450); },
    flicker: (room, x, y, e) => { const f = el('i', 'h2-tvfx', room); f.style.cssText = `left:${x - 26}px;top:${y - 4}px`; setTimeout(() => f.remove(), 1500); },
    glow: (room, x, y, e) => { const f = el('i', 'h2-glowfx', room); f.style.cssText = `left:${x - 50}px;top:${y - 30}px`; setTimeout(() => f.remove(), 1800); },
    tick: (room, x, y, e) => { puff(room, 'rise', '🕒', x, y, 0, 0, 900); },
  };
  function use(room, d, it, p) {
    d.classList.remove('use'); void d.offsetWidth; const g = geo(it), spec = FXD[it.id], cx = p.x + g.w / 2, top = Math.max(10, p.y - 4);
    if (spec) {
      const [kind, emo, snd, line] = spec; d.classList.remove('h2-a-' + kind); void d.offsetWidth; d.classList.add('h2-a-' + kind); setTimeout(() => d.classList.remove('h2-a-' + kind), 1600); try { GF.sfx && GF.sfx(snd); } catch (e) { /* 소리 */ }
      (FXRUN[kind] || FXRUN.sparkle)(room, cx, top, emo); if (!kid()) { const t = el('i', 'h2-say', room, line); t.style.cssText = `left:${Math.max(70, Math.min(RW - 70, cx))}px;top:${Math.max(4, p.y - 40)}px`; setTimeout(() => t.remove(), 1700); }
      Room._lastUse = it.id; return;
    }
    d.classList.add('use'); const t = (it.tags || [])[0]; try { GF.sfx && GF.sfx('tap'); } catch (e) { /* 소리 */ } if (!t) return;
    const b = el('i', 'h2-emote', room, EMOTE[t] || '✨'); b.style.cssText = `left:${cx}px;top:${Math.max(4, p.y - 22)}px`; setTimeout(() => b.remove(), 1400);
  }

  /* ---------------- 집 메인 화면 — 방이 주인공 ---------------- */
  Room.house2 = function (parent, opts) {
    opts = opts || {}; Room.mount = parent; parent.innerHTML = ''; parent.classList.add('rm', 'h2'); parent.style.overflow = 'hidden';
    const S = ensure(), RL = rooms(); if (!RL.length) return Room.house(parent, opts);
    let cur = (opts.room && RL.find((r) => r.id === opts.room) && opts.room) || (RL.find((r) => unlocked(r)) || RL[0]).id, place = false, sel = null, walker = null, expanded = false;
    const view = el('div', 'h2-view', parent), sheet = el('div', 'h2-sheet', parent), tools = el('div', 'h2-fab', view), top = el('div', 'h2-top', view), nav = el('div', 'h2-nav', view), stage = el('div', 'h2-stage', view), selbar = el('div', 'h2-selbar', view);
    const dreamChip = el('button', 'h2-dreamchip', view, kid() ? '✨' : '✨ 완성 모습'); dreamChip.onclick = () => Room.dreamRoom(cur, parent);
    const guestChip = el('button', 'h2-dreamchip h2-guestchip', view, kid() ? '👋' : '👋 손님'); guestChip.onclick = () => Room.guestBook(parent);
    const albChip = el('button', 'h2-dreamchip h2-albchip', view, kid() ? '📒' : '📒 앨범'); albChip.onclick = () => Room.albumSheet(parent);
    const sceneChip = el('button', 'h2-dreamchip h2-scenechip', view, ''); sceneChip.style.display = 'none';
    if (!kid()) {      // 오늘의 집 한 장면(A14): 안 본 날은 점이 붙고, 누르면 그 방으로 가서 보여 준다
      const dayChip = el('button', 'h2-dreamchip h2-daychip', view, '📅 오늘의 장면'); const mark = () => { dayChip.classList.toggle('new', !Room.dailyToday().seen); };
      dayChip.onclick = () => { const T = Room.dailyToday(); if (cur !== T.ev.room) { cur = T.ev.room; sel = null; drawAll(); } setTimeout(() => { const rm = stage.querySelector('.h2-room'); if (!rm) return; dayChip.style.visibility = 'hidden'; const first = !T.seen; if (!Room.playDaily(rm, T, () => { dayChip.style.visibility = ''; if (first) { Room.albumAdd(T.key, 'day', T.ev.title, T.ev.beats[2][1], T.ev.room); } mark(); })) dayChip.style.visibility = ''; }, cur === T.ev.room ? 60 : 700); };
      setTimeout(mark, 0);
    }
    if (kid()) { const tidyChip = el('button', 'h2-dreamchip h2-tidychip', view, '🧺'); tidyChip.onclick = () => Room.tidyGame(parent, (first) => { if (first) { try { UK.toast('⭐', parent); } catch (e) { /* 토스트 */ } } }); }
    let sceneIx = 0;
    function sceneCheck(auto) {      // 완성한 세트가 이 방의 것이면 칩을 보이고, 처음 보는 것은 한 번 자동으로 보여 준다(여러 개면 누를 때마다 다음 장면)
      const L = Room.scenesFor(cur); if (!L.length) { sceneChip.style.display = 'none'; return; } sceneIx = Math.min(sceneIx, L.length - 1); const c = L[sceneIx]; sceneChip.style.display = ''; sceneChip.textContent = kid() ? c.icon : c.icon + (c.name ? ' ' + c.name.replace(/ 세트$/, '') : ' 가족 모임');
      const playIt = (cc) => { const rm = stage.querySelector('.h2-room'); sceneChip.style.visibility = 'hidden'; if (!Room.playScene(rm, cc, () => { sceneChip.style.visibility = ''; sceneIx = (L.indexOf(cc) + 1) % L.length; sceneCheck(false); })) sceneChip.style.visibility = ''; }; sceneChip.onclick = () => playIt(L[sceneIx]);
      if (auto) { S.sceneSeen = S.sceneSeen || {}; const nws = L.filter((q) => !S.sceneSeen[q.set]), nw = nws[0]; nws.forEach((q) => { S.sceneSeen[q.set] = 1; Room.albumAdd('set:' + q.set, 'set', (Room.set(q.set) || {}).name || q.name || '세트 완성', q.text, q.room); }); if (nw) { Room.save(); sceneIx = L.indexOf(nw); setTimeout(() => { const rm = stage.querySelector('.h2-room'); if (rm && rm.isConnected && cur === nw.room) playIt(nw); }, 1500); } }
    }
    function drawTop() {
      top.innerHTML = ''; const L = Room.levelInfo(); el('div', 'h2-lv', top, kid() ? `<b>⭐ ${Math.max(1, Math.ceil(L.lv / 2))}</b>` : `<b>Lv ${L.lv}</b><span>${L.cozy}</span>`); const bw = el('div', 'h2-barw', top); el('div', 'h2-bar', bw, `<i style="width:${Math.round(L.pct * 100)}%"></i>`);
      if (!kid() && !L.max) el('small', 'h2-nx', bw, '다음 ▲' + (L.next - L.cozy));
    }
    function drawNav() {
      nav.innerHTML = ''; const idx = RL.findIndex((r) => r.id === cur), R = RL[idx]; const go = (d) => { const j = idx + d; if (j < 0 || j >= RL.length) return; cur = RL[j].id; sel = null; drawAll(); };
      const l = el('button', 'h2-ar', nav, '◀'); l.onclick = () => go(-1); l.disabled = idx === 0; const nm = el('b', 'h2-navname', nav, kid() ? '🏠' : R.name + (unlocked(R) ? '' : ' 🔒') + ' ▾'); nm.onclick = () => Room.mapSheet(parent, cur, (rid) => { cur = rid; sel = null; drawAll(); });
      const r = el('button', 'h2-ar', nav, '▶'); r.onclick = () => go(1); r.disabled = idx === RL.length - 1; const dots = el('div', 'h2-dots', nav); RL.forEach((q) => el('i', (q.id === cur ? 'on ' : '') + (unlocked(q) ? '' : 'lock'), dots));
    }
    function drawStage() { Room._curRoom = cur;
      stage.innerHTML = ''; clearTimeout(walker); const R = RL.find((r) => r.id === cur);
      if (!unlocked(R)) { const lk = el('div', 'h2-locked', stage); el('div', 'h2-lkic', lk, '🔒'); el('p', '', lk, kid() ? '⭐ ' + Math.ceil(R.unlock / 2) : '집 레벨 ' + R.unlock + '에 열려요'); dreamChip.style.display = 'none'; return; }
      dreamChip.style.display = '';
      const maxH = Math.max(200, view.clientHeight - 104 - 4), d = R2.draw(stage, cur, { place, sel, flash: opts.flash, maxH, fitWidth: true, onChange: (drag) => { if (!drag) { drawAll(); return; } afterChange(); }, onSel: (i) => { sel = i; drawSel(); } });
      d.wrap.style.margin = '0 auto'; d.wrap.__fit && d.wrap.__fit();
      if (!place) { guestCheck(d.room, R); walk(d.room, R); }
    }
    function afterChange() { drawTop(); drawSheet(); const L = Room.levelInfo(); if (L.lv > (S.lv || 1)) { S.lv = L.lv; Room.save(); lvUp(L); if (Room.sweep()) drawStage(); } }
    function checkRooms() { const nr = Room.newRooms(); if (!nr.length || !parent.isConnected || document.querySelector('.h2-reveal')) return; Room.roomReveal(nr[0].id, parent, (go) => { if (go) { cur = nr[0].id; sel = null; drawAll(); } setTimeout(checkRooms, 400); }); }
    function lvUp(L) { Room.albumAdd('lv:' + L.lv, 'level', '집 레벨 ' + L.lv, '아늑함 ' + Number(L.cozy).toLocaleString('ko-KR'), cur); setTimeout(checkRooms, 1400); try { UK.confetti(parent); GF.sfx && GF.sfx('celebrate'); } catch (e) {} const nr = rooms().find((r) => r.unlock === L.lv); if (!nr) toastH(kid() ? '⭐' : '집 레벨 ' + L.lv + '!', parent); }      // 새 방이 열리면 연출이 이름을 알려 준다(토스트로 미리 말하지 않음)
    function drawSheet() {
      sheet.innerHTML = ''; sheet.className = 'h2-sheet' + (expanded ? ' open' : ''); const T = Room.tasks(), g = Room.nextGoal(Room.cfg.app || Room.cfg.game);
      const handle = el('div', 'h2-handle', sheet, '<i></i>'); const line = el('div', 'h2-line', sheet);
      if (g) { const im = el('img', '', line); im.src = Room.src(g.item); im.alt = ''; if (kid()) { el('span', 'h2-tic', line, APPICON[g.game] || '🎁'); } else { const tx = el('span', 'h2-ltx', line); el('small', '', tx, T.chapter ? T.chapter.title + ' ' + T.done + '/' + T.list.length : '다음 목표'); el('b', '', tx, '다음: ' + g.label); } const b = el('button', 'h2-go', line, UK.icon('next')); b.setAttribute('aria-label', 'go'); b.onclick = (e) => { e.stopPropagation(); Room.goApp(g.game, { parent, home: opts.go && (() => opts.go(g.game)) }); }; }
      else if (!kid()) el('span', 'h2-ltx', line, '<b>집 이야기를 모두 마쳤어요!</b>');
      const toggle = () => { expanded = !expanded; drawSheet(); }; handle.onclick = toggle; let y0 = null; const pd = (e) => { y0 = e.clientY; }; const pu = (e) => { if (y0 == null) return; const dy = e.clientY - y0; y0 = null; if (dy < -24 && !expanded) { expanded = true; drawSheet(); } else if (dy > 24 && expanded) { expanded = false; drawSheet(); } };
      handle.addEventListener('pointerdown', pd); line.addEventListener('pointerdown', pd); handle.addEventListener('pointerup', pu); line.addEventListener('pointerup', pu); line.onclick = (e) => { if (e.target.closest('.h2-go')) return; toggle(); };
      if (!expanded) return; const body = el('div', 'h2-sbody', sheet), R = RL.find((r) => r.id === cur), c = Room.roomCozy(cur);
      if (T.chapter) { if (!kid()) el('p', 'h2-tt', body, `<b>${T.chapter.title}</b> <small>${T.done}/${T.list.length}</small>`); else el('p', 'h2-tt k', body, '<span>' + '★'.repeat(T.done) + '☆'.repeat(Math.max(0, T.list.length - T.done)) + '</span>'); }
      T.show.forEach((t) => { const it = t.miss.it, sr = (it && it.src) || {}, row = el('div', 'h2-task' + (kid() ? ' kid' : ''), body); const im = el('img', '', row); im.src = it ? Room.src(it) : ''; im.alt = '';
        const go = () => Room.goApp(sr.game, { parent, home: opts.go && (() => opts.go(sr.game)) });
        if (kid()) { el('span', 'h2-tic', row, APPICON[sr.game] || '🎁'); const b = el('button', 'h2-go', row, UK.icon('next')); b.setAttribute('aria-label', 'go'); b.onclick = go; }
        else { const tx = el('div', 'h2-ttx', row); el('b', '', tx, t.label); el('small', '', tx, sr.hint || ''); const b = el('button', 'h2-go', row, '어디서? ▶'); b.onclick = go; } });
      if (!T.show.length && T.chapter && !kid()) el('p', 'h2-tt', body, '이 장의 가구를 다 모았어요!');
      if (kid()) { el('div', 'h2-bar wide', body, `<i style="width:${c.pct}%"></i>`); return; }
      const pr = el('div', 'h2-prog', body); el('span', '', pr, `방 완성도 <b>${c.pct}%</b>`); const ids = []; (R.anchors || []).forEach((a) => { const it = Room.item(a.want); if (it && !ids.includes(it.set)) ids.push(it.set); }); ids.slice(0, 2).map((id) => Room.set(id)).filter(Boolean).forEach((s) => { const its = Room.data.items.filter((i) => i.set === s.id), got = its.filter((i) => Room.has(i.id)).length; el('em', '', pr, `${s.name.replace(/ 세트.*/, '')} ${got}/${its.length}`); }); el('span', 'h2-cz', pr, `이 방 아늑함 <b>${c.total}</b>`);
    }
    function drawTools() {
      tools.innerHTML = ''; const B = (ic, label, fn, on) => { const b = el('button', 'h2-fb' + (on ? ' on' : ''), tools, kid() ? UK.icon(ic) : UK.icon(ic) + '<span>' + label + '</span>'); b.setAttribute('aria-label', label); b.onclick = fn; };
      const LM = ['auto', 'day', 'eve', 'night'], LI = { auto: '🕒', day: '☀️', eve: '🌇', night: '🌙' }, LN = { auto: '자동', day: '낮', eve: '저녁', night: '밤' }, cm = LM.includes(S.light) ? S.light : 'auto'; const lt = el('button', 'h2-fb', tools, LI[cm] + (kid() ? '' : '<span>' + LN[cm] + '</span>')); lt.setAttribute('aria-label', 'light'); lt.onclick = () => { S.light = LM[(LM.indexOf(cm) + 1) % LM.length]; Room.save(); drawAll(); };
      B('gift', '카탈로그', () => Room.catalog(parent, { onClose: drawAll, go: opts.go, room: cur })); if (!kid()) { const vb = el('button', 'h2-fb', tools, '🔗<span>구경 코드</span>'); vb.setAttribute('aria-label', 'visit'); vb.onclick = () => Room.visitSheet(parent); } if (!kid() && Room.presets(cur).length) B('heart', '테마', () => Room.presetSheet(cur, parent, (r, P) => { drawAll(); toastH(P.name + ' · ' + r.have + '개 놓았어요' + (r.missing.length ? ' (없는 ' + r.missing.length + '개는 빼고)' : ''), parent); const u = UK.btn({ text: '되돌리기', cls: 'ghost sm h2-undo', onclick: () => { Room.undoPreset(); u.remove(); drawAll(); } }, view); setTimeout(() => u.remove(), 9000); })); B(place ? 'check' : 'brush', place ? '다 놓았어요' : '놓기', () => { place = !place; sel = null; drawAll(); }, place); B('share', '사진', () => Room.photoStudio(cur, parent));
    }
    function drawSel() {
      selbar.innerHTML = ''; if (!place) return; if (sel == null) { el('p', 'h2-hint', selbar, kid() ? '' : '가구를 끌어서 옮겨 보세요'); return; } const p = (S.placed[cur] || [])[sel], it = p && Room.item(p.id); if (!it) return;
      const B = (txt, ic, fn) => UK.btn({ text: kid() ? null : txt, icon: ic, cls: 'ghost sm', onclick: fn }, selbar);
      B('돌리기', 'replay', () => { p.flip = p.flip ? 0 : 1; Room.save(); drawStage(); drawSel(); }); B('색', 'brush', () => { const j = Room.nextVariant(it, p); if (j == null) { const need = [1, 2, 3].map((i) => Room.variantNeed(i)).filter((n) => n > 0)[0]; toastH(kid() ? '🎨🔒' : '가구를 ' + (need || 1) + '개 더 모으면 다른 색이 열려요', parent); return; } p.v = j; p.c = Room.variants(it)[j].c; Room.save(); drawStage(); drawSel(); }); B('치우기', 'close', () => { S.placed[cur].splice(sel, 1); sel = null; Room.save(); drawAll(); });
    }
    function walk(room, R) {           // 살아 있는 집: 가족이 가구 앞을 돌아다니며 쓴다 — 점선 칸·손님·다른 가구와 겹치지 않는 자리로만 간다
      const char = R.char || (kid() ? 'baby.joy' : 'nemo_kids.kid1'), g = el('img', 'h2-char', room); g.src = Room.cfg.charSrc ? Room.cfg.charSrc(char) : ''; g.alt = ''; const CW = 54, CH = 70; let me = null;
      const place0 = (x, y) => { g.style.left = x + 'px'; g.style.top = y + 'px'; me = { x, y, w: CW, h: CH, me: true }; };
      const targets = () => (S.placed[cur] || []).map((p) => ({ p, it: Room.item(p.id) })).filter((q) => q.it && (q.it.tags || []).length && q.it.slot === 'floor');
      const step = () => { if (!room.isConnected) return; const L = targets(), q = L.length ? L[Math.floor(Math.random() * L.length)] : null, gq = q && geo(q.it), want = q ? { x: q.p.x - 6, y: q.p.y + gq.h - CH * 0.7 } : { x: 40 + Math.random() * 220, y: 330 };
        room.__occ = (room.__occ || []).filter((o) => !o.me); const fr = freeRect(room, CW, CH, want, { x0: 4, y0: WALLH + 20, x1: RW - 4, y1: RH - 4 }); place0(Math.round(fr.x), Math.round(fr.y)); room.__occ.push(me);
        if (q) setTimeout(() => { if (!room.isConnected) return; const b = el('i', 'h2-emote', room, EMOTE[q.it.tags[0]] || '✨'); b.style.cssText = `left:${me.x + CW / 2}px;top:${Math.max(4, me.y - 18)}px`; setTimeout(() => b.remove(), 1500); }, 3300); walker = setTimeout(step, 5200); };
      const st = freeRect(room, CW, CH, { x: 40, y: 340 }, { x0: 4, y0: WALLH + 20, x1: RW - 4, y1: RH - 4 }); place0(st.x, st.y); room.__occ.push(me); walker = setTimeout(step, 1500);
    }
    function guestCheck(room, R) {       // 손님: 아늑함 문턱을 넘으면 놀러 와 좋아하는 가구 앞에서 한마디, 선물은 확정(기본 손님 2번 · 카메오 손님은 말만 3번)
      const cz = Room.cozy(), list = S.placed[cur] || [], sk = Room.seasonKey(); let G = Room.guestList().filter((g) => (!g.cam || g.got) && ((S.guests[g.id] || {}).n || 0) < g.max && cz >= g.need + g.step * ((S.guests[g.id] || {}).n || 0)), seasonal = false;
      if (!G.length) { G = Room.guestList().filter((g) => !g.cam && g.seasonLines && ((S.guests[g.id] || {}).n || 0) >= g.max && ((S.guests[g.id] || {}).seasons || {})[sk.key] == null); seasonal = true; }      // 다 만난 손님은 철마다 한 번 놀러 와 그 철 대사를 한다(놓쳐도 벌 없음)
      if (!G.length) return;
      const g = G.find((q) => list.some((p) => likedBy(q, p))); if (!g) return; const lk = list.find((p) => likedBy(g, p)), it = Room.item(lk.id), gi = geo(it), n = (S.guests[g.id] || {}).n || 0; let gift = seasonal ? ((Room.item(g.seasonGift) || {}).src && (Room.item(g.seasonGift).src.months || []).includes(Room.now().getMonth() + 1) && !Room.has(g.seasonGift) ? g.seasonGift : null) : g.gifts[n]; if (typeof gift === 'string' && gift.indexOf('__app:') === 0) { const ga = gift.slice(6), cand = Room.data.items.filter((q) => inGroup(q) && q.src && q.src.game === ga && !Room.has(q.id) && !q.season); gift = cand.length ? cand[0].id : null; }
      let recorded = false; const record = () => { if (recorded) return; recorded = true; if (seasonal) { const rec = S.guests[g.id]; rec.seasons = rec.seasons || {}; rec.seasons[sk.key] = Date.now(); rec.seen = Date.now(); } else S.guests[g.id] = Object.assign({}, S.guests[g.id], { n: n + 1, seen: Date.now() }); Room.save(); if (n === 0) Room.albumAdd('guest:' + g.id, 'guest', (g.who || whoName(g.char)) + ' 첫 방문', g.app ? g.app + ' 손님' : '', cur); };      // 기록은 실제로 보여 줄 때만(화면이 바로 다시 그려져 취소된 방문이 사라지지 않게)
      setTimeout(() => { if (!room.isConnected) return; record(); const GW = 56, GH = 76, fr = freeRect(room, GW, GH, { x: lk.x + gi.w + 20, y: lk.y + gi.h - GH * 0.6 }, { x0: 4, y0: WALLH + 20, x1: RW - 4, y1: RH - 4 });
        const im = el('img', 'h2-guest', room); im.src = Room.cfg.charSrc ? Room.cfg.charSrc(g.char) : ''; im.alt = ''; im.style.cssText = `left:${fr.x}px;top:${fr.y}px`; room.__occ.push({ x: fr.x, y: fr.y, w: GW, h: GH, guest: true });
        const line = seasonal ? g.seasonLines[sk.idx] : (g.lines.length ? g.lines[(n + Math.floor(Math.random() * 2)) % g.lines.length] : ''), BW = kid() ? 40 : 150, BH = kid() ? 34 : 40, bp = freeRect(room, BW, BH, { x: fr.x + GW / 2, y: fr.y - BH }, { x0: 4, y0: 6, x1: RW - 4, y1: RH - BH });
        const bb = el('div', 'h2-bubble', room, kid() ? '💖' : line); bb.style.cssText = `left:${bp.x}px;top:${bp.y}px;--tx:${Math.round(Math.max(14, Math.min(BW - 14, fr.x + GW / 2 - bp.x)))}px`; bb.classList.add(bp.y + BH <= fr.y + 12 ? 'tail-d' : 'tail-u');
        setTimeout(() => { Room._quiet = 1; const gg = gift ? Room.grant(gift) : null; Room._quiet = 0; if (gg) { toastH(kid() ? '🎁' : '손님 선물 · ' + (Room.item(gift) || {}).name, parent); try { GF.sfx && GF.sfx('star'); } catch (e) {} } afterChange(); }, 2600); setTimeout(() => { im.remove(); bb.remove(); }, 4400); }, 900);
    }
    function drawAll() { drawTop(); drawNav(); drawStage(); drawTools(); drawSheet(); drawSel(); sceneCheck(!place); }
    Room._redraw = () => { sel = null; drawAll(); };
    function seasonCheck() { Room._quiet = 1; const g = Room.seasonCheck(); Room._quiet = 0; if (g) { toastH(kid() ? '🎁' : '계절 선물 · ' + g.name, parent); try { GF.sfx && GF.sfx('star'); } catch (e) {} afterChange(); drawStage(); } }
    setTimeout(() => { if (Room._recovered) { Room._recovered = null; toastH(kid() ? '🛟' : '저장이 깨져 있어서 집을 되살렸어요', parent); } Room.sweep(); drawAll(); const L0 = Room.levelInfo(); if (L0.lv > (S.lv || 1)) { S.lv = L0.lv; Room.save(); lvUp(L0); } S.lv = Math.max(S.lv || 1, L0.lv); seasonCheck(); setTimeout(() => Room.checkStory(parent, () => drawAll()), 400); setTimeout(checkRooms, 1200); }, 0);
    return { redraw: drawAll };
  };
  /** 철(봄·여름·가을·겨울) — 손님 계절 방문 키와 대사 번호. 기기 날짜 기준 */
  Room.now = () => now0();
  Room.seasonKey = () => { const d = now0(), m = d.getMonth() + 1, idx = m >= 3 && m <= 5 ? 0 : m >= 6 && m <= 8 ? 1 : m >= 9 && m <= 11 ? 2 : 3, y = m <= 2 ? d.getFullYear() - 1 : d.getFullYear(); return { idx, key: y + ':' + idx }; };
  /** 계절·이벤트 선물: 그 달에 집에 오면 하루에 하나씩(확정, 놓친 철은 다음 해에 다시) */
  Room.seasonCheck = function () {
    const S = ensure(), d = now0(), key = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(), m = d.getMonth() + 1; if (!S || S.seasonDay === key) return null;
    const it = Room.data.items.find((i) => inGroup(i) && i.src && (i.src.kind === 'season' || i.src.kind === 'event') && (i.src.months || []).includes(m) && !Room.has(i.id) && (i.id.startsWith('s2_') || i.id.startsWith('e_') || i.id.startsWith('kc_')));
    if (!it) return null; S.seasonDay = key; Room.save(); return Room.grant(it.id) ? it : null;
  };
  Room.checkStory = function (parent, cb) {
    const c = Room.chapter(); if (!c) return false; const T = Room.tasks(); if (T.done < c.tasks.length) return false; const S = ensure();
    S.story[c.room] = { done: 1, t: Date.now() }; Room.save(); Room.albumAdd('ch:' + c.room, 'chapter', c.title, '집 이야기를 마쳤어요', c.room); const fin = () => { const nx = c.reward && c.reward.unlock && rooms().find((r) => r.id === c.reward.unlock); const sc = UK.modal({ parent: ovRoot(parent), title: kid() ? '' : '방 완성!', big: '🏠', body: kid() ? '' : (c.title + '<br>아늑함 +' + ((c.reward && c.reward.cozy) || 0) + (nx ? '<br>새 방 「' + nx.name + '」이 열려요' : '')), actions: [{ text: kid() ? null : '확인', icon: kid() ? 'play' : null, cls: 'green', onclick: () => { cb && cb(); } }] }); try { UK.confetti(sc); GF.sfx && GF.sfx('celebrate'); } catch (e) {} };
    if (window.GF && GF.tale && GF.tale.play && c.cuts && c.cuts.length) GF.tale.play(c.cuts, ovRoot(parent), fin, { bg: 'indoor2' }); else fin(); return true;
  };

  /* ---------------- 카탈로그 · 꿈의 방(완성 모습) ---------------- */
  Room.dreamRoom = function (rid, parent) {
    const R = roomDef(rid); if (!R) return; const sc = el('div', 'uk-scrim h2-dream-ov', ovRoot(parent)), sh = el('div', 'uk-sheet', sc);
    if (!kid()) { el('h2', '', sh, R.name + ' · 완성 모습'); el('p', 'h2-dsub', sh, '이렇게 채우면 완성이에요'); } const pv = el('div', 'h2-drop-pv big', sh); R2.draw(pv, rid, { dream: true, mini: true });
    UK.btn({ text: kid() ? null : '닫기', icon: kid() ? 'close' : null, cls: 'ghost', onclick: () => sc.remove() }, el('div', 'acts', sh));
  };
  Room.dream = function (setId, parent) {
    const s = Room.set(setId), its = Room.data.items.filter((i) => i.set === setId && inGroup(i)), sc = el('div', 'uk-scrim h2-dream-ov', ovRoot(parent)), sh = el('div', 'uk-sheet', sc);
    if (!kid()) el('h2', '', sh, (s ? s.name : '') + ' 완성 모습'); const fr = el('div', 'h2-dframe', sh); const k = Math.ceil(its.length / 2); its.forEach((it, i) => { const im = el('img', '', fr); im.src = Room.src(it); const col = i % k, row = Math.floor(i / k); im.style.cssText = `left:${6 + col * (88 / k)}%;top:${row ? 52 : 14}%;height:${row ? 34 : 38}%`; im.alt = ''; });
    UK.btn({ text: kid() ? null : '닫기', icon: kid() ? 'close' : null, cls: 'ghost', onclick: () => sc.remove() }, el('div', 'acts', sh));
  };
  Room.catalog = function (parent, opts) {
    opts = opts || {}; const sc = el('div', 'uk-scrim h2-cat', ovRoot(parent)), sh = el('div', 'uk-sheet h2-catsh', sc); let tab = 'all', selId = null;
    const head = el('div', 'h2-cathd', sh), body = el('div', 'h2-catbody', sh), det = el('div', 'h2-det', sh); const close = el('button', 'h2-x', head, '✕'); close.onclick = () => { sc.remove(); opts.onClose && opts.onClose(); };
    const tabs = el('div', 'h2-tabs', head); const T = [['all', '전체'], ['set', '세트'], ['wish', '♥'], ['new', '새것']];
    const isPlaced = (id) => Object.values(ensure().placed).some((L) => L.some((p) => p.id === id));
    const items = () => Room.data.items.filter(inGroup).filter((i) => { if (tab === 'wish') return Room.wishOn(i.id); if (tab === 'new') return Room.has(i.id) && !isPlaced(i.id); return true; });
    function drawTabs() { tabs.innerHTML = ''; T.forEach(([k, n]) => { const b = el('button', 'h2-tab' + (k === tab ? ' on' : ''), tabs, kid() ? { all: '▦', set: '◈', wish: '♥', new: '✦' }[k] : n); b.onclick = () => { tab = k; drawAll(); }; }); }
    function card(parent2, it) {
      const own = Room.has(it.id), c = el('button', 'h2-card' + (own ? '' : ' off') + (selId === it.id ? ' sel' : ''), parent2), im = el('img', '', c); im.src = Room.src(it); im.alt = '';
      if (!kid()) { el('b', '', c, it.name.replace(/^(도형 블록|네모|세모|동그라미) /, '')); el('small', '', c, '아늑함 +' + (it.cozy || 0)); } else el('small', '', c, own ? '' : (APPICON[(it.src || {}).game] || '🎁'));
      if (Room.wishOn(it.id)) el('i', 'h2-heart', c, '♥'); c.onclick = () => { selId = it.id; drawAll(); }; return c;
    }
    function drawBody() {
      body.innerHTML = '';
      if (tab === 'set') {
        const R = roomDef(opts.room); if (R) { const bn = el('button', 'h2-dreambn', body, kid() ? '✨' : '✨ <b>' + R.name + ' 완성 모습</b> 보기'); bn.onclick = () => Room.dreamRoom(R.id, sh); }          // 세트 탭 맨 위: 꿈의 방
        sets().filter((s) => Room.data.items.some((i) => i.set === s.id && inGroup(i))).forEach((s) => { const its = Room.data.items.filter((i) => i.set === s.id && inGroup(i)), got = its.filter((i) => Room.has(i.id)).length; const h = el('div', 'h2-sh2', body, (kid() ? '' : `<b>${s.name}</b>`) + `<span>${got}/${its.length}</span>`); const pg = el('div', 'uk-progress gold', h); pg.innerHTML = `<i style="width:${got / its.length * 100}%"></i>`; if (!kid()) { const dr = el('button', 'h2-dream', h, '완성 모습'); dr.onclick = () => Room.dream(s.id, sh); } const g = el('div', 'h2-grid', body); its.forEach((it) => card(g, it)); }); return;
      }
      const g = el('div', 'h2-grid', body); const L = items(); if (!L.length) el('p', 'h2-empty', body, kid() ? '' : (tab === 'wish' ? '갖고 싶은 가구에 ♥ 를 눌러 보세요' : '여기엔 아직 없어요')); L.forEach((it) => card(g, it));
    }
    function drawDet() {
      det.innerHTML = ''; const it = selId && Room.item(selId); if (!it) { if (!kid()) el('p', 'h2-hint', det, '가구를 눌러 보세요'); return; } const own = Room.has(it.id), sr = it.src || {};
      const row = el('div', 'h2-detrow', det); const im = el('img', '', row); im.src = Room.src(it); im.alt = ''; const tx = el('div', 'h2-dtx', row);
      if (!kid()) { el('b', '', tx, it.name); el('small', '', tx, (own ? '가지고 있어요' : sr.hint ? '어디서 얻나 · ' + sr.hint : '') + ' · 아늑함 +' + (it.cozy || 0)); } else el('span', 'h2-tic', tx, APPICON[sr.game] || '🎁');
      const hb = el('button', 'h2-hbtn' + (Room.wishOn(it.id) ? ' on' : ''), row, '♥'); hb.onclick = () => { Room.wish(it.id); drawAll(); };
      { const vs = Room.variants(it), sw = el('div', 'h2-swrow', det); vs.forEach((v) => { const open = Room.variantOpen(v.i), d = el('i', 'h2-sw' + (open ? '' : ' lock'), sw); d.style.background = v.sw; if (!open) d.textContent = '🔒'; d.title = open ? '' : '가구 ' + Room.variantNeed(v.i) + '개 더'; });
        if (!kid()) { const op = vs.filter((v) => Room.variantOpen(v.i)).length, nx = vs.find((v) => !Room.variantOpen(v.i)); el('small', '', sw, `색 ${op}/${vs.length}` + (nx ? ` · 가구 ${Room.variantNeed(nx.i)}개 더 모으면 다음 색` : ' · 모두 열렸어요')); } }
      const a = el('div', 'h2-acts', det); if (own) UK.btn({ text: kid() ? null : '집에 놓기', icon: kid() ? 'home' : null, cls: 'green sm', onclick: () => { Room.placeAt(it.id); sc.remove(); opts.onClose && opts.onClose(); } }, a);
      else UK.btn({ text: kid() ? null : '어디서? ▶', icon: kid() ? 'next' : null, cls: 'gold sm', onclick: () => Room.goApp(sr.game, { parent: sc, home: opts.go && (() => { sc.remove(); opts.go(sr.game); }) }) }, a);
    }
    function drawAll() { drawTabs(); drawBody(); drawDet(); } drawAll(); return sc;
  };
  /* ---------------- 사진 꾸미기(A6): 프레임 6 · 스티커 20 · 「당신은 어느 도형인가요?」 도장 ---------------- */
  const FRAMES = [{ id: 'none', n: '없음' }, { id: 'white', n: '흰 테두리' }, { id: 'polaroid', n: '폴라로이드' }, { id: 'heart', n: '하트' }, { id: 'film', n: '필름' }, { id: 'shape', n: '세 도형' }];
  const STICKERS = ['⭐', '💛', '💗', '✨', '🎈', '🎀', '🏠', '🍚', '🌸', '🍁', '❄️', '🐶', '🐱', '🧸', '🎵', '☀️', '🌈', '📷', '👪', '🎉'];
  const FMARGIN = { none: [0, 0, 0, 0], white: [40, 40, 40, 40], polaroid: [40, 40, 150, 40], heart: [56, 56, 56, 56], film: [76, 0, 76, 0], shape: [44, 44, 44, 44] };   // 위·오른·아래·왼 (사진을 가리지 않고 둘레에)
  const drawFrame = (x, W, H, kind, label, m) => {      // W·H = 바깥 전체, m = 여백
    x.save(); const [mt, mr, mb, ml] = m;
    if (kind === 'white') { x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); }
    else if (kind === 'polaroid') { x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.fillStyle = '#6b4a00'; x.font = '800 40px sans-serif'; x.textAlign = 'center'; x.fillText(label, W / 2, H - 56); }
    else if (kind === 'heart') { x.fillStyle = '#FF8FA8'; x.fillRect(0, 0, W, H); x.font = '44px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; for (let i = 0; i < 9; i++) { x.fillText('💗', (W / 9) * (i + .5), mt / 2); x.fillText('💗', (W / 9) * (i + .5), H - mb / 2); } for (let i = 0; i < 11; i++) { x.fillText('💗', ml / 2, (H / 11) * (i + .5)); x.fillText('💗', W - mr / 2, (H / 11) * (i + .5)); } }
    else if (kind === 'film') { x.fillStyle = '#1b1b1f'; x.fillRect(0, 0, W, H); x.fillStyle = '#f4f0e6'; for (let i = 0; i < 20; i++) { x.fillRect(12 + i * (W / 20), 24, 24, 28); x.fillRect(12 + i * (W / 20), H - 52, 24, 28); } }
    else if (kind === 'shape') { x.fillStyle = '#FFC933'; x.fillRect(0, 0, W, H); x.font = '900 40px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#E5334A'; x.fillText('△', 22, 22); x.fillStyle = '#F08A3C'; x.fillText('◻', W - 22, 22); x.fillStyle = '#3B6FD6'; x.fillText('◯', 22, H - 22); x.fillStyle = '#E5334A'; x.fillText('△', W - 22, H - 22); }
    x.restore();
  };
  /* ---------------- 세트 완성 가족 장면(A11): 세트를 모두 모으면 그 방에서 가족이 특별한 동작을 한다 ---------------- */
  const FAM_A = ['nemo_dad.joy', 'nemo_mom.joy', 'nemo_kids.kid1', 'nemo_kids.kid2', 'nemo_kids.kid3', 'baby.joy', 'nemo_grandma.good'];
  const SCENES = [   // set: 세트 · room: 그 방 · chars: 모이는 가족 · emo: 머리 위 표시 · text: 띠 글 · line: 말풍선
    { set: 'build', room: 'nemo', focus: ['b_sofa', 'b_table', 'b_nemo_living'], chars: FAM_A, emo: '💛', text: '일곱 식구가 소파와 상 둘레에 둘러앉았어요', line: '다 같이 앉으니 자리가 딱이다!', icon: '🛋️' },
    { set: 'kitchen', room: 'kitchen', focus: ['b_table', 'p_rice'], chars: ['nemo_mom.joy', 'nemo_dad.joy', 'nemo_kids.kid1', 'baby.joy', 'nemo_grandma.good'], emo: '🍚', text: '엄마의 밥상에 식구들이 모였어요', line: '잘 먹겠습니다!', icon: '🍚' },
    { set: 'photo', room: 'nemo', focus: ['a_album', 'a_shelf', 'a_camera'], chars: ['nemo_dad.joy', 'nemo_mom.joy', 'nemo_kids.kid1', 'nemo_kids.kid2', 'baby.joy'], emo: '📸', text: '앨범을 펼치다 가족사진을 찍었어요', line: '하나, 둘, 김치~!', icon: '📸' },
    { set: 'kid', room: 'kid', focus: ['y_toybox', 'k_train'], chars: ['baby.joy', 'nemo_kids.kid3', 'nemo_kids.kid1'], emo: '🎵', text: '장난감 방에서 신나게 놀아요', line: '', icon: '🧸' },
    { set: 'storage', room: 'upstairs', focus: ['u_box', 'u_closet'], chars: ['nemo_mom.joy', 'nemo_kids.kid2', 'nemo_kids.kid3'], emo: '✨', text: '정리를 끝내고 모두 뿌듯해해요', line: '깔끔해졌다!', icon: '🧺' },
    { set: 'season_spring', name: '봄 소풍 세트', items: ['s2_picnic', 's2_cherry', 's2_kite', 's2_tulip'], room: 'yard', props: [['🧺', '돗자리', 22, 168, 48], ['🌸', '벚꽃', 276, 150, 54], ['🍱', '도시락', 84, 176, 38]], chars: ['nemo_mom.joy', 'nemo_dad.joy', 'nemo_kids.kid1', 'nemo_kids.kid2', 'baby.joy'], emo: '🧺', text: '벚꽃 아래 돗자리를 펴고 봄 소풍을 즐겨요', line: '도시락 맛있다!', icon: '🌸' },
    { set: 'season_summer', name: '여름 평상 세트', items: ['s2_chime', 's2_melon', 's2_tube', 's2_fan', 's2_ice'], room: 'yard', props: [['🍉', '수박', 22, 168, 48], ['🛟', '튜브', 80, 170, 46], ['🌀', '선풍기', 272, 160, 46]], chars: ['nemo_grandma.good', 'nemo_dad.joy', 'nemo_kids.kid1', 'nemo_kids.kid3', 'baby.joy'], emo: '🍉', text: '평상에 둘러앉아 수박을 나눠 먹어요', line: '아, 시원하다!', icon: '🍉' },
    { set: 'season_autumn', name: '가을 추석상 세트', items: ['s2_persimmon', 's2_moonlamp', 's2_acorn', 's2_leaf', 's_songpyeon'], room: 'nemo', props: [['🌕', '보름달', 262, 148, 56], ['🥮', '송편', 22, 172, 42], ['🍎', '과일', 80, 178, 38]], chars: FAM_A, emo: '🌕', text: '보름달 아래 온 가족이 추석상에 모였어요', line: '보름달이 환하네!', icon: '🌕' },
    { set: 'season_winter', name: '겨울 김장 세트', items: ['s2_tangerine', 's2_heater', 's2_blanket', 's2_wreath', 'p_kimchi'], room: 'kitchen', props: [['🥬', '배추', 18, 166, 48], ['🪣', '대야', 74, 168, 48], ['🧤', '고무장갑', 232, 172, 42], ['🍊', '귤', 288, 176, 34]], chars: ['nemo_mom.joy', 'nemo_dad.joy', 'nemo_kids.kid2', 'baby.joy', 'nemo_grandma.good', 'wife.joy'], emo: '🥬', text: '배추에 양념을 버무려 다 같이 김장을 해요', line: '올해 김치 대박이다!', icon: '🥬' },
    { set: 'outer', room: 'yard', focus: ['m_bench', 'o_fence'], chars: ['nemo_dad.joy', 'wife.joy', 'dong_dad.warm', 'nemo_grandma.good'], emo: '😄', text: '이웃이 마당에 모여 담소를 나눠요', line: '다음 모임도 우리 집에서!', icon: '🏡' },
  ];
  Room.setScenes = () => SCENES.filter((c) => { const its = c.items ? c.items.map((id) => Room.item(id)).filter(Boolean) : Room.data.items.filter((i) => i.set === c.set && inGroup(i)); return its.length && (!c.items || its.length === c.items.length) && its.every((i) => Room.has(i.id)); });
  Room.scenesFor = (rid) => Room.setScenes().filter((c) => c.room === rid);      // 그 방에서 볼 수 있는 완성 장면들(칩을 누를 때마다 다음 것)
  Room.sceneFor = (rid) => Room.scenesFor(rid)[0] || null;
  /** 장면 무대 소품(흐림막 위·가족 뒤): [이모지, 이름, x, y, 크기]. 장면 글에 나오는 물건은 가구가 없어도 장면 동안 임시로 그린다 */
  const stageProps = (room, list) => (list || []).map((q) => { const e = el('i', 'h2-sprop', room, q[0]); e.dataset.label = q[1]; e.style.cssText = `left:${q[2]}px;top:${q[3]}px;font-size:${q[4]}px`; return e; });
  const playing = (room, on) => { const v = room && room.closest && room.closest('.h2-view'); if (v) v.classList.toggle('h2-playing', !!on); };      // 재생 중엔 칩을 숨겨 앞줄 가족을 덮지 않게
  /** 장면 동안 가족 몸 아래 깔린 가구·자리 표시는 숨긴다(램프가 머리 위에 겹쳐 그려지던 문제). 끝나면 되돌린다 */
  const hideUnder = (room, imgs) => { const rb = room.getBoundingClientRect(), k = rb.width / (room.offsetWidth || rb.width) || 1, hid = [];
    setTimeout(() => { if (!room.isConnected) return; const boxes = imgs.map((im) => { const r = im.getBoundingClientRect(); return { l: r.left + r.width * 0.12, r: r.right - r.width * 0.12, t: r.top + r.height * 0.1, b: r.bottom }; });
      room.querySelectorAll('.h2-it, .h2-anchor').forEach((e) => { if (e.classList.contains('h2-focus')) return; const r = e.getBoundingClientRect(); if (boxes.some((q) => Math.min(r.right, q.r) - Math.max(r.left, q.l) > 4 && Math.min(r.bottom, q.b) - Math.max(r.top, q.t) > 4)) { e.classList.add('h2-under'); hid.push(e); } }); }, 120);
    return () => hid.forEach((e) => e.classList.remove('h2-under')); };
  Room.playScene = function (room, c, onEnd) {
    if (!Room.cfg.charSrc || !room || room.querySelector('.h2-fam')) return null; const n = c.chars.length, out = [];
    room.classList.add('scene'); playing(room, true); const stg = el('div', 'h2-stage-bg', room), bn = el('div', 'h2-scenebn', room, kid() ? c.icon : c.icon + ' ' + c.text), sp = stageProps(room, c.props); let unhide = () => {};
    // 가구 배치와 무관한 무대: 뒷줄·앞줄 반원. 크기 74px, 서로 겹치지 않게 간격을 잡는다(RW 340 안에 가운데 정렬)
    const FIT = { 'nemo_grandma.good': 1 }, back = Math.ceil(n / 2), front = n - back, CWm = 74;      // 그림 여백이 큰 인물은 크게 보정(할머니가 절반 크기로 보이던 문제)
    const foc = []; Array.from(room.querySelectorAll('.h2-it')).forEach((im) => { if ((c.focus || []).includes(im.dataset.id)) { im.classList.add('h2-focus'); foc.push({ x: parseFloat(im.style.left), y: parseFloat(im.style.top), w: parseFloat(im.style.width), h: parseFloat(im.style.height) }); } });
    let cx = 170, ytop = 238; if (foc.length) { const x0 = Math.min(...foc.map((f) => f.x)), x1 = Math.max(...foc.map((f) => f.x + f.w)), yb = Math.max(...foc.map((f) => f.y + f.h)); cx = (x0 + x1) / 2; ytop = Math.max(180, Math.min(252, yb - 30)); }      // 소파·상 같은 초점 가구는 또렷이 두고 그 앞(둘레)에 앉힌다
    const mk = (cnt, y, i0) => { const gap = Math.min(82, (336 - 24) / Math.max(cnt, 1)), x0 = Math.max(CWm / 2 + 4, Math.min(340 - CWm / 2 - 4 - (cnt - 1) * gap, cx - (cnt - 1) * gap / 2)); return Array.from({ length: cnt }, (_, i) => ({ x: x0 + i * gap - CWm / 2, y, k: i0 + i })); };
    const slots = n <= 3 ? mk(n, Math.min(330, ytop + 40), 0) : mk(back, ytop, 0).concat(mk(front, Math.min(350, ytop + 96), back));
    c.chars.forEach((id, i) => {
      const sl = slots[i], im = el('img', 'h2-char h2-fam', room); im.src = Room.cfg.charSrc(id); im.alt = ''; im.style.cssText = `left:${sl.x}px;top:${sl.y}px;width:${CWm}px;height:${CWm}px;opacity:0;transition:opacity .45s ${i * 110}ms`;
      if (FIT[id]) im.addEventListener('load', () => { try { const cv = document.createElement('canvas'); cv.width = cv.height = 100; const cx2 = cv.getContext('2d'); cx2.drawImage(im, 0, 0, 100, 100); const d = cx2.getImageData(0, 0, 100, 100).data; let t = 100, b = 0; for (let y = 0; y < 100; y++) for (let x = 0; x < 100; x++) if (d[(y * 100 + x) * 4 + 3] > 40) { if (y < t) t = y; if (y > b) b = y; } const vis = (b - t + 1) / 100; if (vis < 0.2) return; const wz = Math.round(Math.min(CWm * 1.6, CWm * 0.885 / vis)); im.style.width = im.style.height = wz + 'px'; im.style.left = (sl.x - (wz - CWm) / 2) + 'px'; im.style.top = (sl.y - (wz - CWm)) + 'px'; } catch (e) { /* 측정 실패는 그대로 */ } });
      // (위) 그림 여백이 큰 인물은 보이는 그림 높이를 다른 어른(칸의 88%)에 맞춘다
      setTimeout(() => { im.style.opacity = 1; }, 60); out.push(im);
      setTimeout(() => { if (!room.isConnected) return; const e = el('i', 'h2-emote', room, c.emo); e.style.cssText = `left:${sl.x + CWm / 2}px;top:${sl.y - 14}px;font-size:26px`; setTimeout(() => e.remove(), 1500); }, 800 + i * 150);
    });
    try { GF.sfx && GF.sfx('celebrate'); } catch (e) { /* 소리 */ } if (!kid() && c.line) setTimeout(() => { if (!room.isConnected) return; const t = el('i', 'h2-say', room, c.line); t.style.cssText = `left:170px;top:${slots[0].y - 46}px`; setTimeout(() => t.remove(), 2400); }, 1500);
    setTimeout(() => { out.forEach((im) => { im.style.opacity = 0; }); bn.style.opacity = 0; stg.style.opacity = 0; setTimeout(() => { out.forEach((im) => im.remove()); sp.forEach((e) => e.remove()); unhide(); bn.remove(); stg.remove(); room.classList.remove('scene'); playing(room, false); room.querySelectorAll('.h2-focus').forEach((e) => e.classList.remove('h2-focus')); onEnd && onEnd(); }, 520); sp.forEach((e) => { e.style.opacity = 0; }); }, 5600); unhide = hideUnder(room, out); return out;
  };
  /* ---------------- 집 지도(A13): 집이 층·마당으로 커진 모습. 열린 방은 눌러서 가고, 잠긴 방은 몇 레벨에 열리는지 보여 준다 ---------------- */
  const MAPF = { adult: [['옥상', ['roof']], ['2층', ['attic', 'upstairs']], ['1층', ['entrance', 'nemo', 'kitchen', 'semo', 'dong']], ['마당', ['yard', 'garden']]], kid: [['우리 방', ['bath', 'kid', 'wardrobe', 'dining', 'toyroom']]] };
  const MAPI = { roof: '🌇', attic: '🕯️', upstairs: '🛏️', entrance: '🚪', nemo: '🛋️', kitchen: '🍚', semo: '💌', dong: '📚', yard: '🌻', garden: '🐔', bath: '🛁', kid: '🧸', wardrobe: '👕', dining: '🥣', toyroom: '🚂' };
  Room.mapSheet = function (parent, cur, onGo) {
    const S = ensure(), RL = rooms(), L = Room.level(), sc = el('div', 'uk-scrim h2-cat', ovRoot(parent)), sh = el('div', 'uk-sheet h2-presh h2-map', sc);
    el('h2', '', sh, kid() ? '🏠' : '우리 집 지도'); const open = RL.filter(unlocked).length; if (!kid()) el('p', 'h2-dsub', sh, '방 ' + open + '/' + RL.length + ' 열림 · 집 레벨 ' + L + '. 레벨이 오르면 층과 마당이 늘어나요.');
    const locked = RL.filter((r) => !unlocked(r)).sort((a, b) => a.unlock - b.unlock), nextId = locked.length ? locked[0].id : null, seen = new Set(), body = el('div', 'h2-mapbody', sh);
    const floors = (MAPF[grp()] || []).map((fl) => [fl[0], fl[1].map((id) => RL.find((r) => r.id === id)).filter(Boolean)]); const rest = RL.filter((r) => !floors.some((fl) => fl[1].includes(r))); if (rest.length) floors.push([kid() ? '' : '그 밖', rest]);
    floors.forEach(([label, list]) => {
      if (!list.length) return; const row = el('div', 'h2-mapfl', body); if (!kid()) el('small', '', row, label); const cells = el('div', 'h2-mapcells', row);
      list.forEach((r) => {
        const ok = unlocked(r), have = (S.placed[r.id] || []).length, tot = (r.anchors || []).length, c = el('button', 'h2-mapc' + (ok ? '' : ' lock') + (r.id === cur ? ' cur' : '') + (r.id === nextId ? ' next' : ''), cells);
        c.style.background = 'linear-gradient(180deg,' + r.wall + ' 0 55%,' + r.floor + ' 55%)'; el('span', 'ic', c, ok ? (MAPI[r.id] || '🏠') : '🔒');
        if (kid()) { if (!ok) el('i', 'lv', c, '⭐' + Math.ceil(r.unlock / 2)); } else { el('b', '', c, r.name); el('i', 'lv', c, ok ? '가구 ' + have + '개' : (r.id === nextId ? '다음 · ' : '') + 'Lv ' + r.unlock); }
        c.onclick = () => { if (ok) { sc.remove(); onGo && onGo(r.id); } else { try { GF.sfx && GF.sfx('hmm'); } catch (e) { /* 소리 */ } UK.toast(kid() ? '⭐ ' + Math.ceil(r.unlock / 2) : r.name + ': 집 레벨 ' + r.unlock + '에 열려요 (지금 ' + L + ')', sc); } };
      });
    });
    UK.btn({ text: kid() ? null : '닫기', icon: kid() ? 'close' : null, cls: 'ghost', onclick: () => sc.remove() }, el('div', 'acts', sh)); return sc;
  };
  /* ---------------- 오늘의 집 한 장면(A14, 성인): 하루에 하나, 가족의 작은 생활 사건. 눌러서 보고, 놓친 날은 그냥 지나간다(벌·연속 없음). 새 문장은 모두 [제안] ---------------- */
  const D_EV = [
    { id: 'ramen', props: [['🫕', '냄비', 60, 326, 46], ['🍜', '라면', 232, 326, 46]], must: ['냄비'],  room: 'kitchen', title: '라면 끓이기', chars: ['nemo_dad.joy', 'nemo_kids.kid1'], beats: [['🫕', '냄비에 물을 올렸어요.'], ['🌶️', '스프를 넣고 후후 저어요.'], ['🍜', '후루룩! 역시 밤 라면이 제일이야.']] },
    { id: 'nap', props: [['🛋️', '소파', 96, 214, 120], ['🧸', '담요', 232, 326, 40]], must: ['소파', '담요'],  room: 'nemo', title: '낮잠', chars: ['nemo_dad.joy', 'nemo_mom.joy'], beats: [['😴', '소파에 앉자마자 눈이 감겼어요.'], ['💤', '쿨쿨… 오늘은 조용한 일요일 같아요.'], ['🧸', '엄마가 살며시 담요를 덮어 줘요.']] },
    { id: 'parcel', props: [['📦', '택배', 60, 326, 48], ['🎁', '선물', 232, 326, 44]], must: ['택배', '선물'],  room: 'entrance', title: '택배 도착', chars: ['nemo_mom.joy', 'baby.joy'], beats: [['📦', '딩동! 택배가 왔어요.'], ['✂️', '막둥이가 먼저 뜯어 보겠대요.'], ['🎁', '앗, 외할머니가 보낸 선물이다!']] },
    { id: 'laundry', props: [['🧺', '빨래 바구니', 60, 326, 46], ['👕', '빨래', 232, 316, 52]], must: ['빨래 바구니'],  room: 'yard', title: '빨래 널기', chars: ['nemo_mom.joy', 'nemo_kids.kid2'], beats: [['🧺', '빨래 바구니를 들고 마당으로 나가요.'], ['☀️', '햇볕이 쨍! 널기 딱 좋은 날.'], ['👕', '뽀송뽀송 마르면 같이 걷어요.']] },
    { id: 'study', props: [['📚', '책상', 60, 326, 46], ['✏️', '연필', 232, 326, 40]], must: ['책상'],  room: 'dong', title: '숙제 시간', chars: ['dong_dad.warm', 'nemo_kids.kid3'], beats: [['📚', '책상에 나란히 앉았어요.'], ['✏️', '모르는 건 아빠한테 물어봐요.'], ['⭐', '다 했다! 오늘도 잘했어요.']] },
    { id: 'photo', props: [['📷', '사진', 60, 326, 46], ['🗺️', '지도', 232, 326, 44]], must: ['사진'],  room: 'semo', title: '여행 사진 보기', chars: ['wife.joy', 'nemo_dad.joy'], beats: [['📷', '서랍에서 옛날 사진을 꺼냈어요.'], ['🗺️', '여기가 어디였더라? 하고 웃어요.'], ['💛', '다음엔 같이 또 가요.']] },
    { id: 'rain', props: [['☔', '창밖', 60, 326, 46], ['🍵', '차', 232, 326, 44]], must: ['창밖', '차'],  room: 'nemo', title: '비 오는 날', chars: ['nemo_kids.kid1', 'baby.joy', 'nemo_grandma.good'], beats: [['☔', '창밖에 비가 주룩주룩 와요.'], ['🍵', '할머니가 따뜻한 차를 내려 줘요.'], ['🌈', '비가 그치니 무지개가 떴어요.']] },
    { id: 'gimbap', room: 'kitchen', title: '김밥 싸기', props: [['🍙', '김밥', 60, 326, 46], ['🔪', '칼', 232, 326, 40]], must: ['김밥'], chars: ['nemo_mom.joy', 'nemo_kids.kid2'], beats: [['🍙', '김에 밥을 얇게 펴요.'], ['🥕', '당근이랑 시금치를 올려요.'], ['😋', '꼬다리는 제일 먼저 먹는 사람 몫이에요.']] },
    { id: 'dishes', room: 'kitchen', title: '설거지', props: [['🧽', '수세미', 60, 326, 44], ['🍽️', '그릇', 232, 326, 44]], must: ['그릇'], chars: ['nemo_dad.joy', 'nemo_kids.kid1'], beats: [['🫧', '거품을 퐁퐁 내요.'], ['🍽️', '그릇이 뽀드득 소리를 내요.'], ['✨', '반짝반짝, 오늘도 끝!']] },
    { id: 'boardgame', room: 'nemo', title: '보드게임', props: [['🎲', '주사위', 60, 326, 44], ['♟️', '말', 232, 326, 44]], must: ['주사위'], chars: ['nemo_kids.kid1', 'nemo_kids.kid3', 'nemo_dad.joy'], beats: [['🎲', '주사위를 굴려요.'], ['😲', '앗, 한 칸 차이로 졌어요!'], ['😄', '한 판 더! 이번엔 내가 이긴다.']] },
    { id: 'cleaning', room: 'nemo', title: '대청소', props: [['🧹', '빗자루', 60, 326, 46], ['🪣', '양동이', 232, 326, 44]], must: ['빗자루'], chars: ['nemo_mom.joy', 'nemo_kids.kid2', 'baby.joy'], beats: [['🧹', '빗자루로 구석구석 쓸어요.'], ['🫧', '막둥이가 먼지를 따라다녀요.'], ['🌿', '창문을 열자 바람이 시원해요.']] },
    { id: 'storybook', room: 'nemo', title: '그림책 읽어 주기', props: [['📖', '그림책', 60, 326, 46], ['🧸', '인형', 232, 326, 40]], must: ['그림책'], chars: ['nemo_grandma.good', 'baby.joy'], beats: [['📖', '할머니가 그림책을 펼쳐요.'], ['👂', '막둥이가 귀를 쫑긋해요.'], ['🌙', '다 읽기도 전에 눈이 스르르 감겨요.']] },
    { id: 'shoes', room: 'entrance', title: '신발 정리', props: [['👟', '운동화', 60, 326, 44], ['🧦', '양말', 232, 326, 40]], must: ['운동화'], chars: ['nemo_kids.kid1', 'nemo_kids.kid2'], beats: [['👟', '현관에 운동화가 뒤죽박죽이에요.'], ['🧦', '짝을 맞춰 나란히 세워요.'], ['👍', '가지런해서 기분이 좋아요.']] },
    { id: 'umbrella', room: 'entrance', title: '우산 말리기', props: [['☂️', '우산', 60, 326, 50], ['💧', '물방울', 232, 326, 36]], must: ['우산'], chars: ['nemo_dad.joy', 'nemo_kids.kid3'], beats: [['☔', '비 맞은 우산을 펴서 세워 둬요.'], ['💧', '똑똑, 물방울이 떨어져요.'], ['🌤️', '내일은 맑을 거래요.']] },
    { id: 'watering', room: 'yard', title: '화분 물 주기', props: [['🪴', '화분', 60, 326, 50], ['🚿', '물뿌리개', 232, 326, 46]], must: ['화분', '물뿌리개'], chars: ['nemo_mom.joy', 'baby.joy'], beats: [['🚿', '물뿌리개를 들고 마당으로 나가요.'], ['🌱', '목마른 화분부터 먼저 줘요.'], ['🌼', '다음 주엔 꽃이 필 것 같아요.']] },
    { id: 'cat', room: 'yard', title: '고양이 간식', props: [['🐈', '고양이', 60, 326, 48], ['🐟', '간식', 232, 326, 40]], must: ['고양이', '간식'], chars: ['nemo_kids.kid2', 'nemo_kids.kid3'], beats: [['🐈', '담장 위에 낯익은 고양이가 앉았어요.'], ['🐟', '조심조심 간식을 내밀어요.'], ['😻', '골골송을 부르며 다가와요.']] },
    { id: 'stars', room: 'yard', title: '별 보기', props: [['🌙', '달', 60, 326, 48], ['⭐', '별', 232, 326, 46]], must: ['별'], chars: ['nemo_dad.joy', 'nemo_kids.kid1', 'baby.joy'], beats: [['🌌', '저녁을 먹고 마당에 나왔어요.'], ['⭐', '별똥별이 휙 지나가요.'], ['🙏', '소원은 비밀이에요.']] },
    { id: 'letter', room: 'semo', title: '편지 쓰기', props: [['✉️', '편지', 60, 326, 46], ['🖋️', '펜', 232, 326, 40]], must: ['편지'], chars: ['wife.joy'], beats: [['✉️', '먼 곳의 친구에게 편지를 써요.'], ['🖋️', '쓰고 지우고, 또 써요.'], ['💌', '우체통에 쏙, 잘 도착하길!']] },
    { id: 'violin', room: 'dong', title: '바이올린 연습', props: [['🎻', '바이올린', 60, 326, 48], ['🎼', '악보', 232, 326, 44]], must: ['바이올린', '악보'], chars: ['dong_dad.warm', 'nemo_kids.kid3'], beats: [['🎼', '악보를 펼치고 활을 잡아요.'], ['🎻', '처음엔 삐걱, 조금 지나면 사르르.'], ['👏', '마지막엔 모두가 박수를 쳐요.']] },
    { id: 'bedding', room: 'upstairs', title: '이불 정리', props: [['🛏️', '침대', 60, 326, 48], ['🪻', '이불', 232, 326, 42]], must: ['침대', '이불'], chars: ['nemo_mom.joy', 'nemo_kids.kid2'], beats: [['🛏️', '아침 해가 침대 위로 들어와요.'], ['🪻', '이불을 탁탁 털어요.'], ['😌', '정리하니 방이 환해졌어요.']] },
    { id: 'hideseek', room: 'upstairs', title: '숨바꼭질', props: [['🚪', '옷장', 60, 326, 50], ['👀', '눈', 232, 326, 38]], must: ['옷장'], chars: ['nemo_kids.kid1', 'nemo_kids.kid3', 'baby.joy'], beats: [['🙈', '하나, 둘, 셋… 눈을 감아요.'], ['🚪', '옷장 문틈으로 눈이 반짝!'], ['🤭', '막둥이는 이불 속에서 웃음이 터졌어요.']] },
    { id: 'fireworks', room: 'roof', title: '옥상 불꽃놀이', props: [['🎆', '불꽃', 60, 326, 52], ['🏮', '등불', 232, 326, 44]], must: ['불꽃'], chars: ['nemo_dad.joy', 'wife.joy', 'nemo_kids.kid2'], beats: [['🏮', '옥상에 등불을 걸어요.'], ['🎆', '펑! 불꽃이 하늘에 피어나요.'], ['😍', '세 도형이 한 하늘을 올려다봐요.']] },
  ];
  Room.dailyEvents = () => D_EV;
  Room.dailyToday = function () {
    const d = now0(), k = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(), open = new Set(Room.unlockedRooms().map((r) => r.id)), list = D_EV.filter((e) => open.has(e.room)), ev = (list.length ? list : D_EV.filter((e) => e.room === 'nemo'))[k % (list.length || 1)] || D_EV[1];
    return { ev, key: 'day:' + k, seen: !!(ensure().album || []).some((a) => a.k === 'day:' + k) };
  };
  Room.playDaily = function (room, T, onEnd) {
    if (!Room.cfg.charSrc || !room || room.querySelector('.h2-fam')) return null; const ev = T.ev, n = ev.chars.length, out = []; room.classList.add('scene'); playing(room, true); const sp = stageProps(room, ev.props); let unhide = () => {};
    const stg = el('div', 'h2-stage-bg', room), bn = el('div', 'h2-scenebn', room, '📅 ' + ev.title), cap = el('i', 'h2-daycap', room, ''); cap.style.opacity = 0;
    ev.chars.forEach((id, i) => { const im = el('img', 'h2-char h2-fam', room); im.src = Room.cfg.charSrc(id); im.alt = ''; const gap = 96, x0 = 170 - ((n - 1) * gap) / 2 - 40; im.style.cssText = `left:${x0 + i * gap}px;top:250px;width:80px;height:80px;opacity:0;transition:opacity .45s ${i * 150}ms`; setTimeout(() => { im.style.opacity = 1; }, 60); out.push(im); });
    ev.beats.forEach((bt, i) => setTimeout(() => { if (!room.isConnected) return; cap.textContent = bt[1]; cap.style.opacity = 1; const e = el('i', 'h2-emote', room, bt[0]); e.style.cssText = `left:${150 + (i % 2) * 40}px;top:206px;font-size:40px`; setTimeout(() => e.remove(), 1500); try { GF.sfx && GF.sfx(i === ev.beats.length - 1 ? 'celebrate' : 'tap'); } catch (x) { /* 소리 */ } }, 700 + i * 2100));
    const total = 700 + ev.beats.length * 2100 + 600; setTimeout(() => { out.forEach((im) => { im.style.opacity = 0; }); bn.style.opacity = 0; stg.style.opacity = 0; cap.remove(); setTimeout(() => { out.forEach((im) => im.remove()); sp.forEach((e) => e.remove()); unhide(); bn.remove(); stg.remove(); room.classList.remove('scene'); playing(room, false); onEnd && onEnd(); }, 520); sp.forEach((e) => { e.style.opacity = 0; }); }, total); unhide = hideUnder(room, out); return out;
  };
  /* ---------------- 유아 집 「오늘의 정리 놀이」(A12): 글자 없이, 흩어진 장난감을 같은 모양 그림자 자리에 끌어다 놓는다 ---------------- */
  const TIDY = ['🧸', '🚂', '⚽', '🥁', '🎨', '🪁', '🚗', '🦆'];
  Room.tidyToday = () => { const d = now0(), k = d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); return { key: 'tidy:' + k, seed: k }; };
  if (!UK._tidyGuard) { UK._tidyGuard = 1; const t0 = UK.toast; UK.toast = function () { return document.querySelector('.h2-tidy') ? null : t0.apply(this, arguments); }; }      // 유아 정리 놀이 중엔 토스트 금지(그림자 자리를 가린다)
  Room.tidyGame = function (parent, onEnd) {
    document.querySelectorAll('.uk-toast').forEach((e) => e.remove());
    const S = ensure(), T = Room.tidyToday(), sc = el('div', 'uk-scrim h2-tidy', ovRoot(parent)), box = el('div', 'h2-tidybox', sc), shelf = el('div', 'h2-tidyshelf', box), floor = el('div', 'h2-tidyfloor', box);
    let r = T.seed % 2147483647; const rnd = () => (r = (r * 48271) % 2147483647) / 2147483647;
    const pool = TIDY.slice(); const picks = []; while (picks.length < 5) picks.push(pool.splice(Math.floor(rnd() * pool.length), 1)[0]);
    const slots = picks.map((e) => { const s2 = el('div', 'h2-tidyslot', shelf); el('span', '', s2, e); s2.dataset.e = e; return s2; });
    let left = picks.length; const done = () => {
      try { GF.sfx && GF.sfx('celebrate'); } catch (e) { /* 소리 */ } el('div', 'h2-tidystar', box, '⭐'); const first = Room.albumAdd(T.key, 'tidy', '오늘의 정리 놀이', '장난감을 모두 제자리에', null); if (first) { S.tidyN = (S.tidyN || 0) + 1; Room.save(); }
      setTimeout(() => { sc.remove(); onEnd && onEnd(first); }, 1900);
    };
    picks.slice().sort(() => rnd() - 0.5).forEach((e, i) => {
      const t = el('div', 'h2-tidytoy', floor, e), W = 340, x = 24 + ((i * 61 + Math.floor(rnd() * 30)) % (W - 100)), y = 14 + ((i * 47 + Math.floor(rnd() * 20)) % 120); t.style.cssText += `;left:${x}px;top:${y}px`; t.dataset.e = e; t.dataset.hx = x; t.dataset.hy = y;
      let ox = 0, oy = 0, drag = false;
      t.addEventListener('pointerdown', (ev) => { if (t.classList.contains('ok')) return; drag = true; t.setPointerCapture(ev.pointerId); const b = t.getBoundingClientRect(); ox = ev.clientX - b.left; oy = ev.clientY - b.top; t.classList.add('drag'); try { GF.sfx && GF.sfx('tap'); } catch (x2) { /* 소리 */ } });
      t.addEventListener('pointermove', (ev) => { if (!drag) return; const fb = floor.getBoundingClientRect(), k = fb.width / floor.offsetWidth || 1; t.style.left = (ev.clientX - ox - fb.left) / k + 'px'; t.style.top = (ev.clientY - oy - fb.top) / k + 'px'; });
      const end = (ev) => {
        if (!drag) return; drag = false; t.classList.remove('drag'); const tb = t.getBoundingClientRect(), cx = tb.left + tb.width / 2, cy = tb.top + tb.height / 2, s2 = slots.find((q) => q.dataset.e === e), sb = s2.getBoundingClientRect();
        if (Math.hypot(cx - (sb.left + sb.width / 2), cy - (sb.top + sb.height / 2)) <= Math.max(sb.width, 72) * 0.8) { t.classList.add('ok'); s2.classList.add('filled'); const fb = shelf.getBoundingClientRect(); t.style.transition = 'left .2s, top .2s'; const k = floor.getBoundingClientRect().width / floor.offsetWidth || 1, fl = floor.getBoundingClientRect(); t.style.left = (sb.left + sb.width / 2 - tb.width / 2 - fl.left) / k + 'px'; t.style.top = (sb.top + sb.height / 2 - tb.height / 2 - fl.top) / k + 'px'; try { GF.sfx && GF.sfx('star'); } catch (x2) { /* 소리 */ } if (--left === 0) done(); }
        else { t.style.transition = 'left .25s, top .25s'; t.style.left = t.dataset.hx + 'px'; t.style.top = t.dataset.hy + 'px'; setTimeout(() => { t.style.transition = ''; }, 300); try { GF.sfx && GF.sfx('hmm'); } catch (x2) { /* 소리 */ } }
      };
      t.addEventListener('pointerup', end); t.addEventListener('pointercancel', end);
    });
    UK.btn({ icon: 'close', cls: 'ghost', onclick: () => { sc.remove(); onEnd && onEnd(false); } }, el('div', 'h2-tidyx', box)); return sc;
  };
  /* ---------------- 우리 집 앨범(A10): 장 완료·집 레벨·새 방·첫 손님·사진 저장의 순간이 날짜 도장과 함께 자동으로 쌓인다 ---------------- */
  const AL_ICON = { day: '📅', tidy: '🧺', set: '🎬', chapter: '📖', level: '⭐', room: '🚪', guest: '👋', photo: '📷', loot: '🎁' };
  Room.albumAdd = function (key, kind, title, sub, rid) {
    const S = ensure(); if (!S) return false; S.album = S.album || []; if (S.album.some((x) => x.k === key)) return false;
    const d = now0(), e = { k: key, kind, title, sub: sub || '', d: d.getFullYear() + '.' + (d.getMonth() + 1) + '.' + d.getDate(), t: d.getTime(), room: rid || null }; S.album.push(e); Room.save();
    if (rid) Room.albumThumb(e, rid); return true;
  };
  /** 그 순간의 방을 작은 사진으로(사진 기능 재사용). 최근 40장만 보관해 저장 용량을 지킨다 */
  Room.albumThumb = async function (e, rid) {
    try {
      const c = await Room.photoCanvas(rid), W = 200, H = Math.round(c.height * W / c.width), sm = document.createElement('canvas'); sm.width = W; sm.height = H; sm.getContext('2d').drawImage(c, 0, 0, W, H); e.th = sm.toDataURL('image/jpeg', 0.62);
      const S = ensure(); (S.album || []).slice().sort((a, b) => b.t - a.t).slice(40).forEach((o) => { delete o.th; }); Room.save();
    } catch (x) { /* 썸네일 실패는 아이콘으로 대신 */ }
  };
  Room.albumList = () => ((ensure() || {}).album || []).slice().sort((a, b) => b.t - a.t);
  Room.albumSheet = function (parent) {
    const sc = el('div', 'uk-scrim h2-cat', ovRoot(parent)), sh = el('div', 'uk-sheet h2-presh', sc), L = Room.albumList();
    el('h2', '', sh, kid() ? '📒' : '우리 집 앨범 ' + L.length + '장'); if (!kid()) el('p', 'h2-dsub', sh, '집에서 있었던 좋은 순간이 날짜 도장과 함께 저절로 모여요.');
    if (!L.length) el('p', 'h2-empty', sh, kid() ? '' : '아직 비어 있어요. 가구를 놓고 이야기를 열면 한 장씩 쌓여요.');
    const grid = el('div', 'h2-albgrid', sh);
    L.forEach((x) => { const c = el('div', 'h2-alb' + (x.th ? ' th' : ''), grid); if (x.th) { const im = el('img', 'h2-albth', c); im.src = x.th; im.alt = ''; el('span', 'h2-albbadge', c, AL_ICON[x.kind] || '✨'); } else el('div', 'h2-albic', c, AL_ICON[x.kind] || '✨'); if (!kid()) { el('b', '', c, x.title); if (x.sub) el('small', '', c, x.sub); } el('i', 'h2-albstamp', c, x.d); });
    UK.btn({ text: kid() ? null : '닫기', icon: kid() ? 'close' : null, cls: 'ghost', onclick: () => sc.remove() }, el('div', 'acts', sh)); return sc;
  };
  /* ---------------- 가구 색 변형(A8): 모은 가구가 늘수록 같은 가구의 다른 색이 열린다 ---------------- */
  const HUE = ['none', 'hue-rotate(60deg) saturate(1.1)', 'hue-rotate(160deg) saturate(1.05)', 'hue-rotate(250deg) saturate(1.2)'], SWATCH = ['#E8D8B8', '#FF8FA8', '#8FD3F4', '#6CCB8A'];
  const VTHR = () => (kid() ? [0, 4, 12, 24] : [0, 10, 30, 60]);      // 모은 가구 수 문턱(첫 색은 처음부터)
  /** 가구의 색 변형 목록. 색이 여러 개인 가구는 그 색들, 한 가지뿐인 그림(이모지·임시)은 색조를 돌린 3가지가 더 */
  Room.variants = (it) => (it.colors.length > 1 ? it.colors.slice(0, 4).map((c, i) => ({ i, c, f: 'none', sw: c })) : [0, 1, 2, 3].map((i) => ({ i, c: it.colors[0], f: HUE[i], sw: SWATCH[i] })));
  Room.variantOpen = (i) => Room.owned().length >= VTHR()[i];
  Room.variantNeed = (i) => Math.max(0, VTHR()[i] - Room.owned().length);
  Room.variantFilter = (it, p) => (it.colors.length > 1 ? 'none' : HUE[(p && p.v) || 0] || 'none');
  Room.nextVariant = function (it, p) {      // 열린 다음 색으로 — 열린 색이 하나뿐이면 null
    const vs = Room.variants(it), k = p.v || 0; for (let t = 1; t <= vs.length; t++) { const j = (k + t) % vs.length; if (Room.variantOpen(j)) return j === k ? null : j; } return null;
  };
  /** 방 그림(캔버스) — 사진 저장·꾸미기가 같이 쓴다 */
  Room.photoCanvas = async function (rid) {
    const R = roomDef(rid), S = ensure(), W = 1020, k = W / RW, c = document.createElement('canvas'); c.width = W; c.height = Math.round(RH * k); const x = c.getContext('2d');
    const load = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
    const bg = await load('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(bgSVG(R, Room.lightNow(S)).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '))); if (bg) x.drawImage(bg, 0, 0, W, c.height);
    const list = (S.placed[rid] || []).map((p) => ({ p, it: Room.item(p.id) })).filter((q) => q.it).sort((a, b) => (a.p.y + geo(a.it).h) - (b.p.y + geo(b.it).h));
    for (const { p, it } of list) { const im = await load(Room.src(it, p.c)); if (!im) continue; const g = geo(it), w = g.w * k, h = g.h * k; x.save(); x.filter = Room.variantFilter(it, p); if (p.flip) { x.translate(p.x * k + w, p.y * k); x.scale(-1, 1); x.drawImage(im, 0, 0, w, h); } else x.drawImage(im, p.x * k, p.y * k, w, h); x.restore(); }
    return c;
  };
  const saveCanvas = async (c, nm) => { if (window.GFSave && GFSave.image) { if (!GFSave.image(c.toDataURL('image/png'), nm)) throw new Error('save'); } else { const blob = await new Promise((r) => c.toBlob(r, 'image/png')); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nm; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); } };
  /** 사진 스튜디오: 프레임 고르기 · 스티커 붙이기(끌어서 옮김) · 도장 · 저장 */
  Room.photoStudio = async function (rid, parent) {
    const R = roomDef(rid), sc = el('div', 'uk-scrim h2-cat', ovRoot(parent)), sh = el('div', 'uk-sheet h2-presh h2-ps', sc); el('h2', '', sh, kid() ? '📷' : '사진 꾸미기'); const stage = el('div', 'h2-psstage', sh), st = { frame: 'white', stickers: [], stamp: !kid() }; Room._ps = st;
    const base = await Room.photoCanvas(rid), W = base.width, H = base.height, pw = el('div', 'h2-pswrap', stage), img = el('img', 'h2-psimg', pw); img.src = base.toDataURL('image/png'); img.draggable = false; const fr = el('div', 'h2-psframe', stage), layer = el('div', 'h2-pslayer', pw), stamp = el('div', 'h2-psstamp', pw);
    const label = (() => { const d = now0(); return d.getFullYear() + '.' + (d.getMonth() + 1) + '.' + d.getDate() + ' · ' + (R ? R.name : '우리 집'); })();
    const redraw = () => { fr.dataset.k = st.frame; fr.innerHTML = ''; stamp.style.display = st.stamp ? '' : 'none'; stamp.innerHTML = '<b>당신은 어느 도형인가요?</b> <span>△ ◻ ◯</span>'; if (st.frame === 'polaroid') fr.innerHTML = '<em>' + label + '</em>'; stage.dataset.frame = st.frame; };
    if (!kid()) {
      const fb = el('div', 'h2-psrow', sh); FRAMES.forEach((f) => { const b = el('button', 'h2-pschip' + (st.frame === f.id ? ' on' : ''), fb, f.n); b.onclick = () => { st.frame = f.id; fb.querySelectorAll('.h2-pschip').forEach((x) => x.classList.remove('on')); b.classList.add('on'); redraw(); }; });
    }
    const sb = el('div', 'h2-psrow stick', sh); STICKERS.forEach((e) => { const b = el('button', 'h2-psst', sb, e); b.onclick = () => { const o = { e, x: 0.2 + Math.random() * 0.6, y: 0.2 + Math.random() * 0.5 }; st.stickers.push(o); addSticker(o); }; });
    const addSticker = (o) => { const f = el('i', 'h2-pssticker', layer, o.e); f.style.left = o.x * 100 + '%'; f.style.top = o.y * 100 + '%'; let drag = null; f.onpointerdown = (ev) => { drag = true; f.setPointerCapture(ev.pointerId); ev.preventDefault(); }; f.onpointermove = (ev) => { if (!drag) return; const r = layer.getBoundingClientRect(); o.x = Math.max(0.02, Math.min(0.98, (ev.clientX - r.left) / r.width)); o.y = Math.max(0.02, Math.min(0.98, (ev.clientY - r.top) / r.height)); f.style.left = o.x * 100 + '%'; f.style.top = o.y * 100 + '%'; }; f.onpointerup = () => { drag = null; }; f.ondblclick = () => { st.stickers.splice(st.stickers.indexOf(o), 1); f.remove(); }; };
    const acts = el('div', 'acts h2-psacts', sh);
    if (!kid()) { const tg = el('label', 'h2-pstog', stage.parentNode.insertBefore(el('div', 'h2-psrow'), sb)); const cb = el('input', '', tg); cb.type = 'checkbox'; cb.checked = st.stamp; el('span', '', tg, '「당신은 어느 도형인가요?」 도장'); cb.onchange = () => { st.stamp = cb.checked; redraw(); }; const clr = el('button', 'h2-pschip', tg.parentNode, '스티커 지우기'); clr.onclick = () => { st.stickers.length = 0; layer.innerHTML = ''; }; }
    UK.btn({ text: kid() ? null : '저장 · 공유', icon: kid() ? 'check' : null, cls: 'green block', onclick: async () => {
      try { const c = await Room.renderPhoto(rid, st, base, label); await saveCanvas(c, 'gihaha-house-' + rid + '.png'); Room.albumAdd('photo:' + rid + ':' + Math.floor(Date.now() / 60000), 'photo', (R ? R.name : '우리 집') + ' 사진', '꾸민 사진을 저장했어요', rid); toastH(kid() ? '📷' : '방 사진을 저장했어요', sc); } catch (e) { toastH(kid() ? '📷✕' : '사진을 저장하지 못했어요', sc); }
    } }, acts);
    UK.btn({ text: kid() ? null : '닫기', icon: kid() ? 'close' : null, cls: 'ghost', onclick: () => sc.remove() }, acts); redraw(); return sc;
  };
  /** 꾸민 사진을 최종 캔버스로(미리보기와 같은 모양) */
  Room.renderPhoto = async function (rid, st, base, label) {
    const w0 = base.width, h0 = base.height, kind = st.frame || 'none', m = FMARGIN[kind] || FMARGIN.none, W = w0 + m[1] + m[3], H = h0 + m[0] + m[2], c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    if (kind !== 'none') drawFrame(x, W, H, kind, label || '', m); x.drawImage(base, m[3], m[0]);
    x.save(); x.translate(m[3], m[0]); x.font = '84px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; st.stickers.forEach((o) => x.fillText(o.e, o.x * w0, o.y * h0));
    if (st.stamp) { const bw = 640, bh = 70, bx = w0 - bw - 40, by = h0 - bh - 40; x.fillStyle = 'rgba(255,255,255,.92)'; x.beginPath(); x.roundRect ? x.roundRect(bx, by, bw, bh, 22) : x.rect(bx, by, bw, bh); x.fill(); x.fillStyle = '#6b4a00'; x.font = '900 38px sans-serif'; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText('당신은 어느 도형인가요?', bx + 24, by + bh / 2 + 2); x.font = '900 40px sans-serif'; x.fillStyle = '#E5334A'; x.fillText('△', bx + 470, by + bh / 2); x.fillStyle = '#F08A3C'; x.fillText('◻', bx + 520, by + bh / 2); x.fillStyle = '#3B6FD6'; x.fillText('◯', bx + 570, by + bh / 2); }
    x.textAlign = 'left'; x.textBaseline = 'alphabetic'; x.fillStyle = 'rgba(255,255,255,.9)'; x.font = '900 30px sans-serif'; x.fillText('기하학 가족 · 우리 집', 24, h0 - 80); x.restore(); return c;
  };
  Room.photo = async function (rid, parent) {
    try {
      const R = roomDef(rid), S = ensure(), W = 1020, k = W / RW, c = document.createElement('canvas'); c.width = W; c.height = Math.round(RH * k); const x = c.getContext('2d');
      const load = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
      const bg = await load('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(bgSVG(R, Room.lightNow(S)).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" '))); if (bg) x.drawImage(bg, 0, 0, W, c.height);
      const list = (S.placed[rid] || []).map((p) => ({ p, it: Room.item(p.id) })).filter((q) => q.it).sort((a, b) => (a.p.y + geo(a.it).h) - (b.p.y + geo(b.it).h));
      for (const { p, it } of list) { const im = await load(Room.src(it, p.c)); if (!im) continue; const g = geo(it), w = g.w * k, h = g.h * k; x.save(); if (p.flip) { x.translate(p.x * k + w, p.y * k); x.scale(-1, 1); x.drawImage(im, 0, 0, w, h); } else x.drawImage(im, p.x * k, p.y * k, w, h); x.restore(); }
      x.fillStyle = 'rgba(255,255,255,.9)'; x.font = '900 34px sans-serif'; x.fillText('기하학 가족 · 우리 집', 24, c.height - 24);
      const nm = 'gihaha-house-' + rid + '.png';
      if (window.GFSave && GFSave.image) { if (!GFSave.image(c.toDataURL('image/png'), nm)) throw new Error('save'); } else { const blob = await new Promise((r) => c.toBlob(r, 'image/png')); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nm; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
      toastH(kid() ? '📷' : '방 사진을 저장했어요', parent);
    } catch (e) { toastH(kid() ? '📷✕' : '사진을 저장하지 못했어요', parent); }
  };
})();
