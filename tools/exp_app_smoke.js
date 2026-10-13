// ⑪ 베타 앱 HTML(games/app/expedition.html, 서버 주소 주입) 시험: node tools/exp_app_smoke.js — file:// 에서 열어 서버로 가입→홈 (WebView 와 같은 조건)
const { chromium } = require('playwright-core'); const { spawn, spawnSync } = require('child_process'); const fs = require('fs'); const os = require('os'); const path = require('path');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const port = 8791, API = 'http://127.0.0.1:' + port, dbf = path.join(os.tmpdir(), 'exp_app_' + Date.now() + '.sqlite');
  const b0 = spawnSync('python', ['games/tools/build_expedition.py', 'app'], { env: Object.assign({}, process.env, { GF_API: API }) }); ok(b0.status === 0, '앱 HTML 빌드(서버 주소 주입)');
  const srv = spawn(process.execPath, ['server/dev-local.js', String(port)], { env: Object.assign({}, process.env, { DB_FILE: dbf }), stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((res, rej) => { srv.stdout.on('data', (d) => { if (/expedition-api/.test(String(d))) res(); }); setTimeout(() => rej(new Error('서버 시간 초과')), 8000); });
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file:///' + path.resolve('games/app/expedition.html').replace(/\\/g, '/')); await p.waitForTimeout(1800);
  ok(await p.evaluate(() => !!document.querySelector('.ex-age')), '앱: 서버 모드로 연령 화면');
  await p.click('.ex-age .uk-btn'); await p.waitForTimeout(1500); ok(await p.evaluate(() => GF.cur && GF.cur.name === 'xhome'), 'file:// → 서버 가입 → 홈'); ok(await p.evaluate(() => EXP.debug.S().gems === 1500), '서버 재화 1,500');
  ok(/상점·설정/.test(await p.textContent('.ex-btns')), '홈에 상점·설정'); ok(errs.length === 0, '오류 없음 ' + errs[0]);
  await b.close(); srv.kill(); try { fs.unlinkSync(dbf); } catch (e) { /* 임시 */ } console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
