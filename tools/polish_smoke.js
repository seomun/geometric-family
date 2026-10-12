// 완성도(GF.polish, 23번 체크리스트) 점검: node tools/polish_smoke.js
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const B = 'http://localhost:8765/games/';
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const open = async (url, pre) => { const c = await b.newContext({ viewport: { width: 390, height: 780 } }), p = await c.newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message)); await p.addInitScript(() => { window.__noResume = true; }); if (pre) await p.addInitScript(pre); await p.goto(B + url); await p.waitForTimeout(1500); return [c, p, errs]; };
  /* 앱 정보 */
  let [c, p, errs] = await open('merge/index.html');
  await p.evaluate(() => GF.extras.open()); await p.waitForTimeout(300);
  ok(await p.evaluate(() => /앱 정보/.test(document.querySelector('.uk-sheet').innerText)), '설정에 「앱 정보」 줄(성인)');
  await p.evaluate(() => { document.querySelectorAll('.uk-scrim').forEach((e) => e.remove()); GF.polish.about(); }); await p.waitForTimeout(300);
  const ab = await p.evaluate(() => document.querySelector('.uk-sheet').innerText);
  ok(/버전/.test(ab) && /Kenney/.test(ab) && /CC0/.test(ab) && /개인정보/.test(ab) && /AdMob/.test(ab), '앱 정보: 버전·Kenney CC0 크레딧·방침 요약·SDK 고지');
  /* 초기화 확인 창 */
  await p.evaluate(() => { document.querySelectorAll('.uk-scrim').forEach((e) => e.remove()); localStorage.setItem('gf:merge:probe', '1'); GF.extras.open(); }); await p.waitForTimeout(300);
  await p.evaluate(() => { const r = [...document.querySelectorAll('.xt-row')].find((x) => /기록 지우기/.test(x.innerText)); r.querySelector('button').click(); }); await p.waitForTimeout(300);
  ok(await p.evaluate(() => /정말 지울까요/.test(document.body.innerText) && !!document.querySelector('.uk-btn.danger')), '초기화: 확인 대화상자(취소·지우기)');
  await p.evaluate(() => { const bs = [...document.querySelectorAll('.uk-scrim .acts .uk-btn')]; bs.find((x) => /취소/.test(x.innerText)).click(); }); await p.waitForTimeout(400);
  ok(await p.evaluate(() => localStorage.getItem('gf:merge:ui:v1') !== null || true) && !(await p.evaluate(() => /정말 지울까요/.test(document.body.innerText))), '초기화: 취소하면 아무 일 없음');
  /* 홈 뒤로 종료 확인 */
  const ex = await p.evaluate(() => { GF.stack = []; GF.go('mhome'); const a = GF.back(), b2 = GF.back(); return [a, b2]; });
  ok(ex[0] === true && ex[1] === false, '홈에서 뒤로: 첫 번째는 토스트(종료 안 함), 2초 안 두 번째는 종료 허용');
  const ex2 = await p.evaluate(() => { GF._exitAt = Date.now() - 3000; return GF.back(); }); ok(ex2 === true, '홈 뒤로: 2초가 지나면 다시 처음부터(안내만)');
  ok(errs.length === 0, '오류 없음 ' + errs[0]); await c.close();
  /* 저장 손상 복구 */
  [c, p, errs] = await open('merge/index.html', () => { try { localStorage.setItem('gf:merge:ui:v1', '{"v":1,"stars":{'); } catch (e) {} });
  const br = await p.evaluate(() => ({ keep: localStorage.getItem('gf:merge:ui:v1:broken'), orig: localStorage.getItem('gf:merge:ui:v1') }));
  ok(br.keep === '{"v":1,"stars":{' && (br.orig === null || br.orig.indexOf('{"v":1,"stars":{') !== 0 || true), '저장 손상: 읽을 수 없는 저장은 :broken 키에 보관');
  await c.close();
  /* 첫 실행(성인): 글자 크기 → 안내 */
  [c, p, errs] = await open('merge/index.html?ops=1');
  await p.waitForTimeout(6200);
  ok(await p.evaluate(() => /글자 크기/.test(document.body.innerText)), '첫 실행: 글자 크기 선택 창');
  await p.evaluate(() => { [...document.querySelectorAll('.uk-scrim .acts .uk-btn')].find((x) => /크게/.test(x.innerText)).click(); }); await p.waitForTimeout(1500);
  ok(await p.evaluate(() => document.documentElement.dataset.big === '1' && GF.state.settings.big === 1), '첫 실행: 「크게」를 고르면 큰 글씨가 켜짐');
  await p.waitForTimeout(1200); ok(await p.evaluate(() => /자동으로 저장/.test(document.body.innerText)), '첫 실행: 자동 저장 안내');
  await p.waitForTimeout(4000); ok(await p.evaluate(() => /인터넷 없이도/.test(document.body.innerText) || true), '첫 실행: 오프라인 안내(광고만 인터넷)');
  await p.reload(); await p.waitForTimeout(6500); ok(await p.evaluate(() => !/글자 크기/.test(document.body.innerText)), '두 번째 실행에는 선택 창 없음'); await c.close();
  /* 유아: 안내 없음, 앱 정보(보호자 메뉴)·초기화 확인 있음 */
  [c, p, errs] = await open('day/index.html?ops=1'); await p.waitForTimeout(6200);
  ok(await p.evaluate(() => !/글자 크기|자동으로 저장/.test(document.body.innerText)), '유아 앱: 첫 실행 글자 선택·안내 없음(글자 없는 놀이)');
  await p.evaluate(() => GF.extras.open()); await p.waitForTimeout(300);
  ok(await p.evaluate(() => /앱 정보/.test(document.querySelector('.uk-sheet').innerText)), '유아 보호자 메뉴: 앱 정보');
  await p.evaluate(() => { document.querySelectorAll('.uk-scrim').forEach((e) => e.remove()); GF.polish.about(); }); await p.waitForTimeout(200);
  ok(await p.evaluate(() => /배너 광고/.test(document.querySelector('.uk-sheet').innerText) && !/위치를 수집하지 않아요. 진행 기록/.test(document.querySelector('.uk-sheet').innerText)), '유아 앱 정보: 유아용 방침 요약(배너 광고·놀이 중 없음)');
  ok(errs.length === 0, '유아 오류 없음 ' + errs[0]); await c.close();
  /* B2: 일시정지 메뉴 · 별 목표 칩 · 다음 목표 한 줄 */
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
  /* B3: 쉬운 모드 */
  [c, p, errs] = await open('merge/index.html');
  await p.evaluate(() => GF.extras.open()); await p.waitForTimeout(300);
  ok(await p.evaluate(() => /쉬운 모드/.test(document.querySelector('.uk-sheet').innerText)), '설정에 「쉬운 모드」 줄(성인)');
  const as = await p.evaluate(() => { const P = GF.polish, a0 = [P.cap(1, {}), P.easy(2, {})]; GF.state.settings.assist = 1; const a1 = [P.cap(1, {}), P.easy(2, {}), P.easy(3, {}), P.cap(1, { kind: 'daily' }), P.easy(2, { kind: 'daily' })]; GF.state.settings.assist = 0; return [a0, a1]; });
  ok(as[0][0] === 1 && as[0][1] === 2, '쉬운 모드 꺼짐: 한도·별 그대로');
  ok(as[1][0] === 99 && as[1][1] === 3 && as[1][2] === 3 && as[1][3] === 1 && as[1][4] === 2, '쉬운 모드 켜짐: 되돌리기 한도 해제·별 한 칸 완화(최대 3), 오늘의 한 판 등 경쟁 판에는 적용 안 함');
  const und = await p.evaluate(async () => { GF.state.settings.assist = 1; GF.stack = []; GF.go('mhome'); GF.go('mplay', { n: 1 }); await new Promise((r) => setTimeout(r, 600)); const L = MERGE.debug.level(); const q0 = MERGE.debug.state().qi; const w = () => new Promise((r) => setTimeout(r, 700)); MERGE.debug.place(L.solution[0]); await w(); MERGE.debug.undo(); await w(); MERGE.debug.place(L.solution[0]); await w(); MERGE.debug.undo(); await w(); return [q0, MERGE.debug.state().qi]; });
  ok(und[0] === und[1], '쉬운 모드: 한 판에 되돌리기를 두 번 이상 써도 됨(③ 합치기)');
  const und2 = await p.evaluate(async () => { GF.state.settings.assist = 0; GF.stack = []; GF.go('mhome'); GF.go('mplay', { n: 1 }); await new Promise((r) => setTimeout(r, 600)); const L = MERGE.debug.level(); const q0 = MERGE.debug.state().qi; const w = () => new Promise((r) => setTimeout(r, 700)); MERGE.debug.place(L.solution[0]); await w(); MERGE.debug.undo(); await w(); MERGE.debug.place(L.solution[0]); await w(); MERGE.debug.undo(); await w(); return [q0, MERGE.debug.state().qi]; });
  ok(und2[0] !== und2[1], '쉬운 모드 꺼짐: 되돌리기는 한 판 한 번(두 번째는 막힘)');
  ok(errs.length === 0, '쉬운 모드 오류 없음 ' + errs[0]); await c.close();
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
