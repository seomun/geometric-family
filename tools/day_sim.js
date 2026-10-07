// 막둥이의 하루 sim: node tools/day_sim.js — 판 데이터 검증(목표 화면 안·겹침·정답 하나), 곡선 단조, 사연·소품 연결
const fs = require('fs'), path = require('path'), G = require('../games/day/day-gen.js');
const rd = (n) => JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', n + '.json'), 'utf8')); const D = rd('day_levels'), X = rd('day_extra'), R = rd('room_items'), C = rd('chars');
let fails = 0; const ok = (c, m) => { if (!c) { console.log('FAIL ' + m); fails++; } };
for (const L of D.levels) { const e = G.verify(L); ok(!e.length, L.id + ' ' + e.join(',')); const re = G.make(L.id, L.id * 4177 + 3); ok(JSON.stringify(re) === JSON.stringify(L), L.id + ' 같은 시드면 같은 판'); }
// 곡선: 장 안에서 목표 개수가 줄지 않음
const goal = (l) => (l.spots || l.toys || l.lights || l.slots || []).length || l.foods.length * l.chews;
for (let c = 1; c <= 5; c++) { const ls = D.levels.filter((l) => l.chapter === c); for (let i = 1; i < ls.length; i++) ok(goal(ls[i]) >= goal(ls[i - 1]), c + '장 곡선 단조 ' + i); ok(ls.length === G.PER && ls.filter((l) => l.last).length === 1, c + '장 판 수·마지막 판'); }
// 사연: 장마다 4컷, 쓰는 캐릭터가 모두 존재
for (const s of X.stories) { ok(s.cuts.length === 4, s.chapter + '장 사연 4컷'); s.cuts.forEach((c) => c.chars.forEach((id) => ok(!!C[id], s.chapter + '장 캐릭터 ' + id))); }
ok(X.stories.length === 5, '사연 5편');
// 소품: 보상 id 가 모두 집 데이터에 있고 아이 방
const items = Object.fromEntries(R.items.map((i) => [i.id, i])); const src = fs.readFileSync(path.join(__dirname, '..', 'games', 'day', 'day.js'), 'utf8'); const rew = [...src.matchAll(/(\d+): '(y_[a-z0-9]+)'/g)].map((m) => m[2]);
rew.forEach((id) => ok(items[id] && items[id].room === 'kid' && items[id].game === 'day', '보상 소품 ' + id)); X.dailyItems.forEach((id) => ok(!!items[id], '오늘의 하루 보상 ' + id));
// 한 장면 최소 터치 크기(칠 자리): 얼룩 지름·장난감 간격
D.levels.filter((l) => l.type === 'brush').forEach((l) => l.spots.forEach((s) => ok(s.r * 2 >= 44, l.id + ' 얼룩 지름 44 이상')));
const types = {}; D.levels.forEach((l) => { types[l.type] = (types[l.type] || 0) + 1; }); console.log('놀이', JSON.stringify(types), '판', D.levels.length, '보상', rew.length);
console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
