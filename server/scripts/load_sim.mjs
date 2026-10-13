// ⑪ 서버 비용·부하 시뮬(B18): node server/scripts/load_sim.mjs [사용자수=12] → docs/31_SERVER_COST.md
// 같은 코드(handle)를 D1 호환 shim 위에서 「평범한 하루」 시나리오로 돌리며 요청 수·D1 읽기/쓰기 행 수를 센다 → DAU 1천/1만/10만으로 키워 Cloudflare 한도·요금과 견준다.
// 주의: D1 요금의 「읽은 행」은 스캔한 행 수라 shim 의 「돌려준 행 수(최소 1)」는 하한 추정이다(색인으로 점 조회라 실제와 비슷하다고 보지만 스토어 출시 전 Cloudflare 대시보드로 재확인).
import { writeFileSync } from 'node:fs';
import { makeD1, D1Shim } from '../test/d1shim.js';
import { handle } from '../src/worker.js';
import * as G from '../src/game.js';

const NOW = Date.UTC(2026, 9, 13, 3, 0, 0), USERS = +(process.argv[2] || 12);
const C = { route: '', by: {} }; const bump = (k, f) => { const r = (C.by[k] = C.by[k] || { req: 0, stmts: 0, read: 0, write: 0 }); f(r); };
// shim 계측: 문장·읽은 행(SELECT 는 돌려준 행 수, 최소 1)·쓴 행(변경 수)
const wrap = (db) => {
  const prep = db.prepare.bind(db);
  db.prepare = (sql) => { const st = prep(sql), isSel = /^\s*select/i.test(sql); const patch = (name) => { const f = st[name].bind(st); st[name] = (...a) => f(...a).then((r) => { bump(C.route, (x) => { x.stmts++; if (isSel) x.read += Math.max(1, name === 'all' ? r.results.length : r ? 1 : 0); else x.write += (r && r.meta && r.meta.changes) || 0; }); return r; }); };
    ['first', 'all', 'run'].forEach(patch); const bind = st.bind.bind(st); st.bind = (...a) => { const b = bind(...a); ['first', 'all', 'run'].forEach((n) => { const f = b[n].bind(b); b[n] = (...x) => f(...x).then((r) => { bump(C.route, (z) => { z.stmts++; if (isSel) z.read += Math.max(1, n === 'all' ? r.results.length : r ? 1 : 0); else z.write += (r && r.meta && r.meta.changes) || 0; }); return r; }); }); const ex = b._exec.bind(b); b._exec = () => { const r = ex(); bump(C.route, (z) => { z.stmts++; if (isSel) z.read += Math.max(1, r.results.length); else z.write += (r.meta && r.meta.changes) || 0; }); return r; }; return b; }; return st; };
  return db;
};
const env = { DB: wrap(makeD1()), JWT_SECRET: 'sim-secret-0123456789', ENV: 'test' };
let rid = 0; const R = () => 'sim-' + (++rid);
const call = async (method, path, { body, token, now = NOW } = {}) => { C.route = method + ' ' + path.replace(/\?.*$/, ''); bump(C.route, (x) => { x.req++; }); const res = await handle(new Request('http://t' + path, { method, headers: { 'content-type': 'application/json', ...(token ? { authorization: 'Bearer ' + token } : {}) }, body: body ? JSON.stringify(body) : undefined }), env, now).catch((e) => ({ status: e.status || 500, json: async () => ({ error: e.code || 'internal' }) })); return { status: res.status, body: await res.json() }; };

const day = async (n) => {
  const a = (await call('POST', '/auth/anon', { body: { device_hash: 'sim' + n, birth_ym: '1990-05' } })).body, t = a.access;
  await env.DB.prepare('UPDATE progress SET cleared=12 WHERE account=?').bind(a.account).run(); await env.DB.prepare('UPDATE units SET lv=30 WHERE account=?').bind(a.account).run(); await env.DB.prepare('UPDATE wallet SET gold=5000 WHERE account=?').bind(a.account).run();
  C.by = Object.fromEntries(Object.entries(C.by).map(([k, v]) => [k, v])); const mark = JSON.parse(JSON.stringify(C.by));      // 가입 직후 상태 = 기준선(설치 비용은 따로)
  for (let s = 0; s < 2; s++) await call('GET', '/profile', { token: t });                                                            // 세션 2번
  for (let i = 0; i < 6; i++) { const st = (await call('POST', '/stage/start', { token: t, body: { stage: 1 } })).body; await call('POST', '/stage/clear', { token: t, body: { token: st.token, inputs: [], auto: true, request_id: R() } }); }   // 전투 6판
  await call('POST', '/gacha/pull', { token: t, body: { n: 10, request_id: R() } }); await call('POST', '/gacha/pull', { token: t, body: { n: 1, request_id: R() } });
  const owned = Object.keys((await call('GET', '/profile', { token: t })).body.units); for (let i = 0; i < 3; i++) await call('POST', '/unit/levelup', { token: t, body: { unit_id: owned[0], request_id: R() } });
  const dn = await call('GET', '/dungeon', { token: t }); if (dn.body.unlocked) { const s = (await call('POST', '/dungeon/start', { token: t, body: { tier: 0 } })).body; if (s.token) await call('POST', '/dungeon/clear', { token: t, body: { token: s.token, inputs: [], auto: true, target: owned[0] } }); }
  await call('POST', '/idle/claim', { token: t, body: { request_id: R() } }); await call('POST', '/idle/claim', { token: t, body: { request_id: R() } });
  await call('GET', '/beginner', { token: t }); await call('POST', '/attend/claim', { token: t, body: {} }); await call('POST', '/beginner/claim', { token: t, body: { id: 'b01' } });
  const ev = (await call('GET', '/event', { token: t })).body; if (ev.event) { const s = (await call('POST', '/event/start', { token: t, body: { ev: ev.event.id, k: 0 } })).body; if (s.token) await call('POST', '/event/clear', { token: t, body: { token: s.token, inputs: [], auto: true } }); }
  for (let i = 0; i < 3; i++) await call('POST', '/telemetry', { token: t, body: { events: [{ name: 'session', n: 1 }] } });
  void mark; return a;
};
const install = { req: 0, stmts: 0, read: 0, write: 0 };
const before = {}; for (let u = 0; u < USERS; u++) { await day(u); }
const tot = (f) => Object.values(C.by).reduce((s, v) => s + f(v), 0), routes = Object.entries(C.by).filter(([k]) => k !== 'POST /auth/anon').sort((a, b) => b[1].write - a[1].write);
const sumDay = { req: tot((v) => v.req), stmts: tot((v) => v.stmts), read: tot((v) => v.read), write: tot((v) => v.write) };
const anon = C.by['POST /auth/anon'] || { req: 0, stmts: 0, read: 0, write: 0 };
// 사용자 1명·하루(설치 가입 제외): 가입 직후 setup 쿼리(UPDATE 3)가 섞이니 보정
const per = { req: (sumDay.req - anon.req) / USERS, stmts: (sumDay.stmts - anon.stmts) / USERS, read: (sumDay.read - anon.read) / USERS, write: Math.max(0, (sumDay.write - anon.write - 3 * USERS)) / USERS };
Object.assign(install, { req: anon.req / USERS, stmts: anon.stmts / USERS, read: anon.read / USERS, write: anon.write / USERS });
const f1 = (x) => (Math.round(x * 10) / 10).toLocaleString('en'), M = (x) => (x / 1e6).toLocaleString('en', { maximumFractionDigits: 2 });
// Cloudflare 한도·요금(2025 공개값 기준 — 출시 전 재확인 필요)
const L = { wFree: 100000, wPaidMonthM: 10, wOverPerM: 0.30, wBase: 5, dFreeRead: 5e6, dFreeWrite: 1e5, dPaidReadB: 25, dPaidWriteM: 50, dReadPerM: 0.001, dWritePerM: 1.0 };
const rows = [1000, 10000, 100000].map((dau) => {
  const reqD = per.req * dau, readD = per.read * dau, writeD = per.write * dau, reqM = reqD * 30, readM = readD * 30, writeM = writeD * 30;
  const free = reqD <= L.wFree && readD <= L.dFreeRead && writeD <= L.dFreeWrite;
  const wCost = L.wBase + Math.max(0, reqM / 1e6 - L.wPaidMonthM) * L.wOverPerM, dCost = Math.max(0, readM / 1e6 - L.dPaidReadB * 1000) * L.dReadPerM + Math.max(0, writeM / 1e6 - L.dPaidWriteM) * L.dWritePerM;
  return { dau, reqD, readD, writeD, free, cost: free ? 0 : wCost + dCost, wCost, dCost, peakRps: reqD / 86400 * 8 };      // 피크 = 평균의 8배(저녁 몰림 가정)
});
const md = `# 31. ⑪ 서버 비용·부하 시뮬 (퍼블리셔 설명용, B18)

> 생성: \`node server/scripts/load_sim.mjs\` — **실제 서버 코드**(\`server/src\`)를 D1 호환 shim 위에서 「평범한 하루」 시나리오로 ${USERS}명 분 돌려 **요청 수·D1 읽은 행·쓴 행**을 센 값입니다. 숫자는 추정이고, 요금·한도는 2025년 공개값이라 **출시 전에 Cloudflare 대시보드로 다시 확인**해야 합니다. [제안]

## 1. 사용자 1명의 하루(시나리오)
세션 2번 · 전투 6판(시작+결과) · 모집 2번(10회·1회) · 레벨업 3번 · 요일 던전 1판 · 방치 정찰 2번 · 초보자 미션/출석 3번 · 이번 철 이벤트 1판 · 통계 3번. 가입(설치)은 한 번만(아래 별도).

| 항목 | 요청 | 쿼리 문장 | D1 읽은 행 | D1 쓴 행 |
|---|---|---|---|---|
| 하루 1명 | ${f1(per.req)} | ${f1(per.stmts)} | ${f1(per.read)} | ${f1(per.write)} |
| 설치 가입 1번 | ${f1(install.req)} | ${f1(install.stmts)} | ${f1(install.read)} | ${f1(install.write)} |

### 길(route)별 평균(사용자 1명·하루, 쓴 행 많은 순)
| 길 | 요청 | 문장 | 읽은 행 | 쓴 행 |
|---|---|---|---|---|
${routes.map(([k, v]) => `| \`${k}\` | ${f1(v.req / USERS)} | ${f1(v.stmts / USERS)} | ${f1(v.read / USERS)} | ${f1(v.write / USERS)} |`).join('\n')}

## 2. DAU별 규모 (피크는 평균의 8배로 가정)
| DAU | 요청/일 | D1 읽은 행/일 | D1 쓴 행/일 | 피크 req/s | Workers·D1 무료 한도 안? | 월 예상 비용(USD) |
|---|---|---|---|---|---|---|
${rows.map((r) => `| ${r.dau.toLocaleString('en')} | ${M(r.reqD)}M | ${M(r.readD)}M | ${M(r.writeD)}M | ${f1(r.peakRps)} | ${r.free ? '예' : '아니오'} | ${r.free ? '0' : f1(r.cost)} (Workers ${f1(r.wCost)} + D1 ${f1(r.dCost)}) |`).join('\n')}

## 3. 기준 한도·요금(재확인 필요)
- Workers 무료: 하루 ${L.wFree.toLocaleString('en')} 요청. 유료(월 $${L.wBase}): 월 ${L.wPaidMonthM}M 요청 포함, 초과 $${L.wOverPerM}/M.
- D1 무료: 읽은 행 하루 ${M(L.dFreeRead)}M · 쓴 행 하루 ${M(L.dFreeWrite)}M. 유료: 읽은 행 월 ${L.dPaidReadB}B · 쓴 행 월 ${L.dPaidWriteM}M 포함, 초과 읽기 $${L.dReadPerM}/M · 쓰기 $${L.dWritePerM}/M.
- 저장소: 장부(ledger)가 가장 빨리 커짐 — 계정당 하루 약 ${f1(per.write)} 행 중 장부·요청 기록이 대부분. 오래된 요청 기록(requests)은 정리 작업(보관 기간 정하기)이 필요.

## 3.5 적용한 쓰기 줄이기(B19)
- **속도 제한을 isolate 메모리로**: 전투·조회·통계 길은 D1 대신 메모리에서 세고(요청마다 1쓰기+1읽기 제거), 돈·광고·로그인 길(모집·결제 확인·광고 보상·가입)만 D1 에 세어 정확하게 유지. D1 쪽도 INSERT…RETURNING 으로 읽기를 1번 줄임.
- **전투 결과의 요청 기록 행 제거**: 같은 토큰 재전송 응답을 장부(ledger) 한 줄(reason 뒤에 응답 JSON)에 같이 적어 두고 그대로 돌려줌 → 전투 한 판당 쓰기 5→4.
- 효과: 사용자 1명·하루 D1 쓴 행 **80.8 → 약 41**(−49%), 문장 357 → 285, DAU 10만 월 비용 약 $225 → 약 $106. (같은 시나리오·같은 방법으로 재계측)

## 4. 읽는 법·결론
- **무료로 버티는 한계**는 쓴 행 기준 하루 약 ${Math.floor(L.dFreeWrite / Math.max(1, per.write)).toLocaleString('en')}명(DAU), 요청 기준 약 ${Math.floor(L.wFree / Math.max(1, per.req)).toLocaleString('en')}명. 둘 중 **${L.dFreeWrite / Math.max(1, per.write) < L.wFree / Math.max(1, per.req) ? 'D1 쓰기' : 'Workers 요청'}** 이 먼저 닿습니다.
- 월 비용은 DAU 1만에서 약 $${f1(rows[1].cost)}, 10만에서 약 $${f1(rows[2].cost)} — 대부분 **D1 쓰기**(전투 한 판마다 요청 기록·장부·지갑 갱신)입니다. 출시 초기(DAU 수천)는 무료~$5 수준이라 비용보다 **전투 재현(CPU 시간)·동시 접속 피크**를 먼저 보면 됩니다. 전투 재현 한 판은 CPU 수 ms~수십 ms(\`server/scripts/cpu_bench\` 참고)입니다.
- 더 줄이는 방법: ① 텔레메트리를 클라이언트가 묶어 한 번에 보내기 ② 모집 결과 기록(gacha_log)과 장부 통합 ③ 요청 기록(requests) 보관 기간 정하고 주기 정리 ④ 초보자 미션·프로필 조회는 읽기라 비용이 작음.
- 한계: shim 은 읽은 행을 「돌려준 행 수(최소 1)」로 세므로 실제 D1(스캔 행)과 다를 수 있습니다. 동시성·재시도(충돌 409)는 포함하지 않았습니다.
`;
writeFileSync('docs/31_SERVER_COST.md', md, 'utf8');
console.log('1인·하루', JSON.stringify({ req: f1(per.req), stmts: f1(per.stmts), read: f1(per.read), write: f1(per.write) }), '설치', JSON.stringify({ req: f1(install.req), write: f1(install.write) }));
console.log(rows.map((r) => `${r.dau}: req ${M(r.reqD)}M read ${M(r.readD)}M write ${M(r.writeD)}M free=${r.free} $${f1(r.cost)}`).join('\n'));
