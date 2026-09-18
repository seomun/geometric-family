/* 기하학 가족 — 캐릭터 코드 시스템 v6 「굿즈 에디션」 (2026-09-18)
   원칙(docs/03_STYLE_GUIDE.md): 플랫 컬러 · 균일한 외곽선 · 그라데이션 없음 · 팔다리 있음 · 어디에 찍어도 같은 얼굴.
   API: nemoDad({x,y,w,h,emo,pose,gaze,item,suit}) 등. 반환은 SVG 문자열. 페이지에 ROUGH_DEFS + CHAR_STYLE 1회 주입.
   emo 12종: good joy bad angry worry relief sad cry surprise love tired wink
   pose 10종: stand wave cheer think point hips shrug hold sit walk
   item: coffee americano phone envelope book bag violin racket heart star  */
(function (root) {
  'use strict';
  const INK = '#3d2b1f', PAPER = '#f4ecdd', SUIT = '#4a4a52', LINE = 4;      // LINE = 기준 외곽선. 절대 바꾸지 않는다.
  const COLORS = {
    nemoDad: '#e29368', nemoMom: '#ecb383', nemoGrandma: '#d8b58e', nemoKid1: '#f0c583', nemoKid2: '#f2b49e', nemoKid3: '#e6a9c0', nemoBaby: '#f8dcb0',
    semoHusband: '#9fb6d0', semoWife: '#ecc76a',
    dongDad: '#9fb0bf', dongMom: '#c4b3a0', dongSon: '#a9bcae', dongDaughter: '#cbb6c2'
  };
  const EMOS = ['good', 'joy', 'bad', 'angry', 'worry', 'relief', 'sad', 'cry', 'surprise', 'love', 'tired', 'wink'];
  const POSES = ['stand', 'wave', 'cheer', 'think', 'point', 'hips', 'shrug', 'hold', 'sit', 'walk'];
  const ITEMS = ['coffee', 'americano', 'phone', 'envelope', 'book', 'bag', 'violin', 'racket', 'heart', 'star'];

  const ROUGH_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs></defs></svg>`; // v6: 필터 없음(호환용)
  const CHAR_STYLE = `<style>
    .gf-ch .ink { stroke: ${INK}; stroke-width: ${LINE}; stroke-linecap: round; stroke-linejoin: round; fill: none; }
    .gf-ch .fill { stroke: ${INK}; stroke-width: ${LINE}; stroke-linejoin: round; stroke-linecap: round; }
    .gf-ch .thin { stroke: ${INK}; stroke-width: ${LINE * 0.7}; stroke-linecap: round; fill: none; }
    .gf-ch .white { fill: #fff; stroke: ${INK}; stroke-width: ${LINE * 0.7}; }
  </style>`;

  const dark = (c, k = 0.18) => { const n = parseInt(c.slice(1), 16); const f = v => Math.round(v * (1 - k)); return '#' + [(n >> 16), (n >> 8) & 255, n & 255].map(f).map(v => v.toString(16).padStart(2, '0')).join(''); };

  /* ---------- 얼굴 ---------- cx,cy 얼굴 중심 · s 스케일(1 = 폭 100) · opt: emo gaze eyeStyle lashes bags stable */
  function face(cx, cy, s, opt) {
    const { emo = 'good', gaze = 0, eyeStyle = 'round', lashes = false, bags = false, stable = false } = opt;
    s *= 1.12;
    const ex = 16 * s, ey = -2 * s, px = gaze * 2.6 * s, lw = LINE * s;
    const E = (d, w = lw) => `<path d="${d}" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`;
    let out = '';
    // 볼터치 (플랫)
    out += `<ellipse cx="${cx - ex - 9 * s}" cy="${cy + 9 * s}" rx="${7 * s}" ry="${4 * s}" fill="#f2a1ad" opacity=".55"/><ellipse cx="${cx + ex + 9 * s}" cy="${cy + 9 * s}" rx="${7 * s}" ry="${4 * s}" fill="#f2a1ad" opacity=".55"/>`;
    // 눈썹
    const browY = cy + ey - 14 * s, bw = 8 * s;
    let bl = 0, br = 0;
    if (!stable || emo === 'angry') { if (emo === 'bad' || emo === 'angry') { bl = 5 * s; br = 5 * s; } else if (['worry', 'sad', 'cry'].includes(emo)) { bl = -5 * s; br = -5 * s; } else if (emo === 'surprise') { bl = -2 * s; br = -2 * s; } }
    const browLift = emo === 'surprise' ? -3 * s : 0;
    out += E(`M${cx - ex - bw},${browY + browLift} Q${cx - ex},${browY - 3 * s + bl / 2 + browLift} ${cx - ex + bw},${browY + bl + browLift}`, lw * 0.7) + E(`M${cx + ex + bw},${browY + browLift} Q${cx + ex},${browY - 3 * s + br / 2 + browLift} ${cx + ex - bw},${browY + br + browLift}`, lw * 0.7);
    // 눈
    const closedHappy = (x) => E(`M${x - 9 * s},${cy + ey + 2 * s} q${9 * s},${-10 * s} ${18 * s},0`);
    const closedDown = (x) => E(`M${x - 8 * s},${cy + ey} q${8 * s},${7 * s} ${16 * s},0`);
    const heart = (x) => `<path d="M${x},${cy + ey + 7 * s} c${-12 * s},${-8 * s} ${-9 * s},${-20 * s} 0,${-12 * s} c${9 * s},${-8 * s} ${12 * s},${4 * s} 0,${12 * s}z" fill="#f05a7a" stroke="${INK}" stroke-width="${lw * 0.6}"/>`;
    const eye = (x, side) => {
      if (emo === 'joy' && !stable) return closedHappy(x);
      if (emo === 'relief' || emo === 'tired') return closedDown(x);
      if (emo === 'wink' && side === 1) return closedHappy(x);
      if (emo === 'love' && !stable) return heart(x);
      let rx = 9.5 * s, ry = 10.5 * s;
      if (eyeStyle === 'big') { rx = 10.5 * s; ry = 12 * s; }
      if (emo === 'surprise') { rx *= 1.15; ry *= 1.2; }
      let shape;
      if (eyeStyle === 'almond') shape = `<path class="white" d="M${x - 10 * s},${cy + ey} q${10 * s},${-12 * s} ${20 * s},0 q${-10 * s},${9 * s} ${-20 * s},0z" stroke-width="${lw * 0.7}"/>`;
      else if (eyeStyle === 'calm') shape = `<path class="white" d="M${x - 10 * s},${cy + ey - 1 * s} q${10 * s},${-8 * s} ${20 * s},0 q${-10 * s},${11 * s} ${-20 * s},0z" stroke-width="${lw * 0.7}"/>`;
      else shape = `<ellipse class="white" cx="${x}" cy="${cy + ey}" rx="${rx}" ry="${ry}" stroke-width="${lw * 0.7}"/>`;
      const pr = (eyeStyle === 'big' ? 6.2 : (eyeStyle === 'almond' || eyeStyle === 'calm') ? 4.6 : 5.2) * s * (emo === 'surprise' ? 0.8 : 1);
      const droop = (['sad', 'cry'].includes(emo) && !stable) ? 1.5 * s : 0;
      let g = shape + `<circle cx="${x + px}" cy="${cy + ey + droop}" r="${pr}" fill="${INK}"/>` +
        `<circle cx="${x + px + 2 * s}" cy="${cy + ey - 2.6 * s + droop}" r="${2.1 * s}" fill="#fff"/><circle cx="${x + px - 1.8 * s}" cy="${cy + ey + 2.2 * s + droop}" r="${1.1 * s}" fill="#fff"/>`;
      if (lashes) g += E(`M${x + 8 * s},${cy + ey - 7 * s} l${3.5 * s},${-3 * s} M${x + 10 * s},${cy + ey - 3.5 * s} l${4 * s},${-1.5 * s}`, lw * 0.6);
      if (bags) g += `<path d="M${x - 5 * s},${cy + ey + 12.5 * s} q${5 * s},${2.5 * s} ${10 * s},0" stroke="${INK}" stroke-width="${lw * 0.5}" fill="none" opacity=".6"/>`;
      if (emo === 'cry') g += `<path d="M${x + 6 * s},${cy + ey + 9 * s} q${3 * s},${8 * s} 0,${14 * s} q${-3 * s},${-6 * s} 0,${-14 * s}z" fill="#8fc7ee" stroke="${INK}" stroke-width="${lw * 0.5}"/>`;
      return g;
    };
    out += eye(cx - ex, -1) + eye(cx + ex, 1);
    // 입
    const my = cy + 16 * s;
    const M = {
      good: E(`M${cx - 8 * s},${my} q${8 * s},${9 * s} ${16 * s},0`),
      joy: `<path d="M${cx - 11 * s},${my - 2 * s} q${11 * s},${18 * s} ${22 * s},0z" fill="#c0392b" stroke="${INK}" stroke-width="${lw * 0.8}" stroke-linejoin="round"/>`,
      bad: E(`M${cx - 8 * s},${my + 4 * s} q${8 * s},${-7 * s} ${16 * s},0`),
      angry: E(`M${cx - 9 * s},${my + 3 * s} l${18 * s},0`),
      worry: E(`M${cx - 8 * s},${my + 2 * s} q${4 * s},${-4 * s} ${8 * s},0 q${4 * s},${4 * s} ${8 * s},0`) + `<path d="M${cx + 28 * s},${cy - 8 * s} q${3.5 * s},${7 * s} 0,${10 * s} q${-3.5 * s},${-3 * s} 0,${-10 * s}z" fill="#8fc7ee" stroke="${INK}" stroke-width="${lw * 0.5}"/>`,
      relief: E(`M${cx - 6 * s},${my + 1 * s} q${6 * s},${5 * s} ${12 * s},0`) + `<path d="M${cx + 24 * s},${my - 2 * s} q${4 * s},${2 * s} ${8 * s},0 M${cx + 26 * s},${my + 3 * s} q${4 * s},${2 * s} ${8 * s},0" stroke="${INK}" stroke-width="${lw * 0.5}" fill="none" opacity=".6"/>`,
      sad: E(`M${cx - 5 * s},${my + 3 * s} q${5 * s},${-3 * s} ${10 * s},0`),
      cry: E(`M${cx - 7 * s},${my + 4 * s} q${7 * s},${-6 * s} ${14 * s},0`),
      surprise: `<ellipse cx="${cx}" cy="${my + 2 * s}" rx="${5 * s}" ry="${6.5 * s}" fill="#c0392b" stroke="${INK}" stroke-width="${lw * 0.8}"/>`,
      love: E(`M${cx - 8 * s},${my} q${8 * s},${9 * s} ${16 * s},0`),
      tired: E(`M${cx - 6 * s},${my + 3 * s} l${12 * s},0`) + `<text x="${cx + 26 * s}" y="${cy - 10 * s}" font-size="${12 * s}" font-weight="700" fill="${INK}" font-family="sans-serif">z</text>`,
      wink: E(`M${cx - 8 * s},${my} q${8 * s},${9 * s} ${16 * s},0`)
    };
    out += M[emo] || M.good;
    if (emo === 'love') out += `<path d="M${cx + 30 * s},${cy - 14 * s} c${-6 * s},${-4 * s} ${-4 * s},${-10 * s} 0,${-6 * s} c${4 * s},${-4 * s} ${6 * s},${2 * s} 0,${6 * s}z" fill="#f05a7a" stroke="${INK}" stroke-width="${lw * 0.5}"/>`;
    return out;
  }

  /* ---------- 팔·다리 ---------- 외곽선 있는 통통한 팔. from(어깨) → to(손), bend 로 팔꿈치 방향 */
  function limb(x1, y1, x2, y2, w, color, bend = 0) {
    const mx = (x1 + x2) / 2 + bend, my = (y1 + y2) / 2 + Math.abs(bend) * 0.3;
    const d = `M${x1},${y1} Q${mx},${my} ${x2},${y2}`;
    return `<path d="${d}" stroke="${INK}" stroke-width="${w + LINE * 2}" stroke-linecap="round" fill="none"/><path d="${d}" stroke="${color}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;
  }
  const hand = (x, y, r, color) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${color}" stroke="${INK}" stroke-width="${LINE}"/>`;
  const foot = (x, y, r, color) => `<ellipse cx="${x}" cy="${y}" rx="${r * 1.25}" ry="${r * 0.8}" fill="${dark(color, 0.35)}" stroke="${INK}" stroke-width="${LINE}"/>`;

  /* 포즈: 어깨(sl, sr)·엉덩이(hl, hr) 좌표와 몸 크기 u 를 받아 팔다리 SVG 를 만든다. 손 위치는 u 기준 비율 [dx, dy, bend]. */
  function limbs({ sl, sr, hl, hr, u, color, pose = 'stand', gaze = 0, armW, legW, ground }) {
    armW = armW || u * 0.15; legW = legW || u * 0.15;
    const hr_ = u * 0.105, fr = u * 0.1;
    const P = {
      stand: { L: [-0.62, 0.42, 0], R: [0.62, 0.42, 0] },
      wave: { L: [-0.62, 0.42, 0], R: [0.95, -0.45, 12] },
      cheer: { L: [-0.95, -0.5, -10], R: [0.95, -0.5, 10] },
      think: { L: [-0.62, 0.42, 0], R: [0.26, 0.12, 22] },
      point: { L: [-0.62, 0.42, 0], R: [1.1, 0.02, 0] },
      hips: { L: [-0.5, 0.35, -18], R: [0.5, 0.35, 18] },
      shrug: { L: [-1.0, 0.1, -6], R: [1.0, 0.1, 6] },
      hold: { L: [-0.2, 0.2, -16], R: [0.2, 0.2, 16] },
      sit: { L: [-0.55, 0.45, 0], R: [0.55, 0.45, 0] },
      walk: { L: [-0.7, 0.2, -6], R: [0.6, 0.55, 6] }
    }[pose] || { L: [-0.62, 0.42, 0], R: [0.62, 0.42, 0] };
    const cx = (sl[0] + sr[0]) / 2, cy = (sl[1] + sr[1]) / 2;
    const Lh = [cx + P.L[0] * u, cy + P.L[1] * u], Rh = [cx + P.R[0] * u, cy + P.R[1] * u];
    if (pose === 'point' && gaze < 0) { const t = Lh[0]; Lh[0] = cx - (Rh[0] - cx); Rh[0] = cx - (t - cx); }
    let g = '';
    // 다리
    if (pose === 'sit') {
      g += limb(hl[0], hl[1], hl[0] - u * 0.35, hl[1] + u * 0.12, legW, color, 0) + limb(hr[0], hr[1], hr[0] + u * 0.35, hr[1] + u * 0.12, legW, color, 0);
      g += foot(hl[0] - u * 0.42, hl[1] + u * 0.14, fr, color) + foot(hr[0] + u * 0.42, hr[1] + u * 0.14, fr, color);
    } else if (pose === 'walk') {
      g += limb(hl[0], hl[1], hl[0] - u * 0.16, ground, legW, color, 0) + limb(hr[0], hr[1], hr[0] + u * 0.16, ground, legW, color, 0);
      g += foot(hl[0] - u * 0.16, ground + fr * 0.4, fr, color) + foot(hr[0] + u * 0.16, ground + fr * 0.4, fr, color);
    } else {
      g += limb(hl[0], hl[1], hl[0], ground, legW, color, 0) + limb(hr[0], hr[1], hr[0], ground, legW, color, 0);
      g += foot(hl[0], ground + fr * 0.4, fr, color) + foot(hr[0], ground + fr * 0.4, fr, color);
    }
    // 팔 (hold·think 는 몸 앞에 그린다)
    const arms = limb(sl[0], sl[1], Lh[0], Lh[1], armW, color, P.L[2]) + limb(sr[0], sr[1], Rh[0], Rh[1], armW, color, P.R[2]) + hand(Lh[0], Lh[1], hr_, color) + hand(Rh[0], Rh[1], hr_, color);
    const front = pose === 'hold' || pose === 'think';
    return { svg: g + (front ? '' : arms), front: front ? arms : '', Lh, Rh };
  }

  /* ---------- 소품 (오른손 위치에 붙는다) ---------- */
  function itemAt(item, x, y, u) {
    const k = u / 100 * 1.3, S = (d, f, w = LINE) => `<path d="${d}" fill="${f}" stroke="${INK}" stroke-width="${w}" stroke-linejoin="round"/>`;
    switch (item) {
      case 'coffee': case 'americano': { const warm = item === 'coffee'; return `<g transform="translate(${x - 12 * k},${y - 22 * k}) scale(${k})">${S('M0,0 h26 l-3,28 h-20z', warm ? '#e9d3a8' : '#f4f4f4')}<ellipse cx="13" cy="0" rx="13" ry="3.5" fill="${warm ? '#b07a3e' : '#3a2a20'}" stroke="${INK}" stroke-width="${LINE * 0.7}"/>${S('M26,7 q11,2 9,11 q-2,7 -11,7', 'none', LINE * 0.7)}<path d="M7,-7 q3,-5 0,-10 M14,-9 q3,-5 0,-10" stroke="${INK}" stroke-width="2" fill="none" opacity=".5"/></g>`; }
      case 'phone': return `<g transform="translate(${x - 9 * k},${y - 26 * k}) scale(${k})">${S('M0,0 h18 a3,3 0 0 1 3,3 v30 a3,3 0 0 1 -3,3 h-18 a3,3 0 0 1 -3,-3 v-30 a3,3 0 0 1 3,-3z', '#3a3a44')}<rect x="0" y="4" width="18" height="24" fill="#bcd6ea"/></g>`;
      case 'envelope': return `<g transform="translate(${x - 16 * k},${y - 12 * k}) scale(${k})">${S('M0,0 h32 v22 h-32z', '#fff')}${S('M0,0 l16,12 l16,-12', 'none', LINE * 0.7)}</g>`;
      case 'book': return `<g transform="translate(${x - 14 * k},${y - 18 * k}) scale(${k})">${S('M0,0 h28 v34 h-28z', '#e8b4b8')}${S('M5,0 v34', 'none', LINE * 0.7)}</g>`;
      case 'bag': return `<g transform="translate(${x - 14 * k},${y - 4 * k}) scale(${k})">${S('M0,6 h28 v26 a4,4 0 0 1 -4,4 h-20 a4,4 0 0 1 -4,-4z', '#8b6b4a')}${S('M8,6 q6,-12 12,0', 'none')}</g>`;
      case 'violin': return `<g transform="translate(${x},${y}) rotate(-35) scale(${k})">${S('M-8,-24 q8,-8 16,0 q5,14 -1,30 q-8,5 -14,0 q-6,-16 -1,-30z', '#8a4b2a')}${S('M0,-24 v-22', 'none', LINE * 0.7)}<path d="M-3,-8 v12 M3,-8 v12" stroke="${INK}" stroke-width="1.5"/></g>`;
      case 'racket': return `<g transform="translate(${x},${y}) rotate(25) scale(${k})"><ellipse cx="0" cy="-26" rx="13" ry="17" fill="#fff" stroke="${INK}" stroke-width="${LINE}"/><path d="M-9,-26 h18 M0,-40 v28 M-5,-36 v20 M5,-36 v20" stroke="${INK}" stroke-width="1.5" opacity=".5"/>${S('M0,-9 v16', 'none')}</g>`;
      case 'heart': return `<path transform="translate(${x},${y - 14 * k}) scale(${k})" d="M0,10 c-16,-10 -12,-28 0,-18 c12,-10 16,8 0,18z" fill="#f05a7a" stroke="${INK}" stroke-width="${LINE}"/>`;
      case 'star': return `<path transform="translate(${x},${y - 14 * k}) scale(${k})" d="M0,-16 l4.7,9.5 10.5,1.5 -7.6,7.4 1.8,10.4 -9.4,-4.9 -9.4,4.9 1.8,-10.4 -7.6,-7.4 10.5,-1.5z" fill="#f5c542" stroke="${INK}" stroke-width="${LINE}"/>`;
      default: return '';
    }
  }

  function collar(cx, yb, w) {
    return `<path d="M${cx - w / 2},${yb} L${cx},${yb + w * 0.28} L${cx + w / 2},${yb} L${cx + w * 0.3},${yb} L${cx},${yb + w * 0.18} L${cx - w * 0.3},${yb}z" fill="#fff" stroke="${INK}" stroke-width="${LINE * 0.6}" stroke-linejoin="round"/>` +
      `<path d="M${cx},${yb + w * 0.16} l${w * 0.07},${w * 0.1} l${-w * 0.07},${w * 0.34} l${-w * 0.07},${-w * 0.34}z" fill="${SUIT}" stroke="${INK}" stroke-width="${LINE * 0.5}"/>`;
  }
  const wrap = (inner) => `<g class="gf-ch">${inner}</g>`;
  const glassesAt = (cx, cy, s) => `<circle cx="${cx - 17 * s}" cy="${cy}" r="${12 * s}" fill="none" stroke="${INK}" stroke-width="${LINE * 0.7}"/><circle cx="${cx + 17 * s}" cy="${cy}" r="${12 * s}" fill="none" stroke="${INK}" stroke-width="${LINE * 0.7}"/><path d="M${cx - 5 * s},${cy} h${10 * s}" stroke="${INK}" stroke-width="${LINE * 0.7}"/>`;

  /* ---------- 네모가족 ---------- */
  function square(o) {
    const { x, y, w, h, color, emo = 'good', pose = 'stand', gaze = 0, item = null, suit = false, faceY = 0.46, faceS = 1, feat = '', after = '', extraHands = false, faceOpt } = o;
    const cx = x + w / 2, s = (w / 100) * faceS, r = w * 0.16;
    const L = limbs({ sl: [x + 2, y + h * 0.58], sr: [x + w - 2, y + h * 0.58], hl: [cx - w * 0.22, y + h - 4], hr: [cx + w * 0.22, y + h - 4], u: w, color, pose, gaze, ground: y + h + w * 0.09 });
    let g = L.svg;
    if (extraHands) g += limb(x + 2, y + h * 0.78, x - w * 0.42, y + h * 0.95, w * 0.16, color, -6) + limb(x + w - 2, y + h * 0.78, x + w + w * 0.42, y + h * 0.95, w * 0.16, color, 6) + hand(x - w * 0.42, y + h * 0.95, w * 0.11, color) + hand(x + w + w * 0.42, y + h * 0.95, w * 0.11, color);
    g += `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${color}" stroke="${INK}" stroke-width="${LINE}"/>`;
    if (suit) g += `<path d="M${x},${y + h * 0.66} h${w} v${h * 0.34 - r} a${r},${r} 0 0 1 ${-r},${r} h${-(w - 2 * r)} a${r},${r} 0 0 1 ${-r},${-r}z" fill="${SUIT}" stroke="${INK}" stroke-width="${LINE}"/>` + collar(cx, y + h * 0.66, w * 0.5);
    g += feat;
    g += face(cx, y + h * faceY, s, faceOpt || { emo, gaze });
    g += after + L.front;
    if (item) g += itemAt(item, L.Rh[0], L.Rh[1], w);
    return wrap(g);
  }
  function nemoDad(o) {
    const { x, y, w = 120, h = 106 } = o; const cx = x + w / 2, s = w / 100, fy = y + h * 0.46;
    const feat = `<path d="M${cx - 26 * s},${y + 6} q4,-9 8,0 M${cx - 8 * s},${y + 5} q4,-10 8,0 M${cx + 12 * s},${y + 6} q4,-9 8,0" stroke="${INK}" stroke-width="${LINE}" fill="none" stroke-linecap="round"/>`;
    let after = `<path d="M${cx - 9 * s},${fy + 11 * s} q${4.5 * s},${-5 * s} ${9 * s},0 q${4.5 * s},${-5 * s} ${9 * s},0" stroke="${INK}" stroke-width="${LINE * 1.2}" fill="none" stroke-linecap="round"/>`;
    if (o.glasses) after += glassesAt(cx, fy - 2 * s, s);
    return square({ ...o, w, h, color: COLORS.nemoDad, feat, after, faceY: 0.44, faceOpt: { emo: o.emo || 'good', gaze: o.gaze || 0, bags: true } });
  }
  function nemoMom(o) {
    const { x, y, w = 96, h = 92 } = o; const cx = x + w / 2, s = w / 100;
    const feat = `<circle cx="${cx + 28 * s}" cy="${y - 2}" r="${10 * s}" fill="${INK}"/><path d="M${cx - 32 * s},${y + 3} q${32 * s},${-12 * s} ${64 * s},0" stroke="${INK}" stroke-width="${LINE * 1.2}" fill="none" stroke-linecap="round"/>`;
    return square({ ...o, w, h, color: COLORS.nemoMom, feat, faceY: 0.47, extraHands: o.manyHands !== false, faceOpt: { emo: o.emo || 'good', gaze: o.gaze || 0, lashes: true } });
  }
  function nemoKid(o) {
    const { x, y, w = 66, h = 66, color = COLORS.nemoKid1, tuft = true } = o; const cx = x + w / 2;
    const feat = tuft ? `<path d="M${cx - 2},${y + 1} q-2,-13 7,-15 q-7,5 -3,15" stroke="${INK}" stroke-width="${LINE * 0.8}" fill="none" stroke-linecap="round"/>` : '';
    return square({ ...o, w, h, color, feat, faceY: 0.52, faceS: 0.72, faceOpt: { emo: o.emo || 'good', gaze: o.gaze || 0, eyeStyle: 'big' } });
  }
  function nemoGrandma(o) {
    const { x, y, w = 84, h = 80 } = o; const cx = x + w / 2, s = w / 100;
    const feat = `<circle cx="${cx}" cy="${y - 2}" r="${10 * s}" fill="#e8e2d8" stroke="${INK}" stroke-width="${LINE}"/>`;
    return square({ ...o, w, h, color: COLORS.nemoGrandma, feat, faceY: 0.46, faceOpt: { emo: o.emo || 'good', gaze: o.gaze || 0, bags: true } });
  }

  /* ---------- 세모부부 ---------- */
  function semo({ x, y, size = 122, emo = 'good', pose = 'stand', gaze = 0, item = null, suit = false, wife = false }) {
    const cx = x + size / 2, h = size * 0.9, s = size / 130, color = wife ? COLORS.semoWife : COLORS.semoHusband;
    const L = limbs({ sl: [cx - size * 0.27, y + h * 0.55], sr: [cx + size * 0.27, y + h * 0.55], hl: [cx - size * 0.2, y + h - 4], hr: [cx + size * 0.2, y + h - 4], u: size, color, pose, gaze, ground: y + h + size * 0.09 });
    let g = L.svg;
    g += `<path d="M${cx},${y} L${cx + size / 2},${y + h} L${cx - size / 2},${y + h}z" fill="${color}" stroke="${INK}" stroke-width="${LINE}" stroke-linejoin="round"/>`;
    if (suit) { const yb = y + h * 0.7, hw = (size / 2) * (yb - y) / h; g += `<path d="M${cx - hw},${yb} L${cx + hw},${yb} L${cx + size / 2},${y + h} L${cx - size / 2},${y + h}z" fill="${SUIT}" stroke="${INK}" stroke-width="${LINE}" stroke-linejoin="round"/>` + collar(cx, yb, size * 0.34); }
    g += `<path d="M${cx - 2},${y + 3} q-3,-15 11,-17 q-9,6 -4,17" stroke="${INK}" stroke-width="${LINE * 0.9}" fill="none" stroke-linecap="round"/>`; // 퀴프
    if (wife) g += `<circle cx="${cx + size * 0.08}" cy="${y + 2}" r="${size * 0.05}" fill="#f4c6d0" stroke="${INK}" stroke-width="${LINE * 0.6}"/>`;
    g += face(cx, y + h * 0.6, s, { emo, gaze, eyeStyle: 'almond', lashes: wife }) + L.front;
    if (item) g += itemAt(item, L.Rh[0], L.Rh[1], size);
    return wrap(g);
  }
  const semoHusband = (o) => semo({ ...o, wife: false });
  const semoWife = (o) => semo({ ...o, wife: true });

  /* ---------- 동그라미가족 ---------- */
  function dong({ cx, cy, r = 48, emo = 'good', pose = 'stand', gaze = 0, item = null, glasses = false, suit = false, who = 'dad' }) {
    const s = r / 55, color = COLORS[{ dad: 'dongDad', mom: 'dongMom', son: 'dongSon', daughter: 'dongDaughter' }[who]], u = r * 2;
    const a = Math.PI / 180 * 20;
    const L = limbs({ sl: [cx - r * Math.cos(a), cy + r * Math.sin(a)], sr: [cx + r * Math.cos(a), cy + r * Math.sin(a)], hl: [cx - r * 0.42, cy + r * 0.9], hr: [cx + r * 0.42, cy + r * 0.9], u, color, pose, gaze, ground: cy + r + u * 0.08 });
    let g = L.svg;
    g += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}" stroke="${INK}" stroke-width="${LINE}"/>`;
    if (suit) { const yb = cy + r * 0.45, hw = Math.sqrt(r * r - (yb - cy) * (yb - cy)); g += `<path d="M${cx - hw},${yb} A${r},${r} 0 0 0 ${cx + hw},${yb}z" fill="${SUIT}" stroke="${INK}" stroke-width="${LINE}"/>` + collar(cx, yb, r * 0.9); }
    const H = (d, w = LINE) => `<path d="${d}" stroke="${INK}" stroke-width="${w}" fill="none" stroke-linecap="round"/>`;
    if (who === 'dad') g += H(`M${cx - r * 0.55},${cy - r * 0.62} q${r * 0.5},${-r * 0.2} ${r * 1.1},${r * 0.05}`) + H(`M${cx - r * 0.15},${cy - r * 0.68} l${r * 0.1},${r * 0.25}`, LINE * 0.7);
    if (who === 'mom') g += H(`M${cx - r * 0.6},${cy - r * 0.55} q${r * 0.3},${-r * 0.35} ${r * 0.7},${-r * 0.1} q${r * 0.3},${-r * 0.05} ${r * 0.5},${r * 0.2}`);
    if (who === 'daughter') g += H(`M${cx - r * 0.5},${cy - r * 0.6} q${r * 0.5},${-r * 0.3} ${r},0`) + `<circle cx="${cx + r * 0.55}" cy="${cy - r * 0.55}" r="${r * 0.12}" fill="#e8a5b0" stroke="${INK}" stroke-width="${LINE * 0.6}"/>`;
    if (who === 'son') g += H(`M${cx - r * 0.45},${cy - r * 0.6} q${r * 0.45},${-r * 0.25} ${r * 0.9},0`);
    g += face(cx, cy + r * 0.05, s, { emo, gaze, eyeStyle: 'calm', stable: true, lashes: who === 'mom' || who === 'daughter' });
    if (glasses) g += glassesAt(cx, cy + r * 0.05 - 2 * s, s);
    g += L.front;
    if (item) g += itemAt(item, L.Rh[0], L.Rh[1], u);
    return wrap(g);
  }
  const dongDad = (o) => dong({ glasses: true, ...o, who: 'dad' });
  const dongMom = (o) => dong({ ...o, who: 'mom' });
  const dongSon = (o) => dong({ r: 34, item: 'violin', ...o, who: 'son' });
  const dongDaughter = (o) => dong({ r: 34, item: 'racket', ...o, who: 'daughter' });

  /* ---------- 가족 초상 / 상태 ---------- */
  function squareFamilyPortrait(x = 0, y = 0) {
    return `<g transform="translate(${x},${y})">` +
      nemoKid({ x: 0, y: 40, w: 66, h: 66, color: COLORS.nemoKid1, emo: 'joy', gaze: 1 }) +
      nemoKid({ x: 96, y: 40, w: 66, h: 66, color: COLORS.nemoKid2, emo: 'angry', gaze: 1, pose: 'point' }) +
      nemoKid({ x: 192, y: 40, w: 66, h: 66, color: COLORS.nemoKid3, emo: 'bad', gaze: -1, pose: 'hips' }) +
      nemoKid({ x: 290, y: 50, w: 56, h: 56, color: COLORS.nemoBaby, emo: 'good', tuft: false, pose: 'cheer' }) +
      nemoDad({ x: 0, y: 150, w: 120, h: 106, emo: 'relief', pose: 'stand' }) +
      nemoMom({ x: 140, y: 164, w: 96, h: 92, emo: 'good', pose: 'hold' }) +
      nemoGrandma({ x: 262, y: 176, w: 84, h: 80, emo: 'good' }) +
      nemoKid({ x: 86, y: 216, w: 40, h: 40, color: COLORS.nemoBaby, emo: 'surprise', tuft: false, gaze: -1 }) +
      '</g>';
  }
  function triangleWedding(x = 0, y = 0) {
    const size = 122;
    return `<g transform="translate(${x},${y})">` + semoHusband({ x: 0, y: 0, size, emo: 'love', gaze: 1, pose: 'hold', item: 'heart' }) + semoWife({ x: size + 20, y: 0, size, emo: 'joy', gaze: -1, pose: 'cheer' }) + '</g>';
  }
  function triangleBattle(x = 0, y = 0) {
    const size = 122;
    return `<g transform="translate(${x},${y})">` + semoHusband({ x: 0, y: 0, size, emo: 'angry', gaze: 1, pose: 'point' }) + semoWife({ x: size + 20, y: 0, size, emo: 'angry', gaze: -1, pose: 'hips' }) + '</g>';
  }
  function circleFamilyPortrait(x = 0, y = 0) {
    return `<g transform="translate(${x},${y})">` + dongDad({ cx: 50, cy: 60, r: 48, emo: 'good', item: 'book', pose: 'hold' }) + dongMom({ cx: 170, cy: 60, r: 48, emo: 'good', gaze: 1 }) + dongSon({ cx: 280, cy: 74 }) + dongDaughter({ cx: 370, cy: 74 }) + '</g>';
  }

  /* ---------- 소품·배경·말풍선 (컷 조립용) ---------- */
  function coffeeCup(x, y, scale = 1, warm = true) { return `<g class="gf-ch">${itemAt(warm ? 'coffee' : 'americano', x + 13 * scale, y + 22 * scale, 100 * scale)}</g>`; }
  function windowBg(id, skyTop = '#cfe3f4', skyBot = '#f6e8d0', sill = '#d9c7ad', wall = '#efe6d6', w = 720, h = 420) {
    return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${skyTop}"/><stop offset="1" stop-color="${skyBot}"/></linearGradient></defs>` +
      `<rect x="0" y="0" width="${w}" height="${h}" fill="${wall}"/><rect x="${w * 0.12}" y="${h * 0.08}" width="${w * 0.76}" height="${h * 0.62}" fill="url(#${id})" stroke="${INK}" stroke-width="4"/>` +
      `<path d="M${w * 0.5},${h * 0.08} v${h * 0.62} M${w * 0.12},${h * 0.39} h${w * 0.76}" stroke="${INK}" stroke-width="3" opacity=".7"/>` +
      `<rect x="${w * 0.1}" y="${h * 0.7}" width="${w * 0.8}" height="${h * 0.05}" fill="${sill}" stroke="${INK}" stroke-width="3"/>`;
  }
  function speech(x, y, w, text, opt = {}) {
    const lines = Array.isArray(text) ? text : [text]; const lh = opt.size || 32; const h = lines.length * lh + 24; const tail = opt.tail || 'left';
    const tx = tail === 'left' ? x + 24 : x + w - 24;
    return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#fff" stroke="${INK}" stroke-width="2.5"/><path d="M${tx - 8},${y + h - 1} l8,14 l8,-14z" fill="#fff" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><rect x="${tx - 7}" y="${y + h - 3}" width="14" height="5" fill="#fff"/>` +
      lines.map((t, i) => `<text x="${x + 18}" y="${y + 16 + lh * (i + 0.72)}" font-family="'Gowun Dodum', 'Malgun Gothic', sans-serif" font-size="${lh - 6}" font-weight="700" fill="${INK}">${t}</text>`).join('') + '</g>';
  }
  function narration(x, y, w, text, opt = {}) {
    const lines = Array.isArray(text) ? text : [text]; const lh = opt.size || 34; const h = lines.length * lh + 26;
    return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${PAPER}" stroke="${INK}" stroke-width="1.5" opacity=".95"/>` +
      lines.map((t, i) => `<text x="${x + w / 2}" y="${y + 16 + lh * (i + 0.75)}" text-anchor="middle" font-family="'Nanum Myeongjo', serif" font-size="${lh - 8}" font-weight="700" fill="${INK}">${t}</text>`).join('') + '</g>';
  }

  const GF = { VERSION: 'v6', INK, PAPER, SUIT, LINE, COLORS, EMOS, POSES, ITEMS, ROUGH_DEFS, CHAR_STYLE, face, itemAt,
    nemoDad, nemoMom, nemoKid, nemoGrandma, semoHusband, semoWife, dongDad, dongMom, dongSon, dongDaughter,
    squareFamilyPortrait, triangleWedding, triangleBattle, circleFamilyPortrait, coffeeCup, windowBg, speech, narration, suitCollar: collar };
  root.GF = GF; Object.assign(root, GF);
})(typeof window !== 'undefined' ? window : globalThis);
