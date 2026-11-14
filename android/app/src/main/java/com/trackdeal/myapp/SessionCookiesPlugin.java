package com.trackdeal.myapp;

import android.content.SharedPreferences;
import android.security.keystore.KeyGenParameterSpec;
import android.security.keystore.KeyProperties;
import android.util.Base64;
import android.webkit.CookieManager;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.nio.charset.StandardCharsets;
import java.security.KeyStore;
import javax.crypto.Cipher;
import javax.crypto.KeyGenerator;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;

@CapacitorPlugin(name = "SessionCookies")
public class SessionCookiesPlugin extends Plugin {
    private static final String KEY_ALIAS = "trackdeal_session_cookie_key";
    private static final String PREFS = "trackdeal_session_cookie_backup";
    private static final String COOKIE = "cookie";

    private SharedPreferences preferences() {
        return getContext().getSharedPreferences(PREFS, 0);
    }

    private SecretKey key() throws Exception {
        KeyStore keyStore = KeyStore.getInstance("AndroidKeyStore");
        keyStore.load(null);
        if (!keyStore.containsAlias(KEY_ALIAS)) {
            KeyGenerator generator = KeyGenerator.getInstance(KeyProperties.KEY_ALGORITHM_AES, "AndroidKeyStore");
            generator.init(new KeyGenParameterSpec.Builder(KEY_ALIAS,
                KeyProperties.PURPOSE_ENCRYPT | KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .build());
            generator.generateKey();
        }
        return ((KeyStore.SecretKeyEntry) keyStore.getEntry(KEY_ALIAS, null)).getSecretKey();
    }

    private String encrypt(String value) throws Exception {
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.ENCRYPT_MODE, key());
        return Base64.encodeToString(cipher.getIV(), Base64.NO_WRAP) + ":" +
            Base64.encodeToString(cipher.doFinal(value.getBytes(StandardCharsets.UTF_8)), Base64.NO_WRAP);
    }

    private String decrypt(String value) throws Exception {
        String[] parts = value.split(":", 2);
        if (parts.length != 2) throw new IllegalArgumentException("Invalid cookie backup");
        Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
        cipher.init(Cipher.DECRYPT_MODE, key(),
            new GCMParameterSpec(128, Base64.decode(parts[0], Base64.NO_WRAP)));
        return new String(cipher.doFinal(Base64.decode(parts[1], Base64.NO_WRAP)), StandardCharsets.UTF_8);
    }

    private String cookieValue(String url, String name) {
        String cookies = CookieManager.getInstance().getCookie(url);
        if (cookies == null) return null;
        for (String cookie : cookies.split(";")) {
            String part = cookie.trim();
            if (part.startsWith(name + "=")) return part.substring(name.length() + 1);
        }
        return null;
    }

    @PluginMethod
    public void flush(PluginCall call) {
        try {
            String url = call.getString("url");
            String name = call.getString("name");
            if (url != null && name != null) {
                String value = cookieValue(url, name);
                if (value != null && !value.isEmpty()) {
                    preferences().edit().putString(COOKIE, encrypt(value))
                        .putString("url", url).putString("name", name).commit();
                }
            }
            CookieManager.getInstance().flush();
            JSObject result = new JSObject();
            result.put("flushed", true);
            call.resolve(result);
        } catch (Exception error) {
            call.reject("Unable to persist the session cookie", error);
        }
    }

    @PluginMethod
    public void restore(PluginCall call) {
        String url = call.getString("url");
        String name = call.getString("name");
        String backup = preferences().getString(COOKIE, null);
        if (url == null || name == null || backup == null ||
            !url.equals(preferences().getString("url", null)) ||
            !name.equals(preferences().getString("name", null)) ||
            cookieValue(url, name) != null) {
            call.resolve(new JSObject());
            return;
        }
        try {
            String value = decrypt(backup);
            CookieManager.getInstance().setCookie(url,
                name + "=" + value + "; Path=/api/v1/auth; Max-Age=604800; Secure; HttpOnly; SameSite=None",
                accepted -> {
                    if (accepted) CookieManager.getInstance().flush();
                    call.resolve(new JSObject());
                });
        } catch (Exception error) {
            // An invalidated Android Keystore key must not block login.
            preferences().edit().clear().commit();
            call.resolve(new JSObject());
        }
    }

    @PluginMethod
    public void clear(PluginCall call) {
        preferences().edit().clear().commit();
        call.resolve(new JSObject());
    }
}
