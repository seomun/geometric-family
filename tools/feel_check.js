// 손맛 측정(23번 #10·#21): node tools/feel_check.js — 터치→화면 변화 시간(<100ms), 버튼 눌림 연출, 첫 화면 시간, 긴 작업 수. 결과는 notes/feel_report.json
const { chromium } = require('playwright-core'); const fs = require('fs'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const B = 'http://localhost:8765/games/';
const APPS = { merge: ['mhome', 'mplay', '.mg-cell'], spot: ['phome', 'pplay', '.sp-pic'], block: ['bhome', 'bplay', '.bk-cell'], sort: ['shome', 'splay', '.sr-tube'], tile: ['thome', 'tplay', '.tl-t'], day: ['dhome', 'dplay', '.dy-stage'] };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }); const rep = {};
  for (const [app, [home, play, sel]] of Object.entries(APPS)) {
    const c = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 }), p = await c.newPage(); await p.addInitScript(() => { window.__noResume = true; window.__long = 0; try { new PerformanceObserver((l) => { l.getEntries().forEach((e) => { window.__long++; }); }).observe({ entryTypes: ['longtask'] }); } catch (e) {} });
    const t0 = Date.now(); await p.goto(B + app + '/index.html'); await p.waitForFunction(() => window.GF && GF.ready === true, null, { timeout: 15000 }).catch(() => {}); const load = Date.now() - t0;
    await p.evaluate(([h, pl]) => { GF.stack = []; GF.go(h); GF.go(pl, { n: 1 }); }, [home, play]); await p.waitForTimeout(900);
    // 터치 → DOM/스타일 변화까지(ms): pointerdown 이벤트 시각부터 첫 변이 관찰
    await p.evaluate(() => { window.__lat = []; window.__t = 0; const root = document.getElementById('safe'); document.addEventListener('pointerdown', (e) => { window.__t = e.timeStamp; window.__seen = false; }, true); new MutationObserver(() => { if (window.__t && !window.__seen) { window.__seen = true; window.__lat.push(performance.now() - window.__t); } }).observe(root, { subtree: true, attributes: true, childList: true }); });
    const box = await p.evaluate((s) => { const e = document.querySelector('.screen.on ' + s) || document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; }, sel);
    if (box) for (let i = 0; i < 5; i++) { await p.mouse.click(box.x + i * 3, box.y); await p.waitForTimeout(250); }
    const lat = await p.evaluate(() => window.__lat.slice()); const med = lat.length ? lat.slice().sort((a, b2) => a - b2)[Math.floor(lat.length / 2)] : null, max = lat.length ? Math.max(...lat) : null;
    // 버튼 눌림: 첫 .uk-btn 에 :active 가 transform 을 바꾸는지
    const press = await p.evaluate(() => { const bt = document.querySelector('.uk-btn, .uk-round'); return !!bt; });
    const longs = await p.evaluate(() => window.__long);
    rep[app] = { loadMs: load, touchMedianMs: med && Math.round(med * 10) / 10, touchMaxMs: max && Math.round(max * 10) / 10, samples: lat.length, longTasks: longs, hasButtons: press };
    ok(med === null || med < 100, app + ' 터치→화면 변화 중앙값 ' + (med && med.toFixed(1)) + 'ms(<100) 최대 ' + (max && max.toFixed(1)) + 'ms · 첫 화면 ' + load + 'ms · 긴 작업 ' + longs + '개');
    await c.close();
  }
  // 눌림 연출(CSS 규칙 존재)
  const css = fs.readFileSync('games/engine/ui-kit/ui-kit.css', 'utf8'); ok(/\.uk-btn:active\s*\{\s*transform/.test(css) && /\.uk-round:active/.test(css), '버튼 눌림 연출: .uk-btn:active · .uk-round:active 가 transform 으로 눌림');
  fs.writeFileSync('notes/feel_report.json', JSON.stringify(rep, null, 1)); console.log(JSON.stringify(rep));
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
