package project.backendmueblar.modules.auth.services;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import org.springframework.util.AntPathMatcher;
import project.backendmueblar.exception.auth.EmailNotFoundException;
import project.backendmueblar.exception.auth.NotPatternURLFoundTokenException;
import project.backendmueblar.exception.auth.TokenJWTExpiredException;
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

    public String extractEmail(String authHeader) {
        String token = authHeader.substring(7);
        Claims claims;
        try {
            claims = Jwts.parser().verifyWith(getSecretKey()).build().parseSignedClaims(token).getPayload();
        } catch (ExpiredJwtException e) {
            throw new TokenJWTExpiredException("Token is Expired. Not Valid");
        } catch (Exception e) {
            throw new RuntimeException("Could not verify JWT token integrity!");
        }

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
