package project.backendmueblar.modules.catalog.dtos.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class CategoryCreateRequestDTO {
    @NotBlank(message = "El Nombre de la Categoria es obligatorio. No ha sido recibido")
    private String name;
}
