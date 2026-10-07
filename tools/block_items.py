"""⑦ 도형 블록 보상: 「외관·지붕·담장 세트」(집 바깥, 마당·골목 방) 8종을 room_items.json 에 추가(멱등). 그림은 임시 이모지(ASSET_LIST 에 슬롯)."""
import json
p = 'data/room_items.json'; R = json.load(open(p, encoding='utf-8'))
if not any(s['id'] == 'outer' for s in R['sets']):
    R['sets'].append({'id': 'outer', 'name': '외관·지붕·담장 세트', 'game': 'block', 'room': 'yard', 'story': '벽돌을 한 줄 한 줄 맞춰 쌓았더니 집 바깥이 완성됐어요. 지붕, 굴뚝, 담장, 대문, 우체통까지.'})
have = {x['id'] for x in R['items']}; no = max(x['no'] for x in R['items'])
for id_, name, e, w, h, slot in [('o_bricks', '벽돌 더미', '🧱', 40, 40, 'floor'), ('o_roof', '빨간 지붕', '🏠', 56, 56, 'wall'), ('o_chimney', '굴뚝', '🏭', 44, 52, 'wall'), ('o_fence', '담장', '🚧', 64, 40, 'floor'), ('o_gate', '대문', '🚪', 48, 60, 'floor'), ('o_mailbox', '우체통', '📮', 40, 48, 'floor'), ('o_doghouse', '강아지 집', '🐕', 48, 48, 'floor'), ('o_lantern', '등불', '🏮', 36, 52, 'wall'), ('o_flowerpot', '창가 화분', '🪴', 36, 40, 'floor'), ('o_window', '네모 창문', '🪟', 44, 44, 'wall'), ('o_flag', '깃대', '🚩', 32, 56, 'floor'), ('o_sign', '가게 간판', '🪧', 44, 40, 'wall'), ('o_bench', '평상', '🪑', 56, 40, 'floor'), ('o_jar', '장독대', '🏺', 40, 44, 'floor'), ('o_hay', '볏단', '🌾', 40, 44, 'floor'), ('o_well', '우물', '⛲', 48, 52, 'floor'), ('o_cart', '손수레', '🛒', 48, 40, 'floor'), ('o_lamp', '가로등', '💡', 32, 56, 'floor'), ('o_pond', '작은 연못', '🪷', 56, 36, 'floor'), ('o_swing', '그네', '🎠', 52, 52, 'floor')]:
    if id_ in have: continue
    no += 1; R['items'].append({'no': no, 'id': id_, 'name': name, 'set': 'outer', 'room': 'yard', 'w': w, 'h': h, 'slot': slot, 'art': 'emoji', 'emoji': e, 'colors': ['#FFFFFF'], 'game': 'block', 'season': None, 'physical': None})
json.dump(R, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('items', len(R['items']), 'last no', no)
