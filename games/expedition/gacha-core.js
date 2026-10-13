/* ⑪ 기하학 원정대 — 뽑기 코어(브라우저 로컬 백엔드 · Workers 서버 · node 시험 공용). 확률표·천장은 data/expedition_slice.json 의 gacha 블록이 원본.
   pullOnce(G, units, pity, rand) → {id, grade}. pity = {since5, since4, guard} 를 제자리에서 갱신. rand() 는 [0,1) — 서버는 CSPRNG, 시험은 시드 난수. */
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(); else root.ExpGacha = factory(); })(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  /** 배너(B15): 한정 동료(u.banner)는 그 배너 풀에만 들어간다. 배너가 없으면 main */
  const bannerOf = (G, bid) => (G.banners || []).find((b) => b.id === (bid || 'main')) || null;
  const pool = (units, grade, bid) => units.filter((u) => u.route === 'gacha' && u.grade === grade && (!u.banner || u.banner === (bid || 'main')));
  const pickupOf = (G, units, bid) => { const five = pool(units, 5, bid), b = bannerOf(G, bid); return (b && five.find((u) => u.id === b.pickup)) || five.find((u) => u.pickup); };
  function pullOnce(G, units, P, rand, bid) {
    P.since5++; P.since4++; const p5 = P.since5 >= G.hard ? 1 : G.rates.five + (P.since5 > G.soft ? (P.since5 - G.soft) * G.softUp : 0), x = rand();
    const pick = (list) => list[Math.floor(rand() * list.length)];
    if (x < p5) {
      P.since5 = 0; P.since4 = 0; const five = pool(units, 5, bid), pk = pickupOf(G, units, bid); let id;
      if (P.guard) { id = pk.id; P.guard = 0; } else if (rand() < G.pickup.share) id = pk.id; else { id = pick(five.filter((u) => u.id !== pk.id)).id; P.guard = 1; }
      return { id, grade: 5 };
    }
    if (P.since4 >= 10 || x < p5 + G.rates.four) { P.since4 = 0; return { id: pick(pool(units, 4, bid)).id, grade: 4 }; }
    return { id: pick(pool(units, 3, bid)).id, grade: 3 };
  }
  /** 규칙으로 계산한 ★5 최대 횟수: 소프트 천장 이후 매 회 +softUp 로 확률이 100% 가 되는 첫 회(하드 천장 값은 안전망일 뿐). 화면·서버·스토어 문서가 모두 이 값을 쓴다 */
  const ceiling = (G) => { for (let k = 1; k <= G.hard; k++) { if (G.rates.five + (k > G.soft ? (k - G.soft) * G.softUp : 0) >= 1 - 1e-9) return k; } return G.hard; };
  const price = (G, n) => (n === 10 ? G.ten : G.cost * n);
  const dupFrag = (grade) => (grade === 5 ? 20 : grade === 4 ? 5 : 1);
  /** 확률 공개용 표(화면·서버 /gacha/odds 가 같은 값을 쓴다) */
  function odds(G, units, bid) {
    bid = bid || 'main'; const rows = [], pk = pickupOf(G, units, bid), E = G.effective ? ((G.effective.banners || {})[bid] || (bid === 'main' ? G.effective : null)) : null;
    [5, 4, 3].forEach((gr) => { const list = pool(units, gr, bid), tot = gr === 5 ? G.rates.five : gr === 4 ? G.rates.four : G.rates.three; list.forEach((u) => { const isPk = !!pk && u.id === pk.id, p = gr === 5 ? tot * (isPk ? G.pickup.share : (1 - G.pickup.share) / (list.length - 1 || 1)) : tot / list.length; rows.push({ id: u.id, name: u.name, grade: gr, pickup: isPk, rate: p, eff: E && E.unit ? E.unit[u.id] / 100 : null }); }); });
    return { banner: bid, banners: (G.banners || []).map((x) => ({ id: x.id, name: x.name, pickup: x.pickup })), rates: G.rates, soft: G.soft + 1, softUp: G.softUp, hard: ceiling(G), pickupMax: ceiling(G) * 2, pickup: G.pickup, tenGuarantee: '★4 이상 1명', effective: E ? { ver: E.ver || G.effective.ver, grade: { 5: E.grade[5] / 100, 4: E.grade[4] / 100, 3: E.grade[3] / 100 }, expected5: E.expected5 } : null, rows };
  }
  return { ceiling, pool, bannerOf, pickupOf, pullOnce, price, dupFrag, odds };
});
