package ngod.project.fcmexample.utils;

import android.content.Context;
import android.content.SharedPreferences;

public class SharedManager {
    private static final String PREFS_NAME = "app_prefs";
    private static SharedManager INSTANCE;
    private final SharedPreferences prefs;

    private SharedManager(Context context) {
        prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE);
    }

    public static synchronized SharedManager getInstance(Context context) {
        if (INSTANCE == null) {
            INSTANCE = new SharedManager(context.getApplicationContext());
        }
        return INSTANCE;
    }

    public void saveString(String key, String value) {
        prefs.edit().putString(key, value).apply();
    }

    public String getString(String key, String defaultValue) {
        return prefs.getString(key, defaultValue);
    }

    public String getString(String key) {
        return prefs.getString(key, "");
    }

    public void saveInt(String key, int value) {
        prefs.edit().putInt(key, value).apply();
    }

    public int getInt(String key, int defaultValue) {
        return prefs.getInt(key, defaultValue);
    }

    public int getInt(String key) {
        return prefs.getInt(key, 0);
    }

    public void saveBoolean(String key, boolean value) {
        prefs.edit().putBoolean(key, value).apply();
    }

    public boolean getBoolean(String key, boolean defaultValue) {
        return prefs.getBoolean(key, defaultValue);
    }

    public boolean getBoolean(String key) {
        return prefs.getBoolean(key, false);
    }

    public void clear() {
        prefs.edit().clear().apply();
    }

    public void remove(String key) {
        prefs.edit().remove(key).apply();
    }
}
