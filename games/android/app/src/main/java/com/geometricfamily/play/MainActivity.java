package com.geometricfamily.play;

import android.app.Activity;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.DisplayCutout;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.view.WindowInsetsController;
import android.view.WindowManager;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.window.OnBackInvokedCallback;
import android.window.OnBackInvokedDispatcher;

/** 단일 HTML(assets/index.html)을 오프라인으로 띄우는 껍데기. 외부 이동·권한·네트워크 없음. */
public class MainActivity extends Activity {
    private WebView web;

    @Override
    protected void onCreate(Bundle b) {
        super.onCreate(b);
        Window w = getWindow();
        w.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON);
        if (Build.VERSION.SDK_INT >= 28) {
            w.getAttributes().layoutInDisplayCutoutMode = WindowManager.LayoutParams.LAYOUT_IN_DISPLAY_CUTOUT_MODE_SHORT_EDGES;
        }
        w.setStatusBarColor(Color.TRANSPARENT);
        w.setNavigationBarColor(Color.TRANSPARENT);

        if ((getApplicationInfo().flags & android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0) WebView.setWebContentsDebuggingEnabled(true);   // 디버그 빌드에서만 원격 검사 허용
        web = new WebView(this);
        web.setBackgroundColor(0xFFFFF6E5);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);                       // localStorage = 진행 저장
        s.setAllowFileAccess(true);                         // file:///android_asset 만 사용
        s.setAllowContentAccess(false);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setCacheMode(WebSettings.LOAD_NO_CACHE);
        web.setOverScrollMode(View.OVER_SCROLL_NEVER);
        web.setLongClickable(false);
        web.setOnLongClickListener(v -> true);
        web.addJavascriptInterface(new ShareStore.Bridge(getApplicationContext()), "GFShare");   // 같은 서명 형제 앱과 집 저장 공유(권한 없음)
        web.addJavascriptInterface(new SaveBridge(getApplicationContext()), "GFSave");       // 이미지 저장(MediaStore, 권한 없음)
        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView v, WebResourceRequest r) {
                return true;                                // 앱 밖으로 나가는 이동은 전부 막는다 (Kids 정책)
            }

            @Override
            public void onPageFinished(WebView v, String url) {
                pushInsets(v.getRootWindowInsets());
            }
        });
        setContentView(web);
        web.setOnApplyWindowInsetsListener((v, insets) -> {
            pushInsets(insets);
            return insets;
        });
        hideBars();
        web.loadUrl("file:///android_asset/index.html");

        if (Build.VERSION.SDK_INT >= 33) {
            getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
                    OnBackInvokedDispatcher.PRIORITY_OVERLAY, (OnBackInvokedCallback) this::handleBack);
        }
    }

    private void hideBars() {
        if (Build.VERSION.SDK_INT >= 30) {
            getWindow().setDecorFitsSystemWindows(false);
            WindowInsetsController c = getWindow().getInsetsController();
            if (c != null) {
                c.hide(WindowInsets.Type.statusBars());                 // 내비게이션 바(제스처 막대·뒤로 버튼)는 남겨 둔다: 숨기면 제스처 뒤로가기·버튼 뒤로가기가 막힘
                c.setSystemBarsBehavior(WindowInsetsController.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE);
            }
        } else {
            getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE
                    | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_FULLSCREEN);
        }
    }

    /** 노치·컷아웃 높이를 CSS 변수(--sat)로 알려 상단 바가 가려지지 않게 한다. */
    private void pushInsets(WindowInsets in) {
        if (in == null || web == null) return;
        int top = 0;
        if (Build.VERSION.SDK_INT >= 28) {
            DisplayCutout c = in.getDisplayCutout();
            if (c != null) top = c.getSafeInsetTop();
        }
        int bottom = Build.VERSION.SDK_INT >= 30 ? in.getInsets(WindowInsets.Type.navigationBars()).bottom : in.getSystemWindowInsetBottom();
        float d = getResources().getDisplayMetrics().density;
        web.evaluateJavascript("document.documentElement.style.setProperty('--sat','" + (top / d)
                + "px');document.documentElement.style.setProperty('--sab','" + (bottom / d)
                + "px');window.GF&&GF.refit&&GF.refit()", null);
    }

    private void handleBack() {
        web.evaluateJavascript("(window.GF&&GF.back&&GF.back())?'1':'0'", v -> {
            if (!"\"1\"".equals(v)) finish();
        });
    }

    @Override
    public void onBackPressed() {
        handleBack();                                       // 33 이상에서 콜백이 등록돼 있으면 시스템이 이 메서드를 부르지 않는다(이중 처리 없음). 부르면 폴백으로 처리
    }

    @Override
    protected void onPause() {
        super.onPause();
        web.evaluateJavascript("window.GF&&GF.setHidden&&GF.setHidden(true)", null);   // BGM 정지
        web.onPause();
        web.pauseTimers();
    }

    @Override
    protected void onResume() {
        super.onResume();
        web.resumeTimers();
        web.onResume();
        web.evaluateJavascript("window.GF&&GF.setHidden&&GF.setHidden(false)", null);
        hideBars();
    }

    @Override
    protected void onDestroy() {
        if (web != null) {
            web.destroy();
            web = null;
        }
        super.onDestroy();
    }
}
