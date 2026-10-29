/* 신화 카드 만들기 + 뽑기 「신화 등장」 연출 v3. myth_art.js · v2 gfcard2.js(속성 아이콘)를 먼저 불러온다. */
(function (root) {
  const M = {
    poseidon: { name: '포세이돈', title: '바다의 왕', el: 'water', power: 18800, abil: '해일', desc: '물 구슬 3개마다 적 전체에 큰 물 피해', glow: '#5BC8FF' },
    dragon: { name: '청룡', title: '동쪽 하늘의 수호신', el: 'grass', power: 19600, abil: '구름 비늘', desc: '아군 전체 방어↑ · 풀 구슬이 한 줄 더', glow: '#58E0B8' },
    wukong: { name: '손오공', title: '제천대성', el: 'fire', power: 20500, abil: '분신술', desc: '공격이 한 번 더 · 근두운으로 쿨 −1', glow: '#FF9A4A' },
    anubis: { name: '아누비스', title: '저승의 심판자', el: 'grass', power: 18200, abil: '심판의 저울', desc: '체력이 낮은 적에게 큰 한 방', glow: '#B79CFF' },
    gumiho: { name: '구미호', title: '달밤의 여우 요정', el: 'fire', power: 19100, abil: '아홉 꼬리', desc: '한 턴에 작은 공격 9번 · 여우불 지속피해', glow: '#8FB5FF' },
    haetae: { name: '해태', title: '불을 막는 수호신', el: 'water', power: 18600, abil: '불 막이', desc: '아군 전체 불 피해 무효 · 보호막', glow: '#58E0C8' },
    samjoko: { name: '삼족오', title: '태양 속의 세 발 까마귀', el: 'fire', power: 20100, abil: '태양 날갯짓', desc: '한 번 더 행동 · 불 구슬로 바꾸기', glow: '#FFD24A' },
    athena: { name: '아테나', title: '지혜와 전략의 여신', el: 'grass', power: 19400, abil: '지혜의 방패', desc: '적 다음 공격 예고 · 아군 방어 대폭↑', glow: '#8FB5FF' },
  };
  const corner = '<svg viewBox="0 0 30 30"><path d="M3 27 V8 Q3 3 8 3 H27" fill="none" stroke="#FFF3C0" stroke-width="2.4" stroke-linecap="round"/><path d="M9 9 L20 9 L9 20Z" fill="#F5C04A" stroke="#6b5443" stroke-width="1.6" stroke-linejoin="round"/></svg>';
  function card(k, w) {
    const m = M[k], e = root.GFCard2.EL[m.el];
    return `<div class="gfm" data-k="${k}" style="--w:${w || 200}px;--mc:${m.glow};--elc:${e.c}"><div class="gfm-fr"><div class="gfm-in"><div class="gfm-bg">${root.MythArt.BG[k]}</div><div class="gfm-holo"></div><div class="gfm-vig"></div>
<div class="gfm-stars">${[0, 1, 2, 3, 4].map(() => '<i></i>').join('')}</div></div>
${['a', 'b', 'c', 'd'].map((c) => `<span class="gfm-co ${c}">${corner}</span>`).join('')}<em class="sp s1"></em><em class="sp s2"></em><em class="sp s3"></em></div>
<div class="gfm-hero">${root.MythArt.HERO[k]}</div><div class="gfm-el">${root.GFCard2.elIcon(m.el)}</div><b class="gfm-rank">SSS</b>
<div class="gfm-name"><small>${m.title}</small><b>${m.name}</b></div>
<div class="gfm-abil"><i>${root.MythArt.ICON[k]}</i><span><b>${m.abil}</b><em>${m.desc}</em></span></div></div>`;
  }
  // 뽑기 「신화 등장」 연출 2.4초: 어두워짐+빛 모임 → 번쩍 → 카드가 날아와 안착 → 「신화 등장!」 + 이름·능력
  const cl = (x) => Math.max(0, Math.min(1, x)), seg = (t, a, b) => cl((t - a) / (b - a)), eo = (x) => 1 - Math.pow(1 - x, 3), eob = (x) => { const c = 1.7; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const el = (st, css, h) => { const d = document.createElement('div'); d.style.cssText = 'position:absolute;' + (css || ''); if (h) d.innerHTML = h; st.appendChild(d); return d; };
  const SC = { dur: 2.4, build(stage, o) {
    const k = o.k || 'wukong', m = M[k], W = 236, cx = '50%', cy = '47%';
    stage.style.background = '#120a24';
    const dark = el(stage, 'inset:0;background:radial-gradient(circle at 50% 47%,#3a2570,#120a24 70%)');
    const rays = el(stage, `left:50%;top:47%;width:760px;height:760px;margin:-380px;border-radius:50%;background:repeating-conic-gradient(${m.glow}aa 0 5deg,rgba(255,255,255,0) 5deg 15deg);-webkit-mask:radial-gradient(circle,#000 5%,transparent 62%);mask:radial-gradient(circle,#000 5%,transparent 62%);opacity:0`);
    const orb = el(stage, `left:50%;top:47%;width:90px;height:90px;margin:-45px;border-radius:50%;background:radial-gradient(circle,#fff,${m.glow} 55%,rgba(255,255,255,0) 72%);opacity:0`);
    const wrap = el(stage, `left:50%;top:47%;width:${W}px;height:${W * 4 / 3}px;margin:${-W * 2 / 3}px 0 0 ${-W / 2}px;opacity:0`, card(k, W));
    const fx = Array.from({ length: 14 }, (_, i) => el(stage, `left:50%;top:47%;width:16px;height:16px;margin:-8px;opacity:0;clip-path:polygon(50% 0,60% 40%,100% 50%,60% 60%,50% 100%,40% 60%,0 50%,40% 40%);background:${['#fff', '#FFE27A', '#FFB3DE', '#9fd8ff', m.glow][i % 5]}`));
    const tt = el(stage, 'left:0;right:0;top:5%;text-align:center;font:400 40px "Gasoek One",Jua,sans-serif;color:#FFE27A;-webkit-text-stroke:2px #3a2570;paint-order:stroke fill;text-shadow:0 5px 0 #3a2570;opacity:0', '신화 등장!');
    const flash = el(stage, 'inset:0;background:#fff;opacity:0;pointer-events:none');
    return (t) => {
      const ch = seg(t, 0, .8);
      orb.style.opacity = t < .95 ? Math.min(1, ch * 1.4) : 0; orb.style.transform = `scale(${.4 + ch * ch * 2.2}) translate(${Math.sin(t * 80) * ch * 3}px,${Math.cos(t * 70) * ch * 3}px)`;
      rays.style.opacity = t < .95 ? ch * .85 : .85 * (1 - seg(t, 1.3, 2.4)); rays.style.transform = `rotate(${t * 50}deg) scale(${.5 + ch * .7})`;
      flash.style.opacity = t < .72 ? 0 : t < .86 ? seg(t, .72, .82) : 1 - seg(t, .86, 1.2);
      const q = seg(t, .86, 1.35); wrap.style.opacity = t >= .86 ? 1 : 0; wrap.style.transform = `scale(${.25 + .75 * eob(q)}) rotate(${(1 - eo(q)) * -24}deg)`;
      fx.forEach((f, i) => { const u = seg(t, .9 + i * .02, 2.2), an = (i / 14) * Math.PI * 2 + .3, d = 110 + 150 * eo(u); f.style.opacity = u > 0 ? Math.sin(u * Math.PI) : 0; f.style.transform = `translate(${Math.cos(an) * d}px,${Math.sin(an) * d * 1.1}px) scale(${.6 + (i % 3) * .5}) rotate(${u * 160}deg)`; });
      const tq = seg(t, 1.2, 1.55); tt.style.opacity = tq; tt.style.transform = `scale(${1.8 - .8 * eob(tq)})`;
    };
  } };
  function still(stage, o, t) { stage.innerHTML = ''; stage.style.position = 'relative'; stage.style.overflow = 'hidden'; SC.build(stage, o)(t); }
  function play(stage, o, done) { stage.innerHTML = ''; stage.style.position = 'relative'; stage.style.overflow = 'hidden'; const up = SC.build(stage, o); const t0 = performance.now(); let fin = false, raf; const end = () => { if (fin) return; fin = true; cancelAnimationFrame(raf); up(SC.dur); stage.removeEventListener('pointerdown', end); done && done(); }; stage.addEventListener('pointerdown', end); (function loop() { const t = (performance.now() - t0) / 1000; if (t >= SC.dur) return end(); up(t); raf = requestAnimationFrame(loop); })(); }
  root.MythCard = { card, M, still, play, DUR: SC.dur };
})(window);
