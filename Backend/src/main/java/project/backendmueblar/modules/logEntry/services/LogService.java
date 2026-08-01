package project.backendmueblar.modules.logEntry.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import project.backendmueblar.exception.auth.UserIDNotMatchException;
import project.backendmueblar.exception.catalog.ResourceNotFoundException;
import project.backendmueblar.modules.logEntry.entities.LogsEntity;
import project.backendmueblar.modules.logEntry.entities.OperationTypeEntity;
import project.backendmueblar.modules.logEntry.repositories.LogRepository;
import project.backendmueblar.modules.logEntry.repositories.OperationTypeRepository;
import project.backendmueblar.modules.users.entities.UserEntity;
import project.backendmueblar.modules.users.repositories.RepositoryUser;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class LogService {

    private final LogRepository logRepository;
    private final RepositoryUser repositoryUser;
    private final OperationTypeRepository operationTypeRepository;

    public void logEntryDataBase(String tableName,
                                 Long userId,
                                 Map<String, Object> specificNewEntity,
                                 Map<String, Object> specificOldEntity,
                                 Integer operationId
    ){
        LogsEntity logsEntity = new LogsEntity();

        Optional<UserEntity> optionalUser = repositoryUser.findById(userId);
        if(optionalUser.isEmpty()) {
            throw new UserIDNotMatchException("User ID not match");
        }

        UserEntity userEntity = optionalUser.get();
        logsEntity.setUserEntity(userEntity);

        logsEntity.setNewValues(specificNewEntity);
        logsEntity.setPreviousValues(specificOldEntity);
        logsEntity.setTableName(tableName);

        Optional<OperationTypeEntity> optionalOperationType = operationTypeRepository.findById(Long.valueOf(operationId));
        if(optionalOperationType.isEmpty()) {
            throw new ResourceNotFoundException("Operation Type not found");
        }

        OperationTypeEntity operationTypeEntity = optionalOperationType.get();
        logsEntity.setOperationTypeEntity(operationTypeEntity);

        logsEntity.setCreationDate(OffsetDateTime.now());
        logRepository.save(logsEntity);
    }
}
