package project.backendmueblar.modules.interactions.services;

import jakarta.validation.constraints.Email;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestHeader;
import project.backendmueblar.exception.auth.EmailNotFoundException;
import project.backendmueblar.exception.auth.UserIDNotMatchException;
import project.backendmueblar.exception.catalog.ResourceAlreadyExistsException;
import project.backendmueblar.exception.catalog.ResourceNotFoundException;
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

    private Optional<UserEntity> existsUserWithToken(String authHeader) {
        String uniqueEmailForUser = jwtService.extractEmail(authHeader);
        Optional<UserEntity> optionalUser = userRepository.findByEmail(uniqueEmailForUser);
        if (optionalUser.isEmpty()) {
            throw new UserIDNotMatchException("User not Found, Cannot create or access to Collection");
        }
        return optionalUser;
    }

    public void createCollection(CollectionCreateRequestDTO collectionCreateRequestDTO, String authHeader) {
        UserEntity thisUserEntity =  existsUserWithToken(authHeader).get();

        Optional<CollectionEntity> optionalCollection = collectionRepository.findByTitle(collectionCreateRequestDTO.getTitle());
        if (optionalCollection.isPresent()) {
            throw new ResourceAlreadyExistsException("The Collection already exists");
        }
        CollectionEntity collectionEntity = new CollectionEntity();
        collectionEntity.setTitle(collectionCreateRequestDTO.getTitle());
        collectionEntity.setErasable(true);
        collectionEntity.setUserEntity(thisUserEntity);
        collectionRepository.save(collectionEntity);
    }

    public void updateCollectionName(Long collectionId, CollectionCreateRequestDTO collectionUpdateRequestDTO, String authHeader) {
        UserEntity thisUserEntity = existsUserWithToken(authHeader).get();

        Optional<CollectionEntity> optionalCollection = collectionRepository.findByCollectionId(collectionId);
        if (optionalCollection.isEmpty()) {
            throw new ResourceNotFoundException("Collection not found, cannot update collection");
        }

        CollectionEntity thisCollectionEntity = optionalCollection.get();

        if(!(optionalCollection.get().getUserEntity().getUserId().equals(thisUserEntity.getUserId()))) {
            throw new UserIDNotMatchException("The Collection does not belong to this user");
        }

        thisCollectionEntity.setTitle(collectionUpdateRequestDTO.getTitle());
        collectionRepository.save(thisCollectionEntity);
    }

    public void deleteCollectionAndLogs(Long collectionId, String authHeader){
        UserEntity thisUserEntity =  existsUserWithToken(authHeader).get();

        Optional<CollectionEntity> optionalCollection = collectionRepository.findByCollectionId(collectionId);
        if (optionalCollection.isEmpty()) {
            throw new ResourceNotFoundException("Collection not found, cannot update collection");
        }

        CollectionEntity thisCollectionEntity = optionalCollection.get();

        if(!(optionalCollection.get().getUserEntity().getUserId().equals(thisUserEntity.getUserId()))) {
            throw new UserIDNotMatchException("The Collection does not belong to this user");
        }

        collectionRepository.delete(thisCollectionEntity);

    }

}
