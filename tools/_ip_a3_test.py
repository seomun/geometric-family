import pathlib
t = pathlib.Path('tools/ip_smoke.js'); u = t.read_text(encoding='utf-8')
add = r"""  /* A3: 개인화·같은 주·카메오 */
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
"""
if 'A3:' not in u:
    u = u.replace("  await b.close(); console.log(fails ? 'FAILED '", add + "  await b.close(); console.log(fails ? 'FAILED '", 1); t.write_text(u, encoding='utf-8')
print('ok')
