// C1 시험: 새 기능을 처음 열 때 전용 튜토리얼 컷이 한 번만 나오는지 — ⑤ 미니게임 · ④ 따라 그리기·스티커. node tools/tut_hooks.js
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const open = async (a, fn) => { const ctx = await b.newContext({ viewport: { width: 390, height: 780 } }), p = await ctx.newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message)); await p.addInitScript(() => { window.__noResume = true; }); await p.goto('http://localhost:8765/games/' + a + '/index.html'); await p.waitForTimeout(1600); await p.evaluate(() => { GF.tale.force = true; GF.tale.reset && GF.tale.reset(); }); return [ctx, p, errs]; };
  const tale = (p) => p.evaluate(() => !!document.querySelector('.tale-ov'));
  { const [ctx, p, errs] = await open('quiz'); await p.evaluate(() => { GF.stack = []; GF.go('qgames'); }); await p.waitForTimeout(1200); ok(await tale(p), '⑤ 미니게임 목록을 처음 열면 설명 컷'); await p.screenshot({ path: 'notes/snapshots/tut_quiz_mini.png' });
    await p.evaluate(() => { document.querySelectorAll('.tale-ov,.uk-scrim').forEach((e) => e.remove()); GF.stack = []; GF.go('qgames'); }); await p.waitForTimeout(1000); ok(!(await tale(p)), '두 번째부터는 없음'); ok(errs.length === 0, '⑤ 오류 없음 ' + errs[0]); await ctx.close(); }
  for (const [scr, label] of [['ctrace', '따라 그리기'], ['csticker', '스티커']]) { const [ctx, p, errs] = await open('color'); const id = scr === 'ctrace' ? 't_house' : 's_home'; await p.evaluate(([s, i]) => { GF.stack = []; GF.go(s, { id: i }); }, [scr, id]); await p.waitForTimeout(1300); ok(await tale(p), '④ ' + label + ' 처음 열면 설명 컷'); if (scr === 'ctrace') await p.screenshot({ path: 'notes/snapshots/tut_color_trace.png' }); ok(errs.length === 0, '④ ' + label + ' 오류 없음 ' + errs[0]); await ctx.close(); }
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
