"""⑪ 막둥이 원정대 데이터 — data/expedition.json (docs/28 · games/25_EXPEDITION_GDD1.md §3). 단일 배역표 tools/tales_cast.py 를 그대로 읽는다. 모든 이름·글은 [제안].
나라 17(= 옛이야기 17편) · 동료(시작 3 + 나라당 2 + 가족 6) · 곤란 8종(힘 3종에 매핑) · 이웃 집 · 큰 곤란 놀이 · 그림 자리 수. 멱등: python tools/expedition_build.py"""
import json, io, sys
sys.path.insert(0, 'tools'); sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from tales_cast import CAST, ACTORS, GENDER_OK
import expedition_sim_params as SP   # 밸런스 값(tools/expedition_sim.js 와 같은 값)

POWERS = {'support': dict(icon='🟦', name='받치기', family='nemo'), 'flash': dict(icon='🔺', name='번쩍', family='semo'), 'care': dict(icon='⚪', name='돌보기', family='dong')}
TROUBLES = {'fix': 'care', 'carry': 'support', 'path': 'flash', 'soothe': 'care', 'stop': 'support', 'fill': 'support', 'reach': 'flash', 'light': 'flash'}   # 곤란 8종 → 잘 맞는 힘(아이콘 1개)
BIG = ['tap', 'order', 'drag', 'hold', 'match', 'beat', 'rub', 'seek']        # 큰 곤란 탭 놀이 8종(①⑩ 놀이 재사용)
START = [('baby', 'support'), ('semo_w', 'flash'), ('dong_dad', 'care')]       # 시작 원정대: 막둥이(네모 칸)·세모 이모·동그라미 아저씨
START_KEYS = {k for k, _ in START}
ORDER = ['pigs', 'bears', 'shoes', 'kongjwi', 'heungbu', 'bremen', 'hok', 'axe', 'sun', 'ant', 'pino', 'jack', 'gyeonwoo', 'ureng', 'hare', 'brothers', 'snowqueen']
FAMILY = [('kid1', 3), ('kid2', 5), ('kid3', 7), ('nemo_gma', 9), ('nemo_mom', 12), ('nemo_dad', 15)]   # 가족 6명이 합류하는 나라
TALE_TITLE = {'pigs': '아기돼지 삼형제', 'bears': '세 마리 곰', 'shoes': '구두장이와 요정', 'kongjwi': '콩쥐팥쥐', 'heungbu': '흥부와 놀부', 'bremen': '브레멘 음악대', 'hok': '혹부리 영감', 'axe': '금도끼 은도끼', 'sun': '해님 달님', 'ant': '개미와 베짱이', 'pino': '피노키오', 'jack': '잭과 콩나무', 'gyeonwoo': '견우와 직녀', 'ureng': '우렁각시', 'hare': '토끼와 거북이', 'brothers': '의좋은 형제', 'snowqueen': '눈의 여왕'}
FAMILY_POWER = {'nemo': 'support', 'semo': 'flash', 'dong': 'care'}


def comp_art(key):
    return key if key.startswith('out:') else ('art:' + key)               # 가족은 기존 캐릭터 PNG(GF.img), 가족 밖은 art 슬롯


def build():
    GENDER_OK(); out = dict(version=1, note='[제안] ⑪ 막둥이 원정대 데이터. tools/expedition_build.py 로 생성. 값은 tools/expedition_sim.js 로 검증.', balance=SP.BAL, powers=POWERS, troubles=TROUBLES, bigGames=BIG, countries=[], companions=[], family=[])
    for k, n in START: out['companions'].append(dict(id='c_start_' + k, actor=k, power=ACTORS[k][2] and FAMILY_POWER[ACTORS[k][2]] if False else dict(START)[k], join='start', tale=None, role=ACTORS[k][1]))
    for f, n in FAMILY: out['family'].append(dict(id='c_fam_' + f, actor=f, power=FAMILY_POWER[ACTORS[f][2]], joinCountry=n, role=ACTORS[f][1]))
    need = []
    for i, tid in enumerate(ORDER, 1):
        rows = [r for r in CAST[tid] if (len(r) <= 3 or r[3] != 'adult')]
        cand = []
        for role, key, kind, *_ in rows:
            if key.startswith('out:'):
                cand.append((role, key, 'flash' if kind == 'villain' else 'care', kind))           # 가족 밖: 악역이었던 이는 장난을 그만두고 친구가 된다(번쩍), 조력은 돌보기
            elif key not in START_KEYS:
                cand.append((role, key, FAMILY_POWER[ACTORS[key][2]], kind))
        order = {'lead': 0, 'helper': 1, 'funny': 2, 'villain': 3}; cand.sort(key=lambda c: order[c[3]])
        picks = []
        for c in cand:
            if len(picks) == 2: break
            if any(p[2] == c[2] for p in picks) and len(cand) > 2 and len(picks) == 1 and any(x[2] != c[2] for x in cand if x not in picks): continue   # 두 명은 힘이 다르게(가능하면)
            picks.append(c)
        while len(picks) < 2: picks.append(('이웃(이야기 속 이웃) — 배역 보충 필요', 'out:이웃 ' + tid, ['support', 'flash', 'care'][len(picks) % 3], 'helper')); need.append(tid)
        comps = []
        for j, (role, key, pw, kind) in enumerate(picks):
            cid = f'c_{tid}_{j + 1}'; comps.append(cid); out['companions'].append(dict(id=cid, actor=key, role=role, power=pw, join=f'country{i}:big', tale=tid, art=comp_art(key), friendFromVillain=(kind == 'villain')))
        skins = {t: f'ex:{tid}:{t}' for t in TROUBLES}                                               # 그 나라 이야기 색으로 칠한 곤란 8종(그림 자리)
        out['countries'].append(dict(no=i, tale=tid, title=TALE_TITLE[tid], chapters=SP.BAL['chapters'], per=SP.BAL['per'], big=BIG[(i - 1) % 8], bigPower=['support', 'flash', 'care'][(i - 1) % 3], companions=comps, house='h_' + tid, props=[f'vp_{tid}_{c}' for c in range(1, SP.BAL['chapters'] + 1)], book=f'bk_{tid}', skins=skins, card=tid))
    n_c = len(out['companions']) + len(out['family'])
    assert len(out['countries']) == 17 and n_c == 3 + 34 + 6, n_c
    for t in out['countries']: assert len(t['companions']) == 2
    out['counts'] = dict(countries=17, companions=n_c, troubles=17 * SP.BAL['chapters'] * SP.BAL['per'], bigs=17, houses=17, villageProps=17 * SP.BAL['chapters'], skins=17 * 8, castFillNeeded=need)
    json.dump(out, open('data/expedition.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('expedition.json', out['counts'])


if __name__ == '__main__': build()
