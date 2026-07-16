package project.backendmueblar.modules.interactions.entities.idClass;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode
public class CollectionProductId implements Serializable {

    @Column(name = "id_producto")
    private String productId;

    @Column(name = "id_coleccion")
    private Long collectionId;
}