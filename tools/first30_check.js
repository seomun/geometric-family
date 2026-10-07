// 첫 실행 30초 점검: node tools/first30_check.js (서버 8765). 새 저장소에서 앱을 열어 "첫 판이 시작될 때까지 누른 횟수"를 세고 2탭 이하인지, 손가락 안내가 있는지 확인한다.
const { chromium } = require('playwright-core');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const APPS = [
  ['① 놀이터', 'index.html', ['.homeplay'], () => !!document.querySelector('.screen.on .playarea')],
  ['② 세 가족 식탁', 'idle/index.html', ['.tcard[data-t=nemo]', '.screen.on .grow .buy'], () => !!document.querySelector('.screen.on .grow .buy')],
  ['③ 도형 합치기', 'merge/index.html', ['.screen.on .mg-btns .uk-btn'], () => !!document.querySelector('.screen.on .mg-board')],
  ['④ 색칠북', 'color/index.html', ['.screen.on .cl-card', '.screen.on .cl-th'], () => !!document.querySelector('.screen.on .cl-art')],
  ['⑦ 도형 블록', 'block/index.html', ['.screen.on .bk-btns .uk-btn'], () => !!document.querySelector('.screen.on .bk-board')],
  ['⑤ 어느 도형', 'quiz/index.html', ['.screen.on .qz-go .uk-btn'], () => !!document.querySelector('.screen.on .qz-opt')],
];
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const [name, url, taps, ready] of APPS) {
    const p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.goto('http://localhost:8765/games/' + (process.env.BUILT ? 'app/' : '') + url); await p.waitForTimeout(2000);
    const finger0 = await p.evaluate(() => document.querySelectorAll('.uk-finger').length);
    let n = 0; for (const s of taps) { await p.waitForSelector(s, { timeout: 5000 }); await p.click(s, { force: true }); n++; await p.waitForTimeout(900); }
    const go = await p.evaluate(ready);
    ok(go && n <= 2, name + ' — 첫 판까지 ' + n + '탭' + (go ? '' : ' (시작 안 됨)') + ' · 첫 화면 손가락 ' + (finger0 ? '있음' : '없음') + (errs.length ? ' · 오류 ' + errs[0] : ''));
    ok(finger0 >= 1, name + ' — 첫 실행 손가락 안내');
    await p.context().close();
  }
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
