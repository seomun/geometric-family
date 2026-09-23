# 07. 세션 운영 규약 — 허브 1개에서 4개로 단계적 분화

작성 2026-09-23 / 개정 2026-09-23 (단계적 분화 모델 채택).
처음부터 넷으로 쪼개지 않는다. **허브 하나로 시작해서, 병목이 생기는 순서대로 떼어낸다.**

## 0. 원칙 세 줄
1. **허브는 절대 안 나눈다.** 세계관·시나리오·캐릭터 일관성·배포는 끝까지 허브가 쥔다.
2. **떼어내는 건 "생산량이 많고 맥락이 얕은" 일부터.** 쇼츠 → 블로그 → 게임 순.
3. **저장소는 하나다.** 캐릭터 자산이 한 곳에 있어야 일관성이 유지된다. 나누는 건 세션이지 저장소가 아니다.

---

## 1. 단계

### 🟢 Phase 0 — 지금: 허브 1개
```
[HUB] gf-hub  ← 이 세션
```
**하는 일 전부**: 세계관·에피소드 뱅크·캐릭터 시트 반입·웹툰 조립·굿즈 아트보드·문서·배포
**왜 아직 안 나누나**: 주 1화도 안 나가는 단계에서 나누면 세션끼리 상태 동기화 비용이 더 크다.

### 🟡 Phase 1 — 쇼츠 분리
**분리 신호**: 웹툰이 주 1회로 안정되고, 쇼츠를 **주 2개 이상** 만들어야 할 때 (≈ 3~4화 시점)
```
[HUB] gf-hub ──(에피소드·캐릭터 제공)──▶ [S] gf-shorts
```
| | gf-shorts |
|---|---|
| 소유 | `content/shorts/` `tools/shorts_*.py` |
| 읽기 | `content/episodes/` `src/` `assets/` `docs/` |
| 하는 일 | 3컷 대본 → 1080×1920 컷 PNG 내보내기 → 자막 타이밍표 → 썸네일 |
| 금지 | 캐릭터 수정, 에피소드 창작(허브가 준 것만 각색), 배포 |

### 🟠 Phase 2 — 블로그 분리
**분리 신호**: 블로그 2개(개인·공식)가 열리고 주 2편 이상 필요할 때
```
[HUB] ──▶ [S] gf-shorts
  └──────▶ [W] gf-blog
```
| | gf-blog |
|---|---|
| 소유 | `content/blog/` `content/seeds/` |
| 읽기 | 전부 |
| 하는 일 | 제목 후보 3·소제목·삽입 컷·분량 가이드 / 이야기 수집(`collect_stories.py`) / 게시 URL 기록 |
| 금지 | **본문 집필**(사람이 쓴다), 캐릭터 수정, 배포 |

### 🔵 Phase 3 — 게임 분리
**분리 신호**: 「도형 맞추기」 프로토가 돌아가고 시리즈 2호를 시작할 때
```
[HUB] ──▶ [S] gf-shorts   [W] gf-blog   [G] gf-game
```
| | gf-game |
|---|---|
| 소유 | `games/` `data/` |
| 읽기 | `src/` `assets/` `docs/00` |
| 하는 일 | 유아 게임 시리즈(단일 HTML + data JSON + localStorage) |
| 금지 | 캐릭터 수정, 서버·광고·결제, 배포(게임은 별도 경로라 허브와 협의) |

---

## 2. 허브가 끝까지 쥐는 것 (= 분화해도 안 넘기는 권한)

| 권한 | 왜 |
|---|---|
| **세계관·캐릭터 설정** | 여기가 흔들리면 전 채널이 흔들린다 |
| **에피소드 창작·승인** | 시나리오가 한 사람(세션)의 머리에서 나와야 톤이 유지된다 |
| **`src/characters.js` `assets/**` 쓰기** | 캐릭터 일관성의 물리적 근거 |
| **`docs/**` 쓰기** | 규격·결정 기록 |
| **웹툰 조립 (`web/ep*.html`)** | 캐릭터 코드와 가장 밀접. 떼면 손이 더 간다 |
| **배포 (`deploy.sh`)** | 마지막 검수 지점 |
| **스냅샷 일관성 검증** | `node tools/snapshot.js` 로 그림이 변형됐는지 확인 |

→ **허브 = 쇼러너(showrunner).** 나머지는 그 회차를 각자 매체로 옮기는 팀이다.

---

## 3. 충돌 방지 (분화 이후)
```
작업 전:  git pull --rebase
작업 후:  git add <자기 폴더만>  →  git commit -m "[shorts] ..."  →  git pull --rebase  →  git push
```
- `git add -A` **금지**. `git push --force` **금지**.
- 커밋 태그: `[hub]` `[shorts]` `[blog]` `[game]`
- 남의 폴더가 필요하면 고치지 말고 `SendMessage` 로 요청한다.
- **배포는 허브만.** 다른 세션은 "배포 요청"을 보낸다.

## 4. 세션 띄우기
```powershell
cd C:\projects\geometric-family
claude --remote-control gf-hub       # 지금 이 세션 (이미 실행 중이면 /remote-control)
claude --remote-control gf-shorts    # Phase 1
claude --remote-control gf-blog      # Phase 2
claude --remote-control gf-game      # Phase 3
```
이름을 붙이면 폰·claude.ai 에서 세션이 이름으로 구분된다. `remoteControlAtStartup: true` 가 켜져 있어 플래그 없이도 켜진다.

## 5. 분화할 때 새 세션에 주는 첫 메시지

**gf-shorts**
```
너는 「기하학 가족」의 shorts 세션이다. docs/00_WHITEPAPER.md, docs/07_MULTI_SESSION.md, content/episodes/EPISODES.md 를 먼저 읽어라.
소유 구역은 content/shorts/ 와 tools/shorts_*.py 뿐이다. src/ assets/ content/episodes/ 는 읽기만 한다.
허브(gf-hub)가 정한 에피소드를 3컷 쇼츠로 옮기는 것이 네 일이다. 새 이야기를 만들지 않는다.
포맷은 셋뿐: A 세 반응 / B 한 마디 / C 어느 도형?. 10~20초, 나레이션 없이 자막. 마지막 컷은 항상 "당신은 어느 도형인가요?".
캐릭터에 없는 표정·소품이 필요하면 gf-hub 에 SendMessage 로 요청한다. 커밋은 [shorts] 태그, 배포는 하지 않는다.
```
**gf-blog**
```
너는 「기하학 가족」의 blog 세션이다. docs/00_WHITEPAPER.md, docs/02_IP_STRATEGY.md, docs/07 을 먼저 읽어라.
소유 구역은 content/blog/ 와 content/seeds/ 다.
블로그는 둘이다 — ① 개인 「네모의 …」(사람이 평소 쓰던 글) ② 공식 연재 계정(화 게시 + 세계관 풀이 + 굿즈 시안).
**본문은 절대 네가 쓰지 않는다.** 제목 후보 3개, 소제목, 들어갈 컷, 분량 가이드까지만. 사람이 채운다.
주 1회 python tools/collect_stories.py 로 사연을 모아 TOP5 를 허브에 넘긴다. 커밋은 [blog] 태그, 배포는 하지 않는다.
```
**gf-game**
```
너는 「기하학 가족」의 game 세션이다. docs/00_WHITEPAPER.md 와 C:\projects\starry-village\games\dress-story\index.html (엔진 참고) 를 먼저 읽어라.
소유 구역은 games/ 와 data/ 다. src/ assets/ 는 읽기만 한다.
유아용(3~6세) 시리즈: 도형 맞추기 → 색칠 → 꾸미기. 단일 HTML + data JSON + localStorage. 서버·광고·결제 없음.
캐릭터 이미지는 assets/<캐릭터>/*.png 를 그대로 쓴다. 커밋은 [game] 태그, 배포는 허브와 협의한다.
```

## 6. 허브가 매일 하는 일 (분화 이후)
1. 아침: 각 세션에 한 줄씩 지시 (`SendMessage`)
2. 낮: 시트 반입 → 웹툰 조립 → 스냅샷으로 일관성 확인
3. 저녁: 각 세션 산출물 검수 → 배포 → `DEVLOG.md` 한 줄
4. 주 1회: 에피소드 뱅크 보충, KPI 표 갱신

## 7. 하지 말 것
- 필요하지도 않은데 미리 분화하기 (Phase 신호가 오기 전에는 허브 하나)
- 저장소를 나누기 (캐릭터 자산이 갈라지는 순간 일관성이 끝난다)
- 허브가 아닌 세션이 캐릭터·문서·배포를 건드리기
- 세션끼리 사람의 결정(그림체 변경·새 채널·지출)을 대신하기
