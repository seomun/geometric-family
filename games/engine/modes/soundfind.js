/* 소리 찾기 — 소리가 나면 그 소리의 그림을 고른다. (2편 7장, 청각)
   cfg: {cards:[그림 id…], learn?:true}   learn(A단계)이면 소리와 함께 정답 그림이 같이 움직여 소리↔그림을 배운다.
   B·C단계는 틀리거나 가만히 있을 때 정답 그림이 움직이며 힌트가 된다(소리가 애매해도 풀 수 있게). 큰 스피커 버튼으로 몇 번이든 다시 듣는다. */
GF.mode('soundfind', {
  land: true,
  setup(root, cfg, ctx) {
    const wide = ctx.W > 400, cards = cfg.cards, n = cards.length;
    const target = cards[Math.floor(Math.random() * n)];
    root.__target = target; root.__ready = false;
    let mistakes = 0, finished = false, wrongs = 0;
    // ---- 배치: 위쪽 가운데 스피커 버튼, 아래 카드 ----
    const sp = 84, spTop = 12;
    const area0 = spTop + sp + 22, areaH = ctx.H - area0 - 16, gap = 20;
    const cols = wide ? n : 2, rows = Math.ceil(n / cols);
    const size = Math.min((ctx.W - 80 - (cols - 1) * gap) / cols, (areaH - (rows - 1) * gap) / rows, 160);
    const els = {};
    cards.forEach((id, i) => {
      const r = Math.floor(i / cols), c = i % cols, inRow = r === rows - 1 ? n - r * cols : cols;
      const x = (ctx.W - (inRow * size + (inRow - 1) * gap)) / 2 + c * (size + gap), y = area0 + (areaH - (rows * size + (rows - 1) * gap)) / 2 + r * (size + gap);
      const d = GF.el('div', 'sfcard sf', root, GF.icons[id]); d.dataset.card = id;
      d.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px`;
      els[id] = { el: d, cx: x + size / 2, cy: y + size / 2 };
    });
    // 스피커 버튼(다시 듣기)
    const btn = GF.el('button', 'big sfspeaker', root, '<svg viewBox="0 0 32 32"><path d="M5 12h5l7-6v20l-7-6H5z" fill="#fff"/><path d="M21 11a7 7 0 0 1 0 10M24 7a12 12 0 0 1 0 18" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></svg>');
    btn.style.cssText = `left:${(ctx.W - sp) / 2}px;top:${spTop}px;width:${sp}px;height:${sp}px`;
    const animate = (id, ms = 1500) => { const e = els[id].el; e.classList.remove('play'); void e.offsetWidth; e.classList.add('play'); ctx.timeout(() => e.classList.remove('play'), ms); };
    const sayIt = (helpAnim) => {
      btn.classList.add('pulse'); ctx.timeout(() => btn.classList.remove('pulse'), 1200);
      ctx.sfx('snd_' + target); if (helpAnim) animate(target);
    };
    btn.addEventListener('pointerdown', (e) => { e.preventDefault(); if (finished) return; sayIt(false); });
    ctx.timeout(() => { sayIt(!!cfg.learn); root.__ready = true; }, 800);
    cards.forEach((id) => {
      els[id].el.addEventListener('pointerdown', (e) => {
        e.preventDefault(); if (finished || !root.__ready) return;
        if (id === target) {
          finished = true; root.__ready = false; animate(id, 1800); ctx.sfx('ok'); els[id].el.classList.add('right');
          GF.burst(root, els[id].cx, els[id].cy, 14);
          ctx.timeout(() => ctx.sfx('snd_' + target), 500);
          ctx.timeout(() => ctx.done({ mistakes }), 1700);
        } else {
          mistakes++; wrongs++; ctx.sfx('hmm'); els[id].el.classList.add('tilt'); ctx.timeout(() => els[id].el.classList.remove('tilt'), 700);
          ctx.timeout(() => sayIt(wrongs >= 2), 1000);                     // 두 번 틀리면 다시 들려줄 때 정답 그림이 같이 움직인다
        }
      });
    });
    ctx.setHint((lv) => { if (finished || !root.__ready) return; if (lv === 1) sayIt(true); else els[target].el.classList.add('hintglow'); });
  },
  free(diff) {
    const all = ['swallow', 'bell', 'drum', 'train', 'drop', 'gourd', 'wind', 'clap'];
    return { cards: GF.shuffle(all).slice(0, [2, 3, 4][diff - 1]), learn: diff === 1 };
  },
});
