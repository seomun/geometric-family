// 10앱 통일성 캡처: node tools/housing_homes.js → notes/snapshots/housing_u_<앱>_<장면>.png (홈 띠 · 집 메인 · 카탈로그 · 집에 놓기 카드) + 오류 점검
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const APPS = { merge: ['mhouse', 'b_sofa,b_table,a_frame'], spot: ['phouse', 'a_frame,a_photo,a_album'], block: ['bhouse', 'o_bricks,o_roof,o_chimney'], sort: ['shouse', 'u_box,u_basket,u_label'], tile: ['thouse', 'm_bench,m_flowerrow,m_jar'], idle: ['ihouse', 't_bowl,p_mix,p_lunch'], quiz: ['qhouse', 'n_plate,q_plate_nemo,q_game_1'], color: ['chouse', 'w_frame,w_frame_gold'], day: ['dhouse', 'y_cup,y_paste,y_hanger'], play: ['khouse', 'k_party,k_train,k_ch3'] };
const PAGE = { play: 'index.html' };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(APPS);
  for (const a of want) {
    const [scr, items] = APPS[a]; const ctx = await b.newContext({ viewport: { width: 390, height: 780 } }), p = await ctx.newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message)); await p.addInitScript(() => { window.__noResume = true; });
    await p.goto('http://localhost:8765/games/' + (PAGE[a] || a + '/index.html')); await p.waitForTimeout(1800);
    const clean = () => p.evaluate(() => document.querySelectorAll('.uk-scrim,.tale-ov,.uk-toast,.uk-confetti').forEach((e) => e.remove()));
    const shot = async (n) => { await p.waitForTimeout(900); await p.screenshot({ path: `notes/snapshots/housing_u_${a}_${n}.png` }); };
    await clean(); await shot('1_home');
    const band = await p.evaluate(() => !!document.querySelector('.screen.on .h2-band')); ok(band, a + ' 홈에 다음 목표 띠');
    await p.evaluate(([s, it]) => { it.split(',').forEach((id) => Room.grant(id)); GF.stack = []; GF.go(s); }, [scr, items]); await p.waitForTimeout(1500); await clean(); await shot('2_house');
    ok(await p.evaluate(() => !!document.querySelector('.screen.on .h2-room')) && await p.evaluate(() => document.querySelector('.screen.on .h2-room').getBoundingClientRect().height > 380), a + ' 집 화면: 방 크게');
    await p.evaluate(() => { const t = document.querySelectorAll('.h2-fb')[1]; t && t.click(); }); await shot('3_catalog'); await clean();
    await p.evaluate(([id]) => { Room.dropCard(id, document.getElementById('safe'), () => {}, {}); }, [items.split(',')[0]]); await shot('4_drop'); await clean();
    ok(errs.length === 0, a + ' 오류 없음 ' + errs[0]); await ctx.close();
  }
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
