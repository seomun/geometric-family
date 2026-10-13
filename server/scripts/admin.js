// ⑪ 운영 관리 CLI (WP8): node scripts/admin.js <명령> [인자]   — DB_FILE(기본 .local/expedition.sqlite)의 로컬 DB 를 직접 다룬다.
// 원격(Cloudflare D1)은 같은 SQL 을 `wrangler d1 execute expedition-db --remote --command "…"` 로 실행한다(scripts/queries.sql 참고). 관리 작업은 모두 장부(ledger)에 남긴다.
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { makeD1, D1Shim } from '../test/d1shim.js';
import { cleanup, setKv, kv, audit } from '../src/ops.js';
import { refundOrder } from '../src/shop.js';

const file = process.env.DB_FILE || join(dirname(fileURLToPath(import.meta.url)), '..', '.local', 'expedition.sqlite');
let db; try { db = makeD1(file); } catch (e) { db = new D1Shim(file); }   // 새 파일이면 마이그레이션, 이미 있으면 열기만
const env = { DB: db }, [cmd, ...args] = process.argv.slice(2), now = Date.now();
const rows = async (sql, ...a) => (await db.prepare(sql).bind(...a).all()).results, one = (sql, ...a) => db.prepare(sql).bind(...a).first(), exec = (sql, ...a) => db.prepare(sql).bind(...a).run();
const fmt = (r) => console.table(r);

const CMDS = {
  async stats() {
    fmt(await rows("SELECT (SELECT COUNT(*) FROM accounts WHERE status='active') AS 계정, (SELECT COUNT(*) FROM accounts WHERE has_paid=1) AS 결제자, (SELECT COUNT(*) FROM purchases WHERE state='granted') AS 주문, (SELECT COALESCE(SUM(amount_krw),0) FROM purchases WHERE state='granted') AS 매출_원, (SELECT COUNT(*) FROM wallet WHERE paid_gems<0) AS 마이너스잔고, (SELECT COUNT(*) FROM flags WHERE ts>?) AS 최근24h플래그", now - 86400000));
    fmt(await rows('SELECT day, name, n FROM telemetry_daily ORDER BY day DESC, name LIMIT 40'));
  },
  async account(id) { const a = await one('SELECT * FROM accounts WHERE id=?', id); if (!a) return console.log('없음'); delete a.birth_ym; console.log(a); fmt(await rows('SELECT * FROM wallet WHERE account=?', id)); fmt(await rows('SELECT ts,kind,d_free,d_paid,d_gold,reason,ref FROM ledger WHERE account=? ORDER BY id DESC LIMIT 20', id)); fmt(await rows('SELECT order_id,sku,state,amount_krw,gems FROM purchases WHERE account=?', id)); },
  async flags(n = 30) { fmt(await rows('SELECT datetime(ts/1000,"unixepoch") AS 시각, account, kind, detail FROM flags ORDER BY id DESC LIMIT ?', +n)); },
  async orders(id) { fmt(await rows(id ? 'SELECT * FROM purchases WHERE account=? ORDER BY ts DESC' : 'SELECT order_id,account,sku,state,amount_krw,gems,ym FROM purchases ORDER BY ts DESC LIMIT 50', ...(id ? [id] : []))); },
  async negative() { fmt(await rows('SELECT account, paid_gems, free_gems FROM wallet WHERE paid_gems<0')); },
  async grant(id, kind, n, why = 'admin') { n = +n; if (!id || !['gems', 'gold'].includes(kind) || !Number.isInteger(n)) return console.log('사용: grant <계정> gems|gold <수> [사유]'); const col = kind === 'gems' ? 'free_gems' : 'gold'; await exec(`UPDATE wallet SET ${col}=${col}+?, ver=ver+1 WHERE account=?`, n, id); await exec('INSERT INTO ledger(account,ts,kind,' + (kind === 'gems' ? 'd_free' : 'd_gold') + ',reason,ref) VALUES(?,?,?,?,?,?)', id, now, 'admin', n, why, 'admin-' + now); console.log('지급', id, kind, n, '(장부 기록)'); },
  async ban(id) { await exec("UPDATE accounts SET status='banned' WHERE id=?", id); console.log('정지', id); },
  async unban(id) { await exec("UPDATE accounts SET status='active' WHERE id=?", id); console.log('해제', id); },
  async maintenance(on, ...msg) { const v = on === 'on'; await setKv(db, 'maintenance', { on: v, msg: msg.join(' ') || '점검 중이에요', until: null }); console.log('점검', v ? '켬' : '끔'); },
  async minclient(v) { await setKv(db, 'min_client', +v); console.log('최소 클라이언트', +v); },
  async notice(...t) { await setKv(db, 'notice', t.join(' ') || null); console.log('공지', t.join(' ') || '(없앰)'); },
  async eventadd(id, startIso, endIso, title, payload = '{}') { await exec('INSERT INTO events(id,start_ts,end_ts,title,payload) VALUES(?,?,?,?,?)', id, Date.parse(startIso), Date.parse(endIso), title, payload); console.log('이벤트 추가', id); },
  async events() { fmt(await rows('SELECT id,title,datetime(start_ts/1000,"unixepoch") AS 시작,datetime(end_ts/1000,"unixepoch") AS 끝 FROM events ORDER BY start_ts')); },
  async refund(order) { console.log(await refundOrder(env, order, now)); },
  async audit() { const bad = await audit(env); console.log(bad.length ? '불일치 ' + bad.length + '건' : '장부와 지갑 일치'); if (bad.length) fmt(bad); },
  async cleanup() { console.log(await cleanup(env, now)); },
  async kv(k) { console.log(await kv(db, k)); },
};
if (!cmd || !CMDS[cmd]) { console.log('명령: ' + Object.keys(CMDS).join(' · ')); process.exit(cmd ? 1 : 0); }
await CMDS[cmd](...args);
