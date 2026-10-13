// ⑪ 스토리 = 튜토리얼(B7) 시험: node tools/exp_tips_smoke.js — 새 기능을 처음 열 때만 이야기 컷, 두 번째부터는 없음
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:8765/games/expedition/index.html?story=1'); await p.waitForTimeout(1500);
  const tale = () => p.evaluate(() => !!document.querySelector('.tale-ov, .tl, [class*="tale"]'));
  await p.evaluate(() => { localStorage.clear(); const E = EXP.debug; E.reset(); E.S().flags.prologue = 1; E.S().cleared = 5; E.save(); GF.stack = []; GF.go('xhome'); }); await p.waitForTimeout(500);
  const keys = ['gacha', 'dex', 'dungeon'], scr = { gacha: 'xgacha', dex: 'xdex', dungeon: 'xdun' };
  for (const k of keys) {
    await p.evaluate((s) => { document.querySelectorAll('.tale-ov').forEach((e) => e.remove()); GF.stack = []; GF.go('xhome'); GF.go(s); }, scr[k]); await p.waitForTimeout(1300);
    const first = await p.evaluate(() => !!document.querySelector('.tale-ov')); ok(first, k + ': 처음 열면 이야기 컷'); if (k === 'gacha') await p.screenshot({ path: 'notes/snapshots/exp_tip_gacha.png' });
    await p.evaluate(() => document.querySelectorAll('.tale-ov').forEach((e) => e.remove()));
    await p.evaluate((s) => { GF.stack = []; GF.go('xhome'); GF.go(s); }, scr[k]); await p.waitForTimeout(1300);
    ok(!(await p.evaluate(() => !!document.querySelector('.tale-ov'))), k + ': 두 번째부터는 없음');
  }
  ok(await p.evaluate(() => ['gacha', 'dex', 'dungeon'].every((k) => !!localStorage.getItem('gfx:tip:local:' + k))), '본 기록이 저장됨');
  ok(errs.length === 0, '오류 없음 ' + errs[0]); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
