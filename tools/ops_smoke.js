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
  /* 중 묶음: 달력·미션·앨범·백업 코드 */
  [c, p, errs] = await open('merge/index.html');
  const cal = await p.evaluate(() => { const ev = GF.extras.cfg.calendar(); return { n: ev.length, ids: ev.map((e) => e.id + ':' + e.months.join('/')).join(' ') }; });
  ok(cal.n >= 4, '이벤트 달력: 계절 이벤트 ' + cal.n + '개(' + cal.ids + ')');
  await p.evaluate(() => { GF.ops._now = () => new Date(2026, 9, 12).getTime(); GF.ops.openCalendar(); }); await p.waitForTimeout(300);
  const calUi = await p.evaluate(() => ({ again: document.querySelectorAll('.ops-ev.again').length, later: document.querySelectorAll('.ops-ev.later').length, now: document.querySelectorAll('.ops-ev.now').length, txt: document.querySelector('.uk-sheet').innerText }));
  ok(calUi.now >= 1 && calUi.again >= 1 && calUi.later >= 1, '이벤트 달력: 10월 기준 지금(추석)·지난 것 다시 열기(어린이날 등)·앞으로 N월에 열려요');
  ok(!/남은|D-|카운트|마감|사라지|놓치면/.test(calUi.txt), '이벤트 달력: 카운트다운·FOMO 문구 없음');
  await p.click('.ops-ev.again'); await p.waitForTimeout(900);
  ok(await p.evaluate(() => GF.cur.name === 'mplay' && GF.cur.params.level && GF.cur.params.level.kind === 'season'), '이벤트 달력: 지난 이벤트 「다시 열기」 → 그 시즌 판');
  const ms = await p.evaluate(() => { const O = GF.ops; O._now = () => new Date(2026, 9, 12).getTime(); const L = O.missions(); const ids = L.map((x) => x.id); O.noteResult(3); O.noteResult(3); O.noteResult(3); O.note('story'); O.note('house'); O.note('daily'); return { n: L.length, uniq: new Set(ids).size, after: O.missions().map((x) => x.id + ':' + x.got + '/' + x.n) }; });
  ok(ms.n === 3 && ms.uniq === 3, '오늘의 작은 일: 하루 3개(중복 없음) ' + ms.after.join(' '));
  const mg = await p.evaluate(() => { const O = GF.ops; O._now = () => new Date(2026, 9, 13).getTime(); const l1 = O.missions().map((x) => x.id).join(); O._now = () => new Date(2026, 9, 12).getTime(); const l0 = O.missions().map((x) => x.id).join(); return [l1, l0]; });
  ok(mg[0] !== mg[1], '오늘의 작은 일: 날마다 다른 조합');
  await p.evaluate(() => { document.querySelectorAll('.uk-scrim').forEach((e) => e.remove()); GF.ops.openAlbum(); }); await p.waitForTimeout(300);
  ok(await p.evaluate(() => /집 소품/.test(document.body.innerText) && /이야기 카드/.test(document.body.innerText)), '앨범: 집 소품·이야기 카드 구역');
  const bkc = await p.evaluate(() => { const O = GF.ops; localStorage.setItem('gf:merge:ui:v1', '{"x":1}'); const code = O.makeCode(); const good = O.readCode(code).ok; const bad = O.readCode(code.slice(0, -1) + (code.slice(-1) === '0' ? '1' : '0')).err; const garbage = O.readCode('hello').err; O.app = 'spot'; const other = O.readCode(code).err; O.app = 'merge'; localStorage.setItem('gf:merge:ui:v1', '{"x":2}'); O.applyCode(code); return { good, bad, garbage, other, restored: localStorage.getItem('gf:merge:ui:v1'), len: code.length }; });
  ok(bkc.good && bkc.bad === 'bad' && bkc.garbage === 'bad' && bkc.other === 'other', '백업 코드: 정상 통과·체크섬 오류·형식 오류·다른 앱 코드 구분');
  ok(bkc.restored === '{"x":1}', '백업 코드: 불러오면 기록이 되돌아옴(코드 길이 ' + bkc.len + ')');
  ok(errs.length === 0, '중 묶음 오류 없음 ' + errs[0]); await c.close();
  [c, p, errs] = await open('day/index.html'); await p.evaluate(() => GF.extras.open()); await p.waitForTimeout(300);
  ok(await p.evaluate(() => /백업 코드/.test(document.body.innerText) && !/오늘의 작은 일|올해의 달력|앨범/.test(document.body.innerText)), '유아 보호자 메뉴: 백업 코드만(미션·달력·앨범은 성인 전용)'); await c.close();
  [c, p, errs] = await open('idle/index.html'); const ic = await p.evaluate(() => GF.extras.cfg.calendar().length); ok(ic >= 1, '② 식탁: 계절 사건 달력 ' + ic + '개'); await c.close();
  /* 대 묶음: 광고 제거·소품 팩(구매)·로컬 알림 */
  const stubB = () => { window.GFBilling = { info: () => JSON.stringify({ adfree: { configured: true, price: '₩1,900', owned: false }, pack: { configured: true, price: '₩3,300', owned: false } }), buy(k) { setTimeout(() => window.GF_billEvent(k, 'owned'), 50); }, restore() {} }; };
  [c, p, errs] = await open('merge/index.html');
  await p.evaluate(() => GF.extras.open()); await p.waitForTimeout(300);
  ok(await p.evaluate(() => !/광고 제거|소품 팩|오늘의 한 판 알림/.test(document.querySelector('.uk-sheet').innerText)), '구매·알림: 네이티브/상품 ID 가 없으면 설정에 줄이 없음(숨김)');
  await p.evaluate(() => { document.querySelectorAll('.uk-scrim').forEach((e) => e.remove()); window.GFBilling = { info: () => JSON.stringify({ adfree: { configured: true, price: '₩1,900', owned: false }, pack: { configured: true, price: '₩3,300', owned: false } }), buy(k) { setTimeout(() => window.GF_billEvent(k, 'owned'), 50); }, restore() {} }; GF.extras.open(); }); await p.waitForTimeout(300);
  ok(await p.evaluate(() => /광고 제거/.test(document.querySelector('.uk-sheet').innerText) && /₩1,900/.test(document.querySelector('.uk-sheet').innerText) && /소품 팩/.test(document.querySelector('.uk-sheet').innerText) && /구매 복원/.test(document.querySelector('.uk-sheet').innerText)), '구매: 상품 ID 가 있으면 광고 제거(가격)·소품 팩·구매 복원 줄');
  const before = await p.evaluate(() => Room.owned().length);
  await p.evaluate(() => { const r = [...document.querySelectorAll('.xt-row')].find((x) => /광고 제거/.test(x.innerText)); r.querySelector('button').click(); }); await p.waitForTimeout(400);
  ok(await p.evaluate(() => GF.ads.config.adFree === true && JSON.parse(localStorage.getItem('gf:merge:iap')).adfree === 1), '광고 제거 구매 → adFree 켜짐·기록');
  ok(await p.evaluate(() => { GF.ads.config.test = true; GF.ads.banner(true); return GF.ads._banner === false && GF.ads._interOk() === false; }), '광고 제거: 배너·전면이 나가지 않음');
  ok(await p.evaluate(() => { let g = 0; GF.ads.run({ placement: 'x', onReward: () => { g++; } }); return g === 1 || !GF.ads.live(); }), '광고 제거: 선택형 보상은 바로 지급(또는 광고 자체 없음)');
  await p.evaluate(() => { window.GF_billEvent('pack', 'owned'); }); await p.waitForTimeout(300);
  const afterPack = await p.evaluate(() => Room.owned().length); ok(afterPack - before === 5, '소품 팩 구매 → 확정 지급 5개(뽑기 없음, ' + (afterPack - before) + '개)');
  await p.evaluate(() => { window.GF_billEvent('pack', 'owned'); window.GF_billEvent('pack', 'restored'); }); await p.waitForTimeout(200);
  ok((await p.evaluate(() => Room.owned().length)) === afterPack, '소품 팩: 복원·중복 이벤트로 또 지급되지 않음');
  ok(errs.length === 0, '구매 오류 없음 ' + errs[0]); await c.close();
  [c, p, errs] = await open('day/index.html', () => { window.GFBilling = { info: () => JSON.stringify({ adfree: { configured: true, price: 'x', owned: false }, pack: { configured: true, price: 'y', owned: false } }), buy() {}, restore() {} }; window.GFNotify = { available: () => true, enable() {}, disable() {} }; });
  await p.evaluate(() => GF.extras.open()); await p.waitForTimeout(300);
  ok(await p.evaluate(() => GF.ops.iap.configured('adfree') === false && !/광고 제거|소품 팩|오늘의 한 판 알림/.test(document.querySelector('.uk-sheet').innerText)), '유아 앱: 구매·알림 줄이 절대 없음(스텁이 있어도)'); await c.close();
  [c, p, errs] = await open('merge/index.html', () => { window.__n = { on: 0, off: 0 }; window.GFNotify = { available: () => true, enable() { window.__n.on++; setTimeout(() => window.GF_notifEvent(window.__deny ? 'denied' : 'granted'), 50); }, disable() { window.__n.off++; } }; });
  await p.evaluate(() => GF.extras.open()); await p.waitForTimeout(300);
  ok(await p.evaluate(() => /오늘의 한 판 알림/.test(document.querySelector('.uk-sheet').innerText) && GF.ops.notif.on() === false), '알림: 설정에 「오늘의 한 판 알림」 줄, 기본 꺼짐');
  await p.evaluate(() => { const r = [...document.querySelectorAll('.xt-row')].find((x) => /오늘의 한 판 알림/.test(x.innerText)); (r.querySelector('input,button,.uk-switch') || r.lastChild).click(); }); await p.waitForTimeout(300);
  ok(await p.evaluate(() => window.__n.on === 1 && GF.ops.notif.on() === true), '알림: 켜면 네이티브 enable 호출(권한 요청은 이때만)·상태 저장');
  await p.evaluate(() => { window.__deny = 1; GF.ops.notif.set(false); GF.ops.notif.set(true); }); await p.waitForTimeout(300);
  ok(await p.evaluate(() => GF.ops.notif.on() === false), '알림: 권한 거부 이벤트 → 다시 꺼짐(조용히 안내)');
  ok(errs.length === 0, '알림 오류 없음 ' + errs[0]); await c.close();
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
