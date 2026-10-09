# RC6 노트 (1.0.0-rc6, versionCode 6) — 소리 교체 · 이야기 층 · 광고(D19) · 이야기 지도(D18)

> 앱 10종 flavor, 같은 서명 키(테스트 키 `~/gftestkey/test.jks` 로 서명한 release 10개 `games/demo/apk/*-release.apk`). 정식 키·AdMob 실제 ID 는 작가 몫.

## 1. 바뀐 것
| 영역 | 내용 | 근거 파일 |
|---|---|---|
| 소리(B) | 효과음 23슬롯 Kenney CC0 로 교체(같은 id·파일명), LUFS 정규화, 자작 유지 2개(wind·whistle) | `SOUND_CREDITS.md`, `tools/make_sfx_cc0.py` |
| 이야기(A) | 프롤로그·기승전결·판 말풍선·판 종류 설명·「도움말」·엔딩+「당신은 어느 도형인가요?」, 첫 판 안내 순서(설명 카드 → 손가락 → 첫 조작 뒤 말풍선, 카드 있으면 토스트 생략) | `18_STORY_PASS.md`, `engine/tale.js`, `data/story_*.json` |
| 광고(D19) | AdMob+UMP, 성인 배너(홈·지도)·전면(규칙)·보상형 / 유아 홈·지도 배너만+TFCD·G·비개인화·AD_ID 제거, 웹판 no-op | `16_ADS_RND.md`, `AdsBridge.java`, `KIDS_COMPLIANCE.md`, `store/DATA_SAFETY_ads_ko.md` |
| 지도(D18) | `GF.saga` 이야기 지도: ③⑥⑦⑧⑨ 레벨 목록 → 지도, ⑩ 하루 길(큰 노드), ② 사연 길, ⑤ 테스트 지도, ④ 색칠 길(그림 썸네일 노드). ① 는 기존 책 지도 유지. 곁가지 = 오른쪽 레일, 장 이름 띠, 구역별 임시 실루엣(17종), 랜드마크·상자·관문 겹침 0 | `19_SAGA_MAP.md`, `engine/saga.js·css`, `data/maps/*.json`, `tools/map_build.py` |
| 자산 | `ASSET_LIST.csv` 우선순위 열(1=대표 그림·배경·이야기 컷 배경 / 2=타일·소품 / 3=집 아이템), 이야기 컷 배경 17행 추가 | `tools/asset_prio.py` |
| 허브 QA 반영 | ⑦ 지도 4건(랜드마크 겹침·장 이름·판 종류 아이콘+길게 눌러 이름·구역 배경 실루엣) | `tools/saga_smoke.js` |

## 2. 확인한 것
- `node tools/saga_smoke.js`(6앱): 노드 수 = 판 수(120/120/140/120/120/60), 처음엔 1판만 열림, 구역마다 관문·상자, 아바타, **겹침 0**, 전체 스크롤 훑기 ≈1.4초·DOM ≤ 1550, 큰 글씨 글자 안 잘림.
- `tools/ads_rules.js`: 전면 규칙 9개(처음 5판·앱 3분·3판 1회·2분 30초·하루 8회·오늘의 한 판/시즌/사연 직후 금지) · 배너는 홈·지도에만(성인·유아) · 유아 전면·보상형 불가 · 웹판(`?ads` 없음) 전부 no-op · 결과 닫기 → 전면 → 다음 순서.
- `tools/story_shots.js`·`story_flow.js`: 프롤로그(건너뛰기·한 번만)·승 컷·기 컷→설명→말풍선 순서.
- 앱 smoke: merge·spot·sort·tile·block·day·idle·color·quiz·extras·greet·ads_shots·ads_rules·saga_smoke·story_* 통과(지도 바꾼 앱은 셀렉터를 `.sg-node` 로 갱신, 가상 스크롤이라 전체 훑은 뒤 개수 단언).
- aapt: release 10개 `versionName=1.0.0-rc6`. **유아 3앱(toddler·color·day)에는 `AD_ID`·`ACCESS_ADSERVICES_*` 없음**, 성인 7앱은 AD_ID 있음(광고 SDK). 모두 INTERNET·ACCESS_NETWORK_STATE(+WAKE_LOCK·FOREGROUND_SERVICE 는 SDK 의존 라이브러리).
- 에뮬레이터(debug APK, 광고 SDK 초기화): ⑦ 설치·실행·FATAL 0·SDK 초기화·테스트 요청 3건(배너·전면·보상형) 로그 확인.

## 3. 확인하지 못한 것 (정직)
| 항목 | 이유 | 확인 방법 |
|---|---|---|
| **테스트 광고 3종이 화면에 뜨는지·빈도 상한 실기** | 에뮬레이터에 인터넷이 없어 「Ad failed to load: 2(네트워크)」. 메모리 여유 2.7GB(<3GB)라 `-dns-server` 에뮬레이터 재시도는 하지 않음 | 작가 실기기에 debug/release APK 설치 → 홈에서 배너, 5판 뒤 3분 지나 결과 닫기 → 전면, 보상형 버튼. 또는 메모리 여유 3GB↑일 때 `emulator -dns-server 8.8.8.8` 로 재확인 |
| 10앱 에뮬레이터 설치·공유(RC5 에서 이월) | 같은 이유(메모리) | 3GB↑에서 RC5_NOTES 절차 |
| UMP 동의 창(EEA 등) | 한국 기기·에뮬레이터에선 안 뜸 | AdMob 콘솔의 테스트 지역 설정 후 실기기 |
| 유아 배너의 앱 밖 이동 | SDK 기본 동작(막을 수 없음) — 홈·지도에만 있어 놀이 중엔 없음. 문서에 명시 | Families 심사 때 필요하면 `GF.ads.config.banner=false` |
| 리더보드·②~⑤ 판 안 이야기 | ②④⑤ 는 장이 없어 프롤로그+도움말+지도만 | — |

## 4. 작가가 할 일 (광고)
`16_ADS_RND.md` D19 목록 그대로: AdMob 가입·앱 10개 등록·광고 단위 ID(`~/.gradle/gradle.properties` 의 `GF_ADMOB_*_<FLAVOR>`)·유아 3앱 「어린이 대상」 설정·성인 차단 카테고리(사행성·정치·주류)·app-ads.txt 도메인·Play Console 데이터 보안(`store/DATA_SAFETY_ads_ko.md`). **테스트 ID 로 스토어에 올리지 말 것**(`BuildConfig.GF_AD_TEST`).

## 5. 웹판
`bash tools/deploy_play.sh` 는 허브가 실행(웹판은 `GF.ads.live()=false` 라 광고 no-op, 기록은 localStorage).

## 6. 알려진 한계·다음
- 구역 배경·랜드마크·상자·관문은 임시 SVG/이모지 — 아트 패스 때 `data/art_slots.json` 의 `map` 슬롯 파일만 채우면 교체(19_SAGA_MAP.md §4).
- ① 놀이터는 기존 책 지도 유지(5장·3판 구조가 달라 이번엔 건드리지 않음). 필요하면 별도 지시.
- 판 안 말풍선·설명 문구는 모두 [제안] — 작가 확인 필요.

## 좋아진 것 3 / 다음 3
- 좋아진 것: ① 소리가 CC0 로 깨끗해지고 출처가 문서화됨 ② 모든 앱에 이야기(프롤로그·기승전결·말풍선·설명)와 사가 지도가 같은 모양으로 들어감 ③ 광고가 규칙·유아 보호(AD_ID 제거·비개인화)와 함께 들어가고 웹판은 no-op.
- 다음: ① 실기기/인터넷 에뮬레이터에서 광고 표시·빈도 확인 ② 작가 AdMob ID 주입 → 정식 서명 release ③ 아트 패스(우선순위 1: 구역 배경·관문·랜드마크·이야기 컷 배경).

## RC6.1 (1.0.0-rc6.1, versionCode 7) — 허브 QA 2건
- ① 지도 구분: 길 모양 프리셋 8종을 앱마다 다른 시작·걸음으로 배치(`APP_PATH`), 앱 주제 소품 2개씩(③ 이삿짐 🧳🪑 · ⑥ 액자 🖼️🪞 · ⑦ 블록 더미 🧱🏗️ · ⑧ 선반 🗄️🧺 · ⑨ 타일 바구니 🧺🀄, 슬롯 `map.<앱>:prop1|prop2`). 구역 실루엣(이야기 장소)은 그대로. 소품도 겹침 0 단언에 포함(saga_smoke 통과).
- ② 「⑤ 테스트 지도 아래 큰 검은 ▶」: 재현 안 됨. 개발 서버/빌드본 모두에서 `.sg-go` 는 키트 초록(rgb 108,203,138)·64px 로 계산됨(1000px·390px 폭, 10앱). 우리 캡처 한 장(통일성 시트의 ⑤ 지도 칸)에서 **스타일시트가 늦게 로드된 순간** 키트 CSS 가 없는 화면이 찍힌 것을 확인(상단 바도 네모) — 캡처 도구(`saga_shots.js`)가 `networkidle` 을 기다리게 고침. 허브가 본 화면이 이와 다르면(예: 웹판 특정 폭) 해당 URL·폭을 알려 달라.
- 짧은 회귀: merge/spot/block/sort/tile smoke(LV=1-8) · ads_rules · saga_smoke · story_flow 전부 통과, release 10개 rc6.1 재빌드(유아 3앱 AD_ID 없음 유지).
