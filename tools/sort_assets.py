"""⑧ 정리의 달인 ASSET_LIST 행 추가(멱등): u_* 수납 소품 20 · sort:e:* 이모지 그림 20 · sort:sym:* 이야기 상징 36 · sort:face:* 6 · tube · hero · appicon."""
import csv, io, json, pathlib
R = pathlib.Path(__file__).resolve().parents[1]; P = R / 'assets' / '_generated' / 'ASSET_LIST.csv'
raw = P.read_bytes(); nl = '\r\n' if b'\r\n' in raw else '\n'
have = {r[0] for r in csv.reader(io.StringIO(raw.decode('utf-8-sig')))}
items = json.load(open(R / 'data' / 'room_items.json', encoding='utf-8'))['items']
STYLE = 'flat pastel vector illustration, uniform warm-brown #6b5443 outline, no gradients, no text, no characters, rounded shapes, readable at 44px'
rows = []
for it in items:
    if it['set'] != 'storage': continue
    rows.append((f"item:{it['id']}", '집 아이템', '공유 룸 · storage 세트(⑧ 정리의 달인 보상, 네모네 거실)', '160x160 SVG', 'sort', '이모지(임시) ' + it['emoji'], f"{it['name']}, a household storage item, everyday object, single object centered; {STYLE}"))
EMN = {'shoes': '축구화', 'socks': '양말', 'shirt': '셔츠', 'egg': '계란', 'apple': '사과', 'carrot': '당근', 'onion': '양파', 'lotion': '로션', 'toy': '인형', 'can': '통조림', 'bottle': '병', 'juice': '주스', 'milk': '우유', 'dress': '구두', 'glove': '장갑', 'scarf': '목도리', 'bag': '가방', 'key': '열쇠', 'lemon': '레몬', 'potato': '감자'}
for k, n in EMN.items():
    rows.append((f'sort:e:{k}', '정리 물건 그림', f'⑧ 칸에 담기는 물건 — {n}', '88x88 SVG', 'sort', '이모지(임시)', f'{n}, flat pastel vector icon, uniform warm-brown #6b5443 outline, no text, no characters, simple readable at 44px'))
TALES = ['pigs', 'bremen', 'gyeonwoo', 'bears', 'jack', 'kongjwi', 'heungbu', 'ureng', 'axe', 'ant', 'sun', 'hare']
SYM = ['벽돌', '볏짚', '나무', '북', '나팔', '바이올린', '까치', '칠석', '은하수', '수프', '의자', '침대', '콩', '황금알', '사다리', '꽃신', '두꺼비', '독', '박', '제비', '볏단', '우렁', '밥', '항아리', '금도끼', '은도끼', '쇠도끼', '곡식', '곳간', '노래', '달', '해', '동아줄', '당근', '결승선', '거북이']
for i, n in enumerate(SYM):
    ch, k = divmod(i, 3)
    rows.append((f'sort:sym:{ch}:{k}', '정리 물건 그림(이야기 상징)', f'⑧ 장 {ch + 1} {TALES[ch]}의 상징 물건 — {n}', '88x88 SVG', 'sort', '이모지(임시)', f'{n}, story symbol of {TALES[ch]}, flat pastel vector icon, uniform warm-brown #6b5443 outline, no text, no characters, simple readable at 44px'))
for i, n in enumerate(['네모 아빠', '네모 엄마', '세모 남편', '세모 아내', '동그라미 아빠', '막둥이']):
    rows.append((f'sort:face:{i}', '정리 물건 그림(가족 얼굴)', f'⑧ 세 가족 정리 판의 얼굴 — {n}', '88x88 PNG', 'sort', '캐릭터 PNG 얼굴 크롭', '(캐릭터 시트 얼굴 정사각 크롭)'))
rows.append(('sort:tube', '게임 UI', '⑧ 물건을 담는 투명한 칸(보통·선택·정리 완료·잠김 4상태, 위가 열린 둥근 통)', '64x220 SVG', 'sort', '코드 CSS(임시)', '(아트 패스 때 유리병/서랍 일러스트로 교체)'))
rows.append(('hero:sort', '타이틀 대표 그림', '⑧ 홈 캐릭터 뒤 대표 그림', '720x400 SVG', 'sort', '코드 SVG(임시)', '나란히 선 투명한 칸 네 개와 색색의 공(아트 패스 때 일러스트로 교체)'))
rows.append(('appicon:sort', '앱 아이콘', '스토어 512x512 — ⑧ 정리의 달인', '512x512 SVG', 'sort', '시안(코드)', '세모 아내 얼굴 클로즈업(games/tools/make_icons.py)'))
new = [r for r in rows if r[0] not in have]; buf = io.StringIO(); csv.writer(buf, lineterminator=nl).writerows(new)
txt = raw.decode('utf-8');
if not txt.endswith(nl): txt += nl
P.write_bytes((txt + buf.getvalue()).encode('utf-8')); print('rows added', len(new))
