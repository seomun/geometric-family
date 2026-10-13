// 우리 집 방 확장 연출(A7) 시험: node tools/housing_reveal.js — 새 방이 열리면 공사→완성 컷, 한 번만, 처음 열린 방들은 연출 없음
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { window.__noResume = true; }); await p.goto('http://localhost:8765/games/merge/index.html'); await p.waitForTimeout(1600);
  // 1) 처음 집을 열 때: 이미 열린 방은 연출 없음
  await p.evaluate(() => { Room.cfg.mode = 'adult'; delete Room.S.roomSeen; delete Room.S.roomSeenInit; GF.stack = []; GF.go('mhouse'); }); await p.waitForTimeout(2200);
  ok(!(await p.evaluate(() => !!document.querySelector('.h2-reveal'))), '처음에는 열린 방 연출 없음'); const seen0 = await p.evaluate(() => Object.keys(Room.S.roomSeen || {}));
  // 2) 레벨이 올라 새 방이 열림 → 연출
  const lvSet = await p.evaluate(() => { const before = Room.unlockedRooms().map((r) => r.id); for (let i = 0; i < 400 && !Room.unlockedRooms().some((r) => !before.includes(r.id)); i++) { const it = Room.data.items.find((x) => !Room.has(x.id) && x.slot === 'floor' && !x.season && ((x.src || {}).game !== 'expedition')); if (!it) break; Room.grant(it.id); } return { before, after: Room.unlockedRooms().map((r) => r.id) }; });
  const newR = lvSet.after.filter((x) => !lvSet.before.includes(x)); await p.evaluate((r) => { window.__newRoom = r[0]; }, newR); ok(newR.length >= 1, '새로 열린 방이 생김: ' + newR);
  await p.evaluate(() => { GF.stack = []; GF.go('mhouse'); }); await p.waitForTimeout(1900); ok(await p.evaluate(() => !!document.querySelector('.h2-reveal .h2-rvwall')), '새 방 연출: 공사 가림막이 나옴'); await p.screenshot({ path: 'notes/snapshots/housing_reveal_build.png' });
  ok(await p.evaluate(() => /뚝딱뚝딱/.test(document.querySelector('.h2-rvworker').textContent) && document.querySelector('.h2-rvworker').offsetParent !== null), '공사 중: 가족이 망치질하며 「뚝딱뚝딱…」'); ok(await p.evaluate(() => !/열림|열려요/.test([...document.querySelectorAll('.uk-toast')].map((t) => t.textContent).join('|'))), '연출 중에는 방 이름을 미리 말하는 토스트가 없음');
  const pvInfo = await p.evaluate(() => { const items = [...document.querySelectorAll('.h2-reveal .h2-it')].length, anchors = document.querySelectorAll('.h2-reveal .h2-anchor').length, placed = (Room.S.placed[window.__newRoom] || []).length; return { items, anchors, placed }; });
  ok(pvInfo.anchors > 0 && pvInfo.items === pvInfo.placed, '미리보기: 점선 자리가 보이고 내가 놓지 않은 가구는 없음 ' + JSON.stringify(pvInfo));
  await p.waitForTimeout(2300); ok(await p.evaluate(() => document.querySelector('.h2-rvwall').classList.contains('lift')), '가림막이 걷히며 완성된 방이 보임'); await p.screenshot({ path: 'notes/snapshots/housing_reveal_done.png' });
  const room1 = await p.evaluate(() => document.querySelector('.h2-rvtitle b') && document.querySelector('.h2-rvtitle b').textContent); ok(!!room1, '방 이름 표시: ' + room1);
  await p.evaluate(() => { [...document.querySelectorAll('.h2-reveal .uk-btn')].find((x) => /들어가/.test(x.textContent)).click(); }); await p.waitForTimeout(700);
  ok(await p.evaluate(() => /./.test(document.querySelector('.h2-nav') ? document.querySelector('.h2-nav').textContent : '') && !document.querySelector('.h2-reveal')), '「들어가 보기」로 그 방으로 이동하고 닫힘');
  // 3) 한 번만
  await p.evaluate(() => { GF.stack = []; GF.go('mhouse'); }); await p.waitForTimeout(2600); ok(!(await p.evaluate(() => !!document.querySelector('.h2-reveal'))), '본 방은 다시 연출 안 함');
  ok(errs.length === 0, '오류 없음 ' + errs[0]); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
