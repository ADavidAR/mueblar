package project.backendmueblar.exception;

public class UserIDNotMatchException extends RuntimeException {
    public UserIDNotMatchException(String message) {
        super(message);
    }
}
