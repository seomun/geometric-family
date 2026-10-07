/* 도형 합치기 — 규칙 코어(브라우저·node 공용, 순수 로직). UI·생성기·시뮬레이터가 같은 코드를 쓴다.
   조각 {c:가족 0네모/1세모/2동그라미, t:단계 1~7, s:반짝(세모 대박)}. 규칙(GDD-1):
   1) 조각을 빈 칸에 놓으면 맞닿은(상하좌우) 같은 가족·같은 단계와 자동으로 합쳐져 한 단계 위가 된다. 연쇄 가능.
   2) 🟦 네모 = 많이 쌓임: 셋이 맞닿으면 한꺼번에 합쳐지고 조각 1개를 돌려받는다(환급).
   3) 🔺 세모 = 큰 한 방: 반짝 조각이 합쳐지면 두 단계 뛴다(반짝 위치는 레벨 데이터가 정함 — 랜덤 뽑기 아님).
   4) ⚪ 동그라미 = 정확: 항상 둘씩만 합쳐진다. 덤 없음, 정확한 자리가 중요. */
(function (root) {
  'use strict';
  const MAXT = 7, DIRS = [[0, -1], [-1, 0], [1, 0], [0, 1]];
  const key = (c, t) => c + ':' + t;
  function newGame(L) {
    const cells = new Array(L.cols * L.rows).fill(null);
    (L.pre || []).forEach((p) => { cells[p.i] = { c: p.c, t: p.t, s: !!p.s, k: p.k ? 1 : 0 }; });
    const junk0 = cells.filter((x) => x && x.k).length;
    return { cols: L.cols, rows: L.rows, cells, q: L.queue.map((p) => ({ c: p.c, t: p.t, s: !!p.s })), qi: 0, made: {}, goals: L.goals.map((g) => ({ c: g.c, t: g.t, n: g.n })), moves: 0, bonus: 0, jackpots: 0, rule: L.rule == null ? null : L.rule, moveAt: L.moveAt || 0, clear: !!L.clear, junk0, moved: false };
  }
  const clone = (S) => ({ cols: S.cols, rows: S.rows, cells: S.cells.map((p) => (p ? { c: p.c, t: p.t, s: p.s, k: p.k } : null)), q: S.q.map((p) => ({ c: p.c, t: p.t, s: p.s })), qi: S.qi, made: Object.assign({}, S.made), goals: S.goals, moves: S.moves, bonus: S.bonus, jackpots: S.jackpots, rule: S.rule, moveAt: S.moveAt, clear: S.clear, junk0: S.junk0, moved: S.moved });
  const nb = (S, i) => { const x = i % S.cols, y = (i / S.cols) | 0, o = []; DIRS.forEach(([dx, dy]) => { const X = x + dx, Y = y + dy; if (X >= 0 && X < S.cols && Y >= 0 && Y < S.rows) o.push(Y * S.cols + X); }); return o; };
  const same = (a, b) => a && b && a.c === b.c && a.t === b.t;
  function group(S, i) { const p = S.cells[i], seen = new Set([i]), st = [i]; while (st.length) { const j = st.pop(); nb(S, j).forEach((k) => { if (!seen.has(k) && same(S.cells[k], p)) { seen.add(k); st.push(k); } }); } return [...seen]; }
  /** 칸 idx 에 다음 조각을 놓는다. 이벤트 목록 반환: {type:'merge', at, from:[i..], c, t, jackpot, refund} */
  const snap = (S) => ({ rows: S.rows, cells: S.cells.map((p) => (p ? { c: p.c, t: p.t, s: p.s, k: p.k } : null)) });
  function place(S, idx, trace) {
    if (S.cells[idx] || S.qi >= S.q.length) return null;
    const ev = []; S.cells[idx] = S.q[S.qi++]; S.moves++; if (trace) trace.push(snap(S));   // trace: 놓은 직후·합치기마다 판 모습(연출용)
    let guard = 0;
    while (guard++ < 40) {
      const p = S.cells[idx]; if (!p || p.t >= MAXT) break;
      const g = group(S, idx); if (g.length < 2) break;
      const fam = S.rule != null ? S.rule : p.c;   // 세 가족 판: 모든 조각이 한 가족의 규칙을 따른다
      let take; if (fam === 0 && g.length >= 3) take = [idx].concat(g.filter((j) => j !== idx).slice(0, 2)); else take = [idx].concat(g.filter((j) => j !== idx && nb(S, idx).includes(j)).slice(0, 1));
      if (take.length < 2) break;
      const shiny = take.some((j) => S.cells[j].s), jump = fam === 1 && shiny ? 2 : 1, nt = Math.min(MAXT, p.t + jump), refund = fam === 0 && take.length === 3, cleared = take.filter((j) => S.cells[j].k).length;
      take.forEach((j) => { S.cells[j] = null; }); S.cells[idx] = { c: p.c, t: nt, s: false, k: 0 };
      S.made[key(p.c, nt)] = (S.made[key(p.c, nt)] || 0) + 1; if (jump === 2) { S.jackpots++; S.made[key(p.c, nt - 1)] = (S.made[key(p.c, nt - 1)] || 0) + 1; }
      if (refund) { S.q.splice(S.qi, 0, { c: p.c, t: 1, s: false }); S.bonus++; }
      ev.push({ type: 'merge', at: idx, from: take.slice(), c: p.c, t: nt, jackpot: jump === 2, refund, cleared }); if (trace) trace.push(snap(S));
    }
    if (S.moveAt && !S.moved && S.qi >= S.moveAt) { S.moved = true; S.rows++; for (let i = 0; i < S.cols; i++) S.cells.push(null); ev.push({ type: 'move' }); if (trace) trace.push(snap(S)); }
    return ev;
  }
  const junkLeft = (S) => S.cells.filter((x) => x && x.k).length;
  const won = (S) => S.goals.every((g) => (S.made[key(g.c, g.t)] || 0) >= g.n) && (!S.clear || junkLeft(S) === 0);
  const left = (S) => S.q.length - S.qi;
  const empty = (S) => { const o = []; S.cells.forEach((p, i) => { if (!p) o.push(i); }); return o; };
  const lost = (S) => !won(S) && (left(S) <= 0 || empty(S).length === 0);
  const progress = (S) => { const tot = S.goals.reduce((a, g) => a + g.n, 0) + (S.clear ? S.junk0 : 0) || 1; return (S.goals.reduce((a, g) => a + Math.min(g.n, S.made[key(g.c, g.t)] || 0), 0) + (S.clear ? S.junk0 - junkLeft(S) : 0)) / tot; };
  /** 별: 남은 조각 수 기준(레벨 데이터 stars=[2별,3별]) */
  const stars = (S, L) => (left(S) >= L.stars[1] ? 3 : left(S) >= L.stars[0] ? 2 : 1);
  /* 평가 휴리스틱: 목표 진척 + 판 위 가치 + 빈칸 + 맞닿은 같은 조각 */
  function score(S) {
    let v = progress(S) * 1000, val = 0, adj = 0;
    S.cells.forEach((p, i) => { if (p) { val += Math.pow(2, p.t) * (S.goals.some((g) => g.c === p.c) ? 1.3 : 0.7); nb(S, i).forEach((k) => { if (same(S.cells[k], p)) adj += 1; }); } });
    return v + val * 0.8 + empty(S).length * 6 - adj * 2;
  }
  /** 다음 조각을 놓을 후보 칸(가지치기): 합쳐지는 칸 > 같은 가족 옆 > 좁은 칸. 풀이·힌트가 이 후보만 본다 */
  function candidates(S, k) {
    const p = S.q[S.qi]; if (!p) return [];
    const sc = empty(S).map((i) => {
      const S2 = clone(S); place(S2, i); let val = 0, types = new Set(), frag = 0;
      S2.cells.forEach((q, j) => { if (q) { val += Math.pow(2, q.t); types.add(q.c + ':' + q.t); if (!nb(S2, j).some((m) => !S2.cells[m] || same(S2.cells[m], q))) frag++; } });
      return { i, v: progress(S2) * 1000 + empty(S2).length * 10 + val * 0.6 - types.size * 5 - frag * 4 + (S2.bonus - S.bonus) * 12 };
    });
    sc.sort((x, y) => y.v - x.v); return sc.slice(0, k).map((x) => x.i);
  }
  /** 사람 같은 탐욕 플레이로 이길 확률(난이도 지표: 0.5~0.9 가 적당) */
  function greedyWinRate(L, trials, rng) {
    let w = 0; for (let k = 0; k < trials; k++) { const S = newGame(L); while (!won(S) && !lost(S)) { const c = candidates(S, 3); place(S, c[rng() < 0.75 ? 0 : Math.min(c.length - 1, 1 + ((rng() * 2) | 0))]); } if (won(S)) w++; } return w / trials;
  }
  /** 빔 서치: 풀 수 있으면 {ok, path:[idx..]}, 못 풀면 {ok:false}. width 가 클수록 강함 */
  function solve(L, width) {
    width = width || 60; let beam = [{ S: newGame(L), path: [] }];
    for (let step = 0; step < L.queue.length * 2 + 4; step++) {
      const next = [];
      for (const b of beam) {
        if (won(b.S)) return { ok: true, path: b.path, left: left(b.S) };
        if (lost(b.S)) continue;
        candidates(b.S, 6).forEach((i) => { const S2 = clone(b.S); place(S2, i); next.push({ S: S2, path: b.path.concat(i), sc: score(S2) }); });
      }
      if (!next.length) break;
      next.sort((a, b) => b.sc - a.sc);
      const seen = new Set(), pick = []; for (const n of next) { const h = n.S.qi + '|' + n.S.cells.map((p) => (p ? p.c + '' + p.t + (p.s ? 's' : '') : '.')).join(''); if (!seen.has(h)) { seen.add(h); pick.push(n); if (pick.length >= width) break; } }
      beam = pick;
    }
    const w = beam.find((b) => won(b.S)); return w ? { ok: true, path: w.path, left: left(w.S) } : { ok: false };
  }
  /** 난이도 지표: 무작위로 놓았을 때 성공 비율(0~1). 낮을수록 어렵다 */
  function randomWinRate(L, trials, rng) {
    let w = 0; for (let k = 0; k < trials; k++) { const S = newGame(L); while (!won(S) && !lost(S)) { const e = empty(S); place(S, e[(rng() * e.length) | 0]); } if (won(S)) w++; } return w / trials;
  }
  const api = { junkLeft, MAXT, newGame, clone, place, won, lost, left, empty, stars, progress, solve, randomWinRate, greedyWinRate, candidates, key, nb };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MergeCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
