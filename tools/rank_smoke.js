// 순위표 점검(성인 점수형 ③⑥⑦⑧⑨): node tools/rank_smoke.js (서버 8765)
// 결정성(같은 앱·날짜·사람이면 같은 점수, 새로 켜도 같음) · 가족 맛(세모 들쭉날쭉·동그라미 가끔 빈자리) · 이기면 한 줄/지면 문구 없음 · 주간(월요일 리셋·내 기록에만 남음) · 주 1위 보상 한 번 · 키트 시트(화면 안·큰 글씨) · 실제 오늘의 한 판을 깨면 순위표 기록
const { chromium } = require('playwright-core');
const B = 'http://localhost:8765/games/';
const APPS = [
  { n: '③ 합치기', app: 'merge', url: 'merge/index.html', G: 'MERGE', go: 'mplay', home: 'mhome', solve: `const L = MERGE.debug.dailyLevel(); GF.go('mplay', { level: L }); window.__L = L;`, play: async (p, L) => { for (const i of L.solution) { await p.evaluate((i) => MERGE.debug.place(i), i); await p.waitForFunction(() => !MERGE.debug.busy() || !!document.querySelector('.uk-sheet'), null, { timeout: 5000 }).catch(() => {}); if (await p.evaluate(() => !!document.querySelector('.screen.on .uk-sheet'))) break; } } },
  { n: '⑥ 다른 그림', app: 'spot', url: 'spot/index.html', G: 'SPOT', solve: `const L = SPOT.debug.dailyLevel(); GF.go('pplay', { level: L }); window.__L = L;`, play: async (p, L) => { if (L.type === 'memory') await p.evaluate(() => SPOT.debug.seen()); for (let ri = 0; ri < L.rounds.length; ri++) { for (const d of L.rounds[ri].diffs) { await p.evaluate(([x, y]) => SPOT.debug.tap(x, y), [d.x + d.w / 2, d.y + d.h / 2]); await p.waitForTimeout(40); } await p.waitForTimeout(ri < L.rounds.length - 1 ? 900 : 100); } } },
  { n: '⑦ 블록', app: 'block', url: 'block/index.html', G: 'BLOCK', solve: `const L = BLOCK.debug.dailyLevel(); GF.go('bplay', { level: L }); window.__L = L;`, play: async (p, L) => { for (const m of L.solution) { const okp = await p.evaluate((m) => BLOCK.debug.place(m[0], m[1], m[2]), m); if (!okp) break; await p.waitForTimeout(30); if (await p.evaluate(() => !!document.querySelector('.screen.on .uk-sheet'))) break; } } },
  { n: '⑧ 정리', app: 'sort', url: 'sort/index.html', G: 'SORT', solve: `const L = SORT.debug.dailyLevel(); GF.go('splay', { level: L }); window.__L = L;`, play: async (p, L) => { for (const [a, b] of L.solution) { await p.evaluate(([x, y]) => { SORT.debug.tap(x); SORT.debug.tap(y); }, [a, b]); await p.waitForTimeout(15); if (await p.evaluate(() => SORT.debug.state().won)) break; } } },
  { n: '⑨ 짝 맞추기', app: 'tile', url: 'tile/index.html', G: 'TILE', solve: `const L = TILE.debug.dailyLevel(); GF.go('tplay', { level: L }); window.__L = L;`, play: async (p, L) => { for (const i of L.solution) { const okp = await p.evaluate((ii) => { const S = TILE.debug.state(); if (S.won || S.gone[ii]) return null; TILE.debug.press(ii); return true; }, i); if (okp === null) break; await p.waitForTimeout(25); } } },
];
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
const ids = (r) => JSON.stringify(r.map((x) => [x.name, x.score]));
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const A of APPS) {
    if (ONLY && !ONLY.includes(A.app)) continue;
    const ctx = await b.newContext({ viewport: { width: 390, height: 780 } }), p = await ctx.newPage(), errs = [];
    await p.addInitScript(() => { window.__noResume = true; }); p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
    const open = async () => { await p.goto(B + A.url); await p.waitForTimeout(2000); await p.mouse.click(195, 400).catch(() => {}); await p.waitForTimeout(700); await p.evaluate((g) => { window[g].unlockAll = true; window[g].fast = true; }, A.G); };
    await open(); const key = 'gf:' + A.app + ':rank', boards = await p.evaluate(() => GF.rank.boards().map((x) => x.id));
    ok(boards.includes('daily'), A.n + ' 순위표 보드: ' + boards.join(','));
    for (const bd of boards) {
      // 결정성: 같은 날이면 같은 점수, 캐시를 지워도·앱을 다시 켜도 같음
      const calc = () => p.evaluate((id) => { GF.rank._today = 20261014; return JSON.stringify(['day', 'week'].map((sc) => GF.rank.rows(id, sc).map((r) => [r.name, r.score]))); }, bd);
      const a1 = await calc(); await p.evaluate((k) => localStorage.removeItem(k), key); const a2 = await calc(); ok(a1 === a2, A.n + ' [' + bd + '] 같은 시드 = 같은 점수(캐시 지워도)');
      await p.evaluate((k) => { const s = JSON.parse(localStorage.getItem(k)); localStorage.setItem(k, JSON.stringify(s)); }, key);
      await open(); const a3 = await calc(); ok(a1 === a3, A.n + ' [' + bd + '] 앱을 다시 켜도 같은 점수');
      const day2 = await p.evaluate((id) => { GF.rank._today = 20261015; return JSON.stringify(GF.rank.rows(id, 'day').map((r) => [r.name, r.score])); }, bd); const day1 = await p.evaluate((id) => { GF.rank._today = 20261014; return JSON.stringify(GF.rank.rows(id, 'day').map((r) => [r.name, r.score])); }, bd); ok(day1 !== day2, A.n + ' [' + bd + '] 날짜가 다르면 점수가 다름');
      // 봇끼리 동점 0(8주 × 7일 × 하루·주간), 주마다 가족별 「봇 중 1위」 1회 이상(세모는 2회 이상: 대박 날이 눈에 띔)
      const wk = await p.evaluate((id) => { const R = GF.rank; let ties = 0, wties = 0; const wins = []; for (let w = 0; w < 8; w++) { const ws = R.addDays(20260907, 7 * w), c = [0, 0, 0]; for (let k = 0; k < 7; k++) { const d = R.addDays(ws, k), day = R.famDay(id, d).filter((x) => x.score != null), set = new Set(day.map((x) => x.score)); if (set.size !== day.length) ties++; const top = day.slice().sort((a, b) => b.score - a.score)[0]; c[top.p.fam]++; } R._today = R.addDays(ws, 6); const rows = R.rows(id, 'week').filter((r) => !r.me && r.score != null), ws2 = new Set(rows.map((r) => r.score)); if (ws2.size !== rows.length) wties++; wins.push(c); } return { ties, wties, wins }; }, bd);
      ok(wk.ties === 0 && wk.wties === 0, A.n + ' [' + bd + '] 봇끼리 동점 0(하루 ' + wk.ties + ' · 주간 ' + wk.wties + ')');
      ok(wk.wins.every((c) => c[0] >= 1 && c[1] >= 1 && c[2] >= 1), A.n + ' [' + bd + '] 매주 가족마다 봇 중 1위 1회 이상(' + wk.wins.map((c) => c.join('/')).join(' ') + ')'); ok(wk.wins.every((c) => c[1] >= 2), A.n + ' [' + bd + '] 세모는 주마다 대박 날이 2번 이상(눈에 띔)');
      const sw = await p.evaluate((id) => { const R = GF.rank, c = { semo_h: 0, semo_w: 0, nemo_dad: 0, nemo_mom: 0 }; for (let k = 0; k < 56; k++) { const day = R.famDay(id, R.addDays(20260907, k)).filter((x) => x.score != null), top = day.slice().sort((a, b) => b.score - a.score)[0]; if (c[top.p.id] != null) c[top.p.id]++; } return c; }, bd); ok(sw.semo_h >= 1 && sw.semo_w >= 1 && sw.nemo_dad >= 1 && sw.nemo_mom >= 1, A.n + ' [' + bd + '] 부부·부모 모두 1위 날이 있음(56일: ' + JSON.stringify(sw) + ')');
      // 가족 맛(14일): 세모가 네모보다 들쭉날쭉, 동그라미는 가끔 빈자리, 점수 범위
      const st = await p.evaluate((id) => { const o = { 0: [], 1: [], 2: [] }; let absent = 0; for (let k = 0; k < 14; k++) { const d = GF.rank.addDays(20260901, k); GF.rank.PLAYERS.forEach((pl) => { const s = GF.rank.famScore(id, d, pl); if (s == null) absent++; else o[pl.fam].push(s); }); } const sd = (a) => { const m = a.reduce((x, y) => x + y, 0) / a.length; return Math.sqrt(a.reduce((x, y) => x + (y - m) * (y - m), 0) / a.length); }; const mean = (a) => Math.round(a.reduce((x, y) => x + y, 0) / a.length); return { sd: [0, 1, 2].map((f) => Math.round(sd(o[f]))), mean: [0, 1, 2].map((f) => mean(o[f])), absent, all: [].concat(o[0], o[1], o[2]) }; }, bd);
      console.log('     ' + A.n + ' [' + bd + '] 평균(네모·세모·동그라미)=' + st.mean.join('/') + ' 표준편차=' + st.sd.join('/') + ' 쉬는 날=' + st.absent);
      ok(st.all.every((s) => s >= 40 && s <= 1500 || bd === 'endless'), A.n + ' [' + bd + '] 점수 범위'); ok(st.absent <= 8, A.n + ' [' + bd + '] 쉬는 날은 가끔(14일×5명 중 ' + st.absent + ')');
      if (bd === 'endless') ok(st.sd[1] > st.sd[0], A.n + ' [끝없이] 세모가 네모보다 들쭉날쭉(' + st.sd[1] + ' > ' + st.sd[0] + ')');
    }
    // 이기면 한 줄 / 지면 문구 없음 · 주 1위 보상 한 번 · 월요일 리셋
    const flow = await p.evaluate(() => {
      const R = GF.rank; localStorage.removeItem('gf:' + R.cfg.app + ':rank'); R._today = 20261014; const out = {}; const before = Room.owned().length;
      out.low = R.record('daily', 50); out.lowLine = out.low && out.low.line;
      out.high = R.record('daily', 5000); out.line = out.high.line; out.rank = out.high.rank; out.reward = out.high.reward; out.rewardGot = Room.owned().length === before + 1;
      out.again = R.record('daily', 6000); out.again2 = !!out.again.reward;
      const wk = R.rows('daily', 'week'); out.weekFirst = wk[0].me; out.weekLine = R.beatLine(wk, 'week');
      R._today = 20261019; const nx = R.rows('daily', 'week'); out.nextWeekMe = nx.find((r) => r.me).score; out.mine = JSON.parse(localStorage.getItem('gf:' + R.cfg.app + ':rank')).top.daily.map((x) => x.s);
      const dwk = R.rows('daily', 'day'); out.dayMeNone = dwk.find((r) => r.me).score;
      return out; });
    ok(flow.lowLine === null, A.n + ' 지면(점수 50) 한 줄 없음'); ok(/이겼어요!$/.test(flow.line || ''), A.n + ' 이기면 한 줄: ' + flow.line); ok(flow.rank === 1, A.n + ' 1위');
    ok(flow.reward && flow.rewardGot, A.n + ' 주 1위 → 집 소품 1개 확정 지급(' + flow.reward + ')'); ok(!flow.again2, A.n + ' 같은 주에 두 번째 보상 없음'); ok(/앞서고 있어요!$/.test(flow.weekLine || ''), A.n + ' 주간 한 줄: ' + flow.weekLine);
    ok(flow.nextWeekMe === null && flow.mine.includes(6000), A.n + ' 월요일에 주간은 새로 시작, 지난주는 내 기록에만 남음(' + flow.mine.slice(0, 3).join(',') + ')');
    // 시트 UI(키트): 6줄·탭·화면 안·큰 글씨
    await p.evaluate(() => { GF.rank._today = 20261014; GF.state.settings.big = 1; document.documentElement.dataset.big = '1'; GF.rank.open('daily'); }); await p.waitForSelector('.rk-sheet'); await p.waitForTimeout(300);
    const ui = await p.evaluate(() => { const sf = document.getElementById('safe').getBoundingClientRect(), sh = document.querySelector('.rk-sheet').getBoundingClientRect(); return { rows: document.querySelectorAll('.rk-sheet .rk-row').length, me: !!document.querySelector('.rk-sheet .rk-row.me'), inside: sh.left >= sf.left - 1 && sh.right <= sf.right + 1 && sh.top >= sf.top - 1 && sh.bottom <= sf.bottom + 1, clip: [...document.querySelectorAll('.rk-sheet .rk-n, .rk-sheet .rk-s, .rk-sheet .rk-note, .rk-sheet .rk-line')].filter((e) => e.scrollWidth > e.clientWidth + 2 || e.scrollHeight > e.clientHeight + 2).length, noteLines: (() => { const n = document.querySelector('.rk-sheet .rk-note'); return n ? Math.round(n.getBoundingClientRect().height / parseFloat(getComputedStyle(n).lineHeight || 20)) : 0; })() }; });
    ok(ui.rows === 6 && ui.me, A.n + ' 시트: 가족 5명 + 나(' + ui.rows + '줄)'); ok(ui.inside && ui.clip === 0 && ui.noteLines <= 2, A.n + ' 시트가 화면 안·큰 글씨에서도 안내 줄까지 안 잘림(안내 ' + ui.noteLines + '줄)');
    await p.screenshot({ path: __dirname + '/../notes/snapshots/rank_' + A.app + '.png' });
    await p.evaluate(() => { document.querySelectorAll('.uk-scrim').forEach((x) => x.remove()); GF.state.settings.big = 0; document.documentElement.dataset.big = '0'; });
    // 실제 오늘의 한 판을 깨면 기록되고 결과 화면에 「순위표 보기」
    await p.evaluate(() => { GF.rank._today = null; localStorage.removeItem('gf:' + GF.rank.cfg.app + ':rank'); });
    const L = await p.evaluate(`(() => { GF.stack = []; GF.go('${(A.app === 'merge' ? 'mhome' : A.app === 'spot' ? 'phome' : A.app === 'block' ? 'bhome' : A.app === 'sort' ? 'shome' : 'thome')}'); ${A.solve} return window.__L; })()`); await p.waitForTimeout(900);
    await A.play(p, L);
    for (let g = 0; g < 14; g++) { if (await p.evaluate(() => !!document.querySelector('.screen.on .uk-sheet'))) break; await p.waitForTimeout(400); }
    const hasBtn = await p.evaluate(() => [...document.querySelectorAll('.screen.on .uk-sheet .uk-btn')].some((b) => /순위표 보기/.test(b.textContent)));
    ok(hasBtn, A.n + ' 오늘의 한 판 결과에 「순위표 보기」'); const rec = await p.evaluate(() => GF.rank.myDay('daily', GF.rank.today())); ok(rec != null && rec >= 50, A.n + ' 실제 플레이 점수 기록(' + rec + ')');
    if (hasBtn) { await p.evaluate(() => [...document.querySelectorAll('.screen.on .uk-sheet .uk-btn')].find((b) => /순위표 보기/.test(b.textContent)).click()); await p.waitForSelector('.rk-sheet', { timeout: 3000 }).catch(() => {}); ok(await p.evaluate(() => !!document.querySelector('.rk-sheet .rk-row.me .rk-s') && !/아직/.test(document.querySelector('.rk-sheet .rk-row.me .rk-s').textContent)), A.n + ' 내 점수가 오늘 순위표에 보임'); }
    // 통계 화면에서도 열림
    await p.evaluate(() => { document.querySelectorAll('.uk-scrim').forEach((x) => x.remove()); GF.extras.openStats(); }); await p.waitForTimeout(300);
    ok(await p.evaluate(() => [...document.querySelectorAll('.xt-sheet .xt-row')].some((r) => /순위표/.test(r.textContent))), A.n + ' 통계 화면에 순위표 줄');
    ok(errs.length === 0, A.n + ' 콘솔 오류 없음 ' + errs.slice(0, 2).join('|')); await ctx.close();
  }
  // 유아 앱엔 순위표가 없음
  for (const [n, url] of [['① 놀이터', 'index.html'], ['④ 색칠북', 'color/index.html'], ['⑩ 막둥이의 하루', 'day/index.html'], ['⑤ 퀴즈', 'quiz/index.html'], ['② 식탁', 'idle/index.html']]) { if (ONLY) break; const ctx = await b.newContext({ viewport: { width: 390, height: 780 } }), p = await ctx.newPage(); await p.goto(B + url); await p.waitForTimeout(1800); ok(await p.evaluate(() => !(GF.rank && GF.rank.ready)), n + ' 순위표 없음(유아·결과형·방치형)'); await ctx.close(); }
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
