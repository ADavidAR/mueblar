package project.backendmueblar.modules.auth.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ResetPasswordDTO {
    @NotNull(message = "El ID del Usuario es de caraceter obligatorio")
    private Long id;

    @NotBlank(message = "El Token de Restablecimiento es de caraceter obligatorio")
    private String tokenReset;

    @Pattern(
            regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$",
            message = "La contraseña debe tener al menos 8 caracteres, incluir una mayúscula, una minúscula, un número y un carácter especial."
    )
    @NotBlank(message = "La contraseña es de caraceter obligatoria")
    private String password;
}
