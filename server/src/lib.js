// ⑪ 서버 공용 도구: 오류·JSON 응답·JWT(HS256, WebCrypto)·해시·CSPRNG. 외부 의존 없음(Workers·node 모두 동작).
export class HttpError extends Error { constructor(status, code, msg) { super(msg || code); this.status = status; this.code = code; } }
export const json = (obj, status = 200, headers = {}) => new Response(JSON.stringify(obj), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });
const enc = new TextEncoder(), dec = new TextDecoder();
export const b64u = (buf) => { const b = buf instanceof Uint8Array ? buf : new Uint8Array(buf); let s = ''; b.forEach((c) => { s += String.fromCharCode(c); }); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
export const unb64u = (s) => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const r = atob(s), u = new Uint8Array(r.length); for (let i = 0; i < r.length; i++) u[i] = r.charCodeAt(i); return u; };
const hmacKey = (secret) => crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
export async function signJwt(payload, secret) { const h = b64u(enc.encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))), p = b64u(enc.encode(JSON.stringify(payload))), sig = await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(h + '.' + p)); return h + '.' + p + '.' + b64u(sig); }
export async function verifyJwt(token, secret, now = Date.now()) {
  const parts = String(token || '').split('.'); if (parts.length !== 3) throw new HttpError(401, 'bad_token');
  const ok = await crypto.subtle.verify('HMAC', await hmacKey(secret), unb64u(parts[2]), enc.encode(parts[0] + '.' + parts[1])); if (!ok) throw new HttpError(401, 'bad_token');
  let p; try { p = JSON.parse(dec.decode(unb64u(parts[1]))); } catch (e) { throw new HttpError(401, 'bad_token'); } if (!p.exp || p.exp * 1000 < now) throw new HttpError(401, 'token_expired'); return p;
}
export async function sha256hex(s) { const h = new Uint8Array(await crypto.subtle.digest('SHA-256', enc.encode(s))); return Array.from(h).map((b) => b.toString(16).padStart(2, '0')).join(''); }
export const randomToken = (n = 32) => b64u(crypto.getRandomValues(new Uint8Array(n)));
/** [0,1) CSPRNG — 서버 뽑기 판정용(클라이언트 난수는 연출 전용) */
export const csprng = () => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
export const uuid = () => crypto.randomUUID();
export async function readJson(req) { try { const t = await req.text(); return t ? JSON.parse(t) : {}; } catch (e) { throw new HttpError(400, 'bad_json'); } }
export async function hmacHex(secret, msg) { const sig = new Uint8Array(await crypto.subtle.sign('HMAC', await hmacKey(secret), enc.encode(msg))); return Array.from(sig).map((b) => b.toString(16).padStart(2, '0')).join(''); }
export function safeEq(a, b) { a = String(a); b = String(b); if (a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; }
const KST = 9 * 3600 * 1000;
export const ymKst = (now) => new Date(now + KST).toISOString().slice(0, 7);
export const dayKst = (now) => new Date(now + KST).toISOString().slice(0, 10);
export const nextYm = (now) => { const d = new Date(now + KST); return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1)).toISOString().slice(0, 7); };
