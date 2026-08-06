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

public class UserCreateRequestDTO {

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

    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$",
            message = "La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial."
    )
    @NotBlank(message = "La contraseña es obligatoria")
    private String password;

    @Valid
    private RoleSummaryRequestDTO role;
    
    private Boolean enabled;
}

