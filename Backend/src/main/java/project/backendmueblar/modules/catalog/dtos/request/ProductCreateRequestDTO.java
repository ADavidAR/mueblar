package project.backendmueblar.modules.catalog.dtos.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import project.backendmueblar.modules.catalog.dtos.response.CategoryResponseDTO;
import project.backendmueblar.modules.catalog.dtos.response.VariationResponseDTO;

import java.util.List;
import java.util.Map;

@Getter
@Setter
public class ProductCreateRequestDTO {
    @Valid
    @NotEmpty(message = "Al menos una (1) Categoria del Producto es obligatoria. No ha sido recibida ")
    private List<CategoryRequestDTO> categories;

    @NotBlank(message = "La Descripcion es obligatoria. No ha sido recibida")
    private String description;

    @NotEmpty(message = "Las Dimensiones del Producto son de caracter obligatorio. No ha sido recibido")
    private Map<String, Double> dimensions;

    @NotNull(message = "El parametro para determinar si el Producto esta habilitado o no es obligatorio. No ha sido recibida.")
    private Boolean enable;

    @NotBlank(message = "El Modelo del Producto es obligatorio. No ha sido recibida.")
    private String model;

    @Valid
    @NotEmpty(message = "Al menos (1) Variacion del Producto es obligatoria. No ha sido recibida. ")
    private List<VariationRequestDTO> variations;
}
