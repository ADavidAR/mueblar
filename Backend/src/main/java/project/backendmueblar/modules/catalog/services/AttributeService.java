package project.backendmueblar.modules.catalog.services;

import jakarta.persistence.Table;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.backendmueblar.exception.auth.UserIDNotMatchException;
import project.backendmueblar.exception.catalog.InternalServerException;
import project.backendmueblar.exception.catalog.ResourceAlreadyExistsException;
import project.backendmueblar.exception.catalog.ResourceNotFoundException;
import project.backendmueblar.modules.auth.services.JwtService;
import project.backendmueblar.modules.catalog.dtos.AttribTypeSummaryForCreatingDTO;
import project.backendmueblar.modules.catalog.dtos.request.AttributeCreateRequestDTO;
import project.backendmueblar.modules.catalog.dtos.response.AttributeResponseDTO;
import project.backendmueblar.modules.catalog.dtos.response.Attribute_X_VariationSummaryResponseDTO;
import project.backendmueblar.modules.catalog.entities.AttributeEntity;
import project.backendmueblar.modules.catalog.entities.AttributeTypeEntity;
import project.backendmueblar.modules.catalog.entities.Attribute_X_ProductEntity;
import project.backendmueblar.modules.catalog.entities.Attribute_X_VariationEntity;
import project.backendmueblar.modules.catalog.repositories.RepositoryAttribute;
import project.backendmueblar.modules.catalog.repositories.RepositoryAttributeType;
import project.backendmueblar.modules.logEntry.services.LogService;
import project.backendmueblar.modules.users.entities.UserEntity;
import project.backendmueblar.modules.users.repositories.RepositoryUser;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.*;

@Service
@RequiredArgsConstructor
public class AttributeService {

    private final RepositoryAttribute repositoryAttribute;
    private final RepositoryAttributeType  repositoryAttributeType;

    private final LogService logService;
    private final ObjectMapper objectMapper;
    private final JwtService jwtService;
    private final RepositoryUser userRepository;

    private String tableNameFromEntity(Object entity){
        Class<?> entityClass = entity.getClass();
        Table tableAnnotation = entityClass.getAnnotation(Table.class);

        if (tableAnnotation != null && !tableAnnotation.name().isEmpty()) {
            return tableAnnotation.name();
        }
        return entityClass.getSimpleName().toLowerCase();
    }

    private Optional<UserEntity> existsUserWithToken(String authHeader) {
        String uniqueEmailForUser = jwtService.extractEmail(authHeader);
        Optional<UserEntity> optionalUser = userRepository.findByEmail(uniqueEmailForUser);
        if (optionalUser.isEmpty()) {
            throw new UserIDNotMatchException("User not Found, Cannot create or access to Collection");
        }
        return optionalUser;
    }

    @Transactional
    public void createAttribute(String authHeader, AttributeCreateRequestDTO attributeCreateRequestDTO) {
        UserEntity thisUserEntity =  existsUserWithToken(authHeader).get();

        Optional<AttributeEntity> optionalAttribute = repositoryAttribute.findByAttributeId(attributeCreateRequestDTO.getName());
        if(optionalAttribute.isPresent()) {
            throw new ResourceAlreadyExistsException("Attribute with name " + attributeCreateRequestDTO.getName() + " already exists");
        }

        Optional<AttributeTypeEntity> optionalAttributeType = repositoryAttributeType.findByAttributeTypeId(attributeCreateRequestDTO.getAtribType().getId());
        if(optionalAttributeType.isEmpty()) {
            throw new ResourceNotFoundException("AttributeType with name " + attributeCreateRequestDTO.getName() + " not found");
        }

        AttributeEntity attributeEntity = new AttributeEntity();
        attributeEntity.setAttributeId(attributeCreateRequestDTO.getName());
        attributeEntity.setAttributeTypeEntity(optionalAttributeType.get());

        repositoryAttribute.save(attributeEntity);

        logService.logEntryDataBase(tableNameFromEntity(attributeEntity), thisUserEntity.getUserId(), objectMapper.convertValue(attributeEntity, new TypeReference<Map<String, Object>>() {}), null, 1);
    }

    // ------------------------------------------------------------------------------------------------------//

    @Transactional
    public void updateAttribute(String authHeader, String attributeId, AttributeCreateRequestDTO attributeUpdateRequestDTO) {
        UserEntity thisUserEntity =  existsUserWithToken(authHeader).get();

        Optional<AttributeEntity> optionalAttribute = repositoryAttribute.findByAttributeId(attributeId);
        if(optionalAttribute.isEmpty()) {
            throw new ResourceNotFoundException("Attribute with id " + attributeId + " not found");
        }

        Optional<AttributeTypeEntity> optionalAttributeType = repositoryAttributeType.findByAttributeTypeId(attributeUpdateRequestDTO.getAtribType().getId());
        if(optionalAttributeType.isEmpty()) {
            throw new ResourceNotFoundException("AttributeType with name " + attributeUpdateRequestDTO.getAtribType().getId() + " not found");
        }

        AttributeEntity thisAttributeEntity = optionalAttribute.get();
        Map<String, Object> oldValueMap = objectMapper.convertValue(thisAttributeEntity, new TypeReference<Map<String, Object>>() {});

        if(attributeId.equals(attributeUpdateRequestDTO.getName())) {
            thisAttributeEntity.setAttributeTypeEntity(optionalAttributeType.get());
            repositoryAttribute.save(thisAttributeEntity);

            Map<String, Object> newValueMap = objectMapper.convertValue(thisAttributeEntity, new TypeReference<Map<String, Object>>() {});

            logService.logEntryDataBase(tableNameFromEntity(thisAttributeEntity), thisUserEntity.getUserId(), newValueMap, oldValueMap, 2);
            return;
        }

        List<Attribute_X_ProductEntity> attributeXProductEntityList = thisAttributeEntity.getAttributeXProductEntities();
        List<Attribute_X_VariationEntity> attributeXVariationEntityList = thisAttributeEntity.getAttributeXVariationEntities();

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

        AttributeEntity attributeEntity = new AttributeEntity();
        attributeEntity.setAttributeId(attributeUpdateRequestDTO.getName());
        attributeEntity.setAttributeTypeEntity(optionalAttributeType.get());

        repositoryAttribute.delete(thisAttributeEntity);
        repositoryAttribute.save(attributeEntity);

        logService.logEntryDataBase(tableNameFromEntity(attributeEntity), thisUserEntity.getUserId(), objectMapper.convertValue(attributeEntity, new TypeReference<Map<String, Object>>() {}), oldValueMap, 2);
    }

    // ------------------------------------------------------------------------------------------------------//

    @Transactional
    public void deleteAttribute(String authHeader, String attributeId) {
        UserEntity thisUserEntity = existsUserWithToken(authHeader).get();

        Optional<AttributeEntity> optionalAttribute = repositoryAttribute.findByAttributeId(attributeId);
        if(optionalAttribute.isEmpty()) {
            throw new ResourceNotFoundException("Attribute with id " + attributeId + " not found");
        }

        Optional<AttributeTypeEntity> optionalAttributeType = repositoryAttributeType.findByAttributeTypeId(optionalAttribute.get().getAttributeTypeEntity().getAttributeTypeId());
        if(optionalAttributeType.isEmpty()) {
            throw new ResourceNotFoundException("AttributeType with name " + optionalAttribute.get().getAttributeTypeEntity().getAttributeTypeId() + " not found");
        }

        AttributeEntity thisAttributeEntity = optionalAttribute.get();
        List<Attribute_X_ProductEntity> attributeXProductEntityList = thisAttributeEntity.getAttributeXProductEntities();
        List<Attribute_X_VariationEntity> attributeXVariationEntityList = thisAttributeEntity.getAttributeXVariationEntities();

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

        repositoryAttribute.delete(thisAttributeEntity);
        logService.logEntryDataBase(tableNameFromEntity(thisAttributeEntity), thisUserEntity.getUserId(), null, objectMapper.convertValue(thisAttributeEntity, new TypeReference<Map<String, Object>>() {}), 3);
    }

    // ------------------------------------------------------------------------------------------------------//

    public Map<String, List<Attribute_X_VariationSummaryResponseDTO>> getAllAttributesWithVariations(Integer limit, Integer page) {
        if(limit == 0) {
            throw new InternalServerException("Cannot throw zero Attributes");
        }

        Pageable pageableQueryAttributes = PageRequest.of(page, limit);

        List<AttributeEntity> attributeEntityList = repositoryAttribute.findAll(pageableQueryAttributes).getContent();
        if(attributeEntityList.isEmpty()) {
            throw new ResourceNotFoundException("Not Exists Any Attribute");
        }

        Map<String, List<Attribute_X_VariationSummaryResponseDTO>> attributeXVariationSummaryResponseMap = new HashMap<>();

        for(AttributeEntity thisAttributeEntity : attributeEntityList) {
            String attributeId = thisAttributeEntity.getAttributeId();

            List<Attribute_X_VariationEntity> attributeXVariationEntityList = thisAttributeEntity.getAttributeXVariationEntities();
            List<Attribute_X_VariationSummaryResponseDTO> attributeXVariationSummaryResponseDTOList = new ArrayList<>();

            for(Attribute_X_VariationEntity thisAttribute_X_VariationEntity : attributeXVariationEntityList) {
                Attribute_X_VariationSummaryResponseDTO thisAttribute_X_VariationSummary = new Attribute_X_VariationSummaryResponseDTO();
                thisAttribute_X_VariationSummary.setSku(thisAttribute_X_VariationEntity.getVariationEntity().getSku());
                thisAttribute_X_VariationSummary.setValue(thisAttribute_X_VariationEntity.getAttributeValue());
                attributeXVariationSummaryResponseDTOList.add(thisAttribute_X_VariationSummary);
            }

            attributeXVariationSummaryResponseMap.put(attributeId, attributeXVariationSummaryResponseDTOList);

        }
        return attributeXVariationSummaryResponseMap;
    }

    public List<AttributeResponseDTO> getAllAttributes(Integer limit, Integer page) {
        if(limit == 0) {
            throw new InternalServerException("Cannot throw zero Attributes");
        }

        Pageable pageableQueryAttributes = PageRequest.of(page, limit);

        List<AttributeEntity> attributeEntityList = repositoryAttribute.findAll(pageableQueryAttributes).getContent();
        if(attributeEntityList.isEmpty()) {
            throw new ResourceNotFoundException("Not Exists Any Attribute");
        }

        List<AttributeResponseDTO> attributeResponseDTOList = new ArrayList<>();
        for(AttributeEntity thisAttributeEntity : attributeEntityList) {
            AttributeResponseDTO thisAttributeResponseDTO = new AttributeResponseDTO();
            thisAttributeResponseDTO.setId(thisAttributeEntity.getAttributeId());

            AttribTypeSummaryForCreatingDTO attribTypeSummaryForCreatingDTO = new AttribTypeSummaryForCreatingDTO();
            attribTypeSummaryForCreatingDTO.setId(thisAttributeEntity.getAttributeTypeEntity().getAttributeTypeId());

            thisAttributeResponseDTO.setAtribType(attribTypeSummaryForCreatingDTO);
            attributeResponseDTOList.add(thisAttributeResponseDTO);
        }
        return attributeResponseDTOList;
    }

}
