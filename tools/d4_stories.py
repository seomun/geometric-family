"""D4: ② 세 가족 식탁 사연 31 → 40(s32~s40). 소재 뱅크 v3(content/episodes/BANK_v3_2026-10.md)의 상황만 빌려 각색 [제안] — 문장을 가져오지 않고, 원고(작가 원문)는 손대지 않는다.
행복·따뜻함이 먼저, 걱정은 뒤. 4컷 + 질문 하나(세 가족 선택지) + 웃음 보상 40. 멱등. 이후 tools/map_build.py(길)·tools/ops_build.py."""
import json, pathlib
R = pathlib.Path('.')
p = R / 'data/idle_stories.json'; d = json.load(open(p, encoding='utf-8')); have = {s['id'] for s in d['stories']}


def C(text, *chars, bubble=None):
    c = dict(text=text, src='각색 [제안]', chars=list(chars))
    if bubble: c['bubble'] = bubble
    return c


def S(i, title, n, cuts, q, a, b, c):
    return dict(id='s%d' % i, title=title, source='content/episodes/BANK_v3_2026-10.md #%d (허브 초안, 전부 각색)' % n, bg='indoor', cuts=cuts,
                question=dict(q=q, options=[dict(k='nemo', t=a), dict(k='semo', t=b), dict(k='dong', t=c)]), reward=dict(laugh=40))


NEW = [
    S(32, '명절 용돈 봉투', 1, [
        C('추석이 지나고 단톡방에 질문이 올라왔다. \"다들 부모님 용돈 얼마 드렸어?\"', 'nemo_dad.good'),
        C('네모는 봉투를 두 개 만들어 놓고 한참 고민하다 같은 금액을 넣었다.', 'nemo_dad.joy', 'nemo_mom.good'),
        C('세모 부부는 처가 몫과 시댁 몫을 두고 계산기를 두드린다. 결론은 \"같이 가서 드리자.\"', 'husband.joy', 'wife.joy'),
        C('동그라미는 조용히 이체했다. 메모란에 \"건강하세요\" 한 줄.', 'dong_dad.warm', bubble='heart')],
      '용돈 봉투에 가장 중요한 건?', '둘 다 서운하지 않게 똑같이', '같이 가서 얼굴 보고 드리기', '메모 한 줄의 마음'),
    S(33, '수능 아침', 3, [
        C('수능 날 아침. 네모네 부엌에 찹쌀떡과 엿이 한 줄로 놓였다.', 'nemo_mom.joy', 'nemo_kids.kid1'),
        C('네모는 도시락을 두 번 확인하고 신발끈을 또 한 번 묶어 준다.', 'nemo_dad.worry', 'nemo_kids.kid1'),
        C('조카가 시험을 본다는 세모는 응원 기프티콘을 고르다 아내와 취향 싸움을 한다.', 'husband.wink', 'wife.joy'),
        C('동그라미네 아들은 이미 수시로 끝냈다. 아빠가 대신 긴장했다.', 'dong_dad.calm', bubble='sparkle')],
      '수능 아침에 건네고 싶은 한마디는?', '「밥은 먹고 가라」', '「끝나면 맛있는 거 먹자!」', '「잘 준비했으니 괜찮아」'),
    S(34, '독감 주사 줄', 5, [
        C('이른 독감이 돌아 병원 대기실이 만원이다. 번호표가 40번 넘게 밀렸다.', 'nemo_mom.worry'),
        C('네모네는 식구 수만큼 접종비를 계산하다 \"할머니는 무료네!\" 하고 웃는다.', 'nemo_dad.joy', 'nemo_grandma.good'),
        C('세모는 주사 맞고 몸살이 올 것 같다며 하루 쉴 핑계를 미리 만든다.', 'husband.worry', 'wife.smug'),
        C('동그라미는 무료 접종 날짜를 달력에 적어 둔 덕에 줄 없이 들어갔다.', 'dong_dad.good', bubble='heart')],
      '독감 주사, 나는?', '온 식구가 같이 맞는다', '맞고 하루 푹 쉰다', '미리 예약해서 줄 없이'),
    S(35, '축의금 세 장', 7, [
        C('가을이라 청첩장이 한 달에 세 장 왔다. 식탁에 봉투 세 개가 놓였다.', 'nemo_dad.good', 'nemo_mom.good'),
        C('네모는 3장은 5만 원씩, 1장은 10만 원으로 하고 두 번은 인사만 가기로 한다.', 'nemo_dad.joy'),
        C('세모는 \"밥값이 얼마인데\" 하며 계산기를 꺼냈지만 결국 한 장 더 낸다.', 'husband.wink', 'wife.joy'),
        C('동그라미의 장부에는 받은 만큼 정확히 적혀 있다. 그리고 오래된 친구 한 줄도.', 'dong_dad.warm')],
      '축의금 봉투를 쓸 때 나는?', '가진 만큼 최선을 다해서', '그날 기분이 좋으면 크게', '장부에 맞춰 정확하게'),
    S(36, '단풍 산행', 8, [
        C('동창 모임이 단풍 산행이 됐다. 아침부터 등산복 이야기로 시끌시끌하다.', 'nemo_dad.good', 'husband.joy', 'dong_dad.good'),
        C('네모는 등산복이 없어 회사 패딩을 입고 왔다. 의외로 제일 따뜻하다.', 'nemo_dad.joy'),
        C('세모는 장비를 풀세트로 사고 한 번 가 본 곳을 신나게 안내한다.', 'husband.wink'),
        C('동그라미는 정상 도착 시간이 정확했다. 사진은 혼자 찍었지만 오늘만은 셋이 같이 찍었다.', 'dong_dad.warm', 'nemo_dad.love', 'husband.joy', bubble='sparkle')],
      '산 정상에서 가장 하고 싶은 건?', '도시락 펴고 나눠 먹기', '큰 소리로 야호!', '조용히 풍경 한 장'),
    S(37, '이 정도 피곤함', 9, [
        C('오늘은 사소한 일로 진이 빠지는 날이다. 아이 넷 숙제를 검사하다 하루가 갔다.', 'nemo_dad.worry', 'nemo_kids.kid2'),
        C('세모 부부는 \"치약은 아래부터 짜야지\"로 시작해 \"그럼 이쪽은 위부터!\"로 끝났다.', 'husband.worry', 'wife.angry'),
        C('동그라미는 퇴근 후 모든 알림을 껐다. 이상하게 마음이 가벼워졌다.', 'dong_dad.calm'),
        C('그날 밤 셋은 각자 한 줄을 썼다. \"그래도 오늘 웃었다.\"', 'nemo_dad.good', 'husband.joy', 'dong_dad.good', bubble='heart')],
      '진이 빠지는 날 밤에 하고 싶은 건?', '식구 얼굴 한 번 보기', '크게 웃고 넘기기', '조용히 알림 끄기'),
    S(38, '밥은? 응', 11, [
        C('하루에 나누는 말이 \"밥은?\" \"응\" 이 전부인 부부가 있다. 오늘도 그랬다.', 'nemo_dad.good', 'nemo_mom.good'),
        C('네모네는 아이 넷 틈에서 대화할 틈이 없어도 눈이 마주치면 웃는다.', 'nemo_mom.joy', 'nemo_dad.joy'),
        C('세모네는 말이 너무 많아 싸움이 나지만 먼저 손을 내미는 쪽도 정해져 있다.', 'husband.wink', 'wife.joy'),
        C('동그라미네는 정확한 말만 오간다. 오늘은 처음으로 \"고마워\"를 덧붙였다.', 'dong_dad.warm', bubble='heart')],
      '부부 사이 가장 좋은 말은?', '「밥 먹었어?」', '「우리 오늘 뭐 할까」', '「고마워」'),
    S(39, '막내가 또 생겼다', 18, [
        C('아이들이 자라 떠난 집에 강아지가 왔다. 빈 의자에 방석이 놓였다.', 'dong_dad.warm'),
        C('세모네는 고양이 둘을 데려왔다. \"아이 대신이야\" 하면서 매일 사진을 찍는다.', 'husband.joy', 'wife.love'),
        C('네모네는 \"막내가 또 생겼네\" 하며 사료 값부터 계산한다.', 'nemo_dad.joy', 'nemo_mom.joy'),
        C('저녁이 되면 세 집 모두 같은 소리가 난다. \"밥 먹자, 우리 막내!\"', 'baby.joy', 'nemo_dad.love', bubble='heart')],
      '집에 새 식구가 생긴다면?', '일단 이름부터 같이 짓기', '사진부터 백 장', '필요한 걸 미리 다 준비'),
    S(40, '부모님 병원 가는 날', 19, [
        C('오늘은 휴가를 내서 부모님 진료에 같이 가는 날이다.', 'nemo_dad.good', 'nemo_grandma.good'),
        C('네모네는 할머니 백내장 수술을 앞두고 온 식구가 돌아가며 동행한다.', 'nemo_mom.joy', 'nemo_kids.kid1'),
        C('세모네는 시부모님 순번과 친정 순번을 정하다가 \"같이 가자\"로 합의했다.', 'husband.joy', 'wife.good'),
        C('동그라미는 대학병원 예약을 1분 만에 잡았다. 그리고 휴게실에서 같이 따뜻한 차를 마신다.', 'dong_dad.warm', bubble='heart')],
      '부모님과 병원에 가는 날 나는?', '옆에서 손 꼭 잡기', '웃긴 얘기로 긴장 풀기', '예약·서류 먼저 챙기기'),
]
added = 0
for s in NEW:
    assert len(s['cuts']) == 4 and all(8 <= len(c['text']) <= 120 for c in s['cuts']), s['id']
    for c in s['cuts']: assert c['chars'], s['id']
    if s['id'] in have: continue
    d['stories'].append(s); added += 1
d['stories'].sort(key=lambda s: s['id']); json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
b = R / 'data/idle_balance.json'; B = json.load(open(b, encoding='utf-8'))
while len(B['storyThresholds']) < len(d['stories']): B['storyThresholds'].append(B['storyThresholds'][-1] + 100000000000000)
json.dump(B, open(b, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('idle stories', len(d['stories']), '(+%d)' % added, 'thresholds', len(B['storyThresholds']))
