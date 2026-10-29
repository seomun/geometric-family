/* 신화 영웅 그림 v3 — 포세이돈 · 청룡 · 손오공(서유기 원전) · 아누비스. 전부 이 저장소에서 새로 그린 SVG(외부 에셋·특정 작품 디자인 참고 없음).
   bg(k): 장면 배경 300×410 · hero(k): 틀 밖으로 튀어나오는 전면 그림 360×440 · icon(k): 특수 능력 아이콘 48×48.
   신화 화풍 = IP 외곽선 #6b5443 + 금박 선 + 도형으로 만든 몸(비늘=삼각형, 파도=원호, 피라미드=삼각형). */
(function (root) {
  const OL = '#6b5443', GOLD = '#F5C04A', GOLD2 = '#FFE9A0', GD = '#C98A05';
  const st = (w = 3) => `stroke="${OL}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  const limb = (x1, y1, x2, y2, w, fill) => `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${OL}" stroke-width="${w + 6}" stroke-linecap="round" fill="none"/><path d="M${x1} ${y1}L${x2} ${y2}" stroke="${fill}" stroke-width="${w}" stroke-linecap="round" fill="none"/>`;
  const gold = (d, w = 2.4) => `<path d="${d}" fill="none" stroke="${GOLD}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const eye = (x, y, r = 12) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#4a3426" ${st(2.4)}/><circle cx="${x - r * 0.32}" cy="${y - r * 0.34}" r="${r * 0.38}" fill="#fff"/><circle cx="${x + r * 0.34}" cy="${y + r * 0.3}" r="${r * 0.18}" fill="#fff"/>`;
  const blush = (x, y, r = 10) => `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 0.72}" fill="#F78FB0" opacity=".85"/>`;
  const star = (x, y, s, f = '#fff') => `<path d="M${x} ${y - s}L${x + s * 0.28} ${y - s * 0.28}L${x + s} ${y}L${x + s * 0.28} ${y + s * 0.28}L${x} ${y + s}L${x - s * 0.28} ${y + s * 0.28}L${x - s} ${y}L${x - s * 0.28} ${y - s * 0.28}Z" fill="${f}"/>`;
  const stars = (pts) => pts.map(([x, y, s]) => star(x, y, s)).join('');
  // Catmull-Rom → 점열
  const spline = (P, n) => { const out = []; for (let i = 0; i < P.length - 1; i++) { const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(P.length - 1, i + 2)]; for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t; out.push([0, 1].map((a) => 0.5 * ((2 * p1[a]) + (-p0[a] + p2[a]) * t + (2 * p0[a] - 5 * p1[a] + 4 * p2[a] - p3[a]) * t2 + (-p0[a] + 3 * p1[a] - 3 * p2[a] + p3[a]) * t3))); } } out.push(P[P.length - 1]); return out; };
  const BG = {}, HERO = {}, ICON = {};

  // ───────── 배경 ─────────
  const seigaiha = (cols, rows, r, colors, y0, x0 = 0) => { let s = ''; for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const x = x0 + i * r * 2 + (j % 2 ? r : 0), y = y0 + j * r * 0.55; s += `<g><circle cx="${x}" cy="${y}" r="${r}" fill="${colors[j % colors.length]}" stroke="${GOLD}" stroke-width="1.6"/><circle cx="${x}" cy="${y}" r="${r * 0.72}" fill="none" stroke="${GOLD}" stroke-width="1.4" opacity=".8"/><circle cx="${x}" cy="${y}" r="${r * 0.44}" fill="none" stroke="${GOLD}" stroke-width="1.2" opacity=".7"/></g>`; } return s; };
  BG.poseidon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 410" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="pbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14305F"/><stop offset=".55" stop-color="#2F7FB8"/><stop offset="1" stop-color="#7FD3E6"/></linearGradient><radialGradient id="pgl"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
    <rect width="300" height="410" fill="url(#pbg)"/><circle cx="150" cy="120" r="150" fill="url(#pgl)" opacity=".5"/><circle cx="150" cy="120" r="64" fill="#FFF3C0" opacity=".9"/><circle cx="150" cy="120" r="64" fill="none" stroke="${GOLD}" stroke-width="2.4"/>
    ${stars([[40, 40, 6], [250, 60, 5], [70, 100, 4], [230, 130, 6], [20, 150, 4]])}
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => `<path d="M150 120 L${150 + 220 * Math.cos(i * Math.PI / 6)} ${120 + 220 * Math.sin(i * Math.PI / 6)}" stroke="#fff" stroke-opacity=".12" stroke-width="12"/>`).join('')}
    <g>${seigaiha(6, 5, 38, ['#2A6FA8', '#3B86C2', '#2A6FA8', '#4FA0D6', '#6FC3E0'], 250, -10)}</g>
    <path d="M0 330 C40 300 70 340 110 318 C150 296 190 340 230 316 C260 300 280 320 300 312 V410 H0Z" fill="#1E5D97" stroke="${GOLD}" stroke-width="2"/>
    ${seigaiha(6, 4, 40, ['#1E5D97', '#2A6FA8', '#1E5D97', '#17497D'], 360, -20)}
    ${[[30, 330], [160, 345], [260, 322]].map(([x, y]) => `<path d="M${x} ${y} q8 -14 16 0 q8 -14 16 0" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>`).join('')}</svg>`;
  BG.dragon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 410" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="dbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1B5E7A"/><stop offset=".5" stop-color="#58B8C4"/><stop offset="1" stop-color="#FFE9C8"/></linearGradient></defs>
    <rect width="300" height="410" fill="url(#dbg)"/><circle cx="60" cy="250" r="80" fill="#FF7A59" opacity=".55"/><circle cx="60" cy="250" r="46" fill="#FFC15A"/><circle cx="60" cy="250" r="46" fill="none" stroke="${GOLD}" stroke-width="2.4"/>
    ${stars([[220, 40, 5], [260, 90, 4], [160, 30, 4], [270, 150, 5]])}
    <path d="M0 330 L40 270 L70 310 L120 240 L170 316 L210 276 L250 320 L300 262 V410 H0Z" fill="#2F6E88" stroke="${GOLD}" stroke-width="2" opacity=".9"/><path d="M0 370 L50 322 L100 362 L160 306 L220 366 L270 330 L300 352 V410 H0Z" fill="#245A74" stroke="${GOLD}" stroke-width="2"/>
    ${[[50, 120, 1.1], [230, 190, 1.3], [110, 350, 1], [240, 300, .9]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-40 14 C-52 14 -52 -8 -34 -6 C-34 -22 -8 -26 0 -12 C10 -26 38 -20 34 -2 C52 -2 52 18 36 16Z" fill="#fff" stroke="${GOLD}" stroke-width="2.4"/><path d="M-22 4 C-22 -6 -8 -6 -8 2 M8 4 C8 -4 20 -4 20 4" fill="none" stroke="#9FD6DC" stroke-width="2.4" stroke-linecap="round"/></g>`).join('')}</svg>`;
  BG.wukong = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 410" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="wbg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7A2A6E"/><stop offset=".45" stop-color="#E0553E"/><stop offset="1" stop-color="#FFC15A"/></linearGradient></defs>
    <rect width="300" height="410" fill="url(#wbg)"/><circle cx="150" cy="190" r="96" fill="#FFE29A" opacity=".85"/><circle cx="150" cy="190" r="96" fill="none" stroke="${GOLD}" stroke-width="2.4"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => `<path d="M150 190 L${150 + 240 * Math.cos(i * Math.PI / 5)} ${190 + 240 * Math.sin(i * Math.PI / 5)}" stroke="#FFE29A" stroke-opacity=".18" stroke-width="16"/>`).join('')}
    <path d="M0 340 L30 250 L52 290 L90 200 L130 300 L160 240 L196 300 L236 220 L270 290 L300 250 V410 H0Z" fill="#5C2A5E" stroke="${GOLD}" stroke-width="2"/><path d="M60 410 L60 290 M240 410 L240 280" stroke="#9AD8E8" stroke-width="7" opacity=".8"/>
    ${[[50, 80], [250, 100], [210, 40], [90, 150], [260, 190]].map(([x, y]) => `<g transform="translate(${x} ${y})"><circle r="11" fill="#FFB3C4" stroke="${OL}" stroke-width="2.4"/><path d="M0 -10 q9 -8 15 -2 q-6 8 -15 2Z" fill="#6DBB5C" stroke="${OL}" stroke-width="2"/></g>`).join('')}
    ${[[30, 360, 1.1], [200, 375, 1.3]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-40 14 C-52 14 -52 -8 -34 -6 C-34 -22 -8 -26 0 -12 C10 -26 38 -20 34 -2 C52 -2 52 18 36 16Z" fill="#FFE29A" stroke="${GOLD}" stroke-width="2.4"/></g>`).join('')}</svg>`;
  BG.anubis = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 410" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="abg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0E1B3D"/><stop offset=".6" stop-color="#3B2E7A"/><stop offset="1" stop-color="#D98A4A"/></linearGradient></defs>
    <rect width="300" height="410" fill="url(#abg)"/>${stars([[40, 30, 5], [90, 70, 4], [240, 40, 6], [270, 110, 4], [20, 120, 4], [200, 90, 3]])}
    <circle cx="150" cy="150" r="82" fill="#FFD27A"/><circle cx="150" cy="150" r="82" fill="none" stroke="${GOLD}" stroke-width="3"/><circle cx="150" cy="150" r="64" fill="none" stroke="#fff" stroke-width="1.6" opacity=".7"/>
    <path d="M-10 330 L70 220 L150 330Z" fill="#B7652E" stroke="${GOLD}" stroke-width="2"/><path d="M70 220 L110 330 H150Z" fill="#8F4A20"/><path d="M110 330 L215 190 L320 330Z" fill="#C9763A" stroke="${GOLD}" stroke-width="2"/><path d="M215 190 L260 330 H320Z" fill="#9C5326"/>
    <path d="M0 350 C60 320 120 360 180 338 C230 322 270 350 300 336 V410 H0Z" fill="#E9A85A" stroke="${GOLD}" stroke-width="2"/><path d="M0 385 C70 362 130 392 200 372 C250 360 280 380 300 372 V410 H0Z" fill="#C98242"/>
    ${[[40, 380], [140, 395], [250, 385]].map(([x, y]) => `<path d="M${x} ${y} q10 -10 20 0" fill="none" stroke="#9C5326" stroke-width="2.4" stroke-linecap="round"/>`).join('')}</svg>`;

  // ───────── 영웅(전면) 360×440 ─────────
  const defsH = (id) => `<defs><linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs>`;
  HERO.poseidon = (() => {
    const wave = (() => { let s = ''; for (let y = 250; y < 400; y += 26) for (let x = 90; x < 280; x += 34) s += `<path d="M${x + (((y - 250) / 26) % 2 ? 17 : 0)} ${y} a17 17 0 0 1 34 0" fill="none" stroke="${GOLD}" stroke-width="2.4" stroke-linecap="round"/>`; return s; })();
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 440" overflow="visible"><defs><clipPath id="pcl"><path d="M118 192 Q180 176 242 192 L264 400 Q180 414 96 400Z"/></clipPath><radialGradient id="porb" cx=".35" cy=".3"><stop offset="0" stop-color="#E8FBFF"/><stop offset=".6" stop-color="#58C4E8"/><stop offset="1" stop-color="#2A7FC0"/></radialGradient><radialGradient id="ptg"><stop offset="0" stop-color="#9FE8FF" stop-opacity=".9"/><stop offset="1" stop-color="#9FE8FF" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="180" cy="414" rx="130" ry="14" fill="rgba(20,40,80,.35)"/>
    <path d="M126 176 C60 226 38 330 66 404 L294 404 C322 330 300 226 234 176Z" fill="#7FD0E4" ${st()}/>${gold('M92 236 C74 290 70 340 82 392 M268 236 C286 290 290 340 278 392', 2)}
    <circle cx="292" cy="50" r="64" fill="url(#ptg)"/>
    <path d="M118 192 Q180 176 242 192 L264 400 Q180 414 96 400Z" fill="#2A6F97" ${st()}/><g clip-path="url(#pcl)">${wave}</g><path d="M118 192 Q180 176 242 192 L264 400 Q180 414 96 400Z" fill="none" ${st()}/>
    <path d="M112 300 Q180 318 250 300 L252 326 Q180 346 110 326Z" fill="${GOLD}" ${st()}/><circle cx="180" cy="318" r="12" fill="#58C4E8" ${st(2.6)}/><path d="M176 312 q8 -4 8 4 q-2 6 -8 3" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
    ${limb(248, 204, 292, 268, 30, '#2A6F97')}<circle cx="292" cy="272" r="15" fill="#E8B98A" ${st()}/>
    <path d="M292 438 V30" stroke="${OL}" stroke-width="15" stroke-linecap="round"/><path d="M292 438 V30" stroke="${GOLD}" stroke-width="9" stroke-linecap="round"/><path d="M289 400 V50" stroke="${GOLD2}" stroke-width="2.4" stroke-linecap="round" opacity=".9"/>
    <path d="M262 34 Q262 84 292 90 Q322 84 322 34" fill="none" stroke="${OL}" stroke-width="15" stroke-linecap="round"/><path d="M262 34 Q262 84 292 90 Q322 84 322 34" fill="none" stroke="${GOLD}" stroke-width="9" stroke-linecap="round"/>
    ${[[262, 34], [292, 6], [322, 34]].map(([x, y]) => `<path d="M${x - 11} ${y + 14} L${x} ${y - 14} L${x + 11} ${y + 14}Z" fill="${GOLD2}" ${st(3)}/>`).join('')}
    <circle cx="292" cy="96" r="9" fill="#58C4E8" ${st(3)}/>
    ${limb(112, 204, 74, 270, 30, '#2A6F97')}<circle cx="72" cy="274" r="15" fill="#E8B98A" ${st()}/>
    <circle cx="58" cy="238" r="30" fill="url(#porb)" ${st()}/><path d="M42 238 q16 -22 32 0 q-16 -4 -22 8" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".9"/><ellipse cx="48" cy="226" rx="8" ry="5" fill="#fff" opacity=".8"/>
    <circle cx="110" cy="198" r="25" fill="${GOLD}" ${st()}/><path d="M110 198 m-12 0 a12 12 0 1 1 12 12 a6 6 0 1 1 -6 -6" fill="none" stroke="${GD}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="250" cy="198" r="25" fill="${GOLD}" ${st()}/><path d="M250 198 m-12 0 a12 12 0 1 1 12 12 a6 6 0 1 1 -6 -6" fill="none" stroke="${GD}" stroke-width="3" stroke-linecap="round"/>
    <path d="M114 108 C92 40 140 6 180 14 C220 6 268 40 246 108 C236 74 206 56 180 58 C154 56 124 74 114 108Z" fill="#EAF4F9" ${st()}/>
    ${[[110, 128], [250, 128]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="20" fill="#EAF4F9" ${st()}/>`).join('')}
    <ellipse cx="180" cy="116" rx="60" ry="56" fill="#E8B98A" ${st()}/>
    <path d="M118 134 C108 206 150 240 180 244 C210 240 252 206 242 134 C222 158 138 158 118 134Z" fill="#F4F8FB" ${st()}/><path d="M146 186 q10 14 20 0 M194 186 q10 14 20 0 M170 214 q10 12 20 0" fill="none" stroke="#B7D2E0" stroke-width="3" stroke-linecap="round"/>
    <path d="M158 164 C140 150 138 170 150 178 C162 174 172 168 180 164 C188 168 198 174 210 178 C222 170 220 150 202 164 C194 158 188 160 180 162 C172 160 166 158 158 164Z" fill="#fff" ${st(2.8)}/>
    ${eye(152, 112, 12.5)}${eye(208, 112, 12.5)}<path d="M134 92 Q152 80 168 92 M192 92 Q208 80 226 92" fill="none" stroke="#EAF4F9" stroke-width="9" stroke-linecap="round"/><path d="M134 92 Q152 80 168 92 M192 92 Q208 80 226 92" fill="none" stroke="${OL}" stroke-width="2.4" stroke-linecap="round" opacity=".6"/>
    ${blush(128, 134, 9)}${blush(232, 134, 9)}<path d="M170 172 q10 8 20 0" fill="none" ${st(3)}/>
    <path d="M132 58 L142 20 L160 48 L180 4 L200 48 L218 20 L228 58Z" fill="${GOLD}" ${st()}/><circle cx="142" cy="20" r="6" fill="#fff" ${st(2.4)}/><circle cx="218" cy="20" r="6" fill="#fff" ${st(2.4)}/><circle cx="180" cy="4" r="7" fill="#58C4E8" ${st(2.4)}/><path d="M136 56 H224" stroke="${GD}" stroke-width="4"/>
    </svg>`;
  })();

  HERO.dragon = (() => {
    const sp = spline([[330, 430], [250, 424], [140, 396], [74, 340], [108, 276], [210, 250], [290, 206], [286, 150], [226, 114], [178, 112]], 14);
    const N = sp.length, R = (i) => 8 + 28 * Math.pow(i / (N - 1), 0.8);
    let outl = '', fill = '', belly = '', scales = '', mane = '';
    sp.forEach((p, i) => { const r = R(i); outl += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${(r + 3.4).toFixed(1)}" fill="${OL}"/>`; });
    sp.forEach((p, i) => { const r = R(i), c = i % 8 < 4 ? '#2FA39B' : '#38B3A8'; fill += `<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="${r.toFixed(1)}" fill="${c}"/>`; });
    for (let i = 4; i < N - 6; i += 3) { const a = sp[Math.max(0, i - 1)], b = sp[Math.min(N - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1, nx = -ty / l, ny = tx / l, r = R(i), p = sp[i], sgn = 1;
      belly += `<circle cx="${(p[0] - nx * r * 0.42).toFixed(1)}" cy="${(p[1] - ny * r * 0.42).toFixed(1)}" r="${(r * 0.52).toFixed(1)}" fill="#EAF6D8"/>`;
      const bx = p[0] + nx * r * sgn, by = p[1] + ny * r * sgn, ux = tx / l, uy = ty / l, s = Math.max(5, r * 0.55);
      scales += `<path d="M${(bx - ux * s).toFixed(1)} ${(by - uy * s).toFixed(1)} L${(bx + nx * s * 0.9).toFixed(1)} ${(by + ny * s * 0.9).toFixed(1)} L${(bx + ux * s).toFixed(1)} ${(by + uy * s).toFixed(1)}Z" fill="#E5334A" ${st(2.2)}/>`;
      const sx = p[0] - nx * 0, mx = p[0] + ny * 0; }
    for (let i = 3; i < N - 3; i += 3) { const p = sp[i], r = R(i); scales += `<path d="M${(p[0] - r * 0.5).toFixed(1)} ${(p[1] - r * 0.1).toFixed(1)} q${(r * 0.5).toFixed(1)} ${(-r * 0.7).toFixed(1)} ${r.toFixed(1)} 0" fill="none" stroke="#1F7F78" stroke-width="2.2" stroke-linecap="round"/>`; }
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 440" overflow="visible"><defs><radialGradient id="dpl" cx=".35" cy=".3"><stop offset="0" stop-color="#fff"/><stop offset=".5" stop-color="#FFE27A"/><stop offset="1" stop-color="#F29B2E"/></radialGradient><radialGradient id="dgl"><stop offset="0" stop-color="#FFF3A8" stop-opacity=".95"/><stop offset="1" stop-color="#FFF3A8" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="180" cy="428" rx="140" ry="10" fill="rgba(10,40,60,.3)"/>
    <circle cx="70" cy="104" r="56" fill="url(#dgl)"/>
    ${outl}${fill}${belly}${scales}
    <g>${[[150, 134, 22], [120, 130, 18], [92, 138, 15]].map(([x, y, s]) => `<path d="M${x} ${y - s} q${s} ${s * 0.6} ${s * 1.4} ${s * 1.6} q-${s * 0.8} ${s * 0.4} -${s * 1.4} ${-s * 1.6}Z" fill="#E5334A" ${st(2.4)}/>`).join('')}</g>
    <path d="M206 80 C176 66 132 76 120 104 C112 126 134 146 170 144 C204 142 232 120 222 94Z" fill="#2FA39B" ${st()}/>
    <path d="M120 110 C100 114 84 126 88 140 C96 154 126 152 140 140Z" fill="#38B3A8" ${st()}/><ellipse cx="102" cy="122" rx="5" ry="3.4" fill="${OL}"/>
    <path d="M96 140 C112 150 128 150 140 142 L136 134 C124 142 108 140 100 134Z" fill="#fff" ${st(2)}/>
    <path d="M84 124 C60 112 46 128 28 120 M90 138 C66 148 48 142 30 156" fill="none" stroke="${OL}" stroke-width="9" stroke-linecap="round"/><path d="M84 124 C60 112 46 128 28 120 M90 138 C66 148 48 142 30 156" fill="none" stroke="${GOLD}" stroke-width="4.6" stroke-linecap="round"/>
    <circle cx="170" cy="106" r="15" fill="#fff" ${st(2.6)}/><circle cx="168" cy="106" r="10" fill="#E8A41A"/><circle cx="168" cy="106" r="5.4" fill="#3a2a1a"/><circle cx="165" cy="103" r="2.4" fill="#fff"/>
    <path d="M150 92 Q168 80 188 92" fill="none" stroke="${OL}" stroke-width="5.4" stroke-linecap="round"/>${blush(196, 128, 9)}
    <path d="M174 80 C170 54 186 30 168 6 M186 84 C196 56 220 40 214 12" fill="none" stroke="${OL}" stroke-width="14" stroke-linecap="round"/><path d="M174 80 C170 54 186 30 168 6 M186 84 C196 56 220 40 214 12" fill="none" stroke="${GOLD}" stroke-width="8" stroke-linecap="round"/>
    <path d="M176 52 L156 44 M182 34 L164 22 M200 58 L218 52 M208 36 L226 28" stroke="${GOLD}" stroke-width="6" stroke-linecap="round"/>
    <path d="M214 94 C240 80 250 100 236 112 C226 108 218 104 214 94Z" fill="#E5334A" ${st(2.4)}/>
    <circle cx="70" cy="104" r="26" fill="url(#dpl)" ${st(3)}/><path d="M56 98 q10 -14 22 -4" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/>${[[70, 60], [70, 148], [24, 104], [116, 104], [38, 70], [102, 70]].map(([x, y]) => `<path d="M70 104 L${x} ${y}" stroke="#FFF3A8" stroke-width="2.6" stroke-linecap="round" opacity=".7"/>`).join('')}
    <g transform="translate(256 188)">${limb(0, 0, -24, -20, 11, '#2FA39B')}${[[-34, -26], [-30, -14], [-28, -4]].map(([x, y]) => `<path d="M-24 -20 L${x} ${y}" stroke="${GOLD}" stroke-width="5" stroke-linecap="round"/>`).join('')}</g>
    ${[[40, 400, 1.2], [300, 360, 1]].map(([x, y, s]) => `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-40 14 C-52 14 -52 -8 -34 -6 C-34 -22 -8 -26 0 -12 C10 -26 38 -20 34 -2 C52 -2 52 18 36 16Z" fill="#fff" ${st(3)}/><path d="M-22 4 C-22 -6 -8 -6 -8 2 M8 4 C8 -4 20 -4 20 4" fill="none" stroke="#9FD6DC" stroke-width="2.4" stroke-linecap="round"/></g>`).join('')}
    </svg>`;
  })();

  HERO.wukong = (() => {
    const fur = '#C98F4F', mask = '#F7D0A5';
    const cloud = `<g transform="translate(180 404)"><path d="M-140 16 C-168 16 -168 -26 -128 -22 C-122 -54 -76 -58 -60 -30 C-44 -66 18 -64 30 -28 C60 -52 112 -40 112 -8 C150 -12 160 26 124 28Z" fill="#FFF3CC" ${st(3.4)}/><path d="M-100 -4 c0 -16 22 -16 22 0 c0 8 -12 10 -12 2 M-10 -12 c0 -18 24 -18 24 0 c0 8 -12 10 -12 2 M70 -6 c0 -14 20 -14 20 0 c0 8 -10 8 -10 2" fill="none" stroke="${GOLD}" stroke-width="3.2" stroke-linecap="round"/></g>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 440" overflow="visible">
    ${cloud}
    <path d="M232 340 C292 346 316 300 290 272 C272 252 286 232 300 240" fill="none" stroke="${OL}" stroke-width="20" stroke-linecap="round"/><path d="M232 340 C292 346 316 300 290 272 C272 252 286 232 300 240" fill="none" stroke="${fur}" stroke-width="13" stroke-linecap="round"/>
    <rect x="138" y="352" width="34" height="40" rx="12" fill="#3a2a2a" ${st()}/><rect x="196" y="352" width="34" height="40" rx="12" fill="#3a2a2a" ${st()}/><path d="M138 366 h34 M196 366 h34" stroke="${GOLD}" stroke-width="4"/>
    <path d="M124 296 L248 296 L264 356 L108 356Z" fill="#F2994A" ${st()}/>${[[140, 304], [166, 314], [196, 304], [222, 314], [128, 330], [156, 338], [186, 330], [214, 338], [240, 330]].map(([x, y]) => `<path d="M${x} ${y} l7 -10 l5 12Z" fill="#3a2a2a"/>`).join('')}<path d="M108 356 l12 14 l12 -14 l12 14 l12 -14 l12 14 l12 -14 l12 14 l12 -14 l12 14 l12 -14 l8 14" fill="none" stroke="${OL}" stroke-width="3"/>
    <path d="M132 214 Q186 198 238 214 L244 304 H126Z" fill="#E5334A" ${st()}/><path d="M142 220 Q186 210 230 220 L228 292 Q186 304 144 292Z" fill="${GOLD}" ${st()}/>${[[160, 240], [186, 236], [212, 240], [160, 266], [212, 266]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="${GOLD2}" ${st(2)}/>`).join('')}<circle cx="186" cy="262" r="12" fill="#E5334A" ${st(2.6)}/><path d="M132 296 H240" stroke="#7a2a2e" stroke-width="7"/><path d="M132 296 H240" stroke="${GOLD}" stroke-width="3"/>
    ${limb(124, 232, 98, 286, 24, fur)}<circle cx="94" cy="292" r="13" fill="${mask}" ${st()}/><circle cx="86" cy="276" r="15" fill="#FFB3C4" ${st(2.6)}/><path d="M84 262 q9 -9 16 -2 q-7 9 -16 2Z" fill="#6DBB5C" ${st(2)}/>
    ${limb(236, 232, 292, 178, 24, fur)}<rect x="226" y="222" width="30" height="14" rx="6" fill="${GOLD}" ${st(2.6)} transform="rotate(-38 241 229)"/>
    <path d="M336 22 L226 430" stroke="${OL}" stroke-width="20" stroke-linecap="round"/><path d="M336 22 L226 430" stroke="#E5334A" stroke-width="13" stroke-linecap="round"/><path d="M333 34 L228 416" stroke="#FF8A98" stroke-width="2.6" stroke-linecap="round"/>
    <path d="M336 22 L330 40" stroke="${GOLD}" stroke-width="22" stroke-linecap="round"/><path d="M336 22 L330 40" stroke="${OL}" stroke-width="3" stroke-linecap="round" opacity=".5"/><path d="M232 410 L226 430" stroke="${GOLD}" stroke-width="22" stroke-linecap="round"/>
    <circle cx="293" cy="178" r="15" fill="${fur}" ${st()}/>
    <circle cx="120" cy="134" r="20" fill="${fur}" ${st()}/><circle cx="120" cy="134" r="11" fill="#F7A9B5"/><circle cx="252" cy="134" r="20" fill="${fur}" ${st()}/><circle cx="252" cy="134" r="11" fill="#F7A9B5"/>
    <circle cx="186" cy="130" r="64" fill="${fur}" ${st()}/><path d="M144 100 l10 22 l10 -18 l10 20 l10 -22 l10 22 l10 -20 l10 22 l10 -18 l10 20" fill="${fur}" stroke="${OL}" stroke-width="3"/>
    <path d="M186 96 C150 92 130 130 142 156 C150 176 170 190 186 190 C202 190 222 176 230 156 C242 130 222 92 186 96Z" fill="${mask}" ${st()}/>
    <path d="M176 112 Q186 122 196 112" fill="none" stroke="${OL}" stroke-width="2.4"/>
    <circle cx="160" cy="132" r="14" fill="#fff" ${st(2.6)}/><circle cx="160" cy="132" r="14" fill="none" stroke="${GOLD}" stroke-width="4" opacity=".95"/>${eye(160, 132, 9.5)}<circle cx="212" cy="132" r="14" fill="#fff" ${st(2.6)}/><circle cx="212" cy="132" r="14" fill="none" stroke="${GOLD}" stroke-width="4" opacity=".95"/>${eye(212, 132, 9.5)}
    <path d="M140 112 L174 122 M232 112 L198 122" stroke="#7a4a1f" stroke-width="6" stroke-linecap="round"/>${blush(142, 158, 9)}${blush(230, 158, 9)}
    <ellipse cx="186" cy="152" rx="6" ry="4.4" fill="#b8734a" ${st(2)}/><path d="M164 168 Q186 190 208 168 Q186 178 164 168Z" fill="#7a2a2e" ${st(3)}/><path d="M172 172 h28 l-4 7 h-20Z" fill="#fff"/>
    <path d="M128 108 C120 84 150 70 186 74 C222 70 252 84 244 108" fill="none" stroke="${OL}" stroke-width="15" stroke-linecap="round"/><path d="M128 108 C120 84 150 70 186 74 C222 70 252 84 244 108" fill="none" stroke="${GOLD}" stroke-width="9" stroke-linecap="round"/><circle cx="186" cy="74" r="9" fill="#E5334A" ${st(2.6)}/>
    <path d="M150 78 C120 50 84 40 66 8 C98 12 140 36 160 74Z" fill="#E5334A" ${st(3)}/><path d="M150 76 C124 52 100 40 80 18" fill="none" stroke="${GOLD}" stroke-width="3"/><path d="M222 78 C250 50 286 38 304 6 C272 12 232 38 214 74Z" fill="#E5334A" ${st(3)}/><path d="M222 76 C248 52 272 40 292 16" fill="none" stroke="${GOLD}" stroke-width="3"/>
    </svg>`;
  })();

  HERO.anubis = (() => {
    const bk = '#2F2B45', bk2 = '#4A4566';
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 440" overflow="visible"><defs><clipPath id="akl"><path d="M122 296 L238 296 L258 404 L102 404Z"/></clipPath></defs>
    <ellipse cx="180" cy="416" rx="120" ry="12" fill="rgba(20,10,40,.4)"/>
    <rect x="132" y="386" width="34" height="26" rx="10" fill="${bk}" ${st()}/><rect x="194" y="386" width="34" height="26" rx="10" fill="${bk}" ${st()}/><path d="M126 410 h46 M188 410 h46" stroke="${GOLD}" stroke-width="5" stroke-linecap="round"/>
    <path d="M122 296 L238 296 L258 404 L102 404Z" fill="#F6EEDC" ${st()}/><g clip-path="url(#akl)">${[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => `<path d="M${112 + i * 17} 296 L${96 + i * 20} 404" stroke="#D9CBAA" stroke-width="3"/>`).join('')}</g><path d="M122 296 L238 296 L258 404 L102 404Z" fill="none" ${st()}/>
    <path d="M118 286 H242 V306 H118Z" fill="${GOLD}" ${st()}/><path d="M180 306 L196 306 L190 350 L180 358 L170 350 L164 306Z" fill="#3B6FD6" ${st(2.6)}/><path d="M172 310 h16" stroke="${GOLD}" stroke-width="3"/>
    <path d="M130 214 Q180 196 230 214 L238 290 H122Z" fill="${bk}" ${st()}/>
    <path d="M110 200 Q180 170 250 200 Q256 244 238 276 Q180 300 122 276 Q104 244 110 200Z" fill="${GOLD}" ${st()}/>${[[0, 3], [1, 4], [2, 5]].map(([i]) => `<path d="M${116 + i * 4} ${212 + i * 22} Q180 ${186 + i * 22} ${244 - i * 4} ${212 + i * 22}" fill="none" stroke="${['#3B6FD6', '#E5334A', '#3DAE5B'][i]}" stroke-width="6" stroke-dasharray="3 6"/>`).join('')}<path d="M110 200 Q180 170 250 200" fill="none" stroke="${GOLD2}" stroke-width="3"/>
    ${limb(116, 218, 82, 290, 26, bk)}<circle cx="80" cy="294" r="14" fill="${bk2}" ${st()}/>
    <path d="M62 334 C62 296 98 296 98 334 C98 352 80 360 80 380 M62 346 H98" fill="none" stroke="${OL}" stroke-width="13" stroke-linecap="round"/><path d="M62 334 C62 296 98 296 98 334 C98 352 80 360 80 380 M62 346 H98" fill="none" stroke="${GOLD}" stroke-width="7" stroke-linecap="round"/>
    ${limb(244, 218, 280, 280, 26, bk)}<circle cx="282" cy="284" r="14" fill="${bk2}" ${st()}/>
    <path d="M282 430 V120" stroke="${OL}" stroke-width="14" stroke-linecap="round"/><path d="M282 430 V120" stroke="${GOLD}" stroke-width="8" stroke-linecap="round"/><path d="M282 430 l-12 12 M282 430 l12 12" stroke="${OL}" stroke-width="6" stroke-linecap="round"/>
    <path d="M282 128 C262 110 262 82 282 70 C302 82 302 110 282 128Z" fill="${GOLD}" ${st()}/><path d="M270 80 L262 54 M294 80 L302 54" stroke="${OL}" stroke-width="6" stroke-linecap="round"/><path d="M270 80 L262 54 M294 80 L302 54" stroke="${GOLD}" stroke-width="3" stroke-linecap="round"/>
    <path d="M328 40 q-18 40 6 64" fill="none" stroke="${OL}" stroke-width="3"/><path d="M328 40 C346 56 340 88 334 104 C326 84 318 62 328 40Z" fill="#fff" ${st(2.4)}/>
    <path d="M142 80 L116 -22 L170 56Z" fill="${bk}" ${st()}/><path d="M218 80 L244 -22 L190 56Z" fill="${bk}" ${st()}/><path d="M141 62 L126 8 L158 52Z" fill="#F3B6A8"/><path d="M219 62 L234 8 L202 52Z" fill="#F3B6A8"/><path d="M130 22 l20 12 M230 22 l-20 12" stroke="${GOLD}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="180" cy="116" r="58" fill="${bk}" ${st()}/>
    <path d="M148 116 C148 160 156 196 180 196 C204 196 212 160 212 116Z" fill="${bk2}" ${st()}/><path d="M164 176 Q180 186 196 176" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity=".6"/>
    <ellipse cx="180" cy="150" rx="15" ry="11" fill="#14101f" ${st(2.4)}/><ellipse cx="175" cy="146" rx="4.4" ry="2.6" fill="#fff" opacity=".8"/>
    <path d="M142 120 C128 104 118 110 112 112 M218 120 C232 104 242 110 248 112" fill="none" stroke="#14101f" stroke-width="5" stroke-linecap="round"/>
    <ellipse cx="156" cy="118" rx="17" ry="14" fill="#fff" ${st(3.4)}/><circle cx="156" cy="118" r="9.4" fill="#4a3426"/><circle cx="152" cy="114" r="3.8" fill="#fff"/><circle cx="160" cy="122" r="2" fill="#fff"/>
    <ellipse cx="204" cy="118" rx="17" ry="14" fill="#fff" ${st(3.4)}/><circle cx="204" cy="118" r="9.4" fill="#4a3426"/><circle cx="200" cy="114" r="3.8" fill="#fff"/><circle cx="208" cy="122" r="2" fill="#fff"/>
    <path d="M138 100 q18 -10 36 0 M186 100 q18 -10 36 0" fill="none" stroke="${GOLD}" stroke-width="3.4" stroke-linecap="round"/>${blush(136, 152, 8)}${blush(224, 152, 8)}
    <path d="M130 84 Q180 60 230 84" fill="none" stroke="${OL}" stroke-width="12" stroke-linecap="round"/><path d="M130 84 Q180 60 230 84" fill="none" stroke="${GOLD}" stroke-width="7" stroke-linecap="round"/><path d="M180 64 l-9 -4 q0 -14 9 -14 q9 0 9 14Z" fill="#3B6FD6" ${st(2.4)}/>
    </svg>`;
  })();

  // ───────── 특수 능력 아이콘 48×48 ─────────
  const S3 = `stroke="${OL}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"`;
  ICON.poseidon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M3 30 C8 14 20 8 30 14 C26 16 24 20 26 24 C30 22 36 24 38 30 C30 28 24 32 22 38 C14 36 6 36 3 30Z" fill="#58C4E8" ${S3}/><path d="M12 28 C16 22 22 20 28 22" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"/><path d="M34 6 V30 M28 10 Q28 20 34 22 Q40 20 40 10" fill="none" stroke="${GOLD}" stroke-width="3.4" stroke-linecap="round"/></svg>`;
  ICON.dragon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M6 36 C6 22 20 22 20 34 M20 26 C20 12 36 12 36 26 C36 36 28 40 28 40" fill="none" stroke="#2FA39B" stroke-width="8" stroke-linecap="round"/><path d="M6 36 C6 22 20 22 20 34 M20 26 C20 12 36 12 36 26 C36 36 28 40 28 40" fill="none" stroke="${OL}" stroke-width="2" stroke-linecap="round" opacity=".5"/>${[[12, 24], [30, 14], [22, 22]].map(([x, y]) => `<path d="M${x - 4} ${y + 3} L${x} ${y - 5} L${x + 4} ${y + 3}Z" fill="#E5334A" ${S3}/>`).join('')}<path d="M36 26 q8 -2 8 4" fill="none" stroke="${GOLD}" stroke-width="3" stroke-linecap="round"/></svg>`;
  ICON.wukong = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M40 6 L10 42" stroke="${OL}" stroke-width="9" stroke-linecap="round"/><path d="M40 6 L10 42" stroke="#E5334A" stroke-width="5" stroke-linecap="round"/><path d="M41 5 l-3 3 M12 40 l-3 3" stroke="${GOLD}" stroke-width="7" stroke-linecap="round"/>${[[10, 10], [14, 30], [34, 36]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.4" fill="#C98F4F" ${S3}/><circle cx="${x}" cy="${y + 1}" r="3" fill="#F7D0A5"/>`).join('')}</svg>`;
  ICON.anubis = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path d="M24 6 V40 M10 14 H38" stroke="${OL}" stroke-width="7" stroke-linecap="round"/><path d="M24 6 V40 M10 14 H38" stroke="${GOLD}" stroke-width="3.6" stroke-linecap="round"/><path d="M10 14 L4 28 H16Z M38 14 L32 28 H44Z" fill="#F6EEDC" ${S3}/><path d="M16 42 H32" stroke="${OL}" stroke-width="5" stroke-linecap="round"/><path d="M16 42 H32" stroke="${GOLD}" stroke-width="2.4" stroke-linecap="round"/><circle cx="24" cy="6" r="3.4" fill="#3B6FD6" ${S3}/></svg>`;
  root.MythArt = { BG, HERO, ICON };
})(window);
