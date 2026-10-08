// 당신은 어느 도형? smoke: node tools/quiz_smoke.js (URL=… 로 빌드본). 테스트 19종을 실제 클릭으로 끝까지, 미니게임 5종, 카드 저장, 집 연결.
const { chromium } = require('playwright-core'), path = require('path');
const URL = process.env.URL || 'http://localhost:8765/games/quiz/index.html';
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, hasTouch: true, acceptDownloads: true }), pg = await ctx.newPage(), errs = [];
  pg.on('pageerror', (e) => errs.push(e.message)); pg.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await pg.goto(URL); await pg.waitForSelector('.qz-grid', { timeout: 10000 });
  const shot = async (n) => { await pg.waitForTimeout(450); await pg.screenshot({ path: path.join(__dirname, '..', 'notes', 'snapshots', '2026-10-07_quiz_' + n + '.png') }); };
  await shot('home');
  const small = await pg.evaluate(() => { const o = []; document.querySelectorAll('.screen.on *').forEach((e) => { if (e.children.length === 0 && e.textContent.trim() && e.offsetParent) { const f = parseFloat(getComputedStyle(e).fontSize) * (e.closest('#safe').getBoundingClientRect().width / 360); if (f < 17.5) o.push(e.textContent.trim().slice(0, 8) + ':' + f.toFixed(1)); } }); return o; });
  ok(small.length === 0, '홈 글자 18px↑ ' + small.join(','));
  const tests = await pg.evaluate(() => QUIZ.debug.D().tests.map((t) => ({ id: t.id, n: t.qs.length })));
  ok(tests.length === 19 && tests.every((t) => t.n === 6), '테스트 ' + tests.length + '종 × ' + tests[0].n + '문항');
  await pg.evaluate(() => GF.go('qtests')); await pg.waitForSelector('.qz-test'); await shot('tests');
  const got = {};
  for (let k = 0; k < tests.length; k++) {
    await pg.evaluate((id) => { GF.stack = []; GF.go('qhome'); GF.go('qplay', { id }); }, tests[k].id); await pg.waitForSelector('.qz-opt');
    if (k === 0) await shot('play');
    for (let q = 0; q < tests[k].n; q++) { await pg.click('.screen.on .qz-opt >> nth=' + ((k + q) % 3), { force: true }); await pg.waitForTimeout(90); }
    await pg.waitForSelector('.screen.on .qz-card img', { timeout: 5000 }).catch(() => {}); const res = await pg.evaluate((id) => QUIZ.debug.SV().res[id], tests[k].id);
    ok(!!res, tests[k].id + ' 결과: ' + (res && (res.f + '/' + res.s)) + ' ' + JSON.stringify(res && res.cnt)); if (res) got[res.f + res.s] = 1;
    if (k === 0) await shot('result');
  }
  ok(Object.keys(got).length >= 3, '다양한 결과 ' + Object.keys(got).length + '종 나옴');
  // 카드 저장(이미지 생성)
  const size = await pg.evaluate(() => QUIZ.debug.savePNG()); ok(size > 5000, '결과 카드 PNG ' + size + ' bytes');
  const items = await pg.evaluate(() => ({ n: Room.owned().length, plates: Room.owned().filter((x) => x.startsWith('q_plate')).length, me: Room.me() })); ok(items.plates >= 1 && items.me, '문패·배지·내 도형이 집에 생김: ' + JSON.stringify(items));
  await pg.evaluate(() => { GF.stack = []; GF.go('qhome'); GF.go('qcard'); }); await pg.waitForSelector('.screen.on .qz-card img'); await shot('card');
  // 미니게임 5종: 실제 조작(3·4·5) + 반응·기억은 디버그 종료
  for (const g of [3, 4, 5]) { await pg.evaluate((g) => { GF.stack = []; GF.go('qhome'); GF.go('qmini', { g }); }, g); await pg.waitForSelector('.screen.on .qz-bal .uk-btn'); if (g === 4) await shot('mini4'); for (let i = 0; i < 8; i++) { const has = await pg.$('.screen.on .qz-bal .uk-btn'); if (!has) break; await pg.click('.screen.on .qz-bal .uk-btn >> nth=0', { force: true }); await pg.waitForTimeout(90); } ok(await pg.waitForSelector('.screen.on .uk-sheet', { timeout: 3000 }).then(() => true).catch(() => false), '미니게임 ' + g + ' 결과'); }
  await pg.evaluate(() => { GF.stack = []; GF.go('qhome'); GF.go('qmini', { g: 1 }); }); await pg.waitForSelector('.screen.on .qz-react'); await shot('mini1'); await pg.waitForSelector('.screen.on .qz-react.go', { timeout: 6000 }); for (let i = 0; i < 5; i++) { await pg.click('.screen.on .qz-react', { force: true }); await pg.waitForTimeout(150); if (i < 4) await pg.waitForSelector('.screen.on .qz-react.go', { timeout: 6000 }).catch(() => {}); } ok(await pg.waitForSelector('.screen.on .uk-sheet', { timeout: 3000 }).then(() => true).catch(() => false), '미니게임 1(반응) 5번 → 결과');
  await pg.evaluate(() => { GF.stack = []; GF.go('qhome'); GF.go('qmini', { g: 2 }); }); await pg.waitForSelector('.screen.on .qz-simon'); await shot('mini2'); await pg.evaluate(() => QUIZ.debug.memDone()); ok(await pg.waitForSelector('.screen.on .uk-sheet', { timeout: 3000 }).then(() => true).catch(() => false), '미니게임 2(기억) 결과');
  const trophies = await pg.evaluate(() => Room.owned().filter((x) => x.startsWith('q_game')).length); ok(trophies >= 3, '트로피 ' + trophies + '개 집에 생김');
  await pg.evaluate(() => { GF.stack = []; GF.go('qhome'); GF.go('qhouse'); }); await pg.waitForSelector('.screen.on .rm-room'); await shot('house');
  ok(errs.length === 0, '콘솔 오류 없음 ' + errs.slice(0, 3).join(' | '));
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
