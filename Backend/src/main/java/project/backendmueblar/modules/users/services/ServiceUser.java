package project.backendmueblar.modules.users.services;

import jakarta.transaction.Transactional;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import project.backendmueblar.exception.auth.EmailAlreadyExistsException;
import project.backendmueblar.exception.auth.RoleNotFoundException;
import project.backendmueblar.exception.auth.UserIDNotMatchException;
import project.backendmueblar.exception.catalog.InternalServerException;
import project.backendmueblar.modules.auth.dtos.UserCreateRequestDTO;
import project.backendmueblar.modules.users.dtos.response.RoleSummaryResponseDTO;
import project.backendmueblar.modules.users.dtos.response.UserSummaryResponseDTO;
import project.backendmueblar.modules.users.entities.RoleEntity;
import project.backendmueblar.modules.users.entities.UserEntity;
import project.backendmueblar.modules.users.repositories.RepositoryRole;
import project.backendmueblar.modules.users.repositories.RepositoryUser;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ServiceUser {
    private final RepositoryUser repositoryUser;
    private final PasswordEncoder passwordEncoder;
    private final RepositoryRole repositoryRole;


    private UserSummaryResponseDTO mapToUserSummaryDTO(UserEntity thisUserEntity) {
        UserSummaryResponseDTO dto = new UserSummaryResponseDTO();
        dto.setEmail(thisUserEntity.getEmail());
        dto.setId(thisUserEntity.getUserId());
        dto.setApellido(thisUserEntity.getLastName());
        dto.setNombre(thisUserEntity.getFirstName());

        RoleSummaryResponseDTO roleDTO = new RoleSummaryResponseDTO();
        roleDTO.setId(thisUserEntity.getRoleEntity().getRoleId());
        roleDTO.setName(thisUserEntity.getRoleEntity().getRoleName());

        dto.setRole(roleDTO);
        return dto;
    }

    // ------------------------------------------------------------------------------------------------------- //

    public UserSummaryResponseDTO getUserSpecific(Long userId) {
        Optional<UserEntity> optionalUser = repositoryUser.findById(userId);
        if(optionalUser.isEmpty()) {
            throw new UserIDNotMatchException("User not Exists");
        }

        return mapToUserSummaryDTO(optionalUser.get());
    }

    // ------------------------------------------------------------------------------------------------------- //

    public List<UserSummaryResponseDTO> getAllUsers(Integer limit, Integer page, String emailSearch, String firstNameSearch, String lastNameSearch) {
        if(limit == 0) {
            throw new InternalServerException("Cannot throw zero Users");
        }

        List<UserEntity> userEntityList;
        Pageable pageable = PageRequest.of(page, limit);

        boolean hasEmail = (emailSearch != null && !emailSearch.trim().isEmpty());
        boolean hasFirstName = (firstNameSearch != null && !firstNameSearch.trim().isEmpty());
        boolean hasLastName = (lastNameSearch != null && !lastNameSearch.trim().isEmpty());

        if(hasEmail && hasFirstName && hasLastName) {
            userEntityList = repositoryUser.findAllByEmailContainingIgnoreCaseAndFirstNameContainingIgnoreCaseAndLastNameContainingIgnoreCase(emailSearch, firstNameSearch, lastNameSearch, pageable);
        }
        else if (hasEmail && hasFirstName) {
            userEntityList = repositoryUser.findAllByEmailContainingIgnoreCaseAndFirstNameContainingIgnoreCase(emailSearch, firstNameSearch, pageable);
        }
        else if (hasEmail && hasLastName) {
            userEntityList = repositoryUser.findAllByEmailContainingIgnoreCaseAndLastNameContainingIgnoreCase(emailSearch, lastNameSearch, pageable);
        }
        else if (hasFirstName && hasLastName) {
            userEntityList = repositoryUser.findAllByFirstNameContainingIgnoreCaseAndLastNameContainingIgnoreCase(firstNameSearch, lastNameSearch, pageable);
        }
        else if (hasEmail) {
            userEntityList = repositoryUser.findAllByEmailContainingIgnoreCase(emailSearch, pageable);
        }
        else if (hasFirstName) {
            userEntityList = repositoryUser.findAllByFirstNameContainingIgnoreCase(firstNameSearch, pageable);
        }
        else if (hasLastName) {
            userEntityList = repositoryUser.findAllByLastNameContainingIgnoreCase(lastNameSearch, pageable);
        }
        else {
            userEntityList = repositoryUser.findAll(pageable).getContent();
        }

        List<UserSummaryResponseDTO> userSummaryResponseDTOList = new ArrayList<>();
        for(UserEntity userEntity : userEntityList) {
            userSummaryResponseDTOList.add(mapToUserSummaryDTO(userEntity));
        }
        return userSummaryResponseDTOList;
    }

    // ------------------------------------------------------------------------------------------------------- //
    @Transactional
    public void createUser(UserCreateRequestDTO userCreateRequestDTO){
        Optional<UserEntity> optionalUserWithEmail = repositoryUser.findByEmail(userCreateRequestDTO.getEmail());
        if(optionalUserWithEmail.isPresent()) {
            throw new EmailAlreadyExistsException("Email Already Exists. Cannot create User");
        }

        UserEntity userEntity = new UserEntity();
        userEntity.setEmail(userCreateRequestDTO.getEmail());
        userEntity.setFirstName(userCreateRequestDTO.getName());
        userEntity.setLastName(userCreateRequestDTO.getLastName());
        userEntity.setEnabled(true);
        userEntity.setPasswordHash(passwordEncoder.encode(userCreateRequestDTO.getPassword()));

        Optional<RoleEntity> optionalRole = repositoryRole.findByRoleId(userCreateRequestDTO.getRole().getId());
        if (optionalRole.isEmpty()) {
            throw new RoleNotFoundException("Role Not Found");
        }

        RoleEntity thisRoleEntity = optionalRole.get();

        if(thisRoleEntity.getRoleId() == 2) {
            throw new RuntimeException("Cannot create 'Cliente' User");
        }

        userEntity.setRoleEntity(thisRoleEntity);
        repositoryUser.save(userEntity);
    }

    // ------------------------------------------------------------------------------------------------------- //
    @Transactional
    public void updateUser(Long userId, UserCreateRequestDTO userUpdateRequestDTO){
        Optional<UserEntity> optionalUser = repositoryUser.findById(userId);
        if(optionalUser.isEmpty()) {
            throw new UserIDNotMatchException("User not Exists");
        }

        UserEntity thisUserEntity = optionalUser.get();

        if(thisUserEntity.getRoleEntity().getRoleId() == 2) {
            throw new RuntimeException("Cannot update 'Cliente' User");
        }
        Optional<UserEntity> optionalUserWithEmail = repositoryUser.findByEmail(userUpdateRequestDTO.getEmail());
        if(optionalUserWithEmail.isPresent() && !optionalUserWithEmail.get().getUserId().equals(thisUserEntity.getUserId())) {
            throw new EmailAlreadyExistsException("Email Already Exists. Cannot update User");
        }

        thisUserEntity.setEmail(userUpdateRequestDTO.getEmail());
        thisUserEntity.setFirstName(userUpdateRequestDTO.getName());
        thisUserEntity.setLastName(userUpdateRequestDTO.getLastName());
        thisUserEntity.setPasswordHash(passwordEncoder.encode(userUpdateRequestDTO.getPassword()));
        thisUserEntity.setEnabled(userUpdateRequestDTO.getEnabled());

        Optional<RoleEntity> optionalRole = repositoryRole.findByRoleId(userUpdateRequestDTO.getRole().getId());
        if (optionalRole.isEmpty()) {
            throw new RoleNotFoundException("Role Not Found");
        }
        RoleEntity thisRoleEntity = optionalRole.get();
        if(thisRoleEntity.getRoleId() == 2) {
            throw new RuntimeException("Cannot update to 'Cliente' User");
        }

        thisUserEntity.setRoleEntity(thisRoleEntity);
        repositoryUser.save(thisUserEntity);

    }
}
