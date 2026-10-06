// 기기 4종 스크린샷: node games/tools/devices.js  → notes/snapshots/game_dev_<기기>_<화면>.png
const { chromium } = require('playwright-core');
const path = require('path'), fs = require('fs');
const OUT = path.resolve(__dirname, '..', '..', 'notes', 'snapshots'); fs.mkdirSync(OUT, { recursive: true });
const URL = process.env.URL || 'http://localhost:8765/games/index.html';
const DEV = { s24: [412, 915], a: [384, 832], tabP: [800, 1280], tabL: [1280, 800] };
const wait = (p, ms) => p.waitForTimeout(ms);
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const [name, [w, h]] of Object.entries(DEV)) {
    const p = await (await b.newContext({ viewport: { width: w, height: h } })).newPage();
    const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    const shot = (n) => p.screenshot({ path: path.join(OUT, `game_dev_${name}_${n}.png`) });
    await p.goto(URL); await wait(p, 2600); await shot('home');
    await p.evaluate(() => { GF.state.seen.ch1 = 1; GF.go('book', { ch: 'ch1', part: 'pro', replay: true }); }); await wait(p, 700); await shot('book');
    await p.evaluate(() => { GF.stack = []; GF.go('home'); GF.Stage.start({ kind: 'story', ch: 'ch1', k: 1, id: 'c1B' }); }); await wait(p, 900); await shot('shadow');
    await p.evaluate(() => { GF.stack = []; GF.go('home'); GF.Stage.start({ kind: 'story', ch: 'ch2', k: 2, id: 'c2C' }); }); await wait(p, 900); await shot('faces');
    await p.evaluate(() => { GF.stack = []; GF.go('home'); GF.go('map'); }); await wait(p, 600); await shot('map');
    await p.evaluate(() => { GF.go('stages', { ch: 'ch1' }); }); await wait(p, 600); await shot('stages');
    for (const [tag, st] of [['puzzle', ['ch3', 2, 'c3C']], ['paint', ['ch4', 2, 'c4C']], ['shapes', ['ch5', 2, 'c5C']], ['shapes2', ['ch5', 1, 'c5B']]]) {
      await p.evaluate(([c, k, id]) => { GF.stack = []; GF.go('home'); GF.Stage.start({ kind: 'story', ch: c, k, id }); }, st); await wait(p, 1500); await shot(tag);
    }
    await p.evaluate(() => { GF.stack = []; GF.go('home'); GF.go('playroom'); }); await wait(p, 700); await shot('playroom');
    await p.evaluate(() => { GF.go('album'); }); await wait(p, 700); await shot('album');
    console.log(name, w + 'x' + h, errs.length ? 'ERR ' + errs.join('|') : 'ok');
    await p.close();
  }
  await b.close();
})();
