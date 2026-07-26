package project.backendmueblar.modules.users.services;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import project.backendmueblar.exception.auth.UserIDNotMatchException;
import project.backendmueblar.exception.catalog.InternalServerException;
import project.backendmueblar.modules.users.dtos.response.RoleSummaryResponseDTO;
import project.backendmueblar.modules.users.dtos.response.UserSummaryResponseDTO;
import project.backendmueblar.modules.users.entities.UserEntity;
import project.backendmueblar.modules.users.repositories.RepositoryUser;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ServiceUser {
    private final RepositoryUser repositoryUser;

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
}
