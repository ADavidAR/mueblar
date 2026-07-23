package project.backendmueblar.modules.users.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import project.backendmueblar.modules.users.entities.ModuleEntity;

public interface RepositoryModule extends JpaRepository<ModuleEntity, Long> {
}
