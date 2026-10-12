"""games/24_IP_TEXT.md 생성: 특별 소품 30개·카메오 36명 표(data/room_items.json·data/ops.json 에서). 허브 QA 용. 실행: python tools/ip_text.py"""
import json, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
R = json.load(open('data/room_items.json', encoding='utf-8')); O = json.load(open('data/ops.json', encoding='utf-8')); T = O['tales']; N = O['appNames']
WHO = {'husband.joy': '세모 남편', 'dong_dad.calm': '동그라미 아빠', 'nemo_dad.good': '네모 아빠', 'nemo_mom.good': '네모 엄마', 'nemo_kids.kid1': '하나', 'nemo_grandma.good': '네모 할머니', 'wife.smug': '세모 아내', 'dong_dad.joy': '동그라미 아저씨', 'nemo_kids.kid2': '두리 누나', 'wife.joy': '세모 이모'}
rows = ['# 24. IP 글 목록 — 특별 소품 30개 · 카메오 36명 (허브 QA용, 모든 글 [제안])', '', '> 생성: `python tools/ip_text.py`(원천 `data/room_items.json` 세트 story_a/story_k · `data/ops.json` cameos). 소품 이름은 `tools/ip_items.py`, 카메오는 `tools/ops_build.py` 의 `GUEST`/`KID_GUEST`/`cameos()`(허브 v2 대사 `docs/24_CAMEO_LINES_v2.md` 반영)에서 고친다. 그림은 임시 이모지. 캡처 `notes/snapshots/ip_sheet.png`.', '',
        '## 1. 이야기 완성 특별 소품 (카드 4장을 모으면 집에 확정 지급)', '', '| # | 이야기 | 성인 소품 | 유아 소품 | 이모지 |', '|---|---|---|---|---|']
items = {i['id']: i for i in R['items'] if i['set'] in ('story_a', 'story_k')}; n = 0
for t, v in T.items():
    a = items.get(f't_{t}_a'); k = items.get(f't_{t}_k')
    if not a and not k: continue
    n += 1; rows.append(f"| {n} | {v['title']} | {a['name'] if a else '—'} | {k['name'] if k else '—'} | {(a or k)['emoji']} |")
rows += ['', f"성인 {sum(1 for i in items.values() if i['set'] == 'story_a')}개 + 유아 {sum(1 for i in items.values() if i['set'] == 'story_k')}개 = {len(items)}개(이름은 같고 방이 다름).", '',
         '## 2. 카메오 (장 끝 컷 직후 한 번, 도감에 기록)', '', '손님 7명(세 가족 고루) · **성인 30개 대사 모두 다름** · 유아 ⑩ 6명은 글 없음(손님 동그라미 아저씨 🚂·두리 누나 🖍️·세모 이모 🎈).', '',
         '| # | 나오는 앱 | 시점 | 손님이 일하는 앱 | 손님 | 소품 | 대사 |', '|---|---|---|---|---|---|---|']
for i, c in enumerate(O['cameos'], 1):
    rows.append(f"| {i} | {N[c['host']]} | {c['after'].replace('e', '')}장 끝 | {N[c['frm']]} | {WHO.get(c['who'], c['who'])} | {c['prop']} | {c['line'] or '(글 없음)'} |")
rows += ['', '## 3. QA 메모', '- 광고성 말(받아요·설치·스토어·광고)·대사 중복 0 은 `tools/ip_smoke.js` 가 단언한다.', '- 손님이 나오는 앱 순서는 ③ 합치기 → ⑥ → ⑦ → ⑧ → ⑨ 에서 **그 손님의 앱을 뺀 순서**, k번째 앱에서 k번 대사(세모 아내·네모 할머니는 5번까지).']
open('games/24_IP_TEXT.md', 'w', encoding='utf-8').write('\n'.join(rows) + '\n'); print('rows', len(rows))
