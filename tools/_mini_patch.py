"""튜토리얼 미니 판 등록 코드를 각 게임 js 에 심는다(멱등). 이야기 컷 안에 실제 판 조각 그림으로 작은 판을 그린다."""
import io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')


def put(path, anchor, code, tag):
    s = open(path, encoding='utf-8').read()
    if "mini.reg('%s'" % tag in s:
        print('skip', tag); return
    assert anchor in s, (path, anchor)
    s = s.replace(anchor, anchor + code, 1)
    open(path, 'w', encoding='utf-8').write(s); print('ok', tag)


MERGE = r'''
  /* 이야기 컷 안 미니 판(튜토리얼): 같은 조각 둘이 맞닿으면 한 단계 큰 조각 — 실제 판 조각 그림(pieceEl) 그대로 */
  GF.tale.mini.reg('merge', (host, s, still) => {
    const c = s.c || 0, t = s.t || 1, cell = (p) => { const d = el('div', 'mg-cell tm-cell', host); d.style.cssText = 'position:relative;width:84px;height:84px'; if (p) d.appendChild(p); return d; }; let a, b, o;
    const build = () => { host.innerHTML = ''; a = cell(pieceEl(c, t, 0)); el('b', 'tm-op', host, '＋'); b = cell(pieceEl(c, t, 0)); el('b', 'tm-op', host, '▶'); o = cell(null); o.style.opacity = '.4'; };
    GF.tale.mini.loop(host, build, [[900, () => { a.style.transform = 'translateX(20px)'; b.style.transform = 'translateX(-20px)'; }], [650, () => { a.innerHTML = b.innerHTML = ''; a.style.transform = b.style.transform = ''; const p = pieceEl(c, t + 1, 0); p.classList.add('pop'); o.style.opacity = 1; o.appendChild(p); }]], still);
  });
'''
put('games/merge/merge.js', "d.dataset.c = c; d.dataset.t = t; return d;\n  }\n", MERGE, 'merge')

BLOCK = r'''
  /* 이야기 컷 안 미니 판(튜토리얼): 빈칸에 조각을 놓아 한 줄이 차면 줄이 사라진다 — 실제 판 조각 그림(tile) 그대로 */
  GF.tale.mini.reg('block', (host, s, still) => {
    const Z = 40, W = 5, H = 3, col = s.c || 0, wrap = el('div', 'tm-grid', host); wrap.style.cssText = `position:relative;width:${W * Z}px;height:${H * Z + 56}px`;
    let pc, cells = [];
    const put = (r, c, f) => { const d = el('div', 'bk-cell full', wrap); d.style.cssText = `left:${c * Z}px;top:${56 + r * Z}px;width:${Z - 2}px;height:${Z - 2}px;transition:transform .45s,opacity .45s`; const i = el('img', '', d); i.src = tile(f, 0); return d; };
    const build = () => { wrap.innerHTML = ''; cells = []; for (let r = 0; r < H; r++) for (let c = 0; c < W; c++) { const d = el('div', 'bk-cell', wrap); d.style.cssText = `left:${c * Z}px;top:${56 + r * Z}px;width:${Z - 2}px;height:${Z - 2}px`; }
      const fl = [1, 0, 2, 1]; for (let c = 0; c < 4; c++) cells.push(put(H - 1, c, fl[c])); put(H - 2, 0, 2); put(H - 2, 1, 1); pc = put(-1, W - 1, col); pc.style.top = '4px'; pc.style.transition = 'top .6s'; };
    GF.tale.mini.loop(host, build, [[900, () => { pc.style.top = (56 + (H - 1) * Z) + 'px'; }], [800, () => { cells.push(pc); cells.forEach((d) => { d.style.transform = 'scale(1.18)'; d.style.outline = '3px solid #FFC933'; }); }], [450, () => { cells.forEach((d) => { d.style.opacity = 0; d.style.transform = 'scale(.3)'; }); }]], still);
  });
'''
put('games/block/block.js', "const tcache = {}; const tile = (f, s) => tcache[f + ':' + (s ? 1 : 0)] || (tcache[f + ':' + (s ? 1 : 0)] = tileSVG(f, s));\n", BLOCK, 'block')

SORT = r'''
  /* 이야기 컷 안 미니 판(튜토리얼): 맨 위 물건 하나를 다른 칸으로 옮겨 같은 것끼리 모은다 — 실제 칸·물건 그림(art) 그대로. spec = {pal:[그림 키…], tubes:[[…]…], move:[from,to]} */
  GF.tale.mini.reg('sort', (host, s, still) => {
    const pal = s.pal, T0 = s.tubes, mv = s.move, row = el('div', 'sr-row tm-row', host), isz = 38; let tubes = [], T1;
    const paint = () => { row.innerHTML = ''; tubes = T1.map((tb) => { const t = el('div', 'sr-tube', row); t.style.cssText = `width:54px;height:${3 * (isz + 3) + 14}px`; tb.forEach((k) => { const it = el('div', 'sr-it', t); art(pal[k], it, isz); }); return t; }); };
    const build = () => { T1 = T0.map((x) => x.slice()); paint(); };
    GF.tale.mini.loop(host, build, [[900, () => { const t = tubes[mv[0]], top = t.lastElementChild; if (top) { top.style.transform = 'translateY(-' + (isz + 20) + 'px)'; } t.classList.add('sel'); }], [700, () => { T1[mv[1]].push(T1[mv[0]].pop()); paint(); tubes[mv[1]].classList.add('done'); }]], still);
  });
'''
put('games/sort/sort.js', "    d.textContent = a; return d;\n  }\n", SORT, 'sort')

TILE = r'''
  /* 이야기 컷 안 미니 판(튜토리얼): 같은 그림 셋을 눌러 바구니에 담으면 사라진다 — 실제 타일 그림(art) 그대로. spec = {kinds:[…], pick:'k0', n:3} */
  GF.tale.mini.reg('tile', (host, s, still) => {
    const n = s.n || 3, kinds = s.kinds, pick = s.pick, col = el('div', 'tm-col', host), grid = el('div', 'tm-tiles', col), tray = el('div', 'tl-tray tm-tray', col); let tl = [], sl = [];
    const box = (p, cls) => { const d = el('div', cls, p); d.style.cssText = 'width:52px;height:52px;display:flex;align-items:center;justify-content:center'; return d; };
    const build = () => { grid.innerHTML = tray.innerHTML = ''; tl = []; sl = []; kinds.forEach((k) => { const d = box(grid, 'tl-slot on'); art(k, d); d.dataset.k = k; tl.push(d); }); for (let i = 0; i < n; i++) sl.push(box(tray, 'tl-slot')); };
    const steps = []; for (let i = 0; i < n; i++) steps.push([i ? 520 : 900, () => { const d = tl.filter((x) => x.dataset.k === pick && x.style.opacity !== '0')[0]; if (!d) return; d.style.opacity = 0; art(pick, sl[i]); sl[i].classList.add('on'); }]);
    steps.push([650, () => sl.forEach((d) => { d.style.transition = 'transform .4s,opacity .4s'; d.style.transform = 'scale(.2)'; d.style.opacity = 0; })]);
    GF.tale.mini.loop(host, build, steps, still);
  });
'''
put('games/tile/tile.js', "    const [em, fx] = df.e.split('@'); d.textContent = em; if (fx) d.style.cssText += ';' + EMO_FX[fx]; return d;\n  }\n", TILE, 'tile')

SPOT = r'''
  /* 이야기 컷 안 미니 판(튜토리얼): 두 그림을 나란히 놓고 다른 곳에 동그라미 — 실제 1번 판의 그림(sceneSVG) 그대로 */
  GF.tale.mini.reg('spot', (host, s, still) => {
    const L = D.levels.find((l) => l.id === (s.level || 1)) || D.levels[0], R = L.rounds[0], d0 = R.diffs[s.diff || 0], W = 172, Hh = Math.round(W * R.h / R.w); let ring;
    const build = () => { host.innerHTML = ''; host.style.gap = '8px'; [R.A, R.B].forEach((els, k) => { const w = el('div', 'sp-pic', host); w.style.cssText = `width:${W}px;height:${Hh}px;border-radius:12px;flex:none`; w.innerHTML = sceneSVG(R, els); const sv = w.querySelector('svg'); sv.style.width = '100%'; sv.style.height = '100%'; if (k) { w.insertAdjacentHTML('beforeend', `<svg viewBox="0 0 ${R.w} ${R.h}" class="sp-ov"><circle cx="${d0.x + d0.w / 2}" cy="${d0.y + d0.h / 2}" r="${Math.max(d0.w, d0.h) / 2 + 6}" fill="none" stroke="#FF4D6D" stroke-width="5" style="opacity:0"/></svg>`); ring = w.querySelector('circle'); } }); };
    GF.tale.mini.loop(host, build, [[1000, () => { ring.style.opacity = 1; ring.classList.add('sp-ring'); }]], still);
  });
'''
put('games/spot/spot.js', "  let D, X;\n", SPOT, 'spot')
