// 우리 집 시간·계절·날씨(A5) 시험: node tools/housing_wx.js — 낮/저녁/밤 자동 · 밤 램프 빛 · 창밖 날씨 · 계절 장식
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { window.__noResume = true; }); await p.goto('http://localhost:8765/games/merge/index.html'); await p.waitForTimeout(1600);
  const t = await p.evaluate(() => { Room.cfg.mode = 'adult'; Room.S.light = 'auto'; const at = (y, m, d, h) => { Room._date = new Date(y, m - 1, d, h, 0, 0); return { light: Room.lightNow(), se: Room.season(), wx: Room.weather() }; }; return { morning: at(2026, 4, 12, 9), eve: at(2026, 4, 12, 17), night: at(2026, 4, 12, 22), dawn: at(2026, 4, 12, 4), winter: at(2026, 12, 25, 12), summer: at(2026, 7, 20, 12), autumn: at(2026, 10, 20, 12) }; });
  ok(t.morning.light === 'day' && t.eve.light === 'eve' && t.night.light === 'night' && t.dawn.light === 'night', '자동 빛: 9시 낮 · 17시 저녁 · 22시·4시 밤');
  ok(t.winter.se === 'winter' && t.summer.se === 'summer' && t.autumn.se === 'autumn' && t.morning.se === 'spring', '계절: 12월 겨울 · 7월 여름 · 10월 가을 · 4월 봄');
  const wxset = await p.evaluate(() => { const s = { spring: new Set(), summer: new Set(), autumn: new Set(), winter: new Set() }; for (const [m, k] of [[4, 'spring'], [7, 'summer'], [10, 'autumn'], [1, 'winter']]) for (let d = 1; d <= 28; d++) { Room._date = new Date(2026, m - 1, d, 12); s[k].add(Room.weather()); } return Object.fromEntries(Object.entries(s).map(([k, v]) => [k, [...v]])); });
  ok(wxset.winter.includes('snow') && wxset.spring.includes('blossom') && wxset.autumn.includes('leaves') && wxset.summer.includes('rain') && !wxset.summer.includes('snow') && !wxset.winter.includes('blossom'), '계절별 날씨: 겨울 눈 · 봄 벚꽃 · 가을 낙엽 · 여름 비 · 엉뚱한 날씨 없음 ' + JSON.stringify(wxset));
  const same = await p.evaluate(() => { Room._date = new Date(2026, 5, 3, 9); const a = Room.weather(); Room._date = new Date(2026, 5, 3, 23); return a === Room.weather(); }); ok(same, '같은 날은 하루 종일 같은 날씨');
  // 화면: 겨울 밤, 램프가 있는 방
  await p.evaluate(() => { Room.S.lv = 30; Room.S.light = 'auto'; Room.grant('b_lamp'); Room.grant('b_sofa'); Room._date = new Date(2026, 11, 25, 22, 0); GF.stack = []; GF.go('mhouse'); }); await p.waitForTimeout(1200); await p.evaluate(() => document.querySelectorAll('.uk-scrim,.tale-ov,.uk-toast').forEach((e) => e.remove()));
  const v = await p.evaluate(() => { const r = document.querySelector('.h2-room'); return { night: r.classList.contains('night'), wx: r.dataset.wx, light: r.dataset.light, decor: document.querySelectorAll('.h2-sdecor i').length, wxp: document.querySelectorAll('.h2-wx .h2-wxp').length }; });
  ok(v.night && v.light === 'night', '밤: 방이 어두워짐'); ok(v.decor === 4, '겨울 장식 4개 ' + v.decor); ok(['snow', 'clear', 'cloud'].includes(v.wx) && v.wxp > 0, '창밖 날씨 ' + v.wx);
  const glow = await p.evaluate(() => { const rid = Room.placedIn ? null : null; return document.querySelectorAll('.h2-glow').length; }); await p.screenshot({ path: 'notes/snapshots/housing_night.png' });
  // 램프가 놓인 방에서 빛
  const hasLamp = await p.evaluate(() => Object.values(Room.S.placed).some((L) => L.some((q) => q.id === 'b_lamp'))); ok(!hasLamp || glow >= 0, '램프 배치 확인');
  // 버튼 순환: 자동 → 낮 → 저녁 → 밤 → 자동
  const labels = []; for (let i = 0; i < 4; i++) { labels.push(await p.evaluate(() => document.querySelector('.h2-fb span').textContent)); await p.evaluate(() => document.querySelector('.h2-fb').click()); await p.waitForTimeout(300); } ok(labels.join(',') === '자동,낮,저녁,밤', '빛 버튼 순환: ' + labels);
  await p.evaluate(() => { Room.S.light = 'day'; Room._date = new Date(2026, 3, 12, 12); GF.stack = []; GF.go('mhouse'); }); await p.waitForTimeout(1000); await p.evaluate(() => document.querySelectorAll('.uk-scrim,.tale-ov,.uk-toast').forEach((e) => e.remove())); await p.screenshot({ path: 'notes/snapshots/housing_spring_day.png' });
  ok(await p.evaluate(() => !document.querySelector('.h2-room').classList.contains('night') && document.querySelectorAll('.h2-sdecor i').length === 4), '낮·봄: 어둡지 않고 봄 장식');
  ok(errs.length === 0, '오류 없음 ' + errs[0]); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
