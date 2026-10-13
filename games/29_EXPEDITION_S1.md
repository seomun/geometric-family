# 29. ⑪ S1 설계 — 클로즈드 베타(서버 연결) (gf-game, 2026-10-13)

> 기준: `27_EXPEDITION_SERVER.md`(아키텍처 초안) · D26(서버 Cloudflare Workers+D1, 퍼블리셔 계정 소유, 월 결제 상한 기본 20만원·사용자 하향·**만 19세 미만 7만원+보호자 동의 안내**, 12+·아동 대상 홍보 금지, 환불 = 스토어 정책 + 미사용 유료 재화 7일 청약철회 / 뽑기·소비분 불가를 **결제 전에 고지**, 전면 광고 4전투 1회·결제자 제외·설치 후 30분 없음). S0 슬라이스(`28_EXPEDITION_SLICE.md`)를 서버에 붙여 **실제 돈·실제 계정이 오가는 첫 단계**다. 법·약관·세무는 [확인 필요].

## 0. S1 범위 / 비범위
| 포함 | 비포함(S2 이후) |
|---|---|
| 익명 계정·연령 확인 · 클라우드 저장 · **서버 뽑기 판정** · **결제 검증** · 월 결제 상한 · 환불 반영 · 보상형/전면 광고 규칙 · 원격 설정(이벤트·점검) · 분석 · 삭제 요청 | PvP 아레나 · 길드 · 푸시 · 시즌 패스 자동화 · GM 콘솔(최소 CLI 만) · 부정 탐지 고도화 |
| 콘텐츠: 1나라 전체(12단계)·가족 합류 5명·포섭 1·모집 11종 | 17나라·90명(콘텐츠 라인은 S2~) |
- **원칙**: 클라이언트는 연출·입력만, 재화·보유·천장·결제는 **서버가 원본**. 전투는 **서버가 결정론 코어로 재현**해 보상을 확정한다(S0 코어가 그대로 Workers 에서 돈다 — UMD 파일).

## 1. 클라이언트 구조 변경
S0 의 `exp.js` 가 `S`(로컬 상태)를 직접 만진다. S1 은 **Backend 어댑터** 하나를 사이에 둔다.
```
UI(exp.js) → Backend 인터페이스 { profile(), sync(), pull(banner,n), clear(stage,party,seed,logHash), iapPrecheck(sku), iapVerify(receipt), adReward(token), … }
              ├─ LocalBackend  (S0 그대로 · 오프라인 시험용, ?backend=local)
              └─ RemoteBackend (fetch → Workers, 재시도·오프라인 큐·낙관적 화면)
```
- 오프라인: 읽기 전용 화면(편성 확인 등)과 「진행 보류」 안내. 쓰기(뽑기·결제·클리어)는 연결이 필요하다는 메시지만 — 로컬에서 재화를 늘리지 않는다.
- 요청에는 `request_id`(UUID)를 붙여 **멱등**: 같은 id 는 같은 결과를 돌려준다(네트워크 재시도 안전).
- 화면은 서버 응답으로만 갱신(낙관적 업데이트는 전투 연출·UI 에 한정).

## 2. 서버 구성 (Cloudflare)
```
Worker "expedition-api" (TypeScript, Hono 류 라우터)
  ├─ D1 "expedition-db"            ← 계정·재화·보유·장부·뽑기로그·결제·상한 집계
  ├─ KV  "expedition-config"       ← 이벤트·픽업·점검·광고 규칙(앱이 부팅 때 읽음)
  ├─ R2  "expedition-backup"       ← D1 일일 덤프(시점 복구 보조)
  ├─ Cron  (매일 04:00 KST: 일일 리셋·상한 집계 정리 · 삼성 결제 점검 · 백업)
  ├─ /webhook/play  (Pub/Sub 푸시 ← Play RTDN: 환불·취소)
  └─ /webhook/ads   (AdMob SSV 콜백)
환경: dev(wrangler dev, Miniflare) · beta · prod — 각각 별도 D1·KV·비밀값.
```
- **코드 공유**: `games/expedition/battle-core.js` + `data/expedition_*.json`(확률·스테이지·유닛)을 서버가 번들(esbuild)로 가져와 쓴다 → 서버·클라이언트 규칙 불일치 0.
- 비밀값(Worker secret): Play 서비스 계정 JSON·삼성 검증 키·JWT 서명 키·AdMob SSV 공개키 캐시.

## 3. D1 스키마 (SQL 초안)
```sql
CREATE TABLE accounts (id TEXT PRIMARY KEY, created_at INTEGER, birth_ym TEXT, age_band TEXT, -- '12_13'|'14_18'|'19p'
  guardian_notice_at INTEGER, status TEXT DEFAULT 'active', cap_krw INTEGER, region TEXT);
CREATE TABLE tokens (account TEXT, refresh_hash TEXT, device_hash TEXT, issued_at INTEGER, revoked INTEGER DEFAULT 0);
CREATE TABLE wallet (account TEXT PRIMARY KEY, free_gems INTEGER, paid_gems INTEGER, gold INTEGER);
CREATE TABLE ledger (id INTEGER PRIMARY KEY AUTOINCREMENT, account TEXT, ts INTEGER, kind TEXT, d_free INTEGER, d_paid INTEGER, d_gold INTEGER, reason TEXT, ref TEXT);
CREATE UNIQUE INDEX ledger_ref ON ledger(account, kind, ref);          -- 멱등(같은 request/order 두 번 지급 금지)
CREATE TABLE units (account TEXT, unit_id TEXT, lv INTEGER, dups INTEGER, PRIMARY KEY(account, unit_id));
CREATE TABLE progress (account TEXT PRIMARY KEY, cleared INTEGER, stars TEXT, party TEXT, flags TEXT);
CREATE TABLE pity (account TEXT, banner TEXT, since5 INTEGER, since4 INTEGER, guard INTEGER, PRIMARY KEY(account, banner));
CREATE TABLE gacha_log (id INTEGER PRIMARY KEY AUTOINCREMENT, account TEXT, ts INTEGER, banner TEXT, n INTEGER, results TEXT, odds_ver TEXT, rng_ref TEXT, request_id TEXT UNIQUE);
CREATE TABLE purchases (order_id TEXT PRIMARY KEY, account TEXT, sku TEXT, store TEXT, state TEXT, amount_krw INTEGER, ts INTEGER, refunded_at INTEGER, raw TEXT);
CREATE TABLE spend_month (account TEXT, ym TEXT, krw INTEGER, PRIMARY KEY(account, ym));
CREATE TABLE ad_claims (token TEXT PRIMARY KEY, account TEXT, kind TEXT, ts INTEGER, claimed INTEGER);
CREATE TABLE telemetry_daily (day TEXT, name TEXT, n INTEGER, PRIMARY KEY(day, name));   -- 집계만(개인 로그 없음)
```
- `ledger` 가 재화의 진실이고 `wallet` 은 캐시(주기 검증). 유상/무상 분리 칼럼 유지(소비 순서: **무상 먼저**).
- `gacha_log.rng_ref`: 서버 난수 시드의 **해시**(원문 비공개) + `odds_ver`(확률표 버전) → 분쟁 시 같은 시드로 같은 결과를 재현·검증.

## 4. API 계약 (v1) — 핵심 6개의 요청/응답
공통: `Authorization: Bearer <JWT>` · 오류 `{"error":"code","msg":""}` · 모든 쓰기 요청 `request_id`.
1. **POST /auth/anon** `{device_hash, birth_ym}` → `{account, access, refresh, age_band, cap_krw, guardian_notice:bool}`
   - 최초 실행의 **연령 확인 화면**(생년월 입력, 중립 문구). 만 12세 미만은 가입 불가. 12~13세는 **결제 차단**(법무 확정 전 보수적), 14~18 = 월 7만원 + 보호자 동의 안내 표시(D26), 19+ = 기본 20만원.
2. **POST /gacha/pull** `{banner, n(1|10), request_id}` → `{results:[{unit, grade, isNew, dupFrag}], wallet, pity, odds_ver}`
   - 트랜잭션: 재화 확인(무상→유상) → `pity` 읽기 → 서버 CSPRNG(`crypto.getRandomValues`) → 확률표(§GDD 5)·소프트 61/하드 80·픽업 보장·10회 ★4+ 보장 적용 → `ledger`·`units`·`pity`·`gacha_log` 기록. 클라이언트에는 **결과만**.
3. **POST /stage/clear** `{stage, party:[{unit,lv}], seed, events_hash, result_summary, request_id}` → `{ok, rewards:{gold,gems,first}, join?, recruit?, stars}`
   - 서버가 같은 코어로 `seed`·`party` 를 재현해 승패·쓰러짐 수를 확인(CPU 한도 안: 1전투 수 ms). 불일치 → 거부+플래그. 포섭은 `persuaded` 입력 로그를 포함해 재현.
4. **POST /iap/precheck** `{sku}` → `{allowed, reason?, month_spent, cap, notice:{unused_refund_7d, gacha_no_refund}}`
   - **결제 전 고지**(D26 ⑤): 화면에 「미사용 유료 재화는 7일 안에 청약철회 가능, 모집(뽑기)에 쓴 것·소비한 것은 불가」 문구 + 월 사용액/상한. 12~13세 = 차단. 상한 초과 = 차단.
5. **POST /iap/verify** `{store, sku, purchase_token|receipt, order_id, request_id}` → `{ok, wallet, month_spent}`
   - Google: `purchases.products.get`(Android Publisher API)로 확인 → `acknowledge`/consume → `purchases`(order_id 유니크)·`ledger`(유상)·`spend_month`. 삼성: IAP 서버 검증 API. 위조·중복 → 거부.
6. **POST /ads/reward** `{kind, token}` → `{ok, grant, left_today}` — SSV 콜백(`/webhook/ads`)이 먼저 `ad_claims` 를 만들어 두고 앱이 청구. 하루 상한(소탕 5·무료 반짝석 3).
그 외: `GET /profile`·`POST /sync`(방치 정산)·`GET /config`(이벤트·광고 규칙·점검)·`POST /account/delete`·`POST /telemetry`.

## 5. 월 결제 상한 (D26 ③)
- 규칙: `cap = min(account.cap_krw, 법정/약속 상한)` — 기본 200,000원, 사용자 설정으로 **더 낮출 수만** 있음(설정 화면 슬라이더 + 즉시 반영, 올릴 땐 다음 달부터 [제안]). 만 19세 미만은 **70,000원 고정**(올릴 수 없음) + 최초·결제 화면에 보호자 동의 안내.
- 집계: `spend_month.krw` = 검증된 결제(KRW 환산) 합 − 환불. `precheck` 가 (이번 달 사용 + 상품가) > cap 이면 결제창 진입 자체를 막는다. **스토어 결제는 서버가 막을 수 없으므로** 결제창 전 단계에서만 차단하고, 우회·동시 결제는 `verify` 에서 사후 초과 시 경고·다음 결제 차단.
- 월 경계: KST 1일 00:00. 통화는 KRW 만(S1).

## 6. 환불·청약철회 (D26 ⑤)
- 기본: **스토어 정책을 따른다**(Google/삼성 환불은 RTDN·주기 점검으로 받아 `refunded_at` 기록).
- 청약철회 7일: 결제 후 7일 안 **미사용 유상 반짝석**은 환불 요청 가능 → 서버가 `ledger` 에서 미사용분(유상 잔액 ≤ 해당 주문 지급분)을 확인해 환불 가능 여부를 앱에 알려 준다(실제 환불은 스토어 절차 안내). **뽑기·소비분은 불가** — 결제 전 `precheck` 화면에 고지.
- 환불 반영: 환불 발생 시 유상 재화 회수, 모자라면 **마이너스 잔고**(사용 제한 · 다음 결제로 상환)를 허용 [제안 — 허브 D26 ⑤ 에서 미결정 부분].

## 7. 광고 규칙 (D26 ⑥ + GDD §9)
- **전면**: 스테이지 결과 화면 전, **4전투에 1회**·전투 중 금지·**결제 이력 계정 제외**·**설치 후 첫 30분 없음**·하루 상한(예 8회). 서버는 규칙만 내려주고(`/config`), 노출 판정은 클라이언트(오프라인 광고 불가이므로 규칙 위반 위험 낮음), 결제 이력은 서버 플래그 `has_paid` 로 전달.
- **보상형**(선택): 소탕 +1(5회)·보상 2배·무료 반짝석 20(3회) — **SSV 필수**. 광고 SDK 설정: 아동 대상 아님(12+), 광고 콘텐츠 등급 T 이하.
- 광고 제거 상품(4,400원, 전면만 제거) = `has_paid` 와 같은 효과의 별도 플래그 `no_inter`.

## 8. 분석·개인정보
- 수집: 익명 계정 ID·기기 해시·생년월(연령 대역 계산 후 원문은 **연·월만** 저장)·결제 주문·로그. **수집 안 함**: 이름·전화·위치·광고 ID(광고 SDK 가 쓰는 것 제외, 데이터 안전 선언에 반영).
- 분석은 일 집계 테이블만(`telemetry_daily`): 접속·스테이지 퍼널·모집 횟수·결제 전환·이탈 지점. 개인 단위 로그는 보관하지 않는다(필요 시 별도 동의).
- 삭제 요청: `POST /account/delete` → 계정·보유·로그 삭제(**결제 기록은 법정 보존 기간 유지** [확인 필요 — 전자상거래법 5년 추정]) · 14세 미만 동의·보존 기간·방침 [법무 확인].

## 9. 작업 패키지 (순서·추정 [추정], 1인 개발·세션 기준)
| WP | 내용 | 산출 | 의존 | 추정 |
|---|---|---|---|---|
| 1 | Worker 골격·환경 3개·D1 마이그레이션·JWT·요청 멱등 | `server/` 저장소 폴더, `wrangler.toml`, 마이그레이션 SQL | 퍼블리셔·Cloudflare 계정 | 2일 |
| 2 | 연령 화면·계정·프로필·클라우드 저장·Backend 어댑터(로컬/원격) | 앱 변경 + `/auth` `/profile` `/sync` | WP1 | 3일 |
| 3 | **서버 뽑기**(확률표 버전·천장·로그) + 클라이언트 연출 연결 | `/gacha/*` + 검증 스크립트(수만 회 분포·천장 단언) | WP1·2 | 2일 |
| 4 | **전투 서버 재현**·보상 확정·합류/포섭 처리 | `/stage/clear` + 일치 테스트(S0 코어 해시 비교) | WP1·2 | 2일 |
| 5 | **결제**: 상품 등록·precheck/verify·ledger·월 상한·환불(RTDN) | `/iap/*` `/webhook/play` + 스토어 테스트 결제 | 스토어 상품 등록(작가) | 4일 |
| 6 | 광고: SDK 연결·SSV·전면 규칙·보상 청구 | `/ads/*` `/webhook/ads` | AdMob 계정(작가) | 3일 |
| 7 | 원격 설정·점검·이벤트·분석 집계·삭제 요청 | `/config` `/telemetry` `/account/delete` | WP1 | 2일 |
| 8 | 부정·운영: 속도 제한·이상 징후·백업 크론·관리 CLI·대시보드(쿼리) | `scripts/` | 전부 | 2일 |
| 9 | 클로즈드 베타 빌드(APK flavor `expedition`, 별도 서명)·테스터 배포 | APK | 전부 | 1일 |
- 합계 약 21일 [추정]. **병렬 가능**: 3·4·6·7. **차단 요소**는 작가 몫(스토어 앱 등록·상품·AdMob·결제 프로필·사업자 정보).

## 10. 테스트·수용 기준
- **뽑기 분포 단언**: 서버 코드를 100만 회 돌려 ★5 평균 32회·최대 80·소프트 천장·픽업 보장·10회 ★4+ 가 GDD 표와 일치(`tools/rpg_sim.js` 의 뽑기 코드와 같은 수치).
- **전투 일치 단언**: 클라이언트가 보낸 `events_hash` 와 서버 재현 해시 일치(S0 의 `exp_smoke` 결정론 단언을 서버로 확장).
- **결제 단언**: 같은 `order_id` 두 번 → 한 번만 지급 · 환불 → 회수 · 상한 초과 → precheck 차단 · 12~13세 차단.
- **보안 점검**: JWT 위조·재생·권한 상승·SQL 주입·속도 제한 시험, 시크릿이 앱·저장소에 없는지 검사(배포 전 grep 단언 — 기존 `deploy_play.sh` 방식).
- **헤드리스 E2E**: Playwright + wrangler dev 로 가입→1나라 클리어→모집→(스토어 테스트 결제 모의)→월 상한 시나리오.

## 11. 위험·결정 요청
1. **12~13세 결제 차단**을 법무 확정 전에 기본값으로 둘지(D26 은 19세 미만 7만원 + 안내까지만 결정) — 보수적 기본값(차단) 제안.
2. **마이너스 잔고** 허용 여부(환불 시) — 제안은 허용+사용 제한.
3. Cloudflare Workers CPU 한도 안에서 **전투 재현**이 충분한지(1전투 수 ms 추정 — WP4 초기에 실측하고, 부족하면 큐/Durable Object).
4. 퍼블리셔 계약 시 판매·정산 주체가 퍼블리셔로 바뀌면 `purchases`·정산 CSV·영수증 검증 키가 퍼블리셔 계정 기준으로 바뀜 — WP5 를 어댑터로 설계(스토어별 `verify` 구현 분리).
5. 서버 운영 책임(장애 대응·CS)이 새로 생긴다 — 점검 스위치·공지·백업을 WP7·8 에 포함.

## 12. 진행 현황 (WP1~3, 2026-10-13 로컬 구현 완료)
| WP | 상태 | 내용·검증 |
|---|---|---|
| 1 서버 골격 | ✔ 로컬 | `server/`(Worker·D1 스키마·JWT·멱등·충돌 재시도), node:sqlite D1 shim 으로 계정 없이 시험 |
| 2 계정·저장 | ✔ 로컬 | 연령 화면(12 미만 차단·12~13 결제 차단 안내·19 미만 보호자 안내)·익명 계정·토큰 회전·클라우드 프로필·편성·레벨업, 클라이언트 원격 모드(`?api=`) |
| 3 서버 뽑기 | ✔ 로컬 | `/gacha/pull`(CSPRNG·천장·픽업 보장·로그·장부·멱등·동시성), 공유 코어 `gacha-core.js`, 20만 회 분포 시험 |
- 시험: `server/test/api.test.js` 12개 통과 · `tools/exp_remote_smoke.js` 통과(가입→뽑기→새로고침 복원→레벨업→편성→12~13세 안내) · S0 `exp_smoke` 통과(로컬 모드 회귀 없음).
- 발견: ★4 **실효 비율**이 표시 확률 13.5%보다 높다(10회 ★4+ 보장 포함 약 16~17%) — 확률 공개 화면에 「10회 보장 포함 실효」 문구를 넣는다(법무 확인 때 표기 방식 결정).
- 남은 것: 원격 배포(계정), WP4~9. 클리어 보상은 서버가 판정하기 전까지 개발 서버의 `/dev/grant` 로 흉내(prod 404).
