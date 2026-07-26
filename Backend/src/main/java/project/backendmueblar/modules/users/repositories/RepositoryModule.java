package project.backendmueblar.modules.users.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.backendmueblar.modules.users.entities.ModuleEntity;

import java.util.Optional;

@Repository
public interface RepositoryModule extends JpaRepository<ModuleEntity, Long> {
    Optional<ModuleEntity> findByModuleId(Long moduleId);
}
