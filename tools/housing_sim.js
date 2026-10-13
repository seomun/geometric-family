// 「우리 집」 2.0 초반 속도 시뮬: node tools/housing_sim.js [하루에 깨는 판 수=12] → 날짜별 아늑함·집 레벨(성인/유아). games/26_HOUSING2.md §6
// 방식: 각 가구의 노력치(src.n 판 · 합치기 단계 · 식탁 조건 · 결과·이야기 등 근사)를 앱별로 모아 하루 판 수를 앱들에 나눠 쓰고, 얻는 대로 Room.placeAt 으로 놓은 뒤 Room.cozy()/Room.level() 을 읽는다(엔진 식 그대로).
// 단언: Lv2 ≤ 첫날, Lv5 ≤ 5일, Lv10 ≤ 21일, 유아 Lv(별) 증가가 멈추는 날 없음(하루 이상 정체 ≤ 14일).
const { chromium } = require('playwright-core'); const PER = +(process.argv[2] || 12); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const [app, kid] of [['merge', false], ['day', true]]) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 780 } }), p = await ctx.newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message)); await p.addInitScript(() => { window.__noResume = true; });
    await p.goto('http://localhost:8765/games/' + app + '/index.html'); await p.waitForTimeout(1500);
    const out = await p.evaluate(([per, kd]) => {
      const S = Room.S; S.items = []; S.placed = {}; S.story = {}; S.guests = {}; S.wish = []; Room.save();
      const effort = (it) => { const s = it.src || {}; if (s.kind === 'level') return s.n; if (s.kind === 'tier') return (s.t ? (s.t - 2) * 8 : 20) * (s.c === 0 ? 1 : 1.3); if (s.kind === 'chapter') return s.n * 10; if (s.kind === 'pages') return s.n * 3; if (s.kind === 'prop') return 15; if (s.kind === 'card') return 90; if (s.kind === 'season') return 400; return 25; };
      const group = (it) => (kd ? ['kid', 'daybath', 'wall', 'story_k'].includes(it.set) : !['kid', 'daybath', 'wall', 'story_k'].includes(it.set));
      const byApp = {}; Room.data.items.filter(group).forEach((it) => { const g = (it.src || {}).game || 'other'; (byApp[g] = byApp[g] || []).push(it); }); Object.values(byApp).forEach((a) => a.sort((x, y) => effort(x) - effort(y)));
      const apps = Object.keys(byApp), prog = {}; apps.forEach((a) => { prog[a] = 0; }); const rows = []; let lvPrev = 1;
      for (let day = 0; day <= 200; day++) {
        const share = per / apps.length; apps.forEach((a) => { prog[a] += day === 0 ? Math.max(share, 4) : share; byApp[a].forEach((it) => { if (!Room.has(it.id) && effort(it) <= prog[a]) { Room.grant(it.id); } }); });
        if (Room.checkStoryQuiet) Room.checkStoryQuiet();
        const c = Room.chapter(); if (c && Room.tasks().done >= c.tasks.length) { Room.S.story[c.room] = { done: 1 }; }
        const L = Room.levelInfo(); if (day % 5 === 0 || L.lv !== lvPrev) rows.push([day, Room.ownedCount(), L.cozy, L.lv]); lvPrev = L.lv;
      }
      return { rows, own: Room.ownedCount(), cozy: Room.cozy(), lv: Room.level(), total: Room.data.items.filter(group).length };
    }, [PER, kid]);
    console.log(`\n== ${app} (${kid ? '유아' : '성인'}) · 하루 ${PER}판 · 총 ${out.total}개 → 끝에 ${out.own}개 아늑함 ${out.cozy} 레벨 ${out.lv}`);
    const first = (lv) => (out.rows.find((r) => r[3] >= lv) || [null])[0]; console.log('  레벨 도달일: ' + [2, 5, 10, 15, 20, 25, 30].map((lv) => `Lv${lv}=${first(lv) == null ? '-' : first(lv) + '일'}`).join(' '));
    console.log('  ' + out.rows.filter((r, i) => i % 4 === 0).map((r) => `${r[0]}일:${r[1]}개/${r[2]}/Lv${r[3]}`).join('  '));
    ok(first(2) != null && first(2) <= 1, app + ' Lv2 ≤ 1일'); if (!kid) { ok(first(5) != null && first(5) <= 5, app + ' Lv5 ≤ 5일'); ok(first(10) != null && first(10) <= 21, app + ' Lv10 ≤ 21일'); } else ok(first(5) != null && first(5) <= 10, app + ' 유아 Lv5 ≤ 10일');
    ok(errs.length === 0, app + ' 오류 없음 ' + errs[0]); await ctx.close();
  }
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
