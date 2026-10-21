# 효과음·배경음 도서관 카탈로그 (gf-asset)

만든 날 2026-10-20 · `python -I tools/asset_build.py C:/projects/gf-asset-raw` 가 만든다(손으로 고치지 말 것). 듣기: [listen.html](listen.html).

- **전부 CC0 1.0**(Kenney · OpenGameArt CC0 · Freesound CC0) — 상업 이용·수정·재배포 가능, **표기 불필요**(감사 표기는 자유). 출처·원문 = `notes/asset_sources.md`.
- ★ = 선별(분류마다 3개, OGG+MP3). 나머지 = 후보(OGG 만). **순위는 기계 점수**(길이 적합·어택 빠르기·밝기 대역·끝 잘림·클리핑·원음 표본율·Kenney 결 가점)라 귀 판정 전 초안이다.
- 효과음은 모노 44.1kHz, 앞 무음 제거(누르자마자 소리), 끝 20ms 페이드, 분류별 LUFS 목표(UI −20 · 퍼즐 −19~−15 · 타격 −16~−13 · 보상 −15 · 실패 −18 · 환경 −24 · 배경음 −18), 피크 −1 dBFS 이하. 짧은 타격은 앞보기 리미터로 최대 9 dB 까지 피크를 눌러 「작게 들리는」 문제를 줄였다.
- ⚠️ 0.15초보다 짧은 소리(탭·클릭)는 LUFS 측정창(0.4초)보다 짧아 숫자가 −25~−31 로 낮게 찍힌다. 실제로는 피크 −1 dBFS 까지 올라가 있어 귀로는 충분히 크다 — 이 칸은 피크로 판단.
- 게임에 넣을 때: 파일을 각 게임 폴더로 복사하고 그 게임의 출처표(`games/SOUND_CREDITS.md` 또는 `games/audio/exp/CREDITS.md`)에 이 표의 출처 한 줄을 옮긴다.


## UI

| 칸 | ★ | 파일 | 길이 s | LUFS | 피크 | 점수 | 원본(팩/파일) | 작성자 | 추천 용도 |
|---|---|---|---|---|---|---|---|---|---|
| UI 탭 | ★1 | `ui/ui_tap__s1-c01_click3.ogg` | 0.082 | -31.5 | -1.0 | -0.422 | kenney_ui-audio / Audio/click3.ogg | Kenney | 모든 앱 버튼·탭(10앱 tap, ⑪ xs_ui) |
| UI 탭 | ★2 | `ui/ui_tap__s2-c02_click1.ogg` | 0.091 | -25.4 | -1.0 | -0.511 | kenney_ui-audio / Audio/click1.ogg | Kenney | 모든 앱 버튼·탭(10앱 tap, ⑪ xs_ui) |
| UI 탭 | ★3 | `ui/ui_tap__s3-c03_click-001.ogg` | 0.097 | -31.5 | -1.0 | -0.573 | kenney_interface-sounds / Audio/click_001.ogg | Kenney | 모든 앱 버튼·탭(10앱 tap, ⑪ xs_ui) |
| UI 탭 |  | `ui/ui_tap__c04_rollover5.ogg` | 0.109 | -24.7 | -1.0 | -0.686 | kenney_ui-audio / Audio/rollover5.ogg | Kenney | 모든 앱 버튼·탭(10앱 tap, ⑪ xs_ui) |
| UI 탭 |  | `ui/ui_tap__c05_buttons-sounds-button11.ogg` | 0.093 | -20.0 | -9.7 | -0.751 | 512-sound-effects-8-bit-style / a_General Sounds_Buttons_sfx_sounds_button11.wav | SubspaceAudio | 모든 앱 버튼·탭(10앱 tap, ⑪ xs_ui) |
| UI 탭 |  | `ui/ui_tap__c06_buttons-sounds-button10.ogg` | 0.067 | -20.0 | -10.6 | -0.85 | 512-sound-effects-8-bit-style / a_General Sounds_Buttons_sfx_sounds_button10.wav | SubspaceAudio | 모든 앱 버튼·탭(10앱 tap, ⑪ xs_ui) |
| UI 탭 |  | `ui/ui_tap__c07_buttons-sounds-button12.ogg` | 0.193 | -20.0 | -1.0 | -0.881 | 512-sound-effects-8-bit-style / a_General Sounds_Buttons_sfx_sounds_button12.wav | SubspaceAudio | 모든 앱 버튼·탭(10앱 tap, ⑪ xs_ui) |
| UI 탭 |  | `ui/ui_tap__c08_select-001.ogg` | 0.04 | -24.4 | -1.0 | -0.971 | kenney_interface-sounds / Audio/select_001.ogg | Kenney | 모든 앱 버튼·탭(10앱 tap, ⑪ xs_ui) |
| UI 탭 |  | `ui/ui_tap__c09_select-002.ogg` | 0.04 | -25.0 | -1.0 | -0.971 | kenney_interface-sounds / Audio/select_002.ogg | Kenney | 모든 앱 버튼·탭(10앱 tap, ⑪ xs_ui) |
| UI 탭 |  | `ui/ui_tap__c10_869217-014-ui-game-sfx.ogg` | 0.118 | -20.0 | -7.0 | -1.102 | ui-click / 869217_014-UI-Game-SFX.ogg | SignatureSoundsOrg | 모든 앱 버튼·탭(10앱 tap, ⑪ xs_ui) |
| UI 확인 | ★1 | `ui/ui_confirm__s1-c01_switch10.ogg` | 0.189 | -26.4 | -1.0 | 0.203 | kenney_ui-audio / Audio/switch10.ogg | Kenney | 확인·결정 버튼, 판 시작(⑪ xs_ui_good) |
| UI 확인 | ★2 | `ui/ui_confirm__s2-c02_switch17.ogg` | 0.257 | -25.3 | -1.0 | 0.2 | kenney_ui-audio / Audio/switch17.ogg | Kenney | 확인·결정 버튼, 판 시작(⑪ xs_ui_good) |
| UI 확인 |  | `ui/ui_confirm__c03_switch8.ogg` | 0.145 | -27.6 | -1.0 | 0.197 | kenney_ui-audio / Audio/switch8.ogg | Kenney | 확인·결정 버튼, 판 시작(⑪ xs_ui_good) |
| UI 확인 | ★3 | `ui/ui_confirm__s3-c04_confirmation-003.ogg` | 0.322 | -19.0 | -4.0 | 0.167 | kenney_interface-sounds / Audio/confirmation_003.ogg | Kenney | 확인·결정 버튼, 판 시작(⑪ xs_ui_good) |
| UI 확인 |  | `ui/ui_confirm__c05_confirmation-002.ogg` | 0.539 | -19.0 | -6.7 | -0.182 | kenney_interface-sounds / Audio/confirmation_002.ogg | Kenney | 확인·결정 버튼, 판 시작(⑪ xs_ui_good) |
| UI 확인 |  | `ui/ui_confirm__c06_positive-sounds-sounds-powerup8.ogg` | 0.394 | -19.0 | -14.6 | -0.718 | 512-sound-effects-8-bit-style / l Sounds_Positive Sounds_sfx_sounds_powerup8.wav | SubspaceAudio | 확인·결정 버튼, 판 시작(⑪ xs_ui_good) |
| UI 확인 |  | `ui/ui_confirm__c07_positive-sounds-sounds-powerup6.ogg` | 0.294 | -19.0 | -14.2 | -0.774 | 512-sound-effects-8-bit-style / l Sounds_Positive Sounds_sfx_sounds_powerup6.wav | SubspaceAudio | 확인·결정 버튼, 판 시작(⑪ xs_ui_good) |
| UI 확인 |  | `ui/ui_confirm__c08_positive-sounds-sounds-powerup3.ogg` | 0.418 | -19.0 | -13.7 | -0.778 | 512-sound-effects-8-bit-style / l Sounds_Positive Sounds_sfx_sounds_powerup3.wav | SubspaceAudio | 확인·결정 버튼, 판 시작(⑪ xs_ui_good) |
| UI 확인 |  | `ui/ui_confirm__c09_confirmation-001.ogg` | 0.29 | -19.0 | -4.5 | -0.959 | kenney_interface-sounds / Audio/confirmation_001.ogg | Kenney | 확인·결정 버튼, 판 시작(⑪ xs_ui_good) |
| UI 확인 |  | `ui/ui_confirm__c10_717771-victory-chime.ogg` | 0.808 | -19.0 | -12.7 | -1.437 | success-chime / 717771_victory-chime.ogg | 1bob | 확인·결정 버튼, 판 시작(⑪ xs_ui_good) |
| UI 취소 | ★1 | `ui/ui_cancel__s1-c01_neutral-sounds-sound-neutral2.ogg` | 0.318 | -20.0 | -6.4 | -0.241 | 512-sound-effects-8-bit-style / ral Sounds_Neutral Sounds_sfx_sound_neutral2.wav | SubspaceAudio | 뒤로·닫기(⑪ xs_ui_back) |
| UI 취소 | ★2 | `ui/ui_cancel__s2-c02_neutral-sounds-sound-neutral11.ogg` | 0.32 | -20.0 | -5.8 | -0.247 | 512-sound-effects-8-bit-style / al Sounds_Neutral Sounds_sfx_sound_neutral11.wav | SubspaceAudio | 뒤로·닫기(⑪ xs_ui_back) |
| UI 취소 | ★3 | `ui/ui_cancel__s3-c03_minimize-003.ogg` | 0.212 | -20.0 | -1.0 | -0.251 | kenney_interface-sounds / Audio/minimize_003.ogg | Kenney | 뒤로·닫기(⑪ xs_ui_back) |
| UI 취소 |  | `ui/ui_cancel__c04_minimize-002.ogg` | 0.258 | -20.0 | -9.9 | -0.381 | kenney_interface-sounds / Audio/minimize_002.ogg | Kenney | 뒤로·닫기(⑪ xs_ui_back) |
| UI 취소 |  | `ui/ui_cancel__c05_minimize-001.ogg` | 0.258 | -20.0 | -7.2 | -0.425 | kenney_interface-sounds / Audio/minimize_001.ogg | Kenney | 뒤로·닫기(⑪ xs_ui_back) |
| UI 취소 |  | `ui/ui_cancel__c06_neutral-sounds-sound-neutral10.ogg` | 0.471 | -20.0 | -10.4 | -0.903 | 512-sound-effects-8-bit-style / al Sounds_Neutral Sounds_sfx_sound_neutral10.wav | SubspaceAudio | 뒤로·닫기(⑪ xs_ui_back) |
| UI 팝업 | ★1 | `ui/ui_popup__s1-c01_pause-sounds-sounds-pause5-out.ogg` | 0.451 | -20.0 | -6.1 | -0.408 | 512-sound-effects-8-bit-style / al Sounds_Pause Sounds_sfx_sounds_pause5_out.wav | SubspaceAudio | 창·카드 열림, 결과 창 등장(⑪ xs_ui_open) |
| UI 팝업 | ★2 | `ui/ui_popup__s2-c02_pause-sounds-sounds-pause7-out.ogg` | 0.516 | -20.0 | -9.2 | -0.542 | 512-sound-effects-8-bit-style / al Sounds_Pause Sounds_sfx_sounds_pause7_out.wav | SubspaceAudio | 창·카드 열림, 결과 창 등장(⑪ xs_ui_open) |
| UI 팝업 |  | `ui/ui_popup__c03_pause-sounds-sounds-pause7-in.ogg` | 0.52 | -20.0 | -9.4 | -0.55 | 512-sound-effects-8-bit-style / ral Sounds_Pause Sounds_sfx_sounds_pause7_in.wav | SubspaceAudio | 창·카드 열림, 결과 창 등장(⑪ xs_ui_open) |
| UI 팝업 | ★3 | `ui/ui_popup__s3-c04_maximize-009.ogg` | 0.222 | -20.0 | -6.7 | -0.704 | kenney_interface-sounds / Audio/maximize_009.ogg | Kenney | 창·카드 열림, 결과 창 등장(⑪ xs_ui_open) |
| UI 팝업 |  | `ui/ui_popup__c05_maximize-007.ogg` | 0.183 | -20.0 | -6.6 | -0.828 | kenney_interface-sounds / Audio/maximize_007.ogg | Kenney | 창·카드 열림, 결과 창 등장(⑪ xs_ui_open) |
| UI 팝업 |  | `ui/ui_popup__c06_maximize-006.ogg` | 0.38 | -20.0 | -4.5 | -1.789 | kenney_interface-sounds / Audio/maximize_006.ogg | Kenney | 창·카드 열림, 결과 창 등장(⑪ xs_ui_open) |

## 퍼즐

| 칸 | ★ | 파일 | 길이 s | LUFS | 피크 | 점수 | 원본(팩/파일) | 작성자 | 추천 용도 |
|---|---|---|---|---|---|---|---|---|---|
| 퍼즐 집기 | ★1 | `puzzle/pz_pick__s1-c01_pluck-002.ogg` | 0.162 | -22.5 | -1.0 | -0.068 | kenney_interface-sounds / Audio/pluck_002.ogg | Kenney | 조각·구슬 집기(⑪ xs_grab, 10앱 pick) |
| 퍼즐 집기 | ★2 | `puzzle/pz_pick__s2-c02_chip-lay-1.ogg` | 0.13 | -24.8 | -1.0 | -0.233 | kenney_casino-audio / Audio/chip-lay-1.ogg | Kenney | 조각·구슬 집기(⑪ xs_grab, 10앱 pick) |
| 퍼즐 집기 | ★3 | `puzzle/pz_pick__s3-c03_pluck-001.ogg` | 0.1 | -24.2 | -1.0 | -0.513 | kenney_interface-sounds / Audio/pluck_001.ogg | Kenney | 조각·구슬 집기(⑪ xs_grab, 10앱 pick) |
| 퍼즐 집기 |  | `puzzle/pz_pick__c04_chip-lay-2.ogg` | 0.227 | -28.4 | -1.0 | -0.628 | kenney_casino-audio / Audio/chip-lay-2.ogg | Kenney | 조각·구슬 집기(⑪ xs_grab, 10앱 pick) |
| 퍼즐 집기 |  | `puzzle/pz_pick__c05_impactwood-light-000.ogg` | 0.263 | -24.1 | -1.0 | -0.822 | kenney_impact-sounds / Audio/impactWood_light_000.ogg | Kenney | 조각·구슬 집기(⑪ xs_grab, 10앱 pick) |
| 퍼즐 집기 |  | `puzzle/pz_pick__c06_impactwood-light-002.ogg` | 0.263 | -23.9 | -1.0 | -0.878 | kenney_impact-sounds / Audio/impactWood_light_002.ogg | Kenney | 조각·구슬 집기(⑪ xs_grab, 10앱 pick) |
| 퍼즐 집기 |  | `puzzle/pz_pick__c07_impactwood-light-004.ogg` | 0.263 | -26.7 | -1.0 | -0.891 | kenney_impact-sounds / Audio/impactWood_light_004.ogg | Kenney | 조각·구슬 집기(⑪ xs_grab, 10앱 pick) |
| 퍼즐 집기 |  | `puzzle/pz_pick__c08_chip-lay-3.ogg` | 0.263 | -26.9 | -1.0 | -0.91 | kenney_casino-audio / Audio/chip-lay-3.ogg | Kenney | 조각·구슬 집기(⑪ xs_grab, 10앱 pick) |
| 퍼즐 집기 |  | `puzzle/pz_pick__c09_select-003.ogg` | 0.256 | -19.0 | -3.8 | -0.911 | kenney_interface-sounds / Audio/select_003.ogg | Kenney | 조각·구슬 집기(⑪ xs_grab, 10앱 pick) |
| 퍼즐 집기 |  | `puzzle/pz_pick__c10_draw.ogg` | 0.17 | -21.8 | -1.0 | -2.099 | card-game-sounds / cockatrice_draw.wav | HaelDB | 조각·구슬 집기(⑪ xs_grab, 10앱 pick) |
| 퍼즐 놓기 | ★1 | `puzzle/pz_drop__s1-c01_impactgeneric-light-002.ogg` | 0.161 | -26.0 | -1.0 | 0.181 | kenney_impact-sounds / Audio/impactGeneric_light_002.ogg | Kenney | 조각 놓기·자리 맞춤(⑪ xs_release, 10앱 drop) |
| 퍼즐 놓기 | ★2 | `puzzle/pz_drop__s2-c02_impactgeneric-light-004.ogg` | 0.137 | -26.6 | -1.0 | 0.181 | kenney_impact-sounds / Audio/impactGeneric_light_004.ogg | Kenney | 조각 놓기·자리 맞춤(⑪ xs_release, 10앱 drop) |
| 퍼즐 놓기 |  | `puzzle/pz_drop__c03_impactgeneric-light-000.ogg` | 0.161 | -24.7 | -1.0 | 0.174 | kenney_impact-sounds / Audio/impactGeneric_light_000.ogg | Kenney | 조각 놓기·자리 맞춤(⑪ xs_release, 10앱 drop) |
| 퍼즐 놓기 | ★3 | `puzzle/pz_drop__s3-c04_drop-002.ogg` | 0.188 | -22.1 | -1.0 | 0.008 | kenney_interface-sounds / Audio/drop_002.ogg | Kenney | 조각 놓기·자리 맞춤(⑪ xs_release, 10앱 drop) |
| 퍼즐 놓기 |  | `puzzle/pz_drop__c05_drop-003.ogg` | 0.188 | -21.9 | -1.0 | 0.008 | kenney_interface-sounds / Audio/drop_003.ogg | Kenney | 조각 놓기·자리 맞춤(⑪ xs_release, 10앱 drop) |
| 퍼즐 놓기 |  | `puzzle/pz_drop__c06_drop-001.ogg` | 0.132 | -24.0 | -1.0 | -0.06 | kenney_interface-sounds / Audio/drop_001.ogg | Kenney | 조각 놓기·자리 맞춤(⑪ xs_release, 10앱 drop) |
| 퍼즐 놓기 |  | `puzzle/pz_drop__c07_chips-stack-2.ogg` | 0.165 | -29.4 | -1.0 | -0.156 | kenney_casino-audio / Audio/chips-stack-2.ogg | Kenney | 조각 놓기·자리 맞춤(⑪ xs_release, 10앱 drop) |
| 퍼즐 놓기 |  | `puzzle/pz_drop__c08_chips-stack-6.ogg` | 0.149 | -26.6 | -1.0 | -0.288 | kenney_casino-audio / Audio/chips-stack-6.ogg | Kenney | 조각 놓기·자리 맞춤(⑪ xs_release, 10앱 drop) |
| 퍼즐 놓기 |  | `puzzle/pz_drop__c09_chips-stack-5.ogg` | 0.152 | -27.7 | -1.0 | -0.315 | kenney_casino-audio / Audio/chips-stack-5.ogg | Kenney | 조각 놓기·자리 맞춤(⑪ xs_release, 10앱 drop) |
| 퍼즐 놓기 |  | `puzzle/pz_drop__c10_plop-01.ogg` | 0.252 | -28.9 | -1.0 | -0.693 | 100-cc0-sfx / plop_01.ogg | rubberduck | 조각 놓기·자리 맞춤(⑪ xs_release, 10앱 drop) |
| 터짐 작게 | ★1 | `puzzle/pz_pop_s__s1-c01_glass-002.ogg` | 0.122 | -20.9 | -1.0 | 0.209 | kenney_interface-sounds / Audio/glass_002.ogg | Kenney | 3개 맞춤 터짐(⑪ xs_pop1) |
| 터짐 작게 | ★2 | `puzzle/pz_pop_s__s2-c02_733264-bubble-pop.ogg` | 0.147 | -18.4 | -1.0 | -0.491 | bubble-pop / 733264_Bubble-Pop.ogg | arttim | 3개 맞춤 터짐(⑪ xs_pop1) |
| 터짐 작게 | ★3 | `puzzle/pz_pop_s__s3-c03_glass-001.ogg` | 0.276 | -17.8 | -1.0 | -0.59 | kenney_interface-sounds / Audio/glass_001.ogg | Kenney | 3개 맞춤 터짐(⑪ xs_pop1) |
| 터짐 작게 |  | `puzzle/pz_pop_s__c04_253956-bubble-pop.ogg` | 0.209 | -23.8 | -1.0 | -0.624 | bubble-pop / 253956_Bubble-Pop.ogg | Mafon2 | 3개 맞춤 터짐(⑪ xs_pop1) |
| 터짐 작게 |  | `puzzle/pz_pop_s__c05_glass-003.ogg` | 0.121 | -17.5 | -1.0 | -0.716 | kenney_interface-sounds / Audio/glass_003.ogg | Kenney | 3개 맞춤 터짐(⑪ xs_pop1) |
| 터짐 작게 |  | `puzzle/pz_pop_s__c06_439184-pop-1-ogg.ogg` | 0.11 | -22.6 | -1.0 | -0.826 | bubble-pop / 439184_Pop-1-ogg.ogg | FourthWoods | 3개 맞춤 터짐(⑪ xs_pop1) |
| 터짐 작게 |  | `puzzle/pz_pop_s__c07_plop-01.ogg` | 0.252 | -28.9 | -1.0 | -0.916 | 100-cc0-sfx / plop_01.ogg | rubberduck | 3개 맞춤 터짐(⑪ xs_pop1) |
| 터짐 작게 |  | `puzzle/pz_pop_s__c08_pop.ogg` | 0.132 | -20.2 | -1.0 | -0.921 | bubbles-pop / pop.ogg | farfadet46 | 3개 맞춤 터짐(⑪ xs_pop1) |
| 터짐 작게 |  | `puzzle/pz_pop_s__c09_untap.ogg` | 0.25 | -17.0 | -1.3 | -2.317 | card-game-sounds / cockatrice_untap.wav | HaelDB | 3개 맞춤 터짐(⑪ xs_pop1) |
| 터짐 작게 |  | `puzzle/pz_pop_s__c10_plop-02.ogg` | 0.233 | -25.0 | -1.0 | -2.846 | 100-cc0-sfx / plop_02.ogg | rubberduck | 3개 맞춤 터짐(⑪ xs_pop1) |
| 터짐 중간 | ★1 | `puzzle/pz_pop_m__s1-c01_669918-the-best-bubble-pop-sound-for-gam.ogg` | 0.271 | -16.4 | -1.0 | -0.03 | bubble-pop / 918_The-Best-Bubble-Pop-Sound-For-Game-and-U.ogg | el_boss | 4개 맞춤(⑪ xs_pop2) |
| 터짐 중간 | ★2 | `puzzle/pz_pop_m__s2-c02_item-gem-03.ogg` | 0.208 | -25.6 | -1.0 | -0.041 | 80-cc0-rpg-sfx / item_gem_03.ogg | rubberduck | 4개 맞춤(⑪ xs_pop2) |
| 터짐 중간 | ★3 | `puzzle/pz_pop_m__s3-c03_impactglass-light-000.ogg` | 0.231 | -20.1 | -1.0 | -0.107 | kenney_impact-sounds / Audio/impactGlass_light_000.ogg | Kenney | 4개 맞춤(⑪ xs_pop2) |
| 터짐 중간 |  | `puzzle/pz_pop_m__c04_impactglass-light-001.ogg` | 0.207 | -20.4 | -1.0 | -0.107 | kenney_impact-sounds / Audio/impactGlass_light_001.ogg | Kenney | 4개 맞춤(⑪ xs_pop2) |
| 터짐 중간 |  | `puzzle/pz_pop_m__c05_impactglass-light-002.ogg` | 0.207 | -19.4 | -1.0 | -0.107 | kenney_impact-sounds / Audio/impactGlass_light_002.ogg | Kenney | 4개 맞춤(⑪ xs_pop2) |
| 터짐 중간 |  | `puzzle/pz_pop_m__c06_762781-bubblepopping.ogg` | 0.325 | -19.6 | -1.0 | -0.182 | bubble-pop / 762781_BubblePopping.ogg | Sess8it | 4개 맞춤(⑪ xs_pop2) |
| 터짐 중간 |  | `puzzle/pz_pop_m__c07_item-gem-01.ogg` | 0.242 | -23.9 | -1.0 | -0.194 | 80-cc0-rpg-sfx / item_gem_01.ogg | rubberduck | 4개 맞춤(⑪ xs_pop2) |
| 터짐 중간 |  | `puzzle/pz_pop_m__c08_glass-02.ogg` | 0.365 | -16.3 | -1.0 | -0.199 | 100-cc0-sfx / glass_02.ogg | rubberduck | 4개 맞춤(⑪ xs_pop2) |
| 터짐 중간 |  | `puzzle/pz_pop_m__c09_253956-bubble-pop.ogg` | 0.209 | -23.8 | -1.0 | -0.292 | bubble-pop / 253956_Bubble-Pop.ogg | Mafon2 | 4개 맞춤(⑪ xs_pop2) |
| 터짐 중간 |  | `puzzle/pz_pop_m__c10_glass-01.ogg` | 0.388 | -16.3 | -1.0 | -0.379 | 100-cc0-sfx / glass_01.ogg | rubberduck | 4개 맞춤(⑪ xs_pop2) |
| 터짐 크게 | ★1 | `puzzle/pz_pop_l__s1-c01_impactbell-heavy-003.ogg` | 0.654 | -21.7 | -1.0 | -0.018 | kenney_impact-sounds / Audio/impactBell_heavy_003.ogg | Kenney | 5개 이상·특수 터짐(⑪ xs_pop3·xs_shatter) |
| 터짐 크게 | ★2 | `puzzle/pz_pop_l__s2-c02_bfh1-glass-breaking-03.ogg` | 0.654 | -21.9 | -1.0 | -0.043 | 75-cc0-breaking-falling-hit-sfx / bfh1_glass_breaking_03.ogg | rubberduck | 5개 이상·특수 터짐(⑪ xs_pop3·xs_shatter) |
| 터짐 크게 | ★3 | `puzzle/pz_pop_l__s3-c03_bfh1-glass-breaking-04.ogg` | 0.648 | -15.8 | -1.0 | -0.047 | 75-cc0-breaking-falling-hit-sfx / bfh1_glass_breaking_04.ogg | rubberduck | 5개 이상·특수 터짐(⑪ xs_pop3·xs_shatter) |
| 터짐 크게 |  | `puzzle/pz_pop_l__c04_bfh1-glass-breaking-01.ogg` | 0.532 | -15.8 | -1.0 | -0.05 | 75-cc0-breaking-falling-hit-sfx / bfh1_glass_breaking_01.ogg | rubberduck | 5개 이상·특수 터짐(⑪ xs_pop3·xs_shatter) |
| 터짐 크게 |  | `puzzle/pz_pop_l__c05_impactbell-heavy-002.ogg` | 0.697 | -22.2 | -1.0 | -0.336 | kenney_impact-sounds / Audio/impactBell_heavy_002.ogg | Kenney | 5개 이상·특수 터짐(⑪ xs_pop3·xs_shatter) |
| 터짐 크게 |  | `puzzle/pz_pop_l__c06_fw-05.ogg` | 1.136 | -30.4 | -1.0 | -0.351 | 25-cc0-bang-firework-sfx / fw_05.ogg | rubberduck | 5개 이상·특수 터짐(⑪ xs_pop3·xs_shatter) |
| 터짐 크게 |  | `puzzle/pz_pop_l__c07_impactglass-heavy-001.ogg` | 0.429 | -28.4 | -1.0 | -0.373 | kenney_impact-sounds / Audio/impactGlass_heavy_001.ogg | Kenney | 5개 이상·특수 터짐(⑪ xs_pop3·xs_shatter) |
| 터짐 크게 |  | `puzzle/pz_pop_l__c08_fw-03.ogg` | 1.156 | -20.5 | -1.0 | -0.502 | 25-cc0-bang-firework-sfx / fw_03.ogg | rubberduck | 5개 이상·특수 터짐(⑪ xs_pop3·xs_shatter) |
| 터짐 크게 |  | `puzzle/pz_pop_l__c09_fw-06.ogg` | 1.248 | -21.4 | -1.0 | -0.54 | 25-cc0-bang-firework-sfx / fw_06.ogg | rubberduck | 5개 이상·특수 터짐(⑪ xs_pop3·xs_shatter) |
| 터짐 크게 |  | `puzzle/pz_pop_l__c10_gong-01.ogg` | 1.424 | -15.2 | -1.0 | -0.577 | 100-cc0-sfx / gong_01.ogg | rubberduck | 5개 이상·특수 터짐(⑪ xs_pop3·xs_shatter) |
| 콤보 상승 | ★1 | `puzzle/pz_combo__s1-c01_phaserup3.ogg` | 0.455 | -15.0 | -1.3 | 0.207 | kenney_digital-audio / Audio/phaserUp3.ogg | Kenney | 콤보 단계 상승, 음높이 올려 연속 사용(⑪ xs_combo) |
| 콤보 상승 | ★2 | `puzzle/pz_combo__s2-c02_powerup7.ogg` | 0.41 | -15.0 | -2.6 | 0.207 | kenney_digital-audio / Audio/powerUp7.ogg | Kenney | 콤보 단계 상승, 음높이 올려 연속 사용(⑪ xs_combo) |
| 콤보 상승 |  | `puzzle/pz_combo__c03_powerup2.ogg` | 0.331 | -15.4 | -1.0 | 0.188 | kenney_digital-audio / Audio/powerUp2.ogg | Kenney | 콤보 단계 상승, 음높이 올려 연속 사용(⑪ xs_combo) |
| 콤보 상승 | ★3 | `puzzle/pz_combo__s3-c04_power-up-01.ogg` | 0.466 | -15.0 | -9.2 | -0.002 | 50-cc0-retro-synth-sfx / power_up_01.ogg | rubberduck | 콤보 단계 상승, 음높이 올려 연속 사용(⑪ xs_combo) |
| 콤보 상승 |  | `puzzle/pz_combo__c05_power-up-04.ogg` | 0.467 | -15.0 | -9.4 | -0.077 | 50-cc0-retro-synth-sfx / power_up_04.ogg | rubberduck | 콤보 단계 상승, 음높이 올려 연속 사용(⑪ xs_combo) |
| 콤보 상승 |  | `puzzle/pz_combo__c06_869689-ps1-pick-up-sfx-20.ogg` | 0.484 | -15.5 | -1.0 | -0.122 | power-up / 869689_PS1-Pick-up-SFX-20.ogg | SignatureSoundsOrg | 콤보 단계 상승, 음높이 올려 연속 사용(⑪ xs_combo) |
| 콤보 상승 |  | `puzzle/pz_combo__c07_869684-ps1-pick-up-sfx-16.ogg` | 0.464 | -15.5 | -1.0 | -0.188 | power-up / 869684_PS1-Pick-up-SFX-16.ogg | SignatureSoundsOrg | 콤보 단계 상승, 음높이 올려 연속 사용(⑪ xs_combo) |
| 콤보 상승 |  | `puzzle/pz_combo__c08_power-up-05.ogg` | 0.391 | -15.0 | -2.4 | -0.228 | 50-cc0-retro-synth-sfx / power_up_05.ogg | rubberduck | 콤보 단계 상승, 음높이 올려 연속 사용(⑪ xs_combo) |
| 콤보 상승 |  | `puzzle/pz_combo__c09_positive-sounds-sounds-powerup4.ogg` | 0.738 | -15.0 | -2.8 | -0.389 | 512-sound-effects-8-bit-style / l Sounds_Positive Sounds_sfx_sounds_powerup4.wav | SubspaceAudio | 콤보 단계 상승, 음높이 올려 연속 사용(⑪ xs_combo) |
| 콤보 상승 |  | `puzzle/pz_combo__c10_869695-ps1-pick-up-sfx-8.ogg` | 0.521 | -15.0 | -2.9 | -0.422 | power-up / 869695_PS1-Pick-up-SFX-8.ogg | SignatureSoundsOrg | 콤보 단계 상승, 음높이 올려 연속 사용(⑪ xs_combo) |

## 타격

| 칸 | ★ | 파일 | 길이 s | LUFS | 피크 | 점수 | 원본(팩/파일) | 작성자 | 추천 용도 |
|---|---|---|---|---|---|---|---|---|---|
| 타격 약 | ★1 | `hit/hit_weak__s1-c01_impactwood-light-000.ogg` | 0.263 | -24.1 | -1.0 | -0.035 | kenney_impact-sounds / Audio/impactWood_light_000.ogg | Kenney | 약점 아닌 평타·빗맞음(⑪ xs_hit_weak) |
| 타격 약 | ★2 | `hit/hit_weak__s2-c02_impactwood-light-001.ogg` | 0.263 | -26.6 | -1.0 | -0.035 | kenney_impact-sounds / Audio/impactWood_light_001.ogg | Kenney | 약점 아닌 평타·빗맞음(⑪ xs_hit_weak) |
| 타격 약 |  | `hit/hit_weak__c03_impactwood-light-002.ogg` | 0.263 | -23.9 | -1.0 | -0.035 | kenney_impact-sounds / Audio/impactWood_light_002.ogg | Kenney | 약점 아닌 평타·빗맞음(⑪ xs_hit_weak) |
| 타격 약 | ★3 | `hit/hit_weak__s3-c04_bfh1-wood-hit-01.ogg` | 0.193 | -22.8 | -1.0 | -0.215 | 75-cc0-breaking-falling-hit-sfx / bfh1_wood_hit_01.ogg | rubberduck | 약점 아닌 평타·빗맞음(⑪ xs_hit_weak) |
| 타격 약 |  | `hit/hit_weak__c05_hit-03.ogg` | 0.198 | -25.9 | -1.0 | -0.39 | 100-cc0-sfx-2 / sfx100v2_hit_03.ogg | rubberduck | 약점 아닌 평타·빗맞음(⑪ xs_hit_weak) |
| 타격 약 |  | `hit/hit_weak__c06_770176-kamen-rider-style-smack-punch-imp.ogg` | 0.252 | -24.1 | -1.0 | -0.406 | punch-impact / 770176_-Kamen-Rider-style-smack-punch-impact.ogg | G40X | 약점 아닌 평타·빗맞음(⑪ xs_hit_weak) |
| 타격 약 |  | `hit/hit_weak__c07_hit-01.ogg` | 0.264 | -23.0 | -1.0 | -0.42 | 100-cc0-sfx / hit_01.ogg | rubberduck | 약점 아닌 평타·빗맞음(⑪ xs_hit_weak) |
| 타격 약 |  | `hit/hit_weak__c08_metal-hit-02.ogg` | 0.197 | -25.9 | -1.0 | -0.497 | 100-cc0-sfx-2 / sfx100v2_metal_hit_02.ogg | rubberduck | 약점 아닌 평타·빗맞음(⑪ xs_hit_weak) |
| 타격 약 |  | `hit/hit_weak__c09_bfh1-metal-hit-05.ogg` | 0.312 | -21.1 | -1.0 | -0.501 | 75-cc0-breaking-falling-hit-sfx / bfh1_metal_hit_05.ogg | rubberduck | 약점 아닌 평타·빗맞음(⑪ xs_hit_weak) |
| 타격 약 |  | `hit/hit_weak__c10_hit-02.ogg` | 0.305 | -23.8 | -1.0 | -0.515 | 100-cc0-sfx / hit_02.ogg | rubberduck | 약점 아닌 평타·빗맞음(⑪ xs_hit_weak) |
| 타격 중 | ★1 | `hit/hit_mid__s1-c01_impactmetal-medium-000.ogg` | 0.269 | -20.3 | -1.0 | 0.152 | kenney_impact-sounds / Audio/impactMetal_medium_000.ogg | Kenney | 일반 타격(⑪ xs_hit) |
| 타격 중 | ★2 | `hit/hit_mid__s2-c02_impactmetal-medium-003.ogg` | 0.251 | -20.6 | -1.0 | 0.084 | kenney_impact-sounds / Audio/impactMetal_medium_003.ogg | Kenney | 일반 타격(⑪ xs_hit) |
| 타격 중 |  | `hit/hit_mid__c03_impactwood-medium-002.ogg` | 0.33 | -22.6 | -1.0 | -0.007 | kenney_impact-sounds / Audio/impactWood_medium_002.ogg | Kenney | 일반 타격(⑪ xs_hit) |
| 타격 중 | ★3 | `hit/hit_mid__s3-c04_770176-kamen-rider-style-smack-punch-imp.ogg` | 0.252 | -24.1 | -1.0 | -0.163 | punch-impact / 770176_-Kamen-Rider-style-smack-punch-impact.ogg | G40X | 일반 타격(⑪ xs_hit) |
| 타격 중 |  | `hit/hit_mid__c05_wood-hit-02.ogg` | 0.333 | -19.7 | -1.0 | -0.174 | 100-cc0-sfx-2 / sfx100v2_wood_hit_02.ogg | rubberduck | 일반 타격(⑪ xs_hit) |
| 타격 중 |  | `hit/hit_mid__c06_bfh1-wood-hit-01.ogg` | 0.193 | -22.8 | -1.0 | -0.19 | 75-cc0-breaking-falling-hit-sfx / bfh1_wood_hit_01.ogg | rubberduck | 일반 타격(⑪ xs_hit) |
| 타격 중 |  | `hit/hit_mid__c07_539874-ro-t-3.ogg` | 0.401 | -18.4 | -1.0 | -0.29 | cartoon-hit / 539874_Ro-t-3.ogg | SieuAmThanh | 일반 타격(⑪ xs_hit) |
| 타격 중 |  | `hit/hit_mid__c08_bfh1-wood-hit-03.ogg` | 0.29 | -22.5 | -1.0 | -0.295 | 75-cc0-breaking-falling-hit-sfx / bfh1_wood_hit_03.ogg | rubberduck | 일반 타격(⑪ xs_hit) |
| 타격 중 |  | `hit/hit_mid__c09_wood-hit-03.ogg` | 0.295 | -22.9 | -1.0 | -0.447 | 100-cc0-sfx-2 / sfx100v2_wood_hit_03.ogg | rubberduck | 일반 타격(⑪ xs_hit) |
| 타격 중 |  | `hit/hit_mid__c10_bfh1-wood-hit-02.ogg` | 0.239 | -19.1 | -1.0 | -0.749 | 75-cc0-breaking-falling-hit-sfx / bfh1_wood_hit_02.ogg | rubberduck | 일반 타격(⑪ xs_hit) |
| 타격 강 | ★1 | `hit/hit_strong__s1-c01_impactplate-heavy-002.ogg` | 0.494 | -22.4 | -1.0 | 0.238 | kenney_impact-sounds / Audio/impactPlate_heavy_002.ogg | Kenney | 강타·상성 우위(⑪ xs_hit_big·xs_hit_adv) |
| 타격 강 | ★2 | `hit/hit_strong__s2-c02_impactplate-heavy-000.ogg` | 0.489 | -23.9 | -1.0 | 0.228 | kenney_impact-sounds / Audio/impactPlate_heavy_000.ogg | Kenney | 강타·상성 우위(⑪ xs_hit_big·xs_hit_adv) |
| 타격 강 |  | `hit/hit_strong__c03_impactpunch-heavy-003.ogg` | 0.469 | -18.3 | -1.0 | 0.197 | kenney_impact-sounds / Audio/impactPunch_heavy_003.ogg | Kenney | 강타·상성 우위(⑪ xs_hit_big·xs_hit_adv) |
| 타격 강 | ★3 | `hit/hit_strong__s3-c04_qubodupimpact-qubodupimpactstone.ogg` | 0.429 | -20.0 | -1.0 | -0.0 | impact / qubodupImpact_qubodupImpactStone.flac | qubodup | 강타·상성 우위(⑪ xs_hit_big·xs_hit_adv) |
| 타격 강 |  | `hit/hit_strong__c05_qubodupimpact-qubodupimpactstone.ogg` | 0.429 | -20.0 | -1.0 | -0.0 | impact / qubodupImpact_qubodupImpactStone.ogg | qubodup | 강타·상성 우위(⑪ xs_hit_big·xs_hit_adv) |
| 타격 강 |  | `hit/hit_strong__c06_qubodupimpact-qubodupimpactwood.ogg` | 0.43 | -19.5 | -1.0 | -0.094 | impact / qubodupImpact_qubodupImpactWood.flac | qubodup | 강타·상성 우위(⑪ xs_hit_big·xs_hit_adv) |
| 타격 강 |  | `hit/hit_strong__c07_bfh1-metal-hit-02.ogg` | 0.501 | -15.9 | -1.0 | -0.095 | 75-cc0-breaking-falling-hit-sfx / bfh1_metal_hit_02.ogg | rubberduck | 강타·상성 우위(⑪ xs_hit_big·xs_hit_adv) |
| 타격 강 |  | `hit/hit_strong__c08_bfh1-metal-hit-04.ogg` | 0.246 | -18.5 | -1.0 | -0.208 | 75-cc0-breaking-falling-hit-sfx / bfh1_metal_hit_04.ogg | rubberduck | 강타·상성 우위(⑪ xs_hit_big·xs_hit_adv) |
| 타격 강 |  | `hit/hit_strong__c09_bfh1-breaking-02.ogg` | 0.438 | -22.7 | -1.0 | -0.259 | 75-cc0-breaking-falling-hit-sfx / bfh1_breaking_02.ogg | rubberduck | 강타·상성 우위(⑪ xs_hit_big·xs_hit_adv) |
| 타격 강 |  | `hit/hit_strong__c10_impacts-sounds-impact11.ogg` | 0.33 | -14.1 | -1.0 | -0.463 | 512-sound-effects-8-bit-style / a_General Sounds_Impacts_sfx_sounds_impact11.wav | SubspaceAudio | 강타·상성 우위(⑪ xs_hit_big·xs_hit_adv) |
| 크리티컬 | ★1 | `hit/hit_crit__s1-c01_explosioncrunch-000.ogg` | 0.777 | -13.4 | -1.0 | 0.221 | kenney_sci-fi-sounds / Audio/explosionCrunch_000.ogg | Kenney | 크리티컬·필살·보스 부수기(⑪ xs_hit_big 위에 겹침) |
| 크리티컬 | ★2 | `hit/hit_crit__s2-c02_impactbell-heavy-002.ogg` | 0.697 | -22.2 | -1.0 | 0.112 | kenney_impact-sounds / Audio/impactBell_heavy_002.ogg | Kenney | 크리티컬·필살·보스 부수기(⑪ xs_hit_big 위에 겹침) |
| 크리티컬 | ★3 | `hit/hit_crit__s3-c03_impactbell-heavy-003.ogg` | 0.654 | -21.7 | -1.0 | 0.048 | kenney_impact-sounds / Audio/impactBell_heavy_003.ogg | Kenney | 크리티컬·필살·보스 부수기(⑪ xs_hit_big 위에 겹침) |
| 크리티컬 |  | `hit/hit_crit__c04_explosions-shortest-exp-shortest-hard10.ogg` | 0.766 | -13.0 | -3.5 | -0.043 | 512-sound-effects-8-bit-style / _Explosions_Shortest_sfx_exp_shortest_hard10.wav | SubspaceAudio | 크리티컬·필살·보스 부수기(⑪ xs_hit_big 위에 겹침) |
| 크리티컬 |  | `hit/hit_crit__c05_explosions-short-exp-short-hard9.ogg` | 0.723 | -13.0 | -3.7 | -0.101 | 512-sound-effects-8-bit-style / Junkala_Explosions_Short_sfx_exp_short_hard9.wav | SubspaceAudio | 크리티컬·필살·보스 부수기(⑪ xs_hit_big 위에 겹침) |
| 크리티컬 |  | `hit/hit_crit__c06_bang-02.ogg` | 0.848 | -23.9 | -1.0 | -0.112 | 25-cc0-bang-firework-sfx / bang_02.ogg | rubberduck | 크리티컬·필살·보스 부수기(⑪ xs_hit_big 위에 겹침) |
| 크리티컬 |  | `hit/hit_crit__c07_cannon-03.ogg` | 0.845 | -21.8 | -1.0 | -0.127 | 25-cc0-bang-firework-sfx / cannon_03.ogg | rubberduck | 크리티컬·필살·보스 부수기(⑪ xs_hit_big 위에 겹침) |
| 크리티컬 |  | `hit/hit_crit__c08_bang-07.ogg` | 0.919 | -17.5 | -1.0 | -0.139 | 25-cc0-bang-firework-sfx / bang_07.ogg | rubberduck | 크리티컬·필살·보스 부수기(⑪ xs_hit_big 위에 겹침) |
| 크리티컬 |  | `hit/hit_crit__c09_explosions-shortest-exp-shortest-hard1.ogg` | 0.654 | -13.0 | -1.9 | -0.177 | 512-sound-effects-8-bit-style / a_Explosions_Shortest_sfx_exp_shortest_hard1.wav | SubspaceAudio | 크리티컬·필살·보스 부수기(⑪ xs_hit_big 위에 겹침) |
| 크리티컬 |  | `hit/hit_crit__c10_explosioncrunch-002.ogg` | 1.256 | -13.5 | -1.0 | -0.201 | kenney_sci-fi-sounds / Audio/explosionCrunch_002.ogg | Kenney | 크리티컬·필살·보스 부수기(⑪ xs_hit_big 위에 겹침) |

## 마법·속성

| 칸 | ★ | 파일 | 길이 s | LUFS | 피크 | 점수 | 원본(팩/파일) | 작성자 | 추천 용도 |
|---|---|---|---|---|---|---|---|---|---|
| 번개 | ★1 | `magic/mg_thunder__s1-c01_laserlarge-004.ogg` | 0.693 | -15.2 | -1.0 | 0.24 | kenney_sci-fi-sounds / Audio/laserLarge_004.ogg | Kenney | 번쩍 속성(⑪ xs_atk_flash) |
| 번개 | ★2 | `magic/mg_thunder__s2-c02_laserlarge-003.ogg` | 0.716 | -15.3 | -1.0 | 0.227 | kenney_sci-fi-sounds / Audio/laserLarge_003.ogg | Kenney | 번쩍 속성(⑪ xs_atk_flash) |
| 번개 |  | `magic/mg_thunder__c03_laserlarge-001.ogg` | 0.721 | -15.4 | -1.0 | 0.22 | kenney_sci-fi-sounds / Audio/laserLarge_001.ogg | Kenney | 번쩍 속성(⑪ xs_atk_flash) |
| 번개 | ★3 | `magic/mg_thunder__s3-c04_laser7.ogg` | 0.801 | -15.2 | -1.0 | -0.037 | kenney_digital-audio / Audio/laser7.ogg | Kenney | 번쩍 속성(⑪ xs_atk_flash) |
| 번개 |  | `magic/mg_thunder__c05_laser8.ogg` | 0.865 | -15.4 | -1.0 | -0.094 | kenney_digital-audio / Audio/laser8.ogg | Kenney | 번쩍 속성(⑪ xs_atk_flash) |
| 번개 |  | `magic/mg_thunder__c06_laser5.ogg` | 0.686 | -15.8 | -1.0 | -0.121 | kenney_digital-audio / Audio/laser5.ogg | Kenney | 번쩍 속성(⑪ xs_atk_flash) |
| 번개 |  | `magic/mg_thunder__c07_weapons-lasers-wpn-laser-10.ogg` | 0.581 | -15.4 | -1.0 | -0.186 | 512-sound-effects-8-bit-style / hani Junkala_Weapons_Lasers_sfx_wpn_laser 10.wav | SubspaceAudio | 번쩍 속성(⑪ xs_atk_flash) |
| 번개 |  | `magic/mg_thunder__c08_weapons-lasers-wpn-laser11.ogg` | 0.892 | -15.1 | -1.0 | -0.242 | 512-sound-effects-8-bit-style / uhani Junkala_Weapons_Lasers_sfx_wpn_laser11.wav | SubspaceAudio | 번쩍 속성(⑪ xs_atk_flash) |
| 번개 |  | `magic/mg_thunder__c09_weapons-lasers-wpn-laser6.ogg` | 0.492 | -15.0 | -3.6 | -0.353 | 512-sound-effects-8-bit-style / Juhani Junkala_Weapons_Lasers_sfx_wpn_laser6.wav | SubspaceAudio | 번쩍 속성(⑪ xs_atk_flash) |
| 번개 |  | `magic/mg_thunder__c10_264779-civilian-stun-gun-1-10s-zap.ogg` | 0.271 | -24.2 | -1.0 | -0.567 | electric-zap / 264779_Civilian-Stun-Gun-1-10s-zap.ogg | AnthonyChan0 | 번쩍 속성(⑪ xs_atk_flash) |
| 방패 | ★1 | `magic/mg_shield__s1-c01_forcefield-001.ogg` | 0.906 | -15.0 | -4.2 | -0.059 | kenney_sci-fi-sounds / Audio/forceField_001.ogg | Kenney | 받치기 속성·방어(⑪ xs_atk_support) |
| 방패 | ★2 | `magic/mg_shield__s2-c02_forcefield-000.ogg` | 0.895 | -15.0 | -4.5 | -0.06 | kenney_sci-fi-sounds / Audio/forceField_000.ogg | Kenney | 받치기 속성·방어(⑪ xs_atk_support) |
| 방패 |  | `magic/mg_shield__c03_forcefield-004.ogg` | 0.893 | -15.0 | -4.5 | -0.06 | kenney_sci-fi-sounds / Audio/forceField_004.ogg | Kenney | 받치기 속성·방어(⑪ xs_atk_support) |
| 방패 | ★3 | `magic/mg_shield__s3-c04_160420-icespell-wav.ogg` | 0.624 | -17.6 | -1.0 | -0.115 | ice-spell / 160420_iceSpell-wav.ogg | Relenzo2 | 받치기 속성·방어(⑪ xs_atk_support) |
| 방패 |  | `magic/mg_shield__c05_641895-block-rpg-2.ogg` | 0.183 | -15.1 | -1.0 | -0.121 | shield-block / 641895_Block-Rpg-2.ogg | colorsCrimsonTears | 받치기 속성·방어(⑪ xs_atk_support) |
| 방패 |  | `magic/mg_shield__c06_impactmetal-light-003.ogg` | 0.482 | -15.5 | -1.0 | -0.123 | kenney_impact-sounds / Audio/impactMetal_light_003.ogg | Kenney | 받치기 속성·방어(⑪ xs_atk_support) |
| 방패 |  | `magic/mg_shield__c07_metal-02.ogg` | 0.563 | -15.3 | -1.0 | -0.216 | 80-cc0-rpg-sfx / metal_02.ogg | rubberduck | 받치기 속성·방어(⑪ xs_atk_support) |
| 방패 |  | `magic/mg_shield__c08_metal-01.ogg` | 0.527 | -19.7 | -1.0 | -0.279 | 80-cc0-rpg-sfx / metal_01.ogg | rubberduck | 받치기 속성·방어(⑪ xs_atk_support) |
| 방패 |  | `magic/mg_shield__c09_641896-block-rpg-1.ogg` | 0.23 | -15.0 | -2.6 | -0.358 | shield-block / 641896_Block-Rpg-1.ogg | colorsCrimsonTears | 받치기 속성·방어(⑪ xs_atk_support) |
| 방패 |  | `magic/mg_shield__c10_inventory-metal-ringing.ogg` | 0.509 | -15.0 | -2.6 | -0.416 | rpg-sound-pack / RPG Sound Pack_inventory_metal-ringing.wav | artisticdude | 받치기 속성·방어(⑪ xs_atk_support) |
| 치유 | ★1 | `magic/mg_heal__s1-c01_495453-magic-spell-05-wav.ogg` | 1.0 | -16.0 | -2.4 | -0.0 | magic-spell / 495453_Magic-Spell-05-wav.ogg | LilMati | 돌보기 속성·회복(⑪ xs_atk_care) |
| 치유 | ★2 | `magic/mg_heal__s2-c02_659762-magic-spell-05-remastered-wav.ogg` | 1.0 | -16.0 | -1.5 | -0.0 | magic-spell / 659762_Magic-Spell-05-Remastered-wav.ogg | LilMati | 돌보기 속성·회복(⑪ xs_atk_care) |
| 치유 | ★3 | `magic/mg_heal__s3-c03_376744-fantasy-ui-button-4-wav.ogg` | 0.957 | -16.0 | -1.1 | -0.044 | magic-chime / 376744_Fantasy-ui-Button-4-wav.ogg | ZenithInfinitiveStudios | 돌보기 속성·회복(⑪ xs_atk_care) |
| 치유 |  | `magic/mg_heal__c04_407479-heal-mp3.ogg` | 1.071 | -22.6 | -1.0 | -0.082 | healing / 407479_heal-mp3.ogg | Loyalty_Freak_Music | 돌보기 속성·회복(⑪ xs_atk_care) |
| 치유 |  | `magic/mg_heal__c05_magical-6.ogg` | 1.11 | -16.0 | -4.1 | -0.104 | magic-spell-sfx / magical_6.ogg | JaggedStone | 돌보기 속성·회복(⑪ xs_atk_care) |
| 치유 |  | `magic/mg_heal__c06_battle-magic1.ogg` | 0.652 | -16.0 | -3.1 | -0.134 | rpg-sound-pack / RPG Sound Pack_battle_magic1.wav | artisticdude | 돌보기 속성·회복(⑪ xs_atk_care) |
| 치유 |  | `magic/mg_heal__c07_376746-fantasy-ui-button-2-wav.ogg` | 1.156 | -16.0 | -2.6 | -0.145 | magic-chime / 376746_Fantasy-ui-Button-2-wav.ogg | ZenithInfinitiveStudios | 돌보기 속성·회복(⑪ xs_atk_care) |
| 치유 |  | `magic/mg_heal__c08_562292-heal-rpg.ogg` | 1.209 | -16.0 | -9.1 | -0.209 | heal-spell / 562292_Heal-Rpg.ogg | colorsCrimsonTears | 돌보기 속성·회복(⑪ xs_atk_care) |
| 치유 |  | `magic/mg_heal__c09_562292-heal-rpg.ogg` | 1.209 | -16.0 | -9.1 | -0.209 | healing / 562292_Heal-Rpg.ogg | colorsCrimsonTears | 돌보기 속성·회복(⑪ xs_atk_care) |
| 치유 |  | `magic/mg_heal__c10_376749-fantasy-ui-button-5-wav.ogg` | 0.774 | -16.0 | -3.9 | -0.229 | magic-chime / 376749_Fantasy-ui-Button-5-wav.ogg | ZenithInfinitiveStudios | 돌보기 속성·회복(⑪ xs_atk_care) |

## 보상

| 칸 | ★ | 파일 | 길이 s | LUFS | 피크 | 점수 | 원본(팩/파일) | 작성자 | 추천 용도 |
|---|---|---|---|---|---|---|---|---|---|
| 별 | ★1 | `reward/rw_star__s1-c01_confirmation-004.ogg` | 0.49 | -15.0 | -5.3 | 0.23 | kenney_interface-sounds / Audio/confirmation_004.ogg | Kenney | 별 획득·★ 표시(10앱 star) |
| 별 | ★2 | `reward/rw_star__s2-c02_confirmation-002.ogg` | 0.539 | -15.0 | -2.7 | 0.175 | kenney_interface-sounds / Audio/confirmation_002.ogg | Kenney | 별 획득·★ 표시(10앱 star) |
| 별 | ★3 | `reward/rw_star__s3-c03_457306-anime-wav.ogg` | 0.337 | -15.2 | -1.0 | -0.0 | twinkle / 457306_anime-wav.ogg | 1urker | 별 획득·★ 표시(10앱 star) |
| 별 |  | `reward/rw_star__c04_443258-retro-coin-05-wav.ogg` | 0.478 | -15.0 | -4.6 | -0.045 | star-collect / 443258_Retro-Coin-05-wav.ogg | LilMati | 별 획득·★ 표시(10앱 star) |
| 별 |  | `reward/rw_star__c05_bell-02.ogg` | 0.491 | -19.1 | -1.0 | -0.06 | 100-cc0-sfx / bell_02.ogg | rubberduck | 별 획득·★ 표시(10앱 star) |
| 별 |  | `reward/rw_star__c06_glass-004.ogg` | 0.692 | -15.0 | -1.5 | -0.075 | kenney_interface-sounds / Audio/glass_004.ogg | Kenney | 별 획득·★ 표시(10앱 star) |
| 별 |  | `reward/rw_star__c07_515736-retro-coin-06-wav.ogg` | 0.444 | -15.0 | -3.7 | -0.119 | star-collect / 515736_Retro-Coin-06-wav.ogg | LilMati | 별 획득·★ 표시(10앱 star) |
| 별 |  | `reward/rw_star__c08_jingles-steel09.ogg` | 0.586 | -15.4 | -1.0 | -0.196 | kenney_music-jingles / Audio/Steel jingles/jingles_STEEL09.ogg | Kenney | 별 획득·★ 표시(10앱 star) |
| 별 |  | `reward/rw_star__c09_tone1.ogg` | 0.198 | -15.4 | -1.0 | -0.227 | kenney_digital-audio / Audio/tone1.ogg | Kenney | 별 획득·★ 표시(10앱 star) |
| 별 |  | `reward/rw_star__c10_twotone2.ogg` | 0.636 | -15.0 | -1.7 | -0.274 | kenney_digital-audio / Audio/twoTone2.ogg | Kenney | 별 획득·★ 표시(10앱 star) |
| 코인 | ★1 | `reward/rw_coin__s1-c01_350868-coin-c-05.ogg` | 0.422 | -16.0 | -3.4 | -0.005 | coin-pickup / 350868_Coin-C-05.ogg | cabled_mess | 금화·보상 줍기(⑪ 금화, 식탁 수확) |
| 코인 | ★2 | `reward/rw_coin__s2-c02_item-coins-01.ogg` | 0.365 | -23.7 | -1.0 | -0.015 | 80-cc0-rpg-sfx / item_coins_01.ogg | rubberduck | 금화·보상 줍기(⑪ 금화, 식탁 수확) |
| 코인 | ★3 | `reward/rw_coin__s3-c03_coins-coin-single1.ogg` | 0.416 | -16.0 | -9.0 | -0.039 | 512-sound-effects-8-bit-style / unkala_General Sounds_Coins_sfx_coin_single1.wav | SubspaceAudio | 금화·보상 줍기(⑪ 금화, 식탁 수확) |
| 코인 |  | `reward/rw_coin__c04_350870-coin-c-03.ogg` | 0.379 | -16.0 | -6.2 | -0.054 | coin-pickup / 350870_Coin-C-03.ogg | cabled_mess | 금화·보상 줍기(⑪ 금화, 식탁 수확) |
| 코인 |  | `reward/rw_coin__c05_coin2.ogg` | 0.424 | -16.0 | -6.6 | -0.058 | 10-8bit-coin-sounds / coin2.wav | Luke.RUSTLTD | 금화·보상 줍기(⑪ 금화, 식탁 수확) |
| 코인 |  | `reward/rw_coin__c06_retro-coin-02.ogg` | 0.353 | -16.0 | -2.4 | -0.117 | 50-cc0-retro-synth-sfx / retro_coin_02.ogg | rubberduck | 금화·보상 줍기(⑪ 금화, 식탁 수확) |
| 코인 |  | `reward/rw_coin__c07_coin1.ogg` | 0.355 | -16.0 | -5.6 | -0.119 | 10-8bit-coin-sounds / coin1.wav | Luke.RUSTLTD | 금화·보상 줍기(⑪ 금화, 식탁 수확) |
| 코인 |  | `reward/rw_coin__c08_coin3.ogg` | 0.35 | -16.0 | -4.5 | -0.134 | 10-8bit-coin-sounds / coin3.wav | Luke.RUSTLTD | 금화·보상 줍기(⑪ 금화, 식탁 수확) |
| 코인 |  | `reward/rw_coin__c09_coins-coin-double3.ogg` | 0.35 | -16.0 | -5.5 | -0.134 | 512-sound-effects-8-bit-style / unkala_General Sounds_Coins_sfx_coin_double3.wav | SubspaceAudio | 금화·보상 줍기(⑪ 금화, 식탁 수확) |
| 코인 |  | `reward/rw_coin__c10_coins-coin-single6.ogg` | 0.458 | -16.0 | -8.3 | -0.135 | 512-sound-effects-8-bit-style / unkala_General Sounds_Coins_sfx_coin_single6.wav | SubspaceAudio | 금화·보상 줍기(⑪ 금화, 식탁 수확) |
| 레벨업 | ★1 | `reward/rw_levelup__s1-c01_jingles-pizzi03.ogg` | 1.14 | -15.0 | -5.3 | 0.205 | kenney_music-jingles / Audio/Pizzicato jingles/jingles_PIZZI03.ogg | Kenney | 레벨업·집 레벨 상승(⑪ 동료 성장) |
| 레벨업 | ★2 | `reward/rw_levelup__s2-c02_jingles-pizzi07.ogg` | 1.324 | -15.0 | -3.3 | 0.152 | kenney_music-jingles / Audio/Pizzicato jingles/jingles_PIZZI07.ogg | Kenney | 레벨업·집 레벨 상승(⑪ 동료 성장) |
| 레벨업 |  | `reward/rw_levelup__c03_jingles-pizzi01.ogg` | 0.99 | -15.0 | -5.0 | 0.07 | kenney_music-jingles / Audio/Pizzicato jingles/jingles_PIZZI01.ogg | Kenney | 레벨업·집 레벨 상승(⑪ 동료 성장) |
| 레벨업 | ★3 | `reward/rw_levelup__s3-c04_478343-bouncing-power-up-1-4.ogg` | 0.505 | -15.2 | -1.0 | -0.004 | power-up / 478343_Bouncing-Power-Up-1-4.ogg | Joao_Janz | 레벨업·집 레벨 상승(⑪ 동료 성장) |
| 레벨업 |  | `reward/rw_levelup__c05_powerup12.ogg` | 0.744 | -15.0 | -4.4 | -0.081 | kenney_digital-audio / Audio/powerUp12.ogg | Kenney | 레벨업·집 레벨 상승(⑪ 동료 성장) |
| 레벨업 |  | `reward/rw_levelup__c06_478342-bouncing-power-up-1-5.ogg` | 0.537 | -15.3 | -1.0 | -0.095 | power-up / 478342_Bouncing-Power-Up-1-5.ogg | Joao_Janz | 레벨업·집 레벨 상승(⑪ 동료 성장) |
| 레벨업 |  | `reward/rw_levelup__c07_368651-game-powerup.ogg` | 1.088 | -15.1 | -1.0 | -0.098 | level-up / 368651_Game-Powerup.ogg | Jofae | 레벨업·집 레벨 상승(⑪ 동료 성장) |
| 레벨업 |  | `reward/rw_levelup__c08_478336-bouncing-power-up-1-3.ogg` | 0.485 | -15.3 | -1.0 | -0.115 | power-up / 478336_Bouncing-Power-Up-1-3.ogg | Joao_Janz | 레벨업·집 레벨 상승(⑪ 동료 성장) |
| 레벨업 |  | `reward/rw_levelup__c09_532708-item-wav.ogg` | 0.971 | -15.0 | -4.1 | -0.161 | level-up / 532708_Item-wav.ogg | pooffles | 레벨업·집 레벨 상승(⑪ 동료 성장) |
| 레벨업 |  | `reward/rw_levelup__c10_gmae.ogg` | 1.314 | -15.2 | -1.0 | -0.223 | completion-sound / gmae.wav | HaelDB | 레벨업·집 레벨 상승(⑪ 동료 성장) |
| 팡파르 | ★1 | `reward/rw_fanfare__s1-c01_jingles-nes00.ogg` | 1.755 | -16.0 | -6.7 | 0.121 | kenney_music-jingles / Audio/8-Bit jingles/jingles_NES00.ogg | Kenney | 판 클리어·승리 징글(⑪ xs_win·xs_fanfare) |
| 팡파르 | ★2 | `reward/rw_fanfare__s2-c02_jingles-sax07.ogg` | 1.74 | -16.0 | -6.4 | 0.111 | kenney_music-jingles / Audio/Sax jingles/jingles_SAX07.ogg | Kenney | 판 클리어·승리 징글(⑪ xs_win·xs_fanfare) |
| 팡파르 |  | `reward/rw_fanfare__c03_jingles-steel07.ogg` | 1.555 | -16.0 | -1.9 | -0.002 | kenney_music-jingles / Audio/Steel jingles/jingles_STEEL07.ogg | Kenney | 판 클리어·승리 징글(⑪ xs_win·xs_fanfare) |
| 팡파르 | ★3 | `reward/rw_fanfare__s3-c04_546777-happy-new-year-wav.ogg` | 1.829 | -16.0 | -1.2 | -0.077 | celebration / 546777_happy-new-year-wav.ogg | FunnyVoices | 판 클리어·승리 징글(⑪ xs_win·xs_fanfare) |
| 팡파르 |  | `reward/rw_fanfare__c05_580310-fanfare-2-rpg.ogg` | 1.791 | -16.0 | -1.0 | -0.1 | victory-fanfare / 580310_Fanfare-2-Rpg.ogg | colorsCrimsonTears | 판 클리어·승리 징글(⑪ xs_win·xs_fanfare) |
| 팡파르 |  | `reward/rw_fanfare__c06_653779-pirate-bagpipe-mp3.ogg` | 1.75 | -16.1 | -1.0 | -0.126 | celebration / 653779_Pirate-Bagpipe-mp3.ogg | Streetpoptunez | 판 클리어·승리 징글(⑪ xs_win·xs_fanfare) |
| 팡파르 |  | `reward/rw_fanfare__c07_607207-congrats.ogg` | 1.468 | -16.0 | -1.0 | -0.153 | win-jingle / 607207_Congrats.ogg | Fupicat | 판 클리어·승리 징글(⑪ xs_win·xs_fanfare) |
| 팡파르 |  | `reward/rw_fanfare__c08_221548-euphoric-man-boy-yell.ogg` | 2.161 | -16.0 | -3.2 | -0.158 | celebration / 221548_Euphoric-man-boy-yell.ogg | joseppujol | 판 클리어·승리 징글(⑪ xs_win·xs_fanfare) |
| 팡파르 |  | `reward/rw_fanfare__c09_269198-game-win-mp3.ogg` | 2.476 | -16.0 | -3.8 | -0.223 | victory-fanfare / 269198_game-win-mp3.ogg | mickleness | 판 클리어·승리 징글(⑪ xs_win·xs_fanfare) |
| 팡파르 |  | `reward/rw_fanfare__c10_cards-pack-open-1.ogg` | 0.937 | -20.6 | -1.0 | -0.508 | kenney_casino-audio / Audio/cards-pack-open-1.ogg | Kenney | 판 클리어·승리 징글(⑪ xs_win·xs_fanfare) |

## 마법·속성

| 칸 | ★ | 파일 | 길이 s | LUFS | 피크 | 점수 | 원본(팩/파일) | 작성자 | 추천 용도 |
|---|---|---|---|---|---|---|---|---|---|
| 스킬 발동 | ★1 | `magic/mg_cast__s1-c01_577965-rpgpowerup-wav.ogg` | 0.914 | -15.2 | -1.0 | -0.015 | spell-cast / 577965_rpgPowerup-wav.ogg | colorsCrimsonTears | 스킬 발동·필살기 시작(⑪ 컷인 xs_cut·xs_charge 위에 겹침) |
| 스킬 발동 | ★2 | `magic/mg_cast__s2-c02_683182-magic-depleted-1.ogg` | 0.875 | -15.0 | -1.0 | -0.028 | magic-whoosh / 683182_Magic-Depleted-1.ogg | NearTheAtmoshphere | 스킬 발동·필살기 시작(⑪ 컷인 xs_cut·xs_charge 위에 겹침) |
| 스킬 발동 | ★3 | `magic/mg_cast__s3-c03_715784-magic-whoosh.ogg` | 0.875 | -16.8 | -1.0 | -0.028 | magic-whoosh / 715784_Magic-Whoosh.ogg | DustyWind | 스킬 발동·필살기 시작(⑪ 컷인 xs_cut·xs_charge 위에 겹침) |
| 스킬 발동 |  | `magic/mg_cast__c04_442872-fire-magic.ogg` | 0.868 | -15.5 | -1.0 | -0.036 | fire-spell / 442872_Fire-Magic.ogg | qubodup | 스킬 발동·필살기 시작(⑪ 컷인 xs_cut·xs_charge 위에 겹침) |
| 스킬 발동 |  | `magic/mg_cast__c05_420677-spell-cast-buff-deep-tone.ogg` | 0.621 | -15.6 | -1.0 | -0.049 | spell-cast / 420677_Spell-Cast-Buff-Deep-Tone.ogg | SypherZent | 스킬 발동·필살기 시작(⑪ 컷인 xs_cut·xs_charge 위에 겹침) |
| 스킬 발동 |  | `magic/mg_cast__c06_837459-spell-whisperedshort-04.ogg` | 0.991 | -15.9 | -1.0 | -0.096 | spell-cast / 837459_SFX-Spell-WhisperedShort-04.ogg | Wavewire | 스킬 발동·필살기 시작(⑪ 컷인 xs_cut·xs_charge 위에 겹침) |
| 스킬 발동 |  | `magic/mg_cast__c07_495453-magic-spell-05-wav.ogg` | 1.0 | -15.0 | -1.4 | -0.105 | magic-spell / 495453_Magic-Spell-05-wav.ogg | LilMati | 스킬 발동·필살기 시작(⑪ 컷인 xs_cut·xs_charge 위에 겹침) |
| 스킬 발동 |  | `magic/mg_cast__c08_659762-magic-spell-05-remastered-wav.ogg` | 1.0 | -15.1 | -1.0 | -0.105 | magic-spell / 659762_Magic-Spell-05-Remastered-wav.ogg | LilMati | 스킬 발동·필살기 시작(⑪ 컷인 xs_cut·xs_charge 위에 겹침) |
| 스킬 발동 |  | `magic/mg_cast__c09_spell-fire-06.ogg` | 0.897 | -15.4 | -1.0 | -0.11 | 80-cc0-rpg-sfx / spell_fire_06.ogg | rubberduck | 스킬 발동·필살기 시작(⑪ 컷인 xs_cut·xs_charge 위에 겹침) |
| 스킬 발동 |  | `magic/mg_cast__c10_683178-whoosh.ogg` | 0.69 | -15.1 | -1.0 | -0.142 | magic-whoosh / 683178_Whoosh.ogg | NearTheAtmoshphere | 스킬 발동·필살기 시작(⑪ 컷인 xs_cut·xs_charge 위에 겹침) |
| 보스 등장 | ★1 | `magic/boss_intro__s1-c01_lowfrequency-explosion-000.ogg` | 2.0 | -14.5 | -1.0 | 0.139 | kenney_sci-fi-sounds / Audio/lowFrequency_explosion_000.ogg | Kenney | 보스 등장·대장 출현(⑪ xs_boss 교체 후보) |
| 보스 등장 | ★2 | `magic/boss_intro__s2-c02_impactbell-heavy-001.ogg` | 1.741 | -17.8 | -1.0 | 0.111 | kenney_impact-sounds / Audio/impactBell_heavy_001.ogg | Kenney | 보스 등장·대장 출현(⑪ xs_boss 교체 후보) |
| 보스 등장 | ★3 | `magic/boss_intro__s3-c03_785930-drama-trailer-impact.ogg` | 1.709 | -14.2 | -1.0 | -0.019 | dramatic-impact / 785930_Drama-Trailer-Impact.ogg | modusmogulus | 보스 등장·대장 출현(⑪ xs_boss 교체 후보) |
| 보스 등장 |  | `magic/boss_intro__c04_impactbell-heavy-000.ogg` | 1.48 | -20.4 | -1.0 | -0.051 | kenney_impact-sounds / Audio/impactBell_heavy_000.ogg | Kenney | 보스 등장·대장 출현(⑪ xs_boss 교체 후보) |
| 보스 등장 |  | `magic/boss_intro__c05_537883-monster-roar.ogg` | 1.778 | -14.2 | -1.0 | -0.068 | monster-roar / 537883_Monster-roar.ogg | colorsCrimsonTears | 보스 등장·대장 출현(⑪ xs_boss 교체 후보) |
| 보스 등장 |  | `magic/boss_intro__c06_261147-monster-roar-in-distance-mp3.ogg` | 1.733 | -14.2 | -1.0 | -0.133 | monster-roar / 261147_monster-roar-in-distance-mp3.ogg | Chobiboko | 보스 등장·대장 출현(⑪ xs_boss 교체 후보) |
| 보스 등장 |  | `magic/boss_intro__c07_751713-yeti-roar-skiing-game-roar-sfx-re.ogg` | 1.607 | -14.1 | -1.0 | -0.17 | boss-roar / 713_Yeti-Roar-Skiing-Game-Roar-SFX-Remix-2-o.ogg | el_boss | 보스 등장·대장 출현(⑪ xs_boss 교체 후보) |
| 보스 등장 |  | `magic/boss_intro__c08_751712-yeti-roar-skiing-game-roar-sfx-re.ogg` | 1.511 | -14.4 | -1.0 | -0.253 | boss-roar / 712_Yeti-Roar-Skiing-Game-Roar-SFX-Remix-1-o.ogg | el_boss | 보스 등장·대장 출현(⑪ xs_boss 교체 후보) |
| 보스 등장 |  | `magic/boss_intro__c09_814934-sound-design-elements-impact-sfx-.ogg` | 2.37 | -14.5 | -1.0 | -0.261 | dramatic-impact / 4934_Sound-Design-Elements-Impact-SFX-PS-092.ogg | AudioPapkin | 보스 등장·대장 출현(⑪ xs_boss 교체 후보) |
| 보스 등장 |  | `magic/boss_intro__c10_812593-collision.ogg` | 1.5 | -14.3 | -1.0 | -0.288 | dramatic-impact / 812593_Collision.ogg | qubodup | 보스 등장·대장 출현(⑪ xs_boss 교체 후보) |

## 보상

| 칸 | ★ | 파일 | 길이 s | LUFS | 피크 | 점수 | 원본(팩/파일) | 작성자 | 추천 용도 |
|---|---|---|---|---|---|---|---|---|---|
| 축하(아이) | ★1 | `reward/rw_cheer__s1-c01_jingles-steel07.ogg` | 1.555 | -16.0 | -1.9 | 0.214 | kenney_music-jingles / Audio/Steel jingles/jingles_STEEL07.ogg | Kenney | 10앱 판 클리어·별 3개 축하(유아 앱은 음성 환호 대신 이것) |
| 축하(아이) | ★2 | `reward/rw_cheer__s2-c02_jingles-steel02.ogg` | 1.387 | -16.0 | -2.2 | 0.172 | kenney_music-jingles / Audio/Steel jingles/jingles_STEEL02.ogg | Kenney | 10앱 판 클리어·별 3개 축하(유아 앱은 음성 환호 대신 이것) |
| 축하(아이) |  | `reward/rw_cheer__c03_jingles-steel03.ogg` | 1.387 | -16.0 | -3.4 | 0.172 | kenney_music-jingles / Audio/Steel jingles/jingles_STEEL03.ogg | Kenney | 10앱 판 클리어·별 3개 축하(유아 앱은 음성 환호 대신 이것) |
| 축하(아이) | ★3 | `reward/rw_cheer__s3-c04_235122-yay-wav.ogg` | 1.396 | -16.0 | -9.5 | -0.041 | yay / 235122_yay-wav.ogg | Reitanna | 10앱 판 클리어·별 3개 축하(유아 앱은 음성 환호 대신 이것) |
| 축하(아이) |  | `reward/rw_cheer__c05_472869-yay-m4a.ogg` | 1.44 | -16.0 | -1.4 | -0.041 | yay / 472869_YAY-m4a.ogg | tab.tmg020 | 10앱 판 클리어·별 3개 축하(유아 앱은 음성 환호 대신 이것) |
| 축하(아이) |  | `reward/rw_cheer__c06_828064-yay.ogg` | 1.408 | -16.0 | -3.4 | -0.063 | yay / 828064_-yay-.ogg | rabeladdie | 10앱 판 클리어·별 3개 축하(유아 앱은 음성 환호 대신 이것) |
| 축하(아이) |  | `reward/rw_cheer__c07_653779-pirate-bagpipe-mp3.ogg` | 1.75 | -16.1 | -1.0 | -0.162 | celebration / 653779_Pirate-Bagpipe-mp3.ogg | Streetpoptunez | 10앱 판 클리어·별 3개 축하(유아 앱은 음성 환호 대신 이것) |
| 축하(아이) |  | `reward/rw_cheer__c08_546777-happy-new-year-wav.ogg` | 1.829 | -16.0 | -1.2 | -0.211 | celebration / 546777_happy-new-year-wav.ogg | FunnyVoices | 10앱 판 클리어·별 3개 축하(유아 앱은 음성 환호 대신 이것) |
| 축하(아이) |  | `reward/rw_cheer__c09_cards-pack-open-1.ogg` | 0.937 | -20.6 | -1.0 | -0.221 | kenney_casino-audio / Audio/cards-pack-open-1.ogg | Kenney | 10앱 판 클리어·별 3개 축하(유아 앱은 음성 환호 대신 이것) |
| 축하(아이) |  | `reward/rw_cheer__c10_480686-r02-13-group-applause-wav.ogg` | 2.036 | -16.0 | -6.4 | -0.351 | short-applause / 480686_R02-13-Group-Applause-wav.ogg | craigsmith | 10앱 판 클리어·별 3개 축하(유아 앱은 음성 환호 대신 이것) |

## 실패

| 칸 | ★ | 파일 | 길이 s | LUFS | 피크 | 점수 | 원본(팩/파일) | 작성자 | 추천 용도 |
|---|---|---|---|---|---|---|---|---|---|
| 실패 | ★1 | `fail/fail__s1-c01_error-005.ogg` | 0.221 | -18.4 | -1.0 | 0.068 | kenney_interface-sounds / Audio/error_005.ogg | Kenney | 맞춤 실패·패배(⑪ xs_nomatch·xs_lose, 10앱 hmm) |
| 실패 | ★2 | `fail/fail__s2-c02_error-006.ogg` | 0.276 | -18.6 | -1.0 | 0.068 | kenney_interface-sounds / Audio/error_006.ogg | Kenney | 맞춤 실패·패배(⑪ xs_nomatch·xs_lose, 10앱 hmm) |
| 실패 |  | `fail/fail__c03_error-003.ogg` | 0.527 | -18.6 | -1.0 | 0.066 | kenney_interface-sounds / Audio/error_003.ogg | Kenney | 맞춤 실패·패배(⑪ xs_nomatch·xs_lose, 10앱 hmm) |
| 실패 | ★3 | `fail/fail__s3-c04_retro-die-03.ogg` | 0.505 | -18.0 | -8.6 | -0.043 | 50-cc0-retro-synth-sfx / retro_die_03.ogg | rubberduck | 맞춤 실패·패배(⑪ xs_nomatch·xs_lose, 10앱 hmm) |
| 실패 |  | `fail/fail__c05_lowdown.ogg` | 0.651 | -18.0 | -6.4 | -0.102 | kenney_digital-audio / Audio/lowDown.ogg | Kenney | 맞춤 실패·패배(⑪ xs_nomatch·xs_lose, 10앱 hmm) |
| 실패 |  | `fail/fail__c06_retro-die-01.ogg` | 0.408 | -18.0 | -5.2 | -0.312 | 50-cc0-retro-synth-sfx / retro_die_01.ogg | rubberduck | 맞춤 실패·패배(⑪ xs_nomatch·xs_lose, 10앱 hmm) |
| 실패 |  | `fail/fail__c07_retro-die-02.ogg` | 0.388 | -18.0 | -8.4 | -0.395 | 50-cc0-retro-synth-sfx / retro_die_02.ogg | rubberduck | 맞춤 실패·패배(⑪ xs_nomatch·xs_lose, 10앱 hmm) |
| 실패 |  | `fail/fail__c08_435157-game-over-05-wav.ogg` | 1.027 | -18.0 | -1.3 | -0.537 | game-over / 435157_Game-Over-05-wav.ogg | LilMati | 맞춤 실패·패배(⑪ xs_nomatch·xs_lose, 10앱 hmm) |
| 실패 |  | `fail/fail__c09_phaserdown3.ogg` | 0.472 | -18.0 | -6.2 | -0.54 | kenney_digital-audio / Audio/phaserDown3.ogg | Kenney | 맞춤 실패·패배(⑪ xs_nomatch·xs_lose, 10앱 hmm) |
| 실패 |  | `fail/fail__c10_435194-game-over-06-wav.ogg` | 1.03 | -18.2 | -1.0 | -0.54 | game-over / 435194_Game-Over-06-wav.ogg | LilMati | 맞춤 실패·패배(⑪ xs_nomatch·xs_lose, 10앱 hmm) |

## 환경

| 칸 | ★ | 파일 | 길이 s | LUFS | 피크 | 점수 | 원본(팩/파일) | 작성자 | 추천 용도 |
|---|---|---|---|---|---|---|---|---|---|
| 환경음 · 새소리(낮) | ★1 | `env/env_ambience__s1-c01_birds-isaiah658.ogg` | 30.0 | -24.0 | -3.2 |  | ambient-bird-sounds / birds-isaiah658.ogg | isaiah658 | 배경 깔개(-24 LUFS, 30초 루프 후보) — 집·마을·나라 배경 |
| 환경음 · 바람 | ★2 | `env/env_ambience__s2-c02_wind.ogg` | 6.64 | -24.0 | -8.8 |  | wind / Wind.ogg | IgnasD | 배경 깔개(-24 LUFS, 30초 루프 후보) — 집·마을·나라 배경 |
| 환경음 · 벽난로(아늑함) | ★3 | `env/env_ambience__s3-c03_fire.ogg` | 29.26 | -20.7 | -1.0 |  | fireplace-sound-loop / fire.wav | PagDev | 배경 깔개(-24 LUFS, 30초 루프 후보) — 집·마을·나라 배경 |
| 환경음 · 비 |  | `env/env_ambience__c04_loop-rain.ogg` | 6.83 | -24.0 | -6.0 |  | 40-cc0-water-splash-slime-sfx / loop_rain.ogg | rubberduck | 배경 깔개(-24 LUFS, 30초 루프 후보) — 집·마을·나라 배경 |
| 환경음 · 시냇물 |  | `env/env_ambience__c05_loop-water-01.ogg` | 3.38 | -24.0 | -6.1 |  | 40-cc0-water-splash-slime-sfx / loop_water_01.ogg | rubberduck | 배경 깔개(-24 LUFS, 30초 루프 후보) — 집·마을·나라 배경 |
| 환경음 · 파도 |  | `env/env_ambience__c06_wave-01-cc0-18363-jasinski-alkaibeach.ogg` | 4.0 | -24.0 | -3.2 |  | beach-ocean-waves / wave_01_cc0-18363__jasinski__alkaibeach.flac | qubodup | 배경 깔개(-24 LUFS, 30초 루프 후보) — 집·마을·나라 배경 |
| 환경음 · 잔잔한 실내 공기 |  | `env/env_ambience__c07_ambient-01.ogg` | 8.23 | -24.0 | -6.2 |  | 30-cc0-sfx-loops / ambient_01.ogg | rubberduck | 배경 깔개(-24 LUFS, 30초 루프 후보) — 집·마을·나라 배경 |
| 환경음 · 공기 2 |  | `env/env_ambience__c08_ambient-02.ogg` | 3.17 | -24.0 | -5.6 |  | 30-cc0-sfx-loops / ambient_02.ogg | rubberduck | 배경 깔개(-24 LUFS, 30초 루프 후보) — 집·마을·나라 배경 |

## 배경음

| 칸 | ★ | 파일 | 길이 s | LUFS | 피크 | 점수 | 원본(팩/파일) | 작성자 | 추천 용도 |
|---|---|---|---|---|---|---|---|---|---|
| 배경음 아늑함 | ★1 | `bgm/bgm_cozy__s1-c01_towntheme.ogg` | 97.5 | -17.1 | -1.0 |  | town-theme-rpg / TownTheme.mp3 | cynicmusic | 집 꾸미기·식탁·로비(10앱 「우리 집」, ⑪ 마을) — 밝은 마을 테마, 97초 |
| 배경음 아늑함 | ★2 | `bgm/bgm_cozy__s2-c02_shop-theme-buy-something.ogg` | 88.0 | -16.6 | -1.0 |  | shop-theme / shop_theme_Buy Something!.ogg | CleytonKauffman | 집 꾸미기·식탁·로비(10앱 「우리 집」, ⑪ 마을) — 상점·아기자기, 88초 |
| 배경음 아늑함 | ★3 | `bgm/bgm_cozy__s3-c03_loop-minstrel-dance-0.ogg` | 56.3 | -18.0 | -3.8 |  | medieval-minstrel-dance / Loop_Minstrel_Dance_0.wav | RandomMind | 집 꾸미기·식탁·로비(10앱 「우리 집」, ⑪ 마을) — 류트 춤곡 이음새 루프 56초 |
| 배경음 아늑함 |  | `bgm/bgm_cozy__c04_story-time_45s.ogg` | 45.0 | -18.0 | -1.2 |  | story-time / story time.ogg | HaelDB | 집 꾸미기·식탁·로비(10앱 「우리 집」, ⑪ 마을) — 이야기 시간, 55초 (도서관엔 45초 미리듣기만) |
| 배경음 아늑함 |  | `bgm/bgm_cozy__c05_chilllofir_45s.ogg` | 45.0 | -15.8 | -1.0 |  | chill-lofi-inspired / ChillLofiR.mp3 | omfgdude | 집 꾸미기·식탁·로비(10앱 「우리 집」, ⑪ 마을) — 로파이, 123초 (도서관엔 45초 미리듣기만) |
| 배경음 아늑함 |  | `bgm/bgm_cozy__c06_snowfall-looped-ver-0_45s.ogg` | 45.0 | -16.0 | -1.0 |  | snowfall / Snowfall (Looped ver.)_0.ogg | Kistol | 집 꾸미기·식탁·로비(10앱 「우리 집」, ⑪ 마을) — 겨울·잔잔, 루프 50초 (도서관엔 45초 미리듣기만) |
| 배경음 아늑함 |  | `bgm/bgm_cozy__c07_grasslands_45s.ogg` | 45.0 | -18.0 | -1.3 |  | jrpg-pack-1-exploration / Grasslands.ogg | SubspaceAudio | 집 꾸미기·식탁·로비(10앱 「우리 집」, ⑪ 마을) — 들판 탐험, 71초 (도서관엔 45초 미리듣기만) |
| 배경음 아늑함 |  | `bgm/bgm_cozy__c08_the-field-of-dreams_45s.ogg` | 45.0 | -15.4 | -1.0 |  | the-field-of-dreams / the_field_of_dreams.mp3 | pauliuw | 집 꾸미기·식탁·로비(10앱 「우리 집」, ⑪ 마을) — 서정 피아노, 85초 (도서관엔 45초 미리듣기만) |
| 배경음 아늑함 |  | `bgm/bgm_cozy__c09_next-to-you_45s.ogg` | 45.0 | -16.8 | -1.0 |  | next-to-you / Next to You.mp3 | Joth | 집 꾸미기·식탁·로비(10앱 「우리 집」, ⑪ 마을) — 서정, 84초 (도서관엔 45초 미리듣기만) |
| 배경음 아늑함 |  | `bgm/bgm_cozy__c10_679165-home-romantic-piano-wav_45s.ogg` | 19.2 | -18.1 | -1.0 |  | cozy-music-loop / 679165_Home-Romantic-Piano-wav.ogg | deleted_user_14795591 | 집 꾸미기·식탁·로비(10앱 「우리 집」, ⑪ 마을) — Freesound 루프 「cozy-music-loop」 (45초 미리듣기) |
| 배경음 아늑함 |  | `bgm/bgm_cozy__c11_714579-chill-lofi-sleepy-soft-lo-fi-musi_45s.ogg` | 11.8 | -18.0 | -3.2 |  | cozy-music-loop / 4579_Chill-Lofi-Sleepy-Soft-Lo-Fi-Music-Loop.ogg | LilMati | 집 꾸미기·식탁·로비(10앱 「우리 집」, ⑪ 마을) — Freesound 루프 「cozy-music-loop」 (45초 미리듣기) |
| 배경음 전투 | ★1 | `bgm/bgm_battle__s1-c01_battlethemea.ogg` | 95.9 | -18.0 | -3.6 |  | battle-theme-a / battleThemeA.mp3 | cynicmusic | ⑪ 일반 전투·구슬 판 — 오케스트라 전투, 96초 |
| 배경음 전투 | ★2 | `bgm/bgm_battle__s2-c02_superhero-pack-superhero-original.ogg` | 70.8 | -18.0 | -4.1 |  | adventure-theme / Superhero_pack_SuperHero_original.ogg | CleytonKauffman | ⑪ 일반 전투·구슬 판 — 영웅 모험, 71초 |
| 배경음 전투 | ★3 | `bgm/bgm_battle__s3-c03_prepare-your-swords.ogg` | 88.3 | -16.9 | -1.0 |  | prepare-your-swords / prepare_your_swords.ogg | bojidar-bg | ⑪ 일반 전투·구슬 판 — 행진·긴장, 88초 |
| 배경음 전투 |  | `bgm/bgm_battle__c04_juhani-junkala-retro-game-music-pack-lev_45s.ogg` | 45.0 | -18.0 | -7.2 |  | 5-chiptunes-action / hani Junkala [Retro Game Music Pack] Level 1.wav | SubspaceAudio | ⑪ 일반 전투·구슬 판 — 칩튠 액션, 74초 (도서관엔 45초 미리듣기만) |
| 배경음 전투 |  | `bgm/bgm_battle__c05_juhani-junkala-chiptune-adventures-1-sta_45s.ogg` | 41.1 | -18.0 | -2.8 |  | 4-chiptunes-adventure / ani Junkala [Chiptune Adventures] 1. Stage 1.ogg | SubspaceAudio | ⑪ 일반 전투·구슬 판 — 칩튠 모험, 41초 (도서관엔 45초 미리듣기만) |
| 배경음 전투 |  | `bgm/bgm_battle__c06_alexander-ehlers-free-music-pack-alexand_45s.ogg` | 45.0 | -18.0 | -2.7 |  | free-music-pack /  Music Pack_Alexander Ehlers - Great mission.mp3 | tricksntraps | ⑪ 일반 전투·구슬 판 — 전자 액션, 119초 (도서관엔 45초 미리듣기만) |
| 배경음 전투 |  | `bgm/bgm_battle__c07_alexander-ehlers-free-music-pack-alexand_45s.ogg` | 45.0 | -18.0 | -4.4 |  | free-music-pack / s - Free Music Pack_Alexander Ehlers - Flags.mp3 | tricksntraps | ⑪ 일반 전투·구슬 판 — 전자 액션, 99초 (도서관엔 45초 미리듣기만) |
| 배경음 전투 |  | `bgm/bgm_battle__c08_241431-intro-aivengo-wav_45s.ogg` | 11.1 | -18.0 | -5.2 |  | battle-music-loop / 241431_intro-aivengo-wav.ogg | levelclearer | ⑪ 일반 전투·구슬 판 — Freesound 루프 「battle-music-loop」 (45초 미리듣기) |
| 배경음 전투 |  | `bgm/bgm_battle__c09_263650-hip-hop-loop-confused_45s.ogg` | 21.0 | -18.0 | -5.8 |  | battle-music-loop / 263650_Hip-Hop-Loop-Confused-.ogg | PaynesBeats | ⑪ 일반 전투·구슬 판 — Freesound 루프 「battle-music-loop」 (45초 미리듣기) |
| 배경음 보스 | ★1 | `bgm/bgm_boss__s1-c01_juhani-junkala-epic-boss-battle-seamless.ogg` | 123.4 | -18.0 | -5.9 |  | boss-battle-music / kala - Epic Boss Battle [Seamlessly Looping].wav | SubspaceAudio | ⑪ 대장·포섭 보스전 — 에픽 보스 이음새 루프, 123초 |
| 배경음 보스 | ★2 | `bgm/bgm_boss__s2-c02_cleytonrx-battle-rpg-theme-var.ogg` | 114.3 | -18.0 | -1.5 |  | boss-battle-theme / CleytonRX - Battle RPG Theme Var.ogg | CleytonKauffman | ⑪ 대장·포섭 보스전 — RPG 보스, 114초 |
| 배경음 보스 | ★3 | `bgm/bgm_boss__s3-c03_juhani-junkala-chiptune-adventures-3-bos.ogg` | 71.7 | -18.0 | -3.3 |  | 4-chiptunes-adventure /  Junkala [Chiptune Adventures] 3. Boss Fight.ogg | SubspaceAudio | ⑪ 대장·포섭 보스전 — 칩튠 보스, 72초 |
| 배경음 보스 |  | `bgm/bgm_boss__c04_alexander-ehlers-free-music-pack-alexand_45s.ogg` | 45.0 | -18.0 | -6.7 |  | free-music-pack /  - Free Music Pack_Alexander Ehlers - Doomed.mp3 | tricksntraps | ⑪ 대장·포섭 보스전 — 어두운 전자, 151초 (도서관엔 45초 미리듣기만) |
| 배경음 보스 |  | `bgm/bgm_boss__c05_alexander-ehlers-free-music-pack-alexand_45s.ogg` | 45.0 | -16.6 | -1.0 |  | free-music-pack / sic Pack_Alexander Ehlers - Waking the devil.mp3 | tricksntraps | ⑪ 대장·포섭 보스전 — 어두운 전자, 81초 (도서관엔 45초 미리듣기만) |
| 배경음 보스 |  | `bgm/bgm_boss__c06_148235-cool-theme-song-wav_45s.ogg` | 28.0 | -18.0 | -3.9 |  | boss-music-loop / 148235_cool-theme-song-wav.ogg | nick331999 | ⑪ 대장·포섭 보스전 — Freesound 루프 「boss-music-loop」 (45초 미리듣기) |
| 배경음 보스 |  | `bgm/bgm_boss__c07_265308-8-bit-bossfight_45s.ogg` | 20.8 | -18.0 | -3.9 |  | boss-music-loop / 265308_8-Bit-Bossfight.ogg | Volvion | ⑪ 대장·포섭 보스전 — Freesound 루프 「boss-music-loop」 (45초 미리듣기) |
| 배경음 유아 | ★1 | `bgm/bgm_kids__s1-c01_song17.ogg` | 39.5 | -18.0 | -1.3 |  | happy-lullaby-song17 / song17.mp3 | cynicmusic | 유아 앱 ①④⑩(놀이터·기차·자장가) — 오르골 자장가, 40초 |
| 배경음 유아 | ★2 | `bgm/bgm_kids__s2-c02_talkingcutechiptune.ogg` | 152.0 | -16.9 | -1.0 |  | talking-cute-chiptune / TalkingCuteChiptune.mp3 | Pro Sensory | 유아 앱 ①④⑩(놀이터·기차·자장가) — 귀여운 칩튠, 152초 |
| 배경음 유아 | ★3 | `bgm/bgm_kids__s3-c03_gone-fishin-by-memoraphile-cc0.ogg` | 107.7 | -18.5 | -1.0 |  | gone-fishin / gone_fishin_by_memoraphile_CC0.mp3 | You're Perfect Studio | 유아 앱 ①④⑩(놀이터·기차·자장가) — 경쾌한 낚시, 108초 |
| 배경음 유아 |  | `bgm/bgm_kids__c04_song18_45s.ogg` | 45.0 | -16.5 | -1.0 |  | crystal-cave-song18 / song18.mp3 | cynicmusic | 유아 앱 ①④⑩(놀이터·기차·자장가) — 반짝 동굴, 50초 (도서관엔 45초 미리듣기만) |
| 배경음 유아 |  | `bgm/bgm_kids__c05_beary-fishy-menu-screen-by-memoraphile-c_45s.ogg` | 45.0 | -18.0 | -1.0 |  | gone-fishin / beary_fishy_menu_screen_by_memoraphile_CC0.mp3 | You're Perfect Studio | 유아 앱 ①④⑩(놀이터·기차·자장가) — 메뉴 화면, 72초 (도서관엔 45초 미리듣기만) |
| 배경음 유아 |  | `bgm/bgm_kids__c06_christmas-synths_45s.ogg` | 45.0 | -18.0 | -5.4 |  | happy-synths-loop-with-slight-christmas-feeling / Christmas synths.ogg | 3xBlast | 유아 앱 ①④⑩(놀이터·기차·자장가) — 성탄 느낌 신스 루프, 84초(계절) (도서관엔 45초 미리듣기만) |
| 배경음 유아 |  | `bgm/bgm_kids__c07_425971-birdfish-happy-loop-mp3_45s.ogg` | 18.1 | -18.0 | -1.0 |  | happy-music-loop / 425971_BirdFish-Happy-Loop-mp3.ogg | pinkinblue | 유아 앱 ①④⑩(놀이터·기차·자장가) — Freesound 루프 「happy-music-loop」 (45초 미리듣기) |
| 배경음 유아 |  | `bgm/bgm_kids__c08_484519-happy-night-loop_45s.ogg` | 14.6 | -18.1 | -1.0 |  | happy-music-loop / 484519_Happy-Night-Loop-.ogg | SuperGamerSVK | 유아 앱 ①④⑩(놀이터·기차·자장가) — Freesound 루프 「happy-music-loop」 (45초 미리듣기) |
| 배경음 유아 |  | `bgm/bgm_kids__c09_321713-bona-nit_45s.ogg` | 45.0 | -18.0 | -3.0 |  | lullaby-loop / 321713_bona-nit.ogg | eguaus | 유아 앱 ①④⑩(놀이터·기차·자장가) — Freesound 루프 「lullaby-loop」 (45초 미리듣기) |
| 배경음 유아 |  | `bgm/bgm_kids__c10_445800-bells-100bpm-wav_45s.ogg` | 20.7 | -18.0 | -1.1 |  | lullaby-loop / 445800_Bells-100bpm-wav.ogg | Pax11 | 유아 앱 ①④⑩(놀이터·기차·자장가) — Freesound 루프 「lullaby-loop」 (45초 미리듣기) |
| 배경음 유아 |  | `bgm/bgm_kids__c11_338986-music-box-melody-1_45s.ogg` | 16.1 | -18.0 | -4.3 |  | music-box-loop / 338986_Music-Box-Melody-1.ogg | DRFX | 유아 앱 ①④⑩(놀이터·기차·자장가) — Freesound 루프 「music-box-loop」 (45초 미리듣기) |
| 배경음 유아 |  | `bgm/bgm_kids__c12_485516-swan-lake-tiny-keychain-music-box_45s.ogg` | 12.4 | -18.4 | -1.0 |  | music-box-loop / 516_Swan-Lake-Tiny-Keychain-Music-Box-Loopab.ogg | Rolly-SFX | 유아 앱 ①④⑩(놀이터·기차·자장가) — Freesound 루프 「music-box-loop」 (45초 미리듣기) |

## 출처 URL

- 10-8bit-coin-sounds — Luke.RUSTLTD — https://opengameart.org/content/10-8bit-coin-sounds
- 100-cc0-sfx — rubberduck — https://opengameart.org/content/100-cc0-sfx
- 100-cc0-sfx-2 — rubberduck — https://opengameart.org/content/100-cc0-sfx-2
- 25-cc0-bang-firework-sfx — rubberduck — https://opengameart.org/content/25-cc0-bang-firework-sfx
- 30-cc0-sfx-loops — rubberduck — https://opengameart.org/content/30-cc0-sfx-loops
- 4-chiptunes-adventure — SubspaceAudio — https://opengameart.org/content/4-chiptunes-adventure
- 40-cc0-water-splash-slime-sfx — rubberduck — https://opengameart.org/content/40-cc0-water-splash-slime-sfx
- 5-chiptunes-action — SubspaceAudio — https://opengameart.org/content/5-chiptunes-action
- 50-cc0-retro-synth-sfx — rubberduck — https://opengameart.org/content/50-cc0-retro-synth-sfx
- 512-sound-effects-8-bit-style — SubspaceAudio — https://opengameart.org/content/512-sound-effects-8-bit-style
- 75-cc0-breaking-falling-hit-sfx — rubberduck — https://opengameart.org/content/75-cc0-breaking-falling-hit-sfx
- 80-cc0-rpg-sfx — rubberduck — https://opengameart.org/content/80-cc0-rpg-sfx
- adventure-theme — CleytonKauffman — https://opengameart.org/content/adventure-theme
- ambient-bird-sounds — isaiah658 — https://opengameart.org/content/ambient-bird-sounds
- battle-music-loop — PaynesBeats — https://freesound.org/people/PaynesBeats/sounds/263650/
- battle-music-loop — levelclearer — https://freesound.org/people/levelclearer/sounds/241431/
- battle-theme-a — cynicmusic — https://opengameart.org/content/battle-theme-a
- beach-ocean-waves — qubodup — https://opengameart.org/content/beach-ocean-waves
- boss-battle-music — SubspaceAudio — https://opengameart.org/content/boss-battle-music
- boss-battle-theme — CleytonKauffman — https://opengameart.org/content/boss-battle-theme
- boss-music-loop — Volvion — https://freesound.org/people/Volvion/sounds/265308/
- boss-music-loop — nick331999 — https://freesound.org/people/nick331999/sounds/148235/
- boss-roar — el_boss — https://freesound.org/people/el_boss/sounds/751712/
- boss-roar — el_boss — https://freesound.org/people/el_boss/sounds/751713/
- bubble-pop — FourthWoods — https://freesound.org/people/FourthWoods/sounds/439184/
- bubble-pop — Mafon2 — https://freesound.org/people/Mafon2/sounds/253956/
- bubble-pop — Sess8it — https://freesound.org/people/Sess8it/sounds/762781/
- bubble-pop — arttim — https://freesound.org/people/arttim/sounds/733264/
- bubble-pop — el_boss — https://freesound.org/people/el_boss/sounds/669918/
- bubbles-pop — farfadet46 — https://opengameart.org/content/bubbles-pop
- card-game-sounds — HaelDB — https://opengameart.org/content/card-game-sounds
- cartoon-hit — SieuAmThanh — https://freesound.org/people/SieuAmThanh/sounds/539874/
- celebration — FunnyVoices — https://freesound.org/people/FunnyVoices/sounds/546777/
- celebration — Streetpoptunez — https://freesound.org/people/Streetpoptunez/sounds/653779/
- celebration — joseppujol — https://freesound.org/people/joseppujol/sounds/221548/
- chill-lofi-inspired — omfgdude — https://opengameart.org/content/chill-lofi-inspired
- coin-pickup — cabled_mess — https://freesound.org/people/cabled_mess/sounds/350868/
- coin-pickup — cabled_mess — https://freesound.org/people/cabled_mess/sounds/350870/
- completion-sound — HaelDB — https://opengameart.org/content/completion-sound
- cozy-music-loop — LilMati — https://freesound.org/people/LilMati/sounds/714579/
- cozy-music-loop — deleted_user_14795591 — https://freesound.org/people/deleted_user_14795591/sounds/679165/
- crystal-cave-song18 — cynicmusic — https://opengameart.org/content/crystal-cave-song18
- dramatic-impact — AudioPapkin — https://freesound.org/people/AudioPapkin/sounds/814934/
- dramatic-impact — modusmogulus — https://freesound.org/people/modusmogulus/sounds/785930/
- dramatic-impact — qubodup — https://freesound.org/people/qubodup/sounds/812593/
- electric-zap — AnthonyChan0 — https://freesound.org/people/AnthonyChan0/sounds/264779/
- fire-spell — qubodup — https://freesound.org/people/qubodup/sounds/442872/
- fireplace-sound-loop — PagDev — https://opengameart.org/content/fireplace-sound-loop
- free-music-pack — tricksntraps — https://opengameart.org/content/free-music-pack
- game-over — LilMati — https://freesound.org/people/LilMati/sounds/435157/
- game-over — LilMati — https://freesound.org/people/LilMati/sounds/435194/
- gone-fishin — You're Perfect Studio — https://opengameart.org/content/gone-fishin
- happy-lullaby-song17 — cynicmusic — https://opengameart.org/content/happy-lullaby-song17
- happy-music-loop — SuperGamerSVK — https://freesound.org/people/SuperGamerSVK/sounds/484519/
- happy-music-loop — pinkinblue — https://freesound.org/people/pinkinblue/sounds/425971/
- happy-synths-loop-with-slight-christmas-feeling — 3xBlast — https://opengameart.org/content/happy-synths-loop-with-slight-christmas-feeling
- heal-spell — colorsCrimsonTears — https://freesound.org/people/colorsCrimsonTears/sounds/562292/
- healing — Loyalty_Freak_Music — https://freesound.org/people/Loyalty_Freak_Music/sounds/407479/
- healing — colorsCrimsonTears — https://freesound.org/people/colorsCrimsonTears/sounds/562292/
- ice-spell — Relenzo2 — https://freesound.org/people/Relenzo2/sounds/160420/
- impact — qubodup — https://opengameart.org/content/impact
- jrpg-pack-1-exploration — SubspaceAudio — https://opengameart.org/content/jrpg-pack-1-exploration
- kenney_casino-audio — Kenney — https://kenney.nl/assets/casino-audio
- kenney_digital-audio — Kenney — https://kenney.nl/assets/digital-audio
- kenney_impact-sounds — Kenney — https://kenney.nl/assets/impact-sounds
- kenney_interface-sounds — Kenney — https://kenney.nl/assets/interface-sounds
- kenney_music-jingles — Kenney — https://kenney.nl/assets/music-jingles
- kenney_sci-fi-sounds — Kenney — https://kenney.nl/assets/sci-fi-sounds
- kenney_ui-audio — Kenney — https://kenney.nl/assets/ui-audio
- level-up — Jofae — https://freesound.org/people/Jofae/sounds/368651/
- level-up — pooffles — https://freesound.org/people/pooffles/sounds/532708/
- lullaby-loop — Pax11 — https://freesound.org/people/Pax11/sounds/445800/
- lullaby-loop — eguaus — https://freesound.org/people/eguaus/sounds/321713/
- magic-chime — ZenithInfinitiveStudios — https://freesound.org/people/ZenithInfinitiveStudios/sounds/376744/
- magic-chime — ZenithInfinitiveStudios — https://freesound.org/people/ZenithInfinitiveStudios/sounds/376746/
- magic-chime — ZenithInfinitiveStudios — https://freesound.org/people/ZenithInfinitiveStudios/sounds/376749/
- magic-spell — LilMati — https://freesound.org/people/LilMati/sounds/495453/
- magic-spell — LilMati — https://freesound.org/people/LilMati/sounds/659762/
- magic-spell-sfx — JaggedStone — https://opengameart.org/content/magic-spell-sfx
- magic-whoosh — DustyWind — https://freesound.org/people/DustyWind/sounds/715784/
- magic-whoosh — NearTheAtmoshphere — https://freesound.org/people/NearTheAtmoshphere/sounds/683178/
- magic-whoosh — NearTheAtmoshphere — https://freesound.org/people/NearTheAtmoshphere/sounds/683182/
- medieval-minstrel-dance — RandomMind — https://opengameart.org/content/medieval-minstrel-dance
- monster-roar — Chobiboko — https://freesound.org/people/Chobiboko/sounds/261147/
- monster-roar — colorsCrimsonTears — https://freesound.org/people/colorsCrimsonTears/sounds/537883/
- music-box-loop — DRFX — https://freesound.org/people/DRFX/sounds/338986/
- music-box-loop — Rolly-SFX — https://freesound.org/people/Rolly-SFX/sounds/485516/
- next-to-you — Joth — https://opengameart.org/content/next-to-you
- power-up — Joao_Janz — https://freesound.org/people/Joao_Janz/sounds/478336/
- power-up — Joao_Janz — https://freesound.org/people/Joao_Janz/sounds/478342/
- power-up — Joao_Janz — https://freesound.org/people/Joao_Janz/sounds/478343/
- power-up — SignatureSoundsOrg — https://freesound.org/people/SignatureSoundsOrg/sounds/869684/
- power-up — SignatureSoundsOrg — https://freesound.org/people/SignatureSoundsOrg/sounds/869689/
- power-up — SignatureSoundsOrg — https://freesound.org/people/SignatureSoundsOrg/sounds/869695/
- prepare-your-swords — bojidar-bg — https://opengameart.org/content/prepare-your-swords
- punch-impact — G40X — https://freesound.org/people/G40X/sounds/770176/
- rpg-sound-pack — artisticdude — https://opengameart.org/content/rpg-sound-pack
- shield-block — colorsCrimsonTears — https://freesound.org/people/colorsCrimsonTears/sounds/641895/
- shield-block — colorsCrimsonTears — https://freesound.org/people/colorsCrimsonTears/sounds/641896/
- shop-theme — CleytonKauffman — https://opengameart.org/content/shop-theme
- short-applause — craigsmith — https://freesound.org/people/craigsmith/sounds/480686/
- snowfall — Kistol — https://opengameart.org/content/snowfall
- spell-cast — SypherZent — https://freesound.org/people/SypherZent/sounds/420677/
- spell-cast — Wavewire — https://freesound.org/people/Wavewire/sounds/837459/
- spell-cast — colorsCrimsonTears — https://freesound.org/people/colorsCrimsonTears/sounds/577965/
- star-collect — LilMati — https://freesound.org/people/LilMati/sounds/443258/
- star-collect — LilMati — https://freesound.org/people/LilMati/sounds/515736/
- story-time — HaelDB — https://opengameart.org/content/story-time
- success-chime — 1bob — https://freesound.org/people/1bob/sounds/717771/
- talking-cute-chiptune — Pro Sensory — https://opengameart.org/content/talking-cute-chiptune
- the-field-of-dreams — pauliuw — https://opengameart.org/content/the-field-of-dreams
- town-theme-rpg — cynicmusic — https://opengameart.org/content/town-theme-rpg
- twinkle — 1urker — https://freesound.org/people/1urker/sounds/457306/
- ui-click — SignatureSoundsOrg — https://freesound.org/people/SignatureSoundsOrg/sounds/869217/
- victory-fanfare — colorsCrimsonTears — https://freesound.org/people/colorsCrimsonTears/sounds/580310/
- victory-fanfare — mickleness — https://freesound.org/people/mickleness/sounds/269198/
- win-jingle — Fupicat — https://freesound.org/people/Fupicat/sounds/607207/
- wind — IgnasD — https://opengameart.org/content/wind
- yay — Reitanna — https://freesound.org/people/Reitanna/sounds/235122/
- yay — rabeladdie — https://freesound.org/people/rabeladdie/sounds/828064/
- yay — tab.tmg020 — https://freesound.org/people/tab.tmg020/sounds/472869/
