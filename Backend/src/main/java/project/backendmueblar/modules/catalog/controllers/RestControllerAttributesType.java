package project.backendmueblar.modules.catalog.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import project.backendmueblar.modules.catalog.dtos.response.AttributeTypeResponseDTO;
import project.backendmueblar.modules.catalog.services.AttributeTypeService;

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

}
