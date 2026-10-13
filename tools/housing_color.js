// 우리 집 가구 색 변형(A8) 시험: node tools/housing_color.js — 모은 가구가 늘수록 색이 열리고, 놓기 도구가 열린 색만 돌며, 코드·사진에 반영
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { window.__noResume = true; }); await p.goto('http://localhost:8765/games/merge/index.html'); await p.waitForTimeout(1600);
  const t0 = await p.evaluate(() => { Room.cfg.mode = 'adult'; const em = Room.data.items.find((i) => i.colors.length === 1 && i.slot === 'floor'), mc = Room.data.items.find((i) => i.colors.length >= 3); return { owned: Room.owned().length, emVars: Room.variants(em).length, mcVars: Room.variants(mc).length, em: em.id, mc: mc.id, open0: Room.variantOpen(0), open1: Room.variantOpen(1), need1: Room.variantNeed(1) }; });
  ok(t0.emVars === 4 && t0.mcVars >= 3, `변형 수: 한 색 그림 4(색조) · 여러 색 가구 ${t0.mcVars}`); ok(t0.open0 && !t0.open1 && t0.need1 > 0, `처음엔 첫 색만 열림(두 번째 색까지 가구 ${t0.need1}개 더)`);
  // 가구 모으기 → 열림
  const after = await p.evaluate(() => { const ids = Room.data.items.filter((i) => !Room.has(i.id) && !i.season && ((i.src || {}).game !== 'expedition')).slice(0, 70).map((i) => i.id); const r = []; [10, 30, 60].forEach((n) => { while (Room.owned().length < n && ids.length) Room.grant(ids.shift()); r.push([Room.owned().length, Room.variantOpen(1), Room.variantOpen(2), Room.variantOpen(3)]); }); return r; });
  ok(after[0][1] && !after[0][2] && !after[0][3] && after[1][2] && !after[1][3] && after[2][3], '가구 10·30·60개에서 2·3·4번째 색이 차례로 열림 ' + JSON.stringify(after.map((a) => a.slice(1))));
  // 놓기 도구: 열린 색 순환(잠긴 색은 건너뜀) + 화면 반영
  await p.evaluate(() => { Room.S.lv = 30; const id = 'b_sofa'; Room.grant(id); Room.placeAt(id); GF.stack = []; GF.go('mhouse'); }); await p.waitForTimeout(1200); await p.evaluate(() => document.querySelectorAll('.uk-scrim,.tale-ov,.uk-toast').forEach((e) => e.remove()));
  const cyc = await p.evaluate(() => { const rid = Object.keys(Room.S.placed).find((k) => Room.S.placed[k].some((q) => q.id === 'b_sofa')), q = Room.S.placed[rid].find((x) => x.id === 'b_sofa'), it = Room.item('b_sofa'), seq = []; let k = 0; for (let i = 0; i < 5; i++) { const j = Room.nextVariant(it, q); if (j == null) break; q.v = j; q.c = Room.variants(it)[j].c; seq.push(j); } return { seq, c: q.c, v: q.v }; });
  ok(cyc.seq.length === 5 && cyc.seq.every((j) => j >= 0 && j < 4), '색 순환: ' + cyc.seq);
  const em = await p.evaluate((id) => { const it = Room.item(id), pl = { v: 2 }; return Room.variantFilter(it, pl); }, t0.em); ok(/hue-rotate/.test(em), '한 색 그림은 색조 필터로 변형 ' + em);
  // 코드 왕복에 색 번호 보존
  const rt = await p.evaluate(() => { const rid = Object.keys(Room.S.placed).find((k) => Room.S.placed[k].some((q) => q.id === 'b_sofa')), q = Room.S.placed[rid].find((x) => x.id === 'b_sofa'); q.v = 2; q.c = Room.variants(Room.item('b_sofa'))[2].c; const d = Room.decodeLayout(Room.layoutCode(rid)); const back = d.list.find((x) => x.id === 'b_sofa'); return { v: back && back.v, c: back && back.c, want: q.c }; });
  ok(rt.v === 2 && rt.c === rt.want, '구경 코드에 색 번호가 들어가고 되살아남');
  // 카탈로그 색 점
  await p.evaluate(() => { [...document.querySelectorAll('.h2-fb')].find((x) => /카탈로그/.test(x.textContent)).click(); }); await p.waitForTimeout(500); await p.evaluate(() => { document.querySelector('.h2-card:not(.off)').click(); }); await p.waitForTimeout(400);
  ok(await p.evaluate(() => document.querySelectorAll('.h2-swrow .h2-sw').length >= 3 && /색 \d\/\d/.test(document.querySelector('.h2-swrow small').textContent)), '카탈로그 상세에 색 점 + 「색 N/M」'); await p.screenshot({ path: 'notes/snapshots/housing_color_catalog.png' });
  ok(errs.length === 0, '오류 없음 ' + errs[0]); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
