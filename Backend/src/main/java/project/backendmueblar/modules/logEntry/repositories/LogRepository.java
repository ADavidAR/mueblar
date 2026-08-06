package project.backendmueblar.modules.logEntry.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import project.backendmueblar.modules.logEntry.entities.LogsEntity;

import java.time.OffsetDateTime;
import java.util.List;

public interface LogRepository extends JpaRepository<LogsEntity, Long> {
    List<LogsEntity> findAllByTableNameContainingIgnoreCaseAndOperationTypeEntity_OperationTypeName(String tableName, String operationName, Pageable pageable);
    List<LogsEntity> findAllByTableNameContainingIgnoreCase(String tableName, Pageable pageable);
    List<LogsEntity> findAllByOperationTypeEntity_OperationTypeName(String tableName, Pageable pageable);
    List<LogsEntity> findAllByCreationDateBetween(OffsetDateTime startOfDay, OffsetDateTime endOfDay, Pageable pageable);

    List<LogsEntity> findAllByTableNameContainingIgnoreCaseAndOperationTypeEntity_OperationTypeNameAndCreationDateBetween(String tableName, String operationName, OffsetDateTime startOfDay, OffsetDateTime endOfDay, Pageable pageable);

    List<LogsEntity> findAllByTableNameContainingIgnoreCaseAndCreationDateBetween(String tableName, OffsetDateTime startOfDay, OffsetDateTime endOfDay, Pageable pageable);

    List<LogsEntity> findAllByOperationTypeEntity_OperationTypeNameAndCreationDateBetween(String operationName, OffsetDateTime startOfDay, OffsetDateTime endOfDay, Pageable pageable);
}
