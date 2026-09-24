// 쇼츠 프레임 내보내기 — node tools/shorts_export.js s01
// web/shorts/<name>.html 의 .frame 을 각각 1080×1920 PNG 로 저장 → content/shorts/<name>/f1.png …
const { chromium } = require('playwright-core');
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const name = process.argv[2] || 's01';
const OUT = path.join(ROOT, 'content', 'shorts', name);

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const p = await (await b.newContext({ viewport: { width: 1200, height: 900 }, deviceScaleFactor: 1 })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///' + path.join(ROOT, 'web', 'shorts', name + '.html').split(String.fromCharCode(92)).join('/'));
  await p.waitForTimeout(1500);
  // 내보낼 때만 실제 크기로 키운다
  await p.addStyleTag({ content: '.frames{display:block!important;padding:0!important;gap:0!important}.frame{width:1080px!important;height:1920px!important}' });
  await p.setViewportSize({ width: 1080, height: 1920 });
  await p.waitForTimeout(600);
  const n = await p.locator('.frame').count();
  for (let i = 1; i <= n; i++) {
    const f = path.join(OUT, `f${i}.png`);
    await p.locator(`#f${i}`).screenshot({ path: f });
    console.log('saved', f);
  }
  console.log(errs.length ? 'ERRORS: ' + errs.join(' | ') : `${n} frames ok`);
  await b.close();
})().catch(e => { console.error('FAILED', e.message); process.exit(1); });
