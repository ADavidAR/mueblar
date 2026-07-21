package project.backendmueblar.modules.catalog.dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ProductSummaryDTO {
    @NotBlank(message = "Ningun modelo (nombre de producto) fue recibido. Este campo es obligatorio")
    private String model;

    private List<VariationSummaryDTO> variations;
}
