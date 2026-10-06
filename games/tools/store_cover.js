// 책 표지 그림(코드)을 큰 그림으로 뽑는다: node games/tools/store_cover.js → games/store/cover_book1.png, cover_book2.png (1200×1600)
const { chromium } = require('playwright-core');
const path = require('path');
const OUT = path.resolve(__dirname, '..', 'store');
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const p = await (await b.newContext({ viewport: { width: 600, height: 800 }, deviceScaleFactor: 2 })).newPage();
  await p.goto(process.env.URL || 'http://localhost:8765/games/index.html'); await p.waitForTimeout(1200);
  for (const bk of [1, 2]) {
    await p.evaluate((bk) => {
      document.querySelectorAll('.tmpcover').forEach((e) => e.remove());
      const host = document.createElement('div'); host.className = 'tmpcover'; host.style.cssText = 'position:fixed;left:0;top:0;width:600px;height:800px;z-index:9999;background:#fff';
      document.body.appendChild(host); GF.cover(bk, host);
    }, bk);
    await p.waitForTimeout(500); await p.screenshot({ path: path.join(OUT, `cover_book${bk}.png`) });
  }
  await b.close(); console.log('covers ok');
})();
