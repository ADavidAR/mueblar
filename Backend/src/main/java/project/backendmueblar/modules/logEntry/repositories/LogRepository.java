package project.backendmueblar.modules.logEntry.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import project.backendmueblar.modules.logEntry.entities.LogsEntity;

import java.util.List;

public interface LogRepository extends JpaRepository<LogsEntity, Long> {
    List<LogsEntity> findAllByTableNameContainingIgnoreCaseAndOperationTypeEntity_OperationTypeName(String tableName, String operationName, Pageable pageable);

    List<LogsEntity> findAllByTableNameContainingIgnoreCase(String tableName, Pageable pageable);

    List<LogsEntity> findAllByOperationTypeEntity_OperationTypeName(String tableName, Pageable pageable);
}
