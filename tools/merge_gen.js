// 도형 합치기 레벨 생성기 + 검증: node tools/merge_gen.js [개수=120]  → data/merge_levels.json
// 방식 = "풀이를 따라 만든다": 목표를 정하고, 탐욕 플레이로 실제로 놓아 가며 다음 조각을 고른다(p 확률로 판 위 조각과 짝이 맞는 것, 아니면 새 1단계, d 확률로 방해 조각).
// 그렇게 만든 조각 줄 + 풀이 경로가 곧 "풀 수 있음"의 증거이고, 끝에 여유 조각(extra)을 붙인다. 난이도는 p·d·extra·판 크기로 조절하고, 탐욕·무작위 성공률로 곡선을 검증한다.
const fs = require('fs'), path = require('path'), M = require('../games/merge/merge-core.js');
const N = +process.argv[2] || 120, OUT = path.join(__dirname, '..', 'data', 'merge_levels.json');
const rng0 = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
const CHAPTERS = ['새집 첫날', '식탁 차리기', '이삿짐 정리', '화장실 하나', '냉장고 정리', '거실 꾸미기', '김장하는 날', '손님이 온다', '큰 상 차리기', '이사 가는 날', '동네 한 바퀴', '세 가족 한자리'];
const tag = (n) => (n <= 3 ? 'tutorial' : n % 5 === 0 && n > 5 ? 'rest' : n <= 12 ? 'intro' : n > N * 0.8 ? 'challenge' : 'growth');
function params(n) {
  const t = tag(n), f = Math.min(1, n / (N * 0.85));
  const T0 = n <= 3 ? 2 + (n > 1 ? 1 : 0) : n <= 24 ? 3 : n <= 95 ? 4 : 5, T = t === 'rest' ? Math.max(2, T0 - 1) : T0, cg = n < 8 ? 1 : n < 60 ? 2 : n < 100 ? 2 : 3;
  const cols = n <= 20 ? 4 : n <= 50 ? 5 : n <= 90 ? 5 : 6, rows = n <= 20 ? 4 : n <= 50 ? 5 : 6;
  const p = { tutorial: 0.97, intro: 0.9, rest: 0.98, growth: 0.85 - 0.2 * f, challenge: 0.7 }[t], d = n < 60 ? 0 : { tutorial: 0, intro: 0.05, rest: 0.03, growth: 0.06 + 0.06 * f, challenge: 0.1 }[t];
  const extra = { tutorial: 0.8, intro: 0.6, rest: 0.8, growth: 0.45 - 0.12 * f, challenge: 0.25 }[t];
  return { T, cg, cols, rows, t, p, d, extra };
}
function build(n, P, rng) {
  const avail = n < 4 ? [0] : n < 8 ? [0, 1] : [0, 1, 2];
  let chs = n < 4 ? [0] : n < 8 ? [1] : []; if (!chs.length) [(n * 2) % 3, (n * 2 + 1) % 3, (n * 2 + 2) % 3].forEach((c) => { if (chs.length < P.cg) chs.push(c); });
  const goals = chs.map((c, i) => ({ c, t: Math.max(2, P.T - i), n: 1 + (n > 105 && i === 0 ? 1 : 0) }));
  const pre = []; if (n > 70 && (P.t === 'challenge' || n % 4 === 0)) { const k = 1 + Math.min(2, ((n - 70) / 25) | 0), used = new Set(); for (let j = 0; j < k; j++) { const i = (rng() * P.cols * P.rows) | 0; if (!used.has(i)) { used.add(i); pre.push({ i, c: avail[(rng() * avail.length) | 0], t: 4 }); } } }
  const L = { id: n, type: 'make', chapter: ((n - 1) / 10 | 0) + 1, tag: P.t, cols: P.cols, rows: P.rows, goals, queue: [], pre, stars: [0, 1] };
  const S = M.newGame(L), gc = goals.map((g) => g.c), path = [], orig = [];
  for (let k = 0; k < 120 && !M.won(S); k++) {
    while (S.q.length > S.qi && !M.won(S)) { const c0 = M.candidates(S, 1); if (!c0.length) return null; M.place(S, c0[0]); path.push(c0[0]); }   // 네모 환급 조각은 바로 놓는다
    if (M.won(S)) break;
    let piece;
    const boardTypes = []; S.cells.forEach((q) => { if (q && gc.includes(q.c) && q.t <= 2) boardTypes.push(q); });
    if (rng() < P.d) piece = { c: avail[(rng() * avail.length) | 0], t: 1, s: 0 };
    else if (boardTypes.length && rng() < P.p) { const q = boardTypes[(rng() * boardTypes.length) | 0]; piece = { c: q.c, t: q.t, s: 0 }; }
    else piece = { c: gc[(rng() * gc.length) | 0], t: 1, s: 0 };
    if (piece.c === 1 && piece.t === 1 && rng() < 0.18) piece.s = 1;   // 세모 반짝 조각(위치는 데이터가 정함)
    S.q.push(piece); orig.push(piece); const c = M.candidates(S, 1); if (!c.length) return null; M.place(S, c[0]); path.push(c[0]);
  }
  if (!M.won(S)) return null;
  const base = orig.length, ex = Math.max(1, Math.round(base * P.extra)), tail = []; for (let i = 0; i < ex; i++) tail.push({ c: gc[(rng() * gc.length) | 0], t: 1, s: 0 });
  L.queue = orig.concat(tail).map((q) => ({ c: q.c, t: q.t, s: q.s ? 1 : 0 })); L.solution = path; L.stars = [Math.floor(ex / 2), Math.max(1, ex)];
  return L;
}
const target = (P, n) => ({ tutorial: 0.95, intro: 0.85, rest: 0.92, growth: 0.74 - 0.26 * Math.min(1, n / (N * 0.8)), challenge: 0.32 }[P.t]);
const levels = []; let fail = 0;
for (let n = 1; n <= N; n++) {
  const P0 = params(n); let L = null, gr = 0;
  for (let tries = 0; tries < 14 && !L; tries++) {
    const P = Object.assign({}, P0, { T: tries > 6 ? Math.max(2, P0.T - 1) : P0.T });
    for (let ex = P.extra; ex <= (P0.t === 'rest' ? 1.6 : 1.1); ex += 0.2) {                      // 여유 조각을 늘려 가며 탐욕 성공률 목표를 맞춘다(풀이는 이미 있음)
      const l = build(n, Object.assign({}, P, { extra: ex }), rng0(n * 7919 + tries * 101)); if (!l) break;
      gr = M.greedyWinRate(l, 24, rng0(n + 5)); L = l; if (gr >= target(P0, n)) break;
    }
  }
  if (!L) { fail++; console.log('FAIL', n); continue; }
  const S = M.newGame(L); L.solution.forEach((i) => M.place(S, i)); if (!M.won(S)) { fail++; console.log('검증 실패', n); continue; }
  L.win = +M.randomWinRate(L, 100, rng0(n)).toFixed(2); L.greedy = +M.greedyWinRate(L, 100, rng0(n + 9)).toFixed(2); L.len = L.queue.length;
  levels.push(L);
}
fs.writeFileSync(OUT, JSON.stringify({ version: 1, chapters: CHAPTERS, levels }));
const by = (f) => { const o = {}; levels.forEach((l) => { (o[f(l)] = o[f(l)] || []).push(l); }); return o; }, avg = (a, k) => (a.reduce((x, l) => x + l[k], 0) / a.length).toFixed(2);
console.log('levels', levels.length, 'fail', fail, 'bytes', fs.statSync(OUT).size);
Object.entries(by((l) => l.tag)).forEach(([k, v]) => console.log(k.padEnd(10), v.length, '탐욕', avg(v, 'greedy'), '무작위', avg(v, 'win'), '조각', avg(v, 'len')));
console.log('장별 탐욕:', Object.entries(by((l) => l.chapter)).map(([k, v]) => k + ':' + avg(v, 'greedy')).join(' '));
