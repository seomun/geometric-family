// 코드 고정표 검사: node tools/room_codes_check.js [--write]
// 코드는 아이템의 불변 번호(no)로 만든다 → 아이템 순서가 바뀌어도 이미 배포한 굿즈 코드는 그대로. 이 표가 깨지면 코드 체계가 바뀐 것이다.
const fs = require('fs'), path = require('path');
global.window = global; global.document = { createElement() { return {}; } };
require('../games/engine/room/room-art.js'); require('../games/engine/room/room.js');
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'room_items.json'), 'utf-8')), G = path.join(__dirname, 'room_codes.golden.json');
const mem = { get() { return null; }, set() {} }; Room.init({ data, store: mem, game: 'merge' });
const table = {}; data.items.forEach((it) => { table[it.id] = { no: it.no, code: Room.codeFor(it.id) }; });
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
ok(new Set(data.items.map((i) => i.no)).size === data.items.length && data.items.every((i) => Number.isInteger(i.no) && i.no > 0), 'no 가 모두 유일한 양의 정수');
if (process.argv.includes('--write')) { fs.writeFileSync(G, JSON.stringify(table, null, 1)); console.log('golden 기록', Object.keys(table).length); process.exit(0); }
const gold = JSON.parse(fs.readFileSync(G, 'utf-8'));
Object.keys(gold).forEach((id) => ok(table[id] && table[id].no === gold[id].no && table[id].code === gold[id].code, '고정표 ' + id + ' ' + gold[id].code));
// 순서를 뒤섞어도 같은 코드
const shuf = JSON.parse(JSON.stringify(data)); shuf.items.reverse(); Room.init({ data: shuf, store: mem, game: 'merge' });
ok(Object.keys(gold).every((id) => Room.codeFor(id) === gold[id].code), '배열 순서를 뒤집어도 코드 동일');
Room.init({ data, store: mem, game: 'merge' });
const r = Room.redeem(gold['b_sofa'].code); ok(r.ok && r.item.id === 'b_sofa', '코드 → 아이템 b_sofa');
ok(!Room.redeem('ZZZZZZ').ok && !Room.redeem('12').ok, '틀린 코드 거부');
process.exit(fails ? 1 : 0);
