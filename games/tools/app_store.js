// ③④⑤ 스토어 스크린샷 원본 6장: node games/tools/app_store.js <merge|color|quiz>  (서버 python -m http.server 8765 @ repo root)
// → games/store/shots_<app>/raw/phone_N_*.png → APP=<app> python games/tools/frame_shots.py 로 액자
const { chromium } = require('playwright-core');
const path = require('path'), fs = require('fs');
const app = process.argv[2]; const URLS = { merge: 'merge/index.html', color: 'color/index.html', quiz: 'quiz/index.html', block: 'block/index.html', spot: 'spot/index.html', tile: 'tile/index.html', sort: 'sort/index.html' };
const RAW = path.resolve(__dirname, '..', 'store', 'shots_' + app, 'raw'); fs.mkdirSync(RAW, { recursive: true });
const wait = (p, ms) => p.waitForTimeout(ms);
const SCENES = {
  async merge(p, shot) {
    await p.waitForSelector('.mg-btns'); await wait(p, 900); await shot('1_home');
    await p.evaluate(() => { GF.go('mlevels'); }); await p.waitForSelector('.mg-lv'); await wait(p, 600); await shot('2_levels');
    await p.evaluate(() => { MERGE.unlockAll = true; GF.stack = []; GF.go('mhome'); GF.go('mplay', { n: 9 }); }); await p.waitForSelector('.mg-board'); await wait(p, 600);
    const L = await p.evaluate(() => MERGE.debug.level()); for (const i of L.solution.slice(0, Math.max(2, (L.solution.length / 2) | 0))) { await p.evaluate((i) => MERGE.debug.place(i), i); await p.waitForFunction(() => !MERGE.debug.busy(), null, { timeout: 5000 }).catch(() => {}); }
    await wait(p, 500); await shot('3_play');
    // 풀이를 끝까지 재생해 결과 시트
    await p.evaluate(() => { GF.stack = []; GF.go('mhome'); GF.go('mplay', { n: 12 }); }); await p.waitForSelector('.mg-board'); await wait(p, 400);
    const L3 = await p.evaluate(() => MERGE.debug.level()); for (const i of L3.solution) { await p.evaluate((i) => MERGE.debug.place(i), i); await p.waitForFunction(() => !MERGE.debug.busy() || !!document.querySelector('.screen.on .uk-sheet'), null, { timeout: 6000 }).catch(() => {}); if (await p.evaluate(() => !!document.querySelector('.screen.on .uk-sheet'))) break; }
    await p.waitForSelector('.screen.on .uk-sheet', { timeout: 6000 }).catch(() => {}); await wait(p, 900); await shot('4_clear');
    await p.evaluate(() => { GF.stack = []; GF.go('mhome'); GF.go('mtrio'); }); await wait(p, 900); await shot('5_trio');
    await p.evaluate(() => { ['b_sofa', 'b_shelf', 'b_window', 'b_table', 'b_lamp', 'b_rug'].forEach((id) => Room.item(id) && Room.grant(id)); Room.data.items.filter((i) => i.set === 'build').slice(0, 9).forEach((i) => Room.grant(i.id)); GF.stack = []; GF.go('mhome'); GF.go('mhouse'); }); await p.waitForSelector('.rm-room'); await wait(p, 900); await shot('6_house');
  },
  async color(p, shot) {
    await p.waitForSelector('.cl-cards'); await wait(p, 900); await shot('1_home');
    await p.evaluate(() => GF.go('cbook')); await p.waitForSelector('.cl-th'); await wait(p, 700); await shot('2_book');
    const pages = await p.evaluate(() => COLOR.debug.D().pages.map((q) => ({ id: q.id, type: q.type })));
    const first = pages.find((q) => q.type !== 'trace' && q.type !== 'sticker' && q.type !== 'wall' && q.type !== 'webtoon') || pages[0];
    await p.evaluate((id) => { GF.stack = []; GF.go('chome'); GF.go('cpaint', { id, skipStory: true }); }, first.id); await wait(p, 900);
    const sw = await p.$$('.screen.on .cl-sw, .screen.on .cl-pal button'); void sw;
    await p.evaluate(() => COLOR.debug.fillAll && 0); await wait(p, 300); await shot('3_paint');
    await p.evaluate(() => COLOR.debug.fillAll()); await p.waitForSelector('.screen.on .cl-hang', { timeout: 4000 }).catch(() => {}); await wait(p, 900); await shot('4_done');
    const st = pages.find((q) => q.type === 'sticker'); if (st) { await p.evaluate((id) => { GF.stack = []; GF.go('chome'); GF.go('csticker', { id, skipStory: true }); }, st.id); await wait(p, 900); await p.evaluate(() => COLOR.debug.addStickers()); await wait(p, 800); }
    await shot('5_sticker');
    await p.evaluate(() => { pages_done = 1; }).catch(() => {}); await p.evaluate(() => { GF.stack = []; GF.go('chome'); GF.go('chouse'); }); await p.waitForSelector('.rm-room'); await wait(p, 900); await shot('6_house');
  },
  async block(p, shot) {
    await p.waitForSelector('.bk-btns'); await wait(p, 900); await shot('1_home');
    await p.evaluate(() => { GF.go('blevels'); }); await p.waitForSelector('.bk-l'); await wait(p, 600); await shot('2_levels');
    await p.evaluate(() => { BLOCK.unlockAll = true; GF.stack = []; GF.go('bhome'); GF.go('bplay', { n: 8 }); }); await p.waitForSelector('.bk-board'); await wait(p, 600);
    const L = await p.evaluate(() => BLOCK.debug.level()); for (const m of L.solution.slice(0, Math.max(3, (L.solution.length * 0.55) | 0))) { await p.evaluate((mm) => BLOCK.debug.place(mm[0], mm[1], mm[2]), m); await p.waitForFunction(() => !BLOCK.debug.busy(), null, { timeout: 5000 }).catch(() => {}); await wait(p, 120); }
    await wait(p, 500); await shot('3_play');
    await p.evaluate(() => { GF.stack = []; GF.go('bhome'); GF.go('bplay', { n: 10 }); BLOCK.fast = true; }); await p.waitForSelector('.bk-board'); await wait(p, 400);
    const L2 = await p.evaluate(() => BLOCK.debug.level()); for (const m of L2.solution) { await p.evaluate((mm) => BLOCK.debug.place(mm[0], mm[1], mm[2]), m); await p.waitForFunction(() => !BLOCK.debug.busy() || !!document.querySelector('.screen.on .uk-sheet, .screen.on .nextbtn'), null, { timeout: 6000 }).catch(() => {}); if (await p.evaluate(() => !!document.querySelector('.screen.on .uk-sheet, .screen.on .nextbtn'))) break; }
    await wait(p, 900); await shot('4_story');
    for (let g = 0; g < 8; g++) { if (await p.evaluate(() => !!document.querySelector('.screen.on .uk-sheet'))) break; const nb = await p.$('.screen.on .nextbtn'); if (nb) await nb.click({ force: true }).catch(() => {}); await wait(p, 400); }
    await wait(p, 800); await shot('5_clear');
    await p.evaluate(() => { Object.values(BLOCK.debug.REW).slice(0, 7).forEach((id) => Room.grant(id)); GF.stack = []; GF.go('bhome'); GF.go('bhouse'); }); await p.waitForSelector('.rm-room'); await wait(p, 900); await shot('6_house');
  },
  async spot(p, shot) {
    await p.waitForSelector('.sp-btns'); await wait(p, 900); await shot('1_home');
    await p.evaluate(() => { GF.go('plevels'); }); await p.waitForSelector('.sp-l'); await wait(p, 600); await shot('2_levels');
    await p.evaluate(() => { SPOT.unlockAll = true; GF.stack = []; GF.go('phome'); GF.go('pplay', { n: 5 }); }); await p.waitForSelector('.sp-area'); await wait(p, 1500);
    const L = await p.evaluate(() => SPOT.debug.level()); for (const d of L.rounds[0].diffs.slice(0, 2)) { await p.evaluate(([x, y]) => SPOT.debug.tap(x, y), [d.x + d.w / 2, d.y + d.h / 2]); await wait(p, 250); }
    await wait(p, 4200); await shot('3_play');
    await p.evaluate(() => { GF.stack = []; GF.go('phome'); GF.go('pplay', { n: 6 }); }); await p.waitForSelector('.sp-area'); await wait(p, 4600); await shot('4_hidden');
    await p.evaluate(() => { GF.stack = []; GF.go('phome'); GF.go('pplay', { n: 10 }); SPOT.fast = true; }); await p.waitForSelector('.sp-area'); await wait(p, 400);
    const L2 = await p.evaluate(() => SPOT.debug.level()); for (const d of L2.rounds[0].diffs) { await p.evaluate(([x, y]) => SPOT.debug.tap(x, y), [d.x + d.w / 2, d.y + d.h / 2]); await wait(p, 120); }
    await wait(p, 900); await shot('5_story');
    await p.evaluate(() => { Object.values(SPOT.debug.REW).slice(0, 7).forEach((id) => Room.grant(id)); GF.stack = []; GF.go('phome'); GF.go('phouse'); }); await p.waitForSelector('.rm-room'); await wait(p, 900); await shot('6_house');
  },
  async tile(p, shot) {
    const play = async (n, k) => { await p.evaluate((nn) => { TILE.unlockAll = true; TILE.fast = true; GF.stack = []; GF.go('thome'); GF.go('tplay', { n: nn }); }, n); await p.waitForSelector('.tl-board'); await wait(p, 700); const L = await p.evaluate(() => TILE.debug.level()); for (const i of L.solution.slice(0, k)) { await p.evaluate((ii) => TILE.debug.press(ii), i); await wait(p, 160); } await wait(p, 500); };
    await p.waitForSelector('.tl-btns'); await wait(p, 900); await shot('1_home');
    await p.evaluate(() => { GF.go('tlevels'); }); await p.waitForSelector('.tl-l'); await wait(p, 600); await shot('2_levels');
    await play(4, 6); await shot('3_play'); await play(7, 5); await shot('4_lock'); await play(9, 4); await shot('5_trio');
    await p.evaluate(() => { Object.values(TILE.debug.REW).slice(0, 7).forEach((id) => Room.grant(id)); GF.stack = []; GF.go('thome'); GF.go('thouse'); }); await p.waitForSelector('.rm-room'); await wait(p, 900); await shot('6_house');
  },
  async sort(p, shot) {
    const play = async (n, k) => { await p.evaluate((nn) => { SORT.unlockAll = true; SORT.fast = true; GF.stack = []; GF.go('shome'); GF.go('splay', { n: nn }); }, n); await p.waitForSelector('.sr-tube'); await wait(p, 700); const L = await p.evaluate(() => SORT.debug.level()); for (const [a, b] of L.solution.slice(0, k)) { await p.evaluate(([x, y]) => { SORT.debug.tap(x); SORT.debug.tap(y); }, [a, b]); await wait(p, 160); } await wait(p, 500); };
    await p.waitForSelector('.sr-btns'); await wait(p, 900); await shot('1_home');
    await p.evaluate(() => { GF.go('slevels'); }); await p.waitForSelector('.sr-l'); await wait(p, 600); await shot('2_levels');
    await play(7, 3); await shot('3_play'); await play(9, 5); await shot('4_lock'); await play(11, 3); await shot('5_hidden');
    await p.evaluate(() => { Object.values(SORT.debug.REW).slice(0, 7).forEach((id) => Room.grant(id)); GF.stack = []; GF.go('shome'); GF.go('shouse'); }); await p.waitForSelector('.rm-room'); await wait(p, 900); await shot('6_house');
  },
  async quiz(p, shot) {
    await p.waitForSelector('.qz-grid'); await wait(p, 900); await shot('1_home');
    await p.evaluate(() => GF.go('qtests')); await p.waitForSelector('.qz-test'); await wait(p, 700); await shot('2_tests');
    const tests = await p.evaluate(() => QUIZ.debug.D().tests.map((t) => ({ id: t.id, n: t.qs.length })));
    await p.evaluate((id) => { GF.stack = []; GF.go('qhome'); GF.go('qplay', { id }); }, tests[0].id); await p.waitForSelector('.qz-opt'); await wait(p, 600);
    for (let q = 0; q < 2; q++) { await p.click('.screen.on .qz-opt >> nth=' + (q % 3), { force: true }); await wait(p, 250); } await wait(p, 600); await shot('3_question');
    for (let q = 2; q < tests[0].n; q++) { await p.click('.screen.on .qz-opt >> nth=' + (q % 3), { force: true }); await wait(p, 120); }
    await p.waitForSelector('.screen.on .qz-card img', { timeout: 5000 }).catch(() => {}); await wait(p, 900); await shot('4_result');
    await p.evaluate(() => { GF.stack = []; GF.go('qhome'); GF.go('qhouse'); }); await p.waitForSelector('.rm-room'); await wait(p, 900); await shot('5_house');
    await p.evaluate(() => { GF.stack = []; GF.go('qhome'); GF.go('qmini', { g: 4 }); }); await p.waitForSelector('.screen.on .qz-bal .uk-btn'); await wait(p, 800); await shot('6_mini');
  },
};
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const p = await (await b.newContext({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2, hasTouch: true })).newPage(); p.on('pageerror', (e) => console.log('PAGEERR', e.message));
  await p.goto('http://localhost:8765/games/' + URLS[app]); await wait(p, 1200);
  await SCENES[app](p, (n) => p.screenshot({ path: path.join(RAW, 'phone_' + n + '.png') }));
  await b.close(); console.log(app, 'shots ok');
})();
