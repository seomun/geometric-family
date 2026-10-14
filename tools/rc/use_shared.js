// C22: NODE_OPTIONS="--require tools/rc/use_shared.js" + GF_BROWSER_WS=<ws> 이면, 시험 스크립트의 chromium.launch(...) 가 공용 브라우저에 연결만 한다.
// browser.close() 는 연결만 끊고(연결이 만든 문맥·탭은 함께 닫힘) chrome 본체는 살아 있다. 옵션(executablePath 등)은 무시하고, 서버가 쓰는 옵션과 다른 args 가 필요한 시험은 GF_BROWSER_WS 없이 돌린다.
const ws = process.env.GF_BROWSER_WS;
if (ws) {
  try {
    const { chromium } = require(require.resolve('playwright-core', { paths: [process.cwd()] }));
    chromium.launch = (opts) => chromium.connect(ws, { timeout: 20000 });
  } catch (e) { /* playwright 가 없는 node(서버 등)는 그대로 */ }
}
