package project.backendmueblar.modules.catalog.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.backendmueblar.modules.catalog.dtos.request.AttributeCreateRequestDTO;
import project.backendmueblar.modules.catalog.dtos.response.AttributeResponseDTO;
import project.backendmueblar.modules.catalog.dtos.response.Attribute_X_VariationSummaryResponseDTO;
import project.backendmueblar.modules.catalog.services.AttributeService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class RestControllerAttributes {

    private final AttributeService attributeService;

    @PostMapping(value = "/attribute", consumes = "application/json")
    public ResponseEntity<?> createAttribute(@RequestHeader("Authorization") String authHeader, @Valid @RequestBody AttributeCreateRequestDTO attributeCreateRequestDTO) {
        attributeService.createAttribute(authHeader, attributeCreateRequestDTO);
        return ResponseEntity.status(201).build();
    }

    @PutMapping(value = "/attributes/{id_atributo}", consumes = "application/json")
    public ResponseEntity<?> updateAttribute(@RequestHeader("Authorization") String authHeader, @PathVariable ("id_atributo") String attributeId, @Valid @RequestBody AttributeCreateRequestDTO attributeUpdateRequestDTO){
        attributeService.updateAttribute(authHeader, attributeId, attributeUpdateRequestDTO);
        return ResponseEntity.status(200).build();
    }

    @DeleteMapping(value = "/attributes/{id_atributo}")
    public ResponseEntity<?> deleteAttribute(@RequestHeader("Authorization") String authHeader, @PathVariable ("id_atributo") String attributeId){
        attributeService.deleteAttribute(authHeader, attributeId);
        return ResponseEntity.status(204).build();
    }

    @GetMapping(value = "/attributes/variations", produces = "application/json")
    public ResponseEntity<?> getAttributesWithVariationsByQuery(
            @RequestParam(defaultValue = "10") Integer limit,
            @RequestParam(defaultValue = "0") Integer page
    ){
        Map<String, List<Attribute_X_VariationSummaryResponseDTO>> mapOfAttribute_X_Variation = attributeService.getAllAttributesWithVariations(limit, page);
        return ResponseEntity.status(200).body(mapOfAttribute_X_Variation);
    }

    @GetMapping(value = "/attributes", produces = "application/json")
    public ResponseEntity<?> getAttributesByQuery(
            @RequestParam(defaultValue = "10") Integer limit,
            @RequestParam(defaultValue = "0") Integer page
    ){
        List<AttributeResponseDTO> attributeResponseDTOList = attributeService.getAllAttributes(limit, page);
        return ResponseEntity.status(200).body(attributeResponseDTOList);
    }


}
