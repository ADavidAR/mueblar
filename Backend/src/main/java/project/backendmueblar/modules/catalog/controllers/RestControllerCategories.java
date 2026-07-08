package project.backendmueblar.modules.catalog.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.backendmueblar.modules.catalog.dtos.request.CategoryCreateRequestDTO;
import project.backendmueblar.modules.catalog.dtos.request.CategoryRequestDTO;
import project.backendmueblar.modules.catalog.dtos.response.CategoryResponseDTO;
import project.backendmueblar.modules.catalog.services.CatalogService;
import project.backendmueblar.modules.catalog.services.CategoryService;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
class RestControllerCategories {
    private final CategoryService categoryService;
    private final CatalogService catalogService;

    @GetMapping()
    public ResponseEntity<?> getCategories () {
        List<CategoryResponseDTO> categoryResponseDTOList = categoryService.getAllCategories();
        return ResponseEntity.status(200).body(categoryResponseDTOList);
    }

    @PostMapping(consumes = "application/json")
    public ResponseEntity<?> createCategory(@Valid @RequestBody CategoryCreateRequestDTO categoryCreateRequestDTO) {
        categoryService.createCategory(categoryCreateRequestDTO);
        return ResponseEntity.status(201).build();
    }

    @PutMapping(value = "/{id_categoria}", consumes = "application/json")
    public ResponseEntity<?> updateCategory(@PathVariable ("id_categoria") Long categoryID, @Valid @RequestBody CategoryCreateRequestDTO categoryCreateRequestDTO) {
        categoryService.updateCategory(categoryID, categoryCreateRequestDTO);
        return ResponseEntity.status(200).build();
    }
}
