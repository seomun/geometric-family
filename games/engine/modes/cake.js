/* 케이크 만들기 — ① 큰 층부터 쌓고 ② 점 개수만큼 장식을 올리고 ③(도전) 초를 꽂는다. (2편 10장, 쌓기·세기)
   cfg: {layers:[폭 순서 큰→작은 개수 2~4], deco:N(올릴 장식 수), candles:M(0이면 없음)}
   틀리면(작은 층을 먼저 올림) 갸웃하고 제자리로. 장식은 어떤 것이든 골라 N개를 올리면 된다(창작). 수는 점으로 보여 준다(글자 없음). */
GF.mode('cake', {
  land: true,
  setup(root, cfg, ctx) {
    const wide = ctx.W > 400, L = Array.from({ length: cfg.layers }, (_, i) => i), deco = cfg.deco, candles = cfg.candles || 0;
    const COL = ['#FFF3C2', '#FFB3C7', '#C99A6B', '#BFE8C8'], WID = [236, 196, 156, 116], LH = 46;
    const cx = wide ? 190 : ctx.W / 2, plateY = wide ? ctx.H - 56 : 372;          // 접시는 모래밭 위(바다·배와 겹치지 않게)
    // ---- 접시 + 케이크 영역 ----
    const stage = GF.el('div', 'abs', root); stage.style.cssText = `left:0;top:0;width:${ctx.W}px;height:${ctx.H}px;pointer-events:none`;
    const plate = GF.el('div', 'abs', stage, '<svg viewBox="0 0 300 40" style="width:300px;height:40px"><ellipse cx="150" cy="22" rx="144" ry="16" fill="#E8E1EE" stroke="#4A3030" stroke-width="3.4"/><ellipse cx="150" cy="18" rx="118" ry="11" fill="#fff"/></svg>');
    plate.style.cssText += `;left:${cx - 150}px;top:${plateY - 24}px`;
    const layerSVG = (i, w) => `<svg viewBox="0 0 ${w} ${LH + 12}" style="width:${w}px;height:${LH + 12}px;display:block"><g stroke="#4A3030" stroke-width="3.4" stroke-linejoin="round"><rect x="3" y="12" width="${w - 6}" height="${LH - 2}" rx="12" fill="${COL[i]}"/><path d="M3 24q${(w - 6) / 8} 14 ${(w - 6) / 4} 0t${(w - 6) / 4} 0 ${(w - 6) / 4} 0 ${(w - 6) / 4} 0" fill="none" stroke="#fff" stroke-width="9" opacity=".9"/></g></svg>`;
    const sizes = L.map((_, i) => i);                               // 0 = 가장 큼(맨 아래)
    let stacked = 0, mistakes = 0, finished = false, phase = 'layers', finger = null, placed = 0, candled = 0;
    const topY = () => plateY - 20 - stacked * LH;
    // ---- 단계 점(수 세기) ----
    const dotsEl = GF.el('div', 'seqdots', root); dotsEl.style.top = '16px'; let dots = [];
    const setDots = (n, color) => { dotsEl.innerHTML = ''; dots = Array.from({ length: n }, () => { const d = GF.el('i', '', dotsEl); d.style.borderColor = color || 'rgba(58,46,57,.25)'; return d; }); dotsEl.style.opacity = n ? 1 : 0; };
    setDots(0);
    // ---- 트레이 ----
    let tray = [];
    const tgap = 12; let tsz = wide ? 100 : 84;
    function clearTray() { tray.forEach((t) => t.el.remove()); tray = []; }
    function mkTray(items, render, onPick) {
      clearTray(); const n = items.length;
      tsz = wide ? Math.min(100, (ctx.H - 60 - (Math.ceil(n / (n > 3 ? 2 : 1)) - 1) * 10) / Math.ceil(n / (n > 3 ? 2 : 1))) : Math.min(84, (ctx.W - 24 - (n - 1) * tgap) / n);
      const wcols = n > 3 ? 2 : 1, wrows = Math.ceil(n / wcols);
      items.forEach((it, i) => {
        const x = wide ? 470 + ((ctx.W - 470 - (wcols * tsz + (wcols - 1) * tgap)) / 2) + (i % wcols) * (tsz + tgap) : (ctx.W - (n * tsz + (n - 1) * tgap)) / 2 + i * (tsz + tgap), y = wide ? 30 + Math.floor(i / wcols) * (tsz + 10) : ctx.H - tsz - 56;
        const el = GF.el('div', 'trtray', root, render(it)); el.style.cssText += `;left:${x}px;top:${y}px;width:${tsz}px;height:${tsz}px`;
        el.firstChild.style.cssText += `;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%)`;
        const tk = { el, it, home: { x, y }, moved: 0 };
        GF.drag(el, {
          start() { if (finished) return; el.classList.remove('back'); el.classList.add('drag'); tk.moved = 0; ctx.sfx('tap'); },
          move(nx, ny) { if (finished) return; tk.moved = Math.max(tk.moved, Math.hypot(nx - tk.home.x, ny - tk.home.y)); el.style.left = nx + 'px'; el.style.top = ny + 'px'; },
          end() {
            if (finished) return; el.classList.remove('drag'); ctx.sfx('drop');
            const ex = parseFloat(el.style.left) + tsz / 2, ey = parseFloat(el.style.top) + tsz / 2;
            const near = Math.hypot(ex - cx, ey - (topY() - 20)) < 130;
            const back = () => { el.classList.add('back'); el.style.left = tk.home.x + 'px'; el.style.top = tk.home.y + 'px'; };
            if (tk.moved < 12 || near) onPick(tk, back); else back();
          },
        });
        tray.push(tk);
      });
    }
    // ---- ① 층 쌓기 ----
    function startLayers() {
      phase = 'layers';
      const order = ctx.shuffle(sizes.slice());
      mkTray(order, (i) => layerSVG(i, Math.round(WID[i] * (wide ? 0.4 : 0.34))), (tk, back) => {
        if (tk.it !== stacked) { mistakes++; ctx.sfx('no'); tk.el.classList.add('tilt'); ctx.timeout(() => tk.el.classList.remove('tilt'), 700); back(); return; }
        const i = tk.it, el = GF.el('div', 'abs trin', stage, layerSVG(i, WID[i])); el.style.left = cx - WID[i] / 2 + 'px'; el.style.top = plateY - 20 - (stacked + 1) * LH - 6 + 'px';
        stacked++; tk.el.style.opacity = 0; tk.el.style.pointerEvents = 'none'; ctx.sfx('ok'); fingerOff(); GF.burst(root, cx, topY() + 10, 8);
        if (stacked === L.length) ctx.timeout(startDeco, 600);
      });
    }
    // ---- ② 장식 N개 ----
    const TOP = {
      strawberry: '<svg viewBox="0 0 40 44" style="width:40px;height:44px"><g stroke="#4A3030" stroke-width="2.6" stroke-linejoin="round"><path d="M20 40C5 30 3 16 10 10c5-4 10-1 10 3 0-4 5-7 10-3 7 6 5 20-10 30z" fill="#FF5E6E"/><path d="M12 10q8-8 16 0l-8 4z" fill="#6CCB8A"/></g><g fill="#fff" opacity=".8"><circle cx="14" cy="22" r="1.5"/><circle cx="24" cy="20" r="1.5"/><circle cx="19" cy="30" r="1.5"/></g></svg>',
      cherry: '<svg viewBox="0 0 40 44" style="width:40px;height:44px"><g stroke="#4A3030" stroke-width="2.6" stroke-linecap="round"><path d="M12 28Q14 10 28 4M26 30Q28 14 28 4" fill="none"/><circle cx="12" cy="32" r="9" fill="#D7263D"/><circle cx="27" cy="33" r="9" fill="#D7263D"/></g></svg>',
      star: '<svg viewBox="0 0 40 44" style="width:40px;height:44px"><path d="M20 4l5 12 13 1-10 8 3 13-11-7-11 7 3-13L2 17l13-1z" fill="#FFD36B" stroke="#4A3030" stroke-width="2.6" stroke-linejoin="round"/></svg>',
      candle: '<svg viewBox="0 0 30 60" style="width:30px;height:60px"><g stroke="#4A3030" stroke-width="2.6" stroke-linejoin="round"><rect x="9" y="20" width="12" height="38" rx="3" fill="#8FD3F4"/><path d="M9 32l12-6M9 44l12-6M9 54l12-6" stroke="#fff" fill="none"/></g><g class="flame" style="transform-origin:15px 18px"><path d="M15 3c6 7 6 13 0 15-6-2-6-8 0-15z" fill="#FF9A3C" stroke="#4A3030" stroke-width="2"/></g></svg>',
    };
    const spots = (n) => Array.from({ length: n }, (_, k) => cx + (k - (n - 1) / 2) * Math.min(48, (WID[L.length - 1] - 20) / Math.max(1, n - 1 || 1)));
    function startDeco() {
      phase = 'deco'; placed = 0; setDots(deco, '#FF8FA8');
      const sp = spots(deco);
      mkTray(['strawberry', 'cherry', 'star'], (k) => TOP[k].replace('style="width:40px;height:44px"', 'style="width:52px;height:57px"'), (tk, back) => {
        if (placed >= deco) { back(); return; }
        const s_ = deco > 3 ? 0.8 : 1, el = GF.el('div', 'abs trin', stage, TOP[tk.it]); el.style.left = sp[placed] - 20 + 'px'; el.style.top = topY() - 36 + 'px'; el.style.zIndex = 3; el.style.transform = 'scale(' + s_ + ')'; el.style.transformOrigin = '50% 90%';
        dots[placed].style.background = tk.it === 'star' ? '#FFD36B' : '#FF5E6E'; dots[placed].classList.add('on'); placed++; ctx.sfx('ok'); GF.burst(root, sp[placed - 1], topY() - 20, 6); back();
        if (placed >= deco) { fingerOff(); ctx.timeout(candles ? startCandles : finish, 650); }
      });
    }
    // ---- ③ 초 M개 (도전) ----
    function startCandles() {
      phase = 'candle'; candled = 0; setDots(candles, '#8FD3F4');
      const sp = spots(Math.max(candles, 1)).map((x) => x);
      mkTray(['candle'], (k) => TOP[k], (tk, back) => {
        if (candled >= candles) { back(); return; }
        const el = GF.el('div', 'abs trin', stage, TOP.candle); el.style.left = sp[candled] - 15 + 'px'; el.style.top = topY() - 62 + 'px'; el.style.zIndex = 2;
        dots[candled].style.background = '#8FD3F4'; dots[candled].classList.add('on'); candled++; ctx.sfx('ok'); GF.burst(root, sp[candled - 1], topY() - 40, 6); back();
        if (candled >= candles) { fingerOff(); ctx.timeout(finish, 650); }
      });
    }
    function finish() {                                            // 완성! 모두 모여 박수
      finished = true; clearTray(); setDots(0); ctx.sfx('celebrate');
      // 케이크를 가리지 않게: 폰은 접시 앞 모래밭, 가로는 트레이가 있던 오른쪽 빈자리에 선다
      const crowd = [['baby.joy', 0.9], ['nemo_kids.kid1', 1.2], ['wife.joy', 1.3], ['husband.joy', 1.3]];
      crowd.forEach((c, i) => {
        const h = (wide ? 140 : 108) * c[1] / 1.2, x = wide ? 500 + i * 62 : 54 + i * 84, feet = wide ? ctx.H - 6 : plateY + 130 + (i % 2) * 12;
        const im = ctx.img(c[0]); im.style.cssText = `position:absolute;left:${x - h * 0.4}px;top:${feet - h}px;height:${h}px;width:auto;z-index:4`; root.appendChild(im);
        ctx.timeout(() => GF.jump(im), 150 + i * 130);
      });
      ctx.timeout(() => ctx.done({ mistakes }), 1500);
    }
    function fingerOff() { if (finger) { finger.remove(); finger = null; } tray.forEach((t) => t.el.classList.remove('hintglow')); }
    root.__cake = () => ({ phase, stacked, layers: L.length });
    startLayers();
    ctx.setHint((lv) => {
      if (finished || !tray.length) return;
      const tk = phase === 'layers' ? tray.find((t) => t.it === stacked) : tray[0]; if (!tk) return;
      if (lv === 1) {
        fingerOff(); finger = GF.el('div', 'finger', root);
        finger.style.left = tk.home.x + tsz / 2 + 'px'; finger.style.top = tk.home.y + tsz / 2 + 'px'; finger.style.transition = 'left 1.1s ease-in-out, top 1.1s ease-in-out';
        requestAnimationFrame(() => requestAnimationFrame(() => { if (finger) { finger.style.left = cx + 'px'; finger.style.top = topY() - 10 + 'px'; } }));
      } else tk.el.classList.add('hintglow');
    });
  },
  free(diff) { return { layers: [2, 3, 4][diff - 1], deco: [1, 3, 5][diff - 1], candles: diff === 3 ? 2 : 0 }; },
});
