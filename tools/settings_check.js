// 10앱 설정·보호자 메뉴 일관성 점검(C8): node tools/settings_check.js — 같은 순서·같은 이름·같은 자리 + 큰 글씨 옵션 동작
const { chromium } = require('playwright-core');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const ADULT = [['합치기', 'merge'], ['어느 도형', 'quiz'], ['블록', 'block'], ['틀린 그림', 'spot'], ['짝 맞추기', 'tile'], ['정리', 'sort'], ['세 가족 식탁', 'idle']], KID = [['막둥이의 하루', 'day'], ['색칠북', 'color'], ['놀이터', '']];
const CANON_A = ['소리', '소리 크기', '자막', '진동', '큰 글씨', '큰 버튼', '색 구분 돕기', '통계', '업적', '출석 도장', '도움말', '이야기 다시 보기', '움직임 줄이기', '새 소식', '오늘의 작은 일', '올해의 달력', '앨범', '카메오 도감', '도장책', '가족 코드', '웹툰 보기', '백업 코드', '문의·FAQ', '문제 알리기', '쉬운 모드', '앱 정보', '도움말 다시 보기', '이 앱 기록 지우기'];
const OPT_A = new Set(['올해의 달력']);      // 계절 판이 없는 앱엔 없음
const CANON_K = ['소리', '소리 크기', '자막', '쉬어요 알림', '*', '*', '*', '움직임 줄이기', '카메오 도감', '도장판', '이야기 카드', '가족 코드', '백업 코드', '문의·FAQ', '문제 알리기', '앱 정보', '도움말 다시 보기', '이 앱 기록 지우기'];
const OPT_K = new Set(['도움말 다시 보기']);
const rowsOf = async (a) => {
  const p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { window.__noResume = true; }); await p.goto('http://localhost:8765/games/' + (a ? a + '/' : '') + 'index.html'); await p.waitForTimeout(1800);
  const round = await p.evaluate(() => [...document.querySelectorAll('.round-btn,.uk-round')].filter((e) => e.offsetParent).map((e) => e.getAttribute('aria-label') || ''));
  await p.evaluate(() => GF.extras.open()); await p.waitForTimeout(700);
  const rows = await p.evaluate(() => { const sh = document.querySelector('.uk-sheet'); return sh ? [...sh.querySelectorAll('.xt-row')].map((e) => (e.querySelector('span') || e).textContent.trim().replace(/\d+\s*\/\s*\d+.*$/, '').replace(/\s+$/, '')) : null; });
  return { p, rows, round, errs };
}; let b;
(async () => {
  b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const [nm, a] of ADULT) {
    const { p, rows, round, errs } = await rowsOf(a); ok(!!rows, nm + ': 설정 시트가 열림'); if (!rows) { await p.context().close(); continue; }
    const want = CANON_A.filter((r) => !OPT_A.has(r) || rows.some((x) => x.startsWith(r))), got = rows.map((r) => ([...CANON_A].sort((x, y) => y.length - x.length).find((c) => r.startsWith(c)) || r));
    ok(JSON.stringify(got) === JSON.stringify(want), nm + ': 설정 순서·이름이 다른 성인 앱과 같음' + (JSON.stringify(got) === JSON.stringify(want) ? '' : ' · ' + got.join('>')));
    ok(round.join(',') === 'back,home,settings,sound', nm + ': 위 버튼 줄 = 뒤로·홈·설정·소리(같은 자리) · ' + round.join(','));
    // 큰 글씨: 켜면 홈 글자가 커진다
    const f0 = await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.uk-btn') || document.body).fontSize)); await p.evaluate(() => { const r = [...document.querySelectorAll('.uk-sheet .xt-row')].find((e) => /큰 글씨/.test(e.textContent)); r.querySelector('.uk-switch, [role=switch], input, button').click(); }); await p.waitForTimeout(500);
    const f1 = await p.evaluate(() => parseFloat(getComputedStyle(document.querySelector('.uk-btn') || document.body).fontSize)); ok(f1 > f0, nm + ': 큰 글씨를 켜면 버튼 글자 커짐 ' + f0 + '→' + f1);
    ok(errs.length === 0, nm + ': 오류 없음 ' + (errs[0] || '')); await p.context().close();
  }
  for (const [nm, a] of KID) {
    const { p, rows, round, errs } = await rowsOf(a); ok(!!rows, nm + ': 보호자 메뉴가 열림'); if (!rows) { await p.context().close(); continue; }
    const got = rows.map((r) => { const c = CANON_K.filter((x) => x !== '*').sort((x, y) => y.length - x.length).find((x) => r.startsWith(x)); return c || '*'; }).filter((x, i, arr) => !(x === '*' && arr[i - 1] === '*')), want = CANON_K.filter((r, i, arr) => (!OPT_K.has(r) || rows.some((x) => x.startsWith(r))) && !(r === '*' && arr[i - 1] === '*'));
    ok(JSON.stringify(got) === JSON.stringify(want), nm + ': 보호자 메뉴 순서·이름이 다른 유아 앱과 같음(앱별 기록 3줄만 다름)' + (JSON.stringify(got) === JSON.stringify(want) ? '' : ' · ' + got.join('>')));
    ok(!round.includes('settings'), nm + ': 유아 앱엔 설정 톱니가 없음(보호자 메뉴는 보호자 확인 뒤) · ' + round.join(','));
    ok(rows[0] === '소리' && rows[1] === '소리 크기' && rows[2] === '자막' && rows[rows.length - 1].startsWith('이 앱 기록 지우기'), nm + ': 처음 3줄 소리·소리 크기·자막 / 마지막 줄 기록 지우기(성인 앱과 같음)');
    // 유아 앱: 보호자 확인 없이는 메일/외부 이동이 막힌다(방어선 GF.ops.outOk) — 확인 뒤엔 열린다
    const g0 = await p.evaluate(() => { delete GF.gateAt; const q = () => document.querySelector('.parent'), x = { blocked: !GF.ops.outOk() }; x.gate = !!(q() && q().classList.contains('on')); if (q()) q().classList.remove('on'); GF.gateAt = Date.now(); x.after = GF.ops.outOk(); return x; });
    ok(g0.blocked && g0.gate && g0.after, nm + ': 유아 앱 mailto/외부 이동은 보호자 확인 뒤에만 · ' + JSON.stringify(g0));
    ok(errs.length === 0, nm + ': 오류 없음 ' + (errs[0] || '')); await p.context().close();
  }
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
