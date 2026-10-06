/* 같은 얼굴 찾기 — 카드를 뒤집어 같은 표정 짝을 찾는다. cfg: {faces:[id...]} 또는 {pairs:n, from:'wife'} */
GF.mode('faces', {
  land: true,
  setup(root, cfg, ctx) {
    let ids = cfg.faces;
    if (!ids) {
      // 작은 카드에서 헷갈리는 표정(good·calm·smug·bad 는 비슷, cry·worry 는 비슷)은 한 판에 같이 내지 않는다
      const GROUPS = [['good', 'calm', 'smug', 'bad'], ['cry', 'worry'], ['joy', 'wink']];
      const pool = Object.keys(GF.data.chars).filter((k) => k.startsWith(cfg.from + '.'));
      const np = Math.max(2, Math.min(5, cfg.pairs + (ctx.level || 0))), used = new Set();
      ids = [];
      ctx.shuffle(pool).forEach((k) => { const e = k.split('.')[1], gi = GROUPS.findIndex((g_) => g_.includes(e)); if (ids.length < np && !(gi >= 0 && used.has(gi)) && !['bad', 'calm', 'smug'].includes(e)) { ids.push(k); if (gi >= 0) used.add(gi); } });
    }
    const n = ids.length, total = n * 2, wide = ctx.W > 400;
    const rows = wide ? (total <= 4 ? 1 : 2) : null, cols = wide ? Math.ceil(total / rows) : { 2: 2, 3: 3, 4: 2, 5: 2, 6: 3 }[n] || 3, rowsN = wide ? rows : Math.ceil(total / cols);
    const gap = 10, X = wide ? 12 : 12, Wd = ctx.W - 24, Ht = wide ? ctx.H - 28 : 548;
    const cw = (Wd - gap * (cols - 1)) / cols, chh = Math.min((Ht - gap * (rowsN - 1)) / rowsN, cw * 1.3);
    const oy = 12 + (Ht - (chh * rowsN + gap * (rowsN - 1))) / 2;
    const cards = ctx.shuffle(ids.concat(ids)).map((id, i) => {
      const c = GF.el('div', 'fcard', root), r = Math.floor(i / cols), k = i % cols;
      c.style.cssText = `left:${X + (Wd - (cols * cw + (cols - 1) * gap)) / 2 + k * (cw + gap)}px;top:${oy + r * (chh + gap)}px;width:${cw}px;height:${chh}px`;
      const inn = GF.el('div', 'in', c);
      const bk = GF.el('div', 'b', inn); const sil = ctx.img('baby.good'); sil.style.cssText = 'position:absolute;left:14%;top:14%;width:72%;height:72%;object-fit:contain;filter:brightness(0) invert(1) opacity(.9)'; bk.appendChild(sil);   // 막둥이 실루엣 (기호 아님)
      const f = GF.el('div', 'f', inn); f.appendChild(ctx.img(id));
      return { c, id, up: false, matched: false };
    });
    let first = null, lock = false, mistakes = 0, left = n;
    const clearGlow = () => cards.forEach((x) => x.c.classList.remove('glow'));
    cards.forEach((cd) => {
      cd.c.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (lock || cd.up || cd.matched) return;
        cd.up = true; cd.c.classList.add('up'); ctx.sfx('flip'); clearGlow();
        if (!first) { first = cd; return; }
        const a = first; first = null;
        if (a.id === cd.id) {
          a.matched = cd.matched = true; left--;
          ctx.timeout(() => { [a, cd].forEach((x) => x.c.classList.add('match', 'pop')); ctx.sfx('ok'); }, 380);
          if (left === 0) ctx.timeout(() => ctx.done({ mistakes }), 1300);
        } else {
          mistakes++; lock = true;
          ctx.timeout(() => { ctx.sfx('no'); a.up = cd.up = false; a.c.classList.remove('up'); cd.c.classList.remove('up'); lock = false; }, 950);
        }
      });
    });
    ctx.setHint((lv) => {
      clearGlow();
      const pend = cards.filter((x) => !x.matched && !x.up); if (!pend.length) return;
      let mate;
      if (first) mate = pend.filter((x) => x.id === first.id);
      else mate = pend.filter((x) => x.id === pend[0].id);
      (lv === 1 ? mate.slice(0, 1) : mate).forEach((x) => x.c.classList.add('glow'));
    });
  },
  free(diff) { return { pairs: [2, 3, 4][diff - 1], from: 'wife' }; },
});
