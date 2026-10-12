package com.geometricfamily.play;

import android.Manifest;
import android.app.Activity;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import androidx.annotation.NonNull;
import androidx.core.app.NotificationCompat;
import androidx.work.ExistingPeriodicWorkPolicy;
import androidx.work.PeriodicWorkRequest;
import androidx.work.WorkManager;
import androidx.work.Worker;
import androidx.work.WorkerParameters;

import java.util.Calendar;
import java.util.concurrent.TimeUnit;

/**
 * 로컬 알림 브리지(D21 H3): window.GFNotify — 「오늘의 한 판」 하루 1회 알림. **성인 앱만, 기본 꺼짐, 설정에서 켤 때만 권한을 요청**한다.
 *  · 서버 푸시 없음(서버 없음 원칙): WorkManager 주기 작업(24시간)이 저녁 7시쯤 한 번 알림을 띄운다. 야간(22~8시)에는 띄우지 않는다.
 *  · 유아 앱(BuildConfig.GF_KID)은 모든 호출을 무시한다(매니페스트에도 POST_NOTIFICATIONS 가 없다).
 *  · 결과는 GF_notifEvent('granted'|'denied'|'off') 로 JS 에 알린다.
 */
public class GFNotify {
    static final String WORK = "gf_daily", CHANNEL = "gf_daily";
    static final int REQ = 7301, HOUR = 19;
    private final Activity act;
    private final WebView web;
    private final boolean kid = BuildConfig.GF_KID;

    public GFNotify(Activity act, WebView web) { this.act = act; this.web = web; }

    @JavascriptInterface
    public boolean available() { return !kid; }

    /** 지금 권한이 있는가(Android 13 미만은 항상 true) */
    @JavascriptInterface
    public boolean granted() {
        return Build.VERSION.SDK_INT < 33 || act.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
    }

    /** 켜기: 필요하면 권한을 묻고, 허용되면 작업을 예약한다 */
    @JavascriptInterface
    public void enable() {
        if (kid) return;
        act.runOnUiThread(() -> {
            if (granted()) { schedule(); js("granted"); }
            else act.requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS}, REQ);
        });
    }

    @JavascriptInterface
    public void disable() {
        if (kid) return;
        WorkManager.getInstance(act.getApplicationContext()).cancelUniqueWork(WORK);
        js("off");
    }

    /** MainActivity.onRequestPermissionsResult 가 부른다 */
    public void onPermission(int code, int[] res) {
        if (code != REQ) return;
        if (res.length > 0 && res[0] == PackageManager.PERMISSION_GRANTED) { schedule(); js("granted"); } else js("denied");
    }

    private void schedule() {
        Calendar now = Calendar.getInstance(), at = Calendar.getInstance();
        at.set(Calendar.HOUR_OF_DAY, HOUR); at.set(Calendar.MINUTE, 0); at.set(Calendar.SECOND, 0);
        if (at.before(now)) at.add(Calendar.DAY_OF_YEAR, 1);
        long delay = at.getTimeInMillis() - now.getTimeInMillis();
        PeriodicWorkRequest req = new PeriodicWorkRequest.Builder(DailyWorker.class, 24, TimeUnit.HOURS).setInitialDelay(delay, TimeUnit.MILLISECONDS).build();
        WorkManager.getInstance(act.getApplicationContext()).enqueueUniquePeriodicWork(WORK, ExistingPeriodicWorkPolicy.UPDATE, req);
    }

    private void js(String ev) { act.runOnUiThread(() -> { if (web != null) web.evaluateJavascript("window.GF_notifEvent&&GF_notifEvent('" + ev + "')", null); }); }

    /** 하루 한 번 알림을 띄우는 작업(야간·권한 없음이면 조용히 건너뜀) */
    public static class DailyWorker extends Worker {
        public DailyWorker(@NonNull Context c, @NonNull WorkerParameters p) { super(c, p); }

        @NonNull
        @Override
        public Result doWork() {
            Context c = getApplicationContext();
            int h = Calendar.getInstance().get(Calendar.HOUR_OF_DAY);
            if (h >= 22 || h < 8) return Result.success();
            if (Build.VERSION.SDK_INT >= 33 && c.checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) return Result.success();
            NotificationManager nm = (NotificationManager) c.getSystemService(Context.NOTIFICATION_SERVICE);
            if (Build.VERSION.SDK_INT >= 26) nm.createNotificationChannel(new NotificationChannel(CHANNEL, "오늘의 한 판", NotificationManager.IMPORTANCE_DEFAULT));
            Intent i = new Intent(c, MainActivity.class).addFlags(Intent.FLAG_ACTIVITY_SINGLE_TOP | Intent.FLAG_ACTIVITY_CLEAR_TOP);
            PendingIntent pi = PendingIntent.getActivity(c, 0, i, PendingIntent.FLAG_IMMUTABLE | PendingIntent.FLAG_UPDATE_CURRENT);
            nm.notify(7302, new NotificationCompat.Builder(c, CHANNEL).setSmallIcon(c.getApplicationInfo().icon).setContentTitle(c.getString(c.getApplicationInfo().labelRes))
                    .setContentText("오늘의 한 판이 도착했어요").setContentIntent(pi).setAutoCancel(true).build());
            return Result.success();
        }
    }
}
