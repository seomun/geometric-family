// 10앱 화면 비율·회전 점검(C13): node tools/viewport_check.js [--shots] — 폰 세로·작은 폰·폰 가로·태블릿 세로/가로·4:3 폴더블에서 홈이 가로로 넘치지 않고, 누를 것이 화면 안에 있으며, 버튼끼리 겹치지 않는지
const { chromium } = require('playwright-core'); const shots = process.argv.includes('--shots');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const VPS = [['폰 세로', 390, 780], ['작은 폰', 320, 568], ['폰 가로', 844, 390], ['태블릿 세로', 768, 1024], ['태블릿 가로', 1024, 768], ['4:3 폴더블', 884, 1104]];
const APPS = [['합치기', 'merge'], ['어느 도형', 'quiz'], ['블록', 'block'], ['틀린 그림', 'spot'], ['짝 맞추기', 'tile'], ['정리', 'sort'], ['막둥이의 하루', 'day'], ['색칠북', 'color'], ['세 가족 식탁', 'idle'], ['놀이터', '']];
const probe = () => {
  const W = innerWidth, H = innerHeight, out = { sx: document.documentElement.scrollWidth - W, off: [], ov: [], n: 0 };
  const els = [...document.querySelectorAll('button, .uk-btn, .tcard, .dy-card, .cl-card, .homeplay, .card')].filter((e) => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return e.offsetParent && r.width > 24 && r.height > 24 && cs.visibility !== 'hidden' && !e.closest('.uk-scrim') && !/^h2-(arrow)/.test(e.className.toString()); });
  els.forEach((e) => { const r = e.getBoundingClientRect(); out.n++; if (r.left < -2 || r.right > W + 2 || r.top < -2 || r.bottom > H + 2) out.off.push((e.className.toString().slice(0, 18) + ':' + (e.textContent || '').trim().slice(0, 6)) + ' ' + Math.round(r.left) + ',' + Math.round(r.top) + ',' + Math.round(r.right) + ',' + Math.round(r.bottom)); });
  for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) { if (els[i].contains(els[j]) || els[j].contains(els[i])) continue; const a = els[i].getBoundingClientRect(), b = els[j].getBoundingClientRect(), ix = Math.min(a.right, b.right) - Math.max(a.left, b.left), iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top); if (ix > 12 && iy > 12 && ix * iy > 0.2 * Math.min(a.width * a.height, b.width * b.height)) out.ov.push((els[i].textContent || els[i].className).toString().trim().slice(0, 8) + '×' + (els[j].textContent || els[j].className).toString().trim().slice(0, 8)); }
  return out;
};
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const [vn, w, h] of VPS) for (const [nm, a] of APPS) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } }), p = await ctx.newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.addInitScript(() => { window.__noResume = true; }); await p.goto('http://localhost:8765/games/' + (a ? a + '/' : '') + 'index.html'); await p.waitForTimeout(1800);
    const o = await p.evaluate(probe); if (shots) await p.screenshot({ path: `notes/snapshots/vp_${a || 'toddler'}_${w}x${h}.png` });
    ok(o.sx <= 1 && o.off.length === 0 && o.ov.length === 0 && errs.length === 0, `${vn} ${w}×${h} · ${nm}: 가로 넘침 ${o.sx > 1 ? o.sx : 0} · 화면 밖 ${o.off.length}${o.off.length ? ' [' + o.off.slice(0, 3).join(' | ') + ']' : ''} · 겹침 ${o.ov.length}${o.ov.length ? ' [' + o.ov.slice(0, 3).join(' | ') + ']' : ''}${errs.length ? ' · 오류 ' + errs[0] : ''}`);
    await ctx.close();
  }
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
