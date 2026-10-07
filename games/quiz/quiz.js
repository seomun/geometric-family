/* 당신은 어느 도형? — 성격 테스트 12종(시즌 2) + 미니게임 5종. 결과 = 세 가족 + 세부 타입(9), 내 도형 카드가 집의 문패·배지가 된다.
   성인 그룹(만 13세↑ 일반, 구현은 Families 수준: 서버·SDK·외부 링크 0). 결과는 기기 안에만 — 집계·공유 서버 없음, 이미지 저장만. 키트·공유 룸·엔진 상단 바·공용 소리 id 사용. */
(function () {
  'use strict';
  const el = UK.el, QZ = (window.QUIZ = { debug: {} }), KEY = 'gf:quiz:v1', FAMS = ['nemo', 'semo', 'dong'];
  let D, SV, roomOK = false;
  const blank = () => ({ v: 1, res: {}, game: {}, last: null });
  SV = (() => { try { const x = JSON.parse(localStorage.getItem(KEY)); if (x && x.v === 1) return Object.assign(blank(), x); } catch (e) {} return blank(); })();
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(SV)); } catch (e) {} };
  const uri = (svg) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  const doneN = () => Object.keys(SV.res).length;
  GF.pill = () => UK.icon('star') + '<span>' + doneN() + '</span>';
  GF.home = () => { GF.stack = []; GF.go('qhome'); }; GF.home2 = GF.home;
  const tsub = (f, s) => D.types[f].sub[s];
  /** 내 도형 = 지금까지 낸 결과 중 가장 많은 가족(+그 가족의 가장 많은 세부 타입) */
  function me() {
    const rs = Object.values(SV.res); if (!rs.length) return null; const c = { nemo: 0, semo: 0, dong: 0 }; rs.forEach((r) => c[r.f]++);
    const f = FAMS.slice().sort((a, b) => c[b] - c[a])[0], sc = [0, 0, 0]; rs.filter((r) => r.f === f).forEach((r) => sc[r.s]++); return { f, s: sc.indexOf(Math.max(...sc)) };
  }

  /* ---------------- 결과 카드: SVG 한 장(화면에 보이고, 이미지로 저장도 같은 그림) ---------------- */
  function cardSVG(res, title) {
    const T = D.types[res.f], S = T.sub[res.s], tot = res.cnt.nemo + res.cnt.semo + res.cnt.dong || 1, W = 320, H = 440;
    const wrap = (t, n) => { const o = []; let cur = ''; for (const ch of t) { cur += ch; if (cur.length >= n) { o.push(cur); cur = ''; } } if (cur) o.push(cur); return o; };
    const mx = Math.max(res.cnt.nemo, res.cnt.semo, res.cnt.dong, 1), bars = FAMS.map((f, i) => { const p = res.cnt[f] / mx, y = 330 + i * 22; return `<text x="24" y="${y + 12}" font-size="13" font-weight="700" fill="#3A2E39">${D.types[f].name}</text><rect x="92" y="${y}" width="180" height="14" rx="7" fill="#fff" opacity=".7"/><rect x="92" y="${y}" width="${Math.max(6, 180 * p).toFixed(0)}" height="14" rx="7" fill="${D.types[f].color}"/><text x="296" y="${y + 12}" font-size="13" font-weight="800" text-anchor="end" fill="#3A2E39">${res.cnt[f]}</text>`; }).join('');   // 막대 길이 = 고른 개수(가장 많은 쪽이 가득)
    const lines = wrap(S.line, 17).map((l, i) => `<text x="160" y="${252 + i * 20}" font-size="15" font-weight="700" text-anchor="middle" fill="#3A2E39">${l}</text>`).join('');
    return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" rx="26" fill="${T.bg}"/><rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="20" fill="none" stroke="${T.color}" stroke-width="3" stroke-dasharray="2 8" stroke-linecap="round"/>`
      + `<text x="160" y="34" font-size="14" font-weight="800" text-anchor="middle" fill="${T.color}">당신은 어느 도형인가요?</text><image href="${GF.src(T.char)}" x="95" y="46" width="130" height="150" preserveAspectRatio="xMidYMid meet"/>`
      + `<text x="160" y="226" font-size="26" font-weight="900" text-anchor="middle" fill="${T.color}">${S.n}</text>${lines}${bars}<text x="160" y="426" font-size="11" font-weight="700" text-anchor="middle" fill="#7a6f84">기하학 가족 · ${title}</text></svg>`;
  }
  async function savePNG(res, title) {   // 결과 이미지 저장: 기기 안에서 PNG 로 만들어 내려받기(서버·SNS SDK 없음)
    const svg = cardSVG(res, title), img = new Image(); img.src = uri(svg); await img.decode(); const c = document.createElement('canvas'); c.width = 640; c.height = 880; c.getContext('2d').drawImage(img, 0, 0, 640, 880);
    if (window.GFSave && GFSave.image) { const nm = 'my-shape-' + res.f + res.s + '.png'; if (!GFSave.image(c.toDataURL('image/png'), nm)) throw new Error('save'); return 1; }   // APK: 권한 없는 MediaStore 저장(Pictures/기하학 가족)
    const blob = await new Promise((r) => c.toBlob(r, 'image/png')); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'my-shape-' + res.f + res.s + '.png'; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); return blob.size;
  }
  QZ.debug.savePNG = async () => { const r = Object.values(SV.res)[0]; return savePNG({ f: r.f, s: r.s, cnt: r.cnt }, 'test'); };

  /* ---------------- 홈 ---------------- */
  GF.screen('qhome', {
    bare: false,
    enter(r) {
      r.classList.add('uk', 'qz'); GF.bg('indoor2', r);
      el('div', 'qz-ttl', r, '<div class="uk-title" style="font-size:32px">당신은 어느 도형?</div><div class="qz-sub">웹툰 속 하루로 알아보는 나</div>');
      const m = me(), fam = el('div', 'qz-fam', r);
      if (m) { const T = D.types[m.f], card = el('button', 'qz-mine', fam, `<img src="${GF.src(T.char)}"><div><small>내 도형</small><b>${tsub(m.f, m.s).n}</b></div>`); card.style.background = T.bg; card.onclick = () => GF.go('qcard'); }
      else ['nemo_dad.joy', 'wife.joy', 'dong_dad.joy'].forEach((id) => fam.appendChild(GF.img(id)));
      const g = el('div', 'qz-grid', r), b = (t, icon, cls, fn) => UK.btn({ text: t, icon, cls, onclick: fn }, g);
      b('테스트 ' + doneN() + '/' + D.tests.length, 'star', 'gold', () => GF.go('qtests')); b('미니게임', 'play', 'sky', () => GF.go('qgames'));
      b('내 도형 카드', 'heart', 'pink', () => { if (m) GF.go('qcard'); else { GF.sfx('hmm'); UK.toast('테스트를 하나 끝내면 카드가 생겨요', r); } }); b('우리 집', 'home', 'dong', () => GF.go('qhouse'));
      el('div', 'qz-foot', r, '결과는 이 기기에만 저장돼요');
    },
  });

  /* ---------------- 테스트 목록 ---------------- */
  GF.screen('qtests', {
    bare: false,
    enter(r) {
      r.classList.add('uk', 'qz'); GF.bg('indoor2', r);
      const sc = el('div', 'qz-scroll', r);
      D.tests.forEach((t) => { const res = SV.res[t.id], b = el('button', 'qz-test', sc); const th = el('div', 'th', b); t.chars.slice(0, 2).forEach((id) => th.appendChild(GF.img(id))); el('div', 'tx', b, `<b>${t.title}${t.season ? ' · 시즌' : ''}</b><span>${t.sub}</span>`); if (res) { const T = D.types[res.f]; el('em', '', b, tsub(res.f, res.s).n).style.background = T.bg; } b.onclick = () => { GF.sfx('pick'); GF.go('qplay', { id: t.id }); }; });
    },
  });

  /* ---------------- 테스트 진행 ---------------- */
  GF.screen('qplay', {
    bare: false,
    enter(r, p) {
      r.classList.add('uk', 'qz'); GF.bg('indoor2', r); const t = D.tests.find((x) => x.id === p.id); let i = 0; const ans = [];
      const scene = el('div', 'qz-scene', r), panel = el('div', 'qz-q', r), opts = el('div', 'qz-opts', r), dots = el('div', 'qz-dots', r);
      el('div', 'qz-st', scene, `<b>${t.title}</b><span>${t.sub}</span>`); const chs = el('div', 'qz-chs', scene); t.chars.forEach((id) => chs.appendChild(GF.img(id)));
      const show = () => {
        const q = t.qs[i]; panel.textContent = q.q; opts.innerHTML = ''; dots.innerHTML = t.qs.map((_, k) => '<i class="' + (k < i ? 'd' : k === i ? 'on' : '') + '"></i>').join('');
        q.o.forEach((o, k) => { const b = UK.btn({ text: o.t, cls: 'ghost block', onclick: () => { ans.push({ f: o.f, s: o.s }); GF.sfx('pick'); if (i < t.qs.length - 1) { i++; show(); } else done(); } }, opts); b.classList.add('qz-opt'); });
      };
      function done() {
        const R = QuizCore.resolve(ans), f = R.f, cnt = R.cnt;
        const s = R.s, first = !SV.res[t.id]; SV.res[t.id] = { f, s, cnt }; SV.last = t.id; save(); GF.refreshBar();
        if (roomOK) { Room.grant('q_plate_' + f); Room.grant('q_type_' + f + s); Room.setMe(me()); }
        GF.sfx('celebrate'); GF.replace('qresult', { id: t.id, first });
      }
      QZ.debug.answerAll = (pick) => { while (i < t.qs.length) { const o = t.qs[i].o[pick == null ? i % 3 : pick]; ans.push({ f: o.f, s: o.s }); i++; } i = t.qs.length - 1; done(); };
      show();
    },
  });

  /* ---------------- 결과 ---------------- */
  GF.screen('qresult', {
    bare: false,
    enter(r, p) {
      r.classList.add('uk', 'qz'); GF.bg('indoor2', r); const t = D.tests.find((x) => x.id === p.id), res = SV.res[t.id], T = D.types[res.f], S = tsub(res.f, res.s);
      const box = el('div', 'qz-card', r), im = el('img', '', box); im.src = uri(cardSVG(res, t.title));
      const txt = el('div', 'qz-res', r, `<p>${S.plus}</p><p class="st">${S.step}</p>` + (p.first ? '<p class="hang">문패와 배지가 집에 걸렸어요</p>' : ''));
      const acts = el('div', 'qz-acts', r);
      UK.btn({ text: '이미지 저장', icon: 'share', cls: 'gold', onclick: async () => { try { await savePNG(res, t.title); GF.sfx('star'); UK.toast('이미지로 저장했어요', r); } catch (e) { GF.sfx('hmm'); UK.toast('저장하지 못했어요', r); } } }, acts);
      UK.btn({ text: '집에 걸기', icon: 'home', cls: 'dong', onclick: () => GF.go('qhouse') }, acts);
    },
  });
  GF.screen('qcard', {
    bare: false,
    enter(r) {
      r.classList.add('uk', 'qz'); GF.bg('indoor2', r); const m = me(), rs = Object.values(SV.res), cnt = { nemo: 0, semo: 0, dong: 0 }; rs.forEach((x) => FAMS.forEach((f) => { cnt[f] += x.cnt[f]; }));
      const res = { f: m.f, s: m.s, cnt }; const box = el('div', 'qz-card', r), im = el('img', '', box); im.src = uri(cardSVG(res, '내 도형 · 테스트 ' + rs.length + '개'));
      el('div', 'qz-res', r, `<p>${tsub(m.f, m.s).plus}</p><p class="st">${tsub(m.f, m.s).step}</p>`);
      const acts = el('div', 'qz-acts', r); UK.btn({ text: '이미지 저장', icon: 'share', cls: 'gold', onclick: async () => { try { await savePNG(res, '내 도형'); GF.sfx('star'); UK.toast('이미지로 저장했어요', r); } catch (e) { GF.sfx('hmm'); } } }, acts); UK.btn({ text: '다른 테스트', icon: 'star', cls: 'sky', onclick: () => GF.go('qtests') }, acts);
    },
  });

  /* ---------------- 미니게임 5종 ---------------- */
  const GAMES = [
    { id: 1, name: '반응 — 불이 켜지면 탭', icon: 'play' }, { id: 2, name: '기억 — 가족 순서 따라하기', icon: 'heart' }, { id: 3, name: '선택 — 이럴 땐 어느 쪽?', icon: 'info' },
    { id: 4, name: '그림 — 이 물건은 누구 방?', icon: 'shapes' }, { id: 5, name: '가족 맞히기 — 누가 한 말?', icon: 'gift' },
  ];
  GF.screen('qgames', {
    bare: false,
    enter(r) {
      r.classList.add('uk', 'qz'); GF.bg('indoor2', r); const sc = el('div', 'qz-scroll', r);
      GAMES.forEach((g) => { const b = el('button', 'qz-test', sc), best = SV.game[g.id] || 0; el('div', 'th', b, UK.icon(g.icon)); el('div', 'tx', b, `<b>${g.name.split(' — ')[0]}</b><span>${g.name.split(' — ')[1]}</span>`); if (best) el('em', '', b, '★ ' + best).style.background = '#FFF3B0'; b.onclick = () => { GF.sfx('pick'); GF.go('qmini', { g: g.id }); }; });
    },
  });
  const LINES = [['계산부터 하자, 이번 달 학원비가…', 'nemo'], ['밥그릇이 모자라면 냄비째 먹지 뭐!', 'nemo'], ['애들 도시락은 내가 쌀게', 'nemo'], ['일단 떠나자, 온천 가자!', 'semo'], ['이번엔 내가 틀렸다, 라면 끓일게', 'semo'], ['1이 안 없어졌어? 전화할래', 'semo'], ['예약은 한 달 전에 해 뒀어요', 'dong'], ['말은 안 해도 다 보고 있었지', 'dong'], ['계획표대로 가면 돼', 'dong'], ['먼저 인사하고 올게요, 다들 모였죠?', 'nemo'], ['오늘 저녁은 둘이서 먹자', 'semo'], ['의자는 하나 비워 둘게요', 'dong']];
  const ROOMOF = { sofa: 'nemo', table: 'nemo', tv: 'nemo', drawer: 'nemo', bowl: 'nemo', bed: 'semo', suitcase: 'semo', lamp: 'semo', plant: 'semo', train: 'semo', clock: 'dong', globe: 'dong', shelf: 'dong', window: 'dong', rug: 'dong' };
  const BAL = [['혼자 조용한 여행', '가족 모두와 북적이는 여행'], ['미리 짠 계획표', '당일 즉흥'], ['큰 거 한 방 지르기', '꾸준히 모으기'], ['먼저 연락하기', '연락 기다리기'], ['집에서 배달', '나가서 외식'], ['넓은 집 혼자', '좁아도 다 같이']];
  GF.screen('qmini', {
    bare: false,
    enter(r, p) {
      r.classList.add('uk', 'qz'); GF.bg('indoor2', r); const g = p.g, area = el('div', 'qz-mini', r), head = el('div', 'qz-mh', r); let score = 0, round = 0;
      const rng = () => Math.random(), shuffle = (a) => a.map((x) => [rng(), x]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
      const end = (stars, chips) => { SV.game[g] = Math.max(SV.game[g] || 0, stars); save(); if (stars >= 2 && roomOK) { if (Room.grant('q_game_' + g)) chips.push({ icon: 'home', text: GAMES[g - 1].name.split(' — ')[0] + ' 트로피' }); } UK.result({ title: stars >= 3 ? '대단해요!' : stars === 2 ? '잘했어요!' : '좋아요, 한 번 더!', stars, chips, parent: r, onNext: null, onRetry: () => GF.replace('qmini', { g }), retryText: '한 번 더', onHome: () => GF.back(), homeText: '목록으로' }); };
      CL_END = end;
      if (g === 1) {   // 반응: 5번, 초록으로 바뀌면 탭 — 평균 ms
        const circle = el('button', 'qz-react', area), info = el('div', 'qz-info', area); let t0 = 0, armed = false, to, ms = [];
        const next = () => { circle.className = 'qz-react'; circle.textContent = ''; info.textContent = round + '/5 · 기다려요…'; armed = false; clearTimeout(to); to = setTimeout(() => { circle.classList.add('go'); circle.innerHTML = '<img src="' + GF.src('baby.joy') + '">'; t0 = performance.now(); armed = true; info.textContent = '지금!'; }, 1200 + rng() * 2200); };
        circle.onclick = () => { if (!armed) { GF.sfx('hmm'); clearTimeout(to); info.textContent = '아직이에요! 다시'; next(); return; } const d = performance.now() - t0; ms.push(d); GF.sfx('ok'); round++; if (round >= 5) { const avg = ms.reduce((a, b) => a + b, 0) / ms.length; end(avg < 420 ? 3 : avg < 620 ? 2 : 1, [{ icon: 'star', text: '평균 ' + Math.round(avg) + 'ms' }]); } else next(); };
        QZ.debug.reactDone = () => { clearTimeout(to); end(3, []); }; next();
      } else if (g === 2) {   // 기억: 가족 셋이 켜지는 순서 따라하기
        const row = el('div', 'qz-simon', area), info = el('div', 'qz-info', area), btns = ['nemo_dad.joy', 'wife.joy', 'dong_dad.joy'].map((id, k) => { const b = el('button', '', row); b.style.background = D.types[FAMS[k]].bg; b.appendChild(GF.img(id)); return b; });
        let seq = [], pos = 0, lock = true; const flash = (k) => new Promise((res) => { btns[k].classList.add('lit'); GF.sfx('pick'); setTimeout(() => { btns[k].classList.remove('lit'); setTimeout(res, 160); }, 420); });
        const play = async () => { lock = true; seq.push((rng() * 3) | 0); info.textContent = '잘 보세요 (' + seq.length + ')'; await new Promise((r2) => setTimeout(r2, 500)); for (const k of seq) await flash(k); pos = 0; lock = false; info.textContent = '따라 눌러요'; };
        btns.forEach((b, k) => { b.onclick = async () => { if (lock) return; await flash(k); if (k !== seq[pos]) { GF.sfx('hmm'); const len = seq.length - 1; end(len >= 6 ? 3 : len >= 4 ? 2 : 1, [{ icon: 'star', text: len + '개 기억' }]); return; } pos++; if (pos === seq.length) { GF.sfx('ok'); await play(); } }; });
        QZ.debug.memDone = () => end(3, []); seq = [(rng() * 3) | 0, (rng() * 3) | 0]; play();
      } else if (g === 3) {   // 선택: 이럴 땐 어느 쪽 — 집계 없음, 따뜻한 한마디
        const q = el('div', 'qz-info', area), box = el('div', 'qz-bal', area); const list = shuffle(BAL).slice(0, 6); let k = 0;
        const show = () => { box.innerHTML = ''; q.textContent = '이럴 땐? (' + (k + 1) + '/6)'; list[k].forEach((t, idx) => UK.btn({ text: t, cls: idx ? 'sky block' : 'pink block', onclick: () => { GF.sfx('pick'); k++; if (k >= 6) end(3, [{ icon: 'check', text: '6개 모두 골랐어요' }, { icon: 'heart', text: '정답 없는 질문이에요' }]); else show(); } }, box)); }; QZ.debug.balDone = () => end(3, []); show();
      } else if (g === 4) {   // 그림: 이 물건은 누구 방?
        const art = el('div', 'qz-art', area), box = el('div', 'qz-bal', area), info = el('div', 'qz-info', area); const items = shuffle(Object.keys(ROOMOF)).slice(0, 8); let k = 0;
        const show = () => { const a = items[k]; info.textContent = '이 물건은 누구 방에 있을까요? (' + (k + 1) + '/8)'; art.innerHTML = ''; const im = el('img', '', art); im.src = uri(RoomArt.make(a, '#F6C28B', {})); box.innerHTML = ''; ['nemo', 'semo', 'dong'].forEach((f, idx) => UK.btn({ text: ['네모네 거실', '세모네 신혼집', '동그라미네 서재'][idx], cls: f + ' block', onclick: () => { if (ROOMOF[a] === f) { score++; GF.sfx('ok'); } else GF.sfx('hmm'); k++; if (k >= 8) end(score >= 7 ? 3 : score >= 5 ? 2 : 1, [{ icon: 'star', text: score + '/8 맞힘' }]); else show(); } }, box)); }; QZ.debug.picDone = () => end(3, []); show();
      } else {   // 가족 맞히기: 누가 한 말?
        const bubble = el('div', 'qz-bub', area), box = el('div', 'qz-bal', area), info = el('div', 'qz-info', area); const list = shuffle(LINES).slice(0, 8); let k = 0;
        const show = () => { info.textContent = '누가 한 말일까요? (' + (k + 1) + '/8)'; bubble.textContent = '“' + list[k][0] + '”'; box.innerHTML = ''; FAMS.forEach((f) => UK.btn({ text: D.types[f].name, cls: f + ' block', onclick: () => { if (list[k][1] === f) { score++; GF.sfx('ok'); } else GF.sfx('hmm'); k++; if (k >= 8) end(score >= 7 ? 3 : score >= 5 ? 2 : 1, [{ icon: 'star', text: score + '/8 맞힘' }]); else show(); } }, box)); }; QZ.debug.guessDone = () => end(3, []); show();
      }
    },
  });
  let CL_END = null;

  /* ---------------- 우리 집 ---------------- */
  GF.screen('qhouse', {
    bare: false,
    enter(r) { r.classList.add('uk', 'qz'); GF.bg('indoor2', r); const sc = el('div', 'abs', r); sc.style.cssText = 'left:0;right:0;top:70px;bottom:0;overflow-y:auto;touch-action:pan-y'; Room.house(sc, {}); },
  });

  /* ---------------- 부팅 ---------------- */
  QZ.start = async function (opts) {
    UK.mode('adult');
    await GF.boot(Object.assign({ dataNames: ['chars', 'anchors', 'sounds', 'quiz_tests', 'room_items', 'art_slots'], storeKey: 'gf:quiz:ui:v1', async start() {
      D = GF.data.quiz_tests; Room.init({ data: GF.data.room_items, game: 'quiz', mode: 'adult', autoPlace: true, store: Room.sharedStore('gf:house:adult:v1'), charSrc: (id) => GF.src(id), slot: (k, id) => GF.slot(k, id) });
      roomOK = true; document.getElementById('safe').classList.add('uk'); GF.go('qhome');
      QZ.debug.D = () => D; QZ.debug.SV = () => SV; QZ.debug.reset = () => { SV = blank(); save(); }; QZ.debug.me = me; QZ.debug.cardSVG = cardSVG;
    } }, opts || {}));
  };
})();
