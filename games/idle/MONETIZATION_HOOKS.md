# 수익 연결 자리 (방치형 「세 가족 식탁」) — 지금은 전부 no-op

수익 방식은 작가·퍼블리셔 결정 전이다. 코드는 어떤 방식이든 **붙이기만 하면 되게** 자리만 만들어 두었다. 광고·결제 SDK 는 없다.

| 방식 | 붙이는 곳 | 코드 |
|---|---|---|
| **A 유료 1회** | 스토어 유료 앱이면 코드 변경 없음. 앱 안 구매(무료+잠금 해제)면 결제 성공 시 `IDLE.grant('full')` | `S.ent.full`, `IDLE.owns('full')` |
| **C 소품 팩** | 소품 화면의 ★ 소품(`premium: true`, 3개) 터치 → `IDLE.hooks.purchase('prop:<id>', cb)`. 성공 콜백에서 `IDLE.grant('prop:<id>')`, 전체 팩은 `IDLE.grant('pack:all')` | `data/idle_props.json` |
| **광고(선택)** | 접속 보상 화면 `IDLE.hooks.rewardedAd('offline2x', cb)` — `IDLE.hooks.adAvailable()` 가 true 일 때만 버튼이 나온다 | 자리: `offline2x` |

- `IDLE.config.model` — `null | 'A' | 'C' | 'ads'` (결정 후 기록용, 동작을 바꾸지 않음).
- `IDLE.hooks.event(name, data)` — 분석 자리(기본 no-op). 개인정보 수집을 켤 때는 처리방침부터 고친다.
- 안드로이드 쪽에서는 WebView `addJavascriptInterface` 로 결제 결과를 `IDLE.grant(sku)` 에 넘기면 된다(결제 SDK 선정 후).
- **하지 않는 것**: 랜덤 뽑기·확률형 아이템·유료 재화·시간 단축 결제. (등급 설문 「사행성 없음」 답과 맞춘다.) 진행을 막는 결제 벽이 없다.
