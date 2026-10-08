/* 정리의 달인 규칙 코어(순수 함수, 브라우저·node 공용). 분류·정렬 퍼즐(볼 소트형) 문법 그대로:
   칸(투명한 세로 통)을 눌러 맨 위 물건을 집고 다른 칸에 옮긴다. 받는 칸이 비었거나 맨 위가 같은 그림이고 자리가 남아 있을 때만 들어간다.
   모든 칸이 한 종류로 정리되고(같은 그림이 두 칸에 나뉘지 않으면) 클리어. 한 번에 한 개씩 옮긴다. 판은 정리된 상태에서 「거꾸로 섞어」 만들므로 항상 풀 수 있다.
   가족 규칙(세 가족 판): 0 네모 = 시작부터 빈 칸이 하나 더 · 1 세모 = 반짝 물건은 맨 위에 있을 때 어떤 그림 위에도 얹을 수 있음 · 2 동그라미 = 같은 그림이 이어진 맨 위 묶음을 한 번에 통째로 옮김. */
(function (root) {
  'use strict';
  /** L = {tubes:[[kind…bottom→top]], caps:[…], shiny:[[idx…]], locked:[tubeIdx…], hidden:bool, rule} */
  function newGame(L, rule) {
    const r = rule == null ? (L.rule == null ? -1 : L.rule) : rule;
    const S = { L, rule: r, tubes: L.tubes.map((t) => t.slice()), caps: L.caps.slice(), shiny: L.tubes.map((t, i) => (L.shiny && L.shiny[i] ? L.shiny[i].slice() : t.map(() => 0))), locked: (L.locked || []).slice(), moves: 0, used: { undo: 0, extra: 0, hint: 0 }, extraAdded: false, rev: L.tubes.map((t) => t.map((x, k) => k === t.length - 1)), won: false };
    if (r === 0) addTube(S);
    return S;
  }
  function addTube(S) { S.tubes.push([]); S.caps.push(Math.max(...S.caps)); S.shiny.push([]); S.rev.push([]); }
  const clone = (S) => ({ L: S.L, rule: S.rule, tubes: S.tubes.map((t) => t.slice()), caps: S.caps.slice(), shiny: S.shiny.map((t) => t.slice()), locked: S.locked.slice(), moves: S.moves, used: Object.assign({}, S.used), extraAdded: S.extraAdded, rev: S.rev.map((t) => t.slice()), won: S.won });
  const top = (S, i) => S.tubes[i][S.tubes[i].length - 1];
  const isDone = (S, i) => S.tubes[i].length > 0 && S.tubes[i].length === S.caps[i] && S.tubes[i].every((k) => k === S.tubes[i][0]);
  const doneCount = (S) => S.tubes.reduce((a, t, i) => a + (isDone(S, i) ? 1 : 0), 0);
  const isLocked = (S, i) => S.locked.includes(i) && doneCount(S) < 1;   // 다른 칸 하나가 정리되면 열린다
  /** 몇 개가 옮겨지는가(0 이면 못 옮김) */
  function count(S, from, to) {
    if (from === to || S.won) return 0; const a = S.tubes[from], b = S.tubes[to];
    if (!a.length || isLocked(S, from) || isLocked(S, to)) return 0;
    const room = S.caps[to] - b.length; if (room <= 0) return 0;
    const k = a[a.length - 1], wild = S.rule === 1 && S.shiny[from][a.length - 1];
    if (!(b.length === 0 || b[b.length - 1] === k || wild)) return 0;
    if (S.rule === 2) { let n = 0; for (let j = a.length - 1; j >= 0 && a[j] === k; j--) n++; return Math.min(n, room); }
    return 1;
  }
  const canMove = (S, from, to) => count(S, from, to) > 0;
  function move(S, from, to) {
    const n = count(S, from, to); if (!n) return null;
    const a = S.tubes[from], b = S.tubes[to]; const items = a.splice(a.length - n, n), sh = S.shiny[from].splice(S.shiny[from].length - n, n); S.rev[from].splice(S.rev[from].length - n, n);
    items.forEach((x) => b.push(x)); sh.forEach((x) => S.shiny[to].push(x)); const ol = b.length - n; S.rev[to] = S.tubes[to].map((x, k) => k >= ol || S.rev[to][k] === true); if (a.length) S.rev[from][a.length - 1] = true;
    S.moves++; if (isWon(S)) S.won = true;
    return { n, from, to, kind: items[0], done: isDone(S, to) };
  }
  function isWon(S) {
    if (S.L && S.L.pair) return S.tubes.every((t, i) => !t.length || isDone(S, i));   // 짝 칸: 같은 그림이 두 칸에 가득 나뉘어 담김
    const seen = new Set();
    for (let i = 0; i < S.tubes.length; i++) { const t = S.tubes[i]; if (!t.length) continue; if (!t.every((k) => k === t[0])) return false; if (seen.has(t[0])) return false; seen.add(t[0]); }
    return true;
  }
  const mixed = (S) => S.tubes.reduce((a, t) => a + (t.length && !t.every((k) => k === t[0]) ? 1 : 0), 0);
  function validMoves(S) { const o = []; for (let i = 0; i < S.tubes.length; i++) for (let j = 0; j < S.tubes.length; j++) if (canMove(S, i, j)) o.push([i, j]); return o; }
  /** 거꾸로 섞기: 정리된 상태 L0 에서 steps 번 「정방향이 가능했을 수」의 역수를 적용한다. 반환 {tubes, path(정방향 풀이 = 역순)} */
  function scramble(tubes0, caps, rng, steps, locked) {
    const T = tubes0.map((t) => t.slice()), n = T.length, path = []; let last = null;
    for (let s = 0; s < steps; s++) {
      const opts = [];
      for (let to = 0; to < n; to++) {
        if (locked && locked.includes(to)) continue; const a = T[to]; if (!a.length) continue; const x = a[a.length - 1];
        if (a.length > 1 && a[a.length - 2] !== x) continue;                                  // 정방향에서 같은 그림 위(또는 빈 칸)로 갔어야 한다
        for (let from = 0; from < n; from++) { if (from === to || (locked && locked.includes(from)) || T[from].length >= caps[from]) continue; if (last && last[0] === to && last[1] === from) continue; opts.push([from, to]); }
      }
      if (!opts.length) break; const [from, to] = opts[(rng() * opts.length) | 0];
      T[from].push(T[to].pop()); path.push([from, to]); last = [from, to];
    }
    return { tubes: T, path: path.reverse() };
  }
  /** 빔 탐색 풀이(힌트·par): 한 수씩 점수 높은 상태만 남긴다. 반환 moves 또는 null */
  const keyOf = (S) => S.tubes.map((t) => t.join('.')).sort().join('|');
  const sc = (S) => { let s = 0; S.tubes.forEach((t, i) => { if (!t.length) { s += 2; return; } let run = 1; for (let k = t.length - 2; k >= 0 && t[k] === t[t.length - 1]; k--) run++; s += run * 3 - (t.every((x) => x === t[0]) ? -4 : t.length * 1.4); if (isDone(S, i)) s += 8; }); return s; };
  function solve(S0, beam, maxD) {
    beam = beam || 60; maxD = maxD || 160; let layer = [{ S: clone(S0), mv: [] }]; const seen = new Set([keyOf(S0)]);
    for (let d = 0; d < maxD && layer.length; d++) {
      const next = [];
      for (const { S, mv } of layer) {
        for (const [i, j] of validMoves(S)) { const T = clone(S); move(T, i, j); const k = keyOf(T); if (seen.has(k)) continue; seen.add(k); const m2 = mv.concat([[i, j]]); if (T.won) return m2; next.push({ S: T, mv: m2, v: sc(T) - m2.length * 0.05 }); }
      }
      next.sort((a, b) => b.v - a.v); layer = next.slice(0, beam);
    }
    return null;
  }
  /** 사람 흉내 탐욕 플레이(난이도 지표·가족 순위표 봇): rule 을 주면 그 가족 규칙으로. 반환 {won, moves} */
  function botPlay(L, rng, eps, rule) {
    const S = newGame(L, rule), seen = new Set(); let guard = 0;
    while (!S.won && guard++ < 300) {
      const ms = validMoves(S).filter(([i, j]) => !(S.tubes[j].length === 0 && S.tubes[i].every((x) => x === S.tubes[i][0]))); if (!ms.length) return { won: false, moves: S.moves };
      let pick; if (rng() < eps) pick = ms[(rng() * ms.length) | 0]; else { let best = -1e9; ms.forEach(([i, j]) => { const T = clone(S); move(T, i, j); const k = keyOf(T); const v = sc(T) - (seen.has(k) ? 30 : 0) + rng() * 2; if (v > best) { best = v; pick = [i, j]; } }); }
      move(S, pick[0], pick[1]); seen.add(keyOf(S));
    }
    return { won: S.won, moves: S.moves };
  }
  const greedyRun = (L, rng, eps, rule) => botPlay(L, rng, eps, rule).won;
  const greedyWinRate = (L, runs, rng, eps, rule) => { let w = 0; for (let i = 0; i < runs; i++) if (greedyRun(L, rng, eps == null ? 0.1 : eps, rule)) w++; return w / runs; };
  /** 힌트: 풀이(빔)의 첫 수 */
  const hint = (S) => { const m = solve(S, 40, 120); return m && m.length ? m[0] : null; };
  const api = { newGame, clone, addTube, count, canMove, move, isWon, isDone, doneCount, isLocked, mixed, validMoves, scramble, solve, hint, botPlay, greedyRun, greedyWinRate, top };
  if (typeof module !== 'undefined') module.exports = api; else root.SortCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
