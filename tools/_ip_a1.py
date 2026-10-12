import pathlib
G = pathlib.Path('games')
# ---- Java: GFOps.openUrl / openStore / hasApp / launch (성인 전용) ----
j = G / 'android/app/src/main/java/com/geometricfamily/play/GFOps.java'; t = j.read_text(encoding='utf-8')
if 'openUrl' not in t:
    t = t.replace("import android.content.Intent;", "import android.content.Intent;\nimport android.content.pm.PackageManager;", 1)
    t = t.replace("    @JavascriptInterface\n    public void review() {", """    /** 웹툰(블로그) 등 https 주소를 시스템 브라우저로 연다 — 성인 앱 전용(유아 flavor 는 무시), https 만 허용 */
    @JavascriptInterface
    public void openUrl(final String url) {
        if (BuildConfig.GF_KID || url == null || !url.startsWith("https://")) return;
        act.runOnUiThread(() -> { try { act.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url))); } catch (Exception ignored) { } });
    }

    /** 형제 앱 모음: 스토어 열기(성인 전용) */
    @JavascriptInterface
    public void openStore(final String pkg) {
        if (BuildConfig.GF_KID || pkg == null || !pkg.startsWith("com.geometricfamily.")) return;
        act.runOnUiThread(() -> {
            try { act.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("market://details?id=" + pkg))); }
            catch (Exception e) { try { act.startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse("https://play.google.com/store/apps/details?id=" + pkg))); } catch (Exception ignored) { } }
        });
    }

    @JavascriptInterface
    public boolean hasApp(String pkg) {
        if (BuildConfig.GF_KID || pkg == null || !pkg.startsWith("com.geometricfamily.")) return false;
        try { act.getPackageManager().getPackageInfo(pkg, 0); return true; } catch (PackageManager.NameNotFoundException e) { return false; }
    }

    @JavascriptInterface
    public void launch(final String pkg) {
        if (BuildConfig.GF_KID || pkg == null || !pkg.startsWith("com.geometricfamily.")) return;
        act.runOnUiThread(() -> { try { Intent i = act.getPackageManager().getLaunchIntentForPackage(pkg); if (i != null) act.startActivity(i); } catch (Exception ignored) { } });
    }

    @JavascriptInterface
    public void review() {""", 1)
    j.write_text(t, encoding='utf-8')
# ShareStore okKey
ss = G / 'android/app/src/main/java/com/geometricfamily/play/ShareStore.java'; u = ss.read_text(encoding='utf-8')
if 'gf:ip:' not in u:
    u = u.replace('static boolean okKey(String k) { return k != null && (k.equals("gf:house:kid:v1") || k.equals("gf:house:adult:v1")); }', 'static boolean okKey(String k) { return k != null && (k.equals("gf:house:kid:v1") || k.equals("gf:house:adult:v1") || k.equals("gf:ip:kid:v1") || k.equals("gf:ip:adult:v1")); }', 1)
    assert 'gf:ip:' in u; ss.write_text(u, encoding='utf-8')
# ---- ip.js: 한 편 완성 도장 ----
p = G / 'engine/ip.js'; s = p.read_text(encoding='utf-8')
if "I.addStamp(I.app, 'story')" not in s:
    s = s.replace("I.L.taken.push(id); const it = Room.item(id); let got = false; if (it) got = Room.grant(id); write();", "I.L.taken.push(id); const it = Room.item(id); let got = false; if (it) got = Room.grant(id); write(); I.addStamp(I.app, 'story');", 1)
    p.write_text(s, encoding='utf-8')
# ---- ops.js: 웹툰 링크 ----
o = G / 'engine/ops.js'; v = o.read_text(encoding='utf-8')
if 'openWebtoon' not in v:
    v = v.replace("  /* ---------------- 설정 줄(extras 가 부른다) ---------------- */", """  /* ---------------- 웹툰 보기(성인 전용): 블로그 주소(data/ops.json webtoonUrl, 비면 숨김). 유아 앱에는 없다 ---------------- */
  O.webtoonUrl = () => (!O.kid && O.d && O.d.webtoonUrl) || '';
  O.openWebtoon = function (path) { const u = O.webtoonUrl() + (path || ''); if (!O.webtoonUrl()) return; const n = O.native(); if (n && n.openUrl) { try { n.openUrl(u); } catch (e) {} } else { try { window.open(u, '_blank', 'noopener'); } catch (e) {} } };

  /* ---------------- 설정 줄(extras 가 부른다) ---------------- */""", 1)
    v = v.replace("    row(GF.t('ops.settings.backup'),", "    if (!kid && O.webtoonUrl()) row(GF.t('ops.settings.webtoon'), tb(GF.t('common.view'), () => { sc.close(); O.openWebtoon(); }));\n    row(GF.t('ops.settings.backup'),", 1)
    o.write_text(v, encoding='utf-8')
# ---- saga rail: 웹툰 버튼(성인) ----
sg = G / 'engine/saga.js'; w = sg.read_text(encoding='utf-8')
if 'openWebtoon' not in w:
    w = w.replace("    if (o.side && o.side.length) {", "    if (!kid && GF.ops && GF.ops.webtoonUrl && GF.ops.webtoonUrl()) { o.side = (o.side || []).concat([{ icon: 'book', text: GF.t('ops.settings.webtoon'), fn: () => GF.ops.openWebtoon() }]); }   // 웹툰 보기(성인)\n    if (o.side && o.side.length) {", 1)
    sg.write_text(w, encoding='utf-8')
# ---- 공유 카드 ----
sc = G / 'engine/sharecard.js'
sc.write_text(r"""/* 공통 결과 공유 이미지 GF.share (games/22_IP_SYNERGY.md ⑥): 성인 7앱 결과 화면의 「공유 카드 저장」 — 「당신은 어느 도형인가요?」 + 내 도형 + 결과 + 기하학 가족 로고.
   코드(SVG→canvas→PNG)로만 만들고 SDK 없음. 저장: APK 는 GFSave(MediaStore, 권한 없음), 웹은 내려받기. 사용자가 눌렀을 때만 만든다. 로고는 코드 SVG(임시) — 아트 패스 때 슬롯 brand:logo 로 교체. */
(function () {
  'use strict';
  const S = (GF.share = {});
  const esc = (t) => String(t == null ? '' : t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const me = () => { try { const m = window.Room && Room.me && Room.me(), T = m && Room.data.meTypes && Room.data.meTypes[m.f]; if (T) return { char: T.char, color: T.color, bg: T.bg, name: T.sub[m.s] || T.name }; } catch (e) {} const T0 = (window.Room && Room.data && Room.data.meTypes && Room.data.meTypes.nemo) || { char: 'nemo_dad.joy', color: '#E8870F', bg: '#FFE3C2', name: '네모' }; return { char: T0.char, color: T0.color, bg: T0.bg, name: '' }; };
  /** SVG(360×450) 한 장: o = {title, stars, line} */
  S.svg = function (o) {
    const M = me(), W = 360, H = 450, appName = (GF.data.ops.appNames || {})[(GF.ops && GF.ops.app) || ''] || '', stars = '★'.repeat(o.stars || 0) + '☆'.repeat(3 - (o.stars || 0));
    const logo = `<g transform="translate(180 392)"><rect x="-58" y="-14" width="26" height="26" rx="6" fill="#E8870F"/><path d="M0 -16L16 12H-16z" fill="#FF8FA8" stroke="#fff" stroke-width="2" stroke-linejoin="round"/><circle cx="46" cy="-1" r="14" fill="#6C7BD9"/></g>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" rx="26" fill="${M.bg}"/><rect x="8" y="8" width="${W - 16}" height="${H - 16}" rx="20" fill="#fff" opacity=".55"/>`
      + `<text x="180" y="44" font-size="22" font-weight="900" text-anchor="middle" fill="${M.color}">당신은 어느 도형인가요?</text><image href="${GF.src(M.char)}" x="100" y="58" width="160" height="184" preserveAspectRatio="xMidYMid meet"/>`
      + (M.name ? `<text x="180" y="262" font-size="16" font-weight="800" text-anchor="middle" fill="#3A2E39">${esc(M.name)}</text>` : '')
      + `<text x="180" y="300" font-size="24" font-weight="900" text-anchor="middle" fill="#3A2E39">${esc(o.title || '클리어!')}</text><text x="180" y="334" font-size="28" text-anchor="middle" fill="#F2B100">${stars}</text>`
      + (o.line ? `<text x="180" y="358" font-size="13" font-weight="700" text-anchor="middle" fill="#7a6f84">${esc(o.line)}</text>` : '') + logo
      + `<text x="180" y="425" font-size="13" font-weight="800" text-anchor="middle" fill="#7a6f84">기하학 가족${appName ? ' · ' + esc(appName) : ''}</text></svg>`;
  };
  S.save = async function (o) {
    const svg = S.svg(o), img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); await img.decode();
    const c = document.createElement('canvas'); c.width = 1080; c.height = 1350; c.getContext('2d').drawImage(img, 0, 0, 1080, 1350);
    const nm = 'gihaha-family-' + ((GF.ops && GF.ops.app) || 'app') + '.png';
    if (window.GFSave && GFSave.image) { if (!GFSave.image(c.toDataURL('image/png'), nm)) throw new Error('save'); return 1; }
    const blob = await new Promise((r) => c.toBlob(r, 'image/png')); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nm; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); return 1;
  };
  /** 결과 시트에 버튼을 붙인다(ads.js 의 UK.result 래퍼가 부른다). 성인 앱 전용 */
  S.attach = function (sc, o) {
    try { if (!sc || (document.documentElement.getAttribute('data-uk') || 'kid') === 'kid') return; const acts = sc.querySelector('.acts'); if (!acts || acts.querySelector('.sh-card')) return;
      const b = UK.btn({ text: GF.t('ops.ip.share'), icon: 'share', cls: 'sky sh-card', onclick: () => { S.save({ title: o.title, stars: o.stars }).then(() => UK.toast(GF.t('ops.ip.shared'), document.getElementById('safe'))).catch(() => UK.toast(GF.t('ops.ip.sharefail'), document.getElementById('safe'))); } }, acts); void b; } catch (e) {}
  };
})();
""", encoding='utf-8')
# ads.js: 결과 래퍼에서 공유 버튼
a = G / 'engine/ads.js'; x = a.read_text(encoding='utf-8')
if 'GF.share.attach' not in x:
    old = "    const sc = _result.call(UK, o), h = A.resultHook; A.resultHook = null;"
    x = x.replace(old, old + "\n    if (GF.share && o && !A.isKid()) GF.share.attach(sc, o);   // 공유 카드 저장(성인)", 1); a.write_text(x, encoding='utf-8')
# 문자열
b = pathlib.Path('tools/ops_build.py'); z = b.read_text(encoding='utf-8')
if "'ops.ip.share'" not in z:
    z = z.replace("STR.update({'ops.ip.card'", "STR.update({'ops.ip.share': '공유 카드 저장', 'ops.ip.shared': '사진첩에 저장했어요.', 'ops.ip.sharefail': '저장하지 못했어요.', 'ops.settings.webtoon': '웹툰 보기', 'ops.ip.card'", 1); b.write_text(z, encoding='utf-8')
# 빌더·index
for f in ['build', 'build_idle', 'build_merge', 'build_color', 'build_quiz', 'build_block', 'build_spot', 'build_tile', 'build_sort', 'build_day']:
    q = G / 'tools' / f'{f}.py'; y = q.read_text(encoding='utf-8')
    if "'engine/sharecard.js'" not in y: y = y.replace("'engine/ip.js', ", "'engine/ip.js', 'engine/sharecard.js', ", 1)
    assert "'engine/sharecard.js'" in y, f; q.write_text(y, encoding='utf-8')
for h in ['index.html', 'idle/index.html', 'merge/index.html', 'color/index.html', 'quiz/index.html', 'block/index.html', 'spot/index.html', 'tile/index.html', 'sort/index.html', 'day/index.html']:
    q = G / h; y = q.read_text(encoding='utf-8'); pre = '' if h == 'index.html' else '../'
    tag = f'<script src="{pre}engine/sharecard.js"></script>'
    if tag not in y: y = y.replace(f'<script src="{pre}engine/ip.js"></script>', f'<script src="{pre}engine/ip.js"></script>\n{tag}', 1); assert tag in y, h; q.write_text(y, encoding='utf-8')
print('ok')
