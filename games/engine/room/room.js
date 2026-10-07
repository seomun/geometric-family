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
    save() { Room.cfg.store.set(Room.S); },
    item: (id) => Room.data.items.find((x) => x.id === id),
    set: (id) => Room.data.sets.find((x) => x.id === id),
    has: (id) => Room.S.items.includes(id),
    owned: () => Room.S.items.slice(),
    ownedCount: () => Room.S.items.length,
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
      if (window.UK) UK.modal({ title: '세트 완성!', body: st.name + '<br><br>' + st.story, actions: [{ text: '확인' }], parent: Room.mount });
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
      let cur = opts.room && rooms.find((r) => r.id === opts.room) ? opts.room : rooms[0].id, sel = null;
      const tabs = el('div', 'rm-tabs', parent), stage = el('div', 'rm-stage', parent), tools = el('div', 'rm-tools', parent), inv = el('div', 'rm-inv', parent);
      const imgSrc = (r) => (Room.cfg.charSrc ? Room.cfg.charSrc(r.char) : '');
      function draw() {
        const R = Room.data.rooms.find((r) => r.id === cur);
        tabs.innerHTML = ''; rooms.forEach((r) => { const b = el('button', 'rm-tab' + (r.id === cur ? ' on' : ''), tabs, `<img src="${imgSrc(r)}" alt=""><span>${kid && !Room.family ? '' : r.name}</span>`); b.style.setProperty('--c', r.wall); b.onclick = () => { cur = r.id; sel = null; draw(); }; });
        if (kid && !Room.family) { const g = el('button', 'rm-tab fam', tabs, (window.UK ? UK.icon('lock') : '') + '<span></span>'); g.setAttribute('aria-label', '가족 집(보호자)'); g.onclick = () => Room.cfg.guard(() => { Room.family = true; Room.house(parent, { room: cur }); }); }
        stage.innerHTML = ''; stage.style.cssText = `--wall:${R.wall};--floor:${R.floor}`;
        const roomEl = el('div', 'rm-room', stage); el('div', 'rm-wall', roomEl); el('div', 'rm-floor', roomEl);
        Room.placedIn(cur).forEach((p, i) => {
          const it = Room.item(p.id); if (!it) return;
          const d = el('img', 'rm-it' + (sel === i ? ' sel' : ''), roomEl); d.src = Room.src(it, p.c); d.style.cssText = `left:${p.x}px;top:${p.y}px;width:${it.w}px;height:${it.h}px;z-index:${Math.round(p.y + it.h)};transform:scaleX(${p.flip ? -1 : 1})`;
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
        inv.innerHTML = ''; const R = cur, sets = Room.data.sets.filter((s) => Room.data.items.some((i) => i.set === s.id && Room.visibleSet(i)));
        sets.forEach((s) => {
          const its = Room.data.items.filter((i) => i.set === s.id && Room.visibleSet(i)), got = its.filter((i) => Room.has(i.id)).length;
          const h = el('div', 'rm-sh', inv, `<b>${kid && !Room.family ? '' : s.name}</b><span>${got}/${its.length}</span>`);
          const pg = el('div', 'uk-progress gold', h); pg.innerHTML = `<i style="width:${got / its.length * 100}%"></i>`;
          const g = el('div', 'rm-grid', inv);
          its.forEach((it) => {
            const own = Room.has(it.id), b = el('button', 'rm-cell' + (own ? '' : ' off'), g, `<img src="${Room.src(it)}" alt="">${own ? '' : (window.UK ? UK.icon('lock') : '')}`); b.setAttribute('aria-label', own ? it.name : '잠김');
            b.onclick = () => { if (!own) { window.UK && UK.toast(it.season ? '시즌 아이템이에요 (' + it.season + '월)' : (kid ? '아직 못 얻었어요' : '아직 못 얻었어요 · ' + Room.set(it.set).name), parent); return; } const p = Room.place(it.id, it.room === cur || true ? cur : it.room); sel = Room.placedIn(cur).length - 1; window.GF && GF.sfx && GF.sfx('drop'); draw(); };
          });
        });
      }
      draw(); return { redraw: draw };
    },
  });
})();
