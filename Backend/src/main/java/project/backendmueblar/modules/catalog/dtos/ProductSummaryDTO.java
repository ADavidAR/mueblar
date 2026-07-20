package project.backendmueblar.modules.catalog.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProductSummaryDTO {
    @NotBlank(message = "Ningun modelo (nombre) fue recibido. Este campo es obligatorio")
    private String model;
}
