// 손님 계절 대사 2탄(A18) 시험: node tools/housing_guest_season.js — 기본 손님 7명 × 4철 대사(모두 다름·광고성 말 없음) · 다 만난 손님이 철마다 한 번 놀러 와 그 철 대사 · 계절 선물(그 철일 때만) · 같은 철엔 한 번 · 놓쳐도 벌 없음
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { window.__noResume = true; }); await p.goto('http://localhost:8765/games/merge/index.html'); await p.waitForTimeout(1600);
  const base = await p.evaluate(() => Room.guestList().filter((g) => !g.cam && !g.nb).map((g) => ({ id: g.id, lines: g.seasonLines, gift: g.seasonGift, likes: g.likes, item: Room.item(g.seasonGift) && { months: Room.item(g.seasonGift).src.months } })));
  ok(base.length === 7 && base.every((g) => g.lines && g.lines.length === 4 && g.gift && g.item), '기본 손님 7명 모두 계절 대사 4개 + 계절 선물 1개');
  const all = base.flatMap((g) => g.lines); ok(all.length === 28 && new Set(all).size === 28, '계절 대사 28개 모두 다름'); ok(!all.some((l) => /받아요|설치|스토어|광고|구매|결제/.test(l)), '광고성 말 없음');
  ok(new Set(base.map((g) => g.gift)).size === 7, '계절 선물 7개 모두 다름 · ' + base.map((g) => g.gift).join(','));
  // 시나리오: 아내 손님(wife) 다 만남 → 봄에 소파 앞에서 봄 대사 + 튤립
  await p.evaluate(() => { Room.cfg.mode = 'adult'; Room.cozy = () => 99999; Room.S.lv = 30; Room.S.guests = Room.S.guests || {}; Room.guestList().filter((g) => !g.cam && !g.nb).forEach((g) => { Room.S.guests[g.id] = { n: g.max, seen: 1 }; }); Room.S.album = []; Room.S.roomSeen = Room.S.roomSeen || {}; Room.S.roomSeenInit = { adult: 1, kid: 1 }; Room.H.rooms.forEach((r) => { Room.S.roomSeen[r.id] = 1; }); Room.grant('b_sofa'); Room.placeAt('b_sofa'); Room._date = new Date(2026, 3, 10); GF.stack = []; GF.go('mhouse'); });
  let line = '', seen = false; for (let k = 0; k < 10 && !seen; k++) { await p.waitForTimeout(1500); seen = await p.evaluate(() => !!document.querySelector('.h2-guest')); if (!seen) await p.evaluate(() => { document.querySelectorAll('.h2-reveal,.uk-scrim').forEach((e) => e.remove()); const a = document.querySelectorAll('.h2-ar')[1]; a && a.click(); }); }
  if (seen) { await p.waitForTimeout(700); line = await p.evaluate(() => (document.querySelector('.h2-bubble') || {}).textContent || ''); await p.screenshot({ path: 'notes/snapshots/a18_guest_spring.png' }); }
  const spring = base.map((g) => g.lines[0]); ok(seen && spring.includes(line), '다 만난 손님이 봄에 다시 놀러 와 봄 대사를 말함 · ' + line);
  await p.waitForTimeout(3600);
  const who = await p.evaluate((l) => { const g = Room.guestList().find((q) => q.seasonLines && q.seasonLines[0] === l); return g && g.id; }, line);
  const rec = await p.evaluate((id) => (Room.S.guests[id] || {}).seasons, who); ok(rec && Object.keys(rec).length === 1, '이번 봄 방문 기록 1 · ' + JSON.stringify(rec));
  const gift = await p.evaluate((id) => { const g = Room.guestList().find((q) => q.id === id); return { gift: g.seasonGift, has: Room.has(g.seasonGift), months: Room.item(g.seasonGift).src.months }; }, who);
  ok(gift.months.includes(4) ? gift.has : !gift.has, '계절 선물은 그 철일 때만 · ' + gift.gift + ' ' + (gift.has ? '받음' : '안 받음'));
  // 같은 철에 다시 오지 않음, 다음 철엔 다시 옴
  const again = await p.evaluate(() => { const sk = Room.seasonKey(); return Object.values(Room.S.guests).filter((r) => r.seasons && r.seasons[sk.key]).length; }); ok(again === 1, '같은 봄엔 손님 한 명만 다녀감(철마다 한 번씩 · ' + again + ')');
  const nextSeason = await p.evaluate(() => { Room._date = new Date(2026, 7, 10); return Room.seasonKey().key; }); ok(/:1$/.test(nextSeason), '여름이 되면 새 철 키 · ' + nextSeason);
  ok(errs.length === 0, '오류 없음 ' + (errs[0] || '')); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
