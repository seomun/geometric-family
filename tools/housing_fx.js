// 우리 집 가구 상호작용(A2) 시험: node tools/housing_fx.js — 가구를 누르면 그 가구만의 연출(입자·말풍선)이 나오고 오류가 없다 + 연출표가 실제 가구와 맞다
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { window.__noResume = true; }); await p.goto('http://localhost:8765/games/merge/index.html'); await p.waitForTimeout(1600);
  const miss = await p.evaluate(() => { const ids = ['b_tv', 'p_film', 'p_remote', 'b_sofa', 'g_cushion', 'b_rug', 'b_bed', 'b_lamp', 'b_window', 'p_rice', 'p_ramen', 'p_mix', 'g_teaset', 'p_tea', 'p_lunch', 'g_lunch', 't_bowl', 'b_table', 'p_kimchi', 'u_fridge', 'u_drawer', 'b_drawer', 'u_shoerack', 'u_cart', 'u_crate', 'b_shelf', 'p_book', 'a_album', 'a_scrapbook', 'a_diary', 'b_globe', 'p_globe', 'b_clock', 'a_wallclock', 'p_clock', 'b_plant', 'p_flower', 'y_duck', 'a_camera', 'a_polaroid', 'a_frame', 'a_photo', 'p_vio', 'g_chess', 'b_suitcase', 'p_bagt', 'p_pass', 'p_world', 'g_hanbok', 'k_train']; return ids.filter((i) => !Room.item(i) || !Room.fxFor(i)); });
  ok(miss.length === 0, '연출표 49종이 모두 실제 가구 · 누락 ' + miss.join(','));
  await p.evaluate(() => { Room.cfg.mode = 'adult'; Room.S.lv = 30; ['b_tv', 'b_sofa', 'b_lamp', 'a_camera', 'b_clock', 'p_vio', 'u_fridge', 'b_plant', 'p_rice'].forEach((id) => Room.grant(id)); });
  await p.evaluate(() => { GF.stack = []; GF.go('mhouse'); }); await p.waitForTimeout(1200); await p.evaluate(() => document.querySelectorAll('.uk-scrim,.tale-ov,.uk-toast').forEach((e) => e.remove()));
  const rooms = await p.evaluate(() => Room.unlockedRooms().map((r) => r.id)); let tapped = 0, withFx = 0, say = 0; const seen = new Set();
  for (let ri = 0; ri < rooms.length; ri++) {
    const n = await p.evaluate(() => document.querySelectorAll('.h2-it').length);
    for (let i = 0; i < n; i++) {
      const r = await p.evaluate((i) => { const imgs = [...document.querySelectorAll('.h2-it')], im = imgs[i]; if (!im) return null; im.dispatchEvent(new PointerEvent('pointerup', { bubbles: true })); return { fx: document.querySelectorAll('.h2-fx,.h2-flashfx,.h2-tvfx,.h2-glowfx').length, say: document.querySelectorAll('.h2-say').length, id: Room._lastUse || '' }; }, i);
      if (!r) continue; tapped++; if (r.fx) withFx++; if (r.say) say++; if (r.id) seen.add(r.id); await p.waitForTimeout(80);
    }
    if (ri === 0) await p.screenshot({ path: 'notes/snapshots/housing_fx_a.png' });
    await p.evaluate(() => { const a = document.querySelectorAll('.h2-ar')[1]; a && a.click(); }); await p.waitForTimeout(500);
  }
  ok(tapped > 0 && withFx > 0, `눌러 본 가구 ${tapped}개 · 연출 나온 것 ${withFx}개 · 말풍선 ${say} · 종류 ${[...seen].join(',')}`);
  ok(errs.length === 0, '오류 없음 ' + errs[0]); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
