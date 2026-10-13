"""⑪ 기하학 원정대 S0 슬라이스 데이터 — data/expedition_slice.json (games/25_EXPEDITION_GDD1.md §12). 모든 글은 [제안]. python tools/expedition_slice_build.py"""
import json, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
chars = json.load(open('data/chars.json', encoding='utf-8'))
EL = {'support': dict(icon='◻', name='받치기', family='네모', color='#F08A3C'), 'flash': dict(icon='△', name='번쩍', family='세모', color='#E5334A'), 'care': dict(icon='◯', name='돌보기', family='동그라미', color='#3B6FD6')}
ROLE = {'tank': dict(icon='🛡️', name='든든이', skill='든든 막기'), 'attacker': dict(icon='⚔️', name='번쩍이', skill='번쩍 한 방'), 'mage': dict(icon='✨', name='휘익이', skill='휘익 전체'), 'healer': dict(icon='💗', name='토닥이', skill='토닥토닥'), 'support': dict(icon='📣', name='힘내기', skill='힘내기')}
U = lambda i, name, art, role, el, grade, route, **kw: dict(id=i, name=name, art=art, role=role, el=el, grade=grade, route=route, **kw)
UNITS = [  # 호칭은 단일 배역표(tools/tales_cast.py ACTORS)의 성인 표기 — ⑪은 12+ 일반 앱이라 웹툰 호칭(D26 후속 지시)
    # 시작 5명(가족 기본형, 확정)
    U('u_nemo_dad', '네모 아빠', 'nemo_dad.good', 'tank', 'support', 3, 'start'), U('u_semo_wife', '세모 아내', 'wife.joy', 'attacker', 'flash', 3, 'start'), U('u_dong_dad', '동그라미 아빠', 'dong_dad.calm', 'mage', 'care', 3, 'start'),
    U('u_nemo_mom', '네모 엄마', 'nemo_mom.good', 'healer', 'support', 3, 'start'), U('u_baby', '막둥이', 'baby.joy', 'support', 'support', 3, 'start'),
    # 이야기 합류(확정): 가족 기본형은 뽑기로 팔지 않는다
    U('u_kid3', '세찌', 'nemo_kids.kid3', 'tank', 'support', 4, 'story', note='이야기 합류 · 벽돌집 공사장(셋째 돼지)'),
    U('u_kid1', '하나', 'nemo_kids.kid1', 'support', 'support', 4, 'story', note='이야기 합류(다음 나라)'), U('u_kid2', '두리', 'nemo_kids.kid2', 'mage', 'support', 4, 'story', note='이야기 합류(다음 나라)'),
    U('u_husband', '세모 남편', 'husband.joy', 'attacker', 'flash', 4, 'story', note='이야기 합류(다음 나라)'), U('u_grandma', '네모 할머니', 'nemo_grandma.good', 'healer', 'support', 4, 'story', note='이야기 합류(다음 나라)'),
    # 포섭(확정)
    U('u_wind', '바람 친구', None, 'attacker', 'flash', 4, 'recruit', emoji='🌬️', note='포섭 · 바람 친구(가족 밖, 장난을 그만두고 친구가 됨)'),
    # 모집(뽑기): 옛이야기 의상 버전과 옛이야기 캐릭터 — 가족 본인은 뽑기에 없다
    U('u_nolbu_husband', '놀부 세모 남편', 'husband.wink', 'attacker', 'flash', 5, 'gacha', pickup=True, costume='흥부와 놀부'), U('u_heungbu_dad', '흥부 네모 아빠', 'nemo_dad.love', 'healer', 'support', 5, 'gacha', costume='흥부와 놀부'), U('u_sun_hana', '해님 하나', 'nemo_kids.kid1', 'mage', 'support', 5, 'gacha', costume='해님 달님'),
    U('u_puss_wife', '장화 신은 세모 아내', 'wife.joy', 'attacker', 'support', 5, 'gacha', costume='장화 신은 고양이', banner='puss'),
    U('u_woodcutter_dad', '나무꾼 네모 아빠', 'nemo_dad.joy', 'tank', 'support', 4, 'gacha', costume='금도끼 은도끼'), U('u_bear_dong', '큰 곰 동그라미 아빠', 'dong_dad.warm', 'tank', 'care', 4, 'gacha', costume='세 마리 곰'), U('u_ant_mom', '개미 네모 엄마', 'nemo_mom.joy', 'healer', 'support', 4, 'gacha', costume='개미와 베짱이'), U('u_dokkaebi', '도깨비', None, 'attacker', 'flash', 4, 'gacha', emoji='👹', costume='혹부리 영감'),
    U('u_swallow', '제비', None, 'healer', 'care', 3, 'gacha', emoji='🐦', costume='흥부와 놀부'), U('u_toad', '두꺼비', None, 'tank', 'care', 3, 'gacha', emoji='🐸', costume='콩쥐팥쥐'), U('u_magpie', '까치', None, 'support', 'flash', 3, 'gacha', emoji='🐦‍⬛', costume='견우와 직녀'), U('u_fairy', '요정', None, 'mage', 'care', 3, 'gacha', emoji='🧚', costume='구두장이와 요정'),
]
for u in UNITS:
    if u['art']: assert u['art'] in chars, u['art']
E = lambda name, emoji, role, el, k: dict(name=name, emoji=emoji, role=role, el=el, k=k)
STAGES = [
    dict(id=1, name='볏짚집 앞', scale=1.0, gold=50, enemies=[E('먼지 꼬마', '💨', 'attacker', 'flash', 0.55), E('낙엽 꼬마', '🍂', 'support', 'support', 0.55), E('물방울 꼬마', '💧', 'mage', 'care', 0.5)], tip='상성: 번쩍 → 받치기 → 돌보기 → 번쩍'),
    dict(id=2, name='나무집 앞', scale=2.0, gold=70, enemies=[E('먼지 꼬마', '💨', 'attacker', 'flash', 0.62), E('그림자 꼬마', '🌫️', 'tank', 'care', 0.6), E('낙엽 꼬마', '🍂', 'support', 'support', 0.6), E('물방울 꼬마', '💧', 'mage', 'care', 0.58)]),
    dict(id=3, name='벽돌집 공사장', scale=1.5, gold=100, join='u_kid3', enemies=[E('돌멩이 꼬마', '🪨', 'tank', 'support', 0.7), E('먼지 꼬마', '💨', 'attacker', 'flash', 0.68), E('물방울 꼬마', '💧', 'mage', 'care', 0.66), E('낙엽 꼬마', '🍂', 'support', 'support', 0.66), E('이슬 꼬마', '🫧', 'healer', 'care', 0.66)]),
    dict(id=4, name='바람 소리', scale=1.35, gold=140, enemies=[E('그림자 꼬마', '🌫️', 'tank', 'care', 0.8), E('회오리 꼬마', '🌪️', 'attacker', 'flash', 0.78), E('물방울 꼬마', '💧', 'mage', 'care', 0.76), E('낙엽 꼬마', '🍂', 'support', 'support', 0.76), E('이슬 꼬마', '🫧', 'healer', 'care', 0.76)]),
    dict(id=5, name='굴뚝 위', scale=1.25, gold=190, enemies=[E('돌멩이 꼬마', '🪨', 'tank', 'support', 0.9), E('회오리 꼬마', '🌪️', 'attacker', 'flash', 0.9), E('번개 꼬마', '⚡', 'mage', 'flash', 0.88), E('낙엽 꼬마', '🍂', 'support', 'support', 0.86), E('이슬 꼬마', '🫧', 'healer', 'care', 0.86)]),
    dict(id=6, name='바람 친구', scale=1.3, gold=260, boss=True, recruit='u_wind', enemies=[E('그림자 꼬마', '🌫️', 'tank', 'care', 0.9), E('바람 친구', '🌬️', 'attacker', 'flash', 1.0), E('번개 꼬마', '⚡', 'mage', 'flash', 0.9), E('낙엽 꼬마', '🍂', 'support', 'support', 0.88), E('이슬 꼬마', '🫧', 'healer', 'care', 0.88)]),
]
cut = lambda text, *ch, bg='field', mini=None: dict(bg=bg, text=text, chars=list(ch), **({'mini': mini} if mini else {}))
STORY = dict(
    prologue=[cut('아기돼지 삼형제 마을에 바람이 슝슝 불었다. 막둥이가 지붕이 날아가는 걸 보았다!', 'baby.surprise', 'nemo_kids.kid3'),
              cut('세모 아내가 앞으로 나섰다. 「내가 번쩍 막아 볼게!」 번쩍은 네모를, 네모는 동그라미를, 동그라미는 번쩍을 이겨요.', 'wife.joy', 'baby.joy', mini=dict(app='expedition', k='triangle')),
              cut('동그라미 아빠가 고개를 끄덕였다. 「같이 가요, 우리 원정대.」 첫 걸음은 볏짚집 앞이에요.', 'dong_dad.calm', 'nemo_dad.good', 'nemo_mom.good', 'baby.joy')],
    join=dict(u_kid3=[cut('벽돌집 공사장에서 셋째 돼지 세찌가 손을 흔들었다.', 'nemo_kids.kid3', bg='hill'), cut('「바람이 불어도 안 무너지게 튼튼히 지었어. 같이 가도 될까?」', 'nemo_kids.kid3', 'baby.joy', bg='hill'), cut('세찌가 원정대에 합류했다!', 'nemo_kids.kid3', 'nemo_dad.good', 'wife.joy', bg='hill')]),
    recruit=dict(u_wind=[cut('바람 친구가 멈칫했다. 「나는 그냥… 같이 놀고 싶었어. 날려 보내면 쳐다봐 줄 줄 알았거든.」', 'dong_dad.warm', bg='hill'), cut('동그라미 아빠가 조용히 말했다. 「그럼 같이 가요. 지붕은 이제 우리가 같이 고쳐요.」', 'dong_dad.calm', 'baby.joy', bg='hill'), cut('바람 친구가 원정대의 친구가 되었다!', 'baby.joy', 'wife.joy', 'dong_dad.calm', bg='hill')]),
    stage6_pre=[cut('바람 친구는 사나운 것이 아니었다. 힘이 약해지면 마음을 열지도 몰라. 상성이 맞는 친구가 말을 걸어 보자.', 'baby.surprise', 'dong_dad.calm', bg='hill')])
GACHA = dict(cost=150, ten=1425, rates=dict(five=0.025, four=0.135, three=0.84), soft=60, softUp=0.06, hard=80, pickup=dict(id='u_husband', share=0.5), banners=[dict(id='main', name='아기돼지 마을 모집', pickup='u_nolbu_husband'), dict(id='puss', name='장화 신은 고양이', pickup='u_puss_wife')], startGems=1500, clearGems=150, banner='아기돼지 마을 모집', note='슬라이스: 무상 반짝석만 · 결제 없음 · 판정은 이 기기에서(정식은 서버)')
for _st in STAGES:
    for _e in _st['enemies']: _e['k'] = round(_e['k'] * _st['scale'], 3)
BAL = dict(lvMul=0.065, gradeMul={'3': 1.0, '4': 1.2, '5': 1.45}, costBase=25, costGrow=1.15, lvCap=10, stages=len(STAGES), startGold=0, persuadeAt=0.3)
exec(open('tools/expedition_nations.py', encoding='utf-8').read())   # 3나라 확장(36칸)
exec(open('tools/expedition_nations2.py', encoding='utf-8').read())   # 4~6나라 확장(72칸, B8)
exec(open('tools/expedition_nations3.py', encoding='utf-8').read())   # 7~9나라 확장(108칸, B13)
exec(open('tools/expedition_nations4.py', encoding='utf-8').read())   # 10~12나라 확장(144칸, B20)
exec(open('tools/expedition_begin.py', encoding='utf-8').read())   # 초보자 미션 30·출석 7일(B11)
exec(open('tools/expedition_daily.py', encoding='utf-8').read())   # 일일 임무 3 + 주간 상자(B22)
exec(open('tools/expedition_events.py', encoding='utf-8').read())   # 계절 이벤트 스테이지 틀(B9)
exec(open('tools/expedition_ach.py', encoding='utf-8').read())   # 업적·칭호(B10)
exec(open('tools/expedition_reserve.py', encoding='utf-8').read())   # 새 옛이야기 코스튬 동료 6종 — 풀 밖 보관(B17)
exec(open('tools/expedition_lines.py', encoding='utf-8').read())   # 동료 로비 대사 2줄씩(B21)
import os
if os.path.exists('data/expedition_odds.json'): GACHA['effective'] = json.load(open('data/expedition_odds.json', encoding='utf-8'))['effective']   # tools/odds_effective.js 산출(실효 확률)
D = dict(version=1, note='[제안] ⑪ 슬라이스 데이터. tools/expedition_slice_build.py 로 생성', el=EL, role=ROLE, units=UNITS, stages=STAGES, nations=NATIONS, dungeon=DUNGEON, loot=LOOT_CODES, story=STORY, gacha=GACHA, bal=BAL, reserve=RESERVE)
json.dump(D, open('data/expedition_slice.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('units', len(UNITS), 'stages', len(STAGES), 'chars used', sorted({u['art'] for u in UNITS if u['art']}))
