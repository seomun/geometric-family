// 도형 합치기 레벨 생성 도구: node tools/merge_gen.js [개수=120]  → data/merge_levels.json (생성 로직은 games/merge/merge-gen.js 라이브러리 — 브라우저와 공용)
const fs = require('fs'), path = require('path'), M = require('../games/merge/merge-core.js'), G = require('../games/merge/merge-gen.js');
const N = +process.argv[2] || 120, OUT = path.join(__dirname, '..', 'data', 'merge_levels.json');
const levels = []; let fail = 0;
for (let n = 1; n <= N; n++) {
  let L = G.make(n, N);
  if (!L) { fail++; console.log('FAIL', n); continue; }
  if (L.tag === 'challenge') { let g0 = M.greedyWinRate(L, 80, G.mulberry(n + 9)); for (let k = 1; g0 < 0.35 && k <= 8; k++) { const L2 = G.make(n, N, n * 7919 + k * 7777); if (!L2) continue; const g2 = M.greedyWinRate(L2, 80, G.mulberry(n + 9)); if (g2 > g0) { L = L2; g0 = g2; } } }   // 도전판 판별 하한 0.35(미달만 다른 시드로 재생성)
  const S = M.newGame(L); L.solution.forEach((i) => M.place(S, i)); if (!M.won(S)) { fail++; console.log('검증 실패', n); continue; }   // 풀이 경로 재생 확인
  L.win = +M.randomWinRate(L, 80, G.mulberry(n)).toFixed(2); L.greedy = +M.greedyWinRate(L, 80, G.mulberry(n + 9)).toFixed(2); L.len = L.queue.length;
  levels.push(L);
}
fs.writeFileSync(OUT, JSON.stringify({ version: 2, chapters: G.CHAPTERS, types: G.TYPE_NAME, levels }));
const by = (f) => { const o = {}; levels.forEach((l) => { (o[f(l)] = o[f(l)] || []).push(l); }); return o; }, avg = (a, k) => (a.reduce((x, l) => x + l[k], 0) / a.length).toFixed(2);
console.log('levels', levels.length, 'fail', fail, 'bytes', fs.statSync(OUT).size);
Object.entries(by((l) => l.tag)).forEach(([k, v]) => console.log(k.padEnd(10), v.length, '탐욕', avg(v, 'greedy'), '무작위', avg(v, 'win'), '조각', avg(v, 'len')));
Object.entries(by((l) => l.type)).forEach(([k, v]) => console.log('type', k.padEnd(8), v.length, '탐욕', avg(v, 'greedy'), '조각', avg(v, 'len')));
console.log('장별 탐욕:', Object.entries(by((l) => l.chapter)).map(([k, v]) => k + ':' + avg(v, 'greedy')).join(' '));
