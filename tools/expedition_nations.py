"""⑪ 원정대 3나라 확장 데이터 — tools/expedition_slice_build.py 가 exec 로 불러 쓴다(STAGES·UNITS·STORY·BAL·E·U·cut 사용).
1나라 아기돼지 마을(1~12) · 2나라 해님 달님 고개(13~24) · 3나라 콩쥐팥쥐 마을(25~36).
나라마다 12칸: 5 일반 + 중간 보스(6·18·30) + 5 일반 + 마지막 보스(12·24·36). 포섭 보스: 6 바람 친구(기존) · 24 바람 호랑이 · 36 깐깐한 아주머니(이름은 tales_cast 의 가족 밖 배역 표기). 12 는 회오리 대장(포섭 없음).
합류: 하나(9) · 두리(15) · 세모 남편(21) · 네모 할머니(27). 모든 글은 [제안]."""
import sys as _sys; _sys.path.insert(0, 'tools')
import tales_cast as _tc
def _outside(tale, key):    # tales_cast 의 「가족 밖」 배역 표기에서 이름만(괄호 앞)
    for r in _tc.CAST[tale]:
        if r[1].startswith('out:') and key in r[0] + r[1]: return r[1][4:].split('(')[0].strip()
    raise AssertionError('배역표에 없음: %s/%s' % (tale, key))
N_WIND, N_TIGER, N_AJUMMA = _outside('pigs', '바람 친구'), _outside('sun', '바람 호랑이'), _outside('kongjwi', '깐깐한 아주머니')
UNITS += [
    U('u_tiger', N_TIGER, None, 'tank', 'care', 4, 'recruit', emoji='🐯', note='포섭 · 2나라 마지막(고갯길을 지키던 배고픈 바람 호랑이, 소리·그림자)'),
    U('u_ajumma', N_AJUMMA, None, 'mage', 'flash', 4, 'recruit', emoji='🧓', note='포섭 · 3나라 마지막(일을 시키던 깐깐한 아주머니, 잔치를 잘 치르고 싶었다)'),
]
for _u in UNITS:
    if _u['id'] == 'u_kid1': _u['note'] = '이야기 합류 · 장작 광(1나라 9번째 길)'
    if _u['id'] == 'u_kid2': _u['note'] = '이야기 합류 · 별 따는 고갯길(2나라)'
    if _u['id'] == 'u_husband': _u['note'] = '이야기 합류 · 달빛 우물가(2나라)'
    if _u['id'] == 'u_grandma': _u['note'] = '이야기 합류 · 항아리 곳간(3나라)'

# 단일 배역표(D13) 단언: 포섭 대상 이름은 배역표의 가족 밖 표기와 같고, 가족 기본형이 아니다. 뽑기 대상도 가족 기본형(성인 표기)이 아니다.
_FAMILY = {v[0] for v in _tc.ACTORS.values()}
for _u in UNITS:
    if _u['route'] == 'recruit': assert _u['art'] is None and (_u['name'] not in _FAMILY), ('포섭 대상이 가족 기본형', _u['name'])
    if _u['route'] == 'gacha': assert _u['name'] not in _FAMILY, ('뽑기 대상이 가족 기본형', _u['name'])
assert any(u['id'] == 'u_wind' and u['name'] == N_WIND for u in UNITS), ('바람 친구 이름이 배역표와 다름', N_WIND)

# 나라별 적 팔레트: (이름, 이모지, 역할, 속성)
PAL = {
    1: [('먼지 꼬마', '💨', 'attacker', 'flash'), ('낙엽 꼬마', '🍂', 'support', 'support'), ('물방울 꼬마', '💧', 'mage', 'care'), ('돌멩이 꼬마', '🪨', 'tank', 'support'), ('이슬 꼬마', '🫧', 'healer', 'care'), ('회오리 꼬마', '🌪️', 'attacker', 'flash'), ('장작 꼬마', '🪵', 'tank', 'support'), ('불씨 꼬마', '🔥', 'mage', 'flash'), ('그림자 꼬마', '🌫️', 'tank', 'care')],
    2: [('별똥 꼬마', '⭐', 'mage', 'flash'), ('달빛 꼬마', '🌙', 'healer', 'care'), ('밤 그림자', '🌑', 'tank', 'care'), ('떡 도둑 쥐', '🐭', 'attacker', 'support'), ('가지 꼬마', '🌿', 'support', 'support'), ('안개 꼬마', '☁️', 'mage', 'care'), ('번쩍 꼬마', '⚡', 'attacker', 'flash'), ('솔방울 꼬마', '🌲', 'tank', 'support')],
    3: [('항아리 꼬마', '🏺', 'tank', 'support'), ('깨진 그릇', '🥣', 'attacker', 'flash'), ('가시덤불', '🌵', 'mage', 'support'), ('두꺼비 꼬마', '🐸', 'tank', 'care'), ('짚신 꼬마', '👞', 'attacker', 'care'), ('솥뚜껑 꼬마', '🍲', 'support', 'support'), ('불꽃 꼬마', '🔥', 'mage', 'flash'), ('샘물 꼬마', '💦', 'healer', 'care')],
}
NAMES = {
    7: '짚더미 뒤', 8: '숲 속 오솔길', 9: '장작 광', 10: '늑대 발자국', 11: '굴뚝 아래', 12: '굴뚝 위 회오리',
    13: '떡 고개 어귀', 14: '밤나무 밭', 15: '별 따는 고갯길', 16: '달무리 숲', 17: '호랑이 굴 앞', 18: '구름 고개 마루',
    19: '동아줄 마을', 20: '새벽 안개', 21: '달빛 우물가', 22: '썩은 동아줄', 23: '해님 마을 어귀', 24: '바람 호랑이',
    25: '콩쥐네 마당', 26: '깨진 항아리 터', 27: '항아리 곳간', 28: '벼 베는 논', 29: '두꺼비 개울', 30: '잔칫집 담장',
    31: '짚신 길', 32: '장터 골목', 33: '불 때는 부엌', 34: '밤새 베 짜는 방', 35: '잔치 마당 앞', 36: '깐깐한 아주머니',
}
TIPS = {7: '새 적이 나와요. ↑ 표시가 있는 친구를 앞에 세워 보세요.', 13: '2나라: 밤과 별의 적이 많아요. 돌보기(◯)가 든든해요.', 25: '3나라: 항아리와 그릇이 단단해요. 번쩍(△)이 잘 먹혀요.'}
BOSS = {  # 마지막 보스: (이름, 이모지, 역할, 속성, 포섭 유닛)
    24: (N_TIGER, '🐯', 'tank', 'care', 'u_tiger'), 36: (N_AJUMMA, '🧓', 'mage', 'flash', 'u_ajumma'),
}
MID = {12: ('회오리 대장', '🌪️', 'attacker', 'flash'), 18: ('구름 고개 지킴이', '☁️', 'tank', 'care'), 30: ('잔칫집 문지기', '🏮', 'tank', 'support')}
JOIN = {9: 'u_kid1', 15: 'u_kid2', 21: 'u_husband', 27: 'u_grandma'}
ROLES5 = ['tank', 'attacker', 'mage', 'support', 'healer']


def kbase(s):            # 단계별 적 배율 기준(보정은 tools/exp_progress_sim.js 로): 12단계까지 가파르게, 이후 완만하게
    return 1.0 + 0.047 * (s - 4) if s <= 12 else 1.376 + KSLOPE * (s - 12)


KSLOPE = 0.037


def make(s):
    nat = (s - 1) // 12 + 1; pal = PAL[nat]; i = (s - 1) % 12 + 1; k0 = round(kbase(s) * KMUL, 3)
    n = 3 + (i >= 3) + (i >= 8)          # 적 수 3~5
    pool = list(pal); en = []
    start = (s * 3) % len(pool)
    for j in range(n):
        nm, em, role, el = pool[(start + j * 2) % len(pool)]
        en.append(E(nm, em, role, el, round(k0 * (0.93 + 0.04 * j), 3)))
    st = dict(id=s, name=NAMES[s], scale=1.0, gold=round(260 * 1.055 ** (s - 6)), gems=50, enemies=en)
    if s in TIPS: st['tip'] = TIPS[s]
    if s in JOIN: st['join'] = JOIN[s]
    if s in MID:
        nm, em, role, el = MID[s]; st['mid'] = True; st['gems'] = 100
        st['enemies'][1] = E(nm, em, role, el, round(k0 * 1.04, 3))
        st['enemies'][2 % len(st['enemies'])]['role'] = 'attacker' if sum(1 for e in st['enemies'] if e['role'] == 'tank') > 1 else st['enemies'][2 % len(st['enemies'])]['role']   # 탱커만 둘 이상이면 싸움이 늘어지지 않게 하나는 공격수
    if s in BOSS:
        nm, em, role, el, rc = BOSS[s]; st['boss'] = True; st['recruit'] = rc; st['gems'] = 150; st['gold'] = round(st['gold'] * 1.15)
        esc = en[:4] if len(en) >= 4 else en
        while len(esc) < 4: esc.append(E(pal[0][0], pal[0][1], pal[0][2], pal[0][3], round(k0 * 0.95, 3)))
        st['enemies'] = [esc[0], E(nm, em, role, el, round(k0 * 1.18, 3)), esc[1], esc[2], esc[3]]
        st['enemies'][1]['lock'] = 0.25
    return st


KMUL = 1.0
# 기존 6칸: 바람 친구 적에 lock 표시(데이터로 옮김)
for _e in STAGES[5]['enemies']:
    if _e['name'] == '바람 친구': _e['lock'] = 0.25
STAGES[5]['mid'] = True
# 1나라 7~12 + 2나라 + 3나라
for _s in range(7, 37): STAGES.append(make(_s))
BAL['stages'] = len(STAGES); BAL['lvCap'] = 10; BAL['lvCapFrom'] = 6; BAL['lvCapEvery'] = 3; BAL['lvCapMax'] = 24   # 레벨 상한 = 10 + (깬 단계−6)/3 — 6단계까진 10, 36단계까지 깨면 20(최대 24는 이후 나라용)

nm = lambda s: s
STORY['pre'] = {
    6: STORY.pop('stage6_pre'),
    12: [cut('굴뚝 위로 커다란 회오리가 말려 올라갔다. 바람 친구의 형뻘 되는 회오리 대장이다!', 'baby.surprise', 'nemo_dad.good', bg='hill'), cut('이번엔 말 걸 틈이 없어요. 힘을 모아 이겨야 길이 열려요.', 'wife.joy', 'dong_dad.calm', bg='hill')],
    13: [cut('아기돼지 마을을 지나자 고개가 나왔다. 해가 지고 달이 떴다. 「떡 하나 주면 안 잡아먹지!」', 'baby.surprise', 'nemo_mom.good', bg='hill'), cut('2나라 해님 달님 고개. 밤과 별의 꼬마들이 길을 막는다. 돌보기(◯)가 든든하다.', 'dong_dad.calm', 'wife.joy', bg='hill')],
    24: [cut('동아줄이 내려왔다. 그런데 고갯마루에 배고픈 호랑이가 앉아 있었다.', 'nemo_dad.good', 'baby.surprise', bg='hill'), cut('「으르렁…」 사나운 게 아니라 배가 고픈 걸지도 몰라. 받치기(◻) 친구가 곁에 가 보자.', 'nemo_mom.good', 'dong_dad.calm', bg='hill')],
    25: [cut('고개를 넘자 잔칫집이 보이는 마을. 깨진 항아리 앞에서 누가 울고 있었다.', 'baby.surprise', 'nemo_mom.good', bg='field'), cut('3나라 콩쥐팥쥐 마을. 항아리와 그릇은 단단하지만 번쩍(△)이 잘 먹혀요.', 'wife.joy', 'dong_dad.calm', bg='field')],
    36: [cut('잔치 마당 한가운데 깐깐한 아주머니가 팔짱을 끼고 서 있었다. 「이게 다 뭐니! 하나도 제대로 된 게 없잖아!」', 'baby.surprise', 'nemo_mom.good', bg='field'), cut('목소리만 큰 게 아니라 마음이 급한 걸지도 몰라. 돌보기(◯) 친구가 조용히 말을 걸어 보자.', 'dong_dad.calm', 'nemo_dad.good', bg='field')],
}
STORY['join'].update(
    u_kid1=[cut('장작 광에서 첫째 하나가 도끼를 내려놓고 손을 흔들었다.', 'nemo_kids.kid1', bg='hill'), cut('「동생들이 걱정돼서 따라나서려던 참이야. 같이 가도 되지?」', 'nemo_kids.kid1', 'baby.joy', bg='hill'), cut('하나가 원정대에 합류했다!', 'nemo_kids.kid1', 'nemo_dad.good', 'nemo_mom.good', bg='hill')],
    u_kid2=[cut('별 따는 고갯길에서 둘째 두리가 하늘을 올려다보고 있었다.', 'nemo_kids.kid2', bg='hill'), cut('「별은 못 땄지만 길은 잘 알아. 앞장서도 될까?」', 'nemo_kids.kid2', 'baby.joy', bg='hill'), cut('두리가 원정대에 합류했다!', 'nemo_kids.kid2', 'wife.joy', 'dong_dad.calm', bg='hill')],
    u_husband=[cut('달빛 우물가에서 세모 남편이 두레박을 잡고 서 있었다.', 'husband.joy', bg='hill'), cut('「물 길어 오는 길에 너희를 봤어. 이 길, 같이 걸으면 안 될까?」', 'husband.joy', 'wife.joy', bg='hill'), cut('세모 남편이 원정대에 합류했다!', 'husband.joy', 'wife.joy', 'baby.joy', bg='hill')],
    u_grandma=[cut('항아리 곳간 문이 삐걱 열리고 네모 할머니가 나왔다.', 'nemo_grandma.good', bg='field'), cut('「배고플 때 먹으라고 김치를 담가 놨지. 나도 따라가마.」', 'nemo_grandma.good', 'baby.joy', bg='field'), cut('네모 할머니가 원정대에 합류했다!', 'nemo_grandma.good', 'nemo_dad.good', 'nemo_mom.good', bg='field')],
)
STORY['recruit'].update(
    u_tiger=[cut('바람 호랑이가 배를 움켜쥐었다. 「…떡 하나 줄래? 사흘을 굶었어.」', 'nemo_mom.good', bg='hill'), cut('네모 엄마가 도시락을 꺼냈다. 「천천히 먹어요. 고갯길은 같이 넘어요.」', 'nemo_mom.good', 'nemo_dad.good', bg='hill'), cut('바람 호랑이가 원정대의 친구가 되었다!', 'baby.joy', 'nemo_mom.good', 'nemo_dad.good', bg='hill')],
    u_ajumma=[cut('아주머니가 헛기침을 했다. 「…잔치를 잘 치르고 싶어서 그랬어. 다들 처음이라 서툴러서 자꾸 소리를 질렀지.」', 'dong_dad.warm', bg='field'), cut('동그라미 아빠가 고개를 끄덕였다. 「깐깐한 만큼 꼼꼼하시잖아요. 같이 가요, 우리 길을 챙겨 주세요.」', 'dong_dad.calm', 'baby.joy', bg='field'), cut('깐깐한 아주머니가 원정대의 친구가 되었다!', 'baby.joy', 'wife.joy', 'dong_dad.calm', bg='field')],
)

NATIONS = [dict(id=1, name='아기돼지 마을', sub='1나라 · 바람과 늑대'), dict(id=2, name='해님 달님 고개', sub='2나라 · 밤과 별'), dict(id=3, name='콩쥐팥쥐 마을', sub='3나라 · 항아리와 잔치')]

# 육성 깊이(B2): 스킬 레벨 · 각성 · 등급 승급 · 장비 4칸. 규칙은 games/expedition/stage-core.js upgrade()
BAL['grow'] = dict(skillMax=5, skillMul=0.10, skillCost=[150, 400, 900, 1800], awkMax=5, awkMul=0.06, awkCost=[10, 20, 35, 55, 80], promoLv=10, promoCost={'4': 30, '5': 80}, gearSlots=['모자', '옷', '신발', '보따리'], gearMax=10, gearMul=0.005, gearBase=30, gearGrow=1.22)
