package project.backendmueblar.modules.catalog.repositories;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import project.backendmueblar.modules.auth.entities.RecoveryTokenEntity;
import project.backendmueblar.modules.catalog.entities.ProductEntity;

import java.util.List;
import java.util.Optional;

@Repository
public interface RepositoryProduct extends JpaRepository<ProductEntity, String> {
    Optional<ProductEntity> findByModelName(String modelName);
    List<ProductEntity> findByModelNameContainingIgnoreCase(String search, Pageable pageable);
    List<ProductEntity> findByProductXCategoryEntityList_CategoryEntity_CategoryName(String category, Pageable pageable);
    List<ProductEntity> findByModelNameContainingIgnoreCaseAndProductXCategoryEntityList_CategoryEntity_CategoryName(String search, String category, Pageable pageable);

}
