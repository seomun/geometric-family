// 로컬 개발 서버(계정 불필요): node server/dev-local.js [port] — D1 shim(파일 DB) 위에서 Worker handle() 을 그대로 서비스한다. wrangler 없이도 클라이언트 연동 시험 가능.
import http from 'node:http';
import { mkdirSync } from 'node:fs';
import { makeD1 } from './test/d1shim.js';
import worker from './src/worker.js';
const port = +(process.argv[2] || 8788); mkdirSync(new URL('./.local/', import.meta.url), { recursive: true });
const file = process.env.DB_FILE || new URL('./.local/expedition.sqlite', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1');
let db; try { db = makeD1(file); } catch (e) { db = null; }   // 이미 마이그레이션된 파일이면 CREATE TABLE 이 실패 → 열기만
if (!db) { const { D1Shim } = await import('./test/d1shim.js'); db = new D1Shim(file); }
const env = { DB: db, JWT_SECRET: process.env.JWT_SECRET || 'dev-secret-not-for-prod', ENV: 'dev' };
http.createServer(async (req, res) => {
  const chunks = []; for await (const c of req) chunks.push(c); const body = Buffer.concat(chunks);
  const r = await worker.fetch(new Request('http://127.0.0.1:' + port + req.url, { method: req.method, headers: req.headers, body: ['GET', 'HEAD'].includes(req.method) ? undefined : body }), env);
  res.writeHead(r.status, Object.fromEntries(r.headers)); res.end(Buffer.from(await r.arrayBuffer()));
}).listen(port, '127.0.0.1', () => console.log('expedition-api(local) http://127.0.0.1:' + port + ' · DB ' + file));
