// 정리의 달인 smoke: node tools/sort_smoke.js (URL=… 로 빌드본, LV=1-20 구간). 풀이를 디버그 탭으로 재생(첫 판은 실제 클릭).
const { chromium } = require('playwright-core'), path = require('path');
const URL = process.env.URL || 'http://localhost:8765/games/sort/index.html', [A, B] = (process.env.LV || '1-120').split('-').map(Number);
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const solveLevel = async (pg) => {
  const L = await pg.evaluate(() => SORT.debug.level());
  for (const [a, b] of L.solution) { await pg.evaluate(([x, y]) => { SORT.debug.tap(x); SORT.debug.tap(y); }, [a, b]); await pg.waitForTimeout(15); if (await pg.evaluate(() => SORT.debug.state().won)) break; }
  for (let g = 0; g < 12; g++) { if (await pg.evaluate(() => !!document.querySelector('.screen.on .uk-sheet'))) break; const nb = await pg.$('.screen.on .nextbtn'); if (nb) await nb.click({ force: true }).catch(() => {}); await pg.waitForTimeout(350); }
  await pg.waitForSelector('.screen.on .uk-sheet', { timeout: 4000 }).catch(() => {});
  return { L, done: await pg.evaluate(() => !!document.querySelector('.screen.on .uk-sheet')) };
};
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const pg = await (await b.newContext({ viewport: { width: 412, height: 915 }, hasTouch: true })).newPage(), errs = []; await pg.addInitScript(() => { window.__noResume = true; });
  pg.on('pageerror', (e) => errs.push(e.message)); pg.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await pg.goto(URL); await pg.waitForSelector('.sr-btns', { timeout: 10000 });
  const shot = async (n) => { await pg.waitForTimeout(500); await pg.screenshot({ path: path.join(__dirname, '..', 'notes', 'snapshots', '2026-10-08_sort_' + n + '.png') }); };
  await shot('home');
  const small = await pg.evaluate(() => { const o = []; document.querySelectorAll('.screen.on *').forEach((e) => { if (e.children.length === 0 && e.textContent.trim() && e.offsetParent && !/^[★☆✔]+$/.test(e.textContent.trim())) { const f = parseFloat(getComputedStyle(e).fontSize); if (f < 17) o.push(e.textContent.trim().slice(0, 8) + ':' + f.toFixed(1)); } }); return o; });
  ok(small.length === 0, '홈 글자 크기 17px 이상 ' + small.slice(0, 4).join(','));
  await pg.evaluate(() => { document.querySelectorAll('.uk-scrim,.tale-ov').forEach((e) => e.remove()); GF.stack = []; GF.go('shome'); GF.go('slevels'); }); await pg.waitForSelector('.screen.on .sg-node'); await shot('levels');
  const lk = await pg.evaluate(async () => { const sc = GF.saga.scroll; for (let y = sc.scrollHeight; y >= 0; y -= 500) { sc.scrollTop = y; await new Promise((r) => setTimeout(r, 60)); } return { off: document.querySelectorAll('.screen.on .sg-node.off').length, all: document.querySelectorAll('.screen.on .sg-node').length }; }); const NL = await pg.evaluate(() => SORT.debug.D().levels.length); ok(lk.all === NL && lk.off === NL - 1, '레벨 목록 ' + NL + '개(처음엔 1만 열림)');
  for (let n = A; n <= Math.min(B, NL); n++) {
    await pg.evaluate((nn) => { document.querySelectorAll('.uk-scrim,.tale-ov').forEach((e) => e.remove()); GF.stack = []; GF.go('shome'); GF.go('splay', { n: nn }); SORT.unlockAll = true; SORT.fast = true; }, n); await pg.waitForSelector('.screen.on .sr-tube');
    if (n === A || [4, 9, 12, 14].includes(n)) await shot('play' + n);
    const sizes = await pg.evaluate(() => [...document.querySelectorAll('.screen.on .sr-tube')].map((t) => { const r = t.getBoundingClientRect(); return Math.round(r.width); })); const minW = Math.min(...sizes);
    const { L, done } = await solveLevel(pg);
    ok(done, '레벨 ' + n + ' 클리어(' + L.type + ', 칸 ' + L.tubes.length + ', 칸 폭 ' + minW + ')');
    ok(minW >= 44, '레벨 ' + n + ' 칸 폭 44px 이상(' + minW + ')');
    if (n === A) await shot('result');
    if (n === 10 || n === 20 || n === NL) { const rw = await pg.evaluate(() => Room.owned().filter((id) => id.startsWith('u_')).length); ok(rw >= 1, '레벨 ' + n + ' 까지 수납 소품 ' + rw + '개'); }
  }
  if (A === 1) {
    await pg.evaluate(() => { document.querySelectorAll('.uk-scrim,.tale-ov').forEach((e) => e.remove()); GF.stack = []; GF.go('shome'); GF.go('splay', { n: 4 }); SORT.fast = false; }); await pg.waitForSelector('.screen.on .sr-tube'); await pg.waitForTimeout(500);
    const L = await pg.evaluate(() => SORT.debug.level()), [a, c] = L.solution[0];
    await pg.click('.screen.on .sr-tube[data-i="' + a + '"]', { force: true }); await pg.waitForTimeout(200); ok(await pg.evaluate(() => SORT.debug.sel() >= 0), '실제 클릭으로 칸을 집음');
    await pg.click('.screen.on .sr-tube[data-i="' + c + '"]', { force: true }); await pg.waitForTimeout(300); ok(await pg.evaluate(() => SORT.debug.state().moves === 1), '실제 클릭으로 물건이 옮겨짐');
    await pg.evaluate(() => SORT.debug.undo()); await pg.waitForTimeout(200); ok(await pg.evaluate(() => SORT.debug.state().moves === 0 && SORT.debug.state().used.undo === 1), '되돌리기');
    for (let k = 0; k < 4; k++) { await pg.evaluate(([x, y]) => { SORT.debug.tap(x); SORT.debug.tap(y); SORT.debug.undo(); }, L.solution[0]); await pg.waitForTimeout(80); }
    ok(await pg.evaluate(() => SORT.debug.state().used.undo === 3), '되돌리기는 한 판 3번까지');
    await pg.evaluate(() => SORT.debug.extra()); await pg.waitForTimeout(200); const t1 = await pg.evaluate(() => SORT.debug.state().tubes.length); await pg.evaluate(() => SORT.debug.extra()); ok(t1 === L.tubes.length + 1 && (await pg.evaluate((n) => SORT.debug.state().tubes.length === n, t1)), '칸 하나 더(1번만)');
    await pg.evaluate(() => { SORT.debug.hint(); }); await pg.waitForTimeout(300); ok(await pg.evaluate(() => !!document.querySelector('.screen.on .sr-tube.hinta')), '힌트: 집을 칸이 깜빡임');
    const bad = await pg.evaluate(() => { const S = SORT.debug.state(); for (let i = 0; i < S.tubes.length; i++) for (let j = 0; j < S.tubes.length; j++) if (i !== j && S.tubes[i].length && !SortCore.canMove(S, i, j)) return [i, j]; return null; });
    if (bad) { const m0 = await pg.evaluate(() => SORT.debug.state().moves); await pg.evaluate(([x, y]) => { SORT.debug.tap(x); SORT.debug.tap(y); }, bad); await pg.waitForTimeout(200); ok(await pg.evaluate((m) => SORT.debug.state().moves === m, m0), '못 옮기는 칸엔 안 놓임(벌 없음)'); }
    const types = await pg.evaluate(() => { const o = {}; SORT.debug.D().levels.forEach((l) => { if (!o[l.type]) o[l.type] = l.id; }); return o; }); ok(Object.keys(types).length >= 6, '판 종류 ' + Object.keys(types).length + '종: ' + Object.keys(types).join(','));
    const common = [['오늘의 한 판', 'SORT.debug.dailyLevel()'], ['세 가족 판(네모)', 'SORT.debug.trioLevels(8)[0]'], ['세 가족 판(세모)', 'SORT.debug.trioLevels(8)[1]'], ['세 가족 판(동그라미)', 'SORT.debug.trioLevels(8)[2]'], ['시즌 판', '(SORT.season = "chuseok", SORT.debug.seasonLevel(SORT.debug.X().seasons[0]))']];
    for (const [nm, expr] of common) { await pg.evaluate((e) => { document.querySelectorAll('.uk-scrim,.tale-ov').forEach((e) => e.remove()); GF.stack = []; GF.go('shome'); const L = eval(e); GF.go('splay', { level: L }); SORT.fast = true; }, expr); await pg.waitForSelector('.screen.on .sr-tube'); const { L, done } = await solveLevel(pg); ok(done, nm + ' 클리어(' + L.type + ')'); }
    await pg.evaluate(() => { document.querySelectorAll('.uk-scrim,.tale-ov').forEach((e) => e.remove()); GF.stack = []; GF.go('shome'); GF.go('strio'); }); await pg.waitForSelector('.screen.on .sr-trio'); await shot('trio');
    await pg.evaluate(() => { document.querySelectorAll('.uk-scrim,.tale-ov').forEach((e) => e.remove()); GF.stack = []; GF.go('shome'); GF.go('shouse'); }); await pg.waitForSelector('.screen.on .rm-room'); await shot('house');
  }
  ok(errs.length === 0, '콘솔 오류 없음 ' + errs.slice(0, 3).join(' | '));
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
