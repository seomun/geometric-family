// 이미 오른 집 레벨은 표가 바뀌어도 내려가지 않는다(D29): node tools/housing_lvfloor.js
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { window.__noResume = true; }); await p.goto('http://localhost:8765/games/merge/index.html'); await p.waitForTimeout(1600);
  const a = await p.evaluate(() => { Room.cfg.mode = 'adult'; Room.S.album = []; Room.S.lv = 20; Room.cozy = () => 500; const L = Room.levelInfo(); return { lv: Room.level(), raw: Room.levelRaw(), info: L }; });
  ok(a.raw < 20 && a.lv === 20 && a.info.lv === 20 && a.info.floor === 20, '표가 높아져 계산 레벨이 ' + a.raw + ' 이어도 이미 오른 Lv20 유지');
  ok(a.info.pct >= 0 && a.info.pct <= 1, '진행 막대 비율이 0~1 안 · ' + a.info.pct);
  const b2 = await p.evaluate(() => { Room.S.lv = 1; Room.S.album = [{ k: 'lv:18', kind: 'level', title: 'x', sub: '', d: '', t: 1 }, { k: 'lv:12', kind: 'level', title: 'y', sub: '', d: '', t: 2 }]; return { lv: Room.level(), floor: Room.lvFloor() }; });
  ok(b2.floor === 18 && b2.lv === 18, '집을 열지 않고 오른 레벨도 앨범 「레벨 N」 기록이 바닥(Lv18)');
  const c = await p.evaluate(() => { Room.cozy = () => 99999; return { lv: Room.level(), raw: Room.levelRaw() }; }); ok(c.lv === 30 && c.raw === 30, '아늑함이 넘치면 계산대로 올라감(Lv30)');
  const d = await p.evaluate(() => { Room.S.lv = 1; Room.S.album = []; Room.cozy = () => 0; return Room.level(); }); ok(d === 1, '바닥이 없으면 1부터');
  ok(errs.length === 0, '오류 없음 ' + (errs[0] || '')); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
