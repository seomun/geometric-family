// ⑪ 초보자 미션 30·출석 7일(B11) 서버 시험: node --test test/ — 조건 판정은 서버가 장부·진행도에서 직접 · 받기는 멱등 · 출석은 하루 한 번(KST)
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

const wallet = async (env, a) => (await call(env, 'GET', '/profile', { token: a.access })).body.wallet;
const DAY = 86400000;

test('초보자 미션: 30개 · 못 채우면 거절 · 채우면 한 번만 지급(멱등) · 장부 1줄', async () => {
  const env = mkenv(), a = await signup(env), l0 = (await call(env, 'GET', '/beginner', { token: a.access })).body;
  assert.equal(l0.missions.length, 30); assert.ok(l0.missions.every((m) => !m.claimed)); assert.equal(l0.missions.filter((m) => m.done).length, 0, '새 계정은 아직 하나도 못 채움');
  assert.equal((await call(env, 'POST', '/beginner/claim', { token: a.access, body: { id: 'b01' } })).body.error, 'not_yet'); assert.equal((await call(env, 'POST', '/beginner/claim', { token: a.access, body: { id: 'zz' } })).body.error, 'bad_mission');
  await env.DB.prepare('UPDATE progress SET cleared=3 WHERE account=?').bind(a.account).run();
  const w0 = await wallet(env, a), r1 = await call(env, 'POST', '/beginner/claim', { token: a.access, body: { id: 'b01' } }); assert.equal(r1.status, 200); assert.equal(r1.body.gems, 10); assert.equal(r1.body.gold, 200);
  const w1 = await wallet(env, a); assert.equal(w1.free_gems - w0.free_gems, 10); assert.equal(w1.gold - w0.gold, 200);
  const r2 = await call(env, 'POST', '/beginner/claim', { token: a.access, body: { id: 'b01' } }); assert.equal(r2.body.replay, true); const w2 = await wallet(env, a); assert.deepEqual(w2, w1, '두 번 눌러도 한 번만');
  const n = (await env.DB.prepare("SELECT COUNT(*) AS c FROM ledger WHERE account=? AND kind='beginner'").bind(a.account).first()).c; assert.equal(n, 1);
  const l1 = (await call(env, 'GET', '/beginner', { token: a.access })).body; assert.equal(l1.missions.find((m) => m.id === 'b01').claimed, true); assert.equal(l1.missions.find((m) => m.id === 'b02').done, true, '3단계를 깼으니 b02 도 채움');
});

test('초보자 미션: 정찰·던전은 장부에서 센다(조작 불가), 도감은 받은 문턱 수', async () => {
  const env = mkenv(), a = await signup(env);
  await env.DB.prepare("INSERT INTO ledger(account,ts,kind,d_gold,reason,ref) VALUES (?,?,?,?,?,?)").bind(a.account, NOW, 'idle', 10, 'scout', 'x1').run();
  await env.DB.prepare("INSERT INTO ledger(account,ts,kind,d_gold,reason,ref) VALUES (?,?,?,?,?,?)").bind(a.account, NOW, 'dungeon', 10, 'd', 'x2').run();
  const l = (await call(env, 'GET', '/beginner', { token: a.access })).body.missions, by = (id) => l.find((m) => m.id === id); assert.equal(by('b08').done, true); assert.equal(by('b07').done, true); assert.equal(by('b24').done, false); assert.equal(by('b20').done, false);
});

test('출석 7일: 하루 한 번(KST) · 끊겨도 이어서 n번째 · 7일 뒤엔 끝', async () => {
  const env = mkenv(), a = await signup(env); let cur = a; const at = async (now) => { if (now !== NOW) { const t = await call(env, 'POST', '/auth/refresh', { body: { refresh: cur.refresh }, now }); assert.equal(t.status, 200, JSON.stringify(t.body)); cur = { ...cur, ...t.body }; } return call(env, 'POST', '/attend/claim', { token: cur.access, now }); };
  const w0 = await wallet(env, a), d1 = await at(NOW); assert.equal(d1.body.day, 1); assert.equal(d1.body.gold, 300); const w1 = await wallet(env, a); assert.equal(w1.gold - w0.gold, 300);
  const again = await at(NOW + 1800000); assert.equal(again.body.already, true); assert.equal((await wallet(env, a)).gold, w1.gold, '같은 날 두 번 안 받음');
  const d2 = await at(NOW + 5 * DAY); assert.equal(d2.body.day, 2, '며칠 쉬어도 연속이 끊겨 처음부터가 아니라 2번째 출석'); assert.equal(d2.body.gold, 400);
  let last; for (let k = 3; k <= 7; k++) { last = await at(NOW + (5 + k) * DAY); assert.equal(last.body.day, k); } assert.equal(last.body.gems, 50, '7번째 출석은 반짝석 50');
  const over = await at(NOW + 20 * DAY); assert.equal(over.body.done, true); const gems = (await env.DB.prepare("SELECT SUM(d_free) AS s FROM ledger WHERE account=? AND kind='attend'").bind(a.account).first()).s; assert.equal(gems, 100, '출석 반짝석 총 100');
  const v = (await call(env, 'GET', '/beginner', { token: a.access })).body; assert.equal(v.att.n, 7);
});
