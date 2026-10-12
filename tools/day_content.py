"""⑩ 막둥이의 하루 60 → 100판(12장 → 20장 × 5판): 장 8개 추가 + 이야기 8편(단일 배역표의 옛이야기 id, 유아 글). 멱등.
생성기 목록(games/day/day-gen.js CHAPTERS)·판(node tools/day_gen.js 100)·이야기(data/day_extra.json)를 한 번에 맞춘다."""
import json, pathlib, re, subprocess, sys
R = pathlib.Path('.')
g = R / 'games/day/day-gen.js'; t = g.read_text(encoding='utf-8')
NEW = [("'저녁 양치', 'brush', '🪥', '브레멘 음악대', 'teeth'"), ("'목욕 시간', 'brush', '🛁', '혹부리 영감', 'bath'"), ("'외출 옷 입기', 'dress', '🧥', '구두장이와 요정'"), ("'점심밥', 'chew', '🍱', '의좋은 형제', 'meal'"),
       ("'책 정리', 'tidy', '📚', '피노키오', 'books'"), ("'신발 가지런히', 'tidy', '🥿', '콩쥐팥쥐', 'shoes'"), ("'오후 간식', 'chew', '🍉', '개미와 베짱이', 'snack'"), ("'느릿느릿 잘 준비', 'sleep', '🌙', '토끼와 거북이'")]
if "'저녁 양치'" not in t:
    t = t.replace("['잘 자요', 'sleep', '⭐', '눈의 여왕']];", "['잘 자요', 'sleep', '⭐', '눈의 여왕'],\n    " + ", ".join('[' + n + ']' for n in NEW) + "];", 1)
    assert "'저녁 양치'" in t; g.write_text(t, encoding='utf-8')
S = [
 (13, 'bremen', '저녁 양치', [('밤이 되었어요. 막둥이는 세모 이모와 나란히 서서 칫솔을 들었어요.', ['baby.joy', 'wife.joy'], None), ('「브레멘 음악대처럼 노래하며 닦아 볼까?」 쓱싹쓱싹 쓱싹쓱싹.', ['wife.wink', 'baby.joy'], 'note'), ('당나귀 소리도, 멍멍 소리도, 야옹 소리도 따라 하며 이가 반짝반짝!', ['baby.surprise'], 'sparkle'), ('입을 헹구고 활짝 웃어요. 이제 달콤한 꿈 속으로.', ['baby.love'], 'heart')]),
 (14, 'hok', '목욕 시간', [('목욕 시간! 동그라미 아저씨가 거품을 한가득 만들어 주었어요.', ['dong_dad.warm', 'baby.joy'], None), ('막둥이 머리에 거품 모자가 봉긋! 「혹부리 영감님 같네!」', ['baby.surprise'], 'sparkle'), ('거품이 퐁퐁 터질 때마다 웃음도 퐁퐁.', ['baby.joy'], None), ('뽀송뽀송 닦고 나니 몸이 가벼워요.', ['baby.love', 'dong_dad.joy'], 'heart')]),
 (15, 'shoes', '외출 옷 입기', [('밖에 나갈 시간이에요. 막둥이가 옷장 앞에서 두리번.', ['baby.surprise'], 'question'), ('「구두장이 요정이 몰래 옷을 챙겨 놓았나 봐!」 모자도 겉옷도 양말도 딱.', ['nemo_mom.wink', 'baby.joy'], 'sparkle'), ('요정은 어디에도 없었지만 따뜻한 마음은 가득.', ['baby.joy'], None), ('준비 끝! 엄마 손을 잡고 출발해요.', ['nemo_mom.love', 'baby.love'], 'heart')]),
 (16, 'brothers', '점심밥', [('점심시간. {sib_kid3}과 {baby}는 밥을 똑같이 나눠 담았어요.', ['nemo_kids.kid3', 'baby.joy'], None), ('{sib_kid3}이 막둥이 접시에 반찬을 더. 막둥이도 {sib_kid3} 접시에 반찬을 더!', ['nemo_kids.kid3', 'baby.joy'], 'question'), ('반찬이 줄지 않아 서로 갸웃, 그러다 깔깔!', ['baby.surprise', 'nemo_kids.kid3'], 'sparkle'), ('함께 먹으니 더 맛있어요. 의좋은 형제의 점심.', ['baby.love', 'nemo_kids.kid3'], 'heart')]),
 (17, 'pino', '책 정리', [('책 정리 시간이에요. 피노키오 인형이 책장 위에서 지켜봐요.', ['baby.joy'], 'question'), ('빨간 책, 초록 책, 파란 책, 노란 책. 색깔끼리 줄을 맞춰요.', ['baby.joy', 'nemo_mom.good'], None), ('코가 길어질 만큼 신나서 막둥이는 힘껏 책을 꽂았어요.', ['baby.surprise'], 'sparkle'), ('책장이 알록달록해졌어요. 피노키오도 박수!', ['baby.love'], 'heart')]),
 (18, 'kongjwi', '신발 가지런히', [('현관에 신발이 어질러져 있어요.', ['baby.surprise'], 'question'), ('꽃신 한 짝을 찾던 콩쥐처럼, 짝을 찾아 가지런히 놓아요. {sib_kid1}도 같이 찾아 줘요.', ['baby.joy', 'nemo_kids.kid1'], None), ('한 켤레, 두 켤레, 세 켤레! 신발이 나란히.', ['baby.joy'], 'sparkle'), ('현관이 반짝반짝. 내일도 씩씩하게 나가요.', ['baby.love'], 'heart')]),
 (19, 'ant', '오후 간식', [('간식 시간! 엄마가 개미처럼 작은 접시에 열매를 모았어요.', ['nemo_mom.joy'], None), ('막둥이는 한 입 먹고, 한 입은 곰 인형에게.', ['baby.joy'], None), ('개미와 베짱이처럼 나눠 먹으면 더 달콤해요.', ['baby.love', 'nemo_mom.love'], 'heart'), ('접시가 깨끗하게 비었어요. 잘 먹었습니다!', ['baby.joy'], 'sparkle')]),
 (20, 'hare', '느릿느릿 잘 준비', [('잘 준비를 해요. 토끼처럼 쏜살같이? 아니, 거북이처럼 느릿느릿.', ['baby.joy'], None), ('느릿느릿 이불을 펴고, 느릿느릿 인형을 눕히고.', ['baby.tired', 'nemo_mom.love'], None), ('천천히 가도 괜찮아요. 오늘 하루도 잘 해냈어요.', ['baby.love'], 'heart'), ('「잘 자.」 불을 끄면 달님이 창문으로 웃어요.', ['nemo_mom.love', 'baby.tired'], 'zzz')]),
]
p = R / 'data/day_extra.json'; d = json.load(open(p, encoding='utf-8')); have = {s['chapter'] for s in d['stories']}; n = 0
for ch, tale, title, cuts in S:
    if ch in have: continue
    d['stories'].append(dict(chapter=ch, title=title, tale=tale, cuts=[dict(text=x[0], chars=x[1], **({'bubble': x[2]} if x[2] else {})) for x in cuts])); n += 1
d['stories'].sort(key=lambda s: s['chapter']); json.dump(d, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('stories +', n)
for cmd in (['node', 'tools/day_gen.js', '100'],):
    r = subprocess.run(cmd, capture_output=True, text=True, encoding='utf-8'); print(r.stdout.splitlines()[0] if r.stdout else r.stderr[:200])
