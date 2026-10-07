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
process.exit(bad ? 1 : 0);
