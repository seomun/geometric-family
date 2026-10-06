/* 색칠하기 — 어떤 그림이든(캐릭터 PNG·코드 SVG) 윤곽선만 남기고 칸 채우기로 칠한다.
   cfg: {id, colors: 3|5|8, fills: 칠해야 할 큰 칸 수}
   원리: 윤곽 색(#4A3030)과의 거리로 "선 층"을 만들고, 선이 아닌 연결 영역을 칸으로 라벨링한다. 칸을 톡 → 그 칸만 색 채움. */
GF.mode('paint', {
  land: true,
  setup(root, cfg, ctx) {
    const wide = ctx.W > 400, X0 = wide ? 20 : 0, areaW = wide ? 520 : 360, top0 = wide ? 12 : 86;
    const COLORS = ['#FF6B6B', '#FFA94D', '#FFE066', '#69DB7C', '#4DABF7', '#B197FC', '#FFA8C5', '#A67C52'];
    const PICK = { 3: [0, 2, 4], 5: [0, 2, 3, 4, 6], 8: [0, 1, 2, 3, 4, 5, 6, 7] };
    const pal = PICK[cfg.colors].map((i) => COLORS[i]);
    let sel = 0, filledBig = 0, finger = null, ready = false, doneBtn = null, need = cfg.fills;
    const K = 1.5;                                                   // 작업 해상도 배율
    const asp = GF.aspect(cfg.id);
    let dh = wide ? ctx.H - 28 : pal.length > 5 ? 370 : 410, dw = dh * asp;
    if (dw > (wide ? 500 : 330)) { dw = wide ? 500 : 330; dh = dw / asp; }
    const WW = Math.round(dw * K), HH = Math.round(dh * K), N = WW * HH;

    const wrap = GF.el('div', 'abs', root);
    wrap.style.cssText = `left:${(X0 + (areaW - dw) / 2)}px;top:${top0 + (dh0() - dh) / 2}px;width:${dw}px;height:${dh}px;touch-action:none`;
    function dh0() { return wide ? ctx.H - 28 : pal.length > 5 ? 370 : 410; }
    const fillC = GF.el('canvas', '', wrap), lineC = GF.el('canvas', '', wrap);
    [fillC, lineC].forEach((c) => { c.width = WW; c.height = HH; c.style.cssText = `position:absolute;left:0;top:0;width:${dw}px;height:${dh}px;pointer-events:none`; });
    const page = GF.el('div', 'abs', root);
    page.style.cssText = `left:${(X0 + (areaW - dw) / 2) - 8}px;top:${top0 + (dh0() - dh) / 2 - 8}px;width:${dw + 16}px;height:${dh + 16}px;background:#fff;border-radius:22px;box-shadow:0 5px 0 rgba(0,0,0,.12)`;
    root.insertBefore(page, wrap);

    // 팔레트
    const per = wide ? 2 : pal.length > 5 ? 4 : pal.length, prow = Math.ceil(pal.length / per), ps = wide ? 62 : pal.length > 5 ? 46 : 56;
    const swatches = pal.map((col, i) => {
      const r = Math.floor(i / per), c = i % per, inRow = r === prow - 1 ? pal.length - r * per : per;
      const x = wide ? 566 + c * (ps + 14) : (360 - (inRow * (ps + 10) - 10)) / 2 + c * (ps + 10), y = wide ? 26 + r * (ps + 12) : (pal.length > 5 ? 468 : 500) + r * (ps + 8);
      const s = GF.el('button', 'round-btn', root); s.style.cssText = `left:${x}px;top:${y}px;width:${ps}px;height:${ps}px;position:absolute;background:${col}`;
      s.onclick = () => { sel = i; ctx.sfx('tap'); mark(); }; return s;
    });
    function mark() { swatches.forEach((s, i) => { s.style.boxShadow = i === sel ? '0 0 0 5px #3A2E39, 0 3px 0 rgba(0,0,0,.2)' : '0 3px 0 rgba(0,0,0,.14)'; s.style.transform = i === sel ? 'scale(1.12)' : 'none'; }); }
    mark();

    // 이미지 → 선 층 + 칸 라벨
    const im = new Image(); let lab, regs = [], alpha, fillData, fctx;
    im.onload = () => {
      const oc = document.createElement('canvas'); oc.width = WW; oc.height = HH;
      const o = oc.getContext('2d'); o.drawImage(im, 0, 0, WW, HH);
      const d = o.getImageData(0, 0, WW, HH).data;
      const lineData = lineC.getContext('2d').createImageData(WW, HH), ld = lineData.data;
      alpha = new Uint8Array(N); lab = new Int32Array(N);
      const fillable = new Uint8Array(N), INK = [74, 48, 48];
      for (let i = 0; i < N; i++) {
        const a = d[i * 4 + 3], dist = Math.hypot(d[i * 4] - INK[0], d[i * 4 + 1] - INK[1], d[i * 4 + 2] - INK[2]);
        alpha[i] = a;
        const s = Math.max(0, Math.min(1, (140 - dist) / 100));
        ld[i * 4] = INK[0]; ld[i * 4 + 1] = INK[1]; ld[i * 4 + 2] = INK[2]; ld[i * 4 + 3] = Math.round(a * s);
        fillable[i] = a > 128 && dist >= 110 ? 1 : 0;
      }
      lineC.getContext('2d').putImageData(lineData, 0, 0);
      // 연결 영역 라벨 (4방향)
      const stack = new Int32Array(N); let L = 0;
      for (let i = 0; i < N; i++) {
        if (!fillable[i] || lab[i]) continue;
        L++; let sp = 0, area = 0, sx = 0, sy = 0; stack[sp++] = i; lab[i] = L;
        while (sp) {
          const p = stack[--sp], x = p % WW, y = (p / WW) | 0; area++; sx += x; sy += y;
          if (x > 0 && fillable[p - 1] && !lab[p - 1]) { lab[p - 1] = L; stack[sp++] = p - 1; }
          if (x < WW - 1 && fillable[p + 1] && !lab[p + 1]) { lab[p + 1] = L; stack[sp++] = p + 1; }
          if (y > 0 && fillable[p - WW] && !lab[p - WW]) { lab[p - WW] = L; stack[sp++] = p - WW; }
          if (y < HH - 1 && fillable[p + WW] && !lab[p + WW]) { lab[p + WW] = L; stack[sp++] = p + WW; }
        }
        regs[L] = { id: L, area, cx: sx / area, cy: sy / area, color: -1, big: false };
      }
      // 큰 칸 기준: 전체의 0.5% 이상 (눈동자 하이라이트 같은 점은 제외)
      const opaque = alpha.reduce((a, v) => a + (v > 128 ? 1 : 0), 0), minBig = Math.max(250, opaque * 0.005);
      regs.forEach((r) => { if (r) r.big = r.area >= minBig; });
      need = Math.min(cfg.fills, regs.filter((r) => r && r.big).length);   // 칸이 모자란 그림이어도 끝낼 수 있게
      // 칸의 대표점: 중심에서 가장 가까운 칸 픽셀
      const best = {};
      for (let i = 0; i < N; i++) { const l = lab[i]; if (!l) continue; const x = i % WW, y = (i / WW) | 0, dd = (x - regs[l].cx) ** 2 + (y - regs[l].cy) ** 2; if (!best[l] || dd < best[l].d) best[l] = { d: dd, x, y }; }
      regs.forEach((r) => { if (r) { r.px = best[r.id].x; r.py = best[r.id].y; } });
      fctx = fillC.getContext('2d'); fillData = fctx.createImageData(WW, HH);
      ready = true;
      root.__pts = (all) => { const rc = wrap.getBoundingClientRect(); return regs.filter((r) => r && (all || r.big)).sort((a, b) => b.area - a.area).map((r) => ({ x: rc.left + (r.px / WW) * rc.width, y: rc.top + (r.py / HH) * rc.height })); };
    };
    im.src = GF.src(cfg.id);

    function paintRegion(r, color) {
      const c = [parseInt(color.slice(1, 3), 16), parseInt(color.slice(3, 5), 16), parseInt(color.slice(5, 7), 16)], fd = fillData.data, L = r.id;
      const put = (p) => { fd[p * 4] = c[0]; fd[p * 4 + 1] = c[1]; fd[p * 4 + 2] = c[2]; fd[p * 4 + 3] = 255; };
      for (let p = 0; p < N; p++) {
        if (lab[p] !== L) continue; put(p);
        const x = p % WW, y = (p / WW) | 0;           // 선 아래로 2px 번지게 (가장자리 틈 방지)
        for (let k = 1; k <= 2; k++) {
          if (x - k >= 0 && !lab[p - k] && alpha[p - k]) put(p - k);
          if (x + k < WW && !lab[p + k] && alpha[p + k]) put(p + k);
          if (y - k >= 0 && !lab[p - k * WW] && alpha[p - k * WW]) put(p - k * WW);
          if (y + k < HH && !lab[p + k * WW] && alpha[p + k * WW]) put(p + k * WW);
        }
      }
      fctx.putImageData(fillData, 0, 0);
    }
    function labelAt(x, y) {
      x = Math.round(x); y = Math.round(y);
      if (x < 0 || y < 0 || x >= WW || y >= HH) return 0;
      if (lab[y * WW + x]) return lab[y * WW + x];
      for (let rad = 2; rad <= 22; rad += 2) {                       // 손가락이 선 위에 닿았을 때 가까운 칸으로
        let bestL = 0, bd = 1e9;
        for (let dy = -rad; dy <= rad; dy += 2) for (let dx = -rad; dx <= rad; dx += 2) {
          const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= WW || yy >= HH) continue;
          const l = lab[yy * WW + xx]; if (l && regs[l].area >= 60 && dx * dx + dy * dy < bd) { bd = dx * dx + dy * dy; bestL = l; }
        }
        if (bestL) return bestL;
      }
      return 0;
    }
    wrap.addEventListener('pointerdown', (e) => {
      if (!ready) return; e.preventDefault();
      const rc = wrap.getBoundingClientRect(), L = labelAt(((e.clientX - rc.left) / rc.width) * WW, ((e.clientY - rc.top) / rc.height) * HH);
      if (!L) { ctx.sfx('tap'); return; }
      const r = regs[L], wasNew = r.color < 0; r.color = sel; paintRegion(r, pal[sel]); ctx.sfx('pick');
      if (finger) { finger.remove(); finger = null; }
      if (wasNew && r.big) { filledBig++; if (filledBig === need) showDone(); }
    });
    function showDone() {
      ctx.sfx('star');
      doneBtn = GF.el('button', 'big pop', root, GF.IC.play.replace('M10 5l16 11-16 11z', 'M6 17l7 7 14-15'));
      doneBtn.firstChild.setAttribute('fill', 'none'); doneBtn.firstChild.firstChild.setAttribute('fill', 'none');
      doneBtn.firstChild.firstChild.setAttribute('stroke', '#fff'); doneBtn.firstChild.firstChild.setAttribute('stroke-width', '5');
      doneBtn.style.cssText = wide ? 'position:absolute;left:588px;top:' + (ctx.H - 100) + 'px;width:80px;height:80px;z-index:6' : 'position:absolute;left:272px;top:2px;width:76px;height:76px;z-index:6';
      doneBtn.onclick = () => { ctx.sfx('pick'); doneBtn.remove(); ctx.done({ mistakes: 0 }); };
    }
    // 힌트: 아직 안 칠한 가장 큰 칸을 손가락이 가리킨다
    ctx.setHint((lv) => {
      if (!ready || doneBtn) return;
      const r = regs.filter((x) => x && x.big && x.color < 0).sort((a, b) => b.area - a.area)[0]; if (!r) return;
      if (finger) finger.remove();
      finger = GF.el('div', 'finger', root);
      finger.style.left = (X0 + (areaW - dw) / 2) + (r.px / WW) * dw + 'px'; finger.style.top = top0 + (dh0() - dh) / 2 + (r.py / HH) * dh + 'px';
      if (lv === 2) finger.classList.add('glow');
    });
  },
  free(diff) {
    const pool = ['art.sun', 'art.moon', 'art.star', 'wife.good', 'wife.joy', 'baby.joy', 'dong_dad.good', 'nemo_dad.good', 'nemo_mom.good', 'nemo_kids.kid1'];
    return { id: GF.rnd(pool), colors: [3, 5, 8][diff - 1], fills: [3, 4, 6][diff - 1] };
  },
});
