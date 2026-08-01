package project.backendmueblar.modules.auth.dtos;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;
import project.backendmueblar.modules.users.dtos.request.RoleSummaryRequestDTO;

@Getter
@Setter
public class UserUpdateRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    @Pattern(
            regexp = "^[a-zA-ZÀ-ÿ\\u00f1\\u00d1\\s]+$",
            message = "El nombre solo puede contener letras y espacios")
    private String name;

    @NotBlank(message = "El apellido es obligatorio")
    @Pattern(regexp = "^[a-zA-ZÀ-ÿ\\u00f1\\u00d1\\s]+$", message = "El nombre solo puede contener letras y espacios")
    private String lastName;

    @NotBlank(message = "El email es obligatorio")
    @Pattern(regexp = "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$", message = "El formato el email no es el apropiado/correcto")
    private String email;

    private String password;

    @Valid
    private RoleSummaryRequestDTO role;

    @NotNull(message = "No se determino si el Usuario esta habilitado o deshabilitado. Esto es un campo obligatorio.")
    private Boolean enabled;
}

