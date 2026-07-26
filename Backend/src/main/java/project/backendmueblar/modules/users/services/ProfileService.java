package project.backendmueblar.modules.users.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import project.backendmueblar.exception.auth.UserIDNotMatchException;
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

    private Optional<UserEntity> existsUserWithToken(String authHeader) {
        String uniqueEmailForUser = jwtService.extractEmail(authHeader);
        Optional<UserEntity> optionalUser = repositoryUser.findByEmail(uniqueEmailForUser);
        if (optionalUser.isEmpty()) {
            throw new UserIDNotMatchException("User not Found, Cannot create or access to Collection");
        }
        return optionalUser;
    }

    public UserProfileSummaryResponseDTO getProfileSpecificForUser(String authHeader){
        UserEntity userEntity = existsUserWithToken(authHeader).get();

        UserProfileSummaryResponseDTO userProfileSummaryResponseDTO = new UserProfileSummaryResponseDTO();
        userProfileSummaryResponseDTO.setEmail(userEntity.getEmail());
        userProfileSummaryResponseDTO.setFirstName(userEntity.getFirstName());
        userProfileSummaryResponseDTO.setLastName(userEntity.getLastName());
        return userProfileSummaryResponseDTO;
    }
}
