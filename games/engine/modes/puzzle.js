/* 퍼즐 조각 — 흩어진 조각을 끌어 그림을 완성한다. cfg: {id, pieces: 2|4|6}  (그림 = 캐릭터 PNG 또는 'art.*') */
GF.mode('puzzle', {
  land: true,
  setup(root, cfg, ctx) {
    const wide = ctx.W > 400;
    const LAYOUT = { 2: [2, 1, 300], 4: [2, 2, 280], 6: [2, 3, 235] };       // [열, 행, 판 높이]
    const sizes = [2, 4, 6];
    const n = sizes[Math.max(0, Math.min(2, sizes.indexOf(cfg.pieces) + (ctx.level || 0)))];
    const [cols, rows, bh0] = LAYOUT[n];
    const cr = GF.crop(cfg.id), asp = cr.asp, src = GF.src(cfg.id);
    let bh = wide ? Math.min(ctx.H - 40, bh0 * 1.2) : bh0, bw = bh * asp;
    if (bw > (wide ? 280 : 320)) { bw = wide ? 280 : 320; bh = bw / asp; }
    const bx = wide ? 24 + (340 - bw) / 2 : (360 - bw) / 2, by = wide ? 16 + (ctx.H - 40 - bh) / 2 : 16, cw = bw / cols, chh = bh / rows;

    // 판 (흐린 그림 + 칸 선)
    const board = GF.el('div', 'abs', root);
    board.style.cssText = `left:${bx - 8}px;top:${by - 8}px;width:${bw + 16}px;height:${bh + 16}px;background:#fff;border-radius:22px;box-shadow:0 5px 0 rgba(0,0,0,.12)`;
    const bgW = bw / (cr.x1 - cr.x0), bgH = bh / (cr.y1 - cr.y0), bgPos = (c0, r0) => `${-(cr.x0 * bgW + c0)}px ${-(cr.y0 * bgH + r0)}px/${bgW}px ${bgH}px no-repeat`;
    const ghost = GF.el('div', 'abs', board); ghost.style.cssText = `left:8px;top:8px;width:${bw}px;height:${bh}px;opacity:.16;filter:grayscale(1);background:url("${src}") ${bgPos(0, 0)}`;
    const cells = [];
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const d = GF.el('div', 'slotring', root);
      d.dataset.cell = r * cols + c; d.style.cssText = `left:${bx + c * cw}px;top:${by + r * chh}px;width:${cw}px;height:${chh}px;border-radius:10px;border-width:3px`;
      cells.push({ r, c, cx: bx + c * cw + cw / 2, cy: by + r * chh + chh / 2, ring: d, filled: false, key: r * cols + c });
    }

    // 조각 트레이 (아래, 칸 크기 그대로)
    const trayCx = wide ? 540 : 180, trayW = wide ? ctx.W - 420 : 340;
    const trayTop = wide ? 20 : by + bh + 40, trayH = wide ? ctx.H - 40 : 576 - trayTop - 12;
    const perRow = Math.floor(trayW / (cw + 8)) || 1, trows = Math.ceil(n / perRow);
    const rowH = Math.min(chh + 10, trayH / trows), rowOff = wide ? Math.max(0, (trayH - trows * rowH) / 2) : 0;
    const order = ctx.shuffle(cells.map((c) => c.key));
    let left = n, mistakes = 0, finger = null;
    const pieces = order.map((key, pos) => {
      const cell = cells[key], row = Math.floor(pos / perRow), inRow = row === trows - 1 ? n - row * perRow : perRow;
      const col = pos % perRow, x = trayCx - (inRow * (cw + 8) - 8) / 2 + col * (cw + 8), y = trayTop + rowOff + row * rowH + Math.max(0, (rowH - chh) / 2);
      const p = GF.el('div', 'tok', root); p.dataset.cell = key;
      p.style.cssText = `left:${x}px;top:${y}px;width:${cw}px;height:${chh}px;background:#fff url("${src}") ${bgPos(cell.c * cw, cell.r * chh)};border-radius:10px;box-shadow:0 0 0 3px #8FD3F4,0 4px 0 rgba(0,0,0,.15)`;
      const pc = { el: p, cell, home: { x, y }, done: false };
      GF.drag(p, {
        start() { if (pc.done) return; p.classList.remove('back'); p.classList.add('drag'); ctx.sfx('tap'); },
        move(nx, ny) { if (!pc.done) { p.style.left = nx + 'px'; p.style.top = ny + 'px'; } },
        end() {
          if (pc.done) return;
          p.classList.remove('drag'); ctx.sfx('drop');
          const cx = parseFloat(p.style.left) + cw / 2, cy = parseFloat(p.style.top) + chh / 2;
          let best = null, bd = 1e9;
          cells.forEach((c) => { const d = Math.hypot(c.cx - cx, c.cy - cy); if (d < bd && !c.filled) { bd = d; best = c; } });
          const reach = Math.max(cw, chh) * 0.75;
          if (best && bd < reach) {
            if (best === pc.cell) {
              best.filled = true; pc.done = true; p.classList.add('done', 'pop');
              p.style.left = best.cx - cw / 2 + 'px'; p.style.top = best.cy - chh / 2 + 'px';
              p.style.boxShadow = 'none'; p.style.borderRadius = '0'; best.ring.style.borderColor = 'transparent';
              ctx.sfx('ok'); fingerOff(); GF.snap(p); GF.burst(root, best.cx, best.cy, 10);
              if (--left === 0) { board.style.background = '#FFF3C2'; ctx.timeout(() => ctx.done({ mistakes }), 800); }
              return;
            }
            mistakes++; ctx.sfx('no'); p.classList.add('tilt'); setTimeout(() => p.classList.remove('tilt'), 700);
          }
          p.classList.add('back'); p.style.left = pc.home.x + 'px'; p.style.top = pc.home.y + 'px';
        },
      });
      return pc;
    });
    function fingerOff() { if (finger) { finger.remove(); finger = null; } cells.forEach((c) => c.ring.classList.remove('glow')); }
    ctx.setHint((lv) => {
      const pc = pieces.find((x) => !x.done); if (!pc) return;
      if (lv === 1) {
        fingerOff(); finger = GF.el('div', 'finger', root);
        finger.style.left = pc.home.x + cw / 2 + 'px'; finger.style.top = pc.home.y + chh / 2 + 'px';
        finger.style.transition = 'left 1.1s ease-in-out, top 1.1s ease-in-out';
        requestAnimationFrame(() => requestAnimationFrame(() => { if (finger) { finger.style.left = pc.cell.cx + 'px'; finger.style.top = pc.cell.cy + 'px'; } }));
      } else pc.cell.ring.classList.add('glow');
    });
  },
  free(diff) {
    const pool = ['wife.good', 'wife.joy', 'dong_dad.good', 'baby.joy', 'nemo_dad.good', 'nemo_mom.good', 'nemo_grandma.good', 'nemo_kids.kid1', 'art.radish'];
    return { id: GF.rnd(pool), pieces: [2, 4, 6][diff - 1] };
  },
});
