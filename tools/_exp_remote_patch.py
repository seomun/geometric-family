"""⑪ 클라이언트에 서버 연결(S1 WP2~3) 층을 붙인다(멱등): ?api=… 가 있으면 계정(연령 화면)·클라우드 프로필·서버 뽑기·서버 레벨업·편성 저장, 없으면 S0 로컬 그대로."""
import io, sys
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
p = 'games/expedition/exp.js'; s = open(p, encoding='utf-8').read()
if 'remoteBoot' in s: print('skip'); sys.exit()
def sub(a, b):
    global s
    assert a in s, a[:70]; s = s.replace(a, b, 1)
i = s.index("  function pullOnce(rng) {"); j = s.index("  function pull(n, rng) {")
s = s[:i] + "  const pullOnce = (rng) => ExpGacha.pullOnce(G(), D.units, S.pity, rng);   // 서버와 같은 코어(gacha-core.js)\n" + s[j:]
REMOTE = r'''
  /* ---------------- 서버 연결(S1 WP2~3): ?api=http://127.0.0.1:8788 — 없으면 S0 로컬 그대로 ---------------- */
  const API = (new URLSearchParams(location.search)).get('api'), REMOTE = !!API, AUTHK = 'gfx:slice:auth', uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'r' + Date.now() + Math.random().toString(36).slice(2));
  let AUTH = null, AGE_DONE = null; try { AUTH = JSON.parse(localStorage.getItem(AUTHK)); } catch (e) { AUTH = null; }
  const setAuth = (a) => { AUTH = a; try { if (a) localStorage.setItem(AUTHK, JSON.stringify(a)); else localStorage.removeItem(AUTHK); } catch (e) { /* 저장 불가 */ } };
  async function http(method, path, body, noRetry) {
    const h = { 'content-type': 'application/json' }; if (AUTH && AUTH.access) h.authorization = 'Bearer ' + AUTH.access;
    const r = await fetch(API + path, { method, headers: h, body: body ? JSON.stringify(body) : undefined }), j = await r.json().catch(() => ({}));
    if (r.status === 401 && !noRetry && AUTH && AUTH.refresh) { const rr = await fetch(API + '/auth/refresh', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ refresh: AUTH.refresh }) }); if (rr.ok) { const t = await rr.json(); setAuth(Object.assign({}, AUTH, { access: t.access, refresh: t.refresh })); return http(method, path, body, true); } setAuth(null); }
    if (!r.ok) { const e = new Error(j.error || 'http_' + r.status); e.status = r.status; e.code = j.error; e.msg = j.msg; throw e; } return j;
  }
  const rprogKey = () => 'gfx:slice:rprog:' + (AUTH && AUTH.account);   // 서버 클리어 판정(WP4) 전까지 진행도는 기기에 둔다
  function applyProfile(p) {
    S.gems = p.wallet.free_gems + p.wallet.paid_gems; S.gold = p.wallet.gold; S.units = {}; Object.keys(p.units).forEach((id) => { S.units[id] = { lv: p.units[id].lv }; S.dups[id] = p.units[id].dups; }); S.party = p.progress.party; S.pity = { since5: p.pity.since5, since4: p.pity.since4, guard: p.pity.guard ? 1 : 0 }; S.pulls = p.pity.pulls; S.cap = p.cap_krw; S.band = p.age_band; S.guardian = p.guardian_notice;
    try { const x = JSON.parse(localStorage.getItem(rprogKey())); if (x) { S.cleared = x.cleared || 0; S.stars = x.stars || {}; S.flags = x.flags || {}; } } catch (e) { /* 진행도 없음 */ }
  }
  async function remoteBoot() {
    if (AUTH) { try { applyProfile(await http('GET', '/profile')); return; } catch (e) { setAuth(null); } }
    await new Promise((res) => { AGE_DONE = res; GF.go('xage'); }); applyProfile(await http('GET', '/profile'));
  }
  GF.screen('xage', {
    bare: true,
    enter(r) {
      r.classList.add('uk', 'ex'); GF.bg('field', r); const w = el('div', 'ex-age', r); el('div', 'uk-title', w, '기하학 원정대'); el('p', '', w, '처음이에요. 태어난 해와 달을 알려 주세요. 만 12세 이상만 이용할 수 있어요.');
      const y = el('select', 'ex-sel', w), m = el('select', 'ex-sel', w), now = new Date().getFullYear(); for (let k = now; k >= now - 90; k--) y.appendChild(new Option(k + '년', k)); for (let k = 1; k <= 12; k++) m.appendChild(new Option(k + '월', k)); y.value = now - 25;
      const msg = el('p', 'ex-agemsg', w);
      const go = UK.btn({ text: '시작하기', icon: 'play', cls: 'green block', onclick: async () => {
        go.disabled = true;
        try {
          const t = await (await fetch(API + '/auth/anon', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ device_hash: uid(), birth_ym: y.value + '-' + String(m.value).padStart(2, '0') }) })).json();
          if (t.error) { msg.textContent = t.error === 'age_blocked' ? '만 12세 미만은 이용할 수 없어요.' : '입력을 확인해 주세요.'; go.disabled = false; return; }
          setAuth({ account: t.account, access: t.access, refresh: t.refresh });
          if (t.guardian_notice) UK.modal({ parent: r, title: '안내', body: t.payments_blocked ? '만 14세 미만은 보호자 동의 전까지 결제를 이용할 수 없어요. 광고는 맞춤 없이 보여요.' : '만 19세 미만은 한 달 결제 한도가 7만 원이에요. 보호자와 함께 이용해 주세요.', actions: [{ text: '알겠어요', cls: 'green', onclick: () => { AGE_DONE && AGE_DONE(); } }] }); else AGE_DONE && AGE_DONE();
        } catch (e) { msg.textContent = '서버에 연결하지 못했어요.'; go.disabled = false; }
      } }, w);
    },
  });
  const levelUp = async (id, c) => {      // 로컬: 금화 차감 · 서버: /unit/levelup
    if (!REMOTE) { S.gold -= c; S.units[id].lv++; save(); bar(); return true; }
    try { const r = await http('POST', '/unit/levelup', { unit: id, request_id: uid() }); S.gold = r.wallet.gold; S.units[id].lv = r.unit.lv; bar(); return true; } catch (e) { UK.toast(e.code === 'insufficient_gold' ? '금화가 모자라요' : '서버 응답이 없어요', document.getElementById('safe')); return false; }
  };
  const partySync = () => { if (REMOTE) http('POST', '/party', { party: S.party }).catch(() => { UK.toast('편성을 저장하지 못했어요', document.getElementById('safe')); }); };
  const grantRemote = (gold, gems) => { if (!REMOTE || (!gold && !gems)) return Promise.resolve(); return http('POST', '/dev/grant', { gold, gems }).then((pr) => { S.gems = pr.wallet.free_gems + pr.wallet.paid_gems; S.gold = pr.wallet.gold; bar(); }).catch(() => {}); };
  const GC_FRAG = (g) => (g === 5 ? 20 : g === 4 ? 5 : 1);
  async function pullRemote(n) { const r = await http('POST', '/gacha/pull', { n, request_id: uid() }); S.gems = r.wallet.free_gems + r.wallet.paid_gems; S.pity = { since5: r.pity.since5, since4: r.pity.since4, guard: r.pity.guard ? 1 : 0 }; S.pulls = r.pity.pulls; const res = r.results.map((x) => ({ id: x.unit, grade: x.grade, isNew: x.isNew })); res.forEach((x) => { if (x.isNew) S.units[x.id] = { lv: 1 }; else S.dups[x.id] = (S.dups[x.id] || 0) + GC_FRAG(x.grade); }); bar(); return res; }
'''
sub("  /* ---------------- 계산 ---------------- */", REMOTE + "  /* ---------------- 계산 ---------------- */")
sub("const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* 용량·차단 */ } };", "const save = () => { try { if (REMOTE) { if (AUTH) localStorage.setItem(rprogKey(), JSON.stringify({ cleared: S.cleared, stars: S.stars, flags: S.flags })); } else localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { /* 용량·차단 */ } };")
sub("const run = (n) => { const res = pull(n, rng); if (!res) { UK.toast('반짝석이 모자라요. 전투를 깨면 받아요', r); return; } showPull(r, res); };", "const run = async (n) => { let res; try { res = REMOTE ? await pullRemote(n) : pull(n, rng); } catch (e) { UK.toast(e.code === 'insufficient_gems' ? '반짝석이 모자라요. 전투를 깨면 받아요' : '서버에 연결하지 못했어요', r); return; } if (!res) { UK.toast('반짝석이 모자라요. 전투를 깨면 받아요', r); return; } showPull(r, res); };")
sub("onclick: () => { if (!can) { UK.toast(lv >= D.bal.lvCap ? '이 슬라이스의 최고 레벨이에요' : '금화가 모자라요. 전투로 모아요', r); return; } S.gold -= c; S.units[sel].lv++; save(); bar(); GF.sfx('star'); draw(); drawGrid(); }", "onclick: async () => { if (!can) { UK.toast(lv >= D.bal.lvCap ? '이 슬라이스의 최고 레벨이에요' : '금화가 모자라요. 전투로 모아요', r); return; } if (await levelUp(sel, c)) { GF.sfx('star'); draw(); drawGrid(); } }")
sub("S.party[i] = sel; save(); sel = null;", "S.party[i] = sel; save(); partySync(); sel = null;")
sub("S.gold += gold; S.gems += gems; if (first) S.cleared = st.id;", "if (REMOTE) grantRemote(gold, gems); else { S.gold += gold; S.gems += gems; } if (first) S.cleared = st.id;")
sub("S = load(); if (/[?&]seed=(\\d+)/.test(location.search)) S.seed = +RegExp.$1;", "S = REMOTE ? fresh() : load(); if (/[?&]seed=(\\d+)/.test(location.search)) S.seed = +RegExp.$1; if (REMOTE) await remoteBoot();")
sub("pull: (n) => pull(n, rng),", "pull: (n) => pull(n, rng), remote: () => REMOTE, auth: () => AUTH, http: (m, pa, b) => http(m, pa, b),")
open(p, 'w', encoding='utf-8').write(s)
h = 'games/expedition/index.html'; t = open(h, encoding='utf-8').read(); t = t.replace('<script src="battle-core.js"></script>', '<script src="battle-core.js"></script>\n<script src="gacha-core.js"></script>'); open(h, 'w', encoding='utf-8').write(t)
b = 'games/tools/build_expedition.py'; u = open(b, encoding='utf-8').read(); u = u.replace("'expedition/battle-core.js', 'expedition/exp.js'", "'expedition/battle-core.js', 'expedition/gacha-core.js', 'expedition/exp.js'"); open(b, 'w', encoding='utf-8').write(u)
c = 'games/expedition/exp.css'; v = open(c, encoding='utf-8').read()
v += "\n.ex-age { position: absolute; left: 20px; right: 20px; top: 120px; text-align: center; } .ex-age p { font: 700 16px/1.45 var(--uk-font); color: var(--uk-ink2); } .ex-sel { font: 800 18px/1 var(--uk-font); padding: 10px 12px; margin: 6px 6px 14px; border-radius: 12px; border: 2px solid #d9c9a8; background: #fff; } .ex-agemsg { min-height: 24px; color: #E5334A !important; }\n"
open(c, 'w', encoding='utf-8').write(v); print('ok')
