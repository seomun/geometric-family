/* 이야기 진행 GF.tale — 10앱이 같은 모양으로 쓰는 공용 이야기 층 (games/18_STORY_PASS.md, 허브 지시 2026-10-09).
   앱마다 data/story_<앱>.json 하나: 프롤로그 · 장별 기(시작)·승·전(판 사이)·결(장 끝) 컷 · 판 안 말풍선(시작·클리어) · 판 종류 설명 · 엔딩.
   · 모든 컷은 GF.story(첫 만남 인사와 같은 연출). 탭으로 넘기고, 「건너뛰기」로 한 번에 끝낼 수 있다. 한 번 본 컷은 다시 자동으로 나오지 않는다(저장: gf:<앱>:tale).
   · 배역은 단일 배역표(tools/tales_cast.py)를 따르고, 모든 글은 [제안] 각색이다. 성인 앱은 글, 유아 앱은 그림+음성 슬롯(글 없음, 자막은 보호자 메뉴로 끔).
   · 자동 시험(navigator.webdriver)은 컷을 건너뛴다(인사와 같음). 확인은 ?story=1 또는 GF.tale.force=true. */
(function () {
  'use strict';
  const el = UK.el;
  const T = (GF.tale = { app: null, d: null, kid: false, force: false, ready: false });
  const LS = (k, v) => { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} return null; };
  const key = () => 'gf:' + T.app + ':tale', st = () => Object.assign({ seen: {} }, LS(key()) || {});
  T.seen = (k) => !!st().seen[k];
  T.mark = (k) => { const s = st(); s.seen[k] = 1; LS(key(), s); };
  T.reset = () => { try { localStorage.removeItem(key()); } catch (e) {} };
  const auto = () => !!navigator.webdriver && !T.force && !/[?&]story=1/.test(location.search);
  const safe = () => document.getElementById('safe');
  T.init = (app, data, opt) => { T.app = app; T.d = data || null; T.kid = !!(opt && opt.kid); T.ready = !!data; };
  /* ---------------- 미니 판(튜토리얼 컷) ----------------
     이야기 컷 안에 「실제 게임 판 조각」으로 그린 작은 판. 각 게임이 자기 그림 함수로 T.mini.reg(앱, (host, spec, still) => …) 를 등록한다.
     spec = {app?, …게임별 값}. 같은 동작을 반복해 보여 주고(M.loop), 컷이 바뀌면(host 가 떨어지면) 멈춘다. still=true 면 끝 모양만 그린다(설명 카드 그림). */
  const M = (T.mini = { fn: {}, reg(app, f) { M.fn[app] = f; }, has: (s) => !!(s && M.fn[s.app || T.app]) });
  M.loop = (host, build, steps, still, hold) => {
    if (still) { build(); steps.forEach((q) => { if (q[2] !== 'x') q[1](); }); return; }   // 끝 모양 그림(설명 카드): 'x' 표시한 마지막 지우기 단계는 건너뛴다
    const tms = [], run = () => { if (!host.isConnected) { tms.forEach(clearTimeout); return; } build(); let t = 0; steps.forEach((q) => { t += q[0]; tms.push(setTimeout(() => { if (host.isConnected) q[1](); }, t)); }); tms.push(setTimeout(run, t + (hold || 1700))); };
    run();
  };
  M.draw = (parent, spec, still) => { const f = M.fn[(spec && spec.app) || T.app]; if (!f) return null; const host = el('div', 'cut-mini', parent); try { f(host, spec, !!still); } catch (e) { host.remove(); return null; } return host; };
  /* 공용 간이 미니(그림 함수가 따로 없는 앱): ② 식탁 온기 · ④ 색칠 · ⑤ 질문 고르기. 이모지·세 가족 얼굴 그림만 쓴다 */
  M.reg('idle', (host, s, still) => {   // 식탁의 음식을 톡 → 온기 +1, 온기 막대가 차 오른다 (k:'story' 면 막대가 가득 차 사연 책이 열린다)
    const col = el('div', 'tm-col', host), tb = el('div', 'tm-table', col), bar = el('div', 'tm-bar', col); let food, f1, up;
    const build = () => { tb.innerHTML = bar.innerHTML = ''; food = el('b', 'tm-food', tb, s.k === 'story' ? '📖' : s.k === 'season' ? '🍂' : '🍲'); (s.k === 'season' ? ['🌸', '🍉', '🎃'] : ['🍚', '🥬', '🍳']).forEach((e) => el('b', 'tm-side', tb, e)); up = el('i', '', bar); up.style.width = s.k === 'story' ? '78%' : '20%'; f1 = el('em', 'tm-plus', tb, s.k === 'story' ? '✨' : '♨ +1'); f1.style.opacity = 0; };
    M.loop(host, build, [[900, () => { food.style.transform = 'scale(1.25)'; f1.style.opacity = 1; f1.style.transform = 'translateY(-14px)'; up.style.width = s.k === 'story' ? '100%' : '45%'; }]], still);
  });
  M.reg('color', (host, s, still) => {   // 크레파스가 지나가며 그림에 색이 번진다
    const w = el('div', 'tm-paint', host); let pen, fill;
    if (s.k === 'trace' || s.k === 'sticker') {      // 따라 그리기: 점이 차례로 이어짐 · 스티커: 그림 위에 톡
      const d = el('div', 'tm-paint', host); let pts, st;
      const bld = () => { d.innerHTML = s.k === 'trace' ? '<svg viewBox="0 0 160 130" width="190" height="150"><path class="tp" d="M30 100L80 24L130 100Z" fill="none" stroke="#E5334A" stroke-width="5" stroke-linecap="round" stroke-dasharray="260" stroke-dashoffset="260" style="transition:stroke-dashoffset 1.4s"/><g fill="#fff" stroke="#8A5A3B" stroke-width="3"><circle cx="30" cy="100" r="10"/><circle cx="80" cy="24" r="10"/><circle cx="130" cy="100" r="10"/></g><g font-size="13" font-weight="900" text-anchor="middle" font-family="sans-serif" fill="#8A5A3B"><text x="30" y="105">1</text><text x="80" y="29">2</text><text x="130" y="105">3</text></g></svg>' : '<svg viewBox="0 0 160 130" width="190" height="150"><path d="M20 62L80 12l60 50v56H20z" fill="#FFF0B8" stroke="#8A5A3B" stroke-width="5" stroke-linejoin="round"/><text class="ts" x="60" y="70" font-size="26" opacity="0" style="transition:opacity .4s">⭐</text><text class="ts" x="96" y="92" font-size="26" opacity="0" style="transition:opacity .4s .5s">🌸</text></svg>'; };
      M.loop(host, bld, [[600, () => { const tp = d.querySelector('.tp'); if (tp) tp.style.strokeDashoffset = 0; d.querySelectorAll('.ts').forEach((e) => { e.setAttribute('opacity', 1); }); }]], still); return;
    }
    const build = () => { w.innerHTML = '<svg viewBox="0 0 160 130" width="190" height="150"><path d="M20 62L80 12l60 50v56H20z" fill="#fff" stroke="#8A5A3B" stroke-width="5" stroke-linejoin="round"/><rect x="66" y="82" width="28" height="36" rx="4" fill="#fff" stroke="#8A5A3B" stroke-width="4"/></svg>'; fill = el('i', 'tm-fill', w); pen = el('b', 'tm-pen', w, '🖍️'); };
    M.loop(host, build, [[800, () => { pen.style.left = '120px'; pen.style.top = '60px'; fill.style.opacity = 1; }]], still);
  });
  M.reg('quiz', (host, s, still) => {   // 질문 → 하나를 톡 → 닮은 도형(세 가족 중 한 명)이 나온다
    if (s.k === 'game') {      // 미니게임: 같은 도형을 빠르게 톡 — 별이 하나씩 쌓인다
      const g = el('div', 'tm-col', host); let sh, stars;
      const bg = () => { g.innerHTML = ''; const row = el('div', 'tm-opts', g); sh = ['△', '◻', '◯'].map((c, i) => el('b', '', row, c)); stars = el('div', 'tm-q', g, '☆☆☆'); };
      M.loop(host, bg, [[700, () => { sh[0].classList.add('pick'); stars.textContent = '★☆☆'; }], [600, () => { sh[2].classList.add('pick'); stars.textContent = '★★☆'; }], [600, () => { sh[1].classList.add('pick'); stars.textContent = '★★★'; }]], still); return;
    }
    const ids = ['nemo_dad.joy', 'wife.joy', 'dong_dad.joy'], who = ids[(s.who || 0) % 3], col = el('div', 'tm-col', host); let a, b, res;
    const build = () => { col.innerHTML = ''; const q = el('div', 'tm-q', col, '❓'); const row = el('div', 'tm-opts', col); a = el('b', '', row, '🛋️'); b = el('b', '', row, '🏃'); res = el('div', 'tm-res', host); res.style.opacity = 0; res.appendChild(GF.img(who)); el('span', '', host, ''); };
    M.loop(host, build, [[900, () => { b.classList.add('pick'); }], [700, () => { res.style.opacity = 1; res.style.transform = 'scale(1)'; }]], still);
  });
  M.reg('play', (host, s, still) => {   // ① 놀이터: 장의 놀이 도구(a)가 제자리(b)로 간다. spec.img 가 있으면 그 캐릭터가 그림자 자리로 들어간다
    const w = el('div', 'tm-day', host); let it, to;
    const mk = (v, big, p) => { if (v && v.indexOf('.') > 0) { const d = el('div', 'tm-pimg', p); d.appendChild(GF.img(v)); d.style.height = (big ? 130 : 110) + 'px'; return d; } return el('b', 'tm-pe', p, v); };
    const build = () => { w.innerHTML = ''; w.style.cssText = 'position:relative;width:250px;height:140px'; to = mk(s.b, 1, w); to.style.cssText += ';position:absolute;right:10px;top:12px;font-size:72px' + (s.shadow ? ';filter:brightness(0);opacity:.35' : ''); it = mk(s.a, 0, w); it.style.cssText += ';position:absolute;left:10px;top:24px;font-size:56px;transition:all .8s'; };
    M.loop(host, build, [[900, () => { it.style.left = '122px'; it.style.top = '18px'; }], [700, () => { if (s.shadow) to.style.cssText += ';filter:none;opacity:1'; w.insertAdjacentHTML('beforeend', '<b class="tm-spk" style="position:absolute;right:20px;top:0;font-size:30px;font-weight:400">✨</b>'); }]], still);
  });
  const BG = { pigs: 'field', bremen: 'village', gyeonwoo: 'night', bears: 'indoor2', jack: 'hill', kongjwi: 'village', heungbu: 'field', ureng: 'field', axe: 'forest', ant: 'hill', sun: 'night', hare: 'field', brothers: 'field', snowqueen: 'night' };
  /** 데이터 컷 → GF.story 컷. 캐릭터는 id 목록(또는 {id,x,y}), bubble 은 종류 문자열 */
  T.cuts = (raw, bg) => raw.map((c) => ({ bg: c.bg || bg || 'indoor2', text: c.text, voice: c.voice, chars: (c.chars || []).map((q, k, a) => (typeof q === 'string' ? { id: q, x: a.length > 1 ? 50 + k * (260 / (a.length - 1)) : 180, y: 600 } : q)), mini: c.mini || null, bubble: c.bubble ? { type: c.bubble, at: 0 } : null }));
  /** 컷 묶음을 화면 위에 띄운다. 끝나거나 건너뛰면 cb(). parent 는 화면 루트 */
  T.play = function (raw, parent, cb, o) {
    o = o || {}; try { GF.ads && GF.ads.noteStory && GF.ads.noteStory(); GF.ops && GF.ops.note && GF.ops.note('story'); } catch (e) {}   // 컷 직후에는 전면 광고 금지
    parent = parent || safe(); const ov = el('div', 'abs tale-ov', parent); ov.style.cssText = 'inset:0;z-index:70;background:#FFF1D6'; let done = false;
    const end = () => { if (done) return; done = true; try { ov.remove(); } catch (e) {} cb && cb(); };
    const inner = el('div', 'abs', ov); inner.style.cssText = 'inset:0'; GF.story(inner, T.cuts(raw, o.bg), end);
    const sk = el('button', 'tale-skip', ov, T.kid ? UK.icon('next') : GF.t('ui.tale.skip')); sk.setAttribute('aria-label', 'skip'); sk.onclick = (e) => { e.stopPropagation(); GF.sfx('tap'); end(); };
    return ov;
  };
  /** 장 n 의 기(s)·승/전(m)·결(e) 컷을 끝까지 보면 그 이야기 카드를 얻는다(GF.ip). 이미 본 컷도 한 번 더 확인해 예전 진행도 카드가 된다 */
  const afterBeat = (k) => { try { if (!GF.ip || !GF.ip.ready || auto() || !T.d) return; const m = /^([sme])(\d+)(?::(\d+))?$/.exec(k); if (!m) return; const c = ch(+m[2]); if (!c) return; let beat = m[1] === 's' ? 0 : m[1] === 'e' ? 3 : (c.mid || []).findIndex((x) => x.after === +m[3]) + 1; if (beat < 0 || beat > 3) return; GF.ip.beat(T.app, c.tale, beat); } catch (e) {} };
  const go = (raw, parent, cb, o, k) => {
    if (!raw || !raw.length || (k && T.seen(k)) || auto()) { if (k && !T.seen(k)) T.mark(k); else if (k && T.seen(k)) afterBeat(k); cb && cb(); return false; }
    if (k) T.mark(k); T.play(raw, parent, () => { if (k) afterBeat(k); cb && cb(); if (k) setTimeout(() => { try { GF.ip && GF.ip.cameo && GF.ip.cameo(T.app, k); } catch (e) {} }, 700); }, o); return true;
  };
  const ch = (n) => (T.d && T.d.chapters && T.d.chapters[n]) || null;
  /** 앱을 처음 쓸 때(첫 인사 다음) 이 게임의 이야기를 2~4컷으로 소개 */
  T.prologue = (parent, cb) => (T.ready ? go(T.d.prologue, parent, cb, { bg: 'indoor' }, 'prologue') : (cb && cb(), false));
  /** 장의 첫 판 앞: 기(시작) 컷 */
  T.before = function (n, idx, parent, cb) { const c = ch(n); if (!T.ready || !c || idx !== 1) return (cb && cb(), false); return go(c.start, parent, cb, { bg: BG[c.tale] }, 's' + n); };
  /** 판을 깬 직후: 장 중간(승·전) 컷 또는 장 끝(결) 컷, 마지막 장이면 엔딩. per = 장당 판 수 */
  T.after = function (n, idx, per, parent, cb) {
    const c = ch(n); if (!T.ready || !c) return (cb && cb(), false);
    const mid = (c.mid || []).find((m) => m.after === idx); if (mid) return go(mid.cuts, parent, cb, { bg: BG[c.tale] }, 'm' + n + ':' + idx);
    if (idx !== per) return (cb && cb(), false);
    const last = T.d.last === n, seq = (c.end || []).concat(last ? [] : []);
    return go(seq, parent, () => { if (last && !T.seen('ending')) { T.mark('ending'); if (auto()) { cb && cb(); return; } T.play(T.d.ending || [], parent, () => T.finalCard(parent, cb), { bg: 'indoor2' }); } else cb && cb(); }, { bg: BG[c.tale] }, 'e' + n);
  };
  /** 엔딩 뒤 마지막 한 줄 카드 */
  T.finalCard = function (parent, cb) {
    parent = parent || safe(); const sc = el('div', 'uk-scrim tale-final', parent), sh = el('div', 'uk-sheet', sc); el('h2', '', sh, GF.t('ui.tale.final.title')); el('div', 'body', sh, T.d.finalLine || '네모, 세모, 동그라미. 어느 쪽에 가까운지 오늘 알려 주세요.');
    const a = el('div', 'acts', sh); UK.btn({ text: GF.t('ui.tale.next'), cls: 'green', icon: 'next', onclick: () => { sc.remove(); cb && cb(); } }, a); GF.sfx('celebrate'); try { UK.confetti(sc); } catch (e) {}
  };
  /** 지도의 이야기 책: 그 장 컷 전부(기·승·전·결) 다시 보기 */
  T.replay = function (n, parent, cb) { const c = ch(n); if (!T.ready || !c) return (cb && cb(), false); const all = (c.start || []).concat(...(c.mid || []).map((m) => m.cuts), c.end || []); T.play(all, parent || safe(), cb, { bg: BG[c.tale] }); return true; };
  /* ---------------- 판 안 말풍선 ---------------- */
  /** kind: 'start' | 'clear'. n 으로 돌려 가며 한마디(배역 캐릭터 얼굴 + 말). 유아 앱은 글 없이 얼굴+말풍선 그림+음성 슬롯 */
  T.say = function (parent, n, kind, k) {
    if (!T.ready || auto()) return null; const c = ch(n); if (!c || !c.say || !c.say[kind] || !c.say[kind].length) return null; const L = c.say[kind][((k || 0) % c.say[kind].length + c.say[kind].length) % c.say[kind].length];
    const old = parent.querySelector('.tale-say'); if (old) old.remove();
    const b = el('div', 'tale-say' + (T.kid ? ' kid' : ''), parent), a = el('div', 'a', b); a.style.backgroundImage = 'url("' + GF.src(L.who) + '")'; if (T.kid) el('i', '', b, '💬'); else el('span', '', b, GF.ops && GF.ops.tone ? GF.ops.tone(GF.name(L.text)) : GF.name(L.text));
    GF.say && L.voice && GF.say(L.voice); setTimeout(() => { b.classList.add('off'); setTimeout(() => b.remove(), 400); }, T.kid ? 2200 : 2800); return b;
  };
  /* ---------------- 설명(규칙 안내) ---------------- */
  /** 처음 나오는 판 종류: 글 한 줄 + (유아는 그림) → 닫으면 cb(손가락 시연은 앱이 이어서) */
  T.explain = function (type, parent, cb) {
    const r = T.ready && T.d.rules && T.d.rules[type]; if (!r || T.seen('r:' + type) || auto()) { if (r && !T.seen('r:' + type)) T.mark('r:' + type); cb && cb(); return false; }
    T.mark('r:' + type); parent = parent || safe();
    if (r.cuts && r.cuts.length) { T.play(r.cuts, parent, () => T.card(r, parent, cb)); return true; }          // 새 판 종류: 배역이 그 규칙을 보여 주는 컷 → 설명 카드
    return T.card(r, parent, cb);
  };
  T.card = function (r, parent, cb) {
    const sc = UK.modal({ parent, title: T.kid ? '' : r.title, big: r.icon || '', body: T.kid ? '' : r.text, actions: [{ text: T.kid ? '' : GF.t('ui.tale.ok'), icon: T.kid ? 'play' : undefined, cls: 'green', onclick: () => { cb && cb(); } }] });
    if (T.kid) { const a = sc.querySelector('.acts .uk-btn'); if (a) a.setAttribute('aria-label', 'ok'); }
    if (r.mini && M.has(r.mini)) { const sh = sc.querySelector('.uk-sheet'), h = M.draw(sh, r.mini, true); if (h) { h.classList.add('in-card'); const b = sh.querySelector('.body'); sh.insertBefore(h, b || sh.querySelector('.acts')); } }
    return true;
  };
  /** 설정 「도움말」: 판 종류별 설명을 다시 보기 */
  T.help = function () {
    if (!T.ready || !T.d.rules) return; const sc = UK.modal({ parent: safe(), title: GF.t('ui.set.rules'), dismiss: true }), sh = sc.querySelector('.uk-sheet'); sh.classList.add('xt-sheet'); const body = el('div', 'tale-help', sh);
    Object.keys(T.d.rules).forEach((k) => { const r = T.d.rules[k], d = el('div', 'tale-hr', body); el('span', 'ic', d, r.icon || '•'); const t = el('div', 'tx', d); el('b', '', t, r.title); el('small', '', t, r.text); });
    const a = el('div', 'acts row', sh); UK.btn({ text: GF.t('c16.gf.002'), cls: 'ghost', onclick: () => sc.close() }, a);
  };
  /* ---------------- 레벨 앱 공통 연결 ---------------- */
  const idxOf = (LV, per) => LV.idx || ((LV.id - 1) % per) + 1;
  /** 판 화면이 열릴 때: 장 첫 판이면 기 컷 → 처음 나오는 판 종류 설명 → 시작 한마디 */
  T.level = function (parent, LV) {
    if (!T.ready || LV.kind) return; const per = T.d.per, i = idxOf(LV, per);
    T.before(LV.chapter, i, parent, () => {
      /* 첫 판 안내 순서: 설명 카드 → 손가락 시연 → (첫 조각을 놓은 뒤) 말풍선. 카드가 있는 판에서는 안내 토스트를 생략한다 */
      let sync = true;
      const shown = T.explain(LV.type, parent, () => {
        if (sync) return; T.cardOpen = false;
        setTimeout(() => { try { parent.__demo && parent.__demo(); } catch (e) {} }, 350);            // 손가락 시연은 카드가 닫힌 뒤
        const arm = () => { parent.removeEventListener('pointerup', arm, true); setTimeout(() => T.say(parent, LV.chapter, 'start', LV.id), 900); };
        parent.addEventListener('pointerup', arm, true);                                              // 말풍선은 첫 조각을 놓은 뒤
      });
      sync = false;
      if (shown) { T.cardOpen = true; parent.querySelectorAll('.uk-toast').forEach((x) => x.remove()); } else T.say(parent, LV.chapter, 'start', LV.id);
    });
  };
  /** 판을 깬 직후(결과 화면 앞): 클리어 한마디 + 승·전·결 컷. 끝나면 cb() */
  T.done = function (parent, LV, cb) {
    if (!T.ready || LV.kind) return cb(); T.say(parent, LV.chapter, 'clear', LV.id); T.after(LV.chapter, idxOf(LV, T.d.per), T.d.per, parent, cb);
  };
  /* ---------------- 이야기 지도 ---------------- */
  /** 장 머리글 아래 한 줄: 기·승·전·결 점 + 배역 얼굴(잠긴 장은 실루엣). done/total 은 그 장에서 깬 판/전체 */
  T.strip = function (parent, n, done, total, locked) {
    const c = ch(n); if (!T.ready || !c) return null; const d = el('div', 'tale-strip' + (locked ? ' lock' : ''), parent), faces = el('div', 'fc', d);
    (c.faces || []).slice(0, 3).forEach((id) => { const i = el('i', '', faces); i.style.backgroundImage = 'url("' + GF.src(id) + '")'; });
    const marks = [done >= 1, done >= (c.midAt1 || Math.ceil(total * 0.4)), done >= (c.midAt2 || Math.ceil(total * 0.7)), done >= total], names = ['기', '승', '전', '결'], row = el('div', 'bt', d);
    marks.forEach((m, i) => el('span', m ? 'on' : '', row, names[i])); el('em', '', d, locked ? '다음 이야기' : (done >= total ? '이야기 끝' : (done >= 1 ? '이야기 이어 가는 중' : '새 이야기')));
    return d;
  };
})();
