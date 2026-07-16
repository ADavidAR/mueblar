package project.backendmueblar.modules.interactions.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import project.backendmueblar.modules.catalog.entities.ProductEntity;
import project.backendmueblar.modules.interactions.entities.idClass.CollectionProductId;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

@Entity
@Table(name = "producto_x_coleccion")
public class Collection_X_ProductEntity {
    @EmbeddedId
    private CollectionProductId id = new CollectionProductId();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_producto", nullable = false)
    @MapsId("productId")
    private ProductEntity productEntity;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_coleccion", nullable = false)
    @MapsId("collectionId")
    private CollectionEntity collectionEntity;
}
