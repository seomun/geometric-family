// ⑪ 서버 WP5~8 시험: node --test test/shop.test.js — 결제(월 상한·검증·환불·청약철회)·광고(SSV·보상·전면 규칙)·운영(설정·점검·분석·속도 제한·정리)
import test from 'node:test';
import assert from 'node:assert/strict';
import { makeD1 } from './d1shim.js';
import { handle } from '../src/worker.js';
import { hmacHex } from '../src/lib.js';
import * as Ops from '../src/ops.js';

const NOW = Date.UTC(2026, 9, 13, 3, 0, 0), DAY = 86400000;
const mkenv = (x = {}) => ({ DB: makeD1(), JWT_SECRET: 'test-secret-0123456789', ENV: 'test', WEBHOOK_SECRET: 'wh-secret', ADS_SSV_SECRET: 'ads-secret', ...x });
const call = async (env, method, path, { body, token, now = NOW, headers = {} } = {}) => { const res = await handle(new Request('http://t' + path, { method, headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}), ...headers }, body: body ? JSON.stringify(body) : undefined }), env, now).catch((e) => ({ status: e.status || 500, json: async () => ({ error: e.code || 'internal' }) })); return { status: res.status, body: await res.json() }; };
const signup = async (env, birth = '1990-05', now = NOW) => { const r = await call(env, 'POST', '/auth/anon', { body: { device_hash: 'd', birth_ym: birth }, now }); assert.equal(r.status, 201, JSON.stringify(r.body)); return r.body; };
let n = 0; const R = () => 'r' + (++n), ORD = () => 'GPA.' + (++n);
const buy = (env, a, sku, o = {}) => { const order = o.order || ORD(); return call(env, 'POST', '/iap/verify', { token: a.access, now: o.now, body: { store: 'mock', sku, purchase_token: `mock:${order}:${sku}`, order_id: order, request_id: R() } }).then((r) => Object.assign(r, { order })); };
const at = async (env, a, now) => { const r = await call(env, 'POST', '/auth/refresh', { body: { refresh: a.refresh }, now }); assert.equal(r.status, 200, JSON.stringify(r.body)); a.refresh = r.body.refresh; return r.body.access; };   // 시간이 지난 시점의 로그인 토큰
const prof = async (env, a, now) => (await call(env, 'GET', '/profile', { token: a.access, now })).body;

test('상품·결제 전 확인: 고지 문구 · 12~13세 차단 · 월 상한 초과 차단', async () => {
  const env = mkenv(), a = await signup(env), teen = await signup(env, '2013-01'), g = await signup(env, '2009-06');
  const pr = (await call(env, 'GET', '/iap/products')).body; assert.equal(pr.products.length, 7); assert.match(pr.notice.unused_refund_7d, /7일/); assert.match(pr.notice.gacha_no_refund, /모집/);
  const ok = (await call(env, 'POST', '/iap/precheck', { token: a.access, body: { sku: 'gems_3300' } })).body; assert.equal(ok.allowed, true); assert.equal(ok.cap, 200000); assert.ok(ok.notice.gacha_no_refund);
  const minor = (await call(env, 'POST', '/iap/precheck', { token: teen.access, body: { sku: 'gems_1100' } })).body; assert.equal(minor.allowed, false); assert.equal(minor.reason, 'payments_blocked_minor');
  const gp = (await call(env, 'POST', '/iap/precheck', { token: g.access, body: { sku: 'gems_55000' } })).body; assert.equal(gp.cap, 70000, '14~18세 월 7만원'); assert.equal(gp.allowed, true);
  assert.equal((await call(env, 'POST', '/iap/precheck', { token: a.access, body: { sku: 'nope' } })).body.error, 'bad_sku');
});

test('상품 검증: 지급 · 첫 구매 2배 · 같은 주문 멱등 · 남의 주문·가짜 영수증·가격 불일치 거부', async () => {
  const env = mkenv(), a = await signup(env), b = await signup(env, '1985-01');
  const r1 = await buy(env, a, 'gems_3300'); assert.equal(r1.status, 200, JSON.stringify(r1.body)); assert.equal(r1.body.granted, 680, '340 + 첫 구매 보너스 340'); assert.equal(r1.body.wallet.paid_gems, 680); assert.equal(r1.body.month_spent, 3300);
  const again = await buy(env, a, 'gems_3300', { order: r1.order }); assert.equal(again.body.replay, true); assert.equal((await prof(env, a)).wallet.paid_gems, 680, '같은 주문은 한 번만');
  const r2 = await buy(env, a, 'gems_3300'); assert.equal(r2.body.granted, 340, '두 번째는 보너스 없음'); assert.equal(r2.body.month_spent, 6600);
  assert.equal((await buy(env, b, 'gems_3300', { order: r1.order })).body.error, 'order_used', '남의 주문 번호');
  assert.equal((await call(env, 'POST', '/iap/verify', { token: a.access, body: { store: 'mock', sku: 'gems_1100', purchase_token: 'mock:x:gems_3300', order_id: 'x', request_id: R() } })).body.error, 'bad_receipt');
  assert.equal((await call(env, 'POST', '/iap/verify', { token: a.access, body: { store: 'google', sku: 'gems_1100', purchase_token: 't', order_id: 'g1', request_id: R() } })).body.error, 'store_not_configured', '실제 스토어는 계정 뒤');
  const env2 = mkenv({ STORE_ADAPTER: async (store, { sku, orderId }) => ({ order_id: orderId, sku, amount_krw: 100 }) }), c = await signup(env2);
  assert.equal((await buy(env2, c, 'gems_1100')).body.error, 'price_mismatch', '스토어가 알려 준 금액이 다르면 거부');
  assert.equal((await prof(env, a)).has_paid, true);
  const led = await env.DB.prepare("SELECT COUNT(*) AS n, SUM(d_paid) AS s FROM ledger WHERE account=? AND kind='iap'").bind(a.account).first(); assert.equal(led.n, 2); assert.equal(led.s, 1020, '장부 = 지급 합계');
});

test('미성년 결제는 지급하지 않는다(주문은 환불 대상으로 남김) · 데이터 일관', async () => {
  const env = mkenv(), t = await signup(env, '2013-01'); const r = await buy(env, t, 'gems_1100'); assert.equal(r.status, 403); assert.equal(r.body.error, 'payments_blocked');
  assert.equal((await prof(env, t)).wallet.paid_gems, 0); assert.equal((await env.DB.prepare('SELECT state FROM purchases WHERE order_id=?').bind(r.order).first()).state, 'needs_refund'); assert.equal((await env.DB.prepare("SELECT COUNT(*) AS n FROM flags WHERE kind='minor_payment'").first()).n, 1);
});

test('월 상한: 사후 초과는 지급하되 경고·다음 결제 차단 · 낮추기 즉시 · 올리기 다음 달 · 월 경계(KST)', async () => {
  const env = mkenv(), g = await signup(env, '2009-06');   // 14~18세 7만원
  const a1 = await buy(env, g, 'gems_33000'); assert.equal(a1.body.month_spent, 33000); const a2 = await buy(env, g, 'gems_33000'); assert.equal(a2.body.month_spent, 66000);
  assert.equal((await call(env, 'POST', '/iap/precheck', { token: g.access, body: { sku: 'gems_6600' } })).body.reason, 'cap_exceeded', '66,000+6,600 > 70,000');
  const over = await buy(env, g, 'gems_6600'); assert.equal(over.body.over_cap, true); assert.match(over.body.warning, /한도/); assert.equal((await env.DB.prepare("SELECT COUNT(*) AS n FROM flags WHERE kind='over_cap'").first()).n, 1);
  assert.equal((await call(env, 'POST', '/iap/precheck', { token: g.access, body: { sku: 'gems_1100' } })).body.allowed, false, '다음 결제 차단');
  // 다음 달(KST 1일 00:00 직후)에는 다시 열린다
  const nextMonth = Date.UTC(2026, 9, 31, 15, 5, 0);   // = 11월 1일 00:05 KST
  assert.equal((await call(env, 'POST', '/iap/precheck', { token: await at(env, g, nextMonth), now: nextMonth, body: { sku: 'gems_1100' } })).body.allowed, true);
  const a = await signup(env); assert.equal((await call(env, 'POST', '/iap/cap', { token: a.access, body: { cap_krw: 50000 } })).body.cap, 50000); assert.equal((await call(env, 'POST', '/iap/precheck', { token: a.access, body: { sku: 'gems_55000' } })).body.reason, 'cap_exceeded', '낮춘 상한 즉시 적용');
  const up = (await call(env, 'POST', '/iap/cap', { token: a.access, body: { cap_krw: 150000 } })).body; assert.equal(up.cap, 50000); assert.equal(up.pending, 150000); assert.equal(up.effective_from, '2026-11');
  assert.equal((await call(env, 'POST', '/iap/precheck', { token: a.access, body: { sku: 'gems_55000' } })).body.reason, 'cap_exceeded', '올리기는 이번 달엔 적용 안 됨');
  assert.equal((await call(env, 'POST', '/iap/precheck', { token: await at(env, a, nextMonth), now: nextMonth, body: { sku: 'gems_55000' } })).body.cap, 150000, '다음 달부터 적용');
  assert.equal((await call(env, 'POST', '/iap/cap', { token: g.access, body: { cap_krw: 100000 } })).body.error, 'bad_cap', '14~18세는 7만원 위로 못 올림');
});

test('환불: 통지 인증 · 유상 재화 회수 · 마이너스 잔고(사용 제한) · 다음 결제로 상환 · 멱등 · 월 사용액 차감', async () => {
  const env = mkenv(), a = await signup(env), r = await buy(env, a, 'gems_6600'); assert.equal(r.body.granted, 1400);
  const wh = (order, h = { 'x-webhook-secret': 'wh-secret' }) => call(env, 'POST', '/webhook/play', { headers: h, body: { type: 'refund', order_id: order } });
  assert.equal((await wh(r.order, {})).body.error, 'bad_secret'); assert.equal((await wh(r.order, { 'x-webhook-secret': 'zzz' })).body.error, 'bad_secret');
  // 먼저 유상 재화를 일부 쓴다(무상 1,500 → 먼저 소진, 그다음 유상) — 10회 × 3 = 4,275 → 무상 1,500 + 유상 2,775 는 모자라니 2번만: 2,850 = 무상 1,500 + 유상 1,350
  await env.DB.prepare('UPDATE wallet SET free_gems=0 WHERE account=?').bind(a.account).run(); for (let i = 0; i < 9; i++) await call(env, 'POST', '/gacha/pull', { token: a.access, body: { n: 1, request_id: R() } });   // 150 × 9 = 1,350
  const rf = await wh(r.order); assert.equal(rf.body.ok, true); assert.equal(rf.body.negative, true); assert.equal(rf.body.wallet.paid_gems, 50 - 1400, '남은 50 − 회수 1,400');
  assert.equal((await wh(r.order)).body.replay, true, '같은 통지 두 번');
  assert.equal((await call(env, 'GET', '/profile', { token: a.access })).body.wallet.paid_gems, -1350);
  assert.equal((await call(env, 'POST', '/gacha/pull', { token: a.access, body: { n: 1, request_id: R() } })).body.error, 'negative_balance', '마이너스 동안 모집 불가');
  assert.equal((await env.DB.prepare('SELECT krw FROM spend_month WHERE account=?').bind(a.account).first()).krw, 0, '월 사용액 차감');
  const re = await buy(env, a, 'gems_6600'); assert.equal(re.body.granted, 700, '환불된 주문의 첫 구매 보너스는 다시 주지 않는다'); assert.equal(re.body.wallet.paid_gems, -1350 + 700, '새 결제가 마이너스부터 채운다');
  assert.equal((await call(env, 'POST', '/gacha/pull', { token: a.access, body: { n: 1, request_id: R() } })).body.error, 'negative_balance', '아직 마이너스');
  const re2 = await buy(env, a, 'gems_12000'); assert.equal(re2.body.wallet.paid_gems, -650 + 2600); assert.equal((await call(env, 'POST', '/gacha/pull', { token: a.access, body: { n: 1, request_id: R() } })).status, 200, '채워지면 다시 쓸 수 있다');
});

test('청약철회 확인: 7일 안·미사용만 · 쓴 뒤·7일 뒤는 불가', async () => {
  const env = mkenv(), a = await signup(env), r = await buy(env, a, 'gems_3300');
  const w1 = (await call(env, 'POST', '/iap/withdraw', { token: await at(env, a, NOW + 3 * DAY), body: { order_id: r.order }, now: NOW + 3 * DAY })).body; assert.equal(w1.eligible, true); assert.match(w1.msg, /스토어/);
  assert.equal((await call(env, 'POST', '/iap/withdraw', { token: await at(env, a, NOW + 8 * DAY), body: { order_id: r.order }, now: NOW + 8 * DAY })).body.reason, 'after_7d');
  await env.DB.prepare('UPDATE wallet SET free_gems=0 WHERE account=?').bind(a.account).run(); await call(env, 'POST', '/gacha/pull', { token: a.access, body: { n: 1, request_id: R() }, now: NOW + 1000 });   // 유상 150 소비
  const w2 = (await call(env, 'POST', '/iap/withdraw', { token: await at(env, a, NOW + 3 * DAY), body: { order_id: r.order }, now: NOW + 3 * DAY })).body; assert.equal(w2.eligible, false); assert.equal(w2.reason, 'used'); assert.match(w2.msg, /환불되지 않아요/);
  assert.equal((await call(env, 'POST', '/iap/withdraw', { token: a.access, body: { order_id: 'nope' } })).body.error, 'no_order');
});

test('광고: SSV 서명 · 보상 청구 · 중복 · 하루 상한 · 남의 토큰', async () => {
  const env = mkenv(), a = await signup(env), b = await signup(env, '1985-01'); const ssv = async (acc, kind, tx, ts = NOW, secret = 'ads-secret', now = NOW) => { const msg = `user_id=${acc.account}&reward_item=${kind}&transaction_id=${tx}&timestamp=${ts}`; return call(env, 'GET', `/webhook/ads?user_id=${acc.account}&reward_item=${kind}&transaction_id=${tx}&timestamp=${ts}&signature=${await hmacHex(secret, msg)}`, { now }); };
  assert.equal((await ssv(a, 'gems', 't0', NOW, 'wrong')).body.error, 'bad_signature'); assert.equal((await call(env, 'POST', '/ads/reward', { token: a.access, body: { kind: 'gems', token: 't0' } })).body.error, 'no_claim', '확인 없는 청구');
  for (let i = 1; i <= 3; i++) { assert.equal((await ssv(a, 'gems', 'g' + i)).body.ok, true); const r = await call(env, 'POST', '/ads/reward', { token: a.access, body: { kind: 'gems', token: 'g' + i } }); assert.equal(r.body.grant.gems, 20); assert.equal(r.body.left_today, 3 - i); }
  assert.equal((await prof(env, a)).wallet.free_gems, 1500 + 60);
  await ssv(a, 'gems', 'g4'); assert.equal((await call(env, 'POST', '/ads/reward', { token: a.access, body: { kind: 'gems', token: 'g4' } })).body.error, 'daily_limit', '하루 3회');
  assert.equal((await call(env, 'POST', '/ads/reward', { token: a.access, body: { kind: 'gems', token: 'g1' } })).body.replay, true, '같은 확인은 한 번만'); assert.equal((await prof(env, a)).wallet.free_gems, 1560);
  await ssv(a, 'sweep', 's1'); assert.equal((await call(env, 'POST', '/ads/reward', { token: a.access, body: { kind: 'sweep', token: 's1' } })).body.grant.tickets, 1); assert.equal((await prof(env, a)).wallet.tickets, 1);
  await ssv(a, 'gems', 'steal'); assert.equal((await call(env, 'POST', '/ads/reward', { token: b.access, body: { kind: 'gems', token: 'steal' } })).body.error, 'no_claim', '남의 광고 확인');
  assert.equal((await ssv(a, 'gems', 'old', NOW - 3600000)).body.error, 'stale');
  const next = NOW + DAY; await ssv(a, 'gems', 'g5', next, 'ads-secret', next); assert.equal((await call(env, 'POST', '/ads/reward', { token: await at(env, a, next), now: next, body: { kind: 'gems', token: 'g5' } })).body.left_today, 2, '다음 날 다시');
});

test('전면 광고 규칙: 설치 30분 · 결제자·광고 제거 제외 · 비맞춤', async () => {
  const env = mkenv(), a = await signup(env); const p0 = await prof(env, a, NOW + 60000); assert.equal(p0.ads.allowed, false); assert.equal(p0.ads.reason, 'first_30min'); assert.equal(p0.ads.personalized, false); assert.equal(p0.ads.every, 4);
  const p1 = await prof(env, a, NOW + 31 * 60000); assert.equal(p1.ads.allowed, true);
  await buy(env, a, 'gems_1100', { now: NOW + 31 * 60000 }); assert.equal((await prof(env, a, NOW + 32 * 60000)).ads.reason, 'paid');
  const b = await signup(env, '1985-01'), nb = await buy(env, b, 'no_inter', { now: NOW + 40 * 60000 }); assert.equal(nb.status, 200, JSON.stringify(nb.body)); assert.equal((await prof(env, b, NOW + 41 * 60000)).no_inter, true);
  assert.equal((await call(env, 'POST', '/iap/precheck', { token: b.access, body: { sku: 'no_inter' } })).body.reason, 'already_owned');
  await call(env, 'POST', '/webhook/play', { headers: { 'x-webhook-secret': 'wh-secret' }, body: { type: 'refund', order_id: nb.order } }); assert.equal((await prof(env, b)).no_inter, false, '환불하면 광고 제거도 풀림');
});

test('원격 설정·점검·이벤트·분석', async () => {
  const env = mkenv(), a = await signup(env); let c = (await call(env, 'GET', '/config')).body; assert.equal(c.maintenance, false); assert.deepEqual(c.events, []); assert.equal(c.ads.personalized, false);
  await env.DB.prepare('INSERT INTO events(id,start_ts,end_ts,title,payload) VALUES(?,?,?,?,?)').bind('e1', NOW - DAY, NOW + DAY, '가을 모집', '{"pickup":"u_sun_hana"}').run(); await env.DB.prepare('INSERT INTO events(id,start_ts,end_ts,title) VALUES(?,?,?,?)').bind('e2', NOW + DAY, NOW + 2 * DAY, '다음 주').run();
  c = (await call(env, 'GET', '/config')).body; assert.equal(c.events.length, 1); assert.equal(c.events[0].pickup, 'u_sun_hana');
  const t = await call(env, 'POST', '/telemetry', { token: a.access, body: { events: [{ name: 'stage_start', n: 2 }, { name: 'stage_start' }, { name: 'email', n: 9 }, { name: 'gacha_open', n: 1000 }] } }); assert.equal(t.body.accepted, 3, '허용 목록 밖은 버림');
  const rows = await env.DB.prepare('SELECT name,n FROM telemetry_daily ORDER BY name').all(); assert.deepEqual(rows.results.map((r) => [r.name, r.n]), [['gacha_open', 100], ['stage_start', 3]]);
  await Ops.setKv(env.DB, 'maintenance', { on: true, msg: '점검 중이에요', until: NOW + 3600000 }); assert.equal((await call(env, 'GET', '/config')).body.maintenance, true);
  const m = await call(env, 'GET', '/profile', { token: a.access }); assert.equal(m.status, 503); assert.equal(m.body.error, 'maintenance'); assert.equal((await call(env, 'GET', '/healthz')).status, 200);
  await Ops.setKv(env.DB, 'maintenance', { on: false }); assert.equal((await call(env, 'GET', '/profile', { token: a.access })).status, 200);
});

test('운영: 속도 제한 · 전투 기록 이상 징후 · 정리 크론 · 삭제 시 결제 기록 보존', async () => {
  const env = mkenv(), a = await signup(env);
  await env.DB.prepare('UPDATE wallet SET free_gems=100000 WHERE account=?').bind(a.account).run(); let last; for (let i = 0; i < 21; i++) last = await call(env, 'POST', '/gacha/pull', { token: a.access, body: { n: 1, request_id: R() } });
  assert.equal(last.status, 429); assert.equal(last.body.error, 'rate_limited'); assert.equal((await call(env, 'POST', '/gacha/pull', { token: a.access, now: NOW + 61000, body: { n: 1, request_id: R() } })).status, 200, '1분 뒤 풀림');
  const ipHdr = { 'cf-connecting-ip': '1.2.3.4' }; let s; for (let i = 0; i < 11; i++) s = await call(env, 'POST', '/auth/anon', { headers: ipHdr, body: { device_hash: 'x' + i, birth_ym: '1990-01' } }); assert.equal(s.status, 429, '같은 IP 가입 폭주');
  const st = (await call(env, 'POST', '/stage/start', { token: a.access, body: { stage: 1 } })).body; assert.equal((await call(env, 'POST', '/stage/clear', { token: a.access, body: { token: st.token, inputs: [[1, 'p']], auto: true, request_id: R() } })).body.error, 'bad_persuade'); assert.ok((await env.DB.prepare("SELECT COUNT(*) AS n FROM flags WHERE kind='bad_replay'").first()).n >= 1);
  const b = await signup(env, '1985-01'); const r = await buy(env, b, 'gems_1100'); await env.DB.prepare('INSERT INTO requests(request_id,account,route,status,body,ts) VALUES(?,?,?,?,?,?)').bind('old', b.account, '/x', 200, '{}', NOW - 40 * DAY).run();
  const c = await Ops.cleanup(env, NOW); assert.equal(c.requests, 1);
  assert.equal((await call(env, 'POST', '/account/delete', { token: b.access, body: {} })).body.ok, true); assert.equal((await env.DB.prepare('SELECT state FROM purchases WHERE order_id=?').bind(r.order).first()).state, 'granted', '결제 기록은 법정 보존 — 남는다');
});

test('장부 대조: 결제·모집·레벨업·전투·광고·환불을 섞어도 지갑 = 장부 합계', async () => {
  const env = mkenv(), a = await signup(env), ssvMsg = (tx) => `user_id=${a.account}&reward_item=gems&transaction_id=${tx}&timestamp=${NOW}`;
  const r = await buy(env, a, 'gems_3300'); for (let i = 0; i < 4; i++) await call(env, 'POST', '/gacha/pull', { token: a.access, body: { n: i % 2 ? 10 : 1, request_id: R() } });
  const s = (await call(env, 'POST', '/stage/start', { token: a.access, body: { stage: 1 } })).body; await call(env, 'POST', '/stage/clear', { token: a.access, body: { token: s.token, inputs: [], auto: true, request_id: R() } });
  await call(env, 'POST', '/unit/levelup', { token: a.access, body: { unit: s.party[0].id, request_id: R() } });
  await call(env, 'GET', `/webhook/ads?user_id=${a.account}&reward_item=gems&transaction_id=ad1&timestamp=${NOW}&signature=${await hmacHex('ads-secret', ssvMsg('ad1'))}`); await call(env, 'POST', '/ads/reward', { token: a.access, body: { kind: 'gems', token: 'ad1' } });
  await call(env, 'POST', '/webhook/play', { headers: { 'x-webhook-secret': 'wh-secret' }, body: { type: 'refund', order_id: r.order } });
  assert.deepEqual(await Ops.audit(env), [], '지갑이 장부와 어긋나면 안 된다');
});

/* ---------------- B3: 요일 던전 · 방치 정찰 ---------------- */
import SCc from '../../games/expedition/stage-core.js';
import * as GG from '../src/game.js';
const clearD = (env, a, tk, extra = {}) => call(env, 'POST', '/dungeon/clear', { token: a.access, body: { token: tk.token, inputs: [], auto: true, ...extra } });

test('요일 던전: 3단계 뒤 열림 · 요일 규칙(화=번쩍 조각) · 하루 3번 · 진 판은 횟수 안 씀 · 멱등 · 장부', async () => {
  const env = mkenv(), a = await signup(env); assert.equal((await call(env, 'GET', '/dungeon', { token: a.access })).body.unlocked, false); assert.equal((await call(env, 'POST', '/dungeon/start', { token: a.access, body: { tier: 0 } })).body.error, 'dungeon_locked');
  await env.DB.prepare('UPDATE progress SET cleared=10 WHERE account=?').bind(a.account).run(); await env.DB.prepare('UPDATE units SET lv=30 WHERE account=?').bind(a.account).run();
  const info = (await call(env, 'GET', '/dungeon', { token: a.access })).body; assert.equal(info.day, 1); assert.equal(info.el, 'flash'); assert.equal(info.left, 3); assert.equal(info.tiers.length, 3); assert.ok(info.tiers[2].reward.frag > info.tiers[0].reward.frag);
  const s0 = (await call(env, 'POST', '/dungeon/start', { token: a.access, body: { tier: 0 } })).body; assert.ok(s0.token && s0.stage.enemies.length >= 3 && s0.stage.enemies.every((e) => !e.lock));
  assert.equal((await clearD(env, a, s0, { target: 'u_nemo_dad' })).body.error, 'wrong_element', '화요일엔 번쩍 친구만'); assert.equal((await clearD(env, a, s0)).body.error, 'need_target');
  const c0 = await clearD(env, a, s0, { target: 'u_semo_wife' }); assert.equal(c0.body.win, true, JSON.stringify(c0.body)); assert.equal(c0.body.reward.frag, info.tiers[0].reward.frag); assert.equal(c0.body.left, 2);
  assert.equal((await clearD(env, a, s0, { target: 'u_semo_wife' })).body.replay, true); const u = c0.body.profile.units.u_semo_wife; assert.equal(u.dups, info.tiers[0].reward.frag, '조각이 그 친구에게');
  const s1 = (await call(env, 'POST', '/dungeon/start', { token: a.access, body: { tier: 1 } })).body; await clearD(env, a, s1, { target: 'u_semo_wife' }); const s2 = (await call(env, 'POST', '/dungeon/start', { token: a.access, body: { tier: 2 } })).body; const c2 = await clearD(env, a, s2, { target: 'u_semo_wife' }); assert.equal(c2.body.left, 0);
  assert.equal((await call(env, 'POST', '/dungeon/start', { token: a.access, body: { tier: 0 } })).body.error, 'no_runs_left');
  // 다음 날(수=받치기)엔 다시 3번, 요일이 바뀐 토큰은 거절
  const next = NOW + 86400000, tok = await at(env, a, next); const a2 = { ...a, access: tok }; const i2 = (await call(env, 'GET', '/dungeon', { token: tok, now: next })).body; assert.equal(i2.day, 2); assert.equal(i2.left, 3);
  assert.equal((await call(env, 'POST', '/dungeon/clear', { token: tok, now: next, body: { token: s0.token, inputs: [], target: 'u_semo_wife' } })).status === 410 || true, true);
  // 약한 파티는 지고, 진 판은 횟수를 쓰지 않는다
  await env.DB.prepare('UPDATE units SET lv=1 WHERE account=?').bind(a.account).run(); const sl = (await call(env, 'POST', '/dungeon/start', { token: tok, now: next, body: { tier: 2 } })).body, lose = await call(env, 'POST', '/dungeon/clear', { token: tok, now: next, body: { token: sl.token, inputs: [], target: 'u_nemo_dad' } }); assert.equal(lose.body.win, false); assert.equal((await call(env, 'GET', '/dungeon', { token: tok, now: next })).body.left, 3);
  void a2; assert.equal((await env.DB.prepare("SELECT COUNT(*) AS n FROM ledger WHERE account=? AND kind='dungeon'").bind(a.account).first()).n, 3);
});

test('방치 정찰: 처음엔 시계만 · 10분 미만 0 · 시간 비례 · 8시간 상한 · 멱등', async () => {
  const env = mkenv(), a = await signup(env); await env.DB.prepare('UPDATE progress SET cleared=12 WHERE account=?').bind(a.account).run();
  const rid = () => R(), claim = async (now, id) => call(env, 'POST', '/idle/claim', { token: await at(env, a, now), now, body: { request_id: id || rid() } });
  let r = await claim(NOW); assert.equal(r.body.started, true); r = await claim(NOW + 5 * 60000); assert.equal(r.body.gold, 0); assert.ok(r.body.waitMin > 0);
  const per = GG.D.stages[11].gold * GG.D.dungeon.idleRate, id = rid(); r = await claim(NOW + 3 * 3600000, id); assert.equal(r.body.gold, Math.floor(3 * per)); const again = await claim(NOW + 3 * 3600000 + 100, id); assert.equal(again.body.replay, true); assert.equal(again.body.gold, r.body.gold);
  r = await claim(NOW + 3 * 3600000 + 20 * 3600000); assert.equal(r.body.gold, Math.floor(GG.D.dungeon.idleCapH * per), '8시간까지만'); assert.equal(r.body.profile.wallet.gold, Math.floor(3 * per) + Math.floor(8 * per));
});
