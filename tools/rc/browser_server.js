// C22: RC 회귀용 공용 브라우저 서버 — chrome 1개를 띄워 두고 구간마다 연결만 한다(구간마다 chrome 을 새로 띄우던 메모리 압박 제거).
// 사용: node tools/rc/browser_server.js notes/rc5/ws.txt   (엔드포인트를 파일에 쓰고 종료 신호까지 산다). tools/rc/ 에 둔 이유: kill_leftovers 가 tools/*.js 시험 node 만 정리하므로 이 서버는 살려 둔다.
const { chromium } = require('playwright-core'); const fs = require('fs');
(async () => {
  const s = await chromium.launchServer({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true, args: ['--autoplay-policy=no-user-gesture-required'] });
  fs.writeFileSync(process.argv[2] || 'notes/rc5/ws.txt', s.wsEndpoint()); console.log('browser server', s.wsEndpoint());
  const bye = async () => { try { await s.close(); } catch (e) { /* 이미 닫힘 */ } process.exit(0); }; process.on('SIGTERM', bye); process.on('SIGINT', bye);
  setInterval(() => {}, 1 << 30);
})().catch((e) => { console.error(e); process.exit(1); });
