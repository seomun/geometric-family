"""⑪ 초보자 미션 30 · 출석 7일(B11) — tools/expedition_slice_build.py 가 expedition_nations2.py 다음에 exec 로 불러 쓴다. [제안]
첫 주 이탈 방지: 미션은 순서대로 쉬운 것부터, 못 해도 잃는 것 없음(압박 없음). 출석은 끊겨도 처음부터 다시가 아니라 「n번째 출석」 이어 가기(연속 일수 없음).
보상 총량: 미션 반짝석 + 출석 반짝석 이 도감 보상(1250) 안쪽이 되게 잡았다(확정 지급).
k(조건 종류): clear 깬 단계 · units 모은 동료 · recruit 포섭한 친구 · lv 최고 레벨 · skl 최고 스킬 · awk 최고 각성 · promo 최고 승급 · gear 장비 레벨 합 · pull 모집 횟수 · dun 던전 횟수 · idle 정찰 수령 · dex 도감 보상 수."""
_B = [  # (id, 문구, k, n, 반짝석, 금화)
    ('b01', '첫 전투에서 이겨요', 'clear', 1, 10, 200), ('b02', '3단계를 깨요', 'clear', 3, 10, 300), ('b03', '친구 한 명을 Lv 3 까지 키워요', 'lv', 3, 0, 300),
    ('b04', '동료 모집을 한 번 해요', 'pull', 1, 10, 0), ('b05', '바람 친구와 친구가 돼요(6단계)', 'recruit', 1, 20, 300), ('b06', '동료 6명을 모아요', 'units', 6, 10, 0),
    ('b07', '요일 던전을 한 번 가요', 'dun', 1, 0, 400), ('b08', '정찰 보상을 한 번 받아요', 'idle', 1, 0, 300), ('b09', '스킬을 한 번 올려요', 'skl', 2, 0, 500),
    ('b10', '9단계를 깨요', 'clear', 9, 10, 400), ('b11', '친구 한 명을 Lv 6 까지 키워요', 'lv', 6, 0, 500), ('b12', '장비를 한 칸 올려요', 'gear', 1, 0, 400),
    ('b13', '첫 나라를 끝내요(12단계)', 'clear', 12, 20, 600), ('b14', '동료 8명을 모아요', 'units', 8, 10, 0), ('b15', '각성을 한 번 해요', 'awk', 1, 20, 0),
    ('b16', '친구 한 명을 Lv 10 까지 키워요', 'lv', 10, 0, 800), ('b17', '동료 모집을 10번 해요', 'pull', 10, 10, 0), ('b18', '15단계를 깨요', 'clear', 15, 10, 600),
    ('b19', '승급을 한 번 해요', 'promo', 1, 30, 0), ('b20', '도감 수집 보상을 받아요', 'dex', 1, 20, 0), ('b21', '18단계를 깨요', 'clear', 18, 10, 700),
    ('b22', '두 번째 친구와 친구가 돼요(포섭 2)', 'recruit', 2, 20, 0), ('b23', '친구 한 명을 Lv 15 까지 키워요', 'lv', 15, 0, 1000), ('b24', '요일 던전을 5번 가요', 'dun', 5, 0, 800),
    ('b25', '두 번째 나라를 끝내요(24단계)', 'clear', 24, 30, 1000), ('b26', '동료 12명을 모아요', 'units', 12, 20, 0), ('b27', '스킬을 3단계까지 올려요', 'skl', 3, 0, 900),
    ('b28', '30단계를 깨요', 'clear', 30, 20, 1000), ('b29', '장비 레벨 합을 10 으로 올려요', 'gear', 10, 20, 0), ('b30', '세 번째 나라를 끝내요(36단계)', 'clear', 36, 50, 1500),
]
BAL['beginner'] = [dict(id=i, t=t, k=k, n=n, gems=g, gold=o) for i, t, k, n, g, o in _B]
BAL['attend'] = [dict(day=1, gems=0, gold=300), dict(day=2, gems=0, gold=400), dict(day=3, gems=20, gold=500), dict(day=4, gems=0, gold=600), dict(day=5, gems=0, gold=800), dict(day=6, gems=30, gold=800), dict(day=7, gems=50, gold=1200)]
assert len(BAL['beginner']) == 30 and len({m['id'] for m in BAL['beginner']}) == 30 and len(BAL['attend']) == 7
assert sum(m['gems'] for m in BAL['beginner']) + sum(a['gems'] for a in BAL['attend']) <= 1250, '반짝석 총량이 도감 보상 안쪽'
print('초보자 미션 30 반짝석', sum(m['gems'] for m in BAL['beginner']), '금화', sum(m['gold'] for m in BAL['beginner']), '· 출석 7일 반짝석', sum(a['gems'] for a in BAL['attend']), '금화', sum(a['gold'] for a in BAL['attend']))
