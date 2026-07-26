package project.backendmueblar.modules.interactions.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import project.backendmueblar.modules.catalog.entities.ProductEntity;
import project.backendmueblar.modules.interactions.entities.CollectionEntity;
import project.backendmueblar.modules.interactions.entities.Collection_X_ProductEntity;
import project.backendmueblar.modules.interactions.entities.idClass.CollectionProductId;

import java.util.List;
import java.util.Optional;

public interface RepositoryCollection_X_Product extends JpaRepository<Collection_X_ProductEntity, CollectionProductId> {
    Optional<Collection_X_ProductEntity> findByProductEntityAndCollectionEntity(ProductEntity productEntity, CollectionEntity collectionEntity);
    List<Collection_X_ProductEntity> findByCollectionEntityIn(List<CollectionEntity> collectionEntity);
}
