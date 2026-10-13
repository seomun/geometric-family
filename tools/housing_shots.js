// 우리 집 캡처: node tools/housing_shots.js before|after → notes/snapshots/housing_<tag>_<앱>_<장면>.png (before: 1.0 화면 · after: Room 2.0 — 집 메인·할 일·카탈로그·놓기 모드·집에 놓기 카드·다음 목표 띠·유아판)
const { chromium } = require('playwright-core'); const tag = process.argv[2] || 'after';
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const open = async (a) => { const ctx = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 1 }), p = await ctx.newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message)); await p.addInitScript(() => { window.__noResume = true; }); await p.goto('http://localhost:8765/games/' + a + '/index.html'); await p.waitForTimeout(1600); return [ctx, p, errs]; };
  const shot = async (p, n, a) => { await p.waitForTimeout(900); await p.screenshot({ path: `notes/snapshots/housing_${tag}_${a}_${n}.png` }); };
  const clean = (p) => p.evaluate(() => document.querySelectorAll('.uk-scrim,.tale-ov,.uk-toast,.uk-confetti').forEach((e) => e.remove()));
  for (const [a, scr, grant, home] of [['merge', 'mhouse', ['b_sofa', 'b_table', 'a_frame', 'p_rice', 'u_fridge'], 'mhome'], ['day', 'dhouse', ['y_cup', 'k_train', 'w_frame'], 'dhome']]) {
    const [ctx, p, errs] = await open(a);
    await p.evaluate(([s, g]) => { g.forEach((id) => Room.grant(id)); GF.stack = []; GF.go(s); }, [scr, grant]); await p.waitForTimeout(1200); await clean(p); await shot(p, '1_house', a);
    if (tag === 'after') {
      await p.evaluate(() => { const l = document.querySelector('.h2-line'); l && l.click(); }); await shot(p, '2_tasks', a);
      await p.evaluate(() => { const l = document.querySelector('.h2-handle'); l && l.click(); });
      await p.evaluate(() => { const t = document.querySelectorAll('.h2-fb')[1]; t && t.click(); }); await p.waitForTimeout(500); await p.evaluate(() => { const t = document.querySelectorAll('.h2-tab')[1]; t && t.click(); }); await shot(p, '3_catalog', a);
      await p.evaluate(() => { const c = document.querySelectorAll('.h2-card.off')[2]; c && c.click(); }); await p.evaluate(() => { const t = document.querySelectorAll('.h2-tab')[0]; t && t.click(); }); await p.evaluate(() => { const c = document.querySelectorAll('.h2-card.off')[3]; c && c.click(); }); await shot(p, '4_catalog_sel', a); await clean(p);
      await p.evaluate(() => { const t = document.querySelectorAll('.h2-fb')[2]; t && t.click(); }); await shot(p, '5_place', a);
      await p.evaluate(() => { const t = document.querySelectorAll('.h2-fb')[2]; t && t.click(); });
      await p.evaluate(() => { const c = document.querySelector('.h2-dreamchip'); c && c.click(); }); await shot(p, '8_dream', a); await clean(p);
      await p.evaluate(([id]) => { Room.dropCard(id, document.getElementById('safe'), () => {}, {}); }, [a === 'merge' ? 'b_lamp' : 'y_paste']); await shot(p, '6_drop', a); await clean(p);
      await p.evaluate((h) => { GF.stack = []; GF.go(h); }, home); await p.waitForTimeout(800); await clean(p); await shot(p, '7_home_band', a);
    }
    if (tag === 'after') {   // 밀도·겹침: 방마다 가구를 많이 얻은 모습(주방/욕실)
      const more = a === 'merge' ? ['t_bowl', 'u_fridge', 'p_rice', 'p_kimchi', 'u_sidedish', 'p_mix', 'p_lunch', 'b_drawer', 'u_shelf', 'b_rug', 'b_plant', 'g_cushion'] : ['y_paste', 'y_soap', 'y_towel', 'y_hanger', 'y_mat', 'y_duck', 'y_pillow', 'y_quilt', 'y_toybox', 'k_party'];
      await p.evaluate((ids) => { GF.stack = []; ids.forEach((id) => Room.grant(id)); GF.go(a === 'x' ? 'x' : (document.querySelector('.screen.on') ? 'mhome' : 'mhome')); }, more).catch(() => {});
      await p.evaluate(([s]) => { GF.stack = []; GF.go(s); }, [scr]); await p.waitForTimeout(1200); await clean(p);
      await shot(p, '9_dense_a', a);
      await p.evaluate(() => { const n = document.querySelectorAll('.h2-ar')[1]; n && n.click(); }); await shot(p, '9_dense_b', a);
      await p.evaluate(() => { const n = document.querySelectorAll('.h2-ar')[1]; n && n.click(); }); await shot(p, '9_dense_c', a);
    }
    console.log(a, 'errors', errs.length ? errs[0] : 0); await ctx.close();
  }
  await b.close(); console.log('ok');
})();
