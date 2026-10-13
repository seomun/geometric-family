// 저장 손상 복구 시험(C12): node tools/save_recover.js — 집 저장이 깨져도(JSON 오류·잘림·모양 이상·가구가 비워짐) 가구를 잃지 않고, 전부 깨져도 앱이 죽지 않음. 앱 진행 저장이 깨져도 홈이 뜸
const { chromium } = require('playwright-core');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), ctx = await b.newContext({ viewport: { width: 390, height: 780 } }), p = await ctx.newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  const open = async () => { await p.goto('http://localhost:8765/games/merge/index.html'); await p.waitForTimeout(1600); };
  await p.addInitScript(() => { window.__noResume = true; }); await open();
  const key = await p.evaluate(() => Room.cfg.store.key);
  const N = await p.evaluate(() => { Room.data.items.filter((i) => !['kid', 'daybath', 'wall', 'story_k', 'kseason', 'kgift'].includes(i.set)).slice(0, 40).forEach((i) => Room.grant(i.id)); Room.save(); return Room.owned().length; });
  ok(N >= 30, '가구 ' + N + '개 모음'); await p.evaluate(() => { Room.grant(Room.data.items[3].id); Room.save(); Room.save(); });
  const keys = await p.evaluate((k) => ({ bak: !!localStorage.getItem(k + ':bak'), best: !!localStorage.getItem(k + ':best') }), key); ok(keys.bak && keys.best, '저장할 때 백업(:bak)과 최대치(:best)가 같이 쌓임');
  const count = async () => p.evaluate(() => Room.owned().length), reload = async () => { await open(); return count(); };
  const total = await count();
  // 1) 깨진 JSON
  await p.evaluate((k) => localStorage.setItem(k, '{"v":1,"items":['), key); ok((await reload()) >= total, '잘린 JSON → 가구 ' + total + '개 되살림');
  await p.evaluate((k) => localStorage.setItem(k, '{not json at all'), key); ok((await reload()) >= total, '아예 깨진 글자 → 되살림');
  // 2) 모양 이상
  await p.evaluate((k) => localStorage.setItem(k, '[]'), key); ok((await reload()) >= total, '배열로 바뀐 저장 → 되살림'); await p.evaluate((k) => localStorage.setItem(k, '{"v":1}'), key); ok((await reload()) >= total, '필드가 빠진 저장 → 되살림'); await p.evaluate((k) => localStorage.setItem(k, '{"v":2,"items":["x"],"placed":{}}'), key); ok((await reload()) >= total, '버전이 다른 저장 → 되살림');
  // 3) 유효하지만 가구가 비워진 저장(버그·사고)
  await p.evaluate((k) => localStorage.setItem(k, JSON.stringify({ v: 1, items: [], placed: {}, done: [], ts: Date.now() + 1000 })), key); ok((await reload()) >= total, '가구가 비워진 저장 → 최대치와 합쳐 되살림');
  const placedOk = await p.evaluate(() => Object.values(Room.S.placed).reduce((a, l) => a + l.length, 0)); ok(placedOk > 0, '놓은 위치도 되살아남 · ' + placedOk);
  // 4) 백업까지 전부 깨짐 → 새로 시작하되 죽지 않음
  await p.evaluate((k) => { ['', ':bak', ':best'].forEach((s) => localStorage.setItem(k + s, '###')); }, key); const n0 = await reload(); ok(n0 === 0 && errs.length === 0, '집 저장이 전부 깨져도 새 집으로 시작(오류 없음) · 가구 ' + n0);
  await p.evaluate(() => { Room.grant(Room.data.items[0].id); Room.save(); }); ok((await count()) === 1, '새로 시작한 뒤 정상 저장');
  // 5) 앱 진행 저장이 깨져도 홈이 뜸
  const appKeys = await p.evaluate(() => Object.keys(localStorage).filter((k) => /^gf:merge/.test(k)));
  await p.evaluate((ks) => ks.forEach((k) => localStorage.setItem(k, '{bad')), appKeys); await open(); ok(await p.evaluate(() => !!GF.cur && /home/.test(GF.cur.name)), '앱 진행 저장이 깨져도 홈이 뜸 · ' + appKeys.length + '개 키');
  ok(errs.length === 0, '오류 없음 ' + (errs[0] || '')); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
