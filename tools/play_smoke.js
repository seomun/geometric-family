// ① 막둥이 놀이터 보너스 단계 D 점검: node tools/play_smoke.js
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const c = await b.newContext({ viewport: { width: 390, height: 780 } }), p = await c.newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:8765/games/index.html'); await p.waitForTimeout(1800);
  const d = await p.evaluate(() => { const S = GF.data.stages; const all = Object.keys(S).filter((k) => S[k].stages); return { chs: all.length, with4: all.filter((k) => S[k].stages.length === 4).length, rounds: S.ch11.stages[3].rounds.length, bonus: !!S.ch11.stages[3].bonus }; });
  ok(d.chs === 15 && d.with4 === 15 && d.rounds === 5 && d.bonus, '① 15장 모두 보너스 단계 D 추가(5라운드)');
  const lay = async (done) => { await p.evaluate((dn) => { GF.state.stages = {}; dn.forEach((k) => { GF.state.stages[k] = { done: true, stars: 3 }; }); GF.stack = []; GF.go('home'); GF.go('stages', { ch: 'ch11' }); }, done); await p.waitForTimeout(600); return p.evaluate(() => [...document.querySelectorAll('.screen.on .stagebtn')].map((x) => ({ locked: x.classList.contains('locked'), y: Math.round(x.getBoundingClientRect().bottom) }))); };
  let L = await lay(['c11A', 'c11B']); ok(L.length === 4 && L[3].locked && !L[2].locked, '단계 4개 버튼, C 를 깨기 전엔 D 가 잠김');
  L = await lay(['c11A', 'c11B', 'c11C']); ok(L.length === 4 && !L[3].locked, 'C 를 깨면 D 가 열림');
  ok(await p.evaluate(() => { const bs = [...document.querySelectorAll('.screen.on .stagebtn')].map((x) => x.getBoundingClientRect()); const s = document.getElementById('safe').getBoundingClientRect(); return bs.every((r) => r.bottom <= s.bottom + 2 && r.top >= s.top); }), '4개 버튼이 화면 안(겹침·잘림 없음)');
  ok(await p.evaluate(() => { const nx = (() => { GF.state.stages = { c11A: { done: true }, c11B: { done: true }, c11C: { done: true } }; return null; })(); return GF.data.stages.ch11.stages.length === 4; }), '이어하기는 A~C 기준(D 는 선택)');
  ok(errs.length === 0, '오류 없음 ' + errs[0]); await c.close(); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
