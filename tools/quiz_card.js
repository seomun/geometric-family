// ⑤ 결과 공유 카드(D8) 시험: node tools/quiz_card.js — 도형별 카드(□△○ 배경 + 도장)가 PNG 로 만들어지고, 외부 링크·SDK 없이 기기 안에서만 저장되는지
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 }, acceptDownloads: true })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { window.__noResume = true; }); await p.goto('http://localhost:8765/games/quiz/index.html'); await p.waitForTimeout(1800);
  const t0 = await p.evaluate(() => { const D = QUIZ.debug.D ? QUIZ.debug.D() : null; return { has: !!D }; });
  for (const f of ['nemo', 'semo', 'dong']) {
    const info = await p.evaluate(async (f) => { const cnt = { nemo: 3, semo: 1, dong: 1 }; if (f !== 'nemo') { cnt[f] = 4; } const svg = QUIZ.debug.cardSVG ? QUIZ.debug.cardSVG({ f, s: 0, cnt }, '시험') : null; return { svg: svg && svg.length, hasStamp: svg ? /rotate\(-14\)/.test(svg) && /어느 도형/.test(svg) : false, shape: svg ? (f === 'semo' ? /<path d="M160 44L286 214H34z"/.test(svg) : f === 'dong' ? /<circle cx="160" cy="126" r="88"/.test(svg) : /<rect x="68" y="42" width="184"/.test(svg)) : false, ext: svg ? /https?:\/\//.test(svg.replace(/http:\/\/www\.w3\.org\/\d+\/(svg|xlink)/g, '')) : null }; }, f);
    ok(info.svg > 500 && info.hasStamp && info.shape, f + ': 카드에 도형 배경(' + (f === 'nemo' ? '□' : f === 'semo' ? '△' : '○') + ')과 「당신은 어느 도형인가요?」 도장'); ok(info.ext === false, f + ': 카드 안에 외부 주소 없음');
  }
  const dl = p.waitForEvent('download', { timeout: 8000 }).catch(() => null); const size = await p.evaluate(() => QUIZ.debug.savePNGOf({ f: 'semo', s: 0, cnt: { nemo: 1, semo: 4, dong: 1 } }, '시험')); const d = await dl; ok(size > 5000 && !!d, 'PNG 저장: ' + size + 'B · 내려받기 파일 ' + (d ? d.suggestedFilename() : '없음'));
  ok(errs.length === 0, '오류 없음 ' + (errs[0] || '')); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
