import pathlib
t = pathlib.Path('tools/ops_smoke.js'); u = t.read_text(encoding='utf-8')
add = r"""  /* 대 묶음: 광고 제거·소품 팩(구매)·로컬 알림 */
  const stubB = () => { window.GFBilling = { info: () => JSON.stringify({ adfree: { configured: true, price: '₩1,900', owned: false }, pack: { configured: true, price: '₩3,300', owned: false } }), buy(k) { setTimeout(() => window.GF_billEvent(k, 'owned'), 50); }, restore() {} }; };
  [c, p, errs] = await open('merge/index.html');
  await p.evaluate(() => GF.extras.open()); await p.waitForTimeout(300);
  ok(await p.evaluate(() => !/광고 제거|소품 팩|오늘의 한 판 알림/.test(document.querySelector('.uk-sheet').innerText)), '구매·알림: 네이티브/상품 ID 가 없으면 설정에 줄이 없음(숨김)');
  await p.evaluate(() => { document.querySelectorAll('.uk-scrim').forEach((e) => e.remove()); window.GFBilling = { info: () => JSON.stringify({ adfree: { configured: true, price: '₩1,900', owned: false }, pack: { configured: true, price: '₩3,300', owned: false } }), buy(k) { setTimeout(() => window.GF_billEvent(k, 'owned'), 50); }, restore() {} }; GF.extras.open(); }); await p.waitForTimeout(300);
  ok(await p.evaluate(() => /광고 제거/.test(document.querySelector('.uk-sheet').innerText) && /₩1,900/.test(document.querySelector('.uk-sheet').innerText) && /소품 팩/.test(document.querySelector('.uk-sheet').innerText) && /구매 복원/.test(document.querySelector('.uk-sheet').innerText)), '구매: 상품 ID 가 있으면 광고 제거(가격)·소품 팩·구매 복원 줄');
  const before = await p.evaluate(() => Room.owned().length);
  await p.evaluate(() => { const r = [...document.querySelectorAll('.xt-row')].find((x) => /광고 제거/.test(x.innerText)); r.querySelector('button').click(); }); await p.waitForTimeout(400);
  ok(await p.evaluate(() => GF.ads.config.adFree === true && JSON.parse(localStorage.getItem('gf:merge:iap')).adfree === 1), '광고 제거 구매 → adFree 켜짐·기록');
  ok(await p.evaluate(() => { GF.ads.config.test = true; GF.ads.banner(true); return GF.ads._banner === false && GF.ads._interOk() === false; }), '광고 제거: 배너·전면이 나가지 않음');
  ok(await p.evaluate(() => { let g = 0; GF.ads.run({ placement: 'x', onReward: () => { g++; } }); return g === 1 || !GF.ads.live(); }), '광고 제거: 선택형 보상은 바로 지급(또는 광고 자체 없음)');
  await p.evaluate(() => { window.GF_billEvent('pack', 'owned'); }); await p.waitForTimeout(300);
  const afterPack = await p.evaluate(() => Room.owned().length); ok(afterPack - before === 5, '소품 팩 구매 → 확정 지급 5개(뽑기 없음, ' + (afterPack - before) + '개)');
  await p.evaluate(() => { window.GF_billEvent('pack', 'owned'); window.GF_billEvent('pack', 'restored'); }); await p.waitForTimeout(200);
  ok((await p.evaluate(() => Room.owned().length)) === afterPack, '소품 팩: 복원·중복 이벤트로 또 지급되지 않음');
  ok(errs.length === 0, '구매 오류 없음 ' + errs[0]); await c.close();
  [c, p, errs] = await open('day/index.html', () => { window.GFBilling = { info: () => JSON.stringify({ adfree: { configured: true, price: 'x', owned: false }, pack: { configured: true, price: 'y', owned: false } }), buy() {}, restore() {} }; window.GFNotify = { available: () => true, enable() {}, disable() {} }; });
  await p.evaluate(() => GF.extras.open()); await p.waitForTimeout(300);
  ok(await p.evaluate(() => GF.ops.iap.configured('adfree') === false && !/광고 제거|소품 팩|알림/.test(document.querySelector('.uk-sheet').innerText)), '유아 앱: 구매·알림 줄이 절대 없음(스텁이 있어도)'); await c.close();
  [c, p, errs] = await open('merge/index.html', () => { window.__n = { on: 0, off: 0 }; window.GFNotify = { available: () => true, enable() { window.__n.on++; setTimeout(() => window.GF_notifEvent(window.__deny ? 'denied' : 'granted'), 50); }, disable() { window.__n.off++; } }; });
  await p.evaluate(() => GF.extras.open()); await p.waitForTimeout(300);
  ok(await p.evaluate(() => /오늘의 한 판 알림/.test(document.querySelector('.uk-sheet').innerText) && GF.ops.notif.on() === false), '알림: 설정에 「오늘의 한 판 알림」 줄, 기본 꺼짐');
  await p.evaluate(() => { const r = [...document.querySelectorAll('.xt-row')].find((x) => /오늘의 한 판 알림/.test(x.innerText)); (r.querySelector('input,button,.uk-switch') || r.lastChild).click(); }); await p.waitForTimeout(300);
  ok(await p.evaluate(() => window.__n.on === 1 && GF.ops.notif.on() === true), '알림: 켜면 네이티브 enable 호출(권한 요청은 이때만)·상태 저장');
  await p.evaluate(() => { window.__deny = 1; GF.ops.notif.set(false); GF.ops.notif.set(true); }); await p.waitForTimeout(300);
  ok(await p.evaluate(() => GF.ops.notif.on() === false), '알림: 권한 거부 이벤트 → 다시 꺼짐(조용히 안내)');
  ok(errs.length === 0, '알림 오류 없음 ' + errs[0]); await c.close();
"""
if '대 묶음' not in u:
    u = u.replace("  await b.close(); console.log(fails ? 'FAILED '", add + "  await b.close(); console.log(fails ? 'FAILED '", 1)
    t.write_text(u, encoding='utf-8')
print('ok')
