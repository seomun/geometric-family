"""⑪ 새 옛이야기 코스튬 동료 6종(B17) — 풀 밖 보관(D.reserve). 다음 배너 준비용이라 units·도감·뽑기 풀에 들어가지 않는다. tools/expedition_slice_build.py 가 exec 로 불러 쓴다. [제안]
가족이 옛이야기 의상을 입은 ★5(기존 배너 1·2탄과 같은 규칙). 배역은 tools/tales_cast.py 와 같다(가족 악역 없음). 역할·속성은 스킬 데이터(ROLE·EL)에서 온다."""
RESERVE = [
    U('r_redhood_hana', '빨간 모자 하나', 'nemo_kids.kid1', 'healer', 'care', 5, 'reserve', costume='빨간 모자(순한 판)', tale='tale:redhood', note='엄마 심부름 바구니를 든 하나. 큰 길로만 다니는 똑똑한 아이예요.'),
    U('r_hansel_sejji', '헨젤 세찌', 'nemo_kids.kid3', 'tank', 'support', 5, 'reserve', costume='헨젤과 그레텔(순한 판)', tale='tale:hansel', note='빵 부스러기로 길을 표시하는 세찌. 동생들이 따라올 길을 잊지 않아요.'),
    U('r_rabbit_duri', '토끼 두리', 'nemo_kids.kid2', 'attacker', 'flash', 5, 'reserve', costume='토끼전', tale='tale:rabbitliver', note='꾀 많은 토끼 두리. 위기에는 웃음으로 넘겨요.'),
    U('r_persimmon_mom', '곶감 네모 엄마', 'nemo_mom.joy', 'support', 'care', 5, 'reserve', costume='호랑이와 곶감', tale='tale:tigerpersimmon', note='아기를 달래는 곶감 한 접시. 달콤하게 모두를 진정시켜요.'),
    U('r_fairy_wife', '선녀 세모 아내', 'wife.joy', 'mage', 'flash', 5, 'reserve', costume='선녀와 나무꾼', tale='tale:fairywood', note='하늘하늘 날개옷의 세모 아내. 한 번 웃으면 연못이 반짝여요.'),
    U('r_dragonking_dong', '용왕 동그라미 아빠', 'dong_dad.warm', 'healer', 'support', 5, 'reserve', costume='토끼전', tale='tale:rabbitliver', note='외로워서 아팠던 용왕님. 한 상에 모이면 기운이 나요.'),
]
assert len(RESERVE) == 6 and len({r['id'] for r in RESERVE}) == 6 and len({r['name'] for r in RESERVE}) == 6
assert not {r['id'] for r in RESERVE} & {u['id'] for u in UNITS}, '보관 동료는 현재 units 와 겹치지 않는다'
for _r in RESERVE:
    _t = _r['tale'].split(':')[1]; assert _t in _tc.CAST, ('이야기 배역표에 없음', _t)
    assert _r['role'] in ROLE and _r['el'] in EL, _r['id']
print('보관 동료', len(RESERVE), '(풀 밖)')
