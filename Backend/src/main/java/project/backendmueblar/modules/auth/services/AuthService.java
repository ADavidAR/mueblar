package project.backendmueblar.modules.auth.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import project.backendmueblar.exception.*;
import project.backendmueblar.modules.auth.dtos.*;
import project.backendmueblar.modules.auth.repositories.RepositoryRecoveryToken;
import project.backendmueblar.modules.auth.entities.RecoveryTokenEntity;
import project.backendmueblar.modules.users.entities.RoleEntity;
import project.backendmueblar.modules.users.entities.UserEntity;
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
    private final RepositoryPermission_X_Role repositoryPermission_X_Role;
    private final RepositoryRecoveryToken repositoryRecoveryToken;

    private final JwtService jwtService;
    private final EmailService emailService;

    @Value("${EXPIRATION_TIME_RECOVERY_TOKEN}")
    private long expirationTimeRecoveryToken;

    @Transactional
    public void registerUser(@NonNull UserCreateDTO userCreateDTO){
        Optional<UserEntity> user = repositoryUser.findByEmail(userCreateDTO.getEmail());

       // Bad Responses //
        if(user.isPresent()){
            throw new EmailAlreadyExistsException(String.format("User with email %s already exists", userCreateDTO.getEmail()));
        }
        Optional<RoleEntity> roleEntity = repositoryRole.findByRoleName("Cliente");
        if(!(roleEntity.isPresent())){
            throw new RoleNotFoundException("Role does not exist");
        }

        // Good Response
        UserEntity userEntity = new UserEntity();
        userEntity.setEmail(userCreateDTO.getEmail());
        userEntity.setFirstName(userCreateDTO.getName());
        userEntity.setLastName(userCreateDTO.getLastName());

        userEntity.setPasswordHash(passwordEncoder.encode(userCreateDTO.getPassword()));
        userEntity.setEnabled(true);
        userEntity.setRoleEntity(roleEntity.get());
        repositoryUser.save(userEntity);
    }

    public String authenticationUser(UserAuthDTO userAuthDTO, Long expirationTime){
        Optional<UserEntity> optionalUser = repositoryUser.findByEmail(userAuthDTO.getEmail());

        // Bad Responses //
        if(!(optionalUser.isPresent())){
            throw new EmailNotFoundException(String.format("Invalid Email: %s", userAuthDTO.getEmail()));
        }
        if (!passwordEncoder.matches(userAuthDTO.getPassword(), optionalUser.get().getPasswordHash())) {
            throw new PasswordNotMatchWithUserException("Incorrect Password");
        }
        if(!(optionalUser.get().getEnabled())){
            throw new UserDisabledException("Disabled User");
        }

        // Good Response
        UserEntity user = optionalUser.get();

        List<Object[]> listOfEndpointsAndPermissions = repositoryPermission_X_Role.findEndpointsAndPermission(user);

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
    public void recoveryEmailAndGenerateToken(EmailAuthDTO emailAuthDTO) {
        Optional<UserEntity> optionalUser = repositoryUser.findByEmail(emailAuthDTO.getEmail());

        // Bad Responses //
        if(!(optionalUser.isPresent())){
            throw new EmailNotFoundException(String.format("Email '%s' was not found", emailAuthDTO.getEmail()));
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
    public void resetPassword(ResetPasswordDTO resetPasswordDTO) {
        Optional<RecoveryTokenEntity> optionalRecoveryToken = repositoryRecoveryToken.findByToken(resetPasswordDTO.getTokenReset());
        if(!(optionalRecoveryToken.isPresent())){
            throw new RecoveryTokenNotFoundException("Recovery Token not found");
        }

        RecoveryTokenEntity recoveryTokenEntity = optionalRecoveryToken.get();

        OffsetDateTime recoveryTokencreationDate = recoveryTokenEntity.getCreatedAt();
        if(recoveryTokencreationDate.plus(expirationTimeRecoveryToken, ChronoUnit.MILLIS).isBefore(OffsetDateTime.now())){
            throw new RecoveryTokenIsExpired("The deadline for changing the password has passed.");
        }

        UserEntity userEntity = recoveryTokenEntity.getUserEntity();
        if(!(userEntity.getUserId().equals(resetPasswordDTO.getId()))) {
            throw new UserIDNotMatchException("The user does not have permission to perform this recovery / The user does not exist.");
        }

        userEntity.setPasswordHash(passwordEncoder.encode(resetPasswordDTO.getPassword()));
        repositoryRecoveryToken.delete(recoveryTokenEntity);
    }

    public void validateToken(String verificationToken) {
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

    public Map<String, Integer> extractEndpointAndPermission(String authHeader, UrlDTO urlDTO) {
        if(authHeader == null && !authHeader.startsWith("Bearer ")){
            throw new UserDisabledException("Disabled User, not authorized");
        }
        String jwt = authHeader.substring(7);

        if (jwtService.extractEndpointAndPermission(jwt, urlDTO.getUrl()).get(urlDTO.getUrl()) == null) {
            throw new EndpointNotExistForUser("URL / API does not exist");
        }

        return jwtService.extractEndpointAndPermission(jwt, urlDTO.getUrl());
    }
}
