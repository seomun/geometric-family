# 소리 출처·라이선스

소리는 "자리(슬롯)"로 관리한다: `data/sounds.json` (id → file·볼륨·루프·fallback). 규칙은 `docs/16_SOUND.md`. 교체 = 같은 이름 파일을 덮어쓰거나 `file` 만 바꾸고, 이 표에 한 줄 추가. 코드 수정 없음. `games/sound_test.html` 이 sounds.json 을 읽어 전부 들려준다.

| 슬롯 | 파일 | 출처 | 라이선스 |
|---|---|---|---|
| sfx `tap` `pick` `drop` `ok` `hmm` `flip` `page` `star` `celebrate` `door` `tukdak` `shutter` `note1`~`note5` `snd_bell` `snd_drum` `snd_drop` `snd_gourd` `snd_clap` `snd_swallow` | `audio/*.wav` (같은 이름) | **Kenney.nl CC0 팩**을 `tools/make_sfx_cc0.py` 로 겹쳐·음높이 조절·음량 맞춤(아래 표). 2026-10-09 자작 합성음에서 교체 | **CC0 1.0** (상업 이용·재배포 가능, 표기 의무 없음 — 감사 표기는 함) |
| sfx `wind` `whistle` (`snd_wind` `snd_train` 은 같은 파일) | `audio/wind.wav` `audio/whistle.wav` | CC0 팩에 비슷한 소리가 없어 **자작 합성 유지**(① 5·6·7장에서만 쓰임). 대체 CC0 를 찾으면 교체 | 자작 |
| (보관) 이전 임시 자장가 | `audio/bgm.wav` | 같은 스크립트, 멜로디·화성 새로 작곡 — 슬롯에서는 빠짐 | 자작 |
| music `theme_main` `theme_kids` `logo_sting` **(임시)** | `audio/theme_main.wav` `audio/logo_sting.wav` (시안 A 를 22.05kHz 로 줄임) | `tools/make_theme.py` 합성·작곡 — 작가 판정 전 임시 연결(교체 가능) | 자작 |
| music `night` | (비어 있음 → `theme_kids` 로 대체) | 테마 채택 후 편곡 | — |
| music `theme_short` | (비어 있음) | 테마 채택 후 | — |
| voice `voice_*` 24개 | (비어 있음) | 작가 녹음 예정, 문장은 sounds.json 의 `text` | — |
| 테마 시안 A·B·C (미채택) | `media/theme_drafts.mp3` | `tools/make_theme.py` 직접 합성·작곡(기존 곡 인용 없음) | 자작 |

- 외부 CC0 소리로 교체하는 경우(예: Kenney) 파일명·URL·라이선스·내려받은 날짜를 표에 추가한다. 상업 이용 가능한 것만.
- 합성 소리는 사람 귀 검수 대상이다(허브·게임 세션은 직접 듣지 못함).


## Kenney CC0 원본 (2026-10-09, 허브 지시: 상업 이용 가능한 CC0 로 교체)
| 팩 | 주소 | 라이선스 | 쓴 슬롯 |
|---|---|---|---|
| Interface Sounds 1.0 | https://kenney.nl/assets/interface-sounds | CC0 1.0 (Kenney, www.kenney.nl) | tap pick drop ok hmm star celebrate door shutter note1~5 snd_bell snd_drop snd_gourd snd_swallow tukdak(반짝) |
| Impact Sounds | https://kenney.nl/assets/impact-sounds | CC0 1.0 | tukdak snd_drum snd_gourd snd_clap |
| RPG Audio | https://kenney.nl/assets/rpg-audio | CC0 1.0 | page(bookFlip) shutter(metalClick) |
| Casino Audio | https://kenney.nl/assets/casino-audio | CC0 1.0 | flip(card-slide) celebrate(cards-pack-open) |
- 원본 팩(라이선스 파일 포함)은 `notes/sfx_dl/`, 슬롯별 조각·시작 시각·반음·목표 음량은 `tools/make_sfx_cc0.py` 표에 그대로 있다(다시 만들기 `python tools/make_sfx_cc0.py`, 확인만 `--check`).
- **음량**: 모든 슬롯을 K-가중 통합 음량(LUFS, `pyloudnorm`)으로 맞췄다 — 탭류 −19~−21, 정답·별·완료 −14~−15(기쁜 순간이 분명히 들림), 피크 −1 dBFS 이하. 아주 짧은 소리는 피크 제한 때문에 목표보다 조금 낮다.
- **BGM·소리 로고**: `musicEnabled=false` 유지(무음). 잔잔한 CC0 루프를 쓰려면 후보를 작가가 판정한 뒤 `data/sounds.json` music 에 연결하고 이 표에 출처를 적는다(현재 후보 없음 — Kenney 에는 BGM 팩이 없고, 별도 CC0 음악은 출처 확인 필요).
