// C4 시험: 진동 패턴·소리 겹치기 — 연쇄가 높을수록 진동이 길어지고, 별 개수만큼 소리가 겹쳐 나온다. node tools/haptic_check.js
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { window.__noResume = true; window.__vib = []; navigator.vibrate = (x) => { window.__vib.push(x); return true; }; }); await p.goto('http://localhost:8765/games/merge/index.html'); await p.waitForTimeout(1700);
  const len = (x) => (Array.isArray(x) ? x.length : 1), tot = (x) => (Array.isArray(x) ? x.reduce((a, c) => a + c, 0) : x);
  const r = await p.evaluate(() => { const out = []; GF.state.settings.vib = true; [0, 2, 4, 7, 9, 12, 14, 16].forEach((st) => { window.__vib.length = 0; GF.sfx('ok', st ? { st } : undefined); out.push({ st, v: window.__vib.slice(-1)[0] }); }); window.__vib.length = 0; GF.sfx('drop'); const drop = window.__vib.slice(-1)[0]; return { out, drop, ready: !!(window.GF && GF.haptic && GF.sfxSeq) }; });
  const sizes = r.out.map((o) => tot(o.v)); ok(r.ready, '진동·소리 겹치기 API 있음'); ok(sizes.every((v, i) => i === 0 || v >= sizes[i - 1]), '연쇄가 높을수록 진동이 길어짐(비감소): ' + sizes.join(',')); ok(len(r.out[7].v) > len(r.out[0].v), '높은 연쇄는 박자가 늘어남 ' + JSON.stringify(r.out[0].v) + ' → ' + JSON.stringify(r.out[7].v));
  ok(r.drop === 10, '일반 소리의 진동은 그대로(짧게)');
  const seq = await p.evaluate(async () => { const calls = [], orig = GF.sfx; GF.sfx = (n, o) => { calls.push([n, o && o.st, Math.round(performance.now())]); }; UK.result({ title: '클리어!', stars: 3, parent: document.getElementById('safe') }); await new Promise((r) => setTimeout(r, 1400)); GF.sfx = orig; const t0 = calls[0] && calls[0][2]; return calls.map((c) => [c[0], c[1], c[2] - t0]); });
  ok(seq.filter((c) => c[0] === 'star').length === 3 && seq[seq.length - 1][0] === 'celebrate' && seq.filter((c) => c[0] === 'star').map((c) => c[1]).join() === '0,4,7', '별 3개: 별 소리 3번(0·4·7반음) → 팡파르 ' + JSON.stringify(seq));
  await p.evaluate(() => document.querySelectorAll('.uk-scrim').forEach((e) => e.remove())); ok(errs.length === 0, '오류 없음 ' + errs[0]); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
