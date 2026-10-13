// 10앱 저사양 첫 진입 점검(C7): node tools/perf_check.js [배율=4] — CPU 를 늦춰(기본 4배) 설치 직후 홈이 뜨는 시간을 단언하고(앱마다 상한), 빌드본 HTML 크기 상한도 본다
const { chromium } = require('playwright-core'); const fs = require('fs');
const RATE = +process.argv[2] || 4; let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const APPS = [['합치기', 'merge', 'merge.html', 3000], ['어느 도형', 'quiz', 'quiz.html', 3000], ['블록', 'block', 'block.html', 3000], ['틀린 그림', 'spot', 'spot.html', 3500], ['짝 맞추기', 'tile', 'tile.html', 3000], ['정리', 'sort', 'sort.html', 3000], ['막둥이의 하루', 'day', 'day.html', 3000], ['색칠북', 'color', 'color.html', 3000], ['세 가족 식탁', 'idle', 'idle.html', 3000], ['놀이터', '', 'index.html', 4000]];
const SIZE_MAX = { 'index.html': 7.5, 'spot.html': 3.2 };      // MB — 나머지는 2.5MB
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const [nm, path, html, max] of APPS) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 780 } }), p = await ctx.newPage(), c = await ctx.newCDPSession(p), errs = []; p.on('pageerror', (e) => errs.push(e.message)); await c.send('Emulation.setCPUThrottlingRate', { rate: RATE });
    await p.addInitScript(() => { window.__noResume = true; }); const t0 = Date.now(); await p.goto('http://localhost:8765/games/' + (path ? path + '/' : '') + 'index.html'); let home = null; for (let i = 0; i < 200 && !home; i++) { await p.waitForTimeout(50); home = await p.evaluate(() => (window.GF && GF.cur ? GF.cur.name : null)); }
    const t = Date.now() - t0; ok(!!home && t <= max, `${nm}: CPU ${RATE}배 느리게 홈 ${t}ms (≤${max}) · ${home}`); ok(errs.length === 0, `${nm}: 오류 없음 ${errs[0] || ''}`); await ctx.close();
    const f = 'games/app/' + html; if (fs.existsSync(f)) { const mb = fs.statSync(f).size / 1e6, lim = SIZE_MAX[html] || 2.5; ok(mb <= lim, `${nm}: 빌드본 ${mb.toFixed(2)}MB (≤${lim}MB)`); }
  }
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
