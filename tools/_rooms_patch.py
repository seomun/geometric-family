"""방마다 놓을 자리를 10~15개로(허브 QA 3차: 「완성 모습」이 꽉 차 보이게). tools/housing_build.py 의 ROOMS 블록을 spec 기반 자동 배치로 바꾼다(멱등)."""
import io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
p = 'tools/housing_build.py'; s = open(p, encoding='utf-8').read()
if 'ROOMSPEC' in s: print('skip'); sys.exit()
a = s.index("# 방 기하(논리 340×440)"); b = s.index("def mkrooms(g):"); e = s.index("\n", b)
NEW = r'''# 방 기하(논리 340×440): 벽 0~150, 바닥 150~440. 방마다 놓을 자리 10~15개 = 큰 가구 2~3 · 중간/작은 4~6 · 벽 3 · 면 위 소품 3~4. 앵커 x=중심 · y=가구 밑변.
# 고정 가구(fixtures)는 방 그림에 함께 그려지고 surf 위에 소품이 놓인다. 배치는 줄(rowA 뒤·rowB 가운데·rowC 앞) 템플릿으로 자동 계산한다.
FX = lambda k, x, y, w, h, **kw: dict(k=k, x=x, y=y, w=w, h=h, **kw)
GEOF = lambda iid: (byid[iid]['w'] * SIZE_F[byid[iid]['cls']], byid[iid]['h'] * SIZE_F[byid[iid]['cls']])
ROWY = {'A': 298, 'B': 368, 'C': 428}; WALLX = [52, 118, 184]; WALLY = 108
def spread(n, W=340):
    return {1: [W / 2], 2: [90, 250], 3: [58, 170, 282], 4: [48, 128, 214, 296], 5: [40, 100, 170, 240, 300]}[n]
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
ROOMSPEC = [  # id, 이름, 그룹, 해금, 벽색, 바닥색, 벽무늬, 바닥, fixtures, 뒷줄A, 가운뎃줄B, 앞줄C, 벽, 소품[(id, 올라설 곳: fixture 번호 | 가구 id)]
    ('nemo', '네모네 거실', 'adult', 1, '#FFE3C2', '#E3B27F', 'square', 'wood', [], ['b_tv', 'b_sofa'], ['b_table', 'b_plant'], ['b_lamp', 'u_toybox', 'g_cushion'], ['a_frame', 'a_photo', 'a_calendar'], [('p_remote', 'b_tv'), ('p_photo', 'b_tv'), ('p_pack1', 'b_table'), ('p_points', 'b_table')]),
    ('kitchen', '네모네 주방', 'adult', 3, '#FFF1C9', '#E8D8B8', 'dot', 'tile', [FX('counter', 70, 196, 200, 48, surf=dict(y=196, x0=84, x1=262))], ['u_fridge'], ['u_drawer', 'u_cart', 't_bowl'], ['u_crate', 'u_basket', 'u_umbrella'], ['u_sidedish', 'u_shelf', 'u_label'], [('p_rice', 0), ('p_kimchi', 0), ('p_mix', 0), ('p_lunch', 0)]),
    ('semo', '세모네 신혼집', 'adult', 5, '#D8F0FF', '#D8E2EE', 'triangle', 'wood', [FX('desk', 60, 236, 160, 44, surf=dict(y=236, x0=74, x1=214))], ['b_semo_home', 'a_shelf'], ['b_lamp2' if False else 'b_suitcase', 'a_camera'], ['a_album', 'a_scrapbook', 'a_trophy'], ['a_map', 'a_polaroid', 'a_postcard'], [('p_world', 0), ('p_pass', 0), ('p_bagt', 0), ('p_globe', 0)]),
    ('dong', '동그라미네 서재', 'adult', 8, '#E2E6FA', '#C7CBE0', 'circle', 'wood', [FX('desk', 160, 232, 160, 44, surf=dict(y=232, x0=174, x1=314))], ['b_shelf', 'b_dong_study'], ['b_globe', 'g_stool'], ['p_chair', 'a_magnifier', 'a_diary'], ['b_clock', 'a_ribbon', 'a_medal'], [('p_book', 0), ('p_vio', 0), ('p_flower', 0), ('p_env', 0)]),
    ('yard', '마당·골목', 'adult', 10, '#CFEFFF', '#B4DE98', 'none', 'grass', [FX('table', 90, 228, 150, 40, surf=dict(y=228, x0=100, x1=226))], ['o_fence', 'm_garden'], ['m_bench', 'o_mailbox'], ['m_jar', 'm_cat', 'm_sunflower', 'm_flowerrow'], ['o_sign', 'o_lantern', 'm_laundry'], [('u_eggtray', 0), ('p_label', 0), ('p_tea', 0), ('g_teaset', 0)]),
    ('entrance', '현관', 'adult', 12, '#F4E4D0', '#CBA980', 'square', 'tile', [FX('counter', 150, 220, 170, 44, surf=dict(y=220, x0=164, x1=306))], ['u_shoerack', 'u_closet'], ['o_doghouse', 'o_flowerpot'], ['u_bagrack_f' if False else 'q_game_1', 'q_game_2', 'q_game_3'], ['n_plate', 'q_plate_nemo', 'u_bagrack'], [('u_env', 0), ('u_pill', 0), ('u_socks', 0), ('u_coffee', 0)]),
    ('upstairs', '2층', 'adult', 15, '#FDE8F0', '#E5C7B0', 'dot', 'wood', [FX('desk', 24, 236, 150, 44, surf=dict(y=236, x0=38, x1=164))], ['b_bed', 'u_closet2' if False else 'b_rug'], ['u_box', 'a_diary2' if False else 't_pino_a'], ['t_sun_a', 't_ant_a', 't_jack_a'], ['a_garland', 'a_cork', 'a_film'], [('p_phone', 0), ('p_film', 0), ('p_pair', 0), ('p_ramen', 0)]),
    ('roof', '옥상', 'adult', 20, '#BFE6FF', '#CFC8BE', 'none', 'tile', [FX('table', 190, 232, 140, 40, surf=dict(y=232, x0=200, x1=318))], ['s_tree', 'o_bench'], ['t_pigs_a', 't_shoes_a'], ['t_kongjwi_a', 't_heungbu_a', 't_bremen_a'], ['q_type_nemo0', 'q_type_semo0', 'q_type_dong0'], [('p_pack3', 0), ('p_pack2', 0), ('p_glass', 0), ('p_tea2' if False else 'p_ra', 0)]),
    ('bath', '욕실', 'kid', 1, '#DDF3F8', '#CFE6F0', 'circle', 'tile', [FX('sink', 40, 236, 160, 56, surf=dict(y=228, x0=64, x1=190))], ['y_mat'], ['y_duck', 't_shoes_k', 'kc_tube'], ['kg_ball2', 'k_ch14', 'k_ch10'], ['y_hanger', 'y_towel', 'y_clock'], [('y_cup', 0), ('y_paste', 0), ('y_soap', 0)]),
    ('kid', '아이 방', 'kid', 3, '#FFF0B8', '#F2C98A', 'triangle', 'wood', [FX('bed', 24, 330, 150, 70, surf=dict(y=300, x0=40, x1=160)), FX('desk', 214, 236, 110, 40, surf=dict(y=236, x0=226, x1=312))], ['y_toybox', 'k_train'], ['k_party', 'kg_bear', 'kg_drum'], ['t_pigs_k', 'y_pillow', 'y_quilt'], ['w_frame', 'y_moon', 'kg_cloud'], [('y_book', 1)]),
    ('wardrobe', '옷방', 'kid', 6, '#FFE0E8', '#E8C7A8', 'dot', 'wood', [], ['k_ch8', 'k_ch14b' if False else 'kc_snowman'], ['y_boots', 't_snowqueen_k', 'kg_train2'], ['t_bears_k', 't_hok_k', 't_pino_k'], ['y_hat', 'w_garland', 'w_stars'], []),
    ('dining', '밥 먹는 곳', 'kid', 9, '#E8F5C8', '#DDBF92', 'square', 'wood', [FX('table', 70, 276, 190, 56, surf=dict(y=276, x0=92, x1=246))], ['k_ch3', 'k_ch12'], ['t_heungbu_k', 'k_ch15', 'kc_acorn'], ['t_kongjwi_k', 't_axe_k', 't_ant_k'], ['w_frame_pink', 'w_balloons', 'kc_leaf'], [('y_bowl', 0), ('y_spoon', 0), ('y_cup2', 0)]),
    ('toyroom', '장난감 방', 'kid', 12, '#D8ECFF', '#C8D8B8', 'circle', 'grass', [], ['k_ch5', 'k_ch4'], ['y_ball', 'k_ch7', 'kc_icecream'], ['t_sun_k', 't_jack_k', 't_gyeonwoo_k'], ['w_rainbow', 'w_crown', 'kg_rainbow'], []),
]
ROOMS = [layout(r) for r in ROOMSPEC]
_used = collections.Counter(a['want'] for r in ROOMS for a in r['anchors'])
assert not [k for k, v in _used.items() if v > 1], ('앵커 가구 중복', [k for k, v in _used.items() if v > 1])
for r in ROOMS:
    for a in r['anchors']: assert a['want'] in byid, ('칸 가구 없음', r['id'], a['want'])
    print('  방', r['id'], len(r['anchors']), '자리')
def mkrooms(g): return [r for r in ROOMS if r['group'] == g]'''
s = s[:a] + NEW + s[e:]
# 이야기 장 할 일을 새 칸에 맞춘다
rep = [("tasks=[('t1', ['b_table'], '큰 상'), ('t2', ['a_frame'], '벽 액자'), ('t3', ['u_shelf'], '벽 선반'), ('t4', ['b_sofa'], '소파'), ('t5', ['b_drawer'], '서랍장')]", "tasks=[('t1', ['b_table'], '큰 상'), ('t2', ['a_frame'], '벽 액자'), ('t3', ['b_sofa'], '소파'), ('t4', ['b_tv'], 'TV장'), ('t5', ['a_calendar'], '달력')]"),
       ("('t4', ['m_garden'], '텃밭'), ('t5', ['o_gate'], '대문')", "('t4', ['m_garden'], '텃밭'), ('t5', ['o_lantern'], '등불')"),
       ("('t3', ['a_diary'], '일기장'), ('t4', ['b_rug'], '동그라미 러그')", "('t3', ['t_pino_a'], '피노키오 인형'), ('t4', ['b_rug'], '동그라미 러그')"),
       ("('t2', ['t_pigs_a'], '벽돌집 미니어처'), ('t3', ['t_bears_a'], '곰 세 식구 의자')", "('t2', ['t_pigs_a'], '벽돌집 미니어처'), ('t3', ['t_shoes_a'], '요정의 작은 구두')"),
       ("('t1', ['y_hat'], '모자걸이'), ('t2', ['k_train'], '기차'), ('t3', ['y_boots'], '장화')", "('t1', ['y_hat'], '모자걸이'), ('t2', ['k_ch8'], '밀짚모자 걸이'), ('t3', ['y_boots'], '장화')"),
       ("('t1', ['y_toybox'], '장난감 상자'), ('t2', ['y_ball'], '공 바구니'), ('t3', ['k_ch5'], '도형 블록')", "('t1', ['k_ch4'], '달 램프'), ('t2', ['y_ball'], '공 바구니'), ('t3', ['k_ch5'], '도형 블록')")]
for x, y in rep:
    assert x in s, x[:50]; s = s.replace(x, y, 1)
# 손님이 좋아하는 가구가 자리에 있는 것으로
s = s.replace("likes=['b_shelf', 'b_clock']", "likes=['b_shelf', 'b_clock']")
s = s.replace("likes=['m_bench', 'm_garden']", "likes=['m_bench', 'm_garden']")
open(p, 'w', encoding='utf-8').write(s); print('ok')
