"""「우리 집」 2.0 데이터 (games/26_HOUSING2.md §5·§6·§9, 허브 QA 2026-10-13 개정) — python tools/housing_build.py (멱등)
1) data/room_items.json: 새 가구 62개(계절 20·이벤트 12·손님 선물 14 + 유아 계절 8·손님 선물 8) 추가, 모든 가구에 cozy·cls(크기 규칙)·tags·style·color·src(어디서 얻나) 필드.
2) data/housing.json: 집 레벨표(지수 1.7)·방(고정 가구 fixtures·놓을 칸 anchors)·집 이야기 장(성인 8·유아 5)·손님(문턱 150부터, 선물 2개씩).
출처(src)는 각 앱 코드의 보상 표(REW·TIER)와 data/idle_props.json 에서 읽는다. 가구는 정확히 한 출처를 가진다(단언). 모든 글은 [제안]."""
import json, re, io, sys, collections
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
J = lambda p: json.load(open(p, encoding='utf-8'))
R = J('data/room_items.json'); items = R['items']; byid = {i['id']: i for i in items}
APPN = {'merge': '합치기', 'spot': '틀린 그림', 'block': '블록', 'sort': '정리', 'tile': '짝 맞추기', 'day': '막둥이의 하루', 'idle': '세 가족 식탁', 'quiz': '어느 도형', 'color': '색칠북', 'playground': '놀이터'}
APPK = {'merge': 'merge', 'spot': 'spot', 'block': 'block', 'sort': 'sort', 'tile': 'tile', 'day': 'day', 'tables': 'idle', 'idle': 'idle', 'quiz': 'quiz', 'coloring': 'color', 'playground': 'playground', 'all': 'event'}
SRC = {}

# ---------------- 새 가구 62 (그림은 임시 이모지 — 아트 패스 슬롯) ----------------
def new(i, name, emoji, slot, room, w, h, sset, game, **kw):
    if i in byid: return
    no = max(x['no'] for x in items) + 1
    d = dict(no=no, id=i, name=name, set=sset, room=room, w=w, h=h, slot=slot, art='emoji', emoji=emoji, colors=['#FFFFFF'], game=game, season=kw.get('season'), physical=None)
    items.append(d); byid[i] = d
SEAS = [  # id, 이름, 이모지, 슬롯, 크기, 달들
    ('s2_cherry', '벚꽃 가지', '🌸', 'floor', (52, 64), [3, 4, 5]), ('s2_picnic', '봄 돗자리', '🧺', 'floor', (80, 40), [3, 4, 5]), ('s2_kite', '연', '🪁', 'wall', (46, 46), [3, 4, 5]), ('s2_tulip', '튤립 화분', '🌷', 'floor', (44, 56), [3, 4, 5]), ('s2_birdhouse', '새집', '🐦', 'wall', (44, 44), [3, 4, 5]),
    ('s2_chime', '풍경', '🎐', 'wall', (40, 56), [6, 7, 8]), ('s2_melon', '수박 쟁반', '🍉', 'table', (46, 40), [6, 7, 8]), ('s2_tube', '튜브', '🛟', 'floor', (60, 50), [6, 7, 8]), ('s2_fan', '선풍기', '🌀', 'floor', (50, 66), [6, 7, 8]), ('s2_ice', '빙수', '🍧', 'table', (40, 46), [6, 7, 8]),
    ('s2_leaf', '낙엽 화환', '🍂', 'wall', (54, 54), [9, 10, 11]), ('s2_persimmon', '감 바구니', '🧡', 'table', (46, 40), [9, 10, 11]), ('s2_scarecrow', '허수아비', '🧑‍🌾', 'floor', (52, 90), [9, 10, 11]), ('s2_moonlamp', '보름달 등', '🏮', 'wall', (44, 56), [9, 10, 11]), ('s2_acorn', '도토리 그릇', '🌰', 'table', (40, 36), [9, 10, 11]),
    ('s2_snowman', '눈사람', '⛄', 'floor', (56, 76), [12, 1, 2]), ('s2_heater', '난로', '🔥', 'floor', (56, 62), [12, 1, 2]), ('s2_tangerine', '귤 바구니', '🍊', 'table', (46, 40), [12, 1, 2]), ('s2_wreath', '겨울 리스', '🎄', 'wall', (50, 50), [12, 1, 2]), ('s2_blanket', '털 담요', '🧣', 'floor', (70, 40), [12, 1, 2])]
for i, n, e, sl, (w, h), ms in SEAS: new(i, n, e, sl, 'yard', w, h, 'season2', 'all', season=ms)
EVT = [('e_bokjumoni', '복주머니', '🧧', 'wall', (44, 50), [1]), ('e_yut', '윷놀이판', '🎲', 'table', (46, 40), [1]), ('e_balloon', '어린이날 풍선', '🎈', 'wall', (44, 60), [5]), ('e_flowerbasket', '꽃바구니', '💐', 'table', (46, 46), [5]), ('e_lantern', '연등', '🪔', 'wall', (44, 50), [5]), ('e_carp', '잉어 깃발', '🎏', 'wall', (50, 60), [5]),
       ('e_pumpkin', '호박등', '🎃', 'floor', (52, 52), [10]), ('e_candy', '사탕 단지', '🍬', 'table', (44, 44), [10]), ('e_gift', '선물 상자', '🎁', 'floor', (52, 50), [12]), ('e_stocking', '크리스마스 양말', '🧦', 'wall', (40, 56), [12]), ('e_cake', '케이크', '🎂', 'table', (46, 46), [12]), ('e_firework', '불꽃 병', '🎆', 'wall', (46, 52), [12])]
for i, n, e, sl, (w, h), ms in EVT: new(i, n, e, sl, 'yard', w, h, 'event', 'all', season=ms)
GIFT = [('g_cushion', '꽃무늬 쿠션', '🌺', 'floor', (52, 44), 'nemo'), ('g_mirror', '손거울', '🪞', 'wall', (44, 56), 'semo'), ('g_pen', '만년필 꽂이', '🖋️', 'table', (40, 44), 'dong'), ('g_chess', '체스판', '♟️', 'table', (46, 40), 'dong'), ('g_lunch', '도시락 보자기', '🍱', 'table', (46, 40), 'nemo'), ('g_apron', '앞치마', '👚', 'wall', (44, 56), 'nemo'),
        ('g_compass', '나침반', '🧭', 'table', (40, 40), 'semo'), ('g_postcard', '엽서 꽂이', '💌', 'wall', (46, 46), 'semo'), ('g_teaset', '찻주전자', '🫖', 'table', (46, 44), 'nemo'), ('g_flowerpot', '철쭉 화분', '🪴', 'floor', (46, 60), 'yard'), ('g_pepper', '고추 엮음', '🌶️', 'wall', (40, 60), 'yard'), ('g_hanbok', '한복 인형', '👘', 'floor', (44, 70), 'nemo'), ('g_stool', '작은 의자', '🪑', 'floor', (50, 56), 'dong'), ('g_lantern2', '손전등', '🔦', 'table', (36, 44), 'dong')]
for i, n, e, sl, (w, h), rm in GIFT: new(i, n, e, sl, rm, w, h, 'gift', 'all')
KS = [('kc_cherry', '벚꽃', '🌸', 'floor', (56, 60), [3, 4, 5]), ('kc_tulip', '튤립', '🌷', 'floor', (50, 56), [3, 4, 5]), ('kc_tube', '튜브', '🛟', 'floor', (60, 50), [6, 7, 8]), ('kc_icecream', '아이스크림', '🍦', 'floor', (44, 56), [6, 7, 8]), ('kc_acorn', '도토리', '🌰', 'floor', (44, 44), [9, 10, 11]), ('kc_leaf', '단풍잎', '🍁', 'wall', (50, 50), [9, 10, 11]), ('kc_snowman', '눈사람', '⛄', 'floor', (56, 70), [12, 1, 2]), ('kc_mitten', '벙어리장갑', '🧤', 'wall', (46, 46), [12, 1, 2])]
for i, n, e, sl, (w, h), ms in KS: new(i, n, e, sl, 'kid', w, h, 'kseason', 'all', season=ms)
KGIFT = [('kg_star', '별 스티커 판', '⭐', 'wall', (46, 46)), ('kg_cloud', '구름 모빌', '☁️', 'wall', (56, 46)), ('kg_bear', '곰 인형', '🧸', 'floor', (52, 56)), ('kg_ball2', '풍선 공', '🏐', 'floor', (44, 44)), ('kg_kite', '작은 연', '🪁', 'wall', (46, 50)), ('kg_drum', '장난감 북', '🥁', 'floor', (52, 46)), ('kg_rainbow', '무지개 깃발', '🏳️‍🌈', 'wall', (56, 40)), ('kg_train2', '꼬마 기차', '🚂', 'floor', (60, 44))]
for i, n, e, sl, (w, h) in KGIFT: new(i, n, e, sl, 'kid', w, h, 'kgift', 'all')
for sid, name, game, room, story in [('season2', '계절 장식 세트(성인)', 'all', 'yard', '계절이 바뀔 때 집에 놀러 오면 하루에 하나씩 놓여요. 놓친 철도 다음 해에 다시 열려요.'), ('event', '이벤트 소품 세트', 'all', 'yard', '명절과 기념일 소품. 그 달에 집에 오면 하나씩 받아요.'), ('gift', '손님 선물 세트', 'all', 'nemo', '놀러 온 손님이 두고 가는 선물이에요.'),
                                 ('kseason', '계절 장식 세트(유아)', 'all', 'kid', '계절마다 하나씩 방에 놓여요.'), ('kgift', '손님 선물 세트(유아)', 'all', 'kid', '놀러 온 친구가 두고 가는 선물이에요.')]:
    if not any(s['id'] == sid for s in R['sets']): R['sets'].append(dict(id=sid, name=name, game=game, room=room, story=story))

# ---------------- 출처(src) ----------------
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
MON = lambda ms: (f'{ms[0]}~{ms[-1]}월' if len(ms) > 1 and ms == sorted(ms) else '·'.join(f'{m}월' for m in ms))
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
    elif iid.startswith(('s2_', 'kc_')) or iid.startswith('s_'): ms = i['season'] if isinstance(i['season'], list) else ([int(x) for x in re.findall(r'\d+', str(i['season']))] or [12]); SRC[iid] = dict(game='event', kind='season', months=ms, hint=f'{MON(ms)}에 집에 놀러 오면 · 계절 선물')
    elif iid.startswith('e_'): ms = i['season']; SRC[iid] = dict(game='event', kind='event', months=ms, hint=f'{MON(ms)} 기념일에 집에 오면')
    elif iid.startswith(('g_', 'kg_')): SRC[iid] = dict(game='event', kind='guest', hint='집에 손님이 놀러 오면 선물')
    elif iid in ('b_bed', 'b_rug'): SRC[iid] = dict(game='merge', kind='tier', hint='합치기 · 아이 방 가구(합치기 보상)')
    else: SRC[iid] = dict(game=APPK.get(i['game'], i['game']), kind='other', hint=f"{APPN.get(APPK.get(i['game'], i['game']), '')} 보상")
assert all(i['id'] in SRC for i in items), [i['id'] for i in items if i['id'] not in SRC]
# ---------------- 필드: cozy · cls(크기 규칙) · tags · style · color ----------------
TAG_RULES = [('sit', r'sofa|chair|bench|stool|mat|rug|평상|의자|소파|방석|벤치|러그'), ('eat', r'table|bowl|rice|lunch|kimchi|tea|ramen|plate|식탁|그릇|밥|도시락|김치|찻잔|라면|수저'), ('read', r'shelf|book|diary|album|책|서재|일기|앨범'),
             ('sleep', r'bed|pillow|quilt|moon|침대|베개|이불'), ('play', r'toy|ball|duck|train|swing|block|k_|장난감|공|오리|기차|그네'), ('watch', r'tv|photo|frame|camera|window|액자|사진|TV|창문')]
STYLE = {'build': 'warm', 'kitchen': 'warm', 'photo': 'cool', 'outer': 'wood', 'yardlife': 'wood', 'storage': 'cool', 'kid': 'kids', 'daybath': 'kids', 'wall': 'kids', 'badge': 'festive', 'season': 'festive', 'season2': 'festive', 'event': 'festive', 'gift': 'warm', 'kseason': 'kids', 'kgift': 'kids', 'story_a': 'festive', 'story_k': 'festive'}
BIG = {'b_sofa', 'b_table', 'b_bed', 'u_fridge', 'u_closet', 'b_shelf', 'b_drawer', 'b_tv', 'u_shoerack', 'm_bench', 'o_gate', 'o_fence', 'o_well', 'a_shelf', 'm_garden', 'm_coop', 'o_doghouse', 'u_drawer', 'y_toybox', 'u_box', 'o_bench', 'b_nemo_living', 'b_semo_home', 'b_dong_study', 's_tree', 'u_cart'}
SIZE_F = {'big': 1.75, 'mid': 1.4, 'small': 1.2, 'wall': 1.25, 'prop': 1.0}
def hue(c):
    c = c.lstrip('#'); r, g, b = int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16); mx, mn = max(r, g, b), min(r, g, b)
    if mx - mn < 28: return 'white' if mx > 200 else ('gray' if mx > 90 else 'dark')
    if mx == r: return 'peach' if g > b and g - b > 40 and r > 220 else ('pink' if b > g else 'red')
    if mx == g: return 'green'
    return 'sky' if g > r else 'purple'
BASE = {'floor': 6, 'wall': 4, 'table': 3}
for i in items:
    s = SRC[i['id']]; name = i['name'] + ' ' + i['id']
    i['cozy'] = BASE[i['slot']] + (2 if i['w'] >= 80 else 0) + (3 if i['set'] in ('story_a', 'story_k') else 0) + (1 if s.get('n', 0) >= 40 or s.get('t', 0) >= 6 else 0) + (1 if i['set'] in ('season2', 'event', 'kseason') else 0) + (2 if i['set'] in ('gift', 'kgift') else 0)
    i['tags'] = [t for t, rx in TAG_RULES if re.search(rx, name, re.I)][:2]
    i['style'] = STYLE.get(i['set'], 'warm'); i['color'] = hue(i['colors'][0]); i['src'] = s
    i['cls'] = 'wall' if i['slot'] == 'wall' else 'prop' if i['slot'] == 'table' else 'big' if (i['id'] in BIG or i['w'] >= 84) else 'mid' if i['w'] >= 56 else 'small'
json.dump(R, open('data/room_items.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('items', len(items), '(새로', sum(1 for i in items if i['id'].startswith(('s2_', 'e_', 'g_', 'kc_', 'kg_'))), ') cozy 합', sum(i['cozy'] for i in items), 'cls', dict(collections.Counter(i['cls'] for i in items)))

# ------------------------------ housing.json ------------------------------
A_EXP = 1.7; T_A = 7.1
T = lambda n: round(T_A * (n - 1) ** A_EXP)
levels = [dict(lv=n, cozy=T(n)) for n in range(1, 31)]
# 방 기하(논리 340×440): 벽 0~150, 바닥 150~440. 앵커 x=중심 · y=가구 밑변. 고정 가구(fixtures)는 방 그림에 함께 그려지고 surf 는 위에 소품이 놓이는 면.
FX = lambda k, x, y, w, h, **kw: dict(k=k, x=x, y=y, w=w, h=h, **kw)
ROOMS = [  # id, 이름, 그룹, 해금, 벽색, 바닥색, 벽무늬, 바닥, fixtures, anchors[(slot,x,y,want)]
    ('nemo', '네모네 거실', 'adult', 1, '#FFE3C2', '#E3B27F', 'square', 'wood', [],
     [('wall', 84, 118, 'a_frame'), ('wall', 166, 124, 'u_shelf'), ('floor', 112, 392, 'b_table'), ('floor', 252, 340, 'b_sofa'), ('floor', 62, 318, 'b_drawer')]),
    ('kitchen', '네모네 주방', 'adult', 3, '#FFF1C9', '#E8D8B8', 'dot', 'tile', [FX('counter', 70, 196, 200, 48, surf=dict(y=196, x0=80, x1=262))],
     [('floor', 300, 330, 'u_fridge'), ('floor', 160, 392, 't_bowl'), ('table', 150, 196, 'p_rice'), ('wall', 180, 120, 'u_sidedish'), ('table', 220, 196, 'p_kimchi')]),
    ('semo', '세모네 신혼집', 'adult', 5, '#D8F0FF', '#D8E2EE', 'triangle', 'wood', [FX('desk', 70, 236, 150, 44, surf=dict(y=236, x0=80, x1=210))],
     [('wall', 100, 124, 'a_map'), ('floor', 270, 352, 'b_suitcase'), ('table', 140, 236, 'p_world'), ('floor', 60, 360, 'b_lamp'), ('floor', 190, 408, 'a_camera')]),
    ('dong', '동그라미네 서재', 'adult', 8, '#E2E6FA', '#C7CBE0', 'circle', 'wood', [FX('desk', 150, 232, 150, 44, surf=dict(y=232, x0=160, x1=290))],
     [('floor', 66, 330, 'b_shelf'), ('floor', 200, 404, 'p_chair'), ('wall', 130, 112, 'b_clock'), ('floor', 292, 348, 'b_globe'), ('table', 220, 232, 'p_book')]),
    ('yard', '마당·골목', 'adult', 10, '#CFEFFF', '#B4DE98', 'none', 'grass', [],
     [('floor', 70, 340, 'o_fence'), ('floor', 190, 400, 'm_bench'), ('floor', 288, 350, 'o_mailbox'), ('floor', 250, 300, 'm_garden')]),
    ('entrance', '현관', 'adult', 12, '#F4E4D0', '#CBA980', 'square', 'tile', [], [('wall', 110, 118, 'n_plate'), ('floor', 80, 340, 'u_shoerack'), ('wall', 232, 122, 'q_plate_nemo'), ('floor', 250, 396, 'o_doghouse')]),
    ('upstairs', '2층', 'adult', 15, '#FDE8F0', '#E5C7B0', 'dot', 'wood', [], [('floor', 100, 340, 'b_bed'), ('floor', 270, 340, 'u_closet'), ('floor', 190, 408, 'a_diary')]),
    ('roof', '옥상', 'adult', 20, '#BFE6FF', '#CFC8BE', 'none', 'tile', [], [('floor', 90, 372, 's_tree'), ('floor', 240, 392, 't_pigs_a')]),
    ('bath', '욕실', 'kid', 1, '#DDF3F8', '#CFE6F0', 'circle', 'tile', [FX('sink', 80, 232, 150, 56, surf=dict(y=224, x0=96, x1=206)), FX('shelf', 250, 104, 70, 10, surf=dict(y=104, x0=252, x1=316))],
     [('table', 130, 224, 'y_cup'), ('table', 184, 224, 'y_paste'), ('wall', 270, 100, 'y_hanger'), ('floor', 90, 404, 'y_mat'), ('floor', 250, 392, 'y_duck'), ('table', 288, 104, 'y_soap'), ('wall', 130, 108, 'y_towel')]),
    ('kid', '아이 방', 'kid', 3, '#FFF0B8', '#F2C98A', 'triangle', 'wood', [FX('bed', 24, 330, 150, 70, surf=dict(y=300, x0=40, x1=160))],
     [('floor', 84, 322, 'y_pillow'), ('floor', 140, 330, 'y_quilt'), ('floor', 270, 352, 'y_toybox'), ('wall', 150, 116, 'w_frame'), ('wall', 62, 106, 'y_moon'), ('floor', 220, 410, 'k_party')]),
    ('wardrobe', '옷방', 'kid', 6, '#FFE0E8', '#E8C7A8', 'dot', 'wood', [], [('wall', 90, 108, 'y_hat'), ('floor', 200, 400, 'y_boots'), ('floor', 90, 392, 'k_train')]),
    ('dining', '밥 먹는 곳', 'kid', 9, '#E8F5C8', '#DDBF92', 'square', 'wood', [FX('table', 80, 280, 180, 56, surf=dict(y=280, x0=96, x1=250))], [('table', 130, 280, 'y_bowl'), ('table', 200, 280, 'y_spoon'), ('floor', 270, 400, 'k_ch3')]),
    ('toyroom', '장난감 방', 'kid', 12, '#D8ECFF', '#C8D8B8', 'circle', 'grass', [], [('floor', 80, 360, 'y_toybox'), ('floor', 200, 404, 'y_ball'), ('floor', 270, 340, 'k_ch5')]),
]
for r in ROOMS:
    for a in r[9]:
        assert a[3] in byid, ('칸 가구 없음', r[0], a[3])
def mkrooms(g): return [dict(id=r[0], name=r[1], group=r[2], unlock=r[3], wall=r[4], floor=r[5], pattern=r[6], floorKind=r[7], fixtures=r[8], anchors=[dict(id=f'{r[0]}_{k}', slot=a[0], x=a[1], y=a[2], want=a[3]) for k, a in enumerate(r[9], 1)]) for r in ROOMS if r[2] == g]
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
    # 유아: 욕실(⑩ 첫 보상이 양치) → 아이 방 → 옷방 → 밥 → 장난감 방
    dict(ch=1, room='bath', group='kid', title='깨끗이 씻자', tasks=[('t1', ['y_cup'], '칫솔 컵'), ('t2', ['y_paste'], '치약'), ('t3', ['y_hanger'], '옷걸이')], cuts=[cut('', BABY, MOM, bg='home'), cut('', BABY, KID1, bg='home')], reward=dict(cozy=15, unlock='kid')),
    dict(ch=2, room='kid', group='kid', title='막둥이의 첫 방', tasks=[('t1', ['k_party'], '잔칫집'), ('t2', ['w_frame'], '내 그림 액자'), ('t3', ['y_pillow'], '베개')], cuts=[cut('', BABY, KID1, bg='home')], reward=dict(cozy=20, unlock='wardrobe')),
    dict(ch=3, room='wardrobe', group='kid', title='옷방', tasks=[('t1', ['y_hat'], '모자걸이'), ('t2', ['k_train'], '기차'), ('t3', ['y_boots'], '장화')], cuts=[cut('', BABY, MOM, bg='home')], reward=dict(cozy=25, unlock='dining')),
    dict(ch=4, room='dining', group='kid', title='밥 먹는 곳', tasks=[('t1', ['y_bowl'], '밥그릇'), ('t2', ['y_spoon'], '수저 통'), ('t3', ['k_ch3'], '무 인형')], cuts=[cut('', BABY, DAD, bg='home')], reward=dict(cozy=30, unlock='toyroom')),
    dict(ch=5, room='toyroom', group='kid', title='장난감 방', tasks=[('t1', ['y_toybox'], '장난감 상자'), ('t2', ['y_ball'], '공 바구니'), ('t3', ['k_ch5'], '도형 블록')], cuts=[cut('', BABY, KID3, bg='home')], reward=dict(cozy=35, unlock=None)),
]
for s in STORY:
    s['tasks'] = [dict(id=t[0], need=t[1], label=t[2]) for t in s['tasks']]
    for t in s['tasks']:
        for n in t['need']: assert n in byid, ('없는 가구', n)
# 손님: 문턱 150(1장 완료 무렵)부터 · 선물 2개 — 대사 [제안], 유아는 글 없이 아이콘
GUESTS = [
    dict(id='wife', char='wife.smug', group='adult', need=150, likes=['b_sofa', 'u_fridge'], lines=['이 소파 앉아도 돼요?', '냉장고가 이렇게 크니 좋겠다!'], gifts=['g_cushion', 'g_mirror']),
    dict(id='dong_dad', char='dong_dad.calm', group='adult', need=320, likes=['b_shelf', 'b_clock'], lines=['책장이 정갈하군요.', '시계 소리가 좋네요.'], gifts=['g_pen', 'g_chess']),
    dict(id='nemo_mom', char='nemo_mom.good', group='adult', need=520, likes=['t_bowl', 'p_rice'], lines=['밥솥이 딱 우리 집 거네!', '밥그릇이 예쁘네요.'], gifts=['g_lunch', 'g_apron']),
    dict(id='husband', char='husband.joy', group='adult', need=760, likes=['b_suitcase', 'p_world'], lines=['이 가방이면 어디든 가겠는데?', '지도에 우리 집도 표시해 줘요.'], gifts=['g_compass', 'g_postcard']),
    dict(id='nemo_grandma', char='nemo_grandma.good', group='adult', need=1050, likes=['m_bench', 'm_garden'], lines=['평상에 앉으면 시간이 천천히 가지.', '텃밭 상추 좀 뜯어 가도 되냐.'], gifts=['g_teaset', 'g_flowerpot']),
    dict(id='nemo_dad_g', char='nemo_dad.good', group='adult', need=1400, likes=['o_fence', 'o_mailbox'], lines=['담장이 튼튼하네요.', '우체통에 편지 왔나?'], gifts=['g_pepper', 'g_hanbok']),
    dict(id='dong_dad_w', char='dong_dad.warm', group='adult', need=1750, likes=['p_chair', 'b_globe'], lines=['의자가 하나 더 있으니 든든하네요.', '지구본 돌려 보고 싶어요.'], gifts=['g_stool', 'g_lantern2']),
    dict(id='hana', char='nemo_kids.kid1', group='kid', need=60, likes=['k_train', 'y_ball'], lines=[], gifts=['kg_star', 'kg_cloud']),
    dict(id='dong_dad_k', char='dong_dad.joy', group='kid', need=150, likes=['k_party', 'y_toybox'], lines=[], gifts=['kg_bear', 'kg_ball2']),
    dict(id='wife_k', char='wife.joy', group='kid', need=260, likes=['w_frame', 'y_pillow'], lines=[], gifts=['kg_kite', 'kg_drum']),
    dict(id='nemo_dad_k', char='nemo_dad.joy', group='kid', need=380, likes=['y_bowl', 'y_cup'], lines=[], gifts=['kg_rainbow', 'kg_train2']),
]
chars = J('data/chars.json')
for g in GUESTS:
    assert g['char'] in chars, ('손님 그림 없음', g['char'])
    for n in g['likes'] + g['gifts']: assert n in byid, ('손님 가구 없음', g['id'], n)
D = dict(version=2, note='[제안] 우리 집 2.0 데이터. tools/housing_build.py 로 생성.', levels=levels, formula=dict(set=[[3, 0.10], [5, 0.25], ['all', 0.60]], harmony=30, style=30, fill=40, life=20), sizeF=SIZE_F, geom=dict(RW=340, RH=440, WALLH=150),
         rooms=mkrooms('adult') + mkrooms('kid'), story=STORY, guests=GUESTS, unlockLv={'adult': {'kitchen': 3, 'semo': 5, 'dong': 8, 'yard': 10, 'entrance': 12, 'upstairs': 15, 'roof': 20}, 'kid': {'kid': 3, 'wardrobe': 6, 'dining': 9, 'toyroom': 12}})
json.dump(D, open('data/housing.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('src 앱별', dict(collections.Counter(i['src']['game'] for i in items))); print('housing.json 방', len(D['rooms']), '장', len(STORY), '손님', len(GUESTS), 'T(30)', T(30), 'T(10)', T(10), 'T(20)', T(20))
KG = ('kid', 'daybath', 'wall', 'story_k', 'kseason', 'kgift')
print('성인 cozy 합', sum(i['cozy'] for i in items if i['set'] not in KG), '유아 cozy 합', sum(i['cozy'] for i in items if i['set'] in KG), '성인 개수', sum(1 for i in items if i['set'] not in KG), '유아 개수', sum(1 for i in items if i['set'] in KG))
