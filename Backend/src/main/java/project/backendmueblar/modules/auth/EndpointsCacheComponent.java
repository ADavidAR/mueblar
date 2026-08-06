package project.backendmueblar.modules.auth;

import jakarta.annotation.PostConstruct;
import jakarta.transaction.Transactional;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;
import project.backendmueblar.modules.users.entities.ModuleEntity;
import project.backendmueblar.modules.users.entities.PermissionEntity;
import project.backendmueblar.modules.users.repositories.RepositoryModule;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Getter
@Setter
@Component
@RequiredArgsConstructor
public class EndpointsCacheComponent {

    private final RepositoryModule repositoryModule;

    private final Map<Long, List<String>> allEndpointsMap = new ConcurrentHashMap<>();
    private final Map<String, List<String>> allEndpointsMapWithToken = new ConcurrentHashMap<>();

    @Transactional
    @EventListener(ApplicationReadyEvent.class)

    // Metodo de Servicio : Recuperacion de Todos los Modulos del Sistema ; Almacenamiento en Cache del Servidor (Evitar Consultas Constantes a la Base de Datos //
    public void initCache() {
        List<ModuleEntity> moduleEntityList = repositoryModule.findAll();

        loadEndpointsFromDB(moduleEntityList);
        loadEndpointsWithToken();
    }

    // Metodo de Servcio : Carga de Todos los Endpoints (API y Vista) asociados a cada Modulo del Sistema ; Almacenamiento en Cache del Servidor (Evitar Consultas Constantes a la Base de Datos) //
    private void loadEndpointsFromDB(List<ModuleEntity> moduleEntityList) {
        for(ModuleEntity thisModuleEntity : moduleEntityList) {
            List<String> endpointsForModuleEntity = new ArrayList<>();
            Long moduleId = thisModuleEntity.getModuleId();

            List<PermissionEntity> permissionEntityList = thisModuleEntity.getPermissionEntityList();
            for(PermissionEntity permissionEntity : permissionEntityList) {
                endpointsForModuleEntity.add(permissionEntity.getEndpointUrl().trim());
            }
            allEndpointsMap.put(moduleId, endpointsForModuleEntity);
        }
    }

    // Metodo de Servicio : Carga de Endpoints que Necesiten Token JWT para su Uso pero no se encuentren Asociado a un Modulo X Rol Especifico //
    private void loadEndpointsWithToken() {
        List<String> endpointsForModuleEntity = new ArrayList<>();

        endpointsForModuleEntity.add("/api/products/token");
        endpointsForModuleEntity.add("/api/products/{model}/token");
        endpointsForModuleEntity.add("/api/collections");
        endpointsForModuleEntity.add("/api/collections/{id_collections}");
        endpointsForModuleEntity.add("/api/collections/{id_collections}/products/{model}");
        endpointsForModuleEntity.add("/api/auth/role");
        endpointsForModuleEntity.add("/api/profile");
        endpointsForModuleEntity.add("/api/auth/permits");

        allEndpointsMapWithToken.put("ApisWithToken", endpointsForModuleEntity);
    }

}