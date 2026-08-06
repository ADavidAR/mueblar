package project.backendmueblar.exception.auth;

public class TokenJWTExpiredException extends RuntimeException {
    public TokenJWTExpiredException(String message) {
        super(message);
    }
}
