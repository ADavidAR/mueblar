package project.backendmueblar.exception;

public class RecoveryTokenNotFoundException extends RuntimeException {
    public RecoveryTokenNotFoundException(String message) {
        super(message);
    }
}
