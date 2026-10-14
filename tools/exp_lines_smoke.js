// ⑪ 동료 로비 대사(B21) 시험: node tools/exp_lines_smoke.js — 34명 모두 2줄 · 홈에서 누르면 말풍선(번갈아) · 도감에서 누르면 말풍선 · 모르는(미보유) 카드는 안 말함 · 압박 말투 없음
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:8765/games/expedition/index.html'); await p.waitForTimeout(1500);
  await p.evaluate(() => { const E = EXP.debug; E.reset(); E.S().flags.prologue = 1; E.save(); GF.stack = []; GF.go('xhome'); }); await p.waitForTimeout(900);
  const d = await p.evaluate(() => GF.data.expedition_slice.units.map((u) => ({ id: u.id, l: u.lines })));
  ok(d.length === 40 && d.every((u) => u.l && u.l.length === 2 && u.l.every((t) => t.length >= 8 && t.length <= 34)), '동료 ' + d.length + '명 모두 2줄(8~34자)');
  const bad = /왜 안|빨리|더 해야|안 오|늦|못했|실망/; ok(!d.some((u) => u.l.some((t) => bad.test(t))), '압박·재촉 말투 없음');
  ok(new Set(d.flatMap((u) => u.l)).size === 80, '80줄 모두 서로 다름');
  const first = await p.evaluate(() => document.querySelector('.ex-fam .ex-art').dataset.uid);
  await p.click('.ex-fam .ex-art >> nth=0'); await p.waitForTimeout(350);
  const t1 = await p.evaluate(() => document.querySelector('.ex-say') && document.querySelector('.ex-say').textContent);
  ok(!!t1 && d.find((u) => u.id === first).l[0] === t1, '홈: 대표 동료를 누르면 첫 줄 말풍선 · ' + t1); await p.screenshot({ path: 'notes/snapshots/b21_lobby_say.png' });
  await p.click('.ex-fam .ex-art >> nth=0'); await p.waitForTimeout(350);
  const t2 = await p.evaluate(() => document.querySelector('.ex-say').textContent); ok(t2 === d.find((u) => u.id === first).l[1], '다시 누르면 둘째 줄');
  await p.waitForTimeout(3900); ok(await p.evaluate(() => !document.querySelector('.ex-say')), '말풍선은 저절로 사라짐');
  await p.evaluate(() => { GF.go('xdex'); }); await p.waitForTimeout(700);
  await p.evaluate(() => { const c = [...document.querySelectorAll('.ex-dexgrid .ex-card')].find((x) => !x.classList.contains('dim')); c.click(); }); await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelector('.ex-dexhd .ex-art').click()); await p.waitForTimeout(350);
  ok(await p.evaluate(() => !!document.querySelector('.ex-say') && document.querySelector('.ex-say').textContent.length > 8), '도감: 보유 동료 그림을 누르면 말풍선'); await p.screenshot({ path: 'notes/snapshots/b21_dex_say.png' });
  await p.evaluate(() => document.querySelectorAll('.uk-scrim,.ex-say').forEach((e) => e.remove()));
  await p.evaluate(() => { const c = [...document.querySelectorAll('.ex-dexgrid .ex-card.dim')][0]; c.click(); }); await p.waitForTimeout(500);
  await p.evaluate(() => document.querySelector('.ex-dexhd .ex-art').click()); await p.waitForTimeout(300);
  ok(await p.evaluate(() => !document.querySelector('.ex-say')), '아직 못 만난 동료는 말하지 않음');
  ok(errs.length === 0, '오류 없음 ' + (errs[0] || '')); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
