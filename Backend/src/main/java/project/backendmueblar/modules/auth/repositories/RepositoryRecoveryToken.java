package project.backendmueblar.modules.auth.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.backendmueblar.modules.auth.entities.RecoveryTokenEntity;
import project.backendmueblar.modules.users.entities.UserEntity;

import java.util.Optional;

@Repository
public interface RepositoryRecoveryToken extends JpaRepository<RecoveryTokenEntity, Long> {
    Optional<RecoveryTokenEntity> findByToken(String token);
}
