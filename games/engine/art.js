/* 코드로 그린 그림 (캐릭터 아님): 무(퍼즐), 해·달·별(색칠). id 는 'art.<name>' — GF.src/GF.aspect 가 캐릭터처럼 다룬다. */
(function () {
  const INK = '#4A3030', SW = 7;
  const pol = (cx, cy, r, a) => [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  const f = (n) => Math.round(n * 10) / 10;

  function sun() {
    let rays = '';
    for (let k = 0; k < 8; k++) {
      const a = (k * Math.PI) / 4, p1 = pol(150, 150, 74, a - 0.2), p2 = pol(150, 150, 74, a + 0.2), t = pol(150, 150, 132, a);
      rays += `<path d="M${f(p1[0])} ${f(p1[1])}L${f(t[0])} ${f(t[1])}L${f(p2[0])} ${f(p2[1])}z" fill="#fff"/>`;
    }
    return { w: 300, h: 300, svg: `<g stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round" stroke-linecap="round">${rays}<circle cx="150" cy="150" r="64" fill="#fff"/><circle cx="128" cy="140" r="5" fill="${INK}"/><circle cx="172" cy="140" r="5" fill="${INK}"/><path d="M126 166q24 22 48 0" fill="none"/></g>` };
  }
  const starPath = (cx, cy, R, r) => {
    let d = '';
    for (let i = 0; i < 10; i++) { const p = pol(cx, cy, i % 2 ? r : R, -Math.PI / 2 + (i * Math.PI) / 5); d += (i ? 'L' : 'M') + f(p[0]) + ' ' + f(p[1]); }
    return d + 'z';
  };
  function star() {
    let spokes = '';
    for (let i = 0; i < 5; i++) { const p = pol(150, 160, 56, -Math.PI / 2 + (Math.PI / 5) * (2 * i + 1)); spokes += `M150 160L${f(p[0])} ${f(p[1])}`; }
    return { w: 300, h: 300, svg: `<g stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round" stroke-linecap="round"><path d="${starPath(150, 160, 128, 58)}" fill="#fff"/><path d="${spokes}" fill="none"/></g>` };
  }
  function moon() {
    return { w: 300, h: 300, svg: `<g stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round" stroke-linecap="round"><path d="M190 40A110 110 0 0 0 190 260A140 140 0 0 1 190 40z" fill="#fff"/><path d="${starPath(235, 90, 26, 12)}" fill="#fff"/><path d="${starPath(250, 190, 20, 9)}" fill="#fff"/><path d="${starPath(110, 150, 0.1, 0.05)}" fill="none" stroke="none"/></g>` };
  }
  function radish() {
    return { w: 300, h: 380, svg: `<g stroke="${INK}" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"><path d="M150 120C130 70 90 40 70 50c10 30 40 60 80 70z" fill="#7BD389"/><path d="M150 120C170 60 200 20 225 25c0 35-30 70-75 95z" fill="#6CCB8A"/><path d="M150 120C148 60 150 30 150 20c18 30 14 70 0 100z" fill="#8FDB9A"/><path d="M150 112C70 118 50 220 105 300c25 38 35 62 45 75 10-13 20-37 45-75 55-80 35-182-45-188z" fill="#FFFFFF"/><path d="M72 160C95 170 205 170 228 160" fill="none" stroke="#E4D8F2" stroke-width="10"/><circle cx="118" cy="230" r="8" fill="${INK}" stroke="none"/><circle cx="182" cy="230" r="8" fill="${INK}" stroke="none"/><path d="M130 258q20 18 40 0" fill="none"/><circle cx="100" cy="252" r="12" fill="#FFB3C7" stroke="none"/><circle cx="200" cy="252" r="12" fill="#FFB3C7" stroke="none"/></g>` };
  }
  const BUILD = { sun, moon, star, radish };
  GF.art = {};
  Object.keys(BUILD).forEach((k) => {
    const a = BUILD[k]();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${a.w} ${a.h}" width="${a.w * 2}" height="${a.h * 2}">${a.svg}</svg>`;
    GF.art['art.' + k] = { src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg), w: a.w, h: a.h };
  });
})();
