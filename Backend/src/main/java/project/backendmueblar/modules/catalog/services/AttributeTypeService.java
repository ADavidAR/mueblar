package project.backendmueblar.modules.catalog.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import project.backendmueblar.exception.catalog.ResourceAlreadyExistsException;
import project.backendmueblar.exception.catalog.ResourceNotFoundException;
import project.backendmueblar.modules.catalog.dtos.request.AttributeTypeCreateRequestDTO;
import project.backendmueblar.modules.catalog.dtos.response.AttributeTypeResponseDTO;
import project.backendmueblar.modules.catalog.entities.AttributeEntity;
import project.backendmueblar.modules.catalog.entities.AttributeTypeEntity;
import project.backendmueblar.modules.catalog.repositories.RepositoryAttributeType;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AttributeTypeService {
    private final RepositoryAttributeType repositoryAttributeType;

    public AttributeTypeResponseDTO getSpecificAttributeType(String attributeTypeId) {
        Optional<AttributeTypeEntity> optionalAttributeType = repositoryAttributeType.findByAttributeTypeId(attributeTypeId);
        if(optionalAttributeType.isEmpty()) {
            throw new ResourceNotFoundException("AttributeType not found");
        }

        AttributeTypeResponseDTO attributeTypeResponseDTO = new AttributeTypeResponseDTO();
        attributeTypeResponseDTO.setId(optionalAttributeType.get().getAttributeTypeId());
        attributeTypeResponseDTO.setDescription(optionalAttributeType.get().getDescription());

        return attributeTypeResponseDTO;
    }

    @Transactional
    public void createAttributeType(AttributeTypeCreateRequestDTO attributeTypeCreateRequestDTO) {

        Optional<AttributeTypeEntity> optionalAttributeType = repositoryAttributeType.findByAttributeTypeId(attributeTypeCreateRequestDTO.getId());
        if(optionalAttributeType.isPresent()) {
            throw new ResourceAlreadyExistsException("Attribute Type already exists");
        }

        AttributeTypeEntity attributeTypeEntity = new AttributeTypeEntity();
        attributeTypeEntity.setDescription(attributeTypeCreateRequestDTO.getDescription());
        attributeTypeEntity.setAttributeTypeId(attributeTypeCreateRequestDTO.getId());
        repositoryAttributeType.save(attributeTypeEntity);
    }

    @Transactional
    public void deleteAttributeType(String attributeTypeId) {
        Optional<AttributeTypeEntity> optionalAttributeType = repositoryAttributeType.findByAttributeTypeId(attributeTypeId);
        if(optionalAttributeType.isEmpty()) {
            throw new ResourceNotFoundException("AttributeType not found");
        }

        AttributeTypeEntity thisAttributeTypeEntity = optionalAttributeType.get();
        List<AttributeEntity> thisAttributeEntityList = thisAttributeTypeEntity.getAttributeEntities();
        if(!(thisAttributeEntityList.isEmpty())) {
            throw new ResourceAlreadyExistsException("Exists at least one (1) Attribute to this Attribute Type");
        }

        repositoryAttributeType.delete(thisAttributeTypeEntity);

    }

}
