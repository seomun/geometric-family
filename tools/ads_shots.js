// 보상형 광고 자리(테스트 모드) 점검·캡처: node tools/ads_shots.js → notes/snapshots/ads_<앱>_{offer,test}.png + ads_sheet.png
// 성인 7앱: ① 광고 꺼짐이면 자리가 안 보임(원래 안내) ② 켠 테스트 모드에서 「광고 보고 …」 정직 표기 ③ 괜찮아요 = 불이익 0 ④ 끝까지 보면 보상 ⑤ 광고를 못 불러오면 그냥 지급 ⑥ 한도(하루 5회) ⑦ 유아 앱은 항상 차단
const { chromium } = require('playwright-core'), path = require('path');
const B = 'http://localhost:8765/games/', OUT = path.join(__dirname, '..', 'notes', 'snapshots');
const APPS = [
  ['② 식탁', 'idle', 'idle/index.html', async (p) => { await p.evaluate(() => { IDLE.debug.buy('n_dad'); IDLE.debug.awayHours(5); IDLE.debug.reloadOffline(); GF.stack = []; GF.go('itable'); }); await p.waitForTimeout(900); return 'idle'; }],
  ['③ 합치기', 'merge', 'merge/index.html', async (p) => { await p.evaluate(() => { MERGE.unlockAll = true; GF.stack = []; GF.go('mhome'); GF.go('mplay', { n: 3 }); }); await p.waitForTimeout(900); await p.evaluate(() => MERGE.debug.adOffer()); return 'ok'; }],
  ['⑤ 어느 도형', 'quiz', 'quiz/index.html', async (p) => { await p.evaluate(() => { const D = QUIZ.debug.D(), t = D.tests[0]; const SV = QUIZ.debug.SV(); SV.res[t.id] = { f: 'nemo', s: 0, cnt: { nemo: 5, semo: 2, dong: 1 } }; GF.stack = []; GF.go('qhome'); GF.go('qresult', { id: t.id }); }); await p.waitForTimeout(900); return 'quizbtn'; }],
  ['⑥ 다른 그림', 'spot', 'spot/index.html', async (p) => { await p.evaluate(() => { SPOT.unlockAll = true; SPOT.fast = true; GF.stack = []; GF.go('phome'); GF.go('pplay', { n: 3 }); }); await p.waitForTimeout(900); await p.evaluate(() => SPOT.debug.adOffer()); await p.waitForTimeout(1200); return 'result'; }],
  ['⑦ 블록', 'block', 'block/index.html', async (p) => { await p.evaluate(() => { BLOCK.unlockAll = true; GF.stack = []; GF.go('bhome'); GF.go('bplay', { n: 3 }); }); await p.waitForTimeout(900); await p.evaluate(() => BLOCK.debug.adOffer()); return 'ok'; }],
  ['⑧ 정리', 'sort', 'sort/index.html', async (p) => { await p.evaluate(() => { SORT.unlockAll = true; GF.stack = []; GF.go('shome'); GF.go('splay', { n: 3 }); }); await p.waitForTimeout(900); await p.evaluate(() => SORT.debug.adOffer()); return 'ok'; }],
  ['⑨ 짝 맞추기', 'tile', 'tile/index.html', async (p) => { await p.evaluate(() => { TILE.unlockAll = true; GF.stack = []; GF.go('thome'); GF.go('tplay', { n: 3 }); }); await p.waitForTimeout(900); await p.evaluate(() => TILE.debug.adOffer()); return 'ok'; }],
];
const inSafe = async (p) => p.evaluate(() => { const sf = document.getElementById('safe').getBoundingClientRect(); return [...document.querySelectorAll('.uk-sheet .uk-btn, .uk-sheet')].filter((e) => e.offsetParent).filter((e) => { const r = e.getBoundingClientRect(); return r.left < sf.left - 1 || r.right > sf.right + 1 || r.top < sf.top - 1 || r.bottom > sf.bottom + 1; }).length; });
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const [name, key, url, go] of APPS) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 780 } }), p = await ctx.newPage(), errs = [];
    await p.addInitScript(() => { window.__noResume = true; });
    p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
    await p.goto(B + url); await p.waitForTimeout(2000); await p.mouse.click(195, 400).catch(() => {}); await p.waitForTimeout(700);
    // 꺼짐(기본): 자리가 보이지 않는다
    await p.evaluate(() => { GF.ads.config.enabled = false; });
    const kind = await go(p);
    const offBtn = await p.evaluate(() => /광고 보고/.test(document.body.innerText)); ok(!offBtn, name + ' 광고 꺼짐이면 「광고 보고」 문구 없음');
    await p.evaluate(() => { document.querySelectorAll('.uk-scrim').forEach((x) => x.remove()); });
    // 켬(테스트 모드)
    await p.evaluate(() => { GF.ads.config.enabled = true; GF.ads.config.test = true; });
    await go(p);
    await p.waitForTimeout(500);
    let txt = await p.evaluate(() => document.body.innerText);
    if (kind === 'quizbtn') { ok(/광고 보고 카드에 스티커/.test(txt), name + ' 결과 카드 버튼 「광고 보고 카드에 스티커」'); await p.screenshot({ path: path.join(OUT, `ads_${key}_offer.png`) }); await p.evaluate(() => QUIZ.debug.adCard()); await p.waitForTimeout(500); await p.screenshot({ path: path.join(OUT, `ads_${key}_test.png`) }); await p.evaluate(() => document.querySelectorAll('.uk-sheet .acts .uk-btn')[1].click()); }
    else if (kind === 'idle') { ok(/광고 보고 2배 받기/.test(txt), name + ' 다녀오셨어요 팝업의 「광고 보고 2배 받기」'); await p.screenshot({ path: path.join(OUT, `ads_${key}_offer.png`) }); await p.click('.uk-sheet .acts .uk-btn >> nth=1'); await p.waitForTimeout(500); await p.screenshot({ path: path.join(OUT, `ads_${key}_test.png`) }); }
    else if (kind === 'result') { ok(/광고 보고 힌트 쓴 것 지우기/.test(txt), name + ' 결과의 「광고 보고 힌트 쓴 것 지우기」'); await p.screenshot({ path: path.join(OUT, `ads_${key}_offer.png`) }); await p.click('.uk-sheet .acts .uk-btn >> nth=0'); await p.waitForTimeout(500); await p.screenshot({ path: path.join(OUT, `ads_${key}_test.png`) }); }
    else {
      ok(/광고 보고 /.test(txt) && /안 봐도 괜찮아요/.test(txt), name + ' 「광고 보고 …」 + 「안 봐도 괜찮아요」 정직 표기');
      ok((await inSafe(p)) === 0, name + ' 팝업이 화면 안에 있음');
      await p.screenshot({ path: path.join(OUT, `ads_${key}_offer.png`) });
      // 괜찮아요 = 아무 일 없음
      await p.click('.uk-sheet .acts .uk-btn >> nth=1'); await p.waitForTimeout(300); ok(await p.evaluate(() => !document.querySelector('.uk-sheet')), name + ' 「괜찮아요」 로 닫힘(보상·불이익 없음)');
      // 광고 보기 → 테스트 광고 → 끝까지 → 보상 팝업 닫힘
      await p.evaluate((k) => window[({ sort: 'SORT', tile: 'TILE', block: 'BLOCK', merge: 'MERGE' })[k]].debug.adOffer(), key); await p.waitForTimeout(300); await p.click('.uk-sheet .acts .uk-btn >> nth=0'); await p.waitForTimeout(500);
      ok(await p.evaluate(() => !!document.querySelector('.uk-sheet [data-adtest], [data-adtest]')), name + ' 테스트 광고 팝업'); ok((await inSafe(p)) === 0, name + ' 테스트 광고 팝업이 화면 안에 있음(위로 밀리지 않음)'); await p.screenshot({ path: path.join(OUT, `ads_${key}_test.png`) });
    }
    // 광고를 못 불러오면 보상을 그냥 지급: 테스트 모드 끄고(네이티브 없음) 켜진 상태
    const free = await p.evaluate(() => { document.querySelectorAll('.uk-scrim').forEach((x) => x.remove()); GF.ads.config.test = false; let g = 0; GF.ads.run({ placement: 'x', onReward: () => { g++; } }); return g; }); ok(free === 1, name + ' 광고를 못 불러오면 보상을 그냥 지급');
    // 한도 5회
    const cap = await p.evaluate(() => { document.querySelectorAll('.uk-scrim').forEach((x) => x.remove()); GF.ads.config.test = true; localStorage.setItem('gf:ads:daily', JSON.stringify({ d: (() => { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); })(), r: 5, i: 0 })); return [GF.ads.eligible(), GF.ads.offer({ ask: 'x' })]; }); ok(cap[0] === false && cap[1] === false, name + ' 하루 5회를 넘으면 자리가 사라짐');
    ok(errs.length === 0, name + ' 콘솔 오류 없음 ' + errs.slice(0, 2).join('|'));
    await ctx.close();
  }
  // 유아 앱 차단
  for (const [name, url] of [['① 놀이터', 'index.html'], ['④ 색칠북', 'color/index.html'], ['⑩ 막둥이의 하루', 'day/index.html']]) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 780 } }), p = await ctx.newPage(); await p.goto(B + url); await p.waitForTimeout(1800);
    ok(await p.evaluate(() => { GF.ads.config.enabled = true; return !GF.ads.eligible() && !GF.ads.available('rewarded') && GF.ads.offer({ ask: 'x' }) === false && GF.ads.run({ onReward: () => {} }) === false; }), name + ' 유아 앱은 어떤 설정이어도 광고 차단'); await ctx.close();
  }
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
