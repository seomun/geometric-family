"""D13 옛이야기 데이터 생성: python tools/tales_build.py
단일 원천(이 파일) → data/tales.json(배역표) · merge_extra.json stories(③·④ 12장, 장당 4컷 기승전결) · merge_levels.json chapters · merge-gen.js CHAPTERS
· story.json ch11~15(① 3권) · games/10_TALES_CAST.md(배역표 + 가족별 역할 집계).  모두 [제안] — 허브 QA 대기.
원칙(docs/20): 구조·모티브·상징물은 원작 그대로, 바꾸는 건 배역과 무서운 수위. 공유 저작물 원전만. 세모네는 아이 없음. 호칭: 유아=막둥이 시점 / 성인=웹툰.
배역 규칙(허브 QA): 진짜 악역은 가족 밖 캐릭터(바람 친구·바람 호랑이·허깨비 도둑…)만, 가족은 주인공·조력·「따라 하다 실패하는 웃긴 역」까지. 세모의 웃긴 실패역은 최대 3번.
cast 항목 = (원작 역, 우리 배역, 종류, 가족) / 종류: lead 주인공·helper 조력·funny 웃긴 실패역·villain 악역 / 가족: nemo·semo·dong·outside(가족 밖)"""
import json, re, pathlib
R = pathlib.Path(__file__).resolve().parents[1]
NAMES = json.load(open(R / 'data/names.json', encoding='utf-8'))
PAIR = {'은': '은는', '는': '은는', '이': '이가', '가': '이가', '을': '을를', '를': '을를', '과': '과와', '와': '과와'}


def nm(t):
    """{sib1} 같은 호칭 변수를 data/names.json 값으로(뒤 조사는 받침에 맞게). 화면(JS GF.name)과 같은 규칙. story.json·merge_extra.json 은 변수 그대로 두고 문서·tales.json 만 풀어 쓴다"""
    def f(m):
        v = NAMES.get(m.group(1)); p = m.group(2)
        if v is None: return m.group(0)
        if not p: return v
        c = ord(v[-1]); has = 0xAC00 <= c <= 0xD7A3 and (c - 0xAC00) % 28 != 0
        return v + PAIR[p][0 if has else 1]
    return re.sub(r"\{(\w+)\}(은|는|이|가|을|를|과|와)?", f, t)


KIND = {'lead': '주인공', 'helper': '조력', 'funny': '웃긴 실패역', 'villain': '악역'}
FAM = {'nemo': '네모네', 'semo': '세모네', 'dong': '동그라미네', 'outside': '가족 밖'}

# ---------------- ③·④ 성인 12장: "만들고 짓는" 옛이야기 (장당 4컷: 기·승·전·결) ----------------
T12 = [
 dict(id='pigs', title='아기돼지 삼형제', origin='영국 민담(공유 저작물)',
  cast=[('첫째 돼지(볏짚집)', '네모네 {kid1}', 'lead', 'nemo'), ('둘째 돼지(나무집)', '네모네 {kid2}', 'lead', 'nemo'), ('셋째 돼지(벽돌집)', '네모네 {kid3}', 'lead', 'nemo'), ('엄마 돼지', '네모 엄마', 'helper', 'nemo'), ('늑대 → 바람 친구', '바람 친구(가족 밖, 소리·바람)', 'villain', 'outside')],
  line='늑대 대신 바람 친구가 후— 불고, 지쳐서 웃는다. 벽돌집에서 모두 한 상에', kept=['세 형제가 각자 집을 짓는다', '볏짚·나무집은 날아가고 벽돌집은 끄떡없다', '{kid3}의 집으로 모인다({kid3} 집)'],
  cuts=[('네모 엄마가 말했다. 「이제 각자 집을 지어 보렴.」 {kid1}는 볏짚으로, {kid2}는 나무로, {kid3}는 벽돌로.', ['nemo_mom.joy', 'nemo_kids.kid1', 'nemo_kids.kid2', 'nemo_kids.kid3'], None),
        ('바람 친구가 휘이잉 찾아왔다. 「후— 불면 날아갈걸?」', ['nemo_kids.kid1', 'nemo_kids.kid2'], 'bang'),
        ('후— 볏짚집도, 후— 나무집도 폴폴 날아갔다. 두 아이는 {kid3}네 벽돌집으로 달려갔다.', ['nemo_kids.kid1', 'nemo_kids.kid2', 'nemo_kids.kid3'], 'question'),
        ('벽돌집은 끄떡없었다. 후후 불다 지친 바람 친구가 웃자, 모두 한 상에서 따끈한 수프를 먹었다.', ['nemo_kids.kid3', 'nemo_kids.kid1', 'nemo_kids.kid2', 'nemo_mom.love'], 'heart')]),
 dict(id='bears', title='세 마리 곰', origin='영국 민담(사우디 1837, 공유 저작물)',
  cast=[('큰 곰', '동그라미 아빠', 'lead', 'dong'), ('중간 곰', '동그라미 엄마', 'lead', 'dong'), ('아기 곰', '동그라미 아들', 'lead', 'dong'), ('길 잃은 손님(소녀)', '세모 아내', 'funny', 'semo')],
  art_pending=['동그라미 엄마·아들 시트(임시: 동그라미 아빠 그림만 보임)'],
  line='동그라미네가 곰 가족. 크기가 다른 그릇·의자·침대, 아기 곰 것이 딱 맞는다 — 마지막엔 같이 한 상', kept=['큰 것·중간 것·작은 것 세 번 시도', '아기 곰의 것이 딱 맞음', '곰이 돌아와 발견'],
  cuts=[('곰 세 식구(동그라미 아빠·엄마·아들)가 수프를 식히러 산책을 나갔다. 식탁엔 큰 그릇, 중간 그릇, 작은 그릇.', ['dong_dad.joy'], None),
        ('길 잃은 손님(세모 아내)이 들어와 맛봤다. 큰 것은 너무 뜨겁고, 중간 것은 너무 차갑고, 작은 것은 딱!', ['wife.surprise'], 'question'),
        ('의자도 침대도 세 번 시도. 작은 침대에서 손님이 꾸벅꾸벅 잠들었다.', ['wife.tired'], None),
        ('돌아온 곰들이 깜짝! 놀란 손님에게 아기 곰이 웃었다. 「같이 먹어요!」 모두 한 상에 앉았다.', ['dong_dad.warm', 'wife.joy'], 'heart')]),
 dict(id='shoes', title='구두장이와 요정', origin='그림 형제(공유 저작물)',
  cast=[('가난한 구두장이', '네모 아빠', 'lead', 'nemo'), ('구두장이 아내', '네모 엄마', 'helper', 'nemo'), ('밤의 작은 요정들', '요정(art.fairy)', 'helper', 'outside')],
  line='밤새 요정이 구두를 뚝딱, 아침마다 가죽이 늘어난다', kept=['남은 가죽 한 켤레를 잘라 두고 잠든다', '아침에 구두가 완성돼 있다', '몰래 지켜보다 요정에게 옷을 지어 준다'],
  cuts=[('구두장이 네모 아빠에게 남은 가죽은 딱 한 켤레. 잘라 두고 잠들었다.', ['nemo_dad.worry', 'nemo_mom.good'], None),
        ('아침에 보니 구두가 번듯하게 완성! 비싼 값에 팔려 가죽이 두 켤레로 늘었다.', ['nemo_dad.surprise', 'nemo_mom.joy'], 'bang'),
        ('밤마다 구두는 뚝딱, 가죽은 네 켤레로. 부부가 몰래 지켜보니 작은 요정들이었다.', ['art.fairy', 'nemo_dad.surprise', 'nemo_mom.surprise'], 'question'),
        ('고마운 마음에 요정들에게 작은 옷과 신발을 지어 주었다. 요정들은 춤추며 떠났다.', ['art.fairy', 'nemo_dad.love', 'nemo_mom.love'], 'heart')]),
 dict(id='kongjwi', title='콩쥐팥쥐', origin='한국 전래동화(공유 저작물)',
  cast=[('콩쥐', '네모네 {kid1}', 'lead', 'nemo'), ('팥쥐', '네모네 {kid2}', 'funny', 'nemo'), ('도와주는 두꺼비', '동그라미 아빠', 'helper', 'dong'), ('꽃신 주인을 찾는 원님', '세모 남편', 'helper', 'semo'), ('일을 시키는 새엄마', '깐깐한 아주머니(가족 밖, 목소리만)', 'villain', 'outside')],
  line='새엄마는 가족 밖 아주머니, 두꺼비가 독 구멍을 막고 마지막엔 팥쥐도 박수', kept=['밑 빠진 독에 물 채우기', '두꺼비·새의 도움', '잔치에서 꽃신 한 짝을 잃는다', '원님이 꽃신 주인을 찾는다'],
  cuts=[('깐깐한 아주머니가 콩쥐({kid1})에게 밑 빠진 독에 물을 가득 채우라고 했다.', ['nemo_kids.kid1'], 'question'),
        ('붓고 부어도 줄줄줄. 두꺼비(동그라미 아빠)가 엉금엉금 나와 구멍을 막아 주었다.', ['nemo_kids.kid1', 'dong_dad.calm'], 'sparkle'),
        ('잔치에 가려면 벼도 찧고 베도 짜야 했다. 새들이 벼를 까 주었고, 콩쥐는 꽃신을 신고 달려갔다. 팥쥐({kid2})는 투덜투덜.', ['nemo_kids.kid1', 'nemo_kids.kid2'], None),
        ('서두르다 꽃신 한 짝을 잃었다. 원님(세모 남편)이 신을 들고 주인을 찾았고, 팥쥐도 웃으며 박수쳤다.', ['husband.joy', 'nemo_kids.kid1', 'nemo_kids.kid2'], 'heart')]),
 dict(id='heungbu', title='흥부 박', origin='한국 전래동화(공유 저작물)',
  cast=[('흥부', '네모 아빠', 'lead', 'nemo'), ('흥부 아내', '네모 엄마', 'helper', 'nemo'), ('놀부', '세모 남편', 'funny', 'semo'), ('제비', '제비(art.swallow)', 'helper', 'outside')],
  line='식구 많은 흥부가 제비를 도와 박씨를 받는다, 놀부는 따라 하다 풍물패가 쏟아져 함께 잔치', kept=['다친 제비를 고쳐 줌', '박씨 → 박 타기', '놀부의 따라 하기와 박'],
  cuts=[('다리를 다친 제비를 흥부(네모 아빠)가 정성껏 싸매 주었다.', ['nemo_dad.love', 'art.swallow'], 'heart'),
        ('이듬해 제비가 박씨 하나를 물어 왔다. 흥부네 식구들이 마당에 심었다.', ['art.swallow', 'nemo_dad.joy', 'nemo_mom.joy'], None),
        ('박이 주렁주렁. 슬근슬근 톱질하자 박 속에서 쌀과 가구와 비단이 와르르!', ['art.gourd', 'nemo_dad.surprise', 'nemo_mom.joy'], 'bang'),
        ('놀부(세모 남편)도 따라 박을 탔지만 풍물패가 쏟아져 한바탕 춤판! 놀부는 웃으며 흥부네와 잔치를 벌였다.', ['husband.wink', 'nemo_dad.joy', 'nemo_mom.joy'], 'sparkle')]),
 dict(id='bremen', title='브레멘 음악대', origin='그림 형제(공유 저작물)',
  cast=[('당나귀', '네모 아빠', 'lead', 'nemo'), ('개', '세모 남편', 'lead', 'semo'), ('고양이', '세모 아내', 'lead', 'semo'), ('수탉', '동그라미 아빠', 'lead', 'dong'), ('도둑들', '허깨비 도둑(가족 밖, 소리·그림자)', 'villain', 'outside')],
  line='늙었다고 쫓겨난 네 친구가 노래로 빈집을 얻는다 — 네 도형이 한 탑을 쌓음', kept=['쫓겨난 동물 넷이 브레멘으로', '탑처럼 올라서서 함께 소리', '도둑이 달아나고 집을 차지'],
  cuts=[('늙었다고 쫓겨난 네 친구 — 당나귀(네모 아빠), 개(세모 남편), 고양이(세모 아내), 수탉(동그라미 아빠).', ['nemo_dad.good', 'husband.good', 'wife.good', 'dong_dad.good'], None),
        ('「브레멘에 가서 음악대를 하자!」 길을 가다 밤이 되자 불 켜진 집이 보였다.', ['nemo_dad.joy', 'husband.joy', 'wife.joy', 'dong_dad.joy'], 'question'),
        ('네 친구가 탑처럼 올라서서 함께 노래하자 집 안의 허깨비 도둑들이 놀라 달아났다.', ['nemo_dad.joy', 'husband.joy', 'wife.joy', 'dong_dad.joy'], 'note'),
        ('빈집에서 따뜻한 밥을 먹고 푹 잤다. 집이 마음에 쏙 들어 브레멘 대신 거기서 오래오래 노래했다.', ['nemo_dad.love', 'husband.love', 'wife.love', 'dong_dad.warm'], 'heart')]),
 dict(id='hok', title='혹부리 영감', origin='한국 전래동화(공유 저작물)',
  cast=[('혹부리 영감', '네모 아빠', 'lead', 'nemo'), ('도깨비', '도깨비(art.dokkaebi, 순한 판)', 'villain', 'outside'), ('따라 하는 욕심쟁이 영감', '동그라미 아빠', 'funny', 'dong')],
  line='노래 주머니 혹과 도깨비 방망이 뚝딱, 따라 한 영감은 혹이 하나 더 붙고 함께 노래', kept=['혹에서 노래가 나온다고 속음', '도깨비 방망이(보물)', '따라 한 영감은 혹이 하나 더 붙음'],
  cuts=[('혹이 달린 네모 아빠가 산속에서 노래를 불렀다.', ['nemo_dad.joy'], 'note'),
        ('도깨비가 나타나 물었다. 「그 고운 소리는 어디서 나오지?」 혹을 가리키자 도깨비는 노래 주머니인 줄 알았다.', ['art.dokkaebi', 'nemo_dad.surprise'], 'question'),
        ('도깨비는 보물과 바꾸자며 혹을 떼어 갔다. 도깨비 방망이를 한 번 두드리니 뚝딱!', ['art.dokkaebi', 'nemo_dad.joy'], 'bang'),
        ('따라 한 동그라미 아빠는 노래가 서툴러 혹이 하나 더 붙었다. 도깨비가 웃으며 말했다. 「됐다, 같이 부르자!」', ['dong_dad.trouble', 'art.dokkaebi', 'nemo_dad.joy'], 'note')]),
 dict(id='axe', title='금도끼 은도끼', origin='한국 전래동화(공유 저작물)',
  cast=[('나무꾼', '네모 아빠', 'lead', 'nemo'), ('산신령', '동그라미 아빠', 'helper', 'dong'), ('욕심쟁이 이웃', '네모 엄마', 'funny', 'nemo')],
  line='정직한 나무꾼은 금·은·쇠 도끼를 모두 받고, 따라 한 이웃은 웃음이 터져 쇠도끼만 받는다', kept=['도끼가 연못에 빠짐', '금도끼·은도끼·쇠도끼 세 번 물음', '정직하면 모두 받음'],
  cuts=[('나무꾼 네모 아빠가 도끼를 연못에 빠뜨렸다.', ['nemo_dad.worry'], 'bang'),
        ('산신령(동그라미 아빠)이 금도끼를 들고 물었다. 「이게 네 도끼냐?」 「아닙니다.」 은도끼도 「아닙니다.」', ['dong_dad.warm', 'nemo_dad.good'], 'question'),
        ('쇠도끼가 나오자 「그건 제 것입니다.」 정직한 나무꾼은 금도끼와 은도끼까지 받았다.', ['nemo_dad.love', 'dong_dad.joy'], 'sparkle'),
        ('소문을 들은 이웃 네모 엄마가 거짓말하려다 웃음이 터져 쇠도끼만 받고 함께 웃었다.', ['nemo_mom.wink', 'dong_dad.joy', 'nemo_dad.joy'], 'heart')]),
 dict(id='sun', title='해님 달님', origin='한국 전래동화(공유 저작물)',
  cast=[('오빠(달님)', '네모네 {kid1}', 'lead', 'nemo'), ('동생(해님)', '네모네 {kid2}', 'lead', 'nemo'), ('떡 팔러 간 엄마', '네모 엄마', 'helper', 'nemo'), ('호랑이 → 바람 호랑이', '바람 호랑이(가족 밖, 소리·그림자)', 'villain', 'outside')],
  line='호랑이는 가족 밖 바람 호랑이, 엉덩방아만 찧고 웃는다 — 동아줄은 그대로', kept=['엄마 흉내를 내는 호랑이', '나무 위로 피함', '하늘에서 튼튼한 동아줄', '해님과 달님이 됨'],
  cuts=[('떡 팔러 간 엄마를 기다리던 오누이({kid1}·{kid2})는 문을 꼭 닫고 있었다.', ['nemo_kids.kid1', 'nemo_kids.kid2'], None),
        ('바람 호랑이가 엄마 목소리를 흉내 내며 찾아왔다. 「문 열어라.」 문틈의 손이 이상했다.', ['nemo_kids.kid1', 'nemo_kids.kid2'], 'question'),
        ('오누이는 뒷문으로 나가 나무 위로 올라갔다. 하늘에서 튼튼한 동아줄이 내려왔다.', ['nemo_kids.kid1', 'nemo_kids.kid2'], 'sparkle'),
        ('오누이는 동아줄을 타고 올라가 해님과 달님이 되었다. 바람 호랑이는 엉덩방아를 찧고 허허 웃었다.', ['nemo_kids.kid2', 'nemo_kids.kid1', 'nemo_mom.joy'], 'heart')]),
 dict(id='ant', title='개미와 베짱이', origin='이솝(공유 저작물)',
  cast=[('개미', '네모 엄마', 'lead', 'nemo'), ('베짱이', '세모 남편', 'funny', 'semo'), ('지켜보는 이웃', '동그라미 아빠', 'helper', 'dong')],
  line='여름엔 노래, 겨울엔 빈 곳간 — 개미는 곡식 한 줌과 「내년엔 같이」를 건넨다', kept=['여름에 일하는 개미 / 노는 베짱이', '겨울에 베짱이가 문을 두드림'],
  cuts=[('더운 여름, 네모 엄마는 곡식을 나르고 세모 남편은 나무 그늘에서 노래만 불렀다.', ['nemo_mom.joy', 'husband.joy'], 'note'),
        ('「좀 쉬어요!」 베짱이가 불러도 개미는 부지런히 곡식을 날랐다.', ['nemo_mom.joy', 'husband.wink'], None),
        ('겨울이 오자 베짱이는 배가 고파 개미네 문을 똑똑 두드렸다.', ['husband.worry', 'nemo_mom.surprise'], 'question'),
        ('개미는 한숨을 쉬었지만 곡식 한 줌을 내밀었다. 「내년 여름엔 같이 일하자.」 둘은 한솥밥에 노래를 얹었다.', ['nemo_mom.love', 'husband.love', 'dong_dad.joy'], 'heart')]),
 dict(id='pino', title='피노키오', origin='콜로디(1883, 공유 저작물)',
  cast=[('제페토(목수)', '네모 아빠', 'lead', 'nemo'), ('피노키오(나무 인형)', '네모 막둥이', 'funny', 'nemo'), ('파란 요정', '요정(art.fairy)', 'helper', 'outside')],
  line='거짓말하면 코가 길어지는 인형이 진짜 아이가 된다', kept=['통나무로 인형을 만듦', '거짓말하면 코가 길어짐', '진짜 아이가 되는 소원'],
  cuts=[('목수 네모 아빠가 통나무를 깎아 인형을 만들었다.', ['nemo_dad.joy'], None),
        ('인형이 눈을 깜빡이며 말했다. 「아빠!」 학교에 가던 길에 구경에 팔려 놀았다.', ['baby.surprise', 'nemo_dad.surprise'], 'bang'),
        ('거짓말을 했더니 코가 쑥 길어졌다. 요정이 말했다. 「거짓말하면 코가 길어져요.」', ['baby.cry', 'art.fairy'], 'question'),
        ('인형이 용기를 내어 아빠를 도우니 요정이 소원을 들어주었다. 인형은 진짜 아이가 되어 아빠 품에 안겼다.', ['baby.love', 'nemo_dad.love', 'art.fairy'], 'heart')]),
 dict(id='jack', title='잭과 콩나무', origin='영국 민담(공유 저작물)',
  cast=[('잭', '네모네 {kid2}', 'lead', 'nemo'), ('잭의 엄마', '네모 엄마', 'helper', 'nemo'), ('구름 위 거인', '구름 거인(가족 밖, 쿵쿵 소리·그림자, 순한 판)', 'villain', 'outside'), ('잔치 손님', '세모 남편·동그라미 아빠', 'helper', 'semo')],
  line='콩나무는 하늘까지, 거인은 구름 위에서 손을 흔든다 — 마지막엔 세 가족이 큰 상에', kept=['소를 팔고 마법의 콩을 받음', '하룻밤에 자란 콩나무', '구름 위 거인의 성과 황금알 거위', '콩나무를 베어 내려옴'],
  cuts=[('소를 팔러 간 잭({kid2})이 마법의 콩 한 줌과 바꿔 왔다. 엄마는 한숨, 콩은 창밖으로 휙.', ['nemo_kids.kid2', 'nemo_mom.worry'], 'question'),
        ('하룻밤 사이 콩나무가 하늘까지! 잭이 올라가 보니 구름 위에 거인의 큰 성이 있었다.', ['nemo_kids.kid2'], 'bang'),
        ('황금알을 낳는 거위를 안고 달아나는 잭. 구름 거인이 쿵쿵쿵 쫓아왔다.', ['nemo_kids.kid2'], 'sparkle'),
        ('내려온 잭이 콩나무를 베자 거인은 구름 위에서 손을 흔들었다. 세 가족이 큰 상에 모여 황금알 오믈렛을 먹었다.', ['nemo_kids.kid2', 'nemo_mom.joy', 'husband.joy', 'dong_dad.joy'], 'heart')]),
]

# ---------------- ① 3권 11~15장 (유아, 막둥이 시점) ----------------
K = [
 dict(ch=11, id='brothers', title='{brothers}', origin='한국 전래동화(공유 저작물)', bg='hill', mode='꽃 심기(수 세기 — 볏단 세기)',
  cast=[('형', '네모 {sib1}', 'lead', 'nemo'), ('아우', '막둥이', 'lead', 'nemo')], line='밤마다 몰래 볏단을 옮기다 달밤에 딱 마주쳐요. 몇 단인지 세어 보며 놀아요.', kept=['볏단을 똑같이 나눔', '밤마다 몰래 서로에게 볏단을 옮김', '아침마다 수가 그대로여서 이상해함', '달밤에 길에서 마주침'],
  pro=[('옛날 옛날, {sib1}과 막둥이가 볏단을 똑같이 나눴어요.', [('nemo_kids.kid1', 230), ('baby.joy', 150)], None),
       ('{sib1}이 생각했어요. 「막둥이네는 식구가 많으니…」 밤마다 몰래 볏단을 막둥이네로 옮겨요.', [('nemo_kids.kid1', 230), ('baby.surprise', 150)], 'sparkle'),
       ('그런데 아침마다 볏단 수가 그대로! 몇 단일까요? 세어 봐요.', [('baby.surprise', 190)], 'question')],
  epi=[('막둥이도 몰래 {sib1}네로 볏단을 옮기고 있었어요.', [('baby.joy', 190)], 'sparkle'),
       ('달밤에 길에서 딱 마주쳤어요! 볏단을 안고 깜짝!', [('nemo_kids.kid1', 230), ('baby.surprise', 150)], 'bang'),
       ('둘은 볏단을 안고 깔깔 웃었어요. {brothers}예요.', [('nemo_kids.kid1', 230), ('baby.love', 150)], 'heart')]),
 dict(ch=12, id='ant', title='개미와 베짱이', origin='이솝(공유 저작물)', bg='field', mode='똑같이 나눠요(나눔)',
  cast=[('개미', '엄마·막둥이', 'lead', 'nemo'), ('베짱이', '동그라미 아저씨', 'funny', 'dong')], line='겨울이 오기 전에 열매를 똑같이 나눠요. 겨울에 베짱이가 문을 똑똑, 개미는 나눠 줘요.', kept=['여름에 일하는 개미와 노는 베짱이', '겨울에 베짱이가 문을 두드림'],
  pro=[('여름이에요. 엄마 개미와 막둥이는 달콤한 열매를 모아요.', [('nemo_mom.joy', 250), ('baby.joy', 150)], None),
       ('동그라미 아저씨 베짱이는 노래만 불러요. 룰루랄라!', [('dong_dad.joy', 260)], 'note'),
       ('겨울이 오기 전에 똑같이 나눠요. 몇 개씩 나눌까요?', [('baby.surprise', 190)], 'question')],
  epi=[('겨울이 왔어요. 베짱이가 배가 고파 문을 똑똑똑.', [('dong_dad.trouble', 260), ('baby.surprise', 150)], 'question'),
       ('엄마 개미가 열매를 나눠 주며 말했어요. 「내년 여름엔 같이 모아요.」', [('nemo_mom.love', 250), ('dong_dad.joy', 260)], 'heart'),
       ('베짱이가 노래하고 개미들은 춤춰요. 따뜻한 겨울이에요.', [('dong_dad.warm', 260), ('baby.joy', 150)], 'note')]),
 dict(ch=13, id='axe', title='금도끼 은도끼', origin='한국 전래동화(공유 저작물)', bg='forest', mode='숨은 그림 찾기',
  cast=[('나무꾼', '아빠', 'lead', 'nemo'), ('산신령', '동그라미 아저씨', 'helper', 'dong'), ('욕심쟁이 이웃', '세모 삼촌', 'funny', 'semo')], line='정직한 아빠는 금도끼 은도끼를 모두 받고, 따라 한 세모 삼촌은 웃음이 터져요.', kept=['도끼가 연못에 빠짐', '금도끼·은도끼·쇠도끼를 차례로 물음', '정직하면 모두 받음'],
  pro=[('가을 숲에서 아빠가 도끼를 연못에 퐁당!', [('nemo_dad.worry', 250), ('baby.surprise', 150)], 'bang'),
       ('동그라미 아저씨 산신령이 나타났어요. 「금도끼가 네 거니?」 아빠는 고개를 저어요.', [('dong_dad.warm', 260), ('nemo_dad.good', 250)], 'question'),
       ('「낙엽 속에 숨은 친구들을 찾아 보렴.」 같이 찾아봐요!', [('dong_dad.joy', 260), ('baby.joy', 150)], 'sparkle')],
  epi=[('다 찾았어요! 산신령이 쇠도끼를 돌려주었어요.', [('dong_dad.joy', 260), ('nemo_dad.joy', 250)], 'sparkle'),
       ('정직한 아빠에게 금도끼도 은도끼도 선물!', [('nemo_dad.love', 250), ('baby.joy', 150)], 'heart'),
       ('따라 한 세모 삼촌은 거짓말하려다 웃음이 터져 모두 깔깔깔.', [('husband.wink', 250), ('baby.joy', 150)], 'heart')]),
 dict(ch=14, id='snowqueen', title='눈의 여왕(순한 판)', origin='안데르센(공유 저작물)', bg='night', mode='눈송이 잡기(색 고르기)',
  cast=[('카이', '네모 {sib1}', 'lead', 'nemo'), ('게르다', '막둥이', 'lead', 'nemo'), ('눈의 여왕(순한 판)', '동그라미 아주머니', 'helper', 'dong')], art_pending=['동그라미 아주머니 시트(임시: 그림 없이 글로만)'],
  line='얼음 궁전은 포근한 눈 궁전, 막둥이의 따뜻한 눈물에 눈송이가 녹아요.', kept=['눈송이(거울 조각)가 눈에 들어감', '눈의 여왕이 카이를 데려감', '게르다가 찾아가 눈물로 녹임'],
  pro=[('첫눈이 내리는 날, 눈송이 하나가 형 눈에 쏙 들어갔어요.', [('nemo_kids.kid1', 230), ('baby.surprise', 150)], 'bang'),
       ('{sib1}은 눈의 여왕 동그라미 아주머니를 따라 눈 궁전으로 갔어요.', [('nemo_kids.kid1', 230)], None),
       ('막둥이가 따라가 같은 색 눈송이를 톡톡 잡아요!', [('baby.joy', 190)], 'sparkle')],
  epi=[('막둥이의 따뜻한 눈물에 눈송이가 사르르 녹았어요.', [('baby.cry', 190)], 'heart'),
       ('{sib1}이 눈을 비비며 「막둥이!」 하고 안았어요.', [('nemo_kids.kid1', 230), ('baby.love', 150)], 'heart'),
       ('눈의 여왕 아주머니도 손을 흔들어 주었어요. 함께 집으로!', [('nemo_kids.kid1', 230), ('baby.joy', 150)], 'sparkle')]),
 dict(ch=15, id='kongjwi', title='콩쥐팥쥐 독 채우기', origin='한국 전래동화(공유 저작물)', bg='house', mode='박자 맞추기',
  cast=[('콩쥐', '막둥이', 'lead', 'nemo'), ('팥쥐', '네모 {sib1}', 'funny', 'nemo'), ('도와주는 두꺼비', '할머니', 'helper', 'nemo'), ('꽃신 주인을 찾는 원님', '세모 삼촌', 'helper', 'semo')], line='구멍 난 독은 두꺼비 할머니와 박자를 맞춰 채워요. 꽃신을 찾아 준 원님 앞에서 {sib1}도 함께 웃어요.', kept=['밑 빠진 독에 물 채우기', '두꺼비의 도움', '꽃신 한 짝을 잃고 원님이 찾아 줌'],
  pro=[('막둥이 콩쥐는 커다란 독에 물을 가득 채워야 해요.', [('baby.joy', 190)], None),
       ('그런데 독에 구멍이 퐁! 물이 줄줄줄.', [('baby.cry', 190)], 'bang'),
       ('두꺼비 할머니가 와서 박자에 맞춰 톡톡 도와줘요.', [('nemo_grandma.good', 250), ('baby.joy', 150)], 'note')],
  epi=[('독이 가득 찼어요! 잔치에 갈 수 있어요.', [('baby.joy', 190), ('nemo_grandma.good', 250)], 'sparkle'),
       ('서둘러 가다가 꽃신 한 짝이 쏙 빠졌어요.', [('baby.surprise', 190)], 'question'),
       ('세모 삼촌 원님이 꽃신을 찾아 주었어요. {sib1}도 함께 짝짝짝!', [('husband.joy', 250), ('baby.love', 150), ('nemo_kids.kid1', 230)], 'heart')]),
]

# ---------------- ⑤ 「동화 속 당신은?」 5종 — 선택지는 인물 동일시가 아니라 "장면 속 내 반응"(문항은 tools/quiz_gen.py) ----------------
Q5 = [
 dict(id='heungbu', title='흥부와 놀부', origin='한국 전래동화(공유 저작물)', scenes=['다친 제비', '박씨', '박 타기', '쌀이 쏟아짐', '{sib1}이 찾아옴', '잔치 뒤 밤'], line='장면마다 세 가지 반응(예: 박을 탈 때 하나씩 천천히 / 한 번에 다 / 순서대로 정확히) 중 내 쪽을 고른다', kept=['제비를 고쳐 준 흥부', '박 타기', '형제의 방문']),
 dict(id='hare', title='토끼와 거북이', origin='이솝(공유 저작물)', scenes=['출발 신호', '그늘', '낮잠 든 친구', '결승선', '경주가 끝남', '저녁'], line='경주·낮잠·결승선 장면에서 내 반응을 고른다', kept=['느린 쪽과 빠른 쪽의 경주', '낮잠']),
 dict(id='ant', title='개미와 베짱이', origin='이솝(공유 저작물)', scenes=['여름 한낮', '놀자는 친구', '곳간 채우기', '겨울', '배고픈 이웃', '봄'], line='여름·겨울·곳간 장면에서 내 반응을 고른다', kept=['여름의 일과 놀이', '겨울에 문을 두드림']),
 dict(id='pigs', title='아기돼지 삼형제', origin='영국 민담(공유 저작물)', scenes=['집 짓기', '바람', '날아간 이웃집', '벽돌집', '지친 바람', '완성된 밤'], line='집 짓기·바람·벽돌집 장면에서 내 반응을 고른다', kept=['세 형제 세 집', '벽돌집은 끄떡없음']),
 dict(id='bears', title='세 마리 곰', origin='영국 민담(사우디, 공유 저작물)', scenes=['그릇', '의자', '침대', '곰의 귀가', '같이 먹자는 말', '식사 뒤'], line='그릇·의자·침대 장면에서 내 반응을 고른다', kept=['큰 것·중간 것·작은 것', '작은 것이 딱 맞음']),
]


def tally(items):
    """가족별 역할 횟수 집계: {(fam, kind): n}"""
    c = {}
    for it in items:
        for _, _, kind, fam in it['cast']:
            c[(fam, kind)] = c.get((fam, kind), 0) + 1
    return c


def table(c, title):
    rows = ['**' + title + '**', '', '| 가족 | ' + ' | '.join(KIND.values()) + ' |', '|---|' + '---|' * len(KIND)]
    for f, fn in FAM.items():
        rows.append('| ' + fn + ' | ' + ' | '.join(str(c.get((f, k), 0)) for k in KIND) + ' |')
    return rows


def check():
    """가족 악역 0, 세모의 웃긴 실패역 ≤3(③④ 12장), 호칭 규칙(세모네 아이 없음)"""
    for t in T12 + K:
        for role, who, kind, fam in t['cast']:
            assert not (kind == 'villain' and fam != 'outside'), '가족이 악역: %s / %s → %s' % (t['title'], role, who)
            assert fam in FAM and kind in KIND, (t['title'], role)
            assert not (fam == 'semo' and re.search(r'아들|딸|아이|막둥이', who)), '세모네에는 아이가 없다: %s' % who
    semo = sum(1 for t in T12 for _, _, k, f in t['cast'] if f == 'semo' and k in ('funny', 'villain'))
    assert semo <= 3, '세모의 웃긴 실패역/악역 3회 초과: %d' % semo
    for t in T12:
        assert len(t['cuts']) == 4, t['title'] + ' 4컷(기승전결)이어야 한다'
    return semo


if __name__ == '__main__':
    semo_funny = check()
    tales = []
    def ent(t, **kw):
        return dict(id=kw['id'], title=t['title'], origin=t['origin'], apps=kw['apps'], audience=kw['aud'], cast=[dict(role=a, who=b, kind=c, family=d) for a, b, c, d in t['cast']], line=t['line'], kept=t['kept'], art_pending=t.get('art_pending', []), status='[제안]')
    for i, t in enumerate(T12):
        tales.append(ent(t, id=t['id'], apps={'merge': i + 1, 'color': i + 1}, aud='adult'))
    for k in K:
        tales.append(ent(k, id='kid_' + k['id'], apps={'playground': k['ch'], 'mode': k['mode']}, aud='kid'))
    for q in Q5:
        tales.append(dict(id='quiz_' + q['id'], title=q['title'], origin=q['origin'], apps={'quiz': True}, audience='adult', cast=[], scenes=q['scenes'], line=q['line'], kept=q['kept'], art_pending=[], status='[제안]'))
    open(R / 'data/tales.json', 'w', encoding='utf-8').write(nm(json.dumps({'version': 2, 'principle': 'docs/20 D13 — 구조·모티브·상징물은 원작 그대로, 배역과 무서운 수위만 바꾼다. 진짜 악역은 가족 밖. 공유 저작물 원전만. 세모네는 아이 없음.', 'tales': tales}, ensure_ascii=False, indent=1)))
    p = R / 'data/merge_extra.json'; X = json.load(open(p, encoding='utf-8'))
    X['stories'] = [dict(chapter=i + 1, title=t['title'], tale=t['id'], cuts=[dict(text=c[0], chars=c[1], **({'bubble': c[2]} if c[2] else {})) for c in t['cuts']]) for i, t in enumerate(T12)]
    json.dump(X, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    names = [t['title'] for t in T12]
    p = R / 'data/merge_levels.json'; L = json.load(open(p, encoding='utf-8')); L['chapters'] = names; json.dump(L, open(p, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    p = R / 'games/merge/merge-gen.js'; s = open(p, encoding='utf-8').read()
    s = re.sub(r"const CHAPTERS = \[[^\]]*\];", lambda m: "const CHAPTERS = [" + ", ".join("'" + n + "'" for n in names) + "];", s, count=1); open(p, 'w', encoding='utf-8').write(s)
    p = R / 'data/story.json'; S = json.load(open(p, encoding='utf-8'))
    def cuts(bg, lst):
        out = []
        for txt, chars, b in lst:
            n = len(chars); xs = [180] if n == 1 else [60 + j * (240 / (n - 1)) for j in range(n)]
            cut = dict(bg=bg, text=txt, chars=[dict(id=cid, x=round(xs[j]), y=610, h=h) for j, (cid, h) in enumerate(chars)])
            if b: cut['bubble'] = dict(type=b, at=0)
            out.append(cut)
        return out
    for k in K:
        S['ch%d' % k['ch']] = dict(pro=cuts(k['bg'], k['pro']), epi=cuts(k['bg'], k['epi']), tale=k['id'])
    json.dump(S, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    # ① 11장 영웅(지도 원) — 의좋은 형제
    p = R / 'data/stages.json'; ST = json.load(open(p, encoding='utf-8')); ST['ch11']['heroes'] = ['nemo_kids.kid1', 'baby.joy']; json.dump(ST, open(p, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    md = ['# 10. 옛이야기 배역표 (D13) — 모든 항목 [제안]', '', '허브 QA 대기. 생성: `python tools/tales_build.py` (원천은 이 스크립트, 가족 악역 0 · 세모 웃긴 실패역 ≤3 단언 포함). 원칙은 docs/20: 구조·모티브·상징물은 원작 그대로, 바꾸는 것은 배역과 무서운 수위뿐, **진짜 악역은 가족 밖 캐릭터**. 그림은 임시.', '', '**아이 호칭 변수**: 글 속 변수 sib1(형/누나/언니/오빠)·kid1~kid3·baby 는 중괄호로 감싸 쓰며(예: 중괄호 안에 sib1) `data/names.json` 값으로 화면에 풀린다(은/는·이/가·을/를·과/와 자동). 작가 결정이 나오면 그 파일만 고치고 이 스크립트를 다시 돌린다. 지금 값: sib1=' + NAMES['sib1'] + ', kid1/2/3=' + '/'.join(NAMES[k] for k in ('kid1', 'kid2', 'kid3')) + ', baby=' + NAMES['baby'] + '.', '']
    md += table(tally(T12), '③④ 12장 가족별 역할 횟수') + ['', '(세모의 웃긴 실패역·악역: %d회 / 가족 악역: 0)' % semo_funny, ''] + table(tally(K), '① 3권 11~15장 가족별 역할 횟수') + ['', '## ③ 도형 합치기 12장 · ④ 옛이야기 색칠 12장 (같은 이야기, 장당 4컷 기승전결)', '']
    for i, t in enumerate(T12):
        md += ['### %d장 %s — %s' % (i + 1, t['title'], t['origin']), '- 배역: ' + ' / '.join('%s → %s [%s·%s]' % (a, b, KIND[c], FAM[d]) for a, b, c, d in t['cast']), '- 우리 버전: ' + t['line'], '- 원작에서 유지: ' + ' · '.join(t['kept'])] + (['- 그림 대기: ' + ', '.join(t['art_pending'])] if t.get('art_pending') else []) + ['']
    md += ['## ① 놀이터 3권 11~15장 (막둥이 시점)', '']
    for k in K:
        md += ['### %d장 %s — %s (놀이: %s)' % (k['ch'], k['title'], k['origin'], k['mode']), '- 배역: ' + ' / '.join('%s → %s [%s·%s]' % (a, b, KIND[c], FAM[d]) for a, b, c, d in k['cast']), '- 우리 버전: ' + k['line'], '- 원작에서 유지: ' + ' · '.join(k['kept'])] + (['- 그림 대기: ' + ', '.join(k['art_pending'])] if k.get('art_pending') else []) + ['']
    md += ['## ⑤ 「동화 속 당신은?」 5종 — 선택지는 인물과 동일시하지 않고 장면 속 내 반응', '']
    for q in Q5:
        md += ['### %s — %s' % (q['title'], q['origin']), '- 장면: ' + ' → '.join(q['scenes']), '- 방식: ' + q['line'], '- 원작에서 유지: ' + ' · '.join(q['kept']), '']
    md += ['## ② 세 가족 식탁', '웹툰 사연 유지(변경 없음, D13 ②).']
    open(R / 'games/10_TALES_CAST.md', 'w', encoding='utf-8').write(nm('\n'.join(md) + '\n'))
    print('tales', len(tales), '| 세모 웃긴 실패역', semo_funny, '| 가족 악역 0 확인')
