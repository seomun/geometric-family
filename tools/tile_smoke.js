// 세 가족 짝 맞추기 smoke: node tools/tile_smoke.js (URL=… 로 빌드본, LV=1-10 구간). 풀이(제거 순서)를 실제 화면 클릭(첫 판)·디버그 누르기로 재생한다.
const { chromium } = require('playwright-core'), path = require('path');
const URL = process.env.URL || 'http://localhost:8765/games/tile/index.html', [A, B] = (process.env.LV || '1-120').split('-').map(Number);
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const solveLevel = async (pg) => {
  const L = await pg.evaluate(() => TILE.debug.level());
  for (const i of L.solution) {
    const okp = await pg.evaluate((ii) => { const S = TILE.debug.state(); if (S.won || S.gone[ii]) return null; TILE.debug.press(ii); return true; }, i); if (okp === null) break;
    await pg.waitForTimeout(25); if (await pg.evaluate(() => !!document.querySelector('.screen.on .uk-sheet, .screen.on .nextbtn'))) break; if (await pg.evaluate(() => TILE.debug.state().won)) break;
  }
  for (let g = 0; g < 12; g++) { if (await pg.evaluate(() => !!document.querySelector('.screen.on .uk-sheet'))) break; const nb = await pg.$('.screen.on .nextbtn'); if (nb) await nb.click({ force: true }).catch(() => {}); await pg.waitForTimeout(350); }
  await pg.waitForSelector('.screen.on .uk-sheet', { timeout: 4000 }).catch(() => {});
  return { L, done: await pg.evaluate(() => !!document.querySelector('.screen.on .uk-sheet')) };
};
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const pg = await (await b.newContext({ viewport: { width: 412, height: 915 }, hasTouch: true })).newPage(), errs = []; await pg.addInitScript(() => { window.__noResume = true; });
  pg.on('pageerror', (e) => errs.push(e.message)); pg.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await pg.goto(URL); await pg.waitForSelector('.tl-btns', { timeout: 10000 });
  const shot = async (n) => { await pg.waitForTimeout(500); await pg.screenshot({ path: path.join(__dirname, '..', 'notes', 'snapshots', '2026-10-08_tile_' + n + '.png') }); };
  await shot('home');
  const small = await pg.evaluate(() => { const o = []; document.querySelectorAll('.screen.on *').forEach((e) => { if (e.children.length === 0 && e.textContent.trim() && e.offsetParent && !/^[★☆✔]+$/.test(e.textContent.trim())) { const f = parseFloat(getComputedStyle(e).fontSize); if (f < 17) o.push(e.textContent.trim().slice(0, 8) + ':' + f.toFixed(1)); } }); return o; });
  ok(small.length === 0, '홈 글자 크기 17px 이상 ' + small.slice(0, 4).join(','));
  await pg.evaluate(() => { GF.stack = []; GF.go('thome'); GF.go('tlevels'); }); await pg.waitForSelector('.screen.on .tl-l'); await shot('levels');
  const lk = await pg.evaluate(() => ({ off: document.querySelectorAll('.screen.on .tl-l.off').length, all: document.querySelectorAll('.screen.on .tl-l').length })); ok(lk.all === 120 && lk.off === 119, '레벨 목록 120개(처음엔 1만 열림)');
  for (let n = A; n <= B; n++) {
    await pg.evaluate((nn) => { GF.stack = []; GF.go('thome'); GF.go('tplay', { n: nn }); TILE.unlockAll = true; TILE.fast = true; }, n); await pg.waitForSelector('.screen.on .tl-board');
    if (n === A || [4, 7, 9].includes(n)) await shot('play' + n);
    const { L, done } = await solveLevel(pg);
    ok(done, '레벨 ' + n + ' 클리어(' + L.type + ', 타일 ' + L.tiles.length + ')');
    if (n === A) await shot('result');
    if (n === 10 || n === 120) { const rw = await pg.evaluate(() => Room.owned().filter((id) => id.startsWith('m_')).length); ok(rw >= 1, '레벨 ' + n + ' 까지 마당 살림 소품 ' + rw + '개'); }
  }
  if (A === 1) {
    // 실제 클릭: 첫 판의 눌러도 되는 타일, 가려진 타일은 흔들리며 안 눌림
    await pg.evaluate(() => { GF.stack = []; GF.go('thome'); GF.go('tplay', { n: 4 }); TILE.fast = false; }); await pg.waitForSelector('.screen.on .tl-board'); await pg.waitForTimeout(500);
    const info = await pg.evaluate(() => { const S = TILE.debug.state(), L = TILE.debug.level(), free = S.L.tiles.map((t, i) => i).filter((i) => TileCore.isFree(S, i)), cov = S.L.tiles.map((t, i) => i).filter((i) => !TileCore.isFree(S, i)); return { f: free[0], c: cov[0] }; });
    await pg.evaluate((ci) => document.querySelector('.screen.on .tl-t[data-i="' + ci + '"]').click(), info.c); await pg.waitForTimeout(200); ok(await pg.evaluate(() => TILE.debug.state().presses === 0), '가려진 타일은 눌러도 바구니에 안 들어감');
    await pg.click('.screen.on .tl-t[data-i="' + info.f + '"]', { force: true }); await pg.waitForTimeout(300); ok(await pg.evaluate(() => TILE.debug.state().presses === 1 && TILE.debug.state().tray.length === 1), '실제 클릭으로 타일이 바구니에 들어감');
    await pg.evaluate(() => TILE.debug.undo()); await pg.waitForTimeout(200); ok(await pg.evaluate(() => TILE.debug.state().presses === 0 && TILE.debug.state().used.undo === 1), '되돌리기(1회)');
    await pg.evaluate(() => TILE.debug.shuffle()); await pg.waitForTimeout(200); ok(await pg.evaluate(() => TILE.debug.state().used.shuffle === 1), '섞기(무료 1회)');
    await pg.evaluate(() => { TILE.debug.hint(); }); await pg.waitForTimeout(300); ok(await pg.evaluate(() => !!document.querySelector('.screen.on .tl-t.hint')), '힌트: 누를 수 있는 타일이 깜빡임');
    // 지는 흐름: 바구니를 서로 다른 그림으로 채우면 즉시 새 판
    await pg.evaluate(() => { GF.stack = []; GF.go('thome'); GF.go('tplay', { n: 4 }); TILE.fast = true; }); await pg.waitForSelector('.screen.on .tl-board'); await pg.waitForTimeout(300);
    await pg.evaluate(() => { const S = TILE.debug.state(); S.tray = Array.from({ length: S.cap - 1 }, (_, k) => ({ i: -1, kind: 'z' + k })); const fr = TileCore.freeList(S); S.kinds[fr[0]] = 'k99'; TILE.debug.press(fr[0]); });
    await pg.waitForTimeout(1500); ok(await pg.evaluate(() => TILE.debug.state().presses === 0 && TILE.debug.state().tray.length === 0 && !document.querySelector('.screen.on .uk-sheet')), '바구니가 가득 차면 벌 없이 즉시 새 판(한 번 더)');
    const types = await pg.evaluate(() => { const o = {}; TILE.debug.D().levels.forEach((l) => { if (!o[l.type]) o[l.type] = l.id; }); return o; }); ok(Object.keys(types).length >= 6, '판 종류 ' + Object.keys(types).length + '종: ' + Object.keys(types).join(','));
    const common = [['오늘의 한 판', 'TILE.debug.dailyLevel()'], ['세 가족 판(네모)', 'TILE.debug.trioLevels(8)[0]'], ['세 가족 판(세모)', 'TILE.debug.trioLevels(8)[1]'], ['세 가족 판(동그라미)', 'TILE.debug.trioLevels(8)[2]'], ['시즌 판', '(TILE.season = "chuseok", TILE.debug.seasonLevel(TILE.debug.X().seasons[0]))']];
    for (const [nm, expr] of common) { await pg.evaluate((e) => { GF.stack = []; GF.go('thome'); const L = eval(e); GF.go('tplay', { level: L }); TILE.fast = true; }, expr); await pg.waitForSelector('.screen.on .tl-board'); const { L, done } = await solveLevel(pg); ok(done, nm + ' 클리어(' + L.type + ')'); }
    await pg.evaluate(() => { GF.stack = []; GF.go('thome'); GF.go('ttrio'); }); await pg.waitForSelector('.screen.on .tl-trio'); await shot('trio');
    await pg.evaluate(() => { GF.stack = []; GF.go('thome'); GF.go('thouse'); }); await pg.waitForSelector('.screen.on .rm-room'); await shot('house');
  }
  ok(errs.length === 0, '콘솔 오류 없음 ' + errs.slice(0, 3).join(' | '));
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
