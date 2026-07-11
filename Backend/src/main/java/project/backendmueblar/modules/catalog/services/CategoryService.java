package project.backendmueblar.modules.catalog.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import project.backendmueblar.exception.catalog.ResourceAlreadyExistsException;
import project.backendmueblar.exception.catalog.ResourceNotFoundException;
import project.backendmueblar.modules.catalog.dtos.request.CategoryCreateRequestDTO;
import project.backendmueblar.modules.catalog.dtos.request.CategoryRequestDTO;
import project.backendmueblar.modules.catalog.dtos.response.CategoryResponseDTO;
import project.backendmueblar.modules.catalog.entities.CategoryEntity;
import project.backendmueblar.modules.catalog.entities.Product_X_CategoryEntity;
import project.backendmueblar.modules.catalog.repositories.RepositoryCategory;

import java.util.*;

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

    @Transactional
    public void createCategory(CategoryCreateRequestDTO categoryCreateRequestDTO) {
        Optional<CategoryEntity> optionalCategory = repositoryCategory.findByCategoryName(categoryCreateRequestDTO.getName());
        if(optionalCategory.isPresent()) {
            throw new ResourceAlreadyExistsException("Already exists another category with that name");
        }

        CategoryEntity categoryEntity = new CategoryEntity();
        categoryEntity.setCategoryName(categoryCreateRequestDTO.getName());
        repositoryCategory.save(categoryEntity);

    }

    // ------------------------------------------------------------------------------------------------------//
    @Transactional
    public void updateCategory(Long categoryID, CategoryCreateRequestDTO categoryUpdateRequestDTO) {
        Optional<CategoryEntity> optionalCategory = repositoryCategory.findByCategoryId(categoryID);
        if(optionalCategory.isEmpty()) {
            throw new ResourceNotFoundException("Category not found");
        }

        List<Product_X_CategoryEntity> thisProduct_X_CategoryEntity = optionalCategory.get().getProductCategories();
        if(!(thisProduct_X_CategoryEntity.isEmpty())) {
            List<String> products = new ArrayList<>();
            Map<String, List<String>> mapOfProducts = new HashMap<>();

            for(Product_X_CategoryEntity product_X_CategoryEntity : thisProduct_X_CategoryEntity) {
                products.add(product_X_CategoryEntity.getProductEntity().getModelName());
            }
            mapOfProducts.put("products", products);

            throw new ResourceAlreadyExistsException("The category cannot be deleted because there are products associated with it: " + mapOfProducts);
        }

        Optional<CategoryEntity> optionalCategoryEntity = repositoryCategory.findByCategoryName(categoryUpdateRequestDTO.getName());
        if(optionalCategoryEntity.isPresent()) {
            throw new ResourceAlreadyExistsException("Category already exists");
        }

        CategoryEntity categoryEntity = new CategoryEntity();
        categoryEntity.setCategoryName(categoryUpdateRequestDTO.getName());

        repositoryCategory.delete(optionalCategory.get());
        repositoryCategory.save(categoryEntity);

    }

    // ------------------------------------------------------------------------------------------------------//

    @Transactional
    public void deleteCategory(Long categoryID) {
        Optional<CategoryEntity> optionalCategory = repositoryCategory.findByCategoryId(categoryID);
        if(optionalCategory.isEmpty()) {
            throw new ResourceNotFoundException("Category not found");
        }

        List<Product_X_CategoryEntity> thisProduct_X_CategoryEntity = optionalCategory.get().getProductCategories();
        if(!(thisProduct_X_CategoryEntity.isEmpty())) {
            List<String> products = new ArrayList<>();
            Map<String, List<String>> mapOfProducts = new HashMap<>();

            for(Product_X_CategoryEntity product_X_CategoryEntity : thisProduct_X_CategoryEntity) {
                products.add(product_X_CategoryEntity.getProductEntity().getModelName());
            }
            mapOfProducts.put("products", products);

            throw new ResourceAlreadyExistsException("The category cannot be deleted because there are products associated with it: " + mapOfProducts);
        }

        repositoryCategory.delete(optionalCategory.get());

    }

    // ------------------------------------------------------------------------------------------------------//

}
