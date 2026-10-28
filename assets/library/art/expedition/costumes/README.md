# 원정대 유료 의상 3벌 그림 (gf-asset, 2026-10-27) — D58 ⑤ `skin_*`
롱폼 옛날이야기 의상(assets/library/costumes/)과 같은 디자인(IP 연결). 능력치 0, 겉모습만.
| id | 상품 | 원본 의상 | 파일 |
|---|---|---|---|
| heungbu | skin_heungbu 흥부 한복 | costumes/nemo_dad | heungbu/{good,joy,surprise}.png |
| woodcutter | skin_woodcutter 정직한 나무꾼 | costumes/woodcutter | woodcutter/… |
| pig3 | skin_pig3 벽돌집 셋째 돼지 | costumes/pig3 | pig3/… |
- good/joy/surprise.png: 투명 512×512, 발 아래 맞춤(전투·홈·카드). good_256.png: 전투 작은 칸용. card_preview.png: 상점 카드 640×400(글자 없음, 이름·가격은 화면에서).
- 표정은 정본 네모 아빠와 같은 얼굴이라 그림만 바꾸면 된다: `costumes[].art` 를 `art/expedition/costumes/<id>/good.png` 로.
- 같은 의상의 표정·걷기 전체 세트는 assets/library/costumes/<원본>/ 에 있다.
