package project.backendmueblar.exception.auth;

public class UserIDNotMatchException extends RuntimeException {
    public UserIDNotMatchException(String message) {
        super(message);
    }
}
