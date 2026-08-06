package project.backendmueblar.exception.auth;

public class RecoveryTokenNotFoundException extends RuntimeException {
    public RecoveryTokenNotFoundException(String message) {
        super(message);
    }
}
