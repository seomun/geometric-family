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
def build(app, kid):
    st = R(f'data/story_{app}.json'); L = R(f'data/{app}_levels.json'); per = st['per'] or 10
    step = 100 if kid else 72; H = per * step + 190; zones = []
    for zi, (ch, c) in enumerate(sorted(st['chapters'].items(), key=lambda kv: int(kv[0]))):
        f = PRE[zi % 4]; nodes = []
        for i in range(per):
            x = max(16, min(84, f(i, per))); y = H - 70 - i * step - (0 if i else 0); nodes.append([round(x, 1), y])
        t = c['tale']; a, b = PAL.get(t, ('#FFE9B8', '#C7E6A0')); m = MARKS.get(t, ('🌟', '🌿'))
        n0, n1 = nodes[0], nodes[-1]
        zones.append(dict(ch=int(ch), title=c['title'], tale=t, pal=[a, b], faces=c['faces'], nodes=nodes,
            gate=[round(100 - n0[0] if abs(n0[0] - 50) < 20 else (12 if n0[0] > 50 else 88), 1), H - 40], chest=[round(max(14, min(86, 100 - n1[0])), 1), 112],
            marks=[dict(e=m[0], x=round(8 if n1[0] > 50 else 90, 1), y=int(H * 0.45)), dict(e=m[1], x=round(90 if n1[0] > 50 else 8, 1), y=int(H * 0.72))]))
    D = dict(app=app, version=1, kid=kid, per=per, zoneH=H, nodeSize=(84 if kid else 58), base=None, special=[], zones=zones,
             note='[제안] 이야기 지도 데이터. tools/map_build.py 로 생성. 그림 슬롯은 art_slots.map (games/19_SAGA_MAP.md §4).')
    json.dump(D, open(f'data/maps/{app}.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print(app, len(zones), 'zones, H', H)
if __name__ == '__main__':
    for app, kid in [('merge', 0), ('spot', 0), ('block', 0), ('sort', 0), ('tile', 0), ('day', 1)]:
        build(app, bool(kid))
