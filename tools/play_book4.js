// 놀이터 4권 「옛이야기 나들이」(D12) 시험: node tools/play_book4.js — 책장 4권 · 지도 4권 5장 · 16~20장 데이터(3단계×3판·스티커 25·장난감 5) · 신규 3종 풀기(짝 찾기·크기 순서·무늬 이어 놓기) · 놀이방 10장 · 글자 없음
const { chromium } = require('playwright-core'); const fs = require('fs');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const S = JSON.parse(fs.readFileSync('data/stages.json', 'utf8')), K = JSON.parse(fs.readFileSync('data/stickers.json', 'utf8')), R = JSON.parse(fs.readFileSync('data/room_items.json', 'utf8')), T = JSON.parse(fs.readFileSync('data/story.json', 'utf8'));
  ok([16, 17, 18, 19, 20].every((n) => S['ch' + n] && S['ch' + n].stages.length === 3 && S['ch' + n].stages.every((st) => st.rounds.length === 3)), '데이터: 16~20장 3단계 × 3판');
  ok(K.filter((x) => x.ch >= 16 && x.ch <= 20).length === 25, '스티커 25'); ok(['k_ch16', 'k_ch17', 'k_ch18', 'k_ch19', 'k_ch20'].every((id) => R.items.some((x) => x.id === id)), '아이 방 장난감 5'); ok([16, 17, 18, 19, 20].every((n) => T['ch' + n].pro.length === 3 && T['ch' + n].epi.length === 3), '이야기 앞 3컷·뒤 3컷');
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { window.__noResume = true; });
  await p.goto('http://localhost:8765/games/index.html'); await p.waitForTimeout(1700);
  await p.evaluate(() => { GF.stack = []; GF.go('shelf'); }); await p.waitForTimeout(900);
  ok(await p.evaluate(() => document.querySelectorAll('.cover').length === 4 && !document.querySelector('.cover[data-book="4"]').classList.contains('locked')), '책장에 4권(열려 있음)'); await p.screenshot({ path: 'notes/snapshots/d12_shelf.png' });
  await p.evaluate(() => { GF.go('map', { book: 4 }); }); await p.waitForTimeout(800);
  const mp = await p.evaluate(() => ({ nodes: document.querySelectorAll('.node').length, open: document.querySelectorAll('.node:not(.locked)').length })); ok(mp.nodes === 5 && mp.open >= 1, '4권 지도: 장 5개 · 첫 장 열림 (' + mp.open + ')'); await p.screenshot({ path: 'notes/snapshots/d12_map4.png' });
  // 신규 3종: 놀이방에서 열어 풀기
  await p.evaluate(() => { GF.stack = []; GF.go('playroom'); }); await p.waitForTimeout(700);
  ok(await p.evaluate(() => document.querySelectorAll('.screen.on .card').length === 10 && document.querySelectorAll('.screen.on .card.locked').length === 0), '놀이방 카드 10장(잠김 없음)'); await p.screenshot({ path: 'notes/snapshots/d12_playroom10.png' });
  const open = async (idx, diff) => { await p.evaluate(() => { document.querySelectorAll('.uk-scrim,.overlay').forEach((e) => e.remove()); GF.stack = []; GF.go('playroom'); }); await p.waitForTimeout(600); await p.evaluate((i) => document.querySelectorAll('.screen.on .card')[i].click(), idx); await p.waitForTimeout(350); await p.evaluate((d) => document.querySelectorAll('.overlay .big')[d - 1].click(), diff); await p.waitForTimeout(900); };
  const txtFree = async () => /[가-힣A-Za-z]/.test(await p.evaluate(() => document.querySelector('.playarea').innerText.replace(/\s/g, '')));
  // 연못 짝 찾기
  for (const diff of [1, 3]) {
    await open(7, diff); const n0 = await p.evaluate(() => document.querySelector('.playarea').__pair.cards.length); ok(n0 === (diff === 1 ? 4 : 8), '짝 찾기 난이도 ' + diff + ': 카드 ' + n0 + '장'); ok(!(await txtFree()), '짝 찾기: 글자 없음'); if (diff === 1) await p.screenshot({ path: 'notes/snapshots/d12_pair.png' });
    await p.waitForFunction(() => !document.querySelector('.playarea').__pair.busy, null, { timeout: 8000 });
    // 일부러 틀린 쌍 먼저(다른 그림 둘) → 되돌아가는지
    const wrong = await p.evaluate(() => { const c = document.querySelector('.playarea').__pair.cards, a = 0, bI = c.findIndex((x, i) => i > 0 && x.k !== c[0].k); document.querySelector('.playarea').__pair.flip(a); document.querySelector('.playarea').__pair.flip(bI); return bI; });
    await p.waitForTimeout(1600); ok(await p.evaluate(() => document.querySelectorAll('.prcard.up').length === 0), '짝 찾기: 틀린 쌍은 다시 엎어짐(벌 없음)');
    for (let g = 0; g < 8; g++) { const done = await p.evaluate(() => { const P = document.querySelector('.playarea').__pair, left = P.cards.map((c, i) => [c, i]).filter(([c]) => !c.done); if (!left.length) return true; const k = left[0][0].k, two = left.filter(([c]) => c.k === k); P.flip(two[0][1]); P.flip(two[1][1]); return false; }); if (done) break; await p.waitForTimeout(900); }
    await p.waitForTimeout(2600); ok(await p.evaluate(() => !!document.querySelector('.uk-sheet')), '짝 찾기: 다 맞히면 결과 카드 (난이도 ' + diff + ')');
  }
  // 크기 순서
  for (const diff of [1, 3]) {
    await open(8, diff); const info = await p.evaluate(() => { const O = document.querySelector('.playarea').__order; return { n: O.n, down: O.down }; }); ok(info.n === 2 + diff && info.down === (diff === 3), '크기 순서 난이도 ' + diff + ': 물고기 ' + info.n + (info.down ? ' · 큰 것부터' : '')); ok(!(await txtFree()), '크기 순서: 글자 없음'); if (diff === 1) await p.screenshot({ path: 'notes/snapshots/d12_order.png' });
    const drag = async (rank, slotIdx) => { const pos = await p.evaluate(([rank, si]) => { const O = document.querySelector('.playarea').__order, f = O.fishes.find((x) => x.rank === rank && !x.placed).el.getBoundingClientRect(), s = O.slots[si].el.getBoundingClientRect(); return { fx: f.left + f.width / 2, fy: f.top + f.height / 2, sx: s.left + s.width / 2, sy: s.top + s.height / 2 }; }, [rank, slotIdx]); await p.mouse.move(pos.fx, pos.fy); await p.mouse.down(); await p.mouse.move(pos.sx, pos.sy, { steps: 8 }); await p.mouse.up(); await p.waitForTimeout(350); };
    // 틀린 칸에 먼저 놓기 → 제자리
    const wrongSlot = await p.evaluate(() => { const O = document.querySelector('.playarea').__order; const f = O.fishes[0]; return O.slots.findIndex((s) => s.rank !== f.rank); }); const frank = await p.evaluate(() => document.querySelector('.playarea').__order.fishes[0].rank);
    await drag(frank, wrongSlot); ok(await p.evaluate(() => document.querySelector('.playarea').__order.placed === 0), '크기 순서: 틀린 칸에 놓으면 제자리로(벌 없음)');
    const nn = info.n; for (let si = 0; si < nn; si++) { const rank = await p.evaluate((si) => document.querySelector('.playarea').__order.slots[si].rank, si); await drag(rank, si); }
    await p.waitForTimeout(2600); ok(await p.evaluate(() => !!document.querySelector('.uk-sheet')), '크기 순서: 다 줄 세우면 결과 카드 (난이도 ' + diff + ')');
  }
  // 무늬 이어 놓기
  for (const diff of [1, 2, 3]) {
    await open(9, diff); const info = await p.evaluate(() => { const P = document.querySelector('.playarea').__pattern; return { unit: P.unit, len: P.seq.length, shapes: new Set(P.tokens).size }; }); ok(info.unit === ['AB', 'AAB', 'ABC'][diff - 1], '무늬 이어 놓기 난이도 ' + diff + ': ' + info.unit + ' ' + info.len + '칸'); ok(!(await txtFree()), '무늬: 글자 없음'); if (diff === 1) await p.screenshot({ path: 'notes/snapshots/d12_pattern.png' });
    const wrongK = await p.evaluate(() => { const P = document.querySelector('.playarea').__pattern, b = P.btns.find((x) => +x.dataset.k !== P.answer); b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); return +b.dataset.k; });
    await p.waitForTimeout(600); ok(await p.evaluate(() => !document.querySelector('.uk-sheet')), '무늬: 틀려도 끝나지 않고 다시 고를 수 있음');
    await p.evaluate(() => document.querySelector('.playarea').__pattern.solve()); await p.waitForTimeout(2800); ok(await p.evaluate(() => !!document.querySelector('.uk-sheet')), '무늬: 맞히면 결과 카드 (난이도 ' + diff + ')');
  }
  ok(errs.length === 0, '오류 없음 ' + (errs[0] || '')); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
