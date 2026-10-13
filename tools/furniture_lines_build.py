"""가구 한 줄 이야기(A20) 조립: tools/furniture_lines_{a,b,c,d}.py → data/furniture_lines.json. 성인 가구(유아 그룹 제외) 모두에 한 줄. 단언: 빠짐·남는 id·중복·길이·광고성 말 없음. 문구 [제안].
housing_build.py 가 이 파일을 읽어 room_items.json 의 각 가구 `line` 으로 넣는다."""
import json, re, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
sys.path.insert(0, 'tools')
from furniture_lines_a import LINES_A; from furniture_lines_b import LINES_B; from furniture_lines_c import LINES_C; from furniture_lines_d import LINES_D
L = {}
for part in (LINES_A, LINES_B, LINES_C, LINES_D):
    for k, v in part.items(): assert k not in L, ('겹치는 id', k); L[k] = v
items = json.load(open('data/room_items.json', encoding='utf-8'))['items']
KG = ('kid', 'daybath', 'wall', 'story_k', 'kseason', 'kgift'); adult = [i['id'] for i in items if i['set'] not in KG]
missing = [i for i in adult if i not in L]; extra = [k for k in L if k not in {i['id'] for i in items}]
assert not missing, ('한 줄이 없는 성인 가구', missing); assert not extra, ('없는 가구 id', extra)
dup = {v for v in L.values() if list(L.values()).count(v) > 1}; assert not dup, ('같은 문장', dup)
bad_len = [k for k, v in L.items() if not (10 <= len(v) <= 60)]; assert not bad_len, ('길이(10~60자)', bad_len)
ads = [k for k, v in L.items() if re.search(r'받아요|설치|스토어|광고|구매|결제|할인|무료', v)]; assert not ads, ('광고성 말', ads)
json.dump(L, open('data/furniture_lines.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('가구 한 줄', len(L), '개 · 성인 가구', len(adult), '모두 있음 · 평균 길이', round(sum(len(v) for v in L.values()) / len(L), 1))
