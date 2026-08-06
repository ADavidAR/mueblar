package project.backendmueblar.exception.auth;

public class EndpointNotExistForUser extends RuntimeException {
    public EndpointNotExistForUser(String message) {
        super(message);
    }
}
