// ⑪ 동료 도감·수집 보상(B5) 시험: node tools/exp_dex_smoke.js (로컬 모드)
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:8765/games/expedition/index.html'); await p.waitForTimeout(1500);
  await p.evaluate(() => { const E = EXP.debug; E.reset(); const S = E.S(); ['u_kid3', 'u_kid1', 'u_wind', 'u_swallow', 'u_dokkaebi'].forEach((id) => { S.units[id] = { lv: 3, skl: 2, awk: 1, promo: 0, gear: [0, 0, 0, 0] }; }); E.save(); GF.stack = []; GF.go('xhome'); }); await p.waitForTimeout(600);
  ok(await p.evaluate(() => /동료 도감/.test(document.querySelector('.ex-btns').textContent)), '홈에 동료 도감 버튼');
  await p.evaluate(() => { [...document.querySelectorAll('.ex-btns .uk-btn')].find((x) => /동료 도감/.test(x.textContent)).click(); }); await p.waitForTimeout(800); await p.screenshot({ path: 'notes/snapshots/exp_dex.png' });
  ok(await p.evaluate(() => document.querySelectorAll('.ex-dexgrid .ex-card').length === 24), '24명 모두 카드로(없는 친구는 ???)'); ok(await p.evaluate(() => document.querySelectorAll('.ex-dexgrid .ex-card.dim').length === 14), '아직 못 만난 친구 14명은 흐리게');
  ok(await p.evaluate(() => /10명/.test(document.querySelector('.ex-dexms').textContent) && document.querySelectorAll('.ex-dm.can').length === 2), '수집 보상 문턱: 10명을 모아 5명·10명 둘 다 받을 수 있음');
  const g0 = await p.evaluate(() => EXP.debug.S().gems); await p.evaluate(() => { document.querySelector('.ex-dm.can .uk-btn').click(); }); await p.waitForTimeout(1100); const g1 = await p.evaluate(() => EXP.debug.S().gems); ok(g1 === g0 + 100, `5명 보상 💎 ${g0}→${g1}`);
  ok(await p.evaluate(() => document.querySelectorAll('.ex-dm.can').length === 1 && document.querySelectorAll('.ex-dm.done').length === 1), '받은 문턱은 「받음」, 나머지는 그대로'); await p.evaluate(() => { EXP.debug.S().units; }); 
  await p.evaluate(() => { const own = [...document.querySelectorAll('.ex-dexgrid .ex-card:not(.dim)')]; own.find((c) => /바람 친구/.test(c.textContent)).click(); }); await p.waitForTimeout(500); await p.screenshot({ path: 'notes/snapshots/exp_dex_info.png' });
  ok(await p.evaluate(() => /후— 불던 장난꾸러기/.test(document.querySelector('.ex-tale').textContent)), '도감 상세: 옛이야기 한 줄'); await p.evaluate(() => { document.querySelector('.uk-sheet .uk-btn').click(); });
  await p.evaluate(() => { const dim = document.querySelectorAll('.ex-dexgrid .ex-card.dim'); dim[dim.length - 1].click(); }); await p.waitForTimeout(400); ok(await p.evaluate(() => /아직 만나지 못했어요/.test(document.querySelector('.ex-tale').textContent)), '못 만난 친구는 얻는 방법만');
  await p.evaluate(() => { document.querySelectorAll('.uk-scrim').forEach((e) => e.remove()); EXP.debug.S().cleared = 7; GF.stack = []; GF.go('xhome'); GF.go('xdex'); }); await p.waitForTimeout(700);
  await p.evaluate(() => { [...document.querySelectorAll('.uk-btn')].find((x) => /전리품 코드/.test(x.textContent)).click(); }); await p.waitForTimeout(600); await p.screenshot({ path: 'notes/snapshots/exp_loot.png' });
  const loot = await p.evaluate(() => ({ rows: document.querySelectorAll('.ex-prod').length, open: document.querySelectorAll('.ex-prod:not(.dim)').length, codes: [...document.querySelectorAll('.ex-prod:not(.dim) small')].map((x) => (x.textContent.match(/[0-9A-Z]{6}$/) || [''])[0]) })); ok(loot.rows === 12 && loot.open === 2 && loot.codes.every((c) => c.length === 6), '전리품 화면: 12칸 중 7단계까지 2개 코드 공개 ' + JSON.stringify(loot.codes));
  ok(errs.length === 0, '오류 없음 ' + errs[0]); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
