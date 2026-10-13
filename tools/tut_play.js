// ① 놀이터 책 컷의 미니 판 점검: node tools/tut_play.js → notes/snapshots/tut_play_<장>.png
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 } }), p = await ctx.newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { window.__noResume = true; });
  await p.goto('http://localhost:8765/games/index.html'); await p.waitForTimeout(1800);
  for (const ch of ['ch1', 'ch4', 'ch8', 'ch11', 'ch15']) {
    await p.evaluate((c) => { GF.stack = []; GF.go('home'); GF.go('book', { ch: c, part: 'pro', replay: true }); }, ch); await p.waitForTimeout(600);
    await p.evaluate(() => { const b = document.querySelector('.screen.on .nextbtn'); b && b.click(); }); await p.waitForTimeout(1900);
    ok(await p.evaluate(() => !!document.querySelector('.screen.on .cut-mini')), ch + ' 책 둘째 컷에 미니 판'); await p.screenshot({ path: `notes/snapshots/tut_play_${ch}.png` });
  }
  ok(errs.length === 0, '오류 없음 ' + errs[0]); await ctx.close(); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
