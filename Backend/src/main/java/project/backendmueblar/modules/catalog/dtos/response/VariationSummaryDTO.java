package project.backendmueblar.modules.catalog.dtos.response;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class VariationSummaryDTO {
//    @NotBlank(message = "El nombre de la Variacion es un campo obligatorio. No ha sido recibido.")
    private String name;

//    @NotNull(message = "El precio de la Variacion es un campo obligatorio. No ha sido recibido.")
    private Integer price;

//    @NotBlank(message = "El Sku de la Variacion es un campo obligatorio. No ha sido recibido.")
    private String sku;

//    @NotBlank(message = "La direccion de la Miniatura de la Variacion no ha sido recibida. Esto es un campo obligatorio.")
    private String thumbnail;
}
