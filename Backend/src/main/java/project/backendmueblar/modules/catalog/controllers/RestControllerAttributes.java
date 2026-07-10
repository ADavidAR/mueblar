package project.backendmueblar.modules.catalog.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
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

    @PutMapping(value = "/attributes/{id_atributo}", consumes = "application/json")
    public ResponseEntity<?> updateAttribute(@PathVariable ("id_atributo") String attributeId, @Valid @RequestBody AttributeCreateRequestDTO attributeUpdateRequestDTO){
        attributeService.updateAttribute(attributeId, attributeUpdateRequestDTO);
        return ResponseEntity.status(200).build();
    }

}
