# BGM 교체 후보 (2026-10-07 작가 판정: 합성 BGM 조잡 → 교체)

현재: `data/sounds.json` 의 `musicEnabled: false` 로 **BGM·소리 로고 전부 무음(효과음만)**. 교체 곡을 슬롯(`theme_main`·`theme_kids`·`night`·`lullaby`)에 넣고 `musicEnabled: true` 로 되돌린다.
라이선스는 **각 페이지에서 확인한 것만** 적었다(확인 일자 2026-10-07). 음질·분위기는 **작가가 직접 들어 보고 고른다** — 아래는 후보일 뿐 "고품질" 보증이 아니다.

## 확인된 후보 (OpenGameArt, 모두 상업 이용 가능)
| 곡 | 만든 이 | 라이선스 | 분위기 | 링크 | 쓸 자리 |
|---|---|---|---|---|---|
| Good Morning | Cakeflaps (You're Perfect Studio) | **CC0** (CC-BY 4.0·OGA-BY 3.0 중 선택 가능) | 귀엽고 짧은 루프, 아침 | https://opengameart.org/content/good-morning | 홈·메인 테마 |
| Wintery loop | Emma_MA | **CC0** (2017 공개) | 피아노·토이피아노·종, 차분 | https://opengameart.org/content/wintery-loop | 연말·밤 장면(캐럴풍이라 상시용은 부적합) |
| Two Simple Game Music Loops (menu / level) | qubodup | **CC0** | 단순·귀여움(메뉴 곡·놀이 곡 2개) | https://opengameart.org/node/174263 | 홈 / 놀이 중 |
| Gentle Lullaby Loop | Frances Calceta | **CC-BY 3.0 — 크레딧 필수** | 오르골 자장가 | https://opengameart.org/node/114070 | 4장 밤 / 자장가 |

크레딧이 필요한 곡은 앱 설정(부모 메뉴)이나 스토어 설명에 「Gentle Lullaby Loop — Frances Calceta, CC BY 3.0」 식으로 적어야 한다. CC0 곡은 필요 없지만 `SOUND_CREDITS.md` 에는 출처를 남긴다.

## 확인 못 한 것(후보 방향만 — 곡명·라이선스 직접 확인 필요)
- **Kevin MacLeod / incompetech.com**: CC BY 4.0(크레딧 필수, 상업 이용 가능), 2천 곡 이상. 곡 목록 페이지가 동적이라 이번에 곡명 확인 못 함 → 작가/허브가 사이트에서 'gentle·kids·lullaby' 필터로 직접 고르면 된다.
- 유료 라이브러리(TunePocket·MelodyLoops 등 검색에 나온 곳): 일회성 라이선스로 퍼블리셔 품질을 기대할 수 있으나 가격·약관은 직접 확인.
- 정말 "퍼블리셔 품질"이 목표면 **작곡가 의뢰(30~60초 루프 4곡, 자장가 1곡)** 가 가장 확실하다.

## 교체 절차
1. 곡 파일을 `games/audio/` 에 넣는다(루프는 WAV/OGG, 끝-처음 이음새 확인).
2. `data/sounds.json` music 슬롯의 `file` 교체, `musicEnabled: true`.
3. `games/SOUND_CREDITS.md` 에 곡명·작가·라이선스·링크 기록(크레딧 필수 곡은 앱 안에도).
4. `python games/tools/build.py` → 용량 확인(WAV 루프가 크면 OGG/MP3 변환).
