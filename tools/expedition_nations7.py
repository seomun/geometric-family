"""⑪ 19~21나라 확장(B28) — tools/expedition_slice_build.py 가 expedition_nations6.py 다음에 exec 로 불러 쓴다. [제안]
19나라 흥부와 놀부 박 마을(217~228) · 20나라 혹부리 영감 노래 골짜기(229~240) · 21나라 금도끼 은도끼 연못(241~252). 나라마다 12칸: 중간 대장(222·234·246) + 마지막 포섭 보스(228·240·252).
이야기 컷의 인물은 배역표(tales_cast) 그대로(흥부=네모 아빠·흥부 아내=네모 엄마·놀부=세모 남편 / 혹부리 영감=네모 아빠·따라 하는 영감=동그라미 아빠 / 나무꾼=네모 아빠·산신령=동그라미 아빠·이웃=네모 엄마).
포섭은 모두 가족 밖(허브 방침) — 제비·도깨비는 이미 뽑기 동료라 겹치지 않게 새 이웃을 배역표에 추가: 참새(228, 번쩍 → 돌보기) · 부엉이(240, 돌보기 → 받치기) · 개구리(252, 받치기 → 번쩍).
보상: 한 나라 반짝석 700(일반 9×50 + 중간 100 + 포섭 150) — D28 단가(단계 첫 클리어 평균 ≤ 66) 안쪽, 나라를 더할수록 평균이 내려간다. 반복 보상은 새로 만들지 않는다(허브: 반복 반짝석 여유 92). 디즈니 고유 요소는 쓰지 않는다."""
N_SPARROW, N_OWL, N_FROG = _outside('heungbu', '참새'), _outside('hok', '부엉이'), _outside('axe', '개구리')
UNITS += [
    U('u_sparrow', N_SPARROW, None, 'attacker', 'flash', 4, 'recruit', emoji='🐤', note='포섭 · 19나라 마지막(제비 둥지 옆 참새, 박씨 이야기를 먼발치서 지켜보던 순한 이웃)'),
    U('u_owl', N_OWL, None, 'healer', 'care', 4, 'recruit', emoji='🦉', note='포섭 · 20나라 마지막(밤마다 혹부리 영감의 노래를 엿듣던 산 부엉이)'),
    U('u_frog', N_FROG, None, 'tank', 'support', 4, 'recruit', emoji='🐸', note='포섭 · 21나라 마지막(연못가에서 도끼 소동을 구경하던 개구리)'),
]
for _u in UNITS:
    if _u['route'] == 'recruit': assert _u['art'] is None and _u['name'] not in _FAMILY, ('포섭 대상이 가족 기본형', _u['name'])
assert len({u['name'] for u in UNITS}) == len(UNITS), '동료 이름 중복 없음'
PAL.update({
    19: [('박씨 꼬마', '🌱', 'healer', 'care'), ('초가지붕 꼬마', '🏠', 'tank', 'support'), ('덩굴 꼬마', '🌿', 'attacker', 'flash'), ('보름달 꼬마', '🌕', 'mage', 'flash'), ('톱질 꼬마', '🪚', 'attacker', 'support'), ('박 속 꼬마', '🎃', 'support', 'care'), ('제비집 그림자', '🪹', 'tank', 'flash')],
    20: [('노래 주머니 꼬마', '🎵', 'mage', 'flash'), ('골짜기 바람 꼬마', '🍃', 'attacker', 'support'), ('혹 구름', '☁️', 'tank', 'care'), ('달빛 꼬마', '🌙', 'healer', 'care'), ('방망이 그림자', '🪵', 'attacker', 'flash'), ('한밤 숲 꼬마', '🌲', 'tank', 'support'), ('메아리 꼬마', '🔔', 'mage', 'care')],
    21: [('연못 물방울', '💧', 'healer', 'care'), ('도끼 그림자', '🪓', 'attacker', 'flash'), ('은빛 잉어', '🐟', 'mage', 'flash'), ('금빛 물결', '🌊', 'mage', 'support'), ('이끼 꼬마', '🍀', 'tank', 'care'), ('연꽃 꼬마', '🪷', 'support', 'support'), ('나뭇단 꼬마', '🪵', 'tank', 'flash')],
})
NAMES.update({
    217: '박 마을 입구', 218: '초가지붕 길', 219: '제비집 처마', 220: '고쳐 준 다리', 221: '박씨 심는 마당', 222: '덩굴 지킴이', 223: '보름달 지붕', 224: '톱질 마당', 225: '박 속 곳간', 226: '놀부네 대문', 227: '화해의 마루', 228: '참새',
    229: '노래 골짜기 입구', 230: '나무 그늘 오솔길', 231: '혹 구름 고개', 232: '달빛 개울', 233: '한밤 숲 어귀', 234: '메아리 지킴이', 235: '노래 주머니 바위', 236: '도깨비 잔치 터', 237: '방망이 나무', 238: '혹 떼는 샘', 239: '새벽 골짜기', 240: '부엉이',
    241: '연못 가는 길', 242: '나무꾼 오두막', 243: '도끼 던진 자리', 244: '물방울 징검다리', 245: '은빛 잉어 연못', 246: '연못 지킴이', 247: '금빛 물결 둑', 248: '이끼 낀 바위', 249: '연꽃 정자', 250: '욕심 마당', 251: '정직한 나뭇단 길', 252: '개구리',
})
TIPS.update({217: '19나라: 박 마을의 적이에요. 번쩍(△) 적은 돌보기(◯) 친구가 잘 막아요.', 229: '20나라: 노래 골짜기의 적이에요. 돌보기(◯) 적에겐 받치기(◻) 친구가 유리해요.', 241: '21나라: 금도끼 연못의 적이에요. 받치기(◻) 적에겐 번쩍(△) 친구가 유리해요.'})
BOSS.update({228: (N_SPARROW, '🐤', 'attacker', 'flash', 'u_sparrow'), 240: (N_OWL, '🦉', 'mage', 'care', 'u_owl'), 252: (N_FROG, '🐸', 'tank', 'support', 'u_frog')})
MID.update({222: ('덩굴 지킴이', '🌿', 'tank', 'care'), 234: ('메아리 지킴이', '🔔', 'tank', 'support'), 246: ('연못 지킴이', '🪷', 'tank', 'flash')})
for _s in range(217, 253): STAGES.append(make(_s))
BAL['stages'] = len(STAGES)
NATIONS += [dict(id=19, name='흥부와 놀부 박 마을', sub='19나라 · 박씨와 제비집'), dict(id=20, name='혹부리 영감 노래 골짜기', sub='20나라 · 노래와 메아리'), dict(id=21, name='금도끼 은도끼 연못', sub='21나라 · 정직한 나뭇단')]
STORY['pre'].update({
    217: [cut('초가지붕이 올망졸망한 박 마을. 처마 밑 제비집에서 지지배배 소리가 났다.', 'nemo_dad.joy', 'baby.joy', bg='village'), cut('흥부(네모 아빠)는 다리를 다친 제비를 조심조심 감싸 주었다. 흥부 아내(네모 엄마)가 헝겊을 건넸다.', 'nemo_dad.good', 'nemo_mom.good', bg='village'), cut('놀부(세모 남편)는 멀찍이서 팔짱을 끼고 보다가 슬그머니 눈길을 돌렸다.', 'husband.worry', 'nemo_dad.good', bg='village'), cut('19나라 흥부와 놀부 박 마을. 번쩍(△) 적은 돌보기(◯) 친구가 잘 막아요.', 'nemo_mom.joy', 'wife.joy', bg='village')],
    228: [cut('박 덩굴 위에 참새 한 마리가 포르르 앉았다. 제비집 옆에서 줄곧 우리를 지켜보던 이웃이다.', 'baby.surprise', 'nemo_mom.good', bg='village'), cut('번쩍(△)을 이기는 돌보기(◯) 친구가 말을 걸어 보자. 박씨 이야기가 궁금했던 걸지도 몰라.', 'wife.joy', 'nemo_dad.good', bg='village')],
    229: [cut('혹부리 영감(네모 아빠)은 볼에 혹을 달고 산에 올라 땔감을 모았다. 해가 저물었다.', 'nemo_dad.good', 'baby.joy', bg='night'), cut('빈 집에 들어가 노래를 불렀더니 메아리가 되어 골짜기를 가득 채웠다.', 'nemo_dad.joy', 'nemo_kids.kid3', bg='night'), cut('따라 하는 영감(동그라미 아빠)은 먼발치에서 귀를 쫑긋 세웠다. 「나도 해 볼까?」', 'dong_dad.good', 'nemo_dad.good', bg='night'), cut('20나라 혹부리 영감 노래 골짜기. 돌보기(◯) 적에겐 받치기(◻) 친구가 유리해요.', 'dong_dad.calm', 'wife.joy', bg='night')],
    240: [cut('나무 위에서 부엉이가 눈을 동그랗게 떴다. 밤마다 노래를 엿듣던 이웃이다.', 'baby.surprise', 'nemo_dad.good', bg='night'), cut('돌보기(◯)를 이기는 받치기(◻) 친구가 말을 걸어 보자. 노래가 좋아서 따라다닌 걸지도 몰라.', 'nemo_mom.good', 'dong_dad.calm', bg='night')],
    241: [cut('연못가에 나무꾼(네모 아빠)이 도끼를 메고 걸어왔다. 물빛이 반짝반짝 푸르렀다.', 'nemo_dad.joy', 'baby.joy', bg='stream'), cut('나무를 베다가 그만 도끼가 풍덩! 연못 속으로 빠졌다. 나무꾼은 연못가에 털썩 앉았다.', 'nemo_dad.worry', 'nemo_kids.kid3', bg='stream'), cut('산신령(동그라미 아빠)이 물 위로 나타나 조용히 웃었다. 「네 도끼를 찾아 줄까?」', 'dong_dad.warm', 'nemo_dad.good', bg='stream'), cut('21나라 금도끼 은도끼 연못. 받치기(◻) 적에겐 번쩍(△) 친구가 유리해요.', 'dong_dad.calm', 'wife.joy', bg='stream')],
    252: [cut('연잎 위에서 개구리가 개굴개굴 울었다. 연못가에서 소동을 줄곧 구경하던 이웃이다.', 'baby.surprise', 'nemo_dad.good', bg='stream'), cut('받치기(◻)를 이기는 번쩍(△) 친구가 말을 걸어 보자. 같이 놀고 싶었던 걸지도 몰라.', 'wife.joy', 'dong_dad.calm', bg='stream')],
})
STORY['recruit'].update(
    u_sparrow=[cut('참새가 날개를 오므렸다. 「…제비네 이야기가 너무 좋아서, 매일 처마 옆에서 들었어요.」', 'nemo_mom.good', bg='village'), cut('흥부 아내(네모 엄마)가 박 속 죽을 한 숟갈 덜어 내밀었다. 「같이 먹어요. 이야기도 같이 해요.」', 'nemo_mom.joy', 'nemo_dad.joy', bg='village'), cut('놀부(세모 남편)가 쭈뼛쭈뼛 대문을 열고 들어왔다. 모두가 한 마루에 둘러앉았다.', 'husband.joy', 'baby.joy', bg='village'), cut('참새가 원정대의 친구가 되었다!', 'baby.joy', 'nemo_mom.joy', 'nemo_dad.joy', bg='village')],
    u_owl=[cut('부엉이가 부엉— 낮게 울었다. 「…노래가 너무 따뜻해서 매일 밤 따라왔어. 들켜서 미안해.」', 'nemo_dad.good', bg='night'), cut('혹부리 영감(네모 아빠)이 껄껄 웃었다. 「미안할 게 뭐야. 같이 부르자꾸나.」', 'nemo_dad.joy', 'dong_dad.warm', bg='night'), cut('골짜기에 노래 두 줄이 겹쳐 울렸다. 혹은 어느새 가볍게 떨어져 있었다.', 'nemo_dad.love', 'baby.joy', bg='night'), cut('부엉이가 원정대의 친구가 되었다!', 'baby.joy', 'nemo_dad.joy', 'dong_dad.warm', bg='night')],
    u_frog=[cut('개구리가 연잎 끝에서 폴짝 뛰었다. 「…도끼가 풍덩 빠지는 걸 봤어. 정직하게 말하는 모습이 멋졌어.」', 'nemo_dad.good', bg='stream'), cut('산신령(동그라미 아빠)이 금도끼, 은도끼, 쇠도끼를 나란히 놓고 웃었다. 「정직한 사람에게는 다 주마.」', 'dong_dad.warm', 'nemo_dad.joy', bg='stream'), cut('나무꾼(네모 아빠)은 쇠도끼 하나만 받아 들고 고개를 숙였다. 이웃들이 박수를 쳤다.', 'nemo_dad.love', 'nemo_mom.joy', bg='stream'), cut('개구리가 원정대의 친구가 되었다!', 'baby.joy', 'nemo_dad.joy', 'dong_dad.warm', bg='stream')],
)
TALE_LINES.update({'u_sparrow': '박 마을의 참새. 제비집 옆에서 이야기를 지켜보던 순한 이웃이 따뜻한 죽 한 숟갈에 마음을 열었어요.', 'u_owl': '노래 골짜기의 부엉이. 밤마다 노래를 엿듣던 이웃이 혹부리 영감과 함께 노래하게 되었어요.', 'u_frog': '금도끼 연못의 개구리. 정직한 나무꾼을 지켜보던 이웃이 연잎 위에서 박수를 치게 되었어요.'})
for _u in UNITS:
    if _u['id'] in TALE_LINES: _u['tale'] = TALE_LINES[_u['id']]
    assert _u.get('tale'), ('도감 한 줄 없음', _u['id'])
for _k in (217, 229, 241): assert len(STORY['pre'][_k]) == 4, ('나라 시작 이야기 4컷', _k)
for _k in ('u_sparrow', 'u_owl', 'u_frog'): assert len(STORY['recruit'][_k]) == 4, ('포섭 이야기는 4컷', _k)
