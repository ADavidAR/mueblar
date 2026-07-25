package project.backendmueblar.modules.auth.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import project.backendmueblar.exception.auth.*;
import project.backendmueblar.modules.auth.EndpointsCacheComponent;
import project.backendmueblar.modules.auth.dtos.*;
import project.backendmueblar.modules.auth.repositories.RepositoryRecoveryToken;
import project.backendmueblar.modules.auth.entities.RecoveryTokenEntity;
import project.backendmueblar.modules.users.entities.ModuleEntity;
import project.backendmueblar.modules.users.entities.Module_X_RoleEntity;
import project.backendmueblar.modules.users.entities.RoleEntity;
import project.backendmueblar.modules.users.entities.UserEntity;
import project.backendmueblar.modules.users.repositories.*;

import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
@Service
@RequiredArgsConstructor
public class AuthService {
    private final RepositoryUser repositoryUser;
    private final RepositoryRole repositoryRole;
    private final PasswordEncoder passwordEncoder;
    private final RepositoryRecoveryToken repositoryRecoveryToken;
    private final RepositoryModule repositoryModule;
    private final RepositoryModule_X_Role repositoryModule_X_Role;

    private final JwtService jwtService;
    private final EmailService emailService;

    private final EndpointsCacheComponent endpointsCacheComponent;

    @Value("${EXPIRATION_TIME_RECOVERY_TOKEN}")
    private long expirationTimeRecoveryToken;

    @Transactional
    public void registerUser(@NonNull UserCreateRequestDTO userCreateRequestDTO){
        Optional<UserEntity> user = repositoryUser.findByEmail(userCreateRequestDTO.getEmail());

       // Bad Responses //
        if(user.isPresent()){
            throw new EmailAlreadyExistsException(String.format("User with email %s already exists", userCreateRequestDTO.getEmail()));
        }
        Optional<RoleEntity> roleEntity = repositoryRole.findByRoleName("Cliente");
        if(!(roleEntity.isPresent())){
            throw new RoleNotFoundException("Role does not exist");
        }

        // Good Response
        UserEntity userEntity = new UserEntity();
        userEntity.setEmail(userCreateRequestDTO.getEmail());
        userEntity.setFirstName(userCreateRequestDTO.getName());
        userEntity.setLastName(userCreateRequestDTO.getLastName());

        userEntity.setPasswordHash(passwordEncoder.encode(userCreateRequestDTO.getPassword()));
        userEntity.setEnabled(true);
        userEntity.setRoleEntity(roleEntity.get());
        repositoryUser.save(userEntity);
    }

    public String authenticationUser(UserAuthRequestDTO userAuthRequestDTO, Long expirationTime){
        System.out.println(expirationTime);
        Optional<UserEntity> optionalUser = repositoryUser.findByEmail(userAuthRequestDTO.getEmail());

        // Bad Responses //
        if(!(optionalUser.isPresent())){
            throw new EmailNotFoundException(String.format("Invalid Email: %s", userAuthRequestDTO.getEmail()));
        }
        if (!passwordEncoder.matches(userAuthRequestDTO.getPassword(), optionalUser.get().getPasswordHash())) {
            throw new PasswordNotMatchWithUserException("Incorrect Password");
        }
        if(!(optionalUser.get().getEnabled())){
            throw new UserDisabledException("Disabled User");
        }

        // Good Response
        UserEntity user = optionalUser.get();

        Map<Long, Integer> modulesMapWithPermissionsBitWithID = new HashMap<>();

        List<Module_X_RoleEntity> moduleXRoleEntityList = repositoryModule_X_Role.findAllByRoleEntity(user.getRoleEntity());
        for (Module_X_RoleEntity moduleXRoleEntity : moduleXRoleEntityList){
            ModuleEntity thisModuleEntity = moduleXRoleEntity.getModuleEntity();
            Integer permissionsBitModule = getInteger(moduleXRoleEntity);

            modulesMapWithPermissionsBitWithID.put(thisModuleEntity.getModuleId(), permissionsBitModule);
        }
        return jwtService.generateToken(user, modulesMapWithPermissionsBitWithID, expirationTime);
    }

    @Transactional
    public void recoveryEmailAndGenerateToken(EmailAuthRequestDTO emailAuthRequestDTO) {
        Optional<UserEntity> optionalUser = repositoryUser.findByEmail(emailAuthRequestDTO.getEmail());

        // Bad Responses //
        if(!(optionalUser.isPresent())){
            throw new EmailNotFoundException(String.format("Email '%s' was not found", emailAuthRequestDTO.getEmail()));
        }

        UserEntity user = optionalUser.get();
        RecoveryTokenEntity recoveryTokenEntity = new RecoveryTokenEntity();

        recoveryTokenEntity.setUserEntity(user);
        recoveryTokenEntity.setCreatedAt(OffsetDateTime.now());

        recoveryTokenEntity.setToken(generateTokenRecovery());

        System.out.println(recoveryTokenEntity.getToken());

        repositoryRecoveryToken.save(recoveryTokenEntity);
        emailService.sendRecoveryEmail(user.getEmail(), recoveryTokenEntity.getToken(), user.getUserId().toString());
    }

    @Transactional
    public void resetPassword(ResetPasswordRequestDTO resetPasswordRequestDTO) {
        Optional<RecoveryTokenEntity> optionalRecoveryToken = repositoryRecoveryToken.findByToken(resetPasswordRequestDTO.getTokenReset());
        if(!(optionalRecoveryToken.isPresent())){
            throw new RecoveryTokenNotFoundException("Recovery Token not found");
        }

        RecoveryTokenEntity recoveryTokenEntity = optionalRecoveryToken.get();

        OffsetDateTime recoveryTokencreationDate = recoveryTokenEntity.getCreatedAt();
        if(recoveryTokencreationDate.plus(expirationTimeRecoveryToken, ChronoUnit.MILLIS).isBefore(OffsetDateTime.now())){
            throw new RecoveryTokenIsExpired("The deadline for changing the password has passed.");
        }

        UserEntity userEntity = recoveryTokenEntity.getUserEntity();
        if(!(userEntity.getUserId().equals(resetPasswordRequestDTO.getId()))) {
            throw new UserIDNotMatchException("The user does not have permission to perform this recovery / The user does not exist.");
        }

        userEntity.setPasswordHash(passwordEncoder.encode(resetPasswordRequestDTO.getPassword()));
        repositoryRecoveryToken.delete(recoveryTokenEntity);
    }

    public void getTokenVerification(String verificationToken) {
        Optional<RecoveryTokenEntity> optionalRecoveryToken = repositoryRecoveryToken.findByToken(verificationToken);
        if(!(optionalRecoveryToken.isPresent())){
            throw new RecoveryTokenNotFoundException("Recovery Token not found");
        }

        RecoveryTokenEntity recoveryTokenEntity = optionalRecoveryToken.get();

        OffsetDateTime recoveryTokencreationDate = recoveryTokenEntity.getCreatedAt();
        if(recoveryTokencreationDate.plus(expirationTimeRecoveryToken, ChronoUnit.MILLIS).isBefore(OffsetDateTime.now())){
            throw new RecoveryTokenIsExpired("The deadline for changing the password has passed.");
        }
    }

    public Integer extractPermissionForEndpoint(String authHeader, UrlRequestDTO urlRequestDTO) {
        UserEntity thisUserEntity = existsUserWithToken(authHeader).get();

        Map<Long, List<String>> allEndpointsMap = endpointsCacheComponent.getAllEndpointsMap();

        for(Long modulesId : allEndpointsMap.keySet()){
            List<String> endpointsList = allEndpointsMap.get(modulesId);

            for(String endpoint : endpointsList){
                if(endpoint.equals(urlRequestDTO.getUrl())){
                    Module_X_RoleEntity moduleXRoleEntity = repositoryModule_X_Role.findByRoleEntityAndModuleEntity_ModuleId(thisUserEntity.getRoleEntity(), modulesId).get();
                    return getInteger(moduleXRoleEntity);
                }
            }
        }

        throw new NotPatternURLFoundTokenException("Not exist Permissions for this URL");

    }

    public Map<Long, String> getRoleAssociatedToToken(String authHeader){
        UserEntity userEntity = existsUserWithToken(authHeader).get();
        Map<Long, String> mapRole = new HashMap<>();

        mapRole.put(userEntity.getRoleEntity().getRoleId(), userEntity.getRoleEntity().getRoleName());
        return mapRole;
    }

    private Optional<UserEntity> existsUserWithToken(String authHeader) {
        String uniqueEmailForUser = jwtService.extractEmail(authHeader);
        Optional<UserEntity> optionalUser = repositoryUser.findByEmail(uniqueEmailForUser);
        if (optionalUser.isEmpty()) {
            throw new UserIDNotMatchException("User not Found, Cannot create or access to Collection");
        }
        return optionalUser;
    }


    private static String generateTokenRecovery(){
        UUID uuid = UUID.randomUUID();
        return uuid.toString().replace("-", "");
    }

    private static @NonNull Integer getInteger(Module_X_RoleEntity moduleXRoleEntity) {
        Integer accessBit1;
        Integer creationBit2;
        Integer deleteBit3;
        Integer modificationBit4;

        if(moduleXRoleEntity.isAccess()){
            accessBit1 = 8;
        } else {
            accessBit1 = 0;
        }

        if(moduleXRoleEntity.isCreation()){
            creationBit2 = 4;
        } else {
            creationBit2 = 0;
        }

        if(moduleXRoleEntity.isDeletion()){
            deleteBit3 = 2;
        } else {
            deleteBit3 = 0;
        }

        if(moduleXRoleEntity.isModification()){
            modificationBit4 = 1;
        } else {
            modificationBit4 = 0;
        }

        Integer permissionsBitModule = accessBit1 + creationBit2 + deleteBit3 + modificationBit4;
        return permissionsBitModule;
    }
}
