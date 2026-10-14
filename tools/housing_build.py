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
# ---------------- 테마 세트 4종(A25, 성인): 우리 집 레벨이 오르면 한 세트(5개)가 자동 도착한다(확정 지급, 압박 없음). 문구 [제안] ----------------
THEME_SETS = [
    dict(id='theme_cafe', name='카페 거실 세트', icon='☕', lv=4, room='nemo', style='warm', items=[('th_cafe_sign', '카페 간판', '🪧', 'wall', (50, 40)), ('th_cafe_machine', '에스프레소 머신', '☕', 'table', (44, 44)), ('th_cafe_stool', '높은 의자', '🪑', 'floor', (44, 62)), ('th_cafe_cake', '케이크 진열장', '🍰', 'table', (46, 44)), ('th_cafe_plant', '카페 화분', '🪴', 'floor', (46, 62))],
         scene=dict(props=[['☕', '커피', 22, 172, 44], ['🍰', '케이크', 84, 176, 40], ['🪴', '화분', 276, 150, 54]], chars=['nemo_mom.joy', 'nemo_dad.joy', 'nemo_kids.kid1', 'baby.joy'], emo='☕', text='거실이 작은 카페가 되어 식구들이 한 잔씩 해요', line='오늘은 내가 바리스타!')),
    dict(id='theme_hanok', name='한옥 사랑방 세트', icon='🏮', lv=9, room='dong', style='wood', items=[('th_hanok_table', '교자상', '🪵', 'floor', (80, 44)), ('th_hanok_screen', '병풍', '🎴', 'wall', (70, 56)), ('th_hanok_lamp', '한지 등', '🏮', 'table', (40, 50)), ('th_hanok_cushion', '방석 한 쌍', '🧘', 'floor', (56, 40)), ('th_hanok_teaset', '다기 세트', '🍵', 'table', (44, 40))],
         scene=dict(props=[['🍵', '차', 22, 172, 42], ['🏮', '한지 등', 270, 150, 52], ['🎴', '병풍', 84, 150, 54]], chars=['nemo_grandma.good', 'dong_dad.warm', 'nemo_dad.joy', 'nemo_kids.kid2'], emo='🍵', text='사랑방에 둘러앉아 따뜻한 차를 나눠 마셔요', line='차 향이 참 좋구나.')),
    dict(id='theme_camp', name='캠핑 마당 세트', icon='⛺', lv=14, room='yard', style='wood', items=[('th_camp_tent', '텐트', '⛺', 'floor', (84, 70)), ('th_camp_fire', '모닥불', '🔥', 'floor', (52, 52)), ('th_camp_lantern', '캠핑 랜턴', '🔦', 'table', (40, 44)), ('th_camp_chair', '접이식 의자', '🪑', 'floor', (50, 54)), ('th_camp_stick', '마시멜로 꼬치', '🍢', 'table', (42, 40))],
         scene=dict(props=[['🔥', '모닥불', 150, 172, 52], ['🍢', '꼬치', 22, 176, 40], ['⛺', '텐트', 262, 130, 62]], chars=['husband.joy', 'wife.joy', 'nemo_kids.kid3', 'baby.joy', 'nemo_dad.joy'], emo='🔥', text='마당에서 모닥불을 피우고 캠핑을 즐겨요', line='마시멜로가 딱 익었다!')),
    dict(id='theme_lib', name='도서관 서재 세트', icon='📚', lv=19, room='semo', style='cool', items=[('th_lib_desk', '독서 책상', '📖', 'floor', (70, 48)), ('th_lib_lamp', '초록 갓 스탠드', '💡', 'table', (40, 50)), ('th_lib_ladder', '사다리 책장', '🪜', 'floor', (54, 74)), ('th_lib_stamp', '대출 도장', '🔖', 'table', (40, 36)), ('th_lib_cart', '책 수레', '🛒', 'floor', (58, 54))],
         scene=dict(props=[['📖', '책', 22, 172, 42], ['💡', '스탠드', 276, 150, 50], ['🛒', '책 수레', 84, 170, 50]], chars=['dong_dad.warm', 'nemo_kids.kid1', 'nemo_kids.kid2', 'baby.joy'], emo='📚', text='서재가 작은 도서관이 되어 조용히 책을 읽어요', line='쉿, 이 책 정말 재밌어.')),
]
for _t in THEME_SETS:
    for i, n, e, sl, (w, h) in _t['items']: new(i, n, e, sl, _t['room'], w, h, _t['id'], 'event')
    if not any(x['id'] == _t['id'] for x in R['sets']): R['sets'].append(dict(id=_t['id'], name=_t['name'] + '(성인)', game='event', room=_t['room'], story='우리 집 레벨 ' + str(_t['lv']) + '에 오르면 한 세트가 자동으로 도착해요.'))
# 원정 전리품(B6, D12): ⑪ 기하학 원정대는 별도 앱이라 저장소를 잇지 않는다 — 단계 클리어 보상으로 6자리 코드를 받아 성인 그룹 「우리 집」에서 입력(유아 집에는 없음).
LOOT = [  # id, 이름, 이모지, 슬롯, (w,h), 단계
    ('x_straw', '짚단 의자', '🌾', 'floor', (56, 50), 3), ('x_pinwheel', '바람개비', '🎡', 'floor', (46, 62), 6), ('x_wood', '장작 더미', '🪵', 'floor', (60, 46), 9), ('x_brickhouse', '벽돌집 모형', '🏠', 'table', (44, 44), 12),
    ('x_ricecake', '달 떡 접시', '🥮', 'table', (44, 40), 15), ('x_cloudlamp', '구름 조명', '☁️', 'wall', (56, 46), 18), ('x_bucket', '달빛 두레박', '🪣', 'floor', (48, 52), 21), ('x_tiger', '호랑이 인형', '🐯', 'floor', (56, 60), 24),
    ('x_jar', '큰 항아리', '🏺', 'floor', (52, 64), 27), ('x_lantern', '잔치 등롱', '🏮', 'wall', (44, 56), 30), ('x_shoes', '꽃 짚신', '👞', 'table', (44, 36), 33), ('x_flag', '잔치 깃발', '🚩', 'wall', (46, 56), 36),
    # 4~6나라(B8)
    ('x_donkey', '당나귀 인형', '🫏', 'floor', (56, 60), 39), ('x_musicbox', '음악 상자', '🎼', 'table', (44, 40), 42), ('x_catcushion', '고양이 방석', '🐈', 'floor', (56, 46), 45), ('x_rooster', '수탉 장식', '🐓', 'floor', (50, 60), 48),
    ('x_beanstalk', '콩나물 화분', '🌱', 'floor', (50, 64), 51), ('x_goldegg', '황금 알', '🥚', 'table', (40, 44), 54), ('x_harp', '구름 하프', '🪕', 'floor', (52, 62), 57), ('x_cloudbed', '구름 방석', '☁️', 'floor', (60, 46), 60),
    ('x_snail', '우렁 껍질 장식', '🐌', 'table', (44, 40), 63), ('x_riceplant', '볏단', '🌾', 'floor', (56, 60), 66), ('x_sedan', '작은 가마', '🏮', 'floor', (56, 62), 69), ('x_crown', '원님 관', '👑', 'table', (44, 40), 72),
    # 7~9나라(B13)
    ('x_magpiebridge', '까치 다리 모형', '🌉', 'table', (46, 40), 75), ('x_loom', '직녀 베틀', '🧵', 'floor', (56, 60), 78), ('x_starbottle', '은하수 병', '🍶', 'table', (40, 46), 81), ('x_milkyway', '은하수 조명', '🌌', 'wall', (56, 46), 84),
    ('x_turtle', '거북 인형', '🐢', 'floor', (52, 46), 87), ('x_coral', '산호 화분', '🪸', 'floor', (50, 60), 90), ('x_shell', '조개 장식', '🐚', 'table', (44, 40), 93), ('x_rabbitdoll', '토끼 인형', '🐇', 'floor', (50, 56), 96),
    ('x_snowflake', '눈꽃 장식', '❄️', 'wall', (50, 50), 99), ('x_icelamp', '얼음 조명', '🧊', 'table', (44, 44), 102), ('x_sled', '작은 썰매', '🛷', 'floor', (60, 44), 105), ('x_snowglobe', '스노볼', '🔮', 'table', (44, 44), 108),
    # 10~12나라(B20)
    ('x_deerfig', '사슴 인형', '🦌', 'floor', (52, 60), 111), ('x_wing', '선녀 날개옷', '👘', 'wall', (54, 56), 114), ('x_moonpond', '보름달 연못 모형', '🌕', 'table', (46, 40), 117), ('x_firewood', '장작 지게', '🪵', 'floor', (56, 62), 120),
    ('x_shellbell', '용궁 조개 종', '🔔', 'table', (44, 44), 123), ('x_seaweed', '해초 화분', '🌿', 'floor', (50, 62), 126), ('x_crabgate', '게 문지기 인형', '🦀', 'floor', (50, 48), 129), ('x_lantern2', '용궁 등불', '🏮', 'wall', (44, 54), 132),
    ('x_magpienest', '까치 둥지 상자', '🪺', 'table', (46, 42), 135), ('x_nestbell', '둥지 종', '🔔', 'wall', (42, 50), 138), ('x_persimmon2', '감나무 화분', '🌳', 'floor', (52, 66), 141), ('x_snakefig', '구렁이 인형', '🐍', 'floor', (56, 46), 144),
    # 13~15나라(B23)
    ('x_driedpersimmon', '곶감 꾸러미', '🍡', 'table', (44, 40), 147), ('x_tigerdoll', '호랑이 인형', '🐅', 'floor', (56, 48), 150), ('x_cowbell', '외양간 방울', '🔔', 'wall', (42, 48), 153), ('x_tigerrug', '호랑이 무늬 방석', '🟧', 'floor', (60, 44), 156),
    ('x_redhat', '빨간 모자', '🧢', 'table', (44, 40), 159), ('x_basket', '심부름 바구니', '🧺', 'floor', (54, 50), 162), ('x_woodsign', '숲길 표지판', '🪧', 'floor', (46, 64), 165), ('x_wolfdoll', '늑대 인형', '🐺', 'floor', (54, 52), 168),
    ('x_puppet', '나무 인형', '🪆', 'floor', (48, 62), 171), ('x_fairyribbon', '요정의 파란 리본', '🎀', 'wall', (46, 40), 174), ('x_workbench', '제페토 작업대', '🔨', 'floor', (60, 56), 177), ('x_foxdoll', '여우 인형', '🦊', 'floor', (52, 54), 180),
    # 16~18나라(B25)
    ('x_mirrorshard', '얼음 거울 조각', '🪞', 'wall', (46, 50), 183), ('x_glassrose', '유리 장미', '🌹', 'table', (40, 46), 186), ('x_scarf', '털 목도리 걸이', '🧣', 'wall', (46, 40), 189), ('x_crowdoll', '눈 까마귀 인형', '🐦‍⬛', 'floor', (48, 52), 192),
    ('x_cicadashell', '매미 허물 장식', '🪲', 'table', (40, 40), 195), ('x_grainbasket', '곡식 낟알 바구니', '🌾', 'table', (46, 42), 198), ('x_violin', '여름 노래 바이올린', '🎻', 'floor', (50, 60), 201), ('x_winterjar', '겨울 곳간 항아리', '🏺', 'floor', (52, 58), 204),
    ('x_finishflag', '결승선 깃발', '🏁', 'wall', (48, 44), 207), ('x_cranedoll', '두루미 인형', '🦢', 'floor', (48, 62), 210), ('x_napcushion', '낮잠 나무 방석', '💤', 'floor', (58, 44), 213), ('x_whistle', '출발 호루라기', '📣', 'table', (40, 40), 216),
    # 19~21나라(B28)
    ('x_gourdbowl', '박 바가지', '🥣', 'table', (44, 38), 219), ('x_swallownest', '제비집 모형', '🪹', 'wall', (46, 42), 222), ('x_moonlamp', '보름달 지붕 등', '🌕', 'wall', (48, 48), 225), ('x_sparrowdoll', '참새 인형', '🐤', 'floor', (46, 52), 228),
    ('x_songbag', '노래 주머니', '👝', 'table', (42, 42), 231), ('x_echobell', '메아리 종', '🔔', 'wall', (44, 50), 234), ('x_brookstone', '달빛 개울 돌', '🪨', 'floor', (54, 44), 237), ('x_owldoll', '부엉이 인형', '🦉', 'floor', (48, 58), 240),
    ('x_pondlamp', '연못 물방울 조명', '💧', 'wall', (44, 52), 243), ('x_lotuspot', '연꽃 화분', '🪷', 'floor', (52, 56), 246), ('x_axerack', '쇠도끼 걸이', '🪓', 'wall', (46, 46), 249), ('x_frogdoll', '개구리 인형', '🐸', 'floor', (50, 48), 252)]
LOOT_STAGE = {i: st for i, n, e, sl, wh, st in LOOT}
for i, n, e, sl, (w, h), st in LOOT: new(i, n, e, sl, 'yard', w, h, 'exp', 'expedition')
if not any(x['id'] == 'exp' for x in R['sets']): R['sets'].append(dict(id='exp', name='원정 전리품 세트(성인)', game='expedition', room='yard', story='원정을 다녀온 가족의 짐에서 나온 것들. 기하학 원정대에서 받은 코드로 놓아요.'))
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
    elif iid.startswith('x_'): SRC[iid] = dict(game='expedition', kind='code', n=LOOT_STAGE[iid], hint=f'기하학 원정대 · {LOOT_STAGE[iid]}단계 클리어 전리품 코드')
    elif iid.startswith('th_'): _lv = [t['lv'] for t in THEME_SETS if t['id'] == i['set']][0]; SRC[iid] = dict(game='event', kind='houselevel', n=_lv, hint=f'우리 집 레벨 {_lv}에 오르면 도착(테마 세트)')
    elif iid.startswith(('g_', 'kg_')): SRC[iid] = dict(game='event', kind='guest', hint='집에 손님이 놀러 오면 선물')
    elif iid in ('b_bed', 'b_rug'): SRC[iid] = dict(game='merge', kind='tier', hint='합치기 · 아이 방 가구(합치기 보상)')
    else: SRC[iid] = dict(game=APPK.get(i['game'], i['game']), kind='other', hint=f"{APPN.get(APPK.get(i['game'], i['game']), '')} 보상")
assert all(i['id'] in SRC for i in items), [i['id'] for i in items if i['id'] not in SRC]
# ---------------- 필드: cozy · cls(크기 규칙) · tags · style · color ----------------
TAG_RULES = [('sit', r'sofa|chair|bench|stool|mat|rug|평상|의자|소파|방석|벤치|러그'), ('eat', r'table|bowl|rice|lunch|kimchi|tea|ramen|plate|식탁|그릇|밥|도시락|김치|찻잔|라면|수저'), ('read', r'shelf|book|diary|album|책|서재|일기|앨범'),
             ('sleep', r'bed|pillow|quilt|moon|침대|베개|이불'), ('play', r'toy|ball|duck|train|swing|block|k_|장난감|공|오리|기차|그네'), ('watch', r'tv|photo|frame|camera|window|액자|사진|TV|창문')]
STYLE = {'build': 'warm', 'kitchen': 'warm', 'photo': 'cool', 'outer': 'wood', 'yardlife': 'wood', 'storage': 'cool', 'kid': 'kids', 'daybath': 'kids', 'wall': 'kids', 'badge': 'festive', 'season': 'festive', 'season2': 'festive', 'event': 'festive', 'gift': 'warm', 'kseason': 'kids', 'kgift': 'kids', 'story_a': 'festive', 'story_k': 'festive', 'theme_cafe': 'warm', 'theme_hanok': 'wood', 'theme_camp': 'wood', 'theme_lib': 'cool'}
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
    i['flat'] = i['id'] in ('b_rug', 'y_mat', 'm_mat', 's2_picnic', 's2_blanket')
    i['cls'] = 'wall' if i['slot'] == 'wall' else 'prop' if i['slot'] == 'table' else 'big' if (i['id'] in BIG or i['w'] >= 84) else 'mid' if i['w'] >= 56 else 'small'
json.dump(R, open('data/room_items.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('items', len(items), '(새로', sum(1 for i in items if i['id'].startswith(('s2_', 'e_', 'g_', 'kc_', 'kg_'))), ') cozy 합', sum(i['cozy'] for i in items), 'cls', dict(collections.Counter(i['cls'] for i in items)))

# ------------------------------ housing.json ------------------------------
A_EXP = 1.7; T_A = 8.4      # D29(허브 2026-10-14): 가구 323개로 늘어 7.8 이면 Lv30 이 65일. 허브안 8.8 은 겹침 방지(자리 칸 우선)를 넣자 아늑함 최대가 2,742 로 내려 T(30)=2,695 가 95% 를 넘어 8.4(T(30)=2,573, 최대의 93.8%)로 조정
T = lambda n: round(T_A * (n - 1) ** A_EXP)
levels = [dict(lv=n, cozy=T(n)) for n in range(1, 31)]
levelsKid = [dict(lv=n, cozy=round(T(n) * 0.85)) for n in range(1, 21)]   # 유아 집은 가구가 적어 문턱을 85%로
# 방 기하(논리 340×440): 벽 0~150, 바닥 150~440. 방마다 놓을 자리 10~15개 = 큰 가구 2~3 · 중간/작은 4~6 · 벽 3 · 면 위 소품 3~4. 앵커 x=중심 · y=가구 밑변.
# 고정 가구(fixtures)는 방 그림에 함께 그려지고 surf 위에 소품이 놓인다. 배치는 줄(rowA 뒤·rowB 가운데·rowC 앞) 템플릿으로 자동 계산한다.
FX = lambda k, x, y, w, h, **kw: dict(k=k, x=x, y=y, w=w, h=h, **kw)
GEOF = lambda iid: (byid[iid]['w'] * SIZE_F[byid[iid]['cls']], byid[iid]['h'] * SIZE_F[byid[iid]['cls']])
ROWY = {'A': 298, 'B': 368, 'C': 428}; WALLX = [52, 118, 184]; WALLY = 108
def spread(n, W=340):
    return {0: [], 1: [W / 2], 2: [90, 250], 3: [58, 170, 282], 4: [48, 128, 214, 296], 5: [40, 100, 170, 240, 300]}[n]
def layout(spec):
    rid, name, grp, unlock, wallc, floorc, pat, fk, fxs, A, B, C, W, props = spec
    anc = []; place = {}
    for row, ids in (('A', A), ('B', B), ('C', C)):
        for x, iid in zip(spread(len(ids)), ids): anc.append(('floor', round(x), ROWY[row], iid)); place[iid] = (x, ROWY[row])
    for x, iid in zip(WALLX, W): anc.append(('wall', x, WALLY, iid))
    for iid, host in props:
        n = sum(1 for q in props if q[1] == host); k = sum(1 for q in props[:props.index((iid, host))] if q[1] == host)
        if isinstance(host, int):
            f = fxs[host]; sf = f['surf']; x0, x1 = sf['x0'], sf['x1']; y = sf['y']
        else:
            hx, hy = place[host]; hw, hh = GEOF(host); x0, x1 = hx - hw * 0.34, hx + hw * 0.34; y = hy - hh * 0.72
        w = byid[iid]['w'] * SIZE_F[byid[iid]['cls']]; step = (x1 - x0) / max(n, 1); anc.append(('table', round(x0 + step * (k + 0.5)), round(y), iid))
    return dict(id=rid, name=name, group=grp, unlock=unlock, wall=wallc, floor=floorc, pattern=pat, floorKind=fk, fixtures=fxs, anchors=[dict(id=f'{rid}_{i}', slot=a[0], x=a[1], y=a[2], want=a[3]) for i, a in enumerate(anc, 1)])
# 가구 주제(theme): 방에 놓을 수 있는 것을 제한한다. 명시한 것 외에는 세트로 기본값(아래 DEFAULT_THEME).
THEME = {}
def th(t, *ids):
    for i in ids: THEME[i] = t
th('living', 'b_tv', 'b_sofa', 'b_lamp', 'g_cushion', 'p_remote', 'b_rug', 'p_phone', 'p_film', 'p_clock', 'b_semo_home'); th('eat', 'b_table', 'p_pack1', 'u_fridge', 'u_cart', 't_bowl', 'u_crate', 'u_sidedish', 'p_rice', 'p_kimchi', 'p_mix', 'p_lunch', 'g_lunch', 'g_teaset', 'u_eggtray', 'p_label', 'p_tea')
th('store', 'u_toybox', 'p_points', 'u_drawer', 'u_basket', 'u_shelf', 'u_label', 'u_closet', 'u_box', 'u_env', 'u_pill', 'u_socks', 'p_pill', 'a_shelf'); th('deco', 'b_plant', 'a_frame', 'a_photo', 'a_calendar', 'p_photo', 'a_album', 'a_scrapbook', 'a_trophy', 'a_polaroid', 'b_clock', 'a_ribbon', 'a_medal', 'p_flower', 'q_game_1', 'q_game_2', 'q_game_3', 'a_garland', 'a_cork', 'a_film', 'q_type_nemo0', 'q_type_semo0', 'q_type_dong0', 'p_wreath', 'e_candy')
th('travel', 'b_suitcase', 'a_camera', 'a_map', 'a_postcard', 'p_world', 'p_pass', 'p_bagt', 'p_globe'); th('study', 'b_shelf', 'b_dong_study', 'b_globe', 'g_stool', 'p_chair', 'a_magnifier', 'a_diary', 'p_book', 'p_vio', 'p_env')
th('outdoor', 'o_fence', 'm_garden', 'm_bench', 'o_mailbox', 'm_jar', 'm_cat', 'm_sunflower', 'm_flowerrow', 'o_sign', 'o_lantern', 'm_laundry', 'o_doghouse', 'o_flowerpot', 'o_bench', 'p_ra', 'g_lantern2', 's2_acorn')
th('entry', 'u_shoerack', 'n_plate', 'q_plate_nemo', 'u_bagrack', 'u_umbrella'); th('sleep', 'b_bed', 'y_pillow', 'y_quilt', 'y_moon', 'k_ch4', 'y_book'); th('story', 's_tree', 'k_party')
for tid in ('pigs', 'bears', 'shoes', 'kongjwi', 'heungbu', 'bremen', 'hok', 'axe', 'sun', 'ant', 'pino', 'jack', 'gyeonwoo', 'ureng', 'hare', 'brothers', 'snowqueen', 'fairywood', 'rabbitliver', 'magpie', 'tigerpersimmon', 'redhood', 'hansel', 'puss'): th('story', 't_%s_a' % tid, 't_%s_k' % tid)
th('wash', 'y_cup', 'y_cup2', 'y_paste', 'y_soap', 'y_towel', 'y_mat', 'y_duck', 'y_hanger'); th('deco', 'y_clock', 'y_star', 'w_frame', 'w_frame_gold', 'w_frame_pink', 'w_garland', 'w_balloons', 'w_stars', 'w_rainbow', 'kg_cloud', 'kg_star', 'kg_rainbow', 'kc_leaf', 'kc_cherry', 'kc_tulip', 'k_ch11', 'k_ch13')
th('play', 'y_toybox', 'k_train', 'y_ball', 'kg_bear', 'kg_drum', 'kg_ball2', 'kg_train2', 'kg_kite', 'k_ch5', 'k_ch6', 'k_ch7', 'k_ch9', 'k_ch14', 'kc_tube', 'kc_acorn', 'kc_snowman'); th('wear', 'y_hat', 'y_boots', 'k_ch8', 'kc_mitten', 'w_crown'); th('eat', 'y_bowl', 'y_spoon', 'k_ch3', 'k_ch10', 'k_ch12', 'k_ch15', 'kc_icecream')
DEFAULT_THEME = {'kitchen': 'eat', 'storage': 'store', 'photo': 'deco', 'outer': 'outdoor', 'yardlife': 'outdoor', 'badge': 'deco', 'story_a': 'story', 'story_k': 'story', 'season': 'deco', 'season2': 'deco', 'event': 'deco', 'gift': 'living', 'kseason': 'deco', 'kgift': 'play', 'wall': 'deco', 'build': 'living', 'kid': 'play', 'daybath': 'wash', 'theme_cafe': 'living', 'theme_hanok': 'living', 'theme_camp': 'outdoor', 'theme_lib': 'living'}
for i in items: i['theme'] = THEME.get(i['id']) or DEFAULT_THEME.get(i['set'], 'deco')
import os as _os
if _os.path.exists('data/furniture_lines.json'):      # 가구 한 줄 이야기(A20, tools/furniture_lines_build.py)
    _FL = json.load(open('data/furniture_lines.json', encoding='utf-8'))
    for i in items:
        if i['id'] in _FL: i['line'] = _FL[i['id']]
        else: i.pop('line', None)
json.dump(R, open('data/room_items.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
# 방마다 허용 주제 — 주제 밖 소품은 맞는 방(아이 방·마당 등)에 놓는다
ROOM_THEMES = {'nemo': ['living', 'eat', 'store', 'deco', 'story'], 'kitchen': ['eat', 'store'], 'semo': ['travel', 'deco', 'living', 'store'], 'dong': ['study', 'deco', 'living'], 'yard': ['outdoor', 'eat', 'story'], 'entrance': ['entry', 'store', 'deco', 'outdoor'], 'upstairs': ['sleep', 'store', 'living', 'deco', 'story'], 'garden': ['outdoor', 'eat', 'story'], 'attic': ['story', 'living', 'deco', 'store', 'sleep'], 'roof': ['story', 'outdoor', 'deco'],
               'bath': ['wash', 'deco'], 'kid': ['sleep', 'play', 'deco', 'story'], 'wardrobe': ['wear', 'deco', 'story'], 'dining': ['eat', 'deco', 'story'], 'toyroom': ['play', 'deco', 'story']}
ROOMSPEC = [  # id, 이름, 그룹, 해금, 벽색, 바닥색, 벽무늬, 바닥, fixtures, 뒷줄A, 가운뎃줄B, 앞줄C, 벽, 소품[(id, 올라설 곳: fixture 번호 | 가구 id)]
    ('nemo', '네모네 거실', 'adult', 1, '#FFE3C2', '#E3B27F', 'square', 'wood', [], ['b_tv', 'b_sofa'], ['b_table', 'b_plant'], ['b_lamp', 'u_toybox', 'g_cushion'], ['a_frame', 'a_photo', 'a_calendar'], [('p_remote', 'b_tv'), ('p_photo', 'b_tv'), ('p_pack1', 'b_table'), ('p_points', 'b_table')]),
    ('kitchen', '네모네 주방', 'adult', 3, '#FFF1C9', '#E8D8B8', 'dot', 'tile', [FX('counter', 70, 196, 200, 48, surf=dict(y=196, x0=84, x1=262))], ['u_fridge'], ['u_drawer', 'u_cart', 't_bowl'], ['u_crate', 'u_basket', 'g_lunch'], ['u_sidedish', 'u_shelf', 'u_label'], [('p_rice', 0), ('p_kimchi', 0), ('p_mix', 0), ('p_lunch', 0)]),
    ('semo', '세모네 신혼집', 'adult', 5, '#D8F0FF', '#D8E2EE', 'triangle', 'wood', [FX('desk', 60, 236, 160, 44, surf=dict(y=236, x0=74, x1=214))], ['b_semo_home', 'a_shelf'], ['b_suitcase', 'a_camera'], ['a_album', 'a_scrapbook', 'a_trophy'], ['a_map', 'a_polaroid', 'a_postcard'], [('p_world', 0), ('p_pass', 0), ('p_bagt', 0), ('p_globe', 0)]),
    ('dong', '동그라미네 서재', 'adult', 8, '#E2E6FA', '#C7CBE0', 'circle', 'wood', [FX('desk', 160, 232, 160, 44, surf=dict(y=232, x0=174, x1=314))], ['b_shelf', 'b_dong_study'], ['b_globe', 'g_stool'], ['p_chair', 'a_magnifier', 'a_diary'], ['b_clock', 'a_ribbon', 'a_medal'], [('p_book', 0), ('p_vio', 0), ('p_flower', 0), ('p_env', 0)]),
    ('yard', '마당·골목', 'adult', 10, '#CFEFFF', '#B4DE98', 'none', 'grass', [FX('table', 90, 228, 150, 40, surf=dict(y=228, x0=100, x1=226))], ['o_fence', 'm_garden'], ['m_bench', 'o_mailbox'], ['m_jar', 'm_cat', 'm_sunflower', 'm_flowerrow'], ['o_sign', 'o_lantern', 'm_laundry'], [('u_eggtray', 0), ('p_label', 0), ('p_tea', 0), ('g_teaset', 0)]),
    ('garden', '뒷마당', 'adult', 22, '#D6F1FF', '#A9D98C', 'none', 'grass', [FX('table', 96, 226, 140, 40, surf=dict(y=226, x0=106, x1=222))], ['o_well', 'm_persimmon', 'o_pond'], ['m_coop', 'o_swing', 'o_gate'], ['m_bike', 'm_pumpkin', 'm_radish', 'm_duck'], ['m_chime', 'm_butterfly', 'o_window'], [('m_pepper', 0), ('m_bucket', 0), ('m_rooster', 0)]),   # 집 Lv22 — 마당이 뒤로 넓어짐(마당 전용 소품 칸)
    ('entrance', '현관', 'adult', 12, '#F4E4D0', '#CBA980', 'square', 'tile', [FX('counter', 150, 220, 170, 44, surf=dict(y=220, x0=164, x1=306))], ['u_shoerack', 'u_closet'], ['o_doghouse', 'o_flowerpot'], ['q_game_1', 'q_game_2', 'u_umbrella'], ['n_plate', 'q_plate_nemo', 'u_bagrack'], [('u_env', 0), ('u_pill', 0), ('u_socks', 0), ('p_pill', 0)]),
    ('upstairs', '2층', 'adult', 15, '#FDE8F0', '#E5C7B0', 'dot', 'wood', [FX('desk', 24, 236, 150, 44, surf=dict(y=236, x0=38, x1=164))], ['b_bed', 'b_rug'], ['u_box', 't_pino_a'], ['t_sun_a', 't_ant_a', 't_jack_a'], ['a_garland', 'a_cork', 'a_film'], [('p_phone', 0), ('p_film', 0), ('p_clock', 0), ('p_wreath', 0)]),
    ('attic', '다락방', 'adult', 25, '#F3E6FF', '#D9BE9C', 'dot', 'wood', [FX('desk', 40, 236, 150, 44, surf=dict(y=236, x0=54, x1=176))], ['t_bears_a', 't_hok_a', 't_axe_a'], ['t_gyeonwoo_a', 't_ureng_a', 't_hare_a', 't_brothers_a'], ['t_snowqueen_a', 'g_flowerpot', 'g_hanbok'], ['g_mirror', 'g_apron', 'g_postcard'], [('g_pen', 0), ('g_chess', 0), ('g_compass', 0)]),   # 집 Lv25 — 2층 위로 다락이 열림(옛이야기 인형·선물 칸)
    ('roof', '옥상', 'adult', 20, '#BFE6FF', '#CFC8BE', 'none', 'tile', [FX('table', 190, 232, 140, 40, surf=dict(y=232, x0=200, x1=318))], ['s_tree', 'o_bench'], ['t_pigs_a', 't_shoes_a'], ['t_kongjwi_a', 't_heungbu_a', 't_bremen_a'], ['q_type_nemo0', 'q_type_semo0', 'q_type_dong0'], [('p_ra', 0), ('g_lantern2', 0), ('e_candy', 0), ('s2_acorn', 0)]),
    ('bath', '욕실', 'kid', 1, '#DDF3F8', '#CFE6F0', 'circle', 'tile', [FX('sink', 40, 236, 160, 56, surf=dict(y=228, x0=64, x1=190))], ['y_mat'], ['y_duck'], [], ['y_hanger', 'y_towel', 'y_clock'], [('y_cup', 0), ('y_paste', 0), ('y_soap', 0), ('y_cup2', 0)]),
    ('kid', '아이 방', 'kid', 3, '#FFF0B8', '#F2C98A', 'triangle', 'wood', [FX('bed', 24, 330, 150, 70, surf=dict(y=300, x0=40, x1=160)), FX('desk', 214, 236, 110, 40, surf=dict(y=236, x0=226, x1=312))], ['y_toybox', 'k_train'], ['k_party', 'kg_bear', 'kg_drum'], ['y_pillow', 'y_quilt', 'kg_ball2', 'k_ch4'], ['w_frame', 'y_moon', 'kg_cloud'], [('y_book', 1)]),
    ('wardrobe', '옷방', 'kid', 6, '#FFE0E8', '#E8C7A8', 'dot', 'wood', [], ['k_ch8', 't_snowqueen_k'], ['y_boots', 't_bears_k', 't_hok_k'], ['t_pino_k', 't_shoes_k', 'kc_mitten'], ['y_hat', 'w_crown', 'w_garland'], []),
    ('dining', '밥 먹는 곳', 'kid', 9, '#E8F5C8', '#DDBF92', 'square', 'wood', [FX('table', 70, 276, 190, 56, surf=dict(y=276, x0=92, x1=246))], ['k_ch3', 'k_ch12'], ['t_heungbu_k', 'k_ch15', 'kc_icecream'], ['t_kongjwi_k', 'k_ch10', 't_ant_k'], ['w_frame_pink', 'w_balloons', 'kc_leaf'], [('y_bowl', 0), ('y_spoon', 0)]),
    ('toyroom', '장난감 방', 'kid', 12, '#D8ECFF', '#C8D8B8', 'circle', 'grass', [], ['k_ch5', 'k_ch9'], ['y_ball', 'k_ch7', 'kc_tube'], ['kg_train2', 'kc_snowman', 'kc_acorn', 't_sun_k'], ['w_rainbow', 'kg_kite', 'kg_rainbow'], []),
]
ROOMS = [layout(r) for r in ROOMSPEC]
for _r in ROOMS: _r['themes'] = ROOM_THEMES[_r['id']]   # 방 허용 주제(엔진도 같은 규칙으로 놓는다)
_bad = [(r['id'], x['want'], byid[x['want']]['theme']) for r in ROOMS for x in r['anchors'] if byid[x['want']]['theme'] not in ROOM_THEMES[r['id']]]
assert not _bad, ('방 주제 밖 가구', _bad)
_used = collections.Counter(a['want'] for r in ROOMS for a in r['anchors'])
assert not [k for k, v in _used.items() if v > 1], ('앵커 가구 중복', [k for k, v in _used.items() if v > 1])
for r in ROOMS:
    for a in r['anchors']: assert a['want'] in byid, ('칸 가구 없음', r['id'], a['want'])
    print('  방', r['id'], len(r['anchors']), '자리')
def mkrooms(g): return [r for r in ROOMS if r['group'] == g]
N, SEMO, DONG, KID1, KID2, KID3, BABY, MOM, DAD = 'nemo_dad.joy', 'wife.joy', 'dong_dad.warm', 'nemo_kids.kid1', 'nemo_kids.kid2', 'nemo_kids.kid3', 'baby.joy', 'nemo_mom.joy', 'nemo_dad.joy'
def cut(text, *chars, bg='indoor2'): return dict(bg=bg, text=text, chars=list(chars))
STORY = [
    dict(ch=1, room='nemo', group='adult', title='일곱 식구가 앉을 자리', tasks=[('t1', ['b_table'], '큰 상'), ('t2', ['a_frame'], '벽 액자'), ('t3', ['b_sofa'], '소파'), ('t4', ['b_tv'], 'TV장'), ('t5', ['a_calendar'], '달력')],
         cuts=[cut('빈 거실. 네모 아빠가 짐 상자 사이에 서서 말했다. 「일곱이 앉으려면 큰 상부터네.」', N, MOM), cut('상을 놓자 아이들이 우르르 모였다. 막내가 와락 안겼다.', BABY, KID3), cut('시끌시끌한 저녁. 이게 제일 좋은 하루인지도 모른다.', N, MOM, BABY, KID1)], reward=dict(cozy=20, unlock='kitchen')),
    dict(ch=2, room='kitchen', group='adult', title='엄마의 밥상', tasks=[('t1', ['t_bowl'], '밥그릇'), ('t2', ['u_fridge'], '냉장고'), ('t3', ['p_rice'], '밥솥'), ('t4', ['u_sidedish'], '반찬통 선반'), ('t5', ['p_kimchi'], '김장 김치')],
         cuts=[cut('엄마가 부엌을 둘러봤다. 「밥을 해 먹어야 집이지.」', MOM), cut('밥솥에서 김이 나자 식구들이 슬금슬금 모였다.', MOM, N, KID1), cut('같이 먹는 밥 한 끼. 말이 필요 없다.', N, MOM, BABY)], reward=dict(cozy=25, unlock='semo')),
    dict(ch=3, room='semo', group='adult', title='둘만의 여행 기념품 벽', tasks=[('t1', ['b_suitcase'], '여행 가방'), ('t2', ['a_map'], '옛 지도'), ('t3', ['p_world'], '세계일주 지도'), ('t4', ['b_lamp'], '세모 램프'), ('t5', ['a_camera'], '필름 카메라')],
         cuts=[cut('세모네 신혼집은 아직 휑했다. 세모 남편이 벽을 보며 웃었다. 「여기에 유럽, 저기엔 남미.」', 'husband.joy', SEMO, bg='indoor'), cut('가방을 놓고 지도를 붙이니, 둘은 벌써 비행기 안에 앉은 것 같았다.', 'husband.joy', SEMO, bg='indoor'), cut('「다음엔 어디 갈까요?」 둘만의 계획이 벽에 가득 찼다.', 'husband.joy', SEMO, bg='indoor')], reward=dict(cozy=30, unlock='dong')),
    dict(ch=4, room='dong', group='adult', title='빈 의자 하나', tasks=[('t1', ['b_shelf'], '책장'), ('t2', ['p_chair'], '네 번째 의자'), ('t3', ['b_clock'], '벽시계'), ('t4', ['b_globe'], '지구본'), ('t5', ['p_book'], '책')],
         cuts=[cut('동그라미 서재는 조용하고 정돈됐다. 의자 하나만 비어 있었다.', DONG, bg='indoor'), cut('아들이 의자를 끌어다 놓았다. 「아빠, 같이 먹어요.」', DONG, 'dong_dad.good', bg='indoor'), cut('조용한 서재에 처음으로 사람 소리가 났다.', DONG, 'dong_dad.good', bg='indoor')], reward=dict(cozy=35, unlock='yard')),
    dict(ch=5, room='yard', group='adult', title='다음 모임은 우리 집 마당에서', tasks=[('t1', ['o_fence'], '담장'), ('t2', ['m_bench'], '평상'), ('t3', ['o_mailbox'], '우체통'), ('t4', ['m_garden'], '텃밭'), ('t5', ['o_lantern'], '등불')],
         cuts=[cut('「다음 모임은 우리 집에서 하자.」 세 사람이 마당을 보았다.', N, SEMO, DONG, bg='field'), cut('평상을 놓고 담장을 세우니 골목이 정겨워졌다.', N, DONG, bg='field'), cut('이 나이엔 그냥 건강하면 된다. 마당에 웃음이 퍼졌다.', N, SEMO, DONG, bg='field')], reward=dict(cozy=40, unlock='entrance')),
    dict(ch=6, room='entrance', group='adult', title='우리 집 이름', tasks=[('t1', ['n_plate'], '도형 문패'), ('t2', ['u_shoerack'], '신발장'), ('t3', ['q_plate_nemo'], '네모 문패'), ('t4', ['o_doghouse'], '강아지 집')],
         cuts=[cut('문패를 달면 비로소 우리 집이다.', N, MOM, bg='home'), cut('신발이 가지런히 놓였다.', N, MOM, bg='home')], reward=dict(cozy=45, unlock='upstairs')),
    dict(ch=7, room='upstairs', group='adult', title='아이들이 크면', tasks=[('t1', ['b_bed'], '네모 침대'), ('t2', ['u_closet'], '옷장'), ('t3', ['t_pino_a'], '피노키오 인형'), ('t4', ['b_rug'], '동그라미 러그')],
         cuts=[cut('2층엔 아이들 자리가 필요하다. 축구화 신고 뛰어다닐 아이들 자리.', MOM, KID3), cut('이불을 깔자 아이들이 먼저 누웠다.', KID1, KID2, KID3)], reward=dict(cozy=50, unlock='roof')),
    dict(ch=8, room='roof', group='adult', title='계절이 오는 집', tasks=[('t1', ['s_tree'], '연말 트리'), ('t2', ['t_pigs_a'], '벽돌집 미니어처'), ('t3', ['t_shoes_a'], '요정의 작은 구두')],
         cuts=[cut('옥상에서 내려다보니 우리 집이 가득 찼다.', N, MOM, SEMO, DONG, bg='night'), cut('계절이 바뀔 때마다 이 집에 새 이야기가 놓일 것이다.', N, SEMO, DONG, bg='night')], reward=dict(cozy=60, unlock=None)),
    # 유아: 욕실(⑩ 첫 보상이 양치) → 아이 방 → 옷방 → 밥 → 장난감 방
    dict(ch=1, room='bath', group='kid', title='깨끗이 씻자', tasks=[('t1', ['y_cup'], '칫솔 컵'), ('t2', ['y_paste'], '치약'), ('t3', ['y_hanger'], '옷걸이')], cuts=[cut('', BABY, MOM, bg='home'), cut('', BABY, KID1, bg='home')], reward=dict(cozy=15, unlock='kid')),
    dict(ch=2, room='kid', group='kid', title='막둥이의 첫 방', tasks=[('t1', ['k_party'], '잔칫집'), ('t2', ['w_frame'], '내 그림 액자'), ('t3', ['y_pillow'], '베개')], cuts=[cut('', BABY, KID1, bg='home')], reward=dict(cozy=20, unlock='wardrobe')),
    dict(ch=3, room='wardrobe', group='kid', title='옷방', tasks=[('t1', ['y_hat'], '모자걸이'), ('t2', ['k_ch8'], '밀짚모자 걸이'), ('t3', ['y_boots'], '장화')], cuts=[cut('', BABY, MOM, bg='home')], reward=dict(cozy=25, unlock='dining')),
    dict(ch=4, room='dining', group='kid', title='밥 먹는 곳', tasks=[('t1', ['y_bowl'], '밥그릇'), ('t2', ['y_spoon'], '수저 통'), ('t3', ['k_ch3'], '무 인형')], cuts=[cut('', BABY, DAD, bg='home')], reward=dict(cozy=30, unlock='toyroom')),
    dict(ch=5, room='toyroom', group='kid', title='장난감 방', tasks=[('t1', ['k_ch7'], '소리 나팔'), ('t2', ['y_ball'], '공 바구니'), ('t3', ['k_ch5'], '도형 블록')], cuts=[cut('', BABY, KID3, bg='home')], reward=dict(cozy=35, unlock=None)),
]

# A9 집 이야기 보강(성인): 장마다 기승전결 4컷으로 — 가구를 놓는 손맛이 이야기로 이어지도록 중간 컷·마무리 컷을 더한다(행복 우선, 설명하지 않는 결말). [제안]
_X = {
    1: ([2, cut('TV장을 놓고 소파에 앉자 첫째가 리모컨을 잡았다. 「오늘은 내가 고를래!」 막내가 슬쩍 쿠션을 끼워 넣었다.', KID1, BABY)],),
    2: ([2, cut('반찬통마다 김치가 가득. 엄마가 숟가락 위에 한 점 얹어 주었다. 「많이 먹어. 엄마 밥이 제일 맛있지?」', MOM, KID1)],),
    3: ([2, cut('필름 카메라로 찰칵. 사진 속 세모 아내의 웃음이 번졌다. 「이 벽엔 우리가 다녀온 곳만 붙일 거야.」', 'wife.joy', 'husband.joy', bg='indoor')],),
    4: ([2, cut('책장에서 책을 꺼내 펼치자 서재 시계가 똑딱거렸다. 천천히, 정확하게, 그래도 따뜻하게.', DONG, bg='indoor')],),
    5: ([2, cut('우체통에 쪽지가 한 장 와 있었다. 「텃밭 상추 가져가요!」 이웃의 글씨였다.', N, SEMO, bg='field')],),
    6: ([1, cut('「문패에 도형 하나만 새기면 되지?」 아빠가 망치를 들자 아이들이 몰려와 구경했다.', N, KID3, bg='home')], [3, cut('강아지 집 앞에서 막둥이가 인사했다. 「안녕! 이제 여기가 우리 집이야.」', BABY, MOM, bg='home')]),
    7: ([1, cut('침대는 하나인데 베개는 셋. 누가 창가를 차지할지 가위바위보가 시작됐다.', KID1, KID2, KID3)], [3, cut('불을 끄자 셋의 숨소리가 포개졌다. 엄마가 문틈으로 오래 들여다보았다.', MOM)]),
    8: ([1, cut('트리 불빛이 켜지자 마당 건너 이웃도 창문을 열었다. 「올해도 잘 지냈지요?」', N, MOM, bg='night')], [3, cut('별이 가득한 밤. 우리 집은 오늘도 한 칸 더 따뜻해졌다.', N, MOM, SEMO, DONG, bg='night')]),
}
for _c in STORY:
    if _c['group'] == 'adult' and _c['ch'] in _X:
        for idx, ct in sorted(_X[_c['ch']][0:1] + _X[_c['ch']][1:], key=lambda z: z[0]):
            _c['cuts'].insert(min(idx, len(_c['cuts'])), ct)
assert all(len(c['cuts']) == 4 for c in STORY if c['group'] == 'adult'), [(c['ch'], len(c['cuts'])) for c in STORY if c['group'] == 'adult']
for s in STORY:
    s['tasks'] = [dict(id=t[0], need=t[1], label=t[2]) for t in s['tasks']]
    for t in s['tasks']:
        for n in t['need']: assert n in byid, ('없는 가구', n)
# 손님: 문턱 150(1장 완료 무렵)부터 · 선물 2개 — 대사 [제안], 유아는 글 없이 아이콘
GUESTS = [   # 성인 7명 = docs/24 「손님 = 일하는 앱」 표와 같은 사람(한 사람 한 줄). who 이름 · app 일하는 앱 · gifts 3번째가 표의 소품(3번째 방문 때)
    dict(id='wife', char='wife.smug', group='adult', who='세모 아내', app='당신은 어느 도형?', need=150, likes=['b_sofa', 'u_fridge'], lines=['이 소파 앉아도 돼요?', '냉장고가 이렇게 크니 좋겠다!', '오늘의 나를 점쳐 봤는데, 우리 집이 정답이에요.'], gifts=['g_cushion', 'g_mirror', 'q_plate_semo'], seasonLines=['벚꽃이 폈어요! 소풍 도시락 싸 올게요.', '더워도 예쁘게! 양산은 필수죠.', '단풍 든 길을 걸으니 기분이 들떠요!', '눈이 와요! 오늘의 나는 눈사람이래요.'], seasonGift='s2_tulip'),
    dict(id='dong_dad', char='dong_dad.calm', group='adult', who='동그라미 아빠', app='다른 그림 찾기', need=320, likes=['b_shelf', 'b_clock'], lines=['책장이 정갈하군요.', '시계 소리가 좋네요.', '액자가 한 칸 비어 있었습니다. 채워 두었어요.'], gifts=['g_pen', 'g_chess', 'a_frame'], seasonLines=['꽃가루가 날립니다. 창문은 닫아 두었어요.', '그늘이 시원하군요. 책 한 권 읽고 갑니다.', '낙엽 밟는 소리가 좋네요. 조용합니다.', '눈 오는 밤은 정리하기 좋습니다.'], seasonGift='s2_acorn'),
    dict(id='nemo_mom', char='nemo_mom.good', group='adult', who='네모 엄마', app='정리의 달인', need=520, likes=['t_bowl', 'p_rice'], lines=['밥솥이 딱 우리 집 거네!', '밥그릇이 예쁘네요.', '선반이 모자라 보여서 하나 가져왔어요.'], gifts=['g_lunch', 'g_apron', 'u_shelf'], seasonLines=['냉이 된장국 끓였어요. 한 그릇 해요!', '수박 한 통 사 왔어요, 같이 먹어요.', '송편 빚다 왔어요. 모양은 비밀!', '김장 김치 한 통 가져왔어요.'], seasonGift='s2_tangerine'),
    dict(id='husband', char='husband.joy', group='adult', who='세모 남편', app='도형 합치기', need=760, likes=['b_suitcase', 'p_world'], lines=['이 가방이면 어디든 가겠는데?', '지도에 우리 집도 표시해 줘요.', '이삿짐 싸다 하나 남았어. 여기 두고 갈게!'], gifts=['g_compass', 'g_postcard', 'p_bagt'], seasonLines=['꽃놀이 가자더니 짐부터 싸고 있어.', '여름 휴가 가방이 벌써 한가득이야!', '가을 여행은 단풍이지. 지도에 표시해 둘게.', '겨울엔 온천이다! …가방은 내가 들게.'], seasonGift='s2_tube'),
    dict(id='nemo_grandma', char='nemo_grandma.good', group='adult', who='네모 할머니', app='세 가족 식탁', need=1050, likes=['m_bench', 'm_garden'], lines=['평상에 앉으면 시간이 천천히 가지.', '텃밭 상추 좀 뜯어 가도 되냐.', '뜨끈한 국 한 그릇 먹고 가거라.'], gifts=['g_teaset', 'g_flowerpot', 's_tteokguk'], seasonLines=['봄나물 좀 뜯어 왔다. 데쳐 먹어라.', '평상에 앉아 부채질하면 이게 피서지.', '감 따 왔다. 하나씩 먹어라.', '아랫목이 따끈하니 좋구나. 귤 까 줄게.'], seasonGift='s2_persimmon'),
    dict(id='nemo_dad_g', char='nemo_dad.good', group='adult', who='네모 아빠', app='도형 블록', need=1400, likes=['o_fence', 'o_mailbox'], lines=['담장이 튼튼하네요.', '우체통에 편지 왔나?', '벽돌이 남아서 한 줄 더 쌓아 봤어요!'], gifts=['g_pepper', 'g_hanbok', 'o_bricks'], seasonLines=['담장 밑에 꽃을 심었어요. 물 좀 줄까요?', '더위엔 선풍기죠! 한 대 놓고 갑니다.', '낙엽 쓸어 모으는 중이에요. 운동이죠!', '눈 치우다 땀났어요. 담장 위 눈사람은 덤!'], seasonGift='s2_fan'),
    dict(id='hana_a', char='nemo_kids.kid1', group='adult', who='하나(네모네 큰딸)', app='세 가족 짝 맞추기', need=1750, likes=['p_chair', 'b_globe'], lines=['의자가 하나 더 있으니 든든해요.', '지구본 돌려 보고 싶어요.', '짝이 맞았어요! 바구니는 선물이에요.'], gifts=['g_stool', 'g_lantern2', 'u_basket'], seasonLines=['연을 날려요! 바람이 딱이에요.', '물놀이 가고 싶어요! 튜브 챙겼어요?', '도토리 주웠어요. 다람쥐 몫도 남겨 뒀어요.', '눈싸움해요! 편 갈라서요!'], seasonGift='s2_kite'),
    dict(id='hana', char='nemo_kids.kid1', group='kid', who='하나 누나', app='놀이터', need=60, likes=['k_train', 'y_ball'], lines=[], gifts=['kg_star', 'kg_cloud']),
    dict(id='dong_dad_k', char='dong_dad.joy', group='kid', who='동그라미 아저씨', app='놀이터', need=150, likes=['k_party', 'y_toybox'], lines=[], gifts=['kg_bear', 'kg_ball2']),
    dict(id='wife_k', char='wife.joy', group='kid', who='세모 이모', app='놀이터', need=260, likes=['w_frame', 'y_pillow'], lines=[], gifts=['kg_kite', 'kg_drum']),
    dict(id='nemo_dad_k', char='nemo_dad.joy', group='kid', who='네모 아빠', app='놀이터', need=380, likes=['y_bowl', 'y_cup'], lines=[], gifts=['kg_rainbow', 'kg_train2']),
]
for _g in GUESTS:
    if _g['group'] == 'adult': assert len(_g.get('seasonLines', [])) == 4 and _g['seasonGift'] in byid, ('손님 계절 대사 4·선물', _g['id'])
chars = J('data/chars.json')
for g in GUESTS:
    assert g['char'] in chars, ('손님 그림 없음', g['char'])
    for n in g['likes'] + g['gifts']: assert n in byid, ('손님 가구 없음', g['id'], n)

# 테마 프리셋(A1): 가진 가구만 한 번에 놓는다. 자리 이름은 방 앵커와 같은 격자(F1~F8 바닥, W1~W3 벽). on = 소품을 올릴 가구(없으면 그 방의 아무 면).
GRID = {'F1': (90, 298), 'F2': (250, 298), 'F3': (58, 368), 'F4': (170, 368), 'F5': (282, 368), 'F6': (58, 428), 'F7': (170, 428), 'F8': (282, 428), 'W1': (52, 108), 'W2': (118, 108), 'W3': (184, 108)}
def PS(id, name, icon, room, note, floor, wall, props):
    return dict(id=id, name=name, icon=icon, room=room, group='adult', note=note, parts=[dict(id=i, x=GRID[g][0], y=GRID[g][1]) for g, i in floor] + [dict(id=i, x=GRID[g][0], y=GRID[g][1]) for g, i in wall] + [dict(id=i, on=on) for on, i in props])
PRESETS = [
    PS('p_hansik', '한식 저녁상', '🍚', 'kitchen', '큰 상에 밥·김치·반찬. 냉장고와 반찬 선반까지.', [('F1', 'u_fridge'), ('F2', 'u_cart'), ('F4', 'b_table'), ('F6', 't_bowl'), ('F8', 'u_crate')], [('W1', 'u_sidedish'), ('W2', 'u_shelf'), ('W3', 'u_label')], [('b_table', 'p_pack1'), ('b_table', 'p_rice'), ('b_table', 'p_kimchi'), ('b_table', 'p_label'), ('b_table', 'y_bowl'), ('b_table', 'y_spoon'), (None, 'g_lunch'), (None, 'g_teaset')]),
    PS('p_tea', '차 한잔 코너', '🍵', 'kitchen', '찻주전자와 커플 컵, 꽃 한 송이.', [('F4', 'b_table'), ('F2', 'b_plant'), ('F6', 'u_basket')], [('W1', 'a_wallclock'), ('W2', 'a_garland')], [(None, 'g_teaset'), (None, 'p_tea'), (None, 'p_pair'), (None, 'p_mix'), (None, 'p_flower')]),
    PS('p_movie', '영화의 밤', '🍿', 'nemo', '소파에 쿠션, TV 앞에 리모컨.', [('F1', 'b_tv'), ('F2', 'b_sofa'), ('F6', 'b_lamp'), ('F8', 'g_cushion'), ('F5', 'b_plant')], [('W1', 'a_garland'), ('W2', 'a_wallclock'), ('W3', 'a_frame')], [('b_tv', 'p_film'), ('b_tv', 'p_remote')]),
    PS('p_travel', '여행 기념 벽', '🧳', 'semo', '엽서·지도·즉석 사진을 벽에 가득.', [('F1', 'b_semo_home'), ('F3', 'b_suitcase'), ('F6', 'a_album'), ('F8', 'a_camera')], [('W1', 'a_map'), ('W2', 'a_postcard'), ('W3', 'a_polaroid')], [(None, 'p_world'), (None, 'p_pass'), (None, 'p_bagt'), (None, 'p_globe'), (None, 'g_compass')]),
    PS('p_study', '조용한 서재', '📚', 'dong', '책장, 지구본, 체스판.', [('F1', 'b_shelf'), ('F2', 'b_dong_study'), ('F3', 'b_globe'), ('F5', 'g_stool'), ('F7', 'a_magnifier')], [('W1', 'b_clock'), ('W2', 'a_medal'), ('W3', 'a_ribbon')], [(None, 'p_book'), (None, 'p_vio'), (None, 'g_chess'), (None, 'g_pen')]),
    PS('p_sleep', '포근한 잠자리', '🌙', 'upstairs', '침대와 러그, 벽엔 필름 줄.', [('F1', 'b_bed'), ('F2', 'b_rug'), ('F3', 'u_box')], [('W1', 'a_garland'), ('W2', 'a_cork'), ('W3', 'a_film')], [(None, 'p_phone'), (None, 'p_clock')]),
    PS('p_garden_farm', '뒷마당 닭장 살림', '🐔', 'garden', '우물과 닭장, 감나무 아래 물통.', [('F1', 'o_well'), ('F2', 'm_persimmon'), ('F3', 'm_coop'), ('F5', 'o_swing'), ('F7', 'm_bike')], [('W1', 'm_chime'), ('W2', 'm_butterfly'), ('W3', 'o_window')], [(None, 'm_pepper'), (None, 'm_bucket'), (None, 'm_rooster')]),
    PS('p_garden_harvest', '뒷마당 수확철', '🎃', 'garden', '호박·무·연못과 오리, 대문 앞 가을.', [('F1', 'o_pond'), ('F2', 'o_gate'), ('F3', 'm_pumpkin'), ('F5', 'm_radish'), ('F7', 'm_duck')], [('W1', 'm_chime'), ('W2', 'm_butterfly')], [(None, 'm_pepper'), (None, 'm_bucket')]),
    PS('p_attic_tales', '옛이야기 다락방', '📖', 'attic', '인형 선반과 거울, 엽서.', [('F1', 't_bears_a'), ('F2', 't_hok_a'), ('F3', 't_axe_a'), ('F4', 't_gyeonwoo_a'), ('F5', 't_ureng_a'), ('F7', 'g_flowerpot')], [('W1', 'g_mirror'), ('W2', 'g_apron'), ('W3', 'g_postcard')], [(None, 'g_pen'), (None, 'g_chess'), (None, 'g_compass')]),
    PS('p_yard_rest', '마당 평상 쉼터', '🌻', 'yard', '평상과 화단, 우체통, 담장 위 고양이.', [('F1', 'o_fence'), ('F2', 'm_garden'), ('F3', 'm_bench'), ('F5', 'o_mailbox'), ('F6', 'm_cat'), ('F8', 'm_flowerrow')], [('W1', 'o_sign'), ('W2', 'o_lantern'), ('W3', 'm_laundry')], [(None, 'm_jar'), (None, 'u_eggtray'), (None, 'p_tea')]),
    PS('p_entry_hello', '반가운 현관', '🚪', 'entrance', '신발장과 우산, 강아지 집, 문패.', [('F1', 'u_shoerack'), ('F2', 'u_closet'), ('F3', 'o_doghouse'), ('F5', 'o_flowerpot'), ('F7', 'u_umbrella')], [('W1', 'n_plate'), ('W2', 'q_plate_nemo'), ('W3', 'u_bagrack')], [(None, 'u_env'), (None, 'u_socks')]),
    PS('p_roof_night', '옥상 별밤', '🌌', 'roof', '나무와 벤치, 등불 아래 간식.', [('F1', 's_tree'), ('F2', 'o_bench'), ('F3', 't_pigs_a'), ('F5', 't_shoes_a')], [('W1', 'q_type_nemo0'), ('W2', 'q_type_semo0'), ('W3', 'q_type_dong0')], [(None, 'p_ra'), (None, 'g_lantern2'), (None, 'e_candy'), (None, 's2_acorn')]),
]
OLD_PRESETS = {'p_hansik', 'p_tea', 'p_movie', 'p_travel', 'p_study', 'p_sleep'}
byid_all = {i['id'] for i in items}
for pr in PRESETS:
    _rt = ROOM_THEMES[pr['room']]; _bad = [q['id'] for q in pr['parts'] if byid[q['id']]['theme'] not in _rt]; assert not _bad or pr['id'] in OLD_PRESETS, ('프리셋 가구가 방 주제 밖', pr['id'], _bad)      # 기존 6개는 예전 규칙 그대로(새 6개부터 방 주제 단언)
    assert pr['room'] in {r['id'] for r in mkrooms('adult')}, pr['room']
    for q in pr['parts']: assert q['id'] in byid_all, ('프리셋 가구 없음', pr['id'], q['id'])
D = dict(version=2, note='[제안] 우리 집 2.0 데이터. tools/housing_build.py 로 생성.', levels=levels, levelsKid=levelsKid, formula=dict(set=[[3, 0.10], [5, 0.25], ['all', 0.60]], harmony=30, style=30, fill=40, life=20), sizeF=SIZE_F, geom=dict(RW=340, RH=440, WALLH=150),
         rooms=mkrooms('adult') + mkrooms('kid'), themeSets=[dict(id=t['id'], name=t['name'], icon=t['icon'], lv=t['lv'], room=t['room'], items=[x[0] for x in t['items']], scene=t['scene']) for t in THEME_SETS], story=STORY, guests=GUESTS, presets=PRESETS, unlockLv={'adult': {'kitchen': 3, 'semo': 5, 'dong': 8, 'yard': 10, 'garden': 22, 'entrance': 12, 'upstairs': 15, 'attic': 25, 'roof': 20}, 'kid': {'kid': 3, 'wardrobe': 6, 'dining': 9, 'toyroom': 12}})
# 주간 꾸미기 도전(A24, 성인 집): 주마다 주제 하나(주 번호 순환) — 방 안에 그 주제에 맞는 가구를 need 개 놓으면 도장 한 개. 순위·벌점 없음. rule: k=style|tag|theme · v=값. 문구 [제안]
CHAL = [
    dict(id='cozy_living', name='포근한 거실', icon='🛋️', room='nemo', k='style', v='warm', need=5, tip='따뜻한 색 가구를 거실에 놓아 봐요'),
    dict(id='wood_study', name='나무 냄새 서재', icon='🪵', room='dong', k='style', v='wood', need=4, tip='나무 결이 보이는 가구가 어울려요'),
    dict(id='cool_yard', name='시원한 마당', icon='🧊', room='yard', k='style', v='cool', need=4, tip='파랗고 시원한 것들로 더위를 식혀요'),
    dict(id='party_yard', name='잔치 준비 마당', icon='🎉', room='yard', k='style', v='festive', need=5, tip='명절·기념일 장식으로 마당을 꾸며요'),
    dict(id='read_room', name='책 읽는 서재', icon='📚', room='dong', k='tag', v='read', need=3, tip='읽을 거리와 책상을 놓아 봐요'),
    dict(id='movie_night', name='영화 보는 밤', icon='🎬', room='semo', k='tag', v='watch', need=3, tip='볼 것과 앉을 것을 가까이 놓아요'),
    dict(id='big_table', name='한 상 차림 부엌', icon='🍲', room='kitchen', k='tag', v='eat', need=4, tip='먹는 것과 그릇을 상 위에 놓아요'),
    dict(id='nap_room', name='낮잠 자는 방', icon='😴', room='upstairs', k='tag', v='sleep', need=2, tip='포근히 잘 수 있는 것을 놓아 봐요'),
    dict(id='tale_attic', name='옛이야기 다락방', icon='📖', room='attic', k='theme', v='story', need=4, tip='옛이야기 소품을 다락에 모아 봐요'),
    dict(id='yard_out', name='바깥 마당 꾸미기', icon='🌿', room='yard', k='theme', v='outdoor', need=5, tip='바깥에 어울리는 가구를 놓아요'),
    dict(id='travel_desk', name='여행 책상', icon='🧳', room='semo', k='theme', v='travel', need=3, tip='여행 기념품을 한 자리에 모아요'),
    dict(id='seat_full', name='앉을 자리 가득', icon='🪑', room='nemo', k='tag', v='sit', need=4, tip='누구나 앉을 자리를 만들어 줘요'),
]
_theme_cnt = {}
for _i in items:
    if _i.get('room') != 'kid' and _i.get('set') not in ('kid', 'kseason', 'kgift', 'daybath', 'wall', 'story_k'):
        for _t in ('style', 'theme'): _theme_cnt[(_t, _i.get(_t))] = _theme_cnt.get((_t, _i.get(_t)), 0) + 1
        for _t in _i.get('tags', []): _theme_cnt[('tag', _t)] = _theme_cnt.get(('tag', _t), 0) + 1
for _c in CHAL: assert _theme_cnt.get((_c['k'], _c['v']), 0) >= _c['need'] + 1, ('도전을 채울 가구가 부족', _c['id'], _theme_cnt.get((_c['k'], _c['v'])))
assert len({c['id'] for c in CHAL}) == len(CHAL) and all(c['room'] in {r['id'] for r in mkrooms('adult')} for c in CHAL)
D['challenges'] = CHAL
json.dump(D, open('data/housing.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('src 앱별', dict(collections.Counter(i['src']['game'] for i in items))); print('housing.json 방', len(D['rooms']), '장', len(STORY), '손님', len(GUESTS), 'T(30)', T(30), 'T(10)', T(10), 'T(20)', T(20))
KG = ('kid', 'daybath', 'wall', 'story_k', 'kseason', 'kgift')
print('성인 cozy 합', sum(i['cozy'] for i in items if i['set'] not in KG), '유아 cozy 합', sum(i['cozy'] for i in items if i['set'] in KG), '성인 개수', sum(1 for i in items if i['set'] not in KG), '유아 개수', sum(1 for i in items if i['set'] in KG))

# A27: 포섭 이웃 손님(⑪ expedition_slice.json 을 읽어 housing.json 에 'neighbors' 를 덧붙인다 — 슬라이스 데이터가 바뀌면 이 빌드를 다시)
import subprocess as _sp, sys as _sys; _sp.run([_sys.executable, 'tools/neighbors_build.py'], check=True)
