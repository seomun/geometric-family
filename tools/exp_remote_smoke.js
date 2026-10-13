// ⑪ S1 WP2~3 클라이언트↔서버 시험: node tools/exp_remote_smoke.js — 로컬 개발 서버(server/dev-local.js, D1 shim)를 띄워 연령 화면·계정·클라우드 저장·서버 뽑기·레벨업·편성을 확인
const { chromium } = require('playwright-core'); const { spawn } = require('child_process'); const fs = require('fs'); const os = require('os'); const path = require('path');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const dbf = path.join(os.tmpdir(), 'exp_remote_' + Date.now() + '.sqlite'), port = 8789, API = 'http://127.0.0.1:' + port;
  const srv = spawn(process.execPath, ['server/dev-local.js', String(port)], { env: Object.assign({}, process.env, { DB_FILE: dbf }), stdio: ['ignore', 'pipe', 'pipe'] });
  await new Promise((res, rej) => { srv.stdout.on('data', (d) => { if (/expedition-api/.test(String(d))) res(); }); srv.stderr.on('data', (d) => console.log('srv', String(d).slice(0, 200))); setTimeout(() => rej(new Error('서버 시작 시간 초과')), 8000); });
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 780 } }), p = await ctx.newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  const url = 'http://localhost:8765/games/expedition/index.html?api=' + encodeURIComponent(API);
  await p.goto(url); await p.waitForTimeout(1800);
  ok(await p.evaluate(() => GF.cur && GF.cur.name === 'xage'), '처음 열면 연령 화면'); await p.screenshot({ path: 'notes/snapshots/exp_r1_age.png' });
  // 만 12세 미만 차단
  await p.evaluate(() => { const y = document.querySelectorAll('.ex-sel')[0]; y.value = String(new Date().getFullYear() - 8); }); await p.click('.ex-age .uk-btn'); await p.waitForTimeout(800);
  ok(/12세 미만/.test(await p.textContent('.ex-agemsg')), '만 12세 미만은 가입 불가 안내');
  // 성인으로 가입
  await p.evaluate(() => { const y = document.querySelectorAll('.ex-sel')[0]; y.value = String(new Date().getFullYear() - 25); }); await p.click('.ex-age .uk-btn'); await p.waitForTimeout(1500);
  ok(await p.evaluate(() => GF.cur && GF.cur.name === 'xhome'), '가입 뒤 홈으로');
  const p1 = await p.evaluate(() => EXP.debug.http('GET', '/profile')); ok(p1.wallet.free_gems === 1500 && p1.age_band === '19p' && p1.cap_krw === 200000, '서버 프로필: 반짝석 1,500 · 19+ 상한 20만원');
  // 서버 뽑기 1회
  await p.evaluate(() => { GF.stack = []; GF.go('xgacha'); }); await p.waitForTimeout(600); await p.evaluate(() => { document.querySelectorAll('.ex-prow .uk-btn')[0].click(); }); await p.waitForTimeout(1200);
  const p2 = await p.evaluate(() => EXP.debug.http('GET', '/profile')); ok(p2.wallet.free_gems === 1350 && p2.pity.pulls === 1, '서버 뽑기 1회: 서버 재화 1,350 · 뽑기 기록 1'); ok(await p.evaluate(() => EXP.debug.S().gems === 1350), '화면 재화가 서버와 같음'); await p.screenshot({ path: 'notes/snapshots/exp_r2_pull.png' });
  // 클라우드 저장: 새로고침해도 이어짐
  await p.evaluate(() => document.querySelectorAll('.uk-scrim').forEach((e) => e.remove())); await p.reload(); await p.waitForTimeout(1800);
  ok(await p.evaluate(() => GF.cur && GF.cur.name === 'xhome' && EXP.debug.S().gems === 1350 && EXP.debug.S().pulls === 1), '새로고침 뒤에도 로그인 유지 · 서버 상태 복원');
  // 레벨업(서버 금화) — 개발 보상으로 금화를 준 뒤
  await p.evaluate(async () => { await EXP.debug.http('POST', '/dev/grant', { gold: 200, gems: 0 }); await EXP.debug.refresh(); }); await p.evaluate(() => { GF.stack = []; GF.go('xhome'); GF.go('xparty'); }); await p.waitForTimeout(700);
  await p.evaluate(() => { document.querySelectorAll('.ex-card')[0].click(); }); await p.waitForTimeout(300); await p.evaluate(() => { const b = [...document.querySelectorAll('.ex-info .uk-btn')].find((x) => /레벨업/.test(x.textContent)); b && b.click(); }); await p.waitForTimeout(800);
  const p3 = await p.evaluate(() => EXP.debug.http('GET', '/profile')); ok(p3.wallet.gold === 200 - 25 && Object.values(p3.units).some((u) => u.lv === 2), '서버 레벨업: 금화 175 · 레벨 2');
  // 편성 저장
  await p.evaluate(() => { document.querySelectorAll('.ex-card')[1].click(); }); await p.waitForTimeout(200); await p.evaluate(() => { document.querySelectorAll('.ex-slot')[0].click(); }); await p.waitForTimeout(800);
  const p4 = await p.evaluate(() => EXP.debug.http('GET', '/profile')); ok(JSON.stringify(p4.progress.party) !== JSON.stringify(p1.progress.party), '편성이 서버에 저장됨');
  // 전투: 서버가 시드·파티를 주고, 기록을 다시 돌려 판정(WP4)
  await p.evaluate(() => { GF.stack = []; EXP.debug.S().speed = 3; EXP.debug.S().autoSkill = true; GF.go('xhome'); GF.go('xbattle', { stage: 1 }); }); await p.waitForTimeout(1200);
  const before = await p.evaluate(() => EXP.debug.http('GET', '/profile')); let won = false; for (let i = 0; i < 90 && !won; i++) { await p.waitForTimeout(1000); won = await p.evaluate(() => /승리/.test((document.querySelector('.uk-sheet') || {}).textContent || '')); }
  ok(won, '서버 판정 승리 화면'); await p.screenshot({ path: 'notes/snapshots/exp_r4_win.png' });
  const p5 = await p.evaluate(() => EXP.debug.http('GET', '/profile')); ok(p5.progress.cleared === 1 && p5.wallet.gold === before.wallet.gold + 50 && p5.wallet.free_gems === before.wallet.free_gems + 150, '서버가 진행도·보상 반영: 1단계 클리어 · 금화 +50 · 반짝석 +150'); ok(await p.evaluate(() => EXP.debug.S().cleared === 1 && EXP.debug.S().gold === (JSON.parse(JSON.stringify(EXP.debug.S())).gold)), '화면이 서버 값으로 갱신');
  await p.evaluate(() => document.querySelectorAll('.uk-scrim').forEach((e) => e.remove())); await p.reload(); await p.waitForTimeout(1800); ok(await p.evaluate(() => EXP.debug.S().cleared === 1), '새로고침 뒤에도 진행도(서버) 유지');
  // 초보자 미션·출석(B11): 서버가 판정하고 지급(하루 한 번 · 한 번만)
  await p.evaluate(() => { document.querySelectorAll('.uk-scrim').forEach((e) => e.remove()); GF.stack = []; GF.go('xhome'); GF.go('xbegin'); }); await p.waitForTimeout(1500);
  const bg0 = await p.evaluate(() => EXP.debug.http('GET', '/profile')); ok(await p.evaluate(() => document.querySelectorAll('.ex-bg:not(.dq)').length === 30 && document.querySelectorAll('.ex-ad').length === 7 && document.querySelectorAll('.ex-bg.can:not(.dq)').length >= 1), '서버판 초보자 미션: 30개 · 출석 7칸 · 1단계를 깼으니 받을 미션 있음');
  await p.evaluate(() => [...document.querySelectorAll('.ex-beg .uk-btn')].find((x) => /오늘 출석 받기/.test(x.textContent)).click()); await p.waitForTimeout(1200);
  const bg1 = await p.evaluate(() => EXP.debug.http('GET', '/profile')); ok(bg1.wallet.gold === bg0.wallet.gold + 300 && bg1.progress.flags.att.n === 1, '서버 출석 1일째: 금화 +300 · 서버 기록 n=1');
  const dup = await p.evaluate(() => EXP.debug.http('POST', '/attend/claim', {})); ok(dup.already === true && (await p.evaluate(() => EXP.debug.http('GET', '/profile'))).wallet.gold === bg1.wallet.gold, '같은 날 다시 눌러도 지급 없음(멱등)');
  await p.evaluate(() => document.querySelector('.ex-bg.can:not(.dq) .uk-btn').click()); await p.waitForTimeout(1200);
  const bg2 = await p.evaluate(() => EXP.debug.http('GET', '/profile')); ok(bg2.wallet.free_gems === bg1.wallet.free_gems + 10 && bg2.progress.flags.beg.join() === 'b01', '서버 미션 b01: 반짝석 +10 · 서버 기록');
  const dup2 = await p.evaluate(() => EXP.debug.http('POST', '/beginner/claim', { id: 'b01' })); ok(dup2.replay === true && (await p.evaluate(() => EXP.debug.http('GET', '/profile'))).wallet.free_gems === bg2.wallet.free_gems, '같은 미션 다시 받기: 지급 없음(멱등)');
  const early = await p.evaluate(() => EXP.debug.http('POST', '/beginner/claim', { id: 'b30' }).catch((e) => ({ error: e.code }))); ok(early.error === 'not_yet', '못 채운 미션을 억지로 받으려 하면 서버가 거절');
  await p.screenshot({ path: 'notes/snapshots/exp_r_begin.png' });
  // 계절 이벤트(B14): 서버가 철·순서를 판정하고 전투를 다시 돌려 확인한 뒤 지급
  const evInfo = await p.evaluate(() => EXP.debug.http('GET', '/event')); ok(!!evInfo.event, '서버 이벤트: 이번 달 ' + evInfo.month + '월 → ' + (evInfo.event && evInfo.event.name));
  await p.evaluate((m) => { document.querySelectorAll('.uk-scrim').forEach((e) => e.remove()); EXP.debug.month = m; GF.stack = []; GF.go('xhome'); GF.go('xevent'); }, evInfo.month); await p.waitForTimeout(1200);
  ok(await p.evaluate(() => { const box = document.querySelector('.screen.on .ex-shop') || [...document.querySelectorAll('.ex-shop')].pop(); window.__evbox = box && box.querySelectorAll('.ex-bg:not(.dq)').length + '/' + box.querySelectorAll('.ex-bg.can:not(.dq)').length + ' ' + GF.cur.name; return box.querySelectorAll('.ex-bg:not(.dq)').length === 3 && box.querySelectorAll('.ex-bg.can:not(.dq)').length === 1; }), '출시판(서버) 이벤트 화면 '+ await p.evaluate(() => window.__evbox) + ' : 3칸 · 첫 칸만 열림');
  const e0 = await p.evaluate(() => EXP.debug.http('GET', '/profile')); await p.evaluate(() => { EXP.debug.S().speed = 3; EXP.debug.S().autoSkill = true; document.querySelector('.screen.on .ex-shop').querySelectorAll('.ex-bg:not(.dq) .uk-btn')[0].click(); }); await p.waitForTimeout(1500);
  let evWon = false; for (let i = 0; i < 90 && !evWon; i++) { await p.waitForTimeout(1000); evWon = await p.evaluate(() => /승리/.test((document.querySelector('.uk-sheet') || {}).textContent || '')); } ok(evWon, '서버 판정 이벤트 승리');
  const e1 = await p.evaluate(() => EXP.debug.http('GET', '/profile')); ok(e1.wallet.free_gems === e0.wallet.free_gems + 20 && e1.progress.flags.ev[evInfo.event.id].join() === '0', '서버가 이벤트 첫 클리어 반영: 반짝석 +20 · 기록 [0]');
  const evAgain = await p.evaluate(() => EXP.debug.http('POST', '/event/start', { ev: 'ev_nope', k: 0 }).catch((e) => ({ error: e.code }))); ok(evAgain.error === 'bad_event', '없는 이벤트는 서버가 거절');
  await p.evaluate(() => document.querySelectorAll('.uk-scrim').forEach((e) => e.remove()));
  // 상점: 결제 전 고지 · 모의 결제 · 월 한도 · 광고 보상
  await p.evaluate(() => { document.querySelectorAll('.uk-scrim').forEach((e) => e.remove()); GF.stack = []; GF.go('xhome'); GF.go('xshop'); }); await p.waitForTimeout(1500);
  const shopTxt = await p.textContent('.ex-shop'); ok(/7일 안에는 쓰지 않은 유료/.test(shopTxt) && /환불되지 않아요/.test(shopTxt) && /랜덤 아이템/.test(shopTxt), '상점: 결제 전 고지(청약철회·환불 불가·랜덤 아이템)'); ok(/한도 200,000원/.test(shopTxt), '상점: 월 한도 표시'); await p.screenshot({ path: 'notes/snapshots/exp_r5_shop.png' });
  await p.evaluate(() => { document.querySelectorAll('.ex-prod .uk-btn')[0].click(); }); await p.waitForTimeout(600); ok(/청약철회|7일 안에는/.test(await p.textContent('.uk-sheet')), '결제 확인창에 고지'); await p.screenshot({ path: 'notes/snapshots/exp_r6_buy.png' });
  await p.evaluate(() => { [...document.querySelectorAll('.uk-sheet .uk-btn')].find((b) => /결제하기/.test(b.textContent)).click(); }); await p.waitForTimeout(1500);
  const p6 = await p.evaluate(() => EXP.debug.http('GET', '/profile')); ok(p6.wallet.paid_gems === 220 && p6.has_paid === true, '모의 결제: 유료 반짝석 110 + 첫 구매 2배 = 220 · 결제 이력');
  await p.evaluate(() => { const s = document.querySelector('.ex-cap select'); s.value = '50000'; s.dispatchEvent(new Event('change')); }); await p.waitForTimeout(1200); ok((await p.evaluate(() => EXP.debug.http('POST', '/iap/precheck', { sku: 'gems_1100' }))).cap === 50000, '월 한도를 5만 원으로 낮춤(즉시)');
  await p.evaluate(() => { document.querySelectorAll('.ex-ads .uk-btn')[0].click(); }); await p.waitForTimeout(1500); const p7 = await p.evaluate(() => EXP.debug.http('GET', '/profile')); ok(p7.wallet.free_gems === p6.wallet.free_gems + 20, '보상형 광고: 반짝석 +20');
  // 12~13세: 결제 차단 안내
  const ctx2 = await b.newContext({ viewport: { width: 390, height: 780 } }), q = await ctx2.newPage(); await q.goto(url); await q.waitForTimeout(1500);
  await q.evaluate(() => { document.querySelectorAll('.ex-sel')[0].value = String(new Date().getFullYear() - 13); document.querySelectorAll('.ex-sel')[1].value = '1'; }); await q.click('.ex-age .uk-btn'); await q.waitForTimeout(1200);
  ok(/보호자 동의 전까지 결제/.test(await q.textContent('.uk-sheet')), '12~13세: 보호자 동의 전 결제 차단·광고 맞춤 없음 안내'); await q.screenshot({ path: 'notes/snapshots/exp_r3_minor.png' });
  await q.evaluate(() => { GF.stack = []; GF.go('xhome'); GF.go('xshop'); }); await q.waitForTimeout(1500); ok(/보호자 동의 전까지 결제할 수 없어요/.test(await q.textContent('.ex-shop')), '12~13세 상점: 결제 차단 안내');
  ok(errs.length === 0, '오류 없음 ' + errs[0]); await b.close(); srv.kill(); try { fs.unlinkSync(dbf); } catch (e) { /* 임시 파일 */ }
  console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
