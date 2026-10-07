/* 세 가족 식탁 — 방치형(어른용). 같은 gf 엔진 위에 화면 4개(식탁·상세·사연·도감) + 방치 루프.
   수익 방식은 미정(작가·퍼블리셔 결정 대기) → IDLE.hooks 의 결제·광고는 자리만(no-op), 데이터의 premium 플래그도 자리만. */
(function () {
  'use strict';
  const el = GF.el, $q = (r, s) => r.querySelector(s);
  const IDLE = (window.IDLE = {
    hooks: { adAvailable: () => false, rewardedAd: (placement, cb) => cb && cb(false), purchase: (sku, cb) => cb && cb(false), event: () => {} },   // 광고·결제 자리(no-op)
    config: { model: null /* 수익 방식 미정: null | 'A'(유료 1회) | 'C'(소품 팩) | 'ads' */ },
    review: /[?&]review=1/.test(location.search), season: (/[?&]season=(\d+)/.exec(location.search) || [])[1] | 0,
  });
  let B, ST, PRD, PR = [], S, UI = { upd: [] };
  const KEY = 'gf:idle:data:v1';
  const FAM = { nemo: '네모', semo: '세모', dong: '동그라미' };

  /* ---------------- 시간: 가짜 시계(테스트) ---------------- */
  const now = () => Date.now() + (S ? S.clock || 0 : 0);

  /* ---------------- 숫자: 한국식 단위 ---------------- */
  function fmt(n) {
    if (!isFinite(n)) return '0';
    const a = Math.abs(n);
    if (a < 10) return n.toFixed(1).replace(/\.0$/, '');
    if (a < 10000) return Math.floor(n).toLocaleString('ko-KR');
    const U = [[1e16, '경'], [1e12, '조'], [1e8, '억'], [1e4, '만']];
    for (const [v, u] of U) if (a >= v) { const x = n / v; return (x < 100 ? x.toFixed(1).replace(/\.0$/, '') : Math.floor(x)) + u; }
    return String(Math.floor(n));
  }
  const fmtRate = (n) => '+' + (n < 10 ? n.toFixed(1) : fmt(n)) + '/초';

  /* ---------------- 상태 ---------------- */
  const fresh = () => ({ v: 1, w: 15, l: 0, tot: 0, g: {}, tl: { nemo: 1, semo: 1, dong: 1 }, slider: 0.2, buffs: [], tripReady: 0, chairs: 1, inv: [], sd: {}, ss: {}, pr: {}, eq: { nemo: [], semo: [], dong: [] }, end: 0, ent: {}, last: Date.now(), clock: 0, mute: false });
  function load() {
    try { const x = JSON.parse(localStorage.getItem(KEY)); if (x && x.v === 1) return Object.assign(fresh(), x); } catch (e) {}
    return fresh();
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  const lvl = (id) => S.g[id] || 0;
  const tmult = (t) => Math.pow(B.tableLevel.mult, S.tl[t] - 1);
  const laughMult = () => 1 + B.laughLog * Math.log10(1 + Math.max(0, S.l));   // 웃음 보너스는 로그: 폭주하지 않는다
  const genCost = (g) => g.cost * Math.pow(g.growth, lvl(g.id));
  const tlCost = (t) => { const T = B.tableLevel, L = S.tl[t], late = T.lateFrom || 999;   // 중반까지는 growth, 그 뒤는 lateGrowth(완만)
    return T.baseCost * Math.pow(T.growth, Math.min(L, late) - 1) * Math.pow(T.lateGrowth || T.growth, Math.max(0, L - late)); };
  const gross = (t) => B.tables[t].gens.reduce((a, g) => a + lvl(g.id) * g.rate, 0);

  /* ---------------- 생산량(초당) ---------------- */
  function buffAt(t) { for (const b of S.buffs) if (t >= b.from && t < b.until) return b.mult; return 1; }
  function nemoInfo() {
    const T = B.tables.nemo, members = T.gens.filter((g) => lvl(g.id) > 0).length, bowls = T.bowlsBase + lvl(T.pot.id);
    const sat = members ? Math.min(1, bowls / members) : 1, out = gross('nemo') * (0.5 + 0.5 * sat) * tmult('nemo') * laughMult();
    return { members, bowls, sat, out, w: out * (1 - S.slider), l: out * S.slider * T.laughPerOutput };
  }
  function semoInfo(t) { const base = gross('semo') * tmult('semo') * laughMult(), m = buffAt(t); return { base, m, w: base * m }; }
  function dongInfo() {
    const T = B.tables.dong, empty = T.chairs - S.chairs, pen = 1 - T.lonelyPenalty * empty, out = gross('dong') * pen * tmult('dong') * laughMult();
    return { empty, pen, w: out, l: Math.max(0, S.chairs - 1) * T.laughPerChair };
  }
  function rates(t) { const n = nemoInfo(), s = semoInfo(t), d = dongInfo(); return { n, s, d, w: n.w + s.w + d.w, l: n.l + d.l }; }
  function advance(from, to) {
    let t = from;
    while (t < to) { const dt = Math.min(to - t, 15000), r = rates(t + dt / 2), gw = r.w * dt / 1000; S.w += gw; S.tot += gw; S.l += r.l * dt / 1000; t += dt; }
  }
  const nextStory = () => ST.stories.find((x) => !S.sd[x.id]);
  const readyStories = () => ST.stories.filter((x, i) => !S.sd[x.id] && S.tot >= B.storyThresholds[i]);
  const dexCount = () => Object.keys(S.sd).length;
  function invitesAvailable() {
    const T = B.tables.dong; const out = [];
    T.invites.forEach((iv, i) => { if (S.inv.includes(i)) return; if (Object.keys(iv.need).every((k) => S.tl[k] >= iv.need[k])) out.push(i); });
    return out;
  }
  const tripCd = () => Math.max(0, S.tripReady - now());

  /* ---------------- 화면 도우미 ---------------- */
  function toast(msg) {
    const t = el('div', 'itoast on', $q(GF.screens[GF.cur.name].el, '.scr') || GF.screens[GF.cur.name].el, msg);
    setTimeout(() => { t.classList.remove('on'); setTimeout(() => t.remove(), 250); }, 2200);
  }
  function floatText(parent, x, y, text) { const f = el('div', 'float', parent, text); f.style.left = x + 'px'; f.style.top = y + 'px'; setTimeout(() => f.remove(), 1000); }
  const headChars = { nemo: ['nemo_dad.good', 'nemo_mom.good', 'nemo_grandma.good', 'nemo_kids.kid1', 'nemo_kids.kid2', 'nemo_kids.kid3', 'baby.joy'], semo: ['wife.joy', 'husband.joy'], dong: ['dong_dad.good', 'nemo_mom.wink', 'nemo_kids.kid3', 'nemo_kids.kid2'] };
  function scene(t, w, h) {                                      // 식탁 그림: 식탁 위에 지금 앉은 식구
    const d = el('div', 'sc'); d.style.cssText = `position:relative;width:${w}px;height:${h}px;overflow:hidden`;
    const col = B.tables[t].color;
    d.innerHTML = `<svg viewBox="0 0 132 124" style="position:absolute;inset:0;width:100%;height:100%" preserveAspectRatio="none"><rect width="132" height="124" fill="${col}"/><ellipse cx="66" cy="96" rx="58" ry="22" fill="#C98F5A" stroke="#4A3030" stroke-width="3"/><ellipse cx="66" cy="92" rx="52" ry="17" fill="#E3B27F"/><g fill="#fff" stroke="#4A3030" stroke-width="2"><ellipse cx="38" cy="92" rx="9" ry="4"/><ellipse cx="66" cy="98" rx="9" ry="4"/><ellipse cx="94" cy="92" rx="9" ry="4"/></g></svg>`;
    let list = [];
    if (t === 'nemo') list = B.tables.nemo.gens.filter((g) => lvl(g.id) > 0).map((g) => g.img);
    if (t === 'semo') list = B.tables.semo.gens.slice(0, 2).filter((g) => lvl(g.id) > 0).map((g) => g.img);
    if (t === 'dong') { list = B.tables.dong.gens.filter((g) => lvl(g.id) > 0).slice(0, S.chairs).map((g) => g.img); }
    const n = Math.max(1, list.length), sz = Math.min(56, Math.max(34, 112 / n * 2.3)), step = n > 1 ? (110 - sz) / (n - 1) : 0;
    list.forEach((id, i) => { const im = GF.img(id); im.style.cssText = `position:absolute;left:${n > 1 ? 10 + i * step : 66 - sz / 2}px;top:${76 - sz}px;height:${sz}px;width:auto;z-index:${i}`; d.appendChild(im); });
    (S.eq[t] || []).forEach((id, k) => { const pp = PR.find((x) => x.id === id); if (!pp) return; const sp = el('span', '', d, propIcon(pp, 26)); sp.style.cssText = `position:absolute;left:${20 + k * 36}px;top:62px;font-size:20px;line-height:1;z-index:20`; });
    if (t === 'dong') { for (let i = S.chairs; i < B.tables.dong.chairs; i++) { const c = el('div', '', d); c.style.cssText = `position:absolute;left:${14 + i * 28}px;top:62px;width:20px;height:20px;border-radius:6px;border:3px dashed #7783B8;background:#D4D8EE88`; } }
    return d;
  }
  const Rbtn = (t) => ({ nemo: '#E8870F', semo: '#2F8FD0', dong: '#3B4A7A' }[t]);

  /* 시즌 사건 카드: 해당 달에만 나타나고, 해마다 한 번씩 다시 읽을 수 있다(연도별 도장). */
  const seasonOn = () => IDLE.season || new Date(now()).getMonth() + 1;
  const seasonList = () => (ST.seasons || []).filter((x) => (x.months || []).includes(seasonOn()));
  const seasonKey = (id) => id + ':' + new Date(now()).getFullYear();
  const seasonTodo = () => seasonList().filter((x) => !S.ss[seasonKey(x.id)]);
  /* 수익 연결 자리(지금은 전부 no-op). 결제 모듈이 붙으면 purchase 안에서 성공 시 IDLE.grant(sku) 를 부르면 끝난다.
     sku: 'full'(유료 1회 구매·A) · 'prop:<소품id>' · 'pack:all'(소품 팩 전체·C).  광고 자리(placement): 'offline2x'(접속 보상 2배). */
  IDLE.grant = function (sku) {
    if (sku === 'full') S.ent.full = 1;
    else if (sku === 'pack:all') PR.filter((x) => x.premium).forEach((x) => IDLE.grant('prop:' + x.id));
    else if (sku.indexOf('prop:') === 0) { const pp = PR.find((x) => x.id === sku.slice(5)); if (!pp) return false; S.pr[pp.id] = 1; S.ent[sku] = 1; const e = S.eq[pp.table]; if (e.length < PRD.max) e.push(pp.id); }
    else return false;
    save(); IDLE.hooks.event('grant', { sku }); return true;
  };
  IDLE.owns = (sku) => !!S.ent[sku] || (sku === 'full' && !!S.ent.full);
  /* 소품: 진행으로 얻고(대부분 무료), 몇 개만 premium 자리(결제는 no-op). */
  function condOk(c) {
    switch (c.t) {
      case 'free': return true;
      case 'story': return !!S.sd[c.id];
      case 'tl': return S.tl[c.table] >= c.lv;
      case 'gen': return lvl(c.id) >= (c.n || 1);
      case 'season': return Object.keys(S.ss).some((k) => k.indexOf(c.id + ':') === 0);
      case 'tot': return S.tot >= c.v;
      case 'chairs': return S.chairs >= c.n;
      default: return false;
    }
  }
  function checkProps() {
    PR.forEach((p) => { if (S.pr[p.id] || p.premium || !condOk(p.cond)) return; /* premium 은 grant 로만 */ S.pr[p.id] = 1; const e = S.eq[p.table]; if (e.length < PRD.max) e.push(p.id); if (UI.toastOk) toast('새 소품 · ' + p.name); IDLE.hooks.event('prop', { id: p.id }); });
  }
  const propIcon = (pp, px) => (pp.item && GF.propIcons && GF.propIcons[pp.item] ? `<img class="pi" src="${GF.propIcons[pp.item]}" style="width:${px}px;height:${px}px">` : pp.icon);
  const endingReady = () => { const E = B.ending; return !!S.sd[E.needStory] && ['nemo', 'semo', 'dong'].every((k) => S.tl[k] >= E.needLv) && S.chairs >= E.needChairs; };

  /* ---------------- 식탁(홈) ---------------- */
  GF.screen('itable', {
    bare: true,
    enter(r) {
      r.classList.add('idle'); const sc = el('div', 'scr', r); UI.upd = [];
      GF.bg('indoor', sc);
      const hd = el('div', 'hd', sc, '<div class="w"><span id="iw">0</span><small id="iwr"></small></div><div class="row"><span>웃음 <b id="il">0</b></span><span>식탁 합계 Lv <b id="itl">3</b></span><span>도감 <b id="idx">0%</b></span></div>');
      ['nemo', 'semo', 'dong'].forEach((t, i) => {
        const c = el('button', 'tcard', sc); c.style.top = 128 + i * 134 + 'px'; c.style.background = B.tables[t].color; c.dataset.t = t;
        c.appendChild(scene(t, 132, 124));
        const tx = el('div', 'tx', c, `<div class="nm" style="color:${B.tables[t].ink}">${B.tables[t].name}</div><div class="lv"></div><div class="rt"></div><div class="st"></div>`);
        el('div', 'bar', c, '<i></i>'); const dot = el('div', 'dot', c); dot.style.display = 'none';
        c.onclick = () => { GF.sfx('pick'); GF.go('idetail', { t }); };
        UI.upd.push(() => {
          const r_ = rates(now()), tn = { nemo: r_.n.w + r_.n.l, semo: r_.s.w, dong: r_.d.w }[t];
          $q(c, '.lv').textContent = '식탁 Lv ' + S.tl[t]; $q(c, '.rt').textContent = fmtRate(tn);
          $q(c, '.st').textContent = t === 'nemo' ? (r_.n.sat < 1 ? '밥그릇이 모자라요' : '넉넉하게 먹어요') : t === 'semo' ? (tripCd() > 0 ? (buffAt(now()) !== 1 ? '여행 중!' : '다음 여행 준비 중') : '여행 갈 수 있어요') : (r_.d.empty ? '빈 의자 ' + r_.d.empty + '개' : '모두 모였어요');
          const need = tlCost(t); $q(c, '.bar i').style.width = Math.min(100, S.w / need * 100) + '%';
          const alert = t === 'semo' ? (tripCd() === 0 && gross('semo') > 0 ? '!' : '') : t === 'dong' ? (invitesAvailable().length ? '초대' : '') : '';
          dot.style.display = alert ? 'flex' : 'none'; dot.textContent = alert;
        });
      });
      const sb = el('button', 'bigbtn sbtn', sc, '오늘의 사연 <span class="badge" style="display:none"></span>'); sb.style.cssText += ';left:10px;width:196px;bottom:12px;background:#E8870F';
      const db = el('button', 'bigbtn dbtn', sc, '도감'); db.style.cssText += ';left:216px;right:10px;bottom:12px;background:#3B4A7A';
      sb.onclick = () => { const rs = readyStories(); if (!rs.length) { const n = nextStory(); const i = n ? ST.stories.indexOf(n) : -1; GF.sfx('hmm'); toast(n ? '다음 사연은 온기를 ' + fmt(B.storyThresholds[i]) + ' 모으면 와요 (지금 ' + fmt(S.tot) + ')' : '지금은 새 사연이 없어요. 곧 새 이야기가 와요!'); return; } GF.sfx('pick'); GF.go('istory', { id: rs[0].id }); };
      db.onclick = () => { GF.sfx('pick'); GF.go('idex'); };
      UI.upd.push(() => {
        const r_ = rates(now()); $q(hd, '#iw').textContent = fmt(S.w); $q(hd, '#iwr').textContent = fmtRate(r_.w); $q(hd, '#il').textContent = fmt(S.l);
        $q(hd, '#itl').textContent = S.tl.nemo + S.tl.semo + S.tl.dong; $q(hd, '#idx').textContent = Math.round(dexCount() / B.dexTotal * 100) + '%';
        const n = readyStories().length, bd = $q(sb, '.badge'); bd.style.display = n ? 'inline-flex' : 'none'; bd.textContent = n;
      });
      const rb = el('button', 'ribbon', sc, ''); rb.style.display = 'none';
      rb.onclick = () => { if (endingReady() && !S.end) { GF.sfx('pick'); GF.go('istory', { id: 'end', ending: true }); return; } const t = seasonTodo()[0] || seasonList()[0]; if (t) { GF.sfx('pick'); GF.go('istory', { id: t.id, season: true }); } };
      UI.upd.push(() => { const l = seasonList(), todo = seasonTodo(), en = endingReady() && !S.end; rb.style.display = l.length || en ? 'flex' : 'none'; rb.classList.toggle('gold', en); if (en) rb.textContent = '세 식탁 한자리 · 초대장이 왔어요'; else if (l.length) rb.textContent = todo.length ? todo[0].season + ' 사건 · ' + todo[0].title : l[0].season + ' 사건 · 다시 보기'; rb.classList.toggle('done', !en && !todo.length); });
      UI.upd.forEach((f) => f());
      if (UI.welcome) { const w = UI.welcome; UI.welcome = null; welcomeBack(sc, w); }
    },
  });

  function welcomeBack(parent, w) {
    const ov = el('div', 'ov', parent), p = el('div', 'ovp', ov);
    const hrs = w.ms / 3600000, cap = w.capped;
    p.innerHTML = `<h2>다녀오셨어요?</h2><p>${hrs >= 1 ? Math.floor(hrs) + '시간 ' + Math.floor((hrs % 1) * 60) + '분' : Math.max(1, Math.floor(w.ms / 60000)) + '분'} 동안${cap ? ' (최대 8시간)' : ''} 식탁이 데워졌어요.</p><div class="big">+${fmt(w.gained)} 온기</div>${w.laugh >= 1 ? '<p>웃음 +' + fmt(w.laugh) + '</p>' : ''}`;
    const b = el('button', '', p, '받았어요'); b.onclick = () => { GF.sfx('star'); ov.remove(); };
    if (IDLE.hooks.adAvailable()) { const a = el('button', '', p, '광고 보고 2배 받기'); a.style.background = '#3B4A7A'; a.onclick = () => IDLE.hooks.rewardedAd('offline2x', (ok) => { if (ok) { S.w += w.gained; } ov.remove(); }); }
    GF.sfx('celebrate');
  }

  /* ---------------- 식탁 상세 ---------------- */
  GF.screen('idetail', {
    bare: true,
    enter(r, p) {
      r.classList.add('idle'); const t = p.t, T = B.tables[t], sc = el('div', 'scr', r); UI.upd = [];
      GF.bg('indoor', sc);
      const bk = el('button', 'back', sc, '‹'); bk.onclick = () => { GF.sfx('tap'); GF.back(); };
      el('div', 'ttl', sc, `<b style="color:${T.ink}">${T.name}</b><span>${T.tag}</span>`);
      const mini = el('div', 'mini', sc, '<span id="mw"></span><span id="mr"></span>');
      const list = el('div', 'scroll', sc); list.style.cssText += ';top:136px;bottom:0;padding-top:4px;padding-bottom:16px';
      const sceneBox = el('div', '', list); sceneBox.style.cssText = 'margin:0 10px 10px;border-radius:22px;overflow:hidden;height:124px;box-shadow:0 4px 0 rgba(0,0,0,.12)'; const rebuildScene = () => { sceneBox.innerHTML = ''; const s_ = scene(t, 132, 124); s_.style.cssText += ';width:100%;'; sceneBox.appendChild(s_); }; rebuildScene();
      const special = el('div', '', list);
      const rows = el('div', '', list);
      // 식탁 넓히기
      const up = el('div', 'panel2', list); const upb = el('button', 'bigbtn', up); upb.style.cssText += ';position:static;width:100%;height:64px;background:' + Rbtn(t);
      const upd = () => { const c = tlCost(t); upb.innerHTML = `식탁 넓히기 Lv${S.tl[t]} → Lv${S.tl[t] + 1} <small style="font-size:18px">(×${B.tableLevel.mult}) ${fmt(c)}</small>`; upb.disabled = S.w < c || S.tl[t] >= B.tableLevel.max; };
      upb.onclick = () => { const c = tlCost(t); if (S.w < c) return; S.w -= c; S.tl[t]++; GF.sfx('star'); GF.burst(sc, 180, 300, 14); renderAll(); IDLE.hooks.event('tableLevel', { t, lv: S.tl[t] }); };
      const rowEls = [];
      function renderAll() { rebuildScene(); special.innerHTML = ''; rows.innerHTML = ''; rowEls.length = 0; buildSpecial(); buildRows(); }
      function buildRows() {
        const all = T.gens.slice(); if (T.pot) all.push({ id: T.pot.id, name: T.pot.name, img: null, cost: T.pot.cost, growth: T.pot.growth, rate: 0, note: T.pot.note, pot: true });
        all.forEach((g, i) => {
          const prevOk = i === 0 || g.pot || lvl(T.gens[i - 1].id) > 0 || S.w >= g.cost * 0.6;
          const row = el('div', 'grow' + (prevOk ? '' : ' lock'), rows);
          if (g.img) row.appendChild(GF.img(g.img)); else row.appendChild(el('div', '', row, '<div style="width:52px;height:56px;font-size:40px;text-align:center">🍚</div>').firstChild);
          const gi = el('div', 'gi', row); const buy = el('button', 'buy', row); buy.style.background = Rbtn(t);
          const upg = () => {
            const c = genCost(g), L = lvl(g.id);
            gi.innerHTML = `<b>${g.name}${g.premium ? ' ★' : ''}${L ? ' Lv ' + L : ''}</b><span>${g.pot ? (g.note + ' · 지금 ' + (T.bowlsBase + L) + '개') : (L ? '지금 ' + fmtRate(L * g.rate) : '합류하면 ' + fmtRate(g.rate))}</span>`;
            buy.innerHTML = `${L ? '올리기' : '모시기'}<small>${fmt(c)}</small>`; buy.disabled = !prevOk || S.w < c;
          };
          buy.onclick = () => { const c = genCost(g); if (S.w < c) return; S.w -= c; S.g[g.id] = lvl(g.id) + 1; GF.sfx('ok'); const b_ = buy.getBoundingClientRect(); floatText(sc, 220, 160, '+' + (g.pot ? '1' : fmtRate(g.rate))); renderAll(); };
          upg(); rowEls.push(upg);
        });
      }
      function buildSpecial() {
        if (t === 'nemo') {
          const n = nemoInfo();
          const pn = el('div', 'panel2', special, `<h4>🍚 밥그릇 나눔</h4><p id="nstat"></p><div class="sl-l"><span>온기 쪽</span><span>웃음 쪽</span></div><input class="slider" type="range" min="0" max="1" step="0.05" value="${S.slider}"><p id="nres"></p>`);
          const sl = $q(pn, '.slider'); sl.oninput = () => { S.slider = +sl.value; updN(); GF.sfx('tap'); };
          const updN = () => { const n2 = nemoInfo(); $q(pn, '#nstat').textContent = `식구 ${n2.members}명 · 밥그릇 ${n2.bowls}개 ${n2.sat < 1 ? '→ 모자라서 생산 ' + Math.round((0.5 + 0.5 * n2.sat) * 100) + '%' : '→ 넉넉해요'}`; $q(pn, '#nres').textContent = `온기 ${fmtRate(n2.w)}  ·  웃음 +${(n2.l).toFixed(2)}/초`; };
          updN(); UI.upd.push(updN);
        }
        if (t === 'semo') {
          const pn = el('div', 'panel2', special, '<h4>✈ 지르기</h4><p id="tstat"></p>');
          const a = el('button', 'trip', pn, `${T.trip.sweet.name}<small>${T.trip.sweet.desc} — ${T.trip.sweet.sec}초 동안 ×${T.trip.sweet.mult}</small>`);
          const b = el('button', 'trip', pn, `${T.trip.extreme.name}<small>${T.trip.extreme.desc} — ${T.trip.extreme.pauseSec}초 멈춤 뒤 ${T.trip.extreme.sec}초 동안 ×${T.trip.extreme.mult}</small>`);
          const go = (k) => { if (tripCd() > 0 || gross('semo') <= 0) return; const tt = now(), c = T.trip[k]; S.buffs = S.buffs.filter((x) => x.until > tt);
            if (k === 'sweet') S.buffs.push({ from: tt, until: tt + c.sec * 1000, mult: c.mult });
            else { S.buffs.push({ from: tt, until: tt + c.pauseSec * 1000, mult: 0 }); S.buffs.push({ from: tt + c.pauseSec * 1000, until: tt + (c.pauseSec + c.sec) * 1000, mult: c.mult }); }
            S.tripReady = tt + T.trip.cooldownSec * 1000; GF.sfx(k === 'sweet' ? 'ok' : 'wind'); S.l += 5; toast(k === 'sweet' ? '손잡고 온천으로~' : '공항에서 대판! …그리고 온천 화해'); upd2(); };
          a.onclick = () => go('sweet'); b.onclick = () => go('extreme');
          const upd2 = () => { const cd = Math.ceil(tripCd() / 1000), act = buffAt(now()) !== 1, can = gross('semo') > 0 && cd === 0; a.disabled = b.disabled = !can; $q(pn, '#tstat').textContent = gross('semo') <= 0 ? '두 사람을 먼저 모셔 오세요' : act ? '여행 중! 곧 온기가 터져요' : cd ? '다음 여행까지 ' + cd + '초' : '둘 중 하나를 골라 떠나요 (손해 없음)'; };
          upd2(); UI.upd.push(upd2);
        }
        if (t === 'dong') {
          const pn = el('div', 'panel2', special, `<h4>🪑 빈 의자</h4><div class="chairs"></div><p id="dstat"></p>`);
          const ch = $q(pn, '.chairs'); for (let i = 0; i < T.chairs; i++) el('div', 'chair' + (i < S.chairs ? ' on' : ''), ch, i < S.chairs ? '●' : '');
          const avail = invitesAvailable(); const dst = $q(pn, '#dstat');
          if (avail.length) { const iv = T.invites[avail[0]]; dst.textContent = iv.text; const ab = el('button', 'bigbtn', pn, '초대 받아들이기'); ab.style.cssText += ';position:static;width:100%;background:#3B4A7A;margin-top:6px'; ab.onclick = () => { S.inv.push(avail[0]); S.chairs++; S.l += 20 * S.chairs; GF.sfx('celebrate'); GF.burst(sc, 180, 220, 18); toast('의자 하나가 찼어요. 웃음이 늘었어요'); renderAll(); }; }
          else dst.textContent = S.chairs >= T.chairs ? '모두 모였어요. 이제 온기도 웃음도 가득해요.' : '다른 식탁이 풍성해지면 초대장이 와요. (네모네·세모네 식탁을 넓혀 보세요)';
          UI.upd.push(() => {});
        }
      }
      renderAll();
      UI.upd.push(() => { const r_ = rates(now()); $q(mini, '#mw').textContent = '온기 ' + fmt(S.w); $q(mini, '#mr').textContent = fmtRate(r_.w); upd(); rowEls.forEach((f) => f()); });
      UI.upd.forEach((f) => f());
    },
  });

  /* ---------------- 사연 ---------------- */
  const CAST = (a, SH) => {
    const role = (id) => (/^baby\./.test(id) ? 'baby' : /^(nemo_kids|code\.dong_(son|daughter))\./.test(id) ? 'kid' : 'adult'), RATIO = { adult: 1, kid: 0.8, baby: 0.45 };
    const A = 230, list = a.map((id) => ({ id, role: role(id), asp: GF.aspect(id) }));
    list.forEach((q) => { q.h = A * RATIO[q.role]; q.w = q.h * q.asp; });
    const tot = list.reduce((s, q) => s + q.w * 0.8, 0), f = Math.min(1, 336 / (tot || 1)); list.forEach((q) => { q.h *= f; q.w *= f; });
    return list;
  };
  GF.screen('istory', {
    bare: true,
    enter(r, p) {
      r.classList.add('idle'); const sc = el('div', 'scr', r), st = p.ending ? ST.ending : (p.season ? ST.seasons : ST.stories).find((x) => x.id === p.id), seen = p.ending ? S.end : p.season ? S.ss[seasonKey(p.id)] : S.sd[st.id]; let i = 0; UI.upd = [];
      const bgHost = el('div', 'abs', sc); bgHost.style.cssText = 'inset:0';
      const bk = el('button', 'back', sc, '‹'); bk.onclick = () => { GF.sfx('tap'); GF.back(); };
      const cnt = el('div', 'cnt', sc);
      const stage = el('div', 'abs', sc); stage.style.cssText = 'inset:0;z-index:2';
      const cap = el('div', 'cap', sc); const nx = el('button', 'bigbtn', sc, '다음 ›'); nx.style.cssText += ';right:10px;bottom:12px;width:200px;background:#E8870F;z-index:5';
      GF.bg(st.bg, bgHost);
      function render() {
        stage.innerHTML = ''; const c = st.cuts[i]; cnt.textContent = st.title + ' · ' + (i + 1) + '/' + st.cuts.length;
        cap.textContent = c.text; if (IDLE.review) { el('div', 'tag', cap, c.src + (c.stand_in ? ' · 대역' : '')); }
        const feet = 640 - 82 - cap.offsetHeight - 4;                      // 글상자가 길면 인물이 그 위로 올라온다
        const list = CAST(c.chars, 640), mh = Math.max.apply(null, list.map((q) => q.h)), f = Math.min(1, (feet - 90) / mh);
        list.forEach((q) => { q.h *= f; q.w *= f; });
        const tot = list.reduce((s, q) => s + q.w * 0.8, 0); let x = 180 - tot / 2;
        list.forEach((q, k) => { const d = el('div', 'cut-char in', stage); d.style.cssText = `left:${x + q.w / 2}px;top:${feet}px;height:${q.h}px;width:${q.w}px;animation-delay:${k * 0.1}s`; d.appendChild(GF.img(q.id)); x += q.w * 0.8; });
        if (c.bubble) { const bb = el('div', 'bubble', stage, {bang:'<svg viewBox="0 0 52 52"><rect x="21" y="6" width="10" height="26" rx="5" fill="#FF8FA8"/><circle cx="26" cy="43" r="6" fill="#FF8FA8"/></svg>',question:'<svg viewBox="0 0 52 52"><path d="M16 18c0-7 6-11 11-11 6 0 10 4 10 9 0 8-9 8-10 15" fill="none" stroke="#8FD3F4" stroke-width="7" stroke-linecap="round"/><circle cx="26" cy="44" r="5" fill="#8FD3F4"/></svg>',heart:'<svg viewBox="0 0 52 52"><path d="M26 44C8 31 6 16 16 11c5-2 9 1 10 5 1-4 5-7 10-5 10 5 8 20-10 33z" fill="#FF6B8B"/></svg>',sparkle:'<svg viewBox="0 0 52 52"><path d="M26 4l5 17 17 5-17 5-5 17-5-17-17-5 17-5z" fill="#FFC933"/></svg>'}[c.bubble]); bb.style.left = '180px'; bb.style.top = Math.max(110, feet - list[0].h * 0.9 - 4) + 'px'; }
        nx.textContent = i < st.cuts.length - 1 ? '다음 ›' : '다 읽었어요';
      }
      nx.onclick = () => { GF.sfx('page'); if (i < st.cuts.length - 1) { i++; render(); } else question(); };
      function question() {
        stage.innerHTML = ''; cap.style.display = 'none'; nx.style.display = 'none'; cnt.textContent = '';
        const q = el('div', 'q', sc, `<h3>${st.question.q}</h3>`);
        st.question.options.forEach((o, k) => { const b = el('button', 'opt', q, `<i>${{ nemo: '🟦', semo: '🔺', dong: '⚪' }[o.k]}</i>${o.t}`); b.style.background = B.tables[o.k].color; b.style.color = B.tables[o.k].ink;
          b.onclick = () => { if (p.ending) S.end = now(); else if (p.season) S.ss[seasonKey(st.id)] = { k: o.k, t: now() }; else S.sd[st.id] = { k: o.k, t: now() }; const lg = st.reward.laugh; S.l += lg; GF.sfx('celebrate'); q.remove(); done(o.k, lg); }; });
      }
      function done(k, lg) {
        const ov = el('div', 'ov', sc), pp = el('div', 'ovp', ov), pct = Math.round(dexCount() / B.dexTotal * 100);
        pp.innerHTML = `<h2>당신은 ${FAM[k]} 쪽이군요</h2><p>${B.tables[k].tag}</p><div class="big">웃음 +${lg}</div><p>${p.ending ? '세 식탁이 큰 한 상에 모였어요.' : p.season ? '올해의 ' + st.season + ' 도장을 찍었어요' : '도감 ' + dexCount() + '/' + B.dexTotal + ' (' + pct + '%)'}</p>${st.stat ? '<p style="font-size:18px">' + st.stat + '</p>' : ''}`;
        const b = el('button', '', pp, '식탁으로'); b.onclick = () => { ov.remove(); GF.back(); }; save();
      }
      if (seen) { /* 다시 보기: 질문은 건너뛴다 */ nx.onclick = () => { GF.sfx('page'); if (i < st.cuts.length - 1) { i++; render(); } else GF.back(); }; }
      render();
    },
  });

  /* ---------------- 도감 ---------------- */
  GF.screen('idex', {
    bare: true,
    enter(r) {
      r.classList.add('idle'); const sc = el('div', 'scr', r); UI.upd = [];
      GF.bg('indoor', sc); const bk = el('button', 'back', sc, '‹'); bk.onclick = () => { GF.sfx('tap'); GF.back(); };
      const pct = Math.round(dexCount() / B.dexTotal * 100);
      el('div', 'ttl', sc, `<b>도감 ${dexCount()}/${B.dexTotal}</b><span>모은 사연 ${pct}%</span>`);
      const list = el('div', 'scroll', sc); list.style.cssText += ';top:84px;bottom:0;padding-top:4px';
      const cnt = { nemo: 0, semo: 0, dong: 0 }; Object.values(S.sd).forEach((x) => cnt[x.k]++); const tot = Math.max(1, cnt.nemo + cnt.semo + cnt.dong);
      const tp = el('div', 'panel2', list, '<h4>나는 어느 도형일까?</h4>');
      ['nemo', 'semo', 'dong'].forEach((k) => { const pc = Math.round(cnt[k] / tot * 100); tp.insertAdjacentHTML('beforeend', `<p style="color:${B.tables[k].ink};font-weight:800">${{ nemo: '🟦', semo: '🔺', dong: '⚪' }[k]} ${FAM[k]} ${Object.keys(S.sd).length ? pc + '%' : '-'}</p><div class="bar2"><i style="width:${Object.keys(S.sd).length ? pc : 0}%;background:${B.tables[k].ink}"></i></div>`); });
      const pb = el('button', 'bigbtn', list, '소품 수집 ' + Object.keys(S.pr).length + '/' + PR.length); pb.style.cssText += ';position:static;width:calc(100% - 20px);margin:0 10px 10px;background:#E8870F';
      pb.onclick = () => { GF.sfx('pick'); GF.go('iprops'); };
      if (S.end || endingReady()) { const eb = el('button', 'bigbtn', list, S.end ? '큰 한 상 다시 보기' : '큰 한 상 초대장'); eb.style.cssText += ';position:static;width:calc(100% - 20px);margin:0 10px 10px;background:#B8860B'; eb.onclick = () => { GF.sfx('pick'); GF.go('istory', { id: 'end', ending: true }); }; }
      const sp = el('div', 'panel2', list, '<h4>계절 사건 (해마다 돌아와요)</h4>');
      (ST.seasons || []).forEach((x) => { const done = S.ss[seasonKey(x.id)], on = x.months.includes(seasonOn()); const b2 = el('button', 'trip', sp, `${done ? '✔ ' : on ? '● ' : '○ '}${x.title}<small>${x.months.join('·')}월 ${done ? '· 올해 도장 완료' : on ? '· 지금 읽을 수 있어요' : ''}</small>`); b2.disabled = !on && !done; b2.onclick = () => { GF.sfx('pick'); GF.go('istory', { id: x.id, season: true }); }; });
      const g = el('div', 'dexg', list);
      for (let k = 0; k < B.dexTotal; k++) {
        const s = ST.stories[k]; const got = s && S.sd[s.id]; const b = el('button', 'dexc' + (got ? '' : ' off'), g);
        if (s) { if (got) { b.appendChild(GF.img(s.cuts[0].chars[0])); b.insertAdjacentHTML('beforeend', s.title); } else b.textContent = S.tot >= B.storyThresholds[k] ? '새 사연!' : '???'; b.onclick = () => { if (got) { GF.sfx('pick'); GF.go('istory', { id: s.id }); } else if (S.tot >= B.storyThresholds[k]) { GF.sfx('pick'); GF.go('istory', { id: s.id }); } else GF.sfx('hmm'); }; }
        else b.textContent = '곧 와요';
      }
      const set = el('div', 'panel2', list, '<h4>설정</h4>'); const sb = el('button', 'bigbtn', set); sb.style.cssText += ';position:static;width:100%;background:#7A6F84;margin-bottom:8px';
      const sUp = () => { sb.textContent = '소리 ' + (GF.state.settings.mute ? '꺼짐 → 켜기' : '켜짐 → 끄기'); }; sUp();
      sb.onclick = () => { GF.state.settings.mute = !GF.state.settings.mute; GF.Store.save(); GF.bgm.sync(); sUp(); };
      const rb = el('button', 'bigbtn', set, '처음부터 다시'); rb.style.cssText += ';position:static;width:100%;background:#B04040'; let armed = false;
      rb.onclick = () => { if (!armed) { armed = true; rb.textContent = '정말요? 한 번 더 누르면 지워져요'; setTimeout(() => { armed = false; rb.textContent = '처음부터 다시'; }, 3000); return; } S = fresh(); save(); GF.stack = []; GF.go('itable'); };
      el('p', '', set, '버전 0.1 (MVP 1주차) · 기기 안에만 저장돼요').style.cssText = 'font-size:18px;color:#5B4F60;margin-top:8px';
    },
  });

  /* ---------------- 소품 수집 ---------------- */
  GF.screen('iprops', {
    bare: true,
    enter(r) {
      r.classList.add('idle'); const sc = el('div', 'scr', r); UI.upd = []; UI.toastOk = true;
      GF.bg('indoor', sc); const bk = el('button', 'back', sc, '‹'); bk.onclick = () => { GF.sfx('tap'); GF.back(); };
      el('div', 'ttl', sc, `<b>소품 ${Object.keys(S.pr).length}/${PR.length}</b><span>눌러서 식탁에 놓거나 치워요 (식탁마다 3개)</span>`);
      const list = el('div', 'scroll', sc); list.style.cssText += ';top:84px;bottom:0;padding-top:4px';
      ['nemo', 'semo', 'dong'].forEach((t) => {
        el('div', 'panel2', list, `<h4 style="color:${B.tables[t].ink}">${B.tables[t].name}</h4>`).style.marginBottom = '4px';
        const g = el('div', 'dexg', list);
        PR.filter((x) => x.table === t).forEach((pp) => {
          const own = S.pr[pp.id], on = (S.eq[t] || []).includes(pp.id);
          const b = el('button', 'dexc' + (own ? '' : ' off') + (on ? ' on' : ''), g, `<span class="ic">${own || !pp.premium ? propIcon(pp, 44) : '🔒'}</span>${pp.name}${pp.premium ? ' ★' : ''}`);
          b.onclick = () => {
            if (own) { const e = S.eq[t], k = e.indexOf(pp.id); if (k >= 0) e.splice(k, 1); else { e.push(pp.id); if (e.length > PRD.max) e.shift(); } GF.sfx('tap'); save(); GF.screens.iprops.el.innerHTML = ''; GF.screens.iprops.enter(GF.screens.iprops.el); return; }
            if (pp.premium) { GF.sfx('hmm'); IDLE.hooks.purchase('prop:' + pp.id, (ok) => { if (ok && IDLE.grant('prop:' + pp.id)) { GF.screens.iprops.el.innerHTML = ''; GF.screens.iprops.enter(GF.screens.iprops.el); } else toast('꾸미기 팩은 준비 중이에요'); }); return; }
            GF.sfx('hmm'); toast('얻는 법: ' + pp.hint);
          };
        });
      });
    },
  });

  /* ---------------- 루프·저장·부팅 ---------------- */
  function tick() {
    const t = now(); advance(S.last, t); S.last = t; checkProps();
    UI.upd.forEach((f) => f());
    if (!document.hidden) { tick.n = (tick.n || 0) + 1; if (tick.n % 20 === 0) save(); }
  }
  // 오프라인: 지금 속도 그대로 선형 × 효율(복리 없음, 웃음·여행 버프는 쌓이지 않음). 3분 온라인이 늘 더 재미있다.
  function offline() {
    const t = now(), dt = t - S.last, cap = B.offlineCapHours * 3600000;
    if (dt < 2 * 60000) return null;
    const use = Math.min(dt, cap), r = rates(Infinity), gained = (r.n.w + r.s.base + r.d.w) * (use / 1000) * B.offlineEfficiency;
    S.w += gained; S.tot += gained; S.last = t;
    return { ms: dt, capped: dt > cap, gained, laugh: 0 };
  }
  // 테스트·디버그: 가짜 시계 (8시간 경과 시험 등)
  IDLE.debug = {
    S: () => S, B: () => B, PR: () => PR, checkProps, tlCost, endingReady, rates: () => rates(now()), fmt,
    skip(ms) { S.clock = (S.clock || 0) + ms; return offline(); },
    awayHours(h) { S.last -= h * 3600000; save(); },
    buy(id) { const t = Object.keys(B.tables).find((k) => B.tables[k].gens.some((g) => g.id === id) || (B.tables[k].pot && B.tables[k].pot.id === id)); const g = B.tables[t].gens.find((x) => x.id === id) || B.tables[t].pot; const c = genCost(g); if (S.w < c) return false; S.w -= c; S.g[id] = lvl(id) + 1; return true; },
    give(w) { S.w += w; S.tot += w; },
    snap() { return JSON.stringify(S); }, restore(j) { S = Object.assign(fresh(), JSON.parse(j)); S.last = now(); },
    reloadOffline() { save(); const o = offline(); UI.welcome = o; return o; },
  };

  /* 동그라미 아들·엄마·딸: 래스터가 올 때까지 src/characters.js(읽기 전용)의 코드 그림을 GF.art 로 만든다. 엔진 GF 를 덮지 않도록 가짜 window 로 실행. */
  async function loadCodeChars() {
    try {
      const code = window.GF_CODECHARS || await (await fetch(GF.base + 'src/characters.js')).text(), fake = {};
      new Function('window', code)(fake);
      const C = fake.GF, defs = C.ROUGH_DEFS.replace(/<svg[^>]*>/, '<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0">') ;
      const mk = { dong_mom: ['dongMom', 44], dong_son: ['dongSon', 34], dong_daughter: ['dongDaughter', 34] };
      GF.art = GF.art || {}; GF.propIcons = {};
      ['coffee', 'americano', 'remote', 'glasses2', 'pills', 'bag', 'phone', 'book', 'condolence', 'racket', 'violin'].forEach((it) => {      // 소품 아이콘: 코드 그림 우선
        GF.propIcons[it] = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="24 28 52 52" width="220" height="220">' + C.itemAt(it, 50, 66, 100) + '</svg>');
      });
      Object.keys(mk).forEach((k) => ['good', 'joy', 'tired', 'worry', 'calm'].forEach((emo) => {
        const [fn, r] = mk[k], g = C[fn]({ cx: 70, cy: 52 + r * 0.2 + (r > 40 ? 6 : 0), r, emo: emo === 'calm' ? 'good' : emo, item: null });
        const W = 140, H = 150;
        const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W * 3 + '" height="' + H * 3 + '">' + C.ROUGH_DEFS.replace(/^<svg[^>]*>|<\/svg>$/g, '') + C.CHAR_STYLE + g + '</svg>';
        GF.art['code.' + k + '.' + emo] = { src: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg), w: W, h: H };
      }));
    } catch (e) { console.error('code chars', e); }
  }
  IDLE.start = async function (opts) {
    await GF.boot(Object.assign({ dataNames: ['chars', 'anchors', 'sounds', 'idle_balance', 'idle_stories', 'idle_props'], storeKey: 'gf:idle:ui:v1', async start() {
      await loadCodeChars();
      B = GF.data.idle_balance; ST = GF.data.idle_stories; PRD = GF.data.idle_props; PR = PRD.props; S = load(); checkProps(); UI.toastOk = true; S.last = S.last || Date.now();
      const o = offline(); if (o && o.gained > 0) UI.welcome = o;
      if (!B || !ST) return; GF.go('itable');
      setInterval(tick, 250); document.addEventListener('visibilitychange', () => { if (document.hidden) save(); else { const o2 = offline(); if (o2 && o2.gained > 0 && GF.cur.name === 'itable') { UI.welcome = o2; const e = GF.screens.itable.el; e.innerHTML = ''; GF.screens.itable.enter(e); } else if (o2 && o2.gained > 0) UI.welcome = o2; } });
      window.addEventListener('pagehide', save);
    } }, opts || {}));
  };
})();
