package com.geometricfamily.play;

import android.app.Activity;
import android.content.Intent;
import android.net.Uri;
import android.webkit.JavascriptInterface;

import com.google.android.play.core.review.ReviewManager;
import com.google.android.play.core.review.ReviewManagerFactory;

/**
 * 운영 브리지(D21): window.GFOps — 문의 메일 · 인앱 리뷰 · 버전. 웹판·브라우저에는 없다(JS 가 no-op).
 *  · 메일: 시스템 메일 앱을 연다(앱 밖으로 나가는 이동 — 성인 설정/유아 보호자 메뉴(구구단 뒤)에서만 JS 가 부른다).
 *  · 리뷰: Google Play 인앱 리뷰 API. 성인 앱 전용(유아 앱은 이 호출을 무시한다). 빈도(10판 뒤 기쁜 순간·90일에 1회)는 JS(GF.ops)가 정한다.
 */
public class GFOps {
    private final Activity act;

    public GFOps(Activity act) {
        this.act = act;
    }

    @JavascriptInterface
    public String version() {
        return BuildConfig.VERSION_NAME;
    }

    @JavascriptInterface
    public void mail(final String to, final String subject, final String body) {
        act.runOnUiThread(() -> {
            try {
                Intent i = new Intent(Intent.ACTION_SENDTO, Uri.parse("mailto:" + Uri.encode(to)));
                i.putExtra(Intent.EXTRA_SUBJECT, subject);
                if (body != null && body.length() > 0) i.putExtra(Intent.EXTRA_TEXT, body);
                act.startActivity(i);
            } catch (Exception ignored) {
            }
        });
    }

    @JavascriptInterface
    public void review() {
        if (BuildConfig.GF_KID) return;                      // 유아 앱은 평가 요청 금지
        act.runOnUiThread(() -> {
            try {
                final ReviewManager m = ReviewManagerFactory.create(act);
                m.requestReviewFlow().addOnCompleteListener(t -> {
                    if (t.isSuccessful()) m.launchReviewFlow(act, t.getResult());
                });
            } catch (Exception ignored) {
            }
        });
    }
}
