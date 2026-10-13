"""APK 한 번에(원정대 베타 포함): python games/tools/build_apk.py [debug|release] [flavor ...]
1) 앱 HTML 다섯 개를 다시 빌드 → android/app/src/<flavor>/assets/index.html
2) gradle assemble<Flavor><Type> (JDK17, gradle 8.14.3)  3) games/demo/apk/<flavor>.apk 로 모은다.
release 는 서명 키가 필요: ~/.gradle/gradle.properties 의 GF_STORE_* (없으면 TESTKEY=경로 로 테스트 키). 다섯 앱은 반드시 같은 키여야 집 공유가 된다."""
import os, pathlib, shutil, subprocess, sys, glob
G = pathlib.Path(__file__).resolve().parents[1]; A = G / 'android'
FL = {'toddler': ('build.py', 'index.html'), 'tables': ('build_idle.py', 'idle.html'), 'merge': ('build_merge.py', 'merge.html'), 'color': ('build_color.py', 'color.html'), 'quiz': ('build_quiz.py', 'quiz.html'), 'block': ('build_block.py', 'block.html'), 'spot': ('build_spot.py', 'spot.html'), 'tile': ('build_tile.py', 'tile.html'), 'sort': ('build_sort.py', 'sort.html'), 'day': ('build_day.py', 'day.html'), 'expedition': ('build_expedition.py', 'expedition.html')}
typ = 'debug'; sel = []
for a in sys.argv[1:]:
    (typ := a) if a in ('debug', 'release') else sel.append(a)
sel = sel or list(FL)
# 문의 이메일: 저장소 밖 ~/.gf/store.env 의 SUPPORT_EMAIL 을 APK 빌드 때만 HTML 에 주입(웹판·저장소에는 비움). 끝나면 깨끗한 HTML 로 다시 만든다.
_env = {}
try:
    for ln in (pathlib.Path.home() / '.gf' / 'store.env').read_text(encoding='utf-8').splitlines():
        if '=' in ln and not ln.lstrip().startswith('#'): k, v = ln.split('=', 1); _env[k.strip()] = v.strip().strip('"').strip("'")
except Exception: pass
_mail = _env.get('SUPPORT_EMAIL', '')
for f in sel:
    s, h = FL[f]; subprocess.run([sys.executable, str(G / 'tools' / s)], check=True, stdout=subprocess.DEVNULL, env=dict(os.environ, GF_SUPPORT_EMAIL=_mail) if _mail else None)
    d = A / 'app' / 'src' / f / 'assets'; d.mkdir(parents=True, exist_ok=True); shutil.copy2(G / 'app' / h, d / 'index.html'); print('html', f, round((d / 'index.html').stat().st_size / 1e6, 2), 'MB')
gr = glob.glob(os.path.expanduser('~/.gradle/wrapper/dists/gradle-8.14.3-all/*/gradle-8.14.3/bin/gradle.bat'))[0]
env = dict(os.environ, JAVA_HOME=os.environ.get('JAVA_HOME', 'C:/Program Files/Eclipse Adoptium/jdk-17.0.18.8-hotspot'))
extra = []
if typ == 'release' and os.environ.get('TESTKEY'):
    extra = ['-PGF_STORE_FILE=' + os.environ['TESTKEY'], '-PGF_STORE_PASSWORD=gftest1234', '-PGF_KEY_ALIAS=gftest', '-PGF_KEY_PASSWORD=gftest1234']
tasks = ['assemble' + f.capitalize() + typ.capitalize() for f in sel]
subprocess.run([gr, '--no-daemon', '-q'] + extra + tasks, cwd=A, env=env, check=True)
for f in sel:   # 웹판용 HTML 은 이메일 없이 다시 만든다(deploy_play.sh 가 games/app 을 그대로 복사)
    subprocess.run([sys.executable, str(G / 'tools' / FL[f][0])], check=True, stdout=subprocess.DEVNULL)
out = G / 'demo' / 'apk'; out.mkdir(parents=True, exist_ok=True)
for f in sel:
    for p in (A / 'app' / 'build' / 'outputs' / 'apk' / f / typ).glob('*.apk'):
        shutil.copy2(p, out / f'{f}-{typ}.apk'); print('apk', f, round(p.stat().st_size / 1e6, 1), 'MB')
