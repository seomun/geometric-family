"""⑪ 16~18나라 확장(B25) — tools/expedition_slice_build.py 가 expedition_nations5.py 다음에 exec 로 불러 쓴다. [제안]
16나라 눈의 여왕 눈 나라(181~192) · 17나라 개미와 베짱이 여름 들판(193~204) · 18나라 토끼와 거북이 결승선 길(205~216). 나라마다 12칸: 중간 대장(186·198·210) + 마지막 포섭 보스(192·204·216).
이야기 컷의 인물은 배역표(tales_cast) 그대로(눈의 여왕: 카이=막둥이·게르다=하나(눈의 여왕은 글로만 — 동그라미 엄마 그림이 아직 없다) / 개미=네모 엄마·베짱이=세모 남편·이웃=동그라미 아빠 / 거북이=네모 아빠·토끼=동그라미 아빠·심판=세모 남편).
포섭은 모두 가족 밖(허브 방침): 눈 까마귀(192, 번쩍 → 돌보기) · 매미(204, 번쩍 → 돌보기 아님: 받치기 → 번쩍) · 두루미(216, 받치기 → 번쩍). 이름은 배역표에서 읽는다(세 이야기에 가족 밖 배역을 추가).
보상: 한 나라 반짝석 700(일반 9×50 + 중간 100 + 포섭 150) — D28 단가(단계 첫 클리어 평균 ≤ 66) 안쪽, 나라를 더할수록 평균이 내려간다. 디즈니 고유 요소(귀뚜라미 캐릭터 등)는 쓰지 않는다(허브 지시)."""
N_CROW, N_CICADA, N_CRANE = _outside('snowqueen', '눈 까마귀'), _outside('ant', '매미'), _outside('hare', '두루미')
UNITS += [
    U('u_snowcrow', N_CROW, None, 'attacker', 'care', 4, 'recruit', emoji='🐦‍⬛', note='포섭 · 16나라 마지막(눈 나라 길을 아는 까마귀, 눈보라 속에서 길 잃은 친구를 지켜보던 순한 안내자)'),
    U('u_cicada', N_CICADA, None, 'healer', 'flash', 4, 'recruit', emoji='🪲', note='포섭 · 17나라 마지막(여름 내내 노래하던 매미, 겨울 곳간 앞에서 쭈뼛거리던 이웃)'),
    U('u_crane', N_CRANE, None, 'tank', 'support', 4, 'recruit', emoji='🦢', note='포섭 · 18나라 마지막(결승선을 지키던 두루미 심판, 승부보다 모두의 완주를 바란다)'),
]
for _u in UNITS:
    if _u['route'] == 'recruit': assert _u['art'] is None and _u['name'] not in _FAMILY, ('포섭 대상이 가족 기본형', _u['name'])
assert len({u['name'] for u in UNITS}) == len(UNITS), '동료 이름 중복 없음'
PAL.update({
    16: [('눈 결정 꼬마', '❄️', 'mage', 'flash'), ('얼음 거울 조각', '🪞', 'attacker', 'care'), ('눈보라 꼬마', '🌨️', 'attacker', 'support'), ('고드름 꼬마', '🧊', 'tank', 'flash'), ('썰매 꼬마', '🛷', 'support', 'care'), ('눈송이 꼬마', '☃️', 'healer', 'support'), ('성 문 그림자', '🏰', 'tank', 'care')],
    17: [('개미 꼬마', '🐜', 'support', 'support'), ('곡식 꼬마', '🌾', 'healer', 'care'), ('여름 볕 꼬마', '☀️', 'mage', 'flash'), ('풀잎 꼬마', '🌿', 'attacker', 'care'), ('소나기 꼬마', '🌦️', 'mage', 'care'), ('곳간 먼지', '🏚️', 'tank', 'support'), ('노래 꼬마', '🎶', 'attacker', 'flash')],
    18: [('출발선 꼬마', '🚩', 'attacker', 'flash'), ('그늘 꼬마', '🌳', 'tank', 'care'), ('낮잠 꼬마', '💤', 'support', 'support'), ('먼지길 꼬마', '💨', 'attacker', 'support'), ('결승 리본', '🎀', 'mage', 'flash'), ('물병 꼬마', '🧴', 'healer', 'care'), ('발자국 꼬마', '👣', 'tank', 'flash')],
})
NAMES.update({
    181: '눈 나라 입구', 182: '얼음 거울 광장', 183: '눈보라 오솔길', 184: '썰매 고개', 185: '유리 장미 정원', 186: '성 문 지킴이', 187: '눈꽃 복도', 188: '거울 조각 방', 189: '꽁꽁 언 우물', 190: '털 목도리 숲', 191: '북쪽 문턱', 192: '눈 까마귀',
    193: '여름 들판 입구', 194: '개미 길', 195: '곡식 밭', 196: '소나기 처마', 197: '풀잎 그늘', 198: '곳간 지킴이', 199: '노래하는 언덕', 200: '해바라기 길', 201: '겨울 채비 마당', 202: '곳간 문 앞', 203: '노을 들판', 204: '매미',
    205: '출발선', 206: '먼지 길', 207: '그늘 쉼터', 208: '낮잠 나무', 209: '언덕 오르막', 210: '결승선 지킴이', 211: '물병 마당', 212: '발자국 오솔길', 213: '박수 언덕', 214: '결승 리본 길', 215: '마지막 모퉁이', 216: '두루미',
})
TIPS.update({181: '16나라: 눈 나라의 적이에요. 번쩍(△) 적은 돌보기(◯) 친구가 잘 막아요.', 193: '17나라: 여름 들판의 적이에요. 받치기(◻) 적에겐 번쩍(△) 친구가 유리해요.', 205: '18나라: 결승선 길의 적이에요. 돌보기(◯) 적에겐 받치기(◻) 친구가 유리해요.'})
BOSS.update({192: (N_CROW, '🐦‍⬛', 'mage', 'care', 'u_snowcrow'), 204: (N_CICADA, '🪲', 'attacker', 'flash', 'u_cicada'), 216: (N_CRANE, '🦢', 'mage', 'support', 'u_crane')})
MID.update({186: ('성 문 지킴이', '🏰', 'tank', 'flash'), 198: ('곳간 지킴이', '🐞', 'tank', 'care'), 210: ('결승선 지킴이', '🏁', 'tank', 'support')})
for _s in range(181, 217): STAGES.append(make(_s))
BAL['stages'] = len(STAGES); BAL['lvCapMax'] = 80      # 레벨 상한 = 10 + (깬 단계−6)/3 → 216단계까지 깨면 80
NATIONS += [dict(id=16, name='눈의 여왕 눈 나라', sub='16나라 · 거울 조각과 눈꽃'), dict(id=17, name='개미와 베짱이 여름 들판', sub='17나라 · 곡식과 노래'), dict(id=18, name='토끼와 거북이 결승선 길', sub='18나라 · 느리지만 끝까지')]
STORY['pre'].update({
    181: [cut('북쪽 끝에 눈 나라가 보였다. 얼음 거울 조각이 하늘에서 반짝반짝 떨어졌다.', 'baby.joy', 'nemo_kids.kid1', bg='hill'), cut('「카이(막둥이)의 눈에 거울 조각이 들어갔대.」 게르다(하나)가 장갑을 꼭 끼었다.', 'nemo_kids.kid1', 'baby.surprise', bg='hill'), cut('눈의 여왕은 사나운 사람이 아니라 혼자 얼음 성에 사는 외로운 이웃이라고 했다.', 'dong_dad.calm', 'nemo_mom.good', bg='hill'), cut('16나라 눈의 여왕 눈 나라. 번쩍(△) 적은 돌보기(◯) 친구가 잘 막아요.', 'dong_dad.calm', 'wife.joy', bg='hill')],
    192: [cut('눈 속에서 까마귀 한 마리가 폴짝폴짝 다가왔다. 「이쪽이 성 가는 길이야… 혼자 가면 길 잃어.」', 'baby.surprise', 'nemo_kids.kid1', bg='hill'), cut('돌보기(◯)를 이기는 받치기(◻) 친구가 말을 걸어 보자. 길을 알려 주고 싶었던 걸지도 몰라.', 'nemo_mom.good', 'dong_dad.calm', bg='hill')],
    193: [cut('눈이 녹고 초록 들판이 나왔다. 개미(네모 엄마)가 곡식 낟알을 한 알씩 옮기고 있었다.', 'nemo_mom.joy', 'baby.joy', bg='hill'), cut('베짱이(세모 남편)는 풀잎 위에서 노래하다 손을 흔들었다. 「같이 놀자!」', 'husband.joy', 'nemo_kids.kid2', bg='hill'), cut('이웃(동그라미 아빠)은 둘을 번갈아 보며 웃었다. 일도 노래도 다 좋은 여름이었다.', 'dong_dad.warm', 'nemo_mom.good', bg='hill'), cut('17나라 개미와 베짱이 여름 들판. 받치기(◻) 적에겐 번쩍(△) 친구가 유리해요.', 'dong_dad.calm', 'wife.joy', bg='hill')],
    204: [cut('곳간 앞 풀 위에 매미가 앉아 있었다. 날개는 반짝이는데 목소리는 작았다.', 'baby.surprise', 'nemo_mom.good', bg='hill'), cut('번쩍(△)을 이기는 돌보기(◯) 친구가 말을 걸어 보자. 여름 내내 노래하다 겨울이 걱정된 걸지도 몰라.', 'wife.joy', 'dong_dad.calm', bg='hill')],
    205: [cut('들판 끝에 출발선이 그어져 있었다. 거북이(네모 아빠)가 천천히 발을 내밀었다.', 'nemo_dad.joy', 'baby.joy', bg='hill'), cut('토끼(동그라미 아빠)는 폴짝 뛰며 말했다. 「나는 금방 가니까 먼저 쉴게!」', 'dong_dad.good', 'nemo_kids.kid3', bg='hill'), cut('심판(세모 남편)이 호루라기를 불었다. 「자, 모두 끝까지 가는 거야!」', 'husband.joy', 'nemo_dad.good', bg='hill'), cut('18나라 토끼와 거북이 결승선 길. 돌보기(◯) 적에겐 받치기(◻) 친구가 유리해요.', 'dong_dad.calm', 'wife.joy', bg='hill')],
    216: [cut('결승선 위에 두루미가 한 발로 서 있었다. 긴 목을 갸웃하며 우리를 보았다.', 'baby.surprise', 'nemo_dad.good', bg='hill'), cut('받치기(◻)를 이기는 번쩍(△) 친구가 말을 걸어 보자. 승부보다 모두 완주하기를 바라는 걸지도 몰라.', 'wife.joy', 'husband.joy', bg='hill')],
})
STORY['recruit'].update(
    u_snowcrow=[cut('까마귀가 날개를 접었다. 「…눈보라 속에서 길 잃는 친구들을 많이 봤어. 그래서 따라다니기만 했어.」', 'nemo_mom.good', bg='hill'), cut('네모 엄마가 목도리를 풀어 까마귀 목에 둘러 주었다. 「이제 우리랑 같이 가요. 따뜻하게.」', 'nemo_mom.joy', 'nemo_kids.kid1', bg='hill'), cut('게르다(하나)와 카이(막둥이)가 손을 맞잡고 까마귀가 알려 준 길로 걸었다. 거울 조각은 눈 녹듯 사라졌다.', 'nemo_kids.kid1', 'baby.joy', bg='hill'), cut('눈 까마귀가 원정대의 친구가 되었다!', 'baby.joy', 'nemo_kids.kid1', 'nemo_mom.joy', bg='hill')],
    u_cicada=[cut('매미가 날개를 파르르 떨었다. 「…여름엔 노래만 했는데, 겨울엔 뭘 먹을지 몰라서 못 다가갔어요.」', 'husband.worry', bg='hill'), cut('개미(네모 엄마)가 곳간 문을 열어 주었다. 「노래도 일이야. 겨울엔 같이 나누자.」', 'nemo_mom.joy', 'husband.joy', bg='hill'), cut('베짱이(세모 남편)가 매미와 함께 노래하자 곳간 앞이 작은 음악회가 되었다.', 'husband.joy', 'baby.joy', bg='hill'), cut('매미가 원정대의 친구가 되었다!', 'baby.joy', 'nemo_mom.joy', 'husband.joy', bg='hill')],
    u_crane=[cut('두루미가 날개를 내렸다. 「…누가 이기든 상관없어. 모두 완주하는 걸 보고 싶었을 뿐이야.」', 'husband.joy', bg='hill'), cut('심판(세모 남편)이 호루라기를 두루미에게 건넸다. 「그럼 같이 불어요. 끝까지 가는 사람 모두에게.」', 'husband.joy', 'nemo_dad.good', bg='hill'), cut('거북이(네모 아빠)가 결승선을 지나자 토끼(동그라미 아빠)가 박수를 치며 달려왔다. 모두가 한 줄로 웃었다.', 'nemo_dad.love', 'dong_dad.warm', bg='hill'), cut('두루미가 원정대의 친구가 되었다!', 'baby.joy', 'husband.joy', 'nemo_dad.joy', bg='hill')],
)
TALE_LINES.update({'u_snowcrow': '눈 나라의 까마귀. 길 잃은 친구들을 몰래 지켜보던 순한 안내자가 목도리 하나에 마음을 열었어요.', 'u_cicada': '여름 들판의 매미. 노래만 하다 겨울이 걱정되던 이웃이 곳간 문 앞에서 같이 노래하게 되었어요.', 'u_crane': '결승선의 두루미 심판. 승부보다 모두의 완주를 바라던 친구가 호루라기를 함께 불게 되었어요.'})
for _u in UNITS:
    if _u['id'] in TALE_LINES: _u['tale'] = TALE_LINES[_u['id']]
    assert _u.get('tale'), ('도감 한 줄 없음', _u['id'])
for _k in (181, 193, 205): assert len(STORY['pre'][_k]) == 4, ('나라 시작 이야기 4컷', _k)
for _k in ('u_snowcrow', 'u_cicada', 'u_crane'): assert len(STORY['recruit'][_k]) == 4, ('포섭 이야기는 4컷', _k)
