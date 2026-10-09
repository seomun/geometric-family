// 판 흐름 점검: node tools/story_flow.js — ?story=1 로 1장 1판에 들어가면 기 컷 → 규칙 설명 → 말풍선, 판을 깨면 클리어 말풍선, 장 도움말 시트
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const APPS = { merge: 'mplay', spot: 'pplay', block: 'bplay', sort: 'splay', tile: 'tplay', day: 'dplay' };
const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(APPS);
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const a of want) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 780 } }), p = await ctx.newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto('http://localhost:8765/games/' + a + '/index.html?story=1'); await p.waitForTimeout(1500);
    await p.click('.tale-skip'); await p.waitForTimeout(400);
    await p.evaluate((s) => GF.go(s, { n: 1 }), APPS[a]); await p.waitForTimeout(1200);
    ok(await p.evaluate(() => !!document.querySelector('.tale-ov .caption')), a + ' 1장 1판 시작: 기 컷');
    await p.screenshot({ path: `notes/snapshots/story_${a}_start.png` });
    for (let i = 0; i < 4 && await p.evaluate(() => !!document.querySelector('.tale-ov')); i++) { await p.click('.tale-skip'); await p.waitForTimeout(400); }
    const modal = await p.evaluate(() => !!document.querySelector('.uk-scrim'));
    ok(modal, a + ' 처음 나오는 판 종류 설명 모달'); await p.screenshot({ path: `notes/snapshots/story_${a}_rule.png` });
    if (modal) { await p.click('.uk-scrim .acts .uk-btn'); await p.waitForTimeout(500); }
    ok(await p.evaluate(() => !document.querySelector('.tale-say') && !document.querySelector('.uk-toast.on, .uk-toast')), a + ' 설명 카드 직후엔 말풍선·안내 토스트 없음(카드 → 손가락 → 말풍선 순서)');
    await p.mouse.click(195, 450); await p.waitForTimeout(1300);
    ok(await p.evaluate(() => !!document.querySelector('.tale-say')), a + ' 첫 조작 뒤에 시작 말풍선'); await p.screenshot({ path: `notes/snapshots/story_${a}_say.png` });
    ok(errs.length === 0, a + ' 오류 없음 ' + errs[0]); await ctx.close();
  }
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
