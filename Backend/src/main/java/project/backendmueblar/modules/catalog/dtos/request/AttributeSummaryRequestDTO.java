package project.backendmueblar.modules.catalog.dtos.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AttributeSummaryRequestDTO {
    @NotBlank(message = "El Nombre del Atributo es un campo obligatorio. No ha sido recibido.")
    private String id;

    @NotBlank(message = "El Valor del Atributo es un campo obligatorio. No ha sido recibido.")
    private String value;
}
