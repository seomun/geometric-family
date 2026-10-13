# 26. 스토리가 곧 튜토리얼 (D22-1) — 구현 노트

작가 지시: "스토리가 게임 내용과 약간 겉도는 느낌 → 앞의 스토리가 게임의 튜토리얼이 되게, 이미지도 넣어서." (허브 D22)

## 방식
- 이야기 컷(GF.story) 한 장 안에 **미니 판**을 그려 넣는다. 캐릭터는 작아져 아래에 서고(`A × 0.3`), 위 패널(`.cut-mini`)에 **실제 게임 판 조각 그림**으로 같은 동작을 반복해 보여 준다.
- 미니 판은 각 게임 코드가 자기 그림 함수로 등록한다 — `GF.tale.mini.reg(앱, (host, spec, still) => …)`. ③ `pieceEl` · ⑦ `tile` · ⑧ `art` · ⑨ `art` · ⑥ `sceneSVG`(실제 1번 판 그림) · ⑩ `THEME_SVG`(1번 판 얼굴·얼룩 위치). ②④⑤·①은 공용 간이 미니(이모지·세 가족 얼굴)를 tale.js 에 둔다.
- 순서: **프롤로그 3컷**(배경 설명 → 배역이 동작 → 「이제 같이」) → **1장 시작 컷**(1장 배역이 같은 동작, 컷 안 판 = 첫 판 그대로) → **설명 카드**(그림 한 장 + 한 줄) → **손가락 시연**(`UK.finger`, 기존) → 첫 판.
- 장마다 **새 판 종류**가 처음 나오면 `rules[type].cuts` 의 컷 1장(배역이 그 규칙을 보여 줌) → 설명 카드(`mini` 그림 + 한 줄). 첫 판 종류는 프롤로그가 같은 일을 하므로 컷을 생략한다.
- ① 놀이터는 장마다 프롤로그 둘째 자리에 「그 장 놀이」 컷(`tut:1`, 이모지 미니)을 끼운다(`tools/play_tutorial.py`, 멱등).

## 데이터·도구
| 파일 | 역할 |
|---|---|
| `tools/tutorial_data.py` | 앱별 프롤로그·1장 시작 컷·판 종류 컷의 글과 `mini` 값 (모든 글 [제안]) |
| `tools/story_build.py` | `tutorial(app)` 이 data/story_<앱>.json 에 덮어씀 (`python tools/story_build.py`) |
| `tools/play_tutorial.py` | ① data/story.json 에 컷 삽입 |
| `tools/tut_shots.js` · `tut_play.js` · `tut_rules.js` · `tut_sheet.py` | 캡처·점검·시트(`notes/snapshots/tut_sheet.png`) |

## 판 종류와 미니 판 (규칙 컷이 있는 것)
③ order·tight·solo·clear·move·kimjang(6) · ⑥ odd·hidden·three·memory·zoom(5) · ⑦ family·junk·combo·star·limit·solo(6) · ⑧ pair·limit·locked·hidden·family(5) · ⑨ goal·lock·narrow·trio(4) · ⑩ dress·chew·tidy·sleep(4). 같은 앱의 규칙은 대부분 **기본 미니 판의 값만 바꿔**(조각 종류·개수) 보여 준다. 종류별 전용 동작(잠금 열림·가려진 칸 공개 등)까지 그리는 것은 다음 손질 대상.

## 알려진 한계 · 확인할 것
- 1장 첫 판이 ⑨ 는 「짝 맞추기(둘)」 라서 프롤로그를 「같은 그림 둘」로 맞췄다(「셋」은 trio 규칙 컷에서). 
- 유아 앱(⑩·④·①)은 컷 자막이 그대로 나온다(기존 컷과 같음, 보호자 메뉴로 끔).
- 실기기 터치·가독성은 미확인(웹 캡처만). 미니 판 글자 없음(그림·이모지).
