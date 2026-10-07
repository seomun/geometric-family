"""퍼블리셔 데모 폴더: python games/tools/make_demo.py → games/demo/
두 앱 단일 HTML(재빌드) + 1·2편 APK(있는 것) + 스크린샷 + 영상 + README. HTML·APK 는 용량 때문에 git 에 올리지 않고(games/.gitignore) 이 스크립트로 다시 만든다."""
import pathlib, shutil, subprocess, sys
G = pathlib.Path(__file__).resolve().parents[1]; D = G / 'demo'
D.mkdir(exist_ok=True)
for s in ('build.py', 'build_idle.py'):
    subprocess.run([sys.executable, str(G / 'tools' / s)], check=True, stdout=subprocess.DEVNULL)
copy = [(G / 'app' / 'index.html', 'play_toddler.html'), (G / 'app' / 'idle.html', 'play_threetables.html'),
        (G / 'android' / 'app' / 'build' / 'outputs' / 'apk' / 'debug' / 'app-debug.apk', 'toddler_debug.apk')]
for src, name in copy:
    if src.exists(): shutil.copy2(src, D / name); print('copy', name, round(src.stat().st_size / 1e6, 1), 'MB')
    else: print('skip(없음)', src)
for sub, dst in (('store/shots', 'screens_toddler'), ('store/shots_idle', 'screens_threetables')):
    out = D / dst; out.mkdir(exist_ok=True)
    for f in sorted((G / sub).glob('phone_*.png')): shutil.copy2(f, out / f.name)
for f, n in ((G / 'media' / 'store_phone_30s.webm', 'video_toddler_30s.webm'), (G / 'media' / 'idle_phone_30s.webm', 'video_threetables_30s.webm')):
    if f.exists(): shutil.copy2(f, D / n)
for f in ('cover_book1.png', 'cover_book2.png', 'icon_512_semo.png'):
    if (G / 'store' / f).exists(): shutil.copy2(G / 'store' / f, D / f)
print('demo ready:', D)
