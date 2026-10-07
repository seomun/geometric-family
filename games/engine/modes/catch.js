/* 눈송이 잡기 — 위에 보이는 색의 눈송이만 톡 눌러 잡는다. (3편 14장 첫눈, 색 고르기·반응)
   cfg: {target:색 번호 0~2, need:잡을 개수, speed:떨어지는 시간(ms)}. 다른 색을 누르면 갸웃(틀린 횟수만 ★에 반영), 놓친 눈송이는 그냥 쌓인다. */
GF.mode('catch', {
  land: false,
  setup(root, cfg, ctx) {
    const W = ctx.W, H = ctx.H, need = cfg.need, COL = ['#8FD3F4', '#FF8FA8', '#FFC933'], target = cfg.target; let caught = 0, mistakes = 0, finished = false, spawned = 0;
    const flake = (c) => `<svg viewBox="0 0 80 80" style="width:100%;height:100%"><g stroke="${c}" stroke-width="7" stroke-linecap="round"><path d="M40 8v64M12 24l56 32M12 56l56-32"/></g><circle cx="40" cy="40" r="11" fill="#fff" stroke="#4A3030" stroke-width="3"/><circle cx="36" cy="38" r="1.8" fill="#4A3030"/><circle cx="44" cy="38" r="1.8" fill="#4A3030"/><path d="M36 44q4 3 8 0" fill="none" stroke="#4A3030" stroke-width="1.8" stroke-linecap="round"/></svg>`;
    const cue = GF.el('div', 'ctcue', root, flake(COL[target])); const dots = GF.el('div', 'seqdots', root); dots.style.top = '14px'; dots.style.left = '16px'; dots.style.right = 'auto';
    const dd = Array.from({ length: need }, () => GF.el('i', '', dots));
    const drop = () => {
      if (finished) return; spawned++;
      const sz = 58, x = 6 + Math.random() * (W - sz - 12), c = (spawned % 3 === 1 || Math.random() < 0.36) ? target : (target + 1 + ((Math.random() * 2) | 0)) % 3;
      const d = GF.el('div', 'ctflake', root, flake(COL[c])); d.style.cssText += `;left:${x}px;top:-70px;width:${sz}px;height:${sz}px;transition:transform ${cfg.speed}ms linear`; d.dataset.c = c;
      requestAnimationFrame(() => requestAnimationFrame(() => { d.style.transform = `translateY(${H + 90}px)`; }));
      ctx.timeout(() => d.remove(), cfg.speed + 200);
      d.addEventListener('pointerdown', (e) => {
        e.preventDefault(); if (finished || d.dataset.done) return; d.dataset.done = 1;
        if (c === target) { caught++; ctx.sfx('ok'); dd[caught - 1].classList.add('on'); const rr = d.getBoundingClientRect(), rt = root.getBoundingClientRect(), k = rt.width / W; GF.burst(root, (rr.left - rt.left) / k + sz / 2, (rr.top - rt.top) / k + sz / 2, 6); d.style.opacity = 0; if (caught >= need) { finished = true; ctx.timeout(() => ctx.done({ mistakes }), 900); } }
        else { mistakes++; ctx.sfx('hmm'); d.classList.add('tilt'); ctx.timeout(() => d.remove(), 500); }
      });
      ctx.timeout(drop, 520 + Math.random() * 420);
    };
    ctx.timeout(drop, 500); root.__catch = { need, target };
    ctx.setHint((lv) => { cue.classList.add('blink'); ctx.timeout(() => cue.classList.remove('blink'), 1600); if (lv >= 2) root.querySelectorAll('.ctflake').forEach((f) => { if (+f.dataset.c === target) f.classList.add('hl'); }); });
  },
  free(diff) { return { target: diff % 3, need: 4 + diff, speed: 5200 - diff * 400 }; },
});
