package project.backendmueblar.modules.catalog.dtos.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter

public class AttributeCreateRequestDTO {
    @NotBlank(message = "El Nombre del Atributo no ha sido recibido. Es un campo obligatorio.")
    private String name;

    @NotBlank(message = "El Tipo de Atributo no fue proporcionado. Es un campo obligatorio.")
    private String type;
}
