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
  GF.t = (k, v) => { const s = (GF.data && GF.data.ops && GF.data.ops.strings) || {}; let t = s[k]; if (t == null) return k; if (v) t = t.replace(/\{(\w+)\}/g, (m, x) => (v[x] != null ? v[x] : m)); return t; };
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
    if (mail) { const b = UK.btn({ text: GF.t('ops.help.mail'), icon: 'next', cls: 'green block', onclick: () => { const n = O.native(); if (n && n.mail) { try { n.mail(mail, GF.t('ops.help.subject', { app: O.app, ver: (n.version && n.version()) || '' }), ''); } catch (e) {} } else { try { navigator.clipboard.writeText(mail); } catch (e) {} UK.toast(mail, safe()); } } }, w); void b; }
    else el('small', 'xt-note', w, GF.t('ops.help.nomail'));
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
  O.openMissions = function () {
    const { sc, body } = sheet(GF.t('ops.mis.title')), s = st(), m = misToday(s), list = O.missions();
    list.forEach((x) => { const r = el('div', 'ops-mis' + (x.got >= x.n ? ' ok' : ''), body); el('span', 'ic', r, x.icon); el('span', 'tx', r, GF.t('ops.mis.' + x.id, { n: x.n })); el('b', '', r, x.got >= x.n ? '✔' : x.got + '/' + x.n); });
    const all = list.every((x) => x.got >= x.n);
    if (all && !m.gift) { UK.btn({ text: GF.t('ops.mis.gift'), cls: 'gold block', onclick: () => { const s2 = st(), m2 = misToday(s2); if (m2.gift) return; const it = nextGift(); m2.gift = 1; put(s2); let got = null; if (it && Room.grant(it.id)) got = it; sc.close(); UK.toast(got ? GF.t('ops.mis.got', { name: got.name }) : GF.t('ops.mis.none'), safe()); GF.sfx('celebrate'); } }, body); }
    else if (m.gift) el('p', 'xt-p', body, GF.t('ops.mis.gifted'));
    el('p', 'xt-p', body, GF.t('ops.mis.note'));
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
    const cards = cardsDone();
    if (cards.length) {
      const got = cards.filter((x) => x.got).length, earned = Math.floor(got / 3), claimed = s.albumClaimed || 0; sec(GF.t('ops.album.cards') + ' ' + got + '/' + cards.length); const g = el('div', 'ops-chips', body); cards.forEach((x) => el('span', x.got ? 'on' : '', g, x.got ? x.title : '🔒'));
      if (earned > claimed) UK.btn({ text: GF.t('ops.album.claim'), cls: 'gold block', onclick: () => { const s2 = st(), it = nextGift(); s2.albumClaimed = (s2.albumClaimed || 0) + 1; put(s2); let ok = null; if (it && Room.grant(it.id)) ok = it; sc.close(); UK.toast(ok ? GF.t('ops.mis.got', { name: ok.name }) : GF.t('ops.mis.none'), safe()); GF.sfx('celebrate'); } }, body);
      else el('p', 'xt-p', body, GF.t('ops.album.next', { n: 3 - (got % 3) }));
    }
    const ev = (c.calendar && c.calendar()) || []; if (ev.length) sec(GF.t('ops.album.season') + ' ' + ev.filter((e) => e.done).length + '/' + ev.length);
  };

  /* ---------------- 백업 코드(H2): 기기 안에서 내보내기·가져오기, 체크섬. 서버 없음 ---------------- */
  const crc32 = (str) => { let c, crc = 0xFFFFFFFF; for (let i = 0; i < str.length; i++) { c = (crc ^ str.charCodeAt(i)) & 0xFF; for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xEDB88320 : c >>> 1; crc = (crc >>> 8) ^ c; } return ((crc ^ 0xFFFFFFFF) >>> 0).toString(16).padStart(8, '0'); };
  const b64e = (x) => btoa(unescape(encodeURIComponent(x))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''), b64d = (x) => decodeURIComponent(escape(atob(x.replace(/-/g, '+').replace(/_/g, '/'))));
  const mine = (k) => k.indexOf('gf:' + O.app + ':') === 0 || k.indexOf('gf:house:') === 0 || (O.app === 'play' && k === 'gf:v1');
  O.makeCode = function () { const kv = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (mine(k)) kv[k] = localStorage.getItem(k); } const j = JSON.stringify({ a: O.app, t: O._now(), k: kv }); return 'GF1.' + b64e(j) + '.' + crc32(j); };
  /** 코드 검사: {ok, err, data}. err: 'bad'(형식·체크섬) | 'other'(다른 앱) */
  O.readCode = function (code) {
    try { const m = /^GF1\.([A-Za-z0-9_-]+)\.([0-9a-f]{8})$/.exec((code || '').trim()); if (!m) return { ok: false, err: 'bad' }; const j = b64d(m[1]); if (crc32(j) !== m[2]) return { ok: false, err: 'bad' }; const d = JSON.parse(j); if (!d || !d.k) return { ok: false, err: 'bad' }; if (d.a !== O.app) return { ok: false, err: 'other' }; return { ok: true, data: d }; } catch (e) { return { ok: false, err: 'bad' }; }
  };
  O.applyCode = function (code) { const r = O.readCode(code); if (!r.ok) return r; Object.keys(r.data.k).forEach((k) => { if (mine(k)) { try { localStorage.setItem(k, r.data.k[k]); } catch (e) {} } }); return r; };
  const tbtnL = (text, fn) => { const b = el('button', 'xt-btn', null, text); b.onclick = fn; return b; };
  O.openBackup = function () {
    const { body } = sheet(GF.t('ops.backup.title'));
    el('p', 'xt-p', body, GF.t('ops.backup.note'));
    const out = el('textarea', 'ops-code', body); out.readOnly = true; out.rows = 3; out.style.display = 'none';
    const cp = tbtnL(GF.t('ops.backup.copy'), () => { out.select(); try { navigator.clipboard.writeText(out.value); } catch (e) { try { document.execCommand('copy'); } catch (e2) {} } UK.toast(GF.t('ops.backup.copied'), safe()); }); cp.style.display = 'none';
    UK.btn({ text: GF.t('ops.backup.make'), cls: 'sky block', onclick: () => { out.value = O.makeCode(); out.style.display = 'block'; out.select(); cp.style.display = 'inline-flex'; } }, body); body.appendChild(cp);
    el('h4', 'xt-h', body, GF.t('ops.backup.paste')); const inp = el('textarea', 'ops-code', body); inp.rows = 3; const msg = el('p', 'xt-p', body, ''); let armed = false;
    UK.btn({ text: GF.t('ops.backup.load'), cls: 'ghost block', onclick: () => { const r = O.readCode(inp.value); if (!r.ok) { msg.textContent = GF.t('ops.backup.' + r.err); armed = false; return; } if (!armed) { armed = true; msg.textContent = GF.t('ops.backup.confirm'); return; } O.applyCode(inp.value); msg.textContent = GF.t('ops.backup.ok'); setTimeout(() => location.reload(), 700); } }, body);
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
    }
    if (!kid && O.notif.native()) row(GF.t('ops.settings.notif'), UK.switch(O.notif.on(), (on) => { O.notif.set(on); }));
    if (!kid && (O.iap.configured('adfree') || O.iap.configured('pack'))) {
      if (O.iap.configured('adfree')) row(GF.t('ops.iap.adfree'), O.iap.owned('adfree') ? el('b', '', null, GF.t('ops.iap.owned')) : tb(O.iap.price('adfree') || GF.t('ops.iap.buy'), () => { sc.close(); O.iap.buy('adfree'); }));
      if (O.iap.configured('pack')) row(GF.t('ops.iap.pack'), O.iap.owned('pack') ? el('b', '', null, GF.t('ops.iap.owned')) : tb(O.iap.price('pack') || GF.t('ops.iap.buy'), () => { sc.close(); O.iap.buy('pack'); }));
      row(GF.t('ops.iap.restore'), tb(GF.t('common.view'), () => { O.iap.restore(); UK.toast(GF.t('ops.iap.restoring'), safe()); }));
    }
    row(GF.t('ops.settings.backup'), tb(GF.t('common.view'), () => { sc.close(); O.openBackup(); }));
    row(GF.t('ops.settings.help'), tb(GF.t('common.view'), () => { sc.close(); O.openHelp(); }));
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
