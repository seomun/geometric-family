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
  // 움직임(.a-*)이 있는 컷은 루프 한 바퀴(2초)를 30fps 로 찍어 f<i>_anim/0001.png… 에 둔다.
  // 시간은 애니메이션을 멈추고 currentTime 을 직접 넣어 맞춘다(찍는 속도와 무관하게 정확).
  const FPS = 30, LOOP = await p.evaluate(() => (window.SH && SH.ANIM_LOOP_MS) || 2000);
  const setT = (ms) => p.evaluate((t) => document.getAnimations().forEach(a => { a.pause(); a.currentTime = t; }), ms);
  for (let i = 1; i <= n; i++) {
    const f = path.join(OUT, `f${i}.png`), dir = path.join(OUT, `f${i}_anim`);
    await setT(0);
    await p.locator(`#f${i}`).screenshot({ path: f });
    fs.rmSync(dir, { recursive: true, force: true });
    const animated = await p.locator(`#f${i} [class^="a-"], #f${i} [class*=" a-"]`).count();
    if (animated) {
      fs.mkdirSync(dir, { recursive: true });
      const total = Math.round(LOOP / 1000 * FPS);
      for (let k = 0; k < total; k++) {
        await setT(k * 1000 / FPS);
        await p.locator(`#f${i}`).screenshot({ path: path.join(dir, String(k + 1).padStart(4, '0') + '.png') });
      }
    }
    console.log('saved', f, animated ? `+ ${Math.round(LOOP / 1000 * FPS)} anim frames` : '');
  }
  console.log(errs.length ? 'ERRORS: ' + errs.join(' | ') : `${n} frames ok`);
  await b.close();
})().catch(e => { console.error('FAILED', e.message); process.exit(1); });
