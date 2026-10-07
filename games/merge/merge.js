/* 도형 합치기 — UI. 규칙은 merge-core.js, 레벨은 data/merge_levels.json(생성기), 집은 engine/room. 모든 화면은 ui-kit(UK)으로 짠다. */
(function () {
  'use strict';
  const el = UK.el, M = MergeCore;
  const MG = (window.MERGE = { debug: {} });
  const KEY = 'gf:merge:v1', NAMES = ['네모', '세모', '동그라미'], INK = ['--uk-nemo-ink', '--uk-semo-ink', '--uk-dong-ink'];
  /* 단계별 그림: t1·t2 = 얼굴 있는 도형, t3~ = 집 가구(공유 룸 아이템과 같은 것), 위쪽은 가족 */
  const TIER = {
    '0:3': { item: 'b_drawer' }, '0:4': { item: 'b_tv' }, '0:5': { item: 'b_table' }, '0:6': { item: 'b_sofa' }, '0:7': { item: 'b_nemo_living' },
    '1:3': { item: 'b_plant' }, '1:4': { item: 'b_lamp' }, '1:5': { item: 'b_shelf' }, '1:6': { item: 'b_suitcase' }, '1:7': { item: 'b_semo_home' },
    '2:3': { item: 'b_clock' }, '2:4': { item: 'b_window' }, '2:5': { item: 'b_rug' }, '2:6': { item: 'b_globe' }, '2:7': { item: 'b_dong_study' },
  };
  const NAME = { b_drawer: '서랍장', b_tv: 'TV장', b_table: '식탁', b_sofa: '소파', b_nemo_living: '네모네 거실 한 벌', b_plant: '화분', b_lamp: '램프', b_shelf: '책장', b_suitcase: '여행 가방', b_semo_home: '세모네 신혼집 한 벌', b_clock: '벽시계', b_window: '창문', b_rug: '러그', b_globe: '지구본', b_dong_study: '동그라미네 서재 한 벌' };
  const uri = (svg) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg), cache = {};
  const FACE = (x, y, k) => `<circle cx="${x - 7 * k}" cy="${y}" r="${2.4 * k}" fill="#4A3030"/><circle cx="${x + 7 * k}" cy="${y}" r="${2.4 * k}" fill="#4A3030"/><path d="M${x - 5 * k} ${y + 6 * k}q${5 * k} ${5 * k} ${10 * k} 0" fill="none" stroke="#4A3030" stroke-width="${2.2 * k}" stroke-linecap="round"/>`;
  const CC = ['#F6C28B', '#8FD3F4', '#B7C2F2'], BLUSH = '<circle cx="{a}" cy="{y}" r="4" fill="#FF8FA8" opacity=".6"/>';
  function shape(c, t, shiny) {
    const k = 't' + t + c + (shiny ? 's' : ''); if (cache[k]) return cache[k];
    const big = t >= 2, r = big ? 40 : 30, cx = 50, cy = 52, col = CC[c], st = `fill="${col}" stroke="#4A3030" stroke-width="3.4" stroke-linejoin="round"`;
    let body = c === 0 ? `<rect x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" rx="12" ${st}/>` : c === 1 ? `<path d="M${cx} ${cy - r - 4}L${cx + r + 6} ${cy + r - 2}H${cx - r - 6}z" ${st}/>` : `<circle cx="${cx}" cy="${cy}" r="${r + 2}" ${st}/>`;
    const fy = c === 1 ? cy + 8 : cy, fk = big ? 1.15 : 0.9;
    body += FACE(cx, fy, fk) + (big ? `<circle cx="${cx - 18}" cy="${fy + 6}" r="4.5" fill="#FF8FA8" opacity=".6"/><circle cx="${cx + 18}" cy="${fy + 6}" r="4.5" fill="#FF8FA8" opacity=".6"/>` : '');
    if (shiny) body += `<path d="M82 14l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#FFC933" stroke="#C99A00" stroke-width="1.6"/><path d="M16 22l2 5 5 2-5 2-2 5-2-5-5-2 5-2z" fill="#FFF3B0"/>`;
    return (cache[k] = uri(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${body}</svg>`));
  }
  function pieceEl(c, t, s) {
    const T = TIER[c + ':' + t], d = el('div', 'mg-pc');
    if (!T) { const i = el('img', '', d); i.src = shape(c, t, s); i.style.width = t === 1 ? '70%' : '88%'; }
    else { const it = Room.item(T.item), i = el('img', '', d); i.src = Room.src(it, it.colors[0]); i.style.maxWidth = t === 7 ? '98%' : '90%'; i.style.maxHeight = '88%'; i.style.width = 'auto'; i.style.height = 'auto'; if (t === 7) d.classList.add('top'); }
    d.dataset.c = c; d.dataset.t = t; return d;
  }

  /* ---------------- 저장 ---------------- */
  let SV = (() => { try { const x = JSON.parse(localStorage.getItem(KEY)); if (x && x.v === 1) return x; } catch (e) {} return { v: 1, stars: {}, last: 1 }; })();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(SV)); } catch (e) {} };
  const totalStars = () => Object.values(SV.stars).reduce((a, b) => a + b, 0);
  const unlocked = (n) => n === 1 || SV.stars[n - 1] > 0 || !!MG.unlockAll;
  let D, LV, S, hist, cur, roomOK = false;

  /* ---------------- 홈 ---------------- */
  GF.screen('mhome', {
    bare: true,
    enter(r) {
      r.classList.add('uk', 'mg'); GF.bg('indoor', r);
      const tb = UK.topbar({ back: false, home: false, stars: totalStars(), muted: GF.state.settings.mute, onSound: () => { GF.state.settings.mute = !GF.state.settings.mute; GF.Store.save(); GF.bgm.sync(); GF.screens.mhome.enter(r); } }, r); tb.bar.style.cssText += ';position:absolute;left:0;right:0;top:0;z-index:5';
      const t = el('div', 'mg-ttl', r, '<div class="uk-title">도형 합치기</div><div class="mg-sub">같은 도형을 합쳐 집을 채워요</div>');
      const fam = el('div', 'mg-fam', r); ['nemo_dad.joy', 'wife.joy', 'dong_dad.joy'].forEach((id) => fam.appendChild(GF.img(id)));
      const last = Math.min(D.levels.length, Math.max(1, SV.last || 1));
      const b1 = UK.btn({ text: '이어서 하기 · 레벨 ' + last, icon: 'play', cls: 'block', onclick: () => GF.go('mplay', { n: last }) }, el('div', 'mg-btns', r));
      const row = el('div', 'mg-btns2', r);
      UK.btn({ text: '레벨', icon: 'shapes', cls: 'sky', onclick: () => GF.go('mlevels') }, row); UK.btn({ text: '우리 집', icon: 'home', cls: 'gold', onclick: () => GF.go('mhouse') }, row);
      const foot = el('div', 'mg-foot', r, '별 ' + totalStars() + ' · 가구 ' + Room.ownedCount() + '/' + D.roomTotal);
    },
  });

  /* ---------------- 레벨 선택 ---------------- */
  GF.screen('mlevels', {
    bare: true,
    enter(r) {
      r.classList.add('uk', 'mg'); GF.bg('indoor', r);
      const tb = UK.topbar({ stars: totalStars(), onBack: () => GF.back(), onHome: () => GF.home2(), muted: GF.state.settings.mute, onSound: () => { GF.state.settings.mute = !GF.state.settings.mute; GF.Store.save(); GF.bgm.sync(); } }, r); tb.bar.style.cssText += ';position:absolute;left:0;right:0;top:0;z-index:5';
      const sc = el('div', 'mg-scroll', r);
      D.chapters.forEach((name, ci) => {
        const ls = D.levels.filter((l) => l.chapter === ci + 1); if (!ls.length) return;
        const got = ls.reduce((a, l) => a + (SV.stars[l.id] || 0), 0);
        el('div', 'mg-ch', sc, `<b>${ci + 1}장 · ${name}</b><span>★ ${got}/${ls.length * 3}</span>`);
        const g = el('div', 'mg-lv', sc);
        ls.forEach((l) => {
          const open = unlocked(l.id), st = SV.stars[l.id] || 0, b = el('button', 'mg-l' + (open ? '' : ' off') + (l.tag === 'rest' ? ' rest' : ''), g, `<span>${l.id}</span><i>${'★'.repeat(st)}${'☆'.repeat(3 - st)}</i>`);
          b.onclick = () => { if (!open) { GF.sfx('hmm'); UK.toast('앞 레벨을 먼저 깨 보세요', r); return; } GF.sfx('pick'); GF.go('mplay', { n: l.id }); };
        });
      });
      const cur2 = sc.querySelector('.mg-l:not(.off):last-of-type'); setTimeout(() => { const last = [...sc.querySelectorAll('.mg-l')].filter((x) => !x.classList.contains('off')).pop(); last && last.scrollIntoView({ block: 'center' }); }, 30);
    },
  });
  GF.home2 = () => { GF.stack = []; GF.go('mhome'); };

  /* ---------------- 플레이 ---------------- */
  const TIPS = { 1: '같은 도형을 옆에 놓으면 합쳐져요', 2: '네모 셋이 맞닿으면 한꺼번에 합쳐지고, 조각 하나를 돌려받아요', 3: '목표 도형을 만들면 클리어!', 4: '반짝이는 세모는 두 단계 껑충 뛰어요', 8: '동그라미는 정확히 둘씩만 합쳐져요' };
  GF.screen('mplay', {
    bare: true,
    enter(r, p) {
      r.classList.add('uk', 'mg'); GF.bg('indoor', r); LV = D.levels.find((l) => l.id === p.n) || D.levels[0]; S = M.newGame(LV); hist = []; SV.last = LV.id; save();
      const tb = UK.topbar({ stars: totalStars(), onBack: () => GF.back(), onHome: () => GF.home2(), muted: GF.state.settings.mute, onSound: () => { GF.state.settings.mute = !GF.state.settings.mute; GF.Store.save(); GF.bgm.sync(); } }, r); tb.bar.style.cssText += ';position:absolute;left:0;right:0;top:0;z-index:5';
      const hd = el('div', 'mg-hd', r), goals = el('div', 'mg-goals', r), board = el('div', 'mg-board', r), dock = el('div', 'mg-dock', r), tip = el('div', 'uk-caption mg-tip', r);
      hd.innerHTML = `<b>레벨 ${LV.id}</b><span>${D.chapters[LV.chapter - 1]}${LV.tag === 'rest' ? ' · 쉬어 가기' : ''}</span>`;
      const W = LV.cols * 62 + 8, cs = 62; board.style.cssText = `width:${W}px;height:${LV.rows * cs + 8}px`;
      const cells = []; for (let i = 0; i < LV.cols * LV.rows; i++) { const c = el('button', 'mg-cell', board); c.style.cssText = `left:${(i % LV.cols) * cs + 4}px;top:${((i / LV.cols) | 0) * cs + 4}px;width:${cs - 4}px;height:${cs - 4}px`; c.setAttribute('aria-label', '칸 ' + (i + 1)); c.onclick = () => doPlace(i); cells.push(c); }
      const cur = el('div', 'mg-cur', dock), nxt = el('div', 'mg-next', dock), btns = el('div', 'mg-btns3', dock);
      const bu = UK.round({ icon: 'replay', cls: 'sm', label: '되돌리기', onclick: undo }, btns), bh = UK.round({ icon: 'info', cls: 'sm', label: '힌트', onclick: hint }, btns), br = UK.round({ icon: 'close', cls: 'sm', label: '다시', onclick: () => GF.screens.mplay.enter(r.firstChild ? (r.innerHTML = '', r) : r, { n: LV.id }) }, btns);
      let hintCell = null, busy = false, undone = 0;
      function goalChips() { goals.innerHTML = ''; S.goals.forEach((g) => { const have = Math.min(g.n, S.made[M.key(g.c, g.t)] || 0), ch = el('div', 'mg-goal' + (have >= g.n ? ' ok' : ''), goals); ch.appendChild(pieceEl(g.c, g.t, 0)); el('span', '', ch, have + '/' + g.n); }); const left = el('div', 'mg-left', goals, '<b>' + M.left(S) + '</b><span>남은 조각</span>'); }
      function draw(ev) {
        cells.forEach((c, i) => { c.innerHTML = ''; c.classList.toggle('hint', i === hintCell); const q = S.cells[i]; if (q) { const pe = pieceEl(q.c, q.t, q.s); if (ev && ev.some((e) => e.at === i)) pe.classList.add('pop'); c.appendChild(pe); c.classList.add('full'); } else c.classList.remove('full'); });
        cur.innerHTML = ''; nxt.innerHTML = ''; const q = S.q[S.qi]; if (q) { cur.appendChild(pieceEl(q.c, q.t, q.s)); el('em', '', cur, '지금'); }
        for (let k = 1; k <= 2; k++) { const n = S.q[S.qi + k]; if (n) nxt.appendChild(pieceEl(n.c, n.t, n.s)); }
        goalChips(); bu.style.opacity = hist.length && undone < 1 ? 1 : 0.4;
        if (!ev) tip.style.display = TIPS[LV.id] ? 'block' : 'none', tip.textContent = TIPS[LV.id] || '';
      }
      function doPlace(i) {
        if (busy || S.cells[i] || M.left(S) <= 0) { if (S.cells[i]) GF.sfx('hmm'); return; }
        hist.push(M.clone(S)); tip.style.display = 'none'; hintCell = null;
        const before = Object.assign({}, S.made), ev = M.place(S, i); GF.sfx(ev.length ? 'ok' : 'drop'); draw(ev);
        if (ev.some((e) => e.jackpot)) UK.toast('대박! 두 단계 껑충', r); if (ev.some((e) => e.refund)) UK.toast('조각 하나를 돌려받았어요', r);
        ev.forEach((e) => { const T = TIER[e.c + ':' + e.t]; if (T && T.item && roomOK) { if (Room.grant(T.item)) UK.toast('새 가구 · ' + NAME[T.item], r); } });
        if (ev.length) { const rc = cells[i].getBoundingClientRect(); try { GF.burst(r, 0, 0, 0); } catch (e) {} }
        if (M.won(S)) finish(); else if (M.lost(S)) lose();
      }
      function undo() { if (!hist.length || busy || undone >= 1) { if (undone >= 1) UK.toast('되돌리기는 한 판에 한 번이에요', r); return; } undone++; S = hist.pop(); hintCell = null; GF.sfx('tap'); draw(); }
      function hint() { const c = M.candidates(S, 1); if (!c.length) return; hintCell = c[0]; GF.sfx('pick'); draw(); }
      function finish() {
        busy = true; const st = M.stars(S, LV), first = !SV.stars[LV.id], gain = Math.max(0, st - (SV.stars[LV.id] || 0)); SV.stars[LV.id] = Math.max(SV.stars[LV.id] || 0, st); save();
        setTimeout(() => {
          const next = D.levels.find((l) => l.id === LV.id + 1), chips = [{ icon: 'star', text: '★ ' + st }]; if (M.left(S) > 0) chips.push({ icon: 'gift', text: '남은 조각 ' + M.left(S) });
          UK.result({ title: first ? '클리어!' : '잘했어요!', stars: st, chips, parent: r, onNext: next ? () => GF.replace('mplay', { n: next.id }) : null, nextText: '다음 레벨', onRetry: () => GF.replace('mplay', { n: LV.id }), retryText: '다시', onHome: () => GF.home2(), homeText: '처음으로' });
        }, 650);
      }
      function lose() { busy = true; UK.toast('한 번 더!', r); GF.sfx('hmm'); setTimeout(() => GF.replace('mplay', { n: LV.id }), 650); }   // 지면 벌 없이 즉시 다시(하트·대기시간 없음)
      MG.debug.cells = cells; MG.debug.place = (i) => doPlace(i); MG.debug.state = () => S; MG.debug.level = () => LV; MG.debug.undo = undo; MG.debug.hint = hint;
      draw();
    },
  });

  /* ---------------- 우리 집 ---------------- */
  GF.screen('mhouse', {
    bare: true,
    enter(r) {
      r.classList.add('uk', 'mg'); GF.bg('indoor', r);
      const tb = UK.topbar({ stars: totalStars(), onBack: () => GF.back(), onHome: () => GF.home2(), muted: GF.state.settings.mute, onSound: () => { GF.state.settings.mute = !GF.state.settings.mute; GF.Store.save(); GF.bgm.sync(); } }, r); tb.bar.style.cssText += ';position:absolute;left:0;right:0;top:0;z-index:5';
      const sc = el('div', 'mg-scroll', r); sc.style.top = '70px'; Room.house(sc, { room: 'nemo' });
    },
  });

  /* ---------------- 부팅 ---------------- */
  async function loadCodeChars() {
    try {
      const code = window.GF_CODECHARS || await (await fetch(GF.base + 'src/characters.js')).text(), fake = {}; new Function('window', code)(fake);
      const C = fake.GF; GF.art = GF.art || {};
      ['good', 'joy'].forEach((emo) => { const g = C.dongMom({ cx: 70, cy: 58, r: 44, emo, item: null }), W = 140, H = 150;
        GF.art['code.dong_mom.' + emo] = { src: uri('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + W + ' ' + H + '" width="' + W * 3 + '" height="' + H * 3 + '">' + C.ROUGH_DEFS.replace(/^<svg[^>]*>|<\/svg>$/g, '') + C.CHAR_STYLE + g + '</svg>'), w: W, h: H }; });
    } catch (e) { console.error('code chars', e); }
  }
  MG.start = async function (opts) {
    UK.mode('adult');
    await GF.boot(Object.assign({ dataNames: ['chars', 'anchors', 'sounds', 'merge_levels', 'room_items', 'art_slots'], storeKey: 'gf:merge:ui:v1', async start() {
      D = GF.data.merge_levels; const RD = GF.data.room_items; D.roomTotal = RD.items.length;
      Room.init({ data: RD, game: 'merge', mode: 'adult', autoPlace: true, store: Object.assign({}, { key: 'gf:house:adult:v1', get() { try { return JSON.parse(localStorage.getItem(this.key)); } catch (e) { return null; } }, set(v) { try { localStorage.setItem(this.key, JSON.stringify(v)); } catch (e) {} } }), charSrc: (id) => GF.src(id), slot: (k, id) => GF.slot(k === 'room' ? 'room' : k, id) });
      roomOK = true; $('safe').classList.add('uk'); GF.go('mhome');
      MG.debug.D = () => D; MG.debug.SV = () => SV; MG.debug.reset = () => { SV = { v: 1, stars: {}, last: 1 }; save(); };
    } }, opts || {}));
  };
  const $ = (id) => document.getElementById(id);
})();
