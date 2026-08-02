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

    private String tableNameFromEntity(Object entity){
        Class<?> entityClass = entity.getClass();
        Table tableAnnotation = entityClass.getAnnotation(Table.class);

        if (tableAnnotation != null && !tableAnnotation.name().isEmpty()) {
            return tableAnnotation.name();
        }
        return entityClass.getSimpleName().toLowerCase();
    }

    // ----------------------------------------------------------------------------------------------------------------------------------------//

    private Optional<UserEntity> existsUserWithToken(String authHeader) {
        String uniqueEmailForUser = jwtService.extractEmail(authHeader);
        Optional<UserEntity> optionalUser = userRepository.findByEmail(uniqueEmailForUser);
        if (optionalUser.isEmpty()) {
            throw new UserIDNotMatchException("User not Found");
        }
        return optionalUser;
    }

    // ----------------------------------------------------------------------------------------------------------------------------------------//

    public UserProfileSummaryResponseDTO getProfileSpecificForUser(String authHeader){
        UserEntity userEntity = existsUserWithToken(authHeader).get();

        UserProfileSummaryResponseDTO userProfileSummaryResponseDTO = new UserProfileSummaryResponseDTO();
        userProfileSummaryResponseDTO.setEmail(userEntity.getEmail());
        userProfileSummaryResponseDTO.setFirstName(userEntity.getFirstName());
        userProfileSummaryResponseDTO.setLastName(userEntity.getLastName());
        return userProfileSummaryResponseDTO;
    }

    // ----------------------------------------------------------------------------------------------------------- //
    @Transactional
    public void modifyProfile(String authHeader, UserCreateRequestDTO userUpdateRequestDTO){
        UserEntity thisUserEntity = existsUserWithToken(authHeader).get();

        Optional<UserEntity> optionalUserWithEmail = repositoryUser.findByEmail(userUpdateRequestDTO.getEmail());
        if(optionalUserWithEmail.isPresent() && !optionalUserWithEmail.get().getUserId().equals(thisUserEntity.getUserId())){
            throw new EmailAlreadyExistsException("Email Already Exists");
        }

        Map<String, Object> oldValueMap = objectMapper.convertValue(thisUserEntity, new TypeReference<Map<String, Object>>() {});

        thisUserEntity.setEmail(userUpdateRequestDTO.getEmail());
        thisUserEntity.setFirstName(userUpdateRequestDTO.getName());
        thisUserEntity.setLastName(userUpdateRequestDTO.getLastName());

        if(!(userUpdateRequestDTO.getPassword() != null && !userUpdateRequestDTO.getPassword().trim().isEmpty())) {
            throw new ResourceNotFoundException("Password Missing");
        }

        thisUserEntity.setPasswordHash(passwordEncoder.encode(userUpdateRequestDTO.getPassword()));
        thisUserEntity.setEnabled(userUpdateRequestDTO.getEnabled());

        repositoryUser.save(thisUserEntity);
        logService.logEntryDataBase(tableNameFromEntity(thisUserEntity), thisUserEntity.getUserId(), objectMapper.convertValue(thisUserEntity, new TypeReference<Map<String, Object>>() {}), oldValueMap, 2);

    }
}
