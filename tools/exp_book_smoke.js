// ⑪ 나라별 그림책 8컷(D10) 시험: node tools/exp_book_smoke.js (로컬 모드) — 15권 × 8컷 · 처음엔 모두 잠김 · 나라를 끝내면 그 권만 열림 · 눌러 보면 컷이 나오고 건너뛰기로 닫힘 · 본 권은 「다시 보기」 · 홈 📖 + 새 그림책 표시
const { chromium } = require('playwright-core'); const fs = require('fs'); let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const D = JSON.parse(fs.readFileSync('data/expedition_slice.json', 'utf8')), B = D.story.book, chars = JSON.parse(fs.readFileSync('data/chars.json', 'utf8'));
  ok(Object.keys(B).length === 18 && Object.values(B).every((b) => b.cuts.length === 8), '데이터: 18권 모두 8컷');
  ok(Object.values(B).every((b) => b.cuts.every((c) => c.text.length >= 12 && c.chars.every((id) => id in chars))), '모든 컷에 글이 있고 그림은 있는 캐릭터만');
  ok(Object.values(B).every((b) => new Set(b.cuts.map((c) => c.text)).size === 8), '권마다 컷 글이 서로 다름');
  const bad = /죽였|죽이|피를|피가|무서|잡아먹|괴롭|때리|울부짖|해치/; ok(!Object.values(B).some((b) => b.cuts.some((c) => bad.test(c.text))), '무서운 표현 없음(순한 판)');
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.goto('http://localhost:8765/games/expedition/index.html'); await p.waitForTimeout(1500);
  await p.evaluate(() => { const E = EXP.debug; E.reset(); E.S().flags.prologue = 1; E.save(); GF.tale.force = true; GF.stack = []; GF.go('xhome'); }); await p.waitForTimeout(800);
  ok(await p.evaluate(() => !!document.querySelector('[aria-label="storybook"]')), '홈 왼쪽 위에 📖 버튼'); ok(await p.evaluate(() => !document.querySelector('[aria-label="storybook"] .ex-bdg')), '아직 열린 책이 없으면 표시 없음');
  await p.evaluate(() => document.querySelector('[aria-label="storybook"]').click()); await p.waitForTimeout(700);
  let o = await p.evaluate(() => ({ n: document.querySelectorAll('.ex-bookcard').length, lock: document.querySelectorAll('.ex-bookcard.locked').length, txt: document.querySelector('.ex-books').innerText.replace(/\s+/g, ' ') }));
  ok(o.n === 18 && o.lock === 18, '그림책 서재: 18권 모두 잠김 · ' + o.txt.slice(0, 40)); await p.screenshot({ path: 'notes/snapshots/d10_books_locked.png' });
  await p.evaluate(() => { document.querySelector('.ex-bookcard').click(); }); await p.waitForTimeout(300); ok(await p.evaluate(() => !document.querySelector('.tale-ov')), '잠긴 책은 눌러도 열리지 않음(안내만)');
  await p.evaluate(() => { const E = EXP.debug, S = E.S(); S.cleared = 24; E.save(); GF.replace('xhome'); }); await p.waitForTimeout(800);
  ok(await p.evaluate(() => !!document.querySelector('[aria-label="storybook"] .ex-bdg')), '2나라를 끝내면 홈 📖 에 새 책 표시');
  await p.evaluate(() => document.querySelector('[aria-label="storybook"]').click()); await p.waitForTimeout(700);
  o = await p.evaluate(() => ({ open: document.querySelectorAll('.ex-bookcard:not(.locked)').length, first: document.querySelector('.ex-bookcard').innerText.replace(/\s+/g, ' ') })); ok(o.open === 2 && /아기돼지 삼형제/.test(o.first) && /새 그림책/.test(o.first), '열린 책 2권 · 첫 책 「아기돼지 삼형제」 새 그림책 · ' + o.first);
  await p.evaluate(() => document.querySelector('.ex-bookcard').click()); await p.waitForTimeout(900);
  ok(await p.evaluate(() => !!document.querySelector('.tale-ov')), '눌러 보면 그림책 컷이 나옴'); await p.screenshot({ path: 'notes/snapshots/d10_book_cut1.png' });
  await p.evaluate(() => document.querySelector('.tale-skip').click()); await p.waitForTimeout(600);
  ok(await p.evaluate(() => !document.querySelector('.tale-ov') && EXP.debug.S().flags.books['1'] === 1), '건너뛰기로 닫히고 본 책으로 기록');
  ok(await p.evaluate(() => /다시 보기/.test(document.querySelector('.ex-bookcard').innerText)), '본 책은 「다시 보기」'); await p.screenshot({ path: 'notes/snapshots/d10_books_open.png' });
  ok(errs.length === 0, '오류 없음 ' + (errs[0] || '')); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
