/* 도형 맞추기 — 도형 조각을 끌어 잔칫집 설계도의 같은 모양 칸에 넣는다. cfg: {house:'nemo'|'semo'|'dong', n:3|5|7, wind?:true}
   네모네 = 벽돌집, 세모네 = 뾰족집, 동그라미네 = 둥근집. 같은 모양·크기 칸은 서로 바꿔 넣어도 된다.
   연출: 설계도(색 있는 칸) · 조각마다 질감 · 세 가족이 지켜보며 반응 · 완성하면 문이 활짝 · 마지막 판은 바람 친구 후~ → 생일 잔치 컷 */
GF.mode('shapes', {
  land: true,
  setup(root, cfg, ctx) {
    const wide = ctx.W > 400;
    let uid = 0;
    const SH = {                                       // 윤곽선(5)이 잘리지 않게 안쪽으로 여유를 둔다
      sq: '<rect x="6" y="6" width="88" height="88" rx="8"/>',
      rect: '<rect x="5" y="15" width="90" height="70" rx="8"/>',
      tall: '<rect x="14" y="5" width="72" height="90" rx="12"/>',
      tri: '<path d="M50 7L94 93H6z" stroke-linejoin="round"/>',
      circ: '<circle cx="50" cy="50" r="43"/>',
      semi: '<path d="M7 93a43 43 0 0 1 86 0z"/>',
      dia: '<path d="M50 6L94 50 50 94 6 50z"/>',
    };
    // 질감(패턴)과 디테일. 100×100 좌표.
    const INK = '#4A3030';
    const PAT = {
      brick: (id) => `<pattern id="${id}" width="26" height="13" patternUnits="userSpaceOnUse"><path d="M0 6.5H26M13 0V6.5M0 6.5V13M26 6.5V13" fill="none" stroke="#7A3F2A" stroke-opacity=".38" stroke-width="1.6"/></pattern>`,
      tiles: (id) => `<pattern id="${id}" width="20" height="12" patternUnits="userSpaceOnUse"><path d="M0 12q10-12 20 0M-10 6q10-12 20 0M10 6q10-12 20 0" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="1.6"/></pattern>`,
      wood: (id) => `<pattern id="${id}" width="16" height="100" patternUnits="userSpaceOnUse"><path d="M8 0V100M3 20q2 8 0 16M13 60q-2 8 0 16" fill="none" stroke="#3E2414" stroke-opacity=".35" stroke-width="1.6"/></pattern>`,
      dots: (id) => `<pattern id="${id}" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="2.6" fill="#fff" fill-opacity=".6"/></pattern>`,
      stripes: (id) => `<pattern id="${id}" width="14" height="14" patternUnits="userSpaceOnUse"><path d="M-2 16L16 -2" stroke="#fff" stroke-opacity=".5" stroke-width="4"/></pattern>`,
    };
    const DET = {
      win: '<path d="M50 9V91M9 50H91" stroke="#fff" stroke-width="5" stroke-linecap="round"/>',
      knob: '<circle cx="70" cy="56" r="7" fill="#FFD36B" stroke="#4A3030" stroke-width="2"/>',
      face: '<circle cx="36" cy="44" r="5" fill="#4A3030"/><circle cx="64" cy="44" r="5" fill="#4A3030"/><path d="M36 60q14 14 28 0" fill="none" stroke="#4A3030" stroke-width="4" stroke-linecap="round"/><circle cx="26" cy="56" r="5" fill="#FF8FA8" fill-opacity=".7"/><circle cx="74" cy="56" r="5" fill="#FF8FA8" fill-opacity=".7"/>',
      gift: '<path d="M50 6V94M6 50H94" stroke="#fff" stroke-width="12"/><circle cx="50" cy="22" r="9" fill="#fff"/>',
    };
    const HOUSES = {
      nemo: [
        { k: 'sq', x: 70, y: 120, w: 160, h: 150, c: '#F6C28B', t: 'brick' }, { k: 'rect', x: 50, y: 78, w: 200, h: 54, c: '#D9765B', t: 'tiles' }, { k: 'tall', x: 134, y: 198, w: 34, h: 72, c: '#8A5A3B', t: 'wood', d: 'knob', door: 1 },
        { k: 'sq', x: 88, y: 150, w: 38, h: 38, c: '#BFE8FF', d: 'win' }, { k: 'sq', x: 176, y: 150, w: 38, h: 38, c: '#BFE8FF', d: 'win' },
        { k: 'tall', x: 200, y: 28, w: 26, h: 50, c: '#B5543C', t: 'brick' }, { k: 'circ', x: 18, y: 18, w: 46, h: 46, c: '#FFD36B', d: 'face' },
      ],
      semo: [
        { k: 'tri', x: 50, y: 60, w: 200, h: 210, c: '#8FD3F4', t: 'stripes' }, { k: 'semi', x: 126, y: 222, w: 48, h: 48, c: '#4C8DB0', t: 'wood', d: 'knob', door: 1 }, { k: 'circ', x: 130, y: 150, w: 40, h: 40, c: '#FFF3C2', d: 'win' },
        { k: 'tri', x: 8, y: 200, w: 44, h: 70, c: '#6CCB8A', t: 'stripes' }, { k: 'tri', x: 252, y: 200, w: 44, h: 70, c: '#6CCB8A', t: 'stripes' },
        { k: 'circ', x: 236, y: 20, w: 46, h: 46, c: '#FFD36B', d: 'face' }, { k: 'dia', x: 14, y: 40, w: 44, h: 44, c: '#FF8FA8', t: 'stripes' },
      ],
      dong: [
        { k: 'circ', x: 60, y: 100, w: 180, h: 180, c: '#9FB4E8', t: 'dots' }, { k: 'semi', x: 84, y: 44, w: 132, h: 66, c: '#3B4A7A', t: 'tiles' }, { k: 'tall', x: 134, y: 200, w: 34, h: 80, c: '#6B4F7A', t: 'wood', d: 'knob', door: 1 },
        { k: 'circ', x: 90, y: 150, w: 36, h: 36, c: '#FFF3C2', d: 'win' }, { k: 'circ', x: 174, y: 150, w: 36, h: 36, c: '#FFF3C2', d: 'win' },
        { k: 'dia', x: 240, y: 30, w: 40, h: 40, c: '#FFD36B' }, { k: 'sq', x: 14, y: 192, w: 44, h: 44, c: '#FF8FA8', d: 'gift' },
      ],
    };
    const n = Math.max(3, Math.min(7, cfg.n + (ctx.level || 0) * 2));
    const parts = HOUSES[cfg.house].slice(0, n).map((p, i) => Object.assign({ i, key: p.k + '@' + p.w + 'x' + p.h }, p));
    const BS = wide ? ctx.H - 28 : 320, S = BS / 300, bx = wide ? 30 : 20, by = wide ? 14 : 10;   // 판: 300 → BS px

    const svgOf = (p, hole) => {
      if (hole) return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%;height:100%;display:block"><g fill="${p.c}" fill-opacity=".5" stroke="#4A3030" stroke-opacity=".6" stroke-width="3" stroke-dasharray="7 5" stroke-linejoin="round">${SH[p.k]}</g></svg>`;
      const id = 'pt' + (++uid);
      return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%;height:100%;display:block"><defs>${p.t ? PAT[p.t](id) : ''}</defs>`
        + `<g fill="${p.c}" stroke="#4A3030" stroke-width="4" stroke-linejoin="round">${SH[p.k]}</g>`
        + (p.t ? `<g fill="url(#${id})" stroke="none">${SH[p.k]}</g>` : '')
        + (p.d ? `<g>${DET[p.d]}</g>` : '') + '</svg>';
    };

    // ---- 판: 잔칫집 마당 (하늘·구름·만국기·길·꽃) ----
    const board = GF.el('div', 'abs', root);
    board.style.cssText = `left:${bx - 6}px;top:${by - 6}px;width:${BS + 12}px;height:${BS + 12}px;border-radius:26px;box-shadow:0 5px 0 rgba(0,0,0,.12);overflow:hidden;background:#EAF7FF`;
    const gid = 'bg' + (++uid);
    const flags = [];
    for (let i = 0; i < 11; i++) {                       // 위쪽 만국기 (곡선 위에 삼각 깃발)
      const t = i / 10, x = 8 + t * 284, y = 14 + 26 * 4 * t * (1 - t);
      flags.push(`<path d="M${x - 8} ${y}L${x + 8} ${y}L${x} ${y + 17}z" fill="${['#FF8FA8', '#FFD36B', '#8FD3F4', '#6CCB8A', '#B197FC'][i % 5]}" stroke="#fff" stroke-width="1.5"/>`);
    }
    const ground = { nemo: '#8FD67A', semo: '#9ADB88', dong: '#A9D6A0' }[cfg.house];
    const flower = [[28, 284, '#FF8FA8'], [74, 290, '#FFF3B0'], [120, 286, '#fff'], [186, 291, '#FF8FA8'], [236, 285, '#FFF3B0'], [276, 290, '#fff']].map((f) => `<g transform="translate(${f[0]} ${f[1]})"><circle r="5" fill="${f[2]}"/><circle r="2" fill="#FFC933"/></g>`).join('');
    board.innerHTML = `<svg viewBox="0 0 300 300" style="position:absolute;left:6px;top:6px;width:${BS}px;height:${BS}px;overflow:visible"><defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFE8FF"/><stop offset="1" stop-color="#F4FBFF"/></linearGradient></defs>`
      + `<rect x="-6" y="-6" width="312" height="312" fill="url(#${gid})"/>`
      + `<g class="drift"><g fill="#fff" opacity=".92"><ellipse cx="84" cy="70" rx="26" ry="11"/><ellipse cx="68" cy="75" rx="16" ry="8"/><ellipse cx="104" cy="75" rx="18" ry="8"/></g></g>`
      + `<ellipse cx="60" cy="262" rx="150" ry="46" fill="#B6E6A0"/><ellipse cx="250" cy="266" rx="130" ry="40" fill="#9ADB88"/>`
      + `<path d="M0 14Q150 66 300 14" fill="none" stroke="#fff" stroke-width="2.5"/>` + flags.join('')
      + `<rect x="-6" y="268" width="312" height="40" fill="${ground}"/><path d="M130 268L170 268L196 306L104 306z" fill="#F3DDB3"/>` + flower + '</svg>';
    const warm = GF.el('div', 'abs', board); warm.style.cssText = 'inset:0;background:radial-gradient(circle at 50% 70%,rgba(255,226,120,.55),rgba(255,226,120,0) 70%);opacity:0;transition:opacity .6s;pointer-events:none;z-index:4';

    // ---- 세 가족이 지켜본다 (바닥 줄) ----
    const WATCH = [['nemo_dad', 8, 66], ['baby', 58, 46], ['wife', 212, 62], ['dong_dad', 250, 62]];
    const watchers = WATCH.map((w) => {
      const im = ctx.img(w[0] + '.good', 'abs'); const hh = w[2] * S;
      im.style.cssText = `left:${bx + w[1] * S}px;top:${by + 298 * S - hh}px;height:${hh}px;width:auto;z-index:4;pointer-events:none`;
      root.appendChild(im); return { im, who: w[0] };
    });
    const react = (face, ms) => watchers.forEach((w, i) => {
      const c = { good: 'good', joy: 'joy', worry: { nemo_dad: 'worry', wife: 'worry', dong_dad: 'trouble', baby: 'surprise' }[w.who] }[face];
      w.im.src = GF.src(w.who + '.' + c); if (face === 'joy') setTimeout(() => GF.jump(w.im), i * 90);
      if (ms) setTimeout(() => { w.im.src = GF.src(w.who + '.good'); }, ms);
    });

    // ---- 설계도 칸 ----
    const holes = parts.map((p) => {
      const h = GF.el('div', 'abs', root); h.dataset.key = p.key; h.dataset.hole = 1;
      h.style.cssText = `left:${bx + p.x * S}px;top:${by + p.y * S}px;width:${p.w * S}px;height:${p.h * S}px`; h.innerHTML = svgOf(p, true);
      return { p, el: h, cx: bx + (p.x + p.w / 2) * S, cy: by + (p.y + p.h / 2) * S, w: p.w * S, h: p.h * S, filled: false };
    });

    // ---- 트레이: 큰 조각부터 선반 쌓기, 안 들어가면 배율을 줄인다 (맞추면 제 크기로 커진다) ----
    const trayL = wide ? bx + BS + 30 : 0, trayW = wide ? ctx.W - trayL - 12 : 360;
    const trayTop = wide ? 14 : by + 332 + 14, trayH = wide ? ctx.H - 28 : 576 - trayTop - 8;
    const order = ctx.shuffle(parts.map((_, i) => i)).sort((a, b) => parts[b].h - parts[a].h);
    let t = 1, place;
    for (; t > 0.4; t -= 0.1) {
      let x = 8, y = 0, rowH = 0; place = [];
      const maxX = trayW - 8;
      order.forEach((i) => {
        const w = parts[i].w * S * t, h = parts[i].h * S * t;
        if (x + w > maxX) { x = 8; y += rowH + 6; rowH = 0; }
        place.push({ i, x, y, w, h }); x += w + 8; rowH = Math.max(rowH, h);
      });
      if (y + rowH <= trayH) break;
    }
    const rowsMap = {}; place.forEach((q) => (rowsMap[q.y] = rowsMap[q.y] || []).push(q));
    Object.values(rowsMap).forEach((row) => { const wsum = row.reduce((a, q) => a + q.w, 0) + (row.length - 1) * 8, off = (trayW - wsum) / 2 - row[0].x; row.forEach((q) => (q.x += off + trayL)); });
    let left = parts.length, mistakes = 0, finger = null, doorTok = null;
    const toks = place.map((q) => {
      const p = parts[q.i], d = GF.el('div', 'tok', root); d.dataset.key = p.key;
      d.style.cssText = `left:${q.x}px;top:${trayTop + q.y + (wide ? Math.max(0, (trayH - (Math.max(...place.map((z) => z.y + z.h)))) / 2) : 0)}px;width:${q.w}px;height:${q.h}px`; d.innerHTML = svgOf(p, false);
      const tk = { el: d, p, home: { x: q.x, y: parseFloat(d.style.top) }, w: q.w, h: q.h, done: false };
      if (p.door) doorTok = tk;
      GF.drag(d, {
        start() { if (tk.done) return; d.classList.remove('back'); d.classList.add('drag'); ctx.sfx('tap'); },
        move(x, y) { if (!tk.done) { d.style.left = x + 'px'; d.style.top = y + 'px'; } },
        end() {
          if (tk.done) return; d.classList.remove('drag'); ctx.sfx('drop');
          const cx = parseFloat(d.style.left) + tk.w / 2, cy = parseFloat(d.style.top) + tk.h / 2;
          let best = null, bd = 1e9;
          holes.forEach((h) => { const dd = Math.hypot(h.cx - cx, h.cy - cy); if (dd < bd && !h.filled) { bd = dd; best = h; } });
          const same = holes.filter((h) => !h.filled && h.p.key === p.key).sort((a, b) => Math.hypot(a.cx - cx, a.cy - cy) - Math.hypot(b.cx - cx, b.cy - cy))[0];
          const reach = best ? Math.max(Math.max(best.w, best.h) * 0.7, 56) : 0;
          if (best && bd < reach) {
            const target = best.p.key === p.key ? best : null;
            if (target || (same && Math.hypot(same.cx - cx, same.cy - cy) < Math.max(same.w, same.h) * 0.7)) {
              const h = target || same; h.filled = true; tk.done = true; tk.hole = h; h.el.style.visibility = 'hidden';
              d.classList.add('done', 'pop'); d.style.width = h.w + 'px'; d.style.height = h.h + 'px';
              d.style.left = h.cx - h.w / 2 + 'px'; d.style.top = h.cy - h.h / 2 + 'px'; d.style.zIndex = 3;
              ctx.sfx('ok'); fingerOff(); GF.snap(d); GF.burst(root, h.cx, h.cy, 10); react('joy', 900);
              if (--left === 0) ctx.timeout(finish, 450); return;
            }
            mistakes++; ctx.sfx('hmm'); d.classList.add('tilt'); setTimeout(() => d.classList.remove('tilt'), 700); react('worry', 900);
          }
          d.classList.add('back'); d.style.left = tk.home.x + 'px'; d.style.top = tk.home.y + 'px';
        },
      });
      return tk;
    });

    // ---- 마무리: 문이 열리고 → (마지막 판) 바람 친구 후~ → 생일 잔치 컷 ----
    function openDoor() {
      const dk = doorTok; if (!dk) return;
      const h = dk.hole, light = GF.el('div', 'abs', root);
      light.style.cssText = `left:${h.cx - h.w / 2}px;top:${h.cy - h.h / 2}px;width:${h.w}px;height:${h.h}px;z-index:2;border-radius:${dk.p.k === 'semi' ? '999px 999px 6px 6px' : '12px'};background:radial-gradient(circle,#FFF6C2,#FFC933)`;
      dk.el.style.transformOrigin = 'left center'; dk.el.style.zIndex = 5;
      dk.el.animate([{ transform: 'perspective(500px) rotateY(0)' }, { transform: 'perspective(500px) rotateY(-80deg)' }], { duration: 520, fill: 'forwards', easing: 'cubic-bezier(.3,1.3,.5,1)' });
      warm.style.opacity = 1; ctx.sfx('door'); GF.burst(root, h.cx, h.cy, 18); react('joy');
    }
    function windFriend() {
      const svg = '<svg viewBox="0 0 150 110" width="150" height="110"><g stroke="#4A3030" stroke-width="3.5" stroke-linejoin="round"><ellipse cx="75" cy="64" rx="56" ry="36" fill="#EAF4FF"/><ellipse cx="40" cy="50" rx="26" ry="22" fill="#EAF4FF"/><ellipse cx="108" cy="46" rx="30" ry="24" fill="#EAF4FF"/><ellipse cx="74" cy="38" rx="28" ry="24" fill="#EAF4FF"/></g>'
        + '<ellipse cx="74" cy="46" rx="44" ry="26" fill="#EAF4FF"/><circle cx="58" cy="62" r="6" fill="#4A3030"/><circle cx="92" cy="62" r="6" fill="#4A3030"/><circle cx="55" cy="60" r="2" fill="#fff"/><circle cx="89" cy="60" r="2" fill="#fff"/>'
        + '<circle cx="46" cy="76" r="8" fill="#FFB3C7" opacity=".85"/><circle cx="104" cy="76" r="8" fill="#FFB3C7" opacity=".85"/><ellipse cx="75" cy="82" rx="9" ry="7" fill="#4A3030"/></svg>';
      const w = GF.el('div', 'abs', root, svg); const sz = wide ? 1.15 : 1;
      w.style.cssText = `left:${bx - 170}px;top:${by + 70 * S}px;z-index:9;transform:scale(${sz});filter:drop-shadow(0 4px 0 rgba(0,0,0,.14))`;
      w.animate([{ transform: `translateX(0) scale(${sz})` }, { transform: `translateX(${190 + 0}px) scale(${sz})` }], { duration: 700, fill: 'forwards', easing: 'ease-out' });
      return w;
    }
    function swirl() {
      const s = GF.el('div', 'abs', root, '<svg viewBox="0 0 320 120" width="320" height="120"><g fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"><path d="M0 30q50-24 100 0t100 0 100 0"/><path d="M20 66q50-24 100 0t100 0 100 0"/><path d="M0 100q60-24 120 0t100 0"/></g></svg>');
      s.style.cssText = `left:${bx - 330}px;top:${by + 80 * S}px;z-index:8;filter:drop-shadow(0 2px 0 rgba(0,0,0,.14))`;
      s.animate([{ transform: 'translateX(0)', opacity: 1 }, { transform: `translateX(${BS + 380}px)`, opacity: 1 }], { duration: 1500, easing: 'ease-in' }).onfinish = () => s.remove();
      return s;
    }
    function party() {                                      // 생일 잔치 컷: 판 위로 케이크 + 풍선 + 온 가족
      const card = GF.el('div', 'abs', root); card.style.cssText = `left:${bx - 6}px;top:${by - 6}px;width:${BS + 12}px;height:${BS + 12}px;border-radius:26px;z-index:20;overflow:hidden;background:linear-gradient(#FFE9C7,#FFF6E5);opacity:0;transition:opacity .5s`;
      const bal = (x, c, y) => `<g transform="translate(${x} ${y})"><ellipse rx="22" ry="27" fill="${c}" stroke="#4A3030" stroke-width="3"/><path d="M0 27q-6 18 4 32" fill="none" stroke="#4A3030" stroke-width="2.5"/></g>`;
      card.innerHTML = `<svg viewBox="0 0 300 300" style="position:absolute;inset:6px;width:${BS}px;height:${BS}px"><path d="M0 14Q150 66 300 14" fill="none" stroke="#fff" stroke-width="2.5"/>${flags.join('')}`
        + bal(40, '#FF8FA8', 90) + bal(72, '#8FD3F4', 70) + bal(228, '#FFD36B', 76) + bal(262, '#6CCB8A', 96)
        + '<rect x="-6" y="246" width="312" height="60" fill="#E9B97F"/><rect x="92" y="196" width="116" height="56" rx="10" fill="#FFB3C7" stroke="#4A3030" stroke-width="3.5"/><path d="M92 214q15 12 29 0t29 0 29 0 29 0" fill="#fff" stroke="#4A3030" stroke-width="3"/>'
        + '<g stroke="#4A3030" stroke-width="2.5"><rect x="116" y="176" width="8" height="22" fill="#8FD3F4"/><rect x="146" y="172" width="8" height="26" fill="#FFD36B"/><rect x="176" y="176" width="8" height="22" fill="#6CCB8A"/></g>'
        + '<g fill="#FF8A1F"><ellipse cx="120" cy="170" rx="5" ry="8"/><ellipse cx="150" cy="166" rx="5" ry="8"/><ellipse cx="180" cy="170" rx="5" ry="8"/></g></svg>';
      // 뒤줄: 어른 넷이 케이크 양옆에, 앞줄 가운데: 막둥이
      [['nemo_dad', 4, 80, 0], ['nemo_mom', 52, 80, 0], ['wife', 188, 82, 0], ['dong_dad', 236, 80, 0], ['baby', 118, 54, 1]].forEach((c, i) => {
        const im = ctx.img(c[0] + '.joy'); const hh = c[2] * S;
        im.style.cssText = `position:absolute;left:${6 + c[1] * S}px;bottom:${(300 - 292) * S + 6}px;height:${hh}px;width:auto;z-index:${c[3] ? 3 : 2}`; card.appendChild(im); setTimeout(() => GF.jump(im), 500 + i * 140);
      });
      requestAnimationFrame(() => { card.style.opacity = 1; }); return card;
    }
    function finish() {
      openDoor();
      if (!cfg.wind) { ctx.timeout(() => ctx.done({ mistakes }), 1100); return; }
      // 마지막 판: 바람 친구가 후~ 불어도 집은 끄떡없다 → 문이 열리며 생일 잔치
      const houseEls = [...root.querySelectorAll('.tok.done')].filter((e) => !(doorTok && e === doorTok.el));
      ctx.timeout(() => {
        const w = windFriend(); ctx.sfx('wind');
        ctx.timeout(() => { swirl(); houseEls.forEach((e) => (e.style.animation = 'houseshake .35s 4')); }, 650);
        ctx.timeout(() => { w.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'forwards' }); react('joy'); ctx.sfx('star'); }, 2300);
      }, 900);
      ctx.timeout(() => { party(); ctx.sfx('celebrate'); }, 3600);
      ctx.timeout(() => ctx.done({ mistakes }), 5600);
    }
    function fingerOff() { if (finger) { finger.remove(); finger = null; } holes.forEach((h) => h.el.classList.remove('glow')); }
    ctx.setHint((lv) => {
      const tk = toks.find((x) => !x.done); if (!tk) return;
      const h = holes.find((q) => !q.filled && q.p.key === tk.p.key);
      if (lv === 1) {
        fingerOff(); finger = GF.el('div', 'finger', root);
        finger.style.left = tk.home.x + tk.w / 2 + 'px'; finger.style.top = tk.home.y + tk.h / 2 + 'px';
        finger.style.transition = 'left 1.1s ease-in-out, top 1.1s ease-in-out';
        requestAnimationFrame(() => requestAnimationFrame(() => { if (finger) { finger.style.left = h.cx + 'px'; finger.style.top = h.cy + 'px'; } }));
      } else h.el.classList.add('glow');
    });
  },
  free(diff) { return { house: GF.rnd(['nemo', 'semo', 'dong']), n: [3, 5, 7][diff - 1] }; },
});
