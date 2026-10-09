// 이야기 층 점검·캡처: node tools/story_shots.js [앱…]  — 프롤로그 1장 · 장 중간(승) 컷 1장 · 판 안 말풍선 · 설명 · 이야기 지도를 notes/snapshots/story_<앱>_*.png 로
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const APPS = { merge: ['mlevels', 'mplay'], spot: ['slevels', 'splay'], block: ['blevels', 'bplay'], sort: ['srlevels', 'srplay'], tile: ['tlevels', 'tlplay'], day: ['dhome', 'dplay'], idle: [], color: [], quiz: [] };
const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(APPS);
const URL = {};
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const a of want) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 780 } }), p = await ctx.newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto('http://localhost:8765/games/' + (URL[a] || a + '/index.html') + '?story=1'); await p.waitForTimeout(1800);
    const pro = await p.evaluate(() => !!document.querySelector('.tale-ov .caption') && !!document.querySelector('.tale-skip'));
    ok(pro, a + ' 프롤로그 컷 + 건너뛰기'); await p.screenshot({ path: `notes/snapshots/story_${a}_prologue.png` });
    await p.click('.tale-skip'); await p.waitForTimeout(500);
    ok(await p.evaluate(() => !document.querySelector('.tale-ov')), a + ' 건너뛰기로 프롤로그 닫힘');
    await p.reload(); await p.waitForTimeout(1500); ok(await p.evaluate(() => !document.querySelector('.tale-ov')), a + ' 두 번째 실행엔 프롤로그 없음');
    const mid = await p.evaluate(() => { const T = GF.tale; if (!T.ready) return -1; T.force = true; const c = T.d.chapters['1']; if (!c) { T.play(T.d.prologue.slice(1), document.getElementById('safe'), () => {}); return 1; } const m = c.mid[0]; T.reset(); T.after(1, m.after, T.d.per, document.getElementById('safe'), () => {}); return m.after; });
    await p.waitForTimeout(900); ok(mid > 0 && await p.evaluate(() => !!document.querySelector('.tale-ov .caption')), a + ' 장 중간(승) 컷'); await p.screenshot({ path: `notes/snapshots/story_${a}_mid.png` });
    ok(errs.length === 0, a + ' 오류 없음 ' + errs[0]); await ctx.close();
  }
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
