package com.trackdeal.myapp;

import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.os.Build;
import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        createNotificationChannels();
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

