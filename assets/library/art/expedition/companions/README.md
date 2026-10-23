# ⑪ 동료 43종 코드 그림 키트 — ExpCompanions (gf-asset, 2026-10-22)

사양: `notes/art_spec_exp_companions.md` (종마다 고유 외곽 + 부속 1 + 핵심 특징 1 + 표정 + 소품 1). 정본 가족 그림(assets/ PNG)은 건드리지 않았다.

| 파일 | 내용 |
|---|---|
| `companions.js` | 키트 본체 — `ExpCompanions.has(id)` · `ExpCompanions.svg(id[, {size}])` → SVG 문자열, `ExpCompanions.ids`(43). 브라우저·Node 둘 다 |
| `svg/<id>.svg` | 같은 그림 낱장(43, viewBox 0 0 100 106) |
| `png256/<id>.png` | 투명 PNG 256×272(43) — PNG 슬롯이 편하면 이것 |
| `sheet.html` | 점검 시트 `?mode=new|sil|before|pairs&img=64` + `silIoU()` 실루엣 겹침 수치 |
| 시트 PNG | `notes/snapshots/companions_before_after.png`(지금 KITS ↔ 새 키트 64px) · `companions_sil.png`(검은 실루엣) · `companions_pairs.png`(겹침 위험 짝 8) · `companions_new128.png` |
다시 만들기: `NODE_PATH=<본 저장소>/node_modules node tools/asset_companions_shots.js all`

## 규격
viewBox `0 0 100 106`(ExpArt.creature 와 같음) · 외곽선 `#6b5443` · 플랫 단색 · 발끝 y≈100 · 동료 몸은 □△○ 정형 없이 종 고유 외곽(D46-1) — 속성은 카드 배지로 · 눈은 가족 문법(흰자+동공+하이라이트 2)이되 더 작게 · 15+ 톤(아기 연출 없음, 손님 = 성인 친척) · 글자 든 소품 없음.

## 게임에 연결하는 법 (gf-game 이 할 일 — 제안)
`games/expedition/exp-art.js` 의 `creature(o)` 맨 앞에 한 줄:
```js
if (!o.enemy && window.ExpCompanions && ExpCompanions.has(o.id)) return ExpCompanions.svg(o.id);   // svg 에 class="ea-cr" 이 이미 붙어 있다
```
그리고 `companions.js` 를 exp-art.js 앞에 불러오면 도감·편성·전투 카드가 모두 새 그림이 된다(KITS 는 남겨 두면 대체용). PNG 로 쓰려면 `png256/<id>.png` 를 `GF.data.chars` 에 등록하고 unit `art` 를 그 id 로.

## 수치 — 64px 검은 실루엣 겹침(IoU, 43종 903쌍)
| | 평균 IoU | 가장 비슷한 쌍 | IoU 0.8 넘는 쌍 |
|---|---|---|---|
| 지금 KITS(□△○ 몸 + 부품) | 0.706 | 0.978 (제비↔눈 까마귀) | **194쌍** |
| 새 키트 | 0.526 | 0.783 (여우↔다람쥐) | **0쌍** |
- 사양서의 겹침 위험 짝 8개(참새↔찹쌀떡, 생쥐↔요정↔여우, 두꺼비↔마늘↔떡국, 두 호랑이, 바람 친구↔구름 거인, 하늘 어른↔마법사, 원님↔허깨비, 트리)는 모두 0.8 아래. 1차에서 0.8 을 넘던 2쌍(도깨비↔마늘 0.835, 하늘 어른↔마늘 0.808)은 마늘을 납작한 넓은 통마늘로 바꿔 해결.
- 수치 재기: `sheet.html` 을 열고 콘솔에서 `await silIoU('new')` / `await silIoU('before')`.
