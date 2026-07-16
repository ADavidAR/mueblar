package project.backendmueblar.modules.catalog.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import project.backendmueblar.modules.interactions.entities.Collection_X_ProductEntity;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

@Entity
@Table(name = "producto")
public class ProductEntity {
    @Id
    @Column(name = "nombre_modelo")
    private String modelName;

    @Column(name = "descripcion", nullable = false)
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "dimensiones", columnDefinition = "jsonb", nullable = false)
    private Map<String, Double> dimensions;

    @Column(name = "habilitado", nullable = false)
    private Boolean enabled;

    @OneToMany(mappedBy = "productEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VariationEntity> variationEntityList;

    @OneToMany(mappedBy = "productEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Product_X_CategoryEntity> productXCategoryEntityList;

    @OneToMany(mappedBy = "productEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Collection_X_ProductEntity> collectionXProductEntityList;

    @OneToMany(mappedBy = "productEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Attribute_X_ProductEntity> attributeXProductEntities;
}
