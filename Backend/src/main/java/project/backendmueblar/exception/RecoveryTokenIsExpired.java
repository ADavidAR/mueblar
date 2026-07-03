package project.backendmueblar.exception;

public class RecoveryTokenIsExpired extends RuntimeException {
    public RecoveryTokenIsExpired(String message) {
        super(message);
    }
}
