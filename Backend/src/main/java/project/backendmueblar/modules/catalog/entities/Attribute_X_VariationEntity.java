package project.backendmueblar.modules.catalog.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

@Entity
@Table(name = "variacion_x_atributo")
public class Attribute_X_VariationEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_variacion_atributo")
    private Long attributeVariationId;

    @Column(name = "valor_atributo", nullable = false)
    private String attributeValue;

    @JoinColumn(name = "id_variacion", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    private VariationEntity variationEntity;

    @JoinColumn(name = "id_atributo", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    private AttributeEntity attributeEntity;
}
