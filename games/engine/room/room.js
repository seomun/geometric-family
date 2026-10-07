/* 기하학 가족의 집 — 공유 룸 모듈 (docs/17). 다섯 앱이 같은 모듈을 쓴다 → 꾸미기 화면이 전부 똑같이 생긴다.
   저장은 "얻은 아이템 id 목록 + 놓은 위치"뿐(이름·사진·기기 ID 없음). 앱 간 공유는 APK 단계에서 같은 서명의 공유 저장소(안 A)로 store 를 바꿔 끼우고,
   지금은 localStorage + 선물/굿즈 코드(안 B). 유아 앱은 자기 세트(아이 방)만 보이고, 다른 세트는 보호자 잠금 뒤 "가족 집"에서 잠긴 실루엣만.
   의존: UK(ui-kit), RoomArt(room-art.js). */
(function () {
  'use strict';
  const el = (t, c, p, h) => { const e = document.createElement(t); if (c) e.className = c; if (h != null) e.innerHTML = h; if (p) p.appendChild(e); return e; };
  const RW = 340, RH = 270, FLOOR = 150;                    // 방 논리 크기, 뒷벽이 끝나는 높이
  const defaultStore = {
    key: 'gf:house:v1',
    get() { try { return JSON.parse(localStorage.getItem(this.key)); } catch (e) { return null; } },
    set(v) { try { localStorage.setItem(this.key, JSON.stringify(v)); } catch (e) {} },
  };
  const Room = (window.Room = {
    cfg: { game: 'merge', mode: 'adult', store: defaultStore, charSrc: null, guard: (cb) => cb(), onSetComplete: null, onGrant: null },
    data: null, S: null, family: false,
    init(o) {
      Object.assign(Room.cfg, o || {}); Room.data = o.data;
      const s = Room.cfg.store.get();
      Room.S = s && s.v === 1 ? s : { v: 1, items: [], placed: {}, done: [] };
      if (Room.cfg.mode === 'kid' && window.GF && GF.gate && !(o && o.guard)) Room.cfg.guard = GF.gate;   // 유아 앱: 가족 집·코드 입력은 보호자 잠금(구구단) 뒤
      Room.family = false; return Room;
    },
    save() { Room.S.ts = Date.now(); Room.cfg.store.set(Room.S); },
    /** 같은 서명의 형제 앱(APK 단계, 같은 D12 그룹)이 올려 둔 집과 합친다: 얻은 것·완성 세트는 합집합, 놓은 위치·벽·문패는 더 늦게 저장한 쪽. 서버·권한 없음. */
    merge(a, b) {
      if (!b || b.v !== 1) return a; if (!a || a.v !== 1) return b;
      const nw = (b.ts || 0) > (a.ts || 0), base = JSON.parse(JSON.stringify(nw ? b : a)), oth = nw ? a : b, un = (x, y) => [...new Set([...(x || []), ...(y || [])])];
      base.items = un(base.items, oth.items); base.done = un(base.done, oth.done);
      base.placed = base.placed || {}; Object.keys(oth.placed || {}).forEach((r) => { const have = new Set((base.placed[r] || []).map((q) => q.id)); (oth.placed[r] || []).forEach((q) => { if (!have.has(q.id) && !Object.values(base.placed).some((L) => L.some((z) => z.id === q.id))) (base.placed[r] = base.placed[r] || []).push(q); }); });
      base.ts = Math.max(a.ts || 0, b.ts || 0); return base;
    },
    /** 공유 저장소 어댑터: localStorage + (APK 에서만) 네이티브 다리 GFShare. 웹·단독 실행에서는 그냥 localStorage. */
    sharedStore(key) {
      const ls = () => { try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; } };
      return {
        key,
        get() { let v = ls(); try { if (window.GFShare) JSON.parse(GFShare.peers(key) || '[]').forEach((t) => { try { v = Room.merge(v, JSON.parse(t)); } catch (e) {} }); } catch (e) {} return v; },
        set(v) { const t = JSON.stringify(v); try { localStorage.setItem(key, t); } catch (e) {} try { window.GFShare && GFShare.put(key, t); } catch (e) {} },
      };
    },
    /** 앱이 다시 앞으로 올 때: 다른 앱에서 바뀐 집을 불러온다. */
    refresh() { if (!Room.data) return; const v = Room.cfg.store.get(); if (v && v.v === 1) { Room.S = v; if (Room.mount && Room.mount.isConnected && Room._redraw) Room._redraw(); } },
    item: (id) => Room.data.items.find((x) => x.id === id),
    set: (id) => Room.data.sets.find((x) => x.id === id),
    has: (id) => !!Room.S && Room.S.items.includes(id),                 // init 전에 불려도 터지지 않게(간헐 오류 방어)
    owned: () => (Room.S ? Room.S.items.slice() : []),
    ownedCount: () => (Room.S ? Room.S.items.length : 0),
    /** 아이템을 얻는다(진행·코드·시즌). 처음이면 true, 세트가 완성되면 사연 컷 팝업. */
    grant(id) {
      const it = Room.item(id); if (!it || Room.has(id)) return false;
      Room.S.items.push(id); if (Room.cfg.autoPlace) Room.place(id, it.room); Room.save(); Room.cfg.onGrant && Room.cfg.onGrant(it);   // 보상의 끝은 "집에 놓기": autoPlace 면 얻자마자 방에 놓인다
      const st = Room.set(it.set), all = Room.data.items.filter((x) => x.set === it.set);
      if (all.every((x) => Room.has(x.id)) && !Room.S.done.includes(it.set)) { Room.S.done.push(it.set); Room.save(); Room.setComplete(st); }
      return true;
    },
    setComplete(st) {
      if (Room.cfg.onSetComplete) return Room.cfg.onSetComplete(st);
      if (window.UK) UK.modal({ title: '세트 완성!', body: st.name + '<br><br>' + st.story, actions: [{ text: '확인' }], parent: (Room.mount && Room.mount.closest('.screen')) || Room.mount });
    },
    /** 코드(선물·굿즈): 6자리 = 아이템 번호 2 + 잡음 2 + 검사 2. 서버 없이 확인 — 보안이 아니라 오타·장난 방지용. */
    _chk(a) { let h = 7; for (const ch of a) h = (h * 31 + ch.charCodeAt(0)) % 1296; return h.toString(36).toUpperCase().padStart(2, '0'); },
    codeFor(id) { const it = Room.item(id); if (!it || !it.no) return null; const n = it.no, a = n.toString(36).toUpperCase().padStart(2, '0') + ((n * 7 + 11) % 1296).toString(36).toUpperCase().padStart(2, '0'); return a + Room._chk(a); },   // 불변 번호 no 기준(배열 순서와 무관)
    redeem(code) {
      code = String(code || '').trim().toUpperCase().replace(/[^0-9A-Z]/g, ''); if (code.length !== 6) return { ok: false, why: 'len' };
      const a = code.slice(0, 4); if (Room._chk(a) !== code.slice(4)) return { ok: false, why: 'check' };
      const n = parseInt(a.slice(0, 2), 36), it = Room.data.items.find((x) => x.no === n); if (!it || Room.codeFor(it.id) !== code) return { ok: false, why: 'item' };
      return { ok: true, item: it, isNew: Room.grant(it.id) };
    },
    src(it, c, o) { const sl = Room.cfg.slot && Room.cfg.slot('room', it.id); if (sl) return sl; return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(RoomArt.make(it.art, c || it.colors[0], Object.assign({ emoji: it.emoji }, o))); },
    visibleSet(it) { return Room.family || Room.cfg.mode === 'adult' || Room.set(it.set).game === Room.cfg.game || Room.set(it.set).game === 'all'; },
    /** 벽지: 방마다 "무늬+두 색" 설명 하나만 저장(그림 데이터 아님). 도형 무늬 타일을 CSS 배경으로 */
    wallStyle(d) { const c = d.fg, body = d.pat === 0 ? `<rect x="12" y="12" width="36" height="36" rx="9" fill="${c}"/>` : d.pat === 1 ? `<path d="M30 10L52 50H8z" fill="${c}"/>` : `<circle cx="30" cy="30" r="19" fill="${c}"/>`; const face = `<circle cx="23" cy="${d.pat === 1 ? 38 : 28}" r="2.4" fill="#4A3030"/><circle cx="37" cy="${d.pat === 1 ? 38 : 28}" r="2.4" fill="#4A3030"/><path d="M25 ${d.pat === 1 ? 44 : 35}q5 4 10 0" fill="none" stroke="#4A3030" stroke-width="2" stroke-linecap="round"/>`; return `background-color:${d.bg};background-image:url("data:image/svg+xml;charset=utf-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 60">' + body + face + '</svg>')}");background-size:54px 54px`; },
    /** 내 도형(⑤ 결과): {f:가족, s:세부 타입} 설명 하나만 — 성인 그룹 앱들이 문패·말투 힌트로 쓴다 */
    setMe(d) { Room.S.me = d; Room.save(); }, me: () => Room.S.me || null,
    /** 내 도형 문패(⑤ 결과): 성인 앱 홈에 작게 보여 준다. 결과가 없으면 null */
    mePlate(parent) {
      const m = Room.me(), T = m && Room.data.meTypes && Room.data.meTypes[m.f]; if (!T) return null;
      const d = el('div', 'rm-plate', parent, `<img src="${Room.cfg.charSrc ? Room.cfg.charSrc(T.char) : ''}" alt=""><span><small>내 도형</small><b>${T.sub[m.s]}</b></span>`); d.style.background = T.bg; d.style.borderColor = T.color; return d;
    },
    setWall(room, d) { Room.S.wall = Room.S.wall || {}; Room.S.wall[room] = d; Room.save(); },
    placedIn: (r) => (Room.S.placed[r] = Room.S.placed[r] || []),
    place(id, room, x, y) {
      const it = Room.item(id), L = Room.placedIn(room), k = L.length;
      const w = it.w, h = it.h; if (x == null) x = 24 + ((k * 77) % (RW - w - 40)); if (y == null) y = it.slot === 'wall' ? 24 + (k % 3) * 8 : 176 + (k % 3) * 18 - h + 40;
      L.push({ id, x, y, flip: 0, c: it.colors[0] }); Room.save(); return L[L.length - 1];
    },
    /** 집 화면. parent 안에 그린다. opts: {room, onChange} */
    house(parent, opts) {
      opts = opts || {}; Room.mount = parent; parent.innerHTML = ''; parent.classList.add('rm');
      const kid = Room.cfg.mode === 'kid', rooms = Room.data.rooms.filter((r) => !kid || Room.family || r.id === 'kid');
      const mine = Room.data.sets.find((s) => s.game === Room.cfg.game), start = opts.room || (mine && mine.room) || rooms[0].id;   // 집에 들어가면 그 게임의 방이 열린다
      let cur = rooms.find((r) => r.id === start) ? start : rooms[0].id, sel = null, more = false;
      const tabs = el('div', 'rm-tabs', parent), stage = el('div', 'rm-stage', parent), tools = el('div', 'rm-tools', parent), inv = el('div', 'rm-inv', parent);
      const imgSrc = (r) => (Room.cfg.charSrc ? Room.cfg.charSrc(r.char) : '');
      function draw() {
        const R = Room.data.rooms.find((r) => r.id === cur);
        tabs.innerHTML = ''; let on = null; rooms.forEach((r) => { const b = el('button', 'rm-tab' + (r.id === cur ? ' on' : ''), tabs, `<img src="${imgSrc(r)}" alt=""><span>${kid && !Room.family ? '' : r.name}</span>`); b.style.setProperty('--c', r.wall); b.onclick = () => { cur = r.id; sel = null; draw(); }; if (r.id === cur) on = b; }); if (on) setTimeout(() => { try { tabs.scrollLeft = Math.max(0, on.offsetLeft - (tabs.clientWidth - on.offsetWidth) / 2); } catch (e) { /* 스크롤 불가는 무시 */ } }, 0);
        if (kid && !Room.family) { const g = el('button', 'rm-tab fam', tabs, (window.UK ? UK.icon('lock') : '') + '<span></span>'); g.setAttribute('aria-label', '가족 집(보호자)'); g.onclick = () => Room.cfg.guard(() => { Room.family = true; Room.house(parent, { room: cur }); }); }
        stage.innerHTML = ''; stage.style.cssText = `--wall:${R.wall};--floor:${R.floor}`;
        const roomEl = el('div', 'rm-room', stage); const wl = el('div', 'rm-wall', roomEl); if (Room.S.wall && Room.S.wall[cur]) wl.style.cssText += ';' + Room.wallStyle(Room.S.wall[cur]); el('div', 'rm-floor', roomEl);
        Room.placedIn(cur).forEach((p, i) => {
          const it = Room.item(p.id); if (!it || p.drawer) return;
          const d = el('img', 'rm-it' + (sel === i ? ' sel' : ''), roomEl); d.src = Room.src(it, p.c, p.img && Room.cfg.imageFor ? { image: Room.cfg.imageFor(p.img) } : null); d.style.cssText = `left:${p.x}px;top:${p.y}px;width:${it.w}px;height:${it.h}px;z-index:${Math.round(p.y + it.h)};transform:scaleX(${p.flip ? -1 : 1})`;
          d.style.pointerEvents = 'auto'; d.draggable = false;
          d.addEventListener('pointerdown', (e) => {
            e.preventDefault(); sel = i; roomEl.querySelectorAll('.rm-it').forEach((x) => x.classList.remove('sel')); d.classList.add('sel');
            const rc = roomEl.getBoundingClientRect(), k = rc.width / RW, ox = e.clientX / k - p.x, oy = e.clientY / k - p.y; try { d.setPointerCapture(e.pointerId); } catch (x) {}
            const mv = (ev) => { p.x = Math.max(0, Math.min(RW - it.w, Math.round((ev.clientX / k - ox) / 4) * 4)); p.y = Math.max(0, Math.min(RH - it.h, Math.round((ev.clientY / k - oy) / 4) * 4)); d.style.left = p.x + 'px'; d.style.top = p.y + 'px'; d.style.zIndex = Math.round(p.y + it.h); };
            const up = () => { d.removeEventListener('pointermove', mv); d.removeEventListener('pointerup', up); Room.save(); drawTools(); opts.onChange && opts.onChange(); };
            d.addEventListener('pointermove', mv); d.addEventListener('pointerup', up);
          });
        });
        drawTools(); drawInv();
      }
      function drawTools() {
        tools.innerHTML = ''; const p = sel != null ? Room.placedIn(cur)[sel] : null, it = p && Room.item(p.id), B = (label, icon, cls, fn) => { const b = window.UK ? UK.btn({ text: kid ? null : label, icon, cls: cls + ' sm', onclick: fn }, tools) : el('button', 'rm-b', tools, label); if (!p) b.disabled = true; b.setAttribute('aria-label', label); return b; };
        B('돌리기', 'replay', 'sky', () => { p.flip = p.flip ? 0 : 1; Room.save(); draw(); });
        B('색 바꾸기', 'brush', 'gold', () => { const cs = it.colors; p.c = cs[(cs.indexOf(p.c) + 1) % cs.length]; Room.save(); draw(); });
        B('치우기', 'close', 'ghost', () => { Room.placedIn(cur).splice(sel, 1); sel = null; Room.save(); draw(); });
      }
      function drawInv() {
        inv.innerHTML = ''; const sets = Room.data.sets.filter((s) => Room.data.items.some((i) => i.set === s.id && Room.visibleSet(i)));
        const mineSets = sets.filter((s) => s.game === Room.cfg.game || s.game === 'all'), others = sets.filter((s) => !mineSets.includes(s));   // 그 게임이 주는 세트가 맨 위, 나머지는 접어 둔다
        const block = (s, into) => {
          const its = Room.data.items.filter((i) => i.set === s.id && Room.visibleSet(i)), got = its.filter((i) => Room.has(i.id)).length;
          const h = el('div', 'rm-sh', into, `<b>${kid && !Room.family ? '' : s.name}</b><span>${got}/${its.length}</span>`);
          const pg = el('div', 'uk-progress gold', h); pg.innerHTML = `<i style="width:${got / its.length * 100}%"></i>`;
          const g = el('div', 'rm-grid', into);
          its.forEach((it) => {
            const own = Room.has(it.id), b = el('button', 'rm-cell' + (own ? '' : ' off'), g, `<img src="${Room.src(it)}" alt="">${own ? '' : (window.UK ? UK.icon('lock') : '')}`); b.setAttribute('aria-label', own ? it.name : '잠김');
            b.onclick = () => { if (!own) { window.UK && UK.toast(it.season ? '시즌 아이템이에요 (' + it.season + '월)' : (kid ? '아직 못 얻었어요' : '아직 못 얻었어요 · ' + Room.set(it.set).name), parent); return; } const p = Room.place(it.id, it.room === cur || true ? cur : it.room); sel = Room.placedIn(cur).length - 1; window.GF && GF.sfx && GF.sfx('drop'); draw(); };
          });
        };
        mineSets.forEach((s) => block(s, inv));
        if (others.length) {
          const tog = el('button', 'rm-more', inv, (kid && !Room.family ? '' : '다른 게임 세트 ' + others.length + '개 ') + (more ? '▲' : '▼')); tog.setAttribute('aria-expanded', more ? 'true' : 'false'); tog.onclick = () => { more = !more; GF.sfx && GF.sfx('tap'); drawInv(); };
          if (more) others.forEach((s) => block(s, inv));
        }
      }
      Room._redraw = () => { sel = null; draw(); };
      draw(); return { redraw: draw };
    },
  });
})();
