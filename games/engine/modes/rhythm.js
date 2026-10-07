/* 박자 맞추기 — 커지는 동그라미가 큰 원에 닿을 때 배추(절구)를 톡톡 친다. (3편 15장 김장, 박자)
   cfg: {beats:맞출 횟수, period:박자 간격(ms)}. 박자 근처에 누르면 성공, 빗나가면 부드럽게 다시. 틀린 횟수는 빗나간 2번마다 1번으로만 센다. */
GF.mode('rhythm', {
  land: false,
  setup(root, cfg, ctx) {
    const W = ctx.W, need = cfg.beats, P = cfg.period; let hits = 0, offs = 0, finished = false, last = -1;
    const cx = W / 2, cy = 270; const dots = GF.el('div', 'seqdots', root); dots.style.top = '14px'; const dd = Array.from({ length: need }, () => GF.el('i', '', dots));
    const pad = GF.el('button', 'rhpad', root); pad.style.cssText += `;left:${cx - 110}px;top:${cy - 110}px;width:220px;height:220px`;
    pad.innerHTML = '<svg viewBox="0 0 220 220" style="width:100%;height:100%"><ellipse cx="110" cy="170" rx="96" ry="34" fill="#C98F5A" stroke="#4A3030" stroke-width="4"/><path d="M30 150a80 76 0 0 1 160 0z" fill="#FFF6C8" stroke="#4A3030" stroke-width="4"/><path d="M60 140q0-40 50-60q50 20 50 60" fill="#BFE8A0" stroke="#4A3030" stroke-width="3"/><path d="M110 64q-16 20-8 56M110 64q18 18 10 56" fill="none" stroke="#6CCB8A" stroke-width="5"/><circle cx="95" cy="118" r="4" fill="#4A3030"/><circle cx="125" cy="118" r="4" fill="#4A3030"/><path d="M98 130q12 8 24 0" fill="none" stroke="#4A3030" stroke-width="3.4" stroke-linecap="round"/></svg>';
    const ring = GF.el('div', 'rhring', root); ring.style.cssText += `;left:${cx - 120}px;top:${cy - 120}px;width:240px;height:240px`;
    const mkRing = () => { const r = GF.el('div', 'rhgrow', root); r.style.cssText += `;left:${cx - 120}px;top:${cy - 120}px;width:240px;height:240px;animation-duration:${P * 2}ms`; ctx.timeout(() => r.remove(), P * 2 + 100); };
    const t0 = performance.now(); const sched = () => { if (finished) return; mkRing(); ctx.timeout(sched, P); }; sched();
    pad.addEventListener('pointerdown', (e) => {
      e.preventDefault(); if (finished) return; const now = performance.now(), idx = Math.round((now - t0) / P) - 2, d = Math.abs(now - (t0 + (idx + 2) * P));
      if (idx >= 0 && d < P * 0.34 && idx !== last) { last = idx; hits++; ctx.sfx('note' + (1 + (hits % 5))); dd[hits - 1].classList.add('on'); GF.jump(pad); GF.burst(root, cx, cy - 30, 6); if (hits >= need) { finished = true; ctx.sfx('ok'); ctx.timeout(() => ctx.done({ mistakes: Math.floor(offs / 2) }), 900); } }
      else { offs++; ctx.sfx('tap'); pad.classList.add('tilt'); ctx.timeout(() => pad.classList.remove('tilt'), 300); }
    });
    root.__rhythm = { pad, P, need, nextDelay: () => { const now = performance.now(), idx = Math.max(0, Math.ceil((now - t0) / P) - 2); return Math.max(0, t0 + (idx + 2) * P - now); } };
    ctx.setHint(() => { ring.classList.add('hl'); ctx.timeout(() => ring.classList.remove('hl'), 1600); });
  },
  free(diff) { return { beats: 4 + diff, period: 1000 - diff * 60 }; },
});
