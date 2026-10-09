// 이야기 지도 캡처: node tools/saga_shots.js <앱> [상태]  → notes/snapshots/saga_<앱>_*.png
const { chromium } = require('playwright-core'); const APP = process.argv[2] || 'block'; const SCR = { block: 'blevels', merge: 'mlevels', spot: 'plevels', sort: 'slevels', tile: 'tlevels', day: 'dmap', color: 'cbook', idle: 'imap', quiz: 'qtests' };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }); const p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  p.on('console', (m) => m.type() === 'error' && console.log('console:', m.text())); await p.goto('http://localhost:8765/games/' + APP + '/index.html'); await p.waitForTimeout(1500);
  await p.evaluate((s) => { GF.stack = []; GF.go(s); }, SCR[APP]); await p.waitForTimeout(1000); await p.screenshot({ path: `notes/snapshots/saga_${APP}_start.png` });
  console.log(await p.evaluate(() => JSON.stringify({ nodes: document.querySelectorAll('.sg-node').length, built: Object.keys(GF.saga.built).length, cur: GF.saga.cur && GF.saga.cur.id }))); console.log(errs.join('|') || 'no errors'); await b.close();
})();
