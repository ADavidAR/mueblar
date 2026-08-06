package project.backendmueblar.modules.auth.services;

import jakarta.persistence.Table;
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
import project.backendmueblar.modules.interactions.services.CollectionService;
import project.backendmueblar.modules.logEntry.services.LogService;
import project.backendmueblar.modules.users.entities.ModuleEntity;
import project.backendmueblar.modules.users.entities.Module_X_RoleEntity;
import project.backendmueblar.modules.users.entities.RoleEntity;
import project.backendmueblar.modules.users.entities.UserEntity;
import project.backendmueblar.modules.users.repositories.*;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

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
    private final CollectionService collectionService;
    private final JwtService jwtService;
    private final EmailService emailService;

    private final EndpointsCacheComponent endpointsCacheComponent;

    private final LogService logService;
    private final ObjectMapper objectMapper;

    @Value("${EXPIRATION_TIME_RECOVERY_TOKEN}")
    private long expirationTimeRecoveryToken;

    // Extraccion del Nombre de la Tabla en la Base de Datos asociado a una Entidad Cualquiera //
    private String tableNameFromEntity(Object entity){
        Class<?> entityClass = entity.getClass();
        Table tableAnnotation = entityClass.getAnnotation(Table.class);

        if (tableAnnotation != null && !tableAnnotation.name().isEmpty()) {
            return tableAnnotation.name();
        }
        return entityClass.getSimpleName().toLowerCase();
    }

    // Metodo de Servicio: Registro de Usuario //
    @Transactional
    public void registerUser(@NonNull UserCreateRequestDTO userCreateRequestDTO){
        Optional<UserEntity> user = repositoryUser.findByEmail(userCreateRequestDTO.getEmail());

       // Bad Responses //
        if(user.isPresent()){
            throw new EmailAlreadyExistsException(String.format("User with email %s already exists", userCreateRequestDTO.getEmail()));
        }
        Optional<RoleEntity> roleEntity = repositoryRole.findByRoleName("Cliente");
        if(!(roleEntity.isPresent())){
            throw new RoleNotFoundException("Cannot Create a User with Different Role");
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

        collectionService.createDefaultCollectionForUser(userEntity.getUserId());

        logService.logEntryDataBase(tableNameFromEntity(userEntity), userEntity.getUserId(), objectMapper.convertValue(userEntity, new TypeReference<Map<String, Object>>() {}), null, 1);
    }

    // Metodo de Servicio: Autenticacion de Usuario //
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

    // Metodo de Servicio : Recuperacion de Cuenta : Recuperacion por Correo y Generacion de Token de Vencimiento en la Base de Datos //
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
        logService.logEntryDataBase(tableNameFromEntity(recoveryTokenEntity), user.getUserId(), objectMapper.convertValue(recoveryTokenEntity, new TypeReference<Map<String, Object>>() {}), null, 1);
    }

    // Metodo de Servicio : Reseteo de Contraseña, Generacion de Nueva Contraseña para el Usuario //
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
        logService.logEntryDataBase(tableNameFromEntity(recoveryTokenEntity), userEntity.getUserId(), null, objectMapper.convertValue(recoveryTokenEntity, new TypeReference<Map<String, Object>>() {}), 3);
    }

    // Metodo de Servicio : Verificacion de Token de Expiracion //
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

    // Metodo de Servicio : Extraccion de Permisos asociado a un Endpoint API o Vista segun el Token ligado a Usuario Brindado //
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

    // Metodo de Servicio : Extraccion de Rol Asociado de Token de Usuario Brindado //
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

    // Metodo de Servicio PRIVADO : Generacion del Token de Recuperacion de Tipo UUID //
    private static String generateTokenRecovery(){
        UUID uuid = UUID.randomUUID();
        return uuid.toString().replace("-", "");
    }

    // Metodo de Servicio PRIVADO : Calculo de Bit de Permiso (0-15 ; 8 <= X <= 15) Asociado a Tabla Intermedia existente entre Rol y Usuario Brindado //
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
