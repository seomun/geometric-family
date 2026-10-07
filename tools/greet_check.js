// 첫 만남 인사 점검: node tools/greet_check.js  — 새 저장소로 ?greet=1 로 열어 인사가 뜨고, 자동으로 넘어가며(또는 탭 건너뛰기), 두 번째 실행엔 안 뜨는지 확인
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const APPS = [['② 식탁', 'idle/index.html', '.tcard'], ['③ 합치기', 'merge/index.html', '.mg-btns'], ['④ 색칠북', 'color/index.html', '.cl-cards'], ['⑤ 어느 도형', 'quiz/index.html', '.qz-grid'], ['⑦ 도형 블록', 'block/index.html', '.bk-btns']];
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const [n, u, home] of APPS) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 780 } }), p = await ctx.newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto('http://localhost:8765/games/' + u + '?greet=1'); await p.waitForTimeout(1500);
    const on = await p.evaluate(() => !!document.querySelector('.screen.on .cut-char') && !!document.querySelector('.screen.on .caption'));
    ok(on, n + ' 첫 실행 인사 컷(세 가족 + 자막) 표시');
    if (n.startsWith('③')) await p.screenshot({ path: 'notes/snapshots/greet_merge.png' });
    await p.mouse.click(195, 400); await p.waitForTimeout(700);
    ok(await p.evaluate((h) => !!document.querySelector('.screen.on ' + h) || !!document.querySelector(h), home), n + ' 탭 한 번에 건너뛰고 홈');
    await p.reload(); await p.waitForTimeout(1500);
    ok(!(await p.evaluate(() => !!document.querySelector('.screen.on .cut-char'))), n + ' 두 번째 실행엔 인사 없음');
    // 자동 넘김(3.2초)
    const c2 = await b.newContext({ viewport: { width: 390, height: 780 } }), q = await c2.newPage(); await q.goto('http://localhost:8765/games/' + u + '?greet=1'); await q.waitForTimeout(4600);
    ok(await q.evaluate((h) => !!document.querySelector(h) && !document.querySelector('.screen.on .cut-char'), home), n + ' 3.2초 뒤 자동으로 홈');
    ok(errs.length === 0, n + ' 오류 없음 ' + errs[0]); await ctx.close(); await c2.close();
  }
  // ① 프롤로그
  const c3 = await b.newContext({ viewport: { width: 390, height: 780 } }), p3 = await c3.newPage(); await p3.goto('http://localhost:8765/games/index.html?greet=1'); await p3.waitForTimeout(1800);
  await p3.click('.homeplay', { force: true }); await p3.waitForTimeout(900); ok(await p3.evaluate(() => !!document.querySelector('.screen.on .cut-char')), '① 첫 실행 프롤로그 컷 표시'); await p3.screenshot({ path: 'notes/snapshots/greet_book1.png' });
  await p3.mouse.click(195, 400); await p3.waitForTimeout(1200); ok(await p3.evaluate(() => !!document.querySelector('.screen.on .playarea')), '① 탭 한 번에 프롤로그 건너뛰고 첫 판');
  await p3.evaluate(() => { GF.stack = []; GF.go('home'); }); await p3.waitForTimeout(500); await p3.click('.homeplay', { force: true }); await p3.waitForTimeout(900);
  ok(await p3.evaluate(() => !document.querySelector('.screen.on .cut-char')), '① 두 번째부터는 프롤로그 없이 바로 판');
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
