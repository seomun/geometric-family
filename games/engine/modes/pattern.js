/* 무늬 이어 놓기 — 길에 흘린 빵 부스러기가 AB·AAB·ABC 로 이어지다 끊긴 자리에 다음 것을 골라 끼운다. (D12 4권 20장 헨젤과 그레텔, 글자 없음, 반복 무늬 읽기)
   cfg: {unit: 'AB'|'AAB'|'ABC', len: 4~7(보이는 칸 수), seed}. 보기는 셋(하나만 맞음). 색만으로 맞히는 문제가 되지 않게 모양도 항상 다르다(C14). 틀리면 갸웃하고 다시 고르면 된다(틀린 횟수만 ★에 반영). */
GF.mode('pattern', {
  land: false,
  setup(root, cfg, ctx) {
    const W = ctx.W, H = ctx.H, unit = cfg.unit || 'AB', len = Math.max(4, Math.min(7, cfg.len | 0 || 5));
    let seed = ((cfg.seed || 11) * 9301 + 49297) % 233280; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    const SHAPES = [
      (c) => `<svg viewBox="0 0 80 80" style="width:100%;height:100%"><rect x="12" y="12" width="56" height="56" rx="12" fill="${c}" stroke="#4A3030" stroke-width="4"/></svg>`,
      (c) => `<svg viewBox="0 0 80 80" style="width:100%;height:100%"><path d="M40 8L72 68H8z" fill="${c}" stroke="#4A3030" stroke-width="4" stroke-linejoin="round"/></svg>`,
      (c) => `<svg viewBox="0 0 80 80" style="width:100%;height:100%"><circle cx="40" cy="40" r="30" fill="${c}" stroke="#4A3030" stroke-width="4"/></svg>`,
      (c) => `<svg viewBox="0 0 80 80" style="width:100%;height:100%"><path d="M40 8l9 22 24 2-18 16 6 24-21-13-21 13 6-24L7 32l24-2z" fill="${c}" stroke="#4A3030" stroke-width="4" stroke-linejoin="round"/></svg>`,
    ];
    const COL = ['#F6C28B', '#8FD3F4', '#C8E86E', '#C79BF2'], tokens = [0, 1, 2, 3].sort(() => rnd() - 0.5).slice(0, 3);      // 이번 판에 쓰는 모양·색 3개(항상 한 모양에 한 색)
    const piece = (k) => SHAPES[tokens[k]](COL[tokens[k]]);
    const map = { A: 0, B: 1, C: 2 }, seq = Array.from({ length: len }, (_, i) => map[unit[i % unit.length]]), hole = len - 1, answer = seq[hole];
    const dots = GF.el('div', 'seqdots', root); dots.style.top = '14px'; const dd = [GF.el('i', '', dots)];
    const sz = Math.min(64, Math.floor((W - 24 - 8 * (len - 1)) / len)), x0 = (W - (len * sz + (len - 1) * 8)) / 2, y0 = 120;
    const path = GF.el('div', 'abs ptpath', root); path.style.cssText += `;left:${x0 - 8}px;top:${y0 + sz / 2 - 6}px;width:${len * sz + (len - 1) * 8 + 16}px;height:12px`;
    const cells = seq.map((k, i) => { const c = GF.el('div', 'abs ptcell' + (i === hole ? ' hole' : ''), root); c.style.cssText += `;left:${x0 + i * (sz + 8)}px;top:${y0}px;width:${sz}px;height:${sz}px`; if (i !== hole) c.innerHTML = piece(k); return c; });
    // 보기 셋(정답 하나 + 다른 두 모양), 순서는 섞는다
    const opts = [0, 1, 2].sort(() => rnd() - 0.5); const bsz = Math.min(84, Math.floor((W - 48 - 24) / 3)), bx0 = (W - (3 * bsz + 24)) / 2, by = Math.min(H - bsz - 40, y0 + sz + 130);
    let mistakes = 0, finished = false; const btns = opts.map((k, i) => {
      const b = GF.el('button', 'abs ptopt', root, piece(k)); b.style.cssText += `;left:${bx0 + i * (bsz + 12)}px;top:${by}px;width:${bsz}px;height:${bsz}px`; b.dataset.k = k;
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); if (finished) return; if (k === answer) { finished = true; cells[hole].classList.remove('hole'); cells[hole].innerHTML = piece(k); ctx.sfx('ok'); GF.jump(cells[hole]); GF.burst(root, x0 + hole * (sz + 8) + sz / 2, y0 + sz / 2, 8); dd[0].classList.add('on'); b.style.opacity = 0.3; ctx.timeout(() => ctx.done({ mistakes }), 900); } else { mistakes++; ctx.sfx('hmm'); b.classList.add('tilt'); ctx.timeout(() => b.classList.remove('tilt'), 500); } });
      return b;
    });
    root.__pattern = { seq, hole, answer, opts, btns, unit, tokens, solve: () => btns.find((b) => +b.dataset.k === answer).dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })) };
    ctx.setHint((lv) => { cells[hole].classList.add('hl'); ctx.timeout(() => cells[hole].classList.remove('hl'), 1600); if (lv >= 2) { const b = btns.find((q) => +q.dataset.k === answer); b.classList.add('hl'); ctx.timeout(() => b.classList.remove('hl'), 1600); } });
  },
  free(diff, i) { return { unit: ['AB', 'AAB', 'ABC'][diff - 1], len: 3 + diff + 1, seed: 11 + diff * 7 + (i | 0) }; },
});
