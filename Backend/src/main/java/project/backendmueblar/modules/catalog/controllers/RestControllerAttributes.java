package project.backendmueblar.modules.catalog.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import project.backendmueblar.modules.catalog.dtos.request.AttributeCreateRequestDTO;
import project.backendmueblar.modules.catalog.services.AttributeService;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RestControllerAttributes {

    private final AttributeService attributeService;

    @PostMapping(value = "/attribute", consumes = "application/json")
    public ResponseEntity<?> createAttribute(@Valid @RequestBody AttributeCreateRequestDTO attributeCreateRequestDTO) {
        attributeService.createAttribute(attributeCreateRequestDTO);
        return ResponseEntity.status(201).build();
    }
}
