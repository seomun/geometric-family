# ⑪ 전설 동료 카드 틀 + 능력 아이콘 (gf-asset, 2026-10-24)

- 사양서: `notes/art_spec_legend_companions.md` 의 §5(카드)·§6(아이콘). 동료 31장 모습 사양도 같은 파일에 있다.
- 만들기: `node tools/asset_cards.js`
- 점검 시트: `sheet.html` (`?still=1` 로 열면 무지개 띠가 멈춘다)
- 스크린샷: `notes/snapshots/legend_cards_sheet.png`

| 파일 | 내용 |
|---|---|
| `card_front_{common,rare,legend}.svg` | 앞면 360×504. 슬롯 id: `#name` · `#art`(300×300, x30 y82) · `#original` · `#role` |
| `card_back_{common,rare,legend}.svg` | 뒷면. 슬롯 id: `#hp` `#atk` `#spd`(+`_bar`) · `#ability1`(전설은 `#ability2` 도) |
| `sample_{seonnyeo,pearl,lily}_{front,back}.svg` | 견본(전설·희귀·일반). 그림 칸은 자리표시 |
| `icons/{shield,atk_up,heal,delay,double,elem_up,stun,dot,chain}.svg` | 능력 종류 9종(48×48). 방어막·공격↑·회복·지연·연속공격·속성↑·기절·지속피해·연타 |

**등급 테두리**
- 일반: 은빛 실선 `#A9B0BA`
- 희귀: 금빛 이중선 `#C9A227` + `#E8C766`
- 전설: 금박 그라데이션 + 무지갯빛 띠. 띠는 CSS 로 6초에 한 바퀴 흐른다.
  - 「움직임 줄이기」 처리: `prefers-reduced-motion: reduce`, 또는 카드나 조상 요소에 `.still` 클래스를 달면 멈춘다.

**게임에 넣는 법** (gf-game 제안)
- `tools/asset_cards.js` 의 `front(d)`·`back(d)` 를 그대로 옮겨 쓰면 된다. 순수 문자열 함수라 브라우저와 Node 양쪽에서 돈다.
- 공유 이미지는 `exp-share.js` 로 SVG → PNG 변환한다.
- 글꼴은 Jua·Noto Sans KR(게임과 같음)이다.
- 저작권: 모두 자체 제작이며 외부 이미지는 없다.
