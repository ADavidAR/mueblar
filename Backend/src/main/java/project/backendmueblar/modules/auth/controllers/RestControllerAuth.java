package project.backendmueblar.modules.auth.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.backendmueblar.modules.auth.dtos.*;
import project.backendmueblar.modules.auth.services.AuthService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class RestControllerAuth {
    private final AuthService authService;

    @Value("${security.jwt.expiration-time}")
    private long expirationTime;

    @Value("${EXPIRATION_TIME_APP}")
    private long expirationTimeApp;

    // Registro de Usuarios Cliente en el Sistema //
    @PostMapping(value = "/register", consumes = "application/json")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserCreateRequestDTO userCreateRequestDTO) {
        authService.registerUser(userCreateRequestDTO);

        return ResponseEntity.status(201).body("User registered successfully");
    }

    // Autenticacion de Usuarios de Cualquier Rol en el Sistema //
    @PostMapping(value = "/login", consumes = "application/json")
    public ResponseEntity<Map<String, String>> authenticationUser(@Valid @RequestBody UserAuthRequestDTO userAuthRequestDTO) {
        String tokenJWT = authService.authenticationUser(userAuthRequestDTO, expirationTime);

        Map<String, String> mapJWT = new HashMap<>();
        mapJWT.put("token", tokenJWT);

        return ResponseEntity.status(200).body(mapJWT);
    }

    // Autenticacion de Usuarios de Cualquier Rol en el Sistema (Mobile) //
    @PostMapping(value = "/mobile/login", consumes = "application/json")
    public ResponseEntity<Map<String, String>> authenticationUserApp(@Valid @RequestBody UserAuthRequestDTO userAuthRequestDTO) {
        String tokenJWT = authService.authenticationUser(userAuthRequestDTO, expirationTimeApp);

        Map<String, String> mapJWT = new HashMap<>();
        mapJWT.put("token", tokenJWT);

        return ResponseEntity.status(200).body(mapJWT);
    }

    // Recuperacion de Contraseña mediante el Envio de Email al Usuario //
    @PostMapping(value = "/recovery-email", consumes = "application/json")
    public ResponseEntity<?> recoveryEmailAndGenerateToken(@Valid @RequestBody EmailAuthRequestDTO emailAuthRequestDTO) {
        authService.recoveryEmailAndGenerateToken(emailAuthRequestDTO);
        return ResponseEntity.status(200).body("Message (Email) sent successfully");
    }

    // Reseteo de Contraseña del Usuario //
    @PostMapping(value = "/reset-password", consumes = "application/json")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequestDTO resetPasswordRequestDTO) {
        authService.resetPassword(resetPasswordRequestDTO);
        return ResponseEntity.status(200).body("Password reset successfully");
    }

    // Verificacion / Confirmacion de Token para Recuperacion de Contraseña //
    @GetMapping(value = "/token-verification/{token}")
    public ResponseEntity<?> getTokenVerification(@PathVariable("token") String verificationToken) {
        authService.getTokenVerification(verificationToken);
        return ResponseEntity.status(200).build();
    }

    // Retorno de Permisos asociados a Cierta Endpoint para Cierto Usuario Especifico //
    @PostMapping(value = "/permits", consumes = "application/json")
    public ResponseEntity<Map<String, Integer>> getPermissionsFromEndpoint(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody UrlRequestDTO urlRequestDTO) {

        Map<String, Integer> map = new HashMap<>();
        map.put("permits", authService.extractPermissionForEndpoint(authHeader, urlRequestDTO));

        return ResponseEntity.status(200).body(map);
    }

    // Retorno de Rol Asociado al Token Enviado //
    @PostMapping(value = "/role", produces = "application/json")
    public ResponseEntity<Map<Long, String>> getRoleAssociatedToToken(@RequestHeader("Authorization") String authHeader) {
        return ResponseEntity.status(200).body(authService.getRoleAssociatedToToken(authHeader));
    }


}
