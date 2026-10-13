// 짝 맞추기 판 생성: node tools/tile_gen.js [개수=20] → data/tile_levels.json (생성기 games/tile/tile-gen.js, 검증 풀이 재생)
const fs = require('fs'), path = require('path'), C = require('../games/tile/tile-core.js'), G = require('../games/tile/tile-gen.js');
const N = +process.argv[2] || 20, OUT = path.join(__dirname, '..', 'data', 'tile_levels.json'); // 세 번째 인자 append: 기존 판은 그대로 두고 뒤만 만든다(D2 — 저장 진행 id 보존)
const APPEND = process.argv[3] === 'append', old = APPEND && fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, 'utf-8')).levels : [];
const levels = old.slice(); let fail = 0; const t0 = Date.now();
for (let n = old.length + 1; n <= N; n++) { const L = G.make(n, n * 6151); if (!L) { fail++; console.log('FAIL', n); continue; } levels.push(L); }
fs.writeFileSync(OUT, JSON.stringify({ version: 1, chapters: G.CHAPTERS, types: G.TYPE_NAME, levels }));
console.log('levels', levels.length, 'fail', fail, 'bytes', fs.statSync(OUT).size, (Date.now() - t0) / 1000 + 's');
console.log(levels.map((l) => l.id + ':' + l.type + ' N' + l.tiles.length + ' L' + l.layers + ' cap' + l.cap + ' g' + l.greedy).join(' | '));
