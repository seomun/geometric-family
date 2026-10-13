// ⑪ 파티 편성 프리셋 3칸·자동 편성·적 속성 미리보기(B12) 시험: node tools/exp_party_smoke.js (로컬 모드)
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:8765/games/expedition/index.html'); await p.waitForTimeout(1500);
  await p.evaluate(() => { const E = EXP.debug; E.reset(); const S = E.S(); S.flags.prologue = 1; ['u_kid3', 'u_kid1', 'u_wind', 'u_swallow', 'u_dokkaebi', 'u_husband'].forEach((id) => { S.units[id] = { lv: 4, skl: 1, awk: 0, promo: 0, gear: [0, 0, 0, 0] }; }); S.cleared = 5; E.save(); localStorage.removeItem('gfx:presets:v1'); GF.stack = []; GF.go('xparty'); }); await p.waitForTimeout(900);
  const pv = await p.evaluate(() => ({ txt: document.querySelector('.ex-prev').innerText, n: document.querySelectorAll('.ex-pv').length, tools: document.querySelectorAll('.ex-ptools .uk-btn').length }));
  ok(/다음 원정 6\./.test(pv.txt) && pv.n >= 1, '적 속성 미리보기: 다음 원정 + 속성별 적 수·유리한 속성 · ' + pv.txt.replace(/\s+/g, ' ')); ok(pv.tools === 4, '편성 3칸 + 자동 편성 버튼'); await p.screenshot({ path: 'notes/snapshots/exp_party_b12.png' });
  const base = await p.evaluate(() => EXP.debug.S().party.join());
  await p.evaluate(() => document.querySelector('.ex-ptools .uk-btn[data-preset="0"]').click()); await p.waitForTimeout(300);
  ok(await p.evaluate(() => JSON.parse(localStorage.getItem('gfx:presets:v1'))[0].join() === EXP.debug.S().party.join()), '빈 칸을 누르면 지금 편성을 저장');
  await p.evaluate(() => document.querySelector('.ex-ptools .uk-btn[data-auto]').click()); await p.waitForTimeout(400);
  const auto = await p.evaluate(() => ({ party: EXP.debug.S().party, ok: new Set(EXP.debug.S().party).size === 5 && EXP.debug.S().party.every((id) => EXP.debug.S().units[id]) }));
  ok(auto.ok, '자동 편성: 가진 친구 5명, 겹침 없음 · ' + auto.party.join());
  ok(await p.evaluate(() => { const S = EXP.debug.S(), st = D2().stages[S.cleared], best = ExpStage.autoParty(D2(), st, S.units); function D2() { return EXP.debug.D(); } return best.join() === S.party.join(); }), '자동 편성은 코어 추천(autoParty)과 같음');
  await p.evaluate(() => document.querySelector('.ex-ptools .uk-btn[data-preset="0"]').click()); await p.waitForTimeout(400);
  ok(await p.evaluate((b) => EXP.debug.S().party.join() === b, base), '저장한 편성 1번을 누르면 원래 편성으로 돌아감');
  await p.evaluate(() => document.querySelector('.ex-ptools .uk-btn[data-preset="1"]').click()); await p.waitForTimeout(200);
  ok(await p.evaluate(() => { const P = JSON.parse(localStorage.getItem('gfx:presets:v1')); return !!P[0] && !!P[1] && P[2] === null; }), '두 칸 저장 · 셋째 칸은 비어 있음');
  // 포섭 보스(6단계=바람 친구 보스, 돌보기에 약함 → 받치기?) 단계에서 말 걸 수 있는 속성이 들어감
  const rec = await p.evaluate(() => { const D = EXP.debug.D(), st = D.stages.find((s) => s.recruit), S = EXP.debug.S(); const party = ExpStage.autoParty(D, st, S.units), bossEl = (st.enemies.find((e) => e.lock) || {}).el; return party.some((id) => ExpBattle.BEATS[D.units.find((u) => u.id === id).el] === bossEl); }); ok(rec, '포섭 보스 단계의 자동 편성엔 말을 걸 수 있는 속성 친구가 들어감');
  await p.screenshot({ path: 'notes/snapshots/exp_party_b12_2.png' });
  ok(errs.length === 0, '오류 없음 ' + (errs[0] || '')); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
