// 3편(11~15장) 스모크: ONLY=11,12 처럼 장을 나눠 돌린다(허브 PC 메모리). 서버: python -m http.server 8765 (저장소 루트)
// 새 놀이 5종을 훅(root.__plant 등)으로 풀어 3장×3판을 끝까지 통과하는지, 별·스티커·장난감 보상이 오는지 확인한다.
const { chromium } = require('playwright-core');
const path = require('path'), fs = require('fs');
const OUT = path.resolve(__dirname, '..', '..', 'notes', 'snapshots'); fs.mkdirSync(OUT, { recursive: true });
const URL = process.env.URL || 'http://localhost:8765/games/index.html';
const shot = (p, n) => p.screenshot({ path: path.join(OUT, 'b3_' + n + '.png') });
const wait = (p, ms) => p.waitForTimeout(ms);
const MODE = { 11: 'plant', 12: 'share', 13: 'hidden', 14: 'catch', 15: 'rhythm' };
const ctr = (p, sel, i = 0) => p.evaluate(([s, k]) => { const r = document.querySelectorAll(s)[k].getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, [sel, i]);
const click = async (p, sel, i = 0) => { const c = await ctr(p, sel, i); await p.mouse.click(c.x, c.y); };

async function solve(p, mode, r, tag) {
  const A = '.playarea';
  if (mode === 'plant') {
    const n = await p.evaluate(() => document.querySelector('.playarea').__plant.n);
    if (r === 0 && tag.endsWith('A')) { await click(p, '.plok'); await wait(p, 900); }   // 일부러 0송이로 확인
    for (let i = 0; i < n; i++) { await click(p, '.plhole', i); await wait(p, 200); }
    await click(p, '.plok');
  } else if (mode === 'share') {
    const { Q, P } = await p.evaluate(() => { const s = document.querySelector('.playarea').__share; return { Q: s.Q, P: s.P }; });
    if (r === 0 && tag.endsWith('A')) { for (let i = 0; i < P; i++) { await click(p, '.shplate', 0); await wait(p, 120); } await wait(p, 1500); }  // 일부러 한쪽에만 몰아 주기
    for (let i = 0; i < P; i++) { await click(p, '.shplate', i % Q); await wait(p, 150); }
  } else if (mode === 'hidden') {
    if (r === 0 && tag.endsWith('A')) { await click(p, '.hdleaf', 0); await wait(p, 300); }
    const n = await p.evaluate(() => document.querySelector('.playarea').__hidden.items.length);
    for (let i = 0; i < n; i++) {
      await p.evaluate((k) => { const e = document.querySelector('.playarea').__hidden.items[k].el; e.style.zIndex = 50; }, i);
      await click(p, '.hdfind', i); await wait(p, 250);
    }
  } else if (mode === 'catch') {
    const need = await p.evaluate(() => document.querySelector('.playarea').__catch.need);
    const t0 = Date.now(); let wrongDone = !(r === 0 && tag.endsWith('A'));
    for (let g = 0; g < 400; g++) {
      const done = await p.evaluate(() => !!document.querySelector('.uk-scrim'));
      if (done) break;
      const ok = await p.evaluate(() => { const a = document.querySelector('.playarea'), t = a.__catch.target; const f = [...a.querySelectorAll('.ctflake')].filter((e) => !e.dataset.done && +e.dataset.c !== t && e.getBoundingClientRect().top > 60 && e.getBoundingClientRect().top < 600)[0]; const h = [...a.querySelectorAll('.ctflake')].filter((e) => !e.dataset.done && +e.dataset.c === t && e.getBoundingClientRect().top > 60 && e.getBoundingClientRect().top < 600)[0]; const q = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }; return { h: q(h), w: q(f) }; });
      if (!wrongDone && ok.w) { await p.mouse.click(ok.w.x, ok.w.y); wrongDone = true; await wait(p, 600); continue; }
      if (ok.h) { await p.mouse.click(ok.h.x, ok.h.y); await wait(p, 120); } else await wait(p, 150);
      if (Date.now() - t0 > 60000) throw new Error('catch timeout');
    }
  } else if (mode === 'rhythm') {
    const need = await p.evaluate(() => document.querySelector('.playarea').__rhythm.need);
    if (r === 0 && tag.endsWith('A')) { await click(p, '.rhpad'); await wait(p, 200); await click(p, '.rhpad'); await wait(p, 300); }
    for (let i = 0; i < need; i++) {
      const d = await p.evaluate(() => document.querySelector('.playarea').__rhythm.nextDelay());
      await wait(p, Math.max(0, d - 15)); await click(p, '.rhpad'); await wait(p, 150);
    }
  }
}

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 } });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', (e) => { errs.push(e.message); console.log('PAGEERR', e.message); }); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(URL); await wait(p, 1200);
  const ONLY = (process.env.ONLY || '11,12,13,14,15').split(',').map(Number);
  await p.evaluate(() => { for (let c = 1; c <= 10; c++) for (const l of 'ABC') GF.state.stages['c' + c + l] = { done: true, stars: 3 }; GF.Store.save(); });
  for (const ch of ONLY) {
    const mode = MODE[ch];
    await p.evaluate((c) => { if (c > 11) for (let k = 11; k < c; k++) for (const l of 'ABC') GF.state.stages['c' + k + l] = { done: true, stars: 3 }; GF.stack = []; GF.go('home'); GF.go('shelf'); GF.go('map', { book: 3 }); }, ch);
    await wait(p, 700); if (ch === ONLY[0]) await shot(p, 'map');
    const nodes = await p.$$('.node'); await nodes[(ch - 1) % 5].click(); await wait(p, 600);
    const np = await p.evaluate((c) => GF.data.story['ch' + c].pro.length, ch);
    for (let k = 0; k < np; k++) { if (k === 0) await shot(p, 'ch' + ch + '_story'); await p.click('.nextbtn', { force: true }); await wait(p, 450); }
    await shot(p, 'ch' + ch + '_stages');
    for (let s = 0; s < 3; s++) {
      const btns = await p.$$('.stagebtn'); await btns[s].click(); await wait(p, 500);
      const tag = 'ch' + ch + 'ABC'[s];
      for (let r = 0; r < 3; r++) {
        await wait(p, 600); if (r === 0 && s === 2) await shot(p, tag + '_play');
        await solve(p, mode, r, tag);
        await wait(p, 2600); if (r === 0 && s === 0) await shot(p, tag + '_result');
        await p.click('.uk-scrim .uk-round:last-child', { force: true }); await wait(p, 500);
      }
    }
    for (let k = 0; k < 4; k++) { const nb = await p.$('.nextbtn'); if (!nb) break; await nb.click({ force: true }).catch(() => {}); await wait(p, 450); }
    await wait(p, 600); await shot(p, 'ch' + ch + '_after');
    const res = await p.evaluate((c) => ({ st: ['A', 'B', 'C'].map((l) => GF.state.stages['c' + c + l]), toy: !!(window.Room && Room.has && Room.has('k_ch' + c)) }), ch);
    console.log('ch' + ch, mode, JSON.stringify(res));
  }
  console.log(errs.length ? 'ERRORS:\n' + errs.join('\n') : 'no errors');
  await b.close();
})();
