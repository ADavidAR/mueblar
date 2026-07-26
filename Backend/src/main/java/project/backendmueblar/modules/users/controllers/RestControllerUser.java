package project.backendmueblar.modules.users.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import project.backendmueblar.modules.users.dtos.response.UserSummaryResponseDTO;
import project.backendmueblar.modules.users.services.ServiceUser;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class RestControllerUser {

    private final ServiceUser userService;

    @GetMapping(value = "/{id}", produces = "application/json")
    public ResponseEntity<UserSummaryResponseDTO> getUserSpecific(@PathVariable("id") Long userId) {
        return ResponseEntity.status(200).body(userService.getUserSpecific(userId));
    }
}
