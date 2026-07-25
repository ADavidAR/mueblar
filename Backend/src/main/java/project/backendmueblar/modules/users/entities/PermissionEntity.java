package project.backendmueblar.modules.users.entities;

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
@Table(name = "permiso")
public class PermissionEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_permiso")
    private Long permissionId;

    @Column(name = "endpoint_url", nullable = false)
    private String endpointUrl;

    @OneToMany(mappedBy = "permissionEntity", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Permission_X_RoleEntity> permissionEntities;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_modulo")
    private ModuleEntity moduleEntity;
}
