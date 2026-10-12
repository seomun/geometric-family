"""H7(허브 D21): 엔진 층의 고정 문구를 data/ops.json 문자열 표(GF.t 키)로 옮긴다. 영·일 번역은 나중 — 표만 바꾸면 되는 구조까지만.
정확히 같은 따옴표 리터럴만 바꾼다(템플릿·연결 문자열 속은 건드리지 않음). 멱등."""
import pathlib, re, json
G = pathlib.Path('games/engine')
M = {
 'extras.js': [('소리', 'set.sound'), ('소리 크기', 'set.volume'), ('자막', 'set.caption'), ('진동', 'set.vibrate'), ('큰 글씨', 'set.big'), ('쉬어요 알림', 'set.rest'), ('끔', 'set.off'), ('통계', 'set.stats'),
               ('업적', 'set.badges'), ('출석 도장', 'set.attend'), ('보기', 'common.view'), ('도움말', 'set.help'), ('판 종류 설명', 'set.rules'), ('이야기 다시 보기', 'set.replay'), ('다시 보기', 'set.again'),
               ('도움말 다시 보기', 'set.tips'), ('지우기', 'set.wipe'), ('한 번 더', 'set.once'), ('이 앱 기록 지우기(집은 그대로)', 'set.wipe.row'), ('설정', 'set.title'), ('보호자 메뉴', 'set.parent'),
               ('오늘까지 놀이 요약', 'set.summary'), ('닫기', 'common.close'), ('다음 판에서 도움말이 다시 나와요', 'set.tips.toast'), ('프롤로그와 장 이야기가 다시 나와요', 'set.replay.toast'),
               ('가입·서버 없이 기록은 이 기기 안에만 저장돼요.', 'set.note.plain'),
               ('이 앱은 이름·사진·위치를 수집하지 않아요. 홈·지도 화면 아래에 아이에게 맞춘(비개인화) 배너 광고가 있어요. 놀이 중과 이 메뉴에는 광고가 없어요. 기록은 이 기기 안에만 저장돼요.', 'set.note.kid'),
               ('배너·전면 광고와 선택해서 보는 광고가 있어요. 광고를 보지 않아도 불이익은 없어요. 기록은 이 기기 안에만 저장돼요.', 'set.note.ads')],
 'ads.js': [('광고 보기', 'ads.watch'), ('광고를 끝까지 보면 받아요. 안 봐도 괜찮아요.', 'ads.ask.body'), ('광고를 불러오지 못해 그냥 드렸어요', 'ads.free'), ('괜찮아요', 'ads.no'), ('닫기', 'common.close'),
            ('광고 보고 ', 'ads.prefix'), ('더 받기', 'ads.more'), ('받았어요', 'ads.got')],
 'tale.js': [('건너뛰기', 'tale.skip'), ('알겠어요', 'tale.ok'), ('계속하기', 'tale.next'), ('당신은 어느 도형인가요?', 'tale.final.title'), ('판 종류 설명', 'set.rules')],
 'saga.js': [('이야기', 'saga.story'), ('상자', 'saga.chest'), ('열기', 'saga.open'), ('앞 레벨을 먼저 깨 보세요', 'saga.locked')],
}
new = {}
for f, items in M.items():
    p = G / f; s = p.read_text(encoding='utf-8'); n = 0
    for lit, key in items:
        k = 'ui.' + key if not key.startswith(('common.', 'ops.')) else key
        pat = "'" + lit + "'"
        c = s.count(pat)
        if c: s = s.replace(pat, "GF.t('" + k + "')"); n += c; new[k] = lit
    p.write_text(s, encoding='utf-8'); print(f, n, 'replaced')
b = pathlib.Path('tools/ops_build.py'); t = b.read_text(encoding='utf-8')
extra = "STR.update(" + json.dumps(new, ensure_ascii=False, indent=1) + ")   # H7: 엔진 층 고정 문구(tools/_i18n_move.py 가 옮김)\n"
if "# H7: 엔진 층 고정 문구" in t:
    t = re.sub(r"STR\.update\(\{.*?\}\)   # H7: 엔진 층 고정 문구[^\n]*\n", lambda m: extra, t, flags=re.S)
else:
    t = t.replace("NEWS = dict(", extra + "NEWS = dict(", 1)
b.write_text(t, encoding='utf-8'); print('keys', len(new))
