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
  assert.equal(o.effective.ver, 'eff-1'); assert.ok(o.effective.grade[5] > 0.025 && o.effective.grade[4] > 0.135, '실효 확률이 기본보다 높다(천장·10회 보장)'); assert.ok(o.rows.every((r) => r.eff > 0), '모든 동료에 실효 확률'); const es = o.rows.reduce((t, r) => t + r.eff, 0); assert.ok(Math.abs(es - 1) < 0.001, '실효 합 100%');
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

/* ---------------- WP4: 전투 판정 ---------------- */
import SC from '../../games/expedition/stage-core.js';
const clear = (env, a, tok, extra = {}) => call(env, 'POST', '/stage/clear', { token: a.access, body: { token: tok.token, inputs: [], auto: true, request_id: R(), ...extra } });
const grantAll = async (env, a, gold = 5000) => call(env, 'POST', '/dev/grant', { token: a.access, body: { gold, gems: 0 } });
const levelAll = async (env, a, times) => { const p = (await call(env, 'GET', '/profile', { token: a.access })).body; for (const id of p.progress.party) for (let i = 0; i < times; i++) await call(env, 'POST', '/unit/levelup', { token: a.access, body: { unit: id, request_id: R() } }); };

test('전투: 시작 토큰(서버 시드) → 같은 입력으로 재현 → 보상·진행 · 중복 제출은 같은 응답', async () => {
  const env = mkenv(), a = await signup(env);
  const s = (await call(env, 'POST', '/stage/start', { token: a.access, body: { stage: 1 } })).body; assert.ok(s.token && Number.isInteger(s.seed) && s.party.length === 5);
  const exp = SC.replay(G.D, { stage: 1, seed: s.seed, party: s.party, auto: true, inputs: [] }); assert.equal(exp.win, true, '시작 파티로 1단계는 이긴다');
  const c = await clear(env, a, s); assert.equal(c.status, 200, JSON.stringify(c.body)); assert.equal(c.body.win, true); assert.equal(c.body.hash, exp.hash, '서버 재현 해시 = 직접 재현'); assert.equal(c.body.first, true);
  assert.equal(c.body.profile.wallet.gold, 50); assert.equal(c.body.profile.wallet.free_gems, 1500 + G.D.gacha.clearGems); assert.equal(c.body.profile.progress.cleared, 1); assert.equal(c.body.profile.progress.stars['1'], exp.stars);
  const again = await clear(env, a, s); assert.equal(again.body.replay, true); assert.equal((await call(env, 'GET', '/profile', { token: a.access })).body.wallet.gold, 50, '같은 토큰으로 두 번 받지 않는다');
  const s2 = (await call(env, 'POST', '/stage/start', { token: a.access, body: { stage: 1 } })).body, c2 = await clear(env, a, s2); assert.equal(c2.body.first, false); assert.equal(c2.body.reward.gold, 25, '다시 깨면 금화 절반'); assert.equal(c2.body.reward.gems, 0);
});

test('전투: 잠긴 단계 · 남의/위조 토큰 · 접근 토큰 구분 · 잘못된 기록', async () => {
  const env = mkenv(), a = await signup(env), b = await signup(env, '1985-01');
  assert.equal((await call(env, 'POST', '/stage/start', { token: a.access, body: { stage: 3 } })).body.error, 'stage_locked'); assert.equal((await call(env, 'POST', '/stage/start', { token: a.access, body: { stage: 99 } })).body.error, 'bad_stage');
  const s = (await call(env, 'POST', '/stage/start', { token: a.access, body: { stage: 1 } })).body;
  assert.equal((await clear(env, b, s)).body.error, 'bad_stage_token', '남의 토큰은 안 된다'); assert.equal((await clear(env, a, { token: s.token + 'x' })).body.error, 'bad_token');
  assert.equal((await call(env, 'GET', '/profile', { token: s.token })).status, 401, '전투 토큰은 로그인 토큰이 아니다');
  assert.equal((await clear(env, a, s, { inputs: [[5, 'c', 9]] })).body.error, 'bad_inputs'); assert.equal((await clear(env, a, s, { inputs: [[5, 'p']] })).body.error, 'bad_persuade');
  assert.equal((await clear(env, a, s, { inputs: Array.from({ length: 900 }, () => [1, 'a', 1]) })).body.error, 'bad_inputs');
  assert.equal((await call(env, 'GET', '/profile', { token: a.access })).body.wallet.gold, 0, '거부된 요청은 아무것도 주지 않는다');
});

test('전투: 졌을 때는 보상·진행 없음(벌도 없음)', async () => {
  const env = mkenv(), a = await signup(env);
  // 1단계는 이기지만, 파티 레벨이 같을 때 5단계는 약한 파티로 지는지 — 강제로 잠금을 풀어 시험
  await env.DB.prepare('UPDATE progress SET cleared=4 WHERE account=?').bind(a.account).run();
  const s = (await call(env, 'POST', '/stage/start', { token: a.access, body: { stage: 5 } })).body, c = await clear(env, a, s);
  assert.equal(c.body.win, false); const p = (await call(env, 'GET', '/profile', { token: a.access })).body; assert.equal(p.progress.cleared, 4); assert.equal(p.wallet.gold, 0);
});

test('전투: 3단계 첫 클리어 → 합류, 6단계 포섭 → 바람 친구', async () => {
  const env = mkenv(), a = await signup(env); await grantAll(env, a, 60000); await levelAll(env, a, 9);
  await env.DB.prepare('UPDATE progress SET cleared=2 WHERE account=?').bind(a.account).run();
  const s3 = (await call(env, 'POST', '/stage/start', { token: a.access, body: { stage: 3 } })).body, c3 = await clear(env, a, s3); assert.equal(c3.body.win, true, JSON.stringify(c3.body)); assert.deepEqual(c3.body.joined, ['u_kid3']); assert.ok(c3.body.profile.units.u_kid3);
  await env.DB.prepare('UPDATE progress SET cleared=5 WHERE account=?').bind(a.account).run();
  // 6단계: 보스 체력이 30% 아래가 되면 말 걸기. 입력 기록은 시뮬로 만든다(클라이언트가 하는 것과 같음)
  const s6 = (await call(env, 'POST', '/stage/start', { token: a.access, body: { stage: 6 } })).body, st = G.D.stages[5];
  let n = null; for (let k = 0; k < 400 && n == null; k++) { const r = SC.replay(G.D, { stage: 6, seed: s6.seed, party: s6.party, auto: true, inputs: [[k, 'p']] }); if (!r.error) n = k; }
  assert.ok(n != null, '말 걸 수 있는 순간이 있다'); const c6 = await clear(env, a, s6, { inputs: [[n, 'p']] });
  assert.equal(c6.body.win, true, JSON.stringify(c6.body)); assert.equal(c6.body.recruited, true); assert.equal(c6.body.stars, 3); assert.ok(c6.body.profile.units.u_wind, '바람 친구 합류'); assert.equal(c6.body.profile.progress.flags.recruited, 1); void st;
});

test('전투: 입력 기록이 결과를 바꾼다(수동 스킬) — 서버가 같은 기록으로 같은 결과를 낸다', async () => {
  const s = { stage: 2, seed: 777, party: G.D.units.filter((u) => u.route === 'start').map((u) => ({ id: u.id, lv: 3 })) };
  const auto = SC.replay(G.D, { ...s, auto: true, inputs: [] }), man = SC.replay(G.D, { ...s, auto: false, inputs: [[0, 'c', 0], [3, 'c', 1], [6, 'c', 2]] });
  assert.notEqual(auto.hash, man.hash); assert.equal(man.hash, SC.replay(G.D, { ...s, auto: false, inputs: [[0, 'c', 0], [3, 'c', 1], [6, 'c', 2]] }).hash, '같은 기록 → 같은 결과');
});

test('3나라: 9단계 하나 합류 · 12단계 대장 · 24단계 바람 호랑이·36단계 깐깐한 아주머니 포섭(속성별 말 걸기) · 레벨 상한은 진행과 함께 오른다', async () => {
  const env = mkenv(), a = await signup(env); await env.DB.prepare('UPDATE units SET lv=30 WHERE account=?').bind(a.account).run();
  const go = async (stage, cleared, party) => { await env.DB.prepare('UPDATE progress SET cleared=? WHERE account=?').bind(cleared, a.account).run(); if (party) await call(env, 'POST', '/party', { token: a.access, body: { party } }); const s = (await call(env, 'POST', '/stage/start', { token: a.access, body: { stage } })).body; return s; };
  let s = await go(9, 8), c = await clear(env, a, s); assert.equal(c.body.win, true, JSON.stringify(c.body)); assert.deepEqual(c.body.joined, ['u_kid1']);
  // 12단계: 회오리 대장(포섭 없음) — 그냥 이기면 되고, 말 걸기는 거절된다
  s = await go(12, 11); assert.equal(SC.replay(G.D, { stage: 12, seed: s.seed, party: s.party, auto: true, inputs: [[3, 'p']] }).error, 'bad_persuade'); c = await clear(env, a, s); assert.equal(c.body.win, true, JSON.stringify(c.body)); assert.equal(c.body.recruited, false); assert.deepEqual(c.body.joined, []);
  // 24단계: 호랑이(돌보기) → 받치기(네모 아빠·엄마·막둥이)가 말을 건다. 번쩍·돌보기만으론 불가
  s = await go(24, 23); let m = null; for (let k = 0; k < 600 && m == null; k++) { if (SC.replay(G.D, { stage: 24, seed: s.seed, party: s.party, auto: true, inputs: [[k, 'p']] }).recruited) m = k; } assert.ok(m != null); c = await clear(env, a, s, { inputs: [[m, 'p']] }); assert.equal(c.body.recruited, true, JSON.stringify(c.body)); assert.ok(c.body.profile.units.u_tiger); assert.equal(G.D.units.find((u) => u.id === 'u_tiger').name, '바람 호랑이', '배역표 이름');
  s = await go(36, 35); let q = null; for (let k = 0; k < 600 && q == null; k++) { if (SC.replay(G.D, { stage: 36, seed: s.seed, party: s.party, auto: true, inputs: [[k, 'p']] }).recruited) q = k; } assert.ok(q != null); c = await clear(env, a, s, { inputs: [[q, 'p']] }); assert.equal(c.body.recruited, true, JSON.stringify(c.body)); assert.ok(c.body.profile.units.u_ajumma); assert.equal(G.D.units.find((u) => u.id === 'u_ajumma').name, '깐깐한 아주머니');
  assert.equal(G.SC.lvCap(G.D, 0), 10); assert.equal(G.SC.lvCap(G.D, 6), 10); assert.equal(G.SC.lvCap(G.D, 12), 12); assert.equal(G.SC.lvCap(G.D, 36), 20); assert.equal(G.SC.lvCap(G.D, 72), 32);
  await env.DB.prepare('UPDATE progress SET cleared=10 WHERE account=?').bind(a.account).run(); assert.equal((await call(env, 'POST', '/stage/start', { token: a.access, body: { stage: 36 } })).body.error, 'stage_locked');
});

test('육성 깊이(B2): 스킬 레벨·각성·승급·장비 — 비용·한도·멱등·전투 반영', async () => {
  const env = mkenv(), a = await signup(env), up = (unit, kind, slot, rid) => call(env, 'POST', '/unit/upgrade', { token: a.access, body: { unit, kind, slot, request_id: rid || R() } });
  await env.DB.prepare('UPDATE wallet SET gold=20000 WHERE account=?').bind(a.account).run(); const U = 'u_nemo_dad';
  let r = await up(U, 'skill'); assert.equal(r.status, 200, JSON.stringify(r.body)); assert.equal(r.body.unit.skl, 2); assert.equal(r.body.wallet.gold, 20000 - G.D.bal.grow.skillCost[0]);
  const rid = R(); const x1 = await up(U, 'gear', 0, rid), x2 = await up(U, 'gear', 0, rid); assert.equal(x2.body.replay, true); assert.deepEqual(x1.body.unit.gear, [1, 0, 0, 0]); assert.equal(x2.body.wallet.gold, x1.body.wallet.gold, '같은 요청은 한 번만');
  for (let i = 0; i < 12; i++) r = await up(U, 'gear', 1); assert.equal(r.body.error, 'max'); assert.equal((await up(U, 'gear', 9)).body.error, 'bad_slot');
  assert.equal((await up(U, 'awaken')).body.error, 'insufficient_dups', '조각이 모자라면 각성 불가');
  await env.DB.prepare('UPDATE units SET dups=200 WHERE account=? AND unit_id=?').bind(a.account, U).run(); r = await up(U, 'awaken'); assert.equal(r.body.unit.awk, 1); assert.equal(r.body.unit.dups, 200 - G.D.bal.grow.awkCost[0]);
  assert.equal((await up(U, 'promote')).body.error, 'need_level', '승급은 레벨 조건'); await env.DB.prepare('UPDATE units SET lv=10 WHERE account=? AND unit_id=?').bind(a.account, U).run(); r = await up(U, 'promote'); assert.equal(r.body.unit.promo, 1); assert.equal(r.body.unit.dups, 200 - 10 - 30);
  assert.equal((await up('u_wind', 'skill')).body.error, 'not_owned'); assert.equal((await up(U, 'zzz')).body.error, 'bad_kind');
  // 전투 스냅샷에 육성 상태가 들어가고, 배율이 실제로 올라간다
  const s = (await call(env, 'POST', '/stage/start', { token: a.access, body: { stage: 1 } })).body, me = s.party.find((p) => p.id === U); assert.equal(me.skl, 2); assert.equal(me.awk, 1); assert.equal(me.promo, 1); assert.equal(me.gear[0], 1);
  assert.ok(SC.kOf(G.D, U, me) > SC.kOf(G.D, U, me.lv) * 1.2, '승급(★3→★4 ×1.2) + 각성 + 장비가 전투력에 반영');
  assert.equal((await env.DB.prepare('SELECT COUNT(*) AS n FROM ledger WHERE account=? AND kind=?').bind(a.account, 'upgrade').first()).n >= 4, true);
});
