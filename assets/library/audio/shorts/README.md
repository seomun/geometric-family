# 쇼츠 소리 묶음 (gf-asset, 2026-10-27)

직접 합성(CC0). 게임 v2·옛날이야기와 같은 조(C 펜타토닉)·질감·잔향이고, **같은 시리즈 모티프 M = 솔·라·도·미·솔(G4 A4 C5 E5 G5)** 를 쓴다(쇼츠 로고는 마림바·종, 옛날이야기 징글은 가야금·대금). 기준표 `docs/48_UNITY_STANDARD.md`. 도구 `tools/asset_shorts_sound.py`.

| 파일 | 쓰는 곳 | 비고 |
|---|---|---|
| `theme_short.ogg` | 쇼츠 나레이션 밑 배경음 | 30초 이음새 루프, −20 LUFS. 말소리 대역(1.5~3.5kHz)을 −8dB 비움. 12마디 C 펜타토닉, 4마디마다 모티프를 종으로 |
| `logo_sting.ogg/.wav` | 쇼츠 맨 끝 엔딩 카드의 소리 로고 | 2.9초(소리 2초 + 잔향). 모티프를 마림바로 올라가 C 화음으로 닫힘 |
| `sting_hook.ogg/.wav` | 첫 컷 훅 「뿅」 | 1.3초 |
| `sting_choice.ogg/.wav` | 「①②③ 댓글에 번호만」 선택 질문 컷 | 2.2초 부드러운 딩동 |
| `whoosh.ogg/.wav` | 컷 전환 | 0.9초 |

쓰는 법(`tools/shorts_video.py`, gf-shorts 도구): `--bgm assets/library/audio/shorts/theme_short.ogg --bgm-vol 0.25~0.35`(목소리 위 약 −10~−12dB, 최종 통합 −14~−16 LUFS). 로고·스팅은 마지막 컷 끝에서 `adelay` 로 얹는다.
시각: `assets/library/shorts/endcard_choice.png`(1080×1920, 글자 포함) · `_notext.png` · `.svg`(글자 자리 id).
