// 다국어 추출 누수 점검(C16): node tools/i18n_leak.js — 앱 홈·판·결과·설정에서 「c16.」 같은 사전 키가 화면에 그대로 보이면 실패(사전이 안 올라온 때 GF.t 가 키를 돌려주는 사고).
// 모든 앱 첫 화면 + 판 하나 열기 + 설정 열기까지 돌며, GF.t 가 키를 그대로 돌려준 호출(missing)도 센다.
const { chromium } = require('playwright-core');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const APPS = [['merge', 'merge'], ['block', 'block'], ['tile', 'tile'], ['spot', 'spot'], ['sort', 'sort'], ['quiz', 'quiz'], ['idle', 'idle'], ['color', 'color'], ['day', 'day'], ['expedition', 'exp'], ['', 'play']];
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const [dir, name] of APPS) {
    const p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = [], miss = new Set(); p.on('pageerror', (e) => errs.push(e.message));
    await p.addInitScript(() => { window.__noResume = true; });
    await p.goto('http://localhost:8765/games/' + (dir ? dir + '/' : '') + 'index.html'); await p.waitForTimeout(1700);
    const hook = () => p.evaluate(() => { if (!GF.t.__hooked) { const t0 = GF.t; GF.t = (k, v) => { const r = t0(k, v); if (r === k && /^c16\./.test(k)) (window.__miss = window.__miss || []).push(k); return r; }; GF.t.__hooked = 1; } });
    await hook();
    const shots = []; const grab = async (tag) => { const txt = await p.evaluate(() => document.body.innerText); shots.push(tag); (txt.match(/c16\.[a-z_]+\.\d+/g) || []).forEach((k) => miss.add(k)); };
    await grab('home');
    // 앱 안의 큰 버튼을 차례로 눌러 화면을 넘겨 본다(최대 6번, 설정·판·결과 포함)
    for (let i = 0; i < 6; i++) {
      await p.evaluate((i) => { const bs = [...document.querySelectorAll('.screen.on .uk-btn, .uk-sheet .uk-btn')].filter((x) => !/replay|close/.test(x.className) && x.offsetParent); if (bs.length) bs[Math.min(i, bs.length - 1)].click(); }, i).catch(() => {}); await p.waitForTimeout(700); await hook().catch(() => {}); await grab('s' + i);
    }
    await p.evaluate(() => { try { if (GF.ops && GF.ops.openSettings) GF.ops.openSettings(); } catch (e) { /* 설정 없음 */ } }).catch(() => {}); await p.waitForTimeout(500); await grab('settings');
    const m2 = await p.evaluate(() => window.__miss || []).catch(() => []); m2.forEach((k) => miss.add(k));
    ok(miss.size === 0, name + ': 화면에 사전 키가 그대로 보이지 않음' + (miss.size ? ' → ' + [...miss].slice(0, 6).join(', ') : '')); ok(errs.length === 0, name + ': 오류 없음 ' + (errs[0] || ''));
    await p.context().close();
  }
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
