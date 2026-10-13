// 우리 집 현재(1.0) 화면 캡처: node tools/housing_shots.js [before|after] → notes/snapshots/housing_<tag>_<앱>.png
const { chromium } = require('playwright-core'); const tag = process.argv[2] || 'before';
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const [a, scr, grant] of [['merge', 'mhouse', ['b_sofa', 'b_shelf', 'b_table']], ['day', 'dhouse', ['y_cup', 'y_paste']]]) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 1 }), p = await ctx.newPage(); await p.addInitScript(() => { window.__noResume = true; });
    await p.goto('http://localhost:8765/games/' + a + '/index.html'); await p.waitForTimeout(1600);
    await p.evaluate(([s, g]) => { g.forEach((id) => Room.grant(id)); GF.stack = []; GF.go(s); }, [scr, grant]); await p.waitForTimeout(1200);
    await p.evaluate(() => document.querySelectorAll('.uk-scrim,.tale-ov').forEach((e) => e.remove()));
    await p.screenshot({ path: `notes/snapshots/housing_${tag}_${a}.png` }); await ctx.close();
  }
  await b.close(); console.log('ok');
})();
