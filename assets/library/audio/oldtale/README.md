# 옛날이야기 소리 묶음 (gf-asset, 2026-10-27)

전부 직접 합성한 소리(CC0, 외부 녹음 없음). 게임 v2 와 같은 C 펜타토닉·같은 EQ·같은 잔향 → 한 가족처럼 들린다. 기준표: `docs/48_UNITY_STANDARD.md`. 도구: `tools/asset_oldtale_sound.py`(배경음·효과음·징글) · `tools/asset_sawsong.py`(톱질 노래).

| 폴더·파일 | 내용 |
|---|---|
| `bgm/` | 배경음 6곡(ogg, 이음새 없는 루프, −20 LUFS, 피크 −3dBFS): `village_peace` 45.7초 · `hungry_hut` 53.3초 · `swallow_flight` 48초 · `gourd_tension` 52.2초 · `nolbu_punish` 53.3초 · `feast` 45.7초(굿거리 12/8) |
| `sfx/` | 효과음 12종(ogg+wav, 피크 −6, 큰 소리 −4.5): saw · pour_rice · pop · gourd_split · swallow_wing · swallow_tweet · wind · footsteps · door · kid_laugh · nolbu_slip · treasure |
| `jingle.ogg/.wav` | 장면 전환·시리즈 로고 소리 2.9초 |
| `sawsong/` | 톱질 노래: `accomp_<템포>.ogg`(반주, 4마디 루프) · `melody_<템포>.ogg`(가락 안내용 멜로디) · `jjeok_finish.ogg`(「쩍!」 마무리) · `cues.json`(음절별 시각) |
| `levels.json` | 길이·음량·피크 표 |

## 톱질 노래 쓰는 법
- 사설 「시르렁 실근 톱질이야, 에이여루 당거주소」(전래), 가락은 우리가 새로 지은 4마디 — 굿거리 12/8, 계면조 느낌(E4 A4 B4 C5). 글자 하나 = 8분음표 2개.
- 템포 66·72·80·88(점4분음표 분당 박수). 박마다 같은 4마디를 반복: 72 → 72 → 80 → 88 순으로 이어 붙이고 끝에 `jjeok_finish.ogg`(장구 몰아치기 + 박 갈라지는 소리).
- 반주는 가야금 뜯는 소리 + 장구 「덩 — 기덕 쿵 더러러 | 쿵 — 기덕 쿵 더러러」. 멜로디 선(대금)은 목소리를 얹을 때 길잡이로 쓰고, 최종 영상에서는 빼도 된다.
- `cues.json`: 템포별로 `loop_sec`·`bar_sec`·`cues[]`(t=루프 시작부터 초, note, syl=글자, dur). 가락에 시(B4)가 있는 건 계면조라서이고, 반주에는 쓰지 않았다.
- 명창 음반·현대 채보·편곡은 쓰지 않았다(전래 어법으로 새로 지음).

## 5화 「브레멘 음악대」 (2026-10-29) — `ep05/`
`ep05/sfx/` 6종(ogg+wav, 피크 −6.6 이하): donkey_hee 히힝 · dog_woof 멍멍 · cat_meow 야옹 · rooster_crow 꼬끼오 · band_ruckus 악기 우당탕 소란 · robber_run 후다닥 도망. `ep05/bgm/bremen_march.ogg` 36.9초 이음새 없는 루프(−20 LUFS, C 펜타토닉, 104 BPM). 4화와 같은 VSCO 2 CE 오케스트라 샘플러(CC0), 도구 `tools/asset_orch_ep5.py`. 작가 「집에서 편히」 규칙에 맞춰 큰 소리·번쩍임 없음. 들어 보기 `content/promo/ep5_sound_v1.mp3`. 수치만 쟀고 귀로는 아직 듣지 못함.
