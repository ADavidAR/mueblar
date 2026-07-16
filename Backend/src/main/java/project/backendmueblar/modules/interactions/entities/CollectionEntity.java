package project.backendmueblar.modules.interactions.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import project.backendmueblar.modules.users.entities.UserEntity;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

@Entity
@Table(name = "coleccion")
public class CollectionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_coleccion")
    private Long collectionId;

    @Column(name = "titulo_coleccion", nullable = false)
    private String title;

    @Column(name = "borrable", nullable = false)
    private Boolean erasable;

    @JoinColumn(name = "id_usuario", nullable = false)
    @ManyToOne(fetch = FetchType.LAZY)
    private UserEntity userEntity;

    @OneToMany(mappedBy = "collectionEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Collection_X_ProductEntity> collectionXProductEntityList;
}
