"""data/ops.json 생성 — 운영·리텐션 공통 층(games/engine/ops.js)의 문자열 표·새 소식·FAQ·(이후) 이벤트 달력·미션 데이터. 모든 글은 [제안].
문자열은 전부 strings 표(GF.t 키)에 둔다(H7: 영·일 번역은 이 표만 바꾸면 됨). supportEmail 은 비워 둔다 — 작가가 이메일을 정하면 채운다(추적 문서에는 {{SUPPORT_EMAIL}} 자리표시만)."""
import json, pathlib
R = pathlib.Path(__file__).resolve().parents[1]
STR = {
    'common.close': '닫기', 'common.view': '보기', 'ops.thanks': '고마워요',
    'ops.settings.motion': '움직임 줄이기', 'ops.settings.news': '새 소식', 'ops.settings.help': '문의·FAQ',
    'ops.news.title': '새로 생긴 것',
    'ops.help.title': '문의·FAQ', 'ops.help.mail': '메일 보내기', 'ops.help.subject': '[{app} {ver}] 문의', 'ops.help.nomail': '문의 메일 주소는 곧 안내할게요.',
    'ops.back.title': '오랜만이에요!', 'ops.back.got': '다시 와 줘서 반가워요. 집에 「{name}」을 놓아 두었어요.', 'ops.back.none': '다시 와 줘서 반가워요. 천천히 놀아요.',
}
NEWS = dict(version='1.0.0-rc7', items=[dict(ver='1.0.0-rc7', title='이야기와 지도', lines=[
    '판 사이에 이야기가 이어져요. 처음 나오는 판 종류는 짧게 알려 드려요.', '이야기 지도에서 내가 어디까지 왔는지 한눈에 볼 수 있어요.',
    '설정에 「움직임 줄이기」와 「문의·FAQ」가 생겼어요.', '오랜만에 오시면 작은 선물을 놓아 둘게요.'])])
FAQ = [
    dict(q='진행 기록은 어디에 저장되나요?', a='이 기기 안에만 저장돼요. 앱을 지우면 기록도 지워지니, 바꾸기 전에는 설정의 백업 기능을 써 주세요.'),
    dict(q='집은 다른 앱과 이어지나요?', a='같은 회사의 형제 앱이 같은 기기에 있으면 같은 집을 함께 꾸며요. 아이 앱끼리, 어른 앱끼리만 이어져요.'),
    dict(q='소리나 큰 글씨는 어디서 바꾸나요?', a='위쪽 ⚙ 설정에서 소리·진동·큰 글씨·움직임 줄이기를 바꿀 수 있어요.'),
    dict(q='광고는 어떻게 나오나요?', a='홈과 이야기 지도 아래에 작은 배너가 있고, 판 사이에 가끔 짧은 광고가 나와요. 선택해서 보는 광고는 안 봐도 괜찮아요.'),
    dict(q='이야기를 다시 보고 싶어요.', a='설정의 「이야기 다시 보기」로 처음부터 다시 볼 수 있어요. 지도의 책 모양을 눌러도 그 장을 볼 수 있어요.'),
    dict(q='진행을 처음부터 다시 하고 싶어요.', a='설정 맨 아래 「이 앱 기록 지우기」를 두 번 누르면 지워져요. 집은 그대로 남아요.'),
]
D = dict(version=1, note='[제안] 운영 공통 층 데이터. tools/ops_build.py 로 생성.', supportEmail='', strings=STR, news=NEWS, faq=FAQ)
if __name__ == '__main__':
    p = R / 'data' / 'ops.json'; old = json.load(open(p, encoding='utf-8')) if p.exists() else {}
    for k in ('events', 'missions', 'album'):
        if k in old: D[k] = old[k]                # 뒤에 추가되는 항목은 보존
    json.dump(D, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('ops.json', len(STR), 'strings')
