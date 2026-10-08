/* 세 가족 짝 맞추기 판 생성기(브라우저·node 공용). make(n, seed, opts) → 풀 수 있음이 구성으로 보장된 판(검증 풀이 = 제거 순서).
   만드는 법: 층(2~5)에 타일 자리를 놓고 → 가려짐 규칙을 지키는 「제거 순서」를 뽑고 → 그 순서를 묶음(need 개씩)으로 나눠 같은 그림을 배정한다.
   바구니에 동시에 쌓이는 미완성 타일 수를 (칸 수 − 2) 이하로 묶어 두므로, 순서대로 누르면 절대 넘치지 않는다.
   판 종류 6: classic 전부 지우기 · pair 짝(2개) · goal 목표 묶음 · lock 잠금 · narrow 좁은 바구니 · trio 세 가족 얼굴. 공통 판 4(오늘의 한 판·시즌·사연·세 가족 규칙)는 UI 가 make 를 다른 시드·규칙으로 부른다. */
(function (root) {
  'use strict';
  const C = typeof module !== 'undefined' ? require('./tile-core.js') : root.TileCore;
  const mulberry = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const CHAPTERS = ['아기돼지 삼형제', '브레멘 음악대', '견우와 직녀', '세 마리 곰', '잭과 콩나무', '콩쥐팥쥐', '흥부 박', '우렁 각시', '금도끼 은도끼', '개미와 베짱이', '해님 달님', '토끼와 거북이'];
  const TYPE_NAME = { classic: '전부 지우기', pair: '짝 맞추기', goal: '목표 모으기', lock: '자물쇠', narrow: '좁은 바구니', trio: '세 가족 얼굴' };
  const A = ['pair', 'pair', 'classic', 'classic', 'classic', 'goal', 'lock', 'narrow', 'trio', 'classic'], B = ['classic', 'goal', 'narrow', 'lock', 'classic', 'trio', 'goal', 'classic', 'narrow', 'classic'], Cc = ['classic', 'lock', 'goal', 'narrow', 'classic', 'goal', 'trio', 'lock', 'classic', 'classic'];
  const SEQ = (() => { const q = []; for (let n = 1; n <= 400; n++) q.push([A, B, Cc][(((n - 1) / 10) | 0) % 3][(n - 1) % 10]); for (let i = 3; i < q.length; i++) if (q[i] === q[i - 1] && q[i] === q[i - 2] && q[i] === q[i - 3]) q[i] = 'goal'; return q; })();
  const typeOf = (n) => SEQ[n - 1] || 'classic';
  const tagOf = (n) => (n <= 3 ? 'tutorial' : n % 5 === 0 ? 'rest' : n <= 12 ? 'intro' : 'growth');
  const pick = (rng, a) => a[(rng() * a.length) | 0];
  const GW = 12, GH = 11;   // 격자 단위(타일 한 변 = 2): 가로 6칸·세로 5.5칸 — 타일을 크게(화면 폭의 1/6.5) 쓰려고
  /** 층별 타일 자리(가운데가 두툼한 모양) */
  function layout(rng, layers, N) {
    const w = [0.34, 0.26, 0.18, 0.12, 0.07, 0.03].slice(0, layers), sum = w.reduce((x, y) => x + y, 0), cells = [];
    for (let l = 0; l < layers; l++) {
      const ox = (l % 2) * 1, oy = (l % 2) * 1, cs = [];
      for (let x = ox; x + 2 <= GW; x += 2) for (let y = oy; y + 2 <= GH; y += 2) { const dx = (x + 1 - GW / 2) / (GW / 2), dy = (y + 1 - GH / 2) / (GH / 2), sc = 1 - (dx * dx + dy * dy) * (0.5 + 0.1 * l) + rng() * 0.5; cs.push({ x, y, s: sc }); }
      cs.sort((p, q) => q.s - p.s); cells.push(cs);
    }
    const cap = cells.map((c) => c.length); let cnt = w.map((x, i) => Math.min(cap[i], Math.max(2, Math.round(N * x / sum)))), diff = N - cnt.reduce((x, y) => x + y, 0);
    for (let guard = 0; diff !== 0 && guard < 400; guard++) { const i = guard % layers, d = diff > 0 ? 1 : -1; if (cnt[i] + d >= 2 && cnt[i] + d <= cap[i]) { cnt[i] += d; diff -= d; } }
    const tiles = []; for (let l = 0; l < layers; l++) cells[l].slice(0, cnt[l]).forEach((c) => tiles.push({ x: c.x, y: c.y, z: l }));
    return tiles;
  }
  /** 가려짐·잠금 규칙으로 만든 제거 순서(잠긴 타일은 처음 3개가 빠진 뒤에 풀림) */
  function order(tiles, rng, lockFirst) {
    const gone = new Set(), out = [], T = tiles; let keyDone = !tiles.some((t) => t.lock);
    while (out.length < T.length) {
      const fr = []; for (let i = 0; i < T.length; i++) { if (gone.has(i)) continue; if (T[i].lock && !keyDone) continue; let cov = false; for (let j = 0; j < T.length; j++) if (j !== i && !gone.has(j) && C.covers(T[j], T[i])) { cov = true; break; } if (!cov) fr.push(i); }
      if (!fr.length) return null; fr.sort((a, b) => T[b].z - T[a].z + (rng() - 0.5) * 1.6);   // 위층 먼저 쪽으로 기울이되 흔든다
      const i = fr[0]; gone.add(i); out.push(i); if (out.length >= (lockFirst || 3)) keyDone = true;
    }
    return out;
  }
  /** 제거 순서를 need 개씩 묶는다: 바구니에 동시에 쌓이는 미완성 타일 ≤ maxPending */
  function groups(ord, rng, need, maxPending, joinP) {
    const G = ord.length / need, open = [], gid = new Array(ord.length); let started = 0, pending = 0;
    ord.forEach((idx, p) => {
      const left = ord.length - p, unstartedTiles = (G - started) * need;
      let g;
      const mustJoin = pending >= maxPending || unstartedTiles === 0 || (left <= open.reduce((a, o) => a + (need - o.n), 0));
      if (open.length && (mustJoin || rng() < joinP)) { const k = mustJoin ? 0 : (rng() * open.length) | 0; g = open[k]; } else { g = { id: started++, n: 0 }; open.push(g); }
      g.n++; gid[idx] = g.id; pending++; if (g.n === need) { open.splice(open.indexOf(g), 1); pending -= need; }
    });
    return gid;
  }
  const FACES = ['f0', 'f1', 'f2', 'f3', 'f4', 'f5'];   // trio 판의 얼굴 타일 종류(UI 에서 가족 얼굴 그림으로)
  function make(n, seed, opts) {
    opts = opts || {}; const type = opts.type || typeOf(n), tag = opts.tag || tagOf(n), chapter = Math.min(CHAPTERS.length, ((n - 1) / 10 | 0) + 1), rule = opts.rule == null ? -1 : opts.rule, prog = Math.min(1, (n - 1) / 119);
    let best = null;
    for (let k = 0; k < 16; k++) {
      const rng = mulberry((seed || n * 6151) + k * 9973 + n), need = type === 'pair' ? 2 : 3, cap = tag === 'rest' ? 9 : type === 'narrow' ? 5 : 7;
      let N = tag === 'tutorial' ? 12 : tag === 'rest' ? 24 + Math.round(prog * 50) : 30 + Math.round(prog * 84); if (type === 'narrow') N = Math.round(N * 0.6); if (type === 'goal') N = Math.round(N * 0.75); if (type === 'pair') N = Math.min(N, 24); if (opts.N) N = opts.N;
      N = Math.max(need * 4, Math.round(N / need) * need);
      const layers = type === 'pair' || tag === 'tutorial' ? 2 : Math.min(6, 2 + Math.floor(prog * 4.2) + (tag === 'rest' ? 0 : 1)), tiles = layout(rng, layers, N); if (tiles.length % need) tiles.length -= tiles.length % need;
      const nLock = type === 'lock' ? 3 + (n > 12 ? 2 : 0) : 0;
      if (nLock) { const cand = tiles.map((t, i) => i).filter((i) => tiles[i].z >= 1); for (let q = 0; q < nLock && cand.length; q++) { const idx = cand.splice((rng() * cand.length) | 0, 1)[0]; tiles[idx].lock = true; } }
      const ord = order(tiles, rng, 3); if (!ord) continue;
      const maxPending = rule === 2 ? need - 1 : Math.max(2, cap - 2 - (tag === 'tutorial' ? 2 : 0)), joinP = rule === 2 ? 1 : tag === 'tutorial' ? 0.85 : tag === 'rest' ? 0.6 : 0.34 - 0.12 * prog, gid = groups(ord, rng, need, maxPending, joinP), nG = tiles.length / need;
      const palSize = Math.max(3, Math.min(type === 'trio' ? 6 : 18, (tag === 'tutorial' ? 4 : tag === 'rest' ? 7 : 9) + Math.round(prog * 9))), pal = type === 'trio' ? FACES.slice(0, 6) : Array.from({ length: palSize }, (_, i) => 'k' + i);
      const gk = []; for (let g = 0; g < nG; g++) gk.push(pal[g % pal.length]); for (let i = gk.length - 1; i > 0; i--) { const j = (rng() * (i + 1)) | 0; [gk[i], gk[j]] = [gk[j], gk[i]]; }
      let keyKind = null; if (nLock) { keyKind = 'key'; gk[gid[ord[0]]] = 'key'; }
      tiles.forEach((t, i) => { t.kind = gk[gid[i]]; });
      const L = { id: n, chapter, tag, type, need, cap, tiles, solution: ord, goal: { t: 'all' }, keyKind, rule, palette: [...new Set(tiles.map((t) => t.kind))], layers };
      if (type === 'goal') { const ks = [...new Set(tiles.map((t) => t.kind))].filter((q) => q !== 'key'); const c = [pick(rng, ks)]; const ks2 = ks.filter((q) => q !== c[0]); c.push(pick(rng, ks2)); L.goal = { t: 'goal', kinds: c }; }
      if (rule === 1) tiles.forEach((t, i) => { if (rng() < 0.12 && !t.lock) t.wild = true; });
      // 검증: 풀이 재생
      const S = C.newGame(L, rule); let okp = true; for (const i of L.solution) { const ev = C.press(S, i); if (!ev || ev.lose) { okp = false; break; } if (S.won) break; } if (!okp || !S.won) continue;
      if (!opts.noGreedy) { const floor = type === 'pair' ? 0.9 : { tutorial: 0.85, rest: 0.7, intro: 0.5, growth: 0.3 }[tag] * (type === 'narrow' || type === 'lock' ? 0.7 : 1); L.greedy = +C.greedyWinRate(L, 50, mulberry(n + 29)).toFixed(2); if (L.greedy < floor && !opts.type) { if (!best || L.greedy > best.greedy) best = L; continue; } }
      return L;
    }
    return best;
  }
  const api = { mulberry, CHAPTERS, TYPE_NAME, FACES, typeOf, tagOf, make, GW, GH };
  if (typeof module !== 'undefined') module.exports = api; else root.TileGen = api;
})(typeof window !== 'undefined' ? window : globalThis);
