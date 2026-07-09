package project.backendmueblar.modules.catalog.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import project.backendmueblar.exception.catalog.ResourceAlreadyExistsException;
import project.backendmueblar.exception.catalog.ResourceNotFoundException;
import project.backendmueblar.modules.catalog.dtos.request.AttributeCreateRequestDTO;
import project.backendmueblar.modules.catalog.dtos.request.AttributeSummaryRequestDTO;
import project.backendmueblar.modules.catalog.entities.AttributeEntity;
import project.backendmueblar.modules.catalog.entities.AttributeTypeEntity;
import project.backendmueblar.modules.catalog.repositories.RepositoryAttribute;
import project.backendmueblar.modules.catalog.repositories.RepositoryAttributeType;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AttributeService {

    private final RepositoryAttribute repositoryAttribute;
    private final RepositoryAttributeType  repositoryAttributeType;

    @Transactional
    public void createAttribute(AttributeCreateRequestDTO attributeCreateRequestDTO) {
        Optional<AttributeEntity> optionalAttribute = repositoryAttribute.findByAttributeId(attributeCreateRequestDTO.getName());
        if(optionalAttribute.isPresent()) {
            throw new ResourceAlreadyExistsException("Attribute with name " + attributeCreateRequestDTO.getName() + " already exists");
        }

        Optional<AttributeTypeEntity> optionalAttributeType = repositoryAttributeType.findByAttributeTypeId(attributeCreateRequestDTO.getType());
        if(optionalAttributeType.isEmpty()) {
            throw new ResourceNotFoundException("AttributeType with name " + attributeCreateRequestDTO.getName() + " not found");
        }

        AttributeEntity attributeEntity = new AttributeEntity();
        attributeEntity.setAttributeId(attributeCreateRequestDTO.getName());
        attributeEntity.setAttributeTypeEntity(optionalAttributeType.get());

        repositoryAttribute.save(attributeEntity);

    }

}
