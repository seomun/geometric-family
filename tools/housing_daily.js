// 오늘의 집 한 장면(A14) 시험: node tools/housing_daily.js — 칩(안 본 날 점) · 눌러서 그 방으로 가 연출 · 앨범 기록 하루 한 번 · 놓친 날 벌 없음 · 유아 집엔 없음
const { chromium } = require('playwright-core');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), ctx = await b.newContext({ viewport: { width: 390, height: 780 } }), p = await ctx.newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { window.__noResume = true; }); await p.goto('http://localhost:8765/games/merge/index.html'); await p.waitForTimeout(1600);
  const clean = () => p.evaluate(() => document.querySelectorAll('.uk-scrim,.tale-ov,.uk-toast,.h2-reveal').forEach((e) => e.remove()));
  await p.evaluate(() => { Room.S.album = []; GF.stack = []; GF.go('mhouse'); }); await p.waitForTimeout(1300); await clean();
  ok(await p.evaluate(() => { const c = document.querySelector('.h2-daychip'); return !!c && c.classList.contains('new'); }), '「📅 오늘의 장면」 칩 + 안 본 날 점');
  await p.screenshot({ path: 'notes/snapshots/a14_chip.png' });
  const T = await p.evaluate(() => { const t = Room.dailyToday(); return { id: t.ev.id, room: t.ev.room, title: t.ev.title }; }); ok(!!T.id, '오늘의 장면 · ' + T.id + ' (' + T.room + ')');
  await p.click('.h2-daychip'); await p.waitForTimeout(1500);
  const m = await p.evaluate(() => ({ fam: document.querySelectorAll('.h2-fam').length, bn: (document.querySelector('.h2-scenebn') || {}).textContent, say: (document.querySelector('.h2-daycap') || {}).textContent, nav: document.querySelector('.h2-navname').textContent }));
  ok(m.fam >= 2, '가족이 나와서 연출 · ' + m.fam); ok(/오늘|📅/.test(m.bn || '') && (m.say || '').length > 3, '띠 + 장면 설명 · ' + m.bn + ' / ' + m.say); ok(await p.evaluate((room) => Room.H.rooms.find((r) => r.id === room).name && document.querySelector('.h2-navname').textContent.includes(Room.H.rooms.find((r) => r.id === room).name), T.room), '그 방으로 이동 · ' + m.nav);
  ok(await p.evaluate(() => [...document.querySelectorAll('.h2-dreamchip')].every((c) => getComputedStyle(c).visibility === 'hidden')), '재생 중엔 모든 칩이 숨음(앞줄 가족을 안 덮음)'); ok(await p.evaluate(() => document.querySelectorAll('.h2-sprop').length >= 2), '무대 소품이 그려짐(가구가 없어도) · ' + await p.evaluate(() => [...document.querySelectorAll('.h2-sprop')].map((e) => e.dataset.label).join(',')));
  ok(await p.evaluate(() => +getComputedStyle(document.querySelector('.h2-daycap')).zIndex > +getComputedStyle(document.querySelector('.h2-stage-bg')).zIndex), '장면 설명이 흐림막 위');
  await p.screenshot({ path: 'notes/snapshots/a14_play.png' }); await p.waitForTimeout(1800); await p.screenshot({ path: 'notes/snapshots/a14_play2.png' });
  await p.waitForTimeout(6200); await clean();
  ok(await p.evaluate(() => !document.querySelector('.h2-fam') && !document.querySelector('.h2-room').classList.contains('scene')), '끝나면 가족이 돌아가고 방이 원래대로');
  ok(await p.evaluate(() => (Room.S.album || []).filter((a) => a.kind === 'day').length === 1 && !document.querySelector('.h2-daychip').classList.contains('new')), '앨범에 기록 1 · 점이 사라짐');
  await p.click('.h2-daychip'); await p.waitForTimeout(8000); await clean(); ok(await p.evaluate(() => (Room.S.album || []).filter((a) => a.kind === 'day').length === 1), '다시 봐도 기록은 하루 한 번');
  // 문구에 나온 물건이 화면에 있음: 일곱 장면 모두 must 단어가 문구에 나오고 무대 소품 이름에도 있음
  const chk = await p.evaluate(() => { const bad = []; Room.dailyEvents().forEach((e) => { const txt = e.beats.map((b) => b[1]).join(' ') + ' ' + e.title, labels = (e.props || []).map((q) => q[1]); (e.must || []).forEach((w) => { if (!txt.includes(w.replace(/ 바구니/, '')) && !txt.includes(w)) bad.push(e.id + ':문구에 ' + w + ' 없음'); if (!labels.includes(w)) bad.push(e.id + ':소품에 ' + w + ' 없음'); }); if (!(e.props || []).length) bad.push(e.id + ':소품 없음'); }); return bad; }); ok(chk.length === 0, '장면 문구에 나온 물건이 무대 소품으로 있음 · ' + chk.join(','));
  // 다른 날: 장면이 바뀔 수 있고, 안 본 날은 점이 다시 붙으며 놓친 날의 벌은 없음
  const nx = await p.evaluate(() => { Room._date = new Date(Date.now() + 86400000 * 3); const t = Room.dailyToday(); Room._date = null; return { seen: t.seen, id: t.ev.id }; }); ok(nx.seen === false, '다른 날은 다시 새 장면(점) · ' + nx.id);
  const ids = await p.evaluate(() => { const s = new Set(); for (let i = 0; i < 14; i++) { Room._date = new Date(Date.now() + 86400000 * i); s.add(Room.dailyToday().ev.id); } Room._date = null; return [...s]; }); ok(ids.length >= 2, '처음엔 거실 장면 2가지가 번갈아 · ' + ids.join(','));
  const ids2 = await p.evaluate(() => { Room.data.items.filter((i) => !['kid', 'daybath', 'wall', 'story_k', 'kseason', 'kgift'].includes(i.set)).forEach((i) => Room.grant(i.id)); const s = new Set(); for (let i = 0; i < 14; i++) { Room._date = new Date(Date.now() + 86400000 * i); s.add(Room.dailyToday().ev.id); } Room._date = null; return [...s]; }); ok(ids2.length >= 5, '방이 열릴수록 장면이 늘어 2주에 5가지 이상 · ' + ids2.join(','));
  // 유아 집엔 없음
  await p.goto('http://localhost:8765/games/index.html'); await p.waitForTimeout(1500); await p.evaluate(() => { GF.stack = []; GF.go('khouse'); }); await p.waitForTimeout(1200); ok(await p.evaluate(() => !document.querySelector('.h2-daychip')), '유아 집엔 오늘의 장면 칩 없음');
  ok(errs.length === 0, '오류 없음 ' + (errs[0] || '')); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
