package project.backendmueblar.modules.users.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.backendmueblar.modules.users.dtos.response.UserProfileSummaryResponseDTO;
import project.backendmueblar.modules.users.services.ProfileService;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
public class RestControllerProfile {

    private final ProfileService profileService;

    @GetMapping(produces = "application/json")
    public ResponseEntity<UserProfileSummaryResponseDTO> getProfile(@RequestHeader("Authorization") String authHeader){
        return ResponseEntity.status(200).body(profileService.getProfileSpecificForUser(authHeader));
    }
}
