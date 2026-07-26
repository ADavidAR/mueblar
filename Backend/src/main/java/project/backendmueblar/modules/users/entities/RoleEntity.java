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
@Table(name = "rol")
public class RoleEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_rol")
    private Long roleId;

    @Column(name = "nombre_rol", nullable = false)
    private String roleName;

    @Column(name = "editable", nullable = false)
    private Boolean editable;

    @OneToMany(mappedBy = "roleEntity")
    private List<UserEntity> userEntity;

    @OneToMany(mappedBy = "roleEntity")
    private List<Permission_X_RoleEntity> permissionRoleEntities;

    @OneToMany(mappedBy = "roleEntity")
    private List<Module_X_RoleEntity> moduleXRoleEntityList;
}
