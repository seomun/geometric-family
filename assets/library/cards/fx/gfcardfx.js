/* 영웅 키우기 연출 5종 (D68 S2~S6, gf-asset 2026-10-28): feed · evolve · awaken · treasure · myth.
   GFFx.play(name, stageEl, opts, done) — 각 ≤2.4초, stage 탭하면 끝 상태로 건너뛰고 done() 한 번. transform/opacity 만.
   GFFx.still(name, stageEl, opts, t) = 시점 t 의 정지 화면(캡처·시안용). GFFx.DUR = 길이표.
   카드 DOM 은 콜백으로 받는다(게임의 카드 렌더러를 꽂는다): opts.heroHtml(등급, 상태) → 영웅 카드 HTML · opts.itemHtml(종류) → 아이템 카드 HTML.
   없으면 GFCard2.hero / GFCard2.item(assets/library/cards/v2)을 기본으로 쓴다.
   공통 옵션: w(카드 너비 px, 기본 190) · speed(배속, 기본 1) · sfx(id)(소리 신호 콜백 — fly·hit·levelup·club·flash·stamp·star·open·title·slide·click·charge·land, 이 파일은 소리를 직접 내지 않는다).
   움직임 줄이기: document.documentElement.dataset.rm==='1' 이면 끝 상태를 바로 그리고 150ms 뒤 done.
   - feed:     {grade:'SS', feeds:[{kind:'kongtteok',xp:10},…], from:.28, to:.68, levelUp:false}            // 먹이 카드가 날아가 경험치 막대가 찬다
   - evolve:   {grade:'S', toGrade:'S', word:'뚝딱!', club:'club_fire'}                                    // 방망이가 때려 변신 → 새 모습 + 큰 글자
   - awaken:   {grade:'SS', slots:5, open:2}                                                                // 깨달음 칸 하나가 열림(별이 날아가 켜짐)
   - treasure: {grade:'S', item:{kind:'shield',g:'B'}}                                                      // 보물 카드가 영웅 아래로 끼워지고 딸깍 빛
   - myth:     {cardHtml:'<…>', key:'wukong'(MythCard 있을 때)}                                              // SSS 신화 등장(어두워짐 → 번쩍 → 날아 안착 → 「신화 등장!」) */
(function (root) {
  const cl = (x) => Math.max(0, Math.min(1, x)), seg = (t, a, b) => cl((t - a) / (b - a)), eo = (x) => 1 - Math.pow(1 - x, 3), eob = (x) => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const el = (st, css, h, cls) => { const d = document.createElement('div'); d.className = 'fx-el' + (cls ? ' ' + cls : ''); d.style.cssText = css || ''; if (h) d.innerHTML = h; st.appendChild(d); return d; };
  const GL = { B: '#D9A066', A: '#F0A66B', S: '#C8D2E4', SS: '#FFD95A', SSS: '#C9A8FF' };
  const spark = (st, n, cols) => Array.from({ length: n }, (_, i) => el(st, `left:50%;top:48%;width:16px;height:16px;margin:-8px;opacity:0;clip-path:polygon(50% 0,60% 40%,100% 50%,60% 60%,50% 100%,40% 60%,0 50%,40% 40%);background:${cols[i % cols.length]}`));
  const hero = (o, g, w, extra) => (o.heroHtml ? o.heroHtml(g, extra) : root.GFCard2.hero(Object.assign({ g, el: 'grass', name: o.name || '영웅', img: o.img, power: o.power || 3000, scene: o.scene, w }, extra || {})));
  const item = (o, kind, g, w) => (o.itemHtml ? o.itemHtml(kind, g) : root.GFCard2.item({ g: g || 'B', art: (root.GFCardArt && root.GFCardArt[kind]) || (root.GFCard2 && root.GFCard2.TREASURE && root.GFCard2.TREASURE[kind]) || (root.GFFxArt && root.GFFxArt[kind]) || '', name: IN[kind] || kind, w }));
  const IN = { kongtteok: '콩떡', kkultteok: '꿀떡', mujigae: '무지개떡', club_fire: '불꽃 방망이', club_grass: '풀잎 방망이', club_water: '물방울 방망이', shield: '나무 방패', sandal: '날랜 짚신', pouch: '복주머니', pair: '단짝 카드', awaken_card: '깨달음 카드' };
  const GRD = { kongtteok: 'B', kkultteok: 'A', mujigae: 'S' };
  const sigf = (o) => { const f = {}; return (id, t, thr, key) => { const k = id + ':' + (key == null ? thr : key); if (t >= thr && !f[k]) { f[k] = 1; if (o.sfx) o.sfx(id); } }; };
  const W = (o) => o.w || 190;
  const SC = {};
  // ① 먹이기 — 먹이 카드가 포물선으로 날아가 영웅이 눌렸다 튀고 막대가 찬다
  SC.feed = { dur: 2.3, build(st, o) {
    const w = W(o), g = o.grade || 'SS', fe = o.feeds || [{ kind: 'kongtteok', xp: 10 }, { kind: 'kkultteok', xp: 20 }, { kind: 'mujigae', xp: 35 }], p0 = o.from == null ? .2 : o.from, p1 = o.to == null ? .68 : o.to, BAR = Math.min(300, w * 1.4);
    const card = el(st, `left:50%;top:42%;width:${w}px;height:${w * 4 / 3}px;margin:${-w * 2 / 3}px 0 0 ${-w / 2}px`, hero(o, g, w));
    const bar = el(st, `left:50%;top:79%;width:${BAR}px;margin-left:${-BAR / 2}px`, `<div class="fx-xp" style="--w:${BAR}px;--p:${p0}"><i></i></div><div class="fx-xp-t">경험치</div>`);
    const fill = bar.querySelector('.fx-xp i'), txt = bar.querySelector('.fx-xp-t');
    const fl = fe.map((f, k) => ({ d: el(st, `left:50%;top:42%;width:${w * .5}px;margin:${-w * .25}px 0 0 ${-w * .25}px;opacity:0`, item(o, f.kind, f.g || GRD[f.kind] || 'B', w * .5)), xp: f.xp, t0: .15 + k * .5, dx: (k - 1) * w * .9, dy: w * 1.4 }));
    const pl = fl.map((m) => el(st, 'left:50%;top:42%;font:400 24px Jua,system-ui,sans-serif;color:#E5864B;opacity:0;text-shadow:0 2px 0 #fff', '+' + m.xp));
    const lv = el(st, `left:50%;top:70%;transform:translateX(-50%);font:400 34px "Gasoek One",Jua,sans-serif;color:#FFE27A;-webkit-text-stroke:2px #6b5443;paint-order:stroke fill;opacity:0;white-space:nowrap`, '레벨 업!');
    const sg = sigf(o);
    return (t) => { let sq = 0, tot = 0; const sum = fe.reduce((a, f) => a + f.xp, 0) || 1;
      fl.forEach((m, k) => { const q = seg(t, m.t0, m.t0 + .5), u = eo(q), bx = (1 - u) * (1 - u) * m.dx + 2 * (1 - u) * u * (m.dx * .3), by = (1 - u) * (1 - u) * m.dy + 2 * (1 - u) * u * (-w * .3);
        m.d.style.opacity = q > 0 && q < .96 ? 1 : 0; m.d.style.transform = `translate(${bx}px,${by}px) scale(${1 - .7 * u}) rotate(${(1 - u) * (k - 1) * 40}deg)`;
        const h = seg(t, m.t0 + .45, m.t0 + .85); tot += m.xp / sum * eo(seg(t, m.t0 + .45, m.t0 + .95)); if (h > 0 && h < 1) sq = Math.max(sq, Math.sin(h * Math.PI));
        pl[k].style.opacity = h > 0 ? 1 - seg(t, m.t0 + .75, m.t0 + 1.15) : 0; pl[k].style.transform = `translate(${-16 + k * 18}px,${-w * .6 - 46 * eo(seg(t, m.t0 + .45, m.t0 + 1.1))}px)`; });
      fl.forEach((m, k) => { sg('fly', t, m.t0, k); sg('hit', t, m.t0 + .45, k); });
      card.style.transform = `scale(${1 + .09 * sq},${1 - .07 * sq})`;
      const p = p0 + (p1 - p0) * tot; fill.style.transition = 'none'; fill.style.setProperty('--p', p); fill.parentNode.style.setProperty('--p', p);
      if (o.levelUp) { sg('levelup', t, 1.8); const q = seg(t, 1.8, 2.15); lv.style.opacity = q; lv.style.transform = `translateX(-50%) scale(${1.8 - .8 * eob(q)})`; }
    }; } };
  // ② 진화 — 방망이가 날아와 때리고, 번쩍, 새 모습 + 큰 글자
  SC.evolve = { dur: 2.4, build(st, o) {
    const w = W(o) * 1.12, g = o.grade || 'S', g2 = o.toGrade || g, word = o.word || '뚝딱!';
    const rays = el(st, `left:50%;top:44%;width:${w * 3.6}px;height:${w * 3.6}px;margin:${-w * 1.8}px;border-radius:50%;background:repeating-conic-gradient(rgba(255,240,170,.9) 0 8deg,rgba(255,255,255,0) 8deg 24deg);-webkit-mask:radial-gradient(circle,#000 8%,transparent 62%);mask:radial-gradient(circle,#000 8%,transparent 62%);opacity:0`);
    const glow = el(st, `left:50%;top:44%;width:${w * 2}px;height:${w * 2}px;margin:${-w}px;border-radius:50%;background:radial-gradient(circle,#fffffff0,#ffd0f0a0 38%,#9fd8ff00 70%);opacity:0`);
    const card = el(st, `left:50%;top:44%;width:${w}px;height:${w * 4 / 3}px;margin:${-w * 2 / 3}px 0 0 ${-w / 2}px`, hero(o, g, w));
    const club = el(st, `left:50%;top:44%;width:${w * .6}px;margin:${-w * .3}px 0 0 ${-w * .3}px;opacity:0;z-index:7`, item(o, o.club || 'club_fire', 'A', w * .6));
    let cur = g; const sp = spark(st, 12, ['#fff', '#FFE27A', '#FFB3DE', '#9fd8ff']);
    const wd = el(st, 'left:0;right:0;top:6%;text-align:center;font:400 60px "Gasoek One",Jua,sans-serif;color:#fff;-webkit-text-stroke:3px #6b5443;paint-order:stroke fill;text-shadow:0 6px 0 #6b5443;opacity:0', word);
    const fl = el(st, 'inset:0;background:#fff;opacity:0;pointer-events:none'), sg = sigf(o);
    return (t) => { sg('club', t, .15); sg('hit', t, .5); sg('flash', t, .72); sg('stamp', t, .85); const sw = cl(t / .8), amp = sw * sw * 9, hit = seg(t, .15, .5);
      const want = t >= .8 ? g2 : g; if (want !== cur) { cur = want; card.innerHTML = hero(o, want, w, { evolved: true }); }
      club.style.opacity = t > .1 && t < .62 ? 1 : 0; club.style.transform = `translate(${(1 - eo(hit)) * w * 1.2}px,${-(1 - eo(hit)) * w * .9}px) rotate(${-30 + (1 - eo(hit)) * 120}deg) scale(${.8 + .3 * eo(hit)})`;
      const shake = t >= .5 && t < .8 ? Math.sin(t * 90) * amp : 0, pop = t >= .8 ? 1 + .2 * Math.sin(seg(t, .8, 1.25) * Math.PI) : 1 + sw * .08;
      card.style.transform = `translate(${shake}px,${shake * .5}px) scale(${pop})`;
      glow.style.opacity = t < .8 ? sw * .9 : .8 * (1 - seg(t, .85, 1.6)); glow.style.transform = `scale(${.6 + sw * .5 + seg(t, .8, 1.3) * .4})`;
      fl.style.opacity = t < .72 ? 0 : t < .85 ? seg(t, .72, .82) : 1 - seg(t, .85, 1.12);
      rays.style.opacity = t < .8 ? 0 : (1 - seg(t, 1.5, 2.4)) * .85; rays.style.transform = `rotate(${t * 40}deg) scale(${.5 + seg(t, .8, 1.4) * .7})`;
      const wq = seg(t, .8, 1.05); wd.style.opacity = wq; wd.style.transform = `scale(${2.4 - 1.4 * eob(wq)}) rotate(${-7 * eo(wq)}deg)`;
      sp.forEach((s, k) => { const u = seg(t, 1 + k * .03, 2.3), an = (k / sp.length) * Math.PI * 2, d = 70 + 120 * eo(u); s.style.opacity = u > 0 ? Math.sin(u * Math.PI) : 0; s.style.transform = `translate(${Math.cos(an) * d}px,${Math.sin(an) * d - 30 * u}px) scale(${.6 + (k % 3) * .4}) rotate(${u * 140}deg)`; });
    }; } };
  // ③ 깨달음 열림 — 칸 줄에서 한 칸이 열린다
  SC.awaken = { dur: 2.2, build(st, o) {
    const w = W(o), g = o.grade || 'SS', n = o.slots || 5, open = o.open == null ? 2 : o.open, S = 40, gap = 14, tot = n * S + (n - 1) * gap;
    const card = el(st, `left:50%;top:38%;width:${w}px;height:${w * 4 / 3}px;margin:${-w * 2 / 3}px 0 0 ${-w / 2}px`, hero(o, g, w));
    const slots = Array.from({ length: n }, (_, i) => el(st, `left:50%;top:76%;width:${S}px;height:${S}px;margin:${-S / 2}px 0 0 ${-tot / 2 + i * (S + gap)}px;border-radius:50%;background:${i < open ? 'radial-gradient(circle at 35% 30%,#fff,#FFE27A 40%,#E8A41A)' : '#EADFC8'};box-shadow:inset 0 0 0 3px #6b5443,0 3px 0 #d9c7a3`, i < open ? '<svg viewBox="0 0 40 40" style="width:100%;height:100%"><path d="M20 6 L24 16 L35 17 L26.5 24 L29 35 L20 29 L11 35 L13.5 24 L5 17 L16 16Z" fill="#fff" opacity=".9"/></svg>' : ''));
    const tg = slots[open], cx = -tot / 2 + open * (S + gap) + S / 2;
    const ring = el(st, `left:50%;top:76%;width:${S}px;height:${S}px;margin:${-S / 2}px 0 0 ${cx - S / 2}px;border-radius:50%;border:6px solid #FFD95A;opacity:0`);
    const star = el(st, `left:50%;top:38%;width:30px;height:30px;margin:-15px;opacity:0;clip-path:polygon(50% 4%,62% 36%,97% 38%,70% 60%,80% 96%,50% 76%,20% 96%,30% 60%,3% 38%,38% 36%);background:#FFE27A`);
    const sp = spark(st, 8, ['#FFE27A', '#fff']);
    const wd = el(st, 'left:0;right:0;top:86%;text-align:center;font:400 40px "Gasoek One",Jua,sans-serif;color:#FFE27A;-webkit-text-stroke:2px #6b5443;paint-order:stroke fill;opacity:0', '깨달음!');
    const sg = sigf(o);
    return (t) => { sg('star', t, .2); sg('open', t, .9); sg('title', t, 1.0); const fly = seg(t, .2, .9), glow = seg(t, .9, 1.4), u = eo(fly);
      star.style.opacity = fly > 0 && fly < .98 ? 1 : 0; star.style.transform = `translate(${cx * u}px,${w * .95 * u}px) scale(${1.2 - .5 * u}) rotate(${fly * 360}deg)`;
      card.style.transform = `scale(${1 + .05 * Math.sin(seg(t, .15, .5) * Math.PI)})`;
      const on = glow > 0; tg.style.background = on ? 'radial-gradient(circle at 35% 30%,#fff,#FFE27A 40%,#E8A41A)' : '#EADFC8'; tg.style.transform = `scale(${on ? 1 + .35 * Math.sin(Math.min(1, glow * 1.6) * Math.PI) : 1})`; tg.innerHTML = on ? '<svg viewBox="0 0 40 40" style="width:100%;height:100%"><path d="M20 6 L24 16 L35 17 L26.5 24 L29 35 L20 29 L11 35 L13.5 24 L5 17 L16 16Z" fill="#fff" opacity=".9"/></svg>' : '';
      ring.style.opacity = glow > 0 && glow < 1 ? 1 - glow : 0; ring.style.transform = `scale(${1 + glow * 2.4})`;
      sp.forEach((s, k) => { const q = seg(t, .9 + k * .02, 1.9), an = (k / 8) * Math.PI * 2, d = 20 + 70 * eo(q); s.style.left = `calc(50% + ${cx}px)`; s.style.top = '76%'; s.style.opacity = q > 0 ? Math.sin(q * Math.PI) : 0; s.style.transform = `translate(${Math.cos(an) * d}px,${Math.sin(an) * d}px) scale(${.6 + (k % 3) * .3})`; });
      const q = seg(t, 1.0, 1.35); wd.style.opacity = q; wd.style.transform = `scale(${1.7 - .7 * eob(q)})`;
    }; } };
  // ④ 보물 카드 끼우기 — 보물 카드가 영웅 아래로 슬라이드, 딸깍 빛
  SC.treasure = { dur: 2.0, build(st, o) {
    const w = W(o), g = o.grade || 'S', it = o.item || { kind: 'shield', g: 'B' }, iw = w * .6;
    const card = el(st, `left:50%;top:38%;width:${w}px;height:${w * 4 / 3}px;margin:${-w * 2 / 3}px 0 0 ${-w / 2}px;z-index:4`, hero(o, g, w));
    const tre = el(st, `left:50%;top:38%;width:${iw}px;margin:${-iw * .62}px 0 0 ${-iw / 2}px;opacity:0;z-index:3`, item(o, it.kind, it.g || 'B', iw));
    const lock = el(st, `left:50%;top:38%;width:${w * 1.05}px;height:${w * 4 / 3 * 1.02}px;margin:${-w * 2 / 3 * 1.02}px 0 0 ${-w * 1.05 / 2}px;border-radius:22px;border:6px solid #FFE27A;opacity:0;z-index:5`);
    const sp = spark(st, 8, ['#FFE27A', '#fff']);
    const wd = el(st, 'left:0;right:0;top:88%;text-align:center;font:400 34px "Gasoek One",Jua,sans-serif;color:#FFE27A;-webkit-text-stroke:2px #6b5443;paint-order:stroke fill;opacity:0', '보물 장착!');
    const sg = sigf(o);
    return (t) => { sg('slide', t, .1); sg('click', t, .8); sg('title', t, .9); const sl = seg(t, .1, .8), u = eo(sl), clk = seg(t, .8, 1.3), tx = (1 - u) * w * 1.3, ty = w * (.95 - (.95 - 1.12) * 0) * (1);
      tre.style.opacity = sl > 0 ? 1 : 0; tre.style.transform = `translate(${tx}px,${w * 1.06 + (1 - u) * w * .3}px) rotate(${(1 - u) * 18}deg) scale(${.8 + .2 * u})`;
      card.style.transform = `translateY(${-4 * Math.sin(clk * Math.PI)}px) scale(${1 + .04 * Math.sin(clk * Math.PI)})`;
      lock.style.opacity = clk > 0 && clk < 1 ? 1 - clk : 0; lock.style.transform = `scale(${1 + clk * .1})`;
      sp.forEach((s, k) => { const q = seg(t, .8 + k * .02, 1.7), an = (k / 8) * Math.PI * 2, d = 40 + 60 * eo(q); s.style.top = '60%'; s.style.opacity = q > 0 ? Math.sin(q * Math.PI) : 0; s.style.transform = `translate(${Math.cos(an) * d * 1.5}px,${Math.sin(an) * d * .6}px) scale(${.6 + (k % 3) * .3})`; });
      const q = seg(t, .9, 1.2); wd.style.opacity = q; wd.style.transform = `scale(${1.6 - .6 * eob(q)})`;
    }; } };
  // ⑤ SSS 신화 등장 — 어두워짐 + 빛 모임 → 번쩍 → 카드 날아와 안착 → 「신화 등장!」
  SC.myth = { dur: 2.4, build(st, o) {
    const w = W(o) * 1.18, key = o.key, M = root.MythCard && key && root.MythCard.M[key], glow = (M && M.glow) || o.glow || '#C9A8FF';
    st.style.background = '#120a24';
    el(st, 'inset:0;background:radial-gradient(circle at 50% 46%,#3a2570,#120a24 70%)');
    const rays = el(st, `left:50%;top:46%;width:${w * 4}px;height:${w * 4}px;margin:${-w * 2}px;border-radius:50%;background:repeating-conic-gradient(${glow}aa 0 5deg,rgba(255,255,255,0) 5deg 15deg);-webkit-mask:radial-gradient(circle,#000 5%,transparent 62%);mask:radial-gradient(circle,#000 5%,transparent 62%);opacity:0`);
    const orb = el(st, `left:50%;top:46%;width:90px;height:90px;margin:-45px;border-radius:50%;background:radial-gradient(circle,#fff,${glow} 55%,rgba(255,255,255,0) 72%);opacity:0`);
    const html = o.cardHtml || (M ? root.MythCard.card(key, w) : hero(o, 'SSS', w));
    const wr = el(st, `left:50%;top:46%;width:${w}px;height:${w * 4 / 3}px;margin:${-w * 2 / 3}px 0 0 ${-w / 2}px;opacity:0`, html);
    const fx = spark(st, 14, ['#fff', '#FFE27A', '#FFB3DE', '#9fd8ff', glow]);
    const tt = el(st, 'left:0;right:0;top:5%;text-align:center;font:400 40px "Gasoek One",Jua,sans-serif;color:#FFE27A;-webkit-text-stroke:2px #3a2570;paint-order:stroke fill;text-shadow:0 5px 0 #3a2570;opacity:0', o.word || '신화 등장!');
    const fl = el(st, 'inset:0;background:#fff;opacity:0;pointer-events:none');
    const sg = sigf(o);
    return (t) => { sg('charge', t, 0); sg('flash', t, .72); sg('land', t, .86); sg('title', t, 1.2); const ch = seg(t, 0, .8);
      orb.style.opacity = t < .95 ? Math.min(1, ch * 1.4) : 0; orb.style.transform = `scale(${.4 + ch * ch * 2.2}) translate(${Math.sin(t * 80) * ch * 3}px,${Math.cos(t * 70) * ch * 3}px)`;
      rays.style.opacity = t < .95 ? ch * .85 : .85 * (1 - seg(t, 1.3, 2.4)); rays.style.transform = `rotate(${t * 50}deg) scale(${.5 + ch * .7})`;
      fl.style.opacity = t < .72 ? 0 : t < .86 ? seg(t, .72, .82) : 1 - seg(t, .86, 1.2);
      const q = seg(t, .86, 1.35); wr.style.opacity = t >= .86 ? 1 : 0; wr.style.transform = `scale(${.25 + .75 * eob(q)}) rotate(${(1 - eo(q)) * -24}deg)`;
      fx.forEach((f, i) => { const u = seg(t, .9 + i * .02, 2.2), an = (i / 14) * Math.PI * 2 + .3, d = 110 + 150 * eo(u); f.style.opacity = u > 0 ? Math.sin(u * Math.PI) : 0; f.style.transform = `translate(${Math.cos(an) * d}px,${Math.sin(an) * d * 1.1}px) scale(${.6 + (i % 3) * .5}) rotate(${u * 160}deg)`; });
      const tq = seg(t, 1.2, 1.55); tt.style.opacity = tq; tt.style.transform = `scale(${1.8 - .8 * eob(tq)})`;
    }; } };
  function prep(st) { st.innerHTML = ''; st.classList.add('fx-stage'); st.style.position = 'relative'; st.style.overflow = 'hidden'; }
  function still(name, st, o, t) { prep(st); SC[name].build(st, o || {})(t); }
  function play(name, st, o, done) { const sc = SC[name]; o = o || {}; prep(st); const up = sc.build(st, o); const sp = o.speed > 0 ? o.speed : 1;
    const rm = typeof document !== 'undefined' && document.documentElement.dataset && document.documentElement.dataset.rm === '1';
    let fin = false, raf;
    const end = () => { if (fin) return; fin = true; cancelAnimationFrame(raf); up(sc.dur); st.removeEventListener('pointerdown', end); if (done) done(); };
    if (rm) { up(sc.dur); setTimeout(end, 150); return end; }
    const t0 = performance.now(); st.addEventListener('pointerdown', end);
    (function loop() { const t = (performance.now() - t0) / 1000 * sp; if (t >= sc.dur) return end(); up(t); raf = requestAnimationFrame(loop); })();
    return end; }
  root.GFFx = { play, still, DUR: Object.fromEntries(Object.entries(SC).map(([k, v]) => [k, v.dur])), GL };
})(typeof window !== 'undefined' ? window : globalThis);
