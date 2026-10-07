/* 막둥이의 하루 판 생성기(브라우저·node 공용). make(n, seed) → 판 한 개(놀이 5종: brush·dress·chew·tidy·sleep).
   모든 판은 실패할 수 없는 구성이다: 목표(얼룩·옷 칸·씹는 횟수·장난감·불)가 정해져 있고 입력은 진행만 시킨다. 좌표는 360×640 안전 영역 기준.
   검증(verify): 목표가 화면 안·서로 겹치지 않음·옵션에 정답이 하나뿐. 장당 4판(슬라이스), 12장 확장 시 장당 6판 제안. */
(function (root) {
  'use strict';
  const mulberry = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const CHAPTERS = [['아침 양치', 'brush', '🪥', '금도끼 은도끼'], ['옷 입기', 'dress', '👕', '세 마리 곰'], ['아침밥', 'chew', '🍚', '토끼와 거북이'], ['장난감 정리', 'tidy', '🧸', '우렁 각시'], ['잠자리', 'sleep', '🌙', '해님 달님']];
  const PER = 4;   // 장당 판 수(슬라이스). 확장은 허브 결정
  const AREA = { x0: 24, x1: 336, y0: 170, y1: 560 };
  const WEATHER = ['sun', 'cold', 'rain'];
  const CLOTH = { sun: { head: '🧢', body: '👕', feet: '🩴' }, cold: { head: '🧣', body: '🧥', feet: '🧦' }, rain: { head: '☂️', body: '🧥', feet: '🥾' } };
  const FOODS = ['🍚', '🥕', '🍎', '🥦', '🍌'];
  const TOYS = ['⚽', '🚗', '🧱', '🧸'];
  const shuf = (rng, a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (rng() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  /** 겹치지 않게 점 뿌리기(최소 거리 d, 사각형 안) */
  function scatter(rng, n, x0, y0, x1, y1, d) {
    const pts = [];
    for (let tries = 0; pts.length < n && tries < 4000; tries++) { const x = x0 + rng() * (x1 - x0), y = y0 + rng() * (y1 - y0); if (pts.every((p) => Math.hypot(p.x - x, p.y - y) >= d)) pts.push({ x: Math.round(x), y: Math.round(y) }); }
    return pts;
  }
  function make(n, seed) {
    const ch = ((n - 1) / PER) | 0, idx = ((n - 1) % PER), [name, type] = CHAPTERS[ch % CHAPTERS.length], rng = mulberry((seed || n) * 7919 + n * 13), L = { id: n, chapter: ch + 1, idx: idx + 1, type, last: idx === PER - 1 };
    if (type === 'brush') { const N = [2, 3, 5, 7][idx], r = [34, 30, 26, 23][idx]; L.spots = scatter(rng, N, 56 + r, 250 + r, 304 - r, 436 - r, 2 * r + 8).map((p) => Object.assign(p, { r })); }
    else if (type === 'dress') {
      const w = WEATHER[(idx + (seed || 0)) % 3], K = [1, 2, 3, 3][idx], slots = shuf(rng, ['head', 'body', 'feet']).slice(0, K); L.weather = w;
      L.slots = slots.map((s) => { const ok = CLOTH[w][s], others = WEATHER.filter((x) => x !== w).map((x) => CLOTH[x][s]).filter((e) => e !== ok); return { slot: s, ok, opts: shuf(rng, [ok].concat([...new Set(others)].slice(0, 2))) }; });
    } else if (type === 'chew') { const F = [1, 2, 3, 3][idx]; L.foods = shuf(rng, FOODS).slice(0, F); L.chews = [3, 3, 4, 5][idx]; L.gap = [600, 650, 700, 700][idx]; }
    else if (type === 'tidy') {
      const N = [3, 5, 7, 9][idx], K = [2, 2, 3, 3][idx], kinds = shuf(rng, [0, 1, 2, 3]).slice(0, K), pts = scatter(rng, N, AREA.x0 + 30, AREA.y0 + 10, AREA.x1 - 30, 380, 66);
      L.kinds = kinds; L.toys = pts.map((p, i) => Object.assign(p, { k: kinds[i % K] })); L.toys = shuf(rng, L.toys);
    } else if (type === 'sleep') { const N = [2, 3, 4, 5][idx]; L.lights = scatter(rng, N, 56, 200, 300, 340, 80); L.blanket = true; }
    return L;
  }
  function verify(L) {
    const errs = [], inside = (p, m) => p.x >= AREA.x0 + (m || 0) && p.x <= AREA.x1 - (m || 0) && p.y >= AREA.y0 && p.y <= AREA.y1;
    if (L.type === 'brush') { L.spots.forEach((p, i) => { if (!inside(p, p.r)) errs.push('얼룩 화면 밖 ' + i); L.spots.forEach((q, j) => { if (j > i && Math.hypot(p.x - q.x, p.y - q.y) < p.r + q.r + 6) errs.push('얼룩 겹침 ' + i + ',' + j); }); }); if (L.spots.length < [2, 3, 5, 7][L.idx - 1]) errs.push('얼룩 부족'); }
    if (L.type === 'dress') { if (!L.slots.length) errs.push('옷 칸 없음'); L.slots.forEach((s) => { if (s.opts.filter((o) => o === s.ok).length !== 1) errs.push('정답 하나가 아님 ' + s.slot); if (s.opts.length < 2) errs.push('선택지 부족'); if (s.opts.some((o) => o !== s.ok && Object.values(CLOTH[L.weather]).includes(o) && o === CLOTH[L.weather][s.slot])) errs.push('중복 정답'); }); }
    if (L.type === 'chew') { if (!L.foods.length || L.chews < 3) errs.push('씹기 목표'); }
    if (L.type === 'tidy') { L.toys.forEach((p, i) => { if (!inside(p, 24)) errs.push('장난감 화면 밖 ' + i); L.toys.forEach((q, j) => { if (j > i && Math.hypot(p.x - q.x, p.y - q.y) < 60) errs.push('장난감 겹침 ' + i + ',' + j); }); if (!L.kinds.includes(p.k)) errs.push('상자 없는 종류'); }); if (L.toys.length < [3, 5, 7, 9][L.idx - 1]) errs.push('장난감 부족'); }
    if (L.type === 'sleep') { L.lights.forEach((p, i) => { if (!inside(p, 30)) errs.push('불 화면 밖 ' + i); L.lights.forEach((q, j) => { if (j > i && Math.hypot(p.x - q.x, p.y - q.y) < 70) errs.push('불 겹침 ' + i + ',' + j); }); }); if (L.lights.length < [2, 3, 4, 5][L.idx - 1]) errs.push('불 부족'); }
    return errs;
  }
  const api = { mulberry, CHAPTERS, PER, AREA, CLOTH, FOODS, TOYS, make, verify };
  if (typeof module !== 'undefined') module.exports = api; else root.DayGen = api;
})(typeof window !== 'undefined' ? window : globalThis);
