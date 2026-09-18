# 🟦🔺⚫ 웹툰 「기하학 가족」 · 제작 허브

> 작가의 허브 문서(2026-09 Claude.ai 프로젝트)를 이 저장소 기준으로 옮김. 코드는 `src/characters.js`.

## 1. 한 줄 개요

삶은 수학이 아니지만, 수학만큼 반복적일지도 모른다 — **같은 사건**을 세 가족이 각자의 환경에서 어떻게 겪는지 지켜보는 잔잔한 감성 웹툰. 고등학교 동창인 세 남자의 가족이 주인공이며, **도형이 곧 성격**이다.

- **네모가족** — 벅참과 결핍의 대가족 (따뜻하지만 늘 부담)
- **세모부부** — 삼한사온, 마주보면 사랑·나란히 서면 전투 (정교하고 날카로운, 속엔 외로움)
- **동그라미가족** — 완벽한데 외롭다 (겉으로는 결코 약해 보이지 않음)

**연재 형식**: 세로 스크롤 웹툰, 주 1편. **댓글형 컷툰** — 매 화 끝에 "당신은 어느 도형?" 독자 참여를 유도하고, 좋은 댓글 사연은 **외전**으로 확장한다.

## 2. 세 가족 (도형 = 성격)

### 네모가족 (SQUARE) — 7인, 직육면체로 뭉친 대가족
- **아빠** `#e29368` — 자상하고 나이보다 조금 들어 보이는, 사람 좋은 흔한 중년(약간 통통). 세 동창 중 가장 착하고 성실. 회사 창가 + 믹스커피.
- **엄마** `#ecb383` — 손이 아주 많음. 밝지만 조금 지침.
- **할머니** `#d8b58e` / **큰딸** `#f0c583`(엄마를 도움) / **작은딸** `#f2b49e`·**작은아들** `#e6a9c0`(티격태격) / **막둥이** `#f8dcb0`(중앙 틈의 늦둥이)
- 아이들은 밝고 순진하지만 이목구비가 수수 — 캐릭터성이 약함.
- 톤: 파스텔·아이러니. **피곤함을 앞세우지 말 것**, 행복이 우선.

### 세모부부 (TRIANGLE) — 무자녀, 동일 크기 삼각형 둘
- **남편** `#9fb6d0` (흰자만 먹음) / **아내** `#ecc76a` (노른자만 먹음). 둘 다 잘생기고 예리·정교, 젊어 보이고 활기참. 남편이 동창, IT 사무실 + 아메리카노.
- **상태**: 마주보면 마름모/정사각형 = 웨딩·행복 / 나란히 같은 방향 = 전투(포크·칼).
- 에피소드는 늘 극단 — 완전히 등을 돌리거나, 너무 행복하게 끝난다. 자신감 뒤에 외로움이 배어 있음.

### 동그라미가족 (CIRCLE) — 4인, 완벽한 원 넷
- **아빠** `#9fb0bf`(안경·전문직) / **엄마** `#c4b3a0` / **아들** `#a9bcae`(바이올린) / **딸** `#cbb6c2`(테니스).
- 균등한 간격, 닿을 듯 닿지 않음, 살짝 땅에 박힘. 아빠가 동창(가장 성공), 교정 창가.
- 약점이 없고 늘 평정. **외로움은 이야기 속에만** 존재하고 겉으로는 절대 드러나지 않는다.

## 3. 캐릭터 코드 시스템 (v6 굿즈 에디션) — `src/characters.js`
규격은 `docs/03_STYLE_GUIDE.md` (잠금). 플랫 컬러 · 외곽선 4 · 팔다리 · 표정 12 · 포즈 10 · 소품 10.
```
nemoDad({ x, y, w=120, h=106, emo, pose, gaze, item, suit, glasses })
nemoMom({ x, y, w=96, h=92, emo, pose, gaze, item, manyHands=true })   nemoGrandma({ x, y, w=84, h=80, ... })
nemoKid({ x, y, w=66, h=66, color, emo, pose, gaze, item, tuft=true })
semoHusband({ x, y, size=122, emo, pose, gaze, item, suit })   semoWife({ ... })
dongDad({ cx, cy, r=48, emo, pose, gaze, item, suit, glasses=true })   dongMom / dongSon(violin) / dongDaughter(racket)
squareFamilyPortrait(x,y) · triangleWedding(x,y) · triangleBattle(x,y) · circleFamilyPortrait(x,y)
speech(x,y,w,lines,{tail,size}) · narration(x,y,w,lines,{size}) · windowBg(id,...) · itemAt(item,x,y,u)
emo:  good joy bad angry worry relief sad cry surprise love tired wink
pose: stand wave cheer think point hips shrug hold sit walk
item: coffee americano phone envelope book bag violin racket heart star
```
검증: `node tools/snapshot.js` → `notes/snapshots/`. 시트 `web/characters.html` 이 정본.

## 4. 빌드
`python tools/build.py` → `dist/` (characters.js 인라인, index.html = 최신 화). 검증은 playwright 스크린샷 fullPage.

## 5. 에피소드 로드맵
- **1화 「부고」** — ✅ `web/ep01.html`. 같은 부고 문자 → 카톡 회상 → 세 창가(믹스/아메리카노) → 단톡방 → 상복 재회 → 부의 봉투 → "우린 상관이 좀 있단다, 친구야" → 투표 CTA.
- **2화 「집 청소」** — 예정. 같은 주말, 세 집의 청소.
- 소재 풀: 중고차 사기, 어버이날, 명절, 학원비, 건강검진. 하나의 사건 → 세 가족의 다른 반응.

## 6. 파생 (IP 공장 규칙, Starry Village 와 동일)
한 화 = 웹툰 1 + 쇼츠 2~3(컷 리스케일 9:16) + 블로그 1 + 외전 후보(댓글). 모든 쇼츠 마지막 컷은 "당신은 어느 도형?" 고정.
