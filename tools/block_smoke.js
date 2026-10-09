// 도형 블록 smoke: node tools/block_smoke.js  (URL=… 로 빌드본, LV=1-10 구간). 풀이를 실제 화면(디버그 place)·끌기·탭으로 재생한다.
const { chromium } = require('playwright-core'), path = require('path');
const URL = process.env.URL || 'http://localhost:8765/games/block/index.html', [A, B] = (process.env.LV || '1-120').split('-').map(Number);
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const solveLevel = async (pg) => {
  const L = await pg.evaluate(() => BLOCK.debug.level());
  for (const m of L.solution) {
    const okp = await pg.evaluate((mm) => BLOCK.debug.place(mm[0], mm[1], mm[2]), m); if (!okp) break;
    await pg.waitForFunction(() => !BLOCK.debug.busy() || !!document.querySelector('.screen.on .uk-sheet, .screen.on .nextbtn'), null, { timeout: 6000 }).catch(() => {});
    if (await pg.evaluate(() => !!document.querySelector('.screen.on .uk-sheet, .screen.on .nextbtn'))) break;
  }
  for (let g = 0; g < 10; g++) { if (await pg.evaluate(() => !!document.querySelector('.screen.on .uk-sheet'))) break; const nb = await pg.$('.screen.on .nextbtn'); if (nb) await nb.click({ force: true }).catch(() => {}); await pg.waitForTimeout(350); }
  await pg.waitForSelector('.screen.on .uk-sheet', { timeout: 4000 }).catch(() => {});
  return { L, done: await pg.evaluate(() => !!document.querySelector('.screen.on .uk-sheet')) };
};
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const pg = await (await b.newContext({ viewport: { width: 412, height: 915 }, hasTouch: true })).newPage(), errs = []; await pg.addInitScript(() => { window.__noResume = true; });
  pg.on('pageerror', (e) => errs.push(e.message)); pg.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await pg.goto(URL); await pg.waitForSelector('.bk-btns', { timeout: 10000 });
  const shot = async (n) => { await pg.waitForTimeout(500); await pg.screenshot({ path: path.join(__dirname, '..', 'notes', 'snapshots', '2026-10-07_block_' + n + '.png') }); };
  await shot('home');
  const small = await pg.evaluate(() => { const o = []; document.querySelectorAll('.screen.on *').forEach((e) => { if (e.children.length === 0 && e.textContent.trim() && e.offsetParent && !/^[★☆✔]+$/.test(e.textContent.trim())) { const f = parseFloat(getComputedStyle(e).fontSize); if (f < 17) o.push(e.textContent.trim().slice(0, 8) + ':' + f.toFixed(1)); } }); return o; });
  ok(small.length === 0, '홈 글자 크기 17px 이상 ' + small.slice(0, 4).join(','));
  await pg.evaluate(() => { document.querySelectorAll('.uk-scrim,.tale-ov').forEach((e) => e.remove()); GF.stack = []; GF.go('bhome'); GF.go('blevels'); }); await pg.waitForSelector('.screen.on .sg-node'); await shot('levels');
  const lk = await pg.evaluate(async () => { const sc = GF.saga.scroll; for (let y = sc.scrollHeight; y >= 0; y -= 500) { sc.scrollTop = y; await new Promise((r) => setTimeout(r, 60)); } return ({ off: document.querySelectorAll('.screen.on .sg-node.off').length, all: document.querySelectorAll('.screen.on .sg-node').length }); }); ok(lk.all === 120 && lk.off === 119, '레벨 목록 120개(처음엔 1만 열림)');
  for (let n = A; n <= B; n++) {
    await pg.evaluate((nn) => { document.querySelectorAll('.uk-scrim,.tale-ov').forEach((e) => e.remove()); GF.stack = []; GF.go('bhome'); GF.go('bplay', { n: nn }); BLOCK.unlockAll = true; BLOCK.fast = true; }, n); await pg.waitForSelector('.screen.on .bk-board');
    if (n === A) await shot('play0');
    const { L, done } = await solveLevel(pg);
    ok(done, '레벨 ' + n + ' 클리어(' + L.type + ', 조각 ' + L.queue.length + ', 최소 ' + L.par + ')');
    if (n === A) await shot('result');
    if (n === 10 || n === 120) { const rw = await pg.evaluate(() => Room.owned().filter((id) => id.startsWith('o_')).length); ok(rw >= 1, '레벨 ' + n + ' 까지 집 소품 ' + rw + '개'); }
  }
  if (A === 1) {
    // 끌어서 놓기(실제 포인터) + 되돌리기 + 탭 놓기
    await pg.evaluate(() => { document.querySelectorAll('.uk-scrim,.tale-ov').forEach((e) => e.remove()); GF.stack = []; GF.go('bhome'); GF.go('bplay', { n: 1 }); }); await pg.waitForSelector('.screen.on .bk-board'); await pg.waitForTimeout(600);
    const mv = await pg.evaluate(() => BLOCK.debug.level().solution[0]);
    const pos = await pg.evaluate((m) => {
      const s = document.querySelector('.screen.on .bk-slot[data-k="' + m[0] + '"]').getBoundingClientRect(), c = BLOCK.debug.cells()[m[1] * 8 + m[2]].getBoundingClientRect(), t = BLOCK.debug.state().tray[m[0]], sh = BlockCore.PIECES[t.p];
      const h = Math.max(...sh.map((x) => x[0])) + 1, w = Math.max(...sh.map((x) => x[1])) + 1, k = document.getElementById('safe').getBoundingClientRect().width / 360, g = 36 * k;
      return { sx: s.x + s.width / 2, sy: s.y + s.height / 2, tx: c.x + (w * g) / 2, ty: c.y + h * g + g * 1.1 };
    }, mv);
    await pg.mouse.move(pos.sx, pos.sy); await pg.mouse.down(); await pg.mouse.move(pos.tx, pos.ty, { steps: 8 });
    const pv = await pg.evaluate(() => document.querySelectorAll('.screen.on .bk-cell.pv').length); await pg.mouse.up(); await pg.waitForTimeout(500);
    ok(pv > 0, '끌 때 놓을 자리 미리 보기 ' + pv + '칸'); ok(await pg.evaluate(() => BLOCK.debug.state().used === 1), '끌어서 놓기 성공(조각 1개 사용)');
    await pg.evaluate(() => BLOCK.debug.undo()); await pg.waitForTimeout(300); ok(await pg.evaluate(() => BLOCK.debug.state().used === 0), '되돌리기(1회)');
    await pg.evaluate(() => { BLOCK.debug.place(BLOCK.debug.level().solution[0][0], BLOCK.debug.level().solution[0][1], BLOCK.debug.level().solution[0][2]); }); await pg.waitForTimeout(400);
    await pg.evaluate(() => BLOCK.debug.undo()); await pg.waitForTimeout(200); ok(await pg.evaluate(() => BLOCK.debug.state().used === 1), '두 번째 되돌리기는 막힘(한 판에 한 번)');
    // 탭: 조각 선택 → 칸
    await pg.evaluate(() => { document.querySelectorAll('.uk-scrim,.tale-ov').forEach((e) => e.remove()); GF.stack = []; GF.go('bhome'); GF.go('bplay', { n: 1 }); }); await pg.waitForSelector('.screen.on .bk-board'); await pg.waitForTimeout(500);
    const m0 = await pg.evaluate(() => BLOCK.debug.level().solution[0]); await pg.click('.screen.on .bk-slot[data-k="' + m0[0] + '"]', { force: true }); await pg.waitForTimeout(200);
    await pg.evaluate((m) => BLOCK.debug.cells()[m[1] * 8 + m[2]].click(), m0); await pg.waitForTimeout(400); ok(await pg.evaluate(() => BLOCK.debug.state().used === 1), '탭으로 놓기(조각 선택 → 칸)');
    // 지는 흐름
    await pg.evaluate(() => { document.querySelectorAll('.uk-scrim,.tale-ov').forEach((e) => e.remove()); GF.stack = []; GF.go('bhome'); GF.go('bplay', { n: 1 }); BLOCK.fast = true; }); await pg.waitForSelector('.screen.on .bk-board'); await pg.waitForTimeout(400);
    await pg.evaluate(() => { const S = BLOCK.debug.state(); S.fam.fill(0); for (let r = 0; r < 8; r++) { S.fam[r * 8 + r] = -1; S.fam[r * 8 + ((r + 1) % 8)] = -1; } S.tray = [{ p: 'd', c: 0, sh: 0 }, { p: 's3', c: 1, sh: 0 }, { p: 'h5', c: 2, sh: 0 }]; BLOCK.debug.place(0, 0, 0); });
    await pg.waitForTimeout(1500); ok(await pg.evaluate(() => BLOCK.debug.state().used === 0 && !document.querySelector('.screen.on .uk-sheet')), '자리가 없으면 벌 없이 즉시 새 판(한 번 더)');
    const types = await pg.evaluate(() => { const o = {}; BLOCK.debug.D().levels.forEach((l) => { if (!o[l.type]) o[l.type] = l.id; }); return o; }); ok(Object.keys(types).length >= 6, '판 종류 ' + Object.keys(types).length + '종: ' + Object.keys(types).join(','));
    const common = [['오늘의 한 판', 'BLOCK.debug.dailyLevel()'], ['세 가족 판(네모)', 'BLOCK.debug.trioLevels(8)[0]'], ['세 가족 판(세모)', 'BLOCK.debug.trioLevels(8)[1]'], ['세 가족 판(동그라미)', 'BLOCK.debug.trioLevels(8)[2]'], ['시즌 판', '(BLOCK.season = "chuseok", BLOCK.debug.seasonLevel(BLOCK.debug.X().seasons[0]))']];
    for (const [nm, expr] of common) {
      await pg.evaluate((e) => { document.querySelectorAll('.uk-scrim,.tale-ov').forEach((e) => e.remove()); GF.stack = []; GF.go('bhome'); const L = eval(e); GF.go('bplay', { level: L }); BLOCK.fast = true; }, expr); await pg.waitForSelector('.screen.on .bk-board');
      const { L, done } = await solveLevel(pg); ok(done, nm + ' 클리어(' + L.type + ')');
    }
    await pg.evaluate(() => { document.querySelectorAll('.uk-scrim,.tale-ov').forEach((e) => e.remove()); GF.stack = []; GF.go('bhome'); GF.go('btrio'); }); await pg.waitForSelector('.screen.on .bk-trio'); await shot('trio');
    await pg.evaluate(() => { document.querySelectorAll('.uk-scrim,.tale-ov').forEach((e) => e.remove()); GF.stack = []; GF.go('bhome'); GF.go('bhouse'); }); await pg.waitForSelector('.screen.on .rm-room'); await shot('house');
    // 끝없이 모드: 아무 데나 놓다가 자리가 없으면 벌 없이 끝, 최고 기록 저장, 한 번 더
    await pg.evaluate(() => { BLOCK.fast = true; document.querySelectorAll('.uk-scrim,.tale-ov').forEach((e) => e.remove()); GF.stack = []; GF.go('bhome'); GF.go('blevels'); }); await pg.waitForSelector('.screen.on .sg-side .sg-rb >> nth=0'); await pg.click('.screen.on .sg-side .sg-rb >> nth=0'); await pg.waitForSelector('.screen.on .bk-board');
    const endL = await pg.evaluate(() => BLOCK.debug.level()); ok(endL.kind === 'endless' && endL.queue.length >= 1000, '끝없이: 조각 ' + endL.queue.length + '개 준비');
    for (let g = 0; g < 400; g++) { const mv = await pg.evaluate(() => { const S = BLOCK.debug.state(); const M = BlockCore; const m = M.moves(S); return m.length ? m[(Math.random() * m.length) | 0] : null; }); if (!mv) break; await pg.evaluate((m) => BLOCK.debug.place(m[0], m[1], m[2]), mv); await pg.waitForTimeout(8); if (await pg.evaluate(() => !!document.querySelector('.screen.on .uk-sheet'))) break; }
    await pg.waitForSelector('.screen.on .uk-sheet', { timeout: 6000 }).catch(() => {}); ok(await pg.evaluate(() => !!document.querySelector('.screen.on .uk-sheet')), '끝없이: 자리가 없으면 결과 시트(벌 없음)');
    ok(await pg.evaluate(() => (BLOCK.debug.SV().endless || {}).best > 0), '끝없이: 최고 기록 저장 ' + await pg.evaluate(() => JSON.stringify(BLOCK.debug.SV().endless)));
    await pg.click('.screen.on .uk-sheet .acts .uk-btn >> nth=0'); await pg.waitForSelector('.screen.on .bk-board'); ok(await pg.evaluate(() => BLOCK.debug.level().kind === 'endless' && BLOCK.debug.state().used === 0), '끝없이: 한 번 더로 새 판');
  }
  ok(errs.length === 0, '콘솔 오류 없음 ' + errs.slice(0, 3).join(' | '));
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
