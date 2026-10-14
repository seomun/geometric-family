/* 운영·리텐션 공통 층 GF.ops (허브 D21, games/20_MUST_HAVE_FEATURES.md).
   소: 새 소식 · 문의·FAQ · 복귀 선물(성인) · 금요일 선물(유아) · 움직임 줄이기 · 인앱 리뷰(성인).  각 앱은 GF.extras.init 안에서 GF.ops.init(cfg) 가 자동으로 불린다.
   원칙: 압박 없음(카운트다운·끊김 벌칙 없음) · 뽑기 없음(확정 지급) · 서버 없음(기기 날짜만) · 유아 앱은 글자 없는 연출(보호자 메뉴만 글자) · 웹판·브라우저는 네이티브 호출이 전부 no-op.
   문자열은 전부 data/ops.json 의 strings 표(GF.t 키) — 번역은 이 표만 바꾸면 된다(H7: 영·일은 나중). */
(function () {
  'use strict';
  const el = UK.el, O = (GF.ops = { ready: false, d: null, app: null, kid: false, cfg: null });
  const LS = (k, v) => { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} return null; };
  const DAY = 86400000, safe = () => document.getElementById('safe');
  /** 문자열 표: GF.t('키', {변수}) — 키가 없으면 키를 그대로 돌려줘 빠진 곳이 바로 보인다 */
  GF.lang = GF.lang || 'ko'; GF.t = (k, v) => { const o = (GF.data && GF.data.ops) || {}, s = o.strings || {}; let t = GF.lang === 'en' && o.strings_en && o.strings_en[k] ? o.strings_en[k] : s[k]; if (t == null) return k;      // 문자열 사전: ko 기본, en 은 비어 있으면 ko 로 대신(다국어 준비 C15)
  if (v) t = t.replace(/\{(\w+)\}/g, (m, x) => (v[x] != null ? v[x] : m)); return t; };
  const key = () => 'gf:' + O.app + ':ops', st = () => Object.assign({ lastOpen: 0, newsSeen: '', giftWeek: '', reviewAt: 0, clears: 0 }, LS(key()) || {}), put = (s) => LS(key(), s);
  O.native = () => (window.GFOps && typeof window.GFOps.version === 'function' ? window.GFOps : null);
  /** 시험용 가짜 시계: GF.ops._now = () => 시각(ms) */
  O._now = () => Date.now();
  const nowD = () => new Date(O._now());
  const weekKey = (d) => { const t = new Date(d.getFullYear(), d.getMonth(), d.getDate()), a = new Date(t.getFullYear(), 0, 1); return t.getFullYear() + 'w' + Math.floor(((t - a) / DAY + a.getDay()) / 7); };
  const S = () => GF.state.settings;

  /* ---------------- 움직임 줄이기 ---------------- */
  O.motionOn = () => { const s = S(); if (s && s.rm != null) return !!s.rm; try { return !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches); } catch (e) { return false; } };
  O.applyMotion = () => { document.documentElement.dataset.rm = O.motionOn() ? '1' : '0'; };
  if (UK.confetti && !UK._rmWrapped) { const c0 = UK.confetti; UK.confetti = function () { if (document.documentElement.dataset.rm === '1') return; return c0.apply(this, arguments); }; UK._rmWrapped = true; }

  /* ---------------- 시트 도우미 ---------------- */
  function sheet(title) {
    const sc = UK.modal({ title, dismiss: true, parent: safe() }), sh = sc.querySelector('.uk-sheet'); sh.classList.add('xt-sheet');
    const body = el('div', 'xt-body', sh), a = el('div', 'acts row', sh); UK.btn({ text: GF.t('common.close'), cls: 'ghost', onclick: () => sc.close() }, a); return { sc, body };
  }

  /* ---------------- 새 소식 ---------------- */
  O.openNews = function () {
    const n = O.d && O.d.news; if (!n) return; const { body } = sheet(GF.t('ops.news.title'));
    (n.items || []).forEach((it) => { const b = el('div', 'ops-news', body); el('b', '', b, it.ver + (it.title ? ' · ' + it.title : '')); (it.lines || []).forEach((l) => el('p', '', b, '• ' + l)); });
    const s = st(); s.newsSeen = n.version; put(s);
  };
  function newsAuto() {
    const n = O.d && O.d.news; if (!n || O.kid) return; const s = st();
    if (!s.newsSeen) { s.newsSeen = n.version; put(s); return; }                                  // 첫 실행: 조용히 기록(새 소식은 업데이트 뒤부터)
    if (s.newsSeen !== n.version) setTimeout(() => { if (!document.querySelector('.tale-ov')) O.openNews(); else s.newsSeen = n.version; }, 2600);
  }

  /* ---------------- 문의 · FAQ ---------------- */
  O.openHelp = function () {
    const { body } = sheet(GF.t('ops.help.title')), faq = (O.d && O.d.faq) || [];
    faq.forEach((f) => { const d = el('details', 'ops-faq', body); el('summary', '', d, f.q); el('p', '', d, f.a); });
    const mail = O.d && O.d.supportEmail, w = el('div', 'ops-mail', body);
    if (mail) { const b = UK.btn({ text: GF.t('ops.help.mail'), icon: 'next', cls: 'green block', onclick: () => { if (!O.outOk()) return; const n = O.native(); if (n && n.mail) { try { n.mail(mail, GF.t('ops.help.subject', { app: O.app, ver: (n.version && n.version()) || '' }), ''); } catch (e) {} } else { try { navigator.clipboard.writeText(mail); } catch (e) {} UK.toast(mail, safe()); } } }, w); void b; }
    else el('small', 'xt-note', w, GF.t('ops.help.nomail'));
  };


  /* ---------------- 오류 기록 틀(C21): 기기 안에 최근 오류 50건만 보관 → 설정 「문제 알리기」에서 보호자가 메일로 보낼 수 있다. 개인정보·계정·주소·토큰은 지우고, 서버로 자동 전송하지 않는다 ---------------- */
  const ERR_KEY = 'gf:errlog:v1', ERR_MAX = 50;
  const clean = (s) => String(s == null ? '' : s).replace(/https?:\/\/[^\s)'"]+/g, (u) => { const m = /([^/?#]+)(?:[?#].*)?$/.exec(u); return m ? m[1] : '[주소]'; }).replace(/[\w.+-]+@[\w-]+(?:\.[\w-]+)+/g, '[메일]').replace(/\b[0-9a-fA-F]{20,}\b/g, '[값]').replace(/\b\d{8,}\b/g, '[숫자]').replace(/file:\/\/\/?[^\s)]*\//g, '').replace(/\s+/g, ' ').trim().slice(0, 180);
  const eload = () => { try { const a = JSON.parse(localStorage.getItem(ERR_KEY) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } };
  const esave = (a) => { try { localStorage.setItem(ERR_KEY, JSON.stringify(a.slice(-ERR_MAX))); } catch (e) { /* 저장 불가 */ } };
  O.errlog = {
    get: eload, count: () => eload().length,
    /** 한 건 기록: 같은 글이 5초 안에 또 오면 횟수만 올린다. 기록 중 오류는 삼킨다(되먹임 방지) */
    add(msg, src) { try { const m = clean(msg), s = clean(src), now = O._now ? O._now() : Date.now(), a = eload(), last = a[a.length - 1]; if (!m) return; if (last && last.m === m && last.s === s && now - last.t < 5000) { last.n = (last.n || 1) + 1; last.t = now; } else a.push({ t: now, a: O.app || '', m, s, n: 1 }); esave(a); } catch (e) { /* 기록 실패는 무시 */ } },
    clear() { try { localStorage.removeItem(ERR_KEY); } catch (e) { /* 없음 */ } },
    /** 메일 본문(개인정보 없음): 앱·버전·기기 종류·화면·언어 + 최근 오류 */
    body() {
      const n = O.native && O.native(), ver = (n && n.version && (() => { try { return n.version(); } catch (e) { return ''; } })()) || '', a = eload().slice(-20), ua = (navigator.userAgent || '').replace(/\(([^)]*)\)/, (m, g) => '(' + g.split(';').slice(0, 2).join(';') + ')').slice(0, 120);
      return ['앱: ' + (O.app || '') + ' ' + ver, '기기: ' + clean(ua), '화면: ' + (window.innerWidth || 0) + 'x' + (window.innerHeight || 0) + ' · 언어: ' + (GF.lang || 'ko'), '', '최근 오류 ' + a.length + '건(최대 20건):'].concat(a.map((e, i) => (i + 1) + '. [' + (e.a || '') + '] ' + e.m + (e.s ? ' @' + e.s : '') + (e.n > 1 ? ' ×' + e.n : ''))).join('\n');
    },
  };
  if (!window.__gfErrHook) {
    window.__gfErrHook = 1;
    window.addEventListener('error', (e) => { O.errlog.add(e.message, (e.filename ? e.filename : '') + (e.lineno ? ':' + e.lineno : '')); });
    window.addEventListener('unhandledrejection', (e) => { const r = e.reason; O.errlog.add((r && (r.message || r)) || '약속 오류', ''); });
  }
  /* 앱 밖으로 나가는 동작(메일 앱 등)의 방어선: 유아 앱은 보호자 확인을 방금(10분 안) 지났을 때만 허용, 아니면 확인 창을 띄우고 이번 눌림은 무시 */
  O.outOk = function () { if (!O.kid) return true; if (GF.gateAt && Date.now() - GF.gateAt < 600000) return true; if (GF.gate) GF.gate(() => { GF.gateAt = Date.now(); const g = document.querySelector('.parent'); if (g) g.classList.remove('on'); }); return false; };
  O.openReport = function () {
    const { body } = sheet(GF.t('ops.report.title')), list = O.errlog.get().slice(-8).reverse();
    el('p', 'xt-p', body, GF.t('ops.report.note')); el('p', 'xt-p', body, list.length ? GF.t('ops.report.count', { n: O.errlog.count() }) : GF.t('ops.report.none'));
    if (list.length) { const box = el('div', 'ops-errs', body); list.forEach((e) => el('small', 'xt-note', box, '· ' + e.m + (e.n > 1 ? ' ×' + e.n : ''))); }
    const mail = O.d && O.d.supportEmail, w = el('div', 'ops-mail', body);
    if (mail) UK.btn({ text: GF.t('ops.report.mail'), icon: 'next', cls: 'green block', onclick: () => { if (!O.outOk()) return; const n = O.native(); if (n && n.mail) { try { n.mail(mail, GF.t('ops.report.subject', { app: O.app }), O.errlog.body()); } catch (e) { /* 메일 앱 없음 */ } } else { try { navigator.clipboard.writeText(mail + '\n' + O.errlog.body()); } catch (e) { /* 복사 실패 */ } UK.toast(GF.t('ops.report.copied'), safe()); } } }, w); else el('small', 'xt-note', w, GF.t('ops.help.nomail'));
    UK.btn({ text: GF.t('ops.report.copy'), cls: 'sky block', onclick: () => { try { navigator.clipboard.writeText(O.errlog.body()); } catch (e) { /* 복사 실패 */ } UK.toast(GF.t('ops.report.copied'), safe()); } }, w);
    if (list.length) UK.btn({ text: GF.t('ops.report.clear'), cls: 'ghost block', onclick: () => { O.errlog.clear(); UK.toast(GF.t('ops.report.cleared'), safe()); } }, w);
  };

  /* ---------------- 선물(집 소품 확정 지급) ---------------- */
  function nextGift() {
    if (!window.Room || !Room.data) return null; const c = O.cfg || {}, sets = [c.rewardSet, 'kid'].filter(Boolean);
    for (const set of sets) { const it = Room.data.items.find((i) => i.set === set && !Room.has(i.id)); if (it) return it; } return null;
  }
  function giftModal(opt) {
    const it = nextGift(); let got = null; if (it && Room.grant(it.id)) got = it;
    if (O.kid) {   // 유아: 글자 없이 큰 선물 상자 + 소품 그림 + 확인 아이콘
      const sc = UK.modal({ parent: safe(), title: '', big: got ? '🎁' : '🌟', body: '', actions: [{ text: '', icon: 'play', cls: 'green', onclick: () => {} }] });
      const ac = sc.querySelector('.acts .uk-btn'); if (ac) ac.setAttribute('aria-label', 'ok'); GF.sfx('celebrate'); try { UK.confetti(sc); } catch (e) {} return sc;
    }
    const sc = UK.modal({ parent: safe(), title: opt.title, big: got ? '🎁' : '💛', body: got ? GF.t(opt.got, { name: got.name }) : GF.t(opt.none), actions: [{ text: GF.t('ops.thanks'), cls: 'green', onclick: () => {} }] });
    GF.sfx(got ? 'celebrate' : 'ok'); try { UK.confetti(sc); } catch (e) {} return sc;
  }
  /** 복귀 선물(성인): 7일 넘게 쉬었다 오면 소품 1개 확정. 끊김 표시·벌칙 없음 */
  function comeback() {
    const s = st(), now = O._now(); const gap = s.lastOpen ? (now - s.lastOpen) / DAY : 0; s.lastOpen = now; put(s);
    if (gap >= 7 && !O.kid) setTimeout(() => { if (!document.querySelector('.tale-ov')) giftModal({ title: GF.t('ops.back.title'), got: 'ops.back.got', none: 'ops.back.none' }); }, 2400);
  }
  /** 금요일 선물(유아): 금요일에 열면 그 주에 한 번, 글자 없는 선물 상자 */
  O.fridayGift = function () {
    if (!O.kid || !O.ready) return false; const d = nowD(), s = st(); if (d.getDay() !== 5 || s.giftWeek === weekKey(d)) return false;
    if (document.querySelector('.tale-ov')) { setTimeout(O.fridayGift, 2500); return false; }
    s.giftWeek = weekKey(d); put(s); giftModal({}); return true;
  };

  /* ---------------- 인앱 리뷰(성인, 10판 클리어 뒤 기쁜 순간, 90일에 1회) ---------------- */
  O.noteClear = function (stars) { const s = st(); s.clears = (s.clears || 0) + 1; put(s); O._lastStars = stars || 0; };
  O.reviewDue = function () { const s = st(); return !O.kid && O.ready && s.clears >= 10 && O._now() - (s.reviewAt || 0) >= 90 * DAY; };
  /** 결과 화면을 닫은 직후(별 3개)에만 부른다. 요청했으면 true(그때는 전면 광고를 건너뛴다) */
  O.maybeReview = function (stars) {
    if (!O.reviewDue() || (stars || 0) < 3) return false; const n = O.native(); if (!n || !n.review) return false;
    const s = st(); s.reviewAt = O._now(); put(s); try { n.review(); } catch (e) {} return true;
  };


  /* ---------------- 이벤트 달력(H5): 오프라인 날짜 기반, 해마다 반복, 놓친 이벤트는 「다시 열기」. 카운트다운·FOMO 문구 없음 ---------------- */
  O.openCalendar = function () {
    const ev = (O.cfg && O.cfg.calendar && O.cfg.calendar()) || []; const { sc, body } = sheet(GF.t('ops.cal.title')), m0 = nowD().getMonth() + 1;
    if (!ev.length) { el('p', 'xt-p', body, GF.t('ops.cal.empty')); return; }
    for (let m = 1; m <= 12; m++) {
      const here = ev.filter((e) => (e.months || []).includes(m)); if (!here.length) continue;
      const r = el('div', 'ops-cal' + (m === m0 ? ' now' : ''), body); el('b', '', r, GF.t('ops.cal.m', { m }));
      here.forEach((e) => {
        const state = e.done ? 'done' : (e.months.includes(m0) ? 'now' : (m < m0 ? 'again' : 'later')), label = e.done ? GF.t('ops.cal.done') : state === 'now' ? GF.t('ops.cal.now') : state === 'again' ? GF.t('ops.cal.again') : GF.t('ops.cal.later', { m });
        const b = el('button', 'ops-ev ' + state, r, (e.icon || '📅') + ' ' + e.title); el('small', '', b, label);
        b.onclick = () => { if (state === 'later') { GF.sfx('hmm'); UK.toast(label, safe()); return; } GF.sfx('pick'); sc.close(); e.play && e.play(); };
      });
    }
    el('p', 'xt-p', body, GF.t('ops.cal.note'));
  };

  /* ---------------- 오늘의 작은 일(미션): 3개, 못 해도 괜찮고 다 하면 확정 소품 1개(하루 1회) ---------------- */
  const POOL = [{ id: 'clear', n: 3, icon: '🎯' }, { id: 'star3', n: 1, icon: '⭐' }, { id: 'story', n: 1, icon: '📖' }, { id: 'house', n: 1, icon: '🏠' }, { id: 'daily', n: 1, icon: '📅' }];
  const dayKey = () => { const d = nowD(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
  const misToday = (s) => { const k = dayKey(); if (!s.mis || s.mis.d !== k) { const n = Math.floor(Date.UTC(nowD().getFullYear(), nowD().getMonth(), nowD().getDate()) / DAY), pick = [n % 5, (n + 2) % 5, (n + 3) % 5]; s.mis = { d: k, ids: pick.map((i) => POOL[i].id), prog: {}, gift: 0 }; } return s.mis; };
  O.note = function (id) { if (!O.ready || O.kid) return; const s = st(), m = misToday(s); if (m.ids.includes(id)) { const def = POOL.find((q) => q.id === id); m.prog[id] = Math.min(def.n, (m.prog[id] || 0) + 1); } put(s); };
  O.noteResult = function (stars) { O.note('clear'); if ((stars || 0) >= 3) O.note('star3'); };
  O.missions = function () { const s = st(), m = misToday(s); put(s); return m.ids.map((id) => { const d = POOL.find((q) => q.id === id); return { id, n: d.n, icon: d.icon, got: m.prog[id] || 0 }; }); };
  O.giftTaken = () => !!misToday(st()).gift;
  O.openMissions = function () {
    const { sc, body } = sheet(GF.t('ops.mis.title')), s = st(), m = misToday(s), list = O.missions();
    list.forEach((x) => { const r = el('div', 'ops-mis' + (x.got >= x.n ? ' ok' : ''), body); el('span', 'ic', r, x.icon); el('span', 'tx', r, GF.t('ops.mis.' + x.id, { n: x.n })); el('b', '', r, x.got >= x.n ? '✔' : x.got + '/' + x.n); });
    const all = list.every((x) => x.got >= x.n);
    if (all && !m.gift) { UK.btn({ text: GF.t('ops.mis.gift'), cls: 'gold block', onclick: () => { const s2 = st(), m2 = misToday(s2); if (m2.gift) return; const it = nextGift(); m2.gift = 1; put(s2); let got = null; if (it && Room.grant(it.id)) got = it; sc.close(); UK.toast(got ? GF.t('ops.mis.got', { name: got.name }) : GF.t('ops.mis.none'), safe()); GF.sfx('celebrate'); } }, body); }
    else if (m.gift) el('p', 'xt-p', body, GF.t('ops.mis.gifted'));
    el('p', 'xt-p', body, GF.t('ops.mis.note'));
  };


  /* ---------------- 내 도형 개인화(3): 칭호·말투. ⑤ 결과(Room.me)가 성인 앱 전체에 반영된다 ---------------- */
  O.me = () => { try { if (O.kid) return null; const m = window.Room && Room.me && Room.me(), T = m && Room.data.meTypes && Room.data.meTypes[m.f]; return T ? { f: m.f, name: T.sub[m.s] || T.name, color: T.color } : null; } catch (e) { return null; } };
  /** 말풍선 말투 필터: 네모 그대로 / 세모 들뜸(마침표→느낌표) / 동그라미 차분(느낌표→마침표) */
  O.tone = function (text) { const m = O.me(); if (!m || !text) return text; if (m.f === 'semo') return text.replace(/([가-힣a-zA-Z])\.(\s|$)/g, '$1!$2'); if (m.f === 'dong') return text.replace(/!/g, '.').replace(/~/g, ''); return text; };
  /** 이번 주 주제(ISO 주): ops.json weekThemes. 원격 설정이 덮을 수 있는 구조 */
  O.week = function () { const d = nowD(), t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())), dn = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - dn); const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)), w = Math.ceil(((t - y0) / DAY + 1) / 7); return ((O.d && O.d.weekThemes) || []).find((x) => x.w === w) || null; };
  O.weekRec = function () { const ev = (O.cfg && O.cfg.calendar && O.cfg.calendar()) || [], m0 = nowD().getMonth() + 1; return ev.find((e) => !e.done && e.months.includes(m0)) || null; };

  /* ---------------- IP 층 UI: 이야기 카드 · 도장책 · 가족 코드 · 유아 도장판 ---------------- */
  const GP = () => (GF.ip && GF.ip.ready ? GF.ip : null), ipD = () => (GF.data && GF.data.ops) || {};
  const appLabel = (a) => (ipD().appNames || {})[a] || a;
  /** 카드 퍼즐 목록: kid=true 면 글자 없이 이모지·점만 */
  function I_cards(body, sec, kid) {
    const I = GP(); if (!I) return; const g = I.kid ? 'kid' : 'adult', map = (ipD().cardMap || {})[g] || {}, tales = Object.keys(map), T = ipD().tales || {}; if (!tales.length) return;
    const done = tales.filter((t) => I.complete(t)).length; if (!kid) sec(GF.t('ops.album.cards') + ' ' + done + '/' + tales.length);
    const wrap = el('div', 'ops-cards', body);
    tales.forEach((t) => {
      const r = el('div', 'ops-card' + (I.complete(t) ? ' ok' : ''), wrap); el('span', 'ic', r, (T[t] || {}).icon || '📖'); if (!kid) el('b', '', r, (T[t] || {}).title || t);
      const dots = el('span', 'ops-dots', r); for (let i = 0; i < 4; i++) el('i', I.hasCard(t, i) ? 'on' : '', dots);
      if (!kid) { const miss = [0, 1, 2, 3].filter((i) => !I.hasCard(t, i)).map((i) => I.cardApp(t, i)).filter((x, i, ar) => x && ar.indexOf(x) === i && x !== (O.app)); if (I.complete(t)) el('small', '', r, '✔'); else if (miss.length) el('small', '', r, miss.map(appLabel).join(' · ')); }
    });
    if (!kid) el('p', 'xt-p', body, GF.t('ops.album.cardnote'));
  }
  O.openCameos = function () {
    const I = GP(); if (!I) return; const { sc, body } = sheet(GF.t('ops.cam.title')), n = I.cameoCount(); el('p', 'xt-p', body, GF.t('ops.cam.seen', { n: n.got, total: n.total }));
    const g = el('div', 'ops-cams', body); ((ipD().cameos || []).filter((c) => c.kid === I.kid)).forEach((c) => { const has = I.hasCameo(c.id), d = el('div', 'ops-cam' + (has ? ' on' : ''), g); if (has) { const a = el('i', 'av', d); a.style.backgroundImage = 'url("' + GF.src(c.who) + '")'; el('span', 'pr', d, c.prop); if (!I.kid) el('small', '', d, GF.t('ops.cam.from', { app: appLabel(c.frm) })); } else el('span', 'pr', d, '🔒'); });
    const due = I.cameoGifts(); if (due.length) UK.btn({ text: GF.t('ops.cam.gift'), cls: 'gold block', onclick: () => { let it = null; due.forEach((id) => { it = I.claimCameoGift(id) || it; }); sc.close(); UK.toast(it ? GF.t('ops.mis.got', { name: it.name }) : GF.t('ops.mis.none'), safe()); GF.sfx('celebrate'); } }, body);
  };
  O.openCards = function () { const { body } = sheet(GF.t('ops.album.cards')); I_cards(body, () => {}, O.kid); };
  O.openPassport = function () {
    const I = GP(); if (!I) return; const { body } = sheet(GF.t('ops.pass.title')), g = I.kid ? 'kid' : 'adult', apps = (ipD().apps || {})[g] || [];
    const row = (a) => { const r = el('div', 'ops-pass' + (a === O.app ? ' me' : ''), body); el('b', '', r, I.kid ? '' : appLabel(a)); const ds = el('span', 'ops-dots', r); const have = I.stamps(a); ['first', 'a', 'b', 'end', 'story'].forEach((id) => el('i', have.includes(id) ? 'on' : '', ds)); return r; };
    apps.forEach((a) => { const r = row(a); if (I.kid) { const ic = el('span', 'ic', r, a === 'play' ? '🧸' : a === 'color' ? '🎨' : '🌞'); r.insertBefore(ic, r.firstChild); } });
    const pl = el('div', 'ops-plates', body); [['ribbon', '🎀'], ['sparkle', '✨'], ['crown', '👑']].forEach(([id, e]) => { const has = I.plates().includes(id); const c = el('span', has ? 'on' : '', pl, has ? e : '🔒'); if (!I.kid) el('small', '', c, GF.t('ops.ip.plate.' + id) + (has ? '' : ' · ' + I.plateNeed(id))); });
    if (!I.kid) {
      el('h4', 'xt-h', body, GF.t('ops.pass.more')); const n = O.native();
      apps.filter((a) => a !== O.app).forEach((a) => { const pkg = 'com.geometricfamily.' + (a === 'idle' ? 'tables' : a), r = el('div', 'ops-more', body); el('b', '', r, appLabel(a)); const inst = !!(n && n.hasApp && n.hasApp(pkg));
        if (n && n.openStore) { const b2 = el('button', 'xt-btn', r, inst ? GF.t('ops.pass.open') : GF.t('ops.pass.store')); b2.onclick = () => { try { inst ? n.launch(pkg) : n.openStore(pkg); } catch (e) {} }; } });
      el('p', 'xt-p', body, GF.t('ops.pass.note'));
    }
  };
  O.openFamilyCode = function () {
    const I = GP(); if (!I) return; const { body } = sheet(GF.t('ops.fam.title')); el('p', 'xt-p', body, GF.t('ops.fam.note'));
    const out = el('textarea', 'ops-code', body); out.readOnly = true; out.rows = 3; out.style.display = 'none';
    UK.btn({ text: GF.t('ops.fam.make'), cls: 'sky block', onclick: () => { out.value = I.makeFamilyCode(); out.style.display = 'block'; out.select(); } }, body);
    el('h4', 'xt-h', body, GF.t('ops.fam.paste')); const inp = el('textarea', 'ops-code', body); inp.rows = 3; const msg = el('p', 'xt-p', body, '');
    UK.btn({ text: GF.t('ops.fam.apply'), cls: 'ghost block', onclick: () => { const r = I.applyFamilyCode(inp.value); msg.textContent = r.ok ? GF.t('ops.fam.ok') : GF.t('ops.fam.bad'); } }, body);
  };

  /* ---------------- 앨범: 집 소품 · 이야기 카드 · 계절. 확정 지급(뽑기·중복 없음), 이야기 카드 3장마다 소품 1개 ---------------- */
  function cardsDone() {
    const T = GF.tale, out = []; if (!T || !T.ready || !T.d.chapters) return out;
    Object.keys(T.d.chapters).forEach((n) => { const c = T.d.chapters[n], need = ['s' + n, 'e' + n].concat((c.mid || []).map((m) => 'm' + n + ':' + m.after)); out.push({ n, title: c.title, got: need.every((k) => T.seen(k)) }); });
    return out;
  }
  O.openAlbum = function () {
    const { sc, body } = sheet(GF.t('ops.album.title')), c = O.cfg || {}, s = st();
    const sec = (t) => el('h4', 'xt-h', body, t);
    if (window.Room && Room.data && c.rewardSet) { const its = Room.data.items.filter((i) => i.set === c.rewardSet), own = its.filter((i) => Room.has(i.id)).length; sec(GF.t('ops.album.items') + ' ' + own + '/' + its.length); const g = el('div', 'ops-chips', body); its.forEach((i) => el('span', Room.has(i.id) ? 'on' : '', g, Room.has(i.id) ? i.name : '🔒')); }
    I_cards(body, sec, false);
    const ev = (c.calendar && c.calendar()) || []; if (ev.length) sec(GF.t('ops.album.season') + ' ' + ev.filter((e) => e.done).length + '/' + ev.length);
  };

  /* ---------------- 백업 코드(H2): 기기 안에서 내보내기·가져오기, 체크섬. 서버 없음 ---------------- */
  const crc32 = (str) => { let c, crc = 0xFFFFFFFF; for (let i = 0; i < str.length; i++) { c = (crc ^ str.charCodeAt(i)) & 0xFF; for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xEDB88320 : c >>> 1; crc = (crc >>> 8) ^ c; } return ((crc ^ 0xFFFFFFFF) >>> 0).toString(16).padStart(8, '0'); };
  const b64e = (x) => btoa(unescape(encodeURIComponent(x))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''), b64d = (x) => decodeURIComponent(escape(atob(x.replace(/-/g, '+').replace(/_/g, '/'))));
  const mine = (k) => k.indexOf('gf:' + O.app + ':') === 0 || k.indexOf('gf:house:' + (O.kid ? 'kid' : 'adult') + ':') === 0 || (!O.kid && k === 'gf:house:v1') || (O.app === 'play' && k === 'gf:v1');      // 어른/아이 기록은 섞지 않는다(D12)
  O.makeCode = function () { const kv = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (mine(k)) kv[k] = localStorage.getItem(k); } const j = JSON.stringify({ a: O.app, t: O._now(), k: kv }); return 'GF1.' + b64e(j) + '.' + crc32(j); };
  /** 코드 검사: {ok, err, data}. err: 'bad'(형식·체크섬) | 'other'(다른 앱) */
  O.readCode = function (code) {
    try { const m = /^GF1\.([A-Za-z0-9_-]+)\.([0-9a-f]{8})$/.exec((code || '').trim()); if (!m) return { ok: false, err: 'bad' }; const j = b64d(m[1]); if (crc32(j) !== m[2]) return { ok: false, err: 'bad' }; const d = JSON.parse(j); if (!d || !d.k) return { ok: false, err: 'bad' }; if (d.a !== O.app) return { ok: false, err: 'other' }; return { ok: true, data: d }; } catch (e) { return { ok: false, err: 'bad' }; }
  };
  O.applyCode = function (code) { const r = O.readCode(code); if (!r.ok) return r; Object.keys(r.data.k).forEach((k) => { if (mine(k)) { try { localStorage.setItem(k, r.data.k[k]); } catch (e) {} } }); return r; };

  /* ---------------- 기기 바꾸기 저장 코드(C17): 이 기기의 앱 진행·집을 한 코드/파일로. 어른 기록과 아이 기록은 따로(D12). 서버 없음 · 검사 값(crc32) · 불러오기 전 기록 보관 ---------------- */
  const SKIP = /^gf:ads:|auth|:iap$|^gf:undo:|:ui:|^gfx:tip:/;
  const keyGroup = (k) => { if (!/^gfx?:/.test(k) || SKIP.test(k)) return null; return (k === 'gf:v1' || /^gf:play:/.test(k) || /^gf:house:kid:/.test(k) || /^gf:ip:kid:/.test(k)) ? 'kid' : 'adult'; };
  const myGroup = () => (O.kid ? 'kid' : 'adult');
  const dump = (g) => { const kv = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (keyGroup(k) === g) kv[k] = localStorage.getItem(k); } return kv; };
  const bytesB64 = (u8) => { let bin = ''; for (let i = 0; i < u8.length; i += 8192) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 8192)); return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const b64Bytes = (x) => { const bin = atob(x.replace(/-/g, '+').replace(/_/g, '/')), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i); return u8; };
  const pipe = async (u8, stream) => new Uint8Array(await new Response(new Blob([u8]).stream().pipeThrough(stream)).arrayBuffer());
  const canZ = () => typeof CompressionStream === 'function' && typeof DecompressionStream === 'function';
  const appsOf = (kv) => Object.keys(kv).reduce((a, k) => { const m = /^gf:([a-z]+):/.exec(k); const n = /^gf:house:|^gf:ip:/.test(k) ? 'house' : m && m[1]; if (n && !a.includes(n)) a.push(n); if (/^gfx:/.test(k) && !a.includes('exp')) a.push('exp'); if (k === 'gf:v1' && !a.includes('play')) a.push('play'); return a; }, []);
  /** 코드 만들기(비동기): 'GF2z.<압축>.<crc>'(압축 가능하면) 또는 'GF2.<본문>.<crc>' */
  O.makeAll = async function () {
    const g = myGroup(), kv = dump(g), j = JSON.stringify({ v: 2, g, t: O._now(), k: kv }), u8 = new TextEncoder().encode(j);
    if (canZ()) { try { return 'GF2z.' + bytesB64(await pipe(u8, new CompressionStream('deflate-raw'))) + '.' + crc32(j); } catch (e) { /* 압축 실패 → 본문 그대로 */ } }
    return 'GF2.' + b64e(j) + '.' + crc32(j);
  };
  /** 코드 검사(비동기): {ok, err, data, sum}. err: 'bad'(형식·체크섬) | 'group'(어른↔아이) | 'other'(GF1 다른 앱) */
  O.readAll = async function (code) {
    try {
      const c = (code || '').replace(/\s+/g, ''); if (/^GF1\./.test(c)) return O.readCode(c);
      const m = /^GF2(z?)\.([A-Za-z0-9_-]+)\.([0-9a-f]{8})$/.exec(c); if (!m) return { ok: false, err: 'bad' };
      let j; if (m[1]) { if (!canZ()) return { ok: false, err: 'bad' }; j = new TextDecoder().decode(await pipe(b64Bytes(m[2]), new DecompressionStream('deflate-raw'))); } else j = b64d(m[2]);
      if (crc32(j) !== m[3]) return { ok: false, err: 'bad' }; const d = JSON.parse(j); if (!d || d.v !== 2 || !d.k || (d.g !== 'adult' && d.g !== 'kid')) return { ok: false, err: 'bad' };
      if (Object.keys(d.k).some((k) => keyGroup(k) !== d.g)) return { ok: false, err: 'bad' };      // 본문 안에 다른 쪽 기록이 섞이면 거절
      if (d.g !== myGroup()) return { ok: false, err: 'group', data: d };
      return { ok: true, data: d, sum: { g: d.g, n: appsOf(d.k).length, k: Object.keys(d.k).length } };
    } catch (e) { return { ok: false, err: 'bad' }; }
  };
  O.applyAll = async function (code) {
    const r = await O.readAll(code); if (!r.ok) return r; if (!r.data.g) return O.applyCode(code);
    try { localStorage.setItem('gf:undo:' + r.data.g, JSON.stringify({ t: O._now(), k: dump(r.data.g) })); } catch (e) { /* 보관 실패해도 불러오기는 한다 */ }
    Object.keys(r.data.k).forEach((k) => { if (keyGroup(k) === r.data.g) { try { localStorage.setItem(k, r.data.k[k]); } catch (e) { /* 용량 */ } } }); return r;
  };
  O.undoApply = function () { try { const u = JSON.parse(localStorage.getItem('gf:undo:' + myGroup()) || 'null'); if (!u) return false; Object.keys(u.k).forEach((k) => { if (keyGroup(k) === myGroup()) localStorage.setItem(k, u.k[k]); }); return true; } catch (e) { return false; } };
  const tbtnL = (text, fn) => { const b = el('button', 'xt-btn', null, text); b.onclick = fn; return b; };
  O.openBackup = function () {
    const { body } = sheet(GF.t('ops.backup.title'));
    el('p', 'xt-p', body, GF.t('ops.backup.note'));
    const out = el('textarea', 'ops-code', body); out.readOnly = true; out.rows = 3; out.style.display = 'none'; let made = '';
    const cp = tbtnL(GF.t('ops.backup.copy'), () => { out.select(); try { navigator.clipboard.writeText(out.value); } catch (e) { try { document.execCommand('copy'); } catch (e2) {} } UK.toast(GF.t('ops.backup.copied'), safe()); }); cp.style.display = 'none';
    UK.btn({ text: GF.t('ops.backup.make'), cls: 'sky block', onclick: async () => { made = await O.makeAll(); out.value = made; out.style.display = 'block'; out.select(); cp.style.display = 'inline-flex'; fb.style.display = 'inline-flex'; } }, body); body.appendChild(cp);
    const fb = tbtnL(GF.t('ops.backup.file'), () => { try { const blob = new Blob([made], { type: 'text/plain' }), a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'gf_' + myGroup() + '_' + new Date(O._now()).toISOString().slice(0, 10) + '.gfsave'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); } catch (e) { /* 저장 실패 */ } }); fb.style.display = 'none'; body.appendChild(fb);
    el('h4', 'xt-h', body, GF.t('ops.backup.paste')); const inp = el('textarea', 'ops-code', body); inp.rows = 3; const msg = el('p', 'xt-p', body, ''); let armed = '';
    const pick = el('input', 'ops-file', body); pick.type = 'file'; pick.accept = '.gfsave,.txt,text/plain'; pick.style.display = 'none'; const pb = tbtnL(GF.t('ops.backup.pick'), () => pick.click()); body.appendChild(pb);
    pick.onchange = () => { const f0 = pick.files && pick.files[0]; if (!f0) return; const rd = new FileReader(); rd.onload = () => { inp.value = String(rd.result || '').trim(); armed = ''; msg.textContent = ''; }; rd.readAsText(f0); };
    UK.btn({ text: GF.t('ops.backup.load'), cls: 'ghost block', onclick: async () => { const r = await O.readAll(inp.value); if (!r.ok) { msg.textContent = GF.t('ops.backup.' + r.err); armed = ''; return; } if (armed !== inp.value) { armed = inp.value; msg.textContent = (r.sum ? GF.t('ops.backup.summary', { g: GF.t('ops.backup.g.' + r.sum.g), n: r.sum.n, k: r.sum.k }) + ' · ' : '') + GF.t('ops.backup.confirm'); return; } await O.applyAll(inp.value); msg.textContent = GF.t('ops.backup.ok'); setTimeout(() => location.reload(), 700); } }, body);
    if (localStorage.getItem('gf:undo:' + myGroup())) UK.btn({ text: GF.t('ops.backup.undo'), cls: 'ghost block', onclick: () => { if (O.undoApply()) { msg.textContent = GF.t('ops.backup.ok'); setTimeout(() => location.reload(), 700); } } }, body);
  };


  /* ---------------- 구매(H1): 성인 앱 「광고 제거」·「소품 팩」(확정 지급). 상품 ID 가 없으면 숨김, 유아 앱은 없음 ---------------- */
  const iapKey = () => 'gf:' + O.app + ':iap';
  O.iap = {
    native: () => (window.GFBilling && typeof window.GFBilling.info === 'function' ? window.GFBilling : null),
    info() { try { return JSON.parse(O.iap.native().info()) || {}; } catch (e) { return {}; } },
    configured(kind) { return !O.kid && !!O.iap.native() && !!(O.iap.info()[kind] || {}).configured; },
    price(kind) { return (O.iap.info()[kind] || {}).price || ''; },
    owned(kind) { return !!(LS(iapKey()) || {})[kind]; },
    buy(kind) { const n = O.iap.native(); if (n) { try { n.buy(kind); } catch (e) {} } },
    restore() { const n = O.iap.native(); if (n) { try { n.restore(); } catch (e) {} } },
  };
  const PACK_N = 5;
  function applyIap(kind, fresh) {
    const k = iapKey(), v = LS(k) || {}, had = !!v[kind]; v[kind] = 1; LS(k, v);
    if (kind === 'adfree') { if (GF.ads) { GF.ads.config.adFree = true; GF.ads.banner && GF.ads.banner(false); } if (fresh && !had) UK.toast(GF.t('ops.iap.thanks'), safe()); }
    if (kind === 'pack' && !had) { let n = 0; for (let i = 0; i < PACK_N; i++) { const it = nextGift(); if (it && Room.grant(it.id)) n++; } UK.toast(GF.t('ops.iap.packgot', { n }), safe()); }
  }
  window.GF_billEvent = (kind, ev) => {
    if (ev === 'owned' || ev === 'restored') applyIap(kind, ev === 'owned');
    else if (ev === 'pending') UK.toast(GF.t('ops.iap.pending'), safe());
    else if (ev === 'fail') UK.toast(GF.t('ops.iap.fail'), safe());
  };

  /* ---------------- 로컬 알림(H3): 성인 앱만·기본 꺼짐·하루 1회 이하·설정에서 켤 때만 권한 요청 ---------------- */
  O.notif = {
    native: () => (!O.kid && window.GFNotify && typeof window.GFNotify.available === 'function' && window.GFNotify.available() ? window.GFNotify : null),
    on: () => !!S().notif,
    set(on) { const n = O.notif.native(); if (!n) return; S().notif = on ? 1 : 0; if (GF.save) GF.save(); try { on ? n.enable() : n.disable(); } catch (e) {} },
  };
  window.GF_notifEvent = (ev) => { if (ev === 'denied') { S().notif = 0; if (GF.save) GF.save(); UK.toast(GF.t('ops.notif.denied'), safe()); } else if (ev === 'granted') UK.toast(GF.t('ops.notif.on'), safe()); };

  /* ---------------- 웹툰 보기(성인 전용): 블로그 주소(data/ops.json webtoonUrl, 비면 숨김). 유아 앱에는 없다 ---------------- */
  O.webtoonUrl = () => (!O.kid && O.d && O.d.webtoonUrl) || '';
  O.openWebtoon = function (path) { const u = O.webtoonUrl() + (path || ''); if (!O.webtoonUrl()) return; const n = O.native(); if (n && n.openUrl) { try { n.openUrl(u); } catch (e) {} } else { try { window.open(u, '_blank', 'noopener'); } catch (e) {} } };

  /* ---------------- 설정 줄(extras 가 부른다) ---------------- */
  O.rows = function (body, sc, kid) {
    const row = (label, node) => { const r = el('div', 'xt-row', body); el('span', '', r, label); if (node) r.appendChild(node); return r; };
    const tb = (text, fn) => { const b = el('button', 'xt-btn', null, text); b.onclick = fn; return b; };
    row(GF.t('ops.settings.motion'), UK.switch(O.motionOn(), (on) => { S().rm = on ? 1 : 0; if (GF.save) GF.save(); O.applyMotion(); }));
    if (!kid && O.d && O.d.news) row(GF.t('ops.settings.news'), tb(GF.t('common.view'), () => { sc.close(); O.openNews(); }));
    if (!kid) {
      row(GF.t('ops.settings.mis'), tb(GF.t('common.view'), () => { sc.close(); O.openMissions(); }));
      if (O.cfg && O.cfg.calendar) row(GF.t('ops.settings.cal'), tb(GF.t('common.view'), () => { sc.close(); O.openCalendar(); }));
      row(GF.t('ops.settings.album'), tb(GF.t('common.view'), () => { sc.close(); O.openAlbum(); }));
      row(GF.t('ops.settings.cameo'), tb(GF.t('common.view'), () => { sc.close(); O.openCameos(); }));
      row(GF.t('ops.settings.passport'), tb(GF.t('common.view'), () => { sc.close(); O.openPassport(); }));
    }
    if (kid && GP()) { row(GF.t('ops.settings.cameo'), tb(GF.t('common.view'), () => { sc.close(); O.openCameos(); })); row(GF.t('ops.settings.kidbook'), tb(GF.t('common.view'), () => { sc.close(); O.openPassport(); })); row(GF.t('ops.settings.cards'), tb(GF.t('common.view'), () => { sc.close(); O.openCards(); })); }
    if (GP()) row(GF.t('ops.settings.family'), tb(GF.t('common.view'), () => { sc.close(); O.openFamilyCode(); }));
    if (!kid && O.notif.native()) row(GF.t('ops.settings.notif'), UK.switch(O.notif.on(), (on) => { O.notif.set(on); }));
    if (!kid && (O.iap.configured('adfree') || O.iap.configured('pack'))) {
      if (O.iap.configured('adfree')) row(GF.t('ops.iap.adfree'), O.iap.owned('adfree') ? el('b', '', null, GF.t('ops.iap.owned')) : tb(O.iap.price('adfree') || GF.t('ops.iap.buy'), () => { sc.close(); O.iap.buy('adfree'); }));
      if (O.iap.configured('pack')) row(GF.t('ops.iap.pack'), O.iap.owned('pack') ? el('b', '', null, GF.t('ops.iap.owned')) : tb(O.iap.price('pack') || GF.t('ops.iap.buy'), () => { sc.close(); O.iap.buy('pack'); }));
      row(GF.t('ops.iap.restore'), tb(GF.t('common.view'), () => { O.iap.restore(); UK.toast(GF.t('ops.iap.restoring'), safe()); }));
    }
    if (!kid && O.webtoonUrl()) row(GF.t('ops.settings.webtoon'), tb(GF.t('common.view'), () => { sc.close(); O.openWebtoon(); }));
    row(GF.t('ops.settings.backup'), tb(GF.t('common.view'), () => { sc.close(); O.openBackup(); }));
    row(GF.t('ops.settings.help'), tb(GF.t('common.view'), () => { sc.close(); O.openHelp(); }));
    row(GF.t('ops.settings.report'), tb(GF.t('common.view'), () => { sc.close(); O.openReport(); }));
    if (GF.polish && GF.polish.ready) GF.polish.rows(body, sc);   // 앱 정보
  };

  O.init = function (cfg) {
    if (window.Room && Room.place && !Room._opsW) { const pl = Room.place; Room.place = function () { O.note('house'); return pl.apply(Room, arguments); }; Room._opsW = 1; }   // 집 소품 놓기 → 미션
    O.cfg = cfg; O.app = cfg.app; O.kid = !!cfg.kid; O.d = (GF.data && GF.data.ops) || null; O.ready = !!O.d; O.applyMotion();
    if (!O.ready) return;
    if (!O.kid && O.iap.owned('adfree') && GF.ads) GF.ads.config.adFree = true;   // 이미 산 「광고 제거」
    if (!O.kid) setTimeout(() => { try { if (O.iap.native()) O.iap.restore(); } catch (e) {} }, 2500);   // 재설치·기기 변경 복원(기기 안 조회)
    if (/[?&]ops=0/.test(location.search) || (navigator.webdriver && !/[?&]ops=1/.test(location.search))) { const s = st(); s.lastOpen = O._now(); put(s); return; }   // 자동 시험은 팝업을 띄우지 않는다(?ops=1 로 확인)
    if (O.kid) setTimeout(O.fridayGift, 3200); else { comeback(); newsAuto(); }
  };
})();
