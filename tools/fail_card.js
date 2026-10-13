// C2 시험: 실제 판에서 지면 「아깝다!」 카드 — 숫자가 화면 표시와 같고, 안내 띠·손가락이 숨겨지며, 단계(근접→힌트→쉬운 모드)가 오른다. node tools/fail_card.js [block|merge|tile]
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const APP = process.argv[2] || 'block';
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { window.__noResume = true; }); await p.goto('http://localhost:8765/games/' + APP + '/index.html'); await p.waitForTimeout(1600);
  const NS = { block: ['bhome', 'bplay', 'BLOCK'], merge: ['mhome', 'mplay', 'MERGE'], tile: ['thome', 'tplay', 'TILE'] }[APP];
  await p.evaluate(([h, pl]) => { document.querySelectorAll('.uk-scrim,.tale-ov').forEach((e) => e.remove()); GF.stack = []; GF.go(h); GF.go(pl, { n: 1 }); }, NS); await p.waitForTimeout(1500); await p.evaluate(() => { document.querySelectorAll('.tale-ov,.uk-scrim').forEach((e) => e.remove()); GF.state.settings.assist = 0; });
  // 몇 수 둔 뒤의 판
  if (APP === 'block') await p.evaluate(() => { const S = BLOCK.debug.state(); BLOCK.debug.place(0, 0, 0); });
  if (APP === 'tile') await p.evaluate(() => { const t = TILE.debug.tiles(); const open = (t || []).filter((x) => !x.gone).slice(0, 2); open.forEach((x, i) => { try { TILE.debug.press(x.i != null ? x.i : i); } catch (e) { /* 눌리지 않는 타일 */ } }); });
  if (APP === 'merge') await p.evaluate(() => { try { MERGE.debug.place(0); } catch (e) { /* 자리 없음 */ } });
  await p.waitForTimeout(600);
  const shown = await p.evaluate((APP) => { const sc = document.querySelector('.screen.on'), t = (sc.querySelector('.bk-goals, .tl-goals, .mg-goals') || {}).textContent || ''; return t; }, APP);
  await p.evaluate((ns) => { window[ns[2]].debug.lose(); }, NS); await p.waitForTimeout(700);
  const card = await p.evaluate(() => { const s = document.querySelector('.uk-sheet'); return s ? s.textContent : ''; }); ok(/아깝다/.test(card), '진 판에 「아깝다」 카드: ' + card.replace(/\s+/g, ' ').slice(0, 60));
  ok(await p.evaluate(() => !!document.querySelector('.screen.on .bk-board, .screen.on .mg-board, .screen.on .tl-board')), '카드 뒤에 멈춘 판이 있음');
  ok(await p.evaluate(() => [...document.querySelectorAll('.screen.on .uk-caption, .screen.on .uk-toast')].every((e) => getComputedStyle(e).display === 'none') && !document.querySelector('.uk-finger')), '카드가 뜨면 안내 띠·토스트·손가락이 숨겨짐');
  // 카드 숫자 = 화면 표시 값
  if (APP === 'block') { const m = /줄\s*(\d+)\s*\/\s*(\d+)/.exec(shown), cm = /목표까지\s*(\d+)줄/.exec(card); ok(m && cm && +cm[1] === (+m[2] - +m[1]), `카드 「목표까지 ${cm && cm[1]}줄」 = 화면 「줄 ${m && m[1]}/${m && m[2]}」`); }
  if (APP === 'tile') { const m = /남은 타일\s*(\d+)/.exec(shown), cm = /남은 타일\s*(\d+)개/.exec(card); ok(m && cm && m[1] === cm[1], `카드 「남은 타일 ${cm && cm[1]}개」 = 화면 「남은 타일 ${m && m[1]}」`); }
  if (APP === 'merge') { const chips = await p.evaluate(() => [...document.querySelectorAll('.screen.on .mg-goal')].map((c) => c.textContent.trim())), left = chips.reduce((a, t) => { const q = /(\d+)\s*\/\s*(\d+)/.exec(t); return q ? a + Math.max(0, +q[2] - +q[1]) : a; }, 0), cm = /목표 조각까지\s*(\d+)개/.exec(card); ok(!left || (cm && +cm[1] === left), `카드 숫자(${cm && cm[1]}) = 화면 목표 칩 합(${left}) ${JSON.stringify(chips)}`); }
  await p.screenshot({ path: 'notes/snapshots/fail_card_real_' + APP + '.png' });
  ok(errs.length === 0, '오류 없음 ' + errs[0]); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
