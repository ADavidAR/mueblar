package project.backendmueblar.modules.auth.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import project.backendmueblar.exception.auth.*;
import project.backendmueblar.modules.auth.dtos.*;
import project.backendmueblar.modules.auth.repositories.RepositoryRecoveryToken;
import project.backendmueblar.modules.auth.entities.RecoveryTokenEntity;
import project.backendmueblar.modules.users.entities.ModuleEntity;
import project.backendmueblar.modules.users.entities.Module_X_RoleEntity;
import project.backendmueblar.modules.users.entities.RoleEntity;
import project.backendmueblar.modules.users.entities.UserEntity;
import project.backendmueblar.modules.users.repositories.RepositoryModule;
import project.backendmueblar.modules.users.repositories.RepositoryPermission_X_Role;
import project.backendmueblar.modules.users.repositories.RepositoryRole;
import project.backendmueblar.modules.users.repositories.RepositoryUser;

import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final RepositoryUser repositoryUser;
    private final RepositoryRole repositoryRole;
    private final PasswordEncoder passwordEncoder;
    private final RepositoryRecoveryToken repositoryRecoveryToken;
    private final RepositoryModule repositoryModule;

    private final JwtService jwtService;
    private final EmailService emailService;

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

//        List<Module_X_RoleEntityy> listOfEndpointsAndPermissions = repositoryModule.findBy(user);

        if(listOfEndpointsAndPermissions.isEmpty()){
            throw new NoRelatedPermissionsException("No permissions");
        }

        Map<String, Integer> endpointsAndPermissionsMap = listOfEndpointsAndPermissions.stream()
                .collect(Collectors.toMap(
                        row -> (String) row[0],
                        row -> ((Number) row[1]).intValue()
                ));

        return jwtService.generateToken(user, endpointsAndPermissionsMap, expirationTime);
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

    private static String generateTokenRecovery(){
        UUID uuid = UUID.randomUUID();
        return uuid.toString().replace("-", "");
    }

    public Map<String, Integer> extractEndpointAndPermission(String authHeader, UrlRequestDTO urlRequestDTO) {
        if(authHeader == null && !authHeader.startsWith("Bearer ")){
            throw new UserDisabledException("Disabled User, not authorized");
        }
        String jwt = authHeader.substring(7);

        if ((jwtService.extractEndpointAndPermission(jwt, urlRequestDTO.getUrl())) == null) {
            throw new EndpointNotExistForUser("URL / API does not exist");
        }

        return jwtService.extractEndpointAndPermission(jwt, urlRequestDTO.getUrl());
    }
}
