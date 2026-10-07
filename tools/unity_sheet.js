// 통일성 캡처: 5앱 × (홈·결과·집) 을 한 장에. node tools/unity_sheet.js  (서버 8765, 저장소 루트) → notes/snapshots/unity_5x3_raw_*.png 15장 + python 으로 합침
const { chromium } = require('playwright-core');
const path = require('path'), fs = require('fs');
const OUT = path.resolve(__dirname, '..', 'notes', 'snapshots'); const B = 'http://localhost:8765/games/';
const APPS = [
  ['1', 'index.html', 'khouse'], ['2', 'idle/index.html', 'ihouse'], ['3', 'merge/index.html', 'mhouse'], ['4', 'color/index.html', 'chouse'], ['5', 'quiz/index.html', 'qhouse'], ['7', 'block/index.html', 'bhouse'], ['6', 'spot/index.html', 'phouse'], ['9', 'tile/index.html', 'thouse'], ['8', 'sort/index.html', 'shouse'], ['10', 'day/index.html', 'dhouse'],
];
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const [n, url, house] of APPS) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 780 } }); const p = await ctx.newPage(); p.on('pageerror', (e) => console.log('PAGEERR', n, e.message));
    await p.goto(B + url); await p.waitForTimeout(1800);
    await p.screenshot({ path: path.join(OUT, `unity_${n}_a_home.png`) });
    await p.evaluate(() => { const top = GF.stack[GF.stack.length - 1], el = GF.screens[top.name].el; UK.result({ title: '클리어!', stars: 3, chips: [{ icon: 'home', text: '집에 놓기' }], parent: el, onNext: () => {}, nextText: '다음', onRetry: () => {} }); });
    await p.waitForTimeout(1500); await p.screenshot({ path: path.join(OUT, `unity_${n}_b_result.png`) });
    await p.evaluate((h) => { GF.stack = []; GF.go(h); }, house); await p.waitForTimeout(1500);
    await p.screenshot({ path: path.join(OUT, `unity_${n}_c_house.png`) });
    await ctx.close();
  }
  await b.close();
})();
