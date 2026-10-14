// 우리 집 손님 도감 2탄(A27) 시험: node tools/housing_neighbors.js
// 데이터(포섭 이웃 21명·이름/이모지/단계가 원정 데이터와 같음·마지막 단계 전리품에 묶임·가족 밖만) · 성인 집에만 · 코드로 전리품을 받으면 만남 알림 · 전리품을 방에 놓으면 놀러 와 말풍선(이모지 그림) · 도감·앨범 기록 · 선물 없음 · 유아 집엔 없음
const { chromium } = require('playwright-core'); const fs = require('fs');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const H = JSON.parse(fs.readFileSync('data/housing.json', 'utf8')), S = JSON.parse(fs.readFileSync('data/expedition_slice.json', 'utf8')), RI = JSON.parse(fs.readFileSync('data/room_items.json', 'utf8')).items, byid = Object.fromEntries(RI.map((i) => [i.id, i]));
  const rec = S.units.filter((u) => u.route === 'recruit'), N = H.neighbors, fam = ['네모 아빠', '네모 엄마', '세모 남편', '세모 아내', '동그라미 아빠', '동그라미 엄마', '동그라미 아들'];
  ok(N.length === 21 && rec.length === 21, '이웃 손님 21명 = 원정 포섭 동료 21명');
  ok(rec.every((u) => { const n = N.find((x) => x.unit === u.id); const st = S.stages.find((s) => s.recruit === u.id); return n && n.name === u.name && n.emoji === u.emoji && n.stage === st.id && n.nation === Math.ceil(st.id / 12); }), '이름·이모지·단계·나라가 원정 데이터와 같음');
  ok(N.every((n) => byid[n.loot] && byid[n.loot].set === 'exp' && byid[n.loot].src.n === n.stage) && new Set(N.map((n) => n.loot)).size === 21, '각 이웃은 그 나라 마지막 단계 전리품 한 개에 묶임(서로 다름)');
  ok(N.every((n) => !fam.includes(n.name) && n.lines.length === 3 && n.lines.every((t) => t.length >= 8 && t.length <= 40)), '가족 밖 이름만 · 대사 3줄(8~40자)');
  ok(N.every((n) => S.loot.some((l) => l.id === n.loot && l.stage === n.stage)), '전리품 코드 목록에도 그 단계 코드가 있음');
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { window.__noResume = true; }); await p.goto('http://localhost:8765/games/merge/index.html'); await p.waitForTimeout(1700);
  const a0 = await p.evaluate(() => { Room.cfg.mode = 'adult'; const L = Room.guestList(); return { nb: L.filter((g) => g.nb).length, got: L.filter((g) => g.nb && g.got).length, base: L.filter((g) => !g.cam && !g.nb).length }; });
  ok(a0.nb === 21 && a0.got === 0 && a0.base === 7, '성인 손님 목록: 이웃 21(아직 아무도 못 만남) + 기본 7');
  ok(await p.evaluate(() => { const m = Room.cfg.mode; Room.cfg.mode = 'kid'; const n = Room.guestList().filter((g) => g.nb).length; Room.cfg.mode = m; return n === 0; }), '유아 집엔 이웃 손님 없음(D12)');
  // 전리품 코드 입력 → 만남 알림
  const nb = N.find((n) => n.unit === 'u_owl'), code = S.loot.find((l) => l.id === nb.loot).code;
  await p.evaluate(() => { Room.cozy = () => 99999; Room.S.lv = 30; Room.S.album = []; Room.S.guests = {}; });
  const r = await p.evaluate((c) => { const x = Room.redeem(c); return { ok: x.ok, id: x.item && x.item.id, got: Room.guestList().filter((g) => g.nb && g.got).map((g) => g.id) }; }, code);
  ok(r.ok && r.id === nb.loot && r.got.join() === nb.id, '코드로 받으면 그 이웃만 「만난 손님」으로 합류: ' + r.got);
  ok(await p.evaluate((id) => Room.neighborOf(id).name === '부엉이', nb.loot), '가구 → 이웃 연결 조회(부엉이)');
  // 전리품을 놓으면 놀러 와 말풍선
  await p.evaluate((id) => { const q = Room.placeAt(id); window.__room = q && q.room; GF.stack = []; GF.go('mhouse'); }, nb.loot); await p.waitForTimeout(800);
  let seen = false, line = '', src = ''; for (let k = 0; k < 9 && !seen; k++) { await p.waitForTimeout(1600); seen = await p.evaluate(() => !!document.querySelector('.h2-guest')); if (seen) { line = await p.evaluate(() => (document.querySelector('.h2-bubble') || {}).textContent || ''); src = await p.evaluate(() => document.querySelector('.h2-guest').src.slice(0, 40)); } else await p.evaluate(() => { const a = document.querySelectorAll('.h2-ar')[1]; a && a.click(); }); }
  ok(seen && nb.lines.includes(line), '이웃이 놀러 와 대사 한마디(' + line + ')'); ok(/^data:image\/svg\+xml/.test(src), '이웃은 이모지 그림으로 나옴'); await p.screenshot({ path: 'notes/snapshots/a27_neighbor.png' });
  const st = await p.evaluate((id) => ({ n: (Room.S.guests[id] || {}).n || 0, album: Room.S.album.some((a) => a.k === 'guest:' + id), items: Room.owned().length }), nb.id); ok(st.n === 1 && st.album, '방문 1회 기록 + 앨범 「첫 방문」');
  // 도감
  await p.evaluate(() => { document.querySelector('.h2-guestchip').click(); }); await p.waitForTimeout(500);
  const bk = await p.evaluate(() => ({ title: document.querySelector('.h2-presh h2').textContent, names: [...document.querySelectorAll('.h2-presh .h2-ptx b')].map((x) => x.textContent), img: [...document.querySelectorAll('.h2-presh .h2-gface img')].some((i) => /^data:image\/svg/.test(i.src)) }));
  ok(bk.names.some((t) => /^부엉이 · 기하학 원정대/.test(t)) && bk.img, '손님 도감에 「부엉이 · 기하학 원정대」와 이모지 얼굴: ' + bk.title); await p.screenshot({ path: 'notes/snapshots/a27_book.png' });
  // 선물 없음: 3번 다 와도 가구가 늘지 않는다
  const g3 = await p.evaluate((id) => { Room.S.guests[id].n = 2; const before = Room.owned().length; const g = Room.guestList().find((x) => x.id === id); return { before, gift: g.gifts.every((x) => x == null), max: g.max }; }, nb.id); ok(g3.gift && g3.max === 3, '이웃 손님은 선물 없음(말만 3번)');
  ok(errs.length === 0, '오류 없음 ' + (errs[0] || '')); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
