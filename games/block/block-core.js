/* 도형 블록 규칙 코어(순수 함수, 브라우저·node 공용). 8×8 판에 조각 3개를 놓아 가로·세로 줄을 가득 채우면 지워진다(검증된 블록 퍼즐 문법 그대로).
   판마다 목표가 있다(줄 지우기·도형 모으기·짐 치우기·한 번에 여러 줄·반짝 칸·조각 수 제한·한 가족만). 조각 순서(queue)는 판마다 정해져 있어 같은 판은 늘 같다.
   조각은 돌리지 않는다. 실패(자리 없음)는 벌 없이 즉시 한 번 더. 가족 규칙(세 가족 판): 0 네모 = 두 줄 이상 한 번에 지우면 점 조각 하나를 돌려받음 · 1 세모 = 반짝 칸이 든 줄은 옆 줄까지 껑충 · 2 동그라미 = 4×4 방도 가득 차면 지워짐. */
(function (root) {
  'use strict';
  const N = 8, NN = 64;
  // 조각 모양(행,열 오프셋) — 이름은 모양, 방향마다 따로(돌리기 없음)
  const rect = (h, w) => { const o = []; for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) o.push([r, c]); return o; };
  const PIECES = {
    d: [[0, 0]], h2: rect(1, 2), v2: rect(2, 1), h3: rect(1, 3), v3: rect(3, 1), h4: rect(1, 4), v4: rect(4, 1), h5: rect(1, 5), v5: rect(5, 1),
    s2: rect(2, 2), s3: rect(3, 3), r23: rect(2, 3), r32: rect(3, 2),
    la: [[0, 0], [1, 0], [1, 1]], lb: [[0, 1], [1, 0], [1, 1]], lc: [[0, 0], [0, 1], [1, 0]], ld: [[0, 0], [0, 1], [1, 1]],
    Ba: [[0, 0], [1, 0], [2, 0], [2, 1], [2, 2]], Bb: [[0, 2], [1, 2], [2, 0], [2, 1], [2, 2]], Bc: [[0, 0], [0, 1], [0, 2], [1, 0], [2, 0]], Bd: [[0, 0], [0, 1], [0, 2], [1, 2], [2, 2]],
  };
  const SIZE = Object.fromEntries(Object.entries(PIECES).map(([k, v]) => [k, v.length]));
  const BY_SIZE = { small: ['d', 'h2', 'v2', 'la', 'lb', 'lc', 'ld', 'h3', 'v3'], mid: ['h3', 'v3', 's2', 'h4', 'v4', 'la', 'lb', 'lc', 'ld', 'r23', 'r32'], big: ['s2', 'h4', 'v4', 'h5', 'v5', 'r23', 'r32', 's3', 'Ba', 'Bb', 'Bc', 'Bd'] };

  const clone = (S) => ({ L: S.L, fam: S.fam.slice(), shiny: S.shiny.slice(), star: S.star.slice(), qi: S.qi, tray: S.tray.map((t) => (t ? Object.assign({}, t) : null)), got: { lines: S.got.lines, fam: S.got.fam.slice(), junk: S.got.junk, combo: S.got.combo, stars: S.got.stars }, used: S.used, bonus: S.bonus, rule: S.rule });
  function newGame(L, rule) {
    const S = { L, fam: Array(NN).fill(-1), shiny: Array(NN).fill(0), star: (L.stars || []).slice(), qi: 0, tray: [null, null, null], got: { lines: 0, fam: [0, 0, 0], junk: 0, combo: 0, stars: 0 }, used: 0, bonus: 0, rule: rule == null ? (L.rule == null ? -1 : L.rule) : rule };
    (L.pre || []).forEach((p) => { S.fam[p[0]] = p[1]; });   // p = [칸, 9=짐 | 0..2=가족]
    refill(S); return S;
  }
  function refill(S) {
    if (S.tray.some((t) => t)) return;
    for (let k = 0; k < 3 && S.qi < S.L.queue.length; k++) { const q = S.L.queue[S.qi++]; S.tray[k] = { p: q[0], c: q[1], sh: q[2] ? 1 : 0 }; }
  }
  const canAt = (S, piece, r, c) => PIECES[piece.p].every(([dr, dc]) => { const rr = r + dr, cc = c + dc; return rr >= 0 && rr < N && cc >= 0 && cc < N && S.fam[rr * N + cc] < 0; });
  function moves(S) {
    const out = [];
    S.tray.forEach((t, k) => { if (!t) return; for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (canAt(S, t, r, c)) out.push([k, r, c]); });
    return out;
  }
  const anyFit = (S) => S.tray.some((t) => t && (() => { for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (canAt(S, t, r, c)) return true; return false; })());
  /** 놓기: 반환 ev = {cleared:[칸…], lines:줄 수, bonus:돌려받은 조각 여부} — trace 에 연출용 정보를 쌓는다 */
  function place(S, slot, r, c, trace) {
    const t = S.tray[slot]; if (!t || !canAt(S, t, r, c)) return null;
    const cells = PIECES[t.p].map(([dr, dc]) => (r + dr) * N + c + dc);
    cells.forEach((i, k) => { S.fam[i] = t.c; S.shiny[i] = t.sh && k === 0 ? 1 : 0; });
    S.tray[slot] = null; S.used++;
    const full = [];   // 가득 찬 줄들: {k:'r'|'c'|'q', i}
    for (let i = 0; i < N; i++) { if (rowFull(S, i)) full.push({ k: 'r', i }); if (colFull(S, i)) full.push({ k: 'c', i }); }
    if (S.rule === 2) for (let qr = 0; qr < 2; qr++) for (let qc = 0; qc < 2; qc++) if (quadFull(S, qr, qc)) full.push({ k: 'q', i: qr * 2 + qc });
    const clear = new Set();
    full.forEach((f) => cellsOf(f).forEach((i) => clear.add(i)));
    if (S.rule === 1) full.forEach((f) => { if (f.k === 'q') return; if (cellsOf(f).some((i) => S.shiny[i])) { const g = { k: f.k, i: Math.min(N - 1, f.i + 1) }; cellsOf(g).forEach((i) => { if (S.fam[i] >= 0) clear.add(i); }); } });   // 세모 규칙: 반짝 칸이 든 줄은 옆 줄도
    const ev = { cleared: [...clear], lines: full.length, bonus: false, placed: cells, stars: 0 };
    clear.forEach((i) => {
      const f = S.fam[i]; if (f === 9) S.got.junk++; else if (f >= 0) S.got.fam[f]++;
      const si = S.star.indexOf(i); if (si >= 0) { S.star.splice(si, 1); S.got.stars++; ev.stars++; }
      S.fam[i] = -1; S.shiny[i] = 0;
    });
    S.got.lines += full.length; if (full.length >= 2) S.got.combo++;
    if (S.rule === 0 && full.length >= 2) { const k = S.tray.findIndex((x) => !x); if (k >= 0) { S.tray[k] = { p: 'd', c: 0, sh: 0 }; ev.bonus = true; S.bonus++; } }   // 네모 규칙: 점 조각 돌려받기
    refill(S);
    if (trace) trace.push(ev);
    return ev;
  }
  const rowFull = (S, r) => { for (let c = 0; c < N; c++) if (S.fam[r * N + c] < 0) return false; return true; };
  const colFull = (S, c) => { for (let r = 0; r < N; r++) if (S.fam[r * N + c] < 0) return false; return true; };
  const quadFull = (S, qr, qc) => { for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) if (S.fam[(qr * 4 + r) * N + qc * 4 + c] < 0) return false; return true; };
  function cellsOf(f) { const o = []; if (f.k === 'r') for (let c = 0; c < N; c++) o.push(f.i * N + c); else if (f.k === 'c') for (let r = 0; r < N; r++) o.push(r * N + f.i); else { const qr = f.i >> 1, qc = f.i & 1; for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) o.push((qr * 4 + r) * N + qc * 4 + c); } return o; }

  const junkLeft = (S) => S.fam.reduce((a, f) => a + (f === 9 ? 1 : 0), 0);
  function won(S) {
    const g = S.L.goal;
    switch (g.t) {
      case 'family': return S.got.fam[g.f] >= g.n;
      case 'junk': return junkLeft(S) === 0;
      case 'combo': return S.got.combo >= g.n;
      case 'star': return S.got.stars >= S.L.stars.length;
      case 'endless': return false;   // 끝없이: 이기는 일은 없고 자리가 없을 때 끝난다
      default: return S.got.lines >= g.n;   // lines · limit · solo
    }
  }
  /** 진행도(0~1) — 표시용 */
  function progress(S) {
    const g = S.L.goal;
    switch (g.t) {
      case 'family': return Math.min(1, S.got.fam[g.f] / g.n);
      case 'junk': { const tot = (S.L.pre || []).filter((p) => p[1] === 9).length || 1; return 1 - junkLeft(S) / tot; }
      case 'combo': return Math.min(1, S.got.combo / g.n);
      case 'star': return Math.min(1, S.got.stars / Math.max(1, S.L.stars.length));
      case 'endless': return 0;
      default: return Math.min(1, S.got.lines / g.n);
    }
  }
  const outOfPieces = (S) => S.L.lim != null && S.used >= S.L.lim;
  /** 졌다: 못 이긴 채로 조각이 모자라거나 놓을 자리가 없다 */
  function lost(S) {
    if (won(S)) return false;
    if (outOfPieces(S)) return true;
    if (S.tray.every((t) => !t)) return true;                  // 조각 줄이 끝났다
    return !anyFit(S);
  }

  /* ---------------- 풀이(빔 탐색)·난이도 지표 ---------------- */
  /** 거의 찬 줄에 점수(목표가 든 줄은 3배) — 줄을 한꺼번에 채울 준비를 하게 만든다 */
  function lineFill(S) {
    let s = 0; const g = S.L.goal.t;
    for (let i = 0; i < N; i++) {
      let rf = 0, cf = 0, rt = 0, ct = 0;
      for (let j = 0; j < N; j++) {
        const a = i * N + j, b = j * N + i;
        if (S.fam[a] >= 0) rf++; if (S.fam[b] >= 0) cf++;
        if (g === 'junk') { if (S.fam[a] === 9) rt = 1; if (S.fam[b] === 9) ct = 1; } else if (g === 'star') { if (S.star.indexOf(a) >= 0) rt = 1; if (S.star.indexOf(b) >= 0) ct = 1; }
      }
      s += Math.pow(rf / N, 3) * (1 + 2 * rt) + Math.pow(cf / N, 3) * (1 + 2 * ct);
    }
    return s;
  }
  function nearLines(S) { let n = 0; for (let i = 0; i < N; i++) { let r = 0, c = 0; for (let j = 0; j < N; j++) { if (S.fam[i * N + j] >= 0) r++; if (S.fam[j * N + i] >= 0) c++; } if (r >= 6) n++; if (c >= 6) n++; } return n; }
  const score = (S) => lineFill(S) * 14 + (S.L.goal.t === 'combo' ? nearLines(S) * 25 : 0) + progress(S) * 1000 + S.fam.reduce((a, f) => a + (f < 0 ? 1 : 0), 0) * 1.5 + (S.L.goal.t === 'junk' ? 0 : S.got.lines * 6) - holes(S) * 4;
  function holes(S) { let h = 0; for (let i = 0; i < NN; i++) if (S.fam[i] < 0) { const r = i >> 3, c = i & 7; let nb = 0; if (r === 0 || S.fam[i - N] >= 0) nb++; if (r === N - 1 || S.fam[i + N] >= 0) nb++; if (c === 0 || S.fam[i - 1] >= 0) nb++; if (c === N - 1 || S.fam[i + 1] >= 0) nb++; if (nb >= 4) h++; } return h; }
  const key = (S) => S.fam.join('') + '|' + S.qi + '|' + S.tray.map((t) => (t ? t.p + t.c : '-')).join(',') + '|' + S.got.lines + ',' + S.got.combo + ',' + S.got.stars + ',' + S.got.fam.join('');
  /** 이길 수 있는 순서가 있는지 찾는다: 가장 점수 높은 상태 B개만 남기며 한 수씩. 반환 {win, moves:[[slot,r,c]…], used} */
  function solve(L, o) {
    o = o || {}; const B = o.beam || 40, maxD = o.maxD || (L.queue.length + 8);
    let layer = [{ S: newGame(L, o.rule), mv: [] }];
    for (let d = 0; d < maxD && layer.length; d++) {
      const next = [], seen = new Set();
      for (const { S, mv } of layer) {
        const ms = moves(S); if (!ms.length) continue;
        for (const m of ms) {
          const T = clone(S); place(T, m[0], m[1], m[2]); const k = key(T); if (seen.has(k)) continue; seen.add(k);
          const mm = mv.concat([m]);
          if (won(T)) return { win: true, moves: mm, used: T.used };
          if (!lost(T)) next.push({ S: T, mv: mm, sc: score(T) });
        }
      }
      next.sort((a, b) => b.sc - a.sc); layer = next.slice(0, B);
    }
    return { win: false, moves: [], used: 0 };
  }
  /** 사람 흉내 탐욕(난이도 지표): 놓으면 가장 줄이 많이 지워지는 수, 같으면 구멍이 적은 수. eps 확률로 아무 수 */
  function greedyRun(L, rng, eps, rule) {
    const S = newGame(L, rule); let guard = 0;
    while (!won(S) && !lost(S) && guard++ < 400) {
      const ms = moves(S); if (!ms.length) break;
      let pick;
      if (rng() < eps) pick = ms[(rng() * ms.length) | 0];
      else { let best = -1e9; for (const m of ms) { const T = clone(S); const ev = place(T, m[0], m[1], m[2]); const sc = (ev.lines * 50 + ev.stars * 40 + (S.L.goal.t === 'family' ? ev.cleared.filter((i) => S.fam[i] === S.L.goal.f).length * 12 : 0) + (S.L.goal.t === 'junk' ? ev.cleared.filter((i) => S.fam[i] === 9).length * 30 : 0)) + progress(T) * 200 + lineFill(T) * 9 + (S.L.goal.t === 'combo' ? (ev.lines >= 2 ? 400 : 0) + nearLines(T) * 22 : 0) - holes(T) * 5 + rng() * 2; if (sc > best) { best = sc; pick = m; } } }
      place(S, pick[0], pick[1], pick[2]);
    }
    return won(S);
  }
  const greedyWinRate = (L, runs, rng, eps, rule) => { let w = 0; for (let i = 0; i < runs; i++) if (greedyRun(L, rng, eps == null ? 0.12 : eps, rule)) w++; return w / runs; };
  const api = { N, PIECES, SIZE, BY_SIZE, newGame, place, moves, anyFit, canAt, won, lost, progress, solve, greedyWinRate, clone, cellsOf, junkLeft, outOfPieces };
  if (typeof module !== 'undefined') module.exports = api; else root.BlockCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
