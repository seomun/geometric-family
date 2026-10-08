/* 다른 그림 찾기 판 생성기(브라우저·node 공용). make(n, seed, opts) → 검증을 통과한 판(틀린 곳 정답 좌표가 정확히 알려진다).
   판 종류 6: diff 틀린 그림 · odd 다른 하나 · hidden 숨은 물건 · three 세 가족 · memory 기억 · zoom 확대. 공통 판 4(오늘의 한 판·시즌·사연·세 가족 규칙 판)는 UI 가 make 를 다른 시드·규칙으로 부른다.
   장면은 옛이야기 명장면 템플릿(장마다) + 생활 소품을 앞·중간·뒤 3층으로 쌓은 25~40개 요소(판이 갈수록 촘촘해짐). 틀린 곳은 중간 크기 소품 위주(하늘의 별·구름·해만 바꾸지 않는다).
   틀린 곳 연산 7: 색(hue/color)·없애기·추가·옮기기·크기·뒤집기·표정. 검증: 요소 전체가 화면 안·틀린 곳 목록 = 실제 차이·크기·간격·가려짐. */
(function (root) {
  'use strict';
  const C = typeof module !== 'undefined' ? require('./spot-core.js') : root.SpotCore;
  const mulberry = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const W = 336, H = 210, BW = 336, BH = 430;
  const IDS = ['pigs', 'bremen', 'gyeonwoo', 'bears', 'jack', 'kongjwi', 'heungbu', 'ureng', 'axe', 'ant', 'sun', 'hare', 'brothers', 'snowqueen'];   // ⑦과 같은 이야기 순서(13·14장은 ⑥ 확장분)
  const CHAPTERS = ['아기돼지 삼형제', '브레멘 음악대', '견우와 직녀', '세 마리 곰', '잭과 콩나무', '콩쥐팥쥐', '흥부 박', '우렁 각시', '금도끼 은도끼', '개미와 베짱이', '해님 달님', '토끼와 거북이', '의좋은 형제', '눈의 여왕'];
  const TYPE_NAME = { diff: '틀린 그림', odd: '다른 하나', hidden: '숨은 물건', three: '세 가족', memory: '기억', zoom: '확대' };
  const A = ['diff', 'diff', 'diff', 'odd', 'diff', 'hidden', 'three', 'memory', 'zoom', 'diff'], B = ['diff', 'odd', 'hidden', 'three', 'diff', 'memory', 'zoom', 'odd', 'hidden', 'diff'], Cc = ['diff', 'hidden', 'diff', 'memory', 'diff', 'zoom', 'odd', 'three', 'diff', 'diff'];
  const SEQS = [A, B, Cc];
  const SEQ = (() => { const q = []; for (let n = 1; n <= 400; n++) { const ch = ((n - 1) / 10) | 0; q.push(SEQS[ch % 3][(n - 1) % 10]); } for (let i = 3; i < q.length; i++) if (q[i] === q[i - 1] && q[i] === q[i - 2] && q[i] === q[i - 3]) q[i] = 'odd'; return q; })();
  const typeOf = (n) => SEQ[n - 1] || 'diff';
  const tagOf = (n) => (n <= 3 ? 'tutorial' : n % 5 === 0 ? 'rest' : n <= 12 ? 'intro' : 'growth');
  const TARGETS = [['persimmon', '곶감'], ['acorn', '도토리'], ['key', '열쇠'], ['coin', '엽전'], ['star', '별']];
  const PAL = ['#FF6B6B', '#FFD43B', '#4DABF7', '#9775FA', '#F783AC', '#69DB7C', '#FFA94D'];
  const EXPR = { 'nemo_dad.joy': 'nemo_dad.surprise', 'nemo_dad.good': 'nemo_dad.surprise', 'nemo_mom.joy': 'nemo_mom.surprise', 'husband.joy': 'husband.surprise', 'husband.good': 'husband.surprise', 'wife.joy': 'wife.surprise', 'wife.good': 'wife.surprise', 'dong_dad.joy': 'dong_dad.surprise', 'dong_dad.good': 'dong_dad.surprise', 'baby.joy': 'baby.surprise' };
  const pick = (rng, a) => a[(rng() * a.length) | 0];
  const shufR = (a, rng) => { for (let i = a.length - 1; i > 0; i--) { const j = (rng() * (i + 1)) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };   // 일관된 셔플(흔드는 비교 함수 정렬은 엔진 단계에 따라 달라질 수 있음)
  let uid = 0; const mk = (o) => Object.assign({ u: 'e' + (uid++), z: 1 }, o);   // u = 요소 고유 번호(id 는 그림 id 와 겹칠 수 있어 따로 둔다)
  /* 생활 소품 풀: [종류, id/그림, 가로, 세로 or 크기] — item 은 방 아이템(그림은 방 아이템 슬롯), emo 는 이모지, deco 는 코드 장식 */
  const I = (id, w, h) => ['item', id, w, h], E = (e, s) => ['emo', e, s, s], DC = (d, s) => ['deco', d, s, s];
  const OUT = [I('o_fence', 58, 36), I('o_jar', 36, 40), I('o_hay', 38, 42), I('o_well', 44, 48), I('o_cart', 46, 38), I('o_flag', 30, 52), I('o_sign', 40, 36), I('o_bench', 52, 36), I('o_lamp', 30, 52), I('o_mailbox', 36, 44), I('o_doghouse', 44, 44), I('o_flowerpot', 32, 36), I('o_lantern', 32, 46), I('o_bricks', 36, 36),
    E('🐈', 28), E('🐓', 28), E('🐔', 28), E('🦆', 26), E('🧺', 26), E('🪣', 26), E('🚲', 34), E('👕', 28), E('🎃', 26), E('🍄', 24), E('🦋', 24), E('🪁', 30), E('⚽', 24), DC('flower', 30), DC('flower', 26), DC('bush', 38), DC('tree', 44)];
  const IN = [I('b_table', 84, 50), I('b_shelf', 56, 86), I('b_window', 54, 62), I('b_lamp', 30, 66), I('b_rug', 104, 32), I('b_tv', 72, 54), I('b_plant', 34, 54), I('b_clock', 42, 42), I('b_bed', 90, 54), I('b_drawer', 62, 54), I('b_suitcase', 48, 46), I('b_globe', 38, 54), I('t_bowl', 38, 24), I('w_frame', 50, 58),
    E('☕', 24), E('🍞', 24), E('🧸', 28), E('📚', 26), E('🕯️', 24), E('🧦', 24), E('🐈', 28), E('🧺', 26), DC('flower', 26)];
  const FAR = [DC('cloud', 36), DC('cloud', 30), DC('bird', 24), DC('tree', 26), DC('bush', 28), DC('bird', 20)];
  /** 장 템플릿: 이야기마다 장면 뼈대(앵커). 좌표는 336×210 기준 */
  function template(ch) {
    const id = IDS[(ch - 1) % IDS.length], c = (o) => mk(Object.assign({ z: 2 }, o)), m = (o) => mk(Object.assign({ z: 1 }, o)), b = (o) => mk(Object.assign({ z: 0 }, o));
    switch (id) {
      case 'pigs': return { bg: 'field', out: true, els: [m({ k: 'deco', d: 'hut', v: 'straw', x: 62, y: 128, s: 54 }), m({ k: 'deco', d: 'hut', v: 'wood', x: 160, y: 128, s: 54 }), m({ k: 'deco', d: 'hut', v: 'brick', x: 258, y: 126, s: 60 }), c({ k: 'chr', id: 'nemo_kids.kid1', x: 62, y: 198, h: 60 }), c({ k: 'chr', id: 'nemo_kids.kid2', x: 160, y: 198, h: 60 }), c({ k: 'chr', id: 'nemo_kids.kid3', x: 258, y: 198, h: 60 }), c({ k: 'chr', id: 'nemo_mom.joy', x: 296, y: 198, h: 84 }), m({ k: 'deco', d: 'wind', x: 118, y: 72, s: 40 }), b({ k: 'deco', d: 'sun', x: 300, y: 34, s: 34 })] };
      case 'bremen': return { bg: 'village', out: true, els: [m({ k: 'deco', d: 'house', x: 262, y: 126, s: 84 }), m({ k: 'item', id: 'o_lamp', x: 44, y: 198, w: 34, h: 60 }), c({ k: 'chr', id: 'nemo_dad.good', x: 130, y: 200, h: 74 }), c({ k: 'chr', id: 'husband.good', x: 130, y: 152, h: 58 }), c({ k: 'chr', id: 'wife.good', x: 130, y: 112, h: 50 }), c({ k: 'chr', id: 'dong_dad.good', x: 130, y: 78, h: 44 }), b({ k: 'deco', d: 'moon', x: 40, y: 34, s: 34 })] };
      case 'gyeonwoo': return { bg: 'night', out: true, els: [m({ k: 'deco', d: 'bridge', x: 168, y: 120, s: 120 }), c({ k: 'chr', id: 'husband.joy', x: 40, y: 196, h: 76 }), c({ k: 'chr', id: 'wife.joy', x: 296, y: 196, h: 76 }), b({ k: 'deco', d: 'moon', x: 290, y: 34, s: 32 }), m({ k: 'item', id: 'o_lantern', x: 98, y: 150, w: 28, h: 40 })] };
      case 'bears': return { bg: 'indoor2', out: false, els: [m({ k: 'item', id: 'b_table', x: 168, y: 160, w: 96, h: 56 }), c({ k: 'item', id: 't_bowl', x: 134, y: 126, w: 40, h: 26 }), c({ k: 'item', id: 't_bowl', x: 172, y: 124, w: 32, h: 22 }), c({ k: 'item', id: 't_bowl', x: 208, y: 126, w: 26, h: 18 }), c({ k: 'chr', id: 'dong_dad.joy', x: 56, y: 202, h: 84 }), c({ k: 'chr', id: 'wife.surprise', x: 292, y: 202, h: 72 }), m({ k: 'item', id: 'b_window', x: 168, y: 78, w: 60, h: 66 }), m({ k: 'item', id: 'b_shelf', x: 300, y: 124, w: 50, h: 76 })] };
      case 'jack': return { bg: 'hill', out: true, els: [m({ k: 'deco', d: 'beanstalk', x: 148, y: 108, s: 190 }), c({ k: 'chr', id: 'nemo_kids.kid2', x: 70, y: 198, h: 62 }), c({ k: 'chr', id: 'nemo_mom.joy', x: 296, y: 198, h: 82 }), m({ k: 'item', id: 'o_cart', x: 230, y: 188, w: 48, h: 40 }), b({ k: 'deco', d: 'sun', x: 40, y: 32, s: 34 })] };
      case 'kongjwi': return { bg: 'village', out: true, els: [m({ k: 'item', id: 'o_jar', x: 258, y: 190, w: 64, h: 70 }), m({ k: 'item', id: 'o_well', x: 56, y: 150, w: 54, h: 58 }), c({ k: 'chr', id: 'nemo_kids.kid1', x: 150, y: 198, h: 66 }), c({ k: 'chr', id: 'dong_dad.calm', x: 206, y: 200, h: 54 }), m({ k: 'item', id: 'o_fence', x: 120, y: 120, w: 70, h: 44 })] };
      case 'heungbu': return { bg: 'field', out: true, els: [m({ k: 'chr', id: 'art.gourd', x: 138, y: 196, h: 72 }), c({ k: 'chr', id: 'nemo_dad.love', x: 252, y: 200, h: 82 }), c({ k: 'chr', id: 'nemo_mom.joy', x: 298, y: 200, h: 76 }), c({ k: 'chr', id: 'art.swallow', x: 70, y: 84, h: 40 }), m({ k: 'item', id: 'o_jar', x: 40, y: 196, w: 40, h: 44 })] };
      case 'ureng': return { bg: 'field', out: true, els: [m({ k: 'item', id: 'o_jar', x: 200, y: 186, w: 66, h: 72 }), c({ k: 'chr', id: 'nemo_dad.joy', x: 76, y: 200, h: 80 }), c({ k: 'chr', id: 'wife.joy', x: 280, y: 200, h: 76 }), m({ k: 'item', id: 'o_hay', x: 130, y: 192, w: 44, h: 48 }), m({ k: 'deco', d: 'house', x: 270, y: 108, s: 60 })] };
      case 'axe': return { bg: 'forest', out: true, els: [m({ k: 'item', id: 'o_pond', x: 168, y: 190, w: 100, h: 56 }), c({ k: 'chr', id: 'nemo_dad.worry', x: 66, y: 200, h: 82 }), c({ k: 'chr', id: 'dong_dad.warm', x: 280, y: 200, h: 84 }), m({ k: 'deco', d: 'tree', x: 40, y: 110, s: 60 }), m({ k: 'deco', d: 'tree', x: 298, y: 112, s: 64 })] };
      case 'ant': return { bg: 'hill', out: true, els: [m({ k: 'item', id: 'o_hay', x: 70, y: 188, w: 46, h: 50 }), m({ k: 'item', id: 'o_jar', x: 150, y: 190, w: 50, h: 56 }), m({ k: 'item', id: 'o_jar', x: 212, y: 190, w: 44, h: 50 }), c({ k: 'chr', id: 'nemo_mom.joy', x: 96, y: 202, h: 80 }), c({ k: 'chr', id: 'husband.joy', x: 220, y: 202, h: 78 }), c({ k: 'chr', id: 'dong_dad.joy', x: 296, y: 202, h: 66 })] };
      case 'sun': return { bg: 'night', out: true, els: [m({ k: 'deco', d: 'hut', v: 'wood', x: 90, y: 124, s: 62 }), m({ k: 'deco', d: 'tree', x: 240, y: 110, s: 78 }), c({ k: 'chr', id: 'nemo_kids.kid1', x: 160, y: 198, h: 62 }), c({ k: 'chr', id: 'nemo_kids.kid2', x: 206, y: 198, h: 62 }), b({ k: 'deco', d: 'moon', x: 40, y: 34, s: 34 })] };
      case 'brothers': return { bg: 'field', out: true, els: [m({ k: 'item', id: 'o_hay', x: 66, y: 186, w: 52, h: 56 }), m({ k: 'item', id: 'o_hay', x: 270, y: 186, w: 52, h: 56 }), c({ k: 'chr', id: 'nemo_kids.kid1', x: 128, y: 198, h: 64 }), c({ k: 'chr', id: 'baby.joy', x: 212, y: 200, h: 56 }), m({ k: 'item', id: 'o_jar', x: 168, y: 150, w: 40, h: 44 }), b({ k: 'deco', d: 'moon', x: 168, y: 34, s: 36 })] };
      case 'snowqueen': return { bg: 'night', out: true, els: [m({ k: 'deco', d: 'tree', x: 56, y: 112, s: 70 }), m({ k: 'deco', d: 'tree', x: 288, y: 108, s: 76 }), c({ k: 'chr', id: 'nemo_kids.kid1', x: 128, y: 198, h: 64 }), c({ k: 'chr', id: 'baby.joy', x: 214, y: 200, h: 56 }), m({ k: 'emo', e: '❄️', x: 168, y: 70, s: 34 }), m({ k: 'emo', e: '❄️', x: 100, y: 52, s: 26 }), m({ k: 'emo', e: '❄️', x: 246, y: 60, s: 28 }), b({ k: 'deco', d: 'moon', x: 300, y: 30, s: 30 })] };
      default: return { bg: 'field', out: true, els: [m({ k: 'item', id: 'o_flag', x: 296, y: 186, w: 34, h: 58 }), c({ k: 'chr', id: 'nemo_dad.joy', x: 232, y: 200, h: 78 }), c({ k: 'chr', id: 'dong_dad.joy', x: 112, y: 200, h: 70 }), m({ k: 'item', id: 'o_sign', x: 170, y: 176, w: 42, h: 38 }), m({ k: 'deco', d: 'tree', x: 40, y: 120, s: 60 })] };
    }
  }
  const inside = (b, w, h, pad) => b.x >= pad && b.y >= pad && b.x + b.w <= w - pad && b.y + b.h <= h - pad;
  /** 소품을 앞·중간·뒤 3층으로 흩뿌린다(앵커·이미 놓은 것과 너무 겹치지 않게, 모두 화면 안) */
  function scatter(els, rng, total, w, h, theme) {
    const pool = theme.out ? OUT : IN, tk = () => els.map((e) => { const b = C.bbox(e); return [b.x + b.w / 2, b.y + b.h / 2, Math.max(b.w, b.h) / 2, e.z]; });
    let taken = tk();
    for (let tries = 0; els.length < total && tries < total * 80; tries++) {
      const far = rng() < 0.22, def = far ? pick(rng, FAR) : pick(rng, pool), z = far ? 0 : rng() < 0.5 ? 1 : 2;
      const sc = z === 2 ? 1.05 : 0.95, kind = def[0], sw = def[2] * sc, sh = def[3] * sc, s = Math.max(sw, sh);
      const sky = far && def[1] !== 'tree' && def[1] !== 'bush', x = 14 + sw / 2 + rng() * (w - 28 - sw), y = sky ? 14 + sh / 2 + rng() * (h * 0.34) : (far ? h * 0.38 + sh / 2 : h * 0.5 + sh / 2) + rng() * (h * (far ? 0.12 : 0.44) - sh / 2 + 4);
      const e = kind === 'item' ? { k: 'item', id: def[1], x: Math.round(x), y: Math.round(y + sh / 2), w: Math.round(sw), h: Math.round(sh) } : kind === 'emo' ? { k: 'emo', e: def[1], x: Math.round(x), y: Math.round(y), s: Math.round(s) } : { k: 'deco', d: def[1], x: Math.round(x), y: Math.round(y), s: Math.round(s), c: pick(rng, PAL) };
      e.z = z; const b = C.bbox(e); if (!inside(b, w, h, 4)) continue;
      const cx = b.x + b.w / 2, cy = b.y + b.h / 2, r = Math.max(b.w, b.h) / 2;
      if (taken.some((t) => (t[3] === z || (z && t[3])) && Math.hypot(t[0] - cx, t[1] - cy) < (t[2] + r) * 0.62)) continue;
      els.push(mk(e)); taken = tk();
    }
  }
  const OPS = { easy: ['remove', 'hue', 'add', 'color'], mid: ['remove', 'hue', 'add', 'move', 'size', 'color', 'expr'], hard: ['move', 'size', 'flip', 'expr', 'hue', 'color'] };
  /** 요소 하나에 연산을 적용한 B쪽 요소(없애기면 null). ok=false 면 이 요소엔 적용 불가 */
  function applyOp(e, op, rng, hard) {
    const b = Object.assign({}, e); let ok = true;
    if (op === 'remove') return { el: null, ok };
    if (op === 'hue') { if (e.k === 'deco' && e.c === undefined && e.d !== 'hut' && e.d !== 'house') ok = false; b.hue = hard ? pick(rng, [50, 310]) : pick(rng, [110, 190, 250]); }
    else if (op === 'color') { if (e.k !== 'deco' || e.c === undefined) ok = false; else b.c = pick(rng, PAL.filter((c) => c !== e.c)); }
    else if (op === 'move') { const a = hard ? 14 : 20, dx = (rng() < 0.5 ? -1 : 1) * (a + rng() * 6), dy = rng() < 0.5 ? 0 : (rng() < 0.5 ? -1 : 1) * a * 0.6; b.x = Math.round(e.x + dx); b.y = Math.round(e.y + dy); }
    else if (op === 'size') { const f = rng() < 0.5 ? 1.34 : 0.7; if (e.k === 'item') { b.w = Math.round(e.w * f); b.h = Math.round(e.h * f); } else if (e.k === 'chr') b.h = Math.round(e.h * f); else b.s = Math.round(e.s * f); }
    else if (op === 'flip') { if (e.k !== 'chr' && e.k !== 'emo' && e.k !== 'item') ok = false; b.flip = !e.flip; }
    else if (op === 'expr') { if (e.k !== 'chr' || !EXPR[e.id]) ok = false; else b.id = EXPR[e.id]; }
    return { el: b, ok };
  }
  const area = (A0, B0) => { const a = C.bbox(A0), b = B0 ? C.bbox(B0) : a, x = Math.min(a.x, b.x), y = Math.min(a.y, b.y), x2 = Math.max(a.x + a.w, b.x + b.w), y2 = Math.max(a.y + a.h, b.y + b.h); let w = x2 - x, h = y2 - y, xx = x, yy = y; if (w < 24) { xx -= (24 - w) / 2; w = 24; } if (h < 24) { yy -= (24 - h) / 2; h = 24; } return { x: xx, y: yy, w, h }; };
  /** 요소가 더 위에 그려지는 요소에 가려지는 비율(0~1) */
  function occluded(els, i) { const b = C.bbox(els[i]), key = C.orderKey(els[i]); let cover = 0; els.forEach((o, j) => { if (j === i || C.orderKey(o) <= key) return; const q = C.bbox(o), ix = Math.max(0, Math.min(b.x + b.w, q.x + q.w) - Math.max(b.x, q.x)), iy = Math.max(0, Math.min(b.y + b.h, q.y + q.h) - Math.max(b.y, q.y)); cover += ix * iy; }); return Math.min(1, cover / (b.w * b.h)); }

  /** 그림 한 쌍: A 에서 N곳을 바꿔 B 를 만든다(틀린 곳은 중간 크기 소품 위주, 뒤층·하늘은 제외) */
  function pair(base, rng, N, level, bw, bh, rule) {
    const A0 = base.map((e) => Object.assign({}, e)), B0 = A0.map((e) => Object.assign({}, e)), diffs = [], used = new Set();
    const hard = level === 'hard' || rule === 2, pool = rule === 1 ? ['hue', 'remove', 'add'] : rule === 2 ? OPS.hard : OPS[level], minS = rule === 1 ? 30 : 24;
    const cand = A0.map((e, i) => i).filter((i) => { const b = C.bbox(A0[i]); return A0[i].z >= 1 && Math.min(b.w, b.h) >= minS && Math.max(b.w, b.h) <= 96 && occluded(A0, i) < 0.35; });
    N = Math.min(N, 9, Math.max(3, Math.round((cand.length + 2) * 0.55)));   // 후보가 적은 장면은 틀린 곳 수를 줄인다(간격 확보)
    for (let tries = 0; diffs.length < N && tries < 600; tries++) {
      const op = pick(rng, pool);
      if (op === 'add') {
        const s = 28 + ((rng() * 8) | 0), x = 24 + rng() * (bw - 48), y = bh * 0.3 + rng() * (bh * 0.6), kd = pick(rng, [['deco', 'flower'], ['deco', 'heart'], ['emo', '🐈'], ['emo', '🧺'], ['emo', '🦋'], ['emo', '🍄']]);
        const el = mk(kd[0] === 'emo' ? { k: 'emo', e: kd[1], x: Math.round(x), y: Math.round(y), s, z: 2 } : { k: 'deco', d: kd[1], x: Math.round(x), y: Math.round(y), s, c: pick(rng, PAL), z: 2 }), ar = area(el, null);
        if (!inside(ar, bw, bh, 4)) continue;
        if ([...A0, ...B0.filter(Boolean)].some((e) => { const q = C.bbox(e); return Math.hypot(q.x + q.w / 2 - x, q.y + q.h / 2 - y) < (q.w + q.h) / 4 + s * 0.75; })) continue;
        if (diffs.some((d) => Math.hypot(d.x + d.w / 2 - x, d.y + d.h / 2 - y) < 46)) continue;
        B0.push(el); diffs.push(Object.assign({ u: el.u, op: 'add' }, ar)); continue;
      }
      const i = pick(rng, cand); if (used.has(i)) continue;
      const r = applyOp(A0[i], op, rng, hard); if (!r.ok) continue;
      const ar = area(A0[i], r.el); if (!inside(ar, bw, bh, 2) || (r.el && !inside(C.bbox(r.el), bw, bh, 2))) continue;
      if (diffs.some((d) => Math.hypot(d.x + d.w / 2 - (ar.x + ar.w / 2), d.y + d.h / 2 - (ar.y + ar.h / 2)) < 46)) continue;
      used.add(i); diffs.push(Object.assign({ u: A0[i].u, op }, ar)); B0[i] = r.el === null ? null : r.el;
    }
    return { A: A0, B: B0.filter(Boolean), diffs, want: N };
  }
  const density = (n) => Math.round(27 + 13 * Math.min(1, (n - 1) / 100));   // 27개(처음) → 40개(120판)

  function make(n, seed, opts) {
    opts = opts || {}; const type = opts.type || typeOf(n), tag = opts.tag || tagOf(n), chapter = Math.min(CHAPTERS.length, ((n - 1) / 10 | 0) + 1), rule = opts.rule == null ? -1 : opts.rule;
    for (let k = 0; k < 24; k++) {
      uid = 0; const rng = mulberry((seed || n * 4093) + k * 7717 + n), L = { id: n, chapter, tag, type, rounds: [], goalN: 0, rule };
      const lvl = tag === 'tutorial' ? 'easy' : tag === 'rest' || tag === 'intro' ? 'mid' : 'hard', nD = tag === 'tutorial' ? 3 : tag === 'rest' ? 4 : tag === 'intro' ? 5 : Math.min(9, 5 + ((n - 10) / 6 | 0));
      if (type === 'odd') {
        for (let r = 0; r < 3; r++) {
          const kind = pick(rng, ['chr', 'deco', 'item']), odd = (rng() * 9) | 0, cw = BW / 3, ch = BH / 3;
          const proto = kind === 'chr' ? { k: 'chr', id: pick(rng, ['nemo_kids.kid1', 'nemo_kids.kid2', 'nemo_kids.kid3', 'nemo_dad.joy', 'wife.joy']), h: 96 } : kind === 'item' ? { k: 'item', id: pick(rng, ['o_jar', 'o_well', 'o_mailbox', 'o_doghouse', 'o_lantern']), w: 70, h: 78 } : { k: 'deco', d: pick(rng, ['tree', 'flower', 'hut']), v: pick(rng, ['straw', 'wood', 'brick']), s: 80, c: pick(rng, PAL) };
          const cells = []; for (let c = 0; c < 9; c++) cells.push(mk(Object.assign({}, proto, { z: 1, x: Math.round(cw * (c % 3) + cw / 2), y: Math.round(ch * ((c / 3) | 0) + ch / 2 + (kind === 'chr' || kind === 'item' ? 44 : 0)) })));
          const A1 = cells.map((e) => Object.assign({}, e)), B1 = cells.map((e) => Object.assign({}, e)); let done = false;
          for (let t = 0; t < 40 && !done; t++) { const op = pick(rng, tag === 'tutorial' ? ['hue', 'remove'] : ['hue', 'remove', 'size', 'flip', 'expr', 'color']), x = applyOp(A1[odd], op, rng, false); if (!x.ok) continue; const ar = area(A1[odd], x.el); if (!inside(ar, BW, BH, 2)) continue; B1[odd] = x.el; L.rounds.push({ w: BW, h: BH, bg: 'home', A: A1, B: B1.filter(Boolean), diffs: [Object.assign({ u: A1[odd].u, op }, ar)] }); done = true; }
          if (!done) break;
        }
        if (L.rounds.length < 3) continue; L.goalN = 3; L.elCount = 9;
      } else if (type === 'hidden') {
        const t = template(chapter), base = t.els.map((e) => Object.assign({}, e, { y: e.y * 1.9 > BH - 4 ? BH - 8 : Math.round(e.y * 1.9) }));
        base.forEach((e) => { if (e.k === 'chr') e.h = Math.round(e.h * 1.4); else if (e.k === 'item') { e.w = Math.round(e.w * 1.4); e.h = Math.round(e.h * 1.4); } else e.s = Math.round(e.s * 1.4); });
        const keep = base.filter((e) => inside(C.bbox(e), BW, BH, 2)); scatter(keep, rng, Math.round(density(n) * 1.5) + 8, BW, BH, t);
        const nT = tag === 'tutorial' ? 3 : Math.min(5, 3 + ((n / 6) | 0)), tg = shufR(TARGETS.slice(), rng).slice(0, nT), B1 = keep.map((e) => Object.assign({}, e)), diffs = [], names = [], icons = [];
        for (const [d, nm] of tg) { for (let tr = 0; tr < 80; tr++) { const x = 24 + rng() * (BW - 48), y = 40 + rng() * (BH - 70), s = 26, el = mk({ k: 'deco', d, x: Math.round(x), y: Math.round(y), s, c: '#C98F5A', z: 2, tgt: nm }), ar = area(el, null); if (!inside(ar, BW, BH, 4)) continue; if (keep.some((e) => { const q = C.bbox(e); return Math.hypot(q.x + q.w / 2 - x, q.y + q.h / 2 - y) < (q.w + q.h) / 4 + 10 && e.z === 2; })) continue; if (diffs.some((q) => Math.hypot(q.x + q.w / 2 - x, q.y + q.h / 2 - y) < 50)) continue; B1.push(el); diffs.push(Object.assign({ u: el.u, op: 'add', name: nm, d }, ar)); names.push(nm); icons.push(d); break; } }
        if (diffs.length < nT) continue; L.rounds.push({ w: BW, h: BH, bg: t.bg, A: keep, B: B1, diffs }); L.goalN = nT; L.targets = names; L.targetIcons = icons; L.elCount = keep.length;
      } else {
        const t = template(chapter), base = t.els.slice(); scatter(base, rng, density(n), W, H, t);
        let N = type === 'memory' ? Math.max(3, nD - 1) : type === 'zoom' ? nD + 2 : nD; if (rule === 0) N += 3; if (rule === 2) N = Math.max(3, N - 1); if (opts.n) N = opts.n;
        const lv = type === 'zoom' ? 'hard' : lvl, pr = pair(base, rng, N, lv, W, H, rule); if (pr.diffs.length < pr.want) continue;
        L.rounds.push({ w: W, h: H, bg: t.bg, A: pr.A, B: pr.B, diffs: pr.diffs }); L.goalN = pr.want; L.elCount = pr.A.length;
      }
      const errs = C.verify(L); if (errs.length) continue;
      L.ease = +C.easeScore(L).toFixed(2); return L;
    }
    return null;
  }
  const api = { mulberry, IDS, CHAPTERS, TYPE_NAME, TARGETS, typeOf, tagOf, make, density, W, H, BW, BH };
  if (typeof module !== 'undefined') module.exports = api; else root.SpotGen = api;
})(typeof window !== 'undefined' ? window : globalThis);
