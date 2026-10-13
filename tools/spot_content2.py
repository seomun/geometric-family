"""⑥ 다른 그림 찾기 140 → 210판(14장 → 21장 × 10판): 새 옛이야기 7편의 사연 장(D1b). 멱등. [제안]
생성기 목록(games/spot/spot-gen.js CHAPTERS)·판(node tools/spot_gen.js 210)·사연(data/spot_extra.json 15~21장)을 맞춘다. 이후 tools/story_build.py → tools/ops_build.py.
사연 4컷은 성인 앱 표기(웹툰 호칭). 배역은 tools/tales_cast.py 와 같다(가족 악역 없음)."""
import json, pathlib, subprocess
R = pathlib.Path('.')
g = R / 'games/spot/spot-gen.js'; t = g.read_text(encoding='utf-8')
NEW = ['선녀와 나무꾼', '토끼전', '은혜 갚은 까치', '호랑이와 곶감', '빨간 모자', '헨젤과 그레텔', '장화 신은 고양이']
if "'선녀와 나무꾼'" not in t:
    t = t.replace("'의좋은 형제', '눈의 여왕'];", "'의좋은 형제', '눈의 여왕', " + ", ".join("'%s'" % n for n in NEW) + "];", 1)
    assert "'선녀와 나무꾼'" in t; g.write_text(t, encoding='utf-8')
S = [
 (15, 'fairywood', '선녀와 나무꾼', [('연못가에서 나무꾼(네모 아빠)이 사슴을 구해 주었다. 사슴이 고맙다며 말했다. 「보름달 밤에 선녀들이 목욕하러 온답니다.」', ['nemo_dad.joy'], None), ('보름달 밤, 날개옷 한 벌이 바위 위에 놓여 있었다. 선녀(세모 아내)가 옷을 찾다가 난처한 얼굴로 두리번거렸다.', ['wife.joy'], 'question'), ('나무꾼은 슬며시 옷을 돌려주며 말했다. 「숨기려던 게 아니라, 어디 있는지 알려 주려던 거예요.」 선녀가 활짝 웃었다.', ['nemo_dad.good', 'wife.joy'], None), ('선녀와 아이들(네모네 {kid2})이 나무꾼의 마당에 놀러 와 저녁을 함께 먹었다. 하늘과 땅이 한 상에 모인 밤이었다.', ['wife.joy', 'nemo_dad.joy', 'nemo_kids.kid2'], 'heart')]),
 (16, 'rabbitliver', '토끼전', [('용왕님(동그라미 아빠)이 몸이 안 좋아 누워 있었다. 심부름꾼 거북(네모 아빠)이 말했다. 「육지의 토끼를 모셔 오겠습니다.」', ['dong_dad.warm', 'nemo_dad.joy'], None), ('거북이 토끼(네모네 {kid1})를 등에 태워 바다로 갔다. 토끼는 바닷속 구경에 눈이 동그래졌다.', ['nemo_kids.kid1', 'nemo_dad.joy'], 'sparkle'), ('「간이 필요하다고요? 마침 두고 왔어요!」 토끼가 꾀를 내자 용왕님은 오히려 껄껄 웃었다. 「꾀 많은 손님이로군.」', ['nemo_kids.kid1', 'dong_dad.warm'], 'question'), ('용왕님의 병은 사실 외로움이었다. 토끼와 거북이 한 상에서 해초 전을 나눠 먹으니 금세 기운이 났다.', ['dong_dad.warm', 'nemo_kids.kid1', 'nemo_dad.good'], 'heart')]),
 (17, 'magpie', '은혜 갚은 까치', [('길 가던 선비(네모 아빠)가 까치 둥지로 올라가는 구렁이를 보고 소리쳤다. 「이 녀석!」 구렁이는 놀라 숲으로 사라졌다.', ['nemo_dad.joy'], 'bang'), ('그날 밤, 선비가 묵던 빈집에 구렁이가 나타났다. 순한 얼굴로 한참을 지켜보다 고개를 갸웃했다.', ['nemo_dad.good'], 'question'), ('그때 종소리가 울렸다. 까치들이 날개로 종을 치며 소리쳤다. 「여기 사람이 있어요!」', ['nemo_dad.good'], 'bang'), ('까치의 도움으로 선비는 무사히 하룻밤을 지냈다. 아침에 까치 둥지 앞에 곡식을 한 줌 놓고 인사했다.', ['nemo_dad.joy', 'nemo_mom.joy'], 'heart')]),
 (18, 'tigerpersimmon', '호랑이와 곶감', [('겨울밤, 아기(네모 {baby})가 칭얼칭얼 울었다. 엄마(네모 엄마)가 달랬지만 그치지 않았다.', ['baby.surprise', 'nemo_mom.joy'], 'question'), ('창밖에서 호랑이가 슬쩍 엿들었다. 「무서운 호랑이가 온다 해도 안 그치더니…」', ['nemo_mom.good'], None), ('엄마가 말했다. 「자, 곶감이다!」 아기가 뚝 그쳤다. 호랑이는 곶감이 자기보다 센 줄 알고 깜짝 놀랐다.', ['baby.joy', 'nemo_mom.joy'], 'sparkle'), ('곶감 아저씨(동그라미 아빠)가 호랑이에게도 한 조각을 건넸다. 호랑이는 처음 먹어 본 단맛에 눈을 꼭 감았다.', ['dong_dad.warm', 'baby.joy'], 'heart')]),
 (19, 'redhood', '빨간 모자(순한 판)', [('빨간 모자(네모네 {kid1})는 엄마(네모 엄마)가 싸 준 바구니를 들고 할머니 댁으로 갔다. 「낯선 소리가 나면 큰 길로 가렴.」', ['nemo_kids.kid1', 'nemo_mom.good'], None), ('숲길에서 늑대 소리가 멀리서 들렸다. 빨간 모자는 꽃구경을 멈추고 큰 길로 걸었다.', ['nemo_kids.kid1'], 'question'), ('할머니(네모 할머니)가 문을 열고 반겼다. 늑대는 문 앞에서 쭈뼛거리다 바구니의 빵 냄새에 그만 꼬리를 흔들었다.', ['nemo_grandma.good', 'nemo_kids.kid1'], 'sparkle'), ('결국 빵 한 조각을 나눠 먹으며 늑대도 한 식구처럼 앉았다. 빨간 모자가 말했다. 「다음엔 같이 오자!」', ['nemo_kids.kid1', 'nemo_grandma.good'], 'heart')]),
 (20, 'hansel', '헨젤과 그레텔(순한 판)', [('헨젤(네모네 {kid3})과 그레텔(네모네 {kid1})은 아버지(네모 아빠)와 숲에 갔다. 헨젤은 빵 부스러기를 길에 하나씩 뿌렸다.', ['nemo_kids.kid3', 'nemo_kids.kid1', 'nemo_dad.good'], None), ('부스러기를 새들이 다 먹어 버려 둘은 길을 잃었다. 그러다 과자로 지은 집을 발견했다.', ['nemo_kids.kid3', 'nemo_kids.kid1'], 'question'), ('과자집 할머니는 사탕을 너무 좋아해 아이들을 붙잡아 두고 싶어 했다. 그레텔이 말했다. 「저희도 집에 가야 해요.」', ['nemo_kids.kid1'], None), ('결국 할머니와 아이들은 함께 과자를 구웠다. 구운 과자를 한 바구니 들고 둘은 아버지에게 돌아갔다.', ['nemo_kids.kid3', 'nemo_kids.kid1', 'nemo_dad.joy'], 'heart')]),
 (21, 'puss', '장화 신은 고양이', [('방앗간 집 막내아들(네모네 {kid3})이 물려받은 건 고양이 한 마리뿐이었다. 고양이(세모 아내)가 말했다. 「장화 한 켤레와 자루만 주세요.」', ['nemo_kids.kid3', 'wife.joy'], None), ('장화를 신은 고양이는 임금님(동그라미 아빠)께 토끼를 선물하며 말했다. 「카라바 후작님의 선물입니다.」', ['wife.joy', 'dong_dad.warm'], 'sparkle'), ('변신 마법사가 성에서 사자로 변하자 고양이는 침착하게 말했다. 「생쥐로도 변하실 수 있나요?」 마법사는 어느새 생쥐가 되었다.', ['wife.joy'], 'bang'), ('혼쭐난 마법사는 성을 돌려주고 친구가 되었다. 막내아들은 임금님과 한 상에 앉았고, 고양이는 장화로 또각 박자를 맞췄다.', ['nemo_kids.kid3', 'dong_dad.warm', 'wife.joy'], 'heart')]),
]
p = R / 'data/spot_extra.json'; d = json.load(open(p, encoding='utf-8')); have = {s['chapter'] for s in d['stories']}; n = 0
for ch, tale, title, cuts in S:
    if ch in have: continue
    d['stories'].append(dict(chapter=ch, title=title, tale=tale, cuts=[dict(text=x[0], chars=x[1], **({'bubble': x[2]} if x[2] else {})) for x in cuts])); n += 1
d['stories'].sort(key=lambda s: s['chapter']); json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('stories +', n)
r = subprocess.run(['node', 'tools/spot_gen.js', '210'], capture_output=True, text=True, encoding='utf-8'); print(r.stdout.splitlines()[0] if r.stdout else r.stderr[:200])
