/* Google Play 게임즈 순위표 브리지 GF.board (games/17_LEADERBOARD.md). 지금은 꺼짐(no-op): 실제 연결(PGS v2·로그인·Data safety·방침)은 작가가 Play Console 계정을 만든 뒤.
   · 웹/갤럭시 판/유아 앱에서는 항상 no-op. Play 판 flavor 의 래퍼가 window.GFBoard(@JavascriptInterface)를 노출하고 config.enabled=true 일 때만 동작.
   · 쓰는 곳: ⑦ 끝없이 · 오늘의 한 판 점수만(GF.rank.record 가 submit 을 부른다). show 는 구글 순위표 화면. */
(function () {
  'use strict';
  const B = (GF.board = {
    config: { enabled: false },
    ids: {},   // { 'sort:daily': 'CgkI…' } — 앱·보드별 Play Console 순위표 ID(작가가 만든 뒤 채움)
    isKid: () => (document.documentElement.getAttribute('data-uk') || 'kid') === 'kid',
    available() { return !!(B.config.enabled && !B.isKid() && window.GFBoard && typeof window.GFBoard.submit === 'function'); },
    submit(id, score) { if (!B.available()) return false; try { window.GFBoard.submit(B.ids[(GF.rank && GF.rank.cfg ? GF.rank.cfg.app : '') + ':' + id] || id, Math.round(score)); return true; } catch (e) { return false; } },
    show(id) { if (!B.available()) return false; try { window.GFBoard.show(B.ids[(GF.rank && GF.rank.cfg ? GF.rank.cfg.app : '') + ':' + id] || id); return true; } catch (e) { return false; } },
  });
})();
