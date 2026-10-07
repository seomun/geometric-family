/* 도형 합치기 레벨 생성기(라이브러리) — node 생성 도구와 브라우저(오늘의 한 판·시즌 판·세 가족 판)가 같은 코드를 쓴다.
   방식 = "풀이를 따라 만든다": 목표를 정하고, 탐욕 플레이로 실제로 놓아 가며 다음 조각을 고른다 → 만들어진 조각 줄 + 풀이 경로가 곧 "풀 수 있음"의 증거.
   판 종류(type): make 만들기 · order 주문 · tight 좁은 집 · solo 한 가족만 · clear 짐 치우기 · move 이사 · kimjang 김장. rule: 세 가족 판(모든 조각이 한 가족 규칙을 따름). */
(function (root) {
  'use strict';
  const M = typeof module !== 'undefined' && module.exports ? require('./merge-core.js') : root.MergeCore;
  const mulberry = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const CHAPTERS = ['새집 첫날', '식탁 차리기', '이삿짐 정리', '화장실 하나', '냉장고 정리', '거실 꾸미기', '김장하는 날', '손님이 온다', '큰 상 차리기', '이사 가는 날', '동네 한 바퀴', '세 가족 한자리'];
  const FEATURED = ['make', 'order', 'tight', 'solo', 'clear', 'move', 'kimjang', 'order', 'clear', 'move', 'solo', 'tight'];   // 장마다 새 판 종류 1개를 소개
  const TYPE_NAME = { make: '만들기', order: '주문', tight: '좁은 집', solo: '한 가족만', clear: '짐 치우기', move: '이사', kimjang: '김장' };
  const typeOf0 = (n) => { const ch = ((n - 1) / 10 | 0), pos = (n - 1) % 10 + 1; if (n <= 3 || pos === 5 || pos === 10) return 'make'; if (pos === 3 || pos === 7) return FEATURED[ch]; if (pos === 2 && ch > 0) return FEATURED[ch - 1]; if (pos === 8 && ch > 3) return FEATURED[ch - 3]; return pos === 9 && ch > 0 ? 'order' : 'make'; };
  // 같은 판 종류가 3판을 넘게 이어지지 않게 한다(손맛 단조로움 방지): 4번째가 같으면 주문(만들기였다면) / 만들기(주문이었다면)로 바꾼다
  const SEQ = (() => { const q = []; for (let n = 1; n <= 400; n++) q.push(typeOf0(n)); for (let i = 3; i < q.length; i++) if (q[i] === q[i - 1] && q[i] === q[i - 2] && q[i] === q[i - 3]) q[i] = q[i] === 'order' ? 'make' : 'order'; return q; })();
  const typeOf = (n) => SEQ[n - 1] || typeOf0(n);
  const tagOf = (n, N) => (n <= 3 ? 'tutorial' : n % 5 === 0 && n > 5 ? 'rest' : n <= 12 ? 'intro' : n > N * 0.8 ? 'challenge' : 'growth');
  function params(n, N, type) {
    N = N || 120; const t = tagOf(n, N), f = Math.min(1, n / (N * 0.85)); type = type || typeOf(n);
    const T0 = n <= 3 ? 2 + (n > 1 ? 1 : 0) : n <= 30 ? 3 : n <= 108 ? 4 : 5, T = t === 'rest' ? Math.max(2, T0 - 1) : T0;
    let cg = n < 8 ? 1 : n < 100 ? 2 : 3, cols = n <= 20 ? 4 : 5, rows = n <= 20 ? 4 : n <= 50 ? 5 : 6; if (n > 90) cols = 6;
    const p = { tutorial: 0.97, intro: 0.9, rest: 0.98, growth: 0.85 - 0.2 * f, challenge: 0.78 }[t], d = n < 60 ? 0 : { tutorial: 0, intro: 0.05, rest: 0.03, growth: 0.06 + 0.06 * f, challenge: 0.1 }[t];
    let extra = { tutorial: 0.8, intro: 0.6, rest: 0.8, growth: 0.45 - 0.12 * f, challenge: 0.25 }[t], goalT = T, nGoal = 1, moveAt = 0, clear = 0, solo = false, junkT = 2;
    if (t === 'rest') { rows = Math.min(6, rows + 1); }   // 쉬어 가기: 판을 한 단계 키워 숨통을 틔운다
    if (type === 'order') { cg = Math.min(3, Math.max(2, cg)); nGoal = n > 80 ? 2 : 1; }
    if (type === 'tight') { cols = Math.max(3, cols - 1); rows = Math.max(3, rows - 1); goalT = Math.max(2, T - 1); extra += 0.2; }
    if (type === 'solo') { cg = 1; solo = true; goalT = Math.min(5, T + 1); extra += 0.1; }
    if (type === 'clear') { cg = Math.max(1, Math.min(cg, 2)); clear = 2 + (n > 60 ? 1 : 0) + (n > 100 ? 1 : 0); junkT = n > 50 ? 3 : 2; goalT = Math.max(2, T - 1); extra += 0.15; }
    if (type === 'move') { rows = Math.max(3, rows - 1); moveAt = 8 + Math.min(10, (n / 12) | 0); extra += 0.15; }
    if (type === 'kimjang') { cg = 1; goalT = 3; nGoal = 3 + Math.min(3, (n / 40) | 0); extra += 0.2; }
    return { type, t, T: goalT, cg, cols, rows, p, d, extra, nGoal, moveAt, clear, solo, junkT };
  }
  /** 한 판을 만든다. 실패하면 null. opts.rule = 세 가족 판(0|1|2), opts.fixed = {chs:[…]} */
  function build(n, P, rng, opts) {
    opts = opts || {};
    const solo = P.solo ? [(n * 2) % 3] : null, avail = solo || (n < 4 ? [0] : n < 8 ? [0, 1] : [0, 1, 2]);
    let chs = n < 4 ? [0] : n < 8 ? [1] : []; if (solo) chs = solo.slice(); else if (!chs.length) [(n * 2) % 3, (n * 2 + 1) % 3, (n * 2 + 2) % 3].forEach((c) => { if (chs.length < P.cg && avail.includes(c)) chs.push(c); });
    const goals = chs.map((c, i) => ({ c, t: Math.max(2, P.T - i), n: (P.type === 'kimjang' ? P.nGoal : P.nGoal) + (n > 105 && i === 0 && P.type === 'make' ? 1 : 0) }));
    const pre = [], used = new Set();
    if (P.clear) for (let j = 0; j < P.clear; j++) { const i = (rng() * P.cols * P.rows) | 0; if (!used.has(i)) { used.add(i); pre.push({ i, c: chs[(rng() * chs.length) | 0], t: P.junkT, k: 1 }); } }
    else if (n > 70 && (P.t === 'challenge' || n % 4 === 0)) { const k = 1 + Math.min(2, ((n - 70) / 25) | 0); for (let j = 0; j < k; j++) { const i = (rng() * P.cols * P.rows) | 0; if (!used.has(i)) { used.add(i); pre.push({ i, c: avail[(rng() * avail.length) | 0], t: 4 }); } } }
    const L = { id: n, type: P.type, chapter: ((n - 1) / 10 | 0) + 1, tag: P.t, cols: P.cols, rows: P.rows, goals, queue: [], pre, stars: [0, 1], clear: P.clear ? 1 : 0, moveAt: P.moveAt || 0, rule: opts.rule == null ? null : opts.rule };
    const S = M.newGame(L), gc = goals.map((g) => g.c), path = [], orig = [];
    for (let k = 0; k < 140 && !M.won(S); k++) {
      while (S.q.length > S.qi && !M.won(S)) { const c0 = M.candidates(S, 1); if (!c0.length) return null; M.place(S, c0[0]); path.push(c0[0]); }   // 네모 환급 조각은 바로 놓는다
      if (M.won(S)) break;
      let piece; const boardTypes = []; S.cells.forEach((q) => { if (q && gc.includes(q.c) && q.t <= 2) boardTypes.push(q); });
      if (!solo && rng() < P.d) piece = { c: avail[(rng() * avail.length) | 0], t: 1, s: 0 };
      else if (boardTypes.length && rng() < P.p) { const q = boardTypes[(rng() * boardTypes.length) | 0]; piece = { c: q.c, t: q.t, s: 0 }; }
      else piece = { c: gc[(rng() * gc.length) | 0], t: 1, s: 0 };
      if ((piece.c === 1 || opts.rule === 1) && piece.t === 1 && rng() < 0.18) piece.s = 1;   // 반짝 조각(위치는 데이터가 정함)
      S.q.push(piece); orig.push(piece); const c = M.candidates(S, 1); if (!c.length) return null; M.place(S, c[0]); path.push(c[0]);
    }
    if (!M.won(S)) return null;
    const base = orig.length; if (P.t === 'challenge' && base > 52) return null;   // 도전판 조각 상한(60 = 풀이 + 여유)
    const ex = Math.max(1, Math.round(base * P.extra)), tail = []; for (let i = 0; i < ex; i++) tail.push({ c: gc[(rng() * gc.length) | 0], t: 1, s: 0 });
    if (P.t === 'challenge') { while (orig.length + tail.length > 60 && tail.length > 1) tail.pop(); }
    L.queue = orig.concat(tail).map((q) => ({ c: q.c, t: q.t, s: q.s ? 1 : 0 })); L.solution = path; L.stars = [Math.floor(ex / 2), Math.max(1, ex)];
    return L;
  }
  const greedyTarget = (P, n, N) => ({ tutorial: 0.95, intro: 0.85, rest: 0.85, growth: 0.74 - 0.26 * Math.min(1, n / ((N || 120) * 0.8)), challenge: 0.4 }[P.t]);
  /** 한 판 생성(목표 탐욕 성공률에 맞춰 여유 조각을 늘려 가며). seedBase 로 같은 입력 = 같은 판. */
  function make(n, N, seedBase, opts) {
    opts = opts || {}; const P0 = params(n, N, opts.type), want = greedyTarget(P0, n, N); let L = null, best = null, bestG = -1, hit = false;
    const tries = P0.t === 'challenge' ? 30 : 14;
    for (let t = 0; t < tries && !hit; t++) {
      const P = Object.assign({}, P0, { T: t > tries / 2 ? Math.max(2, P0.T - 1) : P0.T });
      for (let ex = P.extra; ex <= (P0.t === 'rest' ? 2.6 : P0.t === 'challenge' ? 1.5 : 1.2); ex += 0.2) {
        const l = build(n, Object.assign({}, P, { extra: ex }), mulberry((seedBase || n * 7919) + t * 101), opts); if (!l) break;
        L = l; if (opts.noGreedy) { hit = true; break; }
        const g = M.greedyWinRate(l, P0.t === 'rest' ? 40 : 24, mulberry(n + 5)); if (g > bestG) { bestG = g; best = l; }
        if (g >= want) { hit = true; break; }
      }
    }
    L = hit ? L : (best || L);   // 목표를 못 맞추면 가장 쉬웠던 후보(도전판은 하한 0.40 을 위해 시도를 더 한다)
    if (!L && (opts.type || typeOf(n)) !== 'make') return make(n, N, seedBase, Object.assign({}, opts, { type: 'make' }));   // 안 만들어지면 만들기로 대체
    return L;
  }
  const api = { mulberry, CHAPTERS, FEATURED, TYPE_NAME, typeOf, tagOf, params, build, make, greedyTarget };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MergeGen = api;
})(typeof window !== 'undefined' ? window : globalThis);
