"""이야기별 배역 — 단일 원천(이야기 id 기준). 같은 옛이야기는 앱이 달라도 같은 배역이다("흥부는 늘 네모 아빠").
tools/tales_build.py 가 이 표를 읽어 data/tales.json 을 만들고, ③④⑦(성인)·①(유아, 호칭만 막둥이 시점)·⑥⑨… 모든 앱의 배역표가 같은 곳에서 나온다.
행 = (원작 역, 배우 키, 종류, 가족[, 옵션]). 종류: lead 주인공 · helper 조력 · funny 웃긴 실패역 · villain 악역(가족 밖만). 배우 키 'out:라벨' = 가족 밖 캐릭터.
단언(tales_build.check): 가족 악역 0 · 세모의 웃긴 실패역/악역은 전체 이야기를 통틀어 3회 이하 · 세모네에는 아이 없음."""
# 배우 키 → (성인 앱 표기, 유아 앱 표기(막둥이 시점), 가족)
ACTORS = {
    'nemo_dad': ('네모 아빠', '아빠', 'nemo'), 'nemo_mom': ('네모 엄마', '엄마', 'nemo'), 'nemo_gma': ('네모 할머니', '할머니', 'nemo'),
    'kid1': ('네모네 {kid1}', '{kid1} {sib_kid1}', 'nemo'), 'kid2': ('네모네 {kid2}', '{kid2} {sib_kid2}', 'nemo'), 'kid3': ('네모네 {kid3}', '{kid3} {sib_kid3}', 'nemo'), 'baby': ('네모 {baby}', '{baby}', 'nemo'),
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
    'sun': [('누나(해님)', 'kid1', 'lead'), ('동생(달님)', 'kid3', 'lead'), ('떡 팔러 간 엄마', 'nemo_mom', 'helper'), ('호랑이 → 바람 호랑이', O('바람 호랑이(가족 밖, 소리·그림자)'), 'villain')],
    'ant': [('개미', 'nemo_mom', 'lead'), ('베짱이', 'semo_h', 'funny'), ('지켜보는 이웃', 'dong_dad', 'helper'), ('열매를 함께 모으는 막내 개미(유아 앱)', 'baby', 'helper', 'kid'), ('여름 내내 노래하던 매미', O('매미(가족 밖, 여름 내내 노래하던 순한 이웃)'), 'helper')],      # B25 포섭 자리(가족 밖)
    'pino': [('제페토(목수)', 'nemo_dad', 'lead'), ('피노키오(나무 인형)', 'baby', 'funny'), ('파란 요정', O('요정(art.fairy)'), 'helper'), ('여우(사기꾼 흉내, 순한 판)', O('여우(가족 밖, 사기꾼 흉내만 내던 순한 판)'), 'villain')],      # B23 포섭 자리(가족 밖 악역, 허브 방침)
    'jack': [('잭', 'kid3', 'lead'), ('잭의 엄마', 'nemo_mom', 'helper'), ('구름 위 거인', O('구름 거인(가족 밖, 쿵쿵 소리·그림자, 순한 판)'), 'villain'), ('잔치 손님', 'semo_h', 'helper')],
    'gyeonwoo': [('견우', 'semo_h', 'lead'), ('직녀', 'semo_w', 'lead'), ('오작교를 놓는 까치와 까마귀', O('까치 떼(가족 밖)'), 'helper'), ('둘을 갈라놓는 하늘 어른', O('하늘 어른(가족 밖, 목소리·순한 판)'), 'villain')],
    'ureng': [('혼자 농사짓는 총각', 'semo_h', 'lead'), ('우렁 각시', 'semo_w', 'helper'), ('각시를 탐내는 원님', O('욕심쟁이 원님(가족 밖, 목소리·순한 판)'), 'villain')],
    'hare': [('거북이', 'nemo_dad', 'lead'), ('토끼', 'dong_dad', 'funny'), ('심판', 'semo_h', 'helper'), ('결승선을 지키는 두루미', O('두루미(가족 밖, 모두의 완주를 바라는 순한 심판)'), 'helper')],      # B25 포섭 자리(가족 밖)
    'brothers': [('형', 'kid3', 'lead'), ('아우', 'baby', 'lead')],
    'snowqueen': [('카이', 'baby', 'lead'), ('게르다', 'kid1', 'lead'), ('눈의 여왕(순한 판)', 'dong_mom', 'helper'), ('눈 나라 길을 아는 까마귀', O('눈 까마귀(가족 밖, 길 잃은 친구를 지켜보던 순한 안내자)'), 'helper')],      # B25 포섭 자리(가족 밖)
    'fairywood': [('나무꾼', 'semo_h', 'lead'), ('선녀', 'semo_w', 'lead'), ('도와주는 사슴', O('사슴(가족 밖)'), 'helper'), ('선녀의 아기 사슴들', O('아기 사슴들(가족 밖)'), 'helper')],      # D1 새 이야기(허브 2026-10-14)
    'rabbitliver': [('토끼', 'kid1', 'lead'), ('거북(심부름꾼)', 'nemo_dad', 'helper'), ('아픈 용왕님(순한 판)', 'dong_dad', 'helper'), ('용궁 문지기', O('용궁 문지기(가족 밖, 목소리만·순한 판)'), 'villain')],      # 가족 밖 악역 자리(B20, 허브 방침: 악역은 가족 밖)
    'magpie': [('선비', 'nemo_dad', 'lead'), ('은혜 갚는 까치', O('까치(art.magpie)'), 'helper'), ('구렁이(순한 판)', O('구렁이(가족 밖, 소리·그림자·순한 판)'), 'villain')],
    'tigerpersimmon': [('엄마', 'nemo_mom', 'lead'), ('우는 아기', 'baby', 'lead'), ('곶감 아저씨', 'dong_dad', 'helper'), ('호랑이(순한 판)', O('호랑이(가족 밖, 소리·그림자·순한 판)'), 'villain')],
    'redhood': [('빨간 모자', 'kid1', 'lead'), ('할머니', 'nemo_gma', 'helper'), ('엄마', 'nemo_mom', 'helper'), ('늑대(순한 판)', O('늑대(가족 밖, 소리·그림자·순한 판)'), 'villain')],
    'hansel': [('헨젤', 'kid3', 'lead'), ('그레텔', 'kid1', 'lead'), ('길을 걱정하는 아버지', 'nemo_dad', 'helper'), ('과자집 할머니', O('과자집 할머니(가족 밖, 사탕을 너무 좋아함·순한 판)'), 'villain')],      # D1·B13 새 이야기(허브 2026-10-14)
    'puss': [('장화 신은 고양이', 'semo_w', 'lead'), ('막내 아들(주인)', 'kid3', 'lead'), ('나라의 임금님', 'dong_dad', 'helper'), ('변신 마법사', O('변신 마법사(가족 밖, 뭐든 변신하다 생쥐가 됨·순한 판)'), 'villain')],      # D1·B13 새 이야기(허브 2026-10-14)
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

# 성별 일치(허브 2026-10-12): kid1·kid2(하나·두리, 딸)는 형/오빠/아우/남동생/아들 역 금지, kid3·baby(세찌·막둥이, 아들)는 누나/언니/누이/여동생/딸 역 금지
FEMALE_KIDS, MALE_KIDS = ('kid1', 'kid2'), ('kid3', 'baby')
MALE_WORDS, FEMALE_WORDS = ('형', '오빠', '아우', '남동생', '아들'), ('누나', '언니', '누이', '여동생', '딸')
MALE_NAMES, FEMALE_NAMES = ('잭', '카이', '피노키오', '흥부', '놀부', '왕자', '도령', '헨젤'), ('게르다', '콩쥐', '팥쥐', '공주', '신데렐라', '누이', '그레텔')   # 원작 이름 역의 성별(2026-10-12)
def GENDER_OK():
    bad = []
    for tale, rows in CAST.items():
        for row in rows:
            role, key = row[0], row[1]
            if key in FEMALE_KIDS and any(w in role for w in MALE_WORDS + MALE_NAMES): bad.append('%s: %s 역을 %s(딸)이 맡음' % (tale, role, key))
            if key in MALE_KIDS and any(w in role for w in FEMALE_WORDS + FEMALE_NAMES): bad.append('%s: %s 역을 %s(아들)이 맡음' % (tale, role, key))
    assert not bad, '배역 성별 불일치: ' + ' / '.join(bad)
    return True


# 부부·연인 역 쌍(허브 2026-10-14): 같은 이야기에서 짝을 이루는 두 역은 실제 부부여야 한다(네모 아빠+엄마 · 세모 남편+아내 · 동그라미 아빠+엄마)
COUPLES = {'heungbu': ('흥부', '흥부 아내'), 'gyeonwoo': ('견우', '직녀'), 'ureng': ('혼자 농사짓는 총각', '우렁 각시'), 'fairywood': ('나무꾼', '선녀'), 'bears': ('큰 곰', '중간 곰')}
REAL_COUPLES = [{'nemo_dad', 'nemo_mom'}, {'semo_h', 'semo_w'}, {'dong_dad', 'dong_mom'}]
def COUPLE_OK():
    bad = []
    for tale, (a, b) in COUPLES.items():
        rows = {r[0]: r[1] for r in CAST[tale]}
        pair = {rows.get(a), rows.get(b)}
        if pair not in REAL_COUPLES: bad.append('%s: %s=%s · %s=%s' % (tale, a, rows.get(a), b, rows.get(b)))
    assert not bad, '부부·연인 역이 실제 부부가 아님: ' + ' / '.join(bad)
    return True


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
    GENDER_OK(); COUPLE_OK()
    return semo
