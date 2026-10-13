// C3 시험: 시즌 판 — 웹툰 시즌 7(설·어버이날·여름·추석·수능·김장·연말) + 봄이 모든 달을 덮고, 시즌마다 판이 만들어지는지. node tools/season_check.js
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const APPS = [['merge', 'MERGE'], ['block', 'BLOCK'], ['spot', 'SPOT'], ['sort', 'SORT'], ['tile', 'TILE']];
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const [a, NS] of APPS) {
    const p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message)); await p.addInitScript(() => { window.__noResume = true; });
    await p.goto('http://localhost:8765/games/' + a + '/index.html'); await p.waitForTimeout(1500);
    const r = await p.evaluate((ns) => { const X = window[ns].debug.X(), S = X.seasons, cov = {}; for (let m = 1; m <= 12; m++) cov[m] = S.filter((s) => s.months.includes(m)).map((s) => s.id); const gen = S.map((s) => { try { const L = window[ns].debug.seasonLevel(s); return { id: s.id, ok: !!L && !!(L.type || L.goal || L.n || L.id || L.kind), kind: L && L.kind }; } catch (e) { return { id: s.id, ok: false, err: String(e) }; } }); return { n: S.length, empty: Object.keys(cov).filter((m) => !cov[m].length), gen, ids: S.map((s) => s.id), titles: S.map((s) => s.title) }; }, NS);
    ok(r.n >= 8 && r.empty.length === 0, `${a}: 시즌 ${r.n}개가 12개월을 모두 덮음 (빈 달 ${r.empty.join(',') || '없음'})`); ok(r.gen.every((g) => g.ok), `${a}: 시즌마다 판 생성 ${JSON.stringify(r.gen.filter((g) => !g.ok))}`);
    const has = (re) => r.titles.some((t) => re.test(t)); ok(has(/설/) && has(/어버이|카네이션/) && has(/여름/) && has(/추석/) && has(/수능/) && has(/김장/) && has(/연말/), `${a}: 웹툰 시즌 7종 제목 포함`); ok(errs.length === 0, `${a}: 오류 없음 ${errs[0] || ''}`); await p.close();
  }
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
