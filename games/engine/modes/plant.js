/* 꽃 심기 — 바구니의 점 개수만큼 꽃을 심고 ✓ 를 누른다. (3편 11장 봄·어버이날, 수 세기)
   cfg: {n:심을 개수 1~6}. 모자라거나 넘치면 갸웃(꽃이 살짝 시들었다 돌아옴) — 다시 세어 보면 된다. 구멍을 다시 누르면 꽃을 뽑는다. */
GF.mode('plant', {
  land: false,
  setup(root, cfg, ctx) {
    const n = cfg.n, W = ctx.W; let mistakes = 0, finished = false; const planted = new Set();
    const COL = ['#FF8FA8', '#FFC933', '#FF6B6B', '#B197FC', '#8FD3F4', '#FF9F43'];
    const cue = GF.el('div', 'seqdots', root); cue.style.top = '14px';
    Array.from({ length: n }, () => { const d = GF.el('i', '', cue); d.style.background = '#FF8FA8'; d.style.borderColor = '#D95F7C'; });
    const flower = (c) => `<svg viewBox="0 0 80 100" style="width:100%;height:100%"><path d="M40 98V50" stroke="#4A9B5A" stroke-width="6" stroke-linecap="round"/><path d="M40 80q-18-4-24-18q18 0 24 18zM40 74q18-4 24-18q-18 0-24 18z" fill="#6CCB8A" stroke="#4A3030" stroke-width="2.4"/><g stroke="#4A3030" stroke-width="2.6">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="40" cy="22" rx="12" ry="17" fill="${c}" transform="rotate(${a} 40 40)"/>`).join('')}<circle cx="40" cy="40" r="11" fill="#FFE27A"/></g><circle cx="36" cy="38" r="2" fill="#4A3030"/><circle cx="44" cy="38" r="2" fill="#4A3030"/><path d="M36 44q4 3 8 0" fill="none" stroke="#4A3030" stroke-width="2" stroke-linecap="round"/></svg>`;
    const size = 88, gap = 14, x0 = (W - (3 * size + 2 * gap)) / 2, y0 = 96, holes = [];
    for (let i = 0; i < 9; i++) {
      const x = x0 + (i % 3) * (size + gap), y = y0 + ((i / 3) | 0) * (size + gap), d = GF.el('div', 'plhole', root); d.dataset.i = i; d.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px`;
      d.innerHTML = '<svg viewBox="0 0 90 90" style="position:absolute;inset:0"><ellipse cx="45" cy="64" rx="38" ry="18" fill="#8A5A3B" stroke="#4A3030" stroke-width="3.4"/><ellipse cx="45" cy="60" rx="30" ry="12" fill="#6B4528"/></svg>';
      holes.push({ el: d, x, y, on: false });
      d.addEventListener('pointerdown', (e) => {
        e.preventDefault(); if (finished) return; const h = holes[i];
        if (!h.on) { h.on = true; planted.add(i); h.fl = GF.el('div', 'plfl', d, flower(COL[i % COL.length])); GF.jump(h.fl); ctx.sfx('drop'); } else { h.on = false; planted.delete(i); h.fl.remove(); ctx.sfx('tap'); }
        cue.querySelectorAll('i').forEach((c, k) => { c.style.opacity = k < planted.size ? 0.35 : 1; });
      });
    }
    const ok = GF.el('button', 'big plok', root, (window.UK ? UK.icon('check') : '✓')); ok.style.cssText += `;left:${W / 2 - 42}px;top:${y0 + 3 * (size + gap) + 18}px`;
    ok.addEventListener('pointerdown', (e) => {
      e.preventDefault(); if (finished) return;
      if (planted.size === n) { finished = true; ctx.sfx('ok'); holes.filter((h) => h.on).forEach((h, k) => ctx.timeout(() => { GF.jump(h.fl); GF.burst(root, h.x + size / 2, h.y + 30, 8); }, k * 90)); ctx.timeout(() => ctx.done({ mistakes }), 1100); }
      else { mistakes++; ctx.sfx('hmm'); holes.filter((h) => h.on).forEach((h) => { h.fl.classList.add('wilt'); ctx.timeout(() => h.fl.classList.remove('wilt'), 700); }); ok.classList.add('tilt'); ctx.timeout(() => ok.classList.remove('tilt'), 600); }
    });
    root.__plant = { holes, ok, n };
    ctx.setHint((lv) => { cue.classList.add('blink'); ctx.timeout(() => cue.classList.remove('blink'), 1600); if (lv >= 2) { const free = holes.find((h) => !h.on), t = planted.size < n && free ? free.el : planted.size > n ? holes.find((h) => h.on).el : ok; GF.jump(t); } });
  },
  free(diff) { return { n: 2 + Math.min(4, diff + 1) }; },
});
