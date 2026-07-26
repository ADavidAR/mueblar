package project.backendmueblar.modules.users.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.backendmueblar.exception.auth.RoleNotFoundException;
import project.backendmueblar.exception.catalog.InternalServerException;
import project.backendmueblar.exception.catalog.ResourceNotFoundException;
import project.backendmueblar.modules.users.dtos.request.PermissionCreateRequestDTO;
import project.backendmueblar.modules.users.dtos.request.RoleCreateRequestDTO;
import project.backendmueblar.modules.users.dtos.response.PermissionResponseDTO;
import project.backendmueblar.modules.users.dtos.response.RoleResponseDTO;
import project.backendmueblar.modules.users.entities.ModuleEntity;
import project.backendmueblar.modules.users.entities.Module_X_RoleEntity;
import project.backendmueblar.modules.users.entities.PermissionEntity;
import project.backendmueblar.modules.users.entities.RoleEntity;
import project.backendmueblar.modules.users.repositories.RepositoryModule;
import project.backendmueblar.modules.users.repositories.RepositoryModule_X_Role;
import project.backendmueblar.modules.users.repositories.RepositoryRole;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor

public class RoleService {
    private final RepositoryRole repositoryRole;
    private final RepositoryModule_X_Role repositoryModule_X_Role;
    private final RepositoryModule repositoryModule;

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
    public void createRole(RoleCreateRequestDTO roleCreateRequestDTO){
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
        }

        repositoryModule_X_Role.saveAll(moduleXRoleEntityList);

    }

}
