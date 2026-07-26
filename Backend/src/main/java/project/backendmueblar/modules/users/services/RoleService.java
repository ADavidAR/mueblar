package project.backendmueblar.modules.users.services;

import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.stereotype.Service;
import project.backendmueblar.exception.auth.RoleNotFoundException;
import project.backendmueblar.modules.users.dtos.response.PermissionResponseDTO;
import project.backendmueblar.modules.users.dtos.response.RoleResponseDTO;
import project.backendmueblar.modules.users.entities.Module_X_RoleEntity;
import project.backendmueblar.modules.users.entities.PermissionEntity;
import project.backendmueblar.modules.users.entities.RoleEntity;
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
}
