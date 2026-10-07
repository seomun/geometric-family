// 방치형 smoke: node tools/idle_smoke.js  (서버: python -m http.server 8765 @ repo root)
const { chromium } = require('playwright-core');
const path = require('path'), fs = require('fs');
const OUT = path.join(__dirname, '..', 'notes', 'snapshots');
const URL = process.env.URL || 'http://localhost:8765/games/idle/index.html';
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const ctx = await b.newContext({ viewport: { width: 412, height: 915 }, hasTouch: true }), pg = await ctx.newPage();
  const errs = []; pg.on('pageerror', (e) => errs.push(e.message)); pg.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  await pg.goto(URL); await pg.waitForSelector('.tcard', { timeout: 8000 });
  const shot = async (n) => { await pg.waitForTimeout(450); return pg.screenshot({ path: path.join(OUT, '2026-10-07_idle_' + n + '.png') }); };
  const D = (f, ...a) => pg.evaluate(([f, a]) => window.IDLE.debug[f](...a), [f, a]);
  const sz = await pg.evaluate(() => { const bad = []; document.querySelectorAll('.idle *').forEach((e) => { if (e.children.length === 0 && e.textContent.trim() && e.offsetParent) { const f = parseFloat(getComputedStyle(e).fontSize) * (e.closest('#safe').getBoundingClientRect().width / 360); if (f < 17.5) bad.push(e.textContent.trim().slice(0, 12) + ':' + f.toFixed(1)); } }); return bad; });
  ok(sz.length === 0, '홈 글자 ≥18px (' + sz.join(',') + ')');
  await shot('home0');
  // 시작: 온기 15 → 아빠 모시기(10)
  ok(await D('buy', 'n_dad'), '아빠 모시기');
  await pg.waitForTimeout(500);
  // 가짜 시계 1분
  const r1 = await D('rates'); ok(r1.w > 0, '생산량 > 0: ' + r1.w.toFixed(2));
  // 큰 부자 만들기 → 모든 식구
  await D('give', 1e7);
  for (const id of ['n_dad', 'n_mom', 'n_gma', 'n_k1', 'n_k2', 'n_k3', 'n_baby', 'n_pot', 's_wife', 's_hus', 's_hot', 'd_dad', 'd_mom']) await D('buy', id);
  // 식탁별 상세
  for (const t of ['nemo', 'semo', 'dong']) {
    await pg.click('.tcard[data-t=' + t + ']'); await pg.waitForSelector('.grow'); await pg.waitForTimeout(300);
    const bad = await pg.evaluate(() => { const o = []; document.querySelectorAll('.idle .grow *, .idle .panel2 *, .idle .mini *').forEach((e) => { if (e.children.length === 0 && e.textContent.trim() && e.offsetParent) { const f = parseFloat(getComputedStyle(e).fontSize) * (e.closest('#safe').getBoundingClientRect().width / 360); if (f < 17.5) o.push(e.textContent.trim().slice(0, 10) + ':' + f.toFixed(1)); } }); return o; });
    ok(bad.length === 0, t + ' 상세 글자 ≥18px (' + bad.join(',') + ')'); await shot('detail_' + t);
    await pg.click('.screen.on .back'); await pg.waitForSelector('.tcard');
  }
  // 세모 지르기
  await pg.click('.tcard[data-t=semo]'); await pg.waitForSelector('.trip');
  await pg.click('.screen.on .trip >> nth=1'); await pg.waitForTimeout(300);
  const sr = await D('rates'); ok(sr.s.m === 0, '대판 싸움: 처음 10초 멈춤 (m=' + sr.s.m + ')');
  await D('skip', 15000); const sr2 = await D('rates'); ok(sr2.s.m > 4, '화해 후 ×4.2 (m=' + sr2.s.m + ')');
  await pg.click('.screen.on .back');
  // 사연
  const ready = await D('S'); ok(ready.tot > 120, '누적 온기가 1화 문턱 넘음');
  await pg.click('.screen.on .sbtn'); await pg.waitForSelector('.cap'); await shot('story1');
  for (let i = 0; i < 4; i++) { await pg.click('.screen.on .bigbtn:last-of-type'); await pg.waitForTimeout(250); }
  await pg.waitForSelector('.opt'); await shot('story_q'); await pg.click('.screen.on .opt >> nth=1'); await pg.waitForSelector('.ovp'); await shot('story_done');
  await pg.click('.screen.on .ovp button'); await pg.waitForSelector('.tcard');
  const S2 = await D('S'); ok(Object.keys(S2.sd).length === 1, '도감 1칸'); await shot('home1');
  // 도감
  await pg.click('.screen.on .dbtn'); await pg.waitForSelector('.dexg'); await shot('dex'); await pg.click('.screen.on .back');
  // 모든 사연: 컷마다 이미지가 실제로 그려지는지, 글자 ≥18px
  const ids = await pg.evaluate(() => IDLE.debug.B().storyThresholds.map((_, i) => GF.data.idle_stories.stories[i] && GF.data.idle_stories.stories[i].id).filter(Boolean));
  const sids = await pg.evaluate(() => GF.data.idle_stories.seasons.map((x) => x.id));
  for (const id of ids.concat(sids)) {
    const season = sids.includes(id);
    await pg.evaluate(([id, season]) => GF.go('istory', { id, season }), [id, season]); await pg.waitForTimeout(250);
    const n = await pg.evaluate(([id, season]) => (season ? GF.data.idle_stories.seasons : GF.data.idle_stories.stories).find((x) => x.id === id).cuts.length, [id, season]); let broken = 0;
    for (let i = 0; i < n; i++) { await pg.waitForTimeout(150); broken += await pg.evaluate(() => [...document.querySelectorAll('.screen.on .cut-char img')].filter((m) => !m.complete || !m.naturalWidth).length); if (i < n - 1) await pg.click('.screen.on .bigbtn:last-of-type'); }
    ok(broken === 0, id + ' 모든 컷 이미지 로드'); await pg.evaluate(() => GF.back());
  }
  // 8시간 가짜 시계: 오프라인 계산 (캡)
  // 소품 30종·엔딩·시즌 도감
  await D('give', 0); await D('checkProps');
  const pc = await pg.evaluate(() => ({ n: Object.keys(IDLE.debug.S().pr).length, all: IDLE.debug.PR().length, prem: IDLE.debug.PR().filter((x) => x.premium).length }));
  ok(pc.all === 30 && pc.n >= 3 && pc.prem <= 4, '소품 ' + pc.n + '/' + pc.all + ' (premium ' + pc.prem + ')');
  ok(await pg.evaluate(() => IDLE.grant('prop:p_pack1') && IDLE.owns('prop:p_pack1') && !IDLE.hooks.adAvailable()), '수익 훅: premium 소품은 grant 로만, 광고 no-op');
  await pg.evaluate(() => GF.go('iprops')); await pg.waitForSelector('.screen.on .dexc'); await shot('props');
  await pg.click('.screen.on .dexc >> nth=0'); await pg.click('.screen.on .dexc.off >> nth=0'); await pg.waitForTimeout(300);
  await pg.evaluate(() => GF.back());
  await pg.evaluate(() => { const S = IDLE.debug.S(); S.sd.s30 = { k: 'nemo', t: 1 }; S.tl = { nemo: 15, semo: 15, dong: 15 }; S.chairs = 4; });
  ok(await pg.evaluate(() => IDLE.debug.endingReady()), '엔딩 조건 충족 판정');
  await pg.evaluate(() => GF.home && 0); await pg.evaluate(() => GF.go('itable')); await pg.waitForSelector('.screen.on .ribbon.gold', { timeout: 3000 }); await shot('ending_ribbon');
  await pg.click('.screen.on .ribbon'); await pg.waitForSelector('.screen.on .cap');
  for (let i = 0; i < 4; i++) { await pg.click('.screen.on .bigbtn:last-of-type'); await pg.waitForTimeout(250); } await shot('ending_last');
  await pg.click('.screen.on .bigbtn:last-of-type'); await pg.waitForSelector('.screen.on .opt'); await pg.click('.screen.on .opt >> nth=0'); await pg.waitForSelector('.screen.on .ovp'); await shot('ending_done');
  ok(await pg.evaluate(() => IDLE.debug.S().end > 0), '엔딩 도장'); await pg.click('.screen.on .ovp button'); await pg.waitForSelector('.tcard');
  await pg.evaluate(() => GF.go('idex')); await pg.waitForSelector('.screen.on .dexg'); await shot('dex2'); await pg.evaluate(() => GF.back());
  // 8시간: (A) 12시간 부재 → 8시간 캡 한 번에 정산  (B) 같은 상태에서 3분씩 160번(=8시간) 가짜 시계로 진행 → 두 값이 같아야 한다
  const snap = await D('snap'), wBase = (await D('S')).w, rate0 = (await D('rates')).w;
  await D('awayHours', 12);
  const o = await pg.evaluate(() => IDLE.debug.reloadOffline());
  ok(o && o.capped, '12시간 부재 → 8시간 캡');
  await D('restore', snap);
  let gain = 0; for (let i = 0; i < 160; i++) { const r = await D('skip', 180000); gain += r ? r.gained : 0; }
  ok(Math.abs(o.gained - gain) / gain < 0.01, '8시간 정산 = 3분×160 진행: ' + o.gained.toExponential(3) + ' vs ' + gain.toExponential(3));
  const rr = await D('rates'), base0 = rr.n.w + rr.s.base + rr.d.w, lin = base0 * 8 * 3600 * 0.8; ok(Math.abs(o.gained - lin) / lin < 0.02 && o.laugh === 0, '오프라인 = 현재속도 선형×0.8, 웃음 없음: ' + (o.gained / (base0 * 28800)).toFixed(2) + '배');
  await pg.reload(); await pg.waitForSelector('.tcard'); await pg.waitForTimeout(400); await shot('home_after');
  ok(errs.length === 0, '콘솔 오류 없음 ' + errs.slice(0, 3).join(' | '));
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
