// 로컬 시험용 D1 호환 shim — node:sqlite(DatabaseSync) 위에서 D1 의 prepare/bind/first/all/run/batch 를 흉내 낸다(batch = 한 트랜잭션).
import { DatabaseSync } from 'node:sqlite';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

class Stmt {
  constructor(db, sql, args = []) { this.db = db; this.sql = sql; this.args = args; }
  bind(...a) { return new Stmt(this.db, this.sql, a.map((x) => (x === undefined ? null : x))); }
  first() { const r = this.db.prepare(this.sql).get(...this.args); return Promise.resolve(r === undefined ? null : { ...r }); }
  all() { return Promise.resolve({ results: this.db.prepare(this.sql).all(...this.args).map((r) => ({ ...r })), meta: {} }); }
  run() { const i = this.db.prepare(this.sql).run(...this.args); return Promise.resolve({ success: true, results: [], meta: { changes: Number(i.changes), last_row_id: Number(i.lastInsertRowid) } }); }
  _exec() { const s = this.db.prepare(this.sql); if (/^\s*select/i.test(this.sql)) return { results: s.all(...this.args).map((r) => ({ ...r })), meta: { changes: 0 } }; const i = s.run(...this.args); return { results: [], meta: { changes: Number(i.changes), last_row_id: Number(i.lastInsertRowid) } }; }
}
export class D1Shim {
  constructor(file = ':memory:') { this.db = new DatabaseSync(file); }
  prepare(sql) { return new Stmt(this.db, sql); }
  async batch(stmts) { this.db.exec('BEGIN'); try { const out = stmts.map((s) => s._exec()); this.db.exec('COMMIT'); return out; } catch (e) { try { this.db.exec('ROLLBACK'); } catch (x) { /* 이미 롤백 */ } throw e; } }
  exec(sql) { this.db.exec(sql); }
}
export function makeD1(file) {
  const d = new D1Shim(file), dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations');
  readdirSync(dir).filter((f) => f.endsWith('.sql')).sort().forEach((f) => d.exec(readFileSync(join(dir, f), 'utf8'))); return d;
}
