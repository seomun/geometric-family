/* 정리의 달인 판 생성기(브라우저·node 공용). make(n, seed, opts) → 풀 수 있음이 구성으로 보장된 판.
   만드는 법: 칸마다 한 종류가 가득 찬 「정리된 상태」에서 시작해 「정방향으로 가능한 한 수」의 역수를 K번 적용(거꾸로 섞기) → 그 수를 거꾸로 따르면 반드시 풀림.
   난이도 = 종류 수(3→10)·섞기 깊이·빈 칸 수. 판 종류: sort 정리하기 · limit 한도(칸마다 용량이 다름) · locked 잠긴 칸 · hidden 가려진 칸 · family 세 가족 정리.
   공통 판(오늘의 한 판·시즌·사연·세 가족 규칙)은 UI 가 make 에 type/rule 을 줘서 만든다. 그림은 pal(그림 키 목록): w:아이템id(세계관 소품) · e:이모지 · s:장:번호(이야기 상징) · f:번호(가족 얼굴). */
(function (root) {
  'use strict';
  const C = typeof module !== 'undefined' ? require('./sort-core.js') : root.SortCore;
  const mulberry = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const CHAPTERS = ['아기돼지 삼형제', '브레멘 음악대', '견우와 직녀', '세 마리 곰', '잭과 콩나무', '콩쥐팥쥐', '흥부 박', '우렁 각시', '금도끼 은도끼', '개미와 베짱이', '해님 달님', '토끼와 거북이'];
  const TYPE_NAME = { sort: '정리하기', pair: '짝 칸', limit: '좁은 칸', locked: '잠긴 칸', hidden: '가려진 칸', family: '세 가족 정리' };
  const WORLD = ['p_mix', 'p_lunch', 'p_pill', 'p_glass', 'p_env', 'p_kimchi', 'p_rice', 'p_remote', 'p_tea', 'p_book', 'p_label', 'p_pass', 'p_clock', 'p_ramen', 'p_phone', 'p_chair', 'p_flower', 'p_pair', 'p_photo', 'p_bagt'];
  const EMOJI = ['👟', '🧦', '👕', '🥚', '🍎', '🥕', '🧅', '🧴', '🧸', '🥫', '🍶', '🧃', '🥛', '👞', '🧤', '🧣', '🎒', '🔑', '🍋', '🥔'];
  const SEQ = ['sort', 'limit', 'pair', 'hidden', 'family', 'locked', 'sort', 'hidden', 'limit', 'locked', 'family', 'pair'], MIN_N = { pair: 6, limit: 4, hidden: 8, locked: 6, family: 7 };
  const typeOf = (n) => { if (n <= 3 || n % 5 === 0) return 'sort'; const t = SEQ[(n - 4) % SEQ.length]; return n >= (MIN_N[t] || 0) ? t : 'sort'; };
  const tagOf = (n) => (n <= 3 ? 'tutorial' : n % 5 === 0 ? 'rest' : n <= 12 ? 'intro' : 'growth');
  const shuf = (rng, a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (rng() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function palette(rng, nk, chapter, type, n) {
    if (type === 'family') return shuf(rng, [0, 1, 2, 3, 4, 5]).slice(0, nk).map((i) => 'f:' + i);
    const ch = (chapter - 1) % 12, sym = shuf(rng, [0, 1, 2]).slice(0, Math.min(2, nk - 1)).map((i) => 's:' + ch + ':' + i), rest = nk - sym.length;
    const nw = Math.min(rest, Math.max(1, Math.ceil(rest * 0.6))), w = shuf(rng, WORLD).slice(0, nw).map((x) => 'w:' + x), e = shuf(rng, EMOJI).slice(0, rest - nw).map((x) => 'e:' + x);
    return shuf(rng, sym.concat(w, e));
  }
  /** 한 판. opts: {type, rule, noGreedy} → null 이면 실패 */
  function make(n, seed, opts) {
    opts = opts || {}; const type = opts.type || typeOf(n), tag = opts.tag || tagOf(n), chapter = Math.min(CHAPTERS.length, ((n - 1) / 10 | 0) + 1), rule = opts.rule == null ? -1 : opts.rule, prog = Math.min(1, (n - 1) / ((opts.total || 120) - 1)), rest = tag === 'rest';
    for (let attempt = 0; attempt < 60; attempt++) {
      const rng = mulberry(seed * 977 + attempt * 131 + 5);
      let nk = type === 'family' ? 3 + Math.min(3, (prog * 4) | 0) : Math.max(3, Math.min(10, Math.round(3 + prog * 6.8) - (rest ? 1 : 0)));
      if (n <= 3 && !opts.rule && rule < 0) nk = 3;
      if (type === 'locked') nk = Math.min(nk, 9);   // 칸은 12개를 넘지 않게(칸 폭 44px 이상)
      const hard = prog > 0.7 && n % 2 === 0 && type !== 'locked', e = tag === 'tutorial' ? 2 : hard ? 1 : 2, base = n <= 3 ? 3 : prog < 0.5 ? 4 : 4 + ((n + attempt) % 5 === 0 ? 1 : 0);
      const per = type === 'pair' ? 2 : 1; if (type === 'pair') nk = Math.max(2, Math.min(5, Math.round(2 + prog * 3.4) - (rest ? 1 : 0)));
      let counts = Array.from({ length: nk }, () => base * per);
      if (type === 'limit') counts = counts.map((_, i) => 3 + ((rng() * 3) | 0)); if (type === 'limit' && new Set(counts).size < 2) counts[0] = counts[0] === 5 ? 3 : counts[0] + 1;
      const cmax = Math.max(...counts) / per, kinds = Array.from({ length: nk }, (_, i) => i);
      const tubes0 = [], caps = []; kinds.forEach((k) => { for (let q = 0; q < per; q++) { tubes0.push(Array(counts[k] / per).fill(k)); caps.push(counts[k] / per); } });
      for (let i = 0; i < e; i++) { tubes0.push([]); caps.push(cmax); }
      const locked = []; if (type === 'locked') { tubes0.push([]); caps.push(cmax); locked.push(tubes0.length - 1); }
      const items = counts.reduce((a, b) => a + b, 0), steps = Math.round(items * (n <= 3 ? 0.55 : 0.8 + prog * 1.3) * (type === 'hidden' ? 0.85 : 1));
      const sc = C.scramble(tubes0, caps, rng, steps, locked); if (sc.path.length < steps * 0.8) { if (opts.debug) console.log("short", sc.path.length, steps); continue; }
      const L = { pair: type === 'pair', id: n, type, tag, chapter, tubes: sc.tubes, caps, nk, counts, empties: e, locked, hidden: type === 'hidden', rule, pal: palette(rng, nk, chapter, type, n), steps: sc.path.length };
      if (rule === 1) L.shiny = L.tubes.map((t) => t.map(() => 0)); if (rule === 1) { const cells = []; L.tubes.forEach((t, i) => t.forEach((_, k) => cells.push([i, k]))); shuf(rng, cells).slice(0, Math.max(2, nk >> 1)).forEach(([i, k]) => { L.shiny[i][k] = 1; }); }
      const S = C.newGame(L, rule); if (C.doneCount(S) > 0 && n > 1) continue; if (C.mixed(S) < Math.max(2, nk - 1)) continue;
      if (rule < 0) { const R = C.newGame(L); let ok = true; for (const [a, b] of sc.path) if (!C.move(R, a, b)) { ok = false; break; } if (!ok || !R.won) continue; }
      const m = C.solve(S, 60, 200); if (!m) continue;
      L.par = Math.min(sc.path.length, m.length); L.solution = rule < 0 ? sc.path : m;
      if (!opts.noGreedy && n > 3) { const g = C.greedyWinRate(L, 24, mulberry(seed + 3), 0.1, rule); L.greedy = Math.round(g * 100) / 100; if (g < (prog < 0.4 ? 0.5 : 0.25)) continue; } else L.greedy = 1;
      return L;
    }
    return null;
  }
  const api = { mulberry, CHAPTERS, TYPE_NAME, WORLD, EMOJI, typeOf, tagOf, make };
  if (typeof module !== 'undefined') module.exports = api; else root.SortGen = api;
})(typeof window !== 'undefined' ? window : globalThis);
