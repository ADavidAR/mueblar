package project.backendmueblar.modules.users.services;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import project.backendmueblar.exception.auth.UserIDNotMatchException;
import project.backendmueblar.modules.users.dtos.response.RoleSummaryResponseDTO;
import project.backendmueblar.modules.users.dtos.response.UserSummaryResponseDTO;
import project.backendmueblar.modules.users.entities.UserEntity;
import project.backendmueblar.modules.users.repositories.RepositoryUser;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ServiceUser {
    private final RepositoryUser repositoryUser;

    public UserSummaryResponseDTO getUserSpecific(Long userId) {
        Optional<UserEntity> optionalUser = repositoryUser.findById(userId);
        if(optionalUser.isEmpty()) {
            throw new UserIDNotMatchException("User not Exists");
        }

        UserEntity thisUserEntity = optionalUser.get();
        UserSummaryResponseDTO userSummaryResponseDTO = new UserSummaryResponseDTO();
        userSummaryResponseDTO.setEmail(thisUserEntity.getEmail());
        userSummaryResponseDTO.setId(thisUserEntity.getUserId());
        userSummaryResponseDTO.setApellido(thisUserEntity.getLastName());
        userSummaryResponseDTO.setNombre(thisUserEntity.getFirstName());

        RoleSummaryResponseDTO roleSummaryResponseDTO = new RoleSummaryResponseDTO();
        roleSummaryResponseDTO.setId(thisUserEntity.getRoleEntity().getRoleId());
        roleSummaryResponseDTO.setName(thisUserEntity.getRoleEntity().getRoleName());

        userSummaryResponseDTO.setRole(roleSummaryResponseDTO);
        return userSummaryResponseDTO;
    }
}
