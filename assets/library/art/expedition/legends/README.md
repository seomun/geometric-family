# ⑪ 전설 동료 30종 코드 그림 키트 — ExpLegends (gf-asset, 2026-10-24)

- 사양: `notes/art_spec_legend_companions.md` §1. 허브가 10/24 에 승인했다.
- 대상:
  - 1차 8종: 명화 7(모나리자·진주 귀고리 소녀·해바라기·별이 빛나는 밤·수련·큰 파도·씨름)과 선녀.
  - 2차 22종: 전설 4(신선·아서왕·눈의 여왕·손오공) · 희귀 9(심청·용왕·구미호·삼신할머니·바리공주·멀린·인어·헤라클레스·토르) · 일반 9(견우·직녀·토끼·콩쥐·장승·로빈 후드·신드바드·램프의 지니·페가수스).
  - 「절규」는 보류했다.
  - 영화판 회피 메모(사양서 「피할 것」)를 그대로 지켰다. 지니는 주홍 연기, 인어는 은발·산호 꼬리, 눈의 여왕은 흰 모피·은 단발, 토르는 붉은 수염에 망토·투구 없음, 손오공은 긴고아·여의봉으로 그렸다.
- 원칙:
  - 정본 가족 그림은 건드리지 않았다.
  - 명화 사진·복제 이미지는 쓰지 않았다. 특징 하나만 도형으로 새로 그렸다.
  - 모두 자체 제작이다.

| 파일 | 내용 |
|---|---|
| `legends.js` | 키트 본체. `ExpLegends.svg(id[, {size, frame}])` · `.inner(id, {frame})`(svg 태그 없이) · `.ids`(30) · `.meta[id]` = {name, grade, el}. 브라우저·Node 양쪽에서 쓴다 |
| `sheet.html` | 점검 시트. 액자 없음·액자 있음·64px 실루엣을 보여 주고, `legendIoU()` 로 기존 동료 43종 + 8종의 실루엣 겹침을 잰다 |
| `../cards/legend1/<id>_{front,back}.svg` | 1차 카드 18장: 8종 앞뒤 + 선녀 일반 카드(`l_seonnyeo_common`, 요정 자리, 「날개옷」만) 앞뒤 |
| `../cards/legend2/<id>_{front,back}.svg` | 2차 카드 44장: 22종 앞뒤. 능력은 gf-game 목록 §2 그대로이고, 체력·공격·속도는 예시 수치다 |
| 스크린샷 | `notes/snapshots/legends_all.png`(30종 키트) · `notes/snapshots/legends_1st.png`(1차) · `notes/snapshots/legend_cards_sheet.png`(카드 전체) |

## 규격
- viewBox 는 `0 0 100 106`(ExpCompanions 와 같음)이다. 외곽선 `#6b5443`, 플랫 단색이며, svg 에 `class="ea-cr"` 가 붙는다.
- **액자는 `frame:true` 일 때만 붙는다.** 카드 그림 칸에만 쓰고, 전투·편성·도감 칸에서는 액자 없이 쓴다. 액자를 붙이면 명화 7종의 실루엣이 모두 같은 네모가 되기 때문이다. 액자 아래 테는 y 88 이라 동료 발이 액자 밖으로 나온다.
- 선녀는 그림 1장이다. 일반 카드(요정 자리)와 전설 카드 모두 `l_seonnyeo` 를 쓰고 테두리만 바뀐다(허브 10/24).

## 수치 — 64px 검은 실루엣 겹침 IoU
| 비교 | 쌍 수 | 최대 | 0.8 넘는 쌍 |
|---|---|---|---|
| 30종 × (기존 43종 + 30종끼리) | 1725 | **0.786**(모나리자↔용왕) | **0** |

2차 첫 판에서 모나리자↔눈의 여왕이 0.807 로 넘었다. 눈의 여왕에 머리 뒤로 선 얼음 깃을 달고 망토 자락을 넓혀 0.754 로 내렸다.

## 게임에 연결하는 법 (gf-game 제안)
1. `exp-art.js` 의 `creature(o)` 에 한 줄을 추가한다(ExpCompanions 줄 바로 옆):
   ```js
   if (!o.enemy && window.ExpLegends && ExpLegends.has(o.id)) return ExpLegends.svg(o.id);
   ```
2. 카드 그림 칸에는 `ExpLegends.svg(id, { frame: true })` 를 쓴다. 카드 틀 함수는 `tools/asset_cards.js` 의 `front(d)`·`back(d)` 이다. 그림은 `<g transform="translate(40 84) scale(2.8)">` 안에 넣는다.
3. id 는 `ExpLegends.ids` 의 30개다. 1차는 `l_seonnyeo` · `l_monalisa` · `l_pearl` · `l_sunflower` · `l_starry` · `l_lily` · `l_wave` · `l_ssireum`, 2차는 `l_sinseon` · `l_arthur` · `l_snowqueen` · `l_wukong` · `l_simcheong` · `l_yongwang` · `l_gumiho` · `l_samsin` · `l_bari` · `l_merlin` · `l_mermaid` · `l_heracles` · `l_thor` · `l_gyeonu` · `l_jiknyeo` · `l_rabbit` · `l_kongjwi` · `l_jangseung` · `l_robin` · `l_sinbad` · `l_genie` · `l_pegasus` 이다. `data/expedition_slice.json` 의 동료 id 가 다르면 별명 표를 하나 두면 된다.
4. 해바라기(절규 대체, 희귀 ★4 · 불 · 전체 공격): ⏳「한낮 햇볕」 지연 — 적 1체 행동 1칸 늦춤, 쿨 3 (허브 10/24 확정). 원작 한 줄 「고흐 · 노란 꽃병 가득 해를 닮은 꽃」.
