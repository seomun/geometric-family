# ⑪ 기하학 원정대 서버 (Cloudflare Workers + D1)

설계: `games/27_EXPEDITION_SERVER.md` · S1 설계 `games/29_EXPEDITION_S1.md`. **지금은 WP1~3(골격·계정·저장·서버 뽑기)이 로컬에서 동작**한다. 원격 배포·결제·광고는 계정 준비 뒤(D27).

## 구성
```
src/worker.js   라우팅·인증(JWT HS256)·오류 처리·충돌 재시도 (+ /dev/grant 는 ENV=dev|test 전용)
src/game.js     연령 대역·계정 생성·프로필·편성·레벨업·서버 뽑기·삭제  (규칙·확률표는 클라이언트와 같은 파일을 import)
src/lib.js      JWT·해시·CSPRNG·응답 도구(외부 의존 0)
migrations/     D1 스키마(0001_init.sql)
test/           node:test + node:sqlite 기반 D1 shim (wrangler 없이 12개 시험)
dev-local.js    로컬 HTTP 서버(D1 shim 파일 DB) — 클라이언트 연동 시험용
```
공유 코드: `../games/expedition/battle-core.js`(전투, WP4 에서 서버 재현) · `gacha-core.js`(뽑기) · `../data/expedition_slice.json`(확률·동료·단계).

## 실행
- 시험: `cd server && npm test` (계정·연령 대역·토큰 회전·편성·레벨업·서버 뽑기·멱등·천장·동시성·20만 회 분포·삭제)
- 로컬 서버: `node server/dev-local.js 8788` → 앱은 `…/games/expedition/index.html?api=http://127.0.0.1:8788`
- 클라이언트↔서버 시험: `node tools/exp_remote_smoke.js` (연령 화면 → 가입 → 서버 뽑기 → 새로고침 복원 → 레벨업 → 편성 → 12~13세 안내)
- wrangler(선택, 계정 불필요): `npm install` 후 `npm run dev`(로컬 D1), `npm run migrate:local`. 원격 배포는 `database_id`·비밀값(`wrangler secret put JWT_SECRET`) 이 준비된 뒤.

## API (WP1~3)
`GET /healthz` · `GET /config` · `GET /gacha/odds` · `POST /auth/anon` · `POST /auth/refresh`(1회용 회전) · `GET /profile` · `POST /party` · `POST /unit/levelup` · `POST /gacha/pull` · `POST /account/delete` · `POST /dev/grant`(dev 전용)
- 쓰기 요청은 `request_id` 로 멱등. 재화 변경은 `ledger` 가 진실이고 `wallet` 은 낙관적 잠금(`ver`·`last_req`) 캐시, 충돌은 서버가 재시도한다.
- 연령(D26·D27): 12 미만 가입 불가 · 12~13 결제 차단(상한 0, 보호자 동의 절차 전까지) · 14~18 월 7만원+안내 · 19+ 월 20만원. 광고는 비개인화(`/config`).

## 아직 없는 것 (다음 WP)
`/stage/clear`(서버 전투 재현·보상, WP4) · 결제 검증·월 상한·환불(WP5, 어댑터 분리) · 광고 SSV(WP6) · 원격 설정·분석(WP7) · 속도 제한·백업·관리 CLI(WP8).
