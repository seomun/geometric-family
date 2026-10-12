import pathlib, re, json
G = pathlib.Path('games')
# gf.js: 홈 뒤로가기 종료 확인
g = G / 'engine/gf.js'; t = g.read_text(encoding='utf-8')
old = "    if (GF.stack.length <= 1) return false;\n    GF.stack.pop(); const t = GF.stack[GF.stack.length - 1]; show(t.name, t.params); return true;"
assert old in t
new = "    if (GF.stack.length <= 1) {   // 홈에서 뒤로: 2초 안에 한 번 더 누르면 종료(실수로 나가는 것 방지)\n      const now = Date.now(); if (GF._exitAt && now - GF._exitAt < 2000) return false; GF._exitAt = now; try { GF.toast(GF.t ? GF.t('polish.exit') : '한 번 더 누르면 나가요'); } catch (e) {} return true;\n    }\n    GF.stack.pop(); const t = GF.stack[GF.stack.length - 1]; show(t.name, t.params); return true;"
t = t.replace(old, new, 1); g.write_text(t, encoding='utf-8')
# extras.js
e = G / 'engine/extras.js'; u = e.read_text(encoding='utf-8')
old = "    if (c.reset) { let armed = false; const b = tbtn(GF.t('ui.set.wipe'), () => { if (!armed) { armed = true; b.textContent = GF.t('ui.set.once'); return; } c.reset(); try { localStorage.removeItem(key()); } catch (e) {} location.reload(); }); row(body, GF.t('ui.set.wipe.row'), b); }"
assert old in u, 'reset block'
u = u.replace(old, "    if (c.reset) { const b = tbtn(GF.t('ui.set.wipe'), () => { const run = () => { c.reset(); try { localStorage.removeItem(key()); } catch (e) {} location.reload(); }; if (GF.polish) GF.polish.confirmWipe(run); else run(); }); row(body, GF.t('ui.set.wipe.row'), b); }", 1)
u = u.replace("  X.open = openSettings;", "  X.applyBig = applyBig; X.open = openSettings;", 1)
u = u.replace("    if (GF.ops) GF.ops.init(cfg);", "    if (GF.polish) GF.polish.init(cfg);   // 완성도 층(손상 복구·첫 실행 안내)\n    if (GF.ops) GF.ops.init(cfg);", 1)
e.write_text(u, encoding='utf-8')
# ops.rows → polish rows
o = G / 'engine/ops.js'; s = o.read_text(encoding='utf-8')
s = s.replace("    row(GF.t('ops.settings.help'), tb(GF.t('common.view'), () => { sc.close(); O.openHelp(); }));\n", "    row(GF.t('ops.settings.help'), tb(GF.t('common.view'), () => { sc.close(); O.openHelp(); }));\n    if (GF.polish && GF.polish.ready) GF.polish.rows(body, sc);   // 앱 정보\n", 1)
o.write_text(s, encoding='utf-8')
# builders & index.html
for f in ['build', 'build_idle', 'build_merge', 'build_color', 'build_quiz', 'build_block', 'build_spot', 'build_tile', 'build_sort', 'build_day']:
    p = G / 'tools' / f'{f}.py'; x = p.read_text(encoding='utf-8')
    if 'engine/polish.js' not in x: x = x.replace("'engine/ops.js', ", "'engine/ops.js', 'engine/polish.js', ", 1)
    assert 'engine/polish.js' in x, f; p.write_text(x, encoding='utf-8')
for h in ['index.html', 'idle/index.html', 'merge/index.html', 'color/index.html', 'quiz/index.html', 'block/index.html', 'spot/index.html', 'tile/index.html', 'sort/index.html', 'day/index.html']:
    p = G / h; x = p.read_text(encoding='utf-8'); pre = '' if h == 'index.html' else '../'
    tag = f'<script src="{pre}engine/polish.js"></script>'
    if tag not in x: x = x.replace(f'<script src="{pre}engine/ops.js"></script>', f'<script src="{pre}engine/ops.js"></script>\n{tag}', 1); assert tag in x, h; p.write_text(x, encoding='utf-8')
c = G / 'engine/extras.css'; y = c.read_text(encoding='utf-8')
if '.pol-cr' not in y:
    y += "\n.pol-cr { text-align: left; margin: 3px 0; font: 600 var(--uk-fs-cap)/1.45 var(--uk-font); color: var(--uk-ink2); word-break: keep-all; }\n"; c.write_text(y, encoding='utf-8')
# 문자열·크레딧
b = pathlib.Path('tools/ops_build.py'); v = b.read_text(encoding='utf-8')
add = """    'polish.exit': '한 번 더 누르면 나가요', 'polish.cancel': '취소', 'polish.broken': '저장을 읽지 못해 새로 시작해요. 이전 기록은 백업 코드로 되살릴 수 있어요.',
    'polish.settings.about': '앱 정보', 'polish.about.title': '앱 정보', 'polish.about.version': '버전', 'polish.about.credits': '만든 사람들·출처', 'polish.about.privacy': '개인정보',
    'polish.privacy.adult': '이 앱은 이름·이메일·위치를 수집하지 않아요. 진행 기록은 이 기기 안에만 저장돼요. 광고(Google AdMob)와 선택 구매(Google Play 결제)는 각 서비스가 정해진 정보를 처리해요. 자세한 내용은 스토어의 개인정보처리방침에서 볼 수 있어요.',
    'polish.privacy.kid': '이 앱은 이름·사진·위치를 수집하지 않아요. 홈·지도 화면 아래에 아이에게 맞춘 배너 광고가 있고, 놀이 중에는 광고가 없어요. 기록은 이 기기 안에만 저장돼요.',
    'polish.wipe.title': '정말 지울까요?', 'polish.wipe.body': '이 앱의 기록이 지워져요. 집은 그대로 남아요.', 'polish.wipe.do': '지우기',
    'polish.fs.title': '글자 크기', 'polish.fs.body': '편하게 보이는 쪽을 골라 주세요. 나중에 설정에서 바꿀 수 있어요.', 'polish.fs.normal': '보통', 'polish.fs.big': '크게',
    'polish.autosave': '진행은 자동으로 저장돼요.', 'polish.offline': '인터넷 없이도 놀 수 있어요. 광고만 인터넷을 써요.',
"""
if "'polish.exit'" not in v:
    v = v.replace("    'ops.back.title':", add + "    'ops.back.title':", 1)
cred = """CREDITS = ['소리: Kenney.nl — Interface Sounds · Impact Sounds · RPG Audio · Casino Audio (CC0 1.0, 상업 이용·재배포 가능)', '바람·기적 소리: 자체 제작', '그림·이야기·캐릭터: 기하학 가족 제작진(세 도형 가족)', '광고: Google AdMob · 선택 구매: Google Play 결제(성인 앱)', '글꼴: 기기 기본 글꼴 사용']
"""
if 'CREDITS' not in v:
    v = v.replace("NEWS = dict(", cred + "NEWS = dict(", 1)
    v = v.replace("supportEmail='', strings=STR,", "supportEmail='', webtoonUrl='https://blog.naver.com/gihahakf', privacyUrl='', credits=CREDITS, strings=STR,", 1)
b.write_text(v, encoding='utf-8')
print('ok')
