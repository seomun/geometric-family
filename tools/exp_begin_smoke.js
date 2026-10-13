// ⑪ 초보자 미션 30·출석 7일(B11) 시험: node tools/exp_begin_smoke.js (로컬 모드) — 홈 버튼·배지 · 출석 도장 하루 한 번 · 미션 진행·받기(한 번만) · 카운터(던전·정찰) · 서버 판정과 같은 식
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:8765/games/expedition/index.html'); await p.waitForTimeout(1500);
  await p.evaluate(() => { const E = EXP.debug; E.reset(); E.S().flags.prologue = 1; E.S().flags.tips = E.S().flags.tips || {}; E.save(); GF.stack = []; GF.go('xhome'); }); await p.waitForTimeout(900);
  ok(await p.evaluate(() => /초보자 미션/.test(document.querySelector('.ex-btns').textContent)), '홈에 초보자 미션 버튼');
  ok(await p.evaluate(() => { const e = document.querySelector('.ex-bdg'); return !!e && +e.textContent === 1; }), '처음엔 배지 1(오늘 출석)');
  await p.screenshot({ path: 'notes/snapshots/exp_begin_home.png' });
  await p.evaluate(() => { [...document.querySelectorAll('.ex-btns .uk-btn')].find((x) => /초보자 미션/.test(x.textContent)).click(); }); await p.waitForTimeout(800);
  const m0 = await p.evaluate(() => ({ att: document.querySelectorAll('.ex-ad').length, can: document.querySelectorAll('.ex-ad.can').length, ms: document.querySelectorAll('.ex-bg').length, claimable: document.querySelectorAll('.ex-bg.can').length, txt: document.querySelector('.ex-beg').innerText }));
  ok(m0.att === 7 && m0.can === 1, '출석 7칸 · 오늘 칸 강조'); ok(m0.ms === 30, '미션 30개 · ' + m0.ms); ok(m0.claimable === 0, '새로 시작하면 받을 미션 없음'); ok(/오늘 출석 받기/.test(m0.txt), '출석 받기 버튼');
  await p.screenshot({ path: 'notes/snapshots/exp_begin_start.png' });
  const g0 = await p.evaluate(() => EXP.debug.S().gems + '/' + EXP.debug.S().gold);
  await p.evaluate(() => [...document.querySelectorAll('.ex-beg .uk-btn')].find((x) => /오늘 출석 받기/.test(x.textContent)).click()); await p.waitForTimeout(900);
  const g1 = await p.evaluate(() => EXP.debug.S().gems + '/' + EXP.debug.S().gold); ok(g1 !== g0 && (await p.evaluate(() => EXP.debug.S().gold)) === +g0.split('/')[1] + 300, '1일째 출석: 금화 +300 · ' + g0 + ' → ' + g1);
  ok(await p.evaluate(() => !/오늘 출석 받기/.test(document.querySelector('.ex-beg').innerText) && document.querySelectorAll('.ex-ad.done').length === 1), '같은 날 다시 못 받음 · 1일째 완료 표시');
  // 단계를 깨면 미션이 채워지고, 받기는 한 번만
  await p.evaluate(() => { const E = EXP.debug, S = E.S(); S.cleared = 3; E.save(); GF.stack = []; GF.go('xbegin'); }); await p.waitForTimeout(800);
  const m1 = await p.evaluate(() => [...document.querySelectorAll('.ex-bg.can')].map((e) => e.querySelector('b').textContent)); ok(m1.length === 2 && m1.some((t) => /첫 전투/.test(t)) && m1.some((t) => /3단계/.test(t)), '3단계까지 깨면 받을 미션 2개 · ' + m1.join('|'));
  ok(await p.evaluate(() => { const f = document.querySelector('.ex-bg.can'); return f === document.querySelector('.ex-bg'); }), '받을 수 있는 미션이 위로');
  const g2 = await p.evaluate(() => EXP.debug.S().gems); await p.evaluate(() => document.querySelector('.ex-bg.can .uk-btn').click()); await p.waitForTimeout(1000);
  const g3 = await p.evaluate(() => EXP.debug.S().gems); ok(g3 === g2 + 10, '첫 전투 미션: 반짝석 +10');
  ok(await p.evaluate(() => (EXP.debug.S().flags.beg || []).join() === 'b01' && document.querySelectorAll('.ex-bg').length === 29), '받은 미션은 목록에서 빠짐(29개) · 기록 b01');
  await p.evaluate(() => { const S = EXP.debug.S(); S.flags.beg = ['b01']; EXP.debug.save(); }); // 같은 미션을 다시 받으려 해도 지급 없음(함수 직접 호출은 없으니 화면 재진입으로 확인)
  await p.evaluate(() => { GF.stack = []; GF.go('xbegin'); }); await p.waitForTimeout(700); ok((await p.evaluate(() => EXP.debug.S().gems)) === g3, '다시 들어와도 반짝석 그대로');
  await p.screenshot({ path: 'notes/snapshots/exp_begin_claim.png' });
  // 카운터: 정찰 수령 · 요일 던전은 플래그로 올라감, 도감 문턱도 계산에 들어감
  const calc = await p.evaluate(() => { const E = EXP.debug, S = E.S(); S.flags.idleN = 1; S.flags.dunN = 5; S.flags.dex = [5]; S.pulls = 10; E.save(); const r = ExpStage.beginner(window.EXP_D || EXP.debug.D(), { cleared: S.cleared, units: S.units, pulls: S.pulls, dun: S.flags.dunN, idle: S.flags.idleN, dex: S.flags.dex.length }); return r.filter((m) => m.done).map((m) => m.id).join(','); });
  ok(/b07/.test(calc) && /b08/.test(calc) && /b24/.test(calc) && /b20/.test(calc) && /b17/.test(calc), '던전 5·정찰 1·도감 1·모집 10 이 미션 판정에 들어감 · ' + calc);
  // 7일 출석을 다 모으면 끝 문구
  await p.evaluate(() => { const S = EXP.debug.S(); S.flags.att = { n: 7, last: '2000-01-01' }; EXP.debug.save(); GF.stack = []; GF.go('xbegin'); }); await p.waitForTimeout(700);
  ok(await p.evaluate(() => /출석 7일을 다 모았어요/.test(document.querySelector('.ex-beg').innerText) && !/오늘 출석 받기/.test(document.querySelector('.ex-beg').innerText)), '출석 7일 완료: 더는 받기 버튼 없음');
  ok(errs.length === 0, '오류 없음 ' + (errs[0] || '')); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
