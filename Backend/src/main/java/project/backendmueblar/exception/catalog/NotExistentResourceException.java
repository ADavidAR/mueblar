package project.backendmueblar.exception.catalog;

public class NotExistentResourceException extends RuntimeException {
    public NotExistentResourceException(String message) {
        super(message);
    }
}
