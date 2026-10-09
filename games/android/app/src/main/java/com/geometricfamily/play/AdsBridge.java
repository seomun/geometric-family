package com.geometricfamily.play;

import android.app.Activity;
import android.os.Bundle;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import com.google.ads.mediation.admob.AdMobAdapter;
import com.google.android.gms.ads.AdError;
import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.FullScreenContentCallback;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;
import com.google.android.gms.ads.RequestConfiguration;
import com.google.android.gms.ads.interstitial.InterstitialAd;
import com.google.android.gms.ads.interstitial.InterstitialAdLoadCallback;
import com.google.android.gms.ads.rewarded.RewardedAd;
import com.google.android.gms.ads.rewarded.RewardedAdLoadCallback;
import com.google.android.ump.ConsentInformation;
import com.google.android.ump.ConsentRequestParameters;
import com.google.android.ump.UserMessagingPlatform;

import java.util.Arrays;

/**
 * 광고 브리지(D19). JS 의 GF.ads 가 `window.GFAds` 로 부른다.
 *  · 유아 앱(BuildConfig.GF_KID): 배너만. 아동 대상 처리(TFCD)·미성년 동의 처리·최대 등급 G·비개인화. 전면·보상형 요청 자체를 하지 않는다. 동의 창(UMP)도 띄우지 않는다.
 *  · 성인 앱: UMP 동의 → 초기화 → 배너·전면·보상형. 최대 등급 PG. (사행성·정치·주류 차단은 AdMob 콘솔의 차단 카테고리에서 — docs/16_ADS_RND.md D19)
 *  · 빈도·위치 규칙(전면 3판에 1회·2분30초·하루 8회·사연/실패/오늘의 한 판 직후 금지, 배너는 홈·지도에만)은 JS(GF.ads)가 정한다. 여기는 요청한 것을 그대로 보여 주기만 한다.
 *  · 광고를 눌러 앱 밖(브라우저·스토어)으로 나가는 동작은 SDK 기본 동작이다(WebView 의 이동 차단과 무관, SDK 가 자기 Activity/커스텀 탭을 연다) — 유아 앱 배너는 그래서 보호자 확인이 필요한 자리(홈·지도)에서만 노출하고, 문서에 적는다.
 */
public class AdsBridge {
    private final Activity act;
    private final WebView web;
    private final Runnable onLayout;      // 배너 자리가 바뀌었을 때(MainActivity 가 바닥 여백을 다시 알림)
    private final FrameLayout holder;      // 배너 자리(WebView 아래). 보이면 WebView 가 그만큼 줄어든다
    private final boolean kid = BuildConfig.GF_KID;
    private AdView banner;
    private InterstitialAd inter;
    private RewardedAd reward;
    private boolean inited = false, bannerWanted = false, loadingI = false, loadingR = false;
    private int bottomInset = 0;

    public AdsBridge(Activity act, WebView web, FrameLayout holder, Runnable onLayout) {
        this.act = act;
        this.onLayout = onLayout;
        this.web = web;
        this.holder = holder;
        holder.setVisibility(View.GONE);
        start();
    }

    private void start() {
        RequestConfiguration.Builder rc = new RequestConfiguration.Builder();
        if (kid) {
            rc.setTagForChildDirectedTreatment(RequestConfiguration.TAG_FOR_CHILD_DIRECTED_TREATMENT_TRUE)
                    .setTagForUnderAgeOfConsent(RequestConfiguration.TAG_FOR_UNDER_AGE_OF_CONSENT_TRUE)
                    .setMaxAdContentRating(RequestConfiguration.MAX_AD_CONTENT_RATING_G);
        } else {
            rc.setMaxAdContentRating(RequestConfiguration.MAX_AD_CONTENT_RATING_PG);
        }
        if (BuildConfig.GF_AD_TEST) rc.setTestDeviceIds(Arrays.asList(AdRequest.DEVICE_ID_EMULATOR));
        MobileAds.setRequestConfiguration(rc.build());
        if (kid) { initSdk(); return; }                      // 유아: 동의 창 없이 비개인화로만
        final ConsentInformation ci = UserMessagingPlatform.getConsentInformation(act);
        ConsentRequestParameters p = new ConsentRequestParameters.Builder().build();
        ci.requestConsentInfoUpdate(act, p,
                () -> UserMessagingPlatform.loadAndShowConsentFormIfRequired(act, err -> { if (ci.canRequestAds()) initSdk(); }),
                err -> { if (ci.canRequestAds()) initSdk(); });
        if (ci.canRequestAds()) initSdk();                   // 이전에 동의가 끝난 기기는 바로
    }

    private synchronized void initSdk() {
        if (inited) return;
        inited = true;
        MobileAds.initialize(act, st -> act.runOnUiThread(() -> {
            if (!kid) { loadInter(); loadReward(); }
            if (bannerWanted) showBanner(true);
        }));
    }

    private AdRequest req() {
        AdRequest.Builder b = new AdRequest.Builder();
        if (kid) { Bundle x = new Bundle(); x.putString("npa", "1"); b.addNetworkExtrasBundle(AdMobAdapter.class, x); }   // 비개인화
        return b.build();
    }

    private void loadInter() {
        if (kid || loadingI || inter != null) return;
        loadingI = true;
        InterstitialAd.load(act, BuildConfig.GF_AD_INTERSTITIAL, req(), new InterstitialAdLoadCallback() {
            @Override public void onAdLoaded(InterstitialAd ad) { inter = ad; loadingI = false; }
            @Override public void onAdFailedToLoad(LoadAdError e) { inter = null; loadingI = false; }
        });
    }

    private void loadReward() {
        if (kid || loadingR || reward != null) return;
        loadingR = true;
        RewardedAd.load(act, BuildConfig.GF_AD_REWARDED, req(), new RewardedAdLoadCallback() {
            @Override public void onAdLoaded(RewardedAd ad) { reward = ad; loadingR = false; }
            @Override public void onAdFailedToLoad(LoadAdError e) { reward = null; loadingR = false; }
        });
    }

    private void js(String s) { act.runOnUiThread(() -> { if (web != null) web.evaluateJavascript(s, null); }); }
    private void event(int id, String ev) { js("window.GF_adsEvent&&GF_adsEvent(" + id + ",'" + ev + "')"); }

    /** JS: 지금 그 종류를 보여 줄 수 있나 */
    @JavascriptInterface
    public boolean isReady(String kind) {
        if ("rewarded".equals(kind)) return !kid && reward != null;
        if ("interstitial".equals(kind)) return !kid && inter != null;
        if ("banner".equals(kind)) return banner != null;
        return false;
    }

    /** JS: 정보(아동 대상 여부·테스트 ID 여부) */
    @JavascriptInterface
    public String info() { return "{\"kid\":" + kid + ",\"test\":" + BuildConfig.GF_AD_TEST + ",\"inited\":" + inited + "}"; }

    @JavascriptInterface
    public void show(final String kind, final int id, final String placement) {
        act.runOnUiThread(() -> {
            if (kid) { event(id, "fail"); return; }          // 유아 앱은 전면·보상형 없음(방어)
            if ("rewarded".equals(kind)) {
                final RewardedAd ad = reward;
                if (ad == null) { event(id, "fail"); loadReward(); return; }
                reward = null;
                final boolean[] earned = { false };
                ad.setFullScreenContentCallback(new FullScreenContentCallback() {
                    @Override public void onAdDismissedFullScreenContent() { event(id, earned[0] ? "reward" : "close"); loadReward(); }
                    @Override public void onAdFailedToShowFullScreenContent(AdError e) { event(id, "fail"); loadReward(); }
                });
                ad.show(act, item -> earned[0] = true);
            } else if ("interstitial".equals(kind)) {
                final InterstitialAd ad = inter;
                if (ad == null) { event(id, "fail"); loadInter(); return; }
                inter = null;
                ad.setFullScreenContentCallback(new FullScreenContentCallback() {
                    @Override public void onAdDismissedFullScreenContent() { event(id, "close"); loadInter(); }
                    @Override public void onAdFailedToShowFullScreenContent(AdError e) { event(id, "fail"); loadInter(); }
                });
                ad.show(act);
            } else event(id, "fail");
        });
    }

    /** JS: 배너를 홈·지도에서만 켠다(판·사연·보호자 메뉴에서는 끈다) */
    @JavascriptInterface
    public void banner(final boolean on) {
        act.runOnUiThread(() -> { bannerWanted = on; showBanner(on); });
    }

    private void showBanner(boolean on) {
        if (!inited) return;
        if (!on) { holder.setVisibility(View.GONE); applyInsets(); notifyLayout(); return; }
        if (banner == null) {
            banner = new AdView(act);
            banner.setAdUnitId(BuildConfig.GF_AD_BANNER);
            int wDp = (int) (act.getResources().getDisplayMetrics().widthPixels / act.getResources().getDisplayMetrics().density);
            banner.setAdSize(AdSize.getCurrentOrientationAnchoredAdaptiveBannerAdSize(act, wDp));
            banner.setAdListener(new AdListener() {
                @Override public void onAdLoaded() { holder.setVisibility(bannerWanted ? View.VISIBLE : View.GONE); applyInsets(); notifyLayout(); }
                @Override public void onAdFailedToLoad(LoadAdError e) { holder.setVisibility(View.GONE); applyInsets(); notifyLayout(); }   // 못 불러오면 자리를 비운다(빈 띠 없음)
            });
            holder.addView(banner, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, android.view.Gravity.CENTER_HORIZONTAL));
            banner.loadAd(req());
        } else if (banner.getParent() != null) {
            holder.setVisibility(View.VISIBLE); applyInsets(); notifyLayout();
        }
    }

    /** 배너가 보일 때는 배너 아래에 내비 바 여백을 두고, WebView 에는 바닥 여백 0 을 알린다 */
    public void setBottomInset(int px) { bottomInset = px; applyInsets(); }
    public boolean bannerVisible() { return holder.getVisibility() == View.VISIBLE; }
    private void applyInsets() { holder.setPadding(0, 0, 0, bannerVisible() ? bottomInset : 0); }
    private void notifyLayout() { if (onLayout != null) onLayout.run(); js("window.GF&&GF.refit&&GF.refit()"); }

    public void pause() { if (banner != null) banner.pause(); }
    public void resume() { if (banner != null) banner.resume(); }
    public void destroy() { if (banner != null) { banner.destroy(); banner = null; } }
}
