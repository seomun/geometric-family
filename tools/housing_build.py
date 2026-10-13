"""「우리 집」 2.0 데이터 (games/26_HOUSING2.md §5·§6·§9) — python tools/housing_build.py (멱등)
1) data/room_items.json 의 각 가구에 cozy·tags·style·color·src(어디서 얻나) 필드를 더한다(기존 필드·id·no 는 그대로).
2) data/housing.json: 집 레벨표·방(해금·놓을 칸)·집 이야기 장(성인 8·유아 5)·손님. 모든 글은 [제안].
출처(src)는 각 앱 코드의 보상 표(REW·TIER)와 data/idle_props.json 에서 읽어 만든다 — 보상 표를 두 번 쓰지 않는다. 가구는 정확히 한 출처를 가진다(단언)."""
import json, re, io, sys, collections
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
J = lambda p: json.load(open(p, encoding='utf-8'))
R = J('data/room_items.json'); items = R['items']; byid = {i['id']: i for i in items}
APPN = {'merge': '합치기', 'spot': '틀린 그림', 'block': '블록', 'sort': '정리', 'tile': '짝 맞추기', 'day': '막둥이의 하루', 'idle': '세 가족 식탁', 'quiz': '어느 도형', 'color': '색칠북', 'playground': '놀이터'}
APPK = {'merge': 'merge', 'spot': 'spot', 'block': 'block', 'sort': 'sort', 'tile': 'tile', 'day': 'day', 'tables': 'idle', 'idle': 'idle', 'quiz': 'quiz', 'coloring': 'color', 'playground': 'playground', 'all': 'event'}
SRC = {}


def rew(app):
    s = open(f'games/{app}/{app}.js', encoding='utf-8').read(); m = re.search(r'const REW = \{([^}]*)\}', s)
    return {v: int(k) for k, v in re.findall(r"(\d+):\s*'([a-z_0-9]+)'", m.group(1))}


for app in ['spot', 'block', 'sort', 'tile', 'day']:
    for iid, n in rew(app).items(): SRC[iid] = dict(game=app, kind='level', n=n, hint=f'{APPN[app]} {n}판')
CN = ['네모', '세모', '동그라미']
for k, v in re.findall(r"'(\d:\d)': \{ item: '([a-z_0-9]+)' \}", open('games/merge/merge.js', encoding='utf-8').read()):
    c, t = map(int, k.split(':')); SRC[v] = dict(game='merge', kind='tier', c=c, t=t, hint=f'합치기 · {CN[c]} {t}단계 조각 만들기')
for p in J('data/idle_props.json')['props']:
    if p['id'] in byid: SRC[p['id']] = dict(game='idle', kind='prop', hint=f"식탁 · {p['hint']}")
for i in items:
    iid = i['id']
    if iid in SRC: continue
    if iid.startswith('q_plate_') or iid.startswith('q_type_'): SRC[iid] = dict(game='quiz', kind='result', hint='어느 도형 · 테스트 결과')
    elif iid == 'n_plate': SRC[iid] = dict(game='quiz', kind='first', hint='어느 도형 · 처음 열면')
    elif iid.startswith('q_game_'): SRC[iid] = dict(game='quiz', kind='mini', hint='어느 도형 · 미니게임 별 2개')
    elif i.get('needPages'): SRC[iid] = dict(game='color', kind='pages', n=i['needPages'], hint=f"색칠북 · 그림 {i['needPages']}장 완성")
    elif iid == 'w_frame': SRC[iid] = dict(game='color', kind='first', n=1, hint='색칠북 · 첫 그림 완성')
    elif iid in ('k_party', 'k_train'): SRC[iid] = dict(game='playground', kind='chapter', n=1 if iid == 'k_party' else 2, hint=f"놀이터 · {1 if iid == 'k_party' else 2}장 끝")
    elif iid.startswith('k_ch'): n = int(iid[4:]); SRC[iid] = dict(game='playground', kind='chapter', n=n, hint=f'놀이터 · {n}장 끝')
    elif re.match(r't_[a-z]+_[ak]$', iid): SRC[iid] = dict(game='story', kind='card', hint='이야기 카드 4장 모으기(그 옛이야기)')
    elif iid.startswith('s_'): SRC[iid] = dict(game='event', kind='season', hint='시즌 이벤트(놓쳐도 다시 열려요)')
    elif iid in ('b_bed', 'b_rug'): SRC[iid] = dict(game='merge', kind='tier', hint='합치기 · 아이 방 가구(합치기 보상)')
    else: SRC[iid] = dict(game=APPK.get(i['game'], i['game']), kind='other', hint=f"{APPN.get(APPK.get(i['game'], i['game']), '')} 보상")
assert all(i['id'] in SRC for i in items), [i['id'] for i in items if i['id'] not in SRC]
# 태그·스타일·색
TAG_RULES = [('sit', r'sofa|chair|bench|stool|mat|rug|평상|의자|소파|방석|벤치|러그'), ('eat', r'table|bowl|rice|lunch|kimchi|tea|ramen|plate|식탁|그릇|밥|도시락|김치|찻잔|라면|수저'), ('read', r'shelf|book|diary|album|책|서재|일기|앨범'),
             ('sleep', r'bed|pillow|quilt|moon|침대|베개|이불'), ('play', r'toy|ball|duck|train|swing|block|k_|장난감|공|오리|기차|그네'), ('watch', r'tv|photo|frame|camera|window|액자|사진|TV|창문')]
STYLE = {'build': 'warm', 'kitchen': 'warm', 'photo': 'cool', 'outer': 'wood', 'yardlife': 'wood', 'storage': 'cool', 'kid': 'kids', 'daybath': 'kids', 'wall': 'kids', 'badge': 'festive', 'season': 'festive', 'story_a': 'festive', 'story_k': 'festive'}
def hue(c):
    c = c.lstrip('#'); r, g, b = int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16); mx, mn = max(r, g, b), min(r, g, b)
    if mx - mn < 28: return 'white' if mx > 200 else ('gray' if mx > 90 else 'dark')
    if mx == r: return 'peach' if g > b and g - b > 40 and r > 220 else ('pink' if b > g else 'red')
    if mx == g: return 'green'
    return 'sky' if g > r else 'purple'
BASE = {'floor': 6, 'wall': 4, 'table': 3}
n_levels = {}
for i in items:
    s = SRC[i['id']]; name = i['name'] + ' ' + i['id']
    i['cozy'] = BASE[i['slot']] + (2 if i['w'] >= 80 else 0) + (3 if i['set'] in ('story_a', 'story_k') else 0) + (1 if s.get('n', 0) >= 40 or s.get('t', 0) >= 6 else 0)
    i['tags'] = [t for t, rx in TAG_RULES if re.search(rx, name, re.I)][:2]
    i['style'] = STYLE.get(i['set'], 'warm'); i['color'] = hue(i['colors'][0]); i['src'] = SRC[i['id']]
json.dump(R, open('data/room_items.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
tot = sum(i['cozy'] for i in items); print('items', len(items), 'cozy 합', tot)

# ------------------------------ housing.json ------------------------------
T = lambda n: round(9.2 * (n - 1) ** 1.6)
levels = [dict(lv=n, cozy=T(n)) for n in range(1, 31)]
ROOMS = [  # id, 이름, 그룹, 해금 레벨, 벽색, 바닥색, 놓을 칸 [(slot,x,y,want)]
    ('nemo', '네모네 거실', 'adult', 1, '#FFE3C2', '#E3B27F', [('floor', 95, 240, 'b_table'), ('floor', 225, 244, 'b_sofa'), ('wall', 100, 92, 'a_frame'), ('wall', 300, 108, 'u_shelf')]),
    ('kitchen', '네모네 주방', 'adult', 3, '#FFF1C9', '#D9B98A', [('floor', 60, 235, 't_bowl'), ('floor', 210, 225, 'u_fridge'), ('table', 120, 190, 'p_rice'), ('wall', 250, 50, 'u_sidedish')]),
    ('semo', '세모네 신혼집', 'adult', 5, '#D8F0FF', '#C9D8E8', [('wall', 60, 40, 'a_map'), ('floor', 200, 235, 'b_suitcase'), ('table', 110, 195, 'p_world'), ('floor', 40, 232, 'b_lamp')]),
    ('dong', '동그라미네 서재', 'adult', 8, '#E2E6FA', '#B9BFD8', [('floor', 40, 225, 'b_shelf'), ('floor', 200, 236, 'p_chair'), ('wall', 150, 40, 'b_clock'), ('floor', 270, 232, 'b_globe')]),
    ('yard', '마당·골목', 'adult', 10, '#CFEFFF', '#A9D68E', [('floor', 40, 236, 'o_fence'), ('floor', 150, 240, 'm_bench'), ('floor', 260, 232, 'o_mailbox'), ('floor', 200, 220, 'm_garden')]),
    ('entrance', '현관', 'adult', 12, '#F4E4D0', '#C8A47A', [('wall', 100, 50, 'n_plate'), ('floor', 40, 232, 'u_shoerack'), ('wall', 230, 60, 'q_plate_nemo')]),
    ('upstairs', '2층', 'adult', 15, '#FDE8F0', '#E5C7B0', [('floor', 40, 232, 'b_bed'), ('floor', 200, 236, 'u_closet'), ('wall', 130, 40, 'a_diary')]),
    ('roof', '옥상', 'adult', 20, '#BFE6FF', '#C9C2B8', [('floor', 60, 236, 's_tree'), ('floor', 200, 238, 't_pigs_a')]),
    ('kid', '아이 방', 'kid', 1, '#FFF0B8', '#F2C98A', [('floor', 50, 236, 'k_train'), ('wall', 150, 40, 'w_frame'), ('floor', 220, 236, 'y_cup')]),
    ('wardrobe', '옷방', 'kid', 3, '#FFE0E8', '#E8C7A8', [('wall', 80, 45, 'y_hanger'), ('wall', 200, 50, 'y_hat'), ('floor', 150, 236, 'k_party')]),
    ('dining', '밥 먹는 곳', 'kid', 6, '#E8F5C8', '#D8B98A', [('floor', 60, 236, 'y_bowl'), ('table', 170, 195, 'y_spoon'), ('floor', 250, 236, 'k_ch3')]),
    ('toyroom', '장난감 방', 'kid', 9, '#D8ECFF', '#C8D8B8', [('floor', 60, 236, 'y_toybox'), ('floor', 180, 240, 'y_ball'), ('floor', 270, 232, 'k_ch5')]),
    ('bath', '욕실·잠자리', 'kid', 12, '#DDF3F8', '#B8D8E8', [('floor', 60, 238, 'y_mat'), ('floor', 200, 236, 'y_pillow'), ('table', 240, 195, 'y_soap')]),
]
def mkrooms(g): return [dict(id=r[0], name=r[1], group=r[2], unlock=r[3], wall=r[4], floor=r[5], anchors=[dict(id=f'{r[0]}_{k}', slot=a[0], x=a[1], y=a[2], want=a[3]) for k, a in enumerate(r[6], 1)]) for r in ROOMS if r[2] == g]
# 집 이야기 장 (각색은 [제안] — 원고: content/seeds/author/ , 허브 매칭: 거실=저녁 식사·최악의 날 / 세모네=파리목숨②(세계 일주 상상) / 서재=저녁 식사 빈 의자·상갓집 / 마당=다음 모임 / 아이 방=축구화)
N, SEMO, DONG, KID1, KID2, KID3, BABY, MOM, DAD = 'nemo_dad.joy', 'wife.joy', 'dong_dad.warm', 'nemo_kids.kid1', 'nemo_kids.kid2', 'nemo_kids.kid3', 'baby.joy', 'nemo_mom.joy', 'nemo_dad.joy'
def cut(text, *chars, bg='indoor2'): return dict(bg=bg, text=text, chars=list(chars))
STORY = [
    dict(ch=1, room='nemo', group='adult', title='일곱 식구가 앉을 자리', tasks=[('t1', ['b_table'], '큰 상'), ('t2', ['a_frame'], '벽 액자'), ('t3', ['u_shelf'], '벽 선반'), ('t4', ['b_sofa'], '소파'), ('t5', ['b_drawer'], '서랍장')],
         cuts=[cut('빈 거실. 네모 아빠가 짐 상자 사이에 서서 말했다. 「일곱이 앉으려면 큰 상부터네.」', N, MOM), cut('상을 놓자 아이들이 우르르 모였다. 막내가 와락 안겼다.', BABY, KID3), cut('시끌시끌한 저녁. 이게 제일 좋은 하루인지도 모른다.', N, MOM, BABY, KID1)], reward=dict(cozy=20, unlock='kitchen')),
    dict(ch=2, room='kitchen', group='adult', title='엄마의 밥상', tasks=[('t1', ['t_bowl'], '밥그릇'), ('t2', ['u_fridge'], '냉장고'), ('t3', ['p_rice'], '밥솥'), ('t4', ['u_sidedish'], '반찬통 선반'), ('t5', ['p_kimchi'], '김장 김치')],
         cuts=[cut('엄마가 부엌을 둘러봤다. 「밥을 해 먹어야 집이지.」', MOM), cut('밥솥에서 김이 나자 식구들이 슬금슬금 모였다.', MOM, N, KID1), cut('같이 먹는 밥 한 끼. 말이 필요 없다.', N, MOM, BABY)], reward=dict(cozy=25, unlock='semo')),
    dict(ch=3, room='semo', group='adult', title='둘만의 여행 기념품 벽', tasks=[('t1', ['b_suitcase'], '여행 가방'), ('t2', ['a_map'], '옛 지도'), ('t3', ['p_world'], '세계일주 지도'), ('t4', ['b_lamp'], '세모 램프'), ('t5', ['a_camera'], '필름 카메라')],
         cuts=[cut('세모네 신혼집은 아직 휑했다. 세모 남편이 벽을 보며 웃었다. 「여기에 유럽, 저기엔 남미.」', 'husband.joy', SEMO, bg='indoor'), cut('가방을 놓고 지도를 붙이니, 둘은 벌써 비행기 안에 앉은 것 같았다.', 'husband.joy', SEMO, bg='indoor'), cut('「다음엔 어디 갈까요?」 둘만의 계획이 벽에 가득 찼다.', 'husband.joy', SEMO, bg='indoor')], reward=dict(cozy=30, unlock='dong')),
    dict(ch=4, room='dong', group='adult', title='빈 의자 하나', tasks=[('t1', ['b_shelf'], '책장'), ('t2', ['p_chair'], '네 번째 의자'), ('t3', ['b_clock'], '벽시계'), ('t4', ['b_globe'], '지구본'), ('t5', ['p_book'], '책')],
         cuts=[cut('동그라미 서재는 조용하고 정돈됐다. 의자 하나만 비어 있었다.', DONG, bg='indoor'), cut('아들이 의자를 끌어다 놓았다. 「아빠, 같이 먹어요.」', DONG, 'dong_dad.good', bg='indoor'), cut('조용한 서재에 처음으로 사람 소리가 났다.', DONG, 'dong_dad.good', bg='indoor')], reward=dict(cozy=35, unlock='yard')),
    dict(ch=5, room='yard', group='adult', title='다음 모임은 우리 집 마당에서', tasks=[('t1', ['o_fence'], '담장'), ('t2', ['m_bench'], '평상'), ('t3', ['o_mailbox'], '우체통'), ('t4', ['m_garden'], '텃밭'), ('t5', ['o_gate'], '대문')],
         cuts=[cut('「다음 모임은 우리 집에서 하자.」 세 사람이 마당을 보았다.', N, SEMO, DONG, bg='field'), cut('평상을 놓고 담장을 세우니 골목이 정겨워졌다.', N, DONG, bg='field'), cut('이 나이엔 그냥 건강하면 된다. 마당에 웃음이 퍼졌다.', N, SEMO, DONG, bg='field')], reward=dict(cozy=40, unlock='entrance')),
    dict(ch=6, room='entrance', group='adult', title='우리 집 이름', tasks=[('t1', ['n_plate'], '도형 문패'), ('t2', ['u_shoerack'], '신발장'), ('t3', ['q_plate_nemo'], '네모 문패'), ('t4', ['o_doghouse'], '강아지 집')],
         cuts=[cut('문패를 달면 비로소 우리 집이다.', N, MOM, bg='home'), cut('신발이 가지런히 놓였다.', N, MOM, bg='home')], reward=dict(cozy=45, unlock='upstairs')),
    dict(ch=7, room='upstairs', group='adult', title='아이들이 크면', tasks=[('t1', ['b_bed'], '네모 침대'), ('t2', ['u_closet'], '옷장'), ('t3', ['a_diary'], '일기장'), ('t4', ['b_rug'], '동그라미 러그')],
         cuts=[cut('2층엔 아이들 자리가 필요하다. 축구화 신고 뛰어다닐 아이들 자리.', MOM, KID3), cut('이불을 깔자 아이들이 먼저 누웠다.', KID1, KID2, KID3)], reward=dict(cozy=50, unlock='roof')),
    dict(ch=8, room='roof', group='adult', title='계절이 오는 집', tasks=[('t1', ['s_tree'], '연말 트리'), ('t2', ['t_pigs_a'], '벽돌집 미니어처'), ('t3', ['t_bears_a'], '곰 세 식구 의자')],
         cuts=[cut('옥상에서 내려다보니 우리 집이 가득 찼다.', N, MOM, SEMO, DONG, bg='night'), cut('계절이 바뀔 때마다 이 집에 새 이야기가 놓일 것이다.', N, SEMO, DONG, bg='night')], reward=dict(cozy=60, unlock=None)),
    dict(ch=1, room='kid', group='kid', title='막둥이의 첫 방', tasks=[('t1', ['k_train'], '기차'), ('t2', ['y_cup'], '칫솔 컵'), ('t3', ['w_frame'], '내 그림 액자')], cuts=[cut('', BABY, KID1, bg='home'), cut('', BABY, MOM, bg='home')], reward=dict(cozy=15, unlock='wardrobe')),
    dict(ch=2, room='wardrobe', group='kid', title='옷방', tasks=[('t1', ['y_hanger'], '옷걸이'), ('t2', ['y_hat'], '모자걸이'), ('t3', ['k_party'], '잔칫집')], cuts=[cut('', BABY, MOM, bg='home')], reward=dict(cozy=20, unlock='dining')),
    dict(ch=3, room='dining', group='kid', title='밥 먹는 곳', tasks=[('t1', ['y_bowl'], '밥그릇'), ('t2', ['y_spoon'], '수저 통'), ('t3', ['k_ch3'], '무 인형')], cuts=[cut('', BABY, DAD, bg='home')], reward=dict(cozy=25, unlock='toyroom')),
    dict(ch=4, room='toyroom', group='kid', title='장난감 방', tasks=[('t1', ['y_toybox'], '장난감 상자'), ('t2', ['y_ball'], '공 바구니'), ('t3', ['k_ch5'], '도형 블록')], cuts=[cut('', BABY, KID3, bg='home')], reward=dict(cozy=30, unlock='bath')),
    dict(ch=5, room='bath', group='kid', title='욕실·잠자리', tasks=[('t1', ['y_mat'], '욕실 발판'), ('t2', ['y_pillow'], '베개'), ('t3', ['y_soap'], '비누')], cuts=[cut('', BABY, MOM, bg='home')], reward=dict(cozy=35, unlock=None)),
]
for s in STORY:
    s['tasks'] = [dict(id=t[0], need=t[1], label=t[2]) for t in s['tasks']]
    for t in s['tasks']:
        for n in t['need']: assert n in byid, ('없는 가구', n)
    for n in [a['want'] for r in ROOMS if r[0] == s['room'] for a in [dict(want=x[3]) for x in r[6]]]: assert n in byid, ('칸 가구 없음', n)
# 손님: 아늑함 문턱 · 좋아하는 가구 · 대사 [제안] (유아 손님은 글 없이 아이콘)
GUESTS = [
    dict(id='wife', char='wife.smug', group='adult', need=60, likes=['b_sofa', 'u_fridge'], lines=['이 소파 앉아도 돼요?', '냉장고가 이렇게 크니 좋겠다!'], gift='p_pack1'),
    dict(id='dong_dad', char='dong_dad.calm', group='adult', need=140, likes=['b_shelf', 'b_clock'], lines=['책장이 정갈하군요.', '시계 소리가 좋네요.'], gift='p_clock'),
    dict(id='nemo_mom', char='nemo_mom.good', group='adult', need=260, likes=['t_bowl', 'p_rice'], lines=['밥솥이 딱 우리 집 거네!', '밥그릇이 예쁘네요.'], gift='p_label'),
    dict(id='husband', char='husband.joy', group='adult', need=420, likes=['b_suitcase', 'p_world'], lines=['이 가방이면 어디든 가겠는데?', '지도에 우리 집도 표시해 줘요.'], gift='p_pass'),
    dict(id='nemo_grandma', char='nemo_grandma.good', group='adult', need=620, likes=['m_bench', 'm_garden'], lines=['평상에 앉으면 시간이 천천히 가지.', '텃밭 상추 좀 뜯어 가도 되냐.'], gift='m_pepper'),
    dict(id='hana', char='nemo_kids.kid1', group='kid', need=40, likes=['k_train', 'y_ball'], lines=[], gift='y_star'),
    dict(id='dong_dad_k', char='dong_dad.joy', group='kid', need=100, likes=['k_party', 'y_toybox'], lines=[], gift='k_ch4'),
    dict(id='wife_k', char='wife.joy', group='kid', need=180, likes=['w_frame', 'y_pillow'], lines=[], gift='w_stars'),
]
for g in GUESTS:
    for n in g['likes'] + [g['gift']]: assert n in byid, ('손님 가구 없음', g['id'], n)
D = dict(version=1, note='[제안] 우리 집 2.0 데이터. tools/housing_build.py 로 생성.', levels=levels, formula=dict(set=[[3, 0.10], [5, 0.25], ['all', 0.60]], harmony=30, style=30, fill=40, life=20),
         rooms=mkrooms('adult') + mkrooms('kid'), story=STORY, guests=GUESTS, unlockLv={'adult': {'kitchen': 3, 'semo': 5, 'dong': 8, 'yard': 10, 'entrance': 12, 'upstairs': 15, 'roof': 20}, 'kid': {'wardrobe': 3, 'dining': 6, 'toyroom': 9, 'bath': 12}})
json.dump(D, open('data/housing.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
bygame = collections.Counter(i['src']['game'] for i in items); print('src 앱별', dict(bygame)); print('housing.json 방', len(D['rooms']), '장', len(STORY), '손님', len(GUESTS), '레벨 30 문턱', T(30))
adult_tot = sum(i['cozy'] for i in items if i['set'] not in ('kid', 'daybath', 'wall', 'story_k')); kid_tot = sum(i['cozy'] for i in items if i['set'] in ('kid', 'daybath', 'wall', 'story_k')); print('성인 cozy 합', adult_tot, '유아 cozy 합', kid_tot)
