/* ⑪ 기하학 원정대 — 스테이지 재현 코어 (UMD). 클라이언트(전투 화면)와 서버(/stage/clear)가 같은 파일을 쓴다.
   전투 한 판 = (스테이지, 시드, 파티[{id,lv}], 처음 자동 여부, 입력 기록 inputs). 서버는 같은 입력으로 battle-core 를 다시 돌려 승패·별·보상을 정한다.
   inputs: [n, 'c', i] 스킬 예약 · [n, 'r'] 포섭 보스 체력 보호 해제(계속 싸우기) · [n, 'p'] 말 걸기(포섭) · [n, 'a', 0|1] 자동 스킬 전환
           n = 그 입력이 들어간 시점까지 실행된 행동(step) 수. */
(function (root, factory) { if (typeof module === 'object' && module.exports) module.exports = factory(require('./battle-core.js')); else root.ExpStage = factory(root.ExpBattle || root.BattleCore); })(typeof self !== 'undefined' ? self : this, function (B) {
  'use strict';
  const unitOf = (D, id) => D.units.find((u) => u.id === id);
  /** 유닛 상태: 숫자(레벨만) 또는 {lv, skl 스킬레벨, awk 각성, promo 승급, gear [4칸 강화]} */
  const stOf = (x) => (typeof x === 'object' && x ? { lv: x.lv || 1, skl: x.skl || 1, awk: x.awk || 0, promo: x.promo || 0, gear: x.gear || [0, 0, 0, 0] } : { lv: x || 1, skl: 1, awk: 0, promo: 0, gear: [0, 0, 0, 0] });
  const gradeOf = (D, id, st) => Math.min(5, unitOf(D, id).grade + stOf(st).promo);
  const kOf = (D, id, x) => { const st = stOf(x), G = D.bal.grow || {}; return (1 + D.bal.lvMul * (st.lv - 1)) * D.bal.gradeMul[String(gradeOf(D, id, st))] * (1 + (G.awkMul || 0) * st.awk) * (1 + (G.gearMul || 0) * st.gear.reduce((a, b) => a + b, 0)); };
  const defOf = (D, id, x, i) => { const u = unitOf(D, id), st = stOf(x), G = D.bal.grow || {}; return { id, name: u.name, role: u.role, el: u.el, k: kOf(D, id, st), spd: 100 + ((i * 7) % 11), sk: 1 + (G.skillMul || 0) * (st.skl - 1), skl: st.skl }; };
  /** 육성(서버·클라이언트 공유 규칙): 한 번에 한 칸. 돌려주는 값 {error} 또는 {st: 새 상태, gold, dups(소모량)}.
      skill 스킬 레벨(금화) · awaken 각성(조각) · promote 등급 승급(조각, 레벨 조건) · gear 장비 4칸 강화(금화) */
  const upgrade = (D, id, x, kind, slot, have) => {
    const G = D.bal.grow, st = stOf(x), out = { st: JSON.parse(JSON.stringify(st)), gold: 0, dups: 0 }; if (!G) return { error: 'no_grow' }; have = have || {};
    if (kind === 'skill') { if (st.skl >= G.skillMax) return { error: 'max' }; out.gold = G.skillCost[st.skl - 1]; out.st.skl++; }
    else if (kind === 'awaken') { if (st.awk >= G.awkMax) return { error: 'max' }; out.dups = G.awkCost[st.awk]; out.st.awk++; }
    else if (kind === 'promote') { const g = gradeOf(D, id, st); if (g >= 5) return { error: 'max' }; if (st.lv < G.promoLv) return { error: 'need_level', need: G.promoLv }; out.dups = G.promoCost[String(g + 1)]; out.st.promo++; }
    else if (kind === 'gear') { if (!(slot >= 0 && slot < 4)) return { error: 'bad_slot' }; if (st.gear[slot] >= G.gearMax) return { error: 'max' }; out.gold = Math.round(G.gearBase * Math.pow(G.gearGrow, st.gear[slot])); out.st.gear[slot]++; }
    else return { error: 'bad_kind' };
    if ((have.gold || 0) < out.gold) return { error: 'insufficient_gold' }; if ((have.dups || 0) < out.dups) return { error: 'insufficient_dups' }; return out;
  };
  const enemyDef = (e, i, boss) => ({ id: 'e' + i, name: e.name, role: e.role, el: e.el, k: e.k, spd: 98 + ((i * 5) % 9), emoji: e.emoji, lock: e.lock != null ? e.lock : (boss && e.name === '바람 친구' ? 0.25 : 0) });
  const MAX_STEPS = 1000, MAX_INPUTS = 800;

  /** 재현: {win, recruited, downs, stars, steps, hash, error?} — 입력이 규칙에 어긋나면 error */
  function replay(D, spec) {
    const st = spec.stageDef || D.stages.find((x) => x.id === spec.stage); if (!st) return { error: 'bad_stage' };
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
    const dealt = Math.round(core.B.reduce((t, e) => t + Math.max(0, e.max - Math.max(0, e.hp)), 0));      // 적에게 준 피해 합(주간 협동 보스 점수)
    return { win, recruited, downs, stars: win ? (recruited || downs === 0 ? 3 : downs <= 2 ? 2 : 1) : 0, steps, dealt, hash: core.hash(log) };
  }
  /** 보상: 처음 깨면 금화 전부 + 반짝석, 다시 깨면 금화 절반 */
  const reward = (D, st, firstClear) => ({ gold: firstClear ? st.gold : Math.round(st.gold * 0.5), gems: firstClear ? (st.gems != null ? st.gems : D.gacha.clearGems) : 0 });
  /** 레벨 상한: 단계를 깰수록 올라간다(압박 없이 천천히) */
  const lvCap = (D, cleared) => Math.min(D.bal.lvCapMax || D.bal.lvCap, D.bal.lvCap + Math.floor(Math.max(0, (cleared || 0) - (D.bal.lvCapFrom || 0)) / (D.bal.lvCapEvery || 999)));
  /** 요일 던전(B3): 그날의 던전 판 — 깬 단계에 맞춘 적(보스 없음, 배율 ×kMul). 클라이언트·서버가 같은 판을 만든다. */
  const dungeonStage = (D, day, tier, cleared) => {
    const Dn = D.dungeon, s = Math.min(D.stages.length, Math.max(1, Math.round(Math.max(1, cleared) * Dn.tiers[tier]))), base = D.stages[s - 1];
    return { id: 1000 + day * 10 + tier, name: Dn.days[day].name, gold: base.gold, enemies: base.enemies.map((e) => Object.assign({}, e, { k: Math.round(e.k * Dn.kMul * 1000) / 1000, lock: 0 })), dungeon: true };
  };
  const dungeonReward = (D, day, tier, cleared) => {
    const Dn = D.dungeon, d = Dn.days[day], st = dungeonStage(D, day, tier, cleared), mul = d.mul || 1; let gold = 0, frag = 0;
    if (d.kind === 'gold') gold = Math.round(st.gold * Dn.goldMul[tier] * Dn.goldDay); else if (d.kind === 'both') { gold = Math.round(st.gold * Dn.goldMul[tier] * 1.2); frag = Math.round(Dn.frag[tier] * 0.7); } else frag = Math.round(Dn.frag[tier] * mul);
    return { gold, frag, el: d.el || null };
  };
  /** 방치 정찰: 마지막으로 받은 뒤 흐른 시간(최대 idleCapH)만큼, 깬 단계 금화의 일부를 시간당으로. */
  const idleGold = (D, cleared, elapsedMs) => { const Dn = D.dungeon, h = Math.min(Dn.idleCapH, Math.max(0, elapsedMs) / 3600000), st = D.stages[Math.max(1, Math.min(D.stages.length, cleared || 1)) - 1]; return elapsedMs < Dn.idleMinMin * 60000 ? 0 : Math.floor(h * st.gold * Dn.idleRate); };
  const dayKst = (now) => new Date(now + 9 * 3600000).getUTCDay() === 0 ? 6 : new Date(now + 9 * 3600000).getUTCDay() - 1;   // 월=0 … 일=6 (KST)
  /** 초보자 미션(B11): 상태 {cleared, units:{id:{lv,skl,awk,promo,gear}}, pulls, dun, idle, dex} → 미션별 진행. 클라이언트·서버가 같은 식으로 판정한다. */
  const begMetric = (D, s, k) => { const ids = Object.keys(s.units || {}), vals = (f) => ids.map((id) => f(stOf(s.units[id]))); const mx = (f) => (ids.length ? Math.max(...vals(f)) : 0); switch (k) {
    case 'clear': return s.cleared || 0; case 'units': return ids.length; case 'recruit': return ids.filter((id) => (unitOf(D, id) || {}).route === 'recruit').length;
    case 'lv': return mx((x) => x.lv); case 'skl': return mx((x) => x.skl); case 'awk': return mx((x) => x.awk); case 'promo': return mx((x) => x.promo);
    case 'gear': return Math.max(0, ...vals((x) => (x.gear || []).reduce((a, b) => a + b, 0))); case 'pull': return s.pulls || 0; case 'dun': return s.dun || 0; case 'idle': return s.idle || 0; case 'dex': return s.dex || 0; case 'stars': return s.stars || 0; case 'event': return s.event || 0; case 'att': return s.att || 0; default: return 0; } };
  const beginner = (D, s) => (D.bal.beginner || []).map((m) => { const v = begMetric(D, s, m.k); return { id: m.id, t: m.t, need: m.n, got: Math.min(m.n, v), done: v >= m.n, gems: m.gems, gold: m.gold }; });
  const achievements = (D, s) => (D.bal.ach || []).map((a) => { const v = begMetric(D, s, a.k); return { id: a.id, name: a.name, t: a.t, need: a.n, got: Math.min(a.n, v), done: v >= a.n, title: a.title }; });
  /** 일일 임무·주간 상자(B22): counts = 오늘(KST) 장부 {kind: 횟수} → 임무별 진행. 주 키는 그 주 월요일(KST) 날짜. */
  const dailyList = (D, counts) => ((D.bal.daily || {}).missions || []).map((m) => { const v = m.kinds.reduce((a, k) => a + ((counts || {})[k] || 0), 0); return { id: m.id, t: m.t, need: m.n, got: Math.min(m.n, v), done: v >= m.n, gems: m.gems, gold: m.gold }; });
  const weekKey = (now) => { const d = new Date(now + 9 * 3600000), dow = (d.getUTCDay() + 6) % 7; return new Date(d.getTime() - dow * 86400000).toISOString().slice(0, 10); };
  const dayStartMs = (now) => Math.floor((now + 9 * 3600000) / 86400000) * 86400000 - 9 * 3600000;
  /** 주간 협동 보스(B26): 주 번호(월요일 기준, 0부터)로 이번 주 보스를 고르고, 그 사람의 진행(깬 단계)에 맞춘 합성 단계를 만든다. 보스는 한 사람이 쓰러뜨릴 수 없게 단단하다 — 점수는 파티가 쓰러지기 전까지 준 피해 */
  const wkIdx = (now) => { const d = new Date(now + 9 * 3600000), dow = (d.getUTCDay() + 6) % 7; return Math.floor((Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) - dow * 86400000) / 86400000 / 7); };
  const kb = (s) => (s <= 12 ? 1.0 + 0.047 * (Math.max(4, s) - 4) : s <= 36 ? 1.376 + 0.037 * (s - 12) : 1.376 + 0.037 * 24 + 0.012 * (s - 36));
  const weekBoss = (D, idx, cleared) => {
    const W = (D.bal && D.bal.wkboss) || { bosses: [], bossK: 8 }, bs = W.bosses || [], b = bs[((idx % bs.length) + bs.length) % bs.length]; if (!b) return null; const k = Math.round(kb(Math.max(1, cleared || 1)) * 1000) / 1000;
    return { idx, boss: b, stageDef: { id: 9000 + (((idx % bs.length) + bs.length) % bs.length), name: b.name, gold: 0, boss: false, enemies: [{ name: b.name, emoji: b.emoji, role: b.role, el: b.el, k: Math.round(k * (W.bossK || 8) * 100) / 100 }, { name: b.minion[0], emoji: b.minion[1], role: 'attacker', el: b.el, k }, { name: b.minion[0], emoji: b.minion[1], role: 'support', el: b.el, k }] } };
  };
  const attendDay = (D, n) => (D.bal.attend || [])[Math.min(n, (D.bal.attend || []).length) - 1] || null;
  /** 자동 편성(B12): 가진 동료 중 그 단계에 가장 세게 싸울 5명. 전투력(kOf) × 상성(적 속성을 이기는 속성 가산). 포섭 보스면 말을 걸 수 있는 속성 한 명을 꼭 넣는다. 클라이언트 추천용(서버는 편성만 검증). */
  const enemyEls = (st) => st.enemies.map((e) => e.el);
  const autoParty = (D, st, units) => {
    const ids = Object.keys(units || {}), en = enemyEls(st), score = (id) => kOf(D, id, units[id]) * (1 + 0.12 * en.filter((e) => B.BEATS[unitOf(D, id).el] === e).length / Math.max(1, en.length));
    const top = ids.sort((a, b) => score(b) - score(a)).slice(0, 5), bossEl = (st.enemies.find((e) => e.lock) || {}).el;
    if (st.recruit && bossEl && !top.some((id) => B.BEATS[unitOf(D, id).el] === bossEl)) { const c = ids.filter((id) => B.BEATS[unitOf(D, id).el] === bossEl && !top.includes(id)).sort((a, b) => score(b) - score(a))[0]; if (c) top[Math.min(4, top.length - 1)] = c; }
    return top;
  };
  /** 적 속성 미리보기: 속성별 적 수와, 그 적을 이기는 속성(추천) */
  const enemyPreview = (D, st) => { const cnt = {}; enemyEls(st).forEach((e) => { cnt[e] = (cnt[e] || 0) + 1; }); return Object.keys(cnt).map((e) => ({ el: e, n: cnt[e], beatenBy: Object.keys(D.el).find((x) => B.BEATS[x] === e) })); };
  /** 계절 이벤트(B9): 지금 달의 이벤트 · 3칸 무대(깬 단계에 맞춘 적에 철 테마 이름·그림) · 보상 */
  const eventNow = (D, month) => (D.bal.events || []).find((e) => e.months.includes(month)) || null;
  const eventStage = (D, ev, k, cleared) => {
    const s = Math.min(D.stages.length, Math.max(1, Math.round(Math.max(1, cleared) * ev.tiers[k]))), base = D.stages[s - 1];
    return { id: 3000 + ev.n * 10 + k, name: ev.names[k], gold: base.gold, enemies: base.enemies.map((e, i) => { const f = ev.foes[i % ev.foes.length]; return Object.assign({}, e, { k: Math.round(e.k * ev.kMul[k] * 1000) / 1000, lock: 0, name: f[0], emoji: f[1] }); }), event: true };
  };
  const eventReward = (D, ev, k, cleared, first) => { const st = eventStage(D, ev, k, cleared); return { gold: Math.round(st.gold * ev.goldMul[k] * (first ? 1 : 0.5)), gems: first ? ev.gems[k] : 0 }; };
  /** 다시 걷기(B29): 지금 철(KST) · 그 철의 규칙 · 다 깬 나라의 마지막 단계를 규칙대로 속성을 섞어 다시 걷는 무대 · 보상 · 전리품 색 변형 코드 */
  const walkSeason = (D, ms) => { const k = new Date(ms + 9 * 3600000), m = k.getUTCMonth() + 1, y = k.getUTCFullYear(), rules = D.bal.walk.rules, idx = rules.findIndex((r) => r.months.includes(m)); return { idx, key: (m <= 2 ? y - 1 : y) + ':' + idx, rule: rules[idx] }; };
  const walkNations = (cleared) => Math.floor(Math.max(0, cleared) / 12);
  const mixEl = (D, rule, e, i) => { const E = Object.keys(D.el), at = Math.max(0, E.indexOf(e)); return rule.mode === 'one' ? rule.el : E[(at + (rule.mode === 'alt' ? (i % 2 === 0 ? 1 : 2) : rule.by)) % E.length]; };
  const walkStage = (D, n, idx, cleared) => {
    const W = D.bal.walk, rule = W.rules[idx], base = D.stages[n * 12 - 1], nat = D.nations[n - 1];
    return { id: 4000 + n * 10 + idx, name: nat.name + ' ' + rule.name, gold: base.gold, walk: true, enemies: base.enemies.map((e, i) => Object.assign({}, e, { el: mixEl(D, rule, e.el, i), k: Math.round(e.k * W.kMul * 1000) / 1000, lock: 0 })) };
  };
  const walkReward = (D, n, cleared, first) => { const W = D.bal.walk, st = D.stages[n * 12 - 1]; return { gold: Math.round(st.gold * (first ? W.goldFirst : W.goldRepeat)) }; };
  const walkVariant = (n, idx) => 1 + ((idx + n) % 3);
  const b36 = (n) => n.toString(36).toUpperCase().padStart(2, '0'), chk6 = (a) => { let h = 7; for (const ch of a) h = (h * 31 + ch.charCodeAt(0)) % 1296; return b36(h); };
  /** 색 변형 코드: 가구 번호 2 + (변형 번호 섞은 값) 2 + 검사 2 — 우리 집 Room.variantDecode 와 같은 식(시험이 단언) */
  const walkCode = (no, v) => { const a = b36(no) + b36(1000 + 7 * v + (no % 7)); return a + chk6(a); };
  const walkDecode = (code) => { code = String(code || '').toUpperCase().replace(/[^0-9A-Z]/g, ''); if (code.length !== 6 || chk6(code.slice(0, 4)) !== code.slice(4)) return null; const n = parseInt(code.slice(0, 2), 36), p = parseInt(code.slice(2, 4), 36), v = (p - 1000 - (n % 7)) / 7; return Number.isInteger(v) && v >= 1 && v <= 3 && walkCode(n, v) === code ? { no: n, v } : null; };
  const walkLoot = (D, n) => (D.loot || []).find((x) => x.stage === n * 12) || null;
  return { walkSeason, walkNations, walkStage, walkReward, walkVariant, walkCode, walkDecode, walkLoot, wkIdx, weekBoss, dailyList, weekKey, dayStartMs, achievements, eventNow, eventStage, eventReward, autoParty, enemyPreview, beginner, attendDay, dungeonStage, dungeonReward, idleGold, dayKst, kOf, defOf, enemyDef, replay, reward, lvCap, upgrade, stOf, gradeOf, MAX_STEPS };
});
