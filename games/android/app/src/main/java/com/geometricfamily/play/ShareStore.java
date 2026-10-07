package com.geometricfamily.play;

import android.content.ContentProvider;
import android.content.ContentValues;
import android.content.Context;
import android.content.SharedPreferences;
import android.database.Cursor;
import android.database.MatrixCursor;
import android.net.Uri;
import android.os.Binder;
import android.os.Process;
import android.webkit.JavascriptInterface;

import org.json.JSONArray;

/**
 * 같은 서명의 형제 앱끼리 "집" 저장을 나누는 공유 저장소(D12 그룹별). 권한 선언 없음 — 읽는 쪽 호출자의 서명이 같은지 직접 확인한다.
 * 유아 그룹(놀이터·색칠북)과 성인 그룹(식탁·합치기·어느 도형)은 서로 읽지 않는다. 유아↔성인은 보호자 잠금 뒤 6자리 코드로만 잇는다.
 */
public class ShareStore extends ContentProvider {
    static final String[] KID = {"com.geometricfamily.play", "com.geometricfamily.color"};
    static final String[] ADULT = {"com.geometricfamily.tables", "com.geometricfamily.merge", "com.geometricfamily.quiz", "com.geometricfamily.block", "com.geometricfamily.spot", "com.geometricfamily.tile", "com.geometricfamily.sort"};
    static final String PREFS = "gfshare";

    static boolean okKey(String k) { return k != null && (k.equals("gf:house:kid:v1") || k.equals("gf:house:adult:v1")); }
    static String[] group(String k) { return k.contains(":kid:") ? KID : ADULT; }
    static boolean in(String[] g, String pkg) { for (String x : g) if (x.equals(pkg)) return true; return false; }

    /** 다른 앱이 content://<패키지>.share/<키> 로 읽으러 온다. 서명이 다르면 빈 결과. */
    @Override
    public Cursor query(Uri u, String[] p, String s, String[] a, String o) {
        Context c = getContext();
        MatrixCursor m = new MatrixCursor(new String[]{"v"});
        String key = u.getLastPathSegment();
        if (c == null || !okKey(key) || !in(group(key), c.getPackageName())) return m;      // 이 앱의 그룹 키만 내준다
        String[] callers = c.getPackageManager().getPackagesForUid(Binder.getCallingUid()); boolean fromGroup = false;
        if (callers != null) for (String x : callers) if (in(group(key), x)) fromGroup = true;
        if (!fromGroup) return m;                                                           // 다른 그룹 앱이 와도 빈 결과
        if (c.getPackageManager().checkSignatures(Binder.getCallingUid(), Process.myUid()) != android.content.pm.PackageManager.SIGNATURE_MATCH) return m;
        String v = c.getSharedPreferences(PREFS, Context.MODE_PRIVATE).getString(key, null);
        if (v != null) m.addRow(new Object[]{v});
        return m;
    }

    @Override public boolean onCreate() { return true; }
    @Override public String getType(Uri u) { return null; }
    @Override public Uri insert(Uri u, ContentValues v) { return null; }
    @Override public int delete(Uri u, String s, String[] a) { return 0; }
    @Override public int update(Uri u, ContentValues v, String s, String[] a) { return 0; }

    /** 웹(JS) 쪽 다리: window.GFShare.put / peers */
    public static class Bridge {
        private final Context ctx;
        Bridge(Context c) { ctx = c; }

        @JavascriptInterface
        public void put(String key, String json) {
            if (!okKey(key) || !in(group(key), ctx.getPackageName()) || json == null || json.length() > 200000) return;
            ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putString(key, json).apply();
        }

        /** 같은 그룹의 설치된 형제 앱이 올려 둔 값들을 JSON 배열(문자열 목록)로 */
        @JavascriptInterface
        public String peers(String key) {
            JSONArray out = new JSONArray();
            if (!okKey(key) || !in(group(key), ctx.getPackageName())) return out.toString();       // 다른 그룹 키는 묻지도 못한다
            for (String pkg : group(key)) {
                if (pkg.equals(ctx.getPackageName())) continue;
                try (Cursor c = ctx.getContentResolver().query(Uri.parse("content://" + pkg + ".share/" + key), null, null, null, null)) {
                    if (c != null && c.moveToFirst()) out.put(c.getString(0));
                } catch (Exception e) { /* 설치 안 됨·서명 다름: 건너뜀 */ }
            }
            return out.toString();
        }
    }
}
