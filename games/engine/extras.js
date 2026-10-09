/* 공통 부가 UI GF.extras — 설정·보호자 메뉴·통계·업적(배지)·출석 도장·도움말 다시 보기·큰 글씨·쉬어요 알림(games/15_GENRE_GAP.md 「엔진·키트에 한 번에 넣을 공통 항목」).
   원칙: 압박 없음(출석은 끊겨도 잃는 것 없음·연속 일수 없음, 업적은 보상 압박 없음) · 뽑기 없음 · 서버 없음 · 유아 앱은 글자 없는 놀이 화면 그대로(보호자 메뉴만 글자, 구구단 잠금 뒤).
   각 앱은 start() 에서 Room.init 다음에 GF.extras.init({...}) 를 한 번 부른다.
   cfg: { app, kid, stats:()=>[[이름,값]…], badges:[{id,icon,name,desc,ok}], rewardItems:[아이템 id…], resetTips(), reset() } */
(function () {
  'use strict';
  const el = UK.el;
  const X = (GF.extras = { ready: false, cfg: null });
  const LS = (k, v) => { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} return null; };
  const pad = (n) => String(n).padStart(2, '0'), ymd = (d) => d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
  const key = () => 'gf:' + X.cfg.app + ':x';
  const load = () => Object.assign({ days: [], claimed: 0, badges: [] }, LS(key()) || {});
  const save = (s) => LS(key(), s);
  const S = () => GF.state.settings;
  const persist = () => { if (GF.save) GF.save(); };
  function applyBig() { document.documentElement.dataset.big = S().big ? '1' : '0'; }

  /* 진동: 성인 앱만(유아 앱엔 VIBRATE 권한이 없다). 소리 id 에 맞춰 아주 짧게 */
  const HAP = { drop: 10, pick: 6, ok: 18, star: [18, 40, 22], hmm: 32, celebrate: [20, 40, 20, 40, 30] };
  GF.haptic = function (id) { if (!X.ready || !X.cfg || X.cfg.kid || S().vib === false || !navigator.vibrate) return; const p = HAP[id]; if (p) { try { navigator.vibrate(p); } catch (e) {} } };
  /** 시트(팝업) 하나를 열고 본문 노드를 돌려 준다 */
  function sheet(title) {
    const sc = UK.modal({ title, dismiss: true, parent: document.getElementById('safe') }), sh = sc.querySelector('.uk-sheet'); sh.classList.add('xt-sheet');
    const body = el('div', 'xt-body', sh); const close = el('div', 'acts row', sh); UK.btn({ text: '닫기', cls: 'ghost', onclick: () => sc.close() }, close);
    return { sc, sh, body };
  }
  const row = (parent, label, node) => { const r = el('div', 'xt-row', parent); el('span', '', r, label); if (node) r.appendChild(node); return r; };
  const tbtn = (text, fn) => { const b = el('button', 'xt-btn', null, text); b.onclick = fn; return b; };

  /** 설정(성인) / 보호자 메뉴(유아) */
  function openSettings(kind) {
    const c = X.cfg, kid = !!c.kid, { sc, body } = sheet(kid ? '보호자 메뉴' : '설정'), s = S();
    row(body, '소리', UK.switch(!s.mute, (on) => { s.mute = !on; persist(); GF.refreshBar && GF.refreshBar(); GF.bgm && GF.bgm.sync && GF.bgm.sync(); }));
    const rg = el('input', 'xt-range'); rg.type = 'range'; rg.min = 0; rg.max = 1; rg.step = 0.1; rg.value = s.vol; rg.oninput = () => { s.vol = +rg.value; persist(); GF.bgm && GF.bgm.sync && GF.bgm.sync(); GF.sfx('tap'); }; row(body, '소리 크기', rg);
    row(body, '자막', UK.switch(!s.capOff, (on) => { s.capOff = !on; persist(); }));
    if (!kid && navigator.vibrate) row(body, '진동', UK.switch(s.vib !== false, (on) => { s.vib = on; persist(); if (on) GF.haptic('ok'); }));
    if (!kid) row(body, '큰 글씨', UK.switch(!!s.big, (on) => { s.big = on ? 1 : 0; persist(); applyBig(); }));
    if (kid) {   // 쉬어요 알림: 보호자가 정하는 놀이 시간 알림(아이에게 압박 없음, 설정 안 하면 없음)
      const opts = [0, 10, 20, 30], b = tbtn(s.rest ? s.rest + '분' : '끔', () => { const i = (opts.indexOf(s.rest || 0) + 1) % opts.length; s.rest = opts[i]; b.textContent = s.rest ? s.rest + '분' : '끔'; persist(); X.restReset(); }); row(body, '쉬어요 알림', b);
      if (c.stats) { el('h4', 'xt-h', body, '오늘까지 놀이 요약'); c.stats().forEach((r) => row(body, r[0], el('b', '', null, String(r[1])))); }
    } else {
      row(body, '통계', tbtn('보기', () => { sc.close(); openStats(); }));
      if (c.badges && c.badges.length) row(body, '업적', tbtn(badgeCount() + '/' + c.badges.length, () => { sc.close(); openBadges(); }));
      if (c.rewardItems && c.rewardItems.length) row(body, '출석 도장', tbtn('보기', () => { sc.close(); openAttend(); }));
    }
    if (!kid && GF.tale && GF.tale.ready) { if (GF.tale.d.rules) row(body, '도움말', tbtn('판 종류 설명', () => { sc.close(); GF.tale.help(); })); row(body, '이야기 다시 보기', tbtn('다시 보기', () => { GF.tale.reset(); UK.toast('프롤로그와 장 이야기가 다시 나와요', document.getElementById('safe')); })); }
    if (c.resetTips) row(body, '도움말 다시 보기', tbtn('다시 보기', () => { c.resetTips(); GF.toast ? GF.toast('다음 판에서 도움말이 다시 나와요') : UK.toast('다음 판에서 도움말이 다시 나와요', document.getElementById('safe')); }));
    if (c.reset) { let armed = false; const b = tbtn('지우기', () => { if (!armed) { armed = true; b.textContent = '한 번 더'; return; } c.reset(); try { localStorage.removeItem(key()); } catch (e) {} location.reload(); }); row(body, '이 앱 기록 지우기(집은 그대로)', b); }
    const ads = GF.ads && GF.ads.config.enabled && !kid;
    el('small', 'xt-note', body, kid ? '이 앱은 이름·사진·위치·기기 정보를 수집하지 않고, 광고와 결제가 없으며, 인터넷에 연결하지 않습니다. 기록은 이 기기 안에만 저장됩니다.' : (ads ? '선택해서 보는 광고가 있어요. 보지 않아도 불이익은 없어요. 기록은 이 기기 안에만 저장돼요.' : '광고·결제·서버·가입 없이 이 기기 안에서만 돌아가요.'));
  }
  function openStats() { const { sc, body } = sheet('통계'); (X.cfg.stats ? X.cfg.stats() : []).forEach((r) => row(body, r[0], el('b', '', null, String(r[1])))); if (GF.rank && GF.rank.ready) GF.rank.boards().forEach((b) => row(body, b.title + ' 순위표', tbtn('보기', () => { sc.close(); GF.rank.open(b.id); }))); }

  /* ---------------- 업적(배지): 보상 압박 없이 모아 보기 ---------------- */
  function earned() { const s = load(); return X.cfg.badges.filter((b) => s.badges.includes(b.id)); }
  function badgeCount() { const s = load(); return X.cfg.badges.filter((b) => s.badges.includes(b.id) || safe(b.ok)).length; }
  const safe = (fn) => { try { return !!fn(); } catch (e) { return false; } };
  /** 새로 달성한 업적이 있으면 알려 준다(결과 화면 뒤 등에서 앱이 부름). 돌려주는 값: 새 업적 배열 */
  X.check = function (quiet) {
    if (!X.ready || !X.cfg.badges) return []; const s = load(), fresh = X.cfg.badges.filter((b) => !s.badges.includes(b.id) && safe(b.ok));
    if (fresh.length) { fresh.forEach((b) => s.badges.push(b.id)); save(s); if (!quiet) fresh.slice(0, 2).forEach((b, i) => setTimeout(() => { try { UK.toast(b.icon + ' 업적: ' + b.name, document.getElementById('safe')); GF.sfx('star'); } catch (e) {} }, 400 + i * 1300)); }
    return fresh;
  };
  function openBadges() {
    X.check(true); const s = load(), { body } = sheet('업적 ' + s.badges.length + '/' + X.cfg.badges.length), g = el('div', 'xt-badges', body);
    X.cfg.badges.forEach((b) => { const got = s.badges.includes(b.id), d = el('div', 'xt-bd' + (got ? ' on' : ''), g); el('div', 'ic', d, got ? b.icon : '🔒'); el('b', '', d, b.name); el('small', '', d, b.desc); });
  }

  /* ---------------- 출석 도장: 끊겨도 잃는 것 없음, 도장 5개마다 집 소품 1개(확정 지급) ---------------- */
  X.attend = function () { if (!X.ready || X.cfg.kid) return; const s = load(), t = ymd(new Date()); if (!s.days.includes(t)) { s.days.push(t); s.days = s.days.slice(-400); save(s); } };
  function nextItem() { const c = X.cfg; return (c.rewardItems || []).find((id) => window.Room && !Room.has(id)); }
  function openAttend() {
    X.attend(); const s = load(), now = new Date(), y = now.getFullYear(), m = now.getMonth(), { body } = sheet(y + '년 ' + (m + 1) + '월 출석 도장');
    const cal = el('div', 'xt-cal', body); ['일', '월', '화', '수', '목', '금', '토'].forEach((d) => el('i', 'h', cal, d));
    const first = new Date(y, m, 1).getDay(), last = new Date(y, m + 1, 0).getDate(); for (let i = 0; i < first; i++) el('i', '', cal, '');
    for (let d = 1; d <= last; d++) { const on = s.days.includes(y * 10000 + (m + 1) * 100 + d); el('i', 'd' + (on ? ' on' : '') + (d === now.getDate() ? ' today' : ''), cal, on ? '⭐' : String(d)); }
    const total = s.days.length, earnedN = Math.floor(total / 5), can = earnedN > s.claimed, it = nextItem();
    el('p', 'xt-p', body, '도장 ' + total + '개 · 5개마다 집 소품 1개. 쉬어도 도장은 그대로예요.');
    if (it) { const ri = Room.item(it); const b = el('button', 'xt-claim' + (can ? ' on' : ''), body, can ? '🎁 ' + (ri ? ri.name : '소품') + ' 받기' : '다음 소품까지 ' + (5 - (total % 5)) + '개'); b.disabled = !can; b.onclick = () => { if (!can) return; if (Room.grant(it)) { s.claimed++; save(s); GF.sfx('star'); b.textContent = '받았어요!'; b.disabled = true; GF.refreshBar && GF.refreshBar(); } }; }
    else el('p', 'xt-p', body, '이 앱의 소품을 모두 모았어요.');
  }

  /* ---------------- 쉬어요 알림(유아, 보호자가 정함) ---------------- */
  let restT = null, restStart = 0;
  X.restReset = function () { restStart = Date.now(); };
  function restTick() {
    const m = S().rest; if (!m || document.hidden || document.getElementById('xt-rest')) return;
    if (Date.now() - restStart >= m * 60000) {
      const o = el('div', 'xt-rest', document.getElementById('safe')); o.id = 'xt-rest'; el('div', 'moon', o, '🌙'); el('div', 'z', o, '😴');
      const b = el('button', 'xt-restbtn', o, UK.icon('lock')); b.setAttribute('aria-label', 'continue'); b.onclick = () => GF.gate(() => { o.remove(); X.restReset(); });
    }
  }

  /** 보호자 메뉴 열기(유아): 제목을 3초 길게 누르면 구구단 잠금 뒤에 열린다 */
  function kidHold() {
    let t = null; const stop = () => { clearTimeout(t); t = null; };
    document.addEventListener('pointerdown', (e) => { const x = e.target && e.target.closest && e.target.closest('.uk-title'); if (!x) return; stop(); t = setTimeout(() => GF.gate(() => openSettings('parent')), 3000); }, true);
    ['pointerup', 'pointercancel', 'pointerleave'].forEach((ev) => document.addEventListener(ev, stop, true));
  }

  X.tick = restTick; X._back = (ms) => { restStart -= ms; };   // 시험용

  /* ---------------- 판 이어하기: 앱을 나갔다 와도 하던 판의 상태에서 다시 시작(되돌리기 기록만 사라짐) ---------------- */
  const rkey = () => 'gf:' + X.cfg.app + ':resume';
  X.resumeSave = function (S, id) { if (!X.ready) return; try { const o = {}; Object.keys(S).forEach((k) => { if (k !== 'L' && typeof S[k] !== 'function') o[k] = S[k]; }); LS(rkey(), { id, S: o }); } catch (e) {} };
  X.resumeLoad = function (S, id) { if (!X.ready || window.__noResume) return false; const d = LS(rkey());   // window.__noResume: 자동 시험이 같은 판을 새로 시작할 때 쓰는 끔 스위치
   if (!d || d.id !== id || !d.S) return false; Object.keys(d.S).forEach((k) => { S[k] = d.S[k]; }); return true; };
  X.resumeClear = function () { if (X.ready) { try { localStorage.removeItem(rkey()); } catch (e) {} } };
  /** 레벨 목록 맨 위: 별을 다 못 모은 판이 있으면 가장 앞 판으로 가는 부담 없는 버튼 */
  X.retryBanner = function (parent, stars, go) {
    const ids = Object.keys(stars || {}).map(Number).filter((n) => stars[n] > 0 && stars[n] < 3).sort((a, b) => a - b); if (!ids.length) return null;
    const w = el('div', 'xt-retry', parent), b = UK.btn({ text: '별 더 모으기 · ' + ids.length + '판', icon: 'star', cls: 'gold block', onclick: () => { GF.sfx('pick'); go(ids[0]); } }, w); return b;
  };
  X.open = openSettings; X.openStats = openStats; X.openBadges = openBadges; X.openAttend = openAttend;
  X.init = function (cfg) {
    X.cfg = cfg; X.ready = true; applyBig(); const adult = !cfg.kid;
    if (cfg.rewardSet && !cfg.rewardItems && window.Room && Room.data && Room.data.items) cfg.rewardItems = Room.data.items.filter((i) => i.set === cfg.rewardSet).map((i) => i.id);
    if (adult) {   // 상단 바에 ⚙ 한 개(어느 화면에서나)
      const bar = document.getElementById('topbar'), snd = document.getElementById('b-sound');
      if (bar && snd && !document.getElementById('b-set')) { const b = el('button', 'round-btn'); b.id = 'b-set'; b.setAttribute('aria-label', 'settings'); b.innerHTML = UK.icon('gear'); b.onclick = () => { GF.sfx('tap'); openSettings(); }; bar.insertBefore(b, snd); const g = snd.previousElementSibling; }
      X.attend(); setTimeout(() => X.check(true), 600);
    } else { if (!cfg.noHold) kidHold(); X.restReset(); restT = restT || setInterval(restTick, 20000); }
  };
  /** 별 지도(stars) 앱 공통 통계·업적 묶음 만들기(③⑥⑦⑧⑨) */
  X.levelApp = function (o) {
    const SV = o.SV, stars = () => Object.entries(SV().stars || {}), done = () => stars().filter((e) => e[1] > 0).length, sum = () => stars().reduce((a, e) => a + e[1], 0), full = () => stars().filter((e) => e[1] >= 3).length;
    const items = () => (window.Room ? Room.owned().filter((id) => (Room.item(id) || {}).set === o.roomSet).length : 0);
    return {
      stats: () => [['깬 판', done() + ' / ' + o.total], ['별', sum() + ' / ' + o.total * 3], ['별 3개 판', full()], ['집 소품', items() + ' / ' + o.itemTotal], ['오늘의 한 판 도장', (SV().shards || 0)], ['세 가족 판', Object.keys(SV().trio || {}).length + ' / 3']],
      badges: [
        { id: 'p1', icon: o.icon || '🌟', name: '첫 걸음', desc: '첫 판을 깼어요', ok: () => done() >= 1 },
        { id: 'p10', icon: '🎈', name: '열 판', desc: '10판을 깼어요', ok: () => done() >= 10 },
        { id: 'p30', icon: '🎀', name: '서른 판', desc: '30판을 깼어요', ok: () => done() >= 30 },
        { id: 'p60', icon: '🏅', name: '예순 판', desc: '60판을 깼어요', ok: () => done() >= 60 },
        { id: 'p120', icon: '👑', name: '끝까지', desc: o.total + '판을 모두 깼어요', ok: () => done() >= o.total },
        { id: 's3', icon: '⭐', name: '별 세 개', desc: '별 3개 판이 10개예요', ok: () => full() >= 10 },
        { id: 'r10', icon: '🏠', name: '집이 북적', desc: '집 소품 10개', ok: () => items() >= 10 },
        { id: 'r20', icon: '🛋️', name: '세트 완성', desc: '이 앱의 집 소품을 모두 모았어요', ok: () => items() >= o.itemTotal },
        { id: 'd1', icon: '📅', name: '오늘의 한 판', desc: '오늘의 한 판을 깼어요', ok: () => (SV().shards || 0) >= 1 },
        { id: 'tr', icon: '💞', name: '세 가족', desc: '세 가족 규칙 판을 모두 깼어요', ok: () => Object.keys(SV().trio || {}).length >= 3 },
      ],
    };
  };
})();
