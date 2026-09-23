# 현재 상태 — 기하학 가족

갱신 2026-09-18 (v6). 폴더 `C:\projects\geometric-family`. 먼저 `CLAUDE.md`.

## 지금 있는 것
- `src/characters.js` **v6 굿즈 에디션** — 헬로키티 문법(플랫·균일 외곽선·팔다리). 표정 12·포즈 10·소품 10. 규격 잠금: `docs/03_STYLE_GUIDE.md`.
  일관성 검증: `node tools/snapshot.js` → `notes/snapshots/`. 캐릭터를 고치면 직전 스냅샷과 비교한다.
- `web/characters.html` 캐릭터 시트, `web/ep01.html` 1화 「부고」 완성본(11컷 + 투표 CTA + 2화 예고).
- **배포됨**: https://seomun.github.io/geometric-family/ (gh-pages 브랜치 = dist/). 재배포는 `bash tools/deploy.sh`.
- 사업 전체 흐름: `docs/04_IP_BUSINESS.md` (네모=화자/블로그, 세모=얼굴/굿즈, 동그라미=마크; 블로그→웹툰→쇼츠→굿즈→유아 게임→이모티콘→라이선싱; P1~P3 로드맵).
- **이야기 수집기** `python tools/collect_stories.py` → `content/seeds/inbox/` (주 1회). 소스 `tools/sources.json`. 형식 2안(6컷+네모의 글)은 02 §3-6.
- 굿즈 아트보드 `web/goods.html`: 노트 3종(엿보기/칼·방패/사랑) + 스티커. 세모 아내가 굿즈 주역.
- 채널별 전략: `docs/02_IP_STRATEGY.md` — 채널별 형식(쇼츠 A/B/C 고정 포맷), 주간 리듬, AI/사람 역할, 4주 KPI.
- 스크린샷: `notes/2026-09-16_characters.png`, `notes/2026-09-16_ep01.png`.

## 🧩 멀티 세션: `docs/07_MULTI_SESSION.md` — art/toon/word/game 4개 세션, 폴더 소유권·git 규칙·첫 메시지 복사본
## 📚 에피소드 뱅크: `content/episodes/EPISODES.md` — 10편 후보, **1화 = E01「단톡방」** 확정

## 📘 백서: `docs/00_WHITEPAPER.md` — 세계관·전개·굿즈 원칙·시장 조사·결정 기록·90일 계획 (먼저 읽을 것)

## ✅ 세모 부부 + 네모 아빠 래스터 적용 (2026-09-23)
- 시트 v1 반입 → 6표정 잘라 `assets/wife/` 배치 → 굿즈·1화·라인업에 자동 반영. 규격은 `docs/03_STYLE_GUIDE.md` §1-3.
- 다음: **`docs/06_PROMPTS_READY.md`** 의 복사용 프롬프트를 순서대로 — ① 남편 ② 아내 v2(angry 등) ③ 네모 아빠·엄마·할머니·아이4 ④ 동그라미 아빠·엄마·아이2 ⑤ 라인업. 각 블록에 폴더명·자르기 명령까지 적혀 있다.

## 다음 할 일
1. 댓글: giscus(GitHub Discussions) — 저장소 Discussions 켜고 giscus.app 에서 스크립트 받아 ep 페이지 CTA 아래에 삽입. (사람이 giscus 앱 설치 승인 1회)
1-2. 네이버 도전만화/포스타입 계정 + 1화 컷 이미지 업로드(`tools/export_cuts.py` 예정: 컷별 PNG).
2. 2화 「집 청소」 원고(사람) → 컷 구성.
2-2. 노트 인쇄 규격 PDF(300dpi, 재단 3mm) 내보내기 도구 → POD 샘플 주문.
2-3. 유아 게임 1호 「도형 맞추기」 프로토(Dress Story 엔진 재사용).
3. 쇼츠 대본 2개(1화에서): "넌 얼마나 했냐?" / "세 창가". 세로 9:16 은 컷을 720→1080 리스케일.
4. 캐릭터: 엄마·할머니·아이·동그라미 엄마/아들/딸의 표정·포즈 시트 추가(지금은 아빠 3인만 매트릭스). 이모티콘 24종 조합표.

## 열린 질문
- 플랫폼: 자체 페이지(댓글 giscus) vs 네이버 도전만화/포스타입 병행.
- 1화 인물명(이창명/구로고대병원) 실존 겹침 여부 확인.
