# 소리 출처·라이선스

소리는 "자리(슬롯)"로 관리한다: `data/sounds.json` (id → file·볼륨·루프·fallback). 규칙은 `docs/16_SOUND.md`. 교체 = 같은 이름 파일을 덮어쓰거나 `file` 만 바꾸고, 이 표에 한 줄 추가. 코드 수정 없음. `games/sound_test.html` 이 sounds.json 을 읽어 전부 들려준다.

| 슬롯 | 파일 | 출처 | 라이선스 |
|---|---|---|---|
| sfx `tap` `pick` `drop` `ok` `celebrate` `hmm` `flip` `star` `page` `wind` `door` | `audio/*.wav` | `tools/make_audio.py` 로 **직접 합성**(마림바·글로켄슈필·뮤직박스 음색 모델 + 룸 리버브, 외부 샘플 없음) | 자작 |
| music `theme_kids` (임시 자장가) | `audio/bgm.wav` | 같은 스크립트, 멜로디·화성 새로 작곡 | 자작 |
| music `theme_main` `night` | (비어 있음 → `theme_kids` 로 대체) | 테마 채택 후 편곡 | — |
| music `theme_short` `logo_sting` | (비어 있음) | 테마 채택 후 | — |
| voice `voice_*` 24개 | (비어 있음) | 작가 녹음 예정, 문장은 sounds.json 의 `text` | — |
| 테마 시안 A·B·C (미채택) | `media/theme_drafts.mp3` | `tools/make_theme.py` 직접 합성·작곡(기존 곡 인용 없음) | 자작 |

- 외부 CC0 소리로 교체하는 경우(예: Kenney) 파일명·URL·라이선스·내려받은 날짜를 표에 추가한다. 상업 이용 가능한 것만.
- 합성 소리는 사람 귀 검수 대상이다(허브·게임 세션은 직접 듣지 못함).
