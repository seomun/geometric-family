// 앱 홈 「오늘 할 일」 한 줄 시험(C5): node tools/home_todo.js — 성인 앱 홈마다 한 줄이 뜨고, 띠와 겹치지 않고, 누르면 오늘의 작은 일 목록, 일을 하면 줄이 다음 일로 바뀜
const { chromium } = require('playwright-core'); const fs = require('fs');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const APPS = ['merge', 'quiz', 'block', 'spot', 'tile', 'sort', 'color', 'tables'];
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const a of APPS) {
    if (!fs.existsSync('games/' + a + '/index.html')) continue;
    const p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.addInitScript(() => { window.__noResume = true; }); await p.goto('http://localhost:8765/games/' + a + '/index.html'); await p.waitForTimeout(2200);
    const kid = await p.evaluate(() => !!(window.GF && GF.ops && GF.ops.kid));
    const r = await p.evaluate(() => { const t = document.querySelector('.h2-todo'), bd = document.querySelector('.h2-band'); if (!t) return null; const a = t.getBoundingClientRect(), c = bd && bd.getBoundingClientRect(); return { text: t.textContent, w: a.width, h: a.height, bottom: a.bottom, bandTop: c ? c.top : null, vis: a.height > 20 && a.top >= 0 && a.bottom <= innerHeight }; });
    if (kid) { ok(!r, a + ': 유아 앱은 줄 없음'); await p.context().close(); continue; }
    ok(!!r && /오늘 · /.test(r.text) && r.vis, a + ': 홈에 「오늘 ·」 한 줄 ' + (r ? r.text : '없음'));
    const hit = await p.evaluate(() => { const t = document.querySelector('.h2-todo'); if (!t) return []; const a = t.getBoundingClientRect(); return [...document.querySelectorAll('button,.uk-btn')].filter((e) => e !== t && !e.closest('.h2-band') && !e.classList.contains('h2-band') && e.offsetParent && !e.closest('.uk-bar,#bar,.topbar')).filter((e) => { const c = e.getBoundingClientRect(); return c.width > 30 && Math.min(a.right, c.right) - Math.max(a.left, c.left) > 4 && Math.min(a.bottom, c.bottom) - Math.max(a.top, c.top) > 22; }).map((e) => (e.textContent || e.className).trim().slice(0, 12)); });
    ok(hit.length === 0, a + ': 한 줄이 다른 버튼을 22px 넘게 가리지 않음 ' + hit.join('|'));
    if (r && r.bandTop != null) ok(r.bottom >= r.bandTop && r.bottom <= r.bandTop + 20, a + ': 한 줄이 띠 위쪽 모서리에 걸쳐 있음');
    if (a === 'merge' && r) {
      
      const before = r.text; await p.click('.h2-todo'); await p.waitForTimeout(500); ok(await p.evaluate(() => /오늘의 작은 일/.test(document.body.innerText)), 'merge: 누르면 오늘의 작은 일 목록'); await p.screenshot({ path: 'notes/snapshots/c5_missions_merge.png' });
      await p.evaluate(() => { document.querySelectorAll('.uk-scrim,.ops-sc').forEach((e) => e.remove()); const m = GF.ops.missions(); m.forEach((x) => { for (let i = 0; i < x.n; i++) GF.ops.note(x.id); }); GF.stack = []; GF.go('mhome'); }); await p.waitForTimeout(900);
      const after = await p.evaluate(() => (document.querySelector('.h2-todo') || {}).textContent); ok(/선물/.test(after || ''), 'merge: 작은 일을 다 하면 「선물」 안내로 바뀜 · ' + after);
    }
    await p.screenshot({ path: 'notes/snapshots/c5_home_' + a + '.png' });
    ok(errs.length === 0, a + ': 오류 없음 ' + (errs[0] || '')); await p.context().close();
  }
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
