"""APK 다섯 개 한 번에: python games/tools/build_apk.py [debug|release] [flavor ...]
1) 앱 HTML 다섯 개를 다시 빌드 → android/app/src/<flavor>/assets/index.html
2) gradle assemble<Flavor><Type> (JDK17, gradle 8.14.3)  3) games/demo/apk/<flavor>.apk 로 모은다.
release 는 서명 키가 필요: ~/.gradle/gradle.properties 의 GF_STORE_* (없으면 TESTKEY=경로 로 테스트 키). 다섯 앱은 반드시 같은 키여야 집 공유가 된다."""
import os, pathlib, shutil, subprocess, sys, glob
G = pathlib.Path(__file__).resolve().parents[1]; A = G / 'android'
FL = {'toddler': ('build.py', 'index.html'), 'tables': ('build_idle.py', 'idle.html'), 'merge': ('build_merge.py', 'merge.html'), 'color': ('build_color.py', 'color.html'), 'quiz': ('build_quiz.py', 'quiz.html')}
typ = 'debug'; sel = []
for a in sys.argv[1:]:
    (typ := a) if a in ('debug', 'release') else sel.append(a)
sel = sel or list(FL)
for f in sel:
    s, h = FL[f]; subprocess.run([sys.executable, str(G / 'tools' / s)], check=True, stdout=subprocess.DEVNULL)
    d = A / 'app' / 'src' / f / 'assets'; d.mkdir(parents=True, exist_ok=True); shutil.copy2(G / 'app' / h, d / 'index.html'); print('html', f, round((d / 'index.html').stat().st_size / 1e6, 2), 'MB')
gr = glob.glob(os.path.expanduser('~/.gradle/wrapper/dists/gradle-8.14.3-all/*/gradle-8.14.3/bin/gradle.bat'))[0]
env = dict(os.environ, JAVA_HOME=os.environ.get('JAVA_HOME', 'C:/Program Files/Eclipse Adoptium/jdk-17.0.18.8-hotspot'))
extra = []
if typ == 'release' and os.environ.get('TESTKEY'):
    extra = ['-PGF_STORE_FILE=' + os.environ['TESTKEY'], '-PGF_STORE_PASSWORD=gftest1234', '-PGF_KEY_ALIAS=gftest', '-PGF_KEY_PASSWORD=gftest1234']
tasks = ['assemble' + f.capitalize() + typ.capitalize() for f in sel]
subprocess.run([gr, '--no-daemon', '-q'] + extra + tasks, cwd=A, env=env, check=True)
out = G / 'demo' / 'apk'; out.mkdir(parents=True, exist_ok=True)
for f in sel:
    for p in (A / 'app' / 'build' / 'outputs' / 'apk' / f / typ).glob('*.apk'):
        shutil.copy2(p, out / f'{f}-{typ}.apk'); print('apk', f, round(p.stat().st_size / 1e6, 1), 'MB')
