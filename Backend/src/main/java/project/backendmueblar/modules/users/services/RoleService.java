package project.backendmueblar.modules.users.services;

import jakarta.persistence.Table;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.backendmueblar.exception.auth.RoleNotFoundException;
import project.backendmueblar.exception.auth.UserIDNotMatchException;
import project.backendmueblar.exception.catalog.InternalServerException;
import project.backendmueblar.exception.catalog.ResourceAlreadyExistsException;
import project.backendmueblar.exception.catalog.ResourceNotFoundException;
import project.backendmueblar.modules.auth.services.JwtService;
import project.backendmueblar.modules.logEntry.services.LogService;
import project.backendmueblar.modules.users.dtos.request.PermissionCreateRequestDTO;
import project.backendmueblar.modules.users.dtos.request.RoleCreateRequestDTO;
import project.backendmueblar.modules.users.dtos.response.PermissionResponseDTO;
import project.backendmueblar.modules.users.dtos.response.RoleResponseDTO;
import project.backendmueblar.modules.users.entities.*;
import project.backendmueblar.modules.users.repositories.RepositoryModule;
import project.backendmueblar.modules.users.repositories.RepositoryModule_X_Role;
import project.backendmueblar.modules.users.repositories.RepositoryRole;
import project.backendmueblar.modules.users.repositories.RepositoryUser;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.*;

@Service
@RequiredArgsConstructor

public class RoleService {
    private final RepositoryRole repositoryRole;
    private final RepositoryModule_X_Role repositoryModule_X_Role;
    private final RepositoryModule repositoryModule;

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

    // ----------------------------------------------------------------------------------------------------------------------------------------//

    private Optional<UserEntity> existsUserWithToken(String authHeader) {
        String uniqueEmailForUser = jwtService.extractEmail(authHeader);
        Optional<UserEntity> optionalUser = userRepository.findByEmail(uniqueEmailForUser);
        if (optionalUser.isEmpty()) {
            throw new UserIDNotMatchException("User not Found");
        }
        return optionalUser;
    }

    // ----------------------------------------------------------------------------------------------------------------------------------------//


    private static @NonNull Integer getInteger(Module_X_RoleEntity moduleXRoleEntity) {
        Integer accessBit1;
        Integer creationBit2;
        Integer deleteBit3;
        Integer modificationBit4;

        if(moduleXRoleEntity.isAccess()){
            accessBit1 = 8; } else {
            accessBit1 = 0;
        }

        if(moduleXRoleEntity.isCreation()){
            creationBit2 = 4; } else {
            creationBit2 = 0;
        }

        if(moduleXRoleEntity.isDeletion()){
            deleteBit3 = 2; } else {
            deleteBit3 = 0;
        }

        if(moduleXRoleEntity.isModification()){
            modificationBit4 = 1; } else {
            modificationBit4 = 0;
        }

        Integer permissionsBitModule = accessBit1 + creationBit2 + deleteBit3 + modificationBit4;
        return permissionsBitModule;
    }

    // ------------------------------------------------------------------------------------------------------------- //

    public RoleResponseDTO getSpecificRole(Long roleId){
        Optional<RoleEntity> optionalRole = repositoryRole.findByRoleId(roleId);
        if(optionalRole.isEmpty()){
            throw new RoleNotFoundException("Role not found");
        }

        RoleEntity thisRoleEntity = optionalRole.get();
        RoleResponseDTO roleResponseDTO = new RoleResponseDTO();
        roleResponseDTO.setEditable(thisRoleEntity.getEditable());
        roleResponseDTO.setId(thisRoleEntity.getRoleId());
        roleResponseDTO.setName(thisRoleEntity.getRoleName());

        List<PermissionResponseDTO> permissionResponseDTOList = new ArrayList<>();
        List<Module_X_RoleEntity> moduleXRoleEntityList = repositoryModule_X_Role.findAllByRoleEntity(thisRoleEntity);
        for(Module_X_RoleEntity thisModuleXRoleEntity : moduleXRoleEntityList){
             for(PermissionEntity permissionEntity : thisModuleXRoleEntity.getModuleEntity().getPermissionEntityList()){
                 PermissionResponseDTO permissionResponseDTO = new PermissionResponseDTO();
                 permissionResponseDTO.setAccess(thisModuleXRoleEntity.isAccess());
                 permissionResponseDTO.setCreate(thisModuleXRoleEntity.isCreation());
                 permissionResponseDTO.setDelete(thisModuleXRoleEntity.isDeletion());
                 permissionResponseDTO.setModify(thisModuleXRoleEntity.isModification());
                 permissionResponseDTO.setId(thisModuleXRoleEntity.getModuleEntity().getModuleId());
                 permissionResponseDTO.setEndpoint(permissionEntity.getEndpointUrl());
                 permissionResponseDTO.setDescription(thisModuleXRoleEntity.getModuleEntity().getDescription());
                 permissionResponseDTOList.add(permissionResponseDTO);
             }
        }
        roleResponseDTO.setPermissions(permissionResponseDTOList);
        return roleResponseDTO;
    }

    // ------------------------------------------------------------------------------------------------------------- //

    public List<RoleResponseDTO> getAllRoles(Integer limit, Integer page, String search){
        if(limit == 0){
            throw new InternalServerException("Cannot throw zero Roles");
        }

        List<RoleEntity> roleEntityList;
        Pageable pageable = PageRequest.of(page, limit);
        boolean hasSearch = (search != null && !search.trim().isEmpty());

        if(hasSearch){
            roleEntityList = repositoryRole.findAllByRoleNameContainingIgnoreCase(search, pageable);
            List<RoleResponseDTO> roleResponseDTOList = new ArrayList<>();

            for(RoleEntity thisRoleEntity : roleEntityList){
                RoleResponseDTO thisRoleResponseDTO = getSpecificRole(thisRoleEntity.getRoleId());
                roleResponseDTOList.add(thisRoleResponseDTO);
            }

            return roleResponseDTOList;
        } else {
            roleEntityList = repositoryRole.findAll(pageable).getContent();
            List<RoleResponseDTO> roleResponseDTOList = new ArrayList<>();

            for(RoleEntity thisRoleEntity : roleEntityList){
                RoleResponseDTO thisRoleResponseDTO = getSpecificRole(thisRoleEntity.getRoleId());
                roleResponseDTOList.add(thisRoleResponseDTO);
            }

            return roleResponseDTOList;
        }
    }

    // ------------------------------------------------------------------------------------------------------------- //

    @Transactional
    public void createRole(String authHeader, RoleCreateRequestDTO roleCreateRequestDTO){
        UserEntity thisUserEntity = existsUserWithToken(authHeader).get();

        RoleEntity roleEntity = new RoleEntity();
        roleEntity.setRoleName(roleCreateRequestDTO.getName());
        roleEntity.setEditable(roleCreateRequestDTO.getEditable());

        repositoryRole.save(roleEntity);

        List<PermissionCreateRequestDTO> permissionCreateRequestDTOList = roleCreateRequestDTO.getPermissions();
        if(permissionCreateRequestDTOList.size() != repositoryModule.count()){
            throw new InternalServerException("Cannot create role.");
        }

        List<Module_X_RoleEntity> moduleXRoleEntityList = new ArrayList<>();

        for(PermissionCreateRequestDTO thisPermissionCreateRequestDTO : permissionCreateRequestDTOList){
            Module_X_RoleEntity thisModuleXRoleEntity = new Module_X_RoleEntity();
            thisModuleXRoleEntity.setAccess(thisPermissionCreateRequestDTO.getAccess());
            if(thisPermissionCreateRequestDTO.getAccess() == false){
                thisModuleXRoleEntity.setCreation(false);
                thisModuleXRoleEntity.setDeletion(false);
                thisModuleXRoleEntity.setModification(false);
            } else {
                thisModuleXRoleEntity.setCreation(thisPermissionCreateRequestDTO.getCreate());
                thisModuleXRoleEntity.setDeletion(thisPermissionCreateRequestDTO.getDelete());
                thisModuleXRoleEntity.setModification(thisPermissionCreateRequestDTO.getModify());
            }

            Optional<ModuleEntity> optionalModule = repositoryModule.findByModuleId(thisPermissionCreateRequestDTO.getId());
            if(optionalModule.isEmpty()){
                throw new ResourceNotFoundException("Module ID was not found");
            }

            thisModuleXRoleEntity.setModuleEntity(optionalModule.get());
            thisModuleXRoleEntity.setRoleEntity(roleEntity);
            moduleXRoleEntityList.add(thisModuleXRoleEntity);
            logService.logEntryDataBase(tableNameFromEntity(thisModuleXRoleEntity), thisUserEntity.getUserId(), objectMapper.convertValue(thisModuleXRoleEntity, new TypeReference<Map<String, Object>>() {}), null, 1);
        }

        repositoryModule_X_Role.saveAll(moduleXRoleEntityList);
        logService.logEntryDataBase(tableNameFromEntity(roleEntity), thisUserEntity.getUserId(), objectMapper.convertValue(roleEntity, new TypeReference<Map<String, Object>>() {}), null, 1);
    }

    // ------------------------------------------------------------------------------------------------------------- //
    @Transactional
    public void updateRole(String authHeader, Long roleId, RoleCreateRequestDTO roleUpdateRequestDTO){
        UserEntity thisUserEntity = existsUserWithToken(authHeader).get();

        Optional<RoleEntity> optionalRoleEntity = repositoryRole.findById(roleId);
        if(optionalRoleEntity.isEmpty()){
            throw new ResourceNotFoundException("Role was not found");
        }

        RoleEntity thisRoleEntity = optionalRoleEntity.get();
        if(thisRoleEntity.getRoleName().equals("Cliente")){
            throw new RuntimeException("\"Cliente\" Role is not Modifiable");
        } else if (thisRoleEntity.getRoleName().equals("Admin")) {
            throw new RuntimeException("\"Administrador\" Role is not Modifiable");
        }

        Map<String, Object> oldValueMap = objectMapper.convertValue(thisRoleEntity, new TypeReference<Map<String, Object>>() {});

        thisRoleEntity.setEditable(roleUpdateRequestDTO.getEditable());
        thisRoleEntity.setRoleName(roleUpdateRequestDTO.getName());
        repositoryRole.save(thisRoleEntity);

        List<PermissionCreateRequestDTO> permissionCreateRequestDTOList = roleUpdateRequestDTO.getPermissions();
        if(permissionCreateRequestDTOList.size() != repositoryModule.count()){
            throw new RuntimeException("Cannot update role. Module size not Correct");
        }

        List<Module_X_RoleEntity> moduleXRoleEntityList = new ArrayList<>();
        for(PermissionCreateRequestDTO thisPermissionCreateRequestDTO : permissionCreateRequestDTOList){
            Optional<Module_X_RoleEntity> optionalModuleXRole = repositoryModule_X_Role.findByRoleEntityAndModuleEntity_ModuleId(thisRoleEntity, thisPermissionCreateRequestDTO.getId());
            if(optionalModuleXRole.isEmpty()){
                throw new ResourceNotFoundException("Module was not found");
            }

            Module_X_RoleEntity thisModuleXRoleEntity = optionalModuleXRole.get();
            Map<String, Object> oldValueXMap =  objectMapper.convertValue(thisModuleXRoleEntity, new TypeReference<Map<String, Object>>() {});

            thisModuleXRoleEntity.setAccess(thisPermissionCreateRequestDTO.getAccess());
            if(thisPermissionCreateRequestDTO.getAccess() == false){
                thisModuleXRoleEntity.setCreation(false);
                thisModuleXRoleEntity.setDeletion(false);
                thisModuleXRoleEntity.setModification(false);
            } else {
                thisModuleXRoleEntity.setCreation(thisPermissionCreateRequestDTO.getCreate());
                thisModuleXRoleEntity.setDeletion(thisPermissionCreateRequestDTO.getDelete());
                thisModuleXRoleEntity.setModification(thisPermissionCreateRequestDTO.getModify());
            }
            logService.logEntryDataBase(tableNameFromEntity(thisModuleXRoleEntity), thisUserEntity.getUserId(), objectMapper.convertValue(thisModuleXRoleEntity, new TypeReference<Map<String, Object>>() {}), oldValueXMap, 2);
            moduleXRoleEntityList.add(thisModuleXRoleEntity);
        }

        repositoryModule_X_Role.saveAll(moduleXRoleEntityList);
        logService.logEntryDataBase(tableNameFromEntity(thisRoleEntity), thisUserEntity.getUserId(), objectMapper.convertValue(thisRoleEntity, new TypeReference<Map<String, Object>>() {}), oldValueMap, 2);
    }

    // ------------------------------------------------------------------------------------------------------------- //
    @Transactional
    public void deleteRoleSpecific(String authHeader, Long roleId){
        UserEntity thisUserEntity = existsUserWithToken(authHeader).get();

        Optional<RoleEntity> optionalRoleEntity = repositoryRole.findById(roleId);
        if(optionalRoleEntity.isEmpty()){
            throw new RoleNotFoundException("Role was not found");
        }

        if(optionalRoleEntity.get().getRoleName().equals("Cliente")){
            throw new RuntimeException("Role \"Cliente\". Cannot Delete it");
        } else if(optionalRoleEntity.get().getRoleName().equals("Admin")){
            throw new RuntimeException("Role \"Administrador\". Cannot Delete it");
        }

        if(!optionalRoleEntity.get().getUserEntity().isEmpty()) {
            List<UserEntity> userEntityList = optionalRoleEntity.get().getUserEntity();

            List<String> users = new ArrayList<>();
            Map<String, List<String>> mapOfUsers = new HashMap<>();

            for(UserEntity thisSpecificUser : userEntityList) {
                users.add(String.format("%s %s", thisSpecificUser.getFirstName(), thisSpecificUser.getLastName()));
            }
            mapOfUsers.put("users", users);
            throw new ResourceAlreadyExistsException("The role cannot be deleted because there are users associated with it: " + mapOfUsers);
        }

        repositoryRole.delete(optionalRoleEntity.get());
        logService.logEntryDataBase(tableNameFromEntity(optionalRoleEntity.get()), thisUserEntity.getUserId(), null, objectMapper.convertValue(optionalRoleEntity.get(), new TypeReference<Map<String, Object>>() {}), 3);

    }
}
