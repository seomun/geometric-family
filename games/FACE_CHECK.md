# 2장 「같은 얼굴」 표정 검수표

원본 12표정 대조: `media/faces_sheet.png` (세모 이모 `wife`, 150px). 카드는 세로 화면 최소 163×125(8장) · 가로 태블릿 최소 131×174로 크게 키웠다.

| 표정 | 구분 단서 | 작은 카드 구분 | 쓰임 |
|---|---|---|---|
| love | 눈이 하트 | ◎ 매우 쉬움 | A·B·C |
| cry | 눈물방울, 처진 눈썹 | ◎ | A·B·C |
| surprise | 동그란 입, 큰 눈 | ◎ | A·B·C |
| angry | 찡그린 눈썹 | ◎ | A·B·C |
| joy | 감은 눈 + 활짝 웃는 입 | ◎ | A·B·C |
| tired | 감은 눈 + 일자 입 | ○ (joy 와 입으로 구분) | A·B·C — **joy 와 같은 판에 쓰지 않음(A3 은 surprise 와 짝)** |
| wink | 한쪽 눈만 감음 | ○ | B2, C (joy 와 같은 판 금지) |
| worry | 땀방울 | ○ | B3, C (cry 와 같은 판 금지) |
| good | 보통 웃음 | △ (calm·smug 와 비슷) | B3 에서 love·worry 와만 짝 |
| calm | 무표정에 가까움 | ✕ good·bad·smug 와 혼동 | **C 에서 제외** |
| smug | 한쪽 입꼬리 | ✕ good 과 혼동 | **C 에서 제외** |
| bad | 입에 작은 표시 | ✕ good·calm 과 혼동 | **C 에서 제외** |

규칙(코드 `modes/faces.js`)
- 임의 판(C)은 calm·smug·bad 를 뽑지 않고, 비슷한 묶음(`good/calm/smug/bad`, `cry/worry`, `joy/wink`)에서 한 판에 하나만 뽑는다.
- A(2쌍)는 차이가 가장 큰 쌍만: joy–cry · angry–love · surprise–tired.
- B(3쌍): joy·cry·angry / surprise·wink·tired / love·worry·good.
- C(4쌍 ×3): 위 규칙의 무작위.
- **허브 확인 요청**: calm·smug·bad 를 앞으로 어디에 쓸지(예: 그림책 장면 전용) — 놀이에서는 뺐다.
