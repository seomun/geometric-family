// ⑪ 막둥이 원정대 밸런스 시뮬레이터 (docs/28 §11 · games/25_EXPEDITION_GDD1.md)
// 사용: node tools/expedition_sim.js [키=값 …] [--sessions] [--players]   (값은 JSON: dps=0.05 sessions='[8,19]')
// 모델: 방치 = 별가루만 모은다(통, 상한 capH 시간 × offlineRate) · 길은 켠 동안(activeMin 분)만 나아간다 · 켜면 통을 열어 가장 낮은 동료부터 레벨업.
// 곤란 하나 = 간격 interval 초(힘이 크기의 2배 넘으면 절반, 크기보다 모자라면 힘/크기에 비례해 느려짐 · 크기의 0.8배 이상이면 돌보기가 메워 정상).
// 단언: ① 완주(보통 플레이어) ② 최대 곤란 간격 ≤ maxIntOK ③ 길이 안 나아간 세션 ≤ 10% ④ 세션당 레벨업 평균 0.8~4 ⑤ 힘/크기 비 r 이 0.6~4 밖으로 나간 세션 ≤ 10% ⑥ 가벼운·열심 플레이어도 완주.
const P0 = {
  baseSize: 8, chGrow: 1.075,                       // 곤란 크기 = baseSize × chGrow^(지금까지 지난 장 수)  (장 = 6곤란)
  chapters: 7, per: 6,                              // 나라당 장 수 · 장당 곤란 수 → 나라당 곤란 42 + 큰 곤란 1
  bigMul: 1.3, bigSec: 40,
  pBase: 3, pLevel: 1.15, flash: 3, flashEvery: 5,  // 동료 힘 = pBase × pLevel^(L-1)
  costBase: 10, costLevel: 1.16,                    // 레벨업 비용 = costBase × costLevel^L
  capBase: 60, capPerCountry: 0, capMax: 60,         // 레벨 상한(별가루가 아니라 상한이 막으면 레벨업이 나라 첫날에 몰린다 — 그래서 상한은 멀리 둔다)
  gearPct: 0.06, gearAt: [5, 15, 25],
  interval: 30, fast: 2, dps: 0.002, bigDustMul: 3,  // 별가루 = 곤란 크기 × dps
  countries: 17,
  activeMin: 3, offlineRate: 0.8, capH: 8, houseBonus: 0.05, maxDays: 400,
  sessions: [8, 19],                                // 보통 플레이어: 하루 2번(아침 8시·저녁 19시)
  startLevels: [1, 1, 1], maxIntOK: 120,
  startDust: 30, firstSec: 12,                     // 첫 선물 별가루(첫 레벨업 2번분) · 첫 곤란은 손가락 시연과 함께 12초 안에 풀림(수용 기준: 15초 이내)
};
const arg = {}; process.argv.slice(2).forEach((a) => { const m = /^(\w+)=(.+)$/.exec(a); if (m) arg[m[1]] = JSON.parse(m[2]); });
const P = Object.assign({}, P0, arg);
function run(Q) {
  const S = Object.assign({}, Q), lv = S.startLevels.slice(), TYPE = [1.1667, 1.1667 * (1 + (S.flash - 1) / S.flashEvery), 1.1667];   // 네모·세모(번쩍)·동그라미 기대 배율(맞는 힘 1.5배 ⅓)
  let n = 1, t = 0, dust = S.startDust || 0, first = true, houses = 0, carry = 0, maxInt = 0, capFull = 0, caps = 0, lastAbs = null;
  const done = [], sess = [], size = (nn, c) => S.baseSize * Math.pow(S.chGrow, (nn - 1) * S.chapters + (c - 1)), tot = S.chapters * S.per;
  const pow = () => lv.reduce((s, L, i) => s + S.pBase * Math.pow(S.pLevel, L - 1) * (1 + S.gearPct * S.gearAt.filter((g) => L >= g).length) * TYPE[i], 0);
  const chap = () => Math.min(S.chapters, Math.floor(t / S.per) + 1);
  const cur = () => (t >= tot ? size(n, S.chapters) * S.bigMul : size(n, chap()));
  const cap = () => Math.min(S.capMax, S.capBase + S.capPerCountry * n);
  const interval = () => { const r = pow() / cur(); if (r >= S.fast) return S.interval / 2; if (r >= 0.8) return S.interval; return S.interval / r; };
  const adv = (sec) => { carry += sec; while (n <= S.countries) {
    if (t >= tot) { if (carry < S.bigSec) return; carry -= S.bigSec; dust += cur() * S.dps * S.bigDustMul; done.push(null); houses++; n++; t = 0; continue; }
    const iv = first ? S.firstSec : interval(); if (carry < iv) return; first = false; carry -= iv; maxInt = Math.max(maxInt, iv); dust += cur() * S.dps; t++; } };
  let day = 0, fin = null;
  for (day = 0; day < S.maxDays && n <= S.countries; day++) for (const h of S.sessions) {
    const a = day * 24 + h;
    if (lastAbs != null) { const gap = a - lastAbs, capHrs = S.capH * (1 + S.houseBonus * houses); caps++; if (gap > capHrs) capFull++; const eff = Math.min(gap, capHrs) * 3600 * S.offlineRate; dust += (eff / interval()) * cur() * S.dps; }
    lastAbs = a; let ups = 0;
    for (;;) { let i = -1; lv.forEach((L, k) => { if (L < cap() && (i < 0 || L < lv[i])) i = k; }); if (i < 0) break; const c = S.costBase * Math.pow(S.costLevel, lv[i]); if (dust < c) break; dust -= c; lv[i]++; ups++; }
    const n0 = n, t0 = t, r0 = pow() / cur(); adv(S.activeMin * 60);
    for (let k = done.length - 1; k >= 0 && done[k] == null; k--) done[k] = +(a / 24).toFixed(2);
    sess.push({ day, h, ups, n: n0, adv: (n - n0) * (tot + 1) + (t - t0), r: +r0.toFixed(2), lv: lv.slice(), dust: Math.round(dust) });
    if (n > S.countries) { fin = +(a / 24).toFixed(1); break; }
  }
  return { done, sess, maxInt: Math.round(maxInt), capFull, caps, finish: fin, lv };
}
function stats(R, Q) {
  const per = R.done.map((d, i) => +(d - (i ? R.done[i - 1] : 0)).toFixed(2)), ups = R.sess.map((s) => s.ups), U = ups.reduce((a, b) => a + b, 0) / ups.length;
  const stall = R.sess.filter((s) => s.adv === 0).length, rOut = R.sess.filter((s) => s.r < 0.6 || s.r > 4).length;
  return { per, avgUp: +U.toFixed(2), zeroUp: ups.filter((u) => u === 0).length, stall, rOut, nS: R.sess.length, rMin: Math.min(...R.sess.map((s) => s.r)), rMax: Math.max(...R.sess.map((s) => s.r)) };
}
if (require.main !== module) { module.exports = { run, stats, P0 }; return; }
const PL = { 열심: [7.5, 12.5, 19.5], 보통: [8, 19], 가끔: [19] };
const out = {}; for (const [k, ss] of Object.entries(PL)) { out[k] = run(Object.assign({}, P, { sessions: k === '보통' ? P.sessions : ss })); }
const base = out['보통'], st = stats(base, P);
console.log('나라별 걸린 날(보통 하루 2번):', st.per.map((x, i) => `${i + 1}:${x}`).join(' '));
console.log(`완주 ${base.finish == null ? '못 함' : base.finish + '일'} · 세션 ${st.nS}개 · 세션당 레벨업 평균 ${st.avgUp}(0번 ${st.zeroUp}) · 길이 안 나아간 세션 ${st.stall} · 최대 곤란 간격 ${base.maxInt}초 · 힘/크기 r ${st.rMin}~${st.rMax} (0.6~4 밖 ${st.rOut}) · 통 상한 도달 ${base.capFull}/${base.caps} · 최종 레벨 ${base.lv.join('/')}`);
if (process.argv.includes('--players')) for (const [k, R] of Object.entries(out)) { const s = stats(R, P); console.log(`  ${k}(${(k === '보통' ? P.sessions : PL[k]).length}회/일): 완주 ${R.finish == null ? '못 함' : R.finish + '일'} · 레벨업/세션 ${s.avgUp} · r ${s.rMin}~${s.rMax} · 최대 간격 ${R.maxInt}초`); }
if (process.argv.includes('--sessions')) base.sess.slice(0, 30).forEach((s) => console.log(JSON.stringify(s)));
const bad = []; if (base.sess[0].ups < 1) bad.push('첫 세션에 레벨업 없음(첫 레벨업 2분 이내 기준)'); if (P.firstSec > 15) bad.push('첫 해결 15초 초과'); if (base.finish == null) bad.push('보통 플레이어 완주 못 함'); if (base.maxInt > P.maxIntOK) bad.push(`곤란 간격 ${P.maxIntOK}초 초과(막힘)`); if (st.stall > st.nS * 0.1) bad.push('길이 안 나아간 세션 10% 초과');
if (st.avgUp < 0.8 || st.avgUp > 4) bad.push('세션당 레벨업 평균 0.8~4 밖'); if (st.rOut > st.nS * 0.1) bad.push('힘/크기 r 0.6~4 밖 세션 10% 초과');
for (const k of ['열심', '가끔']) if (out[k].finish == null) bad.push(k + ' 플레이어 완주 못 함');
if (bad.length) { console.log('단언 실패:', bad.join(' / ')); process.exit(1); } console.log('단언 통과');
