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
  const BG = { pigs: 'field', bremen: 'village', gyeonwoo: 'night', bears: 'indoor2', jack: 'hill', kongjwi: 'village', heungbu: 'field', ureng: 'field', axe: 'forest', ant: 'hill', sun: 'night', hare: 'field', brothers: 'field', snowqueen: 'night' };
  /** 데이터 컷 → GF.story 컷. 캐릭터는 id 목록(또는 {id,x,y}), bubble 은 종류 문자열 */
  T.cuts = (raw, bg) => raw.map((c) => ({ bg: c.bg || bg || 'indoor2', text: c.text, voice: c.voice, chars: (c.chars || []).map((q, k, a) => (typeof q === 'string' ? { id: q, x: a.length > 1 ? 50 + k * (260 / (a.length - 1)) : 180, y: 600 } : q)), bubble: c.bubble ? { type: c.bubble, at: 0 } : null }));
  /** 컷 묶음을 화면 위에 띄운다. 끝나거나 건너뛰면 cb(). parent 는 화면 루트 */
  T.play = function (raw, parent, cb, o) {
    o = o || {}; parent = parent || safe(); const ov = el('div', 'abs tale-ov', parent); ov.style.cssText = 'inset:0;z-index:70;background:#FFF1D6'; let done = false;
    const end = () => { if (done) return; done = true; try { ov.remove(); } catch (e) {} cb && cb(); };
    const inner = el('div', 'abs', ov); inner.style.cssText = 'inset:0'; GF.story(inner, T.cuts(raw, o.bg), end);
    const sk = el('button', 'tale-skip', ov, T.kid ? UK.icon('next') : '건너뛰기'); sk.setAttribute('aria-label', 'skip'); sk.onclick = (e) => { e.stopPropagation(); GF.sfx('tap'); end(); };
    return ov;
  };
  const go = (raw, parent, cb, o, k) => { if (!raw || !raw.length || (k && T.seen(k)) || auto()) { if (k && !T.seen(k)) T.mark(k); cb && cb(); return false; } if (k) T.mark(k); T.play(raw, parent, cb, o); return true; };
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
    parent = parent || safe(); const sc = el('div', 'uk-scrim tale-final', parent), sh = el('div', 'uk-sheet', sc); el('h2', '', sh, '당신은 어느 도형인가요?'); el('div', 'body', sh, T.d.finalLine || '네모, 세모, 동그라미. 어느 쪽에 가까운지 오늘 알려 주세요.');
    const a = el('div', 'acts', sh); UK.btn({ text: '계속하기', cls: 'green', icon: 'next', onclick: () => { sc.remove(); cb && cb(); } }, a); GF.sfx('celebrate'); try { UK.confetti(sc); } catch (e) {}
  };
  /** 지도의 이야기 책: 그 장 컷 전부(기·승·전·결) 다시 보기 */
  T.replay = function (n, parent, cb) { const c = ch(n); if (!T.ready || !c) return (cb && cb(), false); const all = (c.start || []).concat(...(c.mid || []).map((m) => m.cuts), c.end || []); T.play(all, parent || safe(), cb, { bg: BG[c.tale] }); return true; };
  /* ---------------- 판 안 말풍선 ---------------- */
  /** kind: 'start' | 'clear'. n 으로 돌려 가며 한마디(배역 캐릭터 얼굴 + 말). 유아 앱은 글 없이 얼굴+말풍선 그림+음성 슬롯 */
  T.say = function (parent, n, kind, k) {
    if (!T.ready || auto()) return null; const c = ch(n); if (!c || !c.say || !c.say[kind] || !c.say[kind].length) return null; const L = c.say[kind][((k || 0) % c.say[kind].length + c.say[kind].length) % c.say[kind].length];
    const old = parent.querySelector('.tale-say'); if (old) old.remove();
    const b = el('div', 'tale-say' + (T.kid ? ' kid' : ''), parent), a = el('div', 'a', b); a.style.backgroundImage = 'url("' + GF.src(L.who) + '")'; if (T.kid) el('i', '', b, '💬'); else el('span', '', b, GF.name(L.text));
    GF.say && L.voice && GF.say(L.voice); setTimeout(() => { b.classList.add('off'); setTimeout(() => b.remove(), 400); }, T.kid ? 2200 : 2800); return b;
  };
  /* ---------------- 설명(규칙 안내) ---------------- */
  /** 처음 나오는 판 종류: 글 한 줄 + (유아는 그림) → 닫으면 cb(손가락 시연은 앱이 이어서) */
  T.explain = function (type, parent, cb) {
    const r = T.ready && T.d.rules && T.d.rules[type]; if (!r || T.seen('r:' + type) || auto()) { if (r && !T.seen('r:' + type)) T.mark('r:' + type); cb && cb(); return false; }
    T.mark('r:' + type); parent = parent || safe(); const sc = UK.modal({ parent, title: T.kid ? '' : r.title, big: r.icon || '', body: T.kid ? '' : r.text, actions: [{ text: T.kid ? '' : '알겠어요', icon: T.kid ? 'play' : undefined, cls: 'green', onclick: () => { cb && cb(); } }] });
    if (T.kid) { const a = sc.querySelector('.acts .uk-btn'); if (a) a.setAttribute('aria-label', 'ok'); } return true;
  };
  /** 설정 「도움말」: 판 종류별 설명을 다시 보기 */
  T.help = function () {
    if (!T.ready || !T.d.rules) return; const sc = UK.modal({ parent: safe(), title: '판 종류 설명', dismiss: true }), sh = sc.querySelector('.uk-sheet'); sh.classList.add('xt-sheet'); const body = el('div', 'tale-help', sh);
    Object.keys(T.d.rules).forEach((k) => { const r = T.d.rules[k], d = el('div', 'tale-hr', body); el('span', 'ic', d, r.icon || '•'); const t = el('div', 'tx', d); el('b', '', t, r.title); el('small', '', t, r.text); });
    const a = el('div', 'acts row', sh); UK.btn({ text: '닫기', cls: 'ghost', onclick: () => sc.close() }, a);
  };
  /* ---------------- 레벨 앱 공통 연결 ---------------- */
  const idxOf = (LV, per) => LV.idx || ((LV.id - 1) % per) + 1;
  /** 판 화면이 열릴 때: 장 첫 판이면 기 컷 → 처음 나오는 판 종류 설명 → 시작 한마디 */
  T.level = function (parent, LV) {
    if (!T.ready || LV.kind) return; const per = T.d.per, i = idxOf(LV, per);
    T.before(LV.chapter, i, parent, () => T.explain(LV.type, parent, () => T.say(parent, LV.chapter, 'start', LV.id)));
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
