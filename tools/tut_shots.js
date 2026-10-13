// D22-1 튜토리얼 컷 점검·캡처: node tools/tut_shots.js [앱…] → notes/snapshots/tut_<앱>_<번호>.png (프롤로그 컷들 → 1장 시작 컷 → 설명 카드 → 첫 판)
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const PLAY = { merge: 'mplay', spot: 'pplay', block: 'bplay', sort: 'splay', tile: 'tplay', day: 'dplay', idle: null, color: null, quiz: null };
const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(PLAY);
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const a of want) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 1 }), p = await ctx.newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.addInitScript(() => { window.__noResume = true; });
    await p.goto('http://localhost:8765/games/' + a + '/index.html?story=1'); await p.waitForTimeout(1800);
    let n = 0; const shot = async (tag) => { n++; await p.waitForTimeout(1500); await p.screenshot({ path: `notes/snapshots/tut_${a}_${n}_${tag}.png` }); };
    const pro = await p.evaluate(() => !!document.querySelector('.tale-ov .caption'));
    ok(pro, a + ' 프롤로그 컷');
    for (let i = 0; i < 3; i++) {
      const hasMini = await p.evaluate(() => !!document.querySelector('.tale-ov .cut-mini'));
      await shot('pro' + (i + 1) + (hasMini ? 'm' : ''));
      if (i === 1) ok(hasMini, a + ' 프롤로그 2컷에 미니 판');
      if (i === 1 && a === 'merge') ok(await p.evaluate(() => document.querySelectorAll('.tale-ov .cut-mini .mg-pc img').length === 3), a + ' 미니 판 조각 수 = 데이터 조각 수(합칠 둘 + 결과 하나, 빈칸 아님)');
      if (i === 1 && a === 'tile') ok(await p.evaluate(() => document.querySelectorAll('.tale-ov .cut-mini .tl-slot.on').length >= 6), a + ' 미니 판 타일 수 = 데이터 타일 수');
      await p.evaluate(() => { const b = document.querySelector('.tale-ov .nextbtn'); b && b.click(); }); await p.waitForTimeout(400);
    }
    await p.waitForTimeout(600);
    if (!PLAY[a]) { ok(await p.evaluate(() => !document.querySelector('.tale-ov')), a + ' 프롤로그 3컷 뒤 닫힘'); ok(errs.length === 0, a + ' 오류 없음 ' + errs[0]); await ctx.close(); continue; }
    await p.evaluate((s) => { GF.stack = []; GF.go(s, { n: 1 }); }, PLAY[a]); await p.waitForTimeout(1500);
    const hook = await p.evaluate(() => !!document.querySelector('.tale-ov .cut-mini')); ok(hook, a + ' 1장 시작 컷에 미니 판'); await shot('hook');
    for (let i = 0; i < 3; i++) { const more = await p.evaluate(() => !!document.querySelector('.tale-ov')); if (!more) break; await p.evaluate(() => { const b = document.querySelector('.tale-ov .nextbtn'); b && b.click(); }); await p.waitForTimeout(500); }
    await p.waitForTimeout(800); const card = await p.evaluate(() => !!document.querySelector('.uk-sheet .cut-mini.in-card')); ok(card, a + ' 설명 카드에 그림 한 장'); await shot('card');
    await p.evaluate(() => { const b = document.querySelector('.uk-scrim .acts .uk-btn'); b && b.click(); }); await p.waitForTimeout(1800); await shot('board');
    ok(errs.length === 0, a + ' 오류 없음 ' + errs[0]); await ctx.close();
  }
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
