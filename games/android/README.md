# games/android — WebView APK 뼈대

단일 HTML(`games/app/index.html`)을 `assets/` 에 넣고 WebView 로 띄운다. 권한 0개, 네트워크 없음, 외부 이동 차단, 뒤로가기=`GF.back()`, 백그라운드면 BGM 정지.

## 빌드 (Windows)
```
python games/tools/build.py                        # games/app/index.html (WebP·소리를 data URI 로 인라인, 5.3MB)
mkdir games\android\app\src\main\assets
copy games\app\index.html games\android\app\src\main\assets\index.html
cd games\android
echo sdk.dir=C:/Users/<이름>/AppData/Local/Android/Sdk > local.properties     # 슬래시(/) 로
set JAVA_HOME=C:\Program Files\Eclipse Adoptium\jdk-17...
<gradle 8.14>\bin\gradle.bat assembleDebug          # app\build\outputs\apk\debug\app-debug.apk (≈4.1MB)
```
- 설정: compileSdk 36 · targetSdk 35(갤럭시 스토어 ≥33 충족, 구글 플레이를 겸하면 36) · minSdk 24 · 패키지 `com.geometricfamily.play`.
- **출시용 서명 키(.jks)는 사람이 만든다**(`keytool`). 키·비밀번호는 저장소에 넣지 않는다(.gitignore 처리). 출시 빌드 = `assembleRelease` + 서명, 갤럭시는 AAB·APK 모두 가능.
- 디버그 빌드에서만 WebView 원격 검사가 켜진다(`adb forward tcp:9333 localabstract:webview_devtools_remote_<pid>`).

## 에뮬레이터 확인 결과 (Android 16 / API 36.1, 1080×2400)
홈·지도 화면 정상 · 색칠 캔버스 읽기 정상(칸 10개 인식) · 터치 후 BGM 시작 → 홈 버튼으로 나가면 정지 → 돌아오면 재개 · 뒤로가기 지도→홈→앱 종료 · 전체화면 안내(시스템) 1회 표시.
