package project.backendmueblar.exception;

public class ViolatedJWTIntegrity extends RuntimeException {
    public ViolatedJWTIntegrity(String message, Exception e) {
        super(message);
    }
}
