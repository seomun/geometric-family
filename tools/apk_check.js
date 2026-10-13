// APK 내용 점검: node tools/apk_check.js — 11개 APK 안의 index.html 이 src 와 같고(해시), 원정대 APK 에는 B2~B7 기능·출시 플래그·서버 주소가 실제로 들어갔는지(해시 + file:// 열어 보기).
const { chromium } = require('playwright-core'); const { spawnSync } = require('child_process'); const fs = require('fs'); const path = require('path'); const os = require('os'); const crypto = require('crypto');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex').slice(0, 16), FL = ['toddler', 'color', 'tables', 'merge', 'quiz', 'block', 'spot', 'tile', 'sort', 'day', 'expedition'];
const extract = (apk, out) => { const py = "import zipfile,sys;open(sys.argv[2],'wb').write(zipfile.ZipFile(sys.argv[1]).read('assets/index.html'))"; const r = spawnSync('python', ['-c', py, apk, out]); return r.status === 0; };
(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'apkchk_')); const html = {};
  for (const f of FL) {
    const apk = path.join('games/demo/apk', f + '-release.apk'), src = path.join('games/android/app/src', f, 'assets/index.html'), out = path.join(tmp, f + '.html');
    if (!fs.existsSync(apk)) { ok(false, f + ': APK 없음'); continue; } ok(extract(apk, out), f + ': APK 에서 index.html 추출'); const a = fs.readFileSync(out), s = fs.readFileSync(src); html[f] = a.toString('utf8');
    ok(sha(a) === sha(s), `${f}: APK 안 HTML = src HTML (해시 ${sha(a)})`);
  }
  // 원정대: 기능 표식 + 실제로 열어 보기
  const E = html.expedition || '';
  ok(/window\.GF_RELEASE = true/.test(E), '원정대 APK: 출시 플래그(GF_RELEASE)'); ok(/window\.GF_API = /.test(E), '원정대 APK: 서버 주소 자리(GF_API)');
  const feats = { 요일던전: /GF\.screen\('xdun'/, 도감: /GF\.screen\('xdex'/, 전리품: /GF\.screen\('xloot'/, 육성: /function growSheet/, 상점: /GF\.screen\('xshop'/, 튜토리얼컷: /const tipOnce/, 전투연출: /const cutIn/, 정찰: /idleClaim/, 서버전투재현: /stageStartRemote/ };
  Object.entries(feats).forEach(([k, re]) => ok(re.test(E), '원정대 APK 기능 포함: ' + k));
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('file:///' + path.join(tmp, 'expedition.html').replace(/\\/g, '/')); await p.waitForTimeout(2200);
  const home = await p.evaluate(() => { const g = (s) => document.querySelector(s); return { text: document.body.innerText, age: !!g('.ex-age'), btns: g('.ex-btns') ? g('.ex-btns').textContent : '' }; });
  const entered = home.age || /요일 던전/.test(home.btns); ok(entered, '원정대 APK: file:// 로 열려 연령 화면 또는 홈이 나옴'); ok(!/슬라이스/.test(home.text), '원정대 APK 첫 화면에 개발 문구(슬라이스) 없음');
  if (!home.age) { ok(/요일 던전/.test(home.btns) && /동료 도감/.test(home.btns) && /정찰 보상/.test(home.btns), '홈에 요일 던전·동료 도감·정찰 보상 버튼'); }
  ok(errs.length === 0, '원정대 APK 열었을 때 오류 없음 ' + errs[0]); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
