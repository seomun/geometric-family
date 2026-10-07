/* 당신은 어느 도형? — 결과 계산(브라우저·node 공용). 가장 많이 고른 가족이 결과, 그 가족 안에서 가장 많이 고른 세부 타입이 세부 타입.
   동점이면 답 순서·세부 값으로 만든 시드로 한쪽을 고른다(항상 같은 가족이 이기지 않게, 같은 답이면 같은 결과). */
(function (root) {
  'use strict';
  const FAMS = ['nemo', 'semo', 'dong'];
  function resolve(ans) {
    const cnt = { nemo: 0, semo: 0, dong: 0 }; ans.forEach((a) => cnt[a.f]++);
    const max = Math.max(cnt.nemo, cnt.semo, cnt.dong), tied = FAMS.filter((f) => cnt[f] === max), seed = ans.reduce((a, x, i) => a + (x.s + 1) * (i + 2) + FAMS.indexOf(x.f) * (i + 1), 0);
    const f = tied[seed % tied.length], sc = [0, 0, 0]; ans.filter((a) => a.f === f).forEach((a) => sc[a.s]++);
    const smax = Math.max(...sc), st = [0, 1, 2].filter((i) => sc[i] === smax), s = st[(seed >> 1) % st.length];
    return { f, s, cnt };
  }
  const api = { resolve, FAMS };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.QuizCore = api;
})(typeof window !== 'undefined' ? window : globalThis);
