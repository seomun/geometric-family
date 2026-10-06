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
- [x] 1장 그림자 찾기 · 2장 같은 얼굴 (3스테이지 × 3라운드, 힌트·적응형·별·스티커)
- [ ] 3장 퍼즐 · 4장 색칠(칸 채우기 시험) · 5장 도형 · 3~5장 그림책
- [ ] 소리 녹음 슬롯 · build.py(단일 HTML + WebP) · WebView APK
