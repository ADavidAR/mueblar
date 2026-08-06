package project.backendmueblar.modules.catalog.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

@Entity
@Table(name = "miniatura")
public class ThumbnailEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_miniatura")
    private Long thumbnailId;

    @Column(name = "url", nullable = false)
    private String thumbnailPath;

    @Column(name = "top_", nullable = false)
    private Boolean isTop;

    @JoinColumn(name = "id_variacion", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    private VariationEntity variationEntity;
}
