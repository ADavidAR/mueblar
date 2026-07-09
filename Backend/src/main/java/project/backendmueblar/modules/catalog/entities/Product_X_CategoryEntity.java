package project.backendmueblar.modules.catalog.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import project.backendmueblar.modules.catalog.entities.idClass.ProductCategoryId;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

@Entity
@Table(name = "producto_x_categoria")
public class Product_X_CategoryEntity {

    @EmbeddedId
    private ProductCategoryId id =  new ProductCategoryId();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", nullable = false)
    @MapsId("productId")
//    @OnDelete(action = OnDeleteAction.CASCADE)
    private ProductEntity productEntity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_categoria", nullable = false)
    @MapsId("categoryId")
//    @OnDelete(action = OnDeleteAction.CASCADE)
    private CategoryEntity categoryEntity;
}
