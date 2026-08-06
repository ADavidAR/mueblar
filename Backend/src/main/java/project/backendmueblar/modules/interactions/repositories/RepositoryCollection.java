package project.backendmueblar.modules.interactions.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import project.backendmueblar.modules.catalog.entities.ProductEntity;
import project.backendmueblar.modules.interactions.entities.CollectionEntity;
import project.backendmueblar.modules.users.entities.UserEntity;

import java.util.List;
import java.util.Optional;

public interface RepositoryCollection extends JpaRepository<CollectionEntity, Long> {
    Optional<CollectionEntity> findByCollectionId(Long collectionId);
    Optional<CollectionEntity> findByTitleAndUserEntity(String title, UserEntity userEntity);
    List<CollectionEntity> findAllByUserEntity(UserEntity userEntity);
    List<CollectionEntity> findAllByUserEntity(UserEntity userEntity, Pageable pageable);
    List<CollectionEntity> findByUserEntityAndTitleContainingIgnoreCase(UserEntity userEntity, String search, Pageable pageable);
}
