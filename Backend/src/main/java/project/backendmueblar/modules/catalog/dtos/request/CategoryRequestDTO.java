package project.backendmueblar.modules.catalog.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryRequestDTO {
    @NotNull(message = "El ID de la Categoria es obligatorio. No ha sido recibido")
    private Long id;

    @NotBlank(message = "El Nombre de la Categoria es obligatorio. No ha sido recibido")
    private String name;
}
