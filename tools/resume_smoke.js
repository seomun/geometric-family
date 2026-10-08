// 판 이어하기·별 더 모으기 배너 점검: node tools/resume_smoke.js  (⑧ sort · ⑨ tile · ⑦ block)
const { chromium } = require('playwright-core');
const B = 'http://localhost:8765/games/';
const APPS = [
  { n: '⑧ 정리', url: 'sort/index.html', G: 'SORT', go: 'splay', home: 'shome', lv: 'slevels', move: `const L = SORT.debug.level(); SORT.debug.tap(L.solution[0][0]); SORT.debug.tap(L.solution[0][1]);`, count: 'SORT.debug.state().moves', key: 'gf:sort:resume' },
  { n: '⑨ 짝 맞추기', url: 'tile/index.html', G: 'TILE', go: 'tplay', home: 'thome', lv: 'tlevels', move: `const L = TILE.debug.level(); TILE.debug.press(L.solution[0]);`, count: 'TILE.debug.state().presses', key: 'gf:tile:resume' },
  { n: '⑦ 블록', url: 'block/index.html', G: 'BLOCK', go: 'bplay', home: 'bhome', lv: 'blevels', move: `const L = BLOCK.debug.level(), m = L.solution[0]; BLOCK.debug.place(m[0], m[1], m[2]);`, count: 'BLOCK.debug.state().used', key: 'gf:block:resume' },
];
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const a of APPS) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 780 } }), p = await ctx.newPage(), errs = [];
    p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
    await p.goto(B + a.url); await p.waitForTimeout(2200); await p.mouse.click(195, 400).catch(() => {}); await p.waitForTimeout(800);
    await p.evaluate(([G, go, home]) => { window[G].unlockAll = true; window[G].fast = true; GF.stack = []; GF.go(home); GF.go(go, { n: 4 }); }, [a.G, a.go, a.home]); await p.waitForTimeout(900);
    await p.evaluate(a.move); await p.waitForTimeout(900);
    const c1 = await p.evaluate((e) => eval(e), a.count); ok(c1 >= 1, a.n + ' 한 수 둠(' + c1 + ')');
    ok(await p.evaluate((k) => !!localStorage.getItem(k), a.key), a.n + ' 이어하기 저장됨');
    await p.reload(); await p.waitForTimeout(2200); await p.mouse.click(195, 400).catch(() => {}); await p.waitForTimeout(800);
    await p.evaluate(([G, go, home]) => { window[G].unlockAll = true; window[G].fast = true; GF.stack = []; GF.go(home); GF.go(go, { n: 4 }); }, [a.G, a.go, a.home]); await p.waitForTimeout(1000);
    const c2 = await p.evaluate((e) => eval(e), a.count); ok(c2 === c1, a.n + ' 앱을 다시 켜도 하던 상태(' + c2 + ')');
    await p.evaluate(([G, go, home]) => { GF.stack = []; GF.go(home); GF.go(go, { n: 5 }); }, [a.G, a.go, a.home]); await p.waitForTimeout(700);
    ok((await p.evaluate((e) => eval(e), a.count)) === 0, a.n + ' 다른 판은 새로 시작');
    // 별 더 모으기 배너
    await p.evaluate(([G, lv, home]) => { const SV = window[G].debug.SV(); SV.stars = { 1: 3, 2: 1, 3: 2 }; GF.stack = []; GF.go(home); GF.go(lv); }, [a.G, a.lv, a.home]); await p.waitForTimeout(700);
    const txt = await p.$eval('.screen.on .xt-retry .uk-btn', (e) => e.textContent.trim()).catch(() => null); ok(!!txt && /2판/.test(txt), a.n + ' 별 더 모으기 배너: ' + txt);
    ok(errs.length === 0, a.n + ' 콘솔 오류 없음 ' + errs.slice(0, 2).join('|'));
    await ctx.close();
  }
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
