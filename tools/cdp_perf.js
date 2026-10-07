// 저사양 점검: 에뮬레이터(2GB·480×854·213dpi)에서 앱 5종의 프레임(rAF 간격)과 메모리. 디버그 APK 필요. node tools/cdp_perf.js
const { execSync } = require('child_process'); const ADB = 'C:/Users/gurud/AppData/Local/Android/Sdk/platform-tools/adb.exe';
const sh = (c) => execSync('"' + ADB + '" ' + c, { encoding: 'utf-8', env: Object.assign({}, process.env, { MSYS_NO_PATHCONV: '1' }) });
const SAMPLE = `(async (act) => { const dts = []; let last = performance.now(), stop = false; const f = (t) => { dts.push(t - last); last = t; if (!stop) requestAnimationFrame(f); }; requestAnimationFrame(f); await act(); await new Promise(r => setTimeout(r, 1500)); stop = true; await new Promise(r => setTimeout(r, 50)); dts.shift(); dts.sort((a, b) => a - b); const n = dts.length, sum = dts.reduce((a, b) => a + b, 0); return { frames: n, fps: +(n / (sum / 1000)).toFixed(1), p50: +dts[n >> 1].toFixed(1), p95: +dts[Math.floor(n * 0.95)].toFixed(1), max: +dts[n - 1].toFixed(0), jank: +(dts.filter(d => d > 50).length / n * 100).toFixed(1), heapMB: performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null }; })`;
const APPS = [
  ['com.geometricfamily.play', '① 놀이터 프롤로그→첫 판', `async () => { const b = document.querySelector('.homeplay'); b && b.click(); await new Promise(r => setTimeout(r, 4000)); document.querySelector('.screen.on') && document.querySelector('.screen.on').dispatchEvent(new PointerEvent('pointerup', { bubbles: true })); await new Promise(r => setTimeout(r, 3000)); }`],
  ['com.geometricfamily.color', '④ 색칠 번짐', `async () => { GF.go('cpaint', { id: 'f_sofa', skipStory: true }); await new Promise(r => setTimeout(r, 1200)); const rs = [...document.querySelectorAll('.screen.on [data-r]')]; for (let i = 0; i < 12; i++) { const r = rs[i % rs.length].getBoundingClientRect(); rs[i % rs.length].dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, clientX: r.x + r.width / 2, clientY: r.y + r.height / 2 })); await new Promise(r => setTimeout(r, 180)); } }`],
  ['com.geometricfamily.tables', '② 식탁 홈·상세', `async () => { GF.go('itable'); await new Promise(r => setTimeout(r, 1500)); GF.go('idetail', { t: 'nemo' }); await new Promise(r => setTimeout(r, 2500)); }`],
  ['com.geometricfamily.merge', '③ 합치기 연쇄', `async () => { MERGE.unlockAll = true; GF.stack = []; GF.go('mhome'); GF.go('mplay', { n: 25 }); await new Promise(r => setTimeout(r, 800)); const L = MERGE.debug.level(); for (const i of L.solution.slice(0, 8)) { MERGE.debug.place(i); await new Promise(r => setTimeout(r, 650)); } }`],
  ['com.geometricfamily.quiz', '⑤ 테스트 문항', `async () => { GF.stack = []; GF.go('qhome'); GF.go('qplay', { id: 'q1' }); await new Promise(r => setTimeout(r, 800)); for (let q = 0; q < 4; q++) { const o = document.querySelectorAll('.screen.on .qz-opt'); o[q % o.length] && o[q % o.length].click(); await new Promise(r => setTimeout(r, 500)); } }`],
];
(async () => {
  for (const [pkg, name, act] of APPS) {
    sh('shell am force-stop ' + pkg); sh('shell monkey -p ' + pkg + ' -c android.intent.category.LAUNCHER 1'); await new Promise((r) => setTimeout(r, 6000));
    const pid = sh('shell pidof ' + pkg).trim().split(/\s+/)[0]; sh('forward tcp:9333 localabstract:webview_devtools_remote_' + pid);
    const list = await (await fetch('http://localhost:9333/json')).json(); const ws = new WebSocket(list[0].webSocketDebuggerUrl);
    const r = await new Promise((res) => { ws.onopen = () => ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: SAMPLE + '(' + act + ')', awaitPromise: true, returnByValue: true } })); ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id === 1) { ws.close(); res(d.result.result.value || d.result); } }; });
    const mem = sh('shell dumpsys meminfo ' + pkg); const pss = (/TOTAL PSS:\s+(\d+)/.exec(mem) || /TOTAL\s+(\d+)/.exec(mem) || [])[1];
    console.log(name.padEnd(22), JSON.stringify(r), 'PSS', pss ? Math.round(pss / 1024) + 'MB' : '?');
  }
})();
