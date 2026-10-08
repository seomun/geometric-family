// 큰 글씨 켠 성인 앱 7종의 홈·첫 판 캡처(글자 넘침 육안 점검): node tools/big_shots.js → notes/snapshots/big_<앱>_<화면>.png, 글자 잘림 후보도 출력
const { chromium } = require('playwright-core'), path = require('path');
const APPS = [['idle', 'idle/index.html', ['itable']], ['merge', 'merge/index.html', ['mhome', ['mplay', { n: 5 }]]], ['quiz', 'quiz/index.html', ['qhome', 'qtests']], ['spot', 'spot/index.html', ['phome', ['pplay', { n: 5 }]]], ['block', 'block/index.html', ['bhome', ['bplay', { n: 5 }]]], ['sort', 'sort/index.html', ['shome', ['splay', { n: 5 }]]], ['tile', 'tile/index.html', ['thome', ['tplay', { n: 5 }]]]];
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }); let clip = 0;
  for (const [nm, url, screens] of APPS) {
    const pg = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(); await pg.goto('http://localhost:8765/games/' + url); await pg.waitForTimeout(1800); await pg.mouse.click(195, 400).catch(() => {}); await pg.waitForTimeout(700);
    await pg.evaluate(() => { GF.state.settings.big = 1; document.documentElement.dataset.big = '1'; window.__noResume = true; });
    let i = 0;
    for (const sc of screens) {
      const [name, params] = Array.isArray(sc) ? sc : [sc]; await pg.evaluate(([n, p]) => { for (const k of ['MERGE', 'SPOT', 'BLOCK', 'SORT', 'TILE']) if (window[k]) { window[k].unlockAll = true; window[k].fast = true; } GF.stack = []; GF.go(n, p || {}); }, [name, params]); await pg.waitForTimeout(900);
      const bad = await pg.evaluate(() => [...document.querySelectorAll('.screen.on *')].filter((e) => e.offsetParent && e.children.length === 0 && e.textContent.trim().length > 1 && getComputedStyle(e).overflow !== 'visible' && e.scrollWidth > e.clientWidth + 2).map((e) => e.className + ':' + e.textContent.trim().slice(0, 14)));
      if (bad.length) { clip += bad.length; console.log('CLIP', nm, name, JSON.stringify(bad.slice(0, 4))); }
      await pg.screenshot({ path: path.join(__dirname, '..', 'notes', 'snapshots', `big_${nm}_${i++}.png`) });
    }
    await pg.close();
  }
  console.log(clip ? 'CLIP ' + clip : 'no clipped text'); await b.close();
})();
