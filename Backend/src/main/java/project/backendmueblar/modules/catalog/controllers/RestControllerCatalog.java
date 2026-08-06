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
    // Creacion de Producto en el Sistema (y sus Variaciones Asociadas) (Uso de DTOs) //
    @PostMapping(consumes = "application/json")
    public ResponseEntity<?> createProduct(@RequestHeader("Authorization") String authHeader, @Valid @RequestBody ProductCreateRequestDTO productCreateDTO) {
        catalogService.createProductAndVariations(authHeader, productCreateDTO);
        return ResponseEntity.status(201).build();
    }

    // Modificacion de Producto en el Sistema (y sus Variaciones Asociadas) (Uso de DTOs) //
    @PutMapping(value = "/{model}", consumes = "application/json")
    public ResponseEntity<?> updateProduct(@RequestHeader("Authorization") String authHeader, @PathVariable("model") String modelOfProduct, @Valid @RequestBody ProductCreateRequestDTO productUpdateDTO) {
        catalogService.updateProductAndVariations(authHeader, modelOfProduct, productUpdateDTO);
        return ResponseEntity.status(200).build();
    }

    // Eliminacion de Producto Especifico (Modelo Especifico) en el Sistema //
    @DeleteMapping(value = "/{model}")
    public ResponseEntity<?> deleteProduct(@RequestHeader("Authorization") String authHeader, @PathVariable("model") String modelOfProduct){
        catalogService.deleteProductCascade(authHeader, modelOfProduct);
        return ResponseEntity.status(204).build();
    }

    // Obtencion de Variacion Especifico (Sku Especifico) dado un Producto Especifico (Model Especifico) //
    @GetMapping(value = "/{model}/variations/{sku}", produces = "application/json")
    public ResponseEntity<VariationResponseDTO> getVariation(@PathVariable("sku") String skuOfVariation) {
        VariationResponseDTO variationResponseDTO = catalogService.getSpecificVariation(skuOfVariation);
        return ResponseEntity.status(200).body(variationResponseDTO);
    }

    // Obtencion de Productos con Sus Variaciones sin Necesitar Token Usuario JWT //
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

    // Obtencion de Productos con Sus Variaciones Necesitando Token Usuario JWT //
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

    // Obtencion de Producto Especifico (Modelo Especifico) en el Sistema dado un Token JWT//
    @GetMapping(value = "/{model}/token", produces = "application/json")
    public ResponseEntity<ProductResponseDTO> getSpecificProductToken(@RequestHeader("Authorization") String authHeader, @PathVariable("model") String modelOfProduct, @RequestParam(required = false) boolean simpleVariation){
        ProductResponseDTO specificProduct = catalogService.getSpecificProduct(authHeader, modelOfProduct, simpleVariation);
        return ResponseEntity.status(200).body(specificProduct);
    }

    // Obtencion de Producto Especifico (Modelo Especifico) en el Sistema //
    @GetMapping(value = "/{model}", produces = "application/json")
    public ResponseEntity<ProductResponseDTO> getSpecificProduct(@PathVariable("model") String modelOfProduct, @RequestParam(required = false) boolean simpleVariation) {
        ProductResponseDTO specificProduct = catalogService.getSpecificProduct(modelOfProduct, simpleVariation);
        return ResponseEntity.status(200).body(specificProduct);
    }
}
