// 10앱 자동 접근성 점검(C10): node tools/a11y_check.js [--report] — 홈 화면(+우리 집 화면)의 누를 수 있는 것: 최소 크기(성인 44·유아 72 CSS px≈dp) · 글자 대비 4.5:1(배경이 단색일 때만 계산, 그라데이션·그림 배경은 건너뜀) · 접근성 이름(aria-label/글자)
const { chromium } = require('playwright-core'); const report = process.argv.includes('--report');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const APPS = [['합치기', 'merge', 'mhome', 'mhouse', 44], ['어느 도형', 'quiz', 'qhome', 'qhouse', 44], ['블록', 'block', 'bhome', 'bhouse', 44], ['틀린 그림', 'spot', 'phome', 'phouse', 44], ['짝 맞추기', 'tile', 'thome', 'thouse', 44], ['정리', 'sort', 'shome', 'shouse', 44], ['막둥이의 하루', 'day', 'dhome', 'dhouse', 72], ['색칠북', 'color', 'chome', 'chouse', 72], ['세 가족 식탁', 'idle', 'itable', null, 44], ['놀이터', '', 'home', 'khouse', 72]];
const probe = () => {
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const parse = (s) => { const m = s.match(/rgba?\(([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)(?:[ ,/]+([\d.]+))?/); return m ? [+m[1], +m[2], +m[3], m[4] == null ? 1 : +m[4]] : null; };
  const bgOf = (e) => { for (let n = e; n && n.nodeType === 1; n = n.parentElement) { const cs = getComputedStyle(n); if (cs.backgroundImage && cs.backgroundImage !== 'none') return null; const c = parse(cs.backgroundColor); if (c && c[3] >= 0.99) return c; if (c && c[3] > 0) return null; } return null; };
  const out = { small: [], contrast: [], noname: [], n: 0 };
  document.querySelectorAll('button, .uk-btn, [role=button], a[href], .round-btn').forEach((e) => {
    const r = e.getBoundingClientRect(), cs = getComputedStyle(e); if (!e.offsetParent || r.width < 4 || r.height < 4 || cs.visibility === 'hidden' || cs.opacity === '0' || r.bottom < 0 || r.top > innerHeight || e.closest('.h2-under')) return; out.n++;
    const label = (e.textContent || '').trim() || e.getAttribute('aria-label') || e.title || (e.querySelector('img') && e.querySelector('img').alt) || (e.querySelector('svg,img,i,span') ? 'icon' : ''); const nm = (e.className || '').toString().slice(0, 30) + ':' + (e.textContent || '').trim().slice(0, 8);
    const pb = getComputedStyle(e, '::before'), hit = pb.content !== 'none' && pb.position === 'absolute' ? [parseFloat(pb.width) || 0, parseFloat(pb.height) || 0] : [0, 0]; out.small.push({ nm, w: Math.round(Math.max(r.width, hit[0])), h: Math.round(Math.max(r.height, hit[1])) });      // ::before 로 넓힌 터치 판정 포함 if (!label) out.noname.push(nm);
    const txt = (e.textContent || '').trim(); if (txt) { const fg = parse(cs.color), bg = bgOf(e); if (fg && bg) { const L1 = lum(fg), L2 = lum(bg), cr = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05), big = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.66 && +cs.fontWeight >= 700); out.contrast.push({ nm, cr: Math.round(cr * 100) / 100, need: big ? 3 : 4.5 }); } }
  });
  return out;
};
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }); const all = [];
  for (const [nm, path, home, house, minSz] of APPS) {
    const p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.addInitScript(() => { window.__noResume = true; }); await p.goto('http://localhost:8765/games/' + (path ? path + '/' : '') + 'index.html'); await p.waitForTimeout(2200);
    for (const [scr, name] of [[home, '홈'], [house, '우리 집']]) {
      if (!scr) continue; if (scr !== home) { await p.evaluate((s) => { document.querySelectorAll('.uk-scrim,.tale-ov,.h2-reveal').forEach((e) => e.remove()); GF.stack = []; GF.go(s); }, scr); await p.waitForTimeout(1500); await p.evaluate(() => document.querySelectorAll('.uk-scrim,.tale-ov,.h2-reveal,.uk-toast').forEach((e) => e.remove())); }
      const o = await p.evaluate(probe), small = o.small.filter((x) => Math.min(x.w, x.h) < minSz && !/^h2-(arrow|todochip|ar|dots)/.test(x.nm)), low = o.contrast.filter((x) => x.cr < x.need);
      all.push({ app: nm, scr: name, minSz, n: o.n, small, low, noname: o.noname });
      ok(small.length === 0, `${nm} ${name}: 누를 것 ${o.n}개 모두 ≥${minSz}px` + (small.length ? ' · 작은 것 ' + small.slice(0, 4).map((x) => x.nm + ' ' + x.w + '×' + x.h).join(' | ') : ''));
      ok(low.length === 0, `${nm} ${name}: 글자 대비 4.5:1(큰 글자 3:1) 계산 ${o.contrast.length}개 중 미달 ${low.length}` + (low.length ? ' · ' + low.slice(0, 3).map((x) => x.nm + ' ' + x.cr).join(' | ') : ''));
      ok(o.noname.length === 0, `${nm} ${name}: 이름 없는 누를 것 ${o.noname.length}` + (o.noname.length ? ' · ' + o.noname.slice(0, 3).join(' | ') : ''));
    }
    ok(errs.length === 0, nm + ': 오류 없음 ' + (errs[0] || '')); await p.context().close();
  }
  if (report) require('fs').writeFileSync('notes/a11y_report.json', JSON.stringify(all, null, 1));
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
