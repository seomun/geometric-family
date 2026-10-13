// C2 시험: 실패 직후 카드 — 1번째 근접 표시+자동 재시작 · 2번째 힌트 안내 · 3번째부터 쉬운 모드 제안(자동 재시작 없음). node tools/fail_card.js
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { window.__noResume = true; }); await p.goto('http://localhost:8765/games/block/index.html'); await p.waitForTimeout(1600);
  await p.evaluate(() => { window.__r = 0; GF.state.settings.assist = 0; GF.polish.failReset('t', 'x'); });
  const card = (near) => p.evaluate((n) => { GF.polish.failCard(document.getElementById('safe'), { app: 't', id: 'x', near: n, hint: true, onRetry: () => { window.__r++; } }); }, near);
  await card('목표까지 3줄!'); await p.waitForTimeout(500); ok(await p.evaluate(() => /목표까지 3줄/.test(document.querySelector('.uk-sheet').textContent) && /조금만 더/.test(document.querySelector('.uk-sheet').textContent)), '1번째: 근접 표시 + 격려'); await p.screenshot({ path: 'notes/snapshots/fail_card_1.png' });
  await p.waitForTimeout(2300); ok(await p.evaluate(() => window.__r === 1) && !(await p.evaluate(() => !!document.querySelector('.uk-sheet'))), '자동으로 한 번 더 시작됨(2.3초)');
  await card('목표까지 2줄!'); await p.waitForTimeout(400); ok(await p.evaluate(() => /힌트/.test(document.querySelector('.uk-sheet').textContent)), '2번째: 힌트 안내'); await p.evaluate(() => { [...document.querySelectorAll('.uk-sheet .uk-btn')].find((x) => /한 번 더/.test(x.textContent)).click(); }); ok(await p.evaluate(() => window.__r === 2), '버튼으로 바로 한 번 더');
  await card('목표까지 1줄!'); await p.waitForTimeout(3000); ok(await p.evaluate(() => window.__r === 2 && !!document.querySelector('.uk-sheet')) && await p.evaluate(() => /쉬운 모드로 한 번 더/.test(document.querySelector('.uk-sheet').textContent)), '3번째: 쉬운 모드 제안(고르기 전엔 자동으로 안 넘어감)'); await p.screenshot({ path: 'notes/snapshots/fail_card_3.png' });
  await p.evaluate(() => { [...document.querySelectorAll('.uk-sheet .uk-btn')].find((x) => /쉬운 모드/.test(x.textContent)).click(); }); await p.waitForTimeout(300); ok(await p.evaluate(() => GF.state.settings.assist === 1 && window.__r === 3), '쉬운 모드를 켜고 다시 시작');
  await p.evaluate(() => { GF.polish.failReset('t', 'x'); }); ok(await p.evaluate(() => GF.polish.failCount('t', 'x') === 0), '클리어하면 횟수 초기화');
  await p.evaluate(() => { GF.state.settings.assist = 0; }); ok(errs.length === 0, '오류 없음 ' + errs[0]); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
