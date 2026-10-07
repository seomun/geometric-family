# 「기하학 가족」 음악 — Suno로 직접 만들기 (2026-10-07)

> 작가 결정: 외주 없이 AI 툴로 만든다. 슬롯 목록·작곡 지침은 `docs/16_SOUND.md`, 외주용 브리프는 `games/audio/MUSIC_BRIEF.md`(보관).

## 0. 시작 전 (중요)
1. **Suno Pro(월 $10)를 먼저 결제**하고 만든다. 무료로 만든 곡은 나중에 결제해도 상업 권리가 생기지 않는다. 유료 기간에 **내려받은 곡**은 해지 후에도 상업 이용 가능.
2. Pro = 한 달 내려받기 20곡. 슬롯 7개 × 고른 곡만 내려받는다(듣기는 무제한).
3. 만들 때 **Instrumental(가사 없음) 켜기**. 아래 Style 칸을 그대로 붙인다(영어가 결과가 안정적).
4. 프롬프트마다 2~4번 생성 → 귀로 고르기 → 고른 것만 내려받기(MP3 또는 WAV).
5. 받은 파일 이름을 슬롯 이름으로 바꿔 `assets/_inbox/music/` 에 넣는다(예: `theme_main.mp3`) → 허브가 `python tools/music_prep.py` 로 다듬어 게임·쇼츠에 넣는다.
6. 받은 곡마다 Suno 곡 링크를 이 문서 §3 표에 적는다(출처 기록).

## 1. 슬롯별 Style 프롬프트 (그대로 복사)
| 슬롯 | 어디에 | 길이 | Style (Instrumental) |
|---|---|---|---|
| **theme_main** | 게임 타이틀·홈, 채널 대표곡 | 60~90초 | `warm acoustic instrumental, marimba, ukulele, glockenspiel, soft hand percussion, cheerful family neighborhood theme, memorable simple 4-note melody, C major, 92 bpm, cozy children's animation, no vocals` |
| **theme_kids** | 유아 게임 놀이 중 | 60초+ | `gentle music box and celesta lullaby, soft felt piano, slow 72 bpm, warm and sleepy, toddler friendly, no drums, no high pitched sounds, calm loop, no vocals` |
| **night** | 유아 4장 밤길 | 60초+ | `peaceful night lullaby, soft piano and celesta, twinkling bells, major key, 66 bpm, calm storybook night, no drums, no vocals` |
| **theme_short** | 쇼츠·릴스 나레이션 밑 | 30초+ | `minimal warm piano with light pizzicato strings, hopeful slice of life, sparse and quiet, leaves space for voice narration, 84 bpm, no drums, no vocals` |
| **idle_main** | 방치형 「세 가족 식탁」 | 90초+ | `cozy evening dinner music, nylon guitar, warm rhodes, soft brushed drums, nostalgic and gentle, family kitchen, relaxed 80 bpm, korean slice of life drama feel, no vocals` |
| **ending_sting** | 방치형 엔딩·2편 마지막 | 20~30초 | `short heartwarming ending, strings and glockenspiel swell, family reunion, gentle and emotional, major key, no vocals` |
| **logo_sting** | 쇼츠 엔딩 카드·게임 시작 | 2초 | 따로 만들지 않는다 → **theme_main 의 첫 네 음**을 잘라 쓴다(`music_prep.py --sting`) |

**피할 것(나오면 버린다)**: 가사·허밍, 날카로운 고음(유아), 큰 드럼, 슬프거나 무서운 분위기, 유명 곡과 비슷한 멜로디.
**고르는 기준**: ① 첫 4초에 "기하학 가족" 느낌(따뜻·귀여움) ② 반복해 들어도 안 질림 ③ 테마는 **첫 네 음이 흥얼거려지는가**(소리 로고).

## 2. 세 가족 동기(선택, 테마 시안이 마음에 들면)
Suno 의 Extend/Cover 로 같은 테마를 세 버전으로:
- 네모: `same melody, busy marimba and ukulele, bouncy` · 세모: `same melody, call and response between flute and ukulele, playful` · 동그라미: `same melody, slow celesta and soft pad, slightly lonely`
→ 쇼츠에서 가족 장면마다 바꿔 깔 수 있다.

## 3. 출처 기록
| 슬롯 | Suno 곡 링크 | 생성일 | 플랜 | 비고 |
|---|---|---|---|---|
| theme_main | | | Pro | |
| theme_kids | | | Pro | |
| night | | | Pro | |
| theme_short | | | Pro | |
| idle_main | | | Pro | |
| ending_sting | | | Pro | |
