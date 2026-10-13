// ⑪ 서버 게임 로직(WP2~3): 계정 생성·프로필·편성·레벨업·**서버 뽑기**. 규칙·확률표는 클라이언트와 같은 파일(data/expedition_slice.json · gacha-core.js)을 쓴다.
import SLICE from '../../data/expedition_slice.json' with { type: 'json' };
import gachaCore from '../../games/expedition/gacha-core.js';
import { interstitialRule, flag } from './shop.js';
import stageCore from '../../games/expedition/stage-core.js';
import { HttpError, csprng, sha256hex, signJwt, verifyJwt, randomToken } from './lib.js';

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
  const db = env.DB, [acc, w, units, pr, py] = await Promise.all([first(db, 'SELECT age_band,cap_krw,guardian_notice_at,has_paid,no_inter,created_at FROM accounts WHERE id=?', account), first(db, 'SELECT free_gems,paid_gems,gold,tickets,ver FROM wallet WHERE account=?', account), all(db, 'SELECT unit_id,lv,dups FROM units WHERE account=?', account), first(db, 'SELECT cleared,stars,party,flags FROM progress WHERE account=?', account), first(db, 'SELECT since5,since4,guard,pulls FROM pity WHERE account=? AND banner=?', account, BANNER)]);
  if (!acc) throw new HttpError(404, 'no_account');
  return { account, age_band: acc.age_band, cap_krw: acc.cap_krw, guardian_notice: !!acc.guardian_notice_at, wallet: { free_gems: w.free_gems, paid_gems: w.paid_gems, gold: w.gold, tickets: w.tickets }, has_paid: !!acc.has_paid, no_inter: !!acc.no_inter, ads: interstitialRule(acc, now), units: Object.fromEntries(units.map((u) => [u.unit_id, { lv: u.lv, dups: u.dups }])), progress: { cleared: pr.cleared, stars: JSON.parse(pr.stars), party: JSON.parse(pr.party), flags: JSON.parse(pr.flags) }, pity: { since5: py.since5, since4: py.since4, guard: !!py.guard, pulls: py.pulls }, odds_ver: ODDS_VER };
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
  const db = env.DB; if (n !== 1 && n !== 10) throw new HttpError(400, 'bad_n', 'n 은 1 또는 10'); if (banner !== BANNER) throw new HttpError(400, 'bad_banner'); if (!requestId) throw new HttpError(400, 'no_request_id');
  const prev = await first(db, 'SELECT response FROM gacha_log WHERE request_id=?', requestId); if (prev) return { ...JSON.parse(prev.response), replay: true };
  const G = D.gacha, price = GC.price(G, n), w = await first(db, 'SELECT free_gems,paid_gems,gold,ver FROM wallet WHERE account=?', account); if (w.paid_gems < 0) throw new HttpError(402, 'negative_balance', '환불로 모자란 유료 반짝석을 다음 결제로 채울 때까지 쓸 수 없어요'); if (w.free_gems + w.paid_gems < price) throw new HttpError(402, 'insufficient_gems', '반짝석이 모자라요');
  const py = await first(db, 'SELECT since5,since4,guard,pulls FROM pity WHERE account=? AND banner=?', account, banner), P = { since5: py.since5, since4: py.since4, guard: py.guard };
  const owned = new Set((await all(db, 'SELECT unit_id FROM units WHERE account=?', account)).map((r) => r.unit_id)), results = [], fragAdd = {}, newUnits = [];
  for (let i = 0; i < n; i++) { const r = GC.pullOnce(G, D.units, P, rand), isNew = !owned.has(r.id); if (isNew) { owned.add(r.id); newUnits.push(r.id); } const frag = isNew ? 0 : GC.dupFrag(r.grade); if (frag) fragAdd[r.id] = (fragAdd[r.id] || 0) + frag; results.push({ unit: r.id, grade: r.grade, isNew, dupFrag: frag }); }
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

export const oddsTable = () => ({ ...GC.odds(D.gacha, D.units), odds_ver: ODDS_VER, banner: D.gacha.banner, cost: D.gacha.cost, ten: D.gacha.ten });

export async function deleteAccount(env, account) {
  const db = env.DB; await db.batch(['units', 'progress', 'pity', 'wallet', 'ledger', 'gacha_log', 'tokens', 'requests', 'spend_month', 'ad_claims', 'flags'].map((t) => run(db, `DELETE FROM ${t} WHERE account=?`, account)).concat([run(db, "UPDATE accounts SET status='deleted', birth_ym=NULL WHERE id=?", account)])); return { ok: true, note: '결제 기록은 법정 보존 기간 동안 남아요' };
}

/** ---- WP4: 전투 판정. 시드·파티는 서버가 정해 서명 토큰(stage-start)으로 주고, 클리어 때 같은 입력으로 battle-core 를 다시 돌려 승패·별·보상을 정한다. ---- */
const STAGE_TTL = 3600;
export async function stageStart(env, account, stageId, now = Date.now(), secret = env.JWT_SECRET) {
  const st = D.stages.find((x) => x.id === stageId); if (!st) throw new HttpError(400, 'bad_stage');
  const pr = await first(env.DB, 'SELECT cleared,party FROM progress WHERE account=?', account); if (stageId > pr.cleared + 1) throw new HttpError(409, 'stage_locked', '앞 단계를 먼저 깨야 해요');
  const party = JSON.parse(pr.party), lv = Object.fromEntries((await all(env.DB, 'SELECT unit_id,lv FROM units WHERE account=?', account)).map((r) => [r.unit_id, r.lv]));
  if (party.length !== 5 || !party.every((id) => lv[id])) throw new HttpError(409, 'bad_party');
  const seed = Math.floor(csprng() * 4294967296), nonce = randomToken(12), snap = party.map((id) => ({ id, lv: lv[id] }));
  const token = await signJwt({ typ: 'stage', sub: account, stage: stageId, seed, party: snap, nonce, exp: Math.floor(now / 1000) + STAGE_TTL }, secret);
  return { token, stage: stageId, seed, party: snap, nonce };
}
export async function stageClear(env, account, { token, inputs, auto, requestId }, now = Date.now()) {
  const db = env.DB, t = await verifyJwt(String(token || ''), env.JWT_SECRET, now); if (t.typ !== 'stage' || t.sub !== account) throw new HttpError(403, 'bad_stage_token');
  const prev = await first(db, 'SELECT body FROM requests WHERE request_id=?', 'stage:' + t.nonce); if (prev) return { ...JSON.parse(prev.body), replay: true };
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
      run(db, `INSERT INTO requests(request_id,account,route,status,body,ts) SELECT ?,?,?,?,?,? WHERE ${guard}`, 'stage:' + t.nonce, account, '/stage/clear', 200, JSON.stringify(body), now, ...g),
      run(db, `UPDATE progress SET cleared=MAX(cleared,?), stars=?, flags=? WHERE account=? AND ${guard}`, st.id, JSON.stringify(stars), JSON.stringify(flags), account, ...g),
      run(db, `INSERT INTO ledger(account,ts,kind,d_free,d_gold,reason,ref) SELECT ?,?,'stage',?,?,?,? WHERE ${guard}`, account, now, rw.gems, rw.gold, 'stage' + st.id + (firstClear ? ':first' : ''), 'stage:' + t.nonce, ...g),
      ...newUnits.map((id) => run(db, `INSERT INTO units(account,unit_id,lv,dups) SELECT ?,?,1,0 WHERE ${guard}`, account, id, ...g)),
    ]);
  } catch (e) { const dup = await first(db, 'SELECT body FROM requests WHERE request_id=?', 'stage:' + t.nonce); if (dup) return { ...JSON.parse(dup.body), replay: true }; throw e; }
  if (res[0].meta.changes !== 1) throw new HttpError(409, 'conflict', '동시에 바뀌었어요. 다시 해 주세요'); return body;
}
