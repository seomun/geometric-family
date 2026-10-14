// ⑪ 기하학 원정대 API Worker (S1 WP1~3). 라우팅·인증·오류 처리. 로직은 game.js. 배포·비밀값은 계정 준비 뒤(D27) — 로컬은 wrangler dev 또는 test/ 의 D1 shim.
import { HttpError, json, readJson, signJwt, verifyJwt, sha256hex, randomToken, uuid, safeEq, dayKst } from './lib.js';
import * as G from './game.js';
import * as Shop from './shop.js';
import * as Ops from './ops.js';

const ACCESS_TTL = 3600, REFRESH_TTL = 60 * 86400;
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'authorization,content-type', 'access-control-allow-methods': 'GET,POST,OPTIONS' };   // 베타: 앱(WebView)·개발 서버에서 호출. 정식에서는 출처 제한

async function issue(env, account, deviceHash, ageBand, now) {
  const access = await signJwt({ sub: account, age: ageBand, iat: Math.floor(now / 1000), exp: Math.floor(now / 1000) + ACCESS_TTL }, env.JWT_SECRET), refresh = randomToken(32);
  await env.DB.prepare('INSERT INTO tokens(account,refresh_hash,device_hash,issued_at,expires_at) VALUES(?,?,?,?,?)').bind(account, await sha256hex(refresh), deviceHash || null, now, now + REFRESH_TTL * 1000).run(); return { access, refresh, expires_in: ACCESS_TTL };
}
async function auth(req, env, now) {
  const h = req.headers.get('authorization') || ''; if (!/^Bearer /.test(h)) throw new HttpError(401, 'no_token'); const p = await verifyJwt(h.slice(7), env.JWT_SECRET, now); if (p.typ === 'stage') throw new HttpError(401, 'bad_token');
  const acc = await env.DB.prepare('SELECT status FROM accounts WHERE id=?').bind(p.sub).first(); if (!acc || acc.status !== 'active') throw new HttpError(403, 'account_inactive'); return p.sub;
}

/** 낙관적 잠금 충돌(409 conflict)은 서버가 몇 번 다시 시도한다 — 클라이언트에는 거의 안 보인다 */
const retry = async (fn, n = 5) => { for (let i = 0; ; i++) { try { return await fn(); } catch (e) { if (!(e instanceof HttpError) || e.code !== 'conflict' || i >= n) throw e; } } };

export async function handle(req, env, now = Date.now()) {
  const url = new URL(req.url), path = url.pathname.replace(/\/+$/, '') || '/', key = req.method + ' ' + path;
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (!env.JWT_SECRET) throw new HttpError(500, 'no_secret', '서버 비밀값이 없어요');
  const base = { odds_ver: G.ODDS_VER, banner: G.D.gacha.banner, caps: { '12_13': 0, '14_18': 70000, '19p': 200000 }, ads: { inter_every: Shop.S.ads.interEvery, first_min: Shop.S.ads.interFirstMin, per_day: Shop.S.ads.interPerDay, personalized: false }, shop_ver: Shop.S.version };
  if (key !== 'GET /healthz' && key !== 'GET /config') { const m = await Ops.inMaintenance(env); if (m) return json({ error: 'maintenance', msg: m.msg || '점검 중이에요', until: m.until || null }, 503); }
  const ip = req.headers.get('cf-connecting-ip'); if (ip && Ops.IP_LIMITS[key]) await Ops.rateLimit(env, 'ip:' + key + ':' + ip, ...Ops.IP_LIMITS[key], now);
  switch (key) {
    case 'GET /healthz': return json({ ok: true, env: env.ENV || 'dev', odds_ver: G.ODDS_VER });
    case 'GET /config': return json(await Ops.config(env, base, now));
    case 'GET /iap/products': return json(Shop.products());
    case 'GET /webhook/ads': return json(await Shop.adWebhook(env, Object.fromEntries(url.searchParams), now));
    case 'POST /webhook/play': {   // 스토어 환불 통지(RTDN). 로컬은 공유 비밀 헤더 — 실제 Pub/Sub 푸시는 서명(JWT) 검증으로 교체(계정 뒤)
      if (!env.WEBHOOK_SECRET || !safeEq(req.headers.get('x-webhook-secret') || '', env.WEBHOOK_SECRET)) throw new HttpError(403, 'bad_secret'); const b = await readJson(req); if (b.type !== 'refund') return json({ ok: true, ignored: true }); return json(await retry(() => Shop.refundOrder(env, b.order_id, now))); }
    case 'GET /gacha/odds': return json(G.oddsTable(new URL(req.url).searchParams.get('banner')));
    case 'POST /auth/anon': {
      const b = await readJson(req), id = uuid(), a = await G.createAccount(env, { id, deviceHash: b.device_hash, birthYm: b.birth_ym, now }), t = await issue(env, id, b.device_hash, a.band, now);
      return json({ account: id, ...t, age_band: a.band, cap_krw: a.cap, guardian_notice: a.notice, payments_blocked: a.cap === 0 }, 201);
    }
    case 'POST /auth/refresh': {
      const b = await readJson(req), hash = await sha256hex(String(b.refresh || '')), row = await env.DB.prepare('SELECT account,expires_at,revoked FROM tokens WHERE refresh_hash=?').bind(hash).first();
      if (!row || row.revoked || row.expires_at < now) throw new HttpError(401, 'bad_refresh');
      const acc = await env.DB.prepare('SELECT age_band,status FROM accounts WHERE id=?').bind(row.account).first(); if (!acc || acc.status !== 'active') throw new HttpError(403, 'account_inactive');
      await env.DB.prepare('UPDATE tokens SET revoked=1 WHERE refresh_hash=?').bind(hash).run();     // 갱신 토큰은 한 번만(회전)
      return json(await issue(env, row.account, b.device_hash, acc.age_band, now));
    }
  }
  const account = await auth(req, env, now); { const [lim, win, mode] = Ops.LIMITS[key] || Ops.LIMITS['*']; if (mode === 'db') await Ops.rateLimit(env, 'a:' + key + ':' + account, lim, win, now); else Ops.memLimit('a:' + key + ':' + account, lim, win, now); }
  switch (key) {
    case 'GET /profile': return json(await G.profile(env, account, now));
    case 'POST /party': return json(await G.setParty(env, account, (await readJson(req)).party));
    case 'POST /unit/levelup': { const b = await readJson(req); if (!b.request_id) throw new HttpError(400, 'no_request_id'); return json(await retry(() => G.levelUp(env, account, b.unit, b.request_id, now))); }
    case 'POST /unit/upgrade': { const b = await readJson(req); return json(await retry(() => G.upgradeUnit(env, account, { unit: b.unit, kind: b.kind, slot: b.slot, requestId: b.request_id }, now))); }
    case 'GET /event': return json(await G.eventInfo(env, account, now));
    case 'POST /event/start': { const b = await readJson(req); return json(await G.eventStart(env, account, String(b.ev || ''), +b.k, now)); }
    case 'POST /event/clear': { const b = await readJson(req); const out = await retry(() => G.eventClear(env, account, { token: b.token, inputs: b.inputs, auto: b.auto }, now)); return json({ ...out, profile: await G.profile(env, account, now) }); }
    case 'GET /beginner': return json(await G.beginnerView(env, account));
    case 'POST /beginner/claim': { const b = await readJson(req); const out = await retry(() => G.beginnerClaim(env, account, String(b.id || ''), now)); return json({ ...out, ...(await G.beginnerView(env, account)), profile: await G.profile(env, account, now) }); }
    case 'GET /wkboss': return json(await G.wkInfo(env, account, now));
    case 'POST /wkboss/start': return json(await G.wkStart(env, account, now));
    case 'POST /wkboss/finish': { const b = await readJson(req); const out = await retry(() => G.wkFinish(env, account, { token: b.token, inputs: b.inputs, auto: b.auto }, now)); return json({ ...out, profile: await G.profile(env, account, now) }); }
    case 'POST /wkboss/claim': { const out = await retry(() => G.wkClaim(env, account, now)); return json({ ...out, profile: await G.profile(env, account, now) }); }
    case 'GET /walk': return json(await G.walkInfo(env, account, now));
    case 'POST /walk/start': { const b = await readJson(req); return json(await G.walkStart(env, account, b.n, now)); }
    case 'POST /walk/clear': { const b = await readJson(req); const out = await retry(() => G.walkClear(env, account, { token: b.token, inputs: b.inputs, auto: b.auto }, now)); return json({ ...out, profile: await G.profile(env, account, now) }); }
    case 'GET /daily': return json(await G.dailyView(env, account, now));
    case 'POST /daily/claim': { const b = await readJson(req); const out = await retry(() => G.dailyClaim(env, account, String(b.id || ''), now)); return json({ ...out, daily: await G.dailyView(env, account, now), profile: await G.profile(env, account, now) }); }
    case 'POST /daily/week': { const out = await retry(() => G.weeklyClaim(env, account, now)); return json({ ...out, daily: await G.dailyView(env, account, now), profile: await G.profile(env, account, now) }); }
    case 'POST /attend/claim': { const out = await retry(() => G.attendClaim(env, account, now)); return json({ ...out, ...(await G.beginnerView(env, account)), profile: await G.profile(env, account, now) }); }
    case 'POST /dex/claim': { const b = await readJson(req); const out = await retry(() => G.dexClaim(env, account, +b.n, now)); return json({ ...out, profile: await G.profile(env, account, now) }); }
    case 'GET /dungeon': return json(await G.dungeonInfo(env, account, now));
    case 'POST /dungeon/start': return json(await G.dungeonStart(env, account, +(await readJson(req)).tier, now));
    case 'POST /dungeon/clear': { const b = await readJson(req); const out = await retry(() => G.dungeonClear(env, account, { token: b.token, inputs: b.inputs, auto: b.auto, target: b.target }, now)); return json({ ...out, profile: await G.profile(env, account, now) }); }
    case 'POST /idle/claim': { const b = await readJson(req); const out = await retry(() => G.idleClaim(env, account, b.request_id, now)); return json({ ...out, profile: await G.profile(env, account, now) }); }
    case 'POST /gacha/pull': { const b = await readJson(req); return json(await retry(() => G.gachaPull(env, account, { banner: b.banner, n: b.n, requestId: b.request_id }, now))); }
    case 'POST /stage/start': return json(await G.stageStart(env, account, +(await readJson(req)).stage, now));
    case 'POST /stage/clear': { const b = await readJson(req); const out = await retry(() => G.stageClear(env, account, { token: b.token, inputs: b.inputs, auto: b.auto, requestId: b.request_id }, now)); return json({ ...out, profile: await G.profile(env, account, now) }); }
    case 'POST /dev/ad': {   // 개발·시험 전용: 광고 완료 확인(SSV)을 흉내 낸다. prod 에서는 404.
      if (!['dev', 'test'].includes(env.ENV)) throw new HttpError(404, 'not_found'); const b = await readJson(req), tok = 'dev-' + uuid(); await env.DB.prepare('INSERT INTO ad_claims(token,account,kind,ts,claimed,day) VALUES(?,?,?,?,0,?)').bind(tok, account, b.kind, now, dayKst(now)).run(); return json({ token: tok }); }
    case 'POST /dev/grant': {   // 개발·시험 전용(ENV=dev|test): 시험에서 재화를 바로 채울 때만 쓴다. prod 에서는 404.
      if (!['dev', 'test'].includes(env.ENV)) throw new HttpError(404, 'not_found'); const b = await readJson(req); const g = Math.max(0, Math.min(100000, +b.gems || 0)), c = Math.max(0, Math.min(100000, +b.gold || 0));
      await env.DB.batch([env.DB.prepare('UPDATE wallet SET free_gems=free_gems+?, gold=gold+?, ver=ver+1 WHERE account=?').bind(g, c, account), env.DB.prepare("INSERT INTO ledger(account,ts,kind,d_free,d_gold,reason,ref) VALUES(?,?,'grant',?,?,'dev',?)").bind(account, now, g, c, 'dev-' + now + '-' + Math.random())]); return json(await G.profile(env, account, now)); }
    case 'POST /iap/precheck': return json(await Shop.iapPrecheck(env, account, (await readJson(req)).sku, now));
    case 'POST /iap/verify': { const b = await readJson(req); return json(await retry(() => Shop.iapVerify(env, account, { store: b.store, sku: b.sku, token: b.purchase_token || b.receipt, orderId: b.order_id, requestId: b.request_id }, now))); }
    case 'POST /iap/cap': return json(await Shop.setCap(env, account, (await readJson(req)).cap_krw, now));
    case 'POST /iap/withdraw': return json(await Shop.iapWithdraw(env, account, (await readJson(req)).order_id, now));
    case 'POST /ads/reward': { const b = await readJson(req); return json(await retry(() => Shop.adReward(env, account, { kind: b.kind, token: b.token }, now))); }
    case 'POST /telemetry': return json(await Ops.telemetry(env, (await readJson(req)).events, now));
    case 'POST /account/delete': return json(await G.deleteAccount(env, account));
  }
  throw new HttpError(404, 'not_found');
}

export default {
  async scheduled(event, env) { await Ops.cleanup(env); },       // wrangler.toml [triggers] crons — 하루 한 번 정리
  async fetch(req, env) {
    try { const res = await handle(req, env); Object.entries(CORS).forEach(([k, v]) => res.headers.set(k, v)); return res; }
    catch (e) { const res = e instanceof HttpError ? json({ error: e.code, msg: e.message }, e.status) : (console.error(e), json({ error: 'internal' }, 500)); Object.entries(CORS).forEach(([k, v]) => res.headers.set(k, v)); return res; }
  },
};
