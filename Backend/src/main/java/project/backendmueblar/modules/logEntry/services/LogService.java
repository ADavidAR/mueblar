package project.backendmueblar.modules.logEntry.services;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.backendmueblar.exception.auth.UserIDNotMatchException;
import project.backendmueblar.exception.catalog.InternalServerException;
import project.backendmueblar.exception.catalog.ResourceNotFoundException;
import project.backendmueblar.modules.logEntry.entities.LogsEntity;
import project.backendmueblar.modules.logEntry.entities.OperationTypeEntity;
import project.backendmueblar.modules.logEntry.entities.dtos.responses.LogResponseDTO;
import project.backendmueblar.modules.logEntry.repositories.LogRepository;
import project.backendmueblar.modules.logEntry.repositories.OperationTypeRepository;
import project.backendmueblar.modules.users.entities.RoleEntity;
import project.backendmueblar.modules.users.entities.UserEntity;
import project.backendmueblar.modules.users.repositories.RepositoryUser;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
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

    public List<LogResponseDTO> getLogsFromDBFilter(Integer limit, Integer page){
        if(limit == 0){
            throw new InternalServerException("Cannot throw zero Roles");
        }

        List<LogsEntity> logsEntityList;
        List<LogResponseDTO> logResponseDTOList = new ArrayList<>();
        Pageable pageable = PageRequest.of(page, limit);

        logsEntityList = logRepository.findAll(pageable).getContent();
        for(LogsEntity thisLogsEntity : logsEntityList){
            LogResponseDTO thisLogResponseDTO = new LogResponseDTO();
            thisLogResponseDTO.setLogId(thisLogsEntity.getLogId());
            thisLogResponseDTO.setCreationDate(thisLogsEntity.getCreationDate());
            thisLogResponseDTO.setTableName(thisLogsEntity.getTableName());
            thisLogResponseDTO.setNewValue(thisLogsEntity.getNewValues());
            thisLogResponseDTO.setOldValue(thisLogsEntity.getPreviousValues());
            thisLogResponseDTO.setOperationName(thisLogsEntity.getOperationTypeEntity().getOperationTypeName());

            thisLogResponseDTO.setUserId(thisLogsEntity.getUserEntity().getUserId());
            thisLogResponseDTO.setUserEmail(thisLogsEntity.getUserEntity().getEmail());
            thisLogResponseDTO.setUserFullName(String.format("%s %s", thisLogsEntity.getUserEntity().getFirstName(), thisLogsEntity.getUserEntity().getLastName()));
            logResponseDTOList.add(thisLogResponseDTO);
        }
        return logResponseDTOList;
    }
}
