/* 도형 블록 — UI. 규칙 block-core.js · 생성기 block-gen.js · 판 data/block_levels.json · 사연·시즌 data/block_extra.json · 집 engine/room · 모든 화면은 ui-kit(UK).
   손맛: 조각을 끌어다 놓기(탭도 됨) · 놓을 자리 미리 보기(지워질 줄은 반짝) · 줄이 지워질 때 터지는 연출 · 이어 지우면 소리가 한 음씩 올라감. 판 종류 7 + 공통 판 4(오늘의 한 판·시즌 판·사연 판·세 가족 판).
   실패는 벌 없이 즉시 한 번 더, 되돌리기는 한 판에 한 번. */
(function () {
  'use strict';
  const el = UK.el, M = BlockCore, G = BlockGen;
  const BK = (window.BLOCK = { debug: {} });
  const KEY = 'gf:block:v1', N = 8;
  const CC = ['#F6C28B', '#8FD3F4', '#B7C2F2'], CD = ['#E8870F', '#2F8FD0', '#6B76C8'];
  const REW = { 2: 'o_bricks', 4: 'o_roof', 6: 'o_chimney', 8: 'o_fence', 10: 'o_gate', 12: 'o_mailbox', 15: 'o_doghouse', 18: 'o_lantern', 22: 'o_flowerpot', 28: 'o_window', 34: 'o_flag', 40: 'o_sign', 48: 'o_bench', 56: 'o_jar', 64: 'o_hay', 72: 'o_well', 84: 'o_cart', 96: 'o_lamp', 108: 'o_pond', 120: 'o_swing' };   // 이 판을 처음 깨면 받는 집 바깥 소품
  const TYPE_TIP = { lines: '가로나 세로 줄을 가득 채우면 지워져요', family: '목표 도형 색 칸이 든 줄을 지워요', junk: '갈색 짐이 든 줄을 지우면 짐이 사라져요', combo: '두 줄 이상을 한꺼번에 지워 보세요', star: '반짝 별이 든 줄을 지워 별을 모아요', limit: '정해진 조각 수 안에 끝내요', solo: '한 가족의 조각만 나와요' };
  const RULE_TXT = [['네모 규칙', '두 줄 이상 한꺼번에 지우면 점 조각을 돌려받아요', 'nemo'], ['세모 규칙', '반짝 조각이 든 줄을 지우면 옆 줄까지 껑충 지워져요', 'semo'], ['동그라미 규칙', '4×4 방도 가득 차면 지워져요', 'dong']];
  const slow = (ms) => (BK.fast ? 0 : ms);
  const uri = (svg) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  const MARK = [  // 가족 표시(색만으로 구분하지 않게 칸 안에 모양을 넣는다)
    '<rect x="14" y="14" width="22" height="22" rx="5" fill="#fff" opacity=".85"/>', '<path d="M25 12L39 37H11z" fill="#fff" opacity=".85"/>', '<circle cx="25" cy="25" r="12" fill="#fff" opacity=".85"/>'];
  const JUNK = '<rect x="6" y="12" width="38" height="30" rx="5" fill="#B98550" stroke="#4A3030" stroke-width="2.6"/><path d="M6 22h38M20 12v10M30 12v10" stroke="#4A3030" stroke-width="2.2"/>';
  const SHINY = '<path d="M38 4l3 7 7 3-7 3-3 7-3-7-7-3 7-3z" fill="#FFC933" stroke="#C99A00" stroke-width="1.4"/>';
  const tileSVG = (f, shiny) => uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 50">` + (f === 9 ? JUNK : `<rect x="2" y="2" width="46" height="46" rx="10" fill="${CC[f]}" stroke="${CD[f]}" stroke-width="3"/>` + MARK[f] + `<circle cx="20" cy="${f === 1 ? 31 : 26}" r="2" fill="#4A3030"/><circle cx="30" cy="${f === 1 ? 31 : 26}" r="2" fill="#4A3030"/>`) + (shiny ? SHINY : '') + '</svg>');
  const tcache = {}; const tile = (f, s) => tcache[f + ':' + (s ? 1 : 0)] || (tcache[f + ':' + (s ? 1 : 0)] = tileSVG(f, s));

  /* ---------------- 저장 ---------------- */
  const blank = () => ({ v: 1, stars: {}, last: 1, daily: { date: '', done: 0 }, shards: 0, seasonDone: {}, trio: {}, tips: {} });
  let SV = (() => { try { const x = JSON.parse(localStorage.getItem(KEY)); if (x && x.v >= 1) return Object.assign(blank(), x); } catch (e) {} return blank(); })();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(SV)); } catch (e) {} };
  const totalStars = () => Object.values(SV.stars).reduce((a, b) => a + b, 0);
  const unlocked = (n) => n === 1 || SV.stars[n - 1] > 0 || !!BK.unlockAll;
  let D, X, roomOK = false;
  const now = () => new Date(), pad = (n) => String(n).padStart(2, '0'), today = () => { const d = now(); return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()); };
  const dayNum = () => { const d = now(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000); };
  GF.home = () => { GF.stack = []; GF.go('bhome'); }; GF.home2 = GF.home;
  GF.pill = () => UK.icon('star') + '<span>' + totalStars() + '</span>';
  const bar = () => GF.refreshBar && GF.refreshBar();

  /* 공통 판 4종이 만드는 판 */
  const DAILY = ['lines', 'family', 'junk', 'star', 'combo', 'limit', 'solo'];
  function dailyLevel() { const d = +today(), type = DAILY[dayNum() % 7], L = G.make(8 + (d % 40), d, { type, tag: 'growth', noGreedy: true }); if (L) { L.id = 'daily'; L.kind = 'daily'; } return L; }
  const seasonNow = () => X.seasons.filter((s) => s.months.includes(now().getMonth() + 1) || BK.season === s.id);
  const seasonKey = (s) => s.id + ':' + now().getFullYear();
  function seasonLevel(s) { const L = G.make(s.n, s.seed + now().getFullYear(), { type: s.type, tag: 'growth', noGreedy: true }); if (L) { L.id = 'season:' + s.id; L.kind = 'season'; L.season = s; } return L; }
  function trioLevels(n) { return [0, 1, 2].map((rule) => { const L = G.make(n, n * 7919 + 33, { type: 'lines', tag: 'growth', rule, noGreedy: true }); if (L) { L.id = 'trio:' + n + ':' + rule; L.kind = 'trio'; L.rule = rule; } return L; }); }

  /* ---------------- 홈 ---------------- */
  GF.screen('bhome', {
    bare: false,
    enter(r) {
      r.classList.add('uk', 'bk'); GF.bg('indoor2', r); bar();
      const tt = el('div', 'bk-ttl', r, '<div class="uk-title">도형 블록</div><div class="bk-sub">줄을 채워 지우고 집을 지어요</div>'); const pl = Room.mePlate(tt); if (pl) { tt.querySelector('.bk-sub').style.display = 'none'; pl.style.marginTop = '6px'; }
      GF.hero(r, 'block'); const fam = el('div', 'bk-fam', r); ['nemo_dad.joy', 'wife.joy', 'dong_dad.joy'].forEach((id) => fam.appendChild(GF.img(id)));
      const last = Math.min(D.levels.length, Math.max(1, SV.last || 1));
      const cont = UK.btn({ text: '이어서 하기 · 레벨 ' + last, icon: 'play', cls: 'block', onclick: () => GF.go('bplay', { n: last }) }, el('div', 'bk-btns', r));
      if (!Object.keys(SV.stars).length) setTimeout(() => { if (cont.isConnected) UK.finger(r, cont); }, 900);
      const g = el('div', 'bk-grid', r), dailyDone = SV.daily.date === today() && SV.daily.done;
      const b = (t, icon, cls, fn, badge) => { const x = UK.btn({ text: t, icon, cls, onclick: fn }, g); if (badge) el('i', 'bk-badge', x, badge); return x; };
      b('레벨', 'shapes', 'sky', () => GF.go('blevels'));
      b('오늘의 한 판', 'gift', 'gold', () => { const L = dailyLevel(); if (L) GF.go('bplay', { level: L }); }, dailyDone ? '✔' : '1');
      b('세 가족 판', 'heart', 'pink', () => GF.go('btrio'));
      b('우리 집', 'home', 'dong', () => GF.go('bhouse'));
      const ss = seasonNow(); if (ss.length) { const s = ss.find((x) => !SV.seasonDone[seasonKey(x)]) || ss[0], done = SV.seasonDone[seasonKey(s)]; UK.btn({ text: s.title, icon: 'star', cls: 'block ' + (done ? 'gray' : 'danger'), onclick: () => { const L = seasonLevel(s); if (L) GF.go('bplay', { level: L }); } }, el('div', 'bk-season', r)); }
      el('div', 'bk-foot', r, '별 ' + totalStars() + ' · 집 소품 ' + Room.owned().filter((id) => (Room.item(id) || {}).set === 'outer').length + '/' + Object.keys(REW).length);
    },
  });

  /* ---------------- 레벨 선택 ---------------- */
  GF.screen('blevels', {
    bare: false,
    enter(r) {
      r.classList.add('uk', 'bk'); GF.bg('indoor', r); bar();
      const sc = el('div', 'bk-scroll', r);
      D.chapters.forEach((name, ci) => {
        const ls = D.levels.filter((l) => l.chapter === ci + 1); if (!ls.length) return;
        const got = ls.reduce((a, l) => a + (SV.stars[l.id] || 0), 0);
        el('div', 'bk-ch', sc, `<b>${ci + 1}장 · ${name}</b><span>★ ${got}/${ls.length * 3}</span>`);
        const g = el('div', 'bk-lv', sc);
        ls.forEach((l) => {
          const open = unlocked(l.id), st = SV.stars[l.id] || 0, b = el('button', 'bk-l' + (open ? '' : ' off') + (l.tag === 'rest' ? ' rest' : '') + (l.type !== 'lines' ? ' sp' : ''), g, `<span>${l.id}</span><i>${'★'.repeat(st)}${'☆'.repeat(3 - st)}</i>`);
          if (l.type !== 'lines') b.title = D.types[l.type];
          b.onclick = () => { if (!open) { GF.sfx('hmm'); UK.toast('앞 레벨을 먼저 깨 보세요', r); return; } GF.sfx('pick'); GF.go('bplay', { n: l.id }); };
        });
      });
      setTimeout(() => { const last = [...sc.querySelectorAll('.bk-l')].filter((x) => !x.classList.contains('off')).pop(); last && last.scrollIntoView({ block: 'center' }); }, 30);
    },
  });

  /* ---------------- 세 가족 판 ---------------- */
  GF.screen('btrio', {
    bare: false,
    enter(r) {
      r.classList.add('uk', 'bk'); GF.bg('indoor2', r); bar();
      const n = Math.max(6, Math.min(60, (SV.last || 1) + 4)), Ls = trioLevels(n);
      el('div', 'bk-ttl', r, '<div class="uk-title" style="font-size:30px">세 가족 판</div><div class="bk-sub">같은 일, 세 가지 규칙</div>').style.top = '84px';
      el('div', 'bk-line', r, '모든 조각이 한 가족의 규칙을 따라요. 어느 쪽이 편한가요?').style.top = '172px';
      const box = el('div', 'bk-trio', r); box.style.top = '226px';
      Ls.forEach((L, i) => { const st = SV.trio[n + ':' + i] || 0, b = UK.btn({ text: RULE_TXT[i][0] + (st ? '  ' + '★'.repeat(st) : ''), cls: RULE_TXT[i][2] + ' block', onclick: () => { if (L) GF.go('bplay', { level: L }); } }, box); el('small', '', b, RULE_TXT[i][1]); });
    },
  });

  /* ---------------- 플레이 ---------------- */
  GF.screen('bplay', {
    bare: false,
    enter(r, p) {
      r.classList.add('uk', 'bk'); GF.bg('indoor2', r);
      const say = (msg) => { const t = UK.toast(msg, r); t.style.cssText += ';top:150px;left:10px;right:10px;height:40px;display:flex;align-items:center;justify-content:center;padding:0 12px;font-size:18px;z-index:30;pointer-events:none'; return t; };   // 안내는 판 위 목표 칩 줄에 잠깐 뜬다(판·조각을 덮지 않게)
      const LV = p.level || D.levels.find((l) => l.id === p.n) || D.levels[0]; let S = M.newGame(LV), hist = [], undone = 0, busy = false, hint = null, sel = -1, streak = 0; const gained = [];
      if (!p.level) { SV.last = LV.id; save(); }
      bar();
      const title = LV.kind === 'daily' ? '오늘의 한 판' : LV.kind === 'season' ? LV.season.title : LV.kind === 'trio' ? ['네모', '세모', '동그라미'][LV.rule] + ' 규칙 판' : '레벨 ' + LV.id;
      el('div', 'bk-hd', r, `<b>${title}</b><span>${LV.kind ? '' : D.chapters[LV.chapter - 1]}${LV.tag === 'rest' ? ' · 쉬어 가기' : ''}</span>` + (LV.type !== 'lines' ? `<em class="bk-type">${D.types[LV.type]}</em>` : ''));
      const goals = el('div', 'bk-goals', r), board = el('div', 'bk-board', r), tray = el('div', 'bk-tray', r), tip = el('div', 'uk-caption bk-tip', r), btns = el('div', 'bk-btns2', r);
      const cs = 36, gap = 2, pitch = cs + gap; board.style.width = board.style.height = N * pitch + gap + 'px';
      const cells = []; for (let i = 0; i < 64; i++) { const c = el('button', 'bk-cell', board); c.dataset.i = i; c.style.cssText = `left:${(i % N) * pitch + gap}px;top:${((i / N) | 0) * pitch + gap}px;width:${cs}px;height:${cs}px`; c.setAttribute('aria-label', '칸 ' + (i + 1)); cells.push(c); }
      const bu = UK.btn({ text: '되돌리기', icon: 'replay', cls: 'ghost sm', onclick: undo }, btns); UK.btn({ text: '힌트', icon: 'info', cls: 'sky sm', onclick: showHint }, btns);
      const lbl = { lines: () => `줄 ${Math.min(S.got.lines, LV.goal.n)}/${LV.goal.n}`, solo: () => `줄 ${Math.min(S.got.lines, LV.goal.n)}/${LV.goal.n}`, limit: () => `줄 ${Math.min(S.got.lines, LV.goal.n)}/${LV.goal.n}`, combo: () => `한꺼번에 ${S.got.combo}/${LV.goal.n}`, junk: () => `짐 ${M.junkLeft(S)}`, star: () => `별 ${S.got.stars}/${LV.stars.length}`, family: () => `${Math.min(S.got.fam[LV.goal.f], LV.goal.n)}/${LV.goal.n}` };
      function goalChips() {
        goals.innerHTML = ''; const ch = el('div', 'bk-goal' + (M.won(S) ? ' ok' : ''), goals);
        if (LV.goal.t === 'family') { const i = el('img', 'bk-gi', ch); i.src = tile(LV.goal.f); } else if (LV.goal.t === 'junk') { const i = el('img', 'bk-gi', ch); i.src = tile(9); } else if (LV.goal.t === 'star') el('b', 'bk-gs', ch, '★');
        el('span', '', ch, lbl[LV.goal.t]());
        if (LV.lim != null) el('span', 'uk-chip bk-left', goals, UK.icon('gift') + '<span>남은 조각 <b>' + Math.max(0, LV.lim - S.used) + '</b></span>');
        el('div', 'bk-bar', goals, `<i style="width:${Math.round(M.progress(S) * 100)}%"></i>`);
      }
      function pieceEl(t, size) {
        const cells2 = M.PIECES[t.p], w = Math.max(...cells2.map((c) => c[1])) + 1, h = Math.max(...cells2.map((c) => c[0])) + 1, d = el('div', 'bk-pc'); d.style.cssText = `width:${w * size}px;height:${h * size}px`;
        cells2.forEach(([dr, dc], k) => { const i = el('img', '', d); i.src = tile(t.c, t.sh && k === 0); if (t.sh && k === 0) i.className = 'sh'; i.style.cssText = `left:${dc * size}px;top:${dr * size}px;width:${size - 1}px;height:${size - 1}px`; i.draggable = false; });
        d.dataset.p = t.p; return d;
      }
      function draw(clearing) {
        cells.forEach((c, i) => {
          c.className = 'bk-cell'; c.innerHTML = ''; const f = S.fam[i]; if (f >= 0) { const im = el('img', '', c); im.src = tile(f, S.shiny[i]); c.classList.add('full'); if (S.shiny[i]) c.classList.add('sh'); }
          if (S.star.indexOf(i) >= 0) { c.classList.add('st'); el('b', 'bk-star', c, '★'); }
          if (hint && hint.cells.includes(i)) c.classList.add('hint');
        });
        tray.innerHTML = '';
        const ws = S.tray.map((t) => (t ? Math.max(...M.PIECES[t.p].map((c) => c[1])) + 1 : 0)), hs = S.tray.map((t) => (t ? Math.max(...M.PIECES[t.p].map((c) => c[0])) + 1 : 0)), live = ws.filter((w) => w).length || 1;
        const ts = Math.max(18, Math.min(27, Math.floor((330 - 8 * live) / Math.max(1, ws.reduce((a, b) => a + b, 0))), Math.floor(122 / Math.max(1, ...hs))));   // 조각 칸 크기: 판 칸의 70%(25px) 이상을 목표로, 모자라면 맞춰 줄인다
        S.tray.forEach((t, k) => {
          const slot = el('div', 'bk-slot' + (sel === k ? ' sel' : ''), tray); slot.style.flex = t ? String(Math.max(2, ws[k])) : '2';
          if (!t) return; const pe = pieceEl(t, ts); slot.appendChild(pe); slot.dataset.k = k;
          if (!M.moves({ L: S.L, fam: S.fam, shiny: S.shiny, star: S.star, qi: S.qi, tray: [t, null, null], got: S.got, used: S.used, bonus: S.bonus, rule: S.rule }).length) slot.classList.add('dead');
          slot.addEventListener('pointerdown', (e) => dragStart(e, k, slot));
        });
        goalChips(); bu.style.opacity = hist.length && undone < 1 ? 1 : 0.4;
      }
      const center = (c) => { const rc = c.getBoundingClientRect(); return GF.pt({ clientX: rc.x + rc.width / 2, clientY: rc.y + rc.height / 2 }); };
      function doPlace(slot, r0, c0) {
        const t = S.tray[slot]; if (busy || !t || !M.canAt(S, t, r0, c0)) { if (t) GF.sfx('hmm'); return false; }
        busy = true; hist.push(M.clone(S)); tip.style.display = 'none'; hint = null; sel = -1; const pre = M.clone(S), trace = [];
        const ev = M.place(S, slot, r0, c0, trace); GF.sfx('drop'); draw();
        if (ev.cleared.length) {
          streak++; const steps = [0, 2, 4, 7, 9, 12, 14, 16], st = steps[Math.min(streak - 1, 7)];
          ev.cleared.forEach((i) => { const g = el('img', 'bk-out', board); g.src = tile(pre.fam[i] >= 0 ? pre.fam[i] : S.tray[0] ? 0 : 0, pre.shiny[i]); g.style.cssText = `left:${(i % N) * pitch + gap}px;top:${((i / N) | 0) * pitch + gap}px;width:${cs}px;height:${cs}px`; setTimeout(() => g.remove(), slow(420)); });
          try { const c = center(cells[ev.cleared[(ev.cleared.length / 2) | 0]]); GF.burst(document.getElementById('safe'), c.x, c.y, 8 + ev.lines * 4); } catch (x) {}
          GF.sfx('ok', { st });
          if (ev.lines >= 2) say('한꺼번에 ' + ev.lines + '줄!'); else if (streak >= 2) say('이어서 ×' + streak);
          if (ev.bonus) setTimeout(() => say('점 조각을 돌려받았어요'), 400);
          if (ev.stars) setTimeout(() => { say('별을 모았어요'); GF.sfx('star'); }, 300);
        } else streak = 0;
        setTimeout(() => { busy = false; draw(); if (M.won(S)) finish(); else if (M.lost(S)) lose(); }, slow(ev.cleared.length ? 480 : 120));
        return true;
      }
      function undo() { if (!hist.length || busy || undone >= 1) { if (undone >= 1) say('되돌리기는 한 판에 한 번이에요'); return; } undone++; S = hist.pop(); hint = null; streak = 0; GF.sfx('tap'); draw(); }
      function showHint() {
        if (busy) return;
        // 지금 판 상태에서 이길 수 있는 첫 수를 찾기 어렵다 → 놓을 수 있는 수 중 가장 많이 지우는 수를 보여 준다
        let best = null, bs = -1; M.moves(S).forEach((m) => { const T = M.clone(S), ev = M.place(T, m[0], m[1], m[2]); const sc = ev.lines * 10 + ev.stars * 8 + M.progress(T) * 5; if (sc > bs) { bs = sc; best = m; } });
        if (!best) return; const t = S.tray[best[0]]; hint = { slot: best[0], cells: M.PIECES[t.p].map(([dr, dc]) => (best[1] + dr) * N + best[2] + dc) }; sel = best[0]; GF.sfx('pick'); draw();
      }
      /* 끌어서 놓기: 조각을 잡으면 손가락 위쪽에 떠서 따라온다. 놓을 자리가 맞으면 초록, 안 맞으면 빨강 미리 보기 */
      function preview(k, rr, cc) {
        cells.forEach((x) => x.classList.remove('pv', 'pvx', 'pl')); const t = S.tray[k]; if (!t) return false;
        const ok = M.canAt(S, t, rr, cc), cs2 = M.PIECES[t.p].map(([dr, dc]) => (rr + dr) * N + cc + dc);
        cs2.forEach((i, j) => { const x = cells[i]; if (x && (rr + M.PIECES[t.p][j][0]) >= 0 && (rr + M.PIECES[t.p][j][0]) < N && (cc + M.PIECES[t.p][j][1]) >= 0 && (cc + M.PIECES[t.p][j][1]) < N) x.classList.add(ok ? 'pv' : 'pvx'); });
        if (ok) { const T = M.clone(S), tr = []; const ev = M.place(T, k, rr, cc, tr); ev.cleared.forEach((i) => cells[i].classList.add('pl')); }
        return ok;
      }
      function dragStart(e, k, slot) {
        if (busy || !S.tray[k]) return; e.preventDefault(); const t = S.tray[k], scale = r.getBoundingClientRect().width / 360, gs = cs * scale, ghost = pieceEl(t, gs);
        const w = parseFloat(ghost.style.width), h = parseFloat(ghost.style.height); ghost.style.cssText += `;position:fixed;pointer-events:none;z-index:200;opacity:.97;left:${e.clientX - w / 2}px;top:${e.clientY - h - gs * 1.1}px;transform-origin:50% 100%;transform:scale(${(slot.firstChild ? slot.firstChild.offsetWidth / (w / scale) : 0.7).toFixed(3)}) ;transition:transform .14s ease-out`; document.body.appendChild(ghost); requestAnimationFrame(() => requestAnimationFrame(() => { ghost.style.transform = 'scale(1)'; })); GF.sfx('pick'); slot.classList.add('lift'); const prevSel = sel; sel = k;
        let tr = -1, tc = -1; const place = (ev) => { const br = board.getBoundingClientRect(), left = ev.clientX - w / 2, top = ev.clientY - h - gs * 1.1; tc = Math.round((left - br.left) / (pitch * scale)); tr = Math.round((top - br.top) / (pitch * scale)); };
        const mv = (ev) => { if (Math.hypot(ev.clientX - x0, ev.clientY - y0) >= 8) moved = true; ghost.style.left = ev.clientX - w / 2 + 'px'; ghost.style.top = ev.clientY - h - gs * 1.1 + 'px'; place(ev); preview(k, tr, tc); };
        const x0 = e.clientX, y0 = e.clientY; let moved = false;
        const up = (ev) => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); ghost.remove(); slot.classList.remove('lift'); if (!moved && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 8) { sel = prevSel === k ? -1 : k; draw(); return; } place(ev); const ok = preview(k, tr, tc); cells.forEach((x) => x.classList.remove('pv', 'pvx', 'pl')); if (ok) doPlace(k, tr, tc); else { GF.sfx('hmm'); sel = -1; draw(); } };
        window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); preview(k, -9, -9); mv(e);
      }
      // 탭으로도 놓을 수 있다: 조각을 누르면 선택, 판의 칸을 누르면 그 칸이 조각의 왼쪽 위
      cells.forEach((c, i) => { c.onclick = () => { if (sel >= 0 && S.tray[sel]) doPlace(sel, (i / N) | 0, i % N); else GF.sfx('tap'); }; });
      function result(stars) {
        const chips = [{ icon: 'star', text: '★ ' + stars }, { icon: 'gift', text: '조각 ' + S.used + '개' }]; gained.forEach((id) => chips.push({ icon: 'home', text: (Room.item(id) || {}).name || id }));
        const next = !LV.kind && D.levels.find((l) => l.id === LV.id + 1);
        UK.result({ title: '클리어!', stars, chips, parent: r, onNext: next ? () => GF.replace('bplay', { n: next.id }) : null, nextText: '다음 레벨', onRetry: () => GF.replace('bplay', LV.kind ? { level: LV } : { n: LV.id }), retryText: '다시', onHome: () => GF.home2(), homeText: '처음으로' });
      }
      function finish() {
        busy = true; const st = S.used <= LV.s3 ? 3 : S.used <= LV.s2 ? 2 : 1;
        if (!LV.kind) { const first = !SV.stars[LV.id]; SV.stars[LV.id] = Math.max(SV.stars[LV.id] || 0, st); if (REW[LV.id] && roomOK && Room.grant(REW[LV.id])) gained.push(REW[LV.id]); void first; }
        else if (LV.kind === 'daily') { if (SV.daily.date !== today() || !SV.daily.done) { SV.daily = { date: today(), done: 1 }; SV.shards++; if (SV.shards % X.shardsPerItem === 0) { const it = X.dailyItems.find((id) => !Room.has(id)); if (it && Room.grant(it)) gained.push(it); } } }
        else if (LV.kind === 'season') { if (!SV.seasonDone[seasonKey(LV.season)]) { SV.seasonDone[seasonKey(LV.season)] = 1; if (LV.season.reward && Room.grant(LV.season.reward)) gained.push(LV.season.reward); } }
        else if (LV.kind === 'trio') { const key = LV.id.split(':').slice(1).join(':'); SV.trio[key] = Math.max(SV.trio[key] || 0, st); }
        save(); GF.refreshBar(); GF.sfx('star');
        setTimeout(() => {
          const story = !LV.kind && LV.id % 10 === 0 && X.stories.find((s) => s.chapter === LV.chapter);   // 사연 판: 장의 마지막 판 뒤에 옛이야기 4컷
          if (story) { const ov = el('div', 'abs', r); ov.style.cssText = 'inset:0;z-index:60'; GF.story(ov, story.cuts.map((c) => ({ bg: 'indoor', text: c.text, chars: c.chars.map((id, k, a) => ({ id, x: a.length > 1 ? 50 + k * (260 / (a.length - 1)) : 180, y: 600 })), bubble: c.bubble ? { type: c.bubble, at: 0 } : null })), () => { ov.remove(); result(st); }); }
          else result(st);
        }, slow(650));
      }
      function lose() { busy = true; say(LV.lim != null && S.used >= LV.lim ? '조각을 다 썼어요! 한 번 더' : '놓을 자리가 없어요! 한 번 더'); GF.sfx('hmm'); setTimeout(() => GF.replace('bplay', LV.kind ? { level: LV } : { n: LV.id }), slow(900)); }
      BK.debug.cells = () => cells; BK.debug.place = (slot, r0, c0) => doPlace(slot, r0, c0); BK.debug.state = () => S; BK.debug.level = () => LV; BK.debug.undo = undo; BK.debug.hint = showHint; BK.debug.busy = () => busy; BK.debug.drag = dragStart;
      draw();
      const t0 = TYPE_TIP[LV.type]; if (LV.id <= 2 && !LV.kind) { tip.style.display = 'block'; tip.textContent = LV.id === 1 ? '조각을 끌어다 판에 놓아요' : '줄이 가득 차면 지워져요'; } else if (t0 && !SV.tips[LV.type]) { tip.style.display = 'block'; tip.textContent = t0; SV.tips[LV.type] = 1; save(); } else tip.style.display = 'none';
      if (LV.id <= 2 && !LV.kind) setTimeout(() => { const slot = tray.querySelector('.bk-slot[data-k]'), mv = LV.solution[0], c = mv && cells[mv[1] * N + mv[2]]; if (slot && c && c.isConnected && !hist.length) UK.finger(r, slot, { to: c, ms: 7000 }); }, 1200);   // 처음 두 판: 조각을 끌어다 놓는 시늉
    },
  });

  /* ---------------- 우리 집 ---------------- */
  GF.screen('bhouse', {
    bare: false,
    enter(r) {
      r.classList.add('uk', 'bk'); GF.bg('indoor', r); bar();
      const sc = el('div', 'bk-scroll', r); sc.style.top = '70px'; Room.house(sc, { room: 'yard' });
    },
  });

  /* ---------------- 부팅 ---------------- */
  BK.start = async function (opts) {
    UK.mode('adult');
    await GF.boot(Object.assign({ dataNames: ['chars', 'anchors', 'sounds', 'block_levels', 'block_extra', 'room_items', 'art_slots'], storeKey: 'gf:block:ui:v1', async start() {
      D = GF.data.block_levels; X = GF.data.block_extra;
      Room.init({ data: GF.data.room_items, game: 'block', mode: 'adult', autoPlace: true, store: Room.sharedStore('gf:house:adult:v1'), charSrc: (id) => GF.src(id), slot: (k, id) => GF.slot(k, id) });
      roomOK = true; document.getElementById('safe').classList.add('uk'); GF.go('bhome');
      BK.debug.D = () => D; BK.debug.SV = () => SV; BK.debug.reset = () => { SV = blank(); save(); }; BK.debug.dailyLevel = dailyLevel; BK.debug.seasonLevel = seasonLevel; BK.debug.trioLevels = trioLevels; BK.debug.X = () => X; BK.debug.REW = REW;
    } }, opts || {}));
  };
})();
