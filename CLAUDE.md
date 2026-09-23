# 기하학 가족 — 작업 문서 (Claude Code 진입점)

> **이 세션은 HUB(gf-hub) 다.** 종합·시나리오·캐릭터 일관성·배포를 담당한다.
> 쇼츠·블로그·게임은 필요해지면 별도 세션으로 떼어낸다 → `docs/07_MULTI_SESSION.md`.
> 허브가 끝까지 쥐는 것: 세계관·에피소드 창작·`src/`·`assets/`·`docs/`·웹툰 조립·배포·일관성 검증.

세 도형 가족(네모·세모·동그라미)이 **같은 사건**을 각자 다르게 겪는 잔잔한 감성 웹툰.
캐릭터는 **SVG 코드**라 AI 이미지가 필요 없고, 매 컷 100% 동일하며, 저작권이 깨끗하다.
이 프로젝트는 웹툰 회사가 아니라 **IP 공장**의 2호 트랙이다 (1호: `C:\projects\starry-village`).

최종 갱신: 2026-09-16 (재구축)

읽는 순서: **`docs/00_WHITEPAPER.md`(백서, 최상위)** → 이 파일 → `HANDOFF.md` → `docs/03_STYLE_GUIDE.md`(그림 규격) → 작업 대상.

---

## 1. 원칙 (불변)

### 1-0. 세 도형의 역할
네모 = 평범·화자(블로그 이름). 세모 = 매력·얼굴(굿즈 주역, 특히 아내). 동그라미 = 완벽·마크. 기본 표정은 웃음.
어른은 50 전후지만 **얼굴은 귀엽게 유지**하고 나이는 소품·대사·배경으로 낸다 (D5, 백서 §5).

### 1-1. 캐릭터 정본 = 시트, 배치 = 코드
세모 아내부터 **ChatGPT 시트(`assets/<char>/_sheet/`)가 정본**(D4). 생성 방법론은 `docs/05_CHATGPT_ART_PIPELINE.md`, **복사용 프롬프트 12인분은 `docs/06_PROMPTS_READY.md`** 를 글자 그대로 따른다.
코드(`src/characters.js`)는 배치·포즈·컷 조립·손맛 렌더를 담당. 코드 캐릭터(네모·동그라미)는 시트가 승인될 때까지 유지.
표정(`emo`)·시선(`gaze`)·상복(`suit`)만 파라미터. 새 디테일이 필요하면 함수에 추가하고 시트로 검증한다.

### 1-2. 하나의 사건, 세 가족의 반응
매 화는 사건 1개. 네모=벅참과 결핍, 세모=극단(전투 or 행복), 동그라미=완벽한데 외롭다.
세 가족이 다 나올 필요는 없다. 결말은 잔잔하게, 설명하지 않는다.

### 1-3. 댓글형 컷툰
매 화 끝은 반드시 **"당신은 어느 도형인가요?"** + 댓글 CTA. 좋은 사연은 동의 받아 외전으로.
이 CTA 가 IP 의 반복 노출 장치다. 바꾸지 않는다.

### 1-4. 단일 HTML, 외부 의존 최소
`web/epNN.html` 하나 = 한 화. vanilla JS + SVG. 폰트만 Google Fonts. 서버·DB 없음.
투표는 localStorage(표시용). 실제 집계는 배포 플랫폼의 댓글/폼으로.
배포는 `python tools/build.py` → `dist/` (characters.js 인라인).

### 1-5. 원고는 작가 것, 각색은 데이터
`docs/01_STORY_SOURCE.md` 원문은 손대지 않는다. 컷 구성·대사 다듬기는 `web/epNN.html` 안에서.
피곤함·불행을 앞세우지 않는다. 행복이 우선, 아이러니는 뒤에.

### 1-6. 실존 인물·사건 아님
1화 부고의 이름·병원은 허구. 실존과 겹치면 바꾼다. 페이지 하단 고지 유지.

---

## 2. 폴더

```
geometric-family/
├── CLAUDE.md / HANDOFF.md / DEVLOG.md / DECISIONS.md
├── docs/00_MASTER.md        ← 허브: 세 가족·캐릭터 API·로드맵
│   └── 01_STORY_SOURCE.md   ← 작가 원고 (docx 이관)
├── src/characters.js        ← 캐릭터 코드 시스템 (유일한 진실)
├── web/characters.html      ← 캐릭터 시트 (검증용)
│   └── ep01.html …          ← 한 화 = 한 파일
├── dist/                    ← 빌드 산출 (gitignore)
├── content/episodes|shorts|blog ← 파생 콘텐츠
├── tools/build.py           ← 인라인 빌드
└── notes/
```

## 3. 작업 루프
```
원고(docs/01) → 컷 구성(web/epNN.html) → 헤드리스 스크린샷 → 육안 검증 → 수정 → build → 배포
```
- 검증은 playwright(스크린샷 fullPage). 캐릭터 함수를 고쳤으면 `web/characters.html` 도 다시 본다.
- 보고는 5줄 이내. 세션 끝에 HANDOFF/DEVLOG 갱신.

## 4. 하지 않는 것
프레임워크, AI 이미지로 캐릭터 대체, 서버 투표, 한 화에 사건 2개, 설명하는 결말.
