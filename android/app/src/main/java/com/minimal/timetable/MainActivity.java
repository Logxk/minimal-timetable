package com.minimal.timetable;

import android.Manifest;
import android.annotation.SuppressLint;
import android.app.Activity;
import android.app.AlarmManager;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.ContentResolver;
import android.content.ContentUris;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.provider.CalendarContract;
import android.provider.CalendarContract.Events;
import android.provider.CalendarContract.Reminders;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Calendar;
import java.util.Date;
import java.util.Locale;
import java.util.TimeZone;

public class MainActivity extends Activity {

    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;
    private static final int FILE_CHOOSER_REQUEST_CODE = 1001;
    private static final int PERMISSION_CALENDAR_CODE = 2001;
    private static final int PERMISSION_NOTIFICATION_CODE = 2002;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        // 沉浸式透明状态栏
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            Window window = getWindow();
            window.getDecorView().setSystemUiVisibility(
                View.SYSTEM_UI_FLAG_LAYOUT_STABLE |
                View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            );
            window.setStatusBarColor(Color.TRANSPARENT);
        }

        // 初始化通知渠道
        initNotificationChannel();

        // 硬件加速 WebView 纯本地引擎
        WebView.setWebContentsDebuggingEnabled(true);
        webView = new WebView(this);
        webView.setLayerType(View.LAYER_TYPE_HARDWARE, null);
        webView.setBackgroundColor(Color.parseColor("#F8F9FA"));
        webView.setOverScrollMode(View.OVER_SCROLL_NEVER);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setDatabaseEnabled(true);
        settings.setAllowFileAccess(true);
        settings.setAllowContentAccess(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        settings.setUseWideViewPort(true);
        settings.setLoadWithOverviewMode(true);
        settings.setDisplayZoomControls(false);
        settings.setBuiltInZoomControls(false);
        settings.setTextZoom(100);

        // 注册高性能原生 JavaScript 桥接对象
        webView.addJavascriptInterface(new AndroidBridge(), "AndroidBridge");

        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                return false;
            }
        });

        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (filePathCallback != null) {
                    filePathCallback.onReceiveValue(null);
                }
                filePathCallback = callback;

                Intent intent;
                if (params != null) {
                    intent = params.createIntent();
                } else {
                    intent = new Intent(Intent.ACTION_GET_CONTENT);
                    intent.setType("*/*");
                    intent.addCategory(Intent.CATEGORY_OPENABLE);
                }
                try {
                    startActivityForResult(intent, FILE_CHOOSER_REQUEST_CODE);
                } catch (Exception e) {
                    filePathCallback = null;
                    return false;
                }
                return true;
            }
        });

        setContentView(webView);
        webView.loadUrl("file:///android_asset/index.html");
    }

    private void initNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationManager nm = (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
            if (nm != null) {
                NotificationChannel channel = new NotificationChannel(
                    ReminderReceiver.CHANNEL_ID,
                    "课前10分钟提醒",
                    NotificationManager.IMPORTANCE_HIGH
                );
                channel.setDescription("课前十分钟弹出提醒通知");
                channel.enableLights(true);
                channel.enableVibration(true);
                nm.createNotificationChannel(channel);
            }
        }
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            if (filePathCallback != null) {
                Uri[] results = null;
                if (resultCode == Activity.RESULT_OK && data != null) {
                    Uri dataUri = data.getData();
                    if (dataUri != null) {
                        results = new Uri[]{dataUri};
                    } else if (data.getClipData() != null) {
                        int count = data.getClipData().getItemCount();
                        results = new Uri[count];
                        for (int i = 0; i < count; i++) {
                            results[i] = data.getClipData().getItemAt(i).getUri();
                        }
                    }
                }
                filePathCallback.onReceiveValue(results);
                filePathCallback = null;
            }
        } else {
            super.onActivityResult(requestCode, resultCode, data);
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        if (keyCode == KeyEvent.KEYCODE_BACK && event.getAction() == KeyEvent.ACTION_DOWN) {
            handleBackAction();
            return true;
        }
        return super.onKeyDown(keyCode, event);
    }

    @Override
    public void onBackPressed() {
        handleBackAction();
    }

    private void handleBackAction() {
        if (webView != null) {
            webView.evaluateJavascript("window.__handleAndroidBack ? window.__handleAndroidBack() : false;", new ValueCallback<String>() {
                @Override
                public void onReceiveValue(String value) {
                    if (!"true".equals(value)) {
                        if (webView.canGoBack()) {
                            webView.goBack();
                        } else {
                            MainActivity.super.onBackPressed();
                        }
                    }
                }
            });
        } else {
            super.onBackPressed();
        }
    }

    // =========================================================================
    // JavaScript 原生桥接接口 (高性能、零多余进程、按需调度)
    // =========================================================================
    public class AndroidBridge {

        @JavascriptInterface
        public boolean isNative() {
            return true;
        }

        @JavascriptInterface
        public boolean hasCalendarPermission() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                return checkSelfPermission(Manifest.permission.WRITE_CALENDAR) == PackageManager.PERMISSION_GRANTED &&
                       checkSelfPermission(Manifest.permission.READ_CALENDAR) == PackageManager.PERMISSION_GRANTED;
            }
            return true;
        }

        @JavascriptInterface
        public void requestCalendarPermission() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                requestPermissions(
                    new String[]{Manifest.permission.READ_CALENDAR, Manifest.permission.WRITE_CALENDAR},
                    PERMISSION_CALENDAR_CODE
                );
            }
        }

        @JavascriptInterface
        public boolean hasNotificationPermission() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                return checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) == PackageManager.PERMISSION_GRANTED;
            }
            return true;
        }

        @JavascriptInterface
        public void requestNotificationPermission() {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                requestPermissions(
                    new String[]{Manifest.permission.POST_NOTIFICATIONS},
                    PERMISSION_NOTIFICATION_CODE
                );
            }
        }

        /**
         * 写入手机系统日程表 (含课前十分钟提醒)
         */
        @JavascriptInterface
        public String syncCoursesToCalendar(String coursesJson, String semesterStartDate) {
            JSONObject result = new JSONObject();
            try {
                if (!hasCalendarPermission()) {
                    result.put("success", false);
                    result.put("needPermission", true);
                    result.put("message", "需要系统日历读写权限，请允许授权。");
                    return result.toString();
                }

                // 1. 先清除之前已写入的历史课程日程，避免重复
                clearCalendarEventsInternal();

                // 2. 获取有效日历 ID
                long calendarId = getOrCreateCalendarId();
                if (calendarId <= 0) {
                    result.put("success", false);
                    result.put("message", "未找到可用的系统日历账户");
                    return result.toString();
                }

                // 3. 解析学期开学日期 (第一周周一)
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
                Date startMondayDate = sdf.parse(semesterStartDate != null ? semesterStartDate : "2026-08-31");
                Calendar startMondayCal = Calendar.getInstance();
                startMondayCal.setTime(startMondayDate);

                // 作息时间表 (1-11节)
                String[][] periodTimes = {
                    {"08:00", "08:45"}, {"08:55", "09:40"},
                    {"10:10", "10:55"}, {"11:05", "11:50"},
                    {"14:30", "15:15"}, {"15:25", "16:10"},
                    {"16:40", "17:25"}, {"17:35", "18:20"},
                    {"19:00", "19:45"}, {"19:55", "20:40"},
                    {"20:45", "21:30"}
                };

                JSONArray coursesArray = new JSONArray(coursesJson);
                ContentResolver cr = getContentResolver();
                int totalCreated = 0;

                for (int i = 0; i < coursesArray.length(); i++) {
                    JSONObject c = coursesArray.getJSONObject(i);
                    String name = c.optString("name", "未命名课程");
                    String room = c.optString("room", "");
                    String teacher = c.optString("teacher", "");
                    int day = c.optInt("day", 1); // 1-7
                    int startPeriod = c.optInt("startPeriod", 1);
                    int endPeriod = c.optInt("endPeriod", 2);

                    String startTimeStr = (startPeriod >= 1 && startPeriod <= 11) ? periodTimes[startPeriod - 1][0] : "08:00";
                    String endTimeStr = (endPeriod >= 1 && endPeriod <= 11) ? periodTimes[endPeriod - 1][1] : "09:40";

                    String[] startHM = startTimeStr.split(":");
                    String[] endHM = endTimeStr.split(":");
                    int startH = Integer.parseInt(startHM[0]);
                    int startM = Integer.parseInt(startHM[1]);
                    int endH = Integer.parseInt(endHM[0]);
                    int endM = Integer.parseInt(endHM[1]);

                    // 解析周次列表
                    JSONArray weeksArray = c.optJSONArray("weeks");
                    int[] weeks;
                    if (weeksArray != null && weeksArray.length() > 0) {
                        weeks = new int[weeksArray.length()];
                        for (int w = 0; w < weeksArray.length(); w++) {
                            weeks[w] = weeksArray.getInt(w);
                        }
                    } else {
                        int sw = c.optInt("startWeek", 1);
                        int ew = c.optInt("endWeek", 16);
                        weeks = new int[Math.max(1, ew - sw + 1)];
                        for (int w = 0; w < weeks.length; w++) {
                            weeks[w] = sw + w;
                        }
                    }

                    for (int weekNum : weeks) {
                        // 计算目标日期
                        Calendar cal = (Calendar) startMondayCal.clone();
                        int dayOffset = (weekNum - 1) * 7 + (day - 1);
                        cal.add(Calendar.DAY_OF_YEAR, dayOffset);

                        Calendar startCal = (Calendar) cal.clone();
                        startCal.set(Calendar.HOUR_OF_DAY, startH);
                        startCal.set(Calendar.MINUTE, startM);
                        startCal.set(Calendar.SECOND, 0);
                        startCal.set(Calendar.MILLISECOND, 0);

                        Calendar endCal = (Calendar) cal.clone();
                        endCal.set(Calendar.HOUR_OF_DAY, endH);
                        endCal.set(Calendar.MINUTE, endM);
                        endCal.set(Calendar.SECOND, 0);
                        endCal.set(Calendar.MILLISECOND, 0);

                        ContentValues values = new ContentValues();
                        values.put(Events.CALENDAR_ID, calendarId);
                        values.put(Events.TITLE, name);
                        values.put(Events.EVENT_LOCATION, room);
                        values.put(Events.DESCRIPTION, "教师: " + teacher + "\n节次: 第" + startPeriod + "-" + endPeriod + "节\n第" + weekNum + "周\n[极简课表自动托管]");
                        values.put(Events.DTSTART, startCal.getTimeInMillis());
                        values.put(Events.DTEND, endCal.getTimeInMillis());
                        values.put(Events.EVENT_TIMEZONE, TimeZone.getDefault().getID());
                        values.put(Events.HAS_ALARM, 1);
                        values.put(Events.CUSTOM_APP_PACKAGE, getPackageName());
                        values.put(Events.SYNC_DATA1, "minimal_timetable_event");

                        Uri uri = cr.insert(Events.CONTENT_URI, values);
                        if (uri != null) {
                            totalCreated++;
                            long eventId = ContentUris.parseId(uri);
                            // 设定课前 10 分钟系统提醒
                            ContentValues remVal = new ContentValues();
                            remVal.put(Reminders.EVENT_ID, eventId);
                            remVal.put(Reminders.MINUTES, 10);
                            remVal.put(Reminders.METHOD, Reminders.METHOD_ALERT);
                            cr.insert(Reminders.CONTENT_URI, remVal);
                        }
                    }
                }

                result.put("success", true);
                result.put("count", totalCreated);
                result.put("message", "已成功将 " + totalCreated + " 条课程日程写入手机系统日历 (已设课前10分钟提醒)！");
            } catch (Exception e) {
                try {
                    result.put("success", false);
                    result.put("message", "写入系统日历失败: " + e.getMessage());
                } catch (Exception ignored) {}
            }
            return result.toString();
        }

        /**
         * 一键删除已写入系统日程表的全部课程
         */
        @JavascriptInterface
        public String clearCalendarCourses() {
            JSONObject result = new JSONObject();
            try {
                if (!hasCalendarPermission()) {
                    result.put("success", false);
                    result.put("needPermission", true);
                    result.put("message", "需要系统日历读写权限");
                    return result.toString();
                }

                int deleted = clearCalendarEventsInternal();
                result.put("success", true);
                result.put("count", deleted);
                result.put("message", "已从系统日历中一键清除 " + deleted + " 条课程日程！");
            } catch (Exception e) {
                try {
                    result.put("success", false);
                    result.put("message", "清除系统日程失败: " + e.getMessage());
                } catch (Exception ignored) {}
            }
            return result.toString();
        }

        /**
         * 获取当前已同步到日历的事件数
         */
        @JavascriptInterface
        public int getCalendarEventCount() {
            if (!hasCalendarPermission()) return 0;
            try {
                Cursor cursor = getContentResolver().query(
                    Events.CONTENT_URI,
                    new String[]{Events._ID},
                    Events.SYNC_DATA1 + " = ? OR " + Events.DESCRIPTION + " LIKE ?",
                    new String[]{"minimal_timetable_event", "%[极简课表自动托管]%"},
                    null
                );
                if (cursor != null) {
                    int c = cursor.getCount();
                    cursor.close();
                    return c;
                }
            } catch (Exception e) {
                e.printStackTrace();
            }
            return 0;
        }

        /**
         * 设置课前 10 分钟本地定时通知警报
         */
        @JavascriptInterface
        public String setAlarmReminders(boolean enabled, String coursesJson, String semesterStartDate) {
            JSONObject result = new JSONObject();
            try {
                AlarmManager am = (AlarmManager) getSystemService(Context.ALARM_SERVICE);
                if (am == null) {
                    result.put("success", false);
                    result.put("message", "系统闹钟服务不可用");
                    return result.toString();
                }

                // 无论开启或关闭，先清除已有 PendingIntent (保证干净无冗余)
                cancelAlarmReminders(am);

                if (!enabled) {
                    result.put("success", true);
                    result.put("enabled", false);
                    result.put("message", "已关闭课前10分钟提醒");
                    return result.toString();
                }

                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU && !hasNotificationPermission()) {
                    requestNotificationPermission();
                }

                // 解析近 14 天内的课程并设置精准触发 (保证低内存与低唤醒)
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd", Locale.getDefault());
                Date startMondayDate = sdf.parse(semesterStartDate != null ? semesterStartDate : "2026-08-31");
                Calendar startMondayCal = Calendar.getInstance();
                startMondayCal.setTime(startMondayDate);

                long now = System.currentTimeMillis();
                long twoWeeksLater = now + 14L * 24 * 60 * 60 * 1000;

                String[][] periodTimes = {
                    {"08:00", "08:45"}, {"08:55", "09:40"},
                    {"10:10", "10:55"}, {"11:05", "11:50"},
                    {"14:30", "15:15"}, {"15:25", "16:10"},
                    {"16:40", "17:25"}, {"17:35", "18:20"},
                    {"19:00", "19:45"}, {"19:55", "20:40"},
                    {"20:45", "21:30"}
                };

                JSONArray coursesArray = new JSONArray(coursesJson);
                int scheduledCount = 0;
                int reqCode = 5000;

                for (int i = 0; i < coursesArray.length(); i++) {
                    JSONObject c = coursesArray.getJSONObject(i);
                    String name = c.optString("name", "课程");
                    String room = c.optString("room", "");
                    String teacher = c.optString("teacher", "");
                    int day = c.optInt("day", 1);
                    int startPeriod = c.optInt("startPeriod", 1);
                    String startTimeStr = (startPeriod >= 1 && startPeriod <= 11) ? periodTimes[startPeriod - 1][0] : "08:00";
                    String[] hm = startTimeStr.split(":");
                    int startH = Integer.parseInt(hm[0]);
                    int startM = Integer.parseInt(hm[1]);

                    JSONArray weeksArray = c.optJSONArray("weeks");
                    int[] weeks;
                    if (weeksArray != null && weeksArray.length() > 0) {
                        weeks = new int[weeksArray.length()];
                        for (int w = 0; w < weeksArray.length(); w++) {
                            weeks[w] = weeksArray.getInt(w);
                        }
                    } else {
                        int sw = c.optInt("startWeek", 1);
                        int ew = c.optInt("endWeek", 16);
                        weeks = new int[Math.max(1, ew - sw + 1)];
                        for (int w = 0; w < weeks.length; w++) {
                            weeks[w] = sw + w;
                        }
                    }

                    for (int weekNum : weeks) {
                        Calendar cal = (Calendar) startMondayCal.clone();
                        int dayOffset = (weekNum - 1) * 7 + (day - 1);
                        cal.add(Calendar.DAY_OF_YEAR, dayOffset);
                        cal.set(Calendar.HOUR_OF_DAY, startH);
                        cal.set(Calendar.MINUTE, startM);
                        cal.set(Calendar.SECOND, 0);
                        cal.set(Calendar.MILLISECOND, 0);

                        // 提前十分钟触发
                        long triggerTime = cal.getTimeInMillis() - 10 * 60 * 1000;
                        if (triggerTime > now && triggerTime < twoWeeksLater) {
                            Intent intent = new Intent(MainActivity.this, ReminderReceiver.class);
                            intent.setAction(ReminderReceiver.ACTION_REMINDER);
                            intent.putExtra("course_name", name);
                            intent.putExtra("course_room", room);
                            intent.putExtra("course_teacher", teacher);
                            intent.putExtra("course_time", startTimeStr);

                            int flags = PendingIntent.FLAG_UPDATE_CURRENT;
                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                                flags |= PendingIntent.FLAG_IMMUTABLE;
                            }
                            PendingIntent pi = PendingIntent.getBroadcast(MainActivity.this, reqCode++, intent, flags);

                            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                                am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerTime, pi);
                            } else {
                                am.setExact(AlarmManager.RTC_WAKEUP, triggerTime, pi);
                            }
                            scheduledCount++;
                        }
                    }
                }

                result.put("success", true);
                result.put("enabled", true);
                result.put("count", scheduledCount);
                result.put("message", "已开启课前10分钟提醒 (已预约 " + scheduledCount + " 次上课提醒)");
            } catch (Exception e) {
                try {
                    result.put("success", false);
                    result.put("message", "设置提醒失败: " + e.getMessage());
                } catch (Exception ignored) {}
            }
            return result.toString();
        }

        /**
         * 立即弹出横幅通知 (供测试或实时提醒触发)
         */
        @JavascriptInterface
        public void postHeadsUpNotification(String courseName, String courseRoom, String courseTeacher, String courseTime) {
            Intent intent = new Intent(MainActivity.this, ReminderReceiver.class);
            intent.setAction(ReminderReceiver.ACTION_REMINDER);
            intent.putExtra("course_name", courseName);
            intent.putExtra("course_room", courseRoom);
            intent.putExtra("course_teacher", courseTeacher);
            intent.putExtra("course_time", courseTime);
            sendBroadcast(intent);
        }

        @JavascriptInterface
        public void showToast(String msg) {
            runOnUiThread(() -> Toast.makeText(MainActivity.this, msg, Toast.LENGTH_SHORT).show());
        }
    }

    private int clearCalendarEventsInternal() {
        ContentResolver cr = getContentResolver();
        return cr.delete(
            Events.CONTENT_URI,
            Events.SYNC_DATA1 + " = ? OR " + Events.DESCRIPTION + " LIKE ?",
            new String[]{"minimal_timetable_event", "%[极简课表自动托管]%"}
        );
    }

    private void cancelAlarmReminders(AlarmManager am) {
        // 取消预留的 PendingIntent (编号范围 5000-6000)
        int flags = PendingIntent.FLAG_NO_CREATE;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            flags |= PendingIntent.FLAG_IMMUTABLE;
        }
        for (int i = 5000; i < 5500; i++) {
            Intent intent = new Intent(this, ReminderReceiver.class);
            intent.setAction(ReminderReceiver.ACTION_REMINDER);
            PendingIntent pi = PendingIntent.getBroadcast(this, i, intent, flags);
            if (pi != null) {
                am.cancel(pi);
                pi.cancel();
            }
        }
    }

    private long getOrCreateCalendarId() {
        long calId = -1;
        ContentResolver cr = getContentResolver();
        try (Cursor cursor = cr.query(
            CalendarContract.Calendars.CONTENT_URI,
            new String[]{CalendarContract.Calendars._ID, CalendarContract.Calendars.IS_PRIMARY},
            null, null, null
        )) {
            if (cursor != null) {
                while (cursor.moveToNext()) {
                    long id = cursor.getLong(0);
                    int isPrimary = cursor.getInt(1);
                    if (isPrimary != 0) {
                        return id;
                    }
                    if (calId == -1) {
                        calId = id;
                    }
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        if (calId != -1) return calId;

        // 若无可用日历，创建本地专用日历账户
        try {
            ContentValues cv = new ContentValues();
            cv.put(CalendarContract.Calendars.ACCOUNT_NAME, "MinimalTimetable");
            cv.put(CalendarContract.Calendars.ACCOUNT_TYPE, CalendarContract.ACCOUNT_TYPE_LOCAL);
            cv.put(CalendarContract.Calendars.NAME, "极简课表");
            cv.put(CalendarContract.Calendars.CALENDAR_DISPLAY_NAME, "极简课表");
            cv.put(CalendarContract.Calendars.CALENDAR_COLOR, Color.rgb(34, 139, 230));
            cv.put(CalendarContract.Calendars.CALENDAR_ACCESS_LEVEL, CalendarContract.Calendars.CAL_ACCESS_OWNER);
            cv.put(CalendarContract.Calendars.OWNER_ACCOUNT, "MinimalTimetable");
            cv.put(CalendarContract.Calendars.VISIBLE, 1);
            cv.put(CalendarContract.Calendars.SYNC_EVENTS, 1);

            Uri uri = CalendarContract.Calendars.CONTENT_URI.buildUpon()
                .appendQueryParameter(CalendarContract.CALLER_IS_SYNCADAPTER, "true")
                .appendQueryParameter(CalendarContract.Calendars.ACCOUNT_NAME, "MinimalTimetable")
                .appendQueryParameter(CalendarContract.Calendars.ACCOUNT_TYPE, CalendarContract.ACCOUNT_TYPE_LOCAL)
                .build();
            Uri newUri = cr.insert(uri, cv);
            if (newUri != null) {
                return ContentUris.parseId(newUri);
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return 1;
    }
}
