package project.backendmueblar.modules.catalog.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AttribTypeSummaryForCreatingDTO {
    @NotBlank(message = "El Valor/Nombre del Tipo de Atributo no fue recibido. Este es un valor obligatorio.")
    private String id;
}
