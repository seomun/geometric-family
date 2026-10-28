# 카드 그래픽 v1 시안 (gf-asset, 2026-10-28) — 작가 승인 전
- `gfcard.css` 등급 틀 5종(B 나무·A 구리·S 은·SS 금·SSS 무지개 홀로그램) + `.kids` 유아판. 너비는 `--w` 하나, 3:4, 크림 `--gfc-bg`.
- `gfcard.js` `GFCard.html({g,name,art,w,kids})` · `tilt(el)`(기울기→`--tx`) · 연출 3종 `GFCard.play(stage,'flip'|'feed'|'evolve',opts,done)`(2.2/2.3/2.4초, 탭하면 건너뜀).
- `gfcard_art.js` + `art/*.svg` 콩떡·꿀떡·무지개떡·단짝 표식·방망이 3종(불·물·풀, 100×100).
- `demo.html` 전체 시안. 렌더: `node tools/asset_cards_v1.js` → `notes/snapshots/card_art_v1_*.png`.
- 출처: 전부 새로 그린 CSS/SVG. 글꼴 Jua·Gasoek One(OFL). 캐릭터 그림은 자체 정본. 외부 게임 이미지 미사용(`notes/art/card_refs.md`).
- 성능: SSS는 회전 판 1개(transform)+빛줄기(background-position), blur·filter 없음. 실제 폰 프레임률은 미측정.
