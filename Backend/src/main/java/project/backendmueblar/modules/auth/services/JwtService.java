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
import project.backendmueblar.modules.users.entities.UserEntity;
import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class JwtService {
    @Value("${security.jwt.secret-key}")
    private String secretKey;

    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    public String generateToken(UserEntity userEntity, Map<Long, Integer> modules, Long expirationTime) {
        return Jwts.builder()
                .id(userEntity.getUserId().toString())
                .claims(Map.of("roleId", userEntity.getRoleEntity().getRoleId()))
                .claim("modules", modules)
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

    private String extractPatternEndpointAndPermission(String token, String endpointURI, Map<Long,List<String>> allEndpointsMapCache) {
        Claims claims = Jwts.parser().verifyWith(getSecretKey()).build().parseSignedClaims(token).getPayload();

        Map<String, Integer> completeMapFromToken = claims.get("modules", Map.class);

        for(String moduleIdString : completeMapFromToken.keySet()) {
            Long moduleId = Long.valueOf(moduleIdString);
            if(allEndpointsMapCache.containsKey(moduleId)) {
                List<String> allEndpointsForModule = allEndpointsMapCache.get(moduleId);

                System.out.println(allEndpointsForModule);

                for(String endpoint : allEndpointsForModule) {
                    if(pathMatcher.match(endpoint, endpointURI.trim())) {
                        return endpoint;
                    }
                }
            }
        }
        return null;
    }

    public Map<String, Integer> extractEndpointAndPermissionMap(String token, String endpointURI, Map<Long,List<String>> allEndpointsMapCache) {
        // Private Method
        String possibleEndpoint = extractPatternEndpointAndPermission(token, endpointURI, allEndpointsMapCache);
        if(possibleEndpoint == null) {
            throw new NotPatternURLFoundTokenException("Not exist an Pattern for that endpoint in that token");
        }

        Claims claims = Jwts.parser().verifyWith(getSecretKey()).build().parseSignedClaims(token).getPayload();
        Map<String, Integer> completeMapFromToken = claims.get("modules", Map.class);

        for (String moduleIdString : completeMapFromToken.keySet()) {
            Long moduleId = Long.valueOf(moduleIdString);
            if(allEndpointsMapCache.containsKey(moduleId)) {
                List<String> allEndpointsForModule = allEndpointsMapCache.get(moduleId);
                for(String endpoint : allEndpointsForModule) {
                    if(pathMatcher.match(possibleEndpoint, endpoint)) {
                        Map<String, Integer> endpointAndPermissionAssociatedMap = new HashMap<>();
                        endpointAndPermissionAssociatedMap.put(possibleEndpoint, completeMapFromToken.get(moduleIdString));
                        return endpointAndPermissionAssociatedMap;
                    }
                }
            }
        }

        throw new NotPatternURLFoundTokenException("Not exist an Pattern in the MAP for that endpoint in that token");
    }
}
