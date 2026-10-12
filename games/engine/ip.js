/* 하나의 IP 층 GF.ip (games/22_IP_SYNERGY.md): 「IP 장부」 — 같은 그룹(유아 ①④⑩ / 성인 ②③⑤⑥⑦⑧⑨) 앱끼리 이야기 카드·도장·카메오·문패 장식을 나눈다.
   저장: 앱 localStorage(gf:ip:<그룹>:v1) + 같은 서명 형제 앱 공유(GFShare, ShareStore okKey). 병합 = 합집합(비트 OR·배열 합침, 지우기 없음) → 어느 앱에서 얻어도 사라지지 않는다.
   그룹이 다른 유아↔성인은 서로 읽지 않는다(D12). 둘을 잇는 것은 보호자 잠금 뒤 「가족 코드」(카드·도장·카메오만, 기기 안 문자열)뿐이며 필수가 아니다(보너스).
   원칙: 압박 없음 · 확정 지급(뽑기 없음) · 서버 없음. 문구는 GF.t 표(data/ops.json). */
(function () {
  'use strict';
  const I = (GF.ip = { ready: false, app: null, kid: false, cfg: null, L: null, _on: [] });
  const LS = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
  const blank = () => ({ v: 1, cards: {}, stamps: {}, cameos: [], plate: [], taken: [] });
  const key = () => 'gf:ip:' + (I.kid ? 'kid' : 'adult') + ':v1';
  const uniq = (a) => Array.from(new Set(a));
  /** 장부 병합(합집합) — 순서·중복·충돌에 안전 */
  I.merge = function (a, b) {
    if (!a) return b || blank(); if (!b) return a; const o = blank();
    [a, b].forEach((x) => { Object.keys(x.cards || {}).forEach((t) => { o.cards[t] = (o.cards[t] || 0) | (x.cards[t] || 0); }); Object.keys(x.stamps || {}).forEach((ap) => { o.stamps[ap] = uniq((o.stamps[ap] || []).concat(x.stamps[ap] || [])); }); o.cameos = uniq(o.cameos.concat(x.cameos || [])); o.plate = uniq(o.plate.concat(x.plate || [])); o.taken = uniq(o.taken.concat(x.taken || [])); });
    return o;
  };
  const read = () => { let v = LS(key()); try { if (window.GFShare) JSON.parse(GFShare.peers(key()) || '[]').forEach((t) => { try { v = I.merge(v, JSON.parse(t)); } catch (e) {} }); } catch (e) {} return v ? I.merge(blank(), v) : blank(); };
  const write = () => { const t = JSON.stringify(I.L); try { localStorage.setItem(key(), t); } catch (e) {} try { window.GFShare && GFShare.put(key(), t); } catch (e) {} };
  I.get = () => I.L || blank();
  I.on = (fn) => { I._on.push(fn); };
  const changed = (kind, info) => { write(); I._on.forEach((f) => { try { f(kind, info); } catch (e) {} }); };
  /** 앱이 다시 앞으로 올 때 다른 앱에서 바뀐 장부를 합친다 */
  I.refresh = () => { if (!I.ready) return; const m = I.merge(I.L, read()); I.L = m; };

  /* ---------------- 이야기 카드: 이야기마다 4장(기·승·전·결 = 0~3) ---------------- */
  I.hasCard = (tale, i) => !!((I.get().cards[tale] || 0) & (1 << i));
  I.cardBits = (tale) => I.get().cards[tale] || 0;
  I.cardCount = (tale) => { const b = I.cardBits(tale); return (b & 1) + ((b >> 1) & 1) + ((b >> 2) & 1) + ((b >> 3) & 1); };
  I.complete = (tale) => I.cardBits(tale) === 15;
  /** 어느 앱이 어느 카드를 주는지: ops.json cardMap[그룹][이야기] = [카드0를 주는 앱, 1, 2, 3] */
  I.cardApp = (tale, i) => { const m = (GF.data && GF.data.ops && GF.data.ops.cardMap) || {}, g = m[I.kid ? 'kid' : 'adult'] || {}; return (g[tale] || [])[i] || null; };
  /** 이 앱이 이 이야기의 카드 i 를 주는 앱이면 얻는다(확정). 돌려주는 값: 새로 얻었는지 */
  I.addCard = function (tale, i) {
    if (!I.ready || I.hasCard(tale, i)) return false; I.L.cards[tale] = (I.L.cards[tale] || 0) | (1 << i); changed('card', { tale, i });
    if (I.complete(tale)) I.claimStory(tale); return true;
  };
  /** 이야기 한 편을 완성하면 「우리 집」 특별 소품 1개를 확정 지급(한 편당 한 번) */
  I.claimStory = function (tale) {
    const id = 't_' + tale + (I.kid ? '_k' : '_a'); if (I.L.taken.includes(id) || !window.Room || !Room.data) return false;
    I.L.taken.push(id); const it = Room.item(id); let got = false; if (it) got = Room.grant(id); write(); I.addStamp(I.app, 'story'); if (got) I.celebrate(tale, it); I._on.forEach((f) => { try { f('story', { tale, got, name: it && it.name }); } catch (e) {} }); return got;
  };
  /** 한 편을 완성한 순간: 특별 소품 팝업(성인 글 / 유아 큰 그림만) */
  I.celebrate = function (tale, it) {
    if (I._quiet) return; try { const T = ((GF.data.ops || {}).tales || {})[tale] || {}, em = (it && it.emoji) || T.icon || '🎁';
      const sc = UK.modal({ parent: document.getElementById('safe'), title: I.kid ? '' : (T.title || ''), big: em, body: I.kid ? '' : GF.t('ops.ip.story', { name: (it && it.name) || '' }), actions: [{ text: I.kid ? '' : GF.t('ops.thanks'), icon: I.kid ? 'play' : undefined, cls: 'green', onclick: () => {} }] });
      if (I.kid) { const b = sc.querySelector('.acts .uk-btn'); if (b) b.setAttribute('aria-label', 'ok'); } GF.sfx('celebrate'); try { UK.confetti(sc); } catch (e) {} } catch (e) {}
  };
  /** 이야기 컷(장 n 의 기승전결) 을 끝까지 봤을 때 tale.js 가 부른다 */
  I.beat = function (app, tale, beat) { if (!I.ready || !tale) return false; const who = I.cardApp(tale, beat); if (who && who !== app) return false; const r = I.addCard(tale, beat); if (r) I.toast(tale, beat); return r; };
  /** ① 놀이터: 책 장(ch11~15)의 프롤로그=카드0, 단계 A 깸=카드1, B 깸=카드2, 에필로그=카드3 */
  I.playBeat = function (chId, beat) { const n = +String(chId).replace(/\D/g, ''), tale = ((GF.data.ops || {}).playTale || {})[n]; return tale ? I.beat('play', tale, beat) : false; };
  I.toast = (tale, beat, tries) => { try { if (tries === undefined) { setTimeout(() => I.toast(tale, beat, 0), 1500); return; }   // 컷 직후 바로 띄우지 않는다(설명 카드가 먼저)
      if ((document.querySelector('.uk-scrim') || document.querySelector('.tale-ov')) && tries < 6) { setTimeout(() => I.toast(tale, beat, (tries || 0) + 1), 1600); return; }   // 설명 카드·컷이 떠 있는 동안은 기다렸다가 알림(안내가 겹치지 않게)
 const T = (GF.data.ops.tales || {})[tale] || {}; UK.toast(GF.t('ops.ip.card', { title: T.title || tale, n: I.cardCount(tale) }), document.getElementById('safe')); GF.sfx('star'); } catch (e) {} };

  /* ---------------- 도장: 앱별 규칙(ops.json stamps[앱]=[{id,at}]) — 앱 진행 수(progress)가 기준을 넘으면 확정 ---------------- */
  I.stamps = (app) => (I.get().stamps[app || I.app] || []).slice();
  I.addStamp = function (app, id) { if (!I.ready) return false; const a = I.L.stamps[app] = I.L.stamps[app] || []; if (a.includes(id)) return false; a.push(id); changed('stamp', { app, id }); I.checkPlate(); return true; };
  I.syncStamps = function () {
    if (!I.ready || !I.cfg || typeof I.cfg.progress !== 'function') return; const rules = ((GF.data.ops.stamps || {})[I.app]) || []; let n = 0; try { n = +I.cfg.progress() || 0; } catch (e) { return; }
    rules.forEach((r) => { if (r.at != null && n >= r.at) { if (I.addStamp(I.app, r.id)) { try { UK.toast(GF.t('ops.ip.stamp', { name: GF.t('ops.ip.stamp.' + r.id) }), document.getElementById('safe')); GF.sfx('star'); } catch (e) {} } } });
  };
  I.stampTotal = () => { const g = I.get().stamps, ap = ((GF.data.ops.apps || {})[I.kid ? 'kid' : 'adult']) || []; return ap.reduce((a, x) => a + (g[x] || []).length, 0); };
  /** 문패 장식: 앱 도장 세트(앱 5개 중 N개)를 모으면 확정 */
  const PLATES = [{ id: 'ribbon', need: 5 }, { id: 'sparkle', need: 15 }, { id: 'crown', need: 30 }];
  I.checkPlate = function () { const n = I.stampTotal(), kidScale = I.kid ? 0.4 : 1; PLATES.forEach((p) => { if (n >= Math.ceil(p.need * kidScale) && !I.L.plate.includes(p.id)) { I.L.plate.push(p.id); changed('plate', { id: p.id }); try { UK.toast(GF.t('ops.ip.plate', { name: GF.t('ops.ip.plate.' + p.id) }), document.getElementById('safe')); GF.sfx('celebrate'); } catch (e) {} } }); };
  I.plateNeed = (id) => Math.ceil(PLATES.find((p) => p.id === id).need * (I.kid ? 0.4 : 1));
  I.plates = () => I.get().plate.slice();

  /* ---------------- 카메오 도감 ---------------- */
  I.hasCameo = (id) => I.get().cameos.includes(id);
  I.addCameo = function (id) { if (!I.ready || I.hasCameo(id)) return false; I.L.cameos.push(id); changed('cameo', { id }); return true; };

  /** 장 끝 컷 직후 호출: 이 앱의 이 컷(after=키)에 등장하는 카메오가 있고 처음이면 잠깐 보여 주고 도감에 기록(한 번만, 강요 없음) */
  I.cameo = function (host, key) {
    if (!I.ready) return false; const list = ((GF.data.ops || {}).cameos || []).filter((c) => c.host === host && c.after === key && c.kid === I.kid); if (!list.length) return false; const c = list[0]; if (I.hasCameo(c.id)) return false;
    I.addCameo(c.id); const safe = document.getElementById('safe'); if (!safe) return true;
    const d = document.createElement('div'); d.className = 'ip-cameo' + (I.kid ? ' kid' : ''); const av = document.createElement('div'); av.className = 'av'; try { av.style.backgroundImage = 'url("' + GF.src(c.who) + '")'; } catch (e) {} d.appendChild(av);
    const pr = document.createElement('span'); pr.className = 'pr'; pr.textContent = c.prop; d.appendChild(pr); if (!I.kid) { const tx = document.createElement('span'); tx.className = 'tx'; tx.textContent = c.line; d.appendChild(tx); }
    safe.appendChild(d); try { GF.sfx(I.kid ? 'ok' : 'pick'); } catch (e) {} setTimeout(() => { d.classList.add('off'); setTimeout(() => d.remove(), 500); }, I.kid ? 2600 : 3400); return true;
  };
  I.cameoCount = () => { const L = ((GF.data.ops || {}).cameos || []).filter((c) => c.kid === I.kid); return { got: L.filter((c) => I.hasCameo(c.id)).length, total: L.length }; };
  /** 도감 선물: 25·50·100% 마다 집 소품 1개(확정) */
  I.cameoGifts = function () { const n = I.cameoCount(), pct = n.total ? n.got / n.total : 0; const due = [['cam25', 0.25], ['cam50', 0.5], ['cam100', 1]].filter(([id, r]) => pct >= r && !I.L.taken.includes(id)); return due.map((d) => d[0]); };
  I.claimCameoGift = function (id) { if (!window.Room || I.L.taken.includes(id)) return null; I.L.taken.push(id); write(); const sets = [(I.cfg && I.cfg.rewardSet), 'kid'].filter(Boolean); let it = null; for (const st of sets) { it = Room.data.items.find((x) => x.set === st && !Room.has(x.id)); if (it) break; } if (it) Room.grant(it.id); return it; };

  /* ---------------- 가족 코드(유아↔성인): 카드·도장·카메오만. 보호자 잠금 뒤에서만 부른다 ---------------- */
  const crc32 = (str) => { let c, crc = 0xFFFFFFFF; for (let i = 0; i < str.length; i++) { c = (crc ^ str.charCodeAt(i)) & 0xFF; for (let k = 0; k < 8; k++) c = c & 1 ? (c >>> 1) ^ 0xEDB88320 : c >>> 1; crc = (crc >>> 8) ^ c; } return ((crc ^ 0xFFFFFFFF) >>> 0).toString(16).padStart(8, '0'); };
  const b64e = (x) => btoa(unescape(encodeURIComponent(x))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''), b64d = (x) => decodeURIComponent(escape(atob(x.replace(/-/g, '+').replace(/_/g, '/'))));
  I.makeFamilyCode = function () { const L = I.get(), j = JSON.stringify({ c: L.cards, s: L.stamps, m: L.cameos }); return 'GF2.' + b64e(j) + '.' + crc32(j); };
  I.readFamilyCode = function (code) { try { const m = /^GF2\.([A-Za-z0-9_-]+)\.([0-9a-f]{8})$/.exec((code || '').trim()); if (!m) return { ok: false, err: 'bad' }; const j = b64d(m[1]); if (crc32(j) !== m[2]) return { ok: false, err: 'bad' }; const d = JSON.parse(j); return { ok: true, data: d }; } catch (e) { return { ok: false, err: 'bad' }; } };
  /** 코드를 합친다. 카드로 한 편이 완성되면 이 그룹의 특별 소품도 지급(가족 코드는 보너스) */
  I.applyFamilyCode = function (code) {
    const r = I.readFamilyCode(code); if (!r.ok) return r; const d = r.data; const inc = blank(); inc.cards = d.c || {}; inc.stamps = d.s || {}; inc.cameos = d.m || [];
    const before = JSON.stringify(I.L); I._quiet = true; I.L = I.merge(I.L, inc); I.L.plate = I.L.plate; write(); Object.keys(I.L.cards).forEach((t) => { if (I.complete(t)) I.claimStory(t); }); I._quiet = false; I.checkPlate(); I._on.forEach((f) => { try { f('code', {}); } catch (e) {} }); return { ok: true, changed: before !== JSON.stringify(I.L) };
  };

  I.init = function (cfg) { I.app = cfg.app; I.kid = !!cfg.kid; I.cfg = cfg; I.L = read(); I.ready = !!(GF.data && GF.data.ops); if (!I.ready) return; write(); setTimeout(() => I.syncStamps(), 800); };
})();
