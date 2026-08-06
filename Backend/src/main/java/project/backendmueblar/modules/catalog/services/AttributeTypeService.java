package project.backendmueblar.modules.catalog.services;

import jakarta.persistence.Table;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.backendmueblar.exception.auth.UserIDNotMatchException;
import project.backendmueblar.exception.catalog.ResourceAlreadyExistsException;
import project.backendmueblar.exception.catalog.ResourceNotFoundException;
import project.backendmueblar.modules.auth.services.JwtService;
import project.backendmueblar.modules.catalog.dtos.request.AttributeTypeCreateRequestDTO;
import project.backendmueblar.modules.catalog.dtos.response.AttributeTypeResponseDTO;
import project.backendmueblar.modules.catalog.entities.AttributeEntity;
import project.backendmueblar.modules.catalog.entities.AttributeTypeEntity;
import project.backendmueblar.modules.catalog.repositories.RepositoryAttributeType;
import project.backendmueblar.modules.logEntry.services.LogService;
import project.backendmueblar.modules.users.entities.UserEntity;
import project.backendmueblar.modules.users.repositories.RepositoryUser;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AttributeTypeService {
    private final RepositoryAttributeType repositoryAttributeType;

    private final LogService logService;
    private final ObjectMapper objectMapper;
    private final JwtService jwtService;
    private final RepositoryUser userRepository;

    // Metodo de Servicio PRIVATE : Extraccion del Nombre de la Tabla en la Base de Datos asociado a una Entidad Cualquiera //
    private String tableNameFromEntity(Object entity){
        Class<?> entityClass = entity.getClass();
        Table tableAnnotation = entityClass.getAnnotation(Table.class);

        if (tableAnnotation != null && !tableAnnotation.name().isEmpty()) {
            return tableAnnotation.name();
        }
        return entityClass.getSimpleName().toLowerCase();
    }

    // ----------------------------------------------------------------------------------------------------------------------------------------//

    // Metodo de Servicio PRIVATE : Comprobacion de Existencia de Usuario mediante Token JWT brindado //
    private Optional<UserEntity> existsUserWithToken(String authHeader) {
        String uniqueEmailForUser = jwtService.extractEmail(authHeader);
        Optional<UserEntity> optionalUser = userRepository.findByEmail(uniqueEmailForUser);
        if (optionalUser.isEmpty()) {
            throw new UserIDNotMatchException("User not Found");
        }
        return optionalUser;
    }

    // ----------------------------------------------------------------------------------------------------------------------------------------//

    // Metodo de Serivicio : Obtencion de Tipo de Atributo Especifico del Sistema //
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

    // ----------------------------------------------------------------------------------------------------------------------------------------//

    // Metodo de Servicio : Creacion de Tipo de Atributo Especifico en el Sistema //
    @Transactional
    public void createAttributeType(String authHeader, AttributeTypeCreateRequestDTO attributeTypeCreateRequestDTO) {
        UserEntity thisUserEntity =  existsUserWithToken(authHeader).get();

        Optional<AttributeTypeEntity> optionalAttributeType = repositoryAttributeType.findByAttributeTypeId(attributeTypeCreateRequestDTO.getId());
        if(optionalAttributeType.isPresent()) {
            throw new ResourceAlreadyExistsException("Attribute Type already exists");
        }

        AttributeTypeEntity attributeTypeEntity = new AttributeTypeEntity();

        attributeTypeEntity.setDescription(attributeTypeCreateRequestDTO.getDescription());
        attributeTypeEntity.setAttributeTypeId(attributeTypeCreateRequestDTO.getId());

        repositoryAttributeType.save(attributeTypeEntity);

        logService.logEntryDataBase(tableNameFromEntity(attributeTypeEntity), thisUserEntity.getUserId(), objectMapper.convertValue(attributeTypeEntity, new TypeReference<Map<String, Object>>() {}), null, 1);
    }

    // ----------------------------------------------------------------------------------------------------------------------------------------//

    // Metodo de Servicio : Eliminacion de Tipo de Atributo del Sistema //
    @Transactional
    public void deleteAttributeType(String authHeader, String attributeTypeId) {
        UserEntity thisUserEntity =  existsUserWithToken(authHeader).get();

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
        logService.logEntryDataBase(tableNameFromEntity(thisAttributeTypeEntity), thisUserEntity.getUserId(), null, objectMapper.convertValue(thisAttributeTypeEntity, new TypeReference<Map<String, Object>>() {}), 3);
    }

    // ----------------------------------------------------------------------------------------------------------------------------------------//

    // Metodo de Servicio : Modificacion de Tipo de Atributo Especifico en el Sistema //
    @Transactional
    public void updateAttributeType(String authHeader, String attributeTypeId, AttributeTypeCreateRequestDTO attributeTypeUpdateRequestDTO) {
        UserEntity thisUserEntity =  existsUserWithToken(authHeader).get();

        Optional<AttributeTypeEntity> optionalAttributeType = repositoryAttributeType.findByAttributeTypeId(attributeTypeId);
        if(optionalAttributeType.isEmpty()) {
            throw new ResourceNotFoundException("AttributeType not found");
        }

        AttributeTypeEntity thisAttributeTypeEntity = optionalAttributeType.get();
        Map<String, Object> oldValueMap = objectMapper.convertValue(thisAttributeTypeEntity, new TypeReference<Map<String, Object>>() {});

        if(attributeTypeUpdateRequestDTO.getId().equals(thisAttributeTypeEntity.getAttributeTypeId())) {
            thisAttributeTypeEntity.setDescription(attributeTypeUpdateRequestDTO.getDescription());
            repositoryAttributeType.save(thisAttributeTypeEntity);

            Map<String, Object> newValueMap = objectMapper.convertValue(thisAttributeTypeEntity, new TypeReference<Map<String, Object>>() {});

            logService.logEntryDataBase(tableNameFromEntity(thisAttributeTypeEntity), thisUserEntity.getUserId(), newValueMap, oldValueMap, 2);
            return;
        }

        Optional<AttributeTypeEntity> optionalAttributeTypeRequest = repositoryAttributeType.findByAttributeTypeId(attributeTypeUpdateRequestDTO.getId());
        if(optionalAttributeTypeRequest.isPresent()) {
            throw new ResourceAlreadyExistsException("Already exists at Attribute Type with this Name");
        }

        List<AttributeEntity> thisAttributeEntityList = thisAttributeTypeEntity.getAttributeEntities();
        if(!(thisAttributeEntityList.isEmpty())) {
            throw new ResourceAlreadyExistsException("Exists at least one (1) Attribute to this Attribute Type");
        }

        AttributeTypeEntity attributeTypeEntity = new AttributeTypeEntity();
        attributeTypeEntity.setDescription(attributeTypeUpdateRequestDTO.getDescription());
        attributeTypeEntity.setAttributeTypeId(attributeTypeUpdateRequestDTO.getId());

        repositoryAttributeType.delete(thisAttributeTypeEntity);
        repositoryAttributeType.save(attributeTypeEntity);
        logService.logEntryDataBase(tableNameFromEntity(attributeTypeEntity), thisUserEntity.getUserId(), objectMapper.convertValue(attributeTypeEntity, new TypeReference<Map<String, Object>>() {}), oldValueMap, 2);
    }

    public List<AttributeTypeResponseDTO> getAllAttributesTypes(Integer limit, Integer page){
        Pageable pageable = PageRequest.of(page, limit);

        List<AttributeTypeResponseDTO> attributeTypeResponseDTOList = new ArrayList<>();

        List<AttributeTypeEntity> attributeTypeEntityList = repositoryAttributeType.findAll(pageable).getContent();
        for(AttributeTypeEntity attributeTypeEntity : attributeTypeEntityList) {
            AttributeTypeResponseDTO thisAttributeTypeResponseDTO = new AttributeTypeResponseDTO();
            thisAttributeTypeResponseDTO.setId(attributeTypeEntity.getAttributeTypeId());
            thisAttributeTypeResponseDTO.setDescription(attributeTypeEntity.getDescription());
            attributeTypeResponseDTOList.add(thisAttributeTypeResponseDTO);
        }

        return attributeTypeResponseDTOList;
    }

}
