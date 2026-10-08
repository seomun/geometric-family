/* 도형 블록 판 생성기(브라우저·node 공용). make(n, seed, opts) → 풀 수 있음이 확인된 판. 판 종류 7: lines 줄 지우기 · family 도형 모으기 · junk 짐 치우기 · combo 한꺼번에 · star 반짝 칸 · limit 조각 수 제한 · solo 한 가족만.
   공통 판 4(오늘의 한 판·시즌·사연·세 가족)는 UI 쪽에서 make 를 다른 시드·규칙으로 불러 만든다. 난이도는 장이 갈수록 조각이 커지고 목표가 늘며, 탐욕 승률로 곡선을 잰다(tools/block_sim.js). */
(function (root) {
  'use strict';
  const C = typeof module !== 'undefined' ? require('./block-core.js') : root.BlockCore;
  const mulberry = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const CHAPTERS = ['아기돼지 삼형제', '브레멘 음악대', '견우와 직녀', '세 마리 곰', '잭과 콩나무', '콩쥐팥쥐', '흥부 박', '우렁 각시', '금도끼 은도끼', '개미와 베짱이', '해님 달님', '토끼와 거북이'];
  const TYPE_NAME = { lines: '줄 지우기', family: '도형 모으기', junk: '짐 치우기', combo: '한꺼번에', star: '반짝 칸', limit: '조각 아껴 쓰기', solo: '한 가족만' };
  // 장마다 한 판 10개: 위치별 종류(쉬어 가기는 5·10번째, 새 종류는 장 앞쪽에 하나씩 소개)
  const A = ['lines', 'lines', 'lines', 'family', 'lines', 'junk', 'star', 'family', 'combo', 'lines'], B = ['limit', 'lines', 'solo', 'junk', 'lines', 'star', 'combo', 'limit', 'family', 'lines'], Cc = ['family', 'lines', 'junk', 'lines', 'lines', 'combo', 'solo', 'star', 'limit', 'lines'],
    Dd = ['star', 'lines', 'family', 'limit', 'lines', 'junk', 'combo', 'solo', 'lines', 'lines'], E = ['junk', 'family', 'lines', 'combo', 'lines', 'star', 'limit', 'lines', 'solo', 'lines'], F = ['combo', 'lines', 'star', 'family', 'lines', 'limit', 'junk', 'lines', 'family', 'lines'];
  const CYCLE = [A, B, Cc, Dd, E, F];   // 장마다 한 줄(6장 주기): 쉬어 가기는 5·10번째
  const typeOf0 = (n) => { const ch = ((n - 1) / 10) | 0, pos = (n - 1) % 10; return CYCLE[ch % 6][pos]; };
  const SEQ = (() => { const q = []; for (let n = 1; n <= 400; n++) q.push(typeOf0(n)); for (let i = 3; i < q.length; i++) if (q[i] === q[i - 1] && q[i] === q[i - 2] && q[i] === q[i - 3]) q[i] = q[i] === 'lines' ? 'family' : 'lines'; return q; })();
  const typeOf = (n) => SEQ[n - 1] || typeOf0(n);
  const tagOf = (n) => (n <= 3 ? 'tutorial' : n % 5 === 0 ? 'rest' : n <= 12 ? 'intro' : 'growth');
  const pick = (rng, a) => a[(rng() * a.length) | 0];

  function pieceFor(rng, prog, tag) {
    const w = tag === 'tutorial' ? [0.85, 0.15, 0] : tag === 'rest' ? [0.6, 0.4, 0] : [Math.max(0.2, 0.7 - prog * 0.8), 0.4, Math.min(0.4, 0.05 + prog * 0.8)];
    const x = rng() * (w[0] + w[1] + w[2]); const grp = x < w[0] ? 'small' : x < w[0] + w[1] ? 'mid' : 'big';
    return pick(rng, C.BY_SIZE[grp]);
  }
  /** 판 하나. opts: {type, rule(세 가족 판), noSolve} */
  function make(n, seed, opts) {
    opts = opts || {}; const type = opts.type || typeOf(n), tag = opts.tag || tagOf(n), prog = Math.min(1, (n - 1) / 119), chapter = Math.min(CHAPTERS.length, ((n - 1) / 10 | 0) + 1);
    let best = null;
    for (let k = 0; k < (type === 'combo' ? 48 : 14); k++) {
      const rng = mulberry((seed || n * 7919) + k * 104729 + n), L = { id: n, chapter, tag, type, goal: { t: type }, pre: [], stars: [], queue: [], lim: null, rule: opts.rule == null ? -1 : opts.rule };
      const lines = n <= 3 ? 2 + (n > 1 ? 1 : 0) : Math.min(16, 3 + Math.floor(n / 3)), fam = n % 3;
      if (type === 'lines' || type === 'solo' || type === 'limit') L.goal = { t: type, n: lines };
      if (type === 'family') { const f = (n + k) % 3; L.goal = { t: 'family', f, n: Math.min(30, 8 + Math.floor(n * 0.9)) }; }
      if (type === 'combo') L.goal = { t: 'combo', n: n < 12 ? 2 : 3 };   // 요구 연쇄는 최대 3
      if (type === 'junk') { const m = Math.min(14, 4 + Math.floor(n / 6)); const used = new Set(); while (used.size < m) { const r = 2 + ((rng() * 6) | 0), c = (rng() * 8) | 0; used.add(r * 8 + c); } used.forEach((i) => L.pre.push([i, 9])); L.goal = { t: 'junk' }; }
      if (type === 'star') { const m = Math.min(6, 2 + Math.floor(n / 14)); const used = new Set(); while (used.size < m) used.add(((rng() * 64) | 0)); L.stars = [...used]; L.goal = { t: 'star' }; }
      const qlen = Math.min(78, 21 + Math.floor(n * 0.9) + (type === 'family' ? 12 : 0) + (type === 'junk' ? 9 : 0) + (type === 'combo' ? 9 : 0) + (type === 'star' ? 12 : 0)), solo = type === 'solo' ? n % 3 : -1;
      for (let i = 0; i < qlen; i++) {
        let c = (rng() * 3) | 0; if (solo >= 0) c = solo; else if (type === 'family' && rng() < 0.5) c = L.goal.f;
        L.queue.push([pieceFor(rng, prog, tag), c, opts.rule === 1 && rng() < 0.18 ? 1 : 0]);
      }
      if (opts.noSolve) return L;
      const lim0 = type === 'limit' ? qlen : null; L.lim = lim0;
      const sol = C.solve(L, { beam: 120 });
      if (!sol.win) continue;
      if (type === 'limit') L.lim = Math.max(sol.used + 3, Math.ceil(sol.used * 1.2));
      // 조각 열을 풀이에 맞춰 줄인다(여유 ×1.6 → 장이 갈수록 ×1.25): 너무 느슨하면 심심하다. 줄여도 풀리는 것을 다시 확인
      if (type !== 'limit') { const slack = (type === 'combo' ? 1.5 + 0.05 * k : 1) * (tag === 'tutorial' ? 2.2 : tag === 'rest' ? 1.8 : 1.7 - 0.5 * prog), cut = Math.min(L.queue.length, Math.max(9, Math.ceil(sol.used * slack / 3) * 3)); if (cut < L.queue.length) { const full = L.queue; L.queue = full.slice(0, cut); const again = C.solve(L, { beam: 120 }); if (!again.win) { L.queue = full; } else { sol.moves = again.moves; sol.used = again.used; } } }
      L.par = sol.used; L.s3 = sol.used + 3; L.s2 = sol.used + 8; L.solution = sol.moves;
      if (!opts.noGreedy) {
        const hard = type === 'junk' || type === 'star' || type === 'combo' || type === 'limit', floor = type === 'combo' ? { tutorial: 0.35, rest: 0.35, intro: 0.35, growth: 0.35 }[tag] : hard ? { tutorial: 0.5, rest: 0.4, intro: 0.3, growth: 0.2 }[tag] : { tutorial: 0.9, rest: 0.8, intro: 0.6, growth: 0.4 }[tag]; L.greedy = +C.greedyWinRate(L, 40, mulberry(n + 17)).toFixed(2);
        if (L.greedy < floor && !opts.type) { if (!best || L.greedy > best.greedy) best = L; continue; }   // 하한 미달 판은 다시 만들고, 끝내 못 맞추면 가장 나은 판
      }
      return L;
    }
    return best;
  }
  /** 끝없이 모드: 조각이 끝없이 이어지고(처음엔 쉬운 조각, 갈수록 큰 조각) 놓을 자리가 없을 때 끝난다. 벌 없음, 최고 점수만 기록 */
  function makeEndless(seed) {
    const rng = mulberry((seed || 12345) * 7919 + 17), L = { id: 'endless', kind: 'endless', chapter: 0, tag: 'growth', type: 'lines', goal: { t: 'endless' }, pre: [], stars: [], queue: [], lim: null, rule: -1, par: 0, s2: 0, s3: 0, solution: [] };
    for (let i = 0; i < 3000; i++) L.queue.push([pieceFor(rng, Math.min(0.9, i / 400), i < 9 ? 'rest' : 'growth'), (rng() * 3) | 0, 0]);
    return L;
  }
  const api = { mulberry, CHAPTERS, TYPE_NAME, typeOf, tagOf, make, makeEndless };
  if (typeof module !== 'undefined') module.exports = api; else root.BlockGen = api;
})(typeof window !== 'undefined' ? window : globalThis);
