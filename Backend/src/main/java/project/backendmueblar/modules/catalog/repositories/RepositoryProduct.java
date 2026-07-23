package project.backendmueblar.modules.catalog.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import project.backendmueblar.modules.catalog.entities.ProductEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface RepositoryProduct extends JpaRepository<ProductEntity, String> {
    Optional<ProductEntity> findByModelName(String modelName);
    List<ProductEntity> findByModelNameContainingIgnoreCase(String search, Pageable pageable);
    List<ProductEntity> findByProductXCategoryEntityList_CategoryEntity_CategoryNameIn(List<String> categories, Pageable pageable);
    List<ProductEntity> findByVariationEntityList_AttributeXVariationEntities_AttributeEntity_AttributeIdIn(List<String> materials, Pageable pageable);

    List<ProductEntity> findByModelNameContainingIgnoreCaseAndProductXCategoryEntityList_CategoryEntity_CategoryNameIn(String search, List<String> categories, Pageable pageable);
    List<ProductEntity> findByProductXCategoryEntityList_CategoryEntity_CategoryNameInAndVariationEntityList_AttributeXVariationEntities_AttributeEntity_AttributeIdIn(List<String> categories, List<String> materials, Pageable pageable);
    List<ProductEntity> findByModelNameContainingIgnoreCaseAndVariationEntityList_AttributeXVariationEntities_AttributeEntity_AttributeIdIn(String search, List<String> materials, Pageable pageable);

    List<ProductEntity> findByModelNameContainingIgnoreCaseAndProductXCategoryEntityList_CategoryEntity_CategoryNameInAndVariationEntityList_AttributeXVariationEntities_AttributeEntity_AttributeIdIn(String search, List<String> categories, List<String> materials, Pageable pageable);
}
