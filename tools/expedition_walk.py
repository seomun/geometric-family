"""⑪ 「다시 걷기」 시즌 길(B29) — tools/expedition_slice_build.py 가 expedition_wkboss.py 다음에 exec 로 불러 쓴다. [제안]
다 깬 나라의 마지막 단계(보스 칸)를 철(봄·여름·가을·겨울)마다 다른 규칙으로 다시 걷는다: 적 속성을 규칙대로 섞어서 평소 상성이 안 맞는다(봄 한 칸 밀기 · 여름 두 칸 · 가을 번갈아 · 겨울 눈보라 = 모두 돌보기).
보상은 반짝석 없음: 철마다 나라별 처음 걸으면 금화(그 칸 금화 × 3), 다시 걸으면 금화 절반, 그리고 그 나라 마지막 단계 전리품 가구의 「색 변형 코드」(성인 집에서 입력, 가구 색이 새로 열림). 다시 걸어도 코드는 같다(철·나라로 정해짐).
압박 없음: 놓친 철은 다음 해에 다시, 못 걸어도 잃는 것 없음. 서버가 철(KST 달)·처음 걷기를 판정하고 전투는 같은 코어로 다시 돌린다."""
BAL['walk'] = dict(
    rules=[dict(id='spring', name='꽃바람 길', icon='🌸', mode='shift', by=1, months=[3, 4, 5]),
           dict(id='summer', name='소나기 길', icon='🌦️', mode='shift', by=2, months=[6, 7, 8]),
           dict(id='autumn', name='단풍 길', icon='🍁', mode='alt', months=[9, 10, 11]),
           dict(id='winter', name='눈보라 길', icon='❄️', mode='one', el='care', months=[12, 1, 2])],
    kMul=0.92, goldFirst=3, goldRepeat=0.5, variants=3)
assert sorted(m for r in BAL['walk']['rules'] for m in r['months']) == list(range(1, 13)), '12개월을 한 번씩 덮는다'
print('다시 걷기 규칙', len(BAL['walk']['rules']), '개 · 반짝석 0')
