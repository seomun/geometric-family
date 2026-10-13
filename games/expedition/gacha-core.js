/* ⑪ 기하학 원정대 — 뽑기 코어(브라우저 로컬 백엔드 · Workers 서버 · node 시험 공용). 확률표·천장은 data/expedition_slice.json 의 gacha 블록이 원본.
   pullOnce(G, units, pity, rand) → {id, grade}. pity = {since5, since4, guard} 를 제자리에서 갱신. rand() 는 [0,1) — 서버는 CSPRNG, 시험은 시드 난수. */
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(); else root.ExpGacha = factory(); })(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const pool = (units, grade) => units.filter((u) => u.route === 'gacha' && u.grade === grade);
  function pullOnce(G, units, P, rand) {
    P.since5++; P.since4++; const p5 = P.since5 >= G.hard ? 1 : G.rates.five + (P.since5 > G.soft ? (P.since5 - G.soft) * G.softUp : 0), x = rand();
    const pick = (list) => list[Math.floor(rand() * list.length)];
    if (x < p5) {
      P.since5 = 0; P.since4 = 0; const five = pool(units, 5), pk = five.find((u) => u.pickup); let id;
      if (P.guard) { id = pk.id; P.guard = 0; } else if (rand() < G.pickup.share) id = pk.id; else { id = pick(five.filter((u) => !u.pickup)).id; P.guard = 1; }
      return { id, grade: 5 };
    }
    if (P.since4 >= 10 || x < p5 + G.rates.four) { P.since4 = 0; return { id: pick(pool(units, 4)).id, grade: 4 }; }
    return { id: pick(pool(units, 3)).id, grade: 3 };
  }
  const price = (G, n) => (n === 10 ? G.ten : G.cost * n);
  const dupFrag = (grade) => (grade === 5 ? 20 : grade === 4 ? 5 : 1);
  /** 확률 공개용 표(화면·서버 /gacha/odds 가 같은 값을 쓴다) */
  function odds(G, units) {
    const rows = []; [5, 4, 3].forEach((gr) => { const list = pool(units, gr), tot = gr === 5 ? G.rates.five : gr === 4 ? G.rates.four : G.rates.three; list.forEach((u) => { const p = gr === 5 ? tot * (u.pickup ? G.pickup.share : (1 - G.pickup.share) / (list.length - 1 || 1)) : tot / list.length; rows.push({ id: u.id, name: u.name, grade: gr, pickup: !!u.pickup, rate: p, eff: G.effective ? G.effective.unit[u.id] / 100 : null }); }); });
    return { rates: G.rates, soft: G.soft + 1, softUp: G.softUp, hard: G.hard, pickup: G.pickup, tenGuarantee: '★4 이상 1명', effective: G.effective ? { ver: G.effective.ver, grade: { 5: G.effective.grade[5] / 100, 4: G.effective.grade[4] / 100, 3: G.effective.grade[3] / 100 }, expected5: G.effective.expected5 } : null, rows };
  }
  return { pool, pullOnce, price, dupFrag, odds };
});
