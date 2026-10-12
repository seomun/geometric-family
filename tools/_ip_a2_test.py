import pathlib
sg = pathlib.Path('games/engine/saga.js'); w = sg.read_text(encoding='utf-8')
if "kid && GF.ip" not in w:
    w = w.replace("    if (o.side && o.side.length) {", "    if (kid && GF.ip && GF.ip.ready && GF.ops && GF.ops.openPassport) { o.side = (o.side || []).concat([{ icon: 'star', text: 'stamp', fn: () => GF.ops.openPassport() }]); }   // 유아 도장판(글자 없음)\n    if (o.side && o.side.length) {", 1)
    sg.write_text(w, encoding='utf-8')
t = pathlib.Path('tools/ip_smoke.js'); u = t.read_text(encoding='utf-8')
add = r"""  /* A2 UI: 카드·도장책·모음·가족 코드·문패 장식 */
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
"""
if 'A2 UI' not in u:
    u = u.replace("  await b.close(); console.log(fails ? 'FAILED '", add + "  await b.close(); console.log(fails ? 'FAILED '", 1); t.write_text(u, encoding='utf-8')
print('ok')
