/* 순위표 GF.rank — 성인 점수형 앱 ③⑥⑦⑧⑨ (games/17_LEADERBOARD.md, 허브 결정 D16). 서버·계정 없음, 기기 안에서만.
   ① 내 기록: 최고 10개(점수·날짜) 저장 · ② 세 가족 순위표: 네모(아빠·엄마)·세모(남편·아내)·동그라미(아빠)가 각자 가족 규칙으로 플레이한 점수 사이의 내 자리.
   가족 점수는 앱의 봇(core 의 botPlay = 가족 규칙을 쓰는 탐욕 플레이)이 (앱·판·날짜·사람) 시드로 결정적으로 만든다 → 같은 날이면 모두에게 같은 점수, 뽑기 없음.
   맛: 네모 = 꾸준히 중간 · 세모 = 들쭉날쭉(대박 아니면 꽝) · 동그라미 = 높고 일정하지만 가끔 빈자리.
   이기면 한 줄(「오늘은 세모 남편을 이겼어요!」), 지면 문구 없이 순위만. 주간은 월요일에 새로 시작, 지난주는 내 기록에만 남는다. 주 1회 1위 = 집 소품 1개(확정).
   각 앱이 init({app, boards:{id:{title, levelAt(dateNum, dayNum)→level|null, bot(level, rule, rng, eps, dateNum)→{won, score}}}}) 를 부른다. */
(function () {
  'use strict';
  const el = UK.el;
  const R = (GF.rank = { ready: false, cfg: null, _today: null });
  const PLAYERS = [
    { id: 'nemo_dad', name: '네모 아빠', fam: 0, img: 'nemo_dad.joy' }, { id: 'nemo_mom', name: '네모 엄마', fam: 0, img: 'nemo_mom.joy' },
    { id: 'semo_h', name: '세모 남편', fam: 1, img: 'husband.joy' }, { id: 'semo_w', name: '세모 아내', fam: 1, img: 'wife.joy' },
    { id: 'dong_dad', name: '동그라미 아빠', fam: 2, img: 'dong_dad.joy' }];
  R.PLAYERS = PLAYERS;
  const LS = (k, v) => { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} return null; };
  const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
  const mulberry = (a) => () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  /* 날짜: yyyymmdd 숫자 */
  const toNum = (d) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  const toDate = (n) => new Date(Math.floor(n / 10000), Math.floor((n % 10000) / 100) - 1, n % 100);
  R.today = () => R._today || toNum(new Date());
  R.dayNumOf = (n) => { const d = toDate(n); return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000); };
  R.weekStart = (n) => { const d = toDate(n), k = (d.getDay() + 6) % 7; d.setDate(d.getDate() - k); return toNum(d); };   // 월요일
  R.addDays = (n, k) => { const d = toDate(n); d.setDate(d.getDate() + k); return toNum(d); };
  const weekDays = (n) => { const ws = R.weekStart(n), o = []; for (let d = ws; d <= n; d = R.addDays(d, 1)) o.push(d); return o; };
  /** 점수 공통식: 효율(par/행동 수)·도구·다시 하기. 사람과 가족 봇이 같은 식을 쓴다 */
  R.clamp = (v) => Math.max(50, Math.min(1250, Math.round(v)));
  R.eff = (o) => R.clamp(1000 * (o.par || 1) / Math.max(1, o.actions || 1) - 60 * (o.tools || 0) - 150 * ((o.attempts || 1) - 1));
  const key = () => 'gf:' + R.cfg.app + ':rank';
  const load = () => Object.assign({ top: {}, day: {}, claimed: {}, tries: {}, cache: {} }, LS(key()) || {});
  const save = (s) => LS(key(), s);
  const josa = (name) => { const c = name.charCodeAt(name.length - 1) - 0xAC00; return c >= 0 && c % 28 !== 0 ? '을' : '를'; };
  /** 가족마다 다른 플레이 맛 */
  function style(p, rng) {
    if (p.fam === 0) return { eps: p.id === 'nemo_dad' ? 0.13 : 0.17, absent: false };   // 꾸준히 중간
    if (p.fam === 1) return { eps: rng() < 0.5 ? 0.01 : 0.6, absent: false };            // 대박 아니면 꽝
    return { eps: 0.03, absent: rng() < 0.12 };                                          // 높고 일정, 가끔 빈자리
  }
  /** 가족 한 명의 그날 점수(결정적). 쉬는 날이면 null */
  R.famScore = function (boardId, date, p) {
    const b = R.cfg.boards[boardId], ck = boardId + ':' + date + ':' + p.id, S = load(); if (S.cache[ck] !== undefined) return S.cache[ck];
    const base = R.cfg.app + ':' + boardId + ':' + date + ':' + p.id, rng = mulberry(hash(base)), st = style(p, rng); let out = null;
    if (!st.absent) {
      const L = b.levelAt ? b.levelAt(date, R.dayNumOf(date)) : null; out = 50;
      for (let att = 0; att < 3; att++) { const r = b.bot(L, p.fam, mulberry(hash(base + ':' + att)), st.eps, date); if (r && r.won) { out = Math.max(50, Math.round(r.score) - 150 * att); break; } }
    }
    S.cache[ck] = out; const keys = Object.keys(S.cache); if (keys.length > 400) keys.sort().slice(0, keys.length - 300).forEach((k) => delete S.cache[k]); save(S); return out;
  };
  R.myDay = (boardId, date) => ((load().day[boardId] || {})[date]) || null;
  R.myBest = (boardId, dates) => dates.reduce((a, d) => Math.max(a, R.myDay(boardId, d) || 0), 0) || null;
  /** 한 칸 순위표: scope 'day' | 'week'. 반환 [{p|me, score|null, rank|null}] */
  R.rows = function (boardId, scope) {
    const today = R.today(), dates = scope === 'week' ? weekDays(today) : [today], rows = PLAYERS.map((p) => { let best = null; dates.forEach((d) => { const s = R.famScore(boardId, d, p); if (s != null && (best == null || s > best)) best = s; }); return { p, name: p.name, score: best }; });
    rows.push({ me: true, name: '나', score: R.myBest(boardId, dates) });
    const scored = rows.filter((r) => r.score != null).sort((a, b) => b.score - a.score || (a.me ? -1 : 0)); scored.forEach((r, i) => { r.rank = i + 1; });
    return scored.concat(rows.filter((r) => r.score == null));
  };
  /** 이겼을 때만 한 줄(가장 높은 점수의 이긴 상대) — 지면 null, 압박 문구 없음 */
  R.beatLine = function (rows, scope) {
    const me = rows.find((r) => r.me); if (!me || me.score == null) return null; const beat = rows.filter((r) => !r.me && r.score != null && r.score < me.score).sort((a, b) => b.score - a.score)[0]; if (!beat) return null;
    return (scope === 'week' ? '이번 주는 ' : '오늘은 ') + beat.name + josa(beat.name) + (scope === 'week' ? ' 앞서고 있어요!' : ' 이겼어요!');
  };
  R.myRank = (boardId, scope) => { const me = R.rows(boardId, scope).find((r) => r.me); return me && me.rank || null; };
  /** 점수를 기록한다: 내 기록 10개·그날 최고 → 이긴 한 줄·주간 1위 보상. 돌려주는 값 {line, reward, rank} */
  R.record = function (boardId, score) {
    if (!R.ready || score == null) return null; const S = load(), t = R.today(), b = (S.top[boardId] = S.top[boardId] || []), dd = (S.day[boardId] = S.day[boardId] || {});
    b.push({ s: Math.round(score), d: t }); b.sort((x, y) => y.s - x.s || y.d - x.d); S.top[boardId] = b.slice(0, 10); dd[t] = Math.max(dd[t] || 0, Math.round(score)); Object.keys(dd).sort().slice(0, Math.max(0, Object.keys(dd).length - 40)).forEach((k) => delete dd[k]); save(S);
    if (GF.board) GF.board.submit(boardId, Math.round(score));   // Google Play 게임즈(꺼짐·no-op)
    const rowsD = R.rows(boardId, 'day'), line = R.beatLine(rowsD, 'day'), out = { line, rank: (rowsD.find((r) => r.me) || {}).rank, reward: null };
    const rowsW = R.rows(boardId, 'week'), me = rowsW.find((r) => r.me), wk = String(R.weekStart(t)) + ':' + boardId, S2 = load();
    if (me && me.rank === 1 && rowsW.filter((r) => r.score != null).length > 1 && !S2.claimed[wk] && GF.extras && GF.extras.cfg && window.Room) { const id = (GF.extras.cfg.rewardItems || []).find((i) => !Room.has(i)); if (id && Room.grant(id)) { S2.claimed[wk] = id; save(S2); out.reward = id; } }
    return out;
  };
  /** 다시 하기 횟수(오늘의 한 판에서 「다시」 누른 횟수): 가족 봇과 같은 식에 들어간다 */
  R.noteTry = (boardId) => { if (!R.ready) return; const S = load(), k = boardId + ':' + R.today(); S.tries[k] = (S.tries[k] || 0) + 1; save(S); };
  R.attempts = (boardId) => 1 + ((load().tries[boardId + ':' + R.today()]) || 0);
  R.clearTries = (boardId) => { if (!R.ready) return; const S = load(); delete S.tries[boardId + ':' + R.today()]; save(S); };
  /** 기록 직후 알림: 이긴 한 줄·보상(토스트). 지면 아무 문구도 없음 */
  R.announce = function (res, parent) {
    if (!res) return; const p = parent || document.getElementById('safe'); let d = 300;
    if (res.line) { setTimeout(() => { try { UK.toast(res.line, p); GF.sfx('star'); } catch (e) {} }, d); d += 1600; }
    if (res.reward) setTimeout(() => { try { const it = Room.item(res.reward); UK.toast('이번 주 1위! 집 소품을 받았어요' + (it ? ' · ' + it.name : ''), p); GF.sfx('celebrate'); } catch (e) {} }, d);
  };

  /* ---------------- UI(키트 시트) ---------------- */
  const FAMC = ['#E8870F', '#2F8FD0', '#3B4A7A'];
  function rowEl(parent, r) {
    const d = el('div', 'rk-row' + (r.me ? ' me' : '') + (r.rank === 1 ? ' first' : ''), parent), a = el('div', 'rk-a', d);
    if (r.p) { a.style.backgroundImage = 'url("' + GF.src(r.p.img) + '")'; a.style.boxShadow = '0 0 0 3px ' + FAMC[r.p.fam]; } else { a.textContent = '🙂'; a.classList.add('me'); }
    el('b', 'rk-n', d, (r.rank ? r.rank + '. ' : '') + r.name); el('span', 'rk-s', d, r.score == null ? (r.me ? '아직' : '쉬는 날') : String(r.score)); return d;
  }
  R.open = function (boardId, tab) {
    if (!R.ready) return; const b = R.cfg.boards[boardId]; tab = tab || 'day';
    const sc = UK.modal({ title: b.title + ' 순위표', dismiss: true, parent: document.getElementById('safe') }), sh = sc.querySelector('.uk-sheet'); sh.classList.add('xt-sheet', 'rk-sheet');
    const tabs = el('div', 'rk-tabs', sh), body = el('div', 'rk-body', sh), note = el('small', 'xt-note rk-note', sh), acts = el('div', 'acts row', sh); UK.btn({ text: '닫기', cls: 'ghost', onclick: () => sc.close() }, acts);
    const draw = (t) => {
      tabs.innerHTML = ''; body.innerHTML = ''; note.textContent = ''; [['day', '오늘'], ['week', '이번 주'], ['mine', '내 기록']].forEach(([k, n]) => { const x = el('button', 'rk-tab' + (k === t ? ' on' : ''), tabs, n); x.onclick = () => { GF.sfx('tap'); draw(k); }; });
      if (t === 'mine') { const top = (load().top[boardId]) || []; if (!top.length) el('p', 'xt-p', body, '아직 기록이 없어요.'); top.forEach((r, i) => { const d = el('div', 'rk-row' + (i === 0 ? ' first' : ''), body); el('b', 'rk-n', d, (i + 1) + '. ' + String(r.d).replace(/^(\d{4})(\d{2})(\d{2})$/, '$1.$2.$3')); el('span', 'rk-s', d, String(r.s)); }); return; }
      const rows = R.rows(boardId, t), line = R.beatLine(rows, t); if (line) el('div', 'rk-line', body, line);
      rows.forEach((r) => rowEl(body, r)); note.textContent = t === 'week' ? '월요일에 새로 시작해요. 한 주 동안 가장 높은 점수로 겨뤄요.' : '네모·세모·동그라미 식구들이 각자 규칙으로 낸 오늘의 점수예요.';
    };
    draw(tab); return sc;
  };
  R.boards = () => Object.keys(R.cfg.boards).map((id) => ({ id, title: R.cfg.boards[id].title }));
  R.init = function (cfg) { R.cfg = cfg; R.ready = true; };
  /** 결과 화면에 「순위표 보기」 한 줄을 끼운다: 앱이 UK.result 를 부르기 직전에 GF.rank.resultBoard = 보드 id */
  R.resultBoard = null;
  const _result = UK.result;
  UK.result = function (o) {
    const sc = _result.call(UK, o), id = R.resultBoard; R.resultBoard = null;
    try { if (id && R.ready) { const acts = sc.querySelector('.acts'); if (acts) { const b = UK.btn({ text: '순위표 보기', icon: 'star', cls: 'sky', onclick: () => R.open(id) }, acts); acts.insertBefore(b, acts.firstChild); } } } catch (e) {}
    return sc;
  };
})();
