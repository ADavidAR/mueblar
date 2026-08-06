package project.backendmueblar.modules.users.services;

import jakarta.persistence.Table;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import project.backendmueblar.exception.auth.EmailAlreadyExistsException;
import project.backendmueblar.exception.auth.UserIDNotMatchException;
import project.backendmueblar.exception.catalog.ResourceNotFoundException;
import project.backendmueblar.modules.auth.dtos.UserCreateRequestDTO;
import project.backendmueblar.modules.auth.dtos.UserUpdateRequestDTO;
import project.backendmueblar.modules.auth.services.JwtService;
import project.backendmueblar.modules.logEntry.services.LogService;
import project.backendmueblar.modules.users.dtos.response.UserProfileSummaryResponseDTO;
import project.backendmueblar.modules.users.entities.UserEntity;
import project.backendmueblar.modules.users.repositories.RepositoryUser;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.lang.module.ResolutionException;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProfileService {
    private final RepositoryUser repositoryUser;
    private final PasswordEncoder passwordEncoder;

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

    // Metodo de Servicio : Obtencion de Perfil Especifico de un Usuario //
    public UserProfileSummaryResponseDTO getProfileSpecificForUser(String authHeader){
        UserEntity userEntity = existsUserWithToken(authHeader).get();

        UserProfileSummaryResponseDTO userProfileSummaryResponseDTO = new UserProfileSummaryResponseDTO();
        userProfileSummaryResponseDTO.setEmail(userEntity.getEmail());
        userProfileSummaryResponseDTO.setFirstName(userEntity.getFirstName());
        userProfileSummaryResponseDTO.setLastName(userEntity.getLastName());
        return userProfileSummaryResponseDTO;
    }

    // ----------------------------------------------------------------------------------------------------------- //

    // Metodo de Servicio : Modificacion de Perfil de Uusuario Especifico //
    @Transactional
    public void modifyProfile(String authHeader, UserUpdateRequestDTO userUpdateRequestDTO){
        UserEntity thisUserEntity = existsUserWithToken(authHeader).get();

        Optional<UserEntity> optionalUserWithEmail = repositoryUser.findByEmail(userUpdateRequestDTO.getEmail());
        if(optionalUserWithEmail.isPresent() && !optionalUserWithEmail.get().getUserId().equals(thisUserEntity.getUserId())){
            throw new EmailAlreadyExistsException("Email Already Exists");
        }

        Map<String, Object> oldValueMap = objectMapper.convertValue(thisUserEntity, new TypeReference<Map<String, Object>>() {});

        thisUserEntity.setEmail(userUpdateRequestDTO.getEmail());
        thisUserEntity.setFirstName(userUpdateRequestDTO.getName());
        thisUserEntity.setLastName(userUpdateRequestDTO.getLastName());

        String optionalNewPasswordToHash = userUpdateRequestDTO.getPassword();

        if (optionalNewPasswordToHash != null && !optionalNewPasswordToHash.trim().isEmpty()) {
            String regex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$";
            if (!optionalNewPasswordToHash.matches(regex)) {
                throw new RuntimeException("Invalid Password");
            }
            thisUserEntity.setPasswordHash(passwordEncoder.encode(optionalNewPasswordToHash));
        }

        repositoryUser.save(thisUserEntity);
        logService.logEntryDataBase(tableNameFromEntity(thisUserEntity), thisUserEntity.getUserId(), objectMapper.convertValue(thisUserEntity, new TypeReference<Map<String, Object>>() {}), oldValueMap, 2);

    }
}
