package project.backendmueblar.modules.catalog.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import project.backendmueblar.modules.catalog.dtos.request.CategoryCreateRequestDTO;
import project.backendmueblar.modules.catalog.dtos.response.CategoryResponseDTO;
import project.backendmueblar.modules.catalog.services.CategoryService;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class RestControllerCategories {
    private final CategoryService categoryService;

    @GetMapping()
    public ResponseEntity<?> getCategories () {
        List<CategoryResponseDTO> categoryResponseDTOList = categoryService.getAllCategories();
        return ResponseEntity.status(200).body(categoryResponseDTOList);
    }

    @PostMapping(consumes = "application/json")
    public ResponseEntity<?> createCategory(@RequestHeader("Authorization") String authHeader, @Valid @RequestBody CategoryCreateRequestDTO categoryCreateRequestDTO) {
        categoryService.createCategory(authHeader, categoryCreateRequestDTO);
        return ResponseEntity.status(201).build();
    }

    @PutMapping(value = "/{id_categoria}", consumes = "application/json")
    public ResponseEntity<?> updateCategory(@RequestHeader("Authorization") String authHeader, @PathVariable ("id_categoria") Long categoryID, @Valid @RequestBody CategoryCreateRequestDTO categoryCreateRequestDTO) {
        categoryService.updateCategory(authHeader, categoryID, categoryCreateRequestDTO);
        return ResponseEntity.status(200).build();
    }

    @DeleteMapping(value = "/{id_categoria}")
    public ResponseEntity<?> deleteCategory(@RequestHeader("Authorization") String authHeader, @PathVariable ("id_categoria") Long categoryID) {
        categoryService.deleteCategory(authHeader, categoryID);
        return ResponseEntity.status(204).build();
    }
}
