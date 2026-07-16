package project.backendmueblar.modules.interactions.services;

import jakarta.validation.constraints.Email;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import project.backendmueblar.exception.auth.EmailNotFoundException;
import project.backendmueblar.exception.auth.UserIDNotMatchException;
import project.backendmueblar.modules.auth.services.JwtService;
import project.backendmueblar.modules.interactions.dtos.request.CollectionCreateRequestDTO;
import project.backendmueblar.modules.interactions.entities.CollectionEntity;
import project.backendmueblar.modules.interactions.repositories.RepositoryCollection;
import project.backendmueblar.modules.users.entities.UserEntity;
import project.backendmueblar.modules.users.repositories.RepositoryUser;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CollectionService {

    private final JwtService jwtService;
    private final RepositoryUser userRepository;
    private final RepositoryCollection collectionRepository;

    public void createCollection(CollectionCreateRequestDTO collectionCreateRequestDTO, String authHeader) {
        String uniqueEmailForUser = jwtService.extractEmail(authHeader);
        Optional<UserEntity> optionalUser = userRepository.findByEmail(uniqueEmailForUser);
        if (optionalUser.isEmpty()) {
            throw new UserIDNotMatchException("User not Found, Cannot create or access to Collection");
        }

        UserEntity thisUserEntity =  optionalUser.get();

        CollectionEntity collectionEntity = new CollectionEntity();
        collectionEntity.setTitle(collectionCreateRequestDTO.getTitle());
        collectionEntity.setErasable(true);
        collectionEntity.setUserEntity(thisUserEntity);
        collectionRepository.save(collectionEntity);
    }
}
