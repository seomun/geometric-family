/* 기하학 가족 놀이터 — 공통 엔진. 의존성 없음. 게임은 GF.mode(name, {setup, free}) 만 구현한다.
   화면: home · map · book · stages · round · playroom · album  /  모듈: core input audio store chars book stage reward gate */
(function () {
  'use strict';
  const W = 360, H = 640;
  const GF = (window.GF = { W, H, base: '../', data: {}, modes: {}, screens: {}, stack: [], state: null });
  const $ = (id) => document.getElementById(id);
  function el(tag, cls, parent, html) {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    if (parent) parent.appendChild(e);
    return e;
  }
  GF.el = el;
  const rnd = (a) => a[Math.floor(Math.random() * a.length)];
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  GF.rnd = rnd; GF.shuffle = shuffle;

  /* ---------------- 아이콘 ---------------- */
  const STAR = '<path d="M16 2l4.2 9 9.8 1-7.3 6.6 2.1 9.7L16 23.4 7.2 28.3l2.1-9.7L2 12l9.8-1z" fill="#FFC933" stroke="#E0A200" stroke-width="1.5" stroke-linejoin="round"/>';
  const IC = {
    home: '<svg viewBox="0 0 32 32"><path d="M4 16 16 5l12 11v11h-8v-8h-8v8H4z" fill="#FF8FA8"/></svg>',
    star: '<svg viewBox="0 0 32 32">' + STAR + '</svg>',
    sound: '<svg viewBox="0 0 32 32"><path d="M5 12h5l7-6v20l-7-6H5z" fill="#3A2E39"/><path d="M21 11a7 7 0 0 1 0 10M24 7a12 12 0 0 1 0 18" fill="none" stroke="#3A2E39" stroke-width="2.5" stroke-linecap="round"/></svg>',
    mute: '<svg viewBox="0 0 32 32"><path d="M5 12h5l7-6v20l-7-6H5z" fill="#9a8fa0"/><path d="M21 12l8 8M29 12l-8 8" stroke="#E5566D" stroke-width="3" stroke-linecap="round"/></svg>',
    play: '<svg viewBox="0 0 32 32"><path d="M10 5l16 11-16 11z" fill="#fff"/></svg>',
    again: '<svg viewBox="0 0 32 32"><path d="M16 6a10 10 0 1 0 9.6 7.2" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M27 3v11H16z" fill="#fff"/></svg>',
    lock: '<svg viewBox="0 0 32 32"><rect x="6" y="14" width="20" height="14" rx="4" fill="#9a8fa0"/><path d="M10 14v-3a6 6 0 0 1 12 0v3" fill="none" stroke="#9a8fa0" stroke-width="3"/></svg>',
    book: '<svg viewBox="0 0 64 64"><path d="M6 14c10-4 20-4 26 2v38c-6-6-16-6-26-2z" fill="#FF8FA8"/><path d="M58 14c-10-4-20-4-26 2v38c6-6 16-6 26-2z" fill="#FFC933"/></svg>',
    game: '<svg viewBox="0 0 64 64"><rect x="10" y="10" width="20" height="20" rx="4" fill="#F6C28B"/><path d="M46 8l12 22H34z" fill="#8FD3F4"/><circle cx="20" cy="46" r="11" fill="#3B4A7A"/><rect x="36" y="38" width="20" height="16" rx="4" fill="#6CCB8A"/></svg>',
    album: '<svg viewBox="0 0 64 64"><rect x="8" y="8" width="48" height="48" rx="8" fill="#8FD3F4"/><path d="M32 17l4.6 9.9 10.8 1.2-8 7.3 2.3 10.7L32 40.6l-9.7 5.5 2.3-10.7-8-7.3 10.8-1.2z" fill="#FFC933"/></svg>',
    gshadow: '<svg viewBox="0 0 32 32"><path d="M16 4l12 22H4z" fill="#3A2E39" opacity=".5"/></svg>',
    gfaces: '<svg viewBox="0 0 32 32"><rect x="3" y="7" width="12" height="18" rx="3" fill="#8FD3F4"/><rect x="17" y="7" width="12" height="18" rx="3" fill="#fff" stroke="#3A2E39" stroke-width="1.5"/><circle cx="23" cy="16" r="3" fill="#FF8FA8"/></svg>',
    gpuzzle: '<svg viewBox="0 0 32 32"><path d="M4 4h12v6a3 3 0 1 1 0 6v12H4z" fill="#6CCB8A"/><path d="M16 4h12v24H16V16a3 3 0 1 0 0-6z" fill="#FFC933"/></svg>',
    gpaint: '<svg viewBox="0 0 32 32"><path d="M16 3C8 3 3 9 3 15s4 12 10 12c3 0 3-3 5-3 4 0 11-2 11-9C29 9 24 3 16 3z" fill="#FFC933"/><circle cx="10" cy="14" r="2.5" fill="#FF8FA8"/><circle cx="16" cy="9" r="2.5" fill="#8FD3F4"/><circle cx="22" cy="14" r="2.5" fill="#6CCB8A"/></svg>',
    gshapes: '<svg viewBox="0 0 32 32"><rect x="3" y="3" width="11" height="11" rx="2" fill="#F6C28B"/><path d="M24 3l6 11H18z" fill="#8FD3F4"/><circle cx="9" cy="23" r="6" fill="#3B4A7A"/></svg>',
  };
  GF.IC = IC;
  const starsHTML = (n, cls) => '<div class="stars3 ' + (cls || '') + '">' + [1, 2, 3].map((i) => '<svg viewBox="0 0 32 32" class="' + (i > n ? 'off' : '') + '">' + STAR + '</svg>').join('') + '</div>';
  const dotsHTML = (n) => '<svg viewBox="0 0 56 56" width="56" height="56">' + ({ 1: [[28, 28]], 2: [[17, 28], [39, 28]], 3: [[28, 17], [16, 38], [40, 38]] }[n]).map((p) => '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="8" fill="#fff"/>').join('') + '</svg>';

  /* ---------------- 저장 (localStorage 한 키) ---------------- */
  const KEY = 'gf:v1';
  const fresh = () => ({ v: 1, stages: {}, stickers: {}, seen: {}, settings: { vol: 0.8, mute: false, captions: false }, avatar: null });
  const Store = {
    load() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v === 1) return Object.assign(fresh(), s, { settings: Object.assign(fresh().settings, s.settings) }); } catch (e) {} return fresh(); },
    save() { try { localStorage.setItem(KEY, JSON.stringify(GF.state)); } catch (e) {} },
    reset() { GF.state = fresh(); Store.save(); },
  };
  GF.Store = Store;
  const totalStars = () => Object.values(GF.state.stages).reduce((a, s) => a + (s.stars || 0), 0);

  /* ---------------- 소리 (WebAudio 합성) ---------------- */
  let ac = null;
  function ensureAudio() {
    const A = window.AudioContext || window.webkitAudioContext;
    if (!ac && A) { try { ac = new A(); } catch (e) {} }
    if (ac && ac.state === 'suspended') ac.resume();
  }
  function tone(f, t, d, type, v) {
    if (!ac || GF.state.settings.mute) return;
    const o = ac.createOscillator(), g = ac.createGain(), t0 = ac.currentTime + t;
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t0);
    const vol = (v || 0.25) * GF.state.settings.vol;
    g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    o.connect(g); g.connect(ac.destination); o.start(t0); o.stop(t0 + d + 0.05);
  }
  const SFX = {
    tap() { tone(520, 0, 0.08, 'triangle'); },
    pick() { tone(440, 0, 0.1, 'triangle'); tone(660, 0.06, 0.1, 'triangle'); },
    ok() { tone(523, 0, 0.15, 'triangle'); tone(659, 0.1, 0.15, 'triangle'); tone(784, 0.2, 0.25, 'triangle'); },
    no() { tone(220, 0, 0.18, 'sine', 0.2); tone(180, 0.12, 0.22, 'sine', 0.2); },
    flip() { tone(700, 0, 0.07, 'square', 0.08); },
    star() { tone(784, 0, 0.12, 'triangle'); tone(988, 0.1, 0.12, 'triangle'); tone(1319, 0.2, 0.3, 'triangle'); },
    tada() { [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.3, 'triangle')); },
    page() { tone(330, 0, 0.1, 'sine', 0.15); },
  };
  GF.sfx = (n) => { ensureAudio(); if (SFX[n]) SFX[n](); };
  let voiceEl = null;
  GF.say = function (id) {                 // 녹음이 들어오면 data.voice[id] = 'voice/xx.mp3' 로 연결
    const f = GF.data.voice && GF.data.voice[id];
    if (voiceEl) { voiceEl.pause(); voiceEl = null; }
    if (!f || GF.state.settings.mute) return;
    try { voiceEl = new Audio(f); voiceEl.volume = GF.state.settings.vol; voiceEl.play().catch(() => {}); } catch (e) {}
  };

  /* ---------------- 캐릭터 ---------------- */
  GF.src = function (id) {
    if (GF.art && GF.art[id]) return GF.art[id].src;     // 코드 그림(data URI)
    let c = GF.data.chars[id];
    if (!c) { const who = id.split('.')[0]; c = GF.data.chars[who + '.good'] || GF.data.chars[who + '.kid1']; if (!c) console.warn('no char', id); }
    return c ? GF.base + c.src : '';
  };
  GF.img = (id, cls) => { const i = new Image(); i.src = GF.src(id); i.draggable = false; if (cls) i.className = cls; return i; };
  GF.aspect = (id) => { if (GF.art && GF.art[id]) return GF.art[id].w / GF.art[id].h; const c = GF.data.chars[id] || GF.data.chars[id.split('.')[0] + '.good']; return c ? c.w / c.h : 1; };

  /* ---------------- 배경 (코드 SVG) ---------------- */
  const sky = (a, b) => '<defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient></defs><rect width="360" height="640" fill="url(#sk)"/>';
  const hill = (y, c, r) => '<ellipse cx="' + r[0] + '" cy="' + y + '" rx="' + r[1] + '" ry="' + r[2] + '" fill="' + c + '"/>';
  const BG = {
    home: () => sky('#FFE9C7', '#FFF6E5') + '<circle cx="300" cy="110" r="46" fill="#FFD36B"/>' + hill(660, '#BFE6A8', [90, 260, 150]) + hill(670, '#9BD98A', [290, 230, 130]),
    stream: () => sky('#BFE8FF', '#F4FBFF') + '<circle cx="290" cy="90" r="38" fill="#FFE27A"/>' + hill(470, '#B6E6A0', [100, 240, 90]) + hill(480, '#9ADB88', [300, 200, 80]) + '<rect y="500" width="360" height="60" fill="#7CC8F0"/><path d="M0 520q30-10 60 0t60 0 60 0 60 0 60 0 60 0" fill="none" stroke="#fff" stroke-width="4" opacity=".7"/><rect y="560" width="360" height="80" fill="#8FD67A"/>',
    bridge: () => sky('#BFE8FF', '#F4FBFF') + '<circle cx="60" cy="90" r="34" fill="#FFE27A"/>' + hill(420, '#B6E6A0', [250, 260, 80]) + '<rect y="450" width="360" height="130" fill="#7CC8F0"/><path d="M0 480q30-10 60 0t60 0 60 0 60 0 60 0 60 0M0 520q30-10 60 0t60 0 60 0 60 0 60 0 60 0" fill="none" stroke="#fff" stroke-width="4" opacity=".6"/><rect x="-10" y="430" width="380" height="26" rx="10" fill="#C98F5A"/><rect x="20" y="395" width="12" height="40" fill="#A8703F"/><rect x="330" y="395" width="12" height="40" fill="#A8703F"/><rect x="0" y="400" width="360" height="8" fill="#A8703F"/><rect y="580" width="360" height="60" fill="#8FD67A"/>',
    hill: () => sky('#FFD9A8', '#FFF0D9') + '<circle cx="80" cy="130" r="50" fill="#FFB347" opacity=".9"/>' + hill(520, '#C9E08A', [180, 330, 170]) + hill(600, '#A9D36E', [60, 220, 90]) + '<rect x="288" y="380" width="14" height="150" fill="#8A5A3B"/><circle cx="295" cy="370" r="64" fill="#7FBF5A"/><circle cx="270" cy="395" r="9" fill="#FF9A3C"/><circle cx="312" cy="380" r="9" fill="#FF9A3C"/><circle cx="296" cy="345" r="9" fill="#FF9A3C"/>',
    field: () => sky('#CDEFFF', '#F7FCFF') + hill(500, '#B6E6A0', [180, 340, 100]) + '<rect y="520" width="360" height="120" fill="#C79A6B"/><path d="M0 560h360M0 600h360" stroke="#A97B4E" stroke-width="6"/>',
    night: () => sky('#1F2A5C', '#4B5C9C') + [[40, 80], [120, 150], [250, 70], [320, 160], [200, 210], [60, 260], [310, 300]].map((p) => '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3" fill="#FFF3B0"/>').join('') + '<circle cx="270" cy="120" r="40" fill="#FFF3B0"/><circle cx="286" cy="110" r="36" fill="#2B3870"/>' + hill(660, '#2F4A6B', [180, 330, 160]),
    house: () => sky('#BFE8FF', '#FFF6E5') + hill(560, '#B6E6A0', [180, 340, 120]) + '<rect y="560" width="360" height="80" fill="#8FD67A"/>',
  };
  GF.bg = function (name, parent) { const d = el('div', 'bg', parent); d.innerHTML = '<svg viewBox="0 0 360 640" preserveAspectRatio="none">' + (BG[name] || BG.home)() + '</svg>'; return d; };

  /* ---------------- 코어: 화면 스택·레터박스·상단바 ---------------- */
  let stage, topbar, scale = 1;
  GF.pt = (e) => { const r = stage.getBoundingClientRect(); return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale }; };
  function fit() {
    scale = Math.min(window.innerWidth / W, window.innerHeight / H);
    stage.style.transform = 'scale(' + scale + ')';
    stage.style.left = Math.round((window.innerWidth - W * scale) / 2) + 'px';
    stage.style.top = Math.round((window.innerHeight - H * scale) / 2) + 'px';
  }
  GF.screen = function (name, def) { def.el = el('div', 'screen', $('stage')); def.name = name; GF.screens[name] = def; return def; };
  function show(name, params) {
    Object.values(GF.screens).forEach((s) => { s.el.classList.remove('on'); s.leave && s.leave(); });
    const s = GF.screens[name];
    s.el.innerHTML = ''; s.el.classList.add('on'); GF.cur = s; s.params = params || {};
    topbar.classList.toggle('hidden', s.bare === true);
    $('b-home').style.visibility = name === 'home' ? 'hidden' : 'visible';
    refreshBar();
    s.enter(s.el, s.params);
  }
  GF.go = (name, params) => { GF.stack.push({ name, params }); show(name, params); };
  GF.replace = (name, params) => { GF.stack.pop(); GF.go(name, params); };
  GF.back = function () {
    if (GF.overlayOpen && GF.overlayOpen()) return true;
    if (GF.stack.length <= 1) return false;
    GF.stack.pop(); const t = GF.stack[GF.stack.length - 1]; show(t.name, t.params); return true;
  };
  GF.popTo = function (name, params) {
    while (GF.stack.length > 1 && GF.stack[GF.stack.length - 1].name !== name) GF.stack.pop();
    const t = GF.stack[GF.stack.length - 1];
    if (t.name !== name) { GF.go(name, params); return; }
    if (params) t.params = params;
    show(t.name, t.params);
  };
  GF.home = () => { GF.stack = []; GF.go('home'); };
  function refreshBar() {
    $('b-stars').innerHTML = IC.star + '<span>' + totalStars() + '</span>';
    $('b-sound').innerHTML = GF.state.settings.mute ? IC.mute : IC.sound;
  }
  GF.refreshBar = refreshBar;
  GF.toast = (t) => { const o = $('toast'); o.textContent = t; o.classList.add('on'); clearTimeout(GF._tt); GF._tt = setTimeout(() => o.classList.remove('on'), 1400); };

  /* ---------------- 입력: 드래그 (한 번에 하나, 멀티터치 무시) ---------------- */
  let dragging = null;
  GF.drag = function (node, h) {
    node.addEventListener('pointerdown', (e) => {
      if (dragging) return;
      dragging = e.pointerId; try { node.setPointerCapture(e.pointerId); } catch (x) {}
      const p = GF.pt(e), ox = parseFloat(node.style.left), oy = parseFloat(node.style.top);
      node._d = { sx: p.x, sy: p.y, ox, oy };
      h.start && h.start(e); e.preventDefault();
    });
    node.addEventListener('pointermove', (e) => {
      if (e.pointerId !== dragging || !node._d) return;
      const p = GF.pt(e), d = node._d; h.move(d.ox + p.x - d.sx, d.oy + p.y - d.sy, e);
    });
    const end = (e) => { if (e.pointerId !== dragging) return; dragging = null; if (node._d) { node._d = null; h.end && h.end(e); } };
    node.addEventListener('pointerup', end); node.addEventListener('pointercancel', end);
  };

  /* ---------------- 모드 등록 ---------------- */
  GF.mode = (name, def) => { GF.modes[name] = def; };
  const GAME_ICON = { shadow: 'gshadow', faces: 'gfaces', puzzle: 'gpuzzle', paint: 'gpaint', shapes: 'gshapes' };
  const GAME_HERO = { shadow: 'dong_dad.good', faces: 'wife.joy', puzzle: 'nemo_mom.good', paint: 'baby.joy', shapes: 'nemo_dad.good' };
  const GAME_ORDER = ['shadow', 'faces', 'puzzle', 'paint', 'shapes'];

  /* ---------------- 홈 ---------------- */
  GF.screen('home', {
    bare: false,
    enter(r) {
      GF.bg('home', r);
      const t = el('div', 'hometitle', r, '<div class="ttl"><span style="color:#E39B4B">기</span><span style="color:#4DABF7">하</span><span style="color:#3B4A7A">학</span> <span style="color:#FF8FA8">가</span><span style="color:#6CCB8A">족</span></div><div class="sub">놀이터</div>');
      const c = el('div', 'homechars', r);
      [['wife.joy', 138], ['baby.joy', 96], ['dong_dad.good', 130]].forEach((a, i) => { const im = GF.img(a[0]); im.style.height = a[1] + 'px'; im.style.animation = 'bounceIn .6s ' + (i * 0.12) + 's backwards'; c.appendChild(im); });
      const row = el('div', 'homebtns', r);
      [['story', 'book', '#FFE0E8', () => GF.go('map')], ['play', 'game', '#E1F4FF', () => GF.go('playroom')], ['album', 'album', '#FFF3C2', () => GF.go('album')]].forEach((b) => {
        const k = el('button', 'card', row, IC[b[1]]); k.style.background = b[2]; k.onclick = () => { GF.sfx('pick'); b[3](); };
      });
      // 부모 메뉴: 로고를 3초 길게
      let pt = null; const logo = t;
      logo.addEventListener('pointerdown', () => { pt = setTimeout(() => Gate.open(), 3000); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => logo.addEventListener(ev, () => clearTimeout(pt)));
    },
  });

  /* ---------------- 이야기 지도 ---------------- */
  const NODES = [[80, 520], [250, 430], [100, 330], [250, 230], [110, 130]];
  const chOpen = (i) => i === 0 || (GF.state.stages['c' + i + 'C'] && GF.state.stages['c' + i + 'C'].done);
  const chReady = (i) => !!GF.data.stages['ch' + (i + 1)];
  GF.screen('map', {
    enter(r) {
      GF.bg('stream', r);
      let d = 'M' + NODES.map((n) => n.join(' ')).join(' L');
      el('div', 'bg', r, '<svg viewBox="0 0 360 640"><path d="' + d + '" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 22" opacity=".95"/></svg>');
      NODES.forEach((n, i) => {
        const open = chReady(i) && chOpen(i);
        const b = el('button', 'card node' + (open ? '' : ' locked'), r); b.style.cssText += 'left:' + n[0] + 'px;top:' + n[1] + 'px;border-radius:50%';
        const heroes = (GF.data.stages['ch' + (i + 1)] || {}).heroes || ['baby.good'];
        b.appendChild(GF.img(heroes[0])); el('div', 'num', b, i + 1);
        if (!open) el('div', '', b, '<svg class="lock" viewBox="0 0 32 32">' + IC.lock.slice(IC.lock.indexOf('>') + 1));
        b.onclick = () => {
          if (!open) { GF.sfx('no'); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); return; }
          GF.sfx('pick'); const ch = 'ch' + (i + 1);
          if (!GF.state.seen[ch]) GF.go('book', { ch, part: 'pro' }); else GF.go('stages', { ch });
        };
      });
    },
  });

  /* ---------------- 그림책 ---------------- */
  GF.screen('book', {
    enter(r, p) {
      const cuts = GF.data.story[p.ch][p.part], hero = (GF.data.stages[p.ch] || {}).bg;
      let i = 0;
      const stageEl = el('div', 'bg', r);
      const dots = el('div', 'dots', r);
      const cap = el('div', 'caption', r); cap.style.display = 'none';
      const nb = el('button', 'big nextbtn', r, IC.play);
      const render = () => {
        stageEl.innerHTML = ''; const c = cuts[i];
        GF.bg(c.bg, stageEl);
        const role = (id) => (/^baby\./.test(id) || id === 'nemo_kids.baby' ? 'baby' : /^nemo_kids\./.test(id) ? 'kid' : /^art\./.test(id) ? 'art' : 'adult');
        const list = c.chars || [], adults = list.filter((x) => role(x.id) === 'adult'), kids = list.filter((x) => role(x.id) === 'kid');
        const A = adults.length ? Math.max(...adults.map((x) => x.h || 230)) : kids.length ? Math.max(...kids.map((x) => x.h || 220)) / 0.78 : 240;
        const H = { adult: null, kid: A * 0.78, baby: A * 0.5, art: null };   // 세계관 비율 고정: 어른 1 : 아이 .78 : 막둥이 .5
        list.forEach((ch, k) => {
          const d = el('div', 'cut-char in', stageEl); const hh = H[role(ch.id)] || ch.h || 230;
          d.style.cssText = 'left:' + ch.x + 'px;top:' + (ch.y || 560) + 'px;height:' + hh + 'px;width:' + Math.round(hh * GF.aspect(ch.id)) + 'px;animation-delay:' + (k * 0.12) + 's';
          d.appendChild(GF.img(ch.id));
        });
        dots.innerHTML = cuts.map((_, k) => '<i class="' + (k === i ? 'on' : '') + '"></i>').join('');
        cap.style.display = GF.state.settings.captions && c.text ? 'block' : 'none'; cap.textContent = c.text || '';
        GF.say(c.voice);
      };
      const next = () => {
        GF.sfx('page');
        if (i < cuts.length - 1) { i++; render(); return; }
        if (p.part === 'pro') { GF.state.seen[p.ch] = 1; Store.save(); if (p.replay) GF.back(); else GF.replace('stages', { ch: p.ch }); }
        else { Reward.sticker(p.ch + '_book'); GF.popTo('map'); }
      };
      nb.onclick = (e) => { e.stopPropagation(); next(); };
      r.addEventListener('pointerup', (e) => { if (e.target === r || e.target.closest('.bg')) next(); });
      render();
    },
  });

  /* ---------------- 스테이지 선택 ---------------- */
  const stageDone = (id) => GF.state.stages[id] && GF.state.stages[id].done;
  GF.screen('stages', {
    enter(r, p) {
      const ch = p.ch, def = GF.data.stages[ch], n = ch.slice(2);
      GF.bg(def.bg, r);
      def.stages.forEach((s, k) => {
        const id = 'c' + n + 'ABC'[k], open = k === 0 || stageDone('c' + n + 'ABC'[k - 1]), rec = GF.state.stages[id];
        const b = el('button', 'card stagebtn' + (open ? '' : ' locked'), r); b.style.top = (130 + k * 140) + 'px';
        el('div', 'badge', b, dotsHTML(k + 1));
        el('div', '', b, open ? starsHTML(rec ? rec.stars : 0) : IC.lock);
        b.onclick = () => { if (!open) { GF.sfx('no'); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); return; } GF.sfx('pick'); Stage.start({ kind: 'story', ch, k, id }); };
      });
      const bk = el('button', 'round-btn', r, IC.book.replace('viewBox="0 0 64 64"', 'viewBox="0 0 64 64" width="34" height="34"')); bk.style.cssText = 'position:absolute;left:14px;bottom:18px;width:64px;height:64px';
      bk.onclick = () => GF.go('book', { ch, part: 'pro', replay: true });
    },
  });

  /* ---------------- 놀이방 ---------------- */
  GF.screen('playroom', {
    enter(r) {
      GF.bg('home', r);
      GAME_ORDER.forEach((g, i) => {
        const open = !!GF.modes[g] && GF.modes[g].free;
        const b = el('button', 'card' + (open ? '' : ' locked'), r);
        const col = i % 2, row = Math.floor(i / 2);
        b.style.cssText += 'left:' + (20 + col * 170) + 'px;top:' + (84 + row * 180) + 'px;width:150px;height:160px';
        b.appendChild(GF.img(GAME_HERO[g]));
        const ic = el('div', '', b, IC[GAME_ICON[g]]); ic.style.cssText = 'position:absolute;left:8px;top:8px;width:40px;height:40px;background:#fff;border-radius:12px;padding:4px;box-shadow:0 2px 0 rgba(0,0,0,.12)';
        if (!open) el('div', '', b, '<svg class="lock" viewBox="0 0 32 32">' + IC.lock.slice(IC.lock.indexOf('>') + 1));
        b.onclick = () => { if (!open) { GF.sfx('no'); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); return; } GF.sfx('pick'); pickLevel(r, g); };
      });
    },
  });
  function pickLevel(r, g) {
    const ov = el('div', 'overlay on', r), pn = el('div', 'panel', ov);
    pn.appendChild(el('div', 'hero')).appendChild(GF.img(GAME_HERO[g]));
    const row = el('div', 'row', pn);
    [1, 2, 3].forEach((d) => { const b = el('button', 'big', row, dotsHTML(d)); b.style.background = ['#F6C28B', '#8FD3F4', '#3B4A7A'][d - 1]; b.onclick = () => { GF.sfx('pick'); Stage.start({ kind: 'free', mode: g, diff: d }); }; });
    ov.addEventListener('pointerdown', (e) => { if (e.target === ov) ov.remove(); });
  }

  /* ---------------- 스테이지 러너 ---------------- */
  let run = null;
  const Stage = (GF.Stage = {
    start(o) { run = Object.assign({ i: 0, res: [], level: 0, zero: 0 }, o); GF.go('round'); },
  });
  const starsOf = (res) => (res.mistakes === 0 && !res.hints ? 3 : res.mistakes <= 2 ? 2 : 1);
  let timers = [], hintFn = null, hintT = [], hintCount = 0;
  const clearTimers = () => { timers.forEach(clearTimeout); timers = []; hintT.forEach(clearTimeout); hintT = []; hintFn = null; };
  function armHint() {
    hintT.forEach(clearTimeout); hintT = [];
    if (!hintFn) return;
    hintT.push(setTimeout(() => { hintCount++; hintFn && hintFn(1); }, 5000));
    hintT.push(setTimeout(() => { hintFn && hintFn(2); }, 10000));
  }
  GF.screen('round', {
    leave() { clearTimers(); },
    enter(r) {
      const def = run.kind === 'story' ? GF.data.stages[run.ch] : null;
      const modeName = run.kind === 'story' ? def.mode : run.mode, mode = GF.modes[modeName];
      GF.bg(run.kind === 'story' ? def.bg : 'house', r);
      const area = el('div', 'playarea', r);
      const cfg = run.kind === 'story' ? def.stages[run.k].rounds[run.i] : mode.free(run.diff, run.i);
      hintCount = 0; let finished = false;
      const ctx = {
        W: 360, H: 576, level: run.level, sfx: GF.sfx, img: GF.img, shuffle, rnd, say: GF.say,
        timeout(fn, ms) { const t = setTimeout(fn, ms); timers.push(t); return t; },
        setHint(fn) { hintFn = fn; armHint(); },
        done(res) { if (finished) return; finished = true; hintFn = null; hintT.forEach(clearTimeout); res.hints = hintCount; finish(r, res, def); },
      };
      area.addEventListener('pointerdown', () => { ensureAudio(); armHint(); }, true);
      mode.setup(area, cfg, ctx);
    },
  });
  function finish(r, res, def) {
    const stars = starsOf(res); run.res.push(stars);
    run.zero = res.mistakes === 0 && !res.hints ? run.zero + 1 : 0;
    run.level = res.mistakes >= 3 ? -1 : run.zero >= 2 ? 1 : 0;
    const total = run.kind === 'story' ? def.stages[run.k].rounds.length : Infinity, last = run.i + 1 >= total;
    const heroes = run.kind === 'story' ? def.heroes : [GAME_HERO[run.mode].replace('.good', '.joy')];
    const ov = el('div', 'overlay on', r), pn = el('div', 'panel', ov);
    const hero = el('div', 'hero', pn); hero.appendChild(GF.img(rnd(heroes)));
    const sv = el('div', '', pn, starsHTML(stars, 'xl')); sv.style.cssText = 'display:flex;justify-content:center';
    sv.querySelectorAll('svg').forEach((s, k) => { if (!s.classList.contains('off')) { s.classList.add('pop'); s.style.animationDelay = (0.15 + k * 0.18) + 's'; } });
    GF.sfx('ok'); setTimeout(() => GF.sfx('star'), 350);
    const row = el('div', 'row', pn);
    if (!last) {
      const nb = el('button', 'big', row, IC.play); nb.onclick = () => { GF.sfx('pick'); run.i++; clearTimers(); r.innerHTML = ''; GF.screens.round.enter(r); };
      return;
    }
    // 스테이지 완료
    const avg = Math.max(1, Math.floor(run.res.reduce((a, b) => a + b, 0) / run.res.length));   // 평균 내림: 한 라운드라도 틀리면 ★3 이 안 된다
    const rec = GF.state.stages[run.id] || {}; rec.done = true; rec.stars = Math.max(rec.stars || 0, avg); GF.state.stages[run.id] = rec; Store.save(); refreshBar();
    const gain = Reward.sticker(run.ch + '_' + 'ABC'[run.k], avg === 3);
    const n = run.ch.slice(2);
    if (run.k === 2 && ['A', 'B', 'C'].every((l) => (GF.state.stages['c' + n + l] || {}).stars === 3)) Reward.sticker(run.ch + '_star');
    if (gain) { const s = Reward.stickerEl(run.ch + '_' + 'ABC'[run.k]); pn.insertBefore(s, row); GF.sfx('tada'); }
    const again = el('button', 'big gold', row, IC.again); again.onclick = () => { GF.sfx('pick'); const o = run; GF.stack.pop(); Stage.start({ kind: 'story', ch: o.ch, k: o.k, id: o.id }); };
    const nxt = el('button', 'big', row, IC.play);
    nxt.onclick = () => { GF.sfx('pick'); if (run.k < 2) GF.popTo('stages', { ch: run.ch }); else GF.replace('book', { ch: run.ch, part: 'epi' }); };
  }
  // 놀이방(자유) 모드에서는 라운드가 끝없이 이어진다 (finish 의 total = Infinity)

  /* ---------------- 보상: 스티커·앨범 ---------------- */
  const Reward = (GF.Reward = {
    list: () => GF.data.stickers,
    find: (id) => GF.data.stickers.find((s) => s.id === id),
    sticker(id, shiny) {     // 새로 얻거나 반짝이로 오르면 true
      const cur = GF.state.stickers[id] || 0, nv = shiny ? 2 : 1;
      if (nv > cur) { GF.state.stickers[id] = nv; Store.save(); return true; } return false;
    },
    stickerEl(id) {
      const s = Reward.find(id), lv = GF.state.stickers[id] || 0, d = el('div', 'sticker' + (lv === 2 ? ' shiny' : ''));
      d.appendChild(GF.img(s.char)); return d;
    },
  });
  GF.screen('album', {
    enter(r) {
      GF.bg('home', r);
      const a = el('div', 'album', r);
      const chapters = [...new Set(GF.data.stickers.map((s) => s.ch))];
      chapters.forEach((ch, i) => {
        const row = el('div', 'albrow', a); el('div', 'ch', row, i + 1);
        GF.data.stickers.filter((s) => s.ch === ch).forEach((s) => {
          const lv = GF.state.stickers[s.id] || 0, d = el('div', 'sticker' + (lv === 2 ? ' shiny' : lv ? '' : ' empty'), row);
          d.appendChild(GF.img(s.char));
        });
      });
    },
  });

  /* ---------------- 부모 잠금·메뉴 ---------------- */
  const Gate = {
    open() {
      const a = 2 + Math.floor(Math.random() * 4), b = 2 + Math.floor(Math.random() * 4), ans = a + b;
      const p = Gate.p, pn = p.firstChild; pn.innerHTML = '<h3>' + a + ' + ' + b + ' = ?</h3>';
      const nums = el('div', 'nums', pn);
      for (let n = 3; n <= 12; n++) { const bt = el('button', '', nums, n); bt.onclick = () => (n === ans ? Gate.menu() : Gate.close()); }
      p.classList.add('on');
    },
    close() { Gate.p.classList.remove('on'); },
    menu() {
      const s = GF.state.settings, pn = Gate.p.firstChild;
      pn.innerHTML = '<h3>부모 메뉴</h3>';
      const l1 = el('div', 'line', pn, '<span>소리 크기</span>'), rg = el('input', '', l1); rg.type = 'range'; rg.min = 0; rg.max = 1; rg.step = 0.1; rg.value = s.vol;
      rg.oninput = () => { s.vol = +rg.value; Store.save(); SFX.tap(); };
      const l2 = el('div', 'line', pn, '<span>자막 보기</span>'), b2 = el('button', 't', l2, s.captions ? '켜짐' : '꺼짐');
      b2.onclick = () => { s.captions = !s.captions; b2.textContent = s.captions ? '켜짐' : '꺼짐'; Store.save(); };
      const l3 = el('div', 'line', pn, '<span>진행 지우기</span>'), b3 = el('button', 't', l3, '지우기'); let armed = false;
      b3.onclick = () => { if (!armed) { armed = true; b3.textContent = '한 번 더'; return; } Store.reset(); Gate.close(); GF.home(); };
      el('small', '', pn, '이 앱은 이름·사진·위치·기기 정보를 수집하지 않고, 광고와 결제가 없으며, 인터넷에 연결하지 않습니다. 진행 기록은 이 기기 안에만 저장됩니다.');
      const c = el('div', 'line', pn); const cb = el('button', 't', c, '닫기'); cb.onclick = Gate.close;
    },
  };
  GF.overlayOpen = () => { if (Gate.p.classList.contains('on')) { Gate.close(); return true; } return false; };

  /* ---------------- 부팅 ---------------- */
  async function loadData() {
    if (window.GF_DATA) return window.GF_DATA;
    const names = ['chars', 'stages', 'story', 'stickers'], out = {};
    await Promise.all(names.map(async (n) => { out[n] = await (await fetch(GF.base + 'data/' + n + '.json')).json(); }));
    return out;
  }
  GF.boot = async function () {
    stage = $('stage'); topbar = $('topbar');
    GF.data = await loadData(); GF.data.voice = GF.data.voice || {};
    if (GF.data.base != null) GF.base = GF.data.base;
    GF.state = Store.load();
    fit(); window.addEventListener('resize', fit);
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    // 상단 바
    $('b-home').innerHTML = IC.home;
    let armed = false;
    $('b-home').onclick = function () {
      if (!armed) { armed = true; this.classList.add('warn'); GF.sfx('tap'); setTimeout(() => { armed = false; this.classList.remove('warn'); }, 1500); return; }
      armed = false; this.classList.remove('warn'); GF.home();
    };
    $('b-sound').onclick = () => { GF.state.settings.mute = !GF.state.settings.mute; Store.save(); refreshBar(); GF.sfx('tap'); };
    // 부모 패널
    const p = el('div', 'parent', stage); el('div', 'panel', p); Gate.p = p;
    document.addEventListener('pointerdown', ensureAudio, { once: true });
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') GF.back(); });
    window.addEventListener('popstate', () => GF.back());
    GF.screens.home || 0; GF.home();
    GF.ready = true;
  };
})();
