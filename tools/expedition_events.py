"""⑪ 계절 이벤트 스테이지 틀(B9) — tools/expedition_slice_build.py 가 expedition_begin.py 다음에 exec 로 불러 쓴다. [제안]
이벤트 하나 = 철(달) + 3칸. 깬 단계에 맞춘 적(요일 던전과 같은 식)에 철 테마 이름·그림만 입힌다. 처음 깨면 반짝석+금화, 다시 깨면 금화 절반. 압박 없음: 놓친 철은 다음 해에 다시.
이벤트 한 개당 반짝석 합 100(4개 = 연 400 · 도감 보상 1,250 안쪽)."""
BAL['events'] = [
    dict(id='ev_spring', n=1, name='봄 소풍 대작전', icon='🌸', months=[3, 4, 5], names=['꽃길 입구', '돗자리 언덕', '벚꽃 나무 아래'], foes=[['소풍 개미', '🐜'], ['꽃가루 꼬마', '🌼'], ['벌 꼬마', '🐝']], tiers=[0.6, 0.8, 1.0], kMul=[0.9, 1.0, 1.1], gems=[20, 30, 50], goldMul=[1.5, 2.0, 3.0]),
    dict(id='ev_summer', n=2, name='여름 물놀이 한마당', icon='🍉', months=[6, 7, 8], names=['물놀이터', '수박 밭', '평상 앞'], foes=[['물방울 꼬마', '💧'], ['수박 꼬마', '🍉'], ['매미 꼬마', '🪲']], tiers=[0.6, 0.8, 1.0], kMul=[0.9, 1.0, 1.1], gems=[20, 30, 50], goldMul=[1.5, 2.0, 3.0]),
    dict(id='ev_autumn', n=3, name='추석 달맞이', icon='🌕', months=[9, 10, 11], names=['송편 가게', '감나무 길', '보름달 언덕'], foes=[['감 꼬마', '🧡'], ['송편 꼬마', '🥮'], ['토끼 꼬마', '🐇']], tiers=[0.6, 0.8, 1.0], kMul=[0.9, 1.0, 1.1], gems=[20, 30, 50], goldMul=[1.5, 2.0, 3.0]),
    dict(id='ev_winter', n=4, name='겨울 김장 잔치', icon='⛄', months=[12, 1, 2], names=['배추밭', '김장 마당', '눈사람 광장'], foes=[['배추 꼬마', '🥬'], ['눈 꼬마', '❄️'], ['눈사람 꼬마', '⛄']], tiers=[0.6, 0.8, 1.0], kMul=[0.9, 1.0, 1.1], gems=[20, 30, 50], goldMul=[1.5, 2.0, 3.0]),
]
assert sorted(m for e in BAL['events'] for m in e['months']) == list(range(1, 13)), '12개월을 한 번씩 덮는다'
assert all(sum(e['gems']) == 100 for e in BAL['events'])
print('계절 이벤트', len(BAL['events']), '개 · 철마다 반짝석 100')
