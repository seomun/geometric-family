// ⑪ 육성 깊이(B2) 화면 시험: node tools/exp_grow_smoke.js — 편성 화면 「키우기」 시트에서 스킬·각성·승급·장비를 올리고 전투력·비용이 맞는지
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:8765/games/expedition/index.html'); await p.waitForTimeout(1500);
  await p.evaluate(() => { const E = EXP.debug; E.reset(); const S = E.S(); S.gold = 6000; S.dups.u_nemo_dad = 120; S.units.u_nemo_dad.lv = 10; E.save(); GF.stack = []; GF.go('xhome'); GF.go('xparty'); });
  await p.waitForTimeout(800); const p0 = await p.evaluate(() => EXP.debug.S() && Math.round(window.__k || 0));
  await p.evaluate(() => { document.querySelectorAll('.ex-card')[0].click(); }); await p.waitForTimeout(300); ok(await p.evaluate(() => [...document.querySelectorAll('.ex-info .uk-btn')].some((b) => /키우기/.test(b.textContent))), '편성 화면에 「키우기」 버튼');
  await p.evaluate(() => { [...document.querySelectorAll('.ex-info .uk-btn')].find((b) => /키우기/.test(b.textContent)).click(); }); await p.waitForTimeout(500); await p.screenshot({ path: 'notes/snapshots/exp_grow_sheet.png' });
  ok(await p.evaluate(() => document.querySelectorAll('.ex-grow-r').length === 7), '육성 7줄(스킬·각성·승급·장비 4)');
  const before = await p.evaluate(() => { const S = EXP.debug.S(); return { gold: S.gold, dups: S.dups.u_nemo_dad, st: JSON.parse(JSON.stringify(S.units.u_nemo_dad)) }; });
  const clickRow = async (i) => { await p.evaluate((i) => { document.querySelectorAll('.ex-grow-r .uk-btn')[i].click(); }, i); await p.waitForTimeout(350); };
  await clickRow(0); await clickRow(1); await clickRow(2); await clickRow(3); await clickRow(4); await clickRow(5); await clickRow(6);
  const after = await p.evaluate(() => { const S = EXP.debug.S(), D = EXP.debug.D(); return { gold: S.gold, dups: S.dups.u_nemo_dad, st: JSON.parse(JSON.stringify(S.units.u_nemo_dad)), G: D.bal.grow }; });
  const G = after.G; ok(after.st.skl === 2 && after.st.awk === 1 && after.st.promo === 1 && after.st.gear.every((v) => v === 1), '스킬 2 · 각성 1 · 승급 1 · 장비 모두 +1 ' + JSON.stringify(after.st));
  const expGold = before.gold - G.skillCost[0] - 4 * Math.round(G.gearBase), expDups = before.dups - G.awkCost[0] - G.promoCost['4']; ok(after.gold === expGold && after.dups === expDups, `비용 정확: 금화 ${before.gold}→${after.gold} · 조각 ${before.dups}→${after.dups}`);
  const k = await p.evaluate(() => { const E = EXP.debug, S = E.S(); return 0; }); void k;
  const pw = await p.evaluate(() => { const S = EXP.debug.S(), D = EXP.debug.D(); const f = (st) => (1 + D.bal.lvMul * (st.lv - 1)); return { base: f(S.units.u_nemo_dad), now: EXP.debug.power(['u_nemo_dad']) / 100 }; }); ok(pw.now > pw.base * 1.2 * 1.05, `전투력 반영(승급 ×1.2·각성·장비) ${pw.base.toFixed(2)}→${pw.now.toFixed(2)}`);
  await clickRow(1); ok(await p.evaluate(() => EXP.debug.S().units.u_nemo_dad.awk === 2), '각성 2단계'); // 조각 부족 시 거절
  await p.evaluate(() => { EXP.debug.S().dups.u_nemo_dad = 0; }); const awk = await p.evaluate(() => EXP.debug.S().units.u_nemo_dad.awk); await clickRow(1); ok(await p.evaluate((a) => EXP.debug.S().units.u_nemo_dad.awk === a, awk), '조각이 없으면 각성 안 됨');
  const win = await p.evaluate(() => EXP.debug.fastBattle(2)); ok(typeof win.win === 'boolean', '육성한 파티로 전투 재현 가능');
  ok(errs.length === 0, '오류 없음 ' + errs[0]); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
