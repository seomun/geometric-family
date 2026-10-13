// 우리 집 손님 확장(A3) 시험: node tools/housing_guests.js — 만난 카메오가 손님으로 와서 말하고, 손님 도감에 기록된다
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { window.__noResume = true; }); await p.goto('http://localhost:8765/games/merge/index.html'); await p.waitForTimeout(1600);
  const info = await p.evaluate(() => { Room.cfg.mode = 'adult'; const cams = GF.data.ops.cameos.filter((c) => !c.kid), spot = cams.find((c) => c.frm === 'spot'), it = Room.data.items.find((i) => i.src && i.src.game === 'spot' && i.slot === 'floor'); return { n: cams.length, spot: spot && spot.id, item: it && it.id, line: spot && spot.line, who: spot && spot.who, list: Room.guestList().length }; });
  ok(info.n === 30, '성인 카메오 30명 · 손님 목록 ' + info.list + '명 (기본 7 + 카메오 30)'); ok(info.list === 37, '손님 목록 = 기본 7 + 카메오 30');
  const base = await p.evaluate(() => Room.guestList().filter((g) => !g.cam).map((g) => g.who)); ok(base.length === 7 && new Set(base).size === 7, '기본 손님 7명 이름 중복 없음: ' + base.join(','));
  ok(!base.some((n) => /이웃/.test(n)) && (await p.evaluate(() => Room.guestList().every((g) => g.who && g.app))), '모든 손님에 이름·일하는 앱 표기(「이웃」 없음)');
  const gifts3 = await p.evaluate(() => Room.guestList().filter((g) => !g.cam).every((g) => g.max === 3 && g.gifts.length === 3 && !!Room.item(g.gifts[2]))); ok(gifts3, '기본 손님은 3번째 방문에 표의 소품을 줌(액자·벽돌·국·선반·바구니·이삿짐)');
  const none = await p.evaluate(() => Room.guestList().filter((g) => g.cam && g.got).length); ok(none === 0, '만나기 전의 카메오는 손님이 아님');
  await p.evaluate((i) => { GF.ip.addCameo(i.spot); Room.grant(i.item); Room.cozy = () => 99999; Room.S.lv = 30; }, info);
  const got = await p.evaluate(() => Room.guestList().filter((g) => g.cam && g.got).map((g) => g.id)); ok(got.length === 1 && got[0] === 'cam:' + info.spot, '만난 카메오 1명이 손님에 합류 ' + got);
  await p.evaluate((i) => { const r = Room.placeAt(i.item); window.__room = r && r.room; GF.stack = []; GF.go('mhouse'); }, info); await p.waitForTimeout(800);
  // 가구가 있는 방으로 이동하며 손님 확인
  let seen = false, line = ''; for (let k = 0; k < 8 && !seen; k++) { await p.waitForTimeout(1600); seen = await p.evaluate(() => !!document.querySelector('.h2-guest')); if (seen) line = await p.evaluate(() => (document.querySelector('.h2-bubble') || {}).textContent || ''); else await p.evaluate(() => { const a = document.querySelectorAll('.h2-ar')[1]; a && a.click(); }); }
  ok(seen, '카메오 손님이 집에 와서 말풍선 ' + line); await p.screenshot({ path: 'notes/snapshots/housing_guest.png' });
  const n = await p.evaluate((i) => (Room.S.guests['cam:' + i.spot] || {}).n || 0, info); ok(n === 1, '방문 1회 기록');
  // 3번째 방문: 그 앱(틀린 그림)의 가구 1개를 선물
  const had = await p.evaluate(() => Room.data.items.filter((q) => q.src && q.src.game === 'spot' && Room.has(q.id)).length);
  await p.evaluate((i) => { Room.S.guests['cam:' + i.spot].n = 2; Room.cozy = () => 99999; GF.stack = []; GF.go('mhouse'); }, info); let got3 = false; for (let k = 0; k < 8 && !got3; k++) { await p.waitForTimeout(1600); got3 = await p.evaluate((h) => Room.data.items.filter((q) => q.src && q.src.game === 'spot' && Room.has(q.id)).length > h, had); if (!got3) await p.evaluate(() => { const a = document.querySelectorAll('.h2-ar')[1]; a && a.click(); }); }
  ok(got3, '카메오 손님 3번째 방문: 자기 앱 가구 1개 선물');
  await p.evaluate(() => { document.querySelector('.h2-guestchip').click(); }); await p.waitForTimeout(500); await p.screenshot({ path: 'notes/snapshots/housing_guestbook.png' });
  ok(await p.evaluate(() => /손님 도감 1\//.test(document.querySelector('.h2-presh h2').textContent)), '손님 도감: 방문한 손님 1명 표시');
  ok(errs.length === 0, '오류 없음 ' + errs[0]); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
