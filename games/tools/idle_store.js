// 방치형 스토어 스크린샷(폰 6장 원본) + 30초 영상: node games/tools/idle_store.js [shots|video]  (서버 python -m http.server 8765 @ repo root)
// → games/store/shots_idle/raw/phone_N_*.png  → IDLE=1 python games/tools/frame_shots.py 로 액자 · 영상은 games/media/idle_phone_30s.webm (소리 없음)
const { chromium } = require('playwright-core');
const path = require('path'), fs = require('fs');
const URL = process.env.URL || 'http://localhost:8765/games/idle/index.html';
const RAW = path.resolve(__dirname, '..', 'store', 'shots_idle', 'raw'), MEDIA = path.resolve(__dirname, '..', 'media');
fs.mkdirSync(RAW, { recursive: true }); fs.mkdirSync(MEDIA, { recursive: true });
const wait = (p, ms) => p.waitForTimeout(ms);
const mode = process.argv[2] || 'shots';
async function setup(p) {      // 중반 진행 상태
  await p.evaluate(() => {
    const D = IDLE.debug, S = D.S(); D.give(3e9);
    ['n_dad', 'n_mom', 'n_gma', 'n_k1', 'n_k2', 'n_k3', 'n_pot', 's_wife', 's_hus', 's_bag', 'd_dad', 'd_mom', 'd_son'].forEach((id) => { for (let i = 0; i < 6; i++) D.buy(id); });
    S.tl = { nemo: 5, semo: 4, dong: 4 }; S.chairs = 3; S.l = 4200; S.slider = 0.25;
    S.sd = { s01: { k: 'nemo' }, s02: { k: 'dong' }, s03: { k: 'semo' }, s04: { k: 'nemo' }, s05: { k: 'nemo' } }; S.tot = Math.max(S.tot, 2e14); D.checkProps();
    S.eq = { nemo: ['p_mix', 'p_remote', 'p_glass'], semo: ['p_tea', 'p_bagt', 'p_phone'], dong: ['p_book', 'p_env', 'p_vio'] }; S.pr.p_remote = S.pr.p_glass = S.pr.p_phone = S.pr.p_bagt = S.pr.p_env = S.pr.p_vio = 1;
    S.w = 4.2e8;
  });
}
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  if (mode === 'shots') {
    const p = await (await b.newContext({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 })).newPage();
    const shot = (n) => p.screenshot({ path: path.join(RAW, `phone_${n}.png`) });
    await p.goto(URL); await p.waitForSelector('.tcard'); await setup(p); await p.evaluate(() => GF.go('itable')); await wait(p, 900); await shot('1_home');
    await p.click('.screen.on .tcard[data-t=nemo]'); await wait(p, 800); await shot('2_nemo'); await p.click('.screen.on .back');
    await p.click('.screen.on .tcard[data-t=semo]'); await wait(p, 800); await shot('3_semo'); await p.click('.screen.on .back');
    await p.evaluate(() => GF.go('istory', { id: 's06' })); await wait(p, 500); await p.click('.screen.on .bigbtn:last-of-type'); await wait(p, 300); await p.click('.screen.on .bigbtn:last-of-type'); await wait(p, 900); await shot('4_story');
    await p.click('.screen.on .bigbtn:last-of-type'); await wait(p, 300); await p.click('.screen.on .bigbtn:last-of-type'); await wait(p, 300); await p.click('.screen.on .bigbtn:last-of-type'); await wait(p, 800); await shot('5_quest');
    await p.evaluate(() => { GF.stack = []; GF.go('itable'); GF.go('iprops'); }); await wait(p, 800); await shot('6_props');
    console.log('shots ok');
  } else {
    const ctx = await b.newContext({ viewport: { width: 540, height: 960 }, recordVideo: { dir: MEDIA, size: { width: 720, height: 1280 } } }), p = await ctx.newPage();
    await p.goto(URL); await p.waitForSelector('.tcard'); await setup(p); await p.evaluate(() => GF.go('itable')); await wait(p, 3200);   // 홈: 숫자가 올라간다
    await p.click('.screen.on .tcard[data-t=nemo]'); await wait(p, 1800);
    await p.click('.screen.on .grow .buy >> nth=2'); await wait(p, 1200); await p.click('.screen.on .grow .buy >> nth=3'); await wait(p, 1500); await p.click('.screen.on .back'); await wait(p, 900);
    await p.click('.screen.on .tcard[data-t=semo]'); await wait(p, 1500); await p.click('.screen.on .trip >> nth=1'); await wait(p, 2600); await p.click('.screen.on .back'); await wait(p, 900);
    await p.click('.screen.on .sbtn'); await wait(p, 1200);
    for (let i = 0; i < 4; i++) { await p.click('.screen.on .bigbtn:last-of-type'); await wait(p, 2200); }
    await p.click('.screen.on .bigbtn:last-of-type'); await wait(p, 1600); await p.click('.screen.on .opt >> nth=1'); await wait(p, 2600);
    await p.click('.screen.on .ovp button'); await wait(p, 1500);
    await p.evaluate(() => GF.go('iprops')); await wait(p, 2200);
    const v = p.video(); await ctx.close(); const f = await v.path(); fs.renameSync(f, path.join(MEDIA, 'idle_phone_30s.webm')); console.log('video ok');
  }
  await b.close();
})();
