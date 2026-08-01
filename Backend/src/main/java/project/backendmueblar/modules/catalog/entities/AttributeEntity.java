package project.backendmueblar.modules.catalog.entities;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

@Entity
@Table(name = "atributo")
public class AttributeEntity {
    @Id
    @Column(name = "id_atributo")
    private String attributeId;

    @JoinColumn(name = "id_tipo_atributo", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    private AttributeTypeEntity attributeTypeEntity;

    @JsonIgnore
    @OneToMany(mappedBy = "attributeEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Attribute_X_ProductEntity> attributeXProductEntities;

    @JsonIgnore
    @OneToMany(mappedBy = "attributeEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Attribute_X_VariationEntity> attributeXVariationEntities;
}
