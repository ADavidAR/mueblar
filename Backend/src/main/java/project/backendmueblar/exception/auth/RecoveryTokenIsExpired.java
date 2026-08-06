package project.backendmueblar.exception.auth;

public class RecoveryTokenIsExpired extends RuntimeException {
    public RecoveryTokenIsExpired(String message) {
        super(message);
    }
}
