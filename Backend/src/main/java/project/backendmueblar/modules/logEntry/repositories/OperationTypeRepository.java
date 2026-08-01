package project.backendmueblar.modules.logEntry.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import project.backendmueblar.modules.logEntry.entities.OperationTypeEntity;

public interface OperationTypeRepository extends JpaRepository<OperationTypeEntity, Long> {
}
