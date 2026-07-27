package project.backendmueblar.modules.users.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import project.backendmueblar.exception.auth.EmailAlreadyExistsException;
import project.backendmueblar.exception.auth.UserIDNotMatchException;
import project.backendmueblar.modules.auth.dtos.UserCreateRequestDTO;
import project.backendmueblar.modules.auth.services.JwtService;
import project.backendmueblar.modules.users.dtos.response.UserProfileSummaryResponseDTO;
import project.backendmueblar.modules.users.entities.UserEntity;
import project.backendmueblar.modules.users.repositories.RepositoryUser;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProfileService {
    private final JwtService jwtService;
    private final RepositoryUser repositoryUser;
    private final PasswordEncoder passwordEncoder;

    private Optional<UserEntity> existsUserWithToken(String authHeader) {
        String uniqueEmailForUser = jwtService.extractEmail(authHeader);
        Optional<UserEntity> optionalUser = repositoryUser.findByEmail(uniqueEmailForUser);
        if (optionalUser.isEmpty()) {
            throw new UserIDNotMatchException("User not Found, Cannot create or access to Collection");
        }
        return optionalUser;
    }

    // ----------------------------------------------------------------------------------------------------------- //

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

        thisUserEntity.setEmail(userUpdateRequestDTO.getEmail());
        thisUserEntity.setFirstName(userUpdateRequestDTO.getName());
        thisUserEntity.setLastName(userUpdateRequestDTO.getLastName());

        if(userUpdateRequestDTO.getPassword() != null && !userUpdateRequestDTO.getPassword().trim().isEmpty()) {
            thisUserEntity.setPasswordHash(passwordEncoder.encode(userUpdateRequestDTO.getPassword()));
        }

        thisUserEntity.setEnabled(userUpdateRequestDTO.getEnabled());
        repositoryUser.save(thisUserEntity);
    }
}
