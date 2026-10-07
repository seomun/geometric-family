// 정리의 달인 sim: node tools/sort_sim.js — 판 데이터 전부 풀이 재생·규칙 단언·세 가족 규칙 판 풀이·난이도 곡선
const fs = require('fs'), path = require('path'), C = require('../games/sort/sort-core.js'), G = require('../games/sort/sort-gen.js');
const D = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'sort_levels.json'), 'utf8')); let fails = 0; const ok = (c, m) => { if (!c) { console.log('FAIL ' + m); fails++; } };
const types = {};
for (const L of D.levels) {
  const S = C.newGame(L); types[L.type] = (types[L.type] || 0) + 1;
  ok(L.tubes.length === L.caps.length, L.id + ' 칸 수');
  const cnt = {}; L.tubes.forEach((t) => t.forEach((k) => { cnt[k] = (cnt[k] || 0) + 1; })); ok(Object.keys(cnt).length === L.nk && Object.values(cnt).every((v, i) => v === L.counts[+Object.keys(cnt)[i]]), L.id + ' 종류별 개수');
  ok(L.tubes.every((t, i) => t.length <= L.caps[i]), L.id + ' 용량');
  ok(C.doneCount(S) === 0 || L.id === 1, L.id + ' 처음부터 정리된 칸 없음');
  for (const [a, b] of L.solution) ok(!!C.move(S, a, b), L.id + ' 풀이 수 ' + a + '→' + b); ok(S.won, L.id + ' 풀이로 클리어');
  ok(L.pal.length === L.nk && new Set(L.pal).size === L.nk, L.id + ' 그림 키 중복 없음');
  const S2 = C.newGame(L); ok(!!C.solve(S2, 60, 200), L.id + ' 빔 풀이');
}
// 규칙 단언
{ const L = D.levels[5], S = C.newGame(L); const k = S.tubes.findIndex((t) => t.length), o = S.tubes.findIndex((t, i) => i !== k && t.length && t[t.length - 1] !== S.tubes[k][S.tubes[k].length - 1] && t.length === S.caps[i]); if (o >= 0) ok(!C.canMove(S, k, o), '다른 그림 위엔 못 얹음'); const e = S.tubes.findIndex((t, i) => !t.length && !C.isLocked(S, i)); ok(C.canMove(S, k, e), '빈 칸엔 얹음'); }
// 세 가족 규칙 판
const tg = []; for (let n = 6; n <= 24; n += 3) for (let r = 0; r < 3; r++) { const L = G.make(n, n * 6151 + 33, { type: 'sort', tag: 'growth', rule: r, noGreedy: true, total: D.total }); ok(!!L, '규칙 판 ' + n + '/' + r); if (L) { const S = C.newGame(L, r); const m = C.solve(S, 60, 200); ok(!!m, '규칙 판 풀이 ' + n + '/' + r); if (m) { for (const [a, b] of m) C.move(S, a, b); ok(S.won, '규칙 판 재생 ' + n + '/' + r); } tg.push(1); } }
// 공통 판(오늘의 한 판 요일별·시즌)
for (const t of ['sort', 'limit', 'hidden', 'family', 'locked']) for (const n of [8, 12, 19]) { const L = G.make(n, 20261008 + n, { type: t, tag: 'growth', total: D.total }); ok(!!L, '공통 ' + t + n); }
// 세모 규칙: 반짝 물건은 어떤 그림 위에도
{ const L = { tubes: [[0, 1], [0, 2], []], caps: [3, 3, 3], shiny: [[0, 1], [0, 0], []], pal: ['a', 'b', 'c'] }; const S = C.newGame(L, 1); ok(C.canMove(S, 0, 1), '세모 규칙: 반짝은 다른 그림 위에 얹음'); const S0 = C.newGame(L, -1); ok(!C.canMove(S0, 0, 1), '기본 규칙은 못 얹음'); const S2 = C.newGame({ tubes: [[0, 0, 1], [], [1]], caps: [3, 3, 3], pal: ['a', 'b'] }, 2); ok(C.count(S2, 0, 1) === 1 && C.count(S2, 1, 0) === 0, '동그라미 규칙 묶음'); const S3 = C.newGame({ tubes: [[1, 0, 0], [], [1]], caps: [3, 3, 3], pal: ['a', 'b'] }, 2); ok(C.count(S3, 0, 1) === 2, '동그라미 규칙: 같은 그림 묶음 통째로'); const S4 = C.newGame({ tubes: [[0], [1]], caps: [2, 2] }, 0); ok(S4.tubes.length === 3, '네모 규칙: 빈 칸 하나 더'); }
// 잠금
{ const L = D.levels.find((l) => l.type === 'locked'); if (L) { const S = C.newGame(L); ok(L.locked.length === 1 && C.isLocked(S, L.locked[0]), '잠긴 칸이 처음엔 잠김'); ok(!C.canMove(S, 0, L.locked[0]), '잠긴 칸엔 못 놓음'); } }
console.log('종류', JSON.stringify(types)); console.log('곡선', D.levels.map((l) => l.id + ':' + l.nk + '/' + l.tubes.length + '/' + l.par).join(' '));
console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
