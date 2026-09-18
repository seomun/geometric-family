// 일관성 검증용 스냅샷. node tools/snapshot.js  → notes/snapshots/YYYY-MM-DD_<name>.png
// 필요: npm i -D playwright-core (Chrome 설치되어 있어야 함)
const { chromium } = require('playwright-core');
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'notes', 'snapshots');
fs.mkdirSync(OUT, { recursive: true });
const date = new Date().toISOString().slice(0, 10);
const pages = [['characters', 900], ['goods', 1000], ['ep01', 400]];
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const [name, w] of pages) {
    const p = await (await b.newContext({ viewport: { width: w, height: 900 } })).newPage();
    const errs = []; p.on('pageerror', e => errs.push(e.message));
    await p.goto('file:///' + path.join(ROOT, 'web', name + '.html').split(String.fromCharCode(92)).join('/')); await p.waitForTimeout(1200);
    const out = path.join(OUT, `${date}_${name}.png`); await p.screenshot({ path: out, fullPage: true });
    console.log(out, errs.length ? 'ERRORS ' + errs.join('|') : 'ok');
  }
  await b.close();
})();
