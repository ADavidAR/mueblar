package project.backendmueblar.modules.users.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import project.backendmueblar.modules.users.entities.ModuleEntity;
import project.backendmueblar.modules.users.entities.Module_X_RoleEntity;
import project.backendmueblar.modules.users.entities.RoleEntity;
import project.backendmueblar.modules.users.entities.idClass.ModuleRoleId;

import java.util.List;

public interface RepositoryModule_X_Role extends JpaRepository<Module_X_RoleEntity, ModuleRoleId> {
    List<Module_X_RoleEntity> findAllByRoleEntity(RoleEntity roleEntity);
}
