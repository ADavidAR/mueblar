package project.backendmueblar.modules.catalog.dtos.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import project.backendmueblar.modules.catalog.dtos.AttribTypeSummaryForCreatingDTO;

@Getter
@Setter

public class AttributeCreateRequestDTO {
    @Valid @NotNull
    private AttribTypeSummaryForCreatingDTO atribType;

    @NotBlank(message = "El Nombre del Atributo no ha sido recibido. Es un campo obligatorio.")
    private String name;
}
