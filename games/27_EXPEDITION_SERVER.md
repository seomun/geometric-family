# 27. ⑪ 서버 아키텍처 초안 (D25: 서버 필수 · 광고+아이템 수익) — gf-game, 2026-10-13

> 기준: `25_EXPEDITION_GDD1.md` §8·§9·§10, `21_SERVER_PLAN.md`(T1/T2/T3 비용 [추정]). **①~⑩ 은 서버 없음 그대로** — ⑪만 별도 서버·계정·저장소. 수치는 [추정], 법·약관은 [확인 필요]. 이 문서는 설계 초안이고 허브 QA 뒤 슬라이스(로컬)로 간다.

## 0. 목표와 제약
| 목표 | 이유 |
|---|---|
| **서버가 재화·뽑기·결제의 원본** | 로컬 판정은 조작 가능 → 확률 공개·분쟁·환불 대응 불가 |
| **최소 비용·최소 운영** | 1인 개발. 서버리스(요청당 과금), 서버 관리 0 |
| 결제는 **퍼블리셔(스토어) 계정 기준** | 영수증·환불·정산이 모두 스토어 계정에 묶임 |
| 미성년·확률형 규제 대응 로그 | 월 상한·확률 검증·삭제 요청 |
| 유아/성인 앱과 완전 분리 | D12, 별도 프로젝트·키·DB |
| 점진 도입 | S0 로컬 → S1 계정·저장·뽑기·결제 → S2 PvP·이벤트 → S3 길드·푸시 |

## 1. 「퍼블리셔 계정 기준」 — 계정·키 구성
- **개발자 계정**: Google Play Console(결제 프로필 = 판매자 계정) + 삼성 Seller Office(갤럭시 스토어). ⑪은 **별도 앱 패키지** `com.geometricfamily.expedition`, 같은 개발자 계정 아래 **별도 서비스 계정**.
- **영수증 검증 키**: Google Cloud 프로젝트(⑪ 전용)에서 서비스 계정을 만들어 Play Console 에 연결(앱 결제·주문 조회 권한)한 JSON 키를 **Worker 비밀값**으로만 보관(저장소·클라이언트에 없음). 삼성 IAP 는 Seller Office 의 서버 검증 키.
- **환불·구독 상태 알림**: Google Play RTDN → Pub/Sub 토픽 → Worker 의 `/webhook/play` (푸시 구독). 삼성은 서버 검증 API 를 주기 점검(크론).
- **정산·세무**: 수익이 나는 서비스라 **사업자 등록·통신판매업 신고·정산 계좌**가 작가 몫 [확인 필요]. 개발 쪽은 매출 장부(유상 재화 지급 기록)를 CSV 로 내보낼 수 있게 설계한다.
- **광고**: AdMob(또는 미디에이션) 앱 ID 는 ⑪ 전용. 보상형은 **서버 측 검증(SSV) 콜백** → Worker.

## 2. 구성도
```
[앱 ⑪ (Android WebView)] ──HTTPS(JWT)──► [Cloudflare Workers: api.…/v1]
   │  ads SDK, Billing(구글/삼성)               │  ├─ D1 (SQL: 계정·재화·동료·뽑기로그·결제장부·순위)
   │                                          │  ├─ KV/R2 (원격 설정: 이벤트·픽업·점검 · 정적 확률표)
   └─ 결제창 ◄─ 스토어                         │  ├─ Cron Triggers (일일 리셋·시즌 정산·삼성 결제 점검)
                                              │  └─ Queues(선택): 분석 이벤트 배치
[Play RTDN → Pub/Sub → /webhook/play ] ───────►│
[AdMob SSV 콜백 → /webhook/ads ] ─────────────►│
```
- **언어/런타임**: Workers(TypeScript). 한 코드베이스, 환경 3개(dev·beta·prod). 클라이언트는 기존 HTML5 엔진 + `fetch`.
- **왜 Cloudflare**: docs/21 의 T2 결론(월 $5 기본, 이그레스 무료, 서버 관리 0). 대안(Firebase 등)은 비용 예측이 어렵고 SQL 이 약하다 — 단 **결정은 허브·작가**.

## 3. 데이터 모델 (D1, 요약)
| 테이블 | 핵심 칼럼 | 비고 |
|---|---|---|
| `accounts` | id(uuid)·created·age_ok·region·status·guardian_ok | 익명, 이름·사진 없음. 12~13세 결제 차단 플래그 |
| `devices` | account·device_hash·last_seen | 기기 변경 복구는 스토어 계정 연동 |
| `wallet` | account·free_gems·paid_gems·gold·exp·frags | **유상/무상 분리**(별 칼럼), 변경은 `ledger` 로만 |
| `ledger` | id·account·kind·delta_free·delta_paid·reason·ref·ts | 모든 재화 변화 append-only(감사·환불 반영) |
| `units` | account·unit_id·level·awaken·gear | 보유 동료(최대 90종) |
| `progress` | account·stage_best·stars·tower_floor·flags | |
| `pity` | account·banner·since5·since4·pickup_guard | **천장 카운터 서버 보관** |
| `gacha_log` | id·account·banner·n·results·rng_seed_hash·ts | **확률 검증용 로그**(보존 기간 [확인 필요]) |
| `purchases` | order_id(unique)·account·sku·store·state·amount_krw·ts·refunded | 영수증 **멱등**(order_id 중복 지급 금지) |
| `spend_month` | account·ym·krw | 월 결제 상한 집계 |
| `arena` | account·rating·defense_team·season·season_best | PvP |
| `events` | id·from·to·config(json) | 이벤트·픽업·점검(KV 캐시) |

## 4. API (v1, JWT = 익명 계정 토큰 + 갱신 토큰)
| 호출 | 하는 일 |
|---|---|
| `POST /auth/anon` · `/auth/link` · `/auth/refresh` | 계정 생성·스토어 계정 연동(복구)·토큰 갱신 |
| `GET /profile` · `POST /sync` | 프로필·원격 설정 · 오프라인 진행 보고(서버가 상한·시간 검증) |
| `POST /stage/clear` | 스테이지 결과(편성·시드·로그 요약) → 보상 지급(서버가 가능성 검증) |
| `POST /gacha/pull` | `{banner, n}` → 서버가 확률표·천장으로 판정, `ledger`·`gacha_log` 기록, 결과 반환 |
| `GET /gacha/odds` | 현재 배너 확률표(화면 내 공개용, 앱 정적 표와 동일 출처) |
| `POST /iap/precheck` | 월 상한·연령 확인 → 허용/차단(결제창 호출 **전**) |
| `POST /iap/verify` | 영수증 서버 검증 → 멱등 지급(유상 재화) |
| `POST /ads/reward` | SSV 확인된 광고 보상 청구(하루 상한) |
| `POST /arena/defense` · `/arena/match` · `/arena/result` | 방어팀 등록·상대 선택·결과 반영(리플레이 요약 검증) |
| `GET /events` · `/notice` | 이벤트·공지·점검 |
| `POST /account/delete` | 삭제 요청(보존 의무 있는 결제 기록 제외 [확인 필요]) |
| `POST /telemetry` | 익명 분석 이벤트 배치 |

## 5. 핵심 흐름
**뽑기**: 앱 `pull(n)` → Worker 트랜잭션: ① 재화 확인(무상 우선) ② 천장 상태 읽기 ③ CSPRNG 로 등급·캐릭터 판정(소프트 61·하드 80·픽업 160) ④ `pity`·`wallet`·`ledger`·`gacha_log` 갱신 ⑤ 결과 반환. 클라이언트 난수는 연출에만 쓴다.
**결제**: 앱 `precheck`(월 상한·연령) → 스토어 결제창 → 영수증 → `verify`(스토어 API 조회, `order_id` 멱등) → `purchases`·`ledger`(유상 재화) → 응답. 환불·취소는 RTDN 으로 받아 유상 재화 회수 또는 마이너스 허용 정책(**제안**: 마이너스 잔고 허용 + 사용 제한).
**월 결제 상한**: 사용자 설정 상한(기본값은 법무 확인 후) ≤ 법정 상한. 스토어 결제는 서버가 막을 수 없어 **precheck 로 결제창 진입 자체를 막고**, 우회 결제는 사후 집계로 경고·제한.
**보상형 광고**: 광고 SDK 완료 → 스토어 SSV 콜백이 Worker 로 → `reward_token` 이 서버에 생기면 앱이 `ads/reward` 로 청구(하루 상한). 클라이언트 신고만으로는 지급하지 않는다.
**PvP**: 방어팀 스냅샷(스탯 포함)을 저장 → 매칭은 레이팅 구간 → 결과는 **결정론 전투 시뮬**(`tools/rpg_sim.js` 의 전투 코어 재사용)을 서버가 재현해 승패 확인(초기엔 샘플 검증, CPU 한도 때문에 큐로 비동기). 순위는 시즌 단위.
**오프라인 방치**: 클라이언트 `last_sync` 와 서버 시각 차로 상한(예 8시간) 안에서만 지급.

## 6. 부정 사용·보안
- 모든 재화 변화는 서버 `ledger` 로만 · 클라이언트 값은 신뢰하지 않음 · 요청 서명(JWT)+속도 제한(Cloudflare 규칙)·이상 징후(비정상 클리어 속도) 플래그.
- 영수증 재사용·위조 차단(order_id 멱등·서명 검증)·루팅/에뮬레이터 정책은 단계적(S2).
- 개인정보 최소: 이름·전화·위치 없음, 기기 해시·익명 ID·결제 주문 번호만. 로그 보존 기간·삭제·14세 미만 동의 [확인 필요].
- 운영: **점검 스위치**(KV)·긴급 광고 끄기·확률 배너 즉시 교체. D1 시점 복구·일일 백업(R2).

## 7. 비용 [추정] — docs/21 의 Cloudflare 단가 기준
가정: DAU 1명당 하루 API 60회(접속·방치 정산·스테이지 결과·뽑기·광고), 쓰기 20행.
| DAU | 월 요청 | Workers(기본 $5 + 초과) | D1 | 기타 | 합계 |
|---|---|---|---|---|---|
| 3,000 | 약 540만 | $5(포함) | 포함 | 도메인·모니터링 $0~5 | **$5~10** |
| 10,000 | 약 1,800만 | $5 + 약 $2.4 | 포함 | $0~10 | **$8~18** |
| 30,000 | 약 5,400만 | $5 + 약 $13 | 포함(쓰기 약 1,800만) | $10~26 | **$28~45** |
- Google Pub/Sub(RTDN)·AdMob SSV·삼성 IAP 검증은 무료 구간 [추정]. 이득 대비 서버비는 작다. **큰 비용은 개발·운영 시간과 UA**.

## 8. 단계 (슬라이스 → 출시)
| 단계 | 내용 | 서버 |
|---|---|---|
| **S0 슬라이스(20분)** | 1나라·전투·뽑기 UI(확률·천장 완비)·무상 재화만 | **없음(로컬)** — 서버 계약(API 모양)만 맞춰 둠 |
| S1 클로즈드 베타 | 계정·클라우드 저장·뽑기 서버 판정·결제 검증·월 상한·원격 설정·분석 | Workers+D1 |
| S2 오픈 | 광고 SSV·PvP 아레나·이벤트 운영 도구(GM 콘솔 최소)·부정 탐지 | + Cron·Queues |
| S3 확장 | 길드·푸시·시즌 패스 자동화 | T3(여기만 허용) |
- **슬라이스에서 하지 않는 것**: 결제 켜기·광고 켜기·서버 연결(회귀 위험을 줄이려고 S1 로 미룸).

## 9. 허브·작가 결정 요청
1. 서버 플랫폼: Cloudflare(추천, 비용 예측) vs Firebase 등 — 결정.
2. 정산 주체(사업자 등록)·통신판매업·세무 — 작가 확인.
3. 월 결제 상한 기본값·연령 정책(12~13세 결제 차단 여부) — 법무.
4. 환불 시 마이너스 잔고 허용 여부.
5. 전면 광고를 처음부터 켤지, 보상형만 시작할지.
