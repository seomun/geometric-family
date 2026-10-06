/* 그림자 찾기 — 캐릭터를 같은 그림자 위로 끌어 놓는다. cfg: {tokens:[{id, s?}]}  s = 크기 배율(크기 순서 놀이) */
GF.mode('shadow', {
  setup(root, cfg, ctx) {
    const items = cfg.tokens.map((t) => ({ id: t.id, s: t.s || 1, key: t.id + '@' + (t.s || 1) }));
    const n = items.length, rows = n <= 3 ? 1 : 2, cols = Math.ceil(n / rows);
    const AW = ctx.AW - 20, cw = AW / cols, ch = rows === 1 ? 250 : 135, base = Math.min(cw - 14, ch - 10, ctx.AW > 400 ? 175 : 150);
    const slots = [];
    const toks = [];
    let mistakes = 0, left = n, finger = null;
    const rowX = (r, c) => { const inRow = r === rows - 1 ? n - r * cols : cols; return ctx.AX + 10 + (AW - inRow * cw) / 2 + c * cw; };

    items.forEach((it, i) => {
      const r = Math.floor(i / cols), c = i % cols, x0 = rowX(r, c), y0 = 14 + r * ch;
      const bh = base * it.s, bw = bh * GF.aspect(it.id);
      const ring = GF.el('div', 'slotring', root);
      ring.style.cssText = `left:${x0 + (cw - bw) / 2 - 6}px;top:${y0 + ch - bh - 12}px;width:${bw + 12}px;height:${bh + 12}px`;
      const im = ctx.img(it.id, 'shadowimg');
      im.style.cssText = `left:${x0 + (cw - bw) / 2}px;top:${y0 + ch - bh - 6}px;width:${bw}px;height:${bh}px`;
      root.appendChild(im);
      slots.push({ key: it.key, cx: x0 + cw / 2, cy: y0 + ch - bh / 2 - 6, w: bw, h: bh, ring, filled: false });
    });

    function fingerOff() {
      if (finger) { finger.remove(); finger = null; }
      slots.forEach((s) => s.ring.classList.remove('glow'));
    }

    ctx.shuffle(items.map((_, i) => i)).forEach((idx, pos) => {
      const it = items[idx], r = Math.floor(pos / cols), c = pos % cols, x0 = rowX(r, c);
      const bh = base * it.s, bw = bh * GF.aspect(it.id);
      const yb = rows === 1 ? 330 + 215 : 330 + r * 120 + 112;
      const t = GF.el('div', 'tok', root);
      t.style.cssText = `left:${x0 + (cw - bw) / 2}px;top:${yb - bh}px;width:${bw}px;height:${bh}px`;
      t.appendChild(ctx.img(it.id));
      const tk = { el: t, it, home: { x: parseFloat(t.style.left), y: parseFloat(t.style.top) }, w: bw, h: bh, done: false };
      toks.push(tk);
      GF.drag(t, {
        start() { if (tk.done) return; t.classList.remove('back'); t.classList.add('drag'); ctx.sfx('tap'); },
        move(x, y) { if (!tk.done) { t.style.left = x + 'px'; t.style.top = y + 'px'; } },
        end() {
          if (tk.done) return;
          t.classList.remove('drag'); ctx.sfx('drop');
          const cx = parseFloat(t.style.left) + bw / 2, cy = parseFloat(t.style.top) + bh / 2;
          let best = null, bd = 1e9;
          slots.forEach((s) => { const d = Math.hypot(s.cx - cx, s.cy - cy); if (d < bd && !s.filled) { bd = d; best = s; } });
          const reach = best ? Math.max(Math.max(best.w, best.h) * 0.7, 60) : 0;
          if (best && bd < reach) {
            if (best.key === it.key) {
              best.filled = true; tk.done = true; t.classList.add('done', 'pop');
              t.style.left = best.cx - bw / 2 + 'px'; t.style.top = best.cy - bh / 2 + 'px';
              best.ring.style.borderColor = '#6CCB8A'; best.ring.style.borderStyle = 'solid';
              ctx.sfx('ok'); fingerOff(); GF.snap(t); GF.burst(root, best.cx, best.cy, 14);
              if (--left === 0) ctx.timeout(() => ctx.done({ mistakes }), 700);
              return;
            }
            mistakes++; ctx.sfx('no'); t.classList.add('tilt'); setTimeout(() => t.classList.remove('tilt'), 700);
          }
          t.classList.add('back'); t.style.left = tk.home.x + 'px'; t.style.top = tk.home.y + 'px';
        },
      });
    });

    // 힌트: 1단계 손가락이 정답 칸으로, 2단계 칸이 반짝
    ctx.setHint((lv) => {
      const tk = toks.find((t) => !t.done); if (!tk) return;
      const s = slots.find((q) => q.key === tk.it.key);
      if (lv === 1) {
        fingerOff(); finger = GF.el('div', 'finger', root);
        finger.style.left = tk.home.x + tk.w / 2 + 'px'; finger.style.top = tk.home.y + tk.h / 2 + 'px';
        finger.style.transition = 'left 1.1s ease-in-out, top 1.1s ease-in-out';
        requestAnimationFrame(() => requestAnimationFrame(() => { if (finger) { finger.style.left = s.cx + 'px'; finger.style.top = s.cy + 'px'; } }));
      } else s.ring.classList.add('glow');
    });
  },
  free(diff) {
    const pool = ['wife.good', 'wife.joy', 'dong_dad.good', 'dong_dad.joy', 'baby.good', 'nemo_dad.good', 'nemo_mom.good', 'nemo_kids.kid1', 'nemo_kids.kid2', 'nemo_kids.kid3'];
    if (diff >= 3 && Math.random() < 0.4) { const id = GF.rnd(pool); return { tokens: [{ id, s: 1 }, { id, s: 0.72 }, { id, s: 0.5 }] }; }
    const n = [2, 3, 4][diff - 1] + (diff === 3 ? Math.floor(Math.random() * 2) : 0);
    return { tokens: GF.shuffle(pool).slice(0, n).map((id) => ({ id })) };
  },
});
