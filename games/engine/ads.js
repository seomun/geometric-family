/* 광고 공용 브리지 GF.ads (games/16_ADS_RND.md, 허브 결정 D19 — D15 의 「광고 없음」을 대체).
   · 네이티브(WebView 래퍼의 @JavascriptInterface `GFAds` = AdsBridge.java, Google Mobile Ads SDK)가 있을 때만 실제 광고가 나간다. 웹판(play/)·브라우저·자동 시험은 네이티브가 없어 항상 no-op(?ads=1 은 JS 테스트 광고로 흐름 시험).
   · 성인 7앱: 보상형(사용자가 누른 자리) + 전면(판 결과를 닫은 직후, 상한 규칙) + 배너(홈·이야기 지도 하단만).
   · 유아 3앱(data-uk=kid): 배너만(홈·지도). 전면·보상형은 어떤 경우에도 없다. 아동 대상 처리·비개인화는 네이티브가 한다.
   · 전면 규칙: 처음 5판 없음 · 앱을 연 뒤 3분 없음 · 3판에 1회 이하 · 직전 광고와 2분30초 이상 · 하루 8회 · 사연 컷/오늘의 한 판/시즌/끝없이/실패 직후 금지 · 건너뛰기 가능한 형식만(SDK 전면=닫기 가능). 판 화면·사연 화면에는 배너 금지. */
(function () {
  'use strict';
  const LS = (k, v) => { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} return null; };
  const today = () => { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
  const A = (GF.ads = {
    config: { enabled: true, interstitial: true, banner: true, test: /[?&]ads=1/.test(location.search), adFree: false, dailyCap: 5, interstitialDaily: 8, interstitialEvery: 3, interstitialGapMs: 150000, interstitialFirst: 5, interstitialWarmMs: 180000 },
    PLACEMENTS: ['hint2', 'undo', 'undo3', 'extra', 'offline2x', 'daily2x', 'cardsticker'],   // 앱별 자리 이름(UI 노출은 광고를 켠 뒤)
    _cb: {}, _id: 0, _t0: Date.now(), _ctx: null,
    /** 실제 광고(네이티브)나 시험 광고(?ads=1)가 가능한 환경인가. 웹판·브라우저·자동 시험은 false */
    live() { return !!(A.config.enabled && (A.native() || A.config.test)); },
    isKid: () => (document.documentElement.getAttribute('data-uk') || 'kid') === 'kid',
    native: () => (window.GFAds && typeof window.GFAds.isReady === 'function' ? window.GFAds : null),
    _used: () => { const s = LS('gf:ads:daily') || {}; return s.d === today() ? s : { d: today(), r: 0, i: 0 }; },
    /** 지금 그 종류 광고를 보여 줄 수 있는가(버튼을 보일지 판단하는 데 쓴다) */
    available(kind) {
      const c = A.config; if (A.isKid() || !A.live()) return false;
      const u = A._used();
      if (kind === 'rewarded') { if (u.r >= c.dailyCap) return false; return A.native() ? !!A.native().isReady('rewarded') : !!c.test; }
      if (kind === 'interstitial') return !!c.interstitial && (A.native() ? !!A.native().isReady('interstitial') : !!c.test);
      return false;
    },
    _show(kind, placement, done) {
      const id = ++A._id; A._cb[id] = done; const n = A.native();
      if (n) { try { n.show(kind, id, placement || ''); } catch (e) { A._event(id, 'fail'); } return; }
      // JS 테스트 광고(네이티브 없음): 흐름 시험용 팝업
      const m = UK.modal({ parent: document.getElementById('safe'), title: '테스트 광고', body: '실제 광고가 나올 자리예요(개발용)', actions: [{ text: '끝까지 보기', cls: 'green', onclick: () => A._event(id, 'reward') }, { text: '닫기', cls: 'ghost', onclick: () => A._event(id, 'close') }], dismiss: false });
      m.dataset.adtest = '1';
    },
    _event(id, ev) { const cb = A._cb[id]; if (!cb) return; delete A._cb[id]; cb(ev); },
    /** 광고 자리를 보여 줘도 되는가: 켜짐·성인 앱·하루 한도 이내(광고 제거 구매자는 한도 없음) */
    eligible() { const c = A.config; if (A.isKid() || !A.live()) return false; return c.adFree || A._used().r < c.dailyCap; },
    /** 「광고 보고 …」 한 번 실행: 광고 제거 구매자는 바로 지급 · 광고가 준비됐으면 보여 주고 · 불러오지 못하면 보상을 그냥 지급(불이익 0) */
    run(o) {
      o = o || {}; const c = A.config; if (!A.eligible()) return false;
      if (c.adFree) { o.onReward && o.onReward(); o.onClose && o.onClose(true); return true; }
      const ready = A.native() ? !!A.native().isReady('rewarded') : !!c.test;
      if (ready) return A.rewarded(o);
      o.onReward && o.onReward(); o.onClose && o.onClose(true); try { UK.toast('광고를 불러오지 못해 그냥 드렸어요', document.getElementById('safe')); } catch (e) {} return true;
    },
    /** 사용자가 이미 한도를 다 쓴 버튼을 눌렀을 때: 「광고 보고 …」 를 정직하게 묻는 작은 팝업. 거절해도 아무 일 없음. 꺼짐·유아·한도 초과면 false(앱이 원래 안내를 보여 준다) */
    offer(o) {
      o = o || {}; if (!A.eligible()) return false;
      UK.modal({ title: '광고 보고 ' + (o.ask || '더 받기'), body: '광고를 끝까지 보면 받아요. 안 봐도 괜찮아요.', actions: [{ text: '광고 보기', cls: 'green', onclick: () => A.run(o) }, { text: '괜찮아요', cls: 'ghost' }], dismiss: true, parent: o.parent || document.getElementById('safe') });
      return true;
    },
    /** 보상형: 끝까지 보면 onReward(), 어떤 경우든 마지막에 onClose(rewarded:boolean) */
    rewarded(o) {
      o = o || {}; if (!A.available('rewarded')) { o.onClose && o.onClose(false); return false; }
      A._show('rewarded', o.placement, (ev) => {
        const ok = ev === 'reward'; if (ok) { const u = A._used(); u.r++; LS('gf:ads:daily', u); o.onReward && o.onReward(); }
        o.onClose && o.onClose(ok);
      }); return true;
    },
    /** 「광고 보고 받기」 한 줄 도우미: 광고 제거 구매자는 바로 지급, 광고를 못 보여 주면 보상을 그냥 지급하지 않고 false */
    reward(placement, grant) {
      const c = A.config; if (A.isKid()) return false;
      if (c.adFree) { grant(); return true; }
      return A.rewarded({ placement, onReward: grant });
    },
    /** 판 하나를 깼음을 알림(전면 노출 판단용). LV 는 그 판(kind 가 있으면 오늘의 한 판·시즌·끝없이·세 가족 판 — 그 직후엔 전면 금지) */
    noteLevelDone(LV) { const st = LS('gf:ads:state') || {}; st.plays = (st.plays || 0) + 1; LS('gf:ads:state', st); A._ctx = { kind: LV && LV.kind ? LV.kind : null, story: false }; },
    /** 사연·승전결 컷이 방금 나갔음(그 직후 결과 화면 닫기에는 전면 금지) */
    noteStory() { if (A._ctx) A._ctx.story = true; },
    _interOk() {
      const c = A.config, now = Date.now(), st = LS('gf:ads:state') || {}, ctx = A._ctx || {}, u = A._used();
      if (!A.available('interstitial')) return false;
      if (ctx.kind || ctx.story) return false;                                  // 오늘의 한 판·시즌·끝없이·사연 컷 직후
      if ((st.plays || 0) <= c.interstitialFirst) return false;                 // 처음 5판
      if (now - A._t0 < c.interstitialWarmMs) return false;                     // 앱을 연 뒤 3분
      if ((st.plays || 0) - (st.lastPlays || 0) < c.interstitialEvery) return false;   // 3판에 1회 이하
      if (now - (st.lastAt || 0) < c.interstitialGapMs) return false;           // 직전 광고와 2분 30초
      if ((u.i || 0) >= c.interstitialDaily) return false;                      // 하루 8회
      return true;
    },
    /** 결과 화면을 닫은 직후에만 부른다. 상한 규칙 통과 시에만 보여 주고 onClose 로 이어 간다(끝나거나 못 보여 주면 항상 onClose) */
    interstitial(o) {
      o = o || {}; if (!A._interOk()) { o.onClose && o.onClose(false); return false; }
      const st = LS('gf:ads:state') || {}; st.lastAt = Date.now(); st.lastPlays = st.plays || 0; LS('gf:ads:state', st); const u = A._used(); u.i = (u.i || 0) + 1; LS('gf:ads:daily', u);
      A._ctx = null; A._show('interstitial', o.placement, () => { o.onClose && o.onClose(true); }); return true;
    },
    /* ---- 배너: 홈·이야기 지도 화면 하단에만. 판·사연·보호자 메뉴·집 화면에는 없다 ---- */
    BANNER_SCREENS: /^(home|map|shelf|itable|chome|cbook|qhome|qtests|mhome|mlevels|phome|plevels|bhome|blevels|shome|slevels|thome|tlevels|dhome|dmap)$/,
    _banner: false,
    banner(on) {
      on = !!on && A.config.banner && A.live(); if (on === A._banner) return; A._banner = on;
      const n = A.native(); if (n && typeof n.banner === 'function') { try { n.banner(on); } catch (e) {} return; }
      let d = document.getElementById('gf-adbanner');   // JS 시험 배너(?ads=1)
      if (on && !d) { d = document.createElement('div'); d.id = 'gf-adbanner'; d.textContent = '배너 광고 자리(테스트)'; d.style.cssText = 'position:fixed;left:0;right:0;bottom:0;height:50px;background:#ddd;color:#555;font:12px sans-serif;text-align:center;line-height:50px;z-index:5;pointer-events:none'; document.body.appendChild(d); }
      if (d) d.style.display = on ? 'block' : 'none';
    },
  });
  /** 화면이 바뀔 때마다 엔진이 부른다(gf.js show) */
  GF.onScreen = (name) => { try { A.banner(A.BANNER_SCREENS.test(name)); } catch (e) {} };
  /** 결과 화면에 「광고 보고 …」 한 줄을 끼운다: 앱이 UK.result 를 부르기 직전에 GF.ads.resultHook = {placement, ask, onReward} 를 지정 */
  A.resultHook = null;
  const _result = UK.result;
  UK.result = function (o) {
    if (o && !A.isKid() && A.live()) ['onNext', 'onHome', 'onRetry'].forEach((k) => { const f = o[k]; if (typeof f === 'function') o[k] = function () { A.interstitial({ placement: 'result', onClose: () => f.apply(this, arguments) }); }; });   // 결과를 닫은 직후에만
    const sc = _result.call(UK, o), h = A.resultHook; A.resultHook = null;
    try {
      if (h && sc && A.eligible()) { const acts = sc.querySelector('.acts'); if (acts) { const b = UK.btn({ text: '광고 보고 ' + h.ask, icon: 'gift', cls: 'gold', onclick: () => A.run({ placement: h.placement, onReward: () => { h.onReward(); b.disabled = true; b.lastChild.textContent = '받았어요'; } }) }, acts); if (h.sub) { const sm = document.createElement('small'); sm.textContent = h.sub; b.appendChild(sm); b.style.flexDirection = 'column'; b.style.gap = '2px'; } acts.insertBefore(b, acts.firstChild); } }
    } catch (e) {}
    return sc;
  };
  window.GF_adsEvent = (id, ev) => A._event(id, ev);   // 네이티브가 부른다: 'reward' | 'close' | 'fail'
})();
