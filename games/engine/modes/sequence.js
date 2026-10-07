/* 따라 해요 — 캐릭터 패드가 순서대로 반짝이며 소리를 내면, 같은 순서로 눌러 따라 한다. (2편 6장, 순서 기억)
   cfg: {pads:[캐릭터 id…], len:순서 길이}.  패드마다 고유 음(note1~5)이라 따라 누르면 멜로디가 된다.
   틀려도 실패가 없다: 순서를 천천히 다시 보여 줄 뿐이고, 틀린 횟수만 ★에 반영된다. */
GF.mode('sequence', {
  land: true,
  setup(root, cfg, ctx) {
    const wide = ctx.W > 400, n = cfg.pads.length;
    const len = Math.max(2, Math.min(6, cfg.len + (ctx.level || 0)));
    const FAM = (id) => (/^(wife|husband)\./.test(id) ? '#8FD3F4' : /^dong_dad\./.test(id) ? '#3B4A7A' : '#F6C28B');   // 세모=하늘 · 동그라미=남색 · 네모=살구
    // ---- 배치: 가로는 한 줄, 세로는 3·4·5개를 (3) (2×2) (3+2) 로 ----
    const top = 78, areaH = ctx.H - top - 18, gap = 22;
    const cols = wide ? n : 2, rows = Math.ceil(n / cols);        // 세로는 항상 2열(135px 안팎) — 3+2 일 때 마지막 줄은 가운데
    const size = Math.min((ctx.W - 80 - (cols - 1) * gap) / cols, (areaH - (rows - 1) * gap) / rows, wide ? 150 : 150);
    const board = GF.el('div', 'padboard', root);          // 배경 소품(기차·시계)과 패드를 분리하는 흐린 판
    const pads = cfg.pads.map((id, i) => {
      const r = Math.floor(i / cols), c = i % cols, inRow = r === rows - 1 ? n - r * cols : cols;
      const x = (ctx.W - (inRow * size + (inRow - 1) * gap)) / 2 + c * (size + gap), y = top + (areaH - (rows * size + (rows - 1) * gap)) / 2 + r * (size + gap);
      const d = GF.el('div', 'pad', root); d.dataset.pad = i;
      d.style.cssText = `left:${x}px;top:${y}px;width:${size}px;height:${size}px;border:5px solid ${FAM(id)}`;
      d.appendChild(ctx.img(id));
      return { el: d, id, i, cx: x + size / 2, cy: y + size / 2 };
    });
    { const xs = pads.map((p) => p.cx), ys = pads.map((p) => p.cy), m = size / 2 + 18; board.style.cssText = `left:${Math.min(...xs) - m}px;top:${Math.min(...ys) - m}px;width:${Math.max(...xs) - Math.min(...xs) + 2 * m}px;height:${Math.max(...ys) - Math.min(...ys) + 2 * m}px`; }
    // ---- 순서 점(몇 번째까지 맞췄는지) ----
    const dotsEl = GF.el('div', 'seqdots', root); const dots = Array.from({ length: len }, () => GF.el('i', '', dotsEl));
    // ---- 순서 뽑기: 같은 패드가 연속으로 나오지 않게 ----
    const seq = []; for (let k = 0; k < len; k++) { let v; do { v = Math.floor(Math.random() * n); } while (n > 1 && seq[k - 1] === v); seq.push(v); }
    root.__seq = seq; root.__ready = false;
    let pos = 0, mistakes = 0, ready = false, slow = 1, finished = false;
    const light = (p, ms) => {
      p.el.classList.add('lit'); ctx.sfx('note' + (p.i + 1)); GF.jump(p.el.firstChild);
      ctx.timeout(() => p.el.classList.remove('lit'), ms);
    };
    function show() {                                              // 순서를 보여 준다 (틀릴 때마다 조금 더 천천히)
      ready = false; root.__ready = false; pads.forEach((p) => p.el.classList.remove('turn', 'hint'));
      dots.forEach((d) => d.classList.remove('on')); pos = 0;
      const step = 760 * slow, on = 520 * slow;
      seq.forEach((v, k) => ctx.timeout(() => light(pads[v], on), 700 + k * step));
      ctx.timeout(() => { ready = true; root.__ready = true; pads.forEach((p) => p.el.classList.add('turn')); }, 700 + seq.length * step + 150);
    }
    pads.forEach((p) => {
      p.el.addEventListener('pointerdown', (e) => {
        e.preventDefault(); if (!ready || finished) return;
        pads.forEach((q) => q.el.classList.remove('hint'));
        if (p.i === seq[pos]) {
          light(p, 380); dots[pos].classList.add('on'); pos++;
          if (pos === len) {                                       // 끝까지 맞췄다
            finished = true; ready = false; root.__ready = false; pads.forEach((q) => q.el.classList.remove('turn'));
            ctx.timeout(() => { pads.forEach((q, k) => ctx.timeout(() => { GF.jump(q.el); GF.burst(root, q.cx, q.cy, 8); }, k * 90)); ctx.sfx('ok'); }, 350);
            ctx.timeout(() => ctx.done({ mistakes }), 1300);
          }
        } else {                                                   // 틀림: 갸웃 → 순서를 다시 천천히 보여 준다
          mistakes++; ready = false; root.__ready = false; ctx.sfx('hmm');
          p.el.classList.add('tilt'); ctx.timeout(() => p.el.classList.remove('tilt'), 700);
          slow = Math.min(1.5, slow + 0.2); ctx.timeout(show, 1100);
        }
      });
    });
    // ---- 힌트: 가만히 있으면 1단계 순서를 다시 보여 주고, 2단계는 다음 패드를 알려 준다 ----
    ctx.setHint((lv) => {
      if (!ready || finished) return;
      if (lv === 1) { slow = Math.min(1.5, slow + 0.2); show(); }
      else pads[seq[pos]].el.classList.add('hint');
    });
    show();
  },
  free(diff) {
    const pool = ['wife.joy', 'husband.good', 'dong_dad.good', 'nemo_dad.good', 'baby.joy', 'nemo_mom.good', 'nemo_kids.kid1'];
    return { pads: GF.shuffle(pool).slice(0, [3, 4, 5][diff - 1]), len: [2, 3, 4][diff - 1] };
  },
});
