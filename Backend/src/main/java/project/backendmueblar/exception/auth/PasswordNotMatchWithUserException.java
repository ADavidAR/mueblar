package project.backendmueblar.exception.auth;

public class PasswordNotMatchWithUserException extends RuntimeException {
    public PasswordNotMatchWithUserException(String message) {
        super(message);
    }
}
