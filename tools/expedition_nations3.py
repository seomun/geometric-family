"""⑪ 7~9나라 확장(B13) — tools/expedition_slice_build.py 가 expedition_nations2.py 다음에 exec 로 불러 쓴다. [제안]
7나라 견우직녀 은하수 오작교(73~84) · 8나라 헨젤과 그레텔 과자 숲(85~96) · 9나라 장화 신은 고양이 성(97~108). 나라마다 12칸: 중간 대장(78·90·102) + 마지막 포섭 보스(84·96·108).
포섭: 하늘 어른(84, 받치기 → 번쩍이 말 걸기) · 과자집 할머니(96, 돌보기 → 받치기) · 변신 마법사(108, 번쩍 → 돌보기).
이름은 모두 tales_cast 의 가족 밖 배역 그대로(허브 2026-10-14 확정: 8·9나라는 새 이야기 헨젤과 그레텔(순한 판)·장화 신은 고양이). 배역 이름 [제안].
곡선: kbase 는 37 이후 같은 식(KSLOPE2) — tools/exp_progress_sim.js 로 완주·파밍 확인."""
N_SKY = _outside('gyeonwoo', '하늘 어른')
N_GRANNY, N_WIZARD = _outside('hansel', '과자집 할머니'), _outside('puss', '변신 마법사')      # 포섭 보스 이름은 여기 한 곳(배역표에서)
UNITS += [
    U('u_skyelder', N_SKY, None, 'mage', 'support', 4, 'recruit', emoji='🌌', note='포섭 · 7나라 마지막(두 사람을 갈라놓던 목소리만 큰 하늘 어른, 은하수가 너무 넓어 걱정이었다)'),
    U('u_granny', N_GRANNY, None, 'healer', 'care', 4, 'recruit', emoji='🍪', note='포섭 · 8나라 마지막(사탕을 너무 좋아해 아이들을 붙잡아 두려던 과자집 할머니, 끝엔 같이 과자를 굽는다)'),
    U('u_wizard', N_WIZARD, None, 'mage', 'flash', 4, 'recruit', emoji='🪄', note='포섭 · 9나라 마지막(뭐든 변신하다 생쥐가 되어 혼쭐난 변신 마법사, 끝엔 친구)'),
]
for _u in UNITS:
    if _u['route'] == 'recruit': assert _u['art'] is None and _u['name'] not in _FAMILY, ('포섭 대상이 가족 기본형', _u['name'])
PAL.update({
    7: [('은하수 별똥', '☄️', 'attacker', 'flash'), ('까마귀 꼬마', '🐦‍⬛', 'attacker', 'support'), ('베틀 실타래', '🧵', 'support', 'care'), ('별빛 꼬마', '✨', 'mage', 'flash'), ('구름 다리 꼬마', '🌈', 'tank', 'support'), ('소 꼬마', '🐂', 'tank', 'care'), ('달무리 꼬마', '🌙', 'healer', 'care')],
    8: [('빵 부스러기 꼬마', '🍞', 'attacker', 'flash'), ('사탕 꼬마', '🍬', 'mage', 'care'), ('쿠키 꼬마', '🍪', 'tank', 'support'), ('젤리 꼬마', '🍮', 'healer', 'care'), ('초콜릿 꼬마', '🍫', 'attacker', 'support'), ('케이크 꼬마', '🍰', 'tank', 'care'), ('설탕 꼬마', '🧂', 'support', 'flash')],
    9: [('장화 꼬마', '👢', 'attacker', 'flash'), ('모자 꼬마', '🎩', 'mage', 'support'), ('생쥐 꼬마', '🐭', 'attacker', 'care'), ('깃털 꼬마', '🪶', 'support', 'flash'), ('마차 꼬마', '🛞', 'tank', 'care'), ('열쇠 꼬마', '🗝️', 'healer', 'support'), ('거울 꼬마', '🪞', 'mage', 'flash')],
})
NAMES.update({
    73: '은하수 나루', 74: '별빛 길목', 75: '까마귀 떼', 76: '베틀 소리', 77: '소 치는 언덕', 78: '오작교 문지기', 79: '까치 다리 놓기', 80: '구름 난간', 81: '은하수 병', 82: '별똥 비', 83: '하늘 마당', 84: '하늘 어른',
    85: '과자 숲 입구', 86: '빵 부스러기 길', 87: '사탕 나무', 88: '초콜릿 개울', 89: '쿠키 오솔길', 90: '과자 문지기', 91: '젤리 연못', 92: '케이크 언덕', 93: '설탕 눈밭', 94: '오븐 앞 복도', 95: '과자집 문턱', 96: '과자집 할머니',
    97: '방앗간 앞', 98: '장화 가게', 99: '숲 오솔길', 100: '임금님 행차', 101: '강가 다리', 102: '성 문지기', 103: '정원 미로', 104: '대연회장', 105: '계단 위', 106: '탑 복도', 107: '마법 서재', 108: '변신 마법사',
})
TIPS.update({73: '7나라: 하늘 위 나라예요. 상성이 맞는 친구를 앞에 세우면 별똥도 문제없어요.', 85: '8나라: 달콤한 과자 숲의 적이에요. 돌보기(◯) 적에겐 받치기(◻) 친구가 유리해요.', 97: '9나라: 성으로 가는 길의 적이에요. 번쩍(△) 적은 돌보기(◯) 친구가 잘 막아요.'})
BOSS.update({84: (N_SKY, '🌌', 'mage', 'support', 'u_skyelder'), 96: (N_GRANNY, '🍪', 'healer', 'care', 'u_granny'), 108: (N_WIZARD, '🪄', 'mage', 'flash', 'u_wizard')})
MID.update({78: ('오작교 문지기', '🌉', 'tank', 'support'), 90: ('과자 문지기', '🥨', 'tank', 'care'), 102: ('성 문지기', '💂', 'tank', 'flash')})
for _s in range(73, 109): STAGES.append(make(_s))
BAL['stages'] = len(STAGES); BAL['lvCapMax'] = 50      # 레벨 상한 = 10 + (깬 단계−6)/3 → 108단계까지 깨면 44
NATIONS += [dict(id=7, name='견우직녀 은하수 오작교', sub='7나라 · 별이 흐르는 하늘'), dict(id=8, name='헨젤과 그레텔 과자 숲', sub='8나라 · 달콤한 숲'), dict(id=9, name='장화 신은 고양이 성', sub='9나라 · 장화와 성')]
STORY['pre'].update({
    73: [cut('칠월 칠석 밤, 하늘에 반짝이는 강이 흘렀다. 막둥이가 별을 세다가 눈을 동그랗게 떴다.', 'baby.joy', 'nemo_kids.kid1', bg='hill'), cut('강 한가운데에 까치와 까마귀가 날개를 맞대고 다리를 놓고 있었다. 세모 아내가 가슴에 손을 얹었다. 「일 년에 한 번이라니, 얼마나 보고 싶었을까요.」', 'wife.joy', 'nemo_dad.good', bg='hill'), cut('두 사람이 만나려면 오작교를 지나야 해. 우리가 길을 살펴 줄까?', 'baby.joy', 'dong_dad.calm', bg='hill'), cut('7나라 견우직녀 은하수 오작교. 하늘의 적이에요. 번쩍(△) 적은 돌보기(◯) 친구가 잘 막아요.', 'dong_dad.calm', 'wife.joy', bg='hill')],
    84: [cut('오작교 끝에 하늘 어른이 서 있었다. 목소리는 크지만 눈은 은하수 너머를 보고 있었다.', 'baby.surprise', 'nemo_mom.good', bg='hill'), cut('받치기(◻)를 이기는 번쩍(△) 친구가 말을 걸어 보자. 걱정이 많아서 그랬을지도 몰라.', 'wife.joy', 'dong_dad.calm', bg='hill')],
    85: [cut('은하수 다리를 건너자 달콤한 냄새가 났다. 숲의 나무마다 사탕과 과자가 주렁주렁 열려 있었다.', 'baby.joy', 'nemo_kids.kid3', bg='hill'), cut('세찌와 하나가 앞장섰다. 길에는 빵 부스러기가 하나씩 떨어져 있었다. 「이걸 따라가면 길 안 잃어요!」', 'nemo_kids.kid3', 'nemo_kids.kid1', bg='hill'), cut('저 멀리 설탕 가루를 뒤집어쓴 집이 보였다. 막둥이가 침을 꼴깍 삼켰다.', 'baby.surprise', 'nemo_mom.good', bg='hill'), cut('8나라 헨젤과 그레텔 과자 숲. 달콤한 적이에요. 돌보기(◯) 적에겐 받치기(◻) 친구가 유리해요.', 'dong_dad.calm', 'nemo_mom.good', bg='hill')],
    96: [cut('과자집 문 앞에서 할머니가 두 팔을 벌렸다. 「얘들아, 더 놀다 가렴! 사탕은 얼마든지 있단다.」', 'baby.surprise', 'nemo_dad.good', bg='hill'), cut('돌보기(◯)를 이기는 받치기(◻) 친구가 말을 걸어 보자. 좋아서 붙잡고 싶었을 뿐일지도 몰라.', 'nemo_mom.good', 'dong_dad.calm', bg='hill')],
    97: [cut('방앗간 앞에서 장화를 신은 고양이가 수염을 쓸며 윙크했다. 「제가 길을 안내해 드리죠!」', 'wife.joy', 'baby.joy', bg='hill'), cut('고양이는 장화를 또각또각 울리며 앞서 걸었다. 「주인님은 제게 맡기세요. 성까지 모시겠습니다!」', 'wife.joy', 'nemo_kids.kid3', bg='hill'), cut('세찌가 눈을 반짝였다. 「우리 고양이, 진짜 멋있다!」 세모 아내가 윙크로 답했다.', 'nemo_kids.kid3', 'wife.joy', bg='hill'), cut('9나라 장화 신은 고양이 성. 번쩍(△) 적은 돌보기(◯) 친구가 잘 막아요.', 'dong_dad.calm', 'nemo_dad.good', bg='hill')],
    108: [cut('마법 서재에서 변신 마법사가 사자로, 코끼리로, 용으로 변신하며 으스댔다. 「나는 뭐든 될 수 있다!」', 'baby.surprise', 'nemo_mom.good', bg='hill'), cut('번쩍(△)을 이기는 돌보기(◯) 친구가 말을 걸어 보자. 으스대는 만큼 외로웠을지도 몰라.', 'dong_dad.calm', 'wife.joy', bg='hill')],
})
STORY['recruit'].update(
    u_skyelder=[cut('하늘 어른이 헛기침을 했다. 「…은하수가 너무 넓어서, 두 사람이 영영 못 만날까 걱정했을 뿐이오.」', 'wife.joy', bg='hill'), cut('세모 아내가 웃었다. 「까치와 까마귀가 다리를 놓잖아요. 일 년에 한 번이면 충분히 설레요!」', 'wife.joy', 'baby.joy', bg='hill'), cut('은하수 위로 별똥별 하나가 길게 지나갔다. 하늘 어른이 다리 위에서 두 사람을 올려다보며 조용히 웃었다.', 'wife.joy', 'nemo_dad.good', bg='hill'), cut('하늘 어른이 원정대의 친구가 되었다!', 'baby.joy', 'wife.joy', 'dong_dad.calm', bg='hill')],
    u_granny=[cut('과자집 할머니가 앞치마를 만지작거렸다. 「…아이들이 오랜만이라, 가지 말라고 붙잡고 싶었단다.」', 'nemo_mom.good', bg='hill'), cut('네모 엄마가 반죽 그릇을 내밀었다. 「그럼 같이 구워요. 같이 먹으면 더 달아요.」', 'nemo_mom.good', 'baby.joy', bg='hill'), cut('오븐에서 고소한 냄새가 났다. 갓 구운 쿠키를 아이들이 호호 불며 나눠 먹었다.', 'baby.joy', 'nemo_kids.kid1', 'nemo_kids.kid3', bg='hill'), cut('과자집 할머니가 원정대의 친구가 되었다!', 'baby.joy', 'nemo_mom.good', 'nemo_dad.good', bg='hill')],
    u_wizard=[cut('욕심껏 변신하던 마법사가 그만 생쥐가 되어 찍찍거렸다. 고양이가 장화를 신은 채 가볍게 잡아 올렸다.', 'wife.joy', bg='hill'), cut('동그라미 아빠가 생쥐를 손바닥에 올려 주었다. 「으스대지 않아도 충분해요. 같이 가요.」', 'dong_dad.calm', 'baby.joy', bg='hill'), cut('마법사는 이제 변신 대신 박수를 쳤다. 고양이가 장화로 또각 박자를 맞추자 모두가 웃었다.', 'wife.joy', 'nemo_kids.kid3', bg='hill'), cut('변신 마법사가 원정대의 친구가 되었다!', 'baby.joy', 'wife.joy', 'dong_dad.calm', bg='hill')],
)
TALE_LINES.update({'u_skyelder': '은하수 위에서 두 사람 걱정만 하던 하늘 어른. 목소리만 컸지 다정한 어른이에요.', 'u_granny': '과자 숲의 과자집 할머니. 아이들이 좋아서 붙잡았을 뿐, 같이 과자를 굽는 다정한 이웃이에요.', 'u_wizard': '뭐든 변신하던 변신 마법사. 생쥐가 되어 혼쭐난 뒤로는 으스대지 않고 같이 다녀요.'})
for _u in UNITS:
    if _u['id'] in TALE_LINES: _u['tale'] = TALE_LINES[_u['id']]
    assert _u.get('tale'), ('도감 한 줄 없음', _u['id'])
BAL['dex'] = [dict(n=5, gems=100), dict(n=10, gems=150), dict(n=15, gems=200), dict(n=20, gems=300), dict(n=len(UNITS), gems=500)]      # 총량 1,250 그대로(문턱만 마지막이 30명으로)
for _k in (73, 85, 97): assert len(STORY['pre'][_k]) == 4, ('나라 시작 이야기 4컷', _k)
for _k in ('u_skyelder', 'u_granny', 'u_wizard'): assert len(STORY['recruit'][_k]) == 4, ('포섭 이야기는 4컷', _k)
