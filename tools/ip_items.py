"""이야기 카드 완성 보상: 「우리 집」 특별 소품 — 이야기 17종 × (성인 그룹 / 유아 그룹). 멱등. 그림은 임시 이모지(ASSET_LIST 슬롯). 이름은 [제안].
set story_a(성인, 방 nemo) · story_k(유아, 방 kid). 유아 그룹에 없는 이야기(구두장이·혹부리·피노키오 등)는 유아 소품이 없다(그 이야기 카드는 성인 그룹에만)."""
import json
p = 'data/room_items.json'; R = json.load(open(p, encoding='utf-8'))
TALES = [  # id, 이름, 이모지, 성인, 유아
    ('pigs', '벽돌집 미니어처', '🧱', 1, 1), ('bears', '곰 세 식구 의자', '🪑', 1, 1), ('shoes', '요정의 작은 구두', '👞', 1, 0), ('kongjwi', '꽃신 한 켤레', '👡', 1, 1), ('heungbu', '박 항아리', '🎃', 1, 1),
    ('bremen', '음악대 나팔', '🎺', 1, 0), ('hok', '도깨비 방망이', '🔨', 1, 0), ('axe', '금도끼 장식', '🪓', 1, 1), ('sun', '해님 달님 모빌', '🌙', 1, 1), ('ant', '개미 열매 광주리', '🧺', 1, 1),
    ('pino', '피노키오 인형', '🪆', 1, 0), ('jack', '콩나무 화분', '🌱', 1, 1), ('gyeonwoo', '오작교 별등', '⭐', 1, 1), ('ureng', '우렁각시 소라집', '🐚', 1, 1), ('hare', '결승선 깃발', '🏁', 1, 1),
    ('brothers', '볏단 두 단', '🌾', 1, 1), ('snowqueen', '눈 결정 장식', '❄️', 1, 1)]
for sid, name, room, game, story in [('story_a', '이야기 완성 세트(성인)', 'nemo', 'tables', '같은 이야기를 네 장의 카드로 모아 한 편을 완성하면, 그 이야기를 닮은 작은 소품이 집에 놓여요.'), ('story_k', '이야기 완성 세트(유아)', 'kid', 'playground', '이야기 카드를 모아 한 편을 완성하면 방에 작은 소품이 놓여요.')]:
    if not any(s['id'] == sid for s in R['sets']): R['sets'].append({'id': sid, 'name': name, 'game': game, 'room': room, 'story': story})
have = {x['id'] for x in R['items']}; no = max(x['no'] for x in R['items']); n = 0
for tid, name, e, a, k in TALES:
    for flag, suf, setid, room, game, w, h in [(a, '_a', 'story_a', 'nemo', 'tables', 46, 46), (k, '_k', 'story_k', 'kid', 'playground', 56, 56)]:
        iid = 't_' + tid + suf
        if not flag or iid in have: continue
        no += 1; n += 1; R['items'].append({'no': no, 'id': iid, 'name': name, 'set': setid, 'room': room, 'w': w, 'h': h, 'slot': 'floor', 'art': 'emoji', 'emoji': e, 'colors': ['#FFFFFF'], 'game': game, 'season': None, 'physical': None})
json.dump(R, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('story items +', n, 'total', len(R['items']))
