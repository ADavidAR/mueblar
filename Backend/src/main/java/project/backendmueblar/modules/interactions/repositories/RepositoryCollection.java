package project.backendmueblar.modules.interactions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import project.backendmueblar.modules.interactions.entities.CollectionEntity;

public interface RepositoryCollection extends JpaRepository<CollectionEntity, Long> {
}
