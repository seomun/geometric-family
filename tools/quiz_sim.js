// 당신은 어느 도형? 시뮬레이터: node tools/quiz_sim.js — 무작위 응답 20,000회로 결과 분포(9종)가 치우치지 않는지, 문항 데이터 규칙을 검사한다.
const Q = require('../games/quiz/quiz-core.js'), D = require('../data/quiz_tests.json');
let bad = 0; const ok = (c, m) => { if (!c) { bad++; console.log('FAIL', m); } };
D.tests.forEach((t) => { ok(t.qs.length === 6, t.id + ' 문항 수'); t.qs.forEach((q, i) => { ok(q.o.length === 3 && q.o[0].f === 'nemo' && q.o[1].f === 'semo' && q.o[2].f === 'dong', t.id + ' q' + (i + 1) + ' 선택지 순서'); q.o.forEach((o) => ok(o.t && o.t.length <= 34 && [0, 1, 2].includes(o.s), t.id + ' 선택지 글자·세부')); }); });
const all = {}, byTest = {}; const N = 20000;
for (let n = 0; n < N; n++) { const t = D.tests[n % D.tests.length], ans = t.qs.map((q) => q.o[(Math.random() * 3) | 0]); const r = Q.resolve(ans), k = r.f + r.s; all[k] = (all[k] || 0) + 1; (byTest[t.id] = byTest[t.id] || {})[r.f] = ((byTest[t.id] || {})[r.f] || 0) + 1; }
console.log('결과 분포(무작위 응답 ' + N + '회):'); Object.keys(all).sort().forEach((k) => console.log(' ', k.padEnd(6), (all[k] / N * 100).toFixed(1) + '%'));
const fam = { nemo: 0, semo: 0, dong: 0 }; Object.entries(all).forEach(([k, v]) => { fam[k.replace(/\d/, '')] += v; }); console.log('가족별:', Object.entries(fam).map(([k, v]) => k + ' ' + (v / N * 100).toFixed(1) + '%').join(' '));
Object.entries(byTest).forEach(([id, o]) => { const tot = Object.values(o).reduce((a, b) => a + b, 0); console.log(' ', id, Object.entries(o).map(([k, v]) => k + ' ' + (v / tot * 100).toFixed(0) + '%').join(' ')); });
ok(Object.keys(all).length === 9, '9종 결과가 모두 나옴'); ok(Math.max(...Object.values(all)) / N < 0.2, '한 결과가 20% 넘지 않음'); ok(Math.min(...Object.values(all)) / N > 0.05, '모든 결과가 5% 넘게 나옴');
console.log(bad ? 'FAILED ' + bad : 'ALL PASS'); process.exit(bad ? 1 : 0);
