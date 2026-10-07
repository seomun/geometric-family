// 도형 블록 sim: node tools/block_sim.js — 20판 풀이 재생, 종류별 탐욕 승률, 오늘의 한 판 30일, 세 가족 판 규칙별, 가족 규칙 코어 검증
const C = require('../games/block/block-core.js'), G = require('../games/block/block-gen.js'), D = require('../data/block_levels.json');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const replay = (L, rule) => { const S = C.newGame(L, rule); for (const m of L.solution) { if (!C.place(S, m[0], m[1], m[2])) return false; } return C.won(S); };
ok(D.levels.length === 20 && D.levels.every((l) => replay(l)), '20판 풀이 재생 모두 클리어');
const by = {}; D.levels.forEach((l) => (by[l.type] = by[l.type] || []).push(l)); const rng = G.mulberry(7);
console.log('--- 종류별(탐욕 80회) ---'); Object.entries(by).forEach(([t, ls]) => console.log(' ', t.padEnd(7), ls.length + '판', ls.map((l) => C.greedyWinRate(l, 80, rng).toFixed(2)).join(' ')));
const types = new Set(D.levels.map((l) => l.type)); ok(types.size >= 6, '판 종류 ' + types.size + '종(6+)');
let run = 1, mx = 1; for (let i = 1; i < D.levels.length; i++) { run = D.levels[i].type === D.levels[i - 1].type ? run + 1 : 1; mx = Math.max(mx, run); } ok(mx <= 3, '같은 종류 연속 최대 ' + mx + '판(≤3)');
const T = ['lines', 'family', 'junk', 'star', 'combo', 'limit', 'solo']; let dailyOk = 0; for (let d = 0; d < 30; d++) { const L = G.make(8 + (d * 7) % 40, 20261000 + d, { type: T[d % 7], tag: 'growth', noGreedy: true }); if (L && replay(L)) dailyOk++; } ok(dailyOk === 30, '오늘의 한 판 30일 ' + dailyOk + '/30');
let trio = 0, trioN = 0; for (let n = 6; n <= 14; n += 4) for (const rule of [0, 1, 2]) { trioN++; const L = G.make(n, n * 7919 + 33, { type: 'lines', tag: 'growth', rule, noGreedy: true }); if (L && replay(L, rule)) trio++; } ok(trio === trioN, '세 가족 판 ' + trio + '/' + trioN);
// 가족 규칙 코어 검증
{ const L = { id: 0, goal: { t: 'lines', n: 9 }, pre: [], stars: [], queue: [['d', 0, 0], ['d', 0, 0], ['d', 0, 0]], rule: 0 }, S = C.newGame(L, 0); for (let c = 0; c < 7; c++) { S.fam[c] = 0; S.fam[8 + c] = 0; } S.tray = [{ p: 'v2', c: 0, sh: 0 }, null, null]; S.qi = 99; const ev = C.place(S, 0, 0, 7); ok(ev.lines === 2 && ev.bonus && S.tray.some((t) => t && t.p === 'd'), '네모 규칙: 두 줄 한꺼번에 → 점 조각 돌려받음'); }
{ const L = { id: 0, goal: { t: 'lines', n: 9 }, pre: [], stars: [], queue: [], rule: 1 }, S = C.newGame(L, 1); for (let c = 0; c < 7; c++) S.fam[c] = 0; for (let c = 0; c < 4; c++) S.fam[8 + c] = 0; S.shiny[0] = 1; S.tray = [{ p: 'd', c: 0, sh: 0 }, null, null]; const ev = C.place(S, 0, 0, 7); ok(ev.lines === 1 && ev.cleared.length === 12, '세모 규칙: 반짝 칸이 든 줄은 옆 줄까지 지워짐(' + ev.cleared.length + '칸)'); }
{ const L = { id: 0, goal: { t: 'lines', n: 9 }, pre: [], stars: [], queue: [], rule: 2 }, S = C.newGame(L, 2); for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (r * 4 + c < 15) S.fam[r * 8 + c] = 0; S.tray = [{ p: 'd', c: 0, sh: 0 }, null, null]; const ev = C.place(S, 0, 3, 3); ok(ev.lines === 1 && ev.cleared.length === 16, '동그라미 규칙: 4×4 방이 가득 차면 지워짐'); }
{ const L = { id: 0, goal: { t: 'star' }, pre: [], stars: [5], queue: [], rule: -1 }, S = C.newGame(L); for (let c = 0; c < 7; c++) S.fam[c] = 0; S.tray = [{ p: 'd', c: 0, sh: 0 }, null, null]; const ev = C.place(S, 0, 0, 7); ok(S.got.stars === 1 && C.won(S), '반짝 칸: 별이 든 줄을 지우면 별을 모음'); }
console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
