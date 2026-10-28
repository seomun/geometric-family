/* 카드 틀 만들기 + 기울기 + 연출 3종(뒤집기·먹이기·뚝딱 변신) v1.
   연출은 모두 update(t) 순수 함수(t=초, 0~DUR)라서 실제 재생과 정지 화면 캡처가 같은 그림이다.
   각 연출 2.4초 이하, 탭하면 끝 상태로 건너뛴다. 움직임은 transform/opacity 위주. */
(function (root) {
  const ORDER = ['B', 'A', 'S', 'SS', 'SSS'];
  const GLOW = { B: '#D9A066', A: '#F0A66B', S: '#C8D2E4', SS: '#FFD95A', SSS: '#C9A8FF' };
  const TOP = {
    A: '<svg viewBox="0 0 60 22"><circle cx="30" cy="11" r="8" fill="#F0A66B" stroke="#6b5443" stroke-width="2.4"/><circle cx="27.5" cy="8.5" r="2.4" fill="#FFE2C4"/></svg>',
    S: '<svg viewBox="0 0 60 22"><path d="M30 1 L35 9 L45 10 L37 16 L40 24 L30 19 L20 24 L23 16 L15 10 L25 9Z" fill="#E8EEF8" stroke="#6b5443" stroke-width="2.4" stroke-linejoin="round" transform="translate(0 -2)"/></svg>',
    SS: '<svg viewBox="0 0 60 22"><path d="M8 20 L12 4 L22 12 L30 1 L38 12 L48 4 L52 20 Z" fill="#FFD95A" stroke="#6b5443" stroke-width="2.4" stroke-linejoin="round"/><circle cx="12" cy="4" r="2.6" fill="#E5334A" stroke="#6b5443" stroke-width="1.6"/><circle cx="30" cy="2" r="2.8" fill="#3B6FD6" stroke="#6b5443" stroke-width="1.6"/><circle cx="48" cy="4" r="2.6" fill="#3DAE5B" stroke="#6b5443" stroke-width="1.6"/></svg>',
    SSS: '<svg viewBox="0 0 60 22"><defs><linearGradient id="gfsg" x1="0" x2="1"><stop offset="0" stop-color="#ff6b8a"/><stop offset=".25" stop-color="#ffd24d"/><stop offset=".5" stop-color="#69e0a0"/><stop offset=".75" stop-color="#5bc8ff"/><stop offset="1" stop-color="#a98bff"/></linearGradient></defs><path d="M6 20 L10 5 L21 13 L30 0 L39 13 L50 5 L54 20 Z" fill="url(#gfsg)" stroke="#6b5443" stroke-width="2.4" stroke-linejoin="round"/><path d="M30 5 L33 11 L30 17 L27 11Z" fill="#fff" opacity=".85"/></svg>',
  };
  function html(o) {
    const g = o.g || 'B', i = ORDER.indexOf(g), kids = !!o.kids;
    const art = o.art || '';
    const inner = /^\s*</.test(art) ? art : (art ? `<img src="${art}" alt="">` : '');
    return `<div class="gfc2 g-${g}${kids ? ' kids' : ''}" style="--w:${o.w || 160}px"><div class="gfc2-frame">
<i class="cn a"></i><i class="cn b"></i><i class="cn c"></i><i class="cn d"></i>
<div class="gfc2-in"><div class="gfc2-art">${inner}</div>${kids ? `<div class="stars">${[0, 1, 2, 3, 4].map((k) => `<i class="${k <= i ? '' : 'off'}"></i>`).join('')}</div>` : `<div class="gfc2-name">${o.name || ''}</div>`}</div>
<em class="sp s1"></em><em class="sp s2"></em><em class="sp s3"></em></div>
${TOP[g] ? `<span class="tp">${TOP[g]}</span>` : ''}<b class="gfc2-rank">${g}</b></div>`;
  }
  function back(w) {
    return `<div class="gfc2-back" style="--w:${w || 160}px;width:${w || 160}px;aspect-ratio:3/4;border-radius:${(w || 160) * 0.075}px;position:relative;overflow:hidden;
background:radial-gradient(circle at 50% 40%,#FFE9B8,#F2C879 60%,#D9A066);box-shadow:0 3px 10px rgba(80,50,20,.3),0 0 0 2px #6b5443">
<div style="position:absolute;inset:7%;border-radius:${(w || 160) * 0.05}px;border:${(w || 160) * 0.02}px dashed rgba(107,84,67,.55)"></div>
<svg viewBox="0 0 100 100" style="position:absolute;left:14%;top:23%;width:72%"><rect x="6" y="46" width="30" height="30" rx="6" fill="#F2B95A" stroke="#6b5443" stroke-width="3.4"/><path d="M50 14 L70 52 L30 52Z" fill="#F4727F" stroke="#6b5443" stroke-width="3.4" stroke-linejoin="round"/><circle cx="72" cy="62" r="17" fill="#7EC8F0" stroke="#6b5443" stroke-width="3.4"/></svg></div>`;
  }
  function tilt(el) {
    const set = (x) => { el.classList.add('tilt'); el.style.setProperty('--tx', Math.max(-1, Math.min(1, x)).toFixed(3)); };
    el.addEventListener('pointermove', (e) => { const r = el.getBoundingClientRect(); set(((e.clientX - r.left) / r.width - 0.5) * 2); });
    el.addEventListener('pointerleave', () => el.classList.remove('tilt'));
    if (root.DeviceOrientationEvent) root.addEventListener('deviceorientation', (e) => { if (e.gamma != null) set(e.gamma / 30); }, { passive: true });
  }
  // ── 연출 ──
  const cl = (x) => Math.max(0, Math.min(1, x)), seg = (t, a, b) => cl((t - a) / (b - a));
  const eo = (x) => 1 - Math.pow(1 - x, 3), eob = (x) => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const el = (stage, cls, css, h) => { const d = document.createElement('div'); d.className = cls; d.style.cssText = 'position:absolute;' + (css || ''); if (h) d.innerHTML = h; stage.appendChild(d); return d; };
  const SP = (stage, n, col) => Array.from({ length: n }, (_, k) => el(stage, 'fx', `left:50%;top:50%;width:14px;height:14px;margin:-7px;background:${col};clip-path:polygon(50% 0,60% 40%,100% 50%,60% 60%,50% 100%,40% 60%,0 50%,40% 40%);opacity:0`));
  const SCENES = {};
  SCENES.flip = { dur: 2.2, build(stage, o) {
    const g = o.g || 'SS', W = 190; stage.style.perspective = '900px';
    const wrap = el(stage, 'w', `left:50%;top:50%;width:${W}px;height:${W * 4 / 3}px;margin:${-W * 2 / 3}px 0 0 ${-W / 2}px;transform-style:preserve-3d`);
    const bk = el(wrap, 'b', 'inset:0;backface-visibility:hidden', back(W)); const fr = el(wrap, 'f', 'inset:0;backface-visibility:hidden', html({ g, name: o.name, art: o.art, w: W, kids: o.kids }));
    const ring = el(stage, 'ring', `left:50%;top:50%;width:${W * 1.1}px;height:${W * 1.1}px;margin:${-W * .55}px;border-radius:50%;border:6px solid ${GLOW[g]};opacity:0`);
    const halo = el(stage, 'halo', `left:50%;top:50%;width:${W * 1.5}px;height:${W * 1.5}px;margin:${-W * .75}px;border-radius:50%;background:radial-gradient(circle,${GLOW[g]}cc,${GLOW[g]}00 68%);opacity:0`);
    stage.insertBefore(halo, wrap);
    const sp = SP(stage, 6 + ORDER.indexOf(g) * 2, GLOW[g]); const tag = el(stage, 'tag', 'left:0;right:0;bottom:7%;text-align:center;font:400 26px Jua,sans-serif;color:#6b5443;opacity:0', o.kids ? '⭐' : `새 카드! <span style="color:#C8743C">${g}</span>`);
    return (t) => {
      const drop = eob(seg(t, 0, .35)), wig = t > .35 && t < .95 ? Math.sin((t - .35) * 38) * 5 * (1 - seg(t, .8, .95)) : 0;
      const a = eo(seg(t, .95, 1.4)) * 180; const pop = 1 + .14 * Math.sin(seg(t, 1.35, 1.7) * Math.PI);
      wrap.style.transform = `translateY(${(1 - drop) * -140}px) scale(${(.8 + .2 * drop) * pop}) rotateZ(${wig}deg) rotateY(${a}deg)`; wrap.style.opacity = cl(t / .12);
      bk.style.transform = ''; fr.style.transform = 'rotateY(180deg)';
      halo.style.opacity = seg(t, .35, .95) * .85 * (1 - seg(t, 1.7, 2.2) * .5); halo.style.transform = `scale(${.6 + .6 * seg(t, .35, 1.4)})`;
      const r = seg(t, 1.35, 1.9); ring.style.opacity = r > 0 && r < 1 ? 1 - r : 0; ring.style.transform = `scale(${.7 + 1.2 * eo(r)})`;
      sp.forEach((s, k) => { const q = seg(t, 1.35 + k * .01, 2.05), an = (k / sp.length) * Math.PI * 2 + .4, d = 90 + 100 * eo(q) + (k % 2) * 30; s.style.opacity = q > 0 ? Math.sin(q * Math.PI) : 0; s.style.transform = `translate(${Math.cos(an) * d}px,${Math.sin(an) * d * 1.15}px) scale(${.5 + (k % 3) * .35}) rotate(${q * 120}deg)`; });
      const tg = seg(t, 1.6, 2.0); tag.style.opacity = tg; tag.style.transform = `translateY(${(1 - eo(tg)) * 24}px)`;
    };
  } };
  SCENES.feed = { dur: 2.3, build(stage, o) {
    const W = 170, from = o.from || 'SS', BAR = 220;
    const card = el(stage, 'c', `left:50%;top:44%;width:${W}px;height:${W * 4 / 3}px;margin:${-W * 2 / 3}px 0 0 ${-W / 2}px`, html({ g: from, name: o.name, art: o.art, w: W, kids: o.kids }));
    const bar = el(stage, 'bar', `left:50%;top:78%;width:${BAR}px;height:22px;margin-left:${-BAR / 2}px;border-radius:11px;background:#EADFC8;box-shadow:inset 0 0 0 3px #6b5443`);
    const fill = el(bar, 'fill', 'left:3px;top:3px;bottom:3px;width:0;border-radius:8px;background:linear-gradient(90deg,#8fe39a,#F6C21B)');
    const lab = el(stage, 'lab', 'left:0;right:0;top:83%;text-align:center;font:400 20px Jua,sans-serif;color:#6b5443', 'XP');
    const ART = root.GFCardArt, mats = [['kongtteok', 10, '소', .22, -150, 150], ['kkultteok', 20, '중', .8, 0, 190], ['mujigae', 35, '대', 1.35, 150, 150]];
    const fl = mats.map(([k, xp, nm, st, dx, dy]) => ({ d: el(stage, 'm', `left:50%;top:44%;width:74px;margin:-37px;opacity:0`, html({ g: 'B', art: ART[k], name: nm, w: 74 })), xp, st, dx, dy }));
    const pl = fl.map((m) => el(stage, 'pl', 'left:50%;top:44%;font:400 26px Jua,sans-serif;color:#E5864B;opacity:0;text-shadow:0 2px 0 #fff', '+' + m.xp));
    return (t) => {
      let acc = 0, sq = 0;
      fl.forEach((m, k) => { const q = seg(t, m.st, m.st + .5), x0 = m.dx, y0 = m.dy, ctrlx = x0 * .3, ctrly = Math.min(y0, 0) - 60;
        const u = eo(q), bx = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * ctrlx, by = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * ctrly;
        m.d.style.opacity = q > 0 && q < .97 ? 1 : 0; m.d.style.transform = `translate(${bx}px,${by}px) scale(${1 - .75 * u}) rotate(${(1 - u) * (k - 1) * 40}deg)`;
        const h = seg(t, m.st + .45, m.st + .85); acc += m.xp * eo(seg(t, m.st + .45, m.st + .95)); if (h > 0 && h < 1) sq = Math.max(sq, Math.sin(h * Math.PI));
        pl[k].style.opacity = h > 0 ? 1 - seg(t, m.st + .75, m.st + 1.15) : 0; pl[k].style.transform = `translate(${-18 + k * 20}px,${-W * .5 - 50 * eo(seg(t, m.st + .45, m.st + 1.1))}px)`; });
      card.style.transform = `scale(${1 + .09 * sq}, ${1 - .07 * sq})`; fill.style.width = `${(BAR - 6) * Math.min(acc, 100) / 100}px`;
      lab.textContent = o.kids ? '' : `XP ${Math.round(acc)} / 100`;
    };
  } };
  SCENES.evolve = { dur: 2.4, build(stage, o) {
    const W = 200, from = o.from || 'SS', to = o.to || 'SSS';
    const rays = el(stage, 'rays', `left:50%;top:48%;width:${W * 3}px;height:${W * 3}px;margin:${-W * 1.5}px;border-radius:50%;background:repeating-conic-gradient(rgba(255,240,170,.9) 0 8deg,rgba(255,255,255,0) 8deg 24deg);-webkit-mask:radial-gradient(circle,#000 8%,transparent 62%);mask:radial-gradient(circle,#000 8%,transparent 62%);opacity:0`);
    const glow = el(stage, 'glow', `left:50%;top:48%;width:${W * 1.9}px;height:${W * 1.9}px;margin:${-W * .95}px;border-radius:50%;background:radial-gradient(circle,#ffffffee,#ffd0f0aa 35%,#9fd8ff00 70%);opacity:0`);
    const card = el(stage, 'c', `left:50%;top:48%;width:${W}px;height:${W * 4 / 3}px;margin:${-W * 2 / 3}px 0 0 ${-W / 2}px`, html({ g: from, name: o.name, art: o.art, w: W, kids: o.kids }));
    let cur = from; const sp = SP(stage, 12, '#fff');
    const word = el(stage, 'word', 'left:0;right:0;top:8%;text-align:center;font:400 64px "Gasoek One",Jua,sans-serif;color:#fff;-webkit-text-stroke:3px #6b5443;paint-order:stroke fill;opacity:0;text-shadow:0 6px 0 #6b5443', '뚝딱!');
    const flash = el(stage, 'flash', 'inset:0;background:#fff;opacity:0;pointer-events:none');
    return (t) => {
      const sw = t < .8 ? t / .8 : 0, amp = sw * sw * 9; const want = t >= .8 ? to : from;
      if (want !== cur) { cur = want; card.innerHTML = html({ g: want, name: o.name, art: o.art, w: W, kids: o.kids }); }
      const pop = t >= .8 ? 1 + .2 * Math.sin(seg(t, .8, 1.25) * Math.PI) : 1 + sw * .08;
      card.style.transform = `translate(${Math.sin(t * 90) * amp}px,${Math.cos(t * 70) * amp * .5}px) scale(${pop}) rotate(${Math.sin(t * 60) * sw * 3}deg)`;
      glow.style.opacity = t < .8 ? sw * .9 : .8 * (1 - seg(t, .85, 1.6)); glow.style.transform = `scale(${.6 + sw * .5 + seg(t, .8, 1.3) * .4})`;
      flash.style.opacity = t < .72 ? 0 : t < .85 ? seg(t, .72, .82) : 1 - seg(t, .85, 1.12);
      rays.style.opacity = t < .8 ? 0 : (1 - seg(t, 1.5, 2.4)) * .85; rays.style.transform = `rotate(${t * 40}deg) scale(${.5 + seg(t, .8, 1.4) * .7})`;
      const wq = seg(t, .8, 1.05); word.style.opacity = wq; word.style.transform = `scale(${2.4 - 1.4 * eob(wq)}) rotate(${-7 * eo(wq)}deg)`;
      sp.forEach((s, k) => { const q = seg(t, 1 + k * .03, 2.3), an = (k / sp.length) * Math.PI * 2, d = 70 + 120 * eo(q); s.style.opacity = q > 0 ? Math.sin(q * Math.PI) : 0; s.style.transform = `translate(${Math.cos(an) * d}px,${Math.sin(an) * d - 30 * q}px) scale(${.6 + (k % 3) * .4}) rotate(${q * 140}deg)`; s.style.background = ['#fff', '#FFE27A', '#FFB3DE', '#9fd8ff'][k % 4]; });
    };
  } };
  // 재생: update(t) 를 rAF 로 돌린다. 탭하면 끝으로 점프하고 done 호출. 재생 중이면 한 번만 끝낸다.
  function play(stage, name, o, done) {
    const sc = SCENES[name]; stage.innerHTML = ''; stage.style.position = 'relative'; stage.style.overflow = 'hidden';
    const up = sc.build(stage, o || {}); let t0 = performance.now(), fin = false, raf;
    const end = () => { if (fin) return; fin = true; cancelAnimationFrame(raf); up(sc.dur); stage.removeEventListener('pointerdown', end); if (done) done(); };
    stage.addEventListener('pointerdown', end);
    (function loop() { const t = (performance.now() - t0) / 1000; if (t >= sc.dur) return end(); up(t); raf = requestAnimationFrame(loop); })();
  }
  function still(stage, name, o, t) { const sc = SCENES[name]; stage.innerHTML = ''; stage.style.position = 'relative'; stage.style.overflow = 'hidden'; sc.build(stage, o || {})(t); }
  root.GFCard = { html, back, tilt, play, still, SCENES, ORDER, GLOW };
})(typeof window !== 'undefined' ? window : globalThis);
