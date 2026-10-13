"""⑪ 10~12나라 확장(B20) — tools/expedition_slice_build.py 가 expedition_nations3.py 다음에 exec 로 불러 쓴다. [제안]
10나라 선녀와 나무꾼 연못 숲(109~120) · 11나라 토끼전 용궁 바닷길(121~132) · 12나라 은혜 갚은 까치 숲(133~144). 나라마다 12칸: 중간 대장(114·126·138) + 마지막 포섭 보스(120·132·144).
이야기 컷의 인물은 배역표(tales_cast) 그대로(나무꾼=네모 아빠·선녀=세모 아내·토끼=하나·거북=네모 아빠·용왕=동그라미 아빠·선비=네모 아빠 …).
포섭은 모두 가족 밖(허브 방침): 사슴(120, 받치기 → 번쩍이 말 걸기) · 용궁 문지기(132, 번쩍 → 돌보기) · 구렁이(144, 돌보기 → 받치기). 이름은 배역표에서 읽는다.
곡선: 37 이후와 같은 식(KSLOPE2) — tools/exp_progress_sim.js. 레벨 상한 최대 60(144단계 때 56)."""
N_DEER, N_GATE, N_SNAKE = _outside('fairywood', '사슴'), _outside('rabbitliver', '용궁 문지기'), _outside('magpie', '구렁이')
UNITS += [
    U('u_deer', N_DEER, None, 'healer', 'care', 4, 'recruit', emoji='🦌', note='포섭 · 10나라 마지막(숲 입구를 지키던 사슴, 사냥꾼을 피해 숨어 지내다 마음을 연다)'),
    U('u_gatekeeper', N_GATE, None, 'tank', 'support', 4, 'recruit', emoji='🦀', note='포섭 · 11나라 마지막(용궁 문 앞에서 목소리만 키우던 문지기, 외로운 용왕님을 지키느라 경계했다)'),
    U('u_snake', N_SNAKE, None, 'attacker', 'flash', 4, 'recruit', emoji='🐍', note='포섭 · 12나라 마지막(둥지를 올려다보던 구렁이, 사실은 따뜻한 곳이 그리웠다)'),
]
for _u in UNITS:
    if _u['route'] == 'recruit': assert _u['art'] is None and _u['name'] not in _FAMILY, ('포섭 대상이 가족 기본형', _u['name'])
assert len({u['name'] for u in UNITS}) == len(UNITS), '동료 이름 중복 없음'
PAL.update({
    10: [('연못 꼬마', '💧', 'healer', 'care'), ('날개옷 꼬마', '👘', 'support', 'flash'), ('나뭇가지 꼬마', '🌿', 'attacker', 'support'), ('보름달 꼬마', '🌕', 'mage', 'flash'), ('사냥 그물 꼬마', '🕸️', 'tank', 'care'), ('도토리 꼬마', '🌰', 'attacker', 'care'), ('이슬 꼬마', '🫧', 'mage', 'support')],
    11: [('조개 꼬마', '🐚', 'tank', 'support'), ('해초 꼬마', '🌊', 'healer', 'care'), ('물고기 꼬마', '🐟', 'attacker', 'flash'), ('게 꼬마', '🦀', 'attacker', 'support'), ('진주 꼬마', '🦪', 'mage', 'care'), ('용궁 등불', '🏮', 'mage', 'flash'), ('거품 꼬마', '🫧', 'support', 'care')],
    12: [('까치 꼬마', '🐦‍⬛', 'attacker', 'support'), ('둥지 꼬마', '🪺', 'tank', 'care'), ('종소리 꼬마', '🔔', 'mage', 'flash'), ('낙엽 꼬마', '🍂', 'support', 'support'), ('감나무 꼬마', '🌳', 'tank', 'support'), ('빈집 먼지', '🏚️', 'attacker', 'flash'), ('이슬 꼬마', '💧', 'healer', 'care')],
})
NAMES.update({
    109: '연못 가는 길', 110: '사슴이 숨은 숲', 111: '바위 위 날개옷', 112: '보름달 연못', 113: '사냥 그물 길', 114: '숲 입구 문지기', 115: '나무꾼의 오두막', 116: '장작 마당', 117: '선녀 마을', 118: '하늘 계단', 119: '둥근 달 아래', 120: '사슴',
    121: '바닷가 모래밭', 122: '조개 마을', 123: '해초 숲', 124: '물결 문턱', 125: '진주 곳간', 126: '용궁 정문 지킴이', 127: '산호 복도', 128: '등불 회랑', 129: '용왕의 침소 앞', 130: '해초 전 잔칫상', 131: '거북 등 길', 132: '용궁 문지기',
    133: '까치 둥지 길', 134: '감나무 마을', 135: '빈집 마당', 136: '종소리 숲', 137: '이슬 고개', 138: '둥지 문지기', 139: '낙엽 오솔길', 140: '선비의 방', 141: '밤의 대청', 142: '종탑 아래', 143: '새벽 마당', 144: '구렁이',
})
TIPS.update({109: '10나라: 연못 숲의 적이에요. 돌보기(◯) 적에겐 받치기(◻) 친구가 유리해요.', 121: '11나라: 바닷속 나라의 적이에요. 번쩍(△) 적은 돌보기(◯) 친구가 잘 막아요.', 133: '12나라: 까치 숲의 적이에요. 상성이 맞는 친구를 앞에 세워요.'})
BOSS.update({120: (N_DEER, '🦌', 'mage', 'care', 'u_deer'), 132: (N_GATE, '🦀', 'tank', 'support', 'u_gatekeeper'), 144: (N_SNAKE, '🐍', 'attacker', 'flash', 'u_snake')})
MID.update({114: ('숲 입구 문지기', '🦉', 'tank', 'care'), 126: ('용궁 정문 지킴이', '🦐', 'tank', 'flash'), 138: ('둥지 문지기', '🦅', 'tank', 'support')})
for _s in range(109, 145): STAGES.append(make(_s))
BAL['stages'] = len(STAGES); BAL['lvCapMax'] = 60      # 레벨 상한 = 10 + (깬 단계−6)/3 → 144단계까지 깨면 56
NATIONS += [dict(id=10, name='선녀와 나무꾼 연못 숲', sub='10나라 · 보름달 연못'), dict(id=11, name='토끼전 용궁 바닷길', sub='11나라 · 바닷속 나라'), dict(id=12, name='은혜 갚은 까치 숲', sub='12나라 · 까치 둥지 마을')]
STORY['pre'].update({
    109: [cut('단풍 든 숲 너머로 맑은 연못이 반짝였다. 세모 남편이 장작을 지고 앞장섰다.', 'husband.joy', 'baby.joy', bg='hill'), cut('「사슴이 연못 쪽으로 가라고 알려 주던데?」 하나가 숲길을 가리켰다.', 'nemo_kids.kid1', 'baby.joy', bg='hill'), cut('보름달이 뜨면 선녀들이 내려온다는 전설이 있는 연못이었다. 세모 아내가 눈을 반짝였다.', 'wife.joy', 'nemo_kids.kid2', bg='hill'), cut('10나라 선녀와 나무꾼 연못 숲. 돌보기(◯) 적에겐 받치기(◻) 친구가 유리해요.', 'dong_dad.calm', 'nemo_mom.good', bg='hill')],
    120: [cut('숲 입구에 큰 사슴이 서 있었다. 뿔이 달빛에 은빛으로 빛났다.', 'baby.surprise', 'husband.joy', bg='hill'), cut('돌보기(◯)를 이기는 받치기(◻) 친구가 말을 걸어 보자. 사냥꾼을 피해 숨어 지내서 낯선 이를 경계하는 걸지도 몰라.', 'wife.joy', 'dong_dad.calm', bg='hill')],
    121: [cut('연못을 지나 바닷가로 나왔다. 토끼(하나)가 파도 소리에 귀를 쫑긋 세웠다.', 'nemo_kids.kid1', 'baby.joy', bg='hill'), cut('거북이 아빠가 등을 내밀었다. 「용궁까지 천천히 모셔다 드릴게요.」', 'nemo_dad.joy', 'nemo_kids.kid1', bg='hill'), cut('용왕님(동그라미 아빠)이 몸져누웠다는 소문이 바닷속에 퍼져 있었다.', 'dong_dad.warm', 'baby.surprise', bg='hill'), cut('11나라 토끼전 용궁 바닷길. 번쩍(△) 적은 돌보기(◯) 친구가 잘 막아요.', 'dong_dad.calm', 'wife.joy', bg='hill')],
    132: [cut('용궁 문 앞에서 문지기가 큰 소리로 막아섰다. 「용왕님은 쉬셔야 한다!」', 'baby.surprise', 'nemo_dad.joy', bg='hill'), cut('받치기(◻)를 이기는 번쩍(△) 친구가 말을 걸어 보자. 용왕님이 걱정돼서 그럴지도 몰라.', 'nemo_mom.good', 'dong_dad.calm', bg='hill')],
    133: [cut('바닷길을 벗어나자 뭍의 가을 숲이 나타났다. 감나무마다 까치 둥지가 걸려 있었다.', 'baby.joy', 'nemo_dad.good', bg='hill'), cut('「까치가 울면 반가운 손님이 온댔지.」 네모 엄마가 웃으며 바구니를 고쳐 들었다.', 'nemo_mom.good', 'baby.joy', bg='hill'), cut('선비(네모 아빠)가 지나가다 구렁이를 쫓아 준 이야기가 마을에 전해지고 있었다.', 'nemo_dad.joy', 'nemo_kids.kid3', bg='hill'), cut('12나라 은혜 갚은 까치 숲. 상성이 맞는 친구를 앞에 세워요.', 'dong_dad.calm', 'wife.joy', bg='hill')],
    144: [cut('빈집 마당 한가운데 구렁이가 똬리를 틀고 있었다. 눈빛은 날카로운데 몸은 조금 떨렸다.', 'baby.surprise', 'nemo_dad.good', bg='hill'), cut('번쩍(△)을 이기는 돌보기(◯) 친구가 말을 걸어 보자. 사납게 구는 게 아니라 추워서 그런 걸지도 몰라.', 'nemo_mom.good', 'dong_dad.calm', bg='hill')],
})
STORY['recruit'].update(
    u_deer=[cut('사슴이 고개를 숙였다. 「…사냥꾼이 무서워서 숨어 지냈어요. 여러분은 해치지 않을 줄 알았는데.」', 'husband.good', bg='hill'), cut('세모 남편이 장작을 내려놓고 웃었다. 「저는 장작만 해요. 사슴 친구는 언제나 환영이에요.」', 'husband.good', 'baby.joy', bg='hill'), cut('사슴이 연못 쪽을 가리켰다. 보름달 아래 날개옷 한 벌이 바람에 하늘거렸다.', 'wife.joy', 'baby.surprise', bg='hill'), cut('사슴이 원정대의 친구가 되었다!', 'baby.joy', 'husband.joy', 'wife.joy', bg='hill')],
    u_gatekeeper=[cut('문지기가 집게를 내렸다. 「…용왕님이 외로워서 앓으시는데, 아무나 들이면 더 힘드실까 봐.」', 'dong_dad.warm', bg='hill'), cut('동그라미 아빠(용왕님)가 침소 문을 열고 웃었다. 「이 손님들과 한 상 하면 나을 것 같구나.」', 'dong_dad.warm', 'baby.joy', bg='hill'), cut('해초 전과 조개국이 한 상 가득. 토끼도 거북이도 문지기도 둘러앉았다.', 'nemo_kids.kid1', 'nemo_dad.joy', bg='hill'), cut('용궁 문지기가 원정대의 친구가 되었다!', 'baby.joy', 'nemo_kids.kid1', 'dong_dad.calm', bg='hill')],
    u_snake=[cut('구렁이가 똬리를 풀었다. 「…둥지가 따뜻해 보여서 올려다봤을 뿐이야. 해치려던 건 아니야.」', 'nemo_dad.good', bg='hill'), cut('네모 아빠가 담요를 건넸다. 「이거 덮고 같이 가요. 따뜻한 곳은 나눠 쓰는 거예요.」', 'nemo_dad.good', 'baby.joy', bg='hill'), cut('까치들이 종을 치며 구렁이 머리 위를 한 바퀴 돌았다. 화해의 인사 같았다.', 'baby.joy', 'nemo_mom.good', bg='hill'), cut('구렁이가 원정대의 친구가 되었다!', 'baby.joy', 'nemo_mom.good', 'nemo_dad.good', bg='hill')],
)
TALE_LINES.update({'u_deer': '보름달 연못 숲의 사슴. 숨어 지내던 겁 많은 친구가 장작 아빠 곁에서 마음을 열었어요.', 'u_gatekeeper': '용궁 문 앞의 문지기. 용왕님을 걱정하느라 큰소리를 냈지만 한 상 앞에선 순한 이웃이에요.', 'u_snake': '까치 숲 빈집의 구렁이. 따뜻한 곳이 그리웠을 뿐, 담요를 덮고 나서는 순한 이웃이에요.'})
for _u in UNITS:
    if _u['id'] in TALE_LINES: _u['tale'] = TALE_LINES[_u['id']]
    assert _u.get('tale'), ('도감 한 줄 없음', _u['id'])
for _k in (109, 121, 133): assert len(STORY['pre'][_k]) == 4, ('나라 시작 이야기 4컷', _k)
for _k in ('u_deer', 'u_gatekeeper', 'u_snake'): assert len(STORY['recruit'][_k]) == 4, ('포섭 이야기는 4컷', _k)
