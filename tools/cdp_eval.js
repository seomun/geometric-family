// 에뮬레이터/기기의 앱 WebView 에 JS 를 던진다(디버그 APK 만): node tools/cdp_eval.js <패키지> "<식>"
const { execSync } = require('child_process'); const ADB = 'C:/Users/gurud/AppData/Local/Android/Sdk/platform-tools/adb.exe';
const [pkg, expr] = process.argv.slice(2); const sh = (c) => execSync('"' + ADB + '" ' + c, { encoding: 'utf-8' });
const pid = sh('shell pidof ' + pkg).trim().split(/\s+/)[0]; if (!pid) { console.log('NOPID'); process.exit(1); }
sh('forward tcp:9333 localabstract:webview_devtools_remote_' + pid);
(async () => {
  const list = await (await fetch('http://localhost:9333/json')).json(); const ws = new WebSocket(list[0].webSocketDebuggerUrl);
  ws.onopen = () => ws.send(JSON.stringify({ id: 1, method: 'Runtime.evaluate', params: { expression: expr, awaitPromise: true, returnByValue: true } }));
  ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id === 1) { console.log(JSON.stringify(d.result.result.value !== undefined ? d.result.result.value : d.result)); ws.close(); process.exit(0); } };
})();
