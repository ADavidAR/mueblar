package project.backendmueblar.modules.interactions.controllers;


import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.backendmueblar.modules.catalog.dtos.ProductSummaryDTO;
import project.backendmueblar.modules.interactions.dtos.request.CollectionCreateRequestDTO;
import project.backendmueblar.modules.interactions.services.CollectionService;

@RestController
@RequestMapping("/api/collections")
@RequiredArgsConstructor
public class RestControllerCollection {
    private final CollectionService collectionService;

    @PostMapping(consumes = "application/json")
    public ResponseEntity<?> createCollection(@RequestHeader("Authorization") String authHeader, @Valid @RequestBody CollectionCreateRequestDTO collectionCreateRequestDTO) {
        collectionService.createCollection(collectionCreateRequestDTO, authHeader);
        return ResponseEntity.status(201).build();
    }

    @PutMapping(value = "/{id_collections}", consumes = "application/json")
    public ResponseEntity<?> updateCollectionName(@RequestHeader("Authorization") String authHeader,
                                                  @PathVariable ("id_collections") Long collectionId,
                                                  @Valid @RequestBody CollectionCreateRequestDTO collectionUpdateRequestDTO
    ) {
        collectionService.updateCollectionName(collectionId, collectionUpdateRequestDTO, authHeader);
        return ResponseEntity.status(200).build();
    }

    @DeleteMapping(value = "/{id_collections}")
    public ResponseEntity<?> deleteCollectionAndLogs(@RequestHeader("Authorization") String authHeader,
                                                     @PathVariable ("id_collections") Long collectionId
    ) {
        collectionService.deleteCollectionAndLogs(collectionId, authHeader);
        return ResponseEntity.status(204).build();
    }

    @PostMapping(value = "/{id_collections}")
    public ResponseEntity<?> addProductsToCollection(@RequestHeader("Authorization") String authHeader,
                                                     @PathVariable("id_collections") Long collectionId,
                                                     @Valid @RequestBody ProductSummaryDTO productSummaryDTO
    ){
        collectionService.addProductToCollection(collectionId, authHeader, productSummaryDTO);
        return ResponseEntity.status(201).build();
    }

    @DeleteMapping(value = "/{id_collections}/products/{model}")
    public ResponseEntity<?> deleteProductFromCollection(@RequestHeader("Authorization") String authHeader,
                                                         @PathVariable("id_collections") Long collectionId,
                                                         @PathVariable("model") String modelOfProduct
    ){
        collectionService.deleteProductFromCollection(authHeader, collectionId, modelOfProduct);
        return ResponseEntity.status(204).build();
    }
}
