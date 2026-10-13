/* 길 따라가기 — 막둥이를 손가락으로 끌어 꼬불꼬불 길을 따라 집까지 데려다준다. (D9 새 놀이, 글자 없음, 손가락 움직임·눈손 협응)
   cfg: {path: 0~3 (길 모양, 클수록 꼬불), hero: 캐릭터 id}. 길 밖으로 손가락이 나가도 틀리는 게 아니라 막둥이가 그 자리에서 기다린다(손을 다시 올려 이어 가면 됨).
   길을 가로질러 건너뛰지 못한다(앞으로 조금씩만 나아감). 집에 닿으면 끝. 틀린 횟수 = 길 밖에서 손을 뗀 2번마다 1번. */
GF.mode('trace', {
  land: false,
  setup(root, cfg, ctx) {
    const W = ctx.W, H = ctx.H, top = 84, bot = H - 40, hero = cfg.hero || 'baby.joy';
    // 길 모양: 폭·높이 비율 점(위→아래로 내려가는 길). 지나가는 점을 부드럽게 이어 촘촘한 점들로 만든다.
    const SHAPES = [
      [[0.18, 0.04], [0.5, 0.22], [0.82, 0.4], [0.5, 0.62], [0.2, 0.8], [0.5, 0.97]],
      [[0.15, 0.03], [0.82, 0.18], [0.2, 0.36], [0.82, 0.55], [0.2, 0.74], [0.8, 0.97]],
      [[0.12, 0.03], [0.5, 0.1], [0.88, 0.2], [0.5, 0.32], [0.12, 0.45], [0.5, 0.58], [0.88, 0.7], [0.5, 0.84], [0.2, 0.97]],
      [[0.5, 0.03], [0.85, 0.12], [0.85, 0.3], [0.15, 0.4], [0.15, 0.58], [0.85, 0.68], [0.85, 0.84], [0.5, 0.97]],
    ];
    const ctl = SHAPES[(cfg.path | 0) % SHAPES.length].map(([x, y]) => [20 + x * (W - 40), top + y * (bot - top)]);
    const pts = [], seg = 12;
    for (let i = 0; i < ctl.length - 1; i++) {            // Catmull-Rom 곡선 → 점 목록
      const p0 = ctl[Math.max(0, i - 1)], p1 = ctl[i], p2 = ctl[i + 1], p3 = ctl[Math.min(ctl.length - 1, i + 2)];
      for (let s = 0; s < seg; s++) { const t = s / seg, t2 = t * t, t3 = t2 * t; pts.push([0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3), 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]); }
    }
    pts.push(ctl[ctl.length - 1]);
    const len = [0]; for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const total = len[len.length - 1], at = (d) => { let i = 1; while (i < len.length - 1 && len[i] < d) i++; const k = (d - len[i - 1]) / Math.max(1, len[i] - len[i - 1]); return [pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * k, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * k]; };
    const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join('');
    const svg = GF.el('div', 'abs', root, `<svg viewBox="0 0 ${W} ${H}" style="width:${W}px;height:${H}px;pointer-events:none"><path d="${d}" fill="none" stroke="#4A3030" stroke-width="58" stroke-linecap="round" stroke-linejoin="round" opacity=".28"/><path d="${d}" fill="none" stroke="#F3DDA6" stroke-width="50" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#fff" stroke-width="4" stroke-dasharray="2 16" stroke-linecap="round" opacity=".9"/></svg>`);
    svg.style.cssText += ';left:0;top:0;pointer-events:none';
    const end = pts[pts.length - 1], home = GF.el('div', 'abs trhome', root, '<svg viewBox="0 0 80 80" style="width:100%;height:100%"><path d="M8 40L40 12l32 28" fill="#FF8FA8" stroke="#4A3030" stroke-width="4" stroke-linejoin="round"/><rect x="16" y="38" width="48" height="34" rx="4" fill="#FFF3C2" stroke="#4A3030" stroke-width="4"/><rect x="33" y="50" width="14" height="22" rx="3" fill="#C98F5A" stroke="#4A3030" stroke-width="3"/></svg>');
    home.style.cssText += `;left:${end[0] - 36}px;top:${end[1] - 34}px;width:72px;height:72px`;
    const dots = GF.el('div', 'seqdots', root); dots.style.top = '14px'; const dd = Array.from({ length: 3 }, () => GF.el('i', '', dots));
    const tok = GF.el('div', 'abs trtok', root); tok.appendChild(ctx.img(hero)); tok.style.cssText += ';width:70px;height:84px;z-index:5;touch-action:none';
    const place = (p) => { tok.style.left = (p[0] - 35) + 'px'; tok.style.top = (p[1] - 70) + 'px'; };
    let prog = 0, drag = false, finished = false, offs = 0, shown = 0; place(at(0));
    const grab = GF.el('div', 'abs trgrab', tok); grab.style.cssText += ';inset:-22px;touch-action:none';       // 손가락이 굵어도 잡히는 터치 여백
    const ptr = (e) => { const rt = root.getBoundingClientRect(), k = rt.width / W || 1; return [(e.clientX - rt.left) / k, (e.clientY - rt.top) / k]; };
    const near = (q, from, to) => { let best = null; for (let i = 1; i < pts.length; i++) { if (len[i] < from - 4 || len[i - 1] > to + 4) continue; const a = pts[i - 1], b = pts[i], vx = b[0] - a[0], vy = b[1] - a[1], l2 = vx * vx + vy * vy || 1, t = Math.max(0, Math.min(1, ((q[0] - a[0]) * vx + (q[1] - a[1]) * vy) / l2)), px = a[0] + vx * t, py = a[1] + vy * t, dist = Math.hypot(q[0] - px, q[1] - py); if (!best || dist < best.dist) best = { dist, s: len[i - 1] + (len[i] - len[i - 1]) * t }; } return best; };
    tok.addEventListener('pointerdown', (e) => { e.preventDefault(); if (finished) return; drag = true; try { tok.setPointerCapture(e.pointerId); } catch (x) { /* 캡처 실패 */ } tok.classList.add('drag'); ctx.sfx('tap'); });
    tok.addEventListener('pointermove', (e) => {
      if (!drag || finished) return; const q = ptr(e); q[1] += 34;       // 손가락 위치 = 막둥이 발 근처
      const nb = near(q, Math.max(0, prog - 30), prog + 90); if (!nb || nb.dist > 52) return;           // 길 밖이면 그 자리에서 기다림
      prog = Math.max(prog, Math.min(nb.s, prog + 90)); place(at(prog));
      const n = Math.min(3, Math.floor(prog / total * 3.0001)); while (shown < n) { dd[shown].classList.add('on'); shown++; ctx.sfx('note' + (1 + shown)); }
      if (prog >= total - 12) { finished = true; drag = false; place(end); ctx.sfx('ok'); GF.jump(tok); GF.burst(root, end[0], end[1] - 20, 10); ctx.timeout(() => ctx.done({ mistakes: Math.floor(offs / 2) }), 900); }
    });
    const up = (e) => { if (!drag) return; drag = false; tok.classList.remove('drag'); if (finished) return; const q = ptr(e); q[1] += 34; const nb = near(q, Math.max(0, prog - 30), prog + 90); if (!nb || nb.dist > 52) { offs++; ctx.sfx('hmm'); GF.jump(tok); } };
    tok.addEventListener('pointerup', up); tok.addEventListener('pointercancel', up);
    root.__trace = { tok, pts, total, at, get prog() { return prog; }, end };
    ctx.setHint((lv) => { const g = GF.el('div', 'abs trglow', root); const p = at(Math.min(total, prog + 60)); g.style.cssText += `;left:${p[0] - 24}px;top:${p[1] - 24}px;width:48px;height:48px`; ctx.timeout(() => g.remove(), 1800); if (lv >= 2) GF.jump(tok); });
  },
  free(diff, i) { return { path: ((diff - 1) + (i | 0)) % 4, hero: ['baby.joy', 'nemo_kids.kid1', 'wife.joy', 'nemo_mom.joy'][(diff + (i | 0)) % 4] }; },
});
