// 스토어 스크린샷 초안: node games/tools/store_shots.js  → games/store/shots/phone_*.png (1080×1920), tab_*.png (1920×1200)
// 빌드본(app/index.html)이 있으면 그걸, 없으면 개발본을 쓴다. 로컬 서버 필요(python -m http.server 8765).
const { chromium } = require('playwright-core');
const path = require('path'), fs = require('fs');
const OUT = path.resolve(__dirname, '..', 'store', 'shots'); fs.mkdirSync(OUT, { recursive: true });
const URL = process.env.URL || 'http://localhost:8765/games/index.html';
const wait = (p, ms) => p.waitForTimeout(ms);

async function solveShadow(p) {
  const info = await p.evaluate(() => ({
    sh: [...document.querySelectorAll('.shadowimg')].map((e) => { const r = e.getBoundingClientRect(); return { src: e.src, w: Math.round(r.width), x: r.x + r.width / 2, y: r.y + r.height / 2 }; }),
    tk: [...document.querySelectorAll('.tok')].map((e) => { const r = e.getBoundingClientRect(); return { src: e.querySelector('img').src, w: Math.round(r.width), x: r.x + r.width / 2, y: r.y + r.height / 2 }; }),
  }));
  for (const t of info.tk) {
    const g = info.sh.find((s) => s.src === t.src && Math.abs(s.w - t.w) <= 1);
    await p.mouse.move(t.x, t.y); await p.mouse.down(); await p.mouse.move(g.x, g.y, { steps: 8 }); await p.mouse.up(); await wait(p, 250);
  }
}
const go = (p, fn, arg) => p.evaluate(fn, arg);

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const [kind, vp] of [['phone', { width: 540, height: 960 }], ['tab', { width: 960, height: 600 }]]) {
    const p = await (await b.newContext({ viewport: vp, deviceScaleFactor: 2 })).newPage();
    const shot = (n) => p.screenshot({ path: path.join(OUT, `${kind}_${n}.png`) });
    await p.goto(URL); await wait(p, 2800); await shot('1_home');
    await go(p, () => { GF.state.seen.ch1 = 1; GF.stack = []; GF.go('home'); GF.go('book', { ch: 'ch1', part: 'pro', replay: true }); }); await wait(p, 600);
    await p.click('.nextbtn', { force: true }); await wait(p, 1300); await shot('2_story');
    await go(p, () => { GF.stack = []; GF.go('home'); GF.Stage.start({ kind: 'story', ch: 'ch1', k: 1, id: 'c1B' }); }); await wait(p, 1200); await shot('3_shadow');
    await solveShadow(p); await wait(p, 1500); await shot('4_celebrate');
    await go(p, () => { GF.stack = []; GF.go('home'); GF.Stage.start({ kind: 'story', ch: 'ch2', k: 1, id: 'c2B' }); }); await wait(p, 1000); await shot('5_faces');
    await go(p, () => { GF.stack = []; GF.go('home'); GF.Stage.start({ kind: 'story', ch: 'ch4', k: 1, id: 'c4B' }); }); await wait(p, 1500);
    const pts = await p.evaluate(() => document.querySelector('.playarea').__pts());
    const sw = await p.$$('.playarea .round-btn'); let n = 0;
    for (const pt of pts.slice(0, 4)) { const bb = await sw[n % sw.length].boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await p.mouse.click(pt.x, pt.y); await wait(p, 200); n++; }
    await wait(p, 300); await shot('6_paint');
    console.log(kind, 'ok');
    await p.close();
  }
  await b.close();
})();
