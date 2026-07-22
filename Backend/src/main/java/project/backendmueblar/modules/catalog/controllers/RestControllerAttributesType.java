package project.backendmueblar.modules.catalog.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.backendmueblar.modules.catalog.dtos.request.AttributeTypeCreateRequestDTO;
import project.backendmueblar.modules.catalog.dtos.response.AttributeTypeResponseDTO;
import project.backendmueblar.modules.catalog.services.AttributeTypeService;

import java.util.List;

@RestController
@RequestMapping("/api/attribute-types")
@RequiredArgsConstructor
public class RestControllerAttributesType {

    private final AttributeTypeService attributeTypeService;

    @GetMapping(value = "/{id_tipo_atributo}", produces = "application/json")
    public ResponseEntity<AttributeTypeResponseDTO> getSpecificAttributeType(@PathVariable ("id_tipo_atributo") String attributeTypeId) {
        AttributeTypeResponseDTO attributeTypeResponseDTO = attributeTypeService.getSpecificAttributeType(attributeTypeId);
        return ResponseEntity.status(200).body(attributeTypeResponseDTO);
    }

    @PostMapping(consumes = "application/json")
    public ResponseEntity<?> createAttributeType(@Valid @RequestBody AttributeTypeCreateRequestDTO attributeTypeCreateDTO) {
        attributeTypeService.createAttributeType(attributeTypeCreateDTO);
        return ResponseEntity.status(201).build();
    }

    @DeleteMapping(value = "/{id_tipo_atributo}")
    public ResponseEntity<?> deleteAttributeType(@PathVariable("id_tipo_atributo") String attributeTypeId){
        attributeTypeService.deleteAttributeType(attributeTypeId);
        return ResponseEntity.status(204).build();
    }

    @PutMapping(value = "/{id_tipo_atributo}", consumes = "application/json")
    public ResponseEntity<?> updateAttributeType(@PathVariable("id_tipo_atributo") String attributeTypeId, @Valid @RequestBody AttributeTypeCreateRequestDTO attributeTypeUpdateDTO) {
        attributeTypeService.updateAttributeType(attributeTypeId, attributeTypeUpdateDTO);
        return ResponseEntity.status(200).build();
    }

    @GetMapping(produces = "application/json")
    public ResponseEntity<List<AttributeTypeResponseDTO>> getAllAttributeTypes(@RequestParam(defaultValue = "10") Integer limit,
                                                                               @RequestParam(defaultValue = "0") Integer page
    ){
        List<AttributeTypeResponseDTO> attributeTypeResponseDTOList = attributeTypeService.getAllAttributesTypes(limit, page);
        return ResponseEntity.status(200).body(attributeTypeResponseDTOList);
    }
}
