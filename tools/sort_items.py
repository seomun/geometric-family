"""⑧ 정리의 달인 보상: 「수납 세트」(네모네 거실) 20종을 room_items.json 에 추가(멱등). 그림은 임시 이모지(아트 패스에서 교체)."""
import json
p = 'data/room_items.json'; R = json.load(open(p, encoding='utf-8'))
if not any(s['id'] == 'storage' for s in R['sets']):
    R['sets'].append({'id': 'storage', 'name': '수납 세트', 'game': 'sort', 'room': 'nemo', 'story': '뒤섞였던 물건이 자리를 찾았어요. 냉장고, 옷장, 신발장, 서랍장까지 한 칸씩 정리가 끝났어요.'})
have = {x['id'] for x in R['items']}; no = max(x['no'] for x in R['items'])
ITEMS = [('u_fridge', '냉장고', '🧊', 52, 80, 'floor'), ('u_eggtray', '계란판', '🥚', 40, 32, 'table'), ('u_sidedish', '반찬통 선반', '🍱', 56, 44, 'wall'), ('u_closet', '옷장', '🚪', 56, 88, 'floor'),
         ('u_shoerack', '신발장', '👟', 56, 44, 'floor'), ('u_box', '수납함', '📦', 48, 40, 'floor'), ('u_shelf', '벽 선반', '🪜', 60, 28, 'wall'), ('u_drawer', '서랍장', '🗄️', 52, 60, 'floor'),
         ('u_hanger', '옷걸이', '🧥', 44, 52, 'wall'), ('u_basket', '빨래 바구니', '🧺', 44, 40, 'floor'), ('u_crate', '과일 상자', '🍎', 48, 36, 'floor'), ('u_label', '정리 라벨', '🏷️', 36, 28, 'wall'),
         ('u_coffee', '믹스커피 통', '☕', 36, 40, 'table'), ('u_bagrack', '가방 걸이', '🎒', 44, 48, 'wall'), ('u_umbrella', '우산꽂이', '☂️', 36, 52, 'floor'), ('u_socks', '양말 서랍', '🧦', 44, 36, 'table'),
         ('u_toybox', '장난감 통', '🧸', 52, 40, 'floor'), ('u_pill', '약 서랍', '💊', 40, 36, 'table'), ('u_cart', '정리 수레', '🛒', 52, 56, 'floor'), ('u_env', '봉투 보관함', '✉️', 40, 32, 'table')]
for id_, name, e, w, h, slot in ITEMS:
    if id_ in have: continue
    no += 1; R['items'].append({'no': no, 'id': id_, 'name': name, 'set': 'storage', 'room': 'nemo', 'w': w, 'h': h, 'slot': slot, 'art': 'emoji', 'emoji': e, 'colors': ['#FFFFFF'], 'game': 'sort', 'season': None, 'physical': None})
json.dump(R, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('items', len(R['items']), 'last no', no)
