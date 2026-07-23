package project.backendmueblar.modules.users.entities.idClass;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.io.Serializable;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@EqualsAndHashCode

public class ModuleRoleId implements Serializable {
    @Column(name = "id_rol")
    private String roleId;

    @Column(name = "id_modulo")
    private String moduleId;
}