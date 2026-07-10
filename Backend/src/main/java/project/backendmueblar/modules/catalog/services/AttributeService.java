package project.backendmueblar.modules.catalog.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import project.backendmueblar.exception.catalog.ResourceAlreadyExistsException;
import project.backendmueblar.exception.catalog.ResourceNotFoundException;
import project.backendmueblar.modules.catalog.dtos.request.AttributeCreateRequestDTO;
import project.backendmueblar.modules.catalog.entities.AttributeEntity;
import project.backendmueblar.modules.catalog.entities.AttributeTypeEntity;
import project.backendmueblar.modules.catalog.entities.Attribute_X_ProductEntity;
import project.backendmueblar.modules.catalog.entities.Attribute_X_VariationEntity;
import project.backendmueblar.modules.catalog.repositories.RepositoryAttribute;
import project.backendmueblar.modules.catalog.repositories.RepositoryAttributeType;

import java.util.*;

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

    // ------------------------------------------------------------------------------------------------------//

    @Transactional
    public void updateAttribute(String attributeId, AttributeCreateRequestDTO attributeUpdateRequestDTO) {
        Optional<AttributeEntity> optionalAttribute = repositoryAttribute.findByAttributeId(attributeId);
        if(optionalAttribute.isEmpty()) {
            throw new ResourceNotFoundException("Attribute with id " + attributeId + " not found");
        }

        Optional<AttributeTypeEntity> optionalAttributeType = repositoryAttributeType.findByAttributeTypeId(attributeUpdateRequestDTO.getType());
        if(optionalAttributeType.isEmpty()) {
            throw new ResourceNotFoundException("AttributeType with name " + attributeUpdateRequestDTO.getType() + " not found");
        }

        AttributeEntity oldAttributeEntity = optionalAttribute.get();

        if(attributeId.equals(attributeUpdateRequestDTO.getName())) {
            oldAttributeEntity.setAttributeTypeEntity(optionalAttributeType.get());
            repositoryAttribute.save(oldAttributeEntity);
            return;
        }

        List<Attribute_X_ProductEntity> attributeXProductEntityList = oldAttributeEntity.getAttributeXProductEntities();
        List<Attribute_X_VariationEntity> attributeXVariationEntityList = oldAttributeEntity.getAttributeXVariationEntities();

        if(!attributeXProductEntityList.isEmpty() || !attributeXVariationEntityList.isEmpty()) {
            List<String> products = new ArrayList<>();
            List<String> variations = new ArrayList<>();
            Map<String, List<String>> mapForResponsiveError = new HashMap<>();

            for(Attribute_X_ProductEntity attributeXProductEntity : attributeXProductEntityList) {
                products.add(attributeXProductEntity.getProductEntity().getModelName());
            }

            for(Attribute_X_VariationEntity attributeXVariationEntity : attributeXVariationEntityList) {
                variations.add(attributeXVariationEntity.getVariationEntity().getVariationName());
            }

            mapForResponsiveError.put("products", products);
            mapForResponsiveError.put("variations", variations);

            throw new ResourceAlreadyExistsException(String.format("The attribute cannot be deleted until it has been removed from all associated products and variations: " + mapForResponsiveError));

        }


        Optional<AttributeEntity> optionalAttributeExists = repositoryAttribute.findByAttributeId(attributeUpdateRequestDTO.getName());
        if(optionalAttributeExists.isPresent()) {
            throw new ResourceAlreadyExistsException("Attribute with name " + attributeUpdateRequestDTO.getName() + " already exists");
        }

        AttributeEntity newAttributeEntity = new AttributeEntity();
        newAttributeEntity.setAttributeId(attributeUpdateRequestDTO.getName());
        newAttributeEntity.setAttributeTypeEntity(optionalAttributeType.get());

        repositoryAttribute.delete(oldAttributeEntity);
        repositoryAttribute.save(newAttributeEntity);

    }

}
