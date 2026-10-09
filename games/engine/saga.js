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
  /** o: { levels:[{id,chapter,type,tag,idx}], per, stars(id)→0~3, unlocked(id)→bool, onNode(l), onGate(ch,zone), onChest(ch), side:[{icon,text,fn,badge}], avatar:'nemo_dad.joy', kid, last(id), from(id|null), justOpened(ch|null), title(ch), nodeCls, hideStars } */
  S.open = function (parent, o) {
    const D = S.data; if (!D) return null; const kid = !!o.kid, per = D.per, H = D.zoneH, TOP = 90, BOT = 96, Z = D.zones.length, total = Z * H + TOP + BOT;
    const root = el('div', 'sg-root' + (kid ? ' kid' : ''), parent), sc = el('div', 'sg-scroll', root), world = el('div', 'sg-world', sc); world.style.height = total + 'px';
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
      if (!slotImg(`${S.app}:${z.ch}:bg`, 'sg-img', zd)) { const d = el('div', 'sg-hill', zd); d.innerHTML = '<i></i><i></i><i></i>'; }
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
      /* 관문(이야기 책) */
      const gt = el('button', 'sg-gate', zd); gt.style.cssText = `left:${z.gate[0]}%;top:${z.gate[1]}px`; gt.setAttribute('aria-label', 'story'); if (!slotImg(`${S.app}:${z.ch}:gate`, 'sg-img', gt)) gt.textContent = '📖'; if (!kid) el('small', '', gt, '이야기');
      gt.onclick = () => { if (!open) { GF.sfx('hmm'); return; } GF.sfx('page'); o.onGate && o.onGate(z.ch, z); };
      /* 노드 */
      ls.forEach((l, k) => {
        const q = z.nodes[Math.min(k, z.nodes.length - 1)], isOpen = o.unlocked(l.id), st = o.stars(l.id) || 0;
        const b = el('button', 'sg-node ' + (o.nodeCls || '') + (isOpen ? '' : ' off') + (st ? ' done' : '') + (l.tag === 'rest' ? ' rest' : '') + (l.id === cur.id ? ' cur' : '') + (l.type && D.special && D.special.indexOf(l.type) >= 0 ? ' sp' : ''), zd);
        b.style.cssText = `left:${q[0]}%;top:${q[1]}px`; b.dataset.id = l.id; b.setAttribute('aria-label', 'level ' + l.id);
        const ic = TY[l.type]; if (!slotImg(isOpen ? 'node' : 'node_lock', 'sg-bgimg', b)) { /* 코드 그림: CSS 원 */ }
        if (kid) { const t = el('em', 'ty', b); if (!slotImg('type:' + l.type, 'sg-ti', t)) t.textContent = ic || '●'; el('i', 'sg-st', b, '★'.repeat(st) + '☆'.repeat(3 - st)); }
        else { el('span', 'n', b, String(l.id)); if (!o.hideStars) el('i', 'sg-st', b, '★'.repeat(st) + '☆'.repeat(3 - st)); if (ic && l.type !== (D.base || 'x')) el('em', 'ty', b, ic); }
        b.onclick = () => { if (!isOpen) { GF.sfx('hmm'); if (!kid) UK.toast('앞 레벨을 먼저 깨 보세요', parent); else { b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); } return; } GF.sfx('pick'); o.onNode(l); };
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
    const go = UK.btn({ text: kid ? '' : `이어서 · 레벨 ${cur.id}`, icon: 'play', cls: 'green sg-go', onclick: () => { GF.sfx('pick'); o.onNode(cur); } }, el('div', 'sg-gowrap', root)); go.setAttribute('aria-label', 'continue');
    const focus = () => { const p = pos[cur.id]; if (p) sc.scrollTop = Math.max(0, p.y - sc.clientHeight * 0.62); };
    focus(); setTimeout(focus, 40); S.cur = cur; S.pos = pos; S.scroll = sc; S.built = built; S.root = root;
    return root;
  };
})();
