/* 세 가족 짝 맞추기 규칙 코어(순수 함수, 브라우저·node 공용). 타일 매치(3개 모으기, 바구니 칸 수 제한) 문법 그대로:
   쌓인 타일 중 위에 다른 타일이 겹치지 않은(=가려지지 않은) 타일만 누를 수 있고, 누르면 바구니에 줄지어 들어가며, 같은 그림이 need(보통 3)개 모이면 사라진다. 바구니가 가득 차면 졌다(벌 없이 한 번 더).
   판은 「제거 순서」에서 거꾸로 만들어 항상 풀 수 있다(검증 풀이 = 그 순서). 가족 규칙(세 가족 판): 0 네모 = 바구니 8칸 · 1 세모 = 반짝 타일은 어떤 그림 대신이든 쓸 수 있음 · 2 동그라미 = 같은 그림이 바구니에서 정확히 나란히 3개일 때만(끼워 넣기 없이 뒤에 붙음). */
(function (root) {
  'use strict';
  const UNIT = 2;   // 타일 한 변 = 2 단위(격자 반 칸 어긋남을 허용하려고)
  const covers = (a, b) => a.z > b.z && Math.abs(a.x - b.x) < UNIT && Math.abs(a.y - b.y) < UNIT;
  const capOf = (L, rule) => (rule === 0 ? 8 : L.cap);
  function newGame(L, rule) {
    const r = rule == null ? (L.rule == null ? -1 : L.rule) : rule;
    return { L, rule: r, cap: capOf(L, r), need: L.need || 3, gone: L.tiles.map(() => false), tray: [], used: { undo: 0, shuffle: 0, hint: 0 }, cleared: {}, chain: 0, presses: 0, keyDone: !L.tiles.some((t) => t.lock), kinds: L.tiles.map((t) => t.kind), wildOf: L.tiles.map((t) => !!t.wild && r === 1), won: false };
  }
  const clone = (S) => ({ L: S.L, rule: S.rule, cap: S.cap, need: S.need, gone: S.gone.slice(), tray: S.tray.map((t) => Object.assign({}, t)), used: Object.assign({}, S.used), cleared: Object.assign({}, S.cleared), chain: S.chain, presses: S.presses, keyDone: S.keyDone, kinds: S.kinds.slice(), wildOf: S.wildOf.slice(), won: S.won, order: S.order });
  /** 누를 수 있는가: 가려지지 않았고, 잠긴 타일이면 열쇠가 지워졌다 */
  function isFree(S, i) {
    if (S.gone[i]) return false; const t = S.L.tiles[i];
    if (t.lock && !S.keyDone) return false;
    for (let j = 0; j < S.L.tiles.length; j++) if (j !== i && !S.gone[j] && covers(S.L.tiles[j], t)) return false;
    return true;
  }
  const freeList = (S) => { const o = []; for (let i = 0; i < S.L.tiles.length; i++) if (isFree(S, i)) o.push(i); return o; };
  const trayCount = (S, k) => S.tray.filter((t) => t.kind === k).length;
  /** 누르기. 반환 ev = {cleared:[종류…], lose, tile} 또는 null(못 누름) */
  function press(S, i) {
    if (S.won || !isFree(S, i)) return null;
    const kind = S.kinds[i], wild = S.wildOf[i], ev = { cleared: [], lose: false, tile: i, wild };
    S.gone[i] = true; S.presses++;
    const entry = { i, kind: wild ? 'wild' : kind };
    if (S.rule === 2 || wild) S.tray.push(entry);                                   // 동그라미 규칙·반짝은 그냥 뒤에 붙는다
    else { let at = -1; S.tray.forEach((t, k) => { if (t.kind === kind) at = k; }); if (at >= 0) S.tray.splice(at + 1, 0, entry); else S.tray.push(entry); }   // 같은 그림 옆에 끼워 줄을 모은다
    // 지우기
    let again = true, any = false;
    while (again) {
      again = false;
      const kinds = [...new Set(S.tray.filter((t) => t.kind !== 'wild').map((t) => t.kind))];
      for (const k of kinds) {
        const idx = S.tray.map((t, p) => (t.kind === k ? p : -1)).filter((p) => p >= 0), wilds = S.tray.map((t, p) => (t.kind === 'wild' ? p : -1)).filter((p) => p >= 0);
        if (S.rule === 2) { let run = -1; for (let p = 0; p + S.need <= S.tray.length; p++) if (S.tray.slice(p, p + S.need).every((t) => t.kind === k)) { run = p; break; } if (run >= 0) { S.tray.splice(run, S.need); ev.cleared.push(k); S.cleared[k] = (S.cleared[k] || 0) + 1; again = true; any = true; break; } continue; }
        if (idx.length + wilds.length >= S.need && idx.length >= 1) {
          const useW = Math.max(0, S.need - idx.length), take = idx.slice(0, S.need), rm = new Set(take.concat(wilds.slice(0, useW)));
          S.tray = S.tray.filter((t, p) => !rm.has(p)); ev.cleared.push(k); S.cleared[k] = (S.cleared[k] || 0) + 1; again = true; any = true; break;
        }
      }
    }
    if (ev.cleared.length) { S.chain++; if (S.L.tiles.some((t) => t.lock) && !S.keyDone && ev.cleared.includes(S.L.keyKind)) S.keyDone = true; } else S.chain = 0;
    if (!S.keyDone && S.L.keyKind && S.cleared[S.L.keyKind]) S.keyDone = true;
    if (isWon(S)) S.won = true;
    ev.lose = !S.won && S.tray.length >= S.cap && !any;
    return ev;
  }
  function isWon(S) {
    const g = S.L.goal;
    if (g && g.t === 'goal') return g.kinds.every((k) => (S.cleared[k] || 0) >= 1);
    return S.gone.every(Boolean);
  }
  const lost = (S) => !S.won && S.tray.length >= S.cap;
  const left = (S) => S.gone.filter((g) => !g).length;
  /** 섞기: 남은 타일의 그림을 다시 배정한다(제거 순서에서 거꾸로 — 풀 수 있음 유지). 바구니 속 타일은 그대로 */
  function shuffle(S, rng) {
    const rem = []; for (let i = 0; i < S.L.tiles.length; i++) if (!S.gone[i]) rem.push(i);
    const kinds = rem.map((i) => S.kinds[i]), pending = {}; S.tray.forEach((t) => { if (t.kind !== 'wild') pending[t.kind] = (pending[t.kind] || 0) + 1; });
    // 남은 타일 그림의 개수는 그대로(각 종류가 need 의 배수가 되도록 바구니 속 개수를 감안) 섞기만 한다 — 위치만 바꿔 앉힌다
    const order = removalOrder(S, rem, rng); if (!order) return false;
    const bag = kinds.slice(); for (let i = bag.length - 1; i > 0; i--) { const j = (rng() * (i + 1)) | 0; [bag[i], bag[j]] = [bag[j], bag[i]]; }
    // 종류별로 줄 세운 뒤 제거 순서에 따라 나눠 주면 같은 종류가 가까이 모이도록 해 풀 수 있다
    const byKind = {}; bag.forEach((k) => (byKind[k] = byKind[k] || []).push(k)); const seq = []; Object.keys(byKind).sort((a, b) => (pending[b] || 0) - (pending[a] || 0)).forEach((k) => byKind[k].forEach((x) => seq.push(x)));
    // 순서에 맞춰 배정: 앞에서부터 같은 종류를 연속 배정(= 연속 제거로 한 묶음)
    const assign = {}; order.forEach((idx, p) => { assign[idx] = seq[p]; });
    rem.forEach((idx) => { S.kinds[idx] = assign[idx]; });
    S.order = order.slice();   // 섞은 뒤의 풀이 순서(검증·힌트용)
    return true;
  }
  /** rem 중에서 가려짐·잠금 규칙으로 만들 수 있는 제거 순서(없으면 null) */
  function removalOrder(S, rem, rng) {
    const gone = new Set(), left0 = new Set(rem), out = []; let keyDone = S.keyDone;
    const T = S.L.tiles, freeNow = (i) => { if (T[i].lock && !keyDone) return false; for (const j of left0) if (j !== i && !gone.has(j) && covers(T[j], T[i])) return false; return true; };
    // 바구니 밖 이미 지워진 타일은 gone 으로 취급(덮개 없음)
    while (out.length < rem.length) {
      const fr = rem.filter((i) => !gone.has(i) && freeNow(i)); if (!fr.length) return null;
      const i = fr[(rng() * fr.length) | 0]; gone.add(i); out.push(i); if (S.L.tiles[i].lock) keyDone = true; if (out.length >= 3) keyDone = true;
    }
    return out;
  }
  /** 힌트: 누를 수 있는 타일 중 바구니에 같은 그림이 이미 있는 것 → 없으면 가려진 타일을 가장 많이 풀어 주는 것 */
  function hintTile(S) {
    const fr = freeList(S); if (!fr.length) return -1; let best = -1, bs = -1;
    fr.forEach((i) => { const same = trayCount(S, S.kinds[i]), opens = S.L.tiles.filter((t, j) => !S.gone[j] && j !== i && covers(S.L.tiles[i], t)).length; const sc = same * 10 + opens + (S.wildOf[i] ? 3 : 0) + (S.tray.length < S.cap - 2 ? 0 : same * 5); if (sc > bs) { bs = sc; best = i; } });
    return best;
  }
  /** 사람 흉내 탐욕(난이도 지표) */
  function greedyRun(L, rng, eps, rule) {
    const S = newGame(L, rule); let guard = 0;
    while (!S.won && guard++ < 400) {
      const fr = freeList(S); if (!fr.length) return false; let pick;
      if (rng() < eps) pick = fr[(rng() * fr.length) | 0];
      else { let bs = -1e9; fr.forEach((i) => { const same = trayCount(S, S.kinds[i]), opens = L.tiles.filter((t, j) => !S.gone[j] && j !== i && covers(L.tiles[i], t)).length, rest = S.kinds.filter((k, j) => !S.gone[j] && k === S.kinds[i]).length; const sc = (same >= S.need - 1 ? 100 : same * 18) + opens * 2 + (S.tray.length > S.cap - 3 && !same ? -40 : 0) + (rest >= 3 ? 1 : 0) + rng() * 2; if (sc > bs) { bs = sc; pick = i; } }); }
      const ev = press(S, pick); if (!ev) return false; if (ev.lose || lost(S)) return false;
    }
    return S.won;
  }
  const greedyWinRate = (L, runs, rng, eps, rule) => { let w = 0; for (let i = 0; i < runs; i++) if (greedyRun(L, rng, eps == null ? 0.12 : eps, rule)) w++; return w / runs; };
  const api = { UNIT, covers, newGame, clone, isFree, freeList, press, isWon, lost, left, shuffle, hintTile, greedyRun, greedyWinRate, trayCount, removalOrder };
  if (typeof module !== 'undefined') module.exports = api; else root.TileCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
