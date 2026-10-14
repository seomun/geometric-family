// ⑪ 다시 걷기(B29) 시험: node tools/exp_walk_smoke.js — 12단계를 못 깨면 길·버튼 없음 · 다 깬 나라 목록(속성 섞임 표시) · 실제 전투 → 금화 + 색 변형 코드(반짝석 없음) · 다시 걷기는 금화 절반·같은 코드 · 서버판도 같은 흐름(반짝석 0)
const { chromium } = require('playwright-core'); const { spawn } = require('child_process'); const os = require('os'); const path = require('path'); const { DatabaseSync } = require('node:sqlite');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const walkOnce = async (p, label) => {
  await p.evaluate(() => { EXP.debug.S().speed = 3; EXP.debug.S().autoSkill = true; });
  await p.evaluate(() => { [...document.querySelectorAll('.ex-walk .ex-bg .uk-btn')][0].click(); }); await p.waitForTimeout(1500);
  await p.waitForFunction(() => document.querySelector('.uk-sheet') && /🪙 \+/.test(document.querySelector('.uk-sheet').innerText), null, { timeout: 90000 });
  return p.evaluate(() => document.querySelector('.uk-sheet').innerText.replace(/\s+/g, ' '));
};
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  try {
    // ---- 로컬 판 ----
    await p.goto('http://localhost:8765/games/expedition/index.html'); await p.waitForTimeout(1500);
    await p.evaluate(() => { const E = EXP.debug; E.reset(); E.S().flags.prologue = 1; E.S().cleared = 8; E.save(); GF.stack = []; GF.go('xhome'); }); await p.waitForTimeout(700);
    ok(await p.evaluate(() => !document.querySelector('[aria-label="walk again"]')), '12단계를 못 깼으면 다시 걷기 버튼이 없음');
    await p.evaluate(() => { const E = EXP.debug, S = E.S(); S.cleared = 36; Object.values(S.units).forEach((u) => { u.lv = 60; }); E.save(); GF.stack = []; GF.go('xhome'); }); await p.waitForTimeout(700);
    ok(await p.evaluate(() => !!document.querySelector('[aria-label="walk again"]')), '한 나라를 끝내면 🚶 버튼이 생김');
    await p.evaluate(() => document.querySelector('[aria-label="walk again"]').click()); await p.waitForTimeout(800);
    const t0 = await p.evaluate(() => ({ head: [...document.querySelectorAll('.ex-head')].pop().innerText.replace(/\s+/g, ' '), rows: document.querySelectorAll('.ex-walk .ex-bg').length, txt: document.querySelector('.ex-walk').innerText.replace(/\s+/g, ' ') }));
    ok(/다시 걷기/.test(t0.head) && t0.rows === 3 && /반짝석은 없어요/.test(t0.head), '길 화면: 철 규칙 이름 · 깬 나라 3줄 · 「반짝석은 없어요」 · ' + t0.head.slice(0, 40));
    ok(/속성이 평소와 달라요/.test(t0.txt) && /[△◻◯]/.test(t0.txt) && /처음 걸으면 🪙 \d+/.test(t0.txt), '속성 표시와 처음 걷기 금화가 보임'); await p.screenshot({ path: 'notes/snapshots/b29_walk.png' });
    const g0 = await p.evaluate(() => ({ gold: EXP.debug.S().gold, gems: EXP.debug.S().gems })), res = await walkOnce(p);
    const m = /🪙 \+(\d+)/.exec(res), code = (/코드 ([0-9A-Z]{6})/.exec(res) || [])[1]; ok(m && code, '처음 걷기 결과: 금화 +' + (m && m[1]) + ' · 색 변형 코드 ' + code); await p.screenshot({ path: 'notes/snapshots/b29_result.png' });
    const g1 = await p.evaluate(() => ({ gold: EXP.debug.S().gold, gems: EXP.debug.S().gems })); ok(g1.gold - g0.gold === +m[1] && g1.gems === g0.gems, '금화만 늘고 반짝석은 그대로(' + g0.gems + ')');
    const dec = await p.evaluate((c) => ExpStage.walkDecode(c), code); ok(dec && dec.v >= 1 && dec.v <= 3, '코드를 풀면 가구 번호·변형 번호(' + JSON.stringify(dec) + ')');
    await p.evaluate(() => { [...document.querySelectorAll('.uk-sheet .uk-btn')].find((x) => /길 목록/.test(x.textContent)).click(); }); await p.waitForTimeout(900);
    const t1 = await p.evaluate(() => document.querySelector('.ex-walk').innerText.replace(/\s+/g, ' ')); ok(new RegExp('새 색 [①②③] ' + code).test(t1) && /걸었어요 · 다시 걸으면/.test(t1), '목록에 ✔ 걸었어요 · 코드 ' + code + ' 표시');
    const res2 = await walkOnce(p), m2 = /🪙 \+(\d+)/.exec(res2), code2 = (/코드 ([0-9A-Z]{6})/.exec(res2) || [])[1]; ok(m2 && +m2[1] < +m[1] && /다시 걷기/.test(res2) && code2 === code, '다시 걷기: 금화 절반(+' + (m2 && m2[1]) + ') · 같은 코드');
    // ---- 서버판 ----
    const dbf = path.join(os.tmpdir(), 'exp_walk_' + Date.now() + '.sqlite'), port = 8793, API = 'http://127.0.0.1:' + port;
    const srv = spawn(process.execPath, ['server/dev-local.js', String(port)], { env: Object.assign({}, process.env, { DB_FILE: dbf }), stdio: ['ignore', 'pipe', 'pipe'] });
    await new Promise((res, rej) => { srv.stdout.on('data', (d) => { if (/expedition-api/.test(String(d))) res(); }); srv.stderr.on('data', () => {}); setTimeout(() => rej(new Error('서버 시작 시간 초과')), 8000); });
    try {
      await p.goto('http://localhost:8765/games/expedition/index.html?api=' + encodeURIComponent(API)); await p.waitForTimeout(1800);
      await p.evaluate(() => { document.querySelectorAll('.ex-sel')[0].value = String(new Date().getFullYear() - 25); }); await p.click('.ex-age .uk-btn'); await p.waitForTimeout(1500);
      const db = new DatabaseSync(dbf); const acc = db.prepare('SELECT account FROM progress LIMIT 1').get().account; db.prepare('UPDATE progress SET cleared=36 WHERE account=?').run(acc); db.prepare('UPDATE units SET lv=60 WHERE account=?').run(acc); db.close();
      await p.goto('http://localhost:8765/games/expedition/index.html?api=' + encodeURIComponent(API)); await p.waitForTimeout(2200);
      ok(await p.evaluate(() => !!document.querySelector('[aria-label="walk again"]')), '서버판: 🚶 버튼');
      await p.evaluate(() => document.querySelector('[aria-label="walk again"]').click()); await p.waitForTimeout(1200);
      const r0 = await p.evaluate(() => ({ rows: document.querySelectorAll('.ex-walk .ex-bg').length })); ok(r0.rows === 3, '서버판: 깬 나라 3줄');
      const w0 = await p.evaluate(() => EXP.debug.http('GET', '/profile').then((q) => ({ g: q.wallet.gold, f: q.wallet.free_gems }))), sr = await walkOnce(p), sm = /🪙 \+(\d+)/.exec(sr), sc = (/코드 ([0-9A-Z]{6})/.exec(sr) || [])[1];
      const w1 = await p.evaluate(() => EXP.debug.http('GET', '/profile').then((q) => ({ g: q.wallet.gold, f: q.wallet.free_gems })));
      ok(sm && sc && w1.g - w0.g === +sm[1] && w1.f === w0.f, '서버판: 금화 +' + (sm && sm[1]) + ' · 코드 ' + sc + ' · 반짝석 그대로');
    } finally { srv.kill(); }
    ok(errs.length === 0, '오류 없음 ' + (errs[0] || ''));
  } finally { await b.close(); }
  console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
