"""D11: ② 세 가족 식탁 사연 40 → 50(s41~s50). 소재 뱅크 v2·v3(content/episodes/BANK_v2.md·BANK_v3_2026-10.md)의 상황만 빌려 각색 [제안] — 문장을 가져오지 않고, 원고(작가 원문)는 손대지 않는다.
행복·따뜻함이 먼저, 걱정은 뒤. 4컷 + 질문 하나(세 가족 선택지) + 웃음 보상 40. 멱등. 이후 tools/map_build.py(길 5구역)·tools/ops_build.py."""
import json, pathlib
R = pathlib.Path('.')
p = R / 'data/idle_stories.json'; d = json.load(open(p, encoding='utf-8')); have = {s['id'] for s in d['stories']}


def C(text, *chars, bubble=None):
    c = dict(text=text, src='각색 [제안]', chars=list(chars))
    if bubble: c['bubble'] = bubble
    return c


def S(i, title, bank, n, cuts, q, a, b, c):
    src = ('content/episodes/BANK_v2.md #%d' if bank == 'v2' else 'content/episodes/BANK_v3_2026-10.md #%d') % n
    return dict(id='s%d' % i, title=title, source=src + ' (허브 초안, 전부 각색)', bg='indoor', cuts=cuts,
                question=dict(q=q, options=[dict(k='nemo', t=a), dict(k='semo', t=b), dict(k='dong', t=c)]), reward=dict(laugh=40))


NEW = [
    S(41, '택배 상자', 'v2', 27, [
        C('현관에 택배 상자가 가득 도착했다. 포장을 뜯고 나니 큰 상자가 일곱 개 남았다.', 'nemo_mom.joy', 'nemo_kids.kid2'),
        C('네모네 아이들은 상자로 성을 쌓았다. 막둥이가 제일 높은 탑 위에 올라앉았다.', 'nemo_kids.kid1', 'baby.joy', bubble='sparkle'),
        C('세모 부부는 서로 \"이거 누가 샀어?\" 하다가 같이 상자 안에 들어가 보았다.', 'husband.joy', 'wife.joy'),
        C('동그라미는 상자를 접어 분리수거 날짜에 맞춰 내놓았다. 한 개는 남겨서 고양이 집으로.', 'dong_dad.warm', bubble='heart')],
      '큰 택배 상자가 오면?', '아이들 성이 된다', '들어가서 놀아 본다', '접어서 재활용(하나는 집으로)'),
    S(42, '아이가 집을 나간다', 'v2', 33, [
        C('큰딸이 자취를 시작하는 날. 네모네 현관에 반찬통 열 개가 줄을 섰다.', 'nemo_mom.joy', 'nemo_kids.kid1'),
        C('네모는 짐을 차에 실으며 \"밥은 꼭 챙겨 먹어\"만 세 번째 말했다.', 'nemo_dad.worry', 'nemo_kids.kid1'),
        C('세모 부부는 조카의 자취방에 놓을 화분과 전기장판을 고르다 둘이 손을 잡고 웃었다.', 'husband.joy', 'wife.love'),
        C('동그라미는 문 앞에서 열쇠 하나를 건넸다. \"언제든 와도 되는 집이야.\"', 'dong_dad.warm', 'nemo_kids.kid1', bubble='heart')],
      '자식이 집을 떠나는 날 나는?', '반찬부터 한가득 싼다', '화분이나 선물을 챙긴다', '열쇠를 건넨다'),
    S(43, '첫눈', 'v2', 43, [
        C('아침에 창밖을 보니 첫눈이 소복소복 내렸다. 막둥이가 제일 먼저 소리를 질렀다.', 'baby.joy', 'nemo_kids.kid3'),
        C('네모네 아이들은 눈사람을 넷 만들었다. 제일 작은 눈사람에 막둥이 모자를 씌웠다.', 'nemo_kids.kid1', 'nemo_kids.kid2', 'nemo_kids.kid3', 'baby.joy'),
        C('세모 부부는 \"첫눈 오면 만나자\"던 약속을 떠올리고 창가에 나란히 앉았다.', 'husband.joy', 'wife.love', bubble='heart'),
        C('동그라미는 눈 오는 소리를 한참 들었다. 오랜만에 휴대폰 알림을 껐다.', 'dong_dad.calm', bubble='sparkle')],
      '첫눈이 오면 가장 먼저?', '아이들과 눈사람 만들기', '그 사람과 나란히 창가에', '알림 끄고 눈 소리 듣기'),
    S(44, '새해 계획', 'v2', 42, [
        C('새해 첫날 식탁에 계획표가 펼쳐졌다. \"올해는 운동!\"이 벌써 7년째다.', 'nemo_dad.joy', 'nemo_mom.joy'),
        C('세모 부부는 각자 계획을 쓰다가 \"여행\" 한 단어가 겹쳐서 크게 웃었다.', 'husband.joy', 'wife.joy', bubble='sparkle'),
        C('동그라미는 12개월 칸을 다 채웠다. 마지막 칸에만 \"그냥 쉬기\"라고 적었다.', 'dong_dad.warm'),
        C('올해도 계획표는 냉장고에 붙었다. 그래도 일곱 식구가 같이 보는 첫 줄은 같았다. \"같이 웃기.\"', 'nemo_mom.joy', 'nemo_dad.love', 'baby.joy', bubble='heart')],
      '새해 계획의 첫 줄은?', '운동 (올해는 진짜)', '여행 (일단 떠나기)', '그냥 쉬기 한 칸'),
    S(45, '송년회 세 개', 'v2', 41, [
        C('연말이 되자 송년회 초대가 세 개나 왔다. 달력이 빽빽해졌다.', 'nemo_dad.good'),
        C('네모는 세 개 중 한 곳만 가기로 하고 나머지 둘에는 선물 대신 안부를 보냈다.', 'nemo_dad.joy', 'nemo_mom.good'),
        C('세모는 열두 개를 다 간다고 큰소리쳤지만 세 번째에서 \"그만 집에 가자\"고 했다.', 'husband.wink', 'wife.joy'),
        C('동그라미는 가장 오래된 모임 하나만 골랐다. 거기서는 평소보다 많이 웃었다.', 'dong_dad.warm', bubble='heart')],
      '송년회가 겹치면 나는?', '한 곳만 골라서 진심으로', '최대한 많이 다녀 본다', '가장 오래된 모임에'),
    S(46, '반려견의 명절', 'v2', 35, [
        C('명절 연휴, 차에 가족 일곱과 강아지 한 마리가 탔다. 뒷자리가 꽉 찼다.', 'nemo_dad.joy', 'nemo_kids.kid2', 'baby.joy'),
        C('세모네는 펫호텔을 알아보다 \"그냥 같이 가자\"고 해서 강아지 방석을 챙겼다.', 'husband.joy', 'wife.joy'),
        C('동그라미네 강아지는 할머니 댁에 가자마자 마당에서 제일 먼저 뛰었다.', 'dong_dad.warm', 'nemo_grandma.good', bubble='sparkle'),
        C('저녁상 아래에는 늘 작은 그림자가 앉았다. 서로 몰래 한 입씩 나눠 줬다.', 'nemo_grandma.good', 'baby.joy', bubble='heart')],
      '명절에 반려견은?', '다 같이 차에 태운다', '방석까지 챙겨서', '할머니 댁 마당에서 신나게'),
    S(47, '형제 단톡방', 'v2', 32, [
        C('형제 단톡방 알림이 999+. 어머니 생신 계획이 한 시간 만에 쌓였다.', 'nemo_dad.good'),
        C('네모는 \"1/N 계산\"을 올리자마자 사진 세 장과 이모티콘이 몰려와서 웃었다.', 'nemo_dad.joy', 'nemo_mom.good'),
        C('세모는 읽씹 두 번에 \"미안 바빴어!\"를 이모티콘 폭탄으로 갚았다.', 'husband.wink'),
        C('동그라미는 메모를 하나 남겼다. \"예약 완료. 날짜 확인.\" 곧 하트가 열 개 달렸다.', 'dong_dad.good', bubble='heart')],
      '형제 단톡방에서 나는?', '계산부터 올린다', '이모티콘으로 분위기를', '예약하고 한 줄 남긴다'),
    S(48, '장바구니', 'v3', 15, [
        C('장바구니에 담을 때마다 물건 값이 눈에 들어오는 요즘이다. 네모네는 대용량만 산다.', 'nemo_mom.good', 'nemo_dad.good'),
        C('세모는 \"오늘만 산다\"며 플렉스를 하다 아내 눈치를 보고 하나는 도로 놓았다.', 'husband.worry', 'wife.smug'),
        C('동그라미는 가계부 앱 그래프를 켰다. 이번 달은 처음으로 파란 막대가 짧다.', 'dong_dad.calm', bubble='sparkle'),
        C('집에 돌아와 식탁에 같이 풀어놓은 장바구니는 알록달록했다. 그날 저녁은 푸짐했다.', 'nemo_mom.joy', 'baby.joy', bubble='heart')],
      '장보기에서 나는?', '대용량으로 든든하게', '가끔 플렉스', '가계부에 기록'),
    S(49, '명절 사진 이백 장', 'v3', 17, [
        C('명절이 끝나자 가족 단톡방에 사진이 쏟아졌다. 네모네 사진만 200장이었다.', 'nemo_dad.joy', 'nemo_kids.kid1'),
        C('세모는 나가기 버튼 앞에서 한참 망설이다 \"아니다, 사진 다시 본다\" 하고 닫았다.', 'husband.joy', 'wife.joy'),
        C('동그라미는 혼자 좋아요만 눌렀다. 그런데 하트가 열여섯 개나 돌아왔다.', 'dong_dad.warm', bubble='heart'),
        C('밤이 되자 단톡방에 \"다들 고생했어\" 한 줄. 모두가 같은 화면을 보며 웃고 있었다.', 'nemo_grandma.good', 'baby.joy', bubble='sparkle')],
      '명절 사진 단톡방에서 나는?', '사진을 한가득 올린다', '나가기 버튼 앞에서 웃는다', '조용히 좋아요만'),
    S(50, '건강검진 결과', 'v3', 20, [
        C('건강검진 결과지가 도착했다. 빨간 글씨가 몇 개 보이자 네모가 한참 말이 없었다.', 'nemo_dad.worry', 'nemo_mom.good'),
        C('\"난 진짜 아프면 안 되는데…\" 중얼거리자 막내가 옆에서 결과지를 같이 들여다보았다.', 'nemo_dad.worry', 'baby.surprise'),
        C('세모는 결과를 자랑스럽게 읽다 아내가 \"당신 수치 좀 봐\" 하자 슬그머니 접었다. 그리고 걷기 약속을 했다.', 'husband.wink', 'wife.joy'),
        C('동그라미는 재검진 날짜를 달력에 적고 옆에 \"맛있는 거 먹기\"를 덧붙였다.', 'dong_dad.warm', bubble='heart')],
      '건강검진 결과지를 보면?', '일단 가족부터 걱정', '같이 걷기부터 약속', '재검 날짜를 먼저 적는다'),
]
added = 0
for s in NEW:
    assert len(s['cuts']) == 4 and all(8 <= len(c['text']) <= 130 for c in s['cuts']), s['id']
    for c in s['cuts']: assert c['chars'], s['id']
    if s['id'] in have: continue
    d['stories'].append(s); added += 1
d['stories'].sort(key=lambda s: s['id']); json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
b = R / 'data/idle_balance.json'; B = json.load(open(b, encoding='utf-8'))
while len(B['storyThresholds']) < len(d['stories']): B['storyThresholds'].append(B['storyThresholds'][-1] + 100000000000000)
json.dump(B, open(b, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('idle stories', len(d['stories']), '(+%d)' % added, 'thresholds', len(B['storyThresholds']))
