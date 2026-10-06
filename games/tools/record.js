// 1장 플레이 녹화: node games/tools/record.js  → games/media/ch1_phone.webm, ch1_tab.webm  (손맛 검수 + 스토어 영상 초안)
const { chromium } = require('playwright-core');
const path = require('path'), fs = require('fs');
const OUT = path.resolve(__dirname, '..', 'media'); fs.mkdirSync(OUT, { recursive: true });
const URL = process.env.URL || 'http://localhost:8765/games/index.html';
const DEV = { phone: { w: 412, h: 915 }, tab: { w: 1280, h: 800 } };
const wait = (p, ms) => p.waitForTimeout(ms);

async function slowDrag(p, a, b, steps = 30) {
  await p.mouse.move(a.x, a.y, { steps: 8 }); await wait(p, 180); await p.mouse.down(); await wait(p, 120);
  await p.mouse.move(b.x, b.y, { steps }); await wait(p, 120); await p.mouse.up();
}
async function playRound(p, wrongFirst) {
  const info = await p.evaluate(() => ({
    sh: [...document.querySelectorAll('.shadowimg')].map((e) => { const r = e.getBoundingClientRect(); return { src: e.src, w: Math.round(r.width), x: r.x + r.width / 2, y: r.y + r.height / 2 }; }),
    tk: [...document.querySelectorAll('.tok')].map((e) => { const r = e.getBoundingClientRect(); return { src: e.querySelector('img').src, w: Math.round(r.width), x: r.x + r.width / 2, y: r.y + r.height / 2 }; }),
  }));
  let first = true;
  for (const t of info.tk) {
    const target = info.sh.find((s) => s.src === t.src && Math.abs(s.w - t.w) <= 1);
    if (first && wrongFirst && info.sh.length > 1) {                 // 한 번은 일부러 틀려서 갸웃+둥실 복귀를 보여 준다
      const wrong = info.sh.find((s) => s !== target); await slowDrag(p, t, wrong); await wait(p, 1000);
    }
    first = false; await slowDrag(p, t, target); await wait(p, 650);
  }
}
async function click(p, sel) { const el = await p.waitForSelector(sel, { state: 'visible' }); const b = await el.boundingBox(); await p.mouse.move(b.x + b.width / 2, b.y + b.height / 2, { steps: 12 }); await wait(p, 150); await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2); }

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--autoplay-policy=no-user-gesture-required'] });
  for (const [name, d] of Object.entries(DEV)) {
    const ctx = await b.newContext({ viewport: { width: d.w, height: d.h }, recordVideo: { dir: OUT, size: { width: d.w, height: d.h } } });
    const p = await ctx.newPage();
    await p.goto(URL); await wait(p, 3200);                          // 첫 3초: 제목 낙하, 눈 깜빡임
    await click(p, '.homebtns .card:nth-child(1)'); await wait(p, 1800);   // 이야기 지도
    await click(p, '.node'); await wait(p, 1500);                    // 1장 그림책
    for (let k = 0; k < 3; k++) { await click(p, '.nextbtn'); await wait(p, 1500); }
    await click(p, '.stagebtn'); await wait(p, 900);                 // 스테이지 A
    await playRound(p, true); await wait(p, 3600);                   // 클리어 연출(꽃가루) + 결과
    await ctx.close();
    const v = fs.readdirSync(OUT).filter((f) => f.endsWith('.webm') && !f.startsWith('ch1_')).map((f) => ({ f, t: fs.statSync(path.join(OUT, f)).mtimeMs })).sort((a, c) => c.t - a.t)[0];
    fs.renameSync(path.join(OUT, v.f), path.join(OUT, `ch1_${name}.webm`));
    console.log(name, 'ok', (fs.statSync(path.join(OUT, `ch1_${name}.webm`)).size / 1024 | 0) + ' KB');
  }
  await b.close();
})();
