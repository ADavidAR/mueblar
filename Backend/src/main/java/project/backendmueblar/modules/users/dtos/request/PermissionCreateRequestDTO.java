package project.backendmueblar.modules.users.dtos.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PermissionCreateRequestDTO {
    @NotNull(message = "Se debe indicar si el Rol tiene 'Acceso'. Esto es un campo obligatorio.")
    private Boolean access;

    @NotNull(message = "Se debe indicar si el Rol tiene 'Creacion'. Esto es un campo obligatorio.")
    private Boolean create;

    @NotNull(message = "Se debe indicar si el Rol tiene 'Eliminacion'. Esto es un campo obligatorio.")
    private Boolean delete;

    @NotNull(message = "Se debe indicar si el Rol tiene 'Modificacion'. Esto es un campo obligatorio.")
    private Boolean modify;

    @NotNull(message = "Se debe indicar el Id del Modulo en la Creacion del Rol. Esto es un campo obligatorio.")
    private Long id;
}
