package project.backendmueblar.modules.catalog.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import project.backendmueblar.modules.catalog.dtos.response.CategoryResponseDTO;
import project.backendmueblar.modules.catalog.services.CategoryService;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
class RestControllerCategories {
    private final CategoryService categoryService;

    @GetMapping()
    public ResponseEntity<?> getCategories () {
        List<CategoryResponseDTO> categoryResponseDTOList = categoryService.getAllCategories();
        return ResponseEntity.status(200).body(categoryResponseDTOList);
    }

}
