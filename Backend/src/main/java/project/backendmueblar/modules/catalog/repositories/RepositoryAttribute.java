package project.backendmueblar.modules.catalog.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import project.backendmueblar.modules.catalog.entities.AttributeEntity;

import java.util.Optional;

public interface RepositoryAttribute extends JpaRepository<AttributeEntity, String> {
    Optional<AttributeEntity> findByAttributeId(String attributeId);
}
