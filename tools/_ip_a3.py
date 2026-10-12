import pathlib, re
G = pathlib.Path('games')
# ---------- ops_build: 카메오·주간 주제 ----------
b = pathlib.Path('tools/ops_build.py'); z = b.read_text(encoding='utf-8')
add = r'''
# ---- 카메오(5): 다른 앱 배역이 판 사이(장 끝 컷 직후)에 잠깐 등장. 문구는 짧고 따뜻하게·세 가족 말투(네모 평이/세모 들뜸/동그라미 차분), 광고성 말 금지. [제안] ----
GUEST = {  # 어느 앱에서 온 손님인가: (캐릭터, 소품, 문구 2종)
    'merge': ('husband.joy', '🧳', ['이삿짐이 한가득이에요!', '상자를 하나 더 옮겼어요!']),
    'spot': ('dong_dad.calm', '🖼️', ['액자가 곧은지 살피는 중이에요.', '그림 속 다른 곳을 하나 찾았어요.']),
    'block': ('nemo_dad.good', '🧱', ['벽돌을 딱 맞게 쌓는 중이야.', '한 줄이 깔끔하게 맞았어.']),
    'sort': ('nemo_mom.good', '🗄️', ['선반을 정리하는 중이에요.', '같은 것끼리 모았어요.']),
    'tile': ('wife.wink', '🧺', ['바구니에 하나 더 담았어요!', '짝이 딱 맞았어요!']),
    'idle': ('nemo_mom.joy', '🍲', ['따뜻한 국이 끓고 있어요.', '식탁에 한 자리 더 놓았어요.']),
    'quiz': ('wife.smug', '🔮', ['너는 어느 도형일까?', '오늘의 나를 알아봤어요.']),
    'play': ('baby.joy', '🧸', ['', '']), 'color': ('wife.joy', '🖍️', ['', '']),
}
def cameos():
    out = []
    adult_h = ['merge', 'spot', 'block', 'sort', 'tile']; others = {'merge': ['spot', 'block', 'sort', 'tile', 'idle', 'quiz'], 'spot': ['merge', 'block', 'sort', 'tile', 'idle', 'quiz'], 'block': ['merge', 'spot', 'sort', 'tile', 'idle', 'quiz'], 'sort': ['merge', 'spot', 'block', 'tile', 'idle', 'quiz'], 'tile': ['merge', 'spot', 'block', 'sort', 'idle', 'quiz']}
    for h in adult_h:
        for j, n in enumerate([2, 4, 6, 8, 10, 12]):
            f = others[h][j % 6]; ch, prop, lines = GUEST[f]
            out.append(dict(id=f'{h}:e{n}', host=h, after=f'e{n}', who=ch, prop=prop, frm=f, line=lines[j % 2], kid=False))
    for j, n in enumerate([2, 4, 6, 8, 10, 12]):
        f = ['play', 'color'][j % 2]; ch, prop, lines = GUEST[f]
        out.append(dict(id=f'day:e{n}', host='day', after=f'e{n}', who=ch, prop=prop, frm=f, line='', kid=True))
    return out
# ---- 주간 주제(4): 모든 앱이 같은 주에 같은 주제(웹툰 연결 자리 webtoon). 번들 기본표 — 나중에 원격 설정(T1)이 덮어씀 ----
def week_themes():
    W = []
    base = [(1, 2, 'seol', '설날 한 주', '🎍'), (3, 5, 'spring', '봄맞이 한 주', '🌸'), (6, 9, 'spring2', '새 학기 한 주', '🎒'), (10, 13, 'flower', '꽃구경 한 주', '🌷'), (14, 17, 'family', '가족 나들이 한 주', '🧺'), (18, 19, 'child', '어린이날 한 주', '🎈'),
            (20, 25, 'rain', '비 오는 날 한 주', '☔'), (26, 33, 'summer', '여름 물놀이 한 주', '🏖️'), (34, 35, 'vacation', '방학 끝 한 주', '📚'), (36, 39, 'chuseok', '송편 한 주', '🥮'), (40, 43, 'autumn', '단풍 한 주', '🍁'),
            (44, 46, 'harvest', '곡식 거두는 한 주', '🌾'), (47, 48, 'kimjang', '김장 한 주', '🥬'), (49, 51, 'winter', '눈 오는 한 주', '⛄'), (52, 53, 'year', '한 해 마무리 한 주', '🎄')]
    for a, z, i, t, e in base:
        for w in range(a, z + 1): W.append(dict(w=w, id=i, title=t, icon=e, webtoon=''))
    return W
'''
if 'def cameos' not in z:
    z = z.replace("STR.update({'ops.pass.title'", add + "STR.update({'ops.pass.title'", 1)
    z = z.replace("playTale={str(k): v for k, v in PLAY_TALE.items()})", "playTale={str(k): v for k, v in PLAY_TALE.items()}, cameos=cameos(), weekThemes=week_themes())", 1)
    z = z.replace("STR.update({'ops.pass.title'", "STR.update({'ops.cam.title': '카메오 도감', 'ops.cam.card': '지나가던 가족', 'ops.cam.seen': '{n}/{total}명을 만났어요', 'ops.cam.gift': '🎁 카메오 선물 받기', 'ops.cam.from': '{app}에서 왔어요', 'ops.week.now': '이번 주: {title}', 'ops.week.rec': ' · 지금 해 볼 것: {name}', 'ops.me.title': '내 도형 · {name}', 'ops.settings.cameo': '카메오 도감',\n            'ops.pass.title'", 1)
    b.write_text(z, encoding='utf-8')
# ---------- ip.js: 카메오 오버레이 + 도감 선물 ----------
p = G / 'engine/ip.js'; s = p.read_text(encoding='utf-8')
if 'I.cameo =' not in s:
    s = s.replace("  /* ---------------- 가족 코드", r"""  /** 장 끝 컷 직후 호출: 이 앱의 이 컷(after=키)에 등장하는 카메오가 있고 처음이면 잠깐 보여 주고 도감에 기록(한 번만, 강요 없음) */
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

  /* ---------------- 가족 코드""", 1)
    p.write_text(s, encoding='utf-8')
# ---------- tale.js: 카메오 + 말투 ----------
t = G / 'engine/tale.js'; u = t.read_text(encoding='utf-8')
if 'GF.ip.cameo' not in u:
    u = u.replace("T.play(raw, parent, () => { if (k) afterBeat(k); cb && cb(); }, o); return true;", "T.play(raw, parent, () => { if (k) afterBeat(k); cb && cb(); if (k) setTimeout(() => { try { GF.ip && GF.ip.cameo && GF.ip.cameo(T.app, k); } catch (e) {} }, 700); }, o); return true;", 1)
    u = u.replace("else el('span', '', b, GF.name(L.text));", "else el('span', '', b, GF.ops && GF.ops.tone ? GF.ops.tone(GF.name(L.text)) : GF.name(L.text));", 1)
    assert 'GF.ip.cameo' in u and 'GF.ops.tone' in u; t.write_text(u, encoding='utf-8')
# ---------- ops.js: 말투·칭호·주간·카메오 도감 ----------
o = G / 'engine/ops.js'; v = o.read_text(encoding='utf-8')
if 'O.tone' not in v:
    v = v.replace("  /* ---------------- IP 층 UI:", r"""  /* ---------------- 내 도형 개인화(3): 칭호·말투. ⑤ 결과(Room.me)가 성인 앱 전체에 반영된다 ---------------- */
  O.me = () => { try { if (O.kid) return null; const m = window.Room && Room.me && Room.me(), T = m && Room.data.meTypes && Room.data.meTypes[m.f]; return T ? { f: m.f, name: T.sub[m.s] || T.name, color: T.color } : null; } catch (e) { return null; } };
  /** 말풍선 말투 필터: 네모 그대로 / 세모 들뜸(마침표→느낌표) / 동그라미 차분(느낌표→마침표) */
  O.tone = function (text) { const m = O.me(); if (!m || !text) return text; if (m.f === 'semo') return text.replace(/([가-힣a-zA-Z])\.(\s|$)/g, '$1!$2'); if (m.f === 'dong') return text.replace(/!/g, '.').replace(/~/g, ''); return text; };
  /** 이번 주 주제(ISO 주): ops.json weekThemes. 원격 설정이 덮을 수 있는 구조 */
  O.week = function () { const d = nowD(), t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())), dn = t.getUTCDay() || 7; t.setUTCDate(t.getUTCDate() + 4 - dn); const y0 = new Date(Date.UTC(t.getUTCFullYear(), 0, 1)), w = Math.ceil(((t - y0) / DAY + 1) / 7); return ((O.d && O.d.weekThemes) || []).find((x) => x.w === w) || null; };
  O.weekRec = function () { const ev = (O.cfg && O.cfg.calendar && O.cfg.calendar()) || [], m0 = nowD().getMonth() + 1; return ev.find((e) => !e.done && e.months.includes(m0)) || null; };

  /* ---------------- IP 층 UI:""", 1)
    # 카메오 도감 UI + 앨범 연결
    v = v.replace("  O.openCards = function", r"""  O.openCameos = function () {
    const I = GP(); if (!I) return; const { sc, body } = sheet(GF.t('ops.cam.title')), n = I.cameoCount(); el('p', 'xt-p', body, GF.t('ops.cam.seen', { n: n.got, total: n.total }));
    const g = el('div', 'ops-cams', body); ((ipD().cameos || []).filter((c) => c.kid === I.kid)).forEach((c) => { const has = I.hasCameo(c.id), d = el('div', 'ops-cam' + (has ? ' on' : ''), g); if (has) { const a = el('i', 'av', d); a.style.backgroundImage = 'url("' + GF.src(c.who) + '")'; el('span', 'pr', d, c.prop); if (!I.kid) el('small', '', d, GF.t('ops.cam.from', { app: appLabel(c.frm) })); } else el('span', 'pr', d, '🔒'); });
    const due = I.cameoGifts(); if (due.length) UK.btn({ text: GF.t('ops.cam.gift'), cls: 'gold block', onclick: () => { let it = null; due.forEach((id) => { it = I.claimCameoGift(id) || it; }); sc.close(); UK.toast(it ? GF.t('ops.mis.got', { name: it.name }) : GF.t('ops.mis.none'), safe()); GF.sfx('celebrate'); } }, body);
  };
  O.openCards = function""", 1)
    v = v.replace("      row(GF.t('ops.settings.passport'),", "      row(GF.t('ops.settings.cameo'), tb(GF.t('common.view'), () => { sc.close(); O.openCameos(); }));\n      row(GF.t('ops.settings.passport'),", 1)
    v = v.replace("    if (kid && GP()) { row(GF.t('ops.settings.kidbook'),", "    if (kid && GP()) { row(GF.t('ops.settings.cameo'), tb(GF.t('common.view'), () => { sc.close(); O.openCameos(); })); row(GF.t('ops.settings.kidbook'),", 1)
    o.write_text(v, encoding='utf-8')
# ---------- saga: 이번 주 줄 + 내 도형 칭호 ----------
sg = G / 'engine/saga.js'; w = sg.read_text(encoding='utf-8')
if 'sg-week' not in w:
    w = w.replace("    /* 곁가지 + 이어서 */", """    /* 이번 주 주제(10앱 같은 주 같은 시즌) + 내 도형 칭호(성인) */
    if (!kid && GF.ops && GF.ops.week) { const wk = GF.ops.week(), me = GF.ops.me && GF.ops.me(), rec = GF.ops.weekRec && GF.ops.weekRec(); if (wk || me) { const bar = el('div', 'sg-week', root); if (wk) { el('b', '', bar, (wk.icon || '') + ' ' + GF.t('ops.week.now', { title: wk.title })); if (rec) { const r = el('button', 'rec', bar, GF.t('ops.week.rec', { name: rec.title })); r.onclick = () => { GF.sfx('pick'); rec.play && rec.play(); }; } if (wk.webtoon && GF.ops.webtoonUrl()) { const wb = el('button', 'rec', bar, GF.t('ops.settings.webtoon')); wb.onclick = () => GF.ops.openWebtoon(wk.webtoon); } } if (me) el('small', '', bar, GF.t('ops.me.title', { name: me.name })); } }
    /* 곁가지 + 이어서 */""", 1)
    sg.write_text(w, encoding='utf-8')
# ---------- CSS ----------
c = G / 'engine/extras.css'; y = c.read_text(encoding='utf-8')
if '.ip-cameo' not in y:
    y += """
.ip-cameo { position: absolute; left: 12px; bottom: 96px; z-index: 40; display: flex; align-items: center; gap: 8px; max-width: 78%; padding: 6px 14px 6px 6px; border-radius: 30px; background: rgba(255,255,255,.96); box-shadow: var(--uk-sh-lg); pointer-events: none; animation: ipcam .45s ease-out both; transition: opacity .5s; } .ip-cameo.off { opacity: 0; } .ip-cameo.kid { left: 50%; transform: translateX(-50%); padding: 8px 18px 8px 8px; }
.ip-cameo .av { flex: none; width: 52px; height: 52px; border-radius: 50%; background: #FFF6E5 center 0 / 150% no-repeat; box-shadow: 0 0 0 3px #FFC933; } .ip-cameo .pr { font-size: 30px; } .ip-cameo .tx { font: 800 var(--uk-fs-cap)/1.3 var(--uk-font); color: var(--uk-ink); text-align: left; } .ip-cameo.kid .av { width: 72px; height: 72px; } .ip-cameo.kid .pr { font-size: 46px; }
@keyframes ipcam { from { transform: translateY(14px); opacity: 0; } } .ip-cameo.kid { animation-name: ipcamk; } @keyframes ipcamk { from { transform: translate(-50%, 14px); opacity: 0; } }
.ops-cams { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin: 6px 0; } .ops-cam { min-height: 84px; padding: 6px 4px; border-radius: 14px; background: #EDE7DD; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 2px; } .ops-cam.on { background: #FFF0B8; } .ops-cam .av { width: 40px; height: 40px; border-radius: 50%; background: #FFF6E5 center 0 / 150% no-repeat; } .ops-cam .pr { font-size: 26px; } .ops-cam small { font: 700 calc(10px * var(--uk-fs-k, 1))/1.2 var(--uk-font); color: var(--uk-ink2); text-align: center; }
.sg-week { position: absolute; left: 8px; right: 70px; top: 4px; z-index: 7; display: flex; flex-wrap: wrap; align-items: center; gap: 2px 8px; padding: 3px 10px; border-radius: 14px; background: rgba(255,255,255,.92); box-shadow: var(--uk-sh); font: 700 calc(12px * var(--uk-fs-k, 1))/1.3 var(--uk-font); } .sg-week b { font-weight: 900; } .sg-week .rec { border: 0; background: #DFF5E6; border-radius: 10px; padding: 2px 8px; font: 800 calc(12px * var(--uk-fs-k, 1))/1.3 var(--uk-font); } .sg-week small { color: var(--uk-ink2); width: 100%; }
"""
    c.write_text(y, encoding='utf-8')
print('ok')
