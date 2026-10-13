// ⑪ 서버 WP1~3 시험: node --test test/  (계정·연령 대역·토큰·프로필·편성·레벨업·서버 뽑기·멱등·천장·동시성·분포·삭제)
import test from 'node:test';
import assert from 'node:assert/strict';
import { makeD1 } from './d1shim.js';
import { handle } from '../src/worker.js';
import * as G from '../src/game.js';
import { signJwt } from '../src/lib.js';

const NOW = Date.UTC(2026, 9, 13, 3, 0, 0);
const mkenv = () => ({ DB: makeD1(), JWT_SECRET: 'test-secret-0123456789', ENV: 'test' });
const call = async (env, method, path, { body, token, now = NOW } = {}) => { const res = await handle(new Request('http://t' + path, { method, headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined }), env, now).catch((e) => ({ status: e.status || 500, json: async () => ({ error: e.code || 'internal', msg: e.message }) })); return { status: res.status, body: await res.json() }; };
const signup = async (env, birth = '1990-05') => { const r = await call(env, 'POST', '/auth/anon', { body: { device_hash: 'dev1', birth_ym: birth } }); assert.equal(r.status, 201, JSON.stringify(r.body)); return r.body; };
let rid = 0; const R = () => 'req-' + (++rid);

test('healthz · config · odds', async () => {
  const env = mkenv(); assert.equal((await call(env, 'GET', '/healthz')).body.ok, true);
  const c = (await call(env, 'GET', '/config')).body; assert.equal(c.caps['19p'], 200000); assert.equal(c.caps['14_18'], 70000); assert.equal(c.ads.personalized, false);
  const o = (await call(env, 'GET', '/gacha/odds')).body; const sum = o.rows.reduce((s, r) => s + r.rate, 0); assert.ok(Math.abs(sum - 1) < 1e-9, '개별 확률 합 100%'); assert.equal(o.hard, 80);
});

test('연령 대역: 12 미만 차단 · 12~13 결제 차단 · 14~18 7만 · 19+ 20만', async () => {
  const env = mkenv();
  assert.equal((await call(env, 'POST', '/auth/anon', { body: { birth_ym: '2020-01' } })).body.error, 'age_blocked');
  const a = await signup(env, '2013-01'); assert.equal(a.age_band, '12_13'); assert.equal(a.payments_blocked, true); assert.equal(a.cap_krw, 0); assert.equal(a.guardian_notice, true);
  const b = await signup(env, '2009-06'); assert.equal(b.age_band, '14_18'); assert.equal(b.cap_krw, 70000); assert.equal(b.guardian_notice, true);
  const c = await signup(env, '1990-05'); assert.equal(c.age_band, '19p'); assert.equal(c.cap_krw, 200000); assert.equal(c.guardian_notice, false);
  assert.equal((await call(env, 'POST', '/auth/anon', { body: { birth_ym: 'abc' } })).body.error, 'bad_birth');
});

test('토큰: 인증 필요 · 위조·만료 거부 · 갱신 토큰 회전', async () => {
  const env = mkenv(), a = await signup(env);
  assert.equal((await call(env, 'GET', '/profile')).status, 401);
  assert.equal((await call(env, 'GET', '/profile', { token: a.access + 'x' })).body.error, 'bad_token');
  const old = await signJwt({ sub: a.account, exp: Math.floor(NOW / 1000) - 10 }, env.JWT_SECRET); assert.equal((await call(env, 'GET', '/profile', { token: old })).body.error, 'token_expired');
  const r1 = await call(env, 'POST', '/auth/refresh', { body: { refresh: a.refresh } }); assert.equal(r1.status, 200); assert.ok(r1.body.access);
  assert.equal((await call(env, 'POST', '/auth/refresh', { body: { refresh: a.refresh } })).body.error, 'bad_refresh');   // 한 번만
});

test('프로필: 시작 재화·동료·편성·천장', async () => {
  const env = mkenv(), a = await signup(env), p = (await call(env, 'GET', '/profile', { token: a.access })).body;
  assert.equal(p.wallet.free_gems, G.D.gacha.startGems); assert.equal(p.wallet.paid_gems, 0); assert.equal(Object.keys(p.units).length, 5); assert.equal(p.progress.party.length, 5); assert.deepEqual(p.pity, { since5: 0, since4: 0, guard: false, pulls: 0 });
});

test('편성: 5명·서로 다름·보유만', async () => {
  const env = mkenv(), a = await signup(env), t = a.access, S = G.STARTERS;
  assert.equal((await call(env, 'POST', '/party', { token: t, body: { party: S.slice(0, 4) } })).body.error, 'bad_party');
  assert.equal((await call(env, 'POST', '/party', { token: t, body: { party: [S[0], S[0], S[1], S[2], S[3]] } })).body.error, 'bad_party');
  assert.equal((await call(env, 'POST', '/party', { token: t, body: { party: [...S.slice(0, 4), 'u_nolbu_husband'] } })).body.error, 'not_owned');
  const ok = await call(env, 'POST', '/party', { token: t, body: { party: [...S].reverse() } }); assert.equal(ok.status, 200); assert.equal((await call(env, 'GET', '/profile', { token: t })).body.progress.party[0], S[S.length - 1]);
});

test('레벨업: 금화 부족 402 · 성공 · 같은 request_id 멱등 · 최고 레벨', async () => {
  const env = mkenv(), a = await signup(env), t = a.access, u = G.STARTERS[0];
  assert.equal((await call(env, 'POST', '/unit/levelup', { token: t, body: { unit: u, request_id: R() } })).body.error, 'insufficient_gold');
  await env.DB.prepare('UPDATE wallet SET gold=1000 WHERE account=?').bind(a.account).run();
  const id = R(), r1 = await call(env, 'POST', '/unit/levelup', { token: t, body: { unit: u, request_id: id } }); assert.equal(r1.body.unit.lv, 2); assert.equal(r1.body.wallet.gold, 1000 - G.levelCost(1));
  const r2 = await call(env, 'POST', '/unit/levelup', { token: t, body: { unit: u, request_id: id } }); assert.equal(r2.body.replay, true); assert.equal(r2.body.wallet.gold, r1.body.wallet.gold, '같은 id 는 두 번 차감 안 함');
  for (let i = 0; i < 20; i++) await call(env, 'POST', '/unit/levelup', { token: t, body: { unit: u, request_id: R() } });
  await env.DB.prepare('UPDATE wallet SET gold=999999 WHERE account=?').bind(a.account).run();
  let last; for (let i = 0; i < 12; i++) last = await call(env, 'POST', '/unit/levelup', { token: t, body: { unit: u, request_id: R() } }); assert.equal(last.body.error, 'max_level');
});

test('서버 뽑기: 1회 150 · 10회 1,425 · 결과 구조 · 로그·장부', async () => {
  const env = mkenv(), a = await signup(env), t = a.access;
  const r1 = await call(env, 'POST', '/gacha/pull', { token: t, body: { n: 1, request_id: R() } }); assert.equal(r1.status, 200); assert.equal(r1.body.wallet.free_gems, 1500 - 150); assert.equal(r1.body.results.length, 1); assert.equal(r1.body.pity.pulls, 1);
  const r10 = await call(env, 'POST', '/gacha/pull', { token: t, body: { n: 10, request_id: R() } }); assert.equal(r10.status, 402);   // 1,350 < 1,425 → 부족
  await env.DB.prepare('UPDATE wallet SET free_gems=5000 WHERE account=?').bind(a.account).run();
  const r10b = await call(env, 'POST', '/gacha/pull', { token: t, body: { n: 10, request_id: R() } }); assert.equal(r10b.body.wallet.free_gems, 5000 - 1425); assert.equal(r10b.body.results.length, 10); assert.equal(r10b.body.results.length, 10);
  const log = await env.DB.prepare('SELECT COUNT(*) AS c FROM gacha_log WHERE account=?').bind(a.account).first(); assert.equal(log.c, 2);
  const led = await env.DB.prepare("SELECT SUM(d_free) AS f FROM ledger WHERE account=? AND kind='gacha'").bind(a.account).first(); assert.equal(led.f, -(150 + 1425));
  assert.equal((await call(env, 'POST', '/gacha/pull', { token: t, body: { n: 3, request_id: R() } })).body.error, 'bad_n'); assert.equal((await call(env, 'POST', '/gacha/pull', { token: t, body: { n: 1 } })).body.error, 'no_request_id');
});

test('멱등: 같은 request_id 는 같은 결과 · 재화 한 번만', async () => {
  const env = mkenv(), a = await signup(env), t = a.access, id = R();
  const r1 = await call(env, 'POST', '/gacha/pull', { token: t, body: { n: 1, request_id: id } }), r2 = await call(env, 'POST', '/gacha/pull', { token: t, body: { n: 1, request_id: id } });
  assert.equal(r2.body.replay, true); assert.deepEqual(r2.body.results, r1.body.results); assert.equal((await call(env, 'GET', '/profile', { token: t })).body.wallet.free_gems, 1350);
});

test('천장: 80회째 ★5 확정 · 픽업 보장(★5가 픽업이 아니면 다음은 픽업)', async () => {
  const env = mkenv(), a = await signup(env), t = a.access; await env.DB.prepare('UPDATE wallet SET free_gems=99999 WHERE account=?').bind(a.account).run();
  await env.DB.prepare('UPDATE pity SET since5=79, guard=0 WHERE account=?').bind(a.account).run();
  const r = await call(env, 'POST', '/gacha/pull', { token: t, body: { n: 1, request_id: R() } }); assert.equal(r.body.results[0].grade, 5); assert.equal(r.body.pity.since5, 0);
  await env.DB.prepare('UPDATE pity SET since5=79, guard=1 WHERE account=?').bind(a.account).run();
  const r2 = await call(env, 'POST', '/gacha/pull', { token: t, body: { n: 1, request_id: R() } }); assert.equal(r2.body.results[0].unit, 'u_nolbu_husband', '보장이 있으면 픽업'); assert.equal(r2.body.pity.guard, false);
});

test('동시성: 같은 계정 동시 뽑기 — 재화·로그가 어긋나지 않는다', async () => {
  const env = mkenv(), a = await signup(env), t = a.access; await env.DB.prepare('UPDATE wallet SET free_gems=3000 WHERE account=?').bind(a.account).run();
  const rs = await Promise.all([1, 2, 3, 4, 5].map(() => call(env, 'POST', '/gacha/pull', { token: t, body: { n: 1, request_id: R() } })));
  const okN = rs.filter((x) => x.status === 200).length, conflict = rs.filter((x) => x.status === 409).length; console.log('  동시 응답 상태', rs.map((x) => x.status + (x.body.error ? ':' + x.body.error + (x.body.msg ? ' ' + x.body.msg : '') : '')).join(' ')); assert.equal(okN + conflict, 5); assert.equal(okN, 5, '서버 재시도로 모두 성공');
  const w = await env.DB.prepare('SELECT free_gems FROM wallet WHERE account=?').bind(a.account).first(), logs = await env.DB.prepare('SELECT COUNT(*) AS c FROM gacha_log WHERE account=?').bind(a.account).first(), py = await env.DB.prepare('SELECT pulls FROM pity WHERE account=?').bind(a.account).first();
  assert.equal(w.free_gems, 3000 - 150 * okN); assert.equal(logs.c, okN); assert.equal(py.pulls, okN);
});

test('분포: 서버와 같은 뽑기 코어 20만 회 — ★5 평균 32±1 · 최대 ≤ 80 · 확률표 일치', () => {
  let a = 0x1234567; const rand = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const P = { since5: 0, since4: 0, guard: 0 }; let n5 = 0, since = 0, max = 0, N = 200000; const cnt = {};
  for (let i = 0; i < N; i++) { since++; const r = G.GC.pullOnce(G.D.gacha, G.D.units, P, rand); cnt[r.grade] = (cnt[r.grade] || 0) + 1; if (r.grade === 5) { n5++; max = Math.max(max, since); since = 0; } }
  const mean = N / n5; assert.ok(mean > 31 && mean < 33.2, '★5 평균 ' + mean); assert.ok(max <= 80, '천장 ' + max); assert.ok(cnt[4] / N > 0.13 && cnt[4] / N < 0.18, '★4 실효 비율(10회 보장 포함) ' + cnt[4] / N);
});

test('삭제 요청: 계정 비활성·데이터 삭제', async () => {
  const env = mkenv(), a = await signup(env), t = a.access; assert.equal((await call(env, 'POST', '/account/delete', { token: t })).body.ok, true);
  assert.equal((await call(env, 'GET', '/profile', { token: t })).body.error, 'account_inactive');
  assert.equal((await env.DB.prepare('SELECT COUNT(*) AS c FROM units WHERE account=?').bind(a.account).first()).c, 0);
});
