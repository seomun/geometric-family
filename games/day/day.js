/* 막둥이의 하루(유아) — 양치·옷 입기·밥·장난감 정리·잠자리 롤플레이 5종. 판 data/day_levels.json · 사연 data/day_extra.json · 집(아이 방) engine/room · 키트 UK.
   유아 원칙(games/KIDS_COMPLIANCE.md): 놀이 화면에 글자 없음(그림·점·손가락·소리) · 실패 없음(틀리면 갸웃·되돌아감) · 시간 제한 없음 · 보호자 잠금 뒤에만 설정·가족 집 · 외부 링크·권한·광고·결제 0. */
(function () {
  'use strict';
  const el = UK.el, G = DayGen;
  const DY = (window.DAY = { debug: {} });
  const KEY = 'gf:day:v1';
  const REW = { 3: 'y_cup', 6: 'y_paste', 9: 'y_hanger', 12: 'y_hat', 15: 'y_bowl', 18: 'y_spoon', 21: 'y_toybox', 24: 'y_ball', 27: 'y_moon', 30: 'y_pillow', 33: 'y_towel', 36: 'y_soap', 39: 'y_mat', 42: 'y_duck', 45: 'y_boots', 48: 'y_book', 51: 'y_quilt', 54: 'y_clock', 57: 'y_cup2', 60: 'y_star' };
  const slow = (ms) => (DY.fast ? 0 : ms);
  const SCENE_BG = ['indoor2'];
  /* ---------------- 저장 ---------------- */
  const blank = () => ({ v: 1, done: {}, last: 1, daily: { date: '', done: 0 }, shards: 0, intro: 0, tips: {} });
  let SV = (() => { try { const x = JSON.parse(localStorage.getItem(KEY)); if (x && x.v >= 1) return Object.assign(blank(), x); } catch (e) {} return blank(); })();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(SV)); } catch (e) {} };
  const doneCount = () => Object.keys(SV.done).length;
  const unlocked = (n) => n === 1 || !!SV.done[n - 1] || !!DY.unlockAll;
  let D, X;
  GF.home = () => { GF.stack = []; GF.go('dhome'); }; GF.home2 = GF.home;
  GF.pill = () => UK.icon('star') + '<span>' + doneCount() + '</span>';
  const bar = () => GF.refreshBar && GF.refreshBar();
  const now = () => new Date(), pad = (n) => String(n).padStart(2, '0'), today = () => { const d = now(); return d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()); };
  const dayNum = () => { const d = now(); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000); };
  function dailyLevel() { const d = +today(), n = 1 + ((dayNum() % 5) * G.PER) + (d % G.PER), L = G.make(n, d); L.id = 'daily'; L.kind = 'daily'; return L; }
  const TOOTH = [[99, 330], [153, 330], [207, 330], [261, 330], [99, 430], [153, 430], [207, 430], [261, 430]];
  const svgWrap = (b) => '<svg viewBox="0 0 360 640">' + b + '</svg>';
  const THEME_SVG = {
    teeth: svgWrap('<rect x="30" y="170" width="300" height="340" rx="96" fill="#F9D9A6" stroke="#6b5443" stroke-width="5"/><path d="M92 252q22-24 44 0M224 252q22-24 44 0" fill="none" stroke="#6b5443" stroke-width="6" stroke-linecap="round"/><circle cx="70" cy="300" r="22" fill="#FF9AA8" opacity=".8"/><circle cx="290" cy="300" r="22" fill="#FF9AA8" opacity=".8"/><ellipse cx="180" cy="380" rx="124" ry="92" fill="#8E3040" stroke="#6b5443" stroke-width="5"/><ellipse cx="180" cy="452" rx="62" ry="26" fill="#E8707E"/>' + TOOTH.map((t) => '<rect x="' + (t[0] - 25) + '" y="' + (t[1] - 25) + '" width="50" height="50" rx="14" fill="#fff" stroke="#E4DDE0" stroke-width="3"/>').join('')),
    hands: svgWrap([[40, 6], [190, 6]].map((o) => '<rect x="' + o[0] + '" y="250" width="130" height="220" rx="46" fill="#F9D9A6" stroke="#6b5443" stroke-width="5"/>' + [0, 1, 2, 3].map((i) => '<rect x="' + (o[0] + 6 + i * 30) + '" y="190" width="24" height="86" rx="12" fill="#F9D9A6" stroke="#6b5443" stroke-width="4"/>').join('')).join('') + '<rect x="40" y="250" width="130" height="30" fill="#F9D9A6"/><rect x="190" y="250" width="130" height="30" fill="#F9D9A6"/><ellipse cx="180" cy="520" rx="150" ry="26" fill="#BFE8FF" opacity=".8"/>'),
    face: svgWrap('<rect x="30" y="170" width="300" height="340" rx="96" fill="#F9D9A6" stroke="#6b5443" stroke-width="5"/><path d="M92 282q22-24 44 0M224 282q22-24 44 0" fill="none" stroke="#6b5443" stroke-width="6" stroke-linecap="round"/><circle cx="70" cy="340" r="20" fill="#FF9AA8" opacity=".8"/><circle cx="290" cy="340" r="20" fill="#FF9AA8" opacity=".8"/><path d="M150 380q30 24 60 0" fill="none" stroke="#6b5443" stroke-width="6" stroke-linecap="round"/>'),
    bath: svgWrap('<rect x="70" y="190" width="220" height="270" rx="100" fill="#F9D9A6" stroke="#6b5443" stroke-width="5"/><path d="M122 250q18-20 36 0M202 250q18-20 36 0" fill="none" stroke="#6b5443" stroke-width="6" stroke-linecap="round"/><rect x="24" y="430" width="312" height="110" rx="46" fill="#8FD3F4" stroke="#6b5443" stroke-width="5" opacity=".92"/><circle cx="60" cy="410" r="16" fill="#fff" opacity=".9"/><circle cx="310" cy="400" r="12" fill="#fff" opacity=".9"/><circle cx="288" cy="428" r="9" fill="#fff" opacity=".9"/>'),
  };
  /** 로컬 좌표(360×640): 화면 root 기준 */
  const toLocal = (r, e) => { const b = r.getBoundingClientRect(), k = b.width / 360; return { x: (e.clientX - b.left) / k, y: (e.clientY - b.top) / k }; };
  const SLOT_OF = { '🪥': 'brush', '🧢': 'cloth:cap', '👕': 'cloth:tee', '🩴': 'cloth:sandal', '🧣': 'cloth:scarf', '🧥': 'cloth:coat', '🧦': 'cloth:socks', '☂️': 'cloth:umbrella', '🥾': 'cloth:boots', '☀️': 'weather:sun', '❄️': 'weather:cold', '🌧️': 'weather:rain', '🍚': 'food:rice', '🥕': 'food:carrot', '🍎': 'food:apple', '🥦': 'food:broccoli', '🍌': 'food:banana', '🥄': 'spoon', '🐢': 'turtle', '⚽': 'toy:ball', '🚗': 'toy:car', '🧱': 'toy:block', '🧸': 'toy:bear', '💡': 'light', '🌙': 'moon', '🧼': 'soap', '🧽': 'cloth2', '🍪': 'food:cookie', '🥛': 'food:milk', '🍉': 'food:watermelon', '🍙': 'food:riceball', '🧀': 'food:cheese', '👟': 'shoe:sneaker', '👞': 'shoe:dress', '📕': 'book:red', '📗': 'book:green', '📘': 'book:blue', '📙': 'book:orange' };
  /** 그림: 슬롯 GF.slot('day', 키)가 있으면 그 그림, 없으면 임시 이모지(ASSET_LIST day:*) */
  const em = (parent, ch, size, cls) => { const d = el('div', 'dy-em ' + (cls || ''), parent), sl = SLOT_OF[ch] && GF.slot('day', SLOT_OF[ch]); if (sl) { const i = el('img', '', d); i.src = sl; i.style.cssText = 'width:100%;height:100%;object-fit:contain;pointer-events:none'; d.style.width = d.style.height = size + 'px'; d.dataset.ch = ch; d.textContent = ''; d.appendChild(i); d.title = ''; } else d.textContent = ch; d.style.fontSize = size + 'px'; return d; };
  const at = (d, x, y) => { d.style.left = x + 'px'; d.style.top = y + 'px'; return d; };

  /* ---------------- 홈 ---------------- */
  GF.screen('dhome', {
    bare: false,
    enter(r) {
      r.classList.add('uk', 'dy'); GF.bg('home', r); bar();
      el('div', 'dy-ttl', r, '<div class="uk-title">막둥이의 하루</div>');
      GF.hero(r, 'day'); const fam = el('div', 'dy-fam', r); ['nemo_kids.kid1', 'baby.joy', 'wife.joy'].forEach((id) => fam.appendChild(GF.img(id)));
      const row = el('div', 'dy-cards', r);
      const c1 = el('button', 'dy-card', row, UK.icon('play')); c1.style.background = '#FFE0E8'; c1.setAttribute('aria-label', 'day'); c1.onclick = () => { GF.sfx('pick'); GF.go('dmap'); };
      const c2 = el('button', 'dy-card', row, UK.icon('home')); c2.style.background = '#FFE3C2'; c2.setAttribute('aria-label', 'house'); c2.onclick = () => { GF.sfx('pick'); GF.go('dhouse'); };
      if (!SV.intro) { SV.intro = 1; save(); setTimeout(() => { if (c1.isConnected) UK.finger(r, c1); }, 900); }
    },
  });
  /* ---------------- 하루 길(장 지도): 글자 없이 장면 그림 5개 ---------------- */
  GF.screen('dmap', {
    bare: false,
    enter(r) {
      r.classList.add('uk', 'dy'); GF.bg('home', r); bar();
      const path = el('div', 'dy-path', r); const nxt = D.levels.find((l) => !SV.done[l.id]) || D.levels[D.levels.length - 1];
      let target = null;
      D.chapters.forEach((c, ci) => {
        const ls = D.levels.filter((l) => l.chapter === ci + 1), full = ls.every((l) => SV.done[l.id]), open = unlocked(ls[0].id), cur = nxt.chapter === ci + 1;
        const b = el('button', 'dy-scene' + (full ? ' full' : '') + (open ? '' : ' off') + (cur ? ' cur' : ''), path); b.setAttribute('aria-label', c.type);
        em(b, c.icon, 46); const dots = el('div', 'dy-dots', b); ls.forEach((l) => el('i', SV.done[l.id] ? 'on' : '', dots));
        if (!open) el('i', 'lk', b, '🔒');
        b.onclick = () => { if (!open) { GF.sfx('hmm'); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); return; } const l = ls.find((x) => !SV.done[x.id]) || ls[0]; GF.sfx('pick'); GF.go('dplay', { n: l.id }); };
        if (cur) target = b;
      });
      if (!doneCount()) setTimeout(() => { if (target && target.isConnected) UK.finger(r, target); }, 700);
      setTimeout(() => { if (target && target.isConnected) target.scrollIntoView({ block: 'center' }); }, 30);
    },
  });

  /* ---------------- 플레이: 놀이 5종 ---------------- */
  GF.screen('dplay', {
    bare: false,
    enter(r, p) {
      r.classList.add('uk', 'dy'); const LV = p.level || D.levels.find((l) => l.id === p.n) || D.levels[0]; GF.bg(SCENE_BG[0], r); bar(); if (!p.level) { SV.last = LV.id; save(); }
      const stage = el('div', 'dy-stage', r), pips = el('div', 'dy-pips', r), gained = []; let finished = false, goalN = 1, got = 0; const idle = { t: null };
      const pip = (n) => { got = n; pips.innerHTML = ''; for (let i = 0; i < goalN; i++) el('i', i < got ? 'on' : '', pips); };
      const setGoal = (n) => { goalN = n; pip(0); };
      const kick = (fn, ms) => { clearTimeout(idle.t); idle.t = setTimeout(() => { if (!finished && stage.isConnected) fn(); }, slow(ms || 6000)); };   // 가만있으면 손가락이 알려 줌(실패 없음)
      const sparkle = (x, y) => { try { GF.burst(document.getElementById('safe'), x, y, 8); } catch (e) {} };
      function finish() {
        if (finished) return; finished = true; clearTimeout(idle.t); GF.sfx('star'); if (!LV.kind) SV.done[LV.id] = 3;
        if (!LV.kind && REW[LV.id] && Room.grant(REW[LV.id])) gained.push(REW[LV.id]);
        if (LV.kind === 'daily' && (SV.daily.date !== today() || !SV.daily.done)) { SV.daily = { date: today(), done: 1 }; SV.shards++; if (SV.shards % X.shardsPerItem === 0) { const it = X.dailyItems.find((id) => !Room.has(id)); if (it && Room.grant(it)) gained.push(it); } }
        save(); GF.refreshBar();
        setTimeout(() => {
          const story = !LV.kind && LV.last && X.stories.find((s) => s.chapter === LV.chapter);
          const result = () => { const nx = !LV.kind && D.levels.find((l) => l.id === LV.id + 1), it = gained[0] && Room.item(gained[0]);
            UK.result({ kid: true, title: '', stars: 3, parent: r, onNext: nx ? () => GF.replace('dplay', { n: nx.id }) : () => GF.home2(), onRetry: () => GF.replace('dplay', LV.kind ? { level: LV } : { n: LV.id }) }); if (it && it.emoji) { const sh = r.querySelector('.uk-sheet'); if (sh) { const b = el('div', 'uk-big', null, it.emoji); sh.insertBefore(b, sh.children[1] || null); } } };
          if (story) { const ov = el('div', 'abs', r); ov.style.cssText = 'inset:0;z-index:60'; GF.story(ov, story.cuts.map((c) => ({ bg: 'indoor', text: c.text, chars: c.chars.map((id, k, a) => ({ id, x: a.length > 1 ? 50 + k * (260 / (a.length - 1)) : 180, y: 600 })), bubble: c.bubble ? { type: c.bubble, at: 0 } : null })), () => { ov.remove(); result(); }); } else result();
        }, slow(900));
      }
      const ACT = {};
      /* 1) 양치: 칫솔을 끌어 문질러 이의 얼룩을 지운다 */
      ACT.brush = () => {
const th = LV.theme || 'teeth', face = el('div', 'dy-face', stage); face.innerHTML = THEME_SVG[th]; const brush = em(stage, { teeth: '🪥', hands: '🧼', face: '🧽', bath: '🧽' }[th], 64, 'dy-brush'); at(brush, 262, 504); const rest = { x: 262, y: 504 };
        const spots = LV.spots.map((s) => { const d = el('div', 'dy-spot', stage); d.style.cssText = `left:${s.x - s.r}px;top:${s.y - s.r}px;width:${2 * s.r}px;height:${2 * s.r}px`; return { d, s, dist: 0, clean: false }; });
        setGoal(spots.length); let down = false, last = null;
        const clean = (o) => { o.clean = true; o.d.classList.add('gone'); GF.sfx('ok', { st: [0, 2, 4, 7, 9, 12, 14][Math.min(got, 6)] }); sparkle(o.s.x, o.s.y); pip(got + 1); if (got >= goalN) finish(); };
        const move = (e) => { const q = toLocal(r, e); at(brush, q.x - 20, q.y - 44); if (last) { const dd = Math.hypot(q.x - last.x, q.y - last.y); spots.forEach((o) => { if (!o.clean && Math.hypot(q.x - o.s.x, q.y - o.s.y) < o.s.r + 14) { o.dist += dd; o.d.style.opacity = Math.max(0.15, 1 - o.dist / (o.s.r * 3.4)); if (o.dist >= o.s.r * 3.4) clean(o); } }); } last = q; };
        stage.addEventListener('pointerdown', (e) => { down = true; last = null; try { stage.setPointerCapture(e.pointerId); } catch (x) {} move(e); });
        stage.addEventListener('pointermove', (e) => { if (down) move(e); });
        const up = () => { down = false; last = null; if (!finished) { at(brush, rest.x, rest.y); kick(hintBrush); } }; stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
        function hintBrush() { const o = spots.find((x) => !x.clean); if (o) { UK.finger(r, o.d, { ms: 4000 }); kick(hintBrush, 8000); } }
        DY.debug.brushTo = (i) => { const o = spots[i]; if (o && !o.clean) { o.dist = o.s.r * 3.4; clean(o); } }; DY.debug.spots = () => spots;
        setTimeout(() => { if (!finished && !SV.tips.brush && stage.isConnected) { UK.finger(r, brush, { to: spots[0].d, ms: 7000 }); SV.tips.brush = 1; save(); } else kick(hintBrush, 5000); }, slow(900));
      };
      /* 2) 옷 입기: 날씨에 맞는 옷을 끌어 막둥이에게 입힌다 */
      ACT.dress = () => {
        const sky = el('div', 'dy-sky ' + LV.weather, stage); em(sky, { sun: '☀️', cold: '❄️', rain: '🌧️' }[LV.weather], 72, 'dy-wx');
        const kid = el('div', 'dy-kid', stage); kid.appendChild(GF.img('baby.joy'));
        const POS = { head: [196, 64], body: [292, 88], feet: [394, 70] }; setGoal(LV.slots.length); const worn = {}, K = LV.slots.length;
        const all = []; LV.slots.forEach((s, si) => s.opts.forEach((o, oi) => all.push({ s, o, si, oi })));   // 옷 칸마다 한 줄(선택지 3개), 막둥이 몸 위로 끌어 놓는다
        all.forEach((it) => {
          const d = em(stage, it.o, 56, 'dy-cloth'); const hx = 180 - (it.s.opts.length - 1) * 50 + it.oi * 100 - 28, hy = 598 - (K - 1 - it.si) * 68 - 28; at(d, hx, hy); let drag = false;
          const mv = (e) => { if (!drag) return; const q = toLocal(r, e); at(d, q.x - 28, q.y - 28); };
          const down = (e) => { if (finished || worn[it.s.slot]) return; drag = true; d.classList.add('lift'); try { d.setPointerCapture(e.pointerId); } catch (x) {} mv(e); e.preventDefault(); };
          const wear = () => { worn[it.s.slot] = 1; d.classList.add('worn'); const [py, fs] = POS[it.s.slot]; d.style.fontSize = fs + 'px'; at(d, 180 - fs / 2, py); stage.querySelectorAll('.dy-cloth').forEach((x) => { if (x !== d && x.dataset.slot === it.s.slot) x.style.opacity = 0; }); pip(got + 1); sparkle(180, py + 30); GF.sfx('drop'); GF.sfx('ok', { st: [0, 4, 7][Math.min(got - 1, 2)] }); if (got >= goalN) finish(); };
          const up = (e) => { if (!drag) return; drag = false; d.classList.remove('lift'); const q = toLocal(r, e), onKid = q.x > 80 && q.x < 280 && q.y > 190 && q.y < 440;
            if (onKid && it.o === it.s.ok) wear(); else { if (onKid) { GF.sfx('hmm'); d.classList.add('shake'); setTimeout(() => d.classList.remove('shake'), 400); } at(d, hx, hy); } kick(hintDress); };
          d.dataset.slot = it.s.slot; d.addEventListener('pointerdown', down); d.addEventListener('pointermove', mv); d.addEventListener('pointerup', up); d.addEventListener('pointercancel', up); d._ok = it.o === it.s.ok; d._it = it; d._wear = wear;
        });
        function hintDress() { const d = [...stage.querySelectorAll('.dy-cloth')].find((x) => x._ok && !worn[x._it.s.slot]); if (d) { UK.finger(r, d, { to: kid, ms: 4000 }); kick(hintDress, 8000); } }
        DY.debug.wear = (slotIdx) => { const s = LV.slots[slotIdx], d = [...stage.querySelectorAll('.dy-cloth')].find((x) => x._it.s === s && x._ok); if (d && !worn[s.slot]) d._wear(); };
        kick(hintDress, 3500);
      };
      /* 3) 아침밥: 숟가락을 천천히 눌러 꼭꼭 — 빠르게 누르면 거북이가 기다려 줄 뿐 */
      ACT.chew = () => {
        const bowl = em(stage, LV.foods[0], 120, 'dy-food'); at(bowl, 120, 250); const kid = el('div', 'dy-kid small', stage); kid.appendChild(GF.img('baby.joy'));
        const turtle = em(stage, '🐢', 60, 'dy-turtle'); at(turtle, 262, 440); const spoon = el('button', 'dy-spoon', stage, '<span>🥄</span>'); spoon.setAttribute('aria-label', 'chew');
        const ring = el('div', 'dy-ring', spoon); let foodI = 0, chews = 0, lastT = 0; setGoal(LV.foods.length * LV.chews); const marks = el('div', 'dy-marks', stage);
        const drawMarks = () => { marks.innerHTML = ''; for (let i = 0; i < LV.chews; i++) el('i', i < chews ? 'on' : '', marks); };
        drawMarks();
        const tap = () => { if (finished) return; const t = performance.now() * (DY.fast ? 1 : 1), gap = LV.gap; if (lastT && t - lastT < gap && !DY.fast) { GF.sfx('hmm'); turtle.classList.add('wiggle'); setTimeout(() => turtle.classList.remove('wiggle'), 500); return; }   // 너무 빠름: 점수 변화 없이 거북이만 흔들
          lastT = t; chews++; GF.sfx('tap'); spoon.classList.add('chew'); setTimeout(() => spoon.classList.remove('chew'), 250); bowl.style.transform = `scale(${1 - chews * 0.12 / LV.chews})`; pip(got + 1); drawMarks();
          if (chews >= LV.chews) { GF.sfx('ok', { st: foodI * 4 }); sparkle(180, 300); foodI++; chews = 0; lastT = 0; if (foodI >= LV.foods.length) { finish(); return; } bowl.textContent = LV.foods[foodI]; bowl.style.transform = ''; drawMarks(); } kick(hintChew); };
        spoon.addEventListener('pointerdown', (e) => { e.preventDefault(); tap(); });
        function hintChew() { UK.finger(r, spoon, { tap: true, ms: 4000 }); kick(hintChew, 8000); }
        DY.debug.chew = tap; DY.debug.chewAll = () => { DY.fast = true; for (let i = 0; i < LV.foods.length * LV.chews + 2 && !finished; i++) tap(); };
        setTimeout(() => { if (!finished && !SV.tips.chew && stage.isConnected) { UK.finger(r, spoon, { tap: true, ms: 6000 }); SV.tips.chew = 1; save(); } else kick(hintChew, 5000); }, slow(900));
      };
      /* 4) 장난감 정리: 장난감을 같은 그림의 상자로 끌어 넣는다 */
      ACT.tidy = () => {
        const K = LV.kinds, bw = 90, boxes = K.map((k, i) => { const b = el('div', 'dy-box', stage); const x = 180 - K.length * bw / 2 + i * bw + 6; b.style.cssText = `left:${x}px;top:452px;width:${bw - 12}px;height:96px`; em(b, G.ITEMS[LV.theme || 'toys'][k], 40, 'dy-boxico'); b.dataset.k = k; return b; });
        setGoal(LV.toys.length); const toys = LV.toys.map((t) => { const d = em(stage, G.ITEMS[LV.theme || 'toys'][t.k], 52, 'dy-toy'); at(d, t.x - 26, t.y - 26); d._t = t; d._home = [t.x - 26, t.y - 26]; d._done = false; return d; });
        toys.forEach((d) => { let drag = false;
          d.addEventListener('pointerdown', (e) => { if (finished || d._done) return; drag = true; d.classList.add('lift'); try { d.setPointerCapture(e.pointerId); } catch (x) {} const q = toLocal(r, e); at(d, q.x - 26, q.y - 26); e.preventDefault(); });
          d.addEventListener('pointermove', (e) => { if (!drag) return; const q = toLocal(r, e); at(d, q.x - 26, q.y - 26); });
          const up = (e) => { if (!drag) return; drag = false; d.classList.remove('lift'); const q = toLocal(r, e), b = boxes.find((bx) => { const x = parseFloat(bx.style.left); return q.x > x - 8 && q.x < x + bw + 4 && q.y > 430 && q.y < 570; });
            if (b && +b.dataset.k === d._t.k) put(d, b); else { if (b) { GF.sfx('hmm'); d.classList.add('shake'); setTimeout(() => d.classList.remove('shake'), 400); } at(d, d._home[0], d._home[1]); } kick(hintTidy); }; d.addEventListener('pointerup', up); d.addEventListener('pointercancel', up); });
        function put(d, b) { d._done = true; GF.sfx('drop'); const x = parseFloat(b.style.left) + (bw - 12) / 2 - 26; at(d, x, 478); d.classList.add('in'); setTimeout(() => { d.style.opacity = 0; }, slow(220)); GF.sfx('ok', { st: [0, 2, 4, 7, 9, 12][Math.min(got, 5)] }); pip(got + 1); if (got >= goalN) finish(); }
        function hintTidy() { const d = toys.find((x) => !x._done); if (d) { const b = boxes.find((bx) => +bx.dataset.k === d._t.k); UK.finger(r, d, { to: b, ms: 4000 }); kick(hintTidy, 8000); } }
        DY.debug.put = (i) => { const d = toys[i], b = boxes.find((bx) => +bx.dataset.k === d._t.k); if (d && !d._done) put(d, b); }; DY.debug.toys = () => toys;
        setTimeout(() => { if (!finished && !SV.tips.tidy && stage.isConnected) { const d = toys[0], b = boxes.find((bx) => +bx.dataset.k === d._t.k); UK.finger(r, d, { to: b, ms: 7000 }); SV.tips.tidy = 1; save(); } else kick(hintTidy, 5000); }, slow(900));
      };
      /* 5) 잠자리: 불을 하나씩 끄고 이불을 끌어 덮는다 */
      ACT.sleep = () => {
        const room = el('div', 'dy-night', stage); const kid = el('div', 'dy-kid bed', stage); kid.appendChild(GF.img('baby.joy')); const moon = em(stage, '🌙', 64, 'dy-moon'); at(moon, 262, 176);
        const lights = LV.lights.map((p) => { const b = el('button', 'dy-light on', stage, '💡'); b.style.cssText = `left:${p.x - 32}px;top:${p.y - 32}px`; b.setAttribute('aria-label', 'light'); return b; });
        const quilt = em(stage, '🛏️', 120, 'dy-quilt'); at(quilt, 120, 540); quilt.style.opacity = 0.0; const blanket = el('div', 'dy-blanket', stage); const pull = em(blanket, '🧸', 44, 'dy-pull');
        setGoal(LV.lights.length + 1); let off = 0, covered = false;
        const check = () => { room.style.opacity = 0.62 * (1 - off / lights.length) + 0.18; if (off >= lights.length && covered) { moon.classList.add('big'); setTimeout(finish, slow(500)); } };
        lights.forEach((b) => b.addEventListener('pointerdown', (e) => { e.preventDefault(); if (finished || !b.classList.contains('on')) return; b.classList.remove('on'); b.textContent = '·'; off++; GF.sfx('tap'); GF.sfx('ok', { st: [0, 2, 4, 7, 9][Math.min(off - 1, 4)] }); pip(got + 1); check(); kick(hintSleep); }));
        let dragB = false, y0 = 0; const cover = () => { if (covered) return; covered = true; blanket.classList.add('up'); GF.sfx('drop'); pip(got + 1); check(); };
        pull.addEventListener('pointerdown', (e) => { dragB = true; try { pull.setPointerCapture(e.pointerId); } catch (x) {} y0 = toLocal(r, e).y; e.preventDefault(); });
        pull.addEventListener('pointermove', (e) => { if (!dragB) return; const q = toLocal(r, e), dy = Math.max(0, Math.min(150, y0 - q.y)); blanket.style.transform = `translateY(${-dy}px)`; if (dy > 100) { dragB = false; blanket.style.transform = ''; cover(); } });
        const up = () => { if (dragB) { dragB = false; blanket.style.transform = ''; kick(hintSleep); } }; pull.addEventListener('pointerup', up); pull.addEventListener('pointercancel', up);
        function hintSleep() { const b = lights.find((x) => x.classList.contains('on')); if (b) UK.finger(r, b, { tap: true, ms: 4000 }); else if (!covered) UK.finger(r, pull, { to: kid, ms: 4000 }); kick(hintSleep, 8000); }
        DY.debug.lights = () => lights; DY.debug.light = (i) => { const b = lights[i]; if (b && b.classList.contains('on')) { b.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); } }; DY.debug.cover = cover;
        setTimeout(() => { if (!finished && !SV.tips.sleep && stage.isConnected) { UK.finger(r, lights[0], { tap: true, ms: 6000 }); SV.tips.sleep = 1; save(); } else kick(hintSleep, 5000); }, slow(900));
      };
      DY.debug.level = () => LV; DY.debug.finished = () => finished; DY.debug.got = () => [got, goalN]; DY.debug.stage = stage;
      ACT[LV.type]();
    },
  });
  GF.screen('dhouse', {
    bare: false,
    enter(r) { r.classList.add('uk', 'dy'); GF.bg('home', r); bar(); const sc = el('div', 'abs', r); sc.style.cssText = 'left:0;right:0;top:70px;bottom:0;overflow-y:auto;touch-action:pan-y'; Room.house(sc, { room: 'kid' }); },
  });
  DY.start = async function (opts) {
    await GF.boot(Object.assign({ dataNames: ['chars', 'anchors', 'sounds', 'day_levels', 'day_extra', 'room_items', 'art_slots'], storeKey: 'gf:day:ui:v1', async start() {
      D = GF.data.day_levels; X = GF.data.day_extra;
      Room.init({ data: GF.data.room_items, game: 'day', mode: 'kid', autoPlace: true, guard: (cb) => GF.gate(cb), store: Room.sharedStore('gf:house:kid:v1'), charSrc: (id) => GF.src(id), slot: (k, id) => GF.slot(k, id) });
      document.getElementById('safe').classList.add('uk'); GF.go('dhome');
      DY.debug.D = () => D; DY.debug.SV = () => SV; DY.debug.reset = () => { SV = blank(); save(); }; DY.debug.dailyLevel = dailyLevel; DY.debug.X = () => X; DY.debug.REW = REW;
    } }, opts || {}));
  };
})();
