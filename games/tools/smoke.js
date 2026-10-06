// 스모크 테스트: node games/tools/smoke.js  (사전: python -m http.server 8765 를 저장소 루트에서 실행)
// 이야기 모드 1·2장을 끝까지 자동으로 풀고 스크린샷을 notes/snapshots/game_*.png 에 남긴다.
const { chromium } = require('playwright-core');
const path = require('path'), fs = require('fs');
const OUT = path.resolve(__dirname, '..', '..', 'notes', 'snapshots'); fs.mkdirSync(OUT, { recursive: true });
const URL = process.env.URL || 'http://localhost:8765/games/index.html';
const shot = async (p, n) => p.screenshot({ path: path.join(OUT, 'game_' + n + '.png') });
const wait = (p, ms) => p.waitForTimeout(ms);

async function center(p, sel, i) { return p.evaluate(([s, k]) => { const r = document.querySelectorAll(s)[k].getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: r.width }; }, [sel, i]); }
async function solveShadow(p, wrongFirst) {
  const info = await p.evaluate(() => {
    const sh = [...document.querySelectorAll('.shadowimg')].map((e) => { const r = e.getBoundingClientRect(); return { src: e.src, w: Math.round(r.width), x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
    const tk = [...document.querySelectorAll('.tok')].map((e) => { const r = e.getBoundingClientRect(); return { src: e.querySelector('img').src, w: Math.round(r.width), x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
    return { sh, tk };
  });
  let first = true;
  for (const t of info.tk) {
    const target = info.sh.find((s) => s.src === t.src && Math.abs(s.w - t.w) <= 1);
    if (first && wrongFirst && info.sh.length > 1) {   // 일부러 틀린 칸에 한 번
      const wrong = info.sh.find((s) => s !== target);
      await p.mouse.move(t.x, t.y); await p.mouse.down(); await p.mouse.move(wrong.x, wrong.y, { steps: 6 }); await p.mouse.up(); await wait(p, 450);
    }
    first = false;
    await p.mouse.move(t.x, t.y); await p.mouse.down(); await p.mouse.move(target.x, target.y, { steps: 8 }); await p.mouse.up(); await wait(p, 300);
  }
}
async function solveFaces(p, wrongFirst) {
  const cards = await p.evaluate(() => [...document.querySelectorAll('.fcard')].map((c) => { const r = c.getBoundingClientRect(); return { src: c.querySelector('.f img').src, x: r.x + r.width / 2, y: r.y + r.height / 2 }; }));
  const bySrc = {}; cards.forEach((c, i) => (bySrc[c.src] = bySrc[c.src] || []).push(i));
  const groups = Object.values(bySrc);
  if (wrongFirst && groups.length > 1) {
    const a = cards[groups[0][0]], b = cards[groups[1][0]];
    await p.mouse.click(a.x, a.y); await wait(p, 450); await p.mouse.click(b.x, b.y); await wait(p, 1300);
  }
  for (const g of groups) { for (const i of g) { await p.mouse.click(cards[i].x, cards[i].y); await wait(p, 450); } await wait(p, 500); }
}
async function playStage(p, mode, tag) {
  for (let r = 0; r < 3; r++) {
    await wait(p, 500);
    if (r === 0) await shot(p, tag + '_round1');
    if (mode === 'shadow') await solveShadow(p, r === 0 && tag.endsWith('A')); else await solveFaces(p, r === 0 && tag.endsWith('A'));
    await wait(p, 2200);
    if (r === 0) await shot(p, tag + '_result1');
    if (r === 2) await shot(p, tag + '_stageresult');
    await p.click('.overlay .big:last-child'); await wait(p, 500);
  }
}

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, hasTouch: false });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => { errs.push(e.message); console.log('PAGEERR', e.message); }); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(URL); await wait(p, 1200); await shot(p, 'home');
  await p.click('.homebtns .card:nth-child(1)'); await wait(p, 500); await shot(p, 'map');
  for (const ch of [1, 2]) {
    const mode = ch === 1 ? 'shadow' : 'faces';
    await wait(p, 400);
    const nodes = await p.$$('.node'); await nodes[ch - 1].click(); await wait(p, 600);
    for (let k = 0; k < 3; k++) { if (k === 0) await shot(p, 'ch' + ch + '_book1'); await p.click('.nextbtn', { force: true }); await wait(p, 450); }
    await shot(p, 'ch' + ch + '_stages');
    for (let s = 0; s < 3; s++) {
      const btns = await p.$$('.stagebtn'); await btns[s].click(); await wait(p, 500);
      await playStage(p, mode, 'ch' + ch + 'ABC'[s]);
      await wait(p, 400);
    }
    // 에필로그 그림책
    for (let k = 0; k < 4; k++) { const nb = await p.$('.nextbtn'); if (!nb) break; if (k === 0) await shot(p, 'ch' + ch + '_epi'); await nb.click({ force: true }).catch(() => {}); await wait(p, 450); }
    await wait(p, 400); await shot(p, 'after_ch' + ch);
    if (ch === 1) { /* 지도에서 2장 진입 */ }
  }
  await p.click('#b-home'); await p.click('#b-home'); await wait(p, 500);
  await p.click('.homebtns .card:nth-child(3)'); await wait(p, 500); await shot(p, 'album');
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no errors');
  const st = await p.evaluate(() => JSON.stringify(GF.state.stages) + ' ' + JSON.stringify(GF.state.stickers));
  console.log(st);
  await b.close();
})();
