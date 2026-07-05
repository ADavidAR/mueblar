package project.backendmueblar.modules.catalog.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.backendmueblar.modules.catalog.dtos.request.ProductCreateRequestDTO;
import project.backendmueblar.modules.catalog.dtos.response.ProductResponseDTO;
import project.backendmueblar.modules.catalog.services.CatalogService;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
public class RestControllerCatalog {

    private final CatalogService catalogService;

    @GetMapping(value = "/{model}", produces = "application/json")
    public ResponseEntity<?> getSpecificProduct(@PathVariable("model") String modelOfProduct, @RequestParam(required = false) boolean simpleVariation) {
        ProductResponseDTO specificProduct = catalogService.getSpecificProduct(modelOfProduct, simpleVariation);
        return ResponseEntity.status(200).body(specificProduct);
    }

    @PostMapping(consumes = "application/json")
    public ResponseEntity<?> createProduct(
            @Valid @RequestBody ProductCreateRequestDTO productCreateDTO) {
        catalogService.createProductAndVariations(productCreateDTO);
        return ResponseEntity.status(201).build();
    }

    @PutMapping(value = "/{model}", consumes = "application/json")
    public ResponseEntity<?> updateProduct(@PathVariable("model") String modelOfProduct, @Valid @RequestBody ProductCreateRequestDTO productUpdateDTO) {
        catalogService.updateProductAndVariations(productUpdateDTO, modelOfProduct);
        return ResponseEntity.status(200).build();
    }
}
