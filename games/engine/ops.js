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

  /* ---------------- 설정 줄(extras 가 부른다) ---------------- */
  O.rows = function (body, sc, kid) {
    const row = (label, node) => { const r = el('div', 'xt-row', body); el('span', '', r, label); if (node) r.appendChild(node); return r; };
    const tb = (text, fn) => { const b = el('button', 'xt-btn', null, text); b.onclick = fn; return b; };
    row(GF.t('ops.settings.motion'), UK.switch(O.motionOn(), (on) => { S().rm = on ? 1 : 0; if (GF.save) GF.save(); O.applyMotion(); }));
    if (!kid && O.d && O.d.news) row(GF.t('ops.settings.news'), tb(GF.t('common.view'), () => { sc.close(); O.openNews(); }));
    row(GF.t('ops.settings.help'), tb(GF.t('common.view'), () => { sc.close(); O.openHelp(); }));
  };

  O.init = function (cfg) {
    O.cfg = cfg; O.app = cfg.app; O.kid = !!cfg.kid; O.d = (GF.data && GF.data.ops) || null; O.ready = !!O.d; O.applyMotion();
    if (!O.ready) return;
    if (/[?&]ops=0/.test(location.search) || (navigator.webdriver && !/[?&]ops=1/.test(location.search))) { const s = st(); s.lastOpen = O._now(); put(s); return; }   // 자동 시험은 팝업을 띄우지 않는다(?ops=1 로 확인)
    if (O.kid) setTimeout(O.fridayGift, 3200); else { comeback(); newsAuto(); }
  };
})();
