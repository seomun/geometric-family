// 우리 집 「색 변형 코드」(B29) 시험: node tools/housing_variant.js
// 원정 stage-core walkCode 와 집 Room.variantDecode 가 모든 전리품×변형에서 같은 식 · 코드를 넣으면 그 가구의 그 색만 열림(없는 가구도) · 두 번째는 이미 열림 · 가구 코드와 겹치지 않음 · 틀린 코드 거부
const { chromium } = require('playwright-core'); const fs = require('fs'); const SC = require('../games/expedition/stage-core.js');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const D = JSON.parse(fs.readFileSync('data/expedition_slice.json', 'utf8')), codes = []; D.loot.forEach((l) => [1, 2, 3].forEach((v) => codes.push({ id: l.id, no: l.no, v, code: SC.walkCode(l.no, v) })));
  ok(codes.length === 84 * 3 && new Set(codes.map((c) => c.code)).size === codes.length, '전리품 84 × 변형 3 = 252개 코드, 모두 다름');
  ok(codes.every((c) => { const d = SC.walkDecode(c.code); return d && d.no === c.no && d.v === c.v; }), '원정 쪽에서 풀면 모두 원래 가구·변형');
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { window.__noResume = true; }); await p.goto('http://localhost:8765/games/merge/index.html'); await p.waitForTimeout(1600);
  const par = await p.evaluate((cs) => { Room.cfg.mode = 'adult'; const bad = cs.filter((c) => { const d = Room.variantDecode(c.code); return !d || d.no !== c.no || d.v !== c.v; }).length, clash = cs.filter((c) => Room.codeFor(c.id) === c.code).length; return { bad, clash }; }, codes);
  ok(par.bad === 0, '우리 집에서 풀어도 252개 모두 같은 가구·변형(식 일치)'); ok(par.clash === 0, '가구 코드와 겹치는 변형 코드 없음');
  const it = D.loot.find((l) => l.stage === 12), cd = (v) => codes.find((c) => c.id === it.id && c.v === v).code;
  const a = await p.evaluate(([id, c2]) => { Room.S.itemVar = {}; const x = Room.item(id), own0 = Room.has(id), r = Room.redeem(c2); return { own0, ok: r.ok, v: r.variant, isNew: r.isNew, item: r.item.id, mask: Room.variantMask(id), has: Room.has(id), open2: Room.variantOpen(2, x), open1: Room.variantOpen(1, x), open2other: Room.variantOpen(2, Room.item('b_sofa')) }; }, [it.id, cd(2)]);
  ok(a.ok && a.v === 2 && a.isNew && a.item === it.id && !a.has, '코드 입력: ' + it.id + ' 새 색 ②가 열림(가구가 없어도 코드는 받음)'); ok(a.mask === 4 && a.open2 && !a.open1 && !a.open2other, '그 가구의 ② 만 열림 · ①과 다른 가구는 그대로(모은 수 기준)');
  const b2 = await p.evaluate(([id, c2]) => { const r = Room.redeem(c2), r3 = Room.redeem(c2.slice(0, 5) + (c2[5] === 'A' ? 'B' : 'A')); return { again: r.ok && r.variant === 2 && r.isNew === false, bad: r3 }; }, [it.id, cd(2)]);
  ok(b2.again, '같은 코드를 또 넣으면 이미 열린 색(isNew=false)'); ok(b2.bad.ok === false, '한 글자 틀린 코드는 거부 · ' + b2.bad.why);
  const c = await p.evaluate(([id, c3]) => { Room.grant(id); const x = Room.item(id), p0 = { id, v: 0 }; Room.redeem(c3); const nx = Room.nextVariant(x, p0); return { owned: Room.has(id), nx, mask: Room.variantMask(id) }; }, [it.id, cd(3)]);
  ok(c.owned && c.mask === 12 && (c.nx === 2 || c.nx === 3), '가구를 얻은 뒤 색 바꾸기가 열린 색으로 넘어감(다음 색 ' + c.nx + ')');
  const d = await p.evaluate(() => { const code = Room.codeFor('b_sofa'); const r = Room.redeem(code); return { ok: r.ok, id: r.item.id, variant: r.variant || null }; }); ok(d.ok && d.id === 'b_sofa' && !d.variant, '보통 가구 코드는 예전처럼 가구를 줌');
  ok(await p.evaluate(() => { const s = JSON.stringify(Room.S.itemVar); Room.save(); return !!s && Room.variantMask('x_flag') >= 0; }), '열린 색은 집 저장에 함께 남음');
  ok(errs.length === 0, '오류 없음 ' + (errs[0] || '')); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
