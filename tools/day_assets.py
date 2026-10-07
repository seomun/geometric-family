"""⑩ 막둥이의 하루 ASSET_LIST 행 추가(멱등): y_* 욕실·침실 소품 20 · day:* 놀이 그림 · hero · appicon."""
import csv, io, json, pathlib
R = pathlib.Path(__file__).resolve().parents[1]; P = R / 'assets' / '_generated' / 'ASSET_LIST.csv'
raw = P.read_bytes(); nl = '\r\n' if b'\r\n' in raw else '\n'
have = {r[0] for r in csv.reader(io.StringIO(raw.decode('utf-8-sig')))}
items = json.load(open(R / 'data' / 'room_items.json', encoding='utf-8'))['items']
STYLE = 'flat pastel vector illustration, uniform warm-brown #6b5443 outline, no gradients, no text, no characters, rounded shapes, readable at 56px'
rows = []
for it in items:
    if it['set'] != 'daybath': continue
    rows.append((f"item:{it['id']}", '집 아이템', '공유 룸 · daybath 세트(⑩ 막둥이의 하루 보상, 아이 방)', '160x160 SVG', 'day', '이모지(임시) ' + it['emoji'], f"{it['name']}, a child's bathroom or bedroom item, everyday object, single object centered; {STYLE}"))
DAYART = [('scene:brush', '장면 아이콘(하루 길)', '⑩ 1장 아침 양치 — 칫솔', '🪥'), ('scene:dress', '장면 아이콘(하루 길)', '⑩ 2장 옷 입기 — 티셔츠', '👕'), ('scene:chew', '장면 아이콘(하루 길)', '⑩ 3장 아침밥 — 밥그릇', '🍚'),
          ('scene:tidy', '장면 아이콘(하루 길)', '⑩ 4장 장난감 정리 — 곰 인형', '🧸'), ('scene:sleep', '장면 아이콘(하루 길)', '⑩ 5장 잠자리 — 달', '🌙'),
          ('brush', '놀이 그림', '⑩ 양치: 칫솔(핑크, 손잡이 굵게)', '🪥'), ('spot', '놀이 그림', '⑩ 양치: 이 얼룩(갈색 둥근 얼룩, 지우면 반짝 효과 별도)', '코드 CSS'), ('mouth', '놀이 그림', '⑩ 양치: 크게 벌린 입(흰 이 + 분홍 잇몸)', '코드 CSS'),
          ('cloth:cap', '놀이 그림', '⑩ 옷 입기: 모자(맑음)', '🧢'), ('cloth:tee', '놀이 그림', '⑩ 옷 입기: 반팔(맑음)', '👕'), ('cloth:sandal', '놀이 그림', '⑩ 옷 입기: 샌들(맑음)', '🩴'),
          ('cloth:scarf', '놀이 그림', '⑩ 옷 입기: 목도리(추움)', '🧣'), ('cloth:coat', '놀이 그림', '⑩ 옷 입기: 외투(추움·비)', '🧥'), ('cloth:socks', '놀이 그림', '⑩ 옷 입기: 양말(추움)', '🧦'),
          ('cloth:umbrella', '놀이 그림', '⑩ 옷 입기: 우산(비)', '☂️'), ('cloth:boots', '놀이 그림', '⑩ 옷 입기: 장화(비)', '🥾'),
          ('weather:sun', '놀이 그림', '⑩ 옷 입기: 맑음 표시', '☀️'), ('weather:cold', '놀이 그림', '⑩ 옷 입기: 추움 표시', '❄️'), ('weather:rain', '놀이 그림', '⑩ 옷 입기: 비 표시', '🌧️'),
          ('food:rice', '놀이 그림', '⑩ 아침밥: 밥', '🍚'), ('food:carrot', '놀이 그림', '⑩ 아침밥: 당근', '🥕'), ('food:apple', '놀이 그림', '⑩ 아침밥: 사과', '🍎'), ('food:broccoli', '놀이 그림', '⑩ 아침밥: 브로콜리', '🥦'), ('food:banana', '놀이 그림', '⑩ 아침밥: 바나나', '🍌'),
          ('spoon', '놀이 그림', '⑩ 아침밥: 숟가락 버튼', '🥄'), ('turtle', '놀이 그림', '⑩ 아침밥: 기다려 주는 거북이', '🐢'),
          ('toy:ball', '놀이 그림', '⑩ 장난감 정리: 공', '⚽'), ('toy:car', '놀이 그림', '⑩ 장난감 정리: 자동차', '🚗'), ('toy:block', '놀이 그림', '⑩ 장난감 정리: 블록', '🧱'), ('toy:bear', '놀이 그림', '⑩ 장난감 정리: 곰 인형', '🧸'), ('box', '놀이 그림', '⑩ 장난감 정리: 상자(종류 그림이 앞에)', '코드 CSS'),
          ('light', '놀이 그림', '⑩ 잠자리: 불(켜짐/꺼짐 2상태)', '💡'), ('moon', '놀이 그림', '⑩ 잠자리: 달', '🌙'), ('blanket', '놀이 그림', '⑩ 잠자리: 줄무늬 이불', '코드 CSS')]
for k, kind, use, cur in DAYART:
    rows.append((f'day:{k}', kind, use, '96x96 SVG', 'day', ('이모지(임시) ' + cur) if len(cur) <= 3 else cur, f"{use.split('— ')[-1].split(': ')[-1]}, flat pastel vector icon, uniform warm-brown #6b5443 outline, no text, no characters, simple readable at 56px"))
rows.append(('hero:day', '타이틀 대표 그림', '⑩ 홈 캐릭터 뒤 대표 그림', '720x400 SVG', 'day', '코드 SVG(임시)', '해와 달, 두 개의 창문과 침대가 이어진 하루(아트 패스 때 일러스트로 교체)'))
rows.append(('appicon:day', '앱 아이콘', '스토어 512x512 — ⑩ 막둥이의 하루', '512x512 SVG', 'day', '시안(코드)', '막둥이 얼굴 클로즈업(games/tools/make_icons.py)'))
new = [r for r in rows if r[0] not in have]; buf = io.StringIO(); csv.writer(buf, lineterminator=nl).writerows(new)
txt = raw.decode('utf-8')
if not txt.endswith(nl): txt += nl
P.write_bytes((txt + buf.getvalue()).encode('utf-8')); print('rows added', len(new))
