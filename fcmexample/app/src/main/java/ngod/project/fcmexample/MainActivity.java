package ngod.project.fcmexample;

import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.util.Log;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.activity.EdgeToEdge;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.content.ContextCompat;
import androidx.core.graphics.Insets;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;

import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.messaging.FirebaseMessaging;

import com.google.firebase.database.DatabaseReference;
import com.google.firebase.database.FirebaseDatabase;

import java.util.UUID;

import ngod.project.fcmexample.utils.SharedManager;

import ngod.project.fcmexample.data.FcmApiService;
import ngod.project.fcmexample.data.FcmRequest;
import retrofit2.Call;
import retrofit2.Callback;
import retrofit2.Response;
import retrofit2.Retrofit;
import retrofit2.converter.gson.GsonConverterFactory;

import android.widget.Button;
import android.widget.EditText;

public class MainActivity extends AppCompatActivity {
    private Button sendButton;
    private EditText editText;
    private TextView textView;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        EdgeToEdge.enable(this);
        setContentView(R.layout.activity_main);
        ViewCompat.setOnApplyWindowInsetsListener(findViewById(R.id.main), (v, insets) -> {
            Insets systemBars = insets.getInsets(WindowInsetsCompat.Type.systemBars());
            v.setPadding(systemBars.left, systemBars.top, systemBars.right, systemBars.bottom);
            return insets;
        });
        // 권한 체크
        askNotificationPermission();
        // 유저 체크 (로그인 기능 없으므로 임의로 유저 아이디 생성)
        initDeviceSetting();
        // 토큰 설정 및 메시지 받을 수 있는 토픽 구독
        fcmMessagingService();

        EditText etText = findViewById(R.id.et_text);
        Button btnSend = findViewById(R.id.btn_send);
        textView = findViewById(R.id.tv_token);

        btnSend.setOnClickListener(v -> {
            String message = etText.getText().toString();
            if (!message.isEmpty()) {
                sendFcmMessage(message);
                etText.setText("");
            }
        });

    }

    private void initDeviceSetting() {
        SharedManager sm = SharedManager.getInstance(getApplicationContext());
        if (sm.getString("userid").isEmpty()) {
            SharedManager.getInstance(getApplicationContext()).saveString("userid", UUID.randomUUID().toString());
        }
    }

    private void fcmMessagingService() {
        FirebaseMessaging.getInstance().subscribeToTopic("news")
                .addOnCompleteListener(task -> {
                    if (task.isSuccessful()) {
                        Log.d("FCM", "✅ 토픽 구독 성공!");
                    } else {
                        Log.e("FCM", "❌ 토픽 구독 실패!", task.getException());
                    }
                });
        FirebaseMessaging.getInstance().getToken()
                .addOnCompleteListener(new OnCompleteListener<String>() {
                    @Override
                    public void onComplete(@NonNull Task<String> task) {
                        if (!task.isSuccessful()) {
                            Log.w("error", "Fetching FCM registration token failed", task.getException());
                            return;
                        }

                        // Get new FCM registration token
                        String token = task.getResult();
                        Log.d("token=", token);
                        textView.setText(token);

                        // Save the token to Firebase Realtime Database
                        SharedManager sm = SharedManager.getInstance(getApplicationContext());
                        String userId = sm.getString("userid");
                        Toast.makeText(MainActivity.this, userId, Toast.LENGTH_SHORT).show();
                        if (userId != null && !userId.isEmpty()) {
                            DatabaseReference database = FirebaseDatabase.getInstance("https://fcmexample-cdf89-default-rtdb.asia-southeast1.firebasedatabase.app").getReference();
                            Log.e("data", "onComplete: " + database);
                            database.child("users").child(userId).setValue(token);
                        }


                        // Log and toast
                        Toast.makeText(MainActivity.this, token, Toast.LENGTH_SHORT).show();
                    }
                });

    }

    // Declare the launcher at the top of your Activity/Fragment:
    private final ActivityResultLauncher<String> requestPermissionLauncher =
            registerForActivityResult(new ActivityResultContracts.RequestPermission(), isGranted -> {
                if (isGranted) {
                    // FCM SDK (and your app) can post notifications.
                } else {
                    // TODO: Inform user that that your app will not show notifications.
                }
            });

    private void askNotificationPermission() {
        // This is only necessary for API level >= 33 (TIRAMISU)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, android.Manifest.permission.POST_NOTIFICATIONS) ==
                    PackageManager.PERMISSION_GRANTED) {
                // FCM SDK (and your app) can post notifications.
            } else if (shouldShowRequestPermissionRationale(android.Manifest.permission.POST_NOTIFICATIONS)) {
            } else {
                // Directly ask for the permission
                requestPermissionLauncher.launch(android.Manifest.permission.POST_NOTIFICATIONS);
            }
        }
    }

    private void sendFcmMessage(String message) {
        Retrofit retrofit = new Retrofit.Builder()
                .baseUrl("https://us-central1-fcmexample-cdf89.cloudfunctions.net/")
                .addConverterFactory(GsonConverterFactory.create())
                .build();

        FcmApiService apiService = retrofit.create(FcmApiService.class);

        FcmRequest request = new FcmRequest(message, "news");

        apiService.sendFcm(request).enqueue(new Callback<Void>() {
            @Override
            public void onResponse(Call<Void> call, Response<Void> response) {
                if (response.isSuccessful()) {
                    Toast.makeText(MainActivity.this, "Message sent successfully!", Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(MainActivity.this, "Failed to send message.", Toast.LENGTH_SHORT).show();
                }
            }

            @Override
            public void onFailure(Call<Void> call, Throwable t) {
                Toast.makeText(MainActivity.this, "Error: " + t.getMessage(), Toast.LENGTH_SHORT).show();
            }
        });
    }
}