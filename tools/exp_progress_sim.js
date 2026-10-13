// ⑪ 진행 곡선 시뮬: node tools/exp_progress_sim.js [kmul] — 평균적인 플레이어(자동 전투·금화는 가장 낮은 레벨에 투자·막히면 마지막 클리어 단계 반복)가
// 단계마다 몇 번 더 싸워야(파밍) 하는지, 파티 레벨은 어떤지 본다. 목표: 새 단계당 파밍 평균 ≤ 3판, 최대 ≤ 7판, 어떤 단계도 막히지 않음.
const SC = require('../games/expedition/stage-core.js'); const D = require('../data/expedition_slice.json'); const B = require('../games/expedition/battle-core.js');
const U = Object.fromEntries(D.units.map((u) => [u.id, u])), capOf = (c) => Math.min(D.bal.lvCapMax, D.bal.lvCap + Math.floor(Math.max(0, c - D.bal.lvCapFrom) / D.bal.lvCapEvery)), cost = (L) => Math.round(D.bal.costBase * Math.pow(D.bal.costGrow, L - 1));
const mul = +(process.argv[2] || 1), only = process.argv[3] === 'q';
const stages = D.stages.map((st) => (mul === 1 ? st : Object.assign({}, st, { enemies: st.enemies.map((e) => Object.assign({}, e, { k: +(e.k * (st.id > 6 ? mul : 1)).toFixed(3) })) })));
const DD = Object.assign({}, D, { stages });
let seed = 1000; const owned = {}, lv = {}; D.units.filter((u) => u.route === 'start').forEach((u) => { owned[u.id] = 1; lv[u.id] = 1; });
let gold = 0, cleared = 0; const rows = []; let farmTotal = 0, maxFarm = 0;
const pickParty = (st) => {      // 최고 5명: 등급 가중 배율 + 상성 보너스(적과 유리한 속성 우선)
  const ids = Object.keys(owned), enEl = st.enemies.map((e) => e.el), score = (id) => SC.kOf(DD, id, lv[id]) * (1 + 0.12 * enEl.filter((e) => B.BEATS[U[id].el] === e).length / Math.max(1, enEl.length));
  const top = ids.sort((a, b) => score(b) - score(a)).slice(0, 5), bossEl = (st.enemies.find((e) => e.lock) || {}).el;
  if (st.recruit && bossEl && !top.some((id) => B.BEATS[U[id].el] === bossEl)) { const c = ids.filter((id) => B.BEATS[U[id].el] === bossEl).sort((a, b) => score(b) - score(a))[0]; if (c) top[4] = c; }   // 포섭 보스: 말 걸 수 있는 친구를 데려간다
  return top;
};
const fight = (st, party) => {
  seed++; const p = party.map((id) => ({ id, lv: lv[id] })), base = { stage: st.id, seed, party: p, auto: true, inputs: [] }; let r = SC.replay(DD, base);
  if (st.recruit) { for (let k = 0; k < 600; k++) { const t = SC.replay(DD, Object.assign({}, base, { inputs: [[k, 'p']] })); if (!t.error && t.recruited) return t; } }
  return r;
};
const spend = (party) => { for (;;) { const id = party.slice().sort((a, b) => lv[a] - lv[b])[0]; if (lv[id] >= capOf(cleared) || gold < cost(lv[id])) break; gold -= cost(lv[id]); lv[id]++; } };
for (let guard = 0; guard < 4000 && cleared < stages.length; guard++) {
  const st = stages[cleared], party = pickParty(st); let farm = 0, res = fight(st, party), tries = 1;
  while (!res.win && farm < 40) {
    const fs = stages[Math.max(0, cleared - 1)]; const fr = fight(fs, pickParty(fs)); farm++; if (fr.win) { gold += Math.round(fs.gold * 0.5); } spend(pickParty(st)); res = fight(st, pickParty(st)); tries++;
  }
  if (!res.win) { rows.push({ s: st.id, blocked: true, avgLv: 0 }); break; }
  gold += st.gold; if (st.join) { owned[st.join] = 1; lv[st.join] = lv[st.join] || 1; } if (res.recruited && st.recruit) { owned[st.recruit] = 1; lv[st.recruit] = lv[st.recruit] || 1; }
  spend(pickParty(st)); cleared = st.id; farmTotal += farm; maxFarm = Math.max(maxFarm, farm); rows.push({ s: st.id, farm, stars: res.stars, avgLv: +(pickParty(st).reduce((a, id) => a + lv[id], 0) / 5).toFixed(1), gold });
}
if (!only) console.log(rows.map((r) => (r.blocked ? `${r.s}:막힘` : `${r.s}:파밍${r.farm}·Lv${r.avgLv}`)).join('  '));
const nb = rows.filter((r) => !r.blocked); console.log(`kmul ${mul} · 클리어 ${cleared}/${stages.length} · 파밍 합계 ${farmTotal}판 (평균 ${(farmTotal / Math.max(1, nb.length)).toFixed(2)}, 최대 ${maxFarm}) · 최종 평균 Lv ${nb.length ? nb[nb.length - 1].avgLv : '-'} · 남은 금화 ${gold}`);
