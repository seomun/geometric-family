// 10앱 「첫 30초」 시험(C9): node tools/first30.js — 설치 직후(저장 없음) 홈이 뜨는 시간 · 첫 놀이까지 누르는 횟수(1번) · 눌러서 놀이/이야기 화면이 뜨는 시간 · 어른 앱은 첫 가구 목표 띠가 홈에 있음. 앱마다 상한을 단언(로컬 서버 기준, 실기기는 2~3배 여유로 보고 상한을 잡음)
const { chromium } = require('playwright-core');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const APPS = [   // [이름, 경로, 첫 놀이 선택자, 어른 앱?, 홈 상한(ms), 첫 놀이 상한(ms)]
  ['합치기', 'merge', '.uk-btn.block', 1, 2500, 2500], ['어느 도형', 'quiz', '.uk-btn.block', 1, 2500, 2500], ['블록', 'block', '.uk-btn.block', 1, 2500, 2500], ['틀린 그림', 'spot', '.uk-btn.block', 1, 2500, 2500],
  ['짝 맞추기', 'tile', '.uk-btn.block', 1, 2500, 2500], ['정리', 'sort', '.uk-btn.block', 1, 2500, 2500], ['막둥이의 하루', 'day', '.dy-card', 0, 2500, 2500], ['색칠북', 'color', '.cl-card', 0, 2500, 2500],
  ['세 가족 식탁', 'idle', '.tcard', 1, 2500, 2500], ['놀이터', '', '.homeplay', 0, 2500, 2500]];
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const [nm, path, sel, adult, homeMax, playMax] of APPS) {
    const p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
    const t0 = Date.now(); await p.goto('http://localhost:8765/games/' + (path ? path + '/' : '') + 'index.html'); let home = null; for (let i = 0; i < 40 && !home; i++) { await p.waitForTimeout(100); home = await p.evaluate(() => (window.GF && GF.cur ? GF.cur.name : null)); }
    const tHome = Date.now() - t0; ok(!!home && tHome <= homeMax, `${nm}: 설치 직후 홈 ${tHome}ms (≤${homeMax}) · ${home}`);
    await p.waitForTimeout(900); const btn = await p.$(sel); ok(!!btn, `${nm}: 홈에 첫 놀이 버튼`); if (!btn) { await p.context().close(); continue; }
    if (adult) ok(await p.evaluate(() => !!document.querySelector('.h2-band')) || path === 'idle', `${nm}: 홈에 첫 가구 목표 띠`);
    const t1 = Date.now(); await btn.evaluate((e) => e.click()); let cur = home; for (let i = 0; i < 40 && cur === home; i++) { await p.waitForTimeout(100); cur = await p.evaluate(() => (GF.cur ? GF.cur.name : null)); } const tPlay = Date.now() - t1;
    ok(cur !== home && tPlay <= playMax, `${nm}: 한 번 눌러 ${cur} 화면까지 ${tPlay}ms (≤${playMax}) · 누른 횟수 1`);
    ok(errs.length === 0, `${nm}: 오류 없음 ${errs[0] || ''}`); await p.context().close();
  }
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
