// 막둥이의 하루 smoke: node tools/day_smoke.js (URL=… 빌드본, LV=1-20). 장마다 첫 판은 실제 포인터(끌기·문지르기·탭)로, 나머지는 디버그 진행으로 끝까지.
const { chromium } = require('playwright-core'), path = require('path');
const URL = process.env.URL || 'http://localhost:8765/games/day/index.html', [A, B] = (process.env.LV || '1-60').split('-').map(Number);
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const pg = await (await b.newContext({ viewport: { width: 412, height: 915 }, hasTouch: false })).newPage(), errs = [];
  pg.on('pageerror', (e) => errs.push(e.message)); pg.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await pg.goto(URL); await pg.waitForSelector('.dy-cards', { timeout: 10000 });
  const shot = async (n) => { await pg.waitForTimeout(500); await pg.screenshot({ path: path.join(__dirname, '..', 'notes', 'snapshots', '2026-10-08_day_' + n + '.png') }); };
  const P = (x, y) => pg.evaluate(([a, c]) => { const r = document.querySelector('.screen.on').getBoundingClientRect(), k = r.width / 360; return { x: r.left + a * k, y: r.top + c * k }; }, [x, y]);
  const center = async (sel, i) => pg.evaluate(([s, ii]) => { const e = document.querySelectorAll(s)[ii || 0].getBoundingClientRect(); return { x: e.left + e.width / 2, y: e.top + e.height / 2 }; }, [sel, i]);
  const drag = async (from, to) => { await pg.mouse.move(from.x, from.y); await pg.mouse.down(); await pg.mouse.move((from.x + to.x) / 2, (from.y + to.y) / 2, { steps: 4 }); await pg.mouse.move(to.x, to.y, { steps: 6 }); await pg.mouse.up(); await pg.waitForTimeout(120); };
  await shot('home');
  const small = await pg.evaluate(() => { const o = []; document.querySelectorAll('.screen.on *').forEach((e) => { if (e.children.length === 0 && e.textContent.trim() && e.offsetParent) { const f = parseFloat(getComputedStyle(e).fontSize); if (f < 24 && !/^[0-9]+$/.test(e.textContent.trim())) o.push(e.textContent.trim().slice(0, 8) + ':' + f.toFixed(1)); } }); return o; });
  ok(small.length === 0, '홈: 글자 없음/24px 이상 ' + small.slice(0, 4).join(','));
  await pg.evaluate(() => { GF.stack = []; GF.go('dhome'); GF.go('dmap'); }); await pg.waitForSelector('.screen.on .dy-scene'); await shot('map');
  const sc = await pg.evaluate(() => ({ n: document.querySelectorAll('.screen.on .dy-scene').length, off: document.querySelectorAll('.screen.on .dy-scene.off').length })); ok(sc.n === 12 && sc.off === 11, '하루 길: 장면 12개(처음엔 1만 열림)');
  const NL = await pg.evaluate(() => DAY.debug.D().levels.length);
  const afterFinish = async (n) => { for (let g = 0; g < 14; g++) { if (await pg.evaluate(() => !!document.querySelector('.screen.on .uk-sheet'))) break; const nb = await pg.$('.screen.on .nextbtn'); if (nb) await nb.click({ force: true }).catch(() => {}); await pg.waitForTimeout(350); } await pg.waitForSelector('.screen.on .uk-sheet', { timeout: 5000 }).catch(() => {}); return pg.evaluate(() => !!document.querySelector('.screen.on .uk-sheet')); };
  for (let n = A; n <= Math.min(B, NL); n++) {
    await pg.evaluate((nn) => { GF.stack = []; GF.go('dhome'); DAY.unlockAll = true; DAY.fast = true; GF.go('dplay', { n: nn }); }, n); await pg.waitForSelector('.screen.on .dy-stage'); await pg.waitForTimeout(300);
    const L = await pg.evaluate(() => DAY.debug.level()); const real = L.idx === 1 && A <= n;
    if (n === A || L.idx === 2) await shot('play' + n);
    if (real) {
      await pg.evaluate(() => { DAY.fast = false; });
      if (L.type === 'brush') { for (const s of L.spots) { const c = await P(s.x, s.y); await pg.mouse.move(c.x, c.y); await pg.mouse.down(); for (let loop = 0; loop < 4; loop++) for (let a = 0; a < 16; a++) await pg.mouse.move(c.x + Math.cos(a / 16 * 6.283) * s.r * 0.7, c.y + Math.sin(a / 16 * 6.283) * s.r * 0.7); await pg.mouse.up(); } }
      if (L.type === 'dress') { const kid = await P(180, 340); for (const s of L.slots) { const wrong = s.opts.find((o) => o !== s.ok); const idx = await pg.evaluate(([o, sl]) => [...document.querySelectorAll('.screen.on .dy-cloth')].findIndex((e) => e.textContent === o && e.dataset.slot === sl), [wrong, s.slot]); if (idx >= 0 && wrong) { const f = await center('.screen.on .dy-cloth', idx); await drag(f, kid); } const ix = await pg.evaluate(([o, sl]) => [...document.querySelectorAll('.screen.on .dy-cloth')].findIndex((e) => e.textContent === o && e.dataset.slot === sl), [s.ok, s.slot]); const f2 = await center('.screen.on .dy-cloth', ix); await drag(f2, kid); } }
      if (L.type === 'chew') { const sp = await center('.screen.on .dy-spoon'); const fast = await pg.evaluate(() => DAY.debug.got()[0]); await pg.mouse.click(sp.x, sp.y); await pg.mouse.click(sp.x, sp.y); await pg.waitForTimeout(100); ok(await pg.evaluate((g) => DAY.debug.got()[0] === g + 1, fast), '빠르게 두 번 눌러도 한 번만 셈(거북이가 기다림)'); for (let i = 0; i < L.foods.length * L.chews + 2; i++) { if (await pg.evaluate(() => DAY.debug.finished())) break; await pg.waitForTimeout(L.gap + 80); await pg.mouse.click(sp.x, sp.y); } }
      if (L.type === 'tidy') { for (let i = 0; i < L.toys.length; i++) { const t = L.toys[i]; const bi = L.kinds.indexOf(t.k), boxes = await pg.evaluate(() => [...document.querySelectorAll('.screen.on .dy-box')].map((e) => { const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; })); const f = await P(t.x, t.y); await drag(f, boxes[bi]); } }
      if (L.type === 'sleep') { for (let i = 0; i < L.lights.length; i++) { const c = await center('.screen.on .dy-light', i); await pg.mouse.click(c.x, c.y); await pg.waitForTimeout(80); } const pl = await center('.screen.on .dy-pull'); await drag(pl, { x: pl.x, y: pl.y - 160 }); }
      await pg.evaluate(() => { DAY.fast = true; });
    } else {
      await pg.evaluate((t) => { const d = DAY.debug, L = d.level(); if (t === 'brush') L.spots.forEach((s, i) => d.brushTo(i)); if (t === 'dress') L.slots.forEach((s, i) => d.wear(i)); if (t === 'chew') d.chewAll(); if (t === 'tidy') L.toys.forEach((x, i) => d.put(i)); if (t === 'sleep') { L.lights.forEach((x, i) => d.light(i)); d.cover(); } }, L.type);
    }
    const done = await afterFinish(n); ok(done, '판 ' + n + ' 클리어(' + L.type + (real ? ', 실제 포인터' : '') + ')');
    if (n === A) await shot('result');
    if (n === 15 || n === 30 || n === NL) { const rw = await pg.evaluate(() => Room.owned().filter((id) => id.startsWith('y_')).length); ok(rw >= 1, '판 ' + n + ' 까지 욕실·침실 소품 ' + rw + '개'); }
  }
  if (A === 1) {
    const texts = await pg.evaluate(() => { GF.stack = []; GF.go('dhome'); GF.go('dplay', { n: 1 }); return [...document.querySelectorAll('.screen.on *')].filter((e) => e.children.length === 0 && /[가-힣A-Za-z]/.test(e.textContent) && e.offsetParent).map((e) => e.textContent.trim()).slice(0, 5); });
    ok(texts.length === 0, '놀이 화면에 글자 없음 ' + texts.join('|'));
    await pg.evaluate(() => { GF.stack = []; GF.go('dhome'); const L = DAY.debug.dailyLevel(); GF.go('dplay', { level: L }); DAY.fast = true; }); await pg.waitForSelector('.screen.on .dy-stage');
    await pg.evaluate(() => { const d = DAY.debug, L = d.level(), t = L.type; if (t === 'brush') L.spots.forEach((s, i) => d.brushTo(i)); if (t === 'dress') L.slots.forEach((s, i) => d.wear(i)); if (t === 'chew') d.chewAll(); if (t === 'tidy') L.toys.forEach((x, i) => d.put(i)); if (t === 'sleep') { L.lights.forEach((x, i) => d.light(i)); d.cover(); } });
    ok(await afterFinish(0), '오늘의 하루 클리어');
    await pg.evaluate(() => { GF.stack = []; GF.go('dhome'); GF.go('dhouse'); }); await pg.waitForSelector('.screen.on .rm-room'); await shot('house');
  }
  ok(errs.length === 0, '콘솔 오류 없음 ' + errs.slice(0, 3).join(' | '));
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
