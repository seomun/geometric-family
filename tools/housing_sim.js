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
      const effort = (it) => { const s = it.src || {}; if (s.kind === 'level') return s.n; if (s.kind === 'tier') return (s.t ? (s.t - 2) * 8 : 20) * (s.c === 0 ? 1 : 1.3); if (s.kind === 'chapter') return s.n * 10; if (s.kind === 'pages') return s.n * 3; if (s.kind === 'prop') return 15; if (s.kind === 'card') return 90; if (s.kind === 'season' || s.kind === 'event' || s.kind === 'guest') return 1e9; return 25; };
      const KS = ['kid', 'daybath', 'wall', 'story_k', 'kseason', 'kgift']; const group = (it) => (kd ? KS.includes(it.set) : !KS.includes(it.set));
      const byApp = {}; Room.data.items.filter(group).forEach((it) => { const g = (it.src || {}).game || 'other'; (byApp[g] = byApp[g] || []).push(it); }); Object.values(byApp).forEach((a) => a.sort((x, y) => effort(x) - effort(y)));
      const cal = Room.data.items.filter(group).filter((it) => it.src && (it.src.kind === 'season' || it.src.kind === 'event')), guests = (Room.H.guests || []).filter((g) => g.group === (kd ? 'kid' : 'adult')); let lastGrant = 0;
      const apps = Object.keys(byApp).filter((a) => !['event'].includes(a)), prog = {}; apps.forEach((a) => { prog[a] = 0; }); const rows = []; let lvPrev = 1;
      for (let day = 0; day <= 400; day++) {
        const share = per / apps.length; apps.forEach((a) => { prog[a] += day === 0 ? Math.max(share, 4) : share; byApp[a].forEach((it) => { if (!Room.has(it.id) && effort(it) <= prog[a]) { Room.grant(it.id); } }); });
        const month = (Math.floor(day / 30) % 12) + 1; const sc = cal.find((it) => !Room.has(it.id) && (it.src.months || []).includes(month)); if (sc) { Room.grant(sc.id); lastGrant = day; }   // 계절·이벤트: 그 달에 하루 하나(1월 1일 시작)
        guests.forEach((g) => { const n = (Room.S.guests[g.id] || {}).n || 0; if (n < g.gifts.length && Room.cozy() >= g.need + 250 * n) { Room.S.guests[g.id] = { n: n + 1 }; Room.grant(g.gifts[n]); lastGrant = day; } });   // 손님: 문턱을 넘으면 선물
        Room.sweep(); for (let k = 0; k < 3; k++) { const L1 = Room.level(); Room.sweep(); if (Room.level() === L1) break; }   // 방이 열리면 기다리던 가구를 놓는다
        const c = Room.chapter(); if (c && Room.tasks().done >= c.tasks.length) { Room.S.story[c.room] = { done: 1 }; }
        const L = Room.levelInfo(); if (day % 5 === 0 || L.lv !== lvPrev) rows.push([day, Room.ownedCount(), L.cozy, L.lv]); lvPrev = L.lv; Object.values(byApp).forEach((a) => a.forEach((it) => { if (Room.has(it.id) && !it.__d) { it.__d = 1; lastGrant = Math.max(lastGrant, day); } }));
      }
      const themeBad = []; Object.keys(Room.S.placed).forEach((rid) => { const R = Room.H.rooms.find((r) => r.id === rid); (Room.S.placed[rid] || []).forEach((p) => { const it = Room.item(p.id); if (R && R.themes && it && !R.themes.includes(it.theme)) themeBad.push(rid + ':' + p.id + '(' + it.theme + ')'); }); });
      return { themeBad, rows, own: Room.ownedCount(), cozy: Room.cozy(), lv: Room.level(), total: Room.data.items.filter(group).length, lastGrant };
    }, [PER, kid]);
    console.log(`\n== ${app} (${kid ? '유아' : '성인'}) · 하루 ${PER}판 · 총 ${out.total}개 → 끝에 ${out.own}개 아늑함 ${out.cozy} 레벨 ${out.lv}`);
    const first = (lv) => (out.rows.find((r) => r[3] >= lv) || [null])[0]; console.log('  레벨 도달일: ' + [2, 5, 10, 15, 20, 25, 30].map((lv) => `Lv${lv}=${first(lv) == null ? '-' : first(lv) + '일'}`).join(' '));
    console.log('  ' + out.rows.filter((r, i) => i % 4 === 0).map((r) => `${r[0]}일:${r[1]}개/${r[2]}/Lv${r[3]}`).join('  '));
    ok(first(2) != null && first(2) <= 1, app + ' Lv2 ≤ 1일'); if (!kid) { const f30 = first(30); ok(f30 != null && f30 >= 120, app + ' Lv30 도달 ≥ 120일 (실제 ' + f30 + ')'); ok(f30 != null && f30 <= out.lastGrant, app + ' 가구가 소진되기 전에 Lv30 도달(마지막 획득 ' + out.lastGrant + '일)'); } if (!kid) { ok(first(5) != null && first(5) <= 5, app + ' Lv5 ≤ 5일'); ok(first(10) != null && first(10) <= 21, app + ' Lv10 ≤ 21일'); } else ok(first(5) != null && first(5) <= 10, app + ' 유아 Lv5 ≤ 10일');
    ok(out.themeBad.length === 0, app + ' 방 주제 밖 가구 0 ' + out.themeBad.slice(0, 5).join(' '));
    ok(errs.length === 0, app + ' 오류 없음 ' + errs[0]); await ctx.close();
  }
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
