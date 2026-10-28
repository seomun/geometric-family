/* 카드 v2: 영웅 카드 · 아이템 카드 · 보물 카드 3종. v1(gfcard.js·gfcard_art.js)을 먼저 불러온다. */
(function (root) {
  const L = '#6b5443', S = `stroke="${L}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`, S2 = `stroke="${L}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"`;
  const EL = {
    fire: { c: '#E5334A', b: '#FCE3DA', a: '#F7B7A3', n: '불', ic: '<path d="M20 4 C25 11 30 15 30 22 C30 29 26 34 20 34 C14 34 10 29 10 22 C10 18 13 16 14 12 C16 15 18 16 19 15 C18 11 18 8 20 4Z" fill="#fff"/>' },
    water: { c: '#3B6FD6', b: '#DDEAFB', a: '#ABC9F3', n: '물', ic: '<path d="M20 4 C27 14 31 19 31 24 C31 30 26 35 20 35 C14 35 9 30 9 24 C9 19 13 14 20 4Z" fill="#fff"/>' },
    grass: { c: '#3DAE5B', b: '#DEF2DB', a: '#AEDDAA', n: '풀', ic: '<path d="M9 33 C5 18 14 6 31 5 C33 22 25 32 9 33Z" fill="#fff"/><path d="M10 32 C17 24 23 17 29 9" fill="none" stroke="#3DAE5B" stroke-width="2"/>' },
  };
  const SCENE = { forest: '../../oldtale/bg/bg_forest.png', cloud: '../../oldtale/bg/bg_cloud_road.png', newhouse: '../../oldtale/bg/bg_heungbu_newhouse.png' };
  const ORDER = ['B', 'A', 'S', 'SS', 'SSS'];
  const elIcon = (k) => `<svg viewBox="0 0 40 40">${EL[k].ic}</svg>`;
  // o: {g, el, name, img(캐릭터 png), scene(키), power, w, kids}
  function hero(o) {
    const g = o.g || 'B', i = ORDER.indexOf(g), e = EL[o.el || 'grass'], kids = !!o.kids;
    const bg = (g === 'S' || g === 'SS' || g === 'SSS') && o.scene ? `--hbg:url(${SCENE[o.scene] || o.scene})` : '';
    const tp = root.GFCard && root.GFCard.html ? '' : '';
    const base = root.GFCard.html({ g, name: '', art: '', w: o.w || 180, kids: false });
    // v1 틀 조각(코너·윗장식·배지)을 그대로 쓰고, 안쪽 판만 영웅용으로 교체
    const d = document.createElement('div'); d.innerHTML = base; const card = d.firstElementChild;
    card.classList.add('hero'); if (kids) card.classList.add('kids');
    card.style.cssText += `;--elc:${e.c};--elb:${e.b};--ela:${e.a};${bg}`;
    const inn = card.querySelector('.gfc2-in');
    inn.innerHTML = `<div class="hb"></div><div class="rays"></div><div class="glow"></div><div class="hspot"></div><div class="hshadow"></div>
<div class="hch"><img src="${o.img}" alt=""></div>
<div class="hstars">${[0, 1, 2, 3, 4].map((k) => `<i class="${k <= i ? '' : 'off'}"></i>`).join('')}</div>
<div class="elem">${elIcon(o.el || 'grass')}</div>
<div class="hplate"><b>${o.name || ''}</b><span>전투력 ${(o.power || 0).toLocaleString('en-US')}</span></div>`;
    if (g === 'SSS') { const p = document.createElement('div'); p.className = 'hpop'; p.innerHTML = `<img src="${o.pop || o.img}" alt="">`; card.querySelector('.gfc2-frame').after(p); }
    if (kids) { card.querySelector('.gfc2-in').querySelector('.hplate').remove(); card.querySelector('.hstars').remove(); }
    return card.outerHTML;
  }
  // 아이템 카드: o:{g, art(svg), name, el, tag, w, kids}
  function item(o) {
    const g = o.g || 'B', e = o.el && EL[o.el];
    return `<div class="gfi g-${g}${o.kids ? ' kids' : ''}${o.tag ? ' tre' : ''}" style="--w:${o.w || 110}px${e ? `;--elc:${e.c};--ib:${e.b}` : ''}"><div class="gfi-fr"></div>
<div class="gfi-in"><div class="gfi-art">${o.art}</div>${o.tag ? `<span class="gfi-tag">${o.tag}</span>` : ''}${e ? `<div class="gfi-el">${elIcon(o.el)}</div>` : ''}<div class="gfi-nm">${o.name || ''}</div></div><span class="gfi-gem">${g}</span></div>`;
  }
  const T = {};
  T.shield = `<svg viewBox="0 0 100 100"><circle cx="50" cy="52" r="38" fill="#C9965F" ${S}/><path d="M28 24 C40 20 60 20 72 24 M18 44 H82 M20 62 H80 M30 78 C42 82 58 82 70 78" fill="none" stroke="#9a6b3a" stroke-width="2.4" stroke-linecap="round"/><circle cx="50" cy="52" r="38" fill="none" stroke="#E8C25A" stroke-width="5"/><circle cx="50" cy="52" r="38" fill="none" ${S}/><circle cx="50" cy="52" r="13" fill="#E8C25A" ${S}/><circle cx="46" cy="48" r="4" fill="#FFF3C0"/></svg>`;
  T.sandal = `<svg viewBox="0 0 100 100"><ellipse cx="50" cy="86" rx="30" ry="4.5" fill="rgba(107,84,67,.18)"/><path d="M26 76 C14 66 18 36 30 22 C40 12 58 14 62 28 C66 42 62 52 74 62 C84 70 80 82 70 82 H34 C30 82 28 80 26 76Z" fill="#E8C985" ${S}/>${[34, 44, 54, 64].map((y, i) => `<path d="M${20 + i * 2} ${y + 14} Q${40 + i} ${y + 6} ${70 - i * 2} ${y + 16}" fill="none" stroke="#B98A47" stroke-width="2.2" stroke-linecap="round"/>`).join('')}<path d="M34 26 C44 36 52 36 60 28" fill="none" stroke="#E5334A" stroke-width="5" stroke-linecap="round"/><path d="M34 26 C44 36 52 36 60 28" fill="none" stroke="#6b5443" stroke-width="1.4" opacity=".6"/></svg>`;
  T.pouch = `<svg viewBox="0 0 100 100"><path d="M32 30 C14 46 10 70 26 84 C40 92 60 92 74 84 C90 70 86 46 68 30 Z" fill="#E5334A" ${S}/><path d="M30 34 C26 46 24 58 28 70" fill="none" stroke="#FF8A98" stroke-width="4" stroke-linecap="round"/><path d="M32 30 C34 22 42 22 50 26 C58 22 66 22 68 30" fill="#F5C04A" ${S}/><path d="M36 33 Q50 38 64 33" fill="none" ${S2}/><circle cx="50" cy="62" r="13" fill="#F5C04A" ${S}/><path d="M44 62 q6 -9 12 0 q-6 9 -12 0Z" fill="#E5334A" ${S2}/><path d="M42 24 l-8 -10 M58 24 l8 -10" ${S}/></svg>`;
  const ART = root.GFCardArt;
  root.GFCard2 = { hero, item, TREASURE: T, EL, elIcon, SCENE };
})(window);
