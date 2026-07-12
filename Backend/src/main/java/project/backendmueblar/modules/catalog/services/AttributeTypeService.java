package project.backendmueblar.modules.catalog.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import project.backendmueblar.exception.catalog.ResourceNotFoundException;
import project.backendmueblar.modules.catalog.dtos.response.AttributeTypeResponseDTO;
import project.backendmueblar.modules.catalog.entities.AttributeTypeEntity;
import project.backendmueblar.modules.catalog.repositories.RepositoryAttributeType;

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

}
