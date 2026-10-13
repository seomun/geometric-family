# 32. 다국어 준비 현황 · 계획 (C15)

> 생성: `node tools/i18n_check.js --report`. 지금은 **틀만** 있다: 사전(`data/i18n/en.json` → `ops.json` 의 `strings_en`)과 `GF.t` 언어 전환(`GF.lang`)·빠진 키 점검. 번역은 나중. [제안]

## 지금 상태
- 한국어 사전 키 186개 / 영어 번역 2개(나머지는 한국어로 대신 나옴).
- 코드가 `GF.t` 로 쓰는 키 168종 — 모두 사전에 있음(시험 단언).
- **아직 코드 안에 박혀 있는 한국어 따옴표 문자열 1800개**(30개 파일) — 화면 글자 대부분이 여기에 있다. 사전으로 빼는 것이 다음 작업.

## 파일별 남은 한국어 문자열(많은 순 25)
| 파일 | 개수 |
|---|---|
| `games/engine/room/room2.js` | 475 |
| `games/expedition/exp.js` | 329 |
| `games/idle/idle.js` | 105 |
| `games/quiz/quiz.js` | 97 |
| `games/tile/tile.js` | 94 |
| `games/sort/sort.js` | 90 |
| `games/block/block.js` | 82 |
| `games/merge/merge.js` | 77 |
| `games/day/day-gen.js` | 69 |
| `games/spot/spot.js` | 55 |
| `games/engine/gf.js` | 54 |
| `games/engine/extras.js` | 50 |
| `games/spot/spot-gen.js` | 32 |
| `games/engine/saga.js` | 26 |
| `games/engine/rank.js` | 24 |
| `games/block/block-gen.js` | 19 |
| `games/merge/merge-gen.js` | 19 |
| `games/sort/sort-gen.js` | 18 |
| `games/tile/tile-gen.js` | 18 |
| `games/engine/room/room.js` | 14 |
| `games/color/color.js` | 11 |
| `games/engine/tale.js` | 10 |
| `games/engine/polish.js` | 7 |
| `games/engine/ui-kit/ui-kit.js` | 6 |
| `games/spot/spot-core.js` | 6 |

## 계획(권장 순서)
1. **키트·공통**(ui-kit·extras·ops·polish): 화면 어디서나 쓰는 버튼·토스트·설정 → 이미 상당수 `GF.t`. 남은 것 정리.
2. **앱 홈·결과·튜토리얼**: 첫 화면과 결과 카드(스토어 스크린샷에 나옴).
3. **이야기·사연·대사 데이터**(data/*.json): 번역이 아니라 별도 로케일 폴더(`data/<언어>/story_*.json`)로 분리(문화 각색 필요, 옛이야기는 나라마다 익숙한 이야기가 다름).
4. **⑪ 원정대**(exp.js): 문장이 가장 많음 — 별도 사전 `exp.*`.
5. 설정에 「언어」 줄(ko/en) 추가는 번역이 한 앱 분량 이상 모인 뒤.

## 주의
- 자리표시 `{이름}` 은 번역에서도 그대로(시험이 확인). 한국어 조사(은/는)가 붙는 문장은 번역 대신 문장 구조를 다시 쓴다.
- 한국어 줄 바꿈 설정(`word-break: keep-all`)은 로케일별 분기 필요.
- 영어 번역이 비어 있으면 한국어로 나오므로 **출시판은 번역이 다 찬 언어만 켠다**.
