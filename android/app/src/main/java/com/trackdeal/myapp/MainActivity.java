package com.trackdeal.myapp;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.graphics.Color;
import android.os.Build;
import android.os.Bundle;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.CookieManager;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setupStatusBar();
        setupCookieManager();
        createNotificationChannels();
    }

    private void setupCookieManager() {
        try {
            CookieManager cookieManager = CookieManager.getInstance();
            cookieManager.setAcceptCookie(true);
            if (bridge != null && bridge.getWebView() != null) {
                cookieManager.setAcceptThirdPartyCookies(bridge.getWebView(), true);
            }
        } catch (Exception ignored) {}
    }

    @Override
    public void onResume() {
        super.onResume();
        setupCookieManager();
    }

    @Override
    public void onPause() {
        flushCookies();
        super.onPause();
    }

    @Override
    public void onStop() {
        flushCookies();
        super.onStop();
    }

    private void flushCookies() {
        try {
            CookieManager.getInstance().flush();
        } catch (Exception ignored) {}
    }

    private void setupStatusBar() {
        Window window = getWindow();
        if (window != null) {
            window.clearFlags(WindowManager.LayoutParams.FLAG_TRANSLUCENT_STATUS);
            window.addFlags(WindowManager.LayoutParams.FLAG_DRAWS_SYSTEM_BAR_BACKGROUNDS);
            window.setStatusBarColor(Color.WHITE);

            WindowInsetsControllerCompat insetsController =
                WindowCompat.getInsetsController(window, window.getDecorView());
            if (insetsController != null) {
                // Ensure status bar icons (time, battery, wifi) are dark on white background
                insetsController.setAppearanceLightStatusBars(true);
            }
        }
    }

    private void createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager manager = getSystemService(NotificationManager.class);
            if (manager == null) return;

            NotificationChannel defaultChannel = new NotificationChannel(
                "trackdeal_default",
                "TrackDeal Notifications",
                NotificationManager.IMPORTANCE_HIGH
            );
            defaultChannel.setDescription("Notifications for lead alerts, updates, and activities");
            defaultChannel.enableVibration(true);
            defaultChannel.enableLights(true);

            NotificationChannel reminderChannel = new NotificationChannel(
                "trackdeal_reminders",
                "Task & Follow-up Reminders",
                NotificationManager.IMPORTANCE_HIGH
            );
            reminderChannel.setDescription("Timely reminders for scheduled student callbacks and upcoming tasks");
            reminderChannel.enableVibration(true);
            reminderChannel.enableLights(true);

            manager.createNotificationChannel(defaultChannel);
            manager.createNotificationChannel(reminderChannel);
        }
    }
}

