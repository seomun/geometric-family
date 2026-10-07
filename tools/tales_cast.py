"""이야기별 배역 — 단일 원천(이야기 id 기준). 같은 옛이야기는 앱이 달라도 같은 배역이다("흥부는 늘 네모 아빠").
tools/tales_build.py 가 이 표를 읽어 data/tales.json 을 만들고, ③④⑦(성인)·①(유아, 호칭만 막둥이 시점)·⑥⑨… 모든 앱의 배역표가 같은 곳에서 나온다.
행 = (원작 역, 배우 키, 종류, 가족[, 옵션]). 종류: lead 주인공 · helper 조력 · funny 웃긴 실패역 · villain 악역(가족 밖만). 배우 키 'out:라벨' = 가족 밖 캐릭터.
단언(tales_build.check): 가족 악역 0 · 세모의 웃긴 실패역/악역은 전체 이야기를 통틀어 3회 이하 · 세모네에는 아이 없음."""
# 배우 키 → (성인 앱 표기, 유아 앱 표기(막둥이 시점), 가족)
ACTORS = {
    'nemo_dad': ('네모 아빠', '아빠', 'nemo'), 'nemo_mom': ('네모 엄마', '엄마', 'nemo'), 'nemo_gma': ('네모 할머니', '할머니', 'nemo'),
    'kid1': ('네모네 {kid1}', '{sib1}', 'nemo'), 'kid2': ('네모네 {kid2}', '{kid2}', 'nemo'), 'kid3': ('네모네 {kid3}', '{kid3}', 'nemo'), 'baby': ('네모 {baby}', '{baby}', 'nemo'),
    'semo_h': ('세모 남편', '세모 삼촌', 'semo'), 'semo_w': ('세모 아내', '세모 이모', 'semo'),
    'dong_dad': ('동그라미 아빠', '동그라미 아저씨', 'dong'), 'dong_mom': ('동그라미 엄마', '동그라미 아주머니', 'dong'), 'dong_son': ('동그라미 아들', '동그라미 아들', 'dong'),
}
O = lambda label: 'out:' + label
CAST = {
    'pigs': [('첫째 돼지(볏짚집)', 'kid1', 'lead'), ('둘째 돼지(나무집)', 'kid2', 'lead'), ('셋째 돼지(벽돌집)', 'kid3', 'lead'), ('엄마 돼지', 'nemo_mom', 'helper'), ('늑대 → 바람 친구', O('바람 친구(가족 밖, 소리·바람)'), 'villain')],
    'bears': [('큰 곰', 'dong_dad', 'lead'), ('중간 곰', 'dong_mom', 'lead'), ('아기 곰', 'dong_son', 'lead'), ('길 잃은 손님(소녀)', 'semo_w', 'funny')],
    'shoes': [('가난한 구두장이', 'nemo_dad', 'lead'), ('구두장이 아내', 'nemo_mom', 'helper'), ('밤의 작은 요정들', O('요정(art.fairy)'), 'helper')],
    'kongjwi': [('콩쥐', 'kid1', 'lead'), ('팥쥐', 'kid2', 'funny'), ('도와주는 두꺼비', 'dong_dad', 'helper'), ('꽃신 주인을 찾는 원님', 'semo_h', 'helper'), ('일을 시키는 새엄마', O('깐깐한 아주머니(가족 밖, 목소리만)'), 'villain'), ('벼를 까 주는 새(유아 앱)', 'baby', 'helper', 'kid')],
    'heungbu': [('흥부', 'nemo_dad', 'lead'), ('흥부 아내', 'nemo_mom', 'helper'), ('놀부', 'semo_h', 'funny'), ('제비', O('제비(art.swallow)'), 'helper')],
    'bremen': [('당나귀', 'nemo_dad', 'lead'), ('개', 'semo_h', 'lead'), ('고양이', 'semo_w', 'lead'), ('수탉', 'dong_dad', 'lead'), ('도둑들', O('허깨비 도둑(가족 밖, 소리·그림자)'), 'villain')],
    'hok': [('혹부리 영감', 'nemo_dad', 'lead'), ('도깨비', O('도깨비(art.dokkaebi, 순한 판)'), 'villain'), ('따라 하는 욕심쟁이 영감', 'dong_dad', 'funny')],
    'axe': [('나무꾼', 'nemo_dad', 'lead'), ('산신령', 'dong_dad', 'helper'), ('욕심쟁이 이웃', 'nemo_mom', 'funny')],
    'sun': [('오빠(달님)', 'kid1', 'lead'), ('동생(해님)', 'kid2', 'lead'), ('떡 팔러 간 엄마', 'nemo_mom', 'helper'), ('호랑이 → 바람 호랑이', O('바람 호랑이(가족 밖, 소리·그림자)'), 'villain')],
    'ant': [('개미', 'nemo_mom', 'lead'), ('베짱이', 'semo_h', 'funny'), ('지켜보는 이웃', 'dong_dad', 'helper'), ('열매를 함께 모으는 막내 개미(유아 앱)', 'baby', 'helper', 'kid')],
    'pino': [('제페토(목수)', 'nemo_dad', 'lead'), ('피노키오(나무 인형)', 'baby', 'funny'), ('파란 요정', O('요정(art.fairy)'), 'helper')],
    'jack': [('잭', 'kid2', 'lead'), ('잭의 엄마', 'nemo_mom', 'helper'), ('구름 위 거인', O('구름 거인(가족 밖, 쿵쿵 소리·그림자, 순한 판)'), 'villain'), ('잔치 손님', 'semo_h', 'helper')],
    'gyeonwoo': [('견우', 'semo_h', 'lead'), ('직녀', 'semo_w', 'lead'), ('오작교를 놓는 까치와 까마귀', O('까치 떼(가족 밖)'), 'helper'), ('둘을 갈라놓는 하늘 어른', O('하늘 어른(가족 밖, 목소리·순한 판)'), 'villain')],
    'ureng': [('혼자 농사짓는 총각', 'nemo_dad', 'lead'), ('우렁 각시', 'semo_w', 'helper'), ('각시를 탐내는 원님', O('욕심쟁이 원님(가족 밖, 목소리·순한 판)'), 'villain')],
    'hare': [('거북이', 'nemo_dad', 'lead'), ('토끼', 'dong_dad', 'funny'), ('심판', 'semo_h', 'helper')],
    'brothers': [('형', 'kid1', 'lead'), ('아우', 'baby', 'lead')],
    'snowqueen': [('카이', 'kid1', 'lead'), ('게르다', 'baby', 'lead'), ('눈의 여왕(순한 판)', 'dong_mom', 'helper')],
}


def cast_for(tale, aud):
    """aud='adult'|'kid' → [(원작 역, 우리 배역 표기, 종류, 가족)]. 'kid' 전용 행은 유아 앱에서만, 옵션 없는 행은 모두."""
    out = []
    for row in CAST[tale]:
        role, key, kind = row[0], row[1], row[2]; only = row[3] if len(row) > 3 else None
        if only and only != aud: continue
        if key.startswith('out:'): out.append((role, key[4:], kind, 'outside'))
        else:
            a, k, fam = ACTORS[key]; out.append((role, a if aud == 'adult' else k, kind, fam))
    return out


def audit():
    """전체 이야기 기준 단언: 가족 악역 0 · 세모의 웃긴 실패역/악역 ≤3 · 세모네 아이 없음"""
    semo = 0
    for tale, rows in CAST.items():
        for row in rows:
            role, key, kind = row[0], row[1], row[2]
            fam = 'outside' if key.startswith('out:') else ACTORS[key][2]
            assert not (kind == 'villain' and fam != 'outside'), '가족이 악역: %s / %s' % (tale, role)
            if fam == 'semo' and kind in ('funny', 'villain'): semo += 1
            assert not (fam == 'semo' and key in ('kid1', 'kid2', 'kid3', 'baby')), '세모네에는 아이가 없다'
    assert semo <= 3, '세모의 웃긴 실패역/악역 전체 %d회(>3)' % semo
    return semo
