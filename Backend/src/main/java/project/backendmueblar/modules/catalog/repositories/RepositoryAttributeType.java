package project.backendmueblar.modules.catalog.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import project.backendmueblar.modules.catalog.entities.AttributeTypeEntity;

import java.util.Optional;

public interface RepositoryAttributeType extends JpaRepository<AttributeTypeEntity, String> {
    Optional<AttributeTypeEntity> findByAttributeTypeId(String attributeTypeId);
}
