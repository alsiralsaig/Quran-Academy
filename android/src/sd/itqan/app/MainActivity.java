package sd.itqan.app;

import android.Manifest;
import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.View;
import android.view.Window;
import android.view.WindowInsets;
import android.webkit.CookieManager;
import android.webkit.PermissionRequest;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.Toast;

/**
 * تطبيق إتقان: غلاف WebView بيفتح موقع الأكاديمية ويعرّف نفسه بـ «ItqanApp/<role>»
 * عشان الموقع يقفل على بوابة الدور ده بس. القيم بتتحقن وقت البناء (BuildConfig).
 */
public class MainActivity extends Activity {
    private WebView web;
    private ValueCallback<Uri[]> fileCallback;
    private PermissionRequest pendingPermission;
    private long lastBack;
    private static final int FILE_REQ = 41, MIC_REQ = 42;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        Window w = getWindow();
        w.setStatusBarColor(Color.parseColor("#042f2e"));
        w.setNavigationBarColor(Color.parseColor("#042f2e"));

        FrameLayout root = new FrameLayout(this);
        root.setBackgroundColor(Color.parseColor("#042f2e"));
        web = new WebView(this);
        root.addView(web, new FrameLayout.LayoutParams(-1, -1));
        setContentView(root);

        // Android 15 بيرسم ورا شريط الحالة: نخلّي مسافة للأشرطة وللكيبورد
        root.setOnApplyWindowInsetsListener((v, insets) -> {
            int l, t, r, b;
            if (Build.VERSION.SDK_INT >= 30) {
                android.graphics.Insets i = insets.getInsets(WindowInsets.Type.systemBars() | WindowInsets.Type.ime());
                l = i.left; t = i.top; r = i.right; b = i.bottom;
            } else {
                l = insets.getSystemWindowInsetLeft(); t = insets.getSystemWindowInsetTop();
                r = insets.getSystemWindowInsetRight(); b = insets.getSystemWindowInsetBottom();
            }
            v.setPadding(l, t, r, b);
            return insets;
        });

        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false);
        s.setAllowFileAccess(false);
        s.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        s.setUserAgentString(s.getUserAgentString() + " ItqanApp/" + BuildConfig.FLAVOR + " ItqanAndroid/" + BuildConfig.VERSION);
        CookieManager.getInstance().setAcceptCookie(true);

        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if ("https".equals(u.getScheme()) && BuildConfig.HOST.equals(u.getHost())) return false;
                openExternal(u); // واتساب، زووم، تلفون، روابط المكتبة...
                return true;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest req, WebResourceError err) {
                if (req.isForMainFrame()) showOffline();
            }
        });

        web.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView v, ValueCallback<Uri[]> cb, FileChooserParams p) {
                if (fileCallback != null) fileCallback.onReceiveValue(null);
                fileCallback = cb;
                try {
                    startActivityForResult(p.createIntent(), FILE_REQ);
                } catch (ActivityNotFoundException e) {
                    fileCallback = null;
                    return false;
                }
                return true;
            }

            @Override
            public void onPermissionRequest(PermissionRequest req) {
                // تسجيل التلاوة بالمايك
                for (String r : req.getResources()) {
                    if (PermissionRequest.RESOURCE_AUDIO_CAPTURE.equals(r)) {
                        if (checkSelfPermission(Manifest.permission.RECORD_AUDIO) == PackageManager.PERMISSION_GRANTED) {
                            req.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
                        } else {
                            pendingPermission = req;
                            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, MIC_REQ);
                        }
                        return;
                    }
                }
                req.deny();
            }
        });

        web.setDownloadListener((url, ua, cd, mime, len) -> openExternal(Uri.parse(url)));

        if (state != null) web.restoreState(state);
        else web.loadUrl(BuildConfig.START_URL);
    }

    private void openExternal(Uri u) {
        try {
            startActivity(new Intent(Intent.ACTION_VIEW, u));
        } catch (ActivityNotFoundException e) {
            Toast.makeText(this, "ما في تطبيق يفتح الرابط ده", Toast.LENGTH_SHORT).show();
        }
    }

    private void showOffline() {
        String html = "<html dir='rtl'><head><meta name='viewport' content='width=device-width,initial-scale=1'></head>"
            + "<body style='font-family:sans-serif;background:#042f2e;color:#fff;display:flex;flex-direction:column;align-items:center;justify-content:center;height:90vh;text-align:center'>"
            + "<div style='font-size:48px'>📶</div><h2>ما في اتصال بالإنترنت</h2>"
            + "<p style='color:#a7f3d0'>اتأكد من الشبكة وجرّب تاني</p>"
            + "<button onclick=\"location.href='" + BuildConfig.START_URL + "'\" style='margin-top:16px;padding:14px 40px;border:0;border-radius:16px;background:#f59e0b;color:#111;font-size:16px;font-weight:bold'>إعادة المحاولة</button>"
            + "</body></html>";
        web.loadDataWithBaseURL(BuildConfig.START_URL, html, "text/html", "utf-8", BuildConfig.START_URL);
    }

    @Override
    protected void onActivityResult(int req, int res, Intent data) {
        if (req == FILE_REQ && fileCallback != null) {
            fileCallback.onReceiveValue(WebChromeClient.FileChooserParams.parseResult(res, data));
            fileCallback = null;
            return;
        }
        super.onActivityResult(req, res, data);
    }

    @Override
    public void onRequestPermissionsResult(int req, String[] perms, int[] results) {
        if (req == MIC_REQ && pendingPermission != null) {
            if (results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED)
                pendingPermission.grant(new String[]{PermissionRequest.RESOURCE_AUDIO_CAPTURE});
            else pendingPermission.deny();
            pendingPermission = null;
        }
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) {
            web.goBack();
            return;
        }
        long now = System.currentTimeMillis();
        if (now - lastBack < 2500) {
            super.onBackPressed();
        } else {
            lastBack = now;
            Toast.makeText(this, "اضغط رجوع تاني للخروج", Toast.LENGTH_SHORT).show();
        }
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    protected void onPause() {
        super.onPause();
        CookieManager.getInstance().flush(); // نحفظ جلسة الدخول
    }
}
