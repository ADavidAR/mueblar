package project.backendmueblar.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionController {
    private static Map<String, List<Map<String, String>>> buildErrorResponse (RuntimeException exception) {
        List<Map<String, String>> errorsList = new ArrayList<>();
        Map<String, String> mapMessageError = new HashMap<>();
        mapMessageError.put("message", exception.getMessage());
        errorsList.add(mapMessageError);

        Map<String, List<Map<String, String>>> responseMap = new HashMap<>();
        responseMap.put("errors", errorsList);

        return responseMap;
    }

    // Bad Request
    @ExceptionHandler(EmailNotFoundException.class)
    public ResponseEntity<Map<String, List<Map<String, String>>>> handleEmailNotFound(EmailNotFoundException ex) {
        return ResponseEntity.status(400).body(buildErrorResponse(ex));
    }

    @ExceptionHandler(PasswordNotMatchWithUserException.class)
    public ResponseEntity<Map<String, List<Map<String, String>>>> handlePasswordNotMatchWithUser(PasswordNotMatchWithUserException ex) {
        return ResponseEntity.status(400).body(buildErrorResponse(ex));
    }

    // Forbidden
    @ExceptionHandler(UserDisabledException.class)
    public ResponseEntity<Map<String, List<Map<String, String>>>> handleUserDisabled(UserDisabledException ex) {
        return ResponseEntity.status(403).body(buildErrorResponse(ex));
    }

    // Conflict
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<Map<String, List<Map<String, String>>>> handleEmailAlreadyExists(EmailAlreadyExistsException ex) {
        return ResponseEntity.status(409).body(buildErrorResponse(ex));
    }


    // Internal Server Error
    @ExceptionHandler(RoleNotFoundException.class)
    public ResponseEntity<Map<String, List<Map<String, String>>>> handleRoleNotFound(RoleNotFoundException ex) {
        return ResponseEntity.status(500).body(buildErrorResponse(ex));
    }

    @ExceptionHandler(NoRelatedPermissionsException.class)
    public ResponseEntity<Map<String, List<Map<String, String>>>> handleNoRelatedPermissions(NoRelatedPermissionsException ex) {
        return ResponseEntity.status(500).body(buildErrorResponse(ex));
    }


    @ExceptionHandler(RecoveryTokenNotFoundException.class)
    public ResponseEntity<Map<String, List<Map<String, String>>>> handleRecoveryTokenNotFoundException(RecoveryTokenNotFoundException ex) {
        return ResponseEntity.status(404).body(buildErrorResponse(ex));
    }

    @ExceptionHandler(UserIDNotMatchException.class)
    public ResponseEntity<Map<String, List<Map<String, String>>>> handleUserIDNotMatchException(UserIDNotMatchException ex) {
        return ResponseEntity.status(403).body(buildErrorResponse(ex));
    }

    @ExceptionHandler(RecoveryTokenIsExpired.class)
    public ResponseEntity<Map<String, List<Map<String, String>>>> handleRecoveryTokenIsExpired(RecoveryTokenIsExpired ex) {
        return ResponseEntity.status(401).body(buildErrorResponse(ex));
    }

    // Exception for @Valid -> DTOs //
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, List<Map<String, String>>>> handleValidationErrors(MethodArgumentNotValidException ex) {

        List<Map<String, String>> errorsList = new ArrayList<>();

        for (FieldError fieldError : ex.getBindingResult().getFieldErrors()) {
            Map<String, String> mapMessageError = new HashMap<>();
            mapMessageError.put("message",  fieldError.getDefaultMessage());
            errorsList.add(mapMessageError);
        }

        Map<String, List<Map<String, String>>> responseMap = new HashMap<>();
        responseMap.put("errors", errorsList);

        return ResponseEntity.status(400).body(responseMap);
    }
}

