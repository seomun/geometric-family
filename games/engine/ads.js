/* 광고 공용 브리지 GF.ads (games/16_ADS_RND.md). 지금은 「꺼진 상태」가 기본이라 사용자 화면은 바뀌지 않는다.
   · 네이티브(WebView 래퍼의 @JavascriptInterface `GFAds`)가 있으면 그것을 쓰고, 없으면 config.test 일 때만 JS 테스트 광고 팝업으로 흐름을 시험한다.
   · 보상형은 사용자가 버튼을 눌렀을 때만. 거절·실패·준비 안 됨은 어떤 불이익도 없다(onClose 만 호출).
   · 전면은 기본 꺼짐. 켠다면 상한 규칙(하루 6회·4판에 1회 이하·3분 간격·첫 10판 제외·광고 제거 구매자 0)을 이 모듈이 지킨다.
   · 유아 앱(data-uk=kid)에서는 어떤 설정이어도 항상 사용 불가. */
(function () {
  'use strict';
  const LS = (k, v) => { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} return null; };
  const today = () => { const d = new Date(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
  const A = (GF.ads = {
    config: { enabled: false, interstitial: false, test: true, adFree: false, dailyCap: 5, interstitialDaily: 6, interstitialEvery: 4, interstitialGapMs: 180000, interstitialFirst: 10 },
    PLACEMENTS: ['hint2', 'undo', 'undo3', 'extra', 'offline2x', 'daily2x', 'cardsticker'],   // 앱별 자리 이름(UI 노출은 광고를 켠 뒤)
    _cb: {}, _id: 0, _plays: 0, _lastInter: 0,
    isKid: () => (document.documentElement.getAttribute('data-uk') || 'kid') === 'kid',
    native: () => (window.GFAds && typeof window.GFAds.isReady === 'function' ? window.GFAds : null),
    _used: () => { const s = LS('gf:ads:daily') || {}; return s.d === today() ? s : { d: today(), r: 0, i: 0 }; },
    /** 지금 그 종류 광고를 보여 줄 수 있는가(버튼을 보일지 판단하는 데 쓴다) */
    available(kind) {
      const c = A.config; if (A.isKid() || !c.enabled) return false;
      const u = A._used();
      if (kind === 'rewarded') { if (u.r >= c.dailyCap) return false; return A.native() ? !!A.native().isReady('rewarded') : !!c.test; }
      if (kind === 'interstitial') { if (!c.interstitial || c.adFree || u.i >= c.interstitialDaily) return false; return A.native() ? !!A.native().isReady('interstitial') : !!c.test; }
      return false;
    },
    _show(kind, placement, done) {
      const id = ++A._id; A._cb[id] = done; const n = A.native();
      if (n) { try { n.show(kind, id, placement || ''); } catch (e) { A._event(id, 'fail'); } return; }
      // JS 테스트 광고(네이티브 없음): 흐름 시험용 팝업
      const m = UK.modal({ title: '테스트 광고', body: placement || '', actions: [{ text: '끝까지 보기', cls: 'green', onclick: () => A._event(id, 'reward') }, { text: '닫기', cls: 'ghost', onclick: () => A._event(id, 'close') }], dismiss: false });
      m.dataset.adtest = '1';
    },
    _event(id, ev) { const cb = A._cb[id]; if (!cb) return; delete A._cb[id]; cb(ev); },
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
    /** 판 하나가 끝났음을 알림(전면 노출 판단용) */
    noteLevelDone() { A._plays++; },
    /** 결과 화면을 닫은 직후에만 부른다. 상한 규칙 통과 시에만 보여 주고 onClose 로 이어 간다 */
    interstitial(o) {
      o = o || {}; const c = A.config, now = Date.now();
      const ok = A.available('interstitial') && A._plays > c.interstitialFirst && (A._plays % c.interstitialEvery === 0) && now - A._lastInter >= c.interstitialGapMs && !o.skip;
      if (!ok) { o.onClose && o.onClose(false); return false; }
      A._lastInter = now; const u = A._used(); u.i++; LS('gf:ads:daily', u);
      A._show('interstitial', o.placement, () => { o.onClose && o.onClose(true); }); return true;
    },
  });
  window.GF_adsEvent = (id, ev) => A._event(id, ev);   // 네이티브가 부른다: 'reward' | 'close' | 'fail'
})();
