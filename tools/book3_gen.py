"""① 놀이터 3권(막둥이의 사계절, 11~15장) 데이터 생성: python tools/book3_gen.py
stages(새 놀이 5종) · story(막둥이 시점) · stickers 25 · 아이 방 장난감 k_ch11~15. 다시 돌려도 같은 결과(멱등)."""
import json

S = json.load(open('data/stages.json', encoding='utf-8'))


def st(rounds):
    return {'rounds': rounds}


S['ch11'] = {'mode': 'plant', 'bg': 'hill', 'heroes': ['nemo_mom.joy', 'nemo_dad.joy', 'baby.joy'], 'stages': [st([{'n': 1}, {'n': 2}, {'n': 3}]), st([{'n': 3}, {'n': 4}, {'n': 5}]), st([{'n': 4}, {'n': 5}, {'n': 6}])]}
S['ch12'] = {'mode': 'share', 'bg': 'seaside', 'heroes': ['wife.joy', 'husband.joy', 'baby.joy'], 'stages': [
    st([{'pieces': 4, 'plates': 2, 'heroes': ['baby.joy', 'nemo_kids.kid1']}, {'pieces': 4, 'plates': 2, 'heroes': ['wife.joy', 'husband.joy']}, {'pieces': 6, 'plates': 2, 'heroes': ['nemo_mom.joy', 'nemo_dad.joy']}]),
    st([{'pieces': 6, 'plates': 3, 'heroes': ['baby.joy', 'nemo_kids.kid1', 'wife.joy']}, {'pieces': 6, 'plates': 2, 'heroes': ['dong_dad.joy', 'baby.joy']}, {'pieces': 6, 'plates': 3, 'heroes': ['nemo_mom.joy', 'husband.joy', 'baby.joy']}]),
    st([{'pieces': 8, 'plates': 2, 'heroes': ['wife.joy', 'dong_dad.joy']}, {'pieces': 9, 'plates': 3, 'heroes': ['baby.joy', 'nemo_kids.kid1', 'nemo_dad.joy']}, {'pieces': 8, 'plates': 4, 'heroes': ['baby.joy', 'nemo_kids.kid1', 'wife.joy', 'husband.joy']}])]}
S['ch13'] = {'mode': 'hidden', 'bg': 'field', 'heroes': ['baby.joy', 'nemo_kids.kid1', 'dong_dad.joy'], 'stages': [
    st([{'find': [{'c': 0}], 'leaves': 10, 'seed': 3}, {'find': [{'c': 1}], 'leaves': 12, 'seed': 4}, {'find': [{'c': 2}], 'leaves': 12, 'seed': 5}]),
    st([{'find': [{'c': 0}, {'c': 1}], 'leaves': 16, 'seed': 6}, {'find': [{'c': 1}, {'c': 2}], 'leaves': 18, 'seed': 7}, {'find': [{'c': 0}, {'c': 2}], 'leaves': 18, 'seed': 8}]),
    st([{'find': [{'c': 0}, {'c': 1}, {'c': 2}], 'leaves': 20, 'seed': 9}, {'find': [{'c': 2}, {'c': 1}, {'c': 0}], 'leaves': 22, 'seed': 10}, {'find': [{'c': 0}, {'c': 0}, {'c': 1}, {'c': 2}], 'leaves': 24, 'seed': 11}])]}
S['ch14'] = {'mode': 'catch', 'bg': 'night', 'heroes': ['baby.joy', 'nemo_kids.kid1', 'wife.joy'], 'stages': [
    st([{'target': 0, 'need': 3, 'speed': 6200}, {'target': 1, 'need': 3, 'speed': 6000}, {'target': 2, 'need': 3, 'speed': 5800}]),
    st([{'target': 0, 'need': 4, 'speed': 5400}, {'target': 2, 'need': 4, 'speed': 5200}, {'target': 1, 'need': 5, 'speed': 5000}]),
    st([{'target': 1, 'need': 5, 'speed': 4600}, {'target': 0, 'need': 6, 'speed': 4400}, {'target': 2, 'need': 6, 'speed': 4200}])]}
S['ch15'] = {'mode': 'rhythm', 'bg': 'house', 'heroes': ['nemo_mom.joy', 'nemo_grandma.good', 'baby.joy'], 'stages': [
    st([{'beats': 3, 'period': 1100}, {'beats': 4, 'period': 1100}, {'beats': 4, 'period': 1000}]),
    st([{'beats': 5, 'period': 1000}, {'beats': 5, 'period': 900}, {'beats': 6, 'period': 900}]),
    st([{'beats': 6, 'period': 850}, {'beats': 7, 'period': 800}, {'beats': 8, 'period': 800}])]}
json.dump(S, open('data/stages.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


def c(bg, text, chars, bubble=None):
    d = {'bg': bg, 'text': text, 'chars': chars}
    if bubble:
        d['bubble'] = bubble
    return d


def ch(id_, x, y, h):
    return {'id': id_, 'x': x, 'y': y, 'h': h}


B = lambda t, a=0: {'type': t, 'at': a}
T = json.load(open('data/story.json', encoding='utf-8'))
# 막둥이 시점 호칭: 아빠·엄마·할머니·세모 이모·세모 삼촌·동그라미 아저씨
T['ch11'] = {'pro': [c('hill', '봄이에요! 오늘은 어버이날이에요.', [ch('baby.joy', 110, 600, 190), ch('nemo_kids.kid1', 250, 600, 230)]), c('hill', '엄마, 아빠께 꽃을 드릴 거예요.', [ch('baby.joy', 120, 600, 190), ch('nemo_mom.joy', 250, 610, 270)], B('heart', 1)), c('field', '꽃밭에 꽃을 몇 송이 심을까요?', [ch('baby.surprise', 180, 600, 200)], B('question'))],
             'epi': [c('hill', '와! 예쁜 꽃밭이 됐어요!', [ch('baby.joy', 110, 600, 190), ch('nemo_mom.joy', 210, 610, 270), ch('nemo_dad.joy', 310, 610, 270)], B('heart', 1)), c('hill', '엄마 아빠가 활짝 웃었어요.', [ch('nemo_mom.love', 140, 610, 270), ch('nemo_dad.love', 260, 610, 270)], B('sparkle')), c('hill', '봄바람에 꽃이 살랑살랑!', [ch('baby.joy', 180, 600, 210)])]}
T['ch12'] = {'pro': [c('seaside', '여름이에요! 바닷가에 수박이 있어요.', [ch('baby.joy', 110, 600, 190), ch('wife.joy', 250, 600, 260)]), c('seaside', '세모 이모가 수박을 잘랐어요.', [ch('wife.joy', 130, 600, 260), ch('husband.joy', 250, 600, 260)], B('sparkle')), c('seaside', '똑같이 나눠 줄 수 있을까요?', [ch('baby.surprise', 180, 600, 200)], B('question'))],
             'epi': [c('seaside', '똑같이 나눴어요! 모두 하나씩!', [ch('baby.joy', 100, 600, 190), ch('wife.joy', 200, 600, 260), ch('husband.joy', 300, 600, 260)], B('heart', 1)), c('seaside', '세모 삼촌이 수박씨를 후후 불었어요.', [ch('husband.joy', 140, 600, 260), ch('baby.joy', 250, 600, 190)], B('note')), c('seaside', '달콤한 여름이에요.', [ch('baby.joy', 180, 600, 210)])]}
T['ch13'] = {'pro': [c('field', '가을이에요! 낙엽이 소복소복.', [ch('baby.joy', 110, 600, 190), ch('nemo_kids.kid1', 250, 600, 230)]), c('field', '낙엽 속에 도형 친구들이 숨었어요.', [ch('baby.surprise', 150, 600, 200), ch('dong_dad.good', 270, 610, 270)], B('question')), c('field', '동그라미 아저씨와 같이 찾아봐요!', [ch('dong_dad.warm', 180, 610, 280)], B('sparkle'))],
             'epi': [c('field', '다 찾았어요! 숨바꼭질 끝!', [ch('baby.joy', 110, 600, 190), ch('nemo_kids.kid1', 210, 600, 230), ch('dong_dad.joy', 310, 610, 270)], B('sparkle')), c('field', '동그라미 아저씨가 낙엽 비를 뿌렸어요.', [ch('dong_dad.joy', 180, 610, 280)], B('heart')), c('field', '가을은 숨바꼭질하기 좋아요.', [ch('baby.joy', 180, 600, 210)])]}
T['ch14'] = {'pro': [c('night', '첫눈이 내려요!', [ch('baby.joy', 110, 600, 190), ch('wife.joy', 250, 600, 260)], B('sparkle')), c('night', '하늘에서 눈송이가 내려와요.', [ch('baby.surprise', 180, 600, 210)], B('question')), c('night', '같은 색 눈송이를 톡 잡아요!', [ch('baby.joy', 120, 600, 190), ch('nemo_kids.kid1', 250, 600, 230)], B('bang'))],
             'epi': [c('night', '눈송이를 한가득 잡았어요!', [ch('baby.joy', 110, 600, 190), ch('wife.joy', 210, 600, 260), ch('nemo_kids.kid1', 310, 600, 230)], B('heart', 1)), c('night', '첫눈 오면 만나자고 했어요.', [ch('wife.love', 140, 600, 260), ch('husband.joy', 250, 600, 260)], B('heart')), c('night', '손이 시려도 마음은 따뜻해요.', [ch('baby.joy', 180, 600, 210)])]}
T['ch15'] = {'pro': [c('house', '겨울이에요. 오늘은 김장하는 날!', [ch('baby.joy', 110, 600, 190), ch('nemo_grandma.good', 250, 610, 270)]), c('house', '할머니가 배추를 버무려요.', [ch('nemo_grandma.good', 140, 610, 270), ch('nemo_mom.joy', 260, 610, 270)], B('note')), c('house', '박자를 맞춰서 같이 버무려요!', [ch('baby.joy', 180, 600, 210)], B('bang'))],
             'epi': [c('house', '김치가 맛있게 익어 가요!', [ch('baby.joy', 100, 600, 190), ch('nemo_grandma.good', 200, 610, 270), ch('nemo_mom.joy', 300, 610, 270)], B('heart', 1)), c('house', '온 가족이 한자리에 모였어요.', [ch('nemo_dad.joy', 100, 610, 270), ch('wife.joy', 190, 610, 260), ch('dong_dad.joy', 280, 610, 270)], B('sparkle', 1)), c('house', '사계절 내내 함께라서 좋아요!', [ch('baby.joy', 180, 600, 220)], B('heart'))]}
json.dump(T, open('data/story.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

K = json.load(open('data/stickers.json', encoding='utf-8'))
for n, ids in {11: ('nemo_mom.love', 'nemo_dad.joy', 'baby.joy', 'nemo_kids.kid1', 'baby.love'), 12: ('wife.joy', 'husband.joy', 'baby.joy', 'dong_dad.joy', 'nemo_mom.joy'), 13: ('dong_dad.warm', 'nemo_kids.kid2', 'baby.surprise', 'nemo_dad.good', 'dong_dad.joy'), 14: ('wife.love', 'nemo_kids.kid3', 'baby.joy', 'husband.love', 'nemo_mom.wink'), 15: ('nemo_grandma.good', 'nemo_mom.joy', 'nemo_dad.love', 'dong_dad.joy', 'baby.joy')}.items():
    for k, ch_ in zip(['A', 'B', 'C', 'star', 'book'], ids):
        i = 'ch%d_%s' % (n, k)
        if not any(x['id'] == i for x in K):
            K.append({'id': i, 'ch': n, 'char': ch_})
json.dump(K, open('data/stickers.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

R = json.load(open('data/room_items.json', encoding='utf-8')); no = max(x['no'] for x in R['items']); have = {x['id'] for x in R['items']}
for id_, name, e in [('k_ch11', '카네이션 화분', '🌷'), ('k_ch12', '수박 방석', '🍉'), ('k_ch13', '낙엽 책갈피', '🍁'), ('k_ch14', '눈사람 인형', '⛄'), ('k_ch15', '김치 항아리', '🏺')]:
    if id_ in have:
        continue
    no += 1
    R['items'].append({'no': no, 'id': id_, 'name': name, 'set': 'kid', 'room': 'kid', 'w': 40, 'h': 40, 'slot': 'floor', 'art': 'emoji', 'emoji': e, 'colors': ['#FFFFFF'], 'game': 'playground', 'season': None, 'physical': None})
json.dump(R, open('data/room_items.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('ok', no)
