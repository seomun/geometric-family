/* 완성도 공통 층 GF.polish (games/23_POLISH_CHECKLIST.md). B1: 앱 정보 · 초기화 확인 창 · 첫 실행 글자 크기·안내(자동 저장·오프라인) · 저장 손상 복구 · 홈 뒤로가기 종료 확인.
   문자열은 전부 GF.t 표(data/ops.json). 유아 앱은 글자 없는 놀이 원칙 — 안내·선택 창은 성인 앱에서만, 유아는 보호자 메뉴(구구단 뒤)의 「앱 정보」·초기화 확인만. */
(function () {
  'use strict';
  const el = UK.el, P = (GF.polish = { ready: false, app: null, kid: false });
  const LS = (k, v) => { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} return null; };
  const safe = () => document.getElementById('safe');
  const key = () => 'gf:' + P.app + ':pol', st = () => Object.assign({ fsAsked: 0, noticed: 0 }, LS(key()) || {}), put = (s) => LS(key(), s);
  const busy = () => !!document.querySelector('.tale-ov, .uk-scrim, #xt-rest');

  /* ---------------- 앱 정보 ---------------- */
  P.version = () => { try { const n = window.GFOps && GFOps.version && GFOps.version(); if (n) return n; } catch (e) {} return (GF.data && GF.data.ops && GF.data.ops.news && GF.data.ops.news.version) || ''; };
  P.about = function () {
    const sc = UK.modal({ title: GF.t('polish.about.title'), dismiss: true, parent: safe() }), sh = sc.querySelector('.uk-sheet'); sh.classList.add('xt-sheet');
    const body = el('div', 'xt-body', sh), D = (GF.data && GF.data.ops) || {};
    const row = (a, b) => { const r = el('div', 'xt-row', body); el('span', '', r, a); el('b', '', r, b); };
    row(GF.t('polish.about.version'), P.version() || '-');
    el('h4', 'xt-h', body, GF.t('polish.about.credits')); (D.credits || []).forEach((c) => el('p', 'pol-cr', body, c));
    el('h4', 'xt-h', body, GF.t('polish.about.privacy')); el('p', 'pol-cr', body, GF.t(P.kid ? 'polish.privacy.kid' : 'polish.privacy.adult'));
    if (D.privacyUrl && !P.kid) el('p', 'pol-cr', body, D.privacyUrl);
    const a = el('div', 'acts row', sh); UK.btn({ text: GF.t('common.close'), cls: 'ghost', onclick: () => sc.close() }, a); return sc;
  };

  /* ---------------- 초기화 확인 창(확인 대화상자) ---------------- */
  P.confirmWipe = function (doIt) {
    UK.modal({ parent: safe(), title: GF.t('polish.wipe.title'), body: GF.t('polish.wipe.body'), actions: [{ text: GF.t('polish.cancel'), cls: 'ghost', onclick: () => {} }, { text: GF.t('polish.wipe.do'), cls: 'danger', onclick: () => { doIt(); } }] });
  };

  /* ---------------- 첫 실행(성인): 글자 크기 → 자동 저장·오프라인 안내 ---------------- */
  function sizeChoice(next) {
    const sc = UK.modal({ parent: safe(), title: GF.t('polish.fs.title'), body: GF.t('polish.fs.body'), actions: [
      { text: GF.t('polish.fs.normal'), cls: 'green', onclick: () => { GF.state.settings.big = 0; GF.save && GF.save(); GF.extras && GF.extras.applyBig && GF.extras.applyBig(); next(); } },
      { text: GF.t('polish.fs.big'), cls: 'sky', onclick: () => { GF.state.settings.big = 1; GF.save && GF.save(); GF.extras && GF.extras.applyBig && GF.extras.applyBig(); next(); } }] });
    const bs = sc.querySelectorAll('.acts .uk-btn'); if (bs[1]) bs[1].style.fontSize = '1.25em';   // 「크게」는 실제로 크게 보여 준다
  }
  function notices() {
    if (busy()) { setTimeout(notices, 2500); return; }
    UK.toast(GF.t('polish.autosave'), safe()); setTimeout(() => { if (!busy()) UK.toast(GF.t('polish.offline'), safe()); }, 3800);
  }
  P.firstRun = function () {
    if (P.kid) return; const s = st();
    const go = () => { if (busy()) { setTimeout(go, 2500); return; } if (!s.fsAsked) { s.fsAsked = 1; put(s); sizeChoice(() => { const s2 = st(); s2.noticed = 1; put(s2); setTimeout(notices, 800); }); } else if (!s.noticed) { s.noticed = 1; put(s); notices(); } };
    if (!s.fsAsked || !s.noticed) setTimeout(go, 5200);
  };

  /* ---------------- 저장 손상 복구: 읽을 수 없는 저장은 :broken 키에 보관하고 새로 시작 ---------------- */
  P.checkSaves = function () {
    const pre = P.app === 'play' ? 'gf:v1' : 'gf:' + P.app + ':', bad = [];
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (!k || k.indexOf(pre) !== 0 || /:(broken|ops|pol|tale|saga|x|rank|iap|resume)$/.test(k)) continue; try { const v = localStorage.getItem(k); if (v && /^[\[{]/.test(v)) JSON.parse(v); } catch (e) { bad.push(k); } }
    bad.forEach((k) => { try { localStorage.setItem(k + ':broken', localStorage.getItem(k)); localStorage.removeItem(k); } catch (e) {} });
    if (bad.length && !P.kid) setTimeout(() => UK.toast(GF.t('polish.broken'), safe()), 1500);
    return bad;
  };


  /* ---------------- 일시정지 메뉴: 판 중 ‹ → 계속/다시/지도로 (첫 조작 전·판이 끝난 뒤에는 메뉴 없이 바로 나감) ---------------- */
  let touched = false, fin = false;
  P.pause = function (r, again) {
    touched = false; fin = false; const arm = () => { touched = true; r.removeEventListener('pointerup', arm, true); }; r.addEventListener('pointerup', arm, true);
    GF.backHook = function () {
      if (!touched || fin || document.querySelector('.uk-scrim')) return false;
      const kid = P.kid, leave = () => { GF.backHook = null; GF.back(); };
      UK.modal({ parent: safe(), title: kid ? '' : GF.t('polish.pause.title'), big: '⏸️', body: '', actions: [
        { text: kid ? '' : GF.t('polish.pause.resume'), icon: 'play', cls: 'green', onclick: () => {} },
        { text: kid ? '' : GF.t('polish.pause.again'), icon: 'replay', cls: 'ghost', onclick: () => { GF.backHook = null; again && again(); } },
        { text: kid ? '' : GF.t('polish.pause.map'), icon: 'home', cls: 'ghost', onclick: leave }] });
      document.querySelectorAll('.uk-scrim:last-of-type .acts .uk-btn').forEach((b, i) => b.setAttribute('aria-label', ['resume', 'again', 'map'][i]));
      return true;
    };
  };
  P.finished = function () { fin = true; };
  /* ---------------- 쉬운 모드(성인): 되돌리기·섞기 한도 해제 + 별 기준 한 칸 완화. 오늘의 한 판·시즌 등(kind 있는 판)에는 적용하지 않아 순위가 공정하다 ---------------- */
  P.assist = () => !!(GF.state && GF.state.settings && GF.state.settings.assist);
  P.cap = (n, LV) => (P.assist() && !(LV && LV.kind) ? 99 : n);
  P.easy = (st, LV) => (P.assist() && !(LV && LV.kind) ? Math.min(3, st + 1) : st);
  /** 판 헤더 옆 별 목표 칩(성인) */
  P.goal = function (r, text) { if (P.kid || !text) return; const g = el('div', 'pol-goal', r, text + (P.assist() ? GF.t('polish.assist.chip') : '')); return g; };
  /** 결과 화면 「다음 목표」 한 줄: 다음 판의 장·판 종류, 장 끝이면 이야기 안내 */
  let nextTxt = '';
  P.setNext = (t) => { nextTxt = t || ''; };
  P.takeNext = () => { const t = nextTxt; nextTxt = ''; return t; };
  P.nextText = function (LV, D) {
    if (!LV || LV.kind || !D || !D.levels) return ''; const nx = D.levels.find((l) => l.id === LV.id + 1); if (!nx) return '';
    if (nx.chapter !== LV.chapter) return GF.t('polish.next.story');
    const nm = (D.types && D.types[nx.type]) || ''; const first = !D.levels.some((l) => l.id <= LV.id && l.type === nx.type);
    return GF.t('polish.next', { c: nx.chapter, title: (D.chapters && D.chapters[nx.chapter - 1]) || '' }) + (first && nm ? GF.t('polish.next.type', { type: nm }) : '');
  };

  /* ---------------- 실패 직후 「한 번 더」 동기(C2): 아깝다 한마디 · 근접 표시 · 힌트 제안 · 쉬운 모드 안내 ---------------- */
  // 같은 판에서 연속으로 지면 단계가 오른다: 1번 = 근접 표시 + 바로 다시(2.2초) · 2번 = 힌트 안내 · 3번 이상 = 쉬운 모드 제안(고르기 전엔 자동으로 넘어가지 않음). 벌·광고 없음.
  const FAILS = {};
  P.failReset = (app, id) => { delete FAILS[app + ':' + id]; };
  P.failCount = (app, id) => FAILS[app + ':' + id] || 0;
  /** o: {app, id, near:'목표까지 3줄', hint:true(힌트 버튼이 있음), onRetry} */
  P.failCard = function (parent, o) {
    const again = () => { try { o.onRetry && o.onRetry(); } catch (e) { /* 다시 하기 실패는 무시 */ } };
    if (P.kid || !parent || !window.UK) { setTimeout(again, o.ms || 900); return null; }
    document.querySelectorAll('.uk-finger').forEach((e) => e.remove());      // 튜토리얼 손가락이 카드 글자를 덮지 않게
    const key = o.app + ':' + (o.id == null ? '' : o.id), n = (FAILS[key] = (FAILS[key] || 0) + 1), easyOffer = n >= 3 && !P.assist();
    const lines = []; if (o.near) lines.push('<b>' + o.near + '</b>'); lines.push(n === 1 ? '조금만 더 하면 돼요!' : n === 2 ? (o.hint ? '막히면 💡 힌트를 눌러 보세요.' : '천천히 해도 괜찮아요.') : '여러 번 해 봤네요! 쉬운 모드는 되돌리기·섞기가 무제한이에요.');
    let done = false; const go = () => { if (done) return; done = true; sc.close ? sc.close() : sc.remove(); again(); };
    const acts = [{ text: '한 번 더', cls: 'green', icon: 'replay', onclick: go }];
    if (easyOffer) acts.push({ text: '쉬운 모드로 한 번 더', cls: 'sky', onclick: () => { GF.state.settings.assist = 1; GF.save && GF.save(); GF.sfx && GF.sfx('ok'); go(); } });
    const sc = UK.modal({ title: '아깝다!', body: lines.join('<br>'), actions: acts, parent, dismiss: false }); GF.sfx && GF.sfx('hmm');
    sc.classList.add('pol-fail');      // 카드는 아래쪽에 — 멈춘 판(위)을 보면서 「목표까지 N줄」을 듣는다
    if (!easyOffer && n < 3) { const bar = el('div', 'pol-failbar', sc.querySelector('.uk-sheet') || sc); bar.innerHTML = '<i></i>'; setTimeout(go, 2300); }
    return sc;
  };

  /* ---------------- 설정 줄(ops.rows 가 부른다) ---------------- */
  P.rows = function (body, sc) {
    if (!P.kid) { const ra = el('div', 'xt-row', body); el('span', '', ra, GF.t('polish.settings.assist')); ra.appendChild(UK.switch(P.assist(), (on) => { GF.state.settings.assist = on ? 1 : 0; GF.save && GF.save(); })); el('small', 'xt-note', body, GF.t('polish.assist.note')); }
    const r = el('div', 'xt-row', body); el('span', '', r, GF.t('polish.settings.about')); const b = el('button', 'xt-btn', r, GF.t('common.view')); b.onclick = () => { sc.close(); P.about(); };
  };

  P.init = function (cfg) { P.app = cfg.app; P.kid = !!cfg.kid; P.ready = true; P.checkSaves(); if (!(navigator.webdriver && !/[?&]ops=1/.test(location.search))) P.firstRun(); };
})();
