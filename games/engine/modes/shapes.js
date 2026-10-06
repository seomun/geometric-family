/* 도형 맞추기 — 도형 조각을 끌어 집의 같은 모양 구멍에 넣는다. cfg: {house:'nemo'|'semo'|'dong', n:3|5|7, wind?:true}
   네모네 = 벽돌집, 세모네 = 뾰족집, 동그라미네 = 둥근집. 같은 모양·크기 구멍은 서로 바꿔 넣어도 된다. */
GF.mode('shapes', {
  setup(root, cfg, ctx) {
    const SH = {
      sq: '<rect x="3" y="3" width="94" height="94" rx="8"/>',
      rect: '<rect x="2" y="12" width="96" height="76" rx="8"/>',
      tall: '<rect x="12" y="2" width="76" height="96" rx="12"/>',
      tri: '<path d="M50 4L97 96H3z" stroke-linejoin="round"/>',
      circ: '<circle cx="50" cy="50" r="46"/>',
      semi: '<path d="M4 96a46 46 0 0 1 92 0z"/>',
      dia: '<path d="M50 3L97 50 50 97 3 50z"/>',
    };
    const HOUSES = {
      nemo: [
        { k: 'sq', x: 70, y: 120, w: 160, h: 150, c: '#F6C28B' }, { k: 'rect', x: 50, y: 78, w: 200, h: 54, c: '#D9765B' }, { k: 'tall', x: 134, y: 198, w: 34, h: 72, c: '#8A5A3B' },
        { k: 'sq', x: 88, y: 150, w: 38, h: 38, c: '#BFE8FF' }, { k: 'sq', x: 176, y: 150, w: 38, h: 38, c: '#BFE8FF' },
        { k: 'tall', x: 200, y: 28, w: 26, h: 50, c: '#B5543C' }, { k: 'circ', x: 18, y: 18, w: 46, h: 46, c: '#FFD36B' },
      ],
      semo: [
        { k: 'tri', x: 50, y: 60, w: 200, h: 210, c: '#8FD3F4' }, { k: 'semi', x: 126, y: 222, w: 48, h: 48, c: '#4C8DB0' }, { k: 'circ', x: 130, y: 150, w: 40, h: 40, c: '#FFF3C2' },
        { k: 'tri', x: 8, y: 200, w: 44, h: 70, c: '#6CCB8A' }, { k: 'tri', x: 252, y: 200, w: 44, h: 70, c: '#6CCB8A' },
        { k: 'circ', x: 236, y: 20, w: 46, h: 46, c: '#FFD36B' }, { k: 'dia', x: 14, y: 40, w: 44, h: 44, c: '#FF8FA8' },
      ],
      dong: [
        { k: 'circ', x: 60, y: 100, w: 180, h: 180, c: '#9FB4E8' }, { k: 'semi', x: 84, y: 44, w: 132, h: 66, c: '#3B4A7A' }, { k: 'tall', x: 134, y: 200, w: 34, h: 80, c: '#6B4F7A' },
        { k: 'circ', x: 90, y: 150, w: 36, h: 36, c: '#FFF3C2' }, { k: 'circ', x: 174, y: 150, w: 36, h: 36, c: '#FFF3C2' },
        { k: 'dia', x: 240, y: 30, w: 40, h: 40, c: '#FFD36B' }, { k: 'sq', x: 16, y: 226, w: 44, h: 44, c: '#FF8FA8' },
      ],
    };
    const n = Math.max(3, Math.min(7, cfg.n + (ctx.level || 0) * 2));
    const parts = HOUSES[cfg.house].slice(0, n).map((p, i) => Object.assign({ i, key: p.k + '@' + p.w + 'x' + p.h }, p));
    const S = 320 / 300, bx = 20, by = 10;                                           // 판: 300 → 320px
    const svgOf = (p, hole) => `<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="width:100%;height:100%;display:block"><g fill="${hole ? 'rgba(58,46,57,.22)' : p.c}" stroke="${hole ? 'none' : '#4A3030'}" stroke-width="5">${SH[p.k]}</g></svg>`;

    const board = GF.el('div', 'abs', root);
    board.style.cssText = `left:${bx - 6}px;top:${by - 6}px;width:332px;height:332px;background:#EAF7FF;border-radius:26px;box-shadow:0 5px 0 rgba(0,0,0,.12);overflow:hidden`;
    GF.el('div', 'abs', board).style.cssText = 'left:0;right:0;bottom:0;height:34px;background:#8FD67A';
    const holes = parts.map((p) => {
      const h = GF.el('div', 'abs', root); h.dataset.key = p.key; h.dataset.hole = 1;
      h.style.cssText = `left:${bx + p.x * S}px;top:${by + p.y * S}px;width:${p.w * S}px;height:${p.h * S}px`; h.innerHTML = svgOf(p, true);
      return { p, el: h, cx: bx + (p.x + p.w / 2) * S, cy: by + (p.y + p.h / 2) * S, w: p.w * S, h: p.h * S, filled: false };
    });

    // 트레이: 큰 조각부터 선반 쌓기, 안 들어가면 배율을 줄인다 (맞추면 제 크기로 커진다)
    const trayTop = by + 332 + 14, trayH = 576 - trayTop - 8;
    const order = ctx.shuffle(parts.map((_, i) => i)).sort((a, b) => parts[b].h - parts[a].h);
    let t = 1, place;
    for (; t > 0.4; t -= 0.1) {
      let x = 8, y = 0, rowH = 0; place = [];
      order.forEach((i) => {
        const w = parts[i].w * S * t, h = parts[i].h * S * t;
        if (x + w > 352) { x = 8; y += rowH + 6; rowH = 0; }
        place.push({ i, x, y, w, h }); x += w + 8; rowH = Math.max(rowH, h);
      });
      if (y + rowH <= trayH) break;
    }
    // 가운데 정렬: 같은 줄끼리
    const rowsMap = {}; place.forEach((q) => (rowsMap[q.y] = rowsMap[q.y] || []).push(q));
    Object.values(rowsMap).forEach((row) => { const wsum = row.reduce((a, q) => a + q.w, 0) + (row.length - 1) * 8, off = (360 - wsum) / 2 - row[0].x; row.forEach((q) => (q.x += off)); });
    let left = parts.length, mistakes = 0, finger = null;
    const toks = place.map((q) => {
      const p = parts[q.i], d = GF.el('div', 'tok', root); d.dataset.key = p.key;
      d.style.cssText = `left:${q.x}px;top:${trayTop + q.y}px;width:${q.w}px;height:${q.h}px`; d.innerHTML = svgOf(p, false);
      const tk = { el: d, p, home: { x: q.x, y: trayTop + q.y }, w: q.w, h: q.h, done: false };
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
              const h = target || same; h.filled = true; tk.done = true; h.el.style.visibility = 'hidden';
              d.classList.add('done', 'pop'); d.style.width = h.w + 'px'; d.style.height = h.h + 'px';
              d.style.left = h.cx - h.w / 2 + 'px'; d.style.top = h.cy - h.h / 2 + 'px'; d.style.zIndex = 3;
              ctx.sfx('ok'); fingerOff();
              if (--left === 0) finish(); return;
            }
            mistakes++; ctx.sfx('no'); d.classList.add('tilt'); setTimeout(() => d.classList.remove('tilt'), 700);
          }
          d.classList.add('back'); d.style.left = tk.home.x + 'px'; d.style.top = tk.home.y + 'px';
        },
      });
      return tk;
    });
    function finish() {
      board.style.background = '#FFF3C2';
      if (!cfg.wind) { ctx.timeout(() => ctx.done({ mistakes }), 800); return; }
      // 바람 친구가 후~ 불어도 끄떡없다
      const wind = GF.el('div', 'abs', root, '<svg viewBox="0 0 360 120" width="360" height="120"><g fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"><path d="M10 30q60-20 120 0t110 0"/><path d="M30 70q60-20 120 0t130 0"/><path d="M0 100q70-20 140 0t100 0"/></g></svg>');
      wind.style.cssText = 'left:-380px;top:120px;transition:left 1.4s ease-in;z-index:9;filter:drop-shadow(0 2px 0 rgba(0,0,0,.15))';
      requestAnimationFrame(() => requestAnimationFrame(() => { wind.style.left = '380px'; }));
      const houseEls = [...root.querySelectorAll('.tok.done')];
      houseEls.forEach((e) => (e.style.animation = 'houseshake .35s 3'));
      ctx.sfx('no'); ctx.timeout(() => { ctx.sfx('tada'); }, 1500);
      ctx.timeout(() => ctx.done({ mistakes }), 2200);
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
