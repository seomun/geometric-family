// 우리 집 「가족 사진첩 영상」(A26) 시험: node tools/housing_film.js
// 계획(방 사진 있는 순간 2~6장·8~12초) · 앨범 시트 버튼(순간이 2개 미만이면 없음) · 실제로 영상(webm)이 만들어져 내려받기 · 이미지 저장만 되는 앱은 필름 PNG 로 대체 · 외부 링크 없음
const { chromium } = require('playwright-core');
let fails = 0; const ok = (c, m) => { console.log((c ? 'OK   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' }), p = await (await b.newContext({ viewport: { width: 390, height: 780 } })).newPage(), errs = []; p.on('pageerror', (e) => errs.push(e.message));
  await p.addInitScript(() => { window.__noResume = true; }); await p.goto('http://localhost:8765/games/merge/index.html'); await p.waitForTimeout(1700);
  const a0 = await p.evaluate(() => { Room.S.album = []; Room.albumAdd('t:1', 'day', '하루', '', 'nemo'); return { plan: Room.filmPlan(), btn: (Room.albumSheet(document.body), !!document.querySelector('[aria-label="album film"]')) }; });
  ok(a0.plan === null && !a0.btn, '순간이 1개뿐이면 계획도 버튼도 없음'); await p.evaluate(() => document.querySelectorAll('.uk-scrim').forEach((e) => e.remove()));
  const a1 = await p.evaluate(() => { const rooms = ['nemo', 'dong', 'yard', 'semo']; for (let i = 0; i < 9; i++) Room.albumAdd('t:' + (i + 2), i % 2 ? 'level' : 'room', '순간 ' + i, '아늑함 ' + i, rooms[i % 4]); const pl = Room.filmPlan(); return { n: pl.slides.length, secs: pl.total / 1000, order: pl.slides.every((s, i, a) => !i || a[i - 1].e.t <= s.e.t), rooms: pl.slides.every((s) => s.e.room) }; });
  ok(a1.n === 6 && a1.secs >= 8 && a1.secs <= 12 && a1.order && a1.rooms, '계획: 최대 6장 · ' + a1.secs + '초 · 오래된 순 · 모두 방 사진');
  await p.evaluate(() => { Room.albumSheet(document.body); }); ok(await p.evaluate(() => !!document.querySelector('[aria-label="album film"]')), '앨범 시트에 「사진첩 영상 만들기」 버튼'); await p.evaluate(() => document.querySelectorAll('.uk-scrim').forEach((e) => e.remove()));
  // 프레임 그리기: 제목·슬라이드·마무리가 모두 비어 있지 않게 그려짐
  const fr = await p.evaluate(async () => {
    const pl = Room.filmPlan(), imgs = {}; for (const s of pl.slides) if (!imgs[s.e.room]) imgs[s.e.room] = await Room.photoCanvas(s.e.room);
    const c = document.createElement('canvas'); c.width = 640; c.height = 360; const x = c.getContext('2d'), out = {}; const sum = () => { const d = x.getImageData(0, 0, 640, 360).data; let h = 0; for (let i = 0; i < d.length; i += 97) h = (h * 31 + d[i]) | 0; return h; };
    Room.filmFrame(x, pl, imgs, 600); out.title = sum(); Room.filmFrame(x, pl, imgs, pl.slides[0].t0 + 750); out.s0 = sum(); Room.filmFrame(x, pl, imgs, pl.slides[3].t0 + 750); out.s3 = sum(); Room.filmFrame(x, pl, imgs, pl.total - 600); out.end = sum(); return out;
  });
  ok(new Set(Object.values(fr)).size === 4, '프레임: 제목 · 슬라이드 둘 · 마무리가 서로 다른 그림');
  // 실제 영상: 내려받기를 가로채 크기 확인
  await p.evaluate(() => { window.__dl = null; const o = URL.createObjectURL; URL.createObjectURL = (bl) => { window.__dl = { size: bl.size, type: bl.type }; return o.call(URL, bl); }; });
  const r = await p.evaluate(() => Room.albumFilm(document.body)); ok(r.ok && r.kind === 'webm' && r.bytes > 20000, '영상 만들기: webm ' + (r.bytes || 0) + '바이트 · ' + r.secs + '초 · ' + r.n + '장');
  ok(await p.evaluate(() => !!window.__dl && window.__dl.size > 20000 && /webm/.test(window.__dl.type)), '내려받기로 기기에 저장(서버·링크 없음)');
  // 이미지 저장만 되는 앱(GFSave.image): 필름 PNG 로 대체
  const png = await p.evaluate(async () => { window.GFSave = { image: (d, n) => { window.__img = { head: d.slice(0, 22), n }; return true; } }; const q = await Room.albumFilm(document.body); delete window.GFSave; return { q, img: window.__img }; });
  ok(png.q.ok && png.q.kind === 'png' && /image\/png/.test(png.img.head) && /\.png$/.test(png.img.n), '이미지만 저장되는 앱: 필름 PNG 로 대체 · ' + png.img.n);
  ok(await p.evaluate(() => !/https?:\/\//.test(Room.albumFilm.toString() + Room.filmFrame.toString())), '외부 주소 없음');
  ok(errs.length === 0, '오류 없음 ' + (errs[0] || '')); await b.close(); console.log(fails ? 'FAILED ' + fails : 'ALL PASS'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
