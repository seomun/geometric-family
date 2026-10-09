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
    back: '<svg viewBox="0 0 32 32"><path d="M19 5 8 16l11 11" fill="none" stroke="#FF8FA8" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
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
  let KEY = 'gf:v1';                                          // 앱마다 다른 저장 키(방치형은 gf:idle:v1)
  const fresh = () => ({ v: 1, stages: {}, stickers: {}, seen: {}, settings: { vol: 0.8, mute: false, captions: false, capOff: false }, avatar: null });
  const Store = {
    load() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v === 1) return Object.assign(fresh(), s, { settings: Object.assign(fresh().settings, s.settings) }); } catch (e) {} return fresh(); },
    save() { try { localStorage.setItem(KEY, JSON.stringify(GF.state)); } catch (e) {} },
    reset() { GF.state = fresh(); Store.save(); },
  };
  GF.Store = Store;
  GF.save = Store.save; GF.resetState = Store.reset;
  const totalStars = () => Object.values(GF.state.stages).reduce((a, s) => a + (s.stars || 0), 0);

  /* ---------------- 소리 (WebAudio 합성) ---------------- */
  let ac = null;
  function ensureAudio() {
    const A = window.AudioContext || window.webkitAudioContext;
    if (!ac && A) { try { ac = new A(); } catch (e) {} }
    if (ac && ac.state === 'suspended') ac.resume();
  }
  let pitch = 1;                                               // GF.sfx(id, {st}) 가 합성음 대체에도 적용되도록 한 번만 쓰는 배율
  function tone(f, t, d, type, v) {
    if (!ac || GF.state.settings.mute) return; f *= pitch;
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
  // 소리는 "자리(슬롯)": 코드는 id 만 안다. 파일·음량은 data/sounds.json (docs/16_SOUND.md). 교체 = 파일만 바꾸면 되고 코드 수정 없음.
  const snd = () => GF.data.sounds || { sfx: {}, music: {}, voice: {}, alias: {} };
  const urlOf = (file) => (file && ((GF.data.audio && GF.data.audio[file]) || (GF.audioBase || '') + file)) || null;   // 빌드본은 data URI 로 인라인
  const bufs = {}; let loading = false;
  function loadSounds() {
    if (loading || !ac) return; loading = true;
    const sfx = snd().sfx;
    Object.keys(sfx).forEach((id) => {
      const u = urlOf(sfx[id].file); if (!u) return;
      fetch(u).then((r) => r.arrayBuffer()).then((a) => new Promise((ok, no) => ac.decodeAudioData(a, ok, no))).then((b) => { bufs[id] = b; }).catch(() => {});
    });
  }
  /** GF.sfx(id, {st}) — st: 반음 단위 음높이 이동(연쇄 콤보처럼 오를수록 높아지게). 같은 id 라도 파일은 하나, 재생 속도로만 바꾼다. */
  GF.sfx = function (n, opt) {
    ensureAudio(); loadSounds(); n = (snd().alias || {})[n] || n;
    if (GF.haptic) GF.haptic(n);   // 성인 앱만, 설정에서 끌 수 있는 짧은 진동(engine/extras.js)
    if (!ac || GF.state.settings.mute) return;
    const b = bufs[n], e = snd().sfx[n], st = opt && opt.st ? opt.st : 0, mul = Math.pow(2, st / 12);
    if (!b) { if (SFX[n]) { pitch = mul; try { SFX[n](); } finally { pitch = 1; } } return; }                 // 파일이 없거나 아직 못 읽었으면 합성음으로 대신
    const s = ac.createBufferSource(), g = ac.createGain(), j = e && e.jitter != null ? e.jitter : 0.05;
    s.buffer = b; s.playbackRate.value = mul * (1 + (Math.random() - 0.5) * (st ? j * 0.2 : j));     // 같은 소리가 반복돼도 지루하지 않게
    g.gain.value = GF.state.settings.vol * ((e && e.vol) != null ? e.vol : 1); s.connect(g); g.connect(ac.destination); s.start();
  };
  // 음악: 슬롯(theme_main·theme_kids·night …)을 id 로 틀고, file 이 비어 있으면 fallback 슬롯을 쓴다. 같은 파일이면 끊지 않고 이어 간다.
  GF.bgm = {
    el: null, started: false, want: null, file: null, duck: false, vol: 0.22,
    resolve(id) { if (snd().musicEnabled === false) return null;   // 합성 BGM 전면 교체 전까지 무음(효과음만)
      const m = snd().music; let e = m[id], guard = 0; while (e && !e.file && e.fallback && guard++ < 5) e = m[e.fallback]; return e && e.file ? e : null; },
    play(id) { this.want = id; if (this.started) this.apply(); },
    start() { this.started = true; this.apply(); },
    apply() {
      const e = this.resolve(this.want || 'theme_main'); if (!e) return;
      const u = urlOf(e.file); this.vol = e.vol != null ? e.vol : 0.22;
      if (this.file !== e.file) {
        const old = this.el, el = new Audio(u); el.loop = e.loop !== false; this.el = el; this.file = e.file;
        if (old) { let k = 0; const t = setInterval(() => { k++; old.volume = Math.max(0, old.volume * 0.8); if (k > 8) { clearInterval(t); old.pause(); } }, 60); }
      }
      this.sync();
    },
    sync() {
      const e = this.el; if (!e) return;
      e.volume = Math.min(1, this.vol * GF.state.settings.vol * (this.duck ? 0.4 : 1));
      if (GF.state.settings.mute || document.hidden || GF.appHidden) e.pause(); else e.play().catch(() => {});
    },
  };
  GF.sting = function () {                                     // 소리 로고(2초). 파일이 없으면 별 소리
    if (snd().musicEnabled === false) return;                   // 음원 교체 전까지 무음
    const e = snd().music.logo_sting, u = e && urlOf(e.file);
    if (!u || GF.state.settings.mute) { GF.sfx('star'); return; }
    try { const a = new Audio(u); a.volume = Math.min(1, (e.vol || 0.6) * GF.state.settings.vol); a.play().catch(() => {}); } catch (x) {}
  };
  let voiceEl = null;
  GF.say = function (id) {                                     // 그림책 음성: 슬롯 voice_<id>, file 이 null 이면 아직 녹음 전
    const e = snd().voice['voice_' + id], u = e && urlOf(e.file);
    if (voiceEl) { voiceEl.pause(); voiceEl = null; GF.bgm.duck = false; GF.bgm.sync(); }
    if (!u || GF.state.settings.mute) return;
    try {
      voiceEl = new Audio(u); voiceEl.volume = GF.state.settings.vol * (e.vol != null ? e.vol : 1);
      GF.bgm.duck = true; GF.bgm.sync();                      // 말하는 동안 음악을 낮춘다
      voiceEl.onended = () => { GF.bgm.duck = false; GF.bgm.sync(); }; voiceEl.play().catch(() => {});
    } catch (x) {}
  };

  /* ---------------- 캐릭터 ---------------- */
  GF.src = function (id) {
    if (GF.art && GF.art[id]) return GF.art[id].src;     // 코드 그림(data URI)
    let c = GF.data.chars[id];
    if (!c) { const who = id.split('.')[0]; c = GF.data.chars[who + '.good'] || GF.data.chars[who + '.kid1']; if (!c) console.warn('no char', id); }
    return c ? GF.base + c.src : '';
  };
  // 다음 판에서 쓸 그림을 미리 내려받아 풀어 둔다(전환 직후 빈 카드가 보이지 않게)
  GF.preload = function (obj) {
    const ids = new Set();
    (function walk(v) { if (typeof v === 'string') { if (GF.data.chars[v] || (GF.art && GF.art[v])) ids.add(v); } else if (v && typeof v === 'object') Object.values(v).forEach(walk); })(obj);
    (obj && obj.pieces != null || true) && ids.forEach((id) => { const i = new Image(); i.src = GF.src(id); i.decode && i.decode().catch(() => {}); });
  };
  /** 다음 화면에서 쓸 캐릭터 그림을 미리 디코딩(전환 끊김 줄이기): 한 장씩 틈틈이, 실패는 무시 */
  GF.predecode = (ids) => {
    const q = [...new Set(ids || [])].filter(Boolean);
    const step = () => { const id = q.shift(); if (!id) return; let p; try { const im = new Image(); im.src = GF.src(id); p = im.decode ? im.decode() : null; } catch (e) { p = null; } (p || Promise.resolve()).catch(() => {}).then(() => setTimeout(step, 40)); };
    setTimeout(step, 60);
  };
  GF.img = (id, cls) => { const i = new Image(); i.src = GF.src(id); i.draggable = false; if (cls) i.className = cls; return i; };
  // 원본 PNG 의 실제 가로/세로(자리표·자르기는 이 기준). 캐릭터 PNG 는 600×600 캔버스 안에 몸이 들어 있다.
  GF.aspectN = (id) => { const c = GF.data.chars[id] || GF.data.chars[id.split('.')[0] + '.good']; return c && c.nw ? c.nw / c.nh : GF.aspect(id); };
  // 몸이 있는 부분만 잘라 쓰는 영역(퍼즐·색칠): 비율을 왜곡하지 않는다. 자리표가 없는 그림(코드 그림 등)은 전체.
  GF.crop = function (id) {
    const A = GF.data.anchors || {}, key = /^nemo_kids\./.test(id) ? id : id.split('.')[0] + '.good', a = A[key];
    if (GF.art && GF.art[id] || !a) return { asp: GF.aspect(id), x0: 0, y0: 0, x1: 1, y1: 1 };
    const m = 0.015, x0 = Math.max(0, a.bbox[0] - m), y0 = Math.max(0, a.bbox[1] - m), x1 = Math.min(1, a.bbox[2] + m), y1 = Math.min(1, a.bbox[3] + m), n = GF.aspectN(id);
    return { asp: ((x1 - x0) * n) / (y1 - y0), x0, y0, x1, y1 };
  };
  GF.aspect = (id) => { if (GF.art && GF.art[id]) return GF.art[id].w / GF.art[id].h; const c = GF.data.chars[id] || GF.data.chars[id.split('.')[0] + '.good']; return c ? c.w / c.h : 1; };

  /* ---------------- 배경 (코드 SVG) ---------------- */
  // 배경은 360×640 안전 영역 기준 좌표로 그리되, 하늘·땅·언덕을 좌우 위아래로 끝없이 이어 화면 전체를 채운다.
  let gid = 0;
  const X0 = -2400, XW = 5160;
  const sky = (a, b) => { const id = 'g' + ++gid; return '<defs><linearGradient id="' + id + '" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="0" y2="640"><stop offset="0" stop-color="' + a + '"/><stop offset="1" stop-color="' + b + '"/></linearGradient></defs><rect x="' + X0 + '" y="-2400" width="' + XW + '" height="5400" fill="url(#' + id + ')"/>'; };
  const band = (y, c, h) => '<rect x="' + X0 + '" y="' + y + '" width="' + XW + '" height="' + (h || 2400) + '" fill="' + c + '"/>';
  const rep = (fn) => [-1080, -720, -360, 0, 360, 720, 1080].map((dx) => '<g transform="translate(' + dx + ' 0)">' + fn() + '</g>').join('');
  const hill = (y, c, r) => '<ellipse cx="' + r[0] + '" cy="' + y + '" rx="' + r[1] + '" ry="' + r[2] + '" fill="' + c + '"/>';
  const cloud = (x, y, s) => '<g class="drift"><g transform="translate(' + x + ' ' + y + ') scale(' + (s || 1) + ')" fill="#fff" opacity=".9"><ellipse cx="0" cy="0" rx="34" ry="16"/><ellipse cx="-22" cy="6" rx="22" ry="12"/><ellipse cx="24" cy="6" rx="24" ry="12"/></g></g>';
  const flowers = (y) => rep(() => [[24, 8, '#FF8FA8'], [88, 22, '#FFF3B0'], [150, 4, '#FFFFFF'], [212, 18, '#FF8FA8'], [280, 6, '#FFF3B0'], [334, 20, '#fff']].map((f) => '<g transform="translate(' + f[0] + ' ' + (y + f[1]) + ')"><circle r="5" fill="' + f[2] + '"/><circle r="2" fill="#FFC933"/></g>').join(''));
  const reeds = (y) => rep(() => [[30, 0], [44, 8], [318, 2], [332, 10]].map((r) => '<g class="sway" style="animation-delay:-' + (r[0] % 7) * 0.4 + 's"><path d="M' + r[0] + ' ' + (y + r[1]) + 'v-58" stroke="#7BAA55" stroke-width="4" stroke-linecap="round"/><ellipse cx="' + r[0] + '" cy="' + (y + r[1] - 64) + '" rx="5.5" ry="13" fill="#8A5A3B"/></g>').join(''));
  const lilies = () => rep(() => [[70, 505], [160, 548], [255, 515], [330, 556]].map((l) => '<g class="bob" style="animation-delay:-' + l[0] % 5 + 's"><ellipse cx="' + l[0] + '" cy="' + l[1] + '" rx="24" ry="9" fill="#5FB57B"/><circle cx="' + (l[0] + 6) + '" cy="' + (l[1] - 5) + '" r="5" fill="#FF8FA8"/></g>').join(''));
  const butterfly = (y, c, c2) => '<g class="fly"><g transform="translate(0 ' + y + ') scale(1.5)"><g class="flap"><ellipse cx="-9" cy="-2" rx="11" ry="14" fill="' + c + '" stroke="#4A3030" stroke-width="1.6"/><ellipse cx="9" cy="-2" rx="11" ry="14" fill="' + c + '" stroke="#4A3030" stroke-width="1.6"/><ellipse cx="-8" cy="8" rx="7" ry="8" fill="' + (c2 || '#fff') + '" stroke="#4A3030" stroke-width="1.4"/><ellipse cx="8" cy="8" rx="7" ry="8" fill="' + (c2 || '#fff') + '" stroke="#4A3030" stroke-width="1.4"/><circle cx="-9" cy="-4" r="3" fill="#fff"/><circle cx="9" cy="-4" r="3" fill="#fff"/></g><rect x="-2" y="-13" width="4" height="26" rx="2" fill="#4A3030"/><path d="M-1 -13q-6-8-10-8M1 -13q6-8 10-8" fill="none" stroke="#4A3030" stroke-width="1.6" stroke-linecap="round"/></g></g>';
  const G = (s) => (GF.safeWide ? '<g transform="translate(0 -170)">' + s + '</g>' : s);
  const railsG = (y) => band(y, '#6B5F70', 4) + band(y + 16, '#6B5F70', 4) + rep(() => Array.from({ length: 9 }, (_, i) => '<rect x="' + (i * 40 + 6) + '" y="' + (y - 4) + '" width="22" height="26" rx="3" fill="#8A5A3B"/>').join('')).replace(/<rect/g, '<rect opacity=".9"');
  const BG = {
    forest: () => sky('#A8DDB0', '#EAF7D6') + '<circle cx="290" cy="80" r="30" fill="#FFF3B0" opacity=".9"/>' + cloud(80, 90, .9)
      + G(rep(() => [[20, 430, 70], [120, 410, 90], [240, 440, 64], [330, 420, 80]].map((t) => '<rect x="' + (t[0] - 9) + '" y="' + t[1] + '" width="18" height="' + (560 - t[1]) + '" fill="#8A5A3B"/><circle cx="' + t[0] + '" cy="' + t[1] + '" r="' + t[2] + '" fill="#5FAF6B" stroke="#3E8A4A" stroke-width="3"/>').join('') + hill(560, '#7FBF5A', [180, 330, 70])) + band(560, '#7FBF5A')
        + [[40, 590], [140, 598], [250, 592], [320, 600]].map((m) => '<g transform="translate(' + m[0] + ' ' + m[1] + ')"><rect x="-3" y="0" width="6" height="12" fill="#FFF3E0"/><path d="M-12 2q12-18 24 0z" fill="#FF6B6B"/><circle cx="-4" cy="-4" r="2" fill="#fff"/><circle cx="4" cy="-6" r="2" fill="#fff"/></g>').join('') + flowers(606))
      + [[60, 300], [190, 250], [300, 330]].map((f, i) => '<g class="bob" style="animation-delay:-' + i + 's"><circle cx="' + f[0] + '" cy="' + f[1] + '" r="9" fill="#FFF3B0" opacity=".35"/><circle cx="' + f[0] + '" cy="' + f[1] + '" r="3.5" fill="#FFE27A"/></g>').join(''),
    seaside: () => sky('#BDE6FF', '#FFF3DC') + '<circle cx="290" cy="76" r="34" fill="#FFE27A"/>' + cloud(80, 80, 1) + cloud(200, 140, .8)
      + G(band(290, '#7CC8F0', 110) + rep(() => '<g class="wave"><path d="M-60 312q30-10 60 0t60 0 60 0 60 0 60 0 60 0 60 0M-60 352q30-10 60 0t60 0 60 0 60 0 60 0 60 0 60 0" fill="none" stroke="#fff" stroke-width="4" opacity=".7"/></g>') + band(400, '#F6E3B5')
        + '<g><path d="M326 440v-70" stroke="#8A5A3B" stroke-width="6"/><path d="M286 372q40-44 80 0z" fill="#FF8FA8" stroke="#4A3030" stroke-width="3"/><path d="M302 372q24-38 48 0" fill="none" stroke="#fff" stroke-width="5" opacity=".7"/></g>'
        + '<g class="bob"><path d="M40 330q40-12 80 0l-10 26h-60z" fill="#C98F5A" stroke="#4A3030" stroke-width="3"/><path d="M80 330V288l30 28z" fill="#fff" stroke="#4A3030" stroke-width="3"/></g>'
        + rep(() => [[30, 560], [120, 590], [230, 566], [320, 598], [60, 452], [200, 470], [290, 520]].map((s) => '<g transform="translate(' + s[0] + ' ' + s[1] + ')"><path d="M0 0l6-8 6 8-6 8z" fill="#FF8FA8" opacity=".9"/></g>').join('')))
      + butterfly(300, '#8FD3F4', '#fff'),
    village: () => sky('#BFE3F5', '#FFF3DC') + '<circle cx="70" cy="90" r="32" fill="#FFE27A"/>' + cloud(210, 80, 1) + cloud(300, 150, .7)
      + G(rep(() => '<path d="M-20 470L70 330L150 470z" fill="#9DB7A5"/><path d="M80 470L190 300L300 470z" fill="#8AA896"/><path d="M60 392l10-12l10 12z" fill="#fff"/><path d="M180 338l10-14l10 14z" fill="#fff"/>' + hill(500, '#B6D88E', [180, 300, 60])) + band(500, '#9CCB6A')
        + '<g><path d="M232 452l60-44l60 44z" fill="#C9A24A" stroke="#4A3030" stroke-width="3"/><rect x="246" y="450" width="92" height="64" fill="#F3E0BE" stroke="#4A3030" stroke-width="3"/><rect x="278" y="474" width="22" height="40" fill="#8A5A3B"/><rect x="300" y="414" width="12" height="22" fill="#6B5F70"/></g>'
        + '<g class="drift"><circle cx="306" cy="404" r="9" fill="#fff" opacity=".85"/><circle cx="314" cy="390" r="7" fill="#fff" opacity=".7"/></g>'
        + rep(() => Array.from({ length: 6 }, (_, i) => '<path d="M' + (i * 60) + ' 560q30-10 60 0" fill="none" stroke="#7FB04A" stroke-width="4"/>').join('')) + flowers(606)),
    station: () => sky('#BFE8FF', '#FFF1DA') + '<circle cx="300" cy="86" r="34" fill="#FFE27A"/>' + cloud(70, 90, 1) + cloud(220, 150, .8)
      + G(rep(() => hill(470, '#C7E6B0', [180, 330, 80])) + '<g><rect x="150" y="372" width="200" height="150" rx="18" fill="#8FD3F4" stroke="#4A3030" stroke-width="4"/><rect x="150" y="440" width="200" height="14" fill="#FF8FA8"/>' + [0, 1, 2].map((i) => '<rect x="' + (170 + i * 60) + '" y="392" width="44" height="40" rx="8" fill="#fff" stroke="#4A3030" stroke-width="3"/>').join('') + '</g>'
        + '<g><rect x="42" y="340" width="8" height="190" fill="#8A5A3B"/><circle cx="46" cy="330" r="26" fill="#fff" stroke="#4A3030" stroke-width="4"/><path d="M46 330V314M46 330L58 336" stroke="#4A3030" stroke-width="4" stroke-linecap="round"/></g>'
        + band(520, '#D8D2DE') + band(520, '#FFD36B', 8) + band(560, '#B9B2C0') + railsG(576)),
    rails: () => sky('#D3EEFF', '#F8FCFF') + '<circle cx="290" cy="88" r="36" fill="#FFE27A"/>' + cloud(80, 90, 1) + cloud(200, 150, .8)
      + G(rep(() => hill(470, '#B6E6A0', [100, 240, 90]) + hill(480, '#9ADB88', [300, 200, 80])) + band(500, '#8FD67A') + railsG(560) + flowers(600)) + butterfly(330, '#FF8FA8', '#FFF3B0'),
    home: () => sky('#FFE9C7', '#FFF6E5') + (GF.safeWide ? '<circle cx="470" cy="104" r="46" fill="#FFD36B"/>' : '<circle cx="318" cy="180" r="34" fill="#FFD36B"/>') + G(rep(() => hill(660, '#BFE6A8', [90, 260, 150]) + hill(670, '#9BD98A', [290, 230, 130])) + band(640, '#9BD98A')),
    stream: () => sky('#BFE8FF', '#F4FBFF') + '<circle cx="290" cy="90" r="38" fill="#FFE27A"/>' + cloud(70, 80, 1) + cloud(200, 140, .8) + G(rep(() => hill(470, '#B6E6A0', [100, 240, 90]) + hill(480, '#9ADB88', [300, 200, 80])) + band(500, '#7CC8F0', 60) + rep(() => '<g class="wave"><path d="M-60 520q30-10 60 0t60 0 60 0 60 0 60 0 60 0 60 0" fill="none" stroke="#fff" stroke-width="4" opacity=".7"/></g>') + band(560, '#8FD67A') + flowers(582)) + butterfly(330, '#FFB347', '#FFE27A'),
    bridge: () => sky('#BFE8FF', '#F4FBFF') + '<circle cx="60" cy="90" r="34" fill="#FFE27A"/>' + cloud(230, 70, 1) + cloud(130, 150, .7) + G(rep(() => hill(420, '#B6E6A0', [250, 260, 80])) + band(450, '#7CC8F0', 130) + rep(() => '<g class="wave"><path d="M-60 480q30-10 60 0t60 0 60 0 60 0 60 0 60 0 60 0M-60 520q30-10 60 0t60 0 60 0 60 0 60 0 60 0 60 0" fill="none" stroke="#fff" stroke-width="4" opacity=".6"/></g><rect x="20" y="395" width="12" height="40" fill="#A8703F"/><rect x="330" y="395" width="12" height="40" fill="#A8703F"/>') + band(430, '#C98F5A', 26) + band(400, '#A8703F', 8) + lilies() + band(580, '#8FD67A') + reeds(604) + flowers(612)) + butterfly(300, '#B197FC', '#FFFFFF'),
    hill: () => sky('#FFD9A8', '#FFF0D9') + '<circle cx="80" cy="130" r="50" fill="#FFB347" opacity=".9"/>' + G(rep(() => hill(520, '#C9E08A', [180, 330, 170]) + hill(600, '#A9D36E', [60, 220, 90])) + band(600, '#A9D36E') + '<g class="sway"><rect x="288" y="380" width="14" height="150" fill="#8A5A3B"/><circle cx="295" cy="370" r="64" fill="#7FBF5A"/><circle cx="270" cy="395" r="9" fill="#FF9A3C"/><circle cx="312" cy="380" r="9" fill="#FF9A3C"/><circle cx="296" cy="345" r="9" fill="#FF9A3C"/></g>') + butterfly(360, '#FF8FA8', '#FFF3B0'),
    field: () => sky('#CDEFFF', '#F7FCFF') + cloud(90, 90, 1) + cloud(260, 150, .8) + G(rep(() => hill(500, '#B6E6A0', [180, 340, 100])) + band(520, '#C79A6B') + band(558, '#A97B4E', 6) + band(598, '#A97B4E', 6)) + butterfly(320, '#B197FC', '#fff'),
    night: () => sky('#1F2A5C', '#4B5C9C') + rep(() => [[40, 80], [120, 150], [250, 70], [320, 160], [200, 210], [60, 260], [310, 300]].map((p) => '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3" fill="#FFF3B0"/>').join('')) + '<circle cx="270" cy="120" r="40" fill="#FFF3B0"/><circle cx="286" cy="110" r="36" fill="#2B3870"/>' + G(rep(() => hill(660, '#2F4A6B', [180, 330, 160])) + band(640, '#2F4A6B')),
    indoor: () => '<rect x="-1500" y="-1500" width="3360" height="1880" fill="#FFE1B8"/><g><rect x="244" y="70" width="96" height="104" rx="10" fill="#BFE8FF" stroke="#8A5A3B" stroke-width="6"/><path d="M292 70v104M244 122h96" stroke="#8A5A3B" stroke-width="4"/></g>' + band(470, '#D9A66B', 1700) + band(470, '#B98550', 6) + '<rect x="-1500" y="476" width="3360" height="1700" fill="#E3B27F" opacity=".5"/>',
    indoor2: () => '<rect x="-1500" y="-1500" width="3360" height="1880" fill="#FFE1B8"/>' + band(470, '#D9A66B', 1700) + band(470, '#B98550', 6) + '<rect x="-1500" y="476" width="3360" height="1700" fill="#E3B27F" opacity=".5"/>',
    house: () => sky('#BFE8FF', '#FFF6E5') + cloud(80, 90, 1) + cloud(250, 60, .8) + G(rep(() => hill(560, '#B6E6A0', [180, 340, 120])) + band(560, '#8FD67A')),
  };
  /* 그림 슬롯(docs/18): data/art_slots.json 의 {bg,props,cover,room,icons}[id] 에 SVG 경로(또는 data URI)를 넣으면 코드 그림 대신 쓴다. 받은 SVG 를 넣기만 하면 교체. */
  /** 타이틀 대표 그림 슬롯: 캐릭터 뒤에 깔리는 한 장. 슬롯(data/art_slots.json hero[id])이 있으면 그 그림, 없으면 임시 코드 SVG. 아트 패스 때 교체 */
  const HS = (b) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 200"><g stroke="#6b5443" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">' + b + '</g></svg>');
  const HERO = {
    block: HS('<rect x="70" y="92" width="220" height="92" rx="8" fill="#FFE9B8"/><path d="M52 96L180 22l128 74z" fill="#E8870F"/><rect x="236" y="30" width="26" height="46" fill="#B98550"/><rect x="92" y="112" width="34" height="34" rx="7" fill="#F6C28B"/><path d="M148 146l17-34 17 34z" fill="#8FD3F4"/><circle cx="225" cy="130" r="17" fill="#B7C2F2"/><rect x="92" y="150" width="34" height="34" rx="7" fill="#8FD3F4"/><rect x="190" y="152" width="34" height="30" rx="7" fill="#F6C28B"/><rect x="236" y="152" width="34" height="30" rx="7" fill="#B7C2F2"/><path d="M30 186h300"/>'),
    merge: HS('<rect x="40" y="20" width="90" height="80" rx="6" fill="#BFE8FF"/><path d="M85 20v80M40 60h90"/><rect x="150" y="100" width="170" height="70" rx="16" fill="#FF8FA8"/><rect x="138" y="116" width="34" height="56" rx="12" fill="#FF8FA8"/><rect x="298" y="116" width="34" height="56" rx="12" fill="#FF8FA8"/><path d="M60 186h260"/><path d="M60 170v-40M44 130h32" /><circle cx="60" cy="122" r="14" fill="#FFE27A"/>'),
    tables: HS('<ellipse cx="180" cy="130" rx="130" ry="38" fill="#C98F5A"/><ellipse cx="180" cy="124" rx="112" ry="28" fill="#E3B27F"/><ellipse cx="120" cy="120" rx="30" ry="10" fill="#fff"/><ellipse cx="190" cy="132" rx="30" ry="10" fill="#fff"/><ellipse cx="248" cy="118" rx="26" ry="9" fill="#fff"/><path d="M140 92q-6-18 6-28M180 96q-6-18 6-28" fill="none"/>'),
    coloring: HS('<ellipse cx="170" cy="110" rx="120" ry="74" fill="#FFE3C2"/><circle cx="110" cy="92" r="16" fill="#FF6B6B"/><circle cx="150" cy="70" r="16" fill="#FFD43B"/><circle cx="200" cy="72" r="16" fill="#69DB7C"/><circle cx="240" cy="98" r="16" fill="#4DABF7"/><ellipse cx="190" cy="140" rx="22" ry="14" fill="#FFF"/><path d="M270 40l50 90" stroke-width="9"/><path d="M320 130l-12 28" stroke="#FF8FA8" stroke-width="12"/>'),
    quiz: HS('<circle cx="90" cy="110" r="60" fill="#F6C28B"/><path d="M180 44l64 112H116z" fill="#8FD3F4"/><circle cx="270" cy="110" r="60" fill="#B7C2F2"/><text x="90" y="132" font-size="64" font-weight="900" text-anchor="middle" fill="#fff" stroke="none">?</text><text x="180" y="142" font-size="56" font-weight="900" text-anchor="middle" fill="#fff" stroke="none">?</text><text x="270" y="132" font-size="64" font-weight="900" text-anchor="middle" fill="#fff" stroke="none">?</text>'),
    spot: HS('<rect x="22" y="36" width="140" height="110" rx="10" fill="#CFEFFF"/><rect x="198" y="36" width="140" height="110" rx="10" fill="#CFEFFF"/><circle cx="60" cy="72" r="14" fill="#FFE27A"/><circle cx="236" cy="72" r="14" fill="#FFE27A"/><path d="M40 146l26-38 30 38z" fill="#6CCB8A"/><path d="M216 146l26-38 30 38z" fill="#F783AC"/><circle cx="265" cy="150" r="30" fill="none" stroke-width="7"/><path d="M286 172l26 26" stroke-width="9"/><circle cx="180" cy="92" r="7" fill="#FF8FA8"/>'),
    tile: HS('<rect x="36" y="60" width="60" height="60" rx="10" fill="#FFF6E5"/><rect x="110" y="40" width="60" height="60" rx="10" fill="#FFF6E5"/><rect x="184" y="60" width="60" height="60" rx="10" fill="#FFF6E5"/><rect x="258" y="40" width="60" height="60" rx="10" fill="#FFF6E5"/><circle cx="66" cy="90" r="16" fill="#FF6B6B"/><circle cx="140" cy="70" r="16" fill="#FFD43B"/><circle cx="214" cy="90" r="16" fill="#69DB7C"/><circle cx="288" cy="70" r="16" fill="#4DABF7"/><rect x="60" y="140" width="240" height="40" rx="14" fill="#C98F5A"/>'),
    day: HS('<circle cx="180" cy="96" r="58" fill="#FFE27A"/><path d="M40 170h280"/><rect x="50" y="96" width="70" height="70" rx="14" fill="#8FD3F4"/><rect x="240" y="96" width="70" height="70" rx="14" fill="#FF8FA8"/><circle cx="290" cy="46" r="22" fill="#E8E4FF"/><circle cx="70" cy="46" r="6" fill="#FFE27A"/>'),
    sort: HS('<rect x="36" y="30" width="60" height="140" rx="14" fill="#E8F4FF"/><rect x="110" y="30" width="60" height="140" rx="14" fill="#E8F4FF"/><rect x="184" y="30" width="60" height="140" rx="14" fill="#E8F4FF"/><rect x="258" y="30" width="60" height="140" rx="14" fill="#E8F4FF"/><circle cx="66" cy="140" r="16" fill="#FF6B6B"/><circle cx="66" cy="104" r="16" fill="#FF6B6B"/><circle cx="140" cy="140" r="16" fill="#FFD43B"/><circle cx="140" cy="104" r="16" fill="#FFD43B"/><circle cx="140" cy="68" r="16" fill="#FFD43B"/><circle cx="214" cy="140" r="16" fill="#69DB7C"/><circle cx="214" cy="104" r="16" fill="#69DB7C"/>'),
    playground: HS('<path d="M20 160h320"/><rect x="40" y="96" width="80" height="56" rx="10" fill="#FFB347"/><rect x="96" y="70" width="20" height="30" fill="#6B5F70"/><rect x="130" y="108" width="80" height="44" rx="10" fill="#8FD3F4"/><rect x="220" y="108" width="80" height="44" rx="10" fill="#FF8FA8"/><circle cx="70" cy="158" r="12" fill="#4A3030"/><circle cx="170" cy="158" r="12" fill="#4A3030"/><circle cx="260" cy="158" r="12" fill="#4A3030"/><circle cx="310" cy="48" r="26" fill="#FFE27A"/>'),
  };
  GF.hero = (parent, id) => { const d = el('div', 'hero-art', parent); d.style.backgroundImage = 'url("' + (GF.slot('hero', id) || HERO[id] || '') + '")'; return d; };
  GF.slot = (kind, id) => { const m = GF.data && GF.data.art_slots && GF.data.art_slots[kind], v = m && m[id]; return v ? (/^(data:|https?:|\/)/.test(v) ? v : (GF.base || '') + v) : null; };
  GF.bgSVG = (name) => '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 640" width="360" height="640">' + (BG[name] || BG.home)() + '</svg>';   // 배경 한 장을 SVG 문자열로(스티커 장면 액자용)
  GF.bg = function (name, parent) {
    const sl = GF.slot('bg', name);
    if (sl) { const d0 = el('div', 'bg', parent); const im0 = el('img', '', d0); im0.alt = ''; im0.src = sl; im0.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;pointer-events:none'; return d0; }
    const d = el('div', 'bg', parent); d.innerHTML = '<svg viewBox="' + (GF.safeWide ? '-0 0 720 440' : '0 0 360 640') + '" preserveAspectRatio="none" style="overflow:visible">' + (GF.safeWide ? '<g transform="translate(180 0)">' + (BG[name] || BG.home)() + '</g>' : (BG[name] || BG.home)()) + '</svg>'; return d; };

  /* ---------------- 코어: 화면 스택·레터박스·상단바 ---------------- */
  let stage, topbar, scale = 1, safeEl;
  GF.pt = (e) => { const r = safeEl.getBoundingClientRect(); return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale }; };
  // 화면 전체(vw×vh)를 프레임으로 쓰고, 360×640 안전 영역을 시스템 바 안쪽 가운데에 둔다.
  // 가로·세로·태블릿 모두 배경은 끝까지 채워지고 놀이 UI 만 안전 영역에 앵커된다.
  let SW = W, SH = H;
  function fit() {
    const vw = window.innerWidth, vh = window.innerHeight, probe = $('inset');
    const cs = getComputedStyle(probe), top = parseFloat(cs.paddingTop) || 0, bot = parseFloat(cs.paddingBottom) || 0;
    const availH = vh - top - bot;
    scale = Math.min(vw / SW, availH / SH);
    const frame = $('frame'); frame.style.width = vw / scale + 'px'; frame.style.height = vh / scale + 'px'; frame.style.transform = 'scale(' + scale + ')';
    $('topbar').style.top = top / scale + 'px';
    GF.pad = 12;   // 상단 바는 화면 가장자리에 붙인다 (가로 태블릿도 엄지가 닿게)
    $('topbar').style.paddingLeft = $('topbar').style.paddingRight = GF.pad + 'px';
    safeEl.style.width = SW + 'px'; safeEl.style.height = SH + 'px';
    safeEl.style.left = (vw / scale - SW) / 2 + 'px'; safeEl.style.top = (top + (availH - SH * scale) / 2) / scale + 'px';
    GF.safe = { w: SW, h: SH };
    safeEl.style.setProperty('--hit', 64 / scale + 'px');
    GF.view = { vw, vh, lw: vw / scale, lh: vh / scale, landscape: vw > vh };
  }
  // 화면이 가로 구도를 지원하면(screen.wide) 가로 화면에서 720×440 안전 영역을 쓴다. 지원 안 하는 화면은 세로 컬럼 그대로.
  function setSafe(wide) { SW = wide ? 720 : W; SH = wide ? 440 : H; GF.safeWide = wide; safeEl.classList.toggle('wide', wide); fit(); }
  const wantWide = (s, params) => { const v = { landscape: window.innerWidth > window.innerHeight }; return !!(v.landscape && s.wide && s.wide(params || {})); };
  GF.screen = function (name, def) { def.el = el('div', 'screen', $('safe')); def.name = name; GF.screens[name] = def; return def; };
  function show(name, params) {
    Object.values(GF.screens).forEach((s) => { s.el.classList.remove('on'); s.leave && s.leave(); });
    const s = GF.screens[name];
    s.el.innerHTML = ''; s.el.classList.add('on'); GF.cur = s; s.params = params || {};
    setSafe(wantWide(s, s.params));
    topbar.classList.toggle('hidden', s.bare === true);
    $('b-home').style.visibility = 'visible'; if ($('b-back')) $('b-back').style.visibility = GF.stack.length > 1 ? 'visible' : 'hidden';
    refreshBar();
    s.enter(s.el, s.params);
    GF.bgm.play(name === 'round' ? ((run && run.ch === 'ch4') ? 'night' : 'theme_kids') : name === 'book' ? (s.params.ch === 'ch4' ? 'night' : 'theme_kids') : 'theme_main');
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
    $('b-stars').innerHTML = GF.pill ? GF.pill() : IC.star + '<span>' + totalStars() + '</span>';   // 앱마다 진행 알약(별·웃음 등)
    $('b-sound').innerHTML = GF.state.settings.mute ? IC.mute : IC.sound;
  }
  GF.refreshBar = refreshBar;
  GF.toast = (t) => { const o = $('toast'); o.textContent = t; o.classList.add('on'); clearTimeout(GF._tt); GF._tt = setTimeout(() => o.classList.remove('on'), 1400); };

  /* ---------------- 연출: 반짝이 터짐 · 꽃가루 ---------------- */
  const PCOL = ['#FFC933', '#FF8FA8', '#8FD3F4', '#6CCB8A', '#fff', '#B197FC'];
  GF.burst = function (parent, x, y, n) {
    for (let i = 0; i < (n || 12); i++) {
      const p = el('div', 'particle', parent), ang = Math.random() * 6.283, d = 36 + Math.random() * 56, s = 8 + Math.random() * 8;
      p.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + s + 'px;height:' + s + 'px;background:' + PCOL[i % PCOL.length] + ';border-radius:' + (i % 3 ? '50%' : '3px');
      p.animate([{ transform: 'translate(-50%,-50%) scale(1)', opacity: 1 }, { transform: 'translate(' + (Math.cos(ang) * d) + 'px,' + (Math.sin(ang) * d - 14) + 'px) scale(.2) rotate(200deg)', opacity: 0 }],
        { duration: 560 + Math.random() * 300, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = () => p.remove();
    }
  };
  GF.confetti = function (parent) {
    const v = GF.view || { lw: 360 }, x0 = -(v.lw - 360) / 2;
    for (let i = 0; i < 44; i++) {
      const p = el('div', 'particle', parent), s = 8 + Math.random() * 9, x = x0 + Math.random() * v.lw;
      p.style.cssText = 'left:' + x + 'px;top:-20px;width:' + s + 'px;height:' + s * 1.5 + 'px;background:' + PCOL[i % PCOL.length] + ';border-radius:2px';
      p.animate([{ transform: 'translateY(0) rotate(0)', opacity: 1 }, { transform: 'translate(' + ((Math.random() - 0.5) * 120) + 'px,' + (640 + Math.random() * 260) + 'px) rotate(' + (360 + Math.random() * 360) + 'deg)', opacity: 1 }],
        { duration: 1300 + Math.random() * 700, delay: Math.random() * 350, easing: 'cubic-bezier(.3,.6,.6,1)', fill: 'forwards' }).onfinish = () => p.remove();
    }
  };
  GF.jump = (node) => node.animate([{ transform: 'translateY(0) scale(1)' }, { transform: 'translateY(-22px) scale(1.1,.95)' }, { transform: 'translateY(0) scale(1)' }, { transform: 'translateY(-9px)' }, { transform: 'translateY(0)' }], { duration: 650, easing: 'ease-out' });
  GF.snap = (node) => node.animate([{ transform: 'scale(1.15)' }, { transform: 'scale(1.28) translateY(-8px)', offset: 0.35 }, { transform: 'scale(.94)', offset: 0.7 }, { transform: 'scale(1)' }], { duration: 480, easing: 'ease-out' });

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
  // 안드로이드 껍데기가 호출: 앱이 백그라운드로 가면 소리를 멈추고, 돌아오면 이어 간다 / 노치 인셋이 바뀌면 다시 맞춘다
  GF.setHidden = (h) => { GF.appHidden = !!h; if (GF.bgm) GF.bgm.sync(); if (!h && window.Room && Room.refresh) { try { Room.refresh(); } catch (e) { /* 형제 앱 집 불러오기 실패는 무시 */ } } };
  GF.refit = () => fit();
  const GAME_ICON = { shadow: 'gshadow', faces: 'gfaces', puzzle: 'gpuzzle', paint: 'gpaint', shapes: 'gshapes' };
  const GAME_HERO = { shadow: 'dong_dad.good', faces: 'wife.joy', puzzle: 'nemo_mom.good', paint: 'baby.joy', shapes: 'nemo_dad.good' };
  const GAME_ORDER = ['shadow', 'faces', 'puzzle', 'paint', 'shapes'];

  /* ---------------- 홈 ---------------- */
  GF.screen('home', {
    bare: false,
    wide: () => true,
    leave() { clearInterval(GF._blink); },
    enter(r) {
      const wide = GF.safeWide;
      GF.bg('home', r);
      const t = el('div', 'hometitle', r, '<div class="ttl"><span style="color:#E39B4B;animation-delay:.05s">기</span><span style="color:#4DABF7;animation-delay:.17s">하</span><span style="color:#3B4A7A;animation-delay:.29s">학</span> <span style="color:#FF8FA8;animation-delay:.41s">가</span><span style="color:#6CCB8A;animation-delay:.53s">족</span></div><div class="sub">놀이터</div>');
      GF.hero(r, 'playground'); const c = el('div', 'homechars', r);
      const cast = wide ? [['wife', 190], ['baby', 126], ['dong_dad', 172]] : [['wife', 160], ['baby', 112], ['dong_dad', 148]];
      const ims = cast.map((a, i) => { const im = GF.img(a[0] + '.good'); im.style.height = a[1] + 'px'; im.style.animation = 'bounceIn .6s ' + (i * 0.12) + 's backwards, homeidle 2.4s ' + (0.8 + i * 0.3) + 's ease-in-out infinite alternate'; c.appendChild(im); GF.img(a[0] + '.joy'); return [im, a[0]]; });
      // 눈 깜빡임: 눈을 감은 표정(joy)으로 0.14초만 바꿨다가 돌아온다
      clearInterval(GF._blink);
      GF._blink = setInterval(() => { const [im, w] = GF.rnd(ims); const o = im.src; im.src = GF.src(w + '.joy'); setTimeout(() => { im.src = o; }, 140); }, 1700);
      if (!GF._intro) { GF._intro = 1; setTimeout(() => GF.sting(), 650); }
      /* 첫 실행 30초: 타이틀에서 한 번 눌러 바로 첫 판(이야기는 판 사이·장 끝에서 이어진다). 처음이면 손가락이 알려 준다 */
      const nx = GF.quickStage();
      if (nx) {
        const chIds = []; ((GF.data.story[nx.ch] || {}).pro || []).forEach((c) => (c.chars || []).forEach((q) => chIds.push(q.id))); GF.predecode(chIds.concat((GF.data.stages[nx.ch] || {}).heroes || []));   // 홈이 뜬 직후 첫 판·프롤로그 그림을 백그라운드로
        const go = el('button', 'homeplay', r, IC.play); go.setAttribute('aria-label', '놀이 시작');
        go.onclick = () => {
          GF.sfx('pick'); const st = () => Stage.start({ kind: 'story', ch: nx.ch, k: nx.k, id: nx.id });
          const pro = GF.data.story[nx.ch] && GF.data.story[nx.ch].pro;
          if (!GF.state.seen[nx.ch] && pro && !(navigator.webdriver && !/[?&]greet=1/.test(location.search))) { GF.state.seen[nx.ch] = 1; Store.save(); GF.go('greet', { cuts: pro, auto: 3200, then: () => { GF.stack.pop(); st(); } }); }   // 첫 실행 1회: 프롤로그 3컷
          else st();
        };
        if (!GF.state.stages.c1A && window.UK) setTimeout(() => { if (go.isConnected) UK.finger(r, go, { tap: true }); }, 900);
      }
      const row = el('div', 'homebtns', r);
      [['story', 'book', '#FFE0E8', () => GF.go('shelf')], ['play', 'game', '#E1F4FF', () => GF.go('playroom')], ['album', 'album', '#FFF3C2', () => GF.go('album', { book: 1 })], ['house', 'home', '#FFE3C2', () => GF.go('khouse')]].forEach((b) => {
        const k = el('button', 'card', row, IC[b[1]]); k.style.background = b[2]; k.onclick = () => { GF.sfx('pick'); b[3](); };
      });
      // 부모 메뉴: 로고를 3초 길게
      let pt = null; const logo = t;
      logo.addEventListener('pointerdown', () => { pt = setTimeout(() => Gate.open(), 3000); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => logo.addEventListener(ev, () => clearTimeout(pt)));
    },
  });

  GF.screen('khouse', {
    wide: () => false,
    enter(r) {
      GF.bg('indoor', r); r.classList.add('uk');
      const sc = el('div', 'abs', r); sc.style.cssText = 'left:0;right:0;top:70px;bottom:0;overflow-y:auto;touch-action:pan-y'; Room.house(sc, { room: 'kid' });
    },
  });

  /* ---------------- 책 표지(코드 그림) · 책장 ---------------- */
  // 표지는 300×400 비율. 캐릭터는 DOM 이미지로 올린다(래스터 캐릭터 그대로).
  const COVER = {
    1: { title: '막둥이의 생일 가는 길', lines: ['막둥이의', '생일 가는 길'], ty: 104, sky: ['#BFE8FF', '#FFF6E5'],
      svg: '<ellipse cx="80" cy="360" rx="190" ry="90" fill="#B6E6A0"/><ellipse cx="250" cy="372" rx="170" ry="80" fill="#9ADB88"/><circle cx="238" cy="66" r="30" fill="#FFE27A"/>'
        + '<path d="M0 36Q150 84 300 36" fill="none" stroke="#fff" stroke-width="3"/>' + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const t = i / 7, x = 12 + t * 276, y = 38 + 24 * 4 * t * (1 - t) * 1.0; return '<path d="M' + (x - 9) + ' ' + y + 'L' + (x + 9) + ' ' + y + 'L' + x + ' ' + (y + 20) + 'z" fill="' + ['#FF8FA8', '#FFD36B', '#8FD3F4', '#6CCB8A'][i % 4] + '"/>'; }).join('')
        + '<path d="M130 290L170 290L210 400L90 400z" fill="#F3DDB3"/><rect x="95" y="190" width="110" height="100" rx="8" fill="#F6C28B" stroke="#4A3030" stroke-width="4"/><rect x="80" y="160" width="140" height="42" rx="8" fill="#D9765B" stroke="#4A3030" stroke-width="4"/><rect x="136" y="232" width="28" height="58" rx="8" fill="#8A5A3B"/><rect x="110" y="215" width="26" height="26" fill="#BFE8FF" stroke="#4A3030" stroke-width="3"/><rect x="170" y="215" width="26" height="26" fill="#BFE8FF" stroke="#4A3030" stroke-width="3"/>',
      chars: [['baby.joy', 24, 99, 24], ['nemo_kids.kid1', 76, 99, 30]] },
    2: { title: '막둥이의 기차 여행', lines: ['막둥이의', '기차 여행'], ty: 78, sky: ['#BFE8FF', '#FFF1DA'],
      svg: '<ellipse cx="60" cy="330" rx="180" ry="70" fill="#C7E6B0"/><ellipse cx="260" cy="340" rx="150" ry="64" fill="#B6E6A0"/><circle cx="240" cy="64" r="30" fill="#FFE27A"/><rect x="0" y="352" width="300" height="48" fill="#8FD67A"/>'
        + '<rect x="0" y="362" width="300" height="5" fill="#6B5F70"/><rect x="0" y="380" width="300" height="5" fill="#6B5F70"/>' + Array.from({ length: 11 }, (_, i) => '<rect x="' + (i * 30 - 4) + '" y="357" width="18" height="34" rx="3" fill="#8A5A3B" opacity=".9"/>').join('')
        + '<g stroke="#4A3030" stroke-width="4" stroke-linejoin="round"><rect x="8" y="214" width="82" height="120" rx="14" fill="#FFB347"/><rect x="62" y="184" width="26" height="46" fill="#6B5F70"/><rect x="94" y="228" width="100" height="106" rx="14" fill="#8FD3F4"/><rect x="198" y="228" width="96" height="106" rx="14" fill="#FF8FA8"/><rect x="16" y="230" width="44" height="38" rx="8" fill="#fff"/></g>'
        + '<g fill="#4A3030"><circle cx="38" cy="340" r="15"/><circle cx="124" cy="340" r="15"/><circle cx="166" cy="340" r="15"/><circle cx="228" cy="340" r="15"/><circle cx="268" cy="340" r="15"/></g>'
        + '<path d="M70 176q-14-26 10-40M86 154q-6-22 14-34" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" opacity=".85"/>'
        + '<g fill="#fff" opacity=".95"><ellipse cx="62" cy="170" rx="34" ry="13"/><ellipse cx="44" cy="177" rx="22" ry="10"/><ellipse cx="86" cy="177" rx="24" ry="10"/><ellipse cx="226" cy="150" rx="36" ry="13"/><ellipse cx="206" cy="157" rx="22" ry="10"/><ellipse cx="250" cy="157" rx="24" ry="10"/></g><g fill="none" stroke="#4A3030" stroke-width="3" stroke-linecap="round"><path d="M150 140q6-8 12 0q6-8 12 0"/><path d="M186 120q5-7 10 0q5-7 10 0"/></g>',
      windows: [[102, 240, 40, 56, 'wife.joy'], [148, 240, 40, 56, 'baby.joy'], [206, 240, 40, 56, 'husband.good'], [250, 240, 40, 56, 'dong_dad.good']], chars: [] },
    3: { title: '막둥이의 사계절', lines: ['막둥이의', '사계절'], ty: 78, sky: ['#FFE9D6', '#E6F4FF'],
      svg: '<ellipse cx="70" cy="350" rx="190" ry="80" fill="#F6B25C"/><ellipse cx="250" cy="366" rx="170" ry="76" fill="#F4F8FF"/><circle cx="240" cy="64" r="28" fill="#FFE27A"/>'
        + '<g fill="#FF8FA8" stroke="#4A3030" stroke-width="3"><circle cx="46" cy="300" r="12"/><circle cx="78" cy="312" r="12"/></g><g fill="#E8870F" stroke="#4A3030" stroke-width="3"><path d="M150 290c20 10 30 30 0 56c-30-26-20-46 0-56z"/></g><g stroke="#8FD3F4" stroke-width="5" stroke-linecap="round"><path d="M230 150v28M216 158l28 12M216 170l28-12"/><path d="M262 210v22M251 216l22 10M251 226l22-10"/></g>', chars: [['baby.joy', 24, 99, 26], ['nemo_grandma.good', 78, 99, 30]] },
  };
  GF.cover = function (book, parent) {
    const c = COVER[book], d = el('div', 'coverart', parent), id = 'cg' + (++gid), csl = GF.slot('cover', 'book' + book);
    if (csl) { const imc = el('img', '', d); imc.alt = ''; imc.src = csl; imc.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover'; return d; }
    d.innerHTML = '<svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + c.sky[0] + '"/><stop offset="1" stop-color="' + c.sky[1] + '"/></linearGradient></defs><rect width="300" height="400" fill="url(#' + id + ')"/>' + c.svg
      + (c.lines ? c.lines.map((t, i) => '<text x="150" y="' + (c.ty + i * 38) + '" font-size="31" text-anchor="middle" font-weight="900" font-family="Jua,Malgun Gothic,sans-serif" fill="#fff" stroke="#3A2E39" stroke-width="7" stroke-linejoin="round" paint-order="stroke">' + t + '</text>').join('') : '')
      + (c.locked ? '<text x="150" y="250" font-size="150" text-anchor="middle" fill="#fff" font-weight="900" font-family="sans-serif">?</text>' : '') + '</svg>';
    (c.windows || []).forEach((w) => {
      const f = el('div', 'abs', d); f.style.cssText = 'left:' + w[0] / 3 + '%;top:' + w[1] / 4 + '%;width:' + w[2] / 3 + '%;height:' + w[3] / 4 + '%;overflow:hidden;border-radius:10px;background:#fff;border:3px solid #4A3030;box-sizing:border-box';
      const im = GF.img(w[4]); im.style.cssText = 'position:absolute;left:50%;top:6%;width:150%;transform:translateX(-50%);height:auto'; f.appendChild(im);
    });
    (c.chars || []).forEach((q) => { const im = GF.img(q[0]); im.style.cssText = 'position:absolute;left:' + q[1] + '%;top:' + q[2] + '%;height:' + q[3] + '%;width:auto;transform:translate(-50%,-100%)'; d.appendChild(im); });
    return d;
  };
  GF.screen('shelf', {
    wide: () => true,
    enter(r) {
      GF.bg('home', r);
      const w = GF.safeWide, open = (bk) => bk <= 2 || !!GF.data.stages.ch11;
      const mk = (bk, host, cw, chh) => {
        const b = el('button', 'cover' + (open(bk) ? '' : ' locked'), host); b.dataset.book = bk; b.style.width = cw + 'px'; b.style.height = chh + 'px';
        GF.cover(bk, b); el('div', 'bknum', b, bk);
        if (!open(bk)) el('div', 'abs', b, '<svg class="lock" viewBox="0 0 32 32" style="width:44px;height:44px;right:8px;bottom:8px;position:absolute">' + IC.lock.slice(IC.lock.indexOf('>') + 1));
        return b;
      };
      const go = (bk, b) => { if (!open(bk)) { GF.sfx('hmm'); b.classList.add('tilt'); setTimeout(() => b.classList.remove('tilt'), 700); return; } GF.sfx('pick'); GF.go('map', { book: bk }); };
      if (w) {                                                               // 태블릿 가로: 세 권을 나란히
        const cw = 168, chh = cw * 4 / 3, gapx = 40, x0 = (GF.safe.w - (3 * cw + 2 * gapx)) / 2, y0 = 96;
        const plank = el('div', 'abs', r); plank.style.cssText = 'left:-2000px;right:-2000px;top:' + (y0 + chh - 6) + 'px;height:30px;background:linear-gradient(#C98F5A,#A8703F);box-shadow:0 6px 0 rgba(0,0,0,.14);z-index:1';
        [1, 2, 3].forEach((bk, i) => { const b = mk(bk, r, cw, chh); b.style.position = 'absolute'; b.style.left = x0 + i * (cw + gapx) + 'px'; b.style.top = y0 + 'px'; b.onclick = () => go(bk, b); });
        return;
      }
      // 폰 세로: 표지 한 권이 화면 높이의 45% — 옆으로 밀어 넘긴다 (3편은 넘기면 나온다)
      const cw = 216, chh = 288, y0 = 130;
      const car = el('div', 'shelfcar', r); car.style.cssText += 'top:' + y0 + 'px;padding-left:' + (GF.safe.w - cw) / 2 + 'px;padding-right:' + (GF.safe.w - cw) / 2 + 'px';
      const plank = el('div', 'abs', r); plank.style.cssText = 'left:-2000px;right:-2000px;top:' + (y0 + 14 + chh - 6) + 'px;height:30px;background:linear-gradient(#C98F5A,#A8703F);box-shadow:0 6px 0 rgba(0,0,0,.14);z-index:1';
      const covers = [1, 2, 3].map((bk) => { const b = mk(bk, car, cw, chh); return b; });
      const dots = el('div', 'shelfdots', r); dots.style.top = (y0 + chh + 70) + 'px'; const dd = covers.map(() => el('i', '', dots));
      const idx = () => Math.max(0, Math.min(2, Math.round(car.scrollLeft / (cw + 22))));
      const mark = () => dd.forEach((d, i) => d.classList.toggle('on', i === idx()));
      car.addEventListener('scroll', mark); mark();
      covers.forEach((b, i) => { b.onclick = () => { if (i === idx()) go(i + 1, b); else { GF.sfx('page'); car.scrollTo({ left: i * (cw + 22), behavior: 'smooth' }); } }; });
    },
  });

  /* ---------------- 이야기 지도 (책 한 권 = 장 5개) ---------------- */
  const NODES_P = [[80, 520], [250, 430], [100, 330], [250, 230], [110, 130]], NODES_W = [[90, 300], [230, 210], [370, 310], [510, 200], [640, 300]];
  const chOpen = (n) => n === 1 || n === 6 || n === 11 || (GF.state.stages['c' + (n - 1) + 'C'] && GF.state.stages['c' + (n - 1) + 'C'].done);   // 2편(6장)은 처음부터 열려 있다
  const chReady = (n) => !!GF.data.stages['ch' + n];
  function bookArrows(r, book, name) {                                        // 책 넘기기 ◀ ▶ (지도·앨범 공통)
    [[-1, 14], [1, null]].forEach(([dir, left]) => {
      const nb = book + dir; if (nb < 1 || nb > (GF.data.stages.ch11 ? 3 : 2)) return;
      const b = el('button', 'round-btn', r, dir < 0 ? '<svg viewBox="0 0 32 32"><path d="M22 5L6 16l16 11z" fill="#3A2E39"/></svg>' : '<svg viewBox="0 0 32 32"><path d="M10 5l16 11-16 11z" fill="#3A2E39"/></svg>');
      b.style.cssText = 'position:absolute;bottom:18px;width:64px;height:64px;' + (left != null ? 'left:' + left + 'px' : 'right:14px');
      b.onclick = () => { GF.sfx('page'); GF.replace(name, { book: nb }); };
    });
  }
  GF.screen('map', {
    wide: () => true,
    enter(r, p) {
      const book = p.book || 1, off = (book - 1) * 5;
      GF.bg(book === 2 ? 'rails' : 'stream', r);
      const NODES = GF.safeWide ? NODES_W : NODES_P;
      let d = 'M' + NODES.map((n) => n.join(' ')).join(' L');
      el('div', 'bg', r, '<svg viewBox="0 0 ' + GF.safe.w + ' ' + GF.safe.h + '">' + (book === 2
        ? '<path d="' + d + '" fill="none" stroke="#8A5A3B" stroke-width="22" stroke-linecap="butt" stroke-linejoin="round" stroke-dasharray="4 16"/><path d="' + d + '" fill="none" stroke="#6B5F70" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>'
        : '<path d="' + d + '" fill="none" stroke="#fff" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="2 22" opacity=".95"/>') + '</svg>');
      NODES.forEach((n, i) => {
        const num = off + i + 1, open = chReady(num) && chOpen(num);
        const b = el('button', 'card node' + (open ? '' : ' locked'), r); b.style.cssText += 'left:' + n[0] + 'px;top:' + n[1] + 'px;border-radius:50%';
        const heroes = (GF.data.stages['ch' + num] || {}).heroes || ['baby.good'];
        b.appendChild(GF.img(heroes[0])); el('div', 'num', b, i + 1);
        if (!open) el('div', '', b, '<svg class="lock" viewBox="0 0 32 32">' + IC.lock.slice(IC.lock.indexOf('>') + 1));
        b.onclick = () => {
          if (!open) { GF.sfx('hmm'); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); return; }
          GF.sfx('pick'); const ch = 'ch' + num;
          if (!GF.state.seen[ch]) GF.go('book', { ch, part: 'pro' }); else GF.go('stages', { ch });
        };
      });
      bookArrows(r, book, 'map');
    },
  });

  /* ---------------- 그림책 ---------------- */
  const BUBBLE = {
    bang: '<svg viewBox="0 0 52 52"><rect x="21" y="6" width="10" height="26" rx="5" fill="#FF8FA8"/><circle cx="26" cy="43" r="6" fill="#FF8FA8"/></svg>',
    heart: '<svg viewBox="0 0 52 52"><path d="M26 44C8 31 6 16 16 11c5-2 9 1 10 5 1-4 5-7 10-5 10 5 8 20-10 33z" fill="#FF6B8B"/></svg>',
    note: '<svg viewBox="0 0 52 52"><path d="M20 38V12l22-5v26" fill="none" stroke="#6CCB8A" stroke-width="5" stroke-linejoin="round"/><circle cx="14" cy="38" r="8" fill="#6CCB8A"/><circle cx="36" cy="33" r="8" fill="#6CCB8A"/></svg>',
    sizes: '<svg viewBox="0 0 52 52"><circle cx="13" cy="28" r="11" fill="#F6C28B"/><circle cx="33" cy="31" r="8" fill="#8FD3F4"/><circle cx="46" cy="34" r="5" fill="#3B4A7A"/></svg>',
    question: '<svg viewBox="0 0 52 52"><path d="M16 18c0-7 6-11 11-11 6 0 10 4 10 9 0 8-9 8-10 15" fill="none" stroke="#8FD3F4" stroke-width="7" stroke-linecap="round"/><circle cx="26" cy="44" r="5" fill="#8FD3F4"/></svg>',
    zzz: '<svg viewBox="0 0 52 52"><path d="M10 10h16L10 26h16" fill="none" stroke="#8FD3F4" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"/><path d="M30 26h12L30 38h12" fill="none" stroke="#8FD3F4" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/></svg>',
    sparkle: '<svg viewBox="0 0 52 52"><path d="M26 4l5 17 17 5-17 5-5 17-5-17-17-5 17-5z" fill="#FFC933"/></svg>',
  };
  /* 공용 사연 컷 플레이어 — ①그림책·②사연·③장 끝 컷이 같은 액자·자막·넘김을 쓴다(통일성 §0).
     cuts: [{bg, chars:[{id,x,y,h}], bubble:{type,at}, text, voice, sfx}] — 같은 비율(어른1:아이.8:막둥이.45)로 세운다. onEnd: 마지막 컷에서 넘길 때. */
  /** 아이 호칭 변수: 글 속 {sib1} {kid1}… 를 data/names.json 값으로 바꾸고, 뒤의 은/는·이/가·을/를·과/와는 받침에 맞게 고친다 */
  GF.name = (t) => {
    if (!t || t.indexOf('{') < 0) return t; const N = (GF.data && GF.data.names) || {}, PR = { 은: ['은', '는'], 는: ['은', '는'], 이: ['이', '가'], 가: ['이', '가'], 을: ['을', '를'], 를: ['을', '를'], 과: ['과', '와'], 와: ['과', '와'] };
    return t.replace(/\{(\w+)\}(은|는|이|가|을|를|과|와)?/g, (m, k, p) => { const v = N[k]; if (v == null) return m; if (!p) return v; const c = v.charCodeAt(v.length - 1), has = c >= 0xAC00 && c <= 0xD7A3 && (c - 0xAC00) % 28 !== 0; return v + PR[p][has ? 0 : 1]; });
  };
  GF.story = function (r, cuts, onEnd, opt) {
      opt = opt || {}; let i = 0, tm = null, ended = false;                    // opt.auto: 컷당 ms 후 자동으로 넘김, opt.skipAll: 아무 데나 탭하면 바로 끝(첫 만남 인사)
      const finish = () => { if (ended) return; ended = true; clearTimeout(tm); onEnd && onEnd(); };
      const stageEl = el('div', 'bg', r);
      const dots = el('div', 'dots', r);
      const cap = el('div', 'caption', r); cap.style.display = 'none';
      const nb = el('button', 'big nextbtn', r, IC.play);
      const render = () => {
        stageEl.innerHTML = ''; const c = cuts[i];
        GF.bg(c.bg, stageEl);
        const role = (id) => (/^baby\./.test(id) || id === 'nemo_kids.baby' ? 'baby' : /^nemo_kids\./.test(id) ? 'kid' : /^art\./.test(id) ? 'art' : 'adult');
        const SW_ = GF.safe.w, SH_ = GF.safe.h, wide = GF.safeWide, dy = wide ? 170 : 0;
        const list = (c.chars || []).map((ch, k) => ({ ch, k, role: role(ch.id), x: wide ? SW_ / 2 + (ch.x - 180) * 1.7 : ch.x, y: Math.min(SH_ - 6, (ch.y || 580) - dy), asp: GF.aspect(ch.id) }));
        // 세계관 비율 고정: 어른 1 : 아이 .8 : 막둥이 .45 — 어른이 장면 높이의 절반 가까이 오게 키우고, 가로폭이 모자라면 같은 비율로 줄인다
        const A = SH_ * 0.55, RATIO = { adult: 1, kid: 0.8, baby: 0.45 };
        const hasRef = list.some((q) => q.role !== 'art');
        list.forEach((q) => { q.h = q.role === 'art' ? (q.ch.h || 260) * (A / 270) : (hasRef ? A * RATIO[q.role] : q.ch.h || 230); q.w = q.h * q.asp; });
        const tot = list.reduce((s, q) => s + q.w * (wide ? 1.05 : 0.74), 0), fit_ = Math.min(1, (SW_ + 24) / (tot || 1));
        list.forEach((q) => { q.h *= fit_; q.w *= fit_; });
        // 왼쪽→오른쪽으로 나란히 세운다. 세로 화면에서는 서로 조금 겹쳐 선다(.74), 가로는 간격을 둔다
        const sorted = list.slice().sort((a_, b_) => a_.x - b_.x), ov = wide ? 1 : 0.74, gap = wide ? 14 : 0;
        const span = sorted.reduce((s, q, i) => s + (i < sorted.length - 1 ? q.w * ov + gap : q.w), 0);
        const cx = sorted.length ? sorted.reduce((s, q) => s + q.x, 0) / sorted.length : SW_ / 2;
        let px = span > SW_ - 16 ? (SW_ - span) / 2 : Math.min(SW_ - 8 - span, Math.max(8, cx - span / 2));
        sorted.forEach((q) => { q.cx = px + q.w / 2; px += q.w * ov + gap; });
        list.forEach((q) => {
          const d = el('div', 'cut-char in', stageEl);
          d.style.cssText = 'left:' + Math.round(q.cx) + 'px;top:' + Math.round(q.y) + 'px;height:' + Math.round(q.h) + 'px;width:' + Math.round(q.w) + 'px;animation-delay:' + (q.k * 0.12) + 's';
          d.appendChild(GF.img(q.ch.id)); d.firstChild.style.animationDelay = '-' + (q.k * 0.7) + 's';
        });
        if (c.bubble) {
          const q = list[c.bubble.at != null ? c.bubble.at : 0], bb = el('div', 'bubble', stageEl, BUBBLE[c.bubble.type]);
          bb.style.left = Math.round(q ? q.cx : c.bubble.x) + 'px'; bb.style.top = Math.round(q ? q.y - q.h * 0.92 : c.bubble.y) + 'px';
        }
        dots.innerHTML = cuts.map((_, k) => '<i class="' + (k === i ? 'on' : '') + '"></i>').join('');
        cap.style.display = !GF.state.settings.capOff && c.text ? 'block' : 'none'; cap.textContent = GF.name(c.text) || '';   /* 자막은 기본 켜짐(부모 메뉴에서 끄기) */
        GF.say(c.voice); if (c.sfx) setTimeout(() => GF.sfx(c.sfx), 350);
        clearTimeout(tm); if (opt.auto) tm = setTimeout(() => { if (r.isConnected) next(); }, opt.auto);
      };
      const next = () => {
        GF.sfx('page');
        if (opt.skipAll && ended) return;
        if (i < cuts.length - 1) { i++; render(); return; }
        finish();
      };
      nb.onclick = (e) => { e.stopPropagation(); opt.skipAll ? finish() : next(); };
      r.addEventListener('pointerup', (e) => { if (e.target === r || e.target.closest('.bg')) opt.skipAll ? finish() : next(); });
      if (opt.skipAll) nb.style.display = 'none';
      render();
  };
  /* 첫 만남 인사: 첫 실행 1회, 세 가족 한 컷(①은 프롤로그 3컷)을 자동으로 넘기고 아무 데나 탭하면 바로 건너뛴다. 5앱 같은 모양(GF.story) */
  GF.screen('greet', {
    wide: () => true,
    enter(r, p) { GF.story(r, p.cuts, () => { GF.state.greeted = 1; Store.save(); if (p.then) p.then(); else GF.back(); GF.proTale(); }, { auto: p.auto || 3200, skipAll: true }); },
  });
  const GREET = {
    'gf:idle:ui:v1': [{ bg: 'indoor', text: '세 가족이 한 동네에 살아요. 오늘도 식탁은 따뜻해요.', chars: [{ id: 'nemo_dad.joy', x: 80, y: 600 }, { id: 'wife.joy', x: 190, y: 600 }, { id: 'dong_dad.joy', x: 300, y: 600 }] }],
    'gf:merge:ui:v1': [{ bg: 'indoor2', text: '네모, 세모, 동그라미가 새집으로 이사 가요.', chars: [{ id: 'nemo_dad.joy', x: 80, y: 600 }, { id: 'wife.joy', x: 190, y: 600 }, { id: 'dong_dad.joy', x: 300, y: 600 }] }],
    'gf:color:ui:v1': [{ bg: 'home', text: '막둥이랑 세모 이모랑 같이 색칠해요!', chars: [{ id: 'baby.joy', x: 90, y: 600 }, { id: 'nemo_kids.kid1', x: 190, y: 600 }, { id: 'wife.joy', x: 290, y: 600 }] }],
    'gf:block:ui:v1': [{ bg: 'indoor2', text: '네모, 세모, 동그라미가 벽돌을 쌓아 새집을 지어요.', chars: [{ id: 'nemo_dad.joy', x: 80, y: 600 }, { id: 'wife.joy', x: 190, y: 600 }, { id: 'dong_dad.joy', x: 300, y: 600 }] }],
    'gf:spot:ui:v1': [{ bg: 'indoor2', text: '네모, 세모, 동그라미네 옛이야기 속에서 달라진 곳을 찾아봐요.', chars: [{ id: 'nemo_dad.joy', x: 80, y: 600 }, { id: 'wife.joy', x: 190, y: 600 }, { id: 'dong_dad.joy', x: 300, y: 600 }] }],
    'gf:tile:ui:v1': [{ bg: 'indoor2', text: '네모, 세모, 동그라미네 마당에서 같은 그림을 세 개씩 모아요.', chars: [{ id: 'nemo_dad.joy', x: 80, y: 600 }, { id: 'wife.joy', x: 190, y: 600 }, { id: 'dong_dad.joy', x: 300, y: 600 }] }],
    'gf:sort:ui:v1': [{ bg: 'indoor2', text: '네모, 세모, 동그라미네 물건을 칸마다 종류별로 정리해요.', chars: [{ id: 'nemo_dad.joy', x: 80, y: 600 }, { id: 'wife.joy', x: 190, y: 600 }, { id: 'dong_dad.joy', x: 300, y: 600 }] }],
    'gf:day:ui:v1': [{ bg: 'home', text: '막둥이와 하루를 지내 봐요. 이도 닦고, 옷도 입고, 밥도 먹어요.', chars: [{ id: 'nemo_kids.kid1', x: 80, y: 600 }, { id: 'baby.joy', x: 190, y: 600 }, { id: 'wife.joy', x: 300, y: 600 }] }],
    'gf:quiz:ui:v1': [{ bg: 'indoor2', text: '네모, 세모, 동그라미. 오늘 하루, 당신은 누구와 닮았나요?', chars: [{ id: 'nemo_dad.joy', x: 80, y: 600 }, { id: 'wife.joy', x: 190, y: 600 }, { id: 'dong_dad.joy', x: 300, y: 600 }] }],
  };
  GF.proTale = () => { if (GF.tale && GF.tale.ready) setTimeout(() => GF.tale.prologue(document.getElementById('safe')), 300); };   // 이야기 프롤로그(첫 인사 다음, 한 번)
  GF.maybeGreet = () => {
    const cuts = GREET[KEY]; if (!cuts) { GF.proTale(); return; }
    const ids = cuts.flatMap((c) => c.chars.map((q) => q.id)); try { if (GF.data.idle_balance) ids.push(...(JSON.stringify(GF.data.idle_balance).match(/"[a-z_]+\.[a-z0-9]+"/g) || []).map((x) => x.slice(1, -1)).filter((x) => !/^art\./.test(x))); } catch (e) { /* 미리 읽기 실패는 무시 */ }
    GF.predecode(ids);                                                         // 인사가 떠 있는 동안(없어도 홈 직후) 다음 화면 그림을 디코딩
    if (GF.state.greeted) { GF.proTale(); return; }
    if (navigator.webdriver && !/[?&]greet=1/.test(location.search)) { GF.proTale(); return; }       // 자동 시험(smoke)은 건너뜀. 인사 확인은 ?greet=1
    GF.go('greet', { cuts });
  };
  GF.screen('book', {
    wide: () => true,
    enter(r, p) {
      const cuts = GF.data.story[p.ch][p.part];
      GF.story(r, cuts, () => {
        if (p.part === 'pro') { GF.state.seen[p.ch] = 1; Store.save(); if (p.replay) GF.back(); else GF.replace('stages', { ch: p.ch }); }
        else { Reward.sticker(p.ch + '_book'); GF.popTo('map'); }
      });
    },
  });

  /* ---------------- 스테이지 선택 ---------------- */
  const stageDone = (id) => GF.state.stages[id] && GF.state.stages[id].done;
  /** 다음에 할 첫 판: 열려 있는 장에서 아직 안 깬 첫 단계(없으면 null) */
  GF.quickStage = () => {
    for (let n = 1; n <= 40; n++) {
      const ch = 'ch' + n, def = GF.data.stages[ch]; if (!def) continue; if (!(n === 1 || n === 6 || n === 11 || stageDone('c' + (n - 1) + 'C'))) continue;
      for (let k = 0; k < def.stages.length; k++) { const id = 'c' + n + 'ABC'[k]; if (!stageDone(id)) return { ch, k, id }; }
    }
    return null;
  };
  GF.screen('stages', {
    wide: () => true,
    enter(r, p) {
      const ch = p.ch, def = GF.data.stages[ch], n = ch.slice(2);
      GF.bg(def.bg, r);
      def.stages.forEach((s, k) => {
        const id = 'c' + n + 'ABC'[k], open = k === 0 || stageDone('c' + n + 'ABC'[k - 1]), rec = GF.state.stages[id];
        const b = el('button', 'card stagebtn' + (open ? '' : ' locked'), r); if (GF.safeWide) { b.style.top = '130px'; b.style.left = 'calc(50% + ' + ((k - 1) * 215) + 'px)'; } else b.style.top = (130 + k * 140) + 'px';
        el('div', 'badge', b, dotsHTML(k + 1));
        el('div', '', b, open ? starsHTML(rec ? rec.stars : 0) : IC.lock);
        b.onclick = () => { if (!open) { GF.sfx('hmm'); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); return; } GF.sfx('pick'); Stage.start({ kind: 'story', ch, k, id }); };
      });
      const bk = el('button', 'round-btn', r, IC.book.replace('viewBox="0 0 64 64"', 'viewBox="0 0 64 64" width="34" height="34"')); bk.style.cssText = 'position:absolute;left:14px;bottom:18px;width:64px;height:64px';
      bk.onclick = () => GF.go('book', { ch, part: 'pro', replay: true });
    },
  });

  /* ---------------- 놀이방 ---------------- */
  GF.screen('playroom', {
    wide: () => true,
    enter(r) {
      GF.bg('home', r);
      GAME_ORDER.forEach((g, i) => {
        const open = !!GF.modes[g] && GF.modes[g].free;
        const b = el('button', 'card' + (open ? '' : ' locked'), r);
        const col = i % 2, row = Math.floor(i / 2);
        b.style.cssText += GF.safeWide ? 'left:' + (24 + i * 134) + 'px;top:150px;width:124px;height:170px' : 'left:' + (20 + col * 170) + 'px;top:' + (84 + row * 180) + 'px;width:150px;height:160px';
        b.appendChild(GF.img(GAME_HERO[g]));
        const ic = el('div', '', b, IC[GAME_ICON[g]]); ic.style.cssText = 'position:absolute;left:8px;top:8px;width:40px;height:40px;background:#fff;border-radius:12px;padding:4px;box-shadow:0 2px 0 rgba(0,0,0,.12)';
        if (!open) el('div', '', b, '<svg class="lock" viewBox="0 0 32 32">' + IC.lock.slice(IC.lock.indexOf('>') + 1));
        b.onclick = () => { if (!open) { GF.sfx('hmm'); b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400); return; } GF.sfx('pick'); pickLevel(r, g); };
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
    start(o) {
      run = Object.assign({ i: 0, res: [], level: 0, zero: 0 }, o);
      if (o.kind === 'story') GF.preload(GF.data.stages[o.ch].stages[o.k]);
      GF.go('round');
    },
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
    wide: () => { const m = run.kind === 'story' ? GF.data.stages[run.ch].mode : run.mode; return !!(GF.modes[m] && GF.modes[m].land); },
    leave() { clearTimers(); },
    enter(r) {
      const def = run.kind === 'story' ? GF.data.stages[run.ch] : null;
      const modeName = run.kind === 'story' ? def.mode : run.mode, mode = GF.modes[modeName];
      GF.bg(run.kind === 'story' ? def.bg : 'house', r);
      const area = el('div', 'playarea', r);
      const cfg = run.kind === 'story' ? def.stages[run.k].rounds[run.i] : mode.free(run.diff, run.i);
      hintCount = 0; let finished = false;
      const ctx = {
        W: GF.safe.w, H: GF.safe.h - 64, AW: GF.safe.w, AX: 0, level: run.level, sfx: GF.sfx, img: GF.img, shuffle, rnd, say: GF.say,
        timeout(fn, ms) { const t = setTimeout(fn, ms); timers.push(t); return t; },
        setHint(fn) { hintFn = fn; armHint(); },
        done(res) {
          if (finished) return; finished = true; hintFn = null; hintT.forEach(clearTimeout); res.hints = hintCount;
          GF.sfx('celebrate'); GF.confetti(area);
          const fx = [...area.querySelectorAll('.tok.done, .cut-char')]; fx.forEach((n, i) => setTimeout(() => GF.jump(n), i * 110));
          ctx.timeout(() => finish(r, res, def), 1500);
        },
      };
      r.querySelectorAll('.fly').forEach((e) => { e.style.display = 'none'; });          // 놀이 영역에서는 나비를 숨긴다
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
    const ov = el('div', 'uk-scrim', r), pn = el('div', 'uk-sheet', ov);          // 결과 = 키트 팝업(모든 게임 같은 모양)
    const hero = el('div', 'hero', pn); hero.appendChild(GF.img(rnd(heroes)));
    pn.appendChild(UK.stars(stars, 3));
    setTimeout(() => GF.sfx('star'), 150);
    const row = el('div', 'acts row', pn); row.style.justifyContent = 'center';
    if (!last) {
      const nb = el('button', 'uk-round lg', row, IC.play); nb.onclick = () => { GF.sfx('pick'); run.i++; clearTimers(); r.innerHTML = ''; GF.screens.round.enter(r); };
      return;
    }
    // 스테이지 완료
    const avg = Math.max(1, Math.floor(run.res.reduce((a, b) => a + b, 0) / run.res.length));   // 평균 내림: 한 라운드라도 틀리면 ★3 이 안 된다
    const rec = GF.state.stages[run.id] || {}; rec.done = true; rec.stars = Math.max(rec.stars || 0, avg); GF.state.stages[run.id] = rec; Store.save(); refreshBar();
    const gain = Reward.sticker(run.ch + '_' + 'ABC'[run.k], avg === 3);
    const n = run.ch.slice(2);
    if (run.k === 2 && window.Room && Room.data) { const gi = { ch1: 'k_party', ch2: 'k_train' }[run.ch] || 'k_' + run.ch; if (Room.grant(gi)) { GF.sfx('star'); const it = Room.item(gi), gf = el('div', 'kgift', r); const im = el('img', '', gf); im.src = Room.src(it, it.colors[0]); setTimeout(() => gf.remove(), 2600); } }   // 장을 끝내면 아이 방에 장난감 하나
    if (run.k === 2 && ['A', 'B', 'C'].every((l) => (GF.state.stages['c' + n + l] || {}).stars === 3)) Reward.sticker(run.ch + '_star');
    if (gain) { const s = Reward.stickerEl(run.ch + '_' + 'ABC'[run.k]); pn.insertBefore(s, row); setTimeout(() => GF.sfx('star'), 500); }
    const again = el('button', 'uk-round lg gold', row, IC.again); again.onclick = () => { GF.sfx('pick'); const o = run; GF.stack.pop(); Stage.start({ kind: 'story', ch: o.ch, k: o.k, id: o.id }); };
    const nxt = el('button', 'uk-round lg', row, IC.play);
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
    wide: () => true,
    enter(r, p) {
      const book = p.book || 1, off = (book - 1) * 5;
      GF.bg('home', r);
      const a = el('div', 'album', r);
      const chapters = [...new Set(GF.data.stickers.map((s) => s.ch))].filter((c) => c > off && c <= off + 5);
      chapters.forEach((ch, i) => {
        const row = el('div', 'albrow', a); el('div', 'ch', row, i + 1);
        GF.data.stickers.filter((s) => s.ch === ch).forEach((s) => {
          const lv = GF.state.stickers[s.id] || 0, d = el('div', 'sticker' + (lv === 2 ? ' shiny' : lv ? '' : ' empty'), row);
          d.appendChild(GF.img(s.char));
        });
      });
      bookArrows(r, book, 'album');
    },
  });

  /* ---------------- 부모 잠금·메뉴 ---------------- */
  const Gate = {
    /* 보호자 잠금: 3~7세가 못 푸는 구구단(6~9단) 4지선다. 풀면 cb(), 틀리면 닫힘. 설정·가족 집·코드 입력·외부로 나가는 모든 것이 이 문을 지난다. */
    ask(cb) {
      const R = (n) => Math.floor(Math.random() * n), a = 6 + R(4), b = 6 + R(4), ans = a * b, opts = new Set([ans]);
      while (opts.size < 4) { const d = [a, b, 10, 1, 2][R(5)] * (R(2) ? 1 : -1); if (ans + d > 0) opts.add(ans + d); }
      const list = [...opts].sort(() => Math.random() - 0.5), p = Gate.p, pn = p.firstChild; pn.innerHTML = '<h3>보호자 확인: ' + a + ' × ' + b + ' = ?</h3>';
      const nums = el('div', 'nums', pn);
      list.forEach((n) => { const bt = el('button', '', nums, n); bt.onclick = () => (n === ans ? (cb(), 0) : Gate.close()); });
      p.classList.add('on');
    },
    open() { Gate.ask(() => Gate.menu()); },
    close() { Gate.p.classList.remove('on'); },
    menu() {
      if (GF.extras && GF.extras.ready) { Gate.close(); GF.extras.open('parent'); return; }   // 공통 보호자 메뉴(games/engine/extras.js)
      const s = GF.state.settings, pn = Gate.p.firstChild;
      pn.innerHTML = '<h3>부모 메뉴</h3>';
      const l1 = el('div', 'line', pn, '<span>소리 크기</span>'), rg = el('input', '', l1); rg.type = 'range'; rg.min = 0; rg.max = 1; rg.step = 0.1; rg.value = s.vol;
      rg.oninput = () => { s.vol = +rg.value; Store.save(); GF.bgm.sync(); GF.sfx('tap'); };
      const l2 = el('div', 'line', pn, '<span>자막 보기</span>'), b2 = el('button', 't', l2, !s.capOff ? '켜짐' : '꺼짐');
      b2.onclick = () => { s.capOff = !s.capOff; b2.textContent = !s.capOff ? '켜짐' : '꺼짐'; Store.save(); };
      const l3 = el('div', 'line', pn, '<span>진행 지우기</span>'), b3 = el('button', 't', l3, '지우기'); let armed = false;
      b3.onclick = () => { if (!armed) { armed = true; b3.textContent = '한 번 더'; return; } Store.reset(); Gate.close(); GF.home(); };
      el('small', '', pn, '이 앱은 이름·사진·위치·기기 정보를 수집하지 않고, 광고와 결제가 없으며, 인터넷에 연결하지 않습니다. 진행 기록은 이 기기 안에만 저장됩니다.');
      const c = el('div', 'line', pn); const cb = el('button', 't', c, '닫기'); cb.onclick = Gate.close;
    },
  };
  GF.gate = (cb) => Gate.ask(cb);                   // 다른 화면(가족 집·코드 입력)도 같은 잠금을 쓴다
  GF.overlayOpen = () => { if (Gate.p.classList.contains('on')) { Gate.close(); return true; } return false; };

  /* ---------------- 부팅 ---------------- */
  async function loadData(namesOpt) {
    if (window.GF_DATA) return window.GF_DATA;
    const names = (namesOpt || ['chars', 'stages', 'story', 'stickers', 'sounds', 'anchors', 'art_slots', 'room_items']).concat(['names']), out = {};
    await Promise.all(names.map(async (n) => { try { out[n] = await (await fetch(GF.base + 'data/' + n + '.json')).json(); } catch (e) { if (n === 'art_slots') out[n] = {}; else if (n === 'room_items') out[n] = null; else throw e; } }));
    return out;
  }
  // opts: {base:데이터 경로, audioBase:소리 경로, dataNames:[…], storeKey, start:()=>첫 화면}  — 방치형 등 다른 앱이 같은 엔진을 쓴다
  GF.boot = async function (opts) {
    opts = opts || {};
    if (opts.base != null) GF.base = opts.base; if (opts.audioBase != null) GF.audioBase = opts.audioBase; if (opts.storeKey) KEY = opts.storeKey; GF.opts = opts;
    stage = $('stage'); safeEl = $('safe'); topbar = $('topbar');
    GF.data = await loadData(opts.dataNames);
    if (window.UK && GF.data.art_slots && GF.data.art_slots.icons) UK.useIcons(GF.data.art_slots.icons);   // 아이콘 슬롯(SVG 텍스트)
    if (GF.props && GF.data.art_slots && GF.data.art_slots.props) Object.keys(GF.data.art_slots.props).forEach((k) => { if (GF.props[k]) GF.props[k].src = GF.slot('props', k); });   // 소품 슬롯
    if (GF.data.base != null) GF.base = GF.data.base;
    GF.state = Store.load();
    if (window.Room && GF.data.room_items && !opts.dataNames) {   // ① 놀이터: 유아 그룹 집(아이 방만 보임, 가족 집은 보호자 잠금 뒤)
      Room.init({ data: GF.data.room_items, game: 'playground', mode: 'kid', autoPlace: true, guard: (cb) => Gate.ask(cb), store: Room.sharedStore('gf:house:kid:v1'), charSrc: (id) => GF.src(id), slot: (k, id) => GF.slot(k, id) });
      if (GF.extras) GF.extras.init({ app: 'play', kid: true, noHold: true, stats: () => [['별', totalStars()], ['깬 단계', Object.values(GF.state.stages).filter((x) => x.stars > 0).length], ['스티커', Object.keys(GF.state.stickers || {}).length]], reset: () => GF.resetState() });
    }
    ensureAudio(); loadSounds();
    fit(); window.addEventListener('resize', () => { fit(); const s = GF.cur; if (s && wantWide(s, s.params) !== !!GF.safeWide) show(s.name, s.params); });
    document.addEventListener('contextmenu', (e) => e.preventDefault());
    // 상단 바
    $('b-home').innerHTML = IC.home;
    // 홈·뒤로: 한 번 탭으로 바로(실기기에서 두 번 탭 설계가 '안 먹는다'로 느껴짐). 우발 종료는 앱을 닫지 않으므로 문제없음, 설정은 부모 잠금.
    $('b-home').onclick = () => { GF.sfx('tap'); GF.home(); };
    if ($('b-back')) { $('b-back').innerHTML = IC.back || IC.home; $('b-back').onclick = () => { GF.sfx('tap'); GF.back(); }; }
    $('b-sound').onclick = () => { GF.state.settings.mute = !GF.state.settings.mute; Store.save(); refreshBar(); GF.bgm.sync(); GF.sfx('tap'); };
    // 부모 패널
    const p = el('div', 'parent', safeEl); el('div', 'panel', p); Gate.p = p;
    document.addEventListener('pointerdown', () => { ensureAudio(); loadSounds(); GF.bgm.start(); }, { once: true });
    document.addEventListener('visibilitychange', () => GF.bgm.sync());
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') GF.back(); });
    window.addEventListener('popstate', () => GF.back());
    if (opts.start) await opts.start(); else GF.home();
    GF.maybeGreet();
    GF.ready = true;
  };
})();
