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

async function dragTo(p, a, b) { await p.mouse.move(a.x, a.y); await p.mouse.down(); await p.mouse.move(b.x, b.y, { steps: 8 }); await p.mouse.up(); await wait(p, 300); }
async function solvePuzzle(p) {
  const pairs = await p.evaluate(() => {
    const cells = {}; document.querySelectorAll('.slotring[data-cell]').forEach((e) => { const r = e.getBoundingClientRect(); cells[e.dataset.cell] = { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
    return [...document.querySelectorAll('.tok[data-cell]')].map((e) => { const r = e.getBoundingClientRect(); return { from: { x: r.x + r.width / 2, y: r.y + r.height / 2 }, to: cells[e.dataset.cell] }; });
  });
  for (const q of pairs) await dragTo(p, q.from, q.to);
}
async function solveShapes(p) {
  const info = await p.evaluate(() => {
    const holes = [...document.querySelectorAll('[data-hole]')].map((e) => { const r = e.getBoundingClientRect(); return { key: e.dataset.key, x: r.x + r.width / 2, y: r.y + r.height / 2, used: false }; });
    const toks = [...document.querySelectorAll('.tok[data-key]')].map((e) => { const r = e.getBoundingClientRect(); return { key: e.dataset.key, x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
    return { holes, toks };
  });
  for (const t of info.toks) { const h = info.holes.find((q) => !q.used && q.key === t.key); h.used = true; await dragTo(p, t, h); }
}
async function solvePaint(p, tag) {
  await wait(p, 900);
  const need = await p.evaluate(() => 0);
  const pts = await p.evaluate(() => document.querySelector('.playarea').__pts());
  const sw = await p.$$('.playarea .round-btn');
  let n = 0;
  for (const pt of pts) {
    if (await p.$('.playarea .big')) break;
    if (sw.length && n % 2 === 1) { const bb = await sw[n % sw.length].boundingBox(); await p.mouse.click(bb.x + bb.width / 2, bb.y + bb.height / 2); }
    await p.mouse.click(pt.x, pt.y); await wait(p, 120); n++;
  }
  return pts.length;
}
async function solveSequence(p) {
  await p.waitForFunction(() => document.querySelector('.playarea').__ready === true, null, { timeout: 20000 });
  const info = await p.evaluate(() => { const a = document.querySelector('.playarea'); const pads = [...a.querySelectorAll('.pad')].map((e) => { const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }); return { seq: a.__seq, pads }; });
  for (let k = 0; k < info.seq.length; k++) {
    if (k === 0 && false) { /* 일부러 틀린 탭은 아래 별도 검증 */ }
    const pd = info.pads[info.seq[k]]; await p.mouse.click(pd.x, pd.y); await wait(p, 450);
  }
}
async function solveSoundfind(p, wrongFirst) {
  await p.waitForFunction(() => document.querySelector('.playarea').__ready === true, null, { timeout: 15000 });
  const info = await p.evaluate(() => { const a = document.querySelector('.playarea'); return { target: a.__target, cards: [...a.querySelectorAll('.sfcard')].map((e) => { const r = e.getBoundingClientRect(); return { id: e.dataset.card, x: r.x + r.width / 2, y: r.y + r.height / 2 }; }) }; });
  if (wrongFirst) { const w = info.cards.find((c) => c.id !== info.target); await p.mouse.click(w.x, w.y); await wait(p, 2400); }
  const t = info.cards.find((c) => c.id === info.target); await p.mouse.click(t.x, t.y);
}
async function solveDress(p) {
  await wait(p, 600);
  for (let k = 0; k < 8; k++) {
    const item = await p.$('.playarea .dpitem[data-item]:not([style*="pointer-events: none"])');
    if (!item) { await wait(p, 300); if (!(await p.$('.dpitem'))) break; continue; }
    const b = await item.boundingBox(); await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await wait(p, 900);
  }
}
async function solveTrain(p, wrongFirst) {
  await wait(p, 500);
  const info = await p.evaluate(() => { const a = document.querySelector('.playarea'); return { t: a.__train, tray: [...a.querySelectorAll('.trtray')].map((e) => { const r = e.getBoundingClientRect(); return { k: e.dataset.car, x: r.x + r.width / 2, y: r.y + r.height / 2 }; }) }; });
  const order = info.t.gaps.slice().sort((a, b) => a - b);
  for (let n = 0; n < order.length; n++) {
    const need = info.t.pattern[order[n]];
    if (wrongFirst && n === 0) { const w = info.tray.find((q) => q.k !== need); await p.mouse.click(w.x, w.y); await wait(p, 900); }
    const q = info.tray.find((x) => x.k === need); await p.mouse.click(q.x, q.y); await wait(p, 800);
  }
}
async function solveCake(p, wrongFirst) {
  await wait(p, 500);
  const L = await p.evaluate(() => document.querySelector('.playarea').__cake().layers);
  for (let i = 0; i < L; i++) {                                    // 층: 큰 것(0)부터. 트레이 항목 순서는 섞여 있어 폭으로 찾는다
    const items = await p.evaluate(() => [...document.querySelectorAll('.playarea .trtray')].map((e) => { const r = e.getBoundingClientRect(), s = e.querySelector('svg').getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: s.width, vis: getComputedStyle(e).opacity }; }));
    const live = items.filter((q) => q.vis !== '0').sort((a, b) => b.w - a.w);
    if (wrongFirst && i === 0 && live.length > 1) { const w = live[live.length - 1]; await p.mouse.click(w.x, w.y); await wait(p, 900); }
    await p.mouse.click(live[0].x, live[0].y); await wait(p, 800);
  }
  await wait(p, 1000);
  for (let guard = 0; guard < 12; guard++) {                        // 장식·초: 트레이 첫 항목을 계속 누르면 개수가 차면 끝난다
    const t = await p.$('.playarea .trtray'); if (!t) break;
    const b = await t.boundingBox(); await p.mouse.click(b.x + b.width / 2, b.y + b.height / 2); await wait(p, 450);
    const st = await p.evaluate(() => document.querySelector('.overlay.on, .uk-scrim') ? 'ov' : '');
    if (st) break;
  }
}
async function playStage(p, mode, tag) {
  for (let r = 0; r < 3; r++) {
    await wait(p, 500);
    if (r === 0) await shot(p, tag + '_round1');
    if (mode === 'shadow') await solveShadow(p, r === 0 && tag.endsWith('A'));
    else if (mode === 'faces') await solveFaces(p, r === 0 && tag.endsWith('A'));
    else if (mode === 'puzzle') await solvePuzzle(p);
    else if (mode === 'shapes') await solveShapes(p);
    else if (mode === 'sequence') await solveSequence(p);
    else if (mode === 'dress') await solveDress(p);
    else if (mode === 'cake') await solveCake(p, r === 0 && tag.endsWith('A'));
    else if (mode === 'train') await solveTrain(p, r === 0 && tag.endsWith('A'));
    else if (mode === 'soundfind') await solveSoundfind(p, r === 0 && tag.endsWith('A'));
    else if (mode === 'paint') { await solvePaint(p, tag); await shot(p, tag + '_painted' + r); await p.click('.playarea .big', { force: true }); }
    if (r === 0 || (mode === 'paint' && r < 3)) await shot(p, tag + '_solved' + r);
    if (r === 0 && mode !== 'paint') { await wait(p, 1100); await shot(p, tag + '_celebrate'); }
    await wait(p, mode === 'shapes' ? 8200 : 3400);
    if (r === 0) await shot(p, tag + '_result1');
    if (r === 2) await shot(p, tag + '_stageresult');
    await p.click('.uk-scrim .uk-round:last-child', { force: true }); await wait(p, 500);
  }
}

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, hasTouch: false });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => { errs.push(e.message); console.log('PAGEERR', e.message); }); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(URL); await wait(p, 1200); await shot(p, 'home');
  await p.click('.homebtns .card:nth-child(1)'); await wait(p, 500); await shot(p, 'shelf');
  await p.click('.cover[data-book="1"]'); await wait(p, 500); await shot(p, 'map');
  // ONLY=9 같은 환경변수로 특정 장만 빠르게 돌린다(앞 장은 완료로 채움)
  const ONLY = (process.env.ONLY || '').split(',').filter(Boolean).map(Number);
  if (ONLY.length) await p.evaluate(() => { for (let c = 1; c <= 10; c++) for (const l of 'ABC') GF.state.stages['c' + c + l] = { done: true, stars: 3 }; GF.Store.save(); });
  for (const ch of (ONLY.length ? ONLY : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])) {
    const mode = ['shadow', 'faces', 'puzzle', 'paint', 'shapes', 'sequence', 'soundfind', 'dress', 'train', 'cake'][ch - 1];
    if (ch === 6 || (ONLY.length && ch === ONLY[0] && ch >= 6)) { await p.evaluate(() => { GF.stack = []; GF.go('home'); GF.go('shelf'); GF.go('map', { book: 2 }); }); await wait(p, 600); await shot(p, 'map2'); }
    await wait(p, 400);
    const nodes = await p.$$('.node'); await nodes[(ch - 1) % 5].click(); await wait(p, 600);
    const np = await p.evaluate((c) => GF.data.story['ch' + c].pro.length, ch);
    for (let k = 0; k < np; k++) { if (k === 0) await shot(p, 'ch' + ch + '_book1'); await p.click('.nextbtn', { force: true }); await wait(p, 450); }
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
  await p.click('#b-home'); await wait(p, 500);
  await p.click('.homebtns .card:nth-child(3)'); await wait(p, 500); await shot(p, 'album');
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no errors');
  const st = await p.evaluate(() => JSON.stringify(GF.state.stages) + ' ' + JSON.stringify(GF.state.stickers));
  console.log(st);
  const S = await p.evaluate(() => GF.state.stages);
  const bad = [];
  if (!ONLY.length) {
  if (!(S.c1A.stars < 3)) bad.push('c1A 는 일부러 틀렸으니 ★3 이면 안 됨');
  if (!(S.c2A.stars < 3)) bad.push('c2A 는 일부러 틀렸으니 ★3 이면 안 됨');
  if (S.c1B.stars !== 3) bad.push('c1B 는 완벽했으니 ★3');
  }
  if (bad.length) { console.log('ASSERT FAIL:', bad.join(' / ')); process.exitCode = 1; } else console.log('assert ok (별 규칙)');
  await b.close();
})();
