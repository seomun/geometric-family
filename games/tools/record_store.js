// 스토어 소개 영상(폰 세로 ≈30초): 1장 그림자 → 2장 얼굴 → 4장 색칠 → 5장 집 완성·잔치.  node games/tools/record_store.js
// → games/media/store_phone_30s.webm (소리 없음. 소리는 작가 판정 후 입힌다). 로컬 서버 필요.
const { chromium } = require('playwright-core');
const path = require('path'), fs = require('fs');
const OUT = path.resolve(__dirname, '..', 'media'); fs.mkdirSync(OUT, { recursive: true });
const URL = process.env.URL || 'http://localhost:8765/games/index.html';
const wait = (p, ms) => p.waitForTimeout(ms);

async function drag(p, a, b, steps = 26) {
  await p.mouse.move(a.x, a.y, { steps: 6 }); await wait(p, 140); await p.mouse.down(); await wait(p, 90);
  await p.mouse.move(b.x, b.y, { steps }); await wait(p, 90); await p.mouse.up(); await wait(p, 420);
}
const start = (p, fn, arg) => p.evaluate(fn, arg);

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', args: ['--autoplay-policy=no-user-gesture-required'] });
  const ctx = await b.newContext({ viewport: { width: 540, height: 960 }, recordVideo: { dir: OUT, size: { width: 720, height: 1280 } } });
  const p = await ctx.newPage();
  await p.goto(URL); await wait(p, 2300);                                              // 홈: 제목 낙하·눈 깜빡임

  // 1장 그림자 찾기 (크기 순서)
  await start(p, () => { GF.stack = []; GF.go('home'); GF.Stage.start({ kind: 'story', ch: 'ch1', k: 1, id: 'c1B' }); }); await wait(p, 900);
  const sh = await p.evaluate(() => ({
    sh: [...document.querySelectorAll('.shadowimg')].map((e) => { const r = e.getBoundingClientRect(); return { src: e.src, w: Math.round(r.width), x: r.x + r.width / 2, y: r.y + r.height / 2 }; }),
    tk: [...document.querySelectorAll('.tok')].map((e) => { const r = e.getBoundingClientRect(); return { src: e.querySelector('img').src, w: Math.round(r.width), x: r.x + r.width / 2, y: r.y + r.height / 2 }; }),
  }));
  for (const t of sh.tk.sort((a, c) => c.w - a.w)) await drag(p, t, sh.sh.find((s) => s.src === t.src && Math.abs(s.w - t.w) <= 1));
  await wait(p, 1800);

  // 2장 같은 얼굴 (두 쌍)
  await start(p, () => { GF.stack = []; GF.go('home'); GF.Stage.start({ kind: 'story', ch: 'ch2', k: 0, id: 'c2A' }); }); await wait(p, 900);
  const cards = await p.evaluate(() => [...document.querySelectorAll('.fcard')].map((c) => { const r = c.getBoundingClientRect(); return { src: c.querySelector('.f img').src, x: r.x + r.width / 2, y: r.y + r.height / 2 }; }));
  const grp = {}; cards.forEach((c, i) => (grp[c.src] = grp[c.src] || []).push(i));
  const gs = Object.values(grp);
  await p.mouse.click(cards[gs[0][0]].x, cards[gs[0][0]].y); await wait(p, 650);
  await p.mouse.click(cards[gs[1][0]].x, cards[gs[1][0]].y); await wait(p, 1500);       // 일부러 틀림 → 갸웃 → 다시 뒤집힘
  for (const g of gs) for (const i of g) { await p.mouse.click(cards[i].x, cards[i].y); await wait(p, 600); }
  await wait(p, 1800);

  // 4장 색칠 (네모 아이)
  await start(p, () => { GF.modes.paint.free = () => ({ id: 'nemo_kids.kid1', colors: 5, fills: 3 }); GF.stack = []; GF.go('home'); GF.Stage.start({ kind: 'free', mode: 'paint', diff: 2 }); }); await wait(p, 1300);
  const pts = await p.evaluate(() => document.querySelector('.playarea').__pts());
  const sw = await p.$$('.playarea .round-btn');
  for (const [k, c] of [[0, 1], [1, 4], [2, 3]]) {
    const bb = await sw[c].boundingBox(); await p.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 10 }); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); await wait(p, 250);
    await p.mouse.move(pts[k].x, pts[k].y, { steps: 14 }); await p.mouse.click(pts[k].x, pts[k].y); await wait(p, 550);
  }
  const done = await p.waitForSelector('.playarea .big', { state: 'visible' }); const db = await done.boundingBox();
  await p.mouse.move(db.x + db.width / 2, db.y + db.height / 2, { steps: 10 }); await p.mouse.click(db.x + db.width / 2, db.y + db.height / 2); await wait(p, 1800);

  // 5장 집 짓기 → 바람 친구 → 생일 잔치
  await start(p, () => { GF.modes.shapes.free = () => ({ house: 'nemo', n: 3, wind: true }); GF.stack = []; GF.go('home'); GF.Stage.start({ kind: 'free', mode: 'shapes', diff: 1 }); }); await wait(p, 1000);
  const hs = await p.evaluate(() => ({
    holes: [...document.querySelectorAll('[data-hole]')].map((e) => { const r = e.getBoundingClientRect(); return { key: e.dataset.key, x: r.x + r.width / 2, y: r.y + r.height / 2, used: false }; }),
    toks: [...document.querySelectorAll('.tok[data-key]')].map((e) => { const r = e.getBoundingClientRect(); return { key: e.dataset.key, x: r.x + r.width / 2, y: r.y + r.height / 2 }; }),
  }));
  for (const t of hs.toks) { const h = hs.holes.find((q) => !q.used && q.key === t.key); h.used = true; await drag(p, t, h); }
  await wait(p, 5900);                                                                  // 문 열림 → 바람 → 잔치 컷
  await ctx.close();
  const v = fs.readdirSync(OUT).filter((f) => f.endsWith('.webm') && !f.startsWith('ch1_') && !f.startsWith('store_')).map((f) => ({ f, t: fs.statSync(path.join(OUT, f)).mtimeMs })).sort((a, c) => c.t - a.t)[0];
  fs.renameSync(path.join(OUT, v.f), path.join(OUT, 'store_phone_30s.webm'));
  console.log('ok', (fs.statSync(path.join(OUT, 'store_phone_30s.webm')).size / 1048576).toFixed(1) + ' MB');
  await b.close();
})();
