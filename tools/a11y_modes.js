// 접근성 2차(C6) 시험: node tools/a11y_modes.js — 설정의 「큰 버튼」·「색 구분 돕기」: 켜면 버튼이 커지고(터치 판정 ≥72) 팔레트가 바뀌며(글자 대비 유지) 새로 열어도 유지된다
const { chromium } = require('playwright-core');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const [nm, app] of [['합치기', 'merge'], ['어느 도형', 'quiz'], ['틀린 그림', 'spot']]) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 780 } }), p = await ctx.newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
    await p.addInitScript(() => { window.__noResume = true; }); await p.goto('http://localhost:8765/games/' + app + '/index.html'); await p.waitForTimeout(1800);
    const m0 = await p.evaluate(() => { const bt = document.querySelector('.uk-btn.block'), r = bt.getBoundingClientRect(), hit0 = parseFloat(getComputedStyle(bt, '::before').width) || 0, g = document.querySelector('.uk-btn.pink'), cs = getComputedStyle(g || bt); return { h: r.height, hit0, bg: (g ? cs.backgroundColor : getComputedStyle(bt).backgroundColor), rb: document.querySelector('.round-btn').getBoundingClientRect().width }; });
    await p.evaluate(() => GF.extras.open()); await p.waitForTimeout(600);
    const toggle = (label) => p.evaluate((l) => { const r = [...document.querySelectorAll('.uk-sheet .xt-row')].find((e) => (e.querySelector('span') || e).textContent.trim().startsWith(l)); r.querySelector('.uk-switch, [role=switch], input, button').click(); }, label);
    await toggle('큰 버튼'); await toggle('색 구분 돕기'); await p.waitForTimeout(500);
    ok(await p.evaluate(() => document.documentElement.dataset.bigbtn === '1' && document.documentElement.dataset.cb === '1'), nm + ': 두 옵션이 켜짐(문서 속성)');
    await p.evaluate(() => document.querySelectorAll('.uk-scrim').forEach((e) => e.remove())); await p.waitForTimeout(300);
    const m1 = await p.evaluate(() => { const bt = document.querySelector('.uk-btn.block'), r = bt.getBoundingClientRect(), bhit = Math.max(parseFloat(getComputedStyle(bt, '::before').width) || 0, r.width) && parseFloat(getComputedStyle(bt, '::before').height) || 0, g = document.querySelector('.uk-btn.pink'), cs = getComputedStyle(g || bt), pb = getComputedStyle(document.querySelector('.round-btn'), '::before'); return { h: r.height, bhit, bg: cs.backgroundColor, fg: cs.color, hit: parseFloat(pb.width), rb: document.querySelector('.round-btn').getBoundingClientRect().width }; });
    ok(m1.bhit >= 72 && m1.h >= m0.h, nm + ': 큰 버튼 → 버튼 터치 판정 높이 ' + Math.round(m1.bhit) + ' (보이는 높이 ' + Math.round(m1.h) + ')'); ok(m1.hit >= 72 && m1.rb > m0.rb, nm + ': 둥근 버튼 ' + Math.round(m0.rb) + '→' + Math.round(m1.rb) + ' · 터치 판정 ' + Math.round(m1.hit));
    ok(m1.bg !== m0.bg, nm + ': 색 구분 돕기 → 팔레트가 바뀜 ' + m0.bg + '→' + m1.bg);
    const rgb = (s) => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number), cr = (a, c) => { const x = lum(a), y = lum(c); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
    const worst = await p.evaluate(() => [...document.querySelectorAll('.uk-btn')].filter((e) => e.offsetParent && (e.textContent || '').trim()).map((e) => { const cs = getComputedStyle(e); return { nm: e.className.toString().slice(0, 20), bg: cs.backgroundColor, fg: cs.color }; }));
    const lows = worst.filter((x) => /^rgb\(/.test(x.bg) && cr(rgb(x.fg), rgb(x.bg)) < 4.5); ok(lows.length === 0, nm + ': 색 구분 돕기에서도 버튼 글자 대비 4.5:1 이상' + (lows.length ? ' · ' + lows.map((x) => x.nm + ' ' + x.bg + '/' + x.fg).join(' | ') : ''));
    if (app === 'merge') await p.screenshot({ path: 'notes/snapshots/c6_merge_modes.png' });
    // 다시 열어도 유지
    await p.reload(); await p.waitForTimeout(1800); ok(await p.evaluate(() => document.documentElement.dataset.bigbtn === '1' && document.documentElement.dataset.cb === '1'), nm + ': 앱을 다시 열어도 유지');
    ok(errs.length === 0, nm + ': 오류 없음 ' + (errs[0] || '')); await ctx.close();
  }
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
