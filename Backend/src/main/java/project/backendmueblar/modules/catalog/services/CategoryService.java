package project.backendmueblar.modules.catalog.services;

import jakarta.persistence.Table;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import project.backendmueblar.exception.auth.UserIDNotMatchException;
import project.backendmueblar.exception.catalog.ResourceAlreadyExistsException;
import project.backendmueblar.exception.catalog.ResourceNotFoundException;
import project.backendmueblar.modules.auth.services.JwtService;
import project.backendmueblar.modules.catalog.dtos.request.CategoryCreateRequestDTO;
import project.backendmueblar.modules.catalog.dtos.request.CategoryRequestDTO;
import project.backendmueblar.modules.catalog.dtos.response.CategoryResponseDTO;
import project.backendmueblar.modules.catalog.entities.CategoryEntity;
import project.backendmueblar.modules.catalog.entities.Product_X_CategoryEntity;
import project.backendmueblar.modules.catalog.repositories.RepositoryCategory;
import project.backendmueblar.modules.logEntry.services.LogService;
import project.backendmueblar.modules.users.entities.UserEntity;
import project.backendmueblar.modules.users.repositories.RepositoryUser;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.ObjectMapper;

import java.util.*;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final RepositoryCategory repositoryCategory;

    private final JwtService jwtService;
    private final LogService logService;
    private final ObjectMapper objectMapper;
    private final RepositoryUser userRepository;

    private String tableNameFromEntity(Object entity){
        Class<?> entityClass = entity.getClass();
        Table tableAnnotation = entityClass.getAnnotation(Table.class);

        if (tableAnnotation != null && !tableAnnotation.name().isEmpty()) {
            return tableAnnotation.name();
        }
        return entityClass.getSimpleName().toLowerCase();
    }

    // ----------------------------------------------------------------------------------------------------------------------------------------//

    private Optional<UserEntity> existsUserWithToken(String authHeader) {
        String uniqueEmailForUser = jwtService.extractEmail(authHeader);
        Optional<UserEntity> optionalUser = userRepository.findByEmail(uniqueEmailForUser);
        if (optionalUser.isEmpty()) {
            throw new UserIDNotMatchException("User not Found");
        }
        return optionalUser;
    }

    // ----------------------------------------------------------------------------------------------------------------------------------------//


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
    public void createCategory(String authHeader, CategoryCreateRequestDTO categoryCreateRequestDTO) {
        UserEntity thisUserEntity =  existsUserWithToken(authHeader).get();

        Optional<CategoryEntity> optionalCategory = repositoryCategory.findByCategoryName(categoryCreateRequestDTO.getName());
        if(optionalCategory.isPresent()) {
            throw new ResourceAlreadyExistsException("Already exists another category with that name");
        }

        CategoryEntity categoryEntity = new CategoryEntity();
        categoryEntity.setCategoryName(categoryCreateRequestDTO.getName());
        repositoryCategory.save(categoryEntity);
        logService.logEntryDataBase(tableNameFromEntity(categoryEntity), thisUserEntity.getUserId(), objectMapper.convertValue(categoryEntity, new TypeReference<Map<String, Object>>() {}), null, 1);
    }

    // ------------------------------------------------------------------------------------------------------//
    @Transactional
    public void updateCategory(String authHeader, Long categoryID, CategoryCreateRequestDTO categoryUpdateRequestDTO) {
        UserEntity thisUserEntity =  existsUserWithToken(authHeader).get();

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
        logService.logEntryDataBase(tableNameFromEntity(categoryEntity), thisUserEntity.getUserId(), objectMapper.convertValue(categoryEntity, new TypeReference<Map<String, Object>>() {}), objectMapper.convertValue(optionalCategory.get(), new TypeReference<Map<String, Object>>() {}), 2);
    }

    // ------------------------------------------------------------------------------------------------------//

    @Transactional
    public void deleteCategory(String authHeader, Long categoryID) {
        UserEntity thisUserEntity =  existsUserWithToken(authHeader).get();

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
        logService.logEntryDataBase(tableNameFromEntity(optionalCategory.get()), thisUserEntity.getUserId(), null, objectMapper.convertValue(optionalCategory.get(), new TypeReference<Map<String, Object>>() {}), 3);
    }

    // ------------------------------------------------------------------------------------------------------//

}
