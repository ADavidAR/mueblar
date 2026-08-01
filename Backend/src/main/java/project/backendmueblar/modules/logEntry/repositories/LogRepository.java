package project.backendmueblar.modules.logEntry.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import project.backendmueblar.modules.logEntry.entities.LogsEntity;

public interface LogRepository extends JpaRepository<LogsEntity, Long> {
}
