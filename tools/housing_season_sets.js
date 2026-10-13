// 계절 세트 4종 장면(A15) 시험: node tools/housing_season_sets.js — 봄 소풍·여름 평상·가을 추석상·겨울 김장: 하나 모자라면 없음 · 다 모으면 그 방에 칩 · 처음엔 자동 · 앨범 기록 · 한 방에 장면이 둘이면 칩을 누를 때마다 다음 장면
const { chromium } = require('playwright-core');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const SETS = { season_spring: ['s2_picnic', 's2_cherry', 's2_kite', 's2_tulip'], season_summer: ['s2_chime', 's2_melon', 's2_tube', 's2_fan', 's2_ice'], season_autumn: ['s2_persimmon', 's2_moonlamp', 's2_acorn', 's2_leaf', 's_songpyeon'], season_winter: ['s2_tangerine', 's2_heater', 's2_blanket', 's2_wreath', 'p_kimchi'] };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { window.__noResume = true; }); await p.goto('http://localhost:8765/games/merge/index.html'); await p.waitForTimeout(1600);
  const items = await p.evaluate((S) => Object.fromEntries(Object.entries(S).map(([k, v]) => [k, v.map((id) => !!Room.item(id))])), SETS); ok(Object.values(items).every((a) => a.every(Boolean)), '세트 가구가 모두 실제 가구 · ' + JSON.stringify(Object.values(items).map((a) => a.length)));
  await p.evaluate(() => { Room.S.sceneSeen = {}; Room.S.album = []; });
  const own = (ids) => p.evaluate((ids) => { ids.forEach((id) => Room.grant(id)); return Room.setScenes().map((c) => c.set); }, ids);
  let sc = await own(SETS.season_spring.slice(0, 3)); ok(!sc.includes('season_spring'), '봄 소풍: 하나 모자라면 장면 없음');
  sc = await own(SETS.season_spring); ok(sc.includes('season_spring'), '봄 소풍 세트를 다 모으면 장면 열림');
  for (const k of ['season_summer', 'season_autumn', 'season_winter']) { sc = await own(SETS[k]); ok(sc.includes(k), k + ' 장면 열림'); }
  const rooms = await p.evaluate(() => ['season_spring', 'season_summer', 'season_autumn', 'season_winter'].map((id) => Room.setScenes().find((c) => c.set === id).room).join()); ok(rooms === 'yard,yard,nemo,kitchen', '장면 방: ' + rooms);
  await p.evaluate(() => { Room.data.items.filter((i) => !['kid', 'daybath', 'wall', 'story_k', 'kseason', 'kgift'].includes(i.set)).forEach((i) => Room.grant(i.id)); Room.S.sceneSeen = {}; Room.S.album = []; GF.stack = []; GF.go('mhouse'); }); await p.waitForTimeout(1300); const clean = () => p.evaluate(() => document.querySelectorAll('.uk-scrim,.tale-ov,.uk-toast,.h2-reveal').forEach((e) => e.remove())); await clean();
  // 겨울 김장: 주방. 방 이동은 지도 시트로 (칩 순환은 마당·거실에서)
  const goRoom = async (name) => { await p.evaluate(() => { document.querySelectorAll('.h2-reveal,.uk-scrim').forEach((e) => e.remove()); document.querySelector('.h2-navname').click(); }); await p.waitForTimeout(300); await p.evaluate((n) => [...document.querySelectorAll('.h2-mapc')].find((e) => e.textContent.includes(n)).click(), name); await p.waitForTimeout(1200); await clean(); };
  await goRoom('주방'); await p.waitForTimeout(1800); const k1 = await p.evaluate(() => ({ chip: (document.querySelector('.h2-scenechip') || {}).textContent, fam: document.querySelectorAll('.h2-fam').length, bn: (document.querySelector('.h2-scenebn') || {}).textContent }));
  ok(await p.evaluate(() => Room.scenesFor('kitchen').some((c) => c.set === 'season_winter')) && !!k1.chip, '주방에 장면 칩(밥상·김장 둘) · ' + k1.chip + ' / ' + k1.bn); await p.screenshot({ path: 'notes/snapshots/a15_winter.png' }); await p.waitForTimeout(6500);
  ok(await p.evaluate(() => Room.S.album.some((a) => a.k === 'set:season_winter')), '겨울 김장 앨범 기록');
  // 장면마다 자기 문구·자기 소품(김장: 배추·대야·고무장갑), 설명 말풍선은 흐림막 위, 재생 중 칩 숨김
  await p.waitForTimeout(3000); const w = await p.evaluate(async () => { const c = Room.setScenes().find((q) => q.set === 'season_winter'); const rm = document.querySelector('.h2-room'); document.querySelectorAll('.h2-fam,.h2-scenebn,.h2-stage-bg,.h2-sprop').forEach((e) => e.remove()); rm.classList.remove('scene'); const ok0 = !!Room.playScene(rm, c, () => {}); await new Promise((r) => setTimeout(r, 2200)); return { ok0, bn: (document.querySelector('.h2-scenebn') || {}).textContent, props: [...document.querySelectorAll('.h2-sprop')].map((e) => e.dataset.label), chips: [...document.querySelectorAll('.h2-dreamchip')].every((e) => getComputedStyle(e).visibility === 'hidden'), say: (document.querySelector('.h2-say') ? +getComputedStyle(document.querySelector('.h2-say')).zIndex : 99), wash: +getComputedStyle(document.querySelector('.h2-stage-bg')).zIndex, text: c.text }; });
  ok(w.ok0 && w.bn.includes(w.text) && !/소파/.test(w.bn), '주방 김장 띠 문구는 자기 문구 · ' + w.bn); ok(['배추', '대야', '고무장갑'].every((x) => w.props.includes(x)), '김장 소품(배추·대야·고무장갑)이 무대에 · ' + w.props.join(',')); ok(w.chips, '재생 중 칩 숨김'); ok(w.say >= w.wash, '말풍선이 흐림막 위 · ' + w.say + '/' + w.wash);
  await p.screenshot({ path: 'notes/snapshots/a15_winter.png' }); await p.waitForTimeout(5000);
  await goRoom('마당·골목'); await p.waitForTimeout(1800); await p.waitForTimeout(6500);
  const y = await p.evaluate(() => ({ chip: document.querySelector('.h2-scenechip').textContent, n: Room.scenesFor('yard').length })); ok(y.n >= 2, '마당엔 장면이 여러 개 · ' + y.n);
  const t1 = y.chip; await p.evaluate(() => document.querySelector('.h2-scenechip').click()); await p.waitForTimeout(1800); await p.screenshot({ path: 'notes/snapshots/a15_yard.png' }); await p.waitForTimeout(6500); const t2 = await p.evaluate(() => document.querySelector('.h2-scenechip').textContent);
  ok(t1 !== t2, '칩을 누르고 나면 다음 장면으로 바뀜 · ' + t1 + ' → ' + t2);
  ok(await p.evaluate(() => ['season_spring', 'season_summer'].some((id) => Room.S.album.some((a) => a.k === 'set:' + id))), '봄/여름 장면도 앨범에 기록');
  ok(errs.length === 0, '오류 없음 ' + (errs[0] || '')); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
