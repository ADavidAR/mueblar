package project.backendmueblar.modules.catalog.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.backendmueblar.modules.catalog.entities.ThumbnailEntity;
import project.backendmueblar.modules.catalog.entities.VariationEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface RepositoryThumbnail extends JpaRepository<ThumbnailEntity, Long> {
    Optional<ThumbnailEntity> findByThumbnailPath(String thumbnailPath);
    Optional<List<ThumbnailEntity>> findByVariationEntity(VariationEntity variationEntity);
}
