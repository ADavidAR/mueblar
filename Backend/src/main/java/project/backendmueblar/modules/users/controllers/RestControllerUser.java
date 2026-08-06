package project.backendmueblar.modules.users.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.apache.catalina.User;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.backendmueblar.modules.auth.dtos.UserCreateRequestDTO;
import project.backendmueblar.modules.auth.dtos.UserUpdateRequestDTO;
import project.backendmueblar.modules.users.dtos.response.UserSummaryResponseDTO;
import project.backendmueblar.modules.users.services.ServiceUser;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class RestControllerUser {

    private final ServiceUser userService;

    // Obtencion de Usuario No Cliente Especifico dentro del Sistema //
    @GetMapping(value = "/{id}", produces = "application/json")
    public ResponseEntity<UserSummaryResponseDTO> getUserSpecific(@PathVariable("id") Long userId) {
        return ResponseEntity.status(200).body(userService.getUserSpecific(userId));
    }

    // Obtencion de Todos los Usuarios No Clientes Existentes en el Sistema mediante el Uso de Busqueda Filtrada //
    @GetMapping(produces = "application/json")
    public ResponseEntity<List<UserSummaryResponseDTO>> getAllUsers(@RequestParam(defaultValue = "10") Integer limit,
                                                                    @RequestParam(defaultValue = "0") Integer page,
                                                                    @RequestParam(required = false) String email,
                                                                    @RequestParam(required = false) String name
    ) {
        return ResponseEntity.status(200).body(userService.getAllUsers(limit, page, email, name));
    }

    // Creacion de Usuario No Cliente Especifico dentro del Sistema //
    @PostMapping(consumes = "application/json")
    public ResponseEntity<?> createUser(@RequestHeader("Authorization") String authHeader, @Valid @RequestBody UserCreateRequestDTO userCreateRequestDTO){
        userService.createUser(authHeader, userCreateRequestDTO);
        return ResponseEntity.status(201).build();
    }

    // Modificacion de Usuario No Cliente Especifico dentro del Sistema //
    @PutMapping(value = "/{id}", consumes = "application/json")
    public ResponseEntity<?> updateUser(@RequestHeader("Authorization") String authHeader,
                                        @PathVariable("id") Long userId,
                                        @Valid @RequestBody UserUpdateRequestDTO userUpdateRequestDTO
    ){
        userService.updateUser(authHeader, userId, userUpdateRequestDTO);
        return ResponseEntity.status(200).build();
    }

    // Eliminacion de Usuario No Cliente Especifico dentro del Sistema //
    @DeleteMapping(value = "/{id}")
    public ResponseEntity<?> deleteUser(@RequestHeader("Authorization") String authHeader,
                                        @PathVariable("id") Long userId) {
        userService.deleteUser(authHeader, userId);
        return ResponseEntity.status(204).build();
    }
}
