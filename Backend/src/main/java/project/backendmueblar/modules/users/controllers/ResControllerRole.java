package project.backendmueblar.modules.users.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.backendmueblar.modules.users.dtos.request.RoleCreateRequestDTO;
import project.backendmueblar.modules.users.dtos.response.RoleResponseDTO;
import project.backendmueblar.modules.users.services.RoleService;

import java.util.List;

@RestController
@RequestMapping("/api/roles")
@RequiredArgsConstructor
public class ResControllerRole {
    private final RoleService roleService;

    @GetMapping(value = "/{id}", produces = "application/json")
    public ResponseEntity<RoleResponseDTO> getSpecificRole(@PathVariable("id") Long roleId){
        return ResponseEntity.status(200).body(roleService.getSpecificRole(roleId));
    }

    @GetMapping(produces = "application/json")
    public ResponseEntity<List<RoleResponseDTO>> getAllRoles(@RequestParam(defaultValue = "10") Integer limit,
                                                             @RequestParam(defaultValue = "0") Integer page,
                                                             @RequestParam(required = false) String search
    ){
        return ResponseEntity.status(200).body(roleService.getAllRoles(limit, page, search));
    }

    @PostMapping(consumes = "application/json")
    public ResponseEntity<?> createRole(@Valid @RequestBody RoleCreateRequestDTO roleCreateRequestDTO){
        roleService.createRole(roleCreateRequestDTO);
        return ResponseEntity.status(201).build();
    }

    @PutMapping(value = "/{id}", consumes = "application/json")
    public ResponseEntity<?> updateRole(@PathVariable("id") Long roleId,
                                        @Valid @RequestBody RoleCreateRequestDTO roleUpdateRequestDTO
    ){
        roleService.updateRole(roleId, roleUpdateRequestDTO);
        return ResponseEntity.status(200).build();
    }
}
