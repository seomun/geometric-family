/* 세 가족 짝 맞추기 — UI. 규칙 tile-core.js · 생성기 tile-gen.js · 판 data/tile_levels.json · 사연·시즌 data/tile_extra.json · 집 engine/room · 모든 화면은 ui-kit(UK).
   압박 없음: 시간 제한·하트·유료 이어하기 없음. 바구니가 차면 벌 없이 즉시 한 번 더. 되돌리기·섞기는 한 판에 한 번(무료), 힌트는 언제든. 판 종류 6 + 공통 판 4. */
(function () {
  'use strict';
  const el = UK.el, C = TileCore, G = TileGen;
  const TL = (window.TILE = { debug: {} });
  const KEY = 'gf:tile:v1';
  const REW = { 2: 'm_bench', 5: 'm_flowerrow', 8: 'm_jar', 10: 'm_laundry', 13: 'm_garden', 15: 'm_coop', 18: 'm_alley', 20: 'm_persimmon', 25: 'm_pepper', 30: 'm_bucket', 36: 'm_mat', 42: 'm_rooster', 50: 'm_cat', 58: 'm_bike', 66: 'm_chime', 76: 'm_radish', 88: 'm_pumpkin', 100: 'm_duck', 110: 'm_butterfly', 120: 'm_sunflower' };
  const TYPE_TIP = { classic: '같은 그림 세 개를 모아요', pair: '같은 그림 두 개를 모아요', goal: '목표 그림 두 묶음을 모아요', lock: '열쇠 세 개를 지우면 풀려요', narrow: '바구니가 좁아요', trio: '같은 얼굴 세 개를 모아요' };
  const RULE_TXT = [['네모 규칙', '바구니가 8칸으로 넉넉해요', 'nemo'], ['세모 규칙', '반짝 타일은 어떤 그림 대신이든 써요', 'semo'], ['동그라미 규칙', '같은 그림이 바구니에서 정확히 나란히 세 개여야 해요', 'dong']];
  const slow = (ms) => (TL.fast ? 0 : ms);
  /* 타일 그림: 세계관 소품 위주(방 아이템 p_*: 믹스커피·도시락·혈압약·돋보기·부의 봉투…) + 이야기 장마다 상징 타일 3종(k0~k2). 그림 슬롯 GF.slot('tile', 키) 가 있으면 그 그림. 임시: 이모지·방 아이템 그림 */
  const SYM = [['🧱', '벽돌'], ['🌾', '볏짚'], ['🪵', '나무'], ['🥁', '북'], ['🎺', '나팔'], ['🎻', '바이올린'], ['🐦', '까치'], ['🎋', '칠석'], ['🌌', '은하수'], ['🍲', '수프'], ['🪑', '의자'], ['🛏️', '침대'], ['🫘', '콩'], ['🥚', '황금알'], ['🪜', '사다리'], ['👟', '꽃신'], ['🐸', '두꺼비'], ['🪣', '독'], ['@art.gourd', '박'], ['@art.swallow', '제비'], ['🌾', '볏단'], ['🐌', '우렁'], ['🍚', '밥'], ['🏺', '항아리'], ['🪓@gold', '금도끼'], ['🪓@silver', '은도끼'], ['🪓', '쇠도끼'], ['🌾', '곡식'], ['🫙', '곳간'], ['🎻', '노래'], ['🌙', '달'], ['☀️', '해'], ['🪢', '동아줄'], ['🥕', '당근'], ['🏁', '결승선'], ['🐢', '거북이']];   // 장 1~12 × 3종
  const WORLD = ['p_mix', 'p_lunch', 'p_rice', 'p_remote', 'p_points', 'p_glass', 'p_kimchi', 'p_pill', 'p_photo', 'p_tea', 'p_bagt', 'p_pass', 'p_globe', 'p_ramen', 'p_phone', 'p_pair', 'p_book', 'p_flower', 'p_label', 'p_env', 'p_wreath', 'p_ra', 'p_vio', 'p_chair', 'p_clock', 's_songpyeon', 'k_ch4', 'k_ch12'];   // 세계관 소품(아이템 id)
  const FACE = ['nemo_dad.joy', 'nemo_mom.joy', 'husband.joy', 'wife.joy', 'dong_dad.joy', 'baby.joy'];   // 세 가족 얼굴 타일(기존 캐릭터 PNG 얼굴 크롭)
  const EMO_FX = { gold: 'filter:sepia(1) saturate(5) hue-rotate(-12deg) brightness(1.1)', silver: 'filter:grayscale(1) brightness(1.25) contrast(1.1)' };
  /** 판의 그림 종류 k0.. → 소품 정의: k0~k2 = 이야기 상징, 그다음은 세계관 소품 */
  function def(kind) {
    if (kind === 'key') return { e: '🔑', key: 'key' };
    const n = +kind.slice(1), ch = ((window.TILE && TL._ch) || 1) - 1;
    if (n < 3) { const s = SYM[(ch % 12) * 3 + n]; return { e: s[0], name: s[1], key: 'sym:' + (ch % 12) + ':' + n }; }
    const id = WORLD[(n - 3 + ch * 5) % WORLD.length]; return { item: id, key: 'item:' + id };
  }
  function art(kind, parent) {
    const d = el('div', 'tl-art', parent);
    if (kind[0] === 'f') { d.classList.add('face'); d.style.backgroundImage = 'url("' + GF.src(FACE[+kind.slice(1)] || FACE[0]) + '")'; return d; }
    if (kind === 'wild') { d.textContent = '✨'; d.classList.add('wild'); return d; }
    const df = def(kind), sl = GF.slot('tile', df.key);
    if (sl) { const i = el('img', '', d); i.src = sl; return d; }
    if (df.item) { const it = Room.item(df.item); if (it) { const i = el('img', '', d); i.src = Room.src(it, it.colors[0]); return d; } d.textContent = '⭐'; return d; }
    if (df.e[0] === '@') { const i = GF.img(df.e.slice(1)); d.appendChild(i); i.style.cssText = 'width:100%;height:100%;object-fit:contain'; return d; }
    const [em, fx] = df.e.split('@'); d.textContent = em; if (fx) d.style.cssText += ';' + EMO_FX[fx]; return d;
  }
  /* ---------------- 저장 ---------------- */
  const blank = () => ({ v: 1, stars: {}, last: 1, daily: { date: '', done: 0 }, shards: 0, seasonDone: {}, trio: {}, tips: {} });
  let SV = (() => { try { const x = JSON.parse(localStorage.getItem(KEY)); if (x && x.v >= 1) return Object.assign(blank(), x); } catch (e) {} return blank(); })();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(SV)); } catch (e) {} };
  const bonusShard = () => { SV.shards++; if (SV.shards % X.shardsPerItem === 0) { const it = X.dailyItems.find((id) => !Room.has(id)); if (it) Room.grant(it); } save(); GF.refreshBar(); };   // 오늘의 한 판 조각 한 번 더(보상형)
  const totalStars = () => Object.values(SV.stars).reduce((a, b) => a + b, 0);
  const unlocked = (n) => n === 1 || SV.stars[n - 1] > 0 || !!TL.unlockAll;
  let D, X;
  const now = () => new Date(), pad = (n) => String(n).padStart(2, '0'), today = () => { const d = now(); return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()); };
  const dayNum = () => { const d = now(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000); };
  GF.home = () => { GF.stack = []; GF.go('thome'); }; GF.home2 = GF.home;
  GF.pill = () => UK.icon('star') + '<span>' + totalStars() + '</span>';
  const bar = () => GF.refreshBar && GF.refreshBar();
  const DAILY = ['classic', 'goal', 'narrow', 'trio', 'lock', 'pair', 'classic'];
  function dailyLevelAt(d, dn) { dn = dn == null ? dayNum() : dn; const L = G.make(8 + (d % 12), d, { type: DAILY[dn % 7], tag: 'growth' }); if (L) { L.id = 'daily'; L.kind = 'daily'; } return L; }
  function dailyLevel() { return dailyLevelAt(+today()); }
  const seasonNow = () => X.seasons.filter((s) => s.months.includes(now().getMonth() + 1) || TL.season === s.id);
  const seasonKey = (s) => s.id + ':' + now().getFullYear();
  function seasonLevel(s) { const L = G.make(s.n, s.seed + now().getFullYear(), { type: s.type, tag: 'growth' }); if (L) { L.id = 'season:' + s.id; L.kind = 'season'; L.season = s; } return L; }
  function trioLevels(n) { return [0, 1, 2].map((rule) => { const L = G.make(n, n * 6151 + 33, { type: 'classic', tag: 'growth', rule, noGreedy: true }); if (L) { L.id = 'trio:' + n + ':' + rule; L.kind = 'trio'; L.rule = rule; } return L; }); }

  /* ---------------- 홈 ---------------- */
  GF.screen('thome', {
    bare: false,
    enter(r) {
      r.classList.add('uk', 'tl'); GF.bg('indoor2', r); bar();
      const tt = el('div', 'tl-ttl', r, '<div class="uk-title">세 가족 짝 맞추기</div><div class="tl-sub">같은 그림 세 개를 모아요</div>'); const pl = Room.mePlate(tt); if (pl) { tt.querySelector('.tl-sub').style.display = 'none'; pl.style.marginTop = '6px'; }
      GF.hero(r, 'tile'); const fam = el('div', 'tl-fam', r); ['nemo_dad.joy', 'wife.joy', 'dong_dad.joy'].forEach((id) => fam.appendChild(GF.img(id)));
      const last = Math.min(D.levels.length, Math.max(1, SV.last || 1));
      const cont = UK.btn({ text: '이어서 하기 · 레벨 ' + last, icon: 'play', cls: 'block', onclick: () => GF.go('tplay', { n: last }) }, el('div', 'tl-btns', r));
      if (!Object.keys(SV.stars).length) setTimeout(() => { if (cont.isConnected) UK.finger(r, cont); }, 900);
      const g = el('div', 'tl-grid', r), dailyDone = SV.daily.date === today() && SV.daily.done;
      const b = (t, icon, cls, fn, badge) => { const x = UK.btn({ text: t, icon, cls, onclick: fn }, g); if (badge) el('i', 'tl-badge', x, badge); return x; };
      b('레벨', 'shapes', 'sky', () => GF.go('tlevels'));
      b('오늘의 한 판', 'gift', 'gold', () => { const L = dailyLevel(); if (L) GF.go('tplay', { level: L }); }, dailyDone ? '✔' : '1');
      b('세 가족 판', 'heart', 'pink', () => GF.go('ttrio'));
      b('우리 집', 'home', 'dong', () => GF.go('thouse'));
      const ss = seasonNow(); if (ss.length) { const s = ss.find((x) => !SV.seasonDone[seasonKey(x)]) || ss[0], done = SV.seasonDone[seasonKey(s)]; UK.btn({ text: s.title, icon: 'star', cls: 'block ' + (done ? 'gray' : 'danger'), onclick: () => { const L = seasonLevel(s); if (L) GF.go('tplay', { level: L }); } }, el('div', 'tl-season', r)); }
      el('div', 'tl-foot', r, '별 ' + totalStars() + ' · 마당 소품 ' + Room.owned().filter((id) => (Room.item(id) || {}).set === 'yardlife').length + '/' + Object.keys(REW).length);
    },
  });
  GF.screen('tlevels', {
    bare: false,
    enter(r) {
      r.classList.add('uk', 'tl'); GF.bg('indoor', r); bar(); const sc = el('div', 'tl-scroll', r); GF.extras.retryBanner(sc, SV.stars, (n) => GF.go('tplay', { n }));
      D.chapters.forEach((name, ci) => {
        const ls = D.levels.filter((l) => l.chapter === ci + 1); if (!ls.length) return; const got = ls.reduce((a, l) => a + (SV.stars[l.id] || 0), 0);
        el('div', 'tl-ch', sc, `<b>${ci + 1}장 · ${name}</b><span>★ ${got}/${ls.length * 3}</span>`); GF.tale.strip(sc, ci + 1, ls.filter((l) => (SV.stars[l.id] || 0) > 0).length, ls.length, !unlocked(ls[0].id)); const g = el('div', 'tl-lv', sc);
        ls.forEach((l) => { const open = unlocked(l.id), st = SV.stars[l.id] || 0, b = el('button', 'tl-l' + (open ? '' : ' off') + (l.tag === 'rest' ? ' rest' : '') + (l.type !== 'classic' ? ' sp2' : ''), g, `<span>${l.id}</span><i>${'★'.repeat(st)}${'☆'.repeat(3 - st)}</i>`); if (l.type !== 'classic') b.title = D.types[l.type]; b.onclick = () => { if (!open) { GF.sfx('hmm'); UK.toast('앞 레벨을 먼저 깨 보세요', r); return; } GF.sfx('pick'); GF.go('tplay', { n: l.id }); }; });
      });
      setTimeout(() => { const last = [...sc.querySelectorAll('.tl-l')].filter((x) => !x.classList.contains('off')).pop(); last && last.scrollIntoView({ block: 'center' }); }, 30);
    },
  });
  GF.screen('ttrio', {
    bare: false,
    enter(r) {
      r.classList.add('uk', 'tl'); GF.bg('indoor2', r); bar(); const n = Math.max(6, Math.min(60, (SV.last || 1) + 4)), Ls = trioLevels(n);
      el('div', 'tl-ttl', r, '<div class="uk-title" style="font-size:30px">세 가족 판</div><div class="tl-sub">같은 판, 세 가지 규칙</div>').style.top = '84px';
      el('div', 'tl-line', r, '모든 판이 한 가족의 규칙을 따라요. 어느 쪽이 편한가요?').style.top = '172px';
      const box = el('div', 'tl-trio', r); box.style.top = '226px';
      Ls.forEach((L, i) => { const st = SV.trio[n + ':' + i] || 0, b = UK.btn({ text: RULE_TXT[i][0] + (st ? '  ' + '★'.repeat(st) : ''), cls: RULE_TXT[i][2] + ' block', onclick: () => { if (L) GF.go('tplay', { level: L }); } }, box); el('small', '', b, RULE_TXT[i][1]); });
    },
  });

  /* ---------------- 플레이 ---------------- */
  GF.screen('tplay', {
    bare: false,
    enter(r, p) {
      r.classList.add('uk', 'tl'); GF.bg('indoor2', r); bar();
      const LV = p.level || D.levels.find((l) => l.id === p.n) || D.levels[0]; if (!p.level) { SV.last = LV.id; save(); }
      const say = (msg) => { const t = UK.toast(msg, r); t.style.cssText += ';top:146px;left:10px;right:10px;height:40px;display:flex;align-items:center;justify-content:center;padding:0 12px;font-size:calc(18px * var(--uk-fs-k, 1));white-space:nowrap;overflow:hidden;z-index:30;pointer-events:none'; return t; };
      const title = LV.kind === 'daily' ? '오늘의 한 판' : LV.kind === 'season' ? LV.season.title : LV.kind === 'trio' ? ['네모', '세모', '동그라미'][LV.rule] + ' 규칙 판' : '레벨 ' + LV.id;
      el('div', 'tl-hd', r, `<b>${title}</b><span>${LV.kind || GF.state.settings.big ? '' : D.chapters[LV.chapter - 1]}${LV.tag === 'rest' ? ' · 쉬어 가기' : ''}</span>` + (LV.type !== 'classic' ? `<em class="tl-type">${D.types[LV.type]}</em>` : ''));
      TL._ch = typeof LV.chapter === 'number' ? LV.chapter : 1; let S = C.newGame(LV), hist = [], busy = false, hintI = -1, streak = 0, maxTray = 0, rankRes = null; const gained = [], rng = G.mulberry(LV.id === 'daily' ? 5 : (typeof LV.id === 'number' ? LV.id : 9) * 13 + 7);
      const goals = el('div', 'tl-goals', r), boardW = el('div', 'tl-boardw', r), board = el('div', 'tl-board', boardW), trayW = el('div', 'tl-trayw', r), btns = el('div', 'tl-btns2', r), tip = el('div', 'tl-tip', r);
      const u = 27; board.style.width = G.GW * u + 'px'; board.style.height = G.GH * u + 'px';   // 타일 한 변 = 54(화면 폭 360 기준 15%, 실제 기기에서 56dp 안팎 이상)
      const bu = UK.btn({ text: '되돌리기', icon: 'replay', cls: 'ghost sm', onclick: undo }, btns), bs = UK.btn({ text: '섞기', icon: 'shapes', cls: 'ghost sm', onclick: doShuffle }, btns); UK.btn({ text: '힌트', icon: 'info', cls: 'sky sm', onclick: hint }, btns);
      const tiles = LV.tiles.map((t, i) => { const d = el('button', 'tl-t', board); d.dataset.i = i; d.style.cssText = `left:${t.x * u}px;top:${t.y * u}px;width:${2 * u}px;height:${2 * u}px;z-index:${t.z * 40 + (t.y | 0)}`; d.setAttribute('aria-label', '타일 ' + (i + 1)); d.onclick = () => tap(i); return d; });
      function goalChips() {
        goals.innerHTML = ''; const ch = el('div', 'tl-goal' + (S.won ? ' ok' : ''), goals);
        if (LV.goal.t === 'goal') { LV.goal.kinds.forEach((k) => { const w = el('span', 'tl-gi' + ((S.cleared[k] || 0) >= 1 ? ' ok' : ''), ch); art(k, w); }); }
        else el('span', '', ch, '남은 타일 ' + C.left(S));
        if (LV.type === 'lock') el('span', 'uk-chip', goals, '🔑 ' + (S.keyDone ? '풀림' : '3개 지우기'));
        el('div', 'tl-bar', goals, `<i style="width:${Math.round((1 - C.left(S) / LV.tiles.length) * 100)}%"></i>`);
      }
      function drawTray() {
        trayW.innerHTML = ''; const per = S.cap > 6 ? Math.ceil(S.cap / 2) : S.cap, tray = el('div', 'tl-tray', trayW), w = 54; tray.style.width = per * (w + 3) + 'px'; trayW.style.height = (S.cap > 6 ? 2 * (w + 3) + 8 : w + 14) + 'px';   // 바구니 칸도 타일과 같은 크기(칸이 많으면 두 줄)
        for (let k = 0; k < S.cap; k++) { const sl = el('div', 'tl-slot' + (S.tray[k] ? ' on' : ''), tray); sl.style.cssText = `width:${w}px;height:${w}px`; if (S.tray[k]) { const q = art(S.tray[k].kind, sl); if (k === S.tray.length - 1 && TL._new) q.classList.add('new'); } }
        if (S.tray.length >= S.cap - 1 && !S.won) trayW.classList.add('warn'); else trayW.classList.remove('warn');
      }
      function draw() {
        if (!LV.kind && GF.extras && !S.won) GF.extras.resumeSave(S, LV.id);
        LV.tiles.forEach((t, i) => {
          const d = tiles[i]; d.style.display = S.gone[i] ? 'none' : ''; if (S.gone[i]) return; const free = C.isFree(S, i); d.className = 'tl-t' + (free ? '' : ' cov') + (S.wildOf[i] ? ' wild' : '') + (hintI === i ? ' hint' : '') + (t.lock && !S.keyDone ? ' lock' : ''); d.innerHTML = ''; art(S.wildOf[i] ? 'wild' : S.kinds[i], d); if (S.wildOf[i]) art(S.kinds[i], d).classList.add('under'); if (t.lock && !S.keyDone) el('i', 'lk', d, '🔒');
        });
        drawTray(); goalChips(); bu.style.opacity = hist.length && S.used.undo < 1 ? 1 : 0.4; bs.style.opacity = S.used.shuffle < 1 && !S.won ? 1 : 0.4;
      }
      function tap(i) {
        if (busy || S.won) return; if (!C.isFree(S, i)) { GF.sfx('hmm'); tiles[i].classList.add('shake'); setTimeout(() => tiles[i] && tiles[i].classList.remove('shake'), 400); return; }
        hist.push(C.clone(S)); tip.style.display = 'none'; hintI = -1; TL._new = true; const ev = C.press(S, i); maxTray = Math.max(maxTray, S.tray.length); GF.sfx('drop'); draw();
        if (ev.cleared.length) {
          streak++; const st = [0, 2, 4, 7, 9, 12, 14, 16][Math.min(streak - 1, 7)]; setTimeout(() => { GF.sfx('ok', { st }); try { const rc = trayW.getBoundingClientRect(), sr = r.getBoundingClientRect(), k = sr.width / 360; GF.burst(document.getElementById('safe'), (rc.left + rc.width / 2 - sr.left) / k, (rc.top - sr.top) / k, 12); } catch (e) {} if (streak >= 2) say('이어서 ×' + streak); }, slow(120));
        } else streak = 0;
        if (S.won) { busy = true; setTimeout(finish, slow(700)); } else if (ev.lose || C.lost(S)) { busy = true; setTimeout(lose, slow(500)); }
      }
      function offerUndo() { return GF.ads && GF.ads.offer({ placement: 'undo', ask: '되돌리기 1번 더', parent: r, onReward: () => { S.used.undo = 0; say('한 번 더 되돌릴 수 있어요'); draw(); } }); }
      function offerShuffle() { return GF.ads && GF.ads.offer({ placement: 'extra', ask: '섞기 1번 더', parent: r, onReward: () => { S.used.shuffle = 0; doShuffle(); } }); }
      function undo() { if (busy || !hist.length || S.used.undo >= 1) { if (S.used.undo >= 1 && !offerUndo()) say('되돌리기는 한 판 한 번'); return; } const u0 = S.used.undo + 1, sh = S.used.shuffle, hn = S.used.hint; S = hist.pop(); S.used.undo = u0; S.used.shuffle = sh; S.used.hint = hn; hist = []; hintI = -1; streak = 0; TL._new = false; GF.sfx('tap'); draw(); }
      function doShuffle() { if (busy || S.won || S.used.shuffle >= 1) { if (S.used.shuffle >= 1 && !offerShuffle()) say('섞기는 한 판 한 번'); return; } if (C.shuffle(S, rng)) { S.used.shuffle++; hist = []; hintI = -1; GF.sfx('star'); draw(); say('다시 섞었어요'); } }
      function hint() { if (busy || S.won) return; const i = C.hintTile(S); if (i < 0) return; S.used.hint++; hintI = i; GF.sfx('pick'); draw(); setTimeout(() => { if (hintI === i) { hintI = -1; if (board.isConnected) draw(); } }, slow(2600)); }
      function result(stars) {
        if (rankRes && GF.rank) { GF.rank.resultBoard = 'daily'; const rr = rankRes; rankRes = null; setTimeout(() => GF.rank.announce(rr, r), slow(1300)); }
        if (LV.kind === 'daily' && GF.ads) GF.ads.resultHook = { placement: 'daily2x', ask: '오늘의 조각 한 번 더', onReward: bonusShard };
        const tools = S.used.undo + S.used.shuffle + S.used.hint, chips = [{ icon: 'star', text: '★ ' + stars }, { icon: 'info', text: '도움 ' + tools + '번' }]; gained.forEach((id) => chips.push({ icon: 'home', text: (Room.item(id) || {}).name || id }));
        const next = !LV.kind && D.levels.find((l) => l.id === LV.id + 1);
        UK.result({ title: '클리어!', stars, chips, parent: r, onNext: next ? () => GF.replace('tplay', { n: next.id }) : null, nextText: '다음 레벨', onRetry: () => GF.replace('tplay', LV.kind ? { level: LV } : { n: LV.id }), retryText: '다시', onHome: () => GF.home2(), homeText: '처음으로' });
      }
      function finish() {
        busy = true; GF.extras && GF.extras.resumeClear(); const tools = S.used.undo + S.used.shuffle + S.used.hint, st = tools === 0 ? 3 : tools <= 2 ? 2 : 1;
        if (!LV.kind) { SV.stars[LV.id] = Math.max(SV.stars[LV.id] || 0, st); if (REW[LV.id] && Room.grant(REW[LV.id])) gained.push(REW[LV.id]); }
        else if (LV.kind === 'daily') { if (SV.daily.date !== today() || !SV.daily.done) { SV.daily = { date: today(), done: 1 }; SV.shards++; if (SV.shards % X.shardsPerItem === 0) { const it = X.dailyItems.find((id) => !Room.has(id)); if (it && Room.grant(it)) gained.push(it); } } }
        else if (LV.kind === 'season') { if (!SV.seasonDone[seasonKey(LV.season)]) { SV.seasonDone[seasonKey(LV.season)] = 1; if (LV.season.reward && Room.grant(LV.season.reward)) gained.push(LV.season.reward); } }
        else if (LV.kind === 'trio') { const key = LV.id.split(':').slice(1).join(':'); SV.trio[key] = Math.max(SV.trio[key] || 0, st); }
        if (LV.kind === 'daily' && GF.rank && GF.rank.ready) { rankRes = GF.rank.record('daily', GF.rank.clamp(600 + 110 * (S.cap - maxTray) - 60 * (S.used.undo + S.used.shuffle + S.used.hint) - 150 * (GF.rank.attempts('daily') - 1))); GF.rank.clearTries('daily'); }
        save(); GF.refreshBar(); GF.extras && GF.extras.check(); GF.ads && GF.ads.noteLevelDone(); GF.sfx('star');
        setTimeout(() => {
          GF.tale.done(r, LV, () => result(st));   // 클리어 한마디 · 승전결 컷(장 끝이면 결, 마지막 장이면 엔딩)
        }, slow(650));
      }
      function lose() { busy = true; GF.extras && GF.extras.resumeClear(); if (LV.kind === 'daily' && GF.rank) GF.rank.noteTry('daily'); say('가득 찼어요! 한 번 더'); GF.sfx('hmm'); setTimeout(() => GF.replace('tplay', LV.kind ? { level: LV } : { n: LV.id }), slow(900)); }
      TL.debug.adOffer = () => offerUndo(); TL.debug.level = () => LV; TL.debug.state = () => S; TL.debug.press = (i) => tap(i); TL.debug.undo = undo; TL.debug.shuffle = doShuffle; TL.debug.hint = hint; TL.debug.busy = () => busy; TL.debug.tiles = () => tiles;
      if (!LV.kind && GF.extras) GF.extras.resumeLoad(S, LV.id);
      draw();
      const t0 = TYPE_TIP[LV.type]; if (LV.id <= 2 && !LV.kind) { tip.style.display = 'block'; tip.textContent = LV.id === 1 ? '눌러서 바구니에 모아요' : '같은 그림이 모이면 톡!'; } else if (t0 && !SV.tips[LV.type]) { tip.style.display = 'block'; tip.textContent = t0; SV.tips[LV.type] = 1; save(); } else tip.style.display = 'none';
      if (tip.style.display === 'block') setTimeout(() => { tip.style.display = 'none'; }, slow(3600));
      GF.tale.level(r, LV);
      if (LV.id <= 2 && !LV.kind) setTimeout(() => { const i = LV.solution[0], d = tiles[i]; if (d && d.isConnected && !hist.length) UK.finger(r, d, { tap: true, ms: 6000 }); }, slow(1300));   // 처음 두 판: 눌러도 되는 타일 하나를 손가락이 알려 준다
    },
  });
  GF.screen('thouse', {
    bare: false,
    enter(r) { r.classList.add('uk', 'tl'); GF.bg('indoor', r); bar(); const sc = el('div', 'tl-scroll', r); sc.style.top = '70px'; Room.house(sc, { room: 'yard' }); },
  });
  TL.start = async function (opts) {
    UK.mode('adult');
    await GF.boot(Object.assign({ dataNames: ['chars', 'anchors', 'sounds', 'tile_levels', 'tile_extra', 'story_tile', 'maps/tile', 'room_items', 'art_slots'], storeKey: 'gf:tile:ui:v1', async start() {
      D = GF.data.tile_levels; X = GF.data.tile_extra; GF.saga.init('tile', GF.data['maps/tile']); GF.tale.init('tile', GF.data.story_tile, { kid: false });
      Room.init({ data: GF.data.room_items, game: 'tile', mode: 'adult', autoPlace: true, store: Room.sharedStore('gf:house:adult:v1'), charSrc: (id) => GF.src(id), slot: (k, id) => GF.slot(k, id) });
      GF.rank.init({ app: 'tile', boards: { daily: { title: '오늘의 한 판', levelAt: (d, dn) => dailyLevelAt(d, dn), bot: (L, rule, rng, eps) => { let r = C.botPlay(L, rng, eps, rule), pen = 0; if (!r.won && rule === 2) { r = C.botPlay(L, rng, eps, -1); pen = 150; }   // 동그라미 규칙이 안 풀리면 한 번 평범하게 다시
          return { won: r.won, score: GF.rank.clamp(600 + 110 * (r.cap - r.maxTray) - pen) }; } } } });
      GF.extras.init(Object.assign({ app: 'tile', kid: false, rewardSet: 'yardlife', resetTips: () => { SV.tips = {}; SV.intro = 0; save(); }, reset: () => { SV = blank(); save(); } }, GF.extras.levelApp({ SV: () => SV, total: 120, roomSet: 'yardlife', itemTotal: 20, icon: '🧩' })));
      document.getElementById('safe').classList.add('uk'); GF.go('thome');
      TL.debug.D = () => D; TL.debug.SV = () => SV; TL.debug.reset = () => { SV = blank(); save(); }; TL.debug.dailyLevel = dailyLevel; TL.debug.seasonLevel = seasonLevel; TL.debug.trioLevels = trioLevels; TL.debug.X = () => X; TL.debug.REW = REW;
    } }, opts || {}));
  };
})();
