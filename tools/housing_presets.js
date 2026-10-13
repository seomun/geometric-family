// 우리 집 테마 프리셋 시험: node tools/housing_presets.js — 가진 가구만 놓기 · 이미 다른 곳에 있어도 옮김 · 겹침 비켜 주기 · 되돌리기 · 화면(테마 시트·적용 결과) 캡처
const { chromium } = require('playwright-core');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), ctx = await b.newContext({ viewport: { width: 390, height: 780 } }), p = await ctx.newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { window.__noResume = true; }); await p.goto('http://localhost:8765/games/merge/index.html'); await p.waitForTimeout(1600);
  const dm = ['u_fridge', 'u_cart', 'b_table', 't_bowl', 'u_crate', 'u_sidedish', 'u_shelf', 'u_label', 'p_pack1', 'p_rice', 'p_kimchi', 'p_label', 'y_bowl', 'y_spoon', 'g_lunch', 'g_teaset', 'b_sofa', 'b_drawer', 'b_rug', 'a_frame'];
  await p.evaluate((ids) => { Room.cfg.mode = 'adult'; ids.forEach((id) => Room.grant(id)); }, dm);
  const lv = await p.evaluate(() => { Room.S.lv = 30; return { lv: Room.level(), open: Room.unlockedRooms().map((r) => r.id) }; }); ok(lv.open.includes('kitchen'), '주방이 열려 있음 ' + JSON.stringify(lv));
  const pr = await p.evaluate(() => Room.presets('kitchen').map((x) => x.id)); ok(pr.includes('p_hansik') && pr.includes('p_tea'), '주방 프리셋 2개: ' + pr);
  // 일부만 가진 상태: 한식 저녁상(밥그릇 y_bowl 등은 있고 b_table 도 있음) → 가진 것만
  await p.evaluate(() => { Room.cfg.mode = 'adult'; });
  const st = await p.evaluate(() => Room.presetStatus('p_hansik')); ok(st.have > 0 && st.have <= st.total, `상태 ${st.have}/${st.total}`);
  // 다른 방(거실)에 미리 놓아 둔 가구도 옮긴다 + 겹치는 다른 가구 비켜 주기
  await p.evaluate(() => { Room.removeEverywhere('b_table'); Room.placedIn('nemo').push({ id: 'b_table', x: 20, y: 300, flip: 0, c: '#F6C28B' }); Room.placedIn('kitchen').push({ id: 'b_sofa', x: 100, y: 300, flip: 0, c: '#F6C28B' }); Room.save(); });
  const r = await p.evaluate(() => Room.applyPreset('p_hansik')); ok(r.ok && r.have === r.total - r.missing.length, '적용: ' + JSON.stringify({ have: r.have, total: r.total, missing: r.missing.length, noRoom: r.noRoom }));
  const k = await p.evaluate(() => ({ kitchen: Room.placedIn('kitchen').map((q) => q.id), nemoHasTable: Room.placedIn('nemo').some((q) => q.id === 'b_table') }));
  ok(k.kitchen.includes('b_table') && !k.nemoHasTable, '식탁이 거실에서 주방으로 옮겨짐'); ok(['p_rice', 'p_kimchi', 'p_pack1'].every((i) => k.kitchen.includes(i)), '밥솥·김치·식탁보 소품이 올라감');
  const geom = await p.evaluate(() => { const L = Room.placedIn('kitchen'), t = L.find((q) => q.id === 'b_table'), tt = Room.item('b_table'), F = Room.H.sizeF[tt.cls]; const props = L.filter((q) => Room.item(q.id).slot === 'table' && ['p_rice', 'p_kimchi', 'p_pack1'].includes(q.id)); return { onTop: props.every((q) => q.x >= t.x - 6 && q.x <= t.x + tt.w * F), ys: props.map((q) => q.y), ty: t.y }; }); ok(geom.onTop, '소품이 식탁 윗면 안쪽에 놓임 ' + JSON.stringify(geom));
  const so = await p.evaluate(() => { const s = Room.placedIn('kitchen').find((q) => q.id === 'b_sofa'); const t = Room.placedIn('kitchen').find((q) => q.id === 'b_table'); if (!s) return 'gone'; const a = Room.item('b_sofa'), c = Room.item('b_table'), F = Room.H.sizeF; const A = { x: s.x, y: s.y, w: a.w * F[a.cls], h: a.h * F[a.cls] }, B = { x: t.x, y: t.y, w: c.w * F[c.cls], h: c.h * F[c.cls] }; const w = Math.max(0, Math.min(A.x + A.w, B.x + B.w) - Math.max(A.x, B.x)), h = Math.max(0, Math.min(A.y + A.h, B.y + B.h) - Math.max(A.y, B.y)); return w * h / (A.w * A.h); }); ok(so === 'gone' || so <= 0.35, '겹치던 소파는 비켜 줌 (겹침 ' + (so === 'gone' ? '-' : so.toFixed(2)) + ')');
  // 화면
  await p.evaluate(() => { GF.stack = []; GF.go('mhouse'); }); await p.waitForTimeout(1200); await p.evaluate(() => document.querySelectorAll('.uk-scrim,.tale-ov,.uk-toast').forEach((e) => e.remove()));
  await p.evaluate(() => { const n = [...document.querySelectorAll('.h2-nav button,.h2-nav .h2-ar,.h2-ar')]; });
  const shown = await p.evaluate(() => { const bts = [...document.querySelectorAll('.h2-fb')]; return bts.map((x) => x.textContent.trim()); }); ok(shown.some((t) => /테마/.test(t)), '도구 줄에 「테마」 버튼 ' + shown.join('|'));
  await p.evaluate(() => { [...document.querySelectorAll('.h2-fb')].find((x) => /테마/.test(x.textContent)).click(); }); await p.waitForTimeout(700); await p.screenshot({ path: 'notes/snapshots/housing_preset_sheet.png' });
  await p.evaluate(() => document.querySelectorAll('.uk-scrim').forEach((e) => e.remove())); await p.evaluate(() => { document.querySelectorAll('.h2-ar')[1] && document.querySelectorAll('.h2-ar')[1].click(); }); await p.waitForTimeout(900); await p.screenshot({ path: 'notes/snapshots/housing_preset_kitchen.png' });
  // 되돌리기
  const ud = await p.evaluate(() => { const before = JSON.stringify(Room.S.placed); Room.undoPreset(); return before !== JSON.stringify(Room.S.placed); }); ok(ud, '되돌리기가 이전 배치로 복원');
  // 가진 게 없으면 거절
  const none = await p.evaluate(() => Room.applyPreset('p_travel')); ok(none.error === 'none_owned' || none.error === 'locked', '가진 가구가 없으면 놓지 않음(' + none.error + ')');
  ok(errs.length === 0, '오류 없음 ' + errs[0]); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
