"""호칭 정정(허브 2026-10-12): 캐릭터 정본 하나=큰딸·두리=작은딸·세찌=작은아들, 막둥이(남)는 큰누나 시점.
sib1(=형) 을 아이별 변수 sib_kid1(누나)·sib_kid2(누나)·sib_kid3(형) 으로 나누고, 「의좋은 형제」의 형은 세찌(kid3)로 한다."""
import json, pathlib, re
R = pathlib.Path('.')
n = json.load(open('data/names.json', encoding='utf-8'))
n['sib1'] = '누나'   # 호환용(옛 글의 {sib1}) — 새 글은 아이별 변수를 쓴다
n['sib_kid1'] = '누나'; n['sib_kid2'] = '누나'; n['sib_kid3'] = '형'
n['note'] = ('아이 호칭 변수. 이야기·문서 글에 {sib_kid1}·{kid1}처럼 쓰면 화면에서 이 값으로 바뀌고, 뒤에 붙은 은/는·이/가·을/를·과/와는 받침에 맞게 저절로 고쳐진다. '
             '막둥이(남) 시점 호칭 = 하나·두리 → 누나(sib_kid1·sib_kid2), 세찌 → 형(sib_kid3). {sib1} 은 옛 글 호환(누나). 작가 결정이 나오면 이 파일 값만 바꾸고 `python tools/tales_build.py` 를 다시 돌린다. '
             'brothers 는 11장 「의좋은 형제」 제목·글(형 = 세찌, 아우 = 막둥이)에 쓰는 말이다.')
n['brothers_options'] = {'형(세찌)+막둥이(남)': '의좋은 형제', '누나+막둥이(남)': '의좋은 남매', '언니+막둥이(여)': '의좋은 자매'}
json.dump(n, open('data/names.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)

# 1) 이야기 원천: {sib1} → {sib_kid1}(하나 누나). 단 「의좋은 형제」(ch11)는 형 = 세찌
p = R / 'tools/tales_build.py'; s = p.read_text(encoding='utf-8')
a = s.index("dict(ch=11, id='brothers'"); b = s.index("dict(ch=12, id='ant'")
blk = s[a:b].replace('{sib1}', '{sib_kid3}').replace("nemo_kids.kid1", "nemo_kids.kid3")
s = s[:a] + blk + s[b:]
s = s.replace("'{sib1}이 찾아옴'", "'놀부(세모 삼촌)가 찾아옴'")
s = s.replace('{sib1}', '{sib_kid1}')
p.write_text(s, encoding='utf-8')
c = R / 'tools/tales_cast.py'; t = c.read_text(encoding='utf-8')
t = t.replace("'kid1': ('네모네 {kid1}', '{sib1}', 'nemo'), 'kid2': ('네모네 {kid2}', '{kid2}', 'nemo'), 'kid3': ('네모네 {kid3}', '{kid3}', 'nemo')",
              "'kid1': ('네모네 {kid1}', '{kid1} {sib_kid1}', 'nemo'), 'kid2': ('네모네 {kid2}', '{kid2} {sib_kid2}', 'nemo'), 'kid3': ('네모네 {kid3}', '{kid3} {sib_kid3}', 'nemo')")
t = t.replace("'brothers': [('형', 'kid1', 'lead')", "'brothers': [('형', 'kid3', 'lead')")
c.write_text(t, encoding='utf-8')
# 2) 데이터: day 이야기
for f in ['data/day_extra.json', 'tools/story_build.py']:
    q = R / f
    if q.exists():
        x = q.read_text(encoding='utf-8'); q.write_text(x.replace('{sib1}', '{sib_kid1}'), encoding='utf-8')
d = R / 'games/18_STORY_PASS.md'; d.write_text(d.read_text(encoding='utf-8').replace('{sib1}', '{sib_kid1}'), encoding='utf-8')
print('done')
