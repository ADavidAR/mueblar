package project.backendmueblar.modules.auth.services;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import org.springframework.util.AntPathMatcher;
import project.backendmueblar.exception.auth.EmailNotFoundException;
import project.backendmueblar.exception.auth.NotPatternURLFoundTokenException;
import project.backendmueblar.exception.auth.ViolatedJWTIntegrity;
import project.backendmueblar.modules.users.entities.UserEntity;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {
    @Value("${security.jwt.secret-key}")
    private String secretKey;

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    public String generateToken(UserEntity  userEntity, Map<String, Integer> endpoints, Long expirationTime) {
        return Jwts.builder()
                .id(userEntity.getUserId().toString())
                .claims(Map.of("roleId", userEntity.getRoleEntity().getRoleId()))
                .claim("permissions", endpoints)
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

        if(claims.getSubject() == null) {
            throw new EmailNotFoundException("User with Specified Email not Exists");
        }

        return claims.getSubject();

    }

    private String extractPatternEndpointAndPermission(String token, String endpointURI) {
        Claims claims = Jwts.parser().verifyWith(getSecretKey()).build().parseSignedClaims(token).getPayload();

        Map<String, Integer> completeMap = claims.get("permissions", Map.class);
        for(String patternAllowed : completeMap.keySet()) {
            if(pathMatcher.match(patternAllowed, endpointURI)){
                return patternAllowed;
            }
        }
        return null;
    }

    // Se retornara un Mapa en caso de que se necesite posteriormente
    public Map<String, Integer> extractEndpointAndPermission(String token, String endpointURI) {

        // Private Method
        validateJWTIntegrity(token);

        String possibleEndpoint = extractPatternEndpointAndPermission(token, endpointURI);
        if(possibleEndpoint == null) {
            throw new NotPatternURLFoundTokenException("Not exist an Pattern for that endpoint in that token");
        }

        Claims claims = Jwts.parser().verifyWith(getSecretKey()).build().parseSignedClaims(token).getPayload();
        Map<String, Integer> completeMap = claims.get("permissions", Map.class);

        for (String endpoint : completeMap.keySet()) {
            if (pathMatcher.match(possibleEndpoint, endpoint)) {
                Map<String, Integer> endpointAndPermissionMap = new HashMap<>();
                endpointAndPermissionMap.put(possibleEndpoint, completeMap.get(endpoint));

                return endpointAndPermissionMap;
            }
        }

        throw new NotPatternURLFoundTokenException("Not exist an Pattern for that endpoint in that token");
    }
}
