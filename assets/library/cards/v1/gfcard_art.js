/* 재료 카드 그림 v1 — 100×100 viewBox, 플랫 + 외곽선 #6b5443. 전부 이 저장소에서 새로 그린 SVG(외부 에셋 없음).
   크기는 눈으로 구분: 콩떡(소) 폭 40% · 꿀떡(중) 폭 66% · 무지개떡(대) 폭 88% + 아래 점 1·2·3개. */
(function (root) {
  const L = '#6b5443', S = `stroke="${L}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`, S2 = `stroke="${L}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`;
  const pips = (n) => [38, 50, 62].map((x, i) => `<circle cx="${x}" cy="93" r="3.4" fill="${i < n ? '#F2A91E' : '#F4E7CF'}" ${S2}/>`).join('');
  const shadow = (rx) => `<ellipse cx="50" cy="83" rx="${rx}" ry="${rx * 0.16}" fill="rgba(107,84,67,.18)"/>`;
  const A = {};
  // 콩떡(소): 작은 하얀 반달 돔 + 까만 콩
  A.kongtteok = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${shadow(22)}
    <path d="M30 78 C26 56 36 44 50 44 C64 44 74 56 70 78 Z" fill="#FBF1E1" ${S}/>
    <path d="M36 60 C37 53 42 49 47 48" fill="none" stroke="#fff" stroke-width="3.4" stroke-linecap="round"/>
    ${[[44, 66, -20], [56, 62, 25], [50, 72, 5], [61, 72, -30], [39, 74, 30]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="3.6" ry="2.4" transform="rotate(${r} ${x} ${y})" fill="#5b4a66" ${S2}/>`).join('')}
    ${pips(1)}</svg>`;
  // 꿀떡(중): 동그란 떡 + 꿀 방울 + 깨
  A.kkultteok = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${shadow(34)}
    <path d="M17 76 C10 52 28 30 50 30 C72 30 90 52 83 76 Z" fill="#F7DEA0" ${S}/>
    <path d="M24 60 C26 46 36 38 46 36" fill="none" stroke="#FFF6D8" stroke-width="4" stroke-linecap="round"/>
    <path d="M30 42 C38 34 62 34 70 42 C72 50 68 52 66 58 C64 64 60 62 59 56 C57 66 51 66 50 58 C48 66 42 64 41 55 C38 60 33 58 33 52 C30 50 28 46 30 42 Z" fill="#E69A2A" ${S}/>
    <path d="M38 42 C44 38 52 37 58 39" fill="none" stroke="#FFD27A" stroke-width="3" stroke-linecap="round"/>
    ${[[36, 68, 20], [48, 72, -10], [60, 68, 30], [70, 64, -20], [27, 62, 0]].map(([x, y, r]) => `<ellipse cx="${x}" cy="${y}" rx="2.6" ry="1.6" transform="rotate(${r} ${x} ${y})" fill="#8a5a2c"/>`).join('')}
    ${pips(2)}</svg>`;
  // 무지개떡(대): 넓은 층층이 + 위 면 + 별 사탕 장식
  const band = ['#F4727F', '#F7B45A', '#F6E27A', '#7CCB8C', '#6FB8EE', '#A98BE8'];
  A.mujigae = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${shadow(46)}
    <clipPath id="mjc"><rect x="6" y="50" width="88" height="32" rx="6"/></clipPath>
    <g clip-path="url(#mjc)">${band.map((c, i) => `<rect x="4" y="${50 + i * 5.4}" width="92" height="5.6" fill="${c}"/>`).join('')}</g>
    <rect x="6" y="50" width="88" height="32" rx="6" fill="none" ${S}/>
    <path d="M6 54 C6 40 18 34 30 34 L70 34 C82 34 94 40 94 54 L94 55 L6 55 Z" fill="#FFF1F4" ${S}/>
    <path d="M18 46 C24 38 36 37 44 37" fill="none" stroke="#fff" stroke-width="3.6" stroke-linecap="round"/>
    ${[[34, 45], [50, 42], [66, 45], [78, 47], [24, 49]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="2.1" fill="${band[i]}"/>`).join('')}
    ${pips(3)}</svg>`;
  // 단짝 표식: 톱니 도장 + 네모·동그라미 + 가운데 하트
  A.pair = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <path d="${(() => { let d = ''; for (let i = 0; i < 16; i++) { const a = (i / 16) * Math.PI * 2, b = ((i + 0.5) / 16) * Math.PI * 2; d += (i ? 'L' : 'M') + (50 + 41 * Math.cos(a)).toFixed(1) + ' ' + (50 + 41 * Math.sin(a)).toFixed(1) + 'L' + (50 + 46 * Math.cos(b)).toFixed(1) + ' ' + (50 + 46 * Math.sin(b)).toFixed(1); } return d + 'Z'; })()}" fill="#FFC9D8" ${S}/>
    <circle cx="50" cy="50" r="34" fill="#FFE4EC" ${S2}/>
    <rect x="24" y="47" width="25" height="25" rx="5" fill="#F2B95A" ${S}/>
    <circle cx="64" cy="59" r="13" fill="#7EC8F0" ${S}/>
    <circle cx="30" cy="55" r="1.8" fill="${L}"/><circle cx="42" cy="55" r="1.8" fill="${L}"/><path d="M32 63 q4 4 8 0" fill="none" ${S2}/>
    <circle cx="59" cy="56" r="1.8" fill="${L}"/><circle cx="69" cy="56" r="1.8" fill="${L}"/><path d="M60 63 q4 4 8 0" fill="none" ${S2}/>
    <path d="M50 44 C42 36 36 28 43 24 C47 22 50 25 50 28 C50 25 53 22 57 24 C64 28 58 36 50 44 Z" fill="#E5334A" ${S}/>
    <path d="M44 28 q2 -3 4 -1" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/></svg>`;
  // 도깨비 방망이 3종(속성색)
  const EL = {
    fire: { c: '#E5334A', hi: '#FF8A98', mark: '<path d="M50 20 C56 28 60 31 60 37 C60 42 56 45 50 45 C44 45 40 42 40 37 C40 33 43 31 44 27 C46 31 48 32 49 31 C48 27 48 24 50 20Z" fill="#fff" stroke="#6b5443" stroke-width="1.6" stroke-linejoin="round"/>' },
    water: { c: '#3B6FD6', hi: '#8FB5F5', mark: '<path d="M50 20 C56 29 60 33 60 38 C60 43 56 46 50 46 C44 46 40 43 40 38 C40 33 44 29 50 20Z" fill="#fff" stroke="#6b5443" stroke-width="1.6" stroke-linejoin="round"/>' },
    grass: { c: '#3DAE5B', hi: '#9BE0AE', mark: '<path d="M41 44 C38 30 46 21 60 20 C62 34 55 43 41 44Z" fill="#fff" stroke="#6b5443" stroke-width="1.6" stroke-linejoin="round"/><path d="M42 43 C48 36 53 30 58 24" fill="none" stroke="#6b5443" stroke-width="1.4"/>' },
  };
  for (const k of Object.keys(EL)) {
    const e = EL[k];
    A['club_' + k] = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <g transform="rotate(-32 50 52)">
      <rect x="43" y="54" width="14" height="32" rx="6" fill="#C9965F" ${S}/>
      <path d="M45 66 H55 M45 75 H55" stroke="#9a6b3a" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="50" cy="88" r="6.5" fill="#A8773F" ${S}/>
      <path d="M41 60 C35 50 20 38 22 22 C25 6 75 6 78 22 C80 38 65 50 59 60 Z" fill="${e.c}" ${S}/>
      <path d="M28 30 C27 22 32 15 40 11" fill="none" stroke="${e.hi}" stroke-width="4" stroke-linecap="round"/>
      ${[[24, 28], [76, 28], [32, 44], [68, 44], [50, 9], [35, 13], [65, 13], [50, 55]].map(([x, y]) => `<path d="M${x - 4} ${y + 3} L${x} ${y - 6} L${x + 4} ${y + 3} Z" fill="#FFE9A0" ${S2}/>`).join('')}
      ${e.mark.replace(/translate/g, '')}
    </g></svg>`;
  }
  root.GFCardArt = A;
  if (typeof module !== 'undefined') module.exports = A;
})(typeof window !== 'undefined' ? window : globalThis);
