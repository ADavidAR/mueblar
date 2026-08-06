package project.backendmueblar.exception.auth;

public class ViolatedJWTIntegrity extends RuntimeException {
    public ViolatedJWTIntegrity(String message, Exception e) {
        super(message);
    }
}
