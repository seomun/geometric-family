# 현재 상태 — 기하학 가족

갱신 2026-09-18. 폴더 `C:\projects\geometric-family`. 먼저 `CLAUDE.md`.

## 지금 있는 것
- `src/characters.js` v5 — Claude.ai 아티팩트에 있던 v4 를 허브 문서 사양대로 **재구축**(원본 코드는 회수 불가).
  함수: nemoDad/Mom/Kid/Grandma, semoHusband/Wife, dongDad/Mom/Son/Daughter, 가족 초상 3종, coffeeCup, windowBg, speech, narration.
  emo 5종(good/bad/worry/relief/sad), gaze, suit(아빠 3인). 동그라미는 감정에도 눈매 고정.
- `web/characters.html` 캐릭터 시트, `web/ep01.html` 1화 「부고」 완성본(11컷 + 투표 CTA + 2화 예고).
- **배포됨**: https://seomun.github.io/geometric-family/ (gh-pages 브랜치 = dist/). 재배포는 `bash tools/deploy.sh`.
- 전략: `docs/02_IP_STRATEGY.md` — 채널별 형식(쇼츠 A/B/C 고정 포맷), 주간 리듬, AI/사람 역할, 4주 KPI.
- 스크린샷: `notes/2026-09-16_characters.png`, `notes/2026-09-16_ep01.png`.

## 다음 할 일
1. 댓글: giscus(GitHub Discussions) — 저장소 Discussions 켜고 giscus.app 에서 스크립트 받아 ep 페이지 CTA 아래에 삽입. (사람이 giscus 앱 설치 승인 1회)
1-2. 네이버 도전만화/포스타입 계정 + 1화 컷 이미지 업로드(`tools/export_cuts.py` 예정: 컷별 PNG).
2. 2화 「집 청소」 원고 → 컷 구성. 세 집의 같은 주말.
3. 쇼츠 대본 2개(1화에서): "넌 얼마나 했냐?" / "세 창가". 세로 9:16 은 컷을 720→1080 리스케일.
4. 캐릭터 다듬기(반응 보고): 세모 전투 소품(포크·칼) 더 크게, 네모 엄마 손 4개 강조, 동그라미 엄마 머리.

## 열린 질문
- 플랫폼: 자체 페이지(댓글 giscus) vs 네이버 도전만화/포스타입 병행.
- 1화 인물명(이창명/구로고대병원) 실존 겹침 여부 확인.
