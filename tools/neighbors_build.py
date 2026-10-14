"""A27 손님 도감 2탄 — ⑪ 포섭 이웃 21명이 성인 집에 손님으로 놀러 온다. data/housing.json 의 'neighbors' 를 채운다(housing_build.py 가 끝에서 불러 쓴다, 멱등).
만나는 법: 그 이웃을 포섭하는 나라의 마지막 단계 전리품 코드를 우리 집에서 입력하면(앱 사이 연결은 코드로만, D12) 이웃이 「만난 손님」이 되고, 그 전리품 가구를 방에 놓으면 놀러 와 한마디 한다(선물 없음, 3번까지).
이름·이모지·단계는 data/expedition_slice.json(포섭 동료)에서 읽는다 — 이름은 D13 배역표(tales_cast)가 원천이라 여기서 새로 짓지 않는다. 대사는 동료 로비 대사(tools/expedition_lines.py)의 두 줄 + 집 한 줄 [제안].
성인 집 전용(유아 집엔 없음, D12). 가족 밖 이웃만(가족 기본형 없음)."""
import ast, json, pathlib
R = pathlib.Path(__file__).resolve().parents[1]


def lobby_lines():
    t = ast.parse((R / 'tools' / 'expedition_lines.py').read_text(encoding='utf-8'))
    for n in t.body:
        if isinstance(n, ast.Assign) and any(getattr(x, 'id', '') == 'LINES' for x in n.targets): return ast.literal_eval(n.value)
    raise AssertionError('LINES 없음')


def build():
    S = json.load(open(R / 'data' / 'expedition_slice.json', encoding='utf-8')); RI = json.load(open(R / 'data' / 'room_items.json', encoding='utf-8'))['items']
    LL = lobby_lines(); boss = {st['recruit']: st['id'] for st in S['stages'] if st.get('recruit')}
    loot = {i['src']['n']: i['id'] for i in RI if i.get('set') == 'exp'}; out = []
    fam = {'네모 아빠', '네모 엄마', '세모 남편', '세모 아내', '동그라미 아빠', '동그라미 엄마', '동그라미 아들'}
    for u in S['units']:
        if u['route'] != 'recruit': continue
        st = boss[u['id']]; assert st in loot, ('마지막 단계 전리품 없음', u['id'], st); assert u['name'] not in fam, u['name']
        l = LL[u['id']]; assert len(l) == 2
        out.append(dict(id='nb:' + u['id'], unit=u['id'], name=u['name'], emoji=u.get('emoji') or '🐾', nation=(st - 1) // 12 + 1, stage=st, loot=loot[st], lines=[l[0], l[1], '집이 점점 아늑해져서 자꾸 오고 싶어요.']))
    assert len(out) == 21 and len({o['loot'] for o in out}) == 21, len(out)
    p = R / 'data' / 'housing.json'; H = json.load(open(p, encoding='utf-8')); H['neighbors'] = out
    json.dump(H, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1); print('이웃 손님', len(out), '명 · 나라', out[0]['nation'], '~', out[-1]['nation'])


build()
