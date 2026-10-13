// ⑪ 슬라이스 점검: node tools/exp_smoke.js — 결정론 · 단계 1~6 · 합류·포섭 · 뽑기·천장·확률 · 오류 0
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 } }), p = await ctx.newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:8765/games/expedition/index.html'); await p.waitForTimeout(1800);
  const shot = async (n) => { await p.waitForTimeout(700); await p.screenshot({ path: `notes/snapshots/exp_${n}.png` }); };
  await shot('1_home');
  const d = await p.evaluate(() => { const E = EXP.debug, a = E.fastBattle(1), b = E.fastBattle(1); return { a, b, same: a.hash === b.hash, n: E.D().units.length, st: E.D().stages.length }; });
  ok(d.same && d.a.win, '결정론: 같은 시드·같은 팀 → 같은 로그 해시(' + d.a.hash + ') · 1단계 승리'); ok(d.n === 27 && d.st === 72, '데이터: 동료 27(시작 5·합류 5·포섭 6·모집 11) · 단계 72(6나라)');
  // 레벨 정책: 단계 1~5 를 시작 파티(레벨 1)로도 깰 수 있는지, 6단계는 레벨 올리면 가능한지
  const w = await p.evaluate(() => { const E = EXP.debug, out = []; for (let s = 1; s <= 6; s++) out.push(E.fastBattle(s).win); return out; }); console.log('  시작 파티 단계별 승패', JSON.stringify(w)); ok(w[0] && w[1], '1·2단계는 처음 파티로 승리');
  // 화면 흐름: 1단계 전투를 UI 로
  await p.evaluate(() => { EXP.debug.reset(); GF.stack = []; GF.go('xmap'); }); await shot('2_map');
  await p.evaluate(() => { GF.go('xbattle', { stage: 1 }); }); await p.waitForTimeout(1200); await shot('3_battle');
  await p.evaluate(() => { EXP.debug.S().speed = 3; }); await p.waitForTimeout(9000); await shot('4_result');
  ok(await p.evaluate(() => EXP.debug.S().cleared >= 1), '전투 UI: 1단계 클리어가 저장됨');
  await p.evaluate(() => { document.querySelectorAll('.uk-scrim').forEach((e) => e.remove()); GF.stack = []; GF.go('xparty'); }); await shot('5_party');
  await p.evaluate(() => { GF.stack = []; GF.go('xgacha'); }); await shot('6_gacha');
  const g = await p.evaluate(() => { const E = EXP.debug; E.gems(5000); const r1 = E.pull(10), r2 = E.pull(1); E.pity({ since5: 79, guard: 0 }); const r3 = E.pull(1); return { n1: r1.length, ok3: r3[0].grade === 5, pulls: E.S().pulls, gems: E.S().gems }; });
  ok(g.n1 === 10 && g.ok3, '뽑기: 10연·1회 · 80회째 ★5 확정(천장)'); ok(g.gems === 5000 - 1425 - 150 - 150, '반짝석 차감 정확(10회 1,425 · 1회 150)');
  await p.evaluate(() => { document.querySelectorAll('.uk-scrim').forEach((e) => e.remove()); GF.stack = []; GF.go('xgacha'); }); await p.waitForTimeout(500); await p.evaluate(() => { document.querySelector('.ex-odds').click(); }); await shot('7_odds');
  const sum = await p.evaluate(() => { const g = EXP.debug.D().gacha.rates; return Math.round((g.five + g.four + g.three) * 1000) / 1000; }); ok(sum === 1, '확률 합 100%');
  // 이야기 합류(3단계) · 포섭(6단계) — 코어와 상태로 확인
  const j = await p.evaluate(() => { const E = EXP.debug, S = E.S(); S.cleared = 2; S.units.u_kid3 = undefined; delete S.units.u_kid3; return !S.units.u_kid3; }); ok(j, '합류 전 상태 준비');
  // 이야기 합류(3단계) · 포섭(6단계): 이야기 컷을 켜고(?story=1) 끝까지
  await p.goto('http://localhost:8765/games/expedition/index.html?story=1'); await p.waitForTimeout(1500); await p.evaluate(() => { localStorage.clear(); });
  await p.reload(); await p.waitForTimeout(1500); await shot('8_prologue');
  await p.evaluate(() => { const n = document.querySelector('.tale-ov .nextbtn'); n && n.click(); }); await p.waitForTimeout(900); const pro = await p.evaluate(() => !!document.querySelector('.tale-ov .cut-mini')); ok(pro, '프롤로그 컷에 상성 3각 미니 판'); await p.evaluate(() => document.querySelectorAll('.tale-ov').forEach((e) => e.remove()));
  await p.evaluate(() => { const E = EXP.debug, S = E.S(); S.cleared = 2; Object.keys(S.units).forEach((k) => { S.units[k].lv = 3; }); E.save(); GF.stack = []; GF.go('xbattle', { stage: 3 }); EXP.debug.S().speed = 3; });
  await p.waitForFunction(() => !!document.querySelector('.tale-ov'), null, { timeout: 40000 }).catch(() => {}); await shot('9_join');
  await p.evaluate(() => { const k = document.querySelector('.tale-skip'); k && k.click(); }); await p.waitForTimeout(1800);
  ok(await p.evaluate(() => !!EXP.debug.S().units.u_kid3 && EXP.debug.S().cleared >= 3), '이야기 합류: 3단계 클리어 뒤 세찌 합류');
  await p.evaluate(() => { document.querySelectorAll('.uk-scrim,.tale-ov').forEach((e) => e.remove()); const E = EXP.debug, S = E.S(); S.cleared = 5; Object.keys(S.units).forEach((k) => { S.units[k].lv = 8; }); S.flags.stage6pre = 1; E.save(); GF.stack = []; GF.go('xbattle', { stage: 6 }); EXP.debug.S().speed = 3; });
  await p.waitForFunction(() => !!document.querySelector('.ex-pbtn .uk-btn'), null, { timeout: 40000 }).catch(() => {}); await shot('10_persuade');
  ok(await p.evaluate(() => !!document.querySelector('.ex-pbtn .uk-btn')), '포섭: 보스 체력 30% 이하에서 말 걸기 버튼');
  await p.evaluate(() => { const bs = [...document.querySelectorAll('.ex-pbtn .uk-btn')].find((b) => /말 걸기/.test(b.textContent)); bs && bs.click(); }); await p.waitForTimeout(600); await shot('11_recruit_cut');
  await p.evaluate(() => { const k = document.querySelector('.tale-skip'); k && k.click(); }); await p.waitForTimeout(1500); await shot('12_recruit_result');
  ok(await p.evaluate(() => !!EXP.debug.S().units.u_wind && EXP.debug.S().cleared >= 6), '포섭: 바람 친구 합류 · 6단계 클리어');
  ok(errs.length === 0, '오류 없음 ' + errs[0]); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
