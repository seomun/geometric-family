// 막둥이의 하루 판 생성: node tools/day_gen.js [개수=20] → data/day_levels.json (생성기 games/day/day-gen.js, verify 로 검증)
const fs = require('fs'), path = require('path'), G = require('../games/day/day-gen.js');
const N = +process.argv[2] || 20, OUT = path.join(__dirname, '..', 'data', 'day_levels.json'); const levels = []; let bad = 0;
for (let n = 1; n <= N; n++) { const L = G.make(n, n * 4177 + 3), e = G.verify(L); if (e.length) { bad++; console.log('BAD', n, e.join(',')); } levels.push(L); }
fs.writeFileSync(OUT, JSON.stringify({ version: 1, per: G.PER, chapters: G.CHAPTERS.map((c) => ({ name: c[0], type: c[1], icon: c[2], tale: c[3], theme: c[4] || '' })), levels }));
console.log('levels', levels.length, 'bad', bad, 'bytes', fs.statSync(OUT).size);
console.log(levels.map((l) => l.id + ':' + l.type + (l.spots ? ' s' + l.spots.length : l.toys ? ' t' + l.toys.length : l.lights ? ' l' + l.lights.length : l.slots ? ' c' + l.slots.length + l.weather : ' f' + l.foods.length + 'x' + l.chews)).join(' | '));
process.exit(bad ? 1 : 0);
