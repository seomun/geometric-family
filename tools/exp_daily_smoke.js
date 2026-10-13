// ⑪ 일일 임무 3 + 주간 상자(B22) 시험: node tools/exp_daily_smoke.js (로컬 모드) — 오늘의 임무 3개 · 한 일이 센다 · 받기는 한 번만 · 주 상자는 4일 · 쉬어도 괜찮다는 안내(벌점 없음)
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:8765/games/expedition/index.html'); await p.waitForTimeout(1500);
  await p.evaluate(() => { const E = EXP.debug; E.reset(); E.S().flags.prologue = 1; E.save(); GF.stack = []; GF.go('xbegin'); }); await p.waitForTimeout(900);
  let o = await p.evaluate(() => ({ rows: document.querySelectorAll('.ex-bg.dq').length, can: document.querySelectorAll('.ex-bg.dq.can').length, wk: !!document.querySelector('.ex-wk'), txt: document.querySelector('.ex-beg').innerText.replace(/\s+/g, ' ') }));
  ok(o.rows === 3 && o.can === 0 && o.wk, '오늘의 임무 3개 · 아직 받을 것 없음 · 주간 상자 줄'); ok(/쉬는 날이 있어도 괜찮아요/.test(o.txt), '쉬어도 괜찮다는 안내'); await p.screenshot({ path: 'notes/snapshots/b22_daily_start.png' });
  // 한 일을 센다: 원정 승리(stage) · 레벨업 · 정찰
  await p.evaluate(() => { const E = EXP.debug, S = E.S(); S.flags.dqc = { date: new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10), c: { stage: 1 } }; E.save(); GF.replace('xbegin'); }); await p.waitForTimeout(700);
  ok(await p.evaluate(() => document.querySelectorAll('.ex-bg.dq.can').length === 1), '원정 승리 1번 → 첫 임무 받기 가능');
  const g0 = await p.evaluate(() => EXP.debug.S().gold); await p.evaluate(() => document.querySelector('.ex-bg.dq.can .uk-btn').click()); await p.waitForTimeout(1000);
  ok(await p.evaluate((g) => EXP.debug.S().gold === g + 150 && document.querySelectorAll('.ex-bg.dq.got').length === 1 && document.querySelectorAll('.ex-bg.dq.can').length === 0, g0), '받으면 금화 +150 · 한 번만(받은 줄은 흐려짐)');
  await p.evaluate(() => { const S = EXP.debug.S(); S.flags.dqc.c = { stage: 1, levelup: 2, idle: 1 }; EXP.debug.save(); GF.replace('xbegin'); }); await p.waitForTimeout(700);
  for (let i = 0; i < 2; i++) { await p.evaluate(() => document.querySelector('.ex-bg.dq.can .uk-btn').click()); await p.waitForTimeout(900); }
  ok(await p.evaluate(() => document.querySelectorAll('.ex-bg.dq.got').length === 3 && /1\/4/.test(document.querySelector('.ex-wk').innerText)), '3개를 다 받으면 이번 주 1/4일'); await p.screenshot({ path: 'notes/snapshots/b22_daily_done.png' });
  ok(await p.evaluate(() => !document.querySelector('.ex-wk.can')), '4일 전엔 상자 안 열림');
  // 같은 날을 또 받아도 주 일수는 안 늘어남 · 다른 3일을 채움 → 상자
  await p.evaluate(() => { const S = EXP.debug.S(), wk = S.flags.wk; wk.days.push('2026-01-01', '2026-01-02', '2026-01-03'); EXP.debug.save(); GF.replace('xbegin'); }); await p.waitForTimeout(700);
  ok(await p.evaluate(() => !!document.querySelector('.ex-wk.can')), '4일을 채우면 상자가 열림(쉬는 날 3일은 괜찮음)');
  const w0 = await p.evaluate(() => [EXP.debug.S().gems, EXP.debug.S().gold]); await p.evaluate(() => document.querySelector('.ex-wk .uk-btn').click()); await p.waitForTimeout(1000);
  ok(await p.evaluate((w) => EXP.debug.S().gems === w[0] + 20 && EXP.debug.S().gold === w[1] + 1200 && !document.querySelector('.ex-wk .uk-btn') && /열었어요/.test(document.querySelector('.ex-wk').innerText), w0), '상자: 💎+20 · 🪙+1200 · 한 번만'); await p.screenshot({ path: 'notes/snapshots/b22_week_box.png' });
  ok(errs.length === 0, '오류 없음 ' + (errs[0] || '')); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
