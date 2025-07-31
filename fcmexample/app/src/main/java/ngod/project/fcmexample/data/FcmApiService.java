package ngod.project.fcmexample.data;

import retrofit2.Call;
import retrofit2.http.Body;
import retrofit2.http.POST;

public interface FcmApiService {
    @POST("sendFcm")
    Call<Void> sendFcm(@Body FcmRequest request);
}
