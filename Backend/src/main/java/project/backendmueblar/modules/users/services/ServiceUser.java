package project.backendmueblar.modules.users.services;

import jakarta.persistence.Table;
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
import project.backendmueblar.modules.auth.dtos.UserUpdateRequestDTO;
import project.backendmueblar.modules.auth.services.JwtService;
import project.backendmueblar.modules.interactions.services.CollectionService;
import project.backendmueblar.modules.logEntry.services.LogService;
import project.backendmueblar.modules.users.dtos.response.RoleSummaryResponseDTO;
import project.backendmueblar.modules.users.dtos.response.UserSummaryResponseDTO;
import project.backendmueblar.modules.users.entities.RoleEntity;
import project.backendmueblar.modules.users.entities.UserEntity;
import project.backendmueblar.modules.users.repositories.RepositoryRole;
import project.backendmueblar.modules.users.repositories.RepositoryUser;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class ServiceUser {
    private final RepositoryUser repositoryUser;
    private final PasswordEncoder passwordEncoder;
    private final RepositoryRole repositoryRole;
    private final CollectionService collectionService;
    private final LogService logService;
    private final ObjectMapper objectMapper;
    private final JwtService jwtService;
    private final RepositoryUser userRepository;

    // Metodo de Servicio PRIVATE : Extraccion del Nombre de la Tabla en la Base de Datos asociado a una Entidad Cualquiera //
    private String tableNameFromEntity(Object entity){
        Class<?> entityClass = entity.getClass();
        Table tableAnnotation = entityClass.getAnnotation(Table.class);

        if (tableAnnotation != null && !tableAnnotation.name().isEmpty()) {
            return tableAnnotation.name();
        }
        return entityClass.getSimpleName().toLowerCase();
    }

    // ----------------------------------------------------------------------------------------------------------------------------------------//

    // Metodo de Servicio PRIVATE : Comprobacion de Existencia de Usuario mediante Token JWT brindado //
    private Optional<UserEntity> existsUserWithToken(String authHeader) {
        String uniqueEmailForUser = jwtService.extractEmail(authHeader);
        Optional<UserEntity> optionalUser = userRepository.findByEmail(uniqueEmailForUser);
        if (optionalUser.isEmpty()) {
            throw new UserIDNotMatchException("User not Found");
        }
        return optionalUser;
    }

    // ----------------------------------------------------------------------------------------------------------------------------------------//

    // Metodo de Servicio PRIVADO : Conversion de Entidad "Usuario a Mapa Respuesta DTO //
    private UserSummaryResponseDTO mapToUserSummaryDTO(UserEntity thisUserEntity) {
        UserSummaryResponseDTO dto = new UserSummaryResponseDTO();
        dto.setEmail(thisUserEntity.getEmail());
        dto.setId(thisUserEntity.getUserId());
        dto.setApellido(thisUserEntity.getLastName());
        dto.setNombre(thisUserEntity.getFirstName());
        dto.setEnabled(thisUserEntity.getEnabled());

        RoleSummaryResponseDTO roleDTO = new RoleSummaryResponseDTO();
        roleDTO.setId(thisUserEntity.getRoleEntity().getRoleId());
        roleDTO.setName(thisUserEntity.getRoleEntity().getRoleName());
        roleDTO.setEditable(thisUserEntity.getRoleEntity().getEditable());

        dto.setRole(roleDTO);
        return dto;
    }

    // ------------------------------------------------------------------------------------------------------- //

    // Metodo de Servicio : Obtencion de Usuario Especifico dentro del Sistema //
    public UserSummaryResponseDTO getUserSpecific(Long userId) {
        Optional<UserEntity> optionalUser = repositoryUser.findById(userId);
        if(optionalUser.isEmpty()) {
            throw new UserIDNotMatchException("User not Exists");
        }

        return mapToUserSummaryDTO(optionalUser.get());
    }

    // ------------------------------------------------------------------------------------------------------- //

    // Metodo de Servicio : Obtencion de Todos los Usuarios Exsitentes dentro del Sistema //
    public List<UserSummaryResponseDTO> getAllUsers(Integer limit, Integer page, String emailSearch, String nameSearch) {
        if(limit == 0) {
            throw new InternalServerException("Cannot throw zero Users");
        }

        List<UserEntity> userEntityList;
        Pageable pageable = PageRequest.of(page, limit);

        boolean hasEmail = (emailSearch != null && !emailSearch.trim().isEmpty());
        boolean hasName = (nameSearch != null && !nameSearch.trim().isEmpty());

        if (hasName) {
            String[] nameParts = nameSearch.trim().split("\\s+");

            if (nameParts.length >= 2) {
                String firstNameSearch = nameParts[0];
                String lastNameSearch = nameParts[nameParts.length - 1];

                if (hasEmail) {
                    userEntityList = repositoryUser.findAllByEmailContainingIgnoreCaseAndFirstNameContainingIgnoreCaseAndLastNameContainingIgnoreCase(
                            emailSearch, firstNameSearch, lastNameSearch, pageable);
                } else {
                    userEntityList = repositoryUser.findAllByFirstNameContainingIgnoreCaseAndLastNameContainingIgnoreCase(
                            firstNameSearch, lastNameSearch, pageable);
                }
            } else {
                if (hasEmail) {
                    userEntityList = repositoryUser.findAllByEmailContainingIgnoreCaseOrFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
                            emailSearch, nameSearch, nameSearch, pageable);
                } else {
                    userEntityList = repositoryUser.findAllByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(
                            nameSearch, nameSearch, pageable);
                }
            }
        } else if (hasEmail) {
            userEntityList = repositoryUser.findAllByEmailContainingIgnoreCase(emailSearch, pageable);
        } else {
            userEntityList = repositoryUser.findAll(pageable).getContent();
        }

        List<UserSummaryResponseDTO> userSummaryResponseDTOList = new ArrayList<>();
        for(UserEntity userEntity : userEntityList) {
            userSummaryResponseDTOList.add(mapToUserSummaryDTO(userEntity));
        }
        return userSummaryResponseDTOList;
    }

    // ------------------------------------------------------------------------------------------------------- //

    // Metodo de Servicio : Creacion de Usuario Especifico dentro del Sistema //
    @Transactional
    public void createUser(String authHeader, UserCreateRequestDTO userCreateRequestDTO){
        UserEntity thisUserEntity = existsUserWithToken(authHeader).get();

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

        collectionService.createDefaultCollectionForUser(userEntity.getUserId());

        logService.logEntryDataBase(tableNameFromEntity(userEntity), thisUserEntity.getUserId(), objectMapper.convertValue(userEntity, new TypeReference<Map<String, Object>>() {}), null, 1);
    }

    // ------------------------------------------------------------------------------------------------------- //

    // Metodo de Servicio : Modificacion de Usuario Especifico dentro del Sistema //
    @Transactional
    public void updateUser(String authHeader, Long userId, UserUpdateRequestDTO userUpdateRequestDTO){
        UserEntity userEntity = existsUserWithToken(authHeader).get();

        Optional<UserEntity> optionalUser = repositoryUser.findById(userId);
        if(optionalUser.isEmpty()) {
            throw new UserIDNotMatchException("User not Exists");
        }

        UserEntity thisUserEntity = optionalUser.get();
        Map<String, Object> oldValueMap = objectMapper.convertValue(thisUserEntity, new TypeReference<Map<String, Object>>() {});

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

        String optionalNewPasswordToHash = userUpdateRequestDTO.getPassword();

        if (optionalNewPasswordToHash != null && !optionalNewPasswordToHash.trim().isEmpty()) {
            String regex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$";
            if (!optionalNewPasswordToHash.matches(regex)) {
                throw new RuntimeException("Invalid Password");
            }
            thisUserEntity.setPasswordHash(passwordEncoder.encode(optionalNewPasswordToHash));
        }

        repositoryUser.save(thisUserEntity);
        logService.logEntryDataBase(tableNameFromEntity(thisUserEntity), userEntity.getUserId(), objectMapper.convertValue(thisUserEntity, new TypeReference<Map<String, Object>>() {}), oldValueMap, 2);
    }

    // Metodo de Servicio : Eliminacion de Usuario Especifico dentro del Sistema //
    @Transactional
    public void deleteUser(String authHeader, Long userId) {
        UserEntity userEntity = existsUserWithToken(authHeader).get();

        Optional<UserEntity> optionalUser = repositoryUser.findById(userId);
        if(optionalUser.isEmpty()) {
            throw new UserIDNotMatchException("User not Exists");
        }

        if(userId == 1) {
            throw new RuntimeException("Administrator cannot be deleted");
        }

        if(optionalUser.get().getRoleEntity().getRoleId() == 2L) {
            throw new RuntimeException("Las cuentas de Cliente no pueden ser eliminadas desde el panel administrativo.");
        }

        repositoryUser.delete(optionalUser.get());
        logService.logEntryDataBase(tableNameFromEntity(optionalUser.get()), userEntity.getUserId(), null, objectMapper.convertValue(optionalUser.get(), new TypeReference<Map<String, Object>>() {}), 3);

    }
}
