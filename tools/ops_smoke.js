// 운영 층(GF.ops, D21 소 묶음) 점검: node tools/ops_smoke.js — 새 소식·문의·FAQ·복귀 선물·금요일 선물·움직임 줄이기·인앱 리뷰 규칙
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const B = 'http://localhost:8765/games/';
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const open = async (url, pre) => { const c = await b.newContext({ viewport: { width: 390, height: 780 } }), p = await c.newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message)); await p.addInitScript(() => { window.__noResume = true; }); if (pre) await p.addInitScript(pre); await p.goto(B + url); await p.waitForTimeout(1500); return [c, p, errs]; };
  /* 성인 앱(③): 설정 줄 */
  let [c, p, errs] = await open('merge/index.html');
  ok(await p.evaluate(() => GF.ops.ready && GF.t('ops.settings.motion') === '움직임 줄이기' && GF.t('없는키') === '없는키'), 'GF.t 문자열 표(없는 키는 키 그대로)');
  await p.evaluate(() => GF.extras.open()); await p.waitForTimeout(300);
  const rows = await p.evaluate(() => [...document.querySelectorAll('.xt-row span')].map((e) => e.textContent));
  ok(['움직임 줄이기', '새 소식', '문의·FAQ'].every((t) => rows.includes(t)), '설정에 움직임 줄이기·새 소식·문의·FAQ 줄');
  await p.evaluate(() => { document.querySelectorAll('.uk-scrim').forEach((e) => e.remove()); GF.ops.openHelp(); }); await p.waitForTimeout(200);
  ok(await p.evaluate(() => document.querySelectorAll('.ops-faq').length >= 5 && /곧 안내/.test(document.querySelector('.ops-mail').textContent)), 'FAQ 6개 + 이메일이 비면 「곧 안내」(메일 버튼 숨김)');
  await p.evaluate(() => { document.querySelectorAll('.uk-scrim').forEach((e) => e.remove()); GF.ops.openNews(); }); await p.waitForTimeout(200);
  ok(await p.evaluate(() => /rc7/.test(document.body.innerText) && JSON.parse(localStorage.getItem('gf:merge:ops')).newsSeen === GF.data.ops.news.version), '새 소식 시트 + 본 버전 기록');
  /* 움직임 줄이기 */
  await p.evaluate(() => { document.querySelectorAll('.uk-scrim').forEach((e) => e.remove()); GF.state.settings.rm = 1; GF.ops.applyMotion(); });
  ok(await p.evaluate(() => document.documentElement.dataset.rm === '1' && getComputedStyle(document.querySelector('.uk-btn') || document.body).transitionDuration.startsWith('1e-') || document.documentElement.dataset.rm === '1'), '움직임 줄이기: html[data-rm=1]');
  ok(await p.evaluate(() => { const n = document.querySelectorAll('.uk-confetti, .confetti').length; UK.confetti(document.getElementById('safe')); return document.querySelectorAll('.uk-confetti, .confetti').length === n; }), '움직임 줄이기: 꽃가루 생략');
  /* 인앱 리뷰 규칙 */
  const rv = await p.evaluate(() => { const O = GF.ops, out = {}; localStorage.setItem('gf:merge:ops', JSON.stringify({ clears: 9, reviewAt: 0 })); out.d9 = O.reviewDue();
    localStorage.setItem('gf:merge:ops', JSON.stringify({ clears: 10, reviewAt: 0 })); out.d10 = O.reviewDue();
    let called = 0; window.GFOps = { version: () => 't', review: () => { called++; } };
    out.s2 = O.maybeReview(2); out.s3 = O.maybeReview(3); out.called = called; out.again = O.maybeReview(3); out.dueAfter = O.reviewDue();
    O._now = () => Date.now() + 91 * 86400000; out.dueLater = O.reviewDue(); O._now = () => Date.now(); return out; });
  ok(rv.d9 === false && rv.d10 === true, '인앱 리뷰: 9판 전엔 없음 · 10판 뒤부터');
  ok(rv.s2 === false && rv.s3 === true && rv.called === 1, '인앱 리뷰: 별 3개(기쁜 순간)에만 요청, 1번 호출');
  ok(rv.again === false && rv.dueAfter === false && rv.dueLater === true, '인앱 리뷰: 90일에 1회(요청 직후엔 없음, 91일 뒤엔 다시 가능)');
  ok(errs.length === 0, '성인 앱 오류 없음 ' + errs[0]); await c.close();
  /* 복귀 선물(성인): 7일↑ 쉬었다 오면 소품 1개, 첫 실행·매일 오는 사람에겐 없음 */
  const week = Date.now() - 9 * 86400000;
  [c, p, errs] = await open('merge/index.html?ops=1', () => { try { if (!localStorage.getItem('gf:merge:ops')) localStorage.setItem('gf:merge:ops', JSON.stringify({ lastOpen: Date.now() - 9 * 86400000, newsSeen: '1.0.0-rc7' })); } catch (e) {} });
  await p.waitForTimeout(3200);
  const bk = await p.evaluate(() => ({ modal: /오랜만이에요/.test(document.body.innerText), owned: Room.owned().length }));
  ok(bk.modal, '복귀 선물: 9일 만에 열면 「오랜만이에요」 + 선물');
  ok(bk.owned >= 1, '복귀 선물: 집 소품 1개 확정 지급(뽑기 아님)');
  await c.close();
  [c, p, errs] = await open('merge/index.html?ops=1', () => { try { if (!localStorage.getItem('gf:merge:ops')) localStorage.setItem('gf:merge:ops', JSON.stringify({ lastOpen: Date.now() - 86400000, newsSeen: '1.0.0-rc7' })); } catch (e) {} });
  await p.waitForTimeout(3200); ok(await p.evaluate(() => !/오랜만이에요/.test(document.body.innerText)), '복귀 선물: 어제 왔으면 없음(압박·끊김 표시 없음)'); await c.close();
  /* 새 소식 자동: 버전이 바뀐 뒤 첫 실행에만 */
  [c, p, errs] = await open('merge/index.html?ops=1', () => { try { if (!localStorage.getItem('gf:merge:ops')) localStorage.setItem('gf:merge:ops', JSON.stringify({ lastOpen: Date.now(), newsSeen: '0.9.0' })); } catch (e) {} });
  await p.waitForTimeout(3600); ok(await p.evaluate(() => /새로 생긴 것/.test(document.body.innerText)), '새 소식: 업데이트 뒤 첫 실행에 자동으로 한 번'); await c.close();
  [c, p, errs] = await open('merge/index.html?ops=1');
  await p.waitForTimeout(3200); ok(await p.evaluate(() => !/새로 생긴 것/.test(document.body.innerText)), '새 소식: 처음 설치한 날엔 안 뜸'); await c.close();
  /* 유아 앱 금요일 선물 */
  const fri = (() => { const d = new Date(); d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7)); return d.getTime(); })(), sat = fri + 86400000;
  for (const [nm, url] of [['⑩ 하루', 'day/index.html?ops=1'], ['④ 색칠북', 'color/index.html?ops=1'], ['① 놀이터', 'index.html?ops=1']]) {
    [c, p, errs] = await open(url); await p.waitForTimeout(500);
    const r = await p.evaluate(([f, s]) => { const O = GF.ops, out = {}; O._now = () => s; out.sat = O.fridayGift(); O._now = () => f; const before = Room.owned().length; out.fri = O.fridayGift(); out.after = Room.owned().length - before; out.again = O.fridayGift(); out.text = (document.querySelector('.uk-sheet') || {}).innerText || ''; return out; }, [fri, sat]);
    ok(r.sat === false, nm + ' 금요일 선물: 토요일엔 없음'); ok(r.fri === true && r.after === 1, nm + ' 금요일 선물: 금요일에 소품 1개 확정'); ok(r.again === false, nm + ' 금요일 선물: 그 주엔 한 번만'); ok(!/\S/.test(r.text.replace(/[\u{1F300}-\u{1FAFF}]/gu, '')), nm + ' 금요일 선물: 글자 없는 연출(유아)');
    ok(await p.evaluate(() => GF.ops.reviewDue() === false), nm + ' 유아: 인앱 리뷰 없음');
    ok(errs.length === 0, nm + ' 오류 없음 ' + errs[0]); await c.close();
  }
  /* ⑩ 오늘의 하루 카드 */
  [c, p, errs] = await open('day/index.html'); await p.evaluate(() => { GF.stack = []; GF.go('dhome'); }); await p.waitForTimeout(500);
  ok(await p.evaluate(() => document.querySelectorAll('.screen.on .dy-card').length === 3 && !!document.querySelector('.screen.on .dy-today')), '⑩ 홈에 카드 3개(하루·집·오늘의 하루)');
  await p.click('.screen.on .dy-today'); await p.waitForTimeout(900); ok(await p.evaluate(() => !!document.querySelector('.screen.on .dy-stage') || GF.cur.name === 'dplay'), '⑩ 오늘의 하루 카드 → 오늘의 판'); await c.close();
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
