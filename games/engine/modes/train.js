/* 기차 만들기 — 비어 있는 객차 칸에 규칙(모양·색의 반복)에 맞는 객차를 이어 붙인다. (2편 9장, 규칙·패턴)
   cfg: {pattern:['a','b','a','b'], gaps:[2], tray:['a','b','x']}
   객차 종류: a=네모(살구) · b=세모(하늘) · c=동그라미(남색) · x=하트(분홍, 헷갈림용). 아래 객차를 톡(또는 끌어서) 이어 붙이면 왼쪽 빈 칸부터 채운다.
   틀리면 갸웃하고 제자리로, 다 이으면 기차가 출발한다. 규칙을 말로 설명하지 않고 눈으로 따라가게 한다. */
GF.mode('train', {
  land: true,
  setup(root, cfg, ctx) {
    const wide = ctx.W > 400, pat = cfg.pattern, gaps = cfg.gaps.slice().sort((a, b) => a - b), n = pat.length;
    const STY = { a: ['#F6C28B', 'sq'], b: ['#8FD3F4', 'tri'], c: ['#3B4A7A', 'circ'], x: ['#FF8FA8', 'heart'] };
    const GLYPH = {
      sq: '<rect x="30" y="26" width="40" height="40" rx="6" fill="#fff"/>',
      tri: '<path d="M50 24L74 68H26z" fill="#fff" stroke-linejoin="round"/>',
      circ: '<circle cx="50" cy="46" r="22" fill="#fff"/>',
      heart: '<path d="M50 70C26 54 24 38 34 30c7-5 14-2 16 6 2-8 9-11 16-6 10 8 8 24-16 40z" fill="#fff"/>',
    };
    const car = (k, w) => {                                       // 객차 한 칸 (코드 SVG)
      const [col, g] = STY[k];
      return `<svg viewBox="0 0 100 86" style="width:${w}px;height:${w * 0.86}px;display:block"><g stroke="#4A3030" stroke-width="3.6" stroke-linejoin="round"><rect x="4" y="6" width="92" height="60" rx="14" fill="${col}"/><circle cx="26" cy="72" r="10" fill="#4A3030"/><circle cx="74" cy="72" r="10" fill="#4A3030"/></g><g stroke="none">${GLYPH[g]}</g></svg>`;
    };
    const engine = (w) => `<svg viewBox="0 0 100 86" style="width:${w}px;height:${w * 0.86}px;display:block"><g stroke="#4A3030" stroke-width="3.6" stroke-linejoin="round"><rect x="4" y="22" width="62" height="44" rx="12" fill="#FFB347"/><rect x="52" y="8" width="44" height="58" rx="10" fill="#FF8FA8"/><rect x="60" y="18" width="28" height="20" rx="5" fill="#fff"/><rect x="14" y="6" width="14" height="22" fill="#6B5F70"/><circle cx="26" cy="72" r="10" fill="#4A3030"/><circle cx="60" cy="72" r="10" fill="#4A3030"/><circle cx="84" cy="72" r="9" fill="#4A3030"/></g></svg>`;
    // ---- 기차 줄: 기관차 + 객차 n칸 (폰에서 너무 작아지면 두 줄로 접는다) ----
    const cars = n + 1, gapPx = wide ? 6 : 4;
    let per = cars, cwid = Math.min(wide ? 92 : 76, (ctx.W - 24 - (cars - 1) * gapPx) / cars);
    if (!wide && cwid < 60) { per = Math.ceil(cars / 2); cwid = Math.min(88, (ctx.W - 24 - (per - 1) * gapPx) / per); }
    const rows = Math.ceil(cars / per), chh = cwid * 0.86, rowGap = 22, trainW = per * cwid + (per - 1) * gapPx, tx0 = (ctx.W - trainW) / 2, ty = wide ? 40 : rows > 1 ? 64 : 96;
    const cell = (j) => ({ x: (j % per) * (cwid + gapPx), y: Math.floor(j / per) * (chh + rowGap) });
    for (let r = 0; r < rows; r++) { const rail = GF.el('div', 'abs', root); rail.style.cssText = `left:-2000px;right:-2000px;top:${ty + r * (chh + rowGap) + chh - 4}px;height:8px;background:#6B5F70;opacity:.55;border-radius:4px`; }
    const trainEl = GF.el('div', 'abs', root); trainEl.style.cssText = `left:${tx0}px;top:${ty}px;width:${trainW}px;height:${rows * (chh + rowGap)}px`;
    const eng = GF.el('div', 'abs', trainEl, engine(cwid)); eng.style.cssText += ';left:0;top:0';
    const slots = pat.map((k, i) => {
      const c = cell(i + 1), el = GF.el('div', 'abs trcar', trainEl); el.style.cssText += `;left:${c.x}px;top:${c.y}px;width:${cwid}px;height:${chh}px`;
      const isGap = gaps.includes(i);
      if (isGap) { el.classList.add('trgap'); el.innerHTML = '<div class="trhole"></div>'; } else el.innerHTML = car(k, cwid);
      return { i, k, el, gap: isGap, filled: !isGap, c };
    });
    let mistakes = 0, left = gaps.length, finger = null, finished = false;
    const nextGap = () => slots.find((s) => s.gap && !s.filled);
    const mark = () => { slots.forEach((s) => s.el.classList.remove('active')); const g = nextGap(); if (g) g.el.classList.add('active'); };
    mark();
    // ---- 트레이: 쓸 수 있는 객차들 ----
    const tn = cfg.tray.length, tg = wide ? 18 : 12, tsize = Math.min(wide ? 96 : 92, (ctx.W - 24 - (tn - 1) * tg) / tn);
    const trayY = wide ? ctx.H - tsize - 30 : ctx.H - tsize - 70;
    const tray = cfg.tray.map((k, i) => {
      const x = (ctx.W - (tn * tsize + (tn - 1) * tg)) / 2 + i * (tsize + tg);
      const el = GF.el('div', 'trtray', root, car(k, tsize * 0.86)); el.dataset.car = k;
      el.style.cssText += `;left:${x}px;top:${trayY}px;width:${tsize}px;height:${tsize}px`;
      el.firstChild.style.cssText += `;position:absolute;left:${tsize * 0.07}px;top:${tsize * 0.12}px`;
      const tk = { el, k, home: { x, y: trayY }, moved: 0 };
      GF.drag(el, {
        start() { if (finished) return; el.classList.remove('back'); el.classList.add('drag'); tk.moved = 0; ctx.sfx('tap'); },
        move(nx, ny) { if (finished) return; tk.moved = Math.max(tk.moved, Math.hypot(nx - tk.home.x, ny - tk.home.y)); el.style.left = nx + 'px'; el.style.top = ny + 'px'; },
        end() {
          if (finished) return; el.classList.remove('drag'); ctx.sfx('drop');
          const g = nextGap(); if (!g) return;
          const ex = parseFloat(el.style.left) + tsize / 2, ey = parseFloat(el.style.top) + tsize / 2;
          const gx = tx0 + g.c.x + cwid / 2, gy = ty + g.c.y + chh / 2;
          const tap = tk.moved < 12, near = Math.hypot(ex - gx, ey - gy) < Math.max(cwid, 70) * 1.1;
          if (tap || near) attempt(tk, g);
          else { el.classList.add('back'); el.style.left = tk.home.x + 'px'; el.style.top = tk.home.y + 'px'; }
        },
      });
      return tk;
    });
    function attempt(tk, g) {
      const back = () => { tk.el.classList.add('back'); tk.el.style.left = tk.home.x + 'px'; tk.el.style.top = tk.home.y + 'px'; };
      if (tk.k === g.k) {
        g.filled = true; left--; g.el.classList.remove('trgap', 'active'); g.el.innerHTML = car(g.k, cwid); g.el.classList.add('trin');
        ctx.sfx('ok'); fingerOff(); back(); GF.burst(root, tx0 + g.c.x + cwid / 2, ty + g.c.y + chh * 0.45, 10); mark();
        if (left === 0) ctx.timeout(depart, 500);
      } else {
        mistakes++; ctx.sfx('no'); tk.el.classList.add('tilt'); ctx.timeout(() => tk.el.classList.remove('tilt'), 700); back();
      }
    }
    function depart() {                                            // 완성! 기차가 칙칙폭폭 출발
      finished = true; tray.forEach((t) => (t.el.style.opacity = 0)); ctx.sfx('whistle');
      trainEl.animate([{ transform: 'translateX(0)', offset: 0 }, { transform: 'translateX(-8px)', offset: 0.12 }, { transform: 'translateX(0)', offset: 0.24 }, { transform: `translateX(${ctx.W + 140}px)`, offset: 1 }], { duration: 2100, easing: 'ease-in', fill: 'forwards' });
      for (let k = 0; k < 6; k++) ctx.timeout(() => { GF.burst(root, tx0 + 20, ty - 4, 4); ctx.sfx('tap'); }, 150 + k * 280);
      ctx.timeout(() => ctx.done({ mistakes }), 1500);
    }
    function fingerOff() { if (finger) { finger.remove(); finger = null; } tray.forEach((t) => t.el.classList.remove('hintglow')); }
    root.__train = { pattern: pat, gaps };
    ctx.setHint((lv) => {
      if (finished) return; const g = nextGap(); if (!g) return; const tk = tray.find((t) => t.k === g.k);
      if (lv === 1) {
        fingerOff(); finger = GF.el('div', 'finger', root);
        finger.style.left = tk.home.x + tsize / 2 + 'px'; finger.style.top = tk.home.y + tsize / 2 + 'px'; finger.style.transition = 'left 1.1s ease-in-out, top 1.1s ease-in-out';
        requestAnimationFrame(() => requestAnimationFrame(() => { if (finger) { finger.style.left = tx0 + g.c.x + cwid / 2 + 'px'; finger.style.top = ty + g.c.y + chh / 2 + 'px'; } }));
      } else tk.el.classList.add('hintglow');
    });
  },
  free(diff) {
    const P = [[['a', 'b', 'a', 'b'], [2], ['a', 'b', 'x']], [['a', 'b', 'a', 'b', 'a'], [1, 3], ['a', 'b', 'c']], [['a', 'b', 'c', 'a', 'b', 'c'], [1, 4], ['a', 'b', 'c', 'x']]][diff - 1];
    return { pattern: P[0], gaps: P[1], tray: P[2] };
  },
});
