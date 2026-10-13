// 놀이터 새 놀이 2종(D9) 시험: node tools/play_d9.js — 놀이방에 카드 7장(새 2장) · 길 따라가기(길 밖에선 기다림·건너뛰기 불가·끝까지 끌면 완료) · 컵 속 친구 찾기(틀리면 다시·맞히면 완료) · 두 놀이 모두 글자 없음 · 난이도 3단계
const { chromium } = require('playwright-core');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 }, hasTouch: false })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { window.__noResume = true; });
  await p.goto('http://localhost:8765/games/index.html'); await p.waitForTimeout(1700);
  const open = async (idx, diff) => { await p.evaluate(() => { document.querySelectorAll('.uk-scrim,.overlay').forEach((e) => e.remove()); GF.stack = []; GF.go('playroom'); }); await p.waitForTimeout(700); await p.evaluate((i) => document.querySelectorAll('#app .card, .screen.on .card')[i].click(), idx); await p.waitForTimeout(400); await p.evaluate((d) => document.querySelectorAll('.overlay .big')[d - 1].click(), diff); await p.waitForTimeout(900); };
  const cards = await p.evaluate(() => { GF.go('playroom'); return 0; }); await p.waitForTimeout(700);
  const n = await p.evaluate(() => [...document.querySelectorAll('.screen.on .card')].length); ok(n === 7, '놀이방 카드 7장(기존 5 + 새 2) · ' + n);
  const lockN = await p.evaluate(() => document.querySelectorAll('.screen.on .card.locked').length); ok(lockN === 0, '새 놀이 카드가 잠겨 있지 않음'); await p.screenshot({ path: 'notes/snapshots/d9_playroom.png' });
  // ---- 길 따라가기 ----
  await open(5, 1);
  let o = await p.evaluate(() => { const a = document.querySelector('.playarea'), t = a.__trace; return { has: !!t, total: Math.round(t.total), txt: a.innerText.replace(/\s/g, '') }; });
  ok(o.has && o.total > 500, '길 따라가기: 길 길이 ' + o.total); ok(!/[가-힣A-Za-z]/.test(o.txt), '길 따라가기: 글자 없음'); await p.screenshot({ path: 'notes/snapshots/d9_trace_start.png' });
  const pos = async (d) => p.evaluate((d) => { const a = document.querySelector('.playarea'), t = a.__trace, q = t.at(d), r = a.getBoundingClientRect(), k = r.width / a.offsetWidth || 1; return { x: r.left + q[0] * k, y: r.top + (q[1] - 34) * k }; }, d);
  const tokC = async () => p.evaluate(() => { const r = document.querySelector('.trtok').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height - 20 }; });
  const t0 = await tokC(); await p.mouse.move(t0.x, t0.y); await p.mouse.down();
  // 길 밖(화면 오른쪽 끝)으로 끌면 막둥이는 기다린다
  await p.mouse.move(t0.x + 30, t0.y - 24, { steps: 6 }); ok(await p.evaluate(() => document.querySelector('.playarea').__trace.prog < 30), '길 밖으로 끌면 그 자리에서 기다림');
  // 길을 가로질러 끝으로 건너뛰려 해도 안 됨
  const endP = await pos(await p.evaluate(() => document.querySelector('.playarea').__trace.total)); await p.mouse.move(endP.x, endP.y, { steps: 1 });
  ok(await p.evaluate(() => document.querySelector('.playarea').__trace.prog < 200), '끝으로 건너뛰지 못함(앞으로 조금씩만)');
  await p.mouse.up();
  // 길을 따라 끝까지
  const total = await p.evaluate(() => document.querySelector('.playarea').__trace.total); const t1 = await tokC(); await p.mouse.move(t1.x, t1.y); await p.mouse.down();
  for (let d = 0; d <= total + 40; d += 25) { const q = await pos(Math.min(d, total)); await p.mouse.move(q.x, q.y); await p.waitForTimeout(8); if (d === Math.floor(total / 2 / 25) * 25) await p.screenshot({ path: 'notes/snapshots/d9_trace_mid.png' }); }
  await p.mouse.up(); await p.waitForTimeout(3200);
  ok(await p.evaluate(() => !!document.querySelector('.uk-sheet')), '길 따라가기: 집에 닿으면 결과 카드'); await p.screenshot({ path: 'notes/snapshots/d9_trace_done.png' });
  // ---- 컵 속 친구 찾기 ----
  for (const diff of [1, 3]) {
    await open(6, diff);
    const c0 = await p.evaluate(() => { const a = document.querySelector('.playarea'), c = a.__cups; return { has: !!c, N: c.N, txt: a.innerText.replace(/\s/g, '') }; });
    ok(c0.has && c0.N === (diff >= 3 ? 4 : 3), '컵: 난이도 ' + diff + ' · 컵 ' + c0.N + '개'); ok(!/[가-힣A-Za-z]/.test(c0.txt), '컵: 글자 없음'); if (diff === 1) await p.screenshot({ path: 'notes/snapshots/d9_cups_show.png' });
    await p.waitForFunction(() => document.querySelector('.playarea').__cups.phase === 'pick', null, { timeout: 20000 }); await p.screenshot({ path: 'notes/snapshots/d9_cups_pick' + diff + '.png' });
    const tapCup = async (i) => p.evaluate((i) => { const h = document.querySelectorAll('.cupbox')[i].lastElementChild; h.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); }, i);
    const hc = await p.evaluate(() => document.querySelector('.playarea').__cups.heroCup), wrong = (hc + 1) % c0.N;
    await tapCup(wrong); await p.waitForTimeout(400); ok(await p.evaluate(() => document.querySelector('.playarea').__cups.phase === 'busy'), '틀린 컵을 열면 빈 컵을 보여 줌'); await p.waitForFunction(() => document.querySelector('.playarea').__cups.phase === 'pick', null, { timeout: 4000 });
    ok(!(await p.evaluate(() => !!document.querySelector('.uk-sheet'))), '틀려도 놀이가 끝나지 않고 다시 고를 수 있음');
    await tapCup(hc); await p.waitForTimeout(3200); ok(await p.evaluate(() => !!document.querySelector('.uk-sheet')), '컵: 맞히면 결과 카드 (난이도 ' + diff + ')');
  }
  ok(errs.length === 0, '오류 없음 ' + (errs[0] || '')); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
