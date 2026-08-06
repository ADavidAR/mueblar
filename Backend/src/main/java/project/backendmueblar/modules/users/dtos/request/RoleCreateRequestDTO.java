package project.backendmueblar.modules.users.dtos.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter

public class RoleCreateRequestDTO {
    @NotNull(message = "Se debe especificar si el Rol es Editable o No. Esto es un campo obligatorio.")
    private Boolean editable;

    @NotBlank(message = "El nombre del Rol es un campo obligatorio. No ha sido proporcionado.")
    private String name;

    @Valid @NotEmpty
    private List<PermissionCreateRequestDTO> permissions;
}
