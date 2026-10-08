/* 막둥이의 하루 판 생성기(브라우저·node 공용). make(n, seed) → 판 한 개. 12장면 × 5판 = 60판.
   놀이 5종(brush·dress·chew·tidy·sleep)을 장면(theme)마다 그림만 바꿔 쓴다: 양치(teeth)·손 씻기(hands)·세수(face)·목욕(bath) = brush, 장난감(toys)·신발(shoes)·책(books) = tidy, 아침밥(meal)·간식(snack) = chew.
   모든 판은 실패할 수 없는 구성이다: 목표(얼룩·옷 칸·씹는 횟수·물건·불)가 정해져 있고 입력은 진행만 시킨다. 좌표는 360×640 안전 영역 기준.
   검증(verify): 목표가 화면 안·서로 겹치지 않음·옵션에 정답이 하나뿐. */
(function (root) {
  'use strict';
  const mulberry = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  // [장면 이름, 놀이, 아이콘, 옛이야기, 그림 테마]
  const CHAPTERS = [['아침 양치', 'brush', '🪥', '금도끼 은도끼', 'teeth'], ['옷 입기', 'dress', '👕', '세 마리 곰'], ['아침밥', 'chew', '🍚', '토끼와 거북이', 'meal'], ['장난감 정리', 'tidy', '🧸', '우렁 각시', 'toys'], ['잠자리', 'sleep', '🌙', '해님 달님'],
    ['손 씻기', 'brush', '🧼', '흥부 박', 'hands'], ['세수', 'brush', '🧽', '콩쥐팥쥐', 'face'], ['신발 정리', 'tidy', '👟', '견우와 직녀', 'shoes'], ['간식', 'chew', '🍪', '개미와 베짱이', 'snack'], ['목욕', 'brush', '🛁', '아기돼지 삼형제', 'bath'], ['책 정리', 'tidy', '📚', '잭과 콩나무', 'books'], ['잘 자요', 'sleep', '⭐', '눈의 여왕']];
  const PER = 5;   // 장당 판 수(허브 결정: 12장 × 5판 = 60판)
  const AREA = { x0: 24, x1: 336, y0: 170, y1: 560 };
  // 얼룩이 앉는 자리(그림 좌표): 입 속 이 8개 · 두 손바닥 8곳 · 얼굴 8곳 · 몸 8곳
  const POS = {
    teeth: [[99, 330], [153, 330], [207, 330], [261, 330], [99, 430], [153, 430], [207, 430], [261, 430]],
    hands: [[75, 300], [135, 300], [225, 300], [285, 300], [75, 390], [135, 390], [225, 390], [285, 390]],
    face: [[110, 240], [250, 240], [75, 330], [285, 330], [180, 330], [120, 420], [240, 420], [180, 460]],
    bath: [[110, 240], [180, 240], [250, 240], [110, 320], [180, 320], [250, 320], [145, 395], [215, 395]],
  };
  const TEETH = POS.teeth;
  const WEATHER = ['sun', 'cold', 'rain'];
  const CLOTH = { sun: { head: '🧢', body: '👕', feet: '🩴' }, cold: { head: '🧣', body: '🧥', feet: '🧦' }, rain: { head: '☂️', body: '🧥', feet: '🥾' } };
  const FOODS = { meal: ['🍚', '🥕', '🍎', '🥦', '🍌'], snack: ['🍪', '🥛', '🍉', '🍙', '🧀'] };
  const ITEMS = { toys: ['⚽', '🚗', '🧱', '🧸'], shoes: ['👟', '🥾', '🩴', '👞'], books: ['📕', '📗', '📘', '📙'] };
  const TOYS = ITEMS.toys;
  const N_BRUSH = [2, 3, 4, 6, 8], N_TIDY = [3, 5, 7, 9, 10], K_TIDY = [2, 2, 3, 3, 4], N_SLEEP = [2, 3, 4, 5, 6], K_DRESS = [1, 2, 3, 3, 3], F_CHEW = [1, 2, 3, 3, 3], CHEWS = [3, 3, 4, 5, 5], GAP = [600, 650, 700, 700, 700];
  const shuf = (rng, a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = (rng() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  /** 겹치지 않게 점 뿌리기(최소 거리 d, 사각형 안). 모자라면 새로 뽑는다 */
  function scatter(rng, n, x0, y0, x1, y1, d) {
    let best = [];
    for (let attempt = 0; attempt < 30 && best.length < n; attempt++) {
      const pts = []; for (let tries = 0; pts.length < n && tries < 4000; tries++) { const x = x0 + rng() * (x1 - x0), y = y0 + rng() * (y1 - y0); if (pts.every((p) => Math.hypot(p.x - x, p.y - y) >= d)) pts.push({ x: Math.round(x), y: Math.round(y) }); }
      if (pts.length > best.length) best = pts;
    }
    return best;
  }
  function make(n, seed) {
    const ch = ((n - 1) / PER) | 0, idx = ((n - 1) % PER), [name, type, , , theme] = CHAPTERS[ch % CHAPTERS.length], rng = mulberry((seed || n) * 7919 + n * 13), L = { id: n, chapter: ch + 1, idx: idx + 1, type, last: idx === PER - 1 };
    if (theme) L.theme = theme;
    if (type === 'brush') { const pos = POS[theme], N = Math.min(N_BRUSH[idx], pos.length); L.spots = shuf(rng, pos).slice(0, N).map((t) => ({ x: t[0], y: t[1], r: 22 })); }
    else if (type === 'dress') {
      const w = WEATHER[(idx + (seed || 0)) % 3], K = K_DRESS[idx], slots = shuf(rng, ['head', 'body', 'feet']).slice(0, K); L.weather = w;
      L.slots = slots.map((s) => { const ok = CLOTH[w][s], others = WEATHER.filter((x) => x !== w).map((x) => CLOTH[x][s]).filter((e) => e !== ok); return { slot: s, ok, opts: shuf(rng, [ok].concat([...new Set(others)].slice(0, 2))) }; });
    } else if (type === 'chew') { const F = F_CHEW[idx]; L.foods = shuf(rng, FOODS[theme]).slice(0, F); L.chews = CHEWS[idx]; L.gap = GAP[idx]; }
    else if (type === 'tidy') {
      const N = N_TIDY[idx], K = K_TIDY[idx], kinds = shuf(rng, [0, 1, 2, 3]).slice(0, K), pts = scatter(rng, N, AREA.x0 + 30, AREA.y0 + 10, AREA.x1 - 30, 380, 62);
      L.kinds = kinds; L.toys = pts.map((p, i) => Object.assign(p, { k: kinds[i % K] })); L.toys = shuf(rng, L.toys);
    } else if (type === 'sleep') { const N = N_SLEEP[idx]; L.lights = scatter(rng, N, 56, 190, 300, 345, 76); L.blanket = true; }
    return L;
  }
  function verify(L) {
    const errs = [], inside = (p, m) => p.x >= AREA.x0 + (m || 0) && p.x <= AREA.x1 - (m || 0) && p.y >= AREA.y0 && p.y <= AREA.y1, i0 = L.idx - 1;
    if (L.type === 'brush') { const pos = POS[L.theme]; L.spots.forEach((p, i) => { if (!inside(p, p.r)) errs.push('얼룩 화면 밖 ' + i); if (!pos.some((t) => t[0] === p.x && t[1] === p.y)) errs.push('얼룩이 자리 밖 ' + i); L.spots.forEach((q, j) => { if (j > i && Math.hypot(p.x - q.x, p.y - q.y) < p.r + q.r + 6) errs.push('얼룩 겹침 ' + i + ',' + j); }); }); if (L.spots.length < Math.min(N_BRUSH[i0], pos.length)) errs.push('얼룩 부족'); }
    if (L.type === 'dress') { if (!L.slots.length) errs.push('옷 칸 없음'); L.slots.forEach((s) => { if (s.opts.filter((o) => o === s.ok).length !== 1) errs.push('정답 하나가 아님 ' + s.slot); if (s.opts.length < 2) errs.push('선택지 부족'); }); }
    if (L.type === 'chew') { if (!L.foods.length || L.chews < 3) errs.push('씹기 목표'); }
    if (L.type === 'tidy') { L.toys.forEach((p, i) => { if (!inside(p, 24)) errs.push('물건 화면 밖 ' + i); L.toys.forEach((q, j) => { if (j > i && Math.hypot(p.x - q.x, p.y - q.y) < 58) errs.push('물건 겹침 ' + i + ',' + j); }); if (!L.kinds.includes(p.k)) errs.push('상자 없는 종류'); }); if (L.toys.length < N_TIDY[i0]) errs.push('물건 부족'); }
    if (L.type === 'sleep') { L.lights.forEach((p, i) => { if (!inside(p, 30)) errs.push('불 화면 밖 ' + i); L.lights.forEach((q, j) => { if (j > i && Math.hypot(p.x - q.x, p.y - q.y) < 70) errs.push('불 겹침 ' + i + ',' + j); }); }); if (L.lights.length < N_SLEEP[i0]) errs.push('불 부족'); }
    return errs;
  }
  const api = { TEETH, POS, ITEMS, FOODS, mulberry, CHAPTERS, PER, AREA, CLOTH, TOYS, make, verify };
  if (typeof module !== 'undefined') module.exports = api; else root.DayGen = api;
})(typeof window !== 'undefined' ? window : globalThis);
