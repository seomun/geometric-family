"""assets/_generated/ASSET_LIST.csv 를 우선순위로 정렬한다(작가가 Scenario 를 결제한 뒤 이 순서로 그린다). 다시 돌려도 같은 결과(멱등).
1 = 대표 그림·배경·이야기 컷 배경·표지·아이콘·시트(화면 첫인상과 스토리 컷이 바뀐다), 2 = 타일·정리 물건·소품·놀이 그림·UI(게임 판 안), 3 = 집 아이템·가구(수집 보상)."""
import csv, io, sys
P = 'assets/_generated/ASSET_LIST.csv'
rows = list(csv.DictReader(open(P, encoding='utf-8-sig'))); keys = [k for k in rows[0].keys() if k != '우선순위']; K = keys[1]
P1 = {'지도 구역 배경', '지도 관문·랜드마크', '배경', '표지', '앱 아이콘', '집 방', '타이틀 대표 그림', '장면 배경 슬롯', '캐릭터 시트', '옛이야기 가족 밖 배역', '이야기 컷 배경'}
P3 = {'집 아이템', '집 가구'}
TALES = [('pigs', '아기돼지 삼형제', 'a straw house, a wooden house and a brick house on a green hill with a soft wind'), ('bears', '세 마리 곰', 'a cozy cottage kitchen with three bowls of soup on a table'),
         ('shoes', '구두장이와 요정', 'a small shoemaker workshop at night with tiny shoes on a bench'), ('kongjwi', '콩쥐팥쥐', 'a village yard with a big earthen jar and a mountain behind'),
         ('heungbu', '흥부와 놀부', 'a country house roof with a giant gourd vine and swallow nest'), ('bremen', '브레멘 음악대', 'a forest road at dusk with a lit cottage window'),
         ('hok', '혹부리 영감', 'a quiet mountain hollow with a fallen log and lanterns'), ('axe', '금도끼 은도끼', 'a calm pond at the edge of a forest with a mossy stump'),
         ('sun', '해와 달', 'a night sky with a big moon over a thatched roof'), ('ant', '개미와 베짱이', 'a sunny meadow with an anthill and tall grass'),
         ('pino', '피노키오', 'a wooden toy workshop with a small bed and warm lamp'), ('jack', '잭과 콩나물', 'a hill with a giant bean stalk going up into soft clouds'),
         ('gyeonwoo', '견우와 직녀', 'a starry night with a gentle river of stars'), ('ureng', '우렁 각시', 'a rice field with a small snail shell by a quiet house'),
         ('hare', '토끼와 거북이', 'a long country road with a finish ribbon and trees'), ('brothers', '의좋은 형제', 'two rice-straw piles in a moonlit field'), ('snowqueen', '눈의 여왕', 'a snowy village with a frosty window')]
have = {r['id'] for r in rows}
for t, ko, desc in TALES:
    i = 'storybg:' + t
    if i not in have:
        rows.append({keys[0]: i, keys[1]: '이야기 컷 배경', keys[2]: f'10앱 이야기 컷(GF.tale) 배경 — {ko}', keys[3]: '1080x1920 세로', keys[4]: 'merge/spot/block/sort/tile/day',
                     keys[5]: '글로 만든 배경(임시: 공용 배경 재사용)', keys[6]: f'{desc}, portrait background, keep lower-middle area empty for characters; flat pastel vector illustration, uniform warm-brown #6b5443 outline, no gradients, no text, no characters, rounded kid-friendly shapes'})
for t, ko, desc in TALES:
    i = 'map-zone:' + t
    if i not in have:
        rows.append({keys[0]: i, keys[1]: '지도 구역 배경', keys[2]: f'이야기 지도(GF.saga) 구역 배경 — {ko}. 같은 이야기는 앱이 달라도 같은 그림(슬롯 map.<앱>:<장>:bg 에 같은 파일 등록)', keys[3]: '360x970 세로 타일(이웃 구역과 위·아래 이음)', keys[4]: 'merge/spot/block/sort/tile/day',
                     keys[5]: '코드 SVG 실루엣(임시)', keys[6]: f'{desc}, vertical scrolling game map zone, path area kept empty in the middle, flat pastel vector illustration, uniform warm-brown #6b5443 outline, no text, no characters'})
        rows.append({keys[0]: 'map-mark:' + t, keys[1]: '지도 관문·랜드마크', keys[2]: f'이야기 지도 랜드마크 2개 + 관문 책 — {ko}', keys[3]: '220x220 투명 ×3', keys[4]: 'merge/spot/block/sort/tile/day', keys[5]: '이모지(임시)',
                     keys[6]: f'two small landmark props and a story-book icon for {ko}, transparent background, flat pastel vector illustration, uniform warm-brown #6b5443 outline, no text'})
for k, (ko, d) in {'sky': ('지도 하늘 띠', 'soft sky strip 360x90'), 'node': ('판 노드', 'round level button, plain'), 'node_lock': ('잠긴 판 노드', 'round level button, grey, locked'), 'chest': ('구역 상자(닫힘)', 'small treasure chest closed'), 'chest_open': ('구역 상자(열림)', 'small treasure chest open with sparkles')}.items():
    i = 'map-ui:' + k
    if i not in have:
        rows.append({keys[0]: i, keys[1]: '지도 UI', keys[2]: f'이야기 지도 {ko} (슬롯 map.{k})', keys[3]: '160x160' if k != 'sky' else '360x90', keys[4]: 'all', keys[5]: '코드(임시)', keys[6]: f'{d}, flat pastel vector illustration, uniform warm-brown #6b5443 outline, no text'})
def pr(r): return 1 if r[K] in P1 else 3 if r[K] in P3 else 2
order = {k: i for i, k in enumerate(['이야기 컷 배경', '타이틀 대표 그림', '배경', '장면 배경 슬롯', '표지', '집 방', '캐릭터 시트', '옛이야기 가족 밖 배역', '앱 아이콘'])}
rows = [dict(r, **{'우선순위': pr(r)}) for r in rows]
rows.sort(key=lambda r: (r['우선순위'], order.get(r[K], 99)))
out = io.StringIO(); w = csv.DictWriter(out, fieldnames=['우선순위'] + keys, lineterminator='\n'); w.writeheader(); [w.writerow(r) for r in rows]
open(P, 'w', encoding='utf-8-sig', newline='').write(out.getvalue())
import collections; print(dict(collections.Counter(r['우선순위'] for r in rows)), len(rows))
