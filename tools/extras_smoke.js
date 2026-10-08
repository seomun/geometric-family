// 공통 부가 UI 점검(10앱): node tools/extras_smoke.js  (서버 8765, tools/serve.py 권장)
// 성인: ⚙ 버튼 → 설정 시트·큰 글씨·통계·업적·출석 도장·도움말 다시 보기 / 유아: 제목 3초 길게(구구단 잠금) → 보호자 메뉴·쉬어요 알림 / 광고 브리지(테스트 모드·유아 차단·거절해도 불이익 없음)
const { chromium } = require('playwright-core'), path = require('path');
const B = 'http://localhost:8765/games/';
const APPS = [['① 놀이터', 'index.html', 'kid', '.uk-title,.logo,h1'], ['② 식탁', 'idle/index.html', 'adult'], ['③ 합치기', 'merge/index.html', 'adult'], ['④ 색칠북', 'color/index.html', 'kid', '.uk-title'], ['⑤ 어느 도형', 'quiz/index.html', 'adult'], ['⑥ 다른 그림', 'spot/index.html', 'adult'], ['⑦ 블록', 'block/index.html', 'adult'], ['⑧ 정리', 'sort/index.html', 'adult'], ['⑨ 짝 맞추기', 'tile/index.html', 'adult'], ['⑩ 막둥이의 하루', 'day/index.html', 'kid', '.uk-title']];
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
const ONLY = process.env.ONLY ? process.env.ONLY.split(',') : null;
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  for (const [name, url, kind, titleSel] of APPS) {
    if (ONLY && !ONLY.some((o) => name.includes(o))) continue;
    const ctx = await b.newContext({ viewport: { width: 390, height: 780 } }), p = await ctx.newPage(), errs = [];
    p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
    await p.goto(B + url); await p.waitForTimeout(2200);
    // 첫 인사 컷은 탭으로 건너뛴다
    await p.mouse.click(195, 400).catch(() => {}); await p.waitForTimeout(900);
    ok(await p.evaluate(() => !!(window.GF && GF.extras && GF.extras.ready)), name + ' extras 초기화');
    if (kind === 'adult') {
      ok(!!(await p.$('#b-set')), name + ' ⚙ 버튼');
      await p.evaluate(() => document.getElementById('b-set').click()); await p.waitForSelector('.xt-sheet', { timeout: 3000 }); await p.waitForTimeout(300);
      const rows = await p.$$eval('.xt-sheet .xt-row', (r) => r.map((x) => x.textContent.trim()));
      ok(rows.some((t) => t.startsWith('소리')) && rows.some((t) => t.startsWith('큰 글씨')) && rows.some((t) => t.startsWith('통계')), name + ' 설정 줄: ' + rows.map((t) => t.slice(0, 6)).join('|'));
      await p.screenshot({ path: path.join(__dirname, '..', 'notes', 'snapshots', '2026-10-08_extras_' + name.slice(0, 1) + '_set.png') });
      // 큰 글씨
      const swOf = async (label) => { const rows = await p.$$('.xt-sheet .xt-row'); for (const r of rows) { if ((await r.textContent()).trim().startsWith(label)) return r.$('.uk-switch'); } return null; };
      const big = await swOf('큰 글씨'); await big.click(); await p.waitForTimeout(150);
      ok(await p.evaluate(() => document.documentElement.dataset.big === '1'), name + ' 큰 글씨 켜짐'); await big.click(); await p.waitForTimeout(150); ok(await p.evaluate(() => document.documentElement.dataset.big === '0'), name + ' 큰 글씨 꺼짐');
      // 진동(성인 앱만, 설정에서 끌 수 있음)
      await p.evaluate(() => { window.__v = 0; navigator.vibrate = () => { window.__v++; return true; }; });
      await p.evaluate(() => GF.sfx('drop')); const v1 = await p.evaluate(() => window.__v); const vsw = await swOf('진동');
      if (vsw) { await vsw.click(); await p.waitForTimeout(150); await p.evaluate(() => { window.__v = 0; GF.sfx('drop'); }); const v2 = await p.evaluate(() => window.__v); ok(v1 >= 1 && v2 === 0, name + ' 진동: 켜면 울리고(' + v1 + ') 끄면 안 울림(' + v2 + ')'); await vsw.click(); await p.waitForTimeout(100); } else ok(false, name + ' 진동 토글 없음');
      // 통계
      const stBtn = (await p.$$('.xt-sheet .xt-row .xt-btn'))[0]; await stBtn.click(); await p.waitForTimeout(300);
      const stats = await p.$$eval('.xt-sheet .xt-row', (r) => r.length); ok(stats >= 2, name + ' 통계 줄 ' + stats);
      await p.click('.xt-sheet .acts .uk-btn'); await p.waitForTimeout(200);
      // 업적
      const hasB = await p.evaluate(() => !!(GF.extras.cfg.badges && GF.extras.cfg.badges.length));
      if (hasB) { await p.evaluate(() => GF.extras.openBadges()); await p.waitForSelector('.xt-badges'); const n = await p.$$eval('.xt-bd', (d) => d.length); ok(n >= 4, name + ' 업적 ' + n + '개'); await p.click('.xt-sheet .acts .uk-btn'); await p.waitForTimeout(200); }
      // 출석 도장
      await p.evaluate(() => GF.extras.openAttend()); await p.waitForSelector('.xt-cal'); ok((await p.$$eval('.xt-cal i.d.on', (d) => d.length)) >= 1, name + ' 오늘 출석 도장 찍힘');
      const claim = await p.$('.xt-claim'); ok(!!claim && (await claim.isDisabled()), name + ' 도장 1개일 땐 소품 못 받음(부담 없음)');
      await p.click('.xt-sheet .acts .uk-btn');
      // 광고 브리지
      const a = await p.evaluate(() => { const A = GF.ads; const r = { off: A.available('rewarded') }; A.config.enabled = true; A.config.test = true; r.on = A.available('rewarded'); r.inter = A.available('interstitial'); return r; });
      ok(a.off === false && a.on === true && a.inter === false, name + ' 광고: 기본 꺼짐·켜면 보상형만·전면 기본 꺼짐');
      let got = 0; await p.evaluate(() => { window.__r = 0; GF.ads.rewarded({ placement: 'undo', onReward: () => { window.__r++; }, onClose: (ok) => { window.__c = ok; } }); }); await p.waitForSelector('.uk-sheet'); await p.click('.uk-sheet .acts .uk-btn >> nth=1'); await p.waitForTimeout(200);
      ok(await p.evaluate(() => window.__r === 0 && window.__c === false), name + ' 광고 닫기 = 보상 없음·불이익 없음');
      await p.evaluate(() => { GF.ads.rewarded({ placement: 'undo', onReward: () => { window.__r++; }, onClose: (ok) => { window.__c = ok; } }); }); await p.waitForSelector('.uk-sheet'); await p.click('.uk-sheet .acts .uk-btn >> nth=0'); await p.waitForTimeout(200);
      ok(await p.evaluate(() => window.__r === 1 && window.__c === true), name + ' 광고 끝까지 = 보상 1회');
      ok(await p.evaluate(() => { GF.ads.config.adFree = true; let g = 0; GF.ads.reward('undo', () => { g++; }); return g === 1; }), name + ' 광고 제거 구매자는 광고 없이 바로 보상');
    } else {
      ok(!(await p.$('#b-set')), name + ' 유아 앱엔 ⚙ 없음');
      ok(await p.evaluate(() => { window.__v = 0; navigator.vibrate = () => { window.__v++; return true; }; GF.sfx('ok'); GF.sfx('drop'); return window.__v === 0; }), name + ' 유아 앱은 진동 없음(권한 0)');
      ok(await p.evaluate(() => { GF.ads.config.enabled = true; return !GF.ads.available('rewarded') && !GF.ads.available('interstitial'); }), name + ' 유아 앱은 광고 설정과 무관하게 항상 차단');
      // 보호자 메뉴: 제목 길게(① 은 로고, 그 외 .uk-title) → 구구단 잠금
      const opened = await p.evaluate(async () => { const t = document.querySelector('.uk-title, .hometitle'); if (!t) return 'notitle'; const r = t.getBoundingClientRect(); return JSON.stringify({ x: r.left + r.width / 2, y: r.top + r.height / 2 }); });
      if (opened === 'notitle') ok(false, name + ' 제목 요소 없음');
      else {
        const pt = JSON.parse(opened); await p.mouse.move(pt.x, pt.y); await p.mouse.down(); await p.waitForTimeout(3300); await p.mouse.up(); await p.waitForTimeout(500);
        const q = await p.evaluate(() => { const h = document.querySelector('#gate h3, .gate h3, #parent h3, .panel h3') || [...document.querySelectorAll('h3')].find((x) => /×/.test(x.textContent)); return h ? h.textContent : null; });
        ok(!!q && /×/.test(q), name + ' 길게 누르면 구구단 잠금: ' + q);
        if (q) {
          const m = q.match(/(\d+)\s*×\s*(\d+)/), ans = String(+m[1] * +m[2]); await p.evaluate((a) => { [...document.querySelectorAll('h3')].find((x) => /×/.test(x.textContent)).parentElement.querySelectorAll('.nums button').forEach((b) => { if (b.textContent === a) b.click(); }); }, ans); await p.waitForTimeout(500);
          const t = await p.$$eval('.xt-sheet .xt-row', (r) => r.map((x) => x.textContent.trim().slice(0, 8))); ok(t.some((x) => x.startsWith('쉬어요')) && t.some((x) => x.startsWith('소리')), name + ' 보호자 메뉴: ' + t.join('|'));
          await p.screenshot({ path: path.join(__dirname, '..', 'notes', 'snapshots', '2026-10-08_extras_' + name.slice(0, 1) + '_parent.png') });
          // 쉬어요 알림: 설정 1분 → 시간 경과 시뮬레이션 → 오버레이 → 잠금 뒤 닫힘
          await p.evaluate(() => { GF.state.settings.rest = 1; GF.extras.restReset(); }); await p.evaluate(() => { GF.extras._back(70000); GF.extras.tick(); }); await p.waitForTimeout(300);
          ok(await p.evaluate(() => !!document.getElementById('xt-rest')), name + ' 쉬어요 알림이 뜸(보호자가 정한 시간)');
        }
      }
    }
    ok(errs.length === 0, name + ' 콘솔 오류 없음 ' + errs.slice(0, 2).join('|'));
    await ctx.close();
  }
  await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})();
