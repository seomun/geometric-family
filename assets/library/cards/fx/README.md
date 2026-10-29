# 영웅 키우기 화면 그림·연출 v1 (gf-asset, 2026-10-28) — D68 S2~S6 용, 작가 승인 전
전부 새로 그린 SVG/CSS/JS(외부 에셋 없음). 움직임은 transform/opacity 만, 연출은 모두 2.4초 이하이고 stage 를 탭하면 끝으로 건너뛴다. **소리는 포함하지 않음**(필요하면 gf-asset 이 효과음을 따로 만든다).

## 불러오는 순서
`cards/v1/gfcard.css` → `v2/gfcard2.css` → (`v3/myth.css` — 신화 연출을 쓸 때) → `fx/gfcardfx.css` · 스크립트 `v1/gfcard.js` `v1/gfcard_art.js` `v2/gfcard2.js`(+신화: `v3/myth_art.js` `myth_art2.js` `myth.js`) → `fx/gffxart.js` `fx/gfcardfx.js`.

## 그림 (GFFxArt.<이름> = SVG 문자열, art/<이름>.svg 파일 동일)
slot_feed · slot_pair · slot_treasure · slot_evolve(칸 4) · lock · bag_tab(보따리 탭) · bag_empty(200×190, 빈 상태) · egg_s/m/l(힘 알) · awaken_card(깨달음 카드 그림 — `GFCard2.item({art:GFFxArt.awaken_card,name:'깨달음 카드',g:'S'})`) · xp_spark · hero_room_bg(390×844 바탕).
칸 마크업: `<div class="fx-slot on|lock"><div class="ic">SVG<span class="lk">자물쇠</span><span class="new">3</span></div>먹이기</div>`, 묶음 `.fx-slots`.
경험치 막대: `<div class="fx-xp" style="--w:260px;--p:.68"><i></i></div><div class="fx-xp-t">경험치</div>` (`.lv` 를 붙이면 레벨 업 색).

## 연출 (GFFx.play(name, stageEl, opts, done) · GFFx.still(name, stageEl, opts, t) · GFFx.DUR)
카드 DOM 은 콜백으로 받는다: `opts.heroHtml(등급, extra)` · `opts.itemHtml(종류, 등급)` — 없으면 `GFCard2.hero/item` 기본.
| 이름 | 길이 | 옵션 |
|---|---|---|
| feed | 2.3 | grade · feeds:[{kind,xp,g}] · from/to(막대 0~1) · levelUp |
| evolve | 2.4 | grade · toGrade · word('뚝딱!') · club |
| awaken | 2.2 | grade · slots · open(이번에 열릴 칸 번호) |
| treasure | 2.0 | grade · item:{kind,g} |
| myth | 2.4 | key(포세이돈 등 MythCard 키) 또는 cardHtml · word |
미리보기: `fx/demo.html` · 렌더 `tools/asset_cards_fx.js` → `notes/snapshots/card_fx_*.png`.
