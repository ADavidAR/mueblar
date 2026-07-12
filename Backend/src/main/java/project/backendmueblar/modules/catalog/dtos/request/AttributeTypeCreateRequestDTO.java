package project.backendmueblar.modules.catalog.dtos.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AttributeTypeCreateRequestDTO {
    @NotBlank(message = "El Valor del Tipo de Atributo no ha sido recibido. Es un campo obligatorio")
    private String id;

    @NotBlank(message = "La Descripcion del Tipo de Atributo no ha sido recibido. Es un campo obligatorio ")
    private String description;
}
