// ⑪ 수집형 RPG 밸런스 시뮬레이터 (games/25_EXPEDITION_GDD1.md §4~§7). node tools/rpg_sim.js [키=값 …] [--battle] [--gacha]
// 1부 전투 몬테카를로: 5대5 자동 전투(속도 게이지·스킬 쿨 3·세 가족 상성 3각)로 「스탯 배율 k → 승률」 곡선을 만든다. k90 = 승률 90%가 되는 배율.
// 2부 성장 시뮬: 스테이지 s 의 적 배율 E(s)=G^(s-1). 아군 배율 f = 레벨×등급×각성×장비. f ≥ k90×E(s) 이면 클리어. 하루 행동력으로 전진/반복 → 클리어 일수·막힘.
// 3부 뽑기: 확률표(2.5/13.5/84, 소프트 천장 60, 하드 천장 80)로 평균·분포·천장 도달을 센다. 단언 실패 시 종료 코드 1.
const arg = {}; process.argv.slice(2).forEach((a) => { const m = /^(\w+)=(.+)$/.exec(a); if (m) arg[m[1]] = JSON.parse(m[2]); });
const rng = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
// ---------------- 1부: 전투 ----------------
const EL = ['flash', 'support', 'care'];                 // 번쩍(세모) > 받치기(네모) > 돌보기(동그라미) > 번쩍
const BEATS = { flash: 'support', support: 'care', care: 'flash' };
const ROLES = { tank: { hp: 1.7, atk: 0.7, def: 1.5 }, attacker: { hp: 1.0, atk: 1.3, def: 0.9 }, mage: { hp: 0.8, atk: 1.2, def: 0.7 }, healer: { hp: 1.0, atk: 0.8, def: 1.0 }, support: { hp: 0.9, atk: 0.9, def: 1.0 } };
const COMP = ['tank', 'attacker', 'mage', 'healer', 'support'];
const ADV = arg.adv || 1.5, DIS = arg.dis || 0.7;
function team(R, k, els) { return COMP.map((r, i) => ({ role: r, el: els ? els[i] : EL[Math.floor(R() * 3)], hp: 1000 * ROLES[r].hp * k, atk: 100 * ROLES[r].atk * k, def: 50 * ROLES[r].def * k, spd: 95 + R() * 15, g: 0, cd: 3 - (i % 3), buff: 0 })); }
function battle(R, A, B) {
  A.forEach((u) => { u.max = u.hp; }); B.forEach((u) => { u.max = u.hp; });
  const alive = (T) => T.filter((u) => u.hp > 0);
  for (let tick = 0; tick < 4000; tick++) {
    for (const u of A.concat(B)) if (u.hp > 0) u.g += u.spd;
    const ready = A.concat(B).filter((u) => u.hp > 0 && u.g >= 1000).sort((x, y) => y.g - x.g);
    for (const u of ready) {
      if (u.hp <= 0) continue; u.g -= 1000; const me = A.includes(u) ? A : B, foe = me === A ? B : A, fa = alive(foe), ma = alive(me); if (!fa.length || !ma.length) break;
      const hit = (t, mult) => { const em = BEATS[u.el] === t.el ? ADV : (BEATS[t.el] === u.el ? DIS : 1); t.hp -= u.atk * (u.buff > 0 ? 1.2 : 1) * mult * em * 100 / (100 + t.def); };
      u.cd--; const skill = u.cd <= 0; if (skill) u.cd = 3; if (u.buff > 0) u.buff--;
      const tk = fa.find((t) => t.role === 'tank'), tgt = tk && R() < 0.4 ? tk : fa[Math.floor(R() * fa.length)];
      if (u.role === 'healer' && skill) ma.forEach((a) => { a.hp = Math.min(a.max, a.hp + u.atk * 1.4); });
      else if (u.role === 'support' && skill) ma.forEach((a) => { a.buff = 2; });
      else if (u.role === 'mage' && skill) fa.forEach((t) => hit(t, 0.9));
      else hit(tgt, skill ? (u.role === 'attacker' ? 2.2 : 1.6) : 1.0);
    }
    if (!alive(A).length) return false; if (!alive(B).length) return true;
  }
  return false;
}
function winProb(k, n, mode) {
  const R = rng(12345 + Math.round(k * 1000)); let w = 0;
  for (let i = 0; i < n; i++) {
    const eEls = COMP.map(() => EL[Math.floor(R() * 3)]);
    const pEls = mode === 'counter' ? eEls.map((e) => EL.find((x) => BEATS[x] === e)) : mode === 'bad' ? eEls.map((e) => BEATS[e]) : null;
    if (battle(R, team(R, k, pEls), team(R, 1, eEls))) w++;
  }
  return w / n;
}
const P0 = { G: 1.0115, stages: 204, per: 12, energyCost: 6, sessionsEnergy: { 3: 270, 2: 180, 1: 90 }, e0: 20, c0: 60, q: 1.13, lvMul: 0.065, capBase: 15, capPer: 3, capMax: 60, g0: 30, goldCost: 600, goldGrow: 1.33, gearMul: 0.04, gearMax: 20, awakenMul: 0.06, fragPerDay: 4, fragCost: 60, freeGemDay: 120, gemWeek: 300, gemMonth: 1000, gemCountry: 300, pull: 150, kSlack: 1.0 };
const P = Object.assign({}, P0, arg);
let K90 = null; function curve() { const rows = []; for (let k = 0.6; k <= 1.5001; k += 0.1) rows.push([+k.toFixed(2), winProb(k, 400), winProb(k, 400, 'counter'), winProb(k, 400, 'bad')]); return rows; }
function findK(mode, p) { let lo = 0.4, hi = 2.5; for (let i = 0; i < 14; i++) { const mid = (lo + hi) / 2; if (winProb(mid, 300, mode) >= p) hi = mid; else lo = mid; } return +hi.toFixed(3); }
// ---------------- 3부: 뽑기 ----------------
const RATE = { five: 0.025, four: 0.135 }, SOFT = 60, HARD = 80, SOFTUP = 0.06;
function pullOnce(R, st) {                              // st = {since5, since4}
  st.since5++; st.since4++; const p5 = st.since5 >= HARD ? 1 : RATE.five + (st.since5 > SOFT ? (st.since5 - SOFT) * SOFTUP : 0), x = R();
  if (x < p5) { st.since5 = 0; st.since4 = 0; return 5; }
  if (st.since4 >= 10 || x < p5 + RATE.four) { st.since4 = 0; return 4; } return 3;
}
function gachaStats(n) { const R = rng(7); let tot = 0, mx = 0, per = []; for (let i = 0; i < n; i++) { const st = { since5: 0, since4: 0 }; let c = 0; for (;;) { c++; if (pullOnce(R, st) === 5) break; } tot += c; mx = Math.max(mx, c); per.push(c); } per.sort((a, b) => a - b); return { mean: +(tot / n).toFixed(1), max: mx, p50: per[n >> 1], p90: per[Math.floor(n * 0.9)] }; }
// ---------------- 2부: 성장 ----------------
const GR = { 3: 1.0, 4: 1.2, 5: 1.45 };
function run(Q, seed) {
  const R = rng(seed), S = Object.assign({}, Q), lv = [1, 1, 1, 1, 1], team5 = [3, 3, 3, 3, 3];
  let s = 0, day = 0, gear = 0, awaken = 0, frags = 0, gold = 0, exp = 0, pulls = 0, gemSpent = 0, gems = 0, stall = 0, maxStall = 0, bank = 0, gacha = { since5: 0, since4: 0 }, stars5 = 0, paidGems = S.paidGemDay || 0;
  const stall1 = []; const E = (i) => Math.pow(S.G, i - 1), country = (i) => Math.floor((i - 1) / S.per) + 1, cap = (i) => Math.min(S.capMax, S.capBase + S.capPer * country(i));
  const mGrade = () => team5.slice().sort((a, b) => b - a).reduce((a, g) => a + GR[g], 0) / 5;
  const f = () => lv.reduce((a, L) => a + (1 + S.lvMul * (L - 1)), 0) / 5 * mGrade() * (1 + S.awakenMul * awaken) * (1 + S.gearMul * gear);
  const join = (g) => { const i = team5.indexOf(Math.min(...team5)); if (g > team5[i]) team5[i] = g; };
  const joinAt = { 2: 3, 3: 4, 4: 4, 5: 3, 6: 4, 7: 4, 9: 5, 10: 4, 12: 5, 13: 4, 15: 5 };   // 나라 번호 → 이야기 합류·포섭 등급(확정)
  const energyDay = S.energy || S.sessionsEnergy[S.sessions] || 180; let lastCountry = 0, fin = null;
  for (day = 1; day <= 600 && s < S.stages; day++) {
    gems += S.freeGemDay + (day % 7 === 0 ? S.gemWeek : 0) + (day % 30 === 0 ? S.gemMonth : 0) + paidGems;
    while (gems >= S.pull) { gems -= S.pull; pulls++; const g = pullOnce(R, gacha); if (g >= 4) { if (g === 5) stars5++; join(g); frags += g === 5 ? 20 : 5; } else frags += 1; }
    frags += S.fragPerDay;
    let en = energyDay, dayStart = s;
    while (en >= S.energyCost) {
      en -= S.energyCost; const next = s + 1;
      if (next <= S.stages && f() * (1 + (S.help == null ? 0.05 : S.help) * Math.min(stall, 4)) >= (S.k90 || K90 || 1.09) * S.kSlack * E(next)) { s = next; exp += S.e0 * Math.pow(S.G, s); gold += S.g0 * Math.pow(S.G, s); if (country(s) > lastCountry) { lastCountry = country(s); gems += S.gemCountry; const g = joinAt[lastCountry]; if (g) join(g); } }
      else { exp += S.e0 * Math.pow(S.G, Math.max(1, s - 2)); gold += S.g0 * Math.pow(S.G, Math.max(1, s - 2)); }
      // 육성: 가장 낮은 레벨 → 장비 → 각성 (가장 효율 좋은 곳 먼저 — 여기서는 순서대로 한 번에 하나)
      for (let guard = 0; guard < 40; guard++) {
        let did = false; const i = lv.indexOf(Math.min(...lv)), c = S.c0 * Math.pow(S.q, lv[i]);
        if (lv[i] < cap(Math.max(1, s)) && exp >= c) { exp -= c; lv[i]++; did = true; }
        const gc = S.goldCost * Math.pow(S.goldGrow, gear); if (gear < S.gearMax && gold >= gc) { gold -= gc; gear++; did = true; }
        const fc = S.fragCost * Math.pow(2, awaken); if (awaken < 5 && frags >= fc) { frags -= fc; awaken++; did = true; }
        if (!did) break;
      }
    }
    if (s === dayStart) stall++; else { stall = 0; } maxStall = Math.max(maxStall, stall);
    if (s >= S.stages && fin == null) fin = day;
  }
  return { fin, maxStall, pulls, stars5, lv: lv.slice(), gear, awaken, s, f: +f().toFixed(1), day };
}
function median(a) { a = a.slice().sort((x, y) => x - y); return a[a.length >> 1]; }
if (require.main !== module) { module.exports = { run, P0, findK, winProb }; return; }
if (true) {
  K90 = arg.k90 || findK(null, 0.9); const Kc = findK('counter', 0.9), Kb = findK('bad', 0.9);
  console.log(`전투: 같은 배율 승률 ${(winProb(1, 500) * 100).toFixed(0)}% · 승률90% 배율 k90 중립 ${K90} / 상성 유리 ${Kc} / 불리 ${Kb} (유리·불리 격차 ${(Kb / Kc).toFixed(2)}배)`);
  if (process.argv.includes('--battle')) curve().forEach((r) => console.log(`  k=${r[0]} 중립 ${(r[1] * 100).toFixed(0)}% 유리 ${(r[2] * 100).toFixed(0)}% 불리 ${(r[3] * 100).toFixed(0)}%`));
}
const PULL_KRW = 1500, S_cost = () => PULL_KRW; const GS = gachaStats(20000); console.log(`뽑기: ★5 평균 ${GS.mean}번 · 중앙값 ${GS.p50} · 90% ${GS.p90} · 최대 ${GS.max}(천장 ${HARD}) · 기대 ${(GS.mean * S_cost()).toFixed(0)}원/★5(1회 ${PULL_KRW}원)`);
const tiers = [['무과금 3회/일', { sessions: 3 }], ['무과금 2회/일', { sessions: 2 }], ['무과금 1회/일', { sessions: 1 }], ['월 1만원(2회/일)', { sessions: 2, paidGemDay: 70 }], ['월 5만원(2회/일)', { sessions: 2, paidGemDay: 330 }], ['월 15만원(2회/일)', { sessions: 2, paidGemDay: 1000 }]];
const res = {}; let bad = [];
for (const [name, o] of tiers) { const rs = []; for (let i = 0; i < 40; i++) rs.push(run(Object.assign({}, P, o), 100 + i)); const fin = rs.map((r) => r.fin || 999); res[name] = { fin: median(fin), stall: Math.max(...rs.map((r) => r.maxStall)), pulls: median(rs.map((r) => r.pulls)), five: median(rs.map((r) => r.stars5)), s: median(rs.map((r) => r.s)) };
  console.log(`${name}: 전 스테이지(${P.stages}) 클리어 ${res[name].fin >= 999 ? '못 함(600일 안)' : res[name].fin + '일'}(중앙값, 40회) · 최대 막힘 ${res[name].stall}일 · 뽑기 ${res[name].pulls}회 · ★5 ${res[name].five}개`); }
const base = res['무과금 2회/일'], heavy = res['월 15만원(2회/일)'];
if (base.fin >= 999) bad.push('무과금 2회/일 완주 못 함'); if (base.stall > 2) bad.push('무과금 2회/일 최대 막힘 ' + base.stall + '일(> 2일)'); if (res['무과금 1회/일'].fin >= 999) bad.push('무과금 1회/일 완주 못 함');
if (heavy.fin < base.fin * 0.7) bad.push('과금이 완주를 30% 넘게 당김(pay-to-progress)');
if (GS.max > HARD) bad.push('천장 초과'); if (!(P.G > 1)) bad.push('G');
if (bad.length) { console.log('단언 실패:', bad.join(' / ')); process.exit(1); } console.log('단언 통과');
