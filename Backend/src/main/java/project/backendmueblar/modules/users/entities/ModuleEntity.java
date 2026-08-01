package project.backendmueblar.modules.users.entities;

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
@Table(name = "modulo")
public class ModuleEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_modulo")
    private long moduleId;

    @Column(name = "descripcion", nullable = true)
    private String description;

    @JsonIgnore
    @OneToMany(mappedBy = "moduleEntity", fetch = FetchType.LAZY, orphanRemoval = true)
    private List<PermissionEntity> permissionEntityList;

    @JsonIgnore
    @OneToMany(mappedBy = "moduleEntity", fetch = FetchType.LAZY, orphanRemoval = true)
    private List<Module_X_RoleEntity> moduleXRoleEntityList;
}
