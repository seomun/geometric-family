# UI 자산 도서관 — 출처·라이선스 (gf-asset, 2026-10-20 확인)

게임에 넣을 때는 이 표의 줄을 그 게임의 출처표에 옮긴다. 캐릭터 정본(`assets/<캐릭터>/`)과는 무관한 UI 부품·글꼴만 있다.

## Kenney (CC0 1.0 — 상업 이용·수정·재배포 가능, 표기 불필요)
원문: https://kenney.nl/support — "all game assets on the asset pages are public domain licensed (CC0)", "Attribution is not required". 팩마다 `kenney/LICENSE_<팩>.txt` 동봉.

| 폴더 | 팩(버전) | 원본 URL | 내용 | 쓸 곳 |
|---|---|---|---|---|
| `kenney/ui-pack-2.0_svg/` | UI Pack 2.0 (2024-06-12) | https://kenney.nl/assets/ui-pack | 버튼·패널·체크·슬라이더·화살표 SVG(파랑·초록·회색·빨강·노랑·추가) | 10앱 버튼·패널 모양 참고, 아이콘 기호 |
| `kenney/ui-pack-adventure_svg/` | UI Pack: Adventure | https://kenney.nl/assets/ui-pack-adventure | 양피지·나무 프레임 패널·리본 SVG | ⑪ 프레임 패널·리본 참고 |
| `kenney/ui-pack-rpg-expansion/` | UI Pack: RPG Expansion | https://kenney.nl/assets/ui-pack-rpg-expansion | 갈색·은 프레임, 바, 화살표 PNG | ⑪ HP 바·프레임 |
| `kenney/board-game-icons_svg/` | Board Game Icons | https://kenney.nl/assets/board-game-icons | 주사위·카드·말·자원 아이콘 SVG 256 | 재화·보상·아이템 아이콘 |
| `kenney/game-icons_white2x/` | Game Icons | https://kenney.nl/assets/game-icons | 설정·집·소리·잠금 등 흰 아이콘 PNG(2x) | 상단 바·설정 아이콘 |
| `kenney/particles_256/` | Particle Pack (투명판, 256px WebP 로 축소) | https://kenney.nl/assets/particle-pack | 별·반짝·빛·마법·불꽃·연기·베기 81장 | 이펙트 입자(⑪ 스킬·보스, 10앱 축하) |
원본 전체는 저장소 밖 `C:/projects/gf-asset-raw/kenney_ui/`.

## 글꼴 (SIL Open Font License 1.1 — Google Fonts 판, Reserved Font Name 없음)
원문: 각 `fonts/OFL_<글꼴>.txt` (google/fonts 저장소에서 받은 그대로). 저작권 줄에 "with Reserved Font Name" 이 **없다**(10/20 확인) → 서브셋·woff2 변환 뒤에도 이름 그대로 쓸 수 있다.
규칙(OFL FAQ https://openfontlicense.org/ofl-faq/): 폰트만 따로 팔지 않는다 · 앱에 넣을 때 OFL 전문을 함께 넣고(APK `licenses/`) 설정·크레딧에서 볼 수 있게 · 폰트로 만든 이미지·영상은 OFL 대상 아님.

| 파일 | 글꼴 | 원본 | 저작권 줄 | 쓸 곳 |
|---|---|---|---|---|
| `fonts/Jua-Regular.ttf` | 주아(Google Fonts 판) | https://github.com/google/fonts/tree/main/ofl/jua | Copyright 2018 The Jua Project Authors | 10앱 제목·버튼(지금 `--uk-font`) |
| `fonts/BagelFatOne-Regular.ttf` | Bagel Fat One | https://github.com/google/fonts/tree/main/ofl/bagelfatone | Copyright 2022 The Bagel Fat Project Authors | 10앱 숫자·점수·큰 제목 |
| `fonts/BlackHanSans-Regular.ttf` | 검은고딕(Black Han Sans) | https://github.com/google/fonts/tree/main/ofl/blackhansans | Copyright 2015 The Black Han Sans Project Authors | ⑪ 제목·데미지 숫자(지금 `--xi-title`) |
| `fonts/GasoekOne-Regular.ttf` | 가석(Gasoek One) | https://github.com/google/fonts/tree/main/ofl/gasoekone | Copyright 2022 The Gasoek Project Authors | ⑪ 로고·메인 타이틀 |
- 게임에 넣을 때는 쓰는 글자만 서브셋한 woff2(수십 KB)로 — 이 TTF 원본은 도서관 보관용.
- 쓰지 말 것: 쿠키런체(게임업계 금지), 넷마블체(임베드 사전 허가), 잘난체(수정 재배포 금지). 상세 `notes/ui_fonts.md`.

## 표기 필요(2순위 — 지금은 받지 않음)
| 소스 | 라이선스 | 표기 | 메모 |
|---|---|---|---|
| game-icons.net | CC BY 3.0 ("as long as you credit the original author") | 아이콘마다 작가 이름 | 스킬·속성 아이콘 4,000+. 쓰면 크레딧 화면에 "Icons made by {작가}. Available on https://game-icons.net" |
