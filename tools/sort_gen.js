// 정리의 달인 판 생성: node tools/sort_gen.js [개수=20] → data/sort_levels.json (생성기 games/sort/sort-gen.js, 풀이 재생 검증)
const fs = require('fs'), path = require('path'), G = require('../games/sort/sort-gen.js');
const N = +process.argv[2] || 20, TOTAL = +process.argv[3] || 120, OUT = path.join(__dirname, '..', 'data', 'sort_levels.json'); const levels = []; let fail = 0; const t0 = Date.now();
for (let n = 1; n <= N; n++) { const L = G.make(n, n * 6151 + 11, { total: TOTAL }); if (!L) { fail++; console.log('FAIL', n); continue; } levels.push(L); }
fs.writeFileSync(OUT, JSON.stringify({ version: 1, total: TOTAL, chapters: G.CHAPTERS, types: G.TYPE_NAME, levels }));
console.log('levels', levels.length, 'fail', fail, 'bytes', fs.statSync(OUT).size, (Date.now() - t0) / 1000 + 's');
console.log(levels.map((l) => l.id + ':' + l.type + ' k' + l.nk + ' t' + l.tubes.length + ' s' + l.steps + ' par' + l.par + ' g' + l.greedy).join(' | '));
