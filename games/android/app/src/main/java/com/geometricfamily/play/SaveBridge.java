package com.geometricfamily.play;

import android.content.ContentResolver;
import android.content.ContentValues;
import android.content.Context;
import android.net.Uri;
import android.os.Build;
import android.provider.MediaStore;
import android.util.Base64;
import android.webkit.JavascriptInterface;

import java.io.OutputStream;

/** 이미지 저장 다리(window.GFSave): 권한 없이 MediaStore 로 Pictures/기하학 가족 에 PNG 한 장. Android 10(29)+ 만 — 그 아래는 false(웹은 안내문). */
public class SaveBridge {
    private final Context ctx;
    SaveBridge(Context c) { ctx = c; }

    @JavascriptInterface
    public boolean image(String dataUrl, String name) {
        if (Build.VERSION.SDK_INT < 29 || dataUrl == null || name == null) return false;
        try {
            int i = dataUrl.indexOf(',');
            byte[] png = Base64.decode(dataUrl.substring(i + 1), Base64.DEFAULT);
            if (png.length < 100 || png.length > 8_000_000) return false;
            String safe = name.replaceAll("[^A-Za-z0-9._-]", "_");
            ContentResolver r = ctx.getContentResolver();
            ContentValues v = new ContentValues();
            v.put(MediaStore.Images.Media.DISPLAY_NAME, safe);
            v.put(MediaStore.Images.Media.MIME_TYPE, "image/png");
            v.put(MediaStore.Images.Media.RELATIVE_PATH, "Pictures/기하학 가족");
            v.put(MediaStore.Images.Media.IS_PENDING, 1);
            Uri u = r.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, v);
            if (u == null) return false;
            try (OutputStream o = r.openOutputStream(u)) { o.write(png); }
            v.clear(); v.put(MediaStore.Images.Media.IS_PENDING, 0); r.update(u, v, null, null);
            return true;
        } catch (Exception e) { return false; }
    }
}
