package project.backendmueblar.exception.auth;

public class NoRelatedPermissionsException extends RuntimeException {
    public NoRelatedPermissionsException(String message) {
        super(message);
    }
}
