package com.minimal.timetable;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.os.Build;

/**
 * 课前十分钟精准提醒接收器 (无常驻后台、纯事件驱动、极低功耗与内存)
 */
public class ReminderReceiver extends BroadcastReceiver {

    public static final String ACTION_REMINDER = "com.minimal.timetable.ACTION_COURSE_REMINDER";
    public static final String CHANNEL_ID = "course_reminder_channel";

    @Override
    public void onReceive(Context context, Intent intent) {
        if (intent == null) return;
        String action = intent.getAction();
        if (!ACTION_REMINDER.equals(action)) return;

        String courseName = intent.getStringExtra("course_name");
        String courseRoom = intent.getStringExtra("course_room");
        String courseTeacher = intent.getStringExtra("course_teacher");
        String courseTime = intent.getStringExtra("course_time");

        if (courseName == null || courseName.trim().isEmpty()) {
            courseName = "课程";
        }
        if (courseRoom == null || courseRoom.trim().isEmpty()) {
            courseRoom = "未指定教室";
        }
        if (courseTeacher == null || courseTeacher.trim().isEmpty()) {
            courseTeacher = "未指定教师";
        }

        NotificationManager nm = (NotificationManager) context.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null) return;

        // Android 8.0+ 适配高优先级通知渠道
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel channel = nm.getNotificationChannel(CHANNEL_ID);
            if (channel == null) {
                channel = new NotificationChannel(
                    CHANNEL_ID,
                    "课前10分钟提醒",
                    NotificationManager.IMPORTANCE_HIGH
                );
                channel.setDescription("在上课前10分钟弹出横幅提醒，展示教室地点与授课教师");
                channel.enableLights(true);
                channel.setLightColor(Color.BLUE);
                channel.enableVibration(true);
                channel.setLockscreenVisibility(Notification.VISIBILITY_PUBLIC);
                nm.createNotificationChannel(channel);
            }
        }

        // 点击通知唤醒/跳转应用
        Intent openIntent = new Intent(context, MainActivity.class);
        openIntent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_SINGLE_TOP);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        PendingIntent pi = PendingIntent.getActivity(context, (int) System.currentTimeMillis(), openIntent, flags);

        String title = "🔔 上课提醒: " + courseName;
        String content = "将于10分钟后开课 (" + (courseTime != null ? courseTime : "") + ") | 教室: " + courseRoom + " | 教师: " + courseTeacher;

        Notification.Builder builder;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            builder = new Notification.Builder(context, CHANNEL_ID);
        } else {
            builder = new Notification.Builder(context);
            builder.setPriority(Notification.PRIORITY_HIGH);
        }

        builder.setContentTitle(title)
               .setContentText(content)
               .setStyle(new Notification.BigTextStyle().bigText(content))
               .setSmallIcon(context.getApplicationInfo().icon)
               .setContentIntent(pi)
               .setAutoCancel(true)
               .setDefaults(Notification.DEFAULT_ALL);

        int notifId = (int) (System.currentTimeMillis() % 100000);
        nm.notify(notifId, builder.build());
    }
}
