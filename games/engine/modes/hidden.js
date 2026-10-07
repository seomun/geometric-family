/* 숨은 그림 찾기 — 낙엽 더미 속에 숨은 도형 친구를 찾는다. (3편 13장 가을, 숨은 도형)
   cfg: {find:[{c:가족 0·1·2}…](찾을 도형), leaves:낙엽 수, seed}. 낙엽을 눌러도 괜찮다(살짝 흔들릴 뿐). 못 찾으면 힌트가 반짝인다. */
GF.mode('hidden', {
  land: false,
  setup(root, cfg, ctx) {
    const W = ctx.W, H = ctx.H, F = cfg.find, N = cfg.leaves || 16; let found = 0, mistakes = 0, finished = false, misses = 0;
    const COL = ['#E8870F', '#C9531A', '#FFC933', '#D9735A', '#A9744F'], FC = ['#F6C28B', '#8FD3F4', '#B7C2F2'];
    const shape = (c) => { const st = `fill="${FC[c]}" stroke="#4A3030" stroke-width="4" stroke-linejoin="round"`, b = c === 0 ? `<rect x="14" y="14" width="72" height="72" rx="16" ${st}/>` : c === 1 ? `<path d="M50 10L92 84H8z" ${st}/>` : `<circle cx="50" cy="50" r="40" ${st}/>`; const fy = c === 1 ? 62 : 50; return `<svg viewBox="0 0 100 100" style="width:100%;height:100%">${b}<circle cx="40" cy="${fy}" r="3.6" fill="#4A3030"/><circle cx="60" cy="${fy}" r="3.6" fill="#4A3030"/><path d="M42 ${fy + 11}q8 6 16 0" fill="none" stroke="#4A3030" stroke-width="3" stroke-linecap="round"/></svg>`; };
    const leaf = (c) => `<svg viewBox="0 0 100 100" style="width:100%;height:100%"><path d="M50 8C80 24 94 52 50 94C6 52 20 24 50 8z" fill="${c}" stroke="#4A3030" stroke-width="3.4" stroke-linejoin="round"/><path d="M50 14v78M50 40l-16-12M50 56l18-14M50 70l-14-10" fill="none" stroke="#4A3030" stroke-width="2.4" stroke-linecap="round" opacity=".6"/></svg>`;
    const cue = GF.el('div', 'hdcue', root); const marks = F.map((f) => GF.el('div', '', cue, shape(f.c)));
    let seed = (cfg.seed || 7) * 9301; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    const top = 84, items = [], P = [];
    const place = (sz) => { for (let t = 0; t < 40; t++) { const x = 8 + rnd() * (W - sz - 16), y = top + rnd() * (H - top - sz - 24); if (P.every((p) => Math.hypot(p.x - x, p.y - y) > sz * 0.42)) { P.push({ x, y }); return { x, y }; } } const x = 8 + rnd() * (W - sz - 16), y = top + rnd() * (H - top - sz - 24); P.push({ x, y }); return { x, y }; };
    const mk = (cls, html, x, y, sz, z) => { const d = GF.el('div', cls, root, html); d.style.cssText += `;left:${x}px;top:${y}px;width:${sz}px;height:${sz}px;z-index:${z}`; return d; };
    F.forEach((f, i) => {
      const p = place(58), d = mk('hdfind', shape(f.c), p.x, p.y, 58, 2); d.dataset.i = i; items.push({ el: d, done: false, p });
      d.addEventListener('pointerdown', (e) => { e.preventDefault(); if (finished || items[i].done) return; items[i].done = true; found++; ctx.sfx('ok'); d.classList.add('got'); marks[i].classList.add('got'); GF.jump(d); GF.burst(root, p.x + 29, p.y + 29, 8); if (found === F.length) { finished = true; ctx.timeout(() => ctx.done({ mistakes }), 1000); } });
    });
    for (let i = 0; i < N; i++) {
      const sz = 56 + rnd() * 26, p = place(sz), d = mk('hdleaf', leaf(COL[i % COL.length]), p.x, p.y, sz, rnd() < 0.55 ? 3 : 1); d.style.transform = `rotate(${(rnd() * 360) | 0}deg)`;
      d.addEventListener('pointerdown', (e) => { e.preventDefault(); if (finished) return; ctx.sfx('tap'); d.classList.add('rustle'); ctx.timeout(() => d.classList.remove('rustle'), 400); if (++misses % 6 === 0) mistakes++; });
    }
    root.__hidden = { items };
    ctx.setHint((lv) => { const t = items.find((x) => !x.done); if (!t) return; t.el.style.zIndex = 5; GF.jump(t.el); if (lv >= 2) GF.burst(root, t.p.x + 29, t.p.y + 29, 8); });
  },
  free(diff) { return { find: Array.from({ length: Math.min(4, 2 + diff) }, (_, i) => ({ c: i % 3 })), leaves: 16 + diff * 2, seed: 3 + diff }; },
});
