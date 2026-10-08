// 다른 그림 찾기 smoke: node tools/spot_smoke.js (URL=… 로 빌드본, LV=1-10 구간). 정답 좌표를 실제 화면 조작(포인터 한 번 + 디버그 탭)으로 재생한다.
const { chromium } = require('playwright-core'), path = require('path');
const URL = process.env.URL || 'http://localhost:8765/games/spot/index.html', [A, B] = (process.env.LV || '1-120').split('-').map(Number);
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const solveLevel = async (pg) => {
  const L = await pg.evaluate(() => SPOT.debug.level());
  if (L.type === 'memory') await pg.evaluate(() => SPOT.debug.seen());
  for (let ri = 0; ri < L.rounds.length; ri++) {
    for (const d of L.rounds[ri].diffs) { await pg.evaluate(([x, y]) => SPOT.debug.tap(x, y), [d.x + d.w / 2, d.y + d.h / 2]); await pg.waitForTimeout(40); }
    await pg.waitForTimeout(ri < L.rounds.length - 1 ? 900 : 100);
  }
  for (let g = 0; g < 12; g++) { if (await pg.evaluate(() => !!document.querySelector('.screen.on .uk-sheet'))) break; const nb = await pg.$('.screen.on .nextbtn'); if (nb) await nb.click({ force: true }).catch(() => {}); await pg.waitForTimeout(350); }
  await pg.waitForSelector('.screen.on .uk-sheet', { timeout: 4000 }).catch(() => {});
  return { L, done: await pg.evaluate(() => !!document.querySelector('.screen.on .uk-sheet')) };
};
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const pg = await (await b.newContext({ viewport: { width: 412, height: 915 }, hasTouch: true })).newPage(), errs = [];
  pg.on('pageerror', (e) => errs.push(e.message)); pg.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await pg.goto(URL); await pg.waitForSelector('.sp-btns', { timeout: 10000 });
  const shot = async (n) => { await pg.waitForTimeout(500); await pg.screenshot({ path: path.join(__dirname, '..', 'notes', 'snapshots', '2026-10-08_spot_' + n + '.png') }); };
  await shot('home');
  const small = await pg.evaluate(() => { const o = []; document.querySelectorAll('.screen.on *').forEach((e) => { if (e.children.length === 0 && e.textContent.trim() && e.offsetParent && !/^[★☆✔]+$/.test(e.textContent.trim())) { const f = parseFloat(getComputedStyle(e).fontSize); if (f < 17) o.push(e.textContent.trim().slice(0, 8) + ':' + f.toFixed(1)); } }); return o; });
  ok(small.length === 0, '홈 글자 크기 17px 이상 ' + small.slice(0, 4).join(','));
  await pg.evaluate(() => { GF.stack = []; GF.go('phome'); GF.go('plevels'); }); await pg.waitForSelector('.screen.on .sp-l'); await shot('levels');
  const lk = await pg.evaluate(() => ({ off: document.querySelectorAll('.screen.on .sp-l.off').length, all: document.querySelectorAll('.screen.on .sp-l').length })); const NLV = await pg.evaluate(() => SPOT.debug.D().levels.length); ok(lk.all === NLV && lk.off === NLV - 1, '레벨 목록 ' + NLV + '개(처음엔 1만 열림)');
  for (let n = A; n <= B; n++) {
    await pg.evaluate((nn) => { GF.stack = []; GF.go('phome'); GF.go('pplay', { n: nn }); SPOT.unlockAll = true; SPOT.fast = true; }, n); await pg.waitForSelector('.screen.on .sp-area');
    if (n === A || n === 4 || n === 6 || n === 9) await shot('play' + n);
    const { L, done } = await solveLevel(pg);
    ok(done, '레벨 ' + n + ' 클리어(' + L.type + ', ' + L.goalN + '곳)');
    if (n === A) await shot('result');
    if (n === 10 || n === 120) { const rw = await pg.evaluate(() => Room.owned().filter((id) => id.startsWith('a_')).length); ok(rw >= 1, '레벨 ' + n + ' 까지 사진·앨범 소품 ' + rw + '개'); }
  }
  if (A === 1) {
    // 실제 포인터로 한 곳 누르기 + 틀린 탭 + 힌트
    await pg.evaluate(() => { GF.stack = []; GF.go('phome'); GF.go('pplay', { n: 1 }); }); await pg.waitForSelector('.screen.on .sp-pic'); await pg.waitForTimeout(500);
    const d0 = await pg.evaluate(() => SPOT.debug.level().rounds[0].diffs[0]);
    const pos = await pg.evaluate((d) => { const w = document.querySelectorAll('.screen.on .sp-pic')[1].getBoundingClientRect(); const L = SPOT.debug.level().rounds[0]; let bx = 168, by = 105, best = -1; for (let yy = 30; yy < 190; yy += 10) for (let xx = 30; xx < 310; xx += 10) { const m = Math.min(...L.diffs.map((q) => Math.hypot(xx - (q.x + q.w / 2), yy - (q.y + q.h / 2)))); if (m > best) { best = m; bx = xx; by = yy; } } return { x: w.x + (d.x + d.w / 2) / 336 * w.width, y: w.y + (d.y + d.h / 2) / 210 * w.height, wx: w.x + bx / 336 * w.width, wy: w.y + by / 210 * w.height }; }, d0);
    await pg.mouse.click(pos.wx, pos.wy); await pg.waitForTimeout(300); ok(await pg.evaluate(() => SPOT.debug.state().wrong === 1), '틀린 곳을 누르면 틀린 탭 1회(판은 계속)');
    await pg.mouse.click(pos.x, pos.y); await pg.waitForTimeout(400); ok(await pg.evaluate(() => SPOT.debug.state().found[0][0] === true), '실제 포인터로 틀린 곳 찾기');
    await pg.evaluate(() => { SPOT.fast = false; SPOT.debug.hint(); }); await pg.waitForTimeout(300); ok(await pg.evaluate(() => SPOT.debug.state().hints === 1 && !!document.querySelector('.screen.on .sp-pulse')), '힌트: 아직 못 찾은 곳이 깜빡임');
    // 기억 판: 처음엔 B 가림, 「다 봤어요」 뒤 A 가림
    const mem = await pg.evaluate(() => SPOT.debug.D().levels.find((l) => l.type === 'memory').id); await pg.evaluate((n) => { SPOT.unlockAll = true; GF.stack = []; GF.go('phome'); GF.go('pplay', { n }); }, mem); await pg.waitForSelector('.screen.on .sp-pic'); await pg.waitForTimeout(400);
    ok(await pg.evaluate(() => document.querySelectorAll('.screen.on .sp-cov').length === 1), '기억 판: 처음에는 아래 그림을 가림(카운트다운 없음)');
    await pg.click('.screen.on .sp-cov .uk-btn', { force: true }); await pg.waitForTimeout(400); ok(await pg.evaluate(() => SPOT.debug.state().phase === 'find' && document.querySelectorAll('.screen.on .sp-cov').length === 1), '기억 판: 「다 봤어요」 뒤 원본을 가리고 찾기 시작');
    // 확대 판: 확대 토글
    const zm = await pg.evaluate(() => SPOT.debug.D().levels.find((l) => l.type === 'zoom').id); await pg.evaluate((n) => { GF.stack = []; GF.go('phome'); GF.go('pplay', { n }); }, zm); await pg.waitForSelector('.screen.on .sp-pic'); await pg.waitForTimeout(400);
    const z1 = await pg.evaluate(() => SPOT.debug.state().zoomed); await pg.click('.screen.on .sp-btns2 .uk-btn:last-child', { force: true }); await pg.waitForTimeout(300); ok(z1 === true && (await pg.evaluate(() => SPOT.debug.state().zoomed)) === false, '확대 판: 확대/원래 토글');
    // 공통 판
    const common = [['오늘의 한 판', 'SPOT.debug.dailyLevel()'], ['세 가족 판(네모)', 'SPOT.debug.trioLevels(8)[0]'], ['세 가족 판(세모)', 'SPOT.debug.trioLevels(8)[1]'], ['세 가족 판(동그라미)', 'SPOT.debug.trioLevels(8)[2]'], ['시즌 판', '(SPOT.season = "chuseok", SPOT.debug.seasonLevel(SPOT.debug.X().seasons[0]))']];
    for (const [nm, expr] of common) { await pg.evaluate((e) => { GF.stack = []; GF.go('phome'); const L = eval(e); GF.go('pplay', { level: L }); SPOT.fast = true; }, expr); await pg.waitForSelector('.screen.on .sp-area'); const { L, done } = await solveLevel(pg); ok(done, nm + ' 클리어(' + L.type + ')'); }
    await pg.evaluate(() => { GF.stack = []; GF.go('phome'); GF.go('ptrio'); }); await pg.waitForSelector('.screen.on .sp-trio'); await shot('trio');
    await pg.evaluate(() => { GF.stack = []; GF.go('phome'); GF.go('phouse'); }); await pg.waitForSelector('.screen.on .rm-room'); await shot('house');
  }
  ok(errs.length === 0, '콘솔 오류 없음 ' + errs.slice(0, 3).join(' | '));
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
