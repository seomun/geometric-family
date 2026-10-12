import pathlib
A = pathlib.Path('games/android/app')
b = A / 'build.gradle'; s = b.read_text(encoding='utf-8')
if 'GF_IAP_ADFREE' not in s:
    s = s.replace("    f.buildConfigField 'boolean', 'GF_AD_TEST',", "    f.buildConfigField 'String', 'GF_IAP_ADFREE', \"\\\"${(project.findProperty(\"GF_IAP_ADFREE_${u}\") ?: '')}\\\"\"      // 광고 제거 상품 ID(없으면 구매 UI 숨김, 유아 flavor 는 무시)\n    f.buildConfigField 'String', 'GF_IAP_PACK', \"\\\"${(project.findProperty(\"GF_IAP_PACK_${u}\") ?: '')}\\\"\"          // 소품 팩 상품 ID\n    f.buildConfigField 'boolean', 'GF_AD_TEST',", 1)
    s = s.replace("    implementation 'com.google.android.play:review:2.0.2'", "    implementation 'com.google.android.play:review:2.0.2'\n    implementation 'com.android.billingclient:billing:7.1.1'          // 구매(성인 앱 광고 제거·소품 팩, 상품 ID 가 있을 때만 동작)\n    implementation 'androidx.work:work-runtime:2.9.1'                  // 로컬 알림(성인 앱, 기본 꺼짐)\n    implementation 'androidx.core:core:1.13.1'", 1)
    b.write_text(s, encoding='utf-8')
assert 'GF_IAP_ADFREE' in s and 'billing:7.1.1' in s
# 성인 flavor 매니페스트: POST_NOTIFICATIONS
for k in ['block', 'merge', 'quiz', 'sort', 'spot', 'tables', 'tile']:
    p = A / 'src' / k / 'AndroidManifest.xml'; t = p.read_text(encoding='utf-8')
    if 'POST_NOTIFICATIONS' not in t:
        t = t.replace('</manifest>', '    <!-- 로컬 알림(D21 H3): 성인 앱만, 설정에서 켤 때만 권한을 묻는다. 유아 앱엔 없다. -->\n    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />\n</manifest>')
        p.write_text(t, encoding='utf-8')
# 유아 flavor: 결제·알림 권한 제거
for k in ['toddler', 'color', 'day']:
    p = A / 'src' / k / 'AndroidManifest.xml'; t = p.read_text(encoding='utf-8')
    if 'POST_NOTIFICATIONS' not in t:
        t = t.replace('</manifest>', '    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" tools:node="remove" />\n    <uses-permission android:name="com.android.vending.BILLING" tools:node="remove" />\n</manifest>')
        p.write_text(t, encoding='utf-8')
m = A / 'src/main/java/com/geometricfamily/play/MainActivity.java'; t = m.read_text(encoding='utf-8')
if 'GFNotify' not in t:
    t = t.replace("    private AdsBridge ads;\n", "    private AdsBridge ads;\n    private GFNotify notify;\n    private GFBilling billing;\n", 1)
    t = t.replace('        web.addJavascriptInterface(ads, "GFAds");', '        notify = new GFNotify(this, web);\n        billing = new GFBilling(this, web);\n        web.addJavascriptInterface(notify, "GFNotify");                              // 로컬 알림(D21 H3): 성인 앱만\n        web.addJavascriptInterface(billing, "GFBilling");                            // 구매(D21 H1): 성인 앱만, 상품 ID 없으면 숨김\n        web.addJavascriptInterface(ads, "GFAds");', 1)
    t = t.replace("    private void hideBars() {", "    @Override\n    public void onRequestPermissionsResult(int code, String[] perms, int[] res) {\n        super.onRequestPermissionsResult(code, perms, res);\n        if (notify != null) notify.onPermission(code, res);\n    }\n\n    private void hideBars() {", 1)
    t = t.replace("        if (ads != null) ads.destroy();", "        if (ads != null) ads.destroy();\n        if (billing != null) billing.destroy();", 1)
    m.write_text(t, encoding='utf-8')
print('ok')
