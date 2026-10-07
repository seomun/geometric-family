@echo off
REM 폰을 USB 로 연결(개발자 옵션 > USB 디버깅 허용)하고 이 파일을 더블클릭. adb 가 PATH 에 없으면 platform-tools 폴더에서 실행.
for %%f in (apk\*-release.apk) do (echo %%f & adb install -r "%%f")
pause
