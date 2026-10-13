"""D22-1 ① 놀이터: 장마다 그 장 놀이를 보여 주는 미니 판을 책(프롤로그) 둘째 컷에 붙인다(멱등). data/story.json 의 글은 그대로, mini 만 덧붙인다."""
import json, io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
MINI = {1: dict(a='wife.good', b='wife.good', shadow=1), 2: dict(a='😊', b='🪞'), 3: dict(a='🧩', b='🖼️'), 4: dict(a='🖍️', b='🎨'), 5: dict(a='🔺', b='🕳️'), 6: dict(a='👆', b='🔔'), 7: dict(a='👂', b='🔔'),
        8: dict(a='👕', b='🧒'), 9: dict(a='🚃', b='🚂'), 10: dict(a='🍓', b='🎂'), 11: dict(a='🌱', b='🪴'), 12: dict(a='🍉', b='🍽️'), 13: dict(a='🔍', b='🍂'), 14: dict(a='🧺', b='❄️'), 15: dict(a='🥁', b='🎵')}
LINE = {1: '그림자랑 똑같은 모습을 찾아 쏙 맞춰 봐요!', 2: '같은 표정을 찾아 맞춰 봐요.', 3: '조각을 끌어다 빈자리에 쏙!', 4: '크레파스로 쓱쓱, 색을 칠해요.', 5: '모양을 구멍에 맞춰 넣어요.', 6: '순서대로 톡톡톡 눌러요.', 7: '어디서 나는 소리일까? 귀를 기울여요.', 8: '알맞은 옷을 골라 입혀요.',
        9: '기차를 이어 붙여요.', 10: '딸기를 케이크 위에 올려요.', 11: '씨앗을 심으면 쑥쑥 자라요.', 12: '똑같이 나눠 접시에 담아요.', 13: '낙엽 속에 숨은 걸 찾아요.', 14: '떨어지는 눈송이를 바구니로 받아요.', 15: '북을 박자에 맞춰 둥둥!'}
p = 'data/story.json'; S = json.load(open(p, encoding='utf-8')); n = 0
for k, v in S.items():
    if not k.startswith('ch') or 'pro' not in v: continue
    i = int(k[2:]); m = MINI.get(i)
    if not m or any(c.get('tut') for c in v['pro']): continue
    c0 = v['pro'][0]; v['pro'].insert(1, dict(bg=c0.get('bg', 'indoor2'), text=LINE[i], chars=[dict(id='baby.joy', x=180, y=600, h=200)], mini=dict(m, app='play'), tut=1)); n += 1
json.dump(S, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('play tutorial cut added to', n, 'chapters')
