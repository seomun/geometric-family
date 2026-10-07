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
  await pg.evaluate(() => { GF.stack = []; GF.go('mhome'); GF.go('mlevels'); }); await pg.waitForSelector('.screen.on .mg-lv');
  const lk = await pg.evaluate(() => ({ off: document.querySelectorAll('.screen.on .mg-l.off').length, all: document.querySelectorAll('.screen.on .mg-l').length })); ok(lk.all >= 100 && lk.off === lk.all - 1, '새 게임: 레벨 1만 열리고 나머지 잠김 ' + lk.off + '/' + lk.all);
  for (let n = A; n <= B; n++) {
    await pg.evaluate((n) => { GF.stack = []; GF.go('mhome'); GF.go('mplay', { n }); MERGE.unlockAll = true; }, n); await pg.waitForSelector('.screen.on .mg-board');
    const L = await pg.evaluate(() => MERGE.debug.level()); let i0 = 0;
    for (const i of L.solution) {
      if (n === A && i0 < 3) { const r = await pg.evaluate((i) => { const e = MERGE.debug.cells[i].getBoundingClientRect(); return { x: e.x + e.width / 2, y: e.y + e.height / 2 }; }, i); await pg.touchscreen.tap(r.x, r.y); await pg.waitForTimeout(120); } else await pg.evaluate((i) => MERGE.debug.place(i), i); i0++;
      const done = await pg.evaluate(() => !!document.querySelector('.screen.on .uk-sheet')); if (done) break;
    }
    await pg.waitForSelector('.screen.on .uk-sheet', { timeout: 4000 }).catch(() => {}); const res = await pg.evaluate(() => { const s = document.querySelector('.screen.on .uk-sheet'); return s ? s.textContent.slice(0, 20) : null; });
    ok(!!res, '레벨 ' + n + ' 클리어(' + L.tag + ', ' + L.cols + '×' + L.rows + ', 조각 ' + L.queue.length + ')');
    if (n === A) await shot('result'); if (n === Math.min(B, A + 4)) { await pg.evaluate(() => document.querySelector('.screen.on .uk-sheet') && document.querySelector('.screen.on .uk-scrim').remove()); await shot('play'); }
  }
  // 집 연결: 만든 가구가 집 인벤토리에 있다
  const own = await pg.evaluate(() => Room.ownedCount()); ok(own >= 1, '집에 가구가 쌓임: ' + own + '개');
  await pg.evaluate(() => { GF.stack = []; GF.go('mhome'); GF.go('mhouse'); }); await pg.waitForSelector('.screen.on .rm-room'); await shot('house');
  await pg.evaluate(() => { GF.stack = []; GF.go('mhome'); GF.go('mlevels'); }); await pg.waitForSelector('.screen.on .mg-lv'); await shot('levels');
  ok(errs.length === 0, '콘솔 오류 없음 ' + errs.slice(0, 3).join(' | '));
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
