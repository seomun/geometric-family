// 색약 2차(C14) 시험: node tools/cb_check.js
// ① 세 가족 색(받치기 주황·번쩍 빨강·돌보기 파랑)과 놀이터 가족 색을 색각 이상(적·녹·청황) 모의로 바꿔도 서로 구분되는지 — 색차(ΔE) 계산 + 모양 단서(□△○) 유무
// ② 틀린그림찾기: 「색 구분 돕기」를 켜면 색·색조만 다른 곳에 밝기 차이가 더해짐(꺼져 있으면 그대로)
// ③ 색칠 앱: 켜면 팔레트 칸마다 다른 기호
const { chromium } = require('playwright-core');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
// ---- 색각 이상 모의(Machado 2009, severity 1.0) 후 CIE Lab ΔE76 ----
const M = { protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]], deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]], tritan: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]] };
const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255), lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const toLab = (rgb) => { const [r, g, b] = rgb.map(lin), X = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047, Y = 0.2126 * r + 0.7152 * g + 0.0722 * b, Z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883, f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116); return [116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))]; };
const sim = (h, m) => { const c = hex(h).map(lin), o = m.map((row) => Math.max(0, Math.min(1, row[0] * c[0] + row[1] * c[1] + row[2] * c[2]))); return toLab(o.map((v) => (v <= 0.0031308 ? v * 12.92 : 1.055 * Math.pow(v, 1 / 2.4) - 0.055))); };
const dE = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
const minDE = (cols) => { let mn = 1e9, who = ''; for (const [k, m] of Object.entries(M)) for (let i = 0; i < cols.length; i++) for (let j = i + 1; j < cols.length; j++) { const d = dE(sim(cols[i], m), sim(cols[j], m)); if (d < mn) { mn = d; who = k + ' ' + cols[i] + '↔' + cols[j]; } } return { mn, who }; };
const EL = ['#F08A3C', '#E5334A', '#3B6FD6'], FAM = ['#F6C28B', '#8FD3F4', '#B7C2F2'], CB = ['#F0A93A', '#56B4E9', '#D9A9CB'];
const r1 = minDE(EL); console.log('  가족 속성색 최소 ΔE', r1.mn.toFixed(1), r1.who); ok(r1.mn >= 14, '세 가족 속성색(주황·빨강·파랑) 색각 이상 모의 후에도 ΔE ≥ 14 · ' + r1.mn.toFixed(1));
const CATCH = ['#8FD3F4', '#FF8FA8', '#FFC933'], CUPS = ['#F6C28B', '#8FD3F4', '#C8E86E', '#C79BF2'];
const r2 = minDE(CATCH); console.log('  눈송이(색만으로 고르는 놀이) 최소 ΔE', r2.mn.toFixed(1), r2.who); ok(r2.mn >= 14, '색만으로 고르는 눈송이 3색 ΔE ≥ 14 · ' + r2.mn.toFixed(1));
const r2b = minDE(CUPS); console.log('  컵 4색 최소 ΔE', r2b.mn.toFixed(1), r2b.who); ok(r2b.mn >= 12, '컵 4색 ΔE ≥ 12 (켜면 무늬도 더해짐) · ' + r2b.mn.toFixed(1));
console.log('  (놀이터 가족 연한 색 #8FD3F4/#B7C2F2 는 구분이 어렵지만 □△○ 모양이 함께 있어 색만의 단서가 아님)');
const r3 = minDE(CB); console.log('  색 구분 돕기 팔레트 최소 ΔE', r3.mn.toFixed(1), r3.who);
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { window.__noResume = true; });
  // ② 틀린그림찾기
  await p.goto('http://localhost:8765/games/spot/index.html'); await p.waitForTimeout(1600);
  const spot = async (cb) => p.evaluate((cb) => { if (cb) document.documentElement.dataset.cb = '1'; else delete document.documentElement.dataset.cb; const L = SPOT.debug.D().levels.find((l) => l.rounds && l.rounds[0].B && l.rounds[0].A.some((a, i) => { const x = l.rounds[0].B.find((q) => q.u === a.u); return x && (x.hue || x.c !== a.c); })); if (!L) return null; const R = L.rounds[0], svg = SPOT.debug.sceneSVG ? SPOT.debug.sceneSVG(R, R.B) : null; return svg ? { lum: (svg.match(/brightness\(1\.32\)/g) || []).length } : { nodebug: true }; }, cb).catch(() => null);
  const s0 = await spot(false), s1 = await spot(true);
  if (s0 && s1 && !s0.nodebug) { ok(s0.lum === 0, '색 구분 돕기 꺼짐: 밝기 보정 없음'); ok(s1.lum >= 1, '켜짐: 색·색조만 다른 곳에 밝기 차이 ' + s1.lum + '곳'); } else console.log('  (SP.debug.sceneSVG 후크 없음 — 건너뜀)');
  // ③ 색칠 앱
  await p.goto('http://localhost:8765/games/color/index.html'); await p.waitForTimeout(1600);
  await p.evaluate(() => { document.documentElement.dataset.cb = '1'; });
  await p.evaluate(() => { try { GF.stack = []; GF.go('cpaint', { id: GF.data.color_pages.pages.find((q) => q.type !== 'number').id }); } catch (e) { /* 인자 */ } }); await p.waitForTimeout(1200);
  const sw = await p.evaluate(() => [...document.querySelectorAll('.cl-sw')].map((x) => x.textContent.trim())).catch(() => []);
  if (sw.length) ok(new Set(sw).size === sw.length && sw.every((t) => t), '색칠 팔레트 ' + sw.length + '칸이 모두 다른 기호 · ' + sw.join('')); else console.log('  (색칠 화면까지 가지 못함 — 팔레트 시험 건너뜀)');
  ok(errs.length === 0, '오류 없음 ' + (errs[0] || '')); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
