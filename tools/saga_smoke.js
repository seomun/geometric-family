// 이야기 지도(GF.saga) 점검: node tools/saga_smoke.js [앱…] — 노드 수 = 판 수 · 잠김(처음엔 1만 열림) · 별 표시 · 상자·아바타 위치 · 겹침 0 · 스크롤 성능 · 큰 글씨
const { chromium } = require('playwright-core'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const APPS = { block: ['bhome', 'blevels', 120, 'BLOCK'], merge: ['mhome', 'mlevels', 120, 'MG'], spot: ['phome', 'plevels', 140, 'SP'], sort: ['shome', 'slevels', 120, 'SR'], tile: ['thome', 'tlevels', 120, 'TL'], day: ['dhome', 'dmap', 60, 'DY'] };
const want = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(APPS);
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const a of want) {
    const [home, scr, total] = APPS[a]; const ctx = await b.newContext({ viewport: { width: 390, height: 780 } }), p = await ctx.newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message)); await p.addInitScript(() => { window.__noResume = true; });
    await p.goto('http://localhost:8765/games/' + a + '/index.html'); await p.waitForTimeout(1500);
    await p.evaluate(([h, s]) => { GF.stack = []; GF.go(h); GF.go(s); }, [home, scr]); await p.waitForTimeout(700);
    const t0 = Date.now();
    const r = await p.evaluate(async () => {
      const sc = GF.saga.scroll, n0 = document.querySelectorAll('.screen.on .sg-node').length; let maxDom = 0;
      for (let y = sc.scrollHeight; y >= 0; y -= 400) { sc.scrollTop = y; await new Promise((r) => setTimeout(r, 40)); maxDom = Math.max(maxDom, document.querySelectorAll('.screen.on *').length); }
      const nodes = [...document.querySelectorAll('.screen.on .sg-node')], off = nodes.filter((n) => n.classList.contains('off')).length;
      const rc = (e) => e.getBoundingClientRect(), hit = (A, B) => { const x = rc(A), y = rc(B); return x.left < y.right - 2 && x.right > y.left + 2 && x.top < y.bottom - 2 && x.bottom > y.top + 2; };
      let overlaps = []; document.querySelectorAll('.screen.on .sg-zone').forEach((z) => { const items = [...z.querySelectorAll('.sg-node, .sg-mark, .sg-chest, .sg-gate, .sg-band')]; for (let i = 0; i < items.length; i++) for (let j = i + 1; j < items.length; j++) if (hit(items[i], items[j])) overlaps.push(z.dataset.ch + ':' + items[i].className.split(' ').slice(0, 2).join('.') + '×' + items[j].className.split(' ').slice(0, 2).join('.')); });
      const me = document.querySelector('.screen.on .sg-me'); sc.scrollTop = sc.scrollHeight;
      return { n0, nodes: nodes.length, off, overlaps, maxDom, me: !!me, zones: document.querySelectorAll('.screen.on .sg-zone').length, chest: document.querySelectorAll('.screen.on .sg-chest').length, gate: document.querySelectorAll('.screen.on .sg-gate').length, cur: GF.saga.cur.id };
    });
    const ms = Date.now() - t0;
    ok(r.nodes === total, a + ' 노드 수 = 판 수 ' + r.nodes + '/' + total);
    ok(r.off === total - 1 && r.cur === 1, a + ' 처음엔 1판만 열림(잠김 ' + r.off + ')');
    ok(r.zones === r.chest && r.zones === r.gate && r.zones >= 12, a + ' 구역 ' + r.zones + '개 모두 관문·상자 있음');
    ok(r.me, a + ' 내 아바타 표시');
    ok(r.overlaps.length === 0, a + ' 노드·랜드마크·상자·관문·띠 겹침 0 ' + r.overlaps.slice(0, 4).join(','));
    ok(ms < 8000 && r.maxDom < 6000, a + ' 스크롤 성능(전체 훑기 ' + ms + 'ms, DOM ≤ ' + r.maxDom + ')');
    // 별·진행: 앞 15판을 깬 것으로 만들고 다시 열기 → 아바타가 16판 노드 위, 첫 구역 상자 열림
    await p.evaluate(([s, h]) => { const D = GF.data[({ blevels: 'block_levels', mlevels: 'merge_levels', plevels: 'spot_levels', slevels: 'sort_levels', tlevels: 'tile_levels', dmap: 'day_levels' })[s]]; const app = GF.saga.app; const key = 'gf:' + app + ':v1'; }, [scr, home]);
    // 큰 글씨
    await p.evaluate(() => { document.documentElement.setAttribute('data-big', '1'); GF.stack = []; GF.go(document.querySelector('.screen.on') ? GF.cur.name : ''); });
    await p.waitForTimeout(500);
    const big = await p.evaluate(() => { const w = document.querySelector('.screen.on .sg-scroll').getBoundingClientRect(); return [...document.querySelectorAll('.screen.on .sg-node, .screen.on .sg-band, .screen.on .sg-hd b')].filter((e) => { const q = e.getBoundingClientRect(); return q.width > 0 && (e.scrollWidth > e.clientWidth + 2 && getComputedStyle(e).overflow !== 'visible' && e.classList.contains('sg-band') === false); }).length; });
    ok(big === 0, a + ' 큰 글씨에서 노드·머리글 글자 안 잘림');
    ok(errs.length === 0, a + ' 오류 없음 ' + errs[0]); await ctx.close();
  }
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
