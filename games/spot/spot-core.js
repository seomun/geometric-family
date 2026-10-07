/* 다른 그림 찾기 코어(순수 함수, 브라우저·node 공용): 장면(요소 목록)·틀린 곳(diffs) 검증, 탭 판정, 별 계산.
   장면은 요소(캐릭터·소품·도형·장식) 목록이고, 틀린 곳은 요소 하나를 바꾸는 연산(색·없애기·추가·옮기기·크기·뒤집기·표정)이라 정답 좌표가 정확히 알려져 있다.
   압박 없음: 시간 제한·하트·실패가 없다. 틀리게 눌러도 횟수만 세고 판은 계속된다. */
(function (root) {
  'use strict';
  const ASP = 0.8;   // 캐릭터 가로세로 비(생성기·검증용 근사. 판정 여유 tol 로 흡수)
  /** 요소의 화면 영역 {x,y,w,h}(왼쪽 위 기준) */
  function bbox(e) {
    if (e.k === 'chr') { const w = e.h * ASP; return { x: e.x - w / 2, y: e.y - e.h, w, h: e.h }; }
    if (e.k === 'item') return { x: e.x - e.w / 2, y: e.y - e.h, w: e.w, h: e.h };
    return { x: e.x - e.s / 2, y: e.y - e.s / 2, w: e.s, h: e.s };   // blk · deco: 가운데 기준
  }
  const cx = (b) => b.x + b.w / 2, cy = (b) => b.y + b.h / 2;
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  /** A·B 의 차이 요소 id 목록(없애기·추가·바뀜) */
  function changed(A, B) {
    const ma = Object.fromEntries(A.map((e) => [e.id, e])), mb = Object.fromEntries(B.map((e) => [e.id, e])), out = [];
    Object.keys(ma).forEach((id) => { if (!mb[id] || !same(ma[id], mb[id])) out.push(id); });
    Object.keys(mb).forEach((id) => { if (!ma[id]) out.push(id); });
    return out.sort();
  }
  /** 판 검증: 틀린 곳 영역이 겹치지 않고(중심 거리), 보일 만큼 크고, 화면 안이며, 그림의 실제 차이와 정확히 같다 */
  function verify(L) {
    const errs = []; let total = 0;
    L.rounds.forEach((R, ri) => {
      const ids = R.diffs.map((d) => d.id).sort(), real = changed(R.A, R.B);
      if (!same(ids, real)) errs.push(`r${ri}: 틀린 곳 목록(${ids}) ≠ 실제 차이(${real})`);
      R.diffs.forEach((d, i) => {
        total++; const min = L.type === 'hidden' ? 16 : 20;
        if (d.w < min || d.h < min) errs.push(`r${ri}.${i}: 너무 작음 ${d.w.toFixed(0)}×${d.h.toFixed(0)}`);
        if (d.x < -2 || d.y < -2 || d.x + d.w > R.w + 2 || d.y + d.h > R.h + 2) errs.push(`r${ri}.${i}: 화면 밖`);
        for (let j = 0; j < i; j++) { const e = R.diffs[j]; if (Math.hypot(cx(d) - cx(e), cy(d) - cy(e)) < 40) errs.push(`r${ri}.${i}: ${j} 와 너무 가까움`); }
      });
    });
    if (total !== L.goalN) errs.push('목표 수 불일치');
    return errs;
  }
  /** 탭 판정: 아직 못 찾은 틀린 곳 중 영역(+tol) 안이면 그 번호, 아니면 -1 */
  function hit(R, found, x, y, tol) {
    tol = tol == null ? 12 : tol; let best = -1, bd = 1e9;
    R.diffs.forEach((d, i) => { if (found && found[i]) return; if (x >= d.x - tol && x <= d.x + d.w + tol && y >= d.y - tol && y <= d.y + d.h + tol) { const dd = Math.hypot(x - cx(d), y - cy(d)); if (dd < bd) { bd = dd; best = i; } } });
    return best;
  }
  const stars = (hints, wrong) => (hints === 0 && wrong <= 3 ? 3 : hints <= 1 && wrong <= 8 ? 2 : 1);
  /** 정답 탭 목록(스모크·sim 용): [라운드, x, y] */
  const solution = (L) => L.rounds.flatMap((R, ri) => R.diffs.map((d) => [ri, cx(d), cy(d)]));
  /** 초보 탭 모델(난이도 지표): 차이마다 눈에 띄는 정도 → 힌트 없이 끝낼 확률 */
  const OPW = { remove: 1, add: 1, hue: 0.9, flip: 0.45, move: 0.6, size: 0.55, expr: 0.7, color: 0.85 };
  function easeScore(L) { let p = 1; L.rounds.forEach((R) => R.diffs.forEach((d) => { const size = Math.min(1, Math.min(d.w, d.h) / 46); p *= Math.min(0.99, 0.35 + 0.65 * size * (OPW[d.op] || 0.6)); })); return p; }
  const api = { ASP, bbox, changed, verify, hit, stars, solution, easeScore };
  if (typeof module !== 'undefined') module.exports = api; else root.SpotCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
