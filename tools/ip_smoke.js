// IP 층(GF.ip·공유 카드·웹툰 링크) 점검: node tools/ip_smoke.js
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const B = 'http://localhost:8765/games/';
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const open = async (url, pre) => { const c = await b.newContext({ viewport: { width: 390, height: 780 } }), p = await c.newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message)); await p.addInitScript(() => { window.__noResume = true; }); if (pre) await p.addInitScript(pre); await p.goto(B + url); await p.waitForTimeout(1500); return [c, p, errs]; };
  let [c, p, errs] = await open('merge/index.html');
  /* S3 단언: 이야기마다 그룹 안의 앱만으로 네 장이 모두 얻어진다 */
  const s3 = await p.evaluate(() => { const D = GF.data.ops, G = { adult: ['merge', 'spot', 'block', 'sort', 'tile'], kid: ['play', 'day'] }, bad = []; let multi = 0; ['adult', 'kid'].forEach((g) => Object.keys(D.cardMap[g]).forEach((t) => { const cs = D.cardMap[g][t]; if (cs.length !== 4 || !cs.every((a) => G[g].includes(a))) bad.push(g + ':' + t); if (new Set(cs).size > 1) multi++; })); return { bad, multi, adult: Object.keys(D.cardMap.adult).length, kid: Object.keys(D.cardMap.kid).length }; });
  ok(s3.bad.length === 0, 'S3: 모든 이야기의 카드 네 장이 같은 그룹 앱만으로 얻어짐(성인 ' + s3.adult + '편·유아 ' + s3.kid + '편) ' + s3.bad.join(','));
  ok(s3.multi >= 10, '카드가 여러 앱에 나뉘어 있어 한 편을 완성하려면 앱을 오가야 하는 이야기 ' + s3.multi + '편');
  /* 장부 병합: 합집합·지우지 않음 */
  const mg = await p.evaluate(() => { const I = GF.ip, a = { v: 1, cards: { pigs: 3 }, stamps: { merge: ['first'] }, cameos: ['x'], plate: [], taken: [] }, b2 = { v: 1, cards: { pigs: 12, bears: 1 }, stamps: { merge: ['a'], spot: ['first'] }, cameos: ['y', 'x'], plate: ['ribbon'], taken: [] }; const m = I.merge(a, b2); return { pigs: m.cards.pigs, bears: m.cards.bears, st: m.stamps.merge.slice().sort().join(), spot: m.stamps.spot.join(), cam: m.cameos.slice().sort().join(), plate: m.plate.join(), idem: JSON.stringify(I.merge(m, m)) === JSON.stringify(m) }; });
  ok(mg.pigs === 15 && mg.bears === 1 && mg.st === 'a,first' && mg.spot === 'first' && mg.cam === 'x,y' && mg.plate === 'ribbon' && mg.idem, '장부 병합: 비트 OR·도장/카메오 합집합·여러 번 합쳐도 같음(지우기 없음)');
  /* 카드 → 한 편 완성 → 특별 소품 1개(한 번) + 「이야기 한 편」 도장 */
  const card = await p.evaluate(() => { const I = GF.ip, ow0 = Room.owned().length; const who = (i) => I.cardApp('pigs', i); const wrongApp = I.beat('block', 'pigs', 0) === (who(0) === 'block'); const r = [0, 1, 2, 3].map((i) => I.beat(who(i), 'pigs', i)); const ow1 = Room.owned().length; const again = I.beat(who(0), 'pigs', 0); return { apps: [0, 1, 2, 3].map(who).join(), r, complete: I.complete('pigs'), item: Room.has('t_pigs_a'), gain: ow1 - ow0, again, story: I.stamps('merge').includes('story') || I.stamps(who(0)).includes('story'), wrongApp }; });
  ok(card.r.every((x) => x === true) && card.complete && card.item && card.gain === 1 && card.again === false, '이야기 카드 4장 완성 → 「우리 집」 특별 소품 1개(확정) ' + card.apps + ', 같은 카드는 다시 안 얻음');
  /* 도장·문패 */
  const sp = await p.evaluate(() => { const I = GF.ip, ap = GF.data.ops.apps.adult; I.cfg.progress = () => 130; I.syncStamps(); const m = I.stamps('merge'); ap.forEach((a) => ['first', 'a', 'b', 'end'].forEach((id) => I.addStamp(a, id))); return { merge: m.slice().sort().join(), plates: I.plates().sort().join(), total: I.stampTotal() }; });
  ok(/first/.test(sp.merge) && /end/.test(sp.merge), '도장: 진행 수가 기준을 넘으면 첫 걸음·끝까지 도장 확정(' + sp.merge + ')');
  ok(sp.plates.includes('ribbon') && sp.plates.includes('sparkle') && sp.total >= 28, '도장 세트 → 문패 장식(리본·반짝이 …, 도장 ' + sp.total + '개)');
  ok(errs.length === 0, '성인 오류 없음 ' + errs[0]); await c.close();
  /* 가족 코드: 성인 장부 → 유아 장부(카드·도장·카메오만) */
  [c, p, errs] = await open('merge/index.html');
  const code = await p.evaluate(() => { const I = GF.ip; I.addCard('kongjwi', 0); I.addStamp('merge', 'first'); I.addCameo('c1'); return I.makeFamilyCode(); });
  await c.close();
  [c, p, errs] = await open('day/index.html');
  const fc = await p.evaluate((cd) => { const I = GF.ip; const before = JSON.stringify(I.get().cards); const bad = I.applyFamilyCode(cd.slice(0, -1) + (cd.slice(-1) === '0' ? '1' : '0')); const good = I.applyFamilyCode(cd); const kidKey = Object.keys(localStorage).filter((k) => k.indexOf('gf:ip:') === 0); return { before, bad: bad.ok, good: good.ok, card: I.hasCard('kongjwi', 0), stamp: I.stamps('merge').includes('first'), cam: I.hasCameo('c1'), keys: kidKey.join() }; }, code);
  ok(fc.bad === false && fc.good === true && fc.card && fc.stamp && fc.cam, '가족 코드: 성인→유아로 카드·도장·카메오 합침(체크섬 오류는 거부)');
  ok(fc.keys === 'gf:ip:kid:v1', 'D12: 유아 앱은 gf:ip:kid:v1 만 쓴다(성인 장부 키와 분리) ' + fc.keys);
  ok(await p.evaluate(() => GF.ops.webtoonUrl() === '' && !document.querySelector('.sg-side')), '유아 앱: 웹툰 링크 없음');
  ok(await p.evaluate(() => { GF.polish && 0; return GF.ip.kid === true; }), '유아 그룹으로 인식'); await c.close();
  /* 공유 카드 + 웹툰 링크(성인) */
  [c, p, errs] = await open('block/index.html', () => { window.__saved = null; window.GFSave = { image: (d, n) => { window.__saved = [d.slice(0, 22), n]; return true; } }; window.__url = null; window.GFOps = { version: () => 't', openUrl: (u) => { window.__url = u; }, review() {}, mail() {} }; });
  const sh = await p.evaluate(async () => { const svg = GF.share.svg({ title: '클리어!', stars: 3, line: '시험' }); await GF.share.save({ title: '클리어!', stars: 3 }); return { hasTitle: /당신은 어느 도형인가요\?/.test(svg), hasLogo: /기하학 가족/.test(svg), saved: window.__saved }; });
  ok(sh.hasTitle && sh.hasLogo && sh.saved && /^data:image\/png/.test(sh.saved[0]), '공유 카드: 「당신은 어느 도형인가요?」+로고+PNG 저장(GFSave) ' + (sh.saved && sh.saved[1]));
  await p.evaluate(() => { GF.stack = []; GF.go('bhome'); UK.result({ title: '클리어!', stars: 3, parent: GF.cur.el, onNext: () => {}, onHome: () => {} }); }); await p.waitForTimeout(500);
  ok(await p.evaluate(() => !!document.querySelector('.uk-sheet .sh-card')), '성인 결과 화면에 「공유 카드 저장」 버튼');
  await p.evaluate(() => { document.querySelectorAll('.uk-scrim').forEach((e) => e.remove()); GF.extras.open(); }); await p.waitForTimeout(300);
  ok(await p.evaluate(() => /웹툰 보기/.test(document.querySelector('.uk-sheet').innerText)), '성인 설정에 「웹툰 보기」');
  await p.evaluate(() => { GF.ops.openWebtoon(); }); ok(await p.evaluate(() => window.__url === 'https://blog.naver.com/gihahakf'), '웹툰 링크: 네이티브 openUrl 로 블로그 주소');
  await p.evaluate(() => { document.querySelectorAll('.uk-scrim').forEach((e) => e.remove()); GF.stack = []; GF.go('bhome'); GF.go('blevels'); }); await p.waitForTimeout(700);
  ok(await p.evaluate(() => [...document.querySelectorAll('.sg-rb')].some((x) => /웹툰/.test(x.innerText))), '지도 레일에 웹툰 버튼(성인)');
  ok(errs.length === 0, '공유·웹툰 오류 없음 ' + errs[0]); await c.close();
  [c, p, errs] = await open('day/index.html');
  await p.evaluate(() => { UK.result({ kid: true, title: '', stars: 3, parent: GF.cur.el, onNext: () => {}, onHome: () => {} }); }); await p.waitForTimeout(400);
  ok(await p.evaluate(() => !document.querySelector('.sh-card')), '유아 결과 화면엔 공유 카드 없음'); await c.close();
  /* A2 UI: 카드·도장책·모음·가족 코드·문패 장식 */
  [c, p, errs] = await open('merge/index.html', () => { window.__st = []; window.GFOps = { version: () => 't', hasApp: (k) => /spot/.test(k), launch: (k) => window.__st.push('launch:' + k), openStore: (k) => window.__st.push('store:' + k), openUrl() {}, review() {}, mail() {} }; });
  await p.evaluate(() => { GF.ip.addCard('shoes', 0); GF.ip.addStamp('merge', 'first'); GF.ops.openAlbum(); }); await p.waitForTimeout(300);
  const al = await p.evaluate(() => ({ cards: document.querySelectorAll('.ops-card').length, txt: document.querySelector('.uk-sheet').innerText }));
  ok(al.cards >= 14 && /이야기 카드/.test(al.txt), '앨범: 이야기 카드 목록(성인 그룹 ' + al.cards + '편, 얻은 카드 점·못 얻은 카드는 어느 앱인지)');
  await p.evaluate(() => { document.querySelectorAll('.uk-scrim').forEach((e) => e.remove()); GF.ops.openPassport(); }); await p.waitForTimeout(300);
  const ps = await p.evaluate(() => ({ rows: document.querySelectorAll('.ops-pass').length, more: [...document.querySelectorAll('.ops-more')].map((r) => r.innerText.replace(/\s+/g, ' ')), txt: document.querySelector('.uk-sheet').innerText, plates: document.querySelectorAll('.ops-plates span').length }));
  ok(ps.rows === 7 && /도장책/.test(ps.txt) && ps.plates === 3, '도장책(성인): 7개 앱 도장 줄 + 문패 장식 3종');
  ok(ps.more.length === 6 && ps.more.some((r) => /열기/.test(r)) && ps.more.some((r) => /스토어에서 보기/.test(r)), '성인 모음 화면: 다른 6개 앱(설치된 건 「열기」, 없는 건 「스토어에서 보기」)');
  await p.evaluate(() => { [...document.querySelectorAll('.ops-more button')].forEach((b) => b.click()); }); ok(await p.evaluate(() => window.__st.some((x) => /^launch:com.geometricfamily.spot/.test(x)) && window.__st.some((x) => /^store:com.geometricfamily/.test(x))), '모음 화면: 설치된 앱은 앱 열기, 없는 앱은 스토어 열기(네이티브)');
  await p.evaluate(() => { document.querySelectorAll('.uk-scrim').forEach((e) => e.remove()); GF.ops.openFamilyCode(); }); await p.waitForTimeout(300);
  ok(await p.evaluate(() => /가족 코드/.test(document.querySelector('.uk-sheet').innerText) && !!document.querySelector('.uk-sheet textarea')), '가족 코드 시트(만들기·붙여넣기)');
  await p.evaluate(() => { document.querySelectorAll('.uk-scrim').forEach((e) => e.remove()); GF.ip.L.plate.push('crown'); const d = Room.mePlate(document.body); window.__plate = d ? d.innerText + '|' + (d.querySelector('.rm-deco') || {}).textContent : 'noplate'; });
  ok(await p.evaluate(() => /👑/.test(window.__plate) || window.__plate === 'noplate'), '문패 장식: 내 도형 문패에 장식 표시(내 도형이 있을 때)');
  ok(errs.length === 0, 'A2 오류 없음 ' + errs[0]); await c.close();
  [c, p, errs] = await open('day/index.html', () => { window.GFOps = { version: () => 't', hasApp: () => true, openStore() { window.__bad = 1; }, launch() { window.__bad = 1; }, openUrl() { window.__bad = 1; } }; });
  await p.evaluate(() => { GF.ip.addCard('hare', 0); GF.ops.openPassport(); }); await p.waitForTimeout(300);
  const kp = await p.evaluate(() => ({ txt: document.querySelector('.uk-sheet').innerText, more: document.querySelectorAll('.ops-more').length, rows: document.querySelectorAll('.ops-pass').length }));
  ok(kp.rows === 3 && kp.more === 0 && !/스토어|열기|웹툰|http/.test(kp.txt), '유아 도장판: 3개 앱 줄, 앱 이름·스토어·링크 없음(앱 밖 안내 0)');
  await p.evaluate(() => { document.querySelectorAll('.uk-scrim').forEach((e) => e.remove()); GF.stack = []; GF.go('dhome'); GF.go('dmap'); }); await p.waitForTimeout(700);
  ok(await p.evaluate(() => [...document.querySelectorAll('.sg-rb')].length >= 2 && ![...document.querySelectorAll('.sg-rb')].some((x) => /웹툰/.test(x.innerText))), '유아 지도 레일: 도장판 버튼, 웹툰 버튼 없음');
  ok(await p.evaluate(() => !window.__bad), '유아 앱: 외부 이동 호출 0');
  ok(errs.length === 0, '유아 A2 오류 없음 ' + errs[0]); await c.close();
  /* A3: 개인화·같은 주·카메오 */
  [c, p, errs] = await open('merge/index.html');
  const tn = await p.evaluate(() => { const O = GF.ops, out = {}; const orig = O.me; O.me = () => ({ f: 'semo', name: '세모 아내형' }); out.semo = O.tone('좋아요. 가요.'); O.me = () => ({ f: 'dong', name: '동그라미 아빠형' }); out.dong = O.tone('좋아요! 가요~'); O.me = () => ({ f: 'nemo', name: '네모 아빠형' }); out.nemo = O.tone('좋아요. 가요!'); O.me = () => null; out.none = O.tone('좋아요.'); O.me = orig; return out; });
  ok(tn.semo === '좋아요! 가요!' && tn.dong === '좋아요. 가요' && tn.nemo === '좋아요. 가요!' && tn.none === '좋아요.', '내 도형 말투: 세모 들뜸·동그라미 차분·네모/미설정 그대로 ' + JSON.stringify(tn));
  const wk = await p.evaluate(() => { const O = GF.ops; O._now = () => new Date(2026, 9, 12).getTime(); const a = O.week(); O._now = () => new Date(2027, 0, 4).getTime(); const b2 = O.week(); O._now = () => new Date(2026, 8, 7).getTime(); const c2 = O.week(); O._now = () => Date.now(); return [a && a.id, b2 && b2.id, c2 && c2.id, (GF.data.ops.weekThemes || []).length]; });
  ok(wk[0] === 'autumn' && wk[1] === 'seol' && wk[3] === 53, '같은 주 같은 시즌: 날짜로 주간 주제(10월 둘째 주 단풍, 1월 첫 주 설날) ' + wk.join());
  await p.evaluate(() => { GF.ops._now = () => Date.now(); GF.stack = []; GF.go('mhome'); GF.go('mlevels'); }); await p.waitForTimeout(700);
  ok(await p.evaluate(() => !!document.querySelector('.sg-week') && /이번 주/.test(document.querySelector('.sg-week').innerText)), '성인 지도 머리에 「이번 주: 주제」 줄');
  /* 카메오 */
  const cm = await p.evaluate(() => { const I = GF.ip, a = I.cameo('merge', 'e2'), n1 = document.querySelectorAll('.ip-cameo').length, b2 = I.cameo('merge', 'e2'), has = I.hasCameo('merge:e2'), none = I.cameo('merge', 'e3'), txt = (document.querySelector('.ip-cameo') || {}).innerText; return { a, n1, b2, has, none, txt }; });
  ok(cm.a === true && cm.n1 === 1 && cm.b2 === false && cm.has && cm.none === false && cm.txt && cm.txt.length > 3, '카메오: 장 끝 컷 직후 한 번만 등장(도감에 기록), 해당 없는 컷엔 없음 「' + (cm.txt || '').replace(/\s+/g, ' ') + '」');
  ok(await p.evaluate(() => { const lines = GF.data.ops.cameos.filter((x) => !x.kid).map((x) => x.line).join(' '); return !/받아요|다운로드|설치|광고|스토어/.test(lines); }), '카메오 문구: 광고성 말 없음(S5)');
  const cd = await p.evaluate(() => { const I = GF.ip, tot = I.cameoCount().total; GF.data.ops.cameos.filter((x) => !x.kid).slice(0, Math.ceil(tot * 0.5)).forEach((x) => I.addCameo(x.id)); const due = I.cameoGifts(); const ow = Room.owned().length; const it = I.claimCameoGift(due[0]); const ow2 = Room.owned().length; const again = I.cameoGifts().length; GF.ops.openCameos(); return { tot, due, gained: ow2 - ow, again, txt: document.querySelector('.uk-sheet').innerText, cells: document.querySelectorAll('.ops-cam').length }; });
  ok(cd.tot === 30 && cd.due.length >= 2 && cd.gained === 1 && /카메오 도감/.test(cd.txt) && cd.cells === 30, '카메오 도감: 성인 30명, 25%·50% 선물(확정 소품 1개씩) ' + cd.due.join());
  ok(errs.length === 0, 'A3 오류 없음 ' + errs[0]); await c.close();
  [c, p, errs] = await open('day/index.html');
  const kc = await p.evaluate(() => { const I = GF.ip, a = I.cameo('day', 'e2'); const el = document.querySelector('.ip-cameo'); return { a, kid: el && el.classList.contains('kid'), txt: el ? el.querySelector('.tx') : 'none', total: I.cameoCount().total }; });
  ok(kc.a === true && kc.kid && kc.txt === null && kc.total === 6, '유아 ⑩ 카메오: 글 없이 그림·소품·소리로만(' + kc.total + '명)');
  await p.evaluate(() => { GF.stack = []; GF.go('dhome'); GF.go('dmap'); }); await p.waitForTimeout(600); ok(await p.evaluate(() => !document.querySelector('.sg-week')), '유아 지도에는 주간 주제 글 없음'); await c.close();
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
