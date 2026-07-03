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

    @PostMapping(value = "/register", consumes = "application/json")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserCreateDTO userCreateDTO) {
        authService.registerUser(userCreateDTO);

        return ResponseEntity.status(201).body("User registered successfully");
    }

    @PostMapping(value = "/login", consumes = "application/json")
    public ResponseEntity<Map<String, String>> authenticationUser(@Valid @RequestBody UserAuthDTO userAuthDTO) {
        String tokenJWT = authService.authenticationUser(userAuthDTO, expirationTime);

        Map<String, String> mapJWT = new HashMap<>();
        mapJWT.put("token", tokenJWT);

        return ResponseEntity.status(200).body(mapJWT);
    }

    @PostMapping(value = "/mobile/login", consumes = "application/json")
    public ResponseEntity<Map<String, String>> authenticationUserApp(@Valid @RequestBody UserAuthDTO userAuthDTO) {
        String tokenJWT = authService.authenticationUser(userAuthDTO, expirationTimeApp);

        Map<String, String> mapJWT = new HashMap<>();
        mapJWT.put("token", tokenJWT);

        return ResponseEntity.status(200).body(mapJWT);
    }

    @PostMapping(value = "/recovery-email", consumes = "application/json")
    public ResponseEntity<?> recoveryEmailAndGenerateToken(@Valid @RequestBody EmailAuthDTO emailAuthDTO) {
        authService.recoveryEmailAndGenerateToken(emailAuthDTO);
        return ResponseEntity.status(200).body("Message (Email) sent successfully");
    }

    @PostMapping(value = "/reset-password", consumes = "application/json")
    public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordDTO resetPasswordDTO) {
        authService.resetPassword(resetPasswordDTO);
        return ResponseEntity.status(200).body("Password reset successfully");
    }

    @GetMapping(value = "/token-verification/{token}")
    public ResponseEntity<?> getTokenVerification(@PathVariable("token") String verificationToken) {
        authService.validateToken(verificationToken);
        return ResponseEntity.status(200).build();
    }

    @PostMapping(value = "/permits", consumes = "application/json")
    public ResponseEntity<Map<String, Integer>> getPermissionsFromEndpoint(
            @RequestHeader("Authorization") String authHeader,
            @Valid @RequestBody UrlDTO urlDTO) {
        Map<String, Integer> map = new HashMap<>();

        System.out.println(urlDTO.getUrl());

        map.put("permits", authService.extractEndpointAndPermission(authHeader, urlDTO).get(urlDTO.getUrl()));

        return ResponseEntity.status(200).body(map);
    }

}
