// 웹툰 컷 내보내기 — node tools/export_cuts.js ep02 [폭=1080]
// web/<page>.html 의 svg.cut 을 컷마다 PNG 로 → content/blog/<page>_cuts/c01.png …
// 네이버 블로그·티스토리·인스타 카드에 그대로 올린다. 폭 1080 = 휴대폰에서 선명하게.
const { chromium } = require('playwright-core');
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const page = process.argv[2] || 'ep02', OUTW = +(process.argv[3] || 1080);
const OUT = path.join(ROOT, 'content', 'blog', `${page}_cuts`);

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const ctx = await b.newContext({ viewport: { width: 720, height: 1200 }, deviceScaleFactor: OUTW / 720 });
  const p = await ctx.newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('file:///' + path.join(ROOT, 'web', page + '.html').split(String.fromCharCode(92)).join('/'));
  await p.waitForTimeout(2000);
  const n = await p.locator('svg.cut').count();
  for (let i = 0; i < n; i++) {
    const f = path.join(OUT, `c${String(i + 1).padStart(2, '0')}.png`);
    await p.locator('svg.cut').nth(i).screenshot({ path: f });
  }
  // 투표 CTA 영역도 한 장 (있으면)
  const cta = p.locator('.cta');
  if (await cta.count()) await cta.first().screenshot({ path: path.join(OUT, 'zz_cta.png') });
  console.log(errs.length ? 'ERRORS: ' + errs.join(' | ') : `${n} cuts → ${path.relative(ROOT, OUT)}`);
  await b.close();
})().catch(e => { console.error('FAILED', e.message); process.exit(1); });
