package project.backendmueblar.modules.interactions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import project.backendmueblar.modules.interactions.entities.CollectionEntity;

import java.util.Optional;

public interface RepositoryCollection extends JpaRepository<CollectionEntity, Long> {
    Optional<CollectionEntity> findByCollectionId(Long collectionId);
    Optional<CollectionEntity> findByTitle(String title);
}
