package project.backendmueblar.modules.interactions.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import project.backendmueblar.modules.catalog.entities.VariationEntity;
import project.backendmueblar.modules.users.entities.UserEntity;

import java.time.OffsetDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor

@Entity
@Table(name = "metrica_visualizacion")
public class VisualizationMetricsEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_metrica")
    private Long metricsId;

    @Column(name = "duracion_segundos", nullable = false)
    private Integer durationInSeconds;

    @Column(name = "dispositivo", nullable = false)
    private String device;

    @Column(name = "creado_at", nullable = false)
    private OffsetDateTime createdAt;

    @JoinColumn(name = "id_usuario", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    private UserEntity userEntity;

    @JoinColumn(name = "sku_variacion", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    private VariationEntity variationEntity;
}
