/* 막둥이 색칠북(유아) — 색칠·번호 색칠·점 잇기·스티커 장면·벽지 만들기·옛이야기 색칠(D13). 페이지는 data/color_pages.json 한 줄(무한 확장).
   완성작은 집(아이 방) 액자가 된다(대표 장면: 액자가 벽에 걸리는 순간). 키트(UK)·공유 룸·GF.story·공통 소리 id 를 처음부터 쓴다. 놀이 UI 에는 글자 없음. */
(function () {
  'use strict';
  let bloomId = 0;
  const el = UK.el, CL = (window.COLOR = { debug: {} });
  const KEY = 'gf:color:v1', INK = '#4A3030';
  const PAL = ['#FF6B6B', '#FFA94D', '#FFD43B', '#69DB7C', '#4DABF7', '#9775FA', '#F783AC', '#A9744F', '#FFFFFF', '#868E96'];
  const TYPES = ['free', 'number', 'trace', 'sticker', 'wall', 'webtoon'];
  const s32 = (b) => '<svg viewBox="0 0 32 32">' + b + '</svg>';
  const TICON = {
    free: () => UK.icon('brush'),
    number: () => s32('<circle cx="9" cy="10" r="7" fill="#FF8FA8"/><circle cx="23" cy="10" r="7" fill="#4DABF7"/><circle cx="16" cy="23" r="7" fill="#FFD43B"/><text x="9" y="14" font-size="10" font-weight="900" text-anchor="middle" fill="#fff">1</text><text x="23" y="14" font-size="10" font-weight="900" text-anchor="middle" fill="#fff">2</text><text x="16" y="27" font-size="10" font-weight="900" text-anchor="middle" fill="#3A2E39">3</text>'),
    trace: () => s32('<path d="M5 24L12 8l8 12 7-14" fill="none" stroke="#6CCB8A" stroke-width="3" stroke-dasharray="1 5" stroke-linecap="round"/><circle cx="5" cy="24" r="3.4" fill="#FF8FA8"/><circle cx="12" cy="8" r="3.4" fill="#FFC933"/><circle cx="20" cy="20" r="3.4" fill="#8FD3F4"/><circle cx="27" cy="6" r="3.4" fill="#B197FC"/>'),
    sticker: () => UK.icon('heart'),
    wall: () => s32('<rect x="3" y="3" width="12" height="12" rx="3" fill="#FF8FA8"/><rect x="17" y="3" width="12" height="12" rx="3" fill="#8FD3F4"/><rect x="3" y="17" width="12" height="12" rx="3" fill="#FFD43B"/><rect x="17" y="17" width="12" height="12" rx="3" fill="#6CCB8A"/>'),
    webtoon: () => UK.icon('book'),
  };
  const uri = (svg) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  let D, X, SV, roomOK = false; const cacheImg = {};
  const blank = () => ({ v: 1, done: {}, tab: 'free' });
  SV = (() => { try { const x = JSON.parse(localStorage.getItem(KEY)); if (x && x.v === 1) return Object.assign(blank(), x); } catch (e) {} return blank(); })();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(SV)); } catch (e) {} };
  const doneCount = () => Object.keys(SV.done).length;
  GF.pill = () => UK.icon('star') + '<span>' + doneCount() + '</span>';
  GF.home = () => { GF.stack = []; GF.go('chome'); }; GF.home2 = GF.home;
  const page = (id) => D.pages.find((p) => p.id === id);

  /* ---------------- 그림 만들기: 룸 아이템 그림·도형 얼굴·장면 ---------------- */
  const FACE = (x, y, k) => `<circle cx="${x - 7 * k}" cy="${y}" r="${2.4 * k}" fill="${INK}"/><circle cx="${x + 7 * k}" cy="${y}" r="${2.4 * k}" fill="${INK}"/><path d="M${x - 5 * k} ${y + 6 * k}q${5 * k} ${5 * k} ${10 * k} 0" fill="none" stroke="${INK}" stroke-width="${2.2 * k}" stroke-linecap="round"/>`;
  function shapeStr(c, t) {
    const big = t >= 2, r = big ? 40 : 30, cx = 50, cy = 52, st = `fill="#F6C28B" stroke="${INK}" stroke-width="3.4" stroke-linejoin="round"`;
    let b = c === 0 ? `<rect x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" rx="12" ${st}/>` : c === 1 ? `<path d="M${cx} ${cy - r - 4}L${cx + r + 6} ${cy + r - 2}H${cx - r - 6}z" ${st}/>` : `<circle cx="${cx}" cy="${cy}" r="${r + 2}" ${st}/>`;
    const fy = c === 1 ? cy + 8 : cy; return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${b}${FACE(cx, fy, big ? 1.15 : 0.9)}<circle cx="${cx - 20}" cy="${fy + 8}" r="5" fill="#FF8FA8" opacity=".0"/></svg>`;
  }
  const parse = (str) => new DOMParser().parseFromString(str, 'image/svg+xml').documentElement;
  function nest(str, x, y, w, h) { const d = parse(str), vb = d.getAttribute('viewBox') || '0 0 100 100'; d.setAttribute('x', x); d.setAttribute('y', y); d.setAttribute('width', w); d.setAttribute('height', h); d.setAttribute('viewBox', vb); d.removeAttribute('xmlns'); return d; }
  function sceneSVG(spec) { const root = parse('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"></svg>'); spec.forEach((it) => { const str = it[0] === 'art' ? RoomArt.make(it[1], '#F6C28B', {}) : shapeStr(it[1], it[2]); const [x, y, w, h] = it[0] === 'art' ? it.slice(2) : it.slice(3); root.appendChild(nest(str, x, y, w, h)); }); return root; }
  const lum = (h) => { h = String(h).trim(); if (h[0] !== '#') return 0.5; if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]; const n = parseInt(h.slice(1, 7), 16); return (0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255; };
  const normHex = (h) => { h = String(h).trim().toUpperCase(); if (h.length === 4) h = '#' + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]; return h; };
  function trace(dots) { const cx = dots.reduce((a, p) => a + p[0], 0) / dots.length, cy = dots.reduce((a, p) => a + p[1], 0) / dots.length, d = (k, ox, oy) => 'M' + dots.map((p) => (cx + (p[0] - cx) * k + ox).toFixed(1) + ' ' + (cy + (p[1] - cy) * k + oy).toFixed(1)).join('L') + 'z'; return { cx, cy, outer: d(1, 0, 0), inner: d(0.5, 0, 0) }; }
  function baseSVG(pg) {
    let root;
    if (pg.art) root = parse(RoomArt.make(pg.art, '#F6C28B', {}));
    else if (pg.shape) root = parse(shapeStr(pg.shape[0], pg.shape[1]));
    else if (pg.scene) root = sceneSVG(pg.scene);
    else if (pg.dots) { const t = trace(pg.dots); root = parse(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"><path d="${t.outer}" fill="#F6C28B" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="${t.inner}" fill="#FFD43B" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>${FACE(t.cx, t.cy - 4, 1.2)}</svg>`); }
    root.removeAttribute('width'); root.removeAttribute('height'); root.setAttribute('preserveAspectRatio', 'xMidYMid meet'); return root;
  }
  /** 칠할 수 있는 칸(밝은 면)에 번호를 붙이고 흰색으로 비운다. 어두운 면(눈·입)은 그대로 */
  function regionize(root) {
    const regions = [], orig = [];
    root.querySelectorAll('path,rect,circle,ellipse,polygon').forEach((n) => {
      const f = n.getAttribute('fill'); if (!f || f === 'none' || f.startsWith('url')) return; if (lum(f) < 0.3 || n.getAttribute('opacity') === '.0') return;
      n.setAttribute('data-r', regions.length); regions.push(n); orig.push(normHex(f)); n.setAttribute('fill', '#FFFFFF');
    });
    return { regions, orig };
  }
  const svgURI = (root) => { const c = root.cloneNode(true); c.setAttribute('xmlns', 'http://www.w3.org/2000/svg'); c.setAttribute('width', 300); c.setAttribute('height', 300); c.querySelectorAll('.num').forEach((x) => x.remove()); return uri(new XMLSerializer().serializeToString(c)); };
  function paintedURI(pg, fills) { const root = baseSVG(pg), R = regionize(root); Object.keys(fills || {}).forEach((i) => R.regions[i] && R.regions[i].setAttribute('fill', fills[i])); return svgURI(root); }
  function stickerSrc(key) { const [k, a, b] = key.split(':'); if (k === 'chr') return GF.src(a); if (k === 'art') return uri(RoomArt.make(a, '#F6C28B', {})); return uri(shapeStr(+a, +b)); }
  function sceneImage(pg, desc) {
    const bg = uri(GF.bgSVG(pg.bg)), deco = (pg.deco || []).map((d) => `<image href="${uri(RoomArt.make(d.art, '#F6C28B', {}))}" x="${d.x - d.w / 2}" y="${d.y - d.w / 2}" width="${d.w}" height="${d.w}" preserveAspectRatio="xMidYMid meet"/>`).join(''), st = (desc.stickers || []).map((s) => `<image href="${stickerSrc(s.k)}" x="${s.x - 36}" y="${s.y - 36}" width="72" height="72" preserveAspectRatio="xMidYMid meet"/>`).join('');
    return uri(`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="30 150 300 330" width="300" height="330"><image href="${bg}" x="0" y="0" width="360" height="640"/>${deco}${st}</svg>`);
  }
  /** 집 액자에 들어갈 그림(완성한 페이지 id → 이미지). 저장된 색/스티커 위치로 다시 그린다 */
  function imageFor(id) {
    if (cacheImg[id]) return cacheImg[id]; const pg = page(id), d = SV.done[id]; if (!pg || !d) return null;
    return (cacheImg[id] = pg.type === 'sticker' ? sceneImage(pg, d) : paintedURI(pg, d.fills));
  }

  /* ---------------- 홈 ---------------- */
  GF.screen('chome', {
    bare: false,
    enter(r) {
      r.classList.add('uk', 'cl'); GF.bg('home', r);
      el('div', 'cl-ttl', r, '<div class="uk-title">막둥이 색칠북</div>');
      const fam = el('div', 'cl-fam', r); ['nemo_kids.kid1', 'baby.joy', 'wife.joy'].forEach((id) => fam.appendChild(GF.img(id)));
      const row = el('div', 'cl-cards', r);
      const first = !SV.intro;
      const c1 = el('button', 'cl-card', row, UK.icon('brush')); c1.style.background = '#FFE0E8'; c1.onclick = () => { GF.sfx('pick'); GF.go('cbook'); };
      const c2 = el('button', 'cl-card', row, UK.icon('home')); c2.style.background = '#FFE3C2'; c2.onclick = () => { GF.sfx('pick'); GF.go('chouse'); };
      if (first) { SV.intro = 1; save(); setTimeout(() => { if (c1.isConnected) UK.finger(r, c1); }, 900); }   // 첫 실행: 붓 → 그림 하나 = 두 번 누르면 색칠
    },
  });

  /* ---------------- 그림 고르기 ---------------- */
  function thumb(pg, btn) {
    const d = SV.done[pg.id];
    if (pg.type === 'sticker') { const i = el('img', '', btn); i.src = d ? imageFor(pg.id) : uri(GF.bgSVG(pg.bg)); }
    else if (pg.type === 'wall') { const w = el('div', '', btn); w.style.cssText = 'width:100%;height:100%;border-radius:14px;' + Room.wallStyle({ pat: pg.pat, bg: pg.bg, fg: pg.fg }); }
    else if (pg.type === 'trace' && !d) { const t = trace(pg.dots); btn.innerHTML = `<svg viewBox="0 0 300 300">${pg.dots.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="12" fill="${['#FF8FA8', '#FFC933', '#8FD3F4', '#B197FC', '#6CCB8A'][i % 5]}"/>`).join('')}</svg>`; }
    else { const i = el('img', '', btn); i.src = d ? imageFor(pg.id) : paintedURI(pg, {}); }
    if (d) { const ck = el('div', 'ck', btn, UK.icon('check')); ck.style.cssText = 'background:#fff;border-radius:50%;box-shadow:var(--uk-sh)'; }
  }
  GF.screen('cbook', {
    bare: false,
    enter(r) {
      r.classList.add('uk', 'cl'); GF.bg('home', r);
      const tabs = el('div', 'cl-tabs', r), grid = el('div', 'cl-grid', r);
      const draw = () => {
        tabs.innerHTML = ''; TYPES.forEach((t) => { const b = el('button', 'cl-tab' + (SV.tab === t ? ' on' : ''), tabs, TICON[t]()); b.setAttribute('aria-label', D.types[t]); b.onclick = () => { SV.tab = t; save(); GF.sfx('pick'); draw(); }; });
        grid.innerHTML = ''; D.pages.filter((p) => p.type === SV.tab).forEach((pg) => { const b = el('button', 'cl-th', grid); thumb(pg, b); b.onclick = () => { GF.sfx('pick'); GF.go(pg.type === 'trace' && !SV.done[pg.id] ? 'ctrace' : pg.type === 'sticker' ? 'csticker' : pg.type === 'wall' ? 'cwall' : 'cpaint', { id: pg.id }); }; });
      };
      draw();
      if (!Object.keys(SV.done).length) setTimeout(() => { const t0 = grid.querySelector('.cl-th'); if (t0 && t0.isConnected) UK.finger(r, t0); }, 700);
    },
  });

  /* ---------------- 색칠(자유·번호·점 잇기 결과·웹툰 컷) ---------------- */
  GF.screen('cpaint', {
    bare: false,
    enter(r, p) {
      r.classList.add('uk', 'cl'); GF.bg('home', r);
      const pg = page(p.id), num = pg.type === 'number', art = el('div', 'cl-art', r), pal = el('div', 'cl-pal', r), acts = el('div', 'cl-acts', r);
      const root = baseSVG(pg), R = regionize(root); art.appendChild(root);
      const fills = {}, hist = []; let color = PAL[0], sel = null;
      let colorable = R.regions.map((_, i) => i); if (num) colorable = colorable.filter((i) => lum(R.orig[i]) < 0.97);   // 번호 색칠: 원래 흰색은 그대로
      const target = new Set(colorable);
      const nums = num ? [...new Set(colorable.map((i) => R.orig[i]))].slice(0, 7) : null;
      if (num) { colorable.forEach((i) => R.regions[i].setAttribute('data-n', nums.indexOf(R.orig[i]) + 1)); R.regions.forEach((n, i) => { if (!target.has(i)) n.removeAttribute('data-r'); }); }
      const swatches = (num ? nums : PAL).map((c, k) => { const b = el('button', 'cl-sw' + (c === '#FFFFFF' ? ' white' : '') + (k === 0 ? ' on' : ''), pal, num ? String(k + 1) : ''); b.style.background = c; if (num) { const m = /#(..)(..)(..)/.exec(c), lum = m ? (0.299 * parseInt(m[1], 16) + 0.587 * parseInt(m[2], 16) + 0.114 * parseInt(m[3], 16)) : 0; if (lum > 150) { b.style.color = '#3A2E39'; b.style.textShadow = '0 0 3px #fff, 0 0 3px #fff'; } }   /* 번호 글자는 칸 색이 밝으면 어둡게(색만으로 구분하지 않도록 번호를 또렷이) */ b.setAttribute('aria-label', '색 ' + (k + 1)); b.onclick = () => { color = c; swatches.forEach((x) => x.classList.remove('on')); b.classList.add('on'); GF.sfx('tap'); }; return b; });
      color = (num ? nums : PAL)[0];
      const filled = () => Object.keys(fills).length;
      const done = UK.round({ icon: 'check', cls: 'lg', label: '완성', onclick: () => complete(false) }, acts), undo = UK.round({ icon: 'replay', cls: 'pink', label: '되돌리기', onclick: () => { const h = hist.pop(); if (!h) return; if (h.prev == null) delete fills[h.i]; else fills[h.i] = h.prev; R.regions[h.i].setAttribute('fill', h.prev || '#FFFFFF'); refresh(); } }, acts);
      acts.insertBefore(undo, done);
      const need = () => (num ? target.size : Math.max(2, Math.ceil(R.regions.length * 0.5)));
      const refresh = () => { done.classList.toggle('dim', filled() < need()); };
      refresh();
      setTimeout(() => { if (!num) return;   // 번호 표시: 칸 안쪽에서 가장 넓은 지점, 칸 크기에 비례한 글자
        const rc = root.getScreenCTM(); if (!rc) return; const inv = rc.inverse();
        colorable.forEach((i) => {
          const n = R.regions[i], bb = n.getBBox(), ctm = n.getScreenCTM(); if (!ctm) return; let best = null, N = 12, step = Math.max(bb.width, bb.height) / 28;
          for (let a = 0; a < N; a++) for (let b = 0; b < N; b++) { const x = bb.x + (a + 0.5) * bb.width / N, y = bb.y + (b + 0.5) * bb.height / N; if (!n.isPointInFill(new DOMPoint(x, y))) continue; let rad = 1e9; for (let k = 0; k < 8; k++) { const dx = Math.cos(k * Math.PI / 4), dy = Math.sin(k * Math.PI / 4); let d = 0; while (d < 400 && n.isPointInFill(new DOMPoint(x + dx * d, y + dy * d))) d += step; rad = Math.min(rad, d); if (best && rad <= best.r) break; } if (!best || rad > best.r) best = { x, y, r: rad }; }
          if (!best) return; const p = new DOMPoint(best.x, best.y).matrixTransform(ctm).matrixTransform(inv), rootR = best.r * (ctm.a / rc.a), fs = Math.max(9, Math.min(22, rootR * 1.15));
          const t = document.createElementNS('http://www.w3.org/2000/svg', 'text'); t.setAttribute('class', 'num'); t.setAttribute('text-anchor', 'middle'); t.setAttribute('x', p.x.toFixed(1)); t.setAttribute('y', (p.y + fs * 0.35).toFixed(1)); t.setAttribute('font-size', fs.toFixed(1)); t.style.fontSize = fs + 'px'; t.style.strokeWidth = Math.max(2, fs / 5) + 'px'; t.textContent = nums.indexOf(R.orig[i]) + 1; root.appendChild(t);
        });
      }, 80);
      let streak = 0, lastFill = 0;
      /* 번짐: 누른 자리에서 색이 동그랗게 퍼져 칸을 채운다(칸 모양으로 잘라서). 끝나면 칸 색이 바뀌고 덮개는 사라진다 */
      const NS = 'http://www.w3.org/2000/svg';
      function bloom(n, ev, col) {
        try {
          const par = n.parentNode, ctm = n.getScreenCTM(); if (!ctm || !par) return; const p = new DOMPoint(ev.clientX, ev.clientY).matrixTransform(ctm.inverse()), bb = n.getBBox(), R0 = Math.hypot(bb.width, bb.height) + 6;
          const id = 'bl' + (++bloomId), cp = document.createElementNS(NS, 'clipPath'); cp.setAttribute('id', id); const cl = n.cloneNode(false); cl.removeAttribute('data-r'); cl.removeAttribute('fill'); cp.appendChild(cl);
          const c = document.createElementNS(NS, 'circle'); c.setAttribute('cx', p.x); c.setAttribute('cy', p.y); c.setAttribute('r', 1); c.setAttribute('fill', col); c.setAttribute('clip-path', 'url(#' + id + ')'); c.style.pointerEvents = 'none';
          par.insertBefore(cp, n.nextSibling); par.insertBefore(c, cp.nextSibling);
          const t0 = performance.now(), D = 240, step = (t) => { const k = Math.min(1, (t - t0) / D); c.setAttribute('r', (R0 * (1 - Math.pow(1 - k, 3))).toFixed(1)); if (k < 1) requestAnimationFrame(step); else { c.remove(); cp.remove(); } }; requestAnimationFrame(step);
        } catch (x) { /* 번짐 효과 실패는 칠하기에 영향 없음 */ }
      }
      root.addEventListener('pointerdown', (e) => {
        const n = e.target.closest && e.target.closest('[data-r]'); if (!n) return; const i = +n.getAttribute('data-r'); e.preventDefault();
        if (num) { if (R.orig[i] !== color) { GF.sfx('hmm'); n.classList.add('cl-shake'); setTimeout(() => n.classList.remove('cl-shake'), 420); return; } }
        hist.push({ i, prev: fills[i] }); fills[i] = color; bloom(n, e, color); n.setAttribute('fill', color); const nowT = performance.now(); streak = nowT - lastFill < 900 ? Math.min(streak + 1, 5) : 0; lastFill = nowT; GF.sfx(num ? 'ok' : 'drop', { st: [0, 2, 4, 7, 9, 12][streak] }); refresh();   // 이어서 칠하면 소리가 한 음씩 올라간다
        if (num && filled() >= target.size) complete(true);
      });
      function complete(auto) {
        if (!auto && filled() < need()) { GF.sfx('hmm'); done.classList.add('cl-shake'); setTimeout(() => done.classList.remove('cl-shake'), 420); return; }
        SV.done[pg.id] = { fills: Object.assign({}, fills) }; delete cacheImg[pg.id]; save(); GF.refreshBar(); finishArt(r, pg);
      }
      CL.debug.fillAll = () => { colorable.forEach((i) => { const c = num ? R.orig[i] : PAL[(i % 8)]; color = c; fills[i] = c; R.regions[i].setAttribute('fill', c); }); complete(true); };
      if (pg.type === 'webtoon' && !p.skipStory) { const st = X.stories[(pg.chapter || 1) - 1]; if (st) { const ov = el('div', 'abs', r); ov.style.cssText = 'inset:0;z-index:60'; GF.story(ov, st.cuts.slice(0, 2).map((c) => ({ bg: 'indoor', text: c.text, chars: c.chars.map((id, k, a) => ({ id, x: a.length > 1 ? 50 + k * (260 / (a.length - 1)) : 180, y: 600 })), bubble: c.bubble ? { type: c.bubble, at: 0 } : null })), () => ov.remove()); } }
    },
  });

  /* ---------------- 완성! 그림이 액자가 되어 집 벽에 걸린다 ---------------- */
  function finishArt(r, pg) {
    let newItems = [];
    if (roomOK) {
      Room.grant('w_frame');
      const hung = Room.placedIn('kid').filter((x) => x.img && !x.drawer), used = new Set(hung.map((x) => x.slot)), k = [0, 1, 2, 3, 4, 5].find((s) => !used.has(s)); let p; if (k != null) { p = Room.place('w_frame', 'kid', 14 + (k % 3) * 104, 6 + ((k / 3) | 0) * 72); p.slot = k; } else { p = Room.place('w_frame', 'kid', 0, 0); p.drawer = 1; } p.img = pg.id; Room.save();   // 벽에는 최대 6개, 나머지는 액자 서랍     // 새 액자 = 이 그림
      Room.data.items.filter((x) => x.needPages && x.needPages <= doneCount()).forEach((x) => { if (Room.grant(x.id)) newItems.push(x); });
    }
    GF.sfx('celebrate');
    const sc = el('div', 'uk-scrim', r), box = el('div', 'cl-hang', sc), wall = SV.wall && SV.wall.kid ? Room.wallStyle(SV.wall.kid) : (Room.S.wall && Room.S.wall.kid ? Room.wallStyle(Room.S.wall.kid) : 'background:#FFF0B8');
    box.style.cssText += ';' + wall; const fr = el('div', 'fr', box), it = Room.item('w_frame'); const im = el('img', '', fr); im.src = Room.src(it, '#8A5A3B', { image: imageFor(pg.id) });
    setTimeout(() => GF.sfx('star'), 700); try { UK.confetti(sc); } catch (e) {}
    const ac = el('div', 'acts', box); UK.round({ icon: 'home', cls: 'lg', onclick: () => { sc.remove(); GF.replace('chouse'); } }, ac); UK.round({ icon: 'next', cls: 'lg gold', onclick: () => { sc.remove(); GF.back(); } }, ac);
    newItems.forEach((x, k) => { const g = el('div', 'kgift', sc), i2 = el('img', '', g); i2.src = Room.src(x, x.colors[0]); g.style.cssText += `;top:${14 + k * 6}%;left:${30 + k * 12}%;width:84px;height:84px;margin:0;animation-delay:${1 + k * 0.4}s`; });
  }

  /* ---------------- 점 잇기 ---------------- */
  GF.screen('ctrace', {
    bare: false,
    enter(r, p) {
      r.classList.add('uk', 'cl'); GF.bg('home', r);
      const pg = page(p.id), art = el('div', 'cl-art', r), dots = pg.dots, svgNS = 'http://www.w3.org/2000/svg'; let idx = 0;
      const root = parse('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300"></svg>'); art.appendChild(root);
      const path = document.createElementNS(svgNS, 'path'); path.setAttribute('fill', 'none'); path.setAttribute('stroke', '#FF6B6B'); path.setAttribute('stroke-width', 7); path.setAttribute('stroke-linecap', 'round'); path.setAttribute('stroke-linejoin', 'round'); root.appendChild(path);
      const cs = dots.map((d, i) => { const g = document.createElementNS(svgNS, 'g'); const c = document.createElementNS(svgNS, 'circle'), t = document.createElementNS(svgNS, 'text'); c.setAttribute('cx', d[0]); c.setAttribute('cy', d[1]); c.setAttribute('r', 15); c.setAttribute('fill', ['#FF8FA8', '#FFC933', '#8FD3F4', '#B197FC', '#6CCB8A'][i % 5]); c.setAttribute('stroke', '#fff'); c.setAttribute('stroke-width', 3); t.setAttribute('x', d[0]); t.setAttribute('y', d[1] + 6); t.setAttribute('text-anchor', 'middle'); t.setAttribute('font-size', 16); t.setAttribute('font-weight', 900); t.setAttribute('fill', '#fff'); t.textContent = i + 1; g.appendChild(c); g.appendChild(t); g.dataset.i = i; root.appendChild(g); return g; });
      const hint = () => { cs.forEach((g, i) => g.firstChild.setAttribute('r', i === idx ? 19 : 15)); }; hint();
      const draw = () => { path.setAttribute('d', 'M' + dots.slice(0, idx).map((d) => d.join(' ')).join('L') + (idx === dots.length ? 'z' : '')); };
      root.addEventListener('pointerdown', (e) => {
        const g = e.target.closest && e.target.closest('g[data-i]'); if (!g) return; const i = +g.dataset.i; e.preventDefault();
        if (i !== idx) { GF.sfx('hmm'); g.classList.add('cl-shake'); setTimeout(() => g.classList.remove('cl-shake'), 420); return; }
        idx++; GF.sfx('pick'); draw(); hint();
        if (idx === dots.length) { GF.sfx('ok'); setTimeout(() => { GF.sfx('star'); GF.replace('cpaint', { id: pg.id }); }, 600); }
      });
      CL.debug.traceAll = () => { for (let k = 0; k < dots.length; k++) root.querySelector(`g[data-i="${k}"]`).dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); };
    },
  });

  /* ---------------- 스티커 장면 ---------------- */
  GF.screen('csticker', {
    bare: false,
    enter(r, p) {
      r.classList.add('uk', 'cl'); const pg = page(p.id); GF.bg(pg.bg, r);
      const scene = el('div', 'cl-scene', r), tray = el('div', 'cl-tray', r), placed = []; let sel = null;
      (pg.deco || []).forEach((d) => { const im = el('img', 'cl-deco', scene); im.src = uri(RoomArt.make(d.art, '#F6C28B', {})); im.style.cssText = `position:absolute;left:${d.x - d.w / 2}px;top:${d.y - d.w / 2}px;width:${d.w}px;height:${d.w}px;object-fit:contain;pointer-events:none`; });   // 배경에 깔리는 고정 장식
      const SW = () => r.getBoundingClientRect().width / 360;
      const done = UK.round({ icon: 'check', cls: 'lg dim', label: '완성', onclick: () => complete() }, r); done.style.cssText += ';position:absolute;right:14px;bottom:112px;z-index:7';
      const bin = UK.round({ icon: 'close', cls: 'gray', label: '지우기', onclick: () => { if (sel != null) { placed[sel].el.remove(); placed.splice(sel, 1); sel = null; GF.sfx('hmm'); refresh(); } } }, r); bin.style.cssText += ';position:absolute;left:14px;bottom:112px;z-index:7';
      const refresh = () => done.classList.toggle('dim', placed.length < 3);
      const addSt = (key, x, y) => { const d = el('div', 'cl-st', scene); d.style.left = x + 'px'; d.style.top = y + 'px'; const i = el('img', '', d); i.src = stickerSrc(key); const o = { k: key, x, y, el: d }; placed.push(o); GF.sfx('drop'); refresh(); bindMove(o); return o; };
      function bindMove(o) { o.el.addEventListener('pointerdown', (e) => { e.preventDefault(); sel = placed.indexOf(o); placed.forEach((q) => q.el.classList.remove('sel')); o.el.classList.add('sel'); const k = SW(), sx = e.clientX, sy = e.clientY, ox = o.x, oy = o.y; try { o.el.setPointerCapture(e.pointerId); } catch (x) {}
        const mv = (ev) => { o.x = Math.max(20, Math.min(340, ox + (ev.clientX - sx) / k)); o.y = Math.max(90, Math.min(540, oy + (ev.clientY - sy) / k)); o.el.style.left = o.x + 'px'; o.el.style.top = o.y + 'px'; }, up = () => { o.el.removeEventListener('pointermove', mv); o.el.removeEventListener('pointerup', up); }; o.el.addEventListener('pointermove', mv); o.el.addEventListener('pointerup', up); }); }
      pg.tray.forEach((key) => { const b = el('button', 'cl-tk', tray); const i = el('img', '', b); i.src = stickerSrc(key);
        b.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse' && e.button !== 0) return; const k = SW(), ghost = el('img', '', document.body); ghost.src = stickerSrc(key); ghost.style.cssText = `position:fixed;width:${72 * k}px;height:${72 * k}px;pointer-events:none;z-index:200;left:${e.clientX - 36 * k}px;top:${e.clientY - 60 * k}px`; GF.sfx('pick');
          const mv = (ev) => { ghost.style.left = ev.clientX - 36 * k + 'px'; ghost.style.top = ev.clientY - 60 * k + 'px'; }, up = (ev) => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); ghost.remove(); const rc = r.getBoundingClientRect(), x = (ev.clientX - rc.left) / k, y = (ev.clientY - rc.top) / k - 24; if (y < 530 && y > 80) addSt(key, x, y); else if (ev.type === 'pointerup' && Math.abs(ev.clientX - e.clientX) < 8 && Math.abs(ev.clientY - e.clientY) < 8) addSt(key, 90 + Math.random() * 180, 200 + Math.random() * 200); }; window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); }); });
      function complete() { if (placed.length < 3) { GF.sfx('hmm'); done.classList.add('cl-shake'); setTimeout(() => done.classList.remove('cl-shake'), 420); return; } SV.done[pg.id] = { stickers: placed.map((o) => ({ k: o.k, x: Math.round(o.x), y: Math.round(o.y) })) }; delete cacheImg[pg.id]; save(); GF.refreshBar(); finishArt(r, pg); }
      CL.debug.addStickers = () => { ['chr:baby.joy', 'art:plant', 'shp:0:2'].forEach((k, i) => addSt(k, 90 + i * 90, 300)); complete(); };
    },
  });

  /* ---------------- 벽지 만들기 ---------------- */
  GF.screen('cwall', {
    bare: false,
    enter(r, p) {
      r.classList.add('uk', 'cl'); GF.bg('home', r);
      const pg = page(p.id), d = Object.assign({ pat: pg.pat, bg: pg.bg, fg: pg.fg }, SV.done[pg.id] && SV.done[pg.id].desc || {}), prev = el('div', 'cl-wp', r), pat = el('div', 'cl-pat', r), pal = el('div', 'cl-pal', r), acts = el('div', 'cl-acts', r); pal.style.top = '404px'; let target = 'fg';
      const show = () => { prev.style.cssText += ';' + Room.wallStyle(d); };
      [0, 1, 2].forEach((k) => { const b = el('button', 'cl-tab' + (d.pat === k ? ' on' : ''), pat, `<svg viewBox="0 0 32 32">${k === 0 ? '<rect x="5" y="5" width="22" height="22" rx="6" fill="#F6C28B"/>' : k === 1 ? '<path d="M16 4L29 27H3z" fill="#8FD3F4"/>' : '<circle cx="16" cy="16" r="12" fill="#B7C2F2"/>'}</svg>`); b.onclick = () => { d.pat = k; [...pat.children].forEach((x, i) => x.classList.toggle('on', i === k)); GF.sfx('pick'); show(); }; });
      const sw2 = [['bg', d.bg], ['fg', d.fg]].map(([t, c]) => { const b = el('button', 'cl-sw' + (t === 'fg' ? ' on' : ''), pat); b.style.background = c; b.onclick = () => { target = t; [...pat.querySelectorAll('.cl-sw')].forEach((x) => x.classList.remove('on')); b.classList.add('on'); GF.sfx('tap'); }; b.dataset.t = t; return b; });
      PAL.forEach((c) => { const b = el('button', 'cl-sw' + (c === '#FFFFFF' ? ' white' : ''), pal); b.style.background = c; b.onclick = () => { d[target] = c; sw2.find((x) => x.dataset.t === target).style.background = c; GF.sfx('drop'); show(); }; });
      show();
      const ok = UK.round({ icon: 'check', cls: 'lg', label: '완성', onclick: () => complete() }, acts);
      function complete() { SV.done[pg.id] = { desc: Object.assign({}, d) }; save(); GF.refreshBar(); if (roomOK) { Room.setWall('kid', d); Room.data.items.filter((x) => x.needPages && x.needPages <= doneCount()).forEach((x) => Room.grant(x.id)); } GF.sfx('celebrate'); GF.sfx('star'); GF.replace('chouse'); }
      CL.debug.wallDone = complete;
    },
  });

  /* ---------------- 집 ---------------- */
  GF.screen('chouse', {
    bare: false,
    enter(r) {
      r.classList.add('uk', 'cl'); GF.bg('indoor2', r);
      const sc = el('div', 'abs', r); sc.style.cssText = 'left:0;right:0;top:70px;bottom:0;overflow-y:auto;touch-action:pan-y'; Room.house(sc, { room: 'kid' });
      const dr = UK.round({ icon: 'book', cls: 'gold', label: '액자 서랍', onclick: () => drawer(r) }, r); dr.style.cssText += ';position:absolute;right:12px;top:72px;z-index:12';
    },
  });
  /* 액자 서랍(앨범): 지금까지 완성한 그림 전부. 벽에는 최대 6개 — 눌러서 걸고 내린다 */
  function drawer(r) {
    const sc = el('div', 'uk-scrim', r), sh = el('div', 'uk-sheet', sc), grid = el('div', 'cl-dr', sh), acts = el('div', 'acts row', sh); acts.style.justifyContent = 'center';
    const L = () => Room.placedIn('kid').filter((x) => x.img);
    const draw = () => {
      grid.innerHTML = ''; L().forEach((e) => { const b = el('button', 'cl-th' + (e.drawer ? ' off' : ' on'), grid), i = el('img', '', b); i.src = imageFor(e.img) || ''; if (!e.drawer) el('div', 'ck', b, UK.icon('check')).style.cssText = 'background:#fff;border-radius:50%;box-shadow:var(--uk-sh)';
        b.onclick = () => {
          GF.sfx('pick'); const hung = L().filter((x) => !x.drawer);
          if (!e.drawer) { e.drawer = 1; delete e.slot; }
          else { const used = new Set(hung.map((x) => x.slot)); let k = [0, 1, 2, 3, 4, 5].find((s2) => !used.has(s2)); if (k == null) { const o = hung[0]; o.drawer = 1; k = o.slot; delete o.slot; } e.drawer = 0; e.slot = k; e.x = 14 + (k % 3) * 104; e.y = 6 + ((k / 3) | 0) * 72; }
          Room.save(); draw();
        }; });
      if (!L().length) el('div', 'uk-text', grid, '아직 그림이 없어요');
    };
    draw(); UK.round({ icon: 'close', cls: 'lg', onclick: () => { sc.remove(); GF.screens.chouse.enter(GF.screens.chouse.el.firstChild ? (GF.screens.chouse.el.innerHTML = '', GF.screens.chouse.el) : GF.screens.chouse.el); } }, acts);
  }

  /* ---------------- 부팅 ---------------- */
  CL.start = async function (opts) {
    await GF.boot(Object.assign({ dataNames: ['chars', 'anchors', 'sounds', 'color_pages', 'merge_extra', 'room_items', 'art_slots'], storeKey: 'gf:color:ui:v1', async start() {
      D = GF.data.color_pages; X = GF.data.merge_extra;
      Room.init({ data: GF.data.room_items, game: 'coloring', mode: 'kid', autoPlace: false, guard: (cb) => GF.gate(cb), store: Room.sharedStore('gf:house:kid:v1'), charSrc: (id) => GF.src(id), slot: (k, id) => GF.slot(k, id), imageFor });
      roomOK = true; document.getElementById('safe').classList.add('uk'); GF.go('chome');
      CL.debug.D = () => D; CL.debug.SV = () => SV; CL.debug.reset = () => { SV = blank(); save(); }; CL.debug.page = page;
    } }, opts || {}));
  };
})();
