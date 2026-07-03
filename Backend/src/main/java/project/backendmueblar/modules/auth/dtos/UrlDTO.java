package project.backendmueblar.modules.auth.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UrlDTO {
    @NotBlank(message = "La URL es obligatoria. No se recibio")
    private String url;
}
