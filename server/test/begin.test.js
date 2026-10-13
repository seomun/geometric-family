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

test('픽업 2탄(B15): 배너마다 천장 따로 · 한정 동료는 그 배너에만 · 확률표도 배너별', async () => {
  const env = mkenv(), a = await signup(env);
  const main = (await call(env, 'GET', '/gacha/odds')).body, puss = (await call(env, 'GET', '/gacha/odds?banner=puss')).body;
  assert.equal(main.banner, 'main'); assert.equal(puss.banner, 'puss'); assert.ok(!main.rows.some((r) => r.id === 'u_puss_wife'), '한정 동료는 기본 배너 확률표에 없다'); assert.ok(puss.rows.some((r) => r.id === 'u_puss_wife' && r.pickup), '2탄 배너 픽업은 장화 신은 세모 아내');
  for (const o of [main, puss]) { const five = o.rows.filter((r) => r.grade === 5).reduce((x, r) => x + r.rate, 0); assert.ok(Math.abs(five - 0.025) < 1e-9, '★5 개별 합 = 2.5%'); assert.ok(Math.abs(o.rows.reduce((x, r) => x + r.rate, 0) - 1) < 1e-9, '개별 확률 합 100%'); assert.ok(o.effective && o.effective.grade[5] > 0.03); }
  assert.equal((await call(env, 'GET', '/gacha/odds?banner=nope')).body.error, 'bad_banner'); assert.equal((await call(env, 'POST', '/gacha/pull', { token: a.access, body: { n: 1, banner: 'nope', request_id: R() } })).body.error, 'bad_banner');
  const p1 = await call(env, 'POST', '/gacha/pull', { token: a.access, body: { n: 10, banner: 'puss', request_id: R() } }); assert.equal(p1.status, 200, JSON.stringify(p1.body)); assert.equal(p1.body.banner, 'puss'); assert.equal(p1.body.pity.pulls, 10);
  const prof = (await call(env, 'GET', '/profile', { token: a.access })).body; assert.equal(prof.pity.pulls, 0, '기본 배너 천장은 그대로'); assert.equal(prof.pities.puss.pulls, 10, '2탄 배너 천장은 따로'); assert.equal(prof.pities.main.pulls, 0);
  const G = (await import('../src/game.js')); let x = 12345; const rnd = () => { x = (x * 1103515245 + 12345) % 2147483648; return x / 2147483648; }, P = { since5: 0, since4: 0, guard: 0 }; let leak = 0, pk = 0; for (let i = 0; i < 20000; i++) { const r = G.GC.pullOnce(G.D.gacha, G.D.units, P, rnd, 'main'); if (r.id === 'u_puss_wife') leak++; } const Q = { since5: 0, since4: 0, guard: 0 }; for (let i = 0; i < 20000; i++) { const r = G.GC.pullOnce(G.D.gacha, G.D.units, Q, rnd, 'puss'); if (r.id === 'u_puss_wife') pk++; }
  assert.equal(leak, 0, '한정 동료는 기본 배너에서 절대 안 나온다'); assert.ok(pk > 20000 * 0.015, '2탄 배너에서는 픽업이 나온다 · ' + pk);
});

test('계절 이벤트(B14): 철·순서 판정 · 서버가 전투를 다시 돌려 확인 · 첫 클리어만 반짝석 · 멱등 · 장부', async () => {
  const env = mkenv(), a = await signup(env); await env.DB.prepare('UPDATE progress SET cleared=10 WHERE account=?').bind(a.account).run(); await env.DB.prepare('UPDATE units SET lv=40 WHERE account=?').bind(a.account).run();
  const info = (await call(env, 'GET', '/event', { token: a.access })).body; assert.equal(info.month, 10); assert.equal(info.event.id, 'ev_autumn'); assert.deepEqual(info.event.cleared, []);
  const st = (ev, k) => call(env, 'POST', '/event/start', { token: a.access, body: { ev, k } }), cl = (tk, extra = {}) => call(env, 'POST', '/event/clear', { token: a.access, body: { token: tk.token, inputs: [], auto: true, ...extra } });
  assert.equal((await st('ev_spring', 0)).body.error, 'event_closed', '10월엔 봄 이벤트가 닫혀 있다'); assert.equal((await st('nope', 0)).body.error, 'bad_event'); assert.equal((await st('ev_autumn', 1)).body.error, 'locked', '둘째 칸은 첫 칸 뒤'); assert.equal((await st('ev_autumn', 9)).body.error, 'bad_stage');
  const w0 = await wallet(env, a), s0 = (await st('ev_autumn', 0)).body; assert.ok(s0.token && s0.stage.enemies.length >= 3 && s0.stage.name === '송편 가게');
  const c0 = await cl(s0); assert.equal(c0.status, 200, JSON.stringify(c0.body)); assert.equal(c0.body.win, true); assert.equal(c0.body.first, true); assert.equal(c0.body.reward.gems, 20); assert.deepEqual(c0.body.cleared, [0]);
  const w1 = await wallet(env, a); assert.equal(w1.free_gems - w0.free_gems, 20); assert.ok(w1.gold > w0.gold);
  assert.equal((await cl(s0)).body.replay, true, '같은 토큰을 다시 보내도 한 번만'); assert.deepEqual(await wallet(env, a), w1);
  const s0b = (await st('ev_autumn', 0)).body, c0b = await cl(s0b); assert.equal(c0b.body.first, false); assert.equal(c0b.body.reward.gems, 0, '다시 깨면 반짝석 없음'); assert.ok(c0b.body.reward.gold > 0 && c0b.body.reward.gold <= c0.body.reward.gold / 2 + 1, '금화는 절반');
  const s1 = (await st('ev_autumn', 1)).body; assert.ok(s1.token, '첫 칸을 깨면 둘째 칸이 열림'); assert.equal((await cl(s1)).body.reward.gems, 30);
  const ledger = (await env.DB.prepare("SELECT COUNT(*) AS c, SUM(d_free) AS g FROM ledger WHERE account=? AND kind='event'").bind(a.account).first()); assert.equal(ledger.c, 3); assert.equal(ledger.g, 50);
  const bad = await call(env, 'POST', '/event/clear', { token: a.access, body: { token: s0.token + 'x', inputs: [], auto: true } }); assert.notEqual(bad.status, 200);
  // 다음 달(12월)엔 겨울 이벤트로 바뀌고 가을 토큰은 만료 취급
  const G2 = await import('../src/game.js'); const winter = await G2.eventInfo(env, a.account, Date.UTC(2026, 11, 5, 3)); assert.equal(winter.event.id, 'ev_winter'); assert.equal((await G2.eventInfo(env, a.account, Date.UTC(2027, 0, 31, 20))).event.id, 'ev_winter', 'KST 2월 1일 05시 = 겨울(1~2월)의 연속');
});

test('일일 임무(B22): 3개 · 오늘 장부에서 서버가 셈 · 한 번만 지급 · 어제 한 일은 안 셈 · 주 상자는 4일 채워야 · 한 번만', async () => {
  const env = mkenv(), a = await signup(env); let cur = a; const tok = a.access, tokAt = async (now) => { const r = await call(env, 'POST', '/auth/refresh', { body: { refresh: cur.refresh }, now }); assert.equal(r.status, 200, JSON.stringify(r.body)); cur = { ...cur, access: r.body.access, refresh: r.body.refresh }; return cur.access; }, wal = async (t, now) => (await call(env, 'GET', '/profile', { token: t, now })).body.wallet, D0 = (await call(env, 'GET', '/daily', { token: tok })).body;
  assert.equal(D0.missions.length, 3); assert.ok(D0.missions.every((m) => !m.done && !m.claimed)); assert.equal(D0.week.days, 0);
  assert.equal((await call(env, 'POST', '/daily/claim', { token: tok, body: { id: 'dq1' } })).body.error, 'not_yet'); assert.equal((await call(env, 'POST', '/daily/claim', { token: tok, body: { id: 'zz' } })).body.error, 'bad_mission');
  const addLedger = (kind, ts) => env.DB.prepare('INSERT INTO ledger(account,ts,kind,d_gold,reason,ref) VALUES(?,?,?,?,?,?)').bind(a.account, ts, kind, 0, 'x', 'ref' + Math.random()).run();
  // 일주일을 모의: 월요일(2026-10-19 KST)부터 4일 3개씩 채운다
  const MON = Date.UTC(2026, 9, 19, 3, 0, 0), days = [];
  await addLedger('stage', MON - DAY);      // 일요일에 한 일은 월요일에 안 셈
  assert.equal((await call(env, 'GET', '/daily', { token: await tokAt(MON), now: MON })).body.missions[0].done, false, '어제 한 일은 오늘 임무로 안 셈');
  for (let d = 0; d < 4; d++) {
    const now = MON + d * DAY, t = await tokAt(now);
    for (const [kind, id] of [['stage', 'dq1'], ['levelup', 'dq2'], ['idle', 'dq3']]) {
      await addLedger(kind, now + 1000); const w0 = await wal(t, now); const r = await call(env, 'POST', '/daily/claim', { token: t, body: { id }, now }); assert.equal(r.status, 200, JSON.stringify(r.body)); assert.equal(r.body.gold, 150);
      const w1 = await wal(t, now); assert.equal(w1.gold - w0.gold, 150); const r2 = await call(env, 'POST', '/daily/claim', { token: t, body: { id }, now }); assert.equal(r2.body.replay, true); assert.deepEqual(await wal(t, now), w1, '두 번 눌러도 한 번만');
    }
    const v = (await call(env, 'GET', '/daily', { token: t, now })).body; assert.equal(v.week.days, d + 1); assert.equal(v.week.ready, d === 3);
    if (d === 2) assert.equal((await call(env, 'POST', '/daily/week', { token: t, now })).body.error, 'not_yet', '3일째엔 상자가 안 열림');
    days.push(t);
  }
  const now = MON + 3 * DAY, t = days[3], w0 = await wal(t, now), wk = await call(env, 'POST', '/daily/week', { token: t, now }); assert.equal(wk.status, 200); assert.equal(wk.body.gems, 20); assert.equal(wk.body.gold, 1200);
  const w1 = await wal(t, now); assert.equal(w1.free_gems - w0.free_gems, 20); assert.equal(w1.gold - w0.gold, 1200); assert.equal((await call(env, 'POST', '/daily/week', { token: t, now })).body.replay, true); assert.deepEqual(await wal(t, now), w1, '상자도 한 번만');
  // 다음 주엔 새로 센다
  const nt = await tokAt(MON + 7 * DAY), nv = (await call(env, 'GET', '/daily', { token: nt, now: MON + 7 * DAY })).body; assert.equal(nv.week.days, 0); assert.equal(nv.week.box, false);
  const n = (await env.DB.prepare("SELECT COUNT(*) AS c FROM ledger WHERE account=? AND kind='daily'").bind(a.account).first()).c; assert.equal(n, 13, '임무 12 + 상자 1');
});
