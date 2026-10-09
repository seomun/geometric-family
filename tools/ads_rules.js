// 광고 규칙(D19) 점검: node tools/ads_rules.js — ?ads=1 JS 테스트 광고로 전면 상한·배너 화면·유아 차단·웹판 no-op 을 단언한다.
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const B = 'http://localhost:8765/games/';
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const open = async (url) => { const c = await b.newContext({ viewport: { width: 390, height: 780 } }), p = await c.newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message)); await p.addInitScript(() => { window.__noResume = true; }); await p.goto(B + url); await p.waitForTimeout(1300); return [c, p, errs]; };
  /* 1) 웹판/자동 시험(?ads 없음): 전부 no-op */
  let [c, p, errs] = await open('merge/index.html');
  ok(await p.evaluate(() => GF.ads.live() === false && !document.getElementById('gf-adbanner') && GF.ads.available('interstitial') === false && GF.ads.available('rewarded') === false), '웹판(네이티브·?ads 없음): 광고 live=false · 배너 없음 · 전면/보상형 불가');
  await c.close();
  /* 2) 성인 앱 테스트 모드 */
  [c, p, errs] = await open('merge/index.html?ads=1');
  ok(await p.evaluate(() => GF.ads.live() === true), '?ads=1: live');
  await p.evaluate(() => { GF.stack = []; GF.go('mhome'); }); await p.waitForTimeout(300);
  ok(await p.evaluate(() => { const d = document.getElementById('gf-adbanner'); return !!d && d.style.display === 'block'; }), '성인: 홈 하단 배너 켜짐');
  await p.evaluate(() => GF.go('mlevels')); await p.waitForTimeout(300); ok(await p.evaluate(() => document.getElementById('gf-adbanner').style.display === 'block'), '성인: 이야기 지도(레벨 목록)에 배너');
  await p.evaluate(() => { MERGE.unlockAll = true; GF.go('mplay', { n: 1 }); }); await p.waitForTimeout(500); ok(await p.evaluate(() => document.getElementById('gf-adbanner').style.display === 'none'), '성인: 판 화면에는 배너 없음');
  await p.evaluate(() => { GF.stack = []; GF.go('mhome'); GF.go('mhouse'); }); await p.waitForTimeout(300); ok(await p.evaluate(() => document.getElementById('gf-adbanner').style.display === 'none'), '성인: 집 화면에는 배너 없음');
  // 전면 규칙
  const rule = (setup) => p.evaluate((s) => { const A = GF.ads; A._t0 = Date.now() - 400000; A._ctx = { kind: null, story: false }; localStorage.setItem('gf:ads:daily', JSON.stringify({ d: (() => { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); })(), r: 0, i: 0 })); localStorage.setItem('gf:ads:state', JSON.stringify({ plays: 10, lastPlays: 0, lastAt: 0 })); eval(s); return A._interOk(); }, setup);
  ok(await rule('0') === true, '전면: 기본 조건 통과(10판째·3분 지남)');
  ok(await rule("localStorage.setItem('gf:ads:state', JSON.stringify({ plays: 5, lastPlays: 0, lastAt: 0 }))") === false, '전면: 처음 5판 금지');
  ok(await rule('GF.ads._t0 = Date.now() - 60000') === false, '전면: 앱을 연 뒤 3분 금지');
  ok(await rule("localStorage.setItem('gf:ads:state', JSON.stringify({ plays: 10, lastPlays: 8, lastAt: 0 }))") === false, '전면: 3판에 1회(직전 광고 후 2판) 금지');
  ok(await rule("localStorage.setItem('gf:ads:state', JSON.stringify({ plays: 10, lastPlays: 7, lastAt: Date.now() - 100000 }))") === false, '전면: 직전 광고와 2분 30초 미만 금지');
  ok(await rule("localStorage.setItem('gf:ads:state', JSON.stringify({ plays: 10, lastPlays: 7, lastAt: Date.now() - 160000 }))") === true, '전면: 3판·2분 40초 지나면 허용');
  ok(await rule("localStorage.setItem('gf:ads:daily', JSON.stringify({ d: (() => { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); })(), r: 0, i: 8 }))") === false, '전면: 하루 8회 상한');
  ok(await rule("GF.ads._ctx = { kind: 'daily', story: false }") === false, '전면: 오늘의 한 판 직후 금지');
  ok(await rule("GF.ads._ctx = { kind: 'season', story: false }") === false, '전면: 시즌 직후 금지');
  ok(await rule("GF.ads._ctx = { kind: null, story: true }") === false, '전면: 사연 컷 직후 금지');
  // 결과 닫기 → 전면 → 이어짐
  const flow = await p.evaluate(() => new Promise((res) => { const A = GF.ads; A._t0 = Date.now() - 400000; A._ctx = { kind: null, story: false }; localStorage.setItem('gf:ads:state', JSON.stringify({ plays: 10, lastPlays: 0, lastAt: 0 })); localStorage.setItem('gf:ads:daily', '{}'); let next = 0; const sc = UK.result({ title: 'ok', stars: 3, parent: document.getElementById('safe'), onNext: () => { next++; }, onHome: () => {} }); const nb = [...sc.querySelectorAll('.acts .uk-btn')].find((x) => /다음/.test(x.textContent)); nb.click(); setTimeout(() => res({ adtest: !!document.querySelector('[data-adtest]'), next, st: JSON.parse(localStorage.getItem('gf:ads:state')) }), 400); }));
  ok(flow.adtest && flow.next === 0, '결과 「다음」을 닫으면 전면(테스트 팝업)이 먼저 뜨고, 아직 다음 판으로 안 감');
  await p.evaluate(() => { const b = document.querySelector('[data-adtest] .acts .uk-btn') || document.querySelector('.uk-scrim [data-adtest]'); });
  ok(await p.evaluate(() => { const A = GF.ads; return A._interOk() === false; }), '전면을 한 번 보여 주고 나면 곧바로 두 번째는 막힘(간격)');
  ok(errs.length === 0, '성인 앱 오류 없음 ' + errs[0]); await c.close();
  /* 3) 유아 앱 */
  for (const [nm, url, home, play, plays] of [['⑩ 하루', 'day/index.html?ads=1', 'dhome', 'dplay', true], ['① 놀이터', 'index.html?ads=1', 'home', null], ['④ 색칠북', 'color/index.html?ads=1', 'chome', null]]) {
    [c, p, errs] = await open(url);
    ok(await p.evaluate(() => GF.ads.isKid() === true && GF.ads.available('interstitial') === false && GF.ads.available('rewarded') === false && GF.ads.eligible() === false), nm + ': 유아 — 전면·보상형 불가');
    ok(await p.evaluate(() => !GF.ads.interstitial({}) ), nm + ': 유아 — 전면 호출해도 안 나감');
    await p.evaluate((h) => { GF.stack = []; GF.go(h); }, home); await p.waitForTimeout(300);
    ok(await p.evaluate(() => { const d = document.getElementById('gf-adbanner'); return !!d && d.style.display === 'block'; }), nm + ': 홈에 배너(유아도 홈·지도 배너만)');
    if (play) { await p.evaluate((q) => GF.go(q, { n: 1 }), play); await p.waitForTimeout(500); ok(await p.evaluate(() => document.getElementById('gf-adbanner').style.display === 'none'), nm + ': 놀이 화면에는 배너 없음'); }
    ok(errs.length === 0, nm + ' 오류 없음 ' + errs[0]); await c.close();
  }
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
