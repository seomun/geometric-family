"""허브 결정 2026-10-12(2): ① 잭과 콩나무 잭 = 세찌(kid3) ② 눈의 여왕 카이 = 막둥이, 게르다 = 하나 누나(원작의 「소녀가 소년을 구한다」). 일회성·멱등 정정 + GENDER_OK 에 원작 이름 역 성별표."""
import json, pathlib, re
R = pathlib.Path('.')
def edit(path, fn):
    p = R / path; raw = p.read_bytes().decode('utf-8'); new = fn(raw)
    if new != raw: p.write_bytes(new.encode('utf-8')); print('edit', path)

# ---- 잭 = 세찌: 소스 ----
def jack_blk(raw, start, end):
    a = raw.index(start); b = raw.index(end, a + 10); blk = raw[a:b]
    return raw[:a] + blk.replace('{kid2}', '{kid3}').replace('nemo_kids.kid2', 'nemo_kids.kid3') + raw[b:]
edit('tools/tales_build.py', lambda r: jack_blk(r, " dict(id='jack',", "\n]"))   # T12 의 마지막 dict(잭)
edit('tools/tales_block.py', lambda r: jack_blk(r, " dict(base='jack',", " dict(base='kongjwi'"))
edit('tools/tales_cast.py', lambda r: r.replace("('잭', 'kid2', 'lead')", "('잭', 'kid3', 'lead')"))

# ---- ① 눈의 여왕(① 14장): tales_build K ----
def snow(raw):
    a = raw.index(" dict(ch=14, id='snowqueen'"); b = raw.index(" dict(ch=15,", a)
    new = ''' dict(ch=14, id='snowqueen', title='눈의 여왕(순한 판)', origin='안데르센(공유 저작물)', bg='night', mode='눈송이 잡기(색 고르기)',
  cast=[('카이', '막둥이', 'lead', 'nemo'), ('게르다', '네모 {kid1} {sib_kid1}', 'lead', 'nemo'), ('눈의 여왕(순한 판)', '동그라미 아주머니', 'helper', 'dong')], art_pending=['동그라미 아주머니 시트(임시: 그림 없이 글로만)'],
  line='얼음 궁전은 포근한 눈 궁전, {sib_kid1}의 따뜻한 눈물에 눈송이가 녹아요(소녀가 소년을 구하는 원작 그대로).', kept=['눈송이(거울 조각)가 눈에 들어감', '눈의 여왕이 카이를 데려감', '게르다가 찾아가 눈물로 녹임'],
  pro=[('첫눈이 내리는 날, 눈송이 하나가 막둥이 눈에 쏙 들어갔어요.', [('baby.surprise', 190)], 'bang'),
       ('막둥이는 눈의 여왕 동그라미 아주머니를 따라 포근한 눈 궁전으로 갔어요.', [('baby.joy', 190)], None),
       ('{sib_kid1}가 막둥이를 찾아 눈길을 걸어가요. 같은 색 눈송이를 톡톡 잡으며 길을 열어요!', [('nemo_kids.kid1', 230)], 'sparkle')],
  epi=[('{sib_kid1}의 따뜻한 눈물에 눈송이가 사르르 녹았어요.', [('nemo_kids.kid1', 230)], 'heart'),
       ('막둥이가 눈을 비비며 「{sib_kid1}!」 하고 안겼어요.', [('nemo_kids.kid1', 230), ('baby.love', 150)], 'heart'),
       ('눈의 여왕 아주머니도 손을 흔들어 주었어요. 함께 집으로!', [('nemo_kids.kid1', 230), ('baby.joy', 150)], 'sparkle')]),
'''
    nl = '\\r\\n' if '\r\n' in raw else '\n'
    new = new.replace('\n', '\r\n') if '\r\n' in raw else new
    return raw[:a] + new + raw[b:]
edit('tools/tales_build.py', snow)
edit('tools/tales_cast.py', lambda r: r.replace("('카이', 'kid1', 'lead'), ('게르다', 'baby', 'lead')", "('카이', 'baby', 'lead'), ('게르다', 'kid1', 'lead')"))

# ---- 앱 데이터: 잭(5앱+⑩), 눈의 여왕(⑥ 14장·⑩ 12장) ----
SNOW_SPOT = [
 dict(text='겨울밤, 눈송이(거울 조각) 하나가 카이(네모 {baby})의 눈에 콕 들어가 카이는 말이 없어졌다.', chars=['baby.surprise'], bubble='question'),
 dict(text='눈의 여왕(동그라미 엄마)은 카이를 포근한 하얀 성으로 데려갔다. 사납게 굴지 않고 다정하게 지켜보았다.', chars=['baby.joy']),
 dict(text='친구 게르다(네모네 {kid1})가 눈길을 걸어 성까지 찾아왔다. 「카이야, 같이 집에 가자!」', chars=['nemo_kids.kid1', 'baby.joy'], bubble='heart'),
 dict(text='게르다의 따뜻한 눈물에 눈 조각이 녹았다. 눈의 여왕도 고개를 끄덕여 길을 열어 주었고, 둘은 손을 잡고 돌아갔다.', chars=['nemo_kids.kid1', 'baby.joy'], bubble='sparkle')]
SNOW_DAY = [
 dict(text='눈이 내리는 밤, 눈송이 하나가 {baby} 눈에 쏙 들어갔어요. {baby}는 눈을 비비며 졸려 했어요.', chars=['baby.tired']),
 dict(text='눈의 여왕 아주머니가 하얀 눈이불을 하늘 가득 펼쳐 포근히 덮어 주었어요.', chars=['baby.joy'], bubble='sparkle'),
 dict(text='{sib_kid1}가 {baby}의 손을 꼭 잡았어요. 춥지 않았어요.', chars=['nemo_kids.kid1', 'baby.joy']),
]
for f in ['merge', 'spot', 'block', 'sort', 'tile', 'day']:
    p = R / f'data/{f}_extra.json'; raw = p.read_text(encoding='utf-8'); d = json.loads(raw); ch = 0
    for s in d['stories']:
        if s['tale'] == 'jack':
            for c in s['cuts']: c['text'] = c['text'].replace('{kid2}', '{kid3}'); c['chars'] = [x.replace('nemo_kids.kid2', 'nemo_kids.kid3') for x in c['chars']]; ch += 1
        if s['tale'] == 'snowqueen' and f == 'spot':
            s['cuts'] = [dict(c) for c in SNOW_SPOT]; ch += 1
        if s['tale'] == 'snowqueen' and f == 'day':
            s['cuts'] = SNOW_DAY + [s['cuts'][-1]]; ch += 1
    out = json.dumps(d, ensure_ascii=False, indent=1)
    if ch and out != raw.rstrip('\n'): p.write_text(out + ('\n' if raw.endswith('\n') else ''), encoding='utf-8'); print('data', f, ch)

# ---- GENDER_OK: 원작 이름 역 성별표 ----
def gender(raw):
    if 'MALE_NAMES' in raw: return raw
    raw = raw.replace("MALE_WORDS, FEMALE_WORDS = ('형', '오빠', '아우', '남동생', '아들'), ('누나', '언니', '누이', '여동생', '딸')",
                      "MALE_WORDS, FEMALE_WORDS = ('형', '오빠', '아우', '남동생', '아들'), ('누나', '언니', '누이', '여동생', '딸')\nMALE_NAMES, FEMALE_NAMES = ('잭', '카이', '피노키오', '흥부', '놀부', '왕자', '도령'), ('게르다', '콩쥐', '팥쥐', '공주', '신데렐라', '누이')   # 원작 이름 역의 성별(2026-10-12)")
    raw = raw.replace("if key in FEMALE_KIDS and any(w in role for w in MALE_WORDS):", "if key in FEMALE_KIDS and any(w in role for w in MALE_WORDS + MALE_NAMES):")
    raw = raw.replace("if key in MALE_KIDS and any(w in role for w in FEMALE_WORDS):", "if key in MALE_KIDS and any(w in role for w in FEMALE_WORDS + FEMALE_NAMES):")
    return raw
edit('tools/tales_cast.py', gender)
print('ok')
