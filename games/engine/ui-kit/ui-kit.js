/* 기하학 가족 공통 UI 키트 — JS. window.UK. 엔진(GF)이 있으면 효과음·꽃가루를 빌려 쓰고, 없으면(쇼케이스) 조용히 넘어간다. */
(function () {
  'use strict';
  const el = (tag, cls, parent, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; };
  const host = () => document.getElementById('safe') || document.body;
  const sfx = (n) => { try { window.GF && GF.sfx && GF.sfx(n); } catch (e) {} };
  const P = '#FF8FA8', G = '#FFC933', INK = '#3A2E39', GR = '#6CCB8A', SKY = '#8FD3F4';
  const s = (body) => '<svg viewBox="0 0 32 32">' + body + '</svg>';
  const stroke = (d, c, w) => `<path d="${d}" fill="none" stroke="${c || INK}" stroke-width="${w || 3.4}" stroke-linecap="round" stroke-linejoin="round"/>`;
  /* 아이콘 세트: 32×32, 둥글고 두꺼운 선, 색은 분홍·금·초록·잉크만 */
  const ICONS = {
    home: s(`<path d="M4 16 16 5l12 11v11h-8v-8h-8v8H4z" fill="${P}"/>`),
    back: s(stroke('M19 5 8 16l11 11', 'currentColor', 6)),
    next: s(stroke('M13 5l11 11-11 11', 'currentColor', 6)),
    play: s(`<path d="M10 5l17 11-17 11z" fill="currentColor" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>`),
    replay: s(stroke('M26 16a10 10 0 1 1-4-8M26 5v6h-6', 'currentColor', 3.6)),
    sound: s(`<path d="M4 12h6l7-6v20l-7-6H4z" fill="${INK}"/>` + stroke('M21 11a7 7 0 0 1 0 10M24 7a12 12 0 0 1 0 18', INK, 3)),
    mute: s(`<path d="M4 12h6l7-6v20l-7-6H4z" fill="${INK}"/>` + stroke('M22 11l7 10M29 11l-7 10', INK, 3)),
    star: s(`<path d="M16 3l3.9 8.1 8.9 1.2-6.5 6.2 1.7 8.8L16 23l-8 4.3 1.7-8.8L3.2 12.3l8.9-1.2z" fill="${G}" stroke="#C99A00" stroke-width="1.6" stroke-linejoin="round"/>`),
    heart: s(`<path d="M16 28C5 20 3 11 9 7c3-2 6 0 7 3 1-3 4-5 7-3 6 4 4 13-7 21z" fill="${P}" stroke="#D95F7C" stroke-width="1.6" stroke-linejoin="round"/>`),
    lock: s(`<rect x="7" y="14" width="18" height="14" rx="4" fill="${G}" stroke="#C99A00" stroke-width="1.6"/>` + stroke('M11 14v-3a5 5 0 0 1 10 0v3', '#C99A00', 3)),
    check: s(stroke('M6 17l7 7 13-14', 'currentColor', 5)),
    close: s(stroke('M8 8l16 16M24 8L8 24', INK, 4)),
    gear: s(`<circle cx="16" cy="16" r="5" fill="none" stroke="${INK}" stroke-width="3.4"/>` + stroke('M16 3v4M16 25v4M3 16h4M25 16h4M7 7l3 3M22 22l3 3M25 7l-3 3M10 22l-3 3', INK, 3.4)),
    gift: s(`<rect x="5" y="12" width="22" height="15" rx="3" fill="${P}"/><rect x="3" y="9" width="26" height="6" rx="2" fill="${G}"/><rect x="14" y="9" width="4" height="18" fill="#fff"/>` + stroke('M16 9c-5-6-9 0-4 0M16 9c5-6 9 0 4 0', INK, 2.4)),
    book: s(`<path d="M4 7c4-2 8-2 12 1v18c-4-3-8-3-12-1z" fill="${P}"/><path d="M28 7c-4-2-8-2-12 1v18c4-3 8-3 12-1z" fill="${G}"/>`),
    shapes: s(`<rect x="3" y="4" width="12" height="12" rx="3" fill="#F6C28B"/><path d="M24 4l6 11H18z" fill="${SKY}"/><circle cx="9" cy="24" r="6" fill="#3B4A7A"/><rect x="18" y="19" width="11" height="9" rx="3" fill="${GR}"/>`),
    brush: s(`<path d="M25 4c3 0 4 1 3 3L16 20l-4-4z" fill="${G}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 16c-5 0-4 6-7 8 5 3 11 1 11-4z" fill="${P}" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>`),
    share: s(`<circle cx="8" cy="16" r="4" fill="${P}"/><circle cx="24" cy="8" r="4" fill="${G}"/><circle cx="24" cy="24" r="4" fill="${GR}"/>` + stroke('M11.5 14l9-4.5M11.5 18l9 4.5', INK, 2.4)),
    info: s(`<circle cx="16" cy="16" r="12" fill="${SKY}"/>` + stroke('M16 14v8', INK, 3.6) + `<circle cx="16" cy="9.5" r="2" fill="${INK}"/>`),
    plus: s(stroke('M16 6v20M6 16h20', 'currentColor', 5)),
  };
  const UK = (window.UK = {
    icons: ICONS,
    icon: (name) => ICONS[name] || '',
    /** 아이콘 슬롯: UK.useIcons({home:'<svg…>', …}) — 받은 SVG 문자열로 같은 이름의 코드 아이콘을 교체 */
    useIcons(map) { Object.keys(map || {}).forEach((k) => { ICONS[k] = map[k]; }); },
    /** 모드 전환: 'kid' | 'adult' (html[data-uk]) */
    mode(m) { if (m) document.documentElement.setAttribute('data-uk', m); return document.documentElement.getAttribute('data-uk') || 'kid'; },
    el,
    /** 버튼: UK.btn({text, icon, cls:'pink', onclick}) */
    btn(o, parent) { const b = el('button', 'uk-btn ' + (o.cls || ''), parent, (o.icon ? ICONS[o.icon] : '') + (o.text != null ? '<span>' + o.text + '</span>' : '')); if (o.onclick) b.onclick = (e) => { sfx('tap'); o.onclick(e); }; return b; },
    round(o, parent) { const b = el('button', 'uk-round ' + (o.cls || ''), parent, ICONS[o.icon] || ''); b.setAttribute('aria-label', o.label || o.icon); if (o.onclick) b.onclick = (e) => { sfx('tap'); o.onclick(e); }; return b; },
    /** 별 알약(상단 바): UK.pill('star', 12) */
    pill(icon, text, parent) { return el('div', 'uk-pill', parent, (ICONS[icon] || '') + '<span>' + text + '</span>'); },
    /** 상단 바 한 벌: 왼쪽 [뒤로·홈], 가운데 별 알약, 오른쪽 소리. 반환 {bar, stars, sound} */
    topbar(o, parent) {
      o = o || {}; const bar = el('div', 'uk-topbar', parent), l = el('div', 'uk-grp', bar);
      if (o.back !== false) UK.round({ icon: 'back', cls: 'tb-back', onclick: o.onBack || (() => window.GF && GF.back && GF.back()) }, l);
      if (o.home !== false) UK.round({ icon: 'home', cls: 'tb-home', onclick: o.onHome || (() => window.GF && GF.home2 && GF.home2()) }, l);
      const stars = o.stars != null ? UK.pill(o.icon || 'star', o.stars, bar) : el('span', '', bar);
      const snd = UK.round({ icon: o.muted ? 'mute' : 'sound', onclick: o.onSound }, bar);
      return { bar, stars, sound: snd };
    },
    toast(msg, parent) { const t = el('div', 'uk-toast', parent || host(), msg); setTimeout(() => t.remove(), 2300); return t; },
    /** 팝업: UK.modal({title, body, big, chips:[{icon,text}], actions:[{text,cls,onclick,keep}], row, dismiss}) */
    modal(o) {
      const sc = el('div', 'uk-scrim', o.parent || host()), sh = el('div', 'uk-sheet', sc);
      if (o.title) el('h2', '', sh, o.title);
      if (o.stars != null) sh.appendChild(UK.stars(o.stars, o.max || 3));
      if (o.big) el('div', 'uk-big', sh, o.big);
      if (o.body) el('div', 'body', sh, o.body);
      if (o.chips) { const c = el('div', 'uk-chips', sh); o.chips.forEach((x) => el('span', 'uk-chip', c, (ICONS[x.icon] || '') + '<span>' + x.text + '</span>')); }
      const close = () => sc.remove();
      if (o.actions) { const a = el('div', 'acts' + (o.row ? ' row' : ''), sh); o.actions.forEach((x) => UK.btn({ text: x.text, icon: x.icon, cls: x.cls, onclick: () => { if (!x.keep) close(); x.onclick && x.onclick(); } }, a)); }
      if (o.dismiss) sc.addEventListener('pointerdown', (e) => { if (e.target === sc) close(); });
      sc.close = close; return sc;
    },
    /** 별 0~max 줄 */
    stars(n, max) { const d = el('div', 'uk-stars'); for (let i = 0; i < (max || 3); i++) { const w = el('div'); w.innerHTML = ICONS.star; const sv = w.firstChild; if (i < n) sv.classList.add('on'); d.appendChild(sv); } return d; },
    /** 결과 화면(스테이지·레벨 끝): UK.result({title, stars, chips, onNext, onRetry, onHome}) — 유아는 글자 대신 아이콘 버튼만 쓰게 kid:true */
    result(o) {
      const acts = [];
      if (o.kid) { const sc = UK.modal({ title: o.title, stars: o.stars, chips: o.chips, parent: o.parent }); const a = el('div', 'acts row', sc.firstChild);
        if (o.onRetry) UK.round({ icon: 'replay', cls: 'lg pink', onclick: () => { sc.close(); o.onRetry(); } }, a);
        if (o.onNext) UK.round({ icon: 'next', cls: 'lg', onclick: () => { sc.close(); o.onNext(); } }, a);
        a.style.justifyContent = 'center'; UK.confetti(sc); sfx('celebrate'); return sc; }
      if (o.onNext) acts.push({ text: o.nextText || '다음', cls: 'green', icon: 'next', onclick: o.onNext });
      if (o.onRetry) acts.push({ text: o.retryText || '다시', cls: 'ghost', icon: 'replay', onclick: o.onRetry });
      if (o.onHome) acts.push({ text: o.homeText || '처음으로', cls: 'ghost', icon: 'home', onclick: o.onHome });
      const sc = UK.modal({ title: o.title, stars: o.stars, body: o.body, big: o.big, chips: o.chips, actions: acts, parent: o.parent }); UK.confetti(sc); sfx('celebrate'); return sc;
    },
    confetti(parent) {
      const c = el('div', 'uk-confetti', parent || host()), cols = ['#FF8FA8', '#FFC933', '#6CCB8A', '#8FD3F4', '#F6C28B'];
      for (let i = 0; i < 28; i++) { const p = el('i', '', c); p.style.left = Math.random() * 100 + '%'; p.style.background = cols[i % cols.length]; p.style.animationDelay = Math.random() * 0.5 + 's'; p.style.animationDuration = 1.2 + Math.random() * 0.9 + 's'; }
      c.style.cssText = 'position:absolute;inset:0;overflow:hidden;pointer-events:none;z-index:99'; setTimeout(() => c.remove(), 2600); return c;
    },
    /** 설정 한 줄들: UK.settings(parent, {sound:true, onSound, captions:true, onCaptions, extra:[{label, node}]}) */
    switch(on, onChange) { const b = el('button', 'uk-switch' + (on ? ' on' : '')); b.setAttribute('role', 'switch'); b.onclick = () => { const v = !b.classList.contains('on'); b.classList.toggle('on', v); sfx('tap'); onChange && onChange(v); }; return b; },
    settings(parent, o) {
      const p = el('div', 'uk-panel', parent); el('h4', '', p, o.title || '설정');
      const row = (label, node) => { const r = el('div', 'uk-row', p); el('span', '', r, label); r.appendChild(node); return r; };
      if (o.sound !== false) row('소리', UK.switch(o.soundOn !== false, o.onSound));
      if (o.captions !== false) row('자막', UK.switch(o.captionsOn !== false, o.onCaptions));
      (o.extra || []).forEach((x) => row(x.label, x.node));
      return p;
    },
  });
})();
