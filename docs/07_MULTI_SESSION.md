# 07. 멀티 세션 운영 규약 — Claude Code 4개를 붙이는 법

작성 2026-09-23. 한 채팅에서 웹툰·글·게임·아트를 전부 하면 맥락이 섞이고 느려진다.
**세션을 넷으로 쪼개되, 하나의 저장소·하나의 세계관을 공유한다.**

## 1. 네 개의 세션과 소유 구역

| 세션 | 이름 | 소유(쓰기 가능) | 읽기 전용 | 산출 |
|---|---|---|---|---|
| **A** | `gf-art` | `src/` `assets/` `tools/` `web/characters.html` `web/faces.html` `web/women.html` `web/goods.html` `web/touch.html` `docs/03` `docs/05` `docs/06` | 나머지 전부 | 캐릭터 시트 반입·렌더 엔진·굿즈 아트보드·배포 |
| **B** | `gf-toon` | `web/ep*.html` `content/episodes/` | `src/` `assets/` | 웹툰 화 조립(6컷)·컷 PNG 내보내기 |
| **C** | `gf-word` | `content/blog/` `content/shorts/` `content/seeds/` `docs/01` `docs/02` | 전부 | 블로그 뼈대·쇼츠 대본·이야기 수집 |
| **D** | `gf-game` | `games/` `data/` | `src/` `assets/` | 유아 게임 시리즈 |

**공유(전원 읽기, A만 쓰기)**: `src/characters.js`, `assets/**`
**공유(전원 읽기, 각자 자기 줄만 추가)**: `DEVLOG.md` — 맨 끝에 한 줄 append 만. 중간 수정 금지.
**최상위 문서**(`docs/00_WHITEPAPER.md` `CLAUDE.md` `HANDOFF.md` `DECISIONS.md`): **사람이 결정하고 A가 기록.** 다른 세션은 제안만.

> 규칙 한 줄: **남의 폴더를 고치지 않는다.** 필요하면 그 세션에 메시지를 보낸다.

## 2. 충돌을 막는 git 규칙
```
작업 시작 전:  git pull --rebase
작업 후:       git add <자기 구역만>  →  git commit  →  git pull --rebase  →  git push
```
- `git add -A` **금지**(남의 작업이 딸려온다). 반드시 자기 폴더 경로를 지정한다.
- 커밋 메시지 앞에 세션 태그: `[art]` `[toon]` `[word]` `[game]`
- 배포(`bash tools/deploy.sh`)는 **A만** 한다. 다른 세션은 "배포 요청"을 A에게 보낸다.
- 브랜치는 쓰지 않는다(1인 운영에서 머지 비용이 더 크다). 폴더 소유권으로 충돌을 막는다.

## 3. 세션 띄우는 법
```powershell
# 각각 별도 터미널 창에서
cd C:\projects\geometric-family
claude --remote-control gf-art      # A
claude --remote-control gf-toon     # B
claude --remote-control gf-word     # C
claude --remote-control gf-game     # D
```
- `--remote-control <이름>` 으로 이름을 붙이면 **폰·claude.ai 에서 세션이 이름으로 구분**된다.
- 설정에 `remoteControlAtStartup: true` 가 켜져 있으면 플래그 없이 `claude` 만 쳐도 켜진다(이름은 자동).
- 첫 메시지로 **자기 역할을 알려준다** (§4 프롬프트).

## 4. 각 세션의 첫 메시지 (복사용)

**A (gf-art)**
```
너는 이 프로젝트의 art 세션이다. docs/00_WHITEPAPER.md 와 docs/03_STYLE_GUIDE.md, docs/07_MULTI_SESSION.md 를 먼저 읽어라.
너의 소유 구역은 src/ assets/ tools/ web/characters.html web/faces.html web/women.html web/goods.html web/touch.html docs/03 docs/05 docs/06 이다.
다른 폴더는 읽기만 한다. 커밋은 자기 구역만, 메시지 앞에 [art] 를 붙인다. 배포(deploy.sh)는 너만 한다.
지금 할 일: assets/_inbox 에 들어온 시트를 반입하고, docs/06 체크리스트를 채워라.
```
**B (gf-toon)**
```
너는 이 프로젝트의 toon 세션이다. docs/00_WHITEPAPER.md, content/episodes/EPISODES.md, docs/07_MULTI_SESSION.md 를 먼저 읽어라.
너의 소유 구역은 web/ep*.html 과 content/episodes/ 다. src/characters.js 와 assets/ 는 읽기만 하고 절대 고치지 않는다.
캐릭터에 없는 표정·소품이 필요하면 art 세션에 SendMessage 로 요청한다. 커밋 메시지 앞에 [toon].
지금 할 일: EPISODES.md 의 E01「단톡방」을 6컷 + 투표 CTA 로 web/ep02.html 에 만들어라. 형식은 web/ep01.html 을 따르되 6컷으로 줄인다.
```
**C (gf-word)**
```
너는 이 프로젝트의 word 세션이다. docs/00_WHITEPAPER.md, docs/02_IP_STRATEGY.md, content/episodes/EPISODES.md 를 먼저 읽어라.
너의 소유 구역은 content/blog/ content/shorts/ content/seeds/ docs/01 docs/02 다.
**본문 글은 네가 쓰지 않는다.** 제목 후보 3개, 소제목, 들어갈 컷, 분량 가이드까지만 만들고 사람이 채운다 (백서 §2 역할표).
쇼츠 대본은 3포맷(A 세 반응 / B 한 마디 / C 어느 도형?)만 쓴다. 커밋 메시지 앞에 [word].
지금 할 일: E09「보험 전화」를 쇼츠 1호 대본으로, 그리고 공식 블로그 첫 글 3편의 뼈대를 만들어라.
```
**D (gf-game)**
```
너는 이 프로젝트의 game 세션이다. docs/00_WHITEPAPER.md 와 C:\projects\starry-village\games\dress-story\index.html (엔진 참고) 를 먼저 읽어라.
너의 소유 구역은 games/ 와 data/ 다. src/characters.js 와 assets/ 는 읽기만 한다.
단일 HTML + data JSON + localStorage. 서버·광고·결제 없음. 커밋 메시지 앞에 [game].
지금 할 일: games/shape-match/index.html — 유아용 「도형 맞추기」 프로토. 빈 자리에 맞는 도형을 끌어다 놓으면 그 도형이 춤춘다.
```

## 5. 세션끼리 말하는 법
- `ListAgents` 로 살아 있는 세션 확인 → `SendMessage({to:"gf-art", message:"..."})`
- **요청은 구체적으로**: "세모 아내 `shrug` 표정이 필요하다. 없으면 대체안을 알려달라."
- 남의 구역 파일을 고쳐달라는 요청만 한다. **내가 직접 고치지 않는다.**
- 사람의 결정이 필요한 것(그림체 변경, 새 채널, 돈)은 세션끼리 정하지 않고 사람에게 올린다.

## 6. 하루 흐름 (예시)
```
아침  사람: 오늘 뭐 할지 각 세션에 한 줄씩
      A: _inbox 반입 → 렌더 → 배포
      C: 쇼츠 대본 2개 + 블로그 뼈대 1개
낮    B: 웹툰 1화 조립 → A에게 "배포 요청"
      D: 게임 프로토 한 기능
저녁  사람: 블로그 본문 작성(직접), 컷 검수
      A: 배포 + DEVLOG 한 줄
```

## 7. 하지 말 것
- 두 세션이 같은 파일을 연다 (소유 구역 위반)
- `git add -A`, `git push --force`
- A가 아닌 세션이 배포
- 세션끼리 사람 결정을 대신한다
- 한 세션이 여러 역할을 겸한다 (그럴 거면 세션을 나눈 의미가 없다)
