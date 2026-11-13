package com.trackdeal.myapp;

import android.webkit.CookieManager;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

@CapacitorPlugin(name = "SessionCookies")
public class SessionCookiesPlugin extends Plugin {
    @PluginMethod
    public void flush(PluginCall call) {
        try {
            CookieManager.getInstance().flush();
            JSObject result = new JSObject();
            result.put("flushed", true);
            call.resolve(result);
        } catch (Exception error) {
            call.reject("Unable to persist the session cookie", error);
        }
    }
}
