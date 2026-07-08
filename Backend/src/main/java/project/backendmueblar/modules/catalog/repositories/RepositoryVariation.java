package project.backendmueblar.modules.catalog.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import project.backendmueblar.modules.catalog.entities.VariationEntity;

import java.util.Optional;

public interface RepositoryVariation extends JpaRepository<VariationEntity, String> {
    boolean existsBySku(String sku);

    Optional<VariationEntity> findBySku(String sku);
}
