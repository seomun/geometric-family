"""data/maps/<앱>.json — 이야기 지도(GF.saga) 구역·길·노드 좌표. 장 = 구역, 구역 모양 = 길 프리셋 4종을 돌려 쓴다. 그림은 슬롯 id 로만(games/19_SAGA_MAP.md §4).
좌표: x 는 지도 폭 %, y 는 구역 위에서부터 px. 노드는 아래→위로 올라가며(첫 판이 구역 아래), 머리글은 위 90px, 상자는 길 끝, 관문(이야기 책)은 길 시작."""
import json, math, sys, io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
R = lambda p: json.load(open(p, encoding='utf-8'))
PAL = {'pigs': ('#FFE9B8', '#C7E6A0'), 'bears': ('#FFE0C2', '#B8DDB0'), 'shoes': ('#E5DBF7', '#F6D8E6'), 'kongjwi': ('#FFE0D6', '#CFE8B8'), 'heungbu': ('#FFF0B8', '#BFE4A8'), 'bremen': ('#D9E8F7', '#BFE0B2'),
       'hok': ('#E8E2F5', '#CFE5C2'), 'axe': ('#CFE8F2', '#B5DDB8'), 'sun': ('#C9D2F2', '#E2D8F5'), 'ant': ('#FFF3B8', '#B9E3A0'), 'pino': ('#FFE3C4', '#F5D2B0'), 'jack': ('#D4ECFA', '#C5E8B0'),
       'gyeonwoo': ('#C3CCF0', '#DCCFF3'), 'ureng': ('#FFEBC2', '#BFE3AE'), 'hare': ('#D9F0FA', '#C6E7A8'), 'brothers': ('#FFE9BE', '#C8E4A6'), 'snowqueen': ('#DCEBFA', '#EAF2FA'), 'axe2': ('#CFE8F2', '#B5DDB8')}
MARKS = {'pigs': ('🧱', '🌾'), 'bears': ('🍲', '🛏️'), 'shoes': ('👞', '🌙'), 'kongjwi': ('🏺', '👡'), 'heungbu': ('🏠', '🎃'), 'bremen': ('🎺', '🌲'), 'hok': ('🍄', '🔦'), 'axe': ('🪓', '🌊'), 'sun': ('🌙', '☀️'), 'ant': ('🐜', '🎻'),
         'pino': ('🪵', '🧸'), 'jack': ('🌱', '☁️'), 'gyeonwoo': ('⭐', '🐮'), 'ureng': ('🐚', '🌾'), 'hare': ('🐇', '🐢'), 'brothers': ('🌾', '🌕'), 'snowqueen': ('❄️', '🪞')}
PRE = [lambda i, n: 50 + 26 * math.sin(i * 0.95), lambda i, n: 50 + 28 * math.sin(i * 0.8 + 2.4), lambda i, n: 24 + 52 * (i % 2) + (6 if i % 4 > 1 else -6) * 0.5, lambda i, n: 50 + 30 * math.cos(i * 0.7)]
# 길 모양 8종 — 앱마다 시작과 걸음이 달라 같은 장 순서여도 지도가 다르게 보인다
PRE += [lambda i, n: 50 + 30 * math.sin(i * 0.6 + 1.0), lambda i, n: 20 + 60 * abs(((i / max(1, n - 1)) * 2) % 2 - 1), lambda i, n: 50 + 28 * math.sin(i * 1.3) * (1 - 0.3 * i / n), lambda i, n: 30 + 40 * ((i // 2) % 2) + (4 if i % 2 else -4)]
APP_PATH = {'merge': (0, 1), 'spot': (3, 3), 'block': (2, 5), 'sort': (5, 7), 'tile': (7, 3), 'idle': (1, 1), 'quiz': (4, 3), 'color': (6, 5), 'day': (0, 3)}
# 앱 주제 소품(이모지 임시, 슬롯 map.<앱>:prop1|prop2): ③ 이삿짐 ⑥ 액자 ⑦ 블록 더미 ⑧ 선반 ⑨ 타일 바구니
PROPS = {'merge': ('🧳', '🪑'), 'spot': ('🖼️', '🪞'), 'block': ('🧱', '🏗️'), 'sort': ('🗄️', '🧺'), 'tile': ('🧺', '🀄')}
TINT = {'merge': '#FFC9A3', 'spot': '#A9D8F5', 'block': '#C2EBA0', 'sort': '#D3C4F2', 'tile': '#A8E6D2', 'idle': '#FFE19A', 'quiz': '#FFC4D8', 'color': '#FFF09A', 'day': '#BFE0FF'}   # 앱 색조: ③ 살구 ⑥ 하늘 ⑦ 연두 ⑧ 라벤더 ⑨ 민트
W = 296   # 지도 폭 가정(px): 레일 62 를 뺀 390 화면 안쪽 — 겹침 검사용
def spots(nodes, H, fixed, thr=84):
    """랜드마크 2개 자리: 노드·상자·관문·띠에서 80px 이상 떨어진 곳, 서로 150px 이상 떨어진 높이"""
    out = []
    for yy in range(230, H - 230, 30):
        best = None
        for x in (14, 20, 80, 86, 50):
            d = min(max(abs((x - q[0]) / 100 * W), abs(yy - q[1])) for q in nodes + fixed)   # 정사각 상자끼리 겹침 검사(체비쇼프)
            if best is None or d > best[0]: best = (d, x)
        if best[0] >= thr and all(abs(yy - o[1]) >= 150 for o in out): out.append((best[1], yy))
    return out[:2]
def emit(app, kid, per, specs, base, special, step=None):
    step = step or (100 if kid else 72); H = per * step + (300 if kid else 250); base0 = 155 if kid else 115; zones = []
    for zi, (ch, title, t, faces) in enumerate(specs):
        off, stp = APP_PATH.get(app, (0, 1)); f = PRE[(off + zi * stp) % 8]; nodes = []
        for i in range(per):
            x = max(18, min(82, f(i, per))); nodes.append([round(x, 1), H - base0 - i * step])
        a, b = PAL.get(t, ('#FFE9B8', '#C7E6A0')); m = MARKS.get(t, ('🌟', '🌿'))
        n1 = nodes[-1]; gate = [16 if kid else 14, H - 44]; chest = [round(max(22, min(78, n1[0] + (-32 if n1[0] > 50 else 32))), 1), 120]
        sp = spots(nodes, H, [gate, chest, [60, H - 40]], 100 if kid else 84)
        marks = [dict(e=m[k], x=sp[k][0], y=sp[k][1]) for k in range(len(sp))]
        props = []
        if app in PROPS and not kid:
            fixed = nodes + [gate, chest, [60, H - 40]]
            for yy in range(220, H - 200, 30):
                for x in (14, 20, 32, 68, 80, 86):
                    dn = min(max(abs((x - q[0]) / 100 * W), abs(yy - q[1])) for q in fixed)
                    dm = min([max(abs((x - mk['x']) / 100 * W), abs(yy - mk['y'])) for mk in marks] + [999])
                    dp = min([max(abs((x - pr['x']) / 100 * W), abs(yy - pr['y'])) for pr in props] + [999])
                    if dn >= 68 and dm >= 86 and dp >= 140 and len(props) < 2: props.append(dict(e=PROPS[app][len(props)], x=x, y=yy)); break
        zones.append(dict(ch=int(ch), title=title, tale=t, pal=[a, b], faces=faces, nodes=nodes, gate=gate, chest=chest, marks=marks, props=props))
    D = dict(app=app, version=1, kid=kid, per=per, zoneH=H, nodeSize=(84 if kid else 58), base=base, special=special, tint=TINT.get(app), zones=zones,
             note='[제안] 이야기 지도 데이터. tools/map_build.py 로 생성. 그림 슬롯은 art_slots.map (games/19_SAGA_MAP.md §4).')
    json.dump(D, open(f'data/maps/{app}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print(app, len(zones), 'zones, H', H, 'marks', [len(z['marks']) for z in zones])
def build(app, kid):
    st = R(f'data/story_{app}.json'); L = R(f'data/{app}_levels.json'); per = st['per'] or 10
    from collections import Counter
    cnt = Counter(l['type'] for l in L['levels']); base = cnt.most_common(1)[0][0] if app != 'day' else None
    specs = [(int(ch), c['title'], c['tale'], c['faces']) for ch, c in sorted(st['chapters'].items(), key=lambda kv: int(kv[0]))]
    emit(app, kid, per, specs, base, [k for k in cnt if k != base])
def light():
    emit('idle', False, 10, [(1, '식탁 길 · 첫 사연들', 'bears', ['nemo_dad.joy', 'wife.joy', 'dong_dad.joy']), (2, '식탁 길 · 이웃 사연', 'heungbu', ['nemo_mom.joy', 'husband.joy', 'dong_dad.joy']), (3, '식탁 길 · 큰 한 상', 'brothers', ['nemo_dad.joy', 'wife.joy', 'dong_dad.joy'])], None, [], 96)
    emit('quiz', False, 10, [(1, '도형 테스트 1', 'bremen', ['nemo_dad.joy', 'wife.joy', 'dong_dad.joy']), (2, '도형 테스트 2 · 동화', 'jack', ['nemo_mom.joy', 'baby.joy', 'wife.joy'])], None, [], 96)
def light2():
    pal = ['pigs', 'bears', 'shoes', 'kongjwi', 'heungbu', 'bremen', 'hok', 'axe', 'sun', 'ant']
    emit('color', True, 10, [(i + 1, '색칠 길 ' + str(i + 1), pal[i], ['baby.joy', 'wife.joy', 'nemo_kids.kid1']) for i in range(10)], None, [], 120)
if __name__ == '__main__':
    for app, kid in [('merge', 0), ('spot', 0), ('block', 0), ('sort', 0), ('tile', 0), ('day', 1)]:
        build(app, bool(kid))
    light(); light2()
