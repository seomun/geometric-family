// 오류 기록 틀(C21) 시험: node tools/errlog_check.js — 오류가 기기 안에 최근 50건만 남고(같은 글은 횟수로 합침) · 개인정보(메일·주소·긴 값·숫자)는 지워지고 · 저절로 어디로도 전송되지 않으며 · 설정 「문제 알리기」에서 보고 복사·지울 수 있다
const { chromium } = require('playwright-core');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), reqs = [];
  p.on('pageerror', () => { /* 시험이 일부러 낸 오류 */ }); p.on('request', (r) => { if (!/^(http:\/\/localhost|data:|blob:)/.test(r.url())) reqs.push(r.url()); });
  await p.addInitScript(() => { window.__noResume = true; }); await p.goto('http://localhost:8765/games/merge/index.html'); await p.waitForTimeout(1700);
  await p.evaluate(() => GF.ops.errlog.clear());
  await p.evaluate(() => { setTimeout(() => { throw new Error('테스트 오류 https://example.com/a/z?token=abcdef0123456789abcdef0123456789 연락 me@test.com 번호 12345678901'); }, 0); }); await p.waitForTimeout(400);
  let a = await p.evaluate(() => GF.ops.errlog.get()); ok(a.length === 1 && a[0].n === 1, '오류 한 건이 기록됨'); ok(a.length && !/me@test|token=|abcdef0123|12345678901|example\.com/.test(a[0].m), '메일·주소·긴 값·긴 숫자는 지워짐 · [' + (a[0] && a[0].m) + ']');
  await p.evaluate(() => { for (let i = 0; i < 3; i++) setTimeout(() => { throw new Error('같은 오류'); }, i * 20); }); await p.waitForTimeout(500);
  a = await p.evaluate(() => GF.ops.errlog.get()); ok(a.length === 2 && a[1].n === 3, '같은 오류를 5초 안에 또 만나면 횟수만 올림(×3)');
  await p.evaluate(() => { Promise.reject(new Error('거부된 약속')); }); await p.waitForTimeout(300); ok(await p.evaluate(() => GF.ops.errlog.get().some((e) => /거부된 약속/.test(e.m))), '처리 안 된 약속 거부도 기록');
  await p.evaluate(() => { for (let i = 0; i < 70; i++) GF.ops.errlog.add('오류 번호 ' + i, 'x.js:' + i); }); const c = await p.evaluate(() => ({ n: GF.ops.errlog.count(), first: GF.ops.errlog.get()[0].m, last: GF.ops.errlog.get().slice(-1)[0].m }));
  ok(c.n === 50 && /오류 번호 69/.test(c.last) && !/같은 오류|테스트 오류/.test(c.first), '최근 50건만 남고 오래된 건 밀려남 (' + c.n + '건)');
  const body = await p.evaluate(() => GF.ops.errlog.body()); ok(/^앱: /.test(body) && /최근 오류 20건/.test(body) && body.split('\n').filter((l) => /^\d+\. /.test(l)).length === 20, '메일 본문: 앱·기기·화면 + 최근 20건'); ok(!/@[\w-]+\.\w|https?:\/\/|token|계정|account/i.test(body.replace(/@x\.js/g, '')), '메일 본문에 주소·메일·계정 같은 개인정보 없음');
  // 설정 → 문제 알리기
  await p.evaluate(() => GF.extras.open()); await p.waitForTimeout(700);
  const hasRow = await p.evaluate(() => [...document.querySelectorAll('.uk-sheet .xt-row')].some((x) => /문제 알리기/.test(x.textContent)));
  if (hasRow) { await p.evaluate(() => { const r = [...document.querySelectorAll('.xt-row')].find((x) => /문제 알리기/.test(x.textContent)); r.querySelector('button').click(); }); await p.waitForTimeout(500); } else await p.evaluate(() => GF.ops.openReport());
  ok(hasRow, '설정에 「문제 알리기」 줄'); const sh = await p.evaluate(() => (document.querySelector('.xt-sheet') || document.querySelector('.uk-sheet')).innerText.replace(/\s+/g, ' ')); ok(/개인정보는 담기지 않고/.test(sh) && /최근 오류 50건/.test(sh), '시트: 안내(개인정보 없음·저절로 전송 안 됨) + 남은 건수 · ' + sh.slice(0, 60)); await p.screenshot({ path: 'notes/snapshots/c21_report.png' });
  await p.evaluate(() => { [...document.querySelectorAll('.uk-sheet .uk-btn')].find((x) => /기록 지우기/.test(x.textContent)).click(); }); await p.waitForTimeout(300); ok(await p.evaluate(() => GF.ops.errlog.count() === 0), '기록 지우기');
  await p.evaluate(() => { document.querySelectorAll('.uk-scrim').forEach((e) => e.remove()); GF.ops.openReport(); }); await p.waitForTimeout(300); ok(await p.evaluate(() => /잘 돌아가고 있어요/.test(document.querySelector('.uk-sheet').innerText)), '오류가 없으면 「잘 돌아가고 있어요」');
  ok(reqs.length === 0, '오류를 기록·열람하는 동안 바깥으로 나간 요청 없음 ' + reqs.slice(0, 2).join(','));
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
