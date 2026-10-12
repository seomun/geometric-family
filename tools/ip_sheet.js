// IP 화면 캡처 시트용 개별 캡처(허브 QA 요청): node tools/ip_sheet.js → notes/snapshots/_ip_*.png (합치기는 tools/ip_sheet.py)
const { chromium } = require('playwright-core'); const fs = require('fs');
const B = 'http://localhost:8765/games/', OUT = 'notes/snapshots/';
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const open = async (url) => { const c = await b.newContext({ viewport: { width: 390, height: 780 }, deviceScaleFactor: 2 }), p = await c.newPage(); p.on('pageerror', (e) => console.log('ERR', e.message)); await p.addInitScript(() => { window.__noResume = true; window.GFOps = { version: () => '1.0.0-rc8', hasApp: (k) => /spot|tables/.test(k), launch() {}, openStore() {}, openUrl() {}, review() {}, mail() {} }; }); await p.goto(B + url); await p.waitForTimeout(1600); return [c, p]; };
  const clean = (p) => p.evaluate(() => { document.querySelectorAll('.uk-scrim,.ip-cameo,.uk-toast').forEach((e) => e.remove()); });
  const shot = async (p, n) => { await p.waitForTimeout(500); await p.screenshot({ path: OUT + '_ip_' + n + '.png' }); };
  // 성인(③ 합치기): 카드·소품·도장·모음·카메오·도감
  let [c, p] = await open('merge/index.html');
  await p.evaluate(() => { const I = GF.ip; ['pigs'].forEach((t) => [0, 1, 2, 3].forEach((i) => { I.L.cards[t] = (I.L.cards[t] || 0) | (1 << i); })); I.L.taken.push('t_pigs_a'); Room.grant('t_pigs_a'); I.L.cards.shoes = 1; I.L.cards.bears = 3; I.L.cards.kongjwi = 5; I.L.cards.heungbu = 15 & 7; GF.ops.openAlbum(); }); await shot(p, '1_album');
  await clean(p);
  await p.evaluate(() => { const I = GF.ip; I.L.cards.sun = 7; I.addCard('sun', 3); }); await shot(p, '2_item');   // 한 편 완성 → 특별 소품 팝업
  await clean(p);
  await p.evaluate(() => { const I = GF.ip; [['merge', ['first', 'a', 'b']], ['spot', ['first', 'a']], ['block', ['first']], ['sort', ['first', 'a', 'b', 'end', 'story']], ['tile', ['first', 'a']], ['idle', ['first']], ['quiz', ['first', 'a']]].forEach(([a, ids]) => ids.forEach((id) => { I.L.stamps[a] = I.L.stamps[a] || []; if (!I.L.stamps[a].includes(id)) I.L.stamps[a].push(id); })); I.L.plate = ['ribbon']; GF.ops.openPassport(); }); await shot(p, '3_passport');
  await p.evaluate(() => { const sh = document.querySelector('.uk-sheet'); sh.scrollTop = sh.scrollHeight; }); await shot(p, '4_more');
  await clean(p);
  await p.evaluate(() => { GF.stack = []; GF.go('mhome'); GF.go('mlevels'); }); await p.waitForTimeout(900); await p.evaluate(() => { GF.ip.cameo('merge', 'e2'); }); await shot(p, '5_cameo_adult');
  await clean(p);
  await p.evaluate(() => { const I = GF.ip; GF.data.ops.cameos.filter((x) => !x.kid).slice(0, 11).forEach((x) => I.addCameo(x.id)); GF.ops.openCameos(); }); await shot(p, '7_cameos');
  await c.close();
  // 공유 카드 2종: 앱·내 도형 달리(PNG 로 렌더)
  const card = async (url, f, s, app, title, stars, line, name) => { const [c2, p2] = await open(url); const data = await p2.evaluate(async ([f2, s2, ap, ti, st, li]) => { Room.setMe && Room.setMe({ f: f2, s: s2 }); GF.ops.app = ap; const svg = await GF.share.svgAsync({ title: ti, stars: st, line: li }); const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); await img.decode(); const cv = document.createElement('canvas'); cv.width = 1080; cv.height = 1350; cv.getContext('2d').drawImage(img, 0, 0, 1080, 1350); return cv.toDataURL('image/png'); }, [f, s, app, title, stars, line]); fs.writeFileSync(OUT + '_ip_' + name + '.png', Buffer.from(data.split(',')[1], 'base64')); await c2.close(); };
  await card('merge/index.html', 'semo', 1, 'merge', '3장 · 곰 세 식구', 3, '레벨 24 클리어', '8_share_a');
  await card('block/index.html', 'dong', 0, 'block', '끝없이 · 줄 12개', 2, '조각 48개로 마무리', '9_share_b');
  // 유아(⑩ 하루): 카메오·도장판
  [c, p] = await open('day/index.html');
  await p.evaluate(() => { GF.stack = []; GF.go('dhome'); GF.go('dmap'); }); await p.waitForTimeout(900); await p.evaluate(() => { GF.ip.cameo('day', 'e2'); }); await shot(p, '6_cameo_kid');
  await clean(p);
  await p.evaluate(() => { const I = GF.ip; [['play', ['first', 'a']], ['color', ['first']], ['day', ['first', 'a', 'b', 'story']]].forEach(([a, ids]) => ids.forEach((id) => { I.L.stamps[a] = I.L.stamps[a] || []; if (!I.L.stamps[a].includes(id)) I.L.stamps[a].push(id); })); I.L.plate = ['ribbon']; GF.ops.openPassport(); }); await shot(p, '10_kid_passport');
  await c.close(); await b.close(); console.log('captured');
})();
