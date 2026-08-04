package project.backendmueblar.modules.users.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import project.backendmueblar.modules.users.entities.UserEntity;

import java.util.List;
import java.util.Optional;

public interface RepositoryUser extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByEmail(String email);

    List<UserEntity> findAllByEmailContainingIgnoreCase(String email, Pageable pageable);
    List<UserEntity> findAllByEmailContainingIgnoreCaseOrFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(String email, String firstName, String lastName, Pageable pageable);
    List<UserEntity> findAllByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(String firstName, String lastName, Pageable pageable);
    List<UserEntity> findAllByEmailContainingIgnoreCaseAndFirstNameContainingIgnoreCaseAndLastNameContainingIgnoreCase(String email, String firstName, String lastName, Pageable pageable);
    List<UserEntity> findAllByFirstNameContainingIgnoreCaseAndLastNameContainingIgnoreCase(String firstName, String lastName, Pageable pageable);
}
