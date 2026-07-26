package project.backendmueblar.modules.users.repositories;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.backendmueblar.modules.users.entities.RoleEntity;


import java.util.List;
import java.util.Optional;

@Repository
public interface RepositoryRole extends JpaRepository<RoleEntity, Long> {
    Optional<RoleEntity> findByRoleName(String roleName);
    Optional<RoleEntity> findByRoleId(Long roleId);
    List<RoleEntity> findAllByRoleNameContainingIgnoreCase(String search, Pageable pageable);
}
