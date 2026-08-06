package project.backendmueblar.modules.users.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class RoleSummaryRequestDTO {
    @NotNull(message = "El ID del Rol no puede ser Nulo. Esto es un valor obligatorio.")
    private Long id;

    private String name;
}
