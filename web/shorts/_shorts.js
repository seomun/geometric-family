// 쇼츠 공용 화풍 v2 (2026-09-29) — 모든 쇼츠가 이 파일을 쓴다.
// 원칙: 글자는 아주 크게(본문 ≥ 64px, 훅 ≥ 140px @1080폭) · 컷마다 선명한 단색 배경 · 종이 질감/그라데이션 없음
//       캐릭터는 스티커(흰 테두리 + 딱 떨어지는 그림자) · 핵심 단어는 형광펜 · 한 컷에 핵심 하나
// 안전지대: 유튜브 쇼츠 UI 가 하단 ~330px·우측 ~140px 를 가린다 → 중요한 건 y 140~1560, x 60~940
(function (root) {
  const W = 1080, H = 1920;
  const INK2 = '#2b2118';                         // 글자 먹색 (캐릭터 외곽선 INK 와 별개, 가독성용)
  const C = { yellow: '#ffd84d', cream: '#fff5df', mint: '#bfe6d2', sky: '#cfe2f7', peach: '#ffd2b5',
              pink: '#ffb3c7', navy: '#24324f', hlY: '#ffe066', hlP: '#ff9fbd', hlB: '#9fd3ff' };
  const HEAD = "font-family:'Black Han Sans',sans-serif", BODY = "font-family:'Jua',sans-serif";
  const FONTS = 'https://fonts.googleapis.com/css2?family=Black+Han+Sans&family=Jua&display=swap';

  const DEFS = `<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
    <filter id="sticker" x="-15%" y="-15%" width="130%" height="130%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="9" result="o"/>
      <feFlood flood-color="#fff"/><feComposite in2="o" operator="in" result="white"/>
      <feOffset in="o" dx="10" dy="12" result="so"/><feFlood flood-color="${INK2}" flood-opacity=".9"/>
      <feComposite in2="so" operator="in" result="shadow"/>
      <feMerge><feMergeNode in="shadow"/><feMergeNode in="white"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter></defs></svg>
    <style>
      /* 움직임 — 주기는 모두 2초의 약수(0.5·1·2초). 내보내기가 2초(60장)를 찍고 영상에서 반복한다.
         엇박자는 음수 delay 로 (예: style="animation-delay:-.2s") */
      .a-bob, .a-slow, .a-chew, .a-wiggle, .a-flicker { transform-box: fill-box; transform-origin: 50% 100%; }
      .a-bob { animation: a-bob .5s ease-in-out infinite alternate; }          /* 들썩들썩 (1초) */
      .a-slow { animation: a-bob 1s ease-in-out infinite alternate; }          /* 느린 숨 (2초) */
      .a-chew { animation: a-chew .25s ease-in-out infinite alternate; }       /* 오물오물 (0.5초) */
      .a-wiggle { transform-origin: 50% 50%; animation: a-wiggle .5s ease-in-out infinite alternate; }  /* 흔들 (1초) */
      .a-flicker { animation: a-flicker .25s ease-in-out infinite alternate; } /* 촛불 (0.5초) */
      .a-steam { animation: a-steam 1s linear infinite; }                      /* 김 (1초) */
      @keyframes a-bob { from { transform: translateY(0) scale(1, 1); } to { transform: translateY(-12px) scale(1.02, .98); } }
      @keyframes a-chew { from { transform: scale(1, 1); } to { transform: scale(1.03, .95); } }
      @keyframes a-wiggle { from { transform: rotate(-4deg); } to { transform: rotate(4deg); } }
      @keyframes a-flicker { from { transform: scale(.85, .9); } to { transform: scale(1.1, 1.12); } }
      @keyframes a-steam { from { transform: translateY(0); opacity: .7; } to { transform: translateY(-40px); opacity: 0; } }
    </style>`;
  const ANIM_LOOP_MS = 2000;   // 내보내기 루프 길이

  const esc = (t) => String(t);
  // 글자: 흰 외곽선을 글자 뒤에 깔아 어떤 배경에서도 읽힌다
  const T = (x, y, t, size, { font = BODY, fill = INK2, anchor = 'middle', outline = 0, rot = 0, extra = '' } = {}) =>
    `<text x="${x}" y="${y}" text-anchor="${anchor}" font-size="${size}" style="${font}" fill="${fill}"` +
    (outline ? ` stroke="#fff" stroke-width="${outline}" stroke-linejoin="round" paint-order="stroke"` : '') +
    (rot ? ` transform="rotate(${rot} ${x} ${y})"` : '') + ` ${extra}>${esc(t)}</text>`;
  // 큰 제목 줄들
  const head = (lines, y, size = 150, o = {}) =>
    lines.map((t, i) => T(o.x ?? W / 2, y + i * size * 1.15, t, size, { font: HEAD, outline: 16, ...o })).join('');
  // 형광펜 — 손으로 그은 듯 살짝 기울고 끝이 둥글다
  const hl = (cx, cy, w, h, color = C.hlY, rot = -2) =>
    `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="${h * 0.35}" fill="${color}" transform="rotate(${rot} ${cx} ${cy})"/>`;
  const sticker = (svg) => `<g filter="url(#sticker)">${svg}</g>`;
  // 알약 버튼 (투표 선택지)
  const pill = (cx, cy, t, size = 64, color = '#fff') => { const w = t.length * size * 0.95 + 70, h = size * 1.6;
    return `<rect x="${cx - w / 2 + 8}" y="${cy - h / 2 + 10}" width="${w}" height="${h}" rx="${h / 2}" fill="${INK2}"/>` +
      `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="${h / 2}" fill="${color}" stroke="${INK2}" stroke-width="7"/>` +
      T(cx, cy + size * 0.36, t, size, { font: BODY }); };
  // 출처 — 작아도 읽히게 44px, 반투명 띠 위
  const src = (t, y = 1500) => `<rect x="60" y="${y - 44}" width="${W - 200}" height="64" rx="14" fill="#fff" opacity=".75"/>` +
    T(60 + (W - 200) / 2, y, t, 40, { font: BODY, fill: '#5a4a3c' });
  // 봉투 (금액을 겉에 크게)
  const env = (cx, cy, w, amount, rot = 0) => { const h = w * 0.64;
    return `<g transform="translate(${cx},${cy}) rotate(${rot})"><rect x="${-w / 2}" y="${-h / 2}" width="${w}" height="${h}" rx="10" fill="#fff" stroke="${INK2}" stroke-width="8"/>` +
      `<path d="M${-w / 2},${-h / 2} L0,${h * 0.05} L${w / 2},${-h / 2}" fill="none" stroke="${INK2}" stroke-width="6"/>` +
      T(0, h * 0.38, amount, w * 0.3, { font: HEAD }) + '</g>'; };
  // 생각 구름
  const cloud = (cx, cy, w, h, fill = '#fff') => {
    const bumps = 9, rx = w / 2, ry = h / 2; let d = '';
    for (let i = 0; i < bumps; i++) { const a = (i / bumps) * Math.PI * 2, bx = cx + Math.cos(a) * rx * 0.82, by = cy + Math.sin(a) * ry * 0.78;
      d += `<ellipse cx="${bx}" cy="${by}" rx="${rx * 0.36}" ry="${ry * 0.42}" fill="${fill}" stroke="${INK2}" stroke-width="7"/>`; }
    return d + `<ellipse cx="${cx}" cy="${cy}" rx="${rx * 0.86}" ry="${ry * 0.8}" fill="${fill}"/>`; };

  const frames = [];
  const frame = (bg, inner) => frames.push(`<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"><rect width="${W}" height="${H}" fill="${bg}"/>${inner}</svg>`);
  const mount = () => { document.getElementById('frames').innerHTML = frames.map((f, i) => `<div class="frame" id="f${i + 1}">${f}</div>`).join(''); };
  // 브랜드 꼬리 — 마지막 컷 하단 안전지대 위
  const brand = (y = 1500) => T(W / 2, y, '기하학 가족', 72, { font: HEAD, extra: 'letter-spacing="10"' });

  // 움직임 래퍼: anim('a-bob', svg, -0.2) → 엇박자 delay(초)
  const anim = (cls, svg, delay = 0) => `<g class="${cls}" style="animation-delay:${delay}s">${svg}</g>`;
  root.SH = { W, H, C, INK2, HEAD, BODY, FONTS, DEFS, T, anim, ANIM_LOOP_MS, head, hl, sticker, pill, src, env, cloud, frame, mount, brand };
})(window);
