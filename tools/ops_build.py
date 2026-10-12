"""data/ops.json 생성 — 운영·리텐션 공통 층(games/engine/ops.js)의 문자열 표·새 소식·FAQ·(이후) 이벤트 달력·미션 데이터. 모든 글은 [제안].
문자열은 전부 strings 표(GF.t 키)에 둔다(H7: 영·일 번역은 이 표만 바꾸면 됨). supportEmail 은 비워 둔다 — 작가가 이메일을 정하면 채운다(추적 문서에는 {{SUPPORT_EMAIL}} 자리표시만)."""
import json, pathlib
R = pathlib.Path(__file__).resolve().parents[1]
STR = {
    'common.close': '닫기', 'common.view': '보기', 'ops.thanks': '고마워요',
    'ops.settings.motion': '움직임 줄이기', 'ops.settings.news': '새 소식', 'ops.settings.help': '문의·FAQ',
    'ops.news.title': '새로 생긴 것',
    'ops.help.title': '문의·FAQ', 'ops.help.mail': '메일 보내기', 'ops.help.subject': '[{app} {ver}] 문의', 'ops.help.nomail': '문의 메일 주소는 곧 안내할게요.',
    'ops.settings.cal': '올해의 달력', 'ops.settings.mis': '오늘의 작은 일', 'ops.settings.album': '앨범', 'ops.settings.backup': '백업 코드',
    'ops.cal.title': '올해의 달력', 'ops.cal.m': '{m}월', 'ops.cal.now': '지금', 'ops.cal.done': '다 했어요', 'ops.cal.again': '다시 열기', 'ops.cal.later': '{m}월에 열려요',
    'ops.cal.note': '해마다 돌아와요. 놓쳐도 나중에 다시 열 수 있어요.', 'ops.cal.empty': '이 앱에는 계절 이벤트가 아직 없어요.',
    'ops.mis.title': '오늘의 작은 일', 'ops.mis.note': '못 해도 괜찮아요. 내일 또 새로 나와요.', 'ops.mis.gift': '🎁 오늘의 선물 받기', 'ops.mis.gifted': '오늘의 선물을 받았어요.',
    'ops.mis.clear': '판을 {n}번 깨요', 'ops.mis.star3': '별 3개로 판을 깨요', 'ops.mis.story': '이야기를 한 번 봐요', 'ops.mis.house': '집에 소품을 하나 놓아요', 'ops.mis.daily': '오늘의 한 판을 해요',
    'ops.mis.got': '「{name}」을 받았어요', 'ops.mis.none': '이 앱의 소품을 모두 모았어요',
    'ops.album.title': '앨범', 'ops.album.items': '집 소품', 'ops.album.cards': '이야기 카드', 'ops.album.season': '계절 이벤트', 'ops.album.claim': '🎁 카드 3장 선물 받기', 'ops.album.next': '다음 선물까지 이야기 카드 {n}장',
    'ops.backup.title': '백업 코드', 'ops.backup.note': '코드를 적어 두면 기기를 바꿔도 이어서 할 수 있어요. 코드는 이 기기 안에서만 만들어져요.', 'ops.backup.make': '코드 만들기', 'ops.backup.copy': '복사', 'ops.backup.copied': '복사했어요',
    'ops.backup.paste': '코드 붙여넣기', 'ops.backup.load': '불러오기', 'ops.backup.confirm': '지금 기록이 바뀌어요. 한 번 더 누르면 불러와요.', 'ops.backup.bad': '코드가 올바르지 않아요.', 'ops.backup.other': '다른 앱의 코드예요.', 'ops.backup.ok': '불러왔어요. 곧 다시 시작해요.',
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
NEWS = dict(version='1.0.0-rc7', items=[dict(ver='1.0.0-rc7', title='이야기와 지도', lines=[
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
D = dict(version=1, note='[제안] 운영 공통 층 데이터. tools/ops_build.py 로 생성.', supportEmail='', webtoonUrl='https://blog.naver.com/gihahakf', privacyUrl='', credits=CREDITS, strings=STR, news=NEWS, faq=FAQ)
if __name__ == '__main__':
    p = R / 'data' / 'ops.json'; old = json.load(open(p, encoding='utf-8')) if p.exists() else {}
    for k in ('events', 'missions', 'album'):
        if k in old: D[k] = old[k]                # 뒤에 추가되는 항목은 보존
    json.dump(D, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('ops.json', len(STR), 'strings')
