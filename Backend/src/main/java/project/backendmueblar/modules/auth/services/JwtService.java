package project.backendmueblar.modules.auth.services;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import project.backendmueblar.exception.EndpointNotExistForUser;
import project.backendmueblar.exception.ViolatedJWTIntegrity;
import project.backendmueblar.modules.users.entities.UserEntity;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {
    @Value("${security.jwt.secret-key}")
    private String secretKey;

    public String generateToken(UserEntity  userEntity, Map<String, Integer> endpoints, Long expirationTime) {
        return Jwts.builder()
                .id(userEntity.getUserId().toString())
                .claims(Map.of("roleId", userEntity.getRoleEntity().getRoleId()))
                .claims(endpoints)
                .subject(userEntity.getEmail())
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expirationTime))
                        .signWith(getSecretKey())
                        .compact();
    }

    private SecretKey getSecretKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public boolean validateJWTIntegrity(String token) {
         try {
            Jwts.parser().verifyWith(getSecretKey()).build().parseSignedClaims(token);
             return true;
        } catch (Exception e) {
            throw new ViolatedJWTIntegrity("Could not verify JWT token integrity!", e);
        }
    }

    public String extractEmail(String authHeader) {
        String token = authHeader.substring(7);
        Claims claims = Jwts.parser().verifyWith(getSecretKey()).build().parseSignedClaims(token).getPayload();
        return claims.getSubject();
    }

    // Se retornara un Mapa en caso de que se necesite posteriormente
    public Map<String, Integer> extractEndpointAndPermission(String token, String endpoint) {

        // Private Method
        validateJWTIntegrity(token);

        Claims claims = Jwts.parser().verifyWith(getSecretKey()).build().parseSignedClaims(token).getPayload();
        Integer specificPermissionInteger = claims.get(String.format("%s", endpoint), Integer.class);

        Map<String, Integer> endpointAndPermissionMap = new HashMap<>();
        endpointAndPermissionMap.put(endpoint, specificPermissionInteger);

        return endpointAndPermissionMap;
    }
}
