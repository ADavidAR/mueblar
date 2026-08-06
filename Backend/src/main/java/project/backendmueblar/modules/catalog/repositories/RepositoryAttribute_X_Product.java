package project.backendmueblar.modules.catalog.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import project.backendmueblar.modules.catalog.entities.Attribute_X_ProductEntity;
import project.backendmueblar.modules.catalog.entities.idClass.AttributeProductId;

public interface RepositoryAttribute_X_Product extends JpaRepository<Attribute_X_ProductEntity, AttributeProductId> {
}
