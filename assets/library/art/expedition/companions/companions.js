/* ⑪ 기하학 원정대 — 동료 43종 코드 그림 키트 ExpCompanions (gf-asset, 2026-10-22)
   사양: notes/art_spec_exp_companions.md — 종마다 「고유 외곽 도형 + 외곽을 바꾸는 부속 1 + 핵심 특징 1 + 표정 + 소품 1」.
   규격: viewBox 0 0 100 106(ExpArt.creature 와 같음) · 외곽선 #6b5443 · 플랫 단색 · 발끝 y≈100 · 동료 몸은 □△○ 정형을 쓰지 않는다(D46-1).
   사용: ExpCompanions.has(id) · ExpCompanions.svg(id[, {size}]) → SVG 문자열.  정본 가족 그림(assets/ PNG)과 무관. */
(function (root) {
  'use strict';
  const OL = '#6b5443', INKE = '#3b2c26', W = 3.4;
  const sv = (inner, size) => `<svg viewBox="0 0 100 106" class="ea-cr" ${size ? `width="${size}" height="${size * 1.06}"` : ''} xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
  const S = (d, f, w) => `<path d="${d}" fill="${f}" stroke="${OL}" stroke-width="${w || W}" stroke-linejoin="round" stroke-linecap="round"/>`;
  const L = (d, c, w) => `<path d="${d}" fill="none" stroke="${c || OL}" stroke-width="${w || W}" stroke-linejoin="round" stroke-linecap="round"/>`;
  const Ci = (x, y, r, f, w) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}" stroke="${OL}" stroke-width="${w == null ? W : w}"/>`;
  const El = (x, y, rx, ry, f, rot, w) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${f}" stroke="${OL}" stroke-width="${w == null ? W : w}"${rot ? ` transform="rotate(${rot} ${x} ${y})"` : ''}/>`;
  const dot = (x, y, r, f, o) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"${o ? ` opacity="${o}"` : ''}/>`;
  // ── 얼굴(가족 문법: 흰자 + 동공 + 하이라이트 2, 볼터치) — 동료 눈은 가족보다 작게 ──
  function eye(x, y, r, t, look) {
    const lx = (look || 0) * r * 0.35;
    if (t === 'shut') return L(`M${x - r} ${y + 1} q${r} -${r * 1.1} ${r * 2} 0`, INKE, 2.6);           // 웃는 눈(∩)
    if (t === 'sleep') return L(`M${x - r} ${y - 1} q${r} ${r * 1.0} ${r * 2} 0`, INKE, 2.6);           // 지그시 감은 눈(∪)
    if (t === 'slit') return `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.42}" fill="#fff" stroke="${OL}" stroke-width="2"/><ellipse cx="${x + lx}" cy="${y}" rx="${r * 0.55}" ry="${r * 0.34}" fill="${INKE}"/>`;
    let s = `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.12}" fill="#fff" stroke="${OL}" stroke-width="2"/>` +
      `<ellipse cx="${x + lx}" cy="${y + r * 0.12}" rx="${r * 0.62}" ry="${r * 0.72}" fill="${INKE}"/>` +
      dot(x + lx - r * 0.24, y - r * 0.2, r * 0.24, '#fff') + dot(x + lx + r * 0.2, y + r * 0.32, r * 0.11, '#fff');
    if (t === 'half') s += `<path d="M${x - r - 1} ${y - r * 0.1} q${r + 1} -${r * 1.5} ${2 * r + 2} 0 v-${r * 1.2} h-${2 * r + 2}z" fill="var(--lid,#fff0)"/>` + L(`M${x - r - 1} ${y - r * 0.1} q${r + 1} -${r * 0.5} ${2 * r + 2} 0`, INKE, 2.4);
    if (t === 'wide') s = `<circle cx="${x}" cy="${y}" r="${r * 1.15}" fill="#fff" stroke="${OL}" stroke-width="2"/>` + dot(x + lx, y + 0.5, r * 0.42, INKE) + dot(x + lx - r * 0.12, y - r * 0.12, r * 0.13, '#fff');
    return s;
  }
  const eyes = (cx, y, gap, r, t, look) => eye(cx - gap, y, r, t, look) + eye(cx + gap, y, r, t, look);
  const wink = (cx, y, gap, r) => eye(cx - gap, y, r, 'open') + eye(cx + gap, y, r, 'shut');
  function brows(cx, y, gap, t, w) {
    w = w || 7;
    if (t === 'worry') return L(`M${cx - gap - w / 2} ${y - 2} l${w} 3M${cx + gap + w / 2} ${y - 2} l-${w} 3`, INKE, 2.6);
    if (t === 'cross') return L(`M${cx - gap - w / 2} ${y + 2} l${w} -3M${cx + gap + w / 2} ${y + 2} l-${w} -3`, INKE, 2.8);
    if (t === 'one') return L(`M${cx - gap - w / 2} ${y} l${w} 0M${cx + gap - w / 2} ${y - 1} q${w / 2} -5 ${w} -1`, INKE, 2.6);
    return L(`M${cx - gap - w / 2} ${y} q${w / 2} -3 ${w} 0M${cx + gap - w / 2} ${y} q${w / 2} -3 ${w} 0`, INKE, 2.4);
  }
  function mouth(x, y, t, w) {
    w = w || 7;
    if (t === 'open') return `<path d="M${x - w} ${y} q${w} ${w * 1.3} ${w * 2} 0z" fill="#8a3a3a" stroke="${INKE}" stroke-width="2.4" stroke-linejoin="round"/>`;
    if (t === 'grin') return `<path d="M${x - w} ${y - 1} q${w} ${w * 0.9} ${w * 2} 0z" fill="#fff" stroke="${INKE}" stroke-width="2.4" stroke-linejoin="round"/>`;
    if (t === 'o') return `<ellipse cx="${x}" cy="${y + 2}" rx="${w * 0.5}" ry="${w * 0.62}" fill="#8a3a3a" stroke="${INKE}" stroke-width="2.4"/>`;
    if (t === 'flat') return L(`M${x - w * 0.7} ${y + 1} h${w * 1.4}`, INKE, 2.6);
    if (t === 'sad') return L(`M${x - w * 0.7} ${y + 3} q${w * 0.7} -4 ${w * 1.4} 0`, INKE, 2.6);
    if (t === 'smug') return L(`M${x - w * 0.8} ${y + 1} q${w} ${w * 0.5} ${w * 1.6} -2`, INKE, 2.6);
    if (t === 'fang') return L(`M${x - w} ${y} q${w} ${w * 0.9} ${w * 2} 0`, INKE, 2.6) + `<path d="M${x + w * 0.3} ${y + w * 0.38} l2 5 2 -5" fill="#fff" stroke="${INKE}" stroke-width="1.8"/>`;
    if (t === 'stitch') return L(`M${x - w} ${y} q${w} ${w * 0.7} ${w * 2} 0`, INKE, 2.4) + L(`M${x - w * 0.6} ${y - 1}v4M${x} ${y + 1}v4M${x + w * 0.6} ${y - 1}v4`, INKE, 1.8);
    return L(`M${x - w} ${y} q${w} ${w * 0.9} ${w * 2} 0`, INKE, 2.6);           // smile
  }
  const cheeks = (cx, y, gap, r) => `<ellipse cx="${cx - gap}" cy="${y}" rx="${r || 4.6}" ry="${(r || 4.6) * 0.66}" fill="#FF8FA8" opacity=".55"/><ellipse cx="${cx + gap}" cy="${y}" rx="${r || 4.6}" ry="${(r || 4.6) * 0.66}" fill="#FF8FA8" opacity=".55"/>`;
  const feet = (x1, x2, c, y) => El(x1, y || 99, 7.5, 4, c || '#8a6a55', 0, 2.8) + El(x2, y || 99, 7.5, 4, c || '#8a6a55', 0, 2.8);
  const sparkle = (x, y, r, c) => `<path d="M${x} ${y - r}l${r * .3} ${r * .7} ${r * .7} ${r * .3}-${r * .7} ${r * .3}-${r * .3} ${r * .7}-${r * .3}-${r * .7}-${r * .7}-${r * .3} ${r * .7}-${r * .3}z" fill="${c || '#FFE27A'}" stroke="${OL}" stroke-width="1.8"/>`;
  const note = (x, y) => `<g transform="translate(${x} ${y})">${El(0, 0, 4, 3, INKE, -20, 0)}<path d="M3.4 -1 v-11 l6 2" fill="none" stroke="${INKE}" stroke-width="2"/></g>`;

  // ── 종별 그림 ──────────────────────────────────────────────
  const K = {
    // 새 6 — 가로 부메랑 / 세로 마름모 / 쐐기 / 공 / 사다리꼴 / 키 큰 S
    u_swallow: () => { const c = '#3E5A9A';
      return S('M4 34 Q26 44 42 54 L42 66 Q22 64 4 34Z', c) + S('M96 34 Q74 44 58 54 L58 66 Q78 64 96 34Z', c) +
        S('M42 76 L30 100 L50 84 L70 100 L58 76Z', c) + El(50, 62, 17, 19, c) + `<path d="M36 68 q14 16 28 0 q-2 12 -14 13 q-12 -1 -14 -13z" fill="#F4F8FF"/>` +
        dot(50, 70, 4, '#F2994A') + eyes(50, 56, 7, 3.6, 'open') + S('M47 63 L53 63 L50 68Z', '#F2A33A', 2) + El(54, 66, 3, 2, '#C9A06A', 20, 1.6); },
    u_magpie: () => S('M62 30 L86 2 L92 8 L68 36Z', '#2E3140') + S('M50 12 L76 52 L50 90 L24 52Z', '#2E3140') + `<path d="M28 58 L72 58 L50 88Z" fill="#EDEFF5"/>` +
      L('M30 54 L44 40', '#4FB3B0', 3.6) + eyes(50, 40, 8, 3.8, 'open') + S('M50 47 L62 50 L50 53Z', '#555', 2) + `<path d="M50 53 L60 55 L50 57Z" fill="#8a3a3a" stroke="${OL}" stroke-width="1.6"/>` +
      feet(42, 58, '#555') + `<g transform="translate(78 78) rotate(10)">${S('M-11 -7 h22 v14 h-22z', '#fff', 2.4)}${L('M-11 -7 l11 8 l11 -8', OL, 2)}</g>`,
    u_snowcrow: () => S('M20 30 L70 22 L80 90 L30 94Z', '#6A7290') + `<g fill="#fff" stroke="${OL}" stroke-width="2.6">${[22, 33, 44, 55, 66, 76].map((x, i) => `<circle cx="${x}" cy="${62 - i * 1.4}" r="7.5"/>`).join('')}</g>` +
      eyes(46, 40, 9, 4.6, 'half') + S('M56 44 L80 49 L56 54Z', '#2E3140', 2.4) + feet(40, 66, '#555') +
      `<g transform="translate(14 82)">${L('M0 -14 v-6', OL, 2.4)}${S('M-7 -14 h14 v14 h-14z', '#FFD36B', 2.4)}${L('M-7 -7 h14', OL, 1.6)}</g>`,
    u_sparrow: () => S('M80 58 L98 40 L92 64Z', '#8A6A44') + El(48, 68, 36, 26, '#C9A070') + `<path d="M24 76 q24 18 48 0 q-6 12 -24 12 q-18 0 -24 -12z" fill="#F4E6C8"/>` +
      dot(28, 66, 4.4, '#3b2c26') + dot(68, 66, 4.4, '#3b2c26') + eyes(48, 58, 9, 3.8, 'wide') + S('M45 64 L51 64 L48 69Z', '#F2A33A', 2) + feet(36, 60, '#C98F5A', 98) +
      `<g transform="translate(14 90)">${S('M-7 -6 q7 -6 14 0 l2 10 h-18z', '#F4EFE4', 2.2)}</g>`,
    u_owl: () => S('M30 22 L24 2 L42 20Z', '#8A5A3B') + S('M70 22 L76 2 L58 20Z', '#8A5A3B') + S('M30 18 L70 18 L86 94 L14 94Z', '#B98A5A') +
      Ci(38, 44, 14, '#EAD7B8', 2.6) + Ci(62, 44, 14, '#EAD7B8', 2.6) + eyes(50, 44, 12, 4.6, 'sleep') + S('M46 54 L54 54 L50 62Z', '#E5A93A', 2) +
      L('M36 72 l5 4 l5 -4M54 72 l5 4 l5 -4M45 82 l5 4 l5 -4', '#8A5A3B', 2.4) + `<g transform="translate(82 84) rotate(-20)">${S('M-10 -5 h20 v10 h-20z', '#F4EFE4', 2.2)}${Ci(-10, 0, 5, '#E8D8B8', 2)}${Ci(10, 0, 5, '#E8D8B8', 2)}</g>`,
    u_crane: () => S('M66 66 L92 58 L84 74Z', '#2E3140') + El(58, 70, 22, 13, '#F4F4F8') + L('M56 82 L54 100', OL, 3.2) + L('M54 100 l-6 0', OL, 3) +
      `<path d="M44 66 C30 56 54 40 40 22" fill="none" stroke="${OL}" stroke-width="12" stroke-linecap="round"/><path d="M44 66 C30 56 54 40 40 22" fill="none" stroke="#F4F4F8" stroke-width="6.4" stroke-linecap="round"/>` +
      `<path d="M41 38 C44 32 46 28 40 22" fill="none" stroke="#2E3140" stroke-width="6.4" stroke-linecap="round"/>` +
      Ci(38, 16, 10, '#F4F4F8') + dot(38, 8, 4.4, '#E5334A') + eye(41, 15, 3.2, 'open') + S('M29 14 L10 18 L29 20Z', '#E0B060', 2) +
      `<g transform="translate(78 92)">${L('M0 0 v-22', OL, 2.4)}${S('M0 -22 h14 v10 h-14z', '#fff', 2)}${`<path d="M0 -22h7v5H0zM7 -17h7v5H7z" fill="#3b2c26"/>`}</g>`,
    // 곤충·물가 4
    u_cicada: () => S('M48 34 L4 54 L18 84 L46 62Z', '#E3F4DF') + S('M52 34 L96 54 L82 84 L54 62Z', '#E3F4DF') + L('M44 44 L14 60M44 52 L20 74M56 44 L86 60M56 52 L80 74', '#9FC79A', 2.2) +
      El(50, 64, 12, 28, '#9FD39A') + L('M40 66 h20M40 74 h20M41 82 h18', '#4E7A4A', 2.4) + El(50, 36, 16, 12, '#9FD39A') +
      eyes(50, 34, 10, 4, 'open') + mouth(50, 42, 'open', 4) + note(80, 22) + note(18, 26),
    u_toad: () => S('M6 98 Q6 46 50 42 Q94 46 94 98Z', '#A89A62') + [[22, 54], [36, 46], [64, 46], [78, 54], [50, 44]].map(([x, y]) => Ci(x, y, 4.6, '#BFB27A', 2.4)).join('') +
      [[30, 70], [70, 72], [52, 86], [22, 86], [80, 88]].map(([x, y]) => dot(x, y, 3, '#7A6C3E')).join('') + eyes(50, 60, 16, 5, 'half') + mouth(50, 74, 'smile', 16) +
      cheeks(50, 72, 24, 5) + `<g transform="translate(90 30)">${S('M-9 -6 q9 -6 18 0 q4 10 -9 12 q-13 -2 -9 -12z', '#E5334A', 2.2)}${L('M-5 -6 l5 -4 l5 4', '#F2C14E', 2.2)}</g>`,
    u_frog: () => S('M16 96 Q18 52 30 50 L70 50 Q82 52 84 96Z', '#8FD07A') + Ci(32, 44, 12, '#8FD07A') + Ci(68, 44, 12, '#8FD07A') +
      `<path d="M30 80 q20 14 40 0 q-4 14 -20 14 q-16 0 -20 -14z" fill="#D8F0C8"/>` + eye(32, 43, 5.4, 'open', .4) + eye(68, 43, 5.4, 'open', -.4) + mouth(50, 64, 'open', 16) + cheeks(50, 62, 26, 5) + feet(28, 72, '#6BB45A') +
      `<g transform="translate(88 70) rotate(18)">${L('M0 0 v26', '#8a4b2a', 3.6)}${S('M0 0 q12 -2 12 8 q-6 4 -12 2z', '#F2C14E', 2.2)}</g>`,
    u_tadpole: () => S('M60 70 Q92 74 92 44 Q90 22 72 24 Q86 32 80 48 Q74 60 60 58Z', '#5A6A8F') + Ci(42, 62, 28, '#5A6A8F') +
      eye(32, 58, 5.4, 'open', .6) + eye(52, 58, 5.4, 'open', .6) + mouth(44, 72, 'smug', 6) + cheeks(42, 69, 15, 4) +
      `<path d="M18 22 q6 -10 6 -14 q0 4 6 14 a6 6 0 1 1 -12 0z" fill="#9FD3F4" stroke="${OL}" stroke-width="2.4"/>`,
    // 네발짐승 11
    u_tiger: () => { const c = '#E9F2FA', s = '#6E8FC0';
      return S('M16 92 Q12 60 22 40 Q30 26 50 24 Q72 22 80 34 L96 30 L86 44 L98 50 L84 56 L94 66 L80 70 Q82 86 76 92Z', c) +
        Ci(28, 28, 8, c) + Ci(66, 26, 8, c) + dot(28, 28, 3.6, '#FFC4D2') + dot(66, 26, 3.6, '#FFC4D2') +
        L('M30 44 l6 6M48 34 v8M62 40 l-5 6M20 66 l10 2M76 64 l-10 2', s, 3.4) +
        L('M2 88 Q30 78 58 90 T100 84', '#9FC6E8', 5) + eyes(46, 54, 10, 4, 'open', -.2) + brows(46, 46, 10, 'worry') +
        El(46, 66, 9, 6, '#fff', 0, 2.4) + dot(46, 63, 2.6, INKE) + mouth(46, 69, 'sad', 4) + feet(30, 64, '#A8BEDA'); },
    u_persimmon_tiger: () => S('M30 64 h40 q6 0 6 6 v20 q0 6 -6 6 h-40 q-6 0 -6 -6 v-20 q0 -6 6 -6z', '#F2994A') +
      Ci(22, 20, 9, '#F2994A') + Ci(78, 20, 9, '#F2994A') + dot(22, 20, 4, '#FFC4A0') + dot(78, 20, 4, '#FFC4A0') +
      S('M10 34 L50 14 L90 34 L82 68 L18 68Z', '#F2994A') + L('M42 22 v8M50 20 v10M58 22 v8M14 46 h12M14 54 h10M86 46 h-12M86 54 h-10', '#3b2c26', 3.4) +
      eyes(50, 44, 13, 4.4, 'wide') + El(50, 58, 10, 7, '#FFE6C8', 0, 2.4) + dot(50, 55, 2.8, INKE) + mouth(50, 61, 'o', 5) + feet(36, 64, '#C9792E') +
      `<g transform="translate(88 74)">${L('M0 -18 v28', '#8a4b2a', 2.6)}${[-12, -4, 4].map((y) => El(0, y, 5, 3.6, '#E8823A', 0, 2)).join('')}</g>`,
    u_lion: () => { const pts = []; for (let i = 0; i < 28; i++) { const a = i / 28 * Math.PI * 2, r = i % 2 ? 34 : 45; pts.push(`${(50 + Math.cos(a) * r).toFixed(1)} ${(50 + Math.sin(a) * r).toFixed(1)}`); }
      return S('M' + pts.join(' L') + 'Z', '#D98A3A') + Ci(50, 52, 27, '#F2C25C') + eyes(50, 48, 10, 4, 'open') + brows(50, 40, 10, 'worry') +
        El(50, 60, 9, 6, '#FFF0C8', 0, 2.2) + dot(50, 57, 2.6, INKE) + mouth(50, 63, 'smile', 4) + cheeks(50, 58, 17, 4) +
        `<g transform="translate(50 92)">${L('M-6 -12 l6 6 l6 -6', '#E5334A', 3)}${Ci(0, 0, 7, '#F2C14E', 2.4)}${sparkle(0, 0, 4, '#fff')}</g>`; },
    u_cheshire: () => S('M84 70 Q100 52 92 30 Q88 18 80 24 Q88 34 84 50 Q80 62 74 66Z', '#E8A8D0') +
      S('M12 14 L30 34 Q36 52 50 54 Q64 52 70 34 L88 14 Q98 60 80 84 Q64 99 50 99 Q36 99 20 84 Q2 60 12 14Z', '#E8A8D0') +
      L('M20 50 l10 2M22 62 l9 -1M80 50 l-10 2M78 62 l-9 -1M44 88 l2 -6M56 88 l-2 -6', '#9A6FB8', 3.2) +
      eyes(50, 70, 13, 4.6, 'slit', .4) + `<path d="M24 84 Q50 104 76 84 Q50 94 24 84Z" fill="#fff" stroke="${INKE}" stroke-width="2.4"/>` +
      L('M32 87 l2 4M42 90 l1 4M58 90 l-1 4M68 87 l-2 4', INKE, 1.6) +
      `<g transform="translate(12 92) rotate(-14)">${S('M-6 -9 h12 v18 h-12z', '#fff', 2)}<path d="M0 -4 l3 4 -3 4 -3 -4z" fill="#E5334A"/></g>`,
    u_wolf: () => S('M22 30 L14 2 L38 24Z', '#7B8499') + S('M78 30 L86 2 L62 24Z', '#7B8499') + S('M18 26 Q50 16 82 26 Q80 56 58 84 Q50 94 42 84 Q20 56 18 26Z', '#9AA3B8') +
      `<path d="M34 54 Q50 50 66 54 Q60 76 50 88 Q40 76 34 54Z" fill="#E4E8F0"/>` + eyes(50, 42, 12, 3.8, 'half') + brows(50, 34, 12, 'worry') +
      El(50, 80, 5, 3.6, INKE, 0, 0) + mouth(50, 84, 'sad', 4) + feet(36, 64, '#7B8499') +
      `<g transform="translate(12 88)">${L('M-6 -8 q6 -10 12 0', OL, 2.4)}${S('M-8 -8 h16 l-3 12 h-10z', '#C98F5A', 2.2)}</g>`,
    u_fox: () => S('M50 92 Q90 100 94 64 Q98 30 74 14 Q84 38 72 54 Q62 66 50 70Z', '#F0A060') + `<path d="M74 14 Q84 38 78 46 Q92 30 86 20Z" fill="#FFF4E6" stroke="${OL}" stroke-width="2.6"/>` +
      S('M18 34 L16 12 L32 28Z', '#E8803A') + S('M54 34 L56 12 L40 28Z', '#E8803A') + S('M36 30 Q60 32 58 66 Q54 92 36 94 Q18 92 14 66 Q12 32 36 30Z', '#F0A060') +
      `<path d="M22 60 Q36 72 50 60 Q46 82 36 86 Q26 82 22 60Z" fill="#FFF4E6"/>` + eyes(36, 52, 9, 3.4, 'slit', .7) + dot(36, 64, 2.6, INKE) + mouth(36, 68, 'smug', 4) +
      `<g transform="translate(14 18)">${L('M-6 0 h12M0 -6 v12', '#8a4b2a', 2.6)}${L('M-6 0 v10M6 0 v12', '#bbb', 1.4)}</g>` + feet(28, 46, '#C9792E'),
    u_mouse: () => L('M70 86 Q92 88 90 70 Q88 58 96 54', '#E8B8B8', 3.2) + Ci(28, 34, 19, '#C9C4D8') + Ci(70, 34, 19, '#C9C4D8') + Ci(28, 34, 11, '#F2C8D2', 0) + Ci(70, 34, 11, '#F2C8D2', 0) +
      S('M24 70 Q24 46 50 46 Q72 46 78 70 Q86 86 70 94 Q50 100 30 92 Q22 84 24 70Z', '#C9C4D8') + eyes(50, 64, 9, 3.6, 'open') + brows(50, 56, 9, 'worry', 5) +
      dot(50, 74, 3, '#E8909A') + mouth(50, 77, 'smile', 3) + cheeks(50, 74, 15, 3.6) +
      `<g transform="translate(14 92)">${S('M-8 0 q0 -8 6 -8 h4 q2 4 8 4 q4 0 4 4z', '#8a4b2a', 2.2)}</g>`,
    u_squirrel: () => S('M60 92 Q96 94 96 60 Q96 26 74 10 Q60 6 58 20 Q72 22 76 40 Q80 60 60 70Z', '#B9794A') + L('M70 24 Q84 40 80 62', '#8A5A32', 2.4) +
      S('M26 40 L24 26 L36 36Z', '#B9794A') + S('M52 40 L54 26 L42 36Z', '#B9794A') + S('M38 36 Q62 38 60 70 Q58 96 38 96 Q18 96 16 70 Q14 38 38 36Z', '#C98F5A') +
      Ci(25, 66, 8, '#E0B080', 2.4) + Ci(51, 66, 8, '#E0B080', 2.4) + `<path d="M28 76 Q38 88 48 76 Q46 92 38 92 Q30 92 28 76Z" fill="#F6E3C2"/>` +
      eyes(38, 56, 8, 3.4, 'shut') + mouth(38, 70, 'smile', 3.4) + `<g transform="translate(38 82)">${El(0, 2, 6, 7, '#B07A4A', 0, 2.2)}${S('M-7 -2 q7 -7 14 0z', '#8A5A3B', 2)}</g>` + feet(28, 48, '#8A5A3B'),
    u_deer: () => L('M38 30 L30 8 M33 18 L20 12 M30 8 L34 0 M62 30 L70 8 M67 18 L80 12 M70 8 L66 0', '#8A5A3B', 5) +
      S('M28 36 L18 28 L32 32Z', '#D7A877') + S('M72 36 L82 28 L68 32Z', '#D7A877') + Ci(50, 42, 17, '#D9B27C') +
      S('M36 58 Q50 54 64 58 L66 92 Q50 98 34 92Z', '#D9B27C') + [[42, 70], [58, 74], [48, 84], [60, 88]].map(([x, y]) => dot(x, y, 2.6, '#fff')).join('') +
      eyes(50, 40, 8, 3.6, 'open', -.3) + El(50, 51, 7, 5, '#EFD4A8', 0, 2) + dot(50, 49, 2.2, INKE) + cheeks(50, 47, 13, 3.6) + feet(40, 60, '#8A5A3B') +
      `<g transform="translate(80 82)">${L('M0 10 v-16', '#4C9A4A', 2.4)}${[0, 72, 144, 216, 288].map((a) => Ci(Math.cos(a * Math.PI / 180) * 5, -8 + Math.sin(a * Math.PI / 180) * 5, 3.4, '#FFD1E0', 1.6)).join('')}${dot(0, -8, 2.4, '#F2C14E')}</g>`,
    u_snake: () => `<path d="M50 74 m-26 0 a26 22 0 1 0 52 0 a26 22 0 1 0 -52 0" fill="#7FD08A" stroke="${OL}" stroke-width="${W}"/>` + L('M50 74 m-16 0 a16 13 0 1 0 32 0 a12 10 0 1 0 -22 0', '#3E8E4A', 3.2) +
      `<path d="M66 66 C80 50 50 44 58 24" fill="none" stroke="${OL}" stroke-width="16" stroke-linecap="round"/><path d="M66 66 C80 50 50 44 58 24" fill="none" stroke="#7FD08A" stroke-width="9.6" stroke-linecap="round"/>` +
      L('M70 56 l-8 2M60 42 l8 -3', '#E8D45C', 3) + El(60, 22, 16, 12, '#7FD08A') + eyes(60, 20, 7, 3.4, 'half') + mouth(60, 28, 'sad', 3) +
      `<path d="M60 33 v6 l-3 3M60 39 l3 3" fill="none" stroke="#E5334A" stroke-width="2.4" stroke-linecap="round"/>` +
      `<path d="M48 34 q12 8 24 0 l2 6 q-14 8 -28 0z" fill="#E5334A" stroke="${OL}" stroke-width="2.4"/>`,
    u_gatekeeper: () => S('M18 58 Q8 30 18 10 Q26 16 24 26 Q34 20 34 32 Q30 44 26 58Z', '#E5546F') + S('M82 58 Q92 30 82 10 Q74 16 76 26 Q66 20 66 32 Q70 44 74 58Z', '#E5546F') +
      S('M8 86 Q8 54 50 52 Q92 54 92 86 Q70 96 50 96 Q30 96 8 86Z', '#F28B7A') + L('M14 94 l-6 6M24 96 l-4 7M76 96 l4 7M86 94 l6 6', OL, 3) +
      eyes(50, 66, 12, 4, 'open') + brows(50, 58, 12, 'cross') + mouth(50, 80, 'open', 8) +
      `<g transform="translate(50 46)">${S('M-10 4 q10 -14 20 0z', '#F6E0D0', 2.2)}${L('M-5 4 l2 -7M0 4 v-8M5 4 l-2 -7', OL, 1.4)}</g>`,
    // 옛이야기 인물·요괴 12
    u_dokkaebi: () => S('M44 20 L50 2 L56 20Z', '#F2E36B') + S('M18 94 L18 42 L50 16 L82 42 L82 94Z', '#6C7BD8') +
      `<rect x="18" y="72" width="64" height="12" fill="#F2A33A" stroke="${OL}" stroke-width="2.6"/>` + L('M28 72 l4 12M42 72 l4 12M56 72 l4 12M70 72 l4 12', '#3b2c26', 3) +
      eyes(50, 48, 11, 4.2, 'open', .2) + brows(50, 40, 11, 'one') + mouth(50, 60, 'fang', 7) + cheeks(50, 58, 18, 4) + feet(34, 66, '#4A55A8') +
      `<g transform="translate(90 70) rotate(18)">${S('M-5 18 L-3 -14 Q0 -22 3 -14 L5 18Z', '#B07A4A', 2.4)}${[-10, -2, 6].map((y) => dot(0, y, 2, '#F2E36B')).join('')}</g>`,
    u_phantom: () => S('M22 44 Q22 10 50 10 Q78 10 78 44 L82 94 Q76 86 70 94 Q64 86 58 94 Q52 86 46 94 Q40 86 34 94 Q28 86 22 94 L18 94Z', '#F4F4FF') +
      `<rect x="22" y="36" width="56" height="18" rx="9" fill="#2E3140"/>` + eyes(50, 45, 11, 4, 'open') + brows(50, 33, 11, 'worry') + mouth(50, 64, 'sad', 5) +
      `<g transform="translate(86 60)">${S('M-10 0 q10 -16 20 0 q2 14 -10 16 q-12 -2 -10 -16z', '#4F7FD6', 2.4)}${L('M-4 -8 l4 -6 l4 6', OL, 2)}</g>`,
    u_wind: () => S('M10 62 Q8 34 38 30 Q52 12 72 24 Q94 26 92 50 Q96 72 72 78 Q50 90 30 80 Q8 80 10 62Z', '#DFF4FF') +
      L('M50 54 m-14 0 a14 12 0 1 0 28 0 a9 8 0 1 0 -18 0', '#8FC6E8', 3) + L('M2 40 q-4 -6 4 -8M0 56 h-6M2 70 q-4 6 4 8', '#8FC6E8', 3.2) +
      wink(52, 46, 12, 4) + mouth(52, 58, 'grin', 6) + cheeks(52, 56, 19, 4) +
      `<g transform="translate(88 82)">${L('M0 0 v18', '#8a4b2a', 2.4)}${[0, 90, 180, 270].map((a) => `<path d="M0 0 l${Math.cos(a * Math.PI / 180) * 10} ${Math.sin(a * Math.PI / 180) * 10} l${Math.cos((a + 90) * Math.PI / 180) * 6} ${Math.sin((a + 90) * Math.PI / 180) * 6}z" fill="${['#FF8FA8', '#FFE27A', '#8FD3F4', '#9FD39A'][a / 90]}" stroke="${OL}" stroke-width="1.6"/>`).join('')}</g>`,
    u_giant: () => `<g fill="#9AA6C8" stroke="${OL}" stroke-width="${W}">${[[22, 50, 18], [36, 30, 20], [58, 24, 22], [78, 40, 18], [84, 62, 14], [16, 70, 14], [50, 60, 34]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>` +
      Ci(50, 60, 33, '#9AA6C8', 0) + eyes(50, 52, 13, 4, 'sleep') + `<path d="M50 66 q-10 -8 -22 -2 q8 9 22 2 q14 7 22 -2 q-12 -6 -22 2z" fill="#5A6488"/>` + mouth(50, 74, 'o', 7) + feet(40, 60, '#6E7898') +
      `<g transform="translate(88 84) rotate(-20)">${S('M0 10 Q-10 -4 0 -14 Q10 -4 0 10Z', '#6FC05A', 2.2)}${L('M0 10 v-22', '#3E8E4A', 1.6)}</g>`,
    u_wonnim: () => S('M30 32 L70 32 L88 96 L12 96Z', '#2F7C7A') + `<path d="M50 34 L38 96M50 34 L62 96" stroke="#235E5C" stroke-width="2.6"/>` +
      S('M34 20 Q50 6 66 20 L66 30 L34 30Z', '#2E3140') + El(18, 22, 14, 4.6, '#2E3140', -8) + El(82, 22, 14, 4.6, '#2E3140', 8) +
      El(50, 44, 18, 14, '#F7DCC8') + eyes(50, 42, 8, 3.2, 'half') + `<path d="M50 50 q-6 -5 -13 -1 q4 6 13 1 q9 5 13 -1 q-7 -4 -13 1z" fill="#3b2c26"/>` + mouth(50, 53, 'smug', 3) +
      `<g transform="translate(86 66) rotate(20)">${S('M0 0 L-12 -18 Q0 -24 12 -18Z', '#F2C14E', 2.2)}${L('M0 0 l-6 -18M0 0 v-20M0 0 l6 -18', OL, 1.4)}</g>`,
    u_skyelder: () => S('M50 0 L68 44 L32 44Z', '#2A3366') + [[46, 22], [54, 32], [50, 12]].map(([x, y]) => sparkle(x, y, 3, '#FFE27A')).join('') +
      El(50, 46, 26, 6, '#2A3366') + S('M24 50 Q20 96 30 98 L70 98 Q80 96 76 50Z', '#3E4A8A') +
      eyes(50, 58, 9, 3.4, 'open') + brows(50, 51, 9, 'worry') + S('M30 66 Q50 72 70 66 Q66 92 50 100 Q34 92 30 66Z', '#5A68B0') +
      [[40, 76], [56, 82], [48, 90], [60, 72]].map(([x, y]) => dot(x, y, 1.8, '#FFF3B0')).join('') + mouth(50, 66, 'sad', 4) +
      `<g transform="translate(88 66)">${L('M0 0 v34', '#8a4b2a', 2.6)}${sparkle(0, -4, 7, '#FFE27A')}</g>`,
    u_granny: () => S('M64 30 L64 10 L76 10 L76 40Z', '#fff') + L('M64 14 l12 4M64 22 l12 4M64 30 l12 4', '#E5334A', 3) +
      S('M8 56 L50 18 L92 56Z', '#C98F5A') + L('M12 54 q6 6 12 0 t12 0 12 0 12 0 12 0 12 0 12 0', '#fff', 4) +
      S('M20 54 L80 54 L80 96 L20 96Z', '#E8B47A') + `<rect x="42" y="76" width="16" height="20" rx="8" fill="#B07A4A" stroke="${OL}" stroke-width="2.4"/>` +
      dot(30, 86, 3, '#FF8FA8') + dot(70, 86, 3, '#9FD39A') + eyes(50, 64, 12, 3.6, 'shut') + mouth(50, 70, 'smile', 4) + cheeks(50, 70, 18, 4) +
      `<g transform="translate(92 88)">${L('M0 10 v-18 q0 -8 -7 -8', '#E5334A', 4)}${L('M0 6 v-4M0 -4 v-4', '#fff', 4)}</g>`,
    u_wizard: () => S('M24 44 L90 88 L80 100 L22 98Z', '#4E2F80') + S('M28 40 L56 6 L74 16 L62 18 L68 40Z', '#7A4FB8') + sparkle(74, 16, 6, '#FFE27A') +
      El(48, 42, 26, 5, '#7A4FB8') + S('M26 46 Q24 94 34 98 L64 98 Q74 94 70 46Z', '#9A72D0') +
      eyes(48, 60, 9, 3.4, 'open', .3) + brows(48, 53, 9, 'one') + mouth(48, 72, 'smug', 5) + cheeks(48, 68, 15, 3.6) +
      `<g transform="translate(14 74) rotate(-24)">${L('M0 0 v24', '#2E3140', 3)}${sparkle(0, -2, 5, '#fff')}</g>`,
    u_ajumma: () => Ci(50, 14, 11, '#3b2c26') + L('M34 12 h32', '#F2C14E', 3) + dot(66, 12, 2.6, '#E5334A') +
      S('M28 24 L72 24 L80 96 L20 96Z', '#B86B6B') + `<path d="M36 24 L50 44 L64 24" fill="#fff" stroke="${OL}" stroke-width="2.6"/>` + L('M50 44 v14 M50 50 l-8 10M50 50 l8 10', '#E5334A', 3) +
      eyes(50, 33, 10, 4.2, 'open') + brows(50, 25, 10, 'one') + mouth(50, 41, 'flat', 4) +
      `<g transform="translate(14 82)">${S('M-10 -8 h20 v16 h-20z', '#B07A4A', 2.2)}${L('M-10 -2 h20M-10 4 h20', OL, 1.4)}${[-6, 0, 6].map((x) => dot(x, -5, 1.8, '#F4EFE4')).join('')}</g>`,
    u_fairy: () => S('M50 50 Q24 10 8 26 Q4 46 46 56Z', '#E6F4FF') + S('M50 50 Q76 10 92 26 Q96 46 54 56Z', '#E6F4FF') +
      S('M48 58 Q20 64 16 84 Q30 92 48 66Z', '#D6ECFF') + S('M52 58 Q80 64 84 84 Q70 92 52 66Z', '#D6ECFF') + L('M46 52 Q28 30 16 30M54 52 Q72 30 84 30', '#8FC6E8', 2) +
      S('M50 36 Q66 56 62 80 Q58 98 50 98 Q42 98 38 80 Q34 56 50 36Z', '#BFE8FF') + eyes(50, 66, 6, 3, 'open') + mouth(50, 76, 'smile', 3) + cheeks(50, 73, 10, 3) +
      sparkle(50, 30, 6, '#FFE27A') + `<g transform="translate(84 92) rotate(30)">${L('M0 -12 v16', '#A0A8B8', 2.4)}${L('M0 -12 q8 6 -4 14 q-10 6 -2 12', '#E5334A', 1.8)}</g>`,
    u_scarecrow: () => L('M50 30 v70', '#8a4b2a', 5) + L('M6 46 H94', '#8a4b2a', 5) + L('M6 46 l-4 -4M6 46 l-4 4M94 46 l4 -4M94 46 l4 4', '#E0C060', 3) +
      S('M34 44 L66 44 L72 84 L28 84Z', '#E8C874') + `<rect x="54" y="60" width="10" height="10" fill="#9FD3F4" stroke="${OL}" stroke-width="2"/>` +
      El(50, 14, 34, 6, '#D9B35A') + S('M34 14 Q50 -6 66 14Z', '#D9B35A') + Ci(50, 28, 14, '#F4E6C8') +
      eyes(50, 26, 6, 2.8, 'shut') + mouth(50, 33, 'stitch', 5) +
      `<g transform="translate(16 84)">${L('M0 14 L-2 -8M3 14 L4 -8M-3 14 L-8 -6', '#D9B35A', 3)}${L('M-6 2 h10', '#8a4b2a', 2.4)}</g>`,
    u_pumpkin: () => L('M50 30 q-2 -12 10 -16 q8 -2 8 6', '#4C9A4A', 3.4) + El(50, 56, 42, 28, '#F2994A') + L('M36 30 q-10 26 0 52M64 30 q10 26 0 52M50 28 v56', '#C9661E', 2.8) +
      Ci(28, 90, 9, '#F2C14E') + Ci(72, 90, 9, '#F2C14E') + dot(28, 90, 3, OL) + dot(72, 90, 3, OL) +
      eyes(50, 52, 14, 4, 'open') + mouth(50, 64, 'smile', 8) + cheeks(50, 62, 22, 4.6) +
      `<g transform="translate(90 92)">${S('M-8 4 q0 -10 8 -10 q2 6 8 8 v2z', '#DFF4FF', 2)}</g>`,
    // 손님 가족 9 + 팥죽 솥
    u_pot: () => L('M38 40 q-6 -8 0 -14 t0 -12M50 38 q-6 -8 0 -14 t0 -12M62 40 q-6 -8 0 -14 t0 -12', '#ffffff', 3.4) +
      L('M24 86 L18 100M50 92 V102M76 86 L82 100', OL, 4.4) + Ci(12, 60, 7, 'none', 4) + Ci(88, 60, 7, 'none', 4) +
      S('M16 50 L84 50 Q88 90 50 92 Q12 90 16 50Z', '#4A4A52') + El(50, 50, 36, 7, '#B07A4A') +
      eyes(50, 66, 12, 3.6, 'shut') + mouth(50, 74, 'smile', 5) + cheeks(50, 74, 20, 4) +
      `<g transform="translate(76 34) rotate(30)">${L('M0 0 v-20', '#8a4b2a', 3)}${El(0, 4, 6, 5, '#B07A4A', 0, 2.2)}</g>`,
    u_gj_cabbage: () => S('M50 96 Q10 92 8 52 Q12 22 30 18 Q36 44 50 60 Q64 44 70 18 Q88 22 92 52 Q90 92 50 96Z', '#9FD67A') +
      S('M50 96 Q24 90 26 56 Q32 34 42 30 Q44 52 50 62 Q56 52 58 30 Q68 34 74 56 Q76 90 50 96Z', '#BFE6A0') + `<path d="M36 80 Q50 98 64 80 Q60 96 50 97 Q40 96 36 80Z" fill="#F4F8E8"/>` +
      L('M50 62 v30M30 50 q8 10 10 26M70 50 q-8 10 -10 26', '#7FB85A', 2.2) + eyes(50, 70, 9, 3.4, 'shut') + mouth(50, 78, 'open', 5) + cheeks(50, 76, 15, 3.8) +
      `<g transform="translate(88 86) rotate(-18)">${S('M-6 10 v-14 q0 -6 3 -6 v8 q1 -10 4 -10 v10 q1 -8 4 -8 v8 q3 -4 4 0 q0 8 -6 12z', '#E5334A', 2)}</g>`,
    u_gj_pepper: () => S('M44 20 Q40 8 50 6 Q60 8 56 20 Q70 18 66 26 L34 26 Q30 18 44 20Z', '#4C9A4A') +
      S('M34 24 Q66 22 66 34 Q70 70 50 92 Q40 100 36 92 Q44 80 40 58 Q34 40 34 24Z', '#E5334A') +
      `<rect x="30" y="30" width="40" height="8" rx="4" fill="#fff" stroke="${OL}" stroke-width="2.4"/>` + L('M70 34 l10 -4M70 36 l8 4', '#fff', 3) +
      eyes(52, 48, 7, 3.2, 'open') + brows(52, 42, 7, 'cross', 5) + mouth(52, 58, 'grin', 5) + cheeks(52, 55, 12, 3.4) +
      `<g transform="translate(20 80)">${S('M-10 -4 h20 l-3 12 h-14z', '#B07A4A', 2.2)}${dot(-3, -6, 2.4, '#E5334A')}${dot(3, -7, 2, '#E5334A')}</g>`,
    u_gj_garlic: () => S('M50 18 Q56 34 74 44 Q100 58 90 82 Q78 98 50 98 Q22 98 10 82 Q0 58 26 44 Q44 34 50 18Z', '#F4EFE4') + L('M46 20 q4 -12 10 -14', '#C9B98E', 3) +
      L('M50 36 Q30 62 34 96M50 36 Q70 62 66 96M50 40 v56', '#D8C8E0', 2.6) + L('M44 98 l-3 4M50 98 v5M56 98 l3 4', '#C9B98E', 2) +
      eyes(50, 68, 11, 3.4, 'open', -.2) + mouth(50, 78, 'smile', 3.6) + cheeks(50, 76, 18, 4) +
      `<g transform="translate(90 62) rotate(24)">${S('M-4 -18 h8 v30 q-4 6 -8 0z', '#C98F5A', 2.2)}</g>`,
    u_gs_yeot: () => S('M6 70 Q8 50 30 54 Q48 58 54 46 Q62 32 82 36 Q98 40 94 58 Q90 68 76 64 Q62 60 56 72 Q48 88 28 86 Q4 84 6 70Z', '#E0A94A') +
      L('M14 66 q10 -6 18 0M66 46 q10 -6 18 0', '#F4D08A', 3) + eyes(50, 62, 8, 3.4, 'shut') + mouth(50, 70, 'open', 5) + cheeks(50, 68, 13, 3.6) +
      `<g transform="translate(60 20)">${L('M-14 -6 L10 12M-14 12 L10 -6', '#A0A8B8', 4.4)}${Ci(-16, -8, 4.4, 'none', 3)}${Ci(-16, 14, 4.4, 'none', 3)}</g>` + feet(30, 66, '#B07A3A'),
    u_gs_rice: () => El(50, 76, 42, 21, '#FFF4F0') + `<path d="M24 66 q26 -10 52 0" fill="none" stroke="#F0DDD6" stroke-width="3"/>` +
      Ci(50, 56, 5.4, '#8A3A4A', 2.4) + [[30, 72], [70, 72], [40, 88], [62, 90], [22, 84], [80, 84]].map(([x, y]) => dot(x, y, 1.6, '#E8D8D0')).join('') +
      eyes(50, 76, 13, 3.4, 'shut') + mouth(50, 84, 'smile', 4) + cheeks(50, 82, 21, 4.4) +
      `<g transform="translate(84 58)">${S('M0 0 l-10 -7 v14z', '#FF8FA8', 2)}${S('M0 0 l10 -7 v14z', '#FF8FA8', 2)}${Ci(0, 0, 3, '#E5546F', 2)}</g>`,
    u_gs_pencil: () => S('M36 24 L50 2 L64 24Z', '#E8C9A0') + S('M45 10 L50 2 L55 10Z', '#3b2c26', 2) +
      S('M36 24 L64 24 L64 82 L36 82Z', '#F6D860') + L('M45 24 v58M55 24 v58', '#E0B83A', 2.4) +
      `<rect x="35" y="82" width="30" height="8" fill="#B8B8C8" stroke="${OL}" stroke-width="2.4"/>` + S('M36 90 L64 90 L64 96 Q50 102 36 96Z', '#F4A3B6') +
      eyes(50, 42, 7, 3.2, 'open') + brows(50, 35, 7, 'flat', 5) + mouth(50, 52, 'smile', 3.4) + cheeks(50, 50, 11, 3.2) +
      `<g transform="translate(82 70) rotate(-20)">${S('M-4 -22 h8 v44 h-8z', '#9FD3F4', 2.2)}${L('M-4 -14 h4M-4 -6 h4M-4 2 h4M-4 10 h4', OL, 1.4)}</g>`,
    u_gy_tree: () => `<rect x="44" y="86" width="12" height="12" fill="#8a4b2a" stroke="${OL}" stroke-width="2.4"/>` +
      S('M14 88 L50 54 L86 88Z', '#3E9A4E') + S('M20 66 L50 34 L80 66Z', '#4CAF5A') + S('M28 46 L50 16 L72 46Z', '#5DC06A') + sparkle(50, 12, 10, '#FFE27A') +
      [[30, 82, '#E5334A'], [70, 80, '#F2C14E'], [40, 60, '#8FD3F4'], [62, 62, '#E5334A'], [50, 40, '#F2C14E']].map(([x, y, c]) => Ci(x, y, 3.4, c, 1.8)).join('') +
      eyes(50, 70, 9, 3.4, 'shut') + mouth(50, 78, 'smile', 4) + cheeks(50, 76, 14, 3.6) +
      `<g transform="translate(86 92)">${S('M-8 -8 h16 v14 h-16z', '#FF8FA8', 2.2)}${L('M0 -8 v14M-8 -2 h16', '#fff', 2.4)}</g>`,
    u_gy_soup: () => L('M36 30 q-6 -8 0 -14t0 -12M50 28 q-6 -8 0 -14t0 -12M64 30 q-6 -8 0 -14t0 -12', '#ffffff', 3.2) +
      S('M8 46 L92 46 Q88 90 50 94 Q12 90 8 46Z', '#FFF8E8') + `<path d="M10 58 L90 58" stroke="#3B6FD6" stroke-width="4"/>` + El(50, 46, 42, 8, '#F4E8D0') +
      [[34, 44], [50, 46], [66, 44]].map(([x, y]) => El(x, y, 8, 4, '#fff', -10, 2)).join('') + L('M44 50 l8 -2', '#3a5a2a', 2.6) +
      eyes(50, 70, 12, 3.6, 'shut') + mouth(50, 78, 'smile', 5) + cheeks(50, 76, 20, 4.4) +
      `<g transform="translate(90 30) rotate(34)">${L('M0 0 v-18', '#C0C4CC', 3.4)}${El(0, 4, 5, 7, '#C0C4CC', 0, 2.2)}</g>`,
    u_gy_snow: () => Ci(50, 74, 25, '#F4FAFF') + Ci(50, 38, 18, '#F4FAFF') + S('M32 30 Q50 6 68 30Z', '#E5334A') + El(50, 30, 20, 4.4, '#fff', 0, 2.6) + Ci(50, 10, 5, '#fff', 2.4) +
      `<path d="M30 54 q20 8 40 0 v6 q-20 8 -40 0z" fill="#3B6FD6" stroke="${OL}" stroke-width="2.4"/>` +
      eyes(50, 38, 7, 3.2, 'open') + S('M52 44 L74 46 L52 49Z', '#F2994A', 2.2) + mouth(48, 50, 'smile', 3) + cheeks(50, 46, 12, 3.4) +
      [[50, 70], [50, 82]].map(([x, y]) => dot(x, y, 2.6, '#3b2c26')).join('') + L('M26 70 L8 58M74 70 L92 58', '#8a4b2a', 3),
  };

  const has = (id) => !!K[id];
  const svg = (id, o) => K[id] ? sv(K[id](), o && o.size) : '';
  root.ExpCompanions = { has, svg, ids: Object.keys(K), OL };
  if (typeof module !== 'undefined') module.exports = root.ExpCompanions;
})(typeof window !== 'undefined' ? window : globalThis);
