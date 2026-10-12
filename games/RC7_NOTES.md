# RC7 노트 (1.0.0-rc7, versionCode 9) — D21 운영·리텐션·구매·알림 + 호칭·배역 정정

> 앱 10종 flavor, 같은 서명 키(테스트 키 `~/gftestkey/test.jks`) release 10개 `games/demo/apk/*-release.apk`. 정식 키·AdMob 실제 ID·상품 ID 는 작가 몫.

## 1. 바뀐 것
| 묶음 | 내용 | 파일 |
|---|---|---|
| **소**(H8·H9 + 운영) | 문의·FAQ · 새 소식(업데이트 뒤 첫 실행 1회) · 복귀 선물(성인, 7일↑) · 금요일 선물(유아 ①④⑩) · ⑩ 오늘의 하루 카드 · 움직임 줄이기 · 인앱 리뷰(성인, 10판 뒤 별 3개, 90일 1회, 그 순간 전면 광고 건너뜀) | `engine/ops.js`, `data/ops.json`, `GFOps.java` |
| **중**(H5·H2·H7) | 이벤트 달력(오프라인 날짜 기반·다시 열기·FOMO 문구 없음, ③⑥⑦⑧⑨②) · 오늘의 작은 일(미션 3개, 하루 1회 확정 소품) · 앨범(집 소품·이야기 카드 3장마다 소품 1개·계절) · 백업 코드(체크섬, 성인+유아 보호자 메뉴) · **i18n 키**: `GF.t` 문자열 표(엔진 고정 문구 43개 이전, 영·일 번역은 표만 바꾸면 됨) · 문의 이메일 빌드 주입 | `engine/ops.js`, `tools/ops_build.py`, `tools/_i18n_move.py`, `build_apk.py` |
| **대**(H1·H3) | **광고 제거·소품 팩**(Play 결제, 성인 한정, 상품 ID 없으면 숨김, 소품 팩은 확정 지급 5개·랜덤 없음, 구매 복원) · **로컬 알림**(「오늘의 한 판」, 성인 한정·기본 꺼짐·하루 1회·야간 없음, 켤 때만 권한 요청) | `GFBilling.java`, `GFNotify.java`, `ops.js` |
| 정정 | 호칭(하나·두리=누나, 세찌=형), 해님 달님=누나와 남동생, 잭=세찌, 눈의 여왕 카이=막둥이·게르다=하나 누나, 성별 일치 단언(`GENDER_OK`), `tales_build` 덮어쓰기 근본 수정 | `tools/tales_*.py` |
| 문서 | `20_MUST_HAVE_FEATURES.md`(조사), `21_SERVER_PLAN.md`(서버 기획), KIDS_COMPLIANCE §10, 스토어 문구·방침·등급·Data safety 갱신 | `games/*.md`, `games/store/*` |

## 2. 확인한 것
- `tools/ops_smoke.js` 전부 통과: 설정 줄·FAQ·새 소식(자동/처음 설치 무음)·움직임 줄이기·리뷰 규칙·복귀/금요일 선물(①④⑩)·⑩ 카드·달력(다시 열기·FOMO 없음)·미션·앨범·백업 코드(정상·체크섬·형식·다른 앱·복원)·구매(상품 ID 없으면 숨김/있으면 줄·광고 제거 효과·소품 팩 5개 1회)·유아 구매·알림 줄 없음·알림 켜기/거부.
- 회귀: extras·ads_shots·ads_rules·saga_smoke·story_flow·story_shots·greet_check·idle·quiz·color·day·merge/spot/block/sort/tile(LV=1-3) 모두 통과(중 묶음 시점).
- 네이티브 컴파일·권한(aapt): release 10개 `versionName=1.0.0-rc7`. 성인: VIBRATE·POST_NOTIFICATIONS·INTERNET·NETWORK_STATE·AD_ID(+ADSERVICES)·BILLING, **유아 3앱: INTERNET·NETWORK_STATE·WAKE_LOCK·FOREGROUND_SERVICE 만**(AD_ID·BILLING·POST_NOTIFICATIONS 없음).

## 3. 확인하지 못한 것 (정직)
| 항목 | 이유 | 확인 방법 |
|---|---|---|
| **광고 화면 표시·빈도(RC6 이월)** | 에뮬레이터 인터넷 없음, 메모리 여유 부족 | 작가 실기기 |
| **실제 결제 흐름(광고 제거·소품 팩)** | 상품 ID 가 아직 없음(Play Console 등록 후), 결제 라이브러리는 컴파일만 확인 | 상품 등록 → `~/.gradle/gradle.properties` 의 `GF_IAP_ADFREE_<FLAVOR>`·`GF_IAP_PACK_<FLAVOR>` → 내부 테스트 트랙 |
| **로컬 알림 실제 표시·권한 창** | 에뮬레이터 확인 안 함(메모리) | 실기기에서 설정 → 「오늘의 한 판 알림」 켜기 → 저녁 7시 확인(WorkManager 최소 15분 주기 한계 내) |
| **인앱 리뷰 창** | Play 스토어 배포 앱에서만 뜸 | 내부 테스트 트랙 |
| **문의 메일 버튼** | 이메일은 `~/.gf/store.env` 의 SUPPORT_EMAIL 을 APK 빌드 때만 주입(저장소·웹판엔 비움) — 이 빌드에 주입됐는지는 apk 내 문자열로 확인 가능 | 실기기에서 FAQ → 메일 보내기 |
| 10앱 에뮬레이터 설치·공유(RC5 이월) | 메모리 | 3GB↑ |

## 4. 작가·퍼블리셔가 할 일
`16_ADS_RND.md` D19 목록(AdMob) + Play Console 상품 2개(광고 제거·소품 팩, 앱마다) + 서버 기획 결정(`21_SERVER_PLAN.md` §6 P1~P9). 클라우드 저장(H2 후반)은 작가 Play 게임즈 계정이 생긴 뒤.

## 5. 웹판
`bash tools/deploy_play.sh`(웹판은 결제·알림·리뷰·메일이 네이티브 없음 → 전부 no-op, 문의 메일 버튼 숨김, 광고 없음).

## 좋아진 것 3 / 다음 3
- 좋아진 것: ① 리텐션·운영 기능(복귀·금요일 선물, 달력·미션·앨범, 문의·새 소식·백업)이 서버 없이 한 층(GF.ops)으로 들어감 ② 광고 제거·소품 팩·로컬 알림이 상품 ID·권한 규칙과 함께 준비됨(유아는 코드·권한 모두 제거) ③ 문자열 표 분리(i18n 키) + 호칭·배역 정정으로 콘텐츠 일관성.
- 다음: ① 작가 실기기 확인(광고·결제·알림·리뷰) ② 상품 ID·AdMob ID 주입 → 정식 서명 release ③ 서버 기획 결정(T1 시작) 또는 아트 패스(작가 결제 후).
