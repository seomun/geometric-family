# 현재 상태 — 기하학 가족

갱신 2026-09-18 (v6). 폴더 `C:\projects\geometric-family`. 먼저 `CLAUDE.md`.

## 지금 있는 것
- `src/characters.js` **v6 굿즈 에디션** — 헬로키티 문법(플랫·균일 외곽선·팔다리). 표정 12·포즈 10·소품 10. 규격 잠금: `docs/03_STYLE_GUIDE.md`.
  일관성 검증: `node tools/snapshot.js` → `notes/snapshots/`. 캐릭터를 고치면 직전 스냅샷과 비교한다.
- `web/characters.html` 캐릭터 시트, `web/ep01.html` 1화 「부고」 완성본(11컷 + 투표 CTA + 2화 예고).
- **배포됨**: https://seomun.github.io/geometric-family/ (gh-pages 브랜치 = dist/). 재배포는 `bash tools/deploy.sh`.
- 전략: `docs/02_IP_STRATEGY.md` — 채널별 형식(쇼츠 A/B/C 고정 포맷), 주간 리듬, AI/사람 역할, 4주 KPI.
- 스크린샷: `notes/2026-09-16_characters.png`, `notes/2026-09-16_ep01.png`.

## 다음 할 일
1. 댓글: giscus(GitHub Discussions) — 저장소 Discussions 켜고 giscus.app 에서 스크립트 받아 ep 페이지 CTA 아래에 삽입. (사람이 giscus 앱 설치 승인 1회)
1-2. 네이버 도전만화/포스타입 계정 + 1화 컷 이미지 업로드(`tools/export_cuts.py` 예정: 컷별 PNG).
2. 2화 「집 청소」 원고 → 컷 구성. 세 집의 같은 주말.
3. 쇼츠 대본 2개(1화에서): "넌 얼마나 했냐?" / "세 창가". 세로 9:16 은 컷을 720→1080 리스케일.
4. 캐릭터: 엄마·할머니·아이·동그라미 엄마/아들/딸의 표정·포즈 시트 추가(지금은 아빠 3인만 매트릭스). 이모티콘 24종 조합표.

## 열린 질문
- 플랫폼: 자체 페이지(댓글 giscus) vs 네이버 도전만화/포스타입 병행.
- 1화 인물명(이창명/구로고대병원) 실존 겹침 여부 확인.
