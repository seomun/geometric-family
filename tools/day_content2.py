"""⑩ 막둥이의 하루 100 → 135판(20장 → 27장 × 5판): 장 7개 추가 + 이야기 7편(D1b, 새 옛이야기 7편의 카드 장). 멱등. [제안]
생성기 목록(games/day/day-gen.js CHAPTERS)·판(node tools/day_gen.js 135)·이야기(data/day_extra.json)를 한 번에 맞춘다. 이후 tools/story_build.py → tools/ops_build.py."""
import json, pathlib, subprocess
R = pathlib.Path('.')
g = R / 'games/day/day-gen.js'; t = g.read_text(encoding='utf-8')
NEW = ["'빨래 헹구기', 'brush', '🧺', '선녀와 나무꾼', 'hands'", "'토끼의 점심', 'chew', '🥕', '토끼전', 'meal'", "'둥지 정리', 'tidy', '🪺', '은혜 갚은 까치', 'books'", "'곶감 간식', 'chew', '🍡', '호랑이와 곶감', 'snack'",
       "'빨간 모자 쓰기', 'dress', '🧢', '빨간 모자'", "'빵 부스러기 줍기', 'tidy', '🍞', '헨젤과 그레텔'", "'장화 신기', 'dress', '👢', '장화 신은 고양이'"]
if "'빨래 헹구기'" not in t:
    t = t.replace("['느릿느릿 잘 준비', 'sleep', '🌙', '토끼와 거북이']];", "['느릿느릿 잘 준비', 'sleep', '🌙', '토끼와 거북이'],\n    " + ", ".join('[' + n + ']' for n in NEW) + "];", 1)
    assert "'빨래 헹구기'" in t; g.write_text(t, encoding='utf-8')
S = [
 (21, 'fairywood', '빨래 헹구기', [('세모 삼촌이 마당에서 빨래를 헹궈요. 막둥이도 작은 손으로 보글보글!', ['husband.good', 'baby.joy'], None), ('「날개옷처럼 하늘하늘하네!」 {sib_kid1}가 하얀 옷을 들어 올렸어요.', ['nemo_kids.kid1', 'baby.surprise'], 'sparkle'), ('깨끗이 헹군 빨래가 햇빛에 반짝반짝. 아기 사슴이 구경 와서 눈을 깜빡!', ['baby.joy', 'wife.joy'], None), ('세모 이모가 웃었어요. 「이 옷은 어디든 날아갈 것 같아!」 막둥이도 두 팔을 활짝!', ['wife.joy', 'baby.joy'], 'heart')]),
 (22, 'rabbitliver', '토끼의 점심', [('점심시간. 막둥이 접시에 당근이 쏙 올라왔어요.', ['baby.joy', 'nemo_mom.good'], None), ('{sib_kid1}가 토끼처럼 귀를 쫑긋. 「당근은 토끼가 제일 좋아하지!」', ['nemo_kids.kid1'], 'question'), ('거북이 아빠는 천천히 천천히 한 입. 동그라미 아저씨 용왕님도 껄껄!', ['nemo_dad.joy', 'dong_dad.warm'], None), ('접시가 싹 비었어요. 토끼는 꾀가 아니라 맛있게 먹어서 힘이 났대요.', ['baby.joy', 'nemo_kids.kid1'], 'heart')]),
 (23, 'magpie', '둥지 정리', [('책장 위 둥지 모양 상자가 어질러졌어요.', ['baby.surprise'], 'question'), ('까치가 은혜를 갚듯, 막둥이가 책을 한 권씩 제자리에 꽂아요.', ['baby.joy'], None), ('아빠 선비가 책 먼지를 후후. 「고마워, 막둥이.」', ['nemo_dad.good', 'baby.joy'], None), ('깨끗해진 둥지 상자 위에서 까치 인형이 고개를 까딱!', ['baby.joy', 'nemo_mom.joy'], 'sparkle')]),
 (24, 'tigerpersimmon', '곶감 간식', [('간식 시간이에요. 엄마가 곶감을 한 접시 내왔어요.', ['nemo_mom.joy', 'baby.joy'], None), ('「호랑이도 울음을 그친다는 그 곶감이야!」 막둥이가 눈을 동그랗게.', ['baby.surprise'], 'bang'), ('호랑이가 창밖에서 슬쩍 구경하다 곶감 한 조각에 순해졌어요.', ['dong_dad.warm', 'baby.joy'], None), ('호랑이도 막둥이도 냠냠. 달콤한 간식은 같이 먹는 게 제일이에요.', ['baby.joy', 'nemo_mom.love'], 'heart')]),
 (25, 'redhood', '빨간 모자 쓰기', [('할머니 댁에 가는 날이에요. 막둥이가 옷장 앞에서 두리번.', ['baby.surprise'], 'question'), ('「빨간 모자가 있었네!」 {sib_kid1}가 모자를 꾹 씌워 줘요.', ['nemo_kids.kid1', 'baby.joy'], None), ('엄마가 바구니를 안겨 주며 말했어요. 「길에서 낯선 소리가 나면 엄마 손 잡자.」', ['nemo_mom.good', 'baby.joy'], None), ('할머니가 문 앞에서 반겨 주었어요. 빨간 모자가 환하게 웃었어요.', ['nemo_grandma.good', 'baby.joy'], 'heart')]),
 (26, 'hansel', '빵 부스러기 줍기', [('식탁 밑에 빵 부스러기가 한가득! 막둥이가 쪼그리고 앉았어요.', ['baby.surprise'], 'question'), ('헨젤처럼 하나씩, 그레텔처럼 하나씩. {sib_kid3}과 {sib_kid1}가 같이 주워요.', ['nemo_kids.kid3', 'nemo_kids.kid1'], None), ('부스러기가 길이 되어 쓰레받기까지 이어졌어요. 길 잃을 걱정은 없어요!', ['baby.joy', 'nemo_mom.good'], 'sparkle'), ('과자집 할머니 인형이 웃으며 말했어요. 「정리하고 같이 과자 구울까?」', ['nemo_grandma.good', 'baby.joy'], 'heart')]),
 (27, 'puss', '장화 신기', [('외출 준비! 막둥이가 현관에서 장화를 들고 끙끙.', ['baby.joy'], 'question'), ('세모 이모가 고양이처럼 윙크. 「장화는 이렇게 쏙!」 한 짝, 두 짝.', ['wife.joy', 'baby.joy'], 'sparkle'), ('또각또각! 장화 소리에 {sib_kid3}도 따라 나왔어요. 「우리 주인님 같다!」', ['nemo_kids.kid3', 'baby.joy'], None), ('세모 이모가 앞장서고 막둥이가 뒤따라요. 오늘도 좋은 하루가 될 거예요.', ['wife.joy', 'baby.joy'], 'heart')]),
]
p = R / 'data/day_extra.json'; d = json.load(open(p, encoding='utf-8')); have = {s['chapter'] for s in d['stories']}; n = 0
for ch, tale, title, cuts in S:
    if ch in have: continue
    d['stories'].append(dict(chapter=ch, title=title, tale=tale, cuts=[dict(text=x[0], chars=x[1], **({'bubble': x[2]} if x[2] else {})) for x in cuts])); n += 1
d['stories'].sort(key=lambda s: s['chapter']); json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('stories +', n)
for cmd in (['node', 'tools/day_gen.js', '135'],):
    r = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8'); print(r.stdout.splitlines()[0] if r.stdout else r.stderr[:200])
