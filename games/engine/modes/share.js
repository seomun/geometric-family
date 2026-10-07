/* 똑같이 나눠요 — 수박 조각을 접시마다 한 개씩 차례로 나눠 준다. (3편 12장 여름, 나눔=네모 맛)
   cfg: {pieces:조각 수, plates:접시 수(조각이 접시 수의 배수), heroes:[접시 주인 캐릭터]}. 다 나눴는데 개수가 다르면 갸웃하고 조각이 돌아온다. */
GF.mode('share', {
  land: false,
  setup(root, cfg, ctx) {
    const P = cfg.pieces, Q = cfg.plates, per = P / Q, W = ctx.W; let left = P, mistakes = 0, finished = false; const got = Array(Q).fill(0);
    const wm = (big) => `<svg viewBox="0 0 120 70" style="width:100%;height:100%"><path d="M6 8h108a54 54 0 0 1-108 0z" fill="#FF6B6B" stroke="#4A3030" stroke-width="3.4" stroke-linejoin="round"/><path d="M12 14a48 48 0 0 0 96 0" fill="none" stroke="#6CCB8A" stroke-width="7"/>${big ? '<g fill="#4A3030"><ellipse cx="40" cy="28" rx="3" ry="5"/><ellipse cx="60" cy="38" rx="3" ry="5"/><ellipse cx="80" cy="28" rx="3" ry="5"/></g>' : ''}</svg>`;
    const pile = GF.el('div', 'shpile', root, wm(true)); pile.style.cssText += `;left:${W / 2 - 64}px;top:36px`;
    const cnt = GF.el('div', 'shleft', root); cnt.style.cssText += `;left:${W / 2 - 120}px;top:122px;width:240px`;
    const showLeft = () => { cnt.innerHTML = ''; for (let i = 0; i < left; i++) GF.el('i', '', cnt); };
    showLeft();
    const pw = Math.min(150, (W - 24 - (Q - 1) * 12) / Q), plates = [];
    for (let i = 0; i < Q; i++) {
      const x = (W - (Q * pw + (Q - 1) * 12)) / 2 + i * (pw + 12), y = 196, d = GF.el('div', 'shplate', root); d.style.cssText = `left:${x}px;top:${y}px;width:${pw}px;height:${pw + 60}px`;
      d.innerHTML = '<div class="who"></div><div class="sl"></div><svg viewBox="0 0 120 40" style="width:100%;height:40px;display:block;position:absolute;bottom:0"><ellipse cx="60" cy="22" rx="56" ry="15" fill="#fff" stroke="#4A3030" stroke-width="3.4"/></svg>';
      d.querySelector('.who').appendChild(ctx.img(cfg.heroes[i % cfg.heroes.length]));
      plates.push({ el: d, x, y, w: pw });
      d.addEventListener('pointerdown', (e) => {
        e.preventDefault(); if (finished || left <= 0) return; left--; got[i]++; ctx.sfx('drop'); showLeft(); const s = GF.el('div', 'slc', d.querySelector('.sl'), wm(false)); GF.jump(s);
        if (left === 0) ctx.timeout(check, 500);
      });
    }
    function check() {
      if (got.every((g) => g === per)) { finished = true; ctx.sfx('ok'); plates.forEach((p, k) => ctx.timeout(() => { GF.jump(p.el); GF.burst(root, p.x + p.w / 2, p.y + 40, 8); }, k * 120)); ctx.timeout(() => ctx.done({ mistakes }), 1200); }
      else { mistakes++; ctx.sfx('hmm'); plates.forEach((p, i) => { p.el.classList.add('tilt'); ctx.timeout(() => { p.el.classList.remove('tilt'); p.el.querySelector('.sl').innerHTML = ''; }, 650); got[i] = 0; }); ctx.timeout(() => { left = P; showLeft(); }, 700); }
    }
    root.__share = { plates, per, P, Q };
    ctx.setHint((lv) => { const m = Math.min(...got), t = plates[got.indexOf(m)]; GF.jump(t.el); if (lv >= 2) GF.burst(root, t.x + t.w / 2, t.y + 20, 6); });
  },
  free(diff) { return { pieces: [4, 6, 6, 8][Math.min(3, diff)], plates: [2, 2, 3, 2][Math.min(3, diff)], heroes: ['baby.joy', 'nemo_kids.kid1', 'wife.joy'] }; },
});
