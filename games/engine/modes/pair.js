/* 연못 짝 찾기 — 연잎 카드를 눌러 뒤집어 같은 그림 한 쌍을 찾는다. (D12 4권 18장 선녀와 나무꾼, 글자 없음, 기억·같은 그림 찾기)
   cfg: {cards: 4|6|8, deck: [그림 id…](쌍 수만큼 앞에서 사용), peek: 처음에 모두 보여 주는 시간(ms)}. 틀린 쌍은 1초 뒤 다시 엎어지고 틀린 횟수만 ★에 반영. 맞히면 연꽃이 핀다. 놓친 건 없음. */
GF.mode('pair', {
  land: false,
  setup(root, cfg, ctx) {
    const W = ctx.W, H = ctx.H, N = Math.max(2, Math.min(5, (cfg.cards | 0) / 2 || 2)), deck = (cfg.deck && cfg.deck.length ? cfg.deck : ['baby.joy', 'nemo_kids.kid1', 'wife.joy', 'husband.joy', 'nemo_mom.joy']).slice(0, N);
    const cols = N <= 2 ? 2 : N === 3 ? 3 : 4, rows = Math.ceil(N * 2 / cols), top = 96, gap = 12, cw = Math.min(104, Math.floor((W - 24 - gap * (cols - 1)) / cols)), ch = Math.min(124, Math.floor((H - top - 40 - gap * (rows - 1)) / rows));
    let seed = ((cfg.seed || 7) * 9301 + 49297) % 233280; const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
    const order = deck.flatMap((id, k) => [{ id, k }, { id, k }]); for (let i = order.length - 1; i > 0; i--) { const j = (rnd() * (i + 1)) | 0; [order[i], order[j]] = [order[j], order[i]]; }
    const dots = GF.el('div', 'seqdots', root); dots.style.top = '14px'; const dd = Array.from({ length: N }, () => GF.el('i', '', dots));
    const x0 = (W - (cols * cw + (cols - 1) * gap)) / 2, cards = []; let open = [], busy = true, matched = 0, mistakes = 0, finished = false;
    const pad = '<svg viewBox="0 0 100 100" style="width:100%;height:100%;position:absolute;inset:0"><ellipse cx="50" cy="56" rx="44" ry="38" fill="#6CCB8A" stroke="#3E9B5F" stroke-width="4"/><path d="M50 56L82 40" stroke="#3E9B5F" stroke-width="4" stroke-linecap="round"/><ellipse cx="36" cy="46" rx="10" ry="6" fill="#8FE0A6" opacity=".7"/></svg>';
    order.forEach((o, i) => {
      const c = GF.el('button', 'prcard', root); const r = Math.floor(i / cols), q = i % cols;
      c.style.cssText += `;left:${x0 + q * (cw + gap)}px;top:${top + r * (ch + gap)}px;width:${cw}px;height:${ch}px`;
      const back = GF.el('div', 'prback', c, pad), face = GF.el('div', 'prface', c); face.appendChild(ctx.img(o.id));
      const rec = { el: c, id: o.id, k: o.k, up: false, done: false, face, back }; cards.push(rec);
      c.addEventListener('pointerdown', (e) => { e.preventDefault(); flip(rec); });
    });
    const show = (rec, on) => { rec.up = on; rec.el.classList.toggle('up', on); };
    function flip(rec) {
      if (busy || finished || rec.up || rec.done) return; show(rec, true); ctx.sfx('tap'); open.push(rec);
      if (open.length < 2) return; busy = true; const [a, b] = open; open = [];
      if (a.k === b.k) { ctx.timeout(() => { a.done = b.done = true; a.el.classList.add('ok'); b.el.classList.add('ok'); ctx.sfx('ok'); GF.jump(a.el); GF.jump(b.el); matched++; dd[matched - 1].classList.add('on'); busy = false; if (matched >= N) { finished = true; ctx.timeout(() => ctx.done({ mistakes }), 700); } }, 350); }
      else { mistakes++; ctx.timeout(() => { ctx.sfx('hmm'); a.el.classList.add('tilt'); b.el.classList.add('tilt'); }, 450); ctx.timeout(() => { show(a, false); show(b, false); a.el.classList.remove('tilt'); b.el.classList.remove('tilt'); busy = false; }, 1100); }
    }
    cards.forEach((c) => show(c, true)); ctx.timeout(() => { cards.forEach((c) => show(c, false)); busy = false; }, cfg.peek || 1400);      // 처음에 잠깐 모두 보여 준다
    root.__pair = { cards, flip: (i) => flip(cards[i]), get busy() { return busy; }, N, pairs: deck };
    ctx.setHint((lv) => { const un = cards.filter((c) => !c.done); if (!un.length) return; const k = un[0].k, two = un.filter((c) => c.k === k); two.forEach((c) => { c.el.classList.add('hl'); ctx.timeout(() => c.el.classList.remove('hl'), 1600); }); if (lv >= 2 && !busy) { two.forEach((c) => show(c, true)); ctx.timeout(() => { two.forEach((c) => { if (!c.done) show(c, false); }); }, 900); } });
  },
  free(diff) { return { cards: 2 + diff * 2, deck: ['baby.joy', 'nemo_kids.kid1', 'wife.joy', 'husband.joy', 'nemo_mom.joy'], peek: 1600 - diff * 250, seed: 5 + diff }; },
});
