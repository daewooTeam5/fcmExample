package ngod.project.fcmexample.data;

public class FcmRequest {
    private String message;
    private String topic;

    public FcmRequest(String message, String topic) {
        this.message = message;
        this.topic = topic;
    }
}
