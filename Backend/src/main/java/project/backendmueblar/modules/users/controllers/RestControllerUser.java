package project.backendmueblar.modules.users.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.backendmueblar.modules.users.dtos.response.UserSummaryResponseDTO;
import project.backendmueblar.modules.users.services.ServiceUser;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class RestControllerUser {

    private final ServiceUser userService;

    @GetMapping(value = "/{id}", produces = "application/json")
    public ResponseEntity<UserSummaryResponseDTO> getUserSpecific(@PathVariable("id") Long userId) {
        return ResponseEntity.status(200).body(userService.getUserSpecific(userId));
    }

    @GetMapping(produces = "application/json")
    public ResponseEntity<List<UserSummaryResponseDTO>> getAllUsers(@RequestParam(defaultValue = "10") Integer limit,
                                                                    @RequestParam(defaultValue = "0") Integer page,
                                                                    @RequestParam(required = false) String email,
                                                                    @RequestParam(required = false) String firstName,
                                                                    @RequestParam(required = false) String lastName
    ) {
        return ResponseEntity.status(200).body(userService.getAllUsers(limit, page, email, firstName, lastName));
    }
}
