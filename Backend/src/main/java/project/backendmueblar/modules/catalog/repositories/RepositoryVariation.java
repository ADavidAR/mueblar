package project.backendmueblar.modules.catalog.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import project.backendmueblar.modules.catalog.entities.VariationEntity;

public interface RepositoryVariation extends JpaRepository<VariationEntity, String> {
    boolean existsBySku(String sku);
}
