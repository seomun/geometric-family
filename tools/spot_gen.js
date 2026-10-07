// 다른 그림 찾기 판 생성: node tools/spot_gen.js [개수=20] → data/spot_levels.json (생성기 games/spot/spot-gen.js, 검증 spot-core.verify)
const fs = require('fs'), path = require('path'), C = require('../games/spot/spot-core.js'), G = require('../games/spot/spot-gen.js');
const N = +process.argv[2] || 20, OUT = path.join(__dirname, '..', 'data', 'spot_levels.json'); const levels = []; let fail = 0;
for (let n = 1; n <= N; n++) { const L = G.make(n, n * 4093); if (!L) { fail++; console.log('FAIL', n); continue; } levels.push(L); }
fs.writeFileSync(OUT, JSON.stringify({ version: 1, chapters: G.CHAPTERS, types: G.TYPE_NAME, levels }));
console.log('levels', levels.length, 'fail', fail, 'bytes', fs.statSync(OUT).size);
console.log(levels.map((l) => l.id + ':' + l.type + ' ' + l.goalN + '곳 ease' + l.ease).join(' | '));
