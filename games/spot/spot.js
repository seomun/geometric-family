/* 다른 그림 찾기 — UI. 코어 spot-core.js · 생성기 spot-gen.js · 판 data/spot_levels.json · 사연·시즌 data/spot_extra.json · 집 engine/room · 모든 화면은 ui-kit(UK).
   압박 없음: 시간 제한·하트·실패가 없다. 틀리게 눌러도 횟수만 세고(별에만 영향) 판은 계속된다. 힌트는 언제든. 판 종류 6 + 공통 판 4. */
(function () {
  'use strict';
  const el = UK.el, C = SpotCore, G = SpotGen;
  const SP = (window.SPOT = { debug: {} });
  const KEY = 'gf:spot:v1';
  const REW = { 2: 'a_frame', 5: 'a_photo', 8: 'a_album', 10: 'a_cork', 13: 'a_camera', 15: 'a_film', 18: 'a_polaroid', 20: 'a_shelf', 25: 'a_postcard', 30: 'a_map', 36: 'a_trophy', 42: 'a_medal', 50: 'a_ribbon', 58: 'a_calendar', 66: 'a_scrapbook', 76: 'a_magnifier', 88: 'a_diary', 100: 'a_carp', 110: 'a_wallclock', 120: 'a_garland' };   // 이 판을 처음 깨면 앨범·벽 사진 세트 한 점
  const TYPE_TIP = { diff: '위아래 그림에서 다른 곳을 눌러요', odd: '아홉 개 중 다른 하나를 눌러요', hidden: '그림 속에 숨은 물건을 눌러 찾아요', three: '네모네·세모네 두 장면의 다른 곳을 찾아요', memory: '위 그림을 잘 보고 「다 봤어요」를 눌러요', zoom: '확대해서 작은 다른 곳을 찾아요' };
  const RULE_TXT = [['네모 규칙', '틀린 곳이 많아요. 여러 곳을 느긋하게 찾아요', 'nemo'], ['세모 규칙', '틀린 곳이 크고 색이 확 달라요', 'semo'], ['동그라미 규칙', '틀린 곳이 작아요. 한 곳씩 정확하게', 'dong']];
  const slow = (ms) => (SP.fast ? 0 : ms);
  const uri = (svg) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  /* ---------------- 장식 그림(−25..25 상자) ---------------- */
  const ST = 'stroke="#6b5443" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"';
  const DECO = {
    hut: (e) => { const col = { straw: ['#E8C34A', '#C99A2E'], wood: ['#C98F5A', '#8A5A3B'], brick: ['#D9765B', '#A34B3A'] }[e.v] || ['#E8C34A', '#C99A2E']; return `<rect x="-20" y="-4" width="40" height="28" rx="3" fill="${col[0]}" ${ST}/><path d="M-25 -2L0 -24L25 -2z" fill="${col[1]}" ${ST}/><rect x="-5" y="8" width="10" height="16" rx="2" fill="#FFF3C2" ${ST}/>` + (e.v === 'brick' ? '<path d="M-20 6h40M-20 14h40M-8 -4v10M8 6v8" fill="none" stroke="#6b5443" stroke-width="1.4"/>' : ''); },
    house: () => `<rect x="-24" y="-8" width="48" height="32" rx="3" fill="#FFE9B8" ${ST}/><path d="M-28 -6L0 -26L28 -6z" fill="#E8870F" ${ST}/><rect x="-14" y="2" width="12" height="12" fill="#FFF3A0" ${ST}/><rect x="4" y="8" width="10" height="16" fill="#C98F5A" ${ST}/>`,
    wind: () => `<path d="M-22 -8q14-12 24 0t14 4M-22 4q16-8 28 2" fill="none" stroke="#8FD3F4" stroke-width="4" stroke-linecap="round"/><circle cx="14" cy="-2" r="7" fill="#E6F6FF" ${ST}/><circle cx="12" cy="-4" r="1.2" fill="#4A3030"/><circle cx="16" cy="-4" r="1.2" fill="#4A3030"/>`,
    bridge: () => `<path d="M-60 20q60-70 120 0" fill="none" stroke="#6b5443" stroke-width="12" stroke-linecap="round"/><path d="M-60 20q60-70 120 0" fill="none" stroke="#FFD9A8" stroke-width="7" stroke-linecap="round"/><g fill="#4A3030" stroke="#fff" stroke-width="1.5">${[-40, -14, 14, 40].map((x) => `<ellipse cx="${x}" cy="${-8 - Math.abs(x) * -0.1 - 20 + Math.abs(x) * 0.5}" rx="7" ry="4"/>`).join('')}</g>`,
    beanstalk: () => `<path d="M0 25C-24 10 24 -5 0 -20C-20 -34 18 -42 0 -48" fill="none" stroke="#4A9B5A" stroke-width="7" stroke-linecap="round"/><g fill="#6CCB8A" ${ST}><path d="M-4 14c-20-4-24-16-24-16c18-2 22 8 24 16z"/><path d="M4 -6c20-4 24-14 24-14c-18-2-22 8-24 14z"/><path d="M-4 -26c-18-4-22-14-22-14c16-2 20 6 22 14z"/><path d="M4 -42c16-3 20-12 20-12c-14-2-18 6-20 12z"/></g>`,
    sun: () => `<circle r="12" fill="#FFE27A" ${ST}/><path d="M0 -22v-3M0 22v3M-22 0h-3M22 0h3M-15 -15l-2 -2M15 15l2 2M15 -15l2 -2M-15 15l-2 2" stroke="#E8A800" stroke-width="2.4" stroke-linecap="round"/>`,
    moon: () => `<path d="M8 -20a20 20 0 1 0 8 36a16 16 0 0 1 -8 -36z" fill="#FFE27A" ${ST}/>`,
    cloud: () => `<path d="M-20 8a10 10 0 0 1 4-18a12 12 0 0 1 22-2a9 9 0 0 1 12 20z" fill="#fff" ${ST}/>`,
    star: (e) => `<path d="M0 -20l6 13 14 2-10 10 3 14-13-7-13 7 3-14-10-10 14-2z" fill="${e.c || '#FFD43B'}" ${ST}/>`,
    heart: (e) => `<path d="M0 18C-24 2-14-20 0-8C14-20 24 2 0 18z" fill="${e.c || '#F783AC'}" ${ST}/>`,
    bird: (e) => `<ellipse cx="0" cy="2" rx="14" ry="10" fill="${e.c || '#4DABF7'}" ${ST}/><path d="M-4 -2q-8-14-16-10q8 4 8 12M14 0l8 2l-8 4z" fill="#FFD43B" ${ST}/><circle cx="6" cy="-2" r="1.6" fill="#4A3030"/>`,
    flower: (e) => `<g>${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-10" rx="6" ry="9" fill="${e.c || '#F783AC'}" ${ST} transform="rotate(${a})"/>`).join('')}<circle r="5" fill="#FFE27A" ${ST}/></g>`,
    tree: () => `<rect x="-3" y="4" width="6" height="18" fill="#8A5A3B" ${ST}/><circle cx="0" cy="-8" r="16" fill="#6CCB8A" ${ST}/><circle cx="-6" cy="-10" r="2" fill="#4A9B5A"/>`,
    bush: () => `<path d="M-22 16a12 12 0 0 1 6-22a14 14 0 0 1 28 0a12 12 0 0 1 6 22z" fill="#8EDB9A" ${ST}/>`,
    persimmon: () => `<circle r="12" fill="#FF9F43" ${ST}/><path d="M-6 -12l6 4l6-4" fill="#6CCB8A" ${ST}/>`,
    acorn: () => `<ellipse cx="0" cy="4" rx="10" ry="12" fill="#B98550" ${ST}/><path d="M-12 -2a12 8 0 0 1 24 0z" fill="#8A5A3B" ${ST}/>`,
    key: () => `<circle cx="-8" cy="0" r="7" fill="#FFD43B" ${ST}/><path d="M-1 0h16M10 0v6M15 0v5" fill="none" stroke="#C99A00" stroke-width="3"/>`,
    coin: () => `<circle r="12" fill="#FFD43B" ${ST}/><rect x="-4" y="-4" width="8" height="8" fill="#fff6c8" stroke="#6b5443" stroke-width="2"/>`,
  };
  let bgCache = {}; const bgUri = (n) => bgCache[n] || (bgCache[n] = uri(GF.bgSVG(n)));
  function elSVG(e) {
    const f = e.hue ? `filter:hue-rotate(${e.hue}deg) saturate(1.1)` : '';
    if (e.k === 'chr') { const w = e.h * (GF.aspect(e.id) || C.ASP); return `<image href="${GF.src(e.id)}" x="${(e.x - w / 2).toFixed(1)}" y="${e.y - e.h}" width="${w.toFixed(1)}" height="${e.h}" style="${f}" ${e.flip ? `transform="translate(${2 * e.x} 0) scale(-1 1)"` : ''}/>`; }
    if (e.k === 'item') { const it = Room.item(e.id); if (!it) return ''; return `<image href="${Room.src(it, it.colors[0])}" x="${e.x - e.w / 2}" y="${e.y - e.h}" width="${e.w}" height="${e.h}" style="${f}" preserveAspectRatio="xMidYMax meet" ${e.flip ? `transform="translate(${2 * e.x} 0) scale(-1 1)"` : ''}/>`; }
    if (e.k === 'emo') return `<text x="${e.x}" y="${e.y}" font-size="${(e.s * 0.92).toFixed(1)}" text-anchor="middle" dominant-baseline="central" style="${f}" ${e.flip ? `transform="translate(${2 * e.x} 0) scale(-1 1)"` : ''}>${e.e}</text>`;
    const d = DECO[e.d] || DECO.star; return `<g transform="translate(${e.x} ${e.y}) scale(${(e.s / 50).toFixed(3)})" style="${f}">${d(e)}</g>`;
  }
  const sceneSVG = (R, els) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${R.w} ${R.h}" class="sp-svg"><rect width="${R.w}" height="${R.h}" fill="#CFEFFF"/><svg x="0" y="0" width="${R.w}" height="${R.h}" viewBox="0 392 360 ${R.h > 300 ? 248 : 226}" preserveAspectRatio="none"><image href="${bgUri(R.bg)}" x="0" y="0" width="360" height="640"/></svg>${C.drawOrder(els).map(elSVG).join('')}</svg>`;   // 배경은 아래쪽(언덕·땅)만 잘라 쓴다: 하늘의 큰 장식(나비·해)이 가장자리에 잘려 보이지 않게

  /* ---------------- 저장 ---------------- */
  const blank = () => ({ v: 1, stars: {}, last: 1, daily: { date: '', done: 0 }, shards: 0, seasonDone: {}, trio: {}, tips: {} });
  let SV = (() => { try { const x = JSON.parse(localStorage.getItem(KEY)); if (x && x.v >= 1) return Object.assign(blank(), x); } catch (e) {} return blank(); })();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(SV)); } catch (e) {} };
  const bonusShard = () => { SV.shards++; if (SV.shards % X.shardsPerItem === 0) { const it = X.dailyItems.find((id) => !Room.has(id)); if (it) Room.grant(it); } save(); GF.refreshBar(); };   // 오늘의 한 판 조각 한 번 더(보상형)
  const totalStars = () => Object.values(SV.stars).reduce((a, b) => a + b, 0);
  const unlocked = (n) => n === 1 || SV.stars[n - 1] > 0 || !!SP.unlockAll;
  let D, X;
  const now = () => new Date(), pad = (n) => String(n).padStart(2, '0'), today = () => { const d = now(); return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()); };
  const dayNum = () => { const d = now(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000); };
  GF.home = () => { GF.stack = []; GF.go('phome'); }; GF.home2 = GF.home;
  GF.pill = () => UK.icon('star') + '<span>' + totalStars() + '</span>';
  const bar = () => GF.refreshBar && GF.refreshBar();
  const DAILY = ['diff', 'odd', 'hidden', 'three', 'memory', 'zoom', 'diff'];
  function dailyLevelAt(d, dn) { dn = dn == null ? dayNum() : dn; const L = G.make(8 + (d % 12), d, { type: DAILY[dn % 7], tag: 'growth' }); if (L) { L.id = 'daily'; L.kind = 'daily'; } return L; }
  function dailyLevel() { return dailyLevelAt(+today()); }
  const seasonNow = () => X.seasons.filter((s) => s.months.includes(now().getMonth() + 1) || SP.season === s.id);
  const seasonKey = (s) => s.id + ':' + now().getFullYear();
  function seasonLevel(s) { const L = G.make(s.n, s.seed + now().getFullYear(), { type: s.type, tag: 'growth' }); if (L) { L.id = 'season:' + s.id; L.kind = 'season'; L.season = s; } return L; }
  function trioLevels(n) { return [0, 1, 2].map((rule) => { const L = G.make(n, n * 4093 + 33, { type: 'diff', tag: 'growth', rule }); if (L) { L.id = 'trio:' + n + ':' + rule; L.kind = 'trio'; L.rule = rule; } return L; }); }

  /* ---------------- 홈 ---------------- */
  GF.screen('phome', {
    bare: false,
    enter(r) {
      r.classList.add('uk', 'sp'); GF.bg('indoor2', r); bar();
      const tt = el('div', 'sp-ttl', r, '<div class="uk-title">다른 그림 찾기</div><div class="sp-sub">옛이야기 속 달라진 곳을 찾아요</div>'); const pl = Room.mePlate(tt); if (pl) { tt.querySelector('.sp-sub').style.display = 'none'; pl.style.marginTop = '6px'; }
      GF.hero(r, 'spot'); const fam = el('div', 'sp-fam', r); ['nemo_dad.joy', 'wife.joy', 'dong_dad.joy'].forEach((id) => fam.appendChild(GF.img(id)));
      const last = Math.min(D.levels.length, Math.max(1, SV.last || 1));
      const cont = UK.btn({ text: '이어서 하기 · 레벨 ' + last, icon: 'play', cls: 'block', onclick: () => GF.go('pplay', { n: last }) }, el('div', 'sp-btns', r));
      if (!Object.keys(SV.stars).length) setTimeout(() => { if (cont.isConnected) UK.finger(r, cont); }, 900);
      const g = el('div', 'sp-grid', r), dailyDone = SV.daily.date === today() && SV.daily.done;
      const b = (t, icon, cls, fn, badge) => { const x = UK.btn({ text: t, icon, cls, onclick: fn }, g); if (badge) el('i', 'sp-badge', x, badge); return x; };
      b('레벨', 'shapes', 'sky', () => GF.go('plevels'));
      b('오늘의 한 판', 'gift', 'gold', () => { const L = dailyLevel(); if (L) GF.go('pplay', { level: L }); }, dailyDone ? '✔' : '1');
      b('세 가족 판', 'heart', 'pink', () => GF.go('ptrio'));
      b('우리 집', 'home', 'dong', () => GF.go('phouse'));
      const ss = seasonNow(); if (ss.length) { const s = ss.find((x) => !SV.seasonDone[seasonKey(x)]) || ss[0], done = SV.seasonDone[seasonKey(s)]; UK.btn({ text: s.title, icon: 'star', cls: 'block ' + (done ? 'gray' : 'danger'), onclick: () => { const L = seasonLevel(s); if (L) GF.go('pplay', { level: L }); } }, el('div', 'sp-season', r)); }
      el('div', 'sp-foot', r, '별 ' + totalStars() + ' · 사진 ' + Room.owned().filter((id) => (Room.item(id) || {}).set === 'photo').length + '/' + Object.keys(REW).length);
    },
  });
  GF.screen('plevels', {
    bare: false,
    enter(r) {
      r.classList.add('uk', 'sp'); GF.bg('indoor', r); bar(); const sc = el('div', 'sp-scroll', r); GF.extras.retryBanner(sc, SV.stars, (n) => GF.go('pplay', { n }));
      D.chapters.forEach((name, ci) => {
        const ls = D.levels.filter((l) => l.chapter === ci + 1); if (!ls.length) return; const got = ls.reduce((a, l) => a + (SV.stars[l.id] || 0), 0);
        el('div', 'sp-ch', sc, `<b>${ci + 1}장 · ${name}</b><span>★ ${got}/${ls.length * 3}</span>`); GF.tale.strip(sc, ci + 1, ls.filter((l) => (SV.stars[l.id] || 0) > 0).length, ls.length, !unlocked(ls[0].id)); const g = el('div', 'sp-lv', sc);
        ls.forEach((l) => { const open = unlocked(l.id), st = SV.stars[l.id] || 0, b = el('button', 'sp-l' + (open ? '' : ' off') + (l.tag === 'rest' ? ' rest' : '') + (l.type !== 'diff' ? ' sp2' : ''), g, `<span>${l.id}</span><i>${'★'.repeat(st)}${'☆'.repeat(3 - st)}</i>`); if (l.type !== 'diff') b.title = D.types[l.type]; b.onclick = () => { if (!open) { GF.sfx('hmm'); UK.toast('앞 레벨을 먼저 깨 보세요', r); return; } GF.sfx('pick'); GF.go('pplay', { n: l.id }); }; });
      });
      setTimeout(() => { const last = [...sc.querySelectorAll('.sp-l')].filter((x) => !x.classList.contains('off')).pop(); last && last.scrollIntoView({ block: 'center' }); }, 30);
    },
  });
  GF.screen('ptrio', {
    bare: false,
    enter(r) {
      r.classList.add('uk', 'sp'); GF.bg('indoor2', r); bar(); const n = Math.max(6, Math.min(60, (SV.last || 1) + 4)), Ls = trioLevels(n);
      el('div', 'sp-ttl', r, '<div class="uk-title" style="font-size:30px">세 가족 판</div><div class="sp-sub">같은 그림, 세 가지 규칙</div>').style.top = '84px';
      el('div', 'sp-line', r, '모든 판이 한 가족의 규칙을 따라요. 어느 쪽이 편한가요?').style.top = '172px';
      const box = el('div', 'sp-trio', r); box.style.top = '226px';
      Ls.forEach((L, i) => { const st = SV.trio[n + ':' + i] || 0, b = UK.btn({ text: RULE_TXT[i][0] + (st ? '  ' + '★'.repeat(st) : ''), cls: RULE_TXT[i][2] + ' block', onclick: () => { if (L) GF.go('pplay', { level: L }); } }, box); el('small', '', b, RULE_TXT[i][1]); });
    },
  });

  /* ---------------- 플레이 ---------------- */
  GF.screen('pplay', {
    bare: false,
    enter(r, p) {
      r.classList.add('uk', 'sp'); GF.bg('indoor2', r); bar();
      const LV = p.level || D.levels.find((l) => l.id === p.n) || D.levels[0]; if (!p.level) { SV.last = LV.id; save(); }
      const say = (msg) => { const t = UK.toast(msg, r); t.style.cssText += ';top:146px;left:10px;right:10px;height:40px;display:flex;align-items:center;justify-content:center;padding:0 12px;font-size:calc(18px * var(--uk-fs-k, 1));z-index:30;pointer-events:none'; return t; };
      const title = LV.kind === 'daily' ? '오늘의 한 판' : LV.kind === 'season' ? LV.season.title : LV.kind === 'trio' ? ['네모', '세모', '동그라미'][LV.rule] + ' 규칙 판' : '레벨 ' + LV.id;
      el('div', 'sp-hd', r, `<b>${title}</b><span>${LV.kind || GF.state.settings.big ? '' : D.chapters[LV.chapter - 1]}${LV.tag === 'rest' ? ' · 쉬어 가기' : ''}</span>` + (LV.type !== 'diff' ? `<em class="sp-type">${D.types[LV.type]}</em>` : ''));
      const goals = el('div', 'sp-goals', r), area = el('div', 'sp-area', r), btns = el('div', 'sp-btns2', r), tip = el('div', 'sp-tip', r);
      let ri = 0, found = LV.rounds.map((R) => R.diffs.map(() => false)), wrong = 0, hints = 0, busy = false, phase = LV.type === 'memory' ? 'study' : 'find', zoomed = LV.type === 'zoom', hintIdx = -1, total = 0;
      const R0 = () => LV.rounds[ri], foundN = () => found.flat().filter(Boolean).length;
      const hb = UK.btn({ text: '힌트', icon: 'info', cls: 'sky sm', onclick: hint }, btns), sb = LV.type === 'memory' ? UK.btn({ text: '원본 보기', icon: 'replay', cls: 'ghost sm', onclick: peek }, btns) : LV.type === 'zoom' ? UK.btn({ text: '확대/원래', icon: 'shapes', cls: 'ghost sm', onclick: () => { zoomed = !zoomed; GF.sfx('tap'); draw(); } }, btns) : null; void sb;
      function goalChips() {
        goals.innerHTML = ''; const ch = el('div', 'sp-goal' + (foundN() >= LV.goalN ? ' ok' : ''), goals);
        if (LV.type !== 'hidden') { const dots = el('span', 'sp-dots', ch); for (let i = 0; i < LV.goalN; i++) el('i', i < foundN() ? 'on' : '', dots); }
        el('span', '', ch, LV.type === 'hidden' ? foundN() + '/' + LV.goalN : '남은 곳 ' + (LV.goalN - foundN()));
        if (LV.type === 'odd') el('span', 'uk-chip', goals, '그림 ' + Math.min(ri + 1, LV.rounds.length) + '/' + LV.rounds.length);
        el('div', 'sp-bar', goals, `<i style="width:${Math.round(foundN() / LV.goalN * 100)}%"></i>`);
      }
      function mark(R, i, fl) { const d = R.diffs[i]; return `<circle cx="${d.x + d.w / 2}" cy="${d.y + d.h / 2}" r="${Math.max(d.w, d.h) / 2 + 5}" fill="none" stroke="${fl ? '#FF4D6D' : '#FF8FA8'}" stroke-width="4" class="${fl ? 'sp-pulse' : 'sp-ring'}"/>`; }
      function pic(R, els, label, covered) {
        const w = el('div', 'sp-pic' + (zoomed ? ' z' : '') + (covered ? ' cover' : ''), area), z = zoomed ? 1.8 : 1;
        w.style.cssText += `;width:${R.w * z}px;height:${R.h * z}px`; w.innerHTML = sceneSVG(R, els); const s = w.querySelector('svg'); s.style.width = '100%'; s.style.height = '100%';
        if (label) el('em', 'sp-lab', w, label);
        const ov = `<svg viewBox="0 0 ${R.w} ${R.h}" class="sp-ov">${R.diffs.map((d, i) => (found[ri][i] ? mark(R, i, false) : hintIdx === i ? mark(R, i, true) : '')).join('')}</svg>`; w.insertAdjacentHTML('beforeend', ov);
        if (covered) { const c = el('div', 'sp-cov', w, covered); void c; }
        w.addEventListener(zoomed ? 'click' : 'pointerdown', (e) => { if (busy || covered) return; if (!zoomed) e.preventDefault(); const rc = w.getBoundingClientRect(); tapAt((e.clientX - rc.left) / rc.width * R.w, (e.clientY - rc.top) / rc.height * R.h, e); });
        return w;
      }
      function draw() {
        const R = R0(); area.innerHTML = ''; area.className = 'sp-area ' + LV.type + (zoomed ? ' zoom' : ''); goalChips();
        if (LV.type === 'odd') pic(R, R.B, null, null);
        else if (LV.type === 'hidden') { pic(R, R.B, null, null); const names = el('div', 'sp-names', area); LV.targets.forEach((nm, i) => { const c = el('b', found[0][i] ? 'on' : '', names); c.innerHTML = `<svg viewBox="-26 -26 52 52" width="22" height="22">${(DECO[LV.targetIcons[i]] || DECO.star)({ c: '#C98F5A' })}</svg><span>${nm}</span>`; }); }
        else if (LV.type === 'memory') {
          if (phase === 'study') { pic(R, R.A, '원본', null); const w = pic(R, R.B, null, '<div class="sp-covtxt">위 그림을 잘 보고<br>준비되면 눌러요</div>'); const b = UK.btn({ text: '다 봤어요', icon: 'play', cls: 'block', onclick: () => { phase = 'find'; GF.sfx('pick'); draw(); } }, w.querySelector('.sp-cov')); b.style.marginTop = '8px'; }
          else { pic(R, R.A, null, '<div class="sp-covtxt">원본은 가렸어요</div>'); pic(R, R.B, null, null); }
        } else { pic(R, R.A, LV.type === 'three' ? '네모네' : null, null); pic(R, R.B, LV.type === 'three' ? '세모네' : null, null); }
        hb.style.opacity = phase === 'find' ? 1 : 0.4;
      }
      function peek() { if (LV.type !== 'memory' || phase !== 'find') return; const old = area.firstChild; if (!old) return; const w = pic(R0(), R0().A, '원본(잠깐)', null); area.insertBefore(w, old); old.remove(); GF.sfx('tap'); setTimeout(() => { if (area.isConnected) draw(); }, slow(1800)); }
      function tapAt(x, y, ev) {
        if (phase !== 'find') return; const R = R0(), i = C.hit(R, found[ri], x, y, LV.type === 'zoom' ? 10 : 14);
        if (i < 0) { wrong++; GF.sfx('hmm'); const rc = area.getBoundingClientRect(); void rc; const m = el('div', 'sp-x', r, '✕'); const sr = r.getBoundingClientRect(), k = sr.width / 360; m.style.left = (ev.clientX - sr.left) / k - 12 + 'px'; m.style.top = (ev.clientY - sr.top) / k - 14 + 'px'; setTimeout(() => m.remove(), 600); return; }
        found[ri][i] = true; hintIdx = -1; total = foundN(); GF.sfx('ok', { st: [0, 2, 4, 7, 9, 12, 14, 16][Math.min(total - 1, 7)] }); draw();
        try { const sr = r.getBoundingClientRect(), k = sr.width / 360; GF.burst(document.getElementById('safe'), (ev.clientX - sr.left) / k, (ev.clientY - sr.top) / k, 8); } catch (e) {}
        if (found[ri].every(Boolean)) { busy = true; if (ri < LV.rounds.length - 1) { setTimeout(() => { ri++; busy = false; draw(); }, slow(700)); } else setTimeout(finish, slow(700)); }
      }
      function hint() {
        if (busy || phase !== 'find') return; const R = R0(), i = found[ri].findIndex((f) => !f); if (i < 0) return; hints++; hintIdx = i; GF.sfx('pick'); draw(); setTimeout(() => { if (hintIdx === i) { hintIdx = -1; if (area.isConnected) draw(); } }, slow(3000));
      }
      function result(stars) {
        if (rankRes && GF.rank) { GF.rank.resultBoard = 'daily'; const rr = rankRes; rankRes = null; setTimeout(() => GF.rank.announce(rr, r), slow(1300)); }
        if (!LV.kind && hints > 0 && stars < 3 && GF.ads) GF.ads.resultHook = { placement: 'hint2', ask: '힌트 쓴 것 지우기', sub: '별을 다시 세어요', onReward: () => { const st2 = C.stars(0, wrong); if (st2 > (SV.stars[LV.id] || 0)) { SV.stars[LV.id] = st2; save(); GF.refreshBar(); } } };
        if (LV.kind === 'daily' && GF.ads) GF.ads.resultHook = { placement: 'daily2x', ask: '오늘의 조각 한 번 더', onReward: bonusShard };
        const chips = [{ icon: 'star', text: '★ ' + stars }, { icon: 'info', text: '힌트 ' + hints }, { icon: 'gift', text: '틀린 탭 ' + wrong }]; gained.forEach((id) => chips.push({ icon: 'home', text: (Room.item(id) || {}).name || id }));
        const next = !LV.kind && D.levels.find((l) => l.id === LV.id + 1);
        UK.result({ title: '클리어!', stars, chips, parent: r, onNext: next ? () => GF.replace('pplay', { n: next.id }) : null, nextText: '다음 레벨', onRetry: () => GF.replace('pplay', LV.kind ? { level: LV } : { n: LV.id }), retryText: '다시', onHome: () => GF.home2(), homeText: '처음으로' });
      }
      const gained = []; let rankRes = null;
      function finish() {
        busy = true; const st = C.stars(hints, wrong);
        if (LV.kind === 'daily' && GF.rank && GF.rank.ready) rankRes = GF.rank.record('daily', GF.rank.eff({ par: LV.goalN, actions: LV.goalN + wrong, tools: hints, attempts: 1 }));
        if (!LV.kind) { SV.stars[LV.id] = Math.max(SV.stars[LV.id] || 0, st); if (REW[LV.id] && Room.grant(REW[LV.id])) gained.push(REW[LV.id]); }
        else if (LV.kind === 'daily') { if (SV.daily.date !== today() || !SV.daily.done) { SV.daily = { date: today(), done: 1 }; SV.shards++; if (SV.shards % X.shardsPerItem === 0) { const it = X.dailyItems.find((id) => !Room.has(id)); if (it && Room.grant(it)) gained.push(it); } } }
        else if (LV.kind === 'season') { if (!SV.seasonDone[seasonKey(LV.season)]) { SV.seasonDone[seasonKey(LV.season)] = 1; if (LV.season.reward && Room.grant(LV.season.reward)) gained.push(LV.season.reward); } }
        else if (LV.kind === 'trio') { const key = LV.id.split(':').slice(1).join(':'); SV.trio[key] = Math.max(SV.trio[key] || 0, st); }
        save(); GF.refreshBar(); GF.extras && GF.extras.check(); GF.ads && GF.ads.noteLevelDone(); GF.sfx('star');
        setTimeout(() => {
          GF.tale.done(r, LV, () => result(st));   // 클리어 한마디 · 승전결 컷(장 끝이면 결, 마지막 장이면 엔딩)
        }, slow(650));
      }
      SP.debug.adOffer = () => { hints = Math.max(hints, 2); result(1); }; SP.debug.level = () => LV; SP.debug.tap = (x, y) => { const R = R0(), fake = { clientX: 180, clientY: 300 }; tapAt(x, y, fake); }; SP.debug.round = () => ri; SP.debug.state = () => ({ ri, found, wrong, hints, phase, zoomed }); SP.debug.hint = hint; SP.debug.busy = () => busy; SP.debug.seen = () => { phase = 'find'; draw(); };
      draw();
      const t0 = TYPE_TIP[LV.type]; if (LV.id <= 2 && !LV.kind) { tip.style.display = 'block'; tip.textContent = LV.id === 1 ? '위아래 그림에서 다른 곳을 눌러요' : '못 찾겠으면 힌트를 눌러요'; } else if (t0 && !SV.tips[LV.type]) { tip.style.display = 'block'; tip.textContent = t0; SV.tips[LV.type] = 1; save(); } else tip.style.display = 'none';
      if (tip.style.display === 'block') setTimeout(() => { tip.style.display = 'none'; }, slow(3600));
      GF.tale.level(r, LV);
      if (LV.id <= 2 && !LV.kind) setTimeout(() => { const pics = area.querySelectorAll('.sp-pic'), d = R0().diffs[0], w = pics[pics.length - 1]; if (w && w.isConnected && !foundN()) { const fake = el('i', 'sp-anchor', w); fake.style.cssText = `position:absolute;left:${(d.x + d.w / 2) / R0().w * 100}%;top:${(d.y + d.h / 2) / R0().h * 100}%;width:2px;height:2px`; UK.finger(r, fake, { tap: true, ms: 6000 }); setTimeout(() => fake.remove(), 6200); } }, slow(1400));   // 처음 두 판: 틀린 곳 하나를 손가락이 알려 준다
    },
  });
  GF.screen('phouse', {
    bare: false,
    enter(r) { r.classList.add('uk', 'sp'); GF.bg('indoor', r); bar(); const sc = el('div', 'sp-scroll', r); sc.style.top = '70px'; Room.house(sc, { room: 'nemo' }); },
  });
  SP.start = async function (opts) {
    UK.mode('adult');
    await GF.boot(Object.assign({ dataNames: ['chars', 'anchors', 'sounds', 'spot_levels', 'spot_extra', 'story_spot', 'maps/spot', 'room_items', 'art_slots'], storeKey: 'gf:spot:ui:v1', async start() {
      D = GF.data.spot_levels; X = GF.data.spot_extra; GF.saga.init('spot', GF.data['maps/spot']); GF.tale.init('spot', GF.data.story_spot, { kid: false });
      Room.init({ data: GF.data.room_items, game: 'spot', mode: 'adult', autoPlace: true, store: Room.sharedStore('gf:house:adult:v1'), charSrc: (id) => GF.src(id), slot: (k, id) => GF.slot(k, id) });
      GF.rank.init({ app: 'spot', boards: { daily: { title: '오늘의 한 판', levelAt: (d, dn) => dailyLevelAt(d, dn), bot: (L, fam, rng, eps) => {   // 틀린 그림은 칸 상태가 없는 퍼즐이라 가족 맛으로 만든 모델(틀린 탭·힌트 수)
          let wrong, hints; if (fam === 0) { wrong = 1 + ((rng() * 4) | 0); hints = rng() < 0.4 ? 1 : 0; } else if (fam === 1) { if (eps < 0.2) { wrong = (rng() * 2) | 0; hints = 0; } else { wrong = 5 + ((rng() * 6) | 0); hints = 1 + ((rng() * 3) | 0); } } else { wrong = (rng() * 3) | 0; hints = 0; }
          return { won: true, score: GF.rank.eff({ par: L.goalN, actions: L.goalN + wrong, tools: hints, attempts: 1 }) }; } } } });
      GF.extras.init(Object.assign({ app: 'spot', kid: false, rewardSet: 'photo', resetTips: () => { SV.tips = {}; SV.intro = 0; save(); }, reset: () => { SV = blank(); save(); } }, GF.extras.levelApp({ SV: () => SV, total: 140, roomSet: 'photo', itemTotal: 20, icon: '🔍' })));
      document.getElementById('safe').classList.add('uk'); GF.go('phome');
      SP.debug.D = () => D; SP.debug.SV = () => SV; SP.debug.reset = () => { SV = blank(); save(); }; SP.debug.dailyLevel = dailyLevel; SP.debug.seasonLevel = seasonLevel; SP.debug.trioLevels = trioLevels; SP.debug.X = () => X; SP.debug.REW = REW;
    } }, opts || {}));
  };
})();
