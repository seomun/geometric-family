// 우리 집 테마 세트 4종(A25, 성인) 시험: node tools/housing_theme.js
// 데이터(4세트×5개·레벨 4/9/14/19·한 줄 이야기·스타일) · 레벨이 되면 세트가 한 번만 자동 도착(앨범·토스트) · 모이면 그 방에서 가족 장면 · 유아 집엔 없음 · 도착 때 가구가 겹치지 않음
const { chromium } = require('playwright-core'); const fs = require('fs');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const H = JSON.parse(fs.readFileSync('data/housing.json', 'utf8')), R = JSON.parse(fs.readFileSync('data/room_items.json', 'utf8')), byid = Object.fromEntries(R.items.map((i) => [i.id, i]));
  ok(H.themeSets.length === 4 && H.themeSets.every((t) => t.items.length === 5 && t.items.every((id) => byid[id] && byid[id].set === t.id && byid[id].line && byid[id].line.length >= 10)), '데이터: 테마 세트 4종 × 5개, 가구마다 한 줄 이야기');
  ok(H.themeSets.map((t) => t.lv).join() === '4,9,14,19', '도착 레벨 4·9·14·19(방이 열린 뒤)'); ok(H.themeSets.every((t) => { const r = H.rooms.find((x) => x.id === t.room); return r && (H.unlockLv.adult[t.room] || 1) <= t.lv; }), '세트의 방은 도착 레벨에 이미 열려 있음');
  ok(['warm', 'wood', 'wood', 'cool'].every((s, i) => H.themeSets[i].items.every((id) => byid[id].style === s)), '세트별 스타일(따뜻·나무·나무·시원)');
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { window.__noResume = true; }); await p.goto('http://localhost:8765/games/merge/index.html'); await p.waitForTimeout(1700);
  await p.evaluate(() => { Room.S.album = []; Room.S.theme = null; window.__lvOrig = Room.level; });
  const r0 = await p.evaluate(() => { Room.level = () => 3; return Room.themeSync().length; }); ok(r0 === 0, '레벨 3: 아직 도착 없음');
  const r1 = await p.evaluate(() => { Room.level = () => 4; const g = Room.themeSync(); return { n: g.length, id: g[0] && g[0].id, own: Room.themeSets()[0].items.every((id) => Room.has(id)), other: Room.themeSets()[1].items.some((id) => Room.has(id)), album: Room.S.album.filter((a) => a.kind === 'theme').length }; });
  ok(r1.n === 1 && r1.id === 'theme_cafe' && r1.own && !r1.other, '레벨 4: 카페 거실 세트 5개 도착(다른 세트는 아직)'); ok(r1.album === 1, '앨범에 새 세트 기록');
  const r2 = await p.evaluate(() => ({ again: Room.themeSync().length, scenes: Room.scenesFor('nemo').some((c) => c.set === 'theme_cafe'), placed: (Room.placedIn('nemo') || []).filter((q) => q.id.startsWith('th_cafe_')).length }));
  ok(r2.again === 0, '한 번만 도착(다시 확인해도 중복 없음)'); ok(r2.scenes, '세트를 모으면 거실에서 가족 장면(칩)'); ok(r2.placed >= 1, '도착한 가구가 방에 놓임(' + r2.placed + '개)');
  const r3 = await p.evaluate(() => { Room.level = () => 19; const g = Room.themeSync(); const all = Room.themeSets().every((t) => t.items.every((id) => Room.has(id))); return { n: g.length, all, scenes: ['nemo', 'dong', 'yard', 'semo'].map((r) => Room.scenesFor(r).filter((c) => /^theme_/.test(c.set)).length) }; });
  ok(r3.n === 3 && r3.all, '레벨 19: 나머지 3세트 도착 · 모두 보유'); ok(r3.scenes.every((n) => n >= 1), '네 방 모두에 세트 장면 · ' + r3.scenes.join('/'));
  const dup = await p.evaluate(() => { const bad = []; ['nemo', 'dong', 'yard', 'semo'].forEach((rid) => { const L = Room.placedIn(rid) || []; for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) { const a = L[i], b2 = L[j], ia = Room.item(a.id), ib = Room.item(b2.id); if (!ia || !ib) continue; const ox = Math.min(a.x + ia.w, b2.x + ib.w) - Math.max(a.x, b2.x), oy = Math.min(a.y + ia.h, b2.y + ib.h) - Math.max(a.y, b2.y); if (ox > 0 && oy > 0 && ox * oy > 0.6 * Math.min(ia.w * ia.h, ib.w * ib.h)) bad.push(a.id + '/' + b2.id); } }); return bad; });
  ok(dup.length === 0, '도착한 가구가 서로 심하게 겹치지 않음 ' + dup.slice(0, 3).join(','));
  ok(await p.evaluate(() => { const m = Room.cfg.mode; Room.cfg.mode = 'kid'; const n = Room.themeSets().length; Room.cfg.mode = m; return n === 0; }), '유아 집엔 테마 세트 없음(D12)');
  await p.evaluate(() => { Room.level = window.__lvOrig; });
  ok(errs.length === 0, '오류 없음 ' + (errs[0] || '')); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
