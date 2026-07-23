package project.backendmueblar.modules.users.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import project.backendmueblar.modules.users.entities.idClass.ModuleRoleId;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

@Entity
@Table(name = "modulo_x_rol")
public class Module_X_RoleEntity {
    @EmbeddedId
    private ModuleRoleId id = new ModuleRoleId();

    @ManyToOne
    @JoinColumn(name = "id_rol", nullable = false)
    @MapsId("roleId")
    private RoleEntity roleEntity;

    @ManyToOne
    @JoinColumn(name = "id_modulo", nullable = false)
    @MapsId("moduleId")
    private ModuleEntity moduleEntity;
}
