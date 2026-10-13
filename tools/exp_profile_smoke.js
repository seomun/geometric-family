// ⑪ 업적·칭호·프로필 카드(B10) 시험: node tools/exp_profile_smoke.js (로컬 모드) — 홈의 🏅 · 카드(칭호·진행) · 업적 18 · 달성하면 칭호 생김 · 칭호 고르기 저장 · 보상 없음
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:8765/games/expedition/index.html'); await p.waitForTimeout(1500);
  await p.evaluate(() => { const E = EXP.debug; E.reset(); E.month = 10; localStorage.removeItem('gfx:profile:v1'); E.S().flags.prologue = 1; E.save(); GF.stack = []; GF.go('xhome'); }); await p.waitForTimeout(900);
  ok(await p.evaluate(() => !!document.querySelector('[aria-label="profile"]')), '홈 왼쪽 위에 🏅 프로필 버튼');
  await p.evaluate(() => document.querySelector('[aria-label="profile"]').click()); await p.waitForTimeout(700);
  const a0 = await p.evaluate(() => ({ rows: document.querySelectorAll('.ex-pfbox .ex-bg').length, done: document.querySelectorAll('.ex-pfbox .ex-bg.can').length, card: document.querySelector('.ex-pcard').innerText.replace(/\s+/g, ' ') }));
  ok(a0.rows === 18, '업적 18개 · ' + a0.rows); ok(a0.done === 0 && /칭호는 업적을 달성하면/.test(a0.card), '처음엔 달성 0 · 칭호 안내 · ' + a0.card); await p.screenshot({ path: 'notes/snapshots/exp_profile_start.png' });
  const gems0 = await p.evaluate(() => EXP.debug.S().gems + '/' + EXP.debug.S().gold);
  await p.evaluate(() => { const E = EXP.debug, S = E.S(); S.cleared = 36; S.stars = { 1: 3, 2: 3 }; S.flags.dunN = 3; ['u_kid3', 'u_kid1', 'u_wind', 'u_swallow', 'u_dokkaebi', 'u_husband', 'u_grandma', 'u_tiger', 'u_ajumma'].forEach((id) => { S.units[id] = { lv: 21, skl: 1, awk: 0, promo: 0, gear: [0, 0, 0, 0] }; }); E.save(); GF.stack = []; GF.go('xprofile'); }); await p.waitForTimeout(700);
  const a1 = await p.evaluate(() => ({ titles: [...document.querySelectorAll('.ex-title')].map((e) => e.textContent), on: (document.querySelector('.ex-title.on') || {}).textContent, done: document.querySelectorAll('.ex-pfbox .ex-bg.can').length, card: document.querySelector('.ex-pcard small').textContent }));
  ok(a1.titles.includes('새내기 원정대') && a1.titles.includes('콩쥐 마을 친구') && a1.titles.includes('단련하는 도형'), '달성한 업적의 칭호가 생김 · ' + a1.titles.join('|')); ok(a1.done >= 5, '달성 업적 ' + a1.done + '개'); ok(a1.on && a1.card.includes(a1.on), '칭호 하나가 카드에 걸림 · ' + a1.card);
  await p.evaluate(() => [...document.querySelectorAll('.ex-title')].find((e) => /새내기/.test(e.textContent)).click()); await p.waitForTimeout(400);
  ok(await p.evaluate(() => /새내기 원정대/.test(document.querySelector('.ex-pcard small').textContent) && JSON.parse(localStorage.getItem('gfx:profile:v1')).title === '새내기 원정대'), '칭호를 고르면 카드에 걸리고 기기에 저장'); await p.screenshot({ path: 'notes/snapshots/exp_profile_cards.png' });
  ok(await p.evaluate((g) => EXP.debug.S().gems + '/' + EXP.debug.S().gold === g, gems0), '업적은 보상 없음(반짝석·금화 그대로)');
  ok(errs.length === 0, '오류 없음 ' + (errs[0] || '')); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
