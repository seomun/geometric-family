/* ⑪ 기하학 원정대 — 스테이지 재현 코어 (UMD). 클라이언트(전투 화면)와 서버(/stage/clear)가 같은 파일을 쓴다.
   전투 한 판 = (스테이지, 시드, 파티[{id,lv}], 처음 자동 여부, 입력 기록 inputs). 서버는 같은 입력으로 battle-core 를 다시 돌려 승패·별·보상을 정한다.
   inputs: [n, 'c', i] 스킬 예약 · [n, 'r'] 포섭 보스 체력 보호 해제(계속 싸우기) · [n, 'p'] 말 걸기(포섭) · [n, 'a', 0|1] 자동 스킬 전환
           n = 그 입력이 들어간 시점까지 실행된 행동(step) 수. */
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(require('./battle-core.js')); else root.ExpStage = factory(root.ExpBattle || root.BattleCore); })(typeof self !== 'undefined' ? self : this, function (B) {
  'use strict';
  const unitOf = (D, id) => D.units.find((u) => u.id === id);
  const kOf = (D, id, lv) => (1 + D.bal.lvMul * ((lv || 1) - 1)) * D.bal.gradeMul[String(unitOf(D, id).grade)];
  const defOf = (D, id, lv, i) => { const u = unitOf(D, id); return { id, name: u.name, role: u.role, el: u.el, k: kOf(D, id, lv), spd: 100 + ((i * 7) % 11) }; };
  const enemyDef = (e, i, boss) => ({ id: 'e' + i, name: e.name, role: e.role, el: e.el, k: e.k, spd: 98 + ((i * 5) % 9), emoji: e.emoji, lock: e.lock != null ? e.lock : (boss && e.name === '바람 친구' ? 0.25 : 0) });
  const MAX_STEPS = 1000, MAX_INPUTS = 800;

  /** 재현: {win, recruited, downs, stars, steps, hash, error?} — 입력이 규칙에 어긋나면 error */
  function replay(D, spec) {
    const st = D.stages.find((x) => x.id === spec.stage); if (!st) return { error: 'bad_stage' };
    const inputs = spec.inputs || []; if (!Array.isArray(inputs) || inputs.length > MAX_INPUTS) return { error: 'bad_inputs' };
    let last = 0; for (const x of inputs) { if (!Array.isArray(x) || !Number.isInteger(x[0]) || x[0] < last || x[0] > MAX_STEPS || !['c', 'r', 'p', 'a'].includes(x[1])) return { error: 'bad_inputs' }; if (x[1] === 'c' && !(Number.isInteger(x[2]) && x[2] >= 0 && x[2] < 5)) return { error: 'bad_inputs' }; last = x[0]; }
    const A = spec.party.map((p, i) => defOf(D, p.id, p.lv, i)), En = st.enemies.map((e, i) => enemyDef(e, i, st.boss)), core = B.create(A, En, { seed: spec.seed, autoSkill: spec.auto !== false });
    const bi = st.enemies.findIndex((e, i) => enemyDef(e, i, st.boss).lock > 0), boss = bi >= 0 ? core.B[bi] : null, log = []; let steps = 0, ip = 0, recruited = false, ended = false;
    while (!ended) {
      while (ip < inputs.length && inputs[ip][0] <= steps) {
        const x = inputs[ip++];
        if (x[1] === 'c') core.cast('A', x[2]);
        else if (x[1] === 'a') core.autoSkill = !!x[2];
        else if (x[1] === 'r') { if (boss) core.release('B', bi); }
        else if (x[1] === 'p') {      // 말 걸기: 보스 체력이 기준 이하 · 살아 있음 · 돌보기(번쩍을 이기는) 동료가 서 있어야 한다
          if (!boss || !st.recruit || boss.hp <= 0 || boss.hp / boss.max > D.bal.persuadeAt || !core.A.some((u) => u.hp > 0 && B.BEATS[u.el] === boss.el)) return { error: 'bad_persuade' };
          recruited = true; boss.hp = 0; boss.down = true; ended = true; break;
        }
      }
      if (ended) break;
      const ev = core.step(); if (!ev) break; steps++; log.push(ev); if (ev.over || steps >= MAX_STEPS) break;
    }
    const win = recruited || core.win, downs = core.A.filter((u) => u.hp <= 0).length;
    return { win, recruited, downs, stars: win ? (recruited || downs === 0 ? 3 : downs <= 2 ? 2 : 1) : 0, steps, hash: core.hash(log) };
  }
  /** 보상: 처음 깨면 금화 전부 + 반짝석, 다시 깨면 금화 절반 */
  const reward = (D, st, firstClear) => ({ gold: firstClear ? st.gold : Math.round(st.gold * 0.5), gems: firstClear ? (st.gems != null ? st.gems : D.gacha.clearGems) : 0 });
  /** 레벨 상한: 단계를 깰수록 올라간다(압박 없이 천천히) */
  const lvCap = (D, cleared) => Math.min(D.bal.lvCapMax || D.bal.lvCap, D.bal.lvCap + Math.floor(Math.max(0, (cleared || 0) - (D.bal.lvCapFrom || 0)) / (D.bal.lvCapEvery || 999)));
  return { kOf, defOf, enemyDef, replay, reward, lvCap, MAX_STEPS };
});
