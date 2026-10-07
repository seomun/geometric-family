/* 도형 합치기 — UI. 규칙 merge-core.js · 생성기 merge-gen.js · 레벨 data/merge_levels.json · 집 engine/room · 모든 화면은 ui-kit(UK).
   손맛: 끌어서 놓기(탭도 됨) · 합쳐질 때 날아가 모이는 연출 · 연쇄 콤보 · 소리 층(drop → ok…ok → star). 판 종류 7 + 공통 판 4(오늘의 한 판·시즌 판·사연 판·세 가족 판). */
(function () {
  'use strict';
  const el = UK.el, M = MergeCore, G = MergeGen;
  const MG = (window.MERGE = { debug: {} });
  const KEY = 'gf:merge:v1';
  const TIER = {
    '0:3': { item: 'b_drawer' }, '0:4': { item: 'b_tv' }, '0:5': { item: 'b_table' }, '0:6': { item: 'b_sofa' }, '0:7': { item: 'b_nemo_living' },
    '1:3': { item: 'b_plant' }, '1:4': { item: 'b_lamp' }, '1:5': { item: 'b_shelf' }, '1:6': { item: 'b_suitcase' }, '1:7': { item: 'b_semo_home' },
    '2:3': { item: 'b_clock' }, '2:4': { item: 'b_window' }, '2:5': { item: 'b_rug' }, '2:6': { item: 'b_globe' }, '2:7': { item: 'b_dong_study' },
  };
  const NAME = { b_drawer: '서랍장', b_tv: 'TV장', b_table: '식탁', b_sofa: '소파', b_nemo_living: '네모네 거실 한 벌', b_plant: '화분', b_lamp: '램프', b_shelf: '책장', b_suitcase: '여행 가방', b_semo_home: '세모네 신혼집 한 벌', b_clock: '벽시계', b_window: '창문', b_rug: '러그', b_globe: '지구본', b_dong_study: '동그라미네 서재 한 벌' };
  const TIPS = { 1: '같은 도형을 옆에 놓으면 합쳐져요', 2: '네모 셋이 맞닿으면 한꺼번에 합쳐지고, 조각 하나를 돌려받아요', 3: '목표 도형을 만들면 클리어!', 4: '반짝이는 세모는 두 단계 껑충 뛰어요', 8: '동그라미는 정확히 둘씩만 합쳐져요' };
  const TYPE_TIP = { order: '손님 주문: 주문서의 가구를 전부 만들어요', tight: '좁은 집: 판이 작아요. 아껴서 놓아요', solo: '한 가족만: 한 가족의 조각만 나와요', clear: '짐 치우기: 갈색 짐 옆에서 같은 것을 만들어 짐을 없애요', move: '이사: 조각을 몇 개 놓으면 판이 한 줄 넓어져요', kimjang: '김장: 같은 단계를 여러 개 만들어요' };
  const slow = (ms) => (MG.fast ? 0 : ms);   // smoke 에서는 연출 대기를 줄인다
  const uri = (svg) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg), cache = {};
  const FACE = (x, y, k) => `<circle cx="${x - 7 * k}" cy="${y}" r="${2.4 * k}" fill="#4A3030"/><circle cx="${x + 7 * k}" cy="${y}" r="${2.4 * k}" fill="#4A3030"/><path d="M${x - 5 * k} ${y + 6 * k}q${5 * k} ${5 * k} ${10 * k} 0" fill="none" stroke="#4A3030" stroke-width="${2.2 * k}" stroke-linecap="round"/>`;
  const CC = ['#F6C28B', '#8FD3F4', '#B7C2F2'];
  function shape(c, t, shiny) {
    const k = 't' + t + c + (shiny ? 's' : ''); if (cache[k]) return cache[k];
    const big = t >= 2, r = big ? 40 : 30, cx = 50, cy = 52, col = CC[c], st = `fill="${col}" stroke="#4A3030" stroke-width="3.4" stroke-linejoin="round"`;
    let body = c === 0 ? `<rect x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" rx="12" ${st}/>` : c === 1 ? `<path d="M${cx} ${cy - r - 4}L${cx + r + 6} ${cy + r - 2}H${cx - r - 6}z" ${st}/>` : `<circle cx="${cx}" cy="${cy}" r="${r + 2}" ${st}/>`;
    const fy = c === 1 ? cy + 8 : cy, fk = big ? 1.15 : 0.9;
    body += FACE(cx, fy, fk) + (big ? `<circle cx="${cx - 18}" cy="${fy + 6}" r="4.5" fill="#FF8FA8" opacity=".6"/><circle cx="${cx + 18}" cy="${fy + 6}" r="4.5" fill="#FF8FA8" opacity=".6"/>` : '');
    if (shiny) body += `<path d="M82 14l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#FFC933" stroke="#C99A00" stroke-width="1.6"/><path d="M16 22l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#FFF3B0"/>`;
    return (cache[k] = uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${body}</svg>`));
  }
  const JUNK = uri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect x="3" y="9" width="34" height="27" rx="4" fill="#B98550" stroke="#4A3030" stroke-width="2.6"/><path d="M3 18h34M16 9v9M24 9v9" stroke="#4A3030" stroke-width="2.2"/><rect x="14" y="22" width="12" height="6" rx="2" fill="#F3DDB3" stroke="#4A3030" stroke-width="1.6"/></svg>');
  function pieceEl(c, t, s, k) {
    const T = TIER[c + ':' + t], d = el('div', 'mg-pc');
    if (!T) { const i = el('img', '', d); i.src = shape(c, t, s); i.style.width = t === 1 ? '70%' : '88%'; }
    else { const it = Room.item(T.item), i = el('img', '', d); i.src = Room.src(it, it.colors[0]); i.style.maxWidth = t === 7 ? '98%' : '90%'; i.style.maxHeight = '88%'; i.style.width = 'auto'; i.style.height = 'auto'; if (t === 7) d.classList.add('top'); }
    if (k) { d.classList.add('junk'); const j = el('img', 'jk', d); j.src = JUNK; }
    d.dataset.c = c; d.dataset.t = t; return d;
  }

  /* ---------------- 저장 ---------------- */
  const blank = () => ({ v: 2, stars: {}, last: 1, daily: { date: '', done: 0 }, shards: 0, seasonDone: {}, trio: {}, tips: {} });
  let SV = (() => { try { const x = JSON.parse(localStorage.getItem(KEY)); if (x && x.v >= 1) return Object.assign(blank(), x, { v: 2 }); } catch (e) {} return blank(); })();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(SV)); } catch (e) {} };
  const totalStars = () => Object.values(SV.stars).reduce((a, b) => a + b, 0);
  const unlocked = (n) => n === 1 || SV.stars[n - 1] > 0 || !!MG.unlockAll;
  let D, X, roomOK = false;
  const now = () => new Date(), pad = (n) => String(n).padStart(2, '0'), today = () => { const d = now(); return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()); };
  const dayNum = () => { const d = now(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000); };
  GF.home = () => { GF.stack = []; GF.go('mhome'); }; GF.home2 = GF.home;   // 엔진 상단 바(#topbar): ‹ · 집 · 별 알약 · 소리
  GF.pill = () => UK.icon('star') + '<span>' + totalStars() + '</span>';
  const bar = () => GF.refreshBar && GF.refreshBar();

  /* 공통 판 4종이 만드는 판 */
  function dailyLevel() { const d = +today(), types = ['make', 'order', 'tight', 'solo', 'clear', 'move', 'kimjang'], type = types[dayNum() % 7], n = 30 + (d % 60); const L = G.make(n, 120, d, { type }); if (L) { L.id = 'daily'; L.kind = 'daily'; L.tag = 'growth'; } return L; }
  const seasonNow = () => X.seasons.filter((s) => s.months.includes(now().getMonth() + 1) || MG.season === s.id);
  const seasonKey = (s) => s.id + ':' + now().getFullYear();
  function seasonLevel(s) { const L = G.make(s.n, 120, s.seed + now().getFullYear(), { type: s.type }); if (L) { L.id = 'season:' + s.id; L.kind = 'season'; L.season = s; L.tag = 'growth'; } return L; }
  function trioLevels(n) { return [0, 1, 2].map((rule) => { const L = G.make(n, 120, n * 7919 + 33, { type: 'make', rule, noGreedy: true }); if (L) { L.id = 'trio:' + n + ':' + rule; L.kind = 'trio'; L.rule = rule; L.tag = 'growth'; } return L; }); }

  /* ---------------- 홈 ---------------- */
  GF.screen('mhome', {
    bare: false,
    enter(r) {
      r.classList.add('uk', 'mg'); GF.bg('indoor2', r); bar();
      const tt = el('div', 'mg-ttl', r, '<div class="uk-title">도형 합치기</div><div class="mg-sub">같은 도형을 합쳐 집을 채워요</div>'); const pl = Room.mePlate(tt); if (pl) { tt.querySelector('.mg-sub').style.display = 'none'; pl.style.marginTop = '6px'; }   // 내 도형 문패(⑤ 결과)
      GF.hero(r, 'merge'); const fam = el('div', 'mg-fam', r); ['nemo_dad.joy', 'wife.joy', 'dong_dad.joy'].forEach((id) => fam.appendChild(GF.img(id)));
      const last = Math.min(D.levels.length, Math.max(1, SV.last || 1));
      const cont = UK.btn({ text: '이어서 하기 · 레벨 ' + last, icon: 'play', cls: 'block', onclick: () => GF.go('mplay', { n: last }) }, el('div', 'mg-btns', r));   // 첫 실행: 한 번 눌러 첫 판
      if (!Object.keys(SV.stars).length) setTimeout(() => { if (cont.isConnected) UK.finger(r, cont); }, 900);
      const g = el('div', 'mg-grid', r), dailyDone = SV.daily.date === today() && SV.daily.done;
      const b = (t, icon, cls, fn, badge) => { const x = UK.btn({ text: t, icon, cls, onclick: fn }, g); if (badge) el('i', 'mg-badge', x, badge); return x; };
      b('레벨', 'shapes', 'sky', () => GF.go('mlevels'));
      b('오늘의 한 판', 'gift', 'gold', () => { const L = dailyLevel(); if (L) GF.go('mplay', { level: L }); }, dailyDone ? '✔' : '1');
      b('세 가족 판', 'heart', 'pink', () => GF.go('mtrio'));
      b('우리 집', 'home', 'dong', () => GF.go('mhouse'));
      const ss = seasonNow(); if (ss.length) { const s = ss.find((x) => !SV.seasonDone[seasonKey(x)]) || ss[0], done = SV.seasonDone[seasonKey(s)]; const sb = UK.btn({ text: s.title, icon: 'star', cls: 'block ' + (done ? 'gray' : 'danger'), onclick: () => { const L = seasonLevel(s); if (L) GF.go('mplay', { level: L }); } }, el('div', 'mg-season', r)); el('i', 'mg-badge', sb, done ? '다시' : '시즌'); }   // 시즌은 배지 카드
      el('div', 'mg-foot', r, '별 ' + totalStars() + ' · 가구 ' + Room.owned().filter((id) => (Room.item(id) || {}).set === 'build').length + '/' + D.roomTotal);
    },
  });

  /* ---------------- 레벨 선택 ---------------- */
  GF.screen('mlevels', {
    bare: false,
    enter(r) {
      r.classList.add('uk', 'mg'); GF.bg('indoor', r); bar();
      const sc = el('div', 'mg-scroll', r);
      D.chapters.forEach((name, ci) => {
        const ls = D.levels.filter((l) => l.chapter === ci + 1); if (!ls.length) return;
        const got = ls.reduce((a, l) => a + (SV.stars[l.id] || 0), 0);
        el('div', 'mg-ch', sc, `<b>${ci + 1}장 · ${name}</b><span>★ ${got}/${ls.length * 3}</span>`);
        const g = el('div', 'mg-lv', sc);
        ls.forEach((l) => {
          const open = unlocked(l.id), st = SV.stars[l.id] || 0, b = el('button', 'mg-l' + (open ? '' : ' off') + (l.tag === 'rest' ? ' rest' : '') + (l.type !== 'make' ? ' sp' : ''), g, `<span>${l.id}</span><i>${'★'.repeat(st)}${'☆'.repeat(3 - st)}</i>`);
          if (l.type !== 'make') b.title = D.types[l.type];
          b.onclick = () => { if (!open) { GF.sfx('hmm'); UK.toast('앞 레벨을 먼저 깨 보세요', r); return; } GF.sfx('pick'); GF.go('mplay', { n: l.id }); };
        });
      });
      setTimeout(() => { const last = [...sc.querySelectorAll('.mg-l')].filter((x) => !x.classList.contains('off')).pop(); last && last.scrollIntoView({ block: 'center' }); }, 30);
    },
  });

  /* ---------------- 세 가족 판: 같은 판을 세 가족 규칙으로 ---------------- */
  GF.screen('mtrio', {
    bare: false,
    enter(r) {
      r.classList.add('uk', 'mg'); GF.bg('indoor2', r); bar();
      const n = Math.max(6, Math.min(60, (SV.last || 1) + 4)), Ls = trioLevels(n);
      el('div', 'mg-ttl', r, '<div class="uk-title" style="font-size:30px">세 가족 판</div><div class="mg-sub">같은 일, 세 가지 규칙</div>').style.top = '84px';
      const box = el('div', 'mg-trio', r); box.style.top = '226px'; const RULE = [['네모 규칙', '셋이 맞닿으면 한꺼번에 합치고 조각을 돌려받아요', 'nemo'], ['세모 규칙', '반짝 조각은 두 단계 껑충 뛰어요', 'semo'], ['동그라미 규칙', '항상 둘씩만 합쳐져요', 'dong']];
      Ls.forEach((L, i) => { const st = SV.trio[n + ':' + i] || 0, b = UK.btn({ text: RULE[i][0] + (st ? '  ' + '★'.repeat(st) : ''), cls: RULE[i][2] + ' block', onclick: () => { if (L) GF.go('mplay', { level: L }); } }, box); el('small', '', b, RULE[i][1]); });
      el('div', 'mg-line', r, '모든 조각이 한 가족의 규칙을 따라요. 어느 쪽이 편한가요?').style.top = '172px';
    },
  });

  /* ---------------- 플레이 ---------------- */
  GF.screen('mplay', {
    bare: false,
    enter(r, p) {
      r.classList.add('uk', 'mg'); GF.bg('indoor2', r);   // 플레이 화면은 창문 없는 배경(HUD 가독)
      const say = (msg) => { const t = UK.toast(msg, r); t.style.cssText += ';top:514px;left:24px;right:24px;padding:6px 12px;font-size:18px'; return t; };   // 토스트는 판 아래·조각 줄 위
      const LV = p.level || D.levels.find((l) => l.id === p.n) || D.levels[0]; let S = M.newGame(LV), hist = [], undone = 0, busy = false, hintCell = null; const gained = [];
      if (!p.level) { SV.last = LV.id; save(); }
      bar();
      const hd = el('div', 'mg-hd', r), leftChip = el('span', 'uk-chip mg-left', r), goals = el('div', 'mg-goals', r), board = el('div', 'mg-board', r), dock = el('div', 'mg-dock', r), tip = el('div', 'uk-caption mg-tip', r);
      const title = LV.kind === 'daily' ? '오늘의 한 판' : LV.kind === 'season' ? LV.season.title : LV.kind === 'trio' ? ['네모', '세모', '동그라미'][LV.rule] + ' 규칙 판' : '레벨 ' + LV.id;
      hd.innerHTML = `<b>${title}</b><span>${LV.kind ? '' : D.chapters[LV.chapter - 1]}${LV.tag === 'rest' ? ' · 쉬어 가기' : ''}</span>` + (LV.type && LV.type !== 'make' ? `<em class="mg-type">${D.types[LV.type]}</em>` : '');
      const finalRows = LV.rows + (LV.moveAt ? 1 : 0), cs = Math.max(48, Math.min(76, Math.floor(Math.min(336 / LV.cols, 330 / finalRows))));
      let cells = [];
      function buildBoard() {
        board.innerHTML = ''; cells = []; const W = LV.cols * cs + 8, H = S.rows * cs + 8, H2 = finalRows * cs + 8;
        board.style.cssText = `width:${W}px;height:${H}px;top:${170 + Math.max(0, Math.round((338 - H2) / 2))}px`;
        for (let i = 0; i < LV.cols * S.rows; i++) { const c = el('button', 'mg-cell', board); c.dataset.i = i; c.style.cssText = `left:${(i % LV.cols) * cs + 4}px;top:${((i / LV.cols) | 0) * cs + 4}px;width:${cs - 4}px;height:${cs - 4}px`; c.setAttribute('aria-label', '칸 ' + (i + 1)); c.onclick = () => doPlace(i); cells.push(c); }
      }
      const cur = el('div', 'mg-cur', dock), nxt = el('div', 'mg-next', dock), btns = el('div', 'mg-btns3', dock);
      const bu = UK.btn({ text: '되돌리기', icon: 'replay', cls: 'ghost sm', onclick: undo }, btns); UK.btn({ text: '힌트', icon: 'info', cls: 'sky sm', onclick: hint }, btns);
      function goalChips() {
        goals.innerHTML = '';
        S.goals.forEach((g) => { const have = Math.min(g.n, S.made[M.key(g.c, g.t)] || 0), ch = el('div', 'mg-goal' + (have >= g.n ? ' ok' : ''), goals); ch.appendChild(pieceEl(g.c, g.t, 0)); el('span', '', ch, have + '/' + g.n); });
        if (S.clear) { const jl = M.junkLeft(S), ch = el('div', 'mg-goal' + (jl === 0 ? ' ok' : ''), goals), j = el('div', 'mg-pc', ch); el('img', '', j).src = JUNK; el('span', '', ch, '짐 ' + jl); }
        leftChip.innerHTML = UK.icon('gift') + '<span>남은 조각 <b>' + M.left(S) + '</b></span>';
      }
      function draw(frame, popAt) {
        const F = frame || { rows: S.rows, cells: S.cells };
        if (cells.length !== LV.cols * F.rows) { const keep = S.rows; S.rows = F.rows; buildBoard(); S.rows = keep; }
        cells.forEach((c, i) => { c.innerHTML = ''; c.classList.toggle('hint', i === hintCell); const q = F.cells[i]; if (q) { const pe = pieceEl(q.c, q.t, q.s, q.k); if (popAt && popAt.includes(i)) pe.classList.add('pop'); c.appendChild(pe); c.classList.add('full'); } else c.classList.remove('full'); });
        cur.innerHTML = ''; nxt.innerHTML = ''; const q = S.q[S.qi]; if (q) { cur.appendChild(pieceEl(q.c, q.t, q.s)); el('em', '', cur, '지금'); }
        for (let k = 1; k <= 2; k++) { const n = S.q[S.qi + k]; if (n) nxt.appendChild(pieceEl(n.c, n.t, n.s)); }
        goalChips(); bu.style.opacity = hist.length && undone < 1 ? 1 : 0.4;
      }
      const showTip = () => { const t = TIPS[LV.id] || (LV.type !== 'make' && !SV.tips[LV.type] ? TYPE_TIP[LV.type] : null); if (t) { tip.style.display = 'block'; tip.textContent = t; if (LV.type !== 'make') { SV.tips[LV.type] = 1; save(); } } else tip.style.display = 'none'; };
      const center = (c) => { const rc = c.getBoundingClientRect(); return GF.pt({ clientX: rc.x + rc.width / 2, clientY: rc.y + rc.height / 2 }); };
      function fly(prevCell, from, to) {     // 합쳐질 조각이 모이는 칸으로 날아간다
        if (!prevCell) return; const a = cells[from], b = cells[to]; if (!a || !b) return;
        const f = pieceEl(prevCell.c, prevCell.t, prevCell.s, prevCell.k); f.style.cssText += `;position:absolute;left:${a.offsetLeft}px;top:${a.offsetTop}px;width:${a.offsetWidth}px;height:${a.offsetHeight}px;z-index:9;transition:transform .2s ease-in,opacity .2s;`; board.appendChild(f);
        setTimeout(() => { f.style.transform = `translate(${b.offsetLeft - a.offsetLeft}px,${b.offsetTop - a.offsetTop}px) scale(.55)`; f.style.opacity = '.5'; }, 20); setTimeout(() => f.remove(), 260);
      }
      function doPlace(i) {
        if (busy || !cells[i] || S.cells[i] || M.left(S) <= 0) { if (S.cells[i]) GF.sfx('hmm'); return; }
        busy = true; hist.push(M.clone(S)); tip.style.display = 'none'; hintCell = null;
        const trace = [], ev = M.place(S, i, trace); GF.sfx('drop'); draw(trace[0] ? { rows: trace[0].rows, cells: trace[0].cells } : null, [i]);
        let t = 0, chain = 0;
        ev.forEach((e, k) => {
          const frame = trace[k + 1], prev = trace[k]; t += slow(280);
          setTimeout(() => {
            if (e.type === 'move') { say('이사! 판이 한 줄 넓어졌어요'); GF.sfx('star'); draw(frame, []); return; }
            chain++; e.from.forEach((j) => { if (j !== e.at) fly(prev.cells[j], j, e.at); });
            setTimeout(() => { draw(frame, [e.at]); GF.sfx('ok', { st: [0, 2, 4, 7, 9, 12, 14, 16][Math.min(chain - 1, 7)] }); try { const c = center(cells[e.at]); GF.burst(document.getElementById('safe'), c.x, c.y, e.t >= 5 ? 14 : 8); } catch (x) {} }, slow(190));
            if (chain >= 2) say('연쇄 ×' + chain);
            if (e.jackpot) { say('대박! 두 단계 껑충'); GF.sfx('star'); } if (e.refund) say('조각 하나를 돌려받았어요');
            if (e.cleared) say('짐을 치웠어요');
            const T = TIER[e.c + ':' + e.t]; if (T && T.item && roomOK) { if (Room.grant(T.item)) { gained.push(T.item); setTimeout(() => { say('새 가구 · ' + NAME[T.item]); GF.sfx('star'); }, 300); } }
          }, t);
        });
        setTimeout(() => { busy = false; draw(); if (M.won(S)) finish(); else if (M.lost(S)) lose(); }, t + slow(520));
      }
      function undo() { if (!hist.length || busy || undone >= 1) { if (undone >= 1) say('되돌리기는 한 판에 한 번이에요'); return; } undone++; S = hist.pop(); hintCell = null; GF.sfx('tap'); buildBoard(); draw(); }
      function hint() { if (busy) return; const c = M.candidates(S, 1); if (!c.length) return; hintCell = c[0]; GF.sfx('pick'); draw(); }
      /* 끌어서 놓기: 지금 조각을 잡아 빈 칸 위에서 놓는다(탭도 그대로 동작) */
      cur.addEventListener('pointerdown', (e) => {
        if (busy || !S.q[S.qi]) return; e.preventDefault(); const q = S.q[S.qi], ghost = pieceEl(q.c, q.t, q.s), gs = cs * (r.getBoundingClientRect().width / 360);
        ghost.style.cssText += `;position:fixed;width:${gs}px;height:${gs}px;pointer-events:none;z-index:200;opacity:.95;left:${e.clientX - gs / 2}px;top:${e.clientY - gs * 1.2}px`; document.body.appendChild(ghost); GF.sfx('pick'); cur.classList.add('lift'); let over = -1;
        const mv = (ev) => { ghost.style.left = ev.clientX - gs / 2 + 'px'; ghost.style.top = ev.clientY - gs * 1.2 + 'px'; const t = document.elementFromPoint(ev.clientX, ev.clientY - gs * 0.7), c = t && t.closest && t.closest('.mg-cell'), k = c && board.contains(c) ? +c.dataset.i : -1; if (k !== over) { cells.forEach((x) => x.classList.remove('over')); over = k; if (k >= 0 && !S.cells[k]) cells[k].classList.add('over'); } };
        const up = () => { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); ghost.remove(); cur.classList.remove('lift'); cells.forEach((x) => x.classList.remove('over')); if (over >= 0 && !S.cells[over]) doPlace(over); };
        window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up);
      });
      function result(stars) {
        const chips = [{ icon: 'star', text: '★ ' + stars }]; if (M.left(S) > 0) chips.push({ icon: 'gift', text: '남은 조각 ' + M.left(S) }); gained.forEach((id) => chips.push({ icon: 'home', text: NAME[id] || (Room.item(id) || {}).name || id }));
        const next = !LV.kind && D.levels.find((l) => l.id === LV.id + 1);
        UK.result({ title: '클리어!', stars, chips, parent: r, onNext: next ? () => GF.replace('mplay', { n: next.id }) : null, nextText: '다음 레벨', onRetry: () => GF.replace('mplay', LV.kind ? { level: LV } : { n: LV.id }), retryText: '다시', onHome: () => GF.home2(), homeText: '처음으로' });
      }
      function finish() {
        busy = true; const st = M.stars(S, LV);
        if (!LV.kind) SV.stars[LV.id] = Math.max(SV.stars[LV.id] || 0, st);
        else if (LV.kind === 'daily') { if (SV.daily.date !== today() || !SV.daily.done) { SV.daily = { date: today(), done: 1 }; SV.shards++; if (SV.shards % X.shardsPerItem === 0) { const it = X.dailyItems.find((id) => !Room.has(id)); if (it && Room.grant(it)) gained.push(it); } } }
        else if (LV.kind === 'season') { if (!SV.seasonDone[seasonKey(LV.season)]) { SV.seasonDone[seasonKey(LV.season)] = 1; if (Room.grant(LV.season.reward)) gained.push(LV.season.reward); } }
        else if (LV.kind === 'trio') { const key = LV.id.split(':').slice(1).join(':'); SV.trio[key] = Math.max(SV.trio[key] || 0, st); }
        save(); GF.refreshBar();
        setTimeout(() => {
          const story = !LV.kind && LV.id % 10 === 0 && X.stories.find((s) => s.chapter === LV.chapter);   // 사연 판: 장의 마지막 판 뒤에 사연 컷
          if (story) { const ov = el('div', 'abs', r); ov.style.cssText = 'inset:0;z-index:60'; GF.story(ov, story.cuts.map((c) => ({ bg: 'indoor', text: c.text, chars: c.chars.map((id, k, a) => ({ id, x: a.length > 1 ? 50 + k * (260 / (a.length - 1)) : 180, y: 600 })), bubble: c.bubble ? { type: c.bubble, at: 0 } : null })), () => { ov.remove(); result(st); }); }
          else result(st);
        }, 650);
      }
      function lose() { busy = true; say('한 번 더!'); GF.sfx('hmm'); setTimeout(() => GF.replace('mplay', LV.kind ? { level: LV } : { n: LV.id }), 650); }   // 지면 벌 없이 즉시 다시
      MG.debug.cells = () => cells; MG.debug.place = (i) => doPlace(i); MG.debug.state = () => S; MG.debug.level = () => LV; MG.debug.undo = undo; MG.debug.hint = hint; MG.debug.busy = () => busy;
      buildBoard(); draw(); showTip();
      if (!LV.kind && LV.id <= 2 && !hist.length) setTimeout(() => { const c = cells[LV.solution[0]]; if (c && c.isConnected && !hist.length) UK.finger(r, c); }, 1200);   // 처음 두 판: 첫 칸을 손가락이 알려 준다
    },
  });

  /* ---------------- 우리 집 ---------------- */
  GF.screen('mhouse', {
    bare: false,
    enter(r) {
      r.classList.add('uk', 'mg'); GF.bg('indoor', r); bar();
      const sc = el('div', 'mg-scroll', r); sc.style.top = '70px'; Room.house(sc, {});
    },
  });

  /* ---------------- 부팅 ---------------- */
  MG.start = async function (opts) {
    UK.mode('adult');
    await GF.boot(Object.assign({ dataNames: ['chars', 'anchors', 'sounds', 'merge_levels', 'merge_extra', 'room_items', 'art_slots'], storeKey: 'gf:merge:ui:v1', async start() {
      D = GF.data.merge_levels; X = GF.data.merge_extra; const RD = GF.data.room_items; D.roomTotal = RD.items.filter((i) => i.set === 'build').length;
      Room.init({ data: RD, game: 'merge', mode: 'adult', autoPlace: true, store: Room.sharedStore('gf:house:adult:v1'), charSrc: (id) => GF.src(id), slot: (k, id) => GF.slot(k, id) });
      roomOK = true; document.getElementById('safe').classList.add('uk'); GF.go('mhome');
      MG.debug.D = () => D; MG.debug.SV = () => SV; MG.debug.reset = () => { SV = blank(); save(); }; MG.debug.dailyLevel = dailyLevel; MG.debug.seasonLevel = seasonLevel; MG.debug.trioLevels = trioLevels; MG.debug.X = () => X;
    } }, opts || {}));
  };
})();
