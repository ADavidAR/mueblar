package project.backendmueblar.modules.logEntry.entities.dtos.responses;

import lombok.Getter;
import lombok.Setter;

import java.time.OffsetDateTime;
import java.util.Map;
@Getter
@Setter
public class LogResponseDTO {
    private Long logId;
    private String tableName;

    private OffsetDateTime creationDate;

    private Map<String, Object> newValue;
    private Map<String, Object> oldValue;

    private Long userId;
    private String userFullName;
    private String userEmail;

    private String operationName;
}
