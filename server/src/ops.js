// ⑪ S1 WP7~8: 원격 설정·점검·이벤트·일 집계 분석·속도 제한·이상 징후·정리 크론.
import { HttpError, dayKst } from './lib.js';

const run = (db, sql, ...a) => db.prepare(sql).bind(...a);
const first = (db, sql, ...a) => db.prepare(sql).bind(...a).first();
const all = async (db, sql, ...a) => (await db.prepare(sql).bind(...a).all()).results || [];

/** 앱이 보내도 되는 분석 항목(개인 단위 로그 없음 — 하루 합계만). */
export const TELEMETRY = ['session', 'tutorial_done', 'stage_start', 'stage_clear', 'stage_fail', 'gacha_open', 'gacha_pull', 'iap_view', 'iap_cancel', 'ad_view', 'ad_reward', 'quit_stage'];

export async function kv(db, key) { const r = await first(db, 'SELECT value FROM config_kv WHERE key=?', key); if (!r) return null; try { return JSON.parse(r.value); } catch (e) { return r.value; } }
export const setKv = (db, key, val) => run(db, 'INSERT INTO config_kv(key,value) VALUES(?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value', key, JSON.stringify(val)).run();

/** 원격 설정: 점검·최소 버전·공지·진행 중 이벤트·광고/결제 규칙. 로그인 없이 읽는다(점검 중에도 열림). */
export async function config(env, base, now = Date.now()) {
  const db = env.DB, [maint, minClient, notice, events] = await Promise.all([kv(db, 'maintenance'), kv(db, 'min_client'), kv(db, 'notice'), all(db, 'SELECT id,start_ts,end_ts,title,payload FROM events WHERE start_ts<=? AND end_ts>? ORDER BY start_ts', now, now)]);
  return { ...base, maintenance: !!(maint && maint.on), maintenance_msg: maint && maint.on ? (maint.msg || '점검 중이에요. 곧 돌아올게요') : undefined, maintenance_until: maint && maint.until, min_client: minClient || 0, notice: notice || null, events: events.map((e) => ({ id: e.id, title: e.title, start: e.start_ts, end: e.end_ts, ...JSON.parse(e.payload || '{}') })) };
}
export async function inMaintenance(env) { const m = await kv(env.DB, 'maintenance'); return !!(m && m.on) ? m : null; }

export async function telemetry(env, events, now = Date.now()) {
  if (!Array.isArray(events) || events.length > 30) throw new HttpError(400, 'bad_events'); const day = dayKst(now); let n = 0;
  for (const e of events) { if (!e || !TELEMETRY.includes(e.name)) continue; const c = Math.max(1, Math.min(100, Math.floor(+e.n || 1))); await run(env.DB, 'INSERT INTO telemetry_daily(day,name,n) VALUES(?,?,?) ON CONFLICT(day,name) DO UPDATE SET n=n+excluded.n', day, e.name, c).run(); n++; }
  return { ok: true, accepted: n };
}

/** 속도 제한(고정 창). limit 넘으면 429. 키는 계정 또는 IP.
 *  돈·광고·로그인 길은 D1 에 세어(isolate 가 바뀌어도 정확), 나머지(전투·조회·통계)는 isolate 메모리에서 세어 D1 쓰기를 줄인다(B19: 요청마다 1쓰기+1읽기가 하루 쓰기의 40%였다). 메모리 제한은 isolate 단위 근사치라 한도의 여유를 둔다. */
export async function rateLimit(env, key, limit, windowSec, now = Date.now()) {
  const win = Math.floor(now / (windowSec * 1000));
  const r = await first(env.DB, 'INSERT INTO rate_limit(k,win,n) VALUES(?,?,1) ON CONFLICT(k) DO UPDATE SET n=CASE WHEN win=excluded.win THEN n+1 ELSE 1 END, win=excluded.win RETURNING n', key, win); if (r.n > limit) throw new HttpError(429, 'rate_limited', '너무 빨라요. 잠시 뒤에 다시 해 주세요');
}
const MEM = new Map();
export function memLimit(key, limit, windowSec, now = Date.now()) {
  const win = Math.floor(now / (windowSec * 1000)), e = MEM.get(key);
  if (!e || e.win !== win) { if (MEM.size > 5000) MEM.clear(); MEM.set(key, { win, n: 1 }); return; }
  if (++e.n > limit) throw new HttpError(429, 'rate_limited', '너무 빨라요. 잠시 뒤에 다시 해 주세요');
}
export const LIMITS = { 'POST /gacha/pull': [20, 60, 'db'], 'POST /stage/clear': [30, 60], 'POST /stage/start': [60, 60], 'POST /iap/verify': [10, 60, 'db'], 'POST /ads/reward': [10, 60, 'db'], 'POST /telemetry': [20, 60], '*': [120, 60] };
export const IP_LIMITS = { 'POST /auth/anon': [10, 60], 'POST /auth/refresh': [30, 60] };

/** 정리 크론(하루 한 번): 만료·폐기 토큰, 오래된 멱등 기록·속도 제한·미청구 광고 확인 삭제. */
export async function cleanup(env, now = Date.now()) {
  const db = env.DB, d = 86400000, out = {};
  out.tokens = (await run(db, 'DELETE FROM tokens WHERE expires_at<? OR (revoked=1 AND issued_at<?)', now, now - 7 * d).run()).meta.changes;
  out.requests = (await run(db, 'DELETE FROM requests WHERE ts<?', now - 30 * d).run()).meta.changes;
  out.rate_limit = (await run(db, 'DELETE FROM rate_limit WHERE win<?', Math.floor(now / 60000) - 120).run()).meta.changes;
  out.ad_claims = (await run(db, 'DELETE FROM ad_claims WHERE claimed=0 AND ts<?', now - d).run()).meta.changes;
  out.flags = (await run(db, 'DELETE FROM flags WHERE ts<?', now - 180 * d).run()).meta.changes; return out;
}

/** 장부 대조: 지갑(캐시)이 장부(진실)의 합과 다른 계정을 찾는다. 빈 배열이면 정상. */
export async function audit(env) {
  return all(env.DB, 'SELECT w.account, w.free_gems, w.paid_gems, w.gold, COALESCE(l.f,0) AS led_free, COALESCE(l.p,0) AS led_paid, COALESCE(l.g,0) AS led_gold FROM wallet w LEFT JOIN (SELECT account, SUM(d_free) AS f, SUM(d_paid) AS p, SUM(d_gold) AS g FROM ledger GROUP BY account) l ON l.account=w.account WHERE w.free_gems<>COALESCE(l.f,0) OR w.paid_gems<>COALESCE(l.p,0) OR w.gold<>COALESCE(l.g,0)');
}
