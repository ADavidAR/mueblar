package project.backendmueblar.exception;

public class EndpointNotExistForUser extends RuntimeException {
    public EndpointNotExistForUser(String message) {
        super(message);
    }
}
