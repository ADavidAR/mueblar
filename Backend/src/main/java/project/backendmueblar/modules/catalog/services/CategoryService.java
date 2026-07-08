package project.backendmueblar.modules.catalog.services;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import project.backendmueblar.exception.catalog.ResourceAlreadyExistsException;
import project.backendmueblar.exception.catalog.ResourceNotFoundException;
import project.backendmueblar.modules.catalog.dtos.request.CategoryCreateRequestDTO;
import project.backendmueblar.modules.catalog.dtos.request.CategoryRequestDTO;
import project.backendmueblar.modules.catalog.dtos.response.CategoryResponseDTO;
import project.backendmueblar.modules.catalog.entities.CategoryEntity;
import project.backendmueblar.modules.catalog.repositories.RepositoryCategory;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final RepositoryCategory repositoryCategory;

    public List<CategoryResponseDTO> getAllCategories() {
        List<CategoryEntity> optionalCategoryList =  repositoryCategory.findAll();
        if(optionalCategoryList.isEmpty()) {
            throw new ResourceNotFoundException("Category not found");
        }

        List<CategoryResponseDTO> categoryResponseDTOList = new ArrayList<>();
        for(CategoryEntity thisCategoryEntity : optionalCategoryList) {
            CategoryResponseDTO thisCategoryResponseDTO = new CategoryResponseDTO();
            thisCategoryResponseDTO.setId(thisCategoryEntity.getCategoryId());
            thisCategoryResponseDTO.setName(thisCategoryEntity.getCategoryName());
            categoryResponseDTOList.add(thisCategoryResponseDTO);
        }

        return categoryResponseDTOList;

    }

    // ------------------------------------------------------------------------------------------------------//

    public void createCategory(CategoryCreateRequestDTO categoryCreateRequestDTO) {
        Optional<CategoryEntity> optionalCategory = repositoryCategory.findByCategoryName(categoryCreateRequestDTO.getName());
        if(optionalCategory.isPresent()) {
            throw new ResourceAlreadyExistsException("Already exists another category with that name");
        }

        CategoryEntity categoryEntity = new CategoryEntity();
        categoryEntity.setCategoryName(categoryCreateRequestDTO.getName());
        categoryEntity = repositoryCategory.save(categoryEntity);

    }

    // ------------------------------------------------------------------------------------------------------//
}
