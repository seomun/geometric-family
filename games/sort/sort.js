/* 정리의 달인 — UI. 규칙 sort-core.js · 생성기 sort-gen.js · 판 data/sort_levels.json · 사연·시즌 data/sort_extra.json · 집 engine/room · 모든 화면은 ui-kit(UK).
   압박 없음: 시간 제한·하트·유료 이어하기 없음. 되돌리기 한 판 3번·칸 하나 더 1번(무료), 힌트는 언제든, 「다시」로 처음부터. 판 종류 6 + 공통 판 4. */
(function () {
  'use strict';
  const el = UK.el, C = SortCore, G = SortGen;
  const SR = (window.SORT = { debug: {} });
  const KEY = 'gf:sort:v1';
  const REW = { 2: 'u_box', 4: 'u_basket', 6: 'u_label', 8: 'u_shoerack', 10: 'u_coffee', 12: 'u_shelf', 14: 'u_drawer', 16: 'u_socks', 18: 'u_fridge', 20: 'u_eggtray', 25: 'u_hanger', 30: 'u_closet', 36: 'u_crate', 42: 'u_umbrella', 50: 'u_pill', 58: 'u_bagrack', 66: 'u_toybox', 78: 'u_env', 90: 'u_sidedish', 100: 'u_cart' };
  const TYPE_TIP = { pair: '같은 그림을 두 칸에 나눠 담아요', sort: '같은 그림끼리 한 칸에 모아요', limit: '칸마다 들어가는 수가 달라요', locked: '한 칸을 채우면 자물쇠가 풀려요', hidden: '아래 물건은 옮기면 보여요', family: '가족끼리 한 칸에 담아요' };
  const RULE_TXT = [['네모 규칙', '빈 칸이 하나 더 있어요', 'nemo'], ['세모 규칙', '반짝이는 물건은 어떤 그림 위에도 얹어요', 'semo'], ['동그라미 규칙', '같은 그림은 한꺼번에 옮겨져요', 'dong']];
  const slow = (ms) => (SR.fast ? 0 : ms);
  const SYM = [['🧱', '벽돌'], ['🌾', '볏짚'], ['🪵', '나무'], ['🥁', '북'], ['🎺', '나팔'], ['🎻', '바이올린'], ['🐦', '까치'], ['🎋', '칠석'], ['🌌', '은하수'], ['🍲', '수프'], ['🪑', '의자'], ['🛏️', '침대'], ['🫘', '콩'], ['🥚', '황금알'], ['🪜', '사다리'], ['👟', '꽃신'], ['🐸', '두꺼비'], ['🪣', '독'], ['@art.gourd', '박'], ['@art.swallow', '제비'], ['🌾', '볏단'], ['🐌', '우렁'], ['🍚', '밥'], ['🏺', '항아리'], ['🪓@gold', '금도끼'], ['🪓@silver', '은도끼'], ['🪓', '쇠도끼'], ['🌾', '곡식'], ['🫙', '곳간'], ['🎻', '노래'], ['🌙', '달'], ['☀️', '해'], ['🪢', '동아줄'], ['🥕', '당근'], ['🏁', '결승선'], ['🐢', '거북이']];
  const FACE = ['nemo_dad.joy', 'nemo_mom.joy', 'husband.joy', 'wife.joy', 'dong_dad.joy', 'baby.joy'];
  const EMN = { '👟': 'shoes', '🧦': 'socks', '👕': 'shirt', '🥚': 'egg', '🍎': 'apple', '🥕': 'carrot', '🧅': 'onion', '🧴': 'lotion', '🧸': 'toy', '🥫': 'can', '🍶': 'bottle', '🧃': 'juice', '🥛': 'milk', '👞': 'dress', '🧤': 'glove', '🧣': 'scarf', '🎒': 'bag', '🔑': 'key', '🍋': 'lemon', '🥔': 'potato' };
  const EMO_FX = { gold: 'filter:sepia(1) saturate(5) hue-rotate(-12deg) brightness(1.1)', silver: 'filter:grayscale(1) brightness(1.25) contrast(1.1)' };
  /** 그림 키 → 그려 넣기. 슬롯 GF.slot('sort', 키)가 있으면 그 그림, 없으면 임시 이모지·방 아이템 */
  function art(key, parent, sz) {
    const d = el('div', 'sr-art', parent); if (sz) d.style.cssText = `width:${sz}px;height:${sz}px;font-size:${Math.round(sz * 0.8)}px`; const [t, a, b] = key.split(':');
    const sk = t === 'w' ? 'item:' + a : t === 'e' ? 'e:' + (EMN[a] || 'q') : t === 's' ? 'sym:' + a + ':' + b : 'face:' + a, sl = GF.slot('sort', sk);
    if (sl) { const i = el('img', '', d); i.src = sl; return d; }
    if (t === 'f') { d.classList.add('face'); d.style.backgroundImage = 'url("' + GF.src(FACE[+a] || FACE[0]) + '")'; return d; }
    if (t === 'w') { const it = Room.item(a); if (it) { const i = el('img', '', d); i.src = Room.src(it, it.colors[0]); } else d.textContent = '⭐'; return d; }
    if (t === 's') { const s = SYM[(+a % 12) * 3 + +b]; if (s[0][0] === '@') { const i = GF.img(s[0].slice(1)); d.appendChild(i); i.style.cssText = 'width:100%;height:100%;object-fit:contain'; return d; } const [em, fx] = s[0].split('@'); d.textContent = em; if (fx) d.style.cssText += ';' + EMO_FX[fx]; return d; }
    d.textContent = a; return d;
  }
  /* ---------------- 저장 ---------------- */
  const blank = () => ({ v: 1, stars: {}, last: 1, daily: { date: '', done: 0 }, shards: 0, seasonDone: {}, trio: {}, tips: {} });
  let SV = (() => { try { const x = JSON.parse(localStorage.getItem(KEY)); if (x && x.v >= 1) return Object.assign(blank(), x); } catch (e) {} return blank(); })();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(SV)); } catch (e) {} };
  const totalStars = () => Object.values(SV.stars).reduce((a, b) => a + b, 0);
  const unlocked = (n) => n === 1 || SV.stars[n - 1] > 0 || !!SR.unlockAll;
  let D, X;
  const now = () => new Date(), pad = (n) => String(n).padStart(2, '0'), today = () => { const d = now(); return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()); };
  const dayNum = () => { const d = now(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000); };
  GF.home = () => { GF.stack = []; GF.go('shome'); }; GF.home2 = GF.home;
  GF.pill = () => UK.icon('star') + '<span>' + totalStars() + '</span>';
  const bar = () => GF.refreshBar && GF.refreshBar();
  const DAILY = ['sort', 'pair', 'hidden', 'family', 'locked', 'limit', 'pair'];
  const TOT = () => (D && D.total) || 120;
  function dailyLevel() { const d = +today(), L = G.make(8 + (d % 12), d, { type: DAILY[dayNum() % 7], tag: 'growth', total: TOT() }); if (L) { L.id = 'daily'; L.kind = 'daily'; } return L; }
  const seasonNow = () => X.seasons.filter((s) => s.months.includes(now().getMonth() + 1) || SR.season === s.id);
  const seasonKey = (s) => s.id + ':' + now().getFullYear();
  function seasonLevel(s) { const L = G.make(s.n, s.seed + now().getFullYear(), { type: s.type, tag: 'growth', total: TOT() }); if (L) { L.id = 'season:' + s.id; L.kind = 'season'; L.season = s; } return L; }
  function trioLevels(n) { return [0, 1, 2].map((rule) => { const L = G.make(n, n * 6151 + 33, { type: 'sort', tag: 'growth', rule, noGreedy: true, total: TOT() }); if (L) { L.id = 'trio:' + n + ':' + rule; L.kind = 'trio'; L.rule = rule; } return L; }); }

  /* ---------------- 홈 ---------------- */
  GF.screen('shome', {
    bare: false,
    enter(r) {
      r.classList.add('uk', 'sr'); GF.bg('indoor2', r); bar();
      const tt = el('div', 'sr-ttl', r, '<div class="uk-title">정리의 달인</div><div class="sr-sub">뒤섞인 물건을 종류별로 정리해요</div>'); const pl = Room.mePlate(tt); if (pl) { tt.querySelector('.sr-sub').style.display = 'none'; pl.style.marginTop = '6px'; }
      GF.hero(r, 'sort'); const fam = el('div', 'sr-fam', r); ['nemo_dad.joy', 'wife.joy', 'dong_dad.joy'].forEach((id) => fam.appendChild(GF.img(id)));
      const last = Math.min(D.levels.length, Math.max(1, SV.last || 1));
      const cont = UK.btn({ text: '이어서 하기 · 레벨 ' + last, icon: 'play', cls: 'block', onclick: () => GF.go('splay', { n: last }) }, el('div', 'sr-btns', r));
      if (!Object.keys(SV.stars).length) setTimeout(() => { if (cont.isConnected) UK.finger(r, cont); }, 900);
      const g = el('div', 'sr-grid', r), dailyDone = SV.daily.date === today() && SV.daily.done;
      const b = (t, icon, cls, fn, badge) => { const x = UK.btn({ text: t, icon, cls, onclick: fn }, g); if (badge) el('i', 'sr-badge', x, badge); return x; };
      b('레벨', 'shapes', 'sky', () => GF.go('slevels'));
      b('오늘의 한 판', 'gift', 'gold', () => { const L = dailyLevel(); if (L) GF.go('splay', { level: L }); }, dailyDone ? '✔' : '1');
      b('세 가족 판', 'heart', 'pink', () => GF.go('strio'));
      b('우리 집', 'home', 'dong', () => GF.go('shouse'));
      const ss = seasonNow(); if (ss.length) { const s = ss.find((x) => !SV.seasonDone[seasonKey(x)]) || ss[0], done = SV.seasonDone[seasonKey(s)]; UK.btn({ text: s.title, icon: 'star', cls: 'block ' + (done ? 'gray' : 'danger'), onclick: () => { const L = seasonLevel(s); if (L) GF.go('splay', { level: L }); } }, el('div', 'sr-season', r)); }
      el('div', 'sr-foot', r, '별 ' + totalStars() + ' · 수납 소품 ' + Room.owned().filter((id) => (Room.item(id) || {}).set === 'storage').length + '/' + Object.keys(REW).length);
    },
  });
  GF.screen('slevels', {
    bare: false,
    enter(r) {
      r.classList.add('uk', 'sr'); GF.bg('indoor', r); bar(); const sc = el('div', 'sr-scroll', r); GF.extras.retryBanner(sc, SV.stars, (n) => GF.go('splay', { n }));
      D.chapters.forEach((name, ci) => {
        const ls = D.levels.filter((l) => l.chapter === ci + 1); if (!ls.length) return; const got = ls.reduce((a, l) => a + (SV.stars[l.id] || 0), 0);
        el('div', 'sr-ch', sc, `<b>${ci + 1}장 · ${name}</b><span>★ ${got}/${ls.length * 3}</span>`); const g = el('div', 'sr-lv', sc);
        ls.forEach((l) => { const open = unlocked(l.id), st = SV.stars[l.id] || 0, b = el('button', 'sr-l' + (open ? '' : ' off') + (l.tag === 'rest' ? ' rest' : '') + (l.type !== 'sort' ? ' sp2' : ''), g, `<span>${l.id}</span><i>${'★'.repeat(st)}${'☆'.repeat(3 - st)}</i>`); if (l.type !== 'sort') b.title = D.types[l.type]; b.onclick = () => { if (!open) { GF.sfx('hmm'); UK.toast('앞 레벨을 먼저 깨 보세요', r); return; } GF.sfx('pick'); GF.go('splay', { n: l.id }); }; });
      });
      setTimeout(() => { const last = [...sc.querySelectorAll('.sr-l')].filter((x) => !x.classList.contains('off')).pop(); last && last.scrollIntoView({ block: 'center' }); }, 30);
    },
  });
  GF.screen('strio', {
    bare: false,
    enter(r) {
      r.classList.add('uk', 'sr'); GF.bg('indoor2', r); bar(); const n = Math.max(6, Math.min(36, (SV.last || 1) + 4)), Ls = trioLevels(n);
      el('div', 'sr-ttl', r, '<div class="uk-title" style="font-size:30px">세 가족 판</div><div class="sr-sub">같은 판, 세 가지 규칙</div>').style.top = '84px';
      el('div', 'sr-line', r, '모든 판이 한 가족의 규칙을 따라요. 어느 쪽이 편한가요?').style.top = '172px';
      const box = el('div', 'sr-trio', r); box.style.top = '226px';
      Ls.forEach((L, i) => { const st = SV.trio[n + ':' + i] || 0, b = UK.btn({ text: RULE_TXT[i][0] + (st ? '  ' + '★'.repeat(st) : ''), cls: RULE_TXT[i][2] + ' block', onclick: () => { if (L) GF.go('splay', { level: L }); } }, box); el('small', '', b, RULE_TXT[i][1]); });
    },
  });

  /* ---------------- 플레이 ---------------- */
  GF.screen('splay', {
    bare: false,
    enter(r, p) {
      r.classList.add('uk', 'sr'); GF.bg('indoor2', r); bar();
      const LV = p.level || D.levels.find((l) => l.id === p.n) || D.levels[0]; if (!p.level) { SV.last = LV.id; save(); }
      const say = (msg) => { const t = UK.toast(msg, r); t.style.cssText += ';top:102px;left:10px;right:10px;height:40px;display:flex;align-items:center;justify-content:center;padding:0 12px;font-size:18px;white-space:nowrap;overflow:hidden;z-index:30;pointer-events:none'; return t; };
      const title = LV.kind === 'daily' ? '오늘의 한 판' : LV.kind === 'season' ? LV.season.title : LV.kind === 'trio' ? ['네모', '세모', '동그라미'][LV.rule] + ' 규칙 판' : '레벨 ' + LV.id;
      el('div', 'sr-hd', r, `<b>${title}</b><span>${LV.kind ? '' : D.chapters[LV.chapter - 1]}${LV.tag === 'rest' ? ' · 쉬어 가기' : ''}</span>` + (LV.type !== 'sort' ? `<em class="sr-type">${D.types[LV.type]}</em>` : ''));
      let S = C.newGame(LV), hist = [], sel = -1, busy = false, hintP = null, streak = 0; const gained = [];
      const info = el('div', 'sr-info', r), area = el('div', 'sr-area', r), btns = el('div', 'sr-btns2', r), tip = el('div', 'sr-tip', r);
      const bu = UK.btn({ text: '되돌리기', cls: 'ghost sm', onclick: undo }, btns), bx = UK.btn({ text: '칸 더', cls: 'ghost sm', onclick: addExtra }, btns); UK.btn({ text: '힌트', cls: 'sky sm', onclick: hint }, btns); UK.btn({ text: '다시', cls: 'ghost sm', onclick: again }, btns);
      const bdU = el('i', 'sr-bd', bu), bdX = el('i', 'sr-bd', bx);
      let tubeEls = [];
      function draw() {
        if (!LV.kind && GF.extras && !S.won) GF.extras.resumeSave(S, LV.id);
        area.innerHTML = ''; tubeEls = []; const nt = S.tubes.length, rows = nt > 6 ? 2 : 1, per = Math.ceil(nt / rows), cmax = Math.max(...S.caps), rowH = 420 / rows, isz = Math.max(26, Math.min(44, Math.floor((rowH - 34) / cmax) - 3)), tw = Math.min(58, Math.floor(344 / per) - 6);
        for (let ro = 0; ro < rows; ro++) {
          const row = el('div', 'sr-row', area);
          for (let i = ro * per; i < Math.min(nt, (ro + 1) * per); i++) {
            const t = el('button', 'sr-tube' + (sel === i ? ' sel' : '') + (C.isDone(S, i) ? ' done' : '') + (hintP && (hintP[0] === i || hintP[1] === i) ? ' hint' + (hintP[0] === i ? 'a' : 'b') : '') + (C.isLocked(S, i) ? ' lock' : ''), row); t.dataset.i = i; t.setAttribute('aria-label', '칸 ' + (i + 1));
            const hh = S.caps[i] * (isz + 3) + 14; t.style.cssText = `width:${tw}px;height:${hh}px`; t.onclick = () => tap(i);
            S.tubes[i].forEach((k, j) => { const it = el('div', 'sr-it' + (sel === i && j === S.tubes[i].length - 1 ? ' up' : ''), t); if (LV.hidden && !S.rev[i][j]) { it.classList.add('q'); art('e:❔', it, isz); } else art(LV.pal[k], it, isz); });
            if (C.isLocked(S, i)) el('i', 'lk', t, '🔒'); tubeEls[i] = t;
          }
        }
        info.textContent = (LV.kind === 'trio' ? RULE_TXT[LV.rule][1] + ' · ' : '') + '옮긴 횟수 ' + S.moves + ' · 정리한 칸 ' + C.doneCount(S);
        const ur = 3 - S.used.undo; bdU.textContent = ur; bu.style.opacity = hist.length && ur > 0 ? 1 : 0.45; bdX.textContent = S.used.extra ? '0' : '1'; bx.style.opacity = S.used.extra ? 0.45 : 1;
      }
      function shake(i) { const t = tubeEls[i]; if (!t) return; t.classList.add('shake'); setTimeout(() => t && t.classList.remove('shake'), 400); }
      function tap(i) {
        if (busy || S.won) return; hintP = null; tip.style.display = 'none';
        if (sel < 0) { if (!S.tubes[i].length || C.isLocked(S, i)) { GF.sfx('hmm'); shake(i); return; } sel = i; GF.sfx('pick'); draw(); return; }
        if (sel === i) { sel = -1; GF.sfx('tap'); draw(); return; }
        const from = sel; if (!C.canMove(S, from, i)) { GF.sfx('hmm'); const bad = i; if (S.tubes[i].length && !C.isLocked(S, i)) sel = i; else sel = -1; draw(); shake(bad); return; }
        hist.push(C.clone(S)); sel = -1; const ev = C.move(S, from, i); GF.sfx('drop'); draw(); const t = tubeEls[i]; if (t && t.lastElementChild) t.lastElementChild.classList.add('pop');
        if (ev.done) { streak++; setTimeout(() => { GF.sfx('ok', { st: [0, 2, 4, 7, 9, 12][Math.min(streak - 1, 5)] }); try { const b = tubeEls[i].getBoundingClientRect(), sr = r.getBoundingClientRect(), k = sr.width / 360; GF.burst(document.getElementById('safe'), (b.left + b.width / 2 - sr.left) / k, (b.top - sr.top) / k, 12); } catch (e) {} }, slow(100)); } else streak = 0;
        if (S.won) { busy = true; setTimeout(finish, slow(700)); } else if (!C.validMoves(S).length) { say('막혔어요. 되돌리거나 다시 해 봐요'); GF.sfx('hmm'); }
      }
      function undo() { if (busy || S.won) return; if (S.used.undo >= 3) { say('되돌리기는 한 판 세 번'); return; } if (!hist.length) return; const u0 = S.used.undo + 1, ex = S.used.extra, hn = S.used.hint; S = hist.pop(); S.used.undo = u0; S.used.extra = ex; S.used.hint = hn; sel = -1; hintP = null; streak = 0; GF.sfx('tap'); draw(); }
      function addExtra() { if (busy || S.won) return; if (S.used.extra) { say('칸 더는 한 판 한 번'); return; } C.addTube(S); S.used.extra = 1; hist = []; sel = -1; GF.sfx('star'); draw(); say('빈 칸이 하나 생겼어요'); }
      function hint() { if (busy || S.won) return; const h = C.hint(S); if (!h) { say('되돌리거나 다시 해 봐요'); return; } S.used.hint++; hintP = h; sel = -1; GF.sfx('pick'); draw(); setTimeout(() => { if (hintP === h) { hintP = null; if (area.isConnected) draw(); } }, slow(2600)); }
      function again() { if (busy) return; GF.extras && GF.extras.resumeClear(); GF.sfx('tap'); GF.replace('splay', LV.kind ? { level: LV } : { n: LV.id }); }
      function result(stars) {
        const chips = [{ icon: 'star', text: '★ ' + stars }, { icon: 'info', text: '옮긴 횟수 ' + S.moves }]; gained.forEach((id) => chips.push({ icon: 'home', text: (Room.item(id) || {}).name || id }));
        const next = !LV.kind && D.levels.find((l) => l.id === LV.id + 1);
        UK.result({ title: '정리 끝!', stars, chips, parent: r, onNext: next ? () => GF.replace('splay', { n: next.id }) : null, nextText: '다음 레벨', onRetry: () => GF.replace('splay', LV.kind ? { level: LV } : { n: LV.id }), retryText: '다시', onHome: () => GF.home2(), homeText: '처음으로' });
      }
      function finish() {
        busy = true; GF.extras && GF.extras.resumeClear(); const st = S.moves <= LV.par + 4 ? 3 : S.moves <= LV.par + 12 ? 2 : 1;
        if (!LV.kind) { SV.stars[LV.id] = Math.max(SV.stars[LV.id] || 0, st); if (REW[LV.id] && Room.grant(REW[LV.id])) gained.push(REW[LV.id]); }
        else if (LV.kind === 'daily') { if (SV.daily.date !== today() || !SV.daily.done) { SV.daily = { date: today(), done: 1 }; SV.shards++; if (SV.shards % X.shardsPerItem === 0) { const it = X.dailyItems.find((id) => !Room.has(id)); if (it && Room.grant(it)) gained.push(it); } } }
        else if (LV.kind === 'season') { if (!SV.seasonDone[seasonKey(LV.season)]) { SV.seasonDone[seasonKey(LV.season)] = 1; if (LV.season.reward && Room.grant(LV.season.reward)) gained.push(LV.season.reward); } }
        else if (LV.kind === 'trio') { const key = LV.id.split(':').slice(1).join(':'); SV.trio[key] = Math.max(SV.trio[key] || 0, st); }
        save(); GF.refreshBar(); GF.extras && GF.extras.check(); GF.ads && GF.ads.noteLevelDone(); GF.sfx('star');
        setTimeout(() => {
          const story = !LV.kind && LV.id % 10 === 0 && X.stories.find((s) => s.chapter === LV.chapter);   // 사연 판: 장의 마지막 판 뒤에 옛이야기 4컷
          if (story) { const ov = el('div', 'abs', r); ov.style.cssText = 'inset:0;z-index:60'; GF.story(ov, story.cuts.map((c) => ({ bg: 'indoor', text: c.text, chars: c.chars.map((id, k, a) => ({ id, x: a.length > 1 ? 50 + k * (260 / (a.length - 1)) : 180, y: 600 })), bubble: c.bubble ? { type: c.bubble, at: 0 } : null })), () => { ov.remove(); result(st); }); }
          else result(st);
        }, slow(650));
      }
      SR.debug.level = () => LV; SR.debug.state = () => S; SR.debug.tap = (i) => tap(i); SR.debug.undo = undo; SR.debug.extra = addExtra; SR.debug.hint = hint; SR.debug.busy = () => busy; SR.debug.tubes = () => tubeEls; SR.debug.sel = () => sel;
      if (!LV.kind && GF.extras) GF.extras.resumeLoad(S, LV.id);
      draw();
      const t0 = TYPE_TIP[LV.type]; if (LV.id <= 2 && !LV.kind) { tip.style.display = 'block'; tip.textContent = LV.id === 1 ? '칸을 눌러 집고, 다른 칸에 놓아요' : '같은 그림 위나 빈 칸에 놓을 수 있어요'; } else if (t0 && !SV.tips[LV.type] && LV.type !== 'sort') { tip.style.display = 'block'; tip.textContent = t0; SV.tips[LV.type] = 1; save(); } else tip.style.display = 'none';
      if (tip.style.display === 'block') setTimeout(() => { tip.style.display = 'none'; }, slow(3600));
      if (LV.id <= 2 && !LV.kind) setTimeout(() => { const d = tubeEls[LV.solution[0][0]]; if (d && d.isConnected && !hist.length && sel < 0) UK.finger(r, d, { tap: true, ms: 6000 }); }, slow(1300));   // 처음 두 판: 집을 칸을 손가락이 알려 준다
    },
  });
  GF.screen('shouse', {
    bare: false,
    enter(r) { r.classList.add('uk', 'sr'); GF.bg('indoor', r); bar(); const sc = el('div', 'sr-scroll', r); sc.style.top = '70px'; Room.house(sc, { room: 'nemo' }); },
  });
  SR.start = async function (opts) {
    UK.mode('adult');
    await GF.boot(Object.assign({ dataNames: ['chars', 'anchors', 'sounds', 'sort_levels', 'sort_extra', 'room_items', 'art_slots'], storeKey: 'gf:sort:ui:v1', async start() {
      D = GF.data.sort_levels; X = GF.data.sort_extra;
      Room.init({ data: GF.data.room_items, game: 'sort', mode: 'adult', autoPlace: true, store: Room.sharedStore('gf:house:adult:v1'), charSrc: (id) => GF.src(id), slot: (k, id) => GF.slot(k, id) });
      GF.extras.init(Object.assign({ app: 'sort', kid: false, rewardSet: 'storage', resetTips: () => { SV.tips = {}; SV.intro = 0; save(); }, reset: () => { SV = blank(); save(); } }, GF.extras.levelApp({ SV: () => SV, total: 120, roomSet: 'storage', itemTotal: 20, icon: '🧹' })));
      document.getElementById('safe').classList.add('uk'); GF.go('shome');
      SR.debug.D = () => D; SR.debug.SV = () => SV; SR.debug.reset = () => { SV = blank(); save(); }; SR.debug.dailyLevel = dailyLevel; SR.debug.seasonLevel = seasonLevel; SR.debug.trioLevels = trioLevels; SR.debug.X = () => X; SR.debug.REW = REW;
    } }, opts || {}));
  };
})();
