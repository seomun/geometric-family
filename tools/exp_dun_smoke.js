// ⑪ 요일 던전·방치 정찰(B3) 화면 시험: node tools/exp_dun_smoke.js (로컬 모드)
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:8765/games/expedition/index.html'); await p.waitForTimeout(1500);
  await p.evaluate(() => { const E = EXP.debug; E.reset(); const S = E.S(); S.cleared = 5; S.speed = 3; Object.keys(S.units).forEach((k) => { S.units[k].lv = 20; }); S.idleTs = Date.now() - 5 * 3600000; E.save(); GF.stack = []; GF.go('xhome'); });
  await p.waitForTimeout(700); ok(await p.evaluate(() => /정찰 보상/.test(document.querySelector('.ex-btns').textContent) && /요일 던전/.test(document.querySelector('.ex-btns').textContent)), '홈에 요일 던전·정찰 보상 버튼');
  const g0 = await p.evaluate(() => EXP.debug.S().gold); await p.evaluate(() => { [...document.querySelectorAll('.ex-btns .uk-btn')].find((x) => /정찰 보상/.test(x.textContent)).click(); }); await p.waitForTimeout(700);
  const g1 = await p.evaluate(() => EXP.debug.S().gold); ok(g1 > g0, `정찰 보상 5시간치 받음 🪙 ${g0}→${g1}`); await p.evaluate(() => { [...document.querySelectorAll('.ex-btns .uk-btn')].find((x) => /정찰 보상/.test(x.textContent)).click(); }); await p.waitForTimeout(500); ok((await p.evaluate(() => EXP.debug.S().gold)) === g1, '바로 또 눌러도 안 늘어남');
  await p.evaluate(() => { GF.stack = []; GF.go('xhome'); GF.go('xdun'); }); await p.waitForTimeout(800); await p.screenshot({ path: 'notes/snapshots/exp_dun.png' });
  const t = await p.evaluate(() => document.querySelector('.ex-shop').textContent); ok(/3\/3번 남음/.test(t), '오늘 3/3번 남음'); ok((await p.evaluate(() => document.querySelectorAll('.ex-prod').length)) === 3, '난이도 3개');
  const gold0 = await p.evaluate(() => EXP.debug.S().gold), dup0 = await p.evaluate(() => JSON.stringify(EXP.debug.S().dups));
  await p.evaluate(() => { document.querySelectorAll('.ex-prod .uk-btn')[0].click(); }); await p.waitForTimeout(600);
  if (await p.evaluate(() => !!document.querySelector('.ex-dexgrid .ex-card'))) await p.evaluate(() => { document.querySelector('.uk-sheet .ex-dexgrid .ex-card').click(); });
  let won = false; for (let i = 0; i < 80 && !won; i++) { await p.waitForTimeout(1000); won = await p.evaluate(() => /승리/.test((document.querySelector('.uk-sheet') || {}).textContent || '')); }
  ok(won, '던전 전투 승리 화면'); await p.screenshot({ path: 'notes/snapshots/exp_dun_win.png' });
  const after = await p.evaluate(() => ({ gold: EXP.debug.S().gold, dups: JSON.stringify(EXP.debug.S().dups), n: EXP.debug.S().dun && EXP.debug.S().dun.n })); ok(after.gold > gold0 || after.dups !== dup0, `보상 지급(금화 ${gold0}→${after.gold} · 조각 ${after.dups})`); ok(after.n === 1, '오늘 횟수 1 사용');
  ok(errs.length === 0, '오류 없음 ' + errs[0]); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
