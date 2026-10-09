/* 이야기 지도 GF.saga — 10앱이 같은 모양으로 쓰는 사가 맵(허브 D18, games/19_SAGA_MAP.md).
   세로 스크롤, 아래→위 길. 장 = 구역(옛이야기 장소). 구역·길·노드 좌표는 data/maps/<앱>.json, 그림은 전부 슬롯 id(GF.slot('map', id))로만 부른다 — 비어 있으면 코드 그림(임시), 채우면 그 파일로.
   슬롯 id: <앱>:<장>:bg · <앱>:<장>:gate · <앱>:<장>:mark1 · mark2 · sky · node · node_lock · chest · chest_open · path_dot · type:<종류>
   압박 없음: 타이머·잠금 시간·이벤트 카운트다운 없음. 잠긴 구역은 구름이 덮여 있을 뿐이다. 서버 없음. */
(function () {
  'use strict';
  const el = UK.el, S = (GF.saga = { data: null, app: null });
  S.init = (app, data) => { S.app = app; S.data = data || null; };
  /** 내 위치 아바타: 유아=막둥이, 성인=내 도형(Room.me), 없으면 네모 아빠 */
  S.avatar = (kid) => { if (kid) return 'baby.joy'; try { const m = window.Room && Room.me && Room.me(), T = m && Room.data.meTypes && Room.data.meTypes[m.f]; if (T) return T.char; } catch (e) {} return 'nemo_dad.joy'; };
  const slotImg = (id, cls, parent) => { const u = GF.slot('map', id); if (!u) return null; const i = el('img', cls || '', parent); i.alt = ''; i.src = u; i.draggable = false; return i; };
  const TY = { lines: '➖', family: '👪', junk: '🧹', combo: '💥', star: '⭐', limit: '🔢', solo: '🙂', make: '✨', order: '📝', tight: '🧩', clear: '🧹', move: '🚚', kimjang: '🥬', diff: '🔍', odd: '☝️', hidden: '🫣', three: '3️⃣', memory: '🧠', zoom: '🔭', sort: '🧪', pair: '🔗', locked: '🔒', classic: '🀄', goal: '🎯', lock: '🗝️', narrow: '📦', trio: '3️⃣', brush: '🪥', dress: '👕', chew: '🍽️', tidy: '🧸', sleep: '🌙', talk: '💬' };
  /* ---- 구역 임시 배경(코드 SVG): 그 이야기 장소의 실루엣 한 장면. 슬롯 `<앱>:<장>:bg` 가 있으면 그것이 대신한다 ---- */
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
  /** o: { levels:[{id,chapter,type,tag,idx}], per, stars(id)→0~3, unlocked(id)→bool, onNode(l), onGate(ch,zone), onChest(ch), side:[{icon,text,fn,badge}], avatar:'nemo_dad.joy', kid, last(id), from(id|null), justOpened(ch|null), title(ch), nodeCls, hideStars } */
  S.open = function (parent, o) {
    const D = S.data; if (!D) return null; const kid = !!o.kid, per = D.per, H = D.zoneH, TOP = 90, BOT = 150, Z = D.zones.length, total = Z * H + TOP + BOT;
    const root = el('div', 'sg-root' + (kid ? ' kid' : ''), parent), sc = el('div', 'sg-scroll', root), world = el('div', 'sg-world', sc); if (D.tint) root.style.setProperty('--sg-tint', D.tint); world.style.height = total + 'px';
    const sky = el('div', 'sg-sky', world); sky.style.height = TOP + 'px'; slotImg('sky', 'sg-img', sky);
    const byCh = {}; o.levels.forEach((l) => { (byCh[l.chapter] = byCh[l.chapter] || []).push(l); });
    const zoneTop = (zi) => total - BOT - (zi + 1) * H, pos = {};
    const done = (l) => (o.stars(l.id) || 0) > 0;
    D.zones.forEach((z, zi) => { const ls = byCh[z.ch] || []; ls.forEach((l, k) => { const q = z.nodes[Math.min(k, z.nodes.length - 1)]; pos[l.id] = { x: q[0], y: zoneTop(zi) + q[1], zi, k }; }); });
    const firstOpen = (z) => { const ls = byCh[z.ch] || []; return ls.length && o.unlocked(ls[0].id); };
    const cur = (() => { let c = null; o.levels.forEach((l) => { if (!c && o.unlocked(l.id) && !done(l)) c = l; }); return c || o.levels[o.levels.length - 1]; })();
    /* 지난번 위치 기억(기기 안): 위치가 바뀌었으면 아바타가 걸어가고, 새 구역이 열렸으면 구름이 걷힌다 */
    const SK = 'gf:' + S.app + ':saga'; let mem = {}; try { mem = JSON.parse(localStorage.getItem(SK) || '{}') || {}; } catch (e) {}
    const prev = o.levels.find((l) => l.id === mem.cur); if (o.from === undefined && prev && prev.id !== cur.id && prev.id < cur.id) { o.from = prev.id; if (prev.chapter < cur.chapter && o.justOpened === undefined) o.justOpened = cur.chapter; }
    try { localStorage.setItem(SK, JSON.stringify({ cur: cur.id })); } catch (e) {}
    const built = {};
    function build(zi) {
      if (built[zi]) return; built[zi] = 1; const z = D.zones[zi], ls = byCh[z.ch] || [], zd = el('div', 'sg-zone', world), open = firstOpen(z), nd = ls.filter(done).length;
      zd.style.cssText = `top:${zoneTop(zi)}px;height:${H}px;--sg-a:${z.pal[0]};--sg-b:${z.pal[1]}`; zd.dataset.ch = z.ch;
      if (!slotImg(`${S.app}:${z.ch}:bg`, 'sg-img', zd)) { zd.classList.add('tinted'); const d = el('div', 'sg-hill', zd); d.innerHTML = '<i></i><i></i><i></i>' + S.sceneSVG(z.tale, H); }
      /* 길 */
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('class', 'sg-path'); svg.setAttribute('viewBox', `0 0 100 ${H}`); svg.setAttribute('preserveAspectRatio', 'none'); zd.appendChild(svg);
      const mk = (a, b, cls) => { const p = document.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', `M${a[0]} ${a[1]}C${a[0]} ${(a[1] + b[1]) / 2} ${b[0]} ${(a[1] + b[1]) / 2} ${b[0]} ${b[1]}`); p.setAttribute('class', cls); p.setAttribute('vector-effect', 'non-scaling-stroke'); svg.appendChild(p); };
      for (let k = 0; k + 1 < z.nodes.length; k++) mk(z.nodes[k], z.nodes[k + 1], 'sg-seg' + (ls[k] && done(ls[k]) ? ' on' : ''));
      /* 머리글 */
      const hd = el('div', 'sg-hd', zd);
      if (kid) { (z.faces || []).slice(0, 3).forEach((id) => { const i = el('i', 'f', hd); i.style.backgroundImage = `url("${GF.src(id)}")`; }); const dots = el('div', 'dots', hd); for (let k = 0; k < per; k++) el('b', k < nd ? 'on' : '', dots); }
      else { el('b', '', hd, `${z.ch}장 · ${o.title ? o.title(z.ch) : z.title}`); el('span', '', hd, `★ ${ls.reduce((a, l) => a + (o.stars(l.id) || 0), 0)}/${ls.length * 3}`); if (GF.tale && GF.tale.ready) GF.tale.strip(hd, z.ch, nd, ls.length, !open); }
      /* 랜드마크 */
      (z.marks || []).forEach((m, k) => { const d = el('div', 'sg-mark', zd); d.style.cssText = `left:${m.x}%;top:${m.y}px`; if (!slotImg(`${S.app}:${z.ch}:mark${k + 1}`, 'sg-img', d)) d.textContent = m.e; });
      (z.props || []).forEach((m, k) => { const d = el('div', 'sg-prop', zd); d.style.cssText = `left:${m.x}%;top:${m.y}px`; if (!slotImg(`${S.app}:prop${k + 1}`, 'sg-img', d)) d.textContent = m.e; });   // 앱 주제 소품
      /* 관문(이야기 책) */
      const gt = el('button', 'sg-gate', zd);  gt.style.cssText = `left:${z.gate[0]}%;top:${z.gate[1]}px`; gt.setAttribute('aria-label', 'story'); if (!slotImg(`${S.app}:${z.ch}:gate`, 'sg-img', gt)) gt.textContent = '📖'; if (!kid) el('small', '', gt, '이야기');
      if (!kid) { const bd = el('div', 'sg-band', zd); bd.style.cssText = `top:${z.gate[1]}px`; bd.innerHTML = `<b>${z.ch}장</b> ${o.title ? o.title(z.ch) : z.title}`; }
      if (o.noGate) gt.style.visibility = 'hidden';
      gt.onclick = () => { if (!open) { GF.sfx('hmm'); return; } GF.sfx('page'); o.onGate && o.onGate(z.ch, z); };
      /* 노드 */
      ls.forEach((l, k) => {
        const q = z.nodes[Math.min(k, z.nodes.length - 1)], isOpen = o.unlocked(l.id), st = o.stars(l.id) || 0;
        const b = el('button', 'sg-node ' + (o.nodeCls || '') + (isOpen ? '' : ' off') + (st ? ' done' : '') + (l.tag === 'rest' ? ' rest' : '') + (l.id === cur.id ? ' cur' : '') + (l.type && D.special && D.special.indexOf(l.type) >= 0 ? ' sp' : ''), zd);
        b.style.cssText = `left:${q[0]}%;top:${q[1]}px`; b.dataset.id = l.id; b.setAttribute('aria-label', 'level ' + l.id);
        const special = l.type && D.special && D.special.indexOf(l.type) >= 0; if (!slotImg(isOpen ? 'node' : 'node_lock', 'sg-bgimg', b)) { /* 코드 그림: CSS 원 */ }
        if (o.render) { o.render(l, b); } else if (kid) { const t = el('em', 'ty', b); if (!slotImg('type:' + l.type, 'sg-ti', t)) t.textContent = TY[l.type] || '●'; el('i', 'sg-st', b, '★'.repeat(st) + '☆'.repeat(3 - st)); }
        else { el('span', 'n', b, String(l.id)); if (l.label) el('small', 'sg-lb', b, l.label); if (!o.hideStars) el('i', 'sg-st', b, '★'.repeat(st) + '☆'.repeat(3 - st)); if (special) { const t = el('em', 'ty', b); if (!slotImg('type:' + l.type, 'sg-ti', t)) t.innerHTML = UK.icon(TYI[l.type] || 'shapes'); } }
        if (special) { const nm = (o.typeName && o.typeName(l.type)) || TYN[l.type] || l.type; b.title = nm; let lp = 0; b.addEventListener('pointerdown', () => { lp = setTimeout(() => { lp = -1; UK.toast(nm, parent); }, 450); }); ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => b.addEventListener(ev, () => { if (lp > 0) clearTimeout(lp); })); b.addEventListener('click', (e) => { if (lp === -1) { lp = 0; e.stopImmediatePropagation(); } }, true); }
        b.onclick = () => { if (!isOpen) { GF.sfx('hmm'); if (!kid) UK.toast((o.lockedMsg && o.lockedMsg(l)) || '앞 레벨을 먼저 깨 보세요', parent); else { b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); } return; } GF.sfx('pick'); o.onNode(l); };
      });
      /* 보상 상자: 구역의 판을 모두 깼을 때 열림 */
      const all = ls.length && nd >= ls.length, ch = el('button', 'sg-chest' + (all ? ' open' : (open && nd ? ' near' : '')), zd); ch.style.cssText = `left:${z.chest[0]}%;top:${z.chest[1]}px`; ch.setAttribute('aria-label', 'chest');
      if (!slotImg(all ? 'chest_open' : 'chest', 'sg-img', ch)) ch.textContent = all ? '🎁' : '📦'; if (!kid) el('small', '', ch, all ? '열기' : '상자');
      ch.onclick = () => { if (all) { GF.sfx('star'); o.onChest && o.onChest(z.ch); } else { GF.sfx('hmm'); if (!kid) UK.toast(`${ls.length - nd}판을 더 깨면 열려요`, parent); } };
      /* 구름(잠긴 구역) */
      if (!open) { const f = el('div', 'sg-fog' + (o.justOpened === z.ch ? ' lift' : ''), zd); f.innerHTML = '<span>☁️</span><span>☁️</span><span>☁️</span>'; if (o.justOpened === z.ch) { f.style.opacity = '0.6'; setTimeout(() => f.classList.add('go'), 500); } }
    }
    /* 보이는 구역만 만든다(가상 스크롤): 현재 구역 ±1은 바로 */
    const curZ = pos[cur.id] ? pos[cur.id].zi : 0; [curZ - 1, curZ, curZ + 1].forEach((zi) => { if (zi >= 0 && zi < Z) build(zi); });
    const holders = D.zones.map((z, zi) => { const h = el('div', 'sg-hold', world); h.style.cssText = `top:${zoneTop(zi)}px;height:${H}px`; h.dataset.zi = zi; return h; });
    if ('IntersectionObserver' in window) { const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { build(+e.target.dataset.zi); } }), { root: sc, rootMargin: '600px 0px' }); holders.forEach((h) => io.observe(h)); S._io = io; }
    else for (let zi = 0; zi < Z; zi++) build(zi);
    /* 아바타 */
    const me = el('div', 'sg-me', world), av = GF.img(o.avatar || S.avatar(kid)); me.appendChild(av); el('i', 'sh', me);
    const place = (p) => { me.style.left = p.x + '%'; me.style.top = (p.y - 6) + 'px'; };
    const from = o.from && pos[o.from] ? pos[o.from] : null; if (from && pos[cur.id] && from !== pos[cur.id]) { me.style.transition = 'none'; place(from); void me.offsetWidth; setTimeout(() => { me.style.transition = ''; place(pos[cur.id]); }, 600); } else if (pos[cur.id]) place(pos[cur.id]);
    /* 곁가지 + 이어서 */
    if (o.side && o.side.length) { root.classList.add('rail'); const sd = el('div', 'sg-side', root); o.side.forEach((x) => { const b = el('button', 'sg-rb' + (x.cls ? ' ' + x.cls : ''), sd); b.setAttribute('aria-label', x.text); const ic = el('span', 'ic', b); try { ic.innerHTML = UK.icon(x.icon); } catch (e) { ic.textContent = '•'; } if (!kid) el('small', '', b, x.text); if (x.badge) el('i', 'bd', b, x.badge); b.onclick = () => { GF.sfx('pick'); x.fn(); }; }); }
    const go = UK.btn({ text: kid ? '' : (o.goText ? o.goText(cur) : `이어서 · 레벨 ${cur.id}`), icon: 'play', cls: 'green sg-go', onclick: () => { GF.sfx('pick'); o.onNode(cur); } }, el('div', 'sg-gowrap', root)); go.setAttribute('aria-label', 'continue');
    const focus = () => { const p = pos[cur.id]; if (p) sc.scrollTop = Math.max(0, p.y - sc.clientHeight * 0.42); };
    focus(); setTimeout(focus, 40); S.cur = cur; S.pos = pos; S.scroll = sc; S.built = built; S.root = root;
    return root;
  };
})();
