// 유아 집 「오늘의 정리 놀이」(A12) 시험: node tools/housing_tidy.js — 칩 · 장난감 5개와 같은 모양 그림자 자리 5개 · 틀린 자리면 돌아감 · 맞는 자리면 붙음 · 다 하면 별+앨범(하루 한 번) · 글자 없음
const { chromium } = require('playwright-core');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 }, hasTouch: false })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { window.__noResume = true; }); await p.goto('http://localhost:8765/games/index.html'); await p.waitForTimeout(1600);
  await p.evaluate(() => { GF.stack = []; GF.go('khouse'); }); await p.waitForTimeout(1300); await p.evaluate(() => document.querySelectorAll('.uk-scrim,.tale-ov,.h2-reveal').forEach((e) => e.remove()));
  ok(await p.evaluate(() => !!document.querySelector('.h2-tidychip')), '유아 집에 정리 놀이 칩(🧺)');
  await p.evaluate(() => { Room.S.album = []; Room.S.tidyN = 0; }); await p.click('.h2-tidychip'); await p.waitForTimeout(500);
  const o = await p.evaluate(() => ({ slots: document.querySelectorAll('.h2-tidyslot').length, toys: document.querySelectorAll('.h2-tidytoy').length, same: [...document.querySelectorAll('.h2-tidytoy')].map((t) => t.dataset.e).sort().join() === [...document.querySelectorAll('.h2-tidyslot')].map((t) => t.dataset.e).sort().join(), txt: document.querySelector('.h2-tidybox').innerText.replace(/\s/g, '') }));
  ok(o.slots === 5 && o.toys === 5 && o.same, '장난감 5개 · 같은 모양 자리 5개'); ok(!/[가-힣A-Za-z]/.test(o.txt), '글자 없음 · [' + o.txt + ']'); await p.screenshot({ path: 'notes/snapshots/a12_tidy_start.png' });
  const box = async (sel, i) => (await p.locator(sel).nth(i).boundingBox());
  const slotOf = async (e) => p.evaluate((e) => { const s = document.querySelector('.h2-tidyslot[data-e="' + e + '"]').getBoundingClientRect(); return { x: s.left + s.width / 2, y: s.top + s.height / 2 }; }, e);
  const toys = await p.evaluate(() => [...document.querySelectorAll('.h2-tidytoy')].map((t) => t.dataset.e));
  // 틀린 자리: 다른 모양 자리에 놓기 → 돌아감
  const t0 = (await p.locator('.h2-tidytoy').nth(0).boundingBox()), wrong = await slotOf(toys.find((e) => e !== toys[0]));
  await p.mouse.move(t0.x + 30, t0.y + 30); await p.mouse.down(); await p.mouse.move(wrong.x, wrong.y, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(500);
  ok(await p.evaluate(() => document.querySelectorAll('.h2-tidytoy.ok').length === 0), '다른 모양 자리에 놓으면 안 붙고 돌아감');
  // 맞는 자리 5개
  for (let i = 0; i < 5; i++) {
    const tb = await p.locator('.h2-tidytoy:not(.ok)').first().boundingBox(), e = await p.locator('.h2-tidytoy:not(.ok)').first().getAttribute('data-e'), s = await slotOf(e);
    await p.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2); await p.mouse.down(); await p.mouse.move(s.x, s.y, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(350);
    if (i === 2) { ok(await p.evaluate(() => document.querySelectorAll('.h2-tidytoy.ok').length === 3 && document.querySelectorAll('.h2-tidyslot.filled').length === 3), '맞는 자리에 놓으면 붙음(3/5)'); await p.screenshot({ path: 'notes/snapshots/a12_tidy_mid.png' }); }
  }
  await p.waitForTimeout(500); ok(await p.evaluate(() => !!document.querySelector('.h2-tidystar')), '다 놓으면 큰 별'); await p.screenshot({ path: 'notes/snapshots/a12_tidy_done.png' });
  await p.waitForTimeout(2300); ok(await p.evaluate(() => !document.querySelector('.h2-tidy') && Room.S.tidyN === 1 && Room.S.album.some((a) => a.kind === 'tidy')), '끝나면 닫히고 앨범에 기록(하루 한 번)');
  await p.click('.h2-tidychip'); await p.waitForTimeout(400); await p.evaluate(() => document.querySelector('.h2-tidyx .uk-btn').click()); await p.waitForTimeout(300);
  await p.click('.h2-tidychip'); await p.waitForTimeout(400);
  for (let i = 0; i < 5; i++) { const tb = await p.locator('.h2-tidytoy:not(.ok)').first().boundingBox(), e = await p.locator('.h2-tidytoy:not(.ok)').first().getAttribute('data-e'), s = await slotOf(e); await p.mouse.move(tb.x + tb.width / 2, tb.y + tb.height / 2); await p.mouse.down(); await p.mouse.move(s.x, s.y, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(300); }
  await p.waitForTimeout(2600); ok(await p.evaluate(() => Room.S.tidyN === 1 && Room.S.album.filter((a) => a.kind === 'tidy').length === 1), '같은 날 또 해도 기록은 한 번(놀이는 계속 가능)');
  ok(errs.length === 0, '오류 없음 ' + (errs[0] || '')); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
