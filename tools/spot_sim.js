// 다른 그림 찾기 sim: node tools/spot_sim.js — 20판 검증(정답 좌표=실제 차이)·정답 탭 판정·종류 6+·연속 ≤3·오늘의 한 판 30일·세 가족 규칙·곡선(초보 탭 모델)
const C = require('../games/spot/spot-core.js'), G = require('../games/spot/spot-gen.js'), D = require('../data/spot_levels.json');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const solveAll = (L) => { const found = L.rounds.map((R) => R.diffs.map(() => false)); for (const [ri, x, y] of C.solution(L)) { const i = C.hit(L.rounds[ri], found[ri], x, y); if (i < 0) return false; found[ri][i] = true; } return found.flat().every(Boolean); };
ok(D.levels.length === 20 && D.levels.every((l) => C.verify(l).length === 0), '20판 검증(틀린 곳 목록 = 실제 차이, 크기·간격·화면 안)');
ok(D.levels.every(solveAll), '정답 좌표를 모두 탭하면 판정이 모두 맞음(20/20)');
ok(D.levels.every((l) => { const R = l.rounds[0], found = R.diffs.map(() => false); return C.hit(R, found, -50, -50) === -1; }), '빈 곳을 누르면 틀린 탭(-1)');
const types = new Set(D.levels.map((l) => l.type)); ok(types.size >= 6, '판 종류 ' + types.size + '종: ' + [...types].join(','));
let run = 1, mx = 1; for (let i = 1; i < D.levels.length; i++) { run = D.levels[i].type === D.levels[i - 1].type ? run + 1 : 1; mx = Math.max(mx, run); } ok(mx <= 3, '같은 종류 연속 최대 ' + mx + '판(≤3)');
const ops = new Set(); D.levels.forEach((l) => l.rounds.forEach((R) => R.diffs.forEach((d) => ops.add(d.op)))); ok(ops.size >= 6, '틀린 곳 연산 ' + ops.size + '종: ' + [...ops].join(','));
console.log('--- 곡선(초보 탭 모델: 힌트 없이 끝낼 확률) ---'); console.log(' ' + D.levels.map((l) => l.id + ':' + l.type[0] + l.goalN + ' ' + l.ease).join(' | '));
const T = ['diff', 'odd', 'hidden', 'three', 'memory', 'zoom', 'diff']; let dOk = 0; for (let d = 0; d < 30; d++) { const L = G.make(8 + (d % 12), 20261000 + d, { type: T[d % 7], tag: 'growth' }); if (L && C.verify(L).length === 0 && solveAll(L)) dOk++; } ok(dOk === 30, '오늘의 한 판 30일 ' + dOk + '/30');
let tr = 0, trN = 0; for (let n = 6; n <= 14; n += 4) for (const rule of [0, 1, 2]) { trN++; const L = G.make(n, n * 4093 + 33, { type: 'diff', tag: 'growth', rule }); if (L && C.verify(L).length === 0 && solveAll(L)) tr++; } ok(tr === trN, '세 가족 판 ' + tr + '/' + trN);
{ const a = G.make(10, 777, { type: 'diff', tag: 'growth', rule: 0 }), b = G.make(10, 777, { type: 'diff', tag: 'growth', rule: 1 }), c = G.make(10, 777, { type: 'diff', tag: 'growth', rule: 2 }); ok(a && b && c && a.goalN > c.goalN && b.rounds[0].diffs.every((d) => Math.min(d.w, d.h) >= 30), '세 가족 규칙: 네모 많음(' + (a && a.goalN) + ') · 세모 큼 · 동그라미 적음(' + (c && c.goalN) + ')'); }
console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
