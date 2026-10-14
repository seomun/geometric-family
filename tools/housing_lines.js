// 가구 한 줄 이야기(A20) 시험: node tools/housing_lines.js — 성인 가구 323개 모두 한 줄 · 중복·길이·광고성 말 없음 · 카탈로그 상세에 가진 가구는 한 줄, 없는 가구는 잠금 문구 · 유아 집엔 없음
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { window.__noResume = true; }); await p.goto('http://localhost:8765/games/merge/index.html'); await p.waitForTimeout(1600);
  const d = await p.evaluate(() => { const KG = ['kid', 'daybath', 'wall', 'story_k', 'kseason', 'kgift'], ad = Room.data.items.filter((i) => !KG.includes(i.set)), ls = ad.map((i) => i.line); return { n: ad.length, has: ls.filter(Boolean).length, uniq: new Set(ls).size, min: Math.min(...ls.map((x) => (x || '').length)), max: Math.max(...ls.map((x) => (x || '').length)), ads: ls.filter((x) => /받아요|설치|스토어|광고|구매|결제|할인|무료/.test(x)).length, kidHas: Room.data.items.filter((i) => KG.includes(i.set) && i.line).length }; });
  ok(d.has === d.n && d.n >= 260, `성인 가구 ${d.n}개 모두 한 줄(${d.has})`); ok(d.uniq === d.has, '한 줄이 모두 다름 ' + d.uniq); ok(d.min >= 10 && d.max <= 60 && d.ads === 0, `길이 ${d.min}~${d.max}자 · 광고성 말 ${d.ads}`); ok(d.kidHas === 0, '유아 그룹 가구에는 글이 없음');
  await p.evaluate(() => { Room.cfg.mode = 'adult'; Room.grant('b_sofa'); Room.S.roomSeen = Room.S.roomSeen || {}; Room.S.roomSeenInit = { adult: 1, kid: 1 }; GF.stack = []; GF.go('mhouse'); }); await p.waitForTimeout(1400); await p.evaluate(() => document.querySelectorAll('.uk-scrim,.tale-ov,.h2-reveal,.uk-toast').forEach((e) => e.remove()));
  await p.evaluate(() => [...document.querySelectorAll('.h2-fb')].find((x) => /카탈로그/.test(x.textContent)).click()); await p.waitForTimeout(600);
  const pick = async (id) => p.evaluate((id) => { const c = [...document.querySelectorAll('.h2-card')].find((x) => (x.getAttribute('data-id') || x.innerText).includes(id)); return !!c; }, id);
  await p.evaluate(() => { const own = document.querySelector('.h2-card:not(.off)'); own.click(); }); await p.waitForTimeout(400);
  const ownLine = await p.evaluate(() => (document.querySelector('.h2-dline') || {}).textContent || ''); ok(/^“.+”$/.test(ownLine) && !/🔒/.test(ownLine), '가진 가구를 누르면 한 줄 이야기 · ' + ownLine);
  await p.screenshot({ path: 'notes/snapshots/a20_line.png' });
  await p.evaluate(() => { const off = document.querySelector('.h2-card.off'); off && off.click(); }); await p.waitForTimeout(400);
  const offLine = await p.evaluate(() => (document.querySelector('.h2-dline') || {}).textContent || ''); ok(/가지면 이 가구의 이야기가 열려요/.test(offLine), '없는 가구는 잠금 문구 · ' + offLine);
  ok(errs.length === 0, '오류 없음 ' + (errs[0] || '')); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
