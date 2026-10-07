// 효과음 id 대조표: node tools/sfx_audit.js  — 게임별로 어떤 동작에 어떤 소리 id 를 쓰는지(코드에서 GF.sfx('…') 호출을 모아) 표로 낸다.
const fs = require('fs'), path = require('path'), G = path.join(__dirname, '..', 'games');
const groups = { '엔진·①놀이터': ['engine/gf.js', 'engine/modes', 'engine/props.js'], '②세 가족 식탁': ['idle/idle.js'], '③도형 합치기': ['merge/merge.js'], '④색칠': ['color/color.js'], '⑤어느 도형': ['quiz/quiz.js'], '⑦도형 블록': ['block/block.js'], '⑥다른 그림': ['spot/spot.js'], '키트·룸(공용)': ['engine/ui-kit/ui-kit.js', 'engine/room/room.js'] };
const files = (p) => { const f = path.join(G, p); return fs.statSync(f).isDirectory() ? fs.readdirSync(f).filter((x) => x.endsWith('.js')).map((x) => path.join(f, x)) : [f]; };
const known = new Set(['tap','pick','drop','ok','hmm','no','flip','page','star','celebrate','wind','door','whistle','shutter','pop','tukdak']); const rows = {}; const ids = new Set(JSON.parse(fs.readFileSync(path.join(G, '..', 'data', 'sounds.json'), 'utf-8')).sfx ? Object.keys(JSON.parse(fs.readFileSync(path.join(G, '..', 'data', 'sounds.json'), 'utf-8')).sfx) : []);
Object.entries(groups).forEach(([g, ps]) => { rows[g] = {}; ps.flatMap(files).forEach((f) => { const t = fs.readFileSync(f, 'utf-8'); for (const m of t.matchAll(/\bsfx\(([^;\n]{0,70})/g)) for (const q of m[1].matchAll(/'([a-z0-9_]+)'/g)) if (known.has(q[1])) rows[g][q[1]] = (rows[g][q[1]] || 0) + 1; }); });
/* 동적 id(수동 행): rhythm 은 sfx('note' + n) 로 note1~5 를 쓴다 — 정규식이 못 잡으므로 직접 넣는다 */
if (/sfx\('note'\s*\+/.test(fs.readFileSync(path.join(G, 'engine/modes/rhythm.js'), 'utf-8'))) for (let i = 1; i <= 5; i++) rows['엔진·①놀이터']['note' + i] = 'rhythm';
const all = [...new Set(Object.values(rows).flatMap((r) => Object.keys(r)))].sort();
console.log('| 소리 id | ' + Object.keys(groups).join(' | ') + ' | 슬롯 |'); console.log('|---|' + Object.keys(groups).map(() => '---').join('|') + '|---|');
all.forEach((id) => console.log('| `' + id + '` | ' + Object.keys(groups).map((g) => rows[g][id] || '').join(' | ') + ' | ' + (ids.has(id) ? '✔' : '합성 대체') + ' |'));
