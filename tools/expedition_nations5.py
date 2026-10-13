"""⑪ 13~15나라 확장(B23) — tools/expedition_slice_build.py 가 expedition_nations4.py 다음에 exec 로 불러 쓴다. [제안]
13나라 호랑이와 곶감 산골 마을(145~156) · 14나라 빨간 모자 숲(157~168) · 15나라 피노키오 인형 마을(169~180). 나라마다 12칸: 중간 대장(150·162·174) + 마지막 포섭 보스(156·168·180).
이야기 컷의 인물은 배역표(tales_cast) 그대로(곶감: 엄마=네모 엄마·우는 아기=막둥이·곶감 아저씨=동그라미 아빠 / 빨간 모자=하나·할머니=네모 할머니 / 제페토=네모 아빠·피노키오=막둥이).
포섭은 모두 가족 밖(허브 방침): 호랑이(156, 번쩍 → 돌보기) · 늑대(168, 받치기 → 번쩍) · 여우(180, 돌보기 → 받치기). 이름은 배역표에서 읽는다(피노키오 배역표에 가족 밖 악역 「여우」 추가).
보상: 한 나라 반짝석 700(일반 9×50 + 중간 100 + 포섭 150) — D28 단계 첫 클리어 평균 ≤ 66 안쪽(tools/gem_budget.py 가 단언). 레벨 상한은 공식(10+(깬 단계−6)/3) 그대로 최대 68."""
N_TIGER2, N_WOLF, N_FOX = _outside('tigerpersimmon', '호랑이'), _outside('redhood', '늑대'), _outside('pino', '여우')
UNITS += [
    U('u_persimmon_tiger', N_TIGER2, None, 'tank', 'flash', 4, 'recruit', emoji='🐅', note='포섭 · 13나라 마지막(곶감 소리에 놀라 달아났다 돌아온 호랑이, 사실은 배가 고팠다)'),
    U('u_wolf', N_WOLF, None, 'attacker', 'support', 4, 'recruit', emoji='🐺', note='포섭 · 14나라 마지막(빨간 모자를 쫓던 늑대, 혼자라 외로워 말을 걸었다)'),
    U('u_fox', N_FOX, None, 'mage', 'care', 4, 'recruit', emoji='🦊', note='포섭 · 15나라 마지막(인형 마을의 여우, 사기꾼 흉내만 내던 순한 이웃)'),
]
for _u in UNITS:
    if _u['route'] == 'recruit': assert _u['art'] is None and _u['name'] not in _FAMILY, ('포섭 대상이 가족 기본형', _u['name'])
assert len({u['name'] for u in UNITS}) == len(UNITS), '동료 이름 중복 없음'
PAL.update({
    13: [('곶감 꼬마', '🍡', 'healer', 'care'), ('감 꼬마', '🧡', 'attacker', 'support'), ('장독 꼬마', '🏺', 'tank', 'care'), ('밤 그림자', '🌑', 'attacker', 'flash'), ('달빛 꼬마', '🌙', 'mage', 'flash'), ('짚 꼬마', '🌾', 'support', 'support'), ('소 꼬마', '🐄', 'tank', 'support')],
    14: [('솔방울 꼬마', '🌲', 'tank', 'support'), ('바구니 꼬마', '🧺', 'healer', 'care'), ('들꽃 꼬마', '🌼', 'mage', 'flash'), ('버섯 꼬마', '🍄', 'attacker', 'care'), ('빨간 두건 그림자', '🧣', 'attacker', 'flash'), ('오솔길 꼬마', '🍃', 'support', 'support'), ('나비 꼬마', '🦋', 'mage', 'care')],
    15: [('나무 조각 꼬마', '🪵', 'tank', 'support'), ('실 꼬마', '🧵', 'support', 'flash'), ('종이 코 꼬마', '👃', 'attacker', 'care'), ('톱밥 꼬마', '🪚', 'attacker', 'support'), ('별 꼬마', '⭐', 'mage', 'flash'), ('인형 극장 막', '🎭', 'healer', 'care'), ('망치 꼬마', '🔨', 'tank', 'flash')],
})
NAMES.update({
    145: '산골 마을 입구', 146: '곶감 걸린 처마', 147: '감나무 집', 148: '밤 부엌', 149: '우는 아기 방', 150: '마당 지킴이', 151: '외양간 앞', 152: '장독대 그림자', 153: '곶감 곶간', 154: '뒷산 오솔길', 155: '호랑이 굴 앞', 156: '호랑이',
    157: '숲 어귀', 158: '솔방울 길', 159: '빨간 두건 골목', 160: '들꽃 언덕', 161: '버섯 숲', 162: '숲 지킴이', 163: '큰길과 샛길', 164: '나비 계곡', 165: '숲속 표지판', 166: '할머니 댁 울타리', 167: '오두막 앞', 168: '늑대',
    169: '인형 마을 광장', 170: '톱밥 골목', 171: '제페토의 작업실', 172: '실 감는 공방', 173: '별빛 극장', 174: '극장 지킴이', 175: '종이 코 거리', 176: '망치 소리 골목', 177: '파란 요정의 계단', 178: '장난감 가게', 179: '마을 시계탑', 180: '여우',
})
TIPS.update({145: '13나라: 산골 마을의 적이에요. 번쩍(△) 적은 돌보기(◯) 친구가 잘 막아요.', 157: '14나라: 빨간 모자 숲의 적이에요. 받치기(◻) 적에겐 번쩍(△) 친구가 유리해요.', 169: '15나라: 인형 마을의 적이에요. 돌보기(◯) 적에겐 받치기(◻) 친구가 유리해요.'})
BOSS.update({156: (N_TIGER2, '🐅', 'attacker', 'flash', 'u_persimmon_tiger'), 168: (N_WOLF, '🐺', 'mage', 'support', 'u_wolf'), 180: (N_FOX, '🦊', 'attacker', 'care', 'u_fox')})
MID.update({150: ('마당 지킴이', '🐕', 'tank', 'care'), 162: ('숲 지킴이', '🦉', 'tank', 'support'), 174: ('극장 지킴이', '🎪', 'tank', 'flash')})
for _s in range(145, 181): STAGES.append(make(_s))
BAL['stages'] = len(STAGES); BAL['lvCapMax'] = 68      # 레벨 상한 = 10 + (깬 단계−6)/3 → 180단계까지 깨면 68
NATIONS += [dict(id=13, name='호랑이와 곶감 산골 마을', sub='13나라 · 곶감과 밤'), dict(id=14, name='빨간 모자 숲', sub='14나라 · 큰길과 샛길'), dict(id=15, name='피노키오 인형 마을', sub='15나라 · 나무 인형과 별')]
STORY['pre'].update({
    145: [cut('산골 마을에 해가 저물었다. 처마마다 곶감이 주렁주렁 걸려 있었다.', 'nemo_mom.good', 'baby.joy', bg='hill'), cut('「엄마, 곶감이다!」 막둥이가 손뼉을 쳤다. 곶감 아저씨(동그라미 아빠)가 허허 웃었다.', 'baby.joy', 'dong_dad.warm', bg='hill'), cut('뒷산에서 호랑이 소리가 난다는 소문이 마을에 돌았다. 하나가 주먹을 꼭 쥐었다.', 'nemo_kids.kid1', 'nemo_kids.kid3', bg='hill'), cut('13나라 호랑이와 곶감 산골 마을. 번쩍(△) 적은 돌보기(◯) 친구가 잘 막아요.', 'dong_dad.calm', 'wife.joy', bg='hill')],
    156: [cut('호랑이 굴 앞에 큰 그림자가 앉아 있었다. 곶감 소리만 들어도 움찔했다.', 'baby.surprise', 'nemo_mom.good', bg='hill'), cut('번쩍(△)을 이기는 돌보기(◯) 친구가 말을 걸어 보자. 사납게 구는 게 아니라 배가 고파서 그런 걸지도 몰라.', 'dong_dad.calm', 'baby.joy', bg='hill')],
    157: [cut('산을 내려오니 울창한 숲이 펼쳐졌다. 솔방울이 우수수 떨어졌다.', 'nemo_kids.kid1', 'baby.joy', bg='hill'), cut('「할머니 댁에 심부름 가는 길이야.」 하나가 빨간 모자를 꾹 눌러 썼다.', 'nemo_kids.kid1', 'nemo_mom.good', bg='hill'), cut('네모 할머니가 보따리를 싸 주며 당부했다. 「큰길로만 다녀라. 샛길은 예쁘지만 길을 잃는단다.」', 'nemo_grandma.good', 'nemo_kids.kid1', bg='hill'), cut('14나라 빨간 모자 숲. 받치기(◻) 적에겐 번쩍(△) 친구가 유리해요.', 'dong_dad.calm', 'wife.joy', bg='hill')],
    168: [cut('오두막 앞 나무 뒤에서 늑대가 쭈뼛쭈뼛 걸어 나왔다. 꼬리가 땅에 닿을 듯 처져 있었다.', 'baby.surprise', 'nemo_grandma.good', bg='hill'), cut('받치기(◻)를 이기는 번쩍(△) 친구가 말을 걸어 보자. 쫓으려던 게 아니라 같이 놀고 싶었던 걸지도 몰라.', 'wife.joy', 'nemo_kids.kid1', bg='hill')],
    169: [cut('숲을 지나자 작은 마을이 나왔다. 가게마다 나무 인형이 줄지어 서 있었다.', 'baby.joy', 'nemo_dad.good', bg='hill'), cut('제페토(네모 아빠)가 작업실에서 손을 흔들었다. 「막 새 인형을 깎았어요. 이름은 피노키오!」', 'nemo_dad.joy', 'baby.joy', bg='hill'), cut('인형 마을에는 거짓말을 하면 코가 길어진다는 이야기가 있었다. 두리가 코를 만져 보았다.', 'nemo_kids.kid2', 'nemo_kids.kid1', bg='hill'), cut('15나라 피노키오 인형 마을. 돌보기(◯) 적에겐 받치기(◻) 친구가 유리해요.', 'dong_dad.calm', 'wife.joy', bg='hill')],
    180: [cut('시계탑 아래에서 여우가 모자를 벗고 인사했다. 눈은 반짝이는데 어깨는 조금 움츠러 있었다.', 'baby.surprise', 'nemo_dad.good', bg='hill'), cut('돌보기(◯)를 이기는 받치기(◻) 친구가 말을 걸어 보자. 사기꾼 흉내를 내 봤지만 사실은 친구가 필요했던 걸지도 몰라.', 'nemo_dad.joy', 'dong_dad.calm', bg='hill')],
})
STORY['recruit'].update(
    u_persimmon_tiger=[cut('호랑이가 고개를 떨구었다. 「…곶감이라는 게 얼마나 무서운 건지 궁금해서 왔어요. 사실은 배가 고팠어요.」', 'dong_dad.warm', bg='hill'), cut('동그라미 아빠가 곶감 한 조각을 내밀었다. 「무서운 거 아니에요. 달아요, 한번 드셔 봐요.」', 'dong_dad.warm', 'baby.joy', bg='hill'), cut('호랑이가 곶감을 한 입 먹고 눈을 동그랗게 떴다. 아기도 따라서 곶감을 한 입 쏙.', 'baby.joy', 'nemo_mom.good', bg='hill'), cut('호랑이가 원정대의 친구가 되었다!', 'baby.joy', 'dong_dad.calm', 'nemo_mom.good', bg='hill')],
    u_wolf=[cut('늑대가 귀를 눕혔다. 「…혼자라 심심해서 말을 걸었는데, 무섭게 들렸나 봐요.」', 'wife.joy', bg='hill'), cut('세모 아내가 윙크를 하며 말했다. 「그럼 이제 같이 걸어요. 큰길로요!」', 'wife.joy', 'nemo_kids.kid1', bg='hill'), cut('할머니가 오두막에서 따뜻한 수프를 내왔다. 늑대도 하나도 한 그릇씩 둘러앉았다.', 'nemo_grandma.good', 'nemo_kids.kid1', bg='hill'), cut('늑대가 원정대의 친구가 되었다!', 'baby.joy', 'wife.joy', 'nemo_kids.kid1', bg='hill')],
    u_fox=[cut('여우가 모자를 가슴에 안았다. 「…사기꾼 흉내만 냈어요. 같이 놀 친구가 하나도 없어서요.」', 'nemo_dad.joy', bg='hill'), cut('제페토(네모 아빠)가 웃으며 손을 내밀었다. 「거짓말이 아니라면, 오늘부터 친구예요. 코도 안 길어지고요.」', 'nemo_dad.joy', 'baby.joy', bg='hill'), cut('피노키오가 여우 모자 위에 별 하나를 얹어 주었다. 인형들이 줄지어 박수를 쳤다.', 'baby.joy', 'nemo_dad.good', bg='hill'), cut('여우가 원정대의 친구가 되었다!', 'baby.joy', 'nemo_dad.joy', 'dong_dad.calm', bg='hill')],
)
TALE_LINES.update({'u_persimmon_tiger': '산골 마을의 호랑이. 곶감이 무서운 줄 알았는데 달콤하다는 걸 알고 순해졌어요.', 'u_wolf': '빨간 모자 숲의 늑대. 같이 놀고 싶어서 말을 걸었다가 큰길을 함께 걷는 이웃이 되었어요.', 'u_fox': '인형 마을의 여우. 사기꾼 흉내만 내던 외톨이가 별 하나를 선물받고 친구가 되었어요.'})
for _u in UNITS:
    if _u['id'] in TALE_LINES: _u['tale'] = TALE_LINES[_u['id']]
    assert _u.get('tale'), ('도감 한 줄 없음', _u['id'])
for _k in (145, 157, 169): assert len(STORY['pre'][_k]) == 4, ('나라 시작 이야기 4컷', _k)
for _k in ('u_persimmon_tiger', 'u_wolf', 'u_fox'): assert len(STORY['recruit'][_k]) == 4, ('포섭 이야기는 4컷', _k)
