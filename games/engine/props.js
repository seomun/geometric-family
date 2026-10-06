/* 꾸미기 소품 (코드 SVG) — id 로 관리: 래스터 그림으로 바꾸고 싶으면 GF.props[id].src 만 채우면 된다(svg 보다 우선).
   각 소품: slot(자리) · ref(크기 기준) · k(기준 대비 가로 비율) · ar(세로/가로) · ax,ay(소품 안의 붙는 점, 0~1) · to(캐릭터의 어느 자리에 붙나: data/anchors.json)
   ref: 'body'=몸 가로폭 · 'neck'=목 높이 몸폭 · 'eye'=두 눈 사이 간격 */
(function () {
  const K = '#4A3030';
  const S = (h, inner) => `<svg viewBox="0 0 100 ${h}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><g stroke="${K}" stroke-width="3.4" stroke-linejoin="round" stroke-linecap="round">${inner}</g></svg>`;
  const star = (cx, cy, R, r, fill) => { let d = ''; for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r : R; d += (i ? 'L' : 'M') + (cx + q * Math.cos(a)).toFixed(1) + ' ' + (cy + q * Math.sin(a)).toFixed(1); } return `<path d="${d}z" fill="${fill}"/>`; };
  const P = {
    hat_party: { slot: 'hat', ref: 'body', k: 0.6, ar: 1.25, ax: 0.5, ay: 0.93, to: 'hat', z: 5,
      svg: S(125, '<path d="M50 8L90 110H10z" fill="#FF8FA8"/><path d="M31 66h38M23 88h54" stroke="#fff" stroke-width="7" opacity=".85" fill="none"/><rect x="6" y="104" width="88" height="12" rx="6" fill="#8FD3F4"/><circle cx="50" cy="10" r="9" fill="#FFD36B"/>') },
    hat_crown: { slot: 'hat', ref: 'body', k: 0.62, ar: 0.72, ax: 0.5, ay: 0.95, to: 'hat', z: 5,
      svg: S(72, '<path d="M8 64V20l22 22 20-30 20 30 22-22v44z" fill="#FFC933"/><rect x="8" y="56" width="84" height="12" rx="4" fill="#E0A200"/><circle cx="8" cy="18" r="6" fill="#FF6B6B"/><circle cx="50" cy="10" r="6" fill="#4DABF7"/><circle cx="92" cy="18" r="6" fill="#6CCB8A"/><circle cx="30" cy="44" r="4" fill="#fff"/><circle cx="70" cy="44" r="4" fill="#fff"/>') },
    hat_ribbon: { slot: 'hat', ref: 'body', k: 0.52, ar: 0.62, ax: 0.5, ay: 0.8, to: 'hat', z: 5,
      svg: S(62, '<path d="M50 32C32 6 4 8 8 34c3 20 26 22 42-2z" fill="#FF8FA8"/><path d="M50 32C68 6 96 8 92 34c-3 20-26 22-42-2z" fill="#FF8FA8"/><path d="M20 22q8 4 12 14M80 22q-8 4-12 14" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/><circle cx="50" cy="32" r="9" fill="#FF5E86"/>') },
    face_glasses: { slot: 'face', ref: 'eye', k: 2.6, ar: 0.42, ax: 0.5, ay: 0.5, to: 'face', z: 4, maxBody: 0.86,
      svg: S(42, '<circle cx="27" cy="21" r="17" fill="#fff" fill-opacity=".35"/><circle cx="73" cy="21" r="17" fill="#fff" fill-opacity=".35"/><path d="M43 20q7-6 14 0M10 18L2 14M90 18l8-4" fill="none"/>') },
    face_shades: { slot: 'face', ref: 'eye', k: 2.6, ar: 0.42, ax: 0.5, ay: 0.5, to: 'face', z: 4, maxBody: 0.86,
      svg: S(42, '<rect x="9" y="6" width="36" height="30" rx="14" fill="#3A2E39"/><rect x="55" y="6" width="36" height="30" rx="14" fill="#3A2E39"/><path d="M45 18q5-5 10 0M9 14L2 11M91 14l7-3" fill="none"/><path d="M16 14q4-4 10-4M62 14q4-4 10-4" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/>') },
    face_mustache: { slot: 'face', ref: 'eye', k: 1.45, ar: 0.4, ax: 0.5, ay: 0.4, to: 'mouth', z: 4, maxBody: 0.5,
      svg: S(42, '<path d="M50 14C42 4 24 4 6 14c4 16 26 20 44 8 18 12 40 8 44-8C76 4 58 4 50 14z" fill="#6B4F7A"/><path d="M20 14q10 6 24 2M80 14q-10 6-24 2" stroke="#9B7BAE" stroke-width="2.5" fill="none"/>') },
    neck_scarf: { slot: 'neck', ref: 'neck', k: 0.92, ar: 0.62, ax: 0.5, ay: 0.22, to: 'neck', z: 3,
      svg: S(62, '<path d="M64 30l10 28 16-6-8-26z" fill="#FF6B6B"/><path d="M3 8q47 24 94 0v20q-47 22-94 0z" fill="#FF6B6B"/><path d="M20 14v12M38 18v13M56 20v13M74 18v12" stroke="#fff" stroke-width="6" opacity=".85" fill="none"/>') },
    neck_bow: { slot: 'neck', ref: 'body', k: 0.34, ar: 0.55, ax: 0.5, ay: 0.4, to: 'neck', z: 3,
      svg: S(55, '<path d="M50 28L8 6v44z" fill="#4DABF7"/><path d="M50 28L92 6v44z" fill="#4DABF7"/><circle cx="26" cy="28" r="3" fill="#fff" stroke="none"/><circle cx="74" cy="28" r="3" fill="#fff" stroke="none"/><rect x="42" y="18" width="16" height="20" rx="5" fill="#2F7FC0"/>') },
    neck_medal: { slot: 'neck', ref: 'body', k: 0.3, ar: 1.12, ax: 0.5, ay: 0.04, to: 'neck', z: 3,
      svg: S(112, '<path d="M24 4L50 52L76 4" fill="none" stroke="#FF8FA8" stroke-width="13"/><circle cx="50" cy="80" r="26" fill="#FFC933"/>' + star(50, 80, 17, 8, '#fff')) },
    hand_balloon: { slot: 'hand', ref: 'body', k: 0.36, ar: 1.75, ax: 0.5, ay: 0.97, to: 'handR', z: 6,
      svg: S(175, '<path d="M50 100q-6 20 4 34t-4 38" fill="none" stroke="#6B5F70" stroke-width="3"/><ellipse cx="50" cy="52" rx="38" ry="46" fill="#FF6B6B"/><path d="M42 98l8 8 8-8z" fill="#E0505A"/><path d="M28 36q4-14 18-18" fill="none" stroke="#fff" stroke-width="5" opacity=".7"/>') },
    hand_flowers: { slot: 'hand', ref: 'body', k: 0.34, ar: 1.1, ax: 0.5, ay: 0.92, to: 'handL', z: 6,
      svg: S(110, '<path d="M50 104L28 52M50 104L50 40M50 104L72 52" stroke="#4FA85F" stroke-width="5" fill="none"/><g><circle cx="28" cy="44" r="14" fill="#FF8FA8"/><circle cx="28" cy="44" r="5" fill="#FFD36B" stroke="none"/><circle cx="50" cy="30" r="14" fill="#FFD36B"/><circle cx="50" cy="30" r="5" fill="#FF8A1F" stroke="none"/><circle cx="72" cy="44" r="14" fill="#B197FC"/><circle cx="72" cy="44" r="5" fill="#FFD36B" stroke="none"/></g><path d="M34 86L66 86L58 108H42z" fill="#FFF3C2"/>') },
    hand_star: { slot: 'hand', ref: 'body', k: 0.3, ar: 1.75, ax: 0.5, ay: 0.95, to: 'handR', z: 6,
      svg: S(175, '<path d="M50 168V70" stroke="#C98F5A" stroke-width="7" fill="none"/>' + star(50, 44, 38, 17, '#FFD36B') + '<circle cx="50" cy="44" r="6" fill="#fff" stroke="none" opacity=".8"/>') },
  };
  // 배경(카드 뒤)
  const BGS = {
    bg_sky: { slot: 'bg', css: 'linear-gradient(#BFE8FF,#F4FBFF)', deco: '<ellipse cx="22" cy="20" rx="14" ry="6" fill="#fff"/><ellipse cx="78" cy="30" rx="12" ry="5" fill="#fff"/>' },
    bg_sunset: { slot: 'bg', css: 'linear-gradient(#FFB88C,#FFE3EC)', deco: '<circle cx="74" cy="28" r="11" fill="#FFD36B"/>' },
    bg_night: { slot: 'bg', css: 'linear-gradient(#1F2A5C,#4B5C9C)', deco: '<circle cx="78" cy="24" r="9" fill="#FFF3B0"/><circle cx="20" cy="18" r="1.6" fill="#FFF3B0"/><circle cx="40" cy="34" r="1.4" fill="#FFF3B0"/><circle cx="60" cy="14" r="1.6" fill="#FFF3B0"/><circle cx="26" cy="52" r="1.3" fill="#FFF3B0"/>' },
  };
  const SLOT_ITEMS = { hat: ['hat_party', 'hat_crown', 'hat_ribbon'], face: ['face_glasses', 'face_shades', 'face_mustache'], neck: ['neck_scarf', 'neck_bow', 'neck_medal'], hand: ['hand_balloon', 'hand_flowers', 'hand_star'], bg: ['bg_sky', 'bg_sunset', 'bg_night'] };
  GF.props = P; GF.propBGs = BGS; GF.propSlots = SLOT_ITEMS;
  GF.propEl = function (id, widthPx) {           // 소품 요소(가로 widthPx) — src 가 있으면 래스터 우선
    const p = P[id], d = document.createElement('div');
    d.style.cssText = 'position:absolute;width:' + widthPx + 'px;height:' + widthPx * p.ar + 'px;pointer-events:none';
    d.innerHTML = p.src ? '<img src="' + p.src + '" style="width:100%;height:100%;object-fit:contain" draggable="false">' : p.svg.replace('<svg ', '<svg style="width:100%;height:100%;display:block" ');
    return d;
  };
})();
