// ⑪ 서버 게임 로직(WP2~3): 계정 생성·프로필·편성·레벨업·**서버 뽑기**. 규칙·확률표는 클라이언트와 같은 파일(data/expedition_slice.json · gacha-core.js)을 쓴다.
import SLICE from '../../data/expedition_slice.json' with { type: 'json' };
import gachaCore from '../../games/expedition/gacha-core.js';
import { interstitialRule, flag } from './shop.js';
import stageCore from '../../games/expedition/stage-core.js';
import { HttpError, csprng, sha256hex, signJwt, verifyJwt, randomToken, dayKst } from './lib.js';

export const D = SLICE, GC = gachaCore, SC = stageCore, ODDS_VER = 's1-2026-10-a', BANNER = 'main';
const UNIT = Object.fromEntries(D.units.map((u) => [u.id, u]));
export const STARTERS = D.units.filter((u) => u.route === 'start').map((u) => u.id);
const run = (db, sql, ...a) => db.prepare(sql).bind(...a);
const first = (db, sql, ...a) => db.prepare(sql).bind(...a).first();
const all = async (db, sql, ...a) => (await db.prepare(sql).bind(...a).all()).results || [];

/** 만 나이 → 연령 대역·월 결제 상한(D26/D27): 12 미만 가입 불가 · 12~13 결제 차단(상한 0) · 14~18 월 7만원 · 19+ 기본 20만원 */
export function ageBand(birthYm, now = Date.now()) {
  const m = /^(\d{4})-(\d{2})$/.exec(String(birthYm || '')); if (!m) throw new HttpError(400, 'bad_birth', 'birth_ym 은 YYYY-MM');
  const by = +m[1], bm = +m[2]; if (bm < 1 || bm > 12 || by < 1900) throw new HttpError(400, 'bad_birth'); const d = new Date(now); let age = d.getUTCFullYear() - by; if (d.getUTCMonth() + 1 < bm) age--; if (age < 0 || age > 110) throw new HttpError(400, 'bad_birth');
  if (age < 12) throw new HttpError(403, 'age_blocked', '만 12세 이상만 이용할 수 있어요');
  if (age < 14) return { band: '12_13', cap: 0, notice: true, age };
  if (age < 19) return { band: '14_18', cap: 70000, notice: true, age };
  return { band: '19p', cap: 200000, notice: false, age };
}

export async function createAccount(env, { id, deviceHash, birthYm, now = Date.now() }) {
  const a = ageBand(birthYm, now), db = env.DB, st = D.gacha.startGems;
  await db.batch([
    run(db, 'INSERT INTO accounts(id,created_at,birth_ym,age_band,guardian_notice_at,cap_krw) VALUES(?,?,?,?,?,?)', id, now, birthYm, a.band, a.notice ? now : null, a.cap),
    run(db, 'INSERT INTO wallet(account,free_gems,paid_gems,gold,ver) VALUES(?,?,0,0,0)', id, st),
    run(db, "INSERT INTO ledger(account,ts,kind,d_free,reason,ref) VALUES(?,?,'grant',?,'start','start')", id, now, st),
    ...STARTERS.map((u) => run(db, 'INSERT INTO units(account,unit_id,lv,dups) VALUES(?,?,1,0)', id, u)),
    run(db, 'INSERT INTO progress(account,cleared,stars,party,flags) VALUES(?,0,?,?,?)', id, '{}', JSON.stringify(STARTERS), '{}'),
    run(db, 'INSERT INTO pity(account,banner,since5,since4,guard,pulls) VALUES(?,?,0,0,0,0)', id, BANNER),
  ]); return a;
}

export async function profile(env, account, now = Date.now()) {
  const db = env.DB, [acc, w, units, pr, py] = await Promise.all([first(db, 'SELECT age_band,cap_krw,guardian_notice_at,has_paid,no_inter,created_at FROM accounts WHERE id=?', account), first(db, 'SELECT free_gems,paid_gems,gold,tickets,ver FROM wallet WHERE account=?', account), all(db, 'SELECT unit_id,lv,dups,skl,awk,promo,gear FROM units WHERE account=?', account), first(db, 'SELECT cleared,stars,party,flags FROM progress WHERE account=?', account), first(db, 'SELECT since5,since4,guard,pulls FROM pity WHERE account=? AND banner=?', account, BANNER)]), pRows = await all(db, 'SELECT banner,since5,since4,guard,pulls FROM pity WHERE account=?', account);
  if (!acc) throw new HttpError(404, 'no_account');
  return { account, age_band: acc.age_band, cap_krw: acc.cap_krw, guardian_notice: !!acc.guardian_notice_at, wallet: { free_gems: w.free_gems, paid_gems: w.paid_gems, gold: w.gold, tickets: w.tickets }, has_paid: !!acc.has_paid, no_inter: !!acc.no_inter, ads: interstitialRule(acc, now), units: Object.fromEntries(units.map((u) => [u.unit_id, { lv: u.lv, dups: u.dups, skl: u.skl, awk: u.awk, promo: u.promo, gear: JSON.parse(u.gear) }])), progress: { cleared: pr.cleared, stars: JSON.parse(pr.stars), party: JSON.parse(pr.party), flags: JSON.parse(pr.flags) }, pity: { since5: py.since5, since4: py.since4, guard: !!py.guard, pulls: py.pulls }, pities: Object.fromEntries(D.gacha.banners.map((b) => { const r = pRows.find((x) => x.banner === b.id) || { since5: 0, since4: 0, guard: 0, pulls: 0 }; return [b.id, { since5: r.since5, since4: r.since4, guard: !!r.guard, pulls: r.pulls }]; })), odds_ver: ODDS_VER };
}

export async function setParty(env, account, party) {
  if (!Array.isArray(party) || party.length !== 5 || new Set(party).size !== 5) throw new HttpError(400, 'bad_party', '편성은 서로 다른 5명');
  const have = new Set((await all(env.DB, 'SELECT unit_id FROM units WHERE account=?', account)).map((r) => r.unit_id)); if (!party.every((u) => have.has(u))) throw new HttpError(409, 'not_owned', '가지지 않은 동료가 있어요');
  await run(env.DB, 'UPDATE progress SET party=? WHERE account=?', JSON.stringify(party), account).run(); return { party };
}

export const levelCost = (lv) => Math.round(D.bal.costBase * Math.pow(D.bal.costGrow, lv - 1));
export async function levelUp(env, account, unitId, requestId, now = Date.now()) {
  const db = env.DB; if (!UNIT[unitId]) throw new HttpError(400, 'bad_unit');
  const done = await first(db, "SELECT 1 AS x FROM ledger WHERE account=? AND kind='levelup' AND ref=?", account, requestId); if (done) return { ok: true, replay: true, ...(await walletUnit(db, account, unitId)) };
  const u = await first(db, 'SELECT lv FROM units WHERE account=? AND unit_id=?', account, unitId); if (!u) throw new HttpError(409, 'not_owned'); const cl = await first(db, 'SELECT cleared FROM progress WHERE account=?', account); if (u.lv >= SC.lvCap(D, cl.cleared)) throw new HttpError(409, 'max_level');
  const w = await first(db, 'SELECT gold,ver FROM wallet WHERE account=?', account), c = levelCost(u.lv); if (w.gold < c) throw new HttpError(402, 'insufficient_gold');
  const guard = '(SELECT last_req FROM wallet WHERE account=?)=?';   // 내 요청의 지갑 갱신이 적용됐을 때만 나머지를 반영
  const res = await db.batch([
    run(db, 'UPDATE wallet SET gold=gold-?, ver=ver+1, last_req=? WHERE account=? AND ver=? AND gold>=?', c, requestId, account, w.ver, c),
    run(db, `UPDATE units SET lv=lv+1 WHERE account=? AND unit_id=? AND ${guard}`, account, unitId, account, requestId),
    run(db, `INSERT INTO ledger(account,ts,kind,d_gold,reason,ref) SELECT ?,?,'levelup',?,?,? WHERE ${guard}`, account, now, -c, unitId, requestId, account, requestId),
  ]); if (!(res[0].meta.changes === 1)) throw new HttpError(409, 'conflict', '동시에 바뀌었어요. 다시 해 주세요'); return { ok: true, ...(await walletUnit(db, account, unitId)) };
}
async function walletUnit(db, account, unitId) { const w = await first(db, 'SELECT free_gems,paid_gems,gold FROM wallet WHERE account=?', account), u = await first(db, 'SELECT lv FROM units WHERE account=? AND unit_id=?', account, unitId); return { wallet: w, unit: { id: unitId, lv: u.lv } }; }

/** 서버 뽑기: 재화 확인(무상 먼저) → 천장 읽기 → CSPRNG 판정 → 한 트랜잭션(낙관적 잠금)으로 반영 + 로그. 같은 request_id 는 같은 응답. */
export async function gachaPull(env, account, { banner = BANNER, n, requestId }, now = Date.now(), rand = csprng) {
  const db = env.DB; if (n !== 1 && n !== 10) throw new HttpError(400, 'bad_n', 'n 은 1 또는 10'); if (!GC.bannerOf(D.gacha, banner)) throw new HttpError(400, 'bad_banner'); if (!requestId) throw new HttpError(400, 'no_request_id');
  const prev = await first(db, 'SELECT response FROM gacha_log WHERE request_id=?', requestId); if (prev) return { ...JSON.parse(prev.response), replay: true };
  const G = D.gacha, price = GC.price(G, n), w = await first(db, 'SELECT free_gems,paid_gems,gold,ver FROM wallet WHERE account=?', account); if (w.paid_gems < 0) throw new HttpError(402, 'negative_balance', '환불로 모자란 유료 반짝석을 다음 결제로 채울 때까지 쓸 수 없어요'); if (w.free_gems + w.paid_gems < price) throw new HttpError(402, 'insufficient_gems', '반짝석이 모자라요');
  let py = await first(db, 'SELECT since5,since4,guard,pulls FROM pity WHERE account=? AND banner=?', account, banner); if (!py) { await run(db, 'INSERT OR IGNORE INTO pity(account,banner,since5,since4,guard,pulls) VALUES(?,?,0,0,0,0)', account, banner).run(); py = { since5: 0, since4: 0, guard: 0, pulls: 0 }; }      // 새 배너는 처음 뽑을 때 천장 카운터를 만든다(배너마다 따로)
  const P = { since5: py.since5, since4: py.since4, guard: py.guard };
  const owned = new Set((await all(db, 'SELECT unit_id FROM units WHERE account=?', account)).map((r) => r.unit_id)), results = [], fragAdd = {}, newUnits = [];
  for (let i = 0; i < n; i++) { const r = GC.pullOnce(G, D.units, P, rand, banner), isNew = !owned.has(r.id); if (isNew) { owned.add(r.id); newUnits.push(r.id); } const frag = isNew ? 0 : GC.dupFrag(r.grade); if (frag) fragAdd[r.id] = (fragAdd[r.id] || 0) + frag; results.push({ unit: r.id, grade: r.grade, isNew, dupFrag: frag }); }
  const useFree = Math.min(w.free_gems, price), usePaid = price - useFree, nf = w.free_gems - useFree, np = w.paid_gems - usePaid;
  const response = { results, wallet: { free_gems: nf, paid_gems: np, gold: w.gold }, pity: { since5: P.since5, since4: P.since4, guard: !!P.guard, pulls: py.pulls + n }, odds_ver: ODDS_VER, banner, n };
  const guard = '(SELECT last_req FROM wallet WHERE account=?)=?', g = [account, requestId];
  let res; try {
    res = await db.batch([
      run(db, 'UPDATE wallet SET free_gems=?, paid_gems=?, ver=ver+1, last_req=? WHERE account=? AND ver=?', nf, np, requestId, account, w.ver),
      run(db, `INSERT INTO gacha_log(account,ts,banner,n,results,response,odds_ver,rng_ref,request_id) SELECT ?,?,?,?,?,?,?,?,? WHERE ${guard}`, account, now, banner, n, JSON.stringify(results), JSON.stringify(response), ODDS_VER, await sha256hex(account + ':' + requestId + ':' + now), requestId, ...g),
      run(db, `UPDATE pity SET since5=?, since4=?, guard=?, pulls=pulls+? WHERE account=? AND banner=? AND ${guard}`, P.since5, P.since4, P.guard, n, account, banner, ...g),
      run(db, `INSERT INTO ledger(account,ts,kind,d_free,d_paid,reason,ref) SELECT ?,?,'gacha',?,?,?,? WHERE ${guard}`, account, now, -useFree, -usePaid, banner + ':' + n, requestId, ...g),
      ...newUnits.map((id) => run(db, `INSERT INTO units(account,unit_id,lv,dups) SELECT ?,?,1,0 WHERE ${guard}`, account, id, ...g)),
      ...Object.entries(fragAdd).map(([id, f]) => run(db, `UPDATE units SET dups=dups+? WHERE account=? AND unit_id=? AND ${guard}`, f, account, id, ...g)),
    ]);
  } catch (e) { const dup = await first(db, 'SELECT response FROM gacha_log WHERE request_id=?', requestId); if (dup) return { ...JSON.parse(dup.response), replay: true }; throw e; }
  if (res[0].meta.changes !== 1) throw new HttpError(409, 'conflict', '동시에 바뀌었어요. 다시 해 주세요'); return response;
}

export const oddsTable = (banner) => { const b = GC.bannerOf(D.gacha, banner || BANNER); if (!b) throw new HttpError(400, 'bad_banner'); return { ...GC.odds(D.gacha, D.units, b.id), odds_ver: ODDS_VER, banner: b.id, banner_name: b.name, cost: D.gacha.cost, ten: D.gacha.ten }; };

export async function deleteAccount(env, account) {
  const db = env.DB; await db.batch(['units', 'progress', 'pity', 'wallet', 'ledger', 'gacha_log', 'tokens', 'requests', 'spend_month', 'ad_claims', 'flags'].map((t) => run(db, `DELETE FROM ${t} WHERE account=?`, account)).concat([run(db, "UPDATE accounts SET status='deleted', birth_ym=NULL WHERE id=?", account)])); return { ok: true, note: '결제 기록은 법정 보존 기간 동안 남아요' };
}

/** ---- WP4: 전투 판정. 시드·파티는 서버가 정해 서명 토큰(stage-start)으로 주고, 클리어 때 같은 입력으로 battle-core 를 다시 돌려 승패·별·보상을 정한다. ---- */
const STAGE_TTL = 3600;
export async function stageStart(env, account, stageId, now = Date.now(), secret = env.JWT_SECRET) {
  const st = D.stages.find((x) => x.id === stageId); if (!st) throw new HttpError(400, 'bad_stage');
  const pr = await first(env.DB, 'SELECT cleared,party FROM progress WHERE account=?', account); if (stageId > pr.cleared + 1) throw new HttpError(409, 'stage_locked', '앞 단계를 먼저 깨야 해요');
  const party = JSON.parse(pr.party), lv = Object.fromEntries((await all(env.DB, 'SELECT unit_id,lv,skl,awk,promo,gear FROM units WHERE account=?', account)).map((r) => [r.unit_id, { lv: r.lv, skl: r.skl, awk: r.awk, promo: r.promo, gear: JSON.parse(r.gear) }]));
  if (party.length !== 5 || !party.every((id) => lv[id])) throw new HttpError(409, 'bad_party');
  const seed = Math.floor(csprng() * 4294967296), nonce = randomToken(12), snap = party.map((id) => ({ id, ...lv[id] }));
  const token = await signJwt({ typ: 'stage', sub: account, stage: stageId, seed, party: snap, nonce, exp: Math.floor(now / 1000) + STAGE_TTL }, secret);
  return { token, stage: stageId, seed, party: snap, nonce };
}
export async function stageClear(env, account, { token, inputs, auto, requestId }, now = Date.now()) {
  const db = env.DB, t = await verifyJwt(String(token || ''), env.JWT_SECRET, now); if (t.typ !== 'stage' || t.sub !== account) throw new HttpError(403, 'bad_stage_token');
  const replayOf = async () => { const l = await first(db, "SELECT reason FROM ledger WHERE account=? AND kind='stage' AND ref=?", account, 'stage:' + t.nonce); return l && l.reason && l.reason.includes('|') ? { ...JSON.parse(l.reason.slice(l.reason.indexOf('|') + 1)), replay: true } : null; };      // 같은 토큰 재전송: 장부 한 줄에 응답을 같이 적어 두고(요청 기록 행을 따로 쓰지 않음, B19) 그대로 돌려준다
  const prev = await replayOf(); if (prev) return prev;
  const out = SC.replay(D, { stage: t.stage, seed: t.seed, party: t.party, auto: auto !== false, inputs }); if (out.error) { await flag(env, account, 'bad_replay', out.error + ':s' + t.stage, now); throw new HttpError(422, out.error, '전투 기록이 맞지 않아요'); }
  const st = D.stages.find((x) => x.id === t.stage);
  if (!out.win) { const body = { win: false, stars: 0, steps: out.steps, hash: out.hash }; return body; }   // 졌을 때는 기록하지 않는다(벌 없음). 같은 토큰으로 다시 시도할 수 있다
  const w = await first(db, 'SELECT free_gems,paid_gems,gold,ver FROM wallet WHERE account=?', account), pr = await first(db, 'SELECT cleared,stars,flags FROM progress WHERE account=?', account);
  const owned = new Set((await all(db, 'SELECT unit_id FROM units WHERE account=?', account)).map((r) => r.unit_id)), firstClear = pr.cleared < st.id, rw = SC.reward(D, st, firstClear), stars = JSON.parse(pr.stars), flags = JSON.parse(pr.flags);
  stars[st.id] = Math.max(stars[st.id] || 0, out.stars); const newUnits = []; if (st.join && firstClear && !owned.has(st.join)) newUnits.push(st.join); if (out.recruited && st.recruit && !owned.has(st.recruit)) { newUnits.push(st.recruit); flags.recruited = 1; }
  const body = { win: true, stars: out.stars, recruited: out.recruited, first: firstClear, reward: rw, joined: newUnits, steps: out.steps, hash: out.hash };
  const guard = '(SELECT last_req FROM wallet WHERE account=?)=?', g = [account, 'stage:' + t.nonce]; let res;
  try {
    res = await db.batch([
      run(db, 'UPDATE wallet SET free_gems=free_gems+?, gold=gold+?, ver=ver+1, last_req=? WHERE account=? AND ver=?', rw.gems, rw.gold, 'stage:' + t.nonce, account, w.ver),
      run(db, `UPDATE progress SET cleared=MAX(cleared,?), stars=?, flags=? WHERE account=? AND ${guard}`, st.id, JSON.stringify(stars), JSON.stringify(flags), account, ...g),
      run(db, `INSERT INTO ledger(account,ts,kind,d_free,d_gold,reason,ref) SELECT ?,?,'stage',?,?,?,? WHERE ${guard}`, account, now, rw.gems, rw.gold, 'stage' + st.id + (firstClear ? ':first' : '') + '|' + JSON.stringify(body), 'stage:' + t.nonce, ...g),
      ...newUnits.map((id) => run(db, `INSERT INTO units(account,unit_id,lv,dups) SELECT ?,?,1,0 WHERE ${guard}`, account, id, ...g)),
    ]);
  } catch (e) { const dup = await replayOf(); if (dup) return dup; throw e; }
  if (res[0].meta.changes !== 1) throw new HttpError(409, 'conflict', '동시에 바뀌었어요. 다시 해 주세요'); return body;
}

/** 육성(B2): 스킬 레벨·각성·등급 승급·장비 강화. 규칙은 stage-core.upgrade — 금화는 지갑, 조각(dups)은 유닛에서 쓴다. 멱등(request_id). */
export async function upgradeUnit(env, account, { unit, kind, slot, requestId }, now = Date.now()) {
  const db = env.DB; if (!UNIT[unit]) throw new HttpError(400, 'bad_unit'); if (!requestId) throw new HttpError(400, 'no_request_id');
  const done = await first(db, "SELECT 1 AS x FROM ledger WHERE account=? AND kind='upgrade' AND ref=?", account, requestId); if (done) return { ok: true, replay: true, ...(await unitView(db, account, unit)) };
  const u = await first(db, 'SELECT lv,dups,skl,awk,promo,gear FROM units WHERE account=? AND unit_id=?', account, unit); if (!u) throw new HttpError(409, 'not_owned');
  const w = await first(db, 'SELECT gold,ver FROM wallet WHERE account=?', account), r = SC.upgrade(D, unit, { lv: u.lv, skl: u.skl, awk: u.awk, promo: u.promo, gear: JSON.parse(u.gear) }, kind, slot, { gold: w.gold, dups: u.dups });
  if (r.error) throw new HttpError(r.error === 'insufficient_gold' || r.error === 'insufficient_dups' ? 402 : 409, r.error, r.need ? '레벨 ' + r.need + ' 이상이어야 해요' : undefined);
  const guard = '(SELECT last_req FROM wallet WHERE account=?)=?', g = [account, requestId];
  const res = await db.batch([
    run(db, 'UPDATE wallet SET gold=gold-?, ver=ver+1, last_req=? WHERE account=? AND ver=? AND gold>=?', r.gold, requestId, account, w.ver, r.gold),
    run(db, `UPDATE units SET skl=?, awk=?, promo=?, gear=?, dups=dups-? WHERE account=? AND unit_id=? AND dups>=? AND ${guard}`, r.st.skl, r.st.awk, r.st.promo, JSON.stringify(r.st.gear), r.dups, account, unit, r.dups, ...g),
    run(db, `INSERT INTO ledger(account,ts,kind,d_gold,reason,ref) SELECT ?,?,'upgrade',?,?,? WHERE ${guard}`, account, now, -r.gold, unit + ':' + kind + (slot != null ? slot : '') + ':d' + r.dups, requestId, ...g),
  ]); if (res[0].meta.changes !== 1 || res[1].meta.changes !== 1) throw new HttpError(409, 'conflict', '동시에 바뀌었어요. 다시 해 주세요');
  return { ok: true, ...(await unitView(db, account, unit)) };
}
async function unitView(db, account, unit) { const w = await first(db, 'SELECT free_gems,paid_gems,gold FROM wallet WHERE account=?', account), u = await first(db, 'SELECT lv,dups,skl,awk,promo,gear FROM units WHERE account=? AND unit_id=?', account, unit); return { wallet: w, unit: { id: unit, lv: u.lv, dups: u.dups, skl: u.skl, awk: u.awk, promo: u.promo, gear: JSON.parse(u.gear) } }; }

/** ---- B3: 요일 던전 · 방치 정찰 ---- */
const Dn = D.dungeon;
export async function dungeonInfo(env, account, now = Date.now()) {
  const pr = await first(env.DB, 'SELECT cleared FROM progress WHERE account=?', account), day = SC.dayKst(now), r = await first(env.DB, 'SELECT n FROM dungeon_runs WHERE account=? AND day=?', account, dayKst(now));
  return { unlocked: pr.cleared >= Dn.unlock, unlock: Dn.unlock, day, name: Dn.days[day].name, kind: Dn.days[day].kind, el: Dn.days[day].el || null, left: Math.max(0, Dn.perDay - (r ? r.n : 0)), perDay: Dn.perDay, tiers: Dn.tiers.map((_, t) => ({ tier: t, name: Dn.tierNames[t], reward: SC.dungeonReward(D, day, t, pr.cleared) })) };
}
export async function dungeonStart(env, account, tier, now = Date.now()) {
  const info = await dungeonInfo(env, account, now); if (!info.unlocked) throw new HttpError(409, 'dungeon_locked', '3단계를 깨면 열려요'); if (!(tier >= 0 && tier < Dn.tiers.length)) throw new HttpError(400, 'bad_tier'); if (info.left <= 0) throw new HttpError(409, 'no_runs_left', '오늘은 다 했어요');
  const pr = await first(env.DB, 'SELECT cleared,party FROM progress WHERE account=?', account), party = JSON.parse(pr.party), lv = Object.fromEntries((await all(env.DB, 'SELECT unit_id,lv,skl,awk,promo,gear FROM units WHERE account=?', account)).map((r) => [r.unit_id, { lv: r.lv, skl: r.skl, awk: r.awk, promo: r.promo, gear: JSON.parse(r.gear) }]));
  if (party.length !== 5 || !party.every((id) => lv[id])) throw new HttpError(409, 'bad_party'); const seed = Math.floor(csprng() * 4294967296), nonce = randomToken(12), snap = party.map((id) => ({ id, ...lv[id] }));
  const token = await signJwt({ typ: 'dun', sub: account, day: info.day, tier, cleared: pr.cleared, seed, party: snap, nonce, exp: Math.floor(now / 1000) + 3600 }, env.JWT_SECRET);
  return { token, day: info.day, tier, seed, party: snap, nonce, stage: SC.dungeonStage(D, info.day, tier, pr.cleared) };
}
export async function dungeonClear(env, account, { token, inputs, auto, target }, now = Date.now()) {
  const db = env.DB, t = await verifyJwt(String(token || ''), env.JWT_SECRET, now); if (t.typ !== 'dun' || t.sub !== account) throw new HttpError(403, 'bad_dungeon_token');
  const prev = await first(db, 'SELECT body FROM requests WHERE request_id=?', 'dun:' + t.nonce); if (prev) return { ...JSON.parse(prev.body), replay: true };
  const info = await dungeonInfo(env, account, now); if (t.day !== info.day) throw new HttpError(410, 'day_changed', '요일이 바뀌었어요'); if (info.left <= 0) throw new HttpError(409, 'no_runs_left', '오늘은 다 했어요');
  const stageDef = SC.dungeonStage(D, t.day, t.tier, t.cleared), out = SC.replay(D, { stage: stageDef.id, stageDef, seed: t.seed, party: t.party, auto: auto !== false, inputs }); if (out.error) { await flag(env, account, 'bad_replay', 'dungeon:' + out.error, now); throw new HttpError(422, out.error, '전투 기록이 맞지 않아요'); }
  if (!out.win) return { win: false, steps: out.steps };
  const rw = SC.dungeonReward(D, t.day, t.tier, t.cleared); let tu = null;
  if (rw.frag) { if (!target) throw new HttpError(400, 'need_target', '조각을 받을 친구를 골라요'); tu = await first(db, 'SELECT unit_id FROM units WHERE account=? AND unit_id=?', account, target); if (!tu) throw new HttpError(409, 'not_owned'); const ue = UNIT[target].el; if (rw.el && rw.el !== 'any' && ue !== rw.el) throw new HttpError(409, 'wrong_element', '오늘은 ' + D.el[rw.el].name + ' 친구만 받아요'); }
  const w = await first(db, 'SELECT ver FROM wallet WHERE account=?', account), tag = 'dun:' + t.nonce, guard = '(SELECT last_req FROM wallet WHERE account=?)=?', g = [account, tag], body = { win: true, reward: { gold: rw.gold, frag: rw.frag, target: rw.frag ? target : null }, left: info.left - 1, steps: out.steps };
  let res; try {
    res = await db.batch([
      run(db, 'UPDATE wallet SET gold=gold+?, ver=ver+1, last_req=? WHERE account=? AND ver=?', rw.gold, tag, account, w.ver),
      run(db, `INSERT INTO requests(request_id,account,route,status,body,ts) SELECT ?,?,?,?,?,? WHERE ${guard}`, tag, account, '/dungeon/clear', 200, JSON.stringify(body), now, ...g),
      run(db, `INSERT INTO dungeon_runs(account,day,n) SELECT ?,?,1 WHERE ${guard} ON CONFLICT(account,day) DO UPDATE SET n=n+1`, account, dayKst(now), ...g),
      run(db, `INSERT INTO ledger(account,ts,kind,d_gold,reason,ref) SELECT ?,?,'dungeon',?,?,? WHERE ${guard}`, account, now, rw.gold, 'day' + t.day + ':t' + t.tier + (rw.frag ? ':f' + rw.frag : ''), tag, ...g),
      ...(rw.frag ? [run(db, `UPDATE units SET dups=dups+? WHERE account=? AND unit_id=? AND ${guard}`, rw.frag, account, target, ...g)] : []),
    ]);
  } catch (e) { const dup = await first(db, 'SELECT body FROM requests WHERE request_id=?', tag); if (dup) return { ...JSON.parse(dup.body), replay: true }; throw e; }
  if (res[0].meta.changes !== 1) throw new HttpError(409, 'conflict', '동시에 바뀌었어요. 다시 해 주세요'); return body;
}
/** 방치 정찰: 마지막 수령 뒤 흐른 시간(최대 8시간)만큼 금화. 처음 부르면 시계만 시작한다. */
export async function idleClaim(env, account, requestId, now = Date.now()) {
  const db = env.DB; if (!requestId) throw new HttpError(400, 'no_request_id'); const done = await first(db, "SELECT d_gold FROM ledger WHERE account=? AND kind='idle' AND ref=?", account, requestId); if (done) return { ok: true, replay: true, gold: done.d_gold };
  const pr = await first(db, 'SELECT cleared,idle_ts FROM progress WHERE account=?', account);
  if (!pr.idle_ts) { await run(db, 'UPDATE progress SET idle_ts=? WHERE account=?', now, account).run(); return { ok: true, gold: 0, started: true, capH: Dn.idleCapH }; }
  const gold = SC.idleGold(D, pr.cleared, now - pr.idle_ts); if (!gold) return { ok: true, gold: 0, waitMin: Math.ceil(Math.max(0, Dn.idleMinMin * 60000 - (now - pr.idle_ts)) / 60000), capH: Dn.idleCapH };
  const w = await first(db, 'SELECT ver FROM wallet WHERE account=?', account), guard = '(SELECT last_req FROM wallet WHERE account=?)=?', g = [account, requestId];
  const res = await db.batch([
    run(db, 'UPDATE wallet SET gold=gold+?, ver=ver+1, last_req=? WHERE account=? AND ver=?', gold, requestId, account, w.ver),
    run(db, `UPDATE progress SET idle_ts=? WHERE account=? AND idle_ts=? AND ${guard}`, now, account, pr.idle_ts, ...g),
    run(db, `INSERT INTO ledger(account,ts,kind,d_gold,reason,ref) SELECT ?,?,'idle',?,'scout',? WHERE ${guard}`, account, now, gold, requestId, ...g),
  ]); if (res[0].meta.changes !== 1 || res[1].meta.changes !== 1) throw new HttpError(409, 'conflict'); return { ok: true, gold, capH: Dn.idleCapH };
}

/** 도감 수집 보상(B5): 모은 동료 수가 문턱 이상이면 반짝석을 한 번씩. 받은 문턱은 progress.flags.dex 에 기록(멱등). */
export async function dexClaim(env, account, n, now = Date.now()) {
  const db = env.DB, m = (D.bal.dex || []).find((x) => x.n === n); if (!m) throw new HttpError(400, 'bad_milestone');
  const cnt = (await first(db, 'SELECT COUNT(*) AS c FROM units WHERE account=?', account)).c; if (cnt < m.n) throw new HttpError(409, 'not_yet', '동료를 더 모아요 (' + cnt + '/' + m.n + ')');
  const pr = await first(db, 'SELECT flags FROM progress WHERE account=?', account), flags = JSON.parse(pr.flags), got = flags.dex || []; if (got.includes(n)) return { ok: true, replay: true, ...(await walletView(db, account)) };
  flags.dex = got.concat(n); const w = await first(db, 'SELECT ver FROM wallet WHERE account=?', account), tag = 'dex:' + n, guard = '(SELECT last_req FROM wallet WHERE account=?)=?', g = [account, tag];
  const res = await db.batch([
    run(db, 'UPDATE wallet SET free_gems=free_gems+?, ver=ver+1, last_req=? WHERE account=? AND ver=?', m.gems, tag, account, w.ver),
    run(db, `UPDATE progress SET flags=? WHERE account=? AND ${guard}`, JSON.stringify(flags), account, ...g),
    run(db, `INSERT INTO ledger(account,ts,kind,d_free,reason,ref) SELECT ?,?,'dex',?,?,? WHERE ${guard}`, account, now, m.gems, 'dex' + n, tag, ...g),
  ]); if (res[0].meta.changes !== 1) throw new HttpError(409, 'conflict'); return { ok: true, gems: m.gems, ...(await walletView(db, account)) };
}
/** 계절 이벤트(B14): 서버가 철(KST 달)·순서·첫 클리어를 판정. 시작에 토큰(시드·파티 스냅샷), 끝에 같은 코어로 전투를 다시 돌려 이기면 보상(첫 클리어 반짝석+금화, 다시는 금화 절반, 멱등). */
const kstMonth = (now) => new Date(now + 9 * 3600000).getUTCMonth() + 1;
export async function eventInfo(env, account, now = Date.now()) {
  const pr = await first(env.DB, 'SELECT flags FROM progress WHERE account=?', account), got = (JSON.parse(pr.flags).ev || {}), ev = SC.eventNow(D, kstMonth(now));
  return { month: kstMonth(now), event: ev ? { id: ev.id, name: ev.name, icon: ev.icon, names: ev.names, gems: ev.gems, cleared: got[ev.id] || [] } : null };
}
export async function eventStart(env, account, evId, k, now = Date.now()) {
  const db = env.DB, ev = (D.bal.events || []).find((e) => e.id === evId); if (!ev) throw new HttpError(400, 'bad_event'); if (!ev.months.includes(kstMonth(now))) throw new HttpError(409, 'event_closed', '지금 철의 이벤트가 아니에요'); if (!(Number.isInteger(k) && k >= 0 && k < ev.names.length)) throw new HttpError(400, 'bad_stage');
  const pr = await first(db, 'SELECT cleared,party,flags FROM progress WHERE account=?', account), got = (JSON.parse(pr.flags).ev || {})[ev.id] || []; if (k > 0 && !got.includes(k - 1)) throw new HttpError(409, 'locked', '앞 칸을 먼저 깨요');
  const party = JSON.parse(pr.party), lv = Object.fromEntries((await all(db, 'SELECT unit_id,lv,skl,awk,promo,gear FROM units WHERE account=?', account)).map((r) => [r.unit_id, { lv: r.lv, skl: r.skl, awk: r.awk, promo: r.promo, gear: JSON.parse(r.gear) }]));
  if (party.length !== 5 || !party.every((id) => lv[id])) throw new HttpError(409, 'bad_party'); const seed = Math.floor(csprng() * 4294967296), nonce = randomToken(12), snap = party.map((id) => ({ id, ...lv[id] }));
  const token = await signJwt({ typ: 'evt', sub: account, ev: ev.id, k, cleared: pr.cleared, seed, party: snap, nonce, exp: Math.floor(now / 1000) + 3600 }, env.JWT_SECRET);
  return { token, ev: ev.id, k, seed, party: snap, nonce, stage: SC.eventStage(D, ev, k, pr.cleared) };
}
export async function eventClear(env, account, { token, inputs, auto }, now = Date.now()) {
  const db = env.DB, t = await verifyJwt(String(token || ''), env.JWT_SECRET, now); if (t.typ !== 'evt' || t.sub !== account) throw new HttpError(403, 'bad_event_token');
  const prev = await first(db, 'SELECT body FROM requests WHERE request_id=?', 'evt:' + t.nonce); if (prev) return { ...JSON.parse(prev.body), replay: true };
  const ev = (D.bal.events || []).find((e) => e.id === t.ev); if (!ev || !ev.months.includes(kstMonth(now))) throw new HttpError(410, 'event_closed', '이벤트가 끝났어요');
  const stageDef = SC.eventStage(D, ev, t.k, t.cleared), out = SC.replay(D, { stage: stageDef.id, stageDef, seed: t.seed, party: t.party, auto: auto !== false, inputs }); if (out.error) { await flag(env, account, 'bad_replay', 'event:' + out.error, now); throw new HttpError(422, out.error, '전투 기록이 맞지 않아요'); }
  if (!out.win) return { win: false, steps: out.steps };
  const pr = await first(db, 'SELECT flags FROM progress WHERE account=?', account), flags = JSON.parse(pr.flags); flags.ev = flags.ev || {}; const got = (flags.ev[ev.id] = flags.ev[ev.id] || []), first1 = !got.includes(t.k), rw = SC.eventReward(D, ev, t.k, t.cleared, first1); if (first1) got.push(t.k);
  const w = await first(db, 'SELECT ver FROM wallet WHERE account=?', account), tag = 'evt:' + t.nonce, guard = '(SELECT last_req FROM wallet WHERE account=?)=?', g = [account, tag], body = { win: true, first: first1, reward: { gold: rw.gold, gems: rw.gems }, cleared: got.slice(), steps: out.steps };
  let res; try {
    res = await db.batch([
      run(db, 'UPDATE wallet SET gold=gold+?, free_gems=free_gems+?, ver=ver+1, last_req=? WHERE account=? AND ver=?', rw.gold, rw.gems, tag, account, w.ver),
      run(db, `INSERT INTO requests(request_id,account,route,status,body,ts) SELECT ?,?,?,?,?,? WHERE ${guard}`, tag, account, '/event/clear', 200, JSON.stringify(body), now, ...g),
      run(db, `UPDATE progress SET flags=? WHERE account=? AND ${guard}`, JSON.stringify(flags), account, ...g),
      run(db, `INSERT INTO ledger(account,ts,kind,d_free,d_gold,reason,ref) SELECT ?,?,'event',?,?,?,? WHERE ${guard}`, account, now, rw.gems, rw.gold, ev.id + ':' + t.k + (first1 ? ':first' : ''), tag, ...g),
    ]);
  } catch (e) { const dup = await first(db, 'SELECT body FROM requests WHERE request_id=?', tag); if (dup) return { ...JSON.parse(dup.body), replay: true }; throw e; }
  if (res[0].meta.changes !== 1) throw new HttpError(409, 'conflict', '동시에 바뀌었어요. 다시 해 주세요'); return body;
}
/** 주간 협동 보스(B26): 모두의 피해를 서버가 합산(순위 없음). 시작에 토큰(시드·파티 스냅샷), 끝에 같은 코어로 전투를 다시 돌려 피해량을 정한다. 하루 tries 번(원자적), 같은 토큰은 한 번만. 참여만 해도 보상, 합계가 단계에 닿으면 모두에게 추가 보상(받기는 멱등). */
const WKCAP = 100000;      // 한 번에 인정하는 최대 피해(이상 값 방어)
async function wkState(db, account, now) {
  const idx = SC.wkIdx(now), week = String(idx), W = D.bal.wkboss, [pt, tt, pr] = await Promise.all([first(db, 'SELECT dmg,tries,day,dtries,claim FROM wkboss_part WHERE week=? AND account=?', week, account), first(db, 'SELECT total FROM wkboss WHERE week=?', week), first(db, 'SELECT cleared FROM progress WHERE account=?', account)]);
  const today = kstDate(now), mine = pt ? { dmg: pt.dmg, tries: pt.tries, left: Math.max(0, W.tries - (pt.day === today ? pt.dtries : 0)), claim: JSON.parse(pt.claim || '{}') } : { dmg: 0, tries: 0, left: W.tries, claim: {} };
  return { idx, week, W, total: tt ? tt.total : 0, mine, cleared: pr ? pr.cleared : 1, today };
}
const wkClaimable = (W, st) => { const c = st.mine.claim || {}, t = c.t || [0, 0, 0], out = { gems: 0, gold: 0, part: false, tiers: [] }; if (st.mine.tries >= 1 && !c.p) { out.part = true; out.gems += W.partGems; out.gold += W.partGold; } W.tiers.forEach((x, i) => { if (st.total >= x.need && !t[i] && st.mine.tries >= 1) { out.tiers.push(i); out.gems += x.gems; } }); return out; };
export async function wkInfo(env, account, now = Date.now()) {
  const st = await wkState(env.DB, account, now), wb = SC.weekBoss(D, st.idx, st.cleared), cl = wkClaimable(st.W, st);
  return { week: st.week, boss: { name: wb.boss.name, emoji: wb.boss.emoji, role: wb.boss.role, el: wb.boss.el }, total: st.total, tiers: st.W.tiers.map((x, i) => ({ need: x.need, gems: x.gems, reached: st.total >= x.need, claimed: !!((st.mine.claim.t || [])[i]) })), tries: st.W.tries, mine: { dmg: st.mine.dmg, tries: st.mine.tries, left: st.mine.left, partClaimed: !!st.mine.claim.p }, claimable: { gems: cl.gems, gold: cl.gold } };
}
export async function wkStart(env, account, now = Date.now()) {
  const db = env.DB, st = await wkState(db, account, now); if (st.mine.left <= 0) throw new HttpError(429, 'no_tries_left', '오늘은 다 했어요');
  const pr = await first(db, 'SELECT cleared,party FROM progress WHERE account=?', account), party = JSON.parse(pr.party), lv = Object.fromEntries((await all(db, 'SELECT unit_id,lv,skl,awk,promo,gear FROM units WHERE account=?', account)).map((r) => [r.unit_id, { lv: r.lv, skl: r.skl, awk: r.awk, promo: r.promo, gear: JSON.parse(r.gear) }]));
  if (party.length !== 5 || !party.every((id) => lv[id])) throw new HttpError(409, 'bad_party'); const seed = Math.floor(csprng() * 4294967296), nonce = randomToken(12), snap = party.map((id) => ({ id, ...lv[id] })), wb = SC.weekBoss(D, st.idx, pr.cleared);
  const token = await signJwt({ typ: 'wkb', sub: account, week: st.week, cleared: pr.cleared, seed, party: snap, nonce, exp: Math.floor(now / 1000) + 3600 }, env.JWT_SECRET);
  return { token, week: st.week, seed, party: snap, nonce, stage: wb.stageDef };
}
export async function wkFinish(env, account, { token, inputs, auto }, now = Date.now()) {
  const db = env.DB, t = await verifyJwt(String(token || ''), env.JWT_SECRET, now); if (t.typ !== 'wkb' || t.sub !== account) throw new HttpError(403, 'bad_boss_token');
  const prev = await first(db, 'SELECT body FROM requests WHERE request_id=?', 'wkb:' + t.nonce); if (prev) return { ...JSON.parse(prev.body), replay: true };
  const st = await wkState(db, account, now); if (t.week !== st.week) throw new HttpError(410, 'week_over', '이번 주 보스가 아니에요');
  const wb = SC.weekBoss(D, st.idx, t.cleared), out = SC.replay(D, { stage: wb.stageDef.id, stageDef: wb.stageDef, seed: t.seed, party: t.party, auto: auto !== false, inputs }); if (out.error) { await flag(env, account, 'bad_replay', 'wkboss:' + out.error, now); throw new HttpError(422, out.error, '전투 기록이 맞지 않아요'); }
  const dealt = Math.max(0, Math.min(WKCAP, out.dealt)), today = st.today, lim = st.W.tries, tag = 'wkb:' + t.nonce, body0 = { dealt, steps: out.steps };
  const res = await db.batch([
    run(db, 'INSERT OR IGNORE INTO wkboss(week,total) VALUES(?,0)', st.week),
    run(db, "INSERT OR IGNORE INTO wkboss_part(week,account,dmg,tries,day,dtries,claim) VALUES(?,?,0,0,'',0,'{}')", st.week, account),
    run(db, 'UPDATE wkboss_part SET dmg=dmg+?, tries=tries+1, dtries=CASE WHEN day=? THEN dtries+1 ELSE 1 END, day=? WHERE week=? AND account=? AND (day<>? OR dtries<?)', dealt, today, today, st.week, account, today, lim),
    run(db, 'INSERT INTO requests(request_id,account,route,status,body,ts) SELECT ?,?,?,?,?,? WHERE changes()=1', tag, account, '/wkboss/finish', 200, JSON.stringify(body0), now),
    run(db, 'UPDATE wkboss SET total=total+? WHERE week=? AND EXISTS(SELECT 1 FROM requests WHERE request_id=?)', dealt, st.week, tag),
  ]);
  if (res[3].meta.changes !== 1) throw new HttpError(429, 'no_tries_left', '오늘은 다 했어요');
  return { ...body0, info: await wkInfo(env, account, now) };
}
export async function wkClaim(env, account, now = Date.now()) {
  const db = env.DB, st = await wkState(db, account, now), cl = wkClaimable(st.W, st); if (st.mine.tries < 1) throw new HttpError(409, 'no_part', '한 번 도전해야 받을 수 있어요');
  if (!cl.part && !cl.tiers.length) return { ok: true, none: true, ...(await walletView(db, account)), info: await wkInfo(env, account, now) };
  const old = JSON.stringify(st.mine.claim), nc = { p: 1, t: (st.mine.claim.t || [0, 0, 0]).slice() }; cl.tiers.forEach((i) => { nc.t[i] = 1; }); const ncs = JSON.stringify(nc), tag = 'wkc:' + st.week + ':' + nc.p + nc.t.join('');
  const w = await first(db, 'SELECT ver FROM wallet WHERE account=?', account), guard = '(SELECT last_req FROM wallet WHERE account=?)=?', g = [account, tag];
  const res = await db.batch([
    run(db, 'UPDATE wallet SET free_gems=free_gems+?, gold=gold+?, ver=ver+1, last_req=? WHERE account=? AND ver=?', cl.gems, cl.gold, tag, account, w.ver),
    run(db, `UPDATE wkboss_part SET claim=? WHERE week=? AND account=? AND claim=? AND ${guard}`, ncs, st.week, account, old, ...g),
    run(db, `INSERT INTO ledger(account,ts,kind,d_free,d_gold,reason,ref) SELECT ?,?,'wkboss',?,?,?,? WHERE ${guard}`, account, now, cl.gems, cl.gold, 'w' + st.week + (cl.part ? ':part' : '') + cl.tiers.map((i) => ':t' + i).join(''), tag, ...g),
  ]); if (res[0].meta.changes !== 1) throw new HttpError(409, 'conflict', '동시에 바뀌었어요. 다시 해 주세요');
  return { ok: true, gems: cl.gems, gold: cl.gold, ...(await walletView(db, account)), info: await wkInfo(env, account, now) };
}
/** 초보자 미션·출석(B11). 상태는 장부·진행도에서 서버가 직접 읽고, 받은 기록은 progress.flags.beg / flags.att (멱등). */
async function begState(db, account) {
  const [pr, us, py, dn, id] = await Promise.all([first(db, 'SELECT cleared,flags FROM progress WHERE account=?', account), all(db, 'SELECT unit_id,lv,skl,awk,promo,gear FROM units WHERE account=?', account), first(db, 'SELECT pulls FROM pity WHERE account=? AND banner=?', account, BANNER), first(db, "SELECT COUNT(*) AS c FROM ledger WHERE account=? AND kind='dungeon'", account), first(db, "SELECT COUNT(*) AS c FROM ledger WHERE account=? AND kind='idle'", account)]);
  const flags = JSON.parse(pr.flags); return { flags, st: { cleared: pr.cleared, units: Object.fromEntries(us.map((u) => [u.unit_id, { lv: u.lv, skl: u.skl, awk: u.awk, promo: u.promo, gear: JSON.parse(u.gear) }])), pulls: py ? py.pulls : 0, dun: dn.c, idle: id.c, dex: (flags.dex || []).length } };
}
export async function beginnerView(env, account) { const { flags, st } = await begState(env.DB, account); const got = flags.beg || []; return { missions: SC.beginner(D, st).map((m) => ({ ...m, claimed: got.includes(m.id) })), att: flags.att || { n: 0, last: '' } }; }
async function grantFlag(db, account, flags, tag, kind, reason, gems, gold, now) {
  const w = await first(db, 'SELECT ver FROM wallet WHERE account=?', account), guard = '(SELECT last_req FROM wallet WHERE account=?)=?', g = [account, tag];
  const res = await db.batch([
    run(db, 'UPDATE wallet SET free_gems=free_gems+?, gold=gold+?, ver=ver+1, last_req=? WHERE account=? AND ver=?', gems, gold, tag, account, w.ver),
    run(db, `UPDATE progress SET flags=? WHERE account=? AND ${guard}`, JSON.stringify(flags), account, ...g),
    run(db, `INSERT INTO ledger(account,ts,kind,d_free,d_gold,reason,ref) SELECT ?,?,?,?,?,?,? WHERE ${guard}`, account, now, kind, gems, gold, reason, tag, ...g),
  ]); if (res[0].meta.changes !== 1) throw new HttpError(409, 'conflict', '동시에 바뀌었어요. 다시 해 주세요');
}
export async function beginnerClaim(env, account, id, now = Date.now()) {
  const db = env.DB, def = (D.bal.beginner || []).find((m) => m.id === id); if (!def) throw new HttpError(400, 'bad_mission');
  const { flags, st } = await begState(db, account), got = flags.beg || []; if (got.includes(id)) return { ok: true, replay: true, ...(await walletView(db, account)) };
  const m = SC.beginner(D, st).find((x) => x.id === id); if (!m.done) throw new HttpError(409, 'not_yet', '아직이에요 (' + m.got + '/' + m.need + ')');
  flags.beg = got.concat(id); await grantFlag(db, account, flags, 'beg:' + id, 'beginner', id, def.gems, def.gold, now); return { ok: true, gems: def.gems, gold: def.gold, ...(await walletView(db, account)) };
}
/** 일일 임무·주간 상자(B22). 오늘 한 일은 장부(ledger)에서 서버가 직접 센다. 받은 기록: flags.dq {date, got[]} · flags.wk {key, days[], box}. 같은 날 같은 임무는 한 번만(멱등). */
const DQ_KINDS = ['stage', 'event', 'levelup', 'upgrade', 'dungeon', 'idle'];
async function dqState(db, account, now) {
  const pr = await first(db, 'SELECT flags FROM progress WHERE account=?', account), flags = JSON.parse(pr.flags), today = kstDate(now), key = SC.weekKey(now);
  const rows = await all(db, `SELECT kind, COUNT(*) AS c FROM ledger WHERE account=? AND ts>=? AND kind IN (${DQ_KINDS.map(() => '?').join(',')}) GROUP BY kind`, account, SC.dayStartMs(now), ...DQ_KINDS), counts = Object.fromEntries(rows.map((r) => [r.kind, r.c]));
  const dq = flags.dq && flags.dq.date === today ? flags.dq : { date: today, got: [] }, wk = flags.wk && flags.wk.key === key ? flags.wk : { key, days: [], box: false };
  return { flags, today, key, counts, dq, wk };
}
export async function dailyView(env, account, now = Date.now()) {
  const { counts, dq, wk } = await dqState(env.DB, account, now), W = D.bal.daily.weekly;
  return { date: dq.date, missions: SC.dailyList(D, counts).map((m) => ({ ...m, claimed: dq.got.includes(m.id) })), week: { key: wk.key, days: wk.days.length, need: W.need, gems: W.gems, gold: W.gold, box: !!wk.box, ready: wk.days.length >= W.need && !wk.box } };
}
export async function dailyClaim(env, account, id, now = Date.now()) {
  const db = env.DB, def = (D.bal.daily.missions || []).find((m) => m.id === id); if (!def) throw new HttpError(400, 'bad_mission');
  const s = await dqState(db, account, now); if (s.dq.got.includes(id)) return { ok: true, replay: true, ...(await walletView(db, account)) };
  const m = SC.dailyList(D, s.counts).find((x) => x.id === id); if (!m.done) throw new HttpError(409, 'not_yet', '아직이에요 (' + m.got + '/' + m.need + ')');
  s.dq.got = s.dq.got.concat(id); s.flags.dq = s.dq; if (s.dq.got.length === D.bal.daily.missions.length && !s.wk.days.includes(s.today)) s.wk.days = s.wk.days.concat(s.today); s.flags.wk = s.wk;
  await grantFlag(db, account, s.flags, 'dq:' + s.today + ':' + id, 'daily', id, def.gems, def.gold, now); return { ok: true, gems: def.gems, gold: def.gold, ...(await walletView(db, account)) };
}
export async function weeklyClaim(env, account, now = Date.now()) {
  const db = env.DB, W = D.bal.daily.weekly, s = await dqState(db, account, now); if (s.wk.box) return { ok: true, replay: true, ...(await walletView(db, account)) };
  if (s.wk.days.length < W.need) throw new HttpError(409, 'not_yet', '아직이에요 (' + s.wk.days.length + '/' + W.need + '일)');
  s.wk.box = true; s.flags.wk = s.wk; await grantFlag(db, account, s.flags, 'wk:' + s.key, 'daily', 'week', W.gems, W.gold, now); return { ok: true, gems: W.gems, gold: W.gold, ...(await walletView(db, account)) };
}
const kstDate = (now) => new Date(now + 9 * 3600000).toISOString().slice(0, 10);
export async function attendClaim(env, account, now = Date.now()) {
  const db = env.DB, pr = await first(db, 'SELECT flags FROM progress WHERE account=?', account), flags = JSON.parse(pr.flags), a = flags.att || { n: 0, last: '' }, today = kstDate(now), len = (D.bal.attend || []).length;
  if (a.last === today) return { ok: true, replay: true, already: true, day: a.n, ...(await walletView(db, account)) }; if (a.n >= len) return { ok: true, done: true, day: a.n, ...(await walletView(db, account)) };
  const n = a.n + 1, rw = SC.attendDay(D, n); flags.att = { n, last: today }; await grantFlag(db, account, flags, 'att:' + n, 'attend', 'day' + n, rw.gems, rw.gold, now); return { ok: true, day: n, gems: rw.gems, gold: rw.gold, ...(await walletView(db, account)) };
}
async function walletView(db, account) { return { wallet: await first(db, 'SELECT free_gems,paid_gems,gold FROM wallet WHERE account=?', account) }; }
