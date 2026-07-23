package project.backendmueblar.modules.catalog.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.backendmueblar.modules.catalog.dtos.request.ProductCreateRequestDTO;
import project.backendmueblar.modules.catalog.dtos.response.ProductResponseDTO;
import project.backendmueblar.modules.catalog.dtos.response.VariationResponseDTO;
import project.backendmueblar.modules.catalog.services.CatalogService;

import java.util.List;

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
    public ResponseEntity<?> createProduct(@Valid @RequestBody ProductCreateRequestDTO productCreateDTO) {
        catalogService.createProductAndVariations(productCreateDTO);
        return ResponseEntity.status(201).build();
    }

    @PutMapping(value = "/{model}", consumes = "application/json")
    public ResponseEntity<?> updateProduct(@PathVariable("model") String modelOfProduct, @Valid @RequestBody ProductCreateRequestDTO productUpdateDTO) {
        catalogService.updateProductAndVariations(modelOfProduct, productUpdateDTO);
        return ResponseEntity.status(200).build();
    }

    @DeleteMapping(value = "/{model}")
    public ResponseEntity<?> deleteProduct(@PathVariable("model") String modelOfProduct){
        catalogService.deleteProductCascade(modelOfProduct);
        return ResponseEntity.status(204).build();
    }

    @GetMapping(value = "/{model}/variations/{sku}", produces = "application/json")
    public ResponseEntity<VariationResponseDTO> getVariation(@PathVariable("sku") String skuOfVariation) {
        VariationResponseDTO variationResponseDTO = catalogService.getSpecificVariation(skuOfVariation);
        return ResponseEntity.status(200).body(variationResponseDTO);
    }

    @GetMapping(produces = "application/json")
    public ResponseEntity<List<ProductResponseDTO>> getAllProductsSimple(@RequestParam(defaultValue = "10") Integer limit,
                                                                         @RequestParam(defaultValue = "0") Integer page,
                                                                         @RequestParam(required = false) List<String> categories,
                                                                         @RequestParam(required = false) String search,
                                                                         @RequestParam(required = false) List<String> materials
    ){
        List<ProductResponseDTO> productResponseDTOList = catalogService.getAllProducts(limit, page, categories, search, materials);
        return ResponseEntity.status(200).body(productResponseDTOList);
    }

    @GetMapping(value = "/token", produces = "application/json")
    public ResponseEntity<List<ProductResponseDTO>> getAllProductsToken(@RequestHeader("Authorization") String authHeader,
                                                                        @RequestParam(defaultValue = "10") Integer limit,
                                                                        @RequestParam(defaultValue = "0") Integer page,
                                                                        @RequestParam(required = false) List<String> categories,
                                                                        @RequestParam(required = false) String search,
                                                                        @RequestParam(required = false) List<String> materials
    ){
        List<ProductResponseDTO> productResponseList = catalogService.getAllProducts(authHeader, limit, page, categories, search, materials);
        return ResponseEntity.status(200).body(productResponseList);
    }
}
