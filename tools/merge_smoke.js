// 도형 합치기 smoke: node tools/merge_smoke.js  (LV=1-20 구간, URL=… 로 빌드본). 풀이 경로를 실제 화면 조작으로 재생한다.
const { chromium } = require('playwright-core'), path = require('path');
const URL = process.env.URL || 'http://localhost:8765/games/merge/index.html', [A, B] = (process.env.LV || '1-20').split('-').map(Number);
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const pg = await (await b.newContext({ viewport: { width: 412, height: 915 }, hasTouch: true })).newPage(), errs = [];
  pg.on('pageerror', (e) => errs.push(e.message)); pg.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await pg.goto(URL); await pg.waitForSelector('.mg-btns', { timeout: 10000 });
  const shot = async (n) => { await pg.waitForTimeout(500); await pg.screenshot({ path: path.join(__dirname, '..', 'notes', 'snapshots', '2026-10-07_merge_' + n + '.png') }); };
  await shot('home');
  // 글자 크기(성인 18px↑) — 홈
  const small = await pg.evaluate(() => { const o = []; document.querySelectorAll('.screen.on *').forEach((e) => { if (e.children.length === 0 && e.textContent.trim() && e.offsetParent) { const f = parseFloat(getComputedStyle(e).fontSize) * (e.closest('#safe').getBoundingClientRect().width / 360); if (f < 13.5) o.push(e.textContent.trim().slice(0, 8) + ':' + f.toFixed(1)); } }); return o; });
  ok(small.length === 0, '홈 글자 크기 (13.5px↓ 없음) ' + small.join(','));
  await pg.evaluate(() => { GF.stack = []; GF.go('mhome'); GF.go('mlevels'); }); await pg.waitForSelector('.screen.on .sg-node');
  const lk = await pg.evaluate(async () => { const sc = GF.saga.scroll; for (let y = sc.scrollHeight; y >= 0; y -= 500) { sc.scrollTop = y; await new Promise((r) => setTimeout(r, 60)); } return { off: document.querySelectorAll('.screen.on .sg-node.off').length, all: document.querySelectorAll('.screen.on .sg-node').length }; }); ok(lk.all >= 100 && lk.off === lk.all - 1, '새 게임: 레벨 1만 열리고 나머지 잠김 ' + lk.off + '/' + lk.all);
  for (let n = A; n <= B; n++) {
    await pg.evaluate((n) => { GF.stack = []; GF.go('mhome'); GF.go('mplay', { n }); MERGE.unlockAll = true; MERGE.fast = true; }, n); await pg.waitForSelector('.screen.on .mg-board');
    const L = await pg.evaluate(() => MERGE.debug.level()); let i0 = 0;
    for (const i of L.solution) {
      if (n === A && i0 < 3) { const r = await pg.evaluate((i) => { const e = MERGE.debug.cells()[i].getBoundingClientRect(); return { x: e.x + e.width / 2, y: e.y + e.height / 2 }; }, i); await pg.touchscreen.tap(r.x, r.y); await pg.waitForTimeout(120); } else { await pg.evaluate((i) => MERGE.debug.place(i), i); await pg.waitForFunction(() => !MERGE.debug.busy() || !!document.querySelector('.screen.on .uk-sheet'), null, { timeout: 5000 }).catch(() => {}); } i0++;
      const done = await pg.evaluate(() => !!document.querySelector('.screen.on .uk-sheet')); if (done) break;
    }
    for (let g = 0; g < 8; g++) { if (await pg.evaluate(() => !!document.querySelector('.screen.on .uk-sheet'))) break; await pg.waitForTimeout(400); if (await pg.evaluate(() => !!document.querySelector('.screen.on .nextbtn'))) await pg.click('.screen.on .nextbtn', { force: true }).catch(() => {}); }   // 사연 판: 장의 마지막 판 뒤 사연 컷을 넘긴다
    await pg.waitForSelector('.screen.on .uk-sheet', { timeout: 4000 }).catch(() => {}); const res = await pg.evaluate(() => { const s = document.querySelector('.screen.on .uk-sheet'); return s ? s.textContent.slice(0, 20) : null; });
    ok(!!res, '레벨 ' + n + ' 클리어(' + L.tag + ', ' + L.cols + '×' + L.rows + ', 조각 ' + L.queue.length + ')');
    if (n === A) await shot('result'); if (n === Math.min(B, A + 4)) { await pg.evaluate(() => document.querySelector('.screen.on .uk-sheet') && document.querySelector('.screen.on .uk-scrim').remove()); await shot('play'); }
  }
  // 판 종류 7 + 공통 판(오늘의 한 판·시즌·세 가족): 풀이를 화면 조작으로 재생하고 종류별 캡처
  const playLevel = async (goFn, label, shotName) => {
    await pg.evaluate(goFn); await pg.waitForSelector('.screen.on .mg-board'); const L = await pg.evaluate(() => MERGE.debug.level()); let k = 0;
    for (const i of L.solution) { await pg.evaluate((i) => MERGE.debug.place(i), i); await pg.waitForFunction(() => !MERGE.debug.busy() || !!document.querySelector('.screen.on .uk-sheet, .screen.on .nextbtn'), null, { timeout: 5000 }).catch(() => {}); if (++k === 3 && shotName) await shot(shotName); if (await pg.evaluate(() => !!document.querySelector('.screen.on .uk-sheet, .screen.on .nextbtn'))) break; }
    for (let g = 0; g < 8; g++) { if (await pg.evaluate(() => !!document.querySelector('.screen.on .uk-sheet'))) break; await pg.waitForTimeout(400); if (await pg.evaluate(() => !!document.querySelector('.screen.on .nextbtn'))) await pg.click('.screen.on .nextbtn', { force: true }).catch(() => {}); }
    const done = await pg.evaluate(() => !!document.querySelector('.screen.on .uk-sheet')); ok(done, label + ' 클리어(' + L.type + ', ' + L.cols + '×' + L.rows + ', 조각 ' + L.queue.length + ')');
  };
  const types = await pg.evaluate(() => { const o = {}; MERGE.debug.D().levels.forEach((l) => { if (!o[l.type]) o[l.type] = l.id; }); return o; });
  for (const [ty, id] of Object.entries(types)) await playLevel(new Function(`GF.stack = []; GF.go('mhome'); GF.go('mplay', { n: ${id} });`), '판 종류 ' + ty + ' (레벨 ' + id + ')', 'type_' + ty);
  // 
  await playLevel(() => { GF.stack = []; GF.go('mhome'); GF.go('mplay', { level: MERGE.debug.dailyLevel() }); }, '오늘의 한 판', 'daily');
  await playLevel(() => { MERGE.season = 's_year'; GF.stack = []; GF.go('mhome'); GF.go('mplay', { level: MERGE.debug.seasonLevel(MERGE.debug.X().seasons[0]) }); }, '시즌 판(연말 트리)', 'season');
  for (const rule of [0, 1, 2]) await playLevel(new Function(`GF.stack = []; GF.go('mhome'); GF.go('mplay', { level: MERGE.debug.trioLevels(10)[${rule}] });`), '세 가족 판 규칙 ' + rule, rule === 0 ? 'trio' : null);
  // 집 연결: 만든 가구가 집 인벤토리에 있다
  const own = await pg.evaluate(() => Room.ownedCount()); ok(own >= 1, '집에 가구가 쌓임: ' + own + '개');
  await pg.evaluate(() => { GF.stack = []; GF.go('mhome'); GF.go('mhouse'); }); await pg.waitForSelector('.screen.on .rm-room'); await shot('house');
  await pg.evaluate(() => { GF.stack = []; GF.go('mhome'); GF.go('mlevels'); }); await pg.waitForSelector('.screen.on .sg-node'); await shot('levels');
  ok(errs.length === 0, '콘솔 오류 없음 ' + errs.slice(0, 3).join(' | '));
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
