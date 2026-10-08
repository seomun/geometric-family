// 키트 버튼 글자 줄 꺾임 점검: node tools/btn_wrap_check.js — 앱 8종의 홈·첫 판·집에서 .uk-btn 글자가 두 줄 이상이거나 버튼 밖으로 넘치면 알린다
const { chromium } = require('playwright-core');
const APPS = [['② idle', 'idle/index.html', ['itable']], ['③ merge', 'merge/index.html', ['mhome', ['mplay', { n: 1 }], 'mtrio']], ['④ color', 'color/index.html', ['chome']], ['⑤ quiz', 'quiz/index.html', ['qhome', 'qtests', ['qresult', { id: '__first' }]]], ['⑥ spot', 'spot/index.html', ['phome', ['pplay', { n: 1 }], 'ptrio']], ['⑦ block', 'block/index.html', ['bhome', ['bplay', { n: 1 }], 'btrio']], ['⑨ tile', 'tile/index.html', ['thome', ['tplay', { n: 1 }], ['tplay', { n: 8 }], 'ttrio']], ['⑧ sort', 'sort/index.html', ['shome', ['splay', { n: 1 }], ['splay', { n: 9 }], 'strio']], ['⑩ day', 'day/index.html', ['dhome', 'dmap']]];
let bad = 0;
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const [nm, url, screens] of APPS) {
    const pg = await (await b.newContext({ viewport: { width: 360, height: 700 } })).newPage(); await pg.goto('http://localhost:8765/games/' + url + '?x'); await pg.waitForTimeout(1500);
    await pg.evaluate(() => { if (window.GF && GF.ads) { GF.ads.config.enabled = true; GF.ads.config.test = true; } });   // 광고 켠(테스트) 상태에서도 버튼 줄이 화면 안
    if (process.env.BIG) await pg.evaluate(() => { GF.state.settings.big = 1; document.documentElement.dataset.big = '1'; });   // BIG=1: 큰 글씨 켠 상태로 점검
    for (const sc of screens) {
      const [name, params] = Array.isArray(sc) ? sc : [sc]; await pg.evaluate(([n, p]) => { if (p && p.id === '__first' && window.QUIZ) { const D = QUIZ.debug.D(), t = D.tests[0]; QUIZ.debug.SV().res[t.id] = { f: 'nemo', s: 0, cnt: { nemo: 5, semo: 2, dong: 1 } }; p = { id: t.id }; } GF.stack = []; GF.go(n, p || {}); }, [name, params]); await pg.waitForTimeout(700);
      const r = await pg.evaluate(() => [...document.querySelectorAll('.screen.on .uk-btn')].filter((e) => e.offsetParent).map((e) => { const tw = document.createTreeWalker(e, NodeFilter.SHOW_TEXT), tops = new Set(); let right = 0, txt = ''; const small = (n) => n.parentElement && n.parentElement.closest('small, i'); while (tw.nextNode()) { const n = tw.currentNode; if (!n.textContent.trim() || small(n)) continue; txt += n.textContent.trim(); const rg = document.createRange(); rg.selectNodeContents(n); [...rg.getClientRects()].filter((q) => q.width > 2 && q.height > 4).forEach((q) => { tops.add(Math.round(q.top / 8)); right = Math.max(right, q.right); }); } const br = e.getBoundingClientRect(), sf = document.getElementById('safe').getBoundingClientRect(); return { t: txt.slice(0, 14), lines: tops.size, over: right > br.right + 1, out: br.left < sf.left - 1 || br.right > sf.right + 1 || br.top < sf.top - 1 || br.bottom > sf.bottom + 1 }; }).filter((x) => x.t && (x.lines > 1 || x.over || x.out)));
      if (r.length) { bad += r.length; console.log('FAIL', nm, name, JSON.stringify(r)); }
    }
  }
  // 순위표 시트(성인 점수형 앱): 글자·안내 줄이 잘리거나 화면 밖으로 나가면 실패(큰 글씨에서도)
  for (const [nm, url] of [['③ merge', 'merge/index.html'], ['⑥ spot', 'spot/index.html'], ['⑦ block', 'block/index.html'], ['⑧ sort', 'sort/index.html'], ['⑨ tile', 'tile/index.html']]) {
    const pg = await (await b.newContext({ viewport: { width: 360, height: 700 } })).newPage(); await pg.goto('http://localhost:8765/games/' + url + '?x'); await pg.waitForTimeout(1500);
    if (process.env.BIG) await pg.evaluate(() => { GF.state.settings.big = 1; document.documentElement.dataset.big = '1'; });
    for (const tab of ['day', 'week', 'mine']) { await pg.evaluate((t) => { document.querySelectorAll('.uk-scrim').forEach((x) => x.remove()); GF.rank.record('daily', 700); GF.rank.open('daily', t); }, tab); await pg.waitForTimeout(400);
      const r = await pg.evaluate(() => { const sf = document.getElementById('safe').getBoundingClientRect(), sh = document.querySelector('.rk-sheet'); if (!sh) return ['시트 없음']; const o = [], q = sh.getBoundingClientRect(); if (q.left < sf.left - 1 || q.right > sf.right + 1 || q.top < sf.top - 1 || q.bottom > sf.bottom + 1) o.push('시트 화면 밖'); [...sh.querySelectorAll('.rk-n, .rk-s, .rk-note, .rk-line, .rk-tab')].forEach((e) => { if (e.scrollWidth > e.clientWidth + 2 || e.scrollHeight > e.clientHeight + 2) o.push(e.className + ':' + e.textContent.trim().slice(0, 10)); }); const n = sh.querySelector('.rk-note'); if (n && n.getBoundingClientRect().height > parseFloat(getComputedStyle(n).lineHeight || 20) * 2.6) o.push('안내 줄 세 줄 이상'); return o; });
      if (r.length) { bad += r.length; console.log('FAIL', nm, '순위표 ' + tab, JSON.stringify(r)); } }
    await pg.close();
  }
  console.log(bad ? 'FAILED ' + bad : 'ALL PASS'); await b.close(); process.exit(bad ? 1 : 0);
})();
