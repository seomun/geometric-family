# 출시 체크리스트 — 기하학 가족 놀이터 1.0.0 (RC)

표기: 🧑 = 사람이 직접 · 🤖 = gf-game 이 이미 함 · ⚠ = 포털에서 확인해야 값이 바뀔 수 있음

## 0. 현재 상태
| 항목 | 상태 |
|---|---|
| 앱 | 🤖 5장 · 15단계 + 놀이방 + 앨범, 폰·태블릿 가로/세로, 오프라인, 권한 0 |
| 빌드 | 🤖 `python games/tools/build.py` → 단일 HTML 5.3MB · release APK/AAB ≈ 4.0MB (임시 키로 서명·`apksigner verify` 통과 확인, 임시 키는 삭제함) |
| 검증 | 🤖 smoke 5장 완주 · 기기 4종 스크린샷 · 에뮬레이터(Android 16)에서 홈·색칠·BGM 생명주기·뒤로가기 |
| 소리 | ⏳ 작가 귀 판정 대기 (자작 합성음, 출처 `SOUND_CREDITS.md`) |
| 방침 | ⏳ 초안 `store/PRIVACY_ko.md` — 운영자 줄 비어 있음, 허브가 github.io 게시 |
| 실기기 | 🧑 갤럭시 A·S·Tab A·Tab S 로 가로/세로·오프라인 확인 |

## 1. 버전
- `versionName 1.0.0` · `versionCode 1` (`games/android/app/build.gradle`). 업데이트마다 versionCode 를 **+1** (같거나 낮으면 스토어가 거절).
- 패키지 `com.geometricfamily.play` — **한 번 올리면 못 바꾼다**. 바꾸려면 지금(제출 전).

## 2. 🧑 서명 키 만들기 · 백업 (가장 중요)
**키를 잃거나 바뀌면 같은 앱을 업데이트할 수 없다.** 한 번만 만들고 절대 저장소(git)에 넣지 않는다.
```
# 1) 폴더를 저장소 밖에 만든다 (예: C:\keys)
mkdir C:\keys
# 2) 키 생성 (JDK 의 keytool). 비밀번호는 길게, 기억할 곳에 따로 적어 둔다
"C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot\bin\keytool.exe" -genkeypair -v ^
  -keystore C:\keys\geometric-family-release.jks -alias gfplay -keyalg RSA -keysize 4096 -validity 36500
# 3) 지문(SHA-256) 확인해서 메모 — 나중에 "같은 키인지" 비교할 때 쓴다
"C:\Program Files\Eclipse Adoptium\jdk-17.0.18.8-hotspot\bin\keytool.exe" -list -v -keystore C:\keys\geometric-family-release.jks -alias gfplay
```
- **백업 3곳**: ① 비밀번호 관리자에 파일+비밀번호 ② 외장 USB(집 보관) ③ 클라우드 암호화 보관함. 복원 시험 1회(다른 폴더에 복사해 `keytool -list` 가 열리는지).
- 비밀번호를 채팅·메일·저장소에 붙여넣지 않는다.
- 서명 연결: `C:\Users\<이름>\.gradle\gradle.properties` 에 4줄(저장소 밖)
  ```
  GF_STORE_FILE=C:/keys/geometric-family-release.jks
  GF_STORE_PASSWORD=...        GF_KEY_ALIAS=gfplay        GF_KEY_PASSWORD=...
  ```
- ⚠ 갤럭시 스토어가 자체 서명(재서명)을 요구하는지는 셀러 포털의 앱 등록 안내에서 확인.

## 3. 🧑/🤖 출시 빌드
```
python games/tools/build.py
copy games\app\index.html games\android\app\src\main\assets\index.html
cd games\android
<gradle 8.14>\bin\gradle.bat assembleRelease bundleRelease
# → app\build\outputs\apk\release\app-release.apk  /  bundle\release\app-release.aab
<SDK>\build-tools\36.1.0\apksigner.bat verify --print-certs app-release.apk     # 서명자·지문 확인
```
상세는 `android/README.md`. 올릴 파일: 갤럭시는 APK·AAB 모두 가능 ⚠ (둘 중 포털이 받는 쪽).

## 4. 🧑 셀러 등록(사업자 명의 확정 후)
| 입력 | 값 |
|---|---|
| 셀러 유형 | **Commercial Seller** (앱 배포 필수). 사업자등록증 · 정산 통장 예금주 = 사업자명 일치 |
| 이메일 | ⚠ Gmail 같은 공용 도메인은 사유 설명 요구 가능 → 사업자 도메인 메일 권장 |
| 공개되는 정보 | 판매자명·전화·주소·방침 URL·지원 메일이 스토어에 표시됨 (사업장 정보로 입력) |
| 앱 이름 | 기하학 가족 놀이터 |
| 패키지 | com.geometricfamily.play |
| 가격 | 무료 (유료 결제·구독 없음, 앱 내 결제 없음) |
| 카테고리 | 게임 > 어린이(Kids) ⚠ 한국 스토어에서 선택 가능한지 확인, 아니면 게임 > 퍼즐/교육 |
| 연령 | 전체 이용가 · 13세 미만 대상(Kids) |
| 언어 | 한국어 (소개문 영어 요약 선택) |
| 한 줄 소개 · 긴 설명 | `store/LISTING_ko.md` |
| 아이콘 | `store/icon_512_semo.png` (512×512, 세모 이모 얼굴 — 허브 결정) |
| 스크린샷 | `store/shots/phone_1~6.png` (1080×1920), `tab_1~6.png` (1920×1200) — 문구는 허브 승인안 |
| 영상 | `media/store_phone_30s.webm` ⚠ 포털이 받는 형식(MP4/유튜브 링크) 확인 후 변환, 소리는 작가 판정 후 입힘 |
| 개인정보처리방침 URL | **`https://________` ← 허브가 github.io 에 게시한 주소** (게시 전에는 제출 불가) |
| 지원 이메일 | {{SUPPORT_EMAIL}} → 사업자 메일로 교체 권장 |
| 개인정보 수집 | 아니오 (이름·사진·위치·기기ID·광고ID 없음) |
| 광고 | 없음 · SDK 없음 |
| 권한 | 없음 (인터넷 포함) |
| 앱 밖 링크 | 없음 (Kids 정책 충족) |

## 5. 🧑 등급 설문 답안 (삼성전자 자체등급분류 설문 기준 ⚠ 실제 문항명은 포털 확인)
| 문항 | 답 |
|---|---|
| 폭력성 / 공포 / 선정성 / 부적절한 언어 / 약물 / 사행성 | 모두 **없음** |
| 앱 내 결제 / 광고 / 유료 아이템·랜덤 상자 | **없음** |
| 사용자 간 채팅·소통 / 사용자 생성 콘텐츠 | **없음** |
| 위치 공유 / 개인정보 공유·수집 | **없음** |
| 외부 링크·웹 접속 | **없음** (인터넷 권한 자체 없음) |
| 예상 결과 | **전체 이용가** (GRAC 직접 심의 불필요 — 청소년이용불가 아님) |

## 6. 제출 전 최종 점검 (모두 ✓ 가 되면 제출)
- [ ] 🧑 작가 소리 판정 → 필요 시 `make_audio.py` 수정 후 `build.py` 재빌드
- [ ] 🧑 실기기 매트릭스: 갤럭시 A(저사양) · S · Tab A · Tab S × 가로/세로 × 비행기 모드(오프라인) — 드래그 끊김·소리·뒤로가기·화면 회전
- [ ] 🤖 `node games/tools/smoke.js` 통과(별 규칙 단언 포함) · `node games/tools/devices.js` 4기기 확인
- [ ] 🧑 방침 운영자(처리자) 줄 기입 → 허브 게시 → URL 을 §4 에 입력
- [ ] 🧑 사업자 명의·도메인 메일 확정, 셀러 승인(영업일 최대 10일)
- [ ] 🧑 서명 키 백업 3곳 + 복원 시험
- [ ] 🤖 호칭 점검(세모 이모·세모 삼촌·동그라미 아저씨·아빠·엄마) — `grep` 로 확인
- [ ] 🧑 ⚠ 갤럭시 포털에서 Kids 카테고리 선택·targetSdk 최소값(현재 35 로 빌드, 요구 ≥33)
- [ ] 🧑 심사 대비 문구: "여러 이야기와 15단계의 오리지널 놀이" (비슷한 앱 여러 개 금지 정책 §1.2.2 에 걸리지 않게 한 앱에 담았음을 설명)

## 7. 출시 후
- 소리·음성(작가 녹음) 도착 시 `data` 의 `voice` 슬롯 연결 → versionCode 2 → 업데이트.
- 2편(막둥이 아이콘 시안 보관)은 같은 앱에 장을 추가하는 업데이트로.
- 구글 플레이를 겸하면 targetSdk 36 으로 올리고 데이터 보안 양식 작성.

---
## 부록 — 앱 5종 납품 상태 (2026-10-07)
| 앱 | 패키지 | 스토어 문서 | 스크린샷 6장 | APK |
|---|---|---|---|---|
| ① 놀이터 | com.geometricfamily.play | LISTING_ko / PRIVACY_ko | store/shots (폰+태블릿) | demo/apk/toddler-release.apk |
| ② 세 가족 식탁 | com.geometricfamily.tables | *_idle_ko | store/shots_idle | tables |
| ③ 도형 합치기 | com.geometricfamily.merge | LISTING·PRIVACY·RATING_merge_ko | store/shots_merge | merge |
| ④ 막둥이 색칠북 | com.geometricfamily.color | *_color_ko | store/shots_color | color |
| ⑤ 당신은 어느 도형? | com.geometricfamily.quiz | *_quiz_ko | store/shots_quiz | quiz |

- ③④⑤ 문서는 `python games/tools/make_store_docs.py` 로 한 틀에서 만든다. 스크린샷: `node games/tools/app_store.js <merge|color|quiz>` → `APP=<앱> python games/tools/frame_shots.py`.
- APK 5개: `python games/tools/build_apk.py release` (flavor 5개, 같은 키로 서명해야 집 공유가 된다). 키는 `~/.gradle/gradle.properties` 의 GF_STORE_* 로 지정하고, 없으면 `TESTKEY=경로` 테스트 키(저장소 밖 `~/gftestkey`). **다섯 앱은 반드시 같은 정식 키 하나**로 서명 — 키를 앱마다 달리하면 공유가 끊긴다.
- 집 공유(D12): 같은 그룹(유아 ①④ / 성인 ②③⑤)의 형제 앱만 `ShareStore`(콘텐츠 제공자, 권한 선언 없음, 호출자 서명 비교)로 서로 읽는다. 다른 그룹 키는 요청도 응답도 거부. 에뮬레이터에서 ③→⑤·②, ①→④ 공유와 유아↔성인 격리 확인.
- ⑤ 이미지 저장: `SaveBridge`(MediaStore, 권한 없음, Android 10+). 9 이하 기기는 저장 실패 안내(minSdk 24 유지).
- 출시 전 사람 확인: 개인정보 처리자 줄, 방침 URL, 정식 서명 키, 퍼블리셔가 요구하는 영상·기타 규격, 실기기(`demo/INSTALL_ko.md`).

## 저사양 점검 (2026-10-07, 에뮬레이터 2GB·480x854·213dpi, 소프트웨어 렌더)
`node tools/cdp_perf.js` (디버그 APK). rAF 간격 중앙값 16.7ms(60fps)는 5앱 모두 유지. 화면 전환 순간 끊김: ①프롤로그 진입 최대 983ms(첫 이미지 디코딩), ②식탁 첫 진입 917ms, 나머지 ≤770ms. 구간 평균 fps ①29 ②23 ③34 ④46 ⑤58(전환 포함 측정이라 낮게 나옴). 메모리 PSS ①114MB ②78MB ③69MB ④90MB ⑤67MB, JS 힙 ≤20MB. 실기기(GPU)에서는 더 나을 것으로 보지만 실기기 확인 대기.

### 전환 끊김(최대 프레임 간격) 전후 — 미리 디코딩 적용 (에뮬레이터 2GB·480x854, 소프트웨어 렌더)
| 구간 | 전 | 후 | 끊김 비율(>50ms) 전→후 |
|---|---|---|---|
| ① 프롤로그→첫 판 | 983ms | 783ms | 7.7%→1.7% |
| ② 식탁 홈→상세 | 917ms | 500ms | 12.4%→3.9% |
| ③ 합치기 판 시작·연쇄 | 767ms | 467ms | 5.6%→3.4% |
| ④ 색칠 번짐 | 184ms | 167ms | 3.5%→2.1% |
| ⑤ 테스트 문항 | 150ms | 150ms | 0.4%→1.2% |
미리 디코딩: `GF.predecode`(홈이 뜬 직후·인사가 떠 있는 동안 한 장씩, 실패 무시). 값은 실행마다 ±수십 ms 흔들린다.
