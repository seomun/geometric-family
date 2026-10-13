/* 컵 속 친구 찾기 — 컵 밑에 숨은 친구가 어느 컵인지 눈으로 따라가다 고른다. (D9 새 놀이, 글자 없음, 눈으로 따라가기·기억)
   cfg: {cups: 컵 수 2~4, swaps: 섞는 횟수, speed: 한 번 바꾸는 시간(ms), hero: 캐릭터 id}. 맨 처음 컵을 들어 친구를 보여 주고 → 덮고 → 컵끼리 자리를 바꾼 뒤 → 하나 고른다.
   틀려도 컵을 열어 빈 걸 보여 주고 다시 고르면 된다(틀린 횟수만 ★에 반영, 2번 틀리면 친구가 살짝 보인다). */
GF.mode('cups', {
  land: false,
  setup(root, cfg, ctx) {
    const W = ctx.W, H = ctx.H, N = Math.max(2, Math.min(4, cfg.cups | 0 || 3)), swaps = cfg.swaps | 0 || 3, sp = cfg.speed | 0 || 700, hero = cfg.hero || 'baby.joy';
    const CW = N === 4 ? 70 : 84, gap = Math.min(30, (W - 24 - CW * N) / Math.max(1, N - 1)), x0 = (W - (N * CW + (N - 1) * gap)) / 2, slotX = (s) => x0 + s * (CW + gap), baseY = Math.round(H * 0.5);
    const COL = ['#F6C28B', '#8FD3F4', '#B7C2F2', '#FFB3C7'];
    const cupSVG = (c) => `<svg viewBox="0 0 100 100" style="width:100%;height:100%"><path d="M18 14h64l-8 80H26z" fill="${c}" stroke="#4A3030" stroke-width="4.4" stroke-linejoin="round"/><path d="M14 14h72" stroke="#4A3030" stroke-width="6" stroke-linecap="round"/><path d="M30 34h40" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/><circle cx="42" cy="58" r="3.4" fill="#4A3030"/><circle cx="60" cy="58" r="3.4" fill="#4A3030"/><path d="M45 70q6 5 12 0" fill="none" stroke="#4A3030" stroke-width="3.2" stroke-linecap="round"/></svg>`;
    const dots = GF.el('div', 'seqdots', root); dots.style.top = '14px';
    const table = GF.el('div', 'abs cuptable', root); table.style.cssText += `;left:0;right:0;top:${baseY + CW * 1.05}px;height:14px;border-radius:7px;background:rgba(201,143,90,.55)`;
    let slotOf = Array.from({ length: N }, (_, i) => i), heroCup = (Math.random() * N) | 0, phase = 'show', wrong = 0, finished = false;       // slotOf[cup] = 지금 자리
    const cups = Array.from({ length: N }, (_, i) => {
      const box = GF.el('div', 'abs cupbox', root); box.style.cssText += `;left:${slotX(i)}px;top:${baseY}px;width:${CW}px;height:${CW * 1.05}px;transition:left ${sp}ms ease-in-out, transform ${Math.round(sp / 2)}ms ease-in-out`;
      const h = GF.el('div', 'abs cuphero', box); if (i === heroCup) { h.appendChild(ctx.img(hero)); } h.style.cssText += `;left:${CW * 0.2}px;bottom:4px;width:${CW * 0.6}px;height:${CW * 0.78}px`;
      const cup = GF.el('div', 'abs cupcup', box, cupSVG(COL[i % COL.length])); cup.style.cssText += `;left:0;top:0;width:${CW}px;height:${CW * 1.05}px;transition:transform .4s cubic-bezier(.3,1.4,.5,1)`;
      const hit = GF.el('div', 'abs', box); hit.style.cssText += ';inset:-14px;z-index:4;touch-action:none';
      hit.addEventListener('pointerdown', (e) => { e.preventDefault(); pick(i); });
      return { box, cup, h, hit };
    });
    const lift = (i, on) => { cups[i].cup.style.transform = on ? `translateY(${-CW * 0.95}px)` : 'translateY(0)'; };
    const swapStep = (k) => {
      if (k >= swaps) { phase = 'pick'; ctx.sfx('pick'); return; }
      let a = (Math.random() * N) | 0, b = (a + 1 + ((Math.random() * (N - 1)) | 0)) % N;      // 두 컵을 고른다(같은 컵 아님)
      const sa = slotOf[a], sb = slotOf[b]; slotOf[a] = sb; slotOf[b] = sa;
      cups[a].box.style.left = slotX(sb) + 'px'; cups[b].box.style.left = slotX(sa) + 'px'; cups[a].box.style.transform = 'translateY(-26px)'; cups[b].box.style.transform = 'translateY(26px)'; ctx.sfx('tap');
      ctx.timeout(() => { cups[a].box.style.transform = ''; cups[b].box.style.transform = ''; }, sp * 0.55);
      ctx.timeout(() => swapStep(k + 1), sp + 160);
    };
    function pick(i) {
      if (phase !== 'pick' || finished) return; phase = 'busy'; lift(i, true);
      if (i === heroCup) { finished = true; ctx.sfx('ok'); GF.jump(cups[i].h); GF.burst(root, slotX(slotOf[i]) + CW / 2, baseY, 10); ctx.timeout(() => ctx.done({ mistakes: wrong }), 900); }
      else { wrong++; ctx.sfx('hmm'); ctx.timeout(() => { lift(i, false); phase = 'pick'; if (wrong >= 2) { cups[heroCup].box.classList.add('wiggle'); ctx.timeout(() => cups[heroCup].box.classList.remove('wiggle'), 1200); } }, 800); }
    }
    root.__cups = { cups, N, get heroCup() { return heroCup; }, get phase() { return phase; }, slotX, get slotOf() { return slotOf; } };
    ctx.timeout(() => { lift(heroCup, true); ctx.sfx('pick'); }, 400);            // 친구를 보여 준다
    ctx.timeout(() => { lift(heroCup, false); }, 1700);
    ctx.timeout(() => { phase = 'swap'; swapStep(0); }, 2300);
    ctx.setHint(() => { if (phase === 'pick') { cups[heroCup].box.classList.add('wiggle'); ctx.timeout(() => cups[heroCup].box.classList.remove('wiggle'), 1200); } });
  },
  free(diff) { return { cups: diff >= 3 ? 4 : 3, swaps: 2 + diff * 2, speed: 760 - diff * 90, hero: ['baby.joy', 'nemo_kids.kid1', 'dong_dad.joy'][diff % 3] }; },
});
