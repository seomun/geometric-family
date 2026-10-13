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
  const APPNAME = { merge: '합치기', spot: '틀린 그림', block: '블록', sort: '정리', tile: '짝 맞추기', day: '막둥이의 하루', idle: '세 가족 식탁', quiz: '어느 도형', color: '색칠북', playground: '놀이터', story: '이야기 카드', event: '이벤트' };
  const EMOTE = { sit: '💛', eat: '🍚', read: '📖', sleep: '💤', play: '🎵', watch: '👀' };
  const KIDSETS = ['kid', 'daybath', 'wall', 'story_k', 'kseason', 'kgift'];
  const R2 = (Room.v2 = { view: 'diorama' });
  const kid = () => Room.cfg.mode === 'kid', grp = () => (kid() ? 'kid' : 'adult');
  const inGroup = (it) => (kid() ? KIDSETS.includes(it.set) : !KIDSETS.includes(it.set));
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
    UK.toast('「' + (APPNAME[g] || g) + '」 앱에서 얻어요', opts.parent); return 'web';
  };
  Room.band = function (parent, opts) {
    opts = opts || {}; const old = parent.querySelector(':scope > .h2-band'); if (old) old.remove(); if (!H() || !Room.S) return null;
    const g = Room.nextGoal(Room.cfg.app || Room.cfg.game); if (!g) return null; const b = el('button', 'h2-band' + (kid() ? ' kid' : ''), parent);
    const im = el('img', '', b); im.src = Room.src(g.item); im.alt = ''; const ic = APPICON[g.game] || '🎁';
    if (kid()) { el('span', 'h2-bic', b, ic); el('span', 'h2-arrow', b, UK.icon('next')); } else { const tx = el('span', 'h2-btx', b); el('b', '', tx, (g.why === 'wish' ? '♥ ' : '다음: ') + g.label + ' · ' + g.hint); el('span', 'h2-arrow', b, UK.icon('next')); }
    b.setAttribute('aria-label', 'next goal'); b.onclick = (e) => { e.stopPropagation(); Room.goApp(g.game, { parent: opts.toastParent || parent, home: opts.go }); }; return b;
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
      const r = { x: cx - g.w / 2, y: by - g.h, w: g.w, h: g.h }; let pen = occ.reduce((s, q) => s + ov(r, q), 0) * 4 + anc.reduce((s, q) => s + ov(r, q), 0) * 2; if (wall) pen += ov(r, WINDOW) * 4; if (r.y < (wall ? 6 : WALLH - g.h * 0.4)) pen += 5000;
      const d = o.near ? Math.abs(cx - o.near.x) + Math.abs(by - o.near.y) : Math.abs(cx - RW / 2) * 0.2 + (wall ? 0 : Math.abs(by - 340) * 0.3), c = pen * 10 + d; if (!best || c < best.c) best = { c, x: Math.round(r.x), y: Math.round(r.y) };
    }
    return best || { x: 20, y: 300 };
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
    if (!pos) pos = freeSpot(target, it, null);
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
        if (!st.have) return; const r = Room.applyPreset(P.id); if (!r.ok) { UK.toast('놓지 못했어요', sc); return; } sc.remove(); try { GF.sfx && GF.sfx('star'); } catch (e) { /* 소리 */ } onDone && onDone(r, P);
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
    const g = pos && pos.room ? rooms().find((r) => r.id === pos.room) : null; if (g) { const pv = el('div', 'h2-drop-pv', sh); R2.draw(pv, g.id, { mini: true, flash: id }); if (!kid()) el('small', '', sh, g.name + '에 놓였어요'); }
    if (after.lv > before.lv) { el('p', 'h2-lvup', sh, kid() ? '⭐ ' + after.lv : '집 레벨 ' + after.lv + '!'); try { UK.confetti(sc); } catch (e) {} ensure().lv = after.lv; Room.save(); }
    const acts = el('div', 'acts', sh); UK.btn({ text: kid() ? null : '집에 놓기', icon: kid() ? 'home' : null, cls: 'green block', onclick: () => { sc.remove(); opts.openHouse ? opts.openHouse() : (cb && cb()); } }, acts);
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
  const bgSVG = (R, light) => {
    const wall = R.wall, eve = light === 'eve', sky = eve ? '#F7B27A' : '#BFE6FF', W = WINDOW; const out = [];
    out.push(`<defs>${pattern(R.pattern, wall)}</defs><rect width="${RW}" height="${WALLH}" fill="${wall}"/>`); if (R.pattern && R.pattern !== 'none') out.push(`<rect width="${RW}" height="${WALLH}" fill="url(#wp)"/>`);
    out.push(`<rect y="${WALLH - 40}" width="${RW}" height="40" fill="${sh2(wall, -0.08)}"/><rect y="${WALLH - 42}" width="${RW}" height="5" fill="${sh2(wall, -0.16)}"/><rect y="${WALLH - 8}" width="${RW}" height="8" fill="rgba(0,0,0,.14)"/>`);
    out.push(`<rect x="${W.x}" y="${W.y}" width="${W.w}" height="${W.h}" rx="8" fill="${sky}" stroke="#fff" stroke-width="6"/><path d="M${W.x + W.w / 2} ${W.y}v${W.h}M${W.x} ${W.y + W.h / 2}h${W.w}" stroke="#fff" stroke-width="4"/><circle cx="${W.x + 24}" cy="${W.y + 20}" r="9" fill="${eve ? '#FFD27A' : '#fff'}" opacity=".85"/>`);
    out.push(floorSVG(R)); (R.fixtures || []).forEach((f) => { if (FIXT[f.k]) out.push(FIXT[f.k](f)); });
    return `<svg viewBox="0 0 ${RW} ${RH}" width="${RW}" height="${RH}">${out.join('')}</svg>`;
  };
  R2.bgSVG = bgSVG;
  const anchorRect = (a) => { const it = Room.item(a.want); if (!it) return null; const g = geo(it); return { x: Math.max(4, Math.min(RW - g.w - 4, a.x - g.w / 2)), y: a.y - g.h, w: g.w, h: g.h }; };
  const key = (q) => (q.it.flat ? q.p.y : (q.it.slot === 'table' ? 10000 : 0) + q.p.y + geo(q.it).h);   // 러그류는 맨 아래, 소품은 가구 위
  /** parent 안에 방 하나를 그린다. o: {mini, place, flash, dream, onChange, onSel} → {room, wrap, occ} */
  R2.draw = function (parent, rid, o) {
    o = o || {}; const R = rooms().find((r) => r.id === rid) || rooms()[0], S = ensure(); if (!R) return null;
    const wrap = el('div', 'h2-wrap' + (o.mini ? ' mini' : ''), parent), room = el('div', 'h2-room' + (S.light === 'eve' ? ' eve' : ''), wrap); wrap.__room = room; room.__occ = [];
    const fit = () => { const w = wrap.clientWidth || parent.clientWidth || RW, hh = o.maxH || 0, k = Math.min(1.3, w / RW, hh ? hh / RH : 9); room.style.transform = `scale(${k})`; room.__k = k; wrap.style.height = Math.round(RH * k) + 'px'; if (o.fitWidth) wrap.style.width = Math.round(RW * k) + 'px'; }; fit(); setTimeout(fit, 0); wrap.__fit = fit;
    el('div', 'h2-bg', room, bgSVG(R, S.light));
    let list = o.list || (S.placed[R.id] || []);
    if (o.dream) list = (R.anchors || []).map((a) => { const r = anchorRect(a); return r ? { id: a.want, x: Math.round(r.x), y: Math.round(r.y), c: (Room.item(a.want) || { colors: ['#fff'] }).colors[0] } : null; }).filter(Boolean);
    const order = list.map((p, i) => ({ p, i, it: Room.item(p.id) })).filter((q) => q.it).sort((a, b) => key(a) - key(b)); const occ = room.__occ;
    order.forEach(({ p, i, it }) => {
      const g = geo(it); occ.push({ x: p.x, y: p.y, w: g.w, h: g.h, wall: it.slot === 'wall' });
      if (it.slot === 'floor' && !it.flat) { const sh = el('i', 'h2-sh', room); sh.style.cssText = `left:${p.x + g.w * 0.08}px;top:${p.y + g.h - 7}px;width:${g.w * 0.84}px`; }
      const d = el('img', 'h2-it' + (o.flash === p.id ? ' flash' : ''), room); d.src = Room.src(it, p.c); d.alt = ''; d.draggable = false; d.style.cssText = `left:${p.x}px;top:${p.y}px;width:${g.w}px;height:${g.h}px${p.flip ? ';transform:scaleX(-1)' : ''}`; d.dataset.i = i;
      if (o.mini || o.dream) return;
      if (o.place) d.addEventListener('pointerdown', (e) => {
        e.preventDefault(); o.sel = i; room.querySelectorAll('.h2-it').forEach((x) => x.classList.remove('sel')); d.classList.add('sel'); o.onSel && o.onSel(i); const k = room.__k || 1, rc = room.getBoundingClientRect(), ox = (e.clientX - rc.left) / k - p.x, oy = (e.clientY - rc.top) / k - p.y; try { d.setPointerCapture(e.pointerId); } catch (x) {}
        const mv = (ev) => { p.x = Math.max(0, Math.min(RW - g.w, Math.round(((ev.clientX - rc.left) / k - ox) / 4) * 4)); p.y = Math.max(0, Math.min(RH - g.h, Math.round(((ev.clientY - rc.top) / k - oy) / 4) * 4)); d.style.left = p.x + 'px'; d.style.top = p.y + 'px'; };
        const up = () => { d.removeEventListener('pointermove', mv); d.removeEventListener('pointerup', up); Room.save(); o.onChange && o.onChange(true); };
        d.addEventListener('pointermove', mv); d.addEventListener('pointerup', up);
      }); else d.addEventListener('pointerup', () => use(room, d, it, p));
    });
    // 점선 칸: 비어 있는 anchors 중 할 일에 걸린 것 우선 최대 3개, 놓인 가구·다른 점선 칸과 겹치면 건너뛴다
    if (!o.dream) {
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
  function use(room, d, it, p) {
    d.classList.remove('use'); void d.offsetWidth; d.classList.add('use'); const t = (it.tags || [])[0]; try { GF.sfx && GF.sfx('tap'); } catch (e) {} if (!t) return;
    const g = geo(it), b = el('i', 'h2-emote', room, EMOTE[t] || '✨'); b.style.cssText = `left:${p.x + g.w / 2}px;top:${Math.max(4, p.y - 22)}px`; setTimeout(() => b.remove(), 1400);
  }

  /* ---------------- 집 메인 화면 — 방이 주인공 ---------------- */
  Room.house2 = function (parent, opts) {
    opts = opts || {}; Room.mount = parent; parent.innerHTML = ''; parent.classList.add('rm', 'h2'); parent.style.overflow = 'hidden';
    const S = ensure(), RL = rooms(); if (!RL.length) return Room.house(parent, opts);
    let cur = (opts.room && RL.find((r) => r.id === opts.room) && opts.room) || (RL.find((r) => unlocked(r)) || RL[0]).id, place = false, sel = null, walker = null, expanded = false;
    const view = el('div', 'h2-view', parent), sheet = el('div', 'h2-sheet', parent), tools = el('div', 'h2-fab', view), top = el('div', 'h2-top', view), nav = el('div', 'h2-nav', view), stage = el('div', 'h2-stage', view), selbar = el('div', 'h2-selbar', view);
    const dreamChip = el('button', 'h2-dreamchip', view, kid() ? '✨' : '✨ 완성 모습'); dreamChip.onclick = () => Room.dreamRoom(cur, parent);
    function drawTop() {
      top.innerHTML = ''; const L = Room.levelInfo(); el('div', 'h2-lv', top, kid() ? `<b>⭐ ${Math.max(1, Math.ceil(L.lv / 2))}</b>` : `<b>Lv ${L.lv}</b><span>${L.cozy}</span>`); const bw = el('div', 'h2-barw', top); el('div', 'h2-bar', bw, `<i style="width:${Math.round(L.pct * 100)}%"></i>`);
      if (!kid() && !L.max) el('small', 'h2-nx', bw, '다음 ▲' + (L.next - L.cozy));
    }
    function drawNav() {
      nav.innerHTML = ''; const idx = RL.findIndex((r) => r.id === cur), R = RL[idx]; const go = (d) => { const j = idx + d; if (j < 0 || j >= RL.length) return; cur = RL[j].id; sel = null; drawAll(); };
      const l = el('button', 'h2-ar', nav, '◀'); l.onclick = () => go(-1); l.disabled = idx === 0; el('b', '', nav, kid() ? '' : R.name + (unlocked(R) ? '' : ' 🔒'));
      const r = el('button', 'h2-ar', nav, '▶'); r.onclick = () => go(1); r.disabled = idx === RL.length - 1; const dots = el('div', 'h2-dots', nav); RL.forEach((q) => el('i', (q.id === cur ? 'on ' : '') + (unlocked(q) ? '' : 'lock'), dots));
    }
    function drawStage() {
      stage.innerHTML = ''; clearTimeout(walker); const R = RL.find((r) => r.id === cur);
      if (!unlocked(R)) { const lk = el('div', 'h2-locked', stage); el('div', 'h2-lkic', lk, '🔒'); el('p', '', lk, kid() ? '⭐ ' + Math.ceil(R.unlock / 2) : '집 레벨 ' + R.unlock + '에 열려요'); dreamChip.style.display = 'none'; return; }
      dreamChip.style.display = '';
      const maxH = Math.max(200, view.clientHeight - 104 - 4), d = R2.draw(stage, cur, { place, sel, flash: opts.flash, maxH, fitWidth: true, onChange: (drag) => { if (!drag) { drawAll(); return; } afterChange(); }, onSel: (i) => { sel = i; drawSel(); } });
      d.wrap.style.margin = '0 auto'; d.wrap.__fit && d.wrap.__fit();
      if (!place) { guestCheck(d.room, R); walk(d.room, R); }
    }
    function afterChange() { drawTop(); drawSheet(); const L = Room.levelInfo(); if (L.lv > (S.lv || 1)) { S.lv = L.lv; Room.save(); lvUp(L); if (Room.sweep()) drawStage(); } }
    function lvUp(L) { try { UK.confetti(parent); GF.sfx && GF.sfx('celebrate'); } catch (e) {} const nr = rooms().find((r) => r.unlock === L.lv); UK.toast(kid() ? '⭐' : '집 레벨 ' + L.lv + '!' + (nr ? ' ' + nr.name + ' 열림' : ''), parent); }
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
      const lt = el('button', 'h2-fb', tools, S.light === 'eve' ? '🌙' : '☀️'); lt.setAttribute('aria-label', 'light'); lt.onclick = () => { S.light = S.light === 'eve' ? 'day' : 'eve'; Room.save(); drawAll(); };
      B('gift', '카탈로그', () => Room.catalog(parent, { onClose: drawAll, go: opts.go, room: cur })); if (!kid() && Room.presets(cur).length) B('heart', '테마', () => Room.presetSheet(cur, parent, (r, P) => { drawAll(); UK.toast(P.name + ' · ' + r.have + '개 놓았어요' + (r.missing.length ? ' (없는 ' + r.missing.length + '개는 빼고)' : ''), parent); const u = UK.btn({ text: '되돌리기', cls: 'ghost sm h2-undo', onclick: () => { Room.undoPreset(); u.remove(); drawAll(); } }, view); setTimeout(() => u.remove(), 9000); })); B(place ? 'check' : 'brush', place ? '다 놓았어요' : '놓기', () => { place = !place; sel = null; drawAll(); }, place); B('share', '사진', () => Room.photo(cur, parent));
    }
    function drawSel() {
      selbar.innerHTML = ''; if (!place) return; if (sel == null) { el('p', 'h2-hint', selbar, kid() ? '' : '가구를 끌어서 옮겨 보세요'); return; } const p = (S.placed[cur] || [])[sel], it = p && Room.item(p.id); if (!it) return;
      const B = (txt, ic, fn) => UK.btn({ text: kid() ? null : txt, icon: ic, cls: 'ghost sm', onclick: fn }, selbar);
      B('돌리기', 'replay', () => { p.flip = p.flip ? 0 : 1; Room.save(); drawStage(); drawSel(); }); B('색', 'brush', () => { const cs = it.colors; p.c = cs[(cs.indexOf(p.c) + 1) % cs.length]; Room.save(); drawStage(); drawSel(); }); B('치우기', 'close', () => { S.placed[cur].splice(sel, 1); sel = null; Room.save(); drawAll(); });
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
    function guestCheck(room, R) {       // 손님: 아늑함 문턱을 넘으면 놀러 와 좋아하는 가구 앞에서 한마디, 선물은 확정(손님마다 2번)
      const cz = Room.cozy(), list = S.placed[cur] || []; const G = ((H() && H().guests) || []).filter((g) => g.group === grp() && ((S.guests[g.id] || {}).n || 0) < g.gifts.length && cz >= g.need + 250 * ((S.guests[g.id] || {}).n || 0)); if (!G.length) return;
      const g = G.find((q) => q.likes.some((id) => list.some((p) => p.id === id))); if (!g) return; const lk = list.find((p) => g.likes.includes(p.id)), it = Room.item(lk.id), gi = geo(it), n = (S.guests[g.id] || {}).n || 0, gift = g.gifts[n];
      S.guests[g.id] = { n: n + 1, seen: Date.now() }; Room.save();
      setTimeout(() => { if (!room.isConnected) return; const GW = 56, GH = 76, fr = freeRect(room, GW, GH, { x: lk.x + gi.w + 20, y: lk.y + gi.h - GH * 0.6 }, { x0: 4, y0: WALLH + 20, x1: RW - 4, y1: RH - 4 });
        const im = el('img', 'h2-guest', room); im.src = Room.cfg.charSrc ? Room.cfg.charSrc(g.char) : ''; im.alt = ''; im.style.cssText = `left:${fr.x}px;top:${fr.y}px`; room.__occ.push({ x: fr.x, y: fr.y, w: GW, h: GH, guest: true });
        const line = g.lines.length ? g.lines[(n + Math.floor(Math.random() * 2)) % g.lines.length] : '', BW = kid() ? 40 : 150, BH = kid() ? 34 : 40, bp = freeRect(room, BW, BH, { x: fr.x + GW / 2, y: fr.y - BH }, { x0: 4, y0: 6, x1: RW - 4, y1: RH - BH });
        const bb = el('div', 'h2-bubble', room, kid() ? '💖' : line); bb.style.cssText = `left:${bp.x}px;top:${bp.y}px`;
        setTimeout(() => { Room._quiet = 1; const gg = Room.grant(gift); Room._quiet = 0; if (gg) { UK.toast(kid() ? '🎁' : '손님 선물 · ' + (Room.item(gift) || {}).name, parent); try { GF.sfx && GF.sfx('star'); } catch (e) {} } afterChange(); }, 2600); setTimeout(() => { im.remove(); bb.remove(); }, 4400); }, 900);
    }
    function drawAll() { drawTop(); drawNav(); drawStage(); drawTools(); drawSheet(); drawSel(); }
    Room._redraw = () => { sel = null; drawAll(); };
    function seasonCheck() { Room._quiet = 1; const g = Room.seasonCheck(); Room._quiet = 0; if (g) { UK.toast(kid() ? '🎁' : '계절 선물 · ' + g.name, parent); try { GF.sfx && GF.sfx('star'); } catch (e) {} afterChange(); drawStage(); } }
    setTimeout(() => { Room.sweep(); drawAll(); const L0 = Room.levelInfo(); if (L0.lv > (S.lv || 1)) { S.lv = L0.lv; Room.save(); lvUp(L0); } S.lv = Math.max(S.lv || 1, L0.lv); seasonCheck(); setTimeout(() => Room.checkStory(parent, () => drawAll()), 400); }, 0);
    return { redraw: drawAll };
  };
  /** 계절·이벤트 선물: 그 달에 집에 오면 하루에 하나씩(확정, 놓친 철은 다음 해에 다시) */
  Room.seasonCheck = function () {
    const S = ensure(), d = new Date(), key = d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(), m = d.getMonth() + 1; if (!S || S.seasonDay === key) return null;
    const it = Room.data.items.find((i) => inGroup(i) && i.src && (i.src.kind === 'season' || i.src.kind === 'event') && (i.src.months || []).includes(m) && !Room.has(i.id) && (i.id.startsWith('s2_') || i.id.startsWith('e_') || i.id.startsWith('kc_')));
    if (!it) return null; S.seasonDay = key; Room.save(); return Room.grant(it.id) ? it : null;
  };
  Room.checkStory = function (parent, cb) {
    const c = Room.chapter(); if (!c) return false; const T = Room.tasks(); if (T.done < c.tasks.length) return false; const S = ensure();
    S.story[c.room] = { done: 1, t: Date.now() }; Room.save(); const fin = () => { const nx = c.reward && c.reward.unlock && rooms().find((r) => r.id === c.reward.unlock); const sc = UK.modal({ parent: ovRoot(parent), title: kid() ? '' : '방 완성!', big: '🏠', body: kid() ? '' : (c.title + '<br>아늑함 +' + ((c.reward && c.reward.cozy) || 0) + (nx ? '<br>새 방 「' + nx.name + '」이 열려요' : '')), actions: [{ text: kid() ? null : '확인', icon: kid() ? 'play' : null, cls: 'green', onclick: () => { cb && cb(); } }] }); try { UK.confetti(sc); GF.sfx && GF.sfx('celebrate'); } catch (e) {} };
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
      const a = el('div', 'h2-acts', det); if (own) UK.btn({ text: kid() ? null : '집에 놓기', icon: kid() ? 'home' : null, cls: 'green sm', onclick: () => { Room.placeAt(it.id); sc.remove(); opts.onClose && opts.onClose(); } }, a);
      else UK.btn({ text: kid() ? null : '어디서? ▶', icon: kid() ? 'next' : null, cls: 'gold sm', onclick: () => Room.goApp(sr.game, { parent: sc, home: opts.go && (() => { sc.remove(); opts.go(sr.game); }) }) }, a);
    }
    function drawAll() { drawTabs(); drawBody(); drawDet(); } drawAll(); return sc;
  };
  Room.photo = async function (rid, parent) {
    try {
      const R = roomDef(rid), S = ensure(), W = 1020, k = W / RW, c = document.createElement('canvas'); c.width = W; c.height = Math.round(RH * k); const x = c.getContext('2d');
      const load = (src) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
      const bg = await load('data:image/svg+xml;charset=utf-8,' + encodeURIComponent(bgSVG(R, S.light))); if (bg) x.drawImage(bg, 0, 0, W, c.height);
      const list = (S.placed[rid] || []).map((p) => ({ p, it: Room.item(p.id) })).filter((q) => q.it).sort((a, b) => (a.p.y + geo(a.it).h) - (b.p.y + geo(b.it).h));
      for (const { p, it } of list) { const im = await load(Room.src(it, p.c)); if (!im) continue; const g = geo(it), w = g.w * k, h = g.h * k; x.save(); if (p.flip) { x.translate(p.x * k + w, p.y * k); x.scale(-1, 1); x.drawImage(im, 0, 0, w, h); } else x.drawImage(im, p.x * k, p.y * k, w, h); x.restore(); }
      x.fillStyle = 'rgba(255,255,255,.9)'; x.font = '900 34px sans-serif'; x.fillText('기하학 가족 · 우리 집', 24, c.height - 24);
      const nm = 'gihaha-house-' + rid + '.png';
      if (window.GFSave && GFSave.image) { if (!GFSave.image(c.toDataURL('image/png'), nm)) throw new Error('save'); } else { const blob = await new Promise((r) => c.toBlob(r, 'image/png')); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nm; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); }
      UK.toast(kid() ? '📷' : '방 사진을 저장했어요', parent);
    } catch (e) { UK.toast(kid() ? '📷✕' : '사진을 저장하지 못했어요', parent); }
  };
})();
