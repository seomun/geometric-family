"""퍼블리셔·실기기 테스트 묶음: python games/tools/make_demo.py [--apk]  → games/demo/
앱 5종 단일 HTML(재빌드) + 스크린샷(액자) + 영상 + 설치 안내 + (--apk) 같은 테스트 키로 서명한 APK 5개와 install_all.bat / gf_phone_pack.zip.
HTML·APK·zip 은 용량 때문에 git 에 올리지 않고(games/.gitignore) 이 스크립트로 다시 만든다. 서명 키는 퍼블리셔 확인 전까지 테스트 키(저장소 밖 ~/gftestkey)."""
import os, pathlib, shutil, subprocess, sys, zipfile
G = pathlib.Path(__file__).resolve().parents[1]; D = G / 'demo'; D.mkdir(exist_ok=True)
APPS = [('toddler', '① 기하학 가족 놀이터', 'index.html', 'shots', '만 3~6세'), ('tables', '② 기하학 가족: 세 가족 식탁', 'idle.html', 'shots_idle', '성인'),
        ('merge', '③ 기하학 가족: 도형 합치기', 'merge.html', 'shots_merge', '만 13세↑'), ('color', '④ 기하학 가족: 막둥이 색칠북', 'color.html', 'shots_color', '만 3~6세'), ('quiz', '⑤ 기하학 가족: 당신은 어느 도형?', 'quiz.html', 'shots_quiz', '만 13세↑')]
BUILD = {'toddler': 'build.py', 'tables': 'build_idle.py', 'merge': 'build_merge.py', 'color': 'build_color.py', 'quiz': 'build_quiz.py'}
for fl, *_ in APPS: subprocess.run([sys.executable, str(G / 'tools' / BUILD[fl])], check=True, stdout=subprocess.DEVNULL)
for fl, nm, h, shots, age in APPS:
    shutil.copy2(G / 'app' / h, D / f'play_{fl}.html'); out = D / f'screens_{fl}'; out.mkdir(exist_ok=True)
    for f in sorted((G / 'store' / shots).glob('phone_*.png')): shutil.copy2(f, out / f.name)
    ic = G / 'store' / f'icon_512_{ {"toddler": "semo"}.get(fl, fl) }.png'
    if ic.exists(): shutil.copy2(ic, D / f'icon_{fl}.png')
for f, n in ((G / 'media' / 'store_phone_30s.webm', 'video_toddler_30s.webm'), (G / 'media' / 'idle_phone_30s.webm', 'video_tables_30s.webm')):
    if f.exists(): shutil.copy2(f, D / n)
for f in ('cover_book1.png', 'cover_book2.png'):
    if (G / 'store' / f).exists(): shutil.copy2(G / 'store' / f, D / f)
for old in ('play_threetables.html', 'play_toddler.html.bak', 'toddler_debug.apk', 'screens_toddler', 'screens_threetables', 'video_threetables_30s.webm', 'icon_512_semo.png'):
    p = D / old
    if p.is_dir(): shutil.rmtree(p)
    elif p.exists(): p.unlink()
apk = D / 'apk'
if '--apk' in sys.argv:
    env = dict(os.environ, TESTKEY=str(pathlib.Path.home() / 'gftestkey' / 'test.jks').replace(chr(92), '/'))
    subprocess.run([sys.executable, str(G / 'tools' / 'build_apk.py'), 'release'], check=True, env=env)
for f in ('install_all.bat', 'INSTALL_ko.md'):
    pass
(D / 'install_all.bat').write_text('@echo off\r\nREM 폰을 USB 로 연결(개발자 옵션 > USB 디버깅 허용)하고 이 파일을 더블클릭. adb 가 PATH 에 없으면 platform-tools 폴더에서 실행.\r\nfor %%f in (apk\*-release.apk) do (echo %%f & adb install -r "%%f")\r\npause\r\n', encoding='utf-8')
rows = '\n'.join(f'| {nm} | 앱 {fl}-release.apk | `play_{fl}.html` | {age} |' for fl, nm, h, s, age in APPS)
(D / 'INSTALL_ko.md').write_text(f'''# 작가 폰에 다섯 앱 한 번에 깔기

다섯 앱은 **같은 서명 키**로 만든 APK 다섯 개입니다(`apk/`). 지금은 **테스트 키**라서 스토어용이 아니라 시험 설치용입니다(스토어에 올릴 때는 퍼블리셔 확인 뒤 정식 키로 다시 만듭니다).

| 앱 | 설치 파일 | 브라우저로 먼저 해보기 | 대상 |
|---|---|---|---|
{rows}

## 방법 A — 파일로 옮겨 깔기 (케이블 없이)
1. `apk/` 폴더의 APK 다섯 개(또는 `gf_phone_pack.zip` 하나)를 폰으로 보낸다(카톡 나에게 보내기·구글 드라이브·USB 모두 가능).
2. 폰에서 파일을 눌러 설치. 처음이면 「이 출처의 앱 설치 허용」을 켠다(설정 > 보안 또는 앱 설치 화면의 안내).
3. 홈 화면에 아이콘 다섯 개(세모·막둥이·네모 엄마·네모·동그라미 얼굴)가 생긴다.

## 방법 B — USB 로 한 번에
폰을 PC 에 연결하고 개발자 옵션의 USB 디버깅을 켠 뒤 `install_all.bat` 더블클릭(adb 필요).

## 해 볼 것 (10분)
- 각 앱을 열어 세로·가로 돌려 보기, 뒤로가기(제스처)로 홈까지 나가지는지, 소리가 어색하지 않은지
- **집 공유**: ④ 색칠북에서 그림을 하나 완성 → ① 놀이터의 「우리 집」(보호자 잠금: 구구단) 에서 같은 집이 보이는지. ③ 도형 합치기에서 가구를 얻으면 ② 식탁·⑤ 어느 도형의 집에도 보이는지. (유아 둘 / 성인 셋은 서로 다른 집이 맞다)
- ⑤ 결과 화면 「이미지 저장」 → 폰 사진첩의 「기하학 가족」 폴더에 생기는지(권한 팝업이 뜨면 안 된다)
- 이상하면 화면을 캡처해서 보내 주세요.

## 정직한 현재 상태
- 소리·음성은 임시(작가 판정·성우 녹음 대기), 일부 그림은 임시 아이콘/이모지.
- 판매자 등록·정식 서명 키·방침 게시는 사람 일로 남음.
''', encoding='utf-8')
(D / 'README.md').write_text(f'''# 기하학 가족 — 퍼블리셔 데모 (다섯 앱)

세 도형 가족(네모·세모·동그라미)이 **같은 사건을 다르게 겪는** 웹툰 IP의 게임 다섯 종. 캐릭터는 코드·시트 기반이라 매 컷 동일하고 저작권이 깨끗하다. 앱끼리 「우리 집」을 나눠 쓴다(같은 서명·같은 기기, 유아 그룹 ①④ / 성인 그룹 ②③⑤).

| 앱 | 대상 | 한 줄 |
|---|---|---|
| ① 놀이터 | 만 3~6세 | 3권 15장·45단계, 놀이 15종 + 이어지는 옛이야기 + 스티커 |
| ② 세 가족 식탁 | 성인 | 방치형 + 사연 30편 |
| ③ 도형 합치기 | 만 13세↑ | 120판 + 오늘의 한 판 + 세 가족 판 |
| ④ 막둥이 색칠북 | 만 3~6세 | 80장 색칠·스티커·벽지 |
| ⑤ 당신은 어느 도형? | 만 13세↑ | 테스트 12종·미니게임 5종·내 도형 카드 |

- 설치: `INSTALL_ko.md` (APK 5개 · `install_all.bat` · `gf_phone_pack.zip`)
- 브라우저로 바로: `play_<앱>.html`
- 스크린샷(액자형) `screens_<앱>/`, 영상(소리 없음) `video_*_30s.webm`, 아이콘 `icon_<앱>.png`
- 소개 문구·개인정보처리방침·등급 답안: `games/store/` (`LISTING|PRIVACY|RATING_<앱>_ko.md`)

재생성: `python games/tools/make_demo.py --apk` (HTML·APK 는 git 에 올리지 않음)
''', encoding='utf-8')
if apk.exists() and list(apk.glob('*-release.apk')):
    with zipfile.ZipFile(D / 'gf_phone_pack.zip', 'w', zipfile.ZIP_DEFLATED) as z:
        for f in sorted(apk.glob('*-release.apk')): z.write(f, f.name)
        z.write(D / 'INSTALL_ko.md', 'INSTALL_ko.md')
print('demo ready:', D)
