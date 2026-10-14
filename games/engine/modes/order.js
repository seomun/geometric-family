/* 크기 순서 — 흩어진 물고기를 작은 것부터(또는 큰 것부터) 점선 칸에 끌어다 줄 세운다. (D12 4권 19장 토끼전, 글자 없음, 크기 비교·순서)
   cfg: {n: 3|4|5, dir: 'up'(작은→큰) | 'down'(큰→작은)}. 맞는 칸이면 붙고 아니면 제자리로 돌아간다(틀린 횟수만 ★에 반영). 힌트: 1단 = 다음에 놓을 물고기 반짝, 2단 = 그 칸 반짝. */
GF.mode('order', {
  land: false,
  setup(root, cfg, ctx) {
    const W = ctx.W, H = ctx.H, n = Math.max(3, Math.min(5, cfg.n | 0 || 3)), down = cfg.dir === 'down', SZ = { 3: [34, 62, 96], 4: [32, 50, 72, 96], 5: [28, 42, 58, 76, 96] }[n];
    const COL = ['#8FD3F4', '#FFC933', '#FF8FA8', '#B7C2F2', '#6CCB8A'];
    const fish = (c) => `<svg viewBox="0 0 100 60" style="width:100%;height:100%;display:block"><path d="M8 30C24 6 62 4 80 30C62 56 24 54 8 30z" fill="${c}" stroke="#4A3030" stroke-width="4" stroke-linejoin="round"/><path d="M78 30l18-16v32z" fill="${c}" stroke="#4A3030" stroke-width="4" stroke-linejoin="round"/><circle cx="26" cy="26" r="4" fill="#fff" stroke="#4A3030" stroke-width="2"/><circle cx="27" cy="26" r="1.8" fill="#4A3030"/><path d="M34 40q8 5 16 0" fill="none" stroke="#4A3030" stroke-width="3" stroke-linecap="round"/></svg>`;
    const dots = GF.el('div', 'seqdots', root); dots.style.top = '14px'; const dd = Array.from({ length: n }, () => GF.el('i', '', dots));
    let seed = ((cfg.seed || 3) * 9301 + 49297) % 233280; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    // 칸: 윗줄에 나란히(칸 순서대로 목표 크기), 놓이는 물고기는 칸에 붙는다
    const rank = (slot) => (down ? n - 1 - slot : slot), slotW = Math.min(112, Math.floor((W - 24 - 8 * (n - 1)) / n)), sx0 = (W - (n * slotW + (n - 1) * 8)) / 2, sy = 74, slots = [];
    for (let i = 0; i < n; i++) {
      const sz = SZ[rank(i)], s = GF.el('div', 'ordslot', root); s.style.cssText += `;left:${sx0 + i * (slotW + 8)}px;top:${sy}px;width:${slotW}px;height:${Math.round(slotW * 0.62)}px`;
      const gh = GF.el('div', 'ordghost', s, fish('#4A3030')); gh.style.cssText += `;width:${Math.round(sz / 96 * (slotW - 10))}px;height:${Math.round(sz / 96 * (slotW - 10) * 0.6)}px`; slots.push({ el: s, rank: rank(i), filled: null, i });
    }
    // 물고기: 아래 영역에 흩어 놓는다
    const fishes = []; const rs = Array.from({ length: n }, (_, k) => k); for (let i = n - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; [rs[i], rs[j]] = [rs[j], rs[i]]; }
    const area0 = sy + Math.round(slotW * 0.62) + 40, aw = W - 24;
    let placed = 0, mistakes = 0, finished = false;
    rs.forEach((rk, k) => {
      const w = Math.round(SZ[rk] / 96 * (slotW - 10)), h = Math.round(w * 0.6), cx = 12 + ((k + 0.5) / n) * aw, x = Math.max(8, Math.min(W - w - 8, cx - w / 2)), y = area0 + 20 + ((k * 53 + (rnd() * 40)) % Math.max(60, H - area0 - 120));
      const f = GF.el('div', 'ordfish', root, fish(COL[rk % COL.length])); f.style.cssText += `;left:${x}px;top:${y}px;width:${w}px;height:${h}px`; f.dataset.rank = rk; f.dataset.hx = x; f.dataset.hy = y;
      const rec = { el: f, rank: rk, placed: false, w, h }; fishes.push(rec);
      let ox = 0, oy = 0, drag = false;
      f.addEventListener('pointerdown', (e) => { e.preventDefault(); if (rec.placed || finished) return; drag = true; try { f.setPointerCapture(e.pointerId); } catch (x2) { /* 캡처 실패 */ } const r = f.getBoundingClientRect(), rt = root.getBoundingClientRect(), kk = rt.width / W || 1; ox = (e.clientX - r.left) / kk; oy = (e.clientY - r.top) / kk; f.classList.add('drag'); ctx.sfx('tap'); });
      f.addEventListener('pointermove', (e) => { if (!drag) return; const rt = root.getBoundingClientRect(), kk = rt.width / W || 1; f.style.left = ((e.clientX - rt.left) / kk - ox) + 'px'; f.style.top = ((e.clientY - rt.top) / kk - oy) + 'px'; });
      const end = (e) => {
        if (!drag) return; drag = false; f.classList.remove('drag'); const fb = f.getBoundingClientRect(), cx2 = fb.left + fb.width / 2, cy2 = fb.top + fb.height / 2;
        let best = null, bd = 1e9; slots.forEach((s) => { const b = s.el.getBoundingClientRect(), d = Math.hypot(cx2 - (b.left + b.width / 2), cy2 - (b.top + b.height / 2)); if (!s.filled && d < bd) { bd = d; best = s; } });
        const rt = root.getBoundingClientRect(), kk = rt.width / W || 1;
        if (best && bd < Math.max(64, slotW * 0.75)) {
          if (best.rank === rec.rank) {
            best.filled = rec; rec.placed = true; f.classList.add('ok'); const b = best.el.getBoundingClientRect(); f.style.transition = 'left .2s, top .2s'; f.style.left = ((b.left + b.width / 2 - fb.width / 2 - rt.left) / kk) + 'px'; f.style.top = ((b.top + b.height / 2 - fb.height / 2 - rt.top) / kk) + 'px';
            placed++; dd[placed - 1].classList.add('on'); ctx.sfx('ok'); if (placed >= n) { finished = true; ctx.timeout(() => ctx.done({ mistakes }), 800); } return;
          }
          mistakes++; ctx.sfx('hmm'); best.el.classList.add('tilt'); ctx.timeout(() => best.el.classList.remove('tilt'), 400);
        }
        f.style.transition = 'left .25s, top .25s'; f.style.left = f.dataset.hx + 'px'; f.style.top = f.dataset.hy + 'px'; ctx.timeout(() => { f.style.transition = ''; }, 300);
      };
      f.addEventListener('pointerup', end); f.addEventListener('pointercancel', end);
    });
    root.__order = { fishes, slots, n, down, get placed() { return placed; } };
    ctx.setHint((lv) => { const nextSlot = slots.find((s) => !s.filled); if (!nextSlot) return; const fi = fishes.find((q) => !q.placed && q.rank === nextSlot.rank); if (fi) { fi.el.classList.add('hl'); ctx.timeout(() => fi.el.classList.remove('hl'), 1600); } if (lv >= 2) { nextSlot.el.classList.add('hl'); ctx.timeout(() => nextSlot.el.classList.remove('hl'), 1600); } });
  },
  free(diff) { return { n: 2 + diff, dir: diff === 3 ? 'down' : 'up', seed: 3 + diff }; },
});
