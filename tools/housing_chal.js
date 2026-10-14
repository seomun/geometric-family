// 우리 집 「주간 꾸미기 도전」(A24, 성인) 시험: node tools/housing_chal.js
// 주마다 주제 하나(12개 순환·같은 주는 같은 주제) · 띠 칩 🏆 n/need · 시트(진행 점·이번 주 도장 칸 8주·못 해도 괜찮다는 안내) · 맞는 가구를 놓으면 늘어남 · need 개면 도장 한 개(주 1번, 앨범) · 유아 집엔 없음 · 순위·벌점 없음
const { chromium } = require('playwright-core');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { window.__noResume = true; });
  await p.goto('http://localhost:8765/games/merge/index.html'); await p.waitForTimeout(1700);
  // 주제 순환
  const rot = await p.evaluate(() => { const L = Room.chalList(), ids = []; for (let w = 0; w < 14; w++) { Room._date = new Date(2026, 9, 5 + 7 * w); ids.push(Room.chalOf().id); } const same = []; for (let d = 0; d < 7; d++) { Room._date = new Date(2026, 9, 12 + d); same.push(Room.chalOf().id); } Room._date = null; return { n: L.length, ids, sameWeek: new Set(same).size, uniq12: new Set(ids.slice(0, 12)).size }; });
  ok(rot.n === 12, '도전 12개'); ok(rot.uniq12 === 12 && rot.ids[0] === rot.ids[12], '12주 동안 서로 다른 주제가 돌고 13주째에 처음으로'); ok(rot.sameWeek === 1, '같은 주(월~일)는 같은 주제');
  // 가구 모으기: 이번 주 주제에 맞는 가구를 방에 놓는다
  await p.evaluate(() => { Room._date = new Date(2026, 9, 14); Room.S.album = []; Room.S.chal = null; });
  const info = await p.evaluate(() => { const c = Room.chalOf(), items = Room.data.items.filter((i) => i.room !== 'kid' && !['kid', 'kseason', 'kgift', 'daybath', 'wall', 'story_k'].includes(i.set) && (c.k === 'tag' ? (i.tags || []).includes(c.v) : i[c.k] === c.v)); return { c, n: items.length, ids: items.map((i) => i.id) }; });
  ok(info.n >= info.c.need + 1, '이번 주(' + info.c.name + ')를 채울 가구가 충분(' + info.n + '개, 필요 ' + info.c.need + ')');
  const P0 = await p.evaluate(() => Room.chalProgress()); ok(P0.got === 0 && !P0.done, '처음엔 0/' + P0.need);
  await p.evaluate((ids) => { ids.forEach((id) => Room.grant(id)); Room.save(); }, info.ids);
  const room = await p.evaluate(() => Room.chalProgress().room ? Room.chalProgress().room.id : 'nemo');
  const put = async (n) => p.evaluate(([ids, rid, n]) => { const have = new Set((Room.placedIn(rid) || []).map((q) => q.id)); let k = 0; ids.forEach((id) => { if (k >= n || have.has(id)) return; Room.placedIn(rid).push({ id, x: 20 + k * 30, y: 200, flip: 0, c: (Room.item(id).colors || ['#fff'])[0] }); k++; }); Room.save(); return Room.chalProgress(); }, [info.ids, room, n]);
  const P1 = await put(info.c.need - 1); ok(P1.got === info.c.need - 1 && !P1.done, '하나 모자라면 ' + P1.got + '/' + P1.need + ' · 도장 아직 없음'); ok(await p.evaluate(() => !Room.S.chal || Object.keys(Room.S.chal.stamps || {}).length === 0), '도장 기록 없음(미달)');
  // 칩과 시트
  await p.evaluate(() => { GF.stack = []; GF.go('mhome'); }); await p.waitForTimeout(900);
  await p.evaluate(() => { document.querySelectorAll('.uk-scrim,.tale-ov,.h2-reveal').forEach((e) => e.remove()); GF.go('mhouse'); }); await p.waitForTimeout(1300); await p.evaluate(() => document.querySelectorAll('.uk-scrim,.tale-ov,.h2-reveal').forEach((e) => e.remove()));
  const chip = await p.evaluate(() => { const c = document.querySelector('.h2-chalchip'); return c ? c.textContent.replace(/\s/g, '') : null; }); ok(!!chip && new RegExp((info.c.need - 1) + '/' + info.c.need).test(chip), '띠 안 칩: ' + chip);
  await p.evaluate(() => Room.chalSheet(document.querySelector('.screen.on'))); await p.waitForTimeout(500);
  const sh = await p.evaluate(() => ({ txt: document.querySelector('.h2-chal').innerText.replace(/\s+/g, ' '), pips: document.querySelectorAll('.h2-chalpips i').length, on: document.querySelectorAll('.h2-chalpips i.on').length, stamps: document.querySelectorAll('.h2-stamp').length }));
  ok(sh.pips === info.c.need && sh.on === info.c.need - 1 && sh.stamps === 8, '시트: 점 ' + sh.on + '/' + sh.pips + ' · 도장 칸 8주'); ok(/괜찮아요/.test(sh.txt), '못 하고 지나가도 괜찮다는 안내'); await p.screenshot({ path: 'notes/snapshots/a24_chal_sheet.png' });
  await p.evaluate(() => document.querySelectorAll('.uk-scrim').forEach((e) => e.remove()));
  // 채우면 도장 한 개 → 앨범 · 두 번 해도 한 개
  const P2 = await put(info.c.need); ok(P2.done, '채우면 완료 ' + P2.got + '/' + P2.need);
  const st = await p.evaluate(() => { Room.chalStamp(); Room.chalStamp(); const S = Room.S; return { stamps: Object.keys(S.chal.stamps).length, album: (S.album || []).filter((a) => a.kind === 'chal').length, wk: Object.keys(S.chal.stamps)[0] }; });
  ok(st.stamps === 1 && st.album === 1, '도장 1개 · 앨범 1개(여러 번 확인해도 한 번만) · 주 ' + st.wk);
  await p.evaluate(() => Room.chalSheet(document.querySelector('.screen.on'))); await p.waitForTimeout(400); ok(await p.evaluate(() => /도장을 받았어요/.test(document.querySelector('.h2-chal').innerText) && document.querySelectorAll('.h2-stamp.on').length === 1), '완료 시트: 「도장을 받았어요」 + 이번 주 칸에 도장'); await p.screenshot({ path: 'notes/snapshots/a24_chal_done.png' });
  await p.evaluate(() => document.querySelectorAll('.uk-scrim').forEach((e) => e.remove()));
  // 다음 주엔 새 주제·새 칸 — 이번 주 도장은 그대로(벌점·연속 없음)
  const nx = await p.evaluate(() => { Room._date = new Date(2026, 9, 21); const P = Room.chalProgress(); return { id: P.c.id, got: P.got, done: P.done, stamps: Object.keys(Room.S.chal.stamps).length }; }); ok(nx.stamps === 1, '다음 주가 되어도 지난 도장은 그대로'); ok(nx.id !== info.c.id, '다음 주는 다른 주제(' + nx.id + ')');
  // 한 주 건너뛰어도(안 해도) 아무 일 없음
  const skip = await p.evaluate(() => { Room._date = new Date(2026, 10, 18); const P = Room.chalProgress(); return { ok: !!P, stamps: Object.keys(Room.S.chal.stamps).length }; }); ok(skip.ok && skip.stamps === 1, '몇 주를 건너뛰어도 도장은 잃지 않음');
  ok(await p.evaluate(() => { Room._date = null; return !(window.RoomRank || window.Room.rank); }), '순위표 없음');
  ok(errs.length === 0, '오류 없음 ' + (errs[0] || '')); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
