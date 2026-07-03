package project.backendmueblar.modules.users.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.backendmueblar.modules.users.entities.UserEntity;

import java.util.List;

@Repository
public interface RepositoryPermission_X_Role extends JpaRepository<UserEntity, Long> {
    @Query("SELECT p.endpointUrl, " +
            "( (CASE WHEN rp.access = true THEN 8 ELSE 0 END) + " +
            "  (CASE WHEN rp.create = true THEN 4 ELSE 0 END) + " +
            "  (CASE WHEN rp.delete = true THEN 2 ELSE 0 END) + " +
            "  (CASE WHEN rp.modification = true THEN 1 ELSE 0 END) ) " +
            "FROM Permission_X_RoleEntity rp " +
            "JOIN rp.permissionEntity p " +
            "WHERE rp.roleEntity = :#{#user.roleEntity}")
    List<Object[]> findEndpointsAndPermission(@Param("user") UserEntity userEntity);
}
