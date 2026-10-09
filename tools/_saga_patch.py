import pathlib
p = pathlib.Path('games/engine/saga.js'); s = p.read_text(encoding='utf-8')
scene = r'''  /* ---- 구역 임시 배경(코드 SVG): 그 이야기 장소의 실루엣 한 장면. 슬롯 `<앱>:<장>:bg` 가 있으면 그것이 대신한다 ---- */
  const hs = (x, y, w, h, wall, roof) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${wall}"/><path d="M${x - 8} ${y + 2}L${x + w / 2} ${y - h * 0.55}L${x + w + 8} ${y + 2}z" fill="${roof}"/><rect x="${x + w / 2 - 9}" y="${y + h - 30}" width="18" height="30" rx="3" fill="rgba(80,55,40,.45)"/>`;
  const tr = (x, y, k, c) => `<rect x="${x - 4 * k}" y="${y}" width="${8 * k}" height="${26 * k}" fill="#8A6A4A"/><path d="M${x} ${y - 52 * k}L${x + 26 * k} ${y + 6 * k}L${x - 26 * k} ${y + 6 * k}z" fill="${c || '#4E9A5B'}"/>`;
  const cl = (x, y, k) => `<g fill="#fff" opacity=".85"><circle cx="${x}" cy="${y}" r="${14 * k}"/><circle cx="${x + 16 * k}" cy="${y + 4 * k}" r="${11 * k}"/><circle cx="${x - 16 * k}" cy="${y + 5 * k}" r="${10 * k}"/></g>`;
  const mo = (x, y, r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#FFF3B0"/><circle cx="${x + r * 0.35}" cy="${y - r * 0.2}" r="${r * 0.9}" fill="rgba(60,60,110,.35)"/>`;
  const hanok = (x, y, w) => `<rect x="${x}" y="${y}" width="${w}" height="46" fill="#F3E3C8"/><path d="M${x - 16} ${y + 4}Q${x + w / 2} ${y - 44} ${x + w + 16} ${y + 4}z" fill="#5C5560"/><rect x="${x + 8}" y="${y + 14}" width="${w - 16}" height="32" fill="rgba(130,90,60,.35)"/>`;
  const SC = {
    pigs: () => hs(18, 214, 62, 52, '#F2D36B', '#C9A33A') + hs(112, 204, 70, 62, '#B98A5A', '#7A5230') + hs(214, 186, 74, 80, '#D9694C', '#8C3A2C') + '<g stroke="rgba(255,255,255,.4)" stroke-width="2"><path d="M222 214h58M222 232h58M222 250h58"/></g>',
    bears: () => hs(70, 200, 160, 70, '#C98B5B', '#7B4A2C') + '<rect x="196" y="150" width="18" height="40" fill="#8E5B3C"/>' + tr(30, 220, 1) + tr(268, 224, 1.1) + '<circle cx="205" cy="140" r="9" fill="rgba(255,255,255,.7)"/>',
    shoes: () => hs(60, 204, 130, 64, '#B7A0D8', '#6E5A9A') + mo(240, 150, 26) + '<path d="M205 262q10-18 22-6l8 6z M236 262q10-16 20-5l8 5z" fill="#E88A9A"/>',
    kongjwi: () => hanok(24, 200, 150) + '<ellipse cx="236" cy="246" rx="34" ry="30" fill="#B4764B"/><rect x="214" y="206" width="44" height="14" rx="5" fill="#8C5634"/>',
    heungbu: () => hanok(30, 196, 150) + '<circle cx="236" cy="236" r="36" fill="#F2E3A3"/><path d="M236 200q-4-16 14-22" stroke="#4E9A5B" stroke-width="6" fill="none"/>',
    bremen: () => '<rect x="196" y="120" width="60" height="150" fill="#9AA0B4"/><path d="M190 120h72v-14h-12v8h-12v-8h-12v8h-12v-8h-12z" fill="#7C8298"/><rect x="218" y="214" width="16" height="30" rx="8" fill="rgba(60,50,80,.5)"/><path d="M0 290Q120 230 150 270T230 290" stroke="#E8D7A8" stroke-width="22" fill="none"/>' + tr(40, 214, 1, '#3F8A5A') + tr(120, 226, 0.8, '#3F8A5A'),
    hok: () => '<path d="M0 270L80 150l60 100 50-70 110 90z" fill="#8F96B8"/><path d="M50 270L120 180l70 90z" fill="#6E7599"/><circle cx="244" cy="236" r="16" fill="#FFD66B"/><rect x="238" y="206" width="12" height="12" fill="#B07A3E"/>',
    axe: () => '<ellipse cx="150" cy="250" rx="120" ry="34" fill="#7FC6E4"/><ellipse cx="150" cy="246" rx="86" ry="20" fill="#A5DCF2"/>' + tr(28, 200, 1) + tr(274, 196, 1.1) + '<rect x="242" y="236" width="26" height="22" rx="5" fill="#8A6A4A"/>',
    sun: () => mo(220, 150, 44) + hs(40, 220, 110, 50, '#C9A877', '#7A5A3A') + '<g fill="#fff" opacity=".8"><circle cx="30" cy="110" r="2"/><circle cx="90" cy="80" r="2"/><circle cx="150" cy="120" r="2"/><circle cx="270" cy="70" r="2"/></g>',
    ant: () => '<path d="M0 270Q80 210 150 262Q220 214 300 270z" fill="#79C06A"/><path d="M180 270l22-56 22 56z" fill="#B88A5A"/><g stroke="#3F8A4A" stroke-width="4"><path d="M30 270l-6-36M44 270l4-44M60 270l-4-30M258 270l4-40M274 270l-6-34"/></g><ellipse cx="82" cy="248" rx="10" ry="6" fill="#4A3A30"/>',
    pino: () => hs(40, 210, 120, 56, '#E8B88A', '#B0663A') + '<circle cx="226" cy="214" r="16" fill="#E6B678"/><rect x="214" y="230" width="24" height="36" rx="4" fill="#C98A52"/><path d="M228 214l26 2" stroke="#C98A52" stroke-width="5"/>',
    jack: () => cl(60, 110, 1.4) + cl(220, 150, 1.2) + '<path d="M150 280C110 230 190 210 150 160S190 90 140 40" stroke="#4E9A5B" stroke-width="14" fill="none" stroke-linecap="round"/><path d="M146 168l-36-12M158 210l40-8" stroke="#4E9A5B" stroke-width="10"/>',
    gyeonwoo: () => '<g fill="#fff" opacity=".9"><circle cx="30" cy="120" r="2.5"/><circle cx="90" cy="90" r="2"/><circle cx="160" cy="130" r="3"/><circle cx="240" cy="100" r="2.5"/><circle cx="270" cy="170" r="2"/></g><path d="M0 250Q150 160 300 250" stroke="#E7DDF8" stroke-width="16" fill="none" opacity=".9"/><rect x="0" y="262" width="300" height="20" fill="#9AA6E0" opacity=".8"/>',
    ureng: () => '<circle cx="96" cy="240" r="34" fill="#C99A62"/><path d="M96 240m-18 0a18 18 0 1 1 18 18" stroke="#8A6234" stroke-width="5" fill="none"/><path d="M70 270q-10-24 6-30" stroke="#E4C28E" stroke-width="10" fill="none" stroke-linecap="round"/><g stroke="#C9B24A" stroke-width="4"><path d="M190 270v-70M210 270v-82M230 270v-74M250 270v-80M270 270v-64"/></g>',
    hare: () => '<path d="M0 280Q150 200 300 270" stroke="#E8D7A8" stroke-width="30" fill="none"/><rect x="236" y="168" width="6" height="90" fill="#8A6A4A"/><path d="M242 170h40v26h-40z" fill="#FF8FA3"/>' + tr(40, 214, 0.9, '#4E9A5B'),
    brothers: () => '<path d="M30 268q42-84 84 0z" fill="#E3C46B"/><path d="M170 268q46-92 92 0z" fill="#D9B24E"/>' + mo(160, 110, 28),
    snowqueen: () => '<rect x="90" y="170" width="120" height="100" fill="#DCE8F7"/><path d="M80 170l30-70 20 50 20-70 20 70 20-50 30 70z" fill="#B8CCE8"/><rect x="138" y="220" width="24" height="50" rx="12" fill="rgba(80,100,150,.45)"/><g fill="#fff" opacity=".9"><circle cx="30" cy="190" r="3"/><circle cx="60" cy="130" r="2.5"/><circle cx="250" cy="150" r="3"/><circle cx="270" cy="230" r="2.5"/></g>',
  };
  S.sceneSVG = (tale, H) => `<svg class="sg-scene" viewBox="0 0 300 ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0 ${Math.round(H * 0.42)})" opacity=".5">${(SC[tale] || SC.pigs)()}</g></svg>`;
  /* 판 종류 작은 그림(키트 아이콘) + 길게 누르면 나오는 이름 */
  const TYI = { family: 'heart', pair: 'heart', trio: 'heart', junk: 'brush', clear: 'brush', combo: 'gift', order: 'gift', kimjang: 'gift', star: 'star', odd: 'star', goal: 'star', locked: 'lock', lock: 'lock', limit: 'info', tight: 'info', narrow: 'info', hidden: 'info', memory: 'info', zoom: 'info', solo: 'shapes', three: 'shapes', move: 'next' };
  const TYN = { family: '세 가족 규칙', pair: '짝 규칙', trio: '셋 규칙', junk: '판 치우기', clear: '판 치우기', combo: '한꺼번에', order: '주문', kimjang: '김장', star: '반짝 칸', odd: '다른 하나', goal: '목표 모으기', locked: '잠긴 칸', lock: '자물쇠', limit: '횟수 제한', tight: '좁은 판', narrow: '작은 바구니', hidden: '숨은 것', memory: '기억', zoom: '확대', solo: '한 종류만', three: '세 곳', move: '이사' };
'''
assert '  /** o: { levels:' in s
s = s.replace('  /** o: { levels:', scene + '  /** o: { levels:', 1)
a = "if (!slotImg(`${S.app}:${z.ch}:bg`, 'sg-img', zd)) { const d = el('div', 'sg-hill', zd); d.innerHTML = '<i></i><i></i><i></i>'; }"
assert a in s
s = s.replace(a, "if (!slotImg(`${S.app}:${z.ch}:bg`, 'sg-img', zd)) { const d = el('div', 'sg-hill', zd); d.innerHTML = '<i></i><i></i><i></i>' + S.sceneSVG(z.tale, H); }", 1)
a = "      gt.onclick = () => { if (!open)"
assert a in s
s = s.replace(a, "      if (!kid) { const bd = el('div', 'sg-band', zd); bd.style.cssText = `top:${z.gate[1]}px`; bd.innerHTML = `<b>${z.ch}장</b> ${o.title ? o.title(z.ch) : z.title}`; }\n" + a, 1)
i = s.index("        const ic = TY[l.type]; if (!slotImg"); j = s.index("        b.onclick = () => { if (!isOpen)")
newn = r"""        const special = l.type && D.special && D.special.indexOf(l.type) >= 0; if (!slotImg(isOpen ? 'node' : 'node_lock', 'sg-bgimg', b)) { /* 코드 그림: CSS 원 */ }
        if (kid) { const t = el('em', 'ty', b); if (!slotImg('type:' + l.type, 'sg-ti', t)) t.textContent = TY[l.type] || '●'; el('i', 'sg-st', b, '★'.repeat(st) + '☆'.repeat(3 - st)); }
        else { el('span', 'n', b, String(l.id)); if (!o.hideStars) el('i', 'sg-st', b, '★'.repeat(st) + '☆'.repeat(3 - st)); if (special) { const t = el('em', 'ty', b); if (!slotImg('type:' + l.type, 'sg-ti', t)) t.innerHTML = UK.icon(TYI[l.type] || 'shapes'); } }
        if (special) { const nm = (o.typeName && o.typeName(l.type)) || TYN[l.type] || l.type; b.title = nm; let lp = 0; b.addEventListener('pointerdown', () => { lp = setTimeout(() => { lp = -1; UK.toast(nm, parent); }, 450); }); ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => b.addEventListener(ev, () => { if (lp > 0) clearTimeout(lp); })); b.addEventListener('click', (e) => { if (lp === -1) { lp = 0; e.stopImmediatePropagation(); } }, true); }
"""
s = s[:i] + newn + s[j:]
p.write_text(s, encoding='utf-8')
c = pathlib.Path('games/engine/saga.css'); t = c.read_text(encoding='utf-8')
if '.sg-band' not in t:
    t += """
.sg-scene { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.sg-band { position: absolute; left: 28%; right: 4%; transform: translateY(-50%); height: 34px; padding: 0 12px; display: flex; align-items: center; gap: 6px; border-radius: 17px; background: #fff; box-shadow: var(--uk-sh); font: 800 calc(14px * var(--uk-fs-k, 1))/1.1 var(--uk-font); color: var(--uk-ink); z-index: 2; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; } .sg-band b { color: #C57A00; }
.sg-mark { width: 92px; height: 92px; line-height: 92px; font-size: 64px; } .sg-mark .sg-img { width: 86px; height: 86px; }
.sg-node .ty svg { width: 16px; height: 16px; display: block; margin: 4px; }
"""
    c.write_text(t, encoding='utf-8')
print('ok')
