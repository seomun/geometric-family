// D22-1 새 판 종류 컷 점검: 각 앱의 「첫 판 종류가 아닌」 규칙마다 컷(미니 판) → 설명 카드(그림 한 장) 순서로 열리는지. node tools/tut_rules.js
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const a of (process.argv.slice(2).length ? process.argv.slice(2) : ['merge', 'spot', 'block', 'sort', 'tile', 'day', 'quiz', 'color', 'idle'])) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 780 } }), p = await ctx.newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message + ' @ ' + String(e.stack).split(String.fromCharCode(10)).slice(1, 3).join(' | ')));
    await p.addInitScript(() => { window.__noResume = true; });
    await p.goto('http://localhost:8765/games/' + a + '/index.html'); await p.waitForTimeout(1600);
    const types = await p.evaluate(() => { const T = GF.tale; T.force = true; return Object.keys(T.d.rules).filter((k) => T.d.rules[k].cuts); });
    let good = 0;
    for (const t of types) {
      const r = await p.evaluate(async (ty) => { const T = GF.tale, sf = document.getElementById('safe'); T.reset(); let closed = false; T.explain(ty, sf, () => { closed = true; });
        await new Promise((r) => setTimeout(r, 700)); const cut = !!sf.querySelector('.tale-ov .cut-mini');
        const nb = sf.querySelector('.tale-ov .nextbtn'); nb && nb.click(); await new Promise((r) => setTimeout(r, 900)); const card = !!document.querySelector('.uk-sheet .cut-mini.in-card');
        document.querySelectorAll('.uk-scrim,.tale-ov').forEach((e) => e.remove()); return { cut, card }; }, t);
      if (r.cut && r.card) good++; else console.log('  ', a, t, JSON.stringify(r));
    }
    ok(good === types.length && types.length > 0, a + ' 새 판 종류 ' + types.length + '개: 컷(미니) → 카드(그림)'); ok(errs.length === 0, a + ' 오류 없음 ' + errs[0]); await ctx.close();
  }
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
