// 도형 블록 판 생성: node tools/block_gen.js [개수=20] → data/block_levels.json (생성기 games/block/block-gen.js)
const fs = require('fs'), path = require('path'), C = require('../games/block/block-core.js'), G = require('../games/block/block-gen.js');
const N = +process.argv[2] || 120, OUT = path.join(__dirname, '..', 'data', 'block_levels.json');
const ONLY = process.argv[3]; let levels = []; let fail = 0; const t0 = Date.now(); const old = ONLY && fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf-8')).levels : null;   // 세 번째 인자(종류)를 주면 그 종류의 판만 다시 만든다 const t0 = Date.now();
for (let n = 1; n <= N; n++) {
  if (old && G.typeOf(n) !== ONLY) { levels.push(old.find((l) => l.id === n)); continue; }
  const L = G.make(n, n * 7919); if (!L) { fail++; console.log('FAIL', n); continue; }
  const S = C.newGame(L); L.solution.forEach((m) => C.place(S, m[0], m[1], m[2])); if (!C.won(S)) { fail++; console.log('검증 실패', n); continue; }
  levels.push(L);
}
fs.writeFileSync(OUT, JSON.stringify({ version: 1, chapters: G.CHAPTERS, types: G.TYPE_NAME, levels }));
const by = (f) => { const o = {}; levels.forEach((l) => (o[f(l)] = o[f(l)] || []).push(l)); return o; }, avg = (a, k) => (a.reduce((x, l) => x + (l[k] || 0), 0) / a.length).toFixed(2);
console.log('levels', levels.length, 'fail', fail, 'bytes', fs.statSync(OUT).size, (Date.now() - t0) / 1000 + 's');
Object.entries(by((l) => l.type)).forEach(([k, v]) => console.log('type', k.padEnd(7), v.length, '탐욕', avg(v, 'greedy'), '최소 조각', avg(v, 'par'), '조각열', avg(v, 'queue') === 'NaN' ? '' : (v.reduce((a, l) => a + l.queue.length, 0) / v.length).toFixed(0)));
Object.entries(by((l) => l.tag)).forEach(([k, v]) => console.log('tag ', k.padEnd(8), v.length, '탐욕', avg(v, 'greedy')));
console.log(levels.map((l) => l.id + ':' + l.type + ' ' + l.greedy).join(' | '));
