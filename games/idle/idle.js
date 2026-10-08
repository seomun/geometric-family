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
  function toast(msg) { UK.toast(msg, GF.screens[GF.cur.name].el); }   // 키트 토스트(모든 게임 같은 모양)
  /* 모든 화면 공통 상단 바 = 엔진 상단 바(#topbar): ‹ · 집 · 진행 알약 · 소리 — 홈 화면만 ‹ 없음. 알약 값 = 웃음 누적(모든 화면 같은 값) */
  GF.home = () => { GF.stack = []; GF.go('itable'); }; GF.home2 = GF.home;
  GF.pill = () => UK.icon('heart') + '<span>' + fmt(S ? S.l : 0) + '</span>';
  function bar() { UI.upd.push(() => GF.refreshBar()); }
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
    Room.owned().map((id) => Room.item(id)).filter((x) => x && x.set === 'kitchen' && x.room === t).slice(0, 3).forEach((it, k) => { const sp = el('img', '', d); sp.src = Room.src(it, it.colors[0]); sp.style.cssText = `position:absolute;left:${20 + k * 36}px;top:62px;width:28px;height:28px;z-index:20;pointer-events:none`; });   // 식탁 위에는 집에 놓인 주방 소품이 보인다
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
    else if (sku.indexOf('prop:') === 0) { if (!Room.item(sku.slice(5))) return false; Room.grant(sku.slice(5)); S.ent[sku] = 1; }
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
  function checkProps() {      // 조건을 채우면 공유 룸(주방·식탁 세트) 아이템을 얻는다 — 보상의 끝은 집에 놓기. premium 은 grant 로만
    PR.forEach((p) => { if (Room.has(p.id) || p.premium || !condOk(p.cond)) return; Room.grant(p.id); IDLE.hooks.event('prop', { id: p.id }); });
  }
  const propIcon = (pp, px) => (pp.item && GF.propIcons && GF.propIcons[pp.item] ? `<img class="pi" src="${GF.propIcons[pp.item]}" style="width:${px}px;height:${px}px">` : pp.icon);
  const endingReady = () => { const E = B.ending; return !!S.sd[E.needStory] && ['nemo', 'semo', 'dong'].every((k) => S.tl[k] >= E.needLv) && S.chairs >= E.needChairs; };

  /* ---------------- 식탁(홈) ---------------- */
  GF.screen('itable', {
    bare: false,
    enter(r) {
      r.classList.add('idle'); const sc = el('div', 'scr', r); UI.upd = [];
      GF.bg('indoor', sc); bar();
      const hd = el('div', 'hd', sc, '<div class="w"><span id="iw">0</span><small id="iwr"></small></div><div class="row"><span>웃음 <b id="il">0</b></span><span>식탁 합계 Lv <b id="itl">3</b></span><span>도감 <b id="idx">0%</b></span></div>');
      ['nemo', 'semo', 'dong'].forEach((t, i) => {
        const c = el('button', 'tcard', sc); c.style.top = 160 + i * 118 + 'px'; c.style.background = B.tables[t].color; c.dataset.t = t;
        c.appendChild(scene(t, 132, 112));
        const tx = el('div', 'tx', c, `<div class="nm" style="color:${B.tables[t].ink}">${B.tables[t].name}</div><div class="lv"></div><div class="rt"></div><div class="st"></div>`);
        el('div', 'bar', c, '<i></i>'); const dot = el('div', 'dot', c); dot.style.display = 'none';
        c.onclick = () => { GF.sfx('pick'); GF.go('idetail', { t }); };
        if (t === 'nemo' && !S.tot && !Object.keys(S.g).length) setTimeout(() => { if (c.isConnected) UK.finger(r, c); }, 900);   // 첫 실행: 네모네 식탁 → 첫 식구 사기
        UI.upd.push(() => {
          const r_ = rates(now()), tn = { nemo: r_.n.w + r_.n.l, semo: r_.s.w, dong: r_.d.w }[t];
          $q(c, '.lv').textContent = '식탁 Lv ' + S.tl[t]; $q(c, '.rt').textContent = fmtRate(tn);
          $q(c, '.st').textContent = t === 'nemo' ? (r_.n.sat < 1 ? '밥그릇이 모자라요' : '넉넉하게 먹어요') : t === 'semo' ? (tripCd() > 0 ? (buffAt(now()) !== 1 ? '여행 중!' : '다음 여행 준비 중') : '여행 갈 수 있어요') : (r_.d.empty ? '빈 의자 ' + r_.d.empty + '개' : '모두 모였어요');
          const need = tlCost(t); $q(c, '.bar i').style.width = Math.min(100, S.w / need * 100) + '%';
          const alert = t === 'semo' ? (tripCd() === 0 && gross('semo') > 0 ? '!' : '') : t === 'dong' ? (invitesAvailable().length ? '초대' : '') : '';
          dot.style.display = alert ? 'flex' : 'none'; dot.textContent = alert;
        });
      });
      const sb = el('button', 'uk-btn nemo sbtn', sc, '오늘의 사연 <span class="badge" style="display:none"></span>'); sb.style.cssText += ';position:absolute;left:10px;width:196px;bottom:12px;background:#E8870F';
      const db = el('button', 'uk-btn dong dbtn', sc, '도감'); db.style.cssText += ';position:absolute;left:216px;right:10px;bottom:12px;background:#3B4A7A';
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
      { const pl = Room.mePlate(hd); if (pl) { pl.style.cssText += ';position:absolute;right:6px;top:6px;transform:scale(.74);transform-origin:right top;'; } }   // 내 도형 문패(⑤ 결과)
      UI.upd.forEach((f) => f());
      if (UI.welcome) { const w = UI.welcome; UI.welcome = null; welcomeBack(sc, w); }
    },
  });

  function welcomeBack(parent, w) {
    const hrs = w.ms / 3600000, cap = w.capped;
    const acts = [{ text: '받았어요', onclick: () => GF.sfx('star') }];
    if (IDLE.hooks.adAvailable()) acts.push({ text: '광고 보고 2배 받기', cls: 'dong', onclick: () => IDLE.hooks.rewardedAd('offline2x', (ok) => { if (ok) { S.w += w.gained; S.tot += w.gained; save(); } }) });
    UK.modal({ parent, title: '다녀오셨어요?', body: (hrs >= 1 ? Math.floor(hrs) + '시간 ' + Math.floor((hrs % 1) * 60) + '분' : Math.max(1, Math.floor(w.ms / 60000)) + '분') + ' 동안' + (cap ? ' (최대 8시간)' : '') + ' 식탁이 데워졌어요.', big: '+' + fmt(w.gained) + ' 온기', actions: acts });
    GF.sfx('celebrate');
  }

  /* ---------------- 식탁 상세 ---------------- */
  GF.screen('idetail', {
    bare: false,
    enter(r, p) {
      r.classList.add('idle'); const t = p.t, T = B.tables[t], sc = el('div', 'scr', r); UI.upd = [];
      GF.bg('indoor', sc);
      bar();
      const tt = el('div', 'ttl', sc, `<b style="color:${T.ink}">${T.name}</b><span>${T.tag}</span>`); tt.style.cssText += ';top:64px;left:14px;height:48px';
      const mini = el('div', 'mini', sc, '<span id="mw"></span><span id="mr"></span>'); mini.style.top = '120px';
      const list = el('div', 'scroll', sc); list.style.cssText += ';top:172px;bottom:0;padding-top:4px;padding-bottom:16px';
      const sceneBox = el('div', '', list); sceneBox.style.cssText = 'margin:0 10px 10px;border-radius:22px;overflow:hidden;height:124px;box-shadow:0 4px 0 rgba(0,0,0,.12)'; const rebuildScene = () => { sceneBox.innerHTML = ''; const s_ = scene(t, 132, 124); s_.style.cssText += ';width:100%;'; sceneBox.appendChild(s_); }; rebuildScene();
      const special = el('div', '', list);
      const rows = el('div', '', list);
      // 식탁 넓히기
      const up = el('div', 'panel2', list); const upb = el('button', 'uk-btn', up); upb.style.cssText += ';position:static;width:100%;height:64px;background:' + Rbtn(t);
      const upd = () => { const c = tlCost(t); upb.innerHTML = `식탁 넓히기 Lv${S.tl[t]} → Lv${S.tl[t] + 1} <small style="font-size:calc(18px * var(--uk-fs-k, 1))">(×${B.tableLevel.mult}) ${fmt(c)}</small>`; upb.disabled = S.w < c || S.tl[t] >= B.tableLevel.max; };
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
          if (avail.length) { const iv = T.invites[avail[0]]; dst.textContent = iv.text; const ab = el('button', 'uk-btn', pn, '초대 받아들이기'); ab.style.cssText += ';position:static;width:100%;background:#3B4A7A;margin-top:6px'; ab.onclick = () => { S.inv.push(avail[0]); S.chairs++; S.l += 20 * S.chairs; GF.sfx('celebrate'); GF.burst(sc, 180, 220, 18); toast('의자 하나가 찼어요. 웃음이 늘었어요'); renderAll(); }; }
          else dst.textContent = S.chairs >= T.chairs ? '모두 모였어요. 이제 온기도 웃음도 가득해요.' : '다른 식탁이 풍성해지면 초대장이 와요. (네모네·세모네 식탁을 넓혀 보세요)';
          UI.upd.push(() => {});
        }
      }
      renderAll();
      if (!S.tot && !Object.keys(S.g).length) setTimeout(() => { const bt = list.querySelector('.buy:not([disabled])') || list.querySelector('.buy'); if (bt && bt.isConnected) UK.finger(sc, bt); }, 700);
      UI.upd.push(() => { const r_ = rates(now()); $q(mini, '#mw').textContent = '온기 ' + fmt(S.w); $q(mini, '#mr').textContent = fmtRate(r_.w); upd(); rowEls.forEach((f) => f()); });
      UI.upd.forEach((f) => f());
    },
  });

  /* ---------------- 사연 ---------------- */
  /* 사연: 공용 사연 컷 플레이어(GF.story) — ①그림책과 같은 액자·자막·넘김. 끝에 "당신은 어느 도형인가요?" 선택 */
  GF.screen('istory', {
    bare: false,
    enter(r, p) {
      r.classList.add('idle', 'uk'); UI.upd = [];
      const st = p.ending ? ST.ending : (p.season ? ST.seasons : ST.stories).find((x) => x.id === p.id), seen = p.ending ? S.end : p.season ? S.ss[seasonKey(p.id)] : S.sd[st.id];
      const cuts = st.cuts.map((c) => ({ bg: st.bg || 'indoor', text: c.text, chars: c.chars.map((id, k, a) => ({ id, x: a.length > 1 ? 50 + k * (260 / (a.length - 1)) : 180, y: 600 })), bubble: c.bubble ? { type: c.bubble, at: 0 } : null }));
      bar();
      const hold = el('div', 'abs', r); hold.style.cssText = 'inset:0'; 
      GF.story(hold, cuts, () => { if (seen) { GF.back(); return; } question(); });
      function question() {
        const q = UK.modal({ parent: r, title: st.question.q, actions: st.question.options.map((o) => ({ text: o.t, cls: o.k, icon: null, keep: true, onclick: () => { q.close(); answer(o); } })) });
        q.firstChild.classList.add('opts');
      }
      function answer(o) {
        if (p.ending) S.end = now(); else if (p.season) S.ss[seasonKey(st.id)] = { k: o.k, t: now() }; else S.sd[st.id] = { k: o.k, t: now() };
        const lg = st.reward.laugh; S.l += lg; GF.sfx('celebrate'); const pct = Math.round(dexCount() / B.dexTotal * 100);
        UK.modal({ parent: r, title: '당신은 ' + FAM[o.k] + ' 쪽이군요', body: B.tables[o.k].tag + '<br>' + (p.ending ? '세 식탁이 큰 한 상에 모였어요.' : p.season ? '올해의 ' + st.season + ' 도장을 찍었어요' : '도감 ' + dexCount() + '/' + B.dexTotal + ' (' + pct + '%)') + (st.stat ? '<br><small>' + st.stat + '</small>' : ''), big: '웃음 +' + lg, actions: [{ text: '식탁으로', onclick: () => GF.back() }] });
        save();
      }
    },
  });

  /* ---------------- 도감 ---------------- */
  GF.screen('idex', {
    bare: false,
    enter(r) {
      r.classList.add('idle'); const sc = el('div', 'scr', r); UI.upd = [];
      GF.bg('indoor', sc); bar();
      const pct = Math.round(dexCount() / B.dexTotal * 100);
      const tt = el('div', 'ttl', sc, `<b>도감 ${dexCount()}/${B.dexTotal}</b><span>모은 사연 ${pct}%</span>`); tt.style.cssText += ';top:64px;left:14px;height:48px';
      const list = el('div', 'scroll', sc); list.style.cssText += ';top:116px;bottom:0;padding-top:4px';
      const cnt = { nemo: 0, semo: 0, dong: 0 }; Object.values(S.sd).forEach((x) => cnt[x.k]++); const tot = Math.max(1, cnt.nemo + cnt.semo + cnt.dong);
      const tp = el('div', 'panel2', list, '<h4>나는 어느 도형일까?</h4>');
      ['nemo', 'semo', 'dong'].forEach((k) => { const pc = Math.round(cnt[k] / tot * 100); tp.insertAdjacentHTML('beforeend', `<p style="color:${B.tables[k].ink};font-weight:800">${{ nemo: '🟦', semo: '🔺', dong: '⚪' }[k]} ${FAM[k]} ${Object.keys(S.sd).length ? pc + '%' : '-'}</p><div class="bar2"><i style="width:${Object.keys(S.sd).length ? pc : 0}%;background:${B.tables[k].ink}"></i></div>`); });
      const pb = el('button', 'uk-btn', list, UK.icon('home') + '<span>우리 집 ' + Room.owned().filter((id) => (Room.item(id) || {}).set === 'kitchen').length + '/' + PR.length + '</span>'); pb.style.cssText += ';position:static;width:calc(100% - 20px);margin:0 10px 10px;background:#E8870F';
      pb.onclick = () => { GF.sfx('pick'); GF.go('ihouse'); };
      if (S.end || endingReady()) { const eb = el('button', 'uk-btn', list, S.end ? '큰 한 상 다시 보기' : '큰 한 상 초대장'); eb.style.cssText += ';position:static;width:calc(100% - 20px);margin:0 10px 10px;background:#B8860B'; eb.onclick = () => { GF.sfx('pick'); GF.go('istory', { id: 'end', ending: true }); }; }
      const sp = el('div', 'panel2', list, '<h4>계절 사건 (해마다 돌아와요)</h4>');
      (ST.seasons || []).forEach((x) => { const done = S.ss[seasonKey(x.id)], on = x.months.includes(seasonOn()); const b2 = el('button', 'trip', sp, `${done ? '✔ ' : on ? '● ' : '○ '}${x.title}<small>${x.months.join('·')}월 ${done ? '· 올해 도장 완료' : on ? '· 지금 읽을 수 있어요' : ''}</small>`); b2.disabled = !on && !done; b2.onclick = () => { GF.sfx('pick'); GF.go('istory', { id: x.id, season: true }); }; });
      const g = el('div', 'dexg', list);
      for (let k = 0; k < B.dexTotal; k++) {
        const s = ST.stories[k]; const got = s && S.sd[s.id]; const b = el('button', 'dexc' + (got ? '' : ' off'), g);
        if (s) { if (got) { b.appendChild(GF.img(s.cuts[0].chars[0])); b.insertAdjacentHTML('beforeend', s.title); } else b.textContent = S.tot >= B.storyThresholds[k] ? '새 사연!' : '???'; b.onclick = () => { if (got) { GF.sfx('pick'); GF.go('istory', { id: s.id }); } else if (S.tot >= B.storyThresholds[k]) { GF.sfx('pick'); GF.go('istory', { id: s.id }); } else GF.sfx('hmm'); }; }
        else b.textContent = '곧 와요';
      }
      const set = el('div', 'panel2', list, '<h4>설정</h4>'); const sb = el('button', 'uk-btn', set); sb.style.cssText += ';position:static;width:100%;background:#7A6F84;margin-bottom:8px';
      const sUp = () => { sb.textContent = '소리 ' + (GF.state.settings.mute ? '꺼짐 → 켜기' : '켜짐 → 끄기'); }; sUp();
      sb.onclick = () => { GF.state.settings.mute = !GF.state.settings.mute; GF.Store.save(); GF.bgm.sync(); sUp(); };
      const rb = el('button', 'uk-btn', set, '처음부터 다시'); rb.style.cssText += ';position:static;width:100%;background:#B04040'; let armed = false;
      rb.onclick = () => { if (!armed) { armed = true; rb.textContent = '정말요? 한 번 더 누르면 지워져요'; setTimeout(() => { armed = false; rb.textContent = '처음부터 다시'; }, 3000); return; } S = fresh(); save(); GF.stack = []; GF.go('itable'); };
      el('p', '', set, '버전 0.1 (MVP 1주차) · 기기 안에만 저장돼요').style.cssText = 'font-size:calc(18px * var(--uk-fs-k, 1));color:#5B4F60;margin-top:8px';
    },
  });

  /* ---------------- 우리 집 (공유 룸 — 게임 안 별도 꾸미기 화면 없음) ---------------- */
  GF.screen('ihouse', {
    bare: false,
    enter(r) {
      r.classList.add('idle', 'uk'); GF.bg('indoor', r); UI.upd = [];
      bar();
      const sc = el('div', 'scroll', r); sc.style.cssText += ';top:70px;bottom:0'; Room.house(sc, { room: 'nemo' });
    },
  });

  /* ---------------- 루프·저장·부팅 ---------------- */
  function tick() {
    if (UI.pause) return;   // 시험용: 가짜 부재 시간을 만든 뒤 정산 전까지 틱을 멈춘다
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
    awayHours(h) { UI.pause = true; S.last -= h * 3600000; save(); },
    buy(id) { const t = Object.keys(B.tables).find((k) => B.tables[k].gens.some((g) => g.id === id) || (B.tables[k].pot && B.tables[k].pot.id === id)); const g = B.tables[t].gens.find((x) => x.id === id) || B.tables[t].pot; const c = genCost(g); if (S.w < c) return false; S.w -= c; S.g[id] = lvl(id) + 1; return true; },
    give(w) { S.w += w; S.tot += w; },
    snap() { return JSON.stringify(S); }, restore(j) { S = Object.assign(fresh(), JSON.parse(j)); S.last = now(); },
    reloadOffline() { save(); const o = offline(); UI.welcome = o; UI.pause = false; return o; },
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
    await GF.boot(Object.assign({ dataNames: ['chars', 'anchors', 'sounds', 'idle_balance', 'idle_stories', 'room_items', 'art_slots'], storeKey: 'gf:idle:ui:v1', async start() {
      await loadCodeChars();
      B = GF.data.idle_balance; ST = GF.data.idle_stories; S = load();
      Room.init({ data: GF.data.room_items, game: 'tables', mode: 'adult', autoPlace: true, store: Room.sharedStore('gf:house:adult:v1'), charSrc: (id) => GF.src(id), slot: (k, id) => GF.slot(k, id), onGrant: (it) => { if (UI.toastOk) { toast('새 소품 · ' + it.name); GF.sfx('star'); } } });
      PR = GF.data.room_items.items.filter((x) => x.set === 'kitchen' && x.cond);
      Object.keys(S.pr || {}).forEach((id) => { if (Room.item(id)) Room.grant(id); });   // 예전 저장(S.pr)을 집으로 옮긴다
      checkProps(); UI.toastOk = true; S.last = S.last || Date.now();
      const o = offline(); if (o && o.gained > 0) UI.welcome = o;
      IDLE.hooks.adAvailable = () => GF.ads.eligible();
      IDLE.hooks.rewardedAd = (placement, cb) => { if (!GF.ads.run({ placement, onReward: () => cb && cb(true) })) cb && cb(false); };
      GF.extras.init({ app: 'idle', kid: false, rewardSet: 'kitchen', stats: () => [['본 사연', Object.keys(S.sd).length + ' / ' + ST.stories.length], ['식탁 단계', ['nemo', 'semo', 'dong'].map((k) => S.tl[k]).join(' · ')], ['의자', S.chairs]],
        badges: [{ id: 's1', icon: '📖', name: '첫 사연', desc: '사연 1편', ok: () => Object.keys(S.sd).length >= 1 }, { id: 's10', icon: '📚', name: '열 편', desc: '사연 10편', ok: () => Object.keys(S.sd).length >= 10 }, { id: 's30', icon: '👑', name: '서른 편', desc: '사연을 모두 봤어요', ok: () => Object.keys(S.sd).length >= ST.stories.length }, { id: 'c2', icon: '🪑', name: '의자가 늘었어요', desc: '의자 2개 이상', ok: () => S.chairs >= 2 }],
        resetTips: () => {}, reset: () => { S = fresh(); save(); } });
      if (!B || !ST) return; GF.go('itable');
      setInterval(tick, 250); document.addEventListener('visibilitychange', () => { if (document.hidden) save(); else { const o2 = offline(); if (o2 && o2.gained > 0 && GF.cur.name === 'itable') { UI.welcome = o2; const e = GF.screens.itable.el; e.innerHTML = ''; GF.screens.itable.enter(e); } else if (o2 && o2.gained > 0) UI.welcome = o2; } });
      window.addEventListener('pagehide', save);
    } }, opts || {}));
  };
})();
