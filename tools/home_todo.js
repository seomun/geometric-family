// 앱 홈 「오늘 할 일」 칩 시험(C5): node tools/home_todo.js — 성인 앱 홈 띠 안 오른쪽에 칩(아이콘+한 일/전체)이 뜨고, 다른 버튼을 가리지 않고, 누르면 오늘의 작은 일 목록, 다 하면 🎁 로 바뀜
const { chromium } = require('playwright-core'); const fs = require('fs');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const APPS = ['merge', 'quiz', 'block', 'spot', 'tile', 'sort', 'color'];
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const a of APPS) {
    if (!fs.existsSync('games/' + a + '/index.html')) continue;
    const p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.addInitScript(() => { window.__noResume = true; }); await p.goto('http://localhost:8765/games/' + a + '/index.html'); await p.waitForTimeout(2200);
    const kid = await p.evaluate(() => !!(window.GF && GF.ops && GF.ops.kid));
    const r = await p.evaluate(() => { const t = document.querySelector('.h2-band .h2-todochip'), bd = document.querySelector('.h2-band'); if (!t) return null; const c = t.getBoundingClientRect(), d = bd.getBoundingClientRect(); return { text: t.textContent, inside: c.left >= d.left && c.right <= d.right + 1 && c.top >= d.top - 1 && c.bottom <= d.bottom + 1, right: c.left > d.left + d.width * 0.6 }; });
    if (kid) { ok(!r, a + ': 유아 앱은 칩 없음'); await p.context().close(); continue; }
    ok(!!r && /\d\/\d/.test(r.text), a + ': 띠 안에 칩 ' + (r ? r.text : '없음')); if (r) { ok(r.inside, a + ': 칩이 띠 안에 들어감'); ok(r.right, a + ': 칩이 띠 오른쪽'); }
    ok(await p.evaluate(() => !document.querySelector('.h2-todo')), a + ': 띠 밖 별도 줄 없음(다른 버튼을 안 가림)');
    await p.screenshot({ path: 'notes/snapshots/c5_home_' + a + '.png' });
    if (a === 'merge' && r) {
      await p.click('.h2-todochip'); await p.waitForTimeout(500); ok(await p.evaluate(() => /오늘의 작은 일/.test(document.body.innerText)), 'merge: 칩을 누르면 오늘의 작은 일 목록(다음 목표로 가지 않음)'); await p.screenshot({ path: 'notes/snapshots/c5_missions_merge.png' });
      await p.evaluate(() => { document.querySelectorAll('.uk-scrim,.ops-sc').forEach((e) => e.remove()); GF.ops.missions().forEach((x) => { for (let i = 0; i < x.n; i++) GF.ops.note(x.id); }); GF.stack = []; GF.go('mhome'); }); await p.waitForTimeout(900);
      const after = await p.evaluate(() => (document.querySelector('.h2-todochip') || {}).textContent); ok(/🎁/.test(after || '') && /3\/3/.test(after || ''), 'merge: 작은 일을 다 하면 🎁 3/3 · ' + after);
      await p.screenshot({ path: 'notes/snapshots/c5_home_merge_done.png' });
    }
    ok(errs.length === 0, a + ': 오류 없음 ' + (errs[0] || '')); await p.context().close();
  }
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
