# RC3 — 기하학 가족 게임 10종 (동결 노트)

버전 `1.0.0-rc3` (versionCode 3) · 2026-10-08 · 커밋 기준: 이 파일이 들어간 커밋
서명: **테스트 키**(저장소 밖 ~/gftestkey) — 열 앱이 같은 키라서 집 공유 시험 가능. 정식 키·방침 URL·운영자 정보는 작가/퍼블리셔 확인 후 재빌드.

## 앱 10종
| 앱 | 패키지 | 대상 | 내용 |
|---|---|---|---|
| ① 놀이터 | com.geometricfamily.play | 만 3~6세 | 3권 15장 45단계, 놀이 15종, 스티커, 아이 방 장난감 |
| ② 세 가족 식탁 | …tables | 성인 | 방치형, 사연 30편·소품 30종 |
| ③ 도형 합치기 | …merge | 만 13세↑ | 120판 + 오늘의 한 판·시즌 판·세 가족 판 |
| ④ 막둥이 색칠북 | …color | 만 3~6세 | 80장 색칠·번호·점 잇기·스티커·벽지·웹툰 컷 |
| ⑤ 당신은 어느 도형? | …quiz | 만 13세↑ | 테스트 17종·102문항·결과 9종·미니게임 5종·카드 이미지 저장 |
| ⑥ 다른 그림 찾기 | …spot | 만 13세↑ | 120판 12장(옛이야기 장면), 8가지 차이 연산, 숨은 물건·기억판, 사진·앨범 세트 20종 |
| ⑦ 도형 블록 | …block | 만 13세↑ | 120판 12장, 판 종류 7, 외관·지붕·담장 세트 20종 |
| ⑧ 정리의 달인 | …sort | 만 13세↑ | 120판 12장, 판 종류 6(정리·좁은 칸·잠긴 칸·가려진 칸·짝 칸·세 가족), 수납 세트 20종 |
| ⑨ 세 가족 짝 맞추기 | …tile | 만 13세↑ | 120판 12장, 판 종류 6, 마당 살림 세트 20종, 세계관 소품·이야기 상징 타일 |
| ⑩ 막둥이의 하루 | …day | 만 3~6세 | 생활 습관 놀이 5종을 12장면(양치·옷 입기·아침밥·장난감 정리·잠자리·손 씻기·세수·신발·간식·목욕·책·잘 자요) **60판**, 장면마다 옛이야기 1편, 글자 없음·실패 없음, 욕실·침실 세트 20종 |

## RC2 이후 바뀐 것
- 새 앱 5종(⑥~⑩): 모두 같은 키트(UK)·엔진 상단 바·`GF.story` 사연·`UK.finger`·첫 인사·공통 소리 id·공유 「우리 집」(D12 그룹: 유아 ①④⑩ / 성인 ②③⑤~⑨)
- 공통 판 생성기 패턴: 풀 수 있음을 **구성으로 보장**(⑦ 빔 탐색 · ⑥ 요소 목록+차이 연산 · ⑨ 제거 순서에서 거꾸로 · ⑧ 정리된 상태에서 거꾸로 섞기) + sim(전판 재생·단언) + smoke(실제 화면 입력)
- 단일 배역표 `tools/tales_cast.py`(같은 옛이야기 = 같은 배역, 가족 악역 0·세모 웃긴 실패역 전체 ≤3)
- 버튼 줄 꺾임 자동 검사(`tools/btn_wrap_check.js`), 키트 `.uk-btn{white-space:nowrap}`
- ⑨ 타일 54px·바구니 같은 크기, 안내 토스트는 목표 줄 아래·한 줄, ⑧ 토스트는 정보 줄 자리에 불투명
- ⑩ 유아 점검 `games/KIDS_COMPLIANCE.md §7`(글자 없음 단언·권한 0·보호자 잠금)

## 검증 (실제 결과 — 통과·실패 그대로)
정본은 **구간별 로그 한 파일씩**(`notes/rc3/*.log`, 요약 `notes/rc3/segments_summary.txt`). 처음의 한 파일 회귀(`notes/rc_regress.log`)는 메모리 부족 강제 종료와 중복 실행이 섞여 ALL PASS 로 읽을 수 없어 쓰지 않는다.
- **구간 회귀 전부 통과**(한 번에 하나, 포그라운드, 서버 1개): ① 1~10장 · ① 3권 11·12·13·14·15장 · ③ merge 1-5·6-10·11-15·16-20 · ⑦ block 1~120(12구간) · ⑥ spot 1~120(6구간) · ⑨ tile 1~120(12구간) · ⑧ sort 1~120(4구간) · ⑩ day 1~60(4구간, 장마다 첫 판은 실제 포인터) · ④ color · ⑤ quiz · ② idle_smoke · first30 · greet · btn_wrap · room_codes · 각 sim(merge·quiz·idle·block·spot·tile·sort·day)
- **첫 실행 때만 흔들렸던 것**: idle_smoke(컷 이미지 로드), greet ③(「UK is not defined」), first30(TimeoutError), ① 2장 콘솔의 `ERR_CONNECTION_REFUSED`. 원인 **가설**: `python -m http.server` 의 접속 대기열이 작아(backlog 5) 스크립트 십여 개를 동시에 요청할 때 가끔 연결이 거부됨. 대기열 256 서버 `tools/serve.py` 로 바꾼 뒤 같은 검사들이 **모두 오류 0 으로 통과**(① 2장 포함) — 가설과 맞지만 **부하 없이 옛 서버로 재현해 보지는 못해 확정은 아님**.
- **에뮬레이터(Android 16/API 36.1, 헤드리스, 메모리 2GB)**
  - 설치: release APK 10개 모두 `Success`, 열 앱 서명 동일(한 가지 서명값 10건), 실행 후 프로세스 생존 10/10, logcat `FATAL EXCEPTION` 0건
  - 집 공유(디버그 빌드 6개로 WebView 에서 `GFShare.put/peers` 실행): 유아 ①(play)·④(color)·⑩(day) 서로 다른 둘의 값을 읽음 · 성인 ⑧(sort)·⑨(tile)·③(merge) 서로의 값을 읽음 · **그룹 격리**: 유아→성인 키 `[]`, 성인→유아 키 `[]`, 유아 앱이 성인 키에 넣은 값은 성인 앱에서 보이지 않음
  - 한계: 성인 7앱 전부(tables·quiz·spot·block 포함)를 서로 읽어 보지는 않았고 대표 3앱(sort·tile·merge)만 확인. 이전 RC 때 설치된 형제 앱 값은 읽힘(같은 그룹)
- 10×3 통일성 캡처 `notes/snapshots/unity_10x3_rc3.png`

## 이번 RC 에서 찾아 고친 것
- **⑧ APK 빌드 실패**: flavor 이름 `sort` 가 Groovy 컨테이너의 내장 메서드(`sort`)와 겹쳐 `Could not find method dimension()` → `create('sort') { ... }` 로 선언(메모리 문제 아님). 
- 에뮬레이터를 끄고(adb emu kill) gradle 메모리를 `-Xmx1g` 로 낮춤(`games/android/gradle.properties`).
- ⑩ 60판 확장(허브 결정): 12장면×5판, 장면 그림 테마(이·손·얼굴·몸 / 장난감·신발·책 / 밥·간식), 옛이야기 12편, 장 길 화면 3열 격자
- ⑩ 허브 QA 4건(잠자리 밝기·양치 얼굴과 이·진행 점 알약·토끼=동그라미 아저씨·해님 달님 호랑이 컷)

## 알려진 문제 / 한계
1. **실기기 미확인**: 소리 판정, 끌기·문지르기 체감, 설치·공유·저장 — 작가 폰 결과 대기(`demo/INSTALL_ko.md`)
2. 서명 키가 테스트 키 — 스토어 제출 불가 상태. 사업자 정보·방침 URL·정식 키 필요
3. ⑩ 60판 확장은 허브 QA 전. 손 씻기 그림(손바닥·손가락)은 임시 코드 SVG. ⑦ 레벨 104 콤보 탐욕 승률 0.28(기준 0.35 미달, 실기기 피드백 후 재조정)
4. 그림·소리·음악은 임시(이모지·방 아이템·코드 SVG, ASSET_LIST·sounds.json 슬롯 목록 최신), 아트 패스(Recraft)·음악(Suno)은 나중에 일괄
5. 모든 사연·시즌 판 이름·인사 문구는 [제안] 각색 — 작가 확인 필요. 작가 원문 문장은 이름·대사로 쓰지 않음
6. Android 9 이하 ⑤ 이미지 저장 불가(실패 안내), 형제 앱 집 공유는 같은 키 설치 시에만
7. 이력에 APK·옛 문서 메일이 남아 있음(허브가 처리)

## 산출물 (games/demo/, git 미추적)
- `apk/*-release.apk` 10개(같은 테스트 키 서명, ⑩ 은 60판 빌드), `gf_phone_pack.zip`, `install_all.bat`, `INSTALL_ko.md`, `play_*.html`, `screens_*`, `icon_*.png`
- `toddler-release.apk` 35d8a9e1ceffeeea… (4352 KB)
- `tables-release.apk` beddcde4e941c57e… (956 KB)
- `merge-release.apk` 4a13297db6bc376e… (832 KB)
- `color-release.apk` 7272c022bff027c3… (812 KB)
- `quiz-release.apk` 0237564e4768693d… (572 KB)
- `spot-release.apk` 980daed15d0d4264… (860 KB)
- `block-release.apk` f9a086c2ce7ed83f… (812 KB)
- `sort-release.apk` ef341496b39bea52… (804 KB)
- `tile-release.apk` 3b18ad93394f3fec… (824 KB)
- `day-release.apk` 0706e6e797caa131… (668 KB)

## 동결 규칙
이후 실기기 피드백·작가 결정 전까지 **기능 추가 없음, 버그 수정만**(⑩ 확장·⑧~⑨ 아트 패스는 허브 지시 후). 재현: `bash tools/rc_regress.sh`, `python games/tools/make_demo.py --apk`.
