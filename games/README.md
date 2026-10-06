# games/ — 기하학 가족 놀이터 (gf-game)
문서: `00_STORE_RESEARCH` 출시 경로 · `01`~`03` 기획 · **`04_SERIES_DESIGN` 1편 설계(기준)**

## 개발 실행
```
python -m http.server 8765            # 저장소 루트에서
http://localhost:8765/games/index.html
node games/tools/smoke.js             # 1·2장을 끝까지 자동 플레이 + 스크린샷(notes/snapshots/game_*.png)
python games/tools/gen_chars.py       # assets/*/manifest.json → data/chars.json
```
## 구조
`engine/gf.js` 공통 엔진(화면 스택·상단바·저장·소리·그림책·스테이지·스티커·부모 잠금) · `engine/modes/*.js` 게임 하나당 1파일(`GF.mode(name,{setup,free})`) · `data/*.json` 이야기·스테이지·스티커.
새 게임 = `modes/<name>.js` + `data/stages.json` 의 장 설정. 메뉴·UI·저장은 건드리지 않는다.

## 진행
- [x] 엔진 코어, 홈·지도·그림책·스테이지·놀이방·앨범·부모 메뉴
- [x] 1~5장 놀이(그림자·같은 얼굴·퍼즐·색칠·도형) + 그림책, 스모크 15스테이지 완주 + 별 규칙 단언
- [x] **1장 버티컬 슬라이스(QA 요청 중)**: 전체 화면 배경+안전 영역(가로·세로·탭), 자작 효과음 9종+BGM(`sound_test.html`), 손맛(집기·스냅 바운스·파티클·꽃가루·갸웃 복귀), 움직이는 배경, 그림책 말풍선 그림, 첫 3초 타이틀
- [ ] 3~5장·2장을 1장 규격으로 끌어올리기 (QA 통과 후)
- [ ] 음성 녹음 연결 · build.py(단일 HTML + WebP) · WebView APK · 스토어 패키지

## 검수 도구
```
node games/tools/smoke.js      # 5장 자동 플레이 + 스크린샷 + 별 규칙 단언
node games/tools/devices.js    # 기기 4종(412×915, 384×832, 탭 세로/가로) 스크린샷
games/sound_test.html          # 효과음·BGM 듣기 (자작 합성, SOUND_CREDITS.md)
python games/tools/make_audio.py   # 소리 다시 만들기
```
