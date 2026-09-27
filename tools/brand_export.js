// 채널 브랜드 자산 내보내기 — node tools/brand_export.js → content/brand/*.png
const { chromium } = require('playwright-core');
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'content', 'brand');
const JOBS = [['profile', 800, 800], ['banner', 2560, 1440], ['blogtitle', 966, 400], ['og', 1200, 630]];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const p = await (await b.newContext({ viewport: { width: 1400, height: 900 }, deviceScaleFactor: 1 })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///' + path.join(ROOT, 'web', 'brand.html').split(String.fromCharCode(92)).join('/'));
  await p.waitForTimeout(1500);
  for (const [id, w, h] of JOBS) {
    await p.addStyleTag({ content: `#${id}{width:${w}px!important}` });
    await p.waitForTimeout(200);
    const f = path.join(OUT, id + '.png');
    await p.locator('#' + id).screenshot({ path: f });
    console.log('saved', f, w + 'x' + h);
  }
  console.log(errs.length ? 'ERRORS: ' + errs.join(' | ') : 'ok');
  await b.close();
})().catch(e => { console.error('FAILED', e.message); process.exit(1); });
