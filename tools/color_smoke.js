// 막둥이 색칠북 smoke: node tools/color_smoke.js (URL=… 로 빌드본). 모든 페이지를 열고 완성까지 실제 조작/디버그로 재생, 종류별 캡처.
const { chromium } = require('playwright-core'), path = require('path');
const URL = process.env.URL || 'http://localhost:8765/games/color/index.html';
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const pg = await (await b.newContext({ viewport: { width: 412, height: 915 }, hasTouch: true })).newPage(), errs = [];
  pg.on('pageerror', (e) => errs.push(e.message)); pg.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await pg.goto(URL); await pg.waitForSelector('.cl-cards', { timeout: 10000 });
  const shot = async (n) => { await pg.waitForTimeout(500); await pg.screenshot({ path: path.join(__dirname, '..', 'notes', 'snapshots', '2026-10-07_color_' + n + '.png') }); };
  await shot('home');
  const pages = await pg.evaluate(() => COLOR.debug.D().pages.map((p) => ({ id: p.id, type: p.type })));
  ok(pages.length >= 60, '페이지 ' + pages.length + '개(60+): ' + JSON.stringify(pages.reduce((o, p) => (o[p.type] = (o[p.type] || 0) + 1, o), {})));
  await pg.evaluate(() => GF.go('cbook')); await pg.waitForSelector('.cl-th'); await shot('book');
  const seen = {};
  for (const p of pages) {
    const route = { trace: 'ctrace', sticker: 'csticker', wall: 'cwall' }[p.type] || 'cpaint';
    await pg.evaluate(([r, id]) => { GF.stack = []; GF.go('chome'); GF.go(r, { id, skipStory: true }); }, [route, p.id]); await pg.waitForTimeout(150);
    if (p.type === 'webtoon' && !seen.w) { seen.w = 1; await pg.evaluate(([id]) => { GF.stack = []; GF.go('chome'); GF.go('cpaint', { id }); }, [p.id]); await pg.waitForTimeout(600); await shot('webtoon_story'); await pg.evaluate(([id]) => { GF.stack = []; GF.go('chome'); GF.go('cpaint', { id, skipStory: true }); }, [p.id]); await pg.waitForTimeout(200); }
    if (!seen[p.type]) { seen[p.type] = 1; await shot('play_' + p.type); }
    if (p.type === 'trace') { await pg.evaluate(() => COLOR.debug.traceAll()); await pg.waitForFunction(() => !!document.querySelector('.screen.on .cl-art [data-r]'), null, { timeout: 4000 }).catch(() => {}); await pg.evaluate(() => COLOR.debug.fillAll()); }
    else if (p.type === 'sticker') await pg.evaluate(() => COLOR.debug.addStickers());
    else if (p.type === 'wall') await pg.evaluate(() => COLOR.debug.wallDone());
    else await pg.evaluate(() => COLOR.debug.fillAll());
    const good = p.type === 'wall' ? await pg.waitForSelector('.screen.on .rm-room', { timeout: 3000 }).then(() => true).catch(() => false) : await pg.waitForSelector('.screen.on .cl-hang', { timeout: 3000 }).then(() => true).catch(() => false);
    if (!good) ok(false, '완성 흐름 ' + p.id); else if (p.type === 'free' && !seen.hang) { seen.hang = 1; await shot('hang'); }
  }
  const wall = await pg.evaluate(() => ({ hung: Room.placedIn('kid').filter((x) => x.img && !x.drawer).length, drawer: Room.placedIn('kid').filter((x) => x.img && x.drawer).length })); ok(wall.hung === 6 && wall.drawer === pages.filter((q) => q.type !== 'wall').length - 6, '벽 액자 최대 6 + 서랍 ' + wall.drawer + ' (벽 ' + wall.hung + ')');
  const st = await pg.evaluate(() => ({ done: Object.keys(COLOR.debug.SV().done).length, frames: Room.placedIn('kid').filter((x) => x.img).length, items: Room.owned().length }));
  ok(st.done === pages.length, '모든 페이지 완성 ' + st.done + '/' + pages.length + ' · 액자 ' + st.frames + ' · 아이템 ' + st.items);
  await pg.evaluate(() => { GF.stack = []; GF.go('chome'); GF.go('chouse'); }); await pg.waitForSelector('.screen.on .rm-room'); await shot('house');
  await pg.evaluate(() => { const b = document.querySelector('.screen.on .uk-sheet .uk-btn'); b && b.click(); }); await pg.waitForTimeout(300); await pg.click('.screen.on .tb-x, .screen.on .uk-round.gold').catch(() => {}); await pg.waitForSelector('.screen.on .cl-dr .cl-th', { timeout: 4000 }).catch(async () => { await shot('drawer_fail'); }); await shot('drawer');
  ok(errs.length === 0, '콘솔 오류 없음 ' + errs.slice(0, 3).join(' | '));
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
