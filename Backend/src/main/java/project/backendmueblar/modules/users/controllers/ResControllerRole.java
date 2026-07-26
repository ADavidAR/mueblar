package project.backendmueblar.modules.users.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import project.backendmueblar.modules.users.dtos.response.RoleResponseDTO;
import project.backendmueblar.modules.users.services.RoleService;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class ResControllerRole {
    private final RoleService roleService;

    @GetMapping(value = "/{id}")
    public ResponseEntity<RoleResponseDTO> getSpecificRole(@PathVariable("id") Long roleId){
        return ResponseEntity.status(200).body(roleService.getSpecificRole(roleId));
    }
}
