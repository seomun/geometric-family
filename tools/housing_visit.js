// 우리 집 구경 코드(A4) 시험: node tools/housing_visit.js — 방 배치 → 코드 → 읽기 전용 구경, 잘못된 코드·모르는 가구 방어
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { window.__noResume = true; }); await p.goto('http://localhost:8765/games/merge/index.html'); await p.waitForTimeout(1600);
  await p.evaluate(() => { Room.cfg.mode = 'adult'; Room.S.lv = 30; ['b_tv', 'b_sofa', 'b_lamp', 'a_frame', 'p_film', 'g_cushion'].forEach((id) => Room.grant(id)); });
  const r = await p.evaluate(() => { const rid = 'nemo', before = JSON.parse(JSON.stringify(Room.S.placed[rid] || [])); const code = Room.layoutCode(rid), d = Room.decodeLayout(code); return { code, len: code.length, n: before.length, ok: d.ok, same: d.ok && d.list.length === before.filter((q) => Room.item(q.id)).length, ids: d.ok ? d.list.map((q) => q.id).sort().join() === before.map((q) => q.id).sort().join() : false, room: d.room }; });
  ok(r.n > 0 && r.ok && r.same && r.ids, `코드 왕복: 가구 ${r.n}개 · 코드 ${r.len}자 · ${r.code.slice(0, 40)}…`); ok(r.len < 900, '방 하나 코드가 900자 미만');
  const bad = await p.evaluate((code) => { const flip = code.slice(0, -1) + (code.slice(-1) === 'A' ? 'B' : 'A'); return { chk: Room.decodeLayout(flip).why, fmt: Room.decodeLayout('hello').why, room: Room.decodeLayout((() => { const h = 'GFH1-zzz-' + 'a~1~1~00'; return h + '-' + Room._chk(h); })()).why, empty: Room.decodeLayout('').why, evil: Room.decodeLayout((() => { const h = 'GFH1-nemo-' + 'zzzz~zzzzzz~zzzzzz~99.7~zzzzzz~zzzzzz~99.1~1'; return h + '-' + Room._chk(h); })()) }; }, r.code);
  ok(bad.chk === 'check' && bad.fmt === 'format' && bad.room === 'room' && bad.empty === 'format', '잘못된 코드: 검사·모양·방 거절 ' + JSON.stringify([bad.chk, bad.fmt, bad.room]));
  ok(bad.evil.ok && bad.evil.list.every((q) => q.x >= 0 && q.y >= 0 && q.x <= 340 && q.y <= 440), '엉뚱한 값은 범위 안으로 고치거나 버림(모르는 가구는 무시)');
  // 화면: 시트 → 구경 → 읽기 전용
  await p.evaluate(() => { GF.stack = []; GF.go('mhouse'); }); await p.waitForTimeout(1200); await p.evaluate(() => document.querySelectorAll('.uk-scrim,.tale-ov,.uk-toast').forEach((e) => e.remove()));
  await p.evaluate(() => { [...document.querySelectorAll('.h2-fb')].find((x) => /구경 코드/.test(x.textContent)).click(); }); await p.waitForTimeout(500); await p.screenshot({ path: 'notes/snapshots/housing_visit_sheet.png' });
  const mine = await p.evaluate(() => document.querySelector('.h2-codebox .h2-code').value); ok(/^GFH1-/.test(mine), '내 방 코드가 시트에 표시');
  const before = await p.evaluate(() => JSON.stringify(Room.S.placed));
  await p.evaluate((c) => { const ta = document.querySelectorAll('.h2-codebox .h2-code')[1]; ta.value = c; [...document.querySelectorAll('.h2-codebox .uk-btn')].find((x) => /구경하기/.test(x.textContent)).click(); }, r.code); await p.waitForTimeout(700); await p.screenshot({ path: 'notes/snapshots/housing_visit_view.png' });
  ok(await p.evaluate(() => /친구의/.test(document.querySelector('.h2-presh h2').textContent) && document.querySelectorAll('.h2-presh .h2-it').length > 0), '구경 화면: 가구가 그려짐'); ok((await p.evaluate(() => JSON.stringify(Room.S.placed))) === before, '구경해도 내 집은 바뀌지 않음');
  let life = false; for (let k = 0; k < 8 && !life; k++) { await p.waitForTimeout(1000); life = await p.evaluate(() => !!document.querySelector('.h2-presh .h2-owner') && document.querySelectorAll('.h2-presh .h2-fx, .h2-presh .h2-say, .h2-presh .h2-flashfx, .h2-presh .h2-tvfx, .h2-presh .h2-glowfx').length > 0); }
  ok(life, '구경 화면: 이 집 가족이 가구 곁에서 생활 동작'); ok(await p.evaluate(() => { const o = document.querySelector('.h2-presh .h2-owner'); return o.getBoundingClientRect().width >= 40; }), '방 주인 크기 ≥ 40px'); await p.screenshot({ path: 'notes/snapshots/housing_visit_life.png' });
  ok(errs.length === 0, '오류 없음 ' + errs[0]); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
