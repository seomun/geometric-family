/* ⑪ 기하학 원정대 — S0 슬라이스(20분): 1나라(아기돼지) 앞부분 · 자동 전투(결정론 코어 battle-core.js) · 편성·레벨업 · 뽑기 UI·확률 공개 화면 · 이야기 합류 1회 · 포섭 1회.
   서버 없음·결제 없음(무상 반짝석만). 저장 gfx:slice:v1 (다른 앱과 키를 섞지 않는다). 12+ 앱: 글자 있음. 모든 글 [제안]. 설계: games/25_EXPEDITION_GDD1.md · games/27_EXPEDITION_SERVER.md */
(function () {
  'use strict';
  const el = UK.el, B = ExpBattle, SC = ExpStage, REL = !!window.GF_RELEASE;      // REL: 출시 빌드(앱) — 개발·슬라이스 안내 문구를 숨긴다
  const EXP = (window.EXP = { debug: {} });
  const KEY = 'gfx:slice:v1';
  let D, S, UD = {};
  const $ = (id) => UD[id];
  /* ---------------- 저장 ---------------- */
  const fresh = () => ({ v: 1, gems: D.gacha.startGems, gold: 0, units: Object.fromEntries(D.units.filter((u) => u.route === 'start').map((u) => [u.id, { lv: 1 }])), dups: {}, party: D.units.filter((u) => u.route === 'start').map((u) => u.id), cleared: 0, stars: {}, pity: { since5: 0, since4: 0, guard: 0 }, flags: {}, speed: 1, autoSkill: true, pulls: 0, seed: 0, idleTs: 0, dun: null });
  const load = () => { try { const x = JSON.parse(localStorage.getItem(KEY)); if (x && x.v === 1) return Object.assign(fresh(), x); } catch (e) { /* 저장 없음 */ } return fresh(); };
  const save = () => { try { if (!REMOTE) localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* 용량·차단 */ } };
  const bar = () => GF.refreshBar && GF.refreshBar();

  /* ---------------- 서버 연결(S1 WP2~3): ?api=http://127.0.0.1:8788 — 없으면 S0 로컬 그대로 ---------------- */
  const API = (new URLSearchParams(location.search)).get('api') || window.GF_API || '', REMOTE = !!API, AUTHK = 'gfx:slice:auth', uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'r' + Date.now() + Math.random().toString(36).slice(2));
  let AUTH = null, AGE_DONE = null; try { AUTH = JSON.parse(localStorage.getItem(AUTHK)); } catch (e) { AUTH = null; }
  const setAuth = (a) => { AUTH = a; try { if (a) localStorage.setItem(AUTHK, JSON.stringify(a)); else localStorage.removeItem(AUTHK); } catch (e) { /* 저장 불가 */ } };
  async function http(method, path, body, noRetry) {
    const h = { 'content-type': 'application/json' }; if (AUTH && AUTH.access) h.authorization = 'Bearer ' + AUTH.access;
    const r = await fetch(API + path, { method, headers: h, body: body ? JSON.stringify(body) : undefined }), j = await r.json().catch(() => ({}));
    if (r.status === 401 && !noRetry && AUTH && AUTH.refresh) { const rr = await fetch(API + '/auth/refresh', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ refresh: AUTH.refresh }) }); if (rr.ok) { const t = await rr.json(); setAuth(Object.assign({}, AUTH, { access: t.access, refresh: t.refresh })); return http(method, path, body, true); } setAuth(null); }
    if (!r.ok) { const e = new Error(j.error || 'http_' + r.status); e.status = r.status; e.code = j.error; e.msg = j.msg; throw e; } return j;
  }
  function applyProfile(p) {
    S.gems = p.wallet.free_gems + p.wallet.paid_gems; S.gold = p.wallet.gold; S.units = {}; Object.keys(p.units).forEach((id) => { S.units[id] = { lv: p.units[id].lv, skl: p.units[id].skl, awk: p.units[id].awk, promo: p.units[id].promo, gear: p.units[id].gear }; S.dups[id] = p.units[id].dups; }); S.party = p.progress.party; S.pity = { since5: p.pity.since5, since4: p.pity.since4, guard: p.pity.guard ? 1 : 0 }; S.pulls = p.pity.pulls; S.cap = p.cap_krw; S.band = p.age_band; S.guardian = p.guardian_notice;
    S.cleared = p.progress.cleared; S.stars = p.progress.stars; S.flags = p.progress.flags;   // 진행도의 진실은 서버(WP4)
  }
  async function remoteBoot() {
    if (AUTH) { try { applyProfile(await http('GET', '/profile')); return; } catch (e) { setAuth(null); } }
    await new Promise((res) => { AGE_DONE = res; GF.go('xage'); }); applyProfile(await http('GET', '/profile'));
  }
  GF.screen('xage', {
    bare: true,
    enter(r) {
      r.classList.add('uk', 'ex'); GF.bg('field', r); const w = el('div', 'ex-age', r); el('div', 'uk-title', w, '기하학 원정대'); el('p', '', w, '처음이에요. 태어난 해와 달을 알려 주세요. 만 12세 이상만 이용할 수 있어요.');
      const y = el('select', 'ex-sel', w), m = el('select', 'ex-sel', w), now = new Date().getFullYear(); for (let k = now; k >= now - 90; k--) y.appendChild(new Option(k + '년', k)); for (let k = 1; k <= 12; k++) m.appendChild(new Option(k + '월', k)); y.value = now - 25;
      const msg = el('p', 'ex-agemsg', w);
      const go = UK.btn({ text: '시작하기', icon: 'play', cls: 'green block', onclick: async () => {
        go.disabled = true;
        try {
          const t = await (await fetch(API + '/auth/anon', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ device_hash: uid(), birth_ym: y.value + '-' + String(m.value).padStart(2, '0') }) })).json();
          if (t.error) { msg.textContent = t.error === 'age_blocked' ? '만 12세 미만은 이용할 수 없어요.' : '입력을 확인해 주세요.'; go.disabled = false; return; }
          setAuth({ account: t.account, access: t.access, refresh: t.refresh });
          if (t.guardian_notice) UK.modal({ parent: r, title: '안내', body: t.payments_blocked ? '만 14세 미만은 보호자 동의 전까지 결제를 이용할 수 없어요. 광고는 맞춤 없이 보여요.' : '만 19세 미만은 한 달 결제 한도가 7만 원이에요. 보호자와 함께 이용해 주세요.', actions: [{ text: '알겠어요', cls: 'green', onclick: () => { AGE_DONE && AGE_DONE(); } }] }); else AGE_DONE && AGE_DONE();
        } catch (e) { msg.textContent = '서버에 연결하지 못했어요.'; go.disabled = false; }
      } }, w);
    },
  });
  const levelUp = async (id, c) => {      // 로컬: 금화 차감 · 서버: /unit/levelup
    if (!REMOTE) { S.gold -= c; S.units[id].lv++; save(); bar(); return true; }
    try { const r = await http('POST', '/unit/levelup', { unit: id, request_id: uid() }); S.gold = r.wallet.gold; S.units[id].lv = r.unit.lv; bar(); return true; } catch (e) { UK.toast(e.code === 'insufficient_gold' ? '금화가 모자라요' : '서버 응답이 없어요', document.getElementById('safe')); return false; }
  };
  const partySync = () => { if (REMOTE) http('POST', '/party', { party: S.party }).catch(() => { UK.toast('편성을 저장하지 못했어요', document.getElementById('safe')); }); };
  const stageStartRemote = (stage) => http('POST', '/stage/start', { stage });
  const stageClearRemote = (srv, inputs, auto) => http('POST', '/stage/clear', { token: srv.token, inputs, auto, request_id: uid() });
  const GC_FRAG = (g) => (g === 5 ? 20 : g === 4 ? 5 : 1);
  async function pullRemote(n) { const r = await http('POST', '/gacha/pull', { n, request_id: uid() }); S.gems = r.wallet.free_gems + r.wallet.paid_gems; S.pity = { since5: r.pity.since5, since4: r.pity.since4, guard: r.pity.guard ? 1 : 0 }; S.pulls = r.pity.pulls; const res = r.results.map((x) => ({ id: x.unit, grade: x.grade, isNew: x.isNew })); res.forEach((x) => { if (x.isNew) S.units[x.id] = { lv: 1 }; else S.dups[x.id] = (S.dups[x.id] || 0) + GC_FRAG(x.grade); }); bar(); return res; }
  /* ---------------- 육성 깊이(B2): 스킬 레벨 · 각성 · 등급 승급 · 장비 4칸 ---------------- */
  const stOf = (id) => SC.stOf(S.units[id] || { lv: 1 });
  async function growUp(id, kind, slot) {
    const st = S.units[id], res = SC.upgrade(D, id, st, kind, slot, { gold: S.gold, dups: S.dups[id] || 0 });
    if (res.error) { UK.toast(res.error === 'insufficient_gold' ? '금화가 모자라요' : res.error === 'insufficient_dups' ? '조각이 모자라요 (같은 친구가 또 나오면 모여요)' : res.error === 'need_level' ? '레벨 ' + res.need + ' 이상이어야 해요' : '더 올릴 수 없어요', document.getElementById('safe')); return false; }
    if (!REMOTE) { Object.assign(st, res.st); S.gold -= res.gold; S.dups[id] = (S.dups[id] || 0) - res.dups; save(); bar(); return true; }
    try { const r = await http('POST', '/unit/upgrade', { unit: id, kind, slot, request_id: uid() }); Object.assign(st, { lv: r.unit.lv, skl: r.unit.skl, awk: r.unit.awk, promo: r.unit.promo, gear: r.unit.gear }); S.dups[id] = r.unit.dups; S.gold = r.wallet.gold; bar(); return true; }
    catch (e) { UK.toast(e.code === 'insufficient_gold' ? '금화가 모자라요' : e.code === 'insufficient_dups' ? '조각이 모자라요' : '서버에 연결하지 못했어요', document.getElementById('safe')); return false; }
  }
  function growSheet(r, id, after) {
    if (tipOnce('grow', r, () => growSheet(r, id, after))) return;
    const u = $(id), G = D.bal.grow, sc = UK.modal({ parent: r, title: u.name + ' 키우기', body: '', actions: [] }), sh = sc.querySelector('.uk-sheet'); sh.classList.add('ex-grow');
    const rd = () => {
      sh.querySelectorAll('.ex-grow-c').forEach((e) => e.remove()); const box = el('div', 'ex-grow-c', sh), st = stOf(id), have = { gold: S.gold, dups: S.dups[id] || 0 }, gr = SC.gradeOf(D, id, st);
      el('p', 'ex-gnote', box, `${'★'.repeat(gr)} Lv ${st.lv} · 전투력 ${Math.round(kOf(id) * 100)} · 🪙 ${S.gold} · 조각 ${have.dups}`);
      const row = (title, sub, kind, slot) => {
        const res = SC.upgrade(D, id, st, kind, slot, have), c = el('div', 'ex-grow-r', box); el('span', '', c, `<b>${title}</b><small>${sub}</small>`);
        const txt = res.error === 'max' ? '최대' : res.error === 'need_level' ? 'Lv ' + res.need + '↑' : kind === 'skill' || kind === 'gear' ? '🪙 ' + (SC.upgrade(D, id, st, kind, slot, { gold: 1e9, dups: 1e9 }).gold) : '조각 ' + (SC.upgrade(D, id, st, kind, slot, { gold: 1e9, dups: 1e9 }).dups || '-');
        UK.btn({ text: txt, cls: (!res.error ? 'gold' : 'ghost') + ' sm', onclick: async () => { if (res.error === 'max') return; if (await growUp(id, kind, slot)) { GF.sfx('star'); rd(); after && after(); } } }, c);
      };
      row('스킬 Lv ' + st.skl + '/' + G.skillMax, `${D.role[u.role].skill} 효과 +${Math.round(G.skillMul * 100)}%씩` + (u.role === 'support' ? ' · Lv3·5 응원 한 턴 더' : ''), 'skill');
      row('각성 ' + '◆'.repeat(st.awk) + '◇'.repeat(G.awkMax - st.awk), `능력 +${Math.round(G.awkMul * 100)}%씩 · 같은 친구의 조각으로`, 'awaken');
      row('승급 ' + '★'.repeat(gr) + (gr < 5 ? ' → ' + '★'.repeat(gr + 1) : ''), `능력치 등급이 올라요 · Lv ${G.promoLv} 이상`, 'promote');
      G.gearSlots.forEach((nm, i) => row(`${nm} +${st.gear[i]}/${G.gearMax}`, `능력 +${(G.gearMul * 100).toFixed(1)}%씩`, 'gear', i));
    };
    rd(); UK.btn({ text: '닫기', cls: 'ghost', onclick: () => sc.remove() }, el('div', 'acts', sh));
  }
  /* ---------------- 계산 ---------------- */
  const kOf = (id) => SC.kOf(D, id, S.units[id] || { lv: 1 });   // 서버 재현(stage-core.js)과 같은 식
  const cost = (L) => Math.round(D.bal.costBase * Math.pow(D.bal.costGrow, L - 1));
  const defOf = (id, i, st) => SC.defOf(D, id, st || S.units[id] || { lv: 1 }, i);
  const enemyDef = SC.enemyDef;
  const power = (ids) => Math.round(ids.reduce((s, id) => s + kOf(id), 0) / Math.max(1, ids.length) * 100);
  const elIcon = (e) => `<i class="ex-el ${e}" title="${D.el[e].name}">${D.el[e].icon}</i>`;
  const art = (u, cls) => { const d = el('div', 'ex-art ' + (cls || '')); if (u.art) { const im = GF.img(u.art); d.appendChild(im); } else d.textContent = u.emoji || '❔'; return d; };
  const beats = (a, b) => B.BEATS[a] === b;
  /* ---------------- 뽑기 ---------------- */
  const G = () => D.gacha;
  const pullOnce = (rng) => ExpGacha.pullOnce(G(), D.units, S.pity, rng);   // 서버와 같은 코어(gacha-core.js)
  function pull(n, rng) {
    const price = n === 10 ? G().ten : G().cost * n; if (S.gems < price) return null; S.gems -= price; const res = [];
    for (let i = 0; i < n; i++) { const r = pullOnce(rng); S.pulls++; r.isNew = !S.units[r.id]; if (r.isNew) S.units[r.id] = { lv: 1 }; else S.dups[r.id] = (S.dups[r.id] || 0) + (r.grade === 5 ? 20 : r.grade === 4 ? 5 : 1); res.push(r); }
    save(); bar(); return res;
  }
  let _rng = null; const rng = () => (_rng || (_rng = B.mulberry((S.seed || (Date.now() & 0xffffff)) + S.pulls * 7919)))();
  /* ---------------- 이야기 컷(미니 판: 상성 3각) ---------------- */
  GF.tale.mini.reg('expedition', (host, s, still) => {
    const k = (s && s.k) || 'triangle';
    if (k !== 'triangle') {      // 튜토리얼 컷의 그림: 말한 것을 보여 준다(주머니·달력·도감·키우기)
      const w = el('div', 'ex-mini-ic', host), day = SC.dayKst(Date.now()), SV = {
        pouch: '<svg viewBox="0 0 200 170"><path d="M60 70 Q100 40 140 70 Q165 100 150 140 Q100 165 50 140 Q35 100 60 70Z" fill="#C98B4B" stroke="#8A5A2B" stroke-width="4"/><path d="M75 62 L125 62 L118 48 L82 48Z" fill="#E0B070" stroke="#8A5A2B" stroke-width="3"/><polygon points="100,84 122,106 100,134 78,106" fill="#6BC4FF" stroke="#fff" stroke-width="3"/><polygon points="100,84 108,106 100,134 92,106" fill="#A8E2FF"/><text class="sp" x="150" y="52" font-size="30" opacity="0">✨</text><text class="sp" x="30" y="62" font-size="24" opacity="0">✨</text><text class="sp" x="158" y="120" font-size="22" opacity="0">✨</text></svg>',
        calendar: '<svg viewBox="0 0 200 170"><rect x="14" y="20" width="172" height="130" rx="14" fill="#fff" stroke="#8A5A2B" stroke-width="4"/><rect x="14" y="20" width="172" height="32" rx="14" fill="#E5334A"/><text x="100" y="43" font-size="18" fill="#fff" font-weight="900" text-anchor="middle" font-family="sans-serif">요일 던전</text>' + ['월', '화', '수', '목', '금', '토', '일'].map((d, i) => `<rect x="${22 + i * 23}" y="66" width="20" height="30" rx="5" fill="${i === day ? '#FFC933' : '#f4ecd8'}" stroke="${i === day ? '#E0A800' : '#d9c9a8'}" stroke-width="2"/><text x="${32 + i * 23}" y="87" font-size="13" text-anchor="middle" font-weight="900" fill="#6b4a00" font-family="sans-serif">${d}</text>`).join('') + '<text x="100" y="128" font-size="15" text-anchor="middle" fill="#6b4a00" font-weight="800" font-family="sans-serif">오늘은 이 칸!</text><text class="sp" x="150" y="70" font-size="26" opacity="0">✨</text></svg>',
        book: '<svg viewBox="0 0 200 170"><path d="M100 40 Q60 28 18 40 L18 140 Q60 128 100 140Z" fill="#fff8e6" stroke="#8A5A2B" stroke-width="4"/><path d="M100 40 Q140 28 182 40 L182 140 Q140 128 100 140Z" fill="#fff8e6" stroke="#8A5A2B" stroke-width="4"/><circle cx="58" cy="84" r="20" fill="#F08A3C"/><circle cx="142" cy="84" r="20" fill="#3B6FD6"/><circle cx="58" cy="84" r="20" fill="none"/><text x="58" y="92" font-size="22" text-anchor="middle" fill="#fff" font-family="sans-serif">◻</text><text x="142" y="92" font-size="22" text-anchor="middle" fill="#fff" font-family="sans-serif">◯</text><text x="58" y="124" font-size="14" text-anchor="middle" font-family="sans-serif">★★★</text><text x="142" y="124" font-size="14" text-anchor="middle" font-family="sans-serif">★★★</text><text class="sp" x="100" y="30" font-size="28" text-anchor="middle" opacity="0">✨</text></svg>',
        anvil: '<svg viewBox="0 0 200 170"><rect x="44" y="108" width="112" height="22" rx="6" fill="#6b6f80"/><path d="M60 108 L70 78 L146 78 L156 108Z" fill="#8a8fa3"/><text x="100" y="72" font-size="44" text-anchor="middle">⚔️</text><path d="M168 96 L168 50 M156 62 L168 46 L180 62" fill="none" stroke="#2c9a56" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/><text x="34" y="60" font-size="20" font-weight="900" fill="#2c9a56" font-family="sans-serif">Lv↑</text><text class="sp" x="150" y="40" font-size="26" opacity="0">✨</text></svg>' };
      const build = () => { w.innerHTML = SV[k] || SV.pouch; }; GF.tale.mini.loop(host, build, [[500, () => { w.querySelectorAll('.sp').forEach((e, i) => setTimeout(() => { e.style.opacity = 1; }, i * 250)); }]], still); return;
    }
    const w = el('div', 'ex-tri', host); let arr = [];
    const build = () => { w.innerHTML = '<svg viewBox="0 0 220 170" width="260" height="190"><g font-family="sans-serif" font-weight="900" text-anchor="middle"><circle cx="110" cy="28" r="24" fill="#E5334A"/><text x="110" y="38" font-size="28" fill="#fff">△</text><circle cx="38" cy="132" r="24" fill="#F08A3C"/><text x="38" y="143" font-size="28" fill="#fff">◻</text><circle cx="182" cy="132" r="24" fill="#3B6FD6"/><text x="182" y="143" font-size="28" fill="#fff">◯</text></g><path class="a0" d="M96 50L52 108" stroke="#E5334A" stroke-width="5" fill="none" marker-end="url(#ar)" opacity=".15"/><path class="a1" d="M64 132H156" stroke="#F08A3C" stroke-width="5" fill="none" marker-end="url(#ar)" opacity=".15"/><path class="a2" d="M170 108L126 50" stroke="#3B6FD6" stroke-width="5" fill="none" marker-end="url(#ar)" opacity=".15"/><defs><marker id="ar" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto"><path d="M0 0L8 4L0 8z" fill="#4A3030"/></marker></defs></svg><div class="ex-trit"><b>번쩍 → 받치기 → 돌보기 → 번쩍</b></div>'; arr = [0, 1, 2].map((i) => w.querySelector('.a' + i)); };
    GF.tale.mini.loop(host, build, [[500, () => { arr[0].style.opacity = 1; }], [650, () => { arr[1].style.opacity = 1; }], [650, () => { arr[2].style.opacity = 1; }]], still);
  });
  /* ---------------- 공통 화면 도우미 ---------------- */
  GF.pill = () => `<span class="ex-pill">💎 ${S ? S.gems : 0} · 🪙 ${S ? S.gold : 0}</span>`;
  GF.home = () => { GF.stack = []; GF.go('xhome'); };
  const back = (r, to) => { const b = UK.btn({ text: '돌아가기', cls: 'ghost sm ex-back', onclick: () => GF.go(to || 'xhome') }, r); return b; };
  const head = (r, t, sub) => { const h = el('div', 'ex-head', r); el('div', 'uk-title', h, t); if (sub) el('div', 'ex-sub', h, sub); return h; };
  /* ---------------- 홈 ---------------- */
  GF.screen('xhome', {
    bare: false,
    enter(r) {
      r.classList.add('uk', 'ex'); GF.bg('field', r); bar(); head(r, '기하학 원정대', '세 가족 도형 영웅과 옛이야기 나라를 걷는 RPG' + (REL ? '' : ' · 슬라이스'));
      const fam = el('div', 'ex-fam', r); S.party.slice(0, 3).forEach((id) => fam.appendChild(art($(id), 'xl')));
      const next = Math.min(S.cleared + 1, D.stages.length), st = D.stages[next - 1], done = S.cleared >= D.stages.length;
      const btns = el('div', 'ex-btns', r);
      UK.btn({ text: done ? '원정 길 다시 걷기' : '원정 · ' + next + '. ' + st.name, icon: 'play', cls: 'block', onclick: () => GF.go('xmap') }, btns);
      const row = el('div', 'ex-row', btns);
      UK.btn({ text: '편성·육성', icon: 'heart', cls: 'sky', onclick: () => GF.go('xparty') }, row); UK.btn({ text: '동료 모집', icon: 'gift', cls: 'gold', onclick: () => GF.go('xgacha') }, row);
      if (!REMOTE && !S.idleTs) { S.idleTs = Date.now(); save(); }
      const row2 = el('div', 'ex-row', btns); UK.btn({ text: '요일 던전', icon: 'gift', cls: 'sky', onclick: () => GF.go('xdun') }, row2);
      const scout = UK.btn({ text: '정찰 보상', icon: 'star', cls: 'gold', onclick: async () => { try { const g = await idleClaim(); UK.toast(g ? '🪙 +' + g + ' (정찰 보상)' : (REMOTE || S.idleTs ? '아직 모이는 중이에요 (10분 뒤부터)' : '정찰을 시작했어요. 나중에 받으러 와요'), r); scout.querySelector('span') && void 0; GF.replace('xhome'); } catch (e) { UK.toast('받지 못했어요', r); } } }, row2);
      if (!REMOTE) { const g0 = idleNow(); if (g0 > 0) scout.insertAdjacentHTML('beforeend', ' <em class="adv">' + g0 + '</em>'); }
      const row3 = el('div', 'ex-row', btns); UK.btn({ text: '동료 도감', icon: 'heart', cls: 'pink', onclick: () => GF.go('xdex') }, row3);
      const bg = UK.btn({ text: '초보자 미션', icon: 'star', cls: 'green', onclick: () => GF.go('xbegin') }, row3); bg.style.position = 'relative'; begLoad().then((b) => { const n = begBadge(b); if (n && bg.isConnected) el('i', 'ex-bdg', bg, n); });
      if (REMOTE) UK.btn({ text: '상점·설정', icon: 'star', cls: 'ghost', onclick: () => GF.go('xshop') }, row3);
      el('div', 'ex-foot', r, '전투력 ' + power(S.party) + ' · 동료 ' + Object.keys(S.units).length + '/' + D.units.length + ' · 랜덤 아이템 포함(동료 모집)');
      if (!S.flags.prologue && !(navigator.webdriver && !/[?&]story=1/.test(location.search))) { S.flags.prologue = 1; save(); setTimeout(() => GF.tale.play(D.story.prologue, r, () => {}, { bg: 'field' }), 400); }
    },
  });
  /* ---------------- 상점·설정 (서버 연결 모드): 결제 전 고지 · 월 결제 한도 · 광고 보상 ---------------- */
  const MOCKSTORE = REMOTE && /^(https?:\/\/)?(127\.0\.0\.1|localhost)/.test(API);   // 로컬 개발 서버에서만 모의 결제·광고
  const won = (n) => n.toLocaleString('ko-KR') + '원';
  GF.screen('xshop', {
    bare: false,
    async enter(r) {
      r.classList.add('uk', 'ex'); GF.bg('field', r); bar(); head(r, '상점·설정', '결제 전에 꼭 읽어 주세요'); back(r, 'xhome');
      const box = el('div', 'ex-shop', r); el('p', 'ex-sub', box, '불러오는 중…');
      let pr, pf; try { [pr, pf] = await Promise.all([http('GET', '/iap/products'), http('GET', '/profile')]); } catch (e) { box.innerHTML = '서버에 연결하지 못했어요.'; return; }
      if (!r.isConnected) return; applyProfile(pf); bar(); box.innerHTML = '';
      const pre = await http('POST', '/iap/precheck', { sku: pr.products[0].sku }), blocked = pf.age_band === '12_13';
      const note = el('div', 'ex-note', box); ['unused_refund_7d', 'gacha_no_refund', 'store_policy', 'negative_balance'].forEach((k) => el('p', '', note, '· ' + pr.notice[k]));
      el('p', 'ex-bold', note, '모집(뽑기)은 확률로 동료를 얻는 랜덤 아이템이에요. 확률은 모집 화면의 「확률 공개」에서 볼 수 있어요.');
      if (blocked) el('p', 'ex-warn', box, '만 14세 미만은 보호자 동의 전까지 결제할 수 없어요. 광고 보상은 받을 수 있어요(맞춤 광고 없음).'); else if (pf.guardian_notice) el('p', 'ex-warn', box, '만 19세 미만은 한 달 결제 한도가 7만 원이에요. 보호자와 함께 이용해 주세요.');
      if (pf.wallet.paid_gems < 0) el('p', 'ex-warn', box, '환불로 유료 반짝석이 ' + (-pf.wallet.paid_gems) + '개 모자라요. 다음 결제로 채워질 때까지 반짝석을 쓸 수 없어요.');
      const capBox = el('div', 'ex-cap', box); el('b', '', capBox, '이번 달 결제 ' + won(pre.month_spent) + ' / 한도 ' + won(pre.cap));
      if (!blocked) {
        const sel = el('select', 'ex-sel', capBox); [0, 30000, 50000, 70000, 100000, 200000].filter((v) => v <= pf.cap_krw).forEach((v) => sel.appendChild(new Option(won(v), v))); sel.value = String(pre.cap);
        sel.onchange = async () => { try { const c = await http('POST', '/iap/cap', { cap_krw: +sel.value }); UK.toast(c.pending ? '올리는 건 ' + c.effective_from + '월부터 적용돼요' : '한도를 ' + won(c.cap) + '으로 바꿨어요', r); GF.replace('xshop'); } catch (e) { UK.toast('바꾸지 못했어요', r); } };
        el('small', '', capBox, '낮추는 건 바로, 올리는 건 다음 달부터 적용돼요');
      }
      const list = el('div', 'ex-plist', box);
      pr.products.forEach((p) => {
        const row = el('div', 'ex-prod', list), own = p.noInter && pf.no_inter; el('span', '', row, `<b>${p.name}</b><small>${p.noInter ? '전면 광고 제거' : '💎 ' + p.gems + (p.firstDouble ? ' · 첫 구매 2배' : '')}</small>`);
        UK.btn({ text: own ? '구매함' : won(p.krw), cls: (blocked || own ? 'ghost' : 'gold') + ' sm', onclick: async () => {
          if (blocked || own) return; const c = await http('POST', '/iap/precheck', { sku: p.sku }); if (!c.allowed) { UK.toast(c.msg || '지금은 살 수 없어요', r); return; }
          UK.modal({ parent: r, title: p.name + ' · ' + won(p.krw), body: `이번 달 ${won(c.month_spent)} 사용 / 한도 ${won(c.cap)}<br>· ${pr.notice.unused_refund_7d}<br>· ${pr.notice.gacha_no_refund}<br>· ${pr.notice.store_policy}`, actions: [{ text: '결제하기', cls: 'gold', onclick: async () => {
            if (!MOCKSTORE) { UK.toast('스토어 결제는 곧 열려요(준비 중)', r); return; }
            const order = 'MOCK.' + uid(); try { const v = await http('POST', '/iap/verify', { store: 'mock', sku: p.sku, purchase_token: `mock:${order}:${p.sku}`, order_id: order, request_id: uid() }); UK.toast('💎 +' + v.granted + (v.warning ? ' · ' + v.warning : ''), r); } catch (e) { UK.toast(e.msg || '결제를 확인하지 못했어요', r); } GF.replace('xshop');
          } }, { text: '취소', cls: 'ghost' }] });
        } }, row);
      });
      const adbox = el('div', 'ex-ads', box); el('b', '', adbox, '광고 보고 받기 (선택)'); el('small', '', adbox, '맞춤 광고가 아니에요 · 하루 횟수가 정해져 있어요');
      Object.entries(pf.ads.reward).forEach(([kind, rw]) => UK.btn({ text: (kind === 'gems' ? `반짝석 ${rw.grant}` : `소탕권 ${rw.grant}`) + ` (하루 ${rw.per_day}회)`, cls: 'sky sm', onclick: async () => {
        if (!MOCKSTORE) { UK.toast('광고는 곧 열려요(준비 중)', r); return; }
        try { const t = await http('POST', '/dev/ad', { kind }); const g = await http('POST', '/ads/reward', { kind, token: t.token }); UK.toast('받았어요 · 오늘 ' + g.left_today + '회 남음', r); } catch (e) { UK.toast(e.code === 'daily_limit' ? '오늘은 다 받았어요' : '받지 못했어요', r); } GF.replace('xshop');
      } }, adbox));
      el('p', 'ex-sub', box, '소탕권 ' + (pf.wallet.tickets || 0) + ' · ' + (pf.ads.allowed ? '전면 광고: 4번 싸울 때 한 번' : pf.ads.reason === 'first_30min' ? '전면 광고: 설치 직후 30분은 없어요' : '전면 광고 없음'));
      UK.btn({ text: '계정·데이터 삭제 요청', cls: 'ghost sm', onclick: () => UK.modal({ parent: r, title: '계정 삭제', body: '계정과 보유 정보가 삭제돼요. 결제 기록은 법정 보존 기간 동안 남아요.', actions: [{ text: '삭제', cls: 'pink', onclick: async () => { try { await http('POST', '/account/delete', {}); setAuth(null); location.reload(); } catch (e) { UK.toast('삭제하지 못했어요', r); } } }, { text: '취소', cls: 'ghost' }] }) }, box);
    },
  });
  /* ---------------- 요일 던전 · 방치 정찰 (B3) ---------------- */
  const Dn = () => D.dungeon, todayKey = () => new Date(Date.now() + 9 * 3600000).toISOString().slice(0, 10);
  const dunLocal = () => { S.dun = S.dun && S.dun.d === todayKey() ? S.dun : { d: todayKey(), n: 0 }; return S.dun; };
  async function dunInfo() {
    if (REMOTE) return http('GET', '/dungeon');
    const day = SC.dayKst(Date.now()), left = Math.max(0, Dn().perDay - dunLocal().n), d = Dn().days[day];
    return { unlocked: S.cleared >= Dn().unlock, unlock: Dn().unlock, day, name: d.name, kind: d.kind, el: d.el || null, left, perDay: Dn().perDay, tiers: Dn().tiers.map((_, t) => ({ tier: t, name: Dn().tierNames[t], reward: SC.dungeonReward(D, day, t, S.cleared) })) };
  }
  const idleNow = () => (REMOTE ? null : SC.idleGold(D, S.cleared, Date.now() - (S.idleTs || Date.now())));
  async function idleClaim() {
    if (!REMOTE) { if (!S.idleTs) { S.idleTs = Date.now(); save(); return 0; } const g = SC.idleGold(D, S.cleared, Date.now() - S.idleTs); if (g) { S.gold += g; S.idleTs = Date.now(); S.flags.idleN = (S.flags.idleN || 0) + 1; save(); bar(); } return g; }
    const r = await http('POST', '/idle/claim', { request_id: uid() }); if (r.profile) { applyProfile(r.profile); bar(); } return r.gold;
  }
  GF.screen('xdun', {
    bare: false,
    async enter(r) {
      r.classList.add('uk', 'ex'); GF.bg('field', r); bar(); head(r, '요일 던전', '하루 3번 · 졌을 땐 횟수를 안 써요'); back(r, 'xhome'); const box = el('div', 'ex-shop', r); el('p', 'ex-sub', box, '불러오는 중…');
      let info; try { info = await dunInfo(); } catch (e) { box.innerHTML = '서버에 연결하지 못했어요.'; return; } if (!r.isConnected) return; box.innerHTML = '';
      el('div', 'ex-nation', box, `<b>${info.name}</b><small>오늘 ${info.left}/${info.perDay}번 남음</small>`); if (info.unlocked) setTimeout(() => { if (r.isConnected) tipOnce('dungeon', r); }, 250);
      if (!info.unlocked) { el('p', 'ex-warn', box, info.unlock + '단계를 깨면 열려요.'); return; }
      el('p', 'ex-sub', box, info.kind === 'gold' ? '오늘은 금화가 많이 나와요.' : info.kind === 'both' ? '오늘은 금화와 조각이 같이 나와요(아무 친구).' : info.el === 'any' ? '오늘은 아무 친구의 조각이 1.5배!' : '오늘은 ' + D.el[info.el].name + '(' + D.el[info.el].icon + ') 친구의 조각이 나와요.');
      const pickTarget = (el0, cb) => {
        const owned = Object.keys(S.units).filter((id) => !el0 || el0 === 'any' || $(id).el === el0); if (!owned.length) { UK.toast('오늘 조각을 받을 친구가 없어요', r); return; }
        const sc = UK.modal({ parent: r, title: '조각을 받을 친구', body: '', actions: [] }), sh = sc.querySelector('.uk-sheet'), g = el('div', 'ex-dexgrid', sh); owned.forEach((id) => { const u = $(id), c = el('button', 'ex-card', g); c.appendChild(art(u, 'xs')); c.insertAdjacentHTML('beforeend', elIcon(u.el)); el('b', '', c, u.name.replace(/\(.*\)/, '')); el('small', '', c, '조각 ' + (S.dups[id] || 0)); c.onclick = () => { sc.remove(); cb(id); }; });
        UK.btn({ text: '닫기', cls: 'ghost', onclick: () => sc.remove() }, el('div', 'acts', sh));
      };
      info.tiers.forEach((t) => {
        const row = el('div', 'ex-prod', box), rw = t.reward; el('span', '', row, `<b>${t.name}</b><small>${rw.gold ? '🪙 ' + rw.gold : ''}${rw.gold && rw.frag ? ' · ' : ''}${rw.frag ? '조각 ' + rw.frag : ''}</small>`);
        UK.btn({ text: info.left ? '도전' : '내일 또', cls: (info.left ? 'green' : 'ghost') + ' sm', onclick: () => { if (!info.left) { UK.toast('오늘은 다 했어요', r); return; } if (rw.frag) pickTarget(rw.el, (id) => GF.go('xbattle', { dun: { day: info.day, tier: t.tier }, target: id })); else GF.go('xbattle', { dun: { day: info.day, tier: t.tier } }); } }, row);
      });
      el('p', 'ex-sub', box, '조각은 각성·승급에 써요. 같은 속성 친구만 받을 수 있어요.');
    },
  });
  /* ---------------- 초보자 미션 30 · 출석 7일 (B11) ---------------- */
  const begLocal = () => ({ cleared: S.cleared, units: S.units, pulls: S.pulls || 0, dun: S.flags.dunN || 0, idle: S.flags.idleN || 0, dex: (S.flags.dex || []).length });
  let BEG = null;      // 마지막으로 본 {missions, att} — 서버판은 서버가 판정한 것
  async function begLoad() {
    if (REMOTE) { try { BEG = await http('GET', '/beginner'); } catch (e) { /* 이전 값 유지 */ } return BEG; }
    const got = S.flags.beg || []; BEG = { missions: SC.beginner(D, begLocal()).map((m) => Object.assign({}, m, { claimed: got.includes(m.id) })), att: S.flags.att || { n: 0, last: '' } }; return BEG;
  }
  const attReady = (b) => { const a = (b && b.att) || { n: 0, last: '' }; return a.last !== todayKey() && a.n < (D.bal.attend || []).length; };
  const begBadge = (b) => (b ? b.missions.filter((m) => m.done && !m.claimed).length + (attReady(b) ? 1 : 0) : 0);
  async function begClaim(id) {
    if (!REMOTE) { const m = SC.beginner(D, begLocal()).find((x) => x.id === id), got = (S.flags.beg = S.flags.beg || []); if (!m || !m.done || got.includes(id)) return false; got.push(id); S.gems += m.gems; S.gold += m.gold; save(); bar(); return { gems: m.gems, gold: m.gold }; }
    try { const r = await http('POST', '/beginner/claim', { id }); applyProfile(r.profile); BEG = { missions: r.missions, att: r.att }; bar(); return { gems: r.gems || 0, gold: r.gold || 0 }; } catch (e) { UK.toast(e.code === 'not_yet' ? '아직이에요' : '받지 못했어요', document.getElementById('safe')); return false; }
  }
  async function attClaim() {
    if (!REMOTE) { const a = S.flags.att || { n: 0, last: '' }; if (!attReady({ att: a })) return false; const n = a.n + 1, rw = SC.attendDay(D, n); S.flags.att = { n, last: todayKey() }; S.gems += rw.gems; S.gold += rw.gold; save(); bar(); return { gems: rw.gems, gold: rw.gold, day: n }; }
    try { const r = await http('POST', '/attend/claim', {}); applyProfile(r.profile); BEG = { missions: r.missions, att: r.att }; bar(); return r.already || r.done ? false : { gems: r.gems || 0, gold: r.gold || 0, day: r.day }; } catch (e) { UK.toast('받지 못했어요', document.getElementById('safe')); return false; }
  }
  const rwText = (g, o) => [g ? '💎 ' + g : '', o ? '🪙 ' + o : ''].filter(Boolean).join(' · ');
  GF.screen('xbegin', {
    bare: false,
    enter(r) {
      r.classList.add('uk', 'ex'); GF.bg('field', r); bar(); head(r, '초보자 미션', '처음 일주일, 천천히 하나씩 해요'); back(r, 'xhome'); const box = el('div', 'ex-shop ex-beg', r);
      const draw = async () => {
        const b = await begLoad(); if (!r.isConnected) return; box.innerHTML = ''; if (!b) { el('p', 'ex-sub', box, '불러오지 못했어요. 잠시 뒤에 다시 와 봐요.'); return; }
        const att = b.att || { n: 0, last: '' }, A = D.bal.attend || [], ready = attReady(b), strip = el('div', 'ex-att', box);
        A.forEach((a) => { const done = att.n >= a.day, now = !done && att.n + 1 === a.day, c = el('div', 'ex-ad' + (done ? ' done' : now && ready ? ' can' : ''), strip); c.innerHTML = `<b>${a.day}일째</b><small>${rwText(a.gems, a.gold) || ''}</small>` + (done ? '<em>✔</em>' : ''); });
        el('p', 'ex-sub', box, att.n >= A.length ? '출석 7일을 다 모았어요. 고마워요!' : ready ? '오늘 출석 도장을 받아요. 쉬어도 괜찮아요, 이어서 찍어요.' : '오늘 출석은 받았어요. 내일 또 만나요.');
        if (ready) UK.btn({ text: '오늘 출석 받기', icon: 'gift', cls: 'gold block', onclick: async () => { const g = await attClaim(); if (g) { GF.sfx('star'); UK.toast(g.day + '일째 출석! ' + rwText(g.gems, g.gold), r); setTimeout(draw, 500); } } }, box);
        const ms = b.missions, open = ms.filter((m) => !m.claimed), claimed = ms.length - open.length; el('div', 'ex-nation', box, `<b>미션</b><small>${claimed}/${ms.length} 받음</small>`);
        open.slice().sort((x, y) => (y.done ? 1 : 0) - (x.done ? 1 : 0)).forEach((m) => {
          const c = el('div', 'ex-bg' + (m.done ? ' can' : ''), box); c.innerHTML = `<div class="tx"><b>${m.t}</b><div class="bar"><i style="width:${Math.round(m.got / m.need * 100)}%"></i></div><small>${m.got}/${m.need} · ${rwText(m.gems, m.gold)}</small></div>`;
          if (m.done) UK.btn({ text: '받기', cls: 'gold sm', onclick: async () => { const g = await begClaim(m.id); if (g) { GF.sfx('star'); el('i', 'ex-gain', c, rwText(g.gems, g.gold)); setTimeout(draw, 700); } } }, c);
        });
        if (!open.length) el('p', 'ex-sub', box, '미션을 모두 받았어요. 멋져요!');
      };
      draw();
    },
  });
  /* ---------------- 동료 도감 + 수집 보상 (B5) ---------------- */
  const ROUTE = { start: '처음부터 함께해요', story: '이야기를 따라가면 합류해요', recruit: '보스에게 말을 걸어 포섭해요', gacha: '동료 모집(뽑기)에서 만나요' };
  async function dexClaim(n) {
    const m = (D.bal.dex || []).find((x) => x.n === n); if (!m) return false; const got = (S.flags.dex = S.flags.dex || []);
    if (!REMOTE) { if (got.includes(n) || Object.keys(S.units).length < n) return false; got.push(n); S.gems += m.gems; save(); bar(); return m.gems; }
    try { const r = await http('POST', '/dex/claim', { n }); applyProfile(r.profile); bar(); return m.gems; } catch (e) { UK.toast(e.code === 'not_yet' ? '동료를 더 모아요' : '받지 못했어요', document.getElementById('safe')); return false; }
  }
  GF.screen('xdex', {
    bare: false,
    enter(r) {
      r.classList.add('uk', 'ex'); GF.bg('field', r); bar(); const cnt = Object.keys(S.units).length; head(r, '동료 도감', `모은 친구 ${cnt}/${D.units.length}`); back(r, 'xhome'); setTimeout(() => { if (r.isConnected) tipOnce('dex', r); }, 350);
      const box = el('div', 'ex-shop', r), draw = () => {
        box.innerHTML = ''; const have = Object.keys(S.units).length, got = S.flags.dex || [], ms = el('div', 'ex-dexms', box);
        (D.bal.dex || []).forEach((m) => { const done = got.includes(m.n), can = !done && have >= m.n, c = el('div', 'ex-dm' + (done ? ' done' : can ? ' can' : ''), ms); c.innerHTML = `<b>${m.n}명</b><small>💎 ${m.gems}</small>`; if (can) UK.btn({ text: '받기', cls: 'gold sm', onclick: async () => { const g = await dexClaim(m.n); if (g) { GF.sfx('star'); el('i', 'ex-gain', c, '💎 +' + g); setTimeout(draw, 700); } } }, c); else el('em', '', c, done ? '✔ 받음' : have + '/' + m.n); });
        [['start', '우리 가족'], ['story', '이야기 합류'], ['recruit', '포섭한 친구'], ['gacha', '모집 친구']].forEach(([route, title]) => {
          const list = D.units.filter((u) => u.route === route); if (!list.length) return; const n = list.filter((u) => S.units[u.id]).length; el('div', 'ex-nation', box, `<b>${title}</b><small>${n}/${list.length}</small>`); const g = el('div', 'ex-dexgrid', box);
          list.forEach((u) => { const own = !!S.units[u.id], c = el('button', 'ex-card' + (own ? '' : ' dim'), g); c.appendChild(art(u, 'xs')); c.insertAdjacentHTML('beforeend', elIcon(u.el)); el('b', '', c, own ? u.name.replace(/\(.*\)/, '') : '???'); el('small', '', c, '★'.repeat(own ? SC.gradeOf(D, u.id, S.units[u.id]) : u.grade)); c.onclick = () => dexInfo(r, u); });
        });
      };
      UK.btn({ text: '전리품 코드 (우리 집 가구)', icon: 'gift', cls: 'gold block', onclick: () => GF.go('xloot') }, r); r.lastChild.style.cssText = 'position:absolute;left:14px;right:14px;bottom:8px;width:auto;z-index:20';
      draw();
    },
  });
  function dexInfo(r, u) {
    const own = !!S.units[u.id], sc = UK.modal({ parent: r, title: own ? u.name : '??? (' + ROUTE[u.route].replace(/해요$/, '') + ')', body: '', actions: [] }), sh = sc.querySelector('.uk-sheet'), top = el('div', 'ex-dexhd', sh); top.appendChild(art(u, 'xl')); const tx = el('div', '', top);
    const st = own ? SC.stOf(S.units[u.id]) : null; el('b', '', tx, `${'★'.repeat(own ? SC.gradeOf(D, u.id, st) : u.grade)} ${D.el[u.el].icon} ${D.el[u.el].family} ${D.el[u.el].name}`); el('small', '', tx, `${D.role[u.role].icon} ${D.role[u.role].name} · ${D.role[u.role].skill}`);
    if (own) el('small', '', tx, `Lv ${st.lv} · 스킬 ${st.skl} · 각성 ${st.awk} · 조각 ${S.dups[u.id] || 0} · 전투력 ${Math.round(kOf(u.id) * 100)}`);
    el('p', 'ex-tale', sh, own ? u.tale : '아직 만나지 못했어요. ' + (ROUTE[u.route] || '') + (u.route === 'story' || u.route === 'recruit' ? ' (' + (u.note || '').replace(/^[^·]*· /, '') + ')' : '') + (u.costume ? '' : ''));
    if (own && u.costume) el('small', 'ex-sub', sh, '의상: ' + u.costume + ' 이야기');
    UK.btn({ text: '닫기', cls: 'ghost', onclick: () => sc.remove() }, el('div', 'acts', sh));
  }
  /* ---------------- 스토리 = 튜토리얼(B7): 새 기능을 처음 열 때 한 번만 이야기 컷으로 ---------------- */
  const tipKey = (k) => 'gfx:tip:' + ((AUTH && AUTH.account) || 'local') + ':' + k;
  const tipSeen = (k) => { try { return !!localStorage.getItem(tipKey(k)); } catch (e) { return true; } };
  const TIPSEL = { gacha: '.ex-prow .uk-btn', dex: '.ex-dm.can .uk-btn, .ex-dexgrid .ex-card', dungeon: '.ex-prod .uk-btn', grow: '.ex-grow-r .uk-btn' };
  const tipFinger = (k, r) => { try { const t = document.querySelector(TIPSEL[k]); if (t && r.isConnected) UK.finger(r, t, { ms: 7000 }); } catch (e) { /* 손가락 실패는 무시 */ } };   // 컷이 끝나면 실제 버튼을 손가락으로 가리킨다
  const tipOnce = (k, r, cb) => {
    const cuts = D.story.tips && D.story.tips[k], skip = !cuts || tipSeen(k) || (navigator.webdriver && !/[?&]story=1/.test(location.search)); if (skip) return false;      // 건너뛸 땐 호출한 쪽이 그대로 이어간다(cb 는 컷을 본 뒤에만)
    try { localStorage.setItem(tipKey(k), '1'); } catch (e) { /* 저장 불가 */ } GF.tale.play(cuts, r, () => { cb && cb(); setTimeout(() => tipFinger(k, r), 500); }, { bg: 'field' }); return true;
  };
  /* ---------------- 원정 전리품 코드 (B6): 성인 「우리 집」에서 입력하면 가구가 생겨요 — 앱은 따로, 연결은 코드로만(D12) ---------------- */
  const lootAt = (stage) => (D.loot || []).find((x) => x.stage === stage);
  const copyText = (txt, r) => { let okc = false; try { navigator.clipboard.writeText(txt); okc = true; } catch (e) { try { const t = document.createElement('textarea'); t.value = txt; document.body.appendChild(t); t.select(); okc = document.execCommand('copy'); t.remove(); } catch (x) { /* 복사 불가 */ } } UK.toast(okc ? '코드를 복사했어요' : '코드를 눌러 직접 복사해요', r); };
  GF.screen('xloot', {
    bare: false,
    enter(r) {
      const got = (D.loot || []).filter((x) => S.cleared >= x.stage).length; r.classList.add('uk', 'ex'); GF.bg('field', r); bar(); head(r, '원정 전리품', `코드 ${got}/${(D.loot || []).length}`); back(r, 'xdex'); const box = el('div', 'ex-shop', r);
      el('p', 'ex-note', box, '단계를 깰 때마다 「우리 집」 가구 코드를 받아요. 성인용 앱(합치기·식탁 등)의 우리 집 → 「구경 코드」 → 「전리품 코드」에 입력하면 가구가 생겨요. 우리 집과는 코드로만 이어져요.');
      (D.loot || []).forEach((x) => { const open = S.cleared >= x.stage, row = el('div', 'ex-prod' + (open ? '' : ' dim'), box); el('span', '', row, `<b>${x.emoji} ${open ? x.name : '???'}</b><small>${open ? '' : '🔒 '}${x.stage}단계 클리어${open ? ' · ' + x.code : ''}</small>`); if (open) UK.btn({ text: '복사', cls: 'sky sm', onclick: () => copyText(x.code, r) }, row); });
    },
  });
  /* ---------------- 원정 길 ---------------- */
  GF.screen('xmap', {
    bare: false,
    enter(r) {
      r.classList.add('uk', 'ex'); GF.bg('field', r); bar(); const curN = Math.floor(Math.min(S.cleared, D.stages.length - 1) / 12), NA = (D.nations || [])[curN]; head(r, NA ? NA.name : '원정 길', NA ? NA.sub : '');
      const list = el('div', 'ex-path', r); let curRow = null;
      D.stages.forEach((st, i) => {
        if (D.nations && i % 12 === 0 && D.nations[i / 12]) { const nn = D.nations[i / 12]; el('div', 'ex-nation' + (i > S.cleared ? ' dim' : ''), list, `<b>${nn.name}</b><small>${nn.sub}</small>`); }
        const open = i <= S.cleared, done = i < S.cleared, row = el('button', 'ex-node' + (open ? '' : ' locked') + (done ? ' done' : '') + (st.boss || st.mid ? ' boss' : ''), list); if (i === Math.min(S.cleared, D.stages.length - 1)) curRow = row;
        el('b', 'ex-no', row, String(st.id)); const tx = el('span', 'ex-ntx', row); el('b', '', tx, st.name + (st.boss ? ' · 포섭' : st.mid ? ' · 대장' : '')); el('small', '', tx, done ? '★'.repeat(S.stars[st.id] || 1) : (open ? '도전!' : '잠김'));
        const en = el('span', 'ex-nen', row); Array.from(new Set(st.enemies.map((e) => e.el))).forEach((e) => { en.insertAdjacentHTML('beforeend', elIcon(e)); });
        row.onclick = () => { if (!open) { UK.toast('앞 단계를 먼저 깨요', r); return; } GF.sfx('pick'); ready(r, st); };
      });
      back(r, 'xhome'); if (curRow) setTimeout(() => { list.scrollTop = Math.max(0, curRow.offsetTop - 140); }, 30);
    },
  });
  function ready(r, st) {      // 출전 확인: 적 구성과 상성, 편성 바로가기
    const sc = UK.modal({ parent: r, title: st.id + '. ' + st.name, body: '', actions: [] }), sh = sc.querySelector('.uk-sheet'); sh.classList.add('ex-ready');
    el('div', 'ex-rl', sh, '<small>적</small>'); const eb = el('div', 'ex-rrow', sh); st.enemies.forEach((e) => { const c = el('div', 'ex-mini', eb); c.innerHTML = `<span>${e.emoji}</span>${elIcon(e.el)}`; });
    el('div', 'ex-rl', sh, '<small>우리 원정대</small>'); const pb = el('div', 'ex-rrow', sh);
    S.party.forEach((id) => { const u = $(id), c = el('div', 'ex-mini', pb); c.appendChild(art(u, 'xs')); const good = st.enemies.some((e) => beats(u.el, e.el)); c.insertAdjacentHTML('beforeend', elIcon(u.el) + (good ? '<em class="adv">↑</em>' : '')); });
    el('p', 'ex-tip', sh, st.tip || (st.boss ? '체력이 줄었을 때, 상성이 맞는 친구가 말을 걸면 마음을 열어요.' : '↑ 표시는 이 적에게 유리한 친구예요.'));
    const a = el('div', 'acts', sh); UK.btn({ text: '전투 시작', icon: 'play', cls: 'green', onclick: () => { sc.remove(); GF.go('xbattle', { stage: st.id }); } }, a); UK.btn({ text: '편성하기', cls: 'sky sm', onclick: () => { sc.remove(); GF.go('xparty', { from: 'xmap' }); } }, a); UK.btn({ text: '닫기', cls: 'ghost sm', onclick: () => sc.remove() }, a);
  }
  /* ---------------- 편성·육성 ---------------- */
  GF.screen('xparty', {
    bare: false,
    enter(r, p) {
      r.classList.add('uk', 'ex'); GF.bg('field', r); bar(); head(r, '편성·육성', '카드를 누르고 자리를 눌러 바꿔요');
      let sel = null; const slots = el('div', 'ex-slots', r), info = el('div', 'ex-info', r), grid = el('div', 'ex-roster', r);
      const draw = () => {
        slots.innerHTML = ''; S.party.forEach((id, i) => { const u = $(id), c = el('button', 'ex-slot' + (sel && sel === id ? ' sel' : ''), slots); c.appendChild(art(u, 'xs')); c.insertAdjacentHTML('beforeend', elIcon(u.el) + '<em>' + ROLEICON(u.role) + '</em>'); c.onclick = () => { if (sel && sel !== id) { const j = S.party.indexOf(sel); if (j >= 0) { S.party[j] = id; } S.party[i] = sel; save(); partySync(); sel = null; GF.sfx('drop'); draw(); } else { sel = id; draw(); } }; });
        info.innerHTML = ''; const u = sel && $(sel);
        if (u) { const lv = S.units[sel].lv, c = cost(lv), can = S.gold >= c && lv < SC.lvCap(D, S.cleared); el('b', '', info, `${u.name} ${'★'.repeat(SC.gradeOf(D, sel, S.units[sel]))} Lv ${lv} · ${D.role[u.role].skill} ${stOf(sel).skl}`); el('small', '', info, `${D.el[u.el].family} ${D.el[u.el].name} · 전투력 ${Math.round(kOf(sel) * 100)}`); UK.btn({ text: '키우기', cls: 'sky sm', onclick: () => growSheet(r, sel, () => { draw(); drawGrid(); }) }, info); UK.btn({ text: lv >= SC.lvCap(D, S.cleared) ? '레벨 상한 ' + lv : '레벨업 🪙' + c, cls: (can ? 'gold' : 'ghost') + ' sm', onclick: async () => { if (!can) { UK.toast(lv >= SC.lvCap(D, S.cleared) ? '지금은 여기까지예요. 다음 단계를 깨면 상한이 올라요' : '금화가 모자라요. 전투로 모아요', r); return; } if (await levelUp(sel, c)) { GF.sfx('star'); draw(); drawGrid(); } } }, info); } else el('small', '', info, '카드를 눌러 보세요');
        el('div', 'ex-pw', info, '원정대 전투력 ' + power(S.party));
      };
      const drawGrid = () => { grid.innerHTML = ''; D.units.forEach((u) => { const own = !!S.units[u.id], c = el('button', 'ex-card' + (own ? '' : ' dim') + (sel === u.id ? ' sel' : '') + (S.party.includes(u.id) ? ' inparty' : ''), grid); c.appendChild(art(u, 'xs')); c.insertAdjacentHTML('beforeend', elIcon(u.el)); el('b', '', c, u.name.replace(/\(.*\)/, '')); el('small', '', c, own ? '★'.repeat(u.grade) + ' Lv' + S.units[u.id].lv : (u.route === 'gacha' ? '모집' : u.route === 'story' ? '이야기' : '포섭')); c.onclick = () => { if (!own) { UK.toast('아직 만나지 못한 친구예요 · ' + ({ gacha: '동료 모집에서', story: '이야기를 따라가면', recruit: '마음을 열어 주면' })[u.route], r); return; } sel = u.id; draw(); drawGrid(); }; }); };
      draw(); drawGrid(); back(r, p && p.from || 'xhome');
    },
  });
  const ROLEICON = (role) => D.role[role].icon;
  /* ---------------- 전투 ---------------- */
  GF.screen('xbattle', {
    bare: false,
    enter(r, p) {
      r.classList.add('uk', 'ex', 'exb'); GF.bg('field', r); bar(); const st = p.dun ? (p.srv ? p.srv.stage : SC.dungeonStage(D, p.dun.day, p.dun.tier, S.cleared)) : D.stages.find((x) => x.id === p.stage);
      if (REMOTE && !p.srv && p.dun) { GF.bg('field', r); el('p', 'ex-wait', r, '전투 준비 중…'); http('POST', '/dungeon/start', { tier: p.dun.tier }).then((srv) => { if (r.isConnected) GF.replace('xbattle', { dun: p.dun, target: p.target, srv }); }).catch((e) => { UK.toast(e.code === 'no_runs_left' ? '오늘은 다 했어요' : '서버에 연결하지 못했어요', document.getElementById('safe')); GF.replace('xdun'); }); return; }
      if (REMOTE && !p.srv) {      // 서버가 시드·파티를 정해 준다(WP4). 받으면 같은 화면으로 다시 들어온다
        GF.bg('field', r); el('p', 'ex-wait', r, '전투 준비 중…'); stageStartRemote(st.id).then((srv) => { if (r.isConnected) GF.replace('xbattle', { stage: st.id, srv }); }).catch((e) => { UK.toast(e.code === 'stage_locked' ? '앞 단계를 먼저 깨야 해요' : '서버에 연결하지 못했어요', document.getElementById('safe')); GF.replace('xmap'); }); return;
      }
      const srv = REMOTE ? p.srv : null, seed = srv ? srv.seed : (p.seed != null ? p.seed : p.dun ? (Date.now() & 0xffffff) : (st.id * 1009 + (S.stars[st.id] ? 17 : 3))), inputs = [], auto0 = S.autoSkill; let steps = 0;
      const A = srv ? srv.party.map((x, i) => defOf(x.id, i, x)) : S.party.map((id, i) => defOf(id, i)), En = st.enemies.map((e, i) => enemyDef(e, i, st.boss)), core = B.create(A, En, { seed, autoSkill: S.autoSkill });

      const hd = el('div', 'ex-bhd', r); el('b', '', hd, (p.dun ? '' : st.id + '. ') + st.name); const ctl = el('div', 'ex-ctl', hd);
      const sp = UK.btn({ text: '×' + S.speed, cls: 'sky sm', onclick: () => { S.speed = S.speed % 3 + 1; save(); sp.textContent = '×' + S.speed; } }, ctl); sp.setAttribute('aria-label', 'speed');
      const au = UK.btn({ text: S.autoSkill ? '스킬 자동' : '스킬 수동', cls: 'ghost sm', onclick: () => { S.autoSkill = !S.autoSkill; core.autoSkill = S.autoSkill; inputs.push([steps, 'a', S.autoSkill ? 1 : 0]); au.textContent = S.autoSkill ? '스킬 자동' : '스킬 수동'; save(); drawReady(); } }, ctl);
      const rowE = el('div', 'ex-brow e', r), mid = el('div', 'ex-bmid', r), rowP = el('div', 'ex-brow p', r); const cardsE = [], cardsP = [];
      const cu = (side, i) => (side === 'A' ? core.A[i] : core.B[i]);
      A.forEach((u, i) => { const c = el('button', 'ex-bc A', rowP); c.appendChild(art($(u.id))); c.insertAdjacentHTML('beforeend', `${elIcon(u.el)}<div class="ex-hp"><i></i></div><em class="ex-rd">✦</em><small>${u.name.replace(/\(.*\)/, '')}</small>`); cardsP[i] = c; c.onclick = () => { if (S.autoSkill) return; if (core.ready(core.A[i])) { core.cast('A', i); inputs.push([steps, 'c', i]); c.classList.add('queued'); GF.sfx('tap'); } }; });
      En.forEach((u, i) => { const c = el('button', 'ex-bc B', rowE); c.appendChild(el('div', 'ex-art', null, u.emoji)); c.insertAdjacentHTML('beforeend', `${elIcon(u.el)}<div class="ex-hp"><i></i></div><small>${u.name}</small>`); cardsE[i] = c; });
      const logEl = el('div', 'ex-blog', mid, st.tip || '전투 시작!'), pbtn = el('div', 'ex-pbtn', mid);
      const hp = () => { core.A.forEach((u, i) => { const c = cardsP[i]; c.querySelector('.ex-hp i').style.width = Math.round(u.hp / u.max * 100) + '%'; c.classList.toggle('down', u.hp <= 0); }); core.B.forEach((u, i) => { const c = cardsE[i]; c.querySelector('.ex-hp i').style.width = Math.round(u.hp / u.max * 100) + '%'; c.classList.toggle('down', u.hp <= 0); }); };
      const drawReady = () => { core.A.forEach((u, i) => { const rd = core.ready(u) && !S.autoSkill; cardsP[i].classList.toggle('rd', rd); if (!rd) cardsP[i].classList.remove('queued'); }); };
      const pop = (c, text, cls) => { const f = el('i', 'ex-pop ' + (cls || ''), c, text); setTimeout(() => f.remove(), 900); };
      let stopped = false, persuaded = false, askedOnce = false, finished = false; const KIND = { attack: '공격', skill: '스킬', aoe: '전체 공격', heal: '치유', buff: '응원' };
      const bi = st.enemies.findIndex((e) => e.lock > 0), boss = bi >= 0 ? core.B[bi] : null, needEl = boss ? Object.keys(D.el).find((e) => beats(e, boss.el)) : null;
      const canPersuade = () => !!boss && !!st.recruit && core.A.some((u) => u.hp > 0 && beats(u.el, boss.el));
      const persuadeUI = () => {
        pbtn.innerHTML = ''; if (!boss || persuaded || boss.hp <= 0 || boss.hp / boss.max > D.bal.persuadeAt) return; const ok = canPersuade();
        UK.btn({ text: '말 걸기', icon: 'heart', cls: (ok ? 'pink' : 'ghost') + ' block', onclick: () => { if (!ok) { UK.toast(D.el[needEl].name + '(' + D.el[needEl].icon + ') 친구가 파티에 필요해요', r); return; } doPersuade(); } }, pbtn);
        if (!askedOnce) { askedOnce = true; logEl.textContent = boss.name + '(이)가 주춤해요. ' + (ok ? '말을 걸어 볼까?' : D.el[needEl].name + '(' + D.el[needEl].icon + ') 친구가 있어야 해요.'); }
      };
      const doPersuade = () => { stopped = true; persuaded = true; inputs.push([steps, 'p']); pbtn.innerHTML = ''; GF.tale.play(D.story.recruit[st.recruit], r, () => { if (!REMOTE) { S.units[st.recruit] = S.units[st.recruit] || { lv: 1 }; S.flags.recruited = 1; } boss.hp = 0; boss.down = true; hp(); win(true); }, { bg: 'hill' }); };
      const finish = (won) => { if (finished) return; finished = true; stopped = true; if (won) win(false); else lose(); };
      const dunWin = () => {
        const done2 = (rw) => { GF.sfx('celebrate'); const sc = UK.modal({ parent: r, title: '승리!', body: '', actions: [] }), sh = sc.querySelector('.uk-sheet'); el('p', 'ex-rw', sh, `🪙 +${rw.gold}${rw.frag ? ' · 조각 +' + rw.frag + ' (' + $(rw.target).name + ')' : ''}`); const a = el('div', 'acts', sh); UK.btn({ text: '던전으로', cls: 'green', onclick: () => { sc.remove(); GF.replace('xdun'); } }, a); UK.btn({ text: '홈', cls: 'ghost sm', onclick: () => { sc.remove(); GF.replace('xhome'); } }, a); try { UK.confetti(sc); } catch (e) { /* 연출 */ } };
        if (REMOTE) { http('POST', '/dungeon/clear', { token: srv.token, inputs, auto: auto0, target: p.target }).then((res) => { if (!res.win) { UK.toast('전투 기록이 서버와 달라요', r); lose(); return; } applyProfile(res.profile); bar(); done2(res.reward); }).catch((e) => { UK.toast(e.code === 'no_runs_left' ? '오늘은 다 했어요' : '서버에 연결하지 못했어요', r); GF.replace('xdun'); }); return; }
        const rw = SC.dungeonReward(D, p.dun.day, p.dun.tier, S.cleared); S.gold += rw.gold; if (rw.frag && p.target) S.dups[p.target] = (S.dups[p.target] || 0) + rw.frag; dunLocal().n++; S.flags.dunN = (S.flags.dunN || 0) + 1; save(); bar(); done2({ gold: rw.gold, frag: rw.frag, target: p.target });
      };
      const win = (recruited) => {
        finished = true; stopped = true; if (p.dun) { dunWin(); return; }
        if (REMOTE) {      // 서버가 같은 기록으로 전투를 다시 돌려 판정·보상을 정한다(WP4)
          stageClearRemote(srv, inputs, auto0).then((res) => { if (!res.win) { UK.toast('전투 기록이 서버와 달라요. 다시 도전해 주세요', r); lose(); return; } applyProfile(res.profile); bar(); GF.sfx('celebrate'); done(res.stars, res.reward.gold, res.reward.gems, res.recruited, res.joined.find((id) => id !== st.recruit) || null); }).catch(() => { UK.toast('서버에 연결하지 못했어요. 잠시 뒤 다시 해 주세요', r); GF.replace('xmap'); }); return;
        }
        const downs = core.A.filter((u) => u.hp <= 0).length, stars = recruited ? 3 : downs === 0 ? 3 : downs <= 2 ? 2 : 1, first = S.cleared < st.id, rw = SC.reward(D, st, first); S.gold += rw.gold; S.gems += rw.gems; if (first) S.cleared = st.id; S.stars[st.id] = Math.max(S.stars[st.id] || 0, stars); let joinId = null; if (st.join && first && !S.units[st.join]) { S.units[st.join] = { lv: 1 }; joinId = st.join; } save(); bar(); GF.sfx('celebrate'); done(stars, rw.gold, rw.gems, recruited, joinId);
      };
      const done = (stars, gold, gems, recruited, joinId) => {
        const after = () => { const sc = UK.modal({ parent: r, title: recruited ? '포섭 성공!' : '승리!', body: '', actions: [] }), sh = sc.querySelector('.uk-sheet'); el('div', 'ex-stars', sh, '★'.repeat(stars) + '☆'.repeat(3 - stars)); const pose = el('div', 'ex-rrow', sh); S.party.forEach((id, i) => { const c = el('div', 'ex-mini ex-pose', pose); c.style.animationDelay = i * 90 + 'ms'; c.appendChild(art($(id), 'xs')); }); el('p', 'ex-rw', sh, `🪙 +${gold}${gems ? ` · 💎 +${gems}` : ''}${recruited ? ' · 새 친구: ' + $(st.recruit).name : ''}`); if (lootAt(st.id)) { const lt = lootAt(st.id); el('p', 'ex-tip', sh, `🎁 전리품 코드: ${lt.name} — ${lt.code} (원정 전리품 화면에서 복사해요)`); } if (st.boss && st.recruit && !recruited) el('p', 'ex-tip', sh, (boss ? boss.name : '친구') + '(이)가 쓰러졌어요… 다음엔 체력이 줄었을 때 말을 걸어 봐요.');
          const a = el('div', 'acts', sh); const nxt = D.stages[st.id]; if (nxt) UK.btn({ text: '다음 단계', icon: 'next', cls: 'green', onclick: () => { sc.remove(); GF.replace('xmap'); } }, a); UK.btn({ text: '편성·육성', cls: 'sky sm', onclick: () => { sc.remove(); GF.replace('xparty', { from: 'xmap' }); } }, a); UK.btn({ text: '원정 길', cls: 'ghost sm', onclick: () => { sc.remove(); GF.replace('xmap'); } }, a); try { UK.confetti(sc); } catch (e) { /* 연출 */ } };
        if (joinId) setTimeout(() => GF.tale.play(D.story.join[joinId], r, () => { UK.toast('새 친구: ' + $(joinId).name, r); after(); }, { bg: 'hill' }), 500); else setTimeout(after, 500);
      };
      const lose = () => { const sc = UK.modal({ parent: r, title: '아쉬워요', body: '레벨업하거나 상성이 맞는 친구로 바꿔서 다시 도전해요. 벌은 없어요.', actions: [{ text: '다시 도전', icon: 'replay', cls: 'green', onclick: () => GF.replace('xbattle', p.dun ? { dun: p.dun, target: p.target } : { stage: st.id, seed: seed + 1 }) }, { text: '편성·육성', cls: 'sky', onclick: () => GF.replace('xparty', { from: p.dun ? 'xdun' : 'xmap' }) }, { text: p.dun ? '던전' : '원정 길', cls: 'ghost', onclick: () => GF.replace(p.dun ? 'xdun' : 'xmap') }] }); void sc; };
      /* 전투 연출(B4): 스킬 컷인 · 속성 이펙트 · 큰 타격 흔들림 */
      const cutIn = (a, ev) => {
        const mine = a.side === 'A', box = el('div', 'ex-cutin ' + (mine ? 'A' : 'B') + ' ' + a.el, r); const ic = el('div', 'ex-cutart', box);
        if (mine) { const u = $(a.id); if (u) ic.appendChild(art(u, '')); } else ic.textContent = a.emoji || '❔'; el('b', '', box, mine ? (D.role[a.role] ? D.role[a.role].skill : '스킬') + '!' : '꼬마의 한 방!'); setTimeout(() => box.remove(), 780 / S.speed);
      };
      const FXG = { flash: '△', support: '◻', care: '◯' };
      const elemFx = (card, el0, mult, big) => { const n = big ? 5 : 3; for (let i = 0; i < n; i++) { const f = el('i', 'ex-fx ' + el0 + (mult > 1 ? ' adv' : ''), card, mult > 1 ? '✦' : (FXG[el0] || '✦')); f.style.cssText = `left:${15 + Math.random() * 70}%;top:${10 + Math.random() * 60}%;animation-delay:${i * 40 / S.speed}ms;animation-duration:${520 / S.speed}ms`; setTimeout(() => f.remove(), 700 / S.speed); } };
      const shake = () => { r.classList.remove('shake'); void r.offsetWidth; r.classList.add('shake'); setTimeout(() => r.classList.remove('shake'), 300 / S.speed); };
      const play = (ev) => {
        const a = cu(ev.actor.side, ev.actor.i), ac = (ev.actor.side === 'A' ? cardsP : cardsE)[ev.actor.i]; ac.classList.add('act'); setTimeout(() => ac.classList.remove('act'), 260 / S.speed);
        logEl.textContent = `${(a.name || '').replace(/\(.*\)/, '')} · ${KIND[ev.kind]}`;
        if (ev.kind !== 'attack') cutIn(a, ev);          // 스킬 컷인(B4)
        const shown = new Set(ev.hits.slice().sort((x, y) => y.dmg - x.dmg).slice(0, 2));      // 팝업은 동시에 2개까지(가장 큰 타격)
        ev.hits.forEach((h) => { const c = (h.side === 'A' ? cardsP : cardsE)[h.i], tgt = cu(h.side, h.i), big = h.dmg >= tgt.max * 0.28 || ev.kind === 'skill' || ev.kind === 'aoe'; if (shown.has(h)) pop(c, (h.mult > 1 ? '<small>굉장!</small>' : h.mult < 1 ? '<small>약함</small>' : '') + '-' + Math.round(h.dmg), (h.mult > 1 ? 'adv' : h.mult < 1 ? 'dis' : '') + (big ? ' hard' : '')); elemFx(c, a.el, h.mult, big && shown.has(h)); c.classList.add('hit'); setTimeout(() => c.classList.remove('hit'), 220 / S.speed); if (big) shake(); if (h.down) { c.classList.add('fall'); } });
        ev.heals.slice(0, 2).forEach((h) => { const c = (h.side === 'A' ? cardsP : cardsE)[h.i]; pop(c, h.buff ? '↑' : '+' + Math.round(h.amount), 'heal'); });
        hp(); drawReady(); persuadeUI();
      };
      const loop = () => {
        if (!r.isConnected || stopped || finished) return;
        if (boss && !persuaded && !askedOnce && boss.hp > 0 && boss.hp / boss.max <= D.bal.persuadeAt) { persuadeUI(); stopped = true; const cont = UK.btn({ text: '계속 싸우기', cls: 'ghost sm', onclick: () => { cont.remove(); core.release('B', bi); inputs.push([steps, 'r']); stopped = false; setTimeout(loop, 200); } }, pbtn); return; }
        if (steps >= SC.MAX_STEPS) { finish(false); return; } const ev = core.step(); if (!ev) { finish(core.win); return; } steps++; play(ev); if (ev.over) { setTimeout(() => finish(ev.win), 700 / S.speed); return; } setTimeout(loop, 520 / S.speed);
      };
      hp(); drawReady();
      const begin = () => { const pre = D.story.pre && D.story.pre[st.id], fk = st.id === 6 ? 'stage6pre' : 'pre' + st.id; if (pre && !S.flags[fk] && !(navigator.webdriver && !/[?&]story=1/.test(location.search))) { S.flags[fk] = 1; save(); GF.tale.play(pre, r, () => setTimeout(loop, 500), { bg: 'hill' }); } else setTimeout(loop, 700); };
      begin();
      EXP.debug.core = core; EXP.debug.persuade = () => { if (boss && !persuaded) { stopped = true; doPersuade(); } };
      GF.backHook = () => { stopped = true; GF.replace(p.dun ? 'xdun' : 'xmap'); return true; };
    },
  });
  /* ---------------- 동료 모집(뽑기) · 확률 공개 ---------------- */
  GF.screen('xgacha', {
    bare: false,
    enter(r) {
      r.classList.add('uk', 'ex'); GF.bg('field', r); bar(); head(r, G().banner, '랜덤 아이템 포함' + (REL ? '' : ' · ' + G().note)); setTimeout(() => { if (r.isConnected) tipOnce('gacha', r); }, 350);
      const pk = D.units.find((u) => u.pickup), box = el('div', 'ex-banner', r); box.appendChild(art(pk, 'xl')); const tx = el('div', 'ex-btx', box); el('b', '', tx, '픽업 ★5 ' + pk.name); el('small', '', tx, `${D.el[pk.el].family} ${D.el[pk.el].name} · ${D.role[pk.role].skill}`); el('small', '', tx, '★5 확률 2.5% 중 절반이 픽업 · 천장 ' + S.pity.since5 + '/' + G().hard);
      const bar2 = el('div', 'uk-progress gold ex-pity', r); bar2.innerHTML = `<i style="width:${Math.round(S.pity.since5 / G().hard * 100)}%"></i>`;
      const row = el('div', 'ex-prow', r); const b1 = UK.btn({ text: '1회 💎' + G().cost, cls: 'gold', onclick: () => run(1) }, row), b10 = UK.btn({ text: '10회 💎' + G().ten, cls: 'green', onclick: () => run(10) }, row); void b1; void b10;
      UK.btn({ text: '확률 공개', cls: 'sky sm ex-odds', onclick: () => odds(r) }, r); if (!REL) el('div', 'ex-gnote', r, '무상 반짝석으로만 모집해요(슬라이스). 모집 결과는 이 기기에서 계산되고, 정식 서비스에서는 서버가 판정하고 기록해요.');
      const run = async (n) => { let res; try { res = REMOTE ? await pullRemote(n) : pull(n, rng); } catch (e) { UK.toast(e.code === 'insufficient_gems' ? '반짝석이 모자라요. 전투를 깨면 받아요' : '서버에 연결하지 못했어요', r); return; } if (!res) { UK.toast('반짝석이 모자라요. 전투를 깨면 받아요', r); return; } showPull(r, res); };
      back(r, 'xhome');
    },
  });
  function showPull(r, res) {
    const sc = UK.modal({ parent: r, title: '모집 결과', body: '', actions: [] }), sh = sc.querySelector('.uk-sheet'); sh.classList.add('ex-pull'); const g = el('div', 'ex-pgrid', sh);
    res.forEach((x, i) => { const u = $(x.id), c = el('div', 'ex-pc g' + x.grade, g); c.style.animationDelay = i * 0.08 + 's'; c.appendChild(art(u, 'xs')); el('b', '', c, u.name.replace(/\(.*\)/, '')); el('small', '', c, '★'.repeat(x.grade) + (x.isNew ? ' NEW' : ' 조각+' + (x.grade === 5 ? 20 : x.grade === 4 ? 5 : 1))); });
    const a = el('div', 'acts', sh); UK.btn({ text: '확인', cls: 'green', onclick: () => { sc.remove(); GF.replace('xgacha'); } }, a); GF.sfx(res.some((x) => x.grade === 5) ? 'celebrate' : 'star'); if (res.some((x) => x.grade === 5)) try { UK.confetti(sc); } catch (e) { /* 연출 */ }
  }
  function odds(r) {
    const g = G(), sc = UK.modal({ parent: r, title: '확률 공개', body: '', actions: [] }), sh = sc.querySelector('.uk-sheet'); sh.classList.add('ex-odds-sh'); const pool = (gr) => D.units.filter((u) => u.route === 'gacha' && u.grade === gr), pct = (x) => (x * 100).toFixed(2).replace(/\.?0+$/, '') + '%';
    const t = el('div', 'ex-otable', sh); const row = (a, b, c) => el('div', 'ex-orow', t, `<span>${a}</span><span>${b}</span><span>${c}</span>`);
    const E = g.effective, ef = (gr) => (E ? pct(E.grade[gr]) : '-'), eu = (u) => (E ? pct(E.unit[u.id] / 100) : '-');
    row('<b>등급</b>', '<b>기본·실효</b>', '<b>개별(기본 → 실효)</b>');
    row('★5', pct(g.rates.five) + '<br>→ ' + ef(5), pool(5).map((u) => u.name + ' ' + pct(g.rates.five * (u.pickup ? g.pickup.share : (1 - g.pickup.share) / (pool(5).length - 1 || 1))) + ' → ' + eu(u)).join('<br>'));
    row('★4', pct(g.rates.four) + '<br>→ ' + ef(4), pool(4).map((u) => u.name + ' ' + pct(g.rates.four / pool(4).length) + ' → ' + eu(u)).join('<br>'));
    row('★3', pct(g.rates.three) + '<br>→ ' + ef(3), pool(3).map((u) => u.name + ' ' + pct(g.rates.three / pool(3).length) + ' → ' + eu(u)).join('<br>'));
    el('p', 'ex-onote', sh, `· <b>기본</b>=한 회 기본 확률, <b>실효</b>=천장·10회 보장을 모두 넣고 길게 모았을 때의 평균${E ? '(★5 평균 약 ' + E.expected5 + '회)' : ''}<br>· 소프트 천장: ${g.soft + 1}회째부터 ★5 확률이 매 회 +${pct(g.softUp)}<br>· 하드 천장: ${g.hard}회째 ★5 확정(이후 0으로)<br>· 픽업 보장: ★5가 픽업이 아니면 다음 ★5는 픽업 확정<br>· 10회 모집은 ★4 이상 1명 보장 · 중복은 각성 조각으로 바뀜<br>· 지금 ★5까지 ${S.pity.since5}회 · 보장 ${S.pity.guard ? '있음' : '없음'}<br>· <b>랜덤 아이템 포함</b>${REL ? '' : ' · 슬라이스는 무상 반짝석만 쓰고 결제가 없어요'}`);
    UK.btn({ text: '닫기', cls: 'ghost', onclick: () => sc.remove() }, el('div', 'acts', sh));
  }
  /* ---------------- 시작 ---------------- */
  EXP.start = async function (opts) {
    UK.mode('adult');
    await GF.boot(Object.assign({ dataNames: ['chars', 'anchors', 'sounds', 'expedition_slice', 'art_slots'], storeKey: 'gfx:slice:ui:v1', async start() {
      D = GF.data.expedition_slice; D.units.forEach((u) => { UD[u.id] = u; }); S = REMOTE ? fresh() : load(); if (/[?&]seed=(\d+)/.test(location.search)) S.seed = +RegExp.$1; if (REMOTE) await remoteBoot(); GF.tale.init('expedition', null, { kid: false });
      document.getElementById('safe').classList.add('uk'); GF.go('xhome');
      Object.assign(EXP.debug, { S: () => S, D: () => D, reset: () => { S = fresh(); save(); GF.go('xhome'); }, save, pull: (n) => pull(n, rng), remote: () => REMOTE, refresh: async () => { applyProfile(await http('GET', '/profile')); bar(); }, auth: () => AUTH, http: (m, pa, b) => http(m, pa, b), pity: (v) => { Object.assign(S.pity, v); save(); }, gems: (n) => { S.gems = n; save(); bar(); }, gold: (n) => { S.gold = n; save(); bar(); }, kOf, power, fastBattle: (stage, party, seed) => { const st = D.stages.find((x) => x.id === stage); const core = B.create((party || S.party).map((id, i) => defOf(id, i)), st.enemies.map(enemyDef), { seed: seed == null ? stage * 1009 + 3 : seed }); const out = core.run(); return { win: out.win, turns: out.turns, hash: core.hash(out.log), downs: core.A.filter((u) => u.hp <= 0).length }; } });
    } }, opts || {}));
  };
})();
