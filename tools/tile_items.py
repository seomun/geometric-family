"""⑨ 세 가족 짝 맞추기 보상: 「마당 살림 세트」(마당·골목 방) 20종을 room_items.json 에 추가(멱등). 그림은 임시 이모지."""
import json
p = 'data/room_items.json'; R = json.load(open(p, encoding='utf-8'))
if not any(s['id'] == 'yardlife' for s in R['sets']):
    R['sets'].append({'id': 'yardlife', 'name': '마당 살림 세트', 'game': 'tile', 'room': 'yard', 'story': '같은 그림을 세 개씩 모을 때마다 마당이 살림으로 채워졌어요. 평상, 장독대, 빨랫줄, 텃밭까지.'})
have = {x['id'] for x in R['items']}; no = max(x['no'] for x in R['items'])
for id_, name, e, w, h, slot in [('m_bench', '평상', '🛋️', 56, 40, 'floor'), ('m_flowerrow', '화분 줄', '🌻', 52, 40, 'floor'), ('m_jar', '큰 장독', '🫙', 40, 48, 'floor'), ('m_laundry', '빨랫줄', '👕', 56, 40, 'wall'), ('m_garden', '텃밭', '🥬', 48, 40, 'floor'), ('m_coop', '닭장', '🐔', 48, 44, 'floor'), ('m_alley', '골목 담', '🏘️', 60, 40, 'floor'), ('m_persimmon', '감나무', '🌳', 44, 64, 'floor'), ('m_pepper', '고추 말리기', '🌶️', 44, 36, 'floor'), ('m_bucket', '우물가 두레박', '🪣', 36, 40, 'floor'), ('m_mat', '멍석', '🧺', 56, 30, 'floor'), ('m_rooster', '수탉', '🐓', 36, 44, 'floor'), ('m_cat', '마당 고양이', '🐈', 36, 36, 'floor'), ('m_bike', '자전거', '🚲', 52, 40, 'floor'), ('m_chime', '풍경', '🎐', 32, 44, 'wall'), ('m_radish', '무 말리기', '🥕', 44, 36, 'floor'), ('m_pumpkin', '호박', '🎃', 40, 36, 'floor'), ('m_duck', '오리', '🦆', 34, 36, 'floor'), ('m_butterfly', '나비', '🦋', 32, 32, 'wall'), ('m_sunflower', '해바라기', '🌻', 36, 56, 'floor')]:
    if id_ in have: continue
    no += 1; R['items'].append({'no': no, 'id': id_, 'name': name, 'set': 'yardlife', 'room': 'yard', 'w': w, 'h': h, 'slot': slot, 'art': 'emoji', 'emoji': e, 'colors': ['#FFFFFF'], 'game': 'tile', 'season': None, 'physical': None})
json.dump(R, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('items', len(R['items']), 'last no', no)
