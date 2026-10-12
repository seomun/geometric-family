import pathlib
t = pathlib.Path('tools/polish_smoke.js'); u = t.read_text(encoding='utf-8')
add = r"""  /* B2: 일시정지 메뉴 · 별 목표 칩 · 다음 목표 한 줄 */
  const PL = { merge: ['mhome', 'mplay', '.mg-cell'], spot: ['phome', 'pplay', '.sp-pic'], block: ['bhome', 'bplay', '.bk-cell, .bk-board'], sort: ['shome', 'splay', '.sr-tube'], tile: ['thome', 'tplay', '.tl-t'] };
  for (const [app, [home, play, sel]] of Object.entries(PL)) {
    [c, p, errs] = await open(app + '/index.html'); await p.evaluate(([h, pl]) => { GF.stack = []; GF.go(h); GF.go(pl, { n: 1 }); }, [home, play]); await p.waitForTimeout(700);
    ok(await p.evaluate(() => !!document.querySelector('.screen.on .pol-goal') && /★★★/.test(document.querySelector('.screen.on .pol-goal').textContent)), app + ' 판 화면에 별 목표 칩');
    const early = await p.evaluate(() => { const before = GF.stack.length; GF.back(); return [before, GF.stack.length]; });
    ok(early[1] === early[0] - 1, app + ' 첫 조작 전 ‹ 는 메뉴 없이 바로 나감');
    await p.evaluate(([h, pl]) => { GF.stack = []; GF.go(h); GF.go(pl, { n: 1 }); }, [home, play]); await p.waitForTimeout(600);
    await p.mouse.click(195, 400); await p.waitForTimeout(300);
    await p.evaluate(() => { GF.back(); }); await p.waitForTimeout(300);
    ok(await p.evaluate(() => /잠깐 쉬어요/.test(document.body.innerText)), app + ' 조작 뒤 ‹ → 일시정지 메뉴');
    if (app === 'merge') await p.screenshot({ path: 'notes/snapshots/polish_pause_merge.png' });
    await p.evaluate(() => { [...document.querySelectorAll('.uk-scrim .acts .uk-btn')].find((x) => /계속/.test(x.innerText)).click(); }); await p.waitForTimeout(300);
    ok(await p.evaluate((pl) => GF.cur.name === pl, play), app + ' 메뉴 「계속」 = 그대로 판 화면');
    await p.evaluate(() => { GF.back(); }); await p.waitForTimeout(300);
    await p.evaluate(() => { [...document.querySelectorAll('.uk-scrim .acts .uk-btn')].find((x) => /지도로/.test(x.innerText)).click(); }); await p.waitForTimeout(400);
    ok(await p.evaluate((pl) => GF.cur.name !== pl, play), app + ' 메뉴 「지도로」 = 판 화면을 나감');
    await p.evaluate(([h, pl]) => { GF.stack = []; GF.go(h); GF.go(pl, { n: 1 }); }, [home, play]); await p.waitForTimeout(600); await p.mouse.click(195, 400); await p.waitForTimeout(300);
    await p.evaluate(() => { GF.back(); }); await p.waitForTimeout(300);
    const again = await p.evaluate(() => { [...document.querySelectorAll('.uk-scrim .acts .uk-btn')].find((x) => /다시/.test(x.innerText)).click(); return true; }); await p.waitForTimeout(500);
    ok(await p.evaluate((pl) => GF.cur.name === pl && GF.cur.params.n === 1, play), app + ' 메뉴 「다시」 = 같은 판 새로 시작');
    ok(errs.length === 0, app + ' 일시정지 오류 없음 ' + errs[0]); await c.close();
  }
  [c, p, errs] = await open('merge/index.html');
  const nx = await p.evaluate(() => { const D = GF.data.merge_levels, a = GF.polish.nextText(D.levels[0], D), last = D.levels.find((l) => l.chapter === 1 && l.id % 10 === 0), b2 = GF.polish.nextText(last, D); return [a, b2, GF.polish.nextText({ kind: 'daily' }, D)]; });
  ok(/다음 · 1장/.test(nx[0]) && /이야기가 이어져요/.test(nx[1]) && nx[2] === '', '결과 다음 목표: 같은 장 안 「다음 · N장 제목」, 장 끝 「이야기가 이어져요」, 오늘의 한 판은 없음');
  await c.close();
  [c, p, errs] = await open('day/index.html'); await p.evaluate(() => { GF.stack = []; GF.go('dhome'); GF.go('dplay', { n: 1 }); }); await p.waitForTimeout(700); await p.mouse.click(195, 400); await p.waitForTimeout(300);
  await p.evaluate(() => { GF.back(); }); await p.waitForTimeout(300);
  ok(await p.evaluate(() => !!document.querySelector('.uk-scrim') && !/쉬어요|계속|지도로/.test(document.querySelector('.uk-sheet').innerText) && document.querySelectorAll('.uk-scrim .acts .uk-btn').length === 3), '유아 ⑩ 일시정지: 글자 없이 아이콘 버튼 3개');
  ok(await p.evaluate(() => !document.querySelector('.pol-goal')), '유아 앱에는 별 목표 칩(글자) 없음'); await c.close();
"""
if 'B2:' not in u:
    u = u.replace("  await b.close(); console.log(fails ? 'FAILED '", add + "  await b.close(); console.log(fails ? 'FAILED '", 1); t.write_text(u, encoding='utf-8')
print('ok')
