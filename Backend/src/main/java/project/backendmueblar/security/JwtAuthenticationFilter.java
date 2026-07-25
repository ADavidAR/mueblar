package project.backendmueblar.security;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.filter.OncePerRequestFilter;
import project.backendmueblar.modules.auth.services.JwtService;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtService jwtService;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain )
            throws ServletException, IOException {
        final String authHeader = request.getHeader("Authorization");

        String urlRequested =  request.getRequestURI();
        String httpMethod = request.getMethod().toUpperCase();

        // Arreglo donde se encuentran todas las APIS que hacen uso del Token, pero no son propias del Role en cuestion //
        List<String> apisWithBearerForAllRoles = new ArrayList<>();
        apisWithBearerForAllRoles.add("/api/auth/permits");
        apisWithBearerForAllRoles.add("/api/collections");
        apisWithBearerForAllRoles.add("/api/collections/{id_collections}");
        apisWithBearerForAllRoles.add("/api/collections/{id_collections}/products/{model}");
        apisWithBearerForAllRoles.add("/api/products/token");

        if(authHeader != null && authHeader.startsWith("Bearer ")) {
            String userEmail = jwtService.extractEmail(authHeader);

            for (String apisNotInsideInToken :  apisWithBearerForAllRoles) {
                if (pathMatcher.match(apisNotInsideInToken, urlRequested)) {
                    if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                        if (jwtService.validateJWTIntegrity(authHeader.substring(7))) {
                            UsernamePasswordAuthenticationToken contextAuthenticationToken = new UsernamePasswordAuthenticationToken(userEmail, null, List.of());
                            SecurityContextHolder.getContext().setAuthentication(contextAuthenticationToken);
                            filterChain.doFilter(request, response);
                            return;
                        }
                    }
                }
            }

            Map<String, Integer> endpointPatternPermissionMap = jwtService.extractEndpointAndPermission(authHeader.substring(7), urlRequested);
            System.out.println(endpointPatternPermissionMap);
            if (endpointPatternPermissionMap != null) {
                if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                    if (!urlHasEnoughPermissionsAPI(endpointPatternPermissionMap, httpMethod)) {
                        response.sendError(HttpServletResponse.SC_FORBIDDEN, "Acceso denegado: No tienes los permisos necesarios para esta acción.");
                        return;
                    }
                    if (jwtService.validateJWTIntegrity(authHeader.substring(7))) {
                        UsernamePasswordAuthenticationToken contextAuthenticationToken = new UsernamePasswordAuthenticationToken(userEmail, null, List.of());
                        SecurityContextHolder.getContext().setAuthentication(contextAuthenticationToken);
                    }
                }
            }
        }
        filterChain.doFilter(request, response);
    }

    private boolean urlHasEnoughPermissionsAPI(Map<String, Integer> endpointPermissionMap, String httpMethod) {
        Integer permissionsInBits = endpointPermissionMap.values().stream().findFirst().orElse(null);

        if(permissionsInBits == null) return false;

        int requiredBit = switch (httpMethod) {
            case "GET" -> 8;
            case "POST" -> 4;
            case "DELETE" -> 2;
            case "PUT" -> 1;
            default -> 0;
        };
        return (permissionsInBits & requiredBit) == requiredBit;
    }

}