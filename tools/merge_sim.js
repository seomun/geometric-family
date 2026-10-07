// 도형 합치기 시뮬레이터/검증: node tools/merge_sim.js  — 모든 레벨의 풀이 경로를 재생해 클리어되는지, 난이도 곡선·길이·별 분포를 보고한다.
const M = require('../games/merge/merge-core.js'), D = require('../data/merge_levels.json');
let bad = 0; const rows = [];
D.levels.forEach((L) => {
  const S = M.newGame(L); L.solution.forEach((i) => M.place(S, i));
  if (!M.won(S)) { bad++; console.log('FAIL', L.id); }
  const left = M.left(S); rows.push({ id: L.id, tag: L.tag, st: M.stars(S, L), left, len: L.queue.length, g: L.greedy });
});
const f = (a, k) => (a.reduce((x, r) => x + r[k], 0) / a.length).toFixed(2);
console.log('레벨', D.levels.length, '풀이 재생 실패', bad, '| 3별 달성 비율(풀이 기준)', (rows.filter((r) => r.st === 3).length / rows.length).toFixed(2));
['tutorial', 'intro', 'growth', 'rest', 'challenge'].forEach((t) => { const a = rows.filter((r) => r.tag === t); if (a.length) console.log(t.padEnd(10), a.length, '조각', f(a, 'len'), '탐욕', f(a, 'g')); });
const ch = {}; D.levels.forEach((l) => { (ch[l.chapter] = ch[l.chapter] || []).push(l.greedy); }); console.log('장별 탐욕 성공률:', Object.entries(ch).map(([k, v]) => k + ':' + (v.reduce((a, b) => a + b, 0) / v.length).toFixed(2)).join(' '));
const rest = D.levels.filter((l) => l.tag === 'rest'); console.log('쉬어 가기 평균', f(rest.map((l) => ({ g: l.greedy })), 'g'), '(목표 0.9)');
// 판 종류별·공통 판(오늘의 한 판·시즌·세 가족) 풀이 재생 검증
const G = require('../games/merge/merge-gen.js'); let bad2 = 0;
const replay = (L, tag) => { if (!L) { bad2++; console.log('생성 실패', tag); return false; } const S = M.newGame(L); L.solution.forEach((i) => M.place(S, i)); if (!M.won(S)) { bad2++; console.log('재생 실패', tag); return false; } return true; };
const types = Object.keys(G.TYPE_NAME); console.log('--- 판 종류별(각 24판 생성, 풀이 재생 + 탐욕/무작위 성공률) ---');
types.forEach((ty) => { let ok = 0, gr = 0, rn = 0, len = 0; const N = 24; for (let k = 0; k < N; k++) { const n = 12 + k * 4; const L = G.make(n, 120, 5000 + k * 17 + n, { type: ty }); if (replay(L, ty + ':' + n)) { ok++; gr += M.greedyWinRate(L, 40, G.mulberry(k + 3)); rn += M.randomWinRate(L, 60, G.mulberry(k + 4)); len += L.queue.length; } } console.log(ty.padEnd(8), '풀이 재생', ok + '/' + N, '탐욕', (gr / ok).toFixed(2), '무작위', (rn / ok).toFixed(2), '조각', (len / ok).toFixed(0)); });
console.log('--- 오늘의 한 판(30일) ---'); let dd = 0; for (let d = 0; d < 30; d++) { const date = 20261101 + d, ty = types[d % 7]; if (replay(G.make(30 + (date % 60), 120, date, { type: ty }), 'daily ' + date)) dd++; } console.log('오늘의 한 판', dd + '/30');
console.log('--- 세 가족 판(규칙 0·1·2 × n=6..40) ---'); let tr = 0, tt = 0; for (let n = 6; n <= 40; n += 4) for (let rule = 0; rule < 3; rule++) { tt++; if (replay(G.make(n, 120, n * 7919 + 33, { type: 'make', rule, noGreedy: true }), 'trio ' + n + ':' + rule)) tr++; } console.log('세 가족 판', tr + '/' + tt);
process.exit(bad || bad2 ? 1 : 0);
