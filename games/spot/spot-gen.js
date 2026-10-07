/* 다른 그림 찾기 판 생성기(브라우저·node 공용). make(n, seed, opts) → 검증을 통과한 판(틀린 곳 정답 좌표가 정확히 알려진다).
   판 종류 6: diff 틀린 그림 · odd 다른 하나 · hidden 숨은 물건 · three 세 가족 · memory 기억 · zoom 확대. 공통 판 4(오늘의 한 판·시즌·사연·세 가족 규칙 판)는 UI 가 make 를 다른 시드·규칙으로 부른다.
   장면은 옛이야기 명장면 템플릿(장마다) + 시드로 흩뿌린 장식. 틀린 곳 연산 7: 색(hue/color)·없애기·추가·옮기기·크기·뒤집기·표정. */
(function (root) {
  'use strict';
  const C = typeof module !== 'undefined' ? require('./spot-core.js') : root.SpotCore;
  const mulberry = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const W = 336, H = 210, BW = 336, BH = 430;
  const CHAPTERS = ['아기돼지 삼형제', '브레멘 음악대'];
  const TYPE_NAME = { diff: '틀린 그림', odd: '다른 하나', hidden: '숨은 물건', three: '세 가족', memory: '기억', zoom: '확대' };
  const SEQ_A = ['diff', 'diff', 'diff', 'odd', 'diff', 'hidden', 'three', 'memory', 'zoom', 'diff'], SEQ_B = ['diff', 'odd', 'hidden', 'three', 'diff', 'memory', 'zoom', 'odd', 'hidden', 'diff'];
  const SEQ = (() => { const q = []; for (let n = 1; n <= 400; n++) { const ch = ((n - 1) / 10) | 0; q.push((ch % 2 ? SEQ_B : SEQ_A)[(n - 1) % 10]); } for (let i = 3; i < q.length; i++) if (q[i] === q[i - 1] && q[i] === q[i - 2] && q[i] === q[i - 3]) q[i] = 'odd'; return q; })();
  const typeOf = (n) => SEQ[n - 1] || 'diff';
  const tagOf = (n) => (n <= 3 ? 'tutorial' : n % 5 === 0 ? 'rest' : n <= 12 ? 'intro' : 'growth');
  const TARGETS = [['persimmon', '곶감'], ['acorn', '도토리'], ['key', '열쇠'], ['coin', '엽전'], ['star', '별']];
  const PAL = ['#FF6B6B', '#FFD43B', '#4DABF7', '#9775FA', '#F783AC', '#69DB7C', '#FFA94D'];
  const EXPR = { 'nemo_dad.joy': 'nemo_dad.surprise', 'nemo_dad.good': 'nemo_dad.surprise', 'nemo_mom.joy': 'nemo_mom.surprise', 'husband.joy': 'husband.surprise', 'husband.good': 'husband.surprise', 'wife.joy': 'wife.surprise', 'wife.good': 'wife.surprise', 'dong_dad.joy': 'dong_dad.surprise', 'dong_dad.good': 'dong_dad.surprise', 'baby.joy': 'baby.surprise' };
  const pick = (rng, a) => a[(rng() * a.length) | 0];
  let uid = 0; const mk = (o) => Object.assign({ id: 'e' + (uid++) }, o);

  /** 장 템플릿: [bg, 요소들] — 좌표는 336×210 기준 */
  function template(ch) {
    if (ch % 2 === 1) return { bg: 'field', els: [
      mk({ k: 'deco', d: 'hut', v: 'straw', x: 62, y: 128, s: 54 }), mk({ k: 'deco', d: 'hut', v: 'wood', x: 160, y: 128, s: 54 }), mk({ k: 'deco', d: 'hut', v: 'brick', x: 258, y: 126, s: 60 }),
      mk({ k: 'chr', id: 'nemo_kids.kid1', x: 62, y: 198, h: 60 }), mk({ k: 'chr', id: 'nemo_kids.kid2', x: 160, y: 198, h: 60 }), mk({ k: 'chr', id: 'nemo_kids.kid3', x: 258, y: 198, h: 60 }), mk({ k: 'chr', id: 'nemo_mom.joy', x: 314, y: 198, h: 84 }),
      mk({ k: 'deco', d: 'wind', x: 118, y: 74, s: 40 }), mk({ k: 'deco', d: 'sun', x: 300, y: 32, s: 34 })] };
    return { bg: 'village', els: [
      mk({ k: 'deco', d: 'house', x: 262, y: 126, s: 84 }), mk({ k: 'item', id: 'b_lamp', x: 44, y: 198, w: 34, h: 66 }),
      mk({ k: 'chr', id: 'nemo_dad.good', x: 130, y: 200, h: 74 }), mk({ k: 'chr', id: 'husband.good', x: 130, y: 152, h: 58 }), mk({ k: 'chr', id: 'wife.good', x: 130, y: 112, h: 50 }), mk({ k: 'chr', id: 'dong_dad.good', x: 130, y: 78, h: 44 }),
      mk({ k: 'deco', d: 'moon', x: 40, y: 34, s: 34 })] };
  }
  /** 장식을 시드로 흩뿌린다(기존 요소와 겹치지 않게) */
  function scatter(els, rng, n, W2, H2, ground) {
    const taken = els.map((e) => { const b = C.bbox(e); return [b.x + b.w / 2, b.y + b.h / 2, Math.max(b.w, b.h) / 2]; });
    for (let i = 0, tries = 0; i < n && tries < n * 30; tries++) {
      const d = pick(rng, ground ? ['flower', 'flower', 'tree', 'bush'] : ['flower', 'tree', 'star', 'cloud', 'bird', 'heart']), s = d === 'tree' ? 40 : d === 'cloud' ? 38 : 28 + ((rng() * 10) | 0);
      const sky = d === 'cloud' || d === 'star' || d === 'bird', x = 18 + rng() * (W2 - 36), y = sky ? 18 + rng() * (H2 * 0.4) : H2 * 0.55 + rng() * (H2 * 0.4);
      if (taken.some((t) => Math.hypot(t[0] - x, t[1] - y) < t[2] + s * 0.6 + 8)) continue;
      taken.push([x, y, s / 2]); els.push(mk({ k: 'deco', d, x: Math.round(x), y: Math.round(y), s, c: pick(rng, PAL) })); i++;
    }
  }
  const OPS = {
    easy: ['remove', 'hue', 'add', 'color'], mid: ['remove', 'hue', 'add', 'move', 'size', 'color', 'expr'], hard: ['move', 'size', 'flip', 'expr', 'hue', 'color']
  };
  /** 요소 하나에 연산을 적용한 B쪽 요소(없애기면 null)와 영역. ok=false 면 이 요소엔 적용 불가 */
  function applyOp(e, op, rng, hard) {
    const b = Object.assign({}, e); let ok = true;
    if (op === 'remove') return { el: null, ok };
    if (op === 'hue') { if (e.k === 'deco' && e.c === undefined && e.d !== 'hut' && e.d !== 'house') ok = false; b.hue = hard ? pick(rng, [50, 310]) : pick(rng, [110, 190, 250]); }
    else if (op === 'color') { if (e.k !== 'deco' || e.c === undefined) ok = false; else b.c = pick(rng, PAL.filter((c) => c !== e.c)); }
    else if (op === 'move') { const a = hard ? 14 : 20, dx = (rng() < 0.5 ? -1 : 1) * (a + rng() * 6), dy = rng() < 0.5 ? 0 : (rng() < 0.5 ? -1 : 1) * a * 0.6; b.x = Math.round(e.x + dx); b.y = Math.round(e.y + dy); }
    else if (op === 'size') { const f = rng() < 0.5 ? 1.34 : 0.7; if (e.k === 'item') { b.w = Math.round(e.w * f); b.h = Math.round(e.h * f); } else if (e.k === 'chr') b.h = Math.round(e.h * f); else b.s = Math.round(e.s * f); }
    else if (op === 'flip') { if (e.k !== 'chr') ok = false; b.flip = !e.flip; }
    else if (op === 'expr') { if (e.k !== 'chr' || !EXPR[e.id]) ok = false; else b.id = EXPR[e.id]; }
    return { el: b, ok };
  }
  const area = (A, B) => { const a = C.bbox(A), b = B ? C.bbox(B) : a, x = Math.min(a.x, b.x), y = Math.min(a.y, b.y), x2 = Math.max(a.x + a.w, b.x + b.w), y2 = Math.max(a.y + a.h, b.y + b.h); let w = x2 - x, h = y2 - y, xx = x, yy = y; if (w < 24) { xx -= (24 - w) / 2; w = 24; } if (h < 24) { yy -= (24 - h) / 2; h = 24; } return { x: xx, y: yy, w, h }; };

  /** 그림 한 쌍: A 에서 N곳을 바꿔 B 를 만든다 */
  function pair(base, rng, N, level, bw, bh, rule) {
    const A = base.map((e) => Object.assign({}, e)), B = A.map((e) => Object.assign({}, e)), diffs = [], used = new Set();
    const hard = level === 'hard' || rule === 2, pool = rule === 1 ? ['hue', 'remove', 'add'] : rule === 2 ? OPS.hard : OPS[level];
    const cand = A.map((e, i) => i).filter((i) => { const b = C.bbox(A[i]); return Math.min(b.w, b.h) >= (rule === 1 ? 30 : 22); });
    for (let tries = 0; diffs.length < N && tries < 400; tries++) {
      const op = pick(rng, pool);
      if (op === 'add') {   // B 에만 있는 장식 하나
        const s = 28 + ((rng() * 8) | 0), x = 24 + rng() * (bw - 48), y = bh * 0.2 + rng() * (bh * 0.7), el = mk({ k: 'deco', d: pick(rng, ['flower', 'star', 'heart', 'bird']), x: Math.round(x), y: Math.round(y), s, c: pick(rng, PAL) }), ar = area(el, null);
        if (ar.x < 4 || ar.y < 4 || ar.x + ar.w > bw - 4 || ar.y + ar.h > bh - 4) continue;
        if ([...A, ...B.filter(Boolean)].some((e) => { const b = C.bbox(e); return Math.hypot(b.x + b.w / 2 - x, b.y + b.h / 2 - y) < (b.w + b.h) / 4 + s * 0.7; })) continue;
        if (diffs.some((d) => Math.hypot(d.x + d.w / 2 - x, d.y + d.h / 2 - y) < 44)) continue;
        B.push(el); diffs.push(Object.assign({ id: el.id, op: 'add' }, ar)); continue;
      }
      const i = pick(rng, cand); if (used.has(i)) continue;
      const r = applyOp(A[i], op, rng, hard); if (!r.ok) continue;
      const ar = area(A[i], r.el); if (ar.x < 2 || ar.y < 2 || ar.x + ar.w > bw - 2 || ar.y + ar.h > bh - 2) continue;
      if (diffs.some((d) => Math.hypot(d.x + d.w / 2 - (ar.x + ar.w / 2), d.y + d.h / 2 - (ar.y + ar.h / 2)) < 46)) continue;
      used.add(i); diffs.push(Object.assign({ id: A[i].id, op: op === 'hue' && A[i].k === 'deco' ? 'hue' : op }, ar));
      if (r.el === null) B[i] = null; else B[i] = r.el;
    }
    return { A, B: B.filter(Boolean), diffs };
  }

  function make(n, seed, opts) {
    opts = opts || {}; const type = opts.type || typeOf(n), tag = opts.tag || tagOf(n), chapter = Math.min(CHAPTERS.length, ((n - 1) / 10 | 0) + 1), rule = opts.rule == null ? -1 : opts.rule;
    for (let k = 0; k < 20; k++) {
      uid = 0; const rng = mulberry((seed || n * 4093) + k * 7717 + n), L = { id: n, chapter, tag, type, rounds: [], goalN: 0, rule };
      const lvl = tag === 'tutorial' ? 'easy' : tag === 'rest' || tag === 'intro' ? 'mid' : 'hard', nD = tag === 'tutorial' ? 3 : tag === 'rest' ? 4 : tag === 'intro' ? 5 : Math.min(9, 5 + ((n - 10) / 6 | 0));
      if (type === 'odd') {
        for (let r = 0; r < 3; r++) {
          const kind = pick(rng, ['chr', 'deco']), cells = [], odd = (rng() * 9) | 0, cw = BW / 3, ch = BH / 3;
          const proto = kind === 'chr' ? { k: 'chr', id: pick(rng, ['nemo_kids.kid1', 'nemo_kids.kid2', 'nemo_kids.kid3', 'nemo_dad.joy', 'wife.joy']), h: 96 } : { k: 'deco', d: pick(rng, ['tree', 'flower', 'hut']), v: pick(rng, ['straw', 'wood', 'brick']), s: 80, c: pick(rng, PAL) };
          for (let c = 0; c < 9; c++) cells.push(mk(Object.assign({}, proto, { x: Math.round(cw * (c % 3) + cw / 2), y: Math.round(ch * ((c / 3) | 0) + ch / 2 + (kind === 'chr' ? 48 : 0)) })));
          const A = cells.map((e) => Object.assign({}, e)), B = cells.map((e) => Object.assign({}, e)); let done = false;
          for (let t = 0; t < 40 && !done; t++) { const op = pick(rng, tag === 'tutorial' ? ['hue', 'remove'] : ['hue', 'remove', 'size', 'flip', 'expr', 'color']), x = applyOp(A[odd], op, rng, false); if (!x.ok) continue; const ar = area(A[odd], x.el); B[odd] = x.el; L.rounds.push({ w: BW, h: BH, bg: 'home', A, B: B.filter(Boolean), diffs: [Object.assign({ id: A[odd].id, op }, ar)] }); done = true; }
          if (!done) break;
        }
        if (L.rounds.length < 3) continue; L.goalN = 3;
      } else if (type === 'hidden') {
        const t = template(chapter), base = t.els.slice(); scatter(base, rng, 14, BW, BH, false); base.forEach((e) => { e.y = Math.round(e.y * 1.9); e.x = Math.round(e.x); if (e.k !== 'deco' || e.d === 'sun') e.s = e.s ? Math.round(e.s * 1.3) : e.s; });
        const nT = tag === 'tutorial' ? 3 : Math.min(5, 3 + ((n / 6) | 0)), tg = TARGETS.slice().sort(() => rng() - 0.5).slice(0, nT), B = base.map((e) => Object.assign({}, e)), diffs = [], names = [];
        for (const [d, nm] of tg) { for (let tr = 0; tr < 60; tr++) { const x = 24 + rng() * (BW - 48), y = 40 + rng() * (BH - 70), s = 26, el = mk({ k: 'deco', d, x: Math.round(x), y: Math.round(y), s, c: '#C98F5A', tgt: nm }), ar = area(el, null); if (base.some((e) => { const b = C.bbox(e); return Math.hypot(b.x + b.w / 2 - x, b.y + b.h / 2 - y) < (b.w + b.h) / 4 + 12; })) continue; if (diffs.some((q) => Math.hypot(q.x + q.w / 2 - x, q.y + q.h / 2 - y) < 50)) continue; B.push(el); diffs.push(Object.assign({ id: el.id, op: 'add', name: nm }, ar)); names.push(nm); break; } }
        if (diffs.length < nT) continue; L.rounds.push({ w: BW, h: BH, bg: t.bg, A: base, B, diffs }); L.goalN = nT; L.targets = names;
      } else {
        const t = template(chapter), base = t.els.slice(); scatter(base, rng, 7 + ((rng() * 3) | 0), W, H, false);
        let N = type === 'memory' ? Math.max(3, nD - 1) : type === 'zoom' ? nD + 2 : nD; if (rule === 0) N += 3; if (rule === 2) N = Math.max(3, N - 1); if (opts.n) N = opts.n;
        const lv = type === 'zoom' ? 'hard' : lvl, pr = pair(base, rng, N, lv, W, H, rule); if (pr.diffs.length < N) continue;
        L.rounds.push({ w: W, h: H, bg: t.bg, A: pr.A, B: pr.B, diffs: pr.diffs }); L.goalN = N;
      }
      const errs = C.verify(L); if (errs.length) continue;
      L.ease = +C.easeScore(L).toFixed(2); return L;
    }
    return null;
  }
  const api = { mulberry, CHAPTERS, TYPE_NAME, TARGETS, typeOf, tagOf, make, W, H, BW, BH };
  if (typeof module !== 'undefined') module.exports = api; else root.SpotGen = api;
})(typeof window !== 'undefined' ? window : globalThis);
