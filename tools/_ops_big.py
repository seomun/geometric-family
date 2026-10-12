import pathlib
p = pathlib.Path('games/engine/ops.js'); s = p.read_text(encoding='utf-8')
big = r'''
  /* ---------------- 구매(H1): 성인 앱 「광고 제거」·「소품 팩」(확정 지급). 상품 ID 가 없으면 숨김, 유아 앱은 없음 ---------------- */
  const iapKey = () => 'gf:' + O.app + ':iap';
  O.iap = {
    native: () => (window.GFBilling && typeof window.GFBilling.info === 'function' ? window.GFBilling : null),
    info() { try { return JSON.parse(O.iap.native().info()) || {}; } catch (e) { return {}; } },
    configured(kind) { return !O.kid && !!O.iap.native() && !!(O.iap.info()[kind] || {}).configured; },
    price(kind) { return (O.iap.info()[kind] || {}).price || ''; },
    owned(kind) { return !!(LS(iapKey()) || {})[kind]; },
    buy(kind) { const n = O.iap.native(); if (n) { try { n.buy(kind); } catch (e) {} } },
    restore() { const n = O.iap.native(); if (n) { try { n.restore(); } catch (e) {} } },
  };
  const PACK_N = 5;
  function applyIap(kind, fresh) {
    const k = iapKey(), v = LS(k) || {}, had = !!v[kind]; v[kind] = 1; LS(k, v);
    if (kind === 'adfree') { if (GF.ads) { GF.ads.config.adFree = true; GF.ads.banner && GF.ads.banner(false); } if (fresh && !had) UK.toast(GF.t('ops.iap.thanks'), safe()); }
    if (kind === 'pack' && !had) { let n = 0; for (let i = 0; i < PACK_N; i++) { const it = nextGift(); if (it && Room.grant(it.id)) n++; } UK.toast(GF.t('ops.iap.packgot', { n }), safe()); }
  }
  window.GF_billEvent = (kind, ev) => {
    if (ev === 'owned' || ev === 'restored') applyIap(kind, ev === 'owned');
    else if (ev === 'pending') UK.toast(GF.t('ops.iap.pending'), safe());
    else if (ev === 'fail') UK.toast(GF.t('ops.iap.fail'), safe());
  };

  /* ---------------- 로컬 알림(H3): 성인 앱만·기본 꺼짐·하루 1회 이하·설정에서 켤 때만 권한 요청 ---------------- */
  O.notif = {
    native: () => (!O.kid && window.GFNotify && typeof window.GFNotify.available === 'function' && window.GFNotify.available() ? window.GFNotify : null),
    on: () => !!S().notif,
    set(on) { const n = O.notif.native(); if (!n) return; S().notif = on ? 1 : 0; if (GF.save) GF.save(); try { on ? n.enable() : n.disable(); } catch (e) {} },
  };
  window.GF_notifEvent = (ev) => { if (ev === 'denied') { S().notif = 0; if (GF.save) GF.save(); UK.toast(GF.t('ops.notif.denied'), safe()); } else if (ev === 'granted') UK.toast(GF.t('ops.notif.on'), safe()); };
'''
marker = "  /* ---------------- 설정 줄(extras 가 부른다) ---------------- */"
if 'O.iap = {' not in s:
    s = s.replace(marker, big + "\n" + marker, 1)
old = "    row(GF.t('ops.settings.backup'), tb(GF.t('common.view'), () => { sc.close(); O.openBackup(); }));\n"
assert old in s
if 'ops.settings.notif' not in s:
    s = s.replace(old, """    if (!kid && O.notif.native()) row(GF.t('ops.settings.notif'), UK.switch(O.notif.on(), (on) => { O.notif.set(on); }));
    if (!kid && (O.iap.configured('adfree') || O.iap.configured('pack'))) {
      if (O.iap.configured('adfree')) row(GF.t('ops.iap.adfree'), O.iap.owned('adfree') ? el('b', '', null, GF.t('ops.iap.owned')) : tb(O.iap.price('adfree') || GF.t('ops.iap.buy'), () => { sc.close(); O.iap.buy('adfree'); }));
      if (O.iap.configured('pack')) row(GF.t('ops.iap.pack'), O.iap.owned('pack') ? el('b', '', null, GF.t('ops.iap.owned')) : tb(O.iap.price('pack') || GF.t('ops.iap.buy'), () => { sc.close(); O.iap.buy('pack'); }));
      row(GF.t('ops.iap.restore'), tb(GF.t('common.view'), () => { O.iap.restore(); UK.toast(GF.t('ops.iap.restoring'), safe()); }));
    }
""" + old, 1)
# 시작 때: 이미 산 광고 제거 반영 + 복원
if 'O.iap.restore()' not in s.split('O.init = function')[1]:
    s = s.replace("    if (!O.ready) return;\n", "    if (!O.ready) return;\n    if (!O.kid && O.iap.owned('adfree') && GF.ads) GF.ads.config.adFree = true;   // 이미 산 「광고 제거」\n    if (!O.kid) setTimeout(() => { try { if (O.iap.native()) O.iap.restore(); } catch (e) {} }, 2500);   // 재설치·기기 변경 복원(기기 안 조회)\n", 1)
p.write_text(s, encoding='utf-8')
# ads: adFree → 배너·전면 끔
a = pathlib.Path('games/engine/ads.js'); t = a.read_text(encoding='utf-8')
t = t.replace("      on = !!on && A.config.banner && A.live(); if (on === A._banner) return; A._banner = on;", "      on = !!on && A.config.banner && A.live() && !A.config.adFree; if (on === A._banner) return; A._banner = on;   // 광고 제거 구매자는 배너 없음", 1)
t = t.replace("      if (!A.available('interstitial')) return false;", "      if (c.adFree || !A.available('interstitial')) return false;", 1)
a.write_text(t, encoding='utf-8')
# 문자열
b = pathlib.Path('tools/ops_build.py'); u = b.read_text(encoding='utf-8')
add = """    'ops.settings.notif': '오늘의 한 판 알림', 'ops.notif.denied': '알림 권한이 꺼져 있어요. 휴대폰 설정에서 켤 수 있어요.', 'ops.notif.on': '하루 한 번, 저녁에 알려 드릴게요.',
    'ops.iap.adfree': '광고 제거', 'ops.iap.pack': '소품 팩', 'ops.iap.owned': '구매했어요', 'ops.iap.buy': '구매', 'ops.iap.restore': '구매 복원', 'ops.iap.restoring': '구매 내역을 확인하고 있어요.',
    'ops.iap.thanks': '고마워요! 광고가 사라졌어요. 선택해서 보는 광고의 보상은 바로 받아요.', 'ops.iap.packgot': '집 소품 {n}개를 놓아 두었어요.', 'ops.iap.pending': '결제가 확인되면 적용돼요.', 'ops.iap.fail': '구매하지 못했어요. 나중에 다시 해 주세요.',
"""
if "'ops.iap.adfree'" not in u:
    u = u.replace("    'ops.back.title':", add + "    'ops.back.title':", 1)
u = u.replace("'오랜만에 오시면 작은 선물을 놓아 둘게요.'", "'오랜만에 오시면 작은 선물을 놓아 둘게요.', '설정에서 하루 한 번 「오늘의 한 판」 알림을 켤 수 있어요(기본은 꺼짐).'") if "알림을 켤 수 있어요" not in u else u
b.write_text(u, encoding='utf-8')
print('ok')
