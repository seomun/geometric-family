package com.geometricfamily.play;

import android.app.Activity;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import com.android.billingclient.api.AcknowledgePurchaseParams;
import com.android.billingclient.api.BillingClient;
import com.android.billingclient.api.BillingClientStateListener;
import com.android.billingclient.api.BillingFlowParams;
import com.android.billingclient.api.BillingResult;
import com.android.billingclient.api.PendingPurchasesParams;
import com.android.billingclient.api.ProductDetails;
import com.android.billingclient.api.Purchase;
import com.android.billingclient.api.PurchasesUpdatedListener;
import com.android.billingclient.api.QueryProductDetailsParams;
import com.android.billingclient.api.QueryPurchasesParams;

import org.json.JSONObject;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 구매 브리지(D21 H1): window.GFBilling — 성인 앱의 「광고 제거」(1회)·「소품 팩」(1회, 확정 지급) 두 상품. 유아 앱은 어떤 경우에도 동작하지 않는다.
 *  · 상품 ID 는 gradle.properties 의 GF_IAP_ADFREE_<FLAVOR>·GF_IAP_PACK_<FLAVOR>(BuildConfig). **값이 비어 있으면 configured=false → JS 가 구매 UI 를 숨긴다.**
 *  · 서버 없음: 구매 확인은 Play 결제 라이브러리의 기기 내 조회(restore)로 한다. 소모성이 아닌 상품(구매 후 acknowledge).
 *  · JS 는 info()로 상태를 읽고 buy(kind)/restore()를 부르며, 결과는 GF_billEvent(kind, 'owned'|'cancel'|'fail'|'pending') 로 받는다.
 */
public class GFBilling implements PurchasesUpdatedListener {
    private final Activity act;
    private final WebView web;
    private final boolean kid = BuildConfig.GF_KID;
    private BillingClient client;
    private boolean ready = false;
    private final Map<String, String> ids = new HashMap<>();          // kind → productId
    private final Map<String, ProductDetails> details = new HashMap<>();
    private final Map<String, Boolean> owned = new HashMap<>();

    public GFBilling(Activity act, WebView web) {
        this.act = act;
        this.web = web;
        if (kid) return;
        put("adfree", BuildConfig.GF_IAP_ADFREE);
        put("pack", BuildConfig.GF_IAP_PACK);
        if (ids.isEmpty()) return;                                   // 상품 ID 가 없으면 아무것도 연결하지 않는다(숨김)
        client = BillingClient.newBuilder(act).setListener(this)
                .enablePendingPurchases(PendingPurchasesParams.newBuilder().enableOneTimeProducts().build()).build();
        client.startConnection(new BillingClientStateListener() {
            @Override public void onBillingSetupFinished(BillingResult r) { if (r.getResponseCode() == BillingClient.BillingResponseCode.OK) { ready = true; loadDetails(); restore(); } }
            @Override public void onBillingServiceDisconnected() { ready = false; }
        });
    }

    private void put(String kind, String id) { if (id != null && id.length() > 0) ids.put(kind, id); }

    private void loadDetails() {
        List<QueryProductDetailsParams.Product> ps = new ArrayList<>();
        for (String id : ids.values()) ps.add(QueryProductDetailsParams.Product.newBuilder().setProductId(id).setProductType(BillingClient.ProductType.INAPP).build());
        client.queryProductDetailsAsync(QueryProductDetailsParams.newBuilder().setProductList(ps).build(), (r, list) -> {
            for (ProductDetails d : list.getProductDetailsList()) details.put(d.getProductId(), d);
            js("window.GF_billEvent&&GF_billEvent('*','info')");
        });
    }

    /** JS: {"adfree":{"configured":true,"price":"₩1,900","owned":false},"pack":{…}} (유아·ID 없음이면 configured=false) */
    @JavascriptInterface
    public String info() {
        try {
            JSONObject o = new JSONObject();
            for (String kind : new String[]{"adfree", "pack"}) {
                JSONObject k = new JSONObject();
                String id = ids.get(kind);
                k.put("configured", id != null && !kid);
                ProductDetails d = id == null ? null : details.get(id);
                k.put("price", d != null && d.getOneTimePurchaseOfferDetails() != null ? d.getOneTimePurchaseOfferDetails().getFormattedPrice() : "");
                k.put("owned", Boolean.TRUE.equals(owned.get(kind)));
                o.put(kind, k);
            }
            return o.toString();
        } catch (Exception e) { return "{}"; }
    }

    @JavascriptInterface
    public void buy(final String kind) {
        act.runOnUiThread(() -> {
            String id = ids.get(kind); ProductDetails d = id == null ? null : details.get(id);
            if (kid || !ready || d == null) { event(kind, "fail"); return; }
            List<BillingFlowParams.ProductDetailsParams> pl = new ArrayList<>();
            pl.add(BillingFlowParams.ProductDetailsParams.newBuilder().setProductDetails(d).build());
            BillingResult r = client.launchBillingFlow(act, BillingFlowParams.newBuilder().setProductDetailsParamsList(pl).build());
            if (r.getResponseCode() != BillingClient.BillingResponseCode.OK) event(kind, "fail");
        });
    }

    /** 구매 복원: 이 계정의 이미 산 상품을 다시 확인(기기 변경·재설치) */
    @JavascriptInterface
    public void restore() {
        if (kid || client == null || !ready) return;
        client.queryPurchasesAsync(QueryPurchasesParams.newBuilder().setProductType(BillingClient.ProductType.INAPP).build(), (r, list) -> {
            if (r.getResponseCode() == BillingClient.BillingResponseCode.OK) handle(list, false);
        });
    }

    @Override
    public void onPurchasesUpdated(BillingResult r, List<Purchase> list) {
        int c = r.getResponseCode();
        if (c == BillingClient.BillingResponseCode.OK && list != null) handle(list, true);
        else if (c == BillingClient.BillingResponseCode.USER_CANCELED) event("*", "cancel");
        else if (c == BillingClient.BillingResponseCode.ITEM_ALREADY_OWNED) restore();
        else event("*", "fail");
    }

    private void handle(List<Purchase> list, boolean fresh) {
        for (Purchase p : list) {
            for (String pid : p.getProducts()) {
                String kind = null;
                for (Map.Entry<String, String> e : ids.entrySet()) if (e.getValue().equals(pid)) kind = e.getKey();
                if (kind == null) continue;
                if (p.getPurchaseState() == Purchase.PurchaseState.PENDING) { event(kind, "pending"); continue; }
                if (p.getPurchaseState() != Purchase.PurchaseState.PURCHASED) continue;
                owned.put(kind, true);
                if (!p.isAcknowledged()) client.acknowledgePurchase(AcknowledgePurchaseParams.newBuilder().setPurchaseToken(p.getPurchaseToken()).build(), br -> { });
                event(kind, fresh ? "owned" : "restored");
            }
        }
    }

    private void js(String s) { act.runOnUiThread(() -> { if (web != null) web.evaluateJavascript(s, null); }); }
    private void event(String kind, String ev) { js("window.GF_billEvent&&GF_billEvent('" + kind + "','" + ev + "')"); }

    public void destroy() { if (client != null) client.endConnection(); }
}
