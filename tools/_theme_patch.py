"""방마다 허용 주제(theme)로 앵커 가구를 제한한다(허브 QA: 유아 욕실에 배구공·구두·튜브·케이크·눈사람 금지). 가구에 theme 필드, 방에 themes, 빌더에 「앵커 가구 주제 ∈ 방 허용 주제」 단언. 멱등."""
import io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
p = 'tools/housing_build.py'; s = open(p, encoding='utf-8').read()
if 'ROOM_THEMES' in s: print('skip'); sys.exit()
a = s.index("ROOMSPEC = ["); b = s.index("ROOMS = [layout(r) for r in ROOMSPEC]")
NEW = r'''# 가구 주제(theme): 방에 놓을 수 있는 것을 제한한다. 명시한 것 외에는 세트로 기본값(아래 DEFAULT_THEME).
THEME = {}
def th(t, *ids):
    for i in ids: THEME[i] = t
th('living', 'b_tv', 'b_sofa', 'b_lamp', 'g_cushion', 'p_remote', 'b_rug', 'p_phone', 'p_film', 'p_clock', 'b_semo_home'); th('eat', 'b_table', 'p_pack1', 'u_fridge', 'u_cart', 't_bowl', 'u_crate', 'u_sidedish', 'p_rice', 'p_kimchi', 'p_mix', 'p_lunch', 'g_lunch', 'g_teaset', 'u_eggtray', 'p_label', 'p_tea')
th('store', 'u_toybox', 'p_points', 'u_drawer', 'u_basket', 'u_shelf', 'u_label', 'u_closet', 'u_box', 'u_env', 'u_pill', 'u_socks', 'p_pill', 'a_shelf'); th('deco', 'b_plant', 'a_frame', 'a_photo', 'a_calendar', 'p_photo', 'a_album', 'a_scrapbook', 'a_trophy', 'a_polaroid', 'b_clock', 'a_ribbon', 'a_medal', 'p_flower', 'q_game_1', 'q_game_2', 'q_game_3', 'a_garland', 'a_cork', 'a_film', 'q_type_nemo0', 'q_type_semo0', 'q_type_dong0', 'p_wreath', 'e_candy')
th('travel', 'b_suitcase', 'a_camera', 'a_map', 'a_postcard', 'p_world', 'p_pass', 'p_bagt', 'p_globe'); th('study', 'b_shelf', 'b_dong_study', 'b_globe', 'g_stool', 'p_chair', 'a_magnifier', 'a_diary', 'p_book', 'p_vio', 'p_env')
th('outdoor', 'o_fence', 'm_garden', 'm_bench', 'o_mailbox', 'm_jar', 'm_cat', 'm_sunflower', 'm_flowerrow', 'o_sign', 'o_lantern', 'm_laundry', 'o_doghouse', 'o_flowerpot', 'o_bench', 'p_ra', 'g_lantern2', 's2_acorn')
th('entry', 'u_shoerack', 'n_plate', 'q_plate_nemo', 'u_bagrack', 'u_umbrella'); th('sleep', 'b_bed', 'y_pillow', 'y_quilt', 'y_moon', 'k_ch4', 'y_book'); th('story', 's_tree', 'k_party')
for tid in ('pigs', 'bears', 'shoes', 'kongjwi', 'heungbu', 'bremen', 'hok', 'axe', 'sun', 'ant', 'pino', 'jack', 'gyeonwoo', 'ureng', 'hare', 'brothers', 'snowqueen'): th('story', 't_%s_a' % tid, 't_%s_k' % tid)
th('wash', 'y_cup', 'y_cup2', 'y_paste', 'y_soap', 'y_towel', 'y_mat', 'y_duck', 'y_hanger'); th('deco', 'y_clock', 'y_star', 'w_frame', 'w_frame_gold', 'w_frame_pink', 'w_garland', 'w_balloons', 'w_stars', 'w_rainbow', 'kg_cloud', 'kg_star', 'kg_rainbow', 'kc_leaf', 'kc_cherry', 'kc_tulip', 'k_ch11', 'k_ch13')
th('play', 'y_toybox', 'k_train', 'y_ball', 'kg_bear', 'kg_drum', 'kg_ball2', 'kg_train2', 'kg_kite', 'k_ch5', 'k_ch6', 'k_ch7', 'k_ch9', 'k_ch14', 'kc_tube', 'kc_acorn', 'kc_snowman'); th('wear', 'y_hat', 'y_boots', 'k_ch8', 'kc_mitten', 'w_crown'); th('eat', 'y_bowl', 'y_spoon', 'k_ch3', 'k_ch10', 'k_ch12', 'k_ch15', 'kc_icecream')
DEFAULT_THEME = {'kitchen': 'eat', 'storage': 'store', 'photo': 'deco', 'outer': 'outdoor', 'yardlife': 'outdoor', 'badge': 'deco', 'story_a': 'story', 'story_k': 'story', 'season': 'deco', 'season2': 'deco', 'event': 'deco', 'gift': 'living', 'kseason': 'deco', 'kgift': 'play', 'wall': 'deco', 'build': 'living', 'kid': 'play', 'daybath': 'wash'}
for i in items: i['theme'] = THEME.get(i['id']) or DEFAULT_THEME.get(i['set'], 'deco')
json.dump(R, open('data/room_items.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
# 방마다 허용 주제 — 주제 밖 소품은 맞는 방(아이 방·마당 등)에 놓는다
ROOM_THEMES = {'nemo': ['living', 'eat', 'store', 'deco', 'story'], 'kitchen': ['eat', 'store'], 'semo': ['travel', 'deco', 'living', 'store'], 'dong': ['study', 'deco', 'living'], 'yard': ['outdoor', 'eat', 'story'], 'entrance': ['entry', 'store', 'deco', 'outdoor'], 'upstairs': ['sleep', 'store', 'living', 'deco', 'story'], 'roof': ['story', 'outdoor', 'deco'],
               'bath': ['wash', 'deco'], 'kid': ['sleep', 'play', 'deco', 'story'], 'wardrobe': ['wear', 'deco', 'story'], 'dining': ['eat', 'deco', 'story'], 'toyroom': ['play', 'deco', 'story']}
ROOMSPEC = [  # id, 이름, 그룹, 해금, 벽색, 바닥색, 벽무늬, 바닥, fixtures, 뒷줄A, 가운뎃줄B, 앞줄C, 벽, 소품[(id, 올라설 곳: fixture 번호 | 가구 id)]
    ('nemo', '네모네 거실', 'adult', 1, '#FFE3C2', '#E3B27F', 'square', 'wood', [], ['b_tv', 'b_sofa'], ['b_table', 'b_plant'], ['b_lamp', 'u_toybox', 'g_cushion'], ['a_frame', 'a_photo', 'a_calendar'], [('p_remote', 'b_tv'), ('p_photo', 'b_tv'), ('p_pack1', 'b_table'), ('p_points', 'b_table')]),
    ('kitchen', '네모네 주방', 'adult', 3, '#FFF1C9', '#E8D8B8', 'dot', 'tile', [FX('counter', 70, 196, 200, 48, surf=dict(y=196, x0=84, x1=262))], ['u_fridge'], ['u_drawer', 'u_cart', 't_bowl'], ['u_crate', 'u_basket', 'g_lunch'], ['u_sidedish', 'u_shelf', 'u_label'], [('p_rice', 0), ('p_kimchi', 0), ('p_mix', 0), ('p_lunch', 0)]),
    ('semo', '세모네 신혼집', 'adult', 5, '#D8F0FF', '#D8E2EE', 'triangle', 'wood', [FX('desk', 60, 236, 160, 44, surf=dict(y=236, x0=74, x1=214))], ['b_semo_home', 'a_shelf'], ['b_suitcase', 'a_camera'], ['a_album', 'a_scrapbook', 'a_trophy'], ['a_map', 'a_polaroid', 'a_postcard'], [('p_world', 0), ('p_pass', 0), ('p_bagt', 0), ('p_globe', 0)]),
    ('dong', '동그라미네 서재', 'adult', 8, '#E2E6FA', '#C7CBE0', 'circle', 'wood', [FX('desk', 160, 232, 160, 44, surf=dict(y=232, x0=174, x1=314))], ['b_shelf', 'b_dong_study'], ['b_globe', 'g_stool'], ['p_chair', 'a_magnifier', 'a_diary'], ['b_clock', 'a_ribbon', 'a_medal'], [('p_book', 0), ('p_vio', 0), ('p_flower', 0), ('p_env', 0)]),
    ('yard', '마당·골목', 'adult', 10, '#CFEFFF', '#B4DE98', 'none', 'grass', [FX('table', 90, 228, 150, 40, surf=dict(y=228, x0=100, x1=226))], ['o_fence', 'm_garden'], ['m_bench', 'o_mailbox'], ['m_jar', 'm_cat', 'm_sunflower', 'm_flowerrow'], ['o_sign', 'o_lantern', 'm_laundry'], [('u_eggtray', 0), ('p_label', 0), ('p_tea', 0), ('g_teaset', 0)]),
    ('entrance', '현관', 'adult', 12, '#F4E4D0', '#CBA980', 'square', 'tile', [FX('counter', 150, 220, 170, 44, surf=dict(y=220, x0=164, x1=306))], ['u_shoerack', 'u_closet'], ['o_doghouse', 'o_flowerpot'], ['q_game_1', 'q_game_2', 'u_umbrella'], ['n_plate', 'q_plate_nemo', 'u_bagrack'], [('u_env', 0), ('u_pill', 0), ('u_socks', 0), ('p_pill', 0)]),
    ('upstairs', '2층', 'adult', 15, '#FDE8F0', '#E5C7B0', 'dot', 'wood', [FX('desk', 24, 236, 150, 44, surf=dict(y=236, x0=38, x1=164))], ['b_bed', 'b_rug'], ['u_box', 't_pino_a'], ['t_sun_a', 't_ant_a', 't_jack_a'], ['a_garland', 'a_cork', 'a_film'], [('p_phone', 0), ('p_film', 0), ('p_clock', 0), ('p_wreath', 0)]),
    ('roof', '옥상', 'adult', 20, '#BFE6FF', '#CFC8BE', 'none', 'tile', [FX('table', 190, 232, 140, 40, surf=dict(y=232, x0=200, x1=318))], ['s_tree', 'o_bench'], ['t_pigs_a', 't_shoes_a'], ['t_kongjwi_a', 't_heungbu_a', 't_bremen_a'], ['q_type_nemo0', 'q_type_semo0', 'q_type_dong0'], [('p_ra', 0), ('g_lantern2', 0), ('e_candy', 0), ('s2_acorn', 0)]),
    ('bath', '욕실', 'kid', 1, '#DDF3F8', '#CFE6F0', 'circle', 'tile', [FX('sink', 40, 236, 160, 56, surf=dict(y=228, x0=64, x1=190))], ['y_mat'], ['y_duck'], [], ['y_hanger', 'y_towel', 'y_clock'], [('y_cup', 0), ('y_paste', 0), ('y_soap', 0), ('y_cup2', 0)]),
    ('kid', '아이 방', 'kid', 3, '#FFF0B8', '#F2C98A', 'triangle', 'wood', [FX('bed', 24, 330, 150, 70, surf=dict(y=300, x0=40, x1=160)), FX('desk', 214, 236, 110, 40, surf=dict(y=236, x0=226, x1=312))], ['y_toybox', 'k_train'], ['k_party', 'kg_bear', 'kg_drum'], ['y_pillow', 'y_quilt', 'kg_ball2', 'k_ch4'], ['w_frame', 'y_moon', 'kg_cloud'], [('y_book', 1)]),
    ('wardrobe', '옷방', 'kid', 6, '#FFE0E8', '#E8C7A8', 'dot', 'wood', [], ['k_ch8', 't_snowqueen_k'], ['y_boots', 't_bears_k', 't_hok_k'], ['t_pino_k', 't_shoes_k', 'kc_mitten'], ['y_hat', 'w_crown', 'w_garland'], []),
    ('dining', '밥 먹는 곳', 'kid', 9, '#E8F5C8', '#DDBF92', 'square', 'wood', [FX('table', 70, 276, 190, 56, surf=dict(y=276, x0=92, x1=246))], ['k_ch3', 'k_ch12'], ['t_heungbu_k', 'k_ch15', 'kc_icecream'], ['t_kongjwi_k', 'k_ch10', 't_ant_k'], ['w_frame_pink', 'w_balloons', 'kc_leaf'], [('y_bowl', 0), ('y_spoon', 0)]),
    ('toyroom', '장난감 방', 'kid', 12, '#D8ECFF', '#C8D8B8', 'circle', 'grass', [], ['k_ch5', 'k_ch9'], ['y_ball', 'k_ch7', 'kc_tube'], ['kg_train2', 'kc_snowman', 'kc_acorn', 't_sun_k'], ['w_rainbow', 'kg_kite', 'kg_rainbow'], []),
]
'''
s = s[:a] + NEW + s[b:]
# 단언: 앵커 가구 주제 ∈ 방 허용 주제
chk = '''_bad = [(r['id'], x['want'], byid[x['want']]['theme']) for r in ROOMS for x in r['anchors'] if byid[x['want']]['theme'] not in ROOM_THEMES[r['id']]]
assert not _bad, ('방 주제 밖 가구', _bad)
'''
s = s.replace("_used = collections.Counter(", chk + "_used = collections.Counter(", 1)
# 이야기 할 일 조정
for x, y in [("('t1', ['y_toybox'], '장난감 상자')", "('t1', ['k_ch7'], '소리 나팔')"), ("('t1', ['k_ch4'], '달 램프'), ('t2', ['y_ball'], '공 바구니')", "('t1', ['k_ch7'], '소리 나팔'), ('t2', ['y_ball'], '공 바구니')")]:
    if x in s: s = s.replace(x, y, 1)
open(p, 'w', encoding='utf-8').write(s); print('ok')
