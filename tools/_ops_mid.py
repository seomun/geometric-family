import pathlib
p = pathlib.Path('games/engine/ops.js'); s = p.read_text(encoding='utf-8')
mid = r'''
  /* ---------------- 이벤트 달력(H5): 오프라인 날짜 기반, 해마다 반복, 놓친 이벤트는 「다시 열기」. 카운트다운·FOMO 문구 없음 ---------------- */
  O.openCalendar = function () {
    const ev = (O.cfg && O.cfg.calendar && O.cfg.calendar()) || []; const { sc, body } = sheet(GF.t('ops.cal.title')), m0 = nowD().getMonth() + 1;
    if (!ev.length) { el('p', 'xt-p', body, GF.t('ops.cal.empty')); return; }
    for (let m = 1; m <= 12; m++) {
      const here = ev.filter((e) => (e.months || []).includes(m)); if (!here.length) continue;
      const r = el('div', 'ops-cal' + (m === m0 ? ' now' : ''), body); el('b', '', r, GF.t('ops.cal.m', { m }));
      here.forEach((e) => {
        const state = e.done ? 'done' : (e.months.includes(m0) ? 'now' : (m < m0 ? 'again' : 'later')), label = e.done ? GF.t('ops.cal.done') : state === 'now' ? GF.t('ops.cal.now') : state === 'again' ? GF.t('ops.cal.again') : GF.t('ops.cal.later', { m });
        const b = el('button', 'ops-ev ' + state, r, (e.icon || '📅') + ' ' + e.title); el('small', '', b, label);
        b.onclick = () => { if (state === 'later') { GF.sfx('hmm'); UK.toast(label, safe()); return; } GF.sfx('pick'); sc.close(); e.play && e.play(); };
      });
    }
    el('p', 'xt-p', body, GF.t('ops.cal.note'));
  };

  /* ---------------- 오늘의 작은 일(미션): 3개, 못 해도 괜찮고 다 하면 확정 소품 1개(하루 1회) ---------------- */
  const POOL = [{ id: 'clear', n: 3, icon: '🎯' }, { id: 'star3', n: 1, icon: '⭐' }, { id: 'story', n: 1, icon: '📖' }, { id: 'house', n: 1, icon: '🏠' }, { id: 'daily', n: 1, icon: '📅' }];
  const dayKey = () => { const d = nowD(); return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate(); };
  const misToday = (s) => { const k = dayKey(); if (!s.mis || s.mis.d !== k) { const n = Math.floor(Date.UTC(nowD().getFullYear(), nowD().getMonth(), nowD().getDate()) / DAY), pick = [n % 5, (n + 2) % 5, (n + 3) % 5]; s.mis = { d: k, ids: pick.map((i) => POOL[i].id), prog: {}, gift: 0 }; } return s.mis; };
  O.note = function (id) { if (!O.ready || O.kid) return; const s = st(), m = misToday(s); if (m.ids.includes(id)) { const def = POOL.find((q) => q.id === id); m.prog[id] = Math.min(def.n, (m.prog[id] || 0) + 1); } put(s); };
  O.noteResult = function (stars) { O.note('clear'); if ((stars || 0) >= 3) O.note('star3'); };
  O.missions = function () { const s = st(), m = misToday(s); put(s); return m.ids.map((id) => { const d = POOL.find((q) => q.id === id); return { id, n: d.n, icon: d.icon, got: m.prog[id] || 0 }; }); };
  O.openMissions = function () {
    const { sc, body } = sheet(GF.t('ops.mis.title')), s = st(), m = misToday(s), list = O.missions();
    list.forEach((x) => { const r = el('div', 'ops-mis' + (x.got >= x.n ? ' ok' : ''), body); el('span', 'ic', r, x.icon); el('span', 'tx', r, GF.t('ops.mis.' + x.id, { n: x.n })); el('b', '', r, x.got >= x.n ? '✔' : x.got + '/' + x.n); });
    const all = list.every((x) => x.got >= x.n);
    if (all && !m.gift) { UK.btn({ text: GF.t('ops.mis.gift'), cls: 'gold block', onclick: () => { const s2 = st(), m2 = misToday(s2); if (m2.gift) return; const it = nextGift(); m2.gift = 1; put(s2); let got = null; if (it && Room.grant(it.id)) got = it; sc.close(); UK.toast(got ? GF.t('ops.mis.got', { name: got.name }) : GF.t('ops.mis.none'), safe()); GF.sfx('celebrate'); } }, body); }
    else if (m.gift) el('p', 'xt-p', body, GF.t('ops.mis.gifted'));
    el('p', 'xt-p', body, GF.t('ops.mis.note'));
  };

  /* ---------------- 앨범: 집 소품 · 이야기 카드 · 계절. 확정 지급(뽑기·중복 없음), 이야기 카드 3장마다 소품 1개 ---------------- */
  function cardsDone() {
    const T = GF.tale, out = []; if (!T || !T.ready || !T.d.chapters) return out;
    Object.keys(T.d.chapters).forEach((n) => { const c = T.d.chapters[n], need = ['s' + n, 'e' + n].concat((c.mid || []).map((m) => 'm' + n + ':' + m.after)); out.push({ n, title: c.title, got: need.every((k) => T.seen(k)) }); });
    return out;
  }
  O.openAlbum = function () {
    const { sc, body } = sheet(GF.t('ops.album.title')), c = O.cfg || {}, s = st();
    const sec = (t) => el('h4', 'xt-h', body, t);
    if (window.Room && Room.data && c.rewardSet) { const its = Room.data.items.filter((i) => i.set === c.rewardSet), own = its.filter((i) => Room.has(i.id)).length; sec(GF.t('ops.album.items') + ' ' + own + '/' + its.length); const g = el('div', 'ops-chips', body); its.forEach((i) => el('span', Room.has(i.id) ? 'on' : '', g, Room.has(i.id) ? i.name : '🔒')); }
    const cards = cardsDone();
    if (cards.length) {
      const got = cards.filter((x) => x.got).length, earned = Math.floor(got / 3), claimed = s.albumClaimed || 0; sec(GF.t('ops.album.cards') + ' ' + got + '/' + cards.length); const g = el('div', 'ops-chips', body); cards.forEach((x) => el('span', x.got ? 'on' : '', g, x.got ? x.title : '🔒'));
      if (earned > claimed) UK.btn({ text: GF.t('ops.album.claim'), cls: 'gold block', onclick: () => { const s2 = st(), it = nextGift(); s2.albumClaimed = (s2.albumClaimed || 0) + 1; put(s2); let ok = null; if (it && Room.grant(it.id)) ok = it; sc.close(); UK.toast(ok ? GF.t('ops.mis.got', { name: ok.name }) : GF.t('ops.mis.none'), safe()); GF.sfx('celebrate'); } }, body);
      else el('p', 'xt-p', body, GF.t('ops.album.next', { n: 3 - (got % 3) }));
    }
    const ev = (c.calendar && c.calendar()) || []; if (ev.length) sec(GF.t('ops.album.season') + ' ' + ev.filter((e) => e.done).length + '/' + ev.length);
  };

  /* ---------------- 백업 코드(H2): 기기 안에서 내보내기·가져오기, 체크섬. 서버 없음 ---------------- */
  const crc32 = (str) => { let c, crc = 0xFFFFFFFF; for (let i = 0; i < str.length; i++) { c = (crc ^ str.charCodeAt(i)) & 0xFF; for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xEDB88320 : c >>> 1; crc = (crc >>> 8) ^ c; } return ((crc ^ 0xFFFFFFFF) >>> 0).toString(16).padStart(8, '0'); };
  const b64e = (x) => btoa(unescape(encodeURIComponent(x))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''), b64d = (x) => decodeURIComponent(escape(atob(x.replace(/-/g, '+').replace(/_/g, '/'))));
  const mine = (k) => k.indexOf('gf:' + O.app + ':') === 0 || k.indexOf('gf:house:') === 0 || (O.app === 'play' && k === 'gf:v1');
  O.makeCode = function () { const kv = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (mine(k)) kv[k] = localStorage.getItem(k); } const j = JSON.stringify({ a: O.app, t: O._now(), k: kv }); return 'GF1.' + b64e(j) + '.' + crc32(j); };
  /** 코드 검사: {ok, err, data}. err: 'bad'(형식·체크섬) | 'other'(다른 앱) */
  O.readCode = function (code) {
    try { const m = /^GF1\.([A-Za-z0-9_-]+)\.([0-9a-f]{8})$/.exec((code || '').trim()); if (!m) return { ok: false, err: 'bad' }; const j = b64d(m[1]); if (crc32(j) !== m[2]) return { ok: false, err: 'bad' }; const d = JSON.parse(j); if (!d || !d.k) return { ok: false, err: 'bad' }; if (d.a !== O.app) return { ok: false, err: 'other' }; return { ok: true, data: d }; } catch (e) { return { ok: false, err: 'bad' }; }
  };
  O.applyCode = function (code) { const r = O.readCode(code); if (!r.ok) return r; Object.keys(r.data.k).forEach((k) => { if (mine(k)) { try { localStorage.setItem(k, r.data.k[k]); } catch (e) {} } }); return r; };
  const tbtnL = (text, fn) => { const b = el('button', 'xt-btn', null, text); b.onclick = fn; return b; };
  O.openBackup = function () {
    const { body } = sheet(GF.t('ops.backup.title'));
    el('p', 'xt-p', body, GF.t('ops.backup.note'));
    const out = el('textarea', 'ops-code', body); out.readOnly = true; out.rows = 3; out.style.display = 'none';
    const cp = tbtnL(GF.t('ops.backup.copy'), () => { out.select(); try { navigator.clipboard.writeText(out.value); } catch (e) { try { document.execCommand('copy'); } catch (e2) {} } UK.toast(GF.t('ops.backup.copied'), safe()); }); cp.style.display = 'none';
    UK.btn({ text: GF.t('ops.backup.make'), cls: 'sky block', onclick: () => { out.value = O.makeCode(); out.style.display = 'block'; out.select(); cp.style.display = 'inline-flex'; } }, body); body.appendChild(cp);
    el('h4', 'xt-h', body, GF.t('ops.backup.paste')); const inp = el('textarea', 'ops-code', body); inp.rows = 3; const msg = el('p', 'xt-p', body, ''); let armed = false;
    UK.btn({ text: GF.t('ops.backup.load'), cls: 'ghost block', onclick: () => { const r = O.readCode(inp.value); if (!r.ok) { msg.textContent = GF.t('ops.backup.' + r.err); armed = false; return; } if (!armed) { armed = true; msg.textContent = GF.t('ops.backup.confirm'); return; } O.applyCode(inp.value); msg.textContent = GF.t('ops.backup.ok'); setTimeout(() => location.reload(), 700); } }, body);
  };
'''
marker = "  /* ---------------- 설정 줄(extras 가 부른다) ---------------- */"
assert marker in s
s = s.replace(marker, mid + "\n" + marker, 1)
old = "    row(GF.t('ops.settings.help'), tb(GF.t('common.view'), () => { sc.close(); O.openHelp(); }));\n"
assert old in s
s = s.replace(old, """    if (!kid) {
      row(GF.t('ops.settings.mis'), tb(GF.t('common.view'), () => { sc.close(); O.openMissions(); }));
      if (O.cfg && O.cfg.calendar) row(GF.t('ops.settings.cal'), tb(GF.t('common.view'), () => { sc.close(); O.openCalendar(); }));
      row(GF.t('ops.settings.album'), tb(GF.t('common.view'), () => { sc.close(); O.openAlbum(); }));
    }
    row(GF.t('ops.settings.backup'), tb(GF.t('common.view'), () => { sc.close(); O.openBackup(); }));
""" + old, 1)
s = s.replace("    O.cfg = cfg; O.app = cfg.app;", "    if (window.Room && Room.place && !Room._opsW) { const pl = Room.place; Room.place = function () { O.note('house'); return pl.apply(Room, arguments); }; Room._opsW = 1; }   // 집 소품 놓기 → 미션\n    O.cfg = cfg; O.app = cfg.app;", 1)
p.write_text(s, encoding='utf-8')
a = pathlib.Path('games/engine/ads.js'); t = a.read_text(encoding='utf-8')
t = t.replace("noteLevelDone(LV) { if (GF.ops && GF.ops.noteClear && !(LV && LV.kind)) GF.ops.noteClear();", "noteLevelDone(LV) { if (GF.ops && GF.ops.noteClear && !(LV && LV.kind)) GF.ops.noteClear(); if (GF.ops && GF.ops.note && LV && LV.kind === 'daily') GF.ops.note('daily');", 1)
t = t.replace("    const sc = _result.call(UK, o), h = A.resultHook; A.resultHook = null;", "    if (o && !A.isKid() && GF.ops && GF.ops.noteResult) GF.ops.noteResult(o.stars);   // 오늘의 작은 일(미션) 집계\n    const sc = _result.call(UK, o), h = A.resultHook; A.resultHook = null;", 1)
a.write_text(t, encoding='utf-8')
tl = pathlib.Path('games/engine/tale.js'); u = tl.read_text(encoding='utf-8')
u = u.replace("try { GF.ads && GF.ads.noteStory && GF.ads.noteStory(); } catch (e) {}", "try { GF.ads && GF.ads.noteStory && GF.ads.noteStory(); GF.ops && GF.ops.note && GF.ops.note('story'); } catch (e) {}", 1)
tl.write_text(u, encoding='utf-8')
for g, pl in [('merge', 'mplay'), ('spot', 'pplay'), ('block', 'bplay'), ('sort', 'splay'), ('tile', 'tplay')]:
    f = pathlib.Path(f'games/{g}/{g}.js'); v = f.read_text(encoding='utf-8')
    a2 = f"app: '{g}', kid: false,"; assert a2 in v, g
    if 'calendar:' not in v:
        cal = f" calendar: () => X.seasons.map((s) => ({{ id: s.id, title: s.title, months: s.months, icon: '📅', done: !!SV.seasonDone[seasonKey(s)], play: () => {{ const L = seasonLevel(s); if (L) GF.go('{pl}', {{ level: L }}); }} }})),"
        v = v.replace(a2, a2 + cal, 1); f.write_text(v, encoding='utf-8')
i = pathlib.Path('games/idle/idle.js'); w = i.read_text(encoding='utf-8')
a3 = "app: 'idle', kid: false,"; assert a3 in w
if 'calendar:' not in w:
    w = w.replace(a3, a3 + " calendar: () => (ST.seasons || []).map((x) => ({ id: x.id, title: x.title, months: x.months, icon: '🍂', done: !!S.ss[seasonKey(x.id)], play: () => GF.go('istory', { id: x.id, season: 1 }) })),", 1); i.write_text(w, encoding='utf-8')
print('ok')
