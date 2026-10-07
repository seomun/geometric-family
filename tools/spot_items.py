"""⑥ 다른 그림 찾기 보상: 「사진·앨범 세트」(네모네 거실 벽) 8종을 room_items.json 에 추가(멱등). 그림은 임시 이모지(ASSET_LIST 에 슬롯)."""
import json
p = 'data/room_items.json'; R = json.load(open(p, encoding='utf-8'))
if not any(s['id'] == 'photo' for s in R['sets']):
    R['sets'].append({'id': 'photo', 'name': '사진·앨범 세트', 'game': 'spot', 'room': 'nemo', 'story': '달라진 곳을 찾을 때마다 사진이 한 장씩 모였어요. 벽에는 액자, 선반에는 앨범이 가득해요.'})
have = {x['id'] for x in R['items']}; no = max(x['no'] for x in R['items'])
for id_, name, e, w, h, slot in [('a_frame', '벽 액자', '🖼️', 44, 48, 'wall'), ('a_photo', '가족 사진', '🏞️', 48, 40, 'wall'), ('a_album', '앨범', '📖', 40, 36, 'floor'), ('a_cork', '코르크 사진판', '📌', 52, 44, 'wall'), ('a_camera', '필름 카메라', '📷', 40, 36, 'floor'), ('a_film', '필름 줄', '🎞️', 56, 28, 'wall'), ('a_polaroid', '즉석 사진', '📸', 36, 40, 'wall'), ('a_shelf', '앨범장', '🗂️', 52, 56, 'floor'), ('a_postcard', '엽서', '✉️', 36, 30, 'wall'), ('a_map', '옛 지도', '🗺️', 52, 44, 'wall'), ('a_trophy', '상장 트로피', '🏆', 36, 44, 'floor'), ('a_medal', '메달', '🏅', 30, 34, 'wall'), ('a_ribbon', '리본 장식', '🎀', 34, 30, 'wall'), ('a_calendar', '달력', '📅', 40, 44, 'wall'), ('a_scrapbook', '스크랩북', '📒', 38, 38, 'floor'), ('a_magnifier', '돋보기', '🔍', 34, 34, 'floor'), ('a_diary', '일기장', '📔', 36, 38, 'floor'), ('a_carp', '잉어 깃발', '🎏', 40, 52, 'wall'), ('a_wallclock', '벽시계', '🕰️', 40, 46, 'wall'), ('a_garland', '가랜드', '🎉', 56, 32, 'wall')]:
    if id_ in have: continue
    no += 1; R['items'].append({'no': no, 'id': id_, 'name': name, 'set': 'photo', 'room': 'nemo', 'w': w, 'h': h, 'slot': slot, 'art': 'emoji', 'emoji': e, 'colors': ['#FFFFFF'], 'game': 'spot', 'season': None, 'physical': None})
json.dump(R, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('items', len(R['items']), 'last no', no)
