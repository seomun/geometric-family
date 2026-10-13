/* ⑪ 기하학 원정대 — 전투 코어(결정론). 브라우저(window.ExpBattle)와 node(tools/rpg_sim.js)가 같은 코드를 쓴다.
   규칙(games/25_EXPEDITION_GDD1.md §2): 5대5 · 속도 게이지(SPD, 1000 도달 시 행동) · 스킬 쿨 3턴 · 세 가족 상성 3각(번쩍 > 받치기 > 돌보기 > 번쩍, 유리 ×1.5 · 불리 ×0.7) · 피해 = ATK × 배율 × 100/(100+DEF) × 상성.
   난수는 주입한 rng() 하나뿐 → 같은 팀·같은 시드·같은 입력이면 같은 결과(리플레이·서버 재현). 단계 실행 API: create(...).step() 이 행동 하나씩을 돌려준다. */
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(); else root.ExpBattle = factory(); })(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  const EL = ['flash', 'support', 'care'];                       // 번쩍(세모) · 받치기(네모) · 돌보기(동그라미)
  const BEATS = { flash: 'support', support: 'care', care: 'flash' };
  const ROLES = { tank: { hp: 1.7, atk: 0.7, def: 1.5 }, attacker: { hp: 1.0, atk: 1.3, def: 0.9 }, mage: { hp: 0.8, atk: 1.2, def: 0.7 }, healer: { hp: 1.0, atk: 0.8, def: 1.0 }, support: { hp: 0.9, atk: 0.9, def: 1.0 } };
  const COMP = ['tank', 'attacker', 'mage', 'healer', 'support'];
  const ADV = 1.5, DIS = 0.7, MAXTICK = 4000;
  const mulberry = (seed) => { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; };
  const mult = (atkEl, defEl) => (BEATS[atkEl] === defEl ? ADV : (BEATS[defEl] === atkEl ? DIS : 1));
  /** 유닛 하나: def = {id,name,role,el,k(스탯 배율),spd?} → 전투용 */
  function unit(d, i, side) { const r = ROLES[d.role], k = d.k == null ? 1 : d.k; return { id: d.id, name: d.name, role: d.role, el: d.el, side, i, hp: 1000 * r.hp * k, max: 1000 * r.hp * k, atk: 100 * r.atk * k, def: 50 * r.def * k, spd: d.spd == null ? 100 : d.spd, g: 0, cd: d.cd == null ? 3 - (i % 3) : d.cd, buff: 0, down: false, lock: d.lock || 0, sk: d.sk || 1, skl: d.skl || 1 }; }   /* sk: 스킬 배율(스킬 레벨) · skl: 스킬 레벨(응원 지속) */   /* lock: 체력 하한 비율(포섭 보스) — release 전에는 이 아래로 안 떨어진다 */
  /** 시험·시뮬용: 역할 5종 고정 구성, 속성은 R() 로(또는 els) — tools/rpg_sim.js 와 같은 방식 */
  function makeTeam(R, k, els, side) { return COMP.map((r, i) => unit({ id: r + i, name: r, role: r, el: els ? els[i] : EL[Math.floor(R() * 3)], k, spd: 95 + R() * 15 }, i, side || 'A')); }
  function create(defsA, defsB, o) {
    o = o || {}; const rng = o.rng || mulberry(o.seed == null ? 1 : o.seed), A = defsA.map((d, i) => (d.hp != null && d.max != null ? d : unit(d, i, 'A'))), B = defsB.map((d, i) => (d.hp != null && d.max != null ? d : unit(d, i, 'B')));
    A.forEach((u) => { u.side = 'A'; }); B.forEach((u) => { u.side = 'B'; });
    const all = A.concat(B), pending = new Set(); let tick = 0, queue = [], over = false, win = false, turns = 0; const alive = (T) => T.filter((u) => u.hp > 0);
    const api = {
      A, B, units: all, rng, autoSkill: o.autoSkill !== false,
      get over() { return over; }, get win() { return win; }, get tick() { return tick; }, get turns() { return turns; },
      /** 수동 스킬 예약(autoSkill=false 일 때): 그 유닛의 스킬이 준비되면 다음 행동에서 쓴다 */
      cast(side, i) { pending.add(side + i); }, release(side, i) { (side === 'A' ? A : B)[i].lock = 0; }, ready(u) { return u.hp > 0 && u.cd <= 1; },
      /** 행동 하나 실행 → 이벤트 {tick, actor:{side,i}, kind, hits:[{side,i,dmg,mult,hp,down}], heals:[…], over, win} · 끝났으면 null */
      step() {
        if (over) return null;
        while (!queue.length) { tick++; if (tick > MAXTICK) { over = true; win = false; return null; } all.forEach((u) => { if (u.hp > 0) u.g += u.spd; }); queue = all.filter((u) => u.hp > 0 && u.g >= 1000).sort((x, y) => y.g - x.g); }
        const u = queue.shift(); if (u.hp <= 0) return api.step();
        u.g -= 1000; const me = u.side === 'A' ? A : B, foe = u.side === 'A' ? B : A, fa = alive(foe), ma = alive(me); if (!fa.length || !ma.length) { over = true; win = !fa.length; return null; }
        const ev = { tick, actor: { side: u.side, i: u.i }, kind: 'attack', hits: [], heals: [] }; turns++;
        u.cd--; let skill = u.cd <= 0; if (skill && u.side === 'A' && !api.autoSkill) { if (pending.has('A' + u.i)) pending.delete('A' + u.i); else { skill = false; u.cd = 0; } } if (skill) u.cd = 3; if (u.buff > 0) u.buff--;
        const hit = (t, m) => { const em = mult(u.el, t.el), dmg = u.atk * (u.buff > 0 ? 1.2 : 1) * m * em * 100 / (100 + t.def); t.hp -= dmg; if (t.lock && t.hp < t.lock * t.max) t.hp = t.lock * t.max; if (t.hp <= 0) { t.hp = 0; t.down = true; } ev.hits.push({ side: t.side, i: t.i, dmg, mult: em, hp: t.hp, down: t.down }); };
        const tk = fa.find((t) => t.role === 'tank'), tgt = tk && rng() < 0.4 ? tk : fa[Math.floor(rng() * fa.length)];
        if (u.role === 'healer' && skill) { ev.kind = 'heal'; ma.forEach((a) => { const h = Math.min(a.max, a.hp + u.atk * 1.4 * u.sk) - a.hp; a.hp += h; ev.heals.push({ side: a.side, i: a.i, amount: h, hp: a.hp }); }); }
        else if (u.role === 'support' && skill) { ev.kind = 'buff'; ma.forEach((a) => { a.buff = 2 + (u.skl >= 3 ? 1 : 0) + (u.skl >= 5 ? 1 : 0); ev.heals.push({ side: a.side, i: a.i, amount: 0, hp: a.hp, buff: true }); }); }
        else if (u.role === 'mage' && skill) { ev.kind = 'aoe'; fa.forEach((t) => hit(t, 0.9 * u.sk)); }
        else { ev.kind = skill ? 'skill' : 'attack'; hit(tgt, skill ? (u.role === 'attacker' ? 2.2 : 1.6) * u.sk : 1.0); }
        if (!alive(A).length) { over = true; win = false; } else if (!alive(B).length) { over = true; win = true; }
        ev.over = over; ev.win = win; return ev;
      },
      /** 끝까지(자동). 이벤트 로그를 모아 돌려준다 */
      run(maxEvents) { const log = []; let e, n = 0; while ((e = api.step()) && n++ < (maxEvents || 1e6)) log.push(e); return { win, turns, tick, log }; },
      /** 로그 해시(결정론 점검용) */
      hash(log) { let h = 2166136261; log.forEach((e) => { const s = e.tick + ':' + e.actor.side + e.actor.i + e.kind + e.hits.map((x) => x.side + x.i + Math.round(x.dmg)).join(',') + e.heals.map((x) => x.side + x.i + Math.round(x.amount)).join(','); for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } }); return h >>> 0; },
    };
    return api;
  }
  return { EL, BEATS, ROLES, COMP, ADV, DIS, mulberry, mult, unit, makeTeam, create };
});
