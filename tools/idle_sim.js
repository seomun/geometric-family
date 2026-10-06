// 방치형 밸런스 시뮬레이션: node tools/idle_sim.js [하루세션수=3] [일수=14]
const B = require('../data/idle_balance.json'), N = +process.argv[2] || 3, DAYS = +process.argv[3] || 14;
if (process.env.GG) for (const t in B.tables) { B.tables[t].gens.forEach((x) => (x.growth = +process.env.GG)); if (B.tables[t].pot) B.tables[t].pot.growth = +process.env.GG; }
if (process.env.TG) B.tableLevel.growth = +process.env.TG;
if (process.env.CK) { for (const t in B.tables) { B.tables[t].gens.forEach((x) => (x.cost *= +process.env.CK)); } }
let w = 15, l = 0, tot = 0; const g = {}, tl = { nemo: 1, semo: 1, dong: 1 }; let chairs = 1; const inv = new Set(); let slider = 0.2;
const lv = (id) => g[id] || 0, cost = (x) => x.cost * Math.pow(x.growth, lv(x.id));
const tm = (t) => Math.pow(B.tableLevel.mult, tl[t] - 1), lm = () => 1 + B.laughLog * Math.log10(1 + l);
const gross = (t) => B.tables[t].gens.reduce((a, x) => a + lv(x.id) * x.rate, 0);
function rates(buff) {
  const T = B.tables.nemo, mem = T.gens.filter((x) => lv(x.id)).length, bowls = T.bowlsBase + lv(T.pot.id), sat = mem ? Math.min(1, bowls / mem) : 1;
  const no = gross('nemo') * (0.5 + 0.5 * sat) * tm('nemo') * lm();
  const sb = gross('semo') * tm('semo') * lm(), D = B.tables.dong, pen = 1 - D.lonelyPenalty * (D.chairs - chairs), dw = gross('dong') * pen * tm('dong') * lm();
  return { base: no * (1 - slider) + sb + dw, w: no * (1 - slider) + sb * buff + dw, l: no * slider * T.laughPerOutput + Math.max(0, chairs - 1) * D.laughPerChair };
}
function buy() { // 가장 싼 것부터 산다(초보 플레이어 모델)
  let best = null;
  for (const t of Object.keys(B.tables)) { const T = B.tables[t]; for (const x of T.gens.concat([T.pot ? { ...T.pot, rate: 0.3 } : null].filter(Boolean))) { const c = cost(x); if (c <= w && (!best || c < best.c)) best = { c, x, t, k: 'g' }; }
    const TL = B.tableLevel, L = tl[t], tc = TL.baseCost * Math.pow(TL.growth, Math.min(L, TL.lateFrom || 999) - 1) * Math.pow(TL.lateGrowth || TL.growth, Math.max(0, L - (TL.lateFrom || 999))); if (tl[t] < B.tableLevel.max && tc <= w && (!best || tc < best.c)) best = { c: tc, t, k: 't' }; }
  if (!best) return false; w -= best.c; if (best.k === 'g') g[best.x.id] = lv(best.x.id) + 1; else tl[best.t]++;
  B.tables.dong.invites.forEach((iv, i) => { if (!inv.has(i) && Object.keys(iv.need).every((k) => tl[k] >= iv.need[k])) { inv.add(i); chairs++; l += 20 * chairs; } });
  return true;
}
const th = B.storyThresholds, hit = []; let t = 0;
const run = (sec, active) => { for (let s = 0; s < sec; s += 1) { const buff = active && s % 90 < 60 ? 1.6 : 1, r = rates(buff); w += r.w; tot += r.w; l += r.l; if (active) { let n = 0; while (n++ < (+process.env.BPS || 1) && buy()); } th.forEach((x, i) => { if (hit[i] == null && tot >= x) hit[i] = t + s; }); } t += sec; };
const gapH = 24 / N - 0.05;
const daily = []; let endDay = null;
for (let d = 0; d < DAYS; d++) { for (let s = 0; s < N; s++) { run(180, true); const r = rates(1), gained = r.base * Math.min(gapH * 3600, 8 * 3600) * B.offlineEfficiency; w += gained; tot += gained; t += gapH * 3600; th.forEach((x, i) => { if (hit[i] == null && tot >= x) hit[i] = t; }); } if (endDay == null && ['nemo', 'semo', 'dong'].every((k) => tl[k] >= B.ending.needLv) && chairs >= B.ending.needChairs && tot >= th[th.length - 1]) endDay = d + 1; daily.push(tot.toExponential(1) + '/Lv' + (tl.nemo + tl.semo + tl.dong)); }
console.log('일별 누적온기/식탁Lv합: ' + daily.join('  '));
console.log(`하루 ${N}회×3분, ${DAYS}일`); th.forEach((x, i) => console.log(`사연 ${i + 1} (온기 ${x}): ` + (hit[i] != null ? (hit[i] / 86400).toFixed(1) + '일째' : '미도달')));
console.log('식탁 Lv', JSON.stringify(tl), '의자', chairs, '누적 온기', tot.toExponential(2), '웃음', l.toExponential(2));
if (process.env.DBG) console.log(JSON.stringify(g), 'rate', rates(1).base.toExponential(2), 'w', w.toExponential(2));
console.log('엔딩 조건 충족(모든 식탁 Lv' + B.ending.needLv + '+, 의자 4, 사연 30편 문턱): ' + (endDay ? endDay + '일째' : '미도달'));
