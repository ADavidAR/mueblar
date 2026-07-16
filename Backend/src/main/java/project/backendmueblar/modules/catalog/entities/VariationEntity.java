package project.backendmueblar.modules.catalog.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import project.backendmueblar.modules.interactions.entities.VisualizationMetricsEntity;

import java.util.List;
import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

@Entity
@Table(name = "variacion")
public class VariationEntity {
    @Id
    @Column(name = "sku")
    private String sku;

    @Column(name = "nombre_variacion", nullable = false)
    private String variationName;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "parametros_instanciacion", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> instationParameters;

    @Column(name = "ruta_modelo_3d", nullable = false)
    private String model3dPath;

    @Column(name = "precio",  nullable = false)
    private Integer price;

    @Column(name = "top_", nullable = false)
    private Boolean isTop;

    @Column(name = "habilitado",  nullable = false)
    private Boolean enabled;

    @JoinColumn(name = "id_producto", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    private ProductEntity productEntity;

    @OneToMany(mappedBy = "variationEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ThumbnailEntity> thumbnailEntities;

    @OneToMany(mappedBy = "variationEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Attribute_X_VariationEntity> attributeXVariationEntities;

    @OneToMany(mappedBy = "variationEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VisualizationMetricsEntity> visualizationMetricsEntities;
}
