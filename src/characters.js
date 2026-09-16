/* 기하학 가족 — 캐릭터 코드 시스템 v5 (2026-09-16 재구축)
   캐릭터는 SVG 문자열로 고정. 매 컷 100% 동일. 표정(emo)·시선(gaze)·상복(suit)만 파라미터.
   사용: 페이지에 ROUGH_DEFS + CHAR_STYLE 1회 주입 → nemoDad({x,y,...}) 등이 반환하는 SVG 조각을 <svg> 안에 넣는다.
   전역: GF (이 파일의 유일한 네임스페이스) + 편의를 위해 함수들을 window 에도 노출. */
(function (root) {
  'use strict';
  const INK = '#4a3626', PAPER = '#f4ecdd', SUIT = '#4a4a52';
  const COLORS = {
    nemoDad: '#e29368', nemoMom: '#ecb383', nemoGrandma: '#d8b58e', nemoKid1: '#f0c583', nemoKid2: '#f2b49e', nemoKid3: '#e6a9c0', nemoBaby: '#f8dcb0',
    semoHusband: '#9fb6d0', semoWife: '#ecc76a',
    dongDad: '#9fb0bf', dongMom: '#c4b3a0', dongSon: '#a9bcae', dongDaughter: '#cbb6c2'
  };
  const EMOS = ['good', 'bad', 'worry', 'relief', 'sad'];

  // ---------- 페이지에 1회 주입 ----------
  const ROUGH_DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <filter id="gf-rough" x="-5%" y="-5%" width="110%" height="110%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="n"/>
      <feDisplacementMap in="SourceGraphic" in2="n" scale="1.6" xChannelSelector="R" yChannelSelector="G"/>
    </filter>
    <radialGradient id="gf-gloss" cx="0.32" cy="0.25" r="0.75"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></radialGradient>
    <radialGradient id="gf-shadow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#4a3626" stop-opacity=".28"/><stop offset="1" stop-color="#4a3626" stop-opacity="0"/></radialGradient>
  </defs></svg>`;
  const CHAR_STYLE = `<style>
    .gf-ch { filter: url(#gf-rough); }
    .gf-ch .ink { stroke: ${INK}; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round; fill: none; }
    .gf-ch .fill { stroke: ${INK}; stroke-width: 3; stroke-linejoin: round; }
    .gf-ch .thin { stroke: ${INK}; stroke-width: 2; stroke-linecap: round; fill: none; }
    .gf-ch .white { fill: #fff; stroke: ${INK}; stroke-width: 2; }
  </style>`;

  // ---------- 저수준 헬퍼 ----------
  const shade = (c, k) => { // k<0 어둡게, k>0 밝게
    const n = parseInt(c.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const f = v => Math.max(0, Math.min(255, Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k)));
    return '#' + [f(r), f(g), f(b)].map(v => v.toString(16).padStart(2, '0')).join('');
  };
  const groundShadow = (cx, y, w) => `<ellipse cx="${cx}" cy="${y + 4}" rx="${w * 0.55}" ry="${w * 0.09}" fill="url(#gf-shadow)"/>`;

  /* 얼굴: cx, cy 얼굴 중심. s = 스케일(1 = 폭 100 기준). opt: emo, gaze, eyeStyle('round'|'almond'|'calm'|'big'), lashes, bags(눈밑주름), stable(동그라미: 감정에도 눈매 고정) */
  function face(cx, cy, s, opt) {
    const { emo = 'good', gaze = 0, eyeStyle = 'round', lashes = false, bags = false, stable = false } = opt;
    const ex = 15 * s, ey = -4 * s, px = gaze * 2.4 * s;
    let out = '';
    // 눈썹
    const browY = cy + ey - 12 * s, bw = 8 * s;
    let bl = 0, br = 0; // 눈썹 기울기(안쪽 끝 y 오프셋)
    if (!stable) { if (emo === 'bad') { bl = 4 * s; br = 4 * s; } else if (emo === 'worry' || emo === 'sad') { bl = -4 * s; br = -4 * s; } }
    out += `<path class="thin" d="M${cx - ex - bw},${browY} L${cx - ex + bw},${browY + bl}"/><path class="thin" d="M${cx + ex + bw},${browY} L${cx + ex - bw},${browY + br}"/>`;
    // 눈
    const eye = (x) => {
      if (emo === 'relief' && !stable) return `<path class="thin" d="M${x - 6 * s},${cy + ey + 1 * s} q${6 * s},${5 * s} ${12 * s},0"/>`; // 감은 눈(안도)
      let shape;
      if (eyeStyle === 'almond') shape = `<path class="white" d="M${x - 8 * s},${cy + ey} q${8 * s},${-9 * s} ${16 * s},0 q${-8 * s},${7 * s} ${-16 * s},0z"/>`;
      else if (eyeStyle === 'calm') shape = `<path class="white" d="M${x - 8 * s},${cy + ey - 1 * s} q${8 * s},${-6 * s} ${16 * s},0 q${-8 * s},${9 * s} ${-16 * s},0z"/>`;
      else if (eyeStyle === 'big') shape = `<ellipse class="white" cx="${x}" cy="${cy + ey}" rx="${8.5 * s}" ry="${9.5 * s}"/>`;
      else shape = `<ellipse class="white" cx="${x}" cy="${cy + ey}" rx="${7.5 * s}" ry="${8 * s}"/>`;
      const pr = eyeStyle === 'big' ? 4.6 * s : 3.6 * s;
      const droop = (emo === 'sad' && !stable) ? 1.5 * s : 0;
      let g = shape + `<circle cx="${x + px}" cy="${cy + ey + droop}" r="${pr}" fill="${INK}"/><circle cx="${x + px + 1.4 * s}" cy="${cy + ey - 1.8 * s + droop}" r="${1.3 * s}" fill="#fff"/>`;
      if (eyeStyle === 'big') g += `<circle cx="${x + px - 1.2 * s}" cy="${cy + ey + 1.6 * s}" r="${0.8 * s}" fill="#fff"/>`;
      if (lashes) g += `<path class="thin" d="M${x + 7 * s},${cy + ey - 5 * s} l${3 * s},${-2.5 * s} M${x + 8.5 * s},${cy + ey - 2 * s} l${3.5 * s},${-1 * s}"/>`;
      if (bags) g += `<path class="thin" d="M${x - 5 * s},${cy + ey + 10 * s} q${5 * s},${2.5 * s} ${10 * s},0"/>`;
      return g;
    };
    out += eye(cx - ex) + eye(cx + ex);
    // 입
    const my = cy + 14 * s;
    if (emo === 'good') out += `<path class="ink" d="M${cx - 9 * s},${my} q${9 * s},${8 * s} ${18 * s},0"/>`;
    else if (emo === 'bad') out += `<path class="ink" d="M${cx - 8 * s},${my + 4 * s} q${8 * s},${-7 * s} ${16 * s},0"/>`;
    else if (emo === 'worry') out += `<path class="ink" d="M${cx - 8 * s},${my + 2 * s} q${4 * s},${-4 * s} ${8 * s},0 q${4 * s},${4 * s} ${8 * s},0"/><path class="thin" d="M${cx + 26 * s},${cy - 6 * s} q${3 * s},${6 * s} 0,${9 * s} q${-3 * s},${-3 * s} 0,${-9 * s}z" fill="#bfe0f5"/>`;
    else if (emo === 'relief') out += `<path class="ink" d="M${cx - 6 * s},${my + 1 * s} q${6 * s},${5 * s} ${12 * s},0"/><path class="thin" d="M${cx + 24 * s},${my - 2 * s} q${4 * s},${2 * s} ${8 * s},0 M${cx + 26 * s},${my + 3 * s} q${4 * s},${2 * s} ${8 * s},0" opacity=".6"/>`;
    else if (emo === 'sad') out += `<path class="ink" d="M${cx - 5 * s},${my + 3 * s} q${5 * s},${-3 * s} ${10 * s},0"/>`;
    return out;
  }
  const mitt = (x, y, r) => `<circle class="fill" cx="${x}" cy="${y}" r="${r}" fill="#fff"/>`;
  const leg = (x, y, h) => `<path class="ink" d="M${x},${y} v${h}"/><path class="ink" d="M${x - 5},${y + h} h10"/>`;
  const hair = (d) => `<path class="fill" d="${d}" fill="${INK}"/>`;
  const gloss = (shapeAttrs) => `<${shapeAttrs} fill="url(#gf-gloss)" stroke="none"/>`;
  const suitOverlay = (bodyPathD, cx, yb, w) => `<path d="${bodyPathD}" fill="${SUIT}" stroke="none" opacity=".92"/>` + suitCollar(cx, yb, w);
  function suitCollar(cx, yb, w) { // yb = 상복 윗선 y, w = 깃 폭
    return `<path d="M${cx - w / 2},${yb} L${cx},${yb + w * 0.28} L${cx + w / 2},${yb} L${cx + w * 0.3},${yb} L${cx},${yb + w * 0.18} L${cx - w * 0.3},${yb}z" fill="#fff" stroke="${INK}" stroke-width="2" stroke-linejoin="round"/>` +
      `<path d="M${cx},${yb + w * 0.16} l${w * 0.07},${w * 0.1} l${-w * 0.07},${w * 0.34} l${-w * 0.07},${-w * 0.34}z" fill="${SUIT}" stroke="${INK}" stroke-width="1.5"/>`;
  }

  // ---------- 네모가족 ----------
  function squareBody(x, y, w, h, color, r) {
    return `<rect class="fill" x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${color}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#gf-gloss)"/>`;
  }
  function nemoDad({ x, y, w = 120, h = 106, emo = 'good', gaze = 0, glasses = false, suit = false }) {
    const cx = x + w / 2, s = w / 100, color = COLORS.nemoDad;
    let g = `<g class="gf-ch">${groundShadow(cx, y + h + 12, w)}`;
    g += squareBody(x, y, w, h, color, 10);
    if (suit) g += `<rect x="${x + 2}" y="${y + h * 0.66}" width="${w - 4}" height="${h * 0.34 - 2}" rx="8" fill="${SUIT}"/>` + suitCollar(cx, y + h * 0.66, w * 0.5);
    g += `<path class="ink" d="M${cx - 26 * s},${y + 4} q4,-7 8,0 M${cx - 8 * s},${y + 3} q4,-8 8,0 M${cx + 12 * s},${y + 4} q4,-7 8,0"/>`; // 숱 적은 머리
    g += face(cx, y + h * 0.42, s, { emo, gaze, bags: true });
    g += `<path class="ink" d="M${cx - 10 * s},${y + h * 0.42 + 9 * s} q${5 * s},${-5 * s} ${10 * s},0 q${5 * s},${-5 * s} ${10 * s},0" stroke-width="3.5"/>`; // 콧수염
    if (glasses) g += `<circle class="thin" cx="${cx - 15 * s}" cy="${y + h * 0.42 - 4 * s}" r="${11 * s}"/><circle class="thin" cx="${cx + 15 * s}" cy="${y + h * 0.42 - 4 * s}" r="${11 * s}"/><path class="thin" d="M${cx - 4 * s},${y + h * 0.42 - 4 * s} h${8 * s}"/>`;
    g += mitt(x - 6, y + h * 0.62, 9 * s) + mitt(x + w + 6, y + h * 0.62, 9 * s) + leg(cx - 18 * s, y + h, 12) + leg(cx + 18 * s, y + h, 12);
    return g + '</g>';
  }
  function nemoMom({ x, y, w = 96, h = 92, emo = 'good', gaze = 0 }) {
    const cx = x + w / 2, s = w / 100, color = COLORS.nemoMom;
    let g = `<g class="gf-ch">${groundShadow(cx, y + h + 12, w)}`;
    g += squareBody(x, y, w, h, color, 9);
    g += `<circle class="fill" cx="${cx + 26 * s}" cy="${y - 2}" r="${9 * s}" fill="${INK}"/><path class="ink" d="M${cx - 30 * s},${y + 2} q${30 * s},${-10 * s} ${60 * s},0" stroke-width="4"/>`; // 쪽머리
    g += face(cx, y + h * 0.42, s, { emo, gaze, lashes: true });
    for (const [dx, dy] of [[-8, 0.45], [-10, 0.68], [8, 0.45], [10, 0.68]]) g += mitt(dx < 0 ? x + dx : x + w - dx, y + h * dy, 8 * s); // 손이 아주 많음
    g += leg(cx - 15 * s, y + h, 11) + leg(cx + 15 * s, y + h, 11);
    return g + '</g>';
  }
  function nemoKid({ x, y, w = 66, h = 66, color = COLORS.nemoKid1, emo = 'good', tuft = true, gaze = 0 }) {
    const cx = x + w / 2, s = w / 100 * 1.15;
    let g = `<g class="gf-ch">${groundShadow(cx, y + h + 10, w)}`;
    g += squareBody(x, y, w, h, color, 8);
    if (tuft) g += `<path class="ink" d="M${cx - 2},${y} q-2,-12 6,-14 q-6,4 -2,14" stroke-width="2.5"/>`;
    g += face(cx, y + h * 0.5, s * 0.72, { emo, gaze, eyeStyle: 'big' });
    g += mitt(x - 4, y + h * 0.6, 6 * s) + mitt(x + w + 4, y + h * 0.6, 6 * s) + leg(cx - 10, y + h, 8) + leg(cx + 10, y + h, 8);
    return g + '</g>';
  }
  function nemoGrandma({ x, y, w = 84, h = 80, emo = 'good', gaze = 0 }) {
    const cx = x + w / 2, s = w / 100;
    let g = `<g class="gf-ch">${groundShadow(cx, y + h + 10, w)}`;
    g += squareBody(x, y, w, h, COLORS.nemoGrandma, 9);
    g += `<circle class="fill" cx="${cx}" cy="${y - 2}" r="${9 * s}" fill="#d9d2c8"/>`; // 흰 쪽머리
    g += face(cx, y + h * 0.44, s, { emo, gaze, bags: true });
    g += mitt(x - 5, y + h * 0.62, 8 * s) + mitt(x + w + 5, y + h * 0.62, 8 * s) + leg(cx - 14, y + h, 10) + leg(cx + 14, y + h, 10);
    return g + '</g>';
  }

  // ---------- 세모부부 ----------
  function triBody(cx, yTop, size, color, flip) { // 위 꼭짓점(기본) / flip 이면 아래 꼭짓점
    const h = size * 0.9;
    const d = flip ? `M${cx - size / 2},${yTop} L${cx + size / 2},${yTop} L${cx},${yTop + h}z` : `M${cx},${yTop} L${cx + size / 2},${yTop + h} L${cx - size / 2},${yTop + h}z`;
    return `<path class="fill" d="${d}" fill="${color}" stroke-linejoin="round"/><path d="${d}" fill="url(#gf-gloss)"/>`;
  }
  function semo({ x, y, size = 122, emo = 'good', gaze = 0, suit = false, wife = false }) {
    const cx = x + size / 2, s = size / 130, h = size * 0.9, color = wife ? COLORS.semoWife : COLORS.semoHusband;
    let g = `<g class="gf-ch">${groundShadow(cx, y + h + 12, size)}`;
    g += triBody(cx, y, size, color, false);
    if (suit) { const yb = y + h * 0.7; const hw = (size / 2) * (yb - y) / h; g += `<path d="M${cx - hw},${yb} L${cx + hw},${yb} L${cx + size / 2},${y + h} L${cx - size / 2},${y + h}z" fill="${SUIT}" stroke="none" opacity=".92"/>` + suitCollar(cx, yb, size * 0.34); }
    g += `<path class="ink" d="M${cx - 2},${y + 2} q-3,-14 10,-16 q-8,6 -4,16" stroke-width="3"/>`; // 꼭짓점 퀴프
    g += face(cx, y + h * 0.58, s, { emo, gaze, eyeStyle: 'almond', lashes: wife });
    g += mitt(cx - size * 0.36, y + h * 0.78, 8 * s) + mitt(cx + size * 0.36, y + h * 0.78, 8 * s) + leg(cx - 16, y + h, 11) + leg(cx + 16, y + h, 11);
    return g + '</g>';
  }
  const semoHusband = (o) => semo({ ...o, wife: false });
  const semoWife = (o) => semo({ ...o, wife: true });

  // ---------- 동그라미가족 ----------
  function circleBody(cx, cy, r, color) {
    return `<circle class="fill" cx="${cx}" cy="${cy}" r="${r}" fill="${color}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#gf-gloss)"/>`;
  }
  function dong({ cx, cy, r = 48, emo = 'good', gaze = 0, glasses = false, suit = false, who = 'dad' }) {
    const s = r / 55, color = COLORS[{ dad: 'dongDad', mom: 'dongMom', son: 'dongSon', daughter: 'dongDaughter' }[who]];
    let g = `<g class="gf-ch">${groundShadow(cx, cy + r + 6, r * 2)}`;
    g += circleBody(cx, cy, r, color);
    if (suit) { const yb = cy + r * 0.45, hw = Math.sqrt(r * r - (yb - cy) * (yb - cy)); g += `<path d="M${cx - hw},${yb} A${r},${r} 0 0 0 ${cx + hw},${yb}z" fill="${SUIT}" stroke="none" opacity=".92"/>` + suitCollar(cx, yb, r * 0.9); }
    if (who === 'dad') g += `<path class="ink" d="M${cx - r * 0.55},${cy - r * 0.62} q${r * 0.5},${-r * 0.2} ${r * 1.1},${r * 0.05}" stroke-width="3.5"/><path class="thin" d="M${cx - r * 0.15},${cy - r * 0.68} l${r * 0.1},${r * 0.25}"/>`; // 단정한 가르마
    if (who === 'mom') g += `<path class="ink" d="M${cx - r * 0.6},${cy - r * 0.55} q${r * 0.3},${-r * 0.35} ${r * 0.7},${-r * 0.1} q${r * 0.3},${-r * 0.05} ${r * 0.5},${r * 0.2}" stroke-width="3.5"/>`;
    if (who === 'daughter') g += `<path class="ink" d="M${cx - r * 0.5},${cy - r * 0.6} q${r * 0.5},${-r * 0.3} ${r},0" stroke-width="3"/><circle class="fill" cx="${cx + r * 0.55}" cy="${cy - r * 0.55}" r="${r * 0.12}" fill="#e8a5b0"/>`;
    if (who === 'son') g += `<path class="ink" d="M${cx - r * 0.45},${cy - r * 0.6} q${r * 0.45},${-r * 0.25} ${r * 0.9},0" stroke-width="3"/>`;
    g += face(cx, cy + r * 0.05, s, { emo, gaze, eyeStyle: 'calm', stable: true, lashes: who === 'mom' || who === 'daughter' });
    if (glasses) g += `<circle class="thin" cx="${cx - 15 * s}" cy="${cy + r * 0.05 - 4 * s}" r="${11 * s}"/><circle class="thin" cx="${cx + 15 * s}" cy="${cy + r * 0.05 - 4 * s}" r="${11 * s}"/><path class="thin" d="M${cx - 4 * s},${cy + r * 0.05 - 4 * s} h${8 * s}"/>`;
    g += mitt(cx - r * 0.95, cy + r * 0.35, 8 * s) + mitt(cx + r * 0.95, cy + r * 0.35, 8 * s);
    // 살짝 땅에 박힘: 다리 대신 지면선
    g += `<path class="ink" d="M${cx - r * 0.7},${cy + r * 0.98} h${r * 1.4}" opacity=".5"/>`;
    if (who === 'son') g += `<g transform="translate(${cx + r * 0.9},${cy + r * 0.1}) rotate(-35)"><path class="fill" d="M-5,-18 q6,-6 12,0 q4,10 -1,22 q-6,4 -10,0 q-5,-12 -1,-22z" fill="#8a4b2a"/><path class="thin" d="M0,-18 v-16"/></g>`; // 바이올린
    if (who === 'daughter') g += `<g transform="translate(${cx + r * 0.95},${cy + r * 0.05}) rotate(20)"><ellipse class="thin" cx="0" cy="-14" rx="9" ry="12" fill="#fff"/><path class="thin" d="M-6,-14 h12 M0,-24 v20 M-4,-20 v12 M4,-20 v12" opacity=".6"/><path class="ink" d="M0,-2 v14"/></g>`; // 테니스 라켓
    return g + '</g>';
  }
  const dongDad = (o) => dong({ glasses: true, ...o, who: 'dad' });
  const dongMom = (o) => dong({ ...o, who: 'mom' });
  const dongSon = (o) => dong({ r: 34, ...o, who: 'son' });
  const dongDaughter = (o) => dong({ r: 34, ...o, who: 'daughter' });

  // ---------- 가족 초상 / 상태 ----------
  function squareFamilyPortrait(x = 0, y = 0, emo = 'good') { // 7인 직육면체 (약 330×260)
    return `<g transform="translate(${x},${y})">` +
      nemoDad({ x: 0, y: 130, w: 120, h: 106, emo: 'relief' }) +
      nemoMom({ x: 126, y: 144, w: 96, h: 92, emo: 'good' }) +
      nemoGrandma({ x: 228, y: 156, w: 84, h: 80, emo: 'good' }) +
      nemoKid({ x: 0, y: 56, w: 66, h: 66, color: COLORS.nemoKid1, emo: 'good', gaze: 1 }) +
      nemoKid({ x: 90, y: 56, w: 66, h: 66, color: COLORS.nemoKid2, emo: 'bad', gaze: 1 }) +
      nemoKid({ x: 160, y: 56, w: 66, h: 66, color: COLORS.nemoKid3, emo: 'bad', gaze: -1 }) +
      nemoKid({ x: 246, y: 66, w: 56, h: 56, color: COLORS.nemoBaby, emo: 'good', tuft: false }) +
      nemoKid({ x: 70, y: 112, w: 36, h: 36, color: COLORS.nemoBaby, emo: 'good', tuft: false, gaze: -1 }) + // 중앙 틈의 막둥이
      '</g>';
  }
  function triangleWedding(x = 0, y = 0) { // 마주보면 마름모 = 웨딩 (약 300×130)
    const size = 122, h = size * 0.9;
    const wx = size + 4, wcx = wx + size / 2;
    return `<g transform="translate(${x},${y})">` +
      semoHusband({ x: 0, y: 0, size, emo: 'good', gaze: 1 }) +
      `<g class="gf-ch">${groundShadow(wcx, h + 12, size * 0.5)}` + triBody(wcx, 0, size, COLORS.semoWife, true) +
      face(wcx, h * 0.36, size / 130, { emo: 'good', gaze: -1, eyeStyle: 'almond', lashes: true }) +
      mitt(wx + size * 0.1, h * 0.12, 8) + mitt(wx + size * 0.9, h * 0.12, 8) +
      `<circle class="fill" cx="${wx + size * 0.82}" cy="${-2}" r="7" fill="#f4c6d0"/><circle class="fill" cx="${wx + size * 0.9}" cy="${6}" r="5" fill="#fff"/>` + // 머리 꽃
      `<path class="ink" d="M${wcx - 6},${h - 2} l6,10 l6,-10" stroke-width="3"/></g>` + // 발끝
      `<text x="${size + 3}" y="${h + 40}" text-anchor="middle" font-family="Gaegu, sans-serif" font-size="18" fill="${INK}">♥ 마주보면 마름모</text>` +
      '</g>';
  }
  function triangleBattle(x = 0, y = 0) { // 나란히 같은 방향 = 전투 (약 300×130)
    const size = 122, h = size * 0.9;
    return `<g transform="translate(${x},${y})">` +
      semoHusband({ x: 0, y: 0, size, emo: 'bad', gaze: 1 }) +
      `<g transform="translate(${size * 0.88},${h * 0.5}) rotate(-30)"><path class="ink" d="M0,0 v-46 M-6,-46 v-14 M0,-46 v-16 M6,-46 v-14" stroke-width="3"/></g>` + // 포크
      semoWife({ x: size + 16, y: 0, size, emo: 'bad', gaze: -1 }) +
      `<g transform="translate(${size + 16 + size * 0.12},${h * 0.5}) rotate(30)"><path class="fill" d="M0,0 v-50 l6,8 l-6,10z" fill="#ddd" stroke-width="2.5"/><path class="ink" d="M-8,-2 h16"/></g>` + // 칼
      `<text x="${size + 8}" y="${h + 40}" text-anchor="middle" font-family="Gaegu, sans-serif" font-size="18" fill="${INK}">⚔ 나란히 서면 전투</text>` +
      '</g>';
  }
  function circleFamilyPortrait(x = 0, y = 0) { // 균등한 간격, 닿지 않음 (약 360×130)
    return `<g transform="translate(${x},${y})">` +
      dongDad({ cx: 50, cy: 60, r: 48, emo: 'good', gaze: 0 }) + dongMom({ cx: 158, cy: 60, r: 48, emo: 'good', gaze: 1 }) +
      dongSon({ cx: 258, cy: 74, r: 34, emo: 'good' }) + dongDaughter({ cx: 340, cy: 74, r: 34, emo: 'good' }) +
      '</g>';
  }

  // ---------- 소품 · 배경 ----------
  function coffeeCup(x, y, scale = 1, warm = true) {
    const c = warm ? '#e9d3a8' : '#f2f2f2', liquid = warm ? '#b07a3e' : '#3a2a20';
    return `<g class="gf-ch" transform="translate(${x},${y}) scale(${scale})"><path class="fill" d="M0,0 h30 l-4,34 h-22z" fill="${c}"/><ellipse cx="15" cy="0" rx="15" ry="4" fill="${liquid}" stroke="${INK}" stroke-width="2"/><path class="thin" d="M30,8 q12,2 10,12 q-2,8 -12,8"/>` +
      `<path class="thin" d="M8,-8 q3,-6 0,-12 M16,-10 q3,-6 0,-12 M24,-8 q3,-6 0,-12" opacity=".5"/></g>`;
  }
  function windowBg(id, skyTop = '#cfe3f4', skyBot = '#f6e8d0', sill = '#d9c7ad', wall = '#efe6d6', w = 720, h = 420) {
    return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${skyTop}"/><stop offset="1" stop-color="${skyBot}"/></linearGradient></defs>` +
      `<rect x="0" y="0" width="${w}" height="${h}" fill="${wall}"/><rect x="${w * 0.12}" y="${h * 0.08}" width="${w * 0.76}" height="${h * 0.62}" fill="url(#${id})" stroke="${INK}" stroke-width="4"/>` +
      `<path d="M${w * 0.5},${h * 0.08} v${h * 0.62} M${w * 0.12},${h * 0.39} h${w * 0.76}" stroke="${INK}" stroke-width="3" opacity=".7"/>` +
      `<rect x="${w * 0.1}" y="${h * 0.7}" width="${w * 0.8}" height="${h * 0.05}" fill="${sill}" stroke="${INK}" stroke-width="3"/>`;
  }
  function speech(x, y, w, text, opt = {}) { // 말풍선. text 는 배열(줄) 가능
    const lines = Array.isArray(text) ? text : [text]; const lh = opt.size || 22; const h = lines.length * lh + 22; const tail = opt.tail || 'left';
    const tx = tail === 'left' ? x + 24 : x + w - 24;
    return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="#fff" stroke="${INK}" stroke-width="2.5"/><path d="M${tx - 8},${y + h - 1} l8,14 l8,-14z" fill="#fff" stroke="${INK}" stroke-width="2.5" stroke-linejoin="round"/><rect x="${tx - 7}" y="${y + h - 3}" width="14" height="5" fill="#fff"/>` +
      lines.map((t, i) => `<text x="${x + 16}" y="${y + 18 + lh * (i + 0.7)}" font-family="Gaegu, 'Gowun Dodum', sans-serif" font-size="${lh - 2}" fill="${INK}">${t}</text>`).join('') + '</g>';
  }
  function narration(x, y, w, text, opt = {}) {
    const lines = Array.isArray(text) ? text : [text]; const lh = opt.size || 20; const h = lines.length * lh + 20;
    return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${PAPER}" stroke="${INK}" stroke-width="1.5" opacity=".95"/>` +
      lines.map((t, i) => `<text x="${x + w / 2}" y="${y + 14 + lh * (i + 0.75)}" text-anchor="middle" font-family="'Nanum Myeongjo', serif" font-size="${lh - 3}" fill="${INK}">${t}</text>`).join('') + '</g>';
  }

  const GF = { INK, PAPER, SUIT, COLORS, EMOS, ROUGH_DEFS, CHAR_STYLE, face, nemoDad, nemoMom, nemoKid, nemoGrandma, semoHusband, semoWife, dongDad, dongMom, dongSon, dongDaughter,
    squareFamilyPortrait, triangleWedding, triangleBattle, circleFamilyPortrait, coffeeCup, windowBg, speech, narration, suitCollar, shade };
  root.GF = GF; Object.assign(root, GF);
})(typeof window !== 'undefined' ? window : globalThis);
