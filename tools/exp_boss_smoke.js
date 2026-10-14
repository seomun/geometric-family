// ⑪ 주간 협동 보스(B26) 화면·서버 연동 시험: node tools/exp_boss_smoke.js — 로컬 개발 서버(D1 shim)로 가입 → 홈 👹 → 보스 화면(진행 막대·단계·내 기록) → 실제 전투 → 결과(피해·합계) → 참여 보상 한 번만 · 오늘 3번 한도 · 로컬(서버 없는) 판은 안내만
const { chromium } = require('playwright-core'); const { spawn } = require('child_process'); const os = require('os'); const path = require('path');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const dbf = path.join(os.tmpdir(), 'exp_boss_' + Date.now() + '.sqlite'), port = 8791, API = 'http://127.0.0.1:' + port;
  const srv = spawn(process.execPath, ['server/dev-local.js', String(port)], { env: Object.assign({}, process.env, { DB_FILE: dbf }), stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((res, rej) => { srv.stdout.on('data', (d) => { if (/expedition-api/.test(String(d))) res(); }); srv.stderr.on('data', (d) => console.log('srv', String(d).slice(0, 200))); setTimeout(() => rej(new Error('서버 시작 시간 초과')), 8000); });
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  try {
    // 로컬(서버 없는) 판: 안내만
    await p.goto('http://localhost:8765/games/expedition/index.html'); await p.waitForTimeout(1500);
    await p.evaluate(() => { const E = EXP.debug; E.reset(); E.S().flags.prologue = 1; E.save(); GF.stack = []; GF.go('xboss'); }); await p.waitForTimeout(700);
    ok(await p.evaluate(() => /서버에 연결하면/.test(document.querySelector('.ex-boss').innerText)), '서버 없는 판: 「서버에 연결하면 함께 싸울 수 있어요」 안내만');
    // 서버판
    await p.goto('http://localhost:8765/games/expedition/index.html?api=' + encodeURIComponent(API)); await p.waitForTimeout(1800);
    await p.evaluate(() => { const y = document.querySelectorAll('.ex-sel')[0]; y.value = String(new Date().getFullYear() - 25); }); await p.click('.ex-age .uk-btn'); await p.waitForTimeout(1500);
    ok(await p.evaluate(() => !!document.querySelector('[aria-label="weekly boss"]')), '서버판 홈에 👹 주간 보스 버튼');
    await p.evaluate(() => document.querySelector('[aria-label="weekly boss"]').click()); await p.waitForTimeout(1000);
    const t0 = await p.evaluate(() => ({ name: document.querySelector('.ex-bosscard b').textContent, tiers: document.querySelectorAll('.ex-bosstiers span').length, txt: document.querySelector('.ex-boss').innerText.replace(/\s+/g, ' ') }));
    ok(t0.name.length > 2 && t0.tiers === 3 && /오늘 3번 남음/.test(t0.txt) && /순위는 없어요|쉬어도 괜찮아요/.test(t0.txt), '보스 화면: 이름 · 단계 3 · 오늘 3번 남음 · 순위 없음 안내 · ' + t0.name); await p.screenshot({ path: 'notes/snapshots/b26_boss.png' });
    // 도전: 실제 전투(빠르게)
    await p.evaluate(() => { EXP.debug.S().speed = 3; EXP.debug.S().autoSkill = true; }); await p.evaluate(() => { [...document.querySelectorAll('.ex-boss .uk-btn')].find((x) => /도전하기/.test(x.textContent)).click(); }); await p.waitForTimeout(1500);
    await p.waitForFunction(() => document.querySelector('.uk-sheet') && /이번 도전 끝/.test(document.querySelector('.uk-sheet').innerText), null, { timeout: 90000 });
    const res = await p.evaluate(() => document.querySelector('.uk-sheet').innerText.replace(/\s+/g, ' ')); ok(/피해 [\d,]+/.test(res) && /모두의 합계/.test(res) && /오늘 남은 도전 2번/.test(res), '결과: 피해·모두의 합계·오늘 남은 도전 2번 · ' + res.slice(0, 70)); await p.screenshot({ path: 'notes/snapshots/b26_result.png' });
    await p.evaluate(() => { [...document.querySelectorAll('.uk-sheet .uk-btn')].find((x) => /보스 화면/.test(x.textContent)).click(); }); await p.waitForTimeout(1000);
    const t1 = await p.evaluate(() => document.querySelector('.ex-boss').innerText.replace(/\s+/g, ' ')); ok(/내 기록 피해 [\d,]+ · 도전 1번/.test(t1) && /오늘 2번 남음/.test(t1), '보스 화면에 내 기록 반영(도전 1번 · 2번 남음)');
    // 참여 보상: 한 번만
    const g0 = await p.evaluate(() => EXP.debug.http('GET', '/profile').then((q) => q.wallet.free_gems)); ok(/보상 받기/.test(t1), '참여 보상 버튼이 생김');
    await p.evaluate(() => { [...document.querySelectorAll('.ex-boss .uk-btn')].find((x) => /보상 받기/.test(x.textContent)).click(); }); await p.waitForTimeout(1200);
    const g1 = await p.evaluate(() => EXP.debug.http('GET', '/profile').then((q) => q.wallet.free_gems)); ok(g1 - g0 === 3, '참여 보상 💎+3 (한 번)'); ok(await p.evaluate(() => ![...document.querySelectorAll('.ex-boss .uk-btn')].some((x) => /보상 받기/.test(x.textContent))), '받은 뒤엔 보상 버튼이 사라짐');
    // 한도: 남은 2번을 쓰면 오늘은 끝
    for (let i = 0; i < 2; i++) { await p.evaluate(() => { [...document.querySelectorAll('.ex-boss .uk-btn')].find((x) => /도전하기/.test(x.textContent)).click(); }); await p.waitForFunction(() => document.querySelector('.uk-sheet') && /이번 도전 끝/.test(document.querySelector('.uk-sheet').innerText), null, { timeout: 90000 }); await p.evaluate(() => { [...document.querySelectorAll('.uk-sheet .uk-btn')].find((x) => /보스 화면/.test(x.textContent)).click(); }); await p.waitForTimeout(900); }
    const t2 = await p.evaluate(() => document.querySelector('.ex-boss').innerText.replace(/\s+/g, ' ')); ok(/오늘은 다 했어요/.test(t2) && /도전 3번/.test(t2), '3번 하면 오늘은 끝 · 도전 3번'); await p.screenshot({ path: 'notes/snapshots/b26_done.png' });
    ok(errs.length === 0, '오류 없음 ' + (errs[0] || ''));
  } finally { await b.close(); srv.kill(); }
  console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
