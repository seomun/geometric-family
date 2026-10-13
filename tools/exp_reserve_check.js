// ⑪ 보관 동료 6종(B17) 데이터 점검: node tools/exp_reserve_check.js — 풀 밖(units·도감·뽑기에 없음) · 그림·역할·속성·이야기 유효 · 이름 중복 없음 · 가족 코스튬
const D = require('../data/expedition_slice.json'), chars = require('../data/chars.json'), ops = require('../data/ops.json'), GC = require('../games/expedition/gacha-core.js');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const R = D.reserve || [];
ok(R.length === 6, '보관 동료 6종');
ok(R.every((r) => r.route === 'reserve' && r.grade === 5), '모두 ★5 · 경로 reserve(풀 밖)');
ok(R.every((r) => !D.units.some((u) => u.id === r.id || u.name === r.name)), 'units 와 id·이름이 겹치지 않음(도감·편성에 안 들어감)');
ok(R.every((r) => chars[r.art]), '그림(시트 id)이 모두 실제 존재 · ' + R.map((r) => r.art).join(','));
ok(R.every((r) => D.role[r.role] && D.el[r.el]), '역할·속성이 스킬 데이터에 있음');
ok(R.every((r) => ops.tales[r.tale.split(':')[1]]), '이야기(카드 목록)에 있는 옛이야기 · ' + R.map((r) => r.tale.split(':')[1]).join(','));
ok(new Set(R.map((r) => r.name)).size === 6 && R.every((r) => r.note && r.note.length > 10), '이름 중복 없음 · 한 줄 소개 있음');
const ids = new Set(); const P = { since5: 0, since4: 0, guard: 0 }; let x = 7; const rnd = () => { x = (x * 1103515245 + 12345) % 2147483648; return x / 2147483648; };
for (const b of D.gacha.banners) for (let i = 0; i < 20000; i++) ids.add(GC.pullOnce(D.gacha, D.units, P, rnd, b.id).id);
ok(!R.some((r) => ids.has(r.id)), '두 배너 4만 회에도 보관 동료는 나오지 않음(풀 밖)');
console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
