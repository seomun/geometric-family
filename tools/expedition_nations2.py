"""⑪ 4~6나라 확장(B8) — tools/expedition_slice_build.py 가 expedition_nations.py 다음에 exec 로 불러 쓴다. [제안]
4나라 브레멘 음악대 숲(37~48) · 5나라 구름 위 거인 마을(49~60) · 6나라 우렁 각시 논(61~72). 나라마다 12칸: 중간 대장(42·54·66) + 마지막 포섭 보스(48·60·72).
포섭: 허깨비 도둑(48, 번쩍 → 돌보기가 말 걸기) · 구름 거인(60, 받치기 → 번쩍) · 욕심쟁이 원님(72, 돌보기 → 받치기). 이름은 tales_cast 가족 밖 배역 표기(D13).
곡선은 1~36 과 같은 식(kbase)으로 이어 가고, tools/exp_progress_sim.js 로 완주·파밍을 확인한다."""
N_PHANTOM, N_GIANT, N_WONNIM = _outside('bremen', '허깨비 도둑'), _outside('jack', '구름 거인'), _outside('ureng', '욕심쟁이 원님')
UNITS += [
    U('u_phantom', N_PHANTOM, None, 'attacker', 'flash', 4, 'recruit', emoji='👻', note='포섭 · 4나라 마지막(숲 속 빈집에서 소리·그림자로 놀라게 하던 허깨비 도둑, 사실은 배가 고팠다)'),
    U('u_giant', N_GIANT, None, 'tank', 'support', 4, 'recruit', emoji='🌩️', note='포섭 · 5나라 마지막(쿵쿵 소리만 큰 구름 거인, 혼자라 심심했다)'),
    U('u_wonnim', N_WONNIM, None, 'mage', 'care', 4, 'recruit', emoji='👑', note='포섭 · 6나라 마지막(목소리만 큰 욕심쟁이 원님, 잔칫상을 혼자 받고 싶었다)'),
]
for _u in UNITS:
    if _u['route'] == 'recruit': assert _u['art'] is None and _u['name'] not in _FAMILY, ('포섭 대상이 가족 기본형', _u['name'])
PAL.update({
    4: [('안개 꼬마', '🌫️', 'mage', 'care'), ('발소리 꼬마', '👣', 'attacker', 'flash'), ('그림자 도둑', '🕶️', 'attacker', 'support'), ('빈집 먼지', '🏚️', 'tank', 'care'), ('촛불 꼬마', '🕯️', 'healer', 'care'), ('나뭇가지 꼬마', '🌿', 'support', 'support'), ('울음소리 꼬마', '🔔', 'mage', 'flash')],
    5: [('콩잎 꼬마', '🫛', 'support', 'support'), ('구름 솜', '☁️', 'healer', 'care'), ('번개 꼬마', '⚡', 'mage', 'flash'), ('황금 알 꼬마', '🥚', 'tank', 'support'), ('하프줄 꼬마', '🎼', 'attacker', 'flash'), ('줄기 덩굴', '🌱', 'tank', 'care'), ('바람개비 꼬마', '🎐', 'attacker', 'support')],
    6: [('논물 꼬마', '💧', 'healer', 'care'), ('우렁 껍질', '🐚', 'tank', 'support'), ('개구리 꼬마', '🐸', 'attacker', 'care'), ('볏짚 꼬마', '🌾', 'support', 'support'), ('연기 꼬마', '💨', 'mage', 'flash'), ('북소리 꼬마', '🥁', 'attacker', 'flash'), ('가마 꼬마', '🏮', 'tank', 'care')],
})
NAMES.update({
    37: '당나귀 길목', 38: '개 짖는 숲길', 39: '고양이 담장', 40: '수탉 횃대', 41: '음악대 모임', 42: '달밤 오솔길', 43: '숲 속 빈집', 44: '불빛 새는 창', 45: '식탁 아래', 46: '창문 앞 합창', 47: '한밤의 부엌', 48: '허깨비 도둑',
    49: '콩나물 뿌리', 50: '줄기 오르기', 51: '잎사귀 계단', 52: '새 둥지 터', 53: '구름 문턱', 54: '구름 마루', 55: '거인의 발자국', 56: '황금 알 곳간', 57: '하프 소리', 58: '쿵쿵 복도', 59: '거인의 식탁', 60: '구름 거인',
    61: '모내기 논둑', 62: '개구리 합창', 63: '우렁 껍질', 64: '밥상 차려진 부엌', 65: '짚 이엉 지붕', 66: '논물 거울', 67: '원님 행차 길', 68: '수상한 가마', 69: '관아 앞', 70: '나팔 소리', 71: '잔칫상 문턱', 72: '욕심쟁이 원님',
})
TIPS.update({37: '4나라: 어두운 숲의 적이에요. 돌보기(◯) 적에겐 받치기(◻)가 유리해요.', 49: '5나라: 구름 위는 번개가 잦아요. 상성이 맞는 친구를 앞에 세워요.', 61: '6나라: 논과 연못의 적이에요. 번쩍(△) 적은 돌보기(◯)가 잘 막아요.'})
BOSS.update({48: (N_PHANTOM, '👻', 'attacker', 'flash', 'u_phantom'), 60: (N_GIANT, '🌩️', 'tank', 'support', 'u_giant'), 72: (N_WONNIM, '👑', 'mage', 'care', 'u_wonnim')})
MID.update({42: ('달밤 오솔길 지킴이', '🌙', 'tank', 'care'), 54: ('구름 마루 문지기', '⛅', 'tank', 'support'), 66: ('논둑 감시꾼', '🌾', 'tank', 'flash')})
for _s in range(37, 73): STAGES.append(make(_s))
BAL['stages'] = len(STAGES); BAL['lvCapMax'] = 36      # 레벨 상한 = 10 + (깬 단계−6)/3 → 72단계까지 깨면 32(최대 36은 이후 나라용)
NATIONS += [dict(id=4, name='브레멘 음악대 숲', sub='4나라 · 한밤의 숲'), dict(id=5, name='구름 위 거인 마을', sub='5나라 · 콩나물 줄기'), dict(id=6, name='우렁 각시 논', sub='6나라 · 논과 연못')]
# 이야기: 나라 첫 단계·보스 전 · 포섭
STORY['pre'].update({
    37: [cut('음악대를 만들러 가는 길, 숲이 어둑어둑해졌다. 당나귀 한 마리가 멈춰 서서 귀를 쫑긋했다.', 'baby.surprise', 'nemo_dad.good', bg='hill'), cut('4나라 브레멘 음악대 숲. 어둠 속의 꼬마들은 돌보기(◯)가 많아요. 받치기(◻) 친구가 든든해요.', 'dong_dad.calm', 'wife.joy', bg='hill')],
    48: [cut('숲 속 빈집 창문에 불빛이 새어 나왔다. 허깨비 도둑이 소리와 그림자로 문 앞을 막고 있었다.', 'baby.surprise', 'nemo_mom.good', bg='hill'), cut('무서운 게 아니라 배가 고픈 걸지도 몰라. 돌보기(◯) 친구가 조용히 말을 걸어 보자.', 'dong_dad.calm', 'nemo_dad.good', bg='hill')],
    49: [cut('빈집 뒤 콩 한 알이 쑥쑥 자라 구름까지 닿았다. 막둥이가 줄기를 올려다보며 눈을 반짝였다.', 'baby.joy', 'nemo_kids.kid1', bg='hill'), cut('5나라 구름 위 거인 마을. 번개가 잦으니 상성이 맞는 친구를 앞에 세워요.', 'wife.joy', 'dong_dad.calm', bg='hill')],
    60: [cut('쿵쿵쿵! 구름 거인이 식탁을 두드리고 있었다. 소리만 컸지 표정은 어딘가 쓸쓸했다.', 'baby.surprise', 'nemo_dad.good', bg='hill'), cut('받치기(◻)를 이기는 번쩍(△) 친구가 말을 걸어 보자. 소리가 큰 만큼 외로웠을지도 몰라.', 'wife.joy', 'nemo_mom.good', bg='hill')],
    61: [cut('논둑길을 따라가니 개구리들이 합창을 했다. 우렁 껍질 하나가 반짝반짝 빛났다.', 'baby.joy', 'nemo_mom.good', bg='field'), cut('6나라 우렁 각시 논. 논과 연못의 적이에요. 번쩍(△) 적은 돌보기(◯)가 잘 막아요.', 'dong_dad.calm', 'wife.joy', bg='field')],
    72: [cut('잔칫상 문턱에서 욕심쟁이 원님이 팔짱을 끼고 목청을 높였다. 「이 상은 다 내 것이다!」', 'baby.surprise', 'nemo_mom.good', bg='field'), cut('목소리만 큰 걸지도 몰라. 돌보기(◯)를 이기는 받치기(◻) 친구가 조용히 말을 걸어 보자.', 'nemo_dad.good', 'dong_dad.calm', bg='field')],
})
STORY['recruit'].update(
    u_phantom=[cut('허깨비 도둑이 그림자를 거두었다. 「…사실 배가 고파서 문 앞을 서성였어. 놀라게 하려던 건 아니야.」', 'dong_dad.warm', bg='hill'), cut('동그라미 아빠가 도시락을 내밀었다. 「같이 나눠 먹어요. 소리는 그냥 노래로 내요.」', 'dong_dad.calm', 'baby.joy', bg='hill'), cut('허깨비 도둑이 원정대의 친구가 되었다!', 'baby.joy', 'nemo_mom.good', 'dong_dad.calm', bg='hill')],
    u_giant=[cut('구름 거인이 어깨를 움츠렸다. 「…쿵쿵거리면 다들 쳐다봐 주니까. 혼자 있으면 너무 조용해서.」', 'wife.joy', bg='hill'), cut('세모 아내가 손을 흔들었다. 「이제 쳐다보는 사람이 많아질 거예요. 같이 가요!」', 'wife.joy', 'baby.joy', bg='hill'), cut('구름 거인이 원정대의 친구가 되었다!', 'baby.joy', 'wife.joy', 'nemo_dad.good', bg='hill')],
    u_wonnim=[cut('욕심쟁이 원님이 헛기침을 했다. 「…잔칫상이 텅 비면 체면이 안 서서 그랬소. 나눠 먹을 줄은 몰랐지.」', 'nemo_dad.good', bg='field'), cut('네모 아빠가 웃었다. 「나누면 상이 더 푸짐해져요. 같이 가시지요.」', 'nemo_dad.good', 'baby.joy', bg='field'), cut('욕심쟁이 원님이 원정대의 친구가 되었다!', 'baby.joy', 'nemo_mom.good', 'nemo_dad.good', bg='field')],
)
# 도감 한 줄 · 수집 보상 문턱 다시 계산
TALE_LINES.update({'u_phantom': '브레멘 음악대 숲의 빈집을 지키던 허깨비 도둑. 소리·그림자만 무서웠지 배고픈 이웃이에요.', 'u_giant': '구름 위에서 쿵쿵거리던 구름 거인. 혼자라 심심해서 소리를 키웠어요.', 'u_wonnim': '목소리만 큰 욕심쟁이 원님. 잔칫상을 나누는 법을 배웠어요.'})
for _u in UNITS:
    if _u['id'] in TALE_LINES: _u['tale'] = TALE_LINES[_u['id']]
    assert _u.get('tale'), ('도감 한 줄 없음', _u['id'])
BAL['dex'] = [dict(n=5, gems=100), dict(n=10, gems=150), dict(n=15, gems=200), dict(n=20, gems=300), dict(n=len(UNITS), gems=500)]
