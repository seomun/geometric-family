"""data/ops.json 생성 — 운영·리텐션 공통 층(games/engine/ops.js)의 문자열 표·새 소식·FAQ·(이후) 이벤트 달력·미션 데이터. 모든 글은 [제안].
문자열은 전부 strings 표(GF.t 키)에 둔다(H7: 영·일 번역은 이 표만 바꾸면 됨). supportEmail 은 비워 둔다 — 작가가 이메일을 정하면 채운다(추적 문서에는 {{SUPPORT_EMAIL}} 자리표시만)."""
import json, pathlib
R = pathlib.Path(__file__).resolve().parents[1]
STR = {
    'common.close': '닫기', 'common.view': '보기', 'ops.thanks': '고마워요',
    'ops.settings.motion': '움직임 줄이기', 'ops.settings.news': '새 소식', 'ops.settings.help': '문의·FAQ',
    'ops.news.title': '새로 생긴 것',
    'ops.settings.report': '문제 알리기', 'ops.report.title': '문제 알리기', 'ops.report.note': '앱이 이상하게 멈췄을 때 기기 안에 남은 기록을 보호자가 메일로 보낼 수 있어요. 이름·계정·주소 같은 개인정보는 담기지 않고, 저절로 전송되지 않아요.', 'ops.report.count': '최근 오류 {n}건이 기기에 남아 있어요.', 'ops.report.none': '남은 오류가 없어요. 잘 돌아가고 있어요.', 'ops.report.mail': '메일로 알리기', 'ops.report.copy': '내용 복사', 'ops.report.copied': '복사했어요', 'ops.report.clear': '기록 지우기', 'ops.report.cleared': '지웠어요', 'ops.report.subject': '[{app}] 문제 알리기',
    'ops.help.title': '문의·FAQ', 'ops.help.mail': '메일 보내기', 'ops.help.subject': '[{app} {ver}] 문의', 'ops.help.nomail': '문의 메일 주소는 곧 안내할게요.',
    'ops.settings.cal': '올해의 달력', 'ops.settings.mis': '오늘의 작은 일', 'ops.settings.album': '앨범', 'ops.settings.backup': '백업 코드',
    'ops.cal.title': '올해의 달력', 'ops.cal.m': '{m}월', 'ops.cal.now': '지금', 'ops.cal.done': '다 했어요', 'ops.cal.again': '다시 열기', 'ops.cal.later': '{m}월에 열려요',
    'ops.cal.note': '해마다 돌아와요. 놓쳐도 나중에 다시 열 수 있어요.', 'ops.cal.empty': '이 앱에는 계절 이벤트가 아직 없어요.',
    'ops.mis.title': '오늘의 작은 일', 'ops.mis.note': '못 해도 괜찮아요. 내일 또 새로 나와요.', 'ops.mis.gift': '🎁 오늘의 선물 받기', 'ops.mis.gifted': '오늘의 선물을 받았어요.',
    'ops.mis.clear': '판을 {n}번 깨요', 'ops.mis.star3': '별 3개로 판을 깨요', 'ops.mis.story': '이야기를 한 번 봐요', 'ops.mis.house': '집에 소품을 하나 놓아요', 'ops.mis.daily': '오늘의 한 판을 해요',
    'ops.mis.got': '「{name}」을 받았어요', 'ops.mis.none': '이 앱의 소품을 모두 모았어요',
    'ops.album.title': '앨범', 'ops.album.items': '집 소품', 'ops.album.cards': '이야기 카드', 'ops.album.season': '계절 이벤트', 'ops.album.claim': '🎁 카드 3장 선물 받기', 'ops.album.next': '다음 선물까지 이야기 카드 {n}장',
    'ops.backup.title': '백업 코드', 'ops.backup.note': '코드나 파일을 저장해 두면 기기를 바꿔도 이어서 할 수 있어요. 코드는 이 기기 안에서만 만들어지고, 어른 기록과 아이 기록은 따로 나와요.', 'ops.backup.make': '코드 만들기', 'ops.backup.copy': '복사', 'ops.backup.copied': '복사했어요',
    'ops.backup.paste': '코드 붙여넣기', 'ops.backup.load': '불러오기', 'ops.backup.confirm': '지금 기록이 바뀌어요. 한 번 더 누르면 불러와요.', 'ops.backup.bad': '코드가 올바르지 않아요.', 'ops.backup.other': '다른 앱의 코드예요.', 'ops.backup.group': '어른 기록과 아이 기록은 따로예요. 이 앱과 같은 쪽 코드를 넣어 주세요.', 'ops.backup.file': '파일로 저장', 'ops.backup.pick': '파일에서 가져오기', 'ops.backup.summary': '{g} · 앱 {n}개 · 기록 {k}개', 'ops.backup.g.adult': '어른 기록', 'ops.backup.g.kid': '아이 기록', 'ops.backup.undo': '불러오기 전 기록으로 되돌리기', 'ops.backup.ok': '불러왔어요. 곧 다시 시작해요.',
    'ops.settings.notif': '오늘의 한 판 알림', 'ops.notif.denied': '알림 권한이 꺼져 있어요. 휴대폰 설정에서 켤 수 있어요.', 'ops.notif.on': '하루 한 번, 저녁에 알려 드릴게요.',
    'ops.iap.adfree': '광고 제거', 'ops.iap.pack': '소품 팩', 'ops.iap.owned': '구매했어요', 'ops.iap.buy': '구매', 'ops.iap.restore': '구매 복원', 'ops.iap.restoring': '구매 내역을 확인하고 있어요.',
    'ops.iap.thanks': '고마워요! 광고가 사라졌어요. 선택해서 보는 광고의 보상은 바로 받아요.', 'ops.iap.packgot': '집 소품 {n}개를 놓아 두었어요.', 'ops.iap.pending': '결제가 확인되면 적용돼요.', 'ops.iap.fail': '구매하지 못했어요. 나중에 다시 해 주세요.',
    'polish.exit': '한 번 더 누르면 나가요', 'polish.cancel': '취소', 'polish.broken': '저장을 읽지 못해 새로 시작해요. 이전 기록은 백업 코드로 되살릴 수 있어요.',
    'polish.settings.about': '앱 정보', 'polish.about.title': '앱 정보', 'polish.about.version': '버전', 'polish.about.credits': '만든 사람들·출처', 'polish.about.privacy': '개인정보',
    'polish.privacy.adult': '이 앱은 이름·이메일·위치를 수집하지 않아요. 진행 기록은 이 기기 안에만 저장돼요. 광고(Google AdMob)와 선택 구매(Google Play 결제)는 각 서비스가 정해진 정보를 처리해요. 자세한 내용은 스토어의 개인정보처리방침에서 볼 수 있어요.',
    'polish.privacy.kid': '이 앱은 이름·사진·위치를 수집하지 않아요. 홈·지도 화면 아래에 아이에게 맞춘 배너 광고가 있고, 놀이 중에는 광고가 없어요. 기록은 이 기기 안에만 저장돼요.',
    'polish.wipe.title': '정말 지울까요?', 'polish.wipe.body': '이 앱의 기록이 지워져요. 집은 그대로 남아요.', 'polish.wipe.do': '지우기',
    'polish.fs.title': '글자 크기', 'polish.fs.body': '편하게 보이는 쪽을 골라 주세요. 나중에 설정에서 바꿀 수 있어요.', 'polish.fs.normal': '보통', 'polish.fs.big': '크게',
    'polish.autosave': '진행은 자동으로 저장돼요.', 'polish.offline': '인터넷 없이도 놀 수 있어요. 광고만 인터넷을 써요.',
    'polish.pause.title': '잠깐 쉬어요', 'polish.pause.resume': '계속', 'polish.pause.again': '다시', 'polish.pause.map': '지도로',
    'polish.goal.merge': '★★★ · 조각 {n}개 남기기', 'polish.goal.spot': '★★★ · 힌트 없이, 틀린 곳 3번 이하', 'polish.goal.block': '★★★ · 조각 {n}개 이하', 'polish.goal.sort': '★★★ · {n}번 이하로 옮기기', 'polish.goal.tile': '★★★ · 되돌리기·섞기·힌트 없이',
    'polish.next': '다음 · {c}장 {title}', 'polish.next.type': ' · 새 판 종류: {type}', 'polish.next.story': '다음은 이야기가 이어져요',
    'polish.settings.assist': '쉬운 모드', 'polish.assist.note': '되돌리기·섞기를 마음껏 쓰고 별 기준이 한 칸 쉬워져요. 오늘의 한 판 같은 경쟁 판에는 적용되지 않아요.', 'polish.assist.chip': ' · 쉬운 모드',
    'ops.back.title': '오랜만이에요!', 'ops.back.got': '다시 와 줘서 반가워요. 집에 「{name}」을 놓아 두었어요.', 'ops.back.none': '다시 와 줘서 반가워요. 천천히 놀아요.',
}
STR.update({
 "ui.set.sound": "소리",
 "ui.set.volume": "소리 크기",
 "ui.set.caption": "자막",
 "ui.set.vibrate": "진동",
 "ui.set.big": "큰 글씨",
 "ui.set.bigbtn": "큰 버튼",
 "ui.set.cb": "색 구분 돕기",
 "ui.set.rest": "쉬어요 알림",
 "ui.set.off": "끔",
 "ui.set.stats": "통계",
 "ui.set.badges": "업적",
 "ui.set.attend": "출석 도장",
 "common.view": "보기",
 "ui.set.help": "도움말",
 "ui.set.rules": "판 종류 설명",
 "ui.set.replay": "이야기 다시 보기",
 "ui.set.again": "다시 보기",
 "ui.set.tips": "도움말 다시 보기",
 "ui.set.wipe": "지우기",
 "ui.set.once": "한 번 더",
 "ui.set.wipe.row": "이 앱 기록 지우기(집은 그대로)",
 "ui.set.title": "설정",
 "ui.set.parent": "보호자 메뉴",
 "ui.set.summary": "오늘까지 놀이 요약",
 "common.close": "닫기",
 "ui.set.tips.toast": "다음 판에서 도움말이 다시 나와요",
 "ui.set.replay.toast": "프롤로그와 장 이야기가 다시 나와요",
 "ui.set.note.plain": "가입·서버 없이 기록은 이 기기 안에만 저장돼요.",
 "ui.set.note.kid": "이 앱은 이름·사진·위치를 수집하지 않아요. 홈·지도 화면 아래에 아이에게 맞춘(비개인화) 배너 광고가 있어요. 놀이 중과 이 메뉴에는 광고가 없어요. 기록은 이 기기 안에만 저장돼요.",
 "ui.set.note.ads": "배너·전면 광고와 선택해서 보는 광고가 있어요. 광고를 보지 않아도 불이익은 없어요. 기록은 이 기기 안에만 저장돼요.",
 "ui.ads.watch": "광고 보기",
 "ui.ads.ask.body": "광고를 끝까지 보면 받아요. 안 봐도 괜찮아요.",
 "ui.ads.free": "광고를 불러오지 못해 그냥 드렸어요",
 "ui.ads.no": "괜찮아요",
 "ui.ads.prefix": "광고 보고 ",
 "ui.ads.more": "더 받기",
 "ui.ads.got": "받았어요",
 "ui.tale.skip": "건너뛰기",
 "ui.tale.ok": "알겠어요",
 "ui.tale.next": "계속하기",
 "ui.tale.final.title": "당신은 어느 도형인가요?",
 "ui.saga.story": "이야기",
 "ui.saga.chest": "상자",
 "ui.saga.open": "열기",
 "ui.saga.locked": "앞 레벨을 먼저 깨 보세요"
})   # H7: 엔진 층 고정 문구(tools/_i18n_move.py 가 옮김)
CREDITS = ['소리: Kenney.nl — Interface Sounds · Impact Sounds · RPG Audio · Casino Audio (CC0 1.0, 상업 이용·재배포 가능)', '바람·기적 소리: 자체 제작', '그림·이야기·캐릭터: 기하학 가족 제작진(세 도형 가족)', '광고: Google AdMob · 선택 구매: Google Play 결제(성인 앱)', '글꼴: 기기 기본 글꼴 사용']
NEWS = dict(version='1.0.0-rc11', items=[dict(ver='1.0.0-rc11', title='방마다 어울리는 가구', lines=['욕실에는 씻는 물건, 아이 방에는 장난감처럼 방마다 어울리는 가구만 놓여요.']), dict(ver='1.0.0-rc10', title='우리 집이 새로워졌어요', lines=['방이 커지고 집 레벨·아늑함이 생겼어요.', '할 일 3개와 다음 목표가 어느 게임에서 얻는지 알려 줘요.', '손님이 놀러 오고 계절 소품이 찾아와요.']), dict(ver='1.0.0-rc9', title='이야기로 배우는 게임', lines=['처음 이야기 컷 속 가족이 직접 게임 하는 법을 보여 줘요.', '새 판 종류가 나올 때마다 짧은 이야기 컷이 먼저 나와요.']), dict(ver='1.0.0-rc8', title='이야기 카드와 도장책', lines=['여러 앱에서 이야기 카드를 모아 한 편을 완성하면 집에 작은 소품이 놓여요.', '도장책·카메오 도감·이번 주 주제가 생겼어요.', '판 중 ‹ 를 누르면 일시정지 메뉴, 설정에 쉬운 모드·앱 정보가 생겼어요.', '막둥이의 하루가 100판으로 늘었어요.']), dict(ver='1.0.0-rc7', title='이야기와 지도', lines=[
    '판 사이에 이야기가 이어져요. 처음 나오는 판 종류는 짧게 알려 드려요.', '이야기 지도에서 내가 어디까지 왔는지 한눈에 볼 수 있어요.',
    '설정에 「움직임 줄이기」·「문의·FAQ」·「백업 코드」·「올해의 달력」·「오늘의 작은 일」·「앨범」이 생겼어요.', '오랜만에 오시면 작은 선물을 놓아 둘게요.', '설정에서 하루 한 번 「오늘의 한 판」 알림을 켤 수 있어요(기본은 꺼짐).'])])
FAQ = [
    dict(q='진행 기록은 어디에 저장되나요?', a='이 기기 안에만 저장돼요. 앱을 지우면 기록도 지워지니, 바꾸기 전에는 설정의 백업 기능을 써 주세요.'),
    dict(q='집은 다른 앱과 이어지나요?', a='같은 회사의 형제 앱이 같은 기기에 있으면 같은 집을 함께 꾸며요. 아이 앱끼리, 어른 앱끼리만 이어져요.'),
    dict(q='소리나 큰 글씨는 어디서 바꾸나요?', a='위쪽 ⚙ 설정에서 소리·진동·큰 글씨·움직임 줄이기를 바꿀 수 있어요.'),
    dict(q='광고는 어떻게 나오나요?', a='홈과 이야기 지도 아래에 작은 배너가 있고, 판 사이에 가끔 짧은 광고가 나와요. 선택해서 보는 광고는 안 봐도 괜찮아요.'),
    dict(q='이야기를 다시 보고 싶어요.', a='설정의 「이야기 다시 보기」로 처음부터 다시 볼 수 있어요. 지도의 책 모양을 눌러도 그 장을 볼 수 있어요.'),
    dict(q='진행을 처음부터 다시 하고 싶어요.', a='설정 맨 아래 「이 앱 기록 지우기」를 두 번 누르면 지워져요. 집은 그대로 남아요.'),
]

# ---- IP 층(games/22_IP_SYNERGY.md): 이야기 카드 배분표 · 도장 규칙 · 앱 목록 ----
TALES = {'pigs': ('아기돼지 삼형제', '🐷'), 'bears': ('세 마리 곰', '🐻'), 'shoes': ('구두장이와 요정', '👞'), 'kongjwi': ('콩쥐팥쥐', '👡'), 'heungbu': ('흥부와 놀부', '🎃'), 'bremen': ('브레멘 음악대', '🎺'),
         'hok': ('혹부리 영감', '🍄'), 'axe': ('금도끼 은도끼', '🪓'), 'sun': ('해님 달님', '🌙'), 'ant': ('개미와 베짱이', '🐜'), 'pino': ('피노키오', '🪆'), 'jack': ('잭과 콩나무', '🌱'), 'gyeonwoo': ('견우와 직녀', '⭐'),
         'ureng': ('우렁 각시', '🐚'), 'hare': ('토끼와 거북이', '🐇'), 'brothers': ('의좋은 형제', '🌾'), 'snowqueen': ('눈의 여왕', '❄️'),
         'fairywood': ('선녀와 나무꾼', '👘'), 'rabbitliver': ('토끼전', '🦪'), 'magpie': ('은혜 갚은 까치', '🪺'), 'tigerpersimmon': ('호랑이와 곶감', '🍡'), 'redhood': ('빨간 모자(순한 판)', '🧢'), 'hansel': ('헨젤과 그레텔(순한 판)', '🍪'), 'puss': ('장화 신은 고양이', '👢')}
APPS_G = {'adult': ['idle', 'merge', 'quiz', 'spot', 'block', 'sort', 'tile'], 'kid': ['play', 'color', 'day']}
APP_NAMES = {'play': '막둥이 놀이터', 'color': '색칠북', 'day': '막둥이의 하루', 'idle': '세 가족 식탁', 'merge': '도형 합치기', 'quiz': '당신은 어느 도형?', 'spot': '다른 그림 찾기', 'block': '도형 블록', 'sort': '정리의 달인', 'tile': '짝 맞추기'}
PLAY_TALE = {11: 'brothers', 12: 'ant', 13: 'axe', 14: 'snowqueen', 15: 'kongjwi'}   # ① 놀이터 3권 11~15장
def tales_of(app):
    if app == 'play': return list(PLAY_TALE.values())
    try: d = json.load(open(R / 'data' / f'story_{app}.json', encoding='utf-8'))
    except Exception: return []
    return [c['tale'] for c in d['chapters'].values()]
def card_map():
    out = {}
    for g, apps in (('adult', ['merge', 'spot', 'block', 'sort', 'tile']), ('kid', ['play', 'day'])):
        have = {a: set(tales_of(a)) for a in apps}; out[g] = {}
        for k, t in enumerate(TALES):
            prov = [a for a in apps if t in have[a]]
            if not prov: continue
            prov = prov[k % len(prov):] + prov[:k % len(prov)]           # 이야기마다 시작 앱을 돌려 한 앱에 몰리지 않게
            out[g][t] = [prov[i % len(prov)] for i in range(4)]
        for t, cards in out[g].items():                                  # 단언: 각 그룹 안의 앱만으로 네 장이 모두 얻어진다(S3)
            assert len(cards) == 4 and all(c in apps and t in have[c] for c in cards), (g, t, cards)
    return out
def stamp_rules():
    lv = {'merge': 120, 'spot': 140, 'block': 120, 'sort': 120, 'tile': 120}
    r = {a: [dict(id='first', at=1), dict(id='a', at=30), dict(id='b', at=60), dict(id='end', at=n), dict(id='story', at=None)] for a, n in lv.items()}
    r['idle'] = [dict(id='first', at=1), dict(id='a', at=10), dict(id='b', at=20), dict(id='end', at=30), dict(id='story', at=None)]
    r['quiz'] = [dict(id='first', at=1), dict(id='a', at=5), dict(id='b', at=10), dict(id='end', at=19), dict(id='story', at=None)]
    r['color'] = [dict(id='first', at=1), dict(id='a', at=10), dict(id='b', at=50), dict(id='end', at=100), dict(id='story', at=None)]
    r['day'] = [dict(id='first', at=1), dict(id='a', at=15), dict(id='b', at=30), dict(id='end', at=60), dict(id='story', at=None)]
    r['play'] = [dict(id='first', at=1), dict(id='a', at=20), dict(id='b', at=40), dict(id='end', at=60), dict(id='story', at=None)]
    return r

# ---- 카메오(5): 다른 앱 배역이 판 사이(장 끝 컷 직후)에 잠깐 등장. 문구는 짧고 따뜻하게·세 가족 말투(네모 평이/세모 들뜸/동그라미 차분), 광고성 말 금지. [제안] ----
GUEST = {  # 손님 = 그 손님이 「일하는」 앱 · docs/24_CAMEO_LINES_v2.md(허브 v2). 대사 30개 모두 다름(단언: tools/ip_smoke.js), 광고성 말 없음
    'merge': ('husband.joy', '🧳', ['이삿짐이 한가득! …근데 반은 아내 캐리어야.', '이사는 한 방에 끝낸다. 허리는 내일 생각하고.', '상자에 「깨짐 주의」라고 썼어. 내 마음 말고 접시.', '짐 줄이자더니, 또 여행 가방이 늘었네.', '다 옮겼다! 이제 짜장면 시킬 시간.']),
    'spot': ('dong_dad.calm', '🖼️', ['액자가 1도 기울었어요. 바로잡는 중입니다.', '다른 곳을 찾았어요. 일곱 개 중 하나.', '사진 속 의자 하나가 비어 있네요. …괜찮습니다.', '틀린 그림은 금방 찾는데, 다른 건 잘 안 보이더군요.', '정답 일곱 개. 오늘도 정확합니다.']),
    'block': ('nemo_dad.good', '🧱', ['한 줄 맞췄다! 학원비도 이렇게 딱 맞으면 좋겠네.', '벽돌 한 장에 한숨 한 번. 그래도 집은 올라간다.', '줄은 지워지는데 할 일은 안 지워지네.', '튼튼하게 쌓는 중. 일곱 식구가 들어가야 하거든.', '두 줄 한꺼번에! 오늘은 운이 좋다.']),
    'sort': ('nemo_mom.good', '🗄️', ['선반 정리 끝! 내일이면 또 섞이겠지만요.', '양말 짝 찾는 데 삼십 분. 그래도 다 찾았어요.', '같은 것끼리 모아요. 아이들은 따로따로.', '냉장고 반찬통, 뚜껑까지 다 맞췄어요!', '「제자리에 놓으면 끝」… 오늘만 일곱 번 말했어요.']),
    'tile': ('nemo_kids.kid1', '🧺', ['세 개 모으기는 자신 있어요. 동생이 셋이거든요.', '바구니 칸이 모자라요. 우리 집 식탁처럼.', '짝을 맞췄어요! 엄마한테 자랑해야지.', '같은 그림 세 개! 막둥이도 같이 할래?', '마지막 한 칸에서 딱! 숨 참았어요.']),
    'idle': ('nemo_grandma.good', '🍲', ['국 끓여 놨다. 다 같이 먹어야 맛있지.', '밥은 먹고 다니냐. 한 숟갈만 더 떠라.', '반찬은 많을수록 좋아. 남으면 내일 먹고.', '식구가 많으니 솥도 커야지.', '오늘은 세 집이 다 모인다더라. 밥 넉넉히 해야지.']),
    'quiz': ('wife.smug', '🔮', ['오늘 결과는 세모래요. 역시 나다워!', '테스트 열 번 했는데 다 다르게 나와요. 그게 나예요.', '남편은 네모 나왔대요. 절대 아닌데…', '어느 도형이냐고요? 기분 따라 달라져요!', '다음엔 동그라미 나오게 해 볼래요. 우아하게.']),
}
KID_GUEST = [('dong_dad.joy', '🚂', 'play'), ('nemo_kids.kid2', '🖍️', 'color'), ('wife.joy', '🎈', 'play')]   # 유아 ⑩ 손님: 동그라미 아저씨·두리 누나·세모 이모(막둥이는 자기 앱에 손님으로 나오지 않는다)
def cameos():
    out = []; ORDER = ['merge', 'spot', 'block', 'sort', 'tile']; GORD = ['merge', 'spot', 'block', 'sort', 'tile', 'idle', 'quiz']
    for hi, h in enumerate(ORDER):
        guests = [g for g in GORD if g != h]; guests = guests[hi % len(guests):] + guests[:hi % len(guests)]            # 호스트마다 시작 손님을 돌려 순서가 다르게
        for j, n in enumerate([2, 4, 6, 8, 10, 12]):
            f = guests[j]; ch, prop, lines = GUEST[f]
            hosts_of_f = [x for x in ORDER if x != f]                                                                    # 그 손님이 나오는 앱 순서(자기 앱 제외)
            k = hosts_of_f.index(h)                                                                                       # 그 순서에서 내 앱이 몇 번째인가 → 그 번호의 대사
            out.append(dict(id=f'{h}:e{n}', host=h, after=f'e{n}', who=ch, prop=prop, frm=f, line=lines[k], kid=False))
    for j, n in enumerate([2, 4, 6, 8, 10, 12]):
        ch, prop, frm = KID_GUEST[j % 3]; out.append(dict(id=f'day:e{n}', host='day', after=f'e{n}', who=ch, prop=prop, frm=frm, line='', kid=True))
    return out
# ---- 주간 주제(4): 모든 앱이 같은 주에 같은 주제(웹툰 연결 자리 webtoon). 번들 기본표 — 나중에 원격 설정(T1)이 덮어씀 ----
def week_themes():
    W = []
    base = [(1, 2, 'seol', '설날 한 주', '🎍'), (3, 5, 'spring', '봄맞이 한 주', '🌸'), (6, 9, 'spring2', '새 학기 한 주', '🎒'), (10, 13, 'flower', '꽃구경 한 주', '🌷'), (14, 17, 'family', '가족 나들이 한 주', '🧺'), (18, 19, 'child', '어린이날 한 주', '🎈'),
            (20, 25, 'rain', '비 오는 날 한 주', '☔'), (26, 33, 'summer', '여름 물놀이 한 주', '🏖️'), (34, 35, 'vacation', '방학 끝 한 주', '📚'), (36, 39, 'chuseok', '송편 한 주', '🥮'), (40, 43, 'autumn', '단풍 한 주', '🍁'),
            (44, 46, 'harvest', '곡식 거두는 한 주', '🌾'), (47, 48, 'kimjang', '김장 한 주', '🥬'), (49, 51, 'winter', '눈 오는 한 주', '⛄'), (52, 53, 'year', '한 해 마무리 한 주', '🎄')]
    for a, z, i, t, e in base:
        for w in range(a, z + 1): W.append(dict(w=w, id=i, title=t, icon=e, webtoon=''))
    return W
STR.update({'ops.cam.title': '카메오 도감', 'ops.cam.card': '지나가던 가족', 'ops.cam.seen': '{n}/{total}명을 만났어요', 'ops.cam.gift': '🎁 카메오 선물 받기', 'ops.cam.from': '{app}에서 왔어요', 'ops.week.now': '이번 주: {title}', 'ops.week.rec': ' · 지금 해 볼 것: {name}', 'ops.me.title': '내 도형 · {name}', 'ops.settings.cameo': '카메오 도감',
            'ops.pass.title': '기하학 가족 도장책', 'ops.pass.more': '다른 기하학 가족 게임', 'ops.pass.open': '열기', 'ops.pass.store': '스토어에서 보기', 'ops.pass.note': '같은 기기에 함께 있으면 집과 이야기 카드가 이어져요. 하지 않아도 괜찮아요.',
            'ops.settings.passport': '도장책', 'ops.settings.kidbook': '도장판', 'ops.settings.cards': '이야기 카드', 'ops.settings.family': '가족 코드', 'ops.album.cardnote': '카드는 여러 앱에서 한 장씩 모여요. 네 장이 모이면 집에 작은 소품이 놓여요.',
            'ops.fam.title': '가족 코드', 'ops.fam.note': '아이 앱과 어른 앱은 따로 모아요. 코드를 넣으면 이야기 카드·도장·카메오가 서로 합쳐져요. 꼭 하지 않아도 돼요.', 'ops.fam.make': '코드 만들기', 'ops.fam.paste': '코드 붙여넣기', 'ops.fam.apply': '합치기', 'ops.fam.ok': '합쳤어요!', 'ops.fam.bad': '코드가 올바르지 않아요.',
            'ops.ip.share': '공유 카드 저장', 'ops.ip.shared': '사진첩에 저장했어요.', 'ops.ip.sharefail': '저장하지 못했어요.', 'ops.settings.webtoon': '웹툰 보기', 'ops.ip.card': '「{title}」 카드를 얻었어요 ({n}/4)', 'ops.ip.stamp': '도장: {name}', 'ops.ip.stamp.first': '첫 걸음', 'ops.ip.stamp.a': '쑥쑥 자라요', 'ops.ip.stamp.b': '반 넘었어요', 'ops.ip.stamp.end': '끝까지', 'ops.ip.stamp.story': '이야기 한 편',
            'ops.ip.plate': '문패 장식 「{name}」을 얻었어요', 'ops.ip.plate.ribbon': '리본', 'ops.ip.plate.sparkle': '반짝이', 'ops.ip.plate.crown': '왕관', 'ops.ip.story': '이야기를 완성했어요! 「{name}」을 집에 놓아 두었어요.'})
SHAPE_WHO = {'nemo': [['nemo_dad.joy'], ['nemo_mom.joy'], ['baby.joy']], 'semo': [['husband.joy'], ['wife.joy'], ['husband.love', 'wife.love']], 'dong': [['dong_dad.joy'], [], []]}      # 결과형 이름의 인물(그림이 없는 형은 빈 목록 → 카드는 도형 얼굴). 카드 이름과 그림 인물이 어긋나지 않게(D8)
_EN = json.load(open('data/i18n/en.json', encoding='utf-8'))['strings'] if (R / 'data/i18n/en.json').exists() else {}   # 영어 틀(C15): 키는 STR 과 같아야 한다
assert set(_EN) <= set(STR), ('영어 사전에 없는 한국어 키', sorted(set(_EN) - set(STR))[:5])
import os as _os
if _os.path.exists('tools/i18n_c16.json'): STR.update(json.load(open('tools/i18n_c16.json', encoding='utf-8')))   # 다국어 추출 1단계(C16): tools/i18n_extract.py 산출
STR_EN = {k: _EN.get(k, '') for k in STR}
D = dict(version=1, note='[제안] 운영 공통 층 데이터. tools/ops_build.py 로 생성.', supportEmail='', webtoonUrl='https://blog.naver.com/gihahakf', privacyUrl='', credits=CREDITS, strings=STR, strings_en=STR_EN, shapeWho=SHAPE_WHO, news=NEWS, faq=FAQ, tales={k: dict(title=v[0], icon=v[1]) for k, v in TALES.items()}, apps=APPS_G, appNames=APP_NAMES, cardMap=card_map(), stamps=stamp_rules(), playTale={str(k): v for k, v in PLAY_TALE.items()}, cameos=cameos(), weekThemes=week_themes())
if __name__ == '__main__':
    p = R / 'data' / 'ops.json'; old = json.load(open(p, encoding='utf-8')) if p.exists() else {}
    for k in ('events', 'missions', 'album'):
        if k in old: D[k] = old[k]                # 뒤에 추가되는 항목은 보존
    json.dump(D, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('ops.json', len(STR), 'strings')
