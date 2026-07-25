package project.backendmueblar.modules.users.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import project.backendmueblar.modules.users.entities.ModuleEntity;
import project.backendmueblar.modules.users.entities.Module_X_RoleEntity;
import project.backendmueblar.modules.users.entities.RoleEntity;
import project.backendmueblar.modules.users.entities.idClass.ModuleRoleId;

import java.util.List;
import java.util.Optional;

public interface RepositoryModule_X_Role extends JpaRepository<Module_X_RoleEntity, ModuleRoleId> {
    List<Module_X_RoleEntity> findAllByRoleEntity(RoleEntity roleEntity);
    Optional<Module_X_RoleEntity> findByRoleEntityAndModuleEntity_ModuleId(RoleEntity roleEntity, Long moduleId);
}
