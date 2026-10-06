/* 꾸미기 — 소품을 끌어(또는 톡) 캐릭터의 자리에 붙인다. 다 붙이면 "찰칵!" 사진 한 장. (2편 8장, 창작)
   cfg: {who:'wife.joy', slots:['hat','face','hand','bg']}  자리마다 소품 3개 중 하나를 고른다. 정답·오답이 없고(실패 없음), 고른 대로 사진이 된다.
   소품 = GF.props(id 로 교체 가능), 캐릭터 자리표 = data/anchors.json (tools/gen_anchors.py). */
GF.mode('dress', {
  land: true,
  setup(root, cfg, ctx) {
    const wide = ctx.W > 400, A0 = GF.data.anchors, who = cfg.who, key = /^nemo_kids\./.test(who) ? who : who.split('.')[0] + '.good', A = A0[key];
    const slots = cfg.slots.slice();
    // ---- 사진 카드(캐릭터가 서는 곳) ----
    const cw = wide ? 330 : 300, chh = wide ? ctx.H - 28 : 330, cx0 = wide ? 36 : (ctx.W - cw) / 2, cy0 = wide ? 14 : 70;
    const card = GF.el('div', 'dresscard', root); card.style.cssText = `left:${cx0}px;top:${cy0}px;width:${cw}px;height:${chh}px;background:linear-gradient(#FFF6E5,#FFE9C7)`;
    const asp = GF.aspect(who), ih = chh * 0.7, iw = ih * asp, ix = (cw - iw) / 2, iy = chh - ih - 8;     // 큰 소품(모자·지팡이)이 카드 밖으로 잘리지 않게 위·옆 여백을 둔다
    const deco = GF.el('div', 'abs', card); deco.style.cssText = 'inset:0;pointer-events:none';
    const ch = ctx.img(who); ch.style.cssText = `position:absolute;left:${ix}px;top:${iy}px;width:${iw}px;height:${ih}px;pointer-events:none`; card.appendChild(ch);
    const look = {}; let si = 0, finished = false, finger = null;
    const base = (name) => {                                    // 자리표(이미지 비율 → 카드 안 픽셀)
      if (name === 'mouth') return [ix + A.face[0] * iw, iy + A.face[1] * ih + A.eyeDist * iw * 0.55];
      const q = A[name]; return [ix + q[0] * iw, iy + q[1] * ih];
    };
    const widthOf = (p) => {
      const ref = p.ref === 'eye' ? A.eyeDist * iw : p.ref === 'neck' ? A.neckW * iw : A.bodyW * iw;
      let w = ref * p.k; if (p.maxBody) w = Math.min(w, A.bodyW * iw * p.maxBody); return w;
    };
    function attach(id) {                                       // 소품을 카드의 캐릭터에 붙인다
      const p = GF.props[id], w = widthOf(p), el = GF.propEl(id, w), pt = base(p.to);
      el.style.left = pt[0] - p.ax * w + 'px'; el.style.top = pt[1] - p.ay * w * p.ar + 'px'; el.style.zIndex = p.z; el.classList.add('propin');
      card.appendChild(el); return { el, pt };
    }
    // ---- 자리 링 + 트레이 ----
    const ring = GF.el('div', 'dpring', card); ring.style.display = 'none';
    const trayItems = [];
    const tsize = wide ? 108 : 100, tgap = wide ? 16 : 12;
    function fillTray() {
      trayItems.forEach((t) => t.el.remove()); trayItems.length = 0;
      const slot = slots[si], list = slot === 'bg' ? GF.propSlots.bg : GF.propsFor(slot, who);
      // 링: 이번 자리에 붙을 곳
      if (slot === 'bg') { ring.style.display = 'none'; } else {
        const p = GF.props[list[0]], pt = base(p.to), r = Math.max(46, Math.min(widthOf(p) * 0.55, 64));
        ring.style.display = 'block'; ring.style.cssText += `;left:${pt[0] - r}px;top:${pt[1] - r}px;width:${2 * r}px;height:${2 * r}px`;
      }
      list.forEach((id, i) => {
        const x = wide ? 450 + ((ctx.W - 450 - tsize) / 2) : (ctx.W - (3 * tsize + 2 * tgap)) / 2 + i * (tsize + tgap);
        const y = wide ? 18 + i * (tsize + 14) : cy0 + chh + 28;
        const el = GF.el('div', 'dpitem', root); el.dataset.item = id;
        el.style.cssText = `left:${x}px;top:${y}px;width:${tsize}px;height:${tsize}px`;
        if (GF.propBGs[id]) { const b = GF.propBGs[id]; el.innerHTML = `<div class="dpthumb" style="background:${b.css}"><svg viewBox="0 0 100 100" style="position:absolute;inset:0;width:100%;height:100%">${b.deco}</svg></div>`; }
        else { const p = GF.props[id]; let w0 = tsize * 0.84; if (p.ar * w0 > tsize * 0.86) w0 = tsize * 0.86 / p.ar; const q = GF.propEl(id, w0); q.style.left = (tsize - w0) / 2 + 'px'; q.style.top = (tsize - w0 * p.ar) / 2 + 'px'; el.appendChild(q); }
        const tk = { el, id, home: { x, y } };
        GF.drag(el, {
          start() { if (finished) return; el.classList.remove('back'); el.classList.add('drag'); tk.moved = 0; ctx.sfx('tap'); },
          move(nx, ny) { if (finished) return; tk.moved = Math.max(tk.moved, Math.hypot(nx - tk.home.x, ny - tk.home.y)); el.style.left = nx + 'px'; el.style.top = ny + 'px'; },
          end() {
            if (finished) return; el.classList.remove('drag'); ctx.sfx('drop');
            const ex = parseFloat(el.style.left) + tsize / 2, ey = parseFloat(el.style.top) + tsize / 2;
            const inCard = ex > cx0 && ex < cx0 + cw && ey > cy0 && ey < cy0 + chh;
            if (tk.moved < 12 || inCard) { choose(tk); } else { el.classList.add('back'); el.style.left = tk.home.x + 'px'; el.style.top = tk.home.y + 'px'; }
          },
        });
        trayItems.push(tk);
      });
    }
    function choose(tk) {                                       // 소품을 골랐다 → 붙인다
      const id = tk.id, slot = slots[si]; look[slot] = id; ctx.sfx('ok'); fingerOff();
      if (GF.propBGs[id]) { card.style.background = GF.propBGs[id].css; deco.innerHTML = '<svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%">' + GF.propBGs[id].deco + '</svg>'; GF.burst(root, cx0 + cw / 2, cy0 + 40, 12); }
      else { const a = attach(id); GF.burst(root, cx0 + a.pt[0], cy0 + a.pt[1], 14); }
      GF.jump(ch); si++;
      trayItems.forEach((t) => { t.el.style.pointerEvents = 'none'; t.el.style.opacity = 0; });      // 고른 뒤 트레이는 바로 사라진다(빈 칸이 남지 않게)
      if (si >= slots.length) ctx.timeout(snapshot, 500); else ctx.timeout(fillTray, 420);
    }
    function snapshot() {                                       // 찰칵! 사진
      finished = true; ring.style.display = 'none'; trayItems.forEach((t) => t.el.remove());
      const fl = GF.el('div', 'abs', root); fl.style.cssText = 'inset:-3000px;background:#fff;z-index:30;opacity:0;pointer-events:none'; fl.animate([{ opacity: 0 }, { opacity: 0.95 }, { opacity: 0 }], { duration: 380 }).onfinish = () => fl.remove();
      ctx.sfx('shutter'); card.classList.add('photo'); GF.burst(root, cx0 + cw / 2, cy0 + chh / 2, 20);
      try { const l = GF.state.looks = GF.state.looks || []; l.unshift({ c: who, p: look, t: Date.now() }); l.length = Math.min(l.length, 12); GF.Store.save(); } catch (e) {}   // 설정값만 저장(사진 파일 없음)
      ctx.timeout(() => ctx.done({ mistakes: 0 }), 900);
    }
    function fingerOff() { if (finger) { finger.remove(); finger = null; } ring.classList.remove('glow2'); }
    root.__dress = { slots }; fillTray();
    ctx.setHint((lv) => {
      if (finished || !trayItems.length) return;
      if (lv === 1) {
        fingerOff(); finger = GF.el('div', 'finger', root); const t = trayItems[0];
        finger.style.left = t.home.x + tsize / 2 + 'px'; finger.style.top = t.home.y + tsize / 2 + 'px'; finger.style.transition = 'left 1.1s ease-in-out, top 1.1s ease-in-out';
        const tgt = slots[si] === 'bg' ? [cw / 2, 60] : base(GF.props[GF.propsFor(slots[si], who)[0]].to);
        requestAnimationFrame(() => requestAnimationFrame(() => { if (finger) { finger.style.left = cx0 + tgt[0] + 'px'; finger.style.top = cy0 + tgt[1] + 'px'; } }));
      } else ring.classList.add('glow2');
    });
  },
  free(diff) {
    const who = GF.rnd(['baby.joy', 'nemo_kids.kid1', 'nemo_kids.kid2', 'nemo_kids.kid3', 'wife.joy', 'husband.joy', 'nemo_mom.joy', 'nemo_dad.joy']);
    return { who, slots: [['hat'], ['hat', 'face', 'hand'], ['hat', 'face', 'neck', 'hand', 'bg']][diff - 1] };
  },
});
