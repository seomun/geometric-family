// A10 시험: 우리 집 앨범 — 집 레벨·새 방·첫 손님·사진·장 완료가 자동으로 기록되고 한 번만, 앨범 시트에 날짜 도장으로. node tools/housing_album.js
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { window.__noResume = true; window.GFSave = { image: () => true }; }); await p.goto('http://localhost:8765/games/merge/index.html'); await p.waitForTimeout(1600);
  const d0 = await p.evaluate(() => { Room.cfg.mode = 'adult'; Room.grant('b_table'); Room.S.album = []; return { dup: [Room.albumAdd('x', 'level', 'T', 's'), Room.albumAdd('x', 'level', 'T', 's')], n: Room.albumList().length }; }); ok(d0.dup[0] === true && d0.dup[1] === false && d0.n === 1, '같은 순간은 한 번만 기록');
  await p.evaluate(() => { Room.S.album = []; delete Room.S.roomSeen; delete Room.S.roomSeenInit; Room.S.lv = 1; GF.stack = []; GF.go('mhouse'); }); await p.waitForTimeout(2000);
  // 레벨이 오르고 새 방이 열리는 상황
  await p.evaluate(() => { const before = Room.unlockedRooms().length; for (let i = 0; i < 400 && Room.unlockedRooms().length === before; i++) { const it = Room.data.items.find((x) => !Room.has(x.id) && x.slot === 'floor' && !x.season && (x.src || {}).game !== 'expedition'); if (!it) break; Room.grant(it.id); } GF.stack = []; GF.go('mhouse'); }); await p.waitForTimeout(2600);
  const kinds = await p.evaluate(() => Room.albumList().map((x) => x.kind)); ok(kinds.includes('level'), '집 레벨 순간이 기록됨 ' + kinds); ok(kinds.includes('room'), '새 방 열림이 기록됨');
  await p.evaluate(() => { document.querySelectorAll('.h2-reveal,.uk-scrim').forEach((e) => e.remove()); });
  // 첫 손님
  await p.evaluate(() => { GF.ip.addCameo('merge:e2'); Room.cozy = () => 99999; const it = Room.data.items.find((i) => i.src && i.src.game === 'spot' && i.slot === 'floor'); Room.grant(it.id); Room.placeAt(it.id); GF.stack = []; GF.go('mhouse'); }); let g = false; for (let k = 0; k < 8 && !g; k++) { await p.waitForTimeout(1600); g = await p.evaluate(() => Room.albumList().some((x) => x.kind === 'guest')); if (!g) await p.evaluate(() => { const a = document.querySelectorAll('.h2-ar')[1]; a && a.click(); }); } ok(g, '첫 손님 방문이 기록됨');
  // 사진 저장
  await p.evaluate(() => { document.querySelectorAll('.h2-reveal,.uk-scrim,.tale-ov').forEach((e) => e.remove()); [...document.querySelectorAll('.h2-fb')].find((x) => /사진/.test(x.textContent)).click(); }); await p.waitForTimeout(1500); await p.evaluate(() => { [...document.querySelectorAll('.h2-psacts .uk-btn')].find((x) => /저장/.test(x.textContent)).click(); }); await p.waitForTimeout(1500);
  ok(await p.evaluate(() => Room.albumList().some((x) => x.kind === 'photo')), '사진 저장이 기록됨');
  // 시트
  await p.evaluate(() => { document.querySelectorAll('.uk-scrim').forEach((e) => e.remove()); document.querySelector('.h2-albchip').click(); }); await p.waitForTimeout(500); await p.screenshot({ path: 'notes/snapshots/housing_album.png' });
  const info = await p.evaluate(() => ({ h: document.querySelector('.h2-presh h2').textContent, cards: document.querySelectorAll('.h2-alb').length, stamps: document.querySelectorAll('.h2-albstamp').length, st: /\d{4}\.\d+\.\d+/.test(document.querySelector('.h2-albstamp').textContent) }));
  ok(info.cards >= 4 && info.cards === info.stamps && info.st, `앨범 시트: ${info.h} · 카드 ${info.cards}장 · 날짜 도장`);
  // 재진입해도 중복 없음
  const n1 = await p.evaluate(() => Room.albumList().length); await p.evaluate(() => { document.querySelectorAll('.uk-scrim').forEach((e) => e.remove()); GF.stack = []; GF.go('mhouse'); }); await p.waitForTimeout(2200); ok(await p.evaluate(() => { const k = Room.S.album.map((x) => x.k); return new Set(k).size === k.length; }), '다시 들어가도 같은 순간이 중복 기록되지 않음(키 유일) · ' + n1 + '→' + (await p.evaluate(() => Room.albumList().length)));
  ok(errs.length === 0, '오류 없음 ' + errs[0]); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
