// ⑪ S1 WP5~6: 결제(월 상한·검증·환불·청약철회)·광고(SSV·보상·전면 규칙). 스토어 연동은 어댑터 뒤 — 로컬·시험은 mock, 실제 Google/삼성은 계정·상품 등록 뒤(D27).
import SHOP from '../../data/expedition_shop.json' with { type: 'json' };
import { HttpError, hmacHex, safeEq, ymKst, dayKst, nextYm } from './lib.js';

export const S = SHOP, PRODUCT = Object.fromEntries(SHOP.products.map((p) => [p.sku, p]));
const run = (db, sql, ...a) => db.prepare(sql).bind(...a);
const first = (db, sql, ...a) => db.prepare(sql).bind(...a).first();
const DAY = 86400000;

/* ---------------- 스토어 어댑터 ---------------- */
/** 구매 확인: → {order_id, sku, amount_krw}. mock 은 ENV dev|test 에서만("mock:<order_id>:<sku>"). google/samsung 은 계정·상품 등록 뒤 구현(자리). env.STORE_ADAPTER 로 시험에서 바꿔 끼운다. */
export async function verifyStore(env, { store, sku, token, orderId }) {
  if (env.STORE_ADAPTER) return env.STORE_ADAPTER(store, { sku, token, orderId });
  if (store === 'mock') {
    if (!['dev', 'test'].includes(env.ENV)) throw new HttpError(404, 'not_found');
    const m = /^mock:([^:]+):([^:]+)$/.exec(String(token || '')); if (!m || m[1] !== orderId || m[2] !== sku) throw new HttpError(422, 'bad_receipt'); const p = PRODUCT[sku]; if (!p) throw new HttpError(400, 'bad_sku'); return { order_id: orderId, sku, amount_krw: p.krw };
  }
  if (store === 'google' || store === 'samsung') throw new HttpError(501, 'store_not_configured', '스토어 연동은 계정·상품 등록 뒤에 켜요');   // google: purchases.products.get + acknowledge/consume · samsung: IAP 서버 검증 API
  throw new HttpError(400, 'bad_store');
}

/* ---------------- 월 상한 ---------------- */
const effCap = (acc, ym) => { let u = acc.cap_user == null ? acc.cap_krw : acc.cap_user; if (acc.cap_next_ym && acc.cap_next_ym <= ym) u = acc.cap_next; return Math.min(acc.cap_krw, u); };
async function capState(db, account, now) {
  const acc = await first(db, 'SELECT age_band,cap_krw,cap_user,cap_next,cap_next_ym,has_paid,no_inter,created_at FROM accounts WHERE id=?', account); if (!acc) throw new HttpError(404, 'no_account');
  const ym = ymKst(now), sm = await first(db, 'SELECT krw FROM spend_month WHERE account=? AND ym=?', account, ym); return { acc, ym, cap: effCap(acc, ym), spent: sm ? sm.krw : 0 };
}
export const products = () => ({ products: SHOP.products.map(({ sku, name, krw, gems, firstDouble, noInter }) => ({ sku, name, krw, gems, firstDouble: !!firstDouble, noInter: !!noInter })), notice: SHOP.notice });

export async function iapPrecheck(env, account, sku, now = Date.now()) {
  const p = PRODUCT[sku]; if (!p) throw new HttpError(400, 'bad_sku'); const { acc, cap, spent, ym } = await capState(env.DB, account, now), base = { month: ym, month_spent: spent, cap, notice: SHOP.notice };
  if (acc.cap_krw === 0) return { allowed: false, reason: 'payments_blocked_minor', ...base, msg: '만 14세 미만은 보호자 동의 절차 전까지 결제할 수 없어요' };
  if (p.noInter && acc.no_inter) return { allowed: false, reason: 'already_owned', ...base };
  if (spent + p.krw > cap) return { allowed: false, reason: 'cap_exceeded', ...base, msg: '이번 달 결제 한도를 넘어요' };
  return { allowed: true, ...base, price: p.krw };
}
export async function setCap(env, account, krw, now = Date.now()) {
  const db = env.DB, { acc, cap, ym } = await capState(db, account, now); if (!Number.isInteger(krw) || krw < 0 || krw > acc.cap_krw) throw new HttpError(400, 'bad_cap', '나이 대역 한도(' + acc.cap_krw + '원) 이하로만 정할 수 있어요');
  if (krw <= cap) { await run(db, 'UPDATE accounts SET cap_user=?, cap_next=NULL, cap_next_ym=NULL WHERE id=?', krw, account).run(); return { cap: krw, effective_from: ym }; }
  const nx = nextYm(now); await run(db, 'UPDATE accounts SET cap_next=?, cap_next_ym=? WHERE id=?', krw, nx, account).run(); return { cap, pending: krw, effective_from: nx };   // 올리기는 다음 달부터
}

/* ---------------- 결제 검증 ---------------- */
export async function iapVerify(env, account, { store, sku, token, orderId, requestId }, now = Date.now()) {
  const db = env.DB; if (!orderId || !sku) throw new HttpError(400, 'bad_request'); const p = PRODUCT[sku]; if (!p) throw new HttpError(400, 'bad_sku');
  const prev = await first(db, 'SELECT account,state,gems,bonus,amount_krw FROM purchases WHERE order_id=?', orderId);
  if (prev) { if (prev.account !== account) throw new HttpError(409, 'order_used'); if (prev.state === 'granted') { const st = await capState(db, account, now); return { ok: true, replay: true, granted: prev.gems, wallet: await walletOf(db, account), month_spent: st.spent }; } throw new HttpError(409, 'order_' + prev.state); }
  const { acc, cap, spent, ym } = await capState(db, account, now);
  if (acc.cap_krw === 0) {    // 미성년 결제는 지급하지 않는다. 주문은 환불 대상으로 남긴다
    await run(db, "INSERT INTO purchases(order_id,account,sku,store,state,amount_krw,ts,ym,raw) VALUES(?,?,?,?,'needs_refund',?,?,?,?)", orderId, account, sku, store, p.krw, now, ym, 'minor').run(); await flag(env, account, 'minor_payment', orderId, now); throw new HttpError(403, 'payments_blocked', '이 결제는 지급되지 않아요. 스토어에서 환불 절차를 안내해 드려요');
  }
  const v = await verifyStore(env, { store, sku, token, orderId }); if (v.order_id !== orderId || v.sku !== sku || v.amount_krw !== p.krw) throw new HttpError(422, 'price_mismatch');
  const had = await first(db, "SELECT COUNT(*) AS n FROM purchases WHERE account=? AND sku=? AND state IN ('granted','refunded')", account, sku), bonus = p.firstDouble && had.n === 0 ? p.gems : 0, gems = p.gems + bonus, over = spent + p.krw > cap;
  const w = await first(db, 'SELECT ver FROM wallet WHERE account=?', account), tag = 'iap:' + orderId, guard = '(SELECT last_req FROM wallet WHERE account=?)=?', g = [account, tag];
  let res; try {
    res = await db.batch([
      run(db, 'UPDATE wallet SET paid_gems=paid_gems+?, ver=ver+1, last_req=? WHERE account=? AND ver=?', gems, tag, account, w.ver),
      run(db, `INSERT INTO purchases(order_id,account,sku,store,state,amount_krw,ts,gems,bonus,ym,raw) SELECT ?,?,?,?,'granted',?,?,?,?,?,? WHERE ${guard}`, orderId, account, sku, store, p.krw, now, gems, bonus, ym, requestId || null, ...g),
      run(db, `INSERT INTO spend_month(account,ym,krw) SELECT ?,?,? WHERE ${guard} ON CONFLICT(account,ym) DO UPDATE SET krw=krw+excluded.krw`, account, ym, p.krw, ...g),
      run(db, `UPDATE accounts SET has_paid=1, no_inter=CASE WHEN ? THEN 1 ELSE no_inter END WHERE id=? AND ${guard}`, p.noInter ? 1 : 0, account, ...g),
      run(db, `INSERT INTO ledger(account,ts,kind,d_paid,reason,ref) SELECT ?,?,'iap',?,?,? WHERE ${guard}`, account, now, gems, sku + (bonus ? ':first' : ''), orderId, ...g),
    ]);
  } catch (e) { const dup = await first(db, 'SELECT account FROM purchases WHERE order_id=?', orderId); if (dup) throw new HttpError(409, dup.account === account ? 'conflict' : 'order_used'); throw e; }
  if (res[0].meta.changes !== 1) throw new HttpError(409, 'conflict', '동시에 바뀌었어요. 다시 해 주세요');
  if (over) await flag(env, account, 'over_cap', orderId + ':' + (spent + p.krw) + '/' + cap, now);
  return { ok: true, granted: gems, bonus, wallet: await walletOf(db, account), month_spent: spent + p.krw, cap, over_cap: over, warning: over ? '이번 달 결제 한도를 넘었어요. 다음 결제는 막혀요.' : undefined };
}
const walletOf = (db, account) => first(db, 'SELECT free_gems,paid_gems,gold,tickets FROM wallet WHERE account=?', account);

/* ---------------- 환불·청약철회 ---------------- */
/** 스토어 환불 통지(RTDN 등)를 받았을 때: 유상 재화 회수(모자라면 마이너스 잔고) · 월 사용액 차감. 멱등. */
export async function refundOrder(env, orderId, now = Date.now()) {
  const db = env.DB, o = await first(db, 'SELECT order_id,account,sku,state,amount_krw,gems,ym FROM purchases WHERE order_id=?', orderId); if (!o) throw new HttpError(404, 'no_order');
  if (o.state === 'refunded') return { ok: true, replay: true }; if (o.state !== 'granted') { await run(db, "UPDATE purchases SET state='refunded', refunded_at=? WHERE order_id=?", now, orderId).run(); return { ok: true, note: '지급 전 주문' }; }
  const w = await first(db, 'SELECT paid_gems,ver FROM wallet WHERE account=?', o.account), tag = 'refund:' + orderId, guard = '(SELECT last_req FROM wallet WHERE account=?)=?', g = [o.account, tag], p = PRODUCT[o.sku];
  const res = await db.batch([
    run(db, 'UPDATE wallet SET paid_gems=paid_gems-?, ver=ver+1, last_req=? WHERE account=? AND ver=?', o.gems, tag, o.account, w.ver),
    run(db, `UPDATE purchases SET state='refunded', refunded_at=? WHERE order_id=? AND ${guard}`, now, orderId, ...g),
    run(db, `UPDATE spend_month SET krw=MAX(0,krw-?) WHERE account=? AND ym=? AND ${guard}`, o.amount_krw, o.account, o.ym, ...g),
    run(db, `INSERT INTO ledger(account,ts,kind,d_paid,reason,ref) SELECT ?,?,'refund',?,?,? WHERE ${guard}`, o.account, now, -o.gems, o.sku, orderId, ...g),
    ...(p && p.noInter ? [run(db, `UPDATE accounts SET no_inter=0 WHERE id=? AND ${guard}`, o.account, ...g)] : []),
  ]); if (res[0].meta.changes !== 1) throw new HttpError(409, 'conflict'); const after = await walletOf(db, o.account);
  if (after.paid_gems < 0) await flag(env, o.account, 'negative_balance', orderId + ':' + after.paid_gems, now); return { ok: true, clawed: o.gems, wallet: after, negative: after.paid_gems < 0 };
}
/** 청약철회 가능 여부: 결제 후 7일 안 + 그 뒤 유상 반짝석을 하나도 쓰지 않았을 때만(뽑기·소비분 불가). 실제 환불은 스토어 절차 안내. */
export async function iapWithdraw(env, account, orderId, now = Date.now()) {
  const db = env.DB, o = await first(db, 'SELECT order_id,ts,state,gems,sku FROM purchases WHERE order_id=? AND account=?', orderId, account); if (!o) throw new HttpError(404, 'no_order');
  if (o.state !== 'granted') return { eligible: false, reason: 'not_granted' }; if (now - o.ts > 7 * DAY) return { eligible: false, reason: 'after_7d', msg: '7일이 지나 청약철회 대상이 아니에요(스토어 환불 정책은 별도)' };
  const used = await first(db, "SELECT COALESCE(SUM(-d_paid),0) AS n FROM ledger WHERE account=? AND d_paid<0 AND kind<>'refund' AND ts>=?", account, o.ts), w = await walletOf(db, account);
  if (used.n > 0 || w.paid_gems < o.gems) return { eligible: false, reason: 'used', msg: '이미 쓴 유료 반짝석이 있어 청약철회 대상이 아니에요(모집·소비분은 환불되지 않아요)' };
  return { eligible: true, sku: o.sku, gems: o.gems, msg: SHOP.notice.store_policy + ' 스토어의 환불 절차를 안내해 드려요.' };
}

/* ---------------- 광고 ---------------- */
const ADS = SHOP.ads;
/** SSV 콜백: 광고 SDK 서버가 보상 확인을 보낸다. 로컬은 HMAC(env.ADS_SSV_SECRET) — 실제 AdMob 은 구글 공개키 ECDSA 서명 검증으로 교체(계정 뒤). */
export async function adWebhook(env, q, now = Date.now()) {
  const msg = `user_id=${q.user_id}&reward_item=${q.reward_item}&transaction_id=${q.transaction_id}&timestamp=${q.timestamp}`;
  if (!env.ADS_SSV_SECRET || !safeEq(await hmacHex(env.ADS_SSV_SECRET, msg), q.signature || '')) throw new HttpError(403, 'bad_signature');
  if (!ADS.rewardKinds[q.reward_item]) throw new HttpError(400, 'bad_kind'); if (Math.abs(now - Number(q.timestamp)) > 600000) throw new HttpError(400, 'stale');
  const acc = await first(env.DB, "SELECT id FROM accounts WHERE id=? AND status='active'", q.user_id); if (!acc) throw new HttpError(404, 'no_account');
  await run(env.DB, 'INSERT OR IGNORE INTO ad_claims(token,account,kind,ts,claimed,day) VALUES(?,?,?,?,0,?)', q.transaction_id, q.user_id, q.reward_item, now, dayKst(now)).run(); return { ok: true };
}
export async function adReward(env, account, { kind, token }, now = Date.now()) {
  const db = env.DB, rule = ADS.rewardKinds[kind]; if (!rule) throw new HttpError(400, 'bad_kind'); const c = await first(db, 'SELECT account,kind,ts,claimed FROM ad_claims WHERE token=?', token);
  if (!c || c.account !== account || c.kind !== kind) throw new HttpError(404, 'no_claim', '광고 완료 확인이 아직 없어요'); if (c.claimed) { return { ok: true, replay: true, ...(await left(db, account, kind, rule, now)) }; } if (now - c.ts > 30 * 60000) throw new HttpError(410, 'claim_expired');
  const day = dayKst(now), used = await first(db, 'SELECT COUNT(*) AS n FROM ad_claims WHERE account=? AND kind=? AND claimed=1 AND day=?', account, kind, day); if (used.n >= rule.perDay) throw new HttpError(429, 'daily_limit', '오늘은 더 받을 수 없어요');
  const w = await first(db, 'SELECT ver FROM wallet WHERE account=?', account), tag = 'ad:' + token, guard = '(SELECT last_req FROM wallet WHERE account=?)=?', g = [account, tag], gems = kind === 'gems' ? rule.grant : 0, tickets = kind === 'sweep' ? rule.grant : 0;
  const res = await db.batch([
    run(db, 'UPDATE wallet SET free_gems=free_gems+?, tickets=tickets+?, ver=ver+1, last_req=? WHERE account=? AND ver=?', gems, tickets, tag, account, w.ver),
    run(db, `UPDATE ad_claims SET claimed=1, day=? WHERE token=? AND claimed=0 AND ${guard}`, day, token, ...g),
    run(db, `INSERT INTO ledger(account,ts,kind,d_free,reason,ref) SELECT ?,?,'ad',?,?,? WHERE ${guard}`, account, now, gems, kind + (tickets ? ':ticket' : ''), token, ...g),
  ]); if (res[0].meta.changes !== 1) throw new HttpError(409, 'conflict');
  return { ok: true, grant: { gems, tickets }, wallet: await walletOf(db, account), ...(await left(db, account, kind, rule, now)) };
}
async function left(db, account, kind, rule, now) { const u = await first(db, 'SELECT COUNT(*) AS n FROM ad_claims WHERE account=? AND kind=? AND claimed=1 AND day=?', account, kind, dayKst(now)); return { left_today: Math.max(0, rule.perDay - u.n) }; }
/** 전면 광고 규칙: 결제 이력·광고 제거 계정 제외 · 설치 후 첫 30분 없음. 판정은 클라이언트가 이 규칙으로(4전투에 1회·전투 중 금지·하루 상한). */
export function interstitialRule(acc, now = Date.now()) {
  const young = now - acc.created_at < ADS.interFirstMin * 60000, allowed = !acc.has_paid && !acc.no_inter && !young;
  return { allowed, reason: allowed ? undefined : acc.no_inter ? 'no_inter' : acc.has_paid ? 'paid' : 'first_30min', every: ADS.interEvery, per_day: ADS.interPerDay, personalized: ADS.personalized, reward: Object.fromEntries(Object.entries(ADS.rewardKinds).map(([k, v]) => [k, { grant: v.grant, per_day: v.perDay }])) };
}

export async function flag(env, account, kind, detail, now = Date.now()) { try { await run(env.DB, 'INSERT INTO flags(account,ts,kind,detail) VALUES(?,?,?,?)', account, now, kind, String(detail || '').slice(0, 300)).run(); } catch (e) { /* 기록 실패는 흐름을 막지 않는다 */ } }
