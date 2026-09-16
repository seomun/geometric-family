# 현재 상태 — 기하학 가족

갱신 2026-09-16. 폴더 `C:\projects\geometric-family`. 먼저 `CLAUDE.md`.

## 지금 있는 것
- `src/characters.js` v5 — Claude.ai 아티팩트에 있던 v4 를 허브 문서 사양대로 **재구축**(원본 코드는 회수 불가).
  함수: nemoDad/Mom/Kid/Grandma, semoHusband/Wife, dongDad/Mom/Son/Daughter, 가족 초상 3종, coffeeCup, windowBg, speech, narration.
  emo 5종(good/bad/worry/relief/sad), gaze, suit(아빠 3인). 동그라미는 감정에도 눈매 고정.
- `web/characters.html` 캐릭터 시트, `web/ep01.html` 1화 「부고」 완성본(11컷 + 투표 CTA + 2화 예고).
- `tools/build.py` → `dist/` (index.html = ep01). 배포 준비 완료, 아직 어디에도 올리지 않음.
- 스크린샷: `notes/2026-09-16_characters.png`, `notes/2026-09-16_ep01.png`.

## 다음 할 일
1. **배포**: GitHub Pages(저장소 생성 + `dist/` 푸시) 또는 Netlify drop. 댓글은 utterances/giscus(GitHub Discussions) 붙이기.
2. 2화 「집 청소」 원고 → 컷 구성. 세 집의 같은 주말.
3. 쇼츠 대본 2개(1화에서): "넌 얼마나 했냐?" / "세 창가". 세로 9:16 은 컷을 720→1080 리스케일.
4. 캐릭터 다듬기(반응 보고): 세모 전투 소품(포크·칼) 더 크게, 네모 엄마 손 4개 강조, 동그라미 엄마 머리.

## 열린 질문
- 플랫폼: 자체 페이지(댓글 giscus) vs 네이버 도전만화/포스타입 병행.
- 1화 인물명(이창명/구로고대병원) 실존 겹침 여부 확인.
