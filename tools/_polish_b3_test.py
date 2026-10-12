import pathlib
t = pathlib.Path('tools/polish_smoke.js'); u = t.read_text(encoding='utf-8')
add = r"""  /* B3: 쉬운 모드 */
  [c, p, errs] = await open('merge/index.html');
  await p.evaluate(() => GF.extras.open()); await p.waitForTimeout(300);
  ok(await p.evaluate(() => /쉬운 모드/.test(document.querySelector('.uk-sheet').innerText)), '설정에 「쉬운 모드」 줄(성인)');
  const as = await p.evaluate(() => { const P = GF.polish, a0 = [P.cap(1, {}), P.easy(2, {})]; GF.state.settings.assist = 1; const a1 = [P.cap(1, {}), P.easy(2, {}), P.easy(3, {}), P.cap(1, { kind: 'daily' }), P.easy(2, { kind: 'daily' })]; GF.state.settings.assist = 0; return [a0, a1]; });
  ok(as[0][0] === 1 && as[0][1] === 2, '쉬운 모드 꺼짐: 한도·별 그대로');
  ok(as[1][0] === 99 && as[1][1] === 3 && as[1][2] === 3 && as[1][3] === 1 && as[1][4] === 2, '쉬운 모드 켜짐: 되돌리기 한도 해제·별 한 칸 완화(최대 3), 오늘의 한 판 등 경쟁 판에는 적용 안 함');
  const und = await p.evaluate(async () => { GF.state.settings.assist = 1; GF.stack = []; GF.go('mhome'); GF.go('mplay', { n: 1 }); await new Promise((r) => setTimeout(r, 600)); const L = MERGE.debug.level(); const q0 = MERGE.debug.state().qi; MERGE.debug.place(L.solution[0]); MERGE.debug.undo(); MERGE.debug.place(L.solution[0]); MERGE.debug.undo(); return [q0, MERGE.debug.state().qi]; });
  ok(und[0] === und[1], '쉬운 모드: 한 판에 되돌리기를 두 번 이상 써도 됨(③ 합치기)');
  const und2 = await p.evaluate(async () => { GF.state.settings.assist = 0; GF.stack = []; GF.go('mhome'); GF.go('mplay', { n: 1 }); await new Promise((r) => setTimeout(r, 600)); const L = MERGE.debug.level(); const q0 = MERGE.debug.state().qi; MERGE.debug.place(L.solution[0]); MERGE.debug.undo(); MERGE.debug.place(L.solution[0]); MERGE.debug.undo(); return [q0, MERGE.debug.state().qi]; });
  ok(und2[0] !== und2[1], '쉬운 모드 꺼짐: 되돌리기는 한 판 한 번(두 번째는 막힘)');
  ok(errs.length === 0, '쉬운 모드 오류 없음 ' + errs[0]); await c.close();
"""
if 'B3:' not in u:
    u = u.replace("  await b.close(); console.log(fails ? 'FAILED '", add + "  await b.close(); console.log(fails ? 'FAILED '", 1); t.write_text(u, encoding='utf-8')
print('ok')
