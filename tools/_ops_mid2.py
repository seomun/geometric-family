import pathlib
p = pathlib.Path('tools/ops_build.py'); s = p.read_text(encoding='utf-8')
add = """    'ops.settings.cal': '올해의 달력', 'ops.settings.mis': '오늘의 작은 일', 'ops.settings.album': '앨범', 'ops.settings.backup': '백업 코드',
    'ops.cal.title': '올해의 달력', 'ops.cal.m': '{m}월', 'ops.cal.now': '지금', 'ops.cal.done': '다 했어요', 'ops.cal.again': '다시 열기', 'ops.cal.later': '{m}월에 열려요',
    'ops.cal.note': '해마다 돌아와요. 놓쳐도 나중에 다시 열 수 있어요.', 'ops.cal.empty': '이 앱에는 계절 이벤트가 아직 없어요.',
    'ops.mis.title': '오늘의 작은 일', 'ops.mis.note': '못 해도 괜찮아요. 내일 또 새로 나와요.', 'ops.mis.gift': '🎁 오늘의 선물 받기', 'ops.mis.gifted': '오늘의 선물을 받았어요.',
    'ops.mis.clear': '판을 {n}번 깨요', 'ops.mis.star3': '별 3개로 판을 깨요', 'ops.mis.story': '이야기를 한 번 봐요', 'ops.mis.house': '집에 소품을 하나 놓아요', 'ops.mis.daily': '오늘의 한 판을 해요',
    'ops.mis.got': '「{name}」을 받았어요', 'ops.mis.none': '이 앱의 소품을 모두 모았어요',
    'ops.album.title': '앨범', 'ops.album.items': '집 소품', 'ops.album.cards': '이야기 카드', 'ops.album.season': '계절 이벤트', 'ops.album.claim': '🎁 카드 3장 선물 받기', 'ops.album.next': '다음 선물까지 이야기 카드 {n}장',
    'ops.backup.title': '백업 코드', 'ops.backup.note': '코드를 적어 두면 기기를 바꿔도 이어서 할 수 있어요. 코드는 이 기기 안에서만 만들어져요.', 'ops.backup.make': '코드 만들기', 'ops.backup.copy': '복사', 'ops.backup.copied': '복사했어요',
    'ops.backup.paste': '코드 붙여넣기', 'ops.backup.load': '불러오기', 'ops.backup.confirm': '지금 기록이 바뀌어요. 한 번 더 누르면 불러와요.', 'ops.backup.bad': '코드가 올바르지 않아요.', 'ops.backup.other': '다른 앱의 코드예요.', 'ops.backup.ok': '불러왔어요. 곧 다시 시작해요.',
"""
if "'ops.cal.title'" not in s:
    s = s.replace("    'ops.back.title':", add + "    'ops.back.title':", 1)
s = s.replace("'설정에 「움직임 줄이기」와 「문의·FAQ」가 생겼어요.'", "'설정에 「움직임 줄이기」·「문의·FAQ」·「백업 코드」·「올해의 달력」·「오늘의 작은 일」·「앨범」이 생겼어요.'")
p.write_text(s, encoding='utf-8')
c = pathlib.Path('games/engine/extras.css'); x = c.read_text(encoding='utf-8')
if '.ops-cal' not in x:
    x += """
.ops-cal { text-align: left; margin: 6px 0; padding: 6px 8px; border-radius: 14px; background: #fff; box-shadow: var(--uk-sh); } .ops-cal.now { outline: 3px solid #6CCB8A; } .ops-cal > b { display: block; font: 900 var(--uk-fs-cap)/1.2 var(--uk-font); margin-bottom: 4px; }
.ops-ev { display: flex; justify-content: space-between; align-items: center; width: 100%; min-height: 44px; margin: 3px 0; padding: 4px 12px; border: 0; border-radius: 12px; background: #F4EFE6; font: 800 var(--uk-fs-cap)/1.2 var(--uk-font); color: var(--uk-ink); } .ops-ev small { font-weight: 700; color: var(--uk-ink2); } .ops-ev.now { background: #DFF5E6; } .ops-ev.done { background: #FFF0B8; } .ops-ev.again { background: #E3F0FB; } .ops-ev.later { opacity: .6; }
.ops-mis { display: flex; align-items: center; gap: 10px; margin: 6px 0; padding: 8px 12px; border-radius: 14px; background: #fff; box-shadow: var(--uk-sh); text-align: left; } .ops-mis .ic { font-size: 28px; } .ops-mis .tx { flex: 1; font: 800 var(--uk-fs-cap)/1.3 var(--uk-font); } .ops-mis b { font: 900 var(--uk-fs-cap)/1 var(--uk-font); } .ops-mis.ok { background: #E8F8EC; }
.ops-chips { display: flex; flex-wrap: wrap; gap: 6px; margin: 4px 0 8px; } .ops-chips span { padding: 4px 10px; border-radius: 12px; background: #EDE7DD; font: 700 calc(13px * var(--uk-fs-k, 1))/1.2 var(--uk-font); color: #8B8092; } .ops-chips span.on { background: #FFF0B8; color: var(--uk-ink); }
.ops-code { width: 100%; box-sizing: border-box; margin: 6px 0; padding: 8px; border: 2px solid #E2D8DE; border-radius: 12px; font: 600 12px/1.3 monospace; resize: none; }
"""
    c.write_text(x, encoding='utf-8')
t = pathlib.Path('tools/ops_smoke.js'); u = t.read_text(encoding='utf-8')
add_t = r"""  /* 중 묶음: 달력·미션·앨범·백업 코드 */
  [c, p, errs] = await open('merge/index.html');
  const cal = await p.evaluate(() => { const ev = GF.extras.cfg.calendar(); return { n: ev.length, ids: ev.map((e) => e.id + ':' + e.months.join('/')).join(' ') }; });
  ok(cal.n >= 4, '이벤트 달력: 계절 이벤트 ' + cal.n + '개(' + cal.ids + ')');
  await p.evaluate(() => { GF.ops._now = () => new Date(2026, 9, 12).getTime(); GF.ops.openCalendar(); }); await p.waitForTimeout(300);
  const calUi = await p.evaluate(() => ({ again: document.querySelectorAll('.ops-ev.again').length, later: document.querySelectorAll('.ops-ev.later').length, now: document.querySelectorAll('.ops-ev.now').length, txt: document.querySelector('.uk-sheet').innerText }));
  ok(calUi.now >= 1 && calUi.again >= 1 && calUi.later >= 1, '이벤트 달력: 10월 기준 지금(추석)·지난 것 다시 열기(어린이날 등)·앞으로 N월에 열려요');
  ok(!/남은|D-|카운트|마감|사라지|놓치면/.test(calUi.txt), '이벤트 달력: 카운트다운·FOMO 문구 없음');
  await p.click('.ops-ev.again'); await p.waitForTimeout(900);
  ok(await p.evaluate(() => GF.cur.name === 'mplay' && GF.cur.params.level && GF.cur.params.level.kind === 'season'), '이벤트 달력: 지난 이벤트 「다시 열기」 → 그 시즌 판');
  const ms = await p.evaluate(() => { const O = GF.ops; O._now = () => new Date(2026, 9, 12).getTime(); const L = O.missions(); const ids = L.map((x) => x.id); O.noteResult(3); O.noteResult(3); O.noteResult(3); O.note('story'); O.note('house'); O.note('daily'); return { n: L.length, uniq: new Set(ids).size, after: O.missions().map((x) => x.id + ':' + x.got + '/' + x.n) }; });
  ok(ms.n === 3 && ms.uniq === 3, '오늘의 작은 일: 하루 3개(중복 없음) ' + ms.after.join(' '));
  const mg = await p.evaluate(() => { const O = GF.ops; O._now = () => new Date(2026, 9, 13).getTime(); const l1 = O.missions().map((x) => x.id).join(); O._now = () => new Date(2026, 9, 12).getTime(); const l0 = O.missions().map((x) => x.id).join(); return [l1, l0]; });
  ok(mg[0] !== mg[1], '오늘의 작은 일: 날마다 다른 조합');
  await p.evaluate(() => { document.querySelectorAll('.uk-scrim').forEach((e) => e.remove()); GF.ops.openAlbum(); }); await p.waitForTimeout(300);
  ok(await p.evaluate(() => /집 소품/.test(document.body.innerText) && /이야기 카드/.test(document.body.innerText)), '앨범: 집 소품·이야기 카드 구역');
  const bk = await p.evaluate(() => { const O = GF.ops; localStorage.setItem('gf:merge:ui:v1', '{"x":1}'); const code = O.makeCode(); const good = O.readCode(code).ok; const bad = O.readCode(code.slice(0, -1) + (code.slice(-1) === '0' ? '1' : '0')).err; const garbage = O.readCode('hello').err; O.app = 'spot'; const other = O.readCode(code).err; O.app = 'merge'; localStorage.setItem('gf:merge:ui:v1', '{"x":2}'); O.applyCode(code); return { good, bad, garbage, other, restored: localStorage.getItem('gf:merge:ui:v1'), len: code.length }; });
  ok(bk.good && bk.bad === 'bad' && bk.garbage === 'bad' && bk.other === 'other', '백업 코드: 정상 통과·체크섬 오류·형식 오류·다른 앱 코드 구분');
  ok(bk.restored === '{"x":1}', '백업 코드: 불러오면 기록이 되돌아옴(코드 길이 ' + bk.len + ')');
  ok(errs.length === 0, '중 묶음 오류 없음 ' + errs[0]); await c.close();
  [c, p, errs] = await open('day/index.html'); await p.evaluate(() => GF.extras.open()); await p.waitForTimeout(300);
  ok(await p.evaluate(() => /백업 코드/.test(document.body.innerText) && !/오늘의 작은 일|올해의 달력|앨범/.test(document.body.innerText)), '유아 보호자 메뉴: 백업 코드만(미션·달력·앨범은 성인 전용)'); await c.close();
  [c, p, errs] = await open('idle/index.html'); const ic = await p.evaluate(() => GF.extras.cfg.calendar().length); ok(ic >= 1, '② 식탁: 계절 사건 달력 ' + ic + '개'); await c.close();
"""
if '중 묶음' not in u:
    u = u.replace("  await b.close(); console.log(fails ? 'FAILED '", add_t + "  await b.close(); console.log(fails ? 'FAILED '", 1)
    t.write_text(u, encoding='utf-8')
print('ok')
